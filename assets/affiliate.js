/**
 * Amazonアソシエイト共通モジュール
 *
 * 各ツールから商品リンク・商品カード・アソシエイト表記を生成するための共通基盤。
 *
 * 【設計上の制約】
 * - Amazon Product Advertising API (PA-API) はリクエスト署名に秘密鍵を必要とするため、
 *   フロントエンドのみのこのプロジェクトでは利用できない。
 *   よって商品データは手動でキュレーションした静的データを使用する。
 * - PA-API 以外から取得した価格の掲載はアソシエイト・プログラム運営規約で禁止されている。
 *   そのため商品データに価格は持たせず、UIにも一切表示しない。
 * - 商品リンクには rel="nofollow sponsored" を付与する。
 * - CONFIG.tag が未設定の場合はタグなしの通常リンクを生成するため、
 *   アソシエイトの審査待ち期間でもツールとして問題なく公開できる。
 */
(function (global) {
    'use strict';

    const CONFIG = {
        /**
         * アソシエイトタグ（例: 'yourtag-22'）。
         * 変更箇所はこの1行のみ。空文字の場合はタグを付与しない。
         */
        tag: 'yoshiwebnet-22',
        siteName: 'misc.yoshiweb.net',
        baseUrl: 'https://www.amazon.co.jp'
    };

    /** カテゴリ名 -> 商品データ のレジストリ */
    const registry = new Map();

    /** 対応している商品データのスキーマバージョン */
    const SCHEMA_VERSION = 1;

    /** アソシエイトタグが設定済みか */
    function isEnabled() {
        return typeof CONFIG.tag === 'string' && CONFIG.tag.length > 0;
    }

    /** URLにアソシエイトタグを付与する（未設定時はそのまま返す） */
    function withTag(url) {
        if (!isEnabled()) return url;
        const parsed = new URL(url);
        parsed.searchParams.set('tag', CONFIG.tag);
        return parsed.toString();
    }

    /** ASINから商品ページURLを生成 */
    function productUrl(asin) {
        return withTag(`${CONFIG.baseUrl}/dp/${encodeURIComponent(asin)}`);
    }

    /** キーワードから検索結果URLを生成 */
    function searchUrl(keyword) {
        const parsed = new URL(`${CONFIG.baseUrl}/s`);
        parsed.searchParams.set('k', keyword);
        return withTag(parsed.toString());
    }

    /**
     * 商品データからリンクURLを生成する。
     * ASINが未設定の商品は検索結果へのリンクにフォールバックする。
     */
    function linkFor(product) {
        return product.asin ? productUrl(product.asin) : searchUrl(product.searchKeyword);
    }

    /**
     * 商品データを登録する。
     *
     * データは JSON ではなく JS ファイルとして読み込む。
     * これは file:// スキームで直接開いた場合に fetch が CORS で失敗するのを避けるため。
     */
    function registerProducts(category, data) {
        if (data.schemaVersion !== SCHEMA_VERSION) {
            console.warn(`[Affiliate] 未対応のスキーマバージョンです: ${category}`);
            return;
        }
        registry.set(category, data.products);
    }

    /** 登録済みの商品リストを取得する（未登録なら空配列） */
    function getProducts(category) {
        return registry.get(category) || [];
    }

    /**
     * 商品カード要素を生成する。
     * 価格は規約上表示できないため、いかなる形でも出力しない。
     */
    function productCard(product) {
        const link = document.createElement('a');
        link.href = linkFor(product);
        link.target = '_blank';
        link.rel = 'nofollow sponsored noopener';
        link.className = 'flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all';

        const body = document.createElement('div');

        if (product.label) {
            const badge = document.createElement('p');
            badge.className = 'inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mb-1.5';
            badge.textContent = product.label;
            body.appendChild(badge);
        }

        const name = document.createElement('p');
        name.className = 'font-bold text-slate-800 leading-snug';
        name.textContent = product.name;
        body.appendChild(name);

        if (product.note) {
            const note = document.createElement('p');
            note.className = 'text-sm text-slate-500 mt-1';
            note.textContent = product.note;
            body.appendChild(note);
        }

        const action = document.createElement('span');
        action.className = 'shrink-0 text-sm font-bold text-indigo-600 whitespace-nowrap';
        // ASIN未設定の商品は検索結果に飛ぶため、遷移先を正しく伝える
        action.textContent = product.asin ? 'Amazonで見る →' : 'Amazonで探す →';

        link.appendChild(body);
        link.appendChild(action);
        return link;
    }

    /**
     * PR表記（ステマ規制／景品表示法対策）を描画する。
     *
     * 景品表示法の運用基準では、広告であることが消費者にとって明瞭に
     * 分かるよう表示する必要がある。フッターの小さな注記では不十分なため、
     * 商品リンクの直前など利用者の目に入る位置で呼び出すこと。
     *
     * 表記文言は tools/affiliate-links の既定値と揃えている。
     */
    function renderPrNotice(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;

        const notice = document.createElement('p');
        notice.className = 'flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3';

        const badge = document.createElement('span');
        badge.className = 'shrink-0 bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded';
        badge.textContent = 'PR';
        notice.appendChild(badge);
        notice.appendChild(document.createTextNode('アフィリエイト広告を利用しています'));

        el.appendChild(notice);
    }

    /**
     * アソシエイト表記を描画する。
     * アソシエイト・プログラム運営規約で掲載が義務付けられているため、
     * 商品リンクを表示するページでは必ず呼び出す。
     */
    function renderDisclosure(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;

        const text = document.createElement('p');
        text.className = 'text-xs text-slate-400 leading-relaxed';
        text.textContent = `当サイトはAmazonアソシエイト・プログラムの参加者です。`
            + `Amazonのアソシエイトとして、${CONFIG.siteName} は適格販売により収入を得ています。`;
        el.appendChild(text);
    }

    global.Affiliate = {
        isEnabled,
        productUrl,
        searchUrl,
        linkFor,
        registerProducts,
        getProducts,
        productCard,
        renderPrNotice,
        renderDisclosure
    };
})(window);
