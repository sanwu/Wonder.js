module wd{
    export class ModelMatrixHardwareInstanceShaderLib extends ModelMatrixInstanceShaderLib{
        public static create() {
            var obj = new this();

            return obj;
        }

        public type:string = "modelMatrix_hardware_instance";

        public sendShaderVariables(program:Program, cmd:InstanceCommand, material:EngineMaterial){
        }

        public setShaderDefinition(cmd:InstanceCommand, material:EngineMaterial){
            super.setShaderDefinition(cmd, material);

            this.addAttributeVariable(["a_mVec4_0", "a_mVec4_1","a_mVec4_2","a_mVec4_3"
            ]);
        }
    }
}

