import https from 'https';
import chalk from 'chalk';
import path from 'path';
import { FileChange } from './types';

// 環境変数からAPIキーとモデル名を取得
const apiKey = process.env.ANTHROPIC_API_KEY;
const modelName = process.env.GIT_REVIEW_AI_USE || 'claude-3-7-sonnet-latest';

/**
 * 環境変数が正しく設定されているか確認する
 * @returns 設定されていればtrue、そうでなければfalse
 */
export function checkEnvironmentVariables(): boolean {
  if (!apiKey) {
    console.error(chalk.red('エラー: ANTHROPIC_API_KEYが設定されていません。'));
    console.error(chalk.yellow('環境変数ANTHROPIC_API_KEYを設定してください。'));
    console.error(chalk.yellow('例: export ANTHROPIC_API_KEY=sk-XXXXXXXX'));
    return false;
  }
  
  console.log(chalk.blue(`使用するモデル: ${modelName}`));
  return true;
}

/**
 * ファイルの拡張子に基づいて、ファイルタイプの説明を取得する
 * @param filePath ファイルパス
 * @returns ファイルタイプの説明
 */
function getFileTypeDescription(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  
  const fileTypeDescriptions: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'React',
    tsx: 'React TypeScript',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    html: 'HTML',
    md: 'Markdown',
    json: 'JSON',
    yml: 'YAML',
    yaml: 'YAML',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    java: 'Java',
    php: 'PHP',
    c: 'C',
    cpp: 'C++',
    h: 'C/C++ ヘッダー',
    cs: 'C#',
    rs: 'Rust',
    swift: 'Swift',
    kt: 'Kotlin',
    sql: 'SQL',
    sh: 'Shell',
    bat: 'バッチ',
    ps1: 'PowerShell',
    gitignore: 'Git設定',
    dockerignore: 'Docker設定',
    dockerfile: 'Dockerfile',
    xml: 'XML',
    svg: 'SVG',
    txt: 'テキスト'
  };
  
  return fileTypeDescriptions[ext] || `${ext}ファイル`;
}

/**
 * 差分から追加/削除された行数を計算する
 * @param diff 差分文字列
 * @returns {added: number, deleted: number} 追加/削除された行数
 */
function countChangedLines(diff: string): { added: number, deleted: number } {
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
function extractImportantChanges(diff: string, maxLines: number = 10): string {
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

/**
 * 変更の詳細なサマリを生成する
 * @param files 変更されたファイルの情報
 * @returns 詳細なサマリ
 */
export function generateDetailedChangeSummary(files: FileChange[]): string {
  // ファイルを種類ごとにグループ化
  const filesByType: Record<string, FileChange[]> = {};
  files.forEach(file => {
    const ext = path.extname(file.path).toLowerCase();
    if (!filesByType[ext]) {
      filesByType[ext] = [];
    }
    filesByType[ext].push(file);
  });
  
  // 変更の概要を作成
  let summary = `# 変更概要\n`;
  summary += `合計 ${files.length} ファイルが変更されました。\n\n`;
  
  // ファイルタイプごとの変更概要
  summary += `## ファイルタイプ別変更\n`;
  for (const [ext, typeFiles] of Object.entries(filesByType)) {
    const fileType = ext ? getFileTypeDescription(ext) : 'その他';
    summary += `- ${fileType}: ${typeFiles.length}ファイル\n`;
  }
  
  // 変更タイプごとの概要
  const addedFiles = files.filter(f => f.status === 'added');
  const modifiedFiles = files.filter(f => f.status === 'modified');
  const deletedFiles = files.filter(f => f.status === 'deleted');
  
  summary += `\n## 変更タイプ別\n`;
  if (addedFiles.length > 0) summary += `- 追加: ${addedFiles.length}ファイル\n`;
  if (modifiedFiles.length > 0) summary += `- 修正: ${modifiedFiles.length}ファイル\n`;
  if (deletedFiles.length > 0) summary += `- 削除: ${deletedFiles.length}ファイル\n`;
  
  // 各ファイルの詳細な変更内容
  summary += `\n# 詳細な変更内容\n`;
  files.forEach(file => {
    summary += `\n${generateDetailedFileDescription(file)}\n`;
  });
  
  return summary;
}

/**
 * Anthropic APIを使用してコミットメッセージを生成する
 * @param files 変更されたファイルの情報
 * @param debug デバッグモードかどうか
 * @returns 生成されたコミットメッセージとサマリ
 */
export async function generateCommitMessageWithAI(
  files: FileChange[], 
  debug: boolean = false
): Promise<{ message: string, summary: string }> {
  // 変更の詳細なサマリを生成
  const summary = generateDetailedChangeSummary(files);
  
  // プロンプトの作成
  const prompt = `あなたはGitコミットメッセージを生成するAIアシスタントです。
以下の変更内容に基づいて、簡潔で明確なコミットメッセージを日本語で生成してください。

${summary}

コミットメッセージは以下の条件を満たすようにしてください：
- 50文字以内で簡潔に
- 変更の種類（追加、修正、削除など）を明確に
- 主要な変更点に焦点を当てる
- 箇条書きや説明は含めない

コミットメッセージ：`;

  if (debug) {
    console.log(chalk.gray('\nAIへの入力:'));
    console.log(chalk.gray(prompt));
  }

  try {
    console.log(chalk.blue('AIを使用してコミットメッセージを生成中...'));
    
    // Anthropic API リクエストデータ
    const requestData = JSON.stringify({
      model: modelName,
      max_tokens: 100,
      temperature: 0.7,
      system: "あなたはGitコミットメッセージを生成するAIアシスタントです。簡潔で明確なコミットメッセージを日本語で生成してください。",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // HTTPリクエストのオプション
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    // HTTPリクエストを実行して結果を取得
    const response = await makeHttpRequest(options, requestData);
    
    // レスポンスをJSONとしてパース
    const responseData = JSON.parse(response);
    
    // レスポンスからコミットメッセージを抽出
    const message = responseData.content[0].text.trim();
    return { message, summary };
  } catch (error) {
    console.error(chalk.red('AIによるコミットメッセージ生成中にエラーが発生しました:'), error);
    throw error;
  }
}

/**
 * HTTPリクエストを実行する
 * @param options リクエストオプション
 * @param data リクエストデータ
 * @returns レスポンスデータ
 */
function makeHttpRequest(options: https.RequestOptions, data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`API request failed with status code ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}