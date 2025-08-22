import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { getClientList } from "../utils/firebase.server";

// Type for a client (aligned with ClientOnboardPage)
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
export const loader: LoaderFunction = async () => {
  try {
    const clients = await getClientList();
    return json({ clients, error: null });
  } catch (error) {
    return json({ clients: [], error: "Failed to fetch clients" }, { status: 500 });
  }
};

// Modal Component
function ClientDetailsModal({
  client,
  isOpen,
  onClose,
}: {
  client: ClientData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-zinc-950 rounded-lg max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {client.name}'s Details
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Email</span>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{client.email}</p>
          </div>
          {client.company && (
            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Company</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{client.company}</p>
            </div>
          )}
          {client.project && (
            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Project</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{client.project}</p>
            </div>
          )}
          {client.duration && (
            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Duration</span>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{client.duration}</p>
            </div>
          )}
          {(client.projectCost || client.partialCost || client.remainingCost) && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-2">
                {client.projectCost && client.projectCost > 0 && (
                  <div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Cost</span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      ${client.projectCost.toFixed(2)}
                    </p>
                  </div>
                )}
                {client.partialCost && client.partialCost > 0 && (
                  <div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Paid</span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      ${client.partialCost.toFixed(2)}
                    </p>
                  </div>
                )}
                {client.remainingCost && client.remainingCost > 0 && (
                  <div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Remaining</span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      ${client.remainingCost.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {client.details && (
            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Details</span>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{client.details}</p>
            </div>
          )}
          {client.stamp && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Stamp Details</span>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  Serial: {client.stamp.serial}
                </p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                  Signature: {client.stamp.signature}
                </p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  Seed: {client.stamp.seed}
                </p>
                <div className="flex gap-2">
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
          {client.isDue && (
            <div className="pt-2">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Payment Due
              </span>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Client Card Component
function ClientCard({
  client,
  onClick,
}: {
  client: ClientData;
  onClick: () => void;
}) {
  return (
    <Card
      className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
      onClick={onClick}
    >
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Serial: {client.stamp.serial}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {client.stamp.signature.substring(0, 16)}...
                </p>
              </div>
              <div className="flex gap-2">
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

export default function ClientsListPage() {
  const { clients, error } = useLoaderData<{ clients: ClientData[]; error: string | null }>();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (client: ClientData) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Clients
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your client database and view project details
            </p>
          </div>
          <Button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            variant="outline"
            className="border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={`Switch to ${view === "grid" ? "list" : "grid"} view`}
          >
            {view === "grid" ? "List View" : "Grid View"}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {clients.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                No clients found
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Start by onboarding your first client to see them listed here.
              </p>
            </div>
          </div>
        ) : (
          /* Clients Grid/List */
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {clients.map((client) => (
              <ClientCard
                key={client.key || client.email}
                client={client}
                onClick={() => handleCardClick(client)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <ClientDetailsModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Stats Footer */}
        {clients.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>{clients.length} total clients</span>
              <span>{clients.filter((c) => c.isDue).length} due payments</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}