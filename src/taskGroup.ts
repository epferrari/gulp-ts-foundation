import {TaskContext, ContextConfig} from './taskContext';

export class TaskGroup<TConfig extends ContextConfig = ContextConfig> {
  protected readonly context: TaskContext<TConfig>;

  constructor(context: TaskContext<TConfig>) {
    this.context = context;
  }
}