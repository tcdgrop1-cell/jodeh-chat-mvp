import { Archive, CheckCheck, Clock3, Eye, FileAudio2, Image, Mic, Paperclip, Phone, Send, ShieldAlert, SmilePlus, Video, MessageSquareMore } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChatKind, Language } from '../lib/types';
import { t } from '../lib/i18n';

interface Conversation {
  id: string;
  kind: ChatKind;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  unread?: number;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  mine?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  time: string;
}

const conversations: Conversation[] = [
  { id: '1', kind: 'dm', titleAr: 'أحمد العزي', titleEn: 'Ahmed Al-Azi', subtitleAr: 'رسالة خاصة', subtitleEn: 'Direct message', unread: 2 },
  { id: '2', kind: 'group', titleAr: 'مجموعة الحي', titleEn: 'Neighborhood Group', subtitleAr: '256 عضو', subtitleEn: '256 members' },
  { id: '3', kind: 'channel', titleAr: 'قناة الجهود', titleEn: 'Jodeh Broadcast', subtitleAr: 'نشر رسمي', subtitleEn: 'Official broadcast' },
];

const demoMessages: Message[] = [
  { id: 'm1', sender: 'Ahmed', text: 'جاهز نجرب النسخة الجديدة؟', time: '09:12', status: 'read' },
  { id: 'm2', sender: 'You', text: 'نعم، الواجهة أصبحت أفخم وأكثر ترتيبًا الآن.', mine: true, time: '09:13', status: 'read' },
  { id: 'm3', sender: 'Ahmed', text: 'أرسل لي ملف الإعدادات لو سمحت.', time: '09:13', status: 'delivered' },
  { id: 'm4', sender: 'You', text: 'تم الإرسال. المرفق والصوت والصورة مدعومة.', mine: true, time: '09:14', status: 'sent' },
];

export function ChatShell({ language }: { language: Language }) {
  const i18n = useMemo(() => t(language), [language]);
  const rtl = language === 'ar';
  const [activeKind, setActiveKind] = useState<ChatKind>('group');
  const filtered = conversations.filter((item) => item.kind === activeKind);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,16,34,0.94),rgba(4,10,22,0.96))] shadow-[0_30px_120px_rgba(2,8,23,0.55)] backdrop-blur-2xl">
      <div className={`flex items-center justify-between border-b border-white/8 px-5 py-5 sm:px-6 ${rtl ? 'text-right' : 'text-left'}`}>
        <div>
          <div className="text-xs uppercase tracking-[0.34em] text-sky-200/80">{i18n.messagingCore}</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{rtl ? 'مركز المراسلة' : 'Messaging center'}</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200">
          <CheckCheck className="h-4 w-4" /> {i18n.secure}
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <aside className="border-b border-white/8 xl:border-b-0 xl:border-r xl:border-white/8">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-2">
              {([
                ['dm', MessageSquareMore, i18n.directMessage],
                ['group', Archive, i18n.group],
                ['channel', ShieldAlert, i18n.channel],
              ] as const).map(([kind, Icon, label]) => (
                <button
                  key={kind}
                  onClick={() => setActiveKind(kind)}
                  className={`rounded-2xl px-3 py-3 text-xs transition ${activeKind === kind ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  <Icon className="mx-auto mb-1 h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 px-3 pb-4">
            {filtered.map((item) => (
              <button key={item.id} className="w-full rounded-[1.5rem] border border-white/8 bg-white/5 p-4 text-left transition hover:border-sky-400/35 hover:bg-white/8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{language === 'ar' ? item.titleAr : item.titleEn}</div>
                    <div className="mt-1 text-xs text-slate-400">{language === 'ar' ? item.subtitleAr : item.subtitleEn}</div>
                  </div>
                  {item.unread ? <span className="rounded-full bg-sky-400 px-2.5 py-1 text-[11px] font-semibold text-slate-950">{item.unread}</span> : null}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[640px] flex-col border-b border-white/8 xl:border-b-0 xl:border-r xl:border-white/8">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
            <div className={rtl ? 'text-right' : 'text-left'}>
              <div className="text-lg font-semibold text-white">{rtl ? 'مجموعة الحي الراقية' : 'Premium neighborhood group'}</div>
              <div className="text-sm text-slate-400">{i18n.realTime}</div>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <button className="grid h-10 w-10 place-items-center rounded-full border border-white/8 bg-white/5 transition hover:bg-white/10"><Phone className="h-4 w-4" /></button>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-white/8 bg-white/5 transition hover:bg-white/10"><Video className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
            {demoMessages.map((message) => (
              <Bubble key={message.id} message={message} rtl={rtl} i18n={i18n} />
            ))}
          </div>

          <div className="border-t border-white/8 px-4 py-4 sm:px-5">
            <div className="rounded-[1.7rem] border border-white/8 bg-[#071222] p-3">
              <div className="mb-3 flex items-center gap-2 text-slate-400">
                <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><Paperclip className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><Image className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><FileAudio2 className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><SmilePlus className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"><Mic className="h-4 w-4" /></button>
              </div>
              <div className={`flex items-end gap-3 rounded-[1.4rem] border border-white/8 bg-[#0b1728] px-4 py-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                <input
                  placeholder={rtl ? 'اكتب رسالة، أو أرسل صورة/صوت/ملف...' : 'Write a message or send an image, audio, or file...'}
                  className={`min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 ${rtl ? 'text-right' : 'text-left'}`}
                />
                <button className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <Send className="h-4 w-4" /> {rtl ? 'إرسال' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="bg-white/3 p-5 sm:p-6">
          <div className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-sky-200/80">{i18n.privacy}</div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
              <p>{rtl ? 'حظر المستخدمين، البلاغات، واسترجاع الحساب أصبحت جزءًا من طبقة الأمان والخصوصية.' : 'Block users, reporting, and account recovery are part of the privacy and safety layer.'}</p>
              <p>{rtl ? 'التصميم يجمع بين بساطة واتساب وقابلية التوسع على نمط تيليجرام مع محاذاة RTL دقيقة.' : 'The design blends WhatsApp simplicity with Telegram-scale structure and precise RTL alignment.'}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-sky-200/80">{rtl ? 'إجراءات الأمان' : 'Safety actions'}</div>
            <div className="mt-3 space-y-2">
              <ActionItem icon={ShieldAlert} label={rtl ? 'حظر المستخدم' : 'Block user'} />
              <ActionItem icon={Clock3} label={rtl ? 'استرجاع الحساب' : 'Account recovery'} />
              <ActionItem icon={Eye} label={rtl ? 'إشعارات القراءة' : 'Read receipts'} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Bubble({ message, rtl, i18n }: { message: Message; rtl: boolean; i18n: ReturnType<typeof t> }) {
  const statusIcon =
    message.status === 'read' ? <CheckCheck className="h-4 w-4" /> : message.status === 'delivered' ? <CheckCheck className="h-4 w-4 opacity-70" /> : <Clock3 className="h-4 w-4" />;

  return (
    <div className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-[1.6rem] px-4 py-3 shadow-lg ${message.mine ? 'bg-sky-400 text-slate-950' : 'border border-white/8 bg-white/5 text-white'}`}>
        <div className="mb-1 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em] opacity-70">
          <span>{message.sender}</span>
          <span>{message.time}</span>
        </div>
        <p className={`text-sm leading-7 ${rtl ? 'text-right' : 'text-left'}`}>{message.text}</p>
        <div className={`mt-2 flex items-center gap-1 text-[11px] ${message.mine ? 'justify-end text-slate-950/80' : 'text-slate-400'}`}>
          {statusIcon}
          <span>{message.mine ? (message.status === 'read' ? i18n.read : message.status === 'delivered' ? i18n.delivered : i18n.sent) : ''}</span>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ icon: Icon, label }: { icon: typeof ShieldAlert; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#071222] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-[#0b1728]">
      <Icon className="h-4 w-4 text-sky-300" />
      <span>{label}</span>
    </button>
  );
}
