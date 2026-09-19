"use client";

export interface ExportColumn {
  label: string;
  key: string;
}

export class ExportService {
  /**
   * Generates and downloads a CSV file from formatted dataset
   */
  static exportToCsv(filename: string, columns: ExportColumn[], data: Record<string, unknown>[]): void {
    if (!data || data.length === 0) {
      console.warn("No data available to export to CSV");
      return;
    }

    const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");
    const bodyRows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col.key];
          const strVal = val !== undefined && val !== null ? String(val) : "";
          return `"${strVal.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headerRow, ...bodyRows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates and downloads an Excel XML/CSV compatible file
   */
  static exportToExcel(filename: string, columns: ExportColumn[], data: Record<string, unknown>[]): void {
    if (!data || data.length === 0) {
      console.warn("No data available to export to Excel");
      return;
    }

    const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join("\t");
    const bodyRows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col.key];
          const strVal = val !== undefined && val !== null ? String(val) : "";
          return `"${strVal.replace(/"/g, '""')}"`;
        })
        .join("\t")
    );

    const excelContent = [headerRow, ...bodyRows].join("\n");
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".xls") ? filename : `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a printable PDF window view with clean document styling
   */
  static exportToPdf(title: string, columns: ExportColumn[], data: Record<string, unknown>[]): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate PDF report preview.");
      return;
    }

    const tableHeadersHtml = columns.map((col) => `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background: #f1f5f9; text-align: left; font-size: 12px; font-weight: 700;">${col.label}</th>`).join("");
    
    const tableRowsHtml = data.length > 0 ? data.map((row) => {
      const cells = columns.map((col) => {
        const val = row[col.key];
        const strVal = val !== undefined && val !== null ? String(val) : "-";
        return `<td style="border: 1px solid #e2e8f0; padding: 8px 12px; font-size: 11px;">${strVal}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("") : `<tr><td colspan="${columns.length}" style="text-align: center; padding: 24px; color: #64748b;">No data records found</td></tr>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Hospital Executive Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; color: #0f172a; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
            .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; pt: 8px; font-size: 10px; color: #94a3b8; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${title}</h1>
            <div class="meta">Generated on: ${new Date().toLocaleString()} | Hospital Executive Intelligence System</div>
          </div>
          <table>
            <thead><tr>${tableHeadersHtml}</tr></thead>
            <tbody>${tableRowsHtml}</tbody>
          </table>
          <div class="footer">Confidential Medical Record & Hospital Analytics Document</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
