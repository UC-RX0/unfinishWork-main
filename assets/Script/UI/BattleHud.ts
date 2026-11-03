import { _decorator, Color, Component, Graphics, Input, input, Label, Node, UITransform } from "cc";
import { BattlePhase, BattleStateComponent } from "../game/Component/BattleStateComponent";
import { HealthComponent } from "../game/Component/HealthComponent";
import { PlayerInputComponent } from "../game/Component/PlayerInputComponent";
import { ScoreComponent } from "../game/Component/ScoreComponent";
import { world } from "../game/World";
import { gameSession } from "../game/GameSession";
import { ALIGN_CENTER, createLabel, createUINode, drawBar, UI_COLOR } from "./UIKit";

const { ccclass } = _decorator;

/**
 * @description 战斗 HUD（渲染层组件）
 *
 * 它是【纯读取 + 纯绘制】的：
 *   - 从 ECS 读状态（血量 / 分数 / 波次 / 阶段）
 *   - 画到画布上
 *   不写任何逻辑状态，所以帧同步下 HUD 显示错误也不会造成分叉。
 *
 * 界面元素全部用 Graphics / Label 现场画，工程内零 UI 资源依赖。
 *
 * 层级安排：
 *   GuideLayer（提示层，挂在最上面）
 *     ├── HUD_ROOT
 *     │     ├── HP_BAR
 *     │     ├── SCORE_LABEL
 *     │     ├── WAVE_LABEL
 *     │     └── BANNER（波次提示 / 准备 / 结算）
 */
@ccclass('BattleHud')
export class BattleHud extends Component {
    /**血条节点*/
    private hpFill: Node = null;
    /**血量数字*/
    private hpLabel: Label = null;
    /**分数标签*/
    private scoreLabel: Label = null;
    /**波次标签*/
    private waveLabel: Label = null;
    /**中央横幅（准备 / 休整 / 胜利 / 失败）*/
    private banner: Node = null;
    private bannerLabel: Label = null;
    private bannerSub: Label = null;

    /**上一帧的阶段，用来检测阶段切换（触发横幅动画）*/
    private lastPhase: BattlePhase = BattlePhase.Prepare;
    /**是否已经显示过一次横幅（避免首次 update 就重复触发）*/
    private bannerShown: boolean = false;
    /**横幅剩余显示帧数*/
    private bannerTimer: number = 0;
    /**横幅总时长（逻辑帧）*/
    private bannerDuration: number = 0;

    /**血条尺寸*/
    private readonly hpBarWidth = 220;
    private readonly hpBarHeight = 18;

