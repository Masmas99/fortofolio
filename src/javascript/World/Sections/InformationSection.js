import * as THREE from 'three'

export default class InformationSection
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
        this.setLinks()
        this.setTiles()
    }

    setStatic()
    {
        const scene = this.resources.items.informationStaticBase.scene

        // 1. Remove French flag and Eiffel Tower from base scene
        for(let i = scene.children.length - 1; i >= 0; i--)
        {
            const child = scene.children[i]
            const nameLower = (child.name || '').toLowerCase()

            // Eiffel Tower: shadeGray, Cube.221/Cube221, or near [-6.17, 6.37]
            const isEiffel = (
                nameLower.includes('shadegray') ||
                nameLower.includes('gray') ||
                (child.name && child.name.includes('221')) ||
                Math.hypot(child.position.x - (- 6.1709), child.position.y - 6.3713) < 1.8
            )

            // French flag: blue, white112, red005, or near [-3.24, 5.06] (excluding the pole at -4.23)
            const isFrenchFlag = (
                nameLower.includes('blue') ||
                nameLower.includes('white112') ||
                nameLower.includes('red005') ||
                (Math.hypot(child.position.x - (- 3.24), child.position.y - 5.0606) < 1.5 && child.position.x > - 4.0)
            )

            if(isEiffel || isFrenchFlag)
            {
                scene.remove(child)
            }
        }

        // 2. Add Monas (Monumen Nasional Indonesia)
        const monasX = - 6.1709
        const monasY = 6.3713

        // Base platform 1 (Pelataran Bawah)
        const mBase1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.3))
        mBase1.name = 'shadeWhite'
        mBase1.position.set(monasX, monasY, 0.15)
        scene.add(mBase1)

        // Base platform 2 (Pelataran Tingkat)
        const mBase2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 0.2))
        mBase2.name = 'shadeWhite'
        mBase2.position.set(monasX, monasY, 0.35)
        scene.add(mBase2)

        // Cawan Lower (Cawan / Saucer)
        const mCawanLower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.25))
        mCawanLower.name = 'shadeWhite'
        mCawanLower.position.set(monasX, monasY, 0.55)
        scene.add(mCawanLower)

        // Cawan Saucer Rim
        const mCawanRim = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 0.15))
        mCawanRim.name = 'shadeWhite'
        mCawanRim.position.set(monasX, monasY, 0.725)
        scene.add(mCawanRim)

        // Obelisk shaft pedestal
        const mShaftPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.2))
        mShaftPedestal.name = 'shadeWhite'
        mShaftPedestal.position.set(monasX, monasY, 0.875)
        scene.add(mShaftPedestal)

        // Obelisk shaft (tapered square column)
        const shaftGeom = new THREE.CylinderGeometry(0.22, 0.42, 3.8, 4)
        shaftGeom.rotateX(Math.PI * 0.5)
        shaftGeom.rotateZ(Math.PI * 0.25)
        const mShaft = new THREE.Mesh(shaftGeom)
        mShaft.name = 'shadeWhite'
        mShaft.position.set(monasX, monasY, 2.875)
        scene.add(mShaft)

        // Pelataran Puncak (Observation deck)
        const mDeck = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.12))
        mDeck.name = 'shadeWhite'
        mDeck.position.set(monasX, monasY, 4.835)
        scene.add(mDeck)

        // Dudukan Api (Flame pedestal)
        const flamePedestalGeom = new THREE.CylinderGeometry(0.16, 0.20, 0.14, 8)
        flamePedestalGeom.rotateX(Math.PI * 0.5)
        const mFlamePedestal = new THREE.Mesh(flamePedestalGeom)
        mFlamePedestal.name = 'shadeWhite'
        mFlamePedestal.position.set(monasX, monasY, 4.965)
        scene.add(mFlamePedestal)

        // Lidah Api Kemerdekaan (Golden Flame)
        const flameGeom = new THREE.ConeGeometry(0.18, 0.65, 8)
        flameGeom.rotateX(Math.PI * 0.5)
        const mFlame = new THREE.Mesh(flameGeom)
        mFlame.name = 'shadeYellow'
        mFlame.position.set(monasX, monasY, 5.34)
        scene.add(mFlame)

        // 3. Add Bendera Indonesia (Sang Saka Merah Putih)
        // Top half: Merah (Red)
        const flagRed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.5))
        flagRed.name = 'shadeRed'
        flagRed.position.set(- 3.23, 5.0606, 3.1)
        scene.add(flagRed)

        // Bottom half: Putih (White)
        const flagWhite = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.5))
        flagWhite.name = 'shadeWhite'
        flagWhite.position.set(- 3.23, 5.0606, 2.6)
        scene.add(flagWhite)

        this.objects.add({
            base: this.resources.items.informationStaticBase.scene,
            collision: this.resources.items.informationStaticCollision.scene,
            floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setBaguettes()
    {
        this.baguettes = {}

        this.baguettes.x = - 4
        this.baguettes.y = 6

        this.baguettes.a = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,
            collision: this.resources.items.informationBaguetteCollision.scene,
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.56, this.y + this.baguettes.y - 0.666, 0.2),
            rotation: new THREE.Euler(0, 0, - Math.PI * 37 / 180),
            duplicated: true,
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },
            mass: 1.5,
            // soundName: 'woodHit'
        })

        this.baguettes.b = this.objects.add({
            base: this.resources.items.informationBaguetteBase.scene,
            collision: this.resources.items.informationBaguetteCollision.scene,
            offset: new THREE.Vector3(this.x + this.baguettes.x - 0.8, this.y + this.baguettes.y - 2, 0.5),
            rotation: new THREE.Euler(0, - 0.5, Math.PI * 60 / 180),
            duplicated: true,
            shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: - 0.15, alpha: 0.35 },
            mass: 1.5,
            sleep: false,
            // soundName: 'woodHit'
        })
    }

    setLinks()
    {
        // Set up
        this.links = {}
        this.links.x = 1.95
        this.links.y = - 1.5
        this.links.halfExtents = {}
        this.links.halfExtents.x = 1
        this.links.halfExtents.y = 1
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = - 1.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Helper to generate crisp text alpha maps for labels with title & handle/email
        const createContactLabelTexture = (title, subtitle) =>
        {
            const canvas = document.createElement('canvas')
            canvas.width = 1024
            canvas.height = 256
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'

            // Title (MAIL, GITHUB, LINKEDIN, CV)
            ctx.font = 'italic 900 96px "Arial Black", Impact, sans-serif'
            ctx.fillText(title.toUpperCase(), 15, 75)

            // Subtitle (email, username, etc.)
            if(subtitle)
            {
                let fontSize = 46
                ctx.font = `italic 800 ${fontSize}px "Arial Black", Impact, sans-serif`
                while(ctx.measureText(subtitle.toUpperCase()).width > canvas.width - 40 && fontSize > 20)
                {
                    fontSize -= 2
                    ctx.font = `italic 800 ${fontSize}px "Arial Black", Impact, sans-serif`
                }
                ctx.fillText(subtitle.toUpperCase(), 15, 175)
            }

            const texture = new THREE.CanvasTexture(canvas)
            texture.magFilter = THREE.LinearFilter
            texture.minFilter = THREE.LinearFilter
            return texture
        }

        // Options
        this.links.options = [
            {
                href: './cv.pdf',
                labelTexture: createContactLabelTexture('CV', 'DOWNLOAD / VIEW')
            },
            {
                href: 'https://github.com/Masmas99',
                labelTexture: createContactLabelTexture('GITHUB', '@MASMAS99')
            },
            {
                href: 'https://www.linkedin.com/in/masmas-masa-b1568b38a/?isSelfProfile=true',
                labelTexture: createContactLabelTexture('LINKEDIN', '@MASMAS-MASA')
            },
            {
                href: 'mailto:masamasmas88@gmail.com',
                labelTexture: createContactLabelTexture('MAIL', 'MASAMASMAS88@GMAIL.COM')
            }
        ]

        // Clean up any existing map modal from DOM if present
        const existingModal = document.getElementById('website-map-modal')
        if(existingModal)
        {
            existingModal.remove()
        }

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.href = _option.href

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () =>
            {
                if(_option.href && _option.href.startsWith('mailto:'))
                {
                    // Open Gmail Compose directly in new tab
                    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=masamasmas88@gmail.com'
                    const win = window.open(gmailUrl, '_blank')
                    if(!win || win.closed || typeof win.closed === 'undefined')
                    {
                        window.location.href = _option.href
                    }
                }
                else
                {
                    window.open(_option.href, '_blank')
                }
            })

            // Texture
            item.texture = _option.labelTexture
            item.texture.magFilter = THREE.NearestFilter
            item.texture.minFilter = THREE.LinearFilter

            // Create label
            item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
            item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
            item.labelMesh.position.y = item.y + this.links.labelOffset
            item.labelMesh.matrixAutoUpdate = false
            item.labelMesh.updateMatrix()
            this.links.container.add(item.labelMesh)

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setActivities()
    {
        // Set up
        this.activities = {}
        this.activities.x = this.x + 0
        this.activities.y = this.y - 10
        this.activities.multiplier = 5.5

        // Geometry
        this.activities.geometry = new THREE.PlaneGeometry(2 * this.activities.multiplier, 1 * this.activities.multiplier, 1, 1)

        // Texture
        this.activities.texture = this.resources.items.informationActivitiesTexture
        this.activities.texture.magFilter = THREE.NearestFilter
        this.activities.texture.minFilter = THREE.LinearFilter

        // Material
        this.activities.material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: this.activities.texture, transparent: true })

        // Mesh
        this.activities.mesh = new THREE.Mesh(this.activities.geometry, this.activities.material)
        this.activities.mesh.position.x = this.activities.x
        this.activities.mesh.position.y = this.activities.y
        this.activities.mesh.matrixAutoUpdate = false
        this.activities.mesh.updateMatrix()
        this.container.add(this.activities.mesh)
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(this.x - 1.2, this.y + 13),
            delta: new THREE.Vector2(0, - 20)
        })
    }
}
