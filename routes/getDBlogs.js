var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector")
router.get("/logs", async (request, response) => {
  const result = await db.select("db_logs", {})
  response.send(result)
});

module.exports = router;
