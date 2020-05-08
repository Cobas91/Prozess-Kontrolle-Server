const cronJob = require('node-schedule');
const config = require('../config.json')
var fs = require('fs');
const log = require("./logs.js")
const xlsx = require('node-xlsx')
const db = require("../util/dbConnector")
const status = require("../util/statusHandler.js")
const csv = require('csv-parser');
const teams = require("../util/teams")

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

cronJob.scheduleJob(`${config.teams.dailyFeedback.time.sekunde} ${config.teams.dailyFeedback.time.minute} ${config.teams.dailyFeedback.time.stunde} * * *`, async function(){
  console.log(`Status Update an Teams gesendet ${config.teams.dailyFeedback.time.stunde}:${config.teams.dailyFeedback.time.minute} Uhr.`)
  await dailyFeedback("Dev")
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


async function dailyFeedback(channel){
  var kunden = await db.select("kunden", {})
  var status = await db.select("status_names", {})
  var counter = 0
  var erg
  
  for(var kundenIndex in kunden){
    var kundenName = kunden[kundenIndex].Name
    for(var statusIndex in status){
      var statusName = status[statusIndex].Name
      var datenbank = await db.select("systeme", {Kunde: kundenName, Status: statusName})
      var mengeStatus = Object.keys(datenbank).length
      if(counter <=0){
        erg = {
          ...erg,
          [kundenName]:{
            [statusName]: mengeStatus,          
          }
        }
      }else{
        erg = {
          ...erg,
          [kundenName]:{
            ...erg[kundenName],
            [statusName]: mengeStatus,          
          }
        }
      }      
      counter = counter +1
    }
  }

  var textString = ""
  var workStringStatus = ""
  for (var kunde in erg){
    for(var status in erg[kunde]){
      workStringStatus += `<li>${status} = ${erg[kunde][status]} \r</li>`
    }
    textString += `<strong><br>${kunde}:\r${workStringStatus}\r</strong>`
    workStringStatus = ""
  }

  var teamsMessage = {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "text": "Automatische tägliche Statusmeldung",
    "sections": [{
      "activityTitle": "Statusmeldung zu den aktuellen Systemen",
      "activitySubtitle": "<li>Versand Ready - Geräte liegen zum Kommisionieren und Versenden bereit.</li><br><li>Ready4Install - Geräte stehen aktuell in der Straße</li><br>",
      "activityImage": "data:image/png;base64,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",
      "text": textString,
      "markdown": true
    }]
}
  teams.sendDailyFeedback(teamsMessage, channel)
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