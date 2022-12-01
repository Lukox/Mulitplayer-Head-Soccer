const socket = io('http://localhost:3000');

const initialScreen = document.getElementById("initialScreen");
const joinRoomBtn = document.getElementById("joinRoom");
const roomInput = document.getElementById("roomInput");
const createLobbyBtn = document.getElementById("createLobby");
const createGameBtn = document.getElementById("createGame");
const waitScreen = document.getElementById("waitScreen");

let canvas, c;

//loading assets
//const pitch = document.createElement('img');
//pitch.src = './assets/football_pitch_1st_draft.jpg';
const son1 = document.createElement('img');
son1.src = './assets/son_shoe_bot_transparent.png';
const son2 = document.createElement('img');
son2.src = './assets/son_shoe_bot_transparent.png';
const kickingSon = document.createElement('img');
kickingSon.src = './assets/kicking_son.png';
const pitch = document.createElement('img');
pitch.src = './assets/pitch_1.png';

//handling receiving msg
socket.on('newMsg', msg => {
    displayMsg(msg);
});

//handling updating the gamestate
socket.on("newState", handleNewState);

// handling joining room
socket.on('successJoinRoom', room => {
    initialScreen.style.display = "none";
    // waitScreen.style.display = "block";
    // msg = "joined " + room;
    // displayMsg(msg);
    init();
});

socket.on('roomFull', () => {
    alert("room full");
});

socket.on('roomNoExists', () => {
    alert("room doesnt exist");
});

//handling creating room
socket.on('createdRoom', room => {
    initialScreen.style.display = "none";
    waitScreen.style.display = "block";
    msg = "Room code: " + room;
    displayMsg(msg);
    init();
});

socket.on('removeWait', () => {
    waitScreen.style.display = "none";
});

// button listeners
joinRoomBtn.addEventListener("click", function(e){
    room = roomInput.value;
    socket.emit("joinRoom", room);
});

createLobbyBtn.addEventListener("click", function(e){
    socket.emit("createRoom", msg => {
        displayMsg(msg);
    });
});

createGameBtn.addEventListener('click', function(e){
    socket.emit("createGame", socket.id);   
});

//displaying messages on screen
function displayMsg(msg) {
    let item = document.createElement('p');
    item.innerHTML = msg;
    document.getElementById("message").append(item);
}

function init() {
    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 500;
    
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
}

//code for game to be integrated

function paintGame(state) {
    // c.fillStyle = 'white';
    // c.fillRect(0,0,canvas.width,canvas.height);  
    c.drawImage(pitch, 0, 0, canvas.width, canvas.height);
    
    paintPlayers(state);
    paintBall(state.ball);
};

function paintPlayers(state) {
    // c.fillStyle = player.colour;
    // c.fillRect(player.position.x, player.position.y, player.size, player.size);

    //drawing player1
    let player = state.players[0];
    if (player.kicking) {
        c.drawImage(kickingSon, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    } else {
        c.drawImage(son2, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    }  
    
    //drawing player2
    player = state.players[1];
    if (player.kicking) {
        c.drawImage(kickingSon, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    } else {
        c.drawImage(son2, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    }   
};

function paintBall(ball){
    c.beginPath();
    c.arc(ball.position.x, ball.position.y, ball.size, 0, 2 * Math.PI);
    c.fillStyle = "red";
    c.fill();
    c.stroke();
};

function keydown(e){
    socket.emit("keydown", e.key);
}

function keyup(e){
    socket.emit("keyup", e.key);
}

function handleNewState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
};