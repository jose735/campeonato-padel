import { forwardRef, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
  hint?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, icon: Icon, hint, className, ...props }, ref) => {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border px-3 py-2.5 text-neutral-800 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 lg:py-2 ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-danger-400 bg-danger-50/40'
                : 'border-neutral-300 bg-white hover:border-neutral-400'
            } ${className ?? ''}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-neutral-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
export default TextField;