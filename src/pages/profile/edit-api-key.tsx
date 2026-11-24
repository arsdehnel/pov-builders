import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { DSPopMenu } from '@/components/design-system';
import ApiKeyForm from '@/forms/api-key';
import StandardLayout from '@/layouts/standard';
import { d1 } from '@/repositories';
import type { ApiKeyDBRead } from '@/types';

export default async function Pages__profile__edit_api_key({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const apiKeyId = params.apiKeyId;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	let apiKey: ApiKeyDBRead | undefined;

	if (!apiKeyId) {
		apiKey = undefined;
	} else {
		apiKey = await d1.getApiKeyById(params.apiKeyId, ctx.logger);
	}

	return (
		<StandardLayout siteSection="profile" ctx={ctx}>
			<Suspense fallback={<div>Loading API Key...</div>}>
				<h3>{apiKey?.id ? `Edit ${apiKey.name}` : 'New API Key'}</h3>
				{apiKey?.id && (
					<DSPopMenu
						userPermissions={ctx.permissions}
						items={[
							{
								requiredPermission: 'api-keys:read',
								label: 'View',
								href: `/api-keys/${apiKey?.id}`,
							},
						]}
					/>
				)}
				<ApiKeyForm apiKey={apiKey} currentUserId={userId} />
			</Suspense>
		</StandardLayout>
	);
}
