import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad"> & {
  eager?: boolean;
};

export function LazyImage({
  className,
  eager = false,
  alt,
  loading,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="relative block overflow-hidden" aria-busy={!loaded}>
      {!loaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-muted motion-reduce:animate-none"
        />
      )}
      <img
        {...props}
        alt={alt ?? ""}
        loading={loading ?? (eager ? "eager" : "lazy")}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative block transition-opacity duration-300 ease-out motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </span>
  );
}
