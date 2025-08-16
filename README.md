# ゴルフコンペ - リアルタイムスコア管理システム

参加者全員でリアルタイムにスコアを共有・管理できるゴルフコンペ専用アプリケーションです。

## 機能

- 🏌️ 組とプレイヤーの管理
- 📊 18ホールのスコア入力
- 🏆 リアルタイムランキング表示
- 📱 スマホ対応のレスポンシブデザイン
- 🔄 リアルタイムデータ同期（Supabase使用）

## 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **リアルタイム同期**: Supabase Realtime
- **デプロイ**: Vercel

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下を取得：
   - Project URL
   - anon/public key

### 2. データベーステーブルの作成

SupabaseのSQL Editorで以下のSQLを実行：

```sql
-- アプリケーション状態を保存するテーブル
CREATE TABLE app_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  groups JSONB DEFAULT '[]'::jsonb,
  scores JSONB DEFAULT '[]'::jsonb,
  current_hole INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リアルタイム機能を有効化
ALTER TABLE app_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE app_state;
```

### 3. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. アプリケーションの起動

```bash
npm install
npm run dev
```

## 使用方法

1. **組の追加**: 組名を入力して「追加」ボタンをクリック
2. **プレイヤーの追加**: 組を選択してプレイヤー名を入力
3. **スコア入力**: 各ホールのパーとスコアを入力
4. **リアルタイム確認**: 他のデバイスでリアルタイムにスコアを確認

## デプロイ

Vercelでデプロイする場合：

1. GitHubリポジトリをVercelに連携
2. 環境変数をVercelのダッシュボードで設定
3. 自動デプロイが開始されます

## ライセンス

MIT License
