import { z } from 'zod';
import { loginSchema } from '../schemas';

export type LoginFormData = z.infer<typeof loginSchema>;
