// routes/logout.tsx
import { logout } from "~/utils/session.server";

export const action = ({ request }: { request: Request }) => {
  return logout(request);
};

