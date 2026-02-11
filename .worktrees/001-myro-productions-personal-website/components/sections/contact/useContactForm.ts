import { useState, useEffect, FormEvent } from 'react';
import { getOrCreateCsrfToken, regenerateCsrfToken, CSRF_HEADER_NAME } from '@/lib/csrf';
import {
  validateEmail,
  validatePhone,
  validateName,
  validateProjectType,
  validateMessage,
} from '@/lib/validation/contactValidation';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  botcheck?: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  message?: string;
}

export interface FieldTouched {
  name?: boolean;
  email?: boolean;
  phone?: boolean;
  projectType?: boolean;
  message?: boolean;
}

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function useContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
    botcheck: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FieldTouched>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Initialize CSRF token on component mount
  useEffect(() => {
    const token = getOrCreateCsrfToken();
    setCsrfToken(token);
  }, []);

  // Validate individual field using validation utilities
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    const validators = {
      name: validateName,
      email: validateEmail,
      phone: validatePhone,
      projectType: validateProjectType,
      message: validateMessage,
    };

    const validator = validators[name as keyof typeof validators];
    if (!validator) return undefined;

    const result = validator(value);
    return result.isValid ? undefined : result.error;
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    if (!touched[name as keyof FieldTouched]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    // Real-time validation
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle field blur
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      if (key !== 'botcheck') {
        const error = validateField(key, formData[key] || '');
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      projectType: true,
      message: true,
    });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Ensure CSRF token is available
    if (!csrfToken) {
      console.error('CSRF token not available');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            projectType: '',
            message: '',
            botcheck: '',
          });
          setErrors({});
          setTouched({});
          setStatus('idle');
          // Regenerate CSRF token for next submission
          const newToken = regenerateCsrfToken();
          setCsrfToken(newToken);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      // Reset error status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }
  };

  // Check if field is valid (for green border and checkmark)
  const isFieldValid = (fieldName: keyof FieldTouched): boolean => {
    const value = formData[fieldName as keyof FormData];
    return (
      touched[fieldName] === true &&
      !errors[fieldName] &&
      typeof value === 'string' &&
      value.trim() !== ''
    );
  };

  // Check if form is valid (for submit button)
  const isFormValid = (): boolean => {
    return (
      formData.name.trim().length >= 2 &&
      validateEmail(formData.email).isValid &&
      validatePhone(formData.phone).isValid &&
      formData.projectType !== '' &&
      formData.message.trim().length >= 10 &&
      Object.values(errors).every((error) => !error)
    );
  };

  return {
    formData,
    errors,
    touched,
    status,
    csrfToken,
    handleChange,
    handleBlur,
    handleSubmit,
    isFieldValid,
    isFormValid,
  };
}
