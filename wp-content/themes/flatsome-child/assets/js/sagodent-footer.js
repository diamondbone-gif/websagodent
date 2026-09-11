/* Facebook Page Plugin responsive. Không liên quan đến menu. */
(() => {
    const box = document.getElementById('sagodentFacebookBox');
    const iframe = document.getElementById('sagodentFacebookIframe');
    if (!box || !iframe) return;

    const PAGE_URL = 'https://www.facebook.com/trungtamsagodent';
    const HEIGHT = 155;
    let lastWidth = 0;
    let resizeTimer = 0;

    const buildUrl = (width) => {
        const params = new URLSearchParams({
            href: PAGE_URL,
            tabs: '',
            width: String(width),
            height: String(HEIGHT),
            small_header: 'false',
            adapt_container_width: 'true',
            hide_cover: 'false',
            show_facepile: 'false'
        });

        return `https://www.facebook.com/plugins/page.php?${params}`;
    };

    const refresh = () => {
        const measuredWidth = Math.floor(box.getBoundingClientRect().width);
        if (!measuredWidth) return;

        // Facebook Page Plugin hỗ trợ 180–500px.
        const width = Math.max(180, Math.min(500, measuredWidth));
        if (Math.abs(width - lastWidth) < 4) return;

        lastWidth = width;
        iframe.width = width;
        iframe.src = buildUrl(width);
    };

    const queueRefresh = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 120);
    };

    refresh();

    // ResizeObserver đã theo dõi chính xác thay đổi kích thước của cột.
    // Chỉ dùng window.resize làm fallback cho trình duyệt cũ.
    if ('ResizeObserver' in window) {
        new ResizeObserver(queueRefresh).observe(box);
    } else {
        window.addEventListener('resize', queueRefresh, { passive: true });
    }
})();