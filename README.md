# Git Review AI

Gitのコミットメッセージを自動生成するツールです。変更内容を分析して、適切なコミットメッセージを提案します。

## モチベーション

```
git commit -m "{ここに書くのがめんどくさい!!!!!}"
```

コミットメッセージを考えるのが面倒な時、このツールが自動的に変更内容を分析して適切なメッセージを提案します。

## 特徴

- TypeScriptで実装
- Anthropic Claude APIを使用した高品質なコミットメッセージ生成
- ステージングされた変更の詳細な分析
  - ファイルタイプ別の変更概要
  - 変更タイプ（追加、修正、削除）別の集計
  - 各ファイルの詳細な変更内容（追加/削除行数、重要な変更部分）
- 対話型インターフェース
  - コミットメッセージの編集オプション
  - 変更詳細の表示オプション
- 自動プッシュオプション
- 詳細モードとデバッグモード

## インストールと設定

### 前提条件

- Node.js (v14以上)
- npm
- Git
- Anthropic API キー

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/git-review-ai.git
cd git-review-ai
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ビルド

```bash
npm run build
```

### 4. 環境変数の設定

```bash
# Anthropic API Key
export ANTHROPIC_API_KEY=sk-XXXXXXXX

# 使用するClaudeモデル（デフォルト: claude-3-7-sonnet-latest）
export GIT_REVIEW_AI_USE=claude-3-7-sonnet-latest
```

### 5. インストール方法（選択肢）

#### A. ローカルで直接実行

```bash
# 実行権限を付与
chmod +x dist/index.js

# 実行
./dist/index.js
```

#### B. npmスクリプトで実行

```bash
npm start
```

#### C. グローバルにインストール

```bash
# カレントディレクトリからグローバルにインストール
npm install -g .

# どこからでも実行可能に
git-review-ai
```

## 使い方

### 基本的な使い方

1. 環境変数を設定します（まだ設定していない場合）

   ```bash
   export ANTHROPIC_API_KEY=sk-XXXXXXXX
   ```

2. 変更をステージングします

   ```bash
   git add file1.js file2.js
   ```

3. git-review-aiを実行します

   ```bash
   # インストール方法によって以下のいずれか
   ./dist/index.js
   npm start
   git-review-ai
   ```

4. 提案されたコミットメッセージを確認します

   ```
   2個のファイルがステージングされています:
     modified src/index.ts
     added src/utils.ts

   提案されたコミットメッセージ:
     ユーティリティ関数の追加と型定義の修正
   ```

5. 提案に対して応答します
   - `y`: 提案されたメッセージでコミット
   - `edit`: メッセージを編集してからコミット
   - `detail`: 変更の詳細を表示してから再確認
   - `n`: キャンセル

### コマンドラインオプション

| オプション      | 説明                                       | 例                        |
| --------------- | ------------------------------------------ | ------------------------- |
| `-a, --all`     | すべての変更をステージングしてからコミット | `git-review-ai --all`     |
| `-p, --push`    | コミット後に自動的にプッシュする           | `git-review-ai --push`    |
| `-d, --debug`   | デバッグモード（AIへの入力を表示）         | `git-review-ai --debug`   |
| `-v, --verbose` | 詳細モード（変更の詳細を表示）             | `git-review-ai --verbose` |
| `-h, --help`    | ヘルプ情報を表示                           | `git-review-ai --help`    |
| `--version`     | バージョン情報を表示                       | `git-review-ai --version` |

### 使用例

#### 例1: すべての変更をステージングしてコミット

```bash
git-review-ai --all
```

出力例:

```
すべての変更をステージングしました
3個のファイルがステージングされています:
  modified src/index.ts
  added src/utils.ts
  deleted old-file.js

AIを使用してコミットメッセージを生成中...
使用するモデル: claude-3-7-sonnet-latest

提案されたコミットメッセージ:
  ユーティリティ関数の追加と不要ファイルの削除

このメッセージでコミットしますか？ (y/n/edit/detail): y
コミットが完了しました: "ユーティリティ関数の追加と不要ファイルの削除"
```

