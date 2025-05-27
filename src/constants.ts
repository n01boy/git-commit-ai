/**
 * ファイル除外パターンの定数
 */
export const EXCLUDE_FILE_PATTERNS = [
  // ロックファイル
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'Gemfile.lock',
  'Pipfile.lock',
  'poetry.lock',
  
  // ビルド成果物
  '*.min.js',
  '*.min.css',
  '*.bundle.js',
  '*.bundle.css',
  
  // ログファイル
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  
  // 一時ファイル
  '*.tmp',
  '*.temp',
  '*.swp',
  '*.swo',
  '*~',
  
  // OS固有ファイル
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  
  // IDE設定ファイル
  '.vscode/settings.json',
  '.idea/workspace.xml',
  '*.iml',
];

/**
 * 除外すべきディレクトリのパターン
 */
export const EXCLUDE_DIRECTORIES = [
  'node_modules',
  'dist',
  'build',
  'out',
  'target',
  '.git',
  '.svn',
  '.hg',
  '__pycache__',
  '.pytest_cache',
  '.coverage',
  'coverage',
  '.nyc_output',
  'vendor',
  'bower_components',
];

/**
 * ファイルタイプの説明マップ
 */
export const FILE_TYPE_DESCRIPTIONS: Record<string, string> = {
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
