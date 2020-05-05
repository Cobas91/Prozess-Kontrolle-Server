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

cronJob.scheduleJob(`${config.PowerBI.time.sekunde} ${config.PowerBI.time.minute} ${config.PowerBI.time.stunde} * * *`, async function(){
  console.log(`Aufgabe PowerBI export um ${config.PowerBI.time.stunde}:${config.PowerBI.time.minute} Uhr gestartet.`)
  await exportPowerBI();
});

async function exportPowerBI(){
  const checklisten = config.PowerBI.checklisten
  const systeme = config.PowerBI.systeme
  const status = config.PowerBI.status

  // Checklisten
  var query_checklisten = `
  SELECT ${checklisten.header} UNION ALL 
  SELECT * FROM ${checklisten.table} INTO OUTFILE '${checklisten.pfad}${checklisten.file}' FIELDS TERMINATED BY '${checklisten.query.Fields_Termitated}' ENCLOSED BY '${checklisten.query.Enclosed_By}' ESCAPED BY '${checklisten.query.Escaped_by}' LINES TERMINATED BY '${checklisten.query.Lines_Terminated}'
  ` 
  var erg_checklisten = await db.query(query_checklisten)
    .then(function (res) {
      fs.createReadStream(`${checklisten.pfad}${checklisten.file}`).pipe(fs.createWriteStream(`${checklisten.pfad}${checklisten.powerBIFile}`));
      fs.unlinkSync(`${checklisten.pfad}${checklisten.file}`)
      log.add(`Job: PowerBI Export Checklisten done `+new Date().toLocaleString())
  });

  // Systeme
  var query_systeme = `
  SELECT ${systeme.header} UNION ALL 
  SELECT * FROM ${systeme.table} INTO OUTFILE '${systeme.pfad}${systeme.file}' FIELDS TERMINATED BY '${systeme.query.Fields_Termitated}' ENCLOSED BY '${systeme.query.Enclosed_By}' ESCAPED BY '${systeme.query.Escaped_by}' LINES TERMINATED BY '${systeme.query.Lines_Terminated}'
  `
  var erg_systeme = await db.query(query_systeme)
    .then(function (res) {
      fs.createReadStream(`${systeme.pfad}${systeme.file}`).pipe(fs.createWriteStream(`${systeme.pfad}${systeme.powerBIFile}`));
      fs.unlinkSync(`${systeme.pfad}${systeme.file}`)
      log.add(`Job: PowerBI Export Systeme done `+new Date().toLocaleString())
  });

  // Status
  var query_status = `
  SELECT ${status.header} UNION ALL 
  SELECT * FROM ${status.table} INTO OUTFILE '${status.pfad}${status.file}' FIELDS TERMINATED BY '${status.query.Fields_Termitated}' ENCLOSED BY '${status.query.Enclosed_By}' ESCAPED BY '${status.query.Escaped_by}' LINES TERMINATED BY '${status.query.Lines_Terminated}'
  `
  var erg_status = await db.query(query_status)
    .then(function (res) {
      fs.createReadStream(`${status.pfad}${status.file}`).pipe(fs.createWriteStream(`${status.pfad}${status.powerBIFile}`));
      fs.unlinkSync(`${status.pfad}${status.file}`)
      log.add(`Job: PowerBI Export Status done `+new Date().toLocaleString())
  });


}

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




module.exports = { khkimportLager, khkImportLieferscheine, exportPowerBI };