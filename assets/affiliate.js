/**
 * アフィリエイト共通モジュール（Amazon / 楽天）
 *
 * 各ツールから商品リンク・商品カード・アフィリエイト表記を生成するための共通基盤。
 *
 * 【重要: このファイルを変更したときの手順】
 * このファイルは複数のツールから読み込まれる共有ファイルのため、
 * ブラウザや CDN にキャッシュされたままだと、新しい関数を呼ぶツール側と
 * 古いモジュールの組み合わせで実行時エラーになる。
 * 変更したら、読み込んでいる全ツールの script タグのバージョンを上げること。
 *
 *   <script src="../../assets/affiliate.js?v=5"></script>
 *
 * 現在のバージョン: v=5
 * 読み込んでいるツール:
 *   - tools/pfc-calculator/index.html
 *   - tools/pet-timeline/index.html
 *   - tools/disaster-stockpile/index.html
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
        /**
         * 楽天アフィリエイトID。空文字の場合は楽天リンクを生成しない。
         */
        rakutenAffiliateId: '0a659c4f.afcf3049.0a659c50.7d029f67',
        siteName: 'misc.yoshiweb.net',
        baseUrl: 'https://www.amazon.co.jp',
        rakutenSearchUrl: 'https://search.rakuten.co.jp/search/mall',
        rakutenRedirectUrl: 'https://hb.afl.rakuten.co.jp/hgc'
    };

    /** カテゴリ名 -> 商品データ のレジストリ */
    const registry = new Map();

    /**
     * カテゴリ名 -> そのカテゴリに1つでもイラストがあるか。
     * イラストを使うカテゴリでは、未設定の商品にプレースホルダーを出して
     * カードの左端を揃える。イラストを一切使わないツールでは何も出さない。
     */
    const categoryHasImages = new Map();

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

    /** 楽天アフィリエイトIDが設定済みか */
    function isRakutenEnabled() {
        return typeof CONFIG.rakutenAffiliateId === 'string' && CONFIG.rakutenAffiliateId.length > 0;
    }

    /**
     * 楽天市場の検索結果へのアフィリエイトリンクを生成する。
     * アフィリエイトIDが未設定の場合は通常の検索URLを返す。
     */
    function rakutenSearchUrl(keyword) {
        const target = `${CONFIG.rakutenSearchUrl}/${encodeURIComponent(keyword)}/`;
        if (!isRakutenEnabled()) return target;
        return `${CONFIG.rakutenRedirectUrl}/${encodeURIComponent(CONFIG.rakutenAffiliateId)}/`
            + `?pc=${encodeURIComponent(target)}`;
    }

    /**
     * 商品に対する各ストアのリンクを返す。
     * 商品カードと、ツール側で独自にリンクを並べる箇所の両方から使う。
     */
    function storeLinks(product) {
        const links = [{
            store: 'Amazon',
            url: linkFor(product),
            // ASIN未設定の商品は検索結果に飛ぶため、遷移先を正しく伝える
            label: product.asin ? 'Amazonで見る' : 'Amazonで探す'
        }];

        if (product.searchKeyword) {
            links.push({
                store: '楽天',
                url: rakutenSearchUrl(product.rakutenKeyword || product.searchKeyword),
                label: '楽天で探す'
            });
        }

        return links;
    }

    /**
     * 商品イラストの要素を生成する。画像が未設定の商品は null を返す。
     *
     * 商品データの image は各ツールの index.html から見た相対パスで持つ。
     * ツールはすべて tools/<name>/index.html の深さに置く前提。
     */
    function productImage(product) {
        const size = 'shrink-0 w-24 h-16 sm:w-32 sm:h-20 rounded-lg';

        if (!product.image) {
            // イラストを使うカテゴリでは、未設定でも枠を確保して左端を揃える
            if (!categoryHasImages.get(product.category)) return null;

            const placeholder = document.createElement('div');
            placeholder.className = `${size} bg-slate-100 border border-slate-200`;
            placeholder.setAttribute('aria-hidden', 'true');
            return placeholder;
        }

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.loading = 'lazy';
        img.className = `${size} object-cover bg-slate-100`;
        return img;
    }

    /** ストアリンクのボタン要素を生成する */
    function storeLinkElement(link) {
        const el = document.createElement('a');
        el.href = link.url;
        el.target = '_blank';
        el.rel = 'nofollow sponsored noopener';
        el.className = link.store === 'Amazon'
            ? 'px-3 py-1.5 text-sm font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap'
            : 'px-3 py-1.5 text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap';
        el.textContent = link.label;
        return el;
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
        // 商品カードから所属カテゴリを引けるようにする
        data.products.forEach(product => { product.category = category; });

        registry.set(category, data.products);
        categoryHasImages.set(category, data.products.some(product => product.image));
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
        const card = document.createElement('div');
        card.className = 'flex flex-wrap items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl';

        const image = productImage(product);
        if (image) card.appendChild(image);

        const body = document.createElement('div');
        // 画像とボタンの間で伸縮させ、長い説明文でも折り返せるようにする
        body.className = 'min-w-0 flex-1';

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

        const actions = document.createElement('div');
        actions.className = 'shrink-0 flex flex-wrap gap-2';
        storeLinks(product).forEach(link => actions.appendChild(storeLinkElement(link)));

        card.appendChild(body);
        card.appendChild(actions);
        return card;
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

        let body = '当サイトはAmazonアソシエイト・プログラムの参加者です。'
            + `Amazonのアソシエイトとして、${CONFIG.siteName} は適格販売により収入を得ています。`;
        if (isRakutenEnabled()) {
            body += 'また、楽天アフィリエイトのプログラムにも参加しています。';
        }
        text.textContent = body;

        el.appendChild(text);
    }

    global.Affiliate = {
        isEnabled,
        productUrl,
        searchUrl,
        linkFor,
        isRakutenEnabled,
        rakutenSearchUrl,
        storeLinks,
        storeLinkElement,
        registerProducts,
        getProducts,
        productCard,
        productImage,
        renderPrNotice,
        renderDisclosure
    };
})(window);
