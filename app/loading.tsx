export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md transition-all duration-300">
      <div className="relative flex flex-col items-center gap-4">
        {/* Modern Premium Loader */}
        <div className="relative h-16 w-16">
          {/* Outer glowing pulsing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
          {/* Inner spinning accent ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin [animation-duration:0.8s]" />
        </div>

        {/* Subtle, clean text */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium tracking-wide text-foreground/80 animate-pulse">
            Laddar...
          </p>
          <p className="text-xs text-muted-foreground/60">
            Hämtar data
          </p>
        </div>
      </div>
    </div>
  );
}