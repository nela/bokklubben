export interface LoginHandler {
	emailAndPassword: (email: string, password: string) => () => Promise<void>;
}
