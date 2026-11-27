import { env } from 'cloudflare:workers';

async function get(): Promise<Response> {
	return new Response(env.ATP_SERVICE_DID, {
		headers: { 'content-type': 'text/plain' },
	});
}

export default { get };
