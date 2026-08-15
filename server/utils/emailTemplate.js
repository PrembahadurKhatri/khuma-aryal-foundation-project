// Wraps inner HTML in a small branded email shell (deep forest header, ivory
// body, gold accents — matching the site's forest/gilt/cream palette). Used
// by every transactional email sent via utils/sendEmail.js.
const wrapEmail = ({ title, preheader, bodyHtml }) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8f7f2;font-family:Arial,Helvetica,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e2d8;">
            <tr>
              <td style="background:#173b25;padding:22px 28px;">
                <span style="color:#f8f7f2;font-size:16px;font-weight:700;letter-spacing:0.02em;">Khuma Aryal Foundation</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#173b25;">${title}</h1>
                <div style="font-size:14px;line-height:1.7;color:#18241d;">${bodyHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f8f7f2;border-top:1px solid #e6e2d8;">
                <span style="font-size:11px;color:#5f6862;">Khuma Aryal Foundation — Bhirkot Municipality, Syangja, Nepal</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export default wrapEmail;
