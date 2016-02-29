module wd{
    export class LODController extends Component{
        public static create() {
            var obj = new this();

            return obj;
        }

        public entityObject:GameObject;

        public activeGeometry:Geometry = null;

        private _levelList:wdCb.Collection<LevelData> = wdCb.Collection.create<LevelData>();
        private _originGeometry:Geometry = null;

        public init(){
            var entityObject = this.entityObject;

            this.activeGeometry = entityObject.getComponent<Geometry>(Geometry);

            this._originGeometry = this.activeGeometry;

            this._levelList
                .filter(({geometry, distanceBetweenCameraAndObject}) => {
                    return !!geometry;
                })
                .forEach(({geometry, distanceBetweenCameraAndObject}) => {
                    geometry.entityObject = entityObject;

                    geometry.init();

                    geometry.createBuffersFromGeometryData();
                });

            super.init();
        }

        public addGeometryLevel(distanceBetweenCameraAndObject, levelGeometry:Geometry){
            this._levelList.addChild({
                distanceBetweenCameraAndObject: distanceBetweenCameraAndObject,
                geometry:levelGeometry
            });

            this._levelList.sort((levelData1:LevelData, levelData2) => {
                return levelData2.distanceBetweenCameraAndObject - levelData1.distanceBetweenCameraAndObject;
            }, true);
        }

        public update(elapsedTime:number):void {
            //todo optimize: only when camera move, then compute lod; reduce compute rate
            var currentDistanceBetweenCameraAndObject:number = Vector3.create().sub2(Director.getInstance().scene.currentCamera.transform.position, this.entityObject.transform.position).length(),
                useOriginGeometry:boolean = true,
                activeGeometry:any = null;

            this._levelList.forEach(({geometry, distanceBetweenCameraAndObject}) => {
                if(currentDistanceBetweenCameraAndObject >= distanceBetweenCameraAndObject){
                    activeGeometry = geometry;
                    useOriginGeometry = false;

                    return wdCb.$BREAK;
                }
            });

            if(activeGeometry === ELODGeometryState.INVISIBLE){
                this.activeGeometry = null;
                this.entityObject.isVisible = false;

                return;
            }

            this.entityObject.isVisible = true;

            if(activeGeometry && !JudgeUtils.isEqual(activeGeometry, this.activeGeometry)){
                this.activeGeometry = activeGeometry;

                EventManager.trigger(this.entityObject, CustomEvent.create(<any>EEngineEvent.COMPONENT_CHANGE));
            }
            else if(useOriginGeometry){
                this.activeGeometry = this._originGeometry;
            }
        }
    }

    type LevelData = {
        distanceBetweenCameraAndObject:number;
        geometry:Geometry;
    }
}