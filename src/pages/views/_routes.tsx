import { route } from 'rwsdk/router';
import { requirePermissions } from '@/interrupters';
import Pages__views__survey from './survey';

export default {
	default: [route('/survey', [requirePermissions('positions:read'), Pages__views__survey])],
};
