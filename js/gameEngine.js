
var myGamePiece;
var myScore;
var myRiver;
var myAnts = new Array();
let numAnts = 1000;

function startGame() {
    myGamePiece = new river("blue");
    //myGamePiece.gravity = 0.05; // Navid is this line needed?
    // myScore = new component("30px", "Consolas", "black", 280, 40, "text");

    // create ant objects
    for(let i = 0; i < numAnts; i++){
    myAnts[i] = new antObj();
    }

    myGameArea.start();
}

var myGameArea = {
    canvas : document.getElementById("canvas"),
    start : function() {
        this.context = this.canvas.getContext("2d");
        //document.body.insertBefore(this.canvas, document.body.childNodes[0]); //Navid is this line needed?
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}

// Navid: all the magic numbers should go out of the function
// NAvid: try to take image sourcing out of this function
function antObj(x, y, direction) {
    this.x = 120 + Math.floor(Math.random()*340); // range = 120 - 450
    this.y = Math.floor(Math.random()*220);
    var directions = ["NORTH", "SOUTH", "EAST", "WEST"];
    this.direction = directions[Math.floor(Math.random()*4)];
    // Directions can be polar

    this.update = function() {
        ctx = myGameArea.context;
        ant_img = new Image();

        // image direction will be relative to ants'
        if(this.direction == "NORTH"){
        ant_img.src = '../ant_imgs/antNorth.png';
        } else if(this.direction == "SOUTH"){
            ant_img.src = '../ant_imgs/antSouth.png';
        } else if(this.direction == "EAST"){
            ant_img.src = '../ant_imgs/antEast.png';
        } else if(this.direction == "WEST"){
            ant_img.src = '../ant_imgs/antWest.png';
        }

        ctx.drawImage(ant_img, this.x, this.y, 20, 20);

    }

    this.newPos = function() {
        if(this.direction == 'NORTH'){
            this.y--;
        } else if (this.direction == 'SOUTH'){
            this.y++;
        } else if (this.direction == 'EAST'){
            this.x++;
        } else if (this.direction == 'WEST'){
            this.x--;
        }

        //check for hitting walls
        this.hitWall();
    }

    this.hitWall = function() {
        if(this.x <= 120) {  // if it hits the river it goes either up or down
            while (this.direction == 'WEST'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }
        if(this.x >= 460) {
            this.direction = 'WEST';
        }
        if(this.y <= 0) {
            this.direction = 'SOUTH';
        }
        if (this.y >= 250) {
            this.direction = 'NORTH';
        }

        this.ranDir();
    }

    this.ranDir = function() {
        let threshold = 0.99;
        if(Math.random() > threshold) {
            this.direction = directions[Math.floor(Math.random()*4)];
        }
    }
}

function river(color) {
    this.update = function() {
        ctx = myGameArea.context; // Navid:context should be passed to th function
        ctx.fillStyle = color;
        ctx.fillRect(70, 0, 20, 270); //Navid: the values should come from config file similar to color
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
    }
    // myScore.text="SCORE: " + myGameArea.frameNo;
    // myScore.update();
    // myGamePiece.newPos();
    myGamePiece.update();

    for(let i = 0; i < numAnts; i++){
        myAnts[i].update();
        myAnts[i].newPos();
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

// function accelerate(n) {
//     myGamePiece.gravity = n;
// }