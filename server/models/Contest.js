import { z } from 'zod'

// INPUT SCHEMA (for API)
export const createContestSchema = z.object({
    title: z.string().min(5),
    description: z.string().optional(),

    //timing 
    startTime: z.coerce.date(), // accept ISO string and convert to Date
    endTime: z.coerce.date(), // accept ISO string and convert to Date

    syllabus: z.string().min(10), // minimum 10 characters


    //pricing 
    entryFee: z.coerce.number().min(0), // accept string and convert to number

    prizePool: z.coerce.number().min(0), // accept string and convert to number

    questions: z.array(
    z.object({
        questionId: z.string(), // unique id for each question
        questionText: z.string().min(5),
        options: z.array(z.string().min(1)).min(2), // at least 2 options
        correctOptionIndex: z.number().int().min(0) // index of the correct option
    })
    .refine(
    (q) => q.correctOptionIndex < q.options.length,
    {
      message: "correctOptionIndex out of range",
      path: ["correctOptionIndex"]
    }
  )
    ).min(1),


})
.refine((data) => data.endTime > data.startTime, {
  message: "endTime must be after startTime",
  path: ["endTime"]
}); 