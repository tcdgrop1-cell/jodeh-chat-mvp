import { MessageCircle, Hash, Send, Users2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChatKind, Language } from '../lib/types';
import { t } from '../lib/i18n';

interface Room {
  id: string;
  kind: ChatKind;
  titleAr: string;
  titleEn: string;
  lastMessage: string;
  unread?: number;
}

const rooms: Room[] = [
  { id: '1', kind: 'dm', titleAr: 'أحمد', titleEn: 'Ahmed', lastMessage: 'جاهز للتجربة', unread: 2 },
  { id: '2', kind: 'group', titleAr: 'مجموعة القرية', titleEn: 'Village Group', lastMessage: 'تمت إضافة عضو جديد' },
  { id: '3', kind: 'channel', titleAr: 'إعلانات جوده', titleEn: 'Jodeh Announcements', lastMessage: 'تم نشر التحديث الأخير' },
];

export function ChatShell({ language }: { language: Language }) {
  const i18n = useMemo(() => t(language), [language]);
  const [activeKind, setActiveKind] = useState<ChatKind>('group');

  const filteredRooms = rooms.filter((room) => room.kind === activeKind);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {([
            ['dm', MessageCircle, i18n.dm],
            ['group', Users2, i18n.group],
            ['channel', Hash, i18n.channel],
          ] as const).map(([kind, Icon, label]) => (
            <button
              key={kind}
              onClick={() => setActiveKind(kind)}
              className={`rounded-2xl border px-3 py-3 text-xs transition ${activeKind === kind ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-slate-950/60 text-slate-300'}`}
            >
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredRooms.map((room) => (
            <button key={room.id} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-left hover:border-emerald-500/40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{language === 'ar' ? room.titleAr : room.titleEn}</div>
                  <div className="text-xs text-slate-400">{room.lastMessage}</div>
                </div>
                {room.unread ? <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-slate-950">{room.unread}</span> : null}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-semibold">{language === 'ar' ? 'غرفة البث المباشر' : 'Live room'}</h3>
            <p className="text-sm text-slate-400">{i18n.realTime}</p>
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">E2EE ready</div>
        </div>

        <div className="space-y-3">
          <MessageBubble sender={language === 'ar' ? 'النظام' : 'System'} text={language === 'ar' ? 'تم تحميل القناة التجريبية.' : 'Demo channel loaded.'} mine={false} />
          <MessageBubble sender={language === 'ar' ? 'أنت' : 'You'} text={language === 'ar' ? 'الواجهة سريعة وبسيطة.' : 'The interface is clean and minimal.'} mine />
          <MessageBubble sender={language === 'ar' ? 'النظام' : 'System'} text={language === 'ar' ? 'تزامن Supabase جاهز للتوصيل.' : 'Supabase sync is ready to connect.'} mine={false} />
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3">
          <input placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Write a message...'} className="flex-1 bg-transparent outline-none placeholder:text-slate-600" />
          <button className="rounded-full bg-emerald-500 p-3 text-slate-950">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function MessageBubble({ sender, text, mine }: { sender: string; text: string; mine: boolean }) {
  return (
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${mine ? 'ml-auto bg-emerald-500 text-slate-950' : 'bg-slate-950/80 text-slate-100'}`}>
      <div className="mb-1 text-xs opacity-70">{sender}</div>
      <div className="text-sm leading-6">{text}</div>
    </div>
  );
}
