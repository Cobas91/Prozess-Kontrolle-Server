var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
  const check = require("../util/check")

  



router.post("/updateStatus", async (req, response) => {
    status.update(req.body.where.SN, "Versendet")
    response.send("Done")
});

module.exports = router;