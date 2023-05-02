(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"grage-lib/esp8266":2,"grage-lib/grage":4,"grage-lib/util":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PinMode;
(function (PinMode) {
    PinMode[PinMode["INPUT"] = 0] = "INPUT";
    PinMode[PinMode["INPUT_PULLUP"] = 2] = "INPUT_PULLUP";
    PinMode[PinMode["OUTPUT"] = 1] = "OUTPUT";
})(PinMode || (PinMode = {}));
var InterruptMode;
(function (InterruptMode) {
    InterruptMode[InterruptMode["RISING"] = 1] = "RISING";
    InterruptMode[InterruptMode["FALLING"] = 2] = "FALLING";
    InterruptMode[InterruptMode["CHANGE"] = 3] = "CHANGE";
    InterruptMode[InterruptMode["ONLOW"] = 4] = "ONLOW";
    InterruptMode[InterruptMode["ONHIGH"] = 5] = "ONHIGH";
})(InterruptMode || (InterruptMode = {}));
var LogicLevel;
(function (LogicLevel) {
    LogicLevel[LogicLevel["HIGH"] = 1] = "HIGH";
    LogicLevel[LogicLevel["LOW"] = 0] = "LOW";
})(LogicLevel || (LogicLevel = {}));
var Pin;
(function (Pin) {
    Pin[Pin["D0"] = 16] = "D0";
    Pin[Pin["D1"] = 5] = "D1";
    Pin[Pin["D2"] = 4] = "D2";
    Pin[Pin["D3"] = 0] = "D3";
    Pin[Pin["D4"] = 2] = "D4";
    Pin[Pin["D5"] = 14] = "D5";
    Pin[Pin["D6"] = 12] = "D6";
    Pin[Pin["D7"] = 13] = "D7";
    Pin[Pin["D8"] = 15] = "D8";
    Pin[Pin["D9"] = 3] = "D9";
    Pin[Pin["D10"] = 1] = "D10";
    Pin[Pin["_A0"] = 17] = "_A0";
})(Pin || (Pin = {}));
// @ts-ignore
exports.default = {
    LogicLevel,
    PinMode,
    InterruptMode,
    Pin,
    pinMode(pin, mode) {
        return {
            command: 'pinMode',
            pin, mode,
        };
    },
    digitalWrite(pin, value) {
        return {
            command: 'digitalWrite',
            pin, value,
        };
    },
    attachInterrupt(pin, mode) {
        return {
            command: 'attachInterrupt',
            pin, mode,
        };
    },
    detachInterrupt(pin) {
        return {
            command: 'detachInterrupt',
            pin
        };
    },
};

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
exports.default = {
    timeDifference(current, previous) {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const msPerMonth = msPerDay * 30;
        const msPerYear = msPerDay * 365;
        // @ts-ignore
        const elapsed = current - previous;
        if (elapsed < msPerMinute) {
            return Math.round(elapsed / 1000) + ' seconds ago';
        }
        else if (elapsed < msPerHour) {
            return Math.round(elapsed / msPerMinute) + ' minutes ago';
        }
        else if (elapsed < msPerDay) {
            return Math.round(elapsed / msPerHour) + ' hours ago';
        }
        else if (elapsed < msPerMonth) {
            return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
        }
        else if (elapsed < msPerYear) {
            return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
        }
        else {
            return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
        }
    }
};

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRequestPing(m) {
    return m.type === 'rping';
}
function isPingMessage(m) {
    return m.type === 'ping';
}
function isChannelMessage(m) {
    return isDataMessage(m) || isRequestPing(m) || isPingMessage(m);
}
function isDataMessage(m) {
    return m.type === 'data';
}
var LiveState;
(function (LiveState) {
    LiveState[LiveState["ALIVE"] = 0] = "ALIVE";
    LiveState[LiveState["DEAD"] = 1] = "DEAD";
    LiveState[LiveState["UNKNOWN"] = 2] = "UNKNOWN";
})(LiveState || (LiveState = {}));
// @ts-ignore
function makeGrage(host = undefined) {
    let protocol = 'wss';
    if (window.location.protocol !== 'https:')
        protocol = 'ws';
    host !== null && host !== void 0 ? host : (host = `${protocol}://${window.location.hostname}:${window.location.port}/ws`);
    const ws = new WebSocket(host);
    //list of listeners for when the websocket connects
    let openListeners = [];
    const channels = {};
    /**
     * Sends a message on the websocket, returns any error which occurs
     * @param m the message to send
     */
    function wsSend(m) {
        try {
            debug('[Send]', m);
            ws.send(JSON.stringify(m));
            return false;
        }
        catch (error) {
            handleError(error);
            return error;
        }
    }
    /**
     * console.logs the parameters if debug mode is on
     * @param args the parameters to console.log
     */
    function debug(...args) {
        if (grage.options.debug)
            console.log(...args);
    }
    const grage = {
        options: {
            /**
             * shows debug messages if set to true
             */
            debug: location.hostname === "localhost" || location.hostname === "127.0.0.1",
            /**
             * how long to wait before reloading the page
             * this prevents exploding if errors occur at page load time
             */
            reloadTime: 5 * 1000,
            /**
             * how long to wait before actively checking if a device is alive
             */
            aliveTimeout: 10 * 1000,
            /**
             * how long to wait for a device to respond to a ping request
             */
            pingTimeout: 5 * 1000,
            /**
             * if a device is not responding,
             * how long to wait before retrying another ping request
             */
            pingRetry: 30 * 1000,
        },
        /**
         * Registers a listener which is called upon connection to server
         * @param cb the listener
         */
        onOpen(cb) {
            if (openListeners === undefined)
                cb();
            else
                openListeners.push(cb);
        },
        /**
         * Gets the ID of the currently running app
         */
        getAppID() {
            const url = window.location.pathname.slice(1);
            const tokens = url.split('/');
            if (tokens[0] !== 'apps')
                throw new Error('Cannot get data: invalid app');
            return tokens[1];
        },
        /**
         * Gets the locally stored data/settings for this app
         */
        getData(defaultValue) {
            const app = grage.getAppID();
            const data = window.localStorage.getItem(app);
            if (data)
                return JSON.parse(data);
            else
                return defaultValue;
        },
        /**
         * Saves some data to the local storage for this app.
         * Overwrites old data
         * @param data the data to save
         */
        saveData(data) {
            window.localStorage.setItem(grage.getAppID(), JSON.stringify(data));
        },
        /**
         * Terminates the connection and reloads the app.
         */
        terminate() {
            //close ws if not already
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            //reload page in 5 seconds
            setTimeout(() => window.location.reload(false), grage.options.reloadTime);
        },
        /**
         * Request a device to ping
         * @param id the device to request ping from
         */
        requestPing(id) {
            //send ping
            const m = {
                type: "rping",
                id,
                fromDevice: false
            };
            if (wsSend(m))
                return;
        },
        /**
         * Connects to a channel and listens to any messages on channel
         * @param id the id of the channel
         * @param cb the listener for messages
         */
        connect(id, cb) {
            //if not connected to channel yet
            if (!channels.hasOwnProperty(id)) {
                //initialize channelListeners
                channels[id] = {
                    dataListeners: [],
                    dataListenersOnce: [],
                    aliveListeners: [],
                    deadListeners: [],
                    state: LiveState.UNKNOWN,
                    prevState: LiveState.UNKNOWN,
                };
                //send channel connect message
                const m = {
                    type: "connect",
                    id,
                };
                if (wsSend(m))
                    return;
            }
            //request new data
            grage.requestPing(id);
            channels[id].dataListeners.push(cb);
        },
        /**
         * Listens to a single message from a channel
         * @param id the channel to listen to
         * @param cb the listener
         */
        once(id, cb) {
            channels[id].dataListenersOnce.push(cb);
        },
        /**
         * Sends data to channel
         * @param id the id of the channel
         * @param data the data to send
         */
        send(id, data) {
            const m = {
                type: "data",
                data,
                id,
                fromDevice: false,
            };
            if (wsSend(m))
                return;
        },
        onAlive(id, cb) {
            const channel = channels[id];
            if (channel.state === LiveState.ALIVE) {
                cb();
            }
            channel.aliveListeners.push(cb);
        },
        onDead(id, cb) {
            const channel = channels[id];
            if (channel.state === LiveState.DEAD)
                cb();
            channel.deadListeners.push(cb);
        }
    };
    /**
     * Call this when a device is known to be alive
     * @param id the device which is alive
     */
    function assertAlive(id) {
        debug('[Alive]', id);
        const channel = channels[id];
        //remove any pending timeout
        clearTimeout(channel.currentTimer);
        //channel just became alive
        if (channel.prevState !== LiveState.ALIVE) {
            channel.prevState = LiveState.ALIVE;
            //protect from stack explosion by running in next tick
            setTimeout(() => {
                debug('[Notifying alive]', id);
                for (const listener of channel.aliveListeners)
                    listener();
            });
        }
        channel.state = LiveState.ALIVE;
        //make sure to periodically check if channel is actually alive
        channel.currentTimer = setTimeout(function checkAlive() {
            channel.state = LiveState.UNKNOWN;
            //channel has not said anything for a long time,
            //send it a ping to see if its still alive
            pingTest(id);
        }, grage.options.aliveTimeout);
    }
    /**
     * Tests if a device is still alive by pinging it and waiting for response
     * @param id the device
     */
    function pingTest(id) {
        const channel = channels[id];
        debug('Pinging', id, '...');
        grage.requestPing(id);
        //if device does respond, assertAlive will get called,
        //canceling the death timer
        channel.currentTimer = setTimeout(function dead() {
            //otherwise no response, its dead.
            assertDead(id);
        }, grage.options.pingTimeout);
    }
    /**
     * Called when it is known a device is dead
     * @param id the device known to be dead
     */
    function assertDead(id) {
        debug('[Dead]', id);
        const channel = channels[id];
        //remove any pending timeout
        clearTimeout(channel.currentTimer);
        //channel just became dead
        if (channel.prevState !== LiveState.DEAD) {
            channel.prevState = LiveState.DEAD;
            //protect from stack explosion by running in next tick
            setTimeout(() => {
                debug('[Notifying dead]', id);
                for (const listener of channel.deadListeners)
                    listener();
            });
        }
        channel.state = LiveState.DEAD;
        //try pinging it again later
        setTimeout(() => pingTest(id), grage.options.pingRetry);
    }
    ws.onmessage = evt => {
        try {
            const m = JSON.parse(evt.data);
            debug('[recv]', m);
            //ignore messages from other browsers, ignore non subscribed messages
            if (isChannelMessage(m) && m.fromDevice && channels.hasOwnProperty(m.id)) {
                //since this device just sent a message,
                //it must be alive
                assertAlive(m.id);
                const channel = channels[m.id];
                if (isDataMessage(m)) {
                    //send to every listener in the proper channel
                    for (const listener of channel.dataListeners) {
                        listener(m.data);
                    }
                    //send to every once listener
                    for (const listener of channel.dataListenersOnce) {
                        listener(m.data);
                    }
                    //then clear list of once listeners
                    channel.dataListenersOnce = [];
                }
            }
            else {
                console.warn('[Unknown message type]', m);
            }
        }
        catch (error) {
            return handleError(error);
        }
    };
    ws.onopen = function handleOpen() {
        debug('[Websocket open]');
        //call every listener upon connect
        if (openListeners !== undefined)
            for (const handler of openListeners)
                handler();
        openListeners = undefined;
    };
    function handleError(error) {
        console.error('[Websocket error]', error);
        //if debug, stop, else try reload page
        if (!grage.options.debug)
            grage.terminate();
        else {
            console.log('[Debug mode] frozen');
            debugger;
        }
    }
    ws.onerror = (ev) => {
        handleError(ev);
    };
    ws.onclose = grage.terminate;
    return grage;
}
exports.default = makeGrage;

},{}]},{},[1]);
