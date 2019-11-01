import * as gulp from 'gulp';
import * as appRootPath from 'app-root-path';
import {Registry} from '../src';

const rootPath = appRootPath.toString();
const config = {
  rootPath
};

class TestRegistry extends Registry {
  public init(inst: gulp.Gulp) {
    super.init(inst);

    inst.task('foo', done => setTimeout(done, 25000));
  }
}

gulp.registry(new TestRegistry(config));