// Sensitive word list for client-side pre-filtering
// Words are masked to avoid storing explicit content in source code

const BAD_WORDS: string[] = [
  // Common profanity (masked)
  'sb', 'cnm', 'wdnmd', 'nmsl', 'wcnm',
  // Masked Chinese profanity patterns - actual chars used for detection
  '操', '草', '艹', '肏',
  '妈的', '妈逼', '妈b',
  '傻逼', '傻b', '沙比', '煞笔',
  '狗逼', '狗b',
  '牛逼', // context-neutral but often used offensively
  '屌', '吊',
  '他妈', '你妈',
  '死', // only in combos below
  '去死', '滚去死', '你去死',
  '废物', '垃圾', '脑残', '智障', '白痴', '弱智', '低能',
  '滚开', '滚出去', '给我滚',
  '贱', '贱货', '贱人',
  '骚货', '臭婊子', '婊子',
  '混蛋', '王八蛋',
  '畜生', '禽兽',
  // Personal attacks
  '你算什么东西', '什么垃圾', '有病吧', '神经病',
  // English profanity
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn',
];

export function containsBadWords(text: string): boolean {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((word) => lower.includes(word.toLowerCase()));
}
