import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

/**
 * Build the complete lì xì email HTML.
 * Uses table-based layout with inline styles for maximum email client compatibility.
 * Dark mode protection via forced background-color and color on key elements.
 */
function buildLixiEmailHtml(email: string, luckyNumber: string, businessName: string): string {
    return `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<!--[if mso]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (prefers-color-scheme: dark) {
  .dark-bg { background-color: #111111 !important; }
  .card-bg { background: linear-gradient(135deg, #C41E3A 0%, #8B0000 50%, #C41E3A 100%) !important; }
  .gold-text { color: #FDE68A !important; }
  .gold-border { border-color: rgba(250,204,21,0.6) !important; }
  .light-text { color: #D4D4D4 !important; }
  .muted-text { color: #A3A3A3 !important; }
  .dim-text { color: #737373 !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:Arial,Helvetica,sans-serif" class="dark-bg">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#111111" class="dark-bg">
<tr><td align="center" style="padding:30px 10px">

<!-- Card container -->
<table width="224" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:20px;border:2px solid rgba(250,204,21,0.6);overflow:hidden" class="gold-border">
<tr><td align="center" style="background:linear-gradient(135deg,#C41E3A 0%,#8B0000 50%,#C41E3A 100%);padding:24px 16px;border-radius:18px" class="card-bg">

<!-- Corner decorations -->
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="left" style="color:#FACC15;font-size:18px;opacity:0.8;padding-bottom:4px" class="gold-text">&#10022;</td>
<td align="right" style="color:#FACC15;font-size:18px;opacity:0.8;padding-bottom:4px" class="gold-text">&#10022;</td>
</tr>
</table>

<!-- Label -->
<p style="color:#FDE68A;font-size:12px;font-weight:500;letter-spacing:2px;margin:0 0 4px;opacity:0.8" class="gold-text">SO MAY MAN</p>

<!-- Lucky Number -->
<p style="color:#FDE68A;font-size:48px;font-weight:900;letter-spacing:6px;line-height:1;margin:0" class="gold-text">${luckyNumber}</p>

<!-- Divider -->
<table width="64" cellpadding="0" cellspacing="0" role="presentation" style="margin:8px auto">
<tr><td style="height:2px;background-color:#FACC15;opacity:0.4;border-radius:2px"></td></tr>
</table>

<!-- Blessings -->
<p style="color:#FEF9C3;font-size:12px;opacity:0.6;margin:0 0 2px" class="gold-text">Binh Ngo 2026</p>
<p style="color:#FEF9C3;font-size:12px;opacity:0.6;margin:0 0 1px" class="gold-text">An Khang Thinh Vuong</p>
<p style="color:#FEF9C3;font-size:12px;opacity:0.6;margin:0" class="gold-text">Van Su Nhu Y</p>

<!-- Bottom corners -->
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="left" style="color:#FACC15;font-size:18px;opacity:0.8;padding-top:4px" class="gold-text">&#10022;</td>
<td align="right" style="color:#FACC15;font-size:18px;opacity:0.8;padding-top:4px" class="gold-text">&#10022;</td>
</tr>
</table>

</td></tr>
</table>

<!-- Info text below card -->
<table width="224" cellpadding="0" cellspacing="0" role="presentation" style="max-width:224px;width:100%">
<tr><td align="center" style="padding:16px 20px 0">
<p style="color:#D4D4D4;font-size:13px;margin:0 0 4px" class="light-text">&#128231; Da gui den <span style="color:#FDE68A;font-weight:600" class="gold-text">${email}</span></p>
<p style="color:#A3A3A3;font-size:11px;margin:0 0 16px" class="muted-text">Giu lai so nay! Chung toi se quay xo so giai <span style="color:#4ADE80;font-weight:700">$100</span> &#127882;</p>
<p style="color:#737373;font-size:10px;margin:0" class="dim-text">Doanh nghiep: <strong style="color:#A3A3A3">${businessName}</strong></p>
<p style="color:#737373;font-size:10px;margin:4px 0 0" class="dim-text">CanDiaChi — <a href="https://candiachi.com" style="color:#FDE68A" class="gold-text">candiachi.com</a></p>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}

export async function sendLixiEmail(email: string, luckyNumber: string, businessName: string) {
    const htmlBody = buildLixiEmailHtml(email, luckyNumber, businessName);

    const info = await transporter.sendMail({
        from: `"CanDiaChi" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `So May Man Cua Ban — CanDiaChi`,
        text: `So may man cua ban: ${luckyNumber}`,
        html: htmlBody,
    });

    return info;
}
