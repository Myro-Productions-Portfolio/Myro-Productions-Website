'use client';

import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select, { SelectOption } from '@/components/ui/Select';
import { FormData, FormErrors, FieldTouched, FormStatus } from './useContactForm';

interface ContactFormFieldsProps {
  formData: FormData;
  errors: FormErrors;
  touched: FieldTouched;
  status: FormStatus;
  projectTypes: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isFieldValid: (fieldName: keyof FieldTouched) => boolean;
}

function ValidationCheckmark() {
  return (
    <div className="absolute right-3 top-10 text-moss-600">
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}

export default function ContactFormFields({
  formData,
  errors,
  touched,
  status,
  projectTypes,
  onChange,
  onBlur,
  isFieldValid,
}: ContactFormFieldsProps) {
  const isDisabled = status === 'loading' || status === 'success';

  return (
    <>
      {/* Honeypot field - hidden from users, catches bots */}
      <input
        type="text"
        name="botcheck"
        value={formData.botcheck}
        onChange={onChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Name Field */}
      <div className="relative">
        <Input
          label="Name"
          name="name"
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.name ? errors.name : undefined}
          required
          disabled={isDisabled}
          className={
            isFieldValid('name')
              ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
              : ''
          }
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {isFieldValid('name') && <ValidationCheckmark />}
      </div>

      {/* Email Field */}
      <div className="relative">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.email ? errors.email : undefined}
          required
          disabled={isDisabled}
          className={
            isFieldValid('email')
              ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
              : ''
          }
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {isFieldValid('email') && <ValidationCheckmark />}
      </div>

      {/* Phone Field (Optional) */}
      <div className="relative">
        <Input
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.phone ? errors.phone : undefined}
          disabled={isDisabled}
          className={
            isFieldValid('phone')
              ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
              : ''
          }
          helperText="Optional - if you prefer a call back"
          aria-describedby={errors.phone ? 'phone-error' : 'phone-helper'}
        />
        {isFieldValid('phone') && <ValidationCheckmark />}
      </div>

      {/* Project Type Dropdown */}
      <div className="relative">
        <Select
          label="Project Type"
          name="projectType"
          options={projectTypes}
          value={formData.projectType}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.projectType ? errors.projectType : undefined}
          required
          disabled={isDisabled}
          className={
            isFieldValid('projectType')
              ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
              : ''
          }
          aria-describedby={errors.projectType ? 'project-type-error' : undefined}
        />
        {isFieldValid('projectType') && (
          <div className="absolute right-10 top-10 text-moss-600">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Message Textarea */}
      <div className="relative">
        <Textarea
          label="Message"
          name="message"
          placeholder="Tell me about your project..."
          value={formData.message}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.message ? errors.message : undefined}
          required
          rows={6}
          disabled={isDisabled}
          className={
            isFieldValid('message')
              ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
              : ''
          }
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {isFieldValid('message') && <ValidationCheckmark />}
      </div>
    </>
  );
}
