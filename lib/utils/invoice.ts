// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { format } from "date-fns";

// interface OrderItem {
//   product: {
//     name: string;
//   };
//   quantity: number;
//   price: number;
// }

// interface Address {
//   name: string;
//   street: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
//   phone: string;
// }

// interface Order {
//   id: string;
//   invoiceNumber: string | null;
//   createdAt: string | Date;
//   total: number;
//   orderItems: OrderItem[];
//   address: Address;
//   user: {
//     name: string | null;
//     email: string;
//   };
// }

// export function generateInvoicePDF(order: Order): jsPDF {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.width;

//   // Company Logo/Name
//   doc.setFontSize(24);
//   doc.text("E-Commerce", 20, 20);

//   // Invoice Details
//   doc.setFontSize(12);
//   doc.text(
//     `Invoice Number: ${order.invoiceNumber || order.id.substring(0, 8)}`,
//     20,
//     40
//   );
//   doc.text(`Date: ${format(new Date(order.createdAt), "PPP")}`, 20, 48);

//   // Billing Information
//   doc.setFontSize(14);
//   doc.text("Bill To:", 20, 65);
//   doc.setFontSize(12);
//   doc.text(
//     [
//       order.user.name || "Customer",
//       order.user.email,
//       order.address.street,
//       `${order.address.city}, ${order.address.state} ${order.address.postalCode}`,
//       order.address.country,
//       `Phone: ${order.address.phone}`,
//     ],
//     20,
//     75
//   );

//   // Order Items Table
//   const tableColumn = ["Item", "Quantity", "Price", "Total"];
//   const tableRows = order.orderItems.map((item) => [
//     item.product.name,
//     item.quantity.toString(),
//     `$${item.price.toFixed(2)}`,
//     `$${(item.quantity * item.price).toFixed(2)}`,
//   ]);

//   (doc as any).autoTable({
//     head: [tableColumn],
//     body: tableRows,
//     startY: 120,
//     theme: "grid",
//     headStyles: {
//       fillColor: [51, 51, 51],
//       textColor: [255, 255, 255],
//       fontStyle: "bold",
//     },
//     foot: [["Total", "", "", `$${order.total.toFixed(2)}`]],
//     footStyles: {
//       fillColor: [240, 240, 240],
//       fontStyle: "bold",
//     },
//   });

//   // Footer
//   const footerText = "Thank you for your business!";
//   doc.setFontSize(10);
//   doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 10, {
//     align: "center",
//   });

//   return doc;
// }

// export function downloadInvoice(order: Order) {
//   const doc = generateInvoicePDF(order);
//   doc.save(`invoice-${order.invoiceNumber || order.id.substring(0, 8)}.pdf`);
// }

// export function printInvoice(order: Order) {
//   const doc = generateInvoicePDF(order);
//   doc.autoPrint();
//   window.open(doc.output("bloburl"), "_blank");
// }
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

// Interfaces for Order Data
interface OrderItem {
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Order {
  id: string;
  invoiceNumber: string | null;
  createdAt: string | Date;
  total: number;
  orderItems: OrderItem[];
  address: Address;
  user: {
    name: string | null;
    email: string;
  };
}

// Function to Generate Invoice PDF
export function generateInvoicePDF(order: Order): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Company Logo/Name
  doc.setFontSize(24);
  doc.text("E-Commerce", 20, 20);

  // Invoice Details
  doc.setFontSize(12);
  doc.text(
    `Invoice Number: ${order.invoiceNumber || order.id.substring(0, 8)}`,
    20,
    40
  );
  doc.text(`Date: ${format(new Date(order.createdAt), "PPP")}`, 20, 48);

  // Billing Information
  doc.setFontSize(14);
  doc.text("Bill To:", 20, 65);
  doc.setFontSize(12);
  doc.text(
    [
      order.user.name || "Customer",
      order.user.email,
      order.address.street,
      `${order.address.city}, ${order.address.state} ${order.address.postalCode}`,
      order.address.country,
      `Phone: ${order.address.phone}`,
    ],
    20,
    75
  );

  // Order Items Table
  const tableColumn = ["Item", "Quantity", "Price", "Total"];
  const tableRows = order.orderItems.map((item) => [
    item.product.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.quantity * item.price).toFixed(2)}`,
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 120,
    theme: "grid",
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    foot: [["Total", "", "", `$${order.total.toFixed(2)}`]],
    footStyles: {
      fillColor: [240, 240, 240],
      fontStyle: "bold",
    },
  });

  // Footer
  doc.setFontSize(10);
  doc.text(
    "Thank you for your business!",
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    {
      align: "center",
    }
  );

  return doc;
}

// Function to Download Invoice PDF
export function downloadInvoice(order: Order) {
  const doc = generateInvoicePDF(order);
  doc.save(`invoice-${order.invoiceNumber || order.id.substring(0, 8)}.pdf`);
}

// Function to Print Invoice PDF
export function printInvoice(order: Order) {
  const doc = generateInvoicePDF(order);
  doc.autoPrint();

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url);
  if (!printWindow) {
    alert("Pop-up blocked! Please allow pop-ups and try again.");
    return;
  }

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    URL.revokeObjectURL(url);
  };
}
