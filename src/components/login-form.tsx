'use client';

import { EnterIcon } from '@radix-ui/react-icons';
import { Label } from 'radix-ui';
import { useState } from 'react';
import styles from './login-form.module.css';

export function LoginForm(): React.ReactNode {
	const [handle, setHandle] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await fetch('/api/oauth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ handle }),
			});

			const data = (await res.json()) as { redirectUrl?: string; error?: string };
			if (data.redirectUrl) {
				window.location.href = data.redirectUrl;
			} else {
				setError(data.error ?? 'Login failed. Check your handle and try again.');
				setLoading(false);
			}
		} catch (err) {
			console.error('Error during login:', err);
			setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.inputRow}>
				<Label.Root className="LabelRoot" htmlFor="firstName">
					First name
				</Label.Root>
				<input
					type="text"
					value={handle}
					onChange={(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => setHandle(e.target.value)}
					placeholder="your.handle.test"
					disabled={loading}
					className={styles.input}
					aria-label="AT Protocol handle"
				/>
				<button type="submit" disabled={loading || !handle.trim()} className={styles.button}>
					{loading ? (
						'Redirecting…'
					) : (
						<>
							<EnterIcon />
							Sign in with Atmosphere
						</>
					)}
				</button>
			</div>
			{error && <p className={styles.error}>{error}</p>}
		</form>
	);
}
