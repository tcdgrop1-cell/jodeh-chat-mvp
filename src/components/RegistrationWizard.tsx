import { Check, ChevronLeft, ChevronRight, Fingerprint, Lock, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildHierarchyId, normalizeDigits } from '../lib/hierarchy';
import { COUNTRIES, EDUCATION_OPTIONS, GENDER_OPTIONS } from '../lib/locations';
import { t } from '../lib/i18n';
import type { Language, RegistrationDraft } from '../lib/types';
import { SelectionSheet, type SelectionItem } from './SelectionSheet';

interface Props {
  language: Language;
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
  clanCode: '',
  titleCode: '',
  grandfatherCode: '',
  fatherCode: '',
  nameCode: '',
};

const steps = ['identity', 'demographics', 'country', 'governorate', 'district', 'village', 'lineage', 'review'] as const;
type StepKey = (typeof steps)[number];
type PickerKind = 'education' | 'gender' | 'country' | 'governorate' | 'district' | 'village';

const clanSuggestions = ['آل سالم', 'آل علي', 'آل أحمد', 'آل حسن', 'بني هاشم', 'بني تميم'];
const titleSuggestions = ['السيد', 'الشيخ', 'الأستاذ', 'الدكتور', 'القاضي', 'الحاج'];

function getCountry(code: string) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
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

function localizeItem(language: Language, primary: string, secondary: string) {
  return language === 'ar'
    ? { title: primary, subtitle: secondary }
    : { title: secondary, subtitle: primary };
}

