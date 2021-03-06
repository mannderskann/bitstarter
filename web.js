var express = require('express');
var rest = require('restler');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var content = fs.readFileSync('./index.html', 'utf8');
  response.send(content);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
