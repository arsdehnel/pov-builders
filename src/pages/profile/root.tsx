import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';

export default async function Pages__profile__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<StandardLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav="profile">
			<h2>Profile Info</h2>
			<ul>
				<li>ID: {ctx.user?.id}</li>
				<li>DID: {ctx.user?.did}</li>
				<li>Handle: {ctx.user?.handle}</li>
				<li>Role: {ctx.user?.role}</li>
				<li>Created: {ctx.user?.createdAt}</li>
			</ul>
			<h3>Permissions</h3>
			<ul>
				{ctx.permissions.map(p => {
					return <li key={p}>{p}</li>;
				})}
			</ul>
		</StandardLayout>
	);
}
