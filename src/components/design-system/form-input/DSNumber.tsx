export function DSNumber({
	name,
	value,
	onBlur,
	onChange,
}: {
	name: string;
	value: string;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
	onChange: (value: string) => void;
}): React.ReactNode {
	return (
		<input
			id={name}
			type="number"
			name={name}
			value={value}
			onBlur={onBlur}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
		/>
	);
}
