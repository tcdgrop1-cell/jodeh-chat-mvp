import { useMemo, useState } from 'react';
import { MessageCircleMore } from 'lucide-react';
import { ChatShell } from './components/ChatShell';
import { ProfileCard } from './components/ProfileCard';
import { RegistrationWizard } from './components/RegistrationWizard';
import { t } from './lib/i18n';
import type { Language, RegistrationDraft } from './lib/types';
import { buildHierarchyId } from './lib/hierarchy';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const i18n = useMemo(() => t(language), [language]);
  const [completed, setCompleted] = useState<null | (RegistrationDraft & { hierarchyId: string })>(null);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-slate-950">
                <MessageCircleMore className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{i18n.appName}</h1>
                <p className="text-sm text-slate-400">{i18n.tagline}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 p-1 text-sm">
            <button onClick={() => setLanguage('ar')} className={`rounded-full px-4 py-2 transition ${language === 'ar' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'}`}>العربية</button>
            <button onClick={() => setLanguage('en')} className={`rounded-full px-4 py-2 transition ${language === 'en' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'}`}>English</button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <RegistrationWizard
              language={language}
              onLanguageChange={setLanguage}
              onComplete={(draft) => setCompleted(draft)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title="Security" body="Client-side encryption keys and encrypted message payloads are reserved in the schema and frontend design." />
              <InfoCard title="Automation" body="Supabase trigger auto-joins the user to hierarchy-scoped groups immediately after registration." />
            </div>
          </section>

          <section className="space-y-6">
            <ProfileCard
              language={language}
              hierarchyId={completed?.hierarchyId ?? buildHierarchyId({
                language,
                firstNameAr: 'تجريبي',
                firstNameEn: 'Demo',
                lastNameAr: 'مستخدم',
                lastNameEn: 'User',
                countryCode: '967',
                governorateCode: '01',
                districtCode: '01',
                villageCode: '01',
                clanCode: '01',
                titleCode: '01',
                grandfatherCode: '01',
                fatherCode: '01',
                nameCode: '01',
              })}
              nameAr={completed ? `${completed.firstNameAr} ${completed.lastNameAr}` : 'تجريبي مستخدم'}
              nameEn={completed ? `${completed.firstNameEn} ${completed.lastNameEn}` : 'Demo User'}
            />

            <ChatShell language={language} />
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}
