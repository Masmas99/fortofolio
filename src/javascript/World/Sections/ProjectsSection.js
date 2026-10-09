import * as THREE from 'three'
import Project from './Project'
import gsap from 'gsap'

export default class ProjectsSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.camera = _options.camera
        this.passes = _options.passes
        this.objects = _options.objects
        this.areas = _options.areas
        this.zones = _options.zones
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.interDistance = 24
        this.positionRandomess = 5
        this.projectHalfWidth = 9

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setList()
        this.setZone()

        // Add all project from the list
        for(const _options of this.list)
        {
            this.add(_options)
        }
    }

    setGeometries()
    {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneGeometry(16, 8)
    }

    setMeshes()
    {
        this.meshes = {}

        // this.meshes.boardStructure = this.objects.getConvertedMesh(this.resources.items.projectsBoardStructure.scene.children, { floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture })
        this.resources.items.areaOpenTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaOpenTexture.minFilter = THREE.LinearFilter
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
        this.meshes.areaLabel = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.resources.items.areaOpenTexture }))
        this.meshes.areaLabel.matrixAutoUpdate = false
    }

    setList()
    {
        this.list = [
            {
                boards: [
                    {
                        name: 'IoT & Networking',
                        description: 'Class Introduction',
                        image: './models/projects/iotClass/slideA.png',
                        href: 'https://classiotn.free.nf/'
                    },
                    {
                        name: 'LSP LIBRARY',
                        description: 'The LSP Library offers a diverse collection of books and information resources to support learning activities and foster an interest in reading, complemented by facilities such as computers and internet access.',
                        image: './models/projects/lspLibrary/slideA.png',
                        href: 'https://lsplibrary.free.nf/'
                    },
                    {
                        name: 'MediStock',
                        description: 'Medication inventory management application',
                        image: './models/projects/medistock/slideA.png',
                        href: 'https://managementobat-5zh5.vercel.app/'
                    }
                ]
            },
            {
                boards: [
                    {
                        name: 'E-Commerce',
                        description: 'Minimalist fashion e-commerce store',
                        image: './models/projects/ecommerce/slideA.png',
                        href: 'https://ecommers.infinityfree.io/'
                    },
                    {
                        name: 'MikroTik NOC',
                        description: 'A web application to monitor, manage, and diagnose MikroTik devices from a single dashboard.',
                        image: './models/projects/mikrotikNoc/slideA.png',
                        href: 'https://github.com/Masmas99/monitoring-mikrotik'
                    },
                    {
                        name: 'Atnet',
                        description: 'For the Atnet company',
                        image: './models/projects/atnet/slideA.png',
                        href: 'https://atnet.kesug.com/'
                    }
                ]
            },
            {
                boards: [
                    {
                        name: 'Screen Monitoring System',
                        description: 'A web application for monitoring and managing endpoint computers from a single dashboard.',
                        image: './models/projects/screenMonitoring/slideA.png',
                        href: 'https://github.com/Masmas99/monitoring_system_layar'
                    },
                    {
                        name: 'Coming Soon',
                        description: 'Coming Soon',
                        image: './models/projects/github/slideA.png',
                        href: 'https://github.com/Masmas99'
                    },
                    {
                        name: 'Coming Soon',
                        description: 'Coming Soon',
                        image: './models/projects/github/slideA.png',
                        href: 'https://github.com/Masmas99'
                    }
                ]
            }
        ]
    }

    setZone()
    {
        const totalWidth = this.list.length * (this.interDistance / 2)

        const zone = this.zones.add({
            position: { x: this.x + totalWidth - this.projectHalfWidth - 6, y: this.y },
            halfExtents: { x: totalWidth, y: 12 },
            data: { cameraAngle: 'projects' }
        })

        zone.on('in', (_data) =>
        {
            this.camera.angle.set(_data.cameraAngle)
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: 0, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: 0, duration: 2 })
        })

        zone.on('out', () =>
        {
            this.camera.angle.set('default')
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: this.passes.horizontalBlurPass.strength, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: this.passes.verticalBlurPass.strength, duration: 2 })
        })
    }

    add(_options)
    {
        const x = this.x + this.items.length * this.interDistance
        let y = this.y
        if(this.items.length > 0)
        {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Create project
        const project = new Project({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            geometries: this.geometries,
            meshes: this.meshes,
            debug: this.debugFolder,
            x: x,
            y: y,
            ..._options
        })

        this.container.add(project.container)

        // Add tiles
        if(this.items.length >= 1)
        {
            const previousProject = this.items[this.items.length - 1]
            const start = new THREE.Vector2(previousProject.x + this.projectHalfWidth, previousProject.y)
            const end = new THREE.Vector2(project.x - this.projectHalfWidth, project.y)
            const delta = end.clone().sub(start)
            this.tiles.add({
                start: start,
                delta: delta
            })
        }

        // Save
        this.items.push(project)
    }
}
