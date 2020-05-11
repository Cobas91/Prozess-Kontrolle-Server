var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.get("/get/checkliste", async (req, response) => {
  const where = req.body.where;
  console.log(`Get Request on db/checkliste ${Date.now()}`);
  result = await db.select("checklisten_attribute", {});
  response.send(result);
});

module.exports = router;
