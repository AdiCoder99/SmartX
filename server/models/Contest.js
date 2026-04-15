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


// Contest Update Schema (for API)
export const updateContestSchema = z.object({
    title: z.string().min(5).optional(),
    description: z.string().optional(),
    startTime: z.coerce.date().optional(), // accept ISO string and convert to Date
    endTime: z.coerce.date().optional(), // accept ISO string and convert to Date
    syllabus: z.string().min(10).optional(),
    entryFee: z.coerce.number().min(0).optional(), // accept string and convert to number
    prizePool: z.coerce.number().min(0).optional() // accept string and convert to number
})
.strict()
.refine((data) => {
  Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  }
}) // at least one field must be provided
.refine((data) => {
    if(data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true; // if one of them is missing, we can't validate the order, so we allow it
}, {
    message: "endTime must be after startTime",
});