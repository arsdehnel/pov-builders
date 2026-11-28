'use client';
import { toFormErrors } from '@arsdehnel/rwsdk-atp/response';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveApiKey } from '@/actions/api-keys';
import permissions from '@/data/permissions';
import { apiKeysSchemas } from '@/schemas';
import type { ApiKeyFormInput } from '@/types';
import { useAppForm } from './setup/context';
import { FormDevtools } from './setup/FormDevtools';

export default function ApiKeyForm({
	apiKey,
	currentUserId,
}: {
	apiKey?: ApiKeyFormInput;
	currentUserId: string;
}): React.ReactNode {
	const [saved, setSaved] = useState(false);

	const newApiKeyDefaults: ApiKeyFormInput = {
		permissions: [],
		name: '',
		userId: currentUserId,
		revokeAt: '',
	};

	const form = useAppForm({
		formId: 'api-key',
		defaultValues: apiKey ? apiKey : newApiKeyDefaults,
		validators: {
			onBlur: apiKeysSchemas.form,
			onSubmitAsync: async ({
				value,
			}: {
				value: ApiKeyFormInput;
			}): Promise<{ form?: string; fields: Record<string, string> } | undefined> => {
				const result = await saveApiKey(value);
				if (result.success) {
					setSaved(true);
					return;
				}
				return toFormErrors(result);
			},
		},
	});

	const permissionsOptions: Array<{ value: string; label: string }> = [];
	for (const [resource, actions] of Object.entries(permissions)) {
		for (const [action] of Object.entries(actions)) {
			permissionsOptions.push({
				label: `${resource}:${action}`,
				value: `${resource}:${action}`,
			});
		}
	}

	const buttonText = apiKey ? 'Save API Key' : 'Create API Key';

	return (
		<>
			<Form.Root
				className="ds-form"
				onSubmit={(e: React.FormEvent): void => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				<form.AppField name="name">{(field): React.ReactNode => <field.TextInput label="Name" required />}</form.AppField>
				<form.AppField name="revokeAt">
					{(field): React.ReactNode => <field.DateInput label="Revoke At" required />}
				</form.AppField>
				<form.AppField name="permissions">
					{(field): React.ReactNode => <field.CheckboxGroupInput label="Permissions" required options={permissionsOptions} />}
				</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form Subscribe callbacks — parameter types are deep internal generics impractical to annotate */}
				<form.Subscribe selector={state => state.errorMap.onSubmit}>
					{error => (error ? <p className="error">{String(error)}</p> : null)}
				</form.Subscribe>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form Subscribe callbacks — parameter types are deep internal generics impractical to annotate */}
				{saved && <p className="success">API Key saved!</p>}
				<form.AppForm>
					<form.SubmitButton label={buttonText} />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
