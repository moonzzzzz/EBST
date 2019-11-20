// // Graph: create an array of objects for actions, with child sensors - also an array of objects
let actions = {
    move:{name: "MOVE", "sensors": [0]},
    extend:{name: "EXTEND", "sensors": []},
    climb_on:{name: "CLIMB_ON", "sensors": [2]}, 
    climb_off:{name: "CLIMB_OFF", "sensors": []}, 
    dead:{name: "DEAD"}
}

let sensors = [{"id": 0, type: "EDGE", probs:[0.5, 0.5], actions:[actions.extend, actions.move]},
    {"id": 1, type: "ANT_EXTENDING", probs:[.9, .1], actions:[actions.climb_on, actions.move]},
    {"id": 2, type: "TIME", probs:[0.5, 0.5], actions:[actions.climb_off, actions.extend]}
]

let priorities = ["TIME", "EDGE", "ANT_EXTENDING"];

function getActionSensor(index){
    number = sensors.findIndex(x => x.id === index);
    return sensors[number];
}

// ToDo - fix errors:
// when move is not connected to edge sensor, the ants stop sensing the edge of the river altogether
// firstly, why do they not cross the river when edge is connected
