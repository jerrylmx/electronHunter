define([], function() {
    return class LeaderBoardRender {
        constructor(ranking, scene) {

            this.slots = [null, null, null, null, null];

            this.phaserBody = scene.add.container(0, 0);
            this.phaserBody.scrollFactorX = 0;
            this.phaserBody.scrollFactorY = 0;

            let header = scene.add.text(30, 20, "Leader Board", {
                fontFamily: '"Verdana"',
                strokeThickness: 1
            });
            header.alpha = 0.7;
            this.phaserBody.add([header]);

            for (let i = 1; i < 6; i++) {
                let ph = scene.add.text(20, i * 30 + 30, `${i}. -`, {
                    fontFamily: '"Verdana"',
                });
                ph.alpha = 0.5;
                this.phaserBody.add([ph]);
            }

            this.update(ranking, scene);
        }

        update(ranking, scene) {
            for (let i = 0; i < ranking.length; i++) {
                if (i < 5) {
                    let text = ranking[i][0] + "  " +   ranking[i][1] + "kills";
                    let row = `${i+1}.  ${text}`;
                    if (row !== this.phaserBody.getAll()[i+1]._text) {
                        this.phaserBody.getAll()[i+1].setText(row);
                    }

                    if (window.me && ranking[i][2] === window.me.probeData.id) {
                        this.phaserBody.getAll()[i+1].setColor('#ffff00');
                    } else {
                        this.phaserBody.getAll()[i+1].setColor('#ffffff');
                    }

                }
            }
        }
    }
});
