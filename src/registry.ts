import {Gulp} from 'gulp';
import * as assert from 'assert';
import {TaskContext, ContextConfig} from './taskContext';
import * as DefaultRegistry from 'undertaker-registry';

import {Cleaner} from './tasks/clean';
import {Statics} from './tasks/statics';
import {TsLinter} from './tasks/tsLint';
import {ServerCompiler} from './tasks/compiler';
import {ServerTest} from './tasks/serverTest';
import {Server} from './tasks/server';
import {WebpackDevServer} from './tasks/webpackDevServer';

export class Registry extends DefaultRegistry {

  protected readonly context: TaskContext;

  constructor(options: ContextConfig) {
    super();
    assert(typeof options.rootPath === 'string', 'rootPath must be defined in Registry options');
    this.context = new TaskContext(options);
  }

  public init(gulp: Gulp) {
    super.init(gulp);

    const {task, parallel, series} = gulp;

    const server = new Server(this.context);
    const cleaner = new Cleaner(this.context);
    const statics = new Statics(this.context);
    const tslint = new TsLinter(this.context);
    const compiler = new ServerCompiler(this.context);
    const serverTest = new ServerTest(this.context, server);
    const webpackDevServer = new WebpackDevServer(this.context);

    task('clean:client', cleaner.cleanClient);
    task('clean:server', cleaner.cleanServer);
    task('clean', parallel('clean:client', 'clean:server'));

    task('statics:build', statics.build);

    task('tslint:tasks', tslint.lintTasks);
    task('tslint:server', tslint.lintServer);
    task('tslint:client', tslint.lintClient);
    task('tslint', parallel('tslint:client', 'tslint:client'));

    task('client:prebuild', parallel('tslint:client', series('clean:client', 'statics:build')));
    task('client:build', series('client:prebuild'/* webpack here */));
    task('client:devServer', series('client:prebuild', webpackDevServer.serve));

    task('server:compile', compiler.compile);

    task('server:test:single', series(
      'server:compile',
      serverTest.single
    ));

    task('server:test', series(
      parallel('server:test:single', compiler.watch),
      serverTest.continuous
    ));

    task('server:run', parallel(
      'tslint:server',
      parallel(
        compiler.watch,
        serverTest.applyHooks
      ),
      series(
        'clean:server',
        'server:compile',
        server.serve
      )
    ));

    task('dev', parallel('client:devServer', 'server:run'));

    task('default', task('dev'));
  }
}


