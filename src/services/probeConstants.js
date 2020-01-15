class ProbeConstants {
    static getConfig(type) {
        switch (type) {
            case "ProbeRenderA":
                return {
                    r: 30,
                    visibility: 5,
                    cd: 30,
                    speed: 7,
                    strength: 32,
                    ttl: 160,

                    // Gain per charge
                    deltaVisibility: 0.4,
                    deltaCd: -0.05,
                    deltaSpeed: 0.1,
                    deltaStrength: 0,
                    deltaTtl: 0,

                };
            case "ProbeRenderB":
                return {
                    r: 30,
                    visibility: 6,
                    cd: 40,
                    speed: 6,
                    strength: 40,
                    ttl: 500,

                    // Gain per charge
                    deltaVisibility: 0.4,
                    deltaCd: -0.05,
                    deltaSpeed: 0.1,
                    deltaStrength: 0,
                    deltaTtl: 0,
                };
            case "ProbeRenderC":
                return {
                    r: 30,
                    visibility: 5,
                    cd: 30,
                    speed: 7,
                    strength: 16,
                    ttl: 30,

                    // Gain per charge
                    deltaVisibility: 0.4,
                    deltaCd: -0.05,
                    deltaSpeed: 0.1,
                    deltaStrength: 0,
                    deltaTtl: 0,
                };
            case "ProbeRenderD":
                return {
                    r: 20,
                    visibility: 5,
                    cd: 30,
                    speed: 8,
                    strength: 24,
                    ttl: 80,

                    // Gain per charge
                    deltaVisibility: 0.4,
                    deltaCd: -0.05,
                    deltaSpeed: 0.01,
                    deltaStrength: 0,
                    deltaTtl: 0,
                };
            case "ProbeRenderE":
                return {
                    r: 40,
                    visibility: 8,
                    cd: 40,
                    speed: 5,
                    strength: 40,
                    ttl: 500,

                    // Gain per charge
                    deltaVisibility: 0.4,
                    deltaCd: -0.05,
                    deltaSpeed: 0.1,
                    deltaStrength: 0,
                    deltaTtl: 0,
                };
            default:
                return;
        }
    }

}
module.exports = ProbeConstants;