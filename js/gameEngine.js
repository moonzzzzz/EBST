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

// // Graph style 2: create an array of objects for actions, with child sensors - also an array of objects
let nodes = new Array(new Action("MOVE"), new Action("EDGE"), new Action("CLIMB_ON"));

// add sensors
nodes[0].sensors = new Array(new Sensor("EDGE", 0.1, nodes[1]), new Sensor("ANT_EXTENDING", 0.9, nodes[2]));
nodes[1].sensors = new Array();
nodes[2].sensors = new Array();
// nodes[3].sensors = new Array();

function Action(name) {
    this.name = name;
}

function Sensor(name, prob, endAction){
    this.name = name;
    this.prob = prob;
    this.endAction = endAction;
}

// for(i=0; i<nodes[1].sensors.length; i++){
//     console.log(nodes[1].sensors[i].prob);
// }

function startGame() {
    myGamePiece = new river(riverGeometry, myGameArea.canvas.getContext('2d'));

    // create ant objects
    for(let i = 0; i < numAnts; i++){
    myAnts[i] = new AntObj(antMovementArea, antGeometry, randomMovementThreshold, myGameArea.canvas.getContext('2d'), nodes);
    }

    myGameArea.start();
}

function AntObj(movementArea, antGeometry, threshold, ctx, nodes) {
    this.x = movementArea.x + Math.floor(Math.random()*movementArea.width);
    this.y = movementArea.y + Math.floor(Math.random()*movementArea.height);
    var directions = ["NORTH", "SOUTH", "EAST", "WEST"];
    this.direction = directions[Math.floor(Math.random()*4)];
    this.state = nodes[0];

    this.update = function() {
        ant_img = getAntImage(this.direction);
        ctx.drawImage(ant_img, this.x, this.y);

        if (this.state.name == "MOVE"){
            this.move();
        } else if(this.state.name == "EXTEND") {
            // do nothing but time sensor
        } else if(this.state.name == "CLIMB_ON") {
            // this.climbOn();
        } else {
            this.state.name = "MOVE";
        }

        this.checkSensors();
    } 

    this.move = function() {
            if(this.direction == 'NORTH'){
                this.y--;
            } else if (this.direction == 'SOUTH'){
                this.y++;
            } else if (this.direction == 'EAST'){
                this.x++;
            } else if (this.direction == 'WEST'){
                this.x--;
            }

            //check if walls/river is hit or a sensor has been activated
            this.hitWall();
    }

    this.extend = function() {
        this.x = referenceLine - 10;
        console.log(this.x);
    }

    this.climbOn = function() {

    }

    this.climbOff = function() {

    }

    this.checkSensors = function() {
        // check if any sensors are present
        if(this.state.sensors == undefined){
            this.hitRiver();    // default action
        } else {
            // must run through the sensors of this state and enact them
            for(i=0; i<this.state.sensors.length; i++){
                if(this.state.sensors[i] != undefined){
                    this.sense(this.state.sensors[i]);
                }
             }
        }
    }

    this.sense = function(sensor) {
        if(sensor.name == "EDGE"){
            // check for hitting edge
            if(this.x <= referenceLine && Math.random() < sensor.prob) {
                // now perform the next action
                this.performAction(sensor.endAction);
            }
        } else if (sensor.name == "ANT_EXTENDING"){

        } else if (sensor.name == "TIME"){

        }
    }

    this.performAction = function(action) {
        // ToDo: must first check what the next action is
        if(action.name == "EXTEND"){
            this.state = action;
            console.log(action);
        } else if(action == "CLIMB_ON"){

        } else if(action == "CLIMB_OFF"){
            
        } else {
            this.state = action;
        }
    }

    this.hitRiver = function() {
        // if ant hits the river, default is to go anywhere but WEST
        if(this.x <= referenceLine && this.state.name == "MOVE") {
            while (this.direction == 'WEST'){
                this.direction = directions[Math.floor(Math.random()*4)];
            }
        }
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
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}