import { z } from "zod";
import { formScreenRoadmapSchema } from "../schemas";

export type FormScreenRoadmapType = z.infer<typeof formScreenRoadmapSchema>;
