import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/utils/sso-auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return await authenticator.authenticate(params.provider as string, request);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await authenticator.authenticate(params.provider as string, request);
};
