import { Copy, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatHierarchyId } from '../lib/hierarchy';
import { t } from '../lib/i18n';
import type { Language } from '../lib/types';

interface Props {
  language: Language;
  hierarchyId: string;
  nameAr: string;
  nameEn: string;
}

export function ProfileCard({ language, hierarchyId, nameAr, nameEn }: Props) {
  const i18n = useMemo(() => t(language), [language]);
  const rtl = language === 'ar';
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(hierarchyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_25px_90px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-6">
      <div className={`flex items-start justify-between gap-4 ${rtl ? 'text-right' : 'text-left'}`}>
        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">{i18n.secure}</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">{rtl ? nameAr : nameEn}</h2>
          <p className="mt-1 text-sm text-slate-400">{i18n.hierarchyId}</p>
        </div>
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400">
          <Copy className="h-4 w-4" />
          {copied ? i18n.copied : i18n.copyId}
        </button>
      </div>

      <div className="mt-4 rounded-[1.6rem] border border-white/8 bg-[#071222] p-4 font-mono text-base tracking-[0.14em] text-emerald-300 sm:text-lg">
        {formatHierarchyId(hierarchyId)}
      </div>
    </div>
  );
}
