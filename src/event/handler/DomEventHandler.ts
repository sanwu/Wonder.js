/// <reference path="../../filePath.d.ts"/>
module wd {
    export abstract class DomEventHandler extends EventHandler{
        public off(eventName:EventName):void;
        public off(eventName:EventName, handler:Function):void;
        public off(uid:number, eventName:EventName):void;
        public off(target:GameObject, eventName:EventName):void;
        public off(target:GameObject, eventName:EventName, handler:Function):void;

        public off(...args) {
            var self = this,
                dom = this.getDom(),
                eventRegister = EventRegister.getInstance(),
                eventOffDataList:wdCb.Collection<EventOffData> = null;

            eventOffDataList = eventRegister.remove.apply(eventRegister, args);

            if(eventOffDataList){
                eventOffDataList.forEach((list:wdCb.Collection<EventOffData>) => {
                    list.forEach((eventOffData:EventOffData) => {
                        self._unBind(dom, eventOffData.eventName, eventOffData.domHandler);
                    });
                })
            }

            this.clearHandler();
        }

        protected abstract getDom();
        protected abstract triggerDomEvent(event:Event, eventName:EventName, target:GameObject);
        protected abstract addEngineHandler(target:GameObject, eventName:EventName, handler:Function);

        @virtual
        protected clearHandler(){
        }

        protected buildDomHandler(target:GameObject, eventName:EventName){
            var self = this,
                context = root;

            return wdCb.EventUtils.bindEvent(context, function (event) {
                self.triggerDomEvent(event, eventName, target);
            });
        }

        protected handler(target:GameObject, eventName:EventName, handler:Function, priority:number){
            var domHandler = null,
                originHandler = handler;

            handler = this.addEngineHandler(target, eventName, handler);

            if (!EventRegister.getInstance().isBinded(target, eventName)) {
                domHandler = this._bind(this.getDom(), eventName, target);
            }
            else{
                domHandler = EventRegister.getInstance().getDomHandler(target, eventName);
            }

            EventRegister.getInstance().register(
                target,
                eventName,
                handler,
                originHandler,
                domHandler,
                priority
            );
        }

        private _bind(dom:any, eventName:EventName, target:GameObject){
            var domHandler = null;

            domHandler = this.buildDomHandler(target, eventName);

            wdCb.EventUtils.addEvent(
                dom,
                eventName,
                domHandler
            );

            return domHandler;
        }

        private _unBind(dom, eventName, handler){
            wdCb.EventUtils.removeEvent(dom, eventName, handler);
        }
    }
}

