const Globals = require("./globals");
class Utils {
    static normalize(point, scale) {
        let norm = Math.sqrt(point.x * point.x + point.y * point.y);
        if (norm !== 0) {
            point.x = scale * point.x / norm;
            point.y = scale * point.y / norm;
        }
        return point;
    }

    static dist(a, b) {
        return Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2));
    }

    static callAtProb(p, fn) {
        if (Math.random() < p) {
            fn();
        }
    }

    static initEntityGrid() {
        let count = Globals.H / Globals.GridWidth;
        let res = [];
        for (let i = 0; i < count; i++) {
            res.push([]);
            for (let j = 0; j < count; j++) {
                res[i].push({});
            }
        }
        return res;
    }

}
module.exports = Utils;