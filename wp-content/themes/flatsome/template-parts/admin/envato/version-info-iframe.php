<?php
/**
 * Version info.
 *
 * @package          Flatsome\Templates
 * @flatsome-version 3.20.10
 */

iframe_header();
?>
<div id="wpwrap" class="flatsome-panel" style="text-align:center;">
	<a href="https://themeforest.net/item/flatsome-multipurpose-responsive-woocommerce-theme/5484319#item-description__change-log" style="display:inline-block;" target="_blank" rel="noopener">
		<div class="wp-badge fl-badge">
			<?php /* translators: 1: Version. */ ?>
			<?php echo sprintf( esc_html__( 'Version %s', 'flatsome' ), esc_html( $version ) ); ?>
		</div>
		<div style="margin-top:8px;">
			<?php esc_html_e( 'Read change log here', 'flatsome' ); ?>
		</div>
	</a>
</div>

<?php iframe_footer(); ?>
