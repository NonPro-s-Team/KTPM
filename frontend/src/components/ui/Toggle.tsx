interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5.5 w-9.5 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        checked ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
