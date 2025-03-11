import { firebaseAdmin } from "$lib/server/firebase.admin";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handle } from "./hooks.server";

vi.mock('$lib/server/firebase.admin', () => ({
  firebaseAdmin: { auth: vi.fn() }
}));

describe('server hook', () => {
  let event: any;
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    event = {
      cookies: {
        get: vi.fn()
      },
      locals: {},
      url: new URL('http://localhost:5173/')
    };
  });

  it('should throw redirect if no session cookie', async () => {
    event.cookies.get.mockReturnValue(undefined);
    const resolveFn = vi.fn()
    const res = handle({ event, resolve: resolveFn })

    expect(event.cookies.get).toHaveBeenCalledExactlyOnceWith('session');
    await expect(res).rejects.toEqual({ status: 303, location: '/login' })
    expect(event.locals.userSession).toBeUndefined();
    expect(resolveFn).not.toHaveBeenCalled();
  });

  it('should throw redirect when verifySessionCookie throws error', async () => {
    event.cookies.get.mockReturnValue('invalid-session-cookie');
    vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
      verifySessionCookie: vi.fn().mockRejectedValueOnce(new Error('invalid cookie'))
    } as any);

    const resolveFn = vi.fn();
    const res = handle({ event, resolve: resolveFn });
    await expect(res).rejects.toEqual({ status: 303, location: '/login' });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(event.locals.userSession).toBeUndefined();
    expect(resolveFn).not.toHaveBeenCalled();
  });

  it('should throw redirect if no decoded id token is found', async () => {
    event.cookies.get.mockReturnValue('not-existing-session-cookie');
    vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
      verifySessionCookie: vi.fn().mockReturnValueOnce(undefined)
    } as any);

    const resolveFn = vi.fn();
    const res = handle({ event, resolve: resolveFn });
    await expect(res).rejects.toEqual({ status: 303, location: '/login' });
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(event.locals.userSession).toBeUndefined();
    expect(resolveFn).not.toHaveBeenCalled();
  });

  it('should throw redirect if no decoded id token is found', async () => {
    event.cookies.get.mockReturnValue('session-cookie');
    vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
      verifySessionCookie: vi.fn().mockReturnValueOnce(undefined)
    } as any);

    const resolveFn = vi.fn();
    const res = handle({ event, resolve: resolveFn });
    await expect(res).rejects.toEqual({ status: 303, location: '/login' });
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(event.locals.userSession).toBeUndefined();
    expect(resolveFn).not.toHaveBeenCalled();
  });

  it('should return response to request with correct cookie', async () => {
    const decodedToken = {
      uid: 'uid', email: 'n@n.no'
    };
    event.cookies.get.mockReturnValue('session-cookie');
    vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
      verifySessionCookie: vi.fn().mockReturnValueOnce(decodedToken)
    } as any);

    const resolveFn = vi.fn().mockResolvedValueOnce(new Response());
    const res = await handle({ event, resolve: resolveFn });

    expect(res).toBeTruthy();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(event.locals.userSession).toEqual(decodedToken)
    expect(resolveFn).toHaveBeenCalledOnce();
  });
});
