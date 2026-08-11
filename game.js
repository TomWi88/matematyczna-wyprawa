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
    "WYBÓR KLASY",
    "INSTRUKCJA"
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

     // INSTRUKCJA

    if(gameState === "instructions"){

        if(e.code === "Enter"){

            gameState = "menu";

        }

        return;

    }

    // ==============================================
    // MENU
    // ==============================================

    if(gameState === "menu"){

        handleMenuInput(e);

        return;

    }


    // ==============================================
    // EKRAN WYGRANEJ
    // ==============================================

    if(gameState === "win"){

        if(e.code === "Enter"){

            restartGame();

        }

        return;

    }


    // ==============================================
    // GAME OVER
    // ==============================================

    if(gameState === "gameover"){

        if(e.code === "Enter"){

            restartGame();

        }

        return;

    }


    // ==============================================
    // PYTANIE
    // ==============================================

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

    // ==============================================
    // SKOK
    // ==============================================

    if(e.code === "ArrowUp" && player.onGround){

        player.vy = player.jump;

        player.onGround = false;

    }

});


document.addEventListener("keyup", function(e){

    keys[e.code] = false;

});


// ======================================================
// MENU
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


    // Wybór klasy

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


    // ENTER

    if(e.code === "Enter"){

        // Nowa gra

        if(menuOption === 0){

            usedQuestions = [];

            restartGame();

            startGameTimer();

            loadLevel(1);

            gameState = "game";

        }


        // Instrukcja

      if(menuOption === 2){

            previousGameState = "menu";

            gameState = "instructions";

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


// ======================================================
// RYSOWANIE KOMUNIKATU
// ======================================================

function drawMessage(){

    if(messageTimer <= 0){

        return;

    }


    ctx.save();


    ctx.fillStyle = "rgba(0,0,0,0.75)";

    ctx.fillRect(
        100,
        35,
        WIDTH - 200,
        75
    );


    ctx.strokeStyle = "white";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        100,
        35,
        WIDTH - 200,
        75
    );


    ctx.fillStyle = "white";

    ctx.font = "24px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    ctx.fillText(
        gameMessage,
        WIDTH / 2,
        72
    );


    ctx.restore();


    messageTimer--;

}


// ======================================================
// POZIOM 1
// ======================================================

