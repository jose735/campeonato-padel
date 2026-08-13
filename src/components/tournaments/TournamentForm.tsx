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
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4 max-w-md">
      <TextField
        label="Descripción del torneo"
        icon={Trophy}
        placeholder="Ej: Torneo Verano 2026"
        error={errors.description?.message}
        {...register('description')}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Crear torneo
      </Button>
    </form>
  );
}