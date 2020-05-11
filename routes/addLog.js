var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");

router.post("/add/log", async ({ body }, response) => {
  const data = body.data;
  const result = await db.insert("db_logs", [data]).catch(function (err) {
    error = true;
    return err;
  });
  if (error == false) {
  }
  response.send({
    result,
  });
  error = false;
});

module.exports = router;
