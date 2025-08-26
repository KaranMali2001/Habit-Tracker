'use client';
export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">😵</h1>
        <h2 className="text-3xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We couldn’t process your request. Please try again later or go back to the homepage.</p>
        <div className="flex gap-3 justify-center">
          <a href="/" className="rounded-xl bg-primary px-5 py-2.5 text-primary-foreground font-medium shadow hover:bg-primary/90 transition">
            Go Home
          </a>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-secondary px-5 py-2.5 text-secondary-foreground font-medium shadow hover:bg-secondary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
