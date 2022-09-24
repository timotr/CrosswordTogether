const WebSocketServer = require('ws');

const wss = new WebSocketServer.Server({ port: 3008 })

let rooms = {};
const roomTimeout = 1000*60*30; // 30 min
const playerTimeout = 1000*60; // 60 sec
const playerConnections = {};
const playerLastMessage = {};

wss.on("connection", ws => {
    console.log("new client connected");

    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
        let packet = JSON.parse(data);
        switch (packet.type) {
            case "createRoom": {
                // Close empty rooms
                for (let key in rooms) {
                    let room = rooms[key];
                    if (Object.values(room.players).length > 0 && room.lastMessage+roomTimeout < Date.now()) {
                        console.log("Closed inactive room", room);
                        delete rooms[key];
                    }
                }

                let id = makeid(5);
                while (typeof rooms[id] !== "undefined") {
                    id = makeid(5)
                }
                rooms[id] = {
                    code: id,
                    players: {},
                    lastMessage: Date.now(),
                    name: packet.name,
                    cellSize: packet.cellSize,
                    gridPosition: packet.gridPosition,
                    gridSize: packet.gridSize,
                    gridSchema: packet.gridSchema,
                    gridData: packet.gridData,
                    image: packet.image,
                };
                ws.send(JSON.stringify({success: true, type: "createRoom", room: rooms[id]}));
                break;
            }
            case "joinRoom": {
                if (typeof rooms[packet.roomId] === "undefined") {
                    ws.send(JSON.stringify({success: false, type: "joinRoom", error: "Invalid room code"}));
                    return;
                }

                rooms[packet.roomId].players[packet.player.id] = packet.player;
                rooms[packet.roomId].lastMessage = Date.now();
                playerLastMessage[packet.player.id] = Date.now();
                playerConnections[packet.player.id] = ws;
                ws.send(JSON.stringify({success: true, type: "joinRoom", room: rooms[packet.roomId]}));
                break;
            }
            case "leaveRoom": {
                if (typeof rooms[packet.roomId] === "undefined") {
                    ws.send(JSON.stringify({success: false, type: "leaveRoom", error: "Invalid room code"}));
                    return;
                }

                delete rooms[packet.roomId].players[packet.player.id];
                rooms[packet.roomId].lastMessage = Date.now();
                ws.send(JSON.stringify({success: true, type: "leaveRoom"}));
                break;
            }
            case "ping": {
                playerLastMessage[packet.player.id] = Date.now();
                ws.send(JSON.stringify({success: true, type: "ping"}));
                break;
            }
            case "updatePlayer": {
                if (typeof rooms[packet.roomId] === "undefined") {
                    ws.send(JSON.stringify({success: false, type: "updatePlayer", error: "Invalid room code"}));
                    return;
                }

                rooms[packet.roomId].players[packet.player.id] = packet.player;
                rooms[packet.roomId].lastMessage = Date.now();
                playerLastMessage[packet.player.id] = Date.now();
                // Send update to all other players
                Object.values(rooms[packet.roomId].players).filter(p => p.id !== packet.player.id).forEach(player => {
                    // Timeout players
                    if (playerLastMessage[player.id]+playerTimeout < Date.now()) {
                        console.log("Kicked inactive player", player);
                        delete rooms[packet.roomId].players[player.id];
                        return;
                    }

                    playerConnections[player.id].send(JSON.stringify({
                        type: "updatePlayer",
                        players: rooms[packet.roomId].players
                    }));
                });
                //ws.send(JSON.stringify({success: true, type: "updatePlayer"}));
                break;
            }
            case "updateCell": {
                if (typeof rooms[packet.roomId] === "undefined") {
                    ws.send(JSON.stringify({success: false, type: "updateCell", error: "Invalid room code"}));
                    return;
                }

                rooms[packet.roomId].players[packet.player.id] = packet.player;
                rooms[packet.roomId].gridData[packet.pos] = packet.value;

                rooms[packet.roomId].lastMessage = Date.now();
                playerLastMessage[packet.player.id] = Date.now();
                Object.values(rooms[packet.roomId].players).forEach(player => {
                    // Timeout players
                    if (playerLastMessage[player.id]+playerTimeout < Date.now()) {
                        console.log("Kicked inactive player", player);
                        delete rooms[packet.roomId].players[player.id];
                        return;
                    }

                    playerConnections[player.id].send(JSON.stringify({
                        type: "updateCell",
                        players: rooms[packet.roomId].players,
                        gridData: rooms[packet.roomId].gridData
                    }));
                });
                break;
            }
        }
    });

    let intervalId = setInterval(() => {
        ws.send(JSON.stringify({type: "ping"}));
    }, 10000);

    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has connected");
        clearInterval(intervalId);
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 3001");


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}