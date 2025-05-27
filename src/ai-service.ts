import chalk from 'chalk';
import { FileChange } from './types';
import { loadConfig, Config } from './config';
import { generateDetailedChangeSummary, generateCommonPrompt } from './prompt-utils';
import { makeHttpRequest } from './http-utils';
const { VertexAI } = require('@google-cloud/vertexai');

/**
 * 設定が正しく設定されているか確認する
 * @returns 設定されていればtrue、そうでなければfalse
 */
export function checkEnvironmentVariables(): boolean {
  const config = loadConfig();
  
  if (!config) {
    console.error(chalk.red('設定が見つかりません。'));
    console.error(chalk.yellow('git-commit-ai config を実行して設定を行ってください。'));
    return false;
  }
  
  if (config.model === 'claude-sonnet-4-20250514' && !config.apiKey) {
    console.error(chalk.red('Anthropic APIキーが設定されていません。'));
    console.error(chalk.yellow('git-commit-ai config を実行して設定を行ってください。'));
    return false;
  }
  
  if (config.model === 'vertex-claude-sonnet-4-20250514' && !config.projectName) {
    console.error(chalk.red('Google Cloud プロジェクト名が設定されていません。'));
    console.error(chalk.yellow('git-commit-ai config を実行して設定を行ってください。'));
    return false;
  }
  
  const modelDisplayName = config.model === 'vertex-claude-sonnet-4-20250514' 
    ? 'vertex-gemini-2.0-flash'
    : config.model;
  console.log(chalk.blue(`使用するモデル: ${modelDisplayName}`));
  return true;
}

/**
 * AIを使用してコミットメッセージを生成する
 * @param files 変更されたファイルの情報
 * @param debug デバッグモードかどうか
 * @returns 生成されたコミットメッセージとサマリ
 */
export async function generateCommitMessageWithAI(
  files: FileChange[], 
  debug: boolean = false
): Promise<{ message: string, summary: string }> {
  const config = loadConfig();
  
  if (!config) {
    throw new Error('設定が見つかりません。git-commit-ai config を実行してください。');
  }

  // 変更の詳細なサマリを生成
  const summary = generateDetailedChangeSummary(files);
  
  // 共通プロンプトを生成
  const { userPrompt, systemPrompt } = generateCommonPrompt(summary);

  if (debug) {
    console.log(chalk.gray('\nシステムプロンプト:'));
    console.log(chalk.gray(systemPrompt));
    console.log(chalk.gray('\nユーザープロンプト:'));
    console.log(chalk.gray(userPrompt));
  }

  try {
    console.log(chalk.blue('AIを使用してコミットメッセージを生成中...'));
    
    if (config.model === 'claude-sonnet-4-20250514') {
      return await generateWithAnthropic(config, userPrompt, systemPrompt, summary);
    } else if (config.model === 'vertex-claude-sonnet-4-20250514') {
      return await generateWithVertex(config, userPrompt, systemPrompt, summary);
    } else {
      throw new Error(`サポートされていないモデル: ${config.model}`);
    }
  } catch (error) {
    console.error(chalk.red('AIによるコミットメッセージ生成中にエラーが発生しました:'), error);
    throw error;
  }
}

/**
 * Anthropic APIを使用してコミットメッセージを生成する
 */
async function generateWithAnthropic(
  config: Config, 
  userPrompt: string,
  systemPrompt: string,
  summary: string
): Promise<{ message: string, summary: string }> {
  if (!config.apiKey) {
    throw new Error('Anthropic APIキーが設定されていません。');
  }

  // Anthropic API リクエストデータ
  const requestData = JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt
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
      'x-api-key': config.apiKey,
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
}

/**
 * Google Cloud Vertex AIを使用してコミットメッセージを生成する
 */
async function generateWithVertex(
  config: Config, 
  userPrompt: string,
  systemPrompt: string,
  summary: string
): Promise<{ message: string, summary: string }> {
  if (!config.projectName) {
    throw new Error('Google Cloud プロジェクト名が設定されていません。');
  }

  try {
    // Vertex AI SDKを使用
    const vertexAI = new VertexAI({
      project: config.projectName, 
      location: 'us-central1'
    });

    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt
    });

    const resp = await generativeModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    const contentResponse = await resp.response;
    
    // レスポンスからメッセージを抽出
    if (!contentResponse.candidates || contentResponse.candidates.length === 0) {
      throw new Error('Vertex AIからの応答に候補が含まれていません。');
    }
    
    const candidate = contentResponse.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('Vertex AIからの応答にコンテンツが含まれていません。');
    }
    
    const text = candidate.content.parts[0].text;
    if (!text || text.trim().length === 0) {
      throw new Error('Vertex AIからの応答が空です。');
    }
    
    const message = text.trim();
    return { message, summary };
  } catch (error) {
    console.error(chalk.red('Vertex AIによるコミットメッセージ生成中にエラーが発生しました:'));
    console.error(chalk.red('エラー詳細:'), error);
    
    // より具体的なエラーメッセージを提供
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error(chalk.yellow('認証エラーです。gcloud auth application-default login を実行してください。'));
      } else if (error.message.includes('permission')) {
        console.error(chalk.yellow('権限エラーです。プロジェクトでVertex AIが有効になっていることを確認してください。'));
      } else if (error.message.includes('quota')) {
        console.error(chalk.yellow('クォータエラーです。API使用量を確認してください。'));
      }
    }
    
    throw error;
  }
}
