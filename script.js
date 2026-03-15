// ═══════════════════════════════════════════════
//  SITH PORTFOLIO — script.js
//  Vader bg + Saber Battle Canvas per section
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    // ═══ 1. CUSTOM CURSOR ═══
    const cursorCore  = document.getElementById('cursor-core');
    const cursorSaber = document.getElementById('cursor-saber');
    let mouseX = 0, mouseY = 0, saberX = 0, saberY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursorCore.style.left = mouseX + 'px';
        cursorCore.style.top  = mouseY + 'px';
    });

    (function animSaber() {
        saberX += (mouseX - saberX) * 0.12;
        saberY += (mouseY - saberY) * 0.12;
        cursorSaber.style.left = saberX + 'px';
        cursorSaber.style.top  = saberY + 'px';
        requestAnimationFrame(animSaber);
    })();

    document.querySelectorAll('a, button, input, textarea, .project-card, .service-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursorSaber.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorSaber.classList.remove('hover'));
    });

    if (window.matchMedia('(pointer: coarse)').matches) {
        cursorCore.style.display = 'none';
        cursorSaber.style.display = 'none';
    }

    // ═══ 2. MAIN PARTICLE FIELD ═══
    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas.getContext('2d');

    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    class Particle {
        constructor() { this.reset(true); }
        reset(init) {
            this.x = Math.random() * canvas.width;
            this.y = init ? Math.random() * canvas.height : canvas.height + 10;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = -(Math.random() * 0.45 + 0.08);
            this.size = Math.random() * 1.5 + 0.3;
            this.opacity = Math.random() * 0.55 + 0.1;
            this.life = 1;
            this.decay = Math.random() * 0.003 + 0.001;
            this.isSpark = Math.random() > 0.7;
        }
        update() {
            this.x += this.vx; this.y += this.vy; this.life -= this.decay;
            this.vx += (Math.random() - 0.5) * 0.015;
            if (this.life <= 0 || this.y < -10) this.reset(false);
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life * this.opacity;
            if (this.isSpark) {
                ctx.fillStyle = `rgba(255,50,50,${this.life})`;
                ctx.shadowColor = '#ff2222'; ctx.shadowBlur = 10;
            } else {
                ctx.fillStyle = `rgba(160,15,15,${this.life * 0.5})`;
                ctx.shadowColor = 'rgba(180,0,0,0.3)'; ctx.shadowBlur = 4;
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 90; i++) particles.push(new Particle());

    (function animParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animParticles);
    })();


    // ═══ 3. SECTION LIGHTSABER BATTLE CANVASES ═══
    // Each section gets an animated saber duel canvas as background

    function createSaberCanvas(section) {
        const c = document.createElement('canvas');
        c.className = 'duel-canvas';
        c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;transition:opacity 1s ease;';
        section.insertBefore(c, section.firstChild);
        return c;
    }

    // ─── ABOUT: Jedi (blue) vs Sith (red) duel ───
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const dc = createSaberCanvas(aboutSection);
        let dcW, dcH;

        function resizeDuelCanvas() {
            dcW = dc.width  = aboutSection.offsetWidth;
            dcH = dc.height = aboutSection.offsetHeight;
        }
        resizeDuelCanvas();
        window.addEventListener('resize', resizeDuelCanvas);

        // Two saber fighters
        const fighters = [
            { x: 0.2, y: 0.5, vx: 0.0008, vy: 0.0005, color: '#ff2222', glow: 'rgba(255,34,34,0.8)', len: 0.22, angle: 0.7, vAngle: 0.008 },
            { x: 0.8, y: 0.5, vx: -0.0008, vy: -0.0005, color: '#4488ff', glow: 'rgba(68,136,255,0.8)', len: 0.22, angle: -0.7, vAngle: -0.007 }
        ];

        // Clash sparks
        const clashSparks = [];

        function spawnSparks(cx, cy) {
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                clashSparks.push({
                    x: cx, y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    color: Math.random() > 0.5 ? '#ff4444' : '#6699ff'
                });
            }
        }

        const duelCtx = dc.getContext('2d');
        let duelActive = false;
        let duelFrame = 0;

        function drawDuel() {
            if (!duelActive) { requestAnimationFrame(drawDuel); return; }
            duelCtx.clearRect(0, 0, dcW, dcH);
            duelFrame++;

            fighters.forEach(f => {
                // Move fighter
                f.x += f.vx; f.y += f.vy; f.angle += f.vAngle;
                // Bounce
                if (f.x < 0.1 || f.x > 0.9) f.vx *= -1;
                if (f.y < 0.2 || f.y > 0.8) f.vy *= -1;
                // Orbit gently toward center
                const cx = 0.5, cy = 0.5;
                f.vx += (cx - f.x) * 0.00005;
                f.vy += (cy - f.y) * 0.00005;

                const px = f.x * dcW, py = f.y * dcH;
                const ex = px + Math.cos(f.angle) * f.len * dcW;
                const ey = py + Math.sin(f.angle) * f.len * dcH;

                // Draw saber blade
                duelCtx.save();
                duelCtx.strokeStyle = f.color;
                duelCtx.lineWidth = 2;
                duelCtx.shadowColor = f.glow;
                duelCtx.shadowBlur = 18;
                duelCtx.globalAlpha = 0.55;
                duelCtx.beginPath();
                duelCtx.moveTo(px, py);
                duelCtx.lineTo(ex, ey);
                duelCtx.stroke();
                // Core bright line
                duelCtx.strokeStyle = '#ffffff';
                duelCtx.lineWidth = 0.8;
                duelCtx.globalAlpha = 0.35;
                duelCtx.beginPath();
                duelCtx.moveTo(px, py);
                duelCtx.lineTo(ex, ey);
                duelCtx.stroke();
                duelCtx.restore();
            });

            // Check clash (tips close)
            const f0 = fighters[0], f1 = fighters[1];
            const tip0x = f0.x * dcW + Math.cos(f0.angle) * f0.len * dcW;
            const tip0y = f0.y * dcH + Math.sin(f0.angle) * f0.len * dcH;
            const tip1x = f1.x * dcW + Math.cos(f1.angle) * f1.len * dcW;
            const tip1y = f1.y * dcH + Math.sin(f1.angle) * f1.len * dcH;
            const dist = Math.hypot(tip0x - tip1x, tip0y - tip1y);
            if (dist < 80 && duelFrame % 40 === 0) {
                spawnSparks((tip0x + tip1x) / 2, (tip0y + tip1y) / 2);
                // Clash flash
                duelCtx.save();
                duelCtx.fillStyle = 'rgba(255,180,100,0.08)';
                duelCtx.fillRect(0, 0, dcW, dcH);
                duelCtx.restore();
            }

            // Sparks
            for (let i = clashSparks.length - 1; i >= 0; i--) {
                const s = clashSparks[i];
                s.x += s.vx; s.y += s.vy; s.vy += 0.08; s.life -= 0.04;
                if (s.life <= 0) { clashSparks.splice(i, 1); continue; }
                duelCtx.save();
                duelCtx.globalAlpha = s.life * 0.7;
                duelCtx.fillStyle = s.color;
                duelCtx.shadowColor = s.color; duelCtx.shadowBlur = 8;
                duelCtx.beginPath();
                duelCtx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                duelCtx.fill();
                duelCtx.restore();
            }

            requestAnimationFrame(drawDuel);
        }
        drawDuel();

        // Activate when section is visible
        const duelObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { duelActive = true; dc.style.opacity = '0.35'; }
                else { duelActive = false; dc.style.opacity = '0'; }
            });
        }, { threshold: 0.1 });
        duelObserver.observe(aboutSection);
    }

    // ─── PROJECTS: Flying saber streaks (hyperspace) ───
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        const pc = createSaberCanvas(projectsSection);
        let pcW, pcH;
        function resizePC() { pcW = pc.width = projectsSection.offsetWidth; pcH = pc.height = projectsSection.offsetHeight; }
        resizePC();
        window.addEventListener('resize', resizePC);
        const pCtx = pc.getContext('2d');

        const streaks = [];
        class Streak {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * pcW;
                this.y = Math.random() * pcH;
                this.speed = Math.random() * 4 + 1.5;
                this.angle = Math.PI * 0.15 + (Math.random() - 0.5) * 0.3;
                this.len = Math.random() * 80 + 30;
                this.life = 1;
                this.decay = Math.random() * 0.012 + 0.005;
                this.color = Math.random() > 0.65 ? '#ff2222' : (Math.random() > 0.5 ? '#cc0000' : '#4488ff');
                this.width = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                this.life -= this.decay;
                if (this.life <= 0 || this.x > pcW + 100 || this.y > pcH + 100) this.reset();
            }
            draw() {
                pCtx.save();
                pCtx.globalAlpha = this.life * 0.45;
                pCtx.strokeStyle = this.color;
                pCtx.lineWidth = this.width;
                pCtx.shadowColor = this.color; pCtx.shadowBlur = 10;
                pCtx.beginPath();
                pCtx.moveTo(this.x, this.y);
                pCtx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
                pCtx.stroke();
                pCtx.restore();
            }
        }

        for (let i = 0; i < 35; i++) { const s = new Streak(); s.x = Math.random() * pcW; s.y = Math.random() * pcH; streaks.push(s); }

        let projActive = false;
        (function animProj() {
            if (projActive) {
                pCtx.clearRect(0, 0, pcW, pcH);
                streaks.forEach(s => { s.update(); s.draw(); });
            }
            requestAnimationFrame(animProj);
        })();

        new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { projActive = true; pc.style.opacity = '0.4'; }
                else { projActive = false; pc.style.opacity = '0'; }
            });
        }, { threshold: 0.1 }).observe(projectsSection);
    }

    // ─── SERVICES: Saber swing arcs ───
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        const sc = createSaberCanvas(servicesSection);
        let scW, scH;
        function resizeSC() { scW = sc.width = servicesSection.offsetWidth; scH = sc.height = servicesSection.offsetHeight; }
        resizeSC();
        window.addEventListener('resize', resizeSC);
        const sCtx = sc.getContext('2d');

        const arcs = [];
        class SaberArc {
            constructor() { this.reset(); }
            reset() {
                this.cx = Math.random() * scW;
                this.cy = Math.random() * scH;
                this.r = Math.random() * 120 + 50;
                this.startAngle = Math.random() * Math.PI * 2;
                this.endAngle = this.startAngle + (Math.random() * Math.PI * 0.8 + 0.3);
                this.speed = (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
                this.life = 1;
                this.decay = Math.random() * 0.006 + 0.003;
                this.color = Math.random() > 0.5 ? '#cc0000' : '#dd1111';
                this.lineW = Math.random() * 2 + 0.8;
            }
            update() {
                this.startAngle += this.speed; this.endAngle += this.speed;
                this.life -= this.decay;
                if (this.life <= 0) this.reset();
            }
            draw() {
                sCtx.save();
                sCtx.globalAlpha = this.life * 0.3;
                sCtx.strokeStyle = this.color;
                sCtx.lineWidth = this.lineW;
                sCtx.shadowColor = this.color; sCtx.shadowBlur = 14;
                sCtx.beginPath();
                sCtx.arc(this.cx, this.cy, this.r, this.startAngle, this.endAngle);
                sCtx.stroke();
                sCtx.restore();
            }
        }

        for (let i = 0; i < 15; i++) arcs.push(new SaberArc());

        let servActive = false;
        (function animServ() {
            if (servActive) {
                sCtx.clearRect(0, 0, scW, scH);
                arcs.forEach(a => { a.update(); a.draw(); });
            }
            requestAnimationFrame(animServ);
        })();

        new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { servActive = true; sc.style.opacity = '0.5'; }
                else { servActive = false; sc.style.opacity = '0'; }
            });
        }, { threshold: 0.1 }).observe(servicesSection);
    }

    // ─── CONTACT: Lava / energy pulses ───
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        const cc = createSaberCanvas(contactSection);
        let ccW, ccH;
        function resizeCC() { ccW = cc.width = contactSection.offsetWidth; ccH = cc.height = contactSection.offsetHeight; }
        resizeCC();
        window.addEventListener('resize', resizeCC);
        const cCtx = cc.getContext('2d');

        const pulses = [];
        class LavaPulse {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * ccW;
                this.y = ccH * 0.7 + Math.random() * ccH * 0.3;
                this.r = 0;
                this.maxR = Math.random() * 150 + 60;
                this.speed = Math.random() * 1.2 + 0.4;
                this.life = 1;
                this.color = Math.random() > 0.5 ? '#cc0000' : '#990000';
            }
            update() {
                this.r += this.speed;
                this.life = 1 - this.r / this.maxR;
                if (this.r >= this.maxR) this.reset();
            }
            draw() {
                cCtx.save();
                cCtx.globalAlpha = this.life * 0.18;
                cCtx.strokeStyle = this.color;
                cCtx.lineWidth = 1.5;
                cCtx.shadowColor = this.color; cCtx.shadowBlur = 12;
                cCtx.beginPath();
                cCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                cCtx.stroke();
                cCtx.restore();
            }
        }

        for (let i = 0; i < 10; i++) {
            const p = new LavaPulse();
            p.r = Math.random() * p.maxR;
            p.life = 1 - p.r / p.maxR;
            pulses.push(p);
        }

        let contActive = false;
        (function animCont() {
            if (contActive) {
                cCtx.clearRect(0, 0, ccW, ccH);
                pulses.forEach(p => { p.update(); p.draw(); });
            }
            requestAnimationFrame(animCont);
        })();

        new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { contActive = true; cc.style.opacity = '0.6'; }
                else { contActive = false; cc.style.opacity = '0'; }
            });
        }, { threshold: 0.1 }).observe(contactSection);
    }

    // ═══ 4. TYPEWRITER ═══
    const roles = ['Fullstack Dasturchi','Cybersecurity Expert','Python Developer','API Architect','Telegram Bot Dev'];
    const roleEl = document.getElementById('typed-role');
    let rIdx = 0, cIdx = 0, deleting = false, tDelay = 120;

    function typeRole() {
        if (!roleEl) return;
        const cur = roles[rIdx];
        if (!deleting) {
            roleEl.textContent = cur.slice(0, cIdx + 1); cIdx++;
            if (cIdx === cur.length) { deleting = true; tDelay = 2200; }
            else tDelay = 100;
        } else {
            roleEl.textContent = cur.slice(0, cIdx - 1); cIdx--;
            if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; tDelay = 350; }
            else tDelay = 48;
        }
        setTimeout(typeRole, tDelay);
    }
    setTimeout(typeRole, 1600);

    // ═══ 5. MOBILE NAV ═══
    const mobileBtn = document.getElementById('mobile-menu');
    const navMenu   = document.getElementById('nav-menu');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const open = navMenu.classList.contains('active');
            const bars = mobileBtn.querySelectorAll('.bar');
            bars[0].style.transform = open ? 'rotate(45deg) translate(5px,6px)' : 'none';
            bars[1].style.opacity   = open ? '0' : '1';
            bars[2].style.transform = open ? 'rotate(-45deg) translate(5px,-6px)' : 'none';
        });
        navMenu.querySelectorAll('.nav-link').forEach(l => {
            l.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileBtn.querySelectorAll('.bar').forEach(b => { b.style.transform = 'none'; b.style.opacity = '1'; });
            });
        });
    }

    // ═══ 6. SCROLL: nav shrink + active link ═══
    const sithNav = document.getElementById('sith-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        sithNav.classList.toggle('scrolled', window.scrollY > 60);
        let cur = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
    });

    // ═══ 7. REVEAL + SKILL BARS ═══
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const delay = parseInt(e.target.dataset.delay || 0);
            setTimeout(() => {
                e.target.classList.add('visible');
                e.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
                    setTimeout(() => bar.style.width = bar.dataset.fill + '%', i * 220);
                });
            }, delay);
            revealObs.unobserve(e.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal-item').forEach(el => revealObs.observe(el));

    // ═══ 8. PROJECT CARD side borders (inject elements) ═══
    document.querySelectorAll('.project-card').forEach(card => {
        if (!card.querySelector('.card-side-left')) {
            const l = document.createElement('div'); l.className = 'card-side-left'; card.appendChild(l);
            const r = document.createElement('div'); r.className = 'card-side-right'; card.appendChild(r);
        }
    });

    // ═══ 9. CONTACT FORM ═══
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('button[type=submit]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Yuborildi!';
            btn.style.background = '#115511';
            btn.style.boxShadow = '0 0 20px rgba(0,200,0,0.4)';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.boxShadow = ''; form.reset(); }, 3000);
        });
    }

    // ═══ 10. LOGO GLITCH ═══
    const logo = document.querySelector('.logo');
    if (logo) {
        setInterval(() => {
            if (Math.random() > 0.91) {
                logo.style.textShadow = '2px 0 rgba(255,0,0,0.7),-2px 0 rgba(0,0,255,0.3)';
                setTimeout(() => logo.style.textShadow = '', 80);
                setTimeout(() => { logo.style.textShadow = '-1px 0 rgba(255,0,0,0.5),1px 0 rgba(0,200,255,0.3)'; }, 120);
                setTimeout(() => logo.style.textShadow = '', 190);
            }
        }, 2200);
    }

    // ═══ 11. SABER EDGE PULSE on section change ═══
    const saberL = document.querySelector('.saber-left');
    const saberR = document.querySelector('.saber-right');
    if (saberL && saberR) {
        new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    saberL.style.transition = saberR.style.transition = 'box-shadow 0.25s';
                    saberL.style.boxShadow = saberR.style.boxShadow = '0 0 50px 10px rgba(204,0,0,0.6),0 0 100px 25px rgba(204,0,0,0.25)';
                    setTimeout(() => { saberL.style.boxShadow = ''; saberR.style.boxShadow = ''; }, 700);
                }
            });
        }, { threshold: 0.3 }).observe(document.getElementById('home'));
    }
});
