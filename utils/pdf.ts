import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // 1. Capture the element as a high-res canvas
    // positioning the element off-screen but visible to DOM allows capture
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for crisp text
      useCORS: true, // Allow loading cross-origin images if any
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    // 2. Initialize PDF (A4 Portrait)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // const pdfHeight = pdf.internal.pageSize.getHeight();

    // 3. Calculate dimensions to fit width of PDF
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate the height of the image on the PDF based on the PDF's width
    // Ratio = Width / Height
    const ratio = imgWidth / imgHeight;
    const finalHeight = pdfWidth / ratio;

    // 4. Add image to PDF
    // We pass the data URL string directly. jsPDF handles the signature parsing internally here.
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);

    // 5. Save
    pdf.save(`${fileName}.pdf`);

  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("Error generating PDF. Please try again. \n生成 PDF 时发生错误，请重试。");
  }
};