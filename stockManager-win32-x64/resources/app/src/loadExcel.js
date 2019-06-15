const { ipcRenderer, dialog } = require('electron').remote
const remote = require('electron').remote;

const selectDirBtn = document.getElementById('select-directory')
//const selectSheetBtn = document.getElementById('sheet-name')
//const updateDataBtn = document.getElementById('update_data')

const xlsx = require("xlsx")
let workfile
let sheet_json

const Database = require("nedb");

let tagarray = new Array();
var sheetnamedb;
var datalistdb;
var tagdb;



selectDirBtn.addEventListener('click', (event) => {
    //ipcRenderer.send('open-file-dialog')
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'XLSX file', extensions: ['xlsx'] }
        ]
    }, (files) => {
        if (files) {
            //DBの読み込み
            sheetnamedb = new Database({
                filename: 'src/db/sheetnamelist.db',
                autoload: true
            })
            sheetnamedb.loadDatabase();

            tagdb = new Database({
                filename: 'src/db/taglist.db',
                autoload: true
            })
            tagdb.loadDatabase();

            datalistdb = new Database({
                filename: 'src/db/datalist.db',
                autoload: true
            })
            datalistdb.loadDatabase();
            //Excelファイルのパスを取得
            var f = files[0]
            workfile = xlsx.readFile(f)
            sheetNamePost(workfile.SheetNames)
        }
    })

})


function sheetNamePost(nameList) {
    //シート名を送信
    for (n in nameList) {
        //シート名をDBに代入
        var doc = {
            name: nameList[n]
        }
        sheetnamedb.insert(doc)
        sheetDataPost(nameList[n])
    }

    //tag保存
    let tags = new Set(tagarray);
    for (i of tags) {
        var doc = {
            name: i
        }
        tagdb.insert(doc);
    }
    messageDialogprint("完了", "データを追加しました")
}

function sheetDataPost(select_sheetname) {
    var sheetnamech = workfile.Sheets[select_sheetname]
    //sheetNameから取得
    sheet_json = xlsx.utils.sheet_to_json(sheetnamech)

    //tableに代入
    for (let data of sheet_json) {
        //DBに代入
        var doc = {
            name: `${data['名前']}`,
            num: ` ${data['個数']}`,
            memo: ` ${data['メモ']}`,
            tag: `${data['ジャンル']}`,
            place: select_sheetname
        }

        tagarray.push(`${data['ジャンル']}`);
        datalistdb.insert(doc)
    }
}


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

