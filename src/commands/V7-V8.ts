import path from 'path';
import fs from 'fs';
import { Command } from '@oclif/core'
import { run } from 'jscodeshift/src/Runner';

export default class V7toV8 extends Command {
  static override description = 'Migrate your v7 agent to V8';

  async run(): Promise<any> {
    const res = await run(
      path.join(__dirname, '../mods/v7-v8/index.ts'),
      [path.join(__dirname, '../../files-to-mod')],
      { babel: true, parser: 'flow' },
    );
    this.log(res);
  }
}
