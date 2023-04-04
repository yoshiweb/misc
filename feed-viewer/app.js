(async () => {
    'use strict'


    /**
     * ローカルストレージからURLを取得する
     */
    function getStoredUrls() {
        return JSON.parse(localStorage.getItem("rss-urls")) || [];
    }


    /**
     * URLをローカルストレージに追加し、RSSフィードを取得する
     */
    function addRssFeed(url) {
        const storedUrls = getStoredUrls();
        if (!storedUrls.includes(url)) {
            storedUrls.push(url);
            localStorage.setItem("rss-urls", JSON.stringify(storedUrls));
            fetchRssFeed(url);
        }
    }


    /**
     * URLからRSSフィードを取得し、結果を表示する
     */
    async function fetchRssFeed(url) {
        if (url) {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.status === "ok") {
                displayFeed(url, data.feed, data.items);
                resizeAllGridItems();
            } else {
                console.log("Error fetching RSS feed", url, data);
            }
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


        const column = document.createElement("div");
        column.classList.add("rss-feed-column");
        column.classList.add("masonry-content");


        // タイトルバー
        const titleBar = document.createElement("div");
        titleBar.classList.add("title-bar");
        column.appendChild(titleBar);

        column.setAttribute('draggable', 'true');


        const title = document.createElement("h2");
        title.innerHTML = `<a href="${feed.link}" target="_blank" rel="noopener noreferrer">${feed.title}</a>`;
        titleBar.appendChild(title);

        // タイトルバー ボタン
        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        titleBar.appendChild(buttons);

        // RSSボタン
        const rssButton = document.createElement("button");
        rssButton.innerText = "rss_feed";
        rssButton.classList.add("rss-button");
        rssButton.classList.add("material-symbols-outlined");

        rssButton.addEventListener("click", () => {
            window.open(url, '_blank');
        });
        buttons.appendChild(rssButton);

        // 削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "delete";
        deleteButton.classList.add("delete-button");
        deleteButton.classList.add("material-symbols-outlined");

        deleteButton.addEventListener("click", () => {
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
            entry.innerHTML = `
            <h4><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h4>
        `;
            itemContents.appendChild(entry);
        });
        columnItem.appendChild(column);
        columnsContainer.appendChild(columnItem);

        // タイトルバーダブルクリック
        titleBar.addEventListener('dblclick', function (event) {
            if (event.target.tagName.toLowerCase() !== 'a') {
                // 開閉
                itemContents.style.display = itemContents.style.display === 'none' ? '' : 'none';
                resizeGridItem(columnItem);
            }
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
        }
        resizeAllGridItems();
    }

    /**
     * グリッドアイテムの grid-row-end プロパティを更新（設定）する
     */
    function resizeGridItem(item) {

        //グリッドコンテナを取得
        const grid = document.getElementsByClassName('masonry')[0];

        //グリッドコンテナの grid-auto-rows の値を取得
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

        //グリッドコンテナの grid-row-gap の値を取得
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));

        //grid-row-end の span に指定する値を算出
        const rowSpan = Math.ceil((item.querySelector('.masonry-content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));

        //グリッドアイテムの grid-row-end プロパティを更新（設定）
        item.style.gridRowEnd = 'span ' + rowSpan;
    }

    /**
     * 全てのアイテムの grid-row-end プロパティを更新する
     */
    function resizeAllGridItems() {

        //全てのグリッドアイテムを取得
        const allItems = document.getElementsByClassName('masonry-item');

        for (let i = 0; i < allItems.length; i++) {
            resizeGridItem(allItems[i]);
        }
    }


    // 新しいRSSフィードを追加するイベントリスナーを設定
    document.getElementById("fetch-rss").addEventListener("click", function () {
        const url = document.getElementById("rss-url").value;
        if (url) {
            addRssFeed(url);
            document.getElementById("rss-url").value = '';
        }
    });

    // ページが読み込まれたときにローカルストレージからURLを取得し、表示する
    document.addEventListener("DOMContentLoaded", async function () {
        const storedUrls = getStoredUrls();
        if (storedUrls) {
            // 逆順に回す
            for (let i = storedUrls.length - 1; i >= 0; i--) {
                await fetchRssFeed(storedUrls[i]);
            }
        }
    });


    //リサイズ時に全てのアイテムの grid-row-end プロパティを更新
    let timer = false;
    window.addEventListener('resize', () => {
        if (timer !== false) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            resizeAllGridItems();
        }, 200);
    });

})();
