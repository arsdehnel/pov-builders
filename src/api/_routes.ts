import { except, route } from 'rwsdk/router';
import { apiErrorResponse } from 'rwsdk-atp/response';

import oauthRoutes from './oauth';
import oauthClientMetadata from './oauth-client-metadata';
import topicsRoutes from './topics';
export default [
	except(error => apiErrorResponse(error, 'An error occurred', import.meta.env.DEV)),
	route('/oauth/callback', oauthRoutes.callback),
	route('/oauth/login', oauthRoutes.login),
	route('/oauth/logout', oauthRoutes.logout),
	route('/oauth-client-metadata', oauthClientMetadata),
	route('/topics', topicsRoutes.topics),
	route('/topics/:topicId', topicsRoutes.topic),
	route('/topics/:topicId/stances', topicsRoutes.topicStances),
	route('/topics/:topicId/stances/:stanceId', topicsRoutes.topicStance),
	route('/topics/:topicId/values', topicsRoutes.topicValues),
	route('/topics/:topicId/values/:valueId', topicsRoutes.topicValue),
	route('*', () => Response.json({ success: false, error: 'Not found' }, { status: 404 })),
];
