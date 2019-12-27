const Matter = require("matter-js");
const Bodies = Matter.Bodies;
const World = Matter.World;
const SERVER_RATE_DEFAULT = 40;
class Globals {
    static packFrameData(id) {
        if (!Globals.entities[id]) {
            return {
                ranking: Globals.getTop5(),
                rate: process.env.SERVER_RATE || SERVER_RATE_DEFAULT,
                entities: Globals.entities
            }
        }
        let frame = {
            ranking: Globals.getTop5(),
            rate: process.env.SERVER_RATE || SERVER_RATE_DEFAULT,
            entities: {}
        }
        let center = {x: Globals.entities[id].x, y: Globals.entities[id].y};
        Object.keys(Globals.entities).forEach((key) => {
            let target = Globals.entities[key];
            if (target && target.x && target.y)  {
                let dist = Globals.dist(center, target);
                if (dist < 500) {
                    frame.entities[key] = target;
                }
            }
        });

        return frame;
    }

    static dist(a, b) {
        return Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2));
    }
    static getTop5() {
        return Globals.probeEntities.sort((a, b) => {
            let n = b.kills - a.kills;
            if (n !== 0) {
                return n;
            }
            return a.id - b.id;
        });
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

Globals.SERVER_RATE = process.env.SERVER_RATE || SERVER_RATE_DEFAULT;
Globals.entities = {};
Globals.probeCount = 0;
Globals.probeEntities = [];
Globals.ranking = [];


module.exports = Globals;