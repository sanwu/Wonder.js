module wd{
    export abstract class Renderer{
        private _webglState:WebGLState = null;
        get webglState(){
            return this._webglState ? this._webglState : BasicState.create();
        }
        set webglState(webglState:WebGLState){
            this._webglState = webglState;
        }

        public skyboxCommand:QuadCommand = null;

        public abstract addCommand(command:RenderCommand):void;
        public abstract hasCommand():boolean;
        public abstract render():void;
        public abstract clear():void;

        @virtual
        public init(){
        }
    }
}

