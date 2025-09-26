import React, { memo, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';

interface FastFormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  error?: string;
  success?: string;
  className?: string;
}

export const FastFormInput = memo(forwardRef<HTMLInputElement, FastFormInputProps>(
  ({ 
    id, 
    name, 
    label, 
    type = 'text', 
    placeholder, 
    value, 
    onChange, 
    required = false,
    disabled = false,
    icon: Icon,
    rightElement,
    error,
    success,
    className = ''
  }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <Input
            ref={ref}
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`
              ${Icon ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              h-11
              ${error ? 'border-red-500 focus:border-red-500' : ''}
              ${success ? 'border-green-500 focus:border-green-500' : ''}
              ${className}
            `}
            required={required}
            disabled={disabled}
            autoComplete={
              type === 'email' ? 'email' :
              type === 'password' ? 'new-password' :
              name === 'fullName' ? 'name' :
              name === 'jobTitle' ? 'organization-title' :
              name === 'company' ? 'organization' :
              'off'
            }
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {success && !error && (
          <p className="text-xs text-green-600">{success}</p>
        )}
      </div>
    );
  }
));

FastFormInput.displayName = 'FastFormInput';