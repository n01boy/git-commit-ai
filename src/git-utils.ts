import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import chalk from 'chalk';
import { FileChange } from './types';

// Gitクライアントの初期化
export const git: SimpleGit = simpleGit();

/**
 * ファイルの差分を取得する
 * @param filePath ファイルパス
 * @returns 差分の文字列
 */
export async function getFileDiff(filePath: string): Promise<string> {
  try {
    const diff = await git.diff(['--staged', filePath]);
    return diff;
  } catch (error) {
    console.error(chalk.red(`ファイル ${filePath} の差分取得中にエラーが発生しました`));
    return '';
  }
}

/**
 * ステージングされたファイルの情報を取得する
 * @returns ステージングされたファイルの情報
 */
export async function getStagedFiles(): Promise<FileChange[]> {
  const status = await git.status();
  
  if (status.staged.length === 0) {
    return [];
  }
  
  // ステージングされたファイルの詳細を取得
  const stagedFiles: FileChange[] = status.staged.map(file => ({
    path: file,
    status: status.created.includes(file) ? 'added' : 
            status.deleted.includes(file) ? 'deleted' : 'modified'
  }));
  
  // 各ファイルの差分を取得
  for (const file of stagedFiles) {
    if (file.status !== 'deleted') {
      file.diff = await getFileDiff(file.path);
    }
  }
  
  return stagedFiles;
}

/**
 * 変更されたファイルの内容を分析してコミットメッセージを生成する（AIを使用しない場合のフォールバック）
 * @param files 変更されたファイルの情報
 * @returns 生成されたコミットメッセージ
 */
export function generateFallbackCommitMessage(files: FileChange[]): string {
  // 変更の種類をカウント
  const counts = {
    added: 0,
    modified: 0,
    deleted: 0
  };
  
  // 変更されたファイルの拡張子をカウント
  const extensions: Record<string, number> = {};
  
  files.forEach(file => {
    counts[file.status]++;
    
    const ext = path.extname(file.path).toLowerCase();
    if (ext) {
      extensions[ext] = (extensions[ext] || 0) + 1;
    }
  });
  
  // 主な変更タイプを特定
  let mainChangeType = 'update';
  if (counts.added > counts.modified && counts.added > counts.deleted) {
    mainChangeType = 'add';
  } else if (counts.deleted > counts.added && counts.deleted > counts.modified) {
    mainChangeType = 'remove';
  }
  
  // 主な変更ファイルタイプを特定
  let mainFileType = '';
  let maxCount = 0;
  
  for (const [ext, count] of Object.entries(extensions)) {
    if (count > maxCount) {
      maxCount = count;
      mainFileType = ext.replace('.', '');
    }
  }
  
  // ファイルタイプに基づいた変更の説明
  const fileTypeDescriptions: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'React',
    tsx: 'React TypeScript',
    css: 'スタイル',
    scss: 'Sassスタイル',
    html: 'HTML',
    md: 'ドキュメント',
    json: '設定',
    yml: '設定',
    yaml: '設定',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    java: 'Java',
    php: 'PHP'
  };
  
  const fileTypeDesc = fileTypeDescriptions[mainFileType] || 'ファイル';
  
  // 変更動詞の選択
  const changeVerbs: Record<string, string[]> = {
    add: ['追加', '新規作成', '実装'],
    update: ['更新', '修正', '改善', 'リファクタリング'],
    remove: ['削除', '除去', 'クリーンアップ']
  };
  
  const verbOptions = changeVerbs[mainChangeType];
  const selectedVerb = verbOptions[Math.floor(Math.random() * verbOptions.length)];
  
  // コミットメッセージの生成
  let message = `${selectedVerb}: ${fileTypeDesc}`;
  
  // 変更されたファイル名から追加情報を取得
  if (files.length === 1) {
    // 単一ファイルの場合はファイル名を含める
    const fileName = path.basename(files[0].path, path.extname(files[0].path));
    message += `の${fileName}`;
  } else if (files.length <= 3) {
    // 少数のファイルの場合は全てのファイル名を含める
    const fileNames = files.map(file => 
      path.basename(file.path, path.extname(file.path))
    ).join('、');
    message += `（${fileNames}）`;
  } else {
    // 多数のファイルの場合は数を含める
    message += `（${files.length}ファイル）`;
  }
  
  return message;
}

/**
 * コミットを実行する
 * @param message コミットメッセージ
 * @param shouldPush プッシュするかどうか
 * @returns 成功したかどうか
 */
export async function performCommit(message: string, shouldPush: boolean = false): Promise<boolean> {
  try {
    // コミットを実行
    await git.commit(message);
    console.log(chalk.green(`コミットが完了しました: "${message}"`));
    
    // プッシュオプションが指定されている場合
    if (shouldPush) {
      console.log(chalk.blue('変更をプッシュしています...'));
      await git.push();
      console.log(chalk.green('プッシュが完了しました'));
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('コミット中にエラーが発生しました:'), error);
    return false;
  }
}

/**
 * すべての変更をステージングする
 * @returns 成功したかどうか
 */
export async function stageAllChanges(): Promise<boolean> {
  try {
    await git.add('.');
    console.log(chalk.green('すべての変更をステージングしました'));
    return true;
  } catch (error) {
    console.error(chalk.red('変更のステージング中にエラーが発生しました:'), error);
    return false;
  }
}