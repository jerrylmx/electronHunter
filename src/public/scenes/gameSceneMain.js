define(['jQuery', 'Phaser', 'mdiff', 'probeRender', 'renderFactory'],
    function($, Phaser, Mdiff, ProbeRender, RenderFactory){
    const GAME_SYNC = 'game.resp.sync';
    const W = 1000;
    const H = 1000;
    const PTR_DEBOUNCE_TIME = 50;
    const GAME_CTRL_PTR = "game.move";
    const GAME_FIRE = 'game.fire';

    return class GameSceneMain extends Phaser.Scene {
        constructor() {
            super({key: "Main"});
            window.entities = {};
        }

        preload() {
            this.load.image('background', 'assets/bk.png');
            this.load.image('mask', 'assets/mask1.png');
            this.load.image('shadow', 'assets/shadow.png');
            this.load.image('dot', 'assets/dot.png');
            this.load.image('fireGlow', 'assets/fireGlow.png');
            this.load.image('bullet', 'assets/bullet.png');
            this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
            this.load.image('probeA', 'assets/probes/probeA.png');
        }

        create(frameInit) {
            var that = this;
            that.leftDown = false;
            that.rightDown = false;

            that.pointerLocked = false;

            that.bg = that.add.tileSprite(W/2, H/2, W, H, 'background');
            that.maskContainer = that.add.container(0, 0);
            that.maskContainer.add([that.bg]);

            that.mdiff = new Mdiff({});
            window.socket.on(GAME_SYNC, function (data) {
                that.mdiff.refresh(data.entities);

                let diff = that.mdiff.diff();
                let valDiff = that.mdiff.valDiff(diff.toUpdate);
                diff.toAdd.forEach((data) => {
                    window.entities[data.id] = RenderFactory.getRender(data.render, data, that);
                });
                diff.toRemove.forEach((data) => {
                    window.entities[data.id].destroy(that);
                });
                diff.toUpdate.forEach((data) => {
                    window.entities[data.id].update(data, that, valDiff[data.id]);
                });

                // View model diff
                // Materialize
            });

            // Controls
            that.input.on('pointermove', function (event) {
                let myRender = window.me;
                if (!myRender) return;
                let dir = new Phaser.Math.Vector2(event.worldX - myRender.phaserBody.x, event.worldY - myRender.phaserBody.y).normalize();
                let angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI + 90;
                myRender.phaserBody.angle = angle;

                // Limit pointer move request
                if (that.pointerLocked) return;
                window.socket.emit(GAME_CTRL_PTR, { id: window.socket.id, direction: dir, rotation: angle });
                that.pointerLocked = true;
                setTimeout(function () {
                    this.pointerLocked = false;
                }.bind(that), PTR_DEBOUNCE_TIME);
            });
        }

        update() {
            let pointer = this.input.activePointer;
            if (pointer.rightButtonDown() && !this.rightDown) {
                console.log("R");
                this.rightDown = true;
            }
            // Fire
            if (pointer.leftButtonDown() && !this.leftDown) {
                if (!window.me) return;
                window.socket.emit(GAME_FIRE, {id: window.socket.id});
                this.leftDown = true;
            }
            this.rightDown = pointer.rightButtonDown();
            this.leftDown = pointer.leftButtonDown();
        }
    }
});