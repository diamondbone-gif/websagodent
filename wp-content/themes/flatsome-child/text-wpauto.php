<?php

/**
 * Flatsome Child Theme functions.
 *
 * ============================================================
 * QUY TẮC NẠP FILE
 * ============================================================
 *
 * DÙNG CHUNG TOÀN WEBSITE:
 *
 * CSS:
 * - style.css
 * - assets/css/sagodent-root.css
 * - assets/css/sagodent-footer.css
 * - assets/css/lenis.css
 * - assets/css/sagodent-all.css
 *
 * JS:
 * - assets/js/lenis.min.js
 * - assets/js/sagodent-lenis.js
 * - assets/js/sagodent-all.js
 *
 *
 * CHỈ DÙNG CHO TRANG VENEER:
 *
 * CSS:
 * - assets/css/sagodent-veneer.css
 *
 * JS:
 * - assets/js/sagodent-veneer.js
 *
 *
 * ============================================================
 * THỨ TỰ NẠP CSS
 * ============================================================
 *
 * style.css
 * -> sagodent-root.css
 * -> sagodent-footer.css
 * -> lenis.css
 * -> sagodent-all.css
 * -> sagodent-veneer.css
 *
 *
 * ============================================================
 * THỨ TỰ NẠP JAVASCRIPT
 * ============================================================
 *
 * lenis.min.js
 * -> sagodent-lenis.js
 * -> sagodent-all.js
 * -> sagodent-veneer.js
 *
 *
 * ============================================================
 * GHI CHÚ
 * ============================================================
 *
 * sagodent-all.css / sagodent-all.js:
 * - Dùng chung cho hệ thống Sagodent.
 * - Menu tự kiểm tra main#--sgd-top.
 * - Nội dung Sagodent có thể giới hạn bằng .sagodent-page.
 *
 * sagodent-veneer.css / sagodent-veneer.js:
 * - Chỉ được nạp tại trang Veneer.
 * - Được nạp SAU sagodent-all để có thể ghi đè style chung
 *   khi cần thiết.
 *
 * @package Sagodent
 */

defined('ABSPATH') || exit;


/* ============================================================
 * 1. HÀM TIỆN ÍCH
 * ============================================================ */


/**
 * Lấy version dựa theo thời gian chỉnh sửa file.
 *
 * Mục đích:
 * - Tự động thay đổi version khi file CSS/JS được chỉnh sửa.
 * - Hạn chế trình duyệt giữ cache phiên bản cũ.
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
 * is_front_page():
 * - Trang được WordPress đặt làm trang chủ.
 *
 * is_page('sagodent'):
 * - Dự phòng nếu trang có slug "sagodent".
 *
 * @return bool
 */
function sagodent_is_homepage()
{
    return is_front_page() || is_page('sagodent');
}


/**
 * Kiểm tra trang hiện tại có phải trang Veneer hay không.
 *
 * QUAN TRỌNG:
 * Nếu slug trang Veneer của bạn không phải:
 *
 * veneer
 *
 * thì thay chữ "veneer" bên dưới bằng slug thực tế.
 *
 * Ví dụ:
 *
 * is_page('the-veneer-workflow')
 *
 * @return bool
 */
function sagodent_is_veneer_page()
{
    return is_page('veneer');
}


/* ============================================================
 * 2. HÀM NẠP CSS
 * ============================================================ */


/**
 * Nạp CSS cục bộ nếu file tồn tại.
 *
 * @param string   $handle        Tên định danh CSS.
 * @param string   $relative_path Đường dẫn từ flatsome-child.
 * @param string[] $dependencies  CSS phải tải trước.
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


/* ============================================================
 * 3. HÀM NẠP JAVASCRIPT
 * ============================================================ */


/**
 * Nạp JavaScript cục bộ nếu file tồn tại.
 *
 * @param string   $handle        Tên định danh JavaScript.
 * @param string   $relative_path Đường dẫn từ flatsome-child.
 * @param string[] $dependencies  Script phải tải trước.
 * @param bool     $in_footer     Có đưa xuống cuối body không.
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


/* ============================================================
 * 4. NẠP TOÀN BỘ CSS + JAVASCRIPT
 * ============================================================ */


/**
 * Nạp CSS và JavaScript của Flatsome Child Theme.
 */
function sagodent_enqueue_assets()
{
    $theme_path = get_stylesheet_directory();


    /* ========================================================
     * 4.1. STYLE.CSS
     * DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */

    $child_style_path = $theme_path . '/style.css';

    wp_enqueue_style(
        'flatsome-child-style',
        get_stylesheet_uri(),
        array(),
        sagodent_asset_version($child_style_path)
    );


    /* ========================================================
     * 4.2. SAGODENT-ROOT.CSS
     * DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */

    $root_loaded = sagodent_enqueue_local_style(
        'sagodent-root',
        '/assets/css/sagodent-root.css',
        array('flatsome-child-style')
    );

    $root_dependency = $root_loaded
        ? array('sagodent-root')
        : array('flatsome-child-style');


    /* ========================================================
     * 4.3. SAGODENT-FOOTER.CSS
     * DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */

    $footer_loaded = sagodent_enqueue_local_style(
        'sagodent-footer',
        '/assets/css/sagodent-footer.css',
        $root_dependency
    );


    /* ========================================================
     * 4.4. LENIS.CSS
     * DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */

    $lenis_style_loaded = sagodent_enqueue_local_style(
        'sagodent-lenis-style',
        '/assets/css/lenis.css',
        $root_dependency
    );


    /* ========================================================
     * 4.5. LENIS.MIN.JS
     * THƯ VIỆN LENIS
     * DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */

    $lenis_library_loaded = sagodent_enqueue_local_script(
        'sagodent-lenis-library',
        '/assets/js/lenis.min.js',
        array(),
        true
    );


    /* ========================================================
     * 4.6. SAGODENT-LENIS.JS
     * FILE CẤU HÌNH LENIS
     * DÙNG CHUNG TOÀN WEBSITE
     * ======================================================== */

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
     * 4.7. SAGODENT-ALL.CSS
     * DÙNG CHUNG TOÀN WEBSITE
     * ========================================================
     *
     * File này thay thế:
     * - sagodent.css
     * - sagodent-menu.css
     *
     * Bao gồm:
     * - PHẦN 1: MENU SAGODENT
     * - PHẦN 2: SAGODENT
     *
     * Được nạp sau:
     * - style.css
     * - sagodent-root.css
     * - sagodent-footer.css
     * - lenis.css
     *
     * để hạn chế bị các style trước đó ghi đè.
     * ======================================================== */

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


    /* ========================================================
     * 4.8. SAGODENT-ALL.JS
     * DÙNG CHUNG TOÀN WEBSITE
     * ========================================================
     *
     * File này thay thế:
     * - sagodent.js
     * - sagodent-menu.js
     *
     * Menu:
     * - Tự kiểm tra main#--sgd-top trước khi chạy.
     *
     * Nội dung Sagodent:
     * - Có thể tự kiểm tra .sagodent-page trước khi chạy.
     *
     * Script được đưa xuống footer.
     * ======================================================== */

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


    /* ========================================================
     * 4.9. SAGODENT-VENEER.CSS
     * CHỈ NẠP TRÊN TRANG VENEER
     * ========================================================
     *
     * File:
     * /assets/css/sagodent-veneer.css
     *
     * Mục đích:
     * - Chứa toàn bộ giao diện riêng của trang Veneer.
     * - Không ảnh hưởng những trang khác.
     *
     * File được nạp SAU sagodent-all.css để CSS của Veneer
     * có thể ghi đè style chung khi cần.
     * ======================================================== */

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


    /* ========================================================
     * 4.10. SAGODENT-VENEER.JS
     * CHỈ NẠP TRÊN TRANG VENEER
     * ========================================================
     *
     * File:
     * /assets/js/sagodent-veneer.js
     *
     * Mục đích:
     * - Chứa animation / interaction riêng cho trang Veneer.
     * - Không chạy ở các trang khác.
     *
     * File được nạp SAU sagodent-all.js.
     * ======================================================== */

    if (sagodent_is_veneer_page()) {

        $veneer_script_dependencies = array();

        if ($all_script_loaded) {

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
}


/**
 * Priority 99:
 *
 * Cho tài nguyên Sagodent được đăng ký sau phần lớn
 * tài nguyên mặc định của Flatsome.
 */
add_action(
    'wp_enqueue_scripts',
    'sagodent_enqueue_assets',
    99
);


/* ============================================================
 * 5. BODY CLASS
 * ============================================================ */


/**
 * Thêm class riêng vào <body>.
 *
 * Trang chủ:
 *
 * <body class="... sagodent-page">
 *
 * Trang Veneer:
 *
 * <body class="... sagodent-veneer-page">
 *
 * @param string[] $classes Danh sách class hiện tại.
 * @return string[]
 */
function sagodent_body_class($classes)
{
    /**
     * Class dành cho trang chủ Sagodent.
     */
    if (sagodent_is_homepage()) {
        $classes[] = 'sagodent-page';
    }


    /**
     * Class dành riêng cho trang Veneer.
     *
     * Có thể dùng trong CSS:
     *
     * .sagodent-veneer-page .ten-class {
     *     ...
     * }
     *
     * Có thể dùng trong JavaScript:
     *
     * document.querySelector('.sagodent-veneer-page')
     */
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

/* ============================================================
 * 6. TÙY CHỈNH WORDPRESS (BẢO VỆ UX BUILDER HTML ELEMENT)
 * ============================================================ */

/**
 * GIẢI QUYẾT TRIỆT ĐỂ XUNG ĐỘT WPAUTOP VỚI FLATSOME UX BUILDER:
 * 
 * Mục đích: 
 * Vô hiệu hóa tính năng tự chèn <p> và <br> CHỈ cho Element "Custom HTML" 
 * của UX Builder. Element "Text" thông thường vẫn giữ nguyên tính năng 
 * xuống dòng/chia đoạn. Không cần viết shortcode thủ công.
 */

global $sgd_ux_html_blocks;
$sgd_ux_html_blocks = array();

// BƯỚC 1: Trích xuất Element HTML trước khi wpautop kịp chạy (Ưu tiên 9)
add_filter('the_content', 'sgd_protect_ux_html_before_wpautop', 9);
// FIX: Khai báo kiểu string cho $content để trình soạn thảo không báo lỗi Warning Type Hinting.
function sgd_protect_ux_html_before_wpautop(string $content)
{
    global $sgd_ux_html_blocks;
    $sgd_ux_html_blocks = array(); // Xóa dữ liệu cũ

    // Nếu trang không chứa Element HTML nào, bỏ qua luôn để tiết kiệm tài nguyên
    if (strpos($content, '[ux_html') === false) {
        return $content;
    }

    // Tìm tất cả các block shortcode HTML của Flatsome
    $content = preg_replace_callback('/\[ux_html[^\]]*\].*?\[\/ux_html\]/is', function ($matches) {
        global $sgd_ux_html_blocks;

        // Tạo một biến giữ chỗ (Placeholder)
        $placeholder = '<!-- SGD_UX_HTML_PLACEHOLDER_' . count($sgd_ux_html_blocks) . ' -->';

        // Lưu toàn bộ code HTML gốc của bạn vào mảng
        $sgd_ux_html_blocks[$placeholder] = $matches[0];

        // Trả về placeholder (Cố tình thêm \n\n để wpautop bọc nó vào <p> cho dễ xóa)
        return "\n\n" . $placeholder . "\n\n";
    }, $content);

    return $content;
}

// -> Tới đây, wpautop của WordPress sẽ chạy tự động ở mức ưu tiên 10. 
// Nó sẽ định dạng các Text Element hoàn hảo, và nghĩ cái Placeholder kia chỉ là văn bản thường.

// BƯỚC 2: Trả lại code HTML gốc sau khi wpautop đã chạy xong (Ưu tiên 11)
add_filter('the_content', 'sgd_restore_ux_html_after_wpautop', 11);
// FIX: Khai báo kiểu string cho $content để trình soạn thảo không báo lỗi Warning Type Hinting.
function sgd_restore_ux_html_after_wpautop(string $content)
{
    global $sgd_ux_html_blocks;

    if (empty($sgd_ux_html_blocks)) {
        return $content;
    }

    foreach ($sgd_ux_html_blocks as $placeholder => $original_html) {
        // Dùng Regex quét dọn: Xóa tận gốc các thẻ <p> hoặc <br> do wpautop vô tình quấn quanh placeholder
        $pattern = '/(?:<p>)?(?:<br\s*\/?>)?\s*' . preg_quote($placeholder, '/') . '\s*(?:<\ /p>)?/i';

        // Thay thế bằng HTML nguyên vẹn, tinh khiết 100% của bạn
        $content = preg_replace($pattern, $original_html, $content);
    }

    return $content;
}
