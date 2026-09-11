import { redirect } from "@remix-run/node";
import { getActiveResume } from "~/Services/resume.server";

export async function loader() {
  const activeResume = await getActiveResume();

  if (!activeResume) {
    throw new Response("Resume not found", { status: 404 });
  }

  // The ID is dynamic, so we fetch it from the active resume.
  return redirect(`/resources/download/resume/${activeResume.id}`);

}
