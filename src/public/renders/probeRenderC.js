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
            this.watchHidden(valDiff.hidden, scene);
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

        watchHidden(diff, scene) {
            if (window.me.probeData.id === this.probeData.id) {
                if (this.probeData.hidden === 1 && diff === 1) {
                    scene.add.tween({
                        targets: [this.phaserBody],
                        alpha: { value: 0.3, duration: 500, ease: 'Power1' },
                        loop: 0
                    });
                } else if (this.probeData.hidden === 0 && diff === -1) {
                    scene.add.tween({
                        targets: [this.phaserBody],
                        alpha: { value: 1, duration: 500, ease: 'Power1' },
                        loop: 0
                    });
                }
            } else {
                if (this.probeData.hidden === 1 && diff === 1) {
                    scene.add.tween({
                        targets: [this.phaserBody, this.infoBody],
                        alpha: { value: 0, duration: 500, ease: 'Power1' },
                        loop: 0
                    });
                } else if (this.probeData.hidden === 0 && diff === -1) {
                    scene.add.tween({
                        targets: [this.phaserBody, this.infoBody],
                        alpha: { value: 1, duration: 500, ease: 'Power1' },
                        loop: 0
                    });
                }
            }
        }

    }
});
