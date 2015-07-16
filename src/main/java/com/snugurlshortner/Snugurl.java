package com.snugurlshortner;

import com.snugurlshortner.utils.RandomStringGenerator;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Verticle;
import redis.clients.jedis.Jedis;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.Random;

public class Snugurl extends Verticle {
    Logger log;
    Random rand;
    Map<String, String> store;
    String domain;
    Jedis jedis;

    int length;
    int tries;
    String hashkey;
    
    boolean isValidURL(String str) {
        try {
            URL url = new URL(str);
            return true;
        } catch (MalformedURLException e) {
            return false;
        }
    }

    String getShortUrl() {
        String longurl;
        String shortUrl;
        int count = 1;
        do {
            if (count % tries == 0) {
                length++;
            }

            shortUrl = RandomStringGenerator.generateRandomString(length, RandomStringGenerator.Mode.ALPHANUMERIC);

            if (jedis != null) {
                try {
                    longurl = jedis.hget(hashkey, shortUrl);
                } catch (Exception ex) {
                    log.warn(ex.getMessage());
                    return null;
                }
            } else {
                longurl = store.get(shortUrl);
            }
            if (longurl == null) {
                return shortUrl;
            }
            count++;
        } while (length < 10);
        return null;
    }

    @Override
    public void start() {
        log = container.logger();
        log.info("Snugurl is alive");

        rand = new Random();
        rand.setSeed(System.currentTimeMillis());

        length = container.config().getInteger("startLen", 2);
        tries = container.config().getInteger("tries", 900);
        domain = container.config().getString("domain", "http://localhost:2688");
        hashkey = container.config().getString("hashkey", "snugurl.dbstore");

        String redis = container.config().getString("redis");
        if (redis != null) {
            log.info("Contacting redis server at " + redis);
            jedis = new Jedis(redis);
        } else {
            log.info("Using sharedMap (no persistence!)");
            store = vertx.sharedData().getMap(hashkey);
        }

        vertx.eventBus().registerHandler("snugurl.get", new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> message) {
                String shorturl = message.body().getString("url");
                JsonObject result = new JsonObject();

                log.info("Snugurl get " + shorturl);

                String longurl = null;
                if (jedis != null) {
                    try {
                        longurl = jedis.hget(hashkey, shorturl);
                    } catch (Exception ex) {
                        log.warn(ex.getMessage());
                    }
                } else {
                    longurl = store.get(shorturl);
                }

                if (longurl == null) {
                    result.putNumber("status", 404);
                    result.putString("message", "Page not found");
                } else {
                    result.putNumber("status", 200);
                    result.putString("value", longurl);
                }
                message.reply(result);
            }
        });

        vertx.eventBus().registerHandler("snugurl.set", new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> message) {
                String longurl = message.body().getString("url");
                JsonObject result = new JsonObject();

                if (!isValidURL(longurl)) {
                    result.putNumber("status", 500);
                    result.putString("message", "Invalid url");
                } else {
                    log.info("Snugurl set " + longurl);

                    String shorturl = getShortUrl();
                    if(shorturl == null){
                        result.putNumber("status", 500);
                        result.putString("message", "Unable to get a short url");
                    } else {

                        if (jedis != null) {
                            try {
                                jedis.hset(hashkey, shorturl, longurl);
                                result.putNumber("status", 200);
                                result.putString("value", domain + "/" + shorturl);
                            } catch (Exception ex) {
                                log.warn(ex.getMessage());
                                result.putNumber("status", 500);
                                result.putString("message",  "Unable to save short url");
                            }
                        } else {
                            store.put(shorturl, longurl);
                            result.putNumber("status", 200);
                            result.putString("value", domain + "/" + shorturl);
                        }
                    }
                }
                message.reply(result);
            }
        });

    }
}