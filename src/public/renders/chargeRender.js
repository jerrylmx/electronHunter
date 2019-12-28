define([], function() {
    return class ChargeRender {
        constructor(chargeData, scene) {
            this.chargeData = chargeData;
            this.phaserBody = scene.add.container(chargeData.x, chargeData.y);

            let charge = scene.add.sprite(0, 0, 'dot');
            charge.name = this.chargeData.id;
            charge.depth = 1;
            charge.setScale(0.05);


            this.phaserBody.add([charge]);
            this.phaserBody.name =  this.chargeData.id;
            this.phaserBody.setAlpha(0);

            // Glow
            let particles = scene.add.particles('flares');
            particles.createEmitter({
                frame: ['white'],
                x: 0,
                y: 0,
                lifespan: 10,
                angle: 90,
                scale: { start: 0.3, end: 0 },
                quantity: 1,
                frequency: 10,
                blendMode: 'ADD'
            });
            particles.setVisible(true);
            particles.name = "baseParticle";
            this.phaserBody.add([particles]);

            scene.maskContainer.add([this.phaserBody]);

            let that = this;
            scene.add.tween({
                targets: [this.phaserBody],
                alpha: { value: 1, duration: 5000, ease: 'Power1' },
                loop: 0
            });
        }

        update(chargeData, scene) {
            this.chargeData = chargeData;
            this.phaserBody.x = chargeData.x;
            this.phaserBody.y = chargeData.y;
        }

        destroy(scene) {
            scene.add.tween({
                targets: [this.phaserBody],
                alpha: { value: 0, duration: 1000, ease: 'Power1' },
                loop: 0
            });
            this.phaserBody && this.phaserBody.destroy();
            delete window.entities[this.chargeData.id];
        }
    }
});
