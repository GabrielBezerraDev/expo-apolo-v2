import z from "zod";
import { formScreenPalletSchema } from "./FormScreenPalletSchema";


export type FormScreenPalletType = z.infer<typeof formScreenPalletSchema>