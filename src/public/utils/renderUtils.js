define(['probeRender', 'chargeRender', 'bulletRender'], function(ProbeRender, ChargeRender, BulletRender) {
    return class RenderUtils {
        constructor(frameInit) {
            this.frameOld = {};
            this.frameNew = frameInit;
        }

        static getRender(type, data, scene) {
            switch (type) {
                case "ProbeRender":
                    return new ProbeRender(data, scene);
                case "ChargeRender":
                    return new ChargeRender(data, scene);
                case "BulletRender":
                    return new BulletRender(data, scene);
                default:
                    return new ChargeRender(data, scene);
            }
            return null
        }
    }
});
