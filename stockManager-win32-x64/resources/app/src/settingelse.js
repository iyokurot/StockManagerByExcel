const { ipcRenderer, dialog } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const remote = require('electron').remote;


const backMain = document.getElementById('back-to-main')
const sheetdelBtn = document.getElementById('sheet-delete')
const alldatadelBtn = document.getElementById('all-data-delete')


//戻るボタン
backMain.addEventListener('click', (event) => {
    backMainindex();
})


function backMainindex() {
    var win = remote.getCurrentWindow();
    win.loadURL(`file://` + __dirname + `/index.html`);
    /*
    win.on('closed', () => {
        win = null;
    });
    win.show()
    */
}

//シート削除ボタン処理＆ウィンドウ起動
sheetdelBtn.addEventListener('click', (event) => {
    sheetdelwindowload()
})
function sheetdelwindowload() {
    let win = new BrowserWindow({ width: 200, height: 150 });
    win.loadURL(`file://` + __dirname + `/deletesheet.html`);
    //win.loadFile('deletesheet.html');
    win.on('closed', () => {
        win = null;
        //削除のち再読み込み更新
        //reloadDB()
    });
    win.show()
}

//全データ削除ボタン
alldatadelBtn.addEventListener('click', (event) => {
    var win = remote.getCurrentWindow();
    var options = {
        type: 'info',
        buttons: ['いいえ', 'はい'],
        title: '削除確認',
        message: 'データを本当に全削除しますか？',
        detail: '削除したデータは戻せませんがよろしいですか？'
    };
    var delok = dialog.showMessageBox(win, options)
    if (delok == 1) {
        //削除処理

        messageDialogprint("完了", "削除しました")
    }
})

//報告ダイアログ
function messageDialogprint(mes, det) {
    var win = remote.getCurrentWindow();
    var options = {
        type: 'info',
        buttons: ['OK'],
        title: '確認',
        message: mes,
        detail: det
    };

    dialog.showMessageBox(win, options)
}