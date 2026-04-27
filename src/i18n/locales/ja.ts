import type { Locale } from './en';

export const ja: Locale = {
  resources: {
    wood: {
      name: '木材',
      description: 'Raw timber harvested from forests. Essential for early production.',
    },
    coal: {
      name: '石炭',
      description: 'A combustible rock used as fuel and in smelting processes.',
    },
    iron_ore: {
      name: '鉄鉱石',
      description: 'Raw iron-bearing rock extracted from mines. Refined into steel.',
    },
    water: {
      name: '水',
      description: 'A universal solvent and coolant, vital for many processes.',
    },
    steel: {
      name: '鋼鉄',
      description: 'A strong alloy of iron and carbon, the backbone of industry.',
    },
    basic_components: {
      name: '基本部品',
      description: 'Simple manufactured parts used in a wide variety of applications.',
    },
    circuits: {
      name: '回路',
      description: 'Electronic circuit boards enabling automated and digital systems.',
    },
    fuel: {
      name: '燃料',
      description: 'Processed combustible liquid powering vehicles and machinery.',
    },
    silicon: {
      name: 'シリコン',
      description: 'Purified semiconductor material required for circuit fabrication.',
    },
    uranium: {
      name: 'ウラン',
      description: 'Radioactive heavy metal used in advanced energy systems.',
    },
    plasma_crystals: {
      name: 'プラズマ結晶',
      description: 'Exotic crystalline structures that store immense plasma energy.',
    },
    dark_matter_residue: {
      name: '暗黒物質残留物',
      description: 'Mysterious residue left by dark matter interactions. Extremely rare.',
    },
    quantum_foam: {
      name: '量子フォーム',
      description: 'Captured quantum-scale fluctuations of space-time. Highly unstable.',
    },
    synthetic_bio_gel: {
      name: '合成バイオゲル',
      description: 'Engineered biological substrate used in advanced biotech manufacturing.',
    },
    antimatter_particles: {
      name: '反物質粒子',
      description: 'Magnetically contained antimatter. The most energetic substance known.',
    },
    antimatter_core: {
      name: '反物質コア',
      description: 'A stabilised antimatter core — the most powerful energy source ever created.',
    },
    exotic_cores: {
      name: '異種コア',
      description: 'Ultra-dense energy cores formed from plasma crystals and quantum foam.',
    },
    nano_alloy: {
      name: 'ナノ合金',
      description: 'Steel reinforced at the nanoscale by dark matter residue. Impossibly strong.',
    },
    bio_circuits: {
      name: 'バイオ回路',
      description: 'Hybrid biological-electronic circuits with self-repair capabilities.',
    },
    advanced_components: {
      name: '高度部品',
      description: 'Precision-engineered parts used in high-tier manufacturing.',
    },
  },

  buildings: {
    wood_harvester: {
      name: '木材収穫機',
      description: 'Automatically harvests wood from nearby forest tiles.',
    },
    coal_mine: {
      name: '炭鉱',
      description: 'Extracts coal from underground seams.',
    },
    iron_mine: {
      name: '鉄鉱山',
      description: 'Drills into iron ore deposits and extracts raw ore.',
    },
    water_pump: {
      name: '水ポンプ',
      description: 'Draws water from underground aquifers or surface sources.',
    },
    basic_factory: {
      name: '基本工場',
      description: 'Produces basic components from raw materials.',
    },
    smelter: {
      name: '溶鉱炉',
      description: 'Smelts iron ore and coal into steel ingots.',
    },
    circuit_fab: {
      name: '回路製造機',
      description: 'Fabricates electronic circuits from silicon and water. Requires silicon extraction technology.',
    },
    refinery: {
      name: '精製所',
      description: 'Processes coal and water into refined fuel.',
    },
    storage_depot: {
      name: '貯蔵庫',
      description: 'Stores large quantities of resources for distribution.',
    },
    research_center: {
      name: '研究センター',
      description: 'Generates research points used to unlock new technologies.',
    },
    trading_terminal: {
      name: '取引端末',
      description: 'Connects your factory network to external trading partners.',
    },
    power_plant: {
      name: '発電所',
      description: 'Burns coal to generate electrical power for your facilities.',
    },
    silicon_extractor: {
      name: 'シリコン抽出機',
      description: 'Extracts and purifies silicon from sand deposits. Requires silicon extraction research.',
    },
    uranium_extractor: {
      name: 'ウラン抽出機',
      description: 'Safely mines and processes uranium ore. Requires uranium mining research.',
    },
    exotic_lab: {
      name: '異種研究所',
      description: 'Synthesises exotic materials from advanced inputs. Requires plasma tech research.',
    },
    quantum_forge: {
      name: '量子鍛造機',
      description: 'Prototype factory that manipulates matter at the quantum level. Requires antimatter containment.',
    },
    fusion_plant: {
      name: '核融合炉',
      description: 'Generates enormous clean energy through nuclear fusion. Requires fusion reactor research.',
    },
    bio_reactor: {
      name: 'バイオリアクター',
      description: 'Prototype bio-industrial reactor for advanced organic synthesis. Requires advanced biotech.',
    },
    singularity_tap: {
      name: '特異点タップ',
      description: 'Extracts near-infinite energy from a controlled singularity. Requires singularity engine research.',
    },
    mind_matrix: {
      name: 'マインドマトリクス',
      description: 'Uploaded consciousness network providing massive research acceleration. Requires consciousness upload.',
    },
    reality_forge: {
      name: '現実鍛造機',
      description: 'The ultimate prototype: a device that can bend the laws of physics. Requires reality engineering.',
    },
  },

  recipes: {
    wood_to_components: {
      name: '基本部品製造',
      description: 'Convert wood and coal into basic manufactured components.',
    },
    ore_to_steel: {
      name: '鋼鉄製錬',
      description: 'Smelt iron ore and coal into steel ingots.',
    },
    silicon_circuits: {
      name: '回路製造',
      description: 'Fabricate circuits from silicon wafers and distilled water.',
    },
    coal_fuel: {
      name: '燃料精製',
      description: 'Refine coal and water into combustible fuel.',
    },
    steel_components: {
      name: '高度部品製造',
      description: 'Manufacture precision advanced components from steel and basic parts.',
    },
    plasma_exotic: {
      name: '異種コア合成',
      description: 'Synthesise exotic cores from plasma crystals and quantum foam.',
    },
    nano_alloy: {
      name: 'ナノ合金鍛造',
      description: 'Forge nano alloy by infusing steel with dark matter residue.',
    },
    bio_circuits: {
      name: 'バイオ回路組立',
      description: 'Assemble bio-circuits by combining standard circuits with synthetic bio-gel.',
    },
    uranium_fuel: {
      name: 'ウラン燃料加工',
      description: 'Process uranium and water into high-yield nuclear fuel.',
    },
    antimatter_core: {
      name: '反物質コア組立',
      description: 'Assemble an antimatter core from antimatter particles and an exotic core.',
    },
    wood_charcoal: {
      name: '木炭製造',
      description: 'Char wood into coal as an early-game fuel source.',
    },
    fusion_power: {
      name: '核融合発電',
      description: 'Generate power through deuterium-tritium nuclear fusion.',
    },
    nano_bio_gel: {
      name: 'ナノバイオゲル合成',
      description: 'Combine nano alloy and synthetic bio-gel into an advanced biological compound.',
    },
    void_energy: {
      name: '虚空エネルギー抽出',
      description: 'Draw pure energy from the singularity tap.',
    },
    neural_substrate: {
      name: '神経基質製造',
      description: 'Fabricate the biological substrate used for consciousness upload.',
    },
    reality_shard: {
      name: '現実の欠片鍛造',
      description: 'Forge a crystallised fragment of rewritten physical law.',
    },
  },

  research: {
    silicon_extraction: {
      name: 'シリコン抽出',
      description: 'Develop techniques to extract and purify silicon from raw sand deposits.',
    },
    advanced_fabrication: {
      name: '高度製造',
      description: 'Precision manufacturing processes for higher-tier components.',
    },
    uranium_mining: {
      name: 'ウラン採掘',
      description: 'Safe extraction and handling protocols for radioactive uranium ore.',
    },
    plasma_tech: {
      name: 'プラズマ技術',
      description: 'Harness and contain plasma energy for industrial applications.',
    },
    dark_matter_research: {
      name: '暗黒物質研究',
      description: 'Study and manipulate dark matter residue for exotic material production.',
    },
    quantum_physics: {
      name: '量子物理学',
      description: 'Capture and stabilise quantum foam for use in advanced manufacturing.',
    },
    biotech: {
      name: 'バイオテクノロジー',
      description: 'Engineer biological substrates for hybrid circuit production.',
    },
    antimatter_containment: {
      name: '反物質封じ込め',
      description: 'Magnetic containment fields capable of safely storing antimatter particles.',
    },
    fast_routes: {
      name: '高速ルート',
      description: 'Optimise transport route scheduling to increase logistics throughput.',
    },
    automation: {
      name: '自動化',
      description: 'Automated control systems that improve building efficiency.',
    },
    fusion_reactor: {
      name: '核融合炉',
      description: 'Achieve sustained nuclear fusion to generate virtually unlimited clean power.',
    },
    advanced_biotech: {
      name: '高度バイオテクノロジー',
      description: 'Merge dark matter with biological systems to create next-generation organic materials.',
    },
    singularity_engine: {
      name: '特異点エンジン',
      description: 'Harness a controlled singularity as a near-infinite power source. The ultimate energy technology.',
    },
    consciousness_upload: {
      name: '意識アップロード',
      description: 'Digitise human consciousness to create an ever-growing research super-intelligence.',
    },
    reality_engineering: {
      name: '現実工学',
      description: 'Manipulate the fundamental laws of physics itself. The pinnacle of matter science.',
    },
  },

  tradePartners: {
    industrial_corp: {
      name: '工業コープ',
      description: 'A large industrial conglomerate hungry for steel, components and circuits.',
    },
    energy_traders: {
      name: 'エネルギー商人',
      description: 'Specialist energy brokers who pay premium prices for fuel and radioactive materials.',
    },
    research_institute: {
      name: '研究機関',
      description: 'A cutting-edge research organisation that buys exotic materials at top prices.',
    },
    colony_supply: {
      name: '植民地供給社',
      description: 'Supplies interplanetary colonies with steady demand for essential goods.',
    },
    black_market: {
      name: '闇市場',
      description: 'Off-books traders offering double market rates for rare and dangerous materials.',
    },
    terraformers: {
      name: 'テラフォーマー集団',
      description: 'Planetary engineers who need bio-materials and water for large-scale terraforming projects.',
    },
  },

  ui: {
    buildMenu: {
      title: '建設',
      categories: {
        harvester: '採取機',
        factory: '工場',
        refinery: '精製所',
        storage: '貯蔵',
        research: '研究',
        power: '電力',
        trade: '取引',
        prototype: 'プロトタイプ',
      },
      cost: 'コスト',
      maintenance: 'メンテナンス',
      power: '電力',
      locked: 'ロック中',
      requiresResearch: '必要: {0}',
    },
    research: {
      title: '研究',
      available: '利用可能',
      inProgress: '進行中',
      completed: '完了',
      cost: 'コスト',
      duration: '期間',
      prerequisites: '前提条件',
      start: '研究開始',
      cancel: 'キャンセル',
      progress: '進捗',
      seconds: '{0}秒',
      points: '{0} pts',
      money: '${0}',
    },
    trade: {
      title: '取引',
      partners: 'パートナー',
      buy: '購入',
      sell: '売却',
      price: '価格',
      demand: '需要',
      noPartners: '取引パートナーがまだ解放されていません。',
      confirmSell: '{0} {1} を ${2} で売りますか？',
      confirmBuy: '{0} {1} を ${2} で買いますか？',
    },
    routes: {
      title: 'ルート',
      newRoute: '新しいルート',
      from: '出発地',
      to: '目的地',
      resource: '資源',
      amount: '量',
      interval: '間隔',
      active: 'アクティブ',
      inactive: '非アクティブ',
      delete: '削除',
      noRoutes: 'ルートが設定されていません。',
    },
    settings: {
      title: '設定',
      language: '言語',
      graphicsQuality: 'グラフィック品質',
      soundVolume: '音量',
      musicVolume: '音楽ボリューム',
      save: 'ゲーム保存',
      load: 'ゲーム読込',
      newGame: '新しいゲーム',
      confirmNewGame: '新しいゲームを開始しますか？保存されていない進行状況は失われます。',
      apply: '適用',
      cancel: 'キャンセル',
    },
    hud: {
      money: '資金',
      researchPoints: '研究ポイント',
      power: '電力',
      tick: 'ティック',
      pause: '一時停止',
      resume: '再開',
      speed1x: '1x',
      speed2x: '2x',
      speed4x: '4x',
    },
    tooltips: {
      upgrade: 'レベル {0} にアップグレード',
      demolish: '建物を解体',
      assignRecipe: 'レシピを割り当て',
      viewStats: '統計を表示',
    },
  },

  messages: {
    buildingPlaced: '{0} を配置しました。',
    buildingDemolished: '{0} を解体しました。',
    buildingUpgraded: '{0} をレベル {1} にアップグレードしました。',
    researchComplete: '研究完了: {0}',
    routeCreated: '{0} から {1} へのルートを作成しました。',
    routeDeleted: 'ルートを削除しました。',
    insufficientFunds: '資金不足です。',
    insufficientResources: '資源不足です。',
    insufficientPower: '電力不足です。',
    storageFullFor: '{0} の貯蔵が満杯です。',
    unlocked: '{0} が解放されました！',
    tradeSuccess: '取引完了: {0} {1} を ${2} で。',
    tradeFailed: '取引失敗: {0}。',
    gameSaved: 'ゲームを保存しました。',
    gameLoaded: 'ゲームを読み込みました。',
    newGameStarted: '新しいゲームを開始しました。頑張れ、ディレクター！',
    buildingRepaired: '{0} を修理しました。',
    repairTooExpensive: '修理費用が足りません。',
    buildingBroken: '{0} が故障しました。修理が必要です！',
  },

  alerts: {
    research_complete: '研究完了: {0} — {1} を解放しました',
    building_breakdown: '{0} が故障しました！効率を回復するには修理してください。',
    deposit_low: '埋蔵量が少なくなっています — {1} がほぼ枯渇！',
    deposit_depleted: '埋蔵量が枯渇しました — {1} が完全に空になりました。',
    achievement_unlocked: '{1} 実績解放: {0}',
    contract_new: '新しい契約: {1}× {0} を ${2} で配達！',
    contract_completed: '契約完了！{0} を配達 — ${1} を獲得。',
    contract_failed: '契約失敗！{0} を配達できませんでした — ${1} のペナルティが課されました。',
    loan_taken: '${0} のローンを受け取りました。',
    loan_repaid: '${0} のローンを完済しました！',
    loan_overdue: 'ローンが期限切れです！残高 ${0} — 今すぐ支払ってペナルティを避けてください。',
  },

  events: {
    trade_embargo: '⚠️ 貿易禁輸！{0} が取引を拒否 — 価格下落。',
    resource_boom: '📈 資源ブーム！{0} の価格が急騰。',
    market_crash: '📉 市場崩壊！全価格が急落。',
    subsidy: '💰 政府補助金！{0} の価格が上昇。',
    tech_demand_surge: '🔬 技術需要急増！{0} の価格が一時的に倍増。',
    pollution_fine: '🌫️ 汚染罰則！環境違反により価格が抑制。',
  },

  achievements: {
    first_building: {
      name: '最初の一歩',
      description: '最初の建物を配置してください。',
    },
    power_up: {
      name: '電源投入',
      description: '発電所を建設してください。',
    },
    first_sale: {
      name: '商人',
      description: '最初の取引を完了してください。',
    },
    five_buildings: {
      name: '成長する工場',
      description: '建物を5つ配置してください。',
    },
    ten_buildings: {
      name: '工業複合施設',
      description: '建物を10個配置してください。',
    },
    first_research: {
      name: '知識の探求者',
      description: '最初の研究を完了してください。',
    },
    cash_1k: {
      name: '小銭',
      description: '$1,000を蓄積してください。',
    },
    cash_10k: {
      name: '儲かる事業',
      description: '$10,000を蓄積してください。',
    },
    cash_100k: {
      name: '実業家',
      description: '$100,000を蓄積してください。',
    },
    five_routes: {
      name: '物流ネットワーク',
      description: '輸送ルートを5つ作成してください。',
    },
    repair_crew: {
      name: '修理班',
      description: '故障した建物を修理してください。',
    },
    polluter: {
      name: '汚染問題',
      description: '汚染をレベル50まで上昇させてください。',
    },
    clean_factory: {
      name: 'クリーン産業',
      description: '5棟以上の建物で低汚染を維持してください。',
    },
    deposit_depleted: {
      name: '枯渇した埋蔵地',
      description: '資源埋蔵地を完全に枯渇させてください。',
    },
    first_contract: {
      name: '取引成立',
      description: '最初の配達契約を完了してください。',
    },
    ten_contracts: {
      name: '契約王',
      description: '配達契約を10件完了してください。',
    },
    first_loan: {
      name: 'レバレッジ活用',
      description: '最初のローンを組んでください。',
    },
    debt_free: {
      name: '無借金',
      description: '全てのローンを返済してください。',
    },
    market_event: {
      name: '市場観察者',
      description: '市場イベントを目撃してください。',
    },
    tier5_research: {
      name: 'ポスト・シンギュラリティ',
      description: 'ティア5のポスト・シンギュラリティ研究を完了してください。',
    },
    synergy_active: {
      name: 'シナジー！',
      description: '技術横断的な生産シナジーボーナスを解放してください。',
    },
    prototype_built: {
      name: 'プロトタイプエンジニア',
      description: 'プロトタイプクラスの構造物を建設してください。',
    },
  },

  controls: {
    title: 'コントロール',
    rotate: 'カメラ回転',
    pan: 'カメラ移動',
    zoom: 'ズーム',
    placeBuilding: '建物を配置',
    cancelPlacement: '配置をキャンセル',
    selectBuilding: '建物を選択',
    openBuildMenu: '建設メニューを開く',
    openResearch: '研究を開く',
    openTrade: '取引を開く',
    openRoutes: 'ルートを開く',
    openSettings: '設定を開く',
    pauseResume: '一時停止 / 再開',
    speedUp: 'スピードアップ',
    slowDown: 'スローダウン',
    keys: {
      leftClick: '左クリック',
      rightClickDrag: '右クリック + ドラッグ',
      middleClickDrag: '中クリック + ドラッグ',
      scrollWheel: 'スクロールホイール',
      escape: 'Escape',
      b: 'B',
      r: 'R',
      t: 'T',
      l: 'L',
      s: 'S',
      space: 'スペース',
      plus: '+',
      minus: '-',
    },
  },

  scenarios: {
    tutorial: {
      name: 'チュートリアル',
      description: 'Future Factoriusの基本を学びましょう。最初の工場を建て、$5,000を稼ぎ、最初の研究を完了してください。',
      obj_place_factory: '建物を3つ配置する',
      obj_earn_cash: '$5,000を蓄積する',
      obj_first_research: '研究を1件完了する',
    },
    fast_start: {
      name: '高速スタート',
      description: '時間との勝負！制限時間内に$50,000を稼ぎ、10棟の建物を稼働させてください。',
      obj_earn_50k: '$50,000を稼ぐ',
      obj_ten_buildings: '10棟の建物を稼働させる',
    },
    survival: {
      name: 'サバイバル',
      description: 'ほぼ何もない状態から始めます。制限時間を生き延び、5件の契約を完了してください。',
      obj_survive: '資金を$0以上に保つ',
      obj_contracts: '5件の契約を完了する',
    },
    sandbox: {
      name: 'サンドボックス',
      description: '資源と開始資金が無制限。制約なく自由に建設してください。',
    },
    ui: {
      title: 'シナリオ',
      selectMode: 'ゲームモードを選択',
      startScenario: 'シナリオ開始',
      continueGame: 'フリープレイを続ける',
      objectives: '目標',
      score: 'スコア',
      timeLeft: '残り時間: {0}秒',
      timeUp: '時間切れ！',
      completed: '完了！',
      failed: '失敗',
      current_score: '現在のスコア: {0}',
    },
  },
} as const;
