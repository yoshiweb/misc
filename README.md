# misc

`misc.yoshiweb.net` で公開している、ブラウザ完結の小さなユーティリティ集です。  
画像変換、PDF変換、動画サムネイル生成、RSS 閲覧、簡易動画編集など、日常的な作業を手早く片付けるためのツールをまとめています。

## 収録ツール

- [RSS Feed Viewer](./feed-viewer/index.html)
- [PDF to Image Converter](./tools/pdf2img/index.html)
- [Image Cropper](./tools/imgcrop/index.html)
- [Video to PNG Converter](./tools/video2png/index.html)
- [PNG to WEBP Converter](./tools/png2webp/index.html)
- [WEBP to PNG Converter](./tools/webp2png/index.html)
- [Video Editor](./tools/video-editor/index.html)
- [Thumbnail Generator](./tools/thumbnail-generator/index.html)
- [Affiliate Links Generator](./tools/affiliate-links/index.html)
- [node-fusion game](./games/node-fusion.html)
- [pulse-bloom game](./games/pulse-bloom.html)

## 特徴

- ほとんどのツールがクライアントサイドで完結します
- ローカルファイルをそのまま扱えるので、アップロード不要で使えます
- 単機能で軽量なため、必要な作業にすばやく入れます

## 使い方

1. このリポジトリを Web サーバーまたは静的ホスティングで配信します。
2. ルートの [index.html](./index.html) を開きます。
3. 目的のツールを選んで使います。

ローカルで確認するだけなら、各 `index.html` を直接開いても動作するものがあります。

## プロジェクト構成

- [index.html](./index.html) - ポータルページ
- [feed-viewer/](./feed-viewer) - RSS フィード閲覧
- [tools/](./tools) - 各種変換・編集ツール
- [games/](./games) - ミニゲーム

## 備考

- 外部 CDN を利用しているページがあります
- 一部機能はブラウザの対応状況に依存します
- ファイルやリンクの記述は、リポジトリルートからの相対パスで統一しています

## ライセンス

このリポジトリのライセンスは [LICENSE](./LICENSE) を参照してください。
