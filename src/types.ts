/**
 * コマンドラインオプションの型定義
 */
export interface CommandOptions {
  all?: boolean;
  push?: boolean;
  debug?: boolean;
  verbose?: boolean;
}

/**
 * ファイルの変更状態を表す型
 */
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  diff?: string;
}