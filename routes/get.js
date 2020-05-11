var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.post("/get", async (request, response) => {
  // const data = request.body.data
  const table = request.body.table;
  const where = request.body.where;
  const result = await db.select(table, where);
  response.send(result);
});

module.exports = router;
