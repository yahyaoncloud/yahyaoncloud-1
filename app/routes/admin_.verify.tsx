import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState, useEffect } from "react";
import { getClientList } from "../utils/clients.server";
import { X } from "lucide-react";

interface ClientDetails {
    name: string;
    company?: string;
    project?: string;
    duration?: string;
    projectCost?: number;
    partialCost?: number;
    remainingCost?: number;
    isDue?: boolean;
    details?: string;
    status?: string;
}

interface LoaderData {
    serial: string | null;
    signature: string | null;
    isValid: boolean;
    error?: string;
    clientDetails?: ClientDetails;
    nextClient?: { serial: string; signature: string } | null;
}

const sanitize = (param: string | null) =>
    param ? param.trim().replace(/[^a-zA-Z0-9\-]/g, "") : "";

const obfuscate = (str: string | null) =>
    str ? (str.length > 6 ? `${str.slice(0, 6)}${"*".repeat(str.length - 6)}` : str) : "";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const url = new URL(request.url);
        let serial = sanitize(url.searchParams.get("sn"));
        let signature = sanitize(url.searchParams.get("sig"));

        const allClients = await getClientList();

        let client = null;
        let currentIndex = -1;

        if (serial && signature) {
            currentIndex = allClients.findIndex(
                (c) => c.stamp?.serial === serial && c.stamp?.signature === signature
            );
            client = currentIndex >= 0 ? allClients[currentIndex] : null;
        }

        if (!client && allClients.length > 0) {
            currentIndex = allClients.findIndex((c) => c.stamp?.serial && c.stamp?.signature);
            if (currentIndex >= 0) {
                client = allClients[currentIndex];
                serial = client.stamp!.serial;
                signature = client.stamp!.signature;
            }
        }

        if (!client) {
            return json<LoaderData>({
                serial,
                signature,
                isValid: false,
                error: "No valid clients available",
                nextClient: null,
            });
        }

        const clientDetails: ClientDetails = {
            name: client.name,
            company: client.company || "N/A",
            project: client.project || "N/A",
            duration: client.duration || "N/A",
            projectCost: client.projectCost || 0,
            partialCost: client.partialCost || 0,
            remainingCost: client.remainingCost || 0,
            isDue: client.isDue || false,
            details: client.details || "N/A",
            status: "Valid",
        };

        let nextClient = null;
        for (let i = currentIndex + 1; i < allClients.length; i++) {
            const c = allClients[i];
            if (c.stamp?.serial && c.stamp?.signature) {
                nextClient = { serial: c.stamp.serial, signature: c.stamp.signature };
                break;
            }
        }

        return json<LoaderData>({
            serial,
            signature,
            isValid: true,
            clientDetails,
            nextClient,
        });
    } catch (error) {
        return json<LoaderData>(
            { serial: null, signature: null, isValid: false, error: "Failed to load client data" },
            { status: 500 }
        );
    }
};

function ClientDetailsDisplay({ clientDetails }: { clientDetails: ClientDetails }) {
    return (
        <div className="space-y-2">
            <p className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Client Details:</p>
            <div className="rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-1">
                {Object.entries(clientDetails).map(([key, value]) => (
                    <p
                        key={key}
                        className="text-sm text-nowrap flex justify-between items-center p-2 text-zinc-700 dark:text-zinc-300"
                    >
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                        <span className="flex-1 mx-4 h-px bg-zinc-300 dark:bg-zinc-700" />
                        <span>
                            {key === "projectCost" || key === "partialCost" || key === "remainingCost"
                                ? `$${Number(value).toFixed(2)}`
                                : key === "isDue"
                                    ? value
                                        ? "Yes"
                                        : "No"
                                    : value}
                        </span>
                    </p>
                ))}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    const navigate = useNavigate();
    const data = useLoaderData<LoaderData>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => navigate("/admin/clients/onboard");

    const handleVerifyNext = () => {
        if (data.nextClient) {
            navigate(`/admin/verify?sn=${data.nextClient.serial}&sig=${data.nextClient.signature}`);
        } else {
            navigate("/admin/verify");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-950">
                <div className="flex flex-col items-center">
                    <svg
                        className="animate-spin h-8 w-8 text-zinc-500 dark:text-zinc-400"
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
                    <p className="mt-2 text-zinc-700 dark:text-zinc-300">Verifying...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-950">
            <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100">Client Verification</CardTitle>
                        <button
                            onClick={handleClose}
                            aria-label="Close"
                            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                        >
                            <X className="w-6 h-6 bg-red-600 text-white p-1 rounded" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="serial" className="text-zinc-900 dark:text-zinc-100">Serial Number</Label>
                        <Input
                            id="serial"
                            value={data.serial ? obfuscate(data.serial) : ""}
                            readOnly
                            disabled
                            className="mt-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-600"
                        />
                    </div>
                    <div>
                        <Label htmlFor="signature" className="text-zinc-900 dark:text-zinc-100">Signature</Label>
                        <Input
                            id="signature"
                            value={data.signature ? obfuscate(data.signature) : ""}
                            readOnly
                            disabled
                            className="mt-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-600"
                        />
                    </div>

                    {data.isValid && data.clientDetails ? (
                        <ClientDetailsDisplay clientDetails={data.clientDetails} />
                    ) : (
                        <p className="text-red-500 text-sm">{data.error || "Invalid client data"}</p>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleVerifyNext}
                            className="flex-1 bg-indigo-600 dark:bg-indigo-800 text-white hover:bg-indigo-700 dark:hover:bg-indigo-900"
                        >
                            Verify Next Client
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="flex-1 border-zinc-200 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                            Back to Onboarding
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}