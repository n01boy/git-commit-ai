#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { CommandOptions, FileChange } from './types';
import { 
  git, 
  getStagedFiles, 
  generateFallbackCommitMessage, 
  performCommit,
  stageAllChanges
} from './git-utils';
import { 
  checkEnvironmentVariables, 
  generateCommitMessageWithAI,
  generateDetailedChangeSummary
} from './ai-service';
import { runConfigSetup, showConfig } from './config';

// コマンドラインオプションの設定
program
  .version('1.0.0')
  .description('AIを使用してGitコミットメッセージを自動生成するツール')
  .option('-a, --all', 'すべての変更をステージングしてからコミット')
  .option('-p, --push', 'コミット後に自動的にプッシュする')
  .option('-d, --debug', 'デバッグモード（AIへの入力を表示）')
  .option('-v, --verbose', '詳細モード（変更の詳細を表示）')
  .allowUnknownOption(false)
  .allowExcessArguments(false);

// configコマンドを追加
program
  .command('config')
  .description('AIモデルとAPIキーの設定を行う')
  .action(async () => {
    await runConfigSetup();
    process.exit(0);
  });

// config showコマンドを追加
program
  .command('config:show')
  .description('現在の設定を表示する')
  .action(() => {
    showConfig();
    process.exit(0);
  });

let options: CommandOptions = {};

// 引数なしの場合は直接メイン処理を実行
if (process.argv.length === 2) {
  // デフォルトオプションを設定
  options = {};
  main();
} else {
  program.parse(process.argv);
  options = program.opts() as CommandOptions;
}

// 対話型インターフェースの設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 変更の詳細をコンソールに表示する
 * @param summary 変更の詳細なサマリ
 */
function displayChangeSummary(summary: string) {
  console.log(chalk.cyan('\n===== 変更の詳細 ====='));
  console.log(chalk.cyan(summary));
  console.log(chalk.cyan('=====================\n'));
}

/**
 * メイン処理
 */
async function main() {
  try {
    // 環境変数のチェック
    if (!checkEnvironmentVariables()) {
      rl.close();
      return;
    }

    console.log(chalk.blue('Gitの変更を分析中...'));
    
    // すべての変更をステージングするオプションが指定されている場合
    if (options.all) {
      await stageAllChanges();
    }
    
    // ステージングされた変更を取得
    const stagedFiles = await getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.log(chalk.yellow('ステージングされた変更がありません。'));
      console.log(chalk.yellow('変更をステージングするには git add <file> または --all オプションを使用してください。'));
      rl.close();
      return;
    }
    
    console.log(chalk.green(`${stagedFiles.length}個のファイルがステージングされています:`));
    stagedFiles.forEach(file => {
      const statusColor = 
        file.status === 'added' ? chalk.green :
        file.status === 'deleted' ? chalk.red : chalk.blue;
      console.log(`  ${statusColor(file.status)} ${file.path}`);
    });
    
    // 詳細モードまたはデバッグモードの場合は、変更の詳細を表示
    if (options.verbose || options.debug) {
      const summary = generateDetailedChangeSummary(stagedFiles);
      displayChangeSummary(summary);
    }
    
    // コミットメッセージを生成
    let generatedMessage: string;
    let changeSummary: string;
    
    try {
      const result = await generateCommitMessageWithAI(stagedFiles, options.debug);
      generatedMessage = result.message;
      changeSummary = result.summary;
    } catch (error) {
      console.error(chalk.yellow('AIによるコミットメッセージ生成に失敗しました。フォールバックメッセージを使用します。'));
      generatedMessage = generateFallbackCommitMessage(stagedFiles);
      changeSummary = generateDetailedChangeSummary(stagedFiles);
    }
    
    console.log(chalk.blue('\n提案されたコミットメッセージ:'));
    console.log(chalk.cyan(`  ${generatedMessage}`));
    
    // ユーザーに確認
    rl.question(chalk.yellow('\nこのメッセージでコミットしますか？ (y/n/edit/detail): '), async (answer) => {
      let commitMessage = generatedMessage;
      
      if (answer.toLowerCase() === 'y') {
        // そのままコミット
        await performCommit(commitMessage, options.push);
        rl.close();
      } else if (answer.toLowerCase() === 'edit') {
        // メッセージを編集
        rl.question(chalk.yellow('新しいコミットメッセージを入力してください: '), async (newMessage) => {
          commitMessage = newMessage;
          await performCommit(commitMessage, options.push);
          rl.close();
        });
      } else if (answer.toLowerCase() === 'detail') {
        // 変更の詳細を表示してから再確認
        displayChangeSummary(changeSummary);
        
        rl.question(chalk.yellow('このメッセージでコミットしますか？ (y/n/edit): '), async (detailAnswer) => {
          if (detailAnswer.toLowerCase() === 'y') {
            await performCommit(commitMessage, options.push);
            rl.close();
          } else if (detailAnswer.toLowerCase() === 'edit') {
            rl.question(chalk.yellow('新しいコミットメッセージを入力してください: '), async (newMessage) => {
              commitMessage = newMessage;
              await performCommit(commitMessage, options.push);
              rl.close();
            });
          } else {
            console.log(chalk.red('コミットがキャンセルされました'));
            rl.close();
          }
        });
      } else {
        // キャンセル
        console.log(chalk.red('コミットがキャンセルされました'));
        rl.close();
      }
    });
  } catch (error) {
    console.error(chalk.red('エラーが発生しました:'), error);
    rl.close();
  }
}
