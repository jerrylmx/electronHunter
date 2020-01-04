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
                let line1 = scene.add.sprite(-12, -320, 'laser2');
                line1.setScale(0.5);
                line1.scaleX = 0;
                line1.scaleY = 1.2;
                line1.alpha = 0;
                line1.name = "L11";
                this.phaserBody.add([line1]);
                scene.add.tween({
                    targets: [line1],
                    scaleX : { value: 0.4, duration: this.probeData.ttl, ease: 'Power1' },
                    alpha: { value: 0.3, duration: this.probeData.ttl, ease: 'Power1' },
                    loop: 0
                });

                let line2 = scene.add.sprite(8, -320, 'laser2');
                line2.setScale(0.5);
                line2.scaleX = 0;
                line2.scaleY = 1.2;
                line2.alpha = 0;
                line2.name = "L12";
                this.phaserBody.add([line2]);
                scene.add.tween({
                    targets: [line2],
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
                    y: -600,
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

                let line1 = me.phaserBody.getByName("L11");
                scene.add.tween({
                    targets: [line1],
                    scaleX : { value: 0.6, duration: 100, ease: 'Power1' },
                    tint: { value: 0xffffff, duration: 100, ease: 'Power1' },
                    alpha: { value: 1, duration: 100, ease: 'Power1' },
                    loop: 0
                });

                let line2 = me.phaserBody.getByName("L12");
                scene.add.tween({
                    targets: [line2],
                    scaleX : { value: 0.6, duration: 100, ease: 'Power1' },
                    tint: { value: 0xffffff, duration: 100, ease: 'Power1' },
                    alpha: { value: 1, duration: 100, ease: 'Power1' },
                    loop: 0
                });
            }

            // Laser finish
            if (this.probeData.laserState === 0 && diff === -2) {
                let l11 = me.phaserBody.getByName("L11");
                let l12 = me.phaserBody.getByName("L12");
                let l2 = me.phaserBody.getByName("L2");
                l2 && me.phaserBody.remove(l2);
                l11 && l12 && scene.add.tween({
                    targets: [l11, l12],
                    scaleX : { value: 0, duration: 1000, ease: 'Power1' },
                    loop: 0,
                    onComplete: () => {
                        l11.destroy();
                        l12.destroy();
                    }
                });
            }

            // Trace
            if (this.probeData.laserState === 2 && diff === 0) {
                let angle1 = me.phaserBody.angle - 1;
                let dx = Math.sin(Phaser.Math.DegToRad(angle1)) * 580;
                let dy = Math.cos(Phaser.Math.DegToRad(angle1)) * -580;
                let particles1 = scene.add.sprite(
                    me.phaserBody.x + dx,
                    me.phaserBody.y + dy,
                    'dot');
                particles1.setScale(0.07);
                particles1.tint = 0xa5ff00;
                let particles2 = scene.add.sprite(
                    me.phaserBody.x + dx,
                    me.phaserBody.y + dy,
                    'dot');
                particles2.setScale(0.06);
                particles2.tint = 0xffffff;

                let angle2 = me.phaserBody.angle + 1;
                dx = Math.sin(Phaser.Math.DegToRad(angle2)) * 580;
                dy = Math.cos(Phaser.Math.DegToRad(angle2)) * -580;
                let particles3 = scene.add.sprite(
                    me.phaserBody.x + dx,
                    me.phaserBody.y + dy,
                    'dot');
                particles3.setScale(0.07);
                particles3.tint = 0xa5ff00;
                let particles4 = scene.add.sprite(
                    me.phaserBody.x + dx,
                    me.phaserBody.y + dy,
                    'dot');
                particles4.setScale(0.06);
                particles4.tint = 0xffffff;

                scene.add.tween({
                    targets: [particles1, particles2, particles3, particles4],
                    alpha: { value: 0, duration: 1000, ease: 'Power1' },
                    loop: 0,
                    onComplete: function () {
                        particles1.destroy();
                        particles2.destroy();
                        particles3.destroy();
                        particles4.destroy();
                    },
                });

            }
        }
    }
});
