import { z } from "zod";

// Address validation schema
export const addressSchema = z
  .string()
  .trim()
  .min(5, { message: "Address must be at least 5 characters" })
  .max(500, { message: "Address must be less than 500 characters" })
  .refine((val) => !/<[^>]*>/g.test(val), {
    message: "Address cannot contain HTML tags",
  });

// Contact form validation schema
export const contactFormSchema = z.object({
  contact_name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(200, { message: "Name must be less than 200 characters" })
    .refine((val) => !/<[^>]*>/g.test(val), {
      message: "Name cannot contain HTML tags",
    }),
  contact_email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  contact_phone: z
    .string()
    .trim()
    .min(8, { message: "Phone number must be at least 8 characters" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .refine((val) => /^[0-9+\-\s()]+$/.test(val), {
      message: "Phone number can only contain numbers, +, -, spaces, and parentheses",
    }),
  // Both variants. Kept in step with lib/landing-variants.ts and the
  // leads_interest_level_check constraint.
  interest_level: z.enum([
    "Looking to Sell",
    "Just Interested",
    "Tenanted, managed by an agency",
    "Tenanted, I manage it myself",
    "Vacant or between tenants",
    "I live in it",
  ], { message: "Please choose one" }),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Validate address input
export function validateAddress(address: string): { success: boolean; error?: string } {
  const result = addressSchema.safeParse(address);
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error.issues[0]?.message };
}

// Validate contact form input
export function validateContactForm(data: unknown): { 
  success: boolean; 
  data?: ContactFormInput; 
  errors?: Record<string, string>;
} {
  const result = contactFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const field = err.path[0] as string;
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  
  return { success: false, errors };
}