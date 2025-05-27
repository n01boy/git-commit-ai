import path from 'path';
import { FileChange } from './types';
import { EXCLUDE_FILE_PATTERNS, EXCLUDE_DIRECTORIES, FILE_TYPE_DESCRIPTIONS } from './constants';

/**
 * 変更履歴に含めたくないファイルかどうかを判定する
 * @param filePath ファイルパス
 * @returns 除外すべきファイルの場合true
 */
export function shouldExcludeFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  // ディレクトリチェック
  const pathParts = filePath.split('/');
  for (const excludeDir of EXCLUDE_DIRECTORIES) {
    if (pathParts.includes(excludeDir)) {
      return true;
    }
  }
  
  // ファイル名パターンチェック
  for (const pattern of EXCLUDE_FILE_PATTERNS) {
    if (pattern.includes('*')) {
      // ワイルドカードパターンの処理
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(fileName)) {
        return true;
      }
    } else {
      // 完全一致
      if (fileName === pattern) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * ファイルの拡張子に基づいて、ファイルタイプの説明を取得する
 * @param filePath ファイルパス
 * @returns ファイルタイプの説明
 */
export function getFileTypeDescription(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  return FILE_TYPE_DESCRIPTIONS[ext] || `${ext}ファイル`;
}

/**
 * 差分から追加/削除された行数を計算する
 * @param diff 差分文字列
 * @returns {added: number, deleted: number} 追加/削除された行数
 */
export function countChangedLines(diff: string): { added: number, deleted: number } {
  const lines = diff.split('\n');
  let added = 0;
  let deleted = 0;
  
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      added++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deleted++;
    }
  }
  
  return { added, deleted };
}

/**
 * 差分から重要な変更部分を抽出する
 * @param diff 差分文字列
 * @param maxLines 最大行数
 * @returns 重要な変更部分
 */
export function extractImportantChanges(diff: string, maxLines: number = 10): string {
  const lines = diff.split('\n');
  const changedLines: string[] = [];
  
  for (const line of lines) {
    if ((line.startsWith('+') && !line.startsWith('+++')) || 
        (line.startsWith('-') && !line.startsWith('---'))) {
      changedLines.push(line);
    }
  }
  
  // 最大行数を超える場合は省略
  if (changedLines.length > maxLines) {
    return changedLines.slice(0, maxLines).join('\n') + `\n... (他 ${changedLines.length - maxLines} 行の変更)`;
  }
  
  return changedLines.join('\n');
}

/**
 * ファイルの変更内容の詳細な説明を生成する
 * @param file 変更されたファイル情報
 * @returns 詳細な説明
 */
export function generateDetailedFileDescription(file: FileChange): string {
  const fileType = getFileTypeDescription(file.path);
  const fileName = path.basename(file.path);
  const dirName = path.dirname(file.path);
  
  let description = `【${file.status}】${fileName} (${fileType})`;
  
  if (dirName && dirName !== '.') {
    description += `\n  場所: ${dirName}`;
  }
  
  if (file.diff && file.status !== 'deleted') {
    const { added, deleted } = countChangedLines(file.diff);
    description += `\n  変更: +${added}行, -${deleted}行`;
    
    if (added > 0 || deleted > 0) {
      const importantChanges = extractImportantChanges(file.diff);
      if (importantChanges) {
        description += `\n  主な変更:\n${importantChanges}`;
      }
    }
  }
  
  return description;
}
