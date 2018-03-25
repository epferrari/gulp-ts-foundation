import {autobind} from 'core-decorators';
import {Gulp} from 'gulp';

type GulpTaskEvent = {
  uid: string;
  name: string;
};

@autobind
export class TaskTracker {
  private runningTasks: {[uid: string]: string} = {};
  private exited: boolean = false;

  constructor(gulp: Gulp) {
    gulp.on('start', this.add);
    gulp.on('stop', this.remove);
  }

  private add({uid, name}: GulpTaskEvent): void {
    this.runningTasks[uid] = name;
  }

  private remove({uid}: GulpTaskEvent): void {
    delete this.runningTasks[uid];
    setTimeout(() => {
      if(!this.exited && Object.keys(this.runningTasks).length === 0) {
        this.exited = true;
        process.exit();
      }
    }, 500);
  }
}
