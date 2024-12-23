const displayController = (()=>{
    const renderMessage = (message) =>{
        document.querySelector("#message").innerHTML = message;
    }
    return {
        renderMessage
    }
})();


const Gameboard = (()=>{
    let gameboard = Array(9).fill("");
    

    const render = ()=>{
        let boardHTML = "";
        
        gameboard.forEach((cell,index) => {
            boardHTML += `<div class="cell" id="cell-${index}">${cell}</div>`
        })
        document.querySelector("#gameboard").innerHTML = boardHTML;

        const cells = document.querySelectorAll(".cell");
        cells.forEach((cell)=> {
            cell.addEventListener("click", Controller.handleClick);
        });
    };

    const update = (index, value) => {
        gameboard[index] = value;
        render();
    }
    const reset = ()=>{
        gameboard.fill("");
        render();
    }
    const getGameboard = ()=> gameboard


    return {
        render,
        update,
        reset,
        getGameboard
    }
})();

const createPlayer = (name, symbol, isComputer = false) => {
    return {
        name,
        symbol,
        isComputer
    };
};

const Controller = (()=>{
    let players = [];
    let currentPlayerIndex;
    let gameOver;
    let vsComputer = false;
    let difficulty = "easy"; //default
    
    const setComputerDifficulty = (level) =>{
         difficulty = level;
    }
    

    const startGame = ()=>{

        const player1Name = document.querySelector("#player1").value || "Player 1";
        const player2Name = document.querySelector("#player2").value || "Player 2";
        const playWithComputer = document.querySelector("#vsComputer").checked;

        players = [
            createPlayer(player1Name, "X"),
            playWithComputer ? createPlayer("Computer", "O", true) : createPlayer(player2Name, "O")
        ];

        currentPlayerIndex=0;
        gameOver = false;
        vsComputer = playWithComputer;

        Gameboard.render();
        displayController.renderMessage(`${players[0].name}'s turn`);
        
    }

    const restartGame = (()=> {
        Gameboard.reset();
        document.querySelector("#message").innerHTML = "";
        gameOver = false;
        startGame();
    })

    const handleClick = (event)=>{
        if (gameOver) return;

        if (players[currentPlayerIndex].isComputer) return;         // Ensure it's the player's turn


        let index = event.target.id.split("-")[1]; //get the index of the cell-X

        if (Gameboard.getGameboard()[index] !== "") return;
        
        makeMove(index);
        
        if (!gameOver && players[currentPlayerIndex].isComputer) {
            setTimeout(() => {
                computerMove();
            }, 500); // Small delay for realism
        }
    }

    const makeMove = (index)=>{
        Gameboard.update(index,players[currentPlayerIndex].symbol);

        if (checkWin(Gameboard.getGameboard())){
            gameOver = true;
           displayController.renderMessage(`${players[currentPlayerIndex].name} won!`);
        } else if (checkTie(Gameboard.getGameboard())){
            gameOver = true;
            displayController.renderMessage(`It's a tie!`);
        }else{
            currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            displayController.renderMessage(`${players[currentPlayerIndex].name}'s turn`);
        }
    }

    const computerMove = () => {
        const board = Gameboard.getGameboard();
        // Find available spots
        const availableSpots = board.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
        let move;

        if (difficulty === "easy") {
            move = availableSpots[Math.floor(Math.random() * availableSpots.length)];
        } else if (difficulty === "medium") {
            move = mediumDifficultyMove(availableSpots);
        } else if (difficulty === "hard") {
            move = hardDifficultyMove(availableSpots);
        }

        makeMove(move);
    };

    const mediumDifficultyMove = (availableSpots) => {
        const board = Gameboard.getGameboard();
        let move;

        for (let spot of availableSpots) {
            board[spot] = players[0].symbol;
            if (checkWin(board)) {
                move = spot;
                break;
            }
            board[spot] = ""; // Reset the board after checking
        }
        if (!move && move !== 0){
            move = availableSpots[Math.floor(Math.random() * availableSpots.length)];
        }
        return move;
    }

    const hardDifficultyMove = (availableSpots) => {
        const board = Gameboard.getGameboard();
        let move;

        for (let spot of availableSpots) {
            board[spot] = players[1].symbol;
            if (checkWin(board)) {
                move = spot;
                return move;
            }
            board[spot] = ""; // Reset the board after checking
        }

        for (let spot of availableSpots) {
            board[spot] = players[0].symbol;
            if (checkWin(board)) {
                move = spot;
                return move;
            }
            board[spot] = ""; // Reset the board after checking
        }

        if (!move && move !== 0 && board[4] === "") {
            move = 4; // Center spot
            return move;
        }

        if (!move && move !== 0) {
            const corners = [0, 2, 6, 8];
            move = availableSpots.find(spot => corners.includes(spot));
            return move;
        }

        if (!move && move !== 0){
            return move = availableSpots[Math.floor(Math.random() * availableSpots.length)];
        }

    }
    

    const checkWin = (board)=>{
        const winCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        for (let i=0; i< winCombinations.length; i++){
            const [a, b, c] = winCombinations[i];
            if (board[a] && board[a] === board[b] && board[a]=== board[c]){
                const currentPlayer = players[currentPlayerIndex];
                if (currentPlayer.name !== "Computer") { 
                    // Trigger fireworks only for non-computer players
                    triggerFireworks();
                }
                return true;
            }
        }
        return false;
    }

    const checkTie = (board)=>{
        return (board.every(cell => cell!== ""));
    }

    const triggerFireworks = () => {
        const container = document.querySelector("#fireworksContainer");

        // Remove any existing fireworks container
        if (container) {
            container.innerHTML = ""; // Clear previous fireworks
        }

        // Create a new Fireworks instance
        const fireworks = new Fireworks(container, {
            speed: 3,
            particles: 100,
            trace: 3,
            explosion: 5,
            boundaries: { x: 0, y: 0, width: container.offsetWidth, height: container.offsetHeight },
        });
        fireworks.start();
    
        // Stop fireworks after 3 seconds
        setTimeout(() => {
            fireworks.stop();
        }, 3000);
    };

    return{
        startGame,
        handleClick,
        restartGame,
        triggerFireworks,
        setComputerDifficulty
    }

})();

