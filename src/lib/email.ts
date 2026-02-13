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
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;padding:30px 0"><tr><td align="center">
<!-- Outer card — red gradient with gold border -->
<table width="280" cellpadding="0" cellspacing="0" style="max-width:280px;width:100%"><tr>
<td style="background-color:#C41E3A;border-radius:20px;padding:2px;overflow:hidden;border:2px solid #FACC15">
<!-- Inner content -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#8B0000;border-radius:18px">
<!-- Decorative corners -->
<tr><td style="padding:8px 12px 0"><table width="100%"><tr>
<td align="left" style="color:#FACC15;font-size:16px;opacity:0.8">&#10022;</td>
<td align="right" style="color:#FACC15;font-size:16px;opacity:0.8">&#10022;</td>
</tr></table></td></tr>
<!-- Lucky number content -->
<tr><td align="center" style="padding:16px 20px">
<p style="color:#FDE68A;font-size:11px;font-weight:600;margin:0 0 6px;letter-spacing:2px;opacity:0.8">S\u1ed0 MAY M\u1eaeN</p>
<p style="color:#FDE68A;font-size:48px;font-weight:900;margin:0;letter-spacing:6px;text-shadow:0 2px 8px rgba(0,0,0,0.5)">${luckyNumber}</p>
<div style="width:64px;height:2px;background-color:#FACC15;margin:10px auto;opacity:0.4;border-radius:2px"></div>
<p style="color:#FDE68A;font-size:10px;margin:0;opacity:0.6">&#128052; B\u00ednh Ng\u1ecd 2026 \u2014 V\u1ea1n S\u1ef1 Nh\u01b0 \u00dd</p>
</td></tr>
<!-- Bottom decorative corners -->
<tr><td style="padding:0 12px 8px"><table width="100%"><tr>
<td align="left" style="color:#FACC15;font-size:16px;opacity:0.8">&#10022;</td>
<td align="right" style="color:#FACC15;font-size:16px;opacity:0.8">&#10022;</td>
</tr></table></td></tr>
</table></td></tr></table>
<!-- Below card — info text -->
<table width="280" cellpadding="0" cellspacing="0" style="max-width:280px;width:100%"><tr>
<td align="center" style="padding:16px 20px 0">
<p style="color:#D4D4D4;font-size:13px;margin:0 0 4px">&#128231; \u0110\u00e3 g\u1eedi \u0111\u1ebfn <span style="color:#FDE68A;font-weight:600">${email}</span></p>
<p style="color:#A3A3A3;font-size:11px;margin:0 0 16px">Gi\u1eef l\u1ea1i s\u1ed1 n\u00e0y! Ch\u00fang t\u00f4i s\u1ebd quay x\u1ed5 s\u1ed1 gi\u1ea3i <span style="color:#4ADE80;font-weight:700">$100</span> &#127882;</p>
<p style="color:#737373;font-size:10px;margin:0">Doanh nghi\u1ec7p: <strong style="color:#A3A3A3">${businessName}</strong></p>
<p style="color:#737373;font-size:10px;margin:4px 0 0">C\u1ea7n\u0110\u1ecba Ch\u1ec9 \u2014 <a href="https://candiachi.com" style="color:#FDE68A">candiachi.com</a></p>
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
