import { Check } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      {...props}
      position="top-center"
      className="toaster group finanzzi-toaster"
      icons={{
        success: (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_18px_hsl(var(--primary)/0.28)]">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        ),
      }}
      offset="max(14px, env(safe-area-inset-top))"
      mobileOffset="max(14px, env(safe-area-inset-top))"
      toastOptions={{
        duration: 1600,
        classNames: {
          toast:
            "group toast group-[.toaster]:w-[min(340px,calc(100vw-32px))] group-[.toaster]:rounded-[18px] group-[.toaster]:border group-[.toaster]:border-primary/20 group-[.toaster]:bg-[#171719]/95 group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:text-white group-[.toaster]:shadow-[0_18px_55px_rgba(0,0,0,0.38)] group-[.toaster]:backdrop-blur-2xl group-[.toaster]:gap-3 group-[.toaster]:items-center",
          title:
            "group-[.toast]:min-w-0 group-[.toast]:pr-1 group-[.toast]:text-[14px] group-[.toast]:font-semibold group-[.toast]:leading-5 group-[.toast]:pt-0.5 group-[.toast]:text-white",
          description:
            "group-[.toast]:text-[12px] group-[.toast]:leading-4 group-[.toast]:text-white/60",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-white/10 group-[.toast]:text-white/70",
          success:
            "group-[.toaster]:border-primary/25 group-[.toaster]:bg-[#171719]/95 group-[.toaster]:text-white",
          error:
            "group-[.toaster]:border-danger/30 group-[.toaster]:bg-[#171719]/95 group-[.toaster]:text-white",
          warning:
            "group-[.toaster]:border-warning/30 group-[.toaster]:bg-[#171719]/95 group-[.toaster]:text-white",
        },
      }}
    />
  );
};

export { Toaster };
