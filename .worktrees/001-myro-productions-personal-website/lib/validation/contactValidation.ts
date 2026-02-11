/**
 * Contact Form Validation Utilities
 * 
 * This module provides validation functions for the contact form.
 * Each function returns a ValidationResult with isValid boolean and optional error message.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address
 * @param email - The email address to validate
 * @returns ValidationResult with isValid and optional error message
 */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Validates a phone number (optional field)
 * @param phone - The phone number to validate
 * @returns ValidationResult with isValid and optional error message
 */
export function validatePhone(phone: string): ValidationResult {
  // Phone is optional, so empty is valid
  if (!phone.trim()) {
    return { isValid: true };
  }
  
  // Flexible phone format: allows digits, spaces, dashes, parentheses, plus
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (!phoneRegex.test(phone) || cleanedPhone.length < 10) {
    return { isValid: false, error: 'Please enter a valid phone number (10+ digits)' };
  }
  
  return { isValid: true };
}

/**
 * Validates a name field
 * @param name - The name to validate
 * @returns ValidationResult with isValid and optional error message
 */
export function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  return { isValid: true };
}

/**
 * Validates a project type selection
 * @param projectType - The project type to validate
 * @returns ValidationResult with isValid and optional error message
 */
export function validateProjectType(projectType: string): ValidationResult {
  if (!projectType) {
    return { isValid: false, error: 'Please select a project type' };
  }
  
  return { isValid: true };
}

/**
 * Validates a message field
 * @param message - The message to validate
 * @returns ValidationResult with isValid and optional error message
 */
export function validateMessage(message: string): ValidationResult {
  if (!message.trim()) {
    return { isValid: false, error: 'Message is required' };
  }
  
  if (message.trim().length < 10) {
    return { isValid: false, error: 'Message must be at least 10 characters' };
  }
  
  return { isValid: true };
}
