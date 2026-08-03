import { scorePassword } from '../../lib/validation'

const labels = ['—', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']

// Thang 4 khối vuông tô đậm dần — monochrome, không dùng màu semantic
export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`h-2 flex-1 transition-colors duration-150 ${
              step <= score ? 'bg-fg' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p
        className="text-xs tracking-widest uppercase text-muted"
        aria-live="polite"
      >
        Độ mạnh:{' '}
        <span className="font-semibold text-fg">{labels[score]}</span>
      </p>
    </div>
  )
}
