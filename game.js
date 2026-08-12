// ======================================================
// MATEMATYCZNA WYPRAWA
// Gra edukacyjna 2D
// 4 poziomy - ręcznie zaprojektowane
// ======================================================


// ======================================================
// CANVAS
// ======================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;


// ======================================================
// STAN GRY
// ======================================================

let gameState = "menu";
let previousGameState = "menu";
let selectedGrade = 4;
let menuOption = 0;
let usedQuestions = [];

const menuItems = [
    "NOWA GRA",
    "WYBÓR KLASY"
];

let levelNumber = 1;
let score = 0;
let lives = 3;

// ======================================================
// ===== STOPER CAŁEJ GRY =====
// ======================================================

let gameStartTime = 0;
let gameEndTime = 0;
let gameTimerRunning = false;

// ======================================================
// ZWOJE
// ======================================================

let scrolls = [];
const totalScrolls = 5;
let scrollsCollected = 0;


// ======================================================
// ARTEFAKT
// ======================================================

const artifact = {
    x: 900,
    y: 200,
    width: 40,
    height: 50,
    taken: false
};

// ======================================================
// KOTEK - BONUSOWE ŻYCIE
// ======================================================

let cat = {
    active: false,
    x: 0,
    y: 0,
    width: 45,
    height: 45,
    timer: 0
};

// 10 sekund widoczności
const CAT_DISPLAY_TIME = 60 * 10;
// czas do kolejnego pojawienia się
const CAT_SPAWN_TIME = 60 * 35;
let catSpawnTimer = CAT_SPAWN_TIME;

// ======================================================
// PLATFORMS
// ======================================================

let platforms = [];
let fallingRocks = [];
let waterLevel = HEIGHT;
let obstacleTimer = 0;
let invulnerableTimer = 0;


// ======================================================
// GRACZ
// ======================================================

const player = {
    x: 60,
    y: 400,
    width: 50,
    height: 60,
    vx: 0,
    vy: 0,
    speed: 5,
    jump: -15,
    onGround: false,
    emoji: "🤠"
};


// ======================================================
// FIZYKA
// ======================================================

const gravity = 0.7;


// ======================================================
// KLAWISZE
// ======================================================

const keys = {};


// ======================================================
// ANIMACJE
// ======================================================

let animationTime = 0;
let playerAnimation = 0;


// ======================================================
// KOMUNIKATY
// ======================================================

let gameMessage = "";
let messageTimer = 0;


// ======================================================
// SYSTEM PYTAŃ
// ======================================================

let questionActive = false;
let currentQuestion = "";
let currentAnswer = 0;
let playerAnswer = "";
let questionReward = "scroll";
let activeScroll = null;


// ======================================================
// OBSŁUGA KLAWIATURY
// ======================================================

document.addEventListener("keydown", function(e){
    keys[e.code] = true;

    // MENU
    if(gameState === "menu"){
        handleMenuInput(e);
        return;
    }

    // EKRAN WYGRANEJ
    if(gameState === "win"){
        if(e.code === "Enter"){
            restartGame();
            gameState = "game";
            startGameTimer();
            loadLevel(1);
        }
        return;
    }

    // GAME OVER
    if(gameState === "gameover"){
        if(e.code === "Enter"){
            restartGame();
            gameState = "game";
            startGameTimer();
            loadLevel(1);
        }
        return;
    }

    // PYTANIE
    if(questionActive){
        if(e.key >= "0" && e.key <= "9"){
            playerAnswer += e.key;
        }
        if(e.key === "Backspace"){
            playerAnswer = playerAnswer.slice(0, -1);
        }
        if(e.key === "Enter"){
            checkAnswer();
        }
        return;
    }

    // SKOK
    if(e.code === "ArrowUp" && player.onGround){
        player.vy = player.jump;
        player.onGround = false;
    }
});

document.addEventListener("keyup", function(e){
    keys[e.code] = false;
});


// ======================================================
// MENU - LOGIKA KLAWIATURY
// ======================================================

