import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getActiveResume } from "~/Services/resume.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const activeResume = await getActiveResume();

  if (!activeResume) {
    throw new Response("Resume not found", { status: 404 });
  }

  // Redirect to the secure proxy route which serves the PDF inline (viewer mode)
  // The ID is dynamic, so we fetch it from the active resume.
  return redirect(`/resources/download/resume/${activeResume.id || activeResume._id}`);
}
