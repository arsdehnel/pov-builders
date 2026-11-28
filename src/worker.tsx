import { botMiddleware } from '@arsdehnel/rwsdk-atp/middleware';
import { handlePageError } from '@arsdehnel/rwsdk-atp/worker-error';
import { except, prefix, render, route } from 'rwsdk/router';
import { type DefaultAppContext, defineApp, type RequestInfo } from 'rwsdk/worker';
import apiRoutes from '@/api/_routes';
import wellKnownRoutes from '@/api/well-known/_routes';
import DefaultDocument from '@/documents/default';
import apiKeyMiddleware from '@/middleware/api-key';
import headersMiddleware from '@/middleware/headers';
import loggerMiddleware from '@/middleware/logger';
import permissionsMiddleware from '@/middleware/permissions';
import sessionMiddleware from '@/middleware/session';
import topicMiddleware from '@/middleware/topic';
import userMiddleware from '@/middleware/user';
import Pages__about from '@/pages/about';
import authRoutes from '@/pages/auth/_routes';
import builderRoutes from '@/pages/builders/_routes';
import devRoutes from '@/pages/dev/_routes';
import Pages__root from '@/pages/home';
import NotFound from '@/pages/not-found';
import profileRoutes from '@/pages/profile/_routes';

export { BrowserSessionDurableObject } from '@arsdehnel/rwsdk-atp/browser-sessions';
export { AtpOAuthDurableObject } from '@arsdehnel/rwsdk-atp/oauth';

const app = defineApp([
	botMiddleware,
	loggerMiddleware,
	topicMiddleware,
	headersMiddleware,
	sessionMiddleware,
	apiKeyMiddleware,
	userMiddleware,
	permissionsMiddleware,
	// did verification
	prefix('/.well-known', wellKnownRoutes),
	prefix('/api', apiRoutes),
	...(import.meta.env.DEV ? [prefix('/dev', devRoutes.default)] : []),
	render(DefaultDocument, [
		except<RequestInfo<DefaultAppContext>>(handlePageError),
		route('/', Pages__root),
		route('/about', Pages__about),
		prefix('/auth', authRoutes.default),
		prefix('/profile', profileRoutes.default),
		prefix('/builders', builderRoutes.default),
		route('*', NotFound),
	]),
]);

export default { fetch: app.fetch };
