import { Fingerprint, MessageSquareQuote, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChatShell } from './components/ChatShell';
import { ProfileCard } from './components/ProfileCard';
import { RegistrationWizard } from './components/RegistrationWizard';
import { buildHierarchyId } from './lib/hierarchy';
import { t } from './lib/i18n';
import type { Language, RegistrationDraft } from './lib/types';

export default function App() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [profile, setProfile] = useState<null | (RegistrationDraft & { hierarchyId: string })>(null);

  const activeLanguage = language ?? 'ar';
  const i18n = useMemo(() => t(activeLanguage), [activeLanguage]);
  const rtl = activeLanguage === 'ar';

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
      <main className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_90px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 via-sky-400 to-white text-slate-950 shadow-lg shadow-sky-500/25">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.38em] text-sky-200/80">{i18n.appName}</div>
                <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">{i18n.tagline}</h1>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeaderChip icon={Fingerprint} title={i18n.hierarchyId} subtitle={rtl ? '19 رقمًا موحدًا' : 'Unified 19 digits'} />
              <HeaderChip icon={ShieldCheck} title={i18n.secure} subtitle={rtl ? 'جاهز للتشفير' : 'Encryption-ready'} />
              <HeaderChip icon={MessageSquareQuote} title={i18n.messagingCore} subtitle={rtl ? 'P2P + Groups + Channels' : 'P2P + Groups + Channels'} />
            </div>
          </div>
          <div className="px-6 py-4 text-sm text-slate-300">
            {rtl
              ? 'اختر بياناتك الأساسية ثم أكمل بقية الهيكل الهرمي. الواجهة ثابتة على اللغة التي اخترتها.'
              : 'Choose your core details first, then continue through the hierarchy. The interface stays locked to your selected language.'}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <section className="space-y-6">
            <RegistrationWizard
              language={language}
              onLanguageSelect={setLanguage}
              onComplete={(draft) => setProfile(draft)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                title={i18n.appearance}
                text={rtl ? 'ألوان عميقة، تباين نظيف، ومسافات مريحة تعطي إحساسًا فاخرًا.' : 'Deep colors, clean contrast, and generous spacing for a premium feel.'}
              />
              <FeatureCard
                title={i18n.privacy}
                text={rtl ? 'تفكير أمني واضح: حظر، بلاغ، واسترجاع الحساب مع سياسات RLS.' : 'Privacy-first design with block/report, account recovery, and RLS-aware data visibility.'}
              />
            </div>
          </section>

          <section className="space-y-6">
            <ProfileCard
              language={activeLanguage}
              hierarchyId={profile?.hierarchyId ?? fallbackProfile}
              nameAr={profile ? profile.quadNameAr : rtl ? 'اسم رباعي تجريبي' : 'Demo Quad Name'}
              nameEn={profile ? profile.quadNameEn : 'Demo Quad Name'}
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
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_35px_120px_rgba(2,8,23,0.45)] backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-sky-100">Jodeh Chat MVP</div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            A premium, polished chat foundation for secure bilingual communities
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Choose a language once, then enter a luxurious onboarding flow with phone number, quad name, and hierarchy-aware profile details.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <button onClick={() => onSelect('ar')} className="rounded-[1.75rem] border border-white/10 bg-[#081225] p-6 text-right transition hover:border-sky-400/40 hover:bg-[#0a152a]">
              <div className="text-2xl font-semibold text-white">العربية</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">واجهة من اليمين إلى اليسار مع دخول فاخر وسريع ومنظم.</div>
            </button>
            <button onClick={() => onSelect('en')} className="rounded-[1.75rem] border border-white/10 bg-[#081225] p-6 text-left transition hover:border-sky-400/40 hover:bg-[#0a152a]">
              <div className="text-2xl font-semibold text-white">English</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">A refined left-to-right experience with fast onboarding and premium visuals.</div>
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
              <p>• Signal-like security posture</p>
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
