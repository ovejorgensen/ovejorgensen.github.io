//images used
let ship1, ship2, heart, shot, enemyShot, startScreen, logo, powerup;
//The video
let film;
//animations
let bossAnimation, enemyAnim, enemyAnim2, enemyAnim3, explosion, playerHit, diver;
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
  powerup = loadImage('images/powerup.png');

  //Load animations
  bossAnimation = loadAnimation("images/boss_animation/boss00.png", "images/boss_animation/boss12.png");
  enemyAnim = loadAnimation("images/enemy_anim/enemy00.png", "images/enemy_anim/enemy14.png");
  enemyAnim2 = loadAnimation("images/second_anim/enemy00.png", "images/second_anim/enemy14.png");
  enemyAnim3 = loadAnimation("images/third_anim/enemy00.png", "images/third_anim/enemy14.png");
  explosion = loadAnimation("images/death_anim/death00.png", "images/death_anim/death03.png");
  playerHit = loadAnimation("images/player_hit_anim/hit00.png", "images/player_hit_anim/hit03.png");
  diver = loadAnimation("images/diver_anim/diver00.png", "images/diver_anim/diver01.png");

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
const GAME_OVER_SCENE = 4;
let currentScene;

let menuArrow = 1;

//player variables
let lives = 3;
let playerX = 300;
let playing = false;
let currentPlayer;
let currentScore = 0;
let highscore = 30000;
let currentPlayerStats = [];
let username = "";

//Sprite Groups
let shots;
let enemies;
let enemyShots;
let bossGroup;
let bossShots;
let explosionGroup;
let playerHitGroup;
let powerGroup;
let powerShotGroupLeft;
let powerShotGroupRight;

//enemy variables
let left = false;
let enemyCounter;
let atrList = [];
let enemyGroup;
let angles = [];
let completes = [];
let rounds = [];
let xlist = [];
let ylist = [];
let last = [];
let dead = [];

//Boss variables
let boss = false;
let firstBoss;
let bossLives = 15;
let bosSpeed;

//wave variables
let loopCount1 = 0;
let lastFromWave = true;
let stageCount = 1;

//variables for the "round" the enemies does when entering the screen
let radius = 40;
let speed = 0.1;
let done = false;
let doneCount;

//time tracking
let currentFrame;
let waveFrame;
let videoCount;

//list containing the explosions caused by enemies and the player dying
let explosionList = [];
let playerHitList = [];

//Powerup variables
let powerTimer;
let poweredUp = false;

//Star background variables
let starSpeed = 2;
let initialSpeed = 1;
let y = 0;
let starList = [];
let starColors = [[255, 0, 0], [0, 0, 255], [0, 128, 0], [64, 224, 208], [255, 255, 255], [128, 0, 128], [255, 255, 0]];
let initial = true;

//Constants, if the program does not run smoothly on your computer you may reduce the star amount, creating fewer stars.
const STAR_AMOUNT = 300;

function setup() {
  createCanvas(1000, 600);
  textFont("galagaFont");
  noCursor();

  //Load video
  film = createVideo("video/trailer.mp4");
  film.time(88);
  film.hide();

  //initializes all the sprite groups
  shots = new Group();
  enemies = new Group();
  enemyGroup = new Group();
  enemyShots = new Group();
  bossShots = new Group();
  explosionGroup = new Group();
  playerHitGroup = new Group();
  powerGroup = new Group();
  powerShotGroupLeft = new Group();
  powerShotGroupRight = new Group();

  //sets an animation delay as the animated objects only have a few frames to switch between
  explosion.frameDelay = 10;
  playerHit.frameDelay = 20;
  diver.frameDelay = 30;

  //initializes the timer for the powerup drop
  powerTimer = millis();

  currentScene = 0;

  starGenerator();
}

function draw() {
  background("black");


  sceneSelector();

  //the white border around the canvas
  noFill();
  stroke("white");
  rect(1, 1, width-1, height-1);
  noStroke();
  videoHandler();

}

