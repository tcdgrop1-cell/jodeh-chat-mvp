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
    <div className="rounded-[1.8rem] border border-white/10 bg-[#0f151c]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6">
      <div className={`flex items-start justify-between gap-4 ${rtl ? 'text-right' : 'text-left'}`}>
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#25d366]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">{i18n.secure}</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">{rtl ? nameAr : nameEn}</h2>
          <p className="mt-1 text-sm text-white/45">{i18n.hierarchyId}</p>
        </div>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-sm font-medium text-[#06110a] transition hover:bg-[#45e07b]"
        >
          <Copy className="h-4 w-4" />
          {copied ? i18n.copied : i18n.copyId}
        </button>
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-[#0b1118] p-4 font-mono text-sm tracking-[0.14em] text-[#9dffbd] sm:text-base">
        {formatHierarchyId(hierarchyId)}
      </div>
    </div>
  );
}
