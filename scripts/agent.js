// Codigos de ID de la API de openweathermap.org
// 800 -> clear sky
// 801 -> few clouds: 11-25%
// 802 -> scattered clouds: 25-50%
// Resto de códigos es oscuro para persiana
const CLEARCODES = [800, 801, 802];

class Agent {
    sockets;
    acStatus;
    luxStatus;
    lampStatus;
    outsideLight = true;

    constructor(io) {
        this.sockets = io.sockets;
        this.acStatus = false;
        this.luxStatus = false;
        this.lampStatus = false;
        this.initalizeCommunications();
        console.log("Agente ready....");
    }
    
    initalizeCommunications() {
        this.sockets.on('connection', (controller) => {
            controller.on('updateTmp', (updateTmp) => {
                this.manage(updateTmp);
            });
            controller.on('updateLux', (updateLux) => {
                this.manage(updateLux);
            });
            controller.on('clientAction', (changes) => {
                console.log("Agente escucha al cliente cambiar el estado de", changes.toggled);
                let action;
                if (changes.toggled === 'ac') {
                    this.acStatus = !this.acStatus;
                    action = this.acStatus ? "acOn" : "acOff";
                } else if (changes.toggled === 'lux') {
                    this.luxStatus = !this.luxStatus;
                    action = this.luxStatus ? "openWindow" : "closeWindow";
                } else if (changes.toggled === 'lamp') {
                    this.lampStatus = !this.lampStatus;
                    action = this.lampStatus ? "lampOn" : "lampOff";
                }
                this.sockets.emit(action);
            });
        });
    }

    manage(newData) {
        console.log("AGENTE escucha:", newData);
        switch (newData.type) {
            case 'tmp':
                if (newData.value > 32 && !this.acStatus) {
                    console.log("AGENTE enciende aire acondicionado");
                    this.acStatus = true;
                    this.sockets.emit("acOn");
                } else if (newData.value < 27 && this.acStatus) {
                    console.log("AGENTE apaga aire acondicionado");
                    this.acStatus = false;
                    this.sockets.emit("acOff");
                }
                break;
            case 'lux':
                if (this.outsideLight) {
                    if (newData.value > 300 && this.luxStatus) {
                        console.log("AGENTE cierra la persiana");
                        this.luxStatus = false;
                        this.sockets.emit("closeWindow");
                    } else if (newData.value < 200 && !this.luxStatus) {
                        console.log("AGENTE abre la persiana");
                        this.luxStatus = true;
                        this.sockets.emit("openWindow");
                    }
                } else {
                    if (newData.value > 300 && this.lampStatus) {
                        console.log("AGENTE apaga lampara");
                        this.lampStatus = false;
                        this.sockets.emit("lampOn");
                    } else if (newData.value < 200 && !this.lampStatus) {
                        console.log("AGENTE enciende lampara");
                        this.lampStatus = true;
                        this.sockets.emit("lampOff");
                    }
                }
                break;
            default:
                console.log("Agente no tiene acciones configuradas para el sensor captado")
                break;
        }
    }

    updateOutside(weather) {
        let now = new Date();
        let hours = now.getHours();
        this.outsideLight = CLEARCODES.includes(weather.id) && hours < 20 && hours > 8;
        console.log("outsideLight", this.outsideLight);
    }
}

module.exports = Agent;