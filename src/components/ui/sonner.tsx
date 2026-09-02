import { Check, Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"><Check className="size-4" strokeWidth={3} /></span>,
      }}
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
          success: "group-[.toaster]:border group-[.toaster]:border-primary/15 group-[.toaster]:bg-card/95 group-[.toaster]:text-foreground group-[.toaster]:backdrop-blur-xl group-[.toaster]:ring-1 group-[.toaster]:ring-primary/5",
          error: "group-[.toaster]:bg-danger group-[.toaster]:text-danger-foreground",
          warning: "group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
