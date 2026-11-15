import { env } from 'cloudflare:workers';
import { ExitIcon } from '@radix-ui/react-icons';
import type { RequestInfo } from 'rwsdk/worker';
import { getOAuthClient, type NodeOAuthClient } from 'rwsdk-atp/oauth';
import { LoginForm } from '@/components/login-form';
import { topics } from '@/content';
import StandardLayout from '@/layouts/standard';
import { getStancesByTopicId, getTopicBySubdomain, getValuesByTopicId } from '@/repositories';
import { StatusPicker } from '@/styles/status-picker/status-picker';
import type { StanceDBRead, ValueDBRead } from '@/types';

export default async function Pages__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	let did = ctx.session?.did ?? null;
	ctx.logger.info(`Logger from ctx: ${JSON.stringify(ctx.session)}`);

	const topicFromDb = await getTopicBySubdomain(ctx.topic, ctx.logger);
	let valuesFromDb: ValueDBRead[] = [];
	let stancesFromDb: StanceDBRead[] = [];
	if (topicFromDb) {
		valuesFromDb = await getValuesByTopicId(topicFromDb.id, ctx.logger);
		stancesFromDb = await getStancesByTopicId(topicFromDb.id, ctx.logger);
	}
	const { values, stances } = topics[ctx.topic];

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
		<StandardLayout pageTitle="Home" currentBasePage="home" ctx={ctx}>
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
								<ExitIcon /> Sign out
							</button>
						</form>
					</div>
					<p className="prose">
						<code className="inlineCode">{did}</code>
					</p>
					<StatusPicker currentStatus={'🤷🏻‍♂️'} />
					<p>{JSON.stringify(values)}</p>
					<p>{JSON.stringify(stances)}</p>
					<p>{JSON.stringify(topicFromDb)}</p>
					<p>{JSON.stringify(valuesFromDb)}</p>
					<p>{JSON.stringify(stancesFromDb)}</p>
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
