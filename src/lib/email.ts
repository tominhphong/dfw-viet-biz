import nodemailer from 'nodemailer';
import satori from 'satori';
import React from 'react';

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
 * Generate the lucky number card as an SVG string.
 * Uses satori (JSX→SVG) — no native dependencies needed.
 * Embedded as CID image attachment, immune to Gmail dark mode.
 */
async function generateLuckyCardSvg(luckyNumber: string): Promise<string> {
    // Fetch a font for rendering
    const fontData = await fetch(
        'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff'
    ).then((res) => res.arrayBuffer());

    const svg = await satori(
        React.createElement(
            'div',
            {
                style: {
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '224px',
                    height: '240px',
                    background: 'linear-gradient(135deg, #C41E3A 0%, #8B0000 50%, #C41E3A 100%)',
                    borderRadius: '20px',
                    border: '2px solid rgba(250,204,21,0.6)',
                    position: 'relative' as const,
                    fontFamily: 'Inter',
                    padding: '16px 20px',
                },
            },
            // Top-left corner
            React.createElement('div', {
                style: { position: 'absolute' as const, top: '8px', left: '8px', color: '#FACC15', fontSize: '18px', opacity: 0.8 },
            }, '✦'),
            // Top-right corner
            React.createElement('div', {
                style: { position: 'absolute' as const, top: '8px', right: '8px', color: '#FACC15', fontSize: '18px', opacity: 0.8 },
            }, '✦'),
            // Bottom-left corner
            React.createElement('div', {
                style: { position: 'absolute' as const, bottom: '8px', left: '8px', color: '#FACC15', fontSize: '18px', opacity: 0.8 },
            }, '✦'),
            // Bottom-right corner
            React.createElement('div', {
                style: { position: 'absolute' as const, bottom: '8px', right: '8px', color: '#FACC15', fontSize: '18px', opacity: 0.8 },
            }, '✦'),
            // "SỐ MAY MẮN" label
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '12px', fontWeight: 500, letterSpacing: '2px', marginBottom: '4px', opacity: 0.8 },
            }, 'SO MAY MAN'),
            // Lucky number
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '48px', fontWeight: 900, letterSpacing: '6px', lineHeight: 1 },
            }, luckyNumber),
            // Divider
            React.createElement('div', {
                style: { width: '64px', height: '2px', backgroundColor: '#FACC15', marginTop: '8px', marginBottom: '8px', opacity: 0.4, borderRadius: '2px' },
            }),
            // Year
            React.createElement('div', {
                style: { color: '#FEF9C3', fontSize: '12px', opacity: 0.6, marginBottom: '2px' },
            }, 'Binh Ngo 2026'),
            // Blessing 1
            React.createElement('div', {
                style: { color: '#FEF9C3', fontSize: '12px', opacity: 0.6, marginBottom: '1px' },
            }, 'An Khang Thinh Vuong'),
            // Blessing 2
            React.createElement('div', {
                style: { color: '#FEF9C3', fontSize: '12px', opacity: 0.6 },
            }, 'Van Su Nhu Y')
        ),
        {
            width: 224,
            height: 240,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 400,
                    style: 'normal' as const,
                },
            ],
        }
    );

    return svg;
}

function buildLixiEmailHtml(email: string, luckyNumber: string, businessName: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#111111;padding:30px 0"><tr><td align="center">
<!-- Lucky number card as image — immune to dark mode -->
<img src="cid:lucky-card" alt="So May Man ${luckyNumber}" width="224" style="display:block;border-radius:20px;max-width:224px;width:100%;height:auto" />
<!-- Below card — info text -->
<table width="224" cellpadding="0" cellspacing="0" role="presentation" style="max-width:224px;width:100%"><tr>
<td align="center" style="padding:16px 20px 0">
<p style="color:#D4D4D4;font-size:13px;margin:0 0 4px">&#128231; Da gui den <span style="color:#FDE68A;font-weight:600">${email}</span></p>
<p style="color:#A3A3A3;font-size:11px;margin:0 0 16px">Giu lai so nay! Chung toi se quay xo so giai <span style="color:#4ADE80;font-weight:700">$100</span> &#127882;</p>
<p style="color:#737373;font-size:10px;margin:0">Doanh nghiep: <strong style="color:#A3A3A3">${businessName}</strong></p>
<p style="color:#737373;font-size:10px;margin:4px 0 0">CanDiaChi — <a href="https://candiachi.com" style="color:#FDE68A">candiachi.com</a></p>
</td></tr></table>
</td></tr></table></body></html>`;
}

export async function sendLixiEmail(email: string, luckyNumber: string, businessName: string) {
    // Generate the card as SVG (no native deps — works on Vercel)
    const svgString = await generateLuckyCardSvg(luckyNumber);
    const svgBuffer = Buffer.from(svgString, 'utf-8');

    const htmlBody = buildLixiEmailHtml(email, luckyNumber, businessName);

    const info = await transporter.sendMail({
        from: `"CanDiaChi" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `So May Man Cua Ban — CanDiaChi`,
        text: `So may man cua ban: ${luckyNumber}`,
        html: htmlBody,
        attachments: [
            {
                filename: 'lucky-card.svg',
                content: svgBuffer,
                contentType: 'image/svg+xml',
                cid: 'lucky-card',
            },
        ],
    });

    return info;
}