//This function selects the scene to display according to what the currentScene variable is set to
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
      drawGame();
      break;
    case 3:
      drawLeaderboard();
      break;
    case 4:
      gameOver();
  }
}

//This function is the function that is called whenever the gamescene is on the actual game
//it takes care of calling all the functions that make up the game
function drawGame() {
  themeSong.stop();
  stars();

  if(boss==true) bossFight();
  else waveHandler();
  player();
  shotHandler();
  enemyShotHandler();
  bossShotHandler();
  explosionHandler();
  playerHitHandler();

  enemyHandler();
  powerupHandler();

  playing = true;

  drawSprites();
  gameStats();

  if(lives<=0) currentScene=4;
}


//This function sends out a powerup at certain points, if the player gets one it waits for a while
//before sending a new one out.
function powerupHandler() {
  if(!poweredUp){
    if(millis() > powerTimer + 10000){
      powerGroup.removeSprites();
      let randX = random(100, width-300);
      let powerSprite = createSprite(randX, -20);
      powerSprite.addImage(powerup);
      powerSprite.scale = 2;
      powerGroup.add(powerSprite);
      powerTimer = millis();
    }
    if(powerGroup[0] !== undefined) {
      powerGroup[0].position.y+=10;
      if(powerGroup[0].overlap(currentPlayer)){
        powerTimer = millis();
        powerGroup.removeSprites();
        poweredUp = true;
      }
    }
  }
  else{
    if(millis() > powerTimer + 5000){
      powerTimer = millis() + 15000;
      poweredUp = false;
    }
    else return true;
  }
}

//This function handles the entire bossfight stage, when each regular stage is done, this function is 
//"activated" until the boss is dead, telling the program that a regular stage needs to be done again.
function bossFight() {
  if(firstBoss){
    currentFrame = frameCount;
    firstBoss = false;
    let thisBoss = createSprite(400, -200);
    thisBoss.addAnimation("normal", bossAnimation);
    thisBoss.changeAnimation("normal");
    thisBoss.friction = 0.1;
    bossGroup.add(thisBoss);
    bossLives = 15;
    bosSpeed = 1.5;
  }
  if(frameCount < currentFrame + 100) {
    fill("lightblue");
    textSize(35);
    text("BOSS INCOMING", 200, 300);
  }

  noFill();
  stroke("white");
  rect(250, 20, 300, 30);
  fill("red");
  let count =0;
  for(let i=0; i<300; i+=20){
    if (count < bossLives) rect(252 + i, 22, 16, 26);
    count++;
  }
  noFill();
  noStroke();

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
    if (left) {
      if (bossGroup[0].position.x <= 700) bossGroup[0].position.x += bosSpeed;
      else left = false;
    } 
    else {
      if (bossGroup[0].position.x >= 100) bossGroup[0].position.x -= bosSpeed;
      else left = true; 
    }
    if(bossGroup[0].overlap(shots) || bossGroup[0].overlap(powerShotGroupLeft) || bossGroup[0].overlap(powerShotGroupRight)) {
      for(let j=0; j<shots.length; j++){
        if(shots[j].overlap(bossGroup[0])) shots[j].remove();
      }
      for(let j=0; j<powerShotGroupLeft.length; j++){
        if(powerShotGroupLeft[j].overlap(bossGroup[0])) powerShotGroupLeft[j].remove();
      }
      for(let j=0; j<powerShotGroupRight.length; j++){
        if(powerShotGroupRight[j].overlap(bossGroup[0])) powerShotGroupRight[j].remove();
      }
      currentScore+=10;
      bossGroup[0].scale -= 0.05;
      bossLives--;
      bosSpeed+=0.5;
      if(bossGroup[0].scale < 0.25){
        currentFrame = frameCount;
        waveFrame = frameCount;
        boss = false;
        firstBoss = false;
        currentScore+=990;

        let thisBossHit = createSprite(bossGroup[0].position.x, bossGroup[0].position.y);
        thisBossHit.addAnimation("explode", playerHit);
        thisBossHit.scale = 3;
        playerHitGroup.add(thisBossHit);
        append(playerHitList, frameCount);
        
        bossGroup[0].remove();

      }
    }
  }
  else bossGroup[0].attractionPoint(1, 400, 100);
}

