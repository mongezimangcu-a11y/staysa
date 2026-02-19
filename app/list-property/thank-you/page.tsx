import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Thank you!</h1>
      <p className="mt-3 text-gray-600">
        Your property submission has been received. Our admin team will review it shortly.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          Return to Home
        </Link>

        <Link
          href="/listings"
          className="rounded-xl border px-4 py-2"
        >
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
