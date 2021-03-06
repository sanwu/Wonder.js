describe("BufferContainer", function() {
    var sandbox = null;
    var container;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        container = new wd.BufferContainer();

        testTool.openContractCheck(sandbox);
    });
    afterEach(function () {
        testTool.clearInstance(sandbox);
        sandbox.restore();
    });

    describe("createBuffersFromGeometryData", function(){
        it("create all buffers from GeometryData", function(){
            var geometryData = new wd.GeometryData();
            container.geometryData = geometryData;
            sandbox.stub(geometryData, "init");
            sandbox.stub(container, "getChild");

            container.createBuffersFromGeometryData();

            expect(container.getChild.callCount).toEqual(6);
            expect(container.getChild.getCall(0)).toCalledWith(wd.EBufferDataType.VERTICE);
            expect(container.getChild.getCall(1)).toCalledWith(wd.EBufferDataType.NORMAL);
            expect(container.getChild.getCall(2)).toCalledWith(wd.EBufferDataType.TANGENT);
            expect(container.getChild.getCall(3)).toCalledWith(wd.EBufferDataType.COLOR);
            expect(container.getChild.getCall(4)).toCalledWith(wd.EBufferDataType.INDICE);
            expect(container.getChild.getCall(5)).toCalledWith(wd.EBufferDataType.TEXCOORD);
        });
    });

    describe("dispose", function(){
        beforeEach(function(){
            container.geometryData = new wd.GeometryData();
            sandbox.stub(container.geometryData, "dispose");
        });

        it("dispose all buffers", function(){
            var buffer = new wd.ArrayBuffer();
            sandbox.stub(buffer, "dispose");
            container.container.addChild(wd.EBufferDataType.COLOR, buffer);

            container.dispose();

            expect(buffer.dispose).toCalledOnce();
        });
        it("dispose geometryData", function () {
            container.dispose();

            expect(container.geometryData.dispose).toCalledOnce();
        });
        it("unbind material_change event", function () {
            container.entityObject = wd.GameObject.create();
            sandbox.stub(container.geometryData, "init");
            container.init();
            sandbox.stub(container, "removeCache");

            wd.EventManager.trigger(container.entityObject, wd.CustomEvent.create(wd.EEngineEvent.MATERIAL_CHANGE));

            expect(container.removeCache).toCalledOnce();




            container.dispose();





            wd.EventManager.trigger(container.entityObject, wd.CustomEvent.create(wd.EEngineEvent.MATERIAL_CHANGE));

            expect(container.removeCache).not.toCalledTwice();
        });
    });
});

