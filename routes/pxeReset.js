var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
  
  router.post("/pxeReset", async ({body},response) => {
    const data = body.data
    console.log("Getting Request on db/pxeReset", body)
    status.update(data.SN, "Zurücksetzen")
    const result = await db.insert("pxereset", [data]).catch(function (err) {
      return err
    });
    response.send({
      result
    });
  });

  module.exports = router;
