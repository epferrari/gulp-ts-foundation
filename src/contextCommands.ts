import {autobind} from 'core-decorators';
import * as assert from 'assert';

export type CommandArgs = {[arg: string]: string | boolean};

export type ContextCommand = {
  handler: (args?: CommandArgs) => void;
  description: string;
  options?: string[];
};

@autobind
export class ContextCommands {

  private commands: Map<string, ContextCommand> = new Map<string, ContextCommand>();

  public list(): void {
    const commands = Array.from(this.commands.keys());
    process.stdout.write('\nAvailable Commands\n');
    process.stdout.write('invoke via :<command> [--arg1, --arg2, ...] or [--arg=value]\n');
    process.stdout.write('see command options below for accepted arguments\n\n');

    commands.forEach(name => {
      const command = this.commands.get(name);
      process.stdout.write(`${name} -- ${command.description}\n`);
      if (command.options) {
        process.stdout.write(`   options: ${command.options.join(' ')}\n`);
      }
    });
  }

  public register(command: string, contextCommand: ContextCommand): void {
    this.ensureUniqueCommand(command);
    ensureCommandFormatting(command);
    this.commands.set(command, contextCommand);
  }

  public listen(): void {
    process.stdin.on('data', (data: Buffer) => {
      try {
        this.processInput(data);
      } catch (e) {
        process.stderr.write(`Error invoking command, ${e.message}`);
      }
    });
  }

  private processInput(buffer: Buffer): void {
    const input: string = buffer.toString().trim();
    if(isCommand(input)) {
      const sArgs = input.split(/\s+/);
      const command = sArgs.shift().replace(/^\:/, '');
      const args = parseArgs(sArgs);
      this.invoke(command, args);
    }
  }

  private invoke(command: string, args: CommandArgs): void {
    const cmd = this.commands.get(command);
    if(cmd) {
      cmd.handler(args);
    }
  }

  private ensureUniqueCommand(command: string): void {
    assert(
      !this.commands.has(command),
      `Command ${command} already registered. Pick a unique command name`
    );
  }
}

function isCommand(input: string): boolean {
  return /^\:/.test(input);
}

function parseArgs(vArgs: string[]): CommandArgs {
  return vArgs.reduce((acc, arg) => {
    arg = arg.replace(/^\-+/, '');
    if (/\=/.test(arg)) {
      const kv = arg.split('=');
      acc[kv[0]] = kv[1];
    } else {
      acc[arg] = true;
    }

    return acc;
  }, {});
}

function ensureCommandFormatting(command: string): void {
  assert(
    /^\w/.test(command),
    `Command should start with a letter, check ${command}`
  );
  assert(
    !(/[^\w-]/.test(command)),
    `Command should only contain [a-zA-z0-9_-], check ${command}`
  );
  assert(
    !(/\s/).test(command),
    `Commands should not have spaces, check ${command}`
  );
}