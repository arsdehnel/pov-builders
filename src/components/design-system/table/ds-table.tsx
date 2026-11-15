'use client';
import type { DSTableColumn, Permission } from '@/types';
import DSLink from '../link/ds-link';
import DSPopConfirm from '../pop-confirm/ds-pop-confirm';
import styleClasses from './ds-table.module.css';

export default function DSTable<T extends Record<string, unknown>>({
	columns,
	data,
	rowIndex = 'id',
	userPermissions,
}: {
	columns: DSTableColumn[];
	data: T[];
	rowIndex?: keyof T;
	userPermissions: Permission[];
}): React.ReactNode {
	return (
		<table className={styleClasses.rzTable}>
			<thead>
				<tr>
					{columns.map(c => {
						return <th key={c.key}>{c.label}</th>;
					})}
				</tr>
			</thead>
			<tbody>
				{data.map(d => {
					return (
						<tr key={d[rowIndex] as string}>
							{columns.map(c => {
								if (c.actions) {
									return (
										<td key={c.key} className={styleClasses.rzTableActions}>
											{c.actions.map((a): React.ReactNode => {
												if (a.type === 'link') {
													const { hrefProp, ...other } = a;
													const href = String(d[hrefProp ?? 'link']);
													return <DSLink userPermissions={userPermissions} key={href} href={href} {...other} />;
												} else if (a.type === 'confirm-button') {
													if (a.requiredPermission && !userPermissions.includes(a.requiredPermission)) return null;
													return (
														<DSPopConfirm
															key={String(a.handler)}
															title={a.confirmTitle ?? 'Are you sure?'}
															description={a.confirmDescription}
															onConfirm={() => a.handler?.(String(d[c.key]), d)}
														>
															<button type="button">{a.label}</button>
														</DSPopConfirm>
													);
												} else {
													return (
														<button
															key={String(a.handler)}
															type="button"
															onClick={(): void => {
																void a.handler?.(String(d[c.key]), d);
															}}
														>
															{a.label}
														</button>
													);
												}
											})}
										</td>
									);
								}
								return <td key={c.key}>{c.render ? c.render(String(d[c.key]), d) : String(d[c.key])}</td>;
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
