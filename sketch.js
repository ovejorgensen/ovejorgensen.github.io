//images used
let ship1, ship2, enemy1, enemy2, enemy3, heart, shot, startScreen, logo;

//sounds used
let fire, themeSong, levelStart, enemyDead, enemyCapture, coin;

function preload() {
  //Load images
  ship1 = loadImage("images/ship1.png");
  ship2 = loadImage("images/ship2.png");
  enemy1 = loadImage("images/enemy1.png");
  enemy2 = loadImage("images/enemy2.png");
  enemy3 = loadImage("images/enemy3.png");
  heart = loadImage("images/heart.png");
  shot = loadImage("images/shot.png");
  startScreen = loadImage("images/start_screen.png");
  logo = loadImage("images/logo.png");

  //Load sounds
  fire = loadSound("sounds/fire.mp3");
  themeSong = loadSound("sounds/themesong.mp3");
  levelStart = loadSound("sounds/levelstart.mp3");
  enemyDead = loadSound("sounds/enemydead.mp3");
  enemyCapture = loadSound("sounds/enemycapture.mp3");
  coin = loadSound("sounds/coin.mp3");
}

//Scene variables
const LOADING_SCENE = 0;
const MAIN_MENU_SCENE = 1;
const MAIN_GAME_SCENE = 2;
const LEADERBOARD_SCENE = 3;
let currentScene;

let menuArrow = 1;
//player variables
let lives = 3;
let playerX = 300;
let playing = false;
let currentPlayer;
let currentScore = 0;
//Sprite Groups
let shots;
let enemies;
let enemyShots;
//enemy variables
let left = false;
//time tracking
let currentFrame;

function setup() {
  createCanvas(1000, 600);
  textFont("galagaFont");
  noCursor();
  shots = new Group();
  enemies = new Group();
  enemyGroup = new Group();
  enemyShots = new Group();
  currentScene = 0;
}

function draw() {
  background("black");

  sceneSelector();
  noFill();
  stroke("white");
  rect(1, 1, width-1, height-1);
  noStroke();
}

let atrList = [];
let enemyGroup;
let angles = [];
let completes = [];
let rounds = [];

let loopCount1 = 0;
let loopCount2 = 0;
let loopCount3 = 0;
let waveOne = false;
function drawGame() {
  themeSong.stop();

  if(!playing) currentFrame = frameCount;
  
  if(!waveOne){
    waveOne=true;
    enemyGenerator(8, -50, 500, enemy1, [250, 350]);
    enemyGenerator(8, 800, 500, enemy2, [540, 350]);
    enemyGenerator(8, 200, -100, enemy3, [250, 350]);
    // enemyGenerator(4, 500, -100, enemy2);
  }

  if(frameCount < currentFrame + 100) {
    fill("lightblue");
    textSize(35);
    text("STAGE 1", 300, 300);
  }

  //draws the wave each iteration, and adds a new enemy every 5th frame
  let counter = 10;
  //First wave (bottom left)
  for(let i=0; i<=7; i++){
    if(frameCount > currentFrame+counter && loopCount1>=i) firstWave(i, 100, 220+i*60, 250, 350, 250, 340);
    counter+=5;
    if(currentFrame+counter > currentFrame+5) loopCount1++;
  }
  // //Second wave (bottom right)
  if(frameCount > currentFrame){
    for(let i=8; i<=15; i++){
      if(frameCount > currentFrame+counter && loopCount2>=i) firstWave(i, 140, 220+(i-8)*60, 450, 350, 450, 340);
      counter+=5;
      if(currentFrame+counter > currentFrame+5) loopCount2++;
    }
  }
  if(frameCount > currentFrame+20){
    for(let i=16; i<=23; i++){
      if(frameCount > currentFrame+counter+20 && loopCount3>=i) waveFromTop(i, 180, 220+(i-16)*60, 250, 350, 250, 340);
      counter+=5;
      if(currentFrame+counter > currentFrame+5) loopCount3++;
    }
  }



  player();
  shotHandler();
  enemyShotHandler();

  enemyHandler();

  playing = true;

  drawSprites();
  gameStats();
}

function gameOver(){
  if(lives==0){
    fill("lightblue");
    textSize(35);
    text("GAME OVER", 300, 300);
    return false;
  }
  else return true;
}

