const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const fileTypes = ['.sql'];

// 输入目录
const inputFolder = './sourse/';
// 输出目录
const outFolder = './output/';

function toUtf8(fileName) {
  const filePath = path.join(inputFolder, fileName);
  const outFilePath = path.join(outFolder, fileName);
  let byte = fs.readFileSync(filePath);
  if (Buffer.isEncoding('utf-8')) {
    // 已经是utf8
    console.log('object fileName 已经是utf-8，只是拷贝', fileName);
    fs.writeFileSync(outFilePath, byte);
    return;
  }
  byte = iconv.decode(byte, 'gbk');
  const content = byte.toString('utf8');

  fs.writeFileSync(outFilePath, content);
}

function convert(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log('object folderPath', folderPath);
    return false;
  }
  const files = fs.readdirSync(folderPath);
  files.forEach((fileName, index) => {
    const filePath = path.join(folderPath, fileName);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      if (fileTypes.indexOf(ext) > -1) {
        toUtf8(fileName)
      }
    } else if (stats.isDirectory()) {
      convert(filePath)
    }
  })
}

convert(inputFolder);
