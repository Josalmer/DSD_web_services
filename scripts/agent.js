class Agent {
    sockets;

    constructor(io) {
        this.sockets = io.sockets;
        this.sockets.on('connection', (controller) => {
            controller.on('updateTmp', (updateTmp) => {
                this.manage(updateTmp);
            });
            controller.on('updateLux', (updateLux) => {
                this.manage(updateLux);
            });
        });
        console.log("Agente ready....");
    }
    
    manage(newData) {
        console.log("AGENTE escucha:", newData);
        switch (newData.type) {
            case 'tmp':
                if (newData.value > 32) {
                    console.log("AGENTE enciende aire acondicionado");
                    this.sockets.emit("acOn");
                } else if (newData.value < 24) {
                    console.log("AGENTE apaga aire acondicionado");
                    this.sockets.emit("acOff");
                }
                break;
            case 'lux':
                if (newData.value > 300) {
                    console.log("AGENTE cierra la persiana");
                    this.sockets.emit("closeWindow");
                } else if (newData.value < 200) {
                    console.log("AGENTE abre la persiana");
                    this.sockets.emit("openWindow");
                }
                break;
            default:
                console.log("Agente no tiene acciones configuradas para el sensor captado")
                break;
        }
    }
}



module.exports = Agent;