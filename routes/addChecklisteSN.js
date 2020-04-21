var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const log = require("../util/logs.js")

  router.post("/add/checklisteSN", async ({body},response) => {
    body.timestamp = Date.now()
    console.log("Getting Request for Adding Checkliste", body)
    const result = await db.insert("checklisten", [body]).catch(function (err) {
      return err
    });
    if(result.statusCode === 400){
      await db.update("checklisten", body, {Seriennummer: body.Seriennummer}).catch(function (err) {
        log.add(`Updated Checkliste for ${body.Seriennummer}`)
      });
    }else{
      log.add(`Added Checkliste for ${body.Seriennummer}`)
    }    
    response.send({
      result
    });
  });

  module.exports = router;
