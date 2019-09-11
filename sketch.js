//images used
let ship1, ship2, heart, shot, enemyShot, startScreen, logo;
//animations
let bossAnimation, enemyAnim, enemyAnim2, enemyAnim3, explosion;
//JSON objects
let leaderboardJSON;
//sounds used
let fire, themeSong, levelStart, enemyDead, enemyCapture, coin;

function preload() {
  //Load images
  ship1 = loadImage("images/ship1.png");
  ship2 = loadImage("images/ship2.png");
  heart = loadImage("images/heart.png");
  shot = loadImage("images/friendly_shot.png");
  enemyShot = loadImage("images/shot.png");
  startScreen = loadImage("images/start_screen.png");
  logo = loadImage('images/logo.png');

  //Load animations
  bossAnimation = loadAnimation("images/boss_animation/boss00.png", "images/boss_animation/boss12.png");
  enemyAnim = loadAnimation("images/enemy_anim/enemy00.png", "images/enemy_anim/enemy14.png");
  enemyAnim2 = loadAnimation("images/second_anim/enemy00.png", "images/second_anim/enemy14.png");
  enemyAnim3 = loadAnimation("images/third_anim/enemy00.png", "images/third_anim/enemy14.png");
  explosion = loadAnimation("images/death_anim/death00.png", "images/death_anim/death15.png");

  //Load JSON object
  leaderboardJSON = loadJSON("leaderboard.json");

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
let bossGroup;
let bossShots;
let explosionGroup;

//enemy variables
let left = false;
let enemyCounter;
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
  bossShots = new Group();
  explosionGroup = new Group();

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
let explosionList = [];

let loopCount1 = 0;

let lastFromWave = true;
let stageCount = 1;

function drawGame() {
  themeSong.stop();

  if(boss==true) bossFight();
  else {
    waveHandler();
    if(enemyCounter == 0){
      //Reset wave variables
      atrList = [];
      enemyGroup = new Group();
      enemies = new Group();
      angles = [];
      completes = [];
      rounds = [];
      dead = [];
  
      loopCount1 = 0;
  
      lastFromWave = true;
      stageCount++;
  
      //Reset boss variables
      boss=true;
      bossGroup = new Group();
      firstBoss = true;
    }
  }
  player();
  shotHandler();
  enemyShotHandler();
  bossShotHandler();
  explosionHandler();

  enemyHandler();

  playing = true;

  drawSprites();
  gameStats();
}

let boss = false;
let firstBoss;
function bossFight() {
  if(firstBoss){
    currentFrame = frameCount;
    firstBoss = false;
    let thisBoss = createSprite(400, -200);
    thisBoss.addAnimation("normal", bossAnimation);
    thisBoss.changeAnimation("normal");
    thisBoss.friction = 0.1;
    bossGroup.add(thisBoss);
  }
  if(frameCount < currentFrame + 100) {
    fill("lightblue");
    textSize(35);
    text("BOSS INCOMING", 200, 300);
  }

  if(round(bossGroup[0].position.y) >= 100){
    let rand = round(random(0, 30));
    if(rand == 10){
      let newShot1 = createSprite(bossGroup[0].position.x-30, bossGroup[0].position.y);
      let newShot2 = createSprite(bossGroup[0].position.x+30, bossGroup[0].position.y);
      fire.play();
      newShot1.addImage(enemyShot);
      newShot2.addImage(enemyShot);
      bossShots.add(newShot1);
      bossShots.add(newShot2);
    }

    if(bossGroup[0].overlap(shots)) {

      for(let j=0; j<shots.length; j++){
        if(shots[j].overlap(bossGroup[0])) shots[j].remove();
      }

      bossGroup[0].scale -= 0.05;
      if(bossGroup[0].scale < 0.2){
        bossGroup[0].remove();
        currentFrame = frameCount;
        waveFrame = frameCount;
        boss = false;
        firstBoss = false;
      }
    }
  }
  else bossGroup[0].attractionPoint(1, 400, 100);
}

function explosionHandler(){
  for(let i=0; i<explosionList.length; i++){
    if(frameCount<explosionList[i]+60){
      explosionGroup[i].changeAnimation("regular");
    }
    else{
      explosionGroup[i].remove();
      explosionList.shift();
    }
  }
}

let waveFrame;
function waveHandler() {
  if(!playing){
    currentFrame = frameCount;
    waveFrame = frameCount;
  } 
  
  if(lastFromWave){
    lastFromWave=false;
    enemyGenerator(8, -50, 500, "first", [250, 350]);
    enemyGenerator(8, 800, 500, "second", [540, 350]);
    enemyGenerator(8, -50, 200, "third", [250, 350]);
    //enemyGenerator(8, 800, 100, enemy1, [540, 350]);
    enemyCounter=24;
  }

  if(frameCount < waveFrame + 100) {
    fill("lightblue");
    textSize(35);
    text("STAGE "+stageCount, 300, 300);
    if(stageCount % 2 == 0) currentFrame=0;
  }

  //draws the wave each iteration, and adds a new enemy every 5th frame
  let counter = 10;
  //First wave (bottom left)
  for(let i=0; i<=7; i++){
    if(!dead[i]){
      if(frameCount > currentFrame+counter && loopCount1>=i) firstWave(i, 100, 220+i*60, 250, 350, 250, 350);
    }
    counter+=5;
    if(currentFrame+counter > currentFrame+5) loopCount1++;
  }
  //Second wave (bottom right)
  if(frameCount > currentFrame){
    for(let i=8; i<=15; i++){
      if(!dead[i]){
        if(frameCount > currentFrame+counter && loopCount1>=i) firstWave(i, 140, 220+(i-8)*60, 450, 350, 450, 350);
      }
      counter+=5;
      if(currentFrame+counter > currentFrame+5) loopCount1++;
    }
    for(let i=16; i<=23; i++){
      if(!dead[i]){
        if(frameCount > currentFrame+counter && loopCount1>=i) waveFromTop(i, 180, 220+(i-16)*60, 250, 350, 250, 350);
      }
      counter+=5;
      if(currentFrame+counter > currentFrame+5) loopCount1++;
    }
  }
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
  else if(currentScene==3){
    if (keyCode === ESCAPE){
      currentScene=1;
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

function bossShotHandler(){
  for(let i=0; i<bossShots.length; i++){
    bossShots[i].position.y += 5;
    if(bossShots[i].position.y > height) bossShots[i].remove();
    if(currentPlayer.overlap(bossShots)) {
      bossShots[i].remove();
      lives=0;
    }
  }
}

let xlist = [];
let ylist = [];
let last = [];
let dead = [];
//Generates a predefined amount of enemies
function enemyGenerator(amount, startX, startY, enemyImg, nextAttraction){

  for(let i=0; i<amount; i++){
    let thisSprite = createSprite(startX, startY);
    thisSprite.scale = 0.3;

    thisSprite.addAnimation("first", enemyAnim);
    thisSprite.addAnimation("second", enemyAnim2);
    thisSprite.addAnimation("third", enemyAnim3);
    
    thisSprite.changeAnimation(enemyImg);
    
    thisSprite.friction = 0.1;
    enemyGroup.add(thisSprite);

    if(i<=15) append(angles, 0);
    else{
      append(angles, 4.5);
      append(last, false);
    } 
    append(dead, false);
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
        rounds[n] = false;
        atrList[n] = [x, y];
      }
    }
    //Chekcs if the sprite has reached the position where circular motion has to be commenced
    else if(round(enemyGroup[n].position.x) >= firstCondition){
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

    //check if enemy is dead
    if(enemyGroup[n].overlap(shots)) {
      enemyDead.play();
      currentScore+=100;
      for(let j=0; j<shots.length; j++){
        if(shots[j].overlap(enemyGroup[n])) shots[j].remove();
      }
      dead[n] = true;

      let thisExplosion = createSprite(enemyGroup[n].position.x, enemyGroup[n].position.y);
      thisExplosion.addAnimation("regular", explosion);
      explosionGroup.add(thisExplosion);
      append(explosionList, frameCount);

      enemyGroup[n].position.x = -200;
      enemyGroup[n].position.y = 10000;
      enemyCounter--;
    }
  
    enemyGroup[n].attractionPoint(1, atrList[n][0], atrList[n][1]);
  }
}

function waveFromTop(n, y, x, centerX, centerY, firstCondition, secondCondition){
  if(completes[n]) return true;
  else{
    //Check if the enemy has reached the final position before adding it to the enemies group
    //where the enemyHandler funciton takes care of the next movements
    if(last[n] && round(enemyGroup[n].position.y) <= y){
      enemyGroup[n].setSpeed(0);
      
      enemies.add(enemyGroup[n]);
      completes[n] = true;
      return true;
    }

    //after the circular motion spot has been hit (rounds(n) set to true when this happens)
    //keep spinning until a set angle has been reached before continuing
    else if(rounds[n]){
      spinner(n, centerX, centerY, [ylist[n], xlist[n]]);

      if(angles[n]>7.5){
        rounds[n] = false;
        last[n] = true;
        atrList[n] = [x, y];
      }
    }
    //Chekcs if the sprite has reached the position where circular motion has to be commenced
    else if(round(enemyGroup[n].position.x) >= firstCondition && round(enemyGroup[n].position.y) >= secondCondition){
      rounds[n] = true;
    }

    //check if enemy is dead
    if(enemyGroup[n].overlap(shots)) {
      enemyDead.play();
      currentScore+=100;
      for(let j=0; j<shots.length; j++){
        if(shots[j].overlap(enemyGroup[n])) shots[j].remove();
      }
      dead[n] = true;
      
      let thisExplosion = createSprite(enemyGroup[n].position.x, enemyGroup[n].position.y);
      thisExplosion.addAnimation("regular", explosion);
      explosionGroup.add(thisExplosion);
      append(explosionList, frameCount);

      enemyGroup[n].position.x = -200;
      enemyGroup[n].position.y = 10000;
      enemyCounter--;
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
        newShot.addImage(enemyShot);
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

        let thisExplosion = createSprite(enemies[i].position.x, enemies[i].position.y);
        thisExplosion.addAnimation("regular", explosion);
        explosionGroup.add(thisExplosion);
        append(explosionList, frameCount);

        enemies[i].position.x = 400;
        enemies[i].position.y = 1000;
        enemyCounter--;
      }

    }
}



function drawLeaderboard() {
  fill("white");
  textSize(30);
  text("LEADERBOARD", 325, 100);
  textSize(15);
  text("Press ESC to return to menu", 20, height-18);
  stroke("white");
  noFill();
  rect(50, 150, width-100, height-200);
  noStroke();

  textSize(23);
  for(let i=0; i<=leaderboardJSON.players.length-1; i++){
    fill(leaderboardJSON.colors[i]);
    text("NO."+ (i+1)+"  " +leaderboardJSON.players[i].name, 70, 200+i*50);
    text(" - Score: "+leaderboardJSON.players[i].score, 320, 200+i*50);
    text(" - Stage " + leaderboardJSON.players[i].stage, 680, 200+i*50);

  }
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

