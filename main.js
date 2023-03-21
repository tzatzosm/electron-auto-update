const path = require('path')
const os = require('os');
const { app, autoUpdater, dialog, BrowserWindow } = require('electron')
const log = require('electron-log');
const server = 'https://hazel-ten-rosy.vercel.app'

const platform = os.platform() + '_' + os.arch();
console.log(`Version is: ${app.getVersion()}`)
console.log(`Platform is: ${platform}`)

const url = `${server}/update/${platform}/${app.getVersion()}`
console.log(`Update url: ${url}`)
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    window.loadFile('index.html')
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
    autoUpdater.setFeedURL({ url })
    autoUpdater.checkForUpdates()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

autoUpdater.on('checking-for-update', () => {
    console.log("checking-for-update")
})

autoUpdater.on('update-available', () => {
    console.log("update-available")
})

autoUpdater.on('update-not-available', () => {
    console.log("update-not-available")
})

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    console.log("AutoUpdated update downloaded")

    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail:
            'A new version has been downloaded. Restart the application to apply the updates.',
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
})

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application')
    console.error(message)
})

app.whenReady().then(() => {
    createWindow()
})