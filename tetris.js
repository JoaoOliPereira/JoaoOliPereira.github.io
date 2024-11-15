class Block {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;  // Color as a hexadecimal number (0xRRGGBB)
    }
  
    moveDown() {
      this.y += 1;
    }
  
    moveUp() {
      this.y -= 1;
    }
  
    moveLeft() {
      this.x -= 1;
    }
  
    moveRight() {
      this.x += 1;
    }
  
    draw(context, blockSize) {
      context.fillStyle = `#${this.color.toString(16).padStart(6, '0')}`;
      context.fillRect(this.x * blockSize, this.y * blockSize, blockSize, blockSize);
      context.strokeStyle = 'black';
      context.strokeRect(this.x * blockSize, this.y * blockSize, blockSize, blockSize); // Optional outline
    }
}
  
class Piece {
    constructor(shape, color, originX = 0, originY = 0) {
      this.blocks = [];
      this.color = color;
      this.originX = originX;
      this.originY = originY;
      this.initializeBlocks(shape);
    }
  
    initializeBlocks(shape) {
      shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            this.blocks.push(new Block(x + this.originX, y + this.originY, this.color));
          }
        });
      });
    }
  
    setPosition(x, y) {
      const deltaX = x - this.originX;
      const deltaY = y - this.originY;
      this.blocks.forEach(block => {
        block.x += deltaX;
        block.y += deltaY;
      });
      this.originX = x;
      this.originY = y;
    }
  
    moveDown() {
      this.blocks.forEach(block => block.moveDown());
      this.originY += 1;
    }
  
    moveLeft() {
      this.blocks.forEach(block => block.moveLeft());
      this.originX -= 1;
    }
  
    moveRight() {
      this.blocks.forEach(block => block.moveRight());
      this.originX += 1;
    }
  
    moveUp() {
      this.blocks.forEach(block => block.moveUp());
      this.originY -= 1;
    }
  
    rotate() {
      this.blocks.forEach(block => {
        const relativeX = block.x - this.originX;
        const relativeY = block.y - this.originY;
        block.x = this.originX - relativeY;
        block.y = this.originY + relativeX;
      });
    }
}
  
class GameEngine {
    constructor(onLineClear, context) {
      this.onLineClear = onLineClear;
      this.grid = this.createEmptyGrid(22, 20);  // Grid size
      this.currentPiece = null;
      this.gameOver = false;
      this.context = context;
      this.gameWidth = 550;
      this.gameHeight = 500;
      this.spawnPiece();
    }
  
    createEmptyGrid(width, height) {
      return Array.from({ length: height }, () => Array(width).fill(0));
    }
  
    spawnPiece() {
      const shapes = [
        [[1, 1, 1, 1]],             // Line
        [[1, 1], [1, 1]],           // Square
        [[0, 1, 0], [1, 1, 1]],     // T
        [[1, 1, 0], [0, 1, 1]],     // Z
        [[0, 1, 1], [1, 1, 0]]      // S
      ];
  
      const colors = [0x3e7ed4, 0xf5d328, 0x9b38d7, 0xf89c1f, 0xdb2727, 0x60d850, 0x44c9cc];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.currentPiece = new Piece(shape, color);
  
      if (this.checkCollision()) {
        this.currentPiece = null;
        this.gameOver = true;
      }
    }
  
    checkCollision() {
      if (!this.currentPiece) return false;
  
      for (const block of this.currentPiece.blocks) {
        const newX = block.x;
        const newY = block.y;
  
        if (newX < 0 || newX >= this.grid[0].length || newY >= this.grid.length) {
          return true;
        }
  
        if (newY >= 0 && this.grid[newY][newX] !== 0) {
          return true;
        }
      }
      return false;
    }
  
    mergePiece() {
      this.currentPiece.blocks.forEach(block => {
        if (this.grid[block.y] && this.grid[block.y][block.x] !== undefined) {
          this.grid[block.y][block.x] = block.color;
        }
      });
      this.currentPiece = null;
    }
  
    clearLines() {
      let linesCleared = 0;
      for (let y = this.grid.length - 1; y >= 0; y--) {
        if (this.grid[y].every(cell => cell !== 0)) {
          this.grid.splice(y, 1);
          this.grid.unshift(Array(this.grid[0].length).fill(0));
          linesCleared++;
        }
      }
      if (linesCleared > 0) {
        this.onLineClear(linesCleared);
      }
    }
  
    update() {
      if (this.currentPiece && !this.gameOver) {
        this.currentPiece.moveDown();
        if (this.checkCollision()) {
          this.currentPiece.moveUp();
          this.mergePiece();
          this.clearLines();
          this.spawnPiece();
  
          if (this.checkGameOver()) {
            this.gameOver = true;
          }
        }
        this.render();
      }
    }
  
    checkGameOver() {
      if (this.currentPiece?.blocks) {
        for (const block of this.currentPiece.blocks) {
          if (block.y < 0) {
            return true;
          }
        }
      }
      return false;
    }
  
    render() {
      this.clearCanvas();
  
      const blockSize = 7.5;
      for (let y = 0; y < this.grid.length; y++) {
        for (let x = 0; x < this.grid[y].length; x++) {
          if (this.grid[y][x] !== 0) {
            this.context.fillStyle = `#${this.grid[y][x].toString(16)}`;
            this.context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            this.context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
          }
        }
      }
  
      if (this.currentPiece) {
        this.currentPiece.blocks.forEach(block => {
          block.draw(this.context, blockSize);
        });
      }
    }
  
    clearCanvas() {
      this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    }
}
  
//getting graphical elements
const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartButton = document.querySelector('.game-restart-btn');

let gameEngine = new GameEngine(updateScore, context);
let gameInterval = null;

// Update the score display
function updateScore(linesCleared) {
    const currentScore = parseInt(scoreDisplay.innerText.replace("Score: ", ""), 10);
    const newScore = currentScore + linesCleared * 100;
    scoreDisplay.innerText = `Score: ${newScore}`;
  }
  
  // Function to start the game
  function startGame() {
    gameEngine = new GameEngine(updateScore, context);
    scoreDisplay.innerText = 'Score: 0';
    gameInterval = setInterval(() => {
      if (!gameEngine.gameOver) {
        gameEngine.update();
      } else {
        displayGameOverMessage();
        clearInterval(gameInterval);
      }
    }, 300); // Update every 300ms
  }
  
  // Function to display "Game Over" message
  function displayGameOverMessage() {
    context.fillStyle = 'red';
    context.font = 'bold 30px Arial';
    context.fillText('Game Over', canvas.width / 4, canvas.height / 2);
  }
  
  // Event listener for keyboard controls
  document.addEventListener('keydown', function (event) {
    if (!gameEngine.gameOver && gameEngine.currentPiece) {
      switch (event.key) {
        case 'ArrowLeft':
          gameEngine.currentPiece.moveLeft();
          if (gameEngine.checkCollision()) gameEngine.currentPiece.moveRight();
          break;
        case 'ArrowRight':
          gameEngine.currentPiece.moveRight();
          if (gameEngine.checkCollision()) gameEngine.currentPiece.moveLeft();
          break;
        case 'ArrowUp':
          gameEngine.currentPiece.rotate();
          if (gameEngine.checkCollision()) gameEngine.currentPiece.rotate();
          break;
        case 'ArrowDown':
          gameEngine.update(); // Move the piece down faster
          break;
      }
      gameEngine.render();
    }
  });
  
  // Event listener for the Restart button
  restartButton.addEventListener('click', () => {
    clearInterval(gameInterval);
    startGame();
  });
  
  // Start the game when the page loads
  startGame();