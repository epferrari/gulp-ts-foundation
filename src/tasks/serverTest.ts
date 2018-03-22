import {autobind} from 'core-decorators';
import {FSWatcher} from 'fs';
import * as gulp from 'gulp';
import * as mocha from 'gulp-mocha';
import * as debug from 'gulp-debug';
import {noop} from 'lodash';
import {TaskContext} from '../taskContext';
import {TaskGroup} from '../taskGroup';
import {Server} from './server';


@autobind
export class ServerTest extends TaskGroup {

  private server: Server;
  private specFilesGlob: string;
  private watcher: FSWatcher;

  constructor(context: TaskContext, server: Server) {
    super(context);
    this.server = server;
    const {rootPath, buildDir} = context.config;
    this.specFilesGlob = `${rootPath}/${buildDir}/**/*.spec.js`;
  }

  public single(): NodeJS.ReadWriteStream {
    return gulp
      .src(this.specFilesGlob)
      .pipe(debug({title: 'Server test files:'}))
      .pipe(mocha());
  }

  public continuous(done) {
    const {onExit} = this.context;
    onExit(done);

    this.single();
    this.watcher = gulp.watch(this.specFilesGlob, this.single);

    done();

    return this.watcher;
  }

  public applyHooks(done): void {
    this.context.registerCommand('serverTest', {
      handler: (args) => {
        if (args.start) {
          this.startServerTests();
        }
        else if (args.stop) {
          this.stopServerTests();
        }
      },
      description: 'Start running server specs, re-run as server recompiles',
      options: ['--start', '--stop']
    });

    done();
  }

  private startServerTests(): void {
    if (this.server.running && !this.watcher) {
      this.continuous(noop);
    }
    else if (!this.server.running) {
      logHookFailure();
    }
  }

  private stopServerTests(): void {
    if (this.server.running && this.watcher) {
      process.stdout.write('stopping server tests\n');
      this.watcher.close();
      this.watcher = null;
    }
    else if (!this.server.running) {
      logHookFailure();
    }
  }
}

function logHookFailure(): void {
  process.stdout.write('No running server, cannot hook server specs\n');
}