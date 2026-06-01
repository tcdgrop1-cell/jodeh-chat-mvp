import {
  Archive,
  Camera,
  CircleDashed,
  UsersRound,
  Filter,
  MessageCircleMore,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Users,
  Video,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChatKind, Language } from '../lib/types';

interface ChatItem {
  id: string;
  kind: ChatKind;
  nameAr: string;
  nameEn: string;
  previewAr: string;
  previewEn: string;
  time: string;
  unread?: number;
  muted?: boolean;
  pinned?: boolean;
  accent: string;
}

const chats: ChatItem[] = [
  {
    id: '1',
    kind: 'group',
    nameAr: 'مجموعة الجوده',
    nameEn: 'Jodeh Group',
    previewAr: 'تمت إضافة الاسم الجديد إلى القائمة',
    previewEn: 'A new name was added to the list',
    time: '09:42',
    unread: 4,
    pinned: true,
    accent: 'from-emerald-400 via-teal-400 to-cyan-300',
  },
  {
    id: '2',
    kind: 'dm',
    nameAr: 'أحمد العزي',
    nameEn: 'Ahmed Al-Azi',
    previewAr: 'أرسل لي النسخة الجديدة بعد التعديل',
    previewEn: 'Send me the updated version',
    time: '08:17',
    unread: 1,
    accent: 'from-fuchsia-400 via-pink-400 to-amber-300',
  },
  {
    id: '3',
    kind: 'channel',
    nameAr: 'قناة التحديثات',
    nameEn: 'Updates Channel',
    previewAr: 'تم نشر واجهة التسجيل المحدثة',
    previewEn: 'Updated registration UI published',
    time: 'أمس',
    muted: true,
    accent: 'from-sky-400 via-cyan-300 to-emerald-300',
  },
  {
    id: '4',
    kind: 'group',
    nameAr: 'عائلة الجوده',
    nameEn: 'Jodeh Family',
    previewAr: 'الجد والأب والاسم أصبحت كتابة مباشرة',
    previewEn: 'Grandfather, father, and name are now text fields',
    time: '07:05',
    unread: 8,
    accent: 'from-amber-300 via-orange-400 to-rose-400',
  },
  {
    id: '5',
    kind: 'dm',
    nameAr: 'سارة',
    nameEn: 'Sara',
    previewAr: 'هل نجعل الألوان أفخم وأكثر هدوءًا؟',
    previewEn: 'Should we make the colors more luxurious and calm?',
    time: '06:48',
    accent: 'from-violet-400 via-indigo-400 to-sky-300',
  },
  {
    id: '6',
    kind: 'channel',
    nameAr: 'مجتمع الأعضاء',
    nameEn: 'Members Community',
    previewAr: 'الواجهة الآن أقرب لواتساب مع طابع داكن فخم',
    previewEn: 'The UI is now closer to WhatsApp with a premium dark tone',
    time: '05:11',
    muted: true,
    accent: 'from-lime-300 via-emerald-400 to-teal-300',
  },
];

const tabs = [
  { id: 'chats', labelAr: 'الدردشات', labelEn: 'Chats', icon: MessageCircleMore },
  { id: 'updates', labelAr: 'التحديثات', labelEn: 'Updates', icon: CircleDashed },
  { id: 'communities', labelAr: 'المجتمعات', labelEn: 'Communities', icon: UsersRound },
  { id: 'calls', labelAr: 'المكالمات', labelEn: 'Calls', icon: Phone },
] as const;

const filters = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: null },
  { id: 'unread', labelAr: 'غير المقروءة', labelEn: 'Unread', icon: Filter },
  { id: 'groups', labelAr: 'المجموعات', labelEn: 'Groups', icon: Users },
  { id: 'archived', labelAr: 'الأرشيف', labelEn: 'Archived', icon: Archive },
] as const;

type FilterKey = (typeof filters)[number]['id'];
type TabKey = (typeof tabs)[number]['id'];

