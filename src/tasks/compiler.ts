import {autobind} from 'core-decorators';
import {FSWatcher} from 'fs';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import {TaskGroup} from '../taskGroup';

@autobind
export class ServerCompiler extends TaskGroup {
  private tsProject: ts.Project;

  public compile(): NodeJS.ReadWriteStream {
    const {rootPath, buildDir} = this.context.config;

    const project = this.tsProject || (this.tsProject =
      ts.createProject(`${rootPath}/src/server/tsconfig.json`)
    );

    return gulp.src(`${rootPath}/src/server/**/*.ts`)
      .pipe(sourcemaps.init())
      .pipe(project())
      .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: './'
      }))
      .pipe(gulp.dest(`${rootPath}/${buildDir}/server`));
  }

  public watch(done): NodeJS.EventEmitter {
    const {onExit, config: {rootPath}} = this.context;
    const recompile = () => {
      process.stdout.write('recompiling server...\n');
      this.compile();
    };
    const watcher: FSWatcher = gulp.watch(`${rootPath}/src/server/*`, recompile);
    onExit(watcher.close.bind(watcher));
    done();

    return watcher;
  }
}

