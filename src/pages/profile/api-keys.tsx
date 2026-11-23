import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { DSLink } from '@/components/design-system';
import ApiKeysTable from '@/components/tables/ApiKeysTable';
import StandardLayout from '@/layouts/standard';
import { getApiKeysByUserId } from '@/repositories';

export default async function Pages__profile__api_keys({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	try {
		const apiKeys = await getApiKeysByUserId(userId, ctx.logger);
		return (
			<StandardLayout siteSection="profile" ctx={ctx}>
				<h2>API Keys</h2>
				<Suspense fallback={<div>Loading API keys...</div>}>
					<ApiKeysTable apiKeys={apiKeys} userPermissions={ctx.permissions} />
				</Suspense>
				<DSLink
					userPermissions={ctx.permissions}
					requiredPermission="api-keys:create"
					label="New API Key"
					href="/profile/api-keys/new"
				/>
			</StandardLayout>
		);
	} catch (err) {
		ctx.logger.error('Failed to fetch API keys', { err });
		return (
			<StandardLayout siteSection="profile" ctx={ctx}>
				<h2>API Keys</h2>
				<p className="error">{import.meta.env.DEV && err instanceof Error ? err.message : 'Something went wrong.'}</p>
			</StandardLayout>
		);
	}
}
