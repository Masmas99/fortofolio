import * as THREE from 'three'
import gsap from 'gsap'

export default class PlaygroundSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.sounds = _options.sounds
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('playgroundSection')
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.resources.items.areaResetTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaResetTexture.minFilter = THREE.LinearFilter

        this.setStatic()
        this.setBricksWalls()
        this.setSoccer()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.playgroundStaticBase.scene,
            collision: this.resources.items.playgroundStaticCollision.scene,
            floorShadowTexture: this.resources.items.playgroundStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setBricksWalls()
    {
        // Set up
        this.brickWalls = {}
        this.brickWalls.x = this.x + 15
        this.brickWalls.y = this.y + 14
        this.brickWalls.items = []

        // Brick options
        this.brickWalls.brickOptions = {
            base: this.resources.items.brickBase.scene,
            collision: this.resources.items.brickCollision.scene,
            offset: new THREE.Vector3(0, 0, 0.1),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.5,
            soundName: 'brick'
        }

        this.brickWalls.items.push(
            this.walls.add({
                object: this.brickWalls.brickOptions,
                shape:
                {
                    type: 'rectangle',
                    widthCount: 5,
                    heightCount: 6,
                    position: new THREE.Vector3(this.brickWalls.x - 6, this.brickWalls.y, 0),
                    offsetWidth: new THREE.Vector3(0, 1.05, 0),
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),
                    randomOffset: new THREE.Vector3(0, 0, 0),
                    randomRotation: new THREE.Vector3(0, 0, 0.4)
                }
            }),
            this.walls.add({
                object: this.brickWalls.brickOptions,
                shape:
                {
                    type: 'brick',
                    widthCount: 5,
                    heightCount: 6,
                    position: new THREE.Vector3(this.brickWalls.x - 12, this.brickWalls.y, 0),
                    offsetWidth: new THREE.Vector3(0, 1.05, 0),
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),
                    randomOffset: new THREE.Vector3(0, 0, 0),
                    randomRotation: new THREE.Vector3(0, 0, 0.4)
                }
            }),
            this.walls.add({
                object: this.brickWalls.brickOptions,
                shape:
                {
                    type: 'triangle',
                    widthCount: 6,
                    position: new THREE.Vector3(this.brickWalls.x - 18, this.brickWalls.y, 0),
                    offsetWidth: new THREE.Vector3(0, 1.05, 0),
                    offsetHeight: new THREE.Vector3(0, 0, 0.45),
                    randomOffset: new THREE.Vector3(0, 0, 0),
                    randomRotation: new THREE.Vector3(0, 0, 0.4)
                }
            })
        )

        // Reset
        this.brickWalls.reset = () =>
        {
            for(const _wall of this.brickWalls.items)
            {
                for(const _brick of _wall.items)
                {
                    _brick.collision.reset()
                }
            }
        }

        // Reset area
        this.brickWalls.resetArea = this.areas.add({
            position: new THREE.Vector2(this.brickWalls.x, this.brickWalls.y),
            halfExtents: new THREE.Vector2(2, 2)
        })
        this.brickWalls.resetArea.on('interact', () =>
        {
            this.brickWalls.reset()
        })

        // Reset label
        this.brickWalls.areaLabelMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.areaResetTexture }))
        this.brickWalls.areaLabelMesh.position.x = this.brickWalls.x
        this.brickWalls.areaLabelMesh.position.y = this.brickWalls.y
        this.brickWalls.areaLabelMesh.matrixAutoUpdate = false
        this.brickWalls.areaLabelMesh.updateMatrix()
        this.container.add(this.brickWalls.areaLabelMesh)

        // Debug
        if(this.debugFolder)
        {
            this.debugFolder.add(this.brickWalls, 'reset').name('brickWalls reset')
        }
    }

    setSoccer()
    {
        this.soccer = {}
        this.soccer.x = this.x + 15 // -23
        this.soccer.y = this.y + 4  // -30

        // Dimensions
        this.soccer.goal = {
            x: this.soccer.x - 22, // -45
            y: this.soccer.y,      // -30
            width: 4.4,
            height: 2.2,
            depth: 1.6
        }

        this.soccer.ballRadius = 0.65
        this.soccer.ballOffset = new THREE.Vector3(this.soccer.x - 9, this.soccer.y, 0) // -32, -30

        this.setSoccerPitch()
        this.setSoccerGoal()
        this.setSoccerBall()
        this.setSoccerCelebration()
        this.setSoccerReset()
        this.setSoccerGoalDetection()
    }

    setSoccerPitch()
    {
        // Procedural canvas for pitch field markings
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 512
        const ctx = canvas.getContext('2d')

        // Mowed grass stripes background
        const stripeCount = 12
        const stripeWidth = canvas.width / stripeCount
        for(let i = 0; i < stripeCount; i++)
        {
            ctx.fillStyle = i % 2 === 0 ? '#43a047' : '#388e3c'
            ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height)
        }

        // White markings
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8
        ctx.lineCap = 'round'

        // Outer pitch border
        const padding = 24
        ctx.strokeRect(padding, padding, canvas.width - padding * 2, canvas.height - padding * 2)

        // Goal line (left edge of pitch where goal sits)
        const goalLineX = padding + 30
        ctx.beginPath()
        ctx.moveTo(goalLineX, padding)
        ctx.lineTo(goalLineX, canvas.height - padding)
        ctx.stroke()

        // Penalty box
        const boxWidth = 260
        const boxHeight = 280
        const boxY = (canvas.height - boxHeight) * 0.5
        ctx.strokeRect(goalLineX, boxY, boxWidth, boxHeight)

        // Goal area (smaller inner box)
        const smallBoxWidth = 120
        const smallBoxHeight = 160
        const smallBoxY = (canvas.height - smallBoxHeight) * 0.5
        ctx.strokeRect(goalLineX, smallBoxY, smallBoxWidth, smallBoxHeight)

        // Penalty spot dot
        const penaltySpotX = goalLineX + 380
        const penaltySpotY = canvas.height * 0.5
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(penaltySpotX, penaltySpotY, 10, 0, Math.PI * 2)
        ctx.fill()

        // Penalty arc
        ctx.beginPath()
        ctx.arc(penaltySpotX, penaltySpotY, 70, - Math.PI * 0.35, Math.PI * 0.35)
        ctx.stroke()

        // Center line & center circle (right side of this half-pitch)
        const centerX = canvas.width - padding
        ctx.beginPath()
        ctx.arc(centerX, canvas.height * 0.5, 90, Math.PI * 0.5, Math.PI * 1.5)
        ctx.stroke()

        // Texture
        const pitchTexture = new THREE.CanvasTexture(canvas)
        pitchTexture.magFilter = THREE.LinearFilter
        pitchTexture.minFilter = THREE.LinearMipmapLinearFilter

        const pitchMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(23, 6.8),
            new THREE.MeshBasicMaterial({
                map: pitchTexture,
                depthWrite: false
            })
        )
        pitchMesh.position.set(this.soccer.x - 11.5, this.soccer.y, 0.003)
        pitchMesh.matrixAutoUpdate = false
        pitchMesh.updateMatrix()
        this.container.add(pitchMesh)

        // Corner flags
        const corners = [
            { x: this.soccer.x - 22.8, y: this.soccer.y - 3.3 },
            { x: this.soccer.x - 22.8, y: this.soccer.y + 3.3 },
            { x: this.soccer.x - 0.2,  y: this.soccer.y - 3.3 },
            { x: this.soccer.x - 0.2,  y: this.soccer.y + 3.3 }
        ]

        for(const corner of corners)
        {
            // Pole
            const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8)
            poleGeo.rotateX(Math.PI * 0.5)
            const pole = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }))
            pole.position.set(corner.x, corner.y, 0.6)
            pole.matrixAutoUpdate = false
            pole.updateMatrix()
            this.container.add(pole)

            // Flag (Red top, White bottom - Indonesian style!)
            const flagTop = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.15),
                new THREE.MeshBasicMaterial({ color: 0xee1111, side: THREE.DoubleSide })
            )
            flagTop.position.set(corner.x + 0.15, corner.y, 1.1)
            flagTop.rotation.x = Math.PI * 0.5
            flagTop.matrixAutoUpdate = false
            flagTop.updateMatrix()
            this.container.add(flagTop)

            const flagBottom = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.15),
                new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
            )
            flagBottom.position.set(corner.x + 0.15, corner.y, 0.95)
            flagBottom.rotation.x = Math.PI * 0.5
            flagBottom.matrixAutoUpdate = false
            flagBottom.updateMatrix()
            this.container.add(flagBottom)
        }
    }

    setSoccerGoal()
    {
        const { width, height, depth } = this.soccer.goal
        const goalBase = new THREE.Object3D()
        const goalCollision = new THREE.Object3D()

        // 1. Vertical Posts (Left & Right)
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, height, 16)
        postGeo.rotateX(Math.PI * 0.5)

        const leftPost = new THREE.Mesh(postGeo)
        leftPost.name = 'shadeWhite'
        leftPost.position.set(0, - width * 0.5, height * 0.5)
        goalBase.add(leftPost)

        const rightPost = new THREE.Mesh(postGeo)
        rightPost.name = 'shadeWhite'
        rightPost.position.set(0, width * 0.5, height * 0.5)
        goalBase.add(rightPost)

        // 2. Horizontal Crossbar
        const crossbarGeo = new THREE.CylinderGeometry(0.08, 0.08, width, 16)
        const crossbar = new THREE.Mesh(crossbarGeo)
        crossbar.name = 'shadeWhite'
        crossbar.position.set(0, 0, height)
        goalBase.add(crossbar)

        // 3. Back Bottom Ground Bar
        const backBottomGeo = new THREE.CylinderGeometry(0.06, 0.06, width, 16)
        const backBottomBar = new THREE.Mesh(backBottomGeo)
        backBottomBar.name = 'shadeWhite'
        backBottomBar.position.set(- depth, 0, 0.06)
        goalBase.add(backBottomBar)

        // 4. Bottom Side Ground Bars (Left & Right)
        const sideBottomGeo = new THREE.CylinderGeometry(0.06, 0.06, depth, 16)
        sideBottomGeo.rotateZ(Math.PI * 0.5)

        const leftBottomBar = new THREE.Mesh(sideBottomGeo)
        leftBottomBar.name = 'shadeWhite'
        leftBottomBar.position.set(- depth * 0.5, - width * 0.5, 0.06)
        goalBase.add(leftBottomBar)

        const rightBottomBar = new THREE.Mesh(sideBottomGeo)
        rightBottomBar.name = 'shadeWhite'
        rightBottomBar.position.set(- depth * 0.5, width * 0.5, 0.06)
        goalBase.add(rightBottomBar)

        // 5. Top Back Bar
        const topBackBar = new THREE.Mesh(backBottomGeo)
        topBackBar.name = 'shadeWhite'
        topBackBar.position.set(- depth * 0.7, 0, height * 0.9)
        goalBase.add(topBackBar)

        // 6. Top Side Bars
        const topSideLength = Math.hypot(depth * 0.7, height * 0.1)
        const topSideGeo = new THREE.CylinderGeometry(0.06, 0.06, topSideLength, 16)
        topSideGeo.rotateZ(Math.PI * 0.5)

        const leftTopSide = new THREE.Mesh(topSideGeo)
        leftTopSide.name = 'shadeWhite'
        leftTopSide.position.set(- depth * 0.35, - width * 0.5, height * 0.95)
        goalBase.add(leftTopSide)

        const rightTopSide = new THREE.Mesh(topSideGeo)
        rightTopSide.name = 'shadeWhite'
        rightTopSide.position.set(- depth * 0.35, width * 0.5, height * 0.95)
        goalBase.add(rightTopSide)

        // 7. Diagonal Rear Support Struts
        const diagLength = Math.hypot(depth * 0.3, height * 0.84)
        const diagGeo = new THREE.CylinderGeometry(0.05, 0.05, diagLength, 16)
        const diagAngle = Math.atan2(depth * 0.3, height * 0.84)
        diagGeo.rotateX(Math.PI * 0.5)
        diagGeo.rotateY(diagAngle)

        const leftDiag = new THREE.Mesh(diagGeo)
        leftDiag.name = 'shadeWhite'
        leftDiag.position.set(- depth * 0.85, - width * 0.5, height * 0.45)
        goalBase.add(leftDiag)

        const rightDiag = new THREE.Mesh(diagGeo)
        rightDiag.name = 'shadeWhite'
        rightDiag.position.set(- depth * 0.85, width * 0.5, height * 0.45)
        goalBase.add(rightDiag)

        // 8. Goal Net Wireframe/Grid
        const netMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.55
        })

        // Roof net
        const roofNet = new THREE.Mesh(new THREE.PlaneGeometry(depth * 0.7, width, 6, 12), netMaterial)
        roofNet.position.set(- depth * 0.35, 0, height * 0.95)
        roofNet.rotation.y = Math.atan2(height * 0.1, depth * 0.7)
        this.container.add(roofNet)
        roofNet.position.add(new THREE.Vector3(this.soccer.goal.x, this.soccer.goal.y, 0))

        // Back net
        const backNet = new THREE.Mesh(new THREE.PlaneGeometry(width, diagLength, 12, 8), netMaterial)
        backNet.position.set(this.soccer.goal.x - depth * 0.85, this.soccer.goal.y, height * 0.45)
        backNet.rotation.z = Math.PI * 0.5
        backNet.rotation.y = - (Math.PI * 0.5 - diagAngle)
        this.container.add(backNet)

        // Left side net
        const sideNetGeo = new THREE.PlaneGeometry(depth, height, 8, 8)
        const leftSideNet = new THREE.Mesh(sideNetGeo, netMaterial)
        leftSideNet.position.set(this.soccer.goal.x - depth * 0.5, this.soccer.goal.y - width * 0.5, height * 0.5)
        leftSideNet.rotation.y = Math.PI * 0.5
        this.container.add(leftSideNet)

        // Right side net
        const rightSideNet = new THREE.Mesh(sideNetGeo, netMaterial)
        rightSideNet.position.set(this.soccer.goal.x - depth * 0.5, this.soccer.goal.y + width * 0.5, height * 0.5)
        rightSideNet.rotation.y = Math.PI * 0.5
        this.container.add(rightSideNet)

        // Collision shapes (Cannon.Box parsed via mesh.name = 'box' and mesh.scale)
        // Left post collider
        const colLeftPost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colLeftPost.name = 'box'
        colLeftPost.scale.set(0.2, 0.2, height)
        colLeftPost.position.set(0, - width * 0.5, height * 0.5)
        goalCollision.add(colLeftPost)

        // Right post collider
        const colRightPost = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colRightPost.name = 'box'
        colRightPost.scale.set(0.2, 0.2, height)
        colRightPost.position.set(0, width * 0.5, height * 0.5)
        goalCollision.add(colRightPost)

        // Crossbar collider
        const colCrossbar = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colCrossbar.name = 'box'
        colCrossbar.scale.set(0.2, width, 0.2)
        colCrossbar.position.set(0, 0, height)
        goalCollision.add(colCrossbar)

        // Back net stopper (1.6 units thick, extending backwards away from goal)
        const colBackStopper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colBackStopper.name = 'box'
        colBackStopper.scale.set(1.6, width + 0.4, height * 1.5)
        colBackStopper.position.set(- depth - 0.8, 0, height * 0.5)
        goalCollision.add(colBackStopper)

        // Left net stopper (1.2 units thick, extending outwards)
        const colLeftNet = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colLeftNet.name = 'box'
        colLeftNet.scale.set(depth + 1.6, 1.2, height * 1.5)
        colLeftNet.position.set(- depth * 0.5 - 0.8, - width * 0.5 - 0.6, height * 0.5)
        goalCollision.add(colLeftNet)

        // Right net stopper (1.2 units thick, extending outwards)
        const colRightNet = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colRightNet.name = 'box'
        colRightNet.scale.set(depth + 1.6, 1.2, height * 1.5)
        colRightNet.position.set(- depth * 0.5 - 0.8, width * 0.5 + 0.6, height * 0.5)
        goalCollision.add(colRightNet)

        // Top net stopper (1.2 units thick, extending upwards)
        const colRoofNet = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
        colRoofNet.name = 'box'
        colRoofNet.scale.set(depth + 1.6, width + 0.4, 1.2)
        colRoofNet.position.set(- depth * 0.5 - 0.8, 0, height + 0.6)
        goalCollision.add(colRoofNet)

        // Center
        const goalCenter = new THREE.Object3D()
        goalCenter.name = 'center'
        goalCenter.position.set(0, 0, 0)
        goalCollision.add(goalCenter)

        // Add static goal object
        this.soccer.goalObject = this.objects.add({
            base: goalBase,
            collision: goalCollision,
            offset: new THREE.Vector3(this.soccer.goal.x, this.soccer.goal.y, 0),
            mass: 0
        })
    }

    setSoccerBall()
    {
        const radius = this.soccer.ballRadius
        const ballBase = new THREE.Object3D()
        const ballCollision = new THREE.Object3D()

        // 1. Base White Sphere
        const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32))
        sphereMesh.name = 'shadeWhite'
        sphereMesh.position.set(0, 0, radius)
        ballBase.add(sphereMesh)

        // 2. 12 Black Pentagons (Truncated Icosahedron FIFA Soccer Ball Pattern)
        const phi = (1 + Math.sqrt(5)) * 0.5
        const vertices = [
            new THREE.Vector3(-1,  phi, 0),
            new THREE.Vector3( 1,  phi, 0),
            new THREE.Vector3(-1, -phi, 0),
            new THREE.Vector3( 1, -phi, 0),
            new THREE.Vector3(0, -1,  phi),
            new THREE.Vector3(0,  1,  phi),
            new THREE.Vector3(0, -1, -phi),
            new THREE.Vector3(0,  1, -phi),
            new THREE.Vector3( phi, 0, -1),
            new THREE.Vector3( phi, 0,  1),
            new THREE.Vector3(-phi, 0, -1),
            new THREE.Vector3(-phi, 0,  1)
        ].map(v => v.normalize())

        const positions = []
        for(let i = 0; i < vertices.length; i++)
        {
            const v = vertices[i]
            const neighbors = vertices
                .filter((_, idx) => idx !== i)
                .map(other => ({ other, dist: v.distanceTo(other) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 5)
                .map(item => item.other)

            const tangent = new THREE.Vector3().crossVectors(v, Math.abs(v.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0)).normalize()
            const bitangent = new THREE.Vector3().crossVectors(v, tangent).normalize()

            neighbors.sort((a, b) =>
            {
                const da = a.clone().sub(v)
                const db = b.clone().sub(v)
                return Math.atan2(da.dot(bitangent), da.dot(tangent)) - Math.atan2(db.dot(bitangent), db.dot(tangent))
            })

            const pentCorners = neighbors.map(n => new THREE.Vector3().lerpVectors(v, n, 0.38).normalize().multiplyScalar(radius * 1.003))
            const centerPt = v.clone().multiplyScalar(radius * 1.003)

            for(let j = 0; j < 5; j++)
            {
                const p1 = pentCorners[j]
                const p2 = pentCorners[(j + 1) % 5]
                positions.push(centerPt.x, centerPt.y, centerPt.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
            }
        }

        const pentGeometry = new THREE.BufferGeometry()
        pentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        pentGeometry.computeVertexNormals()

        const pentMesh = new THREE.Mesh(pentGeometry)
        pentMesh.name = 'shadeBlack'
        pentMesh.position.set(0, 0, radius)
        ballBase.add(pentMesh)

        // 3. Collision sphere
        const collSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8))
        collSphere.name = 'sphere'
        collSphere.scale.set(radius, radius, radius)
        collSphere.position.set(0, 0, radius)
        ballCollision.add(collSphere)

        const centerMesh = new THREE.Object3D()
        centerMesh.name = 'center'
        centerMesh.position.set(0, 0, radius)
        ballCollision.add(centerMesh)

        // 4. Add dynamic ball object
        this.soccer.ball = this.objects.add({
            base: ballBase,
            collision: ballCollision,
            offset: this.soccer.ballOffset.clone(),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: false,
            shadow: { sizeX: radius * 2.2, sizeY: radius * 2.2, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.8,
            soundName: 'bowlingBall',
            sleep: false
        })

        // Tune damping for authentic soccer ball rolling
        this.soccer.ball.collision.body.linearDamping = 0.08
        this.soccer.ball.collision.body.angularDamping = 0.12
    }

    setSoccerCelebration()
    {
        // Floating "GOAL!" billboard sprite
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 256
        const ctx = canvas.getContext('2d')

        // Stylized "GOAL!" text
        ctx.fillStyle = '#ffeb3b'
        ctx.strokeStyle = '#d32f2f'
        ctx.lineWidth = 16
        ctx.font = 'bold 110px "Arial Black", Impact, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeText('GOAL! ⚽', 256, 128)
        ctx.fillText('GOAL! ⚽', 256, 128)

        const bannerTexture = new THREE.CanvasTexture(canvas)
        const bannerMaterial = new THREE.SpriteMaterial({
            map: bannerTexture,
            transparent: true,
            opacity: 0
        })

        this.soccer.celebrationSprite = new THREE.Sprite(bannerMaterial)
        this.soccer.celebrationSprite.scale.set(0, 0, 1)
        this.soccer.celebrationSprite.position.set(this.soccer.goal.x, this.soccer.goal.y, this.soccer.goal.height + 1.8)
        this.container.add(this.soccer.celebrationSprite)

        // Confetti pieces
        this.soccer.confetti = []
        const confettiColors = [0xff1744, 0x00e676, 0x2979ff, 0xffea00, 0xff9100, 0xffffff]
        for(let i = 0; i < 30; i++)
        {
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.12, 0.04),
                new THREE.MeshBasicMaterial({ color: confettiColors[i % confettiColors.length] })
            )
            mesh.visible = false
            this.container.add(mesh)
            this.soccer.confetti.push({
                mesh,
                velocity: new THREE.Vector3(),
                rotationSpeed: new THREE.Vector3()
            })
        }

        this.soccer.isCelebrating = false

        this.soccer.triggerGoal = () =>
        {
            if(this.soccer.isCelebrating)
            {
                return
            }

            this.soccer.isCelebrating = true

            // Celebration sound
            if(this.sounds)
            {
                this.sounds.play('carHorn1')
                window.setTimeout(() =>
                {
                    this.sounds.play('reveal')
                }, 200)
            }

            // Animate Goal Banner
            this.soccer.celebrationSprite.material.opacity = 1
            this.soccer.celebrationSprite.scale.set(0, 0, 1)

            gsap.to(this.soccer.celebrationSprite.scale, {
                x: 6.5,
                y: 3.2,
                duration: 0.5,
                ease: 'back.out(2.5)',
                onComplete: () =>
                {
                    gsap.to(this.soccer.celebrationSprite.material, {
                        opacity: 0,
                        duration: 0.8,
                        delay: 1.8,
                        onComplete: () =>
                        {
                            this.soccer.celebrationSprite.scale.set(0, 0, 1)
                            this.soccer.isCelebrating = false
                        }
                    })
                }
            })

            // Burst confetti
            for(const item of this.soccer.confetti)
            {
                item.mesh.visible = true
                item.mesh.position.set(
                    this.soccer.goal.x + (Math.random() - 0.5) * 1.5,
                    this.soccer.goal.y + (Math.random() - 0.5) * 3,
                    this.soccer.goal.height + Math.random() * 0.8
                )
                item.velocity.set(
                    (Math.random() - 0.2) * 5,
                    (Math.random() - 0.5) * 8,
                    Math.random() * 5 + 3
                )
                item.rotationSpeed.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                )
            }
        }

        // Confetti physics tick
        this.time.on('tick', () =>
        {
            if(!this.soccer.isCelebrating)
            {
                return
            }

            const dt = Math.min(this.time.delta / 1000, 0.05)
            for(const item of this.soccer.confetti)
            {
                if(item.mesh.visible)
                {
                    item.velocity.z -= 9.8 * dt
                    item.mesh.position.x += item.velocity.x * dt
                    item.mesh.position.y += item.velocity.y * dt
                    item.mesh.position.z += item.velocity.z * dt

                    item.mesh.rotation.x += item.rotationSpeed.x * dt
                    item.mesh.rotation.y += item.rotationSpeed.y * dt
                    item.mesh.rotation.z += item.rotationSpeed.z * dt

                    if(item.mesh.position.z <= 0.05)
                    {
                        item.mesh.position.z = 0.05
                        item.velocity.set(0, 0, 0)
                    }
                }
            }
        })
    }

    setSoccerReset()
    {
        // Reset function
        this.soccer.reset = () =>
        {
            this.soccer.ball.collision.body.position.copy(this.soccer.ball.collision.origin.position)
            this.soccer.ball.collision.body.quaternion.copy(this.soccer.ball.collision.origin.quaternion)
            this.soccer.ball.collision.body.velocity.set(0, 0, 0)
            this.soccer.ball.collision.body.angularVelocity.set(0, 0, 0)

            // Hide confetti if active
            for(const item of this.soccer.confetti)
            {
                item.mesh.visible = false
            }

            if(this.sounds)
            {
                this.sounds.play('uiArea')
            }
        }

        // Reset area pad at entrance
        this.soccer.resetArea = this.areas.add({
            position: new THREE.Vector2(this.soccer.x, this.soccer.y),
            halfExtents: new THREE.Vector2(2, 2)
        })

        this.soccer.resetArea.on('interact', () =>
        {
            this.soccer.reset()
        })

        // Reset label on the floor
        this.soccer.areaLabelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5),
            new THREE.MeshBasicMaterial({
                transparent: true,
                depthWrite: false,
                color: 0xffffff,
                alphaMap: this.resources.items.areaResetTexture
            })
        )
        this.soccer.areaLabelMesh.position.set(this.soccer.x, this.soccer.y, 0.01)
        this.soccer.areaLabelMesh.matrixAutoUpdate = false
        this.soccer.areaLabelMesh.updateMatrix()
        this.container.add(this.soccer.areaLabelMesh)

        // Debug
        if(this.debugFolder)
        {
            this.debugFolder.add(this.soccer, 'reset').name('soccer reset')
            this.debugFolder.add(this.soccer, 'triggerGoal').name('trigger goal test')
        }
    }

    setSoccerGoalDetection()
    {
        this.time.on('tick', () =>
        {
            if(!this.soccer.ball || !this.soccer.ball.collision)
            {
                return
            }

            const ballBody = this.soccer.ball.collision.body
            const ballPos = ballBody.position
            const ballVel = ballBody.velocity
            const goal = this.soccer.goal

            // Check if ball has entered the goal net volume
            const enteredGoalLine = ballPos.x < goal.x && ballPos.x > goal.x - goal.depth * 1.5
            const withinPosts = Math.abs(ballPos.y - goal.y) < goal.width * 0.5
            const belowCrossbar = ballPos.z > 0 && ballPos.z < goal.height

            if(enteredGoalLine && withinPosts && belowCrossbar)
            {
                this.soccer.triggerGoal()
            }

            // NET BARRIER & CUSHION: Prevent ball from ever escaping through back or sides of net
            const netBackX = goal.x - goal.depth + this.soccer.ballRadius * 0.6
            if(ballPos.x <= netBackX && withinPosts && ballPos.z < goal.height * 1.2)
            {
                ballPos.x = netBackX
                if(ballVel.x < 0)
                {
                    // Gentle rebound into goal mouth, absorbing shot power like a real net
                    ballVel.x = Math.abs(ballVel.x) * 0.25
                    ballVel.y *= 0.5
                    ballVel.z *= 0.5
                }
            }

            // Left/right side net containment
            const maxSideY = goal.width * 0.5 - this.soccer.ballRadius * 0.5
            if(ballPos.x < goal.x && ballPos.x > goal.x - goal.depth * 1.2)
            {
                if(ballPos.y > goal.y + maxSideY)
                {
                    ballPos.y = goal.y + maxSideY
                    if(ballVel.y > 0) ballVel.y = - Math.abs(ballVel.y) * 0.25
                }
                else if(ballPos.y < goal.y - maxSideY)
                {
                    ballPos.y = goal.y - maxSideY
                    if(ballVel.y < 0) ballVel.y = Math.abs(ballVel.y) * 0.25
                }
            }
        })
    }
}
