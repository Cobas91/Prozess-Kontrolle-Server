var express = require("express"),
  router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.json());

router.use("/db", require("./add.js"));
router.use("/db", require("./get.js"));
router.use("/db", require("./update.js"));
router.use("/db", require("./getAll.js"));
router.use("/db", require("./addExcel.js"));
router.use("/db", require("./addLog.js"));
router.use("/db", require("./getAllStatus.js"));
router.use("/db", require("./getStatus.js"));
router.use("/db", require("./getCheckliste.js"));
router.use("/db", require("./addChecklisteSN.js"));
router.use("/db", require("./getAllChecklisten.js"));
router.use("/import", require("./importKHKData.js"));
router.use("/db", require("./updateStatus.js"));
router.use("/db", require("./massStatus.js"));
router.use("/cfg", require("./getConfig.js"));
router.use("/cfg", require("./setConfig.js"));
router.use("/db", require("./getDBlogs.js"));
router.use("/db", require("./sendMessageTeams.js"));
router.use("/db", require("./getVersandReady.js"));
router.use("/db", require("./login.js"));
router.use("/db", require("./getAllStraßen.js"));
router.use("/db", require("./getHierarchie.js"));
router.use("/db", require("./clearupDB.js"));
module.exports = router;
