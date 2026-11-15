import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__profile__api_keys from './api-keys';
import Pages__api_keys__edit from './edit-api-key';
import Pages__profile__root from './root';

export default {
	app: [
		route('/', [requireAuthentication, requirePermissions('profile:read'), Pages__profile__root]),
		route('/api-keys', [requireAuthentication, requirePermissions('profile:read'), Pages__profile__api_keys]),
		route('/api-keys/new', [requireAuthentication, requirePermissions('api-keys:read'), Pages__api_keys__edit]),
		route('/api-keys/:apiKeyId', [requireAuthentication, requirePermissions('api-keys:update'), Pages__api_keys__edit]),
	],
};
