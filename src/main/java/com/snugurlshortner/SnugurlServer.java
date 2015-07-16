package com.snugurlshortner;

import com.jetdrone.vertx.yoke.Yoke;
import com.jetdrone.vertx.yoke.middleware.*;
import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.AsyncResultHandler;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Verticle;

public class SnugurlServer extends Verticle {
    Logger log;

    @Override
    public void start() {
        log = container.logger();
        log.info("Snugurl Server is alive");
        container.deployVerticle("com.snugurlshortner.Snugurl", container.config(), 8, new AsyncResultHandler<String>() {
            public void handle(AsyncResult<String> asyncResult) {
                if (asyncResult.succeeded()) {
                    log.debug("The verticle SnugurlServer has been deployed, deployment ID is " + asyncResult.result());
                    startHttpServer();
                } else {
                    asyncResult.cause().printStackTrace();
                }
            }
        });
    }

    void startHttpServer() {
        HttpServer server = vertx.createHttpServer();
        Yoke yoke = new Yoke(vertx);
        Router router = new Router();

        router.get("/", new Handler<YokeRequest>() {
            @Override
            public void handle(final YokeRequest request) {
                request.response().sendFile("static/index.html");
            }
        });

        router.get("/:url", new Handler<YokeRequest>() {
            @Override
            public void handle(final YokeRequest request) {
                vertx.eventBus().send(
                    "snugurl.get",
                    new JsonObject().putString("url", request.getParameter("url")),
                    new Handler<Message<JsonObject>>() {
                        @Override
                        public void handle(Message<JsonObject> message) {
                            log.info(message.body().getNumber("status"));
                            if (message.body().getNumber("status").intValue() == 200) {
                                request.response().setStatusCode(307);
                                request.response().putHeader("Location", message.body().getString("value"));
                                request.response().end();
                            } else {
                                request.response().setStatusCode(307);
                                request.response().putHeader("Location", "/");
                                request.response().end();
                            }
                        }
                    }
                );
            }
        });

        router.post("/", new Handler<YokeRequest>() {
            @Override
            public void handle(final YokeRequest request) {
                    // GENERATE SHORT URL
                    vertx.eventBus().send(
                        "snugurl.set",
                        new JsonObject().putString("url", request.getFormParameter("url")),
                        new Handler<Message<JsonObject>>() {
                            @Override
                            public void handle(Message<JsonObject> message) {
                                request.response().end(message.body().toString());
                            }
                        }
                    );
                }
        });

        yoke.use(new Favicon("static/favicon.ico"));
        yoke.use("/static", new Static("static"));
        yoke.use(new BodyParser());
        yoke.use(router);
        yoke.listen(server);

        // Extend eventbus to javascript webclient
        JsonObject sockJSConfig = new JsonObject().putString("prefix", "/eventbus");
        JsonArray inWhitelist = new JsonArray();
        inWhitelist.add(new JsonObject().putString("address", "snugurl.get"));
        inWhitelist.add(new JsonObject().putString("address", "snugurl.set"));
        JsonArray outWhitelist = new JsonArray();
        vertx.createSockJSServer(server).bridge(sockJSConfig, inWhitelist, outWhitelist);

        final int port = container.config().getNumber("port", 2688).intValue();
        final String host = container.config().getString("host", "localhost");
        server.listen(port, host, new AsyncResultHandler<HttpServer>() {
            @Override
            public void handle(AsyncResult<HttpServer> httpServerAsyncResult) {
                log.info("HTTP Server listening on port " + port);
            }
        });
    }
}