function handleMenuInput(e){
    if(e.code === "ArrowUp"){
        menuOption--;
        if(menuOption < 0){
            menuOption = menuItems.length - 1;
        }
    }

    if(e.code === "ArrowDown"){
        menuOption++;
        if(menuOption >= menuItems.length){
            menuOption = 0;
        }
    }

    if(menuOption === 1){
        if(e.code === "ArrowLeft"){
            selectedGrade--;
            if(selectedGrade < 4){
                selectedGrade = 4;
            }
        }
        if(e.code === "ArrowRight"){
            selectedGrade++;
            if(selectedGrade > 8){
                selectedGrade = 8;
            }
        }
    }

    if(e.code === "Enter"){
        if(menuOption === 0){
            usedQuestions = [];
            restartGame();
            startGameTimer();
            gameState = "game";
            loadLevel(1);
        }
    }
}


// ======================================================
// RESTART GRY
// ======================================================

function restartGame(){
    score = 0;
    lives = 3;
    levelNumber = 1;
    scrollsCollected = 0;
    questionActive = false;
    playerAnswer = "";
    gameMessage = "";
    messageTimer = 0;
    updateHUD();
}


// ======================================================
// KOMUNIKAT
// ======================================================

function showMessage(text){
    gameMessage = text;
    messageTimer = 180;
}

function drawMessage(){
    if(messageTimer <= 0) return;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(100, 35, WIDTH - 200, 75);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 35, WIDTH - 200, 75);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(gameMessage, WIDTH / 2, 72);
    ctx.restore();

    messageTimer--;
}


// ======================================================
// POZIOMY
// ======================================================

function createLevel1(){
    platforms = [
        {x: 0, y: 550, width: 1000, height: 50},
        {x: 120, y: 460, width: 150, height: 20},
        {x: 330, y: 400, width: 150, height: 20},
        {x: 550, y: 450, width: 150, height: 20},
        {x: 750, y: 350, width: 150, height: 20},
        {x: 850, y: 250, width: 120, height: 20}
    ];

    scrolls = [
        {x: 190, y: 420, taken: false},
        {x: 400, y: 360, taken: false},
        {x: 620, y: 410, taken: false},
        {x: 800, y: 310, taken: false},
        {x: 500, y: 520, taken: false}
    ];

    artifact.x = 900;
    artifact.y = 190;
    artifact.taken = false;
}

function createLevel2(){
    platforms = [
        {x: 0, y: 550, width: 1000, height: 50},
        {x: 100, y: 430, width: 120, height: 20},
        {x: 280, y: 500, width: 100, height: 20},
        {x: 420, y: 380, width: 130, height: 20},
        {x: 600, y: 300, width: 120, height: 20},
        {x: 760, y: 420, width: 100, height: 20},
        {x: 880, y: 280, width: 100, height: 20}
    ];

    scrolls = [
        {x: 160, y: 390, taken: false},
        {x: 330, y: 460, taken: false},
        {x: 480, y: 340, taken: false},
        {x: 660, y: 260, taken: false},
        {x: 810, y: 380, taken: false}
    ];

    artifact.x = 920;
    artifact.y = 220;
    artifact.taken = false;
}

function createLevel3(){
    platforms = [
        {x: 0, y: 550, width: 1000, height: 50},
        {x: 80, y: 420, width: 100, height: 20},
        {x: 230, y: 330, width: 100, height: 20},
        {x: 380, y: 450, width: 100, height: 20},
        {x: 520, y: 300, width: 100, height: 20},
        {x: 670, y: 400, width: 100, height: 20},
        {x: 800, y: 260, width: 100, height: 20},
        {x: 900, y: 180, width: 100, height: 20}
    ];

    scrolls = [
        {x: 130, y: 380, taken: false},
        {x: 280, y: 290, taken: false},
        {x: 430, y: 410, taken: false},
        {x: 570, y: 260, taken: false},
        {x: 720, y: 360, taken: false}
    ];

    artifact.x = 940;
    artifact.y = 120;
    artifact.taken = false;
}

