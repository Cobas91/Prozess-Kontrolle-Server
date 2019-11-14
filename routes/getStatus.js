var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector")
router.post("/get/status", async (req, response) => {
    console.log(req.body)
    const where = req.body.where
    console.log(`Get Request on db/get/status ${Date.now()}`)
    result = await db.select("comments_systeme", where);
    response.send(
        result
    )
});

module.exports = router;
