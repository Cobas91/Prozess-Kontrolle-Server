var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")

  router.post("/add/checklisteSN", async ({body},response) => {
    body.timestamp = Date.now()
    console.log("Getting Request for Adding Checkliste", body)
    const result = await db.insert("checklisten", [body]).catch(function (err) {
      return err
    });
    if(result.statusCode === 400){
      await db.update("checklisten", body).catch(function (err) {
        console.log(err)
      });
    }
    response.send({
      result
    });
  });

  module.exports = router;
