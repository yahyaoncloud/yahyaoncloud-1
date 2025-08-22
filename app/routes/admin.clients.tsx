import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/button";

interface Client {
  name: string;
  email: string;
  serial?: string;
  signature?: string;
  seed?: string;
}

const dummyClients: Client[] = [
  { name: "ACME Corp", email: "acme@example.com", serial: "12345", signature: "ABC-DEF", seed: "987654321" },
  { name: "Globex", email: "globex@example.com", serial: "67890", signature: "XYZ-123", seed: "123456789" },
];

export default function ClientsListPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setView(view === "grid" ? "list" : "grid")}>
          Switch to {view === "grid" ? "List" : "Grid"} View
        </Button>
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-4"}>
        {dummyClients.map((c, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {c.email}</p>
              <p>Serial: {c.serial}</p>
              <p>Signature: {c.signature}</p>
              <p>Seed: {c.seed}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
