/**
 * Validation utilities for Cook Book Bake
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Password validation - must have 8+ chars, uppercase, lowercase, number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
  };
} {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  return {
    isValid: Object.values(requirements).every((req) => req),
    requirements,
  };
}

/**
 * UK Postcode validation
 */
export function validatePostcode(postcode: string): boolean {
  const postcodeRegex =
    /^[A-Z]{1,2}\d[A-Z\d]?\s?[A-Z\d]{2}$|^[A-Z]{1,2}\d\d?\s?[A-Z\d]{2}$/i;
  return postcodeRegex.test(postcode.trim());
}

/**
 * ISBN validation (10 or 13 digit)
 */
export function validateISBN(isbn: string): boolean {
  const cleanISBN = isbn.replace(/[\s-]/g, '');

  if (cleanISBN.length === 10) {
    return validateISBN10(cleanISBN);
  } else if (cleanISBN.length === 13) {
    return validateISBN13(cleanISBN);
  }

  return false;
}

function validateISBN10(isbn: string): boolean {
  if (!/^[0-9]{10}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }

  return sum % 11 === 0;
}

function validateISBN13(isbn: string): boolean {
  if (!/^[0-9]{13}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }

  return sum % 10 === 0;
}

/**
 * URL validation
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Price validation
 */
export function validatePrice(price: number): boolean {
  return price > 0 && price <= 999999 && !isNaN(price);
}

/**
 * Quantity validation
 */
export function validateQuantity(qty: number): boolean {
  return Number.isInteger(qty) && qty > 0 && qty <= 999;
}

/**
 * Text length validation
 */
export function validateLength(text: string, min: number, max: number): boolean {
  return text.trim().length >= min && text.trim().length <= max;
}

/**
 * Slug validation (URL-friendly text)
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

/**
 * Form validation helper
 */
export function validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Required validation
    if (rule.required && !value) {
      errors.push({
        field,
        message: rule.requiredMessage || `${field} is required`,
      });
      continue;
    }

    if (!value) continue; // Skip other validations if value is empty and not required

    // Email validation
    if (rule.email && !validateEmail(value)) {
      errors.push({
        field,
        message: rule.emailMessage || 'Invalid email address',
      });
    }

    // Password validation
    if (rule.password) {
      const result = validatePassword(value);
      if (!result.isValid) {
        errors.push({
          field,
          message:
            rule.passwordMessage ||
            'Password must be 8+ characters with uppercase, lowercase, and number',
        });
      }
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors.push({
        field,
        message:
          rule.minLengthMessage || `${field} must be at least ${rule.minLength} characters`,
      });
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({
        field,
        message: rule.maxLengthMessage || `${field} must not exceed ${rule.maxLength} characters`,
      });
    }

    // Min value validation
    if (rule.min !== undefined && parseFloat(value) < rule.min) {
      errors.push({
        field,
        message: rule.minMessage || `${field} must be at least ${rule.min}`,
      });
    }

    // Max value validation
    if (rule.max !== undefined && parseFloat(value) > rule.max) {
      errors.push({
        field,
        message: rule.maxMessage || `${field} must not exceed ${rule.max}`,
      });
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        field,
        message: rule.patternMessage || `${field} format is invalid`,
      });
    }

    // Custom validation
    if (rule.custom && !rule.custom(value, data)) {
      errors.push({
        field,
        message: rule.customMessage || `${field} is invalid`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export interface ValidationRule {
  required?: boolean;
  requiredMessage?: string;
  email?: boolean;
  emailMessage?: string;
  password?: boolean;
  passwordMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  min?: number;
  minMessage?: string;
  max?: number;
  maxMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: any, allData: Record<string, any>) => boolean;
  customMessage?: string;
}
