import { app, BrowserWindow, Menu, Tray } from 'electron'

app.setName('百度网盘')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path')
		.join(__dirname, '/static')
		.replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWindow() {
	/**
	 * Initial window options
	 */
	mainWindow = new BrowserWindow({
		height: 800,
		width: 1000,
		// minWidth: 1000,
		// minHeight: 660,
		frame: false,
		title: '百度网盘',
		useContentSize: true,
		icon: 'static/images/logo.ico',
		webPreferences: { webSecurity: false }
	})

	// mainWindow.loadURL('https://pan.baidu.com/')
	mainWindow.loadURL(winURL)

	mainWindow.on('closed', () => {
		mainWindow = null
	})

	Menu.setApplicationMenu(null)

	app.tray = new Tray('static/images/logo.ico')
	app.tray.setToolTip('百度网盘')
	app.tray.on('click', () => mainWindow.show())
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})
