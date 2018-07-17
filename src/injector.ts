import {Gulp, TaskFunction} from 'gulp';
import * as asyncDone from 'async-done';

// lazily load task dependencies to allow overrides
export function injector({task}: Gulp): (taskname: string) => TaskFunction {
  return (taskname: string): TaskFunction => {
    const fn = done => {asyncDone(task(taskname), done); };
    (fn as any).displayName = `[injected] ${taskname}`;

    return fn;
  };
}

export const inject: (taskname: string) => TaskFunction = injector(require('gulp'));