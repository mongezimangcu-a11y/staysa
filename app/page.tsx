import Shell from "../components/Shell";
import { Button, OutlineButton, Card } from "../components/ui";

export default function HomePage() {
  return (
    <Shell>
      <div className="grid gap-6">
        <Card>
          <h1 className="text-3xl font-extrabold tracking-tight">Tripconnecta Business Travel</h1>
          <p className="mt-2 text-gray-600">
            Curated Gauteng stays for business travellers. Bookings approved within hours. EFT supported.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/listings">Browse Stays</Button>
            <OutlineButton href="/list-property">List Your Property</OutlineButton>
          </div>

          <p className="mt-4 text-xs text-gray-500">Gauteng only (MVP). No hidden limits.</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm font-bold">Business-ready</div>
            <div className="mt-1 text-sm text-gray-600">Wi-Fi, workspace, security, reliable stays.</div>
          </Card>
          <Card>
            <div className="text-sm font-bold">Fast approval</div>
            <div className="mt-1 text-sm text-gray-600">We confirm availability and approve quickly.</div>
          </Card>
          <Card>
            <div className="text-sm font-bold">EFT supported</div>
            <div className="mt-1 text-sm text-gray-600">Simple payment workflow for SMEs.</div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
