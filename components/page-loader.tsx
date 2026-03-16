type PageLoaderProps = {
  title?: string;
  message?: string;
};

export function PageLoader({
  title = "Qoldanba",
  message = "Loading...",
}: PageLoaderProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}
