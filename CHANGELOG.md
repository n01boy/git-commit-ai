# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-05-23

### Added

- Node.js 18-22対応
- より厳密なTypeScript設定
- npm publish用の設定ファイル（.npmignore, LICENSE）
- 詳細なデプロイ手順をREADMEに追加

### Changed

- Node.jsエンジン要件を>=18.0.0に更新
- TypeScriptターゲットをES2022に更新
- 依存関係を最新版に更新:
  - commander: ^12.1.0
  - simple-git: ^3.25.0
  - @types/node: ^22.0.0
  - typescript: ^5.5.0

### Fixed

- TypeScriptの厳密な型チェックエラーを修正
- null安全性チェックを追加

## [1.0.0] - 2025-05-23

### Added

- 初回リリース
- AIを使用したGitコミットメッセージ自動生成機能
- Anthropic Claude APIとの連携
- インタラクティブなコミットメッセージ確認機能
- 複数のコマンドラインオプション（--all, --push, --verbose）
