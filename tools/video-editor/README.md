# Simple Video Editor

ブラウザ上で動作する、AIを使用しない軽量な動画編集ツールです。サーバーサイドの処理を一切介さず、クライアントサイドのJavaScriptのみで画像と音声の合成、および動画の書き出しを実現します。

## プロジェクト概要

このツールは、映像制作の専門知識がないユーザーでも、静止画とBGMを組み合わせて直感的に短尺動画を作成できるように設計されています。HTML5 Canvas APIとWeb Audio APIを同期させ、MediaRecorder APIによってブラウザ内でエンコーディングを行います。

## 主な機能

### アセット管理

* ローカルファイルのドラッグ＆ドロップによるインポート
* 画像（image/）および音声（audio/）の自動判別
* 素材のプレビューおよびメタデータ（再生時間）の自動取得

### タイムライン編集

* 2トラック構成（画像専用トラック、音声専用トラック）
* クリップのドラッグ＆ドロップによる自由な配置
* クリップの端をドラッグすることによるトリミング（リサイズ）機能
* クリップの選択および削除機能
* タイムラインの表示倍率（ズーム）変更機能（20px/s 〜 200px/s）

### プレビューおよび設定

* リアルタイム・プレビュー・キャンバス（30FPS）
* 動画解像度・アスペクト比の切り替え（16:9, 9:16, 1:1）
* プロジェクト全体の長さ設定（5秒 〜 300秒）

### エクスポート

* MediaRecorder APIを用いたWebM形式での書き出し
* 映像ストリームと音声ストリームの完全な同期結合
* ブラウザ内完結のセキュアなダウンロード処理

### 技術スタック

* Markup: HTML5
* Styling: CSS3, Tailwind CSS (Utility-first framework)
* Icons: Phosphor Icons
* Scripting: Vanilla JavaScript (ES6+)
* Graphics: Canvas API (2D Context)
* Audio: Web Audio API (AudioContext, MediaElementSource)
* Recording: MediaRecorder API

### 技術的な解説

#### ファイル読み込みの仕様

セキュリティの厳しい環境（サンドボックス化されたiframe等）での動作を保証するため、Blob URLではなくFileReader APIを用いたData URL（Base64）方式を採用しています。これにより、ローカルファイルをメモリ内に確実に取り込み、CanvasやAudio要素での再利用を可能にしています。

#### 同期レンダリングロジック

再生時は requestAnimationFrame を利用したメインループが稼働します。グローバルな再生時間（currentTime）に基づき、各フレームで以下の処理をミリ秒単位で行います。

Canvas描画: 現在の時間に該当する画像クリップを特定し、アスペクト比を維持して描画（contain処理）。

音声同期: 各オーディオクリップの再生位置を currentTime と照合し、0.15秒以上のズレが発生した場合には強制的にシーク（currentTime同期）を行って音ズレを防止します。

#### オーディオルーター

Web Audio API を用いて、音声を「プレビュー用出力（スピーカー）」と「エクスポート用出力（MediaStreamDestination）」の2系統にルーティングしています。エクスポート時には、この録音用ストリームをキャンバスの映像ストリームと合成してエンコードします。

### 重要なポイントの要約

* 特徴: サーバーレス、AI不使用、ブラウザ標準機能のみで動作するセキュアな設計。
* 編集機能: ドラッグ操作による移動・リサイズ、解像度・長さの動的な変更。
* 技術: Canvas、Web Audio、MediaRecorder の3大APIを高度に同期させたパイプライン。

### 引用・ソース

* MDN Web Docs - MediaRecorder API: https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder
* MDN Web Docs - Web Audio API: https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API
* Tailwind CSS Documentation: https://tailwindcss.com/docs/installation