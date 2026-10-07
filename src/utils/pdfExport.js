import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo2 from '../assets/Logo/Logo_2.png';

/**
 * Generate a PDF that looks exactly like the Invoice Preview modal.
 * - A4 paper size
 * - Centered on A4 page
 * - Logo perfectly centered
 * - Full multi-page support for long orders (no items hidden, clean row breaks)
 */
export async function generateInvoicePdf(order, storeSettings = {}) {
  const curr = storeSettings.currencySymbol || '₹';
  const storeName = storeSettings.storeName || 'Broasted Kozhi';
  const phone = storeSettings.phone || '';
  const billTitle = storeSettings.billTitle || 'Bill of Supply';
  const footer = storeSettings.footerNote || 'Thank you for doing business with us.';
  const addressLines = (storeSettings.address || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const dateObj = new Date(order.date);
  const dateStr = dateObj.toLocaleDateString('en-GB');
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Build items rows
  const itemRows = order.items.map((it, idx) => `
    <tr data-row-idx="${idx}" style="border-bottom: 1px dashed rgba(42,27,27,0.15);">
      <td style="padding: 6px 4px 6px 0; font-size: 12px; color: #2A1B1B; word-break: break-word;">${it.name}${it.variant ? ` (${it.variant})` : ''}</td>
      <td style="padding: 6px 0; font-size: 12px; text-align: center; color: #2A1B1B; white-space: nowrap;">${it.qty}</td>
      <td style="padding: 6px 8px; font-size: 12px; text-align: right; color: #2A1B1B; white-space: nowrap;">${it.unitPrice.toFixed(2)}</td>
      <td style="padding: 6px 0; font-size: 12px; text-align: right; font-weight: 700; color: #2A1B1B; white-space: nowrap;">${(it.unitPrice * it.qty).toFixed(2)}</td>
    </tr>
  `).join('');

  // Build the full invoice HTML — exact matching layout
  const html = `
    <div id="pdf-invoice-card" style="width: 440px; padding: 28px; background: #ffffff; font-family: 'Plus Jakarta Sans', 'Inter', Arial, sans-serif; color: #2A1B1B; box-sizing: border-box; margin: 0 auto;">
      <!-- Logo centered -->
      <div style="text-align: center; width: 100%; margin-bottom: 12px;">
        <img src="${logo2}" alt="${storeName}" style="height: 64px; width: auto; display: inline-block; margin: 0 auto;" crossorigin="anonymous" />
      </div>

      <!-- Address -->
      ${addressLines.map(line => `<p style="font-size: 11px; line-height: 1.5; color: rgba(42,27,27,0.8); text-align: center; margin: 0; padding: 0;">${line}</p>`).join('')}
      ${phone ? `<p style="font-size: 11px; line-height: 1.5; color: rgba(42,27,27,0.9); font-weight: 700; margin: 4px 0 0 0; text-align: center;">Phone: ${phone}</p>` : ''}

      <!-- Divider -->
      <div style="border-top: 1px dashed rgba(42,27,27,0.3); margin: 10px 0;"></div>

      <!-- Bill Title -->
      <p style="text-align: center; font-weight: 700; font-size: 14px; margin: 0 0 6px 0; color: #2A1B1B;">${billTitle}</p>

      <!-- Meta Info -->
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: rgba(42,27,27,0.7); margin-bottom: 6px;">
        <div>
          <div style="font-weight: 800; color: #2A1B1B;">${order.paymentMode}</div>
          ${order.customerName ? `<div style="font-weight: 600; color: rgba(42,27,27,0.9);">Customer: ${order.customerName}</div>` : ''}
          ${order.customerPhone ? `<div style="font-weight: 500; color: rgba(42,27,27,0.75);">Phone: ${order.customerPhone}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div>Date: ${dateStr}</div>
          <div>Time: ${timeStr}</div>
          <div>Invoice no: #${order.invoiceNo}</div>
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px dashed rgba(42,27,27,0.3); margin: 8px 0;"></div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(42,27,27,0.3);">
            <th style="padding: 5px 0; font-size: 12px; font-weight: 700; text-align: left;">Item</th>
            <th style="padding: 5px 0; font-size: 12px; font-weight: 700; text-align: center;">Qty</th>
            <th style="padding: 5px 8px; font-size: 12px; font-weight: 700; text-align: right;">Price</th>
            <th style="padding: 5px 0; font-size: 12px; font-weight: 700; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Divider -->
      <div style="border-top: 1px dashed rgba(42,27,27,0.3); margin: 10px 0;"></div>

      <!-- Subtotal -->
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Subtotal</span>
        <span>${curr}${order.subtotal.toFixed(2)}</span>
      </div>

      <!-- Total -->
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #E4212B; margin-top: 6px;">
        <span>Total</span>
        <span>${curr}${order.total.toFixed(2)}</span>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px dashed rgba(42,27,27,0.3); margin: 14px 0;"></div>

      <!-- Footer -->
      <p style="text-align: center; font-size: 11px; font-weight: 700; margin: 0;">Terms &amp; Conditions</p>
      <p style="text-align: center; font-size: 11px; color: rgba(42,27,27,0.7); margin: 4px 0 0 0;">${footer}</p>
    </div>
  `;

  // Create temporary off-screen element
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; top:0; z-index:-9999; background:#ffffff; opacity:1; overflow:visible; width: auto;';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Ensure image is loaded before capturing
  const img = container.querySelector('img');
  if (img && !img.complete) {
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      setTimeout(resolve, 2000);
    });
  }

  await new Promise(r => setTimeout(r, 150));

  try {
    const invoiceEl = container.querySelector('#pdf-invoice-card');

    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: invoiceEl.offsetWidth,
      height: invoiceEl.offsetHeight,
    });

    const A4_W = 210; // mm
    const A4_H = 297; // mm
    const MARGIN_X = 20; // mm
    const MARGIN_Y = 15; // mm

    const printableW = A4_W - (MARGIN_X * 2); // 170 mm
    const printableH = A4_H - (MARGIN_Y * 2); // 267 mm

    // Scale ratio (canvas px -> mm)
    const scaleFactor = canvas.width / printableW; // px per mm
    const totalCanvasH = canvas.height;
    const printableHPx = printableH * scaleFactor; // max height in canvas px per page

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (totalCanvasH <= printableHPx) {
      // Single page — center vertically and horizontally
      const scaledH = totalCanvasH / scaleFactor;
      const xOffset = MARGIN_X;
      const yOffset = MARGIN_Y + Math.max(0, (printableH - scaledH) / 2);
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, printableW, scaledH);
    } else {
      // Multi-page order! Collect row break boundaries to avoid cutting across text lines
      const trElements = Array.from(invoiceEl.querySelectorAll('tbody tr'));
      const cardRect = invoiceEl.getBoundingClientRect();

      // Row bottom positions relative to invoiceEl top (scaled by 2 for html2canvas scale=2)
      const rowBreaks = trElements.map(tr => {
        const rect = tr.getBoundingClientRect();
        return (rect.bottom - cardRect.top) * 2;
      });

      let currentY = 0;
      let pageNum = 0;

      while (currentY < totalCanvasH) {
        if (pageNum > 0) pdf.addPage('a4', 'portrait');

        let targetSliceH = printableHPx;
        let nextY = currentY + targetSliceH;

        if (nextY < totalCanvasH && rowBreaks.length > 0) {
          // Find the last row break before nextY
          const validBreak = rowBreaks.filter(b => b > currentY + 100 && b <= nextY).pop();
          if (validBreak) {
            nextY = validBreak;
            targetSliceH = nextY - currentY;
          }
        } else {
          nextY = totalCanvasH;
          targetSliceH = totalCanvasH - currentY;
        }

        // Create canvas slice for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = targetSliceH;

        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, currentY, canvas.width, targetSliceH,
          0, 0, canvas.width, targetSliceH
        );

        const pageImgData = pageCanvas.toDataURL('image/png');
        const pageImgH = targetSliceH / scaleFactor;

        pdf.addImage(pageImgData, 'PNG', MARGIN_X, MARGIN_Y, printableW, pageImgH);

        currentY = nextY;
        pageNum++;
      }
    }

    pdf.save(`Invoice_${order.invoiceNo}_${dateStr.replace(/\//g, '-')}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    alert('Could not generate PDF. Please try again.');
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/** Legacy: capture existing DOM element as PDF */
export async function exportInvoiceToPdf(elementId, filename = 'Invoice.pdf') {
  try {
    const el = document.getElementById(elementId);
    if (!el) { window.print(); return; }
    const canvas = await html2canvas(el, {
      scale: 2, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', logging: false,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    window.print();
  }
}