//This function updates the explosions that are created when an enemy is killed
//The explosion has 4 frames, and this function uses the framecount to ensure that after those
//4 frames have been shown the animation is removed.
function explosionHandler(){
  for(let i=0; i<explosionList.length; i++){
    if(frameCount<explosionList[i]+40){
      explosionGroup[i].changeAnimation("regular");
    }
    else{
      explosionGroup[i].remove();
      explosionList.shift();
    }
  }
}

//This function is essentially the same as the explosionHandler() function, except it takes care of 
//showing the animation caused when the player is hit by an enemy. It is also used to show the 
//animation of the explosion created when the boss is killed
function playerHitHandler(){
  for(let i=0; i<playerHitList.length; i++){
    if(frameCount<playerHitList[i]+60){
      playerHitGroup[i].changeAnimation("explode");
    }
    else{
      playerHitGroup[i].remove();
      playerHitList.shift();
    }
  }
}

//This function creates a set of enemies for each regular stage and initializes the correct functions for them at the right time
function waveHandler() {
  if(!playing){
    currentFrame = frameCount;
    waveFrame = frameCount;
  } 
  
  //Only once creates the enemies that the player has to fight
  if(lastFromWave){
    lastFromWave=false;
    enemyGenerator(8, -50, 500, "first", [250, 350]);
    enemyGenerator(8, 800, 500, "second", [540, 350]);
    enemyGenerator(8, -50, 200, "third", [250, 350]);
    enemyCounter=24;
  }

  //Displays the text that shows the current stagecount
  if(frameCount < waveFrame + 100) {
    fill("lightblue");
    textSize(35);
    text("STAGE "+stageCount, 300, 300);
    //This if sentece sets framecount to 0 for every other stage, creating two different ways the enemies enter the screen.
    if(stageCount % 2 == 0) currentFrame=0;
  }

  //draws the wave each iteration, and adds a new enemy every 5th frame
  let counter = 10;
  //First set of enemies from bottom left
  if(dontEnter){
    for(let i=0; i<=7; i++){
      //The enemy must both not be dead, and the currentFrame counter variable ensures that each enemy is created after the previous
      //so they do not overlap each other.
      if(!dead[i]) if(frameCount > currentFrame+counter && loopCount1>=i) firstWave(i, 100, 220+i*60, 250, 350, 250, 350);
      counter+=5;
      if(currentFrame+counter > currentFrame+5) loopCount1++;
    }
    if(frameCount > currentFrame){
      //Second set from bottom right
      for(let i=8; i<=15; i++){
        if(!dead[i]) if(frameCount > currentFrame+counter && loopCount1>=i) firstWave(i, 140, 220+(i-8)*60, 450, 350, 450, 350);
        counter+=5;
        if(currentFrame+counter > currentFrame+5) loopCount1++;
      }
      //Third set from top left
      for(let i=16; i<=23; i++){
        if(!dead[i]) if(frameCount > currentFrame+counter && loopCount1>=i) waveFromTop(i, 180, 220+(i-16)*60, 250, 350, 250, 350);
        counter+=5;
        if(currentFrame+counter > currentFrame+5) loopCount1++;
      }
    }
  }
  //resets everything if the player has died
  if(enemyCounter == 0){
       //Reset wave variables
       atrList = [];
       enemyGroup.removeSprites();
       enemies.removeSprites();
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

//When the player dies, this function is called showing the game over text and prompts the player to enter his name.
function gameOver(){
  fill("lightblue");
  textSize(35);
  text("GAME OVER", 300, 300);
  textSize(15);
  fill("white");
  text("Fill in your GAMERNAME: " + username, 200, 350);  
  gameStats();
  currentPlayerStats = [username, currentScore, stageCount];
}

//Is only used on the game over scene to get the key that has been pressed, adding it to the username string variable
function keyTyped(){
  if(currentScene == 4 && username.length < 6) username += key;
}

//When this function is called, every global variable is wiped clean, meaning the game is ready to be restarted
function reset(){
  currentScene = 1;

  atrList = [];
  enemyGroup;
  angles = [];
  completes = [];
  rounds = [];
  explosionList = [];

  loopCount1 = 0;

  lastFromWave = true;
  stageCount = 1;

  enemyGroup.removeSprites();
  shots.removeSprites();
  if(bossGroup != undefined) bossGroup.removeSprites();
  enemies.removeSprites();
  enemyShots.removeSprites();
  bossShots.removeSprites();
  explosionGroup.removeSprites();
  playerHitGroup.removeSprites();

  menuArrow = 1;
  lives = 3;
  playerX = 300;
  playing = false;
  currentScore = 0;
  left = false;
  currentPlayer.remove();

  username = "";
  backBool = true;

  xlist = [];
  ylist = [];
  last = [];
  dead = [];

  boss = false;
  firstBoss = true;
  bossLives = 15;

  playVideo = false;
}

function videoHandler() {
  if(playVideo){
    image(film, 0, 0);
    film.size(width, height);
    film.loop();
    if(frameCount > videoCount + 800){
      film.hide();
      currentScene = 1;
      playVideo = false;
      film.time(88);
    }
  }
}

//This function is used to see when certain keys have been released. It is used in stead of keyPressed as that function would 
//call multiple times while the player presses a button.
let playVideo = false;
function keyReleased() {
  //checks if spacebar has been hit on the splash screen
  if (currentScene == 0 && keyCode === 32 && !playVideo){
    playVideo = true;
    videoCount = frameCount;
  } 
  //Takes care of navigation on the menu screen
  else if (currentScene == 1){
    if (keyCode === DOWN_ARROW && (menuArrow == 1 || menuArrow == 2)) menuArrow++;
    if (keyCode === UP_ARROW && (menuArrow == 2 || menuArrow == 3)) menuArrow--;
    if (keyCode === ENTER || keyCode === 32){
      if (menuArrow == 1){
        film.pause();
        currentScene = 2;
        levelStart.play();
      }
      else if (menuArrow == 2) currentScene = 3
      else {
        currentScene = 0;
        film.pause();
        film.time(88);
        playVideo = false;
      }
    }
  }
  //Lets the player escape from the leaderboard scene
  else if(currentScene == 3 && keyCode === ESCAPE) currentScene=1;
  //Checks if enter has been pressed and a valid name has been entered on the game over scene
  else if(currentScene == 4){
    if(keyCode === BACKSPACE) backBool = true;
    if(username.length>2 && keyCode===ENTER) reset();
  }
}


let backBool = true;
function keyPressed() {
  if (currentScene == 2 && playing && keyCode === 32){
      let newShot = createSprite(playerX, 550);
      fire.play();
      newShot.addImage(shot);
      newShot.scale = 0.3;
      shots.add(newShot);
      if(poweredUp){
        let newShot2 = createSprite(playerX, 550);
        let newShot3 = createSprite(playerX, 550);
        newShot2.addImage(shot);
        newShot3.addImage(shot);
        newShot2.scale = 0.3;
        newShot3.scale = 0.3;
        powerShotGroupLeft.add(newShot2);
        powerShotGroupRight.add(newShot3);
      }
  }
  if(currentScene == 4 ) {
    if(keyCode === BACKSPACE && backBool == true){
      username = username.slice(0, -1);
      backBool = false;
    }
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
  image(startScreen, 0, 0);

  fill("white");
  textSize(20);
  text("Made by Ove Jorgensen", 275, 430);
  strokeWeight(3);
  stroke("white");
  line(552, 411, 541, 432);
  strokeWeight(1);
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


//Handles the shots fired by the player, if the player is powered up it shoots three shots at the same time.
function shotHandler() {
  for(let i=0; i<shots.length; i++){
    shots[i].position.y -= 5;
    if(shots[i].position.y < 0) shots[i].remove();
  }

  //handles powered up shots
  for(let i=0; i<powerShotGroupLeft.length; i++){
    powerShotGroupLeft[i].position.y -= 5;
    powerShotGroupLeft[i].position.x -= 1;
    if(powerShotGroupLeft[i].position.y < 0 || powerShotGroupLeft[i].position.x < 0) powerShotGroupLeft[i].remove();
  }
  for(let i=0; i<powerShotGroupRight.length; i++){
    powerShotGroupRight[i].position.y -= 5;
    powerShotGroupRight[i].position.x += 1;
    if(powerShotGroupRight[i].position.y < 0 || powerShotGroupRight[i].position.x > 700) powerShotGroupRight[i].remove();
  }
}

function enemyShotHandler(){
  for(let i=0; i<enemyShots.length; i++){
    enemyShots[i].position.y += 5;
    if(enemyShots[i].position.y > height) enemyShots[i].remove();
    if(currentPlayer.overlap(enemyShots)) {
      enemyShots[i].remove();
      lives--;

      let thisPlayerHit = createSprite(currentPlayer.position.x, currentPlayer.position.y);
      thisPlayerHit.addAnimation("explode", playerHit);
      playerHitGroup.add(thisPlayerHit);
      append(playerHitList, frameCount);
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

      let thisPlayerHit = createSprite(currentPlayer.position.x, currentPlayer.position.y);
      thisPlayerHit.addAnimation("explode", playerHit);
      playerHitGroup.add(thisPlayerHit);
      append(playerHitList, frameCount);
    }
  }
}


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

      if(!done){
        done = true;
        doneCount = frameCount + 300;
      }

      enemies.add(enemyGroup[n]);
      completes[n] = true;
      return true;
    }

    //check if enemy is dead
    enemyHit(enemyGroup[n], shots, -200, 10000000, n);
    enemyHit(enemyGroup[n], powerShotGroupLeft, -200, 10000000, n);     
    enemyHit(enemyGroup[n], powerShotGroupRight, -200, 10000000, n);
  
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
    enemyHit(enemyGroup[n], shots, -200, 10000000, n);
    enemyHit(enemyGroup[n], powerShotGroupLeft, -200, 10000000, n);     
    enemyHit(enemyGroup[n], powerShotGroupRight, -200, 10000000, n);
  
    enemyGroup[n].attractionPoint(1, atrList[n][0], atrList[n][1]);
  }
}

let dontEnter = true;
function enemyHandler() {
  let randomShot = round(random(0, 1000));
    for(let i=0; i<enemies.length; i++){
      if(i==randomShot && enemies[i].position.y < height){
        let newShot = createSprite(enemies[i].position.x, enemies[i].position.y);
        fire.play();
        newShot.addImage(enemyShot);
        newShot.scale = 0.3;
        enemyShots.add(newShot);
      }
      if(left){
          if(enemies[i].position.x < 700) enemies[i].position.x += 0.5;
          else left = false;
        }

      else{
          if(enemies[i].position.x >= 100) enemies[i].position.x -= 0.5;
          else left = true;
        }
      enemyHit(enemies[i], shots, 400, 1000, i);
      enemyHit(enemies[i], powerShotGroupLeft, 400, 1000, i);     
      enemyHit(enemies[i], powerShotGroupRight, 400, 1000, i);
    }
}

function enemyHit(currentGroup, shotGroup, moveToX, moveToY, n) {
  if(currentGroup.overlap(shotGroup)) {
    enemyDead.play();
    currentScore+=100;
    for(let j=0; j<shotGroup.length; j++){
      if(shotGroup[j].overlap(currentGroup)) shotGroup[j].remove();
    }

    let thisExplosion = createSprite(currentGroup.position.x, currentGroup.position.y);
    thisExplosion.addAnimation("regular", explosion);
    explosionGroup.add(thisExplosion);
    append(explosionList, frameCount);

    currentGroup.position.x = moveToX;
    currentGroup.position.y = moveToY;
    atrList[n] = [moveToX, moveToY];
    enemyCounter--;
  }
}

//This function is placed in the setup function and generates all the stars that will be displayed in the background when the game is playing
function starGenerator() {
    for(let i=0; i<STAR_AMOUNT; i++){
      randX = round(random(0, width));
      randY = round(random(-height, height));
      randColor = random(starColors);
      randAlph = round(random(1, 254));
      append(starList, [randX, randY, randColor, randAlph, true]);
    }
}

//Every time this function is called the stars slightly move down the screen.
function stars(){
  //When the y value reaches a certain point it is reset, creating the infinite scrolling effect of the star background
  y+=initialSpeed * starSpeed;
  if (y>=height) y=0;
  
  //This for loop re-draws all the stars for each iteration, it also handles the alpha values for each star, creating the slow blinking effect the stars has
  for(let i=0; i<starList.length; i++){
    if(starList[i][3] >= 255) starList[i][4] = false;
    else if(starList[i][3] <= 0) starList[i][4] = true;
    if(starList[i][3] <= 255 && starList[i][4] == true) starList[i][3] = starList[i][3]+10;
    if(starList[i][3] >= 0 && starList[i][4] == false) starList[i][3] = starList[i][3]-10;
    
    fill(starList[i][2][0], starList[i][2][1], starList[i][2][2], starList[i][3]);
    ellipse(starList[i][0], starList[i][1] + y, 4);
  } 
}

//This function draws the leaderboard when the leaderboard scene is requested
//if the player has not yet played it only draws the people from the json file, but if the player has completed
//a round it will include the players score in the leaderboard.
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

  //This loop takes care of placing the players from the json file in the leaderboard
  //it also sorts the current players score and places it in the leaderboard 
  let used = false;
  for(let i=0; i<=leaderboardJSON.players.length; i++){
    //if the player has not yet played only this if-sentence will be executed to ensure the json data is the only data used in the leaderboard
    if(currentPlayerStats[0] == undefined){
      if(i == leaderboardJSON.players.length) continue;
      fill(leaderboardJSON.colors[i]);
      text("NO."+ (i+1)+"  " +leaderboardJSON.players[i].name, 70, 180+i*50);
      text(" - Score: "+leaderboardJSON.players[i].score, 320, 180+i*50);
      text(" - Stage " + leaderboardJSON.players[i].stage, 680, 180+i*50);
      continue;
    }
    if(used){
      fill(leaderboardJSON.colors[i]);
      text("NO."+ (i+1)+"  " +leaderboardJSON.players[i-1].name, 70, 180+i*50);
      text(" - Score: "+leaderboardJSON.players[i-1].score, 320, 180+i*50);
      text(" - Stage " + leaderboardJSON.players[i-1].stage, 680, 180+i*50);
    }
    else if(i == leaderboardJSON.players.length || leaderboardJSON.players[i].score <= currentPlayerStats[1]){
      fill(leaderboardJSON.colors[i]);
      text("NO."+ (i+1)+"  " +currentPlayerStats[0], 70, 180+i*50);
      text(" - Score: "+currentPlayerStats[1], 320, 180+i*50);
      text(" - Stage " + currentPlayerStats[2], 680, 180+i*50);
      used = true;
    }
    else{
      fill(leaderboardJSON.colors[i]);
      text("NO."+ (i+1)+"  " +leaderboardJSON.players[i].name, 70, 180+i*50);
      text(" - Score: "+leaderboardJSON.players[i].score, 320, 180+i*50);
      text(" - Stage " + leaderboardJSON.players[i].stage, 680, 180+i*50);
    }

  }
}

//This function draws the current game statistics on the left side of the screen while playing
//it shows highscore, current player score, lives remaining and whether or not the player is powered up
function gameStats() {
  fill("black");
  rect(width-250, 0, 250, height);
  textSize(25);
  fill("red");
  text("HIGH", 800, 100);
  text("SCORE", 820, 130);
  //highscore
  fill("white");
  if(currentScore >= highscore) highscore = currentScore;
  text(highscore, 820, 160);
  //current score
  text(currentScore, 820, 280);
  //current amount of lives
  for(let i=0; i<lives; i++) image(ship1, 800+i*50, 400, 40, 40);
  //shows current powerup
  if(poweredUp) image(powerup, 800, 500, 30, 30);
}

