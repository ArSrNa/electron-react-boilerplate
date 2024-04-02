/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { resolveHtmlPath } from './util';
import os from 'os';
import express from 'express';
import expressWs from 'express-ws';
import { spawn } from 'child_process';
import fs from 'fs';
let ews = expressWs(express());
let eapp = ews.app;
import md5 from 'md5';
import multer from 'multer';
import bodyparser from 'body-parser';
eapp.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

eapp.use(bodyparser.json({ limit: '5000mb' }));

let RESOURCES_PATH: string;

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('env', () => {
  mainWindow.webContents.send('env', app.isPackaged);
});

ipcMain.handle('setBlenderPath', async (evt, msg) => {
  try {
    let result = await dialog.showOpenDialog(mainWindow, {
      title: '选择 blender.exe',
      filters: [{ name: '可执行文件', extensions: ['exe'] }],
      properties: ['openFile'],
    });
    const filePaths = result.filePaths;
    if (!result.canceled && result.filePaths.length > 0) {
      return filePaths[0].replaceAll('\\', '/');
    }
  } catch (err) {
    console.log('选择blender路径Err', err);
  }
});

ipcMain.on('getBlenderVer', (e, m) => {
  var blender = spawn(m.path, ['-b', '-v'], {});

  blender.stdout.on('data', (m) => {
    mainWindow.webContents.send('getBlenderVer', m.toString('utf8'));
  });
});

ipcMain.handle('setOutPath', async (evt, msg) => {
  try {
    let result = await dialog.showOpenDialog({
      title: '请选择文件夹', // 窗口标题
      properties: ['openDirectory'], // 限制只能选择文件夹
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const filepath = result.filePaths[0].replaceAll('\\', '/');
      return filepath;
    }
  } catch (err) {
    console.error('设置输出路径Err', err);
  }
});

ipcMain.on('saveFile', (e, m) => {
  const { base64String, filePath, fileName } = m;
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  fs.writeFile(`${filePath}\\${fileName}`, buffer, (err) => {
    if (err) {
      console.error('保存文件时发生错误:', err);
      mainWindow.webContents.send('saveFile', { success: false, data: err });
      return;
    }
    mainWindow.webContents.send('saveFile', {
      success: true,
      data: `${filePath}/${fileName}`,
    });
    console.log('文件保存成功:', `${filePath}/${fileName}`);
  });
});

ipcMain.on('getIP', (e, m) => {
  mainWindow.webContents.send('getIP', os.networkInterfaces());
});

var config, server;
ipcMain.on('startServer', (e, m) => {
  config = m;
  if (!(server == null)) {
    server.close(() => {
      console.log('Server is closed');
      mainWindow.webContents.send('startServer', { success: false });
    });
    return;
  }
  onServerInit();
  server = eapp.listen(m.port, () => {
    mainWindow.webContents.send('startServer', { success: true });
  });
});

function onServerInit() {}

eapp.post('/upload', (req, res) => {
  const storage = multer.diskStorage({
    destination: config.outPath,
    filename(ctx, file, cb) {
      cb(null, `temp.blend`);
    },
  });
  const upload = multer({ storage }).single('file');
  upload(req, res, function (err) {
    if (err) {
      // 处理上传错误
      console.error(err);
      res.status(500).send('文件上传失败');
      return;
    }

    const { password } = req.body;

    if (password !== md5(config.password)) {
      res.status(401).send('服务端验证失败！');
      return;
    }

    mainWindow.webContents.send('blenderOut', '工程文件下载中');
    console.log(req.file);
    mainWindow.webContents.send('blenderOut', '工程文件下载完成');
    res.status(200).send('文件上传完成');
  });
});

eapp.ws('/ArBlender', function (ws, req) {
  const { password, command } = req.query;
  if (password !== md5(config.password)) {
    ws.send(JSON.stringify({ auth: 'false' }));
    ws.close(); // 密码不匹配，关闭连接
    return;
  }

  mainWindow.webContents.send('client', req.connection.remoteAddress);
  ipcMain.on('closeWSC', () => {
    ws.close();
  });
  ws.on('message', function (data) {
    var msg = JSON.parse(data.toString('utf8'));
    const { command } = msg;
    console.log(msg);
    if (command) {
      console.log(command);
      render(ws, msg);
    }
  });

  ws.on('close', function (e) {
    console.log('断开连接', e);
    mainWindow.webContents.send('client', null);
  });
});

function render(ws, msg) {
  const { format, startFrame, endFrame, fileName } = msg;
  console.log('开始渲染');
  var arblender = spawn(config.blenderPath, [
    '-b',
    `${config.outPath}\\temp.blend`,
    '-o',
    `${config.outPath}\\output\\${fileName}.${format}`,
    '-F',
    format,
    '-s',
    startFrame,
    '-e',
    endFrame,
    '-a',
  ]);

  arblender.stderr.on('data', function (data) {
    var log = {
      success: true,
      type: 'error',
      log: data.toString('utf8'),
    };
    ws.send(JSON.stringify(log));
    console.log(log);
    mainWindow.webContents.send('blenderErr', data.toString('utf8'));
  });

  arblender.stdout.on('data', function (data) {
    var log = {
      success: true,
      type: 'log',
      log: data.toString('utf8'),
    };
    ws.send(JSON.stringify(log));
    console.log(log);
    mainWindow.webContents.send('blenderOut', data.toString('utf8'));
  });

  arblender.on('exit', function (code, signal) {
    var log = JSON.stringify({
      success: true,
      exit: true,
      type: 'exit',
      log: code,
      signal: signal,
    });
    ws.send(log);
  });
}
