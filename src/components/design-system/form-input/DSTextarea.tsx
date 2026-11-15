export function DSTextarea({
	name,
	value,
	onBlur,
	onChange,
}: {
	name: string;
	value: string;
	onBlur: React.FocusEventHandler<HTMLTextAreaElement>;
	onChange: (value: string) => void;
}): React.ReactNode {
	return (
		<textarea
			id={name}
			name={name}
			value={value}
			onBlur={onBlur}
			onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
		/>
	);
}
