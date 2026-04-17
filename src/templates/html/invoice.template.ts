import { buildDomesticInvoiceHTML } from './domestic-invoice.template';
import { buildExportInvoiceHTML } from './export-invoice.template';
import { buildSalesInvoiceHTML } from './sales-invoice.template';

export { buildDomesticInvoiceHTML, buildExportInvoiceHTML, buildSalesInvoiceHTML };

/**
 * Main selector for Invoice HTML templates
 */
export const buildInvoiceHTML = (data: any): string => {
  if (data.category === 'EXPORT') {
    return buildExportInvoiceHTML(data);
  }
  if (data.category === 'TAX_INVOICE') {
    return buildDomesticInvoiceHTML(data);
  }
  return buildDomesticInvoiceHTML(data);
};

