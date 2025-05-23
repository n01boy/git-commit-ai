# Git Commit Message AI

AIを使用してGitコミットメッセージを自動生成するツールです。

## インストール

```bash
npm install -g git-commit-message-ai
```

## 環境変数の設定

```bash
# Anthropic API Key
export ANTHROPIC_API_KEY=sk-XXXXXXXX
```

## 使い方

1. 変更をステージング

```bash
git add .
```

2. コミットメッセージを生成

```bash
git-commit-ai
```

3. 提案されたメッセージを確認して応答

- `y`: 提案されたメッセージでコミット
- `edit`: メッセージを編集してからコミット
- `detail`: 変更の詳細を表示
- `n`: キャンセル

## オプション

| オプション      | 説明                                       |
| --------------- | ------------------------------------------ |
| `-a, --all`     | すべての変更をステージングしてからコミット |
| `-p, --push`    | コミット後に自動的にプッシュする           |
| `-v, --verbose` | 詳細モード（変更の詳細を表示）             |

## 使用例

```bash
# すべての変更をステージングしてコミット
git-commit-ai --all

# コミット後に自動プッシュ
git-commit-ai --push

# 詳細モードで実行
git-commit-ai --verbose
```

## 前提条件

- Node.js (v18以上)
- Git
- Anthropic API キー

## デプロイ方法

### 1. npmパッケージとして公開する場合

```bash
# ビルド
npm run build

# npmにログイン（初回のみ）
npm login

# パッケージを公開
npm publish
```

### 2. ローカルでグローバルインストールする場合

```bash
# プロジェクトディレクトリで
npm run build
npm link

# これで git-commit-ai コマンドがグローバルで使用可能になります
```

### 3. GitHubからの直接インストール

```bash
npm install -g git+https://github.com/n01boy/git-commit-message-ai.git
```

### 4. 開発モードで実行

```bash
# 依存関係をインストール
npm install

# TypeScriptを直接実行
npm run dev

# またはビルドしてから実行
npm run build
npm start
```

## ソースコード

https://github.com/n01boy/git-commit-message-ai

## ライセンス

MIT
