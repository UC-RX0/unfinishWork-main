// @ts-ignore
import packageJSON from "../package.json";

/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
  async openPanel() {
    return await Editor.Panel.openBeside("scene", packageJSON.name);
  },
  async refreshPanel() {
    await Editor.Panel.close(packageJSON.name);
    await new Promise((rs) => setTimeout(rs, 300));
    await Editor.Panel.openBeside("scene", packageJSON.name);
  },
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {}