export function ChatShell({ language }: { language: Language }) {
  const rtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<TabKey>('chats');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const visibleChats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chats.filter((chat) => {
      if (activeTab !== 'chats') return true;
      if (activeFilter === 'unread' && !chat.unread) return false;
      if (activeFilter === 'groups' && chat.kind !== 'group') return false;
      if (activeFilter === 'archived') return false;
      if (!q) return true;
      const haystack = [chat.nameAr, chat.nameEn, chat.previewAr, chat.previewEn].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [activeFilter, activeTab, query]);

  const showChats = activeTab === 'chats';

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.1rem] border border-white/10 bg-[#0b1118] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,211,102,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />
      <div className="relative flex h-[860px] flex-col">
        <header className="border-b border-white/10 bg-[#111720]/95 px-4 pb-4 pt-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className={rtl ? 'text-right' : 'text-left'}>
              <p className="text-[11px] uppercase tracking-[0.38em] text-white/40">WhatsApp style</p>
              <h3 className="mt-1 text-[1.95rem] font-semibold tracking-[-0.03em] text-white">
                {rtl ? 'الدردشات' : 'Chats'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-white/85">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-white/10">
                <Camera className="h-4 w-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-white/10">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-[#0d131a] px-4 py-3 shadow-inner shadow-black/10">
            <Search className="h-4 w-4 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={rtl ? 'بحث' : 'Search'}
              className={`w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35 ${rtl ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const selected = activeFilter === filter.id;
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${selected ? 'border-[#25d366] bg-[#25d366]/12 text-[#9dffbd]' : 'border-white/10 bg-white/5 text-white/68 hover:bg-white/5'}`}
                >
                  {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                  {rtl ? filter.labelAr : filter.labelEn}
                </button>
              );
            })}
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden">
          {showChats ? (
            <div className="h-full overflow-y-auto px-2 py-2">
              <div className="space-y-1">
                {visibleChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-[1.35rem] px-3 py-3 text-left transition hover:bg-white/5"
                  >
                    <div className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${chat.accent} p-[2px] shadow-lg shadow-black/25`}>
                      <div className="grid h-full w-full place-items-center rounded-full bg-[#131a22] text-sm font-semibold text-white">
                        {(rtl ? chat.nameAr : chat.nameEn).slice(0, 2)}
                      </div>
                      {chat.pinned ? <span className="absolute -bottom-1 left-0 rounded-full bg-[#25d366] px-1.5 py-0.5 text-[9px] font-semibold text-[#07110d] shadow-lg">{rtl ? 'مثبت' : 'PIN'}</span> : null}
                    </div>

                    <div className={`min-w-0 flex-1 ${rtl ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-medium text-white">{rtl ? chat.nameAr : chat.nameEn}</div>
                          <div className="mt-1 truncate text-[13px] text-white/50">
                            {rtl ? chat.previewAr : chat.previewEn}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2 pl-2 text-[12px] text-white/38">
                          <span>{chat.time}</span>
                          {chat.muted ? <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/45">{rtl ? 'صامت' : 'Muted'}</span> : null}
                        </div>
                      </div>
                    </div>
                    {chat.unread ? (
                      <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#25d366] px-2 text-[11px] font-semibold text-[#051108] shadow-[0_0_0_4px_rgba(37,211,102,0.12)]">
                        {chat.unread}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div className="max-w-sm rounded-[1.8rem] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#25d366]/15 text-[#8df0ad]">
                  {activeTab === 'updates' ? <CircleDashed className="h-6 w-6" /> : activeTab === 'communities' ? <Users className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
                </div>
                <h4 className="mt-4 text-xl font-semibold text-white">
                  {rtl
                    ? activeTab === 'updates'
                      ? 'التحديثات'
                      : activeTab === 'communities'
                        ? 'المجتمعات'
                        : 'المكالمات'
                    : activeTab === 'updates'
                      ? 'Updates'
                      : activeTab === 'communities'
                        ? 'Communities'
                        : 'Calls'}
                </h4>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  {rtl
                    ? 'هذا القسم جاهز بنمط واتساب الداكن مع مساحات نظيفة وألوان فخمة.'
                    : 'This section is ready with a dark WhatsApp-like look and a premium color palette.'}
                </p>
              </div>
            </div>
          )}

          <button className="absolute bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-[#06110a] shadow-[0_18px_45px_rgba(37,211,102,0.35)] transition hover:scale-105">
            <Plus className="h-6 w-6" />
          </button>
        </main>

        <footer className="border-t border-white/10 bg-[#0f151c]/96 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 rounded-[1.25rem] px-2 py-2.5 transition ${selected ? 'text-[#9dffbd]' : 'text-white/45 hover:text-white/72'}`}
                >
                  <Icon className={`h-5 w-5 ${selected ? 'text-[#25d366]' : ''}`} />
                  <span className="text-[11px] font-medium">{rtl ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
}
