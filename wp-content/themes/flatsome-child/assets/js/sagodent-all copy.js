/* ============================================================
   PHẦN 1 — MENU SAGODENT
   ============================================================ */
/* ============================================================
   SAGODENT MENU — MOBILE FIX + LIQUID GLASS
   - Desktop > 900px: menu hiển thị ngang trực tiếp trên header.
   - Mobile/Tablet <= 900px: drawer vẫn mở từ bên phải như bản gốc.
   - Header và menu nhận cùng màu/tone.
   - Chữ, link, mũi tên trong drawer đổi theo tone.
   - VN/ENG được giữ bởi CSS ở mọi breakpoint.
   - Nhận diện được Section của Flatsome trên desktop/mobile/tablet.
   - Giữ thanh tiến trình cuộn.
   ============================================================ */
(function() {
    "use strict";

    /* ============================================================
       LANGUAGE QUICK CONFIG
       - Mặc định link ENG để trống. Khi cần đổi trang, dán link vào href trong HTML hoặc SAGODENT_LANGUAGE_URL.
       - Nếu muốn dùng ảnh lá cờ từ Media Library, dán URL ảnh vào SAGODENT_FLAG_IMAGE_URL.
       - Để SAGODENT_FLAG_IMAGE_URL = "" thì giữ nguyên SVG lá cờ hiện tại.
       - Nếu HTML đã có href/src riêng, JS ưu tiên giữ giá trị trong HTML.
       ============================================================ */
    const SAGODENT_LANGUAGE_URL = "";
    const SAGODENT_FLAG_IMAGE_URL = "https://sagodent.com/wp-content/uploads/2026/09/1788493537780_1387843300402958155_1387843300402958155_6813b47d7cb216dce427a6d065133787.jpg";

    /* MOBILE ONLY <= 600px: dropdown ngôn ngữ.
       Desktop / tablet không dùng các biến này nên giao diện cũ được giữ nguyên. */
    const SAGODENT_PHONE_MAX_WIDTH = 600;
    const SAGODENT_VIETNAMESE_URL = "#";
    const SAGODENT_VIETNAMESE_FLAG_IMAGE_URL = "https://sagodent.com/wp-content/uploads/2026/09/1788493543944_1387843300402958155_1387843300402958155_af10ec38ece6559846e52ee055d77457.jpg";

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

        /*
         * sagodent.js gốc đã từng gắn listener lên .--sgd-menu-button/.--sgd-menu-panel.
         * Clone cả header và panel để loại bỏ listener cũ, tránh xung đột.
         */
        const header = sourceHeader.cloneNode(true);
        const panel = sourcePanel.cloneNode(true);

        sourceHeader.replaceWith(header);
        sourcePanel.replaceWith(panel);

        const button = header.querySelector(".--sgd-menu-button");
        if (!button) return;

        /*
         * ENG CLICKABLE LINK + OPTIONAL FLAG IMAGE URL
         * - Không thay đổi bố cục/tone/blur/menu logic.
         * - HTML cũ dùng <span class="--sgd-language"> vẫn chạy: JS tự đổi thành <a>.
         * - Nếu sau này bạn tự đổi HTML thành <a href="..."> thì href đó được giữ nguyên.
         * - Nếu đặt data-flag-src hoặc SAGODENT_FLAG_IMAGE_URL, SVG cờ hiện tại sẽ được
         *   thay bằng <img> cùng class nên giao diện không đổi.
         */
        function prepareLanguageControl() {
            const originalLanguage = header.querySelector(".--sgd-language");
            if (!originalLanguage) return;

            let languageLink = originalLanguage;

            if (originalLanguage.tagName.toLowerCase() !== "a") {
                languageLink = document.createElement("a");

                Array.from(originalLanguage.attributes).forEach(function(attribute) {
                    languageLink.setAttribute(attribute.name, attribute.value);
                });

                languageLink.classList.add("--sgd-language-link");

                while (originalLanguage.firstChild) {
                    languageLink.appendChild(originalLanguage.firstChild);
                }

                originalLanguage.replaceWith(languageLink);
            } else {
                languageLink.classList.add("--sgd-language-link");
            }

            const htmlLanguageUrl = (languageLink.getAttribute("href") || "").trim();
            const dataLanguageUrl = (languageLink.getAttribute("data-language-url") || "").trim();
            const finalLanguageUrl = htmlLanguageUrl || dataLanguageUrl || SAGODENT_LANGUAGE_URL;

            if (finalLanguageUrl) {
                languageLink.setAttribute("href", finalLanguageUrl);
            }

            languageLink.setAttribute("aria-label", languageLink.getAttribute("aria-label") || "English");

            const currentFlag = languageLink.querySelector(".--sgd-flag-us");
            const currentFlagSrc =
                currentFlag && currentFlag.tagName.toLowerCase() === "img" ?
                (currentFlag.getAttribute("src") || "").trim() :
                "";
            const dataFlagSrc = (languageLink.getAttribute("data-flag-src") || "").trim();
            const finalFlagSrc = currentFlagSrc || dataFlagSrc || SAGODENT_FLAG_IMAGE_URL;

            if (finalFlagSrc && (!currentFlag || currentFlag.tagName.toLowerCase() !== "img")) {
                const flagImage = document.createElement("img");
                flagImage.className = "--sgd-flag-us";
                flagImage.src = finalFlagSrc;
                flagImage.alt = "";
                flagImage.setAttribute("aria-hidden", "true");
                flagImage.decoding = "async";

                if (currentFlag) {
                    currentFlag.replaceWith(flagImage);
                } else {
                    languageLink.insertBefore(flagImage, languageLink.firstChild);
                }
            }
        }

        prepareLanguageControl();

        /* ============================================================
           MOBILE PHONE ONLY — LANGUAGE DROPDOWN
           - <= 600px: chỉ hiện cờ ENG + mũi tên xổ xuống.
           - Dropdown chứa cờ Việt Nam là thẻ <a> thật.
           - > 600px: toggle/dropdown bị CSS ẩn hoàn toàn, không đổi desktop/tablet.
           - JS tự tạo phần tử nếu HTML cũ chưa có, vì vậy có thể dùng cả HTML cũ hoặc HTML mới.
           ============================================================ */
        function prepareMobileLanguageDropdown() {
            const actions = header.querySelector(".--sgd-header-actions");
            if (!actions) return { toggle: null, dropdown: null };

            let toggle = actions.querySelector(".--sgd-language-toggle");
            let dropdown = actions.querySelector(".--sgd-language-dropdown");

            if (!toggle) {
                toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "--sgd-language-toggle";
                toggle.setAttribute("aria-label", "Chọn ngôn ngữ");
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-controls", "--sgd-language-dropdown");

                const arrow = document.createElement("span");
                arrow.setAttribute("aria-hidden", "true");
                toggle.appendChild(arrow);

                actions.insertBefore(toggle, button);
            }

            if (!dropdown) {
                dropdown = document.createElement("div");
                dropdown.className = "--sgd-language-dropdown";
                dropdown.id = "--sgd-language-dropdown";
                dropdown.setAttribute("aria-hidden", "true");

                const vietnameseLink = document.createElement("a");
                vietnameseLink.className = "--sgd-language-option --sgd-language-option-vn";
                vietnameseLink.href = SAGODENT_VIETNAMESE_URL;
                vietnameseLink.setAttribute("aria-label", "Tiếng Việt");

                const vietnameseFlag = document.createElement("img");
                vietnameseFlag.className = "--sgd-flag-vn";
                vietnameseFlag.src = SAGODENT_VIETNAMESE_FLAG_IMAGE_URL;
                vietnameseFlag.alt = "Tiếng Việt";
                vietnameseFlag.decoding = "async";

                vietnameseLink.appendChild(vietnameseFlag);
                dropdown.appendChild(vietnameseLink);
                actions.insertBefore(dropdown, button);
            } else {
                dropdown.id = dropdown.id || "--sgd-language-dropdown";
                dropdown.setAttribute("aria-hidden", "true");

                const vietnameseLink = dropdown.querySelector("a.--sgd-language-option-vn");
                if (vietnameseLink && !(vietnameseLink.getAttribute("href") || "").trim()) {
                    vietnameseLink.setAttribute("href", SAGODENT_VIETNAMESE_URL);
                }
            }

            toggle.setAttribute("aria-controls", dropdown.id);
            toggle.setAttribute("aria-expanded", "false");

            return { toggle: toggle, dropdown: dropdown };
        }

        const mobileLanguage = prepareMobileLanguageDropdown();
        const languageToggle = mobileLanguage.toggle;
        const languageDropdown = mobileLanguage.dropdown;
        let languageMenuOpen = false;

        function isPhoneLanguageMode() {
            return window.matchMedia("(max-width: " + SAGODENT_PHONE_MAX_WIDTH + "px)").matches;
        }

        function setLanguageMenu(open) {
            const nextOpen = Boolean(open) && isPhoneLanguageMode();
            languageMenuOpen = nextOpen;

            if (languageToggle) {
                languageToggle.classList.toggle("--sgd-open", nextOpen);
                languageToggle.setAttribute("aria-expanded", String(nextOpen));
            }

            if (languageDropdown) {
                languageDropdown.classList.toggle("--sgd-open", nextOpen);
                languageDropdown.setAttribute("aria-hidden", String(!nextOpen));
            }
        }

        if (languageToggle && languageDropdown) {
            languageToggle.addEventListener("click", function(event) {
                if (!isPhoneLanguageMode()) return;
                event.preventDefault();
                event.stopPropagation();
                setLanguageMenu(!languageMenuOpen);
            });

            languageDropdown.addEventListener("click", function(event) {
                event.stopPropagation();
            });

            document.addEventListener("click", function(event) {
                if (!languageMenuOpen) return;
                if (languageToggle.contains(event.target)) return;
                if (languageDropdown.contains(event.target)) return;
                setLanguageMenu(false);
            });
        }

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

        /*
         * Tách phần fixed khỏi .section/.row/.col-inner của UX Block.
         * Tránh transform/overflow của Flatsome làm sai vị trí trên mobile.
         */
        if (progress) {
            progress.classList.add("--sgd-sagodent-menu-mounted");
            document.body.appendChild(progress);
        }

        header.classList.add("--sgd-sagodent-menu-mounted");
        panel.classList.add("--sgd-sagodent-menu-mounted");

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
        document.body.appendChild(header);

        /* Xóa bản menu trùng nếu UX Block bị render hai lần. */
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

        /*
         * Đồng bộ vị trí menu với mép trên viewport.
         * WordPress có thể giữ class admin-bar hoặc wrapper có offset dù thanh admin đã ẩn.
         * Chỉ bù đúng phần lệch thực tế; không thay đổi cấu trúc menu hay nội dung trang.
         */
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

                /*
                 * Ví dụ wrapper/viewport làm menu lệch xuống 8px:
                 * ghi nhớ phần bù -8px để các lần scroll sau không bị nhảy lại.
                 */
                if (Math.abs(difference) > 0.5) {
                    setMenuAdminOffset(expectedTop);
                }
            });
        }

        function isMobileMenuMode() {
            return window.matchMedia("(max-width: 900px)").matches;
        }

        /*
         * DESKTOP INLINE NAV / MOBILE DRAWER
         * - Desktop > 900px: gom 5 tab + ENG vào một cụm duy nhất rồi căn giữa theo viewport.
         * - Logo KHÔNG bị di chuyển: vẫn là phần tử con độc lập của header ở vị trí gốc.
         * - Mobile/Tablet <= 900px: tháo cụm giữa, trả panel về body để giữ nguyên drawer cũ.
         * - Không clone thêm menu, vì vậy tone, blur, smooth-scroll và progress vẫn dùng logic gốc.
         */
        const headerActions = header.querySelector(".--sgd-header-actions");
        let desktopCenterGroup = null;

        function ensureDesktopCenterGroup() {
            if (
                desktopCenterGroup &&
                desktopCenterGroup.isConnected &&
                desktopCenterGroup.parentElement === header
            ) {
                return desktopCenterGroup;
            }

            desktopCenterGroup = header.querySelector(
                ":scope > .--sgd-desktop-center-group",
            );

            if (!desktopCenterGroup) {
                desktopCenterGroup = document.createElement("div");
                desktopCenterGroup.className = "--sgd-desktop-center-group";
                desktopCenterGroup.setAttribute("aria-label", "Điều hướng chính và ngôn ngữ");
                header.appendChild(desktopCenterGroup);
            }

            return desktopCenterGroup;
        }

        function releaseDesktopCenterGroup() {
            const group =
                desktopCenterGroup ||
                header.querySelector(":scope > .--sgd-desktop-center-group");

            if (!group) return;

            /* Trả ENG về header trước khi xóa wrapper. Logo hoàn toàn không bị đụng tới. */
            if (headerActions && headerActions.parentElement === group) {
                header.appendChild(headerActions);
            }

            if (panel.parentElement === group) {
                document.body.insertBefore(panel, header);
            }

            group.remove();
            desktopCenterGroup = null;
        }

        function syncMenuLayout() {
            const mobile = isMobileMenuMode();

            if (mobile) {
                header.classList.remove("--sgd-desktop-nav");
                panel.classList.remove("--sgd-desktop-inline");

                releaseDesktopCenterGroup();

                if (panel.parentElement !== document.body) {
                    document.body.insertBefore(panel, header);
                }

                button.removeAttribute("aria-hidden");
                button.removeAttribute("tabindex");
                panel.setAttribute("aria-hidden", String(!menuOpen));
                return;
            }

            /* Nếu vừa resize từ mobile đang mở drawer sang desktop, đóng sạch trạng thái drawer. */
            if (mobileScrollLocked) unlockMobilePageScroll();

            menuOpen = false;
            header.classList.remove("--sgd-menu-open");
            panel.classList.remove("--sgd-open");
            backdrop.classList.remove("--sgd-open");
            document.documentElement.classList.remove("--sgd-sagodent-menu-open");

            const group = ensureDesktopCenterGroup();

            /* Cụm giữa = panel menu + ENG. Logo vẫn đứng riêng ở đầu header. */
            if (panel.parentElement !== group) {
                group.appendChild(panel);
            }

            if (headerActions && headerActions.parentElement !== group) {
                group.appendChild(headerActions);
            }

            header.classList.add("--sgd-desktop-nav");
            panel.classList.add("--sgd-desktop-inline");

            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-hidden", "true");
            button.setAttribute("tabindex", "-1");
            panel.setAttribute("aria-hidden", "false");
            backdrop.setAttribute("aria-hidden", "true");
        }

        function lockMobilePageScroll() {
            if (!isMobileMenuMode() || mobileScrollLocked) return;

            lockedScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
            mobileScrollLocked = true;

            /*
             * Chỉ khóa #wrapper bằng CSS, KHÔNG position:fixed body.
             * Header/panel đã được mount trực tiếp dưới body nên luôn bám viewport.
             */
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

            /* Khôi phục đúng vị trí trước khi mở menu, tránh trang bị nhảy về đầu. */
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

        /*
         * Mobile/iOS/Chrome touch emulation:
         * - Vuốt ngoài drawer: không cho trang nền nhận gesture.
         * - Vuốt drawer tới mép trên/dưới: chặn overscroll truyền ra viewport.
         * Nhờ vậy header fixed không còn bị kéo/trôi khỏi mép trên.
         */
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
            /*
             * Desktop dùng menu ngang luôn hiển thị, nên setMenu chỉ có nhiệm vụ
             * bảo đảm drawer/backdrop luôn đóng và không ẩn panel khỏi accessibility tree.
             */
            if (!isMobileMenuMode()) {
                if (mobileScrollLocked) unlockMobilePageScroll();

                menuOpen = false;
                header.classList.remove("--sgd-menu-open");
                panel.classList.remove("--sgd-open");
                backdrop.classList.remove("--sgd-open");
                document.documentElement.classList.remove("--sgd-sagodent-menu-open");

                button.setAttribute("aria-expanded", "false");
                panel.setAttribute("aria-hidden", "false");
                backdrop.setAttribute("aria-hidden", "true");

                applyTheme(findZoneUnderHeader() || currentZone);
                requestUpdate();
                return;
            }

            const nextOpen = Boolean(open);
            const wasOpen = menuOpen;

            /* Mobile/tablet: giữ nguyên cơ chế khóa scroll cũ. */
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
            }

            applyTheme(findZoneUnderHeader() || currentZone);
            requestUpdate();
        }

        button.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            setLanguageMenu(false);
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

            /* Set offset bằng 0 để section cuộn kịch trần (chui xuống dưới kính mờ) */
            const offset = 0;
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
            if (event.key !== "Escape") return;
            if (languageMenuOpen) setLanguageMenu(false);
            if (menuOpen) setMenu(false);
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

            /* Ưu tiên mapping Sagodent; không để nền trắng của wrapper Flatsome ghi đè. */
            const mapped = classColor(zone);
            if (mapped) return mapped;

            const ownColor = computedBackground(zone);
            if (ownColor) return ownColor;

            /* Flatsome thường đặt màu nền thật trong lớp con này. */
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
            } catch (error) {}
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
                syncMenuLayout();
                setLanguageMenu(false);

                if (menuOpen && isMobileMenuMode()) {
                    lockMobilePageScroll();
                }

                requestUpdate();
            }, { passive: true },
        );
        window.addEventListener("orientationchange", function() {
            setLanguageMenu(false);
            requestUpdate();
        }, {
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
        syncMenuLayout();
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

/* ============================================================
   PHẦN 2 — SAGODENT (NỘI DUNG TRANG)
   ============================================================ */
/* ===== Sagodent interactions: independent sections for Flatsome ===== */

(function() {
    if (!document.getElementById('sagodent-course-visual-override')) {
        const style = document.createElement('style');
        style.id = 'sagodent-course-visual-override';
        style.innerHTML = '.sagodent-page .course-visual::after { display: none !important; } .sagodent-page .course-visual img { opacity: 1 !important; }';
        document.head.appendChild(style);
    }

    // Đã thêm 2 thuộc tính mới: buttonText (Chữ trên nút) và buttonLink (Đường link trỏ tới)
    const courses = [{
            tab: "VENEER",
            title: "THE VENEER WORKFLOW",
            imageDesktop: "https://sagodent.com/wp-content/uploads/2026/08/1.png",
            imageMobile: "https://sagodent.com/wp-content/uploads/2026/08/1.1.png",
            intro: "Quy trình veneer tinh gọn từ lập kế hoạch, sửa soạn, lấy dấu kỹ thuật số đến gắn hoàn tất — tập trung vào tính tiên lượng và ứng dụng lâm sàng.",
            topics: ["Digital planning", "Mock-up", "Preparation control"],
            buttonText: "Xem chi tiết",
            buttonLink: "https://sagodent.com/veneer/"
        },
        {
            tab: "BOPT",
            title: "BOPT MASTERCLASS",
            imageDesktop: "https://sagodent.com/wp-content/uploads/2026/08/3.png",
            imageMobile: "https://sagodent.com/wp-content/uploads/2026/08/3.1.png",
            intro: "Kiểm soát mô mềm và đường hoàn tất theo quy trình thực hành trực quan, có thể áp dụng ngay tại phòng khám.",
            topics: ["Biologically oriented", "Tissue control", "Clinical protocol"],
            buttonText: "Coming soon",
            buttonLink: "#contact"
        },
        {
            tab: "IMPLANT BASIC",
            title: "IMPLANT FOUNDATION",
            imageDesktop: "https://sagodent.com/wp-content/uploads/2026/08/implant-basic-destop.png",
            imageMobile: "https://sagodent.com/wp-content/uploads/2026/08/implant-basic-mobile-1.png",
            intro: "Xây dựng nền tảng cấy ghép vững chắc, từ đọc dữ liệu CBCT đến lập kế hoạch và thao tác trên mô hình chuyên biệt.",
            topics: ["CBCT planning", "Surgical protocol", "Hands-on model"],
            buttonText: "Coming soon",
            buttonLink: "#contact"
        },
        {
            tab: "All ON 4",
            title: "FULL-ARCH PHỤC HÌNH TOÀN HÀM",
            imageDesktop: "https://sagodent.com/wp-content/uploads/2026/08/toan-ham-1.png",
            imageMobile: "https://sagodent.com/wp-content/uploads/2026/08/toan-ham-01.png",
            intro: "Tiếp cận toàn bộ dòng chảy điều trị phục hình toàn hàm với tư duy số hóa, tối giản và tiên lượng.",
            topics: ["Full-arch planning", "Guided surgery", "Provisional workflow"],
            buttonText: "Coming soon",
            buttonLink: "#contact"
        },
    ];

    const page = document.querySelector(".sagodent-page");
    if (!page) return;

    const coursesSection = page.querySelector(".courses");
    let activeCourse = 0;
    let courseRenderRequest = 0;

    /* ============================================================
       COURSE AUTOPLAY
       - Bắt đầu ở VENEER.
       - Sau mỗi 3 giây tự chuyển sang khóa kế tiếp.
       - Khi người dùng bấm tab / Prev / Next, timer được tính lại từ đầu.
       ============================================================ */
    const COURSE_AUTOPLAY_DELAY = 5000;
    let courseAutoTimer = null;

    function clearCourseAutoplay() {
        if (courseAutoTimer !== null) {
            window.clearTimeout(courseAutoTimer);
            courseAutoTimer = null;
        }
    }

    function scheduleCourseAutoplay() {
        if (!coursesSection) return;

        clearCourseAutoplay();

        courseAutoTimer = window.setTimeout(function() {
            renderCourse(activeCourse + 1);
            scheduleCourseAutoplay();
        }, COURSE_AUTOPLAY_DELAY);
    }

    function escapeHtml(value) {
        if (!value) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Đã thay thế chuỗi "coming soon" cứng thành giá trị lấy từ mảng dữ liệu (course.buttonText)
    function courseCardMarkup(course) {
        const titleHtml = course.title ? '<h3>' + escapeHtml(course.title) + '</h3>' : '';
        const btnText = escapeHtml(course.buttonText || "Xem chi tiết");
        const btnLink = escapeHtml(course.buttonLink || "#contact");

        return (
            '<div class="course-card">' +
            '<div class="course-visual">' +
            '<picture style="display: block; width: 100%; height: 100%;">' +
            '<source media="(max-width: 600px)" srcset="' + course.imageMobile + '">' +
            '<img src="' + course.imageDesktop + '" alt="' + escapeHtml(course.title || course.tab) + '" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1;">' +
            '</picture>' +
            '</div>' +
            '<div class="course-info">' + titleHtml + '<p>' +
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
            '</ol><div class="course-bottom"><a class="pill blue" href="' + btnLink + '">' + btnText + '<b>↗</b></a><div>' +
            '<button data-course-prev aria-label="Khóa trước">‹</button><button data-course-next aria-label="Khóa sau">›</button>' +
            "</div></div></div></div>"
        );
    }

    function preloadCourseImage(course) {
        return Promise.all([
            new Promise(function(resolve) {
                const imgDesktop = new Image();
                imgDesktop.onload = imgDesktop.onerror = resolve;
                imgDesktop.src = course.imageDesktop;
            }),
            new Promise(function(resolve) {
                const imgMobile = new Image();
                imgMobile.onload = imgMobile.onerror = resolve;
                imgMobile.src = course.imageMobile;
            })
        ]);
    }

    function renderCourse(index) {
        activeCourse = (index + courses.length) % courses.length;
        if (!coursesSection) return;
        const requestedCourse = activeCourse;
        const requestId = ++courseRenderRequest;

        coursesSection
            .querySelectorAll(".course-tabs button")
            .forEach(function(button, buttonIndex) {
                const isActive = buttonIndex === activeCourse;

                button.classList.toggle("active", isActive);
                button.setAttribute("aria-selected", String(isActive));
                button.setAttribute("tabindex", isActive ? "0" : "-1");
            });

        coursesSection.classList.add("course-is-loading");

        preloadCourseImage(courses[requestedCourse]).then(function() {
            if (requestId !== courseRenderRequest) return;
            const currentCard = coursesSection.querySelector(".course-card");
            if (currentCard) {
                currentCard.outerHTML = courseCardMarkup(courses[requestedCourse]);
            }
            requestAnimationFrame(function() {
                if (requestId === courseRenderRequest) {
                    coursesSection.classList.remove("course-is-loading");
                }
            });
        });
    }

    if (coursesSection) {
        coursesSection.addEventListener("click", function(event) {
            const tab = event.target.closest(".course-tabs button");

            if (tab) {
                const tabs = Array.from(
                    coursesSection.querySelectorAll(".course-tabs button"),
                );

                renderCourse(tabs.indexOf(tab));
                scheduleCourseAutoplay();
                return;
            }

            if (event.target.closest("[data-course-prev]")) {
                renderCourse(activeCourse - 1);
                scheduleCourseAutoplay();
                return;
            }

            if (event.target.closest("[data-course-next]")) {
                renderCourse(activeCourse + 1);
                scheduleCourseAutoplay();
            }
        });

        /* Ban đầu luôn hiển thị VENEER. */
        renderCourse(0);

        /* Sau 3 giây: VENEER -> BOPT -> IMPLANT BASIC -> ALL ON 4 -> VENEER... */
        scheduleCourseAutoplay();

        /* Không để timer chạy ngầm khi tab trình duyệt bị ẩn. */
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                clearCourseAutoplay();
            } else {
                scheduleCourseAutoplay();
            }
        });
    }

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
})();