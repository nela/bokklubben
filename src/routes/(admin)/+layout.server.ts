import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../(app)/$types";
import { PublicRoute, UserRoute } from "$lib/utils/constants";

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
  console.log('loading admin')
  if (!user) {
    return redirect(303, PublicRoute.Login);
  }

  if(!user.admin) {
    return redirect(303, UserRoute.Dashboard);
  }

  return {};
}
