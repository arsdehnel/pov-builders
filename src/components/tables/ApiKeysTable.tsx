'use client';
import { CopyIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { deleteApiKey } from '@/actions/api-keys';
import { DSTable } from '@/components/design-system';
import type { ApiKeyDBRead, DSTableColumn, Permission } from '@/types';

export default function ApiKeysTable({
	apiKeys,
	userPermissions,
}: {
	apiKeys: ApiKeyDBRead[];
	userPermissions: Permission[];
}): React.ReactNode {
	const clipboardCopy = async (_val: string, rec: Record<string, unknown>): Promise<void> => {
		await navigator.clipboard.writeText(String(rec.apiKey));
		alert('API Key copied!');
	};

	const handleDelete = async (_val: string, rec: Record<string, unknown>): Promise<void> => {
		await deleteApiKey(String(rec.id));
		window.location.reload();
	};

	const rows = apiKeys.map(u => ({ ...u, editUrl: `/profile/api-keys/${u.id}` }));
	const apiColumns: DSTableColumn[] = [
		{ label: 'API Key', key: 'apiKey', render: (apiKey: string): string => apiKey.substring(0, 12) },
		{ label: 'Name', key: 'name' },
		{ label: 'Permissions', key: 'permissions' },
		{ label: 'Revoke At', key: 'revokeAt' },
		{ label: 'Created At', key: 'createdAt' },
		{
			label: 'Actions',
			key: 'actions',
			actions: [
				{
					type: 'button',
					handler: clipboardCopy,
					label: <CopyIcon />,
					requiredPermission: 'api-keys:copy',
				},
				{
					type: 'link',
					hrefProp: 'editUrl',
					label: <Pencil1Icon />,
					requiredPermission: 'api-keys:update',
				},
				{
					type: 'confirm-button',
					handler: handleDelete,
					label: <TrashIcon />,
					requiredPermission: 'api-keys:delete',
					confirmTitle: 'Delete API Key',
					confirmDescription: 'Are you sure you want to delete this API key? This cannot be undone.',
				},
			],
		},
	];

	return <DSTable columns={apiColumns} data={rows} userPermissions={userPermissions} rowIndex="apiKey" />;
}
