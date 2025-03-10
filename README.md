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

- Node.js (v14以上)
- Git
- Anthropic API キー

## ソースコード

https://github.com/n01boy/git-commit-message-ai

## ライセンス

MIT