function createLevel1(){

    platforms = [

        {
            x: 0,
            y: 550,
            width: 1000,
            height: 50
        },

        {
            x: 120,
            y: 460,
            width: 150,
            height: 20
        },

        {
            x: 330,
            y: 400,
            width: 150,
            height: 20
        },

        {
            x: 550,
            y: 450,
            width: 150,
            height: 20
        },

        {
            x: 750,
            y: 350,
            width: 150,
            height: 20
        },

        {
            x: 850,
            y: 250,
            width: 120,
            height: 20
        }

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


// ======================================================
// POZIOM 2
// ======================================================

function createLevel2(){

    platforms = [

        {
            x: 0,
            y: 550,
            width: 1000,
            height: 50
        },

        {
            x: 100,
            y: 430,
            width: 120,
            height: 20
        },

        {
            x: 280,
            y: 500,
            width: 100,
            height: 20
        },

        {
            x: 420,
            y: 380,
            width: 130,
            height: 20
        },

        {
            x: 600,
            y: 300,
            width: 120,
            height: 20
        },

        {
            x: 760,
            y: 420,
            width: 100,
            height: 20
        },

        {
            x: 880,
            y: 280,
            width: 100,
            height: 20
        }

    ];


    scrolls = [

        {x: 160, y: 390, taken: false},
        {x: 330, y: 460, taken: false},
        {x: 480, y: 340, taken: false},
        {x: 660, y: 260, taken: false},
        {x: 810, y: 380, taken: false},

    ];


    artifact.x = 920;
    artifact.y = 220;

    artifact.taken = false;

}


// ======================================================
// POZIOM 3
// ======================================================

function createLevel3(){

    platforms = [

        {
            x: 0,
            y: 550,
            width: 1000,
            height: 50
        },

        {
            x: 80,
            y: 420,
            width: 100,
            height: 20
        },

        {
            x: 230,
            y: 330,
            width: 100,
            height: 20
        },

        {
            x: 380,
            y: 450,
            width: 100,
            height: 20
        },

        {
            x: 520,
            y: 300,
            width: 100,
            height: 20
        },

        {
            x: 670,
            y: 400,
            width: 100,
            height: 20
        },

        {
            x: 800,
            y: 260,
            width: 100,
            height: 20
        },

        {
            x: 900,
            y: 180,
            width: 100,
            height: 20
        }

    ];


    scrolls = [

        {x: 130, y: 380, taken: false},
        {x: 280, y: 290, taken: false},
        {x: 430, y: 410, taken: false},
        {x: 570, y: 260, taken: false},
        {x: 720, y: 360, taken: false},

    ];


    artifact.x = 940;
    artifact.y = 120;

    artifact.taken = false;

}


// ======================================================
// POZIOM 4
// ======================================================

function createLevel4(){

    platforms = [

        {
            x: 0,
            y: 550,
            width: 1000,
            height: 50
        },

        {
            x: 100,
            y: 450,
            width: 100,
            height: 20
        },

        {
            x: 250,
            y: 350,
            width: 100,
            height: 20
        },

        {
            x: 400,
            y: 450,
            width: 100,
            height: 20
        },

        {
            x: 550,
            y: 320,
            width: 100,
            height: 20
        },

        {
            x: 700,
            y: 220,
            width: 100,
            height: 20
        },

        {
            x: 830,
            y: 330,
            width: 100,
            height: 20
        },

        {
            x: 900,
            y: 180,
            width: 100,
            height: 20
        }

    ];


    scrolls = [

        {x: 150, y: 410, taken: false},
        {x: 300, y: 310, taken: false},
        {x: 450, y: 410, taken: false},
        {x: 600, y: 280, taken: false},
        {x: 750, y: 180, taken: false},

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

    if(level === 1){

        createLevel1();

    }

    if(level === 2){

        createLevel2();

    }

    if(level === 3){

        createLevel3();

    }

    if(level === 4){

        createLevel4();

    }


    // pozycja startowa

    player.x = 60;

    player.y = 400;

    player.vx = 0;

    player.vy = 0;

    player.onGround = false;


    updateHUD();

}


// ======================================================
// NASTĘPNY POZIOM
// ======================================================

function nextLevel(){

    levelNumber++;


    if(levelNumber > 4){

        gameState = "win";

        questionActive = false;

        return;

    }


    score += 200;

    loadLevel(levelNumber);


    showMessage(
        "🏺 Nowa wyprawa! Poziom " + levelNumber
    );

}


// ======================================================
// RYSOWANIE MENU
// ======================================================

function drawMenu(){

    ctx.fillStyle = "#31572c";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // tło

    ctx.fillStyle = "#4f772d";

    for(let i = 0; i < 12; i++){

        ctx.font = "40px serif";

        ctx.fillText(
            i % 2 === 0 ? "🌴" : "🌿",
            40 + i * 90,
            570
        );

    }


    ctx.fillStyle = "#fefae0";

    ctx.font = "46px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    ctx.fillText(
        "🏺 MATEMATYCZNA WYPRAWA 🏺",
        WIDTH / 2,
        90
    );


    ctx.font = "28px Arial";


    for(let i = 0; i < menuItems.length; i++){

        let text = menuItems[i];


        if(i === 1){

            text = "KLASA: " + selectedGrade;

        }


        ctx.fillStyle =
            i === menuOption
            ? "#ffd60a"
            : "white";


        ctx.fillText(
            (i === menuOption ? "▶ " : "") + text,
            WIDTH / 2,
            220 + i * 70
        );

    }


    ctx.font = "18px Arial";

    ctx.fillStyle = "white";

    ctx.fillText(
        "↑ ↓ wybór   ← → zmiana klasy   ENTER zatwierdź",
        WIDTH / 2,
        500
    );

}


// ======================================================
// RYSOWANIE GRACZA
// ======================================================

function drawPlayer(){

    ctx.save();


    let bounce = 0;


    if(player.vx !== 0){

        bounce = Math.sin(playerAnimation) * 3;

    }


    ctx.font = "48px serif";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    ctx.fillText(
        player.emoji,
        player.x + player.width / 2,
        player.y + player.height / 2 + bounce
    );


    ctx.restore();

}


// ======================================================
// RYSOWANIE ZWOJÓW
// ======================================================

function drawScrolls(){

    ctx.save();


    ctx.font = "34px serif";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    for(let s of scrolls){

        if(s.taken){

            continue;

        }


        let offset =
            Math.sin(animationTime + s.x) * 4;


        ctx.shadowColor = "gold";

        ctx.shadowBlur = 10;


        ctx.fillText(
            "📜",
            s.x,
            s.y + offset
        );

    }


    ctx.restore();

}


// ======================================================
// RYSOWANIE ARTEFAKTU
// ======================================================

function drawArtifact(){

    if(artifact.taken){

        return;

    }


    ctx.save();


    let offset =
        Math.sin(animationTime) * 5;


    ctx.font = "48px serif";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    ctx.shadowColor = "gold";

    ctx.shadowBlur = 20;


    ctx.fillText(
        "🏺",
        artifact.x,
        artifact.y + offset
    );


    ctx.restore();

}


// ======================================================
// RYSOWANIE PLATFORM
// ======================================================

function drawPlatforms(){

    for(let p of platforms){

        // kamień

        ctx.fillStyle = "#6d4c41";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );


        // trawa

        ctx.fillStyle = "#588157";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            6
        );

    }

}


// ======================================================
// RYSOWANIE TŁA
// ======================================================

function drawBackground(){

    // niebo

    ctx.fillStyle = "#87ceeb";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // słońce

    ctx.font = "55px serif";

    ctx.fillText(
        "☀️",
        80,
        80
    );


    // drzewa

    ctx.font = "65px serif";

    ctx.fillText("🌴", 30, 530);

    ctx.fillText("🌴", 450, 530);

    ctx.fillText("🌴", 920, 530);


    // krzewy

    ctx.font = "35px serif";

    ctx.fillText("🌿", 180, 535);

    ctx.fillText("🌿", 700, 535);

}


// ======================================================
// RYSOWANIE PYTANIA
// ======================================================

function drawQuestionWindow(){

    if(!questionActive){

        return;

    }


    ctx.save();


    ctx.fillStyle = "rgba(0,0,0,0.85)";

    ctx.fillRect(
        150,
        110,
        700,
        350
    );


    ctx.strokeStyle = "#ffd60a";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        150,
        110,
        700,
        350
    );


    ctx.textAlign = "center";


    ctx.fillStyle = "white";

    ctx.font = "32px Arial";


    let title =
        questionReward === "scroll"
        ? "📜 Zwój wiedzy!"
        : "🏺 Starożytny artefakt!";


    ctx.fillText(
        title,
        WIDTH / 2,
        175
    );


    ctx.font = "38px Arial";

    ctx.fillText(
        currentQuestion,
        WIDTH / 2,
        245
    );


    ctx.fillStyle = "yellow";

    ctx.textAlign = "center";

    ctx.font = "36px Arial";

    ctx.fillText(
        playerAnswer || "_",
        WIDTH / 2,
        320
    );


    ctx.fillStyle = "white";

    ctx.font = "20px Arial";

    ctx.fillText(
        "Wpisz odpowiedź i naciśnij ENTER",
        WIDTH / 2,
        390
    );


    ctx.restore();

}

// RYSOWANIE KAMIENI

function drawRocks(){

    if(levelNumber !== 2 && levelNumber !== 3){

        return;

    }


    ctx.save();

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    for(let rock of fallingRocks){

        ctx.save();


        ctx.translate(
            rock.x,
            rock.y
        );


        ctx.rotate(
            rock.rotation
        );


        ctx.font =
            rock.size * 1.5 + "px serif";


        ctx.fillText(
            "🗿",
            0,
            0
        );


        ctx.restore();

    }


    ctx.restore();

}

// RYSOWANIE WODY

function drawWater(){

    if(levelNumber !== 4){

        return;

    }


    ctx.save();


    // woda

    ctx.fillStyle = "rgba(30, 144, 255, 0.65)";


    ctx.fillRect(
        0,
        waterLevel,
        WIDTH,
        HEIGHT - waterLevel
    );


    // fale

    ctx.fillStyle = "rgba(255,255,255,0.5)";


    ctx.font = "24px serif";

    ctx.textAlign = "center";


    for(let x = 20; x < WIDTH; x += 50){

        ctx.fillText(
            "〰",
            x,
            waterLevel + 8
        );

    }


    ctx.restore();

}

// RYSOWANIE KOTKA

function drawCat(){

    if(!cat.active){
        return;
    }

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "45px serif";


    // lekki ruch góra-dół
    const bounce =
        Math.sin(animationTime * 4) * 3;


    ctx.fillText(
        "🐱",
        cat.x + cat.width / 2,
        cat.y + cat.height / 2 + bounce
    );


    // delikatne oznaczenie bonusu
    ctx.font = "18px Arial";

    ctx.fillStyle = "white";

    ctx.fillText(
        "+1 ❤️",
        cat.x + cat.width / 2,
        cat.y - 10
    );


    ctx.restore();

}

// ======================================================
// FUNKCJA STOPER
// ======================================================

function startGameTimer(){

    gameStartTime = performance.now();

    gameEndTime = 0;

    gameTimerRunning = true;

}

function stopGameTimer(){

    if(!gameTimerRunning){
        return;
    }

    gameEndTime = performance.now();

    gameTimerRunning = false;

}

function getGameTime(){

    if(gameTimerRunning){

        return (
            performance.now() -
            gameStartTime
        ) / 1000;

    }

    return (
        gameEndTime -
        gameStartTime
    ) / 1000;

}

function formatGameTime(seconds){

    seconds = Math.floor(seconds);

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}

function updateGameTimer(){

    const timer =
        document.getElementById("game-time");

    if(!timer){
        return;
    }

    timer.textContent =
        formatGameTime(
            getGameTime()
        );

}



// ======================================================
// KOLIZJA
// ======================================================

function intersects(a, b){

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}


// ======================================================
// RUCH GRACZA
// ======================================================

function movePlayer(){

    if(questionActive){

        return;

    }


    player.vx = 0;


    if(keys["ArrowLeft"]){

        player.vx = -player.speed;

    }


    if(keys["ArrowRight"]){

        player.vx = player.speed;

    }


    player.x += player.vx;


    // lewa krawędź

    if(player.x < 0){

        player.x = 0;

    }


    // prawa krawędź

    if(player.x + player.width > WIDTH){

        player.x = WIDTH - player.width;

    }

}


// ======================================================
// GRAWITACJA
// ======================================================

function applyGravity(){

    player.vy += gravity;

    player.y += player.vy;


    if(player.y + player.height > HEIGHT){

        player.y =
            HEIGHT - player.height;

        player.vy = 0;

        player.onGround = true;

    }

}


// ======================================================
// KOLIZJE Z PLATFORMAMI
// ======================================================

function checkPlatforms(){

    player.onGround = false;


    for(let p of platforms){

        let horizontalCollision =
            player.x + player.width > p.x &&
            player.x < p.x + p.width;


        let verticalCollision =
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + 25;


        if(
            horizontalCollision &&
            verticalCollision &&
            player.vy >= 0
        ){

            player.y =
                p.y - player.height;

            player.vy = 0;

            player.onGround = true;

        }

    }

}

// FUNKCJA TOWARZACA KOTKA

function spawnCat(){

    if(cat.active){
        return;
    }

    cat.active = true;

    cat.timer = CAT_DISPLAY_TIME;

    // losowa pozycja na planszy
    cat.x = random(50, WIDTH - 100);

    cat.y = 100;

    // Szukamy platformy pod kotkiem
    for(let p of platforms){

        if(
            cat.x + cat.width > p.x &&
            cat.x < p.x + p.width
        ){

            cat.y = p.y - cat.height;

            break;
        }
    }
}

function updateCat(){

    // Nie pokazujemy kotka poza grą
    if(gameState !== "game"){
        return;
    }

    // Jeśli kotek już jest na planszy
    if(cat.active){

        cat.timer--;

        if(cat.timer <= 0){

            cat.active = false;

            catSpawnTimer = CAT_SPAWN_TIME;

        }

        checkCatCollision();

        return;
    }


    // Odliczanie do kolejnego kotka
    catSpawnTimer--;

    if(catSpawnTimer <= 0){

        spawnCat();

    }

}

function checkCatCollision(){

    if(!cat.active){
        return;
    }

    const catBox = {

        x: cat.x,

        y: cat.y,

        width: cat.width,

        height: cat.height

    };


    if(intersects(player, catBox)){

        // dodatkowe życie
        lives++;

        updateHUD();


        // kotek znika
        cat.active = false;

        catSpawnTimer = CAT_SPAWN_TIME;


        showMessage(
            "🐱 Kotek! +1 ❤️"
        );

    }

}

// ======================================================
// ZBIERANIE ZWOJÓW
// ======================================================

function checkScrolls(){

    if(questionActive){

        return;

    }


    for(let s of scrolls){

        if(s.taken){

            continue;

        }


        let dx =
            player.x + player.width / 2 - s.x;


        let dy =
            player.y + player.height / 2 - s.y;


        let distance =
            Math.sqrt(dx * dx + dy * dy);


        if(distance < 40){

            s.taken = true;

            activeScroll = s;

            questionReward = "scroll";

            openQuestion();

            break;

        }

    }

}


// ======================================================
// SPRAWDZANIE ARTEFAKTU
// ======================================================

function checkArtifact(){

    if(questionActive){

        return;

    }


    if(artifact.taken){

        return;

    }


    const artifactBox = {

        x: artifact.x - 20,

        y: artifact.y - 30,

        width: 40,

        height: 60

    };


    if(intersects(player, artifactBox)){

        // brak wszystkich zwojów

        if(scrollsCollected < totalScrolls){

            showMessage(
                "🏺 Brakuje zwojów! " +
                scrollsCollected +
                "/" +
                totalScrolls
            );


            // natychmiastowy powrót na start

            player.x = 60;

            player.y = 400;

            player.vx = 0;

            player.vy = 0;

            player.onGround = false;


            return;

        }


        // wszystkie zwoje zebrane

        questionReward = "artifact";

        openQuestion();

    }

}


// ======================================================
// LOSOWA LICZBA
// ======================================================

function random(min, max){

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

// ======================================================
// GENEROWANIE PYTANIA
// ======================================================

function openQuestion(){

    let a;
    let b;

    let question;
    let answer;

    let attempts = 0;


    // ==================================================
    // SZUKANIE UNIKALNEGO PYTANIA
    // ==================================================

    do {

        // ==============================================
        // ZWÓJ
        // ==============================================

        if(questionReward === "scroll"){

            switch(selectedGrade){

                // --------------------------------------
                // KLASA 4
                // --------------------------------------

                case 4:

                    a = random(10, 99);
                    b = random(10, 99);

                    answer = a + b;

                    question =
                        `${a} + ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 5
                // --------------------------------------

                case 5:

                    a = random(20, 120);
                    b = random(10, 80);

                    // zabezpieczenie przed liczbą ujemną

                    if(b > a){

                        let temp = a;

                        a = b;

                        b = temp;

                    }

                    answer = a - b;

                    question =
                        `${a} - ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 6
                // --------------------------------------

                case 6:

                    a = random(2, 12);
                    b = random(2, 12);

                    answer = a * b;

                    question =
                        `${a} × ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 7
                // --------------------------------------

                case 7:

                    b = random(2, 10);

                    answer = random(2, 12);

                    a = b * answer;

                    question =
                        `${a} ÷ ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 8
                // --------------------------------------

                case 8:

                    a = random(2, 15);

                    answer = a * a;

                    question =
                        `${a}² = ?`;

                    break;

            }

        }


        // ==================================================
        // ARTEFAKT
        // ==================================================

        else{

            switch(selectedGrade){

                // --------------------------------------
                // KLASA 4
                // --------------------------------------

                case 4:

                    a = random(100, 300);

                    b = random(100, 300);

                    answer = a + b;

                    question =
                        `${a} + ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 5
                // --------------------------------------

                case 5:

                    a = random(300, 700);

                    b = random(100, 250);

                    // zabezpieczenie przed wynikiem ujemnym

                    if(b > a){

                        let temp = a;

                        a = b;

                        b = temp;

                    }

                    answer = a - b;

                    question =
                        `${a} - ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 6
                // --------------------------------------

                case 6:

                    a = random(10, 25);

                    b = random(3, 12);

                    answer = a * b;

                    question =
                        `${a} × ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 7
                // --------------------------------------

                case 7:

                    b = random(3, 12);

                    answer = random(10, 30);

                    a = b * answer;

                    question =
                        `${a} ÷ ${b} = ?`;

                    break;


                // --------------------------------------
                // KLASA 8
                // --------------------------------------

                case 8:

                    a = random(10, 30);

                    b = random(2, 10);

                    answer =
                        a * a - b;

                    question =
                        `${a}² - ${b} = ?`;

                    break;

            }

        }


        attempts++;


        // ----------------------------------------------
        // Zabezpieczenie przed nieskończoną pętlą
        // ----------------------------------------------

        if(attempts >= 100){

            break;

        }


    } while(usedQuestions.includes(question));


    // ==================================================
    // ZAPISZ PYTANIE JAKO WYKORZYSTANE
    // ==================================================

    usedQuestions.push(question);


    // ==================================================
    // PRZEKAZANIE PYTANIA DO GRY
    // ==================================================

    currentQuestion = question;

    currentAnswer = answer;

    playerAnswer = "";

    questionActive = true;

}

// ======================================================
// SPRAWDZANIE ODPOWIEDZI
// ======================================================

function checkAnswer(){

    const answer =
        Number(playerAnswer);


    // ==============================================
    // DOBRA ODPOWIEDŹ
    // ==============================================

    if(answer === currentAnswer){

        // ------------------------------------------
        // ZWÓJ
        // ------------------------------------------

        if(questionReward === "scroll"){

            score += 10;

            scrollsCollected++;


            if(activeScroll){

                activeScroll.taken = true;

            }


            activeScroll = null;


            showMessage(
                "📜 Zwój zdobyty! " +
                scrollsCollected +
                "/" +
                totalScrolls
            );

        }


        // ------------------------------------------
        // ARTEFAKT
        // ------------------------------------------

        else{

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

    }


    // ==============================================
    // ZŁA ODPOWIEDŹ
    // ==============================================

    else{

        lives--;


        // zwój wraca

        if(questionReward === "scroll"){

            if(activeScroll){

                activeScroll.taken = false;

            }

        }


        // artefakt pozostaje

        if(questionReward === "artifact"){

            artifact.taken = false;

        }


        activeScroll = null;

        playerAnswer = "";

        questionActive = false;


        showMessage(
            "❌ Zła odpowiedź! Pozostało ❤️ " +
            lives
        );


        if(lives <= 0){

            gameState = "gameover";

        }

    }


    updateHUD();

}


// ======================================================
// HUD
// ======================================================

function updateHUD(){

    const scoreElement =
        document.getElementById("score");

    const livesElement =
        document.getElementById("lives");

    const scrollElement =
        document.getElementById("scrolls");

    const levelElement =
        document.getElementById("level");


    if(scoreElement){

        scoreElement.textContent = score;

    }


    if(livesElement){

        livesElement.textContent = lives;

    }


    if(scrollElement){

        scrollElement.textContent =
            scrollsCollected + "/" + totalScrolls;

    }


    if(levelElement){

        levelElement.textContent =
            levelNumber;

    }

}

// KAMIENIE

function createRock(){

    if(questionActive){
        return;
    }

    const rock = {

        x: random(40, WIDTH - 40),

        y: -40,

        size: random(20, 32),

        speed:
            levelNumber === 2
                ? random(3, 5)
                : random(4, 7),

        rotation: 0,

        rotationSpeed: random(-0.1, 0.1),

        emoji: "🗿"
    };

    fallingRocks.push(rock);
}

function updateRocks(){

    // Kamienie tylko na poziomie 2 i 3
    if(levelNumber !== 2 && levelNumber !== 3){
        return;
    }

    // Podczas zadania wszystko się zatrzymuje
    if(questionActive){
        return;
    }

    obstacleTimer--;

    if(obstacleTimer <= 0){

        createRock();

        obstacleTimer =
            levelNumber === 2
                ? random(45, 80)
                : random(15, 25);
    }

    for(let rock of fallingRocks){

        rock.y += rock.speed;
        rock.rotation += rock.rotationSpeed;

    }

    // Najpierw sprawdzamy platformy
    checkRockPlatformCollision();

    // Następnie usuwamy kamienie,
    // które spadły poza ekran
    fallingRocks = fallingRocks.filter(
        rock => rock.y < HEIGHT + 60
    );

    // Sprawdzamy uderzenie gracza
    checkRockCollision();

}

function checkRockPlatformCollision(){

    for(let i = fallingRocks.length - 1; i >= 0; i--){

        const rock = fallingRocks[i];

        const rockLeft =
            rock.x - rock.size / 2;

        const rockRight =
            rock.x + rock.size / 2;

        const rockBottom =
            rock.y + rock.size / 2;


        for(let p of platforms){

            const platformLeft = p.x;

            const platformRight =
                p.x + p.width;


            if(

                rockRight > platformLeft &&

                rockLeft < platformRight &&

                rockBottom >= p.y &&

                rockBottom <= p.y + 20

            ){

                // 💥 Kamień uderzył w platformę
                // i natychmiast znika

                fallingRocks.splice(i, 1);

                break;

            }

        }

    }

}

// KOLIZJA Z KAMIENIAMI

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

// UTRATA ZYCIA PRZEZ PRZESZKODE

function loseLifeFromObstacle(){

    lives--;

    updateHUD();


    // krótka nietykalność

    invulnerableTimer = 90;


    // powrót na początek

    player.x = 60;

    player.y = 400;

    player.vx = 0;

    player.vy = 0;


    showMessage(
        "🗿 Kamień! Straciłeś życie. ❤️ " + lives
    );


    if(lives <= 0){

        gameState = "gameover";

    }

}

// WODA

function updateWater(){

    if(levelNumber !== 4){
        return;
    }

    // Woda rośnie cały czas, szybciej po kazdym zadaniu

    let waterSpeed = 0.025 + scrollsCollected * 0.015;

    waterLevel -= waterSpeed;

    checkWaterCollision();

}

// KOLIZJA Z WODA

function checkWaterCollision(){

    if(
        player.y + player.height >= waterLevel
    ){

        lives--;

        updateHUD();


        player.x = 60;

        player.y = 400;

        player.vx = 0;

        player.vy = 0;


        // woda cofa się trochę po błędzie

        waterLevel += 20;


        showMessage(
            "🌊 Woda Cię dogoniła! ❤️ " +
            lives
        );


        if(lives <= 0){

            gameState = "gameover";

        }

    }

}

// ======================================================
// EKRAN WYGRANEJ
// ======================================================

function drawWinScreen(){

    ctx.fillStyle = "#00633a";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    ctx.textAlign = "center";

    ctx.fillStyle = "#b69c1a";

    ctx.font = "52px Arial";

    ctx.fillText(
        "🏆 ZWYCIĘSTWO! 🏆",
        WIDTH / 2,
        150
    );

    ctx.fillStyle = "#b69c1a";

    ctx.font = "28px Arial";

    ctx.fillText(
        "Ukończyłeś wszystkie 4 poziomy!",
        WIDTH / 2,
        320
    );


    ctx.fillText(
        "Wynik: " + score,
        WIDTH / 2,
        370
    );

    ctx.fillStyle = "#b69c1a";

    ctx.font = "30px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
    "⏱️ Czas całej wyprawy: " +
    formatGameTime(getGameTime()),
    WIDTH / 2,
    420
    );

    ctx.font = "20px Arial";

    ctx.fillText(
        "Odśwież stronę, aby rozpocząć nową grę.",
        WIDTH / 2,
        500
    );

}


// ======================================================
// EKRAN GAME OVER
// ======================================================

function drawGameOverScreen(){

    ctx.fillStyle = "#370617";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    ctx.textAlign = "center";

    ctx.fillStyle = "#ff595e";

    ctx.font = "52px Arial";

    ctx.fillText(
        "💀 KONIEC WYPRAWY",
        WIDTH / 2,
        180
    );


    ctx.fillStyle = "white";

    ctx.font = "28px Arial";

    ctx.fillText(
        "Wykorzystałeś wszystkie życia.",
        WIDTH / 2,
        280
    );


    ctx.fillText(
        "Wynik: " + score,
        WIDTH / 2,
        340
    );


    ctx.font = "20px Arial";

    ctx.fillText(
        "Odśwież stronę, aby spróbować ponownie",
        WIDTH / 2,
        430
    );

}

// ======================================================
// DOTYKOWE STEROWANIE POSTACIĄ
// ======================================================

function setupTouchControls(){

    const leftButton =
        document.getElementById("touch-left");

    const rightButton =
        document.getElementById("touch-right");

    const jumpButton =
        document.getElementById("touch-jump");


    // --------------------------------------
    // LEWO
    // --------------------------------------

    leftButton.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "game"){
                return;
            }

            keys["ArrowLeft"] = true;

        }
    );


    leftButton.addEventListener(
        "pointerup",
        function(e){

            e.preventDefault();

            keys["ArrowLeft"] = false;

        }
    );


    leftButton.addEventListener(
        "pointercancel",
        function(){

            keys["ArrowLeft"] = false;

        }
    );


    leftButton.addEventListener(
        "pointerleave",
        function(){

            keys["ArrowLeft"] = false;

        }
    );


    // --------------------------------------
    // PRAWO
    // --------------------------------------

    rightButton.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "game"){
                return;
            }

            keys["ArrowRight"] = true;

        }
    );


    rightButton.addEventListener(
        "pointerup",
        function(e){

            e.preventDefault();

            keys["ArrowRight"] = false;

        }
    );


    rightButton.addEventListener(
        "pointercancel",
        function(){

            keys["ArrowRight"] = false;

        }
    );


    rightButton.addEventListener(
        "pointerleave",
        function(){

            keys["ArrowRight"] = false;

        }
    );


    // --------------------------------------
    // SKOK
    // --------------------------------------

    jumpButton.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "game"){
                return;
            }

            if(questionActive){
                return;
            }

            if(player.onGround){

                player.vy = player.jump;

                player.onGround = false;

            }

        }
    );

}

// ======================================================
// WIRTUALNA KLAWIATURA MATEMATYCZNA
// ======================================================

function setupMathKeypad(){
    const keypad = document.getElementById("math-keypad");
    if(!keypad){
        return;
    }

    const buttons = keypad.querySelectorAll("button");

    buttons.forEach(function(button){
        button.addEventListener("click", function(e){
            if(!questionActive){
                return;
            }

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
    if(!keypad){
        return;
    }

    // Dodajemy klasę active gdy pytanie jest aktywne
    if(questionActive && gameState === "game"){
        keypad.classList.add("active");
    } else {
        keypad.classList.remove("active");
    }
}

// ======================================================
// DOTYKOWE MENU
// ======================================================

function setupTouchMenu(){

    const newGameButton =
        document.getElementById("menu-new-game");

    const gradeButton =
        document.getElementById("menu-grade");

    const instructionsButton =
        document.getElementById("menu-instructions");

    const gradeDown =
        document.getElementById("grade-down");

    const gradeUp =
        document.getElementById("grade-up");

    const gradeText =
        document.getElementById("touch-grade");


    // ==============================================
    // AKTUALIZACJA KLASY
    // ==============================================

    function updateTouchGrade(){

        gradeText.textContent =
            "Klasa: " + selectedGrade;

    }


    // ==============================================
    // NOWA GRA
    // ==============================================

    newGameButton.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "menu"){
                return;
            }


            // Reset gry

            score = 0;

            lives = 3;

            levelNumber = 1;

            usedQuestions = [];


            // Reset stopera

            startGameTimer();


            // Załaduj pierwszy poziom

            loadLevel(1);


            // Uruchom grę

            gameState = "game";


            updateHUD();

        }
    );


    // ==============================================
    // WYBÓR KLASY
    // ==============================================

    gradeButton.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "menu"){
                return;
            }

            menuOption = 1;

            updateTouchGrade();

        }
    );


    // ==============================================
    // KLASA W DÓŁ
    // ==============================================

    gradeDown.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "menu"){
                return;
            }

            selectedGrade--;

            if(selectedGrade < 4){

                selectedGrade = 8;

            }

            updateTouchGrade();

        }
    );


    // ==============================================
    // KLASA W GÓRĘ
    // ==============================================

    gradeUp.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "menu"){
                return;
            }

            selectedGrade++;

            if(selectedGrade > 8){

                selectedGrade = 4;

            }

            updateTouchGrade();

        }
    );


    // ==============================================
    // INSTRUKCJA
    // ==============================================

    instructionsButton.addEventListener(
        "pointerdown",
        function(e){

            e.preventDefault();

            if(gameState !== "menu"){
                return;
            }


            alert(
`🏺 MATEMATYCZNA WYPRAWA

🎮 CEL GRY

Zbierz wszystkie 5 zwojów wiedzy,
a następnie zdobądź artefakt.

📜 Każdy zwój zawiera
zadanie matematyczne.

🏺 Artefakt również wymaga
rozwiązania zadania.

❤️ Jeśli odpowiesz źle,
tracisz jedno życie.

🐱 Kotek daje +1 życie.

🪨 Na poziomach 2 i 3
uważaj na spadające kamienie.

🌊 Na poziomie 4
uważaj na podnoszący się poziom wody.

🎮 STEROWANIE

◀  Ruch w lewo
▶  Ruch w prawo
⬆  Skok

Powodzenia, poszukiwaczu!`
            );

        }
    );


    updateTouchGrade();

}

// ======================================================
// RYSOWANIE GRY
// ======================================================

function drawInstructions(){

    ctx.fillStyle = "#31572c";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    ctx.textAlign = "center";


    // Tytuł

    ctx.fillStyle = "#ffd60a";

    ctx.font = "42px Arial";

    ctx.fillText(
        "📜 INSTRUKCJA WYPRAWY 📜",
        WIDTH / 2,
        70
    );


    // Instrukcja

    ctx.fillStyle = "white";

    ctx.font = "25px Arial";

    ctx.fillText(
        "🎯 CEL GRY",
        WIDTH / 2,
        135
    );


    ctx.font = "20px Arial";

    ctx.fillText(
        "Zbierz wszystkie zwoje wiedzy 📜",
        WIDTH / 2,
        175
    );

    ctx.fillText(
        "i rozwiąż zadania matematyczne.",
        WIDTH / 2,
        205
    );

    ctx.fillText(
        "Następnie zdobądź starożytny artefakt 🏺.",
        WIDTH / 2,
        235
    );


    // Sterowanie

    ctx.fillStyle = "#ffd60a";

    ctx.font = "25px Arial";

    ctx.fillText(
        "🎮 STEROWANIE",
        WIDTH / 2,
        285
    );


    ctx.fillStyle = "white";

    ctx.font = "20px Arial";

    ctx.fillText(
        "← →   poruszanie się",
        WIDTH / 2,
        325
    );

    ctx.fillText(
        "↑      skok",
        WIDTH / 2,
        355
    );

    ctx.fillText(
        "ENTER  zatwierdzenie odpowiedzi",
        WIDTH / 2,
        385
    );


    // Zasady

    ctx.fillStyle = "#ffd60a";

    ctx.font = "25px Arial";

    ctx.fillText(
        "🏺 ZASADY",
        WIDTH / 2,
        435
    );


    ctx.fillStyle = "white";

    ctx.font = "18px Arial";

    ctx.fillText(
        "Każdy zwój wymaga rozwiązania zadania.",
        WIDTH / 2,
        465
    );

    ctx.fillText(
        "Musisz zebrać wszystkie 5 zwojów, aby zdobyć artefakt.",
        WIDTH / 2,
        490
    );


    ctx.fillStyle = "#ffd60a";

    ctx.font = "20px Arial";

    ctx.fillText(
        "ENTER — powrót do menu",
        WIDTH / 2,
        535
    );

}

function drawGame(){

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


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


// ======================================================
// GŁÓWNA PĘTLA GRY
// ======================================================

function gameLoop(){

    animationTime += 0.05;

    playerAnimation += 0.1;


    // ==============================================
    // MENU
    // ==============================================

    if(gameState === "menu"){

        drawMenu();

        requestAnimationFrame(gameLoop);

        return;

    }


    // INSTRUKCJA

    if(gameState === "instructions"){

        drawInstructions();

        requestAnimationFrame(gameLoop);

        return;

    }


    // ==============================================
    // WYGRANA
    // ==============================================

    if(gameState === "win"){

        drawWinScreen();

        requestAnimationFrame(gameLoop);

        return;

    }


    // ==============================================
    // GAME OVER
    // ==============================================

    if(gameState === "gameover"){

        drawGameOverScreen();

        requestAnimationFrame(gameLoop);

        return;

    }


    // ==============================================
    // GRA
    // ==============================================

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
// START
// ======================================================

updateHUD();

setupTouchControls();

setupTouchMenu();

setupMathKeypad();

gameLoop();