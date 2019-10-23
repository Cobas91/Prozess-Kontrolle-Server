var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
router.post("/update", async ({body}, response) => {
  console.log("Got  Request on db/update");
  const table = body.table
  const where = body.where
  const set = body.set
  const result = await db.update(table, set, where)
  await status.update(where.SN, set.Status)
  response.send({
    result
  })
});

module.exports = router;