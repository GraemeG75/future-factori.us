import type { Game } from '../game/Game';
import type { GameState, BuildingInstance } from '../game/GameState';
import { I18n } from '../i18n/index';
import { RESOURCES, RESOURCES_MAP } from '../data/resources';
import { BUILDINGS, BUILDINGS_MAP } from '../data/buildings';
import { RECIPES } from '../data/recipes';
import { TECHNOLOGIES } from '../data/research';
import { TRADE_PARTNERS } from '../data/tradePartners';
import * as EconomySystem from '../systems/EconomySystem';
import * as BuildingSystem from '../systems/BuildingSystem';

const ALERT_DISMISS_MS = 5000;

export class UiController {
  private game: Game;
  private i18n: I18n;
  private buildModeActive: boolean = false;
  private buildTypeId: string | null = null;
  private routeCreationMode: boolean = false;
  private routeFromId: string | null = null;
  private selectedPartnerId: string | null = null;
  private alertTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(game: Game, i18n: I18n) {
    this.game = game;
    this.i18n = i18n;
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------

  init(): void {
    this.populateBuildPanel();
    this.attachSpeedControls();
    this.attachBuildPanelToggle();
    this.attachInfoPanelEvents();
    this.attachBottomNav();
    this.attachScreenCloseButtons();
    this.attachSaveMenuButtons();
    this.attachRoutesScreen();
    this.attachKeyboardShortcuts();
    this.setupSelectionCallback();
  }

  update(state: GameState): void {
    this.updateTopBar(state);
    this.updateResourceBar(state);
    this.updateBuildPanel(state);

    const selected = this.game.getSelectedBuilding();
    if (selected) {
      this.showInfoPanel(selected, state);
    } else {
      this.hideInfoPanel();
    }

    const researchScreen = document.getElementById('research-screen');
    if (researchScreen && !researchScreen.classList.contains('hidden')) {
      this.updateResearchScreen(state);
    }

    const tradeScreen = document.getElementById('trade-screen');
    if (tradeScreen && !tradeScreen.classList.contains('hidden')) {
      this.updateTradeScreen(state);
    }

    const routesScreen = document.getElementById('routes-screen');
    if (routesScreen && !routesScreen.classList.contains('hidden')) {
      this.updateRoutesScreen(state);
    }

    this.syncGameAlerts(state);
  }

  // ----------------------------------------------------------------
  // Screen open/close
  // ----------------------------------------------------------------

  openResearch(): void {
    this.closeAllScreens();
    const el = document.getElementById('research-screen');
    if (el) {
      el.classList.remove('hidden');
      this.updateResearchScreen(this.game.getState());
    }
  }

  closeResearch(): void {
    document.getElementById('research-screen')?.classList.add('hidden');
  }

  openTrade(): void {
    this.closeAllScreens();
    const el = document.getElementById('trade-screen');
    if (el) {
      el.classList.remove('hidden');
      this.updateTradeScreen(this.game.getState());
    }
  }

  closeTrade(): void {
    document.getElementById('trade-screen')?.classList.add('hidden');
  }

  openRoutes(): void {
    this.closeAllScreens();
    const el = document.getElementById('routes-screen');
    if (el) {
      el.classList.remove('hidden');
      this.updateRoutesScreen(this.game.getState());
    }
  }

  closeRoutes(): void {
    document.getElementById('routes-screen')?.classList.add('hidden');
  }

  openMenu(): void {
    this.closeAllScreens();
    document.getElementById('save-screen')?.classList.remove('hidden');
  }

  closeMenu(): void {
    document.getElementById('save-screen')?.classList.add('hidden');
  }

  // ----------------------------------------------------------------
  // Alert system
  // ----------------------------------------------------------------

  addAlert(type: 'info' | 'warning' | 'success' | 'error', message: string): void {
    const list = document.getElementById('alerts-list');
    if (!list) return;

    const id = crypto.randomUUID();
    const item = document.createElement('div');
    item.className = `alert-item ${type}`;
    item.id = `alert-${id}`;
    item.textContent = message;
    list.appendChild(item);

    const timer = setTimeout(() => {
      this.dismissAlert(id);
    }, ALERT_DISMISS_MS);
    this.alertTimers.set(id, timer);
  }

  clearAlerts(): void {
    const list = document.getElementById('alerts-list');
    if (list) list.innerHTML = '';
    for (const timer of this.alertTimers.values()) clearTimeout(timer);
    this.alertTimers.clear();
  }

  // ----------------------------------------------------------------
  // Build mode
  // ----------------------------------------------------------------

  activateBuildMode(typeId: string): void {
    this.buildModeActive = true;
    this.buildTypeId = typeId;
    this.game.setClickOverride((e) => this.onBuildClick(e));
    this.showBuildCursorHint(typeId);
    document.body.style.cursor = 'crosshair';
  }

  deactivateBuildMode(): void {
    this.buildModeActive = false;
    this.buildTypeId = null;
    this.game.setClickOverride(null);
    this.hideBuildCursorHint();
    document.body.style.cursor = '';
    this.syncBuildButtonActive(null);
  }

  // ----------------------------------------------------------------
  // Route creation
  // ----------------------------------------------------------------

  startRouteCreation(fromBuildingId?: string): void {
    this.routeCreationMode = true;
    this.routeFromId = fromBuildingId ?? null;
    this.openRoutes();
    this.addAlert('info', 'Select source and destination for the new route.');
  }

  cancelRouteCreation(): void {
    this.routeCreationMode = false;
    this.routeFromId = null;
  }

  // ----------------------------------------------------------------
  // Private — init helpers
  // ----------------------------------------------------------------

  private setupSelectionCallback(): void {
    this.game.setOnSelect((_id) => {
      // update() is called every frame via onStateChange, so nothing extra needed
    });
  }

  private attachSpeedControls(): void {
    const btnPause = document.getElementById('btn-pause');
    const btn1 = document.getElementById('btn-speed-1');
    const btn2 = document.getElementById('btn-speed-2');
    const btn4 = document.getElementById('btn-speed-4');

    btnPause?.addEventListener('click', () => {
      const state = this.game.getState();
      if (state.settings.gamePaused) {
        this.game.resume();
        btnPause.classList.remove('active');
      } else {
        this.game.pause();
        btnPause.classList.add('active');
      }
    });

    btn1?.addEventListener('click', () => {
      this.game.setSpeed(1);
      this.syncSpeedButtons(1);
    });
    btn2?.addEventListener('click', () => {
      this.game.setSpeed(2);
      this.syncSpeedButtons(2);
    });
    btn4?.addEventListener('click', () => {
      this.game.setSpeed(4);
      this.syncSpeedButtons(4);
    });
  }

  private attachBuildPanelToggle(): void {
    document.getElementById('btn-build-toggle')?.addEventListener('click', () => {
      document.getElementById('build-panel')?.classList.toggle('collapsed');
    });
  }

  private attachInfoPanelEvents(): void {
    document.getElementById('btn-info-close')?.addEventListener('click', () => {
      this.hideInfoPanel();
    });

    document.getElementById('recipe-select')?.addEventListener('change', (e) => {
      const selected = this.game.getSelectedBuilding();
      if (!selected) return;
      const val = (e.target as HTMLSelectElement).value;
      this.game.setRecipe(selected.id, val || null);
    });

    document.getElementById('btn-upgrade')?.addEventListener('click', () => {
      const selected = this.game.getSelectedBuilding();
      if (!selected) return;
      const ok = this.game.upgradeBuilding(selected.id);
      if (!ok) {
        this.addAlert('warning', this.i18n.t('messages.insufficientFunds'));
      } else {
        const bt = BUILDINGS_MAP[selected.typeId];
        const name = bt ? this.i18n.t(bt.nameKey) : selected.typeId;
        this.addAlert('success', this.i18n.t('messages.buildingUpgraded', name, String(selected.level)));
      }
    });

    document.getElementById('btn-demolish')?.addEventListener('click', () => {
      const selected = this.game.getSelectedBuilding();
      if (!selected) return;
      const bt = BUILDINGS_MAP[selected.typeId];
      const name = bt ? this.i18n.t(bt.nameKey) : selected.typeId;
      this.game.demolishBuilding(selected.id);
      this.addAlert('info', this.i18n.t('messages.buildingDemolished', name));
    });

    document.getElementById('btn-create-route')?.addEventListener('click', () => {
      const selected = this.game.getSelectedBuilding();
      this.startRouteCreation(selected?.id);
    });
  }

  private attachBottomNav(): void {
    document.getElementById('btn-research')?.addEventListener('click', () => {
      const screen = document.getElementById('research-screen');
      if (screen?.classList.contains('hidden')) {
        this.openResearch();
      } else {
        this.closeResearch();
      }
    });
    document.getElementById('btn-trade')?.addEventListener('click', () => {
      const screen = document.getElementById('trade-screen');
      if (screen?.classList.contains('hidden')) {
        this.openTrade();
      } else {
        this.closeTrade();
      }
    });
    document.getElementById('btn-routes')?.addEventListener('click', () => {
      const screen = document.getElementById('routes-screen');
      if (screen?.classList.contains('hidden')) {
        this.openRoutes();
      } else {
        this.closeRoutes();
      }
    });
    document.getElementById('btn-menu')?.addEventListener('click', () => {
      const screen = document.getElementById('save-screen');
      if (screen?.classList.contains('hidden')) {
        this.openMenu();
      } else {
        this.closeMenu();
      }
    });
  }

  private attachScreenCloseButtons(): void {
    document.querySelectorAll('.screen-close').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.closeAllScreens();
      });
    });
  }

  private attachSaveMenuButtons(): void {
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.game.newGame();
      this.closeMenu();
      this.addAlert('success', this.i18n.t('messages.newGameStarted'));
    });

    document.getElementById('btn-save-game')?.addEventListener('click', () => {
      this.game.saveGame();
      const status = document.getElementById('save-status');
      if (status) status.textContent = this.i18n.t('messages.gameSaved');
      this.addAlert('success', this.i18n.t('messages.gameSaved'));
    });

    document.getElementById('btn-load-game')?.addEventListener('click', () => {
      const ok = this.game.loadGame();
      const status = document.getElementById('save-status');
      if (ok) {
        if (status) status.textContent = this.i18n.t('messages.gameLoaded');
        this.addAlert('success', this.i18n.t('messages.gameLoaded'));
      } else {
        if (status) status.textContent = 'No save found.';
        this.addAlert('warning', 'No save found.');
      }
    });

    document.getElementById('btn-delete-save')?.addEventListener('click', () => {
      this.game.resetGame();
      const status = document.getElementById('save-status');
      if (status) status.textContent = 'Save deleted.';
      this.closeMenu();
      this.addAlert('info', 'Save deleted. New game started.');
    });
  }

  private attachRoutesScreen(): void {
    document.getElementById('btn-confirm-route')?.addEventListener('click', () => {
      const fromSel = document.getElementById('route-from') as HTMLSelectElement;
      const resSel = document.getElementById('route-resource') as HTMLSelectElement;
      const toSel = document.getElementById('route-to') as HTMLSelectElement;
      if (!fromSel || !resSel || !toSel) return;

      const fromId = fromSel.value;
      const resourceId = resSel.value;
      const toId = toSel.value;
      if (!fromId || !resourceId || !toId) {
        this.addAlert('warning', 'Select all route fields first.');
        return;
      }
      if (fromId === toId) {
        this.addAlert('warning', 'Source and destination must be different.');
        return;
      }

      const ok = this.game.createRoute(fromId, toId, resourceId);
      if (ok) {
        const fromLabel = fromSel.options[fromSel.selectedIndex]?.textContent ?? fromId;
        const toLabel = toSel.options[toSel.selectedIndex]?.textContent ?? toId;
        this.addAlert('success', this.i18n.t('messages.routeCreated', fromLabel, toLabel));
        this.cancelRouteCreation();
        this.updateRoutesScreen(this.game.getState());
      } else {
        this.addAlert('error', 'Failed to create route.');
      }
    });
  }

  private attachKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.buildModeActive) {
          this.deactivateBuildMode();
          return;
        }
        if (this.routeCreationMode) {
          this.cancelRouteCreation();
          return;
        }
        this.closeAllScreens();
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const state = this.game.getState();
        if (state.settings.gamePaused) {
          this.game.resume();
        } else {
          this.game.pause();
        }
      }
    });
  }

  // ----------------------------------------------------------------
  // Private — update helpers
  // ----------------------------------------------------------------

  private updateTopBar(state: GameState): void {
    const cashEl = document.getElementById('cash-value');
    if (cashEl) cashEl.textContent = `$ ${Math.floor(state.cash).toLocaleString()}`;

    const profitEl = document.getElementById('profit-indicator');
    if (profitEl) {
      const profit = EconomySystem.getProfitSinceLastTick(state);
      if (profit > 0) {
        profitEl.textContent = `▲ ${Math.abs(Math.floor(profit))}`;
        profitEl.className = 'positive';
      } else if (profit < 0) {
        profitEl.textContent = `▼ ${Math.abs(Math.floor(profit))}`;
        profitEl.className = 'negative';
      } else {
        profitEl.textContent = '';
      }
    }

    const speed = state.settings.gameSpeed;
    this.syncSpeedButtons(speed);

    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.classList.toggle('active', state.settings.gamePaused);
    }
  }

  private updateResourceBar(state: GameState): void {
    const bar = document.getElementById('resource-bar');
    if (!bar) return;

    bar.innerHTML = '';
    for (const res of RESOURCES) {
      const amt = state.inventory[res.id] ?? 0;
      if (amt <= 0) continue;
      const item = document.createElement('div');
      item.className = 'resource-item';
      item.title = this.i18n.t(res.nameKey);
      item.innerHTML = `<span class="resource-icon">${res.icon}</span><span class="resource-amount">${Math.floor(amt)}</span>`;
      bar.appendChild(item);
    }

    if (state.researchPoints > 0) {
      const rp = document.createElement('div');
      rp.className = 'resource-item';
      rp.title = 'Research Points';
      rp.innerHTML = `<span class="resource-icon">🔬</span><span class="resource-amount">${Math.floor(state.researchPoints)}</span>`;
      bar.appendChild(rp);
    }
  }

  private updateBuildPanel(state: GameState): void {
    // Only repopulate if not yet done (buttons are static, just update locked state)
    const allBtns = document.querySelectorAll('.build-btn');
    allBtns.forEach((btn) => {
      const typeId = (btn as HTMLElement).dataset['buildTypeId'];
      if (!typeId) return;
      const bt = BUILDINGS_MAP[typeId];
      if (!bt) return;
      const unlocked = BuildingSystem.isBuildingTypeUnlocked(state.completedResearch, typeId);
      const canAfford = state.cash >= bt.baseCost;
      btn.classList.toggle('locked', !unlocked);
      btn.classList.toggle('unaffordable', unlocked && !canAfford);
    });
  }

  private showInfoPanel(building: BuildingInstance, state: GameState): void {
    const panel = document.getElementById('info-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    const bt = BUILDINGS_MAP[building.typeId];
    const name = bt ? this.i18n.t(bt.nameKey) : building.typeId;

    const nameEl = document.getElementById('info-building-name');
    if (nameEl) nameEl.textContent = name;

    const levelEl = document.getElementById('info-level');
    if (levelEl) levelEl.textContent = `Level: ${building.level} / ${bt?.maxLevel ?? '?'}`;

    const statusEl = document.getElementById('info-status');
    if (statusEl) {
      statusEl.textContent = building.isPowered ? 'Status: Active' : 'Status: No Power';
      statusEl.style.color = building.isPowered ? '' : '#ff4444';
    }

    // Recipe section
    const recipeSection = document.getElementById('info-recipe-section');
    const prodSection = document.getElementById('info-production-section');
    const recipeSelect = document.getElementById('recipe-select') as HTMLSelectElement | null;

    const isProducer = bt && (bt.category === 'factory' || bt.category === 'harvester' || bt.category === 'refinery');
    if (isProducer && recipeSection && recipeSelect) {
      recipeSection.classList.remove('hidden');
      const buildingRecipes = RECIPES.filter((r) => r.buildingTypeId === building.typeId);
      if (buildingRecipes.length > 0) {
        // Rebuild options only if changed
        const currentOptions = Array.from(recipeSelect.options).map((o) => o.value);
        const newOptions = buildingRecipes.map((r) => r.id);
        if (JSON.stringify(currentOptions) !== JSON.stringify(newOptions)) {
          recipeSelect.innerHTML = '';
          const none = document.createElement('option');
          none.value = '';
          none.textContent = '-- None --';
          recipeSelect.appendChild(none);
          for (const recipe of buildingRecipes) {
            const opt = document.createElement('option');
            opt.value = recipe.id;
            opt.textContent = this.i18n.t(recipe.nameKey);
            recipeSelect.appendChild(opt);
          }
        }
        recipeSelect.value = building.activeRecipeId ?? '';
      }

      if (prodSection && building.activeRecipeId) {
        prodSection.classList.remove('hidden');
        const fill = document.getElementById('production-fill');
        if (fill) fill.style.width = `${Math.min(100, building.productionProgress * 100).toFixed(1)}%`;
        const info = document.getElementById('production-info');
        if (info) info.textContent = `${(building.productionProgress * 100).toFixed(0)}%`;
      } else {
        prodSection?.classList.add('hidden');
      }
    } else {
      recipeSection?.classList.add('hidden');
      prodSection?.classList.add('hidden');
    }

    // Buffers
    this.renderBuffer('input-buffer', 'IN:', building.inputBuffer);
    this.renderBuffer('output-buffer', 'OUT:', building.outputBuffer);

    // Routes
    const routesDiv = document.getElementById('building-routes');
    if (routesDiv) {
      routesDiv.innerHTML = '';
      const routes = state.routes.filter((r) => r.fromBuildingId === building.id || r.toBuildingId === building.id);
      if (routes.length === 0) {
        routesDiv.innerHTML = '<span style="color:#445566;font-size:10px;">No routes</span>';
      }
      for (const route of routes) {
        const fromB = state.buildings.find((b) => b.id === route.fromBuildingId);
        const toB = state.buildings.find((b) => b.id === route.toBuildingId);
        const fromName = fromB ? (BUILDINGS_MAP[fromB.typeId]?.nameKey ? this.i18n.t(BUILDINGS_MAP[fromB.typeId]!.nameKey) : fromB.typeId) : '?';
        const toName = toB ? (BUILDINGS_MAP[toB.typeId]?.nameKey ? this.i18n.t(BUILDINGS_MAP[toB.typeId]!.nameKey) : toB.typeId) : '?';
        const res = RESOURCES_MAP[route.resourceId];
        const resName = res ? res.icon : route.resourceId;

        const row = document.createElement('div');
        row.className = 'route-item';
        row.innerHTML = `<span class="route-label">${resName} ${fromName} → ${toName}</span>`;
        const delBtn = document.createElement('button');
        delBtn.className = 'route-remove-btn';
        delBtn.textContent = '✕';
        delBtn.title = 'Remove route';
        delBtn.addEventListener('click', () => {
          this.game.removeRoute(route.id);
          this.addAlert('info', this.i18n.t('messages.routeDeleted'));
        });
        row.appendChild(delBtn);
        routesDiv.appendChild(row);
      }
    }

    // Upgrade button
    const upgradeBtn = document.getElementById('btn-upgrade') as HTMLButtonElement | null;
    if (upgradeBtn && bt) {
      const atMax = building.level >= bt.maxLevel;
      const cost = this.game.getUpgradeCost(building.id);
      const canAfford = state.cash >= cost;
      upgradeBtn.disabled = atMax || !canAfford;
      upgradeBtn.textContent = atMax ? '⬆ Max Level' : `⬆ Upgrade ($${Math.floor(cost)})`;
    }
  }

  private hideInfoPanel(): void {
    document.getElementById('info-panel')?.classList.add('hidden');
  }

  private updateResearchScreen(state: GameState): void {
    const tree = document.getElementById('research-tree');
    if (!tree) return;

    tree.innerHTML = '';

    // Group techs by tier
    const tiers: Map<number, typeof TECHNOLOGIES> = new Map();
    for (const tech of TECHNOLOGIES) {
      if (!tiers.has(tech.tier)) tiers.set(tech.tier, []);
      tiers.get(tech.tier)!.push(tech);
    }

    const sortedTiers = [...tiers.entries()].sort((a, b) => a[0] - b[0]);
    for (const [tier, techs] of sortedTiers) {
      const col = document.createElement('div');
      col.className = 'research-tier';

      const label = document.createElement('div');
      label.className = 'research-tier-label';
      label.textContent = `Tier ${tier}`;
      col.appendChild(label);

      for (const tech of techs) {
        const isCompleted = state.completedResearch.includes(tech.id);
        const isResearching = state.activeResearch?.technologyId === tech.id;
        const prereqsMet = tech.prerequisites.every((p) => state.completedResearch.includes(p));
        const isAvailable = !isCompleted && !isResearching && prereqsMet;
        const isLocked = !isCompleted && !isResearching && !prereqsMet;

        const card = document.createElement('div');
        card.className = 'tech-card';
        if (isCompleted) card.classList.add('completed');
        else if (isResearching) card.classList.add('researching');
        else if (isAvailable) card.classList.add('available');
        else card.classList.add('locked');

        card.innerHTML = `
          <div class="tech-name">${this.i18n.t(tech.nameKey)}</div>
          <div class="tech-tier-badge">TIER ${tech.tier}</div>
          <div class="tech-cost">$${tech.moneyCost.toLocaleString()} · ${tech.researchPoints}pts</div>
        `;

        if (isResearching && state.activeResearch) {
          const progress = state.activeResearch.progress / tech.researchPoints;
          card.innerHTML += `
            <div class="tech-status researching-label">Researching…</div>
            <div class="tech-progress"><div class="tech-progress-fill" style="width:${(progress * 100).toFixed(1)}%"></div></div>
          `;
        } else if (isCompleted) {
          card.innerHTML += `<div class="tech-status completed-label">✓ Completed</div>`;
        } else if (isAvailable) {
          card.innerHTML += `<div class="tech-status available-label">▶ Click to research</div>`;
          card.addEventListener('click', () => {
            const ok = this.game.startResearch(tech.id);
            if (!ok) {
              this.addAlert('warning', this.i18n.t('messages.insufficientFunds'));
            } else {
              this.addAlert('info', `Researching: ${this.i18n.t(tech.nameKey)}`);
            }
          });
        } else if (isLocked) {
          const prereqNames = tech.prerequisites
            .map((p) => {
              const pt = TECHNOLOGIES.find((t) => t.id === p);
              return pt ? this.i18n.t(pt.nameKey) : p;
            })
            .join(', ');
          card.innerHTML += `<div class="tech-status locked-label">🔒 Requires: ${prereqNames || 'none'}</div>`;
        }

        col.appendChild(card);
      }

      tree.appendChild(col);
    }

    // Active research panel
    const activeInfoEl = document.getElementById('active-research-info');
    const fillEl = document.getElementById('research-fill');
    if (state.activeResearch) {
      const tech = TECHNOLOGIES.find((t) => t.id === state.activeResearch!.technologyId);
      const name = tech ? this.i18n.t(tech.nameKey) : state.activeResearch.technologyId;
      const progress = tech ? state.activeResearch.progress / tech.researchPoints : 0;
      if (activeInfoEl) activeInfoEl.textContent = `Researching: ${name} (${(progress * 100).toFixed(0)}%)`;
      if (fillEl) fillEl.style.width = `${(progress * 100).toFixed(1)}%`;
    } else {
      if (activeInfoEl) activeInfoEl.textContent = 'No active research';
      if (fillEl) fillEl.style.width = '0%';
    }
  }

  private updateTradeScreen(state: GameState): void {
    const partnerList = document.getElementById('partner-list');
    if (partnerList && partnerList.children.length === 0) {
      // Populate partner list once
      for (const partner of TRADE_PARTNERS) {
        const item = document.createElement('div');
        item.className = 'partner-item';
        item.dataset['partnerId'] = partner.id;
        item.innerHTML = `
          <div class="partner-name">${this.i18n.t(partner.nameKey)}</div>
          <div class="partner-desc">${partner.preferredResources.map((r) => RESOURCES_MAP[r]?.icon ?? r).join(' ')}</div>
        `;
        item.addEventListener('click', () => {
          this.selectedPartnerId = partner.id;
          document.querySelectorAll('.partner-item').forEach((el) => el.classList.remove('active'));
          item.classList.add('active');
          this.renderTradeResources(state, partner.id);
        });
        partnerList.appendChild(item);
      }
      if (TRADE_PARTNERS.length > 0 && !this.selectedPartnerId) {
        const first = TRADE_PARTNERS[0];
        if (first) {
          this.selectedPartnerId = first.id;
          partnerList.querySelector('.partner-item')?.classList.add('active');
        }
      }
    }

    if (this.selectedPartnerId) {
      this.renderTradeResources(state, this.selectedPartnerId);
    }
  }

  private renderTradeResources(state: GameState, partnerId: string): void {
    const panel = document.getElementById('selected-partner-info');
    const tradeRes = document.getElementById('trade-resources');
    if (!panel || !tradeRes) return;

    const partner = TRADE_PARTNERS.find((p) => p.id === partnerId);
    if (!partner) return;

    panel.textContent = this.i18n.t(partner.descriptionKey);
    tradeRes.innerHTML = '';

    // Show preferred resources first, then others that have inventory
    const resourcesToShow = [
      ...partner.preferredResources,
      ...Object.keys(state.inventory).filter((r) => !partner.preferredResources.includes(r) && (state.inventory[r] ?? 0) > 0)
    ];

    const seen = new Set<string>();
    for (const resId of resourcesToShow) {
      if (seen.has(resId)) continue;
      seen.add(resId);

      const res = RESOURCES_MAP[resId];
      if (!res) continue;
      const inv = Math.floor(state.inventory[resId] ?? 0);
      const price = EconomySystem.getSellPrice(state, resId, partnerId);
      const demand = EconomySystem.getTradePartnerDemand(state, partnerId, resId);

      const row = document.createElement('div');
      row.className = 'trade-resource-row';
      row.innerHTML = `
        <span class="tr-icon">${res.icon}</span>
        <span class="tr-name">${this.i18n.t(res.nameKey)}</span>
        <span class="tr-inv">In stock: ${inv}</span>
        <span class="tr-price">$${price}/unit</span>
        <span class="tr-demand">Demand: ${(demand * 100).toFixed(0)}%</span>
      `;

      const sellBtn = document.createElement('button');
      sellBtn.className = 'tr-sell-btn';
      sellBtn.textContent = 'SELL 10';
      sellBtn.disabled = inv < 10;
      sellBtn.addEventListener('click', () => {
        const ok = this.game.sell(resId, 10, partnerId);
        if (ok) {
          this.addAlert('success', this.i18n.t('messages.tradeSuccess', '10', this.i18n.t(res.nameKey), String(price * 10)));
        } else {
          this.addAlert('warning', this.i18n.t('messages.insufficientResources'));
        }
      });
      row.appendChild(sellBtn);
      tradeRes.appendChild(row);
    }

    if (tradeRes.children.length === 0) {
      tradeRes.innerHTML = '<div style="color:#445566;padding:16px;">No tradeable resources available.</div>';
    }
  }

  private updateRoutesScreen(state: GameState): void {
    const list = document.getElementById('routes-list');
    if (list) {
      list.innerHTML = '';
      if (state.routes.length === 0) {
        list.innerHTML = `<div style="color:#445566;padding:16px;">${this.i18n.t('ui.routes.noRoutes')}</div>`;
      }
      for (const route of state.routes) {
        const fromB = state.buildings.find((b) => b.id === route.fromBuildingId);
        const toB = state.buildings.find((b) => b.id === route.toBuildingId);
        const fromName = fromB ? (BUILDINGS_MAP[fromB.typeId]?.nameKey ? this.i18n.t(BUILDINGS_MAP[fromB.typeId]!.nameKey) : fromB.typeId) : '?';
        const toName = toB ? (BUILDINGS_MAP[toB.typeId]?.nameKey ? this.i18n.t(BUILDINGS_MAP[toB.typeId]!.nameKey) : toB.typeId) : '?';
        const res = RESOURCES_MAP[route.resourceId];
        const resLabel = res ? `${res.icon} ${this.i18n.t(res.nameKey)}` : route.resourceId;

        const row = document.createElement('div');
        row.className = 'route-row';
        row.innerHTML = `
          <span class="rr-from">${fromName}</span>
          <span class="rr-arrow">→</span>
          <span class="rr-to">${toName}</span>
          <span class="rr-resource">${resLabel}</span>
          <span class="rr-status ${route.isActive ? 'active' : 'inactive'}">${route.isActive ? 'ACTIVE' : 'IDLE'}</span>
          <span class="rr-spacer"></span>
        `;
        const delBtn = document.createElement('button');
        delBtn.className = 'rr-del-btn';
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', () => {
          this.game.removeRoute(route.id);
          this.addAlert('info', this.i18n.t('messages.routeDeleted'));
          this.updateRoutesScreen(this.game.getState());
        });
        row.appendChild(delBtn);
        list.appendChild(row);
      }
    }

    // Populate route creation dropdowns
    this.populateRouteDropdowns(state);
  }

  private populateRouteDropdowns(state: GameState): void {
    const fromSel = document.getElementById('route-from') as HTMLSelectElement | null;
    const toSel = document.getElementById('route-to') as HTMLSelectElement | null;
    const resSel = document.getElementById('route-resource') as HTMLSelectElement | null;
    if (!fromSel || !toSel || !resSel) return;

    // Preserve user selections across frequent UI refreshes.
    const prevFrom = fromSel.value;
    const prevTo = toSel.value;
    const prevResource = resSel.value;

    const buildingOptions = state.buildings
      .map((b) => {
        const bt = BUILDINGS_MAP[b.typeId];
        const name = bt ? this.i18n.t(bt.nameKey) : b.typeId;
        return `<option value="${b.id}">${name} (${b.position.x},${b.position.z})</option>`;
      })
      .join('');

    fromSel.innerHTML = `<option value="">-- From --</option>${buildingOptions}`;

    const validBuildingIds = new Set(state.buildings.map((b) => b.id));
    const fromValue = prevFrom || this.routeFromId || '';
    if (fromValue && validBuildingIds.has(fromValue)) {
      fromSel.value = fromValue;
    }

    const selectedFromId = fromSel.value;
    const destinationOptions = state.buildings
      .filter((b) => {
        const bt = BUILDINGS_MAP[b.typeId];
        if (!bt || bt.category === 'harvester') return false;
        return b.id !== selectedFromId;
      })
      .map((b) => {
        const bt = BUILDINGS_MAP[b.typeId];
        const name = bt ? this.i18n.t(bt.nameKey) : b.typeId;
        return `<option value="${b.id}">${name} (${b.position.x},${b.position.z})</option>`;
      })
      .join('');
    toSel.innerHTML = `<option value="">-- To --</option>${destinationOptions}`;

    const validDestinationIds = new Set(
      state.buildings
        .filter((b) => {
          const bt = BUILDINGS_MAP[b.typeId];
          if (!bt || bt.category === 'harvester') return false;
          return b.id !== selectedFromId;
        })
        .map((b) => b.id)
    );
    if (prevTo && validDestinationIds.has(prevTo)) {
      toSel.value = prevTo;
    }

    const resOptions = RESOURCES.filter((r) => !r.unlockRequirement || state.completedResearch.includes(r.unlockRequirement))
      .map((r) => `<option value="${r.id}">${r.icon} ${this.i18n.t(r.nameKey)}</option>`)
      .join('');
    resSel.innerHTML = `<option value="">-- Resource --</option>${resOptions}`;

    const validResourceIds = new Set(
      RESOURCES.filter((r) => !r.unlockRequirement || state.completedResearch.includes(r.unlockRequirement)).map((r) => r.id)
    );
    if (prevResource && validResourceIds.has(prevResource)) {
      resSel.value = prevResource;
    }

    // Use the selected-building prefill only once when opening route creation.
    if (this.routeFromId && fromSel.value === this.routeFromId) {
      this.routeFromId = null;
    }
  }

  // ----------------------------------------------------------------
  // Build panel population
  // ----------------------------------------------------------------

  private populateBuildPanel(): void {
    const categories: Record<string, string[]> = {
      'harvester-buttons': ['harvester'],
      'factory-buttons': ['factory', 'refinery'],
      'infra-buttons': ['storage', 'research', 'power', 'trade']
    };

    for (const [containerId, catList] of Object.entries(categories)) {
      const container = document.getElementById(containerId);
      if (!container) continue;

      const filtered = BUILDINGS.filter((b) => catList.includes(b.category));
      for (const bt of filtered) {
        const btn = document.createElement('button');
        btn.className = 'build-btn';
        btn.dataset['buildTypeId'] = bt.id;
        btn.innerHTML = `
          <span class="build-btn-name">${this.i18n.t(bt.nameKey)}</span>
          <span class="build-btn-cost">$${bt.baseCost}</span>
        `;
        btn.title = this.i18n.t(bt.descriptionKey);
        btn.addEventListener('click', () => {
          if (btn.classList.contains('locked')) return;
          if (this.buildModeActive && this.buildTypeId === bt.id) {
            this.deactivateBuildMode();
          } else {
            this.activateBuildMode(bt.id);
          }
        });
        container.appendChild(btn);
      }
    }
  }

  // ----------------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------------

  private closeAllScreens(): void {
    document.querySelectorAll('.screen').forEach((el) => el.classList.add('hidden'));
  }

  private syncSpeedButtons(speed: 1 | 2 | 4): void {
    document.getElementById('btn-speed-1')?.classList.toggle('active', speed === 1);
    document.getElementById('btn-speed-2')?.classList.toggle('active', speed === 2);
    document.getElementById('btn-speed-4')?.classList.toggle('active', speed === 4);
  }

  private syncBuildButtonActive(typeId: string | null): void {
    document.querySelectorAll('.build-btn').forEach((btn) => {
      const id = (btn as HTMLElement).dataset['buildTypeId'];
      btn.classList.toggle('active', id === typeId && typeId !== null);
    });
  }

  private onBuildClick(e: MouseEvent): void {
    if (!this.buildTypeId) return;
    const pos = this.game.getWorldPositionFromEvent(e);
    if (!pos) return;
    const ok = this.game.placeBuilding(this.buildTypeId, pos);
    if (ok) {
      const bt = BUILDINGS_MAP[this.buildTypeId];
      const name = bt ? this.i18n.t(bt.nameKey) : this.buildTypeId;
      this.addAlert('success', this.i18n.t('messages.buildingPlaced', name));
    } else {
      this.addAlert('warning', this.i18n.t('messages.insufficientFunds'));
    }
  }

  private showBuildCursorHint(typeId: string): void {
    const bt = BUILDINGS_MAP[typeId];
    const name = bt ? this.i18n.t(bt.nameKey) : typeId;
    let hint = document.getElementById('build-cursor-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'build-cursor-hint';
      document.getElementById('ui-root')?.appendChild(hint);
    }
    hint.textContent = `Placing: ${name} — Click to place · ESC to cancel`;
    hint.style.display = 'block';
    this.syncBuildButtonActive(typeId);
  }

  private hideBuildCursorHint(): void {
    const hint = document.getElementById('build-cursor-hint');
    if (hint) hint.style.display = 'none';
  }

  private renderBuffer(containerId: string, label: string, buffer: Record<string, number>): void {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    const entries = Object.entries(buffer).filter(([, amt]) => amt > 0);
    if (entries.length === 0) {
      el.innerHTML = `<span style="color:#445566;font-size:10px;">${label} empty</span>`;
      return;
    }
    for (const [resId, amt] of entries) {
      const res = RESOURCES_MAP[resId];
      const icon = res?.icon ?? resId;
      const name = res ? this.i18n.t(res.nameKey) : resId;
      const row = document.createElement('div');
      row.className = 'buffer-item';
      row.innerHTML = `<span class="buf-label">${icon} ${name}</span><span class="buf-amount">${Math.floor(amt)}</span>`;
      el.appendChild(row);
    }
  }

  private dismissAlert(id: string): void {
    const item = document.getElementById(`alert-${id}`);
    if (item) {
      item.classList.add('dismissing');
      setTimeout(() => item.remove(), 400);
    }
    const timer = this.alertTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.alertTimers.delete(id);
    }
  }

  private lastAlertTick: number = -1;
  private syncGameAlerts(state: GameState): void {
    // Show new game alerts that arrived since last update
    const newAlerts = state.alerts.filter((a) => a.tick > this.lastAlertTick);
    if (newAlerts.length > 0) {
      this.lastAlertTick = Math.max(...newAlerts.map((a) => a.tick));
      for (const alert of newAlerts) {
        const msg = this.i18n.t(alert.messageKey, ...(alert.params ?? []));
        this.addAlert(alert.type, msg);
      }
    }
  }
}
