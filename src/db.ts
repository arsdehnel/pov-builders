import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { _relations } from '@/models';

export default drizzle(env.D1_POV_BUILDERS, {
	relations: _relations,
});
