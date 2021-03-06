module wd {
    declare var Math:any,
        document:any;

    export class ArcballCameraController extends CameraController {
        public static create(cameraComponent:Camera) {
            var obj = new this(cameraComponent);

            return obj;
        }

        @cloneAttributeAsBasicType()
        public moveSpeedX:number = 1;
        @cloneAttributeAsBasicType()
        public moveSpeedY:number = 1;
        @cloneAttributeAsBasicType()
        public rotateSpeed:number = 1;
        @cloneAttributeAsBasicType()
        public wheelSpeed:number = 1;
        @cloneAttributeAsBasicType()
        public distance:number = 10;
        @cloneAttributeAsBasicType()
        public phi:number = Math.PI / 2;
        @cloneAttributeAsBasicType()
        public theta:number = Math.PI / 2;
        @cloneAttributeAsCloneable()
        public target:Vector3 = Vector3.create(0, 0, 0);
        @cloneAttributeAsBasicType()
        public thetaMargin = 0.05;
        @cloneAttributeAsBasicType()
        public minDistance:number = 0.05;

        private _isChange:boolean = true;
        private _mouseDragSubscription:wdFrp.IDisposable = null;
        private _mouseWheelSubscription:wdFrp.IDisposable = null;
        private _keydownSubscription:wdFrp.IDisposable = null;

        public init() {
            super.init();

            this._bindCanvasEvent();
        }

        public update(elapsed:number) {
            /*!
             X= r*cos(phi)*sin(theta);
             Z= r*sin(phi)*sin(theta);
             Y= r*cos(theta);
             */
            var x = null,
                y = null,
                z = null;

            super.update(elapsed);

            if(!this._isChange){
                return;
            }

            this._isChange = false;

            x = ((this.distance) * Math.cos(this.phi) * Math.sin(this.theta) + this.target.x);
            z = ((this.distance) * Math.sin(this.phi) * Math.sin(this.theta) + this.target.z);
            y = ((this.distance) * Math.cos(this.theta) + this.target.y);

            this.entityObject.transform.position = Vector3.create(x, y, z);
            this.entityObject.transform.lookAt(this.target);
        }

        public dispose() {
            super.dispose();

            this._removeEvent();
        }

        //todo treat picked item as the target
        private _bindCanvasEvent() {
            var self = this,
                scene = Director.getInstance().scene,
                mousewheel = EventManager.fromEvent(scene, <any>EEngineEvent.MOUSE_WHEEL),
                mousedrag = EventManager.fromEvent(scene, <any>EEngineEvent.MOUSE_DRAG),
            keydown = EventManager.fromEvent(EEventName.KEYDOWN);


            this._mouseDragSubscription = mousedrag.subscribe((e:CustomEvent) => {
                self._changeOrbit(e.userData);
            });

            this._mouseWheelSubscription = mousewheel.subscribe((e:CustomEvent) => {
                var mouseEvent:MouseEvent = e.userData;

                mouseEvent.preventDefault();

                self._changeDistance(mouseEvent);
            });

            this._keydownSubscription = keydown.subscribe(function (e) {
                self._changeTarget(e);
            });
        }

        private _changeOrbit(e:MouseEvent) {
            var movementDelta = e.movementDelta;

            this._isChange = true;

            this.phi += movementDelta.x / (100 / this.rotateSpeed);
            this.theta -= movementDelta.y / (100 / this.rotateSpeed);

            this._contrainTheta();
        }

        private _changeTarget(e:KeyboardEvent){
            var moveSpeedX = this.moveSpeedX,
                moveSpeedY = this.moveSpeedY,
                dx = null,
                dy = null,
                keyState = e.keyState,
                transform = this.entityObject.transform;

            this._isChange = true;

            if (keyState["a"] || keyState["left"]) {
                dx = -moveSpeedX;
            }
            else if(keyState["d"] || keyState["right"]) {
                dx = moveSpeedX;
            }
            else if(keyState["w"] || keyState["up"]) {
                dy = moveSpeedY;
            }
            else if(keyState["s"] || keyState["down"]) {
                dy = -moveSpeedY;
            }

            this.target.add(Vector3.create(transform.right.x * (dx), 0, transform.right.z * (dx)));
            this.target.add(Vector3.create(transform.up.x * dy, transform.up.y * dy, 0));
        }

        private _changeDistance(e:MouseEvent){
            this._isChange = true;

            this.distance -= this.wheelSpeed * e.wheel;
            this._contrainDistance();
        }

        private _contrainDistance() {
            this.distance = MathUtils.bigThan(this.distance, this.minDistance);
        }

        private _contrainTheta() {
            this.theta = MathUtils.clamp(this.theta, this.thetaMargin, Math.PI - this.thetaMargin);
        }

        private _removeEvent() {
            this._mouseDragSubscription.dispose();
            this._mouseWheelSubscription.dispose();
            this._keydownSubscription.dispose();
        }
    }
}
