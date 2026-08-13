import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlayerSchema, type CreatePlayerFormData } from '@/schemas/general-schemas';

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
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Nombre</label>
        <input
          {...register('firstName')}
          className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2.5 lg:py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.firstName && (
          <p className="text-danger-600 text-sm mt-1">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Apellido</label>
        <input
          {...register('lastName')}
          className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2.5 lg:py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.lastName && (
          <p className="text-danger-600 text-sm mt-1">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">
          Apodo <span className="text-neutral-400">(opcional)</span>
        </label>
        <input
          {...register('nickname')}
          className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2.5 lg:py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.nickname && (
          <p className="text-danger-600 text-sm mt-1">{errors.nickname.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-4 py-2.5 lg:py-2 font-medium text-white transition-colors"
      >
        {isSubmitting ? 'Guardando...' : 'Agregar jugador'}
      </button>
    </form>
  );
}