function createLevel4(){
    platforms = [
        {x: 0, y: 550, width: 1000, height: 50},
        {x: 100, y: 450, width: 100, height: 20},
        {x: 250, y: 350, width: 100, height: 20},
        {x: 400, y: 450, width: 100, height: 20},
        {x: 550, y: 320, width: 100, height: 20},
        {x: 700, y: 220, width: 100, height: 20},
        {x: 830, y: 330, width: 100, height: 20},
        {x: 900, y: 180, width: 100, height: 20}
    ];

    scrolls = [
        {x: 150, y: 410, taken: false},
        {x: 300, y: 310, taken: false},
        {x: 450, y: 410, taken: false},
        {x: 600, y: 280, taken: false},
        {x: 750, y: 180, taken: false}
    ];

    artifact.x = 940;
    artifact.y = 120;
    artifact.taken = false;
}


// ======================================================
// ŁADOWANIE POZIOMU
// ======================================================

function loadLevel(level){
    scrollsCollected = 0;
    questionActive = false;
    playerAnswer = "";
    activeScroll = null;
    fallingRocks = [];
    waterLevel = HEIGHT;
    obstacleTimer = 0;
    invulnerableTimer = 0;
    cat.active = false;
    cat.timer = 0;
    catSpawnTimer = CAT_SPAWN_TIME;

    if(level === 1) createLevel1();
    if(level === 2) createLevel2();
    if(level === 3) createLevel3();
    if(level === 4) createLevel4();

    player.x = 60;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;

    updateHUD();
}

function nextLevel(){
    levelNumber++;

    if(levelNumber > 4){
        gameState = "win";
        questionActive = false;
        return;
    }

    score += 200;
    loadLevel(levelNumber);
    showMessage("🏺 Nowa wyprawa! Poziom " + levelNumber);
}


// ======================================================
// RYSOWANIE MENU I ELEMENTÓW
// ======================================================

function drawMenu(){
    ctx.fillStyle = "#31572c";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#4f772d";
    for(let i = 0; i < 12; i++){
        ctx.font = "40px serif";
        ctx.fillText(i % 2 === 0 ? "🌴" : "🗿", 40 + i * 90, 570);
    }

    ctx.fillStyle = "#fefae0";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌴 MATEMATYCZNA WYPRAWA 🌴", WIDTH / 2, 90);

    ctx.font = "28px Arial";
    for(let i = 0; i < menuItems.length; i++){
        let text = menuItems[i];
        if(i === 1){
            text = "WYBIERZ KLASĘ: " + selectedGrade;
        }
        ctx.fillStyle = (i === menuOption) ? "#ffd60a" : "white";
        ctx.fillText((i === menuOption ? "▶ " : "") + text, WIDTH / 2, 180 + i * 40);
    }

    let startY = 310;
    const lineHeight = 30;
    const textLines = [
        "Arytmetyka to starożytna nauka,",
        "jej tajemnice czekają na Ciebie w Zwojach Wiedzy📜.",
        "Poruszaj się bohaterem🤠 za pomocą strzałek lub przycisków.",
        "Znajdź kotki🐱, które dają Ci dodatkowe życie.",
        "Zdobądź wszystkie artefakty🏺 w jak najkrótszym czasie⏱️."
    ];

    ctx.font = "22px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    textLines.forEach((line, index) => {
        ctx.fillText(line, WIDTH / 2, startY + (index * lineHeight));
    });

    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffd60a";
    ctx.fillText("Dotknij ekranu lub naciśnij ENTER, aby rozpocząć", WIDTH / 2, 500);
}

function drawPlayer(){
    ctx.save();
    let bounce = (player.vx !== 0) ? Math.sin(playerAnimation) * 3 : 0;
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.emoji, player.x + player.width / 2, player.y + player.height / 2 + bounce);
    ctx.restore();
}

function drawScrolls(){
    ctx.save();
    ctx.font = "34px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for(let s of scrolls){
        if(s.taken) continue;
        let offset = Math.sin(animationTime + s.x) * 4;
        ctx.shadowColor = "gold";
        ctx.shadowBlur = 10;
        ctx.fillText("📜", s.x, s.y + offset);
    }
    ctx.restore();
}

function drawArtifact(){
    if(artifact.taken) return;

    ctx.save();
    let offset = Math.sin(animationTime) * 5;
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "gold";
    ctx.shadowBlur = 20;
    ctx.fillText("🏺", artifact.x, artifact.y + offset);
    ctx.restore();
}

