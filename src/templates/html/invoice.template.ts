import { buildDomesticInvoiceHTML } from './domestic-invoice.template';
import { buildExportInvoiceHTML } from './export-invoice.template';
import { getPumpTemplate } from './pump';
import { buildSalesInvoiceHTML } from './sales-invoice.template';

export { buildDomesticInvoiceHTML, buildExportInvoiceHTML, buildSalesInvoiceHTML };

/**
 * Main selector for Invoice HTML templates
 */
// export const buildInvoiceHTML = (data: any): string => {
//   if (data.category === 'EXPORT') {
//     return buildExportInvoiceHTML(data);
//   }
//   if (data.category === 'TAX_INVOICE') {
//     return buildDomesticInvoiceHTML(data);
//   }
//   return buildDomesticInvoiceHTML(data);
// };


export const buildInvoiceHTML = (data: any): string => {

  const pumpContent =
    data.category === 'PUMP'
      ? getPumpTemplate(data)
      : '';

  if (data.category === 'EXPORT') {
    return buildExportInvoiceHTML(data);
  }

  return buildDomesticInvoiceHTML({
    ...data,
    pumpContent
  });
};

