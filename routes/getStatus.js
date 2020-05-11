var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.post("/get/comments", async (req, response) => {
  const where = req.body.where;
  result = await db.select("comments_systeme", where);
  response.send(result);
});

module.exports = router;
