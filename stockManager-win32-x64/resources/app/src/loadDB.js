const { ipcRenderer, dialog } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const remote = require('electron').remote;


const selectdbBtn = document.getElementById('db-load')
const sheetdelBtn = document.getElementById('sheet-delete')
const selectSheetBtn = document.getElementById('sheet-name')
const sheetAddBtn = document.getElementById('sheet-name-addbutton')

const plusBtn = document.getElementById('numplus')
const minusBtn = document.getElementById('numminus')
const deleteBtn = document.getElementById('delete_data')
const updateBtn = document.getElementById('update_data')
const dataAddBtn = document.getElementById('data-add')

const chatpostBtn = document.getElementById('chat-post')
const chatBtn = document.getElementById('chatlist')

const chatreloadBtn = document.getElementById("reload-chat-list")

const openSettingBtn = document.getElementById('open-settings')


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

//チャットDBの取得
let chatDB = new Database({
    filename: 'src/db/chatlist.db',
    autoload: true
})
chatDB.loadDatabase()

let lastselecteddata = null
let chatpostchanger = null

let windowA = remote.getCurrentWindow()
if (windowA.getTitle() == "在庫管理App") {
    firstloadDB()
}

//DB取得ボタン
selectdbBtn.addEventListener('click', (event) => {
    reloadDB()
})

function firstloadDB() {
    //sheetDBの取得
    sheetnamedb = new Database({
        filename: 'src/db/sheetnamelist.db',
        //autoload: true
    })
    sheetnamedb.loadDatabase()
    //品物DBの取得
    datalistdb = new Database({
        filename: 'src/db/datalist.db',
        //autoload: true
    })
    datalistdb.loadDatabase()

    sheetnamedb.find({}).sort({ name: 1 }).exec(function (err, docs) {
        var sheetnames = ''
        sheetnames += "<br><button class=sheet-name-button id=all >すべて</button>"

        //データ追加セレクトボックス
        var dataoption = document.getElementsByName("data-option-sheetname")
        var span = document.getElementsByName("newdata-option-sheetname")

        for (n in docs) {
            sheetnames += "<br><button class=sheet-name-button id=" + docs[n].name + " >" + docs[n].name + "</button>"

            //リスト(option)に代入
            var option_add = document.createElement("option")
            option_add.setAttribute("value", docs[n].name)
            option_add.innerHTML = docs[n].name
            span[0].appendChild(option_add)

            var option_addt = document.createElement("option")
            option_addt.setAttribute("value", docs[n].name)
            option_addt.innerHTML = docs[n].name
            dataoption[0].appendChild(option_addt)
        }
        document.getElementById('sheet-name').innerHTML = sheetnames


    })
    loadchats()
}

function reloadDB() {
    optionResetter(document.getElementById("data-option-sheetname"))
    optionResetter(document.getElementById("newdata-option-sheetname"))
    firstloadDB()
}
function loadchats() {
    //チャットDBの取得
    let chatDB = new Database({
        filename: 'src/db/chatlist.db',
        //autoload: true
    })
    chatDB.loadDatabase()
    var chs = ""
    chatDB.find({}).sort({ date: 1 }).exec(function (err, docs) {
        for (n in docs) {
            chs += "<button id=" + docs[n]._id + " class=chatbutton>" + docs[n].name + "@" + docs[n].text + "</button><br>"
        }
        document.getElementById('chatlist').innerHTML = chs

        var obj = document.getElementById("chat-data-area")
        document.getElementById("chat-data-area").scrollTop = obj.scrollHeight
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
        reloadDB()
        document.getElementById("sheetname-post-area").value = ""
    })

})

//データ追加ボタン
dataAddBtn.addEventListener('click', (event) => {
    var sheetoption = document.getElementById("newdata-option-sheetname")
    var sheet = sheetoption.value
    //var val = sheetoption.options[sheet]
    var name = document.getElementById("newdata-add-name").value
    var num = document.getElementById("newdata-add-num").value
    var memo = document.getElementById("newdata-add-memo").value

    if (name == "" || num == "" || memo == "") {
        dialog.showErrorBox("追加できませんでした", "空欄があります")
        return
    }

    var doc = {
        name: name,
        num: num,
        memo: memo,
        place: sheet
    }
    datalistdb.insert(doc)

    messageDialogprint("追加しました", "")
    document.getElementById("newdata-add-name").value = ""
    document.getElementById("newdata-add-num").value = ""
    document.getElementById("newdata-add-memo").value = ""
    //テーブル更新
    reloadalldataTable()
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

//アイテム選択（テーブルクリック
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
    document.getElementById("data-option-sheetname").value = data.place
    lastselecteddata = data
}

plusBtn.addEventListener('click', (event) => {
    var numarea = document.getElementById("number-area").value
    document.getElementById("number-area").value = parseInt(numarea) + 1
    console.log("plus")
})
minusBtn.addEventListener('click', (event) => {
    var numarea = document.getElementById("number-area").value
    if (numarea == "0") {
        return
    }
    document.getElementById("number-area").value = parseInt(numarea) - 1
    console.log("minus")
})
//データ更新ボタン
updateBtn.addEventListener('click', (event) => {
    if (lastselecteddata == null) {
        return
    }
    var memoarea = document.getElementById("memo-area")
    var namearea = document.getElementById("name-post-area")
    var numarea = document.getElementById("number-area")
    var placearea = document.getElementById("data-option-sheetname")
    //名前、個数が空欄ならエラー
    if (namearea.value == "" || numarea.value == "") {
        dialog.showErrorBox("更新エラー", "名前もしくは個数が空欄です")
        return
    }
    datalistdb.update({ _id: lastselecteddata._id }, {
        $set: {
            name: namearea.value,
            num: numarea.value,
            memo: memoarea.value,
            place: placearea.value
        }
    }, { multi: false }, function (err, numReplaced) {
        //テーブル更新
        reloadalldataTable()
        messageDialogprint("更新しました", "正常に更新しました")

    })
})

chatreloadBtn.addEventListener('click', (event) => {
    loadchats()
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
            //データエリア初期化
            document.getElementById("memo-area").value = ""
            document.getElementById("name-post-area").value = ""
            document.getElementById("number-area").value = ""
            //削除完了通知
            messageDialogprint("削除しました", "正常に削除しました")

        })
    } else if (delok == 1) {
        messageDialogprint("キャンセルされました", "　")
    }
})

