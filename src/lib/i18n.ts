import type { Language } from './types';

export const translations = {
  ar: {
    appName: 'جوده شات',
    tagline: 'محادثات خفيفة، سريعة، وآمنة',
    register: 'التسجيل',
    profile: 'الملف الشخصي',
    chats: 'المحادثات',
    groups: 'المجموعات',
    channels: 'القنوات',
    copyId: 'نسخ المعرّف',
    copied: 'تم النسخ',
    hierarchyId: 'المعرّف الهرمي',
    secure: 'تشفير طرف-إلى-طرف جاهز',
    realTime: 'مزامنة فورية عبر Supabase',
    dm: 'رسائل خاصة',
    group: 'مجموعة',
    channel: 'قناة',
    next: 'التالي',
    back: 'السابق',
    createAccount: 'إنشاء الحساب',
  },
  en: {
    appName: 'Jodeh Chat',
    tagline: 'Light, fast, and secure conversations',
    register: 'Register',
    profile: 'Profile',
    chats: 'Chats',
    groups: 'Groups',
    channels: 'Channels',
    copyId: 'Copy ID',
    copied: 'Copied',
    hierarchyId: 'Hierarchy ID',
    secure: 'End-to-end encryption ready',
    realTime: 'Live sync via Supabase',
    dm: 'Direct message',
    group: 'Group',
    channel: 'Channel',
    next: 'Next',
    back: 'Back',
    createAccount: 'Create account',
  },
} as const;

export function t(lang: Language) {
  return translations[lang];
}
