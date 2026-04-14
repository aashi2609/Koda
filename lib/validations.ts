import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  skillsOffered: z
    .array(z.string().min(1))
    .min(1, "At least one skill must be offered"),
  skillsDesired: z
    .array(z.string().min(1))
    .min(1, "At least one skill must be desired"),
});

export const swapRequestSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message cannot exceed 1000 characters"),
});

export const swapStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"], {
    errorMap: () => ({ message: "Status must be 'accepted' or 'rejected'" }),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SwapRequestInput = z.infer<typeof swapRequestSchema>;
export type SwapStatusInput = z.infer<typeof swapStatusSchema>;
