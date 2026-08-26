import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

/**
 * Vista ampliada de una imagen (mismo patrón que Copa Kolari en JourneyDetail).
 */
export default function ImageLightbox({
  src,
  alt = '',
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa de imagen"
    >
      <div
        className="relative max-h-[90vh] max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-1.5 text-neutral-600 shadow hover:bg-neutral-100"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] w-full rounded-lg object-contain"
        />
      </div>
    </div>
  );
}
