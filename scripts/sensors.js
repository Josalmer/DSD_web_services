const socketio = require("socket.io");
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios').default;

const Agent = require('./agent');

const KELVINCELSIUS = 273.15;

class Sensors {
    apiKey = 'cbbc383debb17f6d819dc3c6aeaf1305';
    agent;
    interval;
    auto;
    io;
    database;

    constructor(httpServer, port) {
        this.auto = false;
        MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, (err, db) => {
            httpServer.listen(port);
            this.io = socketio(httpServer);
            var dataBase = db.db("domoticaDb");
    
            var logs = dataBase.collection("logs");
            if (!logs) { logs = dataBase.createCollection("logs"); }
    
            this.io.sockets.on('connection', (controller) => {
                controller.on('updateTmp', (updateTmp) => {
                    let newLog = {...updateTmp, timeStamp: Date.now()}
                    logs.insertOne(newLog, () => {
                        console.log("Almacenado en DB", newLog);
                    });
                    this.io.sockets.emit("updateTmp", updateTmp);
                });
                controller.on('updateLux', (updateLux) => {
                    let newLog = {...updateLux, timeStamp: Date.now()}
                    logs.insertOne(newLog, () => {
                        console.log("Almacenado en DB", newLog);
                    });
                    this.io.sockets.emit("updateLux", updateLux);
                });
                controller.on('auto', coords => {
                    this.auto = !this.auto;
                    if (this.auto) {
                        this.autoOn(coords);
                    } else {
                        this.autoOff();
                    }
                })
            });
            this.agent = new Agent(this.io); // Inicializa al agente
        });
        console.log("Sensores ready....");
    }

    async autoOn(coords) {
        this.io.sockets.emit("autoOn", {});
        await this.loadMeteo(coords);
        this.interval = setInterval(async () => {
            await this.loadMeteo(coords);
        }, 10000);
    }
    
    autoOff() {
        this.io.sockets.emit("autoOff", {});
        clearInterval(this.interval);
    }

    async loadMeteo(coords) {
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.long}&lang=es&appid=${this.apiKey}`;
        try {
            const response = await axios.get(url);
            let tmp = (response.data.main.temp - KELVINCELSIUS).toFixed(2);
            let weather = response.data.weather[0];
            let newValue = { type: 'tmp', value: tmp };
            this.io.sockets.emit('updateTmp', newValue);
            this.io.sockets.emit('weather', weather);
            this.agent.updateOutside(weather);
            this.agent.manage(newValue);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Sensors;