import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserCircle } from 'lucide-react';
import { createPlayerSchema, type CreatePlayerFormData } from '@/schemas/general-schemas';
import type { Player } from '@/types';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

interface PlayerFormProps {
  onSubmit: (input: CreatePlayerFormData) => Promise<void>;
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
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlayerFormData>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
    },
  });

  // Cuando cambia el jugador a editar, rellenar el formulario
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
  }, [initialData, reset]);

  const onValid = async (data: CreatePlayerFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="grid gap-4 sm:grid-cols-2">
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