function drawPlatforms(){
    for(let p of platforms){
        ctx.fillStyle = "#6d4c41";
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "#588157";
        ctx.fillRect(p.x, p.y, p.width, 6);
    }
}

function drawBackground(){
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.font = "55px serif";
    ctx.fillText("☀️", 80, 80);

    ctx.font = "65px serif";
    ctx.fillText("🌴", 30, 530);
    ctx.fillText("🌴", 450, 530);
    ctx.fillText("🌴", 920, 530);

    ctx.font = "35px serif";
    ctx.fillText("🌿", 180, 535);
    ctx.fillText("🌿", 700, 535);
}

function drawQuestionWindow(){
    if(!questionActive) return;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(150, 110, 700, 350);

    ctx.strokeStyle = "#ffd60a";
    ctx.lineWidth = 4;
    ctx.strokeRect(150, 110, 700, 350);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";

    let title = (questionReward === "scroll") ? "📜 Zwój wiedzy!" : "🏺 Starożytny artefakt!";
    ctx.fillText(title, WIDTH / 2, 175);

    ctx.font = "38px Arial";
    ctx.fillText(currentQuestion, WIDTH / 2, 245);

    ctx.fillStyle = "yellow";
    ctx.font = "36px Arial";
    ctx.fillText(playerAnswer || "_", WIDTH / 2, 320);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Wpisz odpowiedź na klawiaturze i naciśnij ENTER / ✓", WIDTH / 2, 390);

    ctx.restore();
}

function drawRocks(){
    if(levelNumber !== 2 && levelNumber !== 3) return;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for(let rock of fallingRocks){
        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.rotate(rock.rotation);
        ctx.font = rock.size * 1.5 + "px serif";
        ctx.fillText("🗿", 0, 0);
        ctx.restore();
    }
    ctx.restore();
}

function drawWater(){
    if(levelNumber !== 4) return;

    ctx.save();
    ctx.fillStyle = "rgba(30, 144, 255, 0.65)";
    ctx.fillRect(0, waterLevel, WIDTH, HEIGHT - waterLevel);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "24px serif";
    ctx.textAlign = "center";

    for(let x = 20; x < WIDTH; x += 50){
        ctx.fillText("〰", x, waterLevel + 8);
    }
    ctx.restore();
}

function drawCat(){
    if(!cat.active) return;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "45px serif";

    const bounce = Math.sin(animationTime * 4) * 3;
    ctx.fillText("🐱", cat.x + cat.width / 2, cat.y + cat.height / 2 + bounce);

    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("+1 ❤️", cat.x + cat.width / 2, cat.y - 10);
    ctx.restore();
}


// ======================================================
// STOPER
// ======================================================

function startGameTimer(){
    gameStartTime = performance.now();
    gameEndTime = 0;
    gameTimerRunning = true;
}

function stopGameTimer(){
    if(!gameTimerRunning) return;
    gameEndTime = performance.now();
    gameTimerRunning = false;
}

function getGameTime(){
    if(gameTimerRunning){
        return (performance.now() - gameStartTime) / 1000;
    }
    return (gameEndTime - gameStartTime) / 1000;
}

