const { ipcRenderer, dialog } = require('electron').remote

const selectDirBtn = document.getElementById('select-directory')
const selectSheetBtn = document.getElementById('sheet-name')
const updateDataBtn = document.getElementById('update_data')

const xlsx = require("xlsx")
let workfile
let sheet_json

const Database = require("nedb")

selectDirBtn.addEventListener('click', (event) => {
    //ipcRenderer.send('open-file-dialog')
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'XLSX file', extensions: ['xlsx'] }
        ]
    }, (files) => {
        if (files) {
            //Excelファイルのパスを取得
            selectedFile(files)
            var f = files[0]
            workfile = xlsx.readFile(f)
            sheetNamePost(workfile.SheetNames)
        }
    })

})

selectSheetBtn.addEventListener('click', (event) => {
    /*
    let sheet_1 = workfile.Sheets[workfile.SheetNames[0]]
    let click_sheet = workfile.Sheets[event.target.id]
    var A = sheet_1['A1']
    //sheetDataPost(click_sheet)
    var findcell = click_sheet.findAll(A, {
        completeMatch: true,
        matchCase: false
    })
    */
})

updateDataBtn.addEventListener('click', (event) => {
    var memoarea = document.getElementById("memo-area")
})


function selectedFile(path) {
    //document.getElementById('selected-file').innerHTML = `You selected: ${path}`
}

function sheetNamePost(nameList) {

    var sheetnamedb = new Database({
        filename: 'src/db/sheetnamelist.db',
        autoload: true
    })
    sheetnamedb.loadDatabase()
    //シート名を送信
    //var sheetnames = ''
    for (n in nameList) {
        //シート名のボタン作成
        //sheetnames += "<br><button class=sheet-name-button id=" + nameList[n] + " >" + nameList[n] + "</button>"

        //シート名をDBに代入
        var doc = {
            name: nameList[n]
        }
        sheetnamedb.insert(doc)
        sheetDataPost(nameList[n])
    }
    //document.getElementById('sheet-name').innerHTML = sheetnames
}

function sheetDataPost(select_sheetname) {
    var sheetnamech = workfile.Sheets[select_sheetname]
    //sheetNameから取得
    sheet_json = xlsx.utils.sheet_to_json(sheetnamech)
    /*
    //リスト初期化
    var span_reset = document.getElementById("sheet-data-list")
    while (span_reset.childNodes.length > 0) {
        span_reset.removeChild(span_reset.firstChild)
    }

    //リスト(option)に代入
    var span = document.getElementsByName("sheet-data-list")
    for (let data of sheet_json) {
        var option_add = document.createElement("option")
        option_add.setAttribute("value", 1)
        option_add.innerHTML = `${data['名前']}::${data['個数']}::${data['メモ']}`
        span[0].appendChild(option_add)
    }
    */
    //table初期化
    var data_table = document.getElementById("sheet-data-list-table")
    //while (data_table.rows.length > 1) data_table.deleteRow(-1);

    var datalistdb = new Database({
        filename: 'src/db/datalist.db',
        autoload: true
    })
    datalistdb.loadDatabase()

    //tableに代入
    for (let data of sheet_json) {
        /*
        var row = data_table.insertRow(-1)
        row.onclick = function () {
            table_click(this, data)
        }
        var cel1 = row.insertCell(-1)
        var cel2 = row.insertCell(-1)
        cel1.innerHTML = ` ${data['名前']}`
        cel2.innerHTML = ` ${data['個数']}`
        */

        //DBに代入
        var doc = {
            name: `${data['名前']}`,
            num: ` ${data['個数']}`,
            memo: ` ${data['メモ']}`,
            place: select_sheetname
        }
        datalistdb.insert(doc)
    }
}

//tableがクリックされたとき
function table_click(row, data) {
    row.style.backgroundColor = 'red'
    //console.log(`${data['名前']}::${data['個数']}::${data['メモ']}`)
    document.getElementById("name-post-area").value = `${data['名前']}`
    var memoarea = document.getElementById("memo-area")
    memoarea.value = `${data['メモ']}`
    var numarea = document.getElementById("number-area")
    numarea.value = `${data['個数']}`
}



