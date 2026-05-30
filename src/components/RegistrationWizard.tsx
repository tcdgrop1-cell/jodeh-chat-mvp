import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildHierarchyId } from '../lib/hierarchy';
import { t } from '../lib/i18n';
import type { Language, RegistrationDraft } from '../lib/types';

interface Props {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onComplete: (draft: RegistrationDraft & { hierarchyId: string }) => void;
}

const emptyDraft: RegistrationDraft = {
  language: 'ar',
  firstNameAr: '',
  firstNameEn: '',
  lastNameAr: '',
  lastNameEn: '',
  countryCode: '967',
  governorateCode: '01',
  districtCode: '01',
  villageCode: '01',
  clanCode: '01',
  titleCode: '01',
  grandfatherCode: '01',
  fatherCode: '01',
  nameCode: '01',
};

const steps = [
  'language',
  'name',
  'surname',
  'country',
  'governorate',
  'district',
  'village',
  'clanTitle',
  'review',
] as const;

export function RegistrationWizard({ language, onLanguageChange, onComplete }: Props) {
  const i18n = useMemo(() => t(language), [language]);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RegistrationDraft>({ ...emptyDraft, language });

  const hierarchyId = buildHierarchyId(draft);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const update = <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const field = (label: string, key: keyof RegistrationDraft, maxLength = 2) => (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        value={draft[key]}
        onChange={(e) => update(key, e.target.value)}
        maxLength={maxLength}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-50 outline-none ring-0 transition placeholder:text-slate-600 focus:border-emerald-500"
      />
    </label>
  );

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-slate-300">Choose the interface language / اختر لغة الواجهة</p>
            <div className="grid grid-cols-2 gap-3">
              {(['ar', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    update('language', lang);
                    onLanguageChange(lang);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${draft.language === lang ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-slate-950/60'}`}
                >
                  <div className="text-lg font-semibold">{lang === 'ar' ? 'العربية' : 'English'}</div>
                  <div className="text-sm text-slate-400">{lang === 'ar' ? 'واجهة من اليمين إلى اليسار' : 'Left-to-right interface'}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {field('الاسم الأول بالعربية', 'firstNameAr', 24)}
            {field('First name in English', 'firstNameEn', 24)}
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {field('الاسم الأخير بالعربية', 'lastNameAr', 24)}
            {field('Last name in English', 'lastNameEn', 24)}
          </div>
        );
      case 3:
        return field('Country calling code', 'countryCode', 3);
      case 4:
        return field('Governorate code', 'governorateCode', 2);
      case 5:
        return field('District code', 'districtCode', 2);
      case 6:
        return field('Village / hamlet code', 'villageCode', 2);
      case 7:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {field('Clan code', 'clanCode', 2)}
            {field('Title code', 'titleCode', 2)}
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {field('Grandfather code', 'grandfatherCode', 2)}
              {field('Father code', 'fatherCode', 2)}
              {field('Name code', 'nameCode', 2)}
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <div className="mb-2 font-semibold">Preview</div>
              <div className="font-mono tracking-[0.18em]">{hierarchyId}</div>
              <div className="mt-2 text-slate-200">
                The Supabase trigger uses this ID to auto-attach the user to Country, Governorate, District, Village, Clan, and Title groups.
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{language === 'ar' ? 'معالج التسجيل' : 'Registration wizard'}</h2>
          <p className="text-sm text-slate-400">9 steps to create the hierarchy-aware profile</p>
        </div>
        <div className="text-sm text-slate-400">{step + 1} / {steps.length}</div>
      </div>

      <div className="mb-6 h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      {stepContent()}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> {i18n.back}
        </button>
        {step < steps.length - 1 ? (
          <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950">
            {i18n.next} <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => onComplete({ ...draft, hierarchyId })} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950">
            <Check className="h-4 w-4" /> {i18n.createAccount}
          </button>
        )}
      </div>
    </div>
  );
}
