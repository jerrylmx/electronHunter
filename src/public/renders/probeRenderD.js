define(['Phaser', 'common'], function(Phaser, Common) {
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
            this.watchAcc(valDiff.acc, scene);
        }

        destroy(scene) {
            Common.probeDestroy(this, scene);
        }

        watchFireDiff(diff, scene) {
            if (!diff) return;
            if (Math.abs(diff)) {
                let glow = scene.add.sprite(0, -5, 'fireGlow');
                glow.setScale(0.1);
                glow.alpha = 0.2;
                this.phaserBody.add([glow]);

                scene.add.tween({
                    targets: [glow],
                    alpha: { value: 0, duration: 100, ease: 'Power1' },
                    loop: 0
                });

                setTimeout(() => {
                    this.phaserBody.remove(glow);
                }, 100);

            }
        }

        watchAcc(diff, scene) {
            if (!diff) return
            if (diff > 0) {
                let particles = scene.add.particles('flares');
                particles.createEmitter({
                    frame: ['white'],
                    x: 0,
                    y: 0,
                    lifespan: 200,
                    speed: { min: 100, max: 200 },
                    angle: 90,
                    tint: [0xffff82],
                    scale: { start: 0.4, end: 0 },
                    quantity: 1,
                    frequency: 50,
                    blendMode: 'ADD'
                });
                particles.setVisible(true);
                particles.name = "A";
                this.phaserBody.add([particles]);
            } else {
                let p = this.phaserBody.getByName("A");
                p && p.destroy();
            }
        }

    }
});
