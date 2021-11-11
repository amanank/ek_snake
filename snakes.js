const board_border = "black";
const board_background = "#E8E4C9";
const snake_col = 'pink';
const snake_border = 'brown';

let snake;

let score;
let speed;
// True if changing direction
let changing_direction;
// Horizontal velocity
let food_x;
let food_y;

let golden_apple;
let golden_apple_time;
let golden_apple_max_time = 100;

let slow_food = false;

let dx;
// Vertical velocity
let dy;


let gameTick;


// Get the canvas element
const snakeboard = document.getElementById("snakeboard");
// Return a two dimensional drawing context
const snakeboard_ctx = snakeboard.getContext("2d");
// Start game

snakeboard.onclick = function() {
  snake = [
    {x: 200, y: 200},
    {x: 190, y: 200},
    {x: 180, y: 200},
    {x: 170, y: 200},
    {x: 160, y: 200}
  ];
  dx = 10;
  dy = 0;
  score = 0;
  changing_direction = false;
  speed = Math.max(200 - (snake.length * 6), 75);

  if (gameTick) {
    clearTimeout(gameTick);
  }

  gen_food();
  main();
};




document.addEventListener("keydown", change_direction);


// main function called repeatedly to keep the game running
function main() {

    if (has_game_ended()) return;

    changing_direction = false;
    
    gameTick = setTimeout(function onTick() {
      speed = Math.max(200 - (snake.length * 6), 75);

      clear_board();
      drawFood();
      move_snake();
      drawSnake();
      // Repeat
      main();
    }, speed);
}

// draw a border around the canvas
function clear_board() {
  //  Select the colour to fill the drawing
  snakeboard_ctx.fillStyle = board_background;
  //  Select the colour for the border of the canvas
  snakeboard_ctx.strokestyle = board_border;
  // Draw a "filled" rectangle to cover the entire canvas
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  // Draw a "border" around the entire canvas
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

// Draw the snake on the canvas
function drawSnake() {
  let foodPart = null;
  let isHead = true;
  snake.forEach(function(snakePart){ 
    if (snakePart.isFood) {
      foodPart = snakePart;
    }
    // Draw each part
    drawSnakePart(snakePart, isHead);
    isHead = false;
  });
  if (foodPart) { //draw food part again so that it is on top
    drawSnakePart(foodPart);
  }
}

function drawFood() {
  if (golden_apple) {  
    darwCircle(food_x, food_y, 'gold', 'brown');
  } else {
    darwCircle(food_x, food_y, 'blue', 'darkblue'); 
  }
  document.getElementById('countdown').innerHTML = golden_apple ? golden_apple_time : '';
}

function darwCircle(atX, atY, fill, stroke) {
  snakeboard_ctx.fillStyle = fill;
  snakeboard_ctx.strokeStyle = stroke;

  snakeboard_ctx.beginPath();

  snakeboard_ctx.arc(atX +5, atY +5, 5, 0, 2 * Math.PI);
  
  snakeboard_ctx.fill();
  snakeboard_ctx.stroke();
}

// Draw one snake part
function drawSnakePart(snakePart, isHead) {

  // Set the colour of the snake part
  snakeboard_ctx.fillStyle = snake_col;
  // Set the border colour of the snake part
  snakeboard_ctx.strokeStyle = snake_border;

  let sSize = snakePart.isFood ? 14 : 10;
  let spX = snakePart.x - (snakePart.isFood ? 2: 0);
  let spY = snakePart.y - (snakePart.isFood ? 2: 0);
  // Draw a "filled" rectangle to represent the snake part at the coordinates
  // the part is located
  snakeboard_ctx.fillRect(spX, spY, sSize, sSize);
  // Draw a border around the snake part
  snakeboard_ctx.strokeRect(spX, spY, sSize, sSize);

  if (isHead) {
    let hSize = Math.round(sSize / 2)

    const tngSize = 6;
    const tngOverlap = 2;

    let tngX;
    let tngY;
    let tngToX;
    let tngToY;

    if (dx != 0) {
      tngX = spX + Math.max(dx, 0 - tngOverlap) - tngOverlap;
      tngY = spY + hSize;
      tngToX = tngX + tngSize;
      tngToY = tngY;
    } else {
      tngX = spX + hSize;
      tngY = spY + Math.max(dy, 0 - tngOverlap) - tngOverlap;
      tngToX = tngX;
      tngToY = tngY + tngSize;
    }
    snakeboard_ctx.beginPath();
    snakeboard_ctx.moveTo(tngX, tngY);
    snakeboard_ctx.lineTo(tngToX, tngToY);
    snakeboard_ctx.stroke();
  }

  if (snakePart.isFood) {
    darwCircle(snakePart.x, snakePart.y, 'rgba(255, 0, 0, 0.5)', 'darkred');
  }

}

function has_game_ended() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > snakeboard.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > snakeboard.height - 10;
  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
}

function random_food(min, max) {
  return Math.round((Math.random() * (max-min) + min) / 10) * 10;
}

function gen_food() {
  // Generate a random number the food x-coordinate
  food_x = random_food(0, snakeboard.width - 10);
  // Generate a random number for the food y-coordinate
  food_y = random_food(0, snakeboard.height - 10);

  golden_apple = Math.round( Math.random() * 10 ) == 1;
  golden_apple_time = golden_apple_max_time;
   
  // if the new food location is where the snake currently is, generate a new food location
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) gen_food();
  });
}

function change_direction(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;
  
// Prevent the snake from reversing

  if (changing_direction) return;
  changing_direction = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;
  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -10;
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;
  }
}

function move_snake() {
  // Create the new Snake's head
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  // Add the new head to the beginning of snake body
  snake.unshift(head);
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
  document.getElementById('speed').innerHTML = speed;
  if (has_eaten_food) {
    // Increase score
    score += golden_apple ? golden_apple_time : 10;
    // Display score on screen
    document.getElementById('score').innerHTML = score;
    // Generate new food location
    head.isFood = true;
    gen_food();
  } else {
    if (golden_apple){
      golden_apple_time --;
      if (golden_apple_time <= 10){
        golden_apple = false;
      }
    }
    // Remove the last part of snake body
    snake.pop();
  }
}

