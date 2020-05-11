var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
const status = require("../util/statusHandler");
const log = require("../util/logs.js");
var error = false;

router.post("/add", async ({ body }, response) => {
  const table = body.table;
  const data = body.data;
  const result = await db.insert(table, [data]).catch(function (err) {
    error = true;
    return err;
  });
  if (error == false) {
    log.add(`Update Asset for ${data.SN}`);
    await status.update(data.SN, data.Status);
    if (body.Bemerkung != "") {
      await db.insert("comments_systeme", [
        { system_ID: result.insertId, comment: body.Bemerkung },
      ]);
    }
  } else {
    log.add(`Add New Asset for ${data.SN}`);
  }
  response.send({
    result,
  });
  error = false;
});

module.exports = router;
