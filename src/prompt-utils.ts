import path from 'path';
import { FileChange } from './types';
import { shouldExcludeFile, getFileTypeDescription, generateDetailedFileDescription } from './file-utils';

/**
 * 変更の詳細なサマリを生成する
 * @param files 変更されたファイルの情報
 * @returns 詳細なサマリ
 */
export function generateDetailedChangeSummary(files: FileChange[]): string {
  // 除外すべきファイルをフィルタリング
  const filteredFiles = files.filter(file => !shouldExcludeFile(file.path));
  const excludedCount = files.length - filteredFiles.length;
  
  // ファイルを種類ごとにグループ化
  const filesByType: Record<string, FileChange[]> = {};
  filteredFiles.forEach(file => {
    const ext = path.extname(file.path).toLowerCase();
    if (!filesByType[ext]) {
      filesByType[ext] = [];
    }
    filesByType[ext].push(file);
  });
  
  // 変更の概要を作成
  let summary = `# 変更概要\n`;
  summary += `合計 ${filteredFiles.length} ファイルが変更されました。`;
  if (excludedCount > 0) {
    summary += `（${excludedCount}ファイルは除外）`;
  }
  summary += `\n\n`;
  
  // ファイルタイプごとの変更概要
  summary += `## ファイルタイプ別変更\n`;
  for (const [ext, typeFiles] of Object.entries(filesByType)) {
    const fileType = ext ? getFileTypeDescription(ext) : 'その他';
    summary += `- ${fileType}: ${typeFiles.length}ファイル\n`;
  }
  
  // 変更タイプごとの概要
  const addedFiles = filteredFiles.filter(f => f.status === 'added');
  const modifiedFiles = filteredFiles.filter(f => f.status === 'modified');
  const deletedFiles = filteredFiles.filter(f => f.status === 'deleted');
  
  summary += `\n## 変更タイプ別\n`;
  if (addedFiles.length > 0) summary += `- 追加: ${addedFiles.length}ファイル\n`;
  if (modifiedFiles.length > 0) summary += `- 修正: ${modifiedFiles.length}ファイル\n`;
  if (deletedFiles.length > 0) summary += `- 削除: ${deletedFiles.length}ファイル\n`;
  
  // 各ファイルの詳細な変更内容
  summary += `\n# 詳細な変更内容\n`;
  filteredFiles.forEach(file => {
    summary += `\n${generateDetailedFileDescription(file)}\n`;
  });
  
  return summary;
}

/**
 * 共通のプロンプトとシステムメッセージを生成する
 * @param summary 変更の詳細なサマリ
 * @returns プロンプトとシステムメッセージ
 */
export function generateCommonPrompt(summary: string): { userPrompt: string, systemPrompt: string } {
  const systemPrompt = "あなたはGitコミットメッセージを生成するAIアシスタントです。簡潔で明確なコミットメッセージを日本語で生成してください。";
  
  const userPrompt = `以下の変更内容に基づいて、簡潔で明確なコミットメッセージを日本語で生成してください。

${summary}

コミットメッセージは以下の条件を満たすようにしてください：
- 100文字以内で簡潔に
- 変更の種類（追加、修正、削除など）を明確に
- 主要な変更点に焦点を当てる
- 箇条書きや説明は含めない

コミットメッセージ：`;

  return { userPrompt, systemPrompt };
}