    onLoad() {
        this.buildUI();
        // 结算后点击任意处重开
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    /**点击重开：只在结算状态下生效*/
    private onTouchEnd(): void {
        const battle = this.getBattleState();
        if (!battle || !battle.settled) return;
        if (battle.phase !== BattlePhase.Victory && battle.phase !== BattlePhase.Defeat) return;

        // 联机模式不能单方面重开：必须由服务端统一广播，否则各端状态会错位
        if (world.networkMode) {
            console.log("[BattleHud] 联机模式请等待房主重开");
            return;
        }

        gameSession.restart(world, world.getPlayerCount());
    }

    private buildUI() {
        const root = createUINode("HUD_ROOT", 960, 640, this.node);
        const rootTransform = root.getComponent(UITransform);
        rootTransform.setAnchorPoint(0, 0);

        //#region 血条
        const hpRoot = createUINode("HP_BAR", this.hpBarWidth + 4, this.hpBarHeight + 4, root);
        hpRoot.setPosition(24, 640 - 24 - this.hpBarHeight, 0);
        const hpBg = createUINode("HP_BG", this.hpBarWidth + 4, this.hpBarHeight + 4, hpRoot);
        hpBg.addComponent(Graphics);
        hpBg.getComponent(Graphics).fillColor = UI_COLOR.barBg;
        hpBg.getComponent(Graphics).roundRect(0, 0, this.hpBarWidth + 4, this.hpBarHeight + 4, 3);
        hpBg.getComponent(Graphics).fill();

        this.hpFill = createUINode("HP_FILL", this.hpBarWidth, this.hpBarHeight, hpRoot);
        this.hpFill.setPosition(2, 2, 0);
        this.hpFill.addComponent(Graphics);

        this.hpLabel = createLabel("100", 13, UI_COLOR.text);
        this.hpLabel.horizontalAlign = ALIGN_CENTER as any;
        this.hpLabel.node.parent = hpRoot;
        this.hpLabel.node.setPosition(this.hpBarWidth / 2, this.hpBarHeight / 2, 0);
        //#endregion

        //#region 分数
        const scoreRoot = createUINode("SCORE", 220, 30, root);
        scoreRoot.setPosition(960 - 24 - 220, 640 - 24 - 18, 0);
        this.scoreLabel = createLabel("分数 0", 20, UI_COLOR.text);
        this.scoreLabel.horizontalAlign = ALIGN_CENTER as any;
        this.scoreLabel.node.parent = scoreRoot;
        this.scoreLabel.node.setPosition(110, 6, 0);
        //#endregion

        //#region 波次
        const waveRoot = createUINode("WAVE", 260, 30, root);
        waveRoot.setPosition(960 / 2 - 130, 640 - 24 - 22, 0);
        this.waveLabel = createLabel("准备", 18, UI_COLOR.accent);
        this.waveLabel.horizontalAlign = ALIGN_CENTER as any;
        this.waveLabel.node.parent = waveRoot;
        this.waveLabel.node.setPosition(130, 6, 0);
        //#endregion

        //#region 中央横幅
        this.banner = createUINode("BANNER", 520, 200, root);
        this.banner.setPosition(960 / 2, 320, 0);
        this.banner.addComponent(Graphics);

        this.bannerLabel = createLabel("", 46, UI_COLOR.text);
        this.bannerLabel.horizontalAlign = ALIGN_CENTER as any;
        this.bannerLabel.node.parent = this.banner;
        this.bannerLabel.node.setPosition(0, 26, 0);

        this.bannerSub = createLabel("", 20, UI_COLOR.textDim);
        this.bannerSub.horizontalAlign = ALIGN_CENTER as any;
        this.bannerSub.node.parent = this.banner;
        this.bannerSub.node.setPosition(0, -32, 0);
        //#endregion

        this.banner.active = false;
    }

    update(dt: number) {
        const battle = this.getBattleState();
        if (!battle) return;

        this.updateHp();
        this.updateScore();
        this.updateWave(battle);
        this.updateBanner(battle, dt);
    }

    //#region 数值显示
    /**血条 + 血量数字*/
    private updateHp(): void {
        const players = world.query(PlayerInputComponent, HealthComponent);
        if (players.length === 0) return;

        // 多玩家时显示"最低血量"的那一个 —— 玩家关心的是最危险的情况
        let minRatio = 1;
        let minHp = 0;
        let maxHp = 1;
        for (let i = 0; i < players.length; i++) {
            const hp = world.getComp(players[i], HealthComponent);
            if (!hp) continue;
            const ratio = hp.maxHealth > 0 ? hp.health / hp.maxHealth : 0;
            if (i === 0 || ratio < minRatio) {
                minRatio = ratio;
                minHp = hp.health;
                maxHp = hp.maxHealth;
            }
        }

        const color = minRatio > 0.35 ? UI_COLOR.barFull : UI_COLOR.barLow;
        drawBar(this.hpFill, 0, 0, this.hpBarWidth, this.hpBarHeight, minRatio, color, UI_COLOR.barBg);
        this.hpLabel.string = `${Math.max(0, Math.ceil(minHp))} / ${maxHp}`;
        this.hpLabel.color = minRatio > 0.35 ? UI_COLOR.text : UI_COLOR.barLow;
    }

    /**分数*/
    private updateScore(): void {
        const ids = world.query(ScoreComponent);
        if (ids.length === 0) {
            this.scoreLabel.string = "";
            return;
        }
        // 单机显示一个总分，联机显示各自分数
        if (ids.length === 1) {
            const s = world.getComp(ids[0], ScoreComponent);
            this.scoreLabel.string = `分数 ${s.score}`;
        } else {
            const parts: string[] = [];
            for (let i = 0; i < ids.length; i++) {
                const s = world.getComp(ids[i], ScoreComponent);
                parts.push(`P${i + 1} ${s.score}`);
            }
            this.scoreLabel.string = parts.join("   ");
        }
    }

    /**波次标签*/
    private updateWave(battle: BattleStateComponent): void {
        if (battle.phase === BattlePhase.Prepare) {
            this.waveLabel.string = "准备";
            this.waveLabel.color = UI_COLOR.textDim;
        } else if (battle.phase === BattlePhase.Fighting) {
            this.waveLabel.string = `第 ${battle.wave} / ${battle.totalWaves} 波`;
            this.waveLabel.color = UI_COLOR.accent;
        } else if (battle.phase === BattlePhase.Rest) {
            this.waveLabel.string = `第 ${battle.wave + 1} 波即将开始`;
            this.waveLabel.color = UI_COLOR.text;
        } else {
            this.waveLabel.string = "";
        }
    }
    //#endregion

    //#region 横幅
    private updateBanner(battle: BattleStateComponent, dt: number): void {
        // 阶段变化 → 触发横幅
        if (!this.bannerShown || battle.phase !== this.lastPhase) {
            this.bannerShown = true;
            this.lastPhase = battle.phase;
            this.onPhaseChanged(battle);
        }

        if (this.bannerTimer > 0) {
            this.bannerTimer -= dt * 60;
            if (this.bannerTimer <= 0) {
                // 结算类横幅常驻，不自动消失
                if (battle.phase !== BattlePhase.Victory && battle.phase !== BattlePhase.Defeat) {
                    this.banner.active = false;
                }
            }
            this.drawBanner(battle);
        }
    }

    private onPhaseChanged(battle: BattleStateComponent): void {
        switch (battle.phase) {
            case BattlePhase.Prepare:
                this.showBanner("准备", `${battle.phaseTimer > 0 ? Math.ceil(battle.phaseTimer / 60) : 0} 秒后开始`, UI_COLOR.text, 90);
                break;
            case BattlePhase.Rest:
                this.showBanner("休整", `下一波：第 ${battle.wave + 1} 波 · 已回复血量`, UI_COLOR.barFull, 120);
                break;
            case BattlePhase.Victory:
                this.showBanner("胜利", `全部 ${battle.totalWaves} 波 cleared · 点击重开`, UI_COLOR.accent, 999999);
                break;
            case BattlePhase.Defeat:
                this.showBanner("失败", `坚持到第 ${battle.wave} 波 · 点击重开`, UI_COLOR.danger, 999999);
                break;
            default:
                // 进入战斗：短暂提示波次
                if (battle.wave >= 1) {
                    this.showBanner(`第 ${battle.wave} 波`, "", UI_COLOR.accent, 90);
                }
                break;
        }
    }

    private showBanner(title: string, sub: string, color: Color, durationFrames: number): void {
        this.banner.active = true;
        this.bannerLabel.string = title;
        this.bannerLabel.color = color;
        this.bannerSub.string = sub;
        this.bannerTimer = durationFrames;
        this.bannerDuration = durationFrames;
    }

    /**画横幅：半透明面板 + 边框 + 文字*/
    private drawBanner(battle: BattleStateComponent): void {
        const g = this.banner.getComponent(Graphics);
        if (!g) return;

        g.clear();
        // 结算画面加深色遮罩，准备/休整用半透明
        const isResult = battle.phase === BattlePhase.Victory || battle.phase === BattlePhase.Defeat;
        g.fillColor = isResult ? new Color(8, 10, 16, 225) : new Color(12, 14, 20, 150);
        g.rect(-260, -100, 520, 200);
        g.fill();

        if (isResult) {
            g.strokeColor = battle.phase === BattlePhase.Victory ? UI_COLOR.accent : UI_COLOR.danger;
            g.lineWidth = 3;
            g.rect(-260, -100, 520, 200);
            g.stroke();
        }
    }
    //#endregion

    /**取对局状态*/
    private getBattleState(): BattleStateComponent | null {
        const ids = world.query(BattleStateComponent);
        if (ids.length === 0) return null;
        return world.getComp(ids[0], BattleStateComponent);
    }
}
