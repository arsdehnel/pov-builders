import { AccessError } from '@arsdehnel/rwsdk-atp/errors';
import { getRequestInfo } from 'rwsdk/worker';

export function requireAuthentication(): void {
	const { ctx } = getRequestInfo();
	if (!ctx.user) {
		throw new AccessError(401, 'Authentication required');
	}
}