let gamestart = false;
const startButton = document.querySelector("#startButton");
startButton.addEventListener("click",() => {
    Controller.startGame();
    gamestart = true;
    document.querySelector("#startButton").style.display = "none";
    document.querySelector("#restartButton").style.display = "inline-block";
});

const restartButton = document.querySelector("#restartButton")
restartButton.style.display = "none"; // Initially hide the Restart button
restartButton.addEventListener("click",()=>{
    Controller.restartGame();
});


const vsComputerCheckbox = document.querySelector("#vsComputer");
const player2Input = document.querySelector("#player2");  //toggle player 2 input
const difficultyContainer = document.querySelector("#difficultyContainer");
const difficultySelect = document.querySelector("#difficulty");

// Set up event listener for difficulty selection
difficultySelect.addEventListener("change", (event) => {
    Controller.setComputerDifficulty(event.target.value);
});


vsComputerCheckbox.addEventListener("change", () => {
    const isBoardNotEmpty = Gameboard.getGameboard().some(cell => cell !== "");

    if (isBoardNotEmpty) {
        const confirmRestart = confirm("Changing the mode will restart the game. Do you want to continue?");
        if (!confirmRestart) {
            vsComputerCheckbox.checked = !vsComputerCheckbox.checked;
            return;
        }
    }
    player2Input.style.display = vsComputerCheckbox.checked ? "none" : "block";
    difficultyContainer.style.display = vsComputerCheckbox.checked ? "block" : "none";

   
    if (gamestart) Controller.restartGame();

    
});



