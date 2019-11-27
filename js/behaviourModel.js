// // Graph: create an array of objects for actions, with child sensors - also an array of objects
let actions = {
    move:{name: "MOVE", "sensors": [0, 1]},
    extend:{name: "EXTEND", "sensors": []},
    climb_on:{name: "CLIMB_ON", "sensors": [3]}, 
    climb_off:{name: "CLIMB_OFF", "sensors": []}, 
    dead:{name: "DEAD", "sensors": []}
}

let sensors = [{"id": 0, type: "EDGE", probs:[0.2, 0.8], actions:[actions.extend, actions.move]},
    {"id": 1, type: "ANT_EXTENDING", probs:[.9, .1], actions:[actions.climb_on, actions.move]},
    {"id": 2, type: "TIME", probs:[1, 0], actions:[actions.climb_off, actions.extend]},
    {"id": 3, type: "TIME", probs:[0.5, 0.5], actions:[actions.climb_off, actions.climb_on]}
]

let priorities = ["TIME", "EDGE", "ANT_EXTENDING"];

function getActionSensor(index){
    number = sensors.findIndex(x => x.id === index);
    return sensors[number];
}

let timeToEndTime = 10;      // how many seconds for time sensor
let timeSensorRepeat = false;
let antTrackingOn = true;   // ant with red shadow, prints state once action is performed
let timeRate = 5;   // from 1 to 10, speed up and slow down time

// ToDo - fix errors:
// error when time sensor added to climb_on sensor

