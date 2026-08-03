import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '../auth/Button'
import { Alert } from '../auth/Alert'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

// Mọi hành động xoá bắt buộc đi qua dialog này — không xoá trực tiếp khi click (severity High)
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Xoá',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleConfirm = async () => {
    setError(undefined)
    setIsLoading(true)
    try {
      await onConfirm()
    } catch {
      setError('Không thể thực hiện. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      {error && <Alert variant="error">{error}</Alert>}
      <p className="text-sm text-muted">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Huỷ
        </Button>
        <Button variant="primary" isLoading={isLoading} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
