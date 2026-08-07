/**
 * プロテイン・サプリメントの商品データ
 *
 * 【重要】
 * - 価格は保持しない。PA-API を利用していないため、規約上価格の掲載ができない。
 * - `asin` は実際の商品を確認したうえで手動で設定する。
 *   null のままでも `searchKeyword` による検索結果リンクとして機能するため、
 *   ASIN未設定でもツールは正常に動作する。
 * - `goals` は対象とする目標（lose = 減量 / maintain = 維持 / gain = 増量）。
 * - `priority` は表示順（数値が小さいものを優先）。
 */
Affiliate.registerProducts('supplements', {
    schemaVersion: 1,
    category: 'supplements',
    products: [
        {
            id: 'whey-concentrate-bulk',
            type: 'protein',
            label: 'ホエイプロテイン (WPC)',
            name: '大容量ホエイプロテイン 3kg',
            note: '最も一般的でコストパフォーマンスに優れるタイプ。日常的な不足分の補給向け。',
            searchKeyword: 'ホエイプロテイン 3kg',
            asin: null,
            goals: ['maintain', 'gain'],
            priority: 10
        },
        {
            id: 'whey-isolate',
            type: 'protein',
            label: 'ホエイプロテイン (WPI)',
            name: 'WPI ホエイプロテインアイソレート',
            note: '乳糖と脂質を減らした製法。減量中のカロリー管理や、乳糖が気になる方向け。',
            searchKeyword: 'WPI ホエイプロテイン アイソレート',
            asin: null,
            goals: ['lose', 'maintain'],
            priority: 10
        },
        {
            id: 'soy-protein',
            type: 'protein',
            label: 'ソイプロテイン',
            name: 'ソイプロテイン (大豆プロテイン)',
            note: '植物性。動物性を避けたい場合や、腹持ちを重視する場合の選択肢。',
            searchKeyword: 'ソイプロテイン 大豆',
            asin: null,
            goals: ['lose', 'maintain'],
            priority: 20
        },
        {
            id: 'casein-protein',
            type: 'protein',
            label: 'カゼインプロテイン',
            name: 'カゼインプロテイン',
            note: '吸収がゆるやかなタイプ。食間や就寝前の補給に使われる。',
            searchKeyword: 'カゼインプロテイン',
            asin: null,
            goals: ['lose', 'maintain', 'gain'],
            priority: 30
        },
        {
            id: 'maltodextrin',
            type: 'carb',
            label: '炭水化物の補給',
            name: 'マルトデキストリン (粉飴)',
            note: '食事だけで炭水化物量を満たしにくい増量期に、飲み物として補う用途。',
            searchKeyword: 'マルトデキストリン 粉飴',
            asin: null,
            goals: ['gain'],
            priority: 40
        },
        {
            id: 'creatine-monohydrate',
            type: 'optional',
            label: 'クレアチン',
            name: 'クレアチンモノハイドレート',
            note: '高強度トレーニングを行う場合によく併用される。摂取量の目安は製品表示を確認。',
            searchKeyword: 'クレアチンモノハイドレート',
            asin: null,
            goals: ['maintain', 'gain'],
            priority: 50
        },
        {
            id: 'multivitamin',
            type: 'optional',
            label: 'マルチビタミン',
            name: 'マルチビタミン・ミネラル',
            note: '摂取カロリーを絞る減量期に、食事の品目数が減る場合の補助として。',
            searchKeyword: 'マルチビタミン ミネラル',
            asin: null,
            goals: ['lose'],
            priority: 50
        },
        {
            id: 'shaker',
            type: 'gear',
            label: 'シェイカー',
            name: 'プロテインシェイカー',
            note: '粉末を溶かすための容器。目盛り付きのものが計量しやすい。',
            searchKeyword: 'プロテインシェイカー 目盛り',
            asin: null,
            goals: ['lose', 'maintain', 'gain'],
            priority: 60
        },
        {
            id: 'kitchen-scale',
            type: 'gear',
            label: 'キッチンスケール',
            name: 'デジタルキッチンスケール (0.1g単位)',
            note: '算出したPFCを実際の食事で管理するために必要。粉末の計量にも使える。',
            searchKeyword: 'デジタルキッチンスケール 0.1g',
            asin: null,
            goals: ['lose', 'maintain', 'gain'],
            priority: 70
        }
    ]
});
