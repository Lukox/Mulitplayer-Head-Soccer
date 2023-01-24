const socket = io('http://localhost:3000');

const initialScreen = document.getElementById("initialScreen");
const joinRoomBtn = document.getElementById("joinRoom");
const roomInput = document.getElementById("roomInput");
const createLobbyBtn = document.getElementById("createLobby");
const waitScreen = document.getElementById("waitScreen");
const gameScreen = document.getElementById("gameScreen");
const timer = document.getElementById("timer");
const homeBtn = document.getElementById("home");
const rematchBtn = document.getElementById("rematch");
const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const readyScreen = document.getElementById("readyScreen");
const readyBtn = document.getElementById("readyButton");
const rematchScreen = document.getElementById("rematchScreen");
const waitRematchScreen = document.getElementById("waitRematchScreen");
const endScreen = document.getElementById("endScreen");
const acceptRematchBtn = document.getElementById("acceptRematch");
const declineRematchBtn = document.getElementById("declineRematch");

let canvas, c;
let time = 60;
let socketNumber;
let char1;
let char2;
let char1kick;
let char2kick;

//loading assets

//pitch
const pitch = document.createElement('img');
pitch.src = './assets/pitch_night.png';

//son
const son1 = document.createElement('img');
son1.src = './assets/son.png';
const son2 = document.createElement('img');
son2.src = './assets/son_flipped.png';
const kickingSon1 = document.createElement('img');
kickingSon1.src = './assets/kicking_son.png';
const kickingSon2 = document.createElement('img');
kickingSon2.src = './assets/kicking_son_flipped.png';

//benzema
const benzema1 = document.createElement('img');
benzema1.src = './assets/benzema_shoe_right.png';
const kickingBenzema1 = document.createElement('img');
kickingBenzema1.src = './assets/benzema_shoe_up_right.png';
const benzema2 = document.createElement('img');
benzema2.src = './assets/benzema_shoe_left.png';
const kickingBenzema2 = document.createElement('img');
kickingBenzema2.src = './assets/benzema_shoe_up_left.png';

//mbappe
const mbappe1 = document.createElement('img');
mbappe1.src = './assets/mbappe_shoe_right.png';
const kickingMbappe1 = document.createElement('img');
kickingMbappe1.src = './assets/mbappe_shoe_up_right.png';
const mbappe2 = document.createElement('img');
mbappe2.src = './assets/mbappe_shoe_left.png';
const kickingMbappe2 = document.createElement('img');
kickingMbappe2.src = './assets/mbappe_shoe_up_left.png';

//handling receiving msg
socket.on('newMsg', msg => {
    displayMsg(msg);
});

//handling updating the gamestate
socket.on("newState", handleNewState);

// handling joining room
socket.on('successJoinRoom', ()=> {
    initialScreen.style.display = "none";
    waitScreen.style.display = "none";
    waitRematchScreen.style.display = "none";
    rematchScreen.style.display = "none";
    readyScreen.style.display = "block";
    time = 60;
    readyBtn.disabled = false;
    // waitScreen.style.display = "block";
    // msg = "joined " + room;
    // displayMsg(msg);
    // init();
});

socket.on('rematchRequest', ()=>{
    endScreen.style.display = "none";
    rematchScreen.style.display = "block";
});

socket.on("number", number=>{
    socketNumber = number;
});

socket.on('startGame', (chars)=>{
    readyScreen.style.display = "none";
    assignChars(chars);
    init();
});

socket.on('roomFull', () => {
    alert("room full");
});

socket.on('roomNoExists', () => {
    alert("room doesnt exist");
});

//handling creating room
socket.on('createdRoom', data => {
    initialScreen.style.display = "none";
    waitScreen.style.display = "block";
    msg = "Your room code: " + data.room;
    displayMsg(msg);
    socketNumber = data.number;
    // init();
});

socket.on("restartClient", ()=>{
    location.reload();
});

// socket.on('removeWait', () => {
//     waitScreen.style.display = "none";
// });

socket.on('gameOver', (victor) => {
    gameScreen.style.display = 'none';
    endScreen.style.display = 'block';
    let victoryMsg = "winner: " + victor;
    document.getElementById('victoryMsg').innerHTML = victoryMsg;
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

homeBtn.addEventListener("click", function(e){
    location.reload()
    return false;
});

rematchBtn.addEventListener("click", function(e){
    socket.emit("rematch");
    //change to waiting for rematch screen
    endScreen.style.display = "none";
    waitRematchScreen.style.display = "block";
});

acceptRematchBtn.addEventListener("click", function(e){
    socket.emit("rematchAccepted");
});

declineRematchBtn.addEventListener("click", function(e){
    socket.emit("rematchDeclined");
    location.reload();
    return false;
});

readyBtn.addEventListener("click", function(e){
    let val;
    var ele = document.getElementsByName('playerSelect');
    for (let i = 0; i  < ele.length; i++) {
        if (ele[i].checked) {
            val = ele[i].value;
        }
    }
    socket.emit("playerReady", val);
    readyBtn.disabled = true;
});

//displaying messages on screen
function displayMsg(msg) {
    let item = document.createElement('p');
    item.innerHTML = msg;
    document.getElementById("message").append(item);
}

function init() {
    gameScreen.style.display = 'block';
    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 500;

    // console.log(c);
    
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
}

//code for game to be integrated

function paintGame(state) {
    //update timer
    if(state.time % 60 === 0){
        time--;
        timer.innerText = time;
    }

    //updating score
    let scoreMsg = state.players[0].goalsScored;
    score1.innerHTML = scoreMsg;
    scoreMsg = state.players[1].goalsScored;
    score2.innerHTML = scoreMsg

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
        c.drawImage(char1kick, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    } else {
        c.drawImage(char1, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    }  
    
    //drawing player2
    player = state.players[1];
    if (player.kicking) {
        c.drawImage(char2kick, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
    } else {
        c.drawImage(char2, player.position.x - player.radius, player.position.y - player.radius, player.size, player.size);   
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

function assignChars(chars){
    switch (chars.c1) {
        case "1":
            char1 = son1;
            char1kick = kickingSon1
            break;
        case "2":
            char1 = benzema1;
            char1kick = kickingBenzema1;
            break;
        case "3":
            char1 = mbappe1;
            char1kick = kickingMbappe1;
            break;
        default:
            break;
    }

    //used flipped for c2 

    switch (chars.c2) {
        case "1":
            char2 = son2;
            char2kick = kickingSon2
            break;
        case "2":
            char2 = benzema2;
            char2kick = kickingBenzema2;
            break;
        case "3":
            char2 = mbappe2;
            char2kick = kickingMbappe2;
            break;
        default:
            break;
    }

    // console.log({char1, char2});
}
