import {Gulp} from 'gulp';
import * as assert from 'assert';
import * as DefaultRegistry from 'undertaker-registry';
import * as asyncDone from 'async-done';

import {TaskContext, ContextConfig} from './taskContext';
import {TaskTracker} from './taskTracker';

import {Cleaner} from './tasks/clean';
import {Statics} from './tasks/statics';
import {TsLinter} from './tasks/tsLint';
import {ServerCompiler} from './tasks/compiler';
import {ServerTest} from './tasks/serverTest';
import {Server} from './tasks/server';
import {WebpackDevServer} from './tasks/webpackDevServer';


export class Registry extends DefaultRegistry {

  protected readonly context: TaskContext;

  constructor(config: ContextConfig) {
    super();
    assert(typeof config.rootPath === 'string', 'rootPath must be defined in Registry options');
    this.context = new TaskContext(config);
  }

  public init(gulp: Gulp) {
    super.init(gulp);

    const {task, parallel, series} = gulp;

    /* tslint:disable-next-line */
    const tracker = new TaskTracker(gulp);

    const server = new Server(this.context);
    const cleaner = new Cleaner(this.context);
    const statics = new Statics(this.context);
    const tslint = new TsLinter(this.context);
    const compiler = new ServerCompiler(this.context);
    const serverTest = new ServerTest(this.context, server);
    const webpackDevServer = new WebpackDevServer(this.context);

    // lazily get task dependencies so overridden task definitions are as part of these chains
    const inject = taskName => {
      const fn = done => asyncDone(task(taskName), done);
      (fn as any).displayName = `[injected] ${taskName}`;

      return fn;
    };

    task('clean:client', cleaner.cleanClient);
    task('clean:server', cleaner.cleanServer);

    task('clean', parallel(
      inject('clean:client'),
      inject('clean:server')));

    task('statics:public', statics.public);
    task('statics:json', statics.json);
    task('statics', parallel(
      inject('statics:public'),
      inject('statics:json')));

    task('tslint:tasks', tslint.lintTasks);
    task('tslint:server', tslint.lintServer);
    task('tslint:common', tslint.lintCommon);
    task('tslint:client', tslint.lintClient);

    task('tslint', parallel(
      inject('tslint:client'),
      inject('tslint:common'),
      inject('tslint:server')));

    task('client:prebuild', series(
      inject('clean:client'),
      inject('statics:public')));

    task('client:build', series(
      parallel(
        inject('tslint:client'),
        inject('client:prebuild'))
      /* TODO: add webpack here */));

    task('webpack:devServer', webpackDevServer.serve);

    task('client:dev', series(
      inject('client:prebuild'),
      inject('webpack:devServer')));

    task('server:precompile', inject('statics:json'));

    task('server:compile', series(
      inject('server:precompile'),
      compiler.compile));

    task('server:test:single', series(
      inject('server:compile'),
      serverTest.single
    ));

    task('server:test', series(
      parallel(
        inject('server:test:single'),
        compiler.watch),
      serverTest.continuous
    ));

    task('server:build', parallel(
      inject('tslint:server'),
      inject('server:compile')));

    task('server:run', series(
      inject('clean:server'),
      inject('server:compile'),
      parallel(
        compiler.watch,
        serverTest.applyHooks
      ),
      server.serve));

    task('dev', parallel(
      inject('client:dev'),
      inject('server:run')));

    task('validate', parallel(
      inject('tslint'),
      inject('server:test:single')));

    task('default', inject('dev'));
  }
}


