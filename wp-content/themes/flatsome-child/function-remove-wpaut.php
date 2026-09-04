<?php

/**
 * Flatsome Child Theme functions.
 *
 * QUY TẮC NẠP FILE & CẤU TRÚC:
 * - style.css -> sagodent-root.css -> sagodent-footer.css -> lenis.css -> sagodent-all.css -> sagodent-veneer.css
 * - lenis.min.js -> sagodent-lenis.js -> sagodent-all.js -> sagodent-veneer.js
 * 
 * @package Sagodent
 */

defined('ABSPATH') || exit;

/* ============================================================
 * 1. HÀM TIỆN ÍCH & TỐI ƯU BỘ NHỚ CACHE (TRANSIENT)
 * ============================================================ */

/**
 * Lấy version tối ưu hiệu năng bằng cách lưu cache filemtime (transient).
 * Tránh gọi file_exists() và filemtime() liên tục trên mỗi request.
 */
function sagodent_asset_version(string $file_path): string
{
    if (!file_exists($file_path)) {
        return (string) wp_get_theme()->get('Version');
    }

    $cache_key = 'sgd_ver_' . md5($file_path);
    $version = get_transient($cache_key);

    if (false === $version) {
        $version = (string) filemtime($file_path);
        // Lưu cache trong 12 giờ để giảm tải I/O ổ cứng
        set_transient($cache_key, $version, 12 * HOUR_IN_SECONDS);
    }

    return $version;
}

/**
 * Kiểm tra nhanh trang chủ Sagodent.
 */
function sagodent_is_homepage(): bool
{
    return is_front_page() || is_page('sagodent');
}

/**
 * Kiểm tra nhanh trang Veneer.
 */
function sagodent_is_veneer_page(): bool
{
    return is_page('veneer');
}

/* ============================================================
 * 2 & 3. HÀM NẠP CSS & JAVASCRIPT CỤC BỘ
 * ============================================================ */

function sagodent_enqueue_local_style(string $handle, string $relative_path, array $dependencies = []): bool
{
    $file_path = get_stylesheet_directory() . $relative_path;
    if (!file_exists($file_path)) {
        return false;
    }

    wp_enqueue_style($handle, get_stylesheet_directory_uri() . $relative_path, $dependencies, sagodent_asset_version($file_path));
    return true;
}

function sagodent_enqueue_local_script(string $handle, string $relative_path, array $dependencies = [], bool $in_footer = true): bool
{
    $file_path = get_stylesheet_directory() . $relative_path;
    if (!file_exists($file_path)) {
        return false;
    }

    wp_enqueue_script($handle, get_stylesheet_directory_uri() . $relative_path, $dependencies, sagodent_asset_version($file_path), $in_footer);
    return true;
}

/* ============================================================
 * 4. NẠP TOÀN BỘ CSS + JAVASCRIPT (ĐÃ LOẠI BỎ ĐIỀU KIỆN DƯ THỪA)
 * ============================================================ */

function sagodent_enqueue_assets()
{
    $theme_path = get_stylesheet_directory();

    // 4.1. style.css
    wp_enqueue_style('flatsome-child-style', get_stylesheet_uri(), [], sagodent_asset_version($theme_path . '/style.css'));

    // 4.2. sagodent-root.css
    $root_loaded = sagodent_enqueue_local_style('sagodent-root', '/assets/css/sagodent-root.css', ['flatsome-child-style']);
    $root_dep = $root_loaded ? ['sagodent-root'] : ['flatsome-child-style'];

    // 4.3. sagodent-footer.css
    $footer_loaded = sagodent_enqueue_local_style('sagodent-footer', '/assets/css/sagodent-footer.css', $root_dep);

    // 4.4. lenis.css
    $lenis_style_loaded = sagodent_enqueue_local_style('sagodent-lenis-style', '/assets/css/lenis.css', $root_dep);

    // 4.5. lenis.min.js
    $lenis_lib_loaded = sagodent_enqueue_local_script('sagodent-lenis-library', '/assets/js/lenis.min.js', [], true);

    // 4.6. sagodent-lenis.js
    $lenis_cfg_dep = $lenis_lib_loaded ? ['sagodent-lenis-library'] : [];
    $lenis_cfg_loaded = sagodent_enqueue_local_script('sagodent-lenis', '/assets/js/sagodent-lenis.js', $lenis_cfg_dep, true);

    // 4.7. sagodent-all.css
    $all_css_deps = array_unique(array_filter([
        $root_loaded ? 'sagodent-root' : 'flatsome-child-style',
        $footer_loaded ? 'sagodent-footer' : null,
        $lenis_style_loaded ? 'sagodent-lenis-style' : null,
    ]));
    $all_css_loaded = sagodent_enqueue_local_style('sagodent-all-style', '/assets/css/sagodent-all.css', array_values($all_css_deps));

    // 4.8. sagodent-all.js
    $all_js_deps = array_unique(array_filter([
        $lenis_cfg_loaded ? 'sagodent-lenis' : ($lenis_lib_loaded ? 'sagodent-lenis-library' : null),
    ]));
    $all_js_loaded = sagodent_enqueue_local_script('sagodent-all-script', '/assets/js/sagodent-all.js', array_values($all_js_deps), true);

    // 4.9 & 4.10. TÀI NGUYÊN RIÊNG CHO TRANG VENEER (TỐI ƯU: CHỈ GỌI KHI ĐÚNG TRANG)
    if (sagodent_is_veneer_page()) {
        $veneer_css_dep = $all_css_loaded ? ['sagodent-all-style'] : ($root_loaded ? ['sagodent-root'] : ['flatsome-child-style']);
        sagodent_enqueue_local_style('sagodent-veneer-style', '/assets/css/sagodent-veneer.css', $veneer_css_dep);

        $veneer_js_deps = array_unique(array_filter([
            $all_js_loaded ? 'sagodent-all-script' : null,
            $lenis_cfg_loaded ? 'sagodent-lenis' : null,
        ]));
        sagodent_enqueue_local_script('sagodent-veneer-script', '/assets/js/sagodent-veneer.js', array_values($veneer_js_deps), true);
    }
}
add_action('wp_enqueue_scripts', 'sagodent_enqueue_assets', 99);

/* ============================================================
 * 5. BODY CLASS
 * ============================================================ */

function sagodent_body_class(array $classes): array
{
    if (sagodent_is_homepage()) {
        $classes[] = 'sagodent-page';
    }
    if (sagodent_is_veneer_page()) {
        $classes[] = 'sagodent-veneer-page';
    }
    return array_values(array_unique($classes));
}
add_filter('body_class', 'sagodent_body_class');

/* ============================================================
 * 6. TÙY CHỈNH WORDPRESS (BẢO VỆ UX BUILDER HTML ELEMENT TỐI ƯU)
 * ============================================================ */

/**
 * GIẢI PHÁP TỐI ƯU TỐC ĐỘ (O(1) CHECK & LIGHTWEIGHT REGEX):
 * Cách ly [ux_html] khỏi wpautop để tránh bị chèn thẻ <p>/<br> rác làm vỡ Flexbox,
 * đồng thời kiểm tra nhanh strpos để bỏ qua hoàn toàn các trang không có shortcode này.
 */
global $sgd_ux_html_blocks;
$sgd_ux_html_blocks = [];

add_filter('the_content', function (string $content): string {
    global $sgd_ux_html_blocks;
    $sgd_ux_html_blocks = [];

    // TỐI ƯU: Nếu không có [ux_html], trả về ngay lập tức để tiết kiệm CPU thời gian chạy
    if (false === strpos($content, '[ux_html')) {
        return $content;
    }

    return preg_replace_callback('/\[ux_html[^\]]*\].*?\[\/ux_html\]/is', function ($matches) {
        global $sgd_ux_html_blocks;
        $placeholder = '<!-- SGD_' . count($sgd_ux_html_blocks) . ' -->';
        $sgd_ux_html_blocks[$placeholder] = $matches[0];
        return "\n\n" . $placeholder . "\n\n";
    }, $content);
}, 9);

add_filter('the_content', function (string $content): string {
    global $sgd_ux_html_blocks;

    if (empty($sgd_ux_html_blocks)) {
        return $content;
    }

    // TỐI ƯU: Dùng strtr thay vì regex phức tạp trong vòng lặp để phục hồi code siêu nhanh
    $placeholders = array_keys($sgd_ux_html_blocks);
    $originals = array_values($sgd_ux_html_blocks);

    // Xóa các thẻ <p>/<br> xung quanh placeholder trước khi thay thế
    foreach ($placeholders as $placeholder) {
        $pattern = '/(?:<p>)?(?:<br\s*\/?>)?\s*' . preg_quote($placeholder, '/') . '\s*(?:<\ /p>)?/i';
        $content = preg_replace($pattern, $placeholder, $content);
    }

    return str_replace($placeholders, $originals, $content);
}, 11);
