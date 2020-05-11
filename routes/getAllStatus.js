var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.get("/all/status", async (req, response) => {
  result = await db.select("status_names");
  response.send(result);
});

module.exports = router;
