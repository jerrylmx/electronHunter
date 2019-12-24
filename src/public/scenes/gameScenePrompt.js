define(['jQuery', 'Phaser', 'msgpack'], function($, Phaser, msgpack){
    const DEFAULT_COLOR_CODE='0x4E7607';
    const COVER_W = 2000;
    const COVER_H = 2000;
    const GAME_JOIN = 'game.join';
    const PING_TEST = 'ping.test';
    const PONG_TEST = 'pong.test';

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
            let $signal = $( '.signal' );

            var that = this;
            that.add.tileSprite(COVER_W/2, COVER_H/2, COVER_W, COVER_H, 'background');
            that.time = new Date().getTime();
            that.avg = 0;

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
                that.interval && clearInterval(that.interval);
                that.scene.start("Main", data);
            });

            // Pong test
            window.socket.on(PONG_TEST, function(data) {
                let lag = new Date().getTime() - that.time;
                that.avg = (that.avg + lag) / 2
                $signal.text(Math.ceil(that.avg) + 'ms');
                if (that.avg < 100) {
                    $signal.css('background-color', '#16a085');
                } else if (that.avg < 150) {
                    $signal.css('background-color', '#bbff6e');
                } else if (that.avg < 250) {
                    $signal.css('background-color', '#eeff6e');
                } else {
                    $signal.css('background-color', '#ff5521');
                }
            });

            that.interval = setInterval(() => {
                window.socket.emit(PING_TEST);
                that.time = new Date().getTime();
            }, 500);
        }
    }
});