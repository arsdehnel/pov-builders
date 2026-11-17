import type { RequestInfo } from 'rwsdk/worker';
import StanceRadioCards from '@/components/survey/stance-radio-cards';
import StandardLayout from '@/layouts/standard';
import { getStancesByTopicId } from '@/repositories';
import stanceRadioCardsStylesUrl from '../../components/survey/stance-radio-cards.less?url';
import surveyStylesUrl from './survey.less?url';

export default async function Pages__views__survey({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	if (!ctx.topic) {
		return <p>No topic set, cannot view the survey</p>;
	}

	const stancesFromDb = await getStancesByTopicId(ctx.topic.id, ctx.logger);
	const stances = stancesFromDb.map(s => ({
		id: s.id,
		slug: s.slug,
		label: s.label,
		description: s.description,
		color: s.color,
	}));

	return (
		<StandardLayout pageTitle="Survey View" siteSection="views" ctx={ctx}>
			<link rel="stylesheet" href={surveyStylesUrl} precedence="component" />
			<link rel="stylesheet" href={stanceRadioCardsStylesUrl} precedence="component" />
			<div className="survey-view">
				<p>Which one of these best describes your overall stance on {ctx.topic.title}?</p>
				<StanceRadioCards stances={stances} name="stance" />
			</div>
		</StandardLayout>
	);
}
