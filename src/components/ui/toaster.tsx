import { useToast } from '@/hooks/useToast';
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center justify-start flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
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
