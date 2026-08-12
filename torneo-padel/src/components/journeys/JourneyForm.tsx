import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createJourneySchema,
  type CreateJourneyFormData,
} from '@/schemas/general-schemas';
import type { Tournament } from '@/types';
import { getTodayDateString } from '@/utils/index'

interface JourneyFormProps {
  tournaments: Tournament[];
  onSubmit: (input: CreateJourneyFormData) => Promise<void>;
}

export default function JourneyForm({ tournaments, onSubmit }: JourneyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateJourneyFormData>({
    resolver: zodResolver(createJourneySchema),
    defaultValues: {
      journeyDate: getTodayDateString(),
      fieldsQuantity: 1,
      scoreLimit: 24,
    },
  });

  const onValid = async (data: CreateJourneyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset({
        journeyDate: getTodayDateString(),
        fieldsQuantity: 1,
        scoreLimit: 24,
        tournamentId: undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Torneo</label>
        <select
          {...register('tournamentId', { valueAsNumber: true })}
          defaultValue=""
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        >
          <option value="" disabled>
            Selecciona un torneo
          </option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.description}
            </option>
          ))}
        </select>
        {errors.tournamentId && (
          <p className="text-red-400 text-sm mt-1">{errors.tournamentId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
        <input
          type="date"
          {...register('journeyDate')}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.journeyDate && (
          <p className="text-red-400 text-sm mt-1">{errors.journeyDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Cantidad de canchas
        </label>
        <input
          type="number"
          min={1}
          {...register('fieldsQuantity', { valueAsNumber: true })}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.fieldsQuantity && (
          <p className="text-red-400 text-sm mt-1">{errors.fieldsQuantity.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Puntos límite por partido
        </label>
        <input
          type="number"
          min={1}
          {...register('scoreLimit', { valueAsNumber: true })}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
        />
        {errors.scoreLimit && (
          <p className="text-red-400 text-sm mt-1">{errors.scoreLimit.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || tournaments.length === 0}
        className="rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 font-medium text-white"
      >
        {isSubmitting ? 'Guardando...' : 'Crear jornada'}
      </button>
      {tournaments.length === 0 && (
        <p className="text-amber-400 text-sm">Primero necesitas crear al menos un torneo.</p>
      )}
    </form>
  );
}