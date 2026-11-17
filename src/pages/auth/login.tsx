import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { getOAuthClient, type NodeOAuthClient } from 'rwsdk-atp/oauth';
import { LoginForm } from '@/components/login-form';
import StandardLayout from '@/layouts/standard';

export default async function Pages__auth__login({ ctx }: RequestInfo): Promise<React.JSX.Element> {
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
			const handleData = (await handleRes.json()) as { handle?: string };
			userHandle = handleData.handle ?? null;
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
		<StandardLayout pageTitle="Home" siteSection="home" ctx={ctx} userHandle={userHandle}>
			{did ? (
				<section className="section">
					<p>Already logged in as {userHandle}</p>
				</section>
			) : (
				<section className="section">
					<h2 className="sectionTitle">Sign in with Bluesky</h2>
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
