import {autobind} from 'core-decorators';
import {Gulp} from 'gulp';
import * as StrongBus from 'strongbus';

import {GulpEvent, RegistryEvents} from './events';

@autobind
export class TaskTracker {
  private runningTasks: Map<string, string> = new Map<string, string>();
  private exited: boolean = false;

  constructor(gulp: Gulp, private readonly bus: StrongBus.Bus<RegistryEvents>) {
    gulp
      .on('start', this.add)
      .on('start', (event: GulpEvent) => this.bus.emit('gulp_task_start', event))
      .on('stop', (event: GulpEvent) => this.bus.emit('gulp_task_stop', event))
      .on('stop', this.remove);
  }

  private add({uid, name}: GulpEvent): void {
    if(this.runningTasks.size === 0) {
      this.bus.emit('gulp_start', null);
    }
    this.runningTasks.set(uid, name);
  }

  private remove({uid}: GulpEvent): void {
    this.runningTasks.delete(uid);
    setTimeout(() => {
      if(!this.exited && this.runningTasks.size === 0) {
        this.bus.emit('gulp_done', null);
        this.exited = true;
        process.exit();
      }
    }, 500);
  }
}
