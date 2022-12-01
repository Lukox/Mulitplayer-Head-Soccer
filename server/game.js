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
                prevX: 100,
                prevY: 100,
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
            kicking: false,
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
            kicking: false,         
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
            radius: 25,
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
    updatePlayerPosition(playerOne);
    //playerOne.velocity.x = 5;
    //playerOne.position.x +=5;
    updatePlayerPosition(playerTwo);
    if(collision(playerOne, playerTwo)){
        resolvePlayerCollision(playerOne, playerTwo);
    }
    //forget below
    updateBall(ball);
    while(collision(playerOne, ball) || collision(playerTwo, ball)){
        if(collision(playerOne, ball)){
            resolveCollision(playerOne, ball);
        }
        if(collision(playerTwo, ball)){
            resolveCollision(playerTwo, ball);   
        }
    }

    /*if (playerOne.kicking) {
        kickRight(playerOne, ball);
        // console.log("player1 kicking");
    }
    if (playerTwo.kicking) {
        kickLeft(playerTwo, ball);
        // console.log("player2 kicking");
    }
    updatePlayer(playerOne, ball);
    updatePlayer(playerTwo, ball);
    updateBall(ball);
    
    //no winning implemented so always just continue    
    return false;*/
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
            if (player.position.y + player.radius >= 420){
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

function checkWallCollision(player1, player2){
    if(player1.position.x - player1.radius < 0){
        player1.position.x = player1.radius;
        player2.position.x = player1.radius + player1.size;
    }
    if(player1.position.x + player1.radius > 1024){
        player1.position.x = 1024-player1.radius;
        player2.position.x = 1024-player1.radius - player1.size;
    }
    if(player2.position.x - player2.radius < 0){
        player2.position.x = player2.radius;
        player1.position.x = player1.radius + player1.size;
    }
    if(player2.position.x + player2.radius > 1024){
        player2.position.x = 1024-player2.radius;
        player1.position.x = 1024-player1.radius - player1.size;
    }
}

function resolvePlayerCollision(player1, player2){
    let distanceX = player1.position.x - player2.position.x;
    let distanceY = player1.position.y - player2.position.y;
    let radii_sum  = player1.radius + player2.radius;
    let length = Math.sqrt(distanceX * distanceX + distanceY * distanceY) || 1;
    let unitX = distanceX / length;
    let unitY = distanceY / length;
    if(Math.abs(player1.velocity.x) == Math.abs(player2.velocity.x)){
        let midPoint = (player1.position.x + player2.position.x)/2;
        player1.position.x = midPoint + player1.radius * unitX;
        player2.position.x = midPoint + player1.radius * -unitX;
    }else if(Math.abs(player1.velocity.x) > Math.abs(player2.velocity.x)){
        player2.position.x = player1.position.x + (radii_sum + 1) * -unitX;
    }else{
        player1.position.x = player2.position.x + (radii_sum + 1) * unitX;
    }
    player1.position.y = player2.position.y + (radii_sum + 1) * unitY;
    if(player1.position.y + player1.radius > 420){
        player1.position.y  = 420 - player1.radius;
    }
    if(player2.position.y + player2.radius > 420){
        player2.position.y  = 420 - player2.radius;
    }
    checkWallCollision(player1,player2);
}

function updatePlayerPosition(player){
    player.velocity.x = 0;
    if(player.ArrowRight.pressed){
        player.velocity.x = 5;
    } else if (player.ArrowLeft.pressed){
        player.velocity.x = -5;
    }
    //horizontal
    if (player.velocity.x >= 0) {
        if (player.position.x < 1024 - player.radius) {
            player.position.x += player.velocity.x;   
        }   
    } else {
        if (player.position.x > 0 + player.radius) {
            player.position.x += player.velocity.x;   
        }         
    }

    //vertical
    player.position.y += player.velocity.y;
    if (player.position.y + player.radius + player.velocity.y < 420) {
        player.velocity.y += 0.5;
    } else {
        player.velocity.y = 0;
    }
}

function updateBall(ball) {
        ball.position.x += ball.velocity.x;
        //floor
        if(ball.position.y + ball.size + ball.velocity.y <= 420){
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
        if(ball.position.y - ball.size <= 0){
            ball.position.y = ball.size;
            ball.velocity.y *= -1 * ball.bounce;
        }
};

function collision(circle1, circle2) {
    let distanceX = circle1.position.x - circle2.position.x;
    let distanceY = circle1.position.y - circle2.position.y;
    let radiiSum  = circle1.radius + circle2.radius;
    if (distanceX * distanceX + distanceY * distanceY <= radiiSum * radiiSum) 
        return true;
    return false;
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

function kickRight(player, ball){
    if(ball.position.x <= player.position.x +player.size && ball.position.x > player.position.x && ball.position.y + ball.size >= player.position.y && ball.position.y <= player.position.y + player.size + ball.size){
        ball.velocity.y = Math.abs(ball.velocity.y) + 6;
        ball.velocity.x *= -1;
        ball.velocity.x += 10;
    }
}
    
//2nd Player On right side
function kickLeft(player, ball){
    if(ball.position.x >= player.position.x - player.size && ball.position.x < player.position.x && ball.position.y + ball.size >= player.position.y && ball.position.y <= player.position.y + player.size + ball.size){
        ball.velocity.y = ball.velocity.y + 10;
        ball.velocity.x *= -1;
        ball.velocity.x -= 10;
    }
}