import type { RequestInfo } from 'rwsdk/worker';
import StanceRadioCards from '@/components/survey/stance-radio-cards';
import StandardLayout from '@/layouts/standard';
import { getPositionByUserIdAndTopicId, getPositionValuesByPositionId, getStancesByTopicId, getValueById } from '@/repositories';
import stanceRadioCardsStylesUrl from '../../../components/survey/stance-radio-cards.less?url';
import reflectStylesUrl from './reflect.less?url';

export default async function Pages__views__reflect_value({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	if (!ctx.topic) {
		return <p>No topic set, cannot view this page</p>;
	}

	const valueId = params.valueId;
	if (!valueId) {
		return <p>No value specified</p>;
	}

	const [value, stancesFromDb] = await Promise.all([
		getValueById(valueId, ctx.logger),
		getStancesByTopicId(ctx.topic.id, ctx.logger),
	]);

	const stances = stancesFromDb.map(s => ({
		id: s.id,
		icon: s.icon,
		label: s.label,
		description: s.description,
		color: s.color,
	}));

	let initialStanceId: string | undefined;
	const userId = ctx.user?.id;
	if (userId) {
		const position = await getPositionByUserIdAndTopicId(userId, ctx.topic.id, ctx.logger);
		if (position) {
			const positionValues = await getPositionValuesByPositionId(position.id, ctx.logger);
			initialStanceId = positionValues.find(pv => pv.valueId === valueId)?.stanceId;
		}
	}

	return (
		<StandardLayout pageTitle={value.label} siteSection="views" ctx={ctx}>
			<link rel="stylesheet" href={reflectStylesUrl} precedence="component" />
			<link rel="stylesheet" href={stanceRadioCardsStylesUrl} precedence="component" />
			<div className="reflect-view">
				<a href="/views/survey/reflect" className="reflect-back-link">
					← Back to all values
				</a>
				<h2>{value.label}</h2>
				<p>{value.description}</p>
				<StanceRadioCards
					stances={stances}
					topicId={ctx.topic.id}
					valueId={value.id}
					initialStanceId={initialStanceId}
					redirectTo="/views/survey/reflect"
				/>
			</div>
		</StandardLayout>
	);
}
