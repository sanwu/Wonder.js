module wd{
    export abstract class Texture extends Entity{
        get geometry(){
            return this.material.geometry;
        }

        //todo add to asset->toTexture copy attri
        @cloneAttributeAsBasicType()
        public name:string = "";
        @cloneAttributeAsBasicType()
        public material:Material = null;
        @cloneAttributeAsBasicType()
        public width:number = null;
        @cloneAttributeAsBasicType()
        public height:number = null;
        @cloneAttributeAsBasicType()
        public variableData:MapVariableData = null;
        @cloneAttributeAsBasicType()
        public wrapS:ETextureWrapMode = null;
        @cloneAttributeAsBasicType()
        public wrapT:ETextureWrapMode = null;
        @cloneAttributeAsBasicType()
        public magFilter:ETextureFilterMode = null;
        @cloneAttributeAsBasicType()
        public minFilter:ETextureFilterMode = null;
        public glTexture:WebGLTexture = null;
        @cloneAttributeAsBasicType()
        public needUpdate:boolean = null;

        protected target:ETextureTarget = ETextureTarget.TEXTURE_2D;


        public abstract init():void;
        public abstract getSamplerName(unit:number):string;
        public abstract update():void;

        public clone(){
            return CloneUtils.clone(this);
        }

        @require(function(unit:number, texture:Texture){
            var maxTextureUnit = GPUDetector.getInstance().maxTextureUnit;

            assert(unit >= 0, Log.info.FUNC_SHOULD("texture unit", `>= 0, but actual is ${unit}`));
            assert(unit < maxTextureUnit, `trying to cache ${unit} texture units, but GPU only supports ${maxTextureUnit} units`);
        })
        public bindToUnit (unit:number) {
            var gl = DeviceManager.getInstance().gl;

            if(TextureCache.isCached(unit, this)){
                return;
            }

            TextureCache.addActiveTexture(unit, this);

            gl.activeTexture(gl["TEXTURE" + String(unit)]);
            gl.bindTexture(gl[this.target], this.glTexture);

            return this;
        }

        public sendData(program:Program, name:string, unit:number){
            program.sendUniformData(name, this.getSamplerType(), unit);
        }

        public dispose(){
            var gl = DeviceManager.getInstance().gl;

            gl.deleteTexture(this.glTexture);
            delete this.glTexture;

            this._unBindAllUnit();
        }

        public filterFallback(filter:ETextureFilterMode) {
            if (filter === ETextureFilterMode.NEAREST|| filter === ETextureFilterMode.NEAREST_MIPMAP_MEAREST|| filter === ETextureFilterMode.NEAREST_MIPMAP_LINEAR ) {
                return ETextureFilterMode.NEAREST;
            }

            return ETextureFilterMode.LINEAR;
        }

        protected getSamplerNameByVariableData(unit:number, type?:EVariableType){
            var samplerName:string = null;

            if(this.variableData){
                if(this.variableData.samplerVariableName){
                    samplerName = this.variableData.samplerVariableName;
                }
            }
            else{
                samplerName = type === EVariableType.SAMPLER_2D ? `u_sampler2D${unit}` : `u_samplerCube${unit}`;
            }

            return samplerName;
        }

        protected getSamplerType():EVariableType{
            var type = null;

            switch(this.target){
                case ETextureTarget.TEXTURE_2D:
                    type = EVariableType.SAMPLER_2D;
                    break;
                case ETextureTarget.TEXTURE_CUBE_MAP:
                    type = EVariableType.SAMPLER_CUBE;
                    break;
                default:
                    break;
            }

            return type;
        }

        @virtual
        protected isSourcePowerOfTwo(){
            return TextureUtils.isPowerOfTwo(this.width, this.height)
        }

        protected setTextureParameters(textureType, isSourcePowerOfTwo){
            var gl = DeviceManager.getInstance().gl;

            if (isSourcePowerOfTwo){
                gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl[this.wrapS]);
                gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl[this.wrapT]);

                gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl[this.magFilter]);
                gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl[this.minFilter]);
            }
            else {
                gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl[this.filterFallback(this.magFilter)]);
                gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl[this.filterFallback(this.minFilter)]);
            }
        }

        private _unBindAllUnit(){
            var gl = wd.DeviceManager.getInstance().gl,
                maxTextureUnit = GPUDetector.getInstance().maxTextureUnit;

            for (var channel = 0; channel < maxTextureUnit; channel++) {
                gl.activeTexture(gl["TEXTURE" + channel]);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }

            TextureCache.clearAllBindTextureUnitCache();
        }
    }
}

