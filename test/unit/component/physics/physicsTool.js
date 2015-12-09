var physicsTool = (function () {
    return {
        judgePos: function (obj, pos) {
            expect(testTool.getValues(
                obj.transform.position)
            ).toEqual(
                pos
            );
        },
        judgeRotation: function(obj, rot){
            expect(testTool.getValues(obj.transform.rotation.getEulerAngles())).toEqual(
                [
                    mathTestUtils.toFixed(rot[0]),
                    mathTestUtils.toFixed(rot[1]),
                    mathTestUtils.toFixed(rot[2])
                ]
            );
        },

        setStartTime: function (sandbox, time) {
            var director = wd.Director.getInstance();

            sandbox.stub(director._timeController, "getNow").returns(time);
        },
        setEngineType: function (type) {
            var director = wd.Director.getInstance();

            director.scene.physics.engine = type || wd.PhysicsEngineType.CANNON;
        },
        setPhysicsSetting: function (setting) {
            var director = wd.Director.getInstance();

            director.scene.physics.enable = true;
            director.scene.physics.gravity = setting.gravity || wd.Vector3.create(0, 0, 0);
            director.scene.physics.iterations = setting.iterations || 10;
        },
        createRigidBody: function(options){
            var _class = options.class || wd.DynamicRigidBody;

            var rigidBody = _class.create();
            rigidBody.mass = options.mass || 5;
            rigidBody.linearDamping = options.linearDamping || 0;
            rigidBody.angularDamping = options.angularDamping || 0;
            rigidBody.velocity = options.velocity || wd.Vector3.create(0, 0, 0);
            rigidBody.friction = options.friction || 0;
            rigidBody.restitution = options.restitution || 0;

            return rigidBody;
        },

        createSphere: function (colliderClass, rigidBody, radius) {
            var material = wd.BasicMaterial.create(),
                colliderClass = colliderClass || wd.SphereCollider;

            var radius = radius || 5;

            var geometry = wd.SphereGeometry.create();
            geometry.material = material;
            geometry.radius = radius;


            var collider = colliderClass.create();

            var gameObject = wd.GameObject.create();


            if (rigidBody) {
                gameObject.addComponent(rigidBody);
            }

            gameObject.addComponent(geometry);

            gameObject.addComponent(collider);

            gameObject.addComponent(wd.MeshRenderer.create());

            return gameObject;
        },
        createBox: function (colliderClass, rigidBody, size) {
            var material = wd.BasicMaterial.create(),
                colliderClass = colliderClass || wd.SphereCollider;

            var size = size || 5;

            var geometry = wd.BoxGeometry.create();
            geometry.material = material;
            geometry.width = size;
            geometry.height = size;
            geometry.depth = size;


            var collider = colliderClass.create();

            var gameObject = wd.GameObject.create();


            if (rigidBody) {
                gameObject.addComponent(rigidBody);
            }

            gameObject.addComponent(geometry);

            gameObject.addComponent(collider);

            gameObject.addComponent(wd.MeshRenderer.create());

            return gameObject;
        }
    }
})();
