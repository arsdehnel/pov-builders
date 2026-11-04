import type { Session as BrowserSession } from 'rwsdk-atp/browser-sessions';
import type { Permission } from './permissions';

export interface Session extends BrowserSession {
	permissionsOverride?: Permission[];
}
