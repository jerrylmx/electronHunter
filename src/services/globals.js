const Matter = require("matter-js");
const Bodies = Matter.Bodies;
const World = Matter.World;

class Globals {
    static packFrameData() {
        return {
            entities: Globals.entities
        }
    }
}
Globals.engine = Matter.Engine.create();
Globals.engine.world.gravity = { x: 0, y: 0, scale: 0.5 };
Matter.Events.on(Globals.engine, "collisionStart", ({ pairs }) => {
    pairs.forEach(({ bodyA, bodyB }) => {
        let modelA = Globals.entities[bodyA.label];
        let modelB = Globals.entities[bodyB.label];
        if (modelA && modelB) {
            modelA.onCollision && modelA.onCollision(modelB);
            modelB.onCollision && modelB.onCollision(modelA);
        }
    });
});

Globals.SERVER_RATE = 25;
Globals.entities = {};


module.exports = Globals;