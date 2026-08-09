/**
 * SNSシェア共通モジュール
 *
 * 各ツールの算出結果を X / LINE / Facebook / はてなブックマークへ共有するための共通基盤。
 * ツール側は共有したい本文とURLを渡すだけでよく、各サービスのURL仕様は
 * このファイルに閉じ込める。
 *
 * 【重要: このファイルを変更したときの手順】
 * このファイルは複数のツールから読み込まれる共有ファイルのため、
 * ブラウザや CDN にキャッシュされたままだと、新しい関数を呼ぶツール側と
 * 古いモジュールの組み合わせで実行時エラーになる。
 * 変更したら、読み込んでいる全ツールの script タグのバージョンを上げること。
 *
 *   <script src="../../assets/share.js?v=1"></script>
 *
 * 現在のバージョン: v=1
 * 読み込んでいるツール:
 *   - tools/pet-timeline/index.html
 *
 * 【設計上の制約】
 * - 共有先の各サービスはいずれもGETのシェアURLを開くだけで完結するため、
 *   SDKやトラッキング用のスクリプトは一切読み込まない。
 * - Facebook は本文を受け取らない（共有時に表示されるのはOGPの内容）。
 *   そのため本文を伝えたいツールはページにOGPを設定しておくこと。
 * - 共有本文には利用者の入力に由来する文字列が入るため、DOM API で組み立て、
 *   innerHTML には一切流し込まない。
 * - 共有URLの既定値は canonical を優先する。localhost や file:// で開いたときに
 *   そのままのURLを共有してしまうのを防ぐため。
 */
(function (global) {
    'use strict';

    /**
     * 共有先サービスの定義。
     *
     * build() は正規化済みのペイロード { text, url, title, hashtags } を受け取り、
     * 各サービスのシェア画面URLを返す。
     */
    const SERVICES = [
        {
            key: 'x',
            label: 'Xでポスト',
            className: 'text-slate-900 border-slate-300 hover:bg-slate-100',
            // ハッシュタグは text に混ぜず専用パラメータで渡す（重複表示を避ける）
            build: ({ text, url, hashtags }) => buildUrl('https://x.com/intent/post', {
                text,
                url,
                hashtags: hashtags.join(',')
            })
        },
        {
            key: 'line',
            label: 'LINEで送る',
            className: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
            // LINE は url と text を別々に受け取り、投稿欄で1つにまとめてくれる
            build: ({ text, url }) => buildUrl('https://social-plugins.line.me/lineit/share', {
                url,
                text
            })
        },
        {
            key: 'facebook',
            label: 'Facebookでシェア',
            className: 'text-blue-700 border-blue-200 hover:bg-blue-50',
            // Facebook は本文を受け取らないため、URLのみを渡す
            build: ({ url }) => buildUrl('https://www.facebook.com/sharer/sharer.php', {
                u: url
            })
        },
        {
            key: 'hatena',
            label: 'はてブに追加',
            className: 'text-sky-700 border-sky-200 hover:bg-sky-50',
            // btitle はブックマーク時のタイトル。本文ではなくページタイトルを渡す
            build: ({ url, title }) => buildUrl('https://b.hatena.ne.jp/entry/panel/', {
                url,
                btitle: title
            })
        }
    ];

    /** ベースURLにクエリを付与する。空の値は付けない */
    function buildUrl(base, params) {
        const parsed = new URL(base);
        Object.entries(params).forEach(([key, value]) => {
            if (value) parsed.searchParams.set(key, value);
        });
        return parsed.toString();
    }

    /**
     * 共有するURLの既定値を返す。
     *
     * canonical を優先するのは、localhost や file:// で開いた状態から
     * 共有したときに他者が開けないURLを流してしまうのを防ぐため。
     */
    function defaultUrl() {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.href) return canonical.href;
        // ハッシュやクエリは共有先で意味を持たないため落とす
        return location.origin + location.pathname;
    }

    /** ツールから渡されたオプションを、各サービスが期待する形に正規化する */
    function normalize(options) {
        const opts = options || {};
        return {
            text: opts.text || '',
            url: opts.url || defaultUrl(),
            title: opts.title || document.title,
            hashtags: Array.isArray(opts.hashtags) ? opts.hashtags.filter(Boolean) : []
        };
    }

    /**
     * クリップボードや Web Share API に渡す文字列を組み立てる。
     * 本文とURLを改行で繋いだもの。
     */
    function shareText(options) {
        const payload = normalize(options);
        return [payload.text, payload.url].filter(Boolean).join('\n');
    }

    /** ボタンの見た目を揃えるための共通クラス */
    const BUTTON_BASE = 'px-3 py-1.5 text-sm font-bold border rounded-lg transition-colors whitespace-nowrap';

    /** 共有先へのリンク要素を生成する */
    function serviceLink(service, payload) {
        const el = document.createElement('a');
        el.href = service.build(payload);
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        el.className = `${BUTTON_BASE} ${service.className}`;
        el.textContent = service.label;
        return el;
    }

    /**
     * テキストをクリップボードへ書き込む。
     *
     * navigator.clipboard は安全なコンテキスト（https / localhost）でしか使えず、
     * file:// で開いた場合は使えない。そのため textarea を使った古い方法へ退避する。
     */
    function copyToClipboard(text) {
        if (navigator.clipboard && global.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            const area = document.createElement('textarea');
            area.value = text;
            // 画面のちらつきと、フォーカス移動によるスクロールを避ける
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();

            try {
                document.execCommand('copy') ? resolve() : reject(new Error('copy command failed'));
            } catch (e) {
                reject(e);
            } finally {
                document.body.removeChild(area);
            }
        });
    }

    /** 「コピー」ボタンを生成する。押した直後だけラベルを結果に差し替える */
    function copyButton(payload) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `${BUTTON_BASE} text-slate-600 border-slate-300 hover:bg-slate-100`;
        el.textContent = 'テキストをコピー';

        let timer = null;
        el.addEventListener('click', () => {
            copyToClipboard(shareText(payload))
                .then(() => { el.textContent = 'コピーしました'; })
                .catch(() => { el.textContent = 'コピーできませんでした'; })
                .finally(() => {
                    clearTimeout(timer);
                    timer = setTimeout(() => { el.textContent = 'テキストをコピー'; }, 2000);
                });
        });

        return el;
    }

    /** OS標準の共有シートが使えるか */
    function canUseWebShare() {
        return typeof navigator.share === 'function';
    }

    /**
     * OS標準の共有シートを開くボタンを生成する。
     * スマートフォンではこちらのほうが共有先の選択肢が広いため先頭に置く。
     */
    function nativeButton(payload) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `${BUTTON_BASE} text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700`;
        el.textContent = '共有する';

        el.addEventListener('click', () => {
            navigator.share({
                title: payload.title,
                text: payload.text,
                url: payload.url
            }).catch(() => {
                // 利用者が共有シートを閉じた場合もここに来るため、何も表示しない
            });
        });

        return el;
    }

    /**
     * 共有ボタン群を描画する。
     *
     * options
     *   text     … 共有本文（省略可）
     *   url      … 共有するURL（省略時は canonical、なければ現在のURL）
     *   title    … 共有時のタイトル（省略時は document.title）
     *   hashtags … Xに付けるハッシュタグの配列（# は不要）
     *
     * @returns {HTMLElement|null} 生成したボタン群。描画先が無い場合は null
     */
    function render(target, options) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return null;

        const payload = normalize(options);

        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-2';

        if (canUseWebShare()) wrap.appendChild(nativeButton(payload));
        SERVICES.forEach(service => wrap.appendChild(serviceLink(service, payload)));
        wrap.appendChild(copyButton(payload));

        el.appendChild(wrap);
        return wrap;
    }

    global.Share = {
        render,
        shareText,
        defaultUrl,
        canUseWebShare
    };
})(window);
