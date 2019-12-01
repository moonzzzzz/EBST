// // Update Behaviour Model

function addAction() {
    // name = read the drop down menu

    actionName = document.getElementById("adding-action").innerHTML;
    mainAddAction(actionName);
}

function mainAddAction(name) {
    // actual add action function
    // should be a drop down list of 4 actions

    var node = document.createElement("option");
    var textnode = document.createTextNode("Water");
    node.appendChild(textnode);
    document.getElementById("adding-sensors").appendChild(node);
    console.log(name)
}

function updateBehaviourModel() {
    sensors[0].probs = [0, 1];
}