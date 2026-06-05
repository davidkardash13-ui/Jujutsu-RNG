(function () {
  'use strict';

  const STORAGE_KEY = 'jujutsu_rng_save_v3';

  const state = {
    casesOpened: 0,
    pity: 0,
    sukunaFingers: 0,
    yen: 0,
    inventory: {},
    selectedCase: 'standard',
    isSpinning: false,
    lastDrop: null,
  };

  let spinAnimation = null;
  let skipResolve = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function loadSave() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) raw = localStorage.getItem('jujutsu_rng_save_v2');
      if (!raw) return;
      const data = JSON.parse(raw);
      state.casesOpened = data.casesOpened ?? 0;
      state.pity = data.pity ?? 0;
      state.sukunaFingers = data.sukunaFingers ?? 0;
      state.yen = data.yen ?? 0;
      state.inventory = data.inventory ?? {};
      state.lastDrop = data.lastDrop ?? null;
      if (!data.sukunaFingers && (state.inventory.sukuna || 0) > 1) {
        state.sukunaFingers = state.inventory.sukuna - 1;
      }
    } catch (_) {
      /* ignore corrupt save */
    }
  }

  function saveGame() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        casesOpened: state.casesOpened,
        pity: state.pity,
        sukunaFingers: state.sukunaFingers,
        yen: state.yen,
        inventory: state.inventory,
        lastDrop: state.lastDrop,
      })
    );
  }

  function formatYen(amount) {
    return `${amount.toLocaleString('ru-RU')} ¥`;
  }

  function getCurrencyReward(rarityId, isDuplicate) {
    const reward = RARITIES[rarityId]?.currencyReward ?? 0;
    if (isDuplicate) return Math.floor(reward * 0.5);
    return reward;
  }

  function grantCurrencyForCharacter(character, isDuplicate) {
    const amount = getCurrencyReward(character.rarity, isDuplicate);
    if (amount > 0) state.yen += amount;
    return amount;
  }

  function getCaseWeights(caseId) {
    const caseDef = CASES[caseId];
    const weights = {};

    for (const [rarityId, rarity] of Object.entries(RARITIES)) {
      if (rarityId === 'event') continue;
      let w = rarity.weight;
      if (caseDef.weightMultiplier[rarityId] !== undefined) {
        w *= caseDef.weightMultiplier[rarityId];
      }
      if (rarity.order < caseDef.minOrder) {
        w = 0;
      }
      if (w > 0) weights[rarityId] = w;
    }

    return weights;
  }

  function rollFromWeights(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total <= 0) return 'below4';
    let roll = Math.random() * total;
    for (const [id, w] of Object.entries(weights)) {
      roll -= w;
      if (roll <= 0) return id;
    }
    return Object.keys(weights)[0];
  }

  function rollRarity(caseId, forceHigh = false) {
    if (forceHigh) {
      const highWeights = {};
      for (const [id, r] of Object.entries(RARITIES)) {
        if (r.order >= PITY_MIN_ORDER && id !== 'event' && r.weight > 0) {
          highWeights[id] = r.weight;
        }
      }
      return rollFromWeights(highWeights);
    }

    return rollFromWeights(getCaseWeights(caseId));
  }

  function pickCharacter(rarityId, caseId) {
    if (rarityId === 'event') rarityId = 'grade1';

    const caseDef = CASES[caseId];
    let pool = CHARACTERS.filter(
      (c) => c.rarity === rarityId && !c.event && !c.evolveOnly
    );

    if (caseDef.minOrder > 0) {
      pool = pool.filter((c) => RARITIES[c.rarity].order >= caseDef.minOrder);
    }

    if (pool.length === 0) {
      pool = CHARACTERS.filter(
        (c) => RARITIES[c.rarity].order >= caseDef.minOrder && !c.event && !c.evolveOnly
      );
    }

    if (pool.length === 0) {
      pool = CHARACTERS.filter((c) => !c.event && !c.evolveOnly);
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickReelFiller() {
    const rollable = Object.keys(RARITIES).filter((id) => id !== 'event' && RARITIES[id].weight > 0);
    const r = rollable[Math.floor(Math.random() * rollable.length)];
    const pool = CHARACTERS.filter((c) => c.rarity === r && !c.event && !c.evolveOnly);
    if (pool.length === 0) return CHARACTERS.find((c) => !c.event && !c.evolveOnly);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function rollEventCase(caseDef, forcePity) {
    const event = EVENTS[caseDef.eventId];
    if (event && Math.random() < event.featuredRate) {
      const featured = getEventCharacter(event.featuredCharacter);
      if (featured) {
        return { character: featured, rarityId: featured.rarity };
      }
    }

    const rarityId = rollRarity(caseDef.id, forcePity);
    const character = pickCharacter(rarityId, caseDef.id);
    return { character, rarityId };
  }

  function openCase() {
    if (state.isSpinning) return false;

    const caseDef = CASES[state.selectedCase];
    if (!caseDef) return false;

    if (caseDef.type === 'event' && !isEventActive(caseDef.eventId)) {
      return false;
    }

    const forcePity = state.pity >= PITY_MAX - 1;
    let character;
    let rarityId;

    if (caseDef.type === 'event') {
      ({ character, rarityId } = rollEventCase(caseDef, forcePity));
    } else {
      rarityId = rollRarity(state.selectedCase, forcePity);
      character = pickCharacter(rarityId, state.selectedCase);
    }

    if (!character) return false;

    if (RARITIES[rarityId].order < PITY_MIN_ORDER && character.rarity !== 'event') {
      state.pity += 1;
    } else {
      state.pity = 0;
    }

    state.casesOpened += 1;

    const isDuplicate = (state.inventory[character.id] || 0) > 0;
    state.inventory[character.id] = (state.inventory[character.id] || 0) + 1;

    let fingerGain = 0;
    if (character.id === FINGER_SOURCE_ID && isDuplicate) {
      state.sukunaFingers += 1;
      fingerGain = 1;
    }

    const yenGain = grantCurrencyForCharacter(character, isDuplicate);

    state.lastDrop = { character, isDuplicate, fingerGain, yenGain };

    saveGame();
    return { character, isDuplicate, rarityId, fingerGain, yenGain };
  }

  function owns(id) {
    return (state.inventory[id] || 0) > 0;
  }

  function getEvolution(evoId) {
    return EVOLUTIONS.find((e) => e.id === evoId);
  }

  function canEvolve(evo) {
    return (
      owns(evo.baseId) &&
      !owns(evo.evolvedId) &&
      state.sukunaFingers >= evo.fingersRequired
    );
  }

  function hasPendingEvolutions() {
    return EVOLUTIONS.some((e) => owns(e.baseId) && !owns(e.evolvedId));
  }

  function shouldShowFingersStat() {
    return state.sukunaFingers > 0 || hasPendingEvolutions();
  }

  function evolveCharacter(evoId) {
    const evo = getEvolution(evoId);
    if (!evo || !canEvolve(evo)) return false;

    state.sukunaFingers -= evo.fingersRequired;
    state.inventory[evo.evolvedId] = 1;
    const evolved = getCharacterById(evo.evolvedId);
    const base = getCharacterById(evo.baseId);
    const yenGain = grantCurrencyForCharacter(evolved, false);
    saveGame();
    return { evolved, base, yenGain };
  }

  function getCharacterById(id) {
    return CHARACTERS.find((c) => c.id === id);
  }

  function buildReelItems(winner, count = 40) {
    const items = [];
    const featured = isEventActive('toji_hunt') ? getEventCharacter('toji') : null;

    for (let i = 0; i < count; i++) {
      if (i === count - 3) {
        items.push(winner);
      } else if (featured && Math.random() < 0.08) {
        items.push(featured);
      } else {
        items.push(pickReelFiller());
      }
    }
    return items;
  }

  function renderReelItem(char) {
    if (!char) return document.createElement('div');
    const r = RARITIES[char.rarity];
    const el = document.createElement('div');
    el.className = 'reel-item' + (char.event ? ' reel-event' : '');
    el.style.setProperty('--item-color', r.color);
    el.style.setProperty('--item-glow', r.glow);
    el.innerHTML = `
      <div class="reel-item-inner">
        <span class="reel-emoji">${char.emoji}</span>
        <span class="reel-name">${char.name}</span>
        <span class="reel-rank">${char.event ? 'EVENT' : r.name}</span>
      </div>
    `;
    return el;
  }

  function animateReel(result) {
    return new Promise((resolve) => {
      const track = $('#reel-track');
      const container = $('#reel-container');
      track.innerHTML = '';
      container.classList.add('spinning');

      const items = buildReelItems(result.character, 36);
      items.forEach((c) => track.appendChild(renderReelItem(c)));

      const itemWidth = 138;
      const winnerIndex = items.length - 3;
      const targetOffset = -(winnerIndex * itemWidth);

      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const duration = 4800;
          track.style.transition = `transform ${duration}ms cubic-bezier(0.08, 0.82, 0.17, 1)`;
          track.style.transform = `translateX(${targetOffset}px)`;

          const onEnd = () => {
            track.removeEventListener('transitionend', onEnd);
            container.classList.remove('spinning');
            const children = track.children;
            if (children[winnerIndex]) {
              children[winnerIndex].classList.add('highlight');
            }
            resolve();
          };

          track.addEventListener('transitionend', onEnd);

          spinAnimation = setTimeout(onEnd, duration + 100);

          skipResolve = () => {
            clearTimeout(spinAnimation);
            track.style.transition = 'transform 0.15s ease-out';
            track.style.transform = `translateX(${targetOffset}px)`;
            setTimeout(onEnd, 160);
          };
        });
      });
    });
  }

  function showResultModal(result) {
    const { character, isDuplicate, fingerGain, yenGain } = result;
    const r = RARITIES[character.rarity];
    const modal = $('#result-modal');

    $('#modal-rarity').textContent = character.event ? '★ ЭВЕНТ · ' + r.name : r.name;
    $('#modal-character').textContent = character.emoji;
    $('#modal-name').textContent = character.name;
    $('#modal-desc').textContent = `${character.desc} · ${character.technique}`;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.setProperty('--modal-color', r.color);
    modalContent.style.setProperty('--modal-glow', r.glow);
    modalContent.dataset.rarity = character.rarity;

    const yenEl = $('#modal-yen');
    if (yenGain > 0) {
      yenEl.textContent = `+${formatYen(yenGain)}`;
      yenEl.classList.remove('hidden');
    } else {
      yenEl.classList.add('hidden');
    }

    const dupEl = $('#modal-duplicate');
    if (result.fingerGain) {
      dupEl.textContent = `+1 палец Сукуны! (всего: ${state.sukunaFingers})`;
      dupEl.classList.remove('hidden');
    } else if (isDuplicate) {
      dupEl.textContent = 'Уже в коллекции — дубликат';
      dupEl.classList.remove('hidden');
    } else {
      dupEl.classList.add('hidden');
    }

    if (window.JJKEffects) {
      const rect = modalContent.getBoundingClientRect();
      window.JJKEffects.burst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        r.color,
        character.rarity === 'secret' ? 55
          : character.event ? 48
          : r.order >= 4 ? 40 : r.order >= 2 ? 28 : 16
      );
      if (character.rarity === 'secret' || character.event || r.order >= 4) {
        window.JJKEffects.screenShake(
          character.rarity === 'secret' ? 1.5
            : character.event ? 1.3
            : r.order >= 5 ? 1.2 : 0.8
        );
      }
      window.JJKEffects.spawnSparks($('#modal-sparks'), r.color);
    }

    modal.classList.remove('hidden');
  }

  function hideResultModal() {
    $('#result-modal').classList.add('hidden');
    updateUI();
    renderLastDrop();
  }

  function renderLastDrop() {
    const box = $('#last-drop');
    const card = $('#drop-card');
    if (!state.lastDrop) {
      box.classList.add('hidden');
      return;
    }
    const { character } = state.lastDrop;
    const r = RARITIES[character.rarity];
    box.classList.remove('hidden');
    card.style.setProperty('--drop-color', r.color);
    card.style.setProperty('--drop-glow', r.glow);
    card.innerHTML = `
      <div class="drop-emoji">${character.emoji}</div>
      <div class="drop-info">
        <div class="drop-rank">${r.name}</div>
        <div class="drop-name">${character.name}</div>
      </div>
    `;
  }

  function updateHeader() {
    $('#cases-opened').textContent = state.casesOpened.toLocaleString('ru-RU');
    $('#yen-balance').textContent = formatYen(state.yen || 0);
    $('#pity-counter').textContent = state.pity;
    const fill = $('#pity-fill');
    if (fill) fill.style.width = `${(state.pity / PITY_MAX) * 100}%`;

    const fingersStat = $('#fingers-stat');
    const fingers = state.sukunaFingers || 0;
    if (fingersStat) {
      if (shouldShowFingersStat()) {
        fingersStat.classList.remove('hidden');
        $('#fingers-count').textContent = fingers;
        const fFill = $('#fingers-fill');
        if (fFill) {
          fFill.style.width = `${Math.min(fingers / FINGERS_REQUIRED, 1) * 100}%`;
        }
      } else {
        fingersStat.classList.add('hidden');
      }
    }
  }

  function updateOpenButton() {
    $('#btn-open').disabled = state.isSpinning;
  }

  function getCollectedCount() {
    return CHARACTERS.filter((c) => (state.inventory[c.id] || 0) > 0).length;
  }

  function renderCollection() {
    const grid = $('#collection-grid');
    const filter = document.querySelector('.filter.active')?.dataset.filter || 'all';
    const sort = $('#sort-select').value;

    let list = [...CHARACTERS];

    if (filter !== 'all') {
      list = list.filter((c) => c.rarity === filter);
    }

    list.sort((a, b) => {
      const ra = RARITIES[a.rarity];
      const rb = RARITIES[b.rarity];
      switch (sort) {
        case 'rarity-desc':
          return rb.order - ra.order || a.name.localeCompare(b.name, 'ru');
        case 'rarity-asc':
          return ra.order - rb.order || a.name.localeCompare(b.name, 'ru');
        case 'count':
          return (state.inventory[b.id] || 0) - (state.inventory[a.id] || 0);
        default:
          return a.name.localeCompare(b.name, 'ru');
      }
    });

    grid.innerHTML = '';

    list.forEach((char, i) => {
      const count = state.inventory[char.id] || 0;
      const r = RARITIES[char.rarity];
      const card = document.createElement('div');
      card.className = `char-card ${count > 0 ? 'owned' : 'not-owned'}${char.event ? ' char-event' : ''}${char.evolveOnly ? ' char-evolve-only' : ''}`;
      card.dataset.rarity = char.rarity;
      if (char.event) card.dataset.event = char.event;
      card.style.setProperty('--rarity-color', r.color);
      card.style.setProperty('--rarity-glow', r.glow);
      card.style.animationDelay = `${i * 0.03}s`;
      card.innerHTML = `
        ${char.evolveOnly && count === 0 ? '<span class="char-evolve-badge">Эволюция</span>' : ''}
        ${char.event && !isEventActive(char.event) && count === 0 ? '<span class="char-event-ended">Эвент завершён</span>' : ''}
        ${count > 1 ? `<span class="char-count">×${count}</span>` : count === 1 ? '<span class="char-count">✓</span>' : ''}
        <div class="char-frame">
          <div class="char-emoji">${char.emoji}</div>
        </div>
        <div class="char-name">${char.name}</div>
        <div class="char-rarity">${char.event ? '★ ' : ''}${r.name}</div>
        <div class="char-technique">${char.technique}</div>
      `;
      grid.appendChild(card);
    });

    $('#collected-count').textContent = getCollectedCount();
    $('#total-count').textContent = CHARACTERS.length;
  }

  function renderEvolution() {
    const list = $('#evo-list');
    const totalEl = $('#evo-fingers-total');
    if (!list) return;

    const fingers = state.sukunaFingers || 0;
    if (totalEl) totalEl.textContent = fingers;

    list.innerHTML = EVOLUTIONS.map((evo) => {
      const base = getCharacterById(evo.baseId);
      const evolved = getCharacterById(evo.evolvedId);
      const owned = owns(evo.baseId);
      const done = owns(evo.evolvedId);
      const ready = canEvolve(evo);
      const req = evo.fingersRequired;

      let statusText;
      let statusClass = '';
      if (done) {
        statusText = 'Эволюция получена';
        statusClass = 'evo-done';
      } else if (!owned) {
        statusText = `Нужен ${base.name}`;
        statusClass = 'evo-locked';
      } else if (ready) {
        statusText = 'Можно эволюционировать!';
        statusClass = 'evo-ready';
      } else {
        statusText = `Нужно ${req} пальцев (есть ${fingers})`;
        statusClass = 'evo-progress';
      }

      return `
        <div class="evo-card ${done ? 'evo-card-done' : ''}">
          <div class="evo-card-glow"></div>
          <div class="evo-characters">
            <div class="evo-char ${owned ? 'owned' : 'locked'}">
              <span class="evo-emoji">${base.emoji}</span>
              <span class="evo-char-name">${base.name}</span>
            </div>
            <div class="evo-arrow-inline">→</div>
            <div class="evo-char ${done ? 'owned' : 'locked'}">
              <span class="evo-emoji">${evolved.emoji}</span>
              <span class="evo-char-name">${evolved.name}</span>
            </div>
          </div>
          <p class="evo-cost">🖐️ ${req} пальцев</p>
          <p class="evo-status ${statusClass}">${statusText}</p>
          <button class="btn-evolve btn-cursed" data-evolve="${evo.id}" ${ready ? '' : 'disabled'}>
            <span class="btn-bg"></span>
            <span class="btn-text">${done ? 'Получено' : ready ? 'Эволюционировать' : 'Недоступно'}</span>
          </button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-evolve]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) handleEvolve(btn.dataset.evolve);
      });
    });
  }

  function showEvolveModal(result) {
    const { evolved, base, yenGain } = result;
    const modal = $('#evolve-modal');
    const r = RARITIES[evolved.rarity];
    $('#evo-from-emoji').textContent = base.emoji;
    $('#evo-to-emoji').textContent = evolved.emoji;
    $('#evo-name').textContent = evolved.name;
    $('#evo-desc').textContent = `${evolved.desc} · ${evolved.technique}${yenGain ? ' · ' + formatYen(yenGain) : ''}`;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.setProperty('--modal-color', r.color);
    modalContent.style.setProperty('--modal-glow', r.glow);

    if (window.JJKEffects) {
      window.JJKEffects.screenShake(1.4);
      const rect = modalContent.getBoundingClientRect();
      window.JJKEffects.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, r.color, 50);
    }

    modal.classList.remove('hidden');
  }

  function handleEvolve(evoId) {
    const result = evolveCharacter(evoId);
    if (!result) return;
    showEvolveModal(result);
    updateUI();
  }

  function hideEvolveModal() {
    $('#evolve-modal').classList.add('hidden');
    renderEvolution();
    renderCollection();
  }

  function renderRates() {
    const table = $('#rates-table');
    const caseId = state.selectedCase;
    const caseDef = CASES[caseId];
    const note = $('#rates-note') || document.querySelector('.rates-note');

    if (note) {
      if (caseDef.type === 'event' && isEventActive(caseDef.eventId)) {
        const ev = EVENTS[caseDef.eventId];
        note.textContent = `Эвентовый кейс «${ev.name}». Тодзи — ~${(ev.featuredRate * 100).toFixed(1)}% за открытие.`;
      } else {
        note.textContent = `${caseDef.name}. Элитный и особый кейсы модифицируют распределение.`;
      }
    }

    if (caseDef.type === 'event' && isEventActive(caseDef.eventId)) {
      const ev = EVENTS[caseDef.eventId];
      const weights = getCaseWeights(caseId);
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      const featuredPct = (ev.featuredRate * 100).toFixed(2);
      const otherPct = ((1 - ev.featuredRate) * 100).toFixed(2);

      let rows = `
        <div class="rate-row rate-row-featured" style="--rate-color: ${RARITIES.event.color}">
          <span class="rate-name">★ Тодзи Фушигуро (эвент)</span>
          <div class="rate-bar-wrap">
            <div class="rate-bar" style="width: ${featuredPct}%"></div>
          </div>
          <span class="rate-percent">${featuredPct}%</span>
        </div>
        <div class="rate-row rate-row-muted">
          <span class="rate-name">Остальные (${otherPct}%)</span>
        </div>
      `;

      const sorted = Object.entries(RARITIES)
        .filter(([id]) => id !== 'event' && weights[id] > 0)
        .sort((a, b) => b[1].order - a[1].order);

      rows += sorted.map(([id, r]) => {
        const pct = (((weights[id] / total) * (1 - ev.featuredRate)) * 100).toFixed(2);
        return `
          <div class="rate-row" style="--rate-color: ${r.color}">
            <span class="rate-name">${r.name}</span>
            <div class="rate-bar-wrap">
              <div class="rate-bar" style="width: ${Math.min(parseFloat(pct) * 3, 100)}%"></div>
            </div>
            <span class="rate-percent">${pct}%</span>
          </div>
        `;
      }).join('');

      table.innerHTML = rows;
      return;
    }

    const weights = getCaseWeights(caseId);
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(RARITIES).sort((a, b) => b[1].order - a[1].order);

    table.innerHTML = sorted
      .filter(([id]) => weights[id] > 0)
      .map(([id, r]) => {
        const pct = ((weights[id] / total) * 100).toFixed(2);
        return `
          <div class="rate-row" style="--rate-color: ${r.color}">
            <span class="rate-name">${r.name}</span>
            <div class="rate-bar-wrap">
              <div class="rate-bar" style="width: ${pct}%"></div>
            </div>
            <span class="rate-percent">${pct}%</span>
          </div>
        `;
      })
      .join('');
  }

  function renderYenTable() {
    const table = $('#yen-table');
    if (!table) return;

    const sorted = Object.entries(RARITIES).sort((a, b) => b[1].order - a[1].order);

    table.innerHTML = sorted
      .filter(([, r]) => r.currencyReward)
      .map(([, r]) => {
        const dup = Math.floor(r.currencyReward * 0.5);
        return `
          <div class="rate-row" style="--rate-color: ${r.color}">
            <span class="rate-name">${r.name}</span>
            <span class="rate-percent yen-reward">${formatYen(r.currencyReward)} <span class="yen-dup">/ ${formatYen(dup)} дубль</span></span>
          </div>
        `;
      })
      .join('');
  }

  function initReelPlaceholder() {
    const track = $('#reel-track');
    track.innerHTML = '';
    const sample = [...CHARACTERS].sort(() => Math.random() - 0.5).slice(0, 10);
    sample.forEach((c) => track.appendChild(renderReelItem(c)));
  }

  function formatTimeLeft(ms) {
    if (ms <= 0) return 'Завершён';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (d > 0) return `${d}д ${h}ч ${m}м`;
    if (h > 0) return `${h}ч ${m}м ${s}с`;
    return `${m}м ${s}с`;
  }

  function updateEventUI() {
    const active = getActiveEvents();
    const banner = $('#event-banner');
    const eventCase = $('#event-case-card');

    if (active.length === 0) {
      banner?.classList.add('hidden');
      eventCase?.classList.add('hidden');
      if (state.selectedCase === 'event') {
        state.selectedCase = 'standard';
        $$('.case-card').forEach((c) => c.classList.remove('selected'));
        $('.case-card[data-case="standard"]')?.classList.add('selected');
      }
      return;
    }

    const ev = active[0];
    banner?.classList.remove('hidden');
    eventCase?.classList.remove('hidden');

    $('#event-title').textContent = ev.name;
    $('#event-subtitle').textContent = ev.subtitle;

    const left = ev.end - Date.now();
    $('#event-timer').textContent = formatTimeLeft(left);
  }

  function renderChangelog() {
    const list = $('#changelog-list');
    if (!list || typeof CHANGELOG === 'undefined') return;

    list.innerHTML = CHANGELOG.map((entry) => {
      const tags = (entry.tags || [])
        .map((t) => `<span class="changelog-tag tag-${t}">${TAG_LABELS[t] || t}</span>`)
        .join('');

      const items = entry.changes
        .map((c) => `<li>${c}</li>`)
        .join('');

      return `
        <article class="changelog-entry">
          <div class="changelog-entry-head">
            <div>
              <span class="changelog-version">v${entry.version}</span>
              <h3 class="changelog-entry-title">${entry.title}</h3>
            </div>
            <time class="changelog-date">${formatChangelogDate(entry.date)}</time>
          </div>
          <div class="changelog-tags">${tags}</div>
          <ul class="changelog-changes">${items}</ul>
        </article>
      `;
    }).join('');
  }

  function formatChangelogDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function updateUI() {
    updateEventUI();
    updateHeader();
    updateOpenButton();
    renderCollection();
    renderRates();
    renderYenTable();
    renderChangelog();
    renderEvolution();
  }

  async function handleOpen() {
    let result;
    try {
      result = openCase();
    } catch (err) {
      console.error('openCase error:', err);
      return;
    }
    if (!result || !result.character) return;

    state.isSpinning = true;
    updateOpenButton();
    $('#btn-skip').classList.remove('hidden');

    await animateReel(result);

    $('#btn-skip').classList.add('hidden');
    skipResolve = null;
    state.isSpinning = false;

    showResultModal(result);
    updateHeader();
  }

  function setupTabs() {
    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.tab').forEach((t) => t.classList.remove('active'));
        $$('.panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        $(`#tab-${tab.dataset.tab}`).classList.add('active');
        if (tab.dataset.tab === 'collection') renderCollection();
        if (tab.dataset.tab === 'evolution') renderEvolution();
      });
    });
  }

  function setupCaseSelector() {
    $$('.case-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (state.isSpinning) return;
        $$('.case-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedCase = card.dataset.case;
        renderRates();
      });
    });
  }

  function setupFilters() {
    $$('.filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.filter').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderCollection();
      });
    });
    $('#sort-select').addEventListener('change', renderCollection);
  }

  function setupEvents() {
    $('#btn-open').addEventListener('click', handleOpen);
    $('#btn-skip').addEventListener('click', () => {
      if (skipResolve) skipResolve();
    });
    $('#btn-claim').addEventListener('click', hideResultModal);
    $('#btn-evo-close').addEventListener('click', hideEvolveModal);
    $('#evolve-modal .modal-backdrop').addEventListener('click', hideEvolveModal);
    $('#result-modal .modal-backdrop').addEventListener('click', hideResultModal);
    $('#btn-reset').addEventListener('click', () => {
      if (confirm('Сбросить весь прогресс? Это нельзя отменить.')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
  }

  function init() {
    loadSave();
    setupTabs();
    setupCaseSelector();
    setupFilters();
    setupEvents();
    initReelPlaceholder();
    updateUI();
    renderLastDrop();
    setInterval(updateEventUI, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
