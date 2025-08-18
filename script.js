// --- 資料模擬 (模擬 Headless CMS 的內容) ---
const projectsData = [
    {
        id: 0,
        name: "聲入淺出",
        category: "聲學文獻研究",
        color: "#ff8c69",
        height: 0.6,
        image: "../trip.png",
        slug: "papers",
        description: "一座融合現代科技與古典美學的音樂廳，透過精密的聲學計算，創造出完美的音響環境。",
        details: {
            year: "2024",
            area: "2,500 平方公尺",
            location: "台北市信義區",
            client: "台北市政府文化局",
            services: ["建築聲學設計", "室內音響系統", "噪音控制", "聲學材料選配"]
        }
    },
    {
        id: 1,
        name: "音源技繪",
        category: "聲學量測與模擬技術",
        color: "#6a9c89",
        height: 0.9,
        image: "../office.svg",
        slug: "apps",
        description: "為現代企業打造的寧靜工作環境，運用先進隔音技術，提升員工專注力與工作效率。",
        details: {
            year: "2024",
            area: "3,200 平方公尺",
            location: "新北市板橋區",
            client: "科技公司總部",
            services: ["辦公室聲學規劃", "會議室隔音", "開放空間音場設計", "HVAC噪音控制"]
        }
    },
    {
        id: 2,
        name: "自聲自滅",
        category: "客製化聲學服務",
        color: "#f7d08a",
        height: 0.5,
        image: "../residential.svg",
        slug: "consulting",
        description: "在繁忙都市中創造寧靜居住空間，結合綠建築概念與聲學設計，打造理想家園。",
        details: {
            year: "2024",
            area: "800 平方公尺",
            location: "台北市大安區",
            client: "私人住宅",
            services: ["住宅隔音設計", "家庭劇院聲學", "景觀噪音控制", "室內音場優化"]
        }
    },
    {
        id: 3,
        name: "音錯陽差",
        category: "建築聲學之流言終結者",
        color: "#89a9d4",
        height: 0.8,
        image: "../multimedia.svg",
        slug: "rumor",
        description: "結合藝術與科技的創新空間，為多媒體展演提供最佳的聲學環境與視聽體驗。",
        details: {
            year: "2024",
            area: "1,800 平方公尺",
            location: "台中市西區",
            client: "文化藝術基金會",
            services: ["展演空間聲學", "多媒體音響系統", "互動裝置聲學", "觀眾席音場設計"]
        }
    },
    {
        id: 4,
        name: "有聲有色",
        category: "聲學大雜燴",
        color: "#c3aed6",
        height: 0.65,
        image: "../library.svg",
        slug: "others",
        description: "現代圖書館的聲學革新，創造有利於學習與思考的寧靜環境，同時兼顧空間的開放性。",
        details: {
            year: "2024",
            area: "4,500 平方公尺",
            location: "高雄市前鎮區",
            client: "市立圖書館",
            services: ["圖書館聲學設計", "閱覽區隔音", "多功能廳音響", "兒童區音場控制"]
        }
    }
];

// --- 全域變數與初始化 ---
let activeIndex = 0;
let isAnimating = false;
let dragInfo = { startX: 0, isDragging: false };
let wheelTimeout;
let autoPlayInterval;
let containerOffset = { x: 0, y: 0 };
let autoAnimationTimeout; // 用於1.5秒延遲的自動動畫
let initialLoadTimeout; // 用於初次載入2秒延遲的自動動畫
let hasUserInteracted = false; // 追蹤使用者是否有過互動
let currentRoute = '/'; // 當前路由

const container = document.getElementById('soundwave-container');

let pages = {
    home: document.body, // 主頁面（body 元素）
    about: null,
    projectDetail: null
};

// 在 DOM 加載完成後初始化頁面元素
function initializePages() {
    pages.about = document.getElementById('page-about');
    pages.projectDetail = document.getElementById('page-project-detail');
}

const tts = {
    button: document.getElementById('tts-button'),
    buttonText: document.getElementById('tts-button-text'),
    playIcon: document.getElementById('play-icon'),
    audio: document.getElementById('tts-audio'),
    content: document.getElementById('page-about'),
    isPlaying: false
};

// --- 響應式縮放系統 ---
function getResponsiveScale() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 480) {
        return {
            scale: 0.7, // 小螢幕固定70%，避免太小
            isMobile: true,
            isSmallMobile: true
        };
    } else if (screenWidth <= 768) {
        return {
            scale: 0.85, // 手機版固定85%，適中大小
            isMobile: true,
            isSmallMobile: false
        };
    } else {
        return {
            scale: 1.0, // 桌面版保持原始大小，避免過大
            isMobile: false,
            isSmallMobile: false
        };
    }
}

// --- 路由系統 ---
function initRouter() {
    // 監聽 hash 變化（用於 SPA 路由）
    window.addEventListener('hashchange', handleRouteChange);

    // 監聽瀏覽器的前進/後退按鈕（備用）
    window.addEventListener('popstate', handleRouteChange);

    // 攔截所有連結點擊
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
            const url = new URL(link.href);

            // 只處理同域的連結
            if (url.origin === window.location.origin) {
                e.preventDefault();

                // 如果是 hash 連結，使用 hash 路由
                if (url.hash) {
                    navigateToRoute(url.hash);
                } else {
                    navigateToRoute('/');
                }
            }
        }
    });

    // 處理初始路由
    handleRouteChange();
}

function handleRouteChange() {
    const hash = window.location.hash;

    // 移除開頭的 # 符號
    const route = hash.startsWith('#') ? hash.substring(1) : hash;

    console.log('Route change:', route); // 調試用

    // 更新全域路由變數
    currentRoute = route || '/';

    // 解析路由
    if (route === '/about' || route === 'about' || route === '#about') {
        showAboutPage();
    } else if (route.startsWith('/project/')) {
        const slug = route.split('/project/')[1];
        if (slug) {
            showProjectDetailPage(slug);
        } else {
            showHomePage();
        }
    } else {
        // 預設顯示主頁面（包括空路由和未知路由）
        showHomePage();
    }
}

function navigateToRoute(path, updateHistory = true) {
    // 正規化輸入路徑：支援 '#about'、'about'、'/about' 等多種形式
    if (!path) path = '/';
    if (path.startsWith('#')) path = path.substring(1); // '#about' → 'about'
    if (path.startsWith('/#')) path = path.replace('/#', '/'); // '/#about' → '/about'
    if (!path.startsWith('/')) path = '/' + path; // 'about' → '/about'

    if (updateHistory) {
        // 使用 hash 路由，這在所有環境下都能工作
        const newHash = path === '/' ? '' : '#' + path;
        if (window.location.hash !== newHash) {
            window.location.hash = newHash;
            return; // hash 變化會觸發 hashchange 事件，不需要手動調用 handleRouteChange
        }
    }

    currentRoute = path;
    handleRouteChange();
}

function showHomePage() {
    // 如果正在動畫中，等待動畫完成或強制停止，避免競態條件
    if (isAnimating) {
        // 強制停止動畫狀態，避免頁面切換時的衝突
        isAnimating = false;
        console.log('Forced animation stop during page switch');
    }

    // 只隱藏其他頁面，避免隱藏主頁面元素造成跑版
    pages.about.classList.remove('active');
    pages.projectDetail.classList.remove('active');

    // 恢復背景頁面滾動
    document.body.classList.remove('modal-open');
    document.body.classList.remove('background-fixed');

    // 確保主頁面元素顯示（避免重複設置造成跑版）
    const soundwaveContainer = document.getElementById('soundwave-container');
    const mainUI = document.getElementById('main-ui');

    if (soundwaveContainer.style.display === 'none') {
        soundwaveContainer.style.display = 'flex';
    }
    if (mainUI.style.display === 'none') {
        mainUI.style.display = 'flex';
    }

    // 重新顯示導航按鈕
    document.getElementById('prev-btn').style.display = 'flex';
    document.getElementById('next-btn').style.display = 'flex';

    // 隱藏浮動導航條
    hideFloatingNavBar();

    // 使用 requestAnimationFrame 確保所有 DOM 操作在同一個渲染週期內完成，避免跑版
    requestAnimationFrame(() => {
        // 檢查是否有方形狀態的 bar（保留舞台視覺）
        const squareBar = document.querySelector('.sound-bar[data-square="true"], .sound-bar[data-rotated="true"], .sound-bar.rotated-bar');

        if (squareBar) {
            // 保持方形舞台：清理前景元素，重建圖片/文字與顏色
            cleanupProjectImages();
            cleanupProjectTitle();

            const project = projectsData[activeIndex];
            if (project) {
                // 更新背景色
                const bgColor = darkenColor(project.color, 0.4);
                gsap.to('body', { duration: 0.394, backgroundColor: bgColor, ease: 'sine.inOut' });

                // 保留舞台時，不改變旁邊 sin bars 的現有顏色（維持進入詳情前的狀態）
                // 故此處不做任何顏色調整

                // 重建舞台圖片與類別文字、標題
                createProjectImageInSquare(squareBar, project);
                showProjectTitle(activeIndex);
            }
        } else {
            // 沒有方形舞台則完整恢復主頁狀態
            updateProjectInfo(activeIndex, false);
        }

        // 僅在首次載入且目前沒有方形bar時，才啟動初次自動動畫
        const hasSquareBar = !!squareBar;
        if (!hasUserInteracted && !hasSquareBar) {
            setTimeout(() => { scheduleInitialAutoAnimation(); }, 118);
        }
    });
}

function showAboutPage() {
    // 強制停止所有動畫和計時器，避免頁面切換時的競態條件
    isAnimating = false;
    if (autoAnimationTimeout) {
        clearTimeout(autoAnimationTimeout);
        autoAnimationTimeout = null;
    }
    if (initialLoadTimeout) {
        clearTimeout(initialLoadTimeout);
        initialLoadTimeout = null;
    }
    if (wheelTimeout) {
        clearTimeout(wheelTimeout);
        wheelTimeout = null;
    }

    // 隱藏其他頁面，但保持主頁面元素不被重複隱藏/顯示
    pages.projectDetail.classList.remove('active');

    // 清理主頁的專案標題和圖片，避免穿透到關於我頁面
    cleanupProjectTitle();
    cleanupProjectImages();

    // 強制清理所有可能的專案相關元素，確保沒有穿透
    const allProjectCategories = document.querySelectorAll('[data-project-category="true"]');
    allProjectCategories.forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    const allProjectTexts = document.querySelectorAll('[data-project-text="true"]');
    allProjectTexts.forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    // 重置背景色為預設值，避免專案主題色穿透
    gsap.to('body', { duration: 0.4, backgroundColor: '#111827', ease: 'sine.inOut' }); // 預設深灰色

    // 隱藏主頁面元素（關於我們頁面需要完全隱藏主頁面）
    document.getElementById('soundwave-container').style.display = 'none';
    document.getElementById('main-ui').style.display = 'none';

    // 恢復背景頁面滾動
    document.body.classList.remove('modal-open');
    document.body.classList.remove('background-fixed');

    pages.about.classList.add('active');

    // 延遲清理，確保在任何可能的重建之後再次清理
    setTimeout(() => {
        const allProjectCategories = document.querySelectorAll('[data-project-category="true"]');
        allProjectCategories.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        const allProjectTexts = document.querySelectorAll('[data-project-text="true"]');
        allProjectTexts.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }, 100);
}

