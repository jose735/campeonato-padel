import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserCircle } from 'lucide-react';
import { createPlayerSchema, type CreatePlayerFormData } from '@/schemas/general-schemas';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

interface PlayerFormProps {
  onSubmit: (input: CreatePlayerFormData) => Promise<void>;
}

export default function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlayerFormData>({
    resolver: zodResolver(createPlayerSchema),
  });

  const onValid = async (data: CreatePlayerFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
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
      <div className="sm:col-span-2">
        <Button type="submit" isLoading={isSubmitting}>
          Agregar jugador
        </Button>
      </div>
    </form>
  );
}