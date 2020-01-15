var SpawnService = require("../services/spawnManager");
var ProbeA = require("../models/game/probeA");
var ProbeB = require("../models/game/probeB");
var Globals = require("../services/globals");
var EntityControlService = require("../services/entityControlService");

class IOHandler {
    static gameJoin(data) {
        let spawnLocation = SpawnService.getSpawnLocation();
        let cfg = {...spawnLocation, ...data};
        let probe = EntityControlService.getRandomProbe(cfg);
        Globals.entities[data.id] = probe;
        Globals.probeCount++;
        IOHandler.log("gameJoin", Object.values(cfg));
    }

    static gameUnregister(data) {
        let target = Globals.entities[data.id];
        target && target.destroy();
    }

    static gameMove(data) {
        let target = Globals.entities[data.id];
        target && target.move(data.direction);
    }

    static gameFire(data) {
        let target = Globals.entities[data.id];
        target && target.fire();
    }

    static gameShield(data) {
        let target = Globals.entities[data.id];
        target && target.shield()
    }

    static log(handler, payload=[]) {
        console.log(`IOHandler - ${handler} ${payload}`);
    }

}
module.exports = IOHandler;