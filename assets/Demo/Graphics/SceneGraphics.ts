// Copyright 2021 Cao Gaoting<caogtaa@gmail.com>
// https://caogtaa.github.io
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * Date: 2021-08-11 00:29:14
 * LastEditors: GT<caogtaa@gmail.com>
 * LastEditTime: 2021-08-11 00:29:36
*/ 
const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneGraphics extends cc.Component {
    @property(cc.Node)
    dragArea: cc.Node = null;

    @property(cc.Node)
    displayArea: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    protected _viewCenter: cc.Vec2 = cc.v2(0, 0);   // 视图中心相对与纹理的位置，单位: 设计分辨率像素
    protected _viewScale: number = 1.0;             // 视图缩放

    onLoad () {
        let dragArea = this.dragArea;
        dragArea.on(cc.Node.EventType.TOUCH_START, this.OnDisplayTouchStart, this);
        dragArea.on(cc.Node.EventType.TOUCH_MOVE, this.OnDisplayTouchMove, this);
        dragArea.on(cc.Node.EventType.TOUCH_END, this.OnDisplayTouchEnd, this);
        dragArea.on(cc.Node.EventType.TOUCH_CANCEL, this.OnDisplayTouchEnd, this);

        dragArea.on(cc.Node.EventType.MOUSE_WHEEL, this.OnDisplayMouseWheel, this);
    }

    start () {
        // this.targetLabel.string = "12345";
        if (this.displayArea) {
            this._viewCenter.set(this.displayArea.position);
            this._viewScale = 1.0;
            this.UpdateDisplayMatProperties();
        }

        let ctx = this.node.getChildByName("graphics").getComponent(cc.Graphics);
        ctx.strokeColor = cc.Color.WHITE;
        ctx.fillColor = cc.Color.WHITE;
        ctx.lineWidth = 40;
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(80, 400, 400, 500, 300, 300);
        ctx.stroke();
    }

    update() {
    }

    protected OnDisplayTouchStart(e: cc.Event.EventTouch) {
    }

    protected OnDisplayTouchMove(e: cc.Event.EventTouch) {
        let touches = e.getTouches();
        if (touches.length === 1) {
            // simple drag
            let touch = touches[0] as cc.Touch;
            let offset = touch.getDelta();
            // offset.mulSelf(this._viewScale);

            this._viewCenter.addSelf(offset);
            this.UpdateDisplayMatProperties();
        } else if (touches.length >= 2) {
            // simple zoom
            let t0 = touches[0] as cc.Touch;
            let t1 = touches[1] as cc.Touch;

            let p0 = t0.getLocation();
            let p1 = t1.getLocation();
            let newLength = p0.sub(p1).len();
            let oldLength = p0.sub(t0.getDelta()).sub(p1).add(t1.getDelta()).len();
            let scale = newLength / oldLength;
            this.DisplayScaleBy(scale);
        }
    }

    protected OnDisplayTouchEnd(e: cc.Event.EventTouch) {
        // do nothing
    }

    // 用鼠标滚轮进行缩放
    // 简单起见目前只支持视图中心固定的缩放
    protected OnDisplayMouseWheel(e: cc.Event.EventMouse) {
        let scrollY = e.getScrollY();
        if (!scrollY)
            return;

        if (scrollY > 0) {
            this.DisplayScaleBy(1.1);
        } else {
            this.DisplayScaleBy(0.9);
        }
    }

    protected DisplayScaleBy(scale: number) {
        let preScale = this._viewScale;
        if (scale > 1) {
            this._viewScale = Math.min(this._viewScale * scale, 1e3);
        } else {
            this._viewScale = Math.max(this._viewScale * scale, 1e-3);
        }

        // get actual scale
        scale = this._viewScale / preScale;
        // keep center as center
        this._viewCenter.mulSelf(scale);

        this.UpdateDisplayMatProperties();
    }

    protected UpdateDisplayMatProperties() {
        let displayArea = this.displayArea;
        displayArea.position = this._viewCenter;
        displayArea.scale = this._viewScale;
        
        let mat = displayArea.getComponent(cc.RenderComponent).getMaterial(0);
        if (mat.getProperty("sz", 0) !== undefined) {
            mat.setProperty("sz", [displayArea.width * this._viewScale, displayArea.height * this._viewScale]);
        }
    }
}
