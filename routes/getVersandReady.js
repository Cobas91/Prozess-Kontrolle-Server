var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
router.get("/get/versand", async (request, response) => {
  const result = await db.select("systeme", { Status: "Versand Ready" });
  response.send(result);
});

module.exports = router;
