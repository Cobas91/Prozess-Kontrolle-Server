var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.post("/login", async (req, response) => {
  result = await db.select("mitarbeiter", { Anmeldename: req.body.name });
  if (result.length <= 0) {
    response.send({ login: false });
  } else {
    response.send({
      login: true,
      Berechtigung: result[0].Berechtigung,
      User: `${result[0].Vorname}, ${result[0].Nachname}`,
    });
  }
});

module.exports = router;
