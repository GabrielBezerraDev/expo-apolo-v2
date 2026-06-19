import { z } from "zod";
import { formScreenPalletSchema } from "../schemas";

export type FormScreenPalletType = z.infer<typeof formScreenPalletSchema>;
