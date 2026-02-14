import nodemailer from 'nodemailer';
import { ImageResponse } from '@vercel/og';
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
 * Uses next/og ImageResponse (satori + resvg-wasm built-in, no native deps).
 * Renders as PNG image — immune to Gmail dark mode color inversion.
 */
async function generateLuckyCardPng(luckyNumber: string): Promise<Buffer> {
    const element = React.createElement(
        'div',
        {
            style: {
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #C41E3A 0%, #8B0000 50%, #C41E3A 100%)',
                borderRadius: '40px',
                border: '4px solid rgba(250,204,21,0.6)',
                fontFamily: 'sans-serif',
                padding: '32px 40px',
                position: 'relative' as const,
            },
        },
        // Top-left corner
        React.createElement('div', {
            style: { position: 'absolute' as const, top: '16px', left: '16px', color: '#FACC15', fontSize: '36px', opacity: 0.8 },
        }, '\u25C6'),
        // Top-right corner
        React.createElement('div', {
            style: { position: 'absolute' as const, top: '16px', right: '16px', color: '#FACC15', fontSize: '36px', opacity: 0.8 },
        }, '\u25C6'),
        // Bottom-left corner
        React.createElement('div', {
            style: { position: 'absolute' as const, bottom: '16px', left: '16px', color: '#FACC15', fontSize: '36px', opacity: 0.8 },
        }, '\u25C6'),
        // Bottom-right corner
        React.createElement('div', {
            style: { position: 'absolute' as const, bottom: '16px', right: '16px', color: '#FACC15', fontSize: '36px', opacity: 0.8 },
        }, '\u25C6'),
        // "SO MAY MAN" label
        React.createElement('div', {
            style: { color: '#FDE68A', fontSize: '24px', fontWeight: 500, letterSpacing: '4px', marginBottom: '8px', opacity: 0.8, textTransform: 'uppercase' as const },
        }, 'SO MAY MAN'),
        // Lucky number
        React.createElement('div', {
            style: {
                color: '#FDE68A',
                fontSize: '96px',
                fontWeight: 900,
                letterSpacing: '12px',
                lineHeight: 1,
                textShadow: '0 4px 16px rgba(0,0,0,0.5)',
            },
        }, luckyNumber),
        // Divider
        React.createElement('div', {
            style: { width: '128px', height: '4px', backgroundColor: '#FACC15', marginTop: '16px', marginBottom: '16px', opacity: 0.4, borderRadius: '4px' },
        }),
        // Year
        React.createElement('div', {
            style: { color: '#FEF9C3', fontSize: '24px', opacity: 0.6, marginBottom: '4px' },
        }, 'Binh Ngo 2026'),
        // Blessing 1
        React.createElement('div', {
            style: { color: '#FEF9C3', fontSize: '24px', opacity: 0.6, marginBottom: '2px' },
        }, 'An Khang Thinh Vuong'),
        // Blessing 2
        React.createElement('div', {
            style: { color: '#FEF9C3', fontSize: '24px', opacity: 0.6 },
        }, 'Van Su Nhu Y')
    );

    // Render at 2x (448x480) for retina, then email displays at 224x240
    const response = new ImageResponse(element, {
        width: 448,
        height: 480,
    });

    return Buffer.from(await response.arrayBuffer());
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
    // Generate the card as a PNG image (next/og — no native deps, works on Vercel)
    const cardImageBuffer = await generateLuckyCardPng(luckyNumber);

    const htmlBody = buildLixiEmailHtml(email, luckyNumber, businessName);

    const info = await transporter.sendMail({
        from: `"CanDiaChi" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `So May Man Cua Ban — CanDiaChi`,
        text: `So may man cua ban: ${luckyNumber}`,
        html: htmlBody,
        attachments: [
            {
                filename: 'lucky-card.png',
                content: cardImageBuffer,
                contentType: 'image/png',
                cid: 'lucky-card',
            },
        ],
    });

    return info;
}
