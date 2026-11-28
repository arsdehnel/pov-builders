import { env } from 'cloudflare:workers';
import { getOAuthClient, type NodeOAuthClient } from '@arsdehnel/rwsdk-atp/auth';
import type { RequestInfo } from 'rwsdk/worker';
import { DSAlert } from '@/components/design-system';
import { LoginForm } from '@/components/login-form';
import StandardLayout from '@/layouts/standard';

const LOGIN_ERRORS: Record<string, string> = {
	not_allowed: 'Your account is not currently permitted to access this site.',
};

export default async function Pages__auth__login({ ctx, request }: RequestInfo): Promise<React.JSX.Element> {
	const errorParam = new URL(request.url).searchParams.get('error');
	const errorMessage = errorParam ? (LOGIN_ERRORS[errorParam] ?? 'An error occurred during login.') : null;
	let did = ctx.session?.did ?? null;

	let userHandle: string | null = null;
	if (did) {
		let oauthClient: NodeOAuthClient | undefined;
		try {
			oauthClient = await getOAuthClient(env);
			const oauthSession = await oauthClient.restore(did);
			let userPdsUrl = oauthSession.serverMetadata.issuer;
			if (!userPdsUrl.startsWith('http')) {
				userPdsUrl = `https://${userPdsUrl}`;
			}
			const handleRes = await fetch(`${userPdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`);
			if (handleRes.ok) {
				const handleData = (await handleRes.json()) as { handle?: string };
				userHandle = handleData.handle ?? null;
			}
		} catch (err) {
			console.log(`Error fetching session for did ${did}: ${err}`);
			if (oauthClient) {
				await oauthClient.revoke(did);
			}
			// this will force the user to re-login which might not be great but is better than an error
			did = null;
		}
	}

	return (
		<StandardLayout siteSection="home" ctx={ctx}>
			{did ? (
				<section className="section">
					<p>Already logged in as {userHandle}</p>
				</section>
			) : (
				<section className="section">
					<h2 className="sectionTitle">Sign in with Bluesky</h2>
					{errorMessage && <DSAlert variant="error">{errorMessage}</DSAlert>}
					<p className="prose">
						Enter your Bluesky handle to authenticate via AT Protocol OAuth. You'll be redirected to Bluesky to approve access,
						then back here.
					</p>
					<LoginForm />
				</section>
			)}
		</StandardLayout>
	);
}
