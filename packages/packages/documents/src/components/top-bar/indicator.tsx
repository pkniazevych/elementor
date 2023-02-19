import { Tooltip, Typography, Stack } from '@elementor/ui';
import { Document } from '../../types';

type Props = {
	title: Document['title'],
	status: Document['status']
}

export default function Indicator( { title, status }: Props ) {
	return (
		<Tooltip title={ title }>
			<Stack direction="row" alignItems="center" spacing={ 2 }>
				<Typography variant="body2" sx={ {
					textOverflow: 'ellipsis',
					maxWidth: '120px',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
				} }>
					{ title }
				</Typography>
				{ status.value !== 'publish' &&
					<Typography variant="body2" sx={ { fontStyle: 'italic' } }>
						({ status.label })
					</Typography>
				}
			</Stack>
		</Tooltip>
	);
}