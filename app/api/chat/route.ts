import { NextRequest, NextResponse } from 'next/server';
import { mockClubs } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const { message, clubId } = await request.json();
    const club = clubId ? mockClubs.find((c) => c.id === clubId) : null;

    // Simple rule-based responses (replace with actual AI call if API key is available)
    let reply = '';
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('活动') || lowerMsg.includes('event')) {
      reply = club
        ? `${club.name}近期的活动包括：${club.activities.map((a) => a.title).join('、')}。你对哪个活动最感兴趣？`
        : '我们每个社团都有丰富的活动安排，你想了解哪个社团的具体活动？';
    } else if (lowerMsg.includes('时间') || lowerMsg.includes('几小时')) {
      reply = club
        ? `${club.name}每周大约需要投入 ${club.weeklyHours} 小时，主要包括例会和活动时间。`
        : '不同社团的时间投入差异较大，从每周2小时到8小时不等，建议根据自己的课业安排选择。';
    } else if (lowerMsg.includes('加入') || lowerMsg.includes('申请')) {
      reply = club
        ? `想加入${club.name}？你可以点击页面下方的「申请加入」按钮提交申请，我们会在3个工作日内回复。`
        : '你可以在推荐列表中找到感兴趣的社团，点击查看详情后提交申请。';
    } else if (lowerMsg.includes('评分') || lowerMsg.includes('评价')) {
      reply = club
        ? `${club.name}的综合评分是 ${club.rating}/5.0，成员评价总体很积极！`
        : '我们平台上的所有社团都经过真实成员匿名评价，评分客观可靠。';
    } else {
      reply = club
        ? `关于${club.name}，你可以问我活动安排、时间投入、如何加入等问题！`
        : '你好！我是社团匹配助手，可以帮你了解各社团的活动、招新要求等信息，请问有什么想了解的？';
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
