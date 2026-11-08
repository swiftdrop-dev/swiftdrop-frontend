import type { Parcel } from "../../../types/global.types";

export async function downloadReceipt(parcel: Parcel) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();

  pdf.setFontSize(22);
  pdf.text("SwiftDrop", 20, 25);

  pdf.setFontSize(12);
  pdf.text("Demo delivery receipt", 20, 35);

  const lines = [
    ["Tracking number", parcel.trackingNumber],
    ["Sender", parcel.senderName],
    ["Recipient", parcel.recipientName],
    [
      "Delivery address",
      `${parcel.recipientAddress.street}, ${parcel.recipientAddress.city}, ${parcel.recipientAddress.district}`,
    ],
    ["Package", parcel.description],
    ["Weight", `${parcel.weight} kg`],
    [
      "Delivered",
      parcel.deliveredAt
        ? new Date(parcel.deliveredAt).toLocaleString("en-LK")
        : "-",
    ],
    [
      "Payment method",
      parcel.paymentMethod === "cod"
        ? "Cash on Delivery"
        : "Online (demo)",
    ],
    ["Payment status", parcel.paymentStatus],
    ["Total fee", `LKR ${parcel.totalFee.toFixed(2)}`],
  ];

  let y = 52;

  for (const [label, value] of lines) {
    const wrapped = pdf.splitTextToSize(value, 105) as string[];
    const height = Math.max(12, wrapped.length * 6 + 6);

    if (y + height > 275) {
      pdf.addPage();
      y = 25;
    }

    pdf.setFont("helvetica", "bold");
    pdf.text(label, 20, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(wrapped, 80, y);

    y += height;
  }

  pdf.save(`${parcel.trackingNumber}-receipt.pdf`);
}