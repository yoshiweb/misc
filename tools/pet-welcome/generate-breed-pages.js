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
const esc = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const flatten = species => catalog[species].flatMap(([size, breeds]) => breeds.map(breed => ({ size, breed })));
function page(species, item, number) {
  const kind = species === 'dog' ? '犬' : '猫';
  const slug = slugs[item.breed];
  const url = `${site}/tools/pet-welcome/breeds/${species}/${slug}/`;
  const image = `../../../../../assets/images/pet-calendar-breed-${species}-${String(number).padStart(2, '0')}.jpg`;
  const title = `${item.breed}を飼う前に｜性格・暮らし・準備物 | ペット迎え入れ準備ノート`;
  const description = `${item.breed}を迎える前に確認したい、暮らしの特徴、必要な準備、費用の考え方を整理。かわいさだけでなく、毎日の世話と将来まで考えるためのページです。`;
  return `<!doctype html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${site}/assets/images/pet-calendar-breed-${species}-${String(number).padStart(2, '0')}.jpg"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Article','headline':title,'description':description,'url':url,'image':`${site}/assets/images/pet-calendar-breed-${species}-${String(number).padStart(2, '0')}.jpg`})}</script><style>
body{margin:0;background:#f5f7f6;color:#26352d;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;line-height:1.8}.wrap{max-width:920px;margin:auto;padding:24px 18px 56px}.nav{font-size:14px;margin-bottom:20px}.nav a{color:#4338ca}.hero,.card{background:#fff;border:1px solid #e2e8f0;border-radius:22px;box-shadow:0 10px 28px #47556912}.hero{overflow:hidden}.hero img{display:block;width:100%;height:270px;object-fit:cover}.hero-copy{padding:28px}.eyebrow{color:#55705f;font-size:12px;font-weight:700;letter-spacing:.12em}.hero h1{margin:8px 0;font-size:clamp(28px,5vw,44px);line-height:1.3;color:#1e293b}.lead{color:#64748b}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}.card{padding:22px}.card h2{margin:0 0 8px;font-size:20px;color:#1e293b}.card p{margin:0;color:#64748b;font-size:14px}.callout{margin-top:20px;padding:18px 20px;border-radius:16px;background:#eef2ff;color:#1e1b4b;font-size:14px}.links{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.links a{display:inline-block;padding:10px 14px;border-radius:12px;background:#fff;border:1px solid #c7d2fe;color:#3730a3;font-weight:700;text-decoration:none;font-size:14px}@media(max-width:640px){.grid{grid-template-columns:1fr}.hero img{height:190px}.hero-copy{padding:22px}.wrap{padding:16px 12px 40px}}
</style></head><body><main class="wrap"><nav class="nav"><a href="../../../">← 迎え入れ準備ノート</a>　/　${kind}種別ページ</nav><article class="hero"><img src="${image}" alt="${esc(item.breed)}のイメージ" width="1536" height="1024"><div class="hero-copy"><p class="eyebrow">${kind.toUpperCase()} BREED GUIDE</p><h1>${esc(item.breed)}を飼う前に</h1><p class="lead">${esc(item.breed)}を家族に迎える前に、毎日の暮らしと準備を具体的に考えるためのガイドです。${kind}種による傾向は目安として、実際の性格・健康状態・年齢は一頭ずつ異なります。</p></div></article><div class="callout"><strong>先に確認したいこと：</strong>住まいの飼育可否、家族の同意、留守番時間、初期費用と毎月の費用、病気や老いの時期まで含めて、無理なく終生飼養できるかを話し合いましょう。</div><section class="grid"><article class="card"><h2>${esc(item.breed)}の暮らしの目安</h2><p>${esc(item.size)}に分類されることが多く、必要な運動量・食事量・用品の大きさは個体差があります。お迎え前に成長後の体格、日々の運動や遊び、鳴き声・抜け毛・お手入れの頻度を確認しましょう。</p></article><article class="card"><h2>迎える前にそろえるもの</h2><p>年齢に合うフード、食器、安心して休める場所、トイレ用品、移動用キャリー、脱走・誤食対策、かかりつけ動物病院を準備します。${kind === '犬' ? '散歩用品と迷子対策も必要です。' : '上下運動できる環境と、猫が落ち着ける隠れ場所も用意します。'}</p></article><article class="card"><h2>費用と将来の備え</h2><p>購入・譲渡費用だけでなく、用品、食事、予防、医療、${kind === '犬' ? 'トリミングや散歩用品、' : 'トイレ用品や環境整備、'}老後の介護まで見積もります。急な治療費に備える方法も家族で決めておきましょう。</p></article><article class="card"><h2>健康と性格を確認する</h2><p>犬種・猫種の一般的な傾向だけで判断せず、迎え先から健康記録、ワクチン・駆虫歴、既往歴、食事、生活リズムを受け取ります。気になることは迎える前から動物病院に相談しましょう。</p></article></section><div class="links"><a href="../../../">チェックリストと費用試算を見る</a><a href="../">${kind}種一覧を見る</a><a href="../../../../pet-timeline/">成長カレンダーを見る</a></div></main></body></html>`;
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
    fs.writeFileSync(path.join(dir, 'index.html'), page(species, item, index + 1));
  });
}
