import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Hash, Target, Trophy, Users } from "lucide-react";
import {
  createJourneySchema,
  type CreateJourneyFormData,
} from "@/schemas/general-schemas";
import type { Tournament } from "@/types";
import { getTodayDateString } from "@/utils/index";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";

interface JourneyFormProps {
  tournaments: Tournament[];
  onSubmit: (input: CreateJourneyFormData) => Promise<void>;
}

export default function JourneyForm({
  tournaments,
  onSubmit,
}: JourneyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateJourneyFormData>({
    resolver: zodResolver(
      createJourneySchema,
    ) as Resolver<CreateJourneyFormData>,
    defaultValues: {
      journeyDate: getTodayDateString(),
      fieldsQuantity: 2,
      scoreLimit: 24,
      maxPlayers: 8,
    },
  });

  const onValid = async (data: CreateJourneyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset({
        journeyDate: getTodayDateString(),
        fieldsQuantity: 2,
        scoreLimit: 24,
        tournamentId: undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <SelectField
          label="Torneo"
          icon={Trophy}
          error={errors.tournamentId?.message}
          defaultValue=""
          {...register("tournamentId", { valueAsNumber: true })}
        >
          <option value="" disabled>
            Selecciona un torneo
          </option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.description}
            </option>
          ))}
        </SelectField>
      </div>

      <TextField
        label="Fecha"
        type="date"
        icon={Calendar}
        error={errors.journeyDate?.message}
        {...register("journeyDate")}
      />

      <SelectField
        label="Cantidad de canchas"
        icon={Hash}
        error={errors.fieldsQuantity?.message}
        {...register("fieldsQuantity", { valueAsNumber: true })}
      >
        <option value={2}>2 canchas</option>
        <option value={3}>3 canchas</option>
      </SelectField>

      <SelectField
        label="Puntos límite por partido"
        icon={Target}
        error={errors.scoreLimit?.message}
        {...register("scoreLimit", { valueAsNumber: true })}
      >
        <option value={16}>16 puntos</option>
        <option value={24}>24 puntos</option>
        <option value={32}>32 puntos</option>
      </SelectField>

      <SelectField
        label="Máximo de jugadores"
        icon={Users}
        error={errors.maxPlayers?.message}
        {...register("maxPlayers", { valueAsNumber: true })}
      >
        <option value={8}>8 jugadores</option>
        <option value={12}>12 jugadores</option>
      </SelectField>

      <div className="flex flex-col justify-end gap-2 sm:col-span-2">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={tournaments.length === 0}
        >
          Crear jornada
        </Button>
        {tournaments.length === 0 && (
          <p className="text-sm text-warning-700">
            Primero necesitas crear al menos un torneo.
          </p>
        )}
      </div>
    </form>
  );
}
