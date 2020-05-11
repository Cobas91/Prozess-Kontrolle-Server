const Excel = require("exceljs");
const time = require("./time");
const Datastore = require("nedb");
function initExcel(data) {
  if (data.length < 1) {
    console.log("No Data found");
    return "No Data found";
  }
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Data");
  var filename = getFilename();
  var downloadPath = getPath(filename);
  var dataCount = data.length;
  var db = new Datastore({
    filename: "DB/all.db",
    autoload: true,
  });
  //Setting Headers for Worksheet
  worksheet.columns = [
    { header: "Timestamp", key: "timestamp", width: 10 },
    { header: "Key", key: "key", width: 32 },
    { header: "Kunde", key: "kunde", width: 10 },
    { header: "Resetted", key: "reset", width: 10 },
  ];
  //Loop through Data and put it in the Worksheet
  data.forEach((element) => {
    var cTime = time.convert(element.timestamp);
    try {
      worksheet.addRow({
        timestamp: cTime,
        key: element.data.sn,
        kunde: element.data.kunde,
        reset: element.resetCount,
      });
    } catch (error) {
      console.log(error);
    }
    db.update(
      { _id: element._id },
      { $set: { path: downloadPath } },
      {},
      function (err, numReplaced) {
        if (err) {
          console.log(err.message);
        }
        console.log(
          `Updated Entry with ID ${element._id}, set Path to ${filename}.`
        );
      }
    );
  });
  //Write File after all Data has parsed
  workbook.xlsx.writeFile(`export/${filename}`).then(function () {
    console.log(`Saved as ${filename}`);
  });
  return { pfad: downloadPath, counts: dataCount };
}
function getPath(filename) {
  // Build Download Path
  const path = `${process.cwd()}/export/${filename}`;
  console.log(`Downloadpfad = ${path}`);
  return path;
}
function getFilename() {
  const number = Math.floor(Math.random() * (+10000 - +0)) + +0;
  const filename = `File-${number}.xlsx`;
  return filename;
}
module.exports = { initExcel };
