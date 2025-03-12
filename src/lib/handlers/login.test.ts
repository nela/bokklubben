import { signInWithEmailAndPassword } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goto } from "$app/navigation";
<<<<<<< HEAD:src/lib/handlers/login.test.ts
import { createLoginHandler } from "./login";
||||||| parent of 02f9c2d (chore: routeconfig):src/lib/handlers/signin.test.ts
import { createSignInHandler } from "./signin";
=======
import { createSignInHandler } from "./signin";
import { Routes } from "$lib/routeConfig";
>>>>>>> 02f9c2d (chore: routeconfig):src/lib/handlers/signin.test.ts

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn()
}));

describe('Signin handler', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');
  const fetchSpy = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    consoleErrorSpy.mockImplementationOnce(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call signOut on succesful sign in', async () => {
    vi.mocked(signInWithEmailAndPassword).mockReturnValueOnce({
        user: { getIdToken: vi.fn().mockResolvedValueOnce('fake-id-token') }
    } as any);

    fetchSpy.mockResolvedValueOnce(new Response(Routes.signin, { status: 200 }));

    const mockAuth = { signOut: vi.fn() };

    const handler = createLoginHandler(mockAuth as any);
    await handler.emailAndPassword('n@n.no', '123456')();

    expect(signInWithEmailAndPassword).toHaveBeenCalledOnce();
    expect(signInWithEmailAndPassword).toHaveBeenCalledExactlyOnceWith(
      mockAuth, 'n@n.no', '123456'
    );
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(Routes.signin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"idToken":"fake-id-token"}'
    });
    expect(mockAuth.signOut).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should call signOut on failed sign in', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error);

    fetchSpy.mockImplementationOnce(() =>
      Promise.resolve(new Response(Routes.signin, { status: 200 }))
    );

    const mockAuth = { signOut: vi.fn() };

    const handler = createLoginHandler(mockAuth as any);
    await handler.emailAndPassword('n@n.no', '123456')();

    expect(signInWithEmailAndPassword).toHaveBeenCalledOnce();
    expect(signInWithEmailAndPassword).toHaveBeenCalledExactlyOnceWith(
      mockAuth, 'n@n.no', '123456'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockAuth.signOut).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(goto).not.toHaveBeenCalled();
  });

  it.only('should call signOut when fetch call fails', async () => {
    vi.mocked(signInWithEmailAndPassword).mockReturnValueOnce({
        user: { getIdToken: vi.fn().mockResolvedValueOnce('fake-id-token') }
    } as any);
    fetchSpy.mockRejectedValueOnce(new Error())
    const mockAuth = { signOut: vi.fn() };

    const handler = createLoginHandler(mockAuth as any);
    await handler.emailAndPassword('n@n.no', '123456')();

    expect(signInWithEmailAndPassword).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(mockAuth.signOut).toHaveBeenCalledOnce();
    expect(goto).not.toHaveBeenCalled();
  });
});
