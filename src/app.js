// 新しいRSSフィードを追加するイベントリスナーを設定
document.getElementById("fetch-rss").addEventListener("click", function () {
    const url = document.getElementById("rss-url").value;
    addRssFeed(url);
});

// ページが読み込まれたときにローカルストレージからURLを取得し、表示する
document.addEventListener("DOMContentLoaded", function () {
    const storedUrls = getStoredUrls();
    if (storedUrls) {
        storedUrls.forEach(url => {
            fetchRssFeed(url);
        });
    }
});

// ローカルストレージからURLを取得する
function getStoredUrls() {
    return JSON.parse(localStorage.getItem("rss-urls")) || [];
}

// URLをローカルストレージに追加し、RSSフィードを取得する
function addRssFeed(url) {
    const storedUrls = getStoredUrls();
    if (!storedUrls.includes(url)) {
        storedUrls.push(url);
        localStorage.setItem("rss-urls", JSON.stringify(storedUrls));
        fetchRssFeed(url);
    }
}

// URLからRSSフィードを取得し、結果を表示する
async function fetchRssFeed(url) {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.status === "ok") {
        displayFeed(url, data.feed.title, data.items);
    } else {
        alert("Error fetching RSS feed");
    }
}

// RSSフィードのアイテムをカラムに表示する
function displayFeed(url, feedTitle, items) {
    const columnsContainer = document.getElementById("rss-feed-columns");

    const column = document.createElement("div");
    column.classList.add("rss-feed-column");

    const titleBar = document.createElement("div");
    titleBar.classList.add("title-bar");
    column.appendChild(titleBar);

    const title = document.createElement("h2");
    title.innerText = feedTitle;
    titleBar.appendChild(title);

    const buttons = document.createElement("div");
    buttons.classList.add("buttons");
    titleBar.appendChild(buttons);

    const rssButton = document.createElement("button");
    rssButton.innerText = "RSS";
    rssButton.classList.add("rss-button");
    rssButton.addEventListener("click", () => {
        window.open(url, '_blank');
    });
    buttons.appendChild(rssButton);

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
        removeRssFeed(url, column);
    });
    buttons.appendChild(deleteButton);

    // 各フィードアイテムをカラムに追加
    items.forEach(item => {
        const entry = document.createElement("div");
        entry.innerHTML = `
            <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
        `;
        column.appendChild(entry);
    });

    columnsContainer.appendChild(column);
}

// URLと対応するカラムを削除する
function removeRssFeed(url, column) {
    const storedUrls = getStoredUrls();
    const index = storedUrls.indexOf(url);
    if (index > -1) {
        storedUrls.splice(index, 1);
        localStorage.setItem("rss-urls", JSON.stringify(storedUrls));
        column.remove();
    }
}
