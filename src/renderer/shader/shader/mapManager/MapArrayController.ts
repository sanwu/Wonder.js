module wd{
    export class MapArrayController extends MapController{
        public static create() {
            var obj = new this();

            return obj;
        }

        private _mapArrayList:wdCb.Collection<MapArrayData> = wdCb.Collection.create<MapArrayData>();

        public addMapArray(samplerName:string, mapArray:Array<Texture>){
            this._mapArrayList.addChild({
                samplerName:samplerName,
                mapArray:mapArray
            });
        }

        public sendMapData(program:Program, maxUnitOfBindedSingleMap:number){
            var self = this;

            this._mapArrayList.forEach((mapData:MapArrayData) => {
                let arrayMapCount = mapData.mapArray.length;

                program.sendUniformData(`${mapData.samplerName}[0]`, EVariableType.SAMPLER_ARRAY, self._generateMapArrayUnitArray(maxUnitOfBindedSingleMap, maxUnitOfBindedSingleMap + arrayMapCount));

                maxUnitOfBindedSingleMap += arrayMapCount;
            });
        }

        @ensure(function(mapArr:Array<Texture>){
            for(let map of mapArr){
                assert(map instanceof Texture, Log.info.FUNC_SHOULD("each element", "be Texture"));
            }
        })
        public getAllMapArr(){
            var arrayMap = [];

            this._mapArrayList.forEach((mapData:MapArrayData) => {
                arrayMap = arrayMap.concat(mapData.mapArray);
            });

            return arrayMap;
        }

        public removeChild(map:Texture){
            this._mapArrayList.removeChild(map);
        }

        public removeAllChildren(){
            this._mapArrayList.removeAllChildren();
        }

        @ensure(function(arr:Array<number>, startUnit:number, endUnit:number){
            assert(arr.length === endUnit - startUnit, Log.info.FUNC_SHOULD("length", `be ${endUnit - startUnit}, but actual is ${arr.length}`));

            if(arr.length > 0){
                assert(arr[0] === startUnit, Log.info.FUNC_SHOULD("first element", `be ${startUnit}, but actual is ${arr[0]}`));
                assert(arr[arr.length - 1] === endUnit - 1, Log.info.FUNC_SHOULD("last element", `be ${endUnit - 1}, but actual is ${arr[arr.length - 1]}`));
            }
        })
        private _generateMapArrayUnitArray(startUnit:number, endUnit:number){
            var arr = [];

            while(endUnit > startUnit){
                arr.push(startUnit);

                startUnit++;
            }

            return arr;
        }
    }

    export type MapArrayData = {
        samplerName:string;
        mapArray:Array<Texture>;
    }
}

