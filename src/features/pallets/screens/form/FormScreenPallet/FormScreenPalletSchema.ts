import { z } from 'zod';

export const formScreenPalletSchema = z.object({
  roadmap: z.string().min(1),
  palletsQuantity: z.string().min(1),
});
