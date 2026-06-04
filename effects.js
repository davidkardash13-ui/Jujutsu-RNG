(function () {
  'use strict';

  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w = 0;
  let h = 0;
  let raf = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function spawn(count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.7 ? 0 : 270 + Math.random() * 40,
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function burst(x, y, color, count = 24) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = Math.random() * 4 + 2;
      particles.push({
        x,
        y,
        r: Math.random() * 3 + 1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        hue: 0,
        life: 60,
        color,
      });
    }
  }

  function tickWithBurst() {
    ctx.clearRect(0, 0, w, h);
    particles = particles.filter((p) => {
      if (p.life !== undefined) {
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha = p.life / 60;
        if (p.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color || `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
        ctx.fill();
        return true;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
      ctx.fill();
      return true;
    });
    raf = requestAnimationFrame(tickWithBurst);
  }

  resize();
  spawn(Math.min(80, Math.floor(w / 20)));
  window.addEventListener('resize', () => {
    resize();
  });

  tickWithBurst();

  window.JJKEffects = {
    burst(x, y, color, count) {
      burst(x, y, color, count);
    },
    screenShake(intensity = 1) {
      document.body.style.animation = 'none';
      document.body.offsetHeight;
      document.body.style.animation = `screenShake ${0.4 * intensity}s ease`;
    },
    spawnSparks(container, color) {
      container.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.style.setProperty('--spark-color', color);
        s.style.setProperty('--spark-x', `${(Math.random() - 0.5) * 200}px`);
        s.style.setProperty('--spark-y', `${(Math.random() - 0.5) * 200}px`);
        s.style.animationDelay = `${Math.random() * 0.3}s`;
        container.appendChild(s);
      }
    },
  };
})();
