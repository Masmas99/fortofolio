import * as THREE from 'three'

export default class CrossroadsSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setStatic()
        this.setSoccerPlayerGraphic()
        this.setTiles()
    }

    setStatic()
    {
        const scene = this.resources.items.crossroadsStaticBase.scene

        // Remove only old sports person & dog drawing from center floor (shadeWhite_034, shadeWhite_035)
        // Restore all 3 dogs (Gambar 2: chair/glasses, Gambar 3: lying down, Gambar 4: standing with weights)
        for(let i = scene.children.length - 1; i >= 0; i--)
        {
            const child = scene.children[i]
            const name = child.name || ''

            if(name === 'shadeWhite_034' || name === 'shadeWhite_035')
            {
                scene.remove(child)
            }
        }

        this.objects.add({
            base: this.resources.items.crossroadsStaticBase.scene,
            collision: this.resources.items.crossroadsStaticCollision.scene,
            floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setSoccerPlayerGraphic()
    {
        // High-resolution canvas for soccer player kicking a ball
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, 1024, 1024)

        // Draw dynamic silhouette of a soccer player kicking a ball in white
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#ffffff'
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.save()
        ctx.translate(480, 520)

        // Head
        ctx.beginPath()
        ctx.arc(-30, -260, 48, 0, Math.PI * 2)
        ctx.fill()

        // Torso / Jersey (leaning forward dynamically into the kick)
        ctx.beginPath()
        ctx.moveTo(-10, -200)
        ctx.lineTo(-90, -180)
        ctx.lineTo(-130, -50)
        ctx.lineTo(-20, -40)
        ctx.lineTo(20, -180)
        ctx.closePath()
        ctx.fill()

        // Back Arm (swung backwards for momentum)
        ctx.lineWidth = 32
        ctx.beginPath()
        ctx.moveTo(-85, -170)
        ctx.quadraticCurveTo(-190, -160, -220, -100)
        ctx.stroke()

        // Front Arm (reaching forward)
        ctx.beginPath()
        ctx.moveTo(15, -170)
        ctx.quadraticCurveTo(90, -140, 120, -80)
        ctx.stroke()

        // Shorts / Hips
        ctx.beginPath()
        ctx.moveTo(-130, -50)
        ctx.lineTo(-150, 40)
        ctx.lineTo(-70, 50)
        ctx.lineTo(-20, -40)
        ctx.closePath()
        ctx.fill()

        // Standing / Plant Leg (firm on ground, knee slightly bent)
        ctx.beginPath()
        ctx.moveTo(-120, 40)
        ctx.quadraticCurveTo(-150, 130, -130, 240)
        ctx.stroke()

        // Standing foot/cleat
        ctx.lineWidth = 36
        ctx.beginPath()
        ctx.moveTo(-130, 235)
        ctx.lineTo(-180, 245)
        ctx.stroke()

        // Kicking Leg (powerfully swinging forward, extended)
        ctx.lineWidth = 34
        ctx.beginPath()
        ctx.moveTo(-60, 40)
        ctx.quadraticCurveTo(20, 100, 140, 140)
        ctx.stroke()

        // Kicking foot / cleat striking the ball
        ctx.lineWidth = 38
        ctx.beginPath()
        ctx.moveTo(135, 138)
        ctx.lineTo(205, 175)
        ctx.stroke()

        // Soccer Ball (positioned right at the tip of the kicking foot)
        const ballX = 280
        const ballY = 195
        const ballRadius = 55

        // Ball circle
        ctx.beginPath()
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
        ctx.fill()

        // Inner pentagons in black for clear contrast
        ctx.fillStyle = '#111111'
        ctx.beginPath()
        for(let a = 0; a < 5; a++)
        {
            const angle = a * Math.PI * 2 / 5 - Math.PI * 0.5
            const px = ballX + Math.cos(angle) * 20
            const py = ballY + Math.sin(angle) * 20
            if(a === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()

        // Connecting lines to edge
        ctx.strokeStyle = '#111111'
        ctx.lineWidth = 7
        for(let a = 0; a < 5; a++)
        {
            const angle = a * Math.PI * 2 / 5 - Math.PI * 0.5
            const px = ballX + Math.cos(angle) * 20
            const py = ballY + Math.sin(angle) * 20
            const ex = ballX + Math.cos(angle) * ballRadius
            const ey = ballY + Math.sin(angle) * ballRadius
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(ex, ey)
            ctx.stroke()
        }

        // Action / Kick speed lines radiating from the kick impact
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8
        ctx.beginPath()
        // Speed line 1
        ctx.moveTo(ballX + 75, ballY - 20)
        ctx.lineTo(ballX + 160, ballY - 45)
        // Speed line 2
        ctx.moveTo(ballX + 80, ballY + 20)
        ctx.lineTo(ballX + 180, ballY + 15)
        // Speed line 3
        ctx.moveTo(ballX + 70, ballY + 55)
        ctx.lineTo(ballX + 150, ballY + 75)
        // Swoosh behind foot
        ctx.moveTo(60, 190)
        ctx.quadraticCurveTo(120, 210, 180, 200)
        ctx.stroke()

        ctx.restore()

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter

        const playerMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(3.6, 3.6),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false
            })
        )
        playerMesh.position.set(this.x + 0.2, this.y - 0.15, 0.005)
        playerMesh.matrixAutoUpdate = false
        playerMesh.updateMatrix()
        this.container.add(playerMesh)
    }

    setTiles()
    {
        // To intro
        this.tiles.add({
            start: new THREE.Vector2(this.x, - 10),
            delta: new THREE.Vector2(0, this.y + 14)
        })

        // To projects
        this.tiles.add({
            start: new THREE.Vector2(this.x + 12.5, this.y),
            delta: new THREE.Vector2(7.5, 0)
        })

        // To playground
        this.tiles.add({
            start: new THREE.Vector2(this.x - 13, this.y),
            delta: new THREE.Vector2(- 6, 0)
        })
    }
}
