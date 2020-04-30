var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const status = require("../util/statusHandler")
  const log = require("../util/logs.js")

  

router.post("/massStatus", async ({body},response) => {
    const statusToSet = body.status
    const systeme = body.systeme

    var notFound = []
    var found = []
    var message = "success"
    if(statusToSet === ""){
        message = "Kein Status ausgewählt!"
    }else{
        for (var property in systeme) {
            if (systeme.hasOwnProperty(property)) {
                var systemToInsert = systeme[property]
                exist = await db.select("systeme", {SN: systemToInsert});
                if(exist.length > 0){
                    status.update(systemToInsert, statusToSet)
                    found.push(systemToInsert)
                }else{
                    notFound.push(systemToInsert)
                } 
            }
        }
    }
    response.send({
        success: found,
        error: notFound,
        message: message
    });
});
module.exports = router;