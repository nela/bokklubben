export enum Routes {
	DASHBOARD = '/',
	MEMBERS = '/members',
	/** A club title's members: /members/titles/<slug>. */
	MEMBER_TITLES = '/members/titles',
	BOOKS = '/books',
	AUTHORS = '/authors',
	PROTOCOL = '/protocol',
	RULES = '/rules',
	ADMIN = '/admin'
}

export enum AdminRoutes {
	MEETS = '/admin/meets',
	BOOKS = '/admin/books',
	AUTHORS = '/admin/authors',
	MEMBERS = '/admin/members',
	TITLES = '/admin/titles',
	EMAILS = '/admin/emails'
}
