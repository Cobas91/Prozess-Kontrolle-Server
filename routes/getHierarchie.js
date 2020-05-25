var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.post("/hyrachie", async (request, response) => {
  const resultSysteme = await db.select("systeme", { SN: request.body.sn });
  const resultStatus = await db.select("status", { SN: request.body.sn });
  response.send(resultStatus);
});

module.exports = router;
