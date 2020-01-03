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
            this.probeData = probeData;
            this.phaserBody.x = probeData.x;
            this.phaserBody.y = probeData.y;
            this.infoBody.x = probeData.x;
            this.infoBody.y = probeData.y;

            // Self update
            if (window.socket.id === this.probeData.id) {
                scene.spotlight.x = this.phaserBody.x;
                scene.spotlight.y = this.phaserBody.y;
                this.watchKills(valDiff.kills, scene);
                this.watchDead(valDiff.dead, scene);
            } else {
                this.phaserBody.angle = probeData.rotation;
            }

            this.patchFireDiff(valDiff.fireImpulse, scene);
            this.watchHidden(valDiff.hidden, scene);

            this.counter++;
        }

        destroy(scene) {
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
            particles.name = "baseParticle";
            this.phaserBody.add([particles]);

            setTimeout(() => {
                this.phaserBody && this.phaserBody.destroy();
                this.infoBody && this.infoBody.destroy();
            }, 200);

            delete window.entities[this.probeData.id];
        }

        renderBaseParticle(scene) {
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
            particles.name = "baseParticle";
            this.phaserBody.add([particles]);
        }


        patchFireDiff(diff, scene) {
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

        watchKills(diff, scene) {
            if (!diff) return;
            if (Math.abs(diff) > 0) {
                let anchorX = window.innerWidth / 2, anchorY = window.innerHeight - 100;
                let msg = this.probeData.kills === 1? `${this.probeData.kills} Kill` : `${this.probeData.kills} Kills`;
                this.kills && this.kills.destroy();
                this.kills = scene.add.text(anchorX, anchorY, msg, { fontFamily: '"Verdana"' });
                this.kills.setOrigin(0.5)
                this.kills.setAlpha(0);
                this.kills.scrollFactorX = 0;
                this.kills.scrollFactorY = 0;

                scene.add.tween({
                    targets: [this.kills],
                    alpha: { value: 1, duration: 1000, ease: 'Power1' },
                    yoyo: true,
                    loop: 0,
                    hold: 2000,
                    onComplete: function () {
                        this.kills && this.kills.destroy();
                    }
                });
            }
        }

        watchDead(diff, scene) {
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
