import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address.").max(255);
export const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(128, "Use no more than 128 characters.");
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.").max(128) });
export const registrationSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name.").max(100, "Use no more than 100 characters."),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
export const resetSchema = z.object({ password: passwordSchema, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
export const fullNameSchema = z.string().trim().min(1, "Enter your full name.").max(100, "Use no more than 100 characters.");
export const profileSchema = z.object({ fullName: fullNameSchema });
