<?php
/**
 * Single Product Image
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/product-image.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see              https://woocommerce.com/document/template-structure/
 * @package          WooCommerce\Templates
 * @version          11.1.0
 * @flatsome-version 3.20.10
 */

use Automattic\WooCommerce\Enums\ProductType;
use Automattic\WooCommerce\Internal\ProductGallery\ProductMediaGallery;

defined( 'ABSPATH' ) || exit;

// FL: Disable check, Note: `wc_get_gallery_image_html` was added in WC 3.3.2 and did not exist prior. This check protects against theme overrides being used on older versions of WC.
//if ( ! function_exists( 'wc_get_gallery_image_html' ) ) {
//	return;
//}

global $product;

$columns           = apply_filters( 'woocommerce_product_thumbnails_columns', 4 );
$post_thumbnail_id = $product->get_image_id();

if ( class_exists( ProductMediaGallery::class ) ) {
	$media_items = ProductMediaGallery::get_product_media_gallery_items_for_display( $product );
	// The helper returns the full gallery order; product-thumbnails.php renders the remaining items.
	$first_media_item = $media_items[0] ?? array();
	$first_media_id   = isset( $first_media_item['id'] ) ? absint( $first_media_item['id'] ) : $post_thumbnail_id;
	$has_media        = ! empty( $first_media_item ) && 'placeholder' !== ( $first_media_item['source_type'] ?? '' );
	$is_video         = $has_media && 'video' === ( $first_media_item['media_type'] ?? '' );
} else {
	// FL: `ProductMediaGallery` requires WC 11.1+.
	$first_media_item = array();
	$first_media_id   = $post_thumbnail_id;
	$has_media        = (bool) $post_thumbnail_id;
	$is_video         = false;
}

$wrapper_classes = apply_filters(
	'woocommerce_single_product_image_gallery_classes',
	array(
		'woocommerce-product-gallery',
		'woocommerce-product-gallery--' . ( $has_media ? 'with-images' : 'without-images' ),
		'woocommerce-product-gallery--columns-' . absint( $columns ),
		'images',
	)
);
?>
<div class="product-gallery-default has-hover relative">

<?php do_action('flatsome_sale_flash'); ?>

<div class="image-tools absolute top show-on-hover right z-3">
  <?php do_action('flatsome_product_image_tools_top'); ?>
</div>

<div class="<?php echo esc_attr( implode( ' ', array_map( 'sanitize_html_class', $wrapper_classes ) ) ); ?>" data-columns="<?php echo esc_attr( $columns ); ?>" style="opacity: 0; transition: opacity .25s ease-in-out;">
	<div class="woocommerce-product-gallery__wrapper">
		<?php
		if ( $is_video ) {
			$html = ProductMediaGallery::get_gallery_video_html( $first_media_item, true );
		} elseif ( $has_media && $first_media_id ) {
			$html = flatsome_wc_get_gallery_image_html( $first_media_id, true );
		} else {
			$wrapper_classname = $product->is_type( fl_woocommerce_version_check( '9.7.0' ) ? ProductType::VARIABLE : 'variable' ) && ! empty( $product->get_visible_children() ) && '' !== $product->get_price() ?
				'woocommerce-product-gallery__image woocommerce-product-gallery__image--placeholder' :
				'woocommerce-product-gallery__image--placeholder';
			$html              = sprintf( '<div class="%s">', esc_attr( $wrapper_classname ) );
			$html             .= sprintf( '<img src="%s" alt="%s" class="wp-post-image" />', esc_url( wc_placeholder_img_src( 'woocommerce_single' ) ), esc_html__( 'Awaiting product image', 'woocommerce' ) );
			$html             .= '</div>';
		}

		if ( $is_video ) {
			/**
			 * Filter product video thumbnail HTML string.
			 *
			 * @since 11.0.0
			 * @internal For exclusive usage of WooCommerce core, backwards compatibility not guaranteed.
			 *
			 * @param string $html          Product video thumbnail HTML string.
			 * @param int    $attachment_id Video attachment ID.
			 * @param array  $media_item    Product media gallery item.
			 */
			echo apply_filters( 'woocommerce_single_product_video_thumbnail_html', $html, $first_media_id, $first_media_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		} else {
			/**
			 * Filter product image thumbnail HTML string.
			 *
			 * @since 1.6.4
			 *
			 * @param string $html          Product image thumbnail HTML string.
			 * @param int    $attachment_id Attachment ID.
			 */
			echo apply_filters( 'woocommerce_single_product_image_thumbnail_html', $html, $first_media_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		do_action( 'woocommerce_product_thumbnails' );
		?>
	</div>
</div>
</div>
