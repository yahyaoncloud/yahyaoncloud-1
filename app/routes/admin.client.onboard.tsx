import { useLoaderData, useNavigation, Form, useFetcher } from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/Card";
import { generateClientStamp } from "../utils/stampgenerator.server";
import { uploadStampToCloudinary } from "../utils/cloudinary.server";
import { getClientList, addClientToRTDB } from "../utils/firebase.server";

// Type for a client
type ClientData = {
  key?: string;
  name: string;
  email: string;
  company?: string;
  stamp?: {
    serial: string;
    signature: string;
    seed: string;
    filePath: string;
    verificationUrl?: string;
  };
  project?: string;
  duration?: string;
  projectCost?: number;
  partialCost?: number;
  remainingCost?: number;
  isDue?: boolean;
  details?: string;
};

// Loader: fetch all clients from Firebase RTDB
export const loader = async () => {
  const clients = await getClientList();
  return clients;
};

// Action: handle client form submission
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const company = formData.get("company") as string;

  if (!name || !email) throw new Error("Name and email required");

  // Generate stamp server-side
  const stamp = await generateClientStamp(name, email);

  // Upload stamp to Cloudinary
  const cloudResult = await uploadStampToCloudinary(stamp.filePath, name, stamp.serial);

  // Construct client object
  const clientData: ClientData = {
    name,
    email,
    company,
    stamp: { ...stamp, filePath: cloudResult.url },
    project: "",
    duration: "",
    projectCost: 0,
    partialCost: 0,
    remainingCost: 0,
    isDue: false,
    details: "",
  };

  await addClientToRTDB(clientData);

  return redirect("/admin/clients/onboard");
};

// React Component
export default function ClientOnboardPage() {
  const clients = useLoaderData<ClientData[]>() || [];
  const fetcher = useFetcher<ClientData>();
  const navigation = useNavigation();

  return (
    <div className="p-6">
      <fetcher.Form method="post" className="mb-6 flex flex-wrap gap-2 items-end">
        <Input name="name" placeholder="Client Name" required />
        <Input name="email" placeholder="Email" required />
        <Input name="company" placeholder="Company" />
        <Button type="submit" disabled={fetcher.state === "submitting"}>
          {fetcher.state === "submitting" ? "Generating..." : "Generate & Add Client"}
        </Button>
      </fetcher.Form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Card key={c.key} className="bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {c.email}</p>
              <p>Company: {c.company}</p>
              {c.stamp && (
                <>
                  <p>Serial: {c.stamp.serial}</p>
                  <p>Signature: {c.stamp.signature}</p>
                  <p>Seed: {c.stamp.seed}</p>
                  <a href={c.stamp.filePath} target="_blank" rel="noreferrer" className="text-indigo-500">
                    Download Stamp
                  </a>
                  {c.stamp.verificationUrl && (
                    <p>
                      Verification URL:{" "}
                      <a href={c.stamp.verificationUrl} target="_blank" rel="noreferrer" className="text-indigo-500">
                        Verify
                      </a>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}