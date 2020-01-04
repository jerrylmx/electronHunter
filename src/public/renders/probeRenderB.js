define(['Phaser', 'jQuery', 'common'], function(Phaser, $, Common) {
    const W = 5000;
    const H = 5000;
    return class ProbeRender {
        constructor(probeData, scene) {
            this.counter = 0;
            this.probeData = probeData;
            this.animationLock = false;
            this.phaserBody = Common.renderProbeBody(probeData, scene);
            this.infoBody = Common.renderProbeInfo(probeData, scene);
            this.phaserBody.add([Common.renderBaseParticle(scene)]);

            scene.maskContainer.add([this.phaserBody, this.infoBody]);

            if (window.socket.id === this.probeData.id) {
                window.me = this;
                Common.renderProbeIfSelf(probeData, this.phaserBody, scene);
            }
        }

        update(probeData, scene, valDiff) {
            Common.probeUpdateCommon(this, probeData, scene, valDiff);
            this.watchFireDiff(valDiff.laserState, scene);
        }

        destroy(scene) {
            Common.probeDestroy(this, scene);
        }

        watchFireDiff(diff, scene) {
            let me = this;
            // Start laser
            if (this.probeData.laserState === 1 && diff === 1) {
                let line = scene.add.sprite(-2, -270, 'laser');
                line.setScale(0.5);
                line.scaleX = 0;
                line.scaleY = 1;
                line.alpha = 0;
                line.name = "L1";
                this.phaserBody.add([line]);
                scene.add.tween({
                    targets: [line],
                    scaleX : { value: 0.4, duration: this.probeData.ttl, ease: 'Power1' },
                    alpha: { value: 0.3, duration: this.probeData.ttl, ease: 'Power1' },
                    loop: 0
                });
            }

            // Laser effective
            if (this.probeData.laserState === 2 && diff === 1) {
                let particles = scene.add.particles('flares');
                particles.createEmitter({
                    frame: ['white'],
                    x: 0,
                    y: -480,
                    lifespan: 200,
                    speed: { min: 200, max: 300},
                    scale: { start: 0.3, end: 0 },
                    quantity: 10,
                    frequency: 50,
                    blendMode: 'ADD'
                });
                particles.setVisible(true);
                particles.name = "L2";
                me.phaserBody.add([particles]);

                let line = me.phaserBody.getByName("L1");
                scene.add.tween({
                    targets: [line],
                    scaleX : { value: 0.6, duration: 100, ease: 'Power1' },
                    tint: { value: 0xffffff, duration: 100, ease: 'Power1' },
                    alpha: { value: 1, duration: 100, ease: 'Power1' },
                    loop: 0
                });
            }

            // Laser finish
            if (this.probeData.laserState === 0 && diff === -2) {
                let l1 = me.phaserBody.getByName("L1");
                let l2 = me.phaserBody.getByName("L2");
                l2 && me.phaserBody.remove(l2);
                l1 && scene.add.tween({
                    targets: [l1],
                    scaleX : { value: 0, duration: 1000, ease: 'Power1' },
                    loop: 0,
                    onComplete: () => {
                        l1.destroy();
                    }
                });
            }

            // Trace
            if (this.probeData.laserState === 2 && diff === 0) {
                let angle = me.phaserBody.angle;
                let dx = Math.sin(Phaser.Math.DegToRad(angle)) * 480;
                let dy = Math.cos(Phaser.Math.DegToRad(angle)) * -480;
                let particles = scene.add.sprite(
                    me.phaserBody.x + dx,
                    me.phaserBody.y + dy,
                    'dot');
                particles.setScale(0.07);
                particles.tint = 0xff0000;
                let particles2 = scene.add.sprite(
                    me.phaserBody.x + dx,
                    me.phaserBody.y + dy,
                    'dot');
                particles2.setScale(0.06);
                particles2.tint = 0xffffff;


                scene.add.tween({
                    targets: [particles, particles2],
                    alpha: { value: 0, duration: 1000, ease: 'Power1' },
                    loop: 0,
                    onComplete: function () {
                        particles.destroy();
                    },
                });

            }
        }
    }
});
