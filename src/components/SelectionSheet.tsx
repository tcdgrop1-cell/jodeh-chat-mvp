import { Check, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export interface SelectionItem {
  value: string;
  title: string;
  subtitle?: string;
}

interface Props {
  open: boolean;
  rtl: boolean;
  title: string;
  subtitle?: string;
  items: SelectionItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectionSheet({ open, rtl, title, subtitle, items, selectedValue, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      setQuery('');
    };
  }, [open, onClose]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => [item.title, item.subtitle ?? '', item.value].join(' ').toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-[80] transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label="Close selection sheet"
        onClick={onClose}
        className={`absolute inset-0 bg-black/65 backdrop-blur-[8px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-2 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full max-w-2xl overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#0f151c] shadow-[0_-30px_120px_rgba(0,0,0,0.7)] transition-all duration-300 sm:rounded-[2rem] ${open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-white/12" />

          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className={rtl ? 'text-right' : 'text-left'}>
              <p className="text-[11px] uppercase tracking-[0.34em] text-white/40">Select</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm leading-6 text-white/50">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[#0b1118] px-4 py-3">
              <Search className="h-4 w-4 text-white/38" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={rtl ? 'بحث' : 'Search'}
                className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 ${rtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <div className="max-h-[68vh] overflow-y-auto p-3 sm:p-4">
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const selected = item.value === selectedValue;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onSelect(item.value)}
                    className={`flex w-full items-center justify-between gap-4 rounded-[1.4rem] border px-4 py-4 text-start transition duration-200 ${selected ? 'border-[#25d366]/40 bg-[#25d366]/10 shadow-[0_18px_50px_rgba(37,211,102,0.12)]' : 'border-white/10 bg-white/5 hover:border-white/10 hover:bg-white/5'}`}
                  >
                    <div className={rtl ? 'text-right' : 'text-left'}>
                      <div className="text-base font-medium text-white">{item.title}</div>
                      {item.subtitle ? <div className="mt-1 text-sm leading-6 text-white/50">{item.subtitle}</div> : null}
                    </div>
                    <div className="flex items-center gap-2 text-white/75">
                      {selected ? <Check className="h-5 w-5 text-[#25d366]" /> : null}
                    </div>
                  </button>
                );
              })}

              {filteredItems.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm leading-7 text-white/45">
                  {rtl ? 'لا توجد نتائج مطابقة. يمكن إضافة قيمة جديدة مباشرةً من الحقل.' : 'No results found. A new value can be added directly from the field.'}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
