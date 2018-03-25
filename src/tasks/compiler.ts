import {autobind} from 'core-decorators';
import {FSWatcher} from 'fs';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import {TaskGroup} from '../taskGroup';

@autobind
export class ServerCompiler extends TaskGroup {
  private tsProject: ts.Project;
  private watcher: FSWatcher;

  public compile(): NodeJS.ReadWriteStream {
    const {rootPath, buildDir} = this.context.config;

    const project = this.tsProject || (this.tsProject =
      ts.createProject(`${rootPath}/src/server/tsconfig.json`)
    );

    return project.src()
      .pipe(sourcemaps.init())
      .pipe(project())
      .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: './'
      }))
      .pipe(gulp.dest(`${rootPath}/${buildDir}`));
  }

  public watch(done): void {
    const {onExit, config: {rootPath}} = this.context;
    this.watcher = gulp.watch([
      `${rootPath}/src/server/**/*`,
      `${rootPath}/src/common/**/*`
    ], {ignoreInitial: true}, this.recompile);
    onExit(this.closeWatcher);
    done();
  }

  private recompile(): NodeJS.ReadWriteStream {
    process.stdout.write('recompiling server...\n');

    return this.compile();
  }

  private closeWatcher(): void {
    if(this.watcher) {
      process.stdout.write('closing server file watcher\n');
      this.watcher.close();
      this.watcher = null;
    }
  }
}

