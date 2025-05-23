const grid = document.getElementById("game");
const levelDisplay = document.getElementById("level");
const message = document.getElementById("message");

let level = 1;
let sequence = [];
let userSequence = [];
let isGuessing = false;

function playSound(type) {
  // Simple beep sound generator using Web Audio API
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'click') {
    oscillator.frequency.value = 600;
    gainNode.gain.value = 0.1;
  } else if (type === 'success') {
    oscillator.frequency.value = 900;
    gainNode.gain.value = 0.15;
  } else if (type === 'fail') {
    oscillator.frequency.value = 200;
    gainNode.gain.value = 0.2;
  }

  oscillator.type = 'sine';
  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    ctx.close();
  }, 150);
}

// Build grid cells
for (let i = 0; i < 16; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  cell.addEventListener("click", () => handleGuess(i));
  grid.appendChild(cell);
}

function startLevel() {
  userSequence = [];
  sequence = [];
  isGuessing = false;
  message.textContent = "Memorize the pattern!";
  const cells = document.querySelectorAll(".cell");

  cells.forEach(c => {
    c.classList.remove("active", "correct", "wrong");
    c.style.pointerEvents = "none";
  });

  while (sequence.length < level + 2) {
    const rand = Math.floor(Math.random() * 16);
    if (!sequence.includes(rand)) sequence.push(rand);
  }

  sequence.forEach((idx, i) => {
    setTimeout(() => {
      cells[idx].classList.add("active");
      playSound('click');
      setTimeout(() => cells[idx].classList.remove("active"), 500);
    }, i * 800);
  });

  setTimeout(() => {
    isGuessing = true;
    message.textContent = "Now, repeat the pattern!";
    cells.forEach(c => (c.style.pointerEvents = "auto"));
  }, sequence.length * 800 + 500);

  levelDisplay.textContent = level;
}

function handleGuess(index) {
  if (!isGuessing) return;
  const cell = document.querySelector(`.cell[data-index="${index}"]`);

  if (userSequence.includes(index)) return; // no double clicks on same cell

  userSequence.push(index);

  if (sequence.includes(index)) {
    cell.classList.add("correct");
    playSound('click');
  } else {
    cell.classList.add("wrong");
    playSound('fail');
    message.textContent = "❌ Wrong! Restarting level...";
    isGuessing = false;
    disableGrid();
    setTimeout(() => {
      startLevel();
    }, 1500);
    return;
  }

  if (userSequence.length === sequence.length) {
    // Check if sequences match (order-independent)
    if (userSequence.sort().toString() === sequence.sort().toString()) {
      playSound('success');
      level++;
      message.textContent = "✅ Correct! Next level...";
      isGuessing = false;
      disableGrid();
      setTimeout(() => {
        startLevel();
      }, 1500);
    } else {
      playSound('fail');
      message.textContent = "❌ Incorrect pattern!";
      isGuessing = false;
      disableGrid();
      setTimeout(() => {
        startLevel();
      }, 1500);
    }
  }
}

function disableGrid() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(c => (c.style.pointerEvents = "none"));
}

startLevel();
