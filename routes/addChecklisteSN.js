var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")

  router.post("/add/checklisteSN", async ({body},response) => {
    console.log("Getting Request for Adding Checkliste", body)
    const result = await db.insert("checklisten", [body]).catch(function (err) {
      return err
    });
    response.send({
      result
    });
  });

  module.exports = router;
