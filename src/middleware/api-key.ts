import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { d1 } from '@/repositories';

export default async function apiKeyMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): Promise<Response | undefined> {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return;
	}

	const key = authHeader.slice(7);
	try {
		const apiKey = await d1.getApiKeyByKey(key, ctx.logger);

		if (apiKey.revokeAt && new Date(apiKey.revokeAt) < new Date()) {
			return Response.json({ error: 'API key has been revoked' }, { status: 403 });
		}

		ctx.apiKey = apiKey;
		ctx.logger = ctx.logger.child({ userId: apiKey.userId });

		// Fetch the user so ctx.user is available for requireAuthentication checks
		ctx.user = await d1.getUserById(apiKey.userId, ctx.logger);
	} catch (err) {
		ctx.logger.warn(`Error in API key middleware: ${err}`);
		return Response.json({ error: 'Invalid API key' }, { status: 403 });
	}
}
