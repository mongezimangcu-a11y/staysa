import Link from "next/link";
import { Card, Badge } from "./ui";
import type { Property } from "../types";


export default function PropertyCard({ p }: { p: Property }) {
  const img = p.images?.[0];

  return (
    <Link href={`/property/${p.id}`}>
      <Card>
        <div className="flex gap-4">
          <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={p.title} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold">{p.title}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {p.suburb}, {p.city}
                </div>
              </div>
              <Badge>R{p.nightly_rate}/night</Badge>
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Max guests: <span className="font-semibold text-gray-800">{p.max_guests}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
