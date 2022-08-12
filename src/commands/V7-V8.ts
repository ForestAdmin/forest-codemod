import path from 'path';
import fs from 'fs';
import { Command } from '@oclif/core'
import { run } from 'jscodeshift/src/Runner';

export default class V7toV8 extends Command {
  static override description = 'Migrate your v7 agent to V8';
  static excludedFolderToExtract = ['node_modules'];

  extractFiles(folderPath: string): String[] {
    const dirents = fs.readdirSync(folderPath, { withFileTypes: true });

    return dirents.flatMap(dirent => {
      if (V7toV8.excludedFolderToExtract.includes(dirent.name)) return null;

      const direntPath = path.join(folderPath, dirent.name);

      if (dirent.isDirectory()) return this.extractFiles(direntPath);
      if (path.extname(dirent.name) === '.js') return direntPath;
    }).filter(Boolean);
  }

  async run(): Promise<any> {
    const projectPath = process.cwd();
    const filesPath = this.extractFiles(projectPath);

    const transformPath = `../mods/v7-v8/index.${process.env.NODE_ENV === 'development' ? 'ts' : 'js'}`;

    const res = await run(
      path.join(__dirname, transformPath),
      filesPath,
      { babel: true, parser: 'flow', verbose: 2 },
    );

    this.log(res);
  }
}
