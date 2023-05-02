"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grage_1 = __importDefault(require("grage-lib/grage"));
const esp8266_1 = __importDefault(require("grage-lib/esp8266"));
const util_1 = __importDefault(require("grage-lib/util"));
window.onload = function () {
    const grage = grage_1.default();
    const data = grage.getData({});
    const id = data.currentID;
    //if no device selected, return to index
    if (!id) {
        window.location.href = 'index.html';
        return;
    }
    //esp constants
    const sensorPin = esp8266_1.default.Pin.D6, controlPin = esp8266_1.default.Pin.D7;
    //initialize ui
    const indicator = document.querySelector('#onIndicator');
    const lastUpdate = document.querySelector('#lastUpdate');
    const toggle = document.querySelector('#toggle');
    const disconnect = document.querySelector('#disconnect');
    disconnect.onclick = function handleDisconnect() {
        delete data.currentID;
        grage.saveData(data);
        window.location.href = 'index.html';
    };
    let lastUpdateTime;
    setInterval(function showLastUpdate() {
        if (lastUpdateTime)
            lastUpdate.innerText = 'Last update: ' + util_1.default.timeDifference(new Date(), lastUpdateTime);
    }, 1000);
    grage.onOpen(() => {
        toggle.disabled = false;
        grage.connect(id, function receive(data) {
            const sense = data.pinReadings[sensorPin];
            if (sense === esp8266_1.default.LogicLevel.HIGH) {
                indicator.innerText = 'open';
                toggle.innerText = 'Close door';
            }
            else {
                indicator.innerText = 'closed';
                toggle.innerText = 'Open door';
            }
            lastUpdateTime = new Date();
        });
        //when device becomes alive, run initialization stuff
        //such as setting up inputs, outputs and interrupts
        grage.onAlive(id, function alive() {
            //enable input then read
            grage.send(id, esp8266_1.default.pinMode(sensorPin, esp8266_1.default.PinMode.INPUT_PULLUP));
            grage.send(id, esp8266_1.default.attachInterrupt(sensorPin, esp8266_1.default.InterruptMode.CHANGE));
            //enable output, make sure it is off
            grage.send(id, esp8266_1.default.pinMode(controlPin, esp8266_1.default.PinMode.OUTPUT));
            grage.send(id, esp8266_1.default.digitalWrite(controlPin, esp8266_1.default.LogicLevel.LOW));
        });
        //when device becomes dead, disable ui again
        grage.onDead(id, function dead() {
            toggle.disabled = true;
            toggle.innerText = 'not connected';
            indicator.innerText = '';
        });
    });
    toggle.onclick = function handleClick() {
        //disable button while door is in process of opening/closing
        toggle.disabled = true;
        setTimeout(() => toggle.disabled = false, 1000);
        //send 100ms pulse to garage door switch
        grage.send(id, esp8266_1.default.digitalWrite(controlPin, esp8266_1.default.LogicLevel.HIGH));
        setTimeout(() => {
            grage.send(id, esp8266_1.default.digitalWrite(controlPin, esp8266_1.default.LogicLevel.LOW));
        }, 100);
    };
};
//# sourceMappingURL=app.js.map