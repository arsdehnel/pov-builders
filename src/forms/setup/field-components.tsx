'use client';
import { Form } from 'radix-ui';
import { DSFormInput } from '@/components/design-system';
import { useFieldContext } from './context';

type FieldMeta = {
	isValid: boolean;
	errors: unknown[];
};

function extractErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (typeof error === 'string') return error;
	if (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string'
	) {
		return (error as Record<string, unknown>).message as string;
	}
	return undefined;
}

function FieldComponent({
	label,
	required = false,
	name,
	meta,
	children,
	controlGroup = false,
}: {
	label: string;
	required?: boolean;
	name: string;
	meta: FieldMeta;
	children: React.ReactNode;
	controlGroup?: boolean;
}): React.ReactNode {
	if (controlGroup) {
		return (
			<Form.Field className="ds-form-field" name={name} asChild>
				<fieldset>
					<FieldLabel label={label} required={required} controlGroup={controlGroup} />
					<FieldError isValid={meta.isValid} errors={meta.errors} />
					<Form.Control asChild>{children}</Form.Control>
				</fieldset>
			</Form.Field>
		);
	}
	return (
		<Form.Field className="ds-form-field" name={name}>
			<FieldLabel label={label} required={required} controlGroup={controlGroup} />
			<FieldError isValid={meta.isValid} errors={meta.errors} />
			<Form.Control asChild>{children}</Form.Control>
		</Form.Field>
	);
}

function FieldLabel({
	label,
	required,
	controlGroup,
}: {
	label: string;
	required?: boolean;
	controlGroup?: boolean;
}): React.ReactNode {
	if (controlGroup) {
		return (
			<Form.Label className="ds-form-label" asChild>
				<legend>
					{label}
					{required && <span className="ds-form-input-required">*</span>}
				</legend>
			</Form.Label>
		);
	}
	return (
		<Form.Label className="ds-form-label">
			{label}
			{required && <span className="ds-form-input-required">*</span>}
		</Form.Label>
	);
}

function FieldError({ isValid, errors }: { isValid: boolean; errors: unknown[] }): React.ReactNode {
	if (isValid) {
		return null;
	}
	const messages = errors.map(extractErrorMessage).filter(Boolean) as string[];
	if (messages.length === 0) {
		return null;
	}
	return (
		<div className="ds-form-field-error">
			{messages.map((message, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: error list has no stable key
				<Form.Message key={i} className="ds-form-message" forceMatch={true}>
					{message}
				</Form.Message>
			))}
		</div>
	);
}

export function CheckboxGroupInput({
	label,
	required = false,
	options,
}: {
	label: string;
	required?: boolean;
	options: Array<{ value: string; label: string }>;
}): React.ReactNode {
	const field = useFieldContext<string[]>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta} controlGroup>
			<DSFormInput.DSCheckboxGroup
				options={options}
				value={field.state.value}
				onChange={(values: string[]) => {
					field.handleChange(values);
					field.handleBlur();
				}}
			/>
		</FieldComponent>
	);
}

export function DateInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<DSFormInput.DSDate name={field.name} value={field.state.value} onBlur={field.handleBlur} onChange={field.handleChange} />
		</FieldComponent>
	);
}

export function NumberInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<DSFormInput.DSNumber name={field.name} value={field.state.value} onBlur={field.handleBlur} onChange={field.handleChange} />
		</FieldComponent>
	);
}

export function SelectInput({
	label,
	required = false,
	options,
}: {
	label: string;
	required?: boolean;
	options: Array<{ value: string; label: string }>;
}): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<DSFormInput.DSSelect
				value={field.state.value}
				onChange={(value: string): void => {
					field.handleChange(value);
					field.handleBlur();
				}}
				options={options}
			/>
		</FieldComponent>
	);
}

export function SwitchInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<boolean>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<DSFormInput.DSSwitch checked={field.state.value} onChange={field.handleChange} />
		</FieldComponent>
	);
}

export function TextareaInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<DSFormInput.DSTextarea
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
			/>
		</FieldComponent>
	);
}

export function TextInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<DSFormInput.DSText name={field.name} value={field.state.value} onBlur={field.handleBlur} onChange={field.handleChange} />
		</FieldComponent>
	);
}
