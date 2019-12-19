const express = require('express');
const app = express();
const port = 3000;
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const IoController = require("./controllers/ioHandler");
const Globals = require("./services/globals");
const EntityControlService = require("./services/entityControlService");

const Matter = require("matter-js");
Matter.use('matter-attractors');
const Engine = Matter.Engine;
const Wall = require("./models/game/wall");



app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

io.on('connection', function(socket) {
    console.log('Player connected');

    // {id: ...}
    socket.on("disconnect", () => {
        IoController.gameUnregister({id: socket.id});
    });

    // {id: ..., name: ..., color: ...}
    socket.on("game.join", (data) => {
        IoController.gameJoin(data);
        socket.emit("game.resp.init", Globals.packFrameData());
    });

    // { id: ..., direction: ..., rotation: ...}
    socket.on("game.move", (data) => {
        IoController.gameMove(data);
    });

    // {id: ...}
    socket.on("game.fire", (data) => {
        IoController.gameFire(data);
    });

});


http.listen(port, () => console.log(`Game server running on port ${port}!`));

// Server loop
setInterval(function () {
    Engine.update(Globals.engine, Globals.SERVER_RATE);
    Object.keys(Globals.entities).forEach((key) => {
        Globals.entities[key].sync();
    });
    io.sockets.emit("game.resp.sync", Globals.packFrameData());
}, Globals.SERVER_RATE);

// Server state logging
setInterval(function () {
    console.log(`Entity count: ${Object.keys(Globals.entities).length}`);
}, 10000);

let entityCtrl = new EntityControlService();
entityCtrl.start();

// Boundary
Globals.entities["topWall"] = new Wall({id: "topWall", type: "T"});
Globals.entities["botWall"] = new Wall({id: "botWall", type: "B"});
Globals.entities["leftWall"] = new Wall({id: "leftWall", type: "L"});
Globals.entities["rightWall"] = new Wall({id: "rightWall", type: "R"});

