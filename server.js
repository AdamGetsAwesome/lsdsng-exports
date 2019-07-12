const express = require('express');
const app = express();
const formidable = require('formidable');

const fs = require('fs');
const lsdsng = require('./lsdsng');
let port = process.env.PORT;
if (!port) {
  port = 8080;
}
app.use(express.static('public'));
app.get('/', function (req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/', function (req, res) {
  let d;
  let output;
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    output = fields.output;
  });
  form.on('fileBegin', function (name, file){
  });

  form.on('file', function (name, file) {
    fs.readFile(file.path, function(err, data) {
      try {
        d = lsdsng.unpack(data);
      }
      catch (err) {
        res.send(err);
        return;
      }
      if (output == 'html') {
        d = lsdsng.makeHTML(d);
        res.send(d);
      }
      else if (output == 'midi') {
        d = lsdsng.makeMIDI(d);          
        res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-disposition': 'attachment;filename=tracks.mid',
        'Content-Length': d.length
        });
        res.end(new Buffer(d, 'binary'));
      }
      else {
        res.send(d); 
      }
    });
  });
});


const listener = app.listen(port, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});