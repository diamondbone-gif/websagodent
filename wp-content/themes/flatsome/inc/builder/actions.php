<?php

add_action( 'wp_ajax_flatsome_block_title', function () {
	$block_id    = isset( $_GET['block_id'] ) ? absint( $_GET['block_id'] ) : 0;
	$block_title = array( 'block_title' => '' );

	if ( $block_id ) {
		$block = get_post( $block_id );

		if ( $block
			&& 'blocks' === $block->post_type
			&& current_user_can( 'read_post', $block_id )
			&& ( ! post_password_required( $block ) || current_user_can( 'edit_post', $block_id ) )
		) {
			$block_title['block_title'] = $block->post_title;
		}
	}

	wp_send_json_success( $block_title );
} );
