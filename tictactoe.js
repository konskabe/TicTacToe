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

        // Pick a random spot
        const randomIndex = availableSpots[Math.floor(Math.random() * availableSpots.length)];

        makeMove(randomIndex);
    };

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
        triggerFireworks
    }

})();

const startButton = document.querySelector("#startButton");
startButton.addEventListener("click",() => {
    Controller.startGame();
    document.querySelector("#startButton").style.display = "none";
    document.querySelector("#restartButton").style.display = "inline-block";
});

const restartButton = document.querySelector("#restartButton")
restartButton.style.display = "none"; // Initially hide the Restart button
restartButton.addEventListener("click",()=>{
    Controller.restartGame();
});

//toggle player 2 input
const vsComputerCheckbox = document.querySelector("#vsComputer");
const player2Input = document.querySelector("#player2"); 

vsComputerCheckbox.addEventListener("change", () => {
    const gameboard = Gameboard.getGameboard();
    const isBoardNotEmpty = gameboard.some(cell => cell !== "");

    if (isBoardNotEmpty) {
        // Confirm with the user before restarting the game
        const confirmRestart = confirm("Changing the mode will restart the game. Do you want to continue?");
        if (!confirmRestart) {
            // If the user cancels, revert the checkbox state and exit
            vsComputerCheckbox.checked = !vsComputerCheckbox.checked;
            return;
        }
        Controller.restartGame();
    }

    if (vsComputerCheckbox.checked) {
        player2Input.style.display = "none"; 
    } else {
        player2Input.style.display = "block";
    }
});