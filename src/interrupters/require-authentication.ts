import { getRequestInfo } from 'rwsdk/worker';
import { AccessError } from 'rwsdk-atp/errors';

export function requireAuthentication(): void {
	const { ctx } = getRequestInfo();
	if (!ctx.user) {
		throw new AccessError(401, 'Authentication required');
	}
}
