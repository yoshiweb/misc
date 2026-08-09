/**
 * 防災備蓄品の商品データ
 *
 * 【重要】
 * - 価格は保持しない。PA-API を利用していないため、規約上価格の掲載ができない。
 * - `asin` は実際の商品を確認したうえで手動で設定する。
 *   null のままでも `searchKeyword` による検索結果リンクとして機能する。
 *
 * 【数量の算出モデル】
 * 必要数量は次の合計で求める。いずれのフィールドも省略可。
 *
 *   perDay        … 1日あたりの必要量（構成員ごと）× 人数（頭数）× 備蓄日数
 *   perWeek       … 1週間あたりの必要量（構成員ごと）× 人数（頭数）× 備蓄日数 ÷ 7
 *   householdPerDay … 世帯単位で1日あたり必要な量 × 備蓄日数
 *   perPerson     … 備蓄日数に依存せず、1人あたり必要な量（人数分のみ）
 *   perHousehold  … 備蓄日数にも人数にも依存しない、世帯あたりの固定量
 *
 * perDay / perWeek のキーは adult / child / infant / dog / cat。
 * perPerson で乳児を数えるべきでない品目（軍手など）は
 * `perPersonExcludesInfant: true` を指定する。
 *
 * 【優先度】
 * - `importance` … 備えるべき優先度。1=必須 / 2=推奨 / 3=あると安心。
 *   ライフラインが止まった直後から必要になるものほど 1 に近づける。
 * - `priority` … 表示順のみを決める値。優先度とは別物。
 *
 * 【期限管理】
 * - `shelfLifeYears` … 一般的な保存期間の目安（年）。null の場合は期限管理の対象外。
 *   実際の期限は製品によって異なるため、あくまで初期値として扱う。
 *
 * 【出典】
 * - `sources` に一次資料を定義し、各商品の `sourceIds` からキーで参照する。
 * - 公的資料に該当する数値がない品目は `sourceIds` を空にし、
 *   `sourceNote` に当サイト独自の目安である旨と考え方を書く。
 * - 数値を変更するときは、必ず参照している資料の記載と突き合わせること。
 *   資料と異なる値にする場合は `sourceNote` にその理由を残す。
 */
Affiliate.registerProducts('disaster', {
    schemaVersion: 1,
    category: 'disaster',

    /** 数量の根拠として参照している一次資料 */
    sources: {
        'mhlw-simulator': {
            publisher: '厚生労働省',
            name: '大規模災害時に備えた栄養に配慮した食料備蓄・献立検討のための簡易シミュレーター（第1.0版）',
            url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000089299_00004.html',
            figures: '水は「調理用・飲用を合わせた1人あたり1日3リットル」を基準として算出、と手引きに明記。'
        },
        'mhlw-shelter-nutrition': {
            publisher: '厚生労働省',
            name: '大規模災害時の栄養・食生活支援（避難所における食事提供に係る適切な栄養管理の実施について）',
            url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000089299_00005.html',
            figures: '避難所における食事提供の評価・計画のための栄養の参照量。1人1日あたりエネルギー約2,000kcal、たんぱく質約55gなど。'
        },
        'maff-stockguide': {
            publisher: '農林水産省',
            name: '家庭備蓄ポータル／災害時に備えた食品ストックガイド',
            url: 'https://www.maff.go.jp/j/zyukyu/foodstock/',
            figures: '最低3日分～1週間分×人数分の家庭備蓄が望ましい。ローリングストックでの管理を推奨。'
        },
        'maff-iroha': {
            publisher: '農林水産省',
            name: 'aff（あふ）2026年3月号 知って備える 家庭備蓄のイロハ',
            url: 'https://www.maff.go.jp/j/pr/aff/2603/spe1_01.html',
            figures: '大人2人1週間分の例。水2L×6本×4箱（1人1日約3L）、米2kg×2袋（1人1食75g）、'
                + 'レトルト食品18個、缶詰18缶、カセットコンロ1台、カセットボンベ12本（1人1週間約6本）。'
        },
        'cao-toilet': {
            publisher: '内閣府（防災担当）',
            name: '避難所におけるトイレの確保・管理ガイドライン（令和6年12月改定）',
            url: 'https://www.bousai.go.jp/taisaku/hinanjo/pdf/2412hinanjo_toilet_guideline.pdf',
            figures: '1日あたり必要な便袋の枚数＝避難者数×5回。排泄の回数は5回が平均的とされる。'
        },
        'tokyo-bichiku': {
            publisher: '東京都',
            name: '東京備蓄ナビ',
            url: 'https://www.bichiku.metro.tokyo.lg.jp/',
            figures: '家族構成から算出される1日あたりの目安。水3L（乳幼児2.4L）、携帯トイレ5回、マスク1枚、'
                + '缶詰1缶、栄養補助食品1箱、液体ミルク6食、離乳食3食、おむつ10個、口内洗浄液90mL。'
                + '給水袋・軍手は1人1つ、救急箱・ラジオは世帯に1つ。'
        },
        'env-pet': {
            publisher: '環境省',
            name: '人とペットの災害対策ガイドライン',
            url: 'https://www.env.go.jp/nature/dobutsu/aigo/2_data/pamph/h3002.html',
            figures: '持ち出しの優先順位1として「ペットフード、水（少なくとも5日分［できれば7日分以上］）」。'
        },
        'caa-liquid-milk': {
            publisher: '消費者庁',
            name: '乳児用液体ミルクってなに？',
            url: 'https://www.caa.go.jp/policies/policy/food_labeling/foods_for_special_dietary_uses/assets/food_labeling_cms206_20230927_08.pdf',
            figures: 'お湯が不要で災害時や備蓄に適する。常温保存が可能で、保存期間は紙パック約6か月、缶約1年。'
        }
    },

    products: [
        // ---- 水 ----
        {
            id: 'water',
            label: '水',
            name: '長期保存水',
            unit: 'L',
            note: '飲料と調理をあわせた量。ペットの分も含みます。',
            searchKeyword: '長期保存水 5年',
            asin: null,
            perDay: { adult: 3, child: 3, infant: 2.4, dog: 0.5, cat: 0.2 },
            sourceIds: ['mhlw-simulator', 'maff-iroha', 'tokyo-bichiku'],
            sourceNote: '人の量は公的資料の1人1日3L（乳児は東京備蓄ナビの2.4L）。'
                + '犬・猫の量は公的な数値が見当たらないため、体重あたりの一般的な飲水量から置いた当サイトの目安です。',
            importance: 1,
            shelfLifeYears: 5,
            priority: 10
        },
        {
            id: 'water-bag',
            label: '水',
            name: '給水袋・ウォータータンク',
            unit: '個',
            note: '給水車から水を受け取るために必要。担いで運べる容量のものを選ぶ。',
            searchKeyword: '給水袋 折りたたみ',
            asin: null,
            perPerson: 1,
            sourceIds: ['tokyo-bichiku'],
            importance: 2,
            shelfLifeYears: null,
            priority: 11
        },

        // ---- 食料 ----
        {
            id: 'rice',
            label: '食料',
            name: 'アルファ米・非常用ごはん',
            unit: '食',
            note: '主食。水またはお湯で戻せるもの。1日2食分を主食で確保する想定です。',
            searchKeyword: 'アルファ米 非常食 5年',
            asin: null,
            perDay: { adult: 2, child: 2 },
            sourceIds: ['maff-iroha', 'maff-stockguide', 'tokyo-bichiku'],
            sourceNote: '公的資料の主食は1人1日3食相当（米1人1食75g、レトルトご飯3食など）。'
                + '本ツールはそのうち2食をアルファ米で確保し、残りを缶詰・補助食で補う想定にしています。',
            importance: 1,
            shelfLifeYears: 5,
            priority: 20
        },
        {
            id: 'canned-food',
            label: '食料',
            name: '缶詰・レトルト惣菜',
            unit: '食',
            note: '主菜。加熱せずに食べられるものを中心に。1日1食分を想定しています。',
            searchKeyword: '非常食 缶詰 セット',
            asin: null,
            perDay: { adult: 1, child: 1 },
            sourceIds: ['tokyo-bichiku', 'maff-iroha', 'mhlw-shelter-nutrition'],
            importance: 1,
            shelfLifeYears: 3,
            priority: 21
        },
        {
            id: 'supplement-food',
            label: '食料',
            name: '栄養補助食品・ようかん・ビスケット',
            unit: '食',
            note: '調理せずに食べられる補助食。1日1食分を想定しています。',
            searchKeyword: '非常食 ようかん ビスケット 長期保存',
            asin: null,
            perDay: { adult: 1, child: 1 },
            sourceIds: ['tokyo-bichiku', 'mhlw-shelter-nutrition'],
            importance: 2,
            shelfLifeYears: 3,
            priority: 22
        },
        {
            id: 'liquid-milk',
            label: '食料',
            name: '乳児用液体ミルク',
            unit: '本',
            note: 'お湯が不要で、開封してすぐ飲ませられます。使用期限が短いため入れ替えの管理が重要です。',
            searchKeyword: '乳児用 液体ミルク',
            asin: null,
            perDay: { infant: 6 },
            sourceIds: ['tokyo-bichiku', 'caa-liquid-milk'],
            sourceNote: '保存期間は紙パックで約6か月、缶で約1年（消費者庁）。初期値は1年にしているため、'
                + '紙パックの製品では保存年数を短く設定してください。',
            importance: 1,
            shelfLifeYears: 1,
            priority: 23
        },
        {
            id: 'baby-food',
            label: '食料',
            name: 'ベビーフード',
            unit: '食',
            note: '月齢に合ったものを。加熱せず食べられるタイプが役立ちます。',
            searchKeyword: 'ベビーフード 常温 レトルト',
            asin: null,
            perDay: { infant: 3 },
            sourceIds: ['tokyo-bichiku'],
            importance: 1,
            shelfLifeYears: 1,
            priority: 24
        },
        {
            id: 'pet-food-stock',
            label: '食料',
            name: 'ペット用フード（備蓄用）',
            unit: 'g',
            note: '普段与えているフードを多めに買い、古いものから使って入れ替えると管理しやすくなります。',
            searchKeyword: 'ペットフード 保存',
            asin: null,
            perDay: { dog: 200, cat: 60 },
            sourceIds: ['env-pet'],
            sourceNote: '環境省が示すのは日数（少なくとも5日分、できれば7日分以上）で、量の記載はありません。'
                + '1日あたりのグラム数は中型犬・成猫の一般的な給与量から置いた当サイトの目安です。',
            importance: 1,
            shelfLifeYears: 1,
            priority: 25
        },

        // ---- 熱源・調理 ----
        {
            id: 'cassette-gas',
            label: '熱源・調理',
            name: 'カセットガス（ボンベ）',
            unit: '本',
            note: '1人1週間あたり約6本が目安。使用期限は製造から6〜7年程度です。',
            searchKeyword: 'カセットガス ボンベ',
            asin: null,
            perWeek: { adult: 6, child: 6 },
            sourceIds: ['maff-iroha'],
            importance: 2,
            shelfLifeYears: 7,
            priority: 30
        },
        {
            id: 'cassette-stove',
            label: '熱源・調理',
            name: 'カセットコンロ',
            unit: '台',
            note: 'ボンベの規格が本体に合っているか確認してください。',
            searchKeyword: 'カセットコンロ',
            asin: null,
            perHousehold: 1,
            sourceIds: ['maff-iroha', 'tokyo-bichiku'],
            importance: 2,
            shelfLifeYears: null,
            priority: 31
        },
        {
            id: 'wrap',
            label: '熱源・調理',
            name: 'ラップ',
            unit: '本',
            note: '食器に敷けば洗わずに使い回せます。水が使えない状況で効果が大きい品目です。',
            searchKeyword: '食品用ラップ',
            asin: null,
            householdPerDay: 0.2,
            sourceIds: [],
            sourceNote: '公的資料でも備える品目として挙げられていますが、数量の記載がないため当サイトの目安です。',
            importance: 3,
            shelfLifeYears: null,
            priority: 32
        },
        {
            id: 'tableware',
            label: '熱源・調理',
            name: '紙皿・紙コップ・割り箸',
            unit: 'セット',
            note: '洗い物に水を使わずに済みます。',
            searchKeyword: '紙皿 紙コップ 割り箸 セット',
            asin: null,
            perDay: { adult: 1, child: 1, infant: 1 },
            sourceIds: [],
            sourceNote: '1人1日1セット（1食ごとの使い捨てを見込んだ概算）とした当サイトの目安です。',
            importance: 2,
            shelfLifeYears: null,
            priority: 33
        },

        // ---- トイレ・衛生 ----
        {
            id: 'portable-toilet',
            label: 'トイレ・衛生',
            name: '簡易トイレ・凝固剤',
            unit: '回',
            note: '1人1日5回を目安としています。断水時に最も不足しやすい品目です。',
            searchKeyword: '簡易トイレ 凝固剤 非常用',
            asin: null,
            perDay: { adult: 5, child: 5 },
            sourceIds: ['cao-toilet', 'tokyo-bichiku'],
            sourceNote: '乳児はおむつで数えるため、この品目では0としています（東京備蓄ナビと同じ扱い）。',
            importance: 1,
            shelfLifeYears: 10,
            priority: 40
        },
        {
            id: 'plastic-bags',
            label: 'トイレ・衛生',
            name: 'ポリ袋（各サイズ）',
            unit: '枚',
            note: 'ごみ処理、簡易トイレ、防寒、調理まで用途が広い品目です。',
            searchKeyword: 'ポリ袋 大 厚手',
            asin: null,
            perDay: { adult: 3, child: 3, infant: 3 },
            sourceIds: [],
            sourceNote: '公的資料でも備える品目として挙げられていますが、数量の記載がないため当サイトの目安です。',
            importance: 1,
            shelfLifeYears: null,
            priority: 41
        },
        {
            id: 'wet-tissue',
            label: 'トイレ・衛生',
            name: 'ウェットティッシュ・体拭きシート',
            unit: 'パック',
            note: '入浴できない期間の衛生保持に。大判のものが使いやすいです。',
            searchKeyword: '体拭きシート 大判 防災',
            asin: null,
            householdPerDay: 0.5,
            sourceIds: ['tokyo-bichiku'],
            sourceNote: '東京備蓄ナビは体拭きシートを1人1日1枚としています。'
                + '本ツールはパック単位で数えるため、世帯で1日0.5パックに換算した当サイトの目安です。',
            importance: 2,
            shelfLifeYears: 3,
            priority: 42
        },
        {
            id: 'diapers',
            label: 'トイレ・衛生',
            name: '紙おむつ',
            unit: '枚',
            note: '1日10枚を目安としています。成長に合わせてサイズの入れ替えが必要です。',
            searchKeyword: '紙おむつ',
            asin: null,
            perDay: { infant: 10 },
            sourceIds: ['tokyo-bichiku'],
            importance: 1,
            shelfLifeYears: null,
            priority: 43
        },
        {
            id: 'baby-wipes',
            label: 'トイレ・衛生',
            name: 'おしりふき',
            unit: 'パック',
            note: '手や体を拭く用途にも使えます。',
            searchKeyword: 'おしりふき',
            asin: null,
            perDay: { infant: 0.3 },
            sourceIds: ['tokyo-bichiku'],
            sourceNote: '東京備蓄ナビは1日1パックとしていますが、1パックの枚数が多い製品が一般的なため、'
                + '本ツールは1日0.3パック（3日で1パック程度）に抑えた当サイトの目安です。',
            importance: 1,
            shelfLifeYears: null,
            priority: 44
        },
        {
            id: 'oral-care',
            label: 'トイレ・衛生',
            name: '液体歯磨き・歯磨きシート',
            unit: '本',
            note: '水を使わずに口腔を清潔に保てます。高齢者の肺炎予防の観点でも重視されます。',
            searchKeyword: '液体歯磨き 洗口液 防災',
            asin: null,
            perPerson: 1,
            perPersonExcludesInfant: true,
            sourceIds: ['tokyo-bichiku'],
            sourceNote: '東京備蓄ナビは口内洗浄液を1人1日90mLとしています。1週間で約630mLとなるため、'
                + '本ツールでは1人1本として数えています。',
            importance: 3,
            shelfLifeYears: 3,
            priority: 45
        },

        // ---- 電源・照明 ----
        {
            id: 'power-bank',
            label: '電源・照明',
            name: 'モバイルバッテリー',
            unit: 'Wh',
            note: 'スマートフォン1回の充電を約15Whとして算出しています。経年で劣化するため定期的な確認を。',
            searchKeyword: 'モバイルバッテリー 大容量',
            asin: null,
            perDay: { adult: 15, child: 5 },
            sourceIds: [],
            sourceNote: '公的資料に容量の目安がないため、スマートフォンの一般的な電池容量（約15Wh）から'
                + '1日1回の充電を見込んだ当サイトの目安です。',
            importance: 1,
            shelfLifeYears: 3,
            priority: 50
        },
        {
            id: 'lantern',
            label: '電源・照明',
            name: 'LEDランタン・懐中電灯',
            unit: '個',
            note: '各自が1つ持てる数を用意し、両手が空くランタン型を中心にすると安全です。',
            searchKeyword: 'LEDランタン 防災',
            asin: null,
            perPerson: 1,
            sourceIds: ['tokyo-bichiku'],
            sourceNote: '東京備蓄ナビはLEDランタンを最低3台、ヘッドライトを1人1個としています。'
                + '本ツールは1人1個としています。',
            importance: 1,
            shelfLifeYears: null,
            priority: 51
        },
        {
            id: 'batteries',
            label: '電源・照明',
            name: '乾電池',
            unit: '本',
            note: '機器に合う規格を確認してください。使用推奨期限があるため入れ替えの管理が必要です。',
            searchKeyword: '乾電池 単3 単4 セット',
            asin: null,
            perPerson: 4,
            perHousehold: 8,
            sourceIds: ['tokyo-bichiku'],
            sourceNote: '東京備蓄ナビは「単1〜単4までのセット」を1人1セットとしています。'
                + '本数での目安は当サイトが置いたものです。',
            importance: 2,
            shelfLifeYears: 5,
            priority: 52
        },
        {
            id: 'radio',
            label: '電源・照明',
            name: '携帯ラジオ',
            unit: '台',
            note: '通信が使えない状況の情報源。手回し充電に対応したものが安心です。',
            searchKeyword: '防災ラジオ 手回し',
            asin: null,
            perHousehold: 1,
            sourceIds: ['tokyo-bichiku'],
            importance: 2,
            shelfLifeYears: null,
            priority: 53
        },

        // ---- 保温・保護 ----
        {
            id: 'emergency-blanket',
            label: '保温・保護',
            name: 'アルミ保温シート',
            unit: '枚',
            note: '体温の低下を防ぐためのもの。かさばらないため人数分の備蓄がしやすいです。',
            searchKeyword: 'アルミ 保温シート 防災',
            asin: null,
            perPerson: 1,
            sourceIds: [],
            sourceNote: '公的資料でも防寒対策として挙げられていますが、数量の記載がないため当サイトの目安です。',
            importance: 2,
            shelfLifeYears: null,
            priority: 60
        },
        {
            id: 'helmet',
            label: '保温・保護',
            name: 'ヘルメット・防災ずきん',
            unit: '個',
            note: '落下物から頭部を守るためのもの。すぐ取り出せる場所に置いてください。',
            searchKeyword: '防災ヘルメット 折りたたみ',
            asin: null,
            perPerson: 1,
            sourceIds: [],
            sourceNote: '数量の記載がある公的資料が見当たらないため、1人1個とした当サイトの目安です。',
            importance: 2,
            shelfLifeYears: null,
            priority: 61
        },
        {
            id: 'gloves',
            label: '保温・保護',
            name: '軍手・作業用手袋',
            unit: '双',
            note: 'ガラス片や瓦礫から手を守ります。厚手のものを選んでください。',
            searchKeyword: '作業用手袋 厚手',
            asin: null,
            perPerson: 1,
            perPersonExcludesInfant: true,
            sourceIds: ['tokyo-bichiku'],
            importance: 2,
            shelfLifeYears: null,
            priority: 62
        },
        {
            id: 'first-aid',
            label: '保温・保護',
            name: '救急セット',
            unit: 'セット',
            note: '常用薬がある場合は別途多めに用意し、かかりつけ医に相談してください。',
            searchKeyword: '救急セット 防災',
            asin: null,
            perHousehold: 1,
            sourceIds: ['tokyo-bichiku'],
            importance: 2,
            shelfLifeYears: 3,
            priority: 63
        },
        {
            id: 'mask',
            label: '保温・保護',
            name: 'マスク',
            unit: '枚',
            note: '粉塵の吸入を防ぐ用途もあります。',
            searchKeyword: 'マスク 防塵',
            asin: null,
            perDay: { adult: 1, child: 1 },
            sourceIds: ['tokyo-bichiku'],
            importance: 3,
            shelfLifeYears: null,
            priority: 64
        }
    ]
});
