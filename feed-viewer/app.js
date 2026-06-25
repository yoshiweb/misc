(async () => {
    'use strict';

    // グリッドレイアウト計測キャッシュ
    let cachedRowHeight = 0;
    let cachedRowGap = 0;

    // ドラッグ中の要素を保持
    let dragSourceEl = null;

    // ドラッグ開始判定用のグローバルステート
    let isTitleBarGrabbed = false;

    // マウスアップでフラグをリセット（グローバルで1つだけ登録）
    window.addEventListener('mouseup', () => {
        isTitleBarGrabbed = false;
    });

    /**
     * グリッドの設定値を再取得してキャッシュする
     */
    function updateGridCache() {
        const grid = document.querySelector('.masonry');
        if (grid) {
            const computedStyle = window.getComputedStyle(grid);
            cachedRowHeight = parseInt(computedStyle.getPropertyValue('grid-auto-rows')) || 0;
            cachedRowGap = parseInt(computedStyle.getPropertyValue('grid-row-gap')) || 0;
        }
    }

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
     * ローカルストレージからURLを取得する
     */
    function getStoredUrls() {
        try {
            return JSON.parse(localStorage.getItem("rss-urls")) || [];
        } catch (e) {
            console.error("Failed to parse stored RSS URLs", e);
            return [];
        }
    }

    /**
     * 現在のフィードカラムの並び順をローカルストレージに保存する
     */
    function saveCurrentOrder() {
        const container = document.getElementById("rss-feed-columns");
        const items = container.querySelectorAll('.masonry-item');
        const urls = [];
        items.forEach(item => {
            const url = item.getAttribute('data-url');
            if (url) {
                urls.push(url);
            }
        });
        localStorage.setItem("rss-urls", JSON.stringify(urls));
    }

    /**
     * URLをローカルストレージに追加し、RSSフィードを取得する
     */
    async function addRssFeed(url) {
        const storedUrls = getStoredUrls();
        if (storedUrls.includes(url)) {
            showToast("This RSS Feed is already added.", "info");
            return;
        }

        const success = await fetchRssFeed(url);
        if (success) {
            storedUrls.push(url);
            localStorage.setItem("rss-urls", JSON.stringify(storedUrls));
            showToast("RSS Feed added successfully!", "success");
        }
    }

    /**
     * URLからRSSフィードを取得し、結果を表示する
     */
    async function fetchRssFeed(url) {
        if (!url) return false;
        try {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "ok") {
                displayFeed(url, data.feed, data.items);
                updateGridCache();
                resizeAllGridItems();
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
    function displayFeed(url, feed, items) {
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
                itemContents.style.display = itemContents.style.display === 'none' ? '' : 'none';
                resizeGridItem(columnItem);
            }
        });

        titleBar.addEventListener('mousedown', function (e) {
            // リンクやボタン上でのクリック時はドラッグを無効化
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

                saveCurrentOrder();
                updateGridCache();
                resizeAllGridItems();
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

        // 並び替え
        resizeGridItem(columnItem);
    }

    /**
     * URLと対応するカラムを削除する
     */
    function removeRssFeed(url, column) {
        const storedUrls = getStoredUrls();
        const index = storedUrls.indexOf(url);
        if (index > -1) {
            storedUrls.splice(index, 1);
            localStorage.setItem("rss-urls", JSON.stringify(storedUrls));
            column.remove();
            showToast("RSS Feed removed.", "info");
        }
        updateGridCache();
        resizeAllGridItems();
    }

    /**
     * グリッドアイテムの grid-row-end プロパティを更新（設定）する
     */
    function resizeGridItem(item) {
        if (cachedRowHeight === 0) {
            updateGridCache();
        }

        const content = item.querySelector('.masonry-content');
        if (!content) return;

        // grid-row-end の span に指定する値を算出
        const rowSpan = Math.ceil((content.getBoundingClientRect().height + cachedRowGap) / (cachedRowHeight + cachedRowGap));

        // グリッドアイテムの grid-row-end プロパティを更新（設定）
        item.style.gridRowEnd = `span ${rowSpan}`;
    }

    /**
     * 全てのアイテムの grid-row-end プロパティを更新する
     */
    function resizeAllGridItems() {
        const allItems = document.getElementsByClassName('masonry-item');
        for (let i = 0; i < allItems.length; i++) {
            resizeGridItem(allItems[i]);
        }
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

    // ページが読み込まれたときにローカルストレージからURLを取得し、表示する
    document.addEventListener("DOMContentLoaded", async function () {
        const storedUrls = getStoredUrls();
        if (storedUrls && storedUrls.length > 0) {
            updateGridCache();
            
            // 並列で全フィードを取得する
            const promises = storedUrls.map(async (url) => {
                try {
                    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return { url, data, success: data.status === "ok" };
                } catch (error) {
                    console.error("Error fetching RSS feed", url, error);
                    return { url, error, success: false };
                }
            });
            
            const results = await Promise.all(promises);
            
            // 保存された順序を保ってDOMに追加する
            results.forEach(result => {
                if (result.success) {
                    displayFeed(result.url, result.data.feed, result.data.items);
                } else if (result.error) {
                    showToast(`Failed to load feed: ${result.error.message || "Unknown error"}`, "error");
                }
            });
            
            updateGridCache();
            resizeAllGridItems();
        }
    });

    // リサイズ時に全てのアイテムの grid-row-end プロパティを更新
    let timer = false;
    window.addEventListener('resize', () => {
        if (timer !== false) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            updateGridCache();
            resizeAllGridItems();
        }, 200);
    });

})();