// 從 papers.html 載入內容的函數
function loadPapersContent(contentDiv) {
    // 直接插入 papers.html 中的 makingsoftware-container 內容
    contentDiv.innerHTML = `
        <style>
            /* makingsoftware.com 風格樣式 - 完全模仿原網站 */
            .makingsoftware-container {
                font-family: 'JetBrains Mono', monospace;
                background: #ffffff;
                color: #000000;
                line-height: 1.8;
                padding: 40px 20px;
                max-width: 600px;
                margin: 0 auto;
            }

            .makingsoftware-container h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 2rem;
                letter-spacing: -0.02em;
                text-align: center;
            }

            .makingsoftware-container p {
                font-size: 1rem;
                line-height: 1.8;
                margin-bottom: 1.5rem;
                color: #333;
            }

            .makingsoftware-container .figure {
                text-align: center;
                margin: 2rem 0;
                font-weight: bold;
                color: #666;
            }

            /* 搜尋欄樣式 */
            .search-container {
                margin: 2rem 0;
                position: relative;
            }

            .search-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.9rem;
                background: #f9f9f9;
                transition: all 0.3s ease;
            }

            .search-input:focus {
                outline: none;
                border-color: #333;
                background: #fff;
            }

            .search-results {
                margin-top: 1rem;
                font-size: 0.8rem;
                color: #666;
            }

            /* Table of Contents 樣式 - 模仿 makingsoftware.com */
            .toc-section {
                margin: 3rem 0;
            }

            .toc-title {
                font-size: 1.2rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: #000;
            }

            .toc-item {
                display: block;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
                text-decoration: none;
                color: #333;
                transition: all 0.2s ease;
                font-size: 0.95rem;
            }

            .toc-item:hover {
                background-color: #f5f5f5;
                padding-left: 8px;
                color: #000;
            }

            .toc-item.hidden {
                display: none;
            }

            .chapter-number {
                color: #666;
                margin-right: 1rem;
                font-weight: 500;
            }

            .chapter-status {
                float: right;
                font-size: 0.8rem;
                color: #666;
            }

            .status-complete {
                color: #22c55e;
            }

            .status-progress {
                color: #f59e0b;
            }

            .status-pending {
                color: #e5e7eb;
            }

            /* 響應式設計 */
            @media (max-width: 768px) {
                .makingsoftware-container {
                    padding: 20px 15px;
                }

                .makingsoftware-container h1 {
                    font-size: 2rem;
                }

                .toc-item {
                    font-size: 0.9rem;
                }
            }
        </style>

        <div class="makingsoftware-container">
            <h1>MAKING SOFTWARE</h1>

            <p>你是否曾經好奇過音樂廳的聲學設計是如何工作的？它們有著精心計算的幾何形狀和材料配置，當聲波在空間中傳播時，這些設計能夠控制聲音的反射、吸收和擴散。</p>

            <div class="figure">FIG_001</div>

            <p>因為聲波在不同材料中的傳播速度不同，建築師可以利用這些特性來設計出理想的聲學環境。相當巧妙。</p>

            <p>或者你想知道為什麼我們稱某些材料為「吸音材料」？當聲波撞擊這些材料時，它們的多孔結構會將聲能轉換為熱能，從而減少聲音的反射。</p>

            <div class="figure">FIG_002</div>

            <p>最常見的吸音材料具有多孔結構，意味著它們在表面有許多小孔，在內部有更多的空隙。這種結構能夠有效地吸收聲能而不會過於昂貴。</p>

            <p>也許你一直想知道混響時間是如何計算的，以及那些複雜的公式實際上在做什麼。</p>

            <div class="figure">FIG_003</div>

            <p>它們控制著聲學空間中的聲音衰減，這是我們用來設計音樂廳、劇院和錄音室的重要數學工具。</p>

            <p>當然，我們的耳朵是由複雜的生物結構組成的，很難完美地感知所有頻率。所以我們必須考慮人類聽覺的特性，並想出一堆巧妙的技巧，比如心理聲學，來欺騙我們的大腦以為我們聽到的是完美的聲音。</p>

            <div class="figure">FIG_004</div>

            <p>這被稱為聲學設計，但它並不像看起來那麼簡單，我們需要一整套聰明的技巧，比如頻率遮蔽和雙耳效應，來欺騙我們的耳朵以為我們聽到的是自然的聲音。</p>

            <p>如果你對這些問題感到好奇，或者它們激發了你的興趣，那麼這個研究就是為你準備的。</p>

            <p>這本手冊不會教你如何實際製作聲學設備 - 它不是教程或指南，而是比那更有趣的東西。它是一本解釋你每天使用的聲學技術實際如何工作的手冊。</p>

            <p>隨著我們周圍的一切變得越來越複雜，我們對技術的理解卻在減少。過去我們需要深入了解我們的工具，但今天我們以一種膚淺、抽象的方式理解它們。</p>

            <p>它不會讓你明天就成為更好的設計師或工程師 - 這裡沒有可操作的內容。但是當你發現自己超出了自己的能力範圍時，了解事物的工作原理會派上用場。或者至少，你可以在朋友面前假裝聰明。</p>

            <p>你不需要有技術背景來閱讀這個 - 有很多圖片和圖表來承擔重任。你只需要保持好奇心。</p>

            <!-- 搜尋欄 -->
            <div class="search-container">
                <input type="text" id="searchInput" class="search-input" placeholder="搜尋 Table of Contents...">
                <div id="searchResults" class="search-results"></div>
            </div>

            <!-- Table of Contents 區域 -->
            <div class="toc-section">
                <div class="toc-title">Table of Contents</div>

                <div id="tocContainer">
                    <!-- 聲學基礎 -->
                    <a href="#" class="toc-item" data-keywords="聲學 基礎 聲波 傳播 原理">
                        <span class="chapter-number">01</span>聲波傳播原理
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="頻率 音高 關係 聲學">
                        <span class="chapter-number">02</span>頻率與音高的關係
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲壓級 分貝 測量">
                        <span class="chapter-number">03</span>聲壓級與分貝
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲音 反射 折射 物理">
                        <span class="chapter-number">04</span>聲音的反射與折射
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="共振 頻率 振動">
                        <span class="chapter-number">05</span>共振現象與頻率響應
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 建築聲學 -->
                    <a href="#" class="toc-item" data-keywords="建築 聲學 室內 設計 原理">
                        <span class="chapter-number">06</span>室內聲學設計原理
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="吸音 材料 係數">
                        <span class="chapter-number">07</span>吸音材料與吸音係數
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="隔音 隔聲 設計">
                        <span class="chapter-number">08</span>隔音設計與隔聲量
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="混響 時間 計算">
                        <span class="chapter-number">09</span>混響時間計算
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="音樂廳 劇院 聲學">
                        <span class="chapter-number">10</span>音樂廳與劇院聲學
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 電聲技術 -->
                    <a href="#" class="toc-item" data-keywords="麥克風 類型 特性">
                        <span class="chapter-number">11</span>麥克風類型與特性
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="揚聲器 喇叭 設計">
                        <span class="chapter-number">12</span>揚聲器設計原理
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="音響 系統 設計">
                        <span class="chapter-number">13</span>音響系統設計
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="數位 音訊 處理">
                        <span class="chapter-number">14</span>數位音訊處理
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="音訊 編碼 壓縮">
                        <span class="chapter-number">15</span>音訊編碼與壓縮
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 聲學測量 -->
                    <a href="#" class="toc-item" data-keywords="聲級計 測量 儀器">
                        <span class="chapter-number">16</span>聲級計與測量儀器
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="頻譜 分析 方法">
                        <span class="chapter-number">17</span>頻譜分析方法
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="脈衝 響應 測量">
                        <span class="chapter-number">18</span>脈衝響應測量
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="噪音 評估 標準">
                        <span class="chapter-number">19</span>噪音評估標準
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲學 校準 程序">
                        <span class="chapter-number">20</span>聲學校準程序
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 心理聲學 -->
                    <a href="#" class="toc-item" data-keywords="心理 聲學 感知">
                        <span class="chapter-number">21</span>聲音感知與心理聲學
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="雙耳 效應 立體聲">
                        <span class="chapter-number">22</span>雙耳效應與立體聲
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="遮蔽 效應 頻率">
                        <span class="chapter-number">23</span>遮蔽效應與頻率感知
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="響度 感知 曲線">
                        <span class="chapter-number">24</span>響度感知曲線
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="音色 分析 特徵">
                        <span class="chapter-number">25</span>音色分析與特徵
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 數值模擬 -->
                    <a href="#" class="toc-item" data-keywords="有限 元素 分析">
                        <span class="chapter-number">26</span>有限元素聲學分析
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="邊界 元素 方法">
                        <span class="chapter-number">27</span>邊界元素方法
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="射線 追蹤 模擬">
                        <span class="chapter-number">28</span>射線追蹤聲學模擬
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="波動 方程 求解">
                        <span class="chapter-number">29</span>波動方程數值求解
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲場 可視化 技術">
                        <span class="chapter-number">30</span>聲場可視化技術
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 應用案例 -->
                    <a href="#" class="toc-item" data-keywords="音樂廳 設計 案例">
                        <span class="chapter-number">31</span>音樂廳設計案例分析
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="錄音室 聲學 設計">
                        <span class="chapter-number">32</span>錄音室聲學設計
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="住宅 隔音 改善">
                        <span class="chapter-number">33</span>住宅隔音改善方案
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="辦公室 聲學 環境">
                        <span class="chapter-number">34</span>辦公室聲學環境優化
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="工業 噪音 控制">
                        <span class="chapter-number">35</span>工業噪音控制技術
                        <span class="chapter-status status-pending">○</span>
                    </a>

                    <!-- 其他主題 -->
                    <a href="#" class="toc-item" data-keywords="環境 噪音 評估">
                        <span class="chapter-number">36</span>環境噪音評估方法
                        <span class="chapter-status status-complete">✓</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲學 標準 規範">
                        <span class="chapter-number">37</span>聲學標準與規範
                        <span class="chapter-status status-progress">⋯</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="未來 聲學 技術">
                        <span class="chapter-number">38</span>未來聲學技術展望
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲學 軟體 工具">
                        <span class="chapter-number">39</span>聲學軟體工具介紹
                        <span class="chapter-status status-pending">○</span>
                    </a>
                    <a href="#" class="toc-item" data-keywords="聲學 研究 方法">
                        <span class="chapter-number">40</span>聲學研究方法論
                        <span class="chapter-status status-pending">○</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    // 重新初始化搜尋功能
    setTimeout(() => {
        initializePapersSearch();
    }, 100);

    // 移除生成按鈕和載入動畫
    const generateButton = document.getElementById('project-detail-generate');
    const loader = document.getElementById('project-detail-loader');
    if (generateButton) generateButton.style.display = 'none';
    if (loader) loader.classList.add('hidden');
}

// 初始化 papers 搜尋功能
function initializePapersSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const tocItems = document.querySelectorAll('.toc-item');

    if (!searchInput || !searchResults || tocItems.length === 0) {
        return; // 如果元素不存在，直接返回
    }

    // 清除之前的事件監聽器
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm === '') {
            // 顯示所有項目
            tocItems.forEach(item => {
                item.classList.remove('hidden');
            });
            searchResults.textContent = '';
            return;
        }

        let visibleCount = 0;
        tocItems.forEach(item => {
            const title = item.textContent.toLowerCase();
            const keywords = item.getAttribute('data-keywords');
            const keywordsText = keywords ? keywords.toLowerCase() : '';

            if (title.includes(searchTerm) || keywordsText.includes(searchTerm)) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        searchResults.textContent = `找到 ${visibleCount} 個相關項目`;
    });

    // TOC 項目點擊效果
    tocItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // 簡單的點擊反饋
            this.style.backgroundColor = '#f0f0f0';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 200);

            // 這裡可以添加跳轉到具體章節的邏輯
            const title = this.textContent.replace(/^\d+/, '').replace(/[✓⋯○]$/, '').trim();
            console.log('點擊了章節:', title);
        });
    });

    // 鍵盤快捷鍵 - Ctrl+F 或 Cmd+F 聚焦搜尋欄
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f' && document.getElementById('page-project-detail').classList.contains('active')) {
            e.preventDefault();
            newSearchInput.focus();
        }
    });
}

function showProjectDetailPage(slug) {
    // 根據 slug 找到對應的專案
    const project = projectsData.find(p => p.slug === slug);
    if (!project) {
        // 如果找不到專案，回到主頁
        navigateToRoute('/');
        return;
    }

    // 更新 activeIndex
    activeIndex = project.id;

    // 強制停止所有動畫和計時器
    isAnimating = false;
    if (autoAnimationTimeout) {
        clearTimeout(autoAnimationTimeout);
        autoAnimationTimeout = null;
    }
    if (initialLoadTimeout) {
        clearTimeout(initialLoadTimeout);
        initialLoadTimeout = null;
    }

    // 隱藏其他頁面
    pages.about.classList.remove('active');

    // 清理主頁的專案標題和圖片，避免穿透到專案詳情頁面
    cleanupProjectTitle();
    cleanupProjectImages();

    // 隱藏主頁面元素
    document.getElementById('soundwave-container').style.display = 'none';
    document.getElementById('main-ui').style.display = 'none';

    // 禁止背景頁面滾動
    document.body.classList.add('modal-open');
    document.body.classList.add('background-fixed');

    // 更新專案詳情內容
    updateProjectDetailContent(project);

    // 顯示專案詳情頁面
    pages.projectDetail.classList.add('active');

    // 顯示浮動導航條
    showFloatingNavBar(project);
}

// --- 專案詳情頁面相關函數 ---
function updateProjectDetailContent(project) {
    // 更新 activeIndex 為當前專案的索引
    activeIndex = project.id;

    // 重置專案詳細頁面的滾動位置到頂部
    const scrollContainer = document.querySelector('#page-project-detail .overflow-y-auto');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }

    // 更新浮動導航欄的專案標題
    document.getElementById('floating-current-project-title').textContent = project.name;

    // 填充專案詳情頁面的內容
    document.getElementById('project-detail-title').textContent = project.name;
    document.getElementById('project-detail-category').textContent = project.category;
    document.getElementById('project-detail-description').textContent = project.description;




    // 填充專案詳細資訊
    if (project.details) {
        document.getElementById('project-detail-year').textContent = project.details.year;
        document.getElementById('project-detail-area').textContent = project.details.area;
        document.getElementById('project-detail-location').textContent = project.details.location;
        document.getElementById('project-detail-client').textContent = project.details.client;

        // 填充服務項目
        const servicesList = document.getElementById('project-detail-services-list');
        servicesList.innerHTML = '';
        project.details.services.forEach(service => {
            const serviceItem = document.createElement('p');
            serviceItem.className = 'text-gray-800 text-sm';
            serviceItem.textContent = service;
            servicesList.appendChild(serviceItem);
        });

        // 在頂部資訊區顯示主要服務
        const servicesElement = document.getElementById('project-detail-services');
        if (servicesElement) {
            servicesElement.textContent = project.details.services[0];
        }
    }

    // 首先檢查是否為 papers 專案，如果是則進行特殊處理
    const contentDiv = document.getElementById('project-detail-content');

    if (project.slug === 'papers') {
        // Papers 專案不需要相關專案和專案圖片，先移除這些元素
        const relatedContainer = document.getElementById('related-projects');
        if (relatedContainer && relatedContainer.parentElement) {
            relatedContainer.parentElement.remove();
        }

        // 移除專案圖片
        const projectImage = document.getElementById('project-detail-image');
        if (projectImage && projectImage.parentElement) {
            const imageContainer = projectImage.closest('.aspect-video') || projectImage.parentElement;
            if (imageContainer) {
                imageContainer.remove();
            }
        }

        // 從 papers.html 載入內容
        loadPapersContent(contentDiv);
        return;
    } else if (project.slug === 'apps') {
        // Apps 專案使用 june15consulting.com 風格
        contentDiv.innerHTML = `
            <style>
                .june15-container {
                    font-family: 'Inter', 'Noto Sans TC', sans-serif;
                    line-height: 1.6;
                }

                .june15-hero {
                    padding: 60px 0;
                    text-align: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 12px;
                    margin-bottom: 60px;
                }

                .june15-hero-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #1a1a1a;
                    line-height: 1.2;
                }

                .june15-hero-subtitle {
                    font-size: 1.125rem;
                    color: #64748b;
                    margin-bottom: 2rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .june15-cta-button {
                    display: inline-block;
                    background: #3b82f6;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .june15-cta-button:hover {
                    background: #2563eb;
                    transform: translateY(-2px);
                }

                .june15-section {
                    margin: 60px 0;
                }

                .june15-section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 1rem;
                    color: #1a1a1a;
                }

                .june15-section-subtitle {
                    font-size: 1.125rem;
                    color: #64748b;
                    text-align: center;
                    margin-bottom: 3rem;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .june15-services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .june15-service-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 2rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .june15-service-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
                    transform: translateY(-4px);
                }

                .june15-service-icon {
                    width: 48px;
                    height: 48px;
                    background: #eff6ff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                    color: #3b82f6;
                }

                .june15-service-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: #1a1a1a;
                }

                .june15-service-description {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                }

                .june15-process-section {
                    background: #f8fafc;
                    padding: 60px 30px;
                    border-radius: 12px;
                    margin: 60px 0;
                }

                .june15-process-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 3rem;
                    margin-top: 3rem;
                }

                .june15-process-step {
                    text-align: center;
                }

                .june15-process-number {
                    width: 60px;
                    height: 60px;
                    background: #3b82f6;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 auto 1.5rem;
                }

                .june15-process-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: #1a1a1a;
                }

                .june15-process-description {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                }

                .june15-testimonial-section {
                    background: #1e293b;
                    color: white;
                    padding: 60px 30px;
                    border-radius: 12px;
                    margin: 60px 0;
                }

                .june15-testimonial-quote {
                    font-size: 1.5rem;
                    font-style: italic;
                    text-align: center;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .june15-testimonial-author {
                    text-align: center;
                    font-weight: 600;
                    color: #94a3b8;
                }

                .june15-benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-top: 3rem;
                }

                .june15-benefit-card {
                    background: #334155;
                    padding: 2rem;
                    border-radius: 12px;
                }

                .june15-benefit-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: white;
                }

                .june15-benefit-description {
                    color: #cbd5e1;
                    line-height: 1.6;
                }

                .june15-contact-section {
                    text-align: center;
                    margin: 60px 0;
                }

                .june15-contact-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #1a1a1a;
                }

                .june15-contact-subtitle {
                    font-size: 1.125rem;
                    color: #64748b;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .june15-hero-title {
                        font-size: 2rem;
                    }

                    .june15-section-title {
                        font-size: 1.75rem;
                    }

                    .june15-services-grid {
                        grid-template-columns: 1fr;
                    }

                    .june15-process-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }
            </style>

            <div class="june15-container">
                <!-- Hero Section -->
                <div class="june15-hero">
                    <h1 class="june15-hero-title">專業聲學量測與模擬技術</h1>
                    <p class="june15-hero-subtitle">
                        聲學量測不只是測量。我們運用先進的模擬技術和精密儀器，為企業打造最適合的聲學環境，
                        提升工作效率並創造舒適的空間體驗。
                    </p>
                    <a href="mailto:info@yunique.com" class="june15-cta-button">立即諮詢</a>
                </div>

                <!-- Services Section -->
                <div class="june15-section">
                    <h2 class="june15-section-title">全方位聲學解決方案</h2>
                    <p class="june15-section-subtitle">
                        我們的專業團隊提供從量測分析到實施優化的完整服務，確保您的空間達到最佳聲學表現。
                    </p>

                    <div class="june15-services-grid">
                        <div class="june15-service-card">
                            <div class="june15-service-icon">📊</div>
                            <h3 class="june15-service-title">聲學量測分析</h3>
                            <p class="june15-service-description">
                                使用專業級聲學儀器進行現場量測，包括混響時間、背景噪音、隔音性能等關鍵參數的精確分析。
                            </p>
                        </div>

                        <div class="june15-service-card">
                            <div class="june15-service-icon">🖥️</div>
                            <h3 class="june15-service-title">3D 聲學模擬</h3>
                            <p class="june15-service-description">
                                運用先進的電腦模擬技術，在施工前預測空間的聲學表現，優化設計方案並降低成本風險。
                            </p>
                        </div>

                        <div class="june15-service-card">
                            <div class="june15-service-icon">🏢</div>
                            <h3 class="june15-service-title">辦公空間優化</h3>
                            <p class="june15-service-description">
                                針對開放式辦公室、會議室、電話亭等不同區域，提供客製化的聲學設計和材料配置建議。
                            </p>
                        </div>

                        <div class="june15-service-card">
                            <div class="june15-service-icon">🔧</div>
                            <h3 class="june15-service-title">HVAC 噪音控制</h3>
                            <p class="june15-service-description">
                                專業的機械設備噪音分析與控制，確保空調、通風系統運作時不影響室內聲學環境品質。
                            </p>
                        </div>

                        <div class="june15-service-card">
                            <div class="june15-service-icon">📱</div>
                            <h3 class="june15-service-title">智慧監測系統</h3>
                            <p class="june15-service-description">
                                建置即時聲學監測系統，持續追蹤空間聲學表現，提供數據驅動的優化建議。
                            </p>
                        </div>

                        <div class="june15-service-card">
                            <div class="june15-service-icon">🎯</div>
                            <h3 class="june15-service-title">客製化解決方案</h3>
                            <p class="june15-service-description">
                                根據不同行業和使用需求，設計專屬的聲學解決方案，從錄音室到醫療院所都有豐富經驗。
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Process Section -->
                <div class="june15-process-section">
                    <h2 class="june15-section-title">我們的專業流程</h2>
                    <p class="june15-section-subtitle">
                        透過系統化的四步驟流程，我們確保每個專案都能達到最佳的聲學表現，
                        從初期評估到最終優化，全程提供專業指導。
                    </p>

                    <div class="june15-process-grid">
                        <div class="june15-process-step">
                            <div class="june15-process-number">1</div>
                            <h3 class="june15-process-title">現場評估分析</h3>
                            <p class="june15-process-description">
                                專業團隊到現場進行詳細的聲學環境評估，使用精密儀器量測現況，
                                分析問題根源並評估改善潛力。
                            </p>
                        </div>

                        <div class="june15-process-step">
                            <div class="june15-process-number">2</div>
                            <h3 class="june15-process-title">客製化方案設計</h3>
                            <p class="june15-process-description">
                                根據評估結果和客戶需求，設計專屬的聲學解決方案，
                                包括材料選擇、空間配置和系統整合建議。
                            </p>
                        </div>

                        <div class="june15-process-step">
                            <div class="june15-process-number">3</div>
                            <h3 class="june15-process-title">專業施工執行</h3>
                            <p class="june15-process-description">
                                由經驗豐富的施工團隊執行聲學改善工程，
                                嚴格遵循設計規範，確保施工品質和進度控制。
                            </p>
                        </div>

                        <div class="june15-process-step">
                            <div class="june15-process-number">4</div>
                            <h3 class="june15-process-title">效果驗證優化</h3>
                            <p class="june15-process-description">
                                完工後進行全面的聲學性能驗證，確認達到設計目標，
                                並提供後續的維護建議和優化服務。
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Testimonial Section -->
                <div class="june15-testimonial-section">
                    <h2 class="june15-section-title" style="color: white;">客戶成功案例</h2>
                    <div class="june15-testimonial-quote">
                        "與 yunique 合作改造我們的辦公空間是最明智的決定。他們的專業團隊不僅解決了開放式辦公室的噪音問題，
                        更創造了一個讓員工更專注、更有創造力的工作環境。現在我們的員工滿意度提升了40%，工作效率也顯著改善。"
                    </div>
                    <div class="june15-testimonial-author">— 李總經理，科技公司總部</div>

                    <div class="june15-benefits-grid">
                        <div class="june15-benefit-card">
                            <h3 class="june15-benefit-title">工作效率提升</h3>
                            <p class="june15-benefit-description">
                                透過精確的聲學設計，員工專注力提升35%，會議效率改善50%，
                                創造更高品質的工作產出。
                            </p>
                        </div>

                        <div class="june15-benefit-card">
                            <h3 class="june15-benefit-title">員工滿意度改善</h3>
                            <p class="june15-benefit-description">
                                舒適的聲學環境大幅降低工作壓力，員工滿意度調查顯示
                                40%的改善，離職率下降25%。
                            </p>
                        </div>

                        <div class="june15-benefit-card">
                            <h3 class="june15-benefit-title">空間使用優化</h3>
                            <p class="june15-benefit-description">
                                智慧聲學分區設計讓空間使用更靈活，不同功能區域
                                都能發揮最大效益，提升整體空間價值。
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Contact Section -->
                <div class="june15-contact-section">
                    <h2 class="june15-contact-title">準備開始您的聲學改善計畫？</h2>
                    <p class="june15-contact-subtitle">
                        聯絡我們的專業團隊，讓我們為您打造最適合的聲學環境解決方案。
                    </p>
                    <a href="mailto:info@yunique.com" class="june15-cta-button">立即聯絡我們</a>
                </div>
            </div>
        `;

        // 隱藏 AI 生成按鈕，因為 apps 專案已經有完整內容
        document.getElementById('project-detail-generate').style.display = 'none';
        document.getElementById('project-detail-loader').classList.add('hidden');

        // 添加服務卡片的點擊互動效果
        setTimeout(() => {
            document.querySelectorAll('.june15-service-card').forEach(card => {
                card.addEventListener('click', function() {
                    // 簡單的點擊反饋
                    this.style.transform = 'translateY(-8px)';
                    setTimeout(() => {
                        this.style.transform = 'translateY(-4px)';
                    }, 150);
                });
            });
        }, 100);

        // Apps 專案不需要相關專案和專案圖片，移除這些元素
        const relatedContainer = document.getElementById('related-projects');
        if (relatedContainer && relatedContainer.parentElement) {
            relatedContainer.parentElement.remove();
        }

        // 移除專案圖片
        const projectImage = document.getElementById('project-detail-image');
        if (projectImage && projectImage.parentElement) {
            const imageContainer = projectImage.closest('.aspect-video') || projectImage.parentElement;
            if (imageContainer) {
                imageContainer.remove();
            }
        }

    } else {
        // 其他專案使用原本的 AI 生成內容方式
        contentDiv.innerHTML = '<p class="text-gray-700 leading-relaxed text-sm">點擊下方按鈕，讓 AI 為您描繪此專案的聲學設計靈感...</p>';

        // 顯示生成按鈕，隱藏載入動畫
        document.getElementById('project-detail-generate').style.display = 'flex';
        document.getElementById('project-detail-loader').classList.add('hidden');

        // 確保其他專案有圖片元素和相關專案容器
        ensureProjectImageExists();
        ensureRelatedProjectsExists();

        // 使用 setTimeout 確保 DOM 元素已經創建
        setTimeout(() => {
            // 設置專案圖片和類型
            const projectImage = document.getElementById('project-detail-image');
            if (projectImage) {
                projectImage.src = project.image;
                projectImage.alt = project.name;
            }

            const projectTypeElement = document.getElementById('project-detail-type');
            if (projectTypeElement) {
                projectTypeElement.textContent = project.category;
            }
        }, 0);

        // 其他專案生成相關專案
        populateRelatedProjects(project);
    }



    // 初始化浮動專案選擇器
    initializeFloatingProjectSelector(project);

    // 設置 AI 生成按鈕事件
    const generateBtn = document.getElementById('project-detail-generate');
    if (generateBtn) {
        generateBtn.replaceWith(generateBtn.cloneNode(true)); // 移除舊的事件監聽器
        const newGenerateBtn = document.getElementById('project-detail-generate');
        newGenerateBtn.addEventListener('click', () => {
            generateProjectConcept(project);
        });
    }
}

async function generateProjectConcept(project) {
    const contentEl = document.getElementById('project-detail-content');
    const loaderEl = document.getElementById('project-detail-loader');
    const generateBtn = document.getElementById('project-detail-generate');

    // 顯示載入動畫
    generateBtn.style.display = 'none';
    loaderEl.classList.remove('hidden');
    loaderEl.style.display = 'flex';

    try {
        // 模擬 AI 生成內容（實際應用中這裡會調用真實的 AI API）
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockContent = `
            <h3 class="text-lg font-bold mb-4 text-gray-900">聲學設計理念</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
                ${project.name} 專案體現了現代聲學設計的精髓，將科學計算與藝術美感完美融合。
                我們深入分析了 ${project.category} 的特殊需求，創造出既實用又美觀的聲學環境。
            </p>
            <h4 class="text-md font-semibold mb-3 text-gray-800">核心設計要素</h4>
            <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>精密的聲學計算確保最佳音響效果</li>
                <li>創新材料應用提升隔音性能</li>
                <li>人性化設計考量使用者體驗</li>
                <li>環保永續的材料選擇</li>
            </ul>
            <p class="text-gray-700 leading-relaxed">
                透過專業的聲學模擬和現場測試，我們確保每個空間都能達到理想的聲學表現，
                為使用者創造舒適、高效的聽覺環境。
            </p>
        `;

        contentEl.innerHTML = mockContent;
    } catch (error) {
        contentEl.innerHTML = '<p class="text-red-600">生成內容時發生錯誤，請稍後再試。</p>';
    } finally {
        // 隱藏載入動畫
        loaderEl.style.display = 'none';
        loaderEl.classList.add('hidden');
        generateBtn.style.display = 'flex';
    }
}

function populateRelatedProjects(currentProject) {
    const relatedContainer = document.getElementById('related-projects');
    if (!relatedContainer) {
        return;
    }
    relatedContainer.innerHTML = '';

    // 找到其他專案（排除當前專案）
    const otherProjects = projectsData.filter(p => p.id !== currentProject.id);

    // 隨機選擇2個相關專案
    const relatedProjects = otherProjects.sort(() => 0.5 - Math.random()).slice(0, 2);

    relatedProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'group cursor-pointer';
        projectCard.innerHTML = `
            <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300">
                <img src="${project.image}" alt="${project.name}" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors">${project.name}</h3>
            <p class="text-gray-500 text-xs uppercase tracking-wider">${project.category}</p>
        `;

        projectCard.addEventListener('click', () => {
            navigateToRoute(`/project/${project.slug}`);
        });

        relatedContainer.appendChild(projectCard);
    });
}

// --- 輔助函數：確保專案元素存在 ---
function ensureProjectImageExists() {
    // 檢查是否已經有專案圖片元素
    if (!document.getElementById('project-detail-image')) {
        // 找到專案標題區域後面，專案資訊網格前面，插入圖片容器
        const projectHeader = document.querySelector('.px-6.py-8');
        if (projectHeader) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'px-6 mb-8';
            imageContainer.innerHTML = `
                <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img id="project-detail-image" src="" alt="" class="w-full h-full object-cover">
                </div>
            `;
            // 插入到專案標題後面
            projectHeader.parentNode.insertBefore(imageContainer, projectHeader.nextSibling);
        }
    }
}

function ensureRelatedProjectsExists() {
    // 檢查是否已經有相關專案容器
    if (!document.getElementById('related-projects')) {
        // 在專案規格後面添加相關專案容器
        const projectSpecs = document.querySelector('.px-6.mb-8');
        if (projectSpecs) {
            const relatedContainer = document.createElement('div');
            relatedContainer.className = 'px-6 pb-8';
            relatedContainer.innerHTML = `
                <h2 class="text-2xl font-bold mb-6">相關專案</h2>
                <div id="related-projects" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
            `;
            // 插入到最後
            const parentContainer = projectSpecs.parentNode;
            parentContainer.appendChild(relatedContainer);
        }
    }
}

// --- 浮動導航條相關函數 ---
function showFloatingNavBar(project) {
    const floatingNavBar = document.getElementById('floating-nav-bar');
    if (floatingNavBar) {
        floatingNavBar.classList.add('show');
        floatingNavBar.style.opacity = '1';
        floatingNavBar.style.visibility = 'visible';

        if (project) {
            document.getElementById('floating-current-project-title').textContent = project.name;
        }
    }
}

function hideFloatingNavBar() {
    const floatingNavBar = document.getElementById('floating-nav-bar');
    if (floatingNavBar) {
        floatingNavBar.classList.remove('show');
        floatingNavBar.style.opacity = '0';
        floatingNavBar.style.visibility = 'hidden';
    }
}

function initializeFloatingProjectSelector(currentProject) {
    const floatingProjectGrid = document.getElementById('floating-project-grid');
    floatingProjectGrid.innerHTML = '';

    projectsData.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = `project-selector-item p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            project.id === currentProject.id ? 'bg-white/20 current-project' : 'bg-white/10 hover:bg-white/20'
        }`;

        projectItem.innerHTML = `
            <div class="aspect-video bg-white/10 rounded mb-2 overflow-hidden">
                <img src="${project.image}" alt="${project.name}" class="w-full h-full object-cover opacity-80">
            </div>
            <h4 class="text-white text-xs font-medium mb-1">${project.name}</h4>
            <p class="text-white/60 text-xs">${project.category}</p>
        `;

        if (project.id !== currentProject.id) {
            projectItem.addEventListener('click', () => {
                navigateToRoute(`/project/${project.slug}`);
                hideFloatingProjectSelector();
            });
        }

        floatingProjectGrid.appendChild(projectItem);
    });
}

function hideFloatingProjectSelector() {
    const dropdown = document.getElementById('floating-project-selector-dropdown');
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'scale(0.95)';
}

// --- 主程式邏輯 ---
function init() {
    // 初始化頁面元素
    initializePages();

    createSoundwave();
    setupEventListeners();
    updateProjectInfo(activeIndex, true);

    // 嘗試初始化路由系統，但不讓錯誤影響其他功能
    try {
        initRouter(); // 初始化路由系統
    } catch (error) {
        console.warn('路由初始化失敗，但不影響主要功能:', error);
        // 確保主頁面顯示
        showHomePage();
    }

    // 多重保險機制確保點擊事件監聽器被正確設置
    setupBarClickListeners(); // 立即調用一次

    setTimeout(() => {
        setupBarClickListeners(); // 延遲調用確保DOM更新完成
    }, 39); // 加速1.7倍 (67/1.7)

    setTimeout(() => {
        setupBarClickListeners(); // 再次延遲調用作為備份
    }, 196); // 加速1.7倍 (333/1.7)

    startBarAnimation();

    // 啟動初次載入的2秒自動動畫計時器 - 確保在所有初始化完成後執行
    setTimeout(() => {
        scheduleInitialAutoAnimation();
    }, 59); // 延遲59ms確保所有初始化完成 (100/1.7)
}

// --- 聲波動畫相關函數 ---
function startBarAnimation() {
    const bars = document.querySelectorAll('.sound-bar');
    let startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        bars.forEach((bar, i) => {
            // 跳過已旋轉的bar（使用多重標記識別）
            if (bar.getAttribute('data-rotated') === 'true' ||
                bar.getAttribute('data-fixed-height') ||
                bar.getAttribute('data-no-animation') === 'true' ||
                bar.getAttribute('data-square') === 'true' ||
                bar.classList.contains('rotated-bar')) {
                return; // 完全跳過已旋轉/變形的bar，不做任何修改
            }

            // 其他bar繼續正常的sin波動畫
            const waveSpeed = 0.004; // 波動速度
            const waveLength = 2; // 波長：控制一個完整波形跨越多少個bar
            const timeOffset = elapsed * waveSpeed;

            // 計算每個bar在波形中的位置
            const positionInWave = (timeOffset + i * waveLength) % (Math.PI * 2);

            // 主要sin波（由左往右傳播）
            const mainWave = Math.sin(positionInWave);

            // 添加次要波動增加豐富度
            const secondaryWave = Math.sin(positionInWave * 1.5 + timeOffset * 0.7) * 0.4;
            const tertiaryWave = Math.sin(positionInWave * 0.6 + timeOffset * 1.3) * 0.2;

            // 組合波動
            const combinedWave = mainWave + secondaryWave + tertiaryWave;

            // 將sin波值(-1.6 到 1.6)映射到1-9倍
            // 標準化到0-1範圍
            const normalizedWave = (combinedWave + 1.6) / 3.2;

            // 映射到1-9倍
            const multiplier = 1 + normalizedWave * 8;

            // 計算高度：1倍=11.11%, 9倍=100%
            const height = multiplier * (100 / 9);

            // 確保高度在合理範圍內
            const finalHeight = Math.max(11, Math.min(100, height));

            // 保持水平位移（如果有的話），只更新高度
            const currentTransform = bar.style.transform;
            bar.style.height = `${finalHeight}%`;
            // 確保不覆蓋現有的translateX
            if (currentTransform && currentTransform.includes('translateX')) {
                bar.style.transform = currentTransform;
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}

function createSoundwave() {
    // 清理任何現有的專案圖片和標題
    cleanupProjectImages();
    cleanupProjectTitle();

    container.innerHTML = '';
    const totalBars = 7;
    for (let i = 0; i < totalBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('sound-bar');
        container.appendChild(bar);
    }
    // 重新設置bar點擊事件監聽器
    setupBarClickListeners();
}

function cleanupProjectImages() {
    // 清理所有專案圖片元素
    const existingImages = document.querySelectorAll('[data-project-image="true"]');
    existingImages.forEach(img => {
        // 移除事件監聽器
        if (img._clickHandler) {
            img.removeEventListener('click', img._clickHandler);
            img._clickHandler = null;
        }
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
    });

    // 清理所有專案文字元素
    const existingTexts = document.querySelectorAll('[data-project-text="true"]');
    existingTexts.forEach(text => {
        if (text.parentNode) {
            text.parentNode.removeChild(text);
        }
    });
}

function cleanupProjectTitle() {
    // 清理專案標題
    const existingTitles = document.querySelectorAll('[data-project-title="true"]');
    existingTitles.forEach(title => {
        if (title.parentNode) {
            title.parentNode.removeChild(title);
        }
    });

    // 清理專案類別
    const existingCategories = document.querySelectorAll('[data-project-category="true"]');
    existingCategories.forEach(category => {
        if (category.parentNode) {
            category.parentNode.removeChild(category);
        }
    });
}

// --- 專案資訊更新函數 ---
function updateProjectInfo(index, isInitial = false) {
    // 移除重複的清理邏輯，因為 navigate 函數已經處理了清理

    // 注意：不再在這裡重置方形bar，因為這個邏輯已經移到navigate函數中
    // 只有在初始化時才重置，避免重複重置
    if (isInitial) {
        resetSquareBars();
    }

    activeIndex = index;
    const project = projectsData[index];
    const bars = document.querySelectorAll('.sound-bar');

    // 只更新bar的顏色，不影響sin波動畫
    bars.forEach((bar, i) => {
        // 重置所有bar的顏色為半透明，清除邊框和陰影
        bar.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        bar.style.border = 'none';
        bar.style.boxShadow = 'none';

        // 如果是有編號的bar（第2-6個，索引1-5），檢查是否對應當前主題
        if (i >= 1 && i <= 5) {
            const projectIndex = i - 1; // Project A對應索引0，Project B對應索引1，以此類推
            if (projectIndex === index) {
                // 當前主題對應的bar變成純白色並加粗邊框
                bar.style.backgroundColor = 'rgb(255, 255, 255)';
                bar.style.border = '3px solid rgba(255, 255, 255, 0.9)';
                bar.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.3)'; // 微弱的白色發光
            }
        }
    });

    // 顯示當前專案的標題文字在中央上方
    showProjectTitle(index);

    // 原本的文字更新邏輯已移除，現在只有方形動畫時才會顯示專案名稱

    const bgColor = darkenColor(project.color, 0.4);
    gsap.to('body', { duration: 0.394, backgroundColor: bgColor, ease: "sine.inOut" }); // 加速1.7倍 (0.67/1.7)

    // 重新設置點擊事件，確保只有白色bar可點擊
    // 使用多重延遲確保DOM更新完成後再設置點擊事件
    setTimeout(() => {
        setupBarClickListeners();
    }, 100);

    setTimeout(() => {
        setupBarClickListeners();
    }, 118); // 加速1.7倍 (200/1.7)
}

function resetSquareBars() {
    const bars = document.querySelectorAll('.sound-bar');

    bars.forEach(bar => {
        // 檢查是否是已變成方形的bar
        if (bar.getAttribute('data-rotated') === 'true' ||
            bar.getAttribute('data-square') === 'true' ||
            bar.classList.contains('rotated-bar')) {

            // 移除所有方形相關的屬性和類別
            bar.removeAttribute('data-rotated');
            bar.removeAttribute('data-square');
            bar.removeAttribute('data-square-size');
            bar.removeAttribute('data-fixed-height');
            bar.removeAttribute('data-no-animation');
            bar.classList.remove('rotated-bar');

            // 重置所有樣式到原本的bar狀態
            bar.style.position = '';
            bar.style.left = '';
            bar.style.top = '';
            bar.style.transform = '';
            bar.style.transformOrigin = '';
            bar.style.width = '';
            bar.style.height = '';
            bar.style.borderRadius = '';
            bar.style.transition = '';
            bar.style.animation = '';
            bar.style.willChange = '';
            bar.style.zIndex = '';

            // 清理任何內部的圖片和文字元素
            const images = bar.querySelectorAll('[data-project-image="true"]');
            const categories = bar.querySelectorAll('[data-project-category="true"]');
            images.forEach(img => img.remove());
            categories.forEach(cat => cat.remove());
        }
    });

    // 重新啟動sin波動畫，確保所有bar都參與
    restartSinWaveAnimation();
}

function showProjectTitle(projectIndex) {
    // 先清理可能存在的標題
    cleanupProjectTitle();

    const project = projectsData[projectIndex];
    if (!project) return;

    const responsive = getResponsiveScale();

    // 計算響應式字體大小
    const baseFontSize = 3.4; // 基礎字體大小 (rem)
    const fontSize = baseFontSize * responsive.scale;

    const baseCategoryFontSize = 1.5; // 基礎類別字體大小 (rem)
    const categoryFontSize = baseCategoryFontSize * responsive.scale;

    // 計算響應式位置
    let topPosition;
    if (responsive.isSmallMobile) {
        topPosition = '25%'; // 小螢幕位置較低
    } else if (responsive.isMobile) {
        topPosition = '22%'; // 手機版位置
    } else {
        topPosition = '15%'; // 桌面版位置較高
    }

    // 創建標題元素
    const titleElement = document.createElement('div');
    titleElement.setAttribute('data-project-title', 'true');
    titleElement.setAttribute('data-project-index', projectIndex.toString());
    titleElement.style.position = 'fixed';
    titleElement.style.top = topPosition;
    titleElement.style.left = '50%';
    titleElement.style.transform = 'translateX(-50%)';
    titleElement.style.zIndex = '20';
    titleElement.style.pointerEvents = 'none';
    titleElement.style.textAlign = 'center';
    titleElement.style.fontSize = `${fontSize}rem`;
    titleElement.style.fontWeight = 'bold';
    titleElement.style.fontStyle = 'italic';
    titleElement.style.color = 'white';
    titleElement.style.opacity = '0';
    titleElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    titleElement.textContent = project.name;

    document.body.appendChild(titleElement);

    // 動畫顯示（移除類別元素創建，因為類別應該在 expandToSquare 中創建）
    setTimeout(() => {
        titleElement.style.opacity = '1';
        titleElement.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
}

function dropProjectTitleToSquare(projectIndex, squareSize, totalAnimationTime = 1569) { // 加速1.7倍 (2667/1.7)
    // 找到對應專案的標題元素
    const titleElement = document.querySelector(`[data-project-title="true"][data-project-index="${projectIndex}"]`);
    if (!titleElement) return;

    // 計算目標位置：方形上方 40px
    const targetTop = window.innerHeight/2 - squareSize/2 - 40;
    const currentTop = window.innerHeight * 0.15; // 目前在 15% 處
    const dropDistance = targetTop - currentTop; // 計算掉落距離

    // 延長動畫時間，讓標題有足夠時間模擬球體掉落反彈，直到「音樂廳聲學設計」文字完成動畫
    const dropTime = totalAnimationTime; // 總動畫時間（毫秒）

    // 使用 CSS 動畫來實現符合物理定律的球體掉落反彈效果
    const keyframes = `
        @keyframes ballDropBounce {
            0% {
                top: ${currentTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.9, 0, 1, 1);
            }
            /* 自由落體：s = 1/2 * g * t² - 從靜止開始快速加速掉落 */
            30% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            /* 第一次反彈：彈起到49%高度（恢復係數0.7²） */
            45% {
                top: ${targetTop - (targetTop - currentTop) * 0.49}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.75, 0, 1, 1);
            }
            /* 第一次反彈落下 */
            55% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            /* 第二次反彈：彈起到24%高度（恢復係數0.7⁴） */
            65% {
                top: ${targetTop - (targetTop - currentTop) * 0.24}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.75, 0, 1, 1);
            }
            /* 第二次反彈落下 */
            72% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            /* 第三次反彈：彈起到12%高度（恢復係數0.7⁶） */
            80% {
                top: ${targetTop - (targetTop - currentTop) * 0.12}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.75, 0, 1, 1);
            }
            /* 第三次反彈落下 */
            85% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            /* 第四次反彈：彈起到6%高度（恢復係數0.7⁸） */
            90% {
                top: ${targetTop - (targetTop - currentTop) * 0.06}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.75, 0, 1, 1);
            }
            /* 第四次反彈落下 */
            94% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            /* 最後微小震盪並穩定 */
            97% {
                top: ${targetTop - (targetTop - currentTop) * 0.02}px;
                transform: translate(-50%, -50%);
                animation-timing-function: ease-out;
            }
            99% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
                animation-timing-function: ease-out;
            }
            100% {
                top: ${targetTop}px;
                transform: translate(-50%, -50%);
            }
        }
    `;

    // 動態添加 keyframes 到頁面
    const styleSheet = document.createElement('style');
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);

    // 執行球體掉落反彈動畫
    titleElement.style.setProperty('animation', `ballDropBounce ${dropTime}ms ease-out forwards`, 'important');

    // 動畫完成後清理
    setTimeout(() => {
        titleElement.style.setProperty('animation', 'none', 'important');
        titleElement.style.setProperty('top', `${targetTop}px`, 'important');
        titleElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        titleElement.style.setProperty('transition', 'opacity 0.312s ease-out', 'important');
        // 清理動態添加的樣式
        document.head.removeChild(styleSheet);
    }, dropTime);
}

// --- 顏色處理函數 ---
function darkenColor(color, factor) {
    // 將十六進制顏色轉換為RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 降低亮度
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));

    // 轉換回十六進制
    return `rgb(${newR}, ${newG}, ${newB})`;
}

function lightenColor(color, factor) {
    // 將十六進制顏色轉換為RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 增加亮度
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));

    // 轉換回RGB格式
    return `rgb(${newR}, ${newG}, ${newB})`;
}

// --- 事件監聽器設置 ---
function setupEventListeners() {
    // 窗口調整大小事件
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('orientationchange', () => {
        setTimeout(onWindowResize, 59); // 延遲處理方向變化 (100/1.7)
    }, false);

    // 導航按鈕
    document.getElementById('prev-btn').addEventListener('click', () => {
        // 標記使用者已互動，清除初次載入計時器
        markUserInteraction();
        navigate(-1);
        // 按鈕點擊後啟動1.5秒延遲動畫
        scheduleAutoAnimation();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        // 標記使用者已互動，清除初次載入計時器
        markUserInteraction();
        navigate(1);
        // 按鈕點擊後啟動1.5秒延遲動畫
        scheduleAutoAnimation();
    });

    // 關於我頁面返回按鈕
    document.getElementById('about-home-btn').addEventListener('click', (e) => {
        e.preventDefault();
        navigateToRoute('/');
    });

    // 浮動導航條事件
    setupFloatingNavBarEvents();

    // TTS 功能
    setupTTSEvents();

    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
        if (currentRoute === '/') { // 只在主頁面啟用鍵盤導航
            if (e.key === 'ArrowLeft') {
                markUserInteraction();
                navigate(-1);
                scheduleAutoAnimation();
            }
            if (e.key === 'ArrowRight') {
                markUserInteraction();
                navigate(1);
                scheduleAutoAnimation();
            }
        }
    });

    // 滑鼠滾輪導航
    window.addEventListener('wheel', onWheelScroll, { passive: false });

    // 觸控手勢
    setupTouchEvents();

    // 滑鼠事件
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);

    // 觸控事件
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });
}

function setupFloatingNavBarEvents() {
    // 浮動專案選擇器按鈕
    document.getElementById('floating-project-selector-btn').addEventListener('click', () => {
        const dropdown = document.getElementById('floating-project-selector-dropdown');
        const isVisible = dropdown.style.opacity === '1';

        if (isVisible) {
            hideFloatingProjectSelector();
        } else {
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'scale(1)';
        }
    });

    // 浮動返回主頁按鈕
    document.getElementById('floating-back-to-home').addEventListener('click', () => {
        navigateToRoute('/');
    });

    // 點擊外部關閉下拉選單
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('floating-project-selector-dropdown');
        const button = document.getElementById('floating-project-selector-btn');

        if (!dropdown.contains(e.target) && !button.contains(e.target)) {
            hideFloatingProjectSelector();
        }
    });
}

function setupTTSEvents() {
    tts.button.addEventListener('click', () => {
        if (tts.isPlaying) {
            stopTTS();
        } else {
            startTTS();
        }
    });

    tts.audio.addEventListener('ended', () => {
        stopTTS();
    });
}

function setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
        if (currentRoute !== '/') return;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        hasUserInteracted = true;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging || currentRoute !== '/') return;
        e.preventDefault();
    });

    container.addEventListener('touchend', (e) => {
        if (!isDragging || currentRoute !== '/') return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // 確保是水平滑動且距離足夠
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                navigate(-1); // 向右滑動，顯示上一個
            } else {
                navigate(1); // 向左滑動，顯示下一個
            }
        }

        isDragging = false;
    });
}

// --- 導航功能 ---
// 移除簡化版的 navigate 函數，保留後面的完整版本

// --- Bar 點擊事件設置 ---
function setupBarClickListeners() {
    const bars = document.querySelectorAll('.sound-bar');

    bars.forEach((bar, index) => {
        // 移除現有的點擊監聽器（如果有的話）
        if (bar._clickHandler) {
            bar.removeEventListener('click', bar._clickHandler);
        }

        // 創建新的點擊處理函數
        const clickHandler = (e) => {
            e.stopPropagation();
            hasUserInteracted = true;

            // 清除自動動畫計時器
            if (autoAnimationTimeout) {
                clearTimeout(autoAnimationTimeout);
                autoAnimationTimeout = null;
            }
            if (initialLoadTimeout) {
                clearTimeout(initialLoadTimeout);
                initialLoadTimeout = null;
            }

            // 檢查是否已經是白色（可點擊狀態）
            const computedStyle = window.getComputedStyle(bar);
            const backgroundColor = computedStyle.backgroundColor;

            if (backgroundColor === 'rgb(255, 255, 255)' || backgroundColor === 'white') {
                // 白色bar被點擊，導航到專案詳情頁面
                const project = projectsData[activeIndex];
                if (project) {
                    navigateToRoute(`/project/${project.slug}`);
                }
            } else {
                // 非白色bar被點擊，執行中心動畫
                centerBarAtIndex(index);
            }
        };

        // 添加新的點擊監聽器
        bar.addEventListener('click', clickHandler);
        bar._clickHandler = clickHandler; // 保存引用以便後續移除
    });
}

function isBarWhite(bar) {
    const bgColor = window.getComputedStyle(bar).backgroundColor;
    // 只有純白色bar才可點擊：rgb(255, 255, 255) 或 rgba(255, 255, 255, 1)
    return bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgba(255, 255, 255, 1)';
}



// --- 專案圖片創建功能 ---
function createProjectImageInSquare(bar, project) {
    // 獲取bar的位置和尺寸
    const barRect = bar.getBoundingClientRect();

    // 創建圖片容器
    const imageContainer = document.createElement('div');
    imageContainer.setAttribute('data-project-image', 'true');
    imageContainer.style.position = 'fixed';
    imageContainer.style.left = `${barRect.left}px`;
    imageContainer.style.top = `${barRect.top}px`;
    imageContainer.style.width = `${barRect.width}px`;
    imageContainer.style.height = `${barRect.height}px`;
    imageContainer.style.zIndex = '25';
    imageContainer.style.pointerEvents = 'none';
    imageContainer.style.borderRadius = '999px';
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.opacity = '0';
    imageContainer.style.transform = 'scale(0.8)';
    imageContainer.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';

    // 創建圖片元素
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.filter = 'brightness(0.9) contrast(1.1)';

    imageContainer.appendChild(img);
    document.body.appendChild(imageContainer);

    // 動畫顯示圖片
    setTimeout(() => {
        imageContainer.style.opacity = '1';
        imageContainer.style.transform = 'scale(1)';
    }, 100);

    // 創建專案類別文字
    createProjectCategoryText(barRect, project);
}

function createProjectCategoryText(barRect, project) {
    const textElement = document.createElement('div');
    textElement.setAttribute('data-project-text', 'true');
    textElement.style.position = 'fixed';
    textElement.style.left = `${barRect.left + barRect.width + 20}px`;
    textElement.style.top = `${barRect.top + barRect.height / 2}px`;
    textElement.style.transform = 'translateY(-50%)';
    textElement.style.zIndex = '26';
    textElement.style.pointerEvents = 'none';
    textElement.style.opacity = '0';
    textElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
    textElement.innerHTML = `
        <p class="text-white/80 text-sm uppercase tracking-wider font-medium">${project.category}</p>
    `;

    document.body.appendChild(textElement);

    // 動畫顯示文字
    setTimeout(() => {
        textElement.style.opacity = '1';
        textElement.style.transform = 'translateY(-50%) translateX(10px)';
    }, 200);
}

// --- 自動動畫功能 ---
function scheduleAutoAnimation() {
    // 清除之前的計時器
    if (autoAnimationTimeout) {
        clearTimeout(autoAnimationTimeout);
    }

    // 設置0.882秒延遲 (1.5/1.7)
    autoAnimationTimeout = setTimeout(() => {
        // 找到當前的白bar索引（activeIndex對應的bar在索引activeIndex+1位置）
        const whiteBarIndex = activeIndex + 1;

        // 確保索引在有效範圍內（1-5對應專案0-4）
        if (whiteBarIndex >= 1 && whiteBarIndex <= 5 && !isAnimating) {
            centerBarAtIndex(whiteBarIndex);
        }
    }, 882); // 0.882秒延遲 (1.5/1.7)
}

function scheduleInitialAutoAnimation() {
    // 清除之前的初次載入計時器
    if (initialLoadTimeout) {
        clearTimeout(initialLoadTimeout);
    }

    console.log('Scheduling initial auto animation, hasUserInteracted:', hasUserInteracted, 'activeIndex:', activeIndex);

    // 設置1.176秒延遲 (2/1.7)，只在初次載入且使用者未互動時觸發
    initialLoadTimeout = setTimeout(() => {
        console.log('Initial auto animation timeout triggered, hasUserInteracted:', hasUserInteracted, 'activeIndex:', activeIndex, 'isAnimating:', isAnimating);
        // 只有在使用者未互動且當前在Project A（activeIndex = 0）時才觸發
        if (!hasUserInteracted && activeIndex === 0 && !isAnimating) {
            const whiteBarIndex = activeIndex + 1; // Project A對應的白bar索引為1
            console.log('Conditions met, executing centerBarAtIndex with whiteBarIndex:', whiteBarIndex);
            centerBarAtIndex(whiteBarIndex);
        } else {
            console.log('Conditions not met for initial animation:', {
                hasUserInteracted,
                activeIndex,
                isAnimating,
                expectedActiveIndex: 0
            });
        }
    }, 1176); // 1.176秒延遲 (2/1.7)
}

// 移除了不正確的 performAutoAnimation 和 performInitialAutoAnimation 函數
// 這些函數不存在於原版中，動畫邏輯應該通過 centerBarAtIndex 觸發

// --- TTS 功能 ---
function startTTS() {
    const textContent = `
        建築聲學設計，融合科學與藝術的熱情。我是一位專注於聲學環境設計的專業顧問，相信每個空間都有其獨特的「聲音」等待被發現與塑造。
        畢業於建築聲學相關領域，專精於空間聲學設計、噪音控制與音響系統整合。我熱愛探索聲音與空間的關係，致力於為每個專案創造最適合的聽覺環境。
    `;

    // 使用 Web Speech API
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.lang = 'zh-TW';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => {
            tts.isPlaying = true;
            tts.buttonText.textContent = '⏸️ 暫停播放';
            tts.playIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />';
        };

        utterance.onend = () => {
            stopTTS();
        };

        speechSynthesis.speak(utterance);
    } else {
        alert('您的瀏覽器不支援語音合成功能');
    }
}

function stopTTS() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }

    tts.isPlaying = false;
    tts.buttonText.textContent = '✨ 聽聽我的故事';
    tts.playIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
}

// --- 更多核心功能 ---
function createProjectImageInSquare(squareBar, project) {
    // 獲取方形的大小
    const squareSize = parseInt(squareBar.getAttribute('data-square-size')) || 240;
    const borderRadius = squareSize * 0.1;

    // 創建圖片容器
    const imageContainer = document.createElement('div');
    imageContainer.setAttribute('data-project-image', 'true');
    imageContainer.style.position = 'absolute';
    imageContainer.style.top = '50%';
    imageContainer.style.left = '50%';
    imageContainer.style.transform = 'translate(-50%, -50%)';
    imageContainer.style.width = `${squareSize * 0.8}px`;
    imageContainer.style.height = `${squareSize * 0.8}px`;
    imageContainer.style.borderRadius = `${borderRadius}px`;
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.zIndex = '25';
    imageContainer.style.pointerEvents = 'none';
    imageContainer.style.opacity = '0';
    imageContainer.style.transition = 'opacity 0.4s ease';

    // 創建圖片元素
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transform = 'rotate(-90deg)';

    imageContainer.appendChild(img);
    squareBar.appendChild(imageContainer);

    // 動畫顯示圖片
    setTimeout(() => {
        imageContainer.style.opacity = '1';
    }, 100);

    // 移除重複的 categoryElement 創建，因為在後面已經有正確的版本
}

async function centerBarAtIndex(index) {
    console.log('centerBarAtIndex called with index:', index, 'isAnimating:', isAnimating);

    if (isAnimating) {
        console.log('Animation already in progress, returning');
        return;
    }

    // 設置動畫狀態，防止重複點擊
    isAnimating = true;
    console.log('Starting centerBarAtIndex animation');

    const bars = document.querySelectorAll('.sound-bar');
    const totalBars = bars.length;
    const centerIndex = Math.floor(totalBars / 2); // 中心位置索引 (第3個bar，索引為3)

    console.log('Total bars:', totalBars, 'Center index:', centerIndex, 'Target index:', index);

    // 通過逐步交換位置來移動白色bar到中心
    await swapBarToCenter(index, centerIndex);

    // 重置container位置到中心
    containerOffset.x = 0;
    container.style.transform = `translate(-50%, -50%)`;

    // 白色bar到達中心後的特殊動畫
    // 標題掉落動畫現在在 performCenterAnimation 中的適當時機觸發
    console.log('About to call performCenterAnimation');
    await performCenterAnimation();
    console.log('performCenterAnimation completed');

    // 動畫完成，重置狀態
    isAnimating = false;
    console.log('centerBarAtIndex animation completed');

    // 不改變activeIndex，只交換bar位置
}

async function swapBarToCenter(fromIndex, centerIndex) {
    console.log('swapBarToCenter called:', fromIndex, '->', centerIndex);

    if (fromIndex === centerIndex) {
        console.log('Already at center, no swap needed');
        return;
    }

    const container = document.getElementById('soundwave-container');
    const bars = Array.from(container.children);
    console.log('Found', bars.length, 'bars for swapping');

    // 決定移動方向
    const direction = fromIndex < centerIndex ? 1 : -1;
    let currentIndex = fromIndex;
    console.log('Moving direction:', direction);

    // 逐步交換到中心
    while (currentIndex !== centerIndex) {
        const nextIndex = currentIndex + direction;
        console.log('Swapping bar at index', currentIndex, 'with', nextIndex);

        // 執行交換動畫
        await animateSwap(bars, currentIndex, nextIndex);

        // 實際交換DOM元素
        swapBars(bars, currentIndex, nextIndex);

        currentIndex = nextIndex;
    }

    console.log('swapBarToCenter completed');

    // 確保清除任何殘留的transform
    bars.forEach(bar => {
        // 確保清除任何殘留的transform
        bar.style.transform = '';
    });

    // 重新設置點擊事件監聽器
    setupBarClickListeners();
}

function swapBars(barsArray, index1, index2) {
    const container = document.getElementById('soundwave-container');
    const bar1 = barsArray[index1];
    const bar2 = barsArray[index2];

    // 創建臨時標記元素
    const temp = document.createElement('div');

    // 插入臨時元素到bar1之前
    container.insertBefore(temp, bar1);

    // 將bar1插入到bar2之前
    container.insertBefore(bar1, bar2);

    // 將bar2插入到臨時元素位置
    container.insertBefore(bar2, temp);

    // 移除臨時元素
    container.removeChild(temp);

    // 更新數組中的位置
    [barsArray[index1], barsArray[index2]] = [barsArray[index2], barsArray[index1]];
}

// 移除重複的 swapBars 函數，保留第一個版本（有數組更新）

async function animateSwap(bars, index1, index2) {
    const bar1 = bars[index1];
    const bar2 = bars[index2];
    const duration = 196; // 加速1.7倍 (333/1.7)

    return new Promise((resolve) => {
        // 動態計算實際的移動距離
        const bar1Rect = bar1.getBoundingClientRect();
        const bar2Rect = bar2.getBoundingClientRect();

        // 計算兩個bar中心點之間的距離
        const bar1Center = bar1Rect.left + bar1Rect.width / 2;
        const bar2Center = bar2Rect.left + bar2Rect.width / 2;
        const actualDistance = Math.abs(bar2Center - bar1Center);

        // 設置統一的動畫參數
        const easing = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; // 更流暢的緩動函數
        bar1.style.transition = `transform ${duration}ms ${easing}`;
        bar2.style.transition = `transform ${duration}ms ${easing}`;

        // 確保動畫開始前清除任何現有的transform
        bar1.style.transform = '';
        bar2.style.transform = '';

        // 強制重繪以確保清除生效
        bar1.offsetHeight;
        bar2.offsetHeight;

        // 執行移動動畫
        if (index1 < index2) {
            // bar1向右移動，bar2向左移動
            bar1.style.transform = `translateX(${actualDistance}px)`;
            bar2.style.transform = `translateX(-${actualDistance}px)`;
        } else {
            // bar1向左移動，bar2向右移動
            bar1.style.transform = `translateX(-${actualDistance}px)`;
            bar2.style.transform = `translateX(${actualDistance}px)`;
        }

        // 動畫完成後清理
        setTimeout(() => {
            bar1.style.transition = '';
            bar2.style.transition = '';
            bar1.style.transform = '';
            bar2.style.transform = '';
            resolve();
        }, duration);
    });
}

async function performCenterAnimation() {
    const container = document.getElementById('soundwave-container');
    const bars = Array.from(container.children);

    // 找到白色bar，而不是假設它在中心位置
    let centerBar = null;
    let centerIndex = -1;

    for (let i = 0; i < bars.length; i++) {
        if (isBarWhite(bars[i])) {
            centerBar = bars[i];
            centerIndex = i;
            break;
        }
    }

    console.log('Found white bar at index:', centerIndex);

    // 如果沒有找到白色bar，返回
    if (!centerBar) {
        console.log('No white bar found, skipping animation');
        return;
    }

    // 使用固定的基準長度：2倍的基準高度
    const baseHeight = 120; // 1倍基準高度
    const targetHeight = baseHeight * 2; // 2倍長度 = 240px

    // 移除錯誤的重置邏輯，避免bar亂噴
    // 不要重置已經散開的bar的位置，讓 spreadSideBars 函數處理位置調整

    // 第一階段：左右bar讓開足夠空間，避免碰撞
    await spreadSideBars(targetHeight);

    // 第二階段：中心bar變成2倍長度並停止伸縮
    // 同時啟動標題掉落動畫（所有專案都有此效果）
    const expandPromise = expandCenterBar(centerBar, targetHeight);

    // 在 bar 開始變長的同時啟動標題掉落動畫
    // 使用響應式縮放系統計算正方形大小
    const responsive = getResponsiveScale();
    let squareSize;
    if (responsive.isSmallMobile) {
        squareSize = 180; // 小螢幕適中大小
    } else if (responsive.isMobile) {
        squareSize = 200; // 手機版適中大小
    } else {
        squareSize = 240; // 桌面版原始大小
    }
    dropProjectTitleToSquare(activeIndex, squareSize, 1600); // 所有專案都有標題掉落動畫

    await expandPromise;

    // 第三階段：中心bar旋轉90度
    await rotateCenterBar(centerBar);

    // 第四階段：旋轉後的bar向上向下延伸變成正方形
    // 注意：在此階段不要重新調整其他bar的位置
    await expandToSquare(centerBar, targetHeight);

    // 最終標記
    centerBar.setAttribute('data-rotated', 'true');
    centerBar.classList.add('rotated-bar');
}

async function spreadSideBars(targetHeight) {
    const container = document.getElementById('soundwave-container');
    const bars = Array.from(container.children);
    const centerIndex = Math.floor(bars.length / 2);

    return new Promise((resolve) => {
        const duration = 235; // 加速1.7倍 (400/1.7)

        // 使用響應式縮放系統
        const responsive = getResponsiveScale();

        // 計算需要的安全距離：考慮最終正方形的尺寸
        const rotatedBarHalfLength = targetHeight / 2;
        let safetyMargin;
        if (responsive.isSmallMobile) {
            safetyMargin = 2; // 小螢幕最小邊距
        } else if (responsive.isMobile) {
            safetyMargin = 2; // 手機版最小邊距
        } else {
            safetyMargin = 15; // 桌面版增加邊距，避免重疊
        }
        const minDistance = rotatedBarHalfLength + safetyMargin;

        // 響應式基礎距離 - 手機版極度縮短距離
        let baseDistanceMultiplier;
        if (responsive.isSmallMobile) {
            baseDistanceMultiplier = 12; // 小螢幕極度縮短
        } else if (responsive.isMobile) {
            baseDistanceMultiplier = 14; // 手機版極度縮短
        } else {
            baseDistanceMultiplier = 35; // 桌面版原始距離
        }

        // 計算螢幕可用寬度限制
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const screenWidth = window.innerWidth;

        // 動態計算最大允許距離，確保不超出螢幕
        const baseBuffer = 60;
        const buffer = baseBuffer * responsive.scale;
        const maxAllowedDistance = Math.min(
            (containerWidth / 2) - buffer,
            (screenWidth / 2) - buffer * 1.2 // 額外20%緩衝
        );

        bars.forEach((bar, index) => {
            if (index === centerIndex) return; // 跳過中心bar

            bar.style.transition = `transform ${duration}ms ease-out`;

            if (index < centerIndex) {
                // 左邊的bar向左移動
                const baseDistance = (centerIndex - index) * baseDistanceMultiplier;
                let distance = Math.max(baseDistance, minDistance);
                // 限制最大移動距離，防止超出螢幕
                distance = Math.min(distance, maxAllowedDistance);
                bar.style.transform = `translateX(-${distance}px)`;
            } else {
                // 右邊的bar向右移動
                const baseDistance = (index - centerIndex) * baseDistanceMultiplier;
                let distance = Math.max(baseDistance, minDistance);
                // 限制最大移動距離，防止超出螢幕
                distance = Math.min(distance, maxAllowedDistance);
                bar.style.transform = `translateX(${distance}px)`;
            }
        });

        // 清理transition，但保持transform位置
        setTimeout(() => {
            bars.forEach((bar, index) => {
                if (index === centerIndex) return; // 跳過中心bar
                bar.style.transition = '';
                // 不清除transform，保持讓開的位置
            });
            resolve();
        }, duration);
    });
}

async function expandCenterBar(centerBar, targetHeight) {
    return new Promise((resolve) => {
        const duration = 235; // 加速1.7倍 (400/1.7)

        // 設置動畫
        centerBar.style.transition = `height ${duration}ms ease-out`;

        // 變成2倍長度
        centerBar.style.height = `${targetHeight}px`;

        // 動畫完成後，立即停止伸縮動畫
        setTimeout(() => {
            // 完全禁用所有動畫相關屬性
            centerBar.style.transition = 'none !important';
            centerBar.style.animation = 'none !important';
            centerBar.style.willChange = 'auto';

            // 強制固定高度
            centerBar.style.height = `${targetHeight}px`;

            // 添加標記，停止參與sin波動畫
            centerBar.setAttribute('data-no-animation', 'true');
            centerBar.setAttribute('data-fixed-height', targetHeight.toString());

            // 重新啟動sin波動畫，但排除這個bar
            restartSinWaveAnimation();

            resolve();
        }, duration);
    });
}

async function rotateCenterBar(centerBar) {
    return new Promise((resolve) => {
        const duration = 209; // 加速1.7倍 (355/1.7)

        // 保存當前高度，確保不被改變
        const currentHeight = centerBar.style.height;

        // 設置旋轉動畫（只影響transform）
        centerBar.style.transition = `transform ${duration}ms ease-out`;
        centerBar.style.transformOrigin = 'center center';

        // 旋轉90度
        centerBar.style.transform = 'rotate(90deg)';

        // 動畫完成後清理transition並確保高度不變
        setTimeout(() => {
            centerBar.style.transition = 'none !important';
            centerBar.style.height = currentHeight; // 確保高度不變
            resolve();
        }, duration);
    });
}

async function expandToSquare(centerBar, currentLength) {
    return new Promise((resolve) => {
        const duration = 314; // 加速1.7倍 (533/1.7)

        // 使用響應式縮放系統計算正方形大小
        const responsive = getResponsiveScale();
        let squareSize;
        if (responsive.isSmallMobile) {
            squareSize = 180; // 小螢幕適中大小
        } else if (responsive.isMobile) {
            squareSize = 200; // 手機版適中大小
        } else {
            squareSize = 240; // 桌面版原始大小
        }

        // 設置適當的圓角半徑，讓它看起來像有圓角的方形而不是圓形
        const borderRadius = Math.min(squareSize * 0.1, 24); // 10%的圓角，最大24px

        console.log('開始正方形動畫 - 立即切換絕對定位避免推開其他bar');

        // 最終解決方案：立即切換到絕對定位，完全脫離flexbox
        // 這樣白色bar的變化就不會影響其他bar

        // 1. 立即切換到絕對定位，保持當前位置
        centerBar.style.setProperty('position', 'absolute', 'important');
        centerBar.style.setProperty('left', '50%', 'important');
        centerBar.style.setProperty('top', '50%', 'important');
        centerBar.style.setProperty('transform', 'translate(-50%, -50%) rotate(90deg)', 'important');
        centerBar.style.setProperty('transform-origin', 'center center', 'important');
        centerBar.style.setProperty('z-index', '10', 'important');

        // 2. 移除所有可能影響佈局的屬性
        centerBar.style.setProperty('margin', '0', 'important');
        centerBar.style.setProperty('padding', '0', 'important');
        centerBar.style.setProperty('border', 'none', 'important');
        centerBar.style.setProperty('box-sizing', 'border-box', 'important');

        // 3. 設置transition，只動畫寬度和圓角
        centerBar.style.setProperty('transition', `width ${duration}ms ease-out, border-radius ${duration}ms ease-out`, 'important');

        // 4. 直接增加寬度變成正方形
        centerBar.style.setProperty('width', `${squareSize}px`, 'important');

        // 5. 調整圓角
        centerBar.style.setProperty('border-radius', `${borderRadius}px`, 'important');

        // 創建專案圖片和類別文字
        createProjectImageAndCategory(centerBar, squareSize, borderRadius, duration);

        // 動畫完成後清理transition
        setTimeout(() => {
            centerBar.style.setProperty('transition', 'none', 'important');

            // 確保保持最終狀態
            centerBar.style.setProperty('width', `${squareSize}px`, 'important');
            centerBar.style.setProperty('height', `${squareSize}px`, 'important');
            centerBar.style.setProperty('border-radius', `${borderRadius}px`, 'important');
            centerBar.style.setProperty('transform', 'translate(-50%, -50%) rotate(90deg)', 'important');
            centerBar.style.setProperty('transform-origin', 'center center', 'important');
            centerBar.style.setProperty('position', 'absolute', 'important');
            centerBar.style.setProperty('left', '50%', 'important');
            centerBar.style.setProperty('top', '50%', 'important');
            centerBar.style.setProperty('z-index', '10', 'important');

            centerBar.setAttribute('data-square', 'true');
            centerBar.setAttribute('data-square-size', squareSize.toString());

            console.log('正方形動畫完成 - Checkpoint 26方法，其他bar已鎖定');
            resolve();
        }, duration);
    });
}

function createProjectImageAndCategory(centerBar, squareSize, borderRadius, duration) {
    // 獲取當前專案的資料
    const currentProject = projectsData[activeIndex];
    if (!currentProject) return;

    const responsive = getResponsiveScale();

    // 創建圖片元素
    const imageElement = document.createElement('img');
    imageElement.src = currentProject.image;
    imageElement.style.setProperty('position', 'absolute', 'important');
    imageElement.style.setProperty('top', '50%', 'important');
    imageElement.style.setProperty('left', '50%', 'important');
    imageElement.style.setProperty('transform', 'translate(-50%, -50%) rotate(-90deg)', 'important');
    imageElement.style.setProperty('width', '80%', 'important');
    imageElement.style.setProperty('height', '80%', 'important');
    imageElement.style.setProperty('object-fit', 'cover', 'important');
    imageElement.style.setProperty('border-radius', `${borderRadius * 0.8}px`, 'important');
    imageElement.style.setProperty('opacity', '0', 'important');
    imageElement.style.setProperty('z-index', '11', 'important');
    imageElement.style.setProperty('transition', `opacity ${duration * 0.6}ms ease-out`, 'important');
    imageElement.style.setProperty('cursor', 'pointer', 'important');
    imageElement.setAttribute('data-project-image', 'true');

    // 添加點擊事件，導航到專案詳情頁面
    const imageClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Project image clicked (animateToSquare):', currentProject.slug);
        navigateToRoute(`/project/${currentProject.slug}`);
    };
    imageElement._clickHandler = imageClickHandler;
    imageElement.addEventListener('click', imageClickHandler);

    // 創建類別文字元素
    const categoryElement = document.createElement('div');
    categoryElement.textContent = currentProject.category;
    categoryElement.style.setProperty('position', 'fixed', 'important'); // 使用 fixed 定位相對於視窗
    categoryElement.style.setProperty('left', '50%', 'important');
    categoryElement.style.setProperty('top', `${window.innerHeight/2 + squareSize/2 + 10}px`, 'important'); // 在方形下方10px
    categoryElement.style.setProperty('transform', 'translate(-50%, 0) rotateX(90deg)', 'important'); // 從下方翻轉上來
    categoryElement.style.setProperty('transform-origin', 'center center', 'important'); // 中心旋轉軸

    // 使用響應式縮放系統
    const baseCategoryFontSize = 1.5; // 基準字體大小 (rem)
    const categoryFontSize = `${baseCategoryFontSize * responsive.scale}rem`;

    categoryElement.style.setProperty('font-size', categoryFontSize, 'important');
    categoryElement.style.setProperty('font-weight', '400', 'important'); // 正常字重
    categoryElement.style.setProperty('color', 'rgba(255, 255, 255, 0.8)', 'important'); // 稍微透明的白色
    categoryElement.style.setProperty('text-shadow', 'none', 'important'); // 無陰影效果
    categoryElement.style.setProperty('white-space', 'nowrap', 'important');
    categoryElement.style.setProperty('opacity', '0', 'important');
    categoryElement.style.setProperty('z-index', '12', 'important');
    categoryElement.style.setProperty('perspective', '1000px', 'important'); // 添加透視效果
    categoryElement.style.setProperty('transform-style', 'preserve-3d', 'important'); // 保持3D效果
    categoryElement.style.setProperty('transition', `opacity ${duration * 0.6}ms ease-out, transform ${duration * 0.6}ms ease-out`, 'important');
    categoryElement.setAttribute('data-project-category', 'true');

    // 將元素添加到DOM
    centerBar.appendChild(imageElement);
    document.body.appendChild(categoryElement);

    // 延遲顯示圖片和類別文字
    setTimeout(() => {
        if (imageElement.parentNode) {
            imageElement.style.setProperty('opacity', '1', 'important');
        }
    }, duration * 0.4);

    setTimeout(() => {
        if (categoryElement.parentNode) {
            categoryElement.style.setProperty('opacity', '1', 'important');
            categoryElement.style.setProperty('transform', 'translate(-50%, 0) rotateX(0deg)', 'important');
        }
    }, duration * 0.6);
}

async function finalizeCenterBar(targetHeight) {
    return new Promise((resolve) => {
        const container = document.getElementById('soundwave-container');
        const bars = Array.from(container.children);
        const centerIndex = Math.floor(bars.length / 2);
        const centerBar = bars[centerIndex];

        if (centerBar) {
            // 確保中心bar保持正方形狀態
            centerBar.setAttribute('data-rotated', 'true');
            centerBar.setAttribute('data-no-animation', 'true');
        }

        // 更新專案資訊
        updateProjectInfo(activeIndex);

        setTimeout(resolve, 100);
    });
}

function markUserInteraction() {
    // 標記使用者已經互動
    hasUserInteracted = true;

    // 清除自動動畫計時器
    if (autoAnimationTimeout) {
        clearTimeout(autoAnimationTimeout);
        autoAnimationTimeout = null;
    }
    if (initialLoadTimeout) {
        clearTimeout(initialLoadTimeout);
        initialLoadTimeout = null;
    }
}

async function navigate(direction) {
    if (isAnimating) return; // 防止在動畫進行中切換

    const newIndex = (activeIndex + direction + projectsData.length) % projectsData.length;

    // 總是清理舊的專案標題和圖片，避免累積
    cleanupProjectImages();
    cleanupProjectTitle();

    // 檢查當前是否有on stage的主題（已變成方形的bar）
    const currentSquareBar = document.querySelector('.sound-bar[data-rotated="true"], .sound-bar[data-square="true"], .sound-bar.rotated-bar');

    if (currentSquareBar) {
        // 如果有on stage的主題，先讓它恢復到初始狀態
        isAnimating = true;
        await resetCurrentStageToInitial();
        isAnimating = false;
    }

    // 然後切換到新主題
    updateProjectInfo(newIndex);
}

async function resetCurrentStageToInitial() {
    return new Promise((resolve) => {
        const bars = document.querySelectorAll('.sound-bar');
        let hasSquareBar = false;

        bars.forEach((bar, index) => {
            // 檢查是否是已變成方形的bar
            if (bar.getAttribute('data-rotated') === 'true' ||
                bar.getAttribute('data-square') === 'true' ||
                bar.classList.contains('rotated-bar')) {

                hasSquareBar = true;

                // 添加恢復動畫的transition
                bar.style.transition = 'all 235ms ease-in-out'; // 加速1.7倍 (400/1.7)

                // 移除所有方形相關的屬性和類別
                bar.removeAttribute('data-rotated');
                bar.removeAttribute('data-square');
                bar.removeAttribute('data-square-size');
                bar.removeAttribute('data-fixed-height');
                bar.removeAttribute('data-no-animation');
                bar.classList.remove('rotated-bar');

                // 重置所有樣式到原本的bar狀態
                bar.style.position = '';
                bar.style.left = '';
                bar.style.top = '';
                bar.style.transform = '';
                bar.style.transformOrigin = '';
                bar.style.width = '';
                bar.style.height = '';
                bar.style.borderRadius = '';
                bar.style.animation = '';
                bar.style.willChange = '';
                bar.style.zIndex = '';

                // 清理任何內部的圖片和文字元素
                const images = bar.querySelectorAll('[data-project-image="true"]');
                const categories = bar.querySelectorAll('[data-project-category="true"]');
                images.forEach(img => img.remove());
                categories.forEach(cat => cat.remove());
            } else {
                // 對於其他bar，使用動畫回到原位
                const currentTransform = bar.style.transform;
                if (currentTransform && (currentTransform.includes('translateX') || currentTransform !== '')) {
                    hasSquareBar = true; // 標記需要等待動畫

                    // 使用動畫回到原位，確保視覺效果流暢
                    bar.style.transition = 'transform 235ms ease-in-out'; // 加速1.7倍 (400/1.7)
                    bar.style.transform = '';

                    // 確保在動畫完成後清除transition
                    setTimeout(() => {
                        bar.style.transition = '';
                    }, 400);
                }
            }
        });

        // 清理專案圖片和標題
        cleanupProjectImages();
        cleanupProjectTitle();

        if (hasSquareBar) {
            // 等待恢復動畫完成
            setTimeout(() => {
                // 清除transition，避免影響後續動畫
                bars.forEach(bar => {
                    bar.style.transition = '';
                });

                // 重新啟動sin波動畫，確保所有bar都參與
                restartSinWaveAnimation();

                resolve();
            }, 400); // 與transition時間一致
        } else {
            // 如果沒有方形bar，立即resolve
            resolve();
        }
    });
}

function restartSinWaveAnimation() {
    // 停止當前動畫循環（如果存在）
    if (window.animationId) {
        cancelAnimationFrame(window.animationId);
    }

    // 重新啟動sin波動畫，使用與原本相同的機制
    const bars = document.querySelectorAll('.sound-bar');
    let startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        bars.forEach((bar, i) => {
            // 跳過已旋轉的bar（使用多重標記識別）
            if (bar.getAttribute('data-rotated') === 'true' ||
                bar.getAttribute('data-fixed-height') ||
                bar.getAttribute('data-no-animation') === 'true' ||
                bar.getAttribute('data-square') === 'true' ||
                bar.classList.contains('rotated-bar')) {
                return; // 完全跳過已旋轉/變形的bar，不做任何修改
            }

            // 其他bar繼續正常的sin波動畫
            const waveSpeed = 0.004; // 波動速度
            const waveLength = 2; // 波長：控制一個完整波形跨越多少個bar
            const timeOffset = elapsed * waveSpeed;

            // 計算每個bar在波形中的位置
            const positionInWave = (timeOffset + i * waveLength) % (Math.PI * 2);

            // 主要sin波（由左往右傳播）
            const mainWave = Math.sin(positionInWave);

            // 添加次要波動增加豐富度
            const secondaryWave = Math.sin(positionInWave * 1.5 + timeOffset * 0.7) * 0.4;
            const tertiaryWave = Math.sin(positionInWave * 0.6 + timeOffset * 1.3) * 0.2;

            // 組合波動
            const combinedWave = mainWave + secondaryWave + tertiaryWave;

            // 將sin波值(-1.6 到 1.6)映射到1-9倍
            // 標準化到0-1範圍
            const normalizedWave = (combinedWave + 1.6) / 3.2;

            // 映射到1-9倍
            const multiplier = 1 + normalizedWave * 8;

            // 計算高度：1倍=11.11%, 9倍=100%
            const height = multiplier * (100 / 9);

            // 確保高度在合理範圍內
            const finalHeight = Math.max(11, Math.min(100, height));

            // 保持水平位移（如果有的話），只更新高度
            const currentTransform = bar.style.transform;
            bar.style.height = `${finalHeight}%`;
            // 確保不覆蓋現有的translateX
            if (currentTransform && currentTransform.includes('translateX')) {
                bar.style.transform = currentTransform;
            }
        });

        window.animationId = requestAnimationFrame(animate);
    }

    animate();
}

function onWheelScroll(event) {
    // 如果專案詳情頁面或關於我頁面正在顯示，禁用滾動切換
    if (pages.projectDetail.classList.contains('active') || pages.about.classList.contains('active')) {
        return; // 不阻止事件，讓頁面內容可以滾動
    }

    event.preventDefault();
    if (isAnimating) return;

    // 標記使用者已互動，清除初次載入計時器
    markUserInteraction();

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        const direction = Math.sign(event.deltaY);
        navigate(direction);
        // 滾輪操作後啟動1.5秒延遲動畫
        scheduleAutoAnimation();
    }, 33);
}

function onWindowResize() {
    // 處理3D相關的resize（如果存在）
    if (typeof camera !== 'undefined' && typeof renderer !== 'undefined') {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 重新計算響應式縮放
    const responsive = getResponsiveScale();

    // 重新計算並限制bar的移動距離，防止超出螢幕
    const bars = document.querySelectorAll('.sound-bar');
    bars.forEach(bar => {
        const transform = bar.style.transform;
        if (transform && transform.includes('translateX')) {
            // 重新計算安全的移動距離
            const containerRect = container.getBoundingClientRect();
            const maxDistance = (containerRect.width / 2) - 60;

            // 如果當前移動距離超過安全範圍，調整它
            const match = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
            if (match) {
                const currentDistance = Math.abs(parseFloat(match[1]));
                if (currentDistance > maxDistance) {
                    const direction = parseFloat(match[1]) < 0 ? -1 : 1;
                    const newDistance = Math.min(currentDistance, maxDistance);
                    bar.style.transform = transform.replace(
                        /translateX\((-?\d+(?:\.\d+)?)px\)/,
                        `translateX(${direction * newDistance}px)`
                    );
                }
            }
        }
    });

    // 重新調整標題文字的響應式大小
    const titleElements = document.querySelectorAll('[data-project-title="true"]');
    titleElements.forEach(titleElement => {
        const responsive = getResponsiveScale();
        const baseFontSize = 3.4;
        const fontSize = `${baseFontSize * responsive.scale}rem`;

        titleElement.style.setProperty('font-size', fontSize, 'important');

        // 同時調整位置
        let topPosition;
        if (responsive.isSmallMobile) {
            topPosition = '25%';
        } else if (responsive.isMobile) {
            topPosition = '22%';
        } else {
            topPosition = '15%';
        }
        titleElement.style.setProperty('top', topPosition, 'important');
    });

    // 重新調整類別文字的響應式大小
    const categoryElements = document.querySelectorAll('[data-project-category="true"]');
    categoryElements.forEach(categoryElement => {
        const responsive = getResponsiveScale();
        const baseCategoryFontSize = 1.5;
        const categoryFontSize = `${baseCategoryFontSize * responsive.scale}rem`;

        categoryElement.style.setProperty('font-size', categoryFontSize, 'important');
    });

    // 重新調整正方形的大小（如果存在）
    const squareBars = document.querySelectorAll('.sound-bar[data-square="true"]');
    squareBars.forEach(squareBar => {
        const responsive = getResponsiveScale();
        let newSquareSize;
        if (responsive.isSmallMobile) {
            newSquareSize = 180; // 小螢幕適中大小
        } else if (responsive.isMobile) {
            newSquareSize = 200; // 手機版適中大小
        } else {
            newSquareSize = 240; // 桌面版原始大小
        }

        squareBar.style.setProperty('width', `${newSquareSize}px`, 'important');
        squareBar.style.setProperty('height', `${newSquareSize}px`, 'important');
        squareBar.setAttribute('data-square-size', newSquareSize.toString());

        // 重新調整圓角
        const borderRadius = Math.min(newSquareSize * 0.1, 24);
        squareBar.style.setProperty('border-radius', `${borderRadius}px`, 'important');

        // 重新定位類別文字
        const categoryElement = document.querySelector('[data-project-category="true"]');
        if (categoryElement) {
            categoryElement.style.setProperty('top', `${window.innerHeight/2 + newSquareSize/2 + 10}px`, 'important');
        }
    });
}

// --- 滑鼠和觸控事件處理 ---
function onMouseDown(event) {
    if (isAnimating) return;
    dragInfo.isDragging = true;
    dragInfo.startX = event.clientX;
    markUserInteraction();
}

function onMouseMove(event) {
     if (!dragInfo.isDragging || isAnimating) return;
}

function onMouseUp(event) {
    if (!dragInfo.isDragging || isAnimating) return;
    dragInfo.isDragging = false;

    const deltaX = event.clientX - dragInfo.startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
        markUserInteraction();
        if (deltaX > 0) navigate(-1);
        else navigate(1);
        scheduleAutoAnimation();
    }
}

function onTouchStart(event) {
    if (isAnimating) return;
    if (event.touches.length === 1) {
        dragInfo.isDragging = true;
        dragInfo.startX = event.touches[0].clientX;
        markUserInteraction();
    }
}

function onTouchMove(event) {
    if (!dragInfo.isDragging || isAnimating || event.touches.length !== 1) return;
    event.preventDefault();
}

function onTouchEnd(event) {
    if (!dragInfo.isDragging || isAnimating) return;
    dragInfo.isDragging = false;
    const deltaX = event.changedTouches[0].clientX - dragInfo.startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
        markUserInteraction();
        if (deltaX > 0) navigate(-1);
        else navigate(1);
        scheduleAutoAnimation();
    }
}



// --- 主程式邏輯 ---
init();
