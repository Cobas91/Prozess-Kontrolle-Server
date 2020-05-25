var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.get("/all/strasen", async (req, response) => {
  result = await db.select("betankungsstrasen");
  response.send(result);
});

module.exports = router;
