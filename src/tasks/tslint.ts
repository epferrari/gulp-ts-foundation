import {autobind} from 'core-decorators';
import * as gulp from 'gulp';
import tslintPlugin from 'gulp-tslint';
import * as tslint from 'tslint';
import {Program} from 'typescript';
import {TaskGroup} from '../taskGroup';

const formatter = 'stylish';

@autobind
export class TsLinter extends TaskGroup {
  private taskProgram: Program;
  private clientProgram: Program;
  private serverProgram: Program;

  public lintTasks(): NodeJS.ReadWriteStream {
    const {rootPath} = this.context.config;

    const program = this.taskProgram || (this.taskProgram =
      tslint.Linter.createProgram(`${rootPath}/gulp/tsconfig.json`)
    );

    return gulp.src(`${rootPath}/gulp/**/*.ts`)
      .pipe(tslintPlugin({formatter, program}))
      .pipe(tslintPlugin.report());
  }


  public lintServer(): NodeJS.ReadWriteStream {
    const {rootPath} = this.context.config;

    const program = this.serverProgram || (this.serverProgram =
      tslint.Linter.createProgram(`${rootPath}/src/server/tsconfig.json`)
    );

    return gulp.src(`${rootPath}/src/server/**/*.ts`)
      .pipe(tslintPlugin({formatter, program}))
      .pipe(tslintPlugin.report());
  }

  public lintCommon(): NodeJS.ReadWriteStream {
    const {rootPath} = this.context.config;

    const program = this.serverProgram || (this.serverProgram =
      tslint.Linter.createProgram(`${rootPath}/src/common/tsconfig.json`)
    );

    return gulp.src(`${rootPath}/src/common/**/*.ts`)
      .pipe(tslintPlugin({formatter, program}))
      .pipe(tslintPlugin.report());
  }

  public lintClient(): NodeJS.ReadWriteStream {
    const {rootPath} = this.context.config;

    const program = this.clientProgram || (this.clientProgram =
      tslint.Linter.createProgram(`${rootPath}/src/client/tsconfig.json`)
    );

    return gulp.src(`${rootPath}/src/client/**/*.ts{x}`)
      .pipe(tslintPlugin({formatter, program}))
      .pipe(tslintPlugin.report());
  }
}