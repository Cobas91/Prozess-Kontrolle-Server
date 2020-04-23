const cronJob = require('node-schedule');
var fs = require('fs');
const log = require("./logs.js")
const xlsx = require('node-xlsx')
const db = require("../util/dbConnector")
const status = require("../util/statusHandler.js")
const fileName= "rptAbfDataSerienNr"
const filepath = `./khk_import/${fileName}.xlsx`


// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

//Jeden morgen um 6 Uhr ausführen
cronJob.scheduleJob('0 27 13 * * *', function(){
    console.log("Aufgabe KHK Import gestartet.")
    khkimport();
});

async function dealExcelData(){
    const workSheetsFromFile = xlsx.parse(filepath);
    const test = Object.assign({}, workSheetsFromFile[0].data)
    //console.log(test)
    var body = test
    console.log("Begin Loop over all incomming Data "+new Date().toLocaleString())
    // 0 = Artikelnummer
    // 1 = Matchcode
    // 2 = Lager
    // 3 = Seriennummer
    log.add(`Job: Daily KHK Import started......${new Date().toLocaleString()}`)
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
        }
        log.add(`Job: Daily KHK Import error ${body[index][3]} already exists`)
      }
    }
    log.add(`Job: Daily KHK Import ended......${new Date().toLocaleString()}`)
    console.log("Stop Loop over all incomming Data "+new Date().toLocaleString())
}

function khkimport(){
    const path = `./khk_import/${fileName}.xlsx`
    try {
        if (fs.existsSync(path)) {
            log.add(`Job: Daily KHK Import started...`)
            dealExcelData()
        }else{
            //in DB Logs schreiben
            log.add(`Job: Daily KHK Import failed: File did not exist!`)
        }
      } catch(err) {
        console.log("err")
      }
}




module.exports = { khkimport };