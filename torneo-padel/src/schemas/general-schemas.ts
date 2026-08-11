import { z } from 'zod';

export const createPlayerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener mínimo 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener mínimo 2 caracteres'),
  nickname: z.string().optional(),
});

export type CreatePlayerFormData = z.infer<typeof createPlayerSchema>;