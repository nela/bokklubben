import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionCookie, verifySessionCookie } from "./session";
import { firebaseAdmin } from "../firebase/firebase.admin";
import { AuthInternalError } from "$lib/errors/auth";
import type { DecodedIdToken } from "firebase-admin/auth";

vi.mock('../firebase/firebase.admin', () => ({
  firebaseAdmin: {
    auth: vi.fn().mockReturnValue({
      createSessionCookie: vi.fn(),
      verifySessionCookie: vi.fn()
    })
  }
}));

describe.only('Session utilities', () => {
  afterEach(() => {
    vi.clearAllMocks();
  })
  describe('createSessionToken', () => {
    it('should return AuthenticationError when createSessionCookie fails', async () => {
      const errorMessage = 'SomethingBad';
      vi.mocked(firebaseAdmin.auth().createSessionCookie).mockRejectedValue(new Error(errorMessage));
      const idToken = 'idToken';
      const expiresIn = 1000;

      const res = await createSessionCookie(idToken, expiresIn);
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
    });

    it('should correctly return token on success', async () => {
      vi.mocked(firebaseAdmin.auth().createSessionCookie).mockResolvedValueOnce('token');
      const idToken = 'idToken';
      const expiresIn = 1000;

      const res = await createSessionCookie(idToken, expiresIn);

      expect(firebaseAdmin.auth().createSessionCookie).toHaveBeenCalledExactlyOnceWith(idToken, { expiresIn })
      expect(res._unsafeUnwrap()).toEqual('token');
    })
  });

  describe('createSessionToken', () => {
    it('should return AuthenticationError when createSessionCookie fails', async () => {
      const errorMessage = 'SomethingBad';
      vi.mocked(firebaseAdmin.auth().verifySessionCookie).mockRejectedValue(new Error(errorMessage));

      const res = await verifySessionCookie('fake-cookie')
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
    });

    it('should correctly return token on success', async () => {
      const expectedRes = { uid: 'uid' } as unknown as DecodedIdToken;
      vi.mocked(firebaseAdmin.auth().verifySessionCookie).mockResolvedValueOnce(expectedRes);

      const res = await verifySessionCookie('correct-token');

      expect(firebaseAdmin.auth().verifySessionCookie)
        .toHaveBeenCalledExactlyOnceWith('correct-token', true)
      expect(res._unsafeUnwrap()).toEqual(expectedRes);
    })
  });
});
