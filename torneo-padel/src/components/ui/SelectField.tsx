import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, icon: Icon, className, children, ...props }, ref) => {
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
          <select
            ref={ref}
            className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 lg:py-2 ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-danger-400 bg-danger-50/40'
                : 'border-neutral-300 bg-white hover:border-neutral-400'
            } ${className ?? ''}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
export default SelectField;