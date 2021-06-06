const Sensors = require('./scripts/sensors');

const port = 8080;

const httpServer = require("./scripts/routes"); // Carga la ruta
new Sensors(httpServer, port); // Inicializa sensores

console.log("Servidor inicializado escuchando en " + port);