function sceneSelector() {
  switch (currentScene){
    case 0:
      drawLoadingScreen();
      break;
    case 1:
      drawMainMenu();
      break;
    case 2:
      movePlayer();
      if(gameOver()) drawGame();
      break;
    case 3:
      drawLeaderboard();
      break;
  }
}

function keyReleased() {
  if (currentScene == 0){
    if (keyCode === 32){
      currentScene = 1;
    }
  }
  else if (currentScene == 1){
    if (keyCode === DOWN_ARROW){
      if (menuArrow == 1 || menuArrow == 2){
        menuArrow++;
      }
    }
    if (keyCode === UP_ARROW){
      if (menuArrow == 2 || menuArrow == 3){
        menuArrow--;
      }
    }
    if (keyCode === ENTER || keyCode === 32){
      if (menuArrow == 1){
        currentScene = 2;
        levelStart.play();
      }
      else if (menuArrow == 2) currentScene = 3
      else currentScene = 0;
    }
  }
}

function keyPressed() {
  if (currentScene == 2 && playing && keyCode === 32){
      let newShot = createSprite(playerX, 550);
      fire.play();
      newShot.addImage(shot);
      newShot.scale = 0.3;
      shots.add(newShot);
  }
}

function movePlayer() {
  if(currentScene == 2){
    if (playing){
      if(keyIsDown(LEFT_ARROW) && playerX > 100) playerX -= 13;
      if(keyIsDown(RIGHT_ARROW) && playerX < 700) playerX += 13;
    }
  }
}

function drawLoadingScreen() {
  if (!themeSong.isPlaying()) themeSong.play();
  image(startScreen, 0, 0);

  fill("white");
  textSize(20);
  text("Made by Ove Jorgensen", 275, 430);
}

function drawMainMenu() {
  image(logo, 0, 0);
  fill("white");
  textSize(25);
  switch (menuArrow){
    case 1:
        text("> START GAME", 350, 320);
        text("  LEADERBOARD", 350, 360);
        text("  EXIT", 350, 400);
      break;
    case 2:
        text("  START GAME", 350, 320);
        text("> LEADERBOARD", 350, 360);
        text("  EXIT", 350, 400);
      break;
    case 3:
      text("  START GAME", 350, 320);
      text("  LEADERBOARD", 350, 360);
      text("> EXIT", 350, 400);
    break;
  }
}

function player() {
  if(playing == false){
    currentPlayer = createSprite(playerX, 550);
    currentPlayer.addImage(ship1);
    currentPlayer.scale = 0.3;
  }
  else {
    currentPlayer.position.x = playerX;
  }
}

function shotHandler() {
  for(let i=0; i<shots.length; i++){
    shots[i].position.y -= 5;
    if(shots[i].position.y < 0) shots[i].remove();
  }
}

function enemyShotHandler(){
  for(let i=0; i<enemyShots.length; i++){
    enemyShots[i].position.y += 5;
    if(enemyShots[i].position.y > height) enemyShots[i].remove();
    if(currentPlayer.overlap(enemyShots)) {
      enemyShots[i].remove();
      lives--;
    }
  }
}

let xlist = [];
let ylist = [];
//Generates a predefined amount of enemies
function enemyGenerator(amount, startX, startY, enemyImg, nextAttraction){

  for(let i=0; i<amount; i++){
    let thisSprite = createSprite(startX, startY);
    thisSprite.scale = 0.3;
    thisSprite.addImage(enemyImg);
    thisSprite.friction = 0.1;
    enemyGroup.add(thisSprite);

    append(angles, 0);
    append(completes, false);
    append(rounds, false);
    append(xlist, 0);
    append(ylist, 0);
    append(atrList, nextAttraction);
  }
}

function spinner(n, centerX, centerY, spinWay){
  xlist[n] = centerX + radius * cos(angles[n]);
  ylist[n] = centerY + radius * sin(angles[n]);
  atrList[n] = spinWay;
  angles[n] = angles[n] + speed;
}