#### 例2: 詳細モードで変更内容を表示

```bash
git-review-ai --verbose
```

出力例:

```
2個のファイルがステージングされています:
  modified src/index.ts
  added src/utils.ts

===== 変更の詳細 =====
# 変更概要
合計 2 ファイルが変更されました。

## ファイルタイプ別変更
- TypeScript: 2ファイル

## 変更タイプ別
- 追加: 1ファイル
- 修正: 1ファイル

# 詳細な変更内容

【modified】index.ts (TypeScript)
  変更: +15行, -5行
  主な変更:
+import { Utils } from './utils';
-// TODO: ユーティリティ関数を実装
+  const result = Utils.formatDate(new Date());
+  console.log(`フォーマットされた日付: ${result}`);
... (他 10 行の変更)

【added】utils.ts (TypeScript)
  場所: src
  変更: +25行, -0行
  主な変更:
+export class Utils {
+  /**
+   * 日付を YYYY-MM-DD 形式にフォーマットする
+   */
+  static formatDate(date: Date): string {
+    const year = date.getFullYear();
+    const month = String(date.getMonth() + 1).padStart(2, '0');
+    const day = String(date.getDate()).padStart(2, '0');
+    return `${year}-${month}-${day}`;
+  }
... (他 15 行の変更)
=====================

AIを使用してコミットメッセージを生成中...
使用するモデル: claude-3-7-sonnet-latest

提案されたコミットメッセージ:
  日付フォーマット用ユーティリティクラスの追加

このメッセージでコミットしますか？ (y/n/edit/detail):
```

#### 例3: 変更詳細を確認してからコミット

```bash
git-review-ai
```

出力例:

```
1個のファイルがステージングされています:
  modified src/index.ts

AIを使用してコミットメッセージを生成中...
使用するモデル: claude-3-7-sonnet-latest

提案されたコミットメッセージ:
  インデックスファイルの更新

このメッセージでコミットしますか？ (y/n/edit/detail): detail

===== 変更の詳細 =====
# 変更概要
合計 1 ファイルが変更されました。

## ファイルタイプ別変更
- TypeScript: 1ファイル

## 変更タイプ別
- 修正: 1ファイル

# 詳細な変更内容

【modified】index.ts (TypeScript)
  変更: +8行, -2行
  主な変更:
+  // エラーハンドリングを改善
+  try {
+    // 処理
+  } catch (error) {
+    console.error('エラーが発生しました:', error);
+  }
-  // TODO: エラーハンドリングを実装する
=====================

このメッセージでコミットしますか？ (y/n/edit): edit
新しいコミットメッセージを入力してください: エラーハンドリングの改善
コミットが完了しました: "エラーハンドリングの改善"
```

#### 例4: デバッグモードでAIへの入力を確認

```bash
git-review-ai --debug
```

出力例:

