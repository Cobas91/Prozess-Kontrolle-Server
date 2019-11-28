
const express = require("express");
const app = express();
const port = 3003;
var path = require("path");
const bodyParser = require('body-parser')

global.appRoot = path.resolve(__dirname);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));



//Muss letzter Part sein
app.use("/api", require("./routes/index.js"));
app.listen(port, async function () {
  console.log(`Server listening on port ${port}`);
});





