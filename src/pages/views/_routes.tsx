import { route } from 'rwsdk/router';
import { requirePermissions } from '@/interrupters';
import Pages__views__survey from './survey';
import Pages__views__reflect from './survey/reflect';
import Pages__views__reflect_value from './survey/reflect-value';

export default {
	default: [
		route('/survey', [requirePermissions('topics:read', 'stances:read', 'values:read'), Pages__views__survey]),
		route('/survey/reflect', [requirePermissions('positions:read'), Pages__views__reflect]),
		route('/survey/reflect/:valueId', [requirePermissions('positions:read'), Pages__views__reflect_value]),
	],
};
