import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center bg-background text-foreground">
      <div className="text-6xl font-bold tracking-tight">404</div>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm md:text-base max-w-sm opacity-60">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 px-4 py-2 rounded-md border border-current opacity-70 hover:opacity-100 text-sm transition-opacity"
      >
        Go home
      </Link>
    </div>
  );
}
