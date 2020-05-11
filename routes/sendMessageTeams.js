var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
var request = require("request");
const config = require("../config.json");
const teams = require("../util/teams");
router.post("/teams", async (req, res) => {
  //Versand Ready Nachricht
  if (req.body.type === "versandReady") {
    res.send(await teams.versandReady(req.body.data, req.body.channel));
  }
});

module.exports = router;
