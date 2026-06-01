import { MessageSquareMore, Sparkles, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ChatShell } from './components/ChatShell';
import { ProfileCard } from './components/ProfileCard';
import { RegistrationWizard } from './components/RegistrationWizard';
import { buildHierarchyId } from './lib/hierarchy';
import { t } from './lib/i18n';
import type { Language, RegistrationDraft } from './lib/types';

const languageStorageKey = 'jodeh-chat-language';
const profileStorageKey = 'jodeh-chat-profile';

export default function App() {
  const [language, setLanguage] = useState<Language | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(languageStorageKey);
    return stored === 'ar' || stored === 'en' ? stored : null;
  });
  const [profile, setProfile] = useState<null | (RegistrationDraft & { hierarchyId: string })>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(profileStorageKey);
      if (!stored) return null;
      return JSON.parse(stored) as RegistrationDraft & { hierarchyId: string };
    } catch {
      return null;
    }
  });

  const activeLanguage = language ?? 'ar';
  const i18n = useMemo(() => t(activeLanguage), [activeLanguage]);
  const rtl = activeLanguage === 'ar';

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.title = 'جوده شات';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', rtl ? 'جوده شات - واجهة مراسلة داكنة فاخرة مستوحاة من واتساب.' : 'Jodeh Chat - a luxurious WhatsApp-inspired dark messaging interface.');
    }
  }, [activeLanguage, rtl]);

  useEffect(() => {
    if (!language) return;
    window.localStorage.setItem(languageStorageKey, language);
  }, [language]);

  useEffect(() => {
    if (!profile) return;
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  }, [profile]);

  const fallbackProfile = useMemo(
    () =>
      buildHierarchyId({
        countryCode: '967',
        governorateCode: '01',
        districtCode: '01',
        villageCode: '01',
        clanCode: '01',
        titleCode: '01',
        grandfatherCode: '01',
        fatherCode: '01',
        nameCode: '01',
      }),
    [],
  );

  if (!language) {
    return <LanguageGate onSelect={setLanguage} />;
  }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="relative min-h-screen overflow-hidden bg-[#05070c] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,211,102,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.18),transparent_28%),linear-gradient(180deg,#05070c_0%,#070b12_100%)]" />
      <main className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-[#0f151c]/85 px-4 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className={`flex items-center gap-3 ${rtl ? 'text-right' : 'text-left'}`}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#25d366]/12 text-[#9dffbd]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.34em] text-white/38">{i18n.appName}</div>
              <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">{rtl ? 'واجهة مراسلة فخمة مستوحاة من واتساب' : 'Premium WhatsApp-inspired messaging UI'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#25d366]" />
            {rtl ? 'وضع داكن' : 'Dark mode'}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(430px,0.98fr)]">
          <section className="space-y-6">
            <RegistrationWizard language={activeLanguage} onComplete={(draft) => setProfile(draft)} />
          </section>

          <section className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <ProfileCard
              language={activeLanguage}
              hierarchyId={profile?.hierarchyId ?? fallbackProfile}
              nameAr={profile ? profile.quadNameAr || profile.quadNameEn : rtl ? 'اسم رباعي تجريبي' : 'Demo quad name'}
              nameEn={profile ? profile.quadNameEn || profile.quadNameAr : 'Demo quad name'}
            />
            <ChatShell language={activeLanguage} />
          </section>
        </div>
      </main>
    </div>
  );
}

function LanguageGate({ onSelect }: { onSelect: (language: Language) => void }) {
  return (
    <div className="min-h-screen bg-[#05070c] px-4 py-8 text-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-[2rem] border border-white/10 bg-[#0f151c]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:grid-cols-[1.02fr_0.98fr] lg:p-8">
          <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#0b1118] p-6">
            <div className="inline-flex rounded-full border border-[#25d366]/25 bg-[#25d366]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#9dffbd]">
              جوده شات
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              {rtl ? 'تجربة مراسلة داكنة وفخمة بلمسة واتساب' : 'A luxurious dark messaging experience with a WhatsApp feel'}
            </h1>
            <p className="max-w-xl text-base leading-8 text-white/58 sm:text-lg">
              {rtl ? 'اختر اللغة مرة واحدة ثم ادخل إلى واجهة تسجيل ودردشة بسيطة، نظيفة، ومهيأة للجوال.' : 'Choose a language once, then enter a clean, mobile-first registration and chat experience.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => onSelect('ar')} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-right transition hover:border-[#25d366]/30 hover:bg-[#25d366]/12">
                <div className="text-2xl font-semibold text-white">العربية</div>
                <div className="mt-2 text-sm leading-7 text-white/55">واجهة RTL مع طابع هادئ ومميز.</div>
              </button>
              <button onClick={() => onSelect('en')} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:border-[#25d366]/30 hover:bg-[#25d366]/12">
                <div className="text-2xl font-semibold text-white">English</div>
                <div className="mt-2 text-sm leading-7 text-white/55">A clean LTR experience with premium dark styling.</div>
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
            <div className="rounded-[1.55rem] border border-white/10 bg-[#0b1118] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Messaging</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Premium dark shell</h2>
                </div>
                <MessageSquareMore className="h-8 w-8 text-[#25d366]" />
              </div>
              <div className="space-y-3 text-sm leading-7 text-white/58">
                <p>• WhatsApp-like navigation and chat list structure</p>
                <p>• Dark luxury colors with green accents</p>
                <p>• Arabic-first registration flow</p>
                <p>• Combo-style searchable text lists for clan and title</p>
              </div>
              <div className="mt-6 rounded-[1.2rem] border border-[#25d366]/20 bg-[#25d366]/10 px-4 py-3 text-sm text-[#9dffbd]">
                {rtl ? 'الواجهة جاهزة على نمط واتساب مع ألوان أكثر فخامة.' : 'The UI is ready in a WhatsApp-inspired layout with a more luxurious palette.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
