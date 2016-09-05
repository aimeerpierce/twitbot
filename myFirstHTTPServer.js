var http = require("http");
var PORT = process.env.PORT || 8888;

//create server object
var app = http.createServer(function(req,res){
  console.log("Received Request");
  res.end("Hello World");
});

//start server
console.log("Starting Server on Port "+PORT);
app.listen(PORT);