const io = require("socket.io")(3000, {
  cors: {
    origin: [ "http://127.0.0.1:8080"],
  },
});

const {
  createGameState,
  gameLoop,
  getNewDownVelocity,
  stopPlayerMovement,
  resetGameState,
} = require("./game");
const { FRAME_RATE } = require("./constants");

//for each player it contains the lobby they are in 1 -> 1
let lobbies = {};
let states = {};
let roomNames = [];

//when connecting
io.on("connection", (socket) => {
  console.log("connection: " + socket.id);
  socket.on("sendMessage", (msg) => {
    // sends the message back to all other sockets in the room
    socket.to(lobbies[socket.id]).emit("newMsg", msg);
    // console.log(msg);
  });

  //joining Room
  socket.on("joinRoom", (room) => {
    // checking if the room exists and then joining the user to that room
    if (!Object.values(lobbies).includes(room)) {
      socket.emit("roomNoExists");
      return;
    }

    let count = 0;
    Object.values(lobbies).forEach((element) => {
      if (element === room) {
        count += 1;
      }
    });

    if (count > 1) {
      socket.emit("roomFull");
      return;
    }

    socket.join(room);
    lobbies[socket.id] = room;
    socket.number = 2;

    socket.broadcast.emit("number", 2);
    io.to(room).emit("successJoinRoom", room);
    // socket.broadcast.to(room).emit("successJoinRoom", room);

    // socket.broadcast.to(room).emit("removeWait");
  });

  //creating new Room
  socket.on("createRoom", (cb) => {
    // creates a new room and adds the user to it
    let roomId = generateRoomID(socket.id);
    while (roomNames.includes(roomId)) {
      temp = generateRoomID(socket.id);
    }
    roomId = generateRoomID(socket.id);
    roomNames.push(roomId);
    lobbies[socket.id] = roomId;
    socket.join(roomId);
    socket.emit("createdRoom", {room: roomId, number: 1});
    socket.number = 1;
    const state = createGameState();
    states[roomId] = state;
    // console.log(lobbies[socket.id]);
  });

  //handling pressing buttons
  socket.on("keydown", handleKeyDown);

  function handleKeyDown(key) {
    if (!lobbies[socket.id]) {
      return;
    }
    let room = lobbies[socket.id];
    let state = states[room];
    let playerNumber = socket.number;

    if (key != " ") {
      getNewDownVelocity(key, state, playerNumber);
    } else {
      states[room].players[socket.number - 1].kicking = true;
      // console.log("player " + socket.number + ": kicked");
    }
  }

  socket.on("keyup", handleKeyUp);

  function handleKeyUp(key) {
    if (!lobbies[socket.id]) {
      return;
    }

    let room = lobbies[socket.id];

    if (key != " ") {
      stopPlayerMovement(key, states[room], socket.number);
    } else {
      states[room].players[socket.number - 1].kicking = false;
    }
  }

  socket.on("playerReady", (val)=>{
    let room = lobbies[socket.id];
    let state = states[room];
    let otherSocketNum = 1;
    state.players[socket.number-1].ready = true;
    state.players[socket.number-1].char = val;
    if(socket.number === 1){
      otherSocketNum = 2;
    }

    //assign char

    if(state.players[otherSocketNum -1].ready === true){
      io.to(room).emit("startGame", {c1: state.players[0].char, c2: state.players[1].char});
      //reset ready
      state.players[0].ready = false;
      state.players[1].ready = false;
      
      //start the game
      startGameInterval(room);
    }


  });

  socket.on("rematch", ()=>{
    socket.broadcast.emit("rematchRequest");
  });

  socket.on("rematchAccepted", ()=>{
    let room = lobbies[socket.id];
    //rest game state object
    let state = states[room];
    state.players[0].goalsScored = 0;
    state.players[1].goalsScored = 0;
    state.time = 0;
    resetGameState(state);

    io.to(room).emit("successJoinRoom");
  });

  socket.on("rematchDeclined", ()=>{
    socket.broadcast.emit("restartClient");
  });

  socket.on("disconnect", () => {
    console.log("disconnect: " + socket.id);
    let room = lobbies[socket.id];
    delete lobbies[socket.id];

    let index = roomNames.indexOf(room);
    //not sure what this next line actually does
    roomNames.splice(index, 1);
    if (!Object.values(lobbies).includes(room)) {
      delete states[room];
    }
  });
});

function startGameInterval(room) {
  const intervalId = setInterval(() => {
    let state = states[room];
    // const start = Date.now();
    const winner = gameLoop(state);
    // const end = Date.now();
    // const time = end - start;
    // console.log('time: ' + time + ' ms');

    if (!winner) {
      io.to(room).emit("newState", JSON.stringify(state));
    } else {
      let victor = "draw";
      //check for who had higher score and send that player back as winner
      if (state.players[0].goalsScored > state.players[1].goalsScored) {
        victor = "player1";
      } else if (state.players[0].goalsScored < state.players[1].goalsScored) {
        victor = "player2";
      }

      io.to(room).emit("gameOver", victor);
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function generateRoomID(clientName) {
  let roomId = "";
  for (let i = 0; i < 5; i++) {
    r = Math.floor(Math.random() * clientName.length);
    roomId += clientName[r];
  }
  return roomId;
}

console.log("server listening on port 3000");
