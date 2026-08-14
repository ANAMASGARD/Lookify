export function LookifyWordmark({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-end gap-1 sm:gap-1.5 ${className ?? ""}`}
      aria-label="Lookify"
    >
      <span className="font-medium lowercase leading-none tracking-[-0.04em] text-[42px] sm:text-[72px] lg:text-[96px]">
        lookify
      </span>
      <span className="relative mb-1 flex h-5 w-5 shrink-0 items-center justify-center sm:mb-2 sm:h-7 sm:w-7 lg:mb-3 lg:h-8 lg:w-8">
        <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
        <span className="relative text-[10px] font-medium sm:text-xs lg:text-sm">
          R
        </span>
      </span>
    </div>
  );
}
