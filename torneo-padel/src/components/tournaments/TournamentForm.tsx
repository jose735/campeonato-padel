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
        <label className="block text-sm font-medium text-neutral-600 mb-1">
          Descripción del torneo
        </label>
        <input
          {...register('description')}
          placeholder="Ej: Torneo Verano 2026"
          className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2.5 lg:py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.description && (
          <p className="text-danger-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-4 py-2.5 lg:py-2 font-medium text-white transition-colors"
      >
        {isSubmitting ? 'Guardando...' : 'Crear torneo'}
      </button>
    </form>
  );
}