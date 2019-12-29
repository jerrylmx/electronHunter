define(['jQuery', 'Phaser', 'mdiff', 'renderFactory', 'msgpack', 'fmanager', 'leaderBoardRender'],
    function($, Phaser, Mdiff, RenderFactory, msgpack, Fmanager, LeaderBoardRender){
    const GAME_SYNC = 'game.resp.sync';
    const W = 5000;
    const H = 5000;
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
            this.load.image('bulletM', 'assets/bulletM.png');
            this.load.image('laser', 'assets/laser.png');
            this.load.image('laser2', 'assets/laser2.png');
            this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
            this.load.image('radar', 'assets/radar.png');
            this.load.image('arrow', 'assets/arrow.png');
            this.load.image('target', 'assets/target.png');
            this.load.image('probeA', 'assets/probes/probeA.png');
            this.load.image('probeB', 'assets/probes/probeB.png');
            this.load.image('probeC', 'assets/probes/probeC.png');
            this.load.image('probeD', 'assets/probes/probeD.png');
            this.load.image('probeE', 'assets/probes/probeE.png');
            this.load.image('icon1', 'assets/icon1.png');
            this.load.image('icon2', 'assets/icon2.png');
        }

        create(frameInit) {
            var that = this;
            that.fmanager = new Fmanager({rate: frameInit.rate});

            that.graphics = that.add.graphics();
            // stats
            that.stamp = new Date().getTime();
            that.count = 0;
            that.avg = 0;
            that.hist = [0, 0, 0, 0, 0];

            that.leftDown = false;
            that.rightDown = false;
            that.pointerLocked = false;
            that.pointerPosition = {x: 0, y: 0};

            that.bg = that.add.tileSprite(W/2, H/2, W, H, 'background');
            that.maskContainer = that.add.container(0, 0);
            that.maskContainer.add([that.bg]);

            that.mdiff = new Mdiff({});

            window.socket.on(GAME_SYNC, function (data) {
                let bufView = new Uint8Array(data);
                data = msgpack.decode(bufView);
                data.entities = GameSceneMain.parse(data.entities);
                if (!that.frame) {
                    that.frame = data;
                    GameSceneMain.guiInit(that);
                } else {
                    that.frame = data;
                }
                that.fmanager.push(data.entities);
            });

            // Controls
            that.input.on('pointermove', function (event) {
                that.pointerPosition = {x: event.worldX, y: event.worldY};
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
            // Click
            if (pointer.leftButtonDown() && !this.leftDown) {
                if (!window.me) return;
                window.socket.emit(GAME_FIRE, {id: window.socket.id});


                this.leftDown = true;
            }



            this.rightDown = pointer.rightButtonDown();
            this.leftDown = pointer.leftButtonDown();

            GameSceneMain.guiUpdate(this);

            if (this.fmanager.ready) {
                let entities = this.fmanager.pop();
                this.mdiff.refresh(entities);
                let diff = this.mdiff.diff();
                let valDiff = this.mdiff.valDiff(diff.toUpdate);
                diff.toAdd.forEach((data) => {
                    window.entities[data.id] = RenderFactory.getRender(data.render, data, this);
                });
                diff.toRemove.forEach((data) => {
                    window.entities[data.id].destroy(this);
                });
                diff.toUpdate.forEach((data) => {
                    window.entities[data.id].update(data, this, valDiff[data.id]);
                });
            }
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

            let chargeIcon = scene.add.sprite(50, window.innerHeight - 50, "icon1");
            chargeIcon.setScale(0.05);
            chargeIcon.scrollFactorX = 0;
            chargeIcon.scrollFactorY = 0;


            let killIcon = scene.add.sprite(110, window.innerHeight - 48, "icon2");
            killIcon.setScale(0.04);
            killIcon.scrollFactorX = 0;
            killIcon.scrollFactorY = 0;

            scene.charge = scene.add.text(60, window.innerHeight - 55, "0");
            scene.charge.scrollFactorX = 0;
            scene.charge.scrollFactorY = 0;
            scene.kill = scene.add.text(124, window.innerHeight - 55, "0");
            scene.kill.scrollFactorX = 0;
            scene.kill.scrollFactorY = 0;

            if (scene.frame) {
                scene.lb = new LeaderBoardRender(scene.frame.ranking, scene);
            }
        }

        static guiUpdate(scene) {
            let me = window.me;
            if (!me) return;
            let rightRatio = me.probeData.x / W;
            let botRatio = me.probeData.y / H;
            scene.dot.x = -58 + rightRatio * 58 * 2;
            scene.dot.y = -58 + botRatio * 58 * 2;
            scene.lb.update(scene.frame.ranking, scene);
            scene.charge.setText(window.me.probeData.charge);
            scene.kill.setText(window.me.probeData.kills);
        }

        static parse(entities) {
            let parsed = {};
            let syntax = [
                'id',
                'name',
                'x',
                'y',
                'direction',
                'rotation',
                'kills',
                'dead',
                'charge',
                'fireImpulse',
                'visibility',
                'render',
                'laserState',
                'hidden',
                'ttl',
                'acc'
            ];

            Object.keys(entities).forEach((id) => {
                let data = entities[id];
                let parsedEntry = {}
                for (let i = 0; i < data.length; i++) {
                    parsedEntry[syntax[i]] = data[i];
                    if (syntax[i] === 'direction' && data[i]) {
                        parsedEntry[syntax[i]] = {x: data[i][0], y: data[i][1]}
                    }
                }
                parsed[id] = parsedEntry;
            });
            return parsed;
        }
    }
});