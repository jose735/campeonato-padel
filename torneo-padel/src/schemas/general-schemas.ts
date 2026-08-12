import { z } from 'zod';

export const createPlayerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener mínimo 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener mínimo 2 caracteres'),
  nickname: z.string().optional(),
});

export type CreatePlayerFormData = z.infer<typeof createPlayerSchema>;

export const createTournamentSchema = z.object({
  description: z.string().min(3, 'La descripción debe tener mínimo 3 caracteres'),
});

export type CreateTournamentFormData = z.infer<typeof createTournamentSchema>;

export const createJourneySchema = z.object({
  tournamentId: z.number({ message: 'Selecciona un torneo' }),
  journeyDate: z.string().min(1, 'La fecha es requerida'),
  fieldsQuantity: z.number().int().min(1, 'Debe haber al menos 1 cancha'),
  scoreLimit: z.number().int().min(1, 'El límite de puntaje debe ser mayor a 0'),
});

export type CreateJourneyFormData = z.infer<typeof createJourneySchema>;

export const createJourneyParticipantSchema = z.object({
  journeyId: z.number(),
  playerId: z.number(),
  seed: z.number().int().min(1, 'El seed debe ser mayor a 0'),
});

export type CreateJourneyParticipantFormData = z.infer<typeof createJourneyParticipantSchema>;

export const createJourneyMatchSchema = z
  .object({
    journeyId: z.number(),
    round: z.number().int().min(1, 'La ronda debe ser mayor a 0'),
    playerA1Id: z.number(),
    playerA2Id: z.number(),
    playerB1Id: z.number(),
    playerB2Id: z.number(),
    scoreA: z.number().int().min(0),
    scoreB: z.number().int().min(0),
    pointsObtained: z.number().int().min(0),
  })
  .refine(
    (data) => {
      const ids = [data.playerA1Id, data.playerA2Id, data.playerB1Id, data.playerB2Id];
      return new Set(ids).size === ids.length;
    },
    {
      message: 'Los 4 jugadores del partido deben ser distintos',
      path: ['playerB2Id'],
    }
  );

export type CreateJourneyMatchFormData = z.infer<typeof createJourneyMatchSchema>;