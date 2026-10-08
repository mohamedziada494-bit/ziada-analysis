const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// استقبال أمر تنزيل وتثبيت البرنامج من واجهة المستخدم
ipcMain.on('download-installer', async (event) => {
  try {
    // البحث عن الملف في المجلدات المتاحة
    const possiblePaths = [
      path.join(__dirname, 'downloads', 'ZiadaAnalysis-Setup.exe'),
      path.join(__dirname, 'dist', 'Ziada Analysis Setup 1.0.0.exe'),
      path.join(__dirname, 'dist', 'ZiadaAnalysis-win32-x64', 'ZiadaAnalysis.exe')
    ];

    let sourcePath = possiblePaths.find(p => fs.existsSync(p));

    if (!sourcePath) {
      dialog.showErrorBox('خطأ في الملف', 'تعذر العثور على ملف البرنامج الأصلي في مجلد dist أو downloads.');
      return;
    }

    // تحديد مسار مجلد التحميلات الخاص بجهاز المستخدم (Downloads)
    const userDownloadsDir = app.getPath('downloads');
    const destinationPath = path.join(userDownloadsDir, 'ZiadaAnalysis-Setup.exe');

    // نسخ الملف فوراً لمجلد التحميلات الخاص بجهاز المستخدم
    fs.copyFileSync(sourcePath, destinationPath);

    // إشعار المستخدم بنجاح التنزيل وعرض الملف
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'تم التنزيل بنجاح',
      message: 'تم تنزيل البرنامج بنجاح على اللابتوب!',
      detail: `تم حفظ الملف داخل مجلد التحميلات (Downloads):\n${destinationPath}`,
      buttons: ['حسناً']
    });

  } catch (error) {
    dialog.showErrorBox('فشل التنزيل', 'حدث خطأ أثناء نسخ الملف: ' + error.message);
  }
});