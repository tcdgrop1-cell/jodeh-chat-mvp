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
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(hierarchyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">{i18n.secure}</span>
          </div>
          <h2 className="text-2xl font-semibold">{language === 'ar' ? nameAr : nameEn}</h2>
          <p className="mt-1 text-sm text-slate-400">{i18n.hierarchyId}</p>
        </div>
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400">
          <Copy className="h-4 w-4" />
          {copied ? i18n.copied : i18n.copyId}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-950/80 p-4 font-mono text-lg tracking-[0.18em] text-emerald-300">
        {formatHierarchyId(hierarchyId)}
      </div>
    </div>
  );
}
