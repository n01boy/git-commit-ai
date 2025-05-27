# Git Commit Message AI

AIを使用してGitコミットメッセージを自動生成するツールです。

## インストール

```bash
npm install -g git-commit-message-ai
```

## 初期設定

```bash
git-commit-ai config
```

以下から選択：

- **Anthropic Claude**: APIキーが必要
- **Google Vertex AI**: Google Cloudプロジェクト名が必要

## 使い方

```bash
# 変更をステージング
git add .

# コミットメッセージを生成
git-commit-ai
```

提案されたメッセージを確認：

- `y`: コミット実行
- `edit`: メッセージ編集
- `detail`: 変更詳細表示
- `n`: キャンセル

## オプション

| オプション      | 説明                     |
| --------------- | ------------------------ |
| `-a, --all`     | 全変更をステージング     |
| `-p, --push`    | コミット後に自動プッシュ |
| `-v, --verbose` | 詳細モード               |
| `-d, --debug`   | デバッグモード           |

## ライセンス

MIT
