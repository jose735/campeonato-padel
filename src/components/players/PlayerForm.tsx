import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, User, UserCircle, X } from 'lucide-react';
import { createPlayerSchema, type CreatePlayerFormData } from '@/schemas/general-schemas';
import type { Player } from '@/types';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import PlayerAvatar from '@/components/players/PlayerAvatar';

export type PlayerFormSubmitData = CreatePlayerFormData & {
  /** Archivo nuevo a subir (si el usuario eligió uno) */
  photoFile?: File | null;
  /** true si el usuario quitó la foto existente sin elegir otra */
  removePhoto?: boolean;
};

interface PlayerFormProps {
  onSubmit: (input: PlayerFormSubmitData) => Promise<void>;
  /** Si se pasa, el formulario entra en modo edición */
  initialData?: Player | null;
  onCancel?: () => void;
}

export default function PlayerForm({
  onSubmit,
  initialData = null,
  onCancel,
}: PlayerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreatePlayerFormData>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
    },
  });

  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');

  // Cuando cambia el jugador a editar, rellenar el formulario y resetear foto
  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        nickname: initialData.nickname ?? '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        nickname: '',
      });
    }
    setPhotoFile(null);
    setPreviewUrl(null);
    setPhotoError(null);
    setRemoveExistingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [initialData, reset]);

  // Revocar object URL al desmontar o cambiar preview
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError(null);
    setRemoveExistingPhoto(false);

    if (!file) {
      setPhotoFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Formato no permitido. Usá JPG, PNG o WebP.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('La imagen no puede superar los 2 MB.');
      e.target.value = '';
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (initialData?.photoUrl) {
      setRemoveExistingPhoto(true);
    }
  };

  const onValid = async (data: CreatePlayerFormData) => {
    setIsSubmitting(true);
    setPhotoError(null);
    try {
      await onSubmit({
        ...data,
        photoFile: photoFile ?? undefined,
        removePhoto: removeExistingPhoto && !photoFile,
      });
      if (!isEditing) {
        reset();
        setPhotoFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setRemoveExistingPhoto(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setPhotoError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showExistingPhoto =
    !previewUrl && !removeExistingPhoto && Boolean(initialData?.photoUrl);

  const avatarPlayer: Pick<Player, 'firstName' | 'lastName' | 'displayName' | 'photoUrl'> = {
    firstName: watchedFirstName || initialData?.firstName || '?',
    lastName: watchedLastName || initialData?.lastName || '?',
    displayName: initialData?.displayName ?? 'Jugador',
    photoUrl: previewUrl ?? (showExistingPhoto ? initialData?.photoUrl : undefined),
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="grid gap-4 sm:grid-cols-2">
      {/* Foto */}
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Foto del jugador
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <PlayerAvatar player={avatarPlayer} size="lg" enablePreview />

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={Camera}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl || showExistingPhoto ? 'Cambiar foto' : 'Agregar foto'}
              </Button>
              {(previewUrl || showExistingPhoto) && (
                <Button type="button" variant="ghost" icon={X} onClick={clearPhoto}>
                  Quitar
                </Button>
              )}
            </div>
            <p className="text-sm text-neutral-400">JPG, PNG o WebP. Máximo 2 MB.</p>
            {photoError && <p className="text-sm text-danger-600">{photoError}</p>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <TextField
        label="Nombre"
        icon={User}
        error={errors.firstName?.message}
        {...register('firstName')}
      />
      <TextField
        label="Apellido"
        icon={User}
        error={errors.lastName?.message}
        {...register('lastName')}
      />
      <div className="sm:col-span-2">
        <TextField
          label="Apodo"
          icon={UserCircle}
          hint="Opcional. Si se completa, se muestra en lugar del nombre completo."
          error={errors.nickname?.message}
          {...register('nickname')}
        />
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Guardar cambios' : 'Agregar jugador'}
        </Button>

        {isEditing && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
