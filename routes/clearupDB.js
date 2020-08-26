var express = require("express"),
  router = express.Router();
const db = require("../util/dbConnector");
const xlsx = require("node-xlsx");

router.get("/clearup", async (request, response) => {
  var erg = await clearDB();

  response.send({ status: erg });
});

async function clearDB() {
  const workSheetsFromFile = xlsx.parse("D:/Projekte/TestData/ClearUpDB.xlsx");
  const Data = Object.assign({}, workSheetsFromFile[0].data);
  var body = Data;
  //   Artikelnummer = body[0][0];
  //   Modell = body[1][0];
  //   Lager_KHK = body[2][0];
  //   SN = body[3][0]
  for (var entry in body) {
    var set = {
      Artikelnummer: body[entry][0],
      Modell: body[entry][1],
      Lager_KHK: body[entry][2],
    };
    var where = {
      SN: body[entry][3],
    };
    const result = await db.update("systeme", set, where);
    console.log(result);
  }

  return true;
}

module.exports = router;
