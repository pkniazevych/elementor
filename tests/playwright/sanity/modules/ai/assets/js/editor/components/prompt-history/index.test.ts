import { test, Page, expect } from '@playwright/test';
import {
	reuseAndEditTextDataMock,
	differentPeriodsDataMock,
	noDataMock,
	noPlanMock,
	thirtyDaysLimitDataMock,
	unknownActionDataMock,
} from './get-history.mock';
import { closePromptHistory, openPromptHistory } from './helper';
import { userInformationMock } from '../../../../../user-information.mock';
import WpAdminPage from '../../../../../../../../pages/wp-admin-page';
import EditorSelectors from '../../../../../../../../selectors/editor-selectors';
import { successMock } from './delete-history-item.mock';
import AxeBuilder from '@axe-core/playwright';

test.describe( 'AI @ai', () => {
	const mockRoute = async ( page: Page, { getHistoryMock = {}, deleteHistoryMock = {} } ) => {
		await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
			const requestPostData = route.request().postData();

			if ( requestPostData.includes( 'ai_get_user_information' ) ) {
				await route.fulfill( {
					json: userInformationMock,
				} );
			}

			if ( requestPostData.includes( 'ai_get_history' ) ) {
				await route.fulfill( {
					json: getHistoryMock,
				} );
			}

			if ( requestPostData.includes( 'ai_delete_history_item' ) ) {
				await route.fulfill( {
					json: deleteHistoryMock,
				} );
			}
		} );
	};

	test( 'Prompt History - Common', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Modal can be opened and closed', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: noDataMock } );

			await openPromptHistory( page );

			await expect( page.locator( EditorSelectors.ai.promptHistory.modal ).first() ).toBeVisible();

			await closePromptHistory( page );

			await expect( page.locator( EditorSelectors.ai.promptHistory.modal ).first() ).toBeHidden();
		} );

		await test.step( 'Shows a message when there is a free plan', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: noPlanMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.upgradeMessageFull ).first() ).toBeVisible();

			await closePromptHistory( page );
		} );

		await test.step( 'Shows a message when there are no history items', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: noDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.noDataMessage ).first() ).toBeVisible();

			await closePromptHistory( page );
		} );

		await test.step( 'Renders items from different periods correctly', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: differentPeriodsDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.period ) ).toHaveCount( 2 );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.item ) ).toHaveCount( 2 );

			await closePromptHistory( page );
		} );

		await test.step( 'Renders upgrade ad if a user has less than 90 items limit', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: thirtyDaysLimitDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.upgradeMessageSmall ).first() ).toBeVisible();

			await closePromptHistory( page );
		} );

		await test.step( 'Renders a fallback icon for an unknown action', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, { getHistoryMock: unknownActionDataMock } );

			await openPromptHistory( page );

			await expect( page.getByTestId( EditorSelectors.ai.promptHistory.fallbackIcon ) ).toHaveCount( 1 );

			await closePromptHistory( page );
		} );

		await test.step( 'Removes item', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: differentPeriodsDataMock,
				deleteHistoryMock: successMock,
			} );

			await openPromptHistory( page );

			const items = page.getByTestId( EditorSelectors.ai.promptHistory.item );

			await expect( items ).toHaveCount( 2 );

			await items.first().hover();

			await items.first().locator( EditorSelectors.ai.promptHistory.removeButton ).click();

			await expect( items ).toHaveCount( 1 );

			await closePromptHistory( page );
		} );
	} );

	test( 'Prompt History - a11y', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'History items list a11y', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: differentPeriodsDataMock,
			} );

			await openPromptHistory( page );

			await page.waitForSelector( `[data-testid="${ EditorSelectors.ai.promptHistory.item }"]` );

			const accessibilityScanResults = await new AxeBuilder( { page } )
				.include( `[data-testid="${ EditorSelectors.ai.promptHistory.item }"]` )
				.analyze();

			expect( accessibilityScanResults.violations ).toEqual( [] );
		} );
	} );

	test( 'Prompt History - Text', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Reuse button reuses prompt', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: reuseAndEditTextDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( EditorSelectors.ai.promptHistory.item ).first();

			await item.hover();

			await item.locator( EditorSelectors.ai.promptHistory.reuseButton ).click();

			const input = page.locator( EditorSelectors.ai.promptInput ).first();

			await expect( input ).toBeVisible();

			expect( await input.inputValue() ).toBe( 'Test prompt' );
		} );

		await test.step( 'Edit button edits result', async () => {
			await editor.addWidget( 'text-editor' );

			await mockRoute( page, {
				getHistoryMock: reuseAndEditTextDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( EditorSelectors.ai.promptHistory.item ).first();

			await item.hover();

			await item.locator( EditorSelectors.ai.promptHistory.editButton ).click();

			const textarea = page.locator( EditorSelectors.ai.resultTextarea ).first();

			await expect( textarea ).toBeVisible();

			expect( await textarea.inputValue() ).toBe( 'Test result' );
		} );
	} );

	test( 'Prompt History - Code', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		const editor = await wpAdmin.openNewPage();

		await test.step( 'Reuse button reuses prompt', async () => {
			await editor.addWidget( 'html' );

			await mockRoute( page, {
				getHistoryMock: reuseAndEditTextDataMock,
			} );

			await openPromptHistory( page );

			const item = page.getByTestId( EditorSelectors.ai.promptHistory.item ).first();

			await item.hover();

			await item.locator( EditorSelectors.ai.promptHistory.reuseButton ).click();

			const input = page.locator( EditorSelectors.ai.promptInput ).first();

			await expect( input ).toBeVisible();

			expect( await input.inputValue() ).toBe( 'Test prompt' );
		} );
	} );
} );
