/**
 * Shared form validators
 * Reference: DeutschFlow Design Bible 13_FORMS_AND_VALIDATION_BIBLE
 */

import { z } from "zod/v4";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format. Enter a valid email address (e.g., name@example.com).");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be no more than 128 characters.");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be no more than 100 characters.");

export const requiredString = (field: string) =>
  z.string().min(1, `${field} is required.`);
