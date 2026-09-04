import type { InputHTMLAttributes } from 'react'

export function PawCheckboxIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="currentColor"
    >
      <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
      <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
      <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
      <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
    </svg>
  )
}

export interface PawCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  containerClassName?: string
  pawClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PawCheckbox({
  checked,
  onChange,
  disabled,
  className = '',
  containerClassName = '',
  pawClassName = '',
  size = 'md',
  id,
  ...props
}: PawCheckboxProps) {
  const sizeBox = {
    sm: 'w-3.5 h-3.5 rounded-[4px]',
    md: 'w-4 h-4 rounded-md',
    lg: 'w-5 h-5 rounded-md',
  }[size]

  const pawSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }[size]

  return (
    <label
      className={`relative inline-grid place-items-center shrink-0 cursor-pointer select-none transition-transform active:scale-95 ${sizeBox} ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
      } ${containerClassName}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`peer appearance-none w-full h-full m-0 rounded border transition-all duration-150 cursor-pointer ${
          checked
            ? 'bg-brand border-brand shadow-2xs'
            : 'bg-white border-brand/40 hover:border-brand'
        } focus-visible:outline-2 focus-visible:outline-brand/40 focus-visible:outline-offset-1 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      <PawCheckboxIcon
        className={`absolute inset-0 m-auto text-white pointer-events-none transition-all duration-150 ${pawSize} ${
          checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        } ${pawClassName}`}
      />
    </label>
  )
}
