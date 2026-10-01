/* ============================================================

   SAGODENT IMPLANT BASIC — DÙNG MENU SAGODENT HIỆN TẠI

   ============================================================


   ============================================================ */



(function() {

    "use strict";



    const PAGE_SELECTOR = ".--implant-basic-page";



    const SECTION_SELECTOR =

        PAGE_SELECTOR + " [data-menu-bg][data-menu-tone]";



    const BRAND = "#062d48";

    const ACCENT = "#6ebce5";



    /*

     * MENU CỦA PAGE VENEER

     * ----------------------------------------------------------

     * 01 TRANG CHỦ:

     *    href ngoài Page Veneer nên JS menu gốc sẽ không chặn.

     *

     * 02-05:

     *    dùng đúng ID các khối đang có trong HTML Veneer.

     */

    const VENEER_MENU = [{

            number: "01",

            title: "TRANG CHỦ",

            href: "https://sagodent.com/"

        },

        {

            number: "02",

            title: "GIỚI THIỆU KHÓA HỌC",

            href: "#--implant-basic-overview"

        },

        {

            number: "03",

            title: "CHƯƠNG TRÌNH",

            href: "#--implant-basic-program"

        },

        {

            number: "04",

            title: "GIẢNG VIÊN",

            href: "#--implant-basic-doctor"

        },

        {

            number: "05",

            title: "CHỨNG NHẬN",

            href: "#--implant-basic-certificate"

        },

        {

            number: "06",

            title: "ĐĂNG KÝ",

            href: "#--implant-basic-register"

        }

    ];



    let page = null;

    let queued = false;



    /*

     * Lưu panel đã được sửa.

     * Nếu JS menu gốc remount/clone panel mới thì tự sửa lại panel mới.

     */

    let customizedPanel = null;



    /*

     * WordPress/UX Builder có thể đóng thẻ <main> ngay sau khi mở khi nội

     * dung được dán vào editor. Khi đó 6 section Veneer trở thành anh em

     * của .--implant-basic-page và toàn bộ selector CSS có phạm vi theo page

     * không còn khớp. Đưa đúng các khối đã biết trở lại page, giữ nguyên

     * element, id, class và mọi event listener đang có.

     */

    function normalizeVeneerMarkup() {

        if (!page) return;



        const sectionIds = [

            "--implant-basic-top",

            "--implant-basic-overview",

            "--implant-basic-program",

            "--implant-basic-doctor",

            "--implant-basic-certificate",

            "--implant-basic-register"

        ];



        sectionIds.forEach(function(id) {

            const section = document.getElementById(id);



            if (

                section &&

                !page.contains(section)

            ) {

                page.appendChild(section);

            }

        });

    }



    /*

     * WordPress cÃ³ thá»ƒ chuyá»ƒn cÃ¡c tháº» </p> dÆ° thá»«a trong ná»™i dung editor

     * thÃ nh nhá»¯ng <p> rá»—ng. CÃ¡c block rá»—ng nÃ y náº±m giá»¯a page Veneer vÃ 

     * footer chung nÃªn táº¡o ra má»™t dáº£i tráº¯ng. Chá»‰ xÃ³a block Ä‘á»‹nh dáº¡ng rá»—ng

     * á»Ÿ cÃ¡c wrapper ngoÃ i, khÃ´ng Ä‘á»™ng Ä‘áº¿n ná»™i dung trong cÃ¡c section.

     */

    function removeWordPressFooterGap() {

        if (!page) return;



        const roots = [

            page.parentElement,

            document.getElementById("content"),

            document.querySelector(".entry-content")

        ].filter(function(root, index, items) {

            return root && items.indexOf(root) === index;

        });



        roots.forEach(function(root) {

            Array.from(root.children).forEach(function(child) {

                const tagName = child.tagName.toLowerCase();

                const isEmptyParagraph =

                    tagName === "p" &&

                    !child.textContent.trim() &&

                    !child.querySelector("img, a, button, input, iframe, video, svg");



                if (tagName === "br" || isEmptyParagraph) {

                    child.remove();

                }

            });

        });

    }



    function getMountedMenu() {

        const header = document.querySelector(

            "body > .--sgd-topbar.--sgd-sagodent-menu-mounted"

        );



        const panel =

            document.querySelector(

                "body > .--sgd-menu-panel.--sgd-sagodent-menu-mounted"

            ) ||

            (

                header ?

                header.querySelector(

                    ".--sgd-menu-panel.--sgd-sagodent-menu-mounted"

                ) :

                null

            );



        return {

            header: header,



            panel: panel,



            progress: document.querySelector(

                "body > .--sgd-scroll-progress.--sgd-sagodent-menu-mounted"

            )

        };

    }



    /* ============================================================

       PHẦN 1 — ĐỔI NỘI DUNG MENU TRÊN PAGE VENEER

       ============================================================ */



    function getVeneerMenuLinks(panel) {

        if (!panel) return [];



        const topLevelLinks = [];



        Array.from(panel.children).forEach(function(child) {

            if (!child.tagName) return;



            if (child.tagName.toLowerCase() === "a") {

                topLevelLinks.push(child);

                return;

            }



            if (

                child.classList.contains(

                    "--sgd-menu-item-has-submenu"

                )

            ) {

                const mainLink = child.querySelector(

                    ":scope > .--sgd-menu-item-row > .--sgd-menu-main-link"

                );



                if (mainLink) {

                    topLevelLinks.push(mainLink);

                }

            }

        });



        if (topLevelLinks.length >= VENEER_MENU.length) {

            return topLevelLinks.slice(

                0,

                VENEER_MENU.length

            );

        }



        if (

            topLevelLinks.length ===

            VENEER_MENU.length - 1

        ) {

            const contactLink =

                topLevelLinks[

                    topLevelLinks.length - 1

                ].cloneNode(true);



            panel.appendChild(contactLink);



            topLevelLinks.push(contactLink);



            return topLevelLinks;

        }



        return topLevelLinks;

    }



    function replaceDirectTitleText(link, title) {

        if (!link) return;



        if (

            link.classList.contains(

                "--sgd-menu-main-link"

            )

        ) {

            const titleSpan =

                link.querySelector(

                    ":scope > span"

                );



            if (titleSpan) {

                titleSpan.textContent = title;

                return;

            }

        }



        Array.from(

            link.childNodes

        ).forEach(function(node) {

            if (

                node.nodeType ===

                Node.TEXT_NODE

            ) {

                node.remove();

            }

        });



        const oldWrapper =

            link.querySelector(

                ":scope > .--implant-basic-menu-title"

            );



        if (oldWrapper) {

            oldWrapper.remove();

        }



        const titleWrapper =

            document.createElement("span");



        titleWrapper.className =

            "--implant-basic-menu-title";



        titleWrapper.textContent =

            title;



        link.appendChild(

            titleWrapper

        );

    }



    function customizeVeneerMenu(panel) {

        if (!panel) return;



        /*

         * Panel này đã sửa rồi thì không cần chạy lại ở mỗi scroll.

         */

        if (

            customizedPanel === panel &&

            panel.getAttribute(

                "data-veneer-menu-ready"

            ) === "true"

        ) {

            return;

        }



        const links =

            getVeneerMenuLinks(panel);



        if (links.length < VENEER_MENU.length) return;



        links.forEach(

            function(link, index) {

                const item =

                    VENEER_MENU[index];



                if (!item) return;



                /*

                 * Đổi link.

                 */

                link.setAttribute(

                    "href",

                    item.href

                );



                /*

                 * Đổi số 01-05.

                 */

                const number =

                    link.querySelector(

                        ":scope > small"

                    );



                if (number) {

                    number.textContent =

                        item.number;

                }



                /*

                 * Đổi đúng text menu,

                 * không replace thẻ <a>.

                 */

                replaceDirectTitleText(

                    link,

                    item.title

                );



                link.setAttribute(

                    "data-veneer-menu-item",

                    item.number

                );

            }

        );



        panel.setAttribute(

            "data-veneer-menu-ready",

            "true"

        );



        customizedPanel = panel;

    }



    /* ============================================================

       PHẦN 2 — MÀU MENU THEO TỪNG KHỐI VENEER

       ============================================================ */



    function normalizeHex(value, fallback) {

        const color =

            String(value || "").trim();



        if (/^#[0-9a-f]{6}$/i.test(color)) {

            return color.toLowerCase();

        }



        return fallback;

    }



    function hexToRgb(hex) {

        const source =

            normalizeHex(

                hex,

                BRAND

            ).slice(1);



        return {

            r: parseInt(

                source.slice(0, 2),

                16

            ),



            g: parseInt(

                source.slice(2, 4),

                16

            ),



            b: parseInt(

                source.slice(4, 6),

                16

            )

        };

    }



    function rgba(hex, alpha) {

        const rgb =

            hexToRgb(hex);



        return (

            "rgba(" +

            rgb.r + ", " +

            rgb.g + ", " +

            rgb.b + ", " +

            alpha +

            ")"

        );

    }



    function findActiveSection(header) {

        if (!page) return null;



        const headerRect =

            header ?

            header.getBoundingClientRect() : { bottom: 76 };



        /*

         * Probe ngay dưới menu.

         */

        const y = Math.min(

            Math.max(

                headerRect.bottom + 4,

                1

            ),

            Math.max(

                1,

                window.innerHeight - 1

            )

        );



        const xRatios = [

            0.16,

            0.50,

            0.84

        ];



        for (const ratio of xRatios) {

            const x = Math.min(

                Math.max(

                    window.innerWidth * ratio,

                    1

                ),

                Math.max(

                    1,

                    window.innerWidth - 1

                )

            );



            const elements =

                document.elementsFromPoint(

                    x,

                    y

                );



            for (const element of elements) {

                const section =

                    element.closest(

                        SECTION_SELECTOR

                    );



                if (

                    section &&

                    page.contains(section)

                ) {

                    return section;

                }

            }

        }



        /*

         * Fallback.

         */

        const sections = Array.from(

            page.querySelectorAll(

                "[data-menu-bg][data-menu-tone]"

            )

        );



        return (

            sections.find(

                function(section) {

                    const rect =

                        section.getBoundingClientRect();



                    return (

                        rect.top <= y &&

                        rect.bottom > y

                    );

                }

            ) ||

            sections[0] ||

            null

        );

    }



    function setImportant(

        element,

        property,

        value

    ) {

        if (!element) return;



        element.style.setProperty(

            property,

            value,

            "important"

        );

    }



    function applyVeneerTheme(

        activeSection,

        menu

    ) {

        if (!activeSection) return;



        const background =

            normalizeHex(

                activeSection.getAttribute(

                    "data-menu-bg"

                ),

                BRAND

            );



        const tone =

            String(

                activeSection.getAttribute(

                    "data-menu-tone"

                ) || "dark"

            )

        .trim()

        .toLowerCase() === "light" ?

            "light" :

            "dark";



        const dark =

            tone === "dark";



        document.documentElement

            .classList.add(

            "--implant-basic-active"

        );



        document.body

            .classList.add(

            "--implant-basic-active"

        );



        document.body.classList.toggle(

            "--implant-basic-menu-dark",

            dark

        );



        document.body.classList.toggle(

            "--implant-basic-menu-light", !dark

        );



        document.body.setAttribute(

            "data-veneer-menu-bg",

            background

        );



        document.body.setAttribute(

            "data-veneer-menu-tone",

            tone

        );



        const foreground =

            dark ?

            "#ffffff" :

            BRAND;



        const border =

            dark ?

            "rgba(255, 255, 255, 0.18)" :

            rgba(

                BRAND,

                0.18

            );



        const hover =

            dark ?

            "rgba(255, 255, 255, 0.08)" :

            rgba(

                BRAND,

                0.07

            );



        const headerGlass =

            dark ?

            rgba(

                background,

                0.62

            ) :

            "rgba(255, 255, 255, 0.78)";



        const panelGlass =

            dark ?

            rgba(

                background,

                0.80

            ) :

            "rgba(255, 255, 255, 0.80)";



        const properties = {

            "--menu-blue": BRAND,

            "--menu-sky": ACCENT,



            "--menu-section-bg": background,



            "--menu-foreground": foreground,



            "--menu-border": border,



            "--menu-hover": hover,



            "--menu-glass-bg": headerGlass,



            "--menu-panel-glass-bg": panelGlass

        };



        [

            document.documentElement,

            document.body,

            menu.header,

            menu.panel

        ].forEach(

            function(element) {

                if (!element) return;



                Object.keys(

                    properties

                ).forEach(

                    function(property) {

                        setImportant(

                            element,

                            property,

                            properties[property]

                        );

                    }

                );

            }

        );



        /*

         * Giữ đúng logo/text light-dark

         * bằng class menu gốc đang dùng.

         */

        [

            menu.header,

            menu.panel

        ].forEach(

            function(element) {

                if (!element) return;



                element.classList.toggle(

                    "--sgd-menu-tone-dark",

                    dark

                );



                element.classList.toggle(

                    "--sgd-menu-tone-light", !dark

                );

            }

        );



        if (menu.header) {

            menu.header.classList.toggle(

                "--sgd-scrolled",

                window.scrollY > 20

            );

        }

    }



    /* ============================================================

       PHẦN 3 — UPDATE

       ============================================================ */



    function updateLogoLink(header) {

        if (!header) return;



        const logo =

            header.querySelector(

                ".--sgd-sagodent-logo"

            );



        if (logo) {

            logo.setAttribute(

                "href",

                "https://sagodent.com/"

            );

        }

    }



    function updateVeneerMenu() {

        queued = false;



        if (!page ||

            !document.body.contains(page)

        ) {

            page =

                document.querySelector(

                    PAGE_SELECTOR

                );

        }



        if (!page) return;



        const menu =

            getMountedMenu();



        /*

         * Menu gốc chưa mount thì chờ observer/timeout.

         */

        if (!menu.header ||

            !menu.panel

        ) {

            return;

        }



        /*

         * Nếu JS menu gốc vừa clone panel mới,

         * customize lại đúng panel mới.

         */

        if (

            customizedPanel !==

            menu.panel

        ) {

            customizedPanel = null;



            customizeVeneerMenu(

                menu.panel

            );

        } else {

            customizeVeneerMenu(

                menu.panel

            );

        }



        updateLogoLink(

            menu.header

        );



        /*

         * Nội dung menu giữ nguyên 5 mục trên toàn Page Veneer.

         * CHỈ MÀU menu thay đổi theo section đang scroll tới.

         */

        const activeSection =

            findActiveSection(

                menu.header

            );



        if (activeSection) {

            applyVeneerTheme(

                activeSection,

                menu

            );

        }

    }



    function requestUpdate() {

        if (queued) return;



        queued = true;



        /*

         * Menu Trang chủ cũng update bằng RAF.

         * Chạy Veneer sau 2 frame để override CHỈ trên Page Veneer.

         */

        window.requestAnimationFrame(

            function() {

                window.requestAnimationFrame(

                    updateVeneerMenu

                );

            }

        );

    }



    function initVeneer() {

        page =

            document.querySelector(

                PAGE_SELECTOR

            );



        /*

         * Không phải Page Veneer:

         * dừng toàn bộ file JS này.

         */

        if (!page) return;



        normalizeVeneerMarkup();

        removeWordPressFooterGap();



        document.documentElement

            .classList.add(

            "--implant-basic-active"

        );



        document.body

            .classList.add(

            "--implant-basic-active"

        );



        window.addEventListener(

            "scroll",

            requestUpdate, {

                passive: true

            }

        );



        window.addEventListener(

            "wheel",

            requestUpdate, {

                passive: true

            }

        );



        window.addEventListener(

            "resize",

            requestUpdate, {

                passive: true

            }

        );



        window.addEventListener(

            "orientationchange",

            requestUpdate, {

                passive: true

            }

        );



        window.addEventListener(

            "load",

            requestUpdate, {

                once: true

            }

        );



        /*

         * JS menu Trang chủ:

         * clone header + panel rồi append trực tiếp vào body.

         *

         * Observer chỉ chờ chúng xuất hiện/remount.

         * KHÔNG tạo menu mới.

         */

        if (

            "MutationObserver" in window

        ) {

            const observer =

                new MutationObserver(

                    function() {

                        const menu =

                            getMountedMenu();



                        if (

                            menu.header &&

                            menu.panel

                        ) {

                            if (

                                customizedPanel !==

                                menu.panel

                            ) {

                                customizedPanel =

                                    null;

                            }



                            requestUpdate();

                        }

                    }

                );



            observer.observe(

                document.body, {

                    childList: true,

                    subtree: false

                }

            );

        }



        /*

         * Chạy lần đầu + dự phòng nếu assets/menu load chậm.

         */

        requestUpdate();



        window.setTimeout(

            requestUpdate,

            120

        );



        window.setTimeout(

            requestUpdate,

            500

        );



        window.setTimeout(

            requestUpdate,

            1000

        );

    }



    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initVeneer, {

                once: true

            }

        );

    } else {

        initVeneer();

    }

})();