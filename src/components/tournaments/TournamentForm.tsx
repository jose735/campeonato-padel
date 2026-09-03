import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trophy } from 'lucide-react';
import {
  createTournamentSchema,
  type CreateTournamentFormData,
} from '@/schemas/general-schemas';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

interface TournamentFormProps {
  onSubmit: (input: CreateTournamentFormData) => Promise<void>;
  defaultValues?: CreateTournamentFormData;
  submitLabel?: string;
  onCancel?: () => void;
  /** Oculta el checkbox de tabla histórica (p. ej. torneo especial). */
  hideHistoricalOption?: boolean;
}

export default function TournamentForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Crear torneo',
  onCancel,
  hideHistoricalOption = false,
}: TournamentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTournamentFormData>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: defaultValues ?? {
      description: '',
      includeInHistorical: false,
    },
  });

  const onValid = async (data: CreateTournamentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        includeInHistorical: hideHistoricalOption
          ? false
          : Boolean(data.includeInHistorical),
      });
      if (!defaultValues) {
        reset({ description: '', includeInHistorical: false });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4 max-w-md">
      <TextField
        label="Descripción del torneo"
        icon={Trophy}
        placeholder="Ej: Torneo Verano 2026"
        error={errors.description?.message}
        {...register('description')}
      />

      {!hideHistoricalOption && (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-3 transition-colors hover:bg-neutral-50">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            {...register('includeInHistorical')}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-neutral-800">
              Incluir en tabla histórica
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              Las jornadas finalizadas de este torneo se sumarán cuando se elija
              &quot;Tabla Histórica&quot; en el ranking.
            </span>
          </span>
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
