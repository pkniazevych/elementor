import FormText from './pages/form-text';
import Connect from './pages/connect';
import FormCode from './pages/form-code';
import GetStarted from './pages/get-started';
import Loader from './components/loader';
import useUserInfo from './hooks/use-user-info';
import WizardDialog from './components/wizard-dialog';
import PromptDialog from './components/prompt-dialog';
import UpgradeChip from './components/upgrade-chip';
import FormMedia from './pages/form-media';
import History from './components/prompt-history';
import { HISTORY_ACTION_TYPES, HISTORY_TYPES } from './components/prompt-history/history-types';
import { useState } from 'react';

const PageContent = (
	{
		type,
		controlType,
		onClose,
		onConnect,
		getControlValue,
		setControlValue,
		controlView,
		additionalOptions,
	} ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData, hasSubscription, credits, usagePercentage } = useUserInfo();
	const [ isPromptHistoryOpen, setIsPromptHistoryOpen ] = useState( false );
	const [ promptHistoryAction, setPromptHistoryAction ] = useState( {
		type: '',
		id: '',
		data: null,
	} );

	const promptDialogStyleProps = {
		sx: {
			'& .MuiDialog-container': {
				alignItems: 'flex-start',
				mt: 'media' === type ? '2.5vh' : '18vh',
			},
		},
		PaperProps: {
			sx: {
				m: 0,
				maxHeight: 'media' === type ? '95vh' : '76vh',
				height: ! isLoading && 'media' === type ? '95vh' : 'auto',
				minHeight: isPromptHistoryOpen ? '61vh' : 'auto',
			},
		},
	};

	const maybeRenderUpgradeChip = () => {
		const needsUpgradeChip = ! hasSubscription || 80 <= usagePercentage;

		if ( ! needsUpgradeChip ) {
			return;
		}

		return (
			<UpgradeChip
				hasSubscription={ hasSubscription }
				usagePercentage={ usagePercentage }
			/>
		);
	};

	const onPromptReuse = ( id, prompt ) => {
		setPromptHistoryAction( {
			type: HISTORY_ACTION_TYPES.REUSE,
			id,
			data: prompt,
		} );
	};

	const onResultEdit = ( id, result ) => {
		setPromptHistoryAction( {
			type: HISTORY_ACTION_TYPES.EDIT,
			id,
			data: result,
		} );
	};

	if ( isLoading ) {
		return (
			<PromptDialog onClose={ onClose } { ...promptDialogStyleProps } maxWidth={ 'media' === type ? 'lg' : 'sm' }>
				<PromptDialog.Header onClose={ onClose } />

				<PromptDialog.Content dividers>
					<Loader />
				</PromptDialog.Content>
			</PromptDialog>
		);
	}

	if ( ! isConnected ) {
		return (
			<WizardDialog onClose={ onClose }>
				<WizardDialog.Header onClose={ onClose } />

				<WizardDialog.Content dividers>
					<Connect
						connectUrl={ connectUrl }
						onSuccess={ ( data ) => {
							onConnect( data );
							fetchData();
						} }
					/>
				</WizardDialog.Content>
			</WizardDialog>
		);
	}

	if ( ! isGetStarted ) {
		return (
			<WizardDialog onClose={ onClose }>
				<WizardDialog.Header onClose={ onClose } />

				<WizardDialog.Content dividers>
					<GetStarted onSuccess={ fetchData } />
				</WizardDialog.Content>
			</WizardDialog>
		);
	}

	if ( 'media' === type ) {
		return (
			<FormMedia
				onClose={ onClose }
				getControlValue={ getControlValue }
				controlView={ controlView }
				additionalOptions={ additionalOptions }
				credits={ credits }
				maybeRenderUpgradeChip={ maybeRenderUpgradeChip }
				DialogProps={ promptDialogStyleProps }
			/>
		);
	}

	if ( 'code' === type ) {
		return (
			<PromptDialog onClose={ onClose } { ...promptDialogStyleProps }>
				<PromptDialog.Header onClose={ onClose }>
					<History promptType={ HISTORY_TYPES.CODE }
						onPromptReuse={ onPromptReuse }
						setIsPromptHistoryOpen={ setIsPromptHistoryOpen } />

					{ maybeRenderUpgradeChip() }
				</PromptDialog.Header>

				<PromptDialog.Content dividers sx={ { position: 'relative' } }>
					<FormCode
						onClose={ onClose }
						getControlValue={ getControlValue }
						setControlValue={ setControlValue }
						additionalOptions={ additionalOptions }
						credits={ credits }
						usagePercentage={ usagePercentage }
						promptHistoryAction={ promptHistoryAction }
					/>
				</PromptDialog.Content>
			</PromptDialog>
		);
	}

	return (
		<PromptDialog onClose={ onClose } { ...promptDialogStyleProps }>
			<PromptDialog.Header onClose={ onClose }>
				<History promptType={ HISTORY_TYPES.TEXT }
					onPromptReuse={ onPromptReuse }
					onResultEdit={ onResultEdit }
					setIsPromptHistoryOpen={ setIsPromptHistoryOpen } />

				{ maybeRenderUpgradeChip() }
			</PromptDialog.Header>

			<PromptDialog.Content dividers sx={ { position: 'relative' } }>
				<FormText
					type={ type }
					controlType={ controlType }
					onClose={ onClose }
					getControlValue={ getControlValue }
					setControlValue={ setControlValue }
					additionalOptions={ additionalOptions }
					credits={ credits }
					usagePercentage={ usagePercentage }
					promptHistoryAction={ promptHistoryAction }
				/>
			</PromptDialog.Content>
		</PromptDialog>
	);
};

PageContent.propTypes = {
	type: PropTypes.string,
	controlType: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	getControlValue: PropTypes.func.isRequired,
	setControlValue: PropTypes.func.isRequired,
	additionalOptions: PropTypes.object,
	controlView: PropTypes.object,
};

export default PageContent;
