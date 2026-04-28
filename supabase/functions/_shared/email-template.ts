/**
 * Shared email template for all Instant Appraisal application emails.
 * Produces consistent branded HTML across every Edge Function.
 */

export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface EmailTemplateOptions {
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  showLogo?: boolean;
  footerText?: string;
}

export function buildEmail({ body, ctaText, ctaUrl, showLogo = true, footerText }: EmailTemplateOptions): string {
  const ctaBlock =
    ctaText && ctaUrl
      ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:32px 0 0 0;">
      <tr>
        <td align="left">
          <a href="${ctaUrl}" target="_blank"
             style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:0 24px;line-height:44px;border-radius:6px;mso-padding-alt:0;">
            <!--[if mso]><i style="mso-font-width:300%;mso-text-raise:22pt" hidden>&emsp;</i><![endif]-->
            <span style="mso-text-raise:11pt;">${ctaText}</span>
            <!--[if mso]><i style="mso-font-width:300%" hidden>&emsp;&#8203;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Instant Appraisal</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">
          <!-- Logo -->
          ${showLogo ? `<tr>
            <td style="padding:0 0 32px 0;">
              <img src="https://instantappraisal.co/logo-black.png" alt="InstantAppraisal" width="160" style="display:block;height:auto;max-width:160px;border:0;" />
            </td>
          </tr>` : ''}
          <!-- Body -->
          <tr>
            <td style="font-size:16px;line-height:1.6;color:#333333;">
              ${body}
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:40px 0 0 0;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#9ca3af;">
                ${footerText ?? `You are receiving this because you have an Instant Appraisal account. <a href="https://dashboard.instantappraisal.co/settings" style="color:#9ca3af;text-decoration:underline;">Manage your preferences</a>`}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
