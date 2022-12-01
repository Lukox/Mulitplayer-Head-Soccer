const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.5;
const bounce = 0.9
const ballRadius = 25;

const playerImg = document.createElement('img');
playerImg.src = 'son2.png';
playerImg.style.borderRadius = '50%';

const player2Img = document.createElement('img');
player2Img.src = 'son1.png';
player2Img.style.borderRadius = "50%";

let currPlayerImg = playerImg;

const player = new Player({
    x: 100,
    y: 100,
});

const ball = new Ball({
    x:300,
    y: 100,
});

const keys = {
    ArrowRight: {
        pressed: false,
    },
    ArrowLeft: {
        pressed: false,
    },
    Space: {
        pressed: false,
    },
}

function rotate(vel, angle) {
    const rotatedVelocities = {
        x: vel.x * Math.cos(angle) - vel.y * Math.sin(angle),
        y: vel.x * Math.sin(angle) + vel.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.vel.x - otherParticle.vel.x;
    const yVelocityDiff = particle.vel.y - otherParticle.vel.y;

    const xDist = otherParticle.position.x - particle.position.x;
    const yDist = otherParticle.position.y - particle.position.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.position.y - particle.position.y, otherParticle.position.x - particle.position.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.vel, angle);
        const u2 = rotate(otherParticle.vel, angle);

        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        const vFinal2 = rotate(v2, -angle);

        otherParticle.vel.x = vFinal2.x;
        otherParticle.vel.y = vFinal2.y;
    }
}

function animate(){
    window.requestAnimationFrame(animate);
    c.fillStyle='pink';
    c.fillRect(0,0,canvas.width,canvas.height); 
    player.update(); 
    ball.update();
    if(ball.collision(player)){
        resolveCollision(player, ball);
    }
    player.vel.x = 0;
    if(keys.ArrowRight.pressed){
        if(player.position.x >= -player.height && player.position.x <= canvas.width - player.height){
            player.vel.x = 5;
        }
    } else if (keys.ArrowLeft.pressed){
        if(player.position.x - 2*ballRadius >= 0 && player.position.x <= canvas.width){
            player.vel.x = -5;
        }
    }
}

function kick(){
    if(ball.position.x <= player.position.x +player.size && ball.position.x > player.position.x && ball.position.y + ballRadius >= player.position.y && ball.position.y <= player.position.y + player.size + ballRadius){
        ball.vel.y = ball.vel.y + 10
        ball.vel.x *= -1;
        ball.vel.x += 10;
    }

    
    /*2nd Player On right side

    if(ball.position.x >= player.position.x - player.size && ball.position.x < player.position.x && ball.position.y + ballRadius >= player.position.y && ball.position.y <= player.position.y + player.size + ballRadius){
        ball.vel.y = Math.abs(ball.vel.y) + 10
        ball.vel.x *= -1;
        ball.vel.x -= 10;
    }
    */
    

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
        case 'ArrowUp':
            if(player.position.y == (canvas.height - player.height)){
                player.vel.y = -15;
            } 
            break;
        case ' ':
            currPlayerImg = player2Img
            kick()
    }
})

window.addEventListener('keyup', (event) =>{ 
    switch(event.key){
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case ' ':
            currPlayerImg = playerImg;
            break;
    }
})