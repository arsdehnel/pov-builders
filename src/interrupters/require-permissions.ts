import { AccessError } from '@arsdehnel/rwsdk-atp/errors';
import { getRequestInfo } from 'rwsdk/worker';
import type { Permission } from '@/types';

export const requirePermissions = (...required: Permission[]): (() => Promise<void>) => {
	return async () => {
		const { ctx } = getRequestInfo();
		const missing = required.filter(p => !ctx.permissions?.includes(p));

		if (missing.length > 0) {
			throw new AccessError(403, 'Forbidden');
		}
	};
};
