const Globals = require("../services/globals")
class SpawnService {

    static getSpawnLocation() {
        return {x: 300, y: 300};
        // return {x: Math.floor(Math.random() * Globals.W), y: Math.floor(Math.random() * Globals.W)};
    }

}
module.exports = SpawnService;