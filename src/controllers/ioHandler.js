var SpawnService = require("../services/spawnManager");
var Probe = require("../models/game/probe");
var Globals = require("../services/globals");


class IOHandler {
    static gameJoin(data) {
        let spawnLocation = SpawnService.getSpawnLocation();
        let cfg = {...spawnLocation, ...data};
        let probe = new Probe(cfg);
        Globals.entities[data.id] = probe;
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
        let bullet = null;
        if (target) {
            bullet = target.fire();
        }
        if (bullet) Globals.entities[bullet.id] = bullet;
    }

    static log(handler, payload=[]) {
        console.log(`IOHandler - ${handler} ${payload}`);
    }

}
module.exports = IOHandler;