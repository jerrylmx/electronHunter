define(['probeRenderA', 'probeRenderB', 'probeRenderC', 'probeRenderD', 'chargeRender', 'bulletRender', 'bulletMRender'],
    function(ProbeRenderA, ProbeRenderB, ProbeRenderC, ProbeRenderD, ChargeRender, BulletRender, BulletMRender) {
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
                case "ProbeRenderD":
                    return new ProbeRenderD(data, scene);
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
