var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector")
var time = require("../util/time")
router.get("/all/checklisten", async (req, response) => {
  result = await db.select("checklisten");
  result.forEach(element => {
      element.timestamp = time.convert(element.timestamp, "DD MM HH mm")
  });
  response.send(
    result
  )
});

module.exports = router;
