import {autobind} from 'core-decorators';
import {TaskGroup} from '../taskGroup';
import {exec, ChildProcess} from 'child_process';

@autobind
export class WebpackDevServer extends TaskGroup {

  public serve(done): void {
    const {
      registerChildProcess,
      onExit,
      config: {rootPath, webpackConfigPath}
    } = this.context;

    const c = [
      `${rootPath}/node_modules/.bin/webpack-dev-server`,
      `--config ${webpackConfigPath}`,
      `--env development`
    ].join(' ');

    const child: ChildProcess = exec(c, (err, stdout, stderr) => {
      process.stdout.write(stdout);
      process.stderr.write(stderr);
      done(err);
    });

    registerChildProcess(child);
    onExit(done);
  }
}