var express = require("express"),
  router = express.Router();
const config = require("../config.json");
const khk_import = require("../util/khkDailyImport");

router.get("/lager", async (req, response) => {
  await khk_import.khkimportLager(
    `${config.Lagerbestand_Import.pfad}${config.Lagerbestand_Import.file}`
  );
  await khk_import.khkImportLieferscheine(
    `${config.Lieferschein_Import.pfad}${config.Lieferschein_Import.file}`
  );
  response.send(true);
});

module.exports = router;
