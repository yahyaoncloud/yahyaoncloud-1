import { useLoaderData, useNavigation, Form, useFetcher } from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/Card";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
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
  const project = formData.get("project") as string;
  const duration = formData.get("duration") as string;
  const projectCost = parseFloat(formData.get("projectCost") as string || "0");
  const partialCost = parseFloat(formData.get("partialCost") as string || "0");
  const remainingCost = parseFloat(formData.get("remainingCost") as string || "0");
  const isDue = formData.get("isDue") === "on";
  const details = formData.get("details") as string;

  if (!name || !email) throw new Error("Name and email required");

  // Generate stamp server-side
  const stamp = await generateClientStamp(name, email);

  // Upload stamp to Cloudinary
  const cloudResult = await uploadStampToCloudinary(stamp.filePath, name, stamp.serial);

  // Construct client object
  const clientData: ClientData = {
    name,
    email,
    company: company || "",
    stamp: { ...stamp, filePath: cloudResult.url },
    project: project || "",
    duration: duration || "",
    projectCost: isNaN(projectCost) ? 0 : projectCost,
    partialCost: isNaN(partialCost) ? 0 : partialCost,
    remainingCost: isNaN(remainingCost) ? 0 : remainingCost,
    isDue: isDue || false,
    details: details || "",
  };

  await addClientToRTDB(clientData);

  return redirect("/admin/client/onboard");
};

// Client Form Component
function ClientForm({ fetcher }: { fetcher: ReturnType<typeof useFetcher> }) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Add New Client
        </CardTitle>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Fill in the client details to generate their stamp
        </p>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Client Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter client name"
                  required
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  required
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Enter company name"
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Project Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Project Name
                </Label>
                <Input
                  id="project"
                  name="project"
                  placeholder="Enter project name"
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Duration
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g., 3 months"
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Project Details
              </Label>
              <Input
                id="details"
                name="details"
                placeholder="Additional project details"
                className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectCost" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Total Project Cost
                </Label>
                <Input
                  id="projectCost"
                  name="projectCost"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partialCost" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Amount Paid
                </Label>
                <Input
                  id="partialCost"
                  name="partialCost"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remainingCost" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Remaining Amount
                </Label>
                <Input
                  id="remainingCost"
                  name="remainingCost"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isDue"
                name="isDue"
                className="border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
              />
              <Label
                htmlFor="isDue"
                className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Mark as payment due
              </Label>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="submit"
              disabled={fetcher.state === "submitting"}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
            >
              {fetcher.state === "submitting" ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate & Add Client"
              )}
            </Button>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

// Client Card Component
function ClientCard({ client }: { client: ClientData }) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {client.name}
          </CardTitle>
          {client.isDue && (
            <span className="px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md">
              Due
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Email</span>
            <span className="text-sm text-zinc-900 dark:text-zinc-100">{client.email}</span>
          </div>
          {client.company && (
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Company</span>
              <span className="text-sm text-zinc-900 dark:text-zinc-100">{client.company}</span>
            </div>
          )}
          {client.project && (
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Project</span>
              <span className="text-sm text-zinc-900 dark:text-zinc-100">{client.project}</span>
            </div>
          )}
          {client.duration && (
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Duration</span>
              <span className="text-sm text-zinc-900 dark:text-zinc-100">{client.duration}</span>
            </div>
          )}
        </div>

        {(client.projectCost || client.partialCost || client.remainingCost) && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="space-y-1">
              {client.projectCost && client.projectCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Cost</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    ${client.projectCost.toFixed(2)}
                  </span>
                </div>
              )}
              {client.partialCost && client.partialCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Paid</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    ${client.partialCost.toFixed(2)}
                  </span>
                </div>
              )}
              {client.remainingCost && client.remainingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Remaining</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    ${client.remainingCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {client.details && (
          <div className="pt-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{client.details}</p>
          </div>
        )}

        {client.stamp && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Serial</span>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{client.stamp.serial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Signature</span>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                  {client.stamp.signature.substring(0, 16)}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Seed</span>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{client.stamp.seed}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href={client.stamp.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Download
                </a>
                {client.stamp.verificationUrl && (
                  <a
                    href={client.stamp.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Verify
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// React Component
export default function ClientOnboardPage() {
  const clients = useLoaderData<ClientData[]>() || [];
  const fetcher = useFetcher<ClientData>();
  const navigation = useNavigation();

  return (
    <div className="min-h-screen ">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Client Onboarding
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Add new clients and generate their digital stamps
          </p>
        </div>

        {/* Client Form */}
        <div className="mb-8">
          <ClientForm fetcher={fetcher} />
        </div>

        {/* Loading State */}
        {navigation.state === "loading" && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}

        {/* Clients List */}
        {clients.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                All Clients ({clients.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <ClientCard key={client.key} client={client} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                No clients yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Use the form above to add your first client
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}