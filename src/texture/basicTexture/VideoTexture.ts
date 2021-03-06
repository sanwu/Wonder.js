module wd{
    export class VideoTexture extends CommonTexture{
        public static create(asset:VideoTextureAsset) {
            var obj = new this(asset);

            obj.initWhenCreate();

            return obj;
        }

        protected asset:VideoTextureAsset;

        private _video:Video = null;
        private _startLoopSubscription:wdFrp.IDisposable = null;

        public initWhenCreate(){
            super.initWhenCreate();

            this._video = this.asset.video;
        }

        public init(){
            var self = this;

            super.init();

            this._startLoopSubscription = EventManager.fromEvent(<any>EEngineEvent.STARTLOOP)
            .subscribe(() => {
                if(self._video.isStop){
                    self.needUpdate = false;
                }
                else{
                    self.needUpdate = true;
                }
            });

            return this;
        }

        public dispose(){
            this._startLoopSubscription && this._startLoopSubscription.dispose();
        }

        protected needClampMaxSize(){
            return false;
        }
    }
}

