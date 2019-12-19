const SpawnService = require("../services/spawnManager");
const Charge = require("../models/game/charge");
const Globals = require("../services/globals");

class EntityControlService {


    constructor() {
        this.running = false;
        this.seq = 0;
    }

    start() {
        this.running = true;
        this.spawnCharge();
    }

    stop() {
        this.running = false;
    }

    spawnCharge() {
        setInterval(() => {
            let id = ++this.seq;
            let spawnLocation = SpawnService.getSpawnLocation();
            let cfg = {...spawnLocation, id: id};
            let charge = new Charge(cfg);
            Globals.entities[id] = charge;
        }, 1000)
    }

}
module.exports = EntityControlService;