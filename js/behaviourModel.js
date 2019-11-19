// // Graph: create an array of objects for actions, with child sensors - also an array of objects
let actions = {
    move:{name: "MOVE", "sensors": [0, 1]},
    extend:{name: "EXTEND", "sensors": [2]},
    climb_on:{name: "CLIMB_ON", "sensors": []}, 
    climb_off:{name: "CLIMB_OFF", "sensors": []}, 
    dead:{name: "DEAD"}
}

let sensors = [{"id": 0, type: "EDGE", probs:[1, 0], actions:[actions.extend, actions.move]},
    {"id": 1, type: "ANT_EXTENDING", probs:[.9, .1], actions:[actions.climb_on, actions.move]},
    {"id": 2, type: "TIME", probs:[1, 0], actions:[actions.climb_off, actions.extend]}
]

let priorities = ["TIME", "EDGE", "ANT_EXTENDING"];

function getActionSensor(index){
    number = sensors.findIndex(x => x.id === index);
    return sensors[number];
}

