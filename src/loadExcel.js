const { ipcRenderer, dialog } = require('electron').remote

const selectDirBtn = document.getElementById('select-directory')
const xlsx = require("xlsx")

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
            let workfile = xlsx.readFile(f)
            sheetNamePost(workfile.SheetNames)
            sheetDataPost(workfile.SheetNames)

        }
    })
})


function selectedFile(path) {
    document.getElementById('selected-file').innerHTML = `You selected: ${path}`
}

function sheetNamePost(nameList) {

    //シート名を送信
    var sheetnames = ''
    for (n in nameList) {
        //sheetnames += "<li>" + nameList[n] + "</li>"
        sheetnames += "<br><button class=sheet-name-button>" + nameList[n] + "</button>"
    }
    document.getElementById('sheet-name').innerHTML = sheetnames
}

function sheetDataPost(dataList) {
    //リスト(option)に代入
    var span = document.getElementsByName("sheet-data-list")
    for (n in dataList) {
        var option_add = document.createElement("option")
        option_add.setAttribute("value", dataList[n])
        option_add.innerHTML = "<button>" + dataList[n] + "</button>"
        span[0].appendChild(option_add)

    }
}
