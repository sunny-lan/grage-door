import makeGrage from 'grage-lib/grage';

window.onload = function () {
    const grage = makeGrage();
    const data = grage.getData({});

    //if there is already a saved ID, use that
    if (data.currentID) {
        // @ts-ignore idk why
        window.location = 'app.html';
        return;
    }

    const connectBtn: HTMLButtonElement = document.querySelector('#connect');
    const deviceID: HTMLInputElement = document.querySelector('#deviceID');
    connectBtn.onclick = function handleConnect() {
        const id = deviceID.value;
        //make sure user given id is not empty
        if (id.trim().length > 0) {
            data.currentID = id;
            grage.saveData(data);
            window.location.href = 'app.html';
        }
    }
}