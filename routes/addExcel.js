var express = require("express"),
  router = express.Router();
  const db = require("../util/dbConnector.js")
  const logFile = require("../util/logs.js")
  const status = require("../util/statusHandler.js")

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
            Lager_KHK: body[index].Lagerplatz
          }
          const result = await db.insert("systeme", [system]).catch(function (err) {    
            return err
          });
          if(result.statusCode != 400){
            status.update(system.SN, system.Status)
          }
          erg[counter] = result
          logFile.add(`KHK import, Data already exist ${body[index].Seriennummer}`)
          counter++
    }
    console.log("Stopped looping.... "+new Date().toLocaleString())
    response.send({
        erg
      });

  });

  module.exports = router;