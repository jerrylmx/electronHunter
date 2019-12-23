class SpawnService {

    static getSpawnLocation() {
        return {x: Math.floor(Math.random() * 10000), y: Math.floor(Math.random() * 10000)};
    }

}
module.exports = SpawnService;