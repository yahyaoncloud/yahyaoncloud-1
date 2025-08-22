import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useState, useEffect } from "react";

// Types
interface ClientDetails {
    name: string;
    store: string;
    project: string;
    status: string;
}

interface LoaderData {
    serial: string | null;
    signature: string | null;
    isValid: boolean;
    error?: string;
    verificationLink: string;
    clientDetails: ClientDetails;
}

// Configuration
const VERIFICATION_CONFIG = {
    expectedCredentials: {
        serial: "7EF9E713D1D7",
        signature: "8621E823-5569-4A69-8BE6-B81FCF0FDD7C",
        seed: 1985868552
    },
    loadingDelay: 1000
} as const;

// Utility functions
const verifyCredentials = (serial: string, signature: string, seed: number) => {
    const { expectedCredentials } = VERIFICATION_CONFIG;
    return (
        serial === expectedCredentials.serial &&
        signature === expectedCredentials.signature &&
        seed === expectedCredentials.seed
    );
};

const obfuscate = (str: string | null) =>
    str ? (str.length > 6 ? `${str.slice(0, 6)}${"*".repeat(str.length - 6)}` : str) : "";

const sanitize = (param: string | null) =>
    param ? param.trim().replace(/[^a-zA-Z0-9\-]/g, "") : null;

// Loader function
export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const url = new URL(request.url);
        const serial = sanitize(url.searchParams.get("sn"));
        const signature = sanitize(url.searchParams.get("sig"));
        const verificationLink = `${url.origin}/verify?sn=${serial || ""}&sig=${signature || ""}`;

        const clientDetails: ClientDetails = {
            name: "Rahil Irfan",
            store: "The House Of Pickles",
            project: "Confidential",
            status: "valid"
        };

        if (!serial || !signature) {
            return json<LoaderData>({ serial, signature, isValid: false, error: "Missing serial number or signature", verificationLink, clientDetails });
        }

        const isValid = verifyCredentials(serial, signature, VERIFICATION_CONFIG.expectedCredentials.seed);

        return json<LoaderData>({ serial, signature, isValid, error: isValid ? undefined : "Invalid credentials", verificationLink, clientDetails });

    } catch (error) {
        console.error("Verification error:", error);
        return json<LoaderData>({
            serial: null,
            signature: null,
            isValid: false,
            error: "System error occurred",
            verificationLink: "",
            clientDetails: { name: "Unknown", store: "Unknown", project: "Unknown", status: "Unknown" }
        }, { status: 500 });
    }
};

// Page Component
export default function VerifyPage() {
    const data = useLoaderData<LoaderData>();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const bgColor = "bg-zinc-100 dark:bg-zinc-950";
    const inputBg = "bg-zinc-100 dark:bg-zinc-700";
    const inputBorder = "border-zinc-200 dark:border-zinc-600";
    const textColor = "text-zinc-900 dark:text-zinc-100";
    const textSubtle = "text-zinc-700 dark:text-zinc-300";
    const buttonStyle = "w-full bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-500";

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), VERIFICATION_CONFIG.loadingDelay);
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

    const handleVerifyAnother = () => window.location.reload();

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
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
        <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
            <Card className={`w-full max-w-md ${inputBg} border-zinc-200 dark:border-zinc-700`}>
                <CardHeader>
                    <CardTitle className={`text-xl ${textColor}`}>Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Credential Inputs */}
                    <div>
                        <Label htmlFor="serial" className={textColor}>Serial Number</Label>
                        <Input id="serial" value={obfuscate(data.serial)} readOnly disabled className={`mt-1 ${inputBg} ${textColor} ${inputBorder}`} />
                    </div>
                    <div>
                        <Label htmlFor="signature" className={textColor}>Signature</Label>
                        <Input id="signature" value={obfuscate(data.signature)} readOnly disabled className={`mt-1 ${inputBg} ${textColor} ${inputBorder}`} />
                    </div>

                    {/* Verification Status */}
                    {data.isValid && (
                        <div className="flex items-center space-x-2">
                            <svg className={`h-5 w-5 ${textSubtle}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className={`${textSubtle} text-sm`}>Verification successful</p>
                        </div>
                    )}

                    {/* Client Details */}
                    {data.isValid && (
                        <div className="space-y-2">
                            <p className={`${textColor} text-sm font-medium`}>Client Details:</p>
                            <div className={`rounded-lg p-3 ${inputBg} space-y-1`}>
                                {Object.entries(data.clientDetails).map(([key, value]) => (
                                    <p key={key} className={`${textSubtle} text-sm`}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {data.error && <p className={`${textSubtle} text-sm`}>{data.error}</p>}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button onClick={handleCopyLink} className={buttonStyle}>Copy Verification Link</Button>
                        <Button onClick={handleVerifyAnother} className={buttonStyle}>Verify Another</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
