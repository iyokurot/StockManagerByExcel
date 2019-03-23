const { ipcRenderer, dialog } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const remote = require('electron').remote;

const openSettingBtn = document.getElementById('open-settings')
const backMain = document.getElementById('back-to-main')

openSettingBtn.addEventListener('click', (event) => {
    var win = remote.getCurrentWindow();//new BrowserWindow({ width: 200, height: 400 });
    win.loadURL(`file://` + __dirname + `/setting.html`);
    /*
    win.on('closed', () => {
        win = null;
    });
    win.show()
    */
})

function backMainindex() {
    console.log("push back")
    var win = remote.getCurrentWindow();
    win.loadURL(`file://` + __dirname + `/index.html`);
    /*
    win.on('closed', () => {
        win = null;
    });
    win.show()
    */
}