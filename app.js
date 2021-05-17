var socketio = require("socket.io");
var MongoClient = require('mongodb').MongoClient;

const port = 8080;

const httpServer = require("./scripts/routes"); // Carga la ruta

MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, db) => {
    httpServer.listen(port);
    var io = socketio(httpServer);
    var dataBase = db.db("domoticaDb");

    var logs = dataBase.collection("logs");
    if (!logs) {
        logs = dataBase.createCollection("logs");
    }
    io.sockets.on('connection', (client) => {
        client.emit('my-address', { host: client.request.connection.remoteAddress, port: client.request.connection.remotePort });
        client.on('poner', function (data) {
            logs.insertOne(data, { safe: true }, function (err, result) { });
        });
        client.on('obtener', function (data) {
            logs.find(data).toArray(function (err, results) {
                client.emit('obtener', results);
            });
        });
    });
});

console.log("Servidor inicializado escuchando en " + port);

