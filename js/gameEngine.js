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
let otherSideArea = {x: 0, y: 0, width: referenceLine - riverGeometry.width, height: myGameArea.canvas.height};
let randomMovementThreshold = 0.99;
let antGeometry = {width: 20, height: 28};  // ant facing north - by inspection (ant_img.width) for now
let arrayOfBridges = new Array;   // used in ant object - 2D array

// // Graph: create an array of objects for actions, with child sensors - also an array of objects
let actions = {
    move:{name: "MOVE", "sensors": [0, 1]},
    extend:{name: "EXTEND", "sensors": []},
    climb_on:{name: "CLIMB_ON", "sensors": []}, 
    climb_off:{name: "CLIMB_OFF", "sensors": []}, 
    dead:{name: "DEAD"} 
}

let sensors = [{"id": 0, type: "EDGE", probs:[.1, .9], actions:[actions.extend, actions.move]},
    {"id": 1, type: "ANT_EXTENDING", probs:[.9, .1], actions:[actions.climb_on, actions.move]},
    {"id": 2, type: "TIME", probs:[], actions:[]}
]

let priorities = ["EDGE", "ANT_EXTENDING", "TIME"];

function getActionSensor(index){
    number = sensors.findIndex(x => x.id === index);
    return sensors[number];
}

function timedText() {
    document.getElementById("demo").innerHTML = "5";
    setTimeout(myTimeout_4, 1000);
    setTimeout(myTimeout_3, 2000);
    setTimeout(myTimeout_2, 3000);
    setTimeout(myTimeout_1, 4000);
    setTimeout(myTimeout, 5000);
}

function myTimeout_4() {
    document.getElementById("demo").innerHTML = "4";
}

function myTimeout_3() {
    document.getElementById("demo").innerHTML = "3";
}

function myTimeout_2() {
    document.getElementById("demo").innerHTML = "2";
}

function myTimeout_1() {
    document.getElementById("demo").innerHTML = "1";
}

function myTimeout() {
    document.getElementById("demo").innerHTML = "Climb Off";
    antsClimbOff();
    deleteBridges();
}

function antsClimbOff() {
    for(i=0; i<myAnts.length; i++){
        myAnts[i].climbOff();
    }
}

function deleteBridges() {
        arrayOfBridges = [];
}

function startGame() {
    myGamePiece = new river(riverGeometry, myGameArea.canvas.getContext('2d'));

    // create ant objects
    for(let i = 0; i < numAnts; i++){
    myAnts[i] = new AntObj(antMovementArea, otherSideArea, antGeometry, randomMovementThreshold, myGameArea.canvas.getContext('2d'), actions, priorities);
    }

    myGameArea.start();
}

function AntObj(movementArea, otherSideArea, antGeometry, threshold, ctx, actions, priorities) {
    this.x = movementArea.x + Math.floor(Math.random()*movementArea.width);
    this.y = movementArea.y + Math.floor(Math.random()*movementArea.height);
    let directions = ["NORTH", "SOUTH", "EAST", "WEST"];
    this.direction = directions[Math.floor(Math.random()*4)];
    this.state = actions.move;
    let currentSensor;      // will be used in loopSensors
    let random, cummulative, temp; // used in junction
    let orderedSensors; // used in loopSensors function
    let bridgeIndex;    // used between checkSensors and performAction functions

    this.getState = function() {
        return this.state;
    }

    this.update = function() {
        ant_img = getAntImage(this.direction);
         if(this.state != actions.dead) {ctx.drawImage(ant_img, this.x, this.y);}

        if(this.state.name == "MOVE") {
            this.move();
        } else if(this.state.name == "OTHER_SIDE"){
            this.moveOnOtherSide();
        }

        // if(this.state == dead)
        if(this.state.name != "OTHER_SIDE" && this.state != actions.dead) this.loopSensors();
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

    this.moveOnOtherSide = function() {
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
        this.hitWallOtherSide();
    }

    this.loopSensors = function() {

        orderedSensors = this.orderSensorsByPriority();

        let firstApplicableSensor = this.getFirstApplicableSensor(orderedSensors);
        // console.log(firstApplicableSensor);

        if(firstApplicableSensor != null) {
            let nextAction = this.junction(firstApplicableSensor);

            this.performAction(nextAction);
        }

    }

    this.getFirstApplicableSensor = function(sensorsList) {
        let applicable, returnSensor;

        // there's no way to break a forEach loop
        orderedSensors.forEach(sensor => {
            applicable = this.checkSensor(sensor);
            if (applicable) {
                returnSensor = sensor;
            }
        });

        if (returnSensor != undefined){
            return returnSensor;
        } else {
            return null;
        }

        // could potentially be more efficient
    }

    this.orderSensorsByPriority = function() {
        let result = new Array();

        // order sensors according to priority
        priorities.forEach(priority => {
            this.state.sensors.forEach(currentSensor => {
                if(priority == getActionSensor(currentSensor).type){
                    result.push(getActionSensor(currentSensor));
                }
            });
        });

        return result;
    }

    this.checkSensor = function(sensor) {
        // if EDGE sensor, then sense if the ant is on the river's edge
        if(sensor.type == "EDGE"){
            // check if applicable
            if (this.x <= referenceLine - 10 && this.direction == "WEST" && this.state.name == "MOVE") {
                return true;
            }
        } else if (sensor.type == "ANT_EXTENDING" && this.direction == "WEST" && this.state.name == "MOVE"){
            // check: go through all ants that are extending
            for(l=0; l<arrayOfBridges.length; l++){
                if(this.y <= arrayOfBridges[l][0].y + 3 && this.y >= arrayOfBridges[l][0].y - 3 && this.x <= referenceLine){     // conditions
                    // move onto junction
                    bridgeIndex = l;

                    return true;
                }
            }
        } else if(sensor.type == "TIME"){
            // check if time is up
            return true;
        }

        return false;
    }

    // at the sensor junction
    this.junction = function(sensor){
        random = Math.random();
        cummulative = 0;

        for(k=0; k<sensor.actions.length; k++){
            temp = cummulative;
            cummulative += sensor.probs[k];
            if(random < cummulative && random > temp){
                // perform action in position k
                return sensor.actions[k];
            }
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
            // create a new bridge
            let bridge = new Array();
            bridge.push(this);
            arrayOfBridges.push(bridge);

            // perform extend
            this.x = referenceLine - 10;
        } else if(action.name == "CLIMB_ON"){
            // reposition ant appropriately

            if (arrayOfBridges[bridgeIndex].length-1 < 5){            // if bridge incomplete, climb on
                this.y = arrayOfBridges[bridgeIndex][arrayOfBridges[bridgeIndex].length-1].y;
                this.x = arrayOfBridges[bridgeIndex][arrayOfBridges[bridgeIndex].length-1].x - 10;
                arrayOfBridges[bridgeIndex].push(this);
                // Ask Dr Navid: is using bridgeIndex like this bad coding practice?
            } else {    // if bridge complete, go to other side
                this.state = {name: "OTHER_SIDE"};
                this.x = riverGeometry.x - antGeometry.width;
            }

        } else if(action.name == "CLIMB_OFF"){
            // climb off
        } else {
            console.log("ERROR");
        }
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
    }

    this.hitWall = function() {
        // when ant hits the wall, it simply changes direction
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

    this.hitWallOtherSide = function() {
        // when ant hits the wall on other side, it simply changes direction
        if(this.x <= otherSideArea.x) {
            while (this.direction == 'WEST'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }
        if(this.x >= otherSideArea.x + otherSideArea.width - antGeometry.width) {
            while (this.direction == 'EAST'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }
        if(this.y <= otherSideArea.y) {
            while (this.direction == 'NORTH'){
                this.direction = directions[Math.floor(Math.random()*4)];
             }
        }
        if (this.y >= otherSideArea.height + otherSideArea.y - antGeometry.width) {
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

    this.climbOff = function() {
        // PLAN

        // check if ant is in an extending state
        // if yes, then return to moving state
        if(this.state == actions.extend) {
            this.direction = "EAST";
            this.state = actions.move;
        }

        // check if ant is in an climb_on state
        // if yes, then change to dead state
        if(this.state == actions.climb_on){
            this.direction = "EAST";    //  working
            this.state = actions.dead;
            console.log(this.state);
        }

        // ALTERNATIVE PLAN
        // loop through all bridges
        // if ant is in extending state -> change to moving state
        // if ant is in climb_on state -> change to dead state
    }

    // this.searchBridge = function(ant) {
    //     for(i=0; i<arrayOfBridges.length; i++){
    //         if(ant == arrayOfBridges[i][0]){
    //             return i;
    //             // console.log(i);
    //         }
    //     }
    // }
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