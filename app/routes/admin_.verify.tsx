import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useState, useEffect } from "react";
import { getClientByCredentials } from "../utils/firebase.server";

interface ClientDetails {
    name: string;
    company?: string;
    project?: string;
    status?: string;
}

interface LoaderData {
    serial: string | null;
    signature: string | null;
    isValid: boolean;
    error?: string;
    verificationLink: string;
    clientDetails?: ClientDetails;
}

// Helper: sanitize query parameters
const sanitize = (param: string | null) =>
    param ? param.trim().replace(/[^a-zA-Z0-9\-]/g, "") : "";

// Helper: obfuscate serial/signature for display
const obfuscate = (str: string | null) =>
    str ? (str.length > 6 ? `${str.slice(0, 6)}${"*".repeat(str.length - 6)}` : str) : "";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const serial = sanitize(url.searchParams.get("sn"));
    const signature = sanitize(url.searchParams.get("sig"));
    const verificationLink = `${url.origin}/admin/verify?sn=${serial}&sig=${signature}`;

    if (!serial || !signature) {
        return json<LoaderData>({
            serial,
            signature,
            isValid: false,
            error: "Missing serial number or signature",
            verificationLink,
        });
    }

    const client = await getClientByCredentials(serial, signature);

    if (!client) {
        return json<LoaderData>({
            serial,
            signature,
            isValid: false,
            error: "Invalid credentials",
            verificationLink,
        });
    }

    const clientDetails: ClientDetails = {
        name: client.name,
        company: client.company,
        project: client.project,
        status: "valid",
    };

    return json<LoaderData>({
        serial,
        signature,
        isValid: true,
        verificationLink,
        clientDetails,
    });
};

// React component
export default function VerifyPage() {
    const data = useLoaderData<LoaderData>();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    // Tailwind classes
    const bgColor = "bg-zinc-100 dark:bg-zinc-950";
    const inputBg = "bg-zinc-100 dark:bg-zinc-700";
    const inputBorder = "border-zinc-200 dark:border-zinc-600";
    const textColor = "text-zinc-900 dark:text-zinc-100";
    const textSubtle = "text-zinc-700 dark:text-zinc-300";
    const buttonStyle = "w-full bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-500";

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(data.verificationLink);
            toast({ title: "Copied!", description: "Verification link copied to clipboard.", className: "bg-zinc-800 text-zinc-100 border-zinc-700" });
        } catch {
            toast({ title: "Copy Failed", description: "Unable to copy link.", variant: "destructive" });
        }
    };

    const handleVerifyAnother = () => window.location.href = "/admin/verify";

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${bgColor}`}>
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-zinc-500 dark:text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className={`mt-2 ${textSubtle}`}>Verifying...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 ${bgColor}`}>
            <Card className={`w-full max-w-md ${inputBg} border-zinc-200 dark:border-zinc-700`}>
                <CardHeader>
                    <CardTitle className={`text-xl ${textColor}`}>Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="serial" className={textColor}>Serial Number</Label>
                        <Input id="serial" value={obfuscate(data.serial)} readOnly disabled className={`mt-1 ${inputBg} ${textColor} ${inputBorder}`} />
                    </div>
                    <div>
                        <Label htmlFor="signature" className={textColor}>Signature</Label>
                        <Input id="signature" value={obfuscate(data.signature)} readOnly disabled className={`mt-1 ${inputBg} ${textColor} ${inputBorder}`} />
                    </div>

                    {data.isValid ? (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <svg className={`h-5 w-5 text-green-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-green-600 text-sm">Verification successful</p>
                            </div>

                            <div className="space-y-1 mt-2">
                                <p className={`${textColor} text-sm font-medium`}>Client Details:</p>
                                <div className={`rounded-lg p-3 ${inputBg} space-y-1`}>
                                    {data.clientDetails && Object.entries(data.clientDetails).map(([key, value]) => (
                                        <p key={key} className={`${textSubtle} text-sm`}>
                                            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        data.error && <p className={`text-red-500 text-sm`}>{data.error}</p>
                    )}

                    <div className="space-y-2 mt-4">
                        <Button onClick={handleCopyLink} className={buttonStyle}>Copy Verification Link</Button>
                        <Button onClick={handleVerifyAnother} className={buttonStyle}>Verify Another</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
