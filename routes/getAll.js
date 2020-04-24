var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector")
router.get("/all", async (req, response) => {
  result = await db.select("systeme");
  response.send(
    result
  )
});

module.exports = router;
