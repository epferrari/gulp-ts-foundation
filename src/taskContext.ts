import {autobind} from 'core-decorators';
import {ChildProcess} from 'child_process';
import * as killTree from 'tree-kill';
import {ContextCommands} from './contextCommands';

export interface ContextConfig {
  rootPath: string;
  buildDir?: string;
  webpackConfigPath?: string;
}

@autobind
export class TaskContext {

  private childProcesses: {process: ChildProcess, options: {}}[] = [];
  private teardowns: (() => void)[] = [];
  private commands: ContextCommands = new ContextCommands();

  public readonly config: ContextConfig;
  public registerCommand = this.commands.register;

  constructor(config: ContextConfig) {
    this.config = mergeDefaultConfig(config);

    this.commands.register('q', {
      handler: this.exit,
      description: 'Quit all tasks'
    });
    this.commands.register('commands', {
      handler: this.commands.list,
      description: 'List available commands'
    });
    this.commands.listen();

    process.on('exit', this.exitGracefully);
  }

  public registerChildProcess(child: ChildProcess, options: {silent?: boolean} = {}): void {
    if (!options.silent) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }
    this.childProcesses.push({process: child, options});
  }

  public onExit(cb: () => void): void {
    this.teardowns.push(cb);
  }

  private exit(): void {
    process.stdout.write('exiting\n');
    this.exitGracefully();
    process.exit(0);
  }

  private exitGracefully() {
    this.childProcesses.forEach(child => {
      killTree(child.process.pid);
      child.process.kill();
    });
    this.teardowns.forEach(cb => cb && cb());
  }
}

function mergeDefaultConfig(config: ContextConfig): ContextConfig {
  return {
    buildDir: (process.env.NODE_ENV === 'production' ? 'dist' : 'build'),
    ...config
  };
}




