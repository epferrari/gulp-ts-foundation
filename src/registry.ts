import {Gulp, TaskFunction} from 'gulp';
import * as assert from 'assert';
import * as DefaultRegistry from 'undertaker-registry';
import * as asyncDone from 'async-done';
import {autobind} from 'core-decorators';

import {TaskContext, ContextConfig} from './taskContext';
import {TaskTracker} from './taskTracker';

type DoneCallback = (error?: any) => void;

@autobind
export class Registry<TConfig extends ContextConfig = ContextConfig> extends DefaultRegistry {
  private _context: TaskContext<TConfig>;
  private _config: TConfig;
  private gulp: Gulp;

  constructor(
    config: TConfig
  ) {
    super();
    assert(typeof config.rootPath === 'string', 'rootPath must be defined in Registry options');
    this._config = config;
  }

  public get context(): TaskContext<TConfig> {
    return this._context;
  }

  public init(gulp: Gulp) {
    super.init(gulp);
    // hackish
    this.gulp = gulp;
    this._context = new TaskContext<TConfig>(this._config, gulp);
    /* tslint:disable-next-line */
    const tracker = new TaskTracker(gulp);
  }

  // lazily load task dependencies so task definitions at higher levels are injected as part of lower level chains
  public inject(taskname: string): TaskFunction {
    const lazy: TaskFunction = (done: DoneCallback) => asyncDone(this.gulp.registry().get(taskname), done);
    lazy.displayName = `[injected] ${taskname}`;

    return lazy;
  }

  public override(taskname: string, override: (original: TaskFunction) => TaskFunction): void {
    const original: TaskFunction = this.gulp.registry().get(taskname) || ((d: DoneCallback) => d());
    const overridden: TaskFunction = (done: DoneCallback) => asyncDone(override(original), done);
    overridden.displayName = `[overriden] ${taskname}`;
    this.gulp.task(taskname, overridden);
  }
}




