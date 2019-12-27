define([], function() {
    return class BulletRender {
        constructor(bulletData, scene) {
            this.bulletData = bulletData;
            this.phaserBody = scene.add.container(bulletData.x, bulletData.y);

            let bullet = scene.add.sprite(0, 0, 'bulletM');
            bullet.name = this.bulletData.id;
            bullet.depth = 1;
            bullet.setScale(0.05);
            this.phaserBody.angle = bulletData.rotation;

            this.phaserBody.add([bullet]);
            this.phaserBody.name =  this.bulletData.id;
            this.renderBaseParticle(scene);
            scene.maskContainer.add([this.phaserBody]);

        }

        update(bulletData, scene) {
            this.bulletData = bulletData;
            this.phaserBody.x = bulletData.x;
            this.phaserBody.y = bulletData.y;
            this.phaserBody.angle = bulletData.rotation;
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
            }, 200);
            delete window.entities[this.bulletData.id];
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
                scale: { start: 0.3, end: 0 },
                quantity: 1,
                frequency: 50,
                blendMode: 'ADD'
            });
            particles.setVisible(true);
            particles.name = "baseParticle";
            this.phaserBody.add([particles]);
        }
    }
});
