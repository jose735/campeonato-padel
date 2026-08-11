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
        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
        <input
          {...register('firstName')}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.firstName && (
          <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Apellido</label>
        <input
          {...register('lastName')}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.lastName && (
          <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Apodo <span className="text-slate-500">(opcional)</span>
        </label>
        <input
          {...register('nickname')}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.nickname && (
          <p className="text-red-400 text-sm mt-1">{errors.nickname.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 font-medium text-white"
      >
        {isSubmitting ? 'Guardando...' : 'Agregar jugador'}
      </button>
    </form>
  );
}