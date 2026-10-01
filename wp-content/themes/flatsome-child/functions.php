<?php

/**
 * Flatsome Child Theme functions.
 *
 * CSS chung: style.css → sagodent-root.css → sagodent-footer.css → lenis.css → sagodent-all.css.
 * JS chung: lenis.min.js → sagodent-lenis.js → sagodent-all.js → sagodent-footer.js.
 * Veneer và Implant Basic chỉ nạp file riêng trên đúng trang tương ứng.
 */

defined('ABSPATH') || exit;

/* 1. HÀM TIỆN ÍCH */

// Tự đổi version theo thời gian sửa file để hạn chế cache cũ.
function sagodent_asset_version($file_path)

{

    if (file_exists($file_path)) {

        return (string) filemtime($file_path);
    }

    return (string) wp_get_theme()->get('Version');
}

function sagodent_is_homepage()

{

    return is_front_page() || is_page('sagodent');
}

// Nếu slug trang Veneer thay đổi, sửa giá trị trong is_page().
function sagodent_is_veneer_page()

{

    return is_page('veneer');
}

// Nếu slug trang Implant Basic thay đổi, sửa giá trị trong is_page().
function sagodent_is_implant_basic_page()

{

    return is_page('implant-basic');
}

/* 2. HÀM NẠP CSS */

function sagodent_enqueue_local_style(

    $handle,

    $relative_path,

    $dependencies = array()

) {

    $file_path = get_stylesheet_directory() . $relative_path;

    $file_uri  = get_stylesheet_directory_uri() . $relative_path;

    if (! file_exists($file_path)) {

        return false;
    }

    wp_enqueue_style(

        $handle,

        $file_uri,

        $dependencies,

        sagodent_asset_version($file_path)

    );

    return true;
}

/* 3. HÀM NẠP JAVASCRIPT */

function sagodent_enqueue_local_script(

    $handle,

    $relative_path,

    $dependencies = array(),

    $in_footer = true

) {

    $file_path = get_stylesheet_directory() . $relative_path;

    $file_uri  = get_stylesheet_directory_uri() . $relative_path;

    if (! file_exists($file_path)) {

        return false;
    }

    wp_enqueue_script(

        $handle,

        $file_uri,

        $dependencies,

        sagodent_asset_version($file_path),

        $in_footer

    );

    return true;
}

/* 4. NẠP CSS + JAVASCRIPT */

function sagodent_enqueue_assets()

