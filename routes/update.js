var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
const status = require("../util/statusHandler");
const check = require("../util/check");

router.post("/update", async ({ body }, response) => {
  const table = body.table;
  const where = body.where;
  const set = body.set;
  var systemToInsert = await db.select("systeme", { SN: set.SN });

  //Wenn der Datensatz dem Datensatz aus DB entspricht, nichts unternehmen.
  if (check.isEquivalent(systemToInsert[0], set)) {
    response.send({
      status: "Nothing Changed",
    });
  } else {
    //Wenn Bemerkung leer oder Null durch Letzte Bemerkung aus DB ersetzen
    if (set.Bemerkung === "" || set.Bemerkung === null) {
      set.Bemerkung = systemToInsert[0].Bemerkung;
    }
    const result = await db.update(table, set, where);
    //Prüfen ob die Bemerkung sich geändert hat
    if (systemToInsert[0].Bemerkung != set.Bemerkung) {
      db.insert("comments_systeme", {
        system_ID: set.ID,
        comment: set.Bemerkung,
      });
    }
    if (systemToInsert[0].Status != set.Status) {
      status.update(set.SN, set.Status);
    }
    response.send({
      result,
    });
  }
});

module.exports = router;
