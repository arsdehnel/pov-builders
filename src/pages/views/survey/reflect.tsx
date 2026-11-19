import type { RequestInfo } from 'rwsdk/worker';
import { DSCard } from '@/components/design-system';
import { STANCE_ICONS } from '@/content/icons-map';
import StandardLayout from '@/layouts/standard';
import {
	getPositionByUserIdAndTopicId,
	getPositionValuesByPositionId,
	getStancesByTopicId,
	getValuesByTopicId,
} from '@/repositories';
import valueCardsStylesUrl from '../../../components/survey/value-cards.less?url';
import reflectStylesUrl from './reflect.less?url';

type StanceSummary = { icon: string; label: string; color: string };

export default async function Pages__views__reflect({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	if (!ctx.topic) {
		return <p>No topic set, cannot view the reflect page</p>;
	}

	const [values, stances] = await Promise.all([
		getValuesByTopicId(ctx.topic.id, ctx.logger),
		getStancesByTopicId(ctx.topic.id, ctx.logger),
	]);

	const stanceMap = new Map<string, StanceSummary>(stances.map(s => [s.id, { icon: s.icon, label: s.label, color: s.color }]));

	const positionValueMap = new Map<string, StanceSummary>(); // valueId → stance
	let overallStance: StanceSummary | undefined;
	const userId = ctx.user?.id;
	if (userId) {
		const position = await getPositionByUserIdAndTopicId(userId, ctx.topic.id, ctx.logger);
		if (position) {
			overallStance = stanceMap.get(position.overallStanceId);
			const positionValues = await getPositionValuesByPositionId(position.id, ctx.logger);
			for (const pv of positionValues) {
				const stance = stanceMap.get(pv.stanceId);
				if (stance) positionValueMap.set(pv.valueId, stance);
			}
		}
	}

	const unexploredValues = values.filter(v => !positionValueMap.has(v.id));
	const exploredValues = values.filter(v => positionValueMap.has(v.id));
	const OverallIcon = overallStance ? STANCE_ICONS[overallStance.icon] : null;
	const isSplit = unexploredValues.length > 0 && exploredValues.length > 0;
	const isAllExplored = unexploredValues.length === 0 && exploredValues.length > 0;

	const exploredCards = exploredValues.map(value => {
		const stance = positionValueMap.get(value.id);
		if (!stance) return null;
		const Icon = STANCE_ICONS[stance.icon];
		return (
			<DSCard
				key={value.id}
				title={value.label}
				alignment="vertical"
				className="ds-card--explored"
				style={{ '--value-stance-color': stance.color } as React.CSSProperties}
				userPermissions={ctx.permissions}
				band={
					Icon ? (
						<div className="value-stance-band">
							<span className="value-stance-band-label">Stance:</span>
							<Icon width={14} height={14} />
							<span>{stance.label}</span>
						</div>
					) : undefined
				}
				actions={[
					{
						href: `/views/survey/reflect/${value.id}`,
						label: 'Change',
						requiredPermission: 'positions:update',
					},
				]}
			/>
		);
	});

	return (
		<StandardLayout pageTitle="Reflect" siteSection="views" ctx={ctx}>
			<link rel="stylesheet" href={reflectStylesUrl} precedence="component" />
			<link rel="stylesheet" href={valueCardsStylesUrl} precedence="component" />
			<div className="reflect-view">
				{overallStance && (
					<div className="overall-stance-strip" style={{ '--overall-stance-color': overallStance.color } as React.CSSProperties}>
						{OverallIcon && <OverallIcon width={16} height={16} />}
						<span>
							Overall stance: <strong>{overallStance.label}</strong>
						</span>
						<a href="/views/survey?change=true" className="overall-stance-change">
							Change
						</a>
					</div>
				)}

				<h2>How does this affect what you value?</h2>
				<p>Select each value to reflect on your stance.</p>

				<div className={isSplit ? 'reflect-columns reflect-columns--split' : 'reflect-columns'}>
					<div className="reflect-main">
						{unexploredValues.length > 0 && (
							<div className="value-cards-grid">
								{unexploredValues.map(value => (
									<DSCard
										key={value.id}
										title={value.label}
										alignment="vertical"
										className="ds-card--unexplored"
										userPermissions={ctx.permissions}
										actions={[
											{
												href: `/views/survey/reflect/${value.id}`,
												label: 'Set',
												requiredPermission: 'positions:update',
											},
										]}
									>
										<p className="value-description">{value.description}</p>
									</DSCard>
								))}
							</div>
						)}
						{isAllExplored && <div className="value-cards-grid value-cards-grid--compact">{exploredCards}</div>}
					</div>

					{isSplit && (
						<aside className="reflect-rail">
							<h3 className="reflect-rail-heading">Explored</h3>
							<div className="value-cards-rail">{exploredCards}</div>
						</aside>
					)}
				</div>
			</div>
		</StandardLayout>
	);
}
