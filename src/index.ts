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
  generateCommitMessageWithAI 
} from './ai-service';

// コマンドラインオプションの設定
program
  .version('1.0.0')
  .description('AIを使用してGitコミットメッセージを自動生成するツール')
  .option('-a, --all', 'すべての変更をステージングしてからコミット')
  .option('-p, --push', 'コミット後に自動的にプッシュする')
  .option('-d, --debug', 'デバッグモード（AIへの入力を表示）')
  .parse(process.argv);

const options = program.opts() as CommandOptions;

// 対話型インターフェースの設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    
    // コミットメッセージを生成
    let generatedMessage: string;
    try {
      generatedMessage = await generateCommitMessageWithAI(stagedFiles, options.debug);
    } catch (error) {
      console.error(chalk.yellow('AIによるコミットメッセージ生成に失敗しました。フォールバックメッセージを使用します。'));
      generatedMessage = generateFallbackCommitMessage(stagedFiles);
    }
    
    console.log(chalk.blue('\n提案されたコミットメッセージ:'));
    console.log(chalk.cyan(`  ${generatedMessage}`));
    
    // ユーザーに確認
    rl.question(chalk.yellow('\nこのメッセージでコミットしますか？ (y/n/edit): '), async (answer) => {
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

// プログラムを実行
main();