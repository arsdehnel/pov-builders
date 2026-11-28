import { createRequestLogger } from '@arsdehnel/rwsdk-atp/logger';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

export default function loggerMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): void {
	ctx.logger = createRequestLogger(request, import.meta.env.DEV);
}
