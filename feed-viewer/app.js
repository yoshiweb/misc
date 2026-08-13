(async () => {
    'use strict';

    // ドラッグ中の要素を保持
    let dragSourceEl = null;

    // ドラッグ開始判定用のグローバルステート
    let isTitleBarGrabbed = false;
    let activeCatalogId = window.RSS_FEED_CATALOG?.[0]?.id || '';

    // マウスアップでフラグをリセット（グローバルで1つだけ登録）
    window.addEventListener('mouseup', () => {
        isTitleBarGrabbed = false;
    });

    /**
     * トースト通知を表示する
     */
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = type === 'error' ? 'error' : (type === 'success' ? 'check_circle' : 'info');
        toast.appendChild(icon);

        const text = document.createElement('span');
        text.textContent = message;
        toast.appendChild(text);

        container.appendChild(toast);

        // 3秒後にフェードアウトして削除
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 3000);
    }

    /**
     * ローカルストレージからフィード一覧（URLと開閉状態）を取得する
     * 互換性担保: 古い「単なる文字列（URL）の配列」が保存されていた場合,
     * 自動的にオブジェクト配列（{ url, collapsed: false }）に変換して返す。
     */
    function getStoredFeeds() {
        try {
            const data = JSON.parse(localStorage.getItem("rss-urls")) || [];
            return data.map(item => {
                if (typeof item === 'string') {
                    return { url: item, collapsed: false };
                }
                return item;
            });
        } catch (e) {
            console.error("Failed to parse stored RSS feeds", e);
            return [];
        }
    }

    function isFeedAdded(url) {
        return getStoredFeeds().some(feed => feed.url === url);
    }

    function renderCatalog() {
        const tabs = document.getElementById('category-tabs');
        const list = document.getElementById('catalog-list');
        const count = document.getElementById('catalog-count');
        if (!tabs || !list || !Array.isArray(window.RSS_FEED_CATALOG)) return;
        tabs.replaceChildren();
        window.RSS_FEED_CATALOG.forEach(category => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'category-tab';
            tab.textContent = category.label;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', String(category.id === activeCatalogId));
            tab.classList.toggle('is-active', category.id === activeCatalogId);
            tab.addEventListener('click', () => { activeCatalogId = category.id; renderCatalog(); });
            tabs.appendChild(tab);
        });
        const category = window.RSS_FEED_CATALOG.find(item => item.id === activeCatalogId) || window.RSS_FEED_CATALOG[0];
        if (!category) return;
        if (count) count.textContent = `${category.feeds.length} feeds`;
        list.replaceChildren();
        category.feeds.forEach(feed => {
            const card = document.createElement('article');
            card.className = 'catalog-card';
            const icon = document.createElement('div');
            icon.className = 'catalog-icon material-symbols-outlined';
            icon.textContent = 'rss_feed';
            icon.setAttribute('aria-hidden', 'true');
            const details = document.createElement('div');
            details.className = 'catalog-details';
            const title = document.createElement('h3'); title.textContent = feed.title;
            const description = document.createElement('p'); description.textContent = feed.description;
            const site = document.createElement('span'); site.className = 'catalog-site'; site.textContent = feed.site;
            details.append(title, description, site);
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'catalog-add'; button.dataset.url = feed.url;
            updateCatalogButton(button, isFeedAdded(feed.url));
            button.addEventListener('click', async () => {
                if (isFeedAdded(feed.url)) { showToast('このRSSはすでに登録されています。', 'info'); return; }
                button.disabled = true; button.classList.add('is-loading');
                const success = await addRssFeed(feed.url, feed.title);
                button.classList.remove('is-loading');
                updateCatalogButton(button, success || isFeedAdded(feed.url));
            });
            card.append(icon, details, button); list.appendChild(card);
        });
    }

    function updateCatalogButton(button, added) {
        button.classList.toggle('is-added', added); button.disabled = added; button.replaceChildren();
        const icon = document.createElement('span'); icon.className = 'material-symbols-outlined'; icon.textContent = added ? 'check' : 'add';
        button.append(icon, document.createTextNode(added ? '登録済み' : '登録する'));
    }

    /**
     * 現在のカラムの「並び順」と「折りたたみ状態」をローカルストレージに一括保存する
     */
    function saveCurrentState() {
        const container = document.getElementById("rss-feed-columns");
        const items = container.querySelectorAll('.masonry-item');
        const feeds = [];
        items.forEach(item => {
            const url = item.getAttribute('data-url');
            const itemContents = item.querySelector('.item-contents');
            // 要素の display 属性から collapsed 判定
            const collapsed = itemContents ? itemContents.style.display === 'none' : false;
            if (url) {
                feeds.push({ url, collapsed });
            }
        });
        localStorage.setItem("rss-urls", JSON.stringify(feeds));
    }

    /**
     * URLをローカルストレージに追加し, RSSフィードを取得する
     */
    async function addRssFeed(url, label = '') {
        const storedFeeds = getStoredFeeds();
        const urls = storedFeeds.map(f => f.url);
        if (urls.includes(url)) {
            showToast("This RSS Feed is already added.", "info");
            return false;
        }

        const success = await fetchRssFeed(url, false); // 追加時は初期展開
        if (success) {
            storedFeeds.push({ url, collapsed: false });
            localStorage.setItem("rss-urls", JSON.stringify(storedFeeds));
            showToast(`${label || 'RSS Feed'}を登録しました。`, "success");
            renderCatalog();
            return true;
        }
        return false;
    }

    /**
     * URLからRSSフィードを取得し, 結果を表示する
     */
    async function fetchRssFeed(url, collapsed = false) {
        if (!url) return false;
        try {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "ok") {
                displayFeed(url, data.feed, data.items, collapsed);
                return true;
            } else {
                throw new Error(data.message || "Invalid RSS feed response");
            }
        } catch (error) {
            console.error("Error fetching RSS feed", url, error);
            showToast(`Failed to load feed: ${error.message || "Unknown error"}`, "error");
            return false;
        }
    }

    /**
     * RSSフィードのアイテムをカラムに表示する
     */
    function displayFeed(url, feed, items, collapsed = false) {
        const columnsContainer = document.getElementById("rss-feed-columns");
        columnsContainer.classList.add("masonry");

        const columnItem = document.createElement("div");
        columnItem.classList.add("masonry-item");
        columnItem.setAttribute('draggable', 'true');
        columnItem.setAttribute('data-url', url);

        const column = document.createElement("div");
        column.className = "rss-feed-column masonry-content";

        // タイトルバー
        const titleBar = document.createElement("div");
        titleBar.classList.add("title-bar");
        column.appendChild(titleBar);

        const title = document.createElement("h2");
        const titleLink = document.createElement("a");
        titleLink.href = feed.link || "#";
        titleLink.target = "_blank";
        titleLink.rel = "noopener noreferrer";
        titleLink.textContent = feed.title || url;
        title.appendChild(titleLink);
        titleBar.appendChild(title);

        // タイトルバー ボタン
        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        titleBar.appendChild(buttons);

        // RSSボタン
        const rssButton = document.createElement("button");
        rssButton.classList.add("rss-button", "material-symbols-outlined");
        rssButton.textContent = "rss_feed";
        rssButton.title = "View Original RSS XML";
        rssButton.addEventListener("click", (e) => {
            e.stopPropagation();
            window.open(url, '_blank');
        });
        buttons.appendChild(rssButton);

        // 削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button", "material-symbols-outlined");
        deleteButton.textContent = "delete";
        deleteButton.title = "Remove Feed";
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            removeRssFeed(url, columnItem);
        });
        buttons.appendChild(deleteButton);

        // アイテムコンテンツ
        const itemContents = document.createElement("div");
        itemContents.classList.add("item-contents");
        
        // 初期折りたたみ状態の適用
        if (collapsed) {
            itemContents.style.display = 'none';
        }
        
        column.appendChild(itemContents);

        // 各フィードアイテムを追加
        items.forEach(item => {
            const entry = document.createElement("div");
            const entryTitle = document.createElement("h4");
            const entryLink = document.createElement("a");
            entryLink.href = item.link || "#";
            entryLink.target = "_blank";
            entryLink.rel = "noopener noreferrer";
            entryLink.textContent = item.title || "Untitled";
            entryTitle.appendChild(entryLink);
            entry.appendChild(entryTitle);
            itemContents.appendChild(entry);
        });
        
        columnItem.appendChild(column);
        columnsContainer.appendChild(columnItem);

        // タイトルバークリックで開閉
        titleBar.addEventListener('click', function (event) {
            // リンクやボタンをクリックした場合は開閉させない
            if (event.target.tagName.toLowerCase() !== 'a' && !event.target.closest('button')) {
                const isCollapsed = itemContents.style.display === 'none';
                itemContents.style.display = isCollapsed ? '' : 'none';
                
                // 開閉状態を保存
                saveCurrentState();
            }
        });

        // タイトルバー上でのマウスダウンでドラッグ判定フラグを有効化
        titleBar.addEventListener('mousedown', function (e) {
            const isInteractive = e.target.closest('a') || e.target.closest('button');
            if (!isInteractive) {
                isTitleBarGrabbed = true;
            }
        });

        // ドラッグ＆ドロップイベントリスナーの登録
        columnItem.addEventListener('dragstart', function (e) {
            // タイトルバーを掴んでいる場合のみドラッグ開始を許可
            if (!isTitleBarGrabbed) {
                e.preventDefault();
                return;
            }
            dragSourceEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', ''); // Firefox対策
            this.classList.add('dragging');
        });

        columnItem.addEventListener('dragover', function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        });

        columnItem.addEventListener('dragenter', function () {
            if (dragSourceEl !== this) {
                this.classList.add('drag-over');
            }
        });

        columnItem.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });

        columnItem.addEventListener('drop', function (e) {
            e.stopPropagation();
            if (dragSourceEl && dragSourceEl !== this) {
                const children = Array.from(columnsContainer.children);
                const fromIndex = children.indexOf(dragSourceEl);
                const toIndex = children.indexOf(this);

                if (fromIndex < toIndex) {
                    columnsContainer.insertBefore(dragSourceEl, this.nextSibling);
                } else {
                    columnsContainer.insertBefore(dragSourceEl, this);
                }

                saveCurrentState(); // ドラッグ並び替え時にも最新順序と開閉状態を同期保存
            }
            return false;
        });

        columnItem.addEventListener('dragend', function () {
            const items = columnsContainer.querySelectorAll('.masonry-item');
            items.forEach(item => {
                item.classList.remove('dragging');
                item.classList.remove('drag-over');
            });
            dragSourceEl = null;
        });
    }

    /**
     * URLと対応するカラムを削除する
     */
    function removeRssFeed(url, column) {
        const storedFeeds = getStoredFeeds();
        const updated = storedFeeds.filter(f => f.url !== url);
        localStorage.setItem("rss-urls", JSON.stringify(updated));
        column.remove();
        showToast("RSS Feed removed.", "info");
    }

    // 新しいRSSフィードを追加するフォームイベントリスナーを設定
    const rssForm = document.getElementById("rss-form");
    if (rssForm) {
        rssForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const urlInput = document.getElementById("rss-url");
            const url = urlInput.value.trim();
            if (url) {
                urlInput.value = '';
                await addRssFeed(url);
            }
        });
    }

    // ページが読み込まれたときにローカルストレージからURLを取得し, 表示する
    document.addEventListener("DOMContentLoaded", async function () {
        renderCatalog();
        const storedFeeds = getStoredFeeds();
        if (storedFeeds && storedFeeds.length > 0) {
            // 並列で全フィードを取得する
            const promises = storedFeeds.map(async (feedObj) => {
                const url = feedObj.url;
                try {
                    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return { url, data, collapsed: feedObj.collapsed, success: data.status === "ok" };
                } catch (error) {
                    console.error("Error fetching RSS feed", url, error);
                    return { url, error, success: false };
                }
            });
            
            const results = await Promise.all(promises);
            
            // 保存された順序を保ってDOMに追加する
            results.forEach(result => {
                if (result.success) {
                    displayFeed(result.url, result.data.feed, result.data.items, result.collapsed);
                } else if (result.error) {
                    showToast(`Failed to load feed: ${result.error.message || "Unknown error"}`, "error");
                }
            });
        }
    });

})();
