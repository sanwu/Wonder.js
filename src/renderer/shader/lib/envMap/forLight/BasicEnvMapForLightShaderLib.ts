/// <reference path="../../../../../filePath.d.ts"/>
module dy{
    export class BasicEnvMapForLightShaderLib extends EnvMapForLightShaderLib{
        public static create() {
            var obj = new this();

            return obj;
        }

        public type:string = "basic_forLight_envMap";
    }
}

