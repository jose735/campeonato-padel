import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white shadow-sm ${className ?? ''}`}>
      {(title || description) && (
        <div className="border-b border-neutral-100 px-5 py-4 sm:px-6">
          {title && <h3 className="text-base font-semibold text-neutral-800">{title}</h3>}
          {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}