function formatGameTime(seconds){
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
        String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

function updateGameTimer(){
    const timer = document.getElementById("game-time");
    if(timer){
        timer.textContent = formatGameTime(getGameTime());
    }
}


// ======================================================
// FIZYKA I LOGIKA
// ======================================================

function intersects(a, b){
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function movePlayer(){
    if(questionActive) return;

    player.vx = 0;
    if(keys["ArrowLeft"]) player.vx = -player.speed;
    if(keys["ArrowRight"]) player.vx = player.speed;

    player.x += player.vx;
    if(player.x < 0) player.x = 0;
    if(player.x + player.width > WIDTH) player.x = WIDTH - player.width;
}

function applyGravity(){
    player.vy += gravity;
    player.y += player.vy;

    if(player.y + player.height > HEIGHT){
        player.y = HEIGHT - player.height;
        player.vy = 0;
        player.onGround = true;
    }
}

function checkPlatforms(){
    player.onGround = false;

    for(let p of platforms){
        let horizontalCollision =
            player.x + player.width > p.x && player.x < p.x + p.width;
        let verticalCollision =
            player.y + player.height >= p.y && player.y + player.height <= p.y + 25;

        if(horizontalCollision && verticalCollision && player.vy >= 0){
            player.y = p.y - player.height;
            player.vy = 0;
            player.onGround = true;
        }
    }
}

function spawnCat(){
    if(cat.active) return;
    cat.active = true;
    cat.timer = CAT_DISPLAY_TIME;
    cat.x = random(50, WIDTH - 100);
    cat.y = 100;

    for(let p of platforms){
        if(cat.x + cat.width > p.x && cat.x < p.x + p.width){
            cat.y = p.y - cat.height;
            break;
        }
    }
}

function updateCat(){
    if(gameState !== "game") return;

    if(cat.active){
        cat.timer--;
        if(cat.timer <= 0){
            cat.active = false;
            catSpawnTimer = CAT_SPAWN_TIME;
        }
        checkCatCollision();
        return;
    }

    catSpawnTimer--;
    if(catSpawnTimer <= 0){
        spawnCat();
    }
}

function checkCatCollision(){
    if(!cat.active) return;

    const catBox = {x: cat.x, y: cat.y, width: cat.width, height: cat.height};
    if(intersects(player, catBox)){
        lives++;
        updateHUD();
        cat.active = false;
        catSpawnTimer = CAT_SPAWN_TIME;
        showMessage("🐱 Kotek! +1 ❤️");
    }
}

function checkScrolls(){
    if(questionActive) return;

    for(let s of scrolls){
        if(s.taken) continue;

        let dx = player.x + player.width / 2 - s.x;
        let dy = player.y + player.height / 2 - s.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < 40){
            s.taken = true;
            activeScroll = s;
            questionReward = "scroll";
            openQuestion();
            break;
        }
    }
}

function checkArtifact(){
    if(questionActive || artifact.taken) return;

    const artifactBox = {
        x: artifact.x - 20,
        y: artifact.y - 30,
        width: 40,
        height: 60
    };

    if(intersects(player, artifactBox)){
        if(scrollsCollected < totalScrolls){
            showMessage("🏺 Brakuje zwojów! " + scrollsCollected + "/" + totalScrolls);
            player.x = 60;
            player.y = 400;
            player.vx = 0;
            player.vy = 0;
            player.onGround = false;
            return;
        }
        questionReward = "artifact";
        openQuestion();
    }
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// ======================================================
// GENEROWANIE I SPRAWDZANIE PYTAŃ
// ======================================================

function openQuestion(){
    let a, b, question, answer;
    let attempts = 0;

    do {
        if(questionReward === "scroll"){
            switch(selectedGrade){
                case 4:
                    a = random(10, 99); b = random(10, 99);
                    answer = a + b; question = `${a} + ${b} = ?`;
                    break;
                case 5:
                    a = random(20, 120); b = random(10, 80);
                    if(b > a){ let temp = a; a = b; b = temp; }
                    answer = a - b; question = `${a} - ${b} = ?`;
                    break;
                case 6:
                    a = random(2, 12); b = random(2, 12);
                    answer = a * b; question = `${a} × ${b} = ?`;
                    break;
                case 7:
                    b = random(2, 10); answer = random(2, 12); a = b * answer;
                    question = `${a} ÷ ${b} = ?`;
                    break;
                case 8:
                    a = random(2, 15); answer = a * a;
                    question = `${a}² = ?`;
                    break;
            }
        } else {
            switch(selectedGrade){
                case 4:
                    a = random(100, 300); b = random(100, 300);
                    answer = a + b; question = `${a} + ${b} = ?`;
                    break;
                case 5:
                    a = random(300, 700); b = random(100, 250);
                    if(b > a){ let temp = a; a = b; b = temp; }
                    answer = a - b; question = `${a} - ${b} = ?`;
                    break;
                case 6:
                    a = random(10, 25); b = random(3, 12);
                    answer = a * b; question = `${a} × ${b} = ?`;
                    break;
                case 7:
                    b = random(3, 12); answer = random(10, 30); a = b * answer;
                    question = `${a} ÷ ${b} = ?`;
                    break;
                case 8:
                    a = random(10, 30); b = random(2, 10);
                    answer = a * a - b; question = `${a}² - ${b} = ?`;
                    break;
            }
        }
        attempts++;
        if(attempts >= 100) break;
    } while(usedQuestions.includes(question));

    usedQuestions.push(question);
    currentQuestion = question;
    currentAnswer = answer;
    playerAnswer = "";
    questionActive = true;
}

function checkAnswer(){
    const answer = Number(playerAnswer);

    if(answer === currentAnswer){
        if(questionReward === "scroll"){
            score += 10;
            scrollsCollected++;
            if(activeScroll) activeScroll.taken = true;
            activeScroll = null;
            showMessage("📜 Zwój zdobyty! " + scrollsCollected + "/" + totalScrolls);
        } else {
            score += 100;
            artifact.taken = true;
            questionActive = false;
            updateHUD();

            if(levelNumber === 4){
                stopGameTimer();
                gameState = "win";
                return;
            }
            nextLevel();
            return;
        }
        questionActive = false;
    } else {
        lives--;
        if(questionReward === "scroll" && activeScroll) activeScroll.taken = false;
        if(questionReward === "artifact") artifact.taken = false;

        activeScroll = null;
        playerAnswer = "";
        questionActive = false;

        showMessage("❌ Zła odpowiedź! Pozostało ❤️ " + lives);
        if(lives <= 0) gameState = "gameover";
    }
    updateHUD();
}


// ======================================================
// HUD & PRZESZKODY
// ======================================================

function updateHUD(){
    const scoreElement = document.getElementById("score");
    const livesElement = document.getElementById("lives");
    const scrollElement = document.getElementById("scrolls");
    const levelElement = document.getElementById("level");

    if(scoreElement) scoreElement.textContent = score;
    if(livesElement) livesElement.textContent = lives;
    if(scrollElement) scrollElement.textContent = scrollsCollected + "/" + totalScrolls;
    if(levelElement) levelElement.textContent = levelNumber;
}

function createRock(){
    if(questionActive) return;
    const rock = {
        x: random(40, WIDTH - 40),
        y: -40,
        size: random(20, 32),
        speed: (levelNumber === 2) ? random(3, 5) : random(4, 7),
        rotation: 0,
        rotationSpeed: random(-0.1, 0.1),
        emoji: "🗿"
    };
    fallingRocks.push(rock);
}

function updateRocks(){
    if(levelNumber !== 2 && levelNumber !== 3) return;
    if(questionActive) return;

    obstacleTimer--;
    if(obstacleTimer <= 0){
        createRock();
        obstacleTimer = (levelNumber === 2) ? random(45, 80) : random(15, 25);
    }

    for(let rock of fallingRocks){
        rock.y += rock.speed;
        rock.rotation += rock.rotationSpeed;
    }

    checkRockPlatformCollision();
    fallingRocks = fallingRocks.filter(rock => rock.y < HEIGHT + 60);
    checkRockCollision();
}

function checkRockPlatformCollision(){
    for(let i = fallingRocks.length - 1; i >= 0; i--){
        const rock = fallingRocks[i];
        const rockLeft = rock.x - rock.size / 2;
        const rockRight = rock.x + rock.size / 2;
        const rockBottom = rock.y + rock.size / 2;

        for(let p of platforms){
            if(rockRight > p.x && rockLeft < p.x + p.width && rockBottom >= p.y && rockBottom <= p.y + 20){
                fallingRocks.splice(i, 1);
                break;
            }
        }
    }
}

function checkRockCollision(){
    if(invulnerableTimer > 0){
        invulnerableTimer--;
        return;
    }

    for(let rock of fallingRocks){
        const rockBox = {
            x: rock.x - rock.size / 2,
            y: rock.y - rock.size / 2,
            width: rock.size,
            height: rock.size
        };
        if(intersects(player, rockBox)){
            loseLifeFromObstacle();
            break;
        }
    }
}

function loseLifeFromObstacle(){
    lives--;
    updateHUD();
    invulnerableTimer = 90;
    player.x = 60;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;

    showMessage("🗿 Kamień! Straciłeś życie. ❤️ " + lives);
    if(lives <= 0) gameState = "gameover";
}

function updateWater(){
    if(levelNumber !== 4) return;
    let waterSpeed = 0.025 + scrollsCollected * 0.015;
    waterLevel -= waterSpeed;
    checkWaterCollision();
}

function checkWaterCollision(){
    if(player.y + player.height >= waterLevel){
        lives--;
        updateHUD();
        player.x = 60;
        player.y = 400;
        player.vx = 0;
        player.vy = 0;
        waterLevel += 20;

        showMessage("🌊 Woda Cię dogoniła! ❤️ " + lives);
        if(lives <= 0) gameState = "gameover";
    }
}


// ======================================================
// EKRANY WYGRANEJ I PRZEGRANEJ
// ======================================================

function drawWinScreen(){
    ctx.fillStyle = "#00633a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.fillStyle = "#b69c1a";
    ctx.font = "52px Arial";
    ctx.fillText("🏆 ZWYCIĘSTWO! 🏆", WIDTH / 2, 150);

    ctx.font = "28px Arial";
    ctx.fillText("Ukończyłeś wszystkie 4 poziomy!", WIDTH / 2, 320);
    ctx.fillText("Wynik: " + score, WIDTH / 2, 370);

    ctx.font = "30px Arial";
    ctx.fillText("⏱️ Czas wyprawy: " + formatGameTime(getGameTime()), WIDTH / 2, 420);

    ctx.font = "20px Arial";
    ctx.fillText("Naciśnij ENTER lub dotknij ekranu, aby grać ponownie.", WIDTH / 2, 500);
}

function drawGameOverScreen(){
    ctx.fillStyle = "#370617";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ff595e";
    ctx.font = "52px Arial";
    ctx.fillText("💀 KONIEC WYPRAWY", WIDTH / 2, 180);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText("Wykorzystałeś wszystkie życia.", WIDTH / 2, 280);
    ctx.fillText("Wynik: " + score, WIDTH / 2, 340);

    ctx.font = "20px Arial";
    ctx.fillText("Naciśnij ENTER lub dotknij ekranu, aby spróbować ponownie.", WIDTH / 2, 430);
}


// ======================================================
// OBSŁUGA DOTYKU DLA CANVAS
// ======================================================

function setupCanvasTouch(){
    canvas.addEventListener("pointerdown", function(e){
        e.preventDefault();

        if(gameState === "menu"){
            const rect = canvas.getBoundingClientRect();
            const scaleY = canvas.height / rect.height;
            const clickY = (e.clientY - rect.top) * scaleY;

            // Dotknięcie opcji wyboru klasy na płótnie
            if(clickY > 200 && clickY < 240){
                menuOption = 1;
                selectedGrade++;
                if(selectedGrade > 8) selectedGrade = 4;

                const gradeText = document.getElementById("touch-grade");
                if(gradeText) gradeText.textContent = "Klasa: " + selectedGrade;
                return;
            }

            // Rozpoczęcie nowej gry po dotknięciu canvasu
            usedQuestions = [];
            restartGame();
            startGameTimer();
            gameState = "game";
            loadLevel(1);
            return;
        }

        if(gameState === "win" || gameState === "gameover"){
            usedQuestions = [];
            restartGame();
            startGameTimer();
            gameState = "game";
            loadLevel(1);
            return;
        }
    });
}


// ======================================================
// DOTYKOWE STEROWANIE I KLAWIATURA NUMERYCZNA
// ======================================================

function setupTouchControls(){
    const leftButton = document.getElementById("touch-left");
    const rightButton = document.getElementById("touch-right");
    const jumpButton = document.getElementById("touch-jump");

    if(!leftButton || !rightButton || !jumpButton) return;

    // LEWO
    leftButton.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState === "game") keys["ArrowLeft"] = true;
    });
    leftButton.addEventListener("pointerup", function(e){ e.preventDefault(); keys["ArrowLeft"] = false; });
    leftButton.addEventListener("pointercancel", function(){ keys["ArrowLeft"] = false; });
    leftButton.addEventListener("pointerleave", function(){ keys["ArrowLeft"] = false; });

    // PRAWO
    rightButton.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState === "game") keys["ArrowRight"] = true;
    });
    rightButton.addEventListener("pointerup", function(e){ e.preventDefault(); keys["ArrowRight"] = false; });
    rightButton.addEventListener("pointercancel", function(){ keys["ArrowRight"] = false; });
    rightButton.addEventListener("pointerleave", function(){ keys["ArrowRight"] = false; });

    // SKOK
    jumpButton.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState !== "game" || questionActive) return;
        if(player.onGround){
            player.vy = player.jump;
            player.onGround = false;
        }
    });
}

