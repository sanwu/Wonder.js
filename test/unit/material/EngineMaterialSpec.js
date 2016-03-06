describe("EngineMaterial", function() {
    var sandbox = null;
    var material = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(wd.DeviceManager.getInstance(), "gl", testTool.buildFakeGl(sandbox));

        material = new wd.EngineMaterial();
    });
    afterEach(function () {
        testTool.clearInstance();
        sandbox.restore();
    });

    it("test default value", function(){
        expect(material.refractionRatio).toEqual(0);
        expect(material.reflectivity).toBeNull();
        expect(material.mapCombineMode).toEqual(wd.ETextureCombineMode.MIX);
        expect(material.mapMixRatio).toEqual(0.5);
    });

    describe("init", function(){
        beforeEach(function(){

        });

        describe("add top shader libs", function(){
            it("add CommonShaderLib", function () {
                material.init();

                expect(material.shader.libs.getChild(0)).toEqual(jasmine.any(wd.CommonShaderLib));
            });

            it("if has animation component, add MorphCommonShaderLib and MorphVerticeShaderLib", function () {
                var geo = wd.ModelGeometry.create();
                sandbox.stub(geo, "hasAnimation").returns(true);
                material.geometry = geo;

                material.init();

                expect(material.shader.hasLib(wd.MorphCommonShaderLib)).toBeTruthy();
                expect(material.shader.hasLib(wd.MorphVerticeShaderLib)).toBeTruthy();
            });
            it("else, add CommonVerticeShaderLib", function () {
                material.init();

                expect(material.shader.hasLib(wd.CommonVerticeShaderLib)).toBeTruthy();
            });

        });
    });
});