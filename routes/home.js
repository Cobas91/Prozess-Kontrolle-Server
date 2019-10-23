var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector")



router.get("/", async (request,response) => {
  console.log("Getting Request on Home")
  response.send("DG-SCCM-Tool");
});
module.exports = router;
