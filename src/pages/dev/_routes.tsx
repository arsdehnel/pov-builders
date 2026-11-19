import { route } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';

async function setDevTopic({ params, request }: RequestInfo): Promise<Response> {
	(globalThis as { __devTopic?: string }).__devTopic = params.subdomain;
	const redirectTo = request.headers.get('Referer') ?? '/';
	return new Response(null, { status: 302, headers: { Location: redirectTo } });
}

export default {
	default: [route('/topic/:subdomain', setDevTopic)],
};
