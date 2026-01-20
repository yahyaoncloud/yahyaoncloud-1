import { redirect } from '@remix-run/node';
import { destroyAuthorSession } from '~/utils/author-auth.server';

export async function loader() {
  return redirect('/login', {
    headers: {
      'Set-Cookie': destroyAuthorSession()
    }
  });
}

export async function action() {
  return redirect('/login', {
    headers: {
      'Set-Cookie': destroyAuthorSession()
    }
  });
}
