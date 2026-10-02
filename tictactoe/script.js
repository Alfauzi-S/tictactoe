const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('#status');
const restartBtn = document.querySelector('#restartBtn');
const resetScoreBtn = document.querySelector('#resetScoreBtn');
const modeSelect = document.querySelector('#modeSelect');

const scoreXEl = document.querySelector('#scoreX');
const scoreOEl = document.querySelector('#scoreO');
const scoreDrawsEl = document.querySelector('#scoreDraws');

let scores = { X: 0, O: 0, draws: 0 };
let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;
let gameMode = "2player";

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

initializeGame();

function initializeGame() {
  cells.forEach(cell => cell.addEventListener('click', cellClicked));
  restartBtn.addEventListener('click', restartGame);
  resetScoreBtn.addEventListener('click', resetScores);
  modeSelect.addEventListener('change', handleModeChange);
  updateScoreBoard();
  statusText.textContent = `Giliran Pemain ${currentPlayer}`;
}

function handleModeChange() {
  gameMode = modeSelect.value;
  restartGame();
}

function cellClicked() {
  const cellIndex = this.getAttribute('data-index');

  if (options[cellIndex] !== "" || !running) return;

  makeMove(cellIndex, currentPlayer);

  if (running && gameMode !== "2player" && currentPlayer === "O") {
    setTimeout(makeAIMove, 300);
  }
}

function makeMove(index, player) {
  options[index] = player;
  cells[index].textContent = player;
  cells[index].setAttribute('data-player', player);
  checkWinner();
}

function checkWinner() {
  let roundWon = false;
  let winningCombination = null;

  for (let condition of winConditions) {
    const cellA = options[condition[0]];
    const cellB = options[condition[1]];
    const cellC = options[condition[2]];

    if (cellA === "" || cellB === "" || cellC === "") continue;

    if (cellA === cellB && cellB === cellC) {
      roundWon = true;
      winningCombination = condition;
      break;
    }
  }

  if (roundWon) {
    highlightWinningCells(winningCombination);
    statusText.textContent = `Pemain ${currentPlayer} Menang! 🎉`;
    running = false;
    scores[currentPlayer]++;
    updateScoreBoard();
  } else if (!options.includes("")) {
    statusText.textContent = `Permainan Seri! 🤝`;
    running = false;
    scores.draws++;
    updateScoreBoard();
  } else {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `Giliran Pemain ${currentPlayer}`;
  }
}

function highlightWinningCells(combination) {
  combination.forEach(index => {
    cells[index].classList.add('winner');
  });
}

function updateScoreBoard() {
  if (scoreXEl) scoreXEl.textContent = scores.X;
  if (scoreOEl) scoreOEl.textContent = scores.O;
  if (scoreDrawsEl) scoreDrawsEl.textContent = scores.draws;
}

function resetScores() {
  scores = { X: 0, O: 0, draws: 0 };
  updateScoreBoard();
}

function restartGame() {
  currentPlayer = "X";
  options = ["", "", "", "", "", "", "", "", ""];
  statusText.textContent = `Giliran Pemain ${currentPlayer}`;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('winner');
    cell.removeAttribute('data-player');
  });
  running = true;
}

// --- LOGIKA AI ---

function makeAIMove() {
  if (!running) return;

  let moveIndex;
  if (gameMode === "easy") {
    moveIndex = getRandomMove();
  } else if (gameMode === "hard") {
    moveIndex = getBestMove();
  }

  if (moveIndex !== null && moveIndex !== undefined) {
    makeMove(moveIndex, "O");
  }
}

function getRandomMove() {
  const availableIndices = options
    .map((val, idx) => (val === "" ? idx : null))
    .filter(val => val !== null);

  if (availableIndices.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < options.length; i++) {
    if (options[i] === "") {
      options[i] = "O";
      let score = minimax(options, 0, false);
      options[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  let result = evaluateBoard(board);
  if (result !== null) {
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (result === "draw") return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluateBoard(board) {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes("")) return "draw";
  return null;
}