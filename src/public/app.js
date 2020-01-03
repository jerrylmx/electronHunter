require.config({
    paths: {
        'jQuery': 'lib/jquery-3.4.1.min',
        'Phaser': 'lib/phaser.min',
        'socketio': 'lib/socket.io',
        'scenePrompt': 'scenes/gameScenePrompt',
        'sceneMain': 'scenes/gameSceneMain',
        'mdiff': 'lib/mdiff',
        'common': 'renders/common',
        'probeRenderA': 'renders/probeRenderA',
        'probeRenderB': 'renders/probeRenderB',
        'probeRenderC': 'renders/probeRenderC',
        'probeRenderD': 'renders/probeRenderD',
        'probeRenderE': 'renders/probeRenderE',
        'leaderBoardRender': 'renders/leaderBoardRender',
        'chargeRender': 'renders/chargeRender',
        'bulletRender': 'renders/bulletRender',
        'bulletMRender': 'renders/bulletMRender',
        'renderFactory': 'utils/renderUtils',
        'msgpack': 'lib/msgpack.min',
        'fmanager': 'lib/frameManager'
    },
    shim: {
        'jQuery': {
            exports: '$'
        }
    }
});

require(['jQuery', 'Phaser', 'socketio', 'scenePrompt', 'sceneMain'],
    function ($, Phaser, socketio, GameScenePrompt, GameSceneMain) {
    window.socket = socketio();
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [GameScenePrompt, GameSceneMain],
        parent: "game",
        antialias: true
    };
    const game = new Phaser.Game(config);
    document.addEventListener('contextmenu', event => event.preventDefault());
    console.log("Loaded");
});