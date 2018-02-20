import {autobind} from 'core-decorators';
import {ChildProcess} from 'child_process';
import * as killTree from 'tree-kill';
import {ContextCommands} from './contextCommands';

export interface ContextOptions {
  rootPath: string;
  buildDir?: string;
  webpackConfigPath?: string;
}

@autobind
export class TaskContext implements ContextOptions {

  public readonly rootPath: string;
  public readonly buildDir: string;
  public readonly webpackConfigPath: string;

  private childProcesses: {process: ChildProcess, options: {}}[] = [];
  private teardowns: (() => void)[] = [];
  private commands: ContextCommands = new ContextCommands();
  public registerCommand = this.commands.register;

  constructor(options: ContextOptions) {
    this.rootPath = options.rootPath;
    this.buildDir = options.buildDir || (process.env.NODE_ENV === 'production' ? 'dist' : 'build');
    this.webpackConfigPath = options.webpackConfigPath;

    this.commands.register('q', this.exit, 'Quit all tasks');
    this.commands.register('commands', this.commands.list, 'List available commands');
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




