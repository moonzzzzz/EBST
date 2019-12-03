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

    // if first element, then delete fill option
    // let sensorActionsList = document.getElementById("add-sensor-actions");
    // let fillOption = sensorActionsList.options[0].value;  // fist element - fill
    // if(fillOption == "fill"){
    //     sensorActionsList.removeChild(sensorActionsList.childNodes[0]); // not removing
    //     console.log("removing");
    // }
    // ^^ can maybe do without this code, would be good enough

    // adding to the add-sensor-actions list
    var node = document.createElement("option");
    var textnode = document.createTextNode(action.options[action.selectedIndex].text);
    node.appendChild(textnode);
    document.getElementById("add-sensor-actions").appendChild(node);

    // adding to the add-sensor-actions list
    var node = document.createElement("option");
    var textnode = document.createTextNode(action.options[action.selectedIndex].text);
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

    // ToDo: adding to the behaviour model
    
}

function updateBehaviourModel() {
    sensors[0].probs = [0, 1];
}