import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { getOAuthClient } from 'rwsdk-atp/oauth';
import { LoginForm } from '@/components/login-form';

export default async function Pages__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const did = ctx.session?.did ?? null;
	ctx.logger.info(`Logger from ctx: ${JSON.stringify(ctx.session)}`);

	let userHandle: string | null = null;
	if (did) {
		const oauthClient = await getOAuthClient(env);
		const oauthSession = await oauthClient.restore(did);
		let userPdsUrl = oauthSession.serverMetadata.issuer;
		if (!userPdsUrl.startsWith('http')) {
			userPdsUrl = `https://${userPdsUrl}`;
		}
		const handleRes = await fetch(`${userPdsUrl}/xrpc/com.atproto.repo.describeRepo?repo=${did}`);
		const handleData = (await handleRes.json()) as { handle?: string };
		userHandle = handleData.handle ?? null;
	}

	return (
		<>
			<p>Hey</p>
			{did ? (
				<section className="section">
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'baseline',
						}}
					>
						<h2 className="sectionTitle">Signed in{userHandle ? ` as @${userHandle}` : ''}</h2>
						<form method="post" action="/api/oauth/logout">
							<button type="submit" className="signOutButton">
								Sign out
							</button>
						</form>
					</div>
					<p className="prose">
						<code className="inlineCode">{did}</code>
					</p>
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
		</>
	);
}
