import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { login } from "../utils/auth";

export const loader: LoaderFunction = async ({ request, params }) => {
    const provider = params.provider as "github" | "google";
    if (!["github", "google"].includes(provider)) {
        return redirect("/admin/login");
    }
    return login(request, provider);
};