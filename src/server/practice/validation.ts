import { z } from "zod";
import { decimalPattern } from "./scoring";
export const answerSchema = z.object({ requestKey: z.uuid(), questionId: z.string().min(1).max(100),
  optionIds: z.array(z.string().min(1).max(100)).min(1).max(20).optional(),
  numerical: z.string().trim().min(1).max(60).regex(decimalPattern).optional(),
}).strict().refine((v) => (v.optionIds !== undefined) !== (v.numerical !== undefined));
