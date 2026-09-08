export function downloadInvoicePdf(inv, user) {
  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${inv.invoiceNumber || inv._id?.slice(-8)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #18181b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #5865f2; }
          .meta { margin-top: 30px; display: flex; justify-content: space-between; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 14px; }
          th { text-align: left; background: #f4f4f5; padding: 12px; border-bottom: 1px solid #e4e4e7; }
          td { padding: 12px; border-bottom: 1px solid #e4e4e7; }
          .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 12px; color: #71717a; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MeterPrompt Gateway</div>
            <p style="color: #71717a; margin: 4px 0 0 0; font-size: 13px;">AI Gateway & Metered Billing</p>
          </div>
          <div style="text-align: right;">
            <strong>INVOICE</strong>
            <p style="margin: 4px 0 0 0; font-family: monospace;">#${inv.invoiceNumber || inv._id?.slice(-8)}</p>
          </div>
        </div>

        <div class="meta">
          <div>
            <strong>Billed To:</strong><br/>
            ${user?.name || 'Developer'}<br/>
            ${user?.email || ''}
          </div>
          <div style="text-align: right;">
            <strong>Invoice Date:</strong> ${new Date(inv.createdAt || inv.date || Date.now()).toLocaleDateString()}<br/>
            <strong>Payment Status:</strong> ${inv.status || 'Paid'} (Card ending in 4242)
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Billing Interval</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${inv.description || (inv.type === 'topup' ? 'Account Credit Top-Up' : 'Plan Subscription')}</td>
              <td>${inv.billingCycle || 'Monthly'}</td>
              <td style="text-align: right; font-family: monospace;">$${Number(inv.amount).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total Paid: $${Number(inv.amount).toFixed(2)} USD
        </div>

        <div class="footer">
          MeterPrompt © 2026 — Thank you for building with us.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }
}
