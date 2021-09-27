const fs = require('fs');
const path = require('path');
const fileTypes = ['.gltf'];

// 输入目录
const inputFolder = './sourse/';
// 输出目录
const outFolder = './output/';

// 修改内容
const changeDist = {
  "1号楼": "build1",
  "2号楼": "build2",
  "3号楼": "build3",
  "5号楼": "build5",
  "6号楼": "build6",
  "7号楼": "build7",
  "8号楼": "build8",
  "9号楼": "build9",
  "10号楼": "build10",
  "11号楼": "build11",
  "12号楼": "build12",
  "15号楼": "build15",
  "16号楼": "build16",
  "17号楼": "build17",
  "18号楼": "build18",
  "19号楼": "build19",
  "20号楼": "build20",
  "21号楼": "build21",
  "郎果餐厅": "build11p",
};

function changeGltf(fileName) {
  const filePath = path.join(inputFolder, fileName);
  const nameArr = fileName.split('.')[0].split('-');
  const name = nameArr[0];
  const name1 = nameArr[1];
  const changeName = changeDist[name] + '-' + name1;
  const outFilePath = path.join(outFolder, changeName + '.gltf');

  let byte = fs.readFileSync(filePath).toString();
  const json = JSON.parse(byte);
  json.nodes[0].name = changeName;
  let content = JSON.stringify(json);
  fs.writeFileSync(outFilePath, content);
};

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
        changeGltf(fileName)
      }
    } else if (stats.isDirectory()) {
      convert(filePath)
    }
  })
}

convert(inputFolder);
