import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import readline from 'readline';

/**
 * 設定の型定義
 */
export interface Config {
  model: 'claude-sonnet-4-20250514' | 'vertex-claude-sonnet-4-20250514';
  apiKey?: string;
  projectName?: string;
}

/**
 * 設定ファイルのパス
 */
const CONFIG_DIR = path.join(os.homedir(), '.git-commit-ai');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * 設定ディレクトリを作成する
 */
function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * 設定を読み込む
 */
export function loadConfig(): Config | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configData) as Config;
  } catch (error) {
    console.error(chalk.red('設定ファイルの読み込みに失敗しました:'), error);
    return null;
  }
}

/**
 * 設定を保存する
 */
export function saveConfig(config: Config): void {
  try {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(chalk.green('設定が保存されました。'));
  } catch (error) {
    console.error(chalk.red('設定の保存に失敗しました:'), error);
  }
}

/**
 * 対話型設定セットアップ
 */
export async function runConfigSetup(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log(chalk.blue('Git Commit AI の設定を開始します。\n'));

    // モデル選択
    console.log(chalk.yellow('使用するモデルを選択してください:'));
    console.log('1. claude-sonnet-4-20250514 (Anthropic API)');
    console.log('2. vertex-claude-sonnet-4-20250514 (Google Cloud Vertex AI)');

    const modelChoice = await askQuestion(rl, '\nモデルを選択してください (1 または 2): ');
    
    let model: Config['model'];
    if (modelChoice === '1') {
      model = 'claude-sonnet-4-20250514';
    } else if (modelChoice === '2') {
      model = 'vertex-claude-sonnet-4-20250514';
    } else {
      console.log(chalk.red('無効な選択です。設定を終了します。'));
      rl.close();
      return;
    }

    const config: Config = { model };

    // モデルに応じた設定
    if (model === 'claude-sonnet-4-20250514') {
      console.log(chalk.yellow('\nAnthropic APIキーを設定します。'));
      console.log(chalk.gray('APIキーは https://console.anthropic.com/ で取得できます。'));
      
      const apiKey = await askQuestion(rl, 'Anthropic APIキーを入力してください: ');
      if (!apiKey.trim()) {
        console.log(chalk.red('APIキーが入力されませんでした。設定を終了します。'));
        rl.close();
        return;
      }
      config.apiKey = apiKey.trim();
    } else {
      console.log(chalk.yellow('\nGoogle Cloud プロジェクト名を設定します。'));
      console.log(chalk.gray('Vertex AI が有効になっているプロジェクトIDを入力してください。'));
      
      const projectName = await askQuestion(rl, 'プロジェクト名を入力してください: ');
      if (!projectName.trim()) {
        console.log(chalk.red('プロジェクト名が入力されませんでした。設定を終了します。'));
        rl.close();
        return;
      }
      config.projectName = projectName.trim();
    }

    // 設定を保存
    saveConfig(config);
    
    console.log(chalk.green('\n設定が完了しました！'));
    console.log(chalk.blue(`選択されたモデル: ${config.model}`));
    
    if (config.apiKey) {
      console.log(chalk.blue(`APIキー: ${config.apiKey.substring(0, 8)}...`));
    }
    if (config.projectName) {
      console.log(chalk.blue(`プロジェクト名: ${config.projectName}`));
    }

  } catch (error) {
    console.error(chalk.red('設定中にエラーが発生しました:'), error);
  } finally {
    rl.close();
  }
}

/**
 * 質問をして回答を取得する
 */
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 現在の設定を表示する
 */
export function showConfig(): void {
  const config = loadConfig();
  
  if (!config) {
    console.log(chalk.yellow('設定ファイルが見つかりません。'));
    console.log(chalk.blue('git-commit-ai config を実行して設定を行ってください。'));
    return;
  }

  console.log(chalk.blue('現在の設定:'));
  console.log(chalk.green(`モデル: ${config.model}`));
  
  if (config.apiKey) {
    console.log(chalk.green(`APIキー: ${config.apiKey.substring(0, 8)}...`));
  }
  if (config.projectName) {
    console.log(chalk.green(`プロジェクト名: ${config.projectName}`));
  }
}
