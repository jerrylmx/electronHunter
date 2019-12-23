define(['jQuery', 'Phaser', 'mdiff', 'probeRender', 'renderFactory', 'msgpack', 'fmanager'],
    function($, Phaser, Mdiff, ProbeRender, RenderFactory, msgpack, Fmanager){
    const GAME_SYNC = 'game.resp.sync';
    const W = 100;
    const H = 100;
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
            this.load.image('radar', 'assets/radar.png');
            this.load.image('probeA', 'assets/probes/probeA.png');
        }

        create(frameInit) {
            var that = this;
            that.fmanager = new Fmanager({rate: frameInit.rate});

            // stats
            that.stamp = new Date().getTime();
            that.count = 0;
            that.avg = 0;
            that.hist = [0, 0, 0, 0, 0];

            that.leftDown = false;
            that.rightDown = false;
            that.pointerLocked = false;

            that.bg = that.add.tileSprite(W/2, H/2, W, H, 'background');
            that.maskContainer = that.add.container(0, 0);
            that.maskContainer.add([that.bg]);
            GameSceneMain.guiInit(that);

            that.mdiff = new Mdiff({});
            window.socket.on(GAME_SYNC, function (data) {
                let bufView = new Uint8Array(data);
                data = msgpack.decode(bufView);
                that.fmanager.push(data.entities);
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
            // let pointer = this.input.activePointer;
            // if (pointer.rightButtonDown() && !this.rightDown) {
            //     console.log("R");
            //     this.rightDown = true;
            // }
            // // Fire
            // if (pointer.leftButtonDown() && !this.leftDown) {
            //     if (!window.me) return;
            //     window.socket.emit(GAME_FIRE, {id: window.socket.id});
            //     this.leftDown = true;
            // }
            // this.rightDown = pointer.rightButtonDown();
            // this.leftDown = pointer.leftButtonDown();
            //
            // GameSceneMain.guiUpdate(this);
            //
            // if (this.fmanager.ready) {
            //     let entities = this.fmanager.pop();
            //     this.mdiff.refresh(entities);
            //     let diff = this.mdiff.diff();
            //     let valDiff = this.mdiff.valDiff(diff.toUpdate);
            //     diff.toAdd.forEach((data) => {
            //         window.entities[data.id] = RenderFactory.getRender(data.render, data, this);
            //     });
            //     diff.toRemove.forEach((data) => {
            //         window.entities[data.id].destroy(this);
            //     });
            //     diff.toUpdate.forEach((data) => {
            //         window.entities[data.id].update(data, this, valDiff[data.id]);
            //     });
            // }
        }

        static guiInit(scene) {
            let anchorX = window.innerWidth - 100, anchorY = window.innerHeight - 100;
            let radarContainer = scene.add.container(anchorX, anchorY);
            let radar = scene.add.sprite(0, 0, "radar");
            radar.setScale(0.25);
            radar.setDepth(2);
            radar.scrollFactorX = 0;
            radar.scrollFactorY = 0;
            let dot = scene.add.sprite(0-58, 0-58, "dot");
            dot.setScale(0.03);
            dot.alpha = 0.6;
            dot.setDepth(2);
            dot.scrollFactorX = 0;
            dot.scrollFactorY = 0;
            scene.dot = dot;
            radarContainer.add([radar,dot]);
        }

        static guiUpdate(scene) {
            let me = window.me;
            if (!me) return;
            let rightRatio = me.probeData.x / W;
            let botRatio = me.probeData.y / H;
            scene.dot.x = -58 + rightRatio * 58 * 2;
            scene.dot.y = -58 + botRatio * 58 * 2;
        }
    }
});