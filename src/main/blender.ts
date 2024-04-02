import { spawn, exec } from 'child_process';

export class Blender {
  public path: string;
  constructor(path: string) {
    this.path = path;
  }

  /**
   * @description 获取blender版本号
   * @returns blender版本号
   * @example Blender 3.6.0 (hash c7fc78b81ecb built 2023-06-27 08:27:30)
   */

  async getVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      let blender = spawn(this.path, ['-b', '-v'], {});
      blender.stdout.on('data', (m) => {
        resolve(m.toString('utf8'));
      });
    });
  }

  /**
   * @description 动画渲染
   */
  animateRender() {}
}
