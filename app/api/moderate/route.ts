import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    // Layer 1: Fast rule-based pre-filter
    const bannedPatterns = [
      /fuck|shit|ass|bitch|damn/i,
      /操|草|艹|妈的|傻逼|sb|cnm|wdnmd/i,
      /滚|废物|垃圾|脑残|白痴|智障/i,
    ];

    const hasBanned = bannedPatterns.some((p) => p.test(text));
    if (hasBanned) {
      return NextResponse.json({ pass: false, reason: '评价包含不当词语，请修改后重新提交' });
    }

    if (text.trim().length < 10) {
      return NextResponse.json({ pass: false, reason: '评价内容过短，请补充更多细节' });
    }

    // Layer 2: Claude AI moderation (requires ANTHROPIC_API_KEY and @anthropic-ai/sdk)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `判断以下评价是否包含：粗口骂人、人身攻击、明显虚假信息、或恶意诋毁。只返回 JSON 格式：{"pass": true} 或 {"pass": false, "reason": "原因"}。评价内容：${text}`,
          }],
        });
        const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json(result);
        }
      } catch {
        // If Claude call fails, fall through to pass
      }
    }

    return NextResponse.json({ pass: true });
  } catch {
    return NextResponse.json({ pass: true });
  }
}
