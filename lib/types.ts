export interface ReviewRatings {
  atmosphere: number;    // 整体氛围 1-5
  timeValue: number;     // 时间投入合理性 1-5
  activity: number;      // 活动质量 1-5
  management: number;    // 管理层水平 1-5
  newbieFriendly: number; // 零基础友好度 1-5
}

export interface Review {
  id: string;
  anonymous: boolean;
  content: string;
  ratings: ReviewRatings;
  createdAt: string;
  enrollYear?: number;
  likes?: number;
  verified?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  titleEn?: string;
  date: string;
  description: string;
  descriptionEn?: string;
  participants: number;
}

export interface SocialMedia {
  wechat?: string;
  xiaohongshu?: string;
  douyin?: string;
  weibo?: string;
}

export interface ClubProfile {
  perform: number;    // 1-5
  creative: number;   // 1-5
  sport: number;      // 1-5
  academic: number;   // 1-5
  social: number;     // 1-5
  hours: number;      // weekly hours requirement
  role: string[];     // ['leader', 'executor', 'member']
  vibe: 'energetic' | 'professional' | 'warm';
  schedule: 'regular' | 'flexible' | 'casual';
}

export interface Club {
  id: string;
  name: string;
  nameEn?: string;
  category: '文艺' | '体育' | '学术' | '公益' | '科技';
  description: string;
  descriptionEn?: string;
  tags: string[];
  memberCount: number;
  weeklyHours: number;
  rating: number;
  coverImage?: string;
  president?: string;
  presidentContact?: string;
  activities: Activity[];
  reviews: Review[];
  socialMedia?: SocialMedia;
  profile: ClubProfile;
}

export interface QuizAnswers {
  social: number;
  creative: number;
  perform: number;
  sport: number;
  academic: number;
  schedule: 'regular' | 'flexible' | 'casual' | null;
  hours: number;
  role: 'leader' | 'executor' | 'member' | null;
  vibe: 'energetic' | 'professional' | 'warm' | null;
}

export interface StudentProfile {
  interests: string[];
  skills: string[];
  weeklyHoursAvailable: number;
  goals: string[];
  preferredCategories: string[];
}

export interface MatchResult {
  club: Club;
  score: number;
  reason: string;
}
