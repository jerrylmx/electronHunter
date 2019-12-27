const SpawnService = require("../services/spawnManager");
const Charge = require("../models/game/charge");
const Globals = require("../services/globals");
const ProbeA = require("../models/game/probeA");
const ProbeB = require("../models/game/probeB");
const ProbeC = require("../models/game/probeC");


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
                let id = ++this.seq;
                let spawnLocation = SpawnService.getSpawnLocation();
                let cfg = {...spawnLocation, id: id};
                let charge = new Charge(cfg);
                Globals.entities[id] = charge;
            }
        }, 1000)
    }

    spawnProbe() {
        setInterval(() => {
            if (Globals.probeCount < 10) {
                console.log("Register bot");
                let id = ++this.seq;
                let spawnLocation = SpawnService.getSpawnLocation();
                let cfg = {...spawnLocation, id: id, name: id, isBot: true};
                let probe = EntityControlService.getRandomProbe(cfg);
                Globals.entities[id] = probe;
            }
        }, 1000)
    }

    static getRandomProbe(cfg) {
        let rand = Math.random() * 10;
        if (rand < 3) {
            return new ProbeA(cfg);
        } else if (rand < 7) {
            return new ProbeB(cfg);
        } else {
            return new ProbeC(cfg);
        }
    }

}
module.exports = EntityControlService;