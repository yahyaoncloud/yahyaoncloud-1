// app/routes/$.tsx (for nested routes)

import { NotFound } from "../components/404";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  throw new Response("Not Found", { status: 404 });
};

export function CatchBoundary() {
  return <NotFound />;
}

export default function NotFoundRoute() {
  return <NotFound />;
}
