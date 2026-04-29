import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-8 px-4 bg-gradient-to-b from-primary to-secondary text-white">
      <h1 className="text-4xl font-bold mb-4">WorldClass Auto</h1>
      <p className="mb-6 text-center">Book your vehicle service online. Fast. Reliable. Professional.</p>
      <Link href="/booking">
        <button className="bg-white text-primary font-semibold py-2 px-4 rounded">Book a Service</button>
      </Link>
    </main>
  );
}