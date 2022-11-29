module.exports = {
    createGameState,
    gameLoop,
    getNewDownVelocity,
    stopPlayerMovement,
}

function createGameState() {
    return {
        players: [{
            position: {
                x: 100,
                y: 100,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            ArrowRight: {
                    pressed: false,
            },
            ArrowLeft: {
                pressed: false,
            },
            size: 100,
            colour: 'red',
            mass: 1,
            radius: 50,
        },{
            position: {
                x: 400,
                y: 100,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            ArrowRight: {
                pressed: false,
            },
            ArrowLeft: {
                pressed: false,
            },
            size: 100,
            colour: 'blue', 
            mass: 1,
            radius: 50,           
        }],
        ball: {
            position: {
                x: 200,
                y: 200,
            },
            velocity: {
                x: 5,
                y: 0,
            },
    
            size: 25,
            mass: 1,
            bounce: 0.9,
        },
    };
};


//updates the game State and returns if someone won
function gameLoop(state){
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];
    const ball = state.ball;

    updatePlayer(playerOne, ball);
    updatePlayer(playerTwo, ball);
    updateBall(ball);
    
    //no winning implemented so always just continue    
    return false;
};


function getNewDownVelocity(key, state, playerNumber) {

    let player = state.players[playerNumber - 1];
    switch (key) {
        case 'ArrowRight':
            player.ArrowRight.pressed = true;
            break;   
        case 'ArrowLeft':
            player.ArrowLeft.pressed = true;
            break;   
        case 'ArrowUp':
            if (player.position.y + player.radius== 500){
                player.velocity.y = -15;
            }
            break;
    }
}

function stopPlayerMovement(key, state, playerNumber){
    let player = state.players[playerNumber - 1];
    switch (key) {
        case 'ArrowRight':
            player.ArrowRight.pressed = false;
            break;   
        case 'ArrowLeft':
            player.ArrowLeft.pressed = false;
            break;   
        case 'ArrowUp':
            break;
    }
}

function updatePlayer(playerOne, ball){
    playerOne.velocity.x = 0;
    if(playerOne.ArrowRight.pressed){
        playerOne.velocity.x = 5;
    } else if (playerOne.ArrowLeft.pressed){
        playerOne.velocity.x = -5;
    }

    //horizontal
    if (playerOne.velocity.x >= 0) {
        if (playerOne.position.x < 1024 - playerOne.radius) {
            playerOne.position.x += playerOne.velocity.x;   
        }   
    } else {
        if (playerOne.position.x > 0 + playerOne.radius) {
            playerOne.position.x += playerOne.velocity.x;   
        }         
    }

    if (collision(ball, playerOne)) {
        resolveCollision(playerOne, ball);
    }

    //gravity
    playerOne.position.y += playerOne.velocity.y;
    if (playerOne.position.y + playerOne.radius + playerOne.velocity.y < 500) {
        playerOne.velocity.y += 0.5;
    } else {
        playerOne.velocity.y = 0;
    }
};

function updateBall(ball) {
        ball.position.x += ball.velocity.x;

        //floor
        if(ball.position.y + ball.size + ball.velocity.y <= 500){
            ball.velocity.y += 0.5;
        } else {
            ball.velocity.y = -ball.velocity.y * ball.bounce;
        }
        ball.position.y += ball.velocity.y;
    
        //side
        if(ball.position.x -ball.size <= 0 || ball.position.x+ball.size >= 1024){
            ball.velocity.x *= -1 * ball.bounce;
            if(ball.velocity.x > 0)
                ball.position.x = ball.size;
            else ball.position.x = 1024-ball.size;
        }

        //ceiling



};

function collision(ball, player) {

    if ((player.radius + ball.size) > Math.sqrt(Math.pow(player.position.x - ball.position.x, 2) + Math.pow(player.position.y - ball.position.y, 2))) {
        return true;
    } else {
        return false;
    }
  
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.position.x - particle.position.x;
    const yDist = otherParticle.position.y - particle.position.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.position.y - particle.position.y, otherParticle.position.x - particle.position.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        const vFinal2 = rotate(v2, -angle);
        
        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

function rotate(vel, angle) {
    const rotatedVelocities = {
        x: vel.x * Math.cos(angle) - vel.y * Math.sin(angle),
        y: vel.x * Math.sin(angle) + vel.y * Math.cos(angle)
    };

    return rotatedVelocities;
}