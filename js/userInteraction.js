// // Update Behaviour Model

function addAction() {
    // name = read the drop down menu

    let action = document.getElementById("add-action-actions");
    mainAddAction(action);
}

function mainAddAction(action) {
    // actual add action function

    // if first element, then delete fill option
    let sensorActionsList = document.getElementById("add-sensor-actions");
    let fillOption = sensorActionsList.options[0].value;  // fist element - fill
    if(fillOption == "fill"){
        sensorActionsList.removeChild(sensorActionsList.childNodes[0]);
    }


    var node = document.createElement("option");
    var textnode = document.createTextNode(action.options[action.selectedIndex].text);
    node.appendChild(textnode);
    document.getElementById("add-sensor-actions").appendChild(node);
    // console.log(action.options[action.selectedIndex].text);
}

function updateBehaviourModel() {
    sensors[0].probs = [0, 1];
}