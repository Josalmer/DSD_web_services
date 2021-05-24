const { initalizeAgent } = require('./scripts/agent');
const { initializeSensores } = require('./scripts/sensores');

const port = 8080;

const httpServer = require("./scripts/routes"); // Carga la ruta
initializeSensores(httpServer, port); // Inicializa sensores
initalizeAgent(); // Inicializa al agente

console.log("Servidor inicializado escuchando en " + port);

