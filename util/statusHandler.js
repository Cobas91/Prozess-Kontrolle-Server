const db = require("../util/dbConnector")
module.exports = {
    update: async function(sn, status) {
      await db.insert("status", {SN: sn, Status: status});
    }
  };