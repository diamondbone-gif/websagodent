<?php

/**
 * Flatsome Child Theme functions.
 *
 * QUY TẮC NẠP FILE:
 *
 * Dùng chung toàn website:
 * - style.css
 * - assets/css/sagodent-root.css
 * - assets/css/sagodent-footer.css
 * - assets/css/lenis.css
 * - assets/css/sagodent-all.css
 * - assets/js/lenis.min.js
 * - assets/js/sagodent-lenis.js
 * - assets/js/sagodent-all.js
 *
 * sagodent-all.css bao gồm:
 * - PHẦN 1: MENU SAGODENT
 * - PHẦN 2: SAGODENT
 *
 * sagodent-all.js bao gồm:
 * - PHẦN 1: MENU SAGODENT
 * - PHẦN 2: SAGODENT
 *
 * Phần nội dung Sagodent vẫn chỉ hoạt động tại trang có
 * .sagodent-page.
 *
 * Thứ tự:
 * CSS:
 * style.css
 * -> sagodent-root.css
 * -> sagodent-footer.css / lenis.css
 * -> sagodent-all.css
 *
 * JS:
 * lenis.min.js
 * -> sagodent-lenis.js
 * -> sagodent-all.js
 *
 * sagodent-all.css và sagodent-all.js được nạp cuối
 * để hạn chế CSS/JS Flatsome ghi đè.
 *
 * @package Sagodent
 */

defined('ABSPATH') || exit;


/**
 * Lấy version theo thời gian chỉnh sửa file để chống cache.
 *
 * @param string $file_path Đường dẫn vật lý của file.
 * @return string
 */
function sagodent_asset_version($file_path)
{
    if (file_exists($file_path)) {
        return (string) filemtime($file_path);
    }

    return (string) wp_get_theme()->get('Version');
}


/**
 * Kiểm tra trang hiện tại có phải trang chủ Sagodent hay không.
 *
 * is_front_page(): trang đang được đặt làm trang chủ WordPress.
 * is_page('sagodent'): dự phòng khi trang có slug là sagodent.
 *
 * @return bool
 */
function sagodent_is_homepage()
{
    return is_front_page() || is_page('sagodent');
}


/**
 * Nạp CSS cục bộ nếu file tồn tại.
 *
 * @param string   $handle        Tên định danh CSS.
 * @param string   $relative_path Đường dẫn tính từ flatsome-child.
 * @param string[] $dependencies  Danh sách CSS phải tải trước.
 * @return bool
 */
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


/**
 * Nạp JavaScript cục bộ nếu file tồn tại.
 *
 * @param string   $handle        Tên định danh JavaScript.
 * @param string   $relative_path Đường dẫn tính từ flatsome-child.
 * @param string[] $dependencies  Danh sách script phải tải trước.
 * @param bool     $in_footer     Có đưa script xuống cuối body không.
 * @return bool
 */
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


/**
 * Nạp CSS và JavaScript của Flatsome Child.
 */
function sagodent_enqueue_assets()
{
    $theme_path = get_stylesheet_directory();


    /* ========================================================
     * 1. STYLE.CSS — DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */
    $child_style_path = $theme_path . '/style.css';

    wp_enqueue_style(
        'flatsome-child-style',
        get_stylesheet_uri(),
        array(),
        sagodent_asset_version($child_style_path)
    );


    /* ========================================================
     * 2. CSS NỀN TẢNG — DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */
    $root_loaded = sagodent_enqueue_local_style(
        'sagodent-root',
        '/assets/css/sagodent-root.css',
        array('flatsome-child-style')
    );

    $root_dependency = $root_loaded
        ? array('sagodent-root')
        : array('flatsome-child-style');


    sagodent_enqueue_local_style(
        'sagodent-footer',
        '/assets/css/sagodent-footer.css',
        $root_dependency
    );


    sagodent_enqueue_local_style(
        'sagodent-lenis-style',
        '/assets/css/lenis.css',
        $root_dependency
    );


    /* ========================================================
     * 3. LENIS — DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */
    $lenis_library_loaded = sagodent_enqueue_local_script(
        'sagodent-lenis-library',
        '/assets/js/lenis.min.js',
        array(),
        true
    );

    $lenis_config_dependencies = $lenis_library_loaded
        ? array('sagodent-lenis-library')
        : array();

    $lenis_config_loaded = sagodent_enqueue_local_script(
        'sagodent-lenis',
        '/assets/js/sagodent-lenis.js',
        $lenis_config_dependencies,
        true
    );


    /* ========================================================
     * 4. SAGODENT-ALL.CSS — DÙNG CHUNG TOÀN WEBSITE
     * ========================================================
     *
     * File này thay thế:
     * - sagodent.css
     * - sagodent-menu.css
     *
     * Phần Sagodent được giới hạn bởi .sagodent-page.
     * Phần menu sử dụng namespace --sgd-*.
     *
     * File được nạp sau root/footer/lenis để hạn chế
     * CSS Flatsome và các file nền ghi đè.
     * ======================================================== */
    $all_style_dependencies = array();

    if ($root_loaded) {
        $all_style_dependencies[] = 'sagodent-root';
    } else {
        $all_style_dependencies[] = 'flatsome-child-style';
    }

    if (wp_style_is('sagodent-footer', 'enqueued')) {
        $all_style_dependencies[] = 'sagodent-footer';
    }

    if (wp_style_is('sagodent-lenis-style', 'enqueued')) {
        $all_style_dependencies[] = 'sagodent-lenis-style';
    }

    sagodent_enqueue_local_style(
        'sagodent-all-style',
        '/assets/css/sagodent-all.css',
        array_values(
            array_unique($all_style_dependencies)
        )
    );


    /* ========================================================
     * 5. SAGODENT-ALL.JS — DÙNG CHUNG TOÀN WEBSITE
     * ========================================================
     *
     * File này thay thế:
     * - sagodent.js
     * - sagodent-menu.js
     *
     * Menu tự kiểm tra main#--sgd-top trước khi chạy.
     * Nội dung Sagodent tự kiểm tra .sagodent-page trước khi chạy.
     *
     * File được đưa xuống footer và chạy sau Lenis.
     * ======================================================== */
    $all_script_dependencies = array();

    if ($lenis_config_loaded) {
        $all_script_dependencies[] = 'sagodent-lenis';
    } elseif ($lenis_library_loaded) {
        $all_script_dependencies[] = 'sagodent-lenis-library';
    }

    sagodent_enqueue_local_script(
        'sagodent-all-script',
        '/assets/js/sagodent-all.js',
        array_values(
            array_unique($all_script_dependencies)
        ),
        true
    );
}


/**
 * Priority 99 để tài nguyên Sagodent được nạp
 * sau phần lớn CSS/JS Flatsome.
 */
add_action(
    'wp_enqueue_scripts',
    'sagodent_enqueue_assets',
    99
);


/**
 * Thêm class riêng vào body trang chủ Sagodent.
 *
 * Kết quả:
 * <body class="... sagodent-page">
 *
 * @param string[] $classes Danh sách class body hiện tại.
 * @return string[]
 */
function sagodent_body_class($classes)
{
    if (sagodent_is_homepage()) {
        $classes[] = 'sagodent-page';
    }

    return array_values(
        array_unique($classes)
    );
}


add_filter(
    'body_class',
    'sagodent_body_class'
);
