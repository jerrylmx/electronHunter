const Matter = require("matter-js");
const Bodies = Matter.Bodies;
const World = Matter.World;
const MatterAttractors = require("../../node_modules/matter-attractors/build/matter-attractors");
Matter.use(MatterAttractors);
// MatterAttractors.Attractors.gravityConstant = 0.01;

const SERVER_RATE_DEFAULT = 40;
class Globals {
    static packFrameData(id) {
        if (!Globals.entities[id]) {
            return {
                ranking: Globals.getTop5(),
                rate: process.env.SERVER_RATE || SERVER_RATE_DEFAULT,
                entities: Globals.compressEntity(Globals.entities)
            }
        }
        let frame = {
            ranking: Globals.getTop5(),
            rate: process.env.SERVER_RATE || SERVER_RATE_DEFAULT,
            entities: {}
        };
        let center = {x: Globals.entities[id].x, y: Globals.entities[id].y};
        Object.keys(Globals.entities).forEach((key) => {
            let target = Globals.entities[key];
            if (target && target.x && target.y)  {
                let dist = Globals.dist(center, target);
                if (dist < 800) {
                    frame.entities[key] = Globals.compressEntity(target);
                }
            }
        });

        return frame;
    }

    static compress(entities) {
        Object.keys(entities).forEach((id) => {
            entities[id] = Globals.compressEntity(entities[id]);
        });
    }

    static compressEntity(entity) {
        return [
            // Common
            entity.id,
            entity.name,
            entity.r,
            entity.color,
            entity.x,
            entity.y,
            entity.direction? [entity.direction.x, entity.direction.y] : null,
            entity.rotation,
            entity.kills,
            entity.dead,
            entity.charge,
            entity.fireImpulse,
            entity.visibility,
            entity.render,

            // Specials
            entity.laserState,
            entity.hidden,
            entity.ttl,
            entity.acc
        ]
    }

    static dist (a, b) {
        return Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2));
    }

    static getTop5 () {
        let sorted = Globals.probeEntities.sort((a, b) => {
            let n = b.kills - a.kills;
            if (n !== 0) {
                return n;
            }
            let str1 = a.id.toString(), str2 = b.id.toString();
            return str1.localeCompare(str2);
        }).map((entity) => {
            return [entity.name, entity.kills];
        });
        if (sorted.length > 5) {
            return [sorted[0], sorted[1], sorted[2], sorted[3], sorted[4]]
        } else {
            return sorted;
        }
    }

    static getRandomColor() {
        const COLORS = [0x123456, 0x006800, 0x007073, 0x6E3900, 0x640000, 0x4B0078, 0x90014F];
        return COLORS[Math.floor(Math.random() * COLORS.length)];

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
Globals.W = 5000;
Globals.H = 5000;


// for (let i = 0; i < 5; i++) {
//     for (let j = 0; j < 5; j++) {
//         let hold = Matter.Bodies.circle(1000*i, 1000*j, 10, {
//                 isStatic: true,
//                 mass: 10,
//                 plugin: {
//                     attractors: [
//                         function(bodyA, bodyB) {
//                             return {
//                                 x: (bodyA.position.x - bodyB.position.x) * 1e-6,
//                                 y: (bodyA.position.y - bodyB.position.y) * 1e-6,
//                             };
//                         }
//                     ]
//                 }
//             }
//         );
//         World.add(Globals.engine.world, [hold]);
//     }
// }


module.exports = Globals;