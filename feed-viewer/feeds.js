/* RSS Feed Viewer の登録候補カタログ。URL以外の情報はUI表示専用です。 */
window.RSS_FEED_CATALOG = [
    { id: "news", label: "ニュース", description: "まずは毎日のニュースをまとめて読む", feeds: [
        { title: "NHKニュース", description: "国内・海外の主要ニュース", url: "https://www3.nhk.or.jp/rss/news/cat0.xml", site: "nhk.or.jp" },
        { title: "ITmedia NEWS", description: "テクノロジーとIT業界の最新ニュース", url: "https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml", site: "itmedia.co.jp" },
        { title: "GIGAZINE", description: "テクノロジー・科学・ネットの話題", url: "https://gigazine.net/news/rss_2.0/", site: "gigazine.net" }
    ] },
    { id: "technology", label: "テクノロジー", description: "サービス開発やプロダクトの動向を追う", feeds: [
        { title: "Publickey", description: "クラウド・ソフトウェア開発のニュース", url: "https://www.publickey1.jp/atom.xml", site: "publickey1.jp" },
        { title: "TechCrunch Japan", description: "スタートアップとテックビジネス", url: "https://jp.techcrunch.com/feed/", site: "jp.techcrunch.com" },
        { title: "Web担当者Forum", description: "Webマーケティングとデジタル施策", url: "https://webtan.impress.co.jp/rss.xml", site: "webtan.impress.co.jp" }
    ] },
    { id: "development", label: "開発", description: "コードを書く人のためのフィード", feeds: [
        { title: "Qiita 人気の記事", description: "Qiitaで人気の技術記事", url: "https://qiita.com/popular-items/feed.atom", site: "qiita.com" },
        { title: "Zenn", description: "エンジニアの知見と本の新着", url: "https://zenn.dev/feed", site: "zenn.dev" },
        { title: "CodeZine", description: "開発者向け技術情報", url: "https://codezine.jp/rss/new/20/index.xml", site: "codezine.jp" }
    ] },
    { id: "design", label: "デザイン", description: "プロダクトとビジュアルのヒントを集める", feeds: [
        { title: "MdN Design Interactive", description: "デザイン・クリエイティブのニュース", url: "https://www.mdn.co.jp/feed", site: "mdn.co.jp" },
        { title: "Webクリエイターボックス", description: "Webデザインと制作のアイデア", url: "https://www.webcreatorbox.com/feed", site: "webcreatorbox.com" },
        { title: "Goodpatch Blog", description: "UX・プロダクトデザインの実践", url: "https://goodpatch.com/blog/feed", site: "goodpatch.com" }
    ] },
    { id: "lifestyle", label: "暮らし", description: "仕事の外側にある読みもの", feeds: [
        { title: "デイリーポータルZ", description: "身近なものを面白がる読みもの", url: "https://dailyportalz.jp/feed/", site: "dailyportalz.jp" },
        { title: "ほぼ日刊イトイ新聞", description: "人と暮らしをめぐるコンテンツ", url: "https://www.1101.com/rss/index.xml", site: "1101.com" }
    ] }
];
