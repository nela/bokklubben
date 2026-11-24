import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { APIError, betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { compare, hash } from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import * as schema from './db/schema';

type SocialProviders = NonNullable<BetterAuthOptions['socialProviders']>;

/** Only register providers whose credentials are configured. */
function socialProviders(): SocialProviders {
	const providers: SocialProviders = {};

	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		providers.google = {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		};
	}
	if (env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET) {
		providers.microsoft = {
			clientId: env.MICROSOFT_CLIENT_ID,
			clientSecret: env.MICROSOFT_CLIENT_SECRET,
			tenantId: 'common'
		};
	}
	if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
		providers.github = {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		};
	}

	return providers;
}

function findMemberByEmail(email: string) {
	return db
		.select({ id: schema.members.id, userId: schema.members.userId })
		.from(schema.members)
		.where(eq(sql`lower(${schema.members.email})`, email.toLowerCase()))
		.limit(1)
		.then((rows) => rows.at(0));
}

/** BETTER_AUTH_URL in production and locally; the deployment URL on Vercel previews. */
const baseURL = env.BETTER_AUTH_URL ?? (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined);

export const auth = betterAuth({
	baseURL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	advanced: {
		// The auth tables' text ids have no database default, so Better Auth must create them.
		// ('uuid' would leave it to the database.)
		database: { generateId: () => crypto.randomUUID() }
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		password: {
			hash: (password) => hash(password, 10),
			verify: ({ hash: passwordHash, password }) => compare(password, passwordHash)
		}
	},
	socialProviders: socialProviders(),
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ['google', 'microsoft', 'github']
		}
	},
	databaseHooks: {
		user: {
			create: {
				// Invite only: a user can only be created for an email that exists in `members`
				// and hasn't been claimed yet.
				before: async (user) => {
					const member = await findMemberByEmail(user.email);
					if (!member || member.userId) {
						throw new APIError('FORBIDDEN', { message: 'Invited members only.' });
					}
				},
				after: async (user) => {
					await db
						.update(schema.members)
						.set({ userId: user.id })
						.where(eq(sql`lower(${schema.members.email})`, user.email.toLowerCase()));
				}
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});

export type Session = typeof auth.$Infer.Session;
