import nodemailer from 'nodemailer';
import { downloadFileFromSupabase } from '../config/supabase';

// Shared email transporter instance
export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send quotation email with PDF attachment
 */
export const sendQuotationEmail = async (
  quotation: any,
  pdfURL: string = '',
) => {
  const qtnNumber = quotation.quotation_number || quotation.id?.slice(-8).toUpperCase() || 'NEW';
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const acceptUrl = `${baseUrl}/api/v1/quotations/respond/${quotation.id}?action=accepted`;
  const rejectUrl = `${baseUrl}/api/v1/quotations/respond/${quotation.id}?action=rejected`;
  const pdfPath = `quotations/2025/QTN-${quotation.id}.pdf`;

  const attachments = [];
  try {
    if (pdfPath) {
      const fileData = await downloadFileFromSupabase(pdfPath, 'quotations');
      const buffer = Buffer.from(await fileData.arrayBuffer());

      attachments.push({
        filename: `quotation-${qtnNumber}.pdf`,
        content: buffer,
        contentType: 'application/pdf'
      });
    }
  } catch (error) {
    console.error('Error attaching PDF to email:', error);
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 25px 15px !important; }
          .details-card { padding: 15px !important; }
          .button-stack { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
          .button-container { padding: 0 !important; }
          .action-table { border-spacing: 0 !important; }
          .action-table td { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
          .header h1 { font-size: 22px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="background-color: #f3f4f6; padding: 20px 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 35px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Solarica Energy</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Powering a Greener Tomorrow</p>
          </div>
  
          <!-- Content -->
          <div class="content" style="padding: 40px 30px;">
            <h2 style="color: #111827; margin: 0 0 16px; font-size: 22px; font-weight: 700;">Quotation Proposal</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">Dear <strong>${quotation.companyName}</strong>,</p>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">We are pleased to share your customized solar solution proposal. Our team has designed this system to provide maximum efficiency and long-term savings for your energy needs.</p>
            
            <!-- Details Card -->
            <div class="details-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 35px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">Quotation Number</td>
                  <td style="padding-bottom: 12px; text-align: right; font-weight: 600; color: #1e293b;">QTN-${qtnNumber}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; font-size: 14px;">System Capacity</td>
                  <td style="padding-bottom: 12px; text-align: right; font-weight: 600; color: #1e293b;">${quotation.systemCapacityKw} KWp</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding-top: 15px; color: #1e293b; font-size: 16px; font-weight: 700;">Net Investment</td>
                  <td style="padding-top: 15px; text-align: right; font-size: 20px; font-weight: 800; color: #10b981;">₹${quotation.netPayableAmount?.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
  
            <!-- Main Action -->
            <div style="text-align: center; margin-bottom: 35px;">
              <a href="${pdfURL}" 
                 style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                View Detailed Quotation
              </a>
            </div>
  
            <!-- Response Actions -->
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; text-align: center;">
              <p style="margin: 0 0 16px; font-weight: 600; color: #92400e; font-size: 15px;">How would you like to proceed?</p>
              <table class="action-table" style="width: 100%; border-collapse: separate; border-spacing: 12px 0;">
                <tr>
                  <td style="width: 50%;" class="button-stack">
                    <a href="${acceptUrl}" 
                       style="display: block; background-color: #10b981; color: #ffffff; padding: 14px 10px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
                      Accept Quotation
                    </a>
                  </td>
                  <td style="width: 50%;" class="button-stack">
                    <a href="${rejectUrl}" 
                       style="display: block; background-color: #ef4444; color: #ffffff; padding: 14px 10px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
                      Reject / Revision
                    </a>
                  </td>
                </tr>
              </table>
            </div>
          </div>
  
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="margin: 0; color: #6b7280; font-size: 13px;">${quotation.fromCompanyName || 'Solarica Energy India Pvt Ltd'}</p>
            <p style="margin: 4px 0 0; color: #9ca3af; font-size: 11px;">© 2025 All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const mailOptions = {
      from: `"Solarica Energy" <${process.env.EMAIL_USER}>`,
      to: quotation.companyEmail,
      subject: `Quotation #${qtnNumber} - Solarica Energy`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending quotation email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send invoice email with PDF attachment
 */
// export const sendInvoiceEmail = async (
//   invoice: any,
//   pdfURL: string = ''
// ) => {
//   const invoiceNumber = invoice.invoiceNumber || invoice.id?.slice(-8).toUpperCase() || 'NEW';

//   const attachments = [];
//   try {
//     if (invoice.pdfFilePath) {
//       const fileData = await downloadFileFromSupabase(invoice.pdfFilePath, 'invoices');
//       const buffer = Buffer.from(await fileData.arrayBuffer());

//       attachments.push({
//         filename: `invoice-${invoiceNumber}.pdf`,
//         content: buffer,
//         contentType: 'application/pdf'
//       });
//     }
//   } catch (error) {
//     console.error('Error attaching Invoice PDF to email:', error);
//   }

//   const currencySymbol = invoice.currency === 'USD' ? '$' : '₹';
//   const isEstimate = invoice.category !== 'TAX_INVOICE';
//   const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
//   const acceptUrl = `${baseUrl}/api/v1/invoices/respond/${invoice.id}?action=accepted`;
//   const rejectUrl = `${baseUrl}/api/v1/invoices/respond/${invoice.id}?action=rejected`;

//   const emailHtml = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <style>
//         .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; }
//         .header { background-color: #1e3a8a; padding: 30px; text-align: center; color: #ffffff; }
//         .content { padding: 30px; color: #374151; line-height: 1.6; }
//         .details { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
//         .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
//         .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
//         .action-button { display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; margin: 0 5px; }
//         .accept-btn { background-color: #10b981; color: #ffffff; }
//         .reject-btn { background-color: #ef4444; color: #ffffff; }
//       </style>
//     </head>
//     <body style="margin: 0; padding: 20px; background-color: #f9fafb;">
//       <div class="container">
//         <div class="header">
//           <h1 style="margin: 0; font-size: 24px;">${isEstimate ? 'Proforma Estimate' : 'Tax Invoice'}</h1>
//         </div>
//         <div class="content">
//           <p>Dear <strong>${invoice.customerName}</strong>,</p>
//           <p>Please find attached the ${isEstimate ? 'estimate' : 'tax invoice'} for your recent transaction with Solarica Energy.</p>
          
//           <div class="details">
//             <table style="width: 100%;">
//               <tr>
//                 <td style="color: #6b7280;">${isEstimate ? 'Estimate Number' : 'Invoice Number'}:</td>
//                 <td style="text-align: right; font-weight: 600;">${invoiceNumber}</td>
//               </tr>
//               <tr>
//                 <td style="color: #6b7280;">Amount Due:</td>
//                 <td style="text-align: right; font-weight: 600;">${currencySymbol}${invoice.grandTotalPayable?.toLocaleString('en-IN')}</td>
//               </tr>
//             </table>
//           </div>

//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${pdfURL}" class="button">View & Download ${isEstimate ? 'Estimate' : 'Invoice'}</a>
//           </div>

//           ${isEstimate ? `
//           <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; text-align: center; margin-top: 20px;">
//             <p style="margin: 0 0 16px; font-weight: 600; color: #92400e; font-size: 15px;">How would you like to proceed?</p>
//             <div style="display: flex; justify-content: center; gap: 10px;">
//               <a href="${acceptUrl}" class="action-button accept-btn">Accept Estimate</a>
//               <a href="${rejectUrl}" class="action-button reject-btn">Reject / Revision</a>
//             </div>
//           </div>
//           ` : ''}

//           <p style="margin-top: 30px;">Thank you for choosing Solarica Energy for your solar solutions.</p>
//         </div>
//         <div class="footer">
//           <p>Solarica Energy India Pvt Ltd<br>Pune, Maharashtra</p>
//           <p>© 2026 All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   const subjectPrefix = isEstimate ? 'Proforma Estimate' : 'Tax Invoice';

//   try {
//     const mailOptions = {
//       from: `"Solarica Energy" <${process.env.EMAIL_USER}>`,
//       to: invoice.customerEmail,
//       subject: `${subjectPrefix} #${invoiceNumber} - Solarica Energy`,
//       html: emailHtml,
//       attachments: attachments.length > 0 ? attachments : undefined
//     };
//     const info = await emailTransporter.sendMail(mailOptions);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('Error sending invoice email:', error);
//     throw new Error('Failed to send invoice email');
//   }
// };

export const sendInvoiceEmail = async (
  invoice: any,
  pdfURL: string = ''
) => {
  const invoiceNumber =
    invoice.invoiceNumber ||
    invoice.id?.slice(-8).toUpperCase() ||
    'NEW';

  const attachments: any[] = [];

  try {
    console.log("📎 Preparing attachment...");

    if (invoice.pdfFilePath) {
      const fileData = await downloadFileFromSupabase(
        invoice.pdfFilePath,
        'invoices'
      );

      const buffer = Buffer.from(await fileData.arrayBuffer());

      attachments.push({
        filename: `invoice-${invoiceNumber}.pdf`,
        content: buffer,
        contentType: 'application/pdf'
      });

      console.log("✅ Attachment ready");
    } else {
      console.log("⚠️ No PDF path found, sending without attachment");
    }
  } catch (error) {
    console.error("❌ Error attaching PDF:", error);
  }

  const currencySymbol = invoice.currency === 'USD' ? '$' : '₹';
  const isEstimate = invoice.category !== 'TAX_INVOICE';

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  const acceptUrl = `${baseUrl}/api/v1/invoices/respond/${invoice.id}?action=accepted`;
  const rejectUrl = `${baseUrl}/api/v1/invoices/respond/${invoice.id}?action=rejected`;

  const subjectPrefix = isEstimate ? 'Proforma Estimate' : 'Tax Invoice';

  const emailHtml = `
    <h2>${subjectPrefix}</h2>
    <p>Dear ${invoice.customerName},</p>
    <p>Please find your ${isEstimate ? 'estimate' : 'invoice'} attached.</p>
    <p><b>Amount:</b> ${currencySymbol}${invoice.grandTotalPayable}</p>
    <br/>
    <a href="${pdfURL}">Download PDF</a>
    <br/><br/>
    ${
      isEstimate
        ? `
      <a href="${acceptUrl}">Accept</a> |
      <a href="${rejectUrl}">Reject</a>
    `
        : ''
    }
  `;

  try {
    console.log("🚀 Email Service Start");

    // 🔥 CHECK transporter
    await emailTransporter.verify();
    console.log("✅ Transporter verified");

    console.log("📧 Sending email to:", invoice.customerEmail);
    console.log("📎 Attachments count:", attachments.length);

    const mailOptions = {
      from: `"Solarica Energy" <${process.env.EMAIL_USER}>`,
      to: invoice.customerEmail,
      subject: `${subjectPrefix} #${invoiceNumber} - Solarica Energy`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId
    };
  } 
  
  catch (error: any) {
  console.error("❌ REAL EMAIL ERROR:", error); // 👈 IMPORTANT

  // 👇 RETURN REAL ERROR MESSAGE
  throw new Error(error.message || "Email sending failed");
}
  // catch (error) {
  //   console.error("❌ EMAIL SERVICE ERROR:", error);
  //   throw new Error("Failed to send invoice email");
  // }
};



/**
 * Send bulk email for marketing
 */
export const sendBulkEmail = async (
  recipientEmails: string[],
  subject: string,
  message: string,
  attachments: Express.Multer.File[] = []
) => {
  const formattedAttachments = attachments.map(file => ({
    filename: file.originalname,
    content: file.buffer,
    contentType: file.mimetype
  }));

  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  for (const email of recipientEmails) {
    try {
      const mailOptions = {
        from: `"Solarica Energy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: message.replace(/\n/g, '<br>'),
        attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined
      };

      await emailTransporter.sendMail(mailOptions);
      results.success.push(email);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      results.failed.push(email);
    }
  }

  return results;
};

