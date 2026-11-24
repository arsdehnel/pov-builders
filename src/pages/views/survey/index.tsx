import type { RequestInfo } from 'rwsdk/worker';
import { NoRecordFoundError } from 'rwsdk-atp/errors';
import StanceRadioCards from '@/components/survey/stance-radio-cards';
import StandardLayout from '@/layouts/standard';
import { d1 } from '@/repositories';
import stanceRadioCardsStylesUrl from '../../../components/survey/stance-radio-cards.less?url';
import surveyStylesUrl from './survey.less?url';

export default async function Pages__views__survey({ ctx, request }: RequestInfo): Promise<React.JSX.Element> {
	if (!ctx.topic) {
		return <p>No topic set, cannot view the survey</p>;
	}

	// Redirect users who already have an overall stance, unless they're here to change it.
	const isChanging = new URL(request.url).searchParams.has('change');
	if (!isChanging && ctx.user) {
		let hasPosition = false;
		try {
			await d1.getPositionByUserIdAndTopicId(ctx.user.id, ctx.topic.id, ctx.logger);
			hasPosition = true;
		} catch (err) {
			if (!(err instanceof NoRecordFoundError)) throw err;
		}
		if (hasPosition) {
			throw new Response(null, { status: 302, headers: { Location: '/views/survey/reflect' } });
		}
	}

	const stancesFromDb = await d1.getStancesByTopicId(ctx.topic.id, ctx.logger);
	const stances = stancesFromDb.map(s => ({
		id: s.id,
		icon: s.icon,
		label: s.label,
		description: s.description,
		color: s.color,
	}));

	return (
		<StandardLayout siteSection="views" ctx={ctx}>
			<link rel="stylesheet" href={surveyStylesUrl} precedence="component" />
			<link rel="stylesheet" href={stanceRadioCardsStylesUrl} precedence="component" />
			<div className="survey-view">
				<p>Which one of these best describes your overall stance on {ctx.topic.title}?</p>
				<StanceRadioCards stances={stances} topicId={ctx.topic.id} name="stance" redirectTo="/views/survey/reflect" />
			</div>
		</StandardLayout>
	);
}