{

    $theme_path = get_stylesheet_directory();

    /* 4.1. style.css — toàn website */
    $child_style_path = $theme_path . '/style.css';

    wp_enqueue_style(

        'flatsome-child-style',

        get_stylesheet_uri(),

        array(),

        sagodent_asset_version($child_style_path)

    );

    /* 4.2. sagodent-root.css — toàn website */
    $root_loaded = sagodent_enqueue_local_style(

        'sagodent-root',

        '/assets/css/sagodent-root.css',

        array('flatsome-child-style')

    );

    $root_dependency = $root_loaded

        ? array('sagodent-root')

        : array('flatsome-child-style');

    /* 4.3. sagodent-footer.css — toàn website */
    $footer_loaded = sagodent_enqueue_local_style(

        'sagodent-footer',

        '/assets/css/sagodent-footer.css',

        $root_dependency

    );

    /* 4.4. lenis.css — toàn website */
    $lenis_style_loaded = sagodent_enqueue_local_style(

        'sagodent-lenis-style',

        '/assets/css/lenis.css',

        $root_dependency

    );

    /* 4.5. lenis.min.js — thư viện Lenis */
    $lenis_library_loaded = sagodent_enqueue_local_script(

        'sagodent-lenis-library',

        '/assets/js/lenis.min.js',

        array(),

        true

    );

    /* 4.6. sagodent-lenis.js — cấu hình Lenis */
    $lenis_config_dependencies = $lenis_library_loaded

        ? array('sagodent-lenis-library')

        : array();

    $lenis_config_loaded = sagodent_enqueue_local_script(

        'sagodent-lenis',

        '/assets/js/sagodent-lenis.js',

        $lenis_config_dependencies,

        true

    );

    /* 4.7. sagodent-all.css — toàn website */
    $all_style_dependencies = array();

    if ($root_loaded) {

        $all_style_dependencies[] = 'sagodent-root';
    } else {

        $all_style_dependencies[] = 'flatsome-child-style';
    }

    if ($footer_loaded) {

        $all_style_dependencies[] = 'sagodent-footer';
    }

    if ($lenis_style_loaded) {

        $all_style_dependencies[] = 'sagodent-lenis-style';
    }

    $all_style_loaded = sagodent_enqueue_local_style(

        'sagodent-all-style',

        '/assets/css/sagodent-all.css',

        array_values(

            array_unique($all_style_dependencies)

        )

    );

    /* 4.8. sagodent-all.js — toàn website */
    $all_script_dependencies = array();

    if ($lenis_config_loaded) {

        $all_script_dependencies[] = 'sagodent-lenis';
    } elseif ($lenis_library_loaded) {

        $all_script_dependencies[] = 'sagodent-lenis-library';
    }

    $all_script_loaded = sagodent_enqueue_local_script(

        'sagodent-all-script',

        '/assets/js/sagodent-all.js',

        array_values(

            array_unique($all_script_dependencies)

        ),

        true

    );

    /* 4.9. sagodent-footer.js — toàn website */
    $footer_script_dependencies = array();

    if ($all_script_loaded) {

        $footer_script_dependencies[] = 'sagodent-all-script';
    } elseif ($lenis_config_loaded) {

        $footer_script_dependencies[] = 'sagodent-lenis';
    } elseif ($lenis_library_loaded) {

        $footer_script_dependencies[] = 'sagodent-lenis-library';
    }

    $footer_script_loaded = sagodent_enqueue_local_script(

        'sagodent-footer-script',

        '/assets/js/sagodent-footer.js',

        array_values(

            array_unique($footer_script_dependencies)

        ),

        true

    );

    /* 4.10. Veneer CSS — chỉ trang Veneer */
    if (sagodent_is_veneer_page()) {

        $veneer_style_dependencies = array();

        if ($all_style_loaded) {

            $veneer_style_dependencies[] = 'sagodent-all-style';
        } elseif ($root_loaded) {

            $veneer_style_dependencies[] = 'sagodent-root';
        } else {

            $veneer_style_dependencies[] = 'flatsome-child-style';
        }

        sagodent_enqueue_local_style(

            'sagodent-veneer-style',

            '/assets/css/sagodent-veneer.css',

            array_values(

                array_unique($veneer_style_dependencies)

            )

        );
    }

    /* 4.11. Veneer JS — chỉ trang Veneer */
    if (sagodent_is_veneer_page()) {

        $veneer_script_dependencies = array();

        if ($footer_script_loaded) {

            $veneer_script_dependencies[] = 'sagodent-footer-script';
        } elseif ($all_script_loaded) {

            $veneer_script_dependencies[] = 'sagodent-all-script';
        } elseif ($lenis_config_loaded) {

            $veneer_script_dependencies[] = 'sagodent-lenis';
        } elseif ($lenis_library_loaded) {

            $veneer_script_dependencies[] = 'sagodent-lenis-library';
        }

        sagodent_enqueue_local_script(

            'sagodent-veneer-script',

            '/assets/js/sagodent-veneer.js',

            array_values(

                array_unique($veneer_script_dependencies)

            ),

            true

        );
    }

    /* 4.12. Implant Basic CSS — chỉ trang Implant Basic */
    if (sagodent_is_implant_basic_page()) {

        $implant_basic_style_dependencies = array();

        if ($all_style_loaded) {

            $implant_basic_style_dependencies[] = 'sagodent-all-style';
        } elseif ($root_loaded) {

            $implant_basic_style_dependencies[] = 'sagodent-root';
        } else {

            $implant_basic_style_dependencies[] = 'flatsome-child-style';
        }

        sagodent_enqueue_local_style(

            'sagodent-implant-basic-style',

            '/assets/css/sagodent-implant-basic.css',

            array_values(

                array_unique($implant_basic_style_dependencies)

            )

        );
    }

    /* 4.13. Implant Basic JS — chỉ trang Implant Basic */
    if (sagodent_is_implant_basic_page()) {

        $implant_basic_script_dependencies = array();

        if ($footer_script_loaded) {

            $implant_basic_script_dependencies[] = 'sagodent-footer-script';
        } elseif ($all_script_loaded) {

            $implant_basic_script_dependencies[] = 'sagodent-all-script';
        } elseif ($lenis_config_loaded) {

            $implant_basic_script_dependencies[] = 'sagodent-lenis';
        } elseif ($lenis_library_loaded) {

            $implant_basic_script_dependencies[] = 'sagodent-lenis-library';
        }

        sagodent_enqueue_local_script(

            'sagodent-implant-basic-script',

            '/assets/js/sagodent-implant-basic.js',

            array_values(

                array_unique($implant_basic_script_dependencies)

            ),

            true

        );
    }
}

add_action(

    'wp_enqueue_scripts',

    'sagodent_enqueue_assets',

    99

);

/* 5. BODY CLASS */

function sagodent_body_class($classes)

{

    if (sagodent_is_homepage()) {

        $classes[] = 'sagodent-page';
    }

    if (sagodent_is_veneer_page()) {

        $classes[] = 'sagodent-veneer-page';
    }

    return array_values(

        array_unique($classes)

    );
}

add_filter(

    'body_class',

    'sagodent_body_class'

);

/* 6. BẢO VỆ SHORTCODE KHỎI WPAUTOP */

function my_ux_no_autop_tags()

{

    return array('text_box'); // Đổi tag tại đây nếu cần.

}

// Chạy trước wpautop.
add_filter('the_content', 'my_shield_ux_html_before_wpautop', 9);

function my_shield_ux_html_before_wpautop($content)

{

    foreach (my_ux_no_autop_tags() as $tag) {

        $pattern = '/\\[' . preg_quote($tag, '/') . '([^\\]]*)\\](.*?)\\[\\/' . preg_quote($tag, '/') . '\\]/s';

        $content = preg_replace_callback($pattern, function ($m) use ($tag) {

            $attrs   = $m[1];

            $inner   = $m[2];

            $encoded = base64_encode($inner); // Tạm mã hóa để wpautop không can thiệp.

            return '[' . $tag . $attrs . ']' . $encoded . '[/' . $tag . ']';
        }, $content);
    }

    return $content;
}

// Khôi phục sau wpautop, trước do_shortcode.
add_filter('the_content', 'my_unshield_ux_html_after_wpautop', 10);

function my_unshield_ux_html_after_wpautop($content)

{

    foreach (my_ux_no_autop_tags() as $tag) {

        $pattern = '/\\[' . preg_quote($tag, '/') . '([^\\]]*)\\](.*?)\\[\\/' . preg_quote($tag, '/') . '\\]/s';

        $content = preg_replace_callback($pattern, function ($m) use ($tag) {

            $attrs   = $m[1];

            $decoded = base64_decode($m[2]);

            return '[' . $tag . $attrs . ']' . $decoded . '[/' . $tag . ']';
        }, $content);
    }

    return $content;
}
