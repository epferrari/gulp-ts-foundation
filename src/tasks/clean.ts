import {autobind} from 'core-decorators';
import * as del from 'del';
import {TaskGroup} from '../taskGroup';

@autobind
export class Cleaner extends TaskGroup {
  public cleanServer() {
    const {config: {rootPath, buildDir}} = this.context;

    return del([`${rootPath}/${buildDir}/server`]);
  }

  public cleanClient() {
    const {config: {rootPath, buildDir}} = this.context;

    return del([`${rootPath}/${buildDir}/{client,public}`]);
  }
}
