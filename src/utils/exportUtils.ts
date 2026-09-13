import * as XLSX from 'xlsx';
import type { SalesRecord, KPISummary } from '../types/sales';


export function exportToExcel(records: SalesRecord[], filename = 'Sales_Revenue_Report.xlsx') {
  const exportData = records.map((r) => ({
    'Order ID': r.id,
    'Date': r.date,
    'Product Name': r.productName,
    'Category': r.category,
    'Quantity': r.quantity,
    'Unit Price ($)': r.unitPrice,
    'Total Revenue ($)': r.revenue,
    'Est. Cost ($)': r.cost,
    'Profit ($)': r.profit,
    'Profit Margin (%)': r.profitMargin,
    'Region': r.region,
    'Salesperson': r.salesperson,
    'Customer Type': r.customerType,
    'Status': r.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');

  XLSX.writeFile(workbook, filename);
}

export function exportToCSV(records: SalesRecord[], filename = 'Sales_Data_Export.csv') {
  const headers = [
    'Order ID', 'Date', 'Product Name', 'Category', 'Quantity', 
    'Unit Price', 'Total Revenue', 'Profit', 'Profit Margin %', 
    'Region', 'Salesperson', 'Customer Type', 'Status'
  ];

  const rows = records.map((r) => [
    r.id,
    r.date,
    `"${r.productName.replace(/"/g, '""')}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    r.quantity,
    r.unitPrice,
    r.revenue,
    r.profit,
    r.profitMargin,
    `"${r.region}"`,
    `"${r.salesperson}"`,
    `"${r.customerType}"`,
    r.status
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printExecutiveSummaryReport(kpis: KPISummary, insights: string[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales & Revenue Executive Summary Report</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #111827; }
        h1 { color: #1e3a8a; font-size: 24px; margin-bottom: 8px; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .card { border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; background: #f9fafb; }
        .card-title { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .card-value { font-size: 20px; font-weight: bold; color: #111827; margin-top: 4px; }
        .insights { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; }
        .insights h2 { font-size: 16px; color: #1d4ed8; margin-top: 0; }
        .insights ul { margin: 0; padding-left: 20px; }
        .insights li { margin-bottom: 8px; font-size: 14px; color: #1e293b; }
      </style>
    </head>
    <body>
      <h1>Executive Sales & Revenue Report</h1>
      <div class="meta">Generated on ${new Date().toLocaleDateString()} | Confidential Business Performance Report</div>
      
      <div class="grid">
        <div class="card">
          <div class="card-title">Total Revenue</div>
          <div class="card-value">$${kpis.totalRevenue.toLocaleString()}</div>
        </div>
        <div class="card">
          <div class="card-title">Total Orders</div>
          <div class="card-value">${kpis.totalOrders.toLocaleString()}</div>
        </div>
        <div class="card">
          <div class="card-title">Avg Order Value (AOV)</div>
          <div class="card-value">$${kpis.averageOrderValue.toLocaleString()}</div>
        </div>
        <div class="card">
          <div class="card-title">Net Profit Margin</div>
          <div class="card-value">${kpis.overallMarginPercentage}%</div>
        </div>
        <div class="card">
          <div class="card-title">Top Product</div>
          <div class="card-value">${kpis.topPerformingProduct.name}</div>
        </div>
        <div class="card">
          <div class="card-title">Top Region</div>
          <div class="card-value">${kpis.topPerformingRegion.name}</div>
        </div>
      </div>

      <div class="insights">
        <h2>AI Executive Key Insights & Strategic Findings</h2>
        <ul>
          ${insights.map((i) => `<li>${i}</li>`).join('')}
        </ul>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
