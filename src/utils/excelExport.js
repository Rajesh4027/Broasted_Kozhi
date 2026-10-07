import * as XLSX from 'xlsx';

export function exportOrdersToExcel(orders, filename = 'BK_Orders.xlsx') {
  const rows = [];
  orders.forEach((order) => {
    order.items.forEach((item, idx) => {
      rows.push({
        'Invoice No': idx === 0 ? order.invoiceNo : '',
        Date: idx === 0 ? new Date(order.date).toLocaleString() : '',
        Customer: idx === 0 ? order.customerName || '-' : '',
        'Customer Phone': idx === 0 ? order.customerPhone || '-' : '',
        Payment: idx === 0 ? order.paymentMode : '',
        Item: item.name,
        Variant: item.variant || '-',
        Qty: item.qty,
        'Unit Price': item.unitPrice,
        Amount: item.unitPrice * item.qty,
        'Order Total': idx === 0 ? order.total : '',
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 10 },
    { wch: 30 }, { wch: 12 }, { wch: 6 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, filename);
}

export function exportSingleInvoiceToExcel(order) {
  exportOrdersToExcel([order], `Invoice_${order.invoiceNo}.xlsx`);
}
