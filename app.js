var socketio = require("socket.io");
var MongoClient = require('mongodb').MongoClient;

const port = 8080;

const httpServer = require("./scripts/routes"); // Carga la ruta

MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, db) => {
    httpServer.listen(port);
    var io = socketio(httpServer);
    var dataBase = db.db("domoticaDb");

    var logs = dataBase.collection("logs");
    if (!logs) { logs = dataBase.createCollection("logs"); }

    io.sockets.on('connection', (controller) => {
        controller.on('updateTmp', (updateTmp) => {
            newLog = {...updateTmp, timeStamp: Date.now()}
            logs.insertOne(newLog, () => {
                console.log("Almacenado en DB", newLog);
            });
            io.sockets.emit("updateTmp", updateTmp);
        });
        controller.on('updateLux', (updateLux) => {
            newLog = {...updateLux, timeStamp: Date.now()}
            logs.insertOne(newLog, () => {
                console.log("Almacenado en DB", newLog);
            });
            io.sockets.emit("updateLux", updateLux);
        });
    });
});

console.log("Servidor inicializado escuchando en " + port);

