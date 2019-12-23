const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http').createServer(app);
const io = require('socket.io')(http, {wsEngine: 'ws'});
const IoController = require("./controllers/ioHandler");
const Globals = require("./services/globals");
const EntityControlService = require("./services/entityControlService");
const msgpack = require("msgpack-lite");

const Matter = require("matter-js");
Matter.use('matter-attractors');
const Engine = Matter.Engine;
const Wall = require("./models/game/wall");


// const WebSocket = require('ws');
// const ws = new WebSocket('wss://www.example.com/socketserver');
// ws.onopen = function(e) {
//     alert("[open] Connection established");
//     alert("Sending to server");
//     socket.send("My name is John");
// };

let clients = {};
app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

io.on('connection', function(socket) {
    console.log('Player connected');
    clients[socket.id] = socket;

    // {id: ...}
    socket.on("disconnect", () => {
        IoController.gameUnregister({id: socket.id});
        delete clients[socket.id];
    });

    // {id: ..., name: ..., color: ...}
    socket.on("game.join", (data) => {
        IoController.gameJoin(data);
        socket.emit("game.resp.init", msgpack.encode(Globals.packFrameData(socket.id)));

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
    Object.keys(clients).forEach((id) => {
        // clients[id].emit("game.resp.sync", msgpack.encode(Globals.packFrameData(id)));
        clients[id].emit("game.resp.sync", msgpack.encode({time: new Date().getTime()}));
    });
}, Globals.SERVER_RATE);

// setInterval(function () {
//     Engine.update(Globals.engine);
//     Object.keys(Globals.entities).forEach((key) => {
//         Globals.entities[key].sync();
//     });
// }, Globals.SERVER_RATE);
//
// // Server state logging
// setInterval(function () {
//     console.log(`Entity count: ${Object.keys(Globals.entities).length}`);
// }, 10000);

let entityCtrl = new EntityControlService();
entityCtrl.start();

// Boundary
Globals.entities["topWall"] = new Wall({id: "topWall", type: "T"});
Globals.entities["botWall"] = new Wall({id: "botWall", type: "B"});
Globals.entities["leftWall"] = new Wall({id: "leftWall", type: "L"});
Globals.entities["rightWall"] = new Wall({id: "rightWall", type: "R"});

