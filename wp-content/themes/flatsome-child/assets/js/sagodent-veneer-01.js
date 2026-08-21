/* ============================================================
   SAGODENT VENEER PAGE
   - Không tạo menu thứ 2.
   - Không sửa JS Trang chủ.
   - Chỉ đồng bộ màu Page Veneer với menu SagoDent chung hiện tại.
   ============================================================ */

(function() {
    "use strict";

    const PAGE_SELECTOR = ".sgd-veneer-page";
    const SECTION_SELECTOR =
        PAGE_SELECTOR + " [data-menu-bg][data-menu-tone]";

    const BRAND = "#062d48";
    const ACCENT = "#6ebce5";

    let page = null;
    let queued = false;
    let observer = null;

    function getMenu() {
        return {
            header: document.querySelector(
                "body > .--sgd-topbar.--sgd-sagodent-menu-mounted"
            ),
            panel: document.querySelector(
                "body > .--sgd-menu-panel.--sgd-sagodent-menu-mounted"
            ),
            progress: document.querySelector(
                "body > .--sgd-scroll-progress.--sgd-sagodent-menu-mounted"
            ),
        };
    }

    function normalizeHex(value, fallback) {
        const color = String(value || "").trim();

        if (/^#[0-9a-f]{6}$/i.test(color)) {
            return color.toLowerCase();
        }

        return fallback;
    }

    function hexToRgb(hex) {
        const source = normalizeHex(hex, "#062d48").slice(1);

        return {
            r: parseInt(source.slice(0, 2), 16),
            g: parseInt(source.slice(2, 4), 16),
            b: parseInt(source.slice(4, 6), 16),
        };
    }

    function rgba(hex, alpha) {
        const rgb = hexToRgb(hex);

        return (
            "rgba(" +
            rgb.r + ", " +
            rgb.g + ", " +
            rgb.b + ", " +
            alpha +
            ")"
        );
    }

    function findSectionUnderMenu(header) {
        if (!page) return null;

        const headerRect = header ?
            header.getBoundingClientRect() : { bottom: 76 };

        const y = Math.min(
            Math.max(headerRect.bottom + 4, 1),
            Math.max(1, window.innerHeight - 1)
        );

        const xPoints = [
            window.innerWidth * 0.16,
            window.innerWidth * 0.50,
            window.innerWidth * 0.84,
        ];

        for (const x of xPoints) {
            const elements = document.elementsFromPoint(
                Math.min(
                    Math.max(x, 1),
                    Math.max(1, window.innerWidth - 1)
                ),
                y
            );

            for (const element of elements) {
                const section = element.closest(SECTION_SELECTOR);

                if (section && page.contains(section)) {
                    return section;
                }
            }
        }

        const sections = Array.from(
            page.querySelectorAll("[data-menu-bg][data-menu-tone]")
        );

        return (
            sections.find(function(section) {
                const rect = section.getBoundingClientRect();
                return rect.top <= y && rect.bottom > y;
            }) ||
            sections[0] ||
            null
        );
    }

    function setImportant(element, name, value) {
        if (!element || !value) return;
        element.style.setProperty(name, value, "important");
    }

    function setToneClasses(element, dark) {
        if (!element) return;

        element.classList.toggle("--sgd-menu-tone-dark", dark);
        element.classList.toggle("--sgd-menu-tone-light", !dark);
    }

    function applyVeneerMenuTheme() {
        queued = false;

        if (!page || !document.body.contains(page)) {
            page = document.querySelector(PAGE_SELECTOR);
        }

        if (!page) return;

        const menu = getMenu();
        const activeSection = findSectionUnderMenu(menu.header);

        if (!activeSection) return;

        const background = normalizeHex(
            activeSection.getAttribute("data-menu-bg"),
            BRAND
        );

        const tone =
            String(
                activeSection.getAttribute("data-menu-tone") || "dark"
            )
            .trim()
            .toLowerCase() === "light" ?
            "light" :
            "dark";

        const dark = tone === "dark";

        document.body.classList.add("sgd-veneer-active");
        document.documentElement.classList.add("sgd-veneer-active");

        document.body.classList.toggle("veneer-menu-dark", dark);
        document.body.classList.toggle("veneer-menu-light", !dark);

        document.body.setAttribute(
            "data-veneer-menu-bg",
            background
        );
        document.body.setAttribute(
            "data-veneer-menu-tone",
            tone
        );

        const foreground = dark ? "#ffffff" : BRAND;
        const border = dark ?
            "rgba(255, 255, 255, 0.18)" :
            rgba(BRAND, 0.18);

        const hover = dark ?
            "rgba(255, 255, 255, 0.08)" :
            rgba(BRAND, 0.07);

        let headerGlass;
        let panelGlass;

        if (!dark) {
            headerGlass = "rgba(255, 255, 255, 0.78)";
            panelGlass = "rgba(255, 255, 255, 0.80)";
        } else {
            headerGlass = rgba(background, 0.62);
            panelGlass = rgba(background, 0.80);
        }

        const properties = {
            "--menu-blue": BRAND,
            "--menu-sky": ACCENT,
            "--menu-section-bg": background,
            "--menu-foreground": foreground,
            "--menu-border": border,
            "--menu-hover": hover,
            "--menu-glass-bg": headerGlass,
            "--menu-panel-glass-bg": panelGlass,
        };

        [
            document.documentElement,
            document.body,
            menu.header,
            menu.panel,
        ].forEach(function(element) {
            if (!element) return;

            Object.keys(properties).forEach(function(name) {
                setImportant(element, name, properties[name]);
            });
        });

        setToneClasses(menu.header, dark);
        setToneClasses(menu.panel, dark);

        /* Đồng bộ trạng thái scrolled với menu chung hiện tại. */
        if (menu.header) {
            menu.header.classList.toggle(
                "--sgd-scrolled",
                window.scrollY > 20
            );
        }
    }

    function requestUpdate() {
        if (queued) return;

        queued = true;

        /*
         * Chạy sau menu JS chung một nhịp.
         * Nhờ vậy nếu menu Trang chủ vừa set inline variables,
         * Veneer sẽ trả lại palette đúng của Page Veneer.
         */
        window.requestAnimationFrame(function() {
            window.requestAnimationFrame(applyVeneerMenuTheme);
        });
    }

    function initVeneerPage() {
        page = document.querySelector(PAGE_SELECTOR);
        if (!page) return;

        document.body.classList.add("sgd-veneer-active");
        document.documentElement.classList.add("sgd-veneer-active");

        window.addEventListener("scroll", requestUpdate, {
            passive: true,
        });

        window.addEventListener("wheel", requestUpdate, {
            passive: true,
        });

        window.addEventListener("resize", requestUpdate, {
            passive: true,
        });

        window.addEventListener("orientationchange", requestUpdate, {
            passive: true,
        });

        window.addEventListener("load", requestUpdate, {
            once: true,
        });

        /*
         * Menu chung có thể được JS Trang chủ clone/mount vào body
         * sau DOMContentLoaded. Observer chỉ đợi menu xuất hiện,
         * không tạo thêm menu.
         */
        if ("MutationObserver" in window) {
            observer = new MutationObserver(function(mutations) {
                const menuExists = document.querySelector(
                    "body > .--sgd-topbar.--sgd-sagodent-menu-mounted"
                );

                if (menuExists) {
                    requestUpdate();

                    if (observer) {
                        observer.disconnect();
                        observer = null;
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: false,
            });
        }

        requestUpdate();

        window.setTimeout(requestUpdate, 120);
        window.setTimeout(requestUpdate, 500);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initVeneerPage, { once: true }
        );
    } else {
        initVeneerPage();
    }
})();