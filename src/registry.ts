import {Gulp, TaskFunction} from 'gulp';
import * as assert from 'assert';
import * as DefaultRegistry from 'undertaker-registry';
import * as asyncDone from 'async-done';
import {autobind} from 'core-decorators';

import {TaskContext, ContextConfig} from './taskContext';
import {TaskTracker} from './taskTracker';

@autobind
export class Registry<TConfig extends ContextConfig = ContextConfig> extends DefaultRegistry {
  protected readonly context: TaskContext<TConfig>;

  constructor(
    config: TConfig
  ) {
    super();
    assert(typeof config.rootPath === 'string', 'rootPath must be defined in Registry options');
    this.context = new TaskContext<TConfig>(config);
  }

  public init(gulp: Gulp) {
    super.init(gulp);
    /* tslint:disable-next-line */
    const tracker = new TaskTracker(gulp);
  }

  // lazily load task dependencies so overridden task definitions are injected as part of these chains
  public inject(taskname: string): TaskFunction {
    const fn = done => asyncDone(this.get(taskname), done);
    (fn as any).displayName = `[injected] ${taskname}`;

    return fn;
  }
}




