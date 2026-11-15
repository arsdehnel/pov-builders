'use client';
import styleClasses from './ds-button.module.css';

export default function DSButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }): React.ReactNode {
	return (
		<button type="submit" disabled={isSubmitting} className={styleClasses['ds-button']}>
			{label}
		</button>
	);
}
