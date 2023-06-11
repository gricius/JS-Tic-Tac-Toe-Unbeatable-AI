// Module for game board
const gameBoard = (() => {
  let board = ['', '', '', '', '', '', '', '', ''];

  const getBoard = () => board;

  const updateBoard = (index, player) => {
    board[index] = player.getSymbol();
  };

  const resetBoard = () => {
    board = ['', '', '', '', '', '', '', '', ''];
  };

  return {
    getBoard,
    updateBoard,
    resetBoard,
  };
})();

// Factory function for players
const Player = (name, symbol) => {
  const getName = () => name;
  const getSymbol = () => symbol;
  return { getName, getSymbol };
};

// Module for game controller
const gameController = (() => {
  let currentPlayer;
  let gameOver = false;
  let humanPlayer;
  let aiPlayer;

  const cells = Array.from(document.querySelectorAll('.cell'));

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const setPlayers = (player1, player2) => {
    humanPlayer = player1;
    aiPlayer = player2;
    currentPlayer = humanPlayer;
  };

  const render = () => {
    gameBoard.getBoard().forEach((symbol, index) => {
      cells[index].textContent = symbol;
    });
  };

  const handleClick = (event) => {
    const cell = event.target;
    const index = cells.indexOf(cell);
    if (cell.textContent === '' && !gameOver) {
      makeMove(index);
    }
  };

  const makeMove = (index) => {
    gameBoard.updateBoard(index, currentPlayer);
    render();
    if (checkWin(currentPlayer.getSymbol())) {
      gameOver = true;
      showResult(`${currentPlayer.getName()} wins!`);
      showRestartButton();
      return;
    }
    if (checkTie()) {
      gameOver = true;
      showResult("It's a tie!");
      showRestartButton();
      return;
    }
    currentPlayer = currentPlayer === humanPlayer ? aiPlayer : humanPlayer;
    if (currentPlayer === aiPlayer) {
      makeAiMove();
    } else {
      showResult(`Your turn, ${currentPlayer.getName()}. Make your move.`);
    }
  };

  const makeAiMove = () => {
    const availableMoves = cells.reduce((acc, cell, index) => {
      if (cell.textContent === '') {
        acc.push(index);
      }
      return acc;
    }, []);

    const bestMove = minimax(gameBoard.getBoard(), aiPlayer.getSymbol()).index;
    makeMove(bestMove);
  };

  const checkWin = (symbol) => {
    return winningCombinations.some((combination) => {
      return combination.every((index) => gameBoard.getBoard()[index] === symbol);
    });
  };

  const checkTie = () => {
    return gameBoard.getBoard().every((cell) => cell !== '');
  };

  const showResult = (message) => {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
  };

  const showRestartButton = () => {
    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'flex';
  };

  const minimax = (board, player) => {
    const availableMoves = board.reduce((acc, cell, index) => {
      if (cell === '') {
        acc.push(index);
      }
      return acc;
    }, []);

    if (checkWin(humanPlayer.getSymbol())) {
      return { score: -1 };
    } else if (checkWin(aiPlayer.getSymbol())) {
      return { score: 1 };
    } else if (availableMoves.length === 0) {
      return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availableMoves.length; i++) {
      const move = {};
      move.index = availableMoves[i];
      board[availableMoves[i]] = player;

      if (player === aiPlayer.getSymbol()) {
        const result = minimax(board, humanPlayer.getSymbol());
        move.score = result.score;
      } else {
        const result = minimax(board, aiPlayer.getSymbol());
        move.score = result.score;
      }

      board[availableMoves[i]] = '';
      moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer.getSymbol()) {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  const initialize = () => {
    cells.forEach((cell) => {
      cell.addEventListener('click', handleClick);
    });
  };

  const restartGame = () => {
    location.reload();
  };

  const startGame = () => {
    const playerNameInput = document.getElementById('playerNameInput');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const greetingDiv = document.querySelector('.greeting');
    const resultDiv = document.getElementById('result');

    startButton.addEventListener('click', () => {
      const playerName = playerNameInput.value.trim();
      if (playerName !== '') {
        const player1 = Player(playerName, 'X');
        const player2 = Player('AI', 'O');
        setPlayers(player1, player2);
        render();
        initialize();
        greetingDiv.innerHTML = `Welcome, ${playerName}! You are playing against AI. Make your first move by selecting a cell.`;
        resultDiv.textContent = '';
        restartButton.style.display = 'none';
      }
    });

    restartButton.addEventListener('click', restartGame);
  };

  return {
    startGame,
  };
})();

gameController.startGame();
