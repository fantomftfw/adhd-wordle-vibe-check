declare module 'sonner' {
  import type { ReactElement, ReactNode } from 'react';

  type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default';

  interface ToastOptions {
    id?: string | number;
    duration?: number;
    description?: ReactNode;
    icon?: ReactNode;
    type?: ToastType;
  }

  interface ToasterProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    richColors?: boolean;
    [key: string]: any;
  }

  export const Toaster: (props: ToasterProps) => ReactElement;

  function toast(message: string | ReactNode, options?: ToastOptions): void;

  namespace toast {
    export function success(message: string | ReactNode, options?: ToastOptions): void;
    export function error(message: string | ReactNode, options?: ToastOptions): void;
    export function warning(message: string | ReactNode, options?: ToastOptions): void;
    export function info(message: string | ReactNode, options?: ToastOptions): void;
    export function loading(message: string | ReactNode, options?: ToastOptions): void;
    export function dismiss(toastId?: string | number): void;
  }

  export { toast };
}
