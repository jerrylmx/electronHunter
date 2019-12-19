class SpawnService {

    static getSpawnLocation() {
        return {x: Math.floor(Math.random() * 1000), y: Math.floor(Math.random() * 1000)};
    }

}
module.exports = SpawnService;