/// <reference path="definitions.d.ts"/>
module Engine3D{
    export class WebGLContext{
        public static view:IView = null;
        public static gl:any = null;

        public static createGL(canvasId:string){
            this.view = ViewWebGL.create(dyCb.DomQuery.create(canvasId).get(0));
            this.gl = this.view.getContext();
        }
    }
}