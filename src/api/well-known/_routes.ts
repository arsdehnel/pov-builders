import { except, route } from 'rwsdk/router';
import { apiErrorResponse } from 'rwsdk-atp/response';

import atProtoDid from './atproto-did';

export default [
	except(error => apiErrorResponse(error, 'An error occurred', import.meta.env.DEV)),
	route('/atproto-did', atProtoDid),
	route('*', () => Response.json({ success: false, error: 'Not found' }, { status: 404 })),
];
