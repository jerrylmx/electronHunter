const Matter = require("matter-js");
const Bodies = Matter.Bodies;
const World = Matter.World;
const MatterAttractors = require("../../node_modules/matter-attractors/build/matter-attractors");
const Utils = require("./utils");
Matter.use(MatterAttractors);

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
                let dist = Utils.dist(center, target);
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
            entity.isTop,
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
            entity.breakImpulse,
            entity.visibility,
            entity.render,
            entity.protected,
            entity.shootCd,
            entity.cfg? entity.cfg.cd : null,
            entity.shieldCd,

            // Specials
            entity.laserState,
            entity.hidden,
            entity.ttl,
            entity.acc
        ];
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
            entity.isTop = false;
            return [entity.name, entity.kills, entity.id];
        });
        for (let i = 0; i < Math.min(sorted.length, 5); i++) {
            if (Globals.entities[sorted[i][2]]) {
                Globals.entities[sorted[i][2]].isTop = true;
            }
        }
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

    static updateGrid(entity) {
        if (!entity.x || !entity.y) return;
        const xInd = Math.floor(entity.x / Globals.GridWidth);
        const yInd = Math.floor(entity.y / Globals.GridWidth);
        let grid = Globals.grid[yInd][xInd];
        // grid[entity.id] &&

    }

    static pushEntity(id, entity) {
        Globals.entities[id] = entity;
    }

    static removeEntiy(id) {
        delete Globals.entities[id];
    }
}

// Create matter engine
Globals.engine = Matter.Engine.create();
Globals.engine.world.gravity = { x: 0, y: 0, scale: 0.5 };

// Subscribe for collision events
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

// Server side storage
Globals.SERVER_RATE = process.env.SERVER_RATE || SERVER_RATE_DEFAULT;
Globals.entities = {};
Globals.probeCount = 0;
Globals.probeEntities = [];
Globals.ranking = [];
Globals.W = 5000;
Globals.H = 5000;
Globals.GridWidth = 500;

// Grids
Globals.grid = Utils.initEntityGrid();



module.exports = Globals;