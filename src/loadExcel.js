const { ipcRenderer, dialog } = require('electron').remote

const selectDirBtn = document.getElementById('select-directory')

selectDirBtn.addEventListener('click', (event) => {
    //ipcRenderer.send('open-file-dialog')
    dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
    }, (files) => {
        if (files) {
            console.log(files)
            //event.sender.send('selected-directory', files)
            selectedFile(files)

        }
    })
})

ipcRenderer.on('selected-directory', (event, path) => {
    document.getElementById('selected-file').innerHTML = `You selected: ${path}`
})

function selectedFile(path) {
    document.getElementById('selected-file').innerHTML = `You selected: ${path}`
}
