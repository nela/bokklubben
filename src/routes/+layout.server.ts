import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  console.log('locals');
  const { session, user } = await locals.safeGetSession()
  return {
    session,
    user,
    cookies: cookies.getAll(),
  }
}
