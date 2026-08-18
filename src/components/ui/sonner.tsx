import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-0 group-[.toaster]:shadow-[var(--shadow-lift)] group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:font-medium",
          title: "group-[.toast]:text-[13.5px] group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-success group-[.toaster]:text-success-foreground",
          error: "group-[.toaster]:bg-danger group-[.toaster]:text-danger-foreground",
          warning: "group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
