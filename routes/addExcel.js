var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector")
  const logFile = require("../util/logs.js")

  router.post("/add/excel", async ({body},response) => {
    console.log("Getting Request on db/add")
    var erg = []
    var counter = 0;
    console.log("Begin Loop over all incomming Data "+new Date().toLocaleString())
    for(var index in body){
        var system= {
            SN: body[index].Seriennummer,
            LSNummer: "Unbekannt",
            Status: "Neu Angelegt",
            Modell: body[index].Matchcode,
            Hersteller: "Unbekannt",
            Kunde: "Unbekannt",
            Betankungs_ID: 0,
            Versand_ID: "NULL",
            Lager_KHK: body[index].Lagerplatz,
            Job_ID: 0
          }
          const result = await db.insert("systeme", [system]).catch(function (err) {    
            return err
          });
          erg[counter] = result
          logFile.add(result)
          counter++
    }
    console.log("Stopped looping.... "+new Date().toLocaleString())
    response.send({
        erg
      });

  });

  module.exports = router;