import PDFDocument from "pdfkit";

function generatePDF(res, attendanceData) {
  try {
    // Create a document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the document to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(16).text("Attendance Report", { align: "center" }).moveDown();

    attendanceData.forEach((record) => {
      doc
        .fontSize(14)
        .text(`Date: ${record.date}`, { underline: true })
        .moveDown(0.5);

      // todo :- add function to display all entry & exit time with calculated time in table format
      // doc.fontSize(12).text("All Times:").moveDown(0.5);
      // record.allTime.forEach((timePair) => {
      //   doc.text(` ${timePair[0]}:${timePair[1]}:${timePair[2]}`);
      // });

      doc
        .fontSize(12)
        .text(
          `Total Working Time    :- ${record.totalWorkingTime[0]} : ${record.totalWorkingTime[1]} : ${record.totalWorkingTime[2]}`
        )
        .moveDown(0.5);
      doc
        .fontSize(12)
        .text(
          `Total Break Time       :- ${record.totalBreakTime[0]} : ${record.totalBreakTime[1]} : ${record.totalBreakTime[2]}`
        )
        .moveDown(1);

      doc.moveDown();
    });

    // Finalize PDF file
    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
}

export { generatePDF };
