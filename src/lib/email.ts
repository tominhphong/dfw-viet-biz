import nodemailer from 'nodemailer';
import satori from 'satori';
import sharp from 'sharp';
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
 * Generate the lucky number card as a PNG image buffer.
 * Uses satori (JSX→SVG) + sharp (SVG→PNG).
 * This approach is immune to Gmail dark mode color inversion.
 */
async function generateLuckyCardImage(luckyNumber: string): Promise<Buffer> {
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
                    width: '280px',
                    height: '260px',
                    background: 'linear-gradient(135deg, #C41E3A 0%, #8B0000 50%, #C41E3A 100%)',
                    borderRadius: '20px',
                    border: '2px solid #FACC15',
                    position: 'relative' as const,
                    fontFamily: 'Inter',
                    padding: '16px 20px',
                },
            },
            // Top-left corner
            React.createElement('div', {
                style: { position: 'absolute' as const, top: '8px', left: '14px', color: '#FACC15', fontSize: '16px', opacity: 0.8 },
            }, '✦'),
            // Top-right corner
            React.createElement('div', {
                style: { position: 'absolute' as const, top: '8px', right: '14px', color: '#FACC15', fontSize: '16px', opacity: 0.8 },
            }, '✦'),
            // Bottom-left corner
            React.createElement('div', {
                style: { position: 'absolute' as const, bottom: '8px', left: '14px', color: '#FACC15', fontSize: '16px', opacity: 0.8 },
            }, '✦'),
            // Bottom-right corner
            React.createElement('div', {
                style: { position: 'absolute' as const, bottom: '8px', right: '14px', color: '#FACC15', fontSize: '16px', opacity: 0.8 },
            }, '✦'),
            // "SỐ MAY MẮN" label
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', marginBottom: '6px', opacity: 0.9 },
            }, 'SỐ MAY MẮN'),
            // Lucky number
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '52px', fontWeight: 900, letterSpacing: '8px', lineHeight: 1 },
            }, luckyNumber),
            // Divider
            React.createElement('div', {
                style: { width: '64px', height: '2px', backgroundColor: '#FACC15', marginTop: '12px', marginBottom: '10px', opacity: 0.5, borderRadius: '2px' },
            }),
            // Year
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '10px', opacity: 0.7, marginBottom: '2px' },
            }, '🐴 Bính Ngọ 2026'),
            // Blessing 1
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '10px', opacity: 0.7, marginBottom: '1px' },
            }, 'An Khang Thịnh Vượng'),
            // Blessing 2
            React.createElement('div', {
                style: { color: '#FDE68A', fontSize: '10px', opacity: 0.7 },
            }, 'Vạn Sự Như Ý')
        ),
        {
            width: 280,
            height: 260,
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

    // Convert SVG to PNG using sharp (2x for retina)
    const pngBuffer = await sharp(Buffer.from(svg))
        .resize(560, 520)
        .png()
        .toBuffer();

    return pngBuffer;
}

function buildLixiEmailHtml(email: string, businessName: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#111111;padding:30px 0"><tr><td align="center">
<!-- Lucky number card as image — immune to dark mode -->
<img src="cid:lucky-card" alt="Số May Mắn" width="280" style="display:block;border-radius:20px;max-width:280px;width:100%;height:auto" />
<!-- Below card — info text -->
<table width="280" cellpadding="0" cellspacing="0" role="presentation" style="max-width:280px;width:100%"><tr>
<td align="center" style="padding:16px 20px 0">
<p style="color:#D4D4D4;font-size:13px;margin:0 0 4px">&#128231; \u0110\u00e3 g\u1eedi \u0111\u1ebfn <span style="color:#FDE68A;font-weight:600">${email}</span></p>
<p style="color:#A3A3A3;font-size:11px;margin:0 0 16px">Gi\u1eef l\u1ea1i s\u1ed1 n\u00e0y! Ch\u00fang t\u00f4i s\u1ebd quay x\u1ed5 s\u1ed1 gi\u1ea3i <span style="color:#4ADE80;font-weight:700">$100</span> &#127882;</p>
<p style="color:#737373;font-size:10px;margin:0">Doanh nghi\u1ec7p: <strong style="color:#A3A3A3">${businessName}</strong></p>
<p style="color:#737373;font-size:10px;margin:4px 0 0">C\u1ea7n\u0110\u1ecba Ch\u1ec9 \u2014 <a href="https://candiachi.com" style="color:#FDE68A">candiachi.com</a></p>
</td></tr></table>
</td></tr></table></body></html>`;
}

export async function sendLixiEmail(email: string, luckyNumber: string, businessName: string) {
    // Generate the card as a PNG image
    const cardImageBuffer = await generateLuckyCardImage(luckyNumber);

    const htmlBody = buildLixiEmailHtml(email, businessName);

    const info = await transporter.sendMail({
        from: `"C\u1ea7n\u0110\u1ecbaCh\u1ec9" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `S\u1ed1 May M\u1eafn C\u1ee7a B\u1ea1n \u2014 C\u1ea7n\u0110\u1ecbaCh\u1ec9`,
        text: `S\u1ed1 may m\u1eafn c\u1ee7a b\u1ea1n: ${luckyNumber}`,
        html: htmlBody,
        attachments: [
            {
                filename: 'lucky-card.png',
                content: cardImageBuffer,
                cid: 'lucky-card',
            },
        ],
    });

    return info;
}
