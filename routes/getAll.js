var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector")
router.get("/all", async (req, response) => {
  console.log(`Get Request on db/all ${Date.now()}`)
  result = await db.select("systeme");
  response.send(
    result
  )
});

module.exports = router;
