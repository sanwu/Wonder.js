module wd {
    export class RefractionTexture extends LightEffectTexture {
        public static create() {
        	var obj = new this();

            obj.initWhenCreate();

        	return obj;
        }

        public init(){
            super.init();

            Director.getInstance().scene.addCommonRenderTargetRenderer(RefractionRenderTargetRenderer.create(this));

            return this;
        }
    }
}

