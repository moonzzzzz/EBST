var myAnts = new Array();
let numAnts = 100;
let antGeometry = {width: 20, height: 28};  // ant facing north - by inspection (ant_img.width) for now
let arrayOfBridges = new Array;   // used in ant object - 2D array
let randomMovementThreshold = 0.99;
let deadAntLocation = {x: 500, y:500};

function AntObj(movementArea, otherSideArea, antGeometry, threshold, ctx, actions, priorities) {
    this.x = movementArea.x + Math.floor(Math.random()*movementArea.width);
    this.y = movementArea.y + Math.floor(Math.random()*movementArea.height);
    let directions = ["NORTH", "SOUTH", "EAST", "WEST"];
    this.direction = directions[Math.floor(Math.random()*4)];
    this.state = actions.move;
    let currentSensor;      // will be used in loopSensors
    let random, cummulative, temp; // used in junction
    let orderedSensors; // used in loopSensors function
    this.bridgeIndex;    // used between checkSensors and performAction functions
    this.startTime;
    this.currentTime;  // to be used for time sensor
    this.bridge;

    this.getState = function() {
        return this.state;
    }

    this.update = function() {
        ant_img = getAntImage(this.direction);
         if(this.state != actions.dead) {ctx.drawImage(ant_img, this.x, this.y);} else {this.x = deadAntLocation.x; this.y = deadAntLocation.y;}    // mode dead ants out of the way

        if(this.state.name == "MOVE") {
            this.move();

            // randomise direction (with a probability)
            this.ranDir();

            // go to sensors
            this.loopSensors();

            //check if walls/river is hit or a sensor has been activated
            this.hitWall();
            this.hitRiver();

        } else if(this.state.name == "OTHER_SIDE"){
            this.moveOnOtherSide();

            //check if walls are hit on the other sdie
            this.hitWallOtherSide();

            // randomise direction (with a probability)
            this.ranDir();
        } else {    // if in extend of climb_on state
            this.loopSensors();
        }
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
    }

    this.loopSensors = function() {
        orderedSensors = this.orderSensorsByPriority();

        let firstApplicableSensor = this.getFirstApplicableSensor(orderedSensors);
        // if(firstApplicableSensor == sensors[2]) {console.log(firstApplicableSensor);}

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
                    this.bridgeIndex = l;
                    return true;
                }
            }
        } else if(sensor.type == "TIME"){
            if(this.startTime == null) {    // check if time has already started
                this.startTime = generalTime/100;
            } else {
                this.currentTime = generalTime/100;
            }

            if(this.currentTime - this.startTime >= timeToEndTime) {
                console.log('now2')
                return true;
            }
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
        let previousState = this.state;
        this.state = action;
        // console.log(action.name);
        if (action.name == "MOVE") {
            if(this.x <= referenceLine - 10) {
                this.hitRiver();
            } else {
                this.ranDir();
            }
        } else if(action.name == "EXTEND"){
            // create a new bridge
            let bridge = new Array();
            bridge.push(this);
            arrayOfBridges.push(bridge);
            if(this.bridgeIndex == null) {this.bridgeIndex = arrayOfBridges.length-1;}   // for use in climb_off

            // perform extend
            this.direction = 'WEST';
        } else if(action.name == "CLIMB_ON"){
            // reposition ant appropriately

            if (arrayOfBridges[this.bridgeIndex].length-1 < 5){            // if bridge incomplete, climb on
                this.y = arrayOfBridges[this.bridgeIndex][arrayOfBridges[this.bridgeIndex].length-1].y;
                this.x = arrayOfBridges[this.bridgeIndex][arrayOfBridges[this.bridgeIndex].length-1].x - 10;
                arrayOfBridges[this.bridgeIndex].push(this);
                
                // console.log(arrayOfBridges[this.bridgeIndex].length);
            } else {    // if bridge complete, go to other side
                this.state = {name: "OTHER_SIDE"};
                this.x = riverGeometry.x - antGeometry.width;
            }

        } else if(action.name == "CLIMB_OFF"){
            // climb off
            this.climbOff(previousState, this.bridgeIndex);
            this.deleteRestOfBridge(previousState, this.bridgeIndex);
        } else {
            console.log("ERROR");
        }
    }

    this.climbOff = function(previousState, index){
        // will depend on its previous state
        if(previousState == actions.move) { // moving ant -> climb_off -> move
            this.state = actions.move;
        } else if(previousState == actions.extend) {    // extending ant -> climb off -> move
            this.direction = "EAST";
            this.state = actions.move;
            this.deleteBridge(index);
        } else if(previousState == actions.climb_on) {  // climbed_on ant -> climb_off -> dead
            this.state = actions.dead;
            this.deleteRestOfBridge(index);
        }
        this.startTime = null;

        // loop through all ants in bridge
        // if(arrayOfBridges[index] != undefined){
        //     arrayOfBridges[index].forEach(ant => {
        //         if (previousState == actions.extend) {  // extending ant -> climb off -> move
        //             ant.direction = "EAST";
        //             ant.state = actions.move;
        //         } else if(previousState == actions.climb_on) {  // climb-on -> dead
        //             ant.state = actions.dead;
        //         } else {
        //             ant.state = actions.move;
        //         }
        //         ant.startTime = null;

        //         console.log('now');
        //     });
        // }
        // Bug: what if no ants in the bridge?
    }

    this.deleteBridge = function(index){
        arrayOfBridges[index].forEach(ant => {
            if(ant.state != actions.climb_on){
                ant.state = actions.dead;
            }
        });

        arrayOfBridges[index] = [0];
    }

    this.deleteRestOfBridge = function(index) {
        if(arrayOfBridges[index] != undefined){
            // find this specific ant's index
            let antIndex = arrayOfBridges[index].indexOf(this);
            // if fist ant
            // if(antIndex == 0) {
            //     // delete this bridge
            //     arrayOfBridges[index] = [0];
            // } else {
                // remove reset of the bridge
                for(i=0; i < arrayOfBridges[index].length-antIndex; i++){
                    arrayOfBridges[index][antIndex].state = actions.dead;
                    arrayOfBridges[index].pop()
                }
            // }
        }
        // console.log(arrayOfBridges[index].length, antIndex, arrayOfBridges[index].length-antIndex);
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
        if(this.x <= referenceLine - 10 && this.state == actions.move) {
            while (this.direction == "WEST"){
                this.direction = directions[Math.floor(Math.random()*4)];
            }
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