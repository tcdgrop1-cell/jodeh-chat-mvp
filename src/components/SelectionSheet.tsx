import { Check, X } from 'lucide-react';
import { useEffect } from 'react';

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
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[80] transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <button
        type="button"
        aria-label="Close selection sheet"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-2 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full max-w-2xl overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#071222] shadow-[0_-30px_120px_rgba(2,8,23,0.65)] transition-all duration-300 sm:rounded-[2rem] ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
            <div className={rtl ? 'text-right' : 'text-left'}>
              <div className="text-[11px] uppercase tracking-[0.34em] text-sky-200/80">Select</div>
              <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[72vh] overflow-y-auto p-3 sm:p-4">
            <div className="space-y-2">
              {items.map((item) => {
                const selected = item.value === selectedValue;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onSelect(item.value)}
                    className={`flex w-full items-center justify-between gap-4 rounded-[1.4rem] border px-4 py-4 text-start transition duration-200 ${selected ? 'border-sky-400/40 bg-sky-400/10 shadow-[0_18px_50px_rgba(56,189,248,0.10)]' : 'border-white/8 bg-white/5 hover:border-white/16 hover:bg-white/8'}`}
                  >
                    <div className={rtl ? 'text-right' : 'text-left'}>
                      <div className="text-base font-medium text-white">{item.title}</div>
                      {item.subtitle ? <div className="mt-1 text-sm leading-6 text-slate-400">{item.subtitle}</div> : null}
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      {selected ? <Check className="h-5 w-5 text-sky-300" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
