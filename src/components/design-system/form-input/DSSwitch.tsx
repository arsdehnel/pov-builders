'use client';
import { Switch } from 'radix-ui';
import styleClasses from './ds-switch.module.css';

export function DSSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }): React.ReactNode {
	return (
		<Switch.Root
			onCheckedChange={onChange}
			value={checked as unknown as string}
			defaultChecked={checked}
			className={styleClasses.rzSwitchRoot}
		>
			<Switch.Thumb className={styleClasses.rzSwitchThumb} />
		</Switch.Root>
	);
}
