import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        // Extract business info from Supabase webhook payload
        const { record } = payload;
        const { name, category, submitter_email, city, phone, created_at } = record;

        // Format message with better Unicode support
        const message = `
🆕 *Doanh Nghiệp Mới\\!*

📋 *Tên:* ${escapeMarkdown(name)}
🏷️ *Danh mục:* ${escapeMarkdown(category)}
📍 *Thành phố:* ${escapeMarkdown(city || 'N/A')}
📧 *Email:* ${escapeMarkdown(submitter_email || 'N/A')}
📱 *Phone:* ${escapeMarkdown(phone || 'N/A')}

👉 [Xem chi tiết trên Admin](https://candiachi.com/admin)
        `.trim();

        // Send to Telegram
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'MarkdownV2',
                    disable_web_page_preview: false,
                }),
            }
        );

        const result = await telegramResponse.json();

        if (!telegramResponse.ok) {
            console.error('Telegram API error:', result);
            throw new Error(`Telegram API failed: ${JSON.stringify(result)}`);
        }

        return NextResponse.json({ success: true, telegram_result: result });
    } catch (error) {
        console.error('Telegram notification failed:', error);
        // Don't fail the webhook - just log the error
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 200 }); // Return 200 so Supabase doesn't retry
    }
}

// Escape special characters for Telegram MarkdownV2
function escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
