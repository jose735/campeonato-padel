import { useState } from 'react';
import type { Player } from '@/types';
import ImageLightbox from '@/components/ui/ImageLightbox';

interface PlayerAvatarProps {
  player: Pick<Player, 'firstName' | 'lastName' | 'displayName' | 'photoUrl'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Si es true y hay foto, al hacer clic se abre la vista ampliada */
  enablePreview?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
} as const;

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function InitialsFallback({
  firstName,
  lastName,
  sizeClass,
  className,
}: {
  firstName: string;
  lastName: string;
  sizeClass: string;
  className: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-neutral-200 font-semibold text-neutral-600 ${sizeClass} ${className}`}
      aria-hidden
    >
      {initials(firstName, lastName)}
    </div>
  );
}

/**
 * Avatar circular: foto del jugador o iniciales.
 * Si la imagen falla al cargar, cae a iniciales.
 * Con enablePreview, clic abre lightbox (como en detalle de jornada).
 */
export default function PlayerAvatar({
  player,
  size = 'md',
  className = '',
  enablePreview = false,
}: PlayerAvatarProps) {
  const sizeClass = sizeClasses[size];
  const rawUrl = player.photoUrl?.trim() || undefined;
  /** URL que falló al cargar; si cambia rawUrl, deja de coincidir y se reintenta. */
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const showPhoto = Boolean(rawUrl) && failedUrl !== rawUrl;

  if (!showPhoto) {
    return (
      <InitialsFallback
        firstName={player.firstName}
        lastName={player.lastName}
        sizeClass={sizeClass}
        className={className}
      />
    );
  }

  const img = (
    <img
      key={rawUrl}
      src={rawUrl}
      alt={player.displayName}
      onError={() => setFailedUrl(rawUrl ?? null)}
      className={`shrink-0 rounded-full object-cover bg-neutral-200 ${sizeClass} ${
        enablePreview ? '' : className
      }`}
    />
  );

  if (!enablePreview) {
    return <span className={className}>{img}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        className={`shrink-0 overflow-hidden rounded-full border border-neutral-200 shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        aria-label={`Ver foto de ${player.displayName}`}
      >
        {img}
      </button>
      {isPreviewOpen && rawUrl && (
        <ImageLightbox
          src={rawUrl}
          alt={player.displayName}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}
