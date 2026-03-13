import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="font-serif text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-muted mb-8 max-w-md mx-auto">
        The article or page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
