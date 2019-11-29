var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
  
  router.post("/add/checklisteSN", async ({body},response) => {
    console.log(body)
    console.log("Getting Request on db/add/ChecklisteSN", body)
    const result = "Erfolg"
    response.send({
      result
    });
    error = false;
  });

  module.exports = router;
