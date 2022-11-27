module.exports = {
    createGameState,
    gameLoop,
    getNewVelocity,

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
    
            size: 100,
            colour: 'red',
        },{
            position: {
                x: 400,
                y: 100,
            },
            velocity: {
                x: 0,
                y: 0,
            },
    
            size: 100,
            colour: 'blue',            
        }]
    };
};


//updates the game State and returns if someone won
function gameLoop(state){
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];
    playerOne.position.x += playerOne.velocity.x;
    playerOne.position.y += playerOne.velocity.y;
    playerTwo.position.x += playerTwo.velocity.x;
    playerTwo.position.y += playerTwo.velocity.y;
    //no gravity for now

    //no winning implemented so always just continue
    return false;
};

function getNewVelocity(keyCode) {

    switch (keyCode) {
        case 37: //left
            return { x: -10, y: 0};
        case 38: //down
            return { x: 0, y: -10};
        case 39: //right
            return { x: 10, y: 0};
        case 40: //up
            return { x: 0, y: 10};
    }
}