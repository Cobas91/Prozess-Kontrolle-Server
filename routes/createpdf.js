var express = require("express"),
  router = express.Router();
  const PDFDocument = require('pdfkit')
  var fs = require('fs');
  const path = require('path');
  var appDir = path.dirname(require.main.filename);


  function createPDF(data, filename){
    const doc = new PDFDocument;
    var filename = filename + ".pdf"
    doc.pipe(
      fs.createWriteStream("downloads/"+filename).on("error", (err) => {
        errorCallback(err.message);
      })
    );

    doc.on('end', () => {
      console.log("PDF created....", filename)
    });


    // Add another page
    doc.addPage()
      .fontSize(25)
      .text('Here is some vector graphics...', 100, 100);

    // Draw a triangle
    doc.save()
      .moveTo(100, 150)
      .lineTo(100, 250)
      .lineTo(200, 250)
      .fill("#FF3300");

    // Apply some transforms and render an SVG path with the 'even-odd' fill rule
    doc.scale(0.6)
      .translate(470, -380)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('red', 'even-odd')
      .restore();

    // Add some text with annotations
    doc.addPage()
      .fillColor("blue")
      .text('Here is a link!', 100, 100)
      .underline(100, 100, 160, 27, {color: "#0000FF"})
      .link(100, 100, 160, 27, 'http://google.com/');

    // Finalize PDF file
    doc.end();
    return filename;
  }
  async function PDF(body){
    const filename = await createPDF(body.content, body.filename);
    return filename;
  }

  router.post("/create/pdf", async ({body},res) => {
    var filename = await PDF(body);
    console.log("File to download", filename)
    var downloadPath = appDir.substring(2) + "\\downloads\\" + filename
    console.log(downloadPath)
    setTimeout(function(){
      res.download(downloadPath) 
    }, 1000);
    
  })

  module.exports = router;
