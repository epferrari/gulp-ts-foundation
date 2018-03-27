import {autobind} from 'core-decorators';
import {isPlainObject} from 'lodash';
import * as nodemon from 'gulp-nodemon';
import {TaskGroup} from '../taskGroup';

@autobind
export class Server extends TaskGroup {
  private serving: boolean = false;

  public get running(): boolean {
    return this.serving;
  }

  public serve(done) {
    const {onExit, config: {rootPath, buildDir}} = this.context;
    // hackaround for nodemon stream not signaling done-ness to the gulp task
    onExit(done);

    return nodemon({
      script: `${rootPath}/${buildDir}/server`,
      ext: 'js json',
      env: {...process.env},
      watch: [
        `${rootPath}/${buildDir}/server`,
        `${rootPath}/${buildDir}/common`
      ],
      nodeArgs: ['--trace-warnings', '-r', 'source-map-support/register'],
      stdout: false
    } as any)
      .on('start', () => this.serving = true)
      .on('end', () => this.serving = false)
      .on('crash', () => this.serving = false)
      .on('stdout', (msg) => {
        try {
          const maybeObject = JSON.parse(msg);
          if(isPlainObject(maybeObject)) {
            // allow bunyan cli to format msg
            process.stdout.write(msg);
          } else {
            process.stdout.write(`[dev] ${msg}\n`);
          }
        } catch(e) {
          process.stdout.write(`[dev] ${msg}\n`);
        }
      })
      .on('stderr', (err) => {
        try {
          const maybeObject = JSON.parse(err);
          if (isPlainObject(maybeObject)) {
            // allow bunyan cli to pick format msg
            process.stderr.write(err);
          } else {
            process.stderr.write(`[dev] ${err}\n`);
          }
        } catch (e) {
          process.stderr.write(`[dev] ${err}\n`);
        }
      });
  }
}