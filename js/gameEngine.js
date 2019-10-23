var myGameArea = {
    canvas : document.getElementById("canvas"),
    start : function() {
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var myGamePiece;
var myRiver;
var myAnts = new Array();
let numAnts = 100;
let riverGeometry = {x: 100, y: 0, width: 40, height: 270, color: "blue"};
let referenceLine = riverGeometry.x + riverGeometry.width;  // Can I remove reference line because it is the same as antMovementArea.x ??
let antMovementArea = {x: referenceLine, y: 0, width: myGameArea.canvas.width - referenceLine, height: myGameArea.canvas.height};
let randomMovementThreshold = 0.99;
let antGeometry = {width: 20, height: 28};  // ant facing north - by inspection (ant_img.width) for now

// user input represented by a directed graph
let myGraph = {};
let actions = new Array("MOVE", "EXTEND", "CLIMB-ON");
// let connections = new Array( new Connection("MOVE", "EDGE", 0.1, "CLIMB-ON"));
let connections = new Array(new Connection("MOVE", "EDGE", 0.1, "EXTEND"), new Connection("MOVE", "EDGE", 0.1, "CLIMB-ON"));

function Connection (startAction, sensor, prob, endAction) {
    this.startAction = startAction;
    this.sensor = sensor;
    this.prob = prob;
    this.endAction = endAction;
};

// console.log(connections[1]);

function startGame() {
    myGamePiece = new river(riverGeometry, myGameArea.canvas.getContext('2d'));

    // create ant objects
    for(let i = 0; i < numAnts; i++){
    myAnts[i] = new AntObj(antMovementArea, antGeometry, randomMovementThreshold, myGameArea.canvas.getContext('2d'), myGraph);
    }

    myGameArea.start();
}

function AntObj(movementArea, antGeometry, threshold, ctx, graph) {
    this.x = movementArea.x + Math.floor(Math.random()*movementArea.width);
    this.y = movementArea.y + Math.floor(Math.random()*movementArea.height);
    var directions = ["NORTH", "SOUTH", "EAST", "WEST"];
    this.direction = directions[Math.floor(Math.random()*4)];
    this.state = "MOVE";

    this.update = function() {
        ant_img = getAntImage(this.direction);
        ctx.drawImage(ant_img, this.x, this.y);
    }

        this.newPos = function() {
            if (this.state == "MOVE"){
                if(this.direction == 'NORTH'){
                    this.y--;
                } else if (this.direction == 'SOUTH'){
                    this.y++;
                } else if (this.direction == 'EAST'){
                    this.x++;
                } else if (this.direction == 'WEST'){
                    this.x--;
                }
            
                //check for hitting river/walls
                this.hitRiver();
                this.hitWall();
            }
    }

    this.hitRiver = function() {

        //examine graph for move-edge-extend
        for(i=0; i<actions.length;  i++){
            if(actions[i] == "MOVE"){    // if move present
                for(j=0; j<connections.length;  j++){
                    if (connections[j].startAction == "MOVE" && connections[j].sensor == "EDGE"){   // if edge sensor is connected to move
                        if(this.x <= referenceLine && this.direction == "WEST") {   // when ant hits wall
                            if (connections[j].endAction == "EXTEND") { // if extend connected
                                if (Math.random() < connections[j].prob){   // extend probability
                                    this.direction = "WEST";
                                    this.state = "EXTEND";
                                    this.x = referenceLine - 5;
                                } else {
                                    while (this.direction == 'WEST'){
                                        this.direction = directions[Math.floor(Math.random()*4)];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        //Default
        // if ant hits the river, default is to go anywhere but WEST
        if (this.state == "MOVE"){
            if(this.x <= referenceLine) {
                while (this.direction == 'WEST'){
                    this.direction = directions[Math.floor(Math.random()*4)];
                }
            }
        }

        // // if connections include edge sensor
        // if(this.x <= referenceLine) {

        // } 

    }

    this.hitWall = function() {
        // when ant hits the wall, it simply changed direction
        if(this.x >= movementArea.width + movementArea.x - antGeometry.width) {
            while (this.direction == 'EAST'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }
        if(this.y <= movementArea.y) {
            while (this.direction == 'NORTH'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }
        if (this.y >= movementArea.height + movementArea.y - antGeometry.width) {
            while (this.direction == 'SOUTH'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }

        this.ranDir();
    }

    this.ranDir = function() {
        if(Math.random() > threshold) {
            this.direction = directions[Math.floor(Math.random()*4)];
        }
    }

    function getAntImage(direction) {
        let ant_img = new Image();
    
        // image direction will be relative to ants' (Don't understand)
        if(direction == "NORTH"){
            // refNorth = null;
            // if (refNorth == null){
            //     ant_img.src = '../ant_imgs/antNorth.png';
            //     // resize
            // }
            // else return refNorth.copy()

            ant_img.src = '../ant_imgs/antNorth.png';
        } else if(direction == "SOUTH"){
            ant_img.src = '../ant_imgs/antSouth.png';
        } else if(direction == "EAST"){
            ant_img.src = '../ant_imgs/antEast.png';
        } else if(direction == "WEST"){
            ant_img.src = '../ant_imgs/antWest.png';
        }

        return ant_img;
    }
}

function river(properties, ctx) {
    this.update = function() {
        ctx.fillStyle = properties.color;
        ctx.fillRect(properties.x, properties.y, properties.width, properties.height);
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