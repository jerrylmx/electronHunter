
class Utils {
    static normalize(point, scale) {
        let norm = Math.sqrt(point.x * point.x + point.y * point.y);
        if (norm !== 0) {
            point.x = scale * point.x / norm;
            point.y = scale * point.y / norm;
        }
        return point;
    }
}
module.exports = Utils;