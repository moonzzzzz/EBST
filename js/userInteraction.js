// // Update Behaviour Model

function addAction() {
    let action = document.getElementById("add-action-actions");
    mainAddAction(action);
}

function addSensor() {
    let action = document.getElementById("add-sensor-actions");
    let sensor = document.getElementById("add-sensor-sensors");
    mainAddSensor(action, sensor);
}

function connectSensor() {

}

function mainAddAction(action) {
    // actual add action function: adds the item to the appropriate list and to the behaviour model

    // adding to the add-sensor-actions list
    var node = document.createElement("option");
    var textnode = document.createTextNode(action.options[action.selectedIndex].text);
    node.appendChild(textnode);
    document.getElementById("add-sensor-actions").appendChild(node);

    // adding to the add-sensor-actions list
    node = document.createElement("option");
    textnode = document.createTextNode(action.options[action.selectedIndex].text);
    node.appendChild(textnode);
    document.getElementById("connect-sensor-actions").appendChild(node);
    
    // adding to the behaviour model
    // do nothing, since all actions are present by default
}

function mainAddSensor(action, sensor) {
    // actual add sensor function: adds the item to the appropriate list and to the behaviour model

    // adding to the connect-sensor-sensors list
    var node = document.createElement("option");
    var textnode = document.createTextNode(sensor.options[sensor.selectedIndex].text);
    node.appendChild(textnode);
    document.getElementById("connect-sensor-sensors").appendChild(node);

    // // Add item to the behaviour model

    // obtain new sensor parameters (id, type, probs, actions)
    let newId = sensors.length;     // one greater than last id
    let newType = sensor.options[sensor.selectedIndex].text.toUpperCase();
    let newProbs = [1];  // loop back to the initial action
    let newActions; // to be filled below

    // add the new sensor to the action
    let actionName = action.options[action.selectedIndex].text.toLowerCase();
    if(actionName == "move"){
        actions.move.sensors.push(newId);
        newActions = [actions.move];    // loop back to the initial action
        console.log(actions.move);
    } else if(actionName == "extend"){
        newActions = [actions.extend];    // loop back to the initial action
        console.log(actions.extend);
    } else if(actionName == "climb on"){
        newActions = [actions.climb_on];    // loop back to the initial action
        console.log(actions.climb_on);
    } else if(actionName == "climb off"){
        newActions = [actions.climb_off];    // loop back to the initial action
        console.log(actions.climb_off);
    } else {console.log("ERROR");}

    // input into new variable -> into sensors
    let newSensor = {id: newId, type: newType, probs: newProbs, actions: newActions};
    sensors.push(newSensor);
    console.log(sensors);

}

function updateBehaviourModel() {
    sensors[0].probs = [0, 1];
}