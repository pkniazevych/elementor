import EditorSelectors from '../../selectors/editor-selectors';
import { expect } from '@playwright/test';
const EditorPage = require( '../editor-page' );
const path = require( 'path' );

export default class Content {
	constructor( page, testInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async selectLinkSource( option ) {
		await this.page.locator( EditorSelectors.image.linkSelect ).selectOption( option );
	}

	async setLink( link,
		options = { targetBlank: false, noFollow: false, customAttributes: undefined, linkTo: false, linkInpSelector } ) {
		if ( options.linkTo ) {
			await this.selectLinkSource( 'Custom URL' );
		}

		const urlInput = this.page.locator( options.linkInpSelector ).first();
		await urlInput.clear();
		await urlInput.type( link );

		const wheel = this.page.locator( EditorSelectors.button.linkOptions ).first();
		if ( await wheel.isVisible() ) {
			await wheel.click();
		}

		if ( options.targetBlank ) {
			await this.page.locator( EditorSelectors.button.targetBlankChbox ).first().check();
		}

		if ( options.noFollow ) {
			await this.page.locator( EditorSelectors.button.noFollowChbox ).first().check();
		}
		if ( options.customAttributes ) {
			await this.page.locator( EditorSelectors.button.customAttributesInp ).first().type( `${ options.customAttributes.key }|${ options.customAttributes.value }` );
		}
		await this.editorPage.getPreviewFrame().locator( EditorSelectors.siteTitle ).click();
	}

	async verifyLink( element, options = { target, href, rel, customAttributes } ) {
		await expect( element ).toHaveAttribute( 'target', options.target );
		await expect( element ).toHaveAttribute( 'href', options.href );
		await expect( element ).toHaveAttribute( 'rel', options.rel );
		await expect( element ).toHaveAttribute( options.customAttributes.key, options.customAttributes.value );
	}

	async chooseImage( imageTitle ) {
		await this.page.locator( EditorSelectors.media.preview ).click();
		await this.page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await this.page.locator( EditorSelectors.media.imageByTitle( imageTitle ) ).click();
		await this.page.locator( EditorSelectors.media.selectBtn ).click();
	}

	async selectImageSize( args = { widget, select, imageSize } ) {
		await this.editorPage.getPreviewFrame().locator( args.widget ).click();
		await this.page.locator( args.select ).selectOption( args.imageSize );
		await this.editorPage.getPreviewFrame().locator( EditorSelectors.pageTitle ).click();
	}

	async verifyImageSrc( args = { selector, imageTitle, isPublished, isVideo } ) {
		const image = args.isPublished
			? await this.page.locator( args.selector )
			: await this.editorPage.getPreviewFrame().waitForSelector( args.selector );
		const attribute = args.isVideo ? 'style' : 'src';
		const src = await image.getAttribute( attribute );
		const regex = new RegExp( args.imageTitle );
		expect( regex.test( src ) ).toEqual( true );
	}

	async setCustomImageSize( args = { selector, select, imageTitle, width, height } ) {
		await this.editorPage.getPreviewFrame().locator( args.selector ).click();
		await this.page.locator( args.select ).selectOption( 'custom' );
		await this.page.locator( EditorSelectors.image.widthInp ).type( args.width );
		await this.page.locator( EditorSelectors.image.heightInp ).type( args.height );
		const regex = new RegExp( `http://(.*)/wp-content/uploads/elementor/thumbs/${ args.imageTitle }(.*)` );
		const response = this.page.waitForResponse( regex );
		await this.page.getByRole( 'button', { name: 'Apply' } ).click();
		await response;
	}

	async setCaption( option ) {
		await this.page.getByRole( 'combobox', { name: 'Caption' } ).selectOption( option );
	}

	async setLightBox( option ) {
		await this.page.getByRole( 'combobox', { name: 'Lightbox' } ).selectOption( option );
		await this.editorPage.getPreviewFrame().locator( EditorSelectors.siteTitle ).click();
	}

	async toggleControls( controlSelectors ) {
		for ( const i in controlSelectors ) {
			await this.page.locator( controlSelectors[ i ] )
				.locator( '..' )
				.locator( EditorSelectors.video.switch ).click();
		}
	}

	async uploadSVG( icon ) {
		const _icon = icon === undefined ? 'test-svg-wide' : icon;
		await this.page.getByRole( 'button', { name: 'Content' } ).click();
		const mediaUploadControl = this.page.locator( EditorSelectors.media.preview ).first();
		await mediaUploadControl.hover();
		await mediaUploadControl.waitFor();
		await this.page.getByText( 'Upload SVG' ).first().click();
		await this.page.getByRole( 'tab', { name: 'Upload files' } ).waitFor( { state: 'visible' } );
		const regex = new RegExp( _icon );
		const response = this.page.waitForResponse( regex );
		await this.page.setInputFiles( EditorSelectors.media.imageInp, path.resolve( __dirname, `../../resources/${ _icon }.svg` ) );
		await response;
		await this.page.getByRole( 'heading', { name: 'Attachment Details' } ).waitFor();
		await this.page.getByRole( 'button', { name: 'Insert Media' } ).click();
	}

	async addNewTab( tabName, text ) {
		const itemCount = await this.page.locator( EditorSelectors.item ).count();
		await this.page.getByRole( 'button', { name: 'Add Item' } ).click();
		await this.page.getByRole( 'textbox', { name: 'Title' } ).click();
		await this.page.getByRole( 'textbox', { name: 'Title' } ).fill( tabName );
		const textEditor = this.page.frameLocator( EditorSelectors.tabs.textEditorIframe ).nth( itemCount );
		await textEditor.locator( 'html' ).click();
		await textEditor.getByText( 'Tab Content' ).click();
		await textEditor.locator( EditorSelectors.tabs.body ).fill( text );
	}
}
