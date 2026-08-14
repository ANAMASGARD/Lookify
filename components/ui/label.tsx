import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
