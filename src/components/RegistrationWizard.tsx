import { Check, ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { buildHierarchyId, normalizeDigits } from '../lib/hierarchy';
import { COUNTRIES, EDUCATION_OPTIONS, GENDER_OPTIONS, type SelectOption } from '../lib/locations';
import { t } from '../lib/i18n';
import type { Language, RegistrationDraft } from '../lib/types';

interface Props {
  language: Language | null;
  onLanguageSelect: (language: Language) => void;
  onComplete: (draft: RegistrationDraft & { hierarchyId: string }) => void;
}

const draftStorageKey = 'jodeh-chat-registration-draft';

const defaultDraft: RegistrationDraft = {
  language: 'ar',
  phoneNumber: '',
  quadNameAr: '',
  quadNameEn: '',
  surnameAr: '',
  surnameEn: '',
  ageOrDob: '',
  gender: '',
  educationLevel: '01',
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

const steps = ['language', 'identity', 'demographics', 'country', 'governorate', 'district', 'village', 'lineage', 'review'] as const;
type StepKey = (typeof steps)[number];

function getCountry(code: string) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}

function optionLabel(option: SelectOption, lang: Language) {
  return lang === 'ar' ? option.labelAr : option.labelEn;
}

function storageDraft() {
  if (typeof window === 'undefined') return defaultDraft;
  try {
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<RegistrationDraft>;
    return { ...defaultDraft, ...parsed };
  } catch {
    return defaultDraft;
  }
}

export function RegistrationWizard({ language, onLanguageSelect, onComplete }: Props) {
  const activeLanguage = language ?? 'ar';
  const i18n = useMemo(() => t(activeLanguage), [activeLanguage]);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RegistrationDraft>(() => ({ ...storageDraft(), language: activeLanguage }));

  const currentCountry = getCountry(draft.countryCode);
  const currentGovernorate = currentCountry.governorates.find((item) => item.code === draft.governorateCode) ?? currentCountry.governorates[0];
  const currentDistrict = currentGovernorate.districts.find((item) => item.code === draft.districtCode) ?? currentGovernorate.districts[0];

  const hierarchyId = buildHierarchyId({
    countryCode: draft.countryCode,
    governorateCode: draft.governorateCode,
    districtCode: draft.districtCode,
    villageCode: draft.villageCode,
    clanCode: draft.clanCode,
    titleCode: draft.titleCode,
    grandfatherCode: draft.grandfatherCode,
    fatherCode: draft.fatherCode,
    nameCode: draft.nameCode,
  });

  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch {
      // ignore storage failures
    }
  }, [draft]);

  useEffect(() => {
    setDraft((prev) => ({ ...prev, language: activeLanguage }));
  }, [activeLanguage]);

  useEffect(() => {
    setDraft((prev) => {
      const country = getCountry(prev.countryCode);
      if (country.governorates.some((item) => item.code === prev.governorateCode)) return prev;
      const nextGovernorate = country.governorates[0];
      return {
        ...prev,
        governorateCode: nextGovernorate?.code ?? '01',
        districtCode: nextGovernorate?.districts[0]?.code ?? '01',
        villageCode: nextGovernorate?.districts[0]?.villages[0]?.code ?? '01',
      };
    });
  }, [draft.countryCode]);

  useEffect(() => {
    setDraft((prev) => {
      const country = getCountry(prev.countryCode);
      const governorate = country.governorates.find((item) => item.code === prev.governorateCode) ?? country.governorates[0];
      if (governorate?.districts.some((item) => item.code === prev.districtCode)) return prev;
      const nextDistrict = governorate?.districts[0];
      return {
        ...prev,
        districtCode: nextDistrict?.code ?? '01',
        villageCode: nextDistrict?.villages[0]?.code ?? '01',
      };
    });
  }, [draft.governorateCode, draft.countryCode]);

  useEffect(() => {
    setDraft((prev) => {
      const country = getCountry(prev.countryCode);
      const governorate = country.governorates.find((item) => item.code === prev.governorateCode) ?? country.governorates[0];
      const district = governorate?.districts.find((item) => item.code === prev.districtCode) ?? governorate?.districts[0];
      if (district?.villages.some((item) => item.code === prev.villageCode)) return prev;
      return {
        ...prev,
        villageCode: district?.villages[0]?.code ?? '01',
      };
    });
  }, [draft.districtCode, draft.governorateCode, draft.countryCode]);

  const update = <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const back = () => setStep((current) => Math.max(current - 1, 0));

  const selectClass = 'w-full rounded-2xl border border-white/10 bg-[#071222] px-4 py-3.5 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20';
  const inputClass = 'w-full rounded-2xl border border-white/10 bg-[#071222] px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20';

  const syncIdentityFields = () => {
    setDraft((prev) => ({
      ...prev,
      quadNameEn: prev.quadNameEn || prev.quadNameAr,
      quadNameAr: prev.quadNameAr || prev.quadNameEn,
      surnameEn: prev.surnameEn || prev.surnameAr,
      surnameAr: prev.surnameAr || prev.surnameEn,
    }));
  };

  const canContinue = (() => {
    switch (steps[step]) {
      case 'language':
        return true;
      case 'identity':
        return Boolean(draft.phoneNumber.trim() && (draft.quadNameAr.trim() || draft.quadNameEn.trim()) && (draft.surnameAr.trim() || draft.surnameEn.trim()));
      case 'demographics':
        return Boolean(draft.ageOrDob.trim() && draft.educationLevel && draft.gender);
      case 'country':
        return Boolean(draft.countryCode);
      case 'governorate':
        return Boolean(draft.governorateCode);
      case 'district':
        return Boolean(draft.districtCode);
      case 'village':
        return Boolean(draft.villageCode);
      case 'lineage':
        return Boolean(draft.clanCode.trim() && draft.titleCode.trim() && draft.grandfatherCode.trim() && draft.fatherCode.trim());
      case 'review':
        return Boolean(draft.nameCode.trim());
    }
  })();

  const renderSelect = (label: string, key: keyof RegistrationDraft, options: SelectOption[]) => (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <select value={draft[key]} onChange={(e) => update(key, e.target.value as RegistrationDraft[typeof key])} className={selectClass}>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {optionLabel(option, activeLanguage)}
          </option>
        ))}
      </select>
    </label>
  );

  const renderInput = (label: string, key: keyof RegistrationDraft, maxLength = 64, type: 'text' | 'tel' = 'text') => (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        value={draft[key]}
        onChange={(e) => update(key, e.target.value as RegistrationDraft[typeof key])}
        onBlur={() => {
          if (key === 'phoneNumber') update('phoneNumber', normalizeDigits(String(draft.phoneNumber), 20));
          if (key === 'quadNameAr' || key === 'quadNameEn' || key === 'surnameAr' || key === 'surnameEn') syncIdentityFields();
        }}
        maxLength={maxLength}
        type={type}
        inputMode={type === 'tel' ? 'tel' : 'text'}
        className={inputClass}
      />
    </label>
  );

  const renderContent = (): React.ReactNode => {
    const stepKey: StepKey = steps[step];

    switch (stepKey) {
      case 'language':
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sky-200">
              <Lock className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3em]">{i18n.lockLanguage}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(['ar', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onLanguageSelect(lang);
                    update('language', lang);
                  }}
                  className={`rounded-[1.75rem] border p-5 text-left transition duration-300 ${draft.language === lang ? 'border-sky-400 bg-sky-400/10 shadow-[0_20px_60px_rgba(14,165,233,0.12)]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}
                >
                  <div className="text-xl font-semibold">{lang === 'ar' ? 'العربية' : 'English'}</div>
                  <div className="mt-2 text-sm text-slate-400">
                    {lang === 'ar' ? 'واجهة من اليمين إلى اليسار' : 'Left-to-right interface'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'identity':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {renderInput(i18n.phoneNumber, 'phoneNumber', 20, 'tel')}
              {renderInput(i18n.quadName, 'quadNameAr', 80)}
              {renderInput(i18n.surname, 'surnameAr', 40)}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderInput('Full quad name (EN)', 'quadNameEn', 80)}
              {renderInput('Surname / title (EN)', 'surnameEn', 40)}
            </div>
          </div>
        );
      case 'demographics':
        return (
          <div className="grid gap-4 md:grid-cols-3">
            {renderInput(i18n.ageOrDob, 'ageOrDob', 32)}
            {renderSelect(i18n.educationLevel, 'educationLevel', EDUCATION_OPTIONS)}
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">{i18n.gender}</span>
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => update('gender', option.code)}
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${draft.gender === option.code ? 'border-sky-400 bg-sky-400/10 text-sky-100' : 'border-white/10 bg-[#071222] text-slate-300 hover:border-white/20'}`}
                  >
                    {activeLanguage === 'ar' ? option.labelAr : option.labelEn}
                  </button>
                ))}
              </div>
            </label>
          </div>
        );
      case 'country':
        return (
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            {renderSelect(i18n.country, 'countryCode', COUNTRIES)}
            <InfoRail title={activeLanguage === 'ar' ? 'اختيار الدولة' : 'Country selection'} body={activeLanguage === 'ar' ? 'اختر الدولة أولاً حتى تتبعها بقية الخيارات الهرمية.' : 'Choose the country first so the rest of the hierarchy follows.'} />
          </div>
        );
      case 'governorate':
        return (
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            {renderSelect(i18n.governorate, 'governorateCode', currentCountry.governorates)}
            <InfoRail title={activeLanguage === 'ar' ? 'المحافظة' : 'Governorate'} body={`${currentCountry.labelAr} / ${currentCountry.labelEn}`} />
          </div>
        );
      case 'district':
        return (
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            {renderSelect(i18n.district, 'districtCode', currentGovernorate.districts)}
            <InfoRail title={activeLanguage === 'ar' ? 'المديرية' : 'District'} body={`${currentGovernorate.labelAr} / ${currentGovernorate.labelEn}`} />
          </div>
        );
      case 'village':
        return (
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            {renderSelect(i18n.village, 'villageCode', currentDistrict.villages)}
            <InfoRail title={activeLanguage === 'ar' ? 'العزلة والقرية' : 'Village / sub-district'} body={`${currentDistrict.labelAr} / ${currentDistrict.labelEn}`} />
          </div>
        );
      case 'lineage':
        return (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {renderInput(i18n.clan, 'clanCode', 2)}
            {renderInput(i18n.title, 'titleCode', 2)}
            {renderInput(i18n.grandfather, 'grandfatherCode', 2)}
            {renderInput(i18n.father, 'fatherCode', 2)}
          </div>
        );
      case 'review':
        return (
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#071222] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {renderInput(i18n.name, 'nameCode', 2)}
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">{activeLanguage === 'ar' ? 'المعرّف الهرمي' : 'Hierarchy ID'}</span>
                  <input value={hierarchyId} readOnly className={inputClass} />
                </label>
              </div>
              <div className="mt-5 rounded-3xl border border-sky-400/25 bg-sky-400/8 p-4">
                <div className="mb-2 flex items-center gap-2 text-sky-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.28em]">{i18n.hierarchyId}</span>
                </div>
                <div className="font-mono text-[1.05rem] tracking-[0.2em] text-white">{hierarchyId}</div>
              </div>
            </div>
            <InfoRail
              title={activeLanguage === 'ar' ? 'مراجعة أخيرة' : 'Final review'}
              body={activeLanguage === 'ar' ? 'بعد الإرسال، سيقوم Supabase بإنشاء الملف الشخصي وربطك تلقائياً بمجموعات الدولة والموقع والعشيرة.' : 'After submit, Supabase creates the profile and auto-joins the relevant hierarchy groups.'}
              footer={
                <button
                  onClick={() => onComplete({ ...draft, language: activeLanguage, hierarchyId })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
                >
                  <Check className="h-4 w-4" />{i18n.createAccount}
                </button>
              }
            />
          </div>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,16,34,0.92),rgba(4,10,22,0.94))] shadow-[0_30px_120px_rgba(2,8,23,0.55)] backdrop-blur-2xl">
      <div className="border-b border-white/8 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.34em] text-sky-200/80">{i18n.registration}</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{activeLanguage === 'ar' ? 'ابدأ التسجيل بشكل أنيق' : 'Start registration elegantly'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {activeLanguage === 'ar'
                ? 'واجهة محسنة تجمع بين السرعة والبساطة مع ترتيب احترافي للبيانات الأساسية والهرمية.'
                : 'A premium flow that keeps the process fast, structured, and visually polished.'}
            </p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right text-xs text-slate-300 md:block">
            {step + 1} / {steps.length}
          </div>
        </div>
        <div className="mt-5 h-1.5 rounded-full bg-white/5">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-white transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="px-6 py-6">{renderContent()}</div>

      <div className="flex items-center justify-between gap-3 border-t border-white/8 px-6 py-5">
        <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> {i18n.back}
        </button>
        {step < steps.length - 1 ? (
          <button onClick={next} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40">
            {i18n.next} <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="text-xs text-slate-400">{activeLanguage === 'ar' ? 'اضغط زر الإنشاء داخل بطاقة المراجعة' : 'Use the create button inside the review card'}</div>
        )}
      </div>
    </div>
  );
}

function InfoRail({ title, body, footer }: { title: string; body: string; footer?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-sky-200/80">{title}</div>
        <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
      </div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}
