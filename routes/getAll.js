var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
var time = require("../util/time");
router.get("/all", async (req, response) => {
  result = await db.select("systeme");
  result.forEach((element) => {
    element.lastChange = time.convert(element.lastChange, "DD MM HH mm");
  });
  response.send(result);
});

module.exports = router;