//チャット投稿ボタン
chatpostBtn.addEventListener('click', (event) => {
    var postname = document.getElementById("chat-post-name").value
    var posttext = document.getElementById("chat-post-text").value
    if (postname == "" || posttext == "") {
        dialog.showErrorBox("投稿エラー", "名前もしくは内容が空欄です")
        return
    }

    //DB保存＆チャット更新
    var doc = {
        name: postname,
        text: posttext,
        date: getnowDate()
    }
    chatDB.insert(doc)
    loadchats()
    //初期化
    document.getElementById("chat-post-name").value = ""
    document.getElementById("chat-post-text").value = ""
})

chatBtn.addEventListener('click', (event) => {
    var id = event.target.id
    chatDB.find({ _id: id }, function (err, docs) {
        var win = remote.getCurrentWindow();
        var options = {
            type: 'info',
            buttons: ['はい', 'いいえ'],
            title: '削除変更',
            message: '削除もしくは変更しますか？'
        };

        var changeable = dialog.showMessageBox(win, options)

        if (changeable == 0) {
            //削除＆変更ウィンドウ起動
            chatchangewindow(docs[0])

        }

    })
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

//現在時刻取得
function getnowDate() {
    var date = new Date()
    var year = ('000' + date.getFullYear()).slice(-4)
    var month = ('0' + date.getMonth()).slice(-2)
    var day = ('0' + date.getDay()).slice(-2)
    var hour = ('0' + date.getHours()).slice(-2)
    var minute = ('0' + date.getMinutes()).slice(-2)
    var second = ('0' + date.getSeconds()).slice(-2)
    return year + "/" + month + "/" + day + "_" + hour + ":" + minute + ":" + second
}

//optionリセット関数
function optionResetter(option) {
    if (option.hasChildNodes()) {
        while (option.childNodes.length > 0) {
            option.removeChild(option.firstChild)
        }
    }
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
        reloadDB()
    });
    win.show()
}


function delwindowload() {
    sheetnamedb.find({}).sort({ name: 1 }).exec(function (err, docs) {

        //データ追加セレクトボックス
        var dataoption = document.getElementsByName("delwin-list")
        for (n in docs) {
            //リスト(option)に代入
            var option_addt = document.createElement("option")
            option_addt.setAttribute("value", docs[n].name)
            option_addt.innerHTML = docs[n].name
            dataoption[0].appendChild(option_addt)
        }

    })
}

function delwingetdelete() {
    var sheetoption = document.getElementById("delwin-list")
    var sheet = sheetoption.value
    //削除確認のち削除
    var win = remote.getCurrentWindow();
    var options = {
        type: 'info',
        buttons: ['はい', 'いいえ'],
        title: '削除確認',
        message: 'シートのデータも同時に削除されますがよろしいですか？'
    };

    var delok = dialog.showMessageBox(win, options)
    if (delok == 0) {
        //削除
        sheetnamedb.remove({ name: sheet }, {}, function (err, numRemoved) {
            datalistdb.remove({ place: sheet }, {}, function (err, numRemoved) {
            })
            //optionリセット
            optionResetter(sheetoption)
            delwindowload()
            messageDialogprint("完了", "削除しました")
        })

    }
    else if (delok == 1) {
        dialog.showErrorBox("削除エラー", "キャンセルされました")
    }
}

//chat変更ウィンドウ
function chatchangewindow(chat) {
    var win = new BrowserWindow({ width: 300, height: 250 });
    win.loadURL(`file://` + __dirname + `/chatchange.html`);
    //win.loadFile('chatchange.html');
    win.on('closed', () => {
        win = null;
        //削除のち再読み込み更新
        loadchats()
    });
    win.show()
    win.setTitle(chat._id)
}

function chatwinload() {


    var win = remote.getCurrentWindow();
    var chatid = win.getTitle()

    chatDB.findOne({ _id: chatid }, function (err, docs) {
        document.getElementById("chatwin-name").innerHTML = docs.name
        document.getElementById("chatwin-day").innerHTML = docs.date
        document.getElementById("chatwin-text").value = docs.text
    })


}
//チャット更新ボタン
function chatwinupdate() {
    var updatetext = document.getElementById("chatwin-text").value
    var win = remote.getCurrentWindow();
    chatDB.update({ _id: win.getTitle() }, {
        $set: {
            text: updatetext
        }
    }, { multi: false }, function (err, numReplaced) {

        messageDialogprint("更新", "チャットを更新しました")
    })

}
//チャット削除ボタン
function chatwindelete() {
    var win = remote.getCurrentWindow();
    var options = {
        type: 'info',
        buttons: ['はい', 'いいえ'],
        title: '削除確認',
        message: 'チャットを本当に削除しますか？'
    };
    var delok = dialog.showMessageBox(win, options)
    if (delok == 0) {
        var chatid = win.getTitle()
        chatDB.remove({ _id: chatid }, {}, function (err, numRemoved) {
            messageDialogprint("完了", "削除しました")
            win.close()
        })
    }
}

//設定画面遷移
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
