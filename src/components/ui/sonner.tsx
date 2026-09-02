import { CheckCircle2 } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group finanzzi-toaster"
      icons={{
        success: <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/10"><CheckCircle2 className="size-[18px]" strokeWidth={2.75} /></span>,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:min-w-[min(360px,calc(100vw-32px))] group-[.toaster]:rounded-[22px] group-[.toaster]:border group-[.toaster]:border-primary/10 group-[.toaster]:bg-card/90 group-[.toaster]:shadow-[0_16px_50px_rgba(0,0,0,0.22)] group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:font-medium group-[.toaster]:backdrop-blur-2xl",
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
