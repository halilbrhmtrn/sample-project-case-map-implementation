const express = require('express');
const path = require('path');
const app = express();
const multer = require('multer')
const cors = require('cors');
const excelToJson = require('convert-excel-to-json');

app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

app.get('/',  (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file')

const readFile = (buffer) => {
    const jsonResult = excelToJson({
        source: buffer
    });
    return jsonResult;
  }

app.post('/processFile', upload, (req,res) => {
    res.json(readFile(req.file.buffer));
 });



app.listen(process.env.PORT || 8080);