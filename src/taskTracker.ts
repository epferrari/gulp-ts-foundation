import {autobind} from 'core-decorators';
import {Gulp} from 'gulp';

type GulpTaskEvent = {
  uid: string;
  name: string;
};

@autobind
export class TaskTracker {
  private runningTasks: Map<string, string> = new Map<string, string>();
  private exited: boolean = false;

  constructor(gulp: Gulp) {
    gulp.on('start', this.add);
    gulp.on('stop', this.remove);
  }

  private add({uid, name}: GulpTaskEvent): void {
    this.runningTasks.set(uid, name);
  }

  private remove({uid}: GulpTaskEvent): void {
    this.runningTasks.delete(uid);
    setTimeout(() => {
      if(!this.exited && this.runningTasks.size === 0) {
        this.exited = true;
        process.exit();
      }
    }, 500);
  }
}
