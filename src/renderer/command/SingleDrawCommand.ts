module wd {
    export class SingleDrawCommand extends QuadCommand{
        public static create() {
        	var obj = new this();

        	return obj;
        }

        @requireGetter(function(){
            assert(!!this.mMatrix && !!this.vMatrix && !!this.pMatrix, Log.info.FUNC_NOT_EXIST("mMatrix or vMatrix or pMatrix"));
        })
        get mvpMatrix(){
            return this.mMatrix.applyMatrix(this.vMatrix, true).applyMatrix(this.pMatrix, false);
        }

        private _mMatrix:Matrix4 = null;
        get mMatrix(){
            return this._mMatrix;
        }
        set mMatrix(mMatrix:Matrix4){
            this._mMatrix = mMatrix;
        }

        public normalMatrix:Matrix3 = null;

        protected draw(material:Material){
            var vertexBuffer:ArrayBuffer = null,
                indexBuffer:ElementBuffer = this.buffers.getChild(EBufferDataType.INDICE);

            this.webglState.setState(material);

            if(indexBuffer){
                this.drawElements(indexBuffer);
            }
            else{
                vertexBuffer = this.buffers.getChild(EBufferDataType.VERTICE);

                this.drawArray(vertexBuffer);
            }
        }
    }
}

