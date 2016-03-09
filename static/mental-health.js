var game_data;
var bg_image;
var inputData;
var myGame;
var enterYet = false;
var imgDC;
var inputStuff;
var roundOver = false;
var thePlayer;
var currQ;
var myDisplay;

function preload() {
    game_data = loadJSON("questions.json");
    bg_image = loadImage("static/Shishapangma.jpg");
    imgDC = loadImage('static/Yellow-Tree-logo.png');
}

function setup() {
    var myCanvas = createCanvas(windowWidth, windowHeight);
    myCanvas.parent('processing');
    myDisplay = new DisplayBox();
    myStatus = new StatusBox();
    myGame = new Game(myDisplay, myStatus);
    thePlayer = new Player();
    myGame.startGame();
    background(bg_image);
    myGame.update();
    myGame.display();
}

function gameUpdate() {
    if (myGame.phase == 0) {
        thePlayer.happy = parseInt(inputData);
        thePlayer.social = parseInt(inputData);
        thePlayer.selfy = parseInt(inputData);
        thePlayer.meaning = parseInt(inputData);
        thePlayer.perspec = parseInt(inputData);
        roundOver = true;

    } else if (myGame.phase == 1) {

    }

    if (roundOver == true) {
        myGame.startRound();
    }

    background(bg_image);
    myGame.update();
    myGame.display();
}

var Player = function () {
    this.happy = 0;
    this.social = 0;
    this.selfy = 0;
    this.meaning = 0;
    this.perspec = 0;
    this.problem;

    this.findMin = function() {
        return min(this.social, this.selfy, this.meaning, this.perspec);
    }


};
//Integrates player info into game and has update functions for the different on-screen elements
//Controls what phase the game is in

var Game = function (displayer, status) {
    this.myDisplay = displayer;
    this.myStatus = status;
    this.myInput;
    this.phase;

    this.update = function () {
        //update input, display, and status box
        //set global keypress callback and autofocus to inputbox
        this.myInput.update();
        this.myDisplay.update();
        this.myStatus.update();

    },

    this.display = function () {
        //show input, display, and status box
        this.myDisplay.display();
        this.myStatus.display();
        this.myInput.display();


    },

    this.startGame = function () {
        //Used to change phases
        this.phase = 0;
        this.myInput = new InputBox();
        this.myInput.generate();
    }

    this.startRound = function () {
        //Used to change phases
        this.phase++;
        this.myInput = new InputBox();
        this.myInput.generate();
    }

};

var DisplayBox = function () {

    this.X = windowWidth*.25;
    this.Y = windowHeight*.1;
    this.wide = windowWidth*.6; 
    this.high = windowHeight*.55;
    this.questions;

    this.myText = "Hold on just a moment...";

    this.update = function () {
        //this should set the text based on the round
        if (myGame.phase == 0) {
            this.myText = game_data.baseline.question;
        } else if (myGame.phase == 1) {
            this.questions = game_data.generalqs_r1;
            shuffle(this.questions);
            this.nextQ();
        }

    },

    this.nextQ = function () {
        if (this.questions.length > 0) {
            qu = this.questions.pop();
            currQ = qu;
            this.myText = qu.question;
            this.display();
        } else {
            gameUpdate();
        }

    },

    this.display = function () {
        push();
            stroke('#333030');
            strokeWeight(8);
            fill('#37483e');
            rect(this.X, this.Y, this.wide, this.high);
            strokeWeight(2);
            fill(255);
            textFont("Georgia");
            textSize(26);
            textAlign(CENTER);
            text(this.myText, this.X+35, this.Y+35, this.wide-35, this.high-35);
        pop();
    }

};