function setupMathKeypad(){
    const keypad = document.getElementById("math-keypad");
    if(!keypad) return;

    const buttons = keypad.querySelectorAll("button");
    buttons.forEach(function(button){
        button.addEventListener("pointerdown", function(e){
            e.preventDefault();
            if(!questionActive) return;

            const key = button.getAttribute("data-key");
            if(key !== null && key.length === 1 && key >= "0" && key <= "9"){
                playerAnswer += key;
            } else if(key === "backspace"){
                playerAnswer = playerAnswer.slice(0, -1);
            } else if(key === "enter"){
                checkAnswer();
            }
        });
    });
}

function updateMathKeypad(){
    const keypad = document.getElementById("math-keypad");
    if(!keypad) return;

    if(questionActive && gameState === "game"){
        keypad.classList.add("active");
    } else {
        keypad.classList.remove("active");
    }
}

function setupTouchMenu(){
    const newGameButton = document.getElementById("menu-new-game");
    const gradeButton = document.getElementById("menu-grade");
    const gradeDown = document.getElementById("grade-down");
    const gradeUp = document.getElementById("grade-up");
    const gradeText = document.getElementById("touch-grade");

    if(!newGameButton || !gradeButton || !gradeDown || !gradeUp || !gradeText) return;

    function updateTouchGrade(){
        gradeText.textContent = "Klasa: " + selectedGrade;
    }

    newGameButton.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState !== "menu") return;

        score = 0;
        lives = 3;
        levelNumber = 1;
        usedQuestions = [];

        startGameTimer();
        gameState = "game"; // Zmiana stanu następuje przed ładowaniem poziomu
        loadLevel(1);
        updateHUD();
    });

    gradeButton.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState !== "menu") return;
        menuOption = 1;
        selectedGrade++;
        if(selectedGrade > 8) selectedGrade = 4;
        updateTouchGrade();
    });

    gradeDown.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState !== "menu") return;
        selectedGrade--;
        if(selectedGrade < 4) selectedGrade = 8;
        updateTouchGrade();
    });

    gradeUp.addEventListener("pointerdown", function(e){
        e.preventDefault();
        if(gameState !== "menu") return;
        selectedGrade++;
        if(selectedGrade > 8) selectedGrade = 4;
        updateTouchGrade();
    });

    updateTouchGrade();
}


// ======================================================
// PĘTLA GRY
// ======================================================

function drawGame(){
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawBackground();
    drawPlatforms();
    drawScrolls();
    drawArtifact();
    drawRocks();
    drawCat();
    drawPlayer();
    drawWater();
    drawQuestionWindow();
    drawMessage();
}

function gameLoop(){
    animationTime += 0.05;
    playerAnimation += 0.1;

    if(gameState === "menu"){
        drawMenu();
        requestAnimationFrame(gameLoop);
        return;
    }

    if(gameState === "win"){
        drawWinScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    if(gameState === "gameover"){
        drawGameOverScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    movePlayer();
    applyGravity();
    checkPlatforms();
    checkScrolls();
    checkArtifact();
    updateRocks();
    updateWater();
    updateCat();
    updateGameTimer();
    updateMathKeypad();

    drawGame();

    requestAnimationFrame(gameLoop);
}


// ======================================================
// START GRY
// ======================================================

updateHUD();
setupCanvasTouch();
setupTouchControls();
setupTouchMenu();
setupMathKeypad();
gameLoop();