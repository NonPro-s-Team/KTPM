import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button, IconButton } from "./Button";

type OverlaySize = "sm" | "md" | "lg";

interface BaseOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: OverlaySize;
}

function useDialogState(open: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return dialogRef;
}

function OverlayContent({
  title,
  description,
  children,
  footer,
  onClose,
  titleId,
  descriptionId,
}: Omit<BaseOverlayProps, "open" | "size"> & {
  titleId: string;
  descriptionId: string;
}) {
  return (
    <>
      <header className="overlay__header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descriptionId}>{description}</p> : null}
        </div>
        <IconButton icon={X} label="Đóng" onClick={onClose} />
      </header>
      <div className="overlay__body">{children}</div>
      {footer ? <footer className="overlay__footer">{footer}</footer> : null}
    </>
  );
}

function handleBackdropClick(
  event: MouseEvent<HTMLDialogElement>,
  onClose: () => void,
) {
  if (event.target === event.currentTarget) {
    onClose();
  }
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: BaseOverlayProps) {
  const dialogRef = useDialogState(open, onClose);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <dialog
      ref={dialogRef}
      className={`overlay modal modal--${size}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => handleBackdropClick(event, onClose)}
    >
      <OverlayContent
        title={title}
        description={description}
        onClose={onClose}
        titleId={titleId}
        descriptionId={descriptionId}
        footer={footer}
      >
        {children}
      </OverlayContent>
    </dialog>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: BaseOverlayProps) {
  const dialogRef = useDialogState(open, onClose);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <dialog
      ref={dialogRef}
      className={`overlay drawer drawer--${size}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => handleBackdropClick(event, onClose)}
    >
      <OverlayContent
        title={title}
        description={description}
        onClose={onClose}
        titleId={titleId}
        descriptionId={descriptionId}
        footer={footer}
      >
        {children}
      </OverlayContent>
    </dialog>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="confirm-copy">
        Hành động này sẽ được áp dụng ngay sau khi bạn xác nhận.
      </p>
    </Modal>
  );
}
