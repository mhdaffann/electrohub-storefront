import { describe, expect, it } from "vitest";
import { emailSchema, registrationSchema } from "@/lib/auth-validation";

const registration = { fullName: "Muhammed Affan", email: "affan@example.com", password: "ElectroHub123", confirmPassword: "ElectroHub123" };
describe("Account validation", () => {
  it("requires a full name", () => {
    expect(registrationSchema.safeParse({ ...registration, fullName: " " }).success).toBe(false);
    expect(registrationSchema.parse(registration).fullName).toBe("Muhammed Affan");
  });
  it("requires a valid email address", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse(registration.email).success).toBe(true);
  });
  it("requires matching password confirmation", () => {
    expect(registrationSchema.safeParse({ ...registration, confirmPassword: "Different123" }).success).toBe(false);
    expect(registrationSchema.safeParse(registration).success).toBe(true);
  });
});