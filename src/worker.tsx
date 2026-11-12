import { prefix, render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import apiRoutes from '@/api/_routes';
import DefaultDocument from '@/documents/default';
import headersMiddleware from '@/middleware/headers';
import loggerMiddleware from '@/middleware/logger';
import sessionMiddleware from '@/middleware/session';
import topicMiddleware from '@/middleware/topic';
import Pages__root from '@/pages/home';
import tapRegistrations from './tap/registrations';

export { BrowserSessionDurableObject } from 'rwsdk-atp/browser-sessions';
export { OAuthTokenDurableObject } from 'rwsdk-atp/oauth';

const app = defineApp([
	headersMiddleware,
	loggerMiddleware,
	sessionMiddleware,
	topicMiddleware,
	prefix('/api', apiRoutes),
	render(DefaultDocument, [route('/', Pages__root)]),
]);

export default {
	fetch: app.fetch,
	queue: tapRegistrations.workerQueueHelper,
};
