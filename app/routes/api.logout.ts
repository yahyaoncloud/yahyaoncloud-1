import { json } from "@remix-run/node";
import { logout } from "../utils/session.server";

export const action = async ({ request }) => {
  return json({}, {
    headers: {
      "Set-Cookie": await logout(request),
    },
  });
};
