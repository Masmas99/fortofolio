export default class MiniMap
{
    constructor(_options)
    {
        this.time = _options.time
        this.car = _options.car
        this.teleport = _options.teleport
        this.landmarks = [
            { name: 'Intro', x: _options.sections.intro.x, y: _options.sections.intro.y },
            { name: 'Crossroads', x: _options.sections.crossroads.x, y: _options.sections.crossroads.y },
            { name: 'Projects', x: _options.sections.projects.x, y: _options.sections.projects.y },
            { name: 'Info', x: _options.sections.information.x, y: _options.sections.information.y },
            { name: 'Playground', x: _options.sections.playground.x, y: _options.sections.playground.y }
        ]

        this.bounds = { minX: -48, maxX: 40, minY: -62, maxY: 8 }
        this.isOpen = false
        this.setElements()

        this.time.on('tick', () =>
        {
            if(this.isOpen)
            {
                this.draw()
            }
        })
    }

    setElements()
    {
        this.$toggle = document.createElement('button')
        this.$toggle.className = 'mini-map-toggle is-visible'
        this.$toggle.type = 'button'
        this.$toggle.setAttribute('aria-label', 'Buka peta area')
        this.$toggle.setAttribute('aria-expanded', 'false')
        this.$toggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20V6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M8.5 4v13.5M15.5 6.5V20" stroke="currentColor" stroke-width="1.8"/>
            </svg>
        `

        this.$panel = document.createElement('section')
        this.$panel.className = 'mini-map-panel'
        this.$panel.setAttribute('aria-label', 'Peta area portfolio')
        this.$panel.hidden = true

        const header = document.createElement('div')
        header.className = 'mini-map-header'

        const titleWrap = document.createElement('div')
        titleWrap.className = 'mini-map-title'

        const eyebrow = document.createElement('span')
        eyebrow.textContent = 'WORLD MAP'

        const title = document.createElement('h2')
        title.textContent = 'Jelajahi portfolio'

        this.$close = document.createElement('button')
        this.$close.className = 'mini-map-close'
        this.$close.type = 'button'
        this.$close.setAttribute('aria-label', 'Tutup peta area')
        this.$close.textContent = '×'

        this.$canvas = document.createElement('canvas')
        this.$canvas.className = 'mini-map-canvas'
        this.$canvas.setAttribute('aria-label', 'Peta area. Klik penanda untuk teleport.')
        this.$canvas.setAttribute('role', 'img')

        this.$hint = document.createElement('p')
        this.$hint.className = 'mini-map-hint'
        this.$hint.textContent = 'Pilih area di peta atau daftar untuk berpindah'

        this.$destinations = document.createElement('nav')
        this.$destinations.className = 'mini-map-destinations'
        this.$destinations.setAttribute('aria-label', 'Pilih tujuan')

        for(const landmark of this.landmarks)
        {
            const button = document.createElement('button')
            button.className = 'mini-map-destination'
            button.type = 'button'
            button.innerHTML = `<span class="mini-map-destination-dot"></span><span>${landmark.name}</span><span class="mini-map-destination-arrow">↗</span>`
            button.addEventListener('click', () =>
            {
                this.goTo(landmark)
            })
            this.$destinations.append(button)
        }

        titleWrap.append(eyebrow, title)
        header.append(titleWrap, this.$close)
        this.$panel.append(header, this.$canvas, this.$hint, this.$destinations)
        document.body.append(this.$toggle, this.$panel)

        this.$toggle.addEventListener('click', () =>
        {
            this.setOpen(!this.isOpen)
        })
        this.$close.addEventListener('click', () =>
        {
            this.setOpen(false)
            this.$toggle.focus()
        })
        this.$canvas.addEventListener('click', (_event) =>
        {
            this.selectNearestLandmark(_event)
        })
    }

    setOpen(_isOpen)
    {
        this.isOpen = _isOpen
        this.$panel.hidden = !this.isOpen
        this.$toggle.classList.toggle('is-open', this.isOpen)
        this.$toggle.setAttribute('aria-expanded', String(this.isOpen))
        this.$toggle.setAttribute('aria-label', this.isOpen ? 'Tutup peta area' : 'Buka peta area')

        if(this.isOpen)
        {
            this.draw()
            this.$close.focus()
        }
    }

    goTo(_landmark)
    {
        if(!this.teleport(_landmark.x, _landmark.y))
        {
            return
        }

        this.setOpen(false)
        this.$toggle.focus()
    }

    selectNearestLandmark(_event)
    {
        const rect = this.$canvas.getBoundingClientRect()
        const x = _event.clientX - rect.left
        const y = _event.clientY - rect.top
        const nearest = this.landmarks
            .map((_landmark) =>
            {
                const point = this.toPoint(_landmark.x, _landmark.y, rect.width, rect.height)
                return { landmark: _landmark, distance: Math.hypot(point.x - x, point.y - y) }
            })
            .sort((_a, _b) => _a.distance - _b.distance)[0]

        if(nearest && nearest.distance <= 24)
        {
            this.goTo(nearest.landmark)
        }
    }

    toPoint(_x, _y, _width, _height)
    {
        const padding = { left: 42, right: 18, top: 18, bottom: 18 }
        return {
            x: padding.left + (_x - this.bounds.minX) / (this.bounds.maxX - this.bounds.minX) * (_width - padding.left - padding.right),
            y: padding.top + (this.bounds.maxY - _y) / (this.bounds.maxY - this.bounds.minY) * (_height - padding.top - padding.bottom)
        }
    }

    draw()
    {
        const width = this.$canvas.clientWidth
        const height = this.$canvas.clientHeight
        if(!width || !height)
        {
            return
        }

        const pixelRatio = window.devicePixelRatio || 1
        const canvasWidth = Math.round(width * pixelRatio)
        const canvasHeight = Math.round(height * pixelRatio)
        if(this.$canvas.width !== canvasWidth || this.$canvas.height !== canvasHeight)
        {
            this.$canvas.width = canvasWidth
            this.$canvas.height = canvasHeight
        }

        const context = this.$canvas.getContext('2d')
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        context.clearRect(0, 0, width, height)

        const terrain = context.createLinearGradient(0, 0, width, height)
        terrain.addColorStop(0, '#ffb05f')
        terrain.addColorStop(1, '#f47a2a')
        context.fillStyle = terrain
        context.fillRect(0, 0, width, height)

        context.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        context.lineWidth = 1
        for(let x = 12; x < width; x += 22)
        {
            context.beginPath()
            context.moveTo(x, 0)
            context.lineTo(x, height)
            context.stroke()
        }
        for(let y = 10; y < height; y += 22)
        {
            context.beginPath()
            context.moveTo(0, y)
            context.lineTo(width, y)
            context.stroke()
        }

        const connections = [
            ['Intro', 'Crossroads'],
            ['Crossroads', 'Projects'],
            ['Crossroads', 'Info'],
            ['Crossroads', 'Playground']
        ]

        context.lineCap = 'round'
        for(const [fromName, toName] of connections)
        {
            const from = this.landmarks.find((_landmark) => _landmark.name === fromName)
            const to = this.landmarks.find((_landmark) => _landmark.name === toName)
            const fromPoint = this.toPoint(from.x, from.y, width, height)
            const toPointValue = this.toPoint(to.x, to.y, width, height)

            context.strokeStyle = 'rgba(179, 77, 20, 0.5)'
            context.lineWidth = 9
            context.beginPath()
            context.moveTo(fromPoint.x, fromPoint.y)
            context.lineTo(toPointValue.x, toPointValue.y)
            context.stroke()

            context.strokeStyle = 'rgba(255, 255, 255, 0.9)'
            context.lineWidth = 2
            context.setLineDash([5, 5])
            context.beginPath()
            context.moveTo(fromPoint.x, fromPoint.y)
            context.lineTo(toPointValue.x, toPointValue.y)
            context.stroke()
            context.setLineDash([])
        }

        for(const landmark of this.landmarks)
        {
            const point = this.toPoint(landmark.x, landmark.y, width, height)
            context.fillStyle = 'rgba(184, 77, 19, 0.32)'
            context.beginPath()
            context.arc(point.x, point.y, 10, 0, Math.PI * 2)
            context.fill()
            context.fillStyle = '#fff8e9'
            context.strokeStyle = '#d85e13'
            context.lineWidth = 2
            context.beginPath()
            context.arc(point.x, point.y, 6, 0, Math.PI * 2)
            context.fill()
            context.stroke()

            context.font = 'bold 11px Arial, sans-serif'
            context.textBaseline = 'middle'
            context.textAlign = landmark.name === 'Projects' ? 'right' : 'left'
            const labelX = point.x + (landmark.name === 'Projects' ? -10 : 10)
            const labelY = point.y + (landmark.name === 'Intro' ? -12 : landmark.name === 'Crossroads' ? -10 : 12)
            context.lineWidth = 3
            context.strokeStyle = 'rgba(174, 70, 18, 0.78)'
            context.strokeText(landmark.name, labelX, labelY)
            context.fillStyle = '#ffffff'
            context.fillText(landmark.name, labelX, labelY)
        }

        const carPosition = this.car.chassis.object.position
        const carPoint = this.toPoint(carPosition.x, carPosition.y, width, height)
        context.save()
        context.translate(carPoint.x, carPoint.y)
        context.rotate(-this.car.chassis.object.rotation.z)
        context.shadowColor = 'rgba(155, 61, 11, 0.45)'
        context.shadowBlur = 8
        context.fillStyle = '#fff2d8'
        context.strokeStyle = '#b84910'
        context.lineWidth = 1.5
        context.beginPath()
        context.moveTo(0, -9)
        context.lineTo(7, 7)
        context.lineTo(0, 4)
        context.lineTo(-7, 7)
        context.closePath()
        context.fill()
        context.stroke()
        context.restore()
        context.textAlign = 'left'
    }
}
