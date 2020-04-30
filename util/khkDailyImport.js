const cronJob = require('node-schedule');
const config = require('../config.json')
var fs = require('fs');
const log = require("./logs.js")
const xlsx = require('node-xlsx')
const db = require("../util/dbConnector")
const status = require("../util/statusHandler.js")
const csv = require('csv-parser');

const filepathLagerbestand = `${config.Lagerbestand_Import.pfad}${config.Lagerbestand_Import.file}`
const filepathLieferscheine = `${config.Lieferschein_Import.pfad}${config.Lieferschein_Import.file}`

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

//Automatischer Import von Daten -> 
cronJob.scheduleJob(`${config.Daily_Job_Uhrzeit.sekunde} ${config.Daily_Job_Uhrzeit.minute} ${config.Daily_Job_Uhrzeit.stunde} * * *`, async function(){
    console.log(`Aufgabe KHK Import um ${config.Daily_Job_Uhrzeit.stunde}:${config.Daily_Job_Uhrzeit.minute} Uhr gestartet.`)
    await khkimportLager(filepathLagerbestand);
    await khkImportLieferscheine(filepathLieferscheine)
});

async function dealExcelDataLager(pfad){
    const workSheetsFromFile = xlsx.parse(pfad);
    const Data = Object.assign({}, workSheetsFromFile[0].data)
    var body = Data
    console.log("Begin Loop over all incomming Lager Data "+new Date().toLocaleString())
    // 0 = Artikelnummer
    // 1 = Matchcode
    // 2 = Lager
    // 3 = Seriennummer
    for(var index in body){
      if(index > 0){
        var system= {
          SN: body[index][3],
          LSNummer: "Unbekannt",
          Status: "Neu Angelegt",
          Modell: body[index][1],
          Hersteller: "Unbekannt",
          Kunde: "Unbekannt",
          Lager_KHK: body[index][2]
        }
        const result = await db.insert("systeme", [system]).catch(function (err) {    
          return err
        });
        if(result.statusCode != 400){
          status.update(system.SN, system.Status)
          log.add(`Job: Daily KHK Lager Import ${system.SN} added`)
        }else{
          db.update("systeme", {
            Modell: body[index][1],
            Lager_KHK: body[index][2]
          }, {SN: system.SN})
          log.add(`Job: Daily KHK Lager Import ${body[index][3]} already exists, updated Asset with new Data`)
        }
      }
    }
    log.add(`Job: Daily KHK Lager Import ended......${new Date().toLocaleString()}`)
    console.log("Stop Loop over all incomming Lager Data "+new Date().toLocaleString())
    return true
}
async function dealExcelDataLieferscheine(pfad){
  console.log("Begin Loop over all incomming Lieferscheine Data "+new Date().toLocaleString())
  var header = [
    "Artikelnummer",
    "Seriennummer",
    "Belegdatum",
    "KundenID",
    "Kunde",
    "Jahr",
    "LSNummer",
    "Belegart",
    "Liefertermin"
  ]
  fs.createReadStream(pfad)
  .pipe(csv({ separator: ';' , headers: header}))
  .on('data',async (row) => {
    if(row.Belegart === "Lieferschein"){
      var toInsert = {
        SN: row.Seriennummer,
        Artikelnummer: row.Artikelnummer,
        LSNummer: `${row.Jahr}-${row.LSNummer}`,
        Kunde_KHK: row.Kunde,
        Bearbeiter: "Admin"
      }
        var systemToInsert = await db.select("systeme", {SN: row.Seriennummer});
        if(systemToInsert.length < 1){

          //WENN GERÄT NICHT GEFUNDEN WURDE NEU ANLEGEN???
          //ASSET MÜLL
          //Benötige in Lieferschein Export Modell Namen -> Artikelnummer zu Modellname

          // var newSystem = {
          //   SN: row.Seriennummer,
          //   LSNummer: `${row.Jahr}-${row.LSNummer}`,
          //   Status: "Neu Angelegt",
          //   Modell: "Unbekannt",
          //   Kunde_KHK: row.Kunde,
          //   Bearbeiter: "Admin",
          //   Artikelnummer: row.Artikelnummer,
          // }
          // var newResult = await db.insert("systeme", [newSystem]).catch(function (err) {
          //   log.add(`Job: Daily KHK Lieferscheine Error ${err}`)
          // });
          // log.add(`Job: Daily KHK Lieferscheine Added New Asset ${row.Seriennummer}`)
        }else{
          var updateResult = await db.update("systeme", toInsert, {SN: row.Seriennummer}).catch(function (err) {
            log.add(`Job: Daily KHK Lieferscheine Error ${err}`)
          })
          log.add(`Job: Daily KHK Lieferscheine Update Asset ${row.Seriennummer}`)
        }
    }  
  })
  .on('end', async () => {
    console.log("Stop Loop over all incomming Lieferscheine Data "+new Date().toLocaleString())
  });
}
async function khkimportLager(pfad){
    try {
        if (fs.existsSync(pfad)) {
            log.add(`Job: Daily KHK Lager Import started...`)
            return await dealExcelDataLager(pfad)
        }else{
            //in DB Logs schreiben
            log.add(`Job: Daily KHK Lager Import failed: File did not exist!`)
            return false
        }
      } catch(err) {
        return false
    }
}

async function khkImportLieferscheine(pfad){
    try {
      if (fs.existsSync(pfad)) {
          log.add(`Job: Daily KHK Lieferscheine Import started...`)
          return await dealExcelDataLieferscheine(pfad)
      }else{
          //in DB Logs schreiben
          log.add(`Job: Daily KHK Lieferscheine Import failed: File did not exist!`)
          return false
      }
    } catch(err) {
      return false
  }
}




module.exports = { khkimportLager, khkImportLieferscheine };