var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')
const path = require("path")
const PORT = process.env.PORT || 8080
var players = {};
//app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  //res.sendFile(__dirname + '/index.html');
  res.sendFile(path.join(__dirname, ".", "public/index.html"))
});

app.use(express.static(path.join(__dirname, ".", "public")));
 
server.listen(PORT, function () {
  console.log(`Listening on ${PORT}`);
});

const serverSocket = io(server);

serverSocket.on('connection', function (socket) {
  console.log('a user connected');
  players[socket.id] = {
    playerId: socket.id,
    playerMovement: {
      left: false,
      right: false,
      up: false,
      down: false
    }
  }

  socket.emit("currentPlayers", players);
  console.log(players)
  socket.broadcast.emit("newPlayer", players[socket.id])
  

  // when a player moves, update the player data
  // socket.on("playerMovement", function (data) {
  //   const { x, y } = data;
  //   players[socket.id].x = x;
  //   players[socket.id].y = y;
  //   // emit a message to all players about the player that moved
  //   socket.broadcast.emit("playerMoved", players[socket.id]);
    
  // });

  socket.on("playerMovement", function (cursors) {
    // emit a message to all players about the player that moved
    
    // players[socket.id].playerMovement = 
    //   {...players[socket.id].playerMovement, ...cursors}
   
    socket.broadcast.emit("playerMoved", cursors)
    ;
    
  });


  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    serverSocket.emit('disconnected', socket.id);

  });
  
});



