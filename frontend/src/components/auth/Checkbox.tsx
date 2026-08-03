import { useId, type ReactNode } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export function Checkbox({ label, checked, onChange, id }: CheckboxProps) {
  const autoId = useId()
  const checkboxId = id ?? autoId

  return (
    <label
      htmlFor={checkboxId}
      className="flex cursor-pointer items-start gap-2.5 select-none"
    >
      <span className="relative mt-0.5 flex">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="flex size-4 items-center justify-center border border-border-strong bg-bg transition-colors duration-150 peer-checked:bg-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-strong"
        >
          {checked && <Check className="size-3 text-bg" strokeWidth={3} />}
        </span>
      </span>
      <span className="text-sm">{label}</span>
    </label>
  )
}
