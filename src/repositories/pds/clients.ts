import { env } from 'cloudflare:workers';
import { getOAuthClient, getPasswordClient } from '@arsdehnel/rwsdk-atp/auth';
import { Client } from '@atproto/lex';

export async function getServicePdsClient(): Promise<Client> {
	const session = await getPasswordClient(env);
	return new Client(session);
}

export async function getUserPdsClient(did: string): Promise<Client> {
	const oauthClient = await getOAuthClient(env);
	const session = await oauthClient.restore(did);
	return new Client(session);
}
