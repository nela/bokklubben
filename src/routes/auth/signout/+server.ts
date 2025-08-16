import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase, session, user, member } }) => {
	const { error } = await supabase.auth.signOut();
	if (error) {
		session = null;
		user = null;
		member = null
	}

	return redirect(303, '/auth')

}
