class SpawnService {

    static getSpawnLocation() {
        return {x: Math.floor(Math.random() * 5000), y: Math.floor(Math.random() * 5000)};
    }

}
module.exports = SpawnService;