const {app, BrowserWindow, ipcMain, globalShortcut} = require("electron");
const fs = require("fs");

//let win = new BrowserWindow({width: 800, height: 600});

function createWindow() {

    win = new BrowserWindow({width: 1680, height: 720})
    //win.loadFile("form3.html");
    win.loadFile("app.html");
    win.webContents.openDevTools();

  win.on('closed', () => {
    win = null
  });

}

app.on('ready', ()=> {
  createWindow();

//  globalShortcut.register('`', ()=>{
//    win.webContents.openDevTools();
//  });
});

ipcMain.on('classroom', (event, arg) => {
    console.log(arg) // prints "ping"
    //event.sender.send('asynchronous-reply', 'pong')
    fs.writeFileSync("data/rooms.json", arg);
  });

ipcMain.on('loadData', (event, arg) => {
    var data = new Object();
    data.rooms = JSON.parse(fs.readFileSync("data/rooms.json"));
    data.subject = JSON.parse(fs.readFileSync("data/subject.json"));
    data.teacher = JSON.parse(fs.readFileSync("data/teacher.json"));
    data.classes = JSON.parse(fs.readFileSync("data/classes.json"));
    event.returnValue = data;
});

ipcMain.on('initApp', (event, arg) => {
  var data = new Object();
  data = JSON.parse(fs.readFileSync("data2/data.json"));
  event.returnValue = data;
});

ipcMain.on('save', (event, arg) => {
  console.log(arg) // prints "ping"
  //event.sender.send('asynchronous-reply', 'pong')
  fs.writeFileSync("data2/data.json", JSON.stringify(arg));
});


ipcMain.on('subjectLoaded', (event, arg) => {
    var data = fs.readFileSync("data/subject.json");
    event.returnValue = JSON.parse(data);
});