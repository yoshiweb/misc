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
 *   householdPerDay … 世帯単位で1日あたり必要な量 × 備蓄日数
 *   perPerson     … 備蓄日数に依存せず、1人あたり必要な量（人数分のみ）
 *   perHousehold  … 備蓄日数にも人数にも依存しない、世帯あたりの固定量
 *
 * perDay のキーは adult / child / infant / dog / cat。
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
 */
Affiliate.registerProducts('disaster', {
    schemaVersion: 1,
    category: 'disaster',
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
            perDay: { adult: 3, child: 2, infant: 1, dog: 0.5, cat: 0.2 },
            shelfLifeYears: 5,
            importance: 1,
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
            shelfLifeYears: null,
            importance: 2,
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
            shelfLifeYears: 5,
            importance: 1,
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
            shelfLifeYears: 3,
            importance: 1,
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
            shelfLifeYears: 3,
            importance: 2,
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
            perDay: { infant: 5 },
            shelfLifeYears: 1,
            importance: 1,
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
            shelfLifeYears: 1,
            importance: 1,
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
            shelfLifeYears: 1,
            importance: 1,
            priority: 25
        },

        // ---- 熱源・調理 ----
        {
            id: 'cassette-gas',
            label: '熱源・調理',
            name: 'カセットガス（ボンベ）',
            unit: '本',
            note: '1本あたりの燃焼時間は強火で1時間前後。1日1本を目安としています。',
            searchKeyword: 'カセットガス ボンベ',
            asin: null,
            householdPerDay: 1,
            shelfLifeYears: 7,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 3,
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
            shelfLifeYears: null,
            importance: 2,
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
            perDay: { adult: 5, child: 5, infant: 5 },
            shelfLifeYears: 10,
            importance: 1,
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
            shelfLifeYears: null,
            importance: 1,
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
            shelfLifeYears: 3,
            importance: 2,
            priority: 42
        },
        {
            id: 'diapers',
            label: 'トイレ・衛生',
            name: '紙おむつ',
            unit: '枚',
            note: '1日8枚を目安としています。成長に合わせてサイズの入れ替えが必要です。',
            searchKeyword: '紙おむつ',
            asin: null,
            perDay: { infant: 8 },
            shelfLifeYears: null,
            importance: 1,
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
            shelfLifeYears: null,
            importance: 1,
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
            shelfLifeYears: 3,
            importance: 3,
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
            shelfLifeYears: 3,
            importance: 1,
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
            shelfLifeYears: null,
            importance: 1,
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
            shelfLifeYears: 5,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 2,
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
            shelfLifeYears: 3,
            importance: 2,
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
            shelfLifeYears: null,
            importance: 3,
            priority: 64
        }
    ]
});
