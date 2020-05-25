var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
const status = require("../util/statusHandler");
const log = require("../util/logs.js");

router.post("/massStatus", async ({ body }, response) => {
  const statusToSet = body.status;
  const systeme = body.systeme;
  const bemerkung = body.bemerkung;
  const straße = body.Straße;
  const kunde = body.Kunde;
  var notFound = [];
  var found = [];
  var message = "success";
  for (var property in systeme) {
    if (systeme.hasOwnProperty(property)) {
      var systemToInsert = systeme[property];
      exist = await db.select("systeme", { SN: systemToInsert });
      if (exist.length > 0) {
        if (statusToSet != "") {
          status.update(systemToInsert, statusToSet);
        }
        if (bemerkung != "") {
          db.insert("comments_systeme", {
            system_ID: exist[0].ID,
            comment: bemerkung,
          });
        }
        db.update(
          "systeme",
          {
            Bemerkung: bemerkung,
            Straße: straße,
            Kunde: kunde ? kunde : exist[0].Kunde,
          },
          { SN: systemToInsert }
        );
        found.push(systemToInsert);
      } else {
        notFound.push(systemToInsert);
      }
    }
  }

  response.send({
    success: found,
    error: notFound,
    message: message,
  });
});
module.exports = router;
