define(['Phaser'], function(Phaser) {
    const PROBE_TEX_MAP = {
        'ProbeRenderA': ['probeA', 'probeA_base'],
        'ProbeRenderB': ['probeB', 'probeB_base'],
        'ProbeRenderC': ['probeC', 'probeC_base'],
        'ProbeRenderD': ['probeD', 'probeD_base'],
        'ProbeRenderE': ['probeE', 'probeE_base'],
    };
    const SCALE_FACTOR = 1/300;
    const SHADOW_TINT = 0x000000;
    const SHADOW_ALPHA = 0.3;

    const NAME_PLATE_Y = -55;
    const NAME_PLATE_ALPHA = 0.8;

    const GUIDE_Y = -300;
    const GUIDE_SCALE = 0.08;
    const GUIDE_ALPHA = 0.5;

    return class Common {
        static renderProbeBody(probeData, scene) {
            let body = scene.add.container(probeData.x, probeData.y);

            let probe = scene.add.sprite(0, 0, PROBE_TEX_MAP[probeData.render][0]);
            probe.name = probeData.id;
            probe.depth = 1;
            probe.setScale(probeData.r * SCALE_FACTOR);

            let base = scene.add.sprite(0, 0, PROBE_TEX_MAP[probeData.render][1]);
            base.depth = 1;
            base.setScale(probeData.r * SCALE_FACTOR);
            base.tint = probeData.color;

            // [0x123456, 0x006800, 0x007073, 0x6E3900, 0x640000, 0x4B0078, 0x90014F]

            let shadow = scene.add.sprite(0, 0, 'shadow');
            shadow.name = probeData.id + "shadow";
            shadow.depth = 1;
            shadow.tint = SHADOW_TINT;
            shadow.alpha = SHADOW_ALPHA;
            shadow.setScale(probeData.r * SCALE_FACTOR + 0.02);

            body.add([shadow, probe, base]);
            return body;
        }

        static renderProbeInfo(probeData, scene) {
            let infoBox = scene.add.container(probeData.x, probeData.y);

            let namePlate = scene.add.text(0, NAME_PLATE_Y, probeData.name, {
                fontFamily: '"Verdana"',
                strokeThickness: 1
            });
            namePlate.setAlpha(NAME_PLATE_ALPHA);
            namePlate.setOrigin(0.5);

            infoBox.add([namePlate]);
            return infoBox;
        }

        static renderProbeIfSelf(probeData, phaserBody, scene) {
            scene.spotlight = scene.make.sprite({
                x: probeData.x,
                y: probeData.y,
                key: 'mask',
                add: false,
                scale: probeData.visibility
            });
            scene.maskContainer.mask = new Phaser.Display.Masks.BitmapMask(scene, scene.spotlight);
            scene.cameras.main.setBounds(0, 0, window.W, window.H);
            scene.cameras.main.setZoom(1);
            scene.cameras.main.startFollow(phaserBody);

            let guide = scene.add.sprite(0, GUIDE_Y, 'arrow');
            guide.setScale(GUIDE_SCALE);
            guide.alpha = GUIDE_ALPHA;
            phaserBody.add([guide]);
        }

        static renderBaseParticle(scene) {
            let particles = scene.add.particles('flares');
            particles.createEmitter({
                frame: ['white'],
                x: 0,
                y: 0,
                lifespan: 200,
                speed: { min: 100, max: 200 },
                angle: 90,
                tint: [0x99c2ff],
                scale: { start: 0.4, end: 0 },
                quantity: 1,
                frequency: 50,
                blendMode: 'ADD'
            });
            particles.setVisible(true);
            particles.name = "BP";
            return particles;
        }

        static probeUpdateCommon(render, probeData, scene, valDiff) {
            render.probeData = probeData;

            if (render.phaserBody) {
                render.phaserBody.x = probeData.x;
                render.phaserBody.y = probeData.y;
            }
            if (render.infoBody) {
                render.infoBody.x = probeData.x;
                render.infoBody.y = probeData.y;
            }

            if (window.socket.id === render.probeData.id) {
                scene.spotlight.x = render.phaserBody.x;
                scene.spotlight.y = render.phaserBody.y;
                Common.watchKills(render, valDiff.kills, scene);
                Common.watchDead(valDiff.dead, scene);
            } else {
                render.phaserBody.angle = probeData.rotation;
            }

            render.counter && render.counter++;
        }

        static probeDestroy(render, scene) {
            let particles = scene.add.particles('flares');
            particles.createEmitter({
                frame: ['white'],
                x: 0,
                y: 0,
                lifespan: 200,
                speed: { min: 300, max: 400},
                scale: { start: 0.3, end: 0 },
                quantity: 10,
                frequency: 50,
                blendMode: 'ADD'
            });
            particles.setVisible(true);
            particles.name = "EP";
            render.phaserBody.add([particles]);

            setTimeout(() => {
                render.phaserBody && render.phaserBody.destroy();
                render.infoBody && render.infoBody.destroy();
            }, 200);

            delete window.entities[render.probeData.id];
        }

        static watchKills(render, diff, scene) {
            if (!diff) return;
            if (Math.abs(diff) > 0) {
                let anchorX = window.innerWidth / 2, anchorY = window.innerHeight - 100;
                let msg = render.probeData.kills === 1? `${render.probeData.kills} Kill` : `${render.probeData.kills} Kills`;
                render.kills && render.kills.destroy();
                render.kills = scene.add.text(anchorX, anchorY, msg, { fontFamily: '"Verdana"' });
                render.kills.setOrigin(0.5)
                render.kills.setAlpha(0);
                render.kills.scrollFactorX = 0;
                render.kills.scrollFactorY = 0;

                scene.add.tween({
                    targets: [render.kills],
                    alpha: { value: 1, duration: 1000, ease: 'Power1' },
                    yoyo: true,
                    loop: 0,
                    hold: 2000,
                    onComplete: function () {
                        render.kills && render.kills.destroy();
                    }
                });
            }
        }

        static watchDead(diff, scene) {
            if (!diff) return;
            if (diff === 1) {
                let anchorX = window.innerWidth / 2, anchorY = 300;
                let msg = `You are eliminated!`;
                let text = scene.add.text(anchorX, anchorY, msg, {
                    fontFamily: '"Verdana"',
                    fontSize: '50px'});
                text.scrollFactorX = 0;
                text.scrollFactorY = 0;
                text.setOrigin(0.5);
                setTimeout(() => {
                    location.reload();
                }, 3000);
            }
        }



    }
})