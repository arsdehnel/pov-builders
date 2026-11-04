import { prefix, render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import apiRoutes from '@/api/_routes';
import DefaultDocument from '@/documents/default';
import headersMiddleware from '@/middleware/headers';
import loggerMiddleware from '@/middleware/logger';
import sessionMiddleware from '@/middleware/session';
import Pages__root from '@/pages/home';

export { BrowserSessionDurableObject } from 'rwsdk-atp/browser-sessions';
export { OAuthTokenDurableObject } from 'rwsdk-atp/oauth';

export default defineApp([
	headersMiddleware,
	loggerMiddleware,
	sessionMiddleware,
	prefix('/api', apiRoutes),
	render(DefaultDocument, [route('/', Pages__root)]),
]);
