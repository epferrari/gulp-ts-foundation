import {autobind} from 'core-decorators';
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
      .on('stdout', (message) => process.stdout.write(`[dev] ${message}`))
      .on('stderr', (err) => process.stderr.write(`[dev] ${err}`));
  }
}