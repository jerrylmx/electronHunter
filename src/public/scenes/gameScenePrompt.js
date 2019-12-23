define(['jQuery', 'Phaser', 'msgpack'], function($, Phaser, msgpack){
    const DEFAULT_COLOR_CODE='0x4E7607';
    const COVER_W = 2000;
    const COVER_H = 2000;
    const GAME_JOIN = 'game.join';

    return class GameScenePrompt extends Phaser.Scene {
        constructor() {
            super({key: "Prompt"});
        }

        preload() {
            $('#endPrompt').hide();
            this.load.image('background', 'assets/bk.png');
        }

        create() {
            let selected = DEFAULT_COLOR_CODE;
            let $container = $( '#container' );
            let $joinBtn = $( '#join' );
            var self = this;
            self.add.tileSprite(COVER_W/2, COVER_H/2, COVER_W, COVER_H, 'background');

            // Join Game
            $joinBtn.click(function () {
                $container.hide();
                window.socket.emit(GAME_JOIN, {
                    id: window.socket.id,
                    name: document.getElementById("name").value,
                    color: selected
                });
            });

            // Game start
            window.socket.on("game.resp.init", function(data) {
                let bufView = new Uint8Array(data);
                data = msgpack.decode(bufView);
                self.scene.start("Main", data);
            });
        }
    }
});