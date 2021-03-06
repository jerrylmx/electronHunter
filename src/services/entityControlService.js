const SpawnService = require("../services/spawnManager");
const Charge = require("../models/game/charge");
const Globals = require("../services/globals");
const ProbeA = require("../models/game/probeA");
const ProbeB = require("../models/game/probeB");
const ProbeC = require("../models/game/probeC");
const ProbeD = require("../models/game/probeD");
const ProbeE = require("../models/game/probeE");

class EntityControlService {

    constructor() {
        this.running = false;
        this.seq = 0;
    }

    start() {
        this.running = true;
        this.spawnCharge();
        this.spawnProbe();
    }

    stop() {
        this.running = false;
    }

    spawnCharge() {
        setInterval(() => {
            if (Object.keys(Globals.entities).length < 100) {
                this.seq++;
                let spawnLocation = SpawnService.getSpawnLocation();
                EntityControlService.spawnChargeAt(spawnLocation, this.seq);
            }
        }, 1000);
    }

    static spawnChargeAt(spawnLocation, id) {
        let cfg = {...spawnLocation, id: id};
        Globals.entities[id] = new Charge(cfg);
    }

    spawnProbe() {
        let EMOJI = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😌','😛','😜','😝','🤤','😒'];
        setInterval(() => {
            if (Globals.probeEntities.length < 40) {
                console.log("Register bot");
                let id = ++this.seq;
                let spawnLocation = SpawnService.getSpawnLocation();
                let cfg = {...spawnLocation,
                           id: id,
                           name: "I'M BOT #" + id + EMOJI[Math.floor(Math.random() * EMOJI.length)],
                           isBot: true
                };
                Globals.entities[id] = EntityControlService.getRandomProbe(cfg);
            }
        }, 1000)
    }

    static getRandomProbe(cfg) {
        switch (cfg.name.toUpperCase()) {
            case "A":
                return new ProbeA(cfg);
            case "B":
                return new ProbeB(cfg);
            case "C":
                return new ProbeC(cfg);
            case "D":
                return new ProbeD(cfg);
            case "E":
                return new ProbeE(cfg);
            default:
                break;
        }
        cfg = {...cfg, color: Globals.getRandomColor()};
        let rand = Math.random() * 10;
        if (rand < 2) {
            return new ProbeA(cfg);
        } else if (rand < 4) {
            return new ProbeB(cfg);
        } else if (rand < 6) {
            return new ProbeC(cfg);
        } else if (rand < 8){
            return new ProbeD(cfg);
        } else {
            return new ProbeE(cfg);
        }
    }

}
module.exports = EntityControlService;