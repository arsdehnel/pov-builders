import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { createRequestLogger } from 'rwsdk-atp/logger';

export default function loggerMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): void {
	ctx.logger = createRequestLogger(request, true);
}
