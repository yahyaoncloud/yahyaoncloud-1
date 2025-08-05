import { json } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";

export const action = async ({ request }) => {
  const body = await request.json();
  const session = await sessionStorage.getSession();
  session.set("user", {
    uid: body.uid,
    displayName: body.displayName,
    photoURL: body.photoURL,
  });

  return json(
    {},
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
};
