// utils/stampGenerator.ts
import { exec } from "child_process";
import path from "path";

export interface StampResult {
    serial: string;
    signature: string;
    seed: string;
    filePath: string;
    verificationUrl: string;
}

export function generateClientStamp(client: string, email: string): Promise<StampResult> {
    return new Promise((resolve, reject) => {
        const pythonPath = "python"; // adjust if python3 required
        const scriptPath = path.resolve("./stamp/stamp_generator.py");
        const outPath = path.resolve("./stamps", `${client}_stamp.svg`);

        const cmd = `${pythonPath} "${scriptPath}" --client "${client}" --email "${email}" --out "${outPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);

            // Example output parsing
            const serialMatch = stdout.match(/Serial:\s([A-F0-9]+)/);
            const sigMatch = stdout.match(/Signature:\s([A-F0-9-]+)/);
            const seedMatch = stdout.match(/Seed:\s(\d+)/);

            if (!serialMatch || !sigMatch || !seedMatch) return reject("Failed to parse stamp output");

            resolve({
                serial: serialMatch[1],
                signature: sigMatch[1],
                seed: seedMatch[1],
                filePath: outPath,
                verificationUrl: `https://yahyaoncloud.vercel.app/admin/verify?sn=${serialMatch[1]}&sig=${sigMatch[1]}`,
            });
        });
    });
}
