const { ipcRenderer, dialog } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const remote = require('electron').remote;

const dataAddBtn = document.getElementById('data-add')

const Database = require("nedb")
//sheetDBの取得
let sheetnamedb = new Database({
    filename: 'src/db/sheetnamelist.db',
    autoload: true
})
sheetnamedb.loadDatabase();
let tagdb = new Database({
    filename: 'src/db/taglist.db',
    autoload: true
})
tagdb.loadDatabase();
sheetnameoptionload();
tagoptionload();

function sheetnameoptionload() {
    sheetnamedb.find({}).sort({ name: 1 }).exec(function (err, docs) {
        //データ追加セレクトボックス
        var span = document.getElementsByName("newdata-option-sheetname")

        for (n in docs) {
            //リスト(option)に代入
            var option_add = document.createElement("option")
            option_add.setAttribute("value", docs[n].name)
            option_add.innerHTML = docs[n].name
            span[0].appendChild(option_add)

        }
    })
}
function tagoptionload() {
    tagdb.find({}).sort({ name: 1 }).exec(function (err, docs) {
        //データ追加セレクトボックス
        var span = document.getElementsByName("newdata-option-tag")
        for (n in docs) {
            //リスト(option)に代入
            var option_add = document.createElement("option")
            option_add.setAttribute("value", docs[n].name)
            option_add.innerHTML = docs[n].name
            span[0].appendChild(option_add)
        }
    })
}

//データ追加ボタン
dataAddBtn.addEventListener('click', (event) => {
    var sheetoption = document.getElementById("newdata-option-sheetname")
    var sheet = sheetoption.value
    var tagoption = document.getElementById("newdata-option-tag")
    var tag = tagoption.value
    //var val = sheetoption.options[sheet]
    var name = document.getElementById("newdata-add-name").value
    var num = document.getElementById("newdata-add-num").value
    var memo = document.getElementById("newdata-add-memo").value

    console.log(name + num + memo);
    if (name == "" || num == "" || memo == "") {
        dialog.showErrorBox("追加できませんでした", "空欄があります")
        return
    }
    //品物DBの取得
    let datalistdb = new Database({
        filename: 'src/db/datalist.db',
        autoload: true
    })
    datalistdb.loadDatabase();

    var doc = {
        name: name,
        num: num,
        memo: memo,
        tag: tag,
        place: sheet
    }
    datalistdb.insert(doc)

    messageDialogprint("追加しました", "")
    document.getElementById("newdata-add-name").value = ""
    document.getElementById("newdata-add-num").value = ""
    document.getElementById("newdata-add-memo").value = ""
    //テーブル更新
    //reloadalldataTable()
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