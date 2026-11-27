import { env } from 'cloudflare:workers';
import { getOAuthClient } from 'rwsdk-atp/auth';

async function get(): Promise<Response> {
	const client = await getOAuthClient(env);
	return Response.json(client.clientMetadata);
}

export default { get };
