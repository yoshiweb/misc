/**
 * ペット（犬・猫）用グッズの商品データ
 *
 * 【重要】
 * - 価格は保持しない。PA-API を利用していないため、規約上価格の掲載ができない。
 * - `asin` は実際の商品を確認したうえで手動で設定する。
 *   null のままでも `searchKeyword` による検索結果リンクとして機能する。
 * - `species` は対象種別（dog / cat）。
 * - `stages` は必要になる成長段階のキー。ツール側のステージ定義と対応する。
 *     arrival … 迎える準備 / growth1 … 社会化期 / growth2 … 成長期
 *     growth3 … 成長後期 / adult … 成犬・成猫期 / senior … シニア期
 * - `priority` は表示順（数値が小さいものを優先）。
 * - 医薬品・医薬部外品は扱わない。健康に関わるものは獣医師への相談を促す注記を添える。
 */
Affiliate.registerProducts('pet', {
    schemaVersion: 1,
    category: 'pet',
    products: [
        // ---- 迎える準備 ----
        {
            id: 'crate',
            label: 'ケージ・クレート',
            name: 'ペットケージ / クレート',
            note: '落ち着いて休める場所として最初に用意するもの。成長後の体格に合うサイズを選ぶ。',
            searchKeyword: 'ペットケージ',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['arrival'],
            priority: 10
        },
        {
            id: 'dog-toilet-tray',
            label: 'トイレ用品',
            name: 'トイレトレー',
            note: '迎えた初日から必要。成長後の体格に合うサイズを選ぶ。',
            searchKeyword: '犬 トイレトレー',
            asin: null,
            species: ['dog'],
            stages: ['arrival'],
            priority: 11
        },
        {
            id: 'cat-litter-box',
            label: 'トイレ用品',
            name: '猫用トイレ本体',
            note: '迎えた初日から必要。頭数 + 1個あると理想的とされる。',
            searchKeyword: '猫用トイレ 本体',
            asin: null,
            species: ['cat'],
            stages: ['arrival'],
            priority: 11
        },
        {
            id: 'bowl',
            label: '食器',
            name: 'フードボウル・食器スタンド',
            note: '首や関節への負担を抑えるため、体高に合った高さのものを選ぶ。',
            searchKeyword: 'ペット 食器 スタンド',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['arrival'],
            priority: 12
        },
        {
            id: 'water-dispenser',
            label: '給水器',
            name: '自動給水器・ウォーターボウル',
            note: '常に新鮮な水を飲めるようにするためのもの。',
            searchKeyword: 'ペット 自動給水器',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['arrival'],
            priority: 13
        },
        {
            id: 'bed',
            label: 'ベッド',
            name: 'ペットベッド',
            note: '洗えるタイプが扱いやすい。',
            searchKeyword: 'ペットベッド 洗える',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['arrival'],
            priority: 14
        },
        {
            id: 'deodorizer',
            label: '消臭・掃除',
            name: 'ペット用消臭剤・クリーナー',
            note: 'トイレの失敗が多い時期は特に使用頻度が高い。',
            searchKeyword: 'ペット用 消臭剤',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['arrival', 'growth1', 'growth2', 'growth3', 'adult', 'senior'],
            priority: 80,
            consumable: true,
            cycleDays: 60
        },

        // ---- 消耗品（全期間を通じて継続的に補充するもの） ----
        {
            id: 'pet-sheets',
            label: 'トイレ用品',
            name: 'ペットシーツ',
            note: '継続的に補充が必要。体格が大きくなるとサイズと消費量が変わる。',
            searchKeyword: 'ペットシーツ',
            asin: null,
            species: ['dog'],
            stages: ['arrival', 'growth1', 'growth2', 'growth3', 'adult', 'senior'],
            priority: 6,
            consumable: true,
            cycleDays: 30
        },
        {
            id: 'cat-litter',
            label: 'トイレ用品',
            name: '猫砂',
            note: '継続的に補充が必要。猫は砂の好みが分かれるため、合うものが見つかったら銘柄を変えないほうがよい。',
            searchKeyword: '猫砂',
            asin: null,
            species: ['cat'],
            stages: ['arrival', 'growth1', 'growth2', 'growth3', 'adult', 'senior'],
            priority: 6,
            consumable: true,
            cycleDays: 30
        },

        // ---- フード ----
        {
            id: 'puppy-food',
            label: 'フード',
            name: '子犬用（パピー）フード',
            note: '成長期は高カロリー・高タンパクの子犬用を与える。切り替えは1〜2週間かけて少しずつ。',
            searchKeyword: '子犬用 ドッグフード パピー',
            asin: null,
            species: ['dog'],
            stages: ['arrival', 'growth1', 'growth2', 'growth3'],
            priority: 5,
            consumable: true,
            // フードは給与量と袋のサイズから消費日数を算出するため、既定サイクルを持たない
            consumableType: 'food'
        },
        {
            id: 'kitten-food',
            label: 'フード',
            name: '子猫用（キトン）フード',
            note: '成長期は高カロリー・高タンパクの子猫用を与える。切り替えは1〜2週間かけて少しずつ。',
            searchKeyword: '子猫用 キャットフード キトン',
            asin: null,
            species: ['cat'],
            stages: ['arrival', 'growth1', 'growth2', 'growth3'],
            priority: 5,
            consumable: true,
            // フードは給与量と袋のサイズから消費日数を算出するため、既定サイクルを持たない
            consumableType: 'food'
        },
        {
            id: 'adult-dog-food',
            label: 'フード',
            name: '成犬用ドッグフード',
            note: '成犬期に入る前から少量ずつ混ぜて切り替えていく。',
            searchKeyword: '成犬用 ドッグフード',
            asin: null,
            species: ['dog'],
            stages: ['growth3', 'adult'],
            priority: 5,
            consumable: true,
            // フードは給与量と袋のサイズから消費日数を算出するため、既定サイクルを持たない
            consumableType: 'food'
        },
        {
            id: 'adult-cat-food',
            label: 'フード',
            name: '成猫用キャットフード',
            note: '成猫期に入る前から少量ずつ混ぜて切り替えていく。',
            searchKeyword: '成猫用 キャットフード',
            asin: null,
            species: ['cat'],
            stages: ['growth3', 'adult'],
            priority: 5,
            consumable: true,
            // フードは給与量と袋のサイズから消費日数を算出するため、既定サイクルを持たない
            consumableType: 'food'
        },
        {
            id: 'senior-dog-food',
            label: 'フード',
            name: 'シニア犬用ドッグフード',
            note: '活動量の低下に合わせてカロリーを抑えたもの。切り替え時期は獣医師に相談を。',
            searchKeyword: 'シニア犬用 ドッグフード',
            asin: null,
            species: ['dog'],
            stages: ['senior'],
            priority: 5,
            consumable: true,
            // フードは給与量と袋のサイズから消費日数を算出するため、既定サイクルを持たない
            consumableType: 'food'
        },
        {
            id: 'senior-cat-food',
            label: 'フード',
            name: 'シニア猫用キャットフード',
            note: '活動量の低下に合わせてカロリーを抑えたもの。切り替え時期は獣医師に相談を。',
            searchKeyword: 'シニア猫用 キャットフード',
            asin: null,
            species: ['cat'],
            stages: ['senior'],
            priority: 5,
            consumable: true,
            // フードは給与量と袋のサイズから消費日数を算出するため、既定サイクルを持たない
            consumableType: 'food'
        },

        // ---- 社会化期 ----
        {
            id: 'collar-leash',
            label: '散歩用品',
            name: '首輪・ハーネス・リード',
            note: 'ワクチン接種後の散歩開始に向けて用意する。成長が速い時期はサイズ調整幅の広いものを。',
            searchKeyword: '子犬 ハーネス リード',
            asin: null,
            species: ['dog'],
            stages: ['growth1', 'growth2'],
            priority: 20
        },
        {
            id: 'id-tag',
            label: '迷子対策',
            name: '迷子札・ネームタグ',
            note: '鑑札・注射済票とあわせて装着する。',
            searchKeyword: 'ペット 迷子札',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth1'],
            priority: 21
        },
        {
            id: 'toys',
            label: 'おもちゃ',
            name: 'ペット用おもちゃ',
            note: '誤飲を防ぐため、体格に対して十分な大きさのものを選ぶ。',
            searchKeyword: 'ペット おもちゃ',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth1', 'growth2', 'growth3', 'adult'],
            priority: 30
        },
        {
            id: 'brush',
            label: 'お手入れ',
            name: 'ブラシ・コーム',
            note: '毛質に合ったものを選ぶ。早い時期から慣らしておくと後が楽になる。',
            searchKeyword: 'ペット ブラシ',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth1', 'growth2', 'growth3', 'adult', 'senior'],
            priority: 31
        },
        {
            id: 'carrier',
            label: 'キャリー',
            name: 'キャリーバッグ・キャリーケース',
            note: '通院や移動に必須。成長後の体格に合うサイズを選ぶ。',
            searchKeyword: 'ペット キャリーバッグ',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth1', 'growth2'],
            priority: 22
        },
        {
            id: 'scratching-post',
            label: '爪とぎ',
            name: '爪とぎ',
            note: '家具で研ぐ習慣がつく前に用意する。素材や向き（縦・横）の好みが分かれる。',
            searchKeyword: '猫 爪とぎ',
            asin: null,
            species: ['cat'],
            stages: ['growth1', 'growth2', 'adult'],
            priority: 20
        },

        // ---- 成長期（歯の生え替わり） ----
        {
            id: 'dental-toy',
            label: 'デンタルケア',
            name: '噛むおもちゃ・デンタルトイ',
            note: '歯が生え替わる時期は噛みたい欲求が強くなる。家具の噛み癖対策にもなる。',
            searchKeyword: '犬 噛むおもちゃ デンタル',
            asin: null,
            species: ['dog'],
            stages: ['growth2', 'growth3'],
            priority: 25
        },
        {
            id: 'toothbrush',
            label: 'デンタルケア',
            name: '歯ブラシ・歯磨きペースト',
            note: '永久歯に生え替わる時期から習慣づけると受け入れやすい。',
            searchKeyword: 'ペット 歯ブラシ 歯磨き',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth2', 'growth3', 'adult', 'senior'],
            priority: 32,
            consumable: true,
            cycleDays: 90
        },
        {
            id: 'nail-clipper',
            label: 'お手入れ',
            name: 'ペット用爪切り',
            note: '深爪を防ぐため、少しずつ切る。',
            searchKeyword: 'ペット 爪切り',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth2', 'growth3', 'adult', 'senior'],
            priority: 33
        },
        {
            id: 'training-treats',
            label: 'しつけ',
            name: 'しつけ用トリーツ・おやつ',
            note: '小さくちぎれるものが使いやすい。1日の給与カロリーに含めて考える。',
            searchKeyword: '犬 しつけ用 おやつ',
            asin: null,
            species: ['dog'],
            stages: ['growth1', 'growth2', 'growth3'],
            priority: 26,
            consumable: true,
            cycleDays: 30
        },

        // ---- 成長後期・成犬成猫期 ----
        {
            id: 'collar-resize',
            label: '散歩用品',
            name: '成犬サイズの首輪・ハーネス',
            note: '体格が固まる時期。子犬用のものが調整幅の上限に達したら買い替える。',
            searchKeyword: '犬 ハーネス 成犬',
            asin: null,
            species: ['dog'],
            stages: ['growth3', 'adult'],
            priority: 23
        },
        {
            id: 'cat-tower',
            label: 'キャットタワー',
            name: 'キャットタワー',
            note: '上下運動できる場所。運動量が最も多い時期に用意すると使われやすい。',
            searchKeyword: 'キャットタワー',
            asin: null,
            species: ['cat'],
            stages: ['growth3', 'adult'],
            priority: 24
        },
        {
            id: 'shampoo',
            label: 'お手入れ',
            name: 'ペット用シャンプー',
            note: '皮膚が敏感な場合は獣医師に相談のうえ選ぶ。',
            searchKeyword: 'ペット用 シャンプー',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['growth3', 'adult', 'senior'],
            priority: 34
        },

        // ---- シニア期 ----
        {
            id: 'anti-slip-mat',
            label: '住環境',
            name: '滑り止めマット・タイルカーペット',
            note: 'フローリングでの滑りは足腰の負担になる。生活動線に敷くとよい。',
            searchKeyword: 'ペット 滑り止め マット',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['senior'],
            priority: 40
        },
        {
            id: 'pet-steps',
            label: '住環境',
            name: 'ペット用スロープ・ステップ',
            note: 'ソファやベッドへの昇降、段差の上り下りの負担を減らす。',
            searchKeyword: 'ペット用 スロープ ステップ',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['senior'],
            priority: 41
        },
        {
            id: 'joint-care',
            label: '健康管理',
            name: '関節ケア用サプリメント',
            note: '与える前に必ず獣医師に相談してください。摂取量は製品の表示に従ってください。',
            searchKeyword: 'ペット 関節 サプリメント',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['senior'],
            priority: 45
        },
        {
            id: 'pet-heater',
            label: '住環境',
            name: 'ペット用ヒーター・保温グッズ',
            note: '体温調節が苦手になる時期の寒さ対策。低温やけどを防げる構造のものを選ぶ。',
            searchKeyword: 'ペット用 ヒーター',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['senior'],
            priority: 42
        },
        {
            id: 'pet-diaper',
            label: '介護',
            name: 'ペット用おむつ・マナーベルト',
            note: '粗相が増えてきた場合の生活対策。原因の確認は獣医師に相談を。',
            searchKeyword: 'ペット用 おむつ',
            asin: null,
            species: ['dog', 'cat'],
            stages: ['senior'],
            priority: 43
        },
        {
            id: 'cat-low-litter-box',
            label: 'トイレ用品',
            name: '入口が低い猫用トイレ',
            note: '段差をまたぐのが負担になってきた場合に。',
            searchKeyword: '猫トイレ 入口 低い シニア',
            asin: null,
            species: ['cat'],
            stages: ['senior'],
            priority: 44
        }
    ]
});
