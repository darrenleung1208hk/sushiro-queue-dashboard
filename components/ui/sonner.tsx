'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-center"
      offset="48px"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-md group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-1.5 group-[.toaster]:text-xs group-[.toaster]:py-2 group-[.toaster]:px-3 group-[.toaster]:min-h-0',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:py-1 group-[.toast]:px-2',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:py-1 group-[.toast]:px-2',
          icon: 'group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center group-[.toast]:m-0 group-[.toast]:h-4 group-[.toast]:w-4',
          success: 'group-[.toaster]:text-green-500 [&>svg]:text-green-500',
          error: 'group-[.toaster]:text-destructive [&>svg]:text-destructive',
          loading: '[&>svg]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
