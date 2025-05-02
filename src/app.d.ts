// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			// user: { uid: string; email: string; admin: boolean } | undefined;
			session: string | undefined;
      supabase: SupabaseClient<Database>
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
      session: Session | null
      user: User | null
		}
		// interface Error {}
		interface PageData {
      session: Session | null;
    }
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