var InputBox = function () {
    this.myElem;
    this.X = windowWidth*.20;
    this.Y = windowHeight*.7;
    this.wide = windowWidth*.7; 
    this.high = windowHeight*.25;
    this.valDiv;
    inputStuff = this;

    this.generate = function () {

        removeElements();
        if (myGame.phase == 0) {
            this.myElem = createElement('input');
            this.myElem.attribute("type", "range")
            this.myElem.attribute("min", 0);
            this.myElem.attribute("max", 10);
            this.myElem.attribute("step", 1);
            this.myElem.id('inputter');
            this.myElem.changed(this.newVal);
            this.myElem.position(this.X+(this.wide*.08), this.Y+this.high*.4);
            this.myElem.style('width', "60%");

            this.valDiv = createDiv();
            this.valDiv.addClass('phase');
            this.valDiv.position(this.X+(this.wide*.4), this.Y+this.high*.6)
            this.valDiv.html("Current Value is: " + document.getElementById('inputter').value);

        } else if (myGame.phase == 1) {
            counter = 1;
            gdr = game_data.responses_r1;
            myDiv = createDiv('');
            myDiv.addClass('flex');
            myDiv.position(this.X + this.wide*.1, this.Y + this.high*.4);
            for (var res=0; res<gdr.length; res++) {
                but = createButton(gdr[res].response);
                but.addClass('btn blue px2 flex-auto');
                but.value(gdr[res].score);
                but.mousePressed(this.nextOne);
                myDiv.child(but);
                counter++;
            }
        } else if (myGame.phase == 2) {
            this.myElem = createElement('textarea');
            this.myElem.position(this.X+this.wide*.1, this.Y+this.high*.1);
            this.myElem.id('inputter');
            this.myElem.style('width', "65%");
            this.myElem.style('height', "15%");
            this.myElem.show();
        }
    },

    this.nextOne = function () {
        mult = parseInt(this.value());
        thePlayer.social += currQ.scores.social*mult;
        thePlayer.meaning += currQ.scores.meaning*mult;
        thePlayer.perspec += currQ.scores.perspective*mult;
        thePlayer.selfy += currQ.scores.self*mult;

        myDisplay.nextQ();
        
    }

    this.newVal = function () {
        inputStuff.valDiv.html("Current Value is: " + document.getElementById('inputter').value);
    }

    this.update = function () {

        if (myGame.phase == 2) {
            document.getElementById("inputter").focus();
        }

    },

    this.display = function () {
        push();
            stroke('#333030');
            strokeWeight(8);
            fill('rgb(156, 212, 130)');
            rect(this.X, this.Y, this.wide, this.high);
            strokeWeight(2);
            // fill(255);
            // rect(this.X+25, this.Y+25, this.wide-45, this.high-45);
            // fill(0);
            // textFont("Georgia");
            // textSize(26);
            // textAlign(CENTER);
            // text("Don't speak, I know just what you're feeling", this.X+35, this.Y+35, this.wide-35, this.high-35);
        pop();
        
    },

    this.callback = function () {

    }


};

var StatusBox = function () {
    this.X = 0;
    this.Y = windowHeight*.05;
    this.wide = windowWidth *.15;
    this.high = windowHeight * .6;
    this.inst = "Hold on...";

    this.update = function () {
        switch (myGame.phase) {
            case 0:
                this.inst = "Rate your baseline happiness from 1 to 10 then press ENTER";
                break;
            case 1:
                this.inst = "Click the answer that best resprents your current feelings";
                break;

        }

    },

    this.display = function () {
        push();
            strokeWeight(2);
            fill('#333030');
            rect(this.X, this.Y, this.wide, this.high);
            image(imgDC, this.X+this.wide*.05, this.Y+this.high*.05, this.wide*.4, this.high*.2);
            fill(255);
            strokeWeight(1);
            textFont("Georgia");
            textSize(20);
            textAlign(RIGHT);
            text("Phase:", this.wide*.85, this.Y+this.high*.2);
            textSize(24);
            text(myGame.phase, this.wide*.8, this.Y+this.high*.3);
            textSize(20);
            text("Instructions:", this.wide*.85, this.Y+this.high*.4);
            textAlign(RIGHT);
            text(this.inst, this.wide*.10, this.Y+this.high*.5, this.wide*.75, this.Y+this.high*.95)
        pop();
        
    }

};

function keyPressed() {
    if (keyCode === ENTER && enterYet == false){
        inputData = document.getElementById('inputter').value;
        enterYet = true;
        gameUpdate();
    }
}