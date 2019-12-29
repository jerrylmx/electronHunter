define(['Phaser'], function(Phaser) {
    const W = 5000;
    const H = 5000;
    return class ProbeRender {
        constructor(probeData, scene) {
            this.counter = 0;
            this.probeData = probeData;
            this.phaserBody = scene.add.container(probeData.x, probeData.y);
            this.infoBody = scene.add.container(probeData.x, probeData.y);
            this.animationLock = false;

            let probe = scene.add.sprite(0, 0, 'probeC');
            probe.name = this.probeData.id;
            probe.depth = 1;
            probe.setScale(0.1);

            let shadow = scene.add.sprite(0, 0, 'shadow');
            shadow.name = this.probeData.id + "shadow";
            shadow.depth = 1;
            shadow.tint = 0x000000;
            shadow.alpha = 0.3;
            shadow.setScale(0.12);

            let name = scene.add.text(0, -55, probeData.name, {
                fontFamily: '"Verdana"',
                strokeThickness: 1
            });
            name.setAlpha(0.8);
            name.setOrigin(0.5);

            // HP
            this.charges = [];
            for (let i = 0; i < Math.abs(probeData.charge); i++) {
                this.renderCharge(scene);
            }

            this.phaserBody.add([shadow, probe]);
            this.infoBody.add([...this.charges, name]);
            this.renderBaseParticle(scene);
            this.phaserBody.name =  this.probeData.id;
            scene.maskContainer.add([this.phaserBody, this.infoBody]);
            // const line = new Phaser.Geom.Line(
            //     this.phaserBody.x,
            //     this.phaserBody.y,
            //     this.phaserBody.x + 100,
            //     this.phaserBody.y + 100
            // );
            // scene.graphics.lineStyle(2, 0x00ff00);
            // scene.graphics.strokeLineShape(line);

            // Self init
            if (window.socket.id === this.probeData.id) {
                window.me = this;
                scene.spotlight = scene.make.sprite({
                    x: this.probeData.x,
                    y: this.probeData.y,
                    key: 'mask',
                    add: false,
                    scale: this.probeData.visibility
                });
                scene.maskContainer.mask = new Phaser.Display.Masks.BitmapMask(scene, scene.spotlight);
                scene.cameras.main.setBounds(0, 0, W, H);
                scene.cameras.main.setZoom(1);
                scene.cameras.main.startFollow(this.phaserBody);
                this.phaserBody.alpha = 0.3;
            } else {
                this.phaserBody.alpha = 0;
                this.infoBody.alpha = 0;
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


            for (let i = 0; i < this.charges.length; i++) {
                Phaser.Actions.RotateAroundDistance(
                    [this.charges[i]],
                    { x: 0, y: 0 },
                    0.05*(i+1),
                    35);
            }

            this.patchChargeDiff(valDiff.charge, scene);
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

        renderCharge(scene) {
            let dot = scene.add.sprite(0, 0, 'dot');
            dot.tint = 0xF0F0F0;
            dot.alpha = 0.5;
            dot.setScale(0.04);
            this.charges.push(dot);
            this.infoBody.add([dot]);
        }

        patchChargeDiff(diff, scene) {
            if (!diff) return;
            if (diff > 0) {
                if (!this.animationLock) {
                    this.animationLock = true;
                    scene.add.tween({
                        targets: [this.phaserBody],
                        alpha: { value: 0.2, duration: 50, ease: 'Power1' },
                        loop: 0,
                        yoyo: true,
                    });
                    setTimeout(() => {
                        this.animationLock = false;
                    }, 200);
                }
                for (let i = 0; i < Math.abs(diff); i++) {
                    this.renderCharge(scene);
                }
            } else {
                if (!this.animationLock) {
                    this.animationLock = true;
                    scene.add.tween({
                        targets: [this.phaserBody],
                        alpha: { value: 0, duration: 50, ease: 'Power1' },
                        loop: 0,
                        repeat: 2,
                        yoyo: true,
                    });
                    setTimeout(() => {
                        this.animationLock = false;
                    }, 200);
                }
                for (let i = 0; i < Math.abs(diff); i++) {
                    let toRm = this.charges.shift();
                    this.infoBody.remove(toRm);
                }
            }
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
