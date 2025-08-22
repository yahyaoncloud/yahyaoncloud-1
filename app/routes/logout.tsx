import type { ActionFunction } from "@remix-run/node";
import { logout } from "../utils/auth";

export const action: ActionFunction = async ({ request }) => {
    return logout(request);
};

export default function Logout() {
    return (
        <form method="post">
            <button type="submit">Logout</button>
        </form>
    );
}