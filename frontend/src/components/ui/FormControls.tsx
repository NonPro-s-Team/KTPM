import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

interface FieldMetaProps {
  label: string;
  helperText?: string;
  error?: string;
}

function FieldMeta({
  id,
  helperText,
  error,
}: {
  id: string;
  helperText?: string;
  error?: string;
}) {
  if (error) {
    return (
      <p id={`${id}-error`} className="field__message field__message--error">
        {error}
      </p>
    );
  }

  return helperText ? (
    <p id={`${id}-helper`} className="field__message">
      {helperText}
    </p>
  ) : null;
}

function describedBy(
  id: string,
  helperText?: string,
  error?: string,
  external?: string,
) {
  return [external, error ? `${id}-error` : helperText ? `${id}-helper` : null]
    .filter(Boolean)
    .join(" ");
}

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "prefix">,
    FieldMetaProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({
  label,
  helperText,
  error,
  prefix,
  suffix,
  id: providedId,
  required,
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const fieldDescribedBy = describedBy(id, helperText, error, ariaDescribedBy);

  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field__required" aria-label="bắt buộc">
            *
          </span>
        ) : null}
      </label>
      <div className={`field__control ${error ? "field__control--error" : ""}`}>
        {prefix ? <span className="field__affix">{prefix}</span> : null}
        <input
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={fieldDescribedBy || undefined}
          {...props}
        />
        {suffix ? <span className="field__affix">{suffix}</span> : null}
      </div>
      <FieldMeta id={id} helperText={helperText} error={error} />
    </div>
  );
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldMetaProps {}

export function Textarea({
  label,
  helperText,
  error,
  id: providedId,
  required,
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const fieldDescribedBy = describedBy(id, helperText, error, ariaDescribedBy);

  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field__required" aria-label="bắt buộc">
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        className={`textarea ${error ? "textarea--error" : ""}`}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={fieldDescribedBy || undefined}
        {...props}
      />
      <FieldMeta id={id} helperText={helperText} error={error} />
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, FieldMetaProps {
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  helperText,
  error,
  options,
  placeholder,
  id: providedId,
  required,
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const fieldDescribedBy = describedBy(id, helperText, error, ariaDescribedBy);

  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field__required" aria-label="bắt buộc">
            *
          </span>
        ) : null}
      </label>
      <select
        id={id}
        className={`select ${error ? "select--error" : ""}`}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={fieldDescribedBy || undefined}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <FieldMeta id={id} helperText={helperText} error={error} />
    </div>
  );
}

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  id: providedId,
  className = "",
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <label className={`check-control ${className}`} htmlFor={id}>
      <input id={id} type="checkbox" {...props} />
      <span className="check-control__indicator" aria-hidden="true" />
      <span>
        <span className="check-control__label">{label}</span>
        {description ? (
          <span className="check-control__description">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "role"
> {
  label: string;
  description?: string;
}

export function Switch({
  label,
  description,
  id: providedId,
  className = "",
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <label className={`switch-control ${className}`} htmlFor={id}>
      <span>
        <span className="switch-control__label">{label}</span>
        {description ? (
          <span className="switch-control__description">{description}</span>
        ) : null}
      </span>
      <span className="switch-control__track">
        <input id={id} type="checkbox" role="switch" {...props} />
        <span className="switch-control__thumb" aria-hidden="true" />
      </span>
    </label>
  );
}
