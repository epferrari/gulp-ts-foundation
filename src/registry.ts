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

    const hook = taskName => {
      const fn = done => {
        process.stdout.write(`[hook] ${taskName}`);
        done();
      };
      (fn as any).displayName = taskName;
      task(taskName, fn);
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
    task('tslint:client', tslint.lintClient);

    task('tslint', parallel(
      inject('tslint:client'),
      inject('tslint:server')));

    hook('client:prebuild');

    task('client:build', series(
      inject('client:prebuild'),
      parallel(
        inject('tslint:client'),
        inject('clean:client')),
      inject('statics:public')
      /* TODO: add webpack here */));

    task('client:devServer', series(
      inject('client:prebuild'),
      parallel(
        inject('tslint:client'),
        inject('clean:client')),
      inject('statics:public'),
      webpackDevServer.serve));
    
    hook('server:precompile');

    task('server:compile', series(
      inject('server:precompile'),
      inject('statics:json'),
      compiler.compile,
      inject('server:postcompile')));
    
    hook('server:postcompile');

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

    task('server:run', series(
      parallel(
        inject('tslint:server'),
        inject('clean:server')),
      inject('server:compile'),
      parallel(
        compiler.watch,
        serverTest.applyHooks
      ),
      server.serve));

    task('dev', series(
      parallel(
        inject('clean'),
        inject('tslint')),
      parallel(
        inject('server:compile'),
        inject('client:devServer')),
      parallel(
        compiler.watch,
        serverTest.applyHooks),
      server.serve));
      

    task('default', inject('dev'));
  }
}


