import { z } from "zod";

export const formScreenRoadmapSchema = z.object({
  roadmap: z.string().min(1, "Escaneie o roteiro."),
  palletsQuantity: z
    .string()
    .min(1, "Informe a quantidade de paletes.")
    .refine(value => Number(value) >= 1, "Mínimo permitido de Paletes é 1")
    .refine(value => Number(value) <= 50, "Máximo permitido de Paletes é 50"),
});
