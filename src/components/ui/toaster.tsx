import { useToast } from '@/hooks/useToast';
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex flex-col items-start justify-start flex-1 gap-1 pr-8">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport 
        className="z-[9999] flex w-auto flex-col p-4 max-w-sm pointer-events-none" 
        style={{
          position: 'fixed',
          top: '0',
          right: '0',
          zIndex: 9999
        }}
      />
    </ToastProvider>
  );
}
