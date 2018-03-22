import {autobind} from 'core-decorators';
import * as gulp from 'gulp';
import {TaskGroup} from '../taskGroup';

@autobind
export class Statics extends TaskGroup {
  public build(): NodeJS.ReadWriteStream {
    const {config: {rootPath, buildDir}} = this.context;

    return gulp
      .src(`${rootPath}/src/public/*`)
      .pipe(gulp.dest(`${rootPath}/${buildDir}/public`));
  }
}