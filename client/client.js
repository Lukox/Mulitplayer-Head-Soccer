const socket = io('http://localhost:3000');

const initialScreen = document.getElementById("initialScreen");
const joinRoomBtn = document.getElementById("joinRoom");
const roomInput = document.getElementById("roomInput");
const createLobbyBtn = document.getElementById("creatLobby");
const createGameBtn = document.getElementById("createGame");
const waitScreen = document.getElementById("waitScreen");

//handling receiving msg
socket.on('newMsg', msg => {
    displayMsg(msg);
});

//handling updating the gamestate
socket.on("newState", handleNewState);

// handling joining room
socket.on('successJoinRoom', room => {
    initialScreen.style.display = "none";
    waitScreen.style.display = "block";
    msg = "joined " + room;
    displayMsg(msg);
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
    msg = "joined " + room;
    displayMsg(msg);
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



//code for game to be integrated
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

document.addEventListener('keydown', keydown);

canvas.width = 1024;
canvas.height = 500;

function paintGame(state) {
    c.fillStyle = 'white';
    c.fillRect(0,0,canvas.width,canvas.height);  
    
    paintPlayer(state.players[0]);
    paintPlayer(state.players[1]);
};

function paintPlayer(player) {
    c.fillStyle = player.colour;
    c.fillRect(player.position.x, player.position.y, player.size, player.size);
};

function keydown(e){
    socket.emit("keydown", e.keyCode);
    // console.log(e.key);
}

function handleNewState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
};

//original below

// const gravity = 0.5;

// class Player{
//     constructor(position){
//         this.position = position;
//         this.vel = {
//             x: 0,
//             y: 1,
//         }
//         this.height = 100;
//     }

//     draw(){
//         c.fillStyle = 'red';
//         c.fillRect(this.position.x,this.position.y,100,this.height);
//     }

//     update(){
//         this.draw();
//         this.position.x += this.vel.x;
//         this.position.y += this.vel.y;
//         if(this.position.y + this.height + this.vel.y< canvas.height)
//             this.vel.y += gravity;
//         else this.vel.y = 0;

//     }
// }

// class Ball{
//     constructor(position){
//         this.position = position;
//         this.vel = {
//             x: 0,
//             y: 1,
//         }
//         this.height = 25;
//     }

//     draw() {
//         c.beginPath();
//         c.arc(this.position.x, this.position.y, 25, 0, 2 * Math.PI);
//         c.fillStyle = "green";
//         c.fill();
//         c.stroke();
//       }

//     update(){
//         this.draw();
//         this.position.x += this.vel.x;
//         this.position.y += this.vel.y;
//         if(this.position.y +this.height+ this.vel.y< canvas.height)
//             this.vel.y += gravity;
//         else this.vel.y = 0;
//     }
// }


// const player = new Player({
//     x: 100,
//     y: 100,
// });

// const ball = new Ball({
//     x:300,
//     y: 100,
// });


// const keys = {
//     ArrowRight: {
//         pressed: false,
//     },
//     ArrowLeft: {
//         pressed: false,
//     },
// }

// function animate(){
//     window.requestAnimationFrame(animate);
//     c.fillStyle = 'white';
//     c.fillRect(0,0,canvas.width,canvas.height);   
//     player.update(); 
//     // ball.update();
//     player.vel.x = 0;
//     if(keys.ArrowRight.pressed){
//         if(player.position.x >= -player.height && player.position.x <= canvas.width - player.height){
//             player.vel.x = 5;
//         }
//     } else if (keys.ArrowLeft.pressed){
//         if(player.position.x >= 0 && player.position.x <= canvas.width){
//             player.vel.x = -5;
//         }
//     }
// }

// window.addEventListener('keydown', (event) =>{
//     console.log(event); 
//     switch(event.key){
//         case 'ArrowRight':
//             keys.ArrowRight.pressed = true;
//             break;
//         case 'ArrowLeft':
//             keys.ArrowLeft.pressed = true;
//             break;
//         case 'ArrowUp':
//             if(player.position.y == (canvas.height - player.height)){
//                 player.vel.y = -17;
//             } 
//             break;
//     }
// })

// window.addEventListener('keyup', (event) =>{
//     console.log(event); 
//     switch(event.key){
//         case 'ArrowRight':
//             keys.ArrowRight.pressed = false;
//             break;
//         case 'ArrowLeft':
//             keys.ArrowLeft.pressed = false;
//             break;
//     }
// })
