import { goto } from '$app/navigation';
import { PublicRoute, UserRoute } from '$lib/utils/constants';
import { type UserCredential } from 'firebase/auth';

export async function performAuth(
  authFn: () => Promise<UserCredential>,
  signOut: () => Promise<void>
) {
  try {
    const userCredential = await authFn();
    const idToken = await userCredential.user.getIdToken();
    const response = await fetch(PublicRoute.Login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (response.ok) {
      goto(UserRoute.Dashboard);
    }

  } catch (e) {
    console.error(e)
  } finally {
    signOut()
  }
}
