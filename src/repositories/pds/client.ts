import { env } from 'cloudflare:workers';
import { Client } from '@atproto/lex';
import { getPasswordClient } from 'rwsdk-atp/auth';

export async function getServicePdsClient(): Promise<Client> {
	const session = await getPasswordClient(env);
	return new Client(session);
}
