import type { RequestInfo } from 'rwsdk/worker';
import { NoRecordFoundError } from 'rwsdk-atp/errors';
import StanceRadioCards from '@/components/survey/stance-radio-cards';
import StandardLayout from '@/layouts/standard';
import { d1 } from '@/repositories';
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
		d1.getValueById(valueId, ctx.logger),
		d1.getStancesByTopicId(ctx.topic.id, ctx.logger),
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
		try {
			const position = await d1.getPositionByUserIdAndTopicId(userId, ctx.topic.id, ctx.logger);
			const positionValues = await d1.getPositionValuesByPositionId(position.id, ctx.logger);
			initialStanceId = positionValues.find(pv => pv.valueId === valueId)?.stanceId;
		} catch (err) {
			if (err instanceof NoRecordFoundError) {
				throw new Response(null, { status: 302, headers: { Location: '/views/survey' } });
			}
			throw err;
		}
	}

	return (
		<StandardLayout siteSection="views" ctx={ctx}>
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
