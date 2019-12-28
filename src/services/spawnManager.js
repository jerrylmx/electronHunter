class SpawnService {

    static getSpawnLocation() {
        return {x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500)};
    }

}
module.exports = SpawnService;