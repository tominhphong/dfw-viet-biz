import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // SSL
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

function buildLixiEmailHtml(luckyNumber: string, email: string, businessName: string): string {
    return `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
body, .body-bg { background-color: #111111 !important; }
.card-outer { background-color: #C41E3A !important; }
.card-inner { background-color: #8B0000 !important; }
.gold-text { color: #FDE68A !important; }
.gold-accent { color: #FACC15 !important; }
.lucky-num { color: #FDE68A !important; font-size: 48px !important; font-weight: 900 !important; }
.info-text { color: #D4D4D4 !important; }
.sub-text { color: #A3A3A3 !important; }
.green-text { color: #4ADE80 !important; }
@media (prefers-color-scheme: dark) {
  body, .body-bg { background-color: #111111 !important; }
  .card-outer { background-color: #C41E3A !important; }
  .card-inner { background-color: #8B0000 !important; }
  .gold-text { color: #FDE68A !important; }
  .gold-accent { color: #FACC15 !important; }
  .lucky-num { color: #FDE68A !important; }
  .info-text { color: #D4D4D4 !important; }
  .sub-text { color: #A3A3A3 !important; }
  .green-text { color: #4ADE80 !important; }
  [data-ogsc] .card-outer { background-color: #C41E3A !important; }
  [data-ogsc] .card-inner { background-color: #8B0000 !important; }
  [data-ogsc] .gold-text { color: #FDE68A !important; }
  [data-ogsc] .lucky-num { color: #FDE68A !important; }
  [data-ogsc] .gold-accent { color: #FACC15 !important; }
  u + .body .card-outer { background-color: #C41E3A !important; }
  u + .body .card-inner { background-color: #8B0000 !important; }
  u + .body .gold-text { color: #FDE68A !important; }
  u + .body .lucky-num { color: #FDE68A !important; }
}
</style>
</head>
<body class="body-bg" style="margin:0;padding:0;background-color:#111111;font-family:Arial,sans-serif">
<div style="display:none;font-size:1px;color:#111111;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">
S\u1ed1 May M\u1eafn c\u1ee7a b\u1ea1n: ${luckyNumber} \u2014 C\u1ea7n\u0110\u1ecbaCh\u1ec9
</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="body-bg" style="background-color:#111111;padding:30px 0"><tr><td align="center">
<!-- Outer card — red with gold border -->
<table width="280" cellpadding="0" cellspacing="0" role="presentation" style="max-width:280px;width:100%"><tr>
<td class="card-outer" style="background-color:#C41E3A;border-radius:20px;padding:2px;overflow:hidden;border:2px solid #FACC15">
<!-- Inner content -->
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card-inner" style="background-color:#8B0000;border-radius:18px">
<!-- Decorative corners -->
<tr><td style="padding:8px 12px 0"><table width="100%" role="presentation"><tr>
<td align="left" class="gold-accent" style="color:#FACC15;font-size:16px">&#10022;</td>
<td align="right" class="gold-accent" style="color:#FACC15;font-size:16px">&#10022;</td>
</tr></table></td></tr>
<!-- Lucky number content -->
<tr><td align="center" style="padding:16px 20px">
<p class="gold-text" style="color:#FDE68A;font-size:11px;font-weight:600;margin:0 0 6px;letter-spacing:2px">S\u1ed0 MAY M\u1eaeN</p>
<p class="lucky-num" style="color:#FDE68A;font-size:48px;font-weight:900;margin:0;letter-spacing:6px;text-shadow:0 2px 8px rgba(0,0,0,0.5)">${luckyNumber}</p>
<div style="width:64px;height:2px;background-color:#FACC15;margin:10px auto;border-radius:2px"></div>
<p class="gold-text" style="color:#FDE68A;font-size:10px;margin:4px 0 0">&#128052; B\u00ednh Ng\u1ecd 2026</p>
<p class="gold-text" style="color:#FDE68A;font-size:10px;margin:2px 0 0">An Khang Th\u1ecbnh V\u01b0\u1ee3ng</p>
<p class="gold-text" style="color:#FDE68A;font-size:10px;margin:2px 0 0">V\u1ea1n S\u1ef1 Nh\u01b0 \u00dd</p>
</td></tr>
<!-- Bottom decorative corners -->
<tr><td style="padding:0 12px 8px"><table width="100%" role="presentation"><tr>
<td align="left" class="gold-accent" style="color:#FACC15;font-size:16px">&#10022;</td>
<td align="right" class="gold-accent" style="color:#FACC15;font-size:16px">&#10022;</td>
</tr></table></td></tr>
</table></td></tr></table>
<!-- Below card — info text -->
<table width="280" cellpadding="0" cellspacing="0" role="presentation" style="max-width:280px;width:100%"><tr>
<td align="center" style="padding:16px 20px 0">
<p class="info-text" style="color:#D4D4D4;font-size:13px;margin:0 0 4px">&#128231; \u0110\u00e3 g\u1eedi \u0111\u1ebfn <span class="gold-text" style="color:#FDE68A;font-weight:600">${email}</span></p>
<p class="sub-text" style="color:#A3A3A3;font-size:11px;margin:0 0 16px">Gi\u1eef l\u1ea1i s\u1ed1 n\u00e0y! Ch\u00fang t\u00f4i s\u1ebd quay x\u1ed5 s\u1ed1 gi\u1ea3i <span class="green-text" style="color:#4ADE80;font-weight:700">$100</span> &#127882;</p>
<p style="color:#737373;font-size:10px;margin:0">Doanh nghi\u1ec7p: <strong class="sub-text" style="color:#A3A3A3">${businessName}</strong></p>
<p style="color:#737373;font-size:10px;margin:4px 0 0">C\u1ea7n\u0110\u1ecba Ch\u1ec9 \u2014 <a href="https://candiachi.com" class="gold-text" style="color:#FDE68A">candiachi.com</a></p>
</td></tr></table>
</td></tr></table></body></html>`;
}

export async function sendLixiEmail(email: string, luckyNumber: string, businessName: string) {
    const htmlBody = buildLixiEmailHtml(luckyNumber, email, businessName);

    const info = await transporter.sendMail({
        from: `"C\u1ea7n\u0110\u1ecbaCh\u1ec9" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `S\u1ed1 May M\u1eafn C\u1ee7a B\u1ea1n \u2014 C\u1ea7n\u0110\u1ecbaCh\u1ec9`,
        text: `S\u1ed1 may m\u1eafn c\u1ee7a b\u1ea1n: ${luckyNumber}`,
        html: htmlBody,
    });

    return info;
}
