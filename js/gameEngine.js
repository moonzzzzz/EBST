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

// // Graph: create an array of objects for actions, with child sensors - also an array of objects
let actions = {
    move:{name: "MOVE", "sensors": [0, 1]},
    extend:{name: "EXTEND", "sensors": []},
    climb_on:{name: "CLIMB_ON", "sensors": []}, 
    climb_off:{name: "CLIMB_OFF", "sensors": []},  
}

let sensors = [{"id": 0, type: "EDGE", probs:[.1, .9], actions:[actions.extend, actions.move]},
    {"id": 1, type: "ANT_EXTENDING", probs:[.9, .1], actions:[actions.climb_on, actions.move]}
]

let priorities = ["ANT_EXTENDING", "EDGE", "TIME"];

function getActionSensor(index){
    number = sensors.findIndex(x => x.id === index);
    return sensors[number];
}

// console.log(getActionSensor(1));

function startGame() {
    myGamePiece = new river(riverGeometry, myGameArea.canvas.getContext('2d'));

    // create ant objects
    for(let i = 0; i < numAnts; i++){
    myAnts[i] = new AntObj(antMovementArea, antGeometry, randomMovementThreshold, myGameArea.canvas.getContext('2d'), actions, priorities);
    }

    myGameArea.start();
}

function AntObj(movementArea, antGeometry, threshold, ctx, actions, priorities) {
    this.x = movementArea.x + Math.floor(Math.random()*movementArea.width);
    this.y = movementArea.y + Math.floor(Math.random()*movementArea.height);
    var directions = ["NORTH", "SOUTH", "EAST", "WEST"];
    this.direction = directions[Math.floor(Math.random()*4)];
    this.state = actions.move;
    let currentSensor;      // will be used in loopSensors
    let random, cummulative; // used in junction

    this.getState = function() {
        return this.state;
    }

    this.update = function() {
        ant_img = getAntImage(this.direction);
        ctx.drawImage(ant_img, this.x, this.y);

        // if (this.state.name == "MOVE"){
        //     this.move();
        // } else if(this.state.name == "EXTEND") {
        //     this.extend;
        // } else if(this.state.name == "CLIMB_ON") {
        //     // this.climbOn();
        // } else {
        //     this.state.name = "MOVE";
        // }

        if(this.state == actions.move) {this.move();}
        // console.log(this.state);

        this.loopSensors();
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

    // this.extend = function() {
    //     this.x = referenceLine - 10;
    //     console.log(this.x);
    // }

    // this.climbOn = function() {

    // }

    // this.climbOff = function() {

    // }

    this.loopSensors = function() {
        // must run through the sensors and priorities attached to this action
        for(i=0; i<this.state.sensors.length; i++){
            for(j=0; j<priorities.length; j++){
                currentSensor = getActionSensor(this.state.sensors[i]);
                // console.log(currentSensor);
                if(currentSensor.type == priorities[j]){
                    this.checkSensor(currentSensor);
                } else {
                    // ToDo: go to the next priority

                }
                // console.log(this.state.sensors[i]);
                // console.log(this.state.sensors, priorities[j], "");
            }
        }
    }

    this.checkSensor = function(sensor) {
        // if EDGE sensor, then sense if the ant is on the river's edge
        if(sensor.type == "EDGE"){
            if (this.x <= referenceLine - 10 && this.direction == "WEST" && this.state.name == "MOVE") {this.junction(sensor);}
        } else if (sensor.type == "ANT_EXTENDING"){
            // check: go through all ants that are extending
        } else if(sensor.type == "TIME"){
            // check if time is up
        }
    }

    // at the sensor junction
    this.junction = function(sensor){
        random = Math.random();
        cummulative = 0;

        for(k=0; k<sensor.actions.length; k++){
            cummulative += sensor.probs[k];
            if(random < cummulative){
                // perform action in position k
                // console.log(random, cummulative, sensor.actions[k]);
                this.performAction(sensor.actions[k]);
                // console.log(sensor.actions[k]);
            }
            // ToDo - bug: what if comtinuing to move requires a change in direction???
        }
    }

    this.performAction = function(action) {
        this.state = action;
        if (action.name == "MOVE") {
            if(this.x <= referenceLine -10) {
                this.hitRiver();
            } else {
                this.ranDir();
            }
        } else if(action.name == "EXTEND"){
            console.log("EXTEND", action, state); 
            this.x = referenceLine - 10;
        }
    //     // ToDo: must first check what the next action is
    //     console.log(action.name);
    //     if(action.name == "EXTEND"){
    //         this.state = "EXTEND";
    //         // console.log(action);
    //     } else if(action.name == "CLIMB_ON"){

    //     } else if(action.name == "CLIMB_OFF"){
            
    //     } else {
    //         this.state = action;
    //     }
    }

    this.navid = function() {
        // ANT STATE
        // every ant has a state - always starts in the move state
        // get the current state

        // \/\/ decide on next state \/\/

        // LOOP SENSORS
        // loop through the sensors of that state (based on priorities)
        //      (inside loop) if sensor is applicable, 
        //          follow the sensor
        //      if non-applicable,
        //          go to next priority
        
        // FOLLOWING THE SENSOR -> JUNCTION (CHOOSE WHICH WAY TO GO)
        // generate a random number
        // based on the random number, change the current state to the next state

        // ACTING
        // act on the next state
        // set the current state to the next state

        // Notes: one function to determine the state, and another function to update its position
    }

    this.hitRiver = function() {
        // if ant hits the river, default is to go anywhere but WEST
            while (this.direction == "WEST"){
                this.direction = directions[Math.floor(Math.random()*4)];
            }
            // console.log(this.direction);
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