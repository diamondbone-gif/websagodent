<!-- start Simple Custom CSS and JS -->
<script type="text/javascript">


(function() {
    "use strict";

    function initSagodentMenu() {
        const menuRoot = Array.from(
            document.querySelectorAll("main#--sgd-top"),
        ).find(function(root) {
            return Boolean(
                root.querySelector(":scope > .--sgd-topbar .--sgd-menu-button") &&
                root.querySelector(":scope > .--sgd-menu-panel"),
            );
        });

        if (!menuRoot) return;

        const sourceHeader = menuRoot.querySelector(":scope > .--sgd-topbar");
        const sourcePanel = menuRoot.querySelector(":scope > .--sgd-menu-panel");
        const progress = menuRoot.querySelector(":scope > .--sgd-scroll-progress");

        if (!sourceHeader || !sourcePanel) return;

        
        const header = sourceHeader.cloneNode(true);
        const panel = sourcePanel.cloneNode(true);

        sourceHeader.replaceWith(header);
        sourcePanel.replaceWith(panel);

        const button = header.querySelector(".--sgd-menu-button");
        if (!button) return;

        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "--sgd-sagodent-main-menu-panel");

        panel.id = "--sgd-sagodent-main-menu-panel";
        panel.setAttribute("aria-hidden", "true");

        let backdrop = document.querySelector(
            "body > .--sgd-sagodent-menu-backdrop",
        );

        if (!backdrop) {
            backdrop = document.createElement("button");
            backdrop.type = "button";
            backdrop.className = "--sgd-sagodent-menu-backdrop";
            backdrop.setAttribute("aria-label", "Đóng menu");
            backdrop.setAttribute("aria-hidden", "true");
        }

        
        if (progress) {
            progress.classList.add("--sgd-sagodent-menu-mounted");
            document.body.appendChild(progress);
        }

        header.classList.add("--sgd-sagodent-menu-mounted");
        panel.classList.add("--sgd-sagodent-menu-mounted");

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
        document.body.appendChild(header);

        
        document
            .querySelectorAll("body > .--sgd-topbar.--sgd-sagodent-menu-mounted")
            .forEach(function(item) {
                if (item !== header) item.remove();
            });

        document
            .querySelectorAll("body > .--sgd-menu-panel.--sgd-sagodent-menu-mounted")
            .forEach(function(item) {
                if (item !== panel) item.remove();
            });

        let menuOpen = false;
        let updateQueued = false;
        let currentZone = document.querySelector(".hero");
        let lockedScrollY = 0;
        let mobileScrollLocked = false;
        let mobileTouchY = 0;

        
        function setMenuAdminOffset(value) {
            const offset = Number.isFinite(value) ? value : 0;
            const cssValue = offset.toFixed(2) + "px";

            document.documentElement.style.setProperty(
                "--menu-admin-offset",
                cssValue,
            );
            if (document.body) {
                document.body.style.setProperty("--menu-admin-offset", cssValue);
            }
        }

        function visibleAdminBarOffset() {
            const adminBar = document.getElementById("wpadminbar");
            if (!adminBar) return 0;

            const style = getComputedStyle(adminBar);
            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                Number(style.opacity) === 0
            ) {
                return 0;
            }

            const rect = adminBar.getBoundingClientRect();
            if (rect.height <= 0 || rect.bottom <= 0) return 0;

            return Math.max(0, rect.bottom);
        }

        function syncMenuTopOffset() {
            const expectedTop = visibleAdminBarOffset();
            setMenuAdminOffset(expectedTop);

            window.requestAnimationFrame(function() {
                const actualTop = expectedTop;
                const difference = 0;

                
                if (Math.abs(difference) > 0.5) {
                    setMenuAdminOffset(expectedTop);
                }
            });
        }

        function isMobileMenuMode() {
            return window.matchMedia("(max-width: 900px)").matches;
        }

        function lockMobilePageScroll() {
            if (!isMobileMenuMode() || mobileScrollLocked) return;

            lockedScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
            mobileScrollLocked = true;

            
            document.documentElement.style.setProperty(
                "--sgd-lock-top",
                "-" + lockedScrollY + "px",
            );

            if (
                window.sagodentLenis &&
                typeof window.sagodentLenis.stop === "function"
            ) {
                window.sagodentLenis.stop();
            }
        }

        function unlockMobilePageScroll() {
            if (!mobileScrollLocked) return;

            mobileScrollLocked = false;
            document.documentElement.style.removeProperty("--sgd-lock-top");

            
            window.scrollTo(0, lockedScrollY);

            if (window.sagodentLenis) {
                if (typeof window.sagodentLenis.resize === "function") {
                    window.sagodentLenis.resize();
                }
                if (typeof window.sagodentLenis.start === "function") {
                    window.sagodentLenis.start();
                }
            }
        }

        
        function rememberMobileTouch(event) {
            if (!menuOpen || !isMobileMenuMode()) return;
            if (!event.touches || !event.touches.length) return;
            mobileTouchY = event.touches[0].clientY;
        }

        function stopMobileOverscroll(event) {
            if (!menuOpen || !isMobileMenuMode()) return;
            if (!event.touches || !event.touches.length) return;

            const nextY = event.touches[0].clientY;
            const deltaY = nextY - mobileTouchY;
            mobileTouchY = nextY;

            if (!panel.contains(event.target)) {
                event.preventDefault();
                return;
            }

            const maxScroll = Math.max(0, panel.scrollHeight - panel.clientHeight);

            if (maxScroll <= 1) {
                event.preventDefault();
                return;
            }

            const atTop = panel.scrollTop <= 0;
            const atBottom = panel.scrollTop >= maxScroll - 1;

            if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
                event.preventDefault();
            }
        }

        document.addEventListener("touchstart", rememberMobileTouch, {
            passive: true,
        });
        document.addEventListener("touchmove", stopMobileOverscroll, {
            passive: false,
        });

        const explicitZoneSelector = [
            "[data-menu-bg]",
            "[data-sagodent-menu-bg]",
            "[data-menu-tone]",
            "[data-sagodent-menu-tone]",
            ".hero",
            ".intro",
            ".doctor",
            ".difference",
            ".difference-head",
            ".difference-row",
            ".courses",
            ".library",
            ".id4",
            ".contact",
            ".sagodent-zone-hero",
            ".sagodent-zone-dark",
            ".sagodent-zone-light",
            ".sagodent-zone-blue",
            ".sagodent-zone-black",
            "blockquote",
            "footer",
        ].join(",");

        const fallbackZoneSelector = [
            ".section",
            "section",
            "article",
            "blockquote",
            "footer",
        ].join(",");

        function setMenu(open) {
            const nextOpen = Boolean(open);
            const wasOpen = menuOpen;

            
            if (nextOpen && !wasOpen) {
                lockMobilePageScroll();
            }

            menuOpen = nextOpen;

            header.classList.toggle("--sgd-menu-open", menuOpen);
            panel.classList.toggle("--sgd-open", menuOpen);
            backdrop.classList.toggle("--sgd-open", menuOpen);
            document.documentElement.classList.toggle(
                "--sgd-sagodent-menu-open",
                menuOpen,
            );

            button.setAttribute("aria-expanded", String(menuOpen));
            panel.setAttribute("aria-hidden", String(!menuOpen));
            backdrop.setAttribute("aria-hidden", String(!menuOpen));

            if (!menuOpen && wasOpen) {
                unlockMobilePageScroll();
            } else if (menuOpen && !isMobileMenuMode() && window.sagodentLenis) {
                
                if (typeof window.sagodentLenis.resize === "function") {
                    window.sagodentLenis.resize();
                }
                if (typeof window.sagodentLenis.start === "function") {
                    window.sagodentLenis.start();
                }
            }

            
            applyTheme(findZoneUnderHeader() || currentZone);
            requestUpdate();
        }

        button.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            setMenu(!menuOpen);
        });

        backdrop.addEventListener("click", function() {
            setMenu(false);
        });

        function scrollToContent(link) {
            const href = link.getAttribute("href");
            if (!href || href.charAt(0) !== "#") return false;

            const target = document.querySelector(href);
            if (!target) return false;

            const offset = -Math.round(header.getBoundingClientRect().height);
            setMenu(false);

            window.requestAnimationFrame(function() {
                if (
                    window.sagodentLenis &&
                    typeof window.sagodentLenis.scrollTo === "function"
                ) {
                    window.sagodentLenis.scrollTo(target, {
                        offset: offset,
                        duration: 1.05,
                        force: true,
                    });
                } else {
                    const top =
                        target.getBoundingClientRect().top + window.scrollY + offset;
                    window.scrollTo({ top: top, behavior: "smooth" });
                }

                if (
                    window.history &&
                    typeof window.history.replaceState === "function"
                ) {
                    window.history.replaceState(null, "", href);
                }
            });

            return true;
        }

        panel.addEventListener("click", function(event) {
            const link = event.target.closest("a[href^='#']");
            if (!link) return;

            if (scrollToContent(link)) {
                event.preventDefault();
            }
        });

        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape" && menuOpen) setMenu(false);
        });

        function rootVariable(name, fallback) {
            const pageRoot = document.querySelector(".sagodent-page");
            let value = "";

            if (pageRoot) {
                value = getComputedStyle(pageRoot).getPropertyValue(name).trim();
            }

            if (!value) {
                value = getComputedStyle(document.documentElement)
                    .getPropertyValue(name)
                    .trim();
            }

            return value || fallback;
        }

        function isTransparent(color) {
            if (!color) return true;

            const normalized = String(color).replace(/\s+/g, "").toLowerCase();

            return (
                normalized === "transparent" ||
                normalized === "rgba(0,0,0,0)" ||
                normalized.endsWith(",0)")
            );
        }

        function classColor(zone) {
            if (!zone) return null;

            if (zone.matches(".id4,.sagodent-zone-black")) {
                return rootVariable("--near-black", "#050708");
            }

            if (
                zone.matches(
                    ".difference,.difference-head,.difference-row,.contact,blockquote,footer,.sagodent-zone-blue",
                )
            ) {
                return rootVariable("--blue", "#075d98");
            }

            if (zone.matches(".hero,.sagodent-zone-hero,.sagodent-zone-dark")) {
                return rootVariable("--hero", "#021b2c");
            }

            if (
                zone.matches(".intro,.doctor,.courses,.library,.sagodent-zone-light")
            ) {
                return rootVariable("--white", "#ffffff");
            }

            return null;
        }

        function computedBackground(element) {
            if (!element) return null;

            const style = getComputedStyle(element);
            const customColor = style.getPropertyValue("--sagodent-menu-bg").trim();

            if (customColor) return customColor;
            if (!isTransparent(style.backgroundColor)) return style.backgroundColor;

            return null;
        }

        function resolveZoneColor(zone) {
            if (!zone) return rootVariable("--hero", "#021b2c");

            const declared =
                zone.getAttribute("data-menu-bg") ||
                zone.getAttribute("data-sagodent-menu-bg");

            if (declared && declared.trim()) return declared.trim();

            
            const mapped = classColor(zone);
            if (mapped) return mapped;

            const ownColor = computedBackground(zone);
            if (ownColor) return ownColor;

            
            const backgroundLayers = zone.querySelectorAll(
                ":scope > .section-bg, :scope > .bg-fill, :scope > .fill, .section-bg, .bg-fill, .fill",
            );

            for (const layer of backgroundLayers) {
                const layerColor = computedBackground(layer);
                if (layerColor) return layerColor;
            }

            let parent = zone.parentElement;

            while (
                parent &&
                parent !== document.body &&
                parent !== document.documentElement
            ) {
                const parentColor = computedBackground(parent);
                if (parentColor) return parentColor;
                parent = parent.parentElement;
            }

            return rootVariable("--white", "#ffffff");
        }

        function parseRgb(color) {
            const value = String(color || "").trim();

            if (value.startsWith("#")) {
                const source = value.slice(1);
                const hex =
                    source.length === 3 ?
                    source
                    .split("")
                    .map(function(character) {
                        return character + character;
                    })
                    .join("") :
                    source.slice(0, 6);

                if (!/^[0-9a-f]{6}$/i.test(hex)) return null;

                return [
                    parseInt(hex.slice(0, 2), 16),
                    parseInt(hex.slice(2, 4), 16),
                    parseInt(hex.slice(4, 6), 16),
                ];
            }

            const values = value.match(/[\d.]+/g);
            if (!values || values.length < 3) return null;

            return [Number(values[0]), Number(values[1]), Number(values[2])];
        }

        function rgbaFromColor(color, alpha, fallback) {
            const rgb = parseRgb(color);
            if (!rgb) return fallback;

            const safeAlpha = Math.min(1, Math.max(0, Number(alpha)));
            return (
                "rgba(" +
                rgb[0] +
                ", " +
                rgb[1] +
                ", " +
                rgb[2] +
                ", " +
                safeAlpha +
                ")"
            );
        }

        function isDarkColor(color) {
            const rgb = parseRgb(color);
            if (!rgb) return true;

            const luminance =
                (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;

            return luminance < 0.58;
        }

        function resolveZoneTone(zone, color) {
            if (!zone) return "dark";

            const declared =
                zone.getAttribute("data-menu-tone") ||
                zone.getAttribute("data-sagodent-menu-tone");

            if (declared) {
                const tone = declared.toLowerCase().trim();
                if (tone === "dark" || tone === "light") return tone;
            }

            return isDarkColor(color) ? "dark" : "light";
        }

        function probeY() {
            const rect = header.getBoundingClientRect();

            return Math.min(
                Math.max(rect.bottom + 4, 1),
                Math.max(1, window.innerHeight - 1),
            );
        }

        function zoneFromElement(element) {
            if (!element) return null;

            if (
                element === menuRoot ||
                menuRoot.contains(element) ||
                element === header ||
                header.contains(element) ||
                element === panel ||
                panel.contains(element) ||
                element === backdrop ||
                element === progress
            ) {
                return null;
            }

            const explicit = element.closest(explicitZoneSelector);
            if (explicit && explicit !== menuRoot && !explicit.contains(menuRoot)) {
                return explicit;
            }

            const fallback = element.closest(fallbackZoneSelector);
            if (fallback && fallback !== menuRoot && !fallback.contains(menuRoot)) {
                return fallback;
            }

            return null;
        }

        function findZoneUnderHeader() {
            const y = probeY();

            
            if (window.scrollY <= 20) {
                const hero = document.querySelector(".hero,.sagodent-zone-hero");
                if (hero) {
                    const heroRect = hero.getBoundingClientRect();
                    if (heroRect.bottom > y && heroRect.top < window.innerHeight) {
                        return hero;
                    }
                }
            }
            const xRatios = [0.15, 0.5, 0.85];
            const candidates = [];

            xRatios.forEach(function(ratio) {
                const x = Math.min(
                    Math.max(window.innerWidth * ratio, 1),
                    Math.max(1, window.innerWidth - 1),
                );

                document.elementsFromPoint(x, y).forEach(function(element) {
                    const zone = zoneFromElement(element);

                    if (zone && !candidates.includes(zone)) {
                        candidates.push(zone);
                    }
                });
            });

            if (candidates.length) {
                const explicit = candidates.find(function(zone) {
                    return zone.matches(explicitZoneSelector);
                });

                return explicit || candidates[0];
            }

            
            const zones = Array.from(
                document.querySelectorAll(
                    explicitZoneSelector + "," + fallbackZoneSelector,
                ),
            ).filter(function(zone) {
                return (
                    zone !== menuRoot &&
                    !zone.contains(menuRoot) &&
                    zone !== header &&
                    !header.contains(zone) &&
                    zone !== panel &&
                    !panel.contains(zone)
                );
            });

            return (
                zones.find(function(zone) {
                    const rect = zone.getBoundingClientRect();
                    return rect.top <= y && rect.bottom > y;
                }) ||
                currentZone ||
                document.querySelector(".hero,.section,section")
            );
        }

        function setThemeProperties(element, properties) {
            Object.keys(properties).forEach(function(name) {
                element.style.setProperty(name, properties[name]);
            });
        }

        function applyTheme(zone) {
            if (zone) currentZone = zone;

            const activeZone = currentZone;
            const background = resolveZoneColor(activeZone);
            const tone = resolveZoneTone(activeZone, background);
            const dark = tone === "dark";
            const blue = Boolean(
                activeZone &&
                activeZone.matches(
                    ".difference,.difference-head,.difference-row,.contact,.sagodent-zone-blue",
                ),
            );
            const black = Boolean(
                activeZone && activeZone.matches(".id4,.sagodent-zone-black"),
            );

            let headerGlass = "rgba(3, 31, 49, 0.48)";
            let panelGlass = "rgba(3, 31, 49, 0.62)";

            if (!dark) {
                headerGlass = "rgba(255, 255, 255, 0.78)";
                panelGlass = "rgba(255, 255, 255, 0.76)";
            } else if (blue) {
                headerGlass = "rgba(7, 93, 152, 0.72)";
                panelGlass = "rgba(7, 93, 152, 0.72)";
            } else if (black) {
                headerGlass = "rgba(5, 8, 10, 0.76)";
                panelGlass = "rgba(5, 8, 10, 0.76)";
            }

            const properties = {
                "--menu-section-bg": background,

                
                "--menu-glass-bg": headerGlass,
                "--menu-panel-glass-bg": panelGlass,
                "--menu-glass-highlight": dark ?
                    "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.62)",
                "--menu-foreground": dark ? "#ffffff" : "#075d98",
                "--menu-border": dark ?
                    "rgba(255, 255, 255, 0.18)" : "rgba(7, 93, 152, 0.18)",
                "--menu-hover": dark ?
                    "rgba(255, 255, 255, 0.08)" : "rgba(7, 93, 152, 0.07)",
            };

            setThemeProperties(document.documentElement, properties);
            setThemeProperties(header, properties);
            setThemeProperties(panel, properties);

            [header, panel].forEach(function(element) {
                element.classList.toggle("--sgd-menu-tone-dark", dark);
                element.classList.toggle("--sgd-menu-tone-light", !dark);
                element.classList.toggle(
                    "--sgd-on-blue",
                    Boolean(
                        activeZone &&
                        activeZone.matches(
                            ".difference,.difference-head,.difference-row,.contact,.sagodent-zone-blue",
                        ),
                    ),
                );
                element.classList.toggle(
                    "--sgd-on-black",
                    Boolean(
                        activeZone && activeZone.matches(".id4,.sagodent-zone-black"),
                    ),
                );
            });

            header.classList.toggle("--sgd-scrolled", window.scrollY > 20);
        }

        function updateProgress() {
            const pageHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
            );
            const maxScroll = Math.max(0, pageHeight - window.innerHeight);
            const value =
                maxScroll > 0 ?
                Math.min(1, Math.max(0, window.scrollY / maxScroll)) :
                0;

            document.documentElement.style.setProperty("--scroll", String(value));
        }

        function updateMenu() {
            updateQueued = false;
            syncMenuTopOffset();

            
            const detectedZone = findZoneUnderHeader();
            applyTheme(detectedZone || currentZone);
            updateProgress();
        }

        function requestUpdate() {
            if (updateQueued) return;
            updateQueued = true;
            window.requestAnimationFrame(updateMenu);
        }

        window.addEventListener("scroll", requestUpdate, { passive: true });

        
        window.addEventListener("wheel", requestUpdate, { passive: true });

        if (window.sagodentLenis && typeof window.sagodentLenis.on === "function") {
            try {
                window.sagodentLenis.on("scroll", requestUpdate);
            } catch (error) {
                
            }
        }

        function syncMobileViewportSize() {
            const viewport = window.visualViewport;
            const width = viewport ? viewport.width : window.innerWidth;
            const height = viewport ? viewport.height : window.innerHeight;

            document.documentElement.style.setProperty(
                "--sgd-mobile-viewport-width",
                Math.round(width) + "px",
            );
            document.documentElement.style.setProperty(
                "--sgd-mobile-viewport-height",
                Math.round(height) + "px",
            );
        }

        syncMobileViewportSize();

        if (window.visualViewport) {
            const syncVisualViewport = function() {
                syncMobileViewportSize();
                requestUpdate();
            };

            window.visualViewport.addEventListener("resize", syncVisualViewport, {
                passive: true,
            });

            
            window.visualViewport.addEventListener("scroll", syncVisualViewport, {
                passive: true,
            });
        }

        window.addEventListener(
            "resize",
            function() {
                syncMobileViewportSize();

                
                if (menuOpen) {
                    if (isMobileMenuMode()) {
                        lockMobilePageScroll();
                    } else {
                        unlockMobilePageScroll();
                    }
                }
                requestUpdate();
            }, { passive: true },
        );
        window.addEventListener("orientationchange", requestUpdate, {
            passive: true,
        });
        window.addEventListener("load", requestUpdate, { once: true });

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(requestUpdate);
        }

        if ("ResizeObserver" in window) {
            const resizeObserver = new ResizeObserver(requestUpdate);
            resizeObserver.observe(document.documentElement);
        }

        
        if ("MutationObserver" in window) {
            const mutationObserver = new MutationObserver(requestUpdate);
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }

        setMenu(false);
        updateMenu();

        window.setTimeout(requestUpdate, 120);
        window.setTimeout(requestUpdate, 500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSagodentMenu, {
            once: true,
        });
    } else {
        initSagodentMenu();
    }
})();




(function() {
    const courses = [{
            tab: "VENEER",
            title: "THE VENEER WORKFLOW",
            image: "http://localhost/sagodent/wp-content/uploads/2026/08/veneer-workflow.jpg",
            intro: "Quy trình veneer tinh gọn từ lập kế hoạch, sửa soạn, lấy dấu kỹ thuật số đến gắn hoàn tất — tập trung vào tính tiên lượng và ứng dụng lâm sàng.",
            topics: ["Digital planning", "Mock-up", "Preparation control"],
        },
        {
            tab: "BOPT",
            title: "BOPT MASTERCLASS",
            image: "http://localhost/sagodent/wp-content/uploads/2026/08/veneer-workflow.jpg",
            intro: "Kiểm soát mô mềm và đường hoàn tất theo quy trình thực hành trực quan, có thể áp dụng ngay tại phòng khám.",
            topics: ["Biologically oriented", "Tissue control", "Clinical protocol"],
        },
        {
            tab: "IMPLANT CĂN BẢN",
            title: "IMPLANT FOUNDATION",
            image: "http://localhost/sagodent/wp-content/uploads/2026/08/implant-foundation.jpg",
            intro: "Xây dựng nền tảng cấy ghép vững chắc, từ đọc dữ liệu CBCT đến lập kế hoạch và thao tác trên mô hình chuyên biệt.",
            topics: ["CBCT planning", "Surgical protocol", "Hands-on model"],
        },
        {
            tab: "ALL ON 4",
            title: "FULL-ARCH ALL-ON-4",
            image: "http://localhost/sagodent/wp-content/uploads/2026/08/sagodent-training-lab.jpg",
            intro: "Tiếp cận toàn bộ dòng chảy điều trị phục hình toàn hàm với tư duy số hóa, tối giản và tiên lượng.",
            topics: ["Full-arch planning", "Guided surgery", "Provisional workflow"],
        },
    ];
    const page = document.querySelector(".sagodent-page");
    if (!page) return;

    const coursesSection = page.querySelector(".courses");
    let activeCourse = 0;
    let courseRenderRequest = 0;

    function courseCardMarkup(course) {
        return (
            '<div class="course-card">' +
            '<div class="course-visual"><img src="' +
            course.image +
            '" alt="' +
            escapeHtml(course.title) +
            '"><div>' +
            "<small>KHÓA HỌC NỔI BẬT · 2026</small><h3>" +
            escapeHtml(course.title) +
            "</h3><em>From knowledge to practice.</em>" +
            "</div></div>" +
            '<div class="course-info"><h3>' +
            escapeHtml(course.title) +
            "</h3><p>" +
            escapeHtml(course.intro) +
            "</p><ol>" +
            course.topics
            .map(function(topic, index) {
                return (
                    "<li><span>0" +
                    (index + 1) +
                    "</span>" +
                    escapeHtml(topic) +
                    "</li>"
                );
            })
            .join("") +
            '</ol><div class="course-bottom"><a class="pill blue" href="#contact">Xem chi tiết <b>↗</b></a><div>' +
            '<button data-course-prev aria-label="Khóa trước">‹</button><button data-course-next aria-label="Khóa sau">›</button>' +
            "</div></div></div></div>"
        );
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, """);
    }

    function preloadCourseImage(src) {
        return new Promise(function(resolve) {
            const image = new Image();
            let completed = false;

            function finish() {
                if (completed) return;
                completed = true;
                resolve();
            }
            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", finish, { once: true });
            image.src = src;
            if (image.complete) finish();
        });
    }

    function renderCourse(index) {
        activeCourse = (index + courses.length) % courses.length;
        if (!coursesSection) return;
        const requestedCourse = activeCourse;
        const requestId = ++courseRenderRequest;
        coursesSection
            .querySelectorAll(".course-tabs button")
            .forEach(function(button, buttonIndex) {
                button.classList.toggle("active", buttonIndex === activeCourse);
            });
        coursesSection.classList.add("course-is-loading");
        preloadCourseImage(courses[requestedCourse].image).then(function() {
            if (requestId !== courseRenderRequest) return;
            const currentCard = coursesSection.querySelector(".course-card");
            if (currentCard)
                currentCard.outerHTML = courseCardMarkup(courses[requestedCourse]);
            requestAnimationFrame(function() {
                if (requestId === courseRenderRequest)
                    coursesSection.classList.remove("course-is-loading");
            });
        });
    }
    if (coursesSection)
        coursesSection.addEventListener("click", function(event) {
            const tab = event.target.closest(".course-tabs button");
            if (tab) {
                const tabs = Array.from(
                    coursesSection.querySelectorAll(".course-tabs button"),
                );
                renderCourse(tabs.indexOf(tab));
                return;
            }
            if (event.target.closest("[data-course-prev]"))
                renderCourse(activeCourse - 1);
            if (event.target.closest("[data-course-next]"))
                renderCourse(activeCourse + 1);
        });

    if (coursesSection) renderCourse(0);

    const revealElements = page.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) entry.target.classList.add("revealed");
                });
            }, { threshold: 0.12 },
        );
        revealElements.forEach(function(element) {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(function(element) {
            element.classList.add("revealed");
        });
    }
})();

// vẫn sử dụng được mà khóa lại

//     (function buildContactGrid() {
//     const page = document.querySelector(".sagodent-page");
//     if (!page) return;
//     const socials = page.querySelector(".contact .socials");
//     if (!socials) return;
//     const items = [{
//             label: "WhatsApp",
//             icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4.1A8 8 0 1 1 20 11.7Z"/><path d="M8.4 7.6c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.7.8c-.2.2-.1.4 0 .6.7 1.3 1.7 2.2 3 2.8.3.1.5.1.7-.1l.9-1.1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.4.4.6-.1.8-.5 1.6-1.2 2-.6.4-1.5.6-2.4.3-1.2-.3-2.7-1-4.2-2.4-1.3-1.2-2.2-2.6-2.6-3.8-.3-.9-.2-1.9.2-2.9Z"/></svg>`,
//             href: "https://wa.me/84909245886",
//         },
//         {
//             label: "Zalo",
//             icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-4.5 3v-3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M7 8h5l-5 7h5M14 10v5M14 10h2.5a2 2 0 0 1 0 4H14M20 10v5"/></svg>`,
//             href: "https://zalo.me/0909245886",
//         },
//         {
//             label: "Facebook",
//             icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-3H14V8.5c0-1 .4-1.5 1.7-1.5H18V4.2c-.7-.1-1.7-.2-2.8-.2C12.4 4 11 5.7 11 8.3V10H8v3h3v8h3Z"/></svg>`,
//             href: "https://www.facebook.com/",
//         },
//         {
//             label: "Instagram",
//             icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
//             href: "https://www.instagram.com/",
//         },
//         {
//             label: "Google Maps",
//             icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
//             href: "https://www.google.com/maps/search/?api=1&query=305+Hùng+Vương,+An+Đông,+Hồ+Chí+Minh",
//         },
//     ];
//     const grid = document.createElement("div");
//     grid.className = "contact-grid";
//     items.forEach((item) => {
//         const card = document.createElement("a");
//         card.className = "contact-card";
//         card.href = item.href;
//         card.target = "_blank";
//         card.rel = "noreferrer";
//         card.setAttribute("aria-label", item.label);
//         card.title = item.label;
//         card.innerHTML = `
//       <span class="contact-card-icon">${item.icon}</span>
//     `;
//         grid.appendChild(card);
//     });
//     socials.replaceWith(grid);
// })();



(function connectQuoteReveal() {
    const page = document.querySelector(".sagodent-page");
    if (!page) return;
    const quote = page.querySelector("blockquote");
    let title = null;
    if (quote) {
        title = quote.querySelector(".quote-title");
    }
    if (!quote || !title) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        quote.classList.add("quote-animate-in");
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                quote.classList.add("quote-animate-in");
                observer.disconnect();
            }
        }, { threshold: 0.32 },
    );
    observer.observe(quote);
})();


(function alignDifferenceTimelineDots() {
    "use strict";

    const page = document.querySelector(".sagodent-page");
    if (!page) return;
    const rows = Array.from(page.querySelectorAll(".difference-row"));
    if (!rows.length) return;

    let queued = false;

    function updateDots() {
        queued = false;

        rows.forEach(function(row) {
            const title = row.querySelector(".difference-text h3");
            if (!title) return;

            const rowRect = row.getBoundingClientRect();
            const titleRect = title.getBoundingClientRect();
            const titleCenter = titleRect.top - rowRect.top + titleRect.height / 2;

            row.style.setProperty(
                "--difference-dot-y",
                titleCenter.toFixed(2) + "px",
            );
        });
    }

    function requestUpdate() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(updateDots);
    }

    addEventListener("resize", requestUpdate, { passive: true });
    addEventListener("load", requestUpdate, { once: true, passive: true });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(requestUpdate);
    }

    if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(requestUpdate);
        rows.forEach(function(row) {
            const text = row.querySelector(".difference-text");
            if (text) resizeObserver.observe(text);
        });
    }

    updateDots();
})();</script>
<!-- end Simple Custom CSS and JS -->
