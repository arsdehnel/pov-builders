import { route } from 'rwsdk/router';
import { requirePermissions } from '@/interrupters';
import Pages__auth__login from './login';

export default {
	default: [route('/login', [requirePermissions('auth:login'), Pages__auth__login])],
};
