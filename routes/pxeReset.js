var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
  
  router.post("/pxeReset", async ({body},response) => {
    const data = body.data
    console.log("Getting Request on db/pxeReset", body)
    await status.update(data.SN, "Zurücksetzen")
    response.send({
      result
    });
    error = false;
  });

  module.exports = router;
