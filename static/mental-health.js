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
var qCount;
var user_data;

function preload() {
    game_data = loadJSON("questions.json");
    bg_image = loadImage("static/Shishapangma.jpg");
    imgDC = loadImage('static/Yellow-Tree-logo.png');
    //Eventually this should use the URL param to make an AJAX call
    user_data = {
        quotes: ["I seriously love Kanye's new album, made my day!",
        "Today was the worst day ever.",
        "I miss you too girl!",
        "I'm so sad about how shitty America can be #Flint"]
    };
}

function setup() {
    var myCanvas = createCanvas(windowWidth, windowHeight);
    myCanvas.parent('processing');
    myDisplay = new DisplayBox();
    myStatus = new StatusBox();
    myGame = new Game(myDisplay, myStatus);
    thePlayer = new Player(user_data);
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
        thePlayer.findMin();
    } 
    if (myGame.phase == 4) {
        //This can eventually be used to analyze the player's data, if needed
        //thePlayer.processData();
    }
    if (roundOver == true) {
        myGame.startRound();
    }
    background(bg_image);
    myGame.update();
    myGame.display();
}

//Eventually this should take user data
var Player = function (mydata) {
    this.happy = 0;
    this.social = 0;
    this.selfy = 0;
    this.meaning = 0;
    this.perspec = 0;
    this.problem = null;
    this.r2;

    this.pdata = mydata;

    this.responses = {
        openR: [],
        words: [[],[],[]],
        conditioning: []
    };

    this.findMin = function() {
        min = 99;
        if (this.social < min) {
            this.problem = 'social';
            min = this.social;
        }
        if (this.selfy < min) {
            this.problem = 'self';
            min = this.selfy;
        }
        if (this.meaning < min) {
            this.problem = 'meaning';
            min = this.meaning;
        }
        if (this.perspec < min) {
            this.problem = 'perspective';
            min = this.perspective;
        }
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
        roundOver = false;
    }

    this.startRound = function () {
        //Used to change phases
        this.phase++;
        this.myInput = new InputBox();
        this.myInput.generate();
        roundOver = false;
    },

    this.resetInputs = function () {
        qCount++;
        this.myInput.generate();
        this.myInput.update();
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
        } else if (myGame.phase == 2) {
            switch (thePlayer.problem) {
                case 'social':
                    thePlayer.r2 = game_data.socialqs_r2;
                    this.questions = thePlayer.r2.open_response;
                    break;
                case 'self':
                    thePlayer.r2 = game_data.selfqs_r2;
                    this.questions = thePlayer.r2.open_response;
                    break;
                case 'perspective':
                    thePlayer.r2 = game_data.meaningqs_r2;
                    this.questions = thePlayer.r2.open_response;
                    break;
                case 'meaning':
                    thePlayer.r2 = game_data.perspectiveqs_r2;
                    this.questions = thePlayer.r2.open_response;
                    break;
            }
            shuffle(this.questions);
            this.nextQ();
        } else if (myGame.phase == 3) {
            this.questions = thePlayer.r2.word_association.prompts;
            shuffle(this.questions);
            this.nextQ();
        } else if (myGame.phase == 4) {
            this.questions = thePlayer.r2.conditioning.actions;
            shuffle(this.questions);
            this.nextQ();
        } else if (myGame.phase == 5) {
            this.questions = thePlayer.pdata.quotes;
            shuffle(this.questions);
            this.nextQ();
        }

    },

    this.nextQ = function () {
        if (this.questions.length > 0) {
            qu = this.questions.pop();
            currQ = qu;
            if (myGame.phase == 1){
                this.myText = qu.question;
            } else if (myGame.phase == 2 || myGame.phase == 3 || myGame.phase == 4) {
                this.myText = qu;
            } else if (myGame.phase == 5) {
                this.myText = "Do you remember when you said this? \n\n\"" + qu + "\"";
                console.log(this.myText);
            }
            this.display();
            enterYet = false;
        } else {
            roundOver = true;
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
    qCount = 0;

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
            //Open Responses
            this.myElem = createElement('textarea');
            this.myElem.position(this.X+this.wide*.1, this.Y+this.high*.1);
            this.myElem.id('inputter');
            this.myElem.style('width', "65%");
            this.myElem.style('height', "15%");
            this.myElem.show();
        } else if (myGame.phase == 3) {
            console.log('made it to word stuff');
            wacs = thePlayer.r2.word_association.banks;
            myDiv = createDiv('');
            myDiv.addClass('flex flex-wrap');
            myDiv.style("width", "60%");
            myDiv.style('height', "15%");
            myDiv.position(this.X + this.wide*.05, this.Y + this.high*.2);
            for (var word=0; word<wacs.length; word++) {
                thisWord = wacs[word];
                but = createButton(thisWord);
                but.addClass('btn blue px2 flex-auto');
                but.value(thisWord);
                but.mousePressed(this.selectWord);
                myDiv.child(but);
            }
        } else if (myGame.phase == 4) {
            counter = 1;
            fre = thePlayer.r2.conditioning.frequency;
            myDiv = createDiv('');
            myDiv.addClass('flex');
            myDiv.position(this.X + this.wide*.25, this.Y + this.high*.4);
            for (var res=0; res<fre.length; res++) {
                but = createButton(fre[res]);
                but.addClass('btn blue px3 flex-auto');
                but.value(fre[res]);
                but.mousePressed(this.valSelect);
                myDiv.child(but);
                counter++;
            }
        } 
    },

    this.selectWord = function () {
        console.log(qCount);
        console.log(thePlayer.responses.words[qCount]);
        thePlayer.responses.words[qCount].push(this.value());
        this.style('color', 'red');
        this.attribute('disabled', 'disabled')
    },

    this.valSelect = function () {
        thePlayer.responses.conditioning.push(this.value());
        myDisplay.nextQ();
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
        pop();
        if (myGame.phase == 5){
            push();
                fill(0);
                textFont("Georgia");
                textSize(20);
                text("Don't speak, we know just what you're feeling... Press spacebar and keep reflecting", this.X + this.wide*.1, this.Y + this.high*.5);
            pop();
        }
        
    }

};

//Status Box that tells you what phase you're on and the instructions for that phase
var StatusBox = function () {
    this.X = 0;
    this.Y = windowHeight*.05;
    this.wide = windowWidth *.15;
    this.high = windowHeight * .6;
    this.inst = "Hold on...";

    //Updates the state of the Status Box for each round of the game
    this.update = function () {
        switch (myGame.phase) {
            case 0:
                this.inst = "Rate your baseline happiness from 1 to 10 then press ENTER";
                break;
            case 1:
                this.inst = "Click the answer that best resprents your current feelings";
                break;
            case 2:
                this.inst = "Type out your reflections on the question and press ENTER when you're done.";
                break;
            case 3:
                this.inst = "Click all of the words you associate with the statement, the press ENTER.";
                break;
            case 4:
                this.inst = "Click the option that describes how often you perform the action in your everyday life.";
                break;
            case 5:
                this.inst = "Take a moment to reflect on your own data, press spacebar to continue onto the next item.";
                break;
            case 6:
                this.inst = "Internalize the advice and press ENTER to complete your therapy.";
                break;
        }

    },

    //Displays the new status box for each round
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

//Key press handler throughout the game
function keyPressed() {
    if (keyCode === ENTER && enterYet == false && myGame.phase == 0){
        inputData = document.getElementById('inputter').value;
        enterYet = true;
        gameUpdate();
    } else if (keyCode === ENTER && enterYet == false && myGame.phase == 2) {
        thePlayer.responses.openR.push(document.getElementById('inputter').value);
        enterYet = true;
        myGame.resetInputs();
        myDisplay.nextQ();
    } else if (keyCode === ENTER && enterYet == false && myGame.phase == 3) {
        enterYet = true;
        myGame.resetInputs();
        myDisplay.nextQ();
    } else if (myGame.phase == 5 && key == ' ') {
        myDisplay.nextQ();
        return false;
    }
}