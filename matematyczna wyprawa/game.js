const canvas=document.getElementById("game");

const ctx=canvas.getContext("2d");

const WIDTH=canvas.width;

const HEIGHT=canvas.height;

// ===== MENU =====

let gameState = "menu";

let selectedGrade = 4;

let menuOption = 0;

const menuItems = [
    "NOWA GRA",
    "WYBÓR KLASY",
    "INSTRUKCJA"
];

//======================

let score=0;

let coinsCollected=0;

let lives=3;

let scrollsCollected = 0;

let totalScrolls = 6;

let gameMessage = "";

let messageTimer = 0;


// ===== Okno zadania =====

let questionActive = false;

let currentQuestion = "";

let currentAnswer = 0;

let playerAnswer = "";

//======================

let questionReward = "coin";

let animationTime = 0;

let playerAnimation = 0;

let levelNumber = 1;


const player={

x:60,

y:420,

width:50,

height:60,

vx:0,

vy:0,

speed:5,

jump:-15,

onGround:false,

emoji:"🤠"

};



//======================

const gravity=0.7;



//======================

const keys={};



document.addEventListener("keydown",(e)=>{

keys[e.code]=true;

});

document.addEventListener("keydown",(e)=>{

    if(!questionActive) return;

    if(e.key>="0" && e.key<="9"){

        playerAnswer+=e.key;

    }

    if(e.key=="Backspace"){

        playerAnswer=playerAnswer.slice(0,-1);

    }

    if(e.key=="Enter"){

        checkAnswer();

    }

});

document.addEventListener("keydown",(e)=>{

    if(gameState!="menu") return;

    if(e.code=="ArrowUp"){

        menuOption--;

        if(menuOption<0)
            menuOption=menuItems.length-1;

    }

    if(e.code=="ArrowDown"){

        menuOption++;

        if(menuOption>=menuItems.length)
            menuOption=0;

    }

    if(menuOption==1){

        if(e.code=="ArrowLeft"){

            selectedGrade--;

            if(selectedGrade<4)
                selectedGrade=4;

        }

        if(e.code=="ArrowRight"){

            selectedGrade++;

            if(selectedGrade>8)
                selectedGrade=8;

        }

    }

    if(e.code=="Enter"){

        if(menuOption==0){

        generateLevel();

        gameState="game";

        }

        if(menuOption==2){

            alert(
`Sterowanie

← →
Ruch

↑
Skok

Dotknij artefaktu
i rozwiąż zadanie matematyczne.`
            );

        }

    }

});

document.addEventListener("keyup",(e)=>{

keys[e.code]=false;

});

let platforms=[];

let coins=[];

const artifact={

x:900,

y:240,

width:30,

height:45,

taken:false

};

function drawMenu(){

    ctx.fillStyle="#74c365";
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    ctx.fillStyle="#3d2b1f";
    ctx.font="48px Arial";
    ctx.textAlign="center";

    ctx.fillText("🏺 Matematyczna Wyprawa 🏺",WIDTH/2,100);

    ctx.font="30px Arial";

    for(let i=0;i<menuItems.length;i++){

        ctx.fillStyle=(i===menuOption) ? "yellow" : "white";

        let text=menuItems[i];

        if(i===1){

            text=`Klasa: ${selectedGrade}`;

        }

        ctx.fillText(text,WIDTH/2,220+i*70);

    }

    ctx.font="20px Arial";
    ctx.fillStyle="white";

    ctx.fillText(
        "↑ ↓ wybór   ← → zmiana klasy   ENTER start",
        WIDTH/2,
        520
    );

}

function generateLevel(){

    scrollsCollected = 0;

    platforms=[];

    coins=[];


    // główna ziemia

    platforms.push({

        x:0,

        y:550,

        width:1200,

        height:50

    });



    let platformCount=7;


    for(let i=0;i<platformCount;i++){


        platforms.push({

            x:120+i*140,

            y:random(300,480),

            width:random(120,200),

            height:20

        });


    }



    // generowanie zwojów wiedzy

    for(let i=0;i<totalScrolls;i++){


        let p=platforms[random(1,platforms.length-1)];


        coins.push({

            x:p.x+random(20,p.width-20),

            y:p.y-30,

            r:20,

            taken:false

        });


    }



    // artefakt końcowy

    let lastPlatform=
        platforms[platforms.length-1];


    artifact.x=
        lastPlatform.x+
        lastPlatform.width/2;


    artifact.y=
        lastPlatform.y-60;


    artifact.taken=false;


}

function nextLevel(){

    levelNumber++;


    score += 200;


    document.getElementById("score").textContent=score;


    document.getElementById("level").textContent =
    "🌴 Poziom: " + levelNumber;



    generateLevel();



    player.x=60;

    player.y=400;

    player.vx=0;

    player.vy=0;


}

function drawPlayer(){

    ctx.save();


    let bounce=0;


    if(player.vx!==0){

        bounce=Math.sin(playerAnimation)*3;

    }


    ctx.font="48px serif";

    ctx.textAlign="center";

    ctx.textBaseline="middle";

    ctx.fillText(
        player.emoji,
        player.x+25,
        player.y+30+bounce
);

    ctx.restore();

}

function drawPlatforms(){

    ctx.fillStyle="#6d4c41";

    for(let p of platforms){

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

    }

}

function drawCoins(){

    ctx.save();

    ctx.font="32px serif";

    ctx.textAlign="center";

    ctx.textBaseline="middle";


    for(let c of coins){

        if(c.taken) continue;


        // lekka animacja unoszenia monety

        let offset=Math.sin(animationTime+c.x)*3;


        ctx.shadowColor="gold";

        ctx.shadowBlur=10;


        ctx.fillText(

            "📜",

            c.x,

            c.y+offset

        );

    }


    ctx.restore();

}

function drawArtifact(){

    if(artifact.taken) return;

    ctx.save();

    const offset = Math.sin(animationTime) * 5;

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

function draw(){

ctx.clearRect(

0,

0,

WIDTH,

HEIGHT

);

drawPlatforms();

drawCoins();

drawArtifact();

drawPlayer();

drawQuestionWindow();

drawMessage();

}

function intersects(a,b){

    return (

        a.x < b.x+b.width &&
        a.x+a.width > b.x &&
        a.y < b.y+b.height &&
        a.y+a.height > b.y

    );

}

function movePlayer(){

if(questionActive) return;

    player.vx=0;

    if(keys["ArrowLeft"]){

        player.vx=-player.speed;

    }

    if(keys["ArrowRight"]){

        player.vx=player.speed;

    }

    player.x+=player.vx;

}

function applyGravity(){

    player.vy+=gravity;

    player.y+=player.vy;

}

document.addEventListener("keydown",(e)=>{

    if(e.code=="ArrowUp" && player.onGround){

        player.vy=player.jump;

        player.onGround=false;

    }

});

function checkPlatforms(){

    player.onGround=false;

    for(let p of platforms){

        if(

            player.x+player.width>p.x &&
            player.x<p.x+p.width &&

            player.y+player.height>=p.y &&
            player.y+player.height<=p.y+25 &&

            player.vy>=0

        ){

            player.y=p.y-player.height;

            player.vy=0;

            player.onGround=true;

        }

    }

}

function checkCoins(){

    if(questionActive) return;

    for(let c of coins){

        if(c.taken) continue;

        let dx = player.x + player.width/2 - c.x;
        let dy = player.y + player.height/2 - c.y;

        if(Math.sqrt(dx*dx + dy*dy) < 30){

            c.taken = true;

            questionReward = "coin";

            openQuestion();

            break;

        }

    }

}

function openQuestion(){

    let a,b;

    if(questionReward === "coin"){

        // łatwiejsze zadania

        switch(selectedGrade){

            case 4:
                a=random(10,99);
                b=random(10,99);
                currentAnswer=a+b;
                currentQuestion=`${a} + ${b} = ?`;
                break;

            case 5:
                a=random(20,120);
                b=random(10,80);
                currentAnswer=a-b;
                currentQuestion=`${a} - ${b} = ?`;
                break;

            case 6:
                a=random(2,12);
                b=random(2,12);
                currentAnswer=a*b;
                currentQuestion=`${a} × ${b} = ?`;
                break;

            case 7:
                b=random(2,10);
                currentAnswer=random(2,12);
                a=b*currentAnswer;
                currentQuestion=`${a} ÷ ${b} = ?`;
                break;

            case 8:
                a=random(2,15);
                currentAnswer=a*a;
                currentQuestion=`${a}² = ?`;
                break;

        }

    }else{

        // trudniejsze zadania dla artefaktu

        a=random(100,999);
        b=random(100,999);

        currentQuestion=`${a} + ${b} = ?`;

        currentAnswer=a+b;

    }

    playerAnswer="";
    questionActive=true;

}

function drawQuestionWindow(){

    if(!questionActive) return;

    ctx.fillStyle="rgba(0,0,0,0.75)";
    ctx.fillRect(180,120,640,320);

    ctx.strokeStyle="white";
    ctx.lineWidth=4;
    ctx.strokeRect(180,120,640,320);

    ctx.fillStyle="white";

    ctx.font="36px Arial";

    ctx.fillText(
    questionReward=="coin" ? "📜 Zagadka" : "🏺 Artefakt",
    320,
    180
);

    ctx.font="32px Arial";

    ctx.fillText(currentQuestion,320,250);

    ctx.fillStyle="yellow";

    ctx.fillText(playerAnswer,320,320);

    ctx.fillStyle="white";

    ctx.font="22px Arial";

    ctx.fillText("Wpisz wynik i naciśnij ENTER",390,390);

}

function checkArtifact(){

    if(questionActive) return;

    if(artifact.taken) return;


    if(intersects(player,artifact)){


        if(scrollsCollected < totalScrolls){


            showMessage(
                "🏺 Brakuje zwojów wiedzy 📜 ("+
                scrollsCollected+
                "/"+
                totalScrolls+
                ")"
            );


            // powrót na początek mapy

            player.x=60;

            player.y=400;

            player.vx=0;

            player.vy=0;


            return;

        }



        artifact.taken=true;


        questionReward="artifact";


        openQuestion();


    }

}

function checkAnswer(){

    if(Number(playerAnswer) === currentAnswer){

     if(questionReward === "coin"){

        score += 10;

        scrollsCollected++;


        document.getElementById("scrolls").textContent =
        scrollsCollected;

        }
        
        else{

        score += 100;

        document.getElementById("score").textContent = score;


        questionActive=false;


        setTimeout(()=>{

        alert(
        "🏺 Zdobyłeś artefakt!\n\n" +
        "Rozpoczyna się kolejna wyprawa!"
        );


        nextLevel();


    },100);

}

        document.getElementById("score").textContent = score;

        questionActive = false;

    }else{

        lives--;

        document.getElementById("lives").textContent = lives;

        if(questionReward === "coin"){

            // źle odpowiedział - moneta wraca
            for(let c of coins){

                if(c.taken){

                    c.taken = false;
                    break;

                }

            }

        }else{

            artifact.taken = false;

        }

        playerAnswer = "";

        questionActive = false;

        if(lives <= 0){

            gameState = "gameover";

        }

    }

}

function random(min,max){

    return Math.floor(Math.random()*(max-min+1))+min;

}

function showMessage(text){

    gameMessage = text;

    messageTimer = 180; // około 3 sekundy

}

function drawMessage(){

    if(messageTimer<=0) return;


    ctx.save();


    ctx.fillStyle="rgba(0,0,0,0.7)";

    ctx.fillRect(
        150,
        40,
        700,
        70
    );


    ctx.fillStyle="white";

    ctx.font="28px Arial";

    ctx.textAlign="center";


    ctx.fillText(
        gameMessage,
        WIDTH/2,
        85
    );


    ctx.restore();


    messageTimer--;

}



function gameLoop(){

        if(gameState=="menu"){

        drawMenu();

        requestAnimationFrame(gameLoop);

        return;

        }

    animationTime += 0.05;

    playerAnimation += 0.1;

    movePlayer();

    applyGravity();

    checkPlatforms();

    checkCoins();

    checkArtifact();

    draw();

    requestAnimationFrame(gameLoop);

}

gameLoop();