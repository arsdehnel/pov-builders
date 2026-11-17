'use client';
import { Toast } from 'radix-ui';
import styles from './ds-toast.module.css';

export default function DSToast({
	open,
	onOpenChange,
	title,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
}): React.ReactNode {
	return (
		<Toast.Provider swipeDirection="right">
			<Toast.Root open={open} onOpenChange={onOpenChange} className={styles.dsToast} duration={3000}>
				<Toast.Title className={styles.dsToastTitle}>{title}</Toast.Title>
				<Toast.Close className={styles.dsToastClose} aria-label="Dismiss">
					×
				</Toast.Close>
			</Toast.Root>
			<Toast.Viewport className={styles.dsToastViewport} />
		</Toast.Provider>
	);
}
