const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.5;

class Player{
    constructor(position){
        this.position = position;
        this.vel = {
            x: 0,
            y: 1,
        }
        this.height = 100;
    }

    draw(){
        c.fillStyle = 'red';
        c.fillRect(this.position.x,this.position.y,100,this.height);
    }

    update(){
        this.draw();
        this.position.x += this.vel.x;
        this.position.y += this.vel.y;
        if(this.position.y + this.height + this.vel.y< canvas.height)
            this.vel.y += gravity;
        else this.vel.y = 0;

    }
}


const player = new Player({
    x: 100,
    y: 100,
});

const keys = {
    ArrowRight: {
        pressed: false,
    },
    ArrowLeft: {
        pressed: false,
    },
}

function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0,0,canvas.width,canvas.height);   
    player.update(); 
    player.vel.x = 0.5;
    if(keys.ArrowRight.pressed)
        player.vel.x = 5;
    else if (keys.ArrowLeft.pressed)
        player.vel.x = -5;
}

animate();

window.addEventListener('keydown', (event) =>{
    console.log(event); 
    switch(event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case ' ':
            player.vel.y = -15;
            break;
    }
})

window.addEventListener('keyup', (event) =>{
    console.log(event); 
    switch(event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
})