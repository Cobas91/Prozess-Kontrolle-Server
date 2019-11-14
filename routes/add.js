var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
  var error = false;
  
  router.post("/add", async ({body},response) => {
    const table = body.table
    const data = body.data
    console.log("Getting Request on db/add", body)
    const result = await db.insert(table, [data]).catch(function (err) {
      error = true;
      return err
    });
    if(error == false){
      await status.update(data.SN, data.Status)
      if(body.Bemerkung != ""){
        await db.insert("comments_systeme", [{system_ID: result.insertId, comment: body.Bemerkung}])
      }
    }
    response.send({
      result
    });
    error = false;
  });

  module.exports = router;
