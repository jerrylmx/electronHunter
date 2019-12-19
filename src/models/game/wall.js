const Matter = require("matter-js");
const World = Matter.World,
    Bodies = Matter.Bodies
const Globals = require("../../services/globals");

class Wall {
    constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.render = "WallRender";
        World.add(Globals.engine.world, [this.createBody()]);
    }

    createBody() {
        let w = 10000;
        let h = 10000;
        let t = 10;
        switch (this.type) {
            case "T":
                return Bodies.rectangle(w/2, 0-t/2, w, t, { isStatic: true, restitution: 1, label: this.id });
            case "B":
                return Bodies.rectangle(w/2, h+t/2, w, t, { isStatic: true, restitution: 1, label: this.id });
            case "L":
                return Bodies.rectangle(0-t/2, h/2, t, h, { isStatic: true, restitution: 1, label: this.id });
            case "R":
                return Bodies.rectangle(w+t/2, h/2, t, h, { isStatic: true, restitution: 1, label: this.id });
            default:
                return null;
        }
        return null;
    }

    sync() {

    }

    box() {
        return {
            id: this.id
        }
    }

    onCollision(body) {

    }

    destroy() {

    }
}

module.exports = Wall;