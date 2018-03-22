import {TaskContext} from './taskContext';

export class TaskGroup {
  protected readonly context: TaskContext;

  constructor(context: TaskContext) {
    this.context = context;
  }
}