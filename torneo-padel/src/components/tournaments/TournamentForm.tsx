import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTournamentSchema,
  type CreateTournamentFormData,
} from '@/schemas/general-schemas';

interface TournamentFormProps {
  onSubmit: (input: CreateTournamentFormData) => Promise<void>;
}

export default function TournamentForm({ onSubmit }: TournamentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTournamentFormData>({
    resolver: zodResolver(createTournamentSchema),
  });

  const onValid = async (data: CreateTournamentFormData) => {
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
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Descripción del torneo
        </label>
        <input
          {...register('description')}
          placeholder="Ej: Torneo Verano 2026"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 font-medium text-white"
      >
        {isSubmitting ? 'Guardando...' : 'Crear torneo'}
      </button>
    </form>
  );
}