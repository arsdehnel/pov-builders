import type { Logger } from 'rwsdk-atp/logger';
import type { ApiKeyDBRead } from './api-keys';
import type { Permission } from './permissions';
import type { Session } from './sessions';
import type { UserDBRead } from './users';

export interface AppContext {
	apiKey?: ApiKeyDBRead;
	logger: Logger;
	permissions: Permission[];
	session?: Session | null;
	topic: string;
	user?: UserDBRead | undefined;
}