let radius = 40;
let speed = 0.1;
function firstWave(n, y, x, centerX, centerY, firstCondition, secondCondition){
  if(completes[n]) return true;
  else{
    //after the circular motion spot has been hit (rounds(n) set to true when this happens)
    //keep spinning until a set angle has been reached before continuing
    if(rounds[n]){
      if(n<=7) spinner(n, centerX, centerY, [ylist[n], xlist[n]]);
      if(n>7 && n<= 15) spinner(n, centerX, centerY, [xlist[n], ylist[n]]);
      if(angles[n]>7.5){
        print("ja?");
        rounds[n] = false;
        atrList[n] = [x, y];
      }
    }
    //Chekcs if the sprite has reached the position where circular motion has to be commenced
    else if(round(enemyGroup[n].position.x) >= firstCondition && round(enemyGroup[n].position.y) >= secondCondition){
      rounds[n] = true;
    }

    //Check if the enemy has reached the final position before adding it to the enemies group
    //where the enemyHandler funciton takes care of the next movements
    if(round(enemyGroup[n].position.y) <= y){
      enemyGroup[n].setSpeed(0);

      enemies.add(enemyGroup[n]);
      completes[n] = true;
      return true;
    }

    // //check if enemy is dead
    // if(enemyGroup[n].overlap(shots)) {
    //   enemyDead.play();
    //   currentScore+=100;
    //   enemyGroup[n].remove();
    // }
  
    enemyGroup[n].attractionPoint(1, atrList[n][0], atrList[n][1]);
  }
}

function waveFromTop(n, y, x, centerX, centerY, firstCondition, secondCondition){
  if(completes[n]) return true;
  else{
    //after the circular motion spot has been hit (rounds(n) set to true when this happens)
    //keep spinning until a set angle has been reached before continuing
    if(rounds[n]){
      if(n>15) spinner(n, centerX, centerY, [xlist[n], ylist[n]]);
      if(angles[n]>7.5){
        print("ja?");
        rounds[n] = false;
        atrList[n] = [x, y];
      }
    }
    //Chekcs if the sprite has reached the position where circular motion has to be commenced
    else if(round(enemyGroup[n].position.x) <= firstCondition && round(enemyGroup[n].position.y) <= secondCondition){
      xlist[n] = centerX + radius * cos(angles[n]);
      ylist[n] = centerY + radius * sin(angles[n]);
      atrList[n] = [ylist[n], xlist[n]];
      angles[n] = angles[n] + speed;
      rounds[n] = true;
    }

    //Check if the enemy has reached the final position before adding it to the enemies group
    //where the enemyHandler funciton takes care of the next movements
    if(round(enemyGroup[n].position.y) >= y){
      enemyGroup[n].setSpeed(0);

      enemies.add(enemyGroup[n]);
      completes[n] = true;
      return true;
    }

    //check if enemy is dead
    if(enemyGroup[n].overlap(shots)) {
      enemyDead.play();
      currentScore+=100;
      enemyGroup[n].remove();
    }
  
    enemyGroup[n].attractionPoint(1, atrList[n][0], atrList[n][1]);
  }
}


function enemyHandler() {
  let randomShot = round(random(0, 1000));
    for(let i=0; i<enemies.length; i++){
      if(i==randomShot){
        let newShot = createSprite(enemies[i].position.x, enemies[i].position.y);
        fire.play();
        newShot.addImage(shot);
        newShot.scale = 0.3;
        enemyShots.add(newShot);
      }
      if(left){
          if(enemies[i].position.x < 700) enemies[i].position.x += 0.5;
          else{
            left = false;
          }
        }

      else{
          if(enemies[i].position.x >= 100) enemies[i].position.x -= 0.5;
          else{
            left = true;
          }
        }
        
      if(enemies[i].overlap(shots)) {
        enemyDead.play();
        currentScore+=100;
        for(let j=0; j<shots.length; j++){
          if(shots[j].overlap(enemies[i])) shots[j].remove();
        }
        enemies[i].remove();
      }

    }
}



function drawLeaderboard() {

}

function gameStats() {
  fill("black");
  rect(width-250, 0, 250, height);
  textSize(25);
  fill("red");
  text("HIGH", 800, 100);
  text("SCORE", 820, 130);
  //highscore
  fill("white");
  text(30000, 820, 160);
  //current score
  text(currentScore, 820, 280);
  //current amount of lives
  for(let i=0; i<lives; i++){
    image(ship1, 800+i*50, 400, 40, 40);
  }
}

