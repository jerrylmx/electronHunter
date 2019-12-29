define(['Phaser', 'jQuery'], function(Phaser, $) {
    const W = 5000;
    const H = 5000;
    return class ProbeRender {
        constructor(probeData, scene) {
            this.probeData = probeData;
            this.phaserBody = scene.add.container(probeData.x, probeData.y);
            this.infoBody = scene.add.container(probeData.x, probeData.y);
            this.animationLock = false;

            let probe = scene.add.sprite(0, 0, 'probeB');
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
            this.watchFireDiff(valDiff.laserState, scene);
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

    }
});
