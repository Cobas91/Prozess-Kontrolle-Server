var express = require("express"),
  router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.json());

// router.options('/*', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin');
// });


router.use("/", require("./home.js"));
router.use("/db", require("./add.js"));
router.use("/db", require("./get.js"));
router.use("/db", require("./update.js"));
router.use("/db", require("./getAll.js"));
router.use("/db", require("./addExcel.js"))
router.use("/db", require("./addLog.js"))
module.exports = router;
