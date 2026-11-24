import { env } from 'cloudflare:workers';
import { Client } from '@atproto/lex';
import { getOAuthClient, getPasswordClient } from 'rwsdk-atp/auth';

export async function getServicePdsClient(): Promise<Client> {
	const session = await getPasswordClient(env);
	return new Client(session);
}

export async function getUserPdsClient(did: string): Promise<Client> {
	const oauthClient = await getOAuthClient(env);
	const session = await oauthClient.restore(did);
	return new Client(session);
}
