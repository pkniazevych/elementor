import { useState, useRef } from 'react';
import {
	Chip as ChipBase,
	Box,
	Typography,
	styled,
	Popper,
	Button,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Paper,
} from '@elementor/ui';
import { UpgradeIcon, CheckedCircleIcon } from '@elementor/icons';

const popoverId = 'e-ai-upgrade-popover';

const StyledContent = styled( Paper )( ( { theme } ) => ( {
	position: 'relative',
	'[data-popper-placement="top"] &': {
		marginBottom: theme.spacing( 2.5 ),
	},
	'[data-popper-placement="bottom"] &': {
		marginTop: theme.spacing( 2.5 ),
	},
	padding: theme.spacing( 3 ),
	boxShadow: theme.shadows[ 4 ],
	zIndex: '9999',
} ) );

const StyledArrow = styled( Box )( ( { theme } ) => ( {
	width: theme.spacing( 5 ),
	height: theme.spacing( 2.5 ),
	position: 'absolute',
	overflow: 'hidden',
	// Override Popper inline styles.
	left: '50% !important',
	transform: 'translateX(-50%) rotate(var(--rotate, 0deg)) !important',
	'[data-popper-placement="top"] &': {
		top: '100%',
	},
	'[data-popper-placement="bottom"] &': {
		'--rotate': '180deg',
		top: `calc(${ theme.spacing( 2.5 ) } * -1)`,
	},
	'&::after': {
		backgroundColor: theme.palette.background.paper,
		content: '""',
		display: 'block',
		position: 'absolute',
		width: theme.spacing( 2.5 ),
		height: theme.spacing( 2.5 ),
		top: 0,
		left: '50%',
		transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
		boxShadow: '1px 1px 5px 0px rgba(0, 0, 0, 0.2)',
		backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
	},
} ) );

const upgradeBullets = [
	__( 'Generate impressive images that you can, edit, enhance and refine.', 'elementor' ),
	__( 'Create professional text, about any topic, in any tone and language.', 'elementor' ),
	__( 'Unleash infinite possibilities with the custom code generator.', 'elementor' ),
];

const Chip = styled( ChipBase )( () => ( {
	'& .MuiChip-label': {
		lineHeight: 1.5,
	},
	'& .MuiSvgIcon-root.MuiChip-icon': {
		fontSize: '1.25rem',
	},
} ) );

const UpgradeChip = ( {
	hasSubscription = false,
	usagePercentage = 0,
} ) => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const anchorEl = useRef( null );
	const arrowEl = useRef( null );

	const showPopover = () => setIsPopoverOpen( true );

	const hidePopover = () => setIsPopoverOpen( false );

	let actionUrl = 'https://go.elementor.com/ai-popup-purchase-dropdown/';
	if ( hasSubscription ) {
		actionUrl = usagePercentage >= 100 ? 'https://go.elementor.com/ai-popup-upgrade-limit-reached/' : 'https://go.elementor.com/ai-popup-upgrade-limit-reached-80-percent/';
	}
	const actionLabel = hasSubscription ? __( 'Upgrade Elementor AI', 'elementor' ) : __( 'Get Elementor AI', 'elementor' );

	return (
		<Box
			component="span"
			aria-owns={ isPopoverOpen ? popoverId : undefined }
			aria-haspopup="true"
			onMouseEnter={ showPopover }
			onMouseLeave={ hidePopover }
			ref={ anchorEl }
			display="flex"
			alignItems="center"
		>
			<Chip color="accent" label={ __( 'Upgrade', 'elementor' ) } icon={ <UpgradeIcon /> } size="small" />

			<Popper
				open={ isPopoverOpen }
				anchorEl={ anchorEl.current }
				sx={ { zIndex: '9999', maxWidth: 300 } }
				modifiers={ [ {
					name: 'arrow',
					enabled: true,
					options: {
						element: arrowEl.current,
					},
				} ] }
			>
				<StyledContent>
					<StyledArrow ref={ arrowEl } />

					<Typography variant="h5" color="text.primary">
						{ __( 'Unlimited access to Elementor AI', 'elementor' ) }
					</Typography>

					<List sx={ { mb: 1 } }>
						{
							upgradeBullets.map( ( bullet, index ) => (
								<ListItem key={ index } disableGutters sx={ { alignItems: 'flex-start' } }>
									<ListItemIcon>
										<CheckedCircleIcon />
									</ListItemIcon>
									<ListItemText sx={ { m: 0 } }>
										<Typography variant="body2">{ bullet }</Typography>
									</ListItemText>
								</ListItem>
							) )
						}
					</List>

					<Button
						variant="contained"
						color="accent"
						size="small"
						href={ actionUrl }
						target="_blank"
						startIcon={ <UpgradeIcon /> }
						sx={ {
							'&:hover': {
								color: 'accent.contrastText',
							},
						} }
					>
						{ actionLabel }
					</Button>
				</StyledContent>
			</Popper>
		</Box>
	);
};

export default UpgradeChip;

UpgradeChip.propTypes = {
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
};
