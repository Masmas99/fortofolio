import * as THREE from 'three'

import ProjectBoardMaterial from '../../Materials/ProjectBoard.js'
import gsap from 'gsap'

export default class Project
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.name = _options.name
        this.description = _options.description
        this.boardsData = _options.boards || null
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y
        this.imageSources = _options.imageSources
        this.floorTexture = _options.floorTexture
        this.link = _options.link
        this.links = _options.links
        this.distinctions = _options.distinctions

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        // this.container.updateMatrix()

        this.setBoards()
        this.setFloor()
    }

    setBoards()
    {
        // Set up
        this.boards = {}
        this.boards.items = []
        this.boards.xInter = 5
        this.boards.y = 5
        this.boards.color = '#8e7161'
        this.boards.threeColor = new THREE.Color(this.boards.color)

        if(this.debug)
        {
            this.debug.addColor(this.boards, 'color').name('boardColor').onChange(() =>
            {
                this.boards.threeColor.set(this.boards.color)
            })
        }

        // Create each board
        const boardsCount = this.boardsData && this.boardsData.length
            ? this.boardsData.length
            : (this.boardsCount !== undefined ? this.boardsCount : (this.imageSources && this.imageSources.length ? this.imageSources.length : 3))

        this.boards.xStart = - (boardsCount - 1) * 0.5 * this.boards.xInter

        for(let i = 0; i < boardsCount; i++)
        {
            const boardData = this.boardsData && this.boardsData[i]

            // Set up
            const board = {}
            board.x = this.x + this.boards.xStart + i * this.boards.xInter
            board.y = this.y + this.boards.y

            // Create structure with collision
            this.objects.add({
                base: this.resources.items.projectsBoardStructure.scene,
                collision: this.resources.items.projectsBoardCollision.scene,
                floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
                offset: new THREE.Vector3(board.x, board.y, 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                mass: 0
            })

            // Plane
            board.planeMesh = this.meshes.boardPlane.clone()
            board.planeMesh.position.x = board.x
            board.planeMesh.position.y = board.y
            board.planeMesh.matrixAutoUpdate = false
            board.planeMesh.updateMatrix()
            board.planeMesh.material = new ProjectBoardMaterial()
            board.planeMesh.material.uniforms.uColor.value = this.boards.threeColor
            board.planeMesh.material.uniforms.uTextureAlpha.value = 0
            this.container.add(board.planeMesh)

            // Image load (if image source provided)
            const imageSrc = (boardData && boardData.image) || (this.imageSources && this.imageSources[i])
            if(imageSrc)
            {
                const image = new Image()
                image.addEventListener('load', () =>
                {
                    board.texture = new THREE.Texture(image)
                    board.texture.anisotropy = 4
                    board.texture.needsUpdate = true

                    board.planeMesh.material.uniforms.uTexture.value = board.texture

                    gsap.to(board.planeMesh.material.uniforms.uTextureAlpha, { value: 1, duration: 1, ease: 'power4.inOut' })
                })

                image.src = imageSrc
            }

            // Save
            this.boards.items.push(board)
        }
    }

    setFloor()
    {
        this.floor = {}

        this.floor.x = 0
        this.floor.y = - 2

        // Container
        this.floor.container = new THREE.Object3D()
        this.floor.container.position.x = this.x + this.floor.x
        this.floor.container.position.y = this.y + this.floor.y
        this.floor.container.matrixAutoUpdate = false
        this.floor.container.updateMatrix()
        this.container.add(this.floor.container)

        // Auto-generate floor texture if not explicitly provided
        if(!this.floorTexture)
        {
            if(this.boardsData && this.boardsData.length)
            {
                const canvas = document.createElement('canvas')
                canvas.width = 4096
                canvas.height = 2048
                const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#000000'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                ctx.fillStyle = '#ffffff'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                const wrapText = (context, text, x, startY, maxWidth, lineHeight, maxLines = 7) =>
                {
                    const words = text.split(' ')
                    let line = ''
                    const lines = []

                    for(let n = 0; n < words.length; n++)
                    {
                        const testLine = line + words[n] + ' '
                        const metrics = context.measureText(testLine)
                        if(metrics.width > maxWidth && n > 0)
                        {
                            lines.push(line.trim())
                            line = words[n] + ' '
                        }
                        else
                        {
                            line = testLine
                        }
                    }
                    if(line.trim().length > 0)
                    {
                        lines.push(line.trim())
                    }

                    if(lines.length > maxLines)
                    {
                        lines.length = maxLines
                        lines[maxLines - 1] = lines[maxLines - 1].replace(/\.*$/, '...')
                    }

                    for(let k = 0; k < lines.length; k++)
                    {
                        context.fillText(lines[k], x, startY + k * lineHeight)
                    }
                }

                for(let i = 0; i < this.boardsData.length; i++)
                {
                    const item = this.boardsData[i]
                    const board = this.boards.items[i]
                    if(!board) continue
                    const relX = board.x - (this.x + this.floor.x)
                    // Floor geometry width is 16, centered at 0 (from -8 to +8)
                    const normalizedX = (relX + 8) / 16
                    const cx = normalizedX * canvas.width

                    let descStartY = 460
                    if(item.name)
                    {
                        const upperName = item.name.toUpperCase()
                        ctx.font = 'bold 76px Arial, sans-serif'
                        const titleMetrics = ctx.measureText(upperName)
                        if(titleMetrics.width > 800)
                        {
                            ctx.font = 'bold 64px Arial, sans-serif'
                            ctx.fillStyle = '#ffffff'
                            wrapText(ctx, upperName, cx, 320, 800, 70, 2)
                            descStartY = 480
                        }
                        else
                        {
                            ctx.font = 'bold 76px Arial, sans-serif'
                            ctx.fillStyle = '#ffffff'
                            ctx.fillText(upperName, cx, 360)
                        }
                    }

                    if(item.description)
                    {
                        ctx.font = 'bold 44px Arial, sans-serif'
                        ctx.fillStyle = '#ffffff'
                        wrapText(ctx, item.description, cx, descStartY, 800, 56, 8)
                    }
                }

                this.floorTexture = new THREE.CanvasTexture(canvas)
            }
            else if(this.name)
            {
                const canvas = document.createElement('canvas')
                canvas.width = 2048
                canvas.height = 1024
                const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#000000'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                ctx.fillStyle = '#ffffff'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                // Title
                ctx.font = 'bold 88px Arial, sans-serif'
                ctx.fillText(this.name.toUpperCase(), 1024, 340)

                // Description
                if(this.description)
                {
                    ctx.font = 'bold 48px Arial, sans-serif'
                    ctx.fillStyle = '#ffffff'
                    ctx.fillText(this.description, 1024, 470)
                }

                this.floorTexture = new THREE.CanvasTexture(canvas)
            }
        }

        // Texture (if floorTexture provided)
        if(this.floorTexture)
        {
            this.floor.texture = this.floorTexture
            this.floor.texture.magFilter = THREE.LinearFilter
            this.floor.texture.minFilter = THREE.LinearMipmapLinearFilter
            this.floor.texture.anisotropy = 8
            this.floor.texture.needsUpdate = true

            // Geometry
            this.floor.geometry = this.geometries.floor

            // Material
            this.floor.material =  new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaMap: this.floor.texture })

            // Mesh
            this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
            this.floor.mesh.matrixAutoUpdate = false
            this.floor.container.add(this.floor.mesh)
        }

        // Distinctions
        if(this.distinctions)
        {
            for(const _distinction of this.distinctions)
            {
                let base = null
                let collision = null
                let shadowSizeX = null
                let shadowSizeY = null

                switch(_distinction.type)
                {
                    case 'awwwards':
                        base = this.resources.items.projectsDistinctionsAwwwardsBase.scene
                        collision = this.resources.items.projectsDistinctionsAwwwardsCollision.scene
                        shadowSizeX = 1.5
                        shadowSizeY = 1.5
                        break

                    case 'fwa':
                        base = this.resources.items.projectsDistinctionsFWABase.scene
                        collision = this.resources.items.projectsDistinctionsFWACollision.scene
                        shadowSizeX = 2
                        shadowSizeY = 1
                        break

                    case 'cssda':
                        base = this.resources.items.projectsDistinctionsCSSDABase.scene
                        collision = this.resources.items.projectsDistinctionsCSSDACollision.scene
                        shadowSizeX = 1.2
                        shadowSizeY = 1.2
                        break
                }

                this.objects.add({
                    base: base,
                    collision: collision,
                    offset: new THREE.Vector3(this.x + this.floor.x + _distinction.x, this.y + this.floor.y + _distinction.y, 0),
                    rotation: new THREE.Euler(0, 0, 0),
                    duplicated: true,
                    shadow: { sizeX: shadowSizeX, sizeY: shadowSizeY, offsetZ: - 0.1, alpha: 0.5 },
                    mass: 1.5,
                    soundName: 'woodHit'
                })
            }
        }

        // Open areas (one for each board)
        this.floor.openItems = []
        const count = this.boards.items.length

        for(let i = 0; i < count; i++)
        {
            const board = this.boards.items[i]
            const openRelX = board.x - (this.x + this.floor.x)
            const openRelY = - 1.2
            const openAbsX = this.x + this.floor.x + openRelX
            const openAbsY = this.y + this.floor.y + openRelY

            const boardData = this.boardsData && this.boardsData[i]
            const href = (boardData && boardData.href) || (this.links && this.links[i] && this.links[i].href) || (this.links && this.links[0] && this.links[0].href) || (this.link && this.link.href) || 'https://github.com/'

            // Area
            const area = this.areas.add({
                position: new THREE.Vector2(openAbsX, openAbsY),
                halfExtents: new THREE.Vector2(1.5, 1.0)
            })
            area.on('interact', () =>
            {
                window.open(href, '_blank')
            })

            // Area label (OPEN)
            const areaLabel = this.meshes.areaLabel.clone()
            areaLabel.position.x = openRelX
            areaLabel.position.y = openRelY
            areaLabel.position.z = 0.001
            areaLabel.matrixAutoUpdate = false
            areaLabel.updateMatrix()
            this.floor.container.add(areaLabel)

            this.floor.openItems.push({ area, areaLabel })
        }
    }
}