```
2個のファイルがステージングされています:
  modified src/index.ts
  added src/utils.ts

===== 変更の詳細 =====
# 変更概要
合計 2 ファイルが変更されました。

## ファイルタイプ別変更
- TypeScript: 2ファイル

## 変更タイプ別
- 追加: 1ファイル
- 修正: 1ファイル

# 詳細な変更内容

【modified】index.ts (TypeScript)
  変更: +15行, -5行
  主な変更:
+import { Utils } from './utils';
-// TODO: ユーティリティ関数を実装
+  const result = Utils.formatDate(new Date());
+  console.log(`フォーマットされた日付: ${result}`);
... (他 10 行の変更)

【added】utils.ts (TypeScript)
  場所: src
  変更: +25行, -0行
  主な変更:
+export class Utils {
+  /**
+   * 日付を YYYY-MM-DD 形式にフォーマットする
+   */
+  static formatDate(date: Date): string {
+    const year = date.getFullYear();
+    const month = String(date.getMonth() + 1).padStart(2, '0');
+    const day = String(date.getDate()).padStart(2, '0');
+    return `${year}-${month}-${day}`;
+  }
... (他 15 行の変更)
=====================

AIへの入力:
あなたはGitコミットメッセージを生成するAIアシスタントです。
以下の変更内容に基づいて、簡潔で明確なコミットメッセージを日本語で生成してください。

# 変更概要
合計 2 ファイルが変更されました。

## ファイルタイプ別変更
- TypeScript: 2ファイル

## 変更タイプ別
- 追加: 1ファイル
- 修正: 1ファイル

# 詳細な変更内容

【modified】index.ts (TypeScript)
  変更: +15行, -5行
  主な変更:
+import { Utils } from './utils';
-// TODO: ユーティリティ関数を実装
+  const result = Utils.formatDate(new Date());
+  console.log(`フォーマットされた日付: ${result}`);
... (他 10 行の変更)

【added】utils.ts (TypeScript)
  場所: src
  変更: +25行, -0行
  主な変更:
+export class Utils {
+  /**
+   * 日付を YYYY-MM-DD 形式にフォーマットする
+   */
+  static formatDate(date: Date): string {
+    const year = date.getFullYear();
+    const month = String(date.getMonth() + 1).padStart(2, '0');
+    const day = String(date.getDate()).padStart(2, '0');
+    return `${year}-${month}-${day}`;
+  }
... (他 15 行の変更)

コミットメッセージは以下の条件を満たすようにしてください：
- 50文字以内で簡潔に
- 変更の種類（追加、修正、削除など）を明確に
- 主要な変更点に焦点を当てる
- 箇条書きや説明は含めない

コミットメッセージ：

AIを使用してコミットメッセージを生成中...
使用するモデル: claude-3-7-sonnet-latest

提案されたコミットメッセージ:
  日付フォーマット用ユーティリティクラスの追加

このメッセージでコミットしますか？ (y/n/edit/detail):
```

## AIに送信される詳細な変更サマリ

このツールは、コミットメッセージを生成する際に、以下の詳細な情報をAIに送信します：

1. **変更概要**

   - 変更されたファイルの総数
   - ファイルタイプ別の変更数（TypeScript、JavaScript、CSSなど）
   - 変更タイプ別の集計（追加、修正、削除）

2. **各ファイルの詳細情報**
   - ファイル名とタイプ
   - ファイルの場所（ディレクトリ）
   - 変更の種類（追加、修正、削除）
   - 追加/削除された行数
   - 重要な変更部分の抜粋（最大10行）

これにより、AIはコミットの内容をより深く理解し、適切なコミットメッセージを生成できます。

## 変更詳細の表示方法

変更の詳細を表示するには、以下の方法があります：

1. **--verbose オプションを使用**
   ```bash
   git-review-ai --verbose
   ```
2. **コミットメッセージ確認時に 'detail' を選択**

   ```
   このメッセージでコミットしますか？ (y/n/edit/detail): detail
   ```

3. **--debug オプションを使用**
   ```bash
   git-review-ai --debug
   ```
   これにより、AIへの入力も含めた詳細情報が表示されます。

## トラブルシューティング

### APIキーエラー

```
エラー: ANTHROPIC_API_KEYが設定されていません。
環境変数ANTHROPIC_API_KEYを設定してください。
例: export ANTHROPIC_API_KEY=sk-XXXXXXXX
```

解決策: Anthropic APIキーを環境変数に設定してください。

### ステージングされた変更がない

```
ステージングされた変更がありません。
変更をステージングするには git add <file> または --all オプションを使用してください。
```

解決策: `git add <file>` で変更をステージングするか、`--all` オプションを使用してください。

### API接続エラー

```
AIによるコミットメッセージ生成中にエラーが発生しました: Error: API request failed with status code 401
```

解決策: APIキーが正しいか確認してください。また、インターネット接続も確認してください。

## ライセンス

MIT
