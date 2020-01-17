var express = require("express"),
  router = express.Router();
  const PDFDocument = require('pdfkit')
  const blobStream  = require('blob-stream')

  router.post("/create/pdf", async ({body},response) => {
    const doc = new PDFDocument()
    var stream = doc.pipe(blobStream());
    console.log("Got Request on create PDF", body.filename)
    let filename = body.filename
    // Stripping special characters
    filename = encodeURIComponent(filename) + '.pdf'
    // Setting response to 'attachment' (download).
    // If you use 'inline' here it will automatically open the PDF
    response.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
    response.setHeader('Content-type', 'application/pdf')
    body.content.forEach(element => {
      for (let [key, value] of Object.entries(element)){
        doc.text(key, 50, 50)
        doc.text(value, 50, 50)
      }
    });
    doc.y = 300
    doc.end()
    stream.on('finish', function() {
      response.send(stream.toBlobURL('application/pdf'));
    });
  })

  module.exports = router;
