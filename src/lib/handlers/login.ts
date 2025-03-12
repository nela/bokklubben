import { goto } from "$app/navigation";
<<<<<<< HEAD:src/lib/handlers/signin.ts
import type { SignInHandler } from "$lib/components/signin/SignInHandler.model";
<<<<<<< HEAD:src/lib/handlers/login.ts
||||||| parent of 6f10dd6 (fixup! feat: signin component):src/lib/handlers/signin.ts
import type { SignInHandler } from "$lib/components/signin/SignInHandler.model";
import { Routes } from "$lib/routeConfig";
=======
import type { LoginHandler } from "$lib/components/login/LoginHandler.model";
import { Routes } from "$lib/routeConfig";
>>>>>>> 6f10dd6 (fixup! feat: signin component):src/lib/handlers/login.ts
||||||| parent of 02f9c2d (chore: routeconfig):src/lib/handlers/signin.ts
=======
import { Routes } from "$lib/routeConfig";
>>>>>>> 02f9c2d (chore: routeconfig):src/lib/handlers/signin.ts
import { signInWithEmailAndPassword, type Auth, type UserCredential } from "firebase/auth";

async function signIn(
  fn: (auth: Auth, ...args: any[]) => Promise<UserCredential>,
  fnAuth: Auth,
  ...fnArgs: any[]
) {
  try {
    const user = await fn(fnAuth, ...fnArgs);
    const idToken = await user.user.getIdToken();

    await fetch(Routes.signin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    goto('/')
  } catch (ex) {
    console.error(ex);
  } finally {
    fnAuth.signOut();
  }
}

export const createLoginHandler = (auth: Auth): LoginHandler => ({
  emailAndPassword: (email: string, password: string) =>
     () => signIn(signInWithEmailAndPassword, auth, email, password)
})
