import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import type { ApiKeyDBRead } from './api-keys';
import type { Permission } from './permissions';
import type { Session } from './sessions';
import type { TopicDBRead } from './topics';
import type { UserDBRead } from './users';

export interface AppContext {
	apiKey?: ApiKeyDBRead;
	logger: Logger;
	permissions: Permission[];
	session?: Session | null;
	topic?: TopicDBRead;
	user?: UserDBRead | undefined;
}
