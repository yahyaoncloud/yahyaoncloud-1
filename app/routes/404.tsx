import NotFoundComponent from "~/components/404";
import React from "react";

import { json } from "@remix-run/node";

export const action = async () => {
  return json(null, { status: 404 });
};

export default function NotFound() {
  return <NotFoundComponent />;
}

