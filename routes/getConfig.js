var express = require("express"), router = express.Router();
const config = require('../config.json')
router.get("/get", async (request, response) => {
  response.send(config)
})

module.exports = router;
