# Snug-URL

When the link is too long, there is SNUG-URL!

### File di configurazione
Modifica dei parametri globali di configurazione (url del server redis, porta di ascolto del server http ecc…) contenute nel file config.json<br />

>{ <br />
>   "host" : "localhost",                   // interface to listen to<br />
    "port" : 2688,                          // port to listen to<br />
    "domain" : "http://localhost:2688",     // base domain<br />
    "startLen" : 2,                         // base length for string generation<br />
    "tries" : 900,                          // minimum successive fail tries before<br />                                                              increasing length<br />
    "redis" : "localhost"                   // redis server address<br />
    "hashkey" : "snugurl.dbstore",          // redis / vert.x hash key<br />
}

### Configurazione e Avvio di docker
Dopo aver scaricato e installato l'immagine di redis.

Avviare Redis sul docker container in ascolto sulla porta 6379:<br />
`docker run -d --name redis -p 6379:6379 redis`

Visualizzare l’ID del container appena avviato con il seguente comando:<br />
`docker ps`

Avviare la shell Redis inserendo l’ID del container letto in precedenza:<br />
`docker exec -it <id_container_avviato> redis-cli`

### Avvio dell’applicazione
Per avviare l’applicazione, effettuare un “build” da shell del file jar con tutte le sue dipendenze:<br />
`mvn clean package`<br />
`mvn vertx:fatJar`<br />
`java -jar target/snugurl-1.0-fat.jar -conf config.json`

## Usage
Go to web browser and digit http://localhost:2688. The http server is listening on this port but you can change it in the config.json file. Then insert the long URL and click the button: the system will get you the short URL.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

