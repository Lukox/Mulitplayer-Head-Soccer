module.exports = {
  createGameState,
  gameLoop,
  getNewDownVelocity,
  stopPlayerMovement,
};

function resetGameState(state) {
  let playerOne = state.players[0];
  let playerTwo = state.players[1];
  let ball = state.ball;

  playerOne.position = { x: 256, y: 100 };
  playerOne.velocity = { x: 0, y: 0 };
  playerOne.ArrowRight.pressed = false;
  playerOne.ArrowLeft.pressed = false;

  playerTwo.position = { x: 768, y: 100 };
  playerTwo.velocity = { x: 0, y: 0 };
  playerTwo.ArrowRight.pressed = false;
  playerTwo.ArrowLeft.pressed = false;

  ball.position = {x: 512, y: 200};
  ball.velocity = {x: 0, y: 0};

}

function createGameState() {
  return {
    players: [
      {
        position: {
          x: 256,
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
        colour: "red",
        mass: 1,
        radius: 50,
        kicking: false,
        goalsScored: 0,
      },
      {
        position: {
          x: 768,
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
        colour: "blue",
        mass: 1,
        radius: 50,
        kicking: false,
        goalsScored: 0,
      },
    ],
    ball: {
      position: {
        x: 512,
        y: 200,
      },
      velocity: {
        x: 0,
        y: 0,
      },

      size: 25,
      radius: 25,
      mass: 1,
      bounce: 0.9,
    },
    time: 0,
    leftGoal: {
      position: {
          x: 0,
          y: 420,
      },
      dimensions: {
          x: 0,
          y: 190,
          length: 90,
      },
    },
    rightGoal: {
      position: {
          x: 934,
          y: 420,
      },
      dimensions: {
          x: 0,
          y: 190,
          length: 90,
      },
    },
  };
}

//updates the game State and returns if someone won
function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  const ball = state.ball;
  const leftGoal = state.leftGoal;
  const rightGoal = state.rightGoal;

  updatePlayerPosition(playerOne);
  updatePlayerPosition(playerTwo);
  if (collision(playerOne, playerTwo)) {
    resolvePlayerCollision(playerOne, playerTwo);
  }
  if (playerOne.kicking) {
    kickRight(playerOne, ball);
    // console.log("player1 kicking");
  }
  if (playerTwo.kicking) {
    kickLeft(playerTwo, ball);
    // console.log("player2 kicking");
  }
  let player1Velocity = [0, 0];
  let player2Velocity = [0, 0];
  if (collision(playerOne, ball)) {
    player1Velocity = resolveCollision(playerOne, ball);
    // console.log(player1Velocity[1]);
  }
  if (collision(playerTwo, ball)) {
    player2Velocity = resolveCollision(playerTwo, ball);
    // console.log(player2Velocity[1]);
  }
  let resultantX = player1Velocity[0] + player2Velocity[0];
  let resultantY = player1Velocity[1] + player2Velocity[1];
  if (resultantX != 0) {
    ball.velocity.x = resultantX;
  }
  if (resultantY != 0) {
    ball.velocity.y = resultantY;
  }
  updateBall(ball, playerOne, playerTwo);

  // check for goal scored
  if(checkLeftGoal(ball, leftGoal)){
    resetGameState(state);
    playerTwo.goalsScored += 1;
  }

  if(checkRightGoal(ball, rightGoal)){
    resetGameState(state);
    playerOne.goalsScored += 1;
  }

  //checking for endgame
  if (state.time == 60 * 60) {
    // 60 seconds * frame rate then the game will endxdd
    return true;
  }
  state.time++;

  return false;
}

function checkLeftGoal(ball, goal){
  if(ball.position.x + ball.radius < goal.dimensions.length && ball.position.y - ball.radius> goal.position.y - goal.dimensions.y){
      return true;
  }else{
      return false;
  }
}

function checkRightGoal(ball, goal){
  if(ball.position.x + ball.radius > 1024 - goal.dimensions.length && ball.position.y - ball.radius> goal.position.y - goal.dimensions.y){
      return true;
  }else{
      return false;
  }
}

function getNewDownVelocity(key, state, playerNumber) {
  let player = state.players[playerNumber - 1];
  switch (key) {
    case "ArrowRight":
      player.ArrowRight.pressed = true;
      break;
    case "ArrowLeft":
      player.ArrowLeft.pressed = true;
      break;
    case "ArrowUp":
      if (player.position.y + player.radius >= 420) {
        player.velocity.y = -15;
      }
      break;
  }
}

function stopPlayerMovement(key, state, playerNumber) {
  let player = state.players[playerNumber - 1];
  switch (key) {
    case "ArrowRight":
      player.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      player.ArrowLeft.pressed = false;
      break;
    case "ArrowUp":
      break;
  }
}

function checkWallCollision(player1, player2) {
  if (player1.position.x - player1.radius < 0) {
    player1.position.x = player1.radius;
    player2.position.x = player1.radius + player1.size;
  }
  if (player1.position.x + player1.radius > 1024) {
    player1.position.x = 1024 - player1.radius;
    player2.position.x = 1024 - player1.radius - player1.size;
  }
  if (player2.position.x - player2.radius < 0) {
    player2.position.x = player2.radius;
    player1.position.x = player1.radius + player1.size;
  }
  if (player2.position.x + player2.radius > 1024) {
    player2.position.x = 1024 - player2.radius;
    player1.position.x = 1024 - player1.radius - player1.size;
  }
}

function resolvePlayerCollision(player1, player2) {
  let distanceX = player1.position.x - player2.position.x;
  let distanceY = player1.position.y - player2.position.y;
  let radii_sum = player1.radius + player2.radius;
  let length = Math.sqrt(distanceX * distanceX + distanceY * distanceY) || 1;
  let unitX = distanceX / length;
  let unitY = distanceY / length;
  if (Math.abs(player1.velocity.x) == Math.abs(player2.velocity.x)) {
    let midPoint = (player1.position.x + player2.position.x) / 2;
    player1.position.x = midPoint + player1.radius * unitX;
    player2.position.x = midPoint + player1.radius * -unitX;
  } else if (Math.abs(player1.velocity.x) > Math.abs(player2.velocity.x)) {
    player2.position.x = player1.position.x + (radii_sum + 1) * -unitX;
  } else {
    player1.position.x = player2.position.x + (radii_sum + 1) * unitX;
  }
  player1.position.y = player2.position.y + (radii_sum + 1) * unitY;
  if (player1.position.y + player1.radius > 420) {
    player1.position.y = 420 - player1.radius;
  }
  if (player2.position.y + player2.radius > 420) {
    player2.position.y = 420 - player2.radius;
  }
  checkWallCollision(player1, player2);
}

function updatePlayerPosition(player) {
  player.velocity.x = 0;
  if (player.ArrowRight.pressed) {
    player.velocity.x = 5;
  } else if (player.ArrowLeft.pressed) {
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

function updateBall(ball, playerOne, playerTwo) {
  let player1Velocity = [0, 0];
  let player2Velocity = [0, 0];
  if (collision(playerOne, ball)) {
    player1Velocity = resolveCollision(playerOne, ball);
  }
  if (collision(playerTwo, ball)) {
    player2Velocity = resolveCollision(playerTwo, ball);
  }
  let resultantX = player1Velocity[0] + player2Velocity[0];
  let resultantY = player1Velocity[1] + player2Velocity[1];
  if (resultantX != 0) {
    ball.velocity.x = resultantX;
  }
  if (resultantY != 0) {
    ball.velocity.y = resultantY;
  }

  //floor
  if (ball.position.y + ball.size + ball.velocity.y <= 420) {
    ball.velocity.y += 0.5;
  } else {
    ball.velocity.y = -ball.velocity.y * ball.bounce;
  }

  //side
  if (ball.position.x - ball.size <= 0 || ball.position.x + ball.size >= 1024) {
    ball.velocity.x *= -1 * ball.bounce;
    if (ball.velocity.x > 0) ball.position.x = ball.size;
    else ball.position.x = 1024 - ball.size;
  }

  //ceiling
  if (ball.position.y - ball.size <= 0) {
    ball.position.y = ball.size;
    ball.velocity.y *= -1 * ball.bounce;
  }

  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;
}

function collision(circle1, circle2) {
  let distanceX = circle1.position.x - circle2.position.x;
  let distanceY = circle1.position.y - circle2.position.y;
  let radiiSum = circle1.radius + circle2.radius;
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
    const angle = -Math.atan2(
      otherParticle.position.y - particle.position.y,
      otherParticle.position.x - particle.position.x
    );

    // Store mass in var for better readability in collision equations
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    const vFinal2 = rotate(v2, -angle);

    return [vFinal2.x, vFinal2.y];
  } else {
    return [0, 0];
  }
}

function rotate(vel, angle) {
  const rotatedVelocities = {
    x: vel.x * Math.cos(angle) - vel.y * Math.sin(angle),
    y: vel.x * Math.sin(angle) + vel.y * Math.cos(angle),
  };

  return rotatedVelocities;
}

function kickRight(player, ball) {
  if (
    ball.position.x <= player.position.x + player.size &&
    ball.position.x > player.position.x &&
    ball.position.y + ball.size >= player.position.y &&
    ball.position.y <= player.position.y + player.size + ball.size
  ) {
    ball.velocity.y = -13;
    ball.velocity.x *= -1;
    ball.velocity.x += 5;
  }
}

//2nd Player On right side
function kickLeft(player, ball) {
  if (
    ball.position.x >= player.position.x - player.size &&
    ball.position.x < player.position.x &&
    ball.position.y + ball.size >= player.position.y &&
    ball.position.y <= player.position.y + player.size + ball.size
  ) {
    ball.velocity.y = -13;
    ball.velocity.x *= -1;
    ball.velocity.x -= 5;
  }
}
