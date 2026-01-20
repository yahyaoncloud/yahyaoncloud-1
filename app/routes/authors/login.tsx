import { redirect, type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect('/login?type=author');
}

export default function AuthorLogin() {
  return null;
}
