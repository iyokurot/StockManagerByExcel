const { ipcRenderer, dialog } = require('electron').remote
const remote = require('electron').remote;

const selectdbBtn = document.getElementById('db-load')
const selectSheetBtn = document.getElementById('sheet-name')
const sheetAddBtn = document.getElementById('sheet-name-addbutton')
const deleteBtn = document.getElementById('delete_data')
const updateBtn = document.getElementById('update_data')
const dataAddBtn = document.getElementById('data-add')


const Database = require("nedb")
//sheetDBの取得
let sheetnamedb = new Database({
    filename: 'src/db/sheetnamelist.db',
    autoload: true
})
sheetnamedb.loadDatabase();

//品物DBの取得
let datalistdb = new Database({
    filename: 'src/db/datalist.db',
    autoload: true
})
datalistdb.loadDatabase()

let lastselecteddata = null

//DB取得ボタン
selectdbBtn.addEventListener('click', (event) => {
    firstloadDB()
})

function firstloadDB() {
    //sheetDBの取得
    sheetnamedb = new Database({
        filename: 'src/db/sheetnamelist.db',
        autoload: true
    })
    sheetnamedb.loadDatabase()
    //品物DBの取得
    datalistdb = new Database({
        filename: 'src/db/datalist.db',
        autoload: true
    })
    datalistdb.loadDatabase()

    sheetnamedb.find({}).sort({ name: 1 }).exec(function (err, docs) {
        var sheetnames = ''
        sheetnames += "<br><button class=sheet-name-button id=all >すべて</button>"
        for (n in docs) {
            sheetnames += "<br><button class=sheet-name-button id=" + docs[n].name + " >" + docs[n].name + "</button>"
        }
        document.getElementById('sheet-name').innerHTML = sheetnames
    })

    var doc = {
        name: 'shinobu',
        num: '8',
        memo: 'ぱないの',
        place: '1階'
    }

    //datalistdb.insert(doc)
    datalistdb.find({ name: 'shinobu' }, function (err, docs) {
        //console.log(docs)
        for (d in docs) {
            //console.log(docs[d].name);
        }
    })

    datalistdb.find({}, function (err, docs) {
        //console.log(docs)
        for (d in docs) {
        }
    })

    datalistdb.count({}, function (err, count) {
        //console.log(count)
    })
}

//シート名追加ボタン
sheetAddBtn.addEventListener('click', (event) => {
    var newSheetname = document.getElementById("sheetname-post-area")
    if (newSheetname.value == "") {
        dialog.showErrorBox("追加できませんでした", "シート名が空白です")
        return
    }
    //sheetDBに追加 *同名がないか確認
    sheetnamedb.count({ name: newSheetname.value }, function (err, count) {
        if (count != 0 || newSheetname.value == "すべて") {
            dialog.showErrorBox("追加できませんでした", "シート名が重複しています")
            return
        }
        var newsheet = {
            name: newSheetname.value
        }
        sheetnamedb.insert(newsheet)
        messageDialogprint("シート名を追加しました", "新しいシート名：" + newSheetname.value)
    })

})

//データ追加ボタン
dataAddBtn.addEventListener('click', (event) => {
    confirm("message", "")
})


//sheetボタン
selectSheetBtn.addEventListener('click', (event) => {
    //シートボタンのidによって切り替え

    var click_sheet = event.target.id
    if ("all" == click_sheet) {
        reloadalldataTable()
    } else {
        datalistdb.find({ place: click_sheet }, function (err, docs) {
            insertTable(docs)
        })
    }


})

function insertTable(docs) {
    //table初期化
    var data_table = document.getElementById("sheet-data-list-table")
    while (data_table.rows.length > 1) data_table.deleteRow(-1);

    for (let data of docs) {

        var row = data_table.insertRow(-1)
        row.onclick = function () {
            table_click(this, data)
        }
        var cel1 = row.insertCell(-1)
        var cel2 = row.insertCell(-1)
        cel1.innerHTML = data.name
        cel2.innerHTML = data.num

    }
}

function table_click(row, data) {
    //row.style.backgroundColor = 'red'
    document.getElementById("name-post-area").value = data.name
    var memoarea = document.getElementById("memo-area")
    if (data.memo == " undefined") {
        memoarea.value = ""
    } else {
        memoarea.value = data.memo
    }
    var numarea = document.getElementById("number-area")
    numarea.value = parseInt(data.num)
    lastselecteddata = data
}

//データ更新ボタン
updateBtn.addEventListener('click', (event) => {
    if (lastselecteddata == null) {
        return
    }
    var memoarea = document.getElementById("memo-area")
    var namearea = document.getElementById("name-post-area")
    datalistdb.update({ _id: lastselecteddata._id }, { $set: { name: namearea.value } }, { multi: false }, function (err, numReplaced) {
        //テーブル更新
        reloadalldataTable()
        messageDialogprint("更新しました", "正常に更新しました")

    })
})

//データ削除ボタン
deleteBtn.addEventListener('click', (event) => {
    if (lastselecteddata == null) {
        return
    }
    //削除確認ダイアログ
    var win = remote.getCurrentWindow();
    var options = {
        type: 'info',
        buttons: ['はい', 'いいえ'],
        title: '削除確認',
        message: '本当に削除しますか？'
    };

    var delok = dialog.showMessageBox(win, options)

    if (delok == 0) {
        datalistdb.remove({ _id: lastselecteddata._id }, {}, function (err, numRemoved) {
            //テーブル更新
            reloadalldataTable()
            //削除完了通知
            messageDialogprint("削除しました", "正常に削除しました")
        })
    } else if (delok == 1) {
        messageDialogprint("キャンセルされました", "　")
    }
})

//テーブル再読み込み
function reloadalldataTable() {
    datalistdb.find({}, function (err, docs) {
        insertTable(docs)
    })
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

function tester() {
    console.log("これはテストです")
}