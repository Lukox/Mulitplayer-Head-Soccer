module.exports = {
  createGameState,
  gameLoop,
  getNewDownVelocity,
  stopPlayerMovement,
  resetGameState,
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
        mass: 2,
        radius: 50,
        kicking: false,
        goalsScored: 0,
        ready: false,
        char: 1,
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
        mass: 2,
        radius: 50,
        kicking: false,
        goalsScored: 0,
        ready: false,
        char: 1,
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
          y: 180,
          length: 90,
          crossbarHeight: 5,
      },
    },
    rightGoal: {
      position: {
          x: 934,
          y: 420,
      },
      dimensions: {
          x: 0,
          y: 180,
          length: 90,
          crossbarHeight: 5,
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

  resolvePlayerCrossbarCollision(playerOne, playerTwo, leftGoal, rightGoal);

  if(leftCrossbarCollision(ball, leftGoal)){
    collisionResponse(ball, leftGoal);
  }
  if(rightCrossbarCollision(ball, rightGoal)){
    collisionResponse(ball, rightGoal);
  }

  if (collision(playerOne, playerTwo)) {
    resolvePlayerCollision(playerOne, playerTwo);
  }
  if (playerOne.kicking) {
    kickRight(playerOne, ball);
    // mconsole.log("player1 kicking");
  }
  if (playerTwo.kicking) {
    kickLeft(playerTwo, ball);
    // console.log("player2 kicking");
  }
  if (collision(playerOne, ball)) {
    resolveCollision(playerOne, ball);
  }
  if (collision(playerTwo, ball)) {
    resolveCollision(playerTwo, ball);
  }

  updateBall(ball, leftGoal, rightGoal);
  checkWall(ball, playerOne, playerTwo);

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
function resolvePlayerCrossbarCollision(player1, player2, leftGoal, rightGoal){
  if(leftCrossbarCollision(player1, leftGoal)){
    playerLeftGoalResponse(player1, leftGoal);
  }
  if(rightCrossbarCollision(player1, rightGoal)){
    playerRightGoalResponse(player1, rightGoal);
  }
  if(leftCrossbarCollision(player2, leftGoal)){
    playerLeftGoalResponse(player2, leftGoal);
  }
  if(rightCrossbarCollision(player2, rightGoal)){
    playerRightGoalResponse(player2, rightGoal);
  }

}

function playerRightGoalResponse(player, goal){
  if(player.velocity.y < 0 && player.position.y <= goal.position.y + goal.dimensions.y - goal.dimensions.crossbarHeight && player.position.x + player.radius/2 > goal.position.x){
    player.position.y = goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight + player.radius + 1;
    player.velocity.y = 0;
  }
  if(player.position.y <= goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight && player.position.x + player.radius/2 > goal.position.x){
    player.velocity.y = 0;
    player.position.y = goal.position.y - goal.dimensions.y - player.radius;
  }
  if(player.position.y > goal.position.y - goal.dimensions.y - player.radius && player.position.y < goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight + player.radius && player.position.x < goal.position.x - player.radius/2 + 2){
    player.position.x = goal.position.x - player.radius - 1;
  }
}

function playerLeftGoalResponse(player, goal){
  if(player.velocity.y < 0 && player.position.y <= goal.position.y + goal.dimensions.y - goal.dimensions.crossbarHeight && player.position.x - player.radius/2< goal.dimensions.length){
    player.position.y = goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight + player.radius + 1;
    player.velocity.y = 0;
  }
  if(player.position.y <= goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight && player.position.x - player.radius/2< goal.dimensions.length){
    player.velocity.y = 0;
    player.position.y = goal.position.y - goal.dimensions.y - player.radius;
  }
  if(player.position.y > goal.position.y - goal.dimensions.y - player.radius && player.position.y < goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight + player.radius && player.position.x > goal.dimensions.length + player.radius/2 - 2){
    player.position.x = goal.dimensions.length + player.radius + 1;
  }
  
}

function leftCrossbarCollision(ball, goal)
{
    let goalX = goal.dimensions.x + (goal.dimensions.length/2);
    let goalY = goal.position.y - goal.dimensions.y + (goal.dimensions.crossbarHeight/2);

    let circleDistanceX = Math.abs(ball.position.x - goalX);
    let circleDistanceY = Math.abs(ball.position.y - goalY);

    if (circleDistanceX > (goal.dimensions.length/2 + ball.radius)) { return false; }
    if (circleDistanceY > (goal.dimensions.crossbarHeight/2 + ball.radius)) { return false; }

    if (circleDistanceX <= (goal.dimensions.length/2)) { return true; } 
    if (circleDistanceY <= (goal.dimensions.crossbarHeight/2)) { return true; }

    let cornerDistance_sq = (circleDistanceX - goal.dimensions.length/2)*(circleDistanceX - goal.dimensions.length/2) + (circleDistanceY - goal.dimensions.crossbarHeight/2)*(circleDistanceY - goal.dimensions.crossbarHeight/2);
    return (cornerDistance_sq <= (ball.radius*ball.radius));
}

function rightCrossbarCollision(ball, goal){
  let goalX = goal.position.x + (goal.dimensions.length/2);
  let goalY = goal.position.y - goal.dimensions.y + (goal.dimensions.crossbarHeight/2);

  let circleDistanceX = Math.abs(ball.position.x - goalX);
  let circleDistanceY = Math.abs(ball.position.y - goalY);

  if (circleDistanceX > (goal.dimensions.length/2 + ball.radius)) { return false; }
  if (circleDistanceY > (goal.dimensions.crossbarHeight/2 + ball.radius)) { return false; }

  if (circleDistanceX <= (goal.dimensions.length/2)) { return true; } 
  if (circleDistanceY <= (goal.dimensions.crossbarHeight/2)) { return true; }

  let cornerDistance_sq = (circleDistanceX - goal.dimensions.length/2)*(circleDistanceX - goal.dimensions.length/2) + (circleDistanceY - goal.dimensions.crossbarHeight/2)*(circleDistanceY - goal.dimensions.crossbarHeight/2);
  return (cornerDistance_sq <= (ball.radius*ball.radius));
}

function collisionResponse(ball, goal){
  if(ball.position.y <= goal.position.y - goal.dimensions.y + goal.dimensions.crossbarHeight || ball.position.y >= goal.position.y + goal.dimensions.y){
    ball.velocity.y = ball.velocity.y * -1;
  }
  if(ball.position.x >= goal.position.x + goal.dimensions.length || ball.position.x <= goal.position.x){
    if(goal.position.x == 0 && ball.velocity.x < 0){
      ball.velocity.x = ball.velocity.x * -1;
    }else if(goal.position.x != 0 && ball.velocity.x > 0){
      ball.velocity.x = ball.velocity.x *= -1;
    }
  }
}

function checkLeftGoal(ball, goal){
  if(ball.position.x + ball.radius < goal.dimensions.length && ball.position.y - ball.radius> goal.position.y - goal.dimensions.y){
      return true;
  }else{
      return false;
  }
}

function checkRightGoal(ball, goal){
  if(ball.position.x - ball.radius > 1024 - goal.dimensions.length && ball.position.y - ball.radius> goal.position.y - goal.dimensions.y ){
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
      if (player.position.y + player.radius >= 420 ) {
        player.velocity.y = -13.5;
        return
      }
      if(player.position.x - player.radius/2 < 90 && player.position.y + player.radius > 230 && player.position.y + player.radius < 250){
        player.velocity.y = -13.5;
        return
      }  
      if(player.position.x + player.radius/2 > 934 && player.position.y + player.radius > 230 && player.position.y + player.radius < 250){
        player.velocity.y = -13.5;
        return
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

function checkWall(ball, player1, player2){
  if(player1.position.x - player1.radius < 0){
    let diff = -(player1.position.x - player1.radius) ;
    player1.position.x = player1.radius;
    ball.position.x += diff;
    if(collision(ball, player2)){
      player2.position.x += diff;
    }
  }
  if(player1.position.x + player1.radius > 1024){
    let diff = player1.position.x + player1.radius - 1024;
    player1.position.x = 1024 - player1.radius;
    ball.position.x -= diff;
    if(collision(ball, player2)){
      player2.position.x -= diff;
    }
  }
  if(player2.position.x - player2.radius < 0){
    let diff = -(player2.position.x - player2.radius) ;
    player2.position.x = player2.radius;
    ball.position.x += diff;
    if(collision(ball, player1)){
      player1.position.x += diff;
    }
  }
  if(player2.position.x + player2.radius > 1024){
    let diff = player2.position.x + player2.radius - 1024;
    player2.position.x = 1024 - player2.radius;
    ball.position.x -= diff;
    if(collision(ball, player1)){
      player1.position.x -= diff;
    }
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

function resolveCollision(player, ball, player2)
{
    // get the mtd
    let xdiff = player.position.x - ball.position.x;
    let ydiff = player.position.y - ball.position.y;
    let d = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
    // minimum translation distance to push balls apart after intersecting
    let xmtd = xdiff*(((player.radius + ball.radius)-d)/d);
    let ymtd = ydiff*(((player.radius + ball.radius)-d)/d);
    // resolve intersection --
    // inverse mass quantities
    let im1 = 1/player.mass;
    let im2 = 1/ball.mass;

    // push-pull them apart based off their mass
    player.position.x += (xmtd*(im1 / (im1 + im2)));
    player.position.y += (ymtd*(im1 / (im1 + im2)));
    //position = position.add(mtd.multiply(im1 / (im1 + im2)));
    ball.position.x -= (xmtd*(im2 / (im1 + im2)));
    ball.position.y -= (ymtd*(im2 / (im1 + im2)));
    if(player.position.y + player.radius> 420){
      let diff = player.position.y + player.radius - 420;
      player.position.y -= diff;
      ball.position.y -= diff;
    }
    if(ball.position.y + ball.radius > 420){
      ball.position.y = 420 - ball.radius;
    }

    // impact speed
    let xveldiff = player.velocity.x - ball.velocity.x;
    let yveldiff = player.velocity.y - ball.velocity.y;
    let len = Math.sqrt(xmtd*xmtd + ymtd*ymtd);
		if (len != 0.0){
      xmtd = xmtd / len;
      ymtd = ymtd / len;
		}
		else
		{
      xmtd = 0.0;
      ymtd = 0.0;
		}
    let vn = xveldiff * xmtd + yveldiff * ymtd;

    // sphere intersecting but moving away from each other already
    if (vn > 0.0) return;

    // collision impulse
    let i = (-(1.0 + ball.bounce) * vn) / (im1 + im2);
    len = Math.sqrt(xmtd*xmtd + ymtd*ymtd);
		if (len != 0.0){
      xmtd = xmtd / len;
      ymtd = ymtd / len;
		}
		else
		{
      xmtd = 0.0;
      ymtd = 0.0;
		}
    let ximpulse = xmtd * i;
    let yimpulse = ymtd * i;

    // change in momentum
    //this.velocity = this.velocity.add(impulse.multiply(im1));
    ball.velocity.x -= (ximpulse * im2);
    ball.velocity.y -= (yimpulse * im2);
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

function updateBall(ball, leftGoal, rightGoal) {
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


function kickRight(player, ball) {
  if (
    ball.position.x <= player.position.x + player.size &&
    ball.position.x > player.position.x &&
    ball.position.y + ball.size >= player.position.y &&
    ball.position.y <= player.position.y + player.size + ball.size
  ) {
    ball.velocity.y = -6;
    ball.velocity.x = Math.abs(ball.velocity.x);
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
    ball.velocity.y = -6;
    ball.velocity.x = -Math.abs(ball.velocity.x);
    ball.velocity.x -= 5;
  }
}