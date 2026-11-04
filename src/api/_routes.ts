import { route } from 'rwsdk/router';
import oauthCallback from './oauth/callback';
import oauthLogin from './oauth/login';
import oauthLogout from './oauth/logout';
import oauthClientMetadata from './oauth-client-metadata';

export default [
	// except(error => apiErrorResponse(error)),
	route('/oauth/login', oauthLogin),
	route('/oauth/callback', oauthCallback),
	route('/oauth/logout', oauthLogout),
	route('/oauth-client-metadata', oauthClientMetadata),
	route('*', () => Response.json({ success: false, error: 'Not found' }, { status: 404 })),
];
