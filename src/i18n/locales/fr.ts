import type { Locale } from './en';

export const fr: Locale = {
  resources: {
    wood: {
      name: 'Bois',
      description: 'Raw timber harvested from forests. Essential for early production.',
    },
    coal: {
      name: 'Charbon',
      description: 'A combustible rock used as fuel and in smelting processes.',
    },
    iron_ore: {
      name: 'Minerai de fer',
      description: 'Raw iron-bearing rock extracted from mines. Refined into steel.',
    },
    water: {
      name: 'Eau',
      description: 'A universal solvent and coolant, vital for many processes.',
    },
    steel: {
      name: 'Acier',
      description: 'A strong alloy of iron and carbon, the backbone of industry.',
    },
    basic_components: {
      name: 'Composants de base',
      description: 'Simple manufactured parts used in a wide variety of applications.',
    },
    circuits: {
      name: 'Circuits',
      description: 'Electronic circuit boards enabling automated and digital systems.',
    },
    fuel: {
      name: 'Carburant',
      description: 'Processed combustible liquid powering vehicles and machinery.',
    },
    silicon: {
      name: 'Silicium',
      description: 'Purified semiconductor material required for circuit fabrication.',
    },
    uranium: {
      name: 'Uranium',
      description: 'Radioactive heavy metal used in advanced energy systems.',
    },
    plasma_crystals: {
      name: 'Cristaux de plasma',
      description: 'Exotic crystalline structures that store immense plasma energy.',
    },
    dark_matter_residue: {
      name: 'Résidu de matière noire',
      description: 'Mysterious residue left by dark matter interactions. Extremely rare.',
    },
    quantum_foam: {
      name: 'Mousse quantique',
      description: 'Captured quantum-scale fluctuations of space-time. Highly unstable.',
    },
    synthetic_bio_gel: {
      name: 'Bio-gel synthétique',
      description: 'Engineered biological substrate used in advanced biotech manufacturing.',
    },
    antimatter_particles: {
      name: 'Particules d\'antimatière',
      description: 'Magnetically contained antimatter. The most energetic substance known.',
    },
    antimatter_core: {
      name: 'Cœur d\'antimatière',
      description: 'A stabilised antimatter core — the most powerful energy source ever created.',
    },
    exotic_cores: {
      name: 'Noyaux exotiques',
      description: 'Ultra-dense energy cores formed from plasma crystals and quantum foam.',
    },
    nano_alloy: {
      name: 'Nano-alliage',
      description: 'Steel reinforced at the nanoscale by dark matter residue. Impossibly strong.',
    },
    bio_circuits: {
      name: 'Bio-circuits',
      description: 'Hybrid biological-electronic circuits with self-repair capabilities.',
    },
    advanced_components: {
      name: 'Composants avancés',
      description: 'Precision-engineered parts used in high-tier manufacturing.',
    },
  },

  buildings: {
    wood_harvester: {
      name: 'Récolteuse de bois',
      description: 'Automatically harvests wood from nearby forest tiles.',
    },
    coal_mine: {
      name: 'Mine de charbon',
      description: 'Extracts coal from underground seams.',
    },
    iron_mine: {
      name: 'Mine de fer',
      description: 'Drills into iron ore deposits and extracts raw ore.',
    },
    water_pump: {
      name: 'Pompe à eau',
      description: 'Draws water from underground aquifers or surface sources.',
    },
    basic_factory: {
      name: 'Usine de base',
      description: 'Produces basic components from raw materials.',
    },
    smelter: {
      name: 'Fonderie',
      description: 'Smelts iron ore and coal into steel ingots.',
    },
    circuit_fab: {
      name: 'Fabricant de circuits',
      description: 'Fabricates electronic circuits from silicon and water. Requires silicon extraction technology.',
    },
    refinery: {
      name: 'Raffinerie',
      description: 'Processes coal and water into refined fuel.',
    },
    storage_depot: {
      name: 'Dépôt de stockage',
      description: 'Stores large quantities of resources for distribution.',
    },
    research_center: {
      name: 'Centre de recherche',
      description: 'Generates research points used to unlock new technologies.',
    },
    trading_terminal: {
      name: 'Terminal de commerce',
      description: 'Connects your factory network to external trading partners.',
    },
    power_plant: {
      name: 'Centrale électrique',
      description: 'Burns coal to generate electrical power for your facilities.',
    },
    silicon_extractor: {
      name: 'Extracteur de silicium',
      description: 'Extracts and purifies silicon from sand deposits. Requires silicon extraction research.',
    },
    uranium_extractor: {
      name: 'Extracteur d\'uranium',
      description: 'Safely mines and processes uranium ore. Requires uranium mining research.',
    },
    exotic_lab: {
      name: 'Laboratoire exotique',
      description: 'Synthesises exotic materials from advanced inputs. Requires plasma tech research.',
    },
    quantum_forge: {
      name: 'Forge quantique',
      description: 'Prototype factory that manipulates matter at the quantum level. Requires antimatter containment.',
    },
    fusion_plant: {
      name: 'Centrale à fusion',
      description: 'Generates enormous clean energy through nuclear fusion. Requires fusion reactor research.',
    },
    bio_reactor: {
      name: 'Bio-réacteur',
      description: 'Prototype bio-industrial reactor for advanced organic synthesis. Requires advanced biotech.',
    },
    singularity_tap: {
      name: 'Robinet de singularité',
      description: 'Extracts near-infinite energy from a controlled singularity. Requires singularity engine research.',
    },
    mind_matrix: {
      name: 'Matrice mentale',
      description: 'Uploaded consciousness network providing massive research acceleration. Requires consciousness upload.',
    },
    reality_forge: {
      name: 'Forge de la réalité',
      description: 'The ultimate prototype: a device that can bend the laws of physics. Requires reality engineering.',
    },
  },

  recipes: {
    wood_to_components: {
      name: 'Composants de base',
      description: 'Convert wood and coal into basic manufactured components.',
    },
    ore_to_steel: {
      name: 'Fonte d\'acier',
      description: 'Smelt iron ore and coal into steel ingots.',
    },
    silicon_circuits: {
      name: 'Fabrication de circuits',
      description: 'Fabricate circuits from silicon wafers and distilled water.',
    },
    coal_fuel: {
      name: 'Raffinage du carburant',
      description: 'Refine coal and water into combustible fuel.',
    },
    steel_components: {
      name: 'Composants avancés',
      description: 'Manufacture precision advanced components from steel and basic parts.',
    },
    plasma_exotic: {
      name: 'Synthèse de noyau exotique',
      description: 'Synthesise exotic cores from plasma crystals and quantum foam.',
    },
    nano_alloy: {
      name: 'Forge de nano-alliage',
      description: 'Forge nano alloy by infusing steel with dark matter residue.',
    },
    bio_circuits: {
      name: 'Assemblage de bio-circuits',
      description: 'Assemble bio-circuits by combining standard circuits with synthetic bio-gel.',
    },
    uranium_fuel: {
      name: 'Traitement du combustible uranium',
      description: 'Process uranium and water into high-yield nuclear fuel.',
    },
    antimatter_core: {
      name: 'Assemblage du cœur d\'antimatière',
      description: 'Assemble an antimatter core from antimatter particles and an exotic core.',
    },
    wood_charcoal: {
      name: 'Production de charbon de bois',
      description: 'Char wood into coal as an early-game fuel source.',
    },
    fusion_power: {
      name: 'Génération d\'énergie par fusion',
      description: 'Generate power through deuterium-tritium nuclear fusion.',
    },
    nano_bio_gel: {
      name: 'Synthèse nano bio-gel',
      description: 'Combine nano alloy and synthetic bio-gel into an advanced biological compound.',
    },
    void_energy: {
      name: 'Extraction d\'énergie du vide',
      description: 'Draw pure energy from the singularity tap.',
    },
    neural_substrate: {
      name: 'Fabrication de substrat neural',
      description: 'Fabricate the biological substrate used for consciousness upload.',
    },
    reality_shard: {
      name: 'Forge d\'éclat de réalité',
      description: 'Forge a crystallised fragment of rewritten physical law.',
    },
  },

  research: {
    silicon_extraction: {
      name: 'Extraction du silicium',
      description: 'Develop techniques to extract and purify silicon from raw sand deposits.',
    },
    advanced_fabrication: {
      name: 'Fabrication avancée',
      description: 'Precision manufacturing processes for higher-tier components.',
    },
    uranium_mining: {
      name: 'Extraction d\'uranium',
      description: 'Safe extraction and handling protocols for radioactive uranium ore.',
    },
    plasma_tech: {
      name: 'Technologie plasma',
      description: 'Harness and contain plasma energy for industrial applications.',
    },
    dark_matter_research: {
      name: 'Recherche sur la matière noire',
      description: 'Study and manipulate dark matter residue for exotic material production.',
    },
    quantum_physics: {
      name: 'Physique quantique',
      description: 'Capture and stabilise quantum foam for use in advanced manufacturing.',
    },
    biotech: {
      name: 'Biotechnologie',
      description: 'Engineer biological substrates for hybrid circuit production.',
    },
    antimatter_containment: {
      name: 'Confinement de l\'antimatière',
      description: 'Magnetic containment fields capable of safely storing antimatter particles.',
    },
    fast_routes: {
      name: 'Routes rapides',
      description: 'Optimise transport route scheduling to increase logistics throughput.',
    },
    automation: {
      name: 'Automatisation',
      description: 'Automated control systems that improve building efficiency.',
    },
    fusion_reactor: {
      name: 'Réacteur à fusion',
      description: 'Achieve sustained nuclear fusion to generate virtually unlimited clean power.',
    },
    advanced_biotech: {
      name: 'Biotechnologie avancée',
      description: 'Merge dark matter with biological systems to create next-generation organic materials.',
    },
    singularity_engine: {
      name: 'Moteur de singularité',
      description: 'Harness a controlled singularity as a near-infinite power source. The ultimate energy technology.',
    },
    consciousness_upload: {
      name: 'Téléchargement de conscience',
      description: 'Digitise human consciousness to create an ever-growing research super-intelligence.',
    },
    reality_engineering: {
      name: 'Ingénierie de la réalité',
      description: 'Manipulate the fundamental laws of physics itself. The pinnacle of matter science.',
    },
  },

  tradePartners: {
    industrial_corp: {
      name: 'Corp Industrielle',
      description: 'A large industrial conglomerate hungry for steel, components and circuits.',
    },
    energy_traders: {
      name: 'Négociants en énergie',
      description: 'Specialist energy brokers who pay premium prices for fuel and radioactive materials.',
    },
    research_institute: {
      name: 'Institut de recherche',
      description: 'A cutting-edge research organisation that buys exotic materials at top prices.',
    },
    colony_supply: {
      name: 'Approvisionnement colonial',
      description: 'Supplies interplanetary colonies with steady demand for essential goods.',
    },
    black_market: {
      name: 'Marché noir',
      description: 'Off-books traders offering double market rates for rare and dangerous materials.',
    },
    terraformers: {
      name: 'Collectif des terraformeurs',
      description: 'Planetary engineers who need bio-materials and water for large-scale terraforming projects.',
    },
  },

  ui: {
    buildMenu: {
      title: 'Construire',
      categories: {
        harvester: 'Récolteurs',
        factory: 'Usines',
        refinery: 'Raffineries',
        storage: 'Stockage',
        research: 'Recherche',
        power: 'Énergie',
        trade: 'Commerce',
        prototype: 'Prototypes',
      },
      cost: 'Coût',
      maintenance: 'Maintenance',
      power: 'Énergie',
      locked: 'Verrouillé',
      requiresResearch: 'Nécessite : {0}',
    },
    research: {
      title: 'Recherche',
      available: 'Disponible',
      inProgress: 'En cours',
      completed: 'Terminé',
      cost: 'Coût',
      duration: 'Durée',
      prerequisites: 'Prérequis',
      start: 'Démarrer la recherche',
      cancel: 'Annuler',
      progress: 'Progression',
      seconds: '{0}s',
      points: '{0} pts',
      money: '{0} €',
    },
    trade: {
      title: 'Commerce',
      partners: 'Partenaires',
      buy: 'Acheter',
      sell: 'Vendre',
      price: 'Prix',
      demand: 'Demande',
      noPartners: 'Aucun partenaire commercial débloqué.',
      confirmSell: 'Vendre {0} {1} pour {2} $ ?',
      confirmBuy: 'Acheter {0} {1} pour {2} $ ?',
    },
    routes: {
      title: 'Routes',
      newRoute: 'Nouvelle route',
      from: 'De',
      to: 'À',
      resource: 'Ressource',
      amount: 'Quantité',
      interval: 'Intervalle',
      active: 'Actif',
      inactive: 'Inactif',
      delete: 'Supprimer',
      noRoutes: 'Aucune route configurée.',
    },
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      graphicsQuality: 'Qualité graphique',
      soundVolume: 'Volume sonore',
      musicVolume: 'Volume de la musique',
      save: 'Sauvegarder',
      load: 'Charger',
      newGame: 'Nouvelle partie',
      confirmNewGame: 'Démarrer une nouvelle partie ? La progression non sauvegardée sera perdue.',
      apply: 'Appliquer',
      cancel: 'Annuler',
    },
    hud: {
      money: 'Argent',
      researchPoints: 'Points de recherche',
      power: 'Énergie',
      tick: 'Tick',
      pause: 'Pause',
      resume: 'Reprendre',
      speed1x: '1x',
      speed2x: '2x',
      speed4x: '4x',
    },
    tooltips: {
      upgrade: 'Améliorer au niveau {0}',
      demolish: 'Démolir le bâtiment',
      assignRecipe: 'Assigner une recette',
      viewStats: 'Voir les statistiques',
    },
  },

  messages: {
    buildingPlaced: '{0} placé avec succès.',
    buildingDemolished: '{0} démoli.',
    buildingUpgraded: '{0} amélioré au niveau {1}.',
    researchComplete: 'Recherche terminée : {0}',
    routeCreated: 'Route créée de {0} à {1}.',
    routeDeleted: 'Route supprimée.',
    insufficientFunds: 'Fonds insuffisants.',
    insufficientResources: 'Ressources insuffisantes.',
    insufficientPower: 'Énergie insuffisante.',
    storageFullFor: 'Stockage plein pour {0}.',
    unlocked: '{0} débloqué !',
    tradeSuccess: 'Commerce réalisé : {0} {1} pour {2} $.',
    tradeFailed: 'Commerce échoué : {0}.',
    gameSaved: 'Partie sauvegardée.',
    gameLoaded: 'Partie chargée.',
    newGameStarted: 'Nouvelle partie lancée. Bonne chance, Directeur !',
    buildingRepaired: '{0} réparé.',
    repairTooExpensive: 'Impossible de payer la réparation.',
    buildingBroken: '{0} est en panne et doit être réparé !',
  },

  alerts: {
    research_complete: 'Recherche terminée : {0} — {1} débloqué',
    building_breakdown: '{0} a subi une panne ! Réparez-le pour restaurer l\'efficacité.',
    deposit_low: 'Dépôt presque épuisé — {1} presque vide !',
    deposit_depleted: 'Dépôt épuisé — {1} est complètement vide.',
    achievement_unlocked: '{1} Succès débloqué : {0}',
    contract_new: 'Nouveau contrat : livrer {1}× {0} pour {2} $ !',
    contract_completed: 'Contrat terminé ! {0} livré — {1} $ gagnés.',
    contract_failed: 'Contrat échoué ! Impossible de livrer {0} — pénalité de {1} $ déduite.',
    loan_taken: 'Prêt de {0} $ reçu.',
    loan_repaid: 'Prêt de {0} $ entièrement remboursé !',
    loan_overdue: 'Prêt en retard ! Solde {0} $ — payez maintenant pour éviter les pénalités.',
  },

  events: {
    trade_embargo: '⚠️ Embargo commercial ! {0} refuse les échanges — prix réduits.',
    resource_boom: '📈 Boom des ressources ! Le prix de {0} monte en flèche.',
    market_crash: '📉 Effondrement du marché ! Tous les prix chutent fortement.',
    subsidy: '💰 Subvention gouvernementale ! Prix de {0} augmentés.',
    tech_demand_surge: '🔬 Hausse de la demande technologique ! Prix de {0} doublés brièvement.',
    pollution_fine: '🌫️ Amende de pollution ! Prix supprimés en raison de violations environnementales.',
  },

  achievements: {
    first_building: {
      name: 'Premiers pas',
      description: 'Placez votre premier bâtiment.',
    },
    power_up: {
      name: 'Mise sous tension',
      description: 'Construisez une centrale électrique.',
    },
    first_sale: {
      name: 'Marchand',
      description: 'Réalisez votre premier commerce.',
    },
    five_buildings: {
      name: 'Usine en croissance',
      description: 'Placez 5 bâtiments.',
    },
    ten_buildings: {
      name: 'Complexe industriel',
      description: 'Placez 10 bâtiments.',
    },
    first_research: {
      name: 'Chercheur',
      description: 'Terminez votre première recherche.',
    },
    cash_1k: {
      name: 'Petite monnaie',
      description: 'Accumulez 1 000 $.',
    },
    cash_10k: {
      name: 'Entreprise rentable',
      description: 'Accumulez 10 000 $.',
    },
    cash_100k: {
      name: 'Tycoon',
      description: 'Accumulez 100 000 $.',
    },
    five_routes: {
      name: 'Réseau logistique',
      description: 'Créez 5 routes de transport.',
    },
    repair_crew: {
      name: 'Équipe de réparation',
      description: 'Réparez un bâtiment en panne.',
    },
    polluter: {
      name: 'Problème de pollution',
      description: 'Laissez la pollution atteindre le niveau 50.',
    },
    clean_factory: {
      name: 'Industrie propre',
      description: 'Maintenez une faible pollution avec 5+ bâtiments.',
    },
    deposit_depleted: {
      name: 'Dépôt épuisé',
      description: 'Épuisez complètement un dépôt de ressources.',
    },
    first_contract: {
      name: 'Faiseur d\'accords',
      description: 'Terminez votre premier contrat de livraison.',
    },
    ten_contracts: {
      name: 'Roi des contrats',
      description: 'Terminez 10 contrats de livraison.',
    },
    first_loan: {
      name: 'Endetté',
      description: 'Souscrivez votre premier prêt.',
    },
    debt_free: {
      name: 'Sans dette',
      description: 'Remboursez tous les prêts en cours.',
    },
    market_event: {
      name: 'Observateur du marché',
      description: 'Assistez à un événement de marché.',
    },
    tier5_research: {
      name: 'Post-Singularité',
      description: 'Terminez une recherche de niveau 5 Post-Singularité.',
    },
    synergy_active: {
      name: 'Synergie !',
      description: 'Débloquez un bonus de synergie de production inter-technologique.',
    },
    prototype_built: {
      name: 'Ingénieur prototype',
      description: 'Construisez une structure de classe Prototype.',
    },
  },

  controls: {
    title: 'Contrôles',
    rotate: 'Faire pivoter la caméra',
    pan: 'Déplacer la caméra',
    zoom: 'Zoom',
    placeBuilding: 'Placer un bâtiment',
    cancelPlacement: 'Annuler le placement',
    selectBuilding: 'Sélectionner un bâtiment',
    openBuildMenu: 'Ouvrir le menu de construction',
    openResearch: 'Ouvrir la recherche',
    openTrade: 'Ouvrir le commerce',
    openRoutes: 'Ouvrir les routes',
    openSettings: 'Ouvrir les paramètres',
    pauseResume: 'Pause / Reprendre',
    speedUp: 'Accélérer',
    slowDown: 'Ralentir',
    keys: {
      leftClick: 'Clic gauche',
      rightClickDrag: 'Clic droit + Glisser',
      middleClickDrag: 'Clic molette + Glisser',
      scrollWheel: 'Molette de défilement',
      escape: 'Échap',
      b: 'B',
      r: 'R',
      t: 'T',
      l: 'L',
      s: 'S',
      space: 'Espace',
      plus: '+',
      minus: '-',
    },
  },

  scenarios: {
    tutorial: {
      name: 'Tutoriel',
      description: 'Apprenez les bases de Future Factorius. Construisez votre première usine, gagnez 5 000 $ et terminez votre première recherche.',
      obj_place_factory: 'Placer 3 bâtiments',
      obj_earn_cash: 'Accumuler 5 000 $',
      obj_first_research: 'Terminer 1 recherche',
    },
    fast_start: {
      name: 'Démarrage rapide',
      description: 'Battez la montre ! Gagnez 50 000 $ et exploitez 10 bâtiments dans le temps imparti.',
      obj_earn_50k: 'Gagner 50 000 $',
      obj_ten_buildings: 'Exploiter 10 bâtiments',
    },
    survival: {
      name: 'Survie',
      description: 'Commencez avec presque rien. Survivez jusqu\'à la limite de temps et complétez 5 contrats.',
      obj_survive: 'Garder les liquidités au-dessus de 0 $',
      obj_contracts: 'Terminer 5 contrats',
    },
    sandbox: {
      name: 'Bac à sable',
      description: 'Ressources et argent de départ illimités. Construisez librement sans contraintes.',
    },
    ui: {
      title: 'Scénarios',
      selectMode: 'Sélectionnez un mode de jeu',
      startScenario: 'Démarrer le scénario',
      continueGame: 'Continuer en mode libre',
      objectives: 'Objectifs',
      score: 'Score',
      timeLeft: 'Temps restant : {0}s',
      timeUp: 'Temps écoulé !',
      completed: 'Terminé !',
      failed: 'Échoué',
      current_score: 'Score actuel : {0}',
    },
  },
} as const;
