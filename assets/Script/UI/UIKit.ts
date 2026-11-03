import { Color, Graphics, Label, Node, UITransform, Vec3 } from "cc";

/**
 * @description 轻量 UI 绘制工具
 *
 * 工程里没有 UI 图集，所有 HUD 元素都用引擎自带的 Graphics / Label 现场画。
 * 好处是零资源依赖：加一个界面不需要美术出图，也不需要改资源清单。
 *
 * 约定：UI 层的坐标原点在【父节点左下角】，宽高由 UITransform 决定。
 */

/**常用色板*/
export const UI_COLOR = {
    /**血条底槽（半透明黑）*/
    barBg: new Color(20, 20, 24, 180),
    /**血条满血色*/
    barFull: new Color(72, 200, 110, 255),
    /**血条低血色*/
    barLow: new Color(220, 70, 70, 255),
    /**文字主色*/
    text: new Color(240, 240, 245, 255),
    /**文字次色*/
    textDim: new Color(170, 175, 190, 255),
    /**强调色（波次 / 胜利）*/
    accent: new Color(255, 196, 72, 255),
    /**失败色*/
    danger: new Color(232, 76, 76, 255),
    /**面板背景*/
    panel: new Color(12, 14, 20, 210),
    /**描边*/
    border: new Color(90, 100, 120, 255),
};

/**
 * 创建一个带 UITransform 的节点
 * @param name 节点名
 * @param width 宽度
 * @param height 高度
 * @param parent 父节点
 */
export function createUINode(name: string, width: number, height: number, parent: Node): Node {
    const node = new Node(name);
    node.parent = parent;
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    return node;
}

/**
 * 创建一个文字标签
 * @param text 初始文本
 * @param fontSize 字号
 * @param color 颜色
 */
export function createLabel(text: string, fontSize: number, color: Color): Label {
    const label = new Label();
    label.string = text;
    label.fontSize = fontSize;
    label.color = color;
    label.lineHeight = fontSize + 6;
    // 工程内没有字体资源，用系统字体（各平台都有，保证一定能显示）
    label.useSystemFont = true;
    label.fontFamily = "Arial";
    label.enableWrapText = false;
    return label;
}

/**
 * 画一个填充矩形（会先清空画布）
 * @param node 目标节点（需挂有 Graphics）
 * @param x 左下角 X
 * @param y 左下角 Y
 * @param w 宽
 * @param h 高
 * @param color 颜色
 */
export function fillRect(node: Node, x: number, y: number, w: number, h: number, color: Color): void {
    const g = node.getComponent(Graphics);
    if (!g) return;
    g.clear();
    g.fillColor = color;
    g.roundRect(x, y, w, h, 2);
    g.fill();
}

/**
 * 画一个描边矩形（带背景）
 */
export function drawPanel(
    node: Node,
    x: number, y: number, w: number, h: number,
    bg: Color, border: Color, borderWidth: number = 2
): void {
    const g = node.getComponent(Graphics);
    if (!g) return;
    g.clear();
    g.fillColor = bg;
    g.roundRect(x, y, w, h, 6);
    g.fill();
    g.strokeColor = border;
    g.lineWidth = borderWidth;
    g.roundRect(x, y, w, h, 6);
    g.stroke();
}

/**
 * 画一个水平进度条（血条 / 进度）
 * @param ratio 0~1
 */
export function drawBar(
    node: Node,
    x: number, y: number, w: number, h: number,
    ratio: number, fill: Color, bg: Color
): void {
    const g = node.getComponent(Graphics);
    if (!g) return;
    const r = Math.max(0, Math.min(1, ratio));
    g.clear();
    // 底槽
    g.fillColor = bg;
    g.roundRect(x, y, w, h, h / 2);
    g.fill();
    // 填充
    if (r > 0) {
        g.fillColor = fill;
        const fw = Math.max(h, w * r);
        g.roundRect(x, y, fw, h, h / 2);
        g.fill();
    }
}

/**
 * 让节点锚点居中（UI 层最常用的锚点）
 */
export function centerAnchor(node: Node): void {
    const t = node.getComponent(UITransform);
    if (!t) return;
    t.setAnchorPoint(0.5, 0.5);
}

/**
 * 设置节点位置（UI 层用左下角原点更直观，这里做一次转换）
 */
export function setUIPosition(node: Node, x: number, y: number): void {
    node.setPosition(x, y, 0);
}

/**文本对齐：水平居中*/
export const ALIGN_CENTER = 1;
/**文本对齐：水平左*/
export const ALIGN_LEFT = 0;
