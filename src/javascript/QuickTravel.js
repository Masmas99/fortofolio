export default class QuickTravel
{
    constructor()
    {
        this.isOpen = false
        this.isStarted = false

        // Precision calibration matching the portfolio 3D coordinates
        // Intro (0, 0) -> (42.0%, 20.8%)
        // Crossroads (0, -30) -> (42.0%, 52.3%)
        // Playground (-38, -34) -> (17.5%, 52.3%)
        // Contact (1.2, -55) -> (42.0%, 82.0%)
        // Projects 7-9 (76, -30) -> (88.0%, 52.3%)
        this.calibration = {
            centerX: 42.0,
            centerY: 20.8,
            scaleX: 0.605,
            scaleY: 1.05
        }

        this.setDOM()
        this.setEvents()
        this.setTicker()
    }

    setDOM()
    {
        // 1. Container
        this.$container = document.createElement('div')
        this.$container.classList.add('map-nav-container')

        // Trigger Button styled 100% to match folio warm orange theme (no M badge)
        this.$button = document.createElement('button')
        this.$button.classList.add('map-nav-trigger')
        this.$button.setAttribute('title', 'Folio World Map [Shortcut: M / T]')
        this.$button.innerHTML = `
            <div class="map-nav-icon-wrapper">
                <svg viewBox="0 0 36 36" fill="none" class="map-nav-icon-svg" xmlns="http://www.w3.org/2000/svg">
                    <!-- Folded Map Surface Platform (Folio Warm Peach/Orange Theme) -->
                    <polygon points="5,24 13,21 23,24 31,21 31,29 23,32 13,29 5,32" fill="#fed7aa" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>
                    <polygon points="13,21 23,24 23,32 13,29" fill="#fdba74"/>
                    <!-- Road on Map -->
                    <path d="M 8,27 Q 18,24 28,26" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3 2"/>
                    <!-- 3D Big Location Pin -->
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18 4C13.58 4 10 7.58 10 12C10 17.5 17.2 23.5 17.65 23.88C17.85 24.04 18.15 24.04 18.35 23.88C18.8 23.5 26 17.5 26 12C26 7.58 22.42 4 18 4ZM18 15C16.34 15 15 13.66 15 12C15 10.34 16.34 9 18 9C19.66 9 21 10.34 21 12C21 13.66 19.66 15 18 15Z" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                    <circle cx="18" cy="12" r="2.8" fill="#ea580c"/>
                    <!-- Little Red Car -->
                    <rect x="21" y="22" width="9" height="6" rx="1.5" fill="#dc2626" stroke="#ffffff" stroke-width="1"/>
                    <circle cx="23" cy="28" r="1.3" fill="#0f172a"/>
                    <circle cx="28" cy="28" r="1.3" fill="#0f172a"/>
                </svg>
            </div>
        `
        this.$container.appendChild(this.$button)

        // 2. Map Modal Overlay (Colors matching 100% folio floor: #f5883c, #ff9043, #fccf92, #f5aa58)
        this.$backdrop = document.createElement('div')
        this.$backdrop.classList.add('map-modal-backdrop')

        this.$modal = document.createElement('div')
        this.$modal.classList.add('map-modal')

        // Floating Close Button (No top header bar)
        const $closeBtn = document.createElement('button')
        $closeBtn.classList.add('map-modal-close')
        $closeBtn.setAttribute('title', 'Tutup Peta')
        $closeBtn.innerHTML = '&times;'
        this.$modal.appendChild($closeBtn)

        // Map View Canvas
        this.$mapView = document.createElement('div')
        this.$mapView.classList.add('map-view')

        // Rich Isometric 3D SVG Island matching 100% folio website colors:
        this.$mapView.innerHTML = `
            <svg class="map-svg" viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <!-- Void Ambient Gradient (Warm Twilight Amber) -->
                    <radialGradient id="skyGrad" cx="50%" cy="50%" r="75%">
                        <stop offset="0%" stop-color="#422213"/>
                        <stop offset="55%" stop-color="#241208"/>
                        <stop offset="100%" stop-color="#120904"/>
                    </radialGradient>

                    <!-- Island 3D Base Thickness Gradient (Terracotta/Warm Shadow) -->
                    <linearGradient id="islandBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#c2410c"/>
                        <stop offset="45%" stop-color="#9a3412"/>
                        <stop offset="100%" stop-color="#5a1e06"/>
                    </linearGradient>

                    <!-- Island Top Surface Gradient (Exact Folio 3D Floor Colors: #f5883c, #ff9043, #fccf92, #f5aa58) -->
                    <linearGradient id="islandSurfaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f5883c"/>
                        <stop offset="35%" stop-color="#ff9043"/>
                        <stop offset="70%" stop-color="#f5aa58"/>
                        <stop offset="100%" stop-color="#fccf92"/>
                    </linearGradient>

                    <!-- 3D Letter Bevel Gradient for MASHUDI -->
                    <linearGradient id="text3DGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="60%" stop-color="#fed7aa"/>
                        <stop offset="100%" stop-color="#f97316"/>
                    </linearGradient>

                    <!-- Monas Gold Flame Gradient -->
                    <linearGradient id="goldFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#fef08a"/>
                        <stop offset="50%" stop-color="#eab308"/>
                        <stop offset="100%" stop-color="#ca8a04"/>
                    </linearGradient>

                    <!-- Cloud Glow Filter -->
                    <filter id="cloudSoft" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- 1. Background Void Canvas -->
                <rect width="1000" height="650" fill="url(#skyGrad)"/>

                <!-- 2. Floating Low-Poly Rock Outcrops at Map Corners -->
                <!-- Top-Left Rocks & Trees -->
                <polygon points="10,130 55,80 95,115 110,170 70,210 20,185" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
                <polygon points="55,80 95,115 70,150 20,140" fill="#f97316"/>
                <polygon points="40,95 48,65 58,95 50,115" fill="#facc15"/><!-- tree -->
                <polygon points="75,130 83,105 92,130 84,145" fill="#eab308"/><!-- tree -->

                <!-- Top-Right Rocks & Trees -->
                <polygon points="900,90 955,60 995,100 985,160 930,175 890,130" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
                <polygon points="955,60 995,100 960,130 915,105" fill="#f97316"/>
                <polygon points="940,85 948,55 956,85 950,105" fill="#facc15"/><!-- tree -->

                <!-- Bottom-Left Rocks & Trees -->
                <polygon points="5,520 65,470 115,530 95,620 30,640" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
                <polygon points="65,470 115,530 75,570 20,530" fill="#f97316"/>
                <polygon points="45,490 53,460 62,490 54,510" fill="#facc15"/>
                <polygon points="80,535 88,510 96,535 89,550" fill="#eab308"/>

                <!-- Bottom-Right Rocks & Trees -->
                <polygon points="895,540 960,490 995,545 980,630 910,640" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
                <polygon points="960,490 995,545 955,580 910,545" fill="#f97316"/>
                <polygon points="940,515 948,485 956,515 949,535" fill="#facc15"/>

                <!-- 3. Puffy Floating Clouds (Soft Cream White) -->
                <g filter="url(#cloudSoft)" opacity="0.95">
                    <ellipse cx="25" cy="410" rx="22" ry="18" fill="#ffffff"/>
                    <ellipse cx="42" cy="405" rx="16" ry="14" fill="#fff7ed"/>
                    <ellipse cx="8" cy="415" rx="14" ry="12" fill="#ffedd5"/>
                </g>
                <g filter="url(#cloudSoft)" opacity="0.95">
                    <ellipse cx="890" cy="55" rx="28" ry="20" fill="#ffffff"/>
                    <ellipse cx="915" cy="50" rx="20" ry="16" fill="#fff7ed"/>
                    <ellipse cx="868" cy="62" rx="18" ry="14" fill="#ffedd5"/>
                </g>
                <g filter="url(#cloudSoft)" opacity="0.95">
                    <ellipse cx="965" cy="590" rx="26" ry="18" fill="#ffffff"/>
                    <ellipse cx="945" cy="595" rx="18" ry="14" fill="#fff7ed"/>
                </g>

                <!-- 4. MAIN ISOMETRIC ISLAND (Thick 3D Bevel Slab matching folio floor) -->
                <!-- 3D Island Bottom Thickness Extrusion -->
                <path d="
                    M 60,360
                    C 50,490 150,580 320,600
                    C 540,620 780,600 920,530
                    C 975,470 965,370 955,340
                    L 955,375
                    C 965,405 975,505 920,565
                    C 780,635 540,655 320,635
                    C 150,615 50,525 60,395 Z
                " fill="url(#islandBaseGrad)"/>

                <!-- 3D Island Top Edge Rim -->
                <path d="
                    M 60,360
                    C 50,220 180,100 420,80
                    C 660,60 880,120 950,240
                    C 980,310 970,440 920,530
                    C 780,600 540,620 320,600
                    C 150,580 50,490 60,360 Z
                " fill="#c2410c" stroke="#fb923c" stroke-width="2.5"/>

                <!-- Island Surface (Formula 100% matching website 3D floor) -->
                <path d="
                    M 65,355
                    C 55,225 185,105 420,85
                    C 655,65 875,125 945,245
                    C 972,315 962,435 915,525
                    C 775,595 535,615 320,595
                    C 155,575 55,485 65,355 Z
                " fill="url(#islandSurfaceGrad)"/>

                <!-- Subtle Inner Elevation Ring -->
                <path d="
                    M 115,355
                    C 110,240 215,135 420,120
                    C 625,105 820,155 885,255
                    C 915,315 905,420 860,495
                    C 735,555 520,575 325,555
                    C 185,535 110,460 115,355 Z
                " fill="#fed7aa" opacity="0.25"/>

                <!-- 5. ROAD CIRCUITS (Crisp white lines with bright orange track borders) -->
                <!-- North-South Road: Intro -> Crossroads -> Contact -->
                <line x1="420" y1="125" x2="420" y2="535" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 8" opacity="0.95"/>

                <!-- East Road: Crossroads -> Projects -->
                <line x1="420" y1="340" x2="930" y2="340" stroke="#ffffff" stroke-width="3" stroke-dasharray="12 10" opacity="0.95"/>

                <!-- West Road to Playground: Flat natural road -->
                <line x1="420" y1="340" x2="160" y2="340" stroke="#ffffff" stroke-width="3" stroke-dasharray="12 10" opacity="0.95"/>
                <!-- Chevrons towards Playground -->
                <path d="M 230,334 L 222,340 L 230,346 M 218,334 L 210,340 L 218,346" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>
                <path d="M 330,334 L 322,340 L 330,346 M 318,334 L 310,340 L 318,346" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>

                <!-- Chevrons towards Projects -->
                <path d="M 510,334 L 518,340 L 510,346 M 522,334 L 530,340 L 522,346" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>
                <path d="M 665,334 L 673,340 L 665,346 M 677,334 L 685,340 L 677,346" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>
                <path d="M 815,334 L 823,340 L 815,346 M 827,334 L 835,340 L 827,346" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>

                <!-- 6. LANDMARK: CROSSROADS (Center Intersection - Accurate Signs in Folio Colors) -->
                <g>
                    <!-- Intersection Circle Area -->
                    <circle cx="420" cy="340" r="26" fill="#f97316" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>
                    <circle cx="420" cy="340" r="22" fill="#ea580c"/>

                    <!-- Soccer Player Graphic in Center (Actual asset from CrossroadsSection.js!) -->
                    <circle cx="417" cy="333" r="3" fill="#ffffff"/><!-- head -->
                    <path d="M 416,336 L 413,344 L 410,348 M 413,340 L 420,342 L 423,341" fill="none" stroke="#ffffff" stroke-width="1.2"/>
                    <circle cx="425" cy="340" r="2.2" fill="#ffffff"/><!-- kicked ball -->

                    <!-- 4-Way Signpost Signs in Theme Colors -->
                    <!-- East Clue: PROJECTS ▶ -->
                    <g>
                        <rect x="450" y="318" width="85" height="18" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                        <polygon points="535,327 544,327 539,322" fill="#ffffff"/>
                        <text x="492" y="331" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9.5" font-weight="900" fill="#c2410c" text-anchor="middle" letter-spacing="0.8">PROJECTS ▶</text>
                    </g>

                    <!-- West Clue: ◀ PLAYGROUND -->
                    <g>
                        <rect x="305" y="318" width="96" height="18" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                        <polygon points="305,327 296,327 301,322" fill="#ffffff"/>
                        <text x="353" y="331" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9.5" font-weight="900" fill="#c2410c" text-anchor="middle" letter-spacing="0.8">◀ PLAYGROUND</text>
                    </g>

                    <!-- North Clue: ▲ INTRO -->
                    <g>
                        <rect x="382" y="272" width="76" height="18" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                        <polygon points="420,266 414,272 426,272" fill="#ffffff"/>
                        <text x="420" y="285" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9.5" font-weight="900" fill="#c2410c" text-anchor="middle" letter-spacing="0.8">▲ INTRO</text>
                    </g>

                    <!-- South Clue: ▼ CONTACT -->
                    <g>
                        <rect x="375" y="372" width="90" height="18" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                        <polygon points="420,396 414,390 426,390" fill="#ffffff"/>
                        <text x="420" y="385" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9.5" font-weight="900" fill="#c2410c" text-anchor="middle" letter-spacing="0.8">▼ CONTACT</text>
                    </g>

                    <!-- Crossroads Center Label -->
                    <text x="420" y="412" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">CROSSROADS</text>
                </g>

                <!-- 7. LANDMARK: INTRO / START (North) -->
                <g>
                    <!-- 3D "MASHUDI" Emblem Letters (Warm Bevel Gradient) -->
                    <text x="420" y="115" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#9a3412" text-anchor="middle" letter-spacing="4">MASHUDI</text>
                    <text x="419" y="112" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" fill="url(#text3DGrad)" text-anchor="middle" letter-spacing="4">MASHUDI</text>

                    <!-- Keyboard Keys Hint [▲][▼][◄][►] -->
                    <rect x="395" y="132" width="14" height="13" rx="2.5" fill="#ffffff" stroke="#f97316" stroke-width="1"/>
                    <text x="402" y="142" font-size="8" font-weight="900" fill="#c2410c" text-anchor="middle">▲</text>
                    <rect x="411" y="132" width="14" height="13" rx="2.5" fill="#ffffff" stroke="#f97316" stroke-width="1"/>
                    <text x="418" y="142" font-size="8" font-weight="900" fill="#c2410c" text-anchor="middle">▼</text>
                    <rect x="379" y="132" width="14" height="13" rx="2.5" fill="#ffffff" stroke="#f97316" stroke-width="1"/>
                    <text x="386" y="142" font-size="8" font-weight="900" fill="#c2410c" text-anchor="middle">◄</text>
                    <rect x="427" y="132" width="14" height="13" rx="2.5" fill="#ffffff" stroke="#f97316" stroke-width="1"/>
                    <text x="434" y="142" font-size="8" font-weight="900" fill="#c2410c" text-anchor="middle">►</text>

                    <!-- Label -->
                    <text x="420" y="160" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">START / INTRO</text>
                </g>

                <!-- 8. LANDMARK: PLAYGROUND (West - Soccer Pitch, Bowling, Bricks) -->
                <g>
                    <!-- Mini Soccer Pitch (Real website asset from PlaygroundSection.js) -->
                    <rect x="80" y="305" width="70" height="48" rx="4" fill="#15803d" stroke="#ffffff" stroke-width="1.8"/>
                    <!-- Pitch Markings -->
                    <line x1="115" y1="305" x2="115" y2="353" stroke="#ffffff" stroke-width="1.2"/>
                    <circle cx="115" cy="329" r="8" fill="none" stroke="#ffffff" stroke-width="1.2"/>
                    <!-- Penalty Area & Goal on West Edge -->
                    <rect x="80" y="318" width="16" height="22" fill="none" stroke="#ffffff" stroke-width="1.2"/>
                    <rect x="73" y="321" width="7" height="16" fill="none" stroke="#ffffff" stroke-width="1.5"/>
                    <circle cx="125" cy="329" r="3.5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>

                    <!-- Bowling Alley (Real website asset!) -->
                    <rect x="85" y="365" width="45" height="14" rx="2" fill="#c2410c" stroke="#ffffff" stroke-width="1"/>
                    <circle cx="120" cy="372" r="1.8" fill="#ffffff"/>
                    <circle cx="124" cy="370" r="1.8" fill="#ffffff"/>
                    <circle cx="124" cy="374" r="1.8" fill="#ffffff"/>
                    <circle cx="95" cy="372" r="3.2" fill="#0f172a" stroke="#ffffff" stroke-width="0.8"/>

                    <!-- Brick Wall (Real website asset!) -->
                    <g transform="translate(138, 360)">
                        <rect x="0" y="8" width="10" height="5" fill="#ef4444" stroke="#9a3412" stroke-width="0.8"/>
                        <rect x="11" y="8" width="10" height="5" fill="#ef4444" stroke="#9a3412" stroke-width="0.8"/>
                        <rect x="5" y="2" width="10" height="5" fill="#ef4444" stroke="#9a3412" stroke-width="0.8"/>
                    </g>

                    <!-- Playground Label -->
                    <text x="115" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">PLAYGROUND</text>
                </g>

                <!-- 9. LANDMARK: PROJECTS HIGHWAY (East - 1-3, 4-6, 7-9) -->
                <!-- Group 1: Projects 1-3 -->
                <g>
                    <!-- Project Stand 3D Billboard -->
                    <polygon points="570,318 585,308 605,314 590,324" fill="#ffffff" stroke="#ea580c" stroke-width="1"/>
                    <polygon points="570,318 590,324 590,332 570,326" fill="#fed7aa"/>
                    <!-- Low-poly Stones near project -->
                    <polygon points="555,335 563,328 569,335 560,340" fill="#ffffff"/>
                    <polygon points="595,336 602,330 608,336 600,341" fill="#ffffff"/>
                    <!-- Label -->
                    <text x="585" y="302" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">PROJECTS 1-3</text>
                </g>

                <!-- Group 2: Projects 4-6 -->
                <g>
                    <!-- Project Stand 3D Billboard -->
                    <polygon points="725,318 740,308 760,314 745,324" fill="#ffffff" stroke="#ea580c" stroke-width="1"/>
                    <polygon points="725,318 745,324 745,332 725,326" fill="#fed7aa"/>
                    <!-- Low-poly Stones -->
                    <polygon points="710,335 718,328 724,335 715,340" fill="#ffffff"/>
                    <!-- Label -->
                    <text x="740" y="302" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">PROJECTS 4-6</text>
                </g>

                <!-- Group 3: Projects 7-9 -->
                <g>
                    <!-- Project Stand 3D Billboard -->
                    <polygon points="865,318 880,308 900,314 885,324" fill="#ffffff" stroke="#ea580c" stroke-width="1"/>
                    <polygon points="865,318 885,324 885,332 865,326" fill="#fed7aa"/>
                    <!-- Low-poly Stones -->
                    <polygon points="852,335 860,328 866,335 857,340" fill="#ffffff"/>
                    <!-- Label -->
                    <text x="880" y="302" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">PROJECTS 7-9</text>
                </g>

                <!-- 10. LANDMARK: CONTACT & INFO (South - MONAS, Flag, Social) -->
                <g>
                    <!-- MONAS (Monumen Nasional Indonesia - actual website custom asset!) -->
                    <!-- Base Platform (Cawan Monas) -->
                    <polygon points="405,510 420,503 435,510 420,517" fill="#ffffff" stroke="#ea580c" stroke-width="1"/>
                    <polygon points="405,510 435,510 435,515 405,515" fill="#fed7aa"/>
                    <!-- Obelisk Tower -->
                    <polygon points="417,503 423,503 422,460 418,460" fill="#ffffff" stroke="#fed7aa" stroke-width="0.8"/>
                    <!-- Gold Flame (Lidah Api Emas) -->
                    <polygon points="418,460 422,460 424,453 420,446 416,453" fill="url(#goldFlame)"/>

                    <!-- Indonesian Flag (Merah Putih) -->
                    <line x1="438" y1="480" x2="438" y2="520" stroke="#ffffff" stroke-width="1.5"/>
                    <rect x="438" y="482" width="14" height="4.5" fill="#dc2626"/>
                    <rect x="438" y="486.5" width="14" height="4.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.5"/>

                    <!-- Social Icons / Billboards (Gmail, LinkedIn, GitHub) -->
                    <rect x="390" y="495" width="10" height="9" rx="1.5" fill="#ea4335"/><!-- Gmail -->
                    <rect x="376" y="500" width="10" height="9" rx="1.5" fill="#0077b5"/><!-- LinkedIn -->
                    <rect x="382" y="512" width="10" height="9" rx="1.5" fill="#24292f"/><!-- GitHub -->

                    <!-- Low-poly Stones -->
                    <polygon points="400,530 408,524 415,530 406,536" fill="#ffffff"/>

                    <!-- Label -->
                    <text x="420" y="555" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">CONTACT</text>
                </g>

                <!-- 11. SCATTERED NATURE: PRISM YELLOW TREES & WHITE STONES (Bruno Simon Folio Style) -->
                <!-- North-West cluster -->
                <polygon points="215,160 225,125 235,160 225,180" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
                <polygon points="245,180 253,150 262,180 254,195" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
                <!-- North-East cluster -->
                <polygon points="540,150 550,118 560,150 550,170" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
                <polygon points="565,165 573,140 582,165 574,180" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
                <!-- South-East cluster -->
                <polygon points="830,470 842,425 855,470 843,495" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
                <!-- Center-South cluster -->
                <polygon points="520,380 528,355 537,380 529,395" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
                <polygon points="450,480 458,455 467,480 459,495" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
                <!-- South-West cluster -->
                <polygon points="295,490 304,460 314,490 305,505" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>

                <!-- Scattered White Low-poly Stones -->
                <polygon points="175,190 188,178 198,190 185,200" fill="#ffffff" stroke="#fed7aa" stroke-width="0.8"/>
                <polygon points="195,195 204,188 212,196 203,203" fill="#ffffff"/>
                <polygon points="340,365 350,358 358,366 348,373" fill="#ffffff" stroke="#fed7aa" stroke-width="0.8"/>
                <polygon points="575,410 585,402 593,410 583,418" fill="#ffffff" stroke="#fed7aa" stroke-width="0.8"/>
                <polygon points="790,260 802,248 812,260 800,270" fill="#ffffff" stroke="#fed7aa" stroke-width="0.8"/>
            </svg>

            <!-- Real-Time Player Position Marker ("YOU" Pin) -->
            <div class="map-player-marker">
                <div class="map-player-pulse"></div>
                <div class="map-player-pin"></div>
                <div class="map-player-label">YOU</div>
            </div>

            <!-- Interactive Click-to-Drop Target Ring -->
            <div class="map-drop-preview">
                <div class="drop-ring"></div>
                <div class="drop-label">DROP HERE</div>
            </div>
        `
        this.$modal.appendChild(this.$mapView)

        // Footer Hint in Theme Colors
        const $footer = document.createElement('div')
        $footer.classList.add('map-modal-footer')
        $footer.innerHTML = `
            <div class="map-legend">
                <span class="legend-item"><span class="legend-car"></span> Posisi Mobil Anda</span>
                <span class="legend-item">Klik di mana saja untuk drop & teleportasi</span>
            </div>
            <div class="map-shortcut-hint">Shortcut: <b>M</b> / <b>T</b></div>
        `
        this.$modal.appendChild($footer)

        this.$backdrop.appendChild(this.$modal)
        document.body.appendChild(this.$container)
        document.body.appendChild(this.$backdrop)
    }

    setEvents()
    {
        // Toggle trigger button
        this.$button.addEventListener('click', (e) =>
        {
            e.stopPropagation()
            this.toggle()
        })

        // Close button
        const $close = this.$modal.querySelector('.map-modal-close')
        $close.addEventListener('click', (e) =>
        {
            e.stopPropagation()
            this.close()
        })

        // Close on clicking backdrop outside modal
        this.$backdrop.addEventListener('click', (e) =>
        {
            if(e.target === this.$backdrop)
            {
                this.close()
            }
        })

        // Keyboard Shortcut: M or T to toggle, Escape to close
        window.addEventListener('keydown', (e) =>
        {
            const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : ''
            if(targetTag === 'input' || targetTag === 'textarea') return

            if(e.key === 'm' || e.key === 'M' || e.key === 't' || e.key === 'T')
            {
                this.toggle()
            }
            else if(e.key === 'Escape' && this.isOpen)
            {
                this.close()
            }
        })

        // Interactive Drop Anywhere: Mousemove hover ring & Click to teleport
        const $dropPreview = this.$mapView.querySelector('.map-drop-preview')

        this.$mapView.addEventListener('mousemove', (e) =>
        {
            const rect = this.$mapView.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            $dropPreview.style.left = `${x}px`
            $dropPreview.style.top = `${y}px`
            $dropPreview.style.opacity = '1'
        })

        this.$mapView.addEventListener('mouseleave', () =>
        {
            $dropPreview.style.opacity = '0'
        })

        this.$mapView.addEventListener('click', (e) =>
        {
            const rect = this.$mapView.getBoundingClientRect()
            const pctX = ((e.clientX - rect.left) / rect.width) * 100
            const pctY = ((e.clientY - rect.top) / rect.height) * 100

            // Inverse calibration: map % back to 3D world (X, Y)
            const targetX = (pctX - this.calibration.centerX) / this.calibration.scaleX
            const targetY = (this.calibration.centerY - pctY) / this.calibration.scaleY

            // Spawn Click Ripple animation at click coordinates
            this.createClickRipple(e.clientX - rect.left, e.clientY - rect.top)

            // Teleport vehicle
            this.teleportTo(targetX, targetY)
        })
    }

    createClickRipple(x, y)
    {
        const $ripple = document.createElement('div')
        $ripple.classList.add('map-click-ripple')
        $ripple.style.left = `${x}px`
        $ripple.style.top = `${y}px`
        this.$mapView.appendChild($ripple)

        setTimeout(() =>
        {
            $ripple.remove()
        }, 600)
    }

    teleportTo(x, y)
    {
        if(typeof window.folioTeleport === 'function')
        {
            window.folioTeleport(x, y, 2.5)
        }

        // Smoothly close map modal after teleporting
        setTimeout(() =>
        {
            this.close()
        }, 220)
    }

    show()
    {
        if(this.isStarted) return
        this.isStarted = true
        this.$container.classList.add('is-visible')
    }

    setTicker()
    {
        const $player = this.$mapView.querySelector('.map-player-marker')

        setInterval(() =>
        {
            // Auto reveal map button if player has started driving
            if(!this.isStarted)
            {
                const carPos = this.getCarPosition()
                if(carPos && (Math.abs(carPos.x) > 0.5 || Math.abs(carPos.y) > 0.5))
                {
                    this.show()
                }
            }

            if(!this.isOpen) return

            const carPos = this.getCarPosition()
            if(carPos && $player)
            {
                // Convert 3D world position to map % coordinates
                const pctX = this.calibration.centerX + carPos.x * this.calibration.scaleX
                const pctY = this.calibration.centerY - carPos.y * this.calibration.scaleY

                // Clamp inside map artwork bounds
                const clampedX = Math.max(8, Math.min(94, pctX))
                const clampedY = Math.max(10, Math.min(90, pctY))

                $player.style.left = `${clampedX}%`
                $player.style.top = `${clampedY}%`
            }
        }, 50)
    }

    getCarPosition()
    {
        if(
            window.application &&
            window.application.world &&
            window.application.world.physics &&
            window.application.world.physics.car &&
            window.application.world.physics.car.chassis &&
            window.application.world.physics.car.chassis.body
        )
        {
            const pos = window.application.world.physics.car.chassis.body.position
            return { x: pos.x, y: pos.y }
        }
        return null
    }

    toggle()
    {
        if(!this.isStarted) return

        if(this.isOpen)
        {
            this.close()
        }
        else
        {
            this.open()
        }
    }

    open()
    {
        if(!this.isStarted) return

        this.isOpen = true
        this.$backdrop.classList.add('is-open')
    }

    close()
    {
        this.isOpen = false
        this.$backdrop.classList.remove('is-open')
    }
}
