function initalizeAgent(io) {
    io.sockets.on('connection', (controller) => {
        controller.on('updateTmp', (updateTmp) => {
            manage(updateTmp, io);
        });
        controller.on('updateLux', (updateLux) => {
            manage(updateLux, io);
        });
    });
    console.log("Agente ready....");
}

function manage(newData, io) {
    console.log("AGENTE escucha:", newData);
    switch (newData.type) {
        case 'tmp':
            if (newData.value > 32) {
                console.log("AGENTE enciende aire acondicionado");
                io.sockets.emit("acOn");
            } else if (newData.value < 24) {
                console.log("AGENTE apaga aire acondicionado");
                io.sockets.emit("acOff");
            }
            break;
        case 'lux':
            if (newData.value > 300) {
                console.log("AGENTE cierra la persiana");
                io.sockets.emit("closeWindow");
            } else if (newData.value < 200) {
                console.log("AGENTE abre la persiana");
                io.sockets.emit("openWindow");
            }
            break;
        default:
            console.log("Agente no tiene acciones configuradas para el sensor captado")
            break;
    }
}

module.exports = { initalizeAgent };