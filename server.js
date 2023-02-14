const express = require("express");
let multer = require('multer');
let fs = require('fs');
let path = require('path');

const app = express();
const artTemplate = require("art-template");

app.engine('html', artTemplate);
artTemplate.defaults.cache = true;
artTemplate.defaults.minimize = true;
artTemplate.defaults.htmlMinifierOptions = {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  // 运行时自动合并：rules.map(rule => rule.test)
  ignoreCustomFragments: [],
  includeAutoGeneratedTags: false // cnm
}
const { readDefaultFile } = require("./utils");
/**
 * 编译页面内容
 * @param {*} page 页面模版
 * @param {*} data 页面数据
 * @returns
 */
function renderPageContent(page, data) {
  return artTemplate.render(readDefaultFile(`./public/template/${page}`), data);
}
app.use("/assets", express.static("public/assets"));

const { createHash } = require('crypto');
/**
 * @param {string} algorithm
 * @param {any} content
 *  @return {string}
 */
const encrypt = (algorithm, content) => {
  return createHash(algorithm).update(content).digest('hex');
}
/**
 * @param {any} content
 *  @return {string}
 */
const md5 = (content) => encrypt('md5', content)

// 工具-上传视频
app.get("/uploadVideo", function (req, res) {
  res.end(renderPageContent('upload_video.html'));
})
let upload = multer({
  storage: multer.diskStorage({
    //设置文件存储位置
    destination: function(req, file, cb) {
      let date = new Date();
      let year = date.getFullYear();
      let month = (date.getMonth() + 1).toString().padStart(2, '0');
      let day = date.getDate();
      let dir = "./uploads/" + year + month + day;

      //判断目录是否存在，没有则创建
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
          recursive: true
        });
      }

      //dir就是上传文件存放的目录
      cb(null, dir);
    },
    //设置文件名称
    filename: function(req, file, cb) {
      const extname = path.extname(file.originalname);
      const name = file.originalname.split('.')[0]
      let fileName = name + '-' + Date.now() + extname;
      //fileName就是上传文件的文件名
      cb(null, fileName);
    }
  })
});
// api 上传视频
app.post('/upload', upload.single('file'),(req, res) => {
  return res.json({
    code: 0,
    data: {
      ...req.file
    },
    message: '上传成功'
  })
})


module.exports = app;