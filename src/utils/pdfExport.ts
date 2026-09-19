import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function handleExportReport(
  reportElementRef: React.RefObject<HTMLDivElement | null>,
  reportType = 'daily',
  dateLabel = new Date().toISOString().slice(0, 10)
) {
  console.log("Export Report clicked, ref:", reportElementRef.current);
  if (!reportElementRef.current) {
    console.error("Export aborted: report container ref is null");
    return;
  }

  try {
    // Ensure content is fully painted before capture
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(reportElementRef.current, {
      backgroundColor: "#0f1115",
      useCORS: true,
      scale: 2,
      windowWidth: reportElementRef.current.scrollWidth,
      windowHeight: reportElementRef.current.scrollHeight
    });

    console.log("Canvas captured:", canvas.width, "x", canvas.height);
    const imgData = canvas.toDataURL("image/png");
    console.log("Image data length:", imgData.length);

    if (imgData.length < 5000) {
      console.error("Captured canvas looks blank — check container visibility/height before capture");
      return;
    }

    const pdfWidth = canvas.width * 0.75 / 2;
    const pdfHeight = canvas.height * 0.75 / 2;
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight]
    });

    pdf.setFillColor(15, 17, 21);
    pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`focus-sanctuary-report-${reportType}-${dateLabel}.pdf`);
    console.log("Export Report: PDF saved");
  } catch (err) {
    console.error("Export Report failed:", err);
  }
}