export function RegistrationWizard({ language, onComplete }: Props) {
  const activeLanguage = language;
  const rtl = activeLanguage === 'ar';
  const i18n = useMemo(() => t(activeLanguage), [activeLanguage]);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RegistrationDraft>(() => ({ ...storageDraft(), language: activeLanguage }));
  const [activePicker, setActivePicker] = useState<PickerKind | null>(null);

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

  const update = <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setMirroredValue = (arKey: 'quadNameAr' | 'surnameAr', enKey: 'quadNameEn' | 'surnameEn', value: string) => {
    setDraft((prev) => ({ ...prev, [arKey]: value, [enKey]: value }));
  };

  const persistDraft = (next: RegistrationDraft) => {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(next));
    } catch {
      // ignore persistence failures
    }
  };

  const next = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const back = () => setStep((current) => Math.max(current - 1, 0));

  const locationOptions = (kind: Exclude<PickerKind, 'education' | 'gender'>): SelectionItem[] => {
    if (kind === 'country') {
      return COUNTRIES.map((country) => ({ value: country.code, ...localizeItem(activeLanguage, country.labelAr, country.labelEn) }));
    }
    if (kind === 'governorate') {
      return currentCountry.governorates.map((item) => ({ value: item.code, ...localizeItem(activeLanguage, item.labelAr, item.labelEn) }));
    }
    if (kind === 'district') {
      return currentGovernorate.districts.map((item) => ({ value: item.code, ...localizeItem(activeLanguage, item.labelAr, item.labelEn) }));
    }
    return currentDistrict.villages.map((item) => ({ value: item.code, ...localizeItem(activeLanguage, item.labelAr, item.labelEn) }));
  };

  const sheetConfig = activePicker
    ? (() => {
        switch (activePicker) {
          case 'education':
            return {
              title: rtl ? 'اختر المستوى الدراسي' : 'Choose education level',
              subtitle: rtl ? 'القائمة على نمط واتساب مع ترتيب واضح وبسيط.' : 'WhatsApp-style list with a clean, native feel.',
              items: EDUCATION_OPTIONS.map((item) => ({ value: item.code, ...localizeItem(activeLanguage, item.labelAr, item.labelEn) })),
              selectedValue: draft.educationLevel,
            };
          case 'gender':
            return {
              title: rtl ? 'اختر الجنس' : 'Choose gender',
              subtitle: rtl ? 'اختيار واحد فقط من القائمة.' : 'Select one option from the list.',
              items: GENDER_OPTIONS.map((item) => ({ value: item.code, ...localizeItem(activeLanguage, item.labelAr, item.labelEn) })),
              selectedValue: draft.gender,
            };
          case 'country':
            return {
              title: rtl ? 'اختر الدولة' : 'Choose country',
              subtitle: rtl ? 'مرتب بأسلوب قائمة واتساب مريحة وسريعة.' : 'Clean, mobile-style list for fast selection.',
              items: locationOptions('country'),
              selectedValue: draft.countryCode,
            };
          case 'governorate':
            return {
              title: rtl ? 'اختر المحافظة' : 'Choose governorate',
              subtitle: rtl ? 'تظهر الخيارات المتاحة داخل الدولة المختارة.' : 'Filtered by the selected country.',
              items: locationOptions('governorate'),
              selectedValue: draft.governorateCode,
            };
          case 'district':
            return {
              title: rtl ? 'اختر المديرية' : 'Choose district',
              subtitle: rtl ? 'القائمة تعرض المديريات المرتبطة بالمحافظة.' : 'Districts tied to the chosen governorate.',
              items: locationOptions('district'),
              selectedValue: draft.districtCode,
            };
          case 'village':
            return {
              title: rtl ? 'اختر العزلة / القرية' : 'Choose village / sub-district',
              subtitle: rtl ? 'قائمة اختيار واضحة ومرتبة.' : 'A clean, native-feel list selection.',
              items: locationOptions('village'),
              selectedValue: draft.villageCode,
            };
        }
      })()
    : null;

  const canContinue = (() => {
    switch (steps[step]) {
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

  const setPickerValue = (kind: PickerKind, value: string) => {
    if (kind === 'education') {
      update('educationLevel', value);
    } else if (kind === 'gender') {
      update('gender', value as RegistrationDraft['gender']);
    } else if (kind === 'country') {
      const selectedCountry = COUNTRIES.find((item) => item.code === value) ?? COUNTRIES[0];
      const nextGovernorate = selectedCountry.governorates[0];
      const nextDistrict = nextGovernorate?.districts[0];
      const nextVillage = nextDistrict?.villages[0];
      setDraft((prev) => ({
        ...prev,
        countryCode: value,
        governorateCode: nextGovernorate?.code ?? prev.governorateCode,
        districtCode: nextDistrict?.code ?? prev.districtCode,
        villageCode: nextVillage?.code ?? prev.villageCode,
      }));
    } else if (kind === 'governorate') {
      const selectedGovernorate = currentCountry.governorates.find((item) => item.code === value) ?? currentCountry.governorates[0];
      const nextDistrict = selectedGovernorate?.districts[0];
      const nextVillage = nextDistrict?.villages[0];
      setDraft((prev) => ({
        ...prev,
        governorateCode: value,
        districtCode: nextDistrict?.code ?? prev.districtCode,
        villageCode: nextVillage?.code ?? prev.villageCode,
      }));
    } else if (kind === 'district') {
      const selectedDistrict = currentGovernorate.districts.find((item) => item.code === value) ?? currentGovernorate.districts[0];
      const nextVillage = selectedDistrict?.villages[0];
      setDraft((prev) => ({
        ...prev,
        districtCode: value,
        villageCode: nextVillage?.code ?? prev.villageCode,
      }));
    } else if (kind === 'village') {
      update('villageCode', value);
    }
    setActivePicker(null);
  };

  const fieldButton = (label: string, value: string, placeholder: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-start transition duration-200 hover:border-sky-400/30 hover:bg-[#0b1728] ${rtl ? 'text-right' : 'text-left'}`}
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-sky-200/75">{label}</div>
        <div className="mt-1 text-base font-medium text-white">{value || placeholder}</div>
      </div>
      <ChevronRight className={`h-5 w-5 shrink-0 text-slate-400 transition ${rtl ? 'rotate-180' : ''}`} />
    </button>
  );

  const renderStep = (): React.ReactNode => {
    switch (steps[step]) {
      case 'identity':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
              <label className="block lg:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">{i18n.phoneNumber}</span>
                <input
                  value={draft.phoneNumber}
                  onChange={(e) => update('phoneNumber', normalizeDigits(e.target.value, 20))}
                  maxLength={20}
                  inputMode="tel"
                  placeholder={i18n.phoneHelper}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>
              <label className="block lg:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">{i18n.quadName}</span>
                <input
                  value={rtl ? draft.quadNameAr : draft.quadNameEn}
                  onChange={(e) => setMirroredValue('quadNameAr', 'quadNameEn', e.target.value)}
                  maxLength={80}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  placeholder={rtl ? 'اكتب الاسم الرباعي' : 'Enter full quad name'}
                />
              </label>
              <label className="block lg:col-span-1">
                <span className="mb-2 block text-sm text-slate-300">{i18n.surname}</span>
                <input
                  value={rtl ? draft.surnameAr : draft.surnameEn}
                  onChange={(e) => setMirroredValue('surnameAr', 'surnameEn', e.target.value)}
                  maxLength={40}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  placeholder={rtl ? 'اكتب اللقب' : 'Enter surname / title'}
                />
              </label>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
              {rtl ? 'سيُستخدم الاسم واللقب المدخلان كأساس للهوية ويظهران بشكل منظم في الملف الشخصي.' : 'The entered name and surname will form the profile identity and appear in a clean, organized layout.'}
            </div>
          </div>
        );
      case 'demographics':
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">{i18n.ageOrDob}</span>
              <input
                value={draft.ageOrDob}
                onChange={(e) => update('ageOrDob', e.target.value)}
                maxLength={32}
                className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                placeholder={rtl ? 'العمر أو تاريخ الميلاد' : 'Age or Date of Birth'}
              />
            </label>
            {fieldButton(i18n.educationLevel, draft.educationLevel ? EDUCATION_OPTIONS.find((option) => option.code === draft.educationLevel)?.[rtl ? 'labelAr' : 'labelEn'] ?? '' : '', rtl ? 'اختر المستوى الدراسي' : 'Choose education level', () => setActivePicker('education'))}
            {fieldButton(i18n.gender, draft.gender ? GENDER_OPTIONS.find((option) => option.code === draft.gender)?.[rtl ? 'labelAr' : 'labelEn'] ?? '' : '', rtl ? 'اختر الجنس' : 'Choose gender', () => setActivePicker('gender'))}
          </div>
        );
      case 'country':
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            {fieldButton(i18n.country, rtl ? currentCountry.labelAr : currentCountry.labelEn, rtl ? 'اختر الدولة' : 'Choose country', () => setActivePicker('country'))}
            <InfoPanel
              title={rtl ? 'مراحل سريعة' : 'Fast flow'}
              body={rtl ? 'القوائم تظهر بنمط واتساب: اخ��يار واضح، حركة سلسة، ثم العودة مباشرة إلى النموذج.' : 'Lists open in a WhatsApp-like sheet: clear choice, smooth motion, then return to the form.'}
            />
          </div>
        );
      case 'governorate':
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            {fieldButton(i18n.governorate, rtl ? currentGovernorate.labelAr : currentGovernorate.labelEn, rtl ? 'اختر المحافظة' : 'Choose governorate', () => setActivePicker('governorate'))}
            <InfoPanel title={rtl ? 'المحافظة المختارة' : 'Selected governorate'} body={`${currentCountry.labelAr} / ${currentCountry.labelEn}`} />
          </div>
        );
      case 'district':
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            {fieldButton(i18n.district, rtl ? currentDistrict.labelAr : currentDistrict.labelEn, rtl ? 'اختر المديرية' : 'Choose district', () => setActivePicker('district'))}
            <InfoPanel title={rtl ? 'المديرية المختارة' : 'Selected district'} body={`${currentGovernorate.labelAr} / ${currentGovernorate.labelEn}`} />
          </div>
        );
      case 'village':
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            {fieldButton(i18n.village, rtl ? currentDistrict.villages.find((v) => v.code === draft.villageCode)?.labelAr ?? '' : currentDistrict.villages.find((v) => v.code === draft.villageCode)?.labelEn ?? '', rtl ? 'اختر العزلة / القرية' : 'Choose village / sub-district', () => setActivePicker('village'))}
            <InfoPanel title={rtl ? 'القرية المختارة' : 'Selected village'} body={`${currentDistrict.labelAr} / ${currentDistrict.labelEn}`} />
          </div>
        );
      case 'lineage':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">{i18n.grandfather}</span>
                <input
                  type="text"
                  value={draft.grandfatherCode}
                  onChange={(e) => update('grandfatherCode', e.target.value)}
                  maxLength={80}
                  placeholder={rtl ? 'اكتب اسم الجد' : 'Enter grandfather name'}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">{i18n.father}</span>
                <input
                  type="text"
                  value={draft.fatherCode}
                  onChange={(e) => update('fatherCode', e.target.value)}
                  maxLength={80}
                  placeholder={rtl ? 'اكتب اسم الأب' : 'Enter father name'}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">{i18n.name}</span>
                <input
                  type="text"
                  value={draft.nameCode}
                  onChange={(e) => update('nameCode', e.target.value)}
                  maxLength={80}
                  placeholder={rtl ? 'اكتب الاسم' : 'Enter name'}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">{i18n.clan}</span>
                <input
                  type="text"
                  list="clan-options"
                  value={draft.clanCode}
                  onChange={(e) => update('clanCode', e.target.value)}
                  maxLength={80}
                  placeholder={rtl ? 'اكتب العصبة أو اختر من القائمة' : 'Type a clan or pick from the list'}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
                <datalist id="clan-options">
                  {clanSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">{i18n.title}</span>
                <input
                  type="text"
                  list="title-options"
                  value={draft.titleCode}
                  onChange={(e) => update('titleCode', e.target.value)}
                  maxLength={80}
                  placeholder={rtl ? 'اكتب اللقب أو اختر من القائمة' : 'Type a title or pick from the list'}
                  className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
                <datalist id="title-options">
                  {titleSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
              {rtl ? 'الجد والأب والاسم تُكتب كتابة مباشرة، بينما العصبة واللقب يمكن اختيارهما من قائمة قابلة للبحث أو إدخال قيمة جديدة.' : 'Grandfather, father, and name are typed directly, while clan and title can be searched in a combo-style list or entered manually.'}
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4 rounded-[1.9rem] border border-white/10 bg-[#071222] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">{i18n.name}</span>
                  <input value={draft.nameCode} onChange={(e) => update('nameCode', e.target.value)} maxLength={80} className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">{rtl ? 'المعرّف الهرمي' : 'Hierarchy ID'}</span>
                  <input value={hierarchyId} readOnly className="w-full rounded-[1.6rem] border border-white/10 bg-[#071222] px-4 py-4 font-mono text-sm tracking-[0.18em] text-slate-100 outline-none" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label={i18n.country} value={rtl ? currentCountry.labelAr : currentCountry.labelEn} />
                <SummaryCard label={i18n.governorate} value={rtl ? currentGovernorate.labelAr : currentGovernorate.labelEn} />
                <SummaryCard label={i18n.district} value={rtl ? currentDistrict.labelAr : currentDistrict.labelEn} />
              </div>

              <div className="rounded-[1.6rem] border border-sky-400/20 bg-sky-400/8 p-4">
                <div className="flex items-center gap-2 text-sky-200">
                  <Fingerprint className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.28em]">{i18n.hierarchyId}</span>
                </div>
                <div className="mt-3 font-mono text-[1.05rem] tracking-[0.18em] text-white">{hierarchyId}</div>
              </div>
            </div>

            <InfoPanel
              title={rtl ? 'مراجعة أخيرة' : 'Final review'}
              body={rtl ? 'بعد الإنشاء، سيتم حفظ الملف الشخصي وربطه تلقائياً بمجموعات الدولة والموقع والهيكل الاجتماعي.' : 'After creation, the profile is saved and linked automatically to the relevant hierarchy groups.'}
              action={
                <button
                  type="button"
                  onClick={() => {
                    const nextDraft = { ...draft, language: activeLanguage, hierarchyId };
                    persistDraft(nextDraft);
                    onComplete(nextDraft);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
                >
                  <Check className="h-4 w-4" /> {i18n.createAccount}
                </button>
              }
            />
          </div>
        );
    }
  };

  return (
    <>
      <div dir={rtl ? 'rtl' : 'ltr'} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,16,34,0.96),rgba(4,10,22,0.98))] shadow-[0_32px_120px_rgba(2,8,23,0.58)] backdrop-blur-2xl">
        <div className="border-b border-white/8 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.36em] text-sky-200/80">{i18n.registration}</div>
              <h2 className={`mt-2 text-2xl font-semibold text-white sm:text-3xl ${rtl ? 'text-right' : 'text-left'}`}>{rtl ? 'ابدأ التسجيل بشكل أنيق ومختصر' : 'Start registration with a clean, premium flow'}</h2>
              <p className={`mt-2 max-w-3xl text-sm leading-7 text-slate-300 ${rtl ? 'text-right' : 'text-left'}`}>
                {rtl
                  ? 'اللغة ثابتة طوال الجلسة، والاختيارات تظهر في قوائم متح��كة شبيهة بواتساب، مع تنظيم واضح ومسافات مريحة.'
                  : 'The selected language stays locked for the entire session, and the choice fields open in WhatsApp-style sheets with clean spacing and smooth motion.'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {step + 1} / {steps.length}
            </div>
          </div>
          <div className="mt-5 h-1.5 rounded-full bg-white/5">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-white transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="px-5 py-6 sm:px-6">{renderStep()}</div>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-5 sm:px-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> {i18n.back}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {i18n.next} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="text-xs text-slate-400">{rtl ? 'استخدم زر الإنشاء داخل بطاقة المراجعة' : 'Use the create button inside the review card'}</div>
          )}
        </div>
      </div>

      {sheetConfig ? (
        <SelectionSheet
          open={Boolean(activePicker)}
          rtl={rtl}
          title={sheetConfig.title}
          subtitle={sheetConfig.subtitle}
          items={sheetConfig.items}
          selectedValue={sheetConfig.selectedValue}
          onSelect={(value) => {
            if (activePicker) setPickerValue(activePicker, value);
          }}
          onClose={() => setActivePicker(null)}
        />
      ) : null}
    </>
  );
}

function InfoPanel({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[1.9rem] border border-white/10 bg-white/5 p-5">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-sky-200/80">{title}</div>
        <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
