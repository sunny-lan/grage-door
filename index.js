"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grage_1 = __importDefault(require("grage-lib/grage"));
window.onload = function () {
    const grage = grage_1.default();
    const data = grage.getData({});
    //if there is already a saved ID, use that
    if (data.currentID) {
        // @ts-ignore idk why
        window.location = 'app.html';
        return;
    }
    const connectBtn = document.querySelector('#connect');
    const deviceID = document.querySelector('#deviceID');
    connectBtn.onclick = function handleConnect() {
        const id = deviceID.value;
        //make sure user given id is not empty
        if (id.trim().length > 0) {
            data.currentID = id;
            grage.saveData(data);
            window.location.href = 'app.html';
        }
    };
};
//# sourceMappingURL=index.js.map