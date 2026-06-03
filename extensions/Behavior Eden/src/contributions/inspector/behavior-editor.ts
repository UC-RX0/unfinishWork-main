// @ts-nocheck
"use strict";
type Selector<$> = { $: Record<keyof $, any | null> };

export const template = `
<div style="display:flex;justify-content:center;align-items:center;margin-top:10px;">
    <ui-button class="editor" style="height:24px;padding:0 16px;">Create / Edit</ui-prop>
</div>

`;

export const $ = {
  editor: ".editor",
};

export function update(this: Selector<typeof $>, dump: any) {
  // 使用 ui-porp 自动渲染，设置 prop 的 type 为 dump
  // render 传入一个 dump 数据，能够自动渲染出对应的界面
  // 自动渲染的界面修改后，能够自动提交数据
  if (typeof this.$.editor.render === "function") {
    this.$.editor.render(dump.value.label);
  }
}

export function ready(this: Selector<typeof $> & any) {
  this.$.editor.addEventListener("confirm", async () => {
    const BehaviorTreeComponentName = "BehaviorTree";
    // 找到点击组件的节点
    const node = await Editor.Message.request("scene", "query-node", Editor.Selection.getSelected("node"));
    if (!node) {
      console.warn(`未选中节点`);
    }
    // 找到BehaviorTree组件
    const index = node.__comps__.findIndex((v: any) => v.type === BehaviorTreeComponentName);
    if (index === -1) {
      console.warn(`节点未挂载【${BehaviorTreeComponentName}】组件`);
      return;
    }

    const component = node.__comps__[index];
    // 调用BehaviorTree组件上的方法获取json文件
    const json = await Editor.Message.request("scene", "execute-component-method", {
      uuid: component.value.uuid.value,
      name: "getAssetUrl",
    });

    // JSON文件不存在
    if (!json) {
      // 生成文件
      const url = `db://assets/${node.name.value}.json`;
      const content = JSON.stringify({ nodes: [] });
      const res = await Editor.Message.request("asset-db", "create-asset", url, content, {
        overwrite: false,
        rename: true,
      });

      console.log(`已经自动生成${res.name}文件`);
      // 设置属性
      const uuid = res.uuid;
      const success = await Editor.Message.request("scene", "set-property", {
        uuid: node.uuid.value,
        path: `__comps__.${index}.asset`,
        dump: {
          type: "cc.JsonAsset",
          value: {
            uuid,
          },
        },
      });
      if (success) {
        console.log(`JSON文件挂载成功`);
      } else {
        console.warn("JSON文件挂载失败");
        return;
      }
    }
    // 打开插件面板
    const success = await Editor.Message.request("behavior-eden", "open-panel");
    // success为false，可能是已经打开了，通知面板刷新
    if (!success) {
      await Editor.Message.request("behavior-eden", "refresh-panel");
    }
  });
}
