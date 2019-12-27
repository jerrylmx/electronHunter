define(['probeRenderA', 'probeRenderB', 'probeRenderC', 'chargeRender', 'bulletRender', 'bulletMRender'],
    function(ProbeRenderA, ProbeRenderB, ProbeRenderC, ChargeRender, BulletRender, BulletMRender) {
    return class RenderUtils {
        constructor(frameInit) {
            this.frameOld = {};
            this.frameNew = frameInit;
        }

        static getRender(type, data, scene) {
            switch (type) {
                case "ProbeRenderA":
                    return new ProbeRenderA(data, scene);
                case "ProbeRenderB":
                    return new ProbeRenderB(data, scene);
                case "ProbeRenderC":
                    return new ProbeRenderC(data, scene);
                case "ChargeRender":
                    return new ChargeRender(data, scene);
                case "BulletRender":
                    return new BulletRender(data, scene);
                case "BulletMRender":
                    return new BulletMRender(data, scene);
                default:
                    return new ChargeRender(data, scene);
            }
            return null
        }
    }
});
