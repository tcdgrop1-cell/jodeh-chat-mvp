import { Fingerprint, MessageSquareQuote, ShieldCheck, Sparkles } from 'lucide-react';
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
      description.setAttribute('content', rtl ? 'جوده شات - تجربة مراسلة فاخرة ومنظمة مع تسجيل ذكي وهيكل هرمي 19 رقمًا.' : 'Jodeh Chat - a premium organized messaging experience with smart registration and a 19-digit hierarchy.');
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
    <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[radial-gradient(circle_at_top,#10264d_0%,#07101f_36%,#030712_100%)] text-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),transparent_35%,rgba(255,255,255,0.02))]" />
      <main className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_90px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className={`flex items-center gap-4 ${rtl ? 'text-right' : 'text-left'}`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 via-sky-400 to-white text-slate-950 shadow-lg shadow-sky-500/25">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.38em] text-sky-200/80">{i18n.appName}</div>
                <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">{i18n.tagline}</h1>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[560px]">
              <HeaderChip icon={Fingerprint} title={i18n.hierarchyId} subtitle={rtl ? '19 رقمًا موحدًا' : 'Unified 19 digits'} />
              <HeaderChip icon={ShieldCheck} title={i18n.secure} subtitle={rtl ? 'جاهز للتشفير' : 'Encryption-ready'} />
              <HeaderChip icon={MessageSquareQuote} title={i18n.messagingCore} subtitle={rtl ? 'P2P + Groups + Channels' : 'P2P + Groups + Channels'} />
            </div>
          </div>
          <div className={`px-5 py-4 text-sm text-slate-300 lg:px-6 ${rtl ? 'text-right' : 'text-left'}`}>
            {rtl
              ? 'اختر بياناتك الأساسية ثم أكمل بقية الهيكل الهرمي. الواجهة ثابتة على اللغة التي اخترتها.'
              : 'Choose your core details first, then continue through the hierarchy. The interface stays locked to your selected language.'}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="space-y-6">
            <RegistrationWizard language={language} onComplete={(draft) => setProfile(draft)} />

            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                title={i18n.appearance}
                text={rtl ? 'ألوان عميقة، تباين نظيف، ومسافات مريحة تعطي إحساسًا فاخرًا.' : 'Deep colors, clean contrast, and generous spacing for a premium feel.'}
              />
              <FeatureCard
                title={i18n.privacy}
                text={rtl ? 'نهج أمني واضح: حظر، بلاغ، واسترجاع حساب مع سياسات رؤية دقيقة.' : 'Privacy-first design with block/report, account recovery, and precise data visibility policies.'}
              />
            </div>
          </section>

          <section className="space-y-6 lg:sticky lg:top-6 lg:self-start">
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10264d_0%,#07101f_36%,#030712_100%)] px-4 py-8 text-slate-50">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_35px_120px_rgba(2,8,23,0.45)] backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-sky-100">جوده شات</div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            تجربة مراسلة فاخرة، مرتبة، وسريعة للمجتمعات الثنائية اللغة
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            اختر اللغة مرة واحدة فقط، ثم ادخل مباشرة إلى تسجيل أنيق يبدأ برقم الهاتف والاسم الرباعي واللقب قبل الهيكل الهرمي.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <button onClick={() => onSelect('ar')} className="rounded-[1.75rem] border border-white/10 bg-[#081225] p-6 text-right transition hover:border-sky-400/40 hover:bg-[#0a152a]">
              <div className="text-2xl font-semibold text-white">العربية</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">واجهة من اليمين إلى اليسار مع دخول فاخر ومنظم.</div>
            </button>
            <button onClick={() => onSelect('en')} className="rounded-[1.75rem] border border-white/10 bg-[#081225] p-6 text-left transition hover:border-sky-400/40 hover:bg-[#0a152a]">
              <div className="text-2xl font-semibold text-white">English</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">A refined left-to-right experience with premium onboarding.</div>
            </button>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_35px_120px_rgba(2,8,23,0.45)] backdrop-blur-2xl">
          <div className="rounded-[2rem] border border-white/10 bg-[#071222] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-sky-200/70">Security • UX • Hierarchy</div>
                <div className="mt-2 text-2xl font-semibold text-white">Premium chat foundation</div>
              </div>
              <ShieldCheck className="h-8 w-8 text-sky-300" />
            </div>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>• WhatsApp-like simplicity</p>
              <p>• Telegram-like scale for groups and channels</p>
              <p>• Clean RTL and LTR rendering</p>
              <p>• 19-digit hierarchy-aware identity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderChip({ icon: Icon, title, subtitle }: { icon: typeof Fingerprint; title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#081225] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/10 text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="text-xs text-slate-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
      <div className="text-sm font-medium uppercase tracking-[0.24em] text-sky-200/80">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}
