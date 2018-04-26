import {autobind} from 'core-decorators';
import * as gulp from 'gulp';
import {TaskGroup} from '../taskGroup';

@autobind
export class Statics extends TaskGroup {
  public public(): NodeJS.ReadWriteStream {
    const {config: {rootPath, buildDir}} = this.context;

    return gulp
      .src(`${rootPath}/src/public/**/*`)
      .pipe(gulp.dest(`${rootPath}/${buildDir}/public`));
  }

  public json(): NodeJS.ReadWriteStream {
    const {config: {rootPath, buildDir}} = this.context;

    return gulp
      .src([
        `${rootPath}/src/**/*.json`,
        '!**/tsconfig.json',
        '!**/tslint.json'
      ])
      .pipe(gulp.dest(`${rootPath}/${buildDir}`));
  }
}