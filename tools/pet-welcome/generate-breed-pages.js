const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'breeds');
const site = 'https://misc.yoshiweb.net';
const catalog = {
  dog: [
    ['超小型犬', ['チワワ', 'トイ・プードル', 'ポメラニアン', 'ヨークシャー・テリア', 'マルチーズ', 'パピヨン', 'ミニチュア・ピンシャー', 'イタリアン・グレーハウンド']],
    ['小型犬', ['柴犬', 'ミニチュア・ダックスフンド', 'シー・ズー', 'ミニチュア・シュナウザー', 'ジャック・ラッセル・テリア', 'フレンチ・ブルドッグ', 'パグ', 'ビーグル', 'キャバリア・キング・チャールズ・スパニエル', 'ウェルシュ・コーギー・ペンブローク']],
    ['中型犬', ['ボーダー・コリー', 'シェットランド・シープドッグ', 'アメリカン・コッカー・スパニエル', '日本スピッツ', 'ウィペット', '甲斐犬', '紀州犬']],
    ['大型犬', ['ゴールデン・レトリーバー', 'ラブラドール・レトリーバー', 'バーニーズ・マウンテン・ドッグ', 'ジャーマン・シェパード・ドッグ', 'シベリアン・ハスキー', 'ドーベルマン', 'グレート・ピレニーズ', '秋田犬', 'ボルゾイ']]
  ],
  cat: [
    ['小柄な猫', ['シャム', 'オリエンタル・ショートヘア', 'シンガプーラ', 'コーニッシュレックス', 'デボンレックス']],
    ['標準的な猫', ['日本猫・雑種', 'アメリカン・ショートヘア', 'スコティッシュフォールド', 'マンチカン', 'ロシアンブルー', 'ブリティッシュ・ショートヘア', 'ペルシャ', 'ベンガル', 'アビシニアン', 'ソマリ', 'エキゾチックショートヘア']],
    ['大型の猫', ['メインクーン', 'ノルウェージャン・フォレスト・キャット', 'ラグドール', 'サイベリアン', 'ラガマフィン']]
  ]
};
const slugs = {
  'チワワ':'chihuahua','トイ・プードル':'toy-poodle','ポメラニアン':'pomeranian','ヨークシャー・テリア':'yorkshire-terrier','マルチーズ':'maltese','パピヨン':'papillon','ミニチュア・ピンシャー':'miniature-pinscher','イタリアン・グレーハウンド':'italian-greyhound','柴犬':'shiba-inu','ミニチュア・ダックスフンド':'miniature-dachshund','シー・ズー':'shih-tzu','ミニチュア・シュナウザー':'miniature-schnauzer','ジャック・ラッセル・テリア':'jack-russell-terrier','フレンチ・ブルドッグ':'french-bulldog','パグ':'pug','ビーグル':'beagle','キャバリア・キング・チャールズ・スパニエル':'cavalier-king-charles-spaniel','ウェルシュ・コーギー・ペンブローク':'welsh-corgi-pembroke','ボーダー・コリー':'border-collie','シェットランド・シープドッグ':'shetland-sheepdog','アメリカン・コッカー・スパニエル':'american-cocker-spaniel','日本スピッツ':'japanese-spitz','ウィペット':'whippet','甲斐犬':'kai-ken','紀州犬':'kishu-ken','ゴールデン・レトリーバー':'golden-retriever','ラブラドール・レトリーバー':'labrador-retriever','バーニーズ・マウンテン・ドッグ':'bernese-mountain-dog','ジャーマン・シェパード・ドッグ':'german-shepherd','シベリアン・ハスキー':'siberian-husky','ドーベルマン':'dobermann','グレート・ピレニーズ':'great-pyrenees','秋田犬':'akita','ボルゾイ':'borzoi','シャム':'siamese','オリエンタル・ショートヘア':'oriental-shorthair','シンガプーラ':'singapura','コーニッシュレックス':'cornish-rex','デボンレックス':'devon-rex','日本猫・雑種':'domestic-cat','アメリカン・ショートヘア':'american-shorthair','スコティッシュフォールド':'scottish-fold','マンチカン':'munchkin','ロシアンブルー':'russian-blue','ブリティッシュ・ショートヘア':'british-shorthair','ペルシャ':'persian','ベンガル':'bengal','アビシニアン':'abyssinian','ソマリ':'somali','エキゾチックショートヘア':'exotic-shorthair','メインクーン':'maine-coon','ノルウェージャン・フォレスト・キャット':'norwegian-forest-cat','ラグドール':'ragdoll','サイベリアン':'siberian','ラガマフィン':'ragamuffin'
};
const profiles = {
  'チワワ':['飼い主への愛着が強く、警戒心もある活発な小型犬です。','体は小さくても運動や社会化が必要で、寒さ・歯のケア・脱走対策を意識します。','音や来客への反応を穏やかにする練習を、無理のない範囲で続けましょう。'],
  'トイ・プードル':['人と遊ぶことを好み、学習意欲が高い犬種です。','抜け毛は比較的少ない一方、毛の手入れと定期的なトリミングが必要です。','留守番中の退屈を減らす知育遊びと、関節・歯のケアを準備します。'],
  'ポメラニアン':['活発で好奇心が強く、家族との遊びを楽しむ犬種です。','豊かな被毛のブラッシングと、興奮しすぎない生活リズムが大切です。','吠えやすさには個体差があるため、早めに静かに過ごす練習をします。'],
  'ヨークシャー・テリア':['人への関心が高く、気丈で活発な面を持つ犬種です。','細く長い被毛の手入れ、寒さ対策、小さな体に合う安全な家具を用意します。','小型犬として扱いすぎず、落ち着いた社会化と運動の機会をつくります。'],
  'マルチーズ':['人と過ごすことを好む、明るく親しみやすい犬種です。','白い被毛のケアや目の周りの手入れ、歯みがきを習慣にします。','依存が強くなりすぎないよう、短時間から一人で休む練習をします。'],
  'パピヨン':['賢く、遊びやトレーニングへの反応がよい犬種です。','小柄でも活動的なので、室内遊びだけでなく安全な運動時間を確保します。','賢さを持て余さないよう、散歩と知育遊びを毎日の予定に組み込みます。'],
  'ミニチュア・ピンシャー':['活発で自信があり、周囲への反応が速い犬種です。','筋肉質で運動量が必要ですが、寒さに弱い個体もいるため服や寝床を整えます。','刺激への反応を管理し、呼び戻しやリード歩行を丁寧に練習します。'],
  'イタリアン・グレーハウンド':['繊細で人との距離が近く、走ることを好む犬種です。','細い脚や体を守るため、滑りにくい床と段差・衝突の少ない環境をつくります。','寒さと急な運動に注意し、安心できる服と落ち着ける休息場所を用意します。'],
  '柴犬':['自立心があり、家族には忠実で警戒心も持つ犬種です。','換毛期のブラッシング、十分な散歩、距離を尊重した関わりが必要です。','抱っこや体の手入れを嫌がらないよう、子犬期から段階的に慣らします。'],
  'ミニチュア・ダックスフンド':['好奇心が強く、明るく人懐っこい一方、狩猟本能もある犬種です。','胴長の体を守るため、階段・ソファからの飛び降りや肥満に注意します。','吠えやすさや追いかけ行動を想定し、運動と落ち着く練習を両立します。'],
  'シー・ズー':['穏やかで人と過ごすことを好む、親しみやすい犬種です。','長い被毛、目の周り、暑さ、呼吸の状態に配慮した手入れをします。','顔周りのケアを嫌がらないよう、短時間から優しく練習します。'],
  'ミニチュア・シュナウザー':['活発で賢く、家族との活動を楽しむ犬種です。','定期的なトリミングと運動、歯や耳のケアを生活に組み込みます。','警戒吠えを減らすため、来客や音に慣れる練習を早めに始めます。'],
  'ジャック・ラッセル・テリア':['非常に活発で好奇心が強く、遊びと探索を好む犬種です。','体格以上の運動・遊びの欲求があり、退屈させない環境づくりが必要です。','小動物への追跡本能を想定し、脱走防止と呼び戻しを丁寧に練習します。'],
  'フレンチ・ブルドッグ':['人懐っこく、遊び好きで家族との時間を好む犬種です。','暑さや呼吸、皮膚の状態に注意し、温度管理と無理のない運動を行います。','短頭種に詳しい動物病院を見つけ、体重管理と健康記録を続けます。'],
  'パグ':['愛嬌があり、人と一緒に過ごすことを好む犬種です。','暑さ・呼吸・目や皮膚のケアに配慮し、肥満を防ぐ食事管理をします。','激しい運動や高温多湿を避け、体調の変化を早く相談できる準備をします。'],
  'ビーグル':['社交的で明るく、においを追うことを楽しむ犬種です。','食欲と探索欲が強いため、脱走・誤食対策と十分な散歩が必要です。','呼び戻しや拾い食い対策を、におい遊びと組み合わせて練習します。'],
  'キャバリア・キング・チャールズ・スパニエル':['穏やかで人懐っこく、家族と寄り添うことを好む犬種です。','耳の手入れや体重管理に加え、心臓などの健康チェックを継続します。','親しみやすさだけで判断せず、健康情報と定期検診の計画を確認します。'],
  'ウェルシュ・コーギー・ペンブローク':['明るく活動的で、学習意欲と牧羊犬らしい反応性を持つ犬種です。','胴長の体と関節を守るため、肥満・階段・滑る床に注意します。','吠えや追いかけ行動を安全に管理し、毎日の運動と頭の遊びを用意します。'],
  'ボーダー・コリー':['非常に賢く、飼い主と協働することを好む犬種です。','運動だけでなく、考える仕事やトレーニングの時間が必要です。','高い能力を持て余さないよう、毎日続けられる活動量を家族で確保します。'],
  'シェットランド・シープドッグ':['繊細で学習意欲が高く、家族への愛着が強い犬種です。','豊かな被毛の手入れと、音や人への警戒反応への配慮が必要です。','叱るよりも安心できる社会化と、落ち着く合図の練習を重ねます。'],
  'アメリカン・コッカー・スパニエル':['陽気で人懐っこく、遊びや家族との活動を好む犬種です。','長い耳と被毛の手入れ、皮膚・耳の状態の確認を習慣にします。','食事量と体重を管理し、定期的なトリミングを予定に入れます。'],
  '日本スピッツ':['明るく賢く、家族と活動することを楽しむ犬種です。','白い被毛のブラッシングと、警戒吠えを抑える環境づくりが大切です。','人や犬、音に少しずつ慣れる社会化を、安心できる距離から進めます。'],
  'ウィペット':['穏やかで人に寄り添う一方、走ることが好きな犬種です。','安全に走れる場所と、細身の体を守る暖かい寝床を用意します。','急な追跡を防ぐため、囲いとリードを使い分けて運動させます。'],
  '甲斐犬':['飼い主への忠誠心が強く、警戒心と判断力を持つ犬種です。','運動と刺激が必要で、他人や他犬への反応には個体差があります。','経験のある専門家に相談しながら、無理のない社会化を進めます。'],
  '紀州犬':['勇敢で自立心があり、家族には深い愛着を示す犬種です。','運動量と警戒心を想定し、十分な管理ができる住環境が必要です。','一貫したルールと信頼関係をつくり、力で抑えないトレーニングをします。'],
  'ゴールデン・レトリーバー':['友好的で人と協力することを好む、活動的な犬種です。','大型犬の体格と運動量、成長期の関節、抜け毛を見越して準備します。','食欲や興奮を管理し、散歩・水遊び・知育を安全に楽しませます。'],
  'ラブラドール・レトリーバー':['人懐っこく学習意欲が高く、遊び好きな犬種です。','成長が早く食欲も強いため、体重・関節・誤食の管理が重要です。','大きくなる前から、人への飛びつきや物をくわえる行動を教えます。'],
  'バーニーズ・マウンテン・ドッグ':['穏やかで家族思いですが、体が大きくゆったりした犬種です。','暑さに弱く、成長期の関節や大型犬特有の健康管理に配慮します。','十分な床面積と冷房、将来の通院・介護を見据えた生活動線を整えます。'],
  'ジャーマン・シェパード・ドッグ':['賢く忠実で、飼い主と仕事をすることを好む犬種です。','高い運動・訓練欲求と警戒心があるため、経験と管理できる環境が必要です。','社会化と服従訓練を専門家と進め、家族全員でルールを統一します。'],
  'シベリアン・ハスキー':['独立心があり、活発で人や仲間との活動を楽しむ犬種です。','運動量と抜け毛が多く、暑さ対策・脱走対策を特に重視します。','呼び戻しだけに頼らず、丈夫な囲いとリードで安全に運動させます。'],
  'ドーベルマン':['知的で敏捷、家族への結びつきが強い犬種です。','十分な運動と訓練に加え、寒さや体の状態を見守る環境が必要です。','警戒心を適切に育てるため、経験のある専門家と社会化を進めます。'],
  'グレート・ピレニーズ':['落ち着きと自立心があり、家族や住まいを守ろうとする犬種です。','非常に大きく被毛も豊かなので、広さ・暑さ対策・抜け毛への備えが必要です。','警戒吠えと力の強さを想定し、幼い時期から穏やかな誘導を学ばせます。'],
  '秋田犬':['家族への忠誠心が強く、落ち着きと自立心を持つ犬種です。','体が大きく警戒心もあるため、十分な運動と安全な管理環境が必要です。','他人や他犬への反応には個体差があるので、無理のない社会化を行います。'],
  'ボルゾイ':['穏やかで繊細、走ることを好む優雅な犬種です。','大きな体と追跡本能があり、安全に走れる場所と広い休息スペースが必要です。','驚かせない接し方と、囲い・リードによる脱走防止を徹底します。'],
  'シャム':['人との交流を好み、活発で声による表現が豊かな猫種です。','高い場所や遊び場を用意し、退屈と運動不足を防ぎます。','鳴き声の大きさや甘え方を含め、家族の生活リズムに合うか確認します。'],
  'オリエンタル・ショートヘア':['人への関心が強く、活発で好奇心旺盛な猫種です。','細身の体を動かせる上下運動と、毎日遊べる時間が必要です。','長時間の孤独が苦手な個体もいるため、留守番環境を工夫します。'],
  'シンガプーラ':['小柄で好奇心が強く、人に寄り添う傾向がある猫種です。','体が小さいため安全な隙間対策と、寒さを避けられる寝床を用意します。','活発な遊び時間と、安心して隠れられる場所を両方確保します。'],
  'コーニッシュレックス':['活発で遊び好き、人との交流を楽しむ猫種です。','短い被毛でも体温調節や皮膚の状態に配慮し、暖かい場所を用意します。','高い場所や知育玩具で運動と探索の機会をつくります。'],
  'デボンレックス':['人懐っこく、遊び好きで好奇心の強い猫種です。','独特の被毛の手入れと、寒さ・皮膚の状態への配慮が必要です。','人と一緒に遊ぶ時間を確保し、誤食しやすい小物を片づけます。'],
  '日本猫・雑種':['性格や体格、毛質の個体差が大きく、活発な子から穏やかな子までいます。','迎え先での生活歴と現在の性格を確認し、その子に合う環境を整えます。','年齢や保護された経緯に応じ、距離を尊重してゆっくり信頼関係を築きます。'],
  'アメリカン・ショートヘア':['社交的で適応力があり、遊びと穏やかな時間を両方楽しむ猫種です。','運動不足と体重増加を防ぐため、上下運動と食事量を管理します。','爪とぎや遊び場を複数用意し、家具への代替行動を教えます。'],
  'スコティッシュフォールド':['穏やかで人懐っこい個体が多い一方、性格には幅があります。','折れ耳の有無にかかわらず、関節や骨・軟骨の状態を慎重に確認します。','見た目だけで選ばず、健康情報と動物病院での定期確認を重視します。'],
  'マンチカン':['好奇心が強く、遊び好きで人との交流を楽しむ猫種です。','足の長さにかかわらず、関節・体重・高所からの落下に配慮します。','無理なジャンプをさせず、段差を分けた安全な上下運動を用意します。'],
  'ロシアンブルー':['穏やかで飼い主に深く懐き、環境の変化には慎重な猫種です。','静かに休める場所と、少しずつ慣れられる隠れ家を用意します。','来客や引っ越しの際は逃走防止を徹底し、急な環境変化を避けます。'],
  'ブリティッシュ・ショートヘア':['落ち着きがあり、自分の時間も大切にする猫種です。','筋肉質な体を保つため、食事と遊びのバランス、体重を管理します。','過度に構わず、猫から近づける距離感と爪とぎ場所を整えます。'],
  'ペルシャ':['穏やかでゆったりと過ごすことを好む猫種です。','長い被毛、目の周り、呼吸や暑さへの配慮を日々の手入れに含めます。','顔周りのケアを嫌がらないよう、短時間から優しく慣らします。'],
  'ベンガル':['活発で運動能力が高く、遊びや探索を好む猫種です。','高い場所、丈夫な爪とぎ、十分な遊び時間で運動欲求を満たします。','刺激不足によるいたずらを防ぐため、生活に知育遊びを組み込みます。'],
  'アビシニアン':['好奇心旺盛で活発、人との交流を楽しむ猫種です。','高所へのぼることを好むため、転倒しないキャットタワーを用意します。','遊びの時間と安全な探索範囲を確保し、脱走対策を徹底します。'],
  'ソマリ':['活発で賢く、遊びと人とのコミュニケーションを好む猫種です。','長めの被毛のブラッシングと、上下運動できる環境が必要です。','退屈しやすい個体もいるため、玩具をローテーションして遊びます。'],
  'エキゾチックショートヘア':['穏やかで人懐っこく、ゆったり過ごすことを好む猫種です。','目や顔周り、呼吸、暑さ、被毛の状態をこまめに確認します。','体重管理と定期的な健康チェックを行い、ケアを少しずつ習慣化します。'],
  'メインクーン':['穏やかで人懐っこく、体が大きくなる猫種です。','大型の体を支える丈夫な家具と大きめのトイレ、十分な食事管理が必要です。','成長がゆっくりなため、年齢に合う食事と関節への配慮を続けます。'],
  'ノルウェージャン・フォレスト・キャット':['落ち着きがあり、環境への適応力と好奇心を持つ猫種です。','豊かな被毛のブラッシングと、大きな体で使える上下運動の場が必要です。','高所から安全に降りられる動線と、抜け毛の掃除方法を準備します。'],
  'ラグドール':['穏やかで人に寄り添う傾向があり、ゆったりした猫種です。','大型の体と長い被毛に合わせ、大きなトイレ・寝床・定期的なブラッシングを用意します。','抱っこが好きとは限らないため、個体の意思を尊重して接します。'],
  'サイベリアン':['活発で賢く、人との交流や探索を楽しむ猫種です。','大型で被毛が豊かなため、十分な上下運動とブラッシング、暑さ対策が必要です。','丈夫な設備を用意し、体重・食事・毛球の状態を確認します。'],
  'ラガマフィン':['穏やかで人懐っこく、家族と静かに過ごすことを好む猫種です。','大型の体と長い被毛に合わせた用品、ブラッシング、体重管理が必要です。','安心して休める場所を用意し、無理に抱き上げず信頼を積み重ねます。']
};
const esc = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const flatten = species => catalog[species].flatMap(([size, breeds]) => breeds.map(breed => ({ size, breed })));
function articleContent(species, item, profile) {
  const kind = species === 'dog' ? '犬' : '猫';
  const isDog = species === 'dog';
  const exercise = isDog
    ? `${item.breed}は、体格だけで運動量を決めつけないことが大切です。毎日の散歩は排泄のためだけでなく、においを嗅ぎ、外の環境に慣れ、家族と歩調を合わせる時間でもあります。${profile[0]}という傾向を踏まえ、散歩・室内遊び・休息を組み合わせて、その子が落ち着いて過ごせる量を探しましょう。子犬期は骨や関節が成長途中なので、長時間の運動や無理なジャンプは避け、体調と翌日の様子を見ながら調整します。`
    : `${item.breed}は、室内で安全に動ける環境と、毎日短時間でも集中して遊べる時間が重要です。猫は運動量を一度に使い切るより、狩りに似た遊びを何度か行い、その後に食事や休息につなげると生活リズムを作りやすくなります。${profile[0]}という傾向を尊重し、触れ合いを押しつけず、猫から近づける距離を残しましょう。上下運動、隠れ場所、爪とぎを用意すると、安心して探索できます。`;
  const home = isDog
    ? `${item.size}に分類されることが多い${kind}ですが、住まいの広さだけでなく、床の滑りやすさ、段差、玄関や窓からの脱走防止を確認します。寝床は人の往来が多すぎず、家族の気配を感じられる場所に置きます。食器、トイレ、リードやキャリーは成長後の体格も考えて選び、将来の通院や災害時にも使えるかを確認しましょう。`
    : `${item.size}に分類されることが多い${kind}ですが、室内飼育では広さよりも立体的に使える安全な環境が大切です。窓・網戸・玄関の脱走対策、誤食しやすいひもや小物の片づけ、落下しない家具の固定を行います。トイレは静かで清潔に保ちやすい場所に複数候補を用意し、食事場所と水飲み場はトイレから離します。`;
  const care = isDog
    ? `被毛の長さや抜け毛、耳・歯・爪の手入れは、${item.breed}を迎える前に確認したい日課です。ブラシや歯ブラシをいきなり押しつけるのではなく、道具を見せる、体に一度触れる、短時間で終えるという順番で慣らします。トリミングが必要な場合は、料金・頻度・予約の取りやすさも含めて、無理なく続けられる店を探します。`
    : `被毛の長さにかかわらず、ブラッシング、爪とぎ、爪の確認、耳や目の周りの観察を習慣にします。${item.breed}の特徴として${profile[1]}ため、ケアを嫌な出来事にしない工夫が必要です。眠そうなときに短時間で終える、好物を使ってよい印象を作るなど、その子の反応を見ながら進めます。`;
  const health = `犬種・猫種の情報は、起こりやすい傾向を知る入口であって、診断や将来の病気を断定するものではありません。迎える前に、親やきょうだいの健康情報、これまでの診察・ワクチン・駆虫の記録、食事内容、排泄や睡眠の様子を確認します。${profile[2]}気になる症状がなくても、迎えた後の早い時期に動物病院を受診し、予防・避妊去勢・マイクロチップ・食事について相談できる関係を作りましょう。`;
  const family = `${item.breed}との暮らしが向いているかは、見た目や憧れよりも、毎日続けられる時間と環境で決まります。${isDog ? '散歩やトレーニングを担当できる人がいるか、雨の日や忙しい日にも代替手段があるか' : '毎日の遊びとトイレ掃除ができるか、長時間の留守番や来客時にも安心できる場所を用意できるか'}を家族で話し合います。旅行、引っ越し、出産、転職、介護など生活が変わったときの預け先も、迎える前に候補を調べておきましょう。`;
  return `<section class="article-body" aria-labelledby="guide-title"><div class="article-intro"><p class="eyebrow">LIVING GUIDE</p><h2 id="guide-title">${esc(item.breed)}との暮らしを具体的に考える</h2><p>${esc(item.breed)}を飼う前に知っておきたいのは、性格のイメージだけではありません。毎日の運動、住環境、手入れ、健康管理、家族の役割まで、迎えた後の生活を想像しておくことが大切です。ここでは${kind}種としての一般的な傾向を出発点に、準備の考え方を整理します。</p></div><section><h3>運動・遊び・コミュニケーション</h3><p>${esc(exercise)}</p></section><section><h3>住まいと毎日の生活</h3><p>${esc(home)}</p></section><section><h3>手入れを無理なく習慣にする</h3><p>${esc(care)}</p></section><section><h3>健康情報と動物病院</h3><p>${esc(health)}</p></section><section><h3>どんな家庭に向いているか</h3><p>${esc(family)}</p></section><section class="checklist"><h3>迎える前のチェックリスト</h3><ul><li>飼育できる住居で、家族全員が迎えることに同意している</li><li>毎日の世話・運動・掃除を担当する人と、代替担当を決めている</li><li>初期費用、毎月の費用、急な医療費を無理なく用意できる</li><li>迎え先から健康記録や食事・生活リズムを受け取れる</li><li>留守番、旅行、災害、飼い主の入院時の預け先を考えている</li></ul></section></section>`;
}
function requiredSections(species, item) {
  const kind = species === 'dog' ? '犬' : '猫';
  const supplies = species === 'dog'
    ? '年齢に合うフードと食器、トイレ用品、安心して休める場所、キャリー、首輪・リード、迷子対策、散歩用品、ブラシ、歯みがき用品を優先します。大型犬になる犬種では、成長後のサイズに合うサークルや寝床を買い直す費用も見込んでおきます。'
    : '年齢に合うフードと食器、猫用トイレと猫砂、キャリー、爪とぎ、隠れ場所、上下運動できる家具、ブラシ、迷子対策を優先します。体格や好みによってトイレやキャリーを買い替える可能性も考えます。';
  return `<section class="practical-guide"><h3>必要な手続きと確認先</h3><p>${kind}を迎える前に、迎え先から健康記録、ワクチン・駆虫歴、マイクロチップ情報、現在のフードや生活リズムを受け取ります。販売業者やブリーダーから購入する場合は、登録の有無、対面での説明、契約書と健康状態の説明を確認します。マイクロチップの変更登録、${species === 'dog' ? '犬の市区町村登録と狂犬病予防注射、' : ''}自治体の飼育ルールは、お住まいの地域の窓口と公式サイトで確認してください。<br><a href="https://www.env.go.jp/nature/dobutsu/aigo/pickup/owner.html" target="_blank" rel="noopener noreferrer">環境省：飼い主の方やこれからペットを飼う方へ</a>　<a href="https://www.env.go.jp/nature/dobutsu/aigo/pickup/chip.html" target="_blank" rel="noopener noreferrer">環境省：マイクロチップ登録</a></p></section><section class="practical-guide"><h3>将来かかる費用の目安</h3><p>初期費用は、迎え入れ費用とは別に、用品・初回受診・ワクチン・登録などを見込みます。毎月はフード、トイレ用品、予防、ケア、保険などがかかり、年齢や体格、地域、健康状態で大きく変わります。${kind}の種類だけで金額を決めず、急な診療、手術、介護、飼い主の入院や引っ越しにも備え、年間予算と緊急用の貯蓄を家族で決めておきましょう。費用試算は、当サイトの<a href="../../../">迎え入れ準備ノート</a>でも確認できます。</p></section><section class="practical-guide"><h3>最初にそろえたいもの</h3><p>${supplies}迎えた直後にすべてを完璧に揃えるより、まず安全・食事・排泄・休息・移動に必要なものを準備し、実際の体格や好みに合わせて追加します。誤食しやすい小物、コード、植物、薬品は先に片づけ、使い方を家族で共有しましょう。</p></section><section class="practical-guide responsibility"><h3>命を迎えるということ</h3><p>${item.breed}は、かわいい時期だけでなく、病気や老いを含めた一生を家族と暮らす存在です。毎日の世話をする人、代わりに支える人、留守番や旅行のときの預け先を決め、生活が変わっても最後まで飼い続けられるかを考えます。迷ったときに「今は飼わない」と判断することも、命に責任を持つための大切な選択です。</p></section>`;
}
function page(species, item, number) {
  const kind = species === 'dog' ? '犬' : '猫';
  const slug = slugs[item.breed];
  const profile = profiles[item.breed];
  const url = `${site}/tools/pet-welcome/breeds/${species}/${slug}/`;
  const image = `../../../../../assets/images/pet-calendar-breed-${species}-${String(number).padStart(2, '0')}.jpg`;
  const title = `${item.breed}を飼う前に｜性格・暮らし・準備物 | ペット迎え入れ準備ノート`;
  const description = `${item.breed}を迎える前に確認したい、暮らしの特徴、必要な準備、費用の考え方を整理。かわいさだけでなく、毎日の世話と将来まで考えるためのページです。`;
  return `<!doctype html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${site}/assets/images/pet-calendar-breed-${species}-${String(number).padStart(2, '0')}.jpg"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Article','headline':title,'description':description,'url':url,'image':`${site}/assets/images/pet-calendar-breed-${species}-${String(number).padStart(2, '0')}.jpg`})}</script><style>
body{margin:0;background:#f5f7f6;color:#26352d;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;line-height:1.8}.wrap{max-width:920px;margin:auto;padding:24px 18px 56px}.nav{font-size:14px;margin-bottom:20px}.nav a{color:#4338ca}.hero,.card,.profile,.article-body,.share-card{background:#fff;border:1px solid #e2e8f0;border-radius:22px;box-shadow:0 10px 28px #47556912}.hero{overflow:hidden}.hero img{display:block;width:100%;height:270px;object-fit:cover}.hero-copy{padding:28px}.eyebrow{color:#55705f;font-size:12px;font-weight:700;letter-spacing:.12em}.hero h1{margin:8px 0;font-size:clamp(28px,5vw,44px);line-height:1.3;color:#1e293b}.lead{color:#64748b}.profile{margin-top:20px;padding:24px}.profile h2{margin:0 0 16px;font-size:24px;color:#1e293b}.profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.profile-grid article{padding:16px;border-radius:15px;background:#f8fafc}.profile h3{margin:0 0 6px;font-size:16px;color:#55705f}.profile p{margin:0;color:#475569;font-size:14px}.profile-note{margin-top:16px!important;padding-top:14px;border-top:1px solid #e2e8f0;font-size:12px!important;color:#64748b!important}.article-body{margin-top:20px;padding:28px}.article-intro{padding-bottom:18px;border-bottom:1px solid #e2e8f0}.article-body h2{margin:0 0 10px;font-size:clamp(23px,3vw,30px);line-height:1.45;color:#1e293b}.article-body h3{margin:24px 0 8px;font-size:19px;color:#1e293b}.article-body p{margin:0;color:#475569;font-size:15px;line-height:2}.article-body ul{margin:8px 0 0;padding-left:1.4em;color:#475569;font-size:14px;line-height:2}.article-body li+li{margin-top:4px}.checklist{margin-top:24px;padding:18px 20px;border-radius:15px;background:#f0fdf4;border:1px solid #bbf7d0}.checklist h3{margin-top:0;color:#166534}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}.card{padding:22px}.card h2{margin:0 0 8px;font-size:20px;color:#1e293b}.card p{margin:0;color:#64748b;font-size:14px}.callout{margin-top:20px;padding:18px 20px;border-radius:16px;background:#eef2ff;color:#1e1b4b;font-size:14px}.share-card{margin-top:20px;padding:20px}.share-card h2{margin:0 0 6px;font-size:20px;color:#1e293b}.share-card p{margin:0 0 14px;color:#64748b;font-size:14px}.share-buttons>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:100%}.share-buttons a,.share-buttons button{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;min-height:44px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#334155;font:inherit;font-size:14px;font-weight:700;line-height:1.35;text-align:center;text-decoration:none;white-space:normal;cursor:pointer;transition:background-color .15s,border-color .15s,transform .15s}.share-buttons a:hover,.share-buttons button:hover{background:#f8fafc;border-color:#94a3b8}.share-buttons a:focus-visible,.share-buttons button:focus-visible{outline:3px solid #a5b4fc;outline-offset:2px}.share-buttons a.text-white{background:#4f46e5;border-color:#4f46e5;color:#fff}.share-buttons a.text-white:hover{background:#4338ca}.share-buttons button.text-slate-600{background:#f8fafc}.links{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.links a{display:inline-block;padding:10px 14px;border-radius:12px;background:#fff;border:1px solid #c7d2fe;color:#3730a3;font-weight:700;text-decoration:none;font-size:14px}@media(max-width:640px){.grid,.profile-grid{grid-template-columns:1fr}.hero img{height:190px}.hero-copy{padding:22px}.profile,.article-body{padding:20px}.share-card{padding:20px}.share-buttons>div{grid-template-columns:1fr}.wrap{padding:16px 12px 40px}}
</style></head><body><main class="wrap"><nav class="nav"><a href="../../../">← 迎え入れ準備ノート</a>　/　${kind}種別ページ</nav><article class="hero"><img src="${image}" alt="${esc(item.breed)}のイメージ" width="1536" height="1024"><div class="hero-copy"><p class="eyebrow">${kind.toUpperCase()} BREED GUIDE</p><h1>${esc(item.breed)}を飼う前に</h1><p class="lead">${esc(item.breed)}を家族に迎える前に、毎日の暮らしと準備を具体的に考えるためのガイドです。${kind}種による傾向は目安として、実際の性格・健康状態・年齢は一頭ずつ異なります。</p></div></article><section class="profile" aria-labelledby="profile-title"><h2 id="profile-title">${esc(item.breed)}の性格・特徴</h2><div class="profile-grid"><article><h3>性格の傾向</h3><p>${esc(profile[0])}</p></article><article><h3>暮らしの特徴</h3><p>${esc(profile[1])}</p></article><article><h3>飼う前に確認したいこと</h3><p>${esc(profile[2])}</p></article></div><p class="profile-note">ここで紹介するのは犬種・猫種の一般的な傾向です。性格や健康状態には個体差があるため、実際に迎える子の様子と飼育環境を確認してください。</p></section><div class="callout"><strong>先に確認したいこと：</strong>住まいの飼育可否、家族の同意、留守番時間、初期費用と毎月の費用、病気や老いの時期まで含めて、無理なく終生飼養できるかを話し合いましょう。</div><section class="grid"><article class="card"><h2>${esc(item.breed)}の暮らしの目安</h2><p>${esc(item.size)}に分類されることが多く、必要な運動量・食事量・用品の大きさは個体差があります。お迎え前に成長後の体格、日々の運動や遊び、鳴き声・抜け毛・お手入れの頻度を確認しましょう。</p></article><article class="card"><h2>迎える前にそろえるもの</h2><p>年齢に合うフード、食器、安心して休める場所、トイレ用品、移動用キャリー、脱走・誤食対策、かかりつけ動物病院を準備します。${kind === '犬' ? '散歩用品と迷子対策も必要です。' : '上下運動できる環境と、猫が落ち着ける隠れ場所も用意します。'}</p></article><article class="card"><h2>費用と将来の備え</h2><p>購入・譲渡費用だけでなく、用品、食事、予防、医療、${kind === '犬' ? 'トリミングや散歩用品、' : 'トイレ用品や環境整備、'}老後の介護まで見積もります。急な治療費に備える方法も家族で決めておきましょう。</p></article><article class="card"><h2>健康と性格を確認する</h2><p>犬種・猫種の一般的な傾向だけで判断せず、迎え先から健康記録、ワクチン・駆虫歴、既往歴、食事、生活リズムを受け取ります。気になることは迎える前から動物病院に相談しましょう。</p></article></section><section class="share-card" aria-labelledby="share-title"><h2 id="share-title">このページをシェア</h2><p>${esc(item.breed)}を迎える前の準備ページを、家族や相談相手に共有できます。</p><div id="share-buttons" class="share-buttons"></div></section><div class="links"><a href="../../../">チェックリストと費用試算を見る</a><a href="../">${kind}種一覧を見る</a><a href="../../../../pet-timeline/">成長カレンダーを見る</a></div></main><script src="../../../../../assets/share.js?v=1"></script><script>Share.render('#share-buttons',{text:'${esc(item.breed)}を飼う前に、性格・特徴・準備物を確認できます。',hashtags:['ペットを飼う前に','${kind}種']});</script></body></html>`;
}
function listing(species) {
  const kind = species === 'dog' ? '犬' : '猫';
  const items = flatten(species);
  const groups = catalog[species].map(([size, breeds]) => `<h2>${size}</h2><ul>${breeds.map(breed => `<li><a href="${slugs[breed]}/">${breed}を飼う前に</a></li>`).join('')}</ul>`).join('');
  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${kind}種別ガイド一覧｜ペット迎え入れ準備ノート</title><meta name="description" content="${kind}種ごとに、迎える前の暮らし・準備物・費用・健康確認を整理した独立ページの一覧です。"><link rel="canonical" href="${site}/tools/pet-welcome/breeds/${species}/"><style>body{margin:0;background:#f5f7f6;color:#26352d;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;line-height:1.8}.wrap{max-width:820px;margin:auto;padding:28px 18px 56px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:26px;box-shadow:0 10px 28px #47556912}h1{line-height:1.35;color:#1e293b}h2{margin:26px 0 6px;font-size:18px;color:#55705f}ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px;margin:0;padding-left:22px}a{color:#4338ca;font-weight:700}@media(max-width:600px){ul{grid-template-columns:1fr}}</style></head><body><main class="wrap"><p><a href="../../">← 迎え入れ準備ノート</a></p><article class="card"><p>${kind} BREED GUIDE · ${items.length}ページ</p><h1>${kind}種別に、迎える前の準備を確認</h1><p>${kind}種ごとに独立したURLで、ブックマークや共有にも使える準備ガイドを用意しています。一般的な傾向は目安として、実際の個体差や健康状態も確認してください。</p>${groups}</article></main></body></html>`;
}
function rootListing() {
  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>犬種・猫種別ガイド一覧｜ペット迎え入れ準備ノート</title><meta name="description" content="犬種・猫種ごとに、ペットを迎える前の準備を確認できる独立ページの一覧です。"><link rel="canonical" href="${site}/tools/pet-welcome/breeds/"><style>body{margin:0;background:#f5f7f6;color:#26352d;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif}.wrap{max-width:720px;margin:auto;padding:32px 18px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:26px}a{display:block;margin:12px 0;padding:14px;border-radius:12px;background:#eef2ff;color:#3730a3;font-weight:700;text-decoration:none}</style></head><body><main class="wrap"><p><a href="../">← 迎え入れ準備ノート</a></p><section class="card"><h1>犬種・猫種別ガイド</h1><p>ペットを飼う前に、犬種・猫種ごとの準備を確認できます。</p><a href="dog/">犬種別ガイドを見る</a><a href="cat/">猫種別ガイドを見る</a></section></main></body></html>`;
}
fs.mkdirSync(path.join(base, 'dog'), { recursive: true });
fs.mkdirSync(path.join(base, 'cat'), { recursive: true });
fs.writeFileSync(path.join(base, 'index.html'), rootListing());
fs.writeFileSync(path.join(base, 'dog', 'index.html'), listing('dog'));
fs.writeFileSync(path.join(base, 'cat', 'index.html'), listing('cat'));
for (const species of ['dog', 'cat']) {
  flatten(species).forEach((item, index) => {
    const dir = path.join(base, species, slugs[item.breed]);
    fs.mkdirSync(dir, { recursive: true });
    const practical = requiredSections(species, item)
      .replaceAll('class="practical-guide responsibility"', 'class="card practical-guide responsibility" style="margin-top:20px"')
      .replaceAll('class="practical-guide', 'class="card practical-guide" style="margin-top:20px')
      .replaceAll('<h3>', '<h2>')
      .replaceAll('</h3>', '</h2>')
      .replace('<h2>必要な手続きと確認先</h2>', '<p class="eyebrow">PROCEDURES</p><h2>必要な手続きと確認先</h2>')
      .replace('<h2>将来かかる費用の目安</h2>', '<p class="eyebrow" style="color:#047857">LIFETIME COST GUIDE</p><h2>将来かかる費用の目安</h2>')
      .replace('<h2>最初にそろえたいもの</h2>', '<p class="eyebrow" style="color:#047857">STARTER ITEMS</p><h2>最初にそろえたいもの</h2>')
      .replace('<h2>命を迎えるということ</h2>', '<h2 style="color:#f8fafc">命を迎えるということ</h2>')
      .replace('<section class="card practical-guide responsibility" style="margin-top:20px">', '<section class="card practical-guide responsibility" style="margin-top:20px;background:#1e293b;border-color:#1e293b;color:#cbd5e1">')
      .replace(/(<section class="card practical-guide responsibility"[\s\S]*?<h2 style="color:#f8fafc">命を迎えるということ<\/h2><p)>/,
        '$1 style="color:#cbd5e1">');
    const html = page(species, item, index + 1)
      .replace('<section class="share-card"', `${articleContent(species, item, profiles[item.breed])}<section class="share-card"`)
      .replace('</section><section class="checklist"', '</section><section class="checklist"')
      .replace('</section></section><section class="share-card"', `</section></section>${practical}<section class="share-card"`);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  });
}
