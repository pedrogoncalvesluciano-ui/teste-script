(() => {
    "use strict";

    /* ============================================================
       VEYRA: A QUIETUDE
       V30 — RECONSTRUÇÃO UNIFICADA

       SCRIPT.JS — PARTE 1/5

       ESTA PARTE CONTÉM:
       - versão e saves
       - configurações globais
       - helpers matemáticos
       - estado principal
       - personagens
       - status
       - progressão de nível
       - armaduras
       - itens
       - inventário
       - economia
       - habilidades de classe
       - Dash V1 / Dash V2
       - NPCs e diálogos-base
       - inimigos
       - bosses
       - Vaelkor
       - missão A Provação do Vazio
       - Chave Obscura
       - Essência Sombria
       - Fragmento do Vazio
       - missões de Bran/Borin
       - definições do Caminho 1 e Caminho 2
       - base dos comandos privados
       - criação e recálculo do jogador
       - validações estruturais

       IMPORTANTE:
       ESTA PARTE ABRE O ÚNICO IIFE.

       NÃO COLOQUE:
       })();

       NO FINAL DESTA PARTE.
       ============================================================ */


    /* ============================================================
       VERSÃO
       ============================================================ */

    const GAME_VERSION = 30;

    const GAME_VERSION_NAME =
        "VEYRA V30 — RECONSTRUÇÃO UNIFICADA";

    const SAVE_KEY =
        "veyra_save_v30";

    const SAVE_SCHEMA_VERSION = 30;

    const LEGACY_SAVE_KEYS = Object.freeze([
        "veyra_save_v25",
        "veyra_save_v20_five_parts",
        "veyra_save_v20_upgrade",
        "veyra_save_v19_rebuild",
        "veyra_save_v19",
        "veyra_save_v18_rebuild",
        "veyra_save_v14_stable",
        "veyra_save_v1"
    ]);


    /* ============================================================
       LIMITES PRINCIPAIS
       ============================================================ */

    const MAX_LEVEL = 50;

    /*
        REGRA DEFINITIVA:

        Cada nível ganho concede exatamente
        3 pontos para distribuição manual.

        O nível NÃO aumenta atributos sozinho.
    */
    const STATUS_POINTS_PER_LEVEL = 3;

    const STAT_CAP = 30;

    const MAX_ACTIVE_POTION_BUFFS = 2;

    const MAX_BLOOD_MARKS = 18;

    const MAX_WORLD_PARTICLES = 420;

    const MAX_WORLD_EFFECTS = 180;

    const MAX_PROJECTILES = 180;


    /* ============================================================
       PREÇOS IMPORTANTES
       ============================================================ */

    const LANTERN_PRICE = 350;

    const MINIMAP_PRICE = 180;

    const DASH_RITUAL_COST = Object.freeze({
        rubi: 60,
        diamante: 45
    });

    const NORTH_GATE_COST = Object.freeze({
        diamante: 40,
        rubi: 55
    });


    /* ============================================================
       CHECKPOINT
       ============================================================ */

    const PLAYER_HOME = Object.freeze({
        area: "village",
        houseId: "home",

        interiorSpawn: Object.freeze({
            x: 540,
            y: 515,
            facing: "up"
        }),

        /*
            Esse é somente um fallback.

            Na Parte 2 o respawn real será calculado
            usando a geometria da porta da casa,
            para o jogador realmente nascer NA FRENTE
            da própria casa.
        */
        fallbackRespawn: Object.freeze({
            x: 595,
            y: 1905,
            facing: "up"
        })
    });


    /* ============================================================
       CONFIGURAÇÃO GERAL
       ============================================================ */

    const GAME_CONFIG = Object.freeze({
        worldMargin: 55,

        autosaveSeconds: 30,

        interactDistance: 92,

        pickupDistance: 82,

        treeHoldSeconds: 1.35,

        resourceHoldSeconds: 1.15,

        darkKeyHoldSeconds: 1.8,

        baseAttackCooldown: 0.26,

        dialogueCharactersPerSecond: 44,

        dialogueFadeSeconds: 0.2,

        doorOpenDistance: 115,

        doorEnterDistance: 96,

        doorAnimationSpeed: 6,

        portalCooldown: 1,

        enemyChargeStep: 7,

        restAnimationSeconds: 1.65,

        deathMaterialLossRatio: 0.08,

        deathMaterialLossMaxPerType: 8,

        safeSpawnSearchRadius: 260,

        safeSpawnStep: 18,

        maxDeltaTime: 0.05
    });


    /* ============================================================
       SOBREVIVÊNCIA

       Mantém o ritmo que já havia sido aprovado.
       ============================================================ */

    const SURVIVAL_CONFIG = Object.freeze({
        hungerDrainPerSecond: 0.25,
        fatigueDrainPerSecond: 0.20,

        magicRegenPerSecond: 1.7,
        energyRegenPerSecond: 3,

        lowHungerThreshold: 20,
        lowFatigueThreshold: 20,

        lowNeedMoveMultiplier: 0.72,

        emptyNeedHpDrainPerSecond: 0.12
    });


    /* ============================================================
       DASH V1 / DASH V2
       ============================================================ */

    const DASH_CONFIG = Object.freeze({
        v1: Object.freeze({
            id: "dashV1",
            name: "DASH V1",
            subtitle: "DASH DO VENTO",

            speed: 650,
            distance: 142,

            cooldown: 3,

            energyCost: 14,

            trailColor: "#eef5ff",
            coreColor: "#ffffff",

            afterimageAlpha: 0.28,

            /*
                V1 NÃO possui invulnerabilidade.
            */
            generalInvulnerability: 0,

            projectilePhaseWindow: 0
        }),

        v2: Object.freeze({
            id: "dashV2",
            name: "DASH V2",
            subtitle: "DASH DO VAZIO",

            /*
                Aproximadamente:
                +25% velocidade
                +35% distância
                -15% cooldown
            */
            speed: 812,
            distance: 192,

            cooldown: 2.55,

            energyCost: 16,

            trailColor: "#0a0710",
            coreColor: "#8f73ad",

            afterimageAlpha: 0.52,

            generalInvulnerability: 0,

            /*
                NÃO É INVULNERABILIDADE.

                É uma janela especial em que SOMENTE
                projéteis podem atravessar o jogador
                caso ele acerte o timing do Dash V2.
            */
            projectilePhaseWindow: 0.09
        })
    });


    function getDashConfig(player = state.player) {
        if (!player) {
            return DASH_CONFIG.v1;
        }

        return player.abilities?.dashV2
            ? DASH_CONFIG.v2
            : DASH_CONFIG.v1;
    }


    function getDashVersion(player = state.player) {
        if (!player) {
            return 0;
        }

        if (player.abilities?.dashV2) {
            return 2;
        }

        if (player.abilities?.dashV1) {
            return 1;
        }

        return 0;
    }


    /* ============================================================
       CONFIGURAÇÃO VISUAL
       ============================================================ */

    const VISUAL_CONFIG = Object.freeze({
        lantern: Object.freeze({
            radius: 255,
            noLanternRadius: 72,
            wallGlowDistance: 5,
            rays: 112
        }),

        blood: Object.freeze({
            markLifeMin: 8,
            markLifeMax: 17,
            markMin: 3,
            markMax: 8,
            flashMax: 0.34
        }),

        bossBar: Object.freeze({
            minWidth: 350,
            maxWidth: 720,
            height: 17,
            topDesktop: 42
        }),

        camera: Object.freeze({
            followSpeed: 7,
            cutsceneFollowSpeed: 3
        })
    });


    /* ============================================================
       HELPERS
       ============================================================ */

    function clamp(value, min, max) {
        return Math.max(
            min,
            Math.min(max, value)
        );
    }


    function lerp(a, b, t) {
        return a + (b - a) * t;
    }


    function finiteNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function positiveNumber(value, fallback = 0) {
        return Math.max(
            0,
            finiteNumber(value, fallback)
        );
    }


    function integer(value, fallback = 0) {
        return Math.trunc(
            finiteNumber(value, fallback)
        );
    }


    function random(min = 0, max = 1) {
        return min + Math.random() * (max - min);
    }


    function randomInt(min, max) {
        const low = Math.ceil(min);
        const high = Math.floor(max);

        return Math.floor(
            Math.random() * (high - low + 1)
        ) + low;
    }


    function choose(array) {
        if (
            !Array.isArray(array) ||
            array.length === 0
        ) {
            return null;
        }

        return array[
            Math.floor(
                Math.random() * array.length
            )
        ];
    }


    function distance(x1, y1, x2, y2) {
        return Math.hypot(
            x2 - x1,
            y2 - y1
        );
    }


    function normalize(x, y) {
        const length =
            Math.hypot(x, y);

        if (length <= 0.000001) {
            return {
                x: 0,
                y: 0,
                length: 0
            };
        }

        return {
            x: x / length,
            y: y / length,
            length
        };
    }


    function angleTo(x1, y1, x2, y2) {
        return Math.atan2(
            y2 - y1,
            x2 - x1
        );
    }


    function circleCircleCollision(
        ax,
        ay,
        ar,
        bx,
        by,
        br
    ) {
        const radius =
            ar + br;

        const dx =
            bx - ax;

        const dy =
            by - ay;

        return (
            dx * dx +
            dy * dy
        ) <= radius * radius;
    }


    function circleRectCollision(
        cx,
        cy,
        radius,
        rect
    ) {
        if (!rect) {
            return false;
        }

        const closestX =
            clamp(
                cx,
                rect.x,
                rect.x + rect.w
            );

        const closestY =
            clamp(
                cy,
                rect.y,
                rect.y + rect.h
            );

        const dx =
            cx - closestX;

        const dy =
            cy - closestY;

        return (
            dx * dx +
            dy * dy
        ) <= radius * radius;
    }


    function rectsOverlap(a, b) {
        if (!a || !b) {
            return false;
        }

        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }


    function pointInRect(x, y, rect) {
        return (
            x >= rect.x &&
            x <= rect.x + rect.w &&
            y >= rect.y &&
            y <= rect.y + rect.h
        );
    }


    function pointInCircle(
        x,
        y,
        circleX,
        circleY,
        radius
    ) {
        return (
            distance(
                x,
                y,
                circleX,
                circleY
            ) <= radius
        );
    }


    function deepClone(value) {
        if (
            typeof structuredClone ===
            "function"
        ) {
            try {
                return structuredClone(value);
            } catch {
                /* fallback abaixo */
            }
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }


    let uniqueIdCounter = 0;


    function uid(prefix = "id") {
        uniqueIdCounter += 1;

        return `${prefix}_${Date.now().toString(36)}_${uniqueIdCounter.toString(36)}`;
    }


    function mulberry32(seed) {
        let value =
            seed >>> 0;

        return function seededRandom() {
            value += 0x6D2B79F5;

            let t = value;

            t = Math.imul(
                t ^ (t >>> 15),
                t | 1
            );

            t ^= t +
                Math.imul(
                    t ^ (t >>> 7),
                    t | 61
                );

            return (
                (
                    t ^ (t >>> 14)
                ) >>> 0
            ) / 4294967296;
        };
    }


    function hashStringToSeed(text) {
        const source =
            String(text ?? "");

        let hash = 2166136261;

        for (
            let index = 0;
            index < source.length;
            index += 1
        ) {
            hash ^= source.charCodeAt(index);

            hash = Math.imul(
                hash,
                16777619
            );
        }

        return hash >>> 0;
    }


    function safeArray(value) {
        return Array.isArray(value)
            ? value
            : [];
    }


    function uniqueArray(value) {
        return [
            ...new Set(
                safeArray(value)
            )
        ];
    }


    function removeFromArray(array, value) {
        if (!Array.isArray(array)) {
            return false;
        }

        const index =
            array.indexOf(value);

        if (index === -1) {
            return false;
        }

        array.splice(index, 1);

        return true;
    }


    /* ============================================================
       PERSONAGENS
       ============================================================ */

    const CHARACTERS = Object.freeze([
        Object.freeze({
            id: "kaelion",
            name: "KAELION",
            className: "Mago",

            icon: "🔥",

            role:
                "Magia • Longo alcance",

            description:
                "Um conjurador de memória incendiária. Excelente alcance e magia, mas menor resistência física.",

            hp: 92,
            magic: 145,
            energy: 95,
            damage: 26,
            defense: 8,
            speed: 150,

            color: "#d77739",
            glow: "#ffc07b",

            sprite: Object.freeze({
                skin: "#d8b08b",
                hair: "#43291f",
                body: "#8d432b",
                trim: "#e19a4d",
                cape: "#603126",
                scale: 1
            }),

            basicAttack: Object.freeze({
                id: "memoryFlame",
                name: "CHAMA DA MEMÓRIA",
                type: "projectile",
                speed: 470,
                range: 305,
                radius: 7,
                hitRadius: 17,
                damageMultiplier: 1,
                color: "#f39a4c",
                secondaryColor: "#ffd09c"
            })
        }),

        Object.freeze({
            id: "theron",
            name: "THERON",
            className: "Cavaleiro",

            icon: "⚔️",

            role:
                "Defesa • Corpo a corpo",

            description:
                "Um cavaleiro resistente, especializado em combate próximo, defesa e golpes de espada.",

            hp: 128,
            magic: 72,
            energy: 112,
            damage: 25,
            defense: 19,
            speed: 142,

            color: "#8e969d",
            glow: "#dde3e7",

            sprite: Object.freeze({
                skin: "#cfaa8b",
                hair: "#3f3936",
                body: "#555d62",
                trim: "#afb6ba",
                cape: "#363a3d",
                scale: 1.03
            }),

            basicAttack: Object.freeze({
                id: "steelArc",
                name: "ARCO DE AÇO",
                type: "arc",
                range: 91,
                hitRadius: 25,
                arc: Math.PI * 0.72,
                damageMultiplier: 1.05,
                color: "#dce2e5",
                secondaryColor: "#7c858b"
            })
        }),

        Object.freeze({
            id: "grumgar",
            name: "GRUMGAR",
            className: "Troll",

            icon: "🪨",

            role:
                "Força • Impacto",

            description:
                "Um troll de enorme força física. Seus golpes são lentos, pesados e capazes de atingir uma área.",

            hp: 155,
            magic: 60,
            energy: 120,
            damage: 30,
            defense: 15,
            speed: 126,

            color: "#6f875c",
            glow: "#b8c99b",

            sprite: Object.freeze({
                skin: "#6d835e",
                hair: "#34392f",
                body: "#536647",
                trim: "#879974",
                cape: null,
                scale: 1.12
            }),

            basicAttack: Object.freeze({
                id: "stoneSmash",
                name: "IMPACTO DE PEDRA",
                type: "smash",
                range: 72,
                hitRadius: 66,
                damageMultiplier: 1.13,
                color: "#857d63",
                secondaryColor: "#b7a984"
            })
        }),

        Object.freeze({
            id: "lirael",
            name: "LIRAEL",
            className: "Fada",

            icon: "✨",

            role:
                "Velocidade • Luz",

            description:
                "Uma fada extremamente ágil que utiliza luz feérica para atacar, curar e controlar o campo.",

            hp: 86,
            magic: 132,
            energy: 118,
            damage: 22,
            defense: 7,
            speed: 168,

            color: "#d984bc",
            glow: "#ffd4ef",

            sprite: Object.freeze({
                skin: "#edc4ae",
                hair: "#e2bfd5",
                body: "#a5578c",
                trim: "#f0a9d7",
                cape: null,
                wings: true,
                scale: 0.94
            }),

            basicAttack: Object.freeze({
                id: "fairySpark",
                name: "FAÍSCA FEÉRICA",
                type: "projectile",
                speed: 565,
                range: 290,
                radius: 5,
                hitRadius: 14,
                damageMultiplier: 0.93,
                color: "#ee9fd2",
                secondaryColor: "#ffe1f4"
            })
        }),

        Object.freeze({
            id: "zephyr",
            name: "ZEPHYR",
            className: "Transmorfo",

            icon: "🌀",

            role:
                "Adaptação • Mobilidade",

            description:
                "Um transmorfo equilibrado que distorce pequenas partes do espaço durante seus ataques.",

            hp: 105,
            magic: 108,
            energy: 126,
            damage: 24,
            defense: 11,
            speed: 160,

            color: "#7959a2",
            glow: "#c6a5eb",

            sprite: Object.freeze({
                skin: "#c8a489",
                hair: "#40304f",
                body: "#554067",
                trim: "#9672b7",
                cape: "#392d48",
                scale: 1
            }),

            basicAttack: Object.freeze({
                id: "riftSlash",
                name: "CORTE DA FENDA",
                type: "doubleSlash",
                range: 105,
                hitRadius: 22,
                arc: Math.PI * 0.62,
                damageMultiplier: 1,
                color: "#9b72c7",
                secondaryColor: "#c8a8e9"
            })
        })
    ]);


    const CHARACTER_BY_ID = Object.freeze(
        Object.fromEntries(
            CHARACTERS.map(
                character => [
                    character.id,
                    character
                ]
            )
        )
    );


    function getCharacterById(id) {
        return CHARACTER_BY_ID[id] || null;
    }


    function currentCharacter() {
        if (!state.player) {
            return (
                state.selectedCharacter ||
                CHARACTERS[0]
            );
        }

        return (
            getCharacterById(
                state.player.characterId
            ) ||
            CHARACTERS[0]
        );
    }


    const CHARACTER_SELECTION_RANGE =
        Object.freeze({
            hp: Object.freeze([80, 160]),
            magic: Object.freeze([55, 150]),
            energy: Object.freeze([85, 130]),
            damage: Object.freeze([20, 32]),
            defense: Object.freeze([5, 20]),
            speed: Object.freeze([120, 175])
        });


    function getCharacterStatBarValue(
        character,
        stat
    ) {
        const range =
            CHARACTER_SELECTION_RANGE[stat];

        if (!range) {
            return 0;
        }

        const value =
            finiteNumber(
                character?.[stat],
                range[0]
            );

        return clamp(
            (
                value - range[0]
            ) /
            (
                range[1] - range[0]
            ) *
            100,
            4,
            100
        );
    }


    /* ============================================================
       STATUS MANUAL
       ============================================================ */

    const STAT_CONFIG = Object.freeze({
        power: Object.freeze({
            id: "power",
            icon: "✦",
            label: "FORÇA / MAGIA",
            description:
                "+2% de dano e +4 de magia máxima por ponto.",
            cap: STAT_CAP
        }),

        energy: Object.freeze({
            id: "energy",
            icon: "⚡",
            label: "ENERGIA",
            description:
                "+5 de energia máxima por ponto.",
            cap: STAT_CAP
        }),

        hunger: Object.freeze({
            id: "hunger",
            icon: "🍞",
            label: "FOME",
            description:
                "+3 de capacidade máxima de fome por ponto.",
            cap: STAT_CAP
        }),

        fatigue: Object.freeze({
            id: "fatigue",
            icon: "☾",
            label: "CANSAÇO",
            description:
                "+3 de capacidade máxima de cansaço por ponto.",
            cap: STAT_CAP
        })
    });


    function createEmptyStats() {
        return {
            power: 0,
            energy: 0,
            hunger: 0,
            fatigue: 0
        };
    }


    function getStatusPointsForLevel() {
        return STATUS_POINTS_PER_LEVEL;
    }


    function calculateXpToNext(level) {
        const safeLevel =
            Math.max(
                1,
                integer(level, 1)
            );

        /*
            Curva crescente sem explodir cedo.
        */
        return Math.round(
            85 +
            safeLevel * 34 +
            Math.pow(
                safeLevel,
                1.42
            ) * 10
        );
    }


    /* ============================================================
       ARMADURAS
       ============================================================ */

    const ARMOR_PROGRESSION =
        Object.freeze([
            "armaduraFolha",
            "armaduraAlgodao",
            "armaduraMadeira",
            "armaduraCouro",
            "armaduraFerro",
            "armaduraOuro",
            "armaduraDiamante",
            "armaduraRubi"
        ]);


    const ARMOR_DATA = Object.freeze({
        armaduraFolha: Object.freeze({
            id: "armaduraFolha",
            name: "ARMADURA DE FOLHA",
            tier: 1,
            maxHpBonus: 25,
            defense: 3,
            vendor: "doran",
            price: 65,
            previousArmor: null,
            icon: "🍃"
        }),

        armaduraAlgodao: Object.freeze({
            id: "armaduraAlgodao",
            name: "ARMADURA DE ALGODÃO",
            tier: 2,
            maxHpBonus: 50,
            defense: 6,
            vendor: "doran",
            price: 105,
            previousArmor: "armaduraFolha",
            icon: "☁️"
        }),

        armaduraMadeira: Object.freeze({
            id: "armaduraMadeira",
            name: "ARMADURA DE MADEIRA",
            tier: 3,
            maxHpBonus: 75,
            defense: 10,
            vendor: "doran",
            price: 165,
            previousArmor: "armaduraAlgodao",
            icon: "🪵"
        }),

        armaduraCouro: Object.freeze({
            id: "armaduraCouro",
            name: "ARMADURA DE COURO",
            tier: 4,
            maxHpBonus: 100,
            defense: 15,
            vendor: "doran",
            price: 250,
            previousArmor: "armaduraMadeira",
            icon: "🛡️"
        }),

        armaduraFerro: Object.freeze({
            id: "armaduraFerro",
            name: "ARMADURA DE FERRO",
            tier: 5,
            maxHpBonus: 125,
            defense: 22,
            vendor: "borin",
            price: 340,
            previousArmor: "armaduraCouro",
            material: "ferro",
            materialAmount: 36,
            icon: "⛓️"
        }),

        armaduraOuro: Object.freeze({
            id: "armaduraOuro",
            name: "ARMADURA DE OURO",
            tier: 6,
            maxHpBonus: 150,
            defense: 30,
            vendor: "borin",
            price: 620,
            previousArmor: "armaduraFerro",
            material: "ouro",
            materialAmount: 42,
            icon: "🟨"
        }),

        armaduraDiamante: Object.freeze({
            id: "armaduraDiamante",
            name: "ARMADURA DE DIAMANTE",
            tier: 7,
            maxHpBonus: 175,
            defense: 40,
            vendor: "borin",
            price: 980,
            previousArmor: "armaduraOuro",
            material: "diamante",
            materialAmount: 48,
            icon: "💎"
        }),

        armaduraRubi: Object.freeze({
            id: "armaduraRubi",
            name: "ARMADURA DE RUBI",
            tier: 8,
            maxHpBonus: 200,
            defense: 53,
            vendor: "borin",
            price: 1450,
            previousArmor: "armaduraDiamante",
            material: "rubi",
            materialAmount: 62,
            icon: "♦️"
        })
    });


    const ARMOR_UPGRADES =
        Object.freeze(
            ARMOR_PROGRESSION
                .slice(4)
                .map(id => {
                    const armor =
                        ARMOR_DATA[id];

                    return Object.freeze({
                        id: armor.id,
                        previous: armor.previousArmor,
                        material: armor.material,
                        materialAmount: armor.materialAmount,
                        coins: armor.price
                    });
                })
        );


    function getArmorTier(id) {
        return ARMOR_DATA[id]?.tier || 0;
    }


    function isProgressionArmor(id) {
        return Boolean(
            ARMOR_DATA[id]
        );
    }


    /* ============================================================
       ITENS
       ============================================================ */

    const ITEMS = Object.freeze({
        madeira: Object.freeze({
            id: "madeira",
            name: "MADEIRA",
            icon: "🪵",
            category: "materials",
            weight: 0.8,
            value: 6,
            sellable: true
        }),

        carvao: Object.freeze({
            id: "carvao",
            name: "CARVÃO",
            icon: "⬛",
            category: "materials",
            weight: 0.55,
            value: 9,
            sellable: true
        }),

        ferro: Object.freeze({
            id: "ferro",
            name: "FERRO",
            icon: "◼",
            category: "materials",
            weight: 0.75,
            value: 13,
            sellable: true
        }),

        ouro: Object.freeze({
            id: "ouro",
            name: "OURO",
            icon: "●",
            category: "materials",
            weight: 0.7,
            value: 20,
            sellable: true
        }),

        diamante: Object.freeze({
            id: "diamante",
            name: "DIAMANTE",
            icon: "💎",
            category: "materials",
            weight: 0.4,
            value: 33,
            sellable: true
        }),

        rubi: Object.freeze({
            id: "rubi",
            name: "RUBI",
            icon: "♦",
            category: "materials",
            weight: 0.4,
            value: 42,
            sellable: true
        }),

        cristal: Object.freeze({
            id: "cristal",
            name: "CRISTAL DE MEMÓRIA",
            icon: "◇",
            category: "materials",
            weight: 0.3,
            value: 28,
            sellable: true
        }),

        fragmento: Object.freeze({
            id: "fragmento",
            name: "FRAGMENTO ANTIGO",
            icon: "◆",
            category: "materials",
            weight: 0.25,
            value: 22,
            sellable: true
        }),

        essenciaSombria: Object.freeze({
            id: "essenciaSombria",
            name: "ESSÊNCIA SOMBRIA",
            icon: "◉",
            category: "materials",
            weight: 0.15,
            value: 0,
            sellable: false,
            questItem: true,
            description:
                "Uma concentração escura deixada por criaturas afetadas pelo Vazio."
        }),

        chaveObscura: Object.freeze({
            id: "chaveObscura",
            name: "CHAVE OBSCURA",
            icon: "🗝️",
            category: "quest",
            weight: 0,
            value: 0,
            sellable: false,
            questItem: true,
            unique: true,
            description:
                "Uma chave antiga envolvida por uma energia desconhecida."
        }),

        fragmentoVazio: Object.freeze({
            id: "fragmentoVazio",
            name: "FRAGMENTO DO VAZIO",
            icon: "◈",
            category: "quest",
            weight: 0,
            value: 0,
            sellable: false,
            questItem: true,
            unique: true,
            description:
                "Um fragmento negro que parece absorver a própria luz."
        }),

        flautaMemoria: Object.freeze({
            id: "flautaMemoria",
            name: "FLAUTA DA MEMÓRIA",
            icon: "🎶",
            category: "quest",
            weight: 0,
            value: 0,
            sellable: false,
            questItem: true,
            unique: true,
            permanent: true
        }),

        lanterna: Object.freeze({
            id: "lanterna",
            name: "LANTERNA ANTIGA",
            icon: "🏮",
            category: "tools",
            weight: 0,
            value: LANTERN_PRICE,
            sellable: false,
            unique: true,
            permanent: true
        }),

        minimapa: Object.freeze({
            id: "minimapa",
            name: "MAPA DE VEYRA",
            icon: "🗺️",
            category: "tools",
            weight: 0,
            value: MINIMAP_PRICE,
            sellable: false,
            unique: true,
            permanent: true
        }),

        espadaFerro: Object.freeze({
            id: "espadaFerro",
            name: "ESPADA DE FERRO",
            icon: "⚔️",
            category: "weapons",
            weight: 2.2,
            value: 180,
            sellable: true,
            unique: true,
            damage: 8
        }),

        pao: Object.freeze({
            id: "pao",
            name: "PÃO",
            icon: "🍞",
            category: "food",
            weight: 0.2,
            value: 12,
            sellable: true,
            hunger: 24,
            fatigue: 2
        }),

        carneAssada: Object.freeze({
            id: "carneAssada",
            name: "CARNE ASSADA",
            icon: "🍖",
            category: "food",
            weight: 0.35,
            value: 28,
            sellable: true,
            hunger: 44,
            fatigue: 7
        }),

        pocao: Object.freeze({
            id: "pocao",
            name: "POÇÃO DE VIDA",
            icon: "🧪",
            category: "potions",
            weight: 0.25,
            value: 45,
            sellable: true,
            heal: 48
        }),

        elixir: Object.freeze({
            id: "elixir",
            name: "ELIXIR DE ENERGIA",
            icon: "⚗️",
            category: "potions",
            weight: 0.25,
            value: 55,
            sellable: true,
            energy: 54
        }),

        pocaoForca: Object.freeze({
            id: "pocaoForca",
            name: "POÇÃO DE FORÇA",
            icon: "🔴",
            category: "potions",
            weight: 0.25,
            value: 85,
            sellable: true,
            buff: "damage",
            multiplier: 1.18,
            duration: 45
        }),

        pocaoResistencia: Object.freeze({
            id: "pocaoResistencia",
            name: "POÇÃO DE RESISTÊNCIA",
            icon: "🔵",
            category: "potions",
            weight: 0.25,
            value: 85,
            sellable: true,
            buff: "defense",
            defenseBonus: 9,
            duration: 45
        }),

        pocaoVelocidade: Object.freeze({
            id: "pocaoVelocidade",
            name: "POÇÃO DE VELOCIDADE",
            icon: "🟢",
            category: "potions",
            weight: 0.25,
            value: 95,
            sellable: true,
            buff: "speed",
            speedMultiplier: 1.14,
            duration: 38
        }),

        ...Object.fromEntries(
            ARMOR_PROGRESSION.map(id => {
                const armor =
                    ARMOR_DATA[id];

                return [
                    id,
                    Object.freeze({
                        id,
                        name: armor.name,
                        icon: armor.icon,
                        category: "armor",
                        weight: 0,
                        value: armor.price,
                        sellable: false,
                        unique: true,
                        progression: true,
                        maxHpBonus: armor.maxHpBonus,
                        defense: armor.defense,
                        tier: armor.tier
                    })
                ];
            })
        )
    });


    function isKnownItem(id) {
        return Boolean(
            ITEMS[id]
        );
    }


    function createEmptyInventory() {
        const inventory = {};

        for (
            const id of
            Object.keys(ITEMS)
        ) {
            inventory[id] = 0;
        }

        return inventory;
    }


    /* ============================================================
       HABILIDADES DE CLASSE
       ============================================================ */

    const CLASS_SKILLS = Object.freeze({
        kaelion: Object.freeze({
            q: Object.freeze({
                id: "memoryRay",
                name: "RAIO DE MEMÓRIA",
                costType: "magic",
                cost: 15,
                cooldown: 2
            }),

            r: Object.freeze({
                id: "arcaneCircle",
                name: "CÍRCULO ARCANO",
                costType: "magic",
                cost: 24,
                cooldown: 5
            }),

            f: Object.freeze({
                id: "memoryExplosion",
                name: "EXPLOSÃO DE MEMÓRIA",
                costType: "magic",
                cost: 36,
                cooldown: 8
            })
        }),

        theron: Object.freeze({
            q: Object.freeze({
                id: "guardianStrike",
                name: "GOLPE DO GUARDIÃO",
                costType: "energy",
                cost: 10,
                cooldown: 3
            }),

            r: Object.freeze({
                id: "ironGuard",
                name: "POSTURA DE FERRO",
                costType: "energy",
                cost: 18,
                cooldown: 6
            }),

            f: Object.freeze({
                id: "guardianRush",
                name: "INVESTIDA DO GUARDIÃO",
                costType: "energy",
                cost: 25,
                cooldown: 8
            })
        }),

        grumgar: Object.freeze({
            q: Object.freeze({
                id: "crushingBlow",
                name: "ESMAGAMENTO",
                costType: "energy",
                cost: 13,
                cooldown: 4
            }),

            r: Object.freeze({
                id: "stoneRoar",
                name: "RUGIDO DE PEDRA",
                costType: "energy",
                cost: 20,
                cooldown: 6
            }),

            f: Object.freeze({
                id: "earthBreaker",
                name: "RUPTURA DO SOLO",
                costType: "energy",
                cost: 30,
                cooldown: 9
            })
        }),

        lirael: Object.freeze({
            q: Object.freeze({
                id: "vitalLight",
                name: "LUZ VITAL",
                costType: "magic",
                cost: 14,
                cooldown: 4
            }),

            r: Object.freeze({
                id: "fairyBurst",
                name: "RAJADA FEÉRICA",
                costType: "magic",
                cost: 20,
                cooldown: 4.5
            }),

            f: Object.freeze({
                id: "starRain",
                name: "CHUVA DE LUZ",
                costType: "magic",
                cost: 34,
                cooldown: 8
            })
        }),

        zephyr: Object.freeze({
            q: Object.freeze({
                id: "adaptiveCut",
                name: "CORTE ADAPTATIVO",
                costType: "magic",
                cost: 11,
                cooldown: 2.8
            }),

            r: Object.freeze({
                id: "adaptiveForm",
                name: "FORMA ADAPTATIVA",
                costType: "magic",
                cost: 12,
                cooldown: 8
            }),

            f: Object.freeze({
                id: "riftStep",
                name: "PASSO DA FENDA",
                costType: "energy",
                cost: 20,
                cooldown: 6
            })
        })
    });


    /* ============================================================
       MISSÕES
       ============================================================ */

    const QUEST_STATE = Object.freeze({
        NOT_STARTED: "not_started",
        ACTIVE: "active",
        READY: "ready",
        COMPLETE: "complete"
    });


    const QUEST_CONFIG = Object.freeze({
        wood: Object.freeze({
            id: "wood",
            title: "MADEIRA PARA A VILA",
            npcId: "bran",
            itemId: "madeira",
            amount: 10,
            rewardCoins: 100,
            rewardXp: 55
        }),

        coal: Object.freeze({
            id: "coal",
            title: "CARVÃO PARA A FORJA",
            npcId: "borin",
            itemId: "carvao",
            amount: 8,
            rewardCoins: 125,
            rewardXp: 75
        })
    });


    function createBasicQuestState() {
        return {
            state: QUEST_STATE.NOT_STARTED,
            rewarded: false
        };
    }


    /* ============================================================
       A PROVAÇÃO DO VAZIO
       ============================================================ */

    const MIGUEL_QUEST_STAGE = Object.freeze({
        LOCKED: "locked",

        AVAILABLE: "available",

        KEY_SEARCH: "key_search",

        KEY_FOUND_NEEDS_ESSENCE:
            "key_found_needs_essence",

        KEY_COLLECTED:
            "key_collected",

        SECRET_DOOR_OPENED:
            "secret_door_opened",

        DUNGEON_DISCOVERED:
            "dungeon_discovered",

        VAELKOR_ACTIVE:
            "vaelkor_active",

        VAELKOR_DEFEATED:
            "vaelkor_defeated",

        FRAGMENT_READY:
            "fragment_ready",

        FRAGMENT_COLLECTED:
            "fragment_collected",

        RETURN_TO_MIGUEL:
            "return_to_miguel",

        COMPLETED:
            "completed"
    });


    const VOID_MISSION_CONFIG = Object.freeze({
        id: "voidTrial",

        title:
            "A PROVAÇÃO DO VAZIO",

        giverNpc:
            "miguel",

        requiredDashVersion:
            1,

        shadowEssenceItem:
            "essenciaSombria",

        shadowEssenceRequired:
            15,

        consumeEssenceWhenClaimingKey:
            true,

        keyItem:
            "chaveObscura",

        keyArea:
            "celestialFrontier",

        keyPlacement:
            "hidden_before_sky_gate",

        keyHoldSeconds:
            GAME_CONFIG.darkKeyHoldSeconds,

        secretDoorArea:
            "preMonarch",

        /*
            A porta deve ser gerada na parte de cima
            OU de baixo do mapa.

            Nunca simplesmente na lateral.
        */
        secretDoorAllowedEdges:
            Object.freeze([
                "top",
                "bottom"
            ]),

        dungeonArea:
            "voidDungeon",

        minimapInsideDungeon:
            "NO_SIGNAL",

        revealDungeonOnMapAfterVaelkor:
            true,

        revealKeyAreaAfterCollection:
            true,

        bossId:
            "vaelkor",

        fragmentItem:
            "fragmentoVazio",

        fragmentMiniGame:
            Object.freeze({
                rounds: 3,

                /*
                    Fração do círculo considerada
                    zona de acerto.

                    Fica menor a cada rodada.
                */
                targetSizes:
                    Object.freeze([
                        0.28,
                        0.19,
                        0.12
                    ]),

                pointerSpeeds:
                    Object.freeze([
                        1,
                        1.22,
                        1.48
                    ]),

                resetToRoundOneOnMiss:
                    true,

                unlimitedAttempts:
                    true
            })
    });


    function createMiguelQuestState() {
        return {
            stage:
                MIGUEL_QUEST_STAGE.LOCKED,

            miguelFound: false,

            missionAvailable: false,

            missionAccepted: false,

            dashV1SeenByMiguel: false,

            keyLocationDiscovered: false,

            keyCollected: false,

            keyConsumed: false,

            secretDoorFound: false,

            secretDoorOpened: false,

            dungeonDiscovered: false,

            dungeonExitedAfterVictory: false,

            clearedDungeonEnemyIds: [],

            vaelkorActivated: false,

            vaelkorPhaseTwoSeen: false,

            vaelkorDefeated: false,

            vaelkorDeathCutscenePlayed: false,

            fragmentSpawned: false,

            fragmentMiniGameCompleted: false,

            fragmentCollected: false,

            fragmentDelivered: false,

            dashV2Unlocked: false,

            completed: false,

            trackerVisible: false,

            trackerObjective: "",

            objectiveRevision: 0
        };
    }


    function getMiguelQuestObjective(
        quest = state.player?.miguelQuest
    ) {
        if (!quest) {
            return "";
        }

        switch (quest.stage) {
            case MIGUEL_QUEST_STAGE.AVAILABLE:
                return "Fale com Miguel.";

            case MIGUEL_QUEST_STAGE.KEY_SEARCH:
                return "Encontre a Chave Obscura.";

            case MIGUEL_QUEST_STAGE.KEY_FOUND_NEEDS_ESSENCE:
                return `Reúna ${VOID_MISSION_CONFIG.shadowEssenceRequired} Essências Sombrias.`;

            case MIGUEL_QUEST_STAGE.KEY_COLLECTED:
                return "Procure uma passagem trancada no Caminho 1.";

            case MIGUEL_QUEST_STAGE.SECRET_DOOR_OPENED:
            case MIGUEL_QUEST_STAGE.DUNGEON_DISCOVERED:
                return "Explore a Dungeon do Vazio.";

            case MIGUEL_QUEST_STAGE.VAELKOR_ACTIVE:
                return "Derrote Vaelkor.";

            case MIGUEL_QUEST_STAGE.VAELKOR_DEFEATED:
            case MIGUEL_QUEST_STAGE.FRAGMENT_READY:
                return "Colete o Fragmento do Vazio.";

            case MIGUEL_QUEST_STAGE.FRAGMENT_COLLECTED:
            case MIGUEL_QUEST_STAGE.RETURN_TO_MIGUEL:
                return "Retorne para Miguel.";

            case MIGUEL_QUEST_STAGE.COMPLETED:
                return "A Provação do Vazio foi concluída.";

            default:
                return "";
        }
    }


    function setMiguelQuestStage(
        newStage,
        options = {}
    ) {
        const quest =
            state.player?.miguelQuest;

        if (!quest) {
            return false;
        }

        if (
            !Object.values(
                MIGUEL_QUEST_STAGE
            ).includes(newStage)
        ) {
            console.warn(
                "VEYRA: estágio de missão inválido:",
                newStage
            );

            return false;
        }

        if (
            quest.completed &&
            newStage !==
                MIGUEL_QUEST_STAGE.COMPLETED
        ) {
            return false;
        }

        const changed =
            quest.stage !== newStage;

        quest.stage =
            newStage;

        quest.trackerObjective =
            getMiguelQuestObjective(quest);

        quest.trackerVisible =
            Boolean(
                quest.missionAccepted &&
                newStage !==
                    MIGUEL_QUEST_STAGE.LOCKED &&
                newStage !==
                    MIGUEL_QUEST_STAGE.AVAILABLE
            );

        if (changed) {
            quest.objectiveRevision += 1;
        }

        if (
            newStage ===
            MIGUEL_QUEST_STAGE.COMPLETED
        ) {
            quest.completed = true;
            quest.trackerVisible = false;
        }

        if (
            changed &&
            options.silent !== true
        ) {
            state.notifications.push({
                id: uid("objective"),
                type: "objective",
                title: "OBJETIVO ATUALIZADO",
                text:
                    quest.trackerObjective,
                timer: 4.2
            });
        }

        return true;
    }


    function refreshMiguelQuestAvailability() {
        const player =
            state.player;

        if (!player) {
            return;
        }

        const quest =
            player.miguelQuest;

        if (
            quest.completed ||
            quest.missionAccepted
        ) {
            return;
        }

        if (
            player.abilities.dashV1 ||
            player.abilities.dashV2
        ) {
            quest.missionAvailable = true;

            if (
                quest.stage ===
                MIGUEL_QUEST_STAGE.LOCKED
            ) {
                setMiguelQuestStage(
                    MIGUEL_QUEST_STAGE.AVAILABLE,
                    {
                        silent: true
                    }
                );
            }
        }
    }


    /* ============================================================
       DIÁLOGOS DOS NPCs
       ============================================================ */

    const NPC_DIALOGUES = Object.freeze({
        elian: Object.freeze([
            "A Quietude parece estar chegando mais perto. Ontem eu esqueci o nome da rua onde cresci.",
            "Meu pai dizia que a primeira coisa que some não é um lugar. É a lembrança de que ele existia.",
            "A estrada leste está estranha. Um Guardião apareceu por lá e não deixa ninguém passar.",
            "Se você descobrir alguma coisa fora da vila, volte. Precisamos de histórias novas para não esquecer as antigas."
        ]),

        mara: Object.freeze([
            "Os registros mais antigos falam da Quietude como se ela já tivesse acontecido antes.",
            "Cada pessoa descreve a Quietude de um jeito diferente. Isso é o que mais me assusta.",
            "Alguns livros têm páginas inteiras em branco, mas a numeração continua como se algo estivesse faltando.",
            "Quando você encontrar algo que não consegue explicar, tente lembrar de cada detalhe antes de voltar."
        ]),

        doran: Object.freeze([
            "Compro materiais e vendo o que consigo trazer de fora.",
            "Uma boa espada não resolve todos os problemas, mas resolve alguns deles bem rápido.",
            "Guarde dinheiro para quando realmente precisar. As regiões além da vila não são gentis.",
            "Se encontrar cristais ou minérios raros, eu pago bem."
        ]),

        bran: Object.freeze([
            "Preciso reforçar algumas casas. A madeira anda apodrecendo mais rápido desde que a Quietude chegou.",
            "As árvores daqui são estranhas. Algumas voltam a nascer longe do lugar onde caíram.",
            "Se puder trazer dez madeiras, eu pago pelo trabalho.",
            "Cortar madeira consome magia. Não se esgote por causa de uma árvore."
        ]),

        borin: Object.freeze([
            "O fogo da forja ainda lembra como queimar. Por enquanto.",
            "Carvão bom está ficando difícil de encontrar.",
            "Se trouxer oito carvões, posso compensar seu esforço.",
            "Equipamento é investimento. Sobreviver costuma sair mais barato que morrer."
        ]),

        nara: Object.freeze([
            "A floresta percebe quem passa por ela.",
            "Há árvores que se movem quando ninguém está olhando.",
            "A Quietude não mata todas as coisas. Algumas continuam andando sem lembrar por quê.",
            "O caminho adiante só se abre para quem prova que consegue sobreviver aqui."
        ]),

        lyra: Object.freeze([
            "Este bosque guarda memórias nas raízes.",
            "Quando uma árvore cai, às vezes outra nasce carregando lembranças que não são dela.",
            "As montanhas ficam além deste lugar.",
            "Não confunda silêncio com paz."
        ]),

        kael: Object.freeze([
            "O vento daqui apaga pegadas em minutos.",
            "Há uma passagem antiga na montanha.",
            "Minérios abaixo da neve ainda reagem à magia.",
            "Não fique parado por muito tempo. Algumas coisas confundem viajantes com pedras."
        ]),

        miguel: Object.freeze({
            beforeDash: Object.freeze([
                "Você ainda não está preparado. Volte quando seus passos forem mais rápidos que seus olhos."
            ]),

            offerQuest: Object.freeze([
                "Então você finalmente aprendeu a romper o vento...",
                "Mas existe uma técnica que poucos chegaram a conhecer.",
                "Se realmente deseja encontrá-la, existe algo que preciso que recupere.",
                "No Caminho 2 existe uma chave escondida.",
                "Encontre-a. Quando estiver em suas mãos, procure aquilo que permaneceu trancado no Caminho 1."
            ]),

            searchingKey: Object.freeze([
                "A chave continua no Caminho 2.",
                "Não espere que aquilo que a esconde queira ser encontrado."
            ]),

            needsEssence: Object.freeze([
                "Então encontrou a chave...",
                "Mas ela ainda não reconheceu você.",
                "As criaturas do velho labirinto carregam uma essência que pertence à mesma escuridão."
            ]),

            hasKey: Object.freeze([
                "Agora você carrega aquilo que precisava.",
                "O que essa chave abre permanece no Caminho 1.",
                "Não procure pelo caminho mais óbvio."
            ]),

            doorOpened: Object.freeze([
                "Então a passagem realmente existia.",
                "Se vai atravessá-la, não confunda escuridão com vazio."
            ]),

            vaelkorDefeatedNoFragment: Object.freeze([
                "Algo mudou.",
                "Se encontrou aquilo que guardava a passagem, não deixe o que restou para trás."
            ]),

            fragmentReturn: Object.freeze([
                "Então era verdade...",
                "O Fragmento do Vazio ainda existe.",
                "E se conseguiu passar por Vaelkor...",
                "Talvez realmente esteja preparado.",
                "Seu Dash rompe o vento.",
                "Com isto... ele poderá romper o próprio espaço.",
                "Prepare-se."
            ]),

            completed: Object.freeze([
                Object.freeze([
                    "Você alcançou aquilo que muitos sequer chegaram a encontrar.",
                    "Continue avançando. Se pretende libertar seu povo desta maldição, o Vazio não pode ser o fim do seu caminho."
                ]),

                Object.freeze([
                    "Vaelkor não entregava seu poder a qualquer um.",
                    "Agora seus passos atravessam algo que antes separava este mundo do Vazio. Use isso com cuidado."
                ]),

                Object.freeze([
                    "Você voltou diferente.",
                    "Não porque o Vazio venceu você, mas porque aprendeu a atravessá-lo. Continue. Ainda há muito para ser lembrado."
                ])
            ])
        })
    });


    /* ============================================================
       PORTÃO NORTE
       ============================================================ */

    const NORTH_GATE_DIALOGUES = Object.freeze([
        Object.freeze([
            "O caminho à sua frente parece errado. Seu instinto diz que atravessá-lo agora seria uma sentença de morte.",
            "Você ainda não está preparado."
        ]),

        Object.freeze([
            "Algo além deste portão parece rápido demais para ser enfrentado da forma como você está agora.",
            "Talvez exista alguma forma de escapar do que espera adiante."
        ]),

        Object.freeze([
            "Por um instante, você sente que deveria recuar.",
            "Seu corpo ainda não está preparado para sobreviver a este caminho."
        ])
    ]);


    /* ============================================================
       REGIÕES / CAMINHOS

       Caminho 3 e Caminho 4 NÃO são implementados agora.
       ============================================================ */

    const REGION_META = Object.freeze({
        village: Object.freeze({
            id: "village",
            name: "VILA DO CREPÚSCULO",
            route: 0,
            order: 0,
            dark: false
        }),

        forest: Object.freeze({
            id: "forest",
            name: "FLORESTA",
            route: 1,
            order: 1,
            dark: false
        }),

        grove: Object.freeze({
            id: "grove",
            name: "BOSQUE",
            route: 1,
            order: 2,
            dark: false
        }),

        mountains: Object.freeze({
            id: "mountains",
            name: "MONTANHAS",
            route: 1,
            order: 3,
            dark: false
        }),

        iron: Object.freeze({
            id: "iron",
            name: "TERRAS DE FERRO",
            route: 1,
            order: 4,
            dark: false
        }),

        ruby: Object.freeze({
            id: "ruby",
            name: "TERRAS RUBI",
            route: 1,
            order: 5,
            dark: false
        }),

        preMonarch: Object.freeze({
            id: "preMonarch",
            name: "CAMINHO DO LABIRINTO",
            route: 1,
            order: 6,
            dark: true
        }),

        monarchMaze: Object.freeze({
            id: "monarchMaze",
            name: "LABIRINTO DO MONARCA",
            route: 1,
            order: 7,
            dark: true
        }),

        gnomeGardens: Object.freeze({
            id: "gnomeGardens",
            name: "JARDINS DOS GNOMOS",
            route: 2,
            order: 1,
            dark: false
        }),

        fairyKingdom: Object.freeze({
            id: "fairyKingdom",
            name: "REINO FEÉRICO",
            route: 2,
            order: 2,
            dark: false
        }),

        celestialFrontier: Object.freeze({
            id: "celestialFrontier",
            name: "FRONTEIRA CELESTIAL",
            route: 2,
            order: 3,
            dark: false,
            blendedBiome: true
        }),

        celestialStair: Object.freeze({
            id: "celestialStair",
            name: "ESCADARIA CELESTIAL",
            route: 2,
            order: 4,
            dark: false
        }),

        sky1: Object.freeze({
            id: "sky1",
            name: "CÉU I",
            route: 2,
            order: 5,
            dark: false
        }),

        sky2: Object.freeze({
            id: "sky2",
            name: "CÉU II",
            route: 2,
            order: 6,
            dark: false
        }),

        sky3: Object.freeze({
            id: "sky3",
            name: "CÉU III",
            route: 2,
            order: 7,
            dark: false,
            futureAbilityReserved: true
        }),

        voidDungeon: Object.freeze({
            id: "voidDungeon",
            name: "DUNGEON DO VAZIO",
            route: "secret",
            order: 1,
            dark: true,
            secret: true,
            minimapSignal: false
        }),

        hell: Object.freeze({
            id: "hell",
            name: "INFERNO",
            route: "later",
            order: 1,
            dark: true
        }),

        final: Object.freeze({
            id: "final",
            name: "REGIÃO FINAL",
            route: "later",
            order: 2,
            dark: true
        })
    });


    const ROUTE_TWO = Object.freeze({
        name: "CAMINHO 2",

        gate: "north",

        sequence: Object.freeze([
            "gnomeGardens",
            "fairyKingdom",
            "celestialFrontier",
            "celestialStair",
            "sky1",
            "sky2",
            "sky3"
        ]),

        environmentalTransition:
            Object.freeze({
                from: "fairyKingdom",
                through: "celestialFrontier",
                to: "celestialStair",
                loadingScreenBetweenBiomes: false
            }),

        darkKeyBeforeSky: true,

        skyThreeReserved:
            true
    });


    /* ============================================================
       INIMIGOS
       ============================================================ */

    const ENEMY_SPECIES = Object.freeze({
        wolf: Object.freeze({
            id: "wolf",
            name: "LOBO",
            spriteType: "wolf",

            hp: 58,
            damage: 14,
            defense: 2,
            speed: 114,

            vision: 310,
            attackRange: 47,
            radius: 20,

            xp: 18,
            money: 6,

            color: "#666b67",

            ability: Object.freeze({
                id: "wolfCharge",
                type: "charge",

                cooldown: 2,
                telegraph: 0.52,

                speed: 390,
                duration: 0.42,

                damageMultiplier: 1.25
            })
        }),

        boar: Object.freeze({
            id: "boar",
            name: "JAVALI",
            spriteType: "boar",

            hp: 82,
            damage: 18,
            defense: 4,
            speed: 92,

            vision: 290,
            attackRange: 48,
            radius: 23,

            xp: 24,
            money: 8,

            color: "#6c594d",

            ability: Object.freeze({
                id: "heavyCharge",
                type: "heavyCharge",

                cooldown: 3,
                telegraph: 0.7,

                speed: 335,
                duration: 0.5,

                damageMultiplier: 1.42
            })
        }),

        thornling: Object.freeze({
            id: "thornling",
            name: "ESPINHEIRO VIVO",
            spriteType: "thornling",

            hp: 70,
            damage: 15,
            defense: 5,
            speed: 68,

            vision: 320,
            attackRange: 62,
            radius: 21,

            xp: 26,
            money: 9,

            color: "#58724d",

            ability: Object.freeze({
                id: "rootShot",
                type: "rootProjectile",
                cooldown: 2.7
            })
        }),

        stoneCrawler: Object.freeze({
            id: "stoneCrawler",
            name: "RASTEJANTE DE PEDRA",
            spriteType: "crawler",

            hp: 105,
            damage: 21,
            defense: 11,
            speed: 67,

            vision: 280,
            attackRange: 55,
            radius: 24,

            xp: 38,
            money: 13,

            color: "#76756f",

            ability: Object.freeze({
                id: "groundSlam",
                type: "groundSlam",
                cooldown: 3.2
            })
        }),

        mineCrawler: Object.freeze({
            id: "mineCrawler",
            name: "RASTEJANTE DA MINA",
            spriteType: "crawler",

            hp: 112,
            damage: 23,
            defense: 12,
            speed: 70,

            vision: 315,
            attackRange: 56,
            radius: 25,

            xp: 44,
            money: 16,

            color: "#66625b",

            ability: Object.freeze({
                id: "oreBurst",
                type: "oreBurst",
                cooldown: 3.5
            })
        }),

        rubyHound: Object.freeze({
            id: "rubyHound",
            name: "CÃO RUBI",
            spriteType: "rubyHound",

            hp: 126,
            damage: 28,
            defense: 14,
            speed: 126,

            vision: 340,
            attackRange: 52,
            radius: 23,

            xp: 52,
            money: 20,

            color: "#8f3849",

            ability: Object.freeze({
                id: "burningCharge",
                type: "burningCharge",

                cooldown: 2.8,
                telegraph: 0.55,

                speed: 420,
                duration: 0.43,

                damageMultiplier: 1.36
            })
        }),

        spider: Object.freeze({
            id: "spider",
            name: "ARANHA",
            spriteType: "spider",

            hp: 69,
            damage: 17,
            defense: 4,
            speed: 104,

            vision: 310,
            attackRange: 50,
            radius: 18,

            xp: 27,
            money: 9,

            color: "#66556b",

            ability: Object.freeze({
                id: "webSlow",
                type: "webSlow",
                cooldown: 2.8
            })
        }),

        scorpion: Object.freeze({
            id: "scorpion",
            name: "ESCORPIÃO",
            spriteType: "scorpion",

            hp: 91,
            damage: 20,
            defense: 8,
            speed: 91,

            vision: 285,
            attackRange: 62,
            radius: 21,

            xp: 34,
            money: 12,

            color: "#756148",

            ability: Object.freeze({
                id: "poison",
                type: "poison",
                cooldown: 3.1
            })
        }),

        bat: Object.freeze({
            id: "bat",
            name: "MORCEGO",
            spriteType: "bat",

            hp: 47,
            damage: 13,
            defense: 1,
            speed: 138,

            vision: 340,
            attackRange: 42,
            radius: 17,

            xp: 19,
            money: 6,

            color: "#575269",

            ability: Object.freeze({
                id: "dive",
                type: "dive",
                cooldown: 2.5
            })
        }),

        goblin: Object.freeze({
            id: "goblin",
            name: "GOBLIN ERRANTE",
            spriteType: "goblin",

            hp: 78,
            damage: 18,
            defense: 6,
            speed: 100,

            vision: 300,
            attackRange: 56,
            radius: 20,

            xp: 28,
            money: 11,

            color: "#657a4f",

            ability: Object.freeze({
                id: "goblinKnife",
                type: "quickStrike",
                cooldown: 2.1
            })
        }),

        voidSpider: Object.freeze({
            id: "voidSpider",
            name: "ARANHA DO VAZIO",
            spriteType: "voidSpider",

            hp: 125,
            damage: 27,
            defense: 10,
            speed: 120,

            vision: 350,
            attackRange: 56,
            radius: 20,

            xp: 55,
            money: 0,

            color: "#21182c",
            aura: "#7e609d",

            ability: Object.freeze({
                id: "voidWeb",
                type: "voidWeb",
                cooldown: 2.2
            })
        }),

        voidGoblin: Object.freeze({
            id: "voidGoblin",
            name: "GOBLIN CORROMPIDO",
            spriteType: "voidGoblin",

            hp: 142,
            damage: 30,
            defense: 12,
            speed: 112,

            vision: 350,
            attackRange: 60,
            radius: 22,

            xp: 62,
            money: 0,

            color: "#292333",
            aura: "#8e6aa8",

            ability: Object.freeze({
                id: "voidBlinkStrike",
                type: "voidBlinkStrike",
                cooldown: 2.6
            })
        }),

        voidStalker: Object.freeze({
            id: "voidStalker",
            name: "PERSEGUIDOR DO VAZIO",
            spriteType: "voidStalker",

            hp: 166,
            damage: 33,
            defense: 15,
            speed: 125,

            vision: 390,
            attackRange: 65,
            radius: 24,

            xp: 72,
            money: 0,

            color: "#18151e",
            aura: "#70558f",

            ability: Object.freeze({
                id: "voidWave",
                type: "voidWave",
                cooldown: 3
            })
        })
    });


    /* ============================================================
       BOSSES
       ============================================================ */

    const BOSS_REGISTRY = Object.freeze({
        road_guardian: Object.freeze({
            id: "road_guardian",
            name: "GUARDIÃO DA ESTRADA",
            subtitle: "A PRIMEIRA BARREIRA",

            icon: "⚔",
            bodyStyle: "guardian",

            color: "#5e6562",
            aura: "#c5a978",

            topBar: true,
            requiresDash: false
        }),

        forest_warden: Object.freeze({
            id: "forest_warden",
            name: "GUARDIÃO DA FLORESTA",
            subtitle: "O VIGIA DAS RAÍZES",

            icon: "♣",
            bodyStyle: "forestGuardian",

            color: "#405b40",
            aura: "#7eaa65",

            topBar: true,
            requiresDash: false
        }),

        grove_heart: Object.freeze({
            id: "grove_heart",
            name: "CORAÇÃO DO BOSQUE",
            subtitle: "A MEMÓRIA DAS RAÍZES",

            icon: "✤",
            bodyStyle: "groveHeart",

            color: "#59485c",
            aura: "#bc80ab",

            topBar: true,
            requiresDash: false
        }),

        mountain_titan: Object.freeze({
            id: "mountain_titan",
            name: "TITÃ DA MONTANHA",
            subtitle: "A PEDRA QUE NÃO ESQUECE",

            icon: "▲",
            bodyStyle: "titan",

            color: "#747a78",
            aura: "#c5d0cd",

            topBar: true,
            requiresDash: false
        }),

        iron_colossus: Object.freeze({
            id: "iron_colossus",
            name: "COLOSSO DE FERRO",
            subtitle: "A FORJA SEM MESTRE",

            icon: "⬢",
            bodyStyle: "colossus",

            color: "#505257",
            aura: "#a8adb0",

            topBar: true,
            requiresDash: false
        }),

        ruby_chimera: Object.freeze({
            id: "ruby_chimera",
            name: "QUIMERA RUBI",
            subtitle: "A FERA ESCARLATE",

            icon: "♦",
            bodyStyle: "rubyChimera",

            color: "#7c3042",
            aura: "#d7556d",

            topBar: true,
            requiresDash: false
        }),

        monarch: Object.freeze({
            id: "monarch",
            name: "MONARCA",
            subtitle: "AQUELE QUE ACEITOU A OFERENDA",

            icon: "♛",
            bodyStyle: "monarch",

            color: "#332a3a",
            aura: "#9d79b8",

            topBar: true,
            requiresDash: false
        }),

        gnome_guardian: Object.freeze({
            id: "gnome_guardian",
            name: "GUARDIÃO DOS JARDINS",
            subtitle: "O PROTETOR DOS PEQUENOS",

            icon: "✿",
            bodyStyle: "gnomeGuardian",

            color: "#667a50",
            aura: "#e1c977",

            topBar: true,
            requiresDash: true
        }),

        fairy_guardian: Object.freeze({
            id: "fairy_guardian",
            name: "GUARDIÃ FEÉRICA",
            subtitle: "A LUZ ENTRE AS FLORES",

            icon: "✦",
            bodyStyle: "fairyGuardian",

            color: "#8a5e8d",
            aura: "#f0addd",

            topBar: true,
            requiresDash: true
        }),

        celestial_dash_guardian: Object.freeze({
            id: "celestial_dash_guardian",
            name: "VIGIA DA FRONTEIRA",
            subtitle: "AQUELE QUE ATRAVESSA O VENTO",

            icon: "✧",
            bodyStyle: "celestialGuardian",

            color: "#a8b6bd",
            aura: "#f4e8b6",

            topBar: true,
            requiresDash: true,

            /*
                Esse é o boss que começa a testar
                verdadeiramente o domínio do Dash V1.
            */
            usesDash: true
        }),

        stair_guardian: Object.freeze({
            id: "stair_guardian",
            name: "GUARDIÃO DA ESCADARIA CELESTIAL",
            subtitle: "O ÚLTIMO PASSO ANTES DO CÉU",

            icon: "☼",
            bodyStyle: "celestialKnight",

            color: "#c2cbd0",
            aura: "#f4df9f",

            topBar: true,
            requiresDash: true,
            usesDash: true
        }),

        path_guardian: Object.freeze({
            id: "path_guardian",
            name: "GUARDIÃO DO CAMINHO",
            subtitle: "O VIGIA DAS CINCO PROVAÇÕES",

            icon: "✺",
            bodyStyle: "pathGuardian",

            color: "#d0cfbe",
            aura: "#f0dfa5",

            topBar: true,
            requiresDash: true
        }),

        hell_guardian: Object.freeze({
            id: "hell_guardian",
            name: "GUARDIÃO DO INFERNO",
            subtitle: "A PORTA ABAIXO DO MUNDO",

            icon: "♨",
            bodyStyle: "hellGuardian",

            color: "#74352d",
            aura: "#dd6041",

            topBar: true
        }),

        other_self: Object.freeze({
            id: "other_self",
            name: "O OUTRO EU",
            subtitle: "UMA MEMÓRIA QUE NÃO DEVERIA EXISTIR",

            icon: "◐",
            bodyStyle: "mirror",

            color: "#50465a",
            aura: "#ad92bc",

            topBar: true
        }),

        ancient_deer: Object.freeze({
            id: "ancient_deer",
            name: "CERVO ANCESTRAL",
            subtitle: "UMA CRIATURA DE RECURSO",

            icon: "♧",
            bodyStyle: "ancientDeer",

            color: "#695e4e",
            aura: "#a79c75",

            /*
                NÃO recebe barra grande.
            */
            topBar: false,

            bossType: "resourceBoss"
        }),

        vaelkor: Object.freeze({
            id: "vaelkor",

            name: "VAELKOR",

            subtitle:
                "O GUARDIÃO DO VAZIO",

            icon: "◉",

            bodyStyle: "vaelkor",

            color: "#17131d",

            aura: "#73558f",

            coreColor: "#9d76bd",

            topBar: true,

            requiresDash: true,

            stationaryController: true,

            hp: 2300,

            damage: 48,

            defense: 27,

            radius: 58,

            /*
                Vaelkor praticamente NÃO persegue.
                Movimento pequeno será apenas visual.
            */
            moveSpeed: 0,

            phaseTwoAt: 0.5,

            attacks: Object.freeze({
                voidBarrage:
                    Object.freeze({
                        id: "voidBarrage",
                        name: "RAJADA DO VAZIO",

                        telegraph: 0.75,

                        baseOrbCount: 8,

                        phaseTwoOrbCount: 12,

                        projectileSpeed: 305,

                        phaseTwoProjectileSpeed: 350,

                        spreadRadians:
                            Math.PI * 1.55,

                        damageMultiplier: 0.62,

                        minSafeGapRadians: 0.28
                    }),

                voidBeam:
                    Object.freeze({
                        id: "voidBeam",
                        name: "FEIXE DO VAZIO",

                        telegraph: 1.25,

                        phaseTwoTelegraph: 0.93,

                        width: 78,

                        length: 900,

                        duration: 0.55,

                        damageMultiplier: 1.65,

                        trackingStopsBeforeFire:
                            0.38
                    }),

                shadowSummon:
                    Object.freeze({
                        id: "shadowSummon",
                        name: "INVOCAÇÃO SOMBRIA",

                        telegraph: 0.82,

                        phaseOneCount: 2,

                        phaseTwoCount: 3,

                        maxAliveSummons: 4,

                        portalDuration: 0.72,

                        species:
                            Object.freeze([
                                "voidSpider",
                                "voidGoblin",
                                "voidStalker"
                            ])
                    })
            }),

            phaseOne:
                Object.freeze({
                    attackIntervalMin: 2.7,
                    attackIntervalMax: 4,

                    maxConcurrentPatterns: 1,

                    combinationsEnabled: false
                }),

            transition:
                Object.freeze({
                    duration: 3.2,

                    dialogue:
                        Object.freeze([
                            "Você aprendeu a fugir...",
                            "Agora mostre-me se consegue sobreviver."
                        ])
                }),

            phaseTwo:
                Object.freeze({
                    attackIntervalMin: 1.7,
                    attackIntervalMax: 2.7,

                    maxConcurrentPatterns: 2,

                    combinations:
                        Object.freeze([
                            Object.freeze([
                                "voidBarrage",
                                "shadowSummon"
                            ]),

                            Object.freeze([
                                "voidBeam",
                                "shadowSummon"
                            ]),

                            Object.freeze([
                                "voidBarrage",
                                "voidBeam"
                            ])
                        ]),

                    finalHealthThreshold:
                        0.2,

                    finalCombination:
                        Object.freeze([
                            "voidBarrage",
                            "voidBeam",
                            "shadowSummon"
                        ]),

                    /*
                        Mesmo nas combinações mais fortes,
                        os padrões terão uma janela de segurança.
                    */
                    safetyWindow: 0.72
                }),

            deathSequence:
                Object.freeze({
                    freezeAttacks: true,

                    removeSummons: true,

                    fragmentScatterDuration:
                        1.35,

                    fragmentGatherDuration:
                        1.4,

                    implosionDuration:
                        0.75,

                    explosionDuration:
                        0.85,

                    spawnFragmentAfter:
                        true
                })
        })
    });


    function getBossDefinition(id) {
        return BOSS_REGISTRY[id] || null;
    }


    function shouldBossUseTopBar(enemy) {
        if (!enemy) {
            return false;
        }

        const definition =
            getBossDefinition(enemy.id);

        if (definition) {
            return definition.topBar === true;
        }

        return enemy.topBar === true;
    }


    /* ============================================================
       MAPA / ESTILOS DOS BIOMAS
       ============================================================ */

    const BIOME_STYLE = Object.freeze({
        village: Object.freeze({
            ground: "#536249",
            groundAlt: "#607055",
            accent: "#9c8661"
        }),

        forest: Object.freeze({
            ground: "#354c35",
            groundAlt: "#405a3d",
            accent: "#6d8a58"
        }),

        grove: Object.freeze({
            ground: "#465747",
            groundAlt: "#53644f",
            accent: "#9f7495"
        }),

        mountains: Object.freeze({
            ground: "#767c79",
            groundAlt: "#858c89",
            accent: "#d0d5d3"
        }),

        iron: Object.freeze({
            ground: "#4f504e",
            groundAlt: "#5d5e5a",
            accent: "#93938d"
        }),

        ruby: Object.freeze({
            ground: "#53383f",
            groundAlt: "#614048",
            accent: "#aa4a5c"
        }),

        preMonarch: Object.freeze({
            ground: "#29262e",
            groundAlt: "#34303a",
            accent: "#695777"
        }),

        monarchMaze: Object.freeze({
            ground: "#242128",
            groundAlt: "#312c36",
            accent: "#735c82"
        }),

        gnomeGardens: Object.freeze({
            ground: "#66825c",
            groundAlt: "#76956a",
            accent: "#e3c76f"
        }),

        fairyKingdom: Object.freeze({
            ground: "#716b7d",
            groundAlt: "#82768d",
            accent: "#e8a7d3"
        }),

        celestialFrontier: Object.freeze({
            /*
                Essa região terá transição gradual
                FADA -> CÉU na Parte 2/4.
            */
            ground: "#9aa3a5",
            groundAlt: "#adb6b7",
            accent: "#eadba9"
        }),

        celestialStair: Object.freeze({
            ground: "#c2c9c8",
            groundAlt: "#d1d5d1",
            accent: "#f2e1a9"
        }),

        sky1: Object.freeze({
            ground: "#c8d0d2",
            groundAlt: "#d5dcde",
            accent: "#f0dda5"
        }),

        sky2: Object.freeze({
            ground: "#bfcdd4",
            groundAlt: "#d4dde0",
            accent: "#eee1b5"
        }),

        sky3: Object.freeze({
            ground: "#b6c8d2",
            groundAlt: "#cad9de",
            accent: "#f5e3ac"
        }),

        voidDungeon: Object.freeze({
            ground: "#151219",
            groundAlt: "#1e1924",
            accent: "#75568d"
        }),

        hell: Object.freeze({
            ground: "#4d302b",
            groundAlt: "#60362f",
            accent: "#b94b35"
        }),

        final: Object.freeze({
            ground: "#44404c",
            groundAlt: "#514b5a",
            accent: "#8f7c9d"
        })
    });


    const PATH_STYLE_CONFIG =
        Object.freeze({
            village: Object.freeze({
                base: "#918060",
                edge: "#695c45",
                detail: "#b59d72"
            }),

            forest: Object.freeze({
                base: "#625d43",
                edge: "#494831",
                detail: "#7a7653"
            }),

            grove: Object.freeze({
                base: "#726772",
                edge: "#514d56",
                detail: "#987f92"
            }),

            mountains: Object.freeze({
                base: "#878681",
                edge: "#626766",
                detail: "#babcb9"
            }),

            iron: Object.freeze({
                base: "#55524d",
                edge: "#343537",
                detail: "#7a7975"
            }),

            ruby: Object.freeze({
                base: "#5c3b41",
                edge: "#35262b",
                detail: "#a64b5c"
            }),

            preMonarch: Object.freeze({
                base: "#302b35",
                edge: "#18151c",
                detail: "#5d4d69"
            }),

            monarchMaze: Object.freeze({
                base: "#302b35",
                edge: "#18151c",
                detail: "#5d4d69"
            }),

            gnomeGardens: Object.freeze({
                base: "#9a8d64",
                edge: "#6b6548",
                detail: "#d3bd78"
            }),

            fairyKingdom: Object.freeze({
                base: "#9b8198",
                edge: "#65596d",
                detail: "#d6a5cb"
            }),

            celestialFrontier: Object.freeze({
                base: "#b3ada1",
                edge: "#81898b",
                detail: "#eee1b8"
            }),

            celestialStair: Object.freeze({
                base: "#d0cec4",
                edge: "#969c9c",
                detail: "#f2e1ad"
            }),

            sky1: Object.freeze({
                base: "#d5d6cf",
                edge: "#9ca8ad",
                detail: "#f0dfa7"
            }),

            sky2: Object.freeze({
                base: "#d1d8d7",
                edge: "#98a8ad",
                detail: "#f4e5ba"
            }),

            sky3: Object.freeze({
                base: "#d6dcda",
                edge: "#9bacb4",
                detail: "#f6e5af"
            }),

            voidDungeon: Object.freeze({
                base: "#24202a",
                edge: "#0e0c11",
                detail: "#5f4775"
            }),

            hell: Object.freeze({
                base: "#58352f",
                edge: "#302020",
                detail: "#a44732"
            }),

            final: Object.freeze({
                base: "#4a4551",
                edge: "#242127",
                detail: "#85768f"
            })
        });


    function getBiomeStyle(area = state.area) {
        return (
            BIOME_STYLE[area] ||
            BIOME_STYLE.village
        );
    }


    function getPathStyle(area = state.area) {
        return (
            PATH_STYLE_CONFIG[area] ||
            PATH_STYLE_CONFIG.village
        );
    }


    /* ============================================================
       RUNTIME DEV / COMANDOS PRIVADOS

       Painel, senha e eventos entram na Parte 5.
       Aqui fica somente o estado seguro.
       ============================================================ */

    const DEV_STORAGE_KEYS = Object.freeze({
        passwordHash:
            "veyra_dev_password_hash_v30",

        passwordAlgorithm:
            "veyra_dev_password_algorithm_v30",

        rememberAccess:
            "veyra_dev_remember_v30",

        privacy:
            "veyra_dev_privacy_v30",

        rememberedUnlock:
            "veyra_dev_unlocked_v30"
    });


    const DEV_SHORTCUTS = Object.freeze({
        panel: "KeyY",

        infiniteLife: "Digit1",
        extremeDamage: "Digit2",
        infiniteMagic: "Digit3",
        infiniteEnergy: "Digit4",
        infiniteHunger: "Digit5",
        infiniteFatigue: "Digit6",
        infiniteMoney: "Digit7",
        infiniteMaterials: "Digit8",
        enableAll: "Digit9",
        disableAll: "Digit0"
    });


    function createDevRuntime() {
        return {
            unlocked: false,

            panelOpen: false,

            keys: new Set(),

            infiniteLife: false,

            extremeDamage: false,

            infiniteMagic: false,

            infiniteEnergy: false,

            infiniteHunger: false,

            infiniteFatigue: false,

            infiniteMoney: false,

            infiniteMaterials: false,

            rememberAccess: false,

            privacy: true
        };
    }


    /* ============================================================
       ESTADO PRINCIPAL
       ============================================================ */

    const state = {
        initialized: false,

        running: false,

        paused: false,

        pauseReasons: new Set(),

        selectedCharacter:
            CHARACTERS[0],

        player: null,

        area: "village",

        world: null,

        houseMode: false,

        currentHouse: null,

        houseReturn: null,

        camera: {
            x: 0,
            y: 0,

            targetX: 0,
            targetY: 0,

            mode: "player"
        },

        pointer: {
            x: 0,
            y: 0,

            worldX: 0,
            worldY: 0,

            down: false
        },

        keys: new Set(),

        dialogue: null,

        activePanel: null,

        travel: null,

        battle: null,

        shopNPC: null,

        shopMode: "buy",

        questNPC: null,

        holdAction: null,

        cutscene: null,

        cutsceneQueue: [],

        transition: null,

        transitionQueue: [],

        bossBarTarget: null,

        bloodMarks: [],

        screenShake: 0,

        screenShakePower: 0,

        damageFlash: 0,

        darknessWarningAt: 0,

        portalCooldown: 0,

        autosaveTimer: 0,

        time: 0,

        lastTime: 0,

        notifications: [],

        itemPresentation: null,

        missionPresentation: null,

        fragmentMinigame: null,

        deathState: null,

        warnedNeedAt: 0,

        dev:
            createDevRuntime(),

        /*
            Flags puramente runtime da dungeon.
            Dados permanentes ficam no player.miguelQuest.
        */
        voidRuntime: {
            inside: false,

            arenaEntered: false,

            arenaLocked: false,

            vaelkorIntroPlayedThisAttempt: false,

            vaelkorFightStarted: false,

            fragmentEntityCreated: false,

            respawnAttempt: 0
        }
    };


    /* ============================================================
       INVENTÁRIO / PESO
       ============================================================ */

    function getRealItemCount(id) {
        if (
            !state.player ||
            !isKnownItem(id)
        ) {
            return 0;
        }

        return Math.max(
            0,
            integer(
                state.player.inventory?.[id],
                0
            )
        );
    }


    function getItemCount(id) {
        const item =
            ITEMS[id];

        if (!item) {
            return 0;
        }

        if (
            state.dev.unlocked &&
            state.dev.infiniteMaterials &&
            item.category === "materials"
        ) {
            return Number.POSITIVE_INFINITY;
        }

        return getRealItemCount(id);
    }


    function calculateInventoryWeight(
        player = state.player
    ) {
        if (!player) {
            return 0;
        }

        let total = 0;

        for (
            const [id, amount] of
            Object.entries(
                player.inventory || {}
            )
        ) {
            const item =
                ITEMS[id];

            if (
                !item ||
                amount <= 0
            ) {
                continue;
            }

            total +=
                item.weight * amount;
        }

        return total;
    }


    function getInventoryWeight() {
        return calculateInventoryWeight(
            state.player
        );
    }


    function canCarryItem(id, amount = 1) {
        const player =
            state.player;

        const item =
            ITEMS[id];

        if (
            !player ||
            !item ||
            amount <= 0
        ) {
            return false;
        }

        if (
            item.unique &&
            getRealItemCount(id) > 0
        ) {
            return false;
        }

        if (
            state.dev.unlocked &&
            state.dev.infiniteMaterials &&
            item.category === "materials"
        ) {
            return true;
        }

        const futureWeight =
            calculateInventoryWeight(player) +
            item.weight * amount;

        return (
            futureWeight <=
            player.inventoryWeightLimit +
            0.0001
        );
    }


    function addItem(
        id,
        amount = 1,
        options = {}
    ) {
        const player =
            state.player;

        const item =
            ITEMS[id];

        const safeAmount =
            Math.max(
                0,
                integer(amount, 0)
            );

        if (
            !player ||
            !item ||
            safeAmount <= 0
        ) {
            return false;
        }

        if (
            item.unique &&
            getRealItemCount(id) > 0
        ) {
            return false;
        }

        if (
            !canCarryItem(
                id,
                safeAmount
            )
        ) {
            return false;
        }

        player.inventory[id] =
            getRealItemCount(id) +
            safeAmount;

        if (
            options.silent !== true
        ) {
            state.notifications.push({
                id: uid("item"),
                type: "item",
                title: "ITEM OBTIDO",
                text:
                    `${safeAmount}x ${item.name}`,
                timer: 2.8
            });
        }

        return true;
    }


    function removeItem(
        id,
        amount = 1
    ) {
        const player =
            state.player;

        const item =
            ITEMS[id];

        const safeAmount =
            Math.max(
                0,
                integer(amount, 0)
            );

        if (
            !player ||
            !item ||
            safeAmount <= 0
        ) {
            return false;
        }

        if (
            state.dev.unlocked &&
            state.dev.infiniteMaterials &&
            item.category === "materials"
        ) {
            return true;
        }

        const current =
            getRealItemCount(id);

        if (
            current <
            safeAmount
        ) {
            return false;
        }

        player.inventory[id] =
            current -
            safeAmount;

        return true;
    }


    /* ============================================================
       ECONOMIA
       ============================================================ */

    function getMoney() {
        return Math.max(
            0,
            integer(
                state.player?.money,
                0
            )
        );
    }


    function getMoneyDisplay() {
        if (
            state.dev.unlocked &&
            state.dev.infiniteMoney
        ) {
            return "∞";
        }

        return String(
            getMoney()
        );
    }


    function hasEnoughMoney(amount) {
        if (
            state.dev.unlocked &&
            state.dev.infiniteMoney
        ) {
            return true;
        }

        return (
            getMoney() >=
            Math.max(
                0,
                integer(amount, 0)
            )
        );
    }


    function addMoney(amount) {
        if (!state.player) {
            return false;
        }

        const safeAmount =
            Math.max(
                0,
                integer(amount, 0)
            );

        state.player.money =
            getMoney() +
            safeAmount;

        return true;
    }


    function spendMoney(amount) {
        if (!state.player) {
            return false;
        }

        const safeAmount =
            Math.max(
                0,
                integer(amount, 0)
            );

        if (
            state.dev.unlocked &&
            state.dev.infiniteMoney
        ) {
            return true;
        }

        if (
            getMoney() <
            safeAmount
        ) {
            return false;
        }

        state.player.money =
            getMoney() -
            safeAmount;

        return true;
    }


    /* ============================================================
       ARMADURA — HELPERS
       ============================================================ */

    function playerOwnsArmor(
        id,
        player = state.player
    ) {
        if (
            !player ||
            !ARMOR_DATA[id]
        ) {
            return false;
        }

        return (
            integer(
                player.inventory?.[id],
                0
            ) > 0 ||
            player.equipment?.armor === id
        );
    }


    function getHighestOwnedArmorTier(
        player = state.player
    ) {
        if (!player) {
            return 0;
        }

        let tier =
            Math.max(
                0,
                integer(
                    player.armorHighestTierEver,
                    0
                )
            );

        for (
            const id of
            ARMOR_PROGRESSION
        ) {
            if (
                playerOwnsArmor(
                    id,
                    player
                )
            ) {
                tier =
                    Math.max(
                        tier,
                        getArmorTier(id)
                    );
            }
        }

        return tier;
    }


    function getNextArmorUpgradeId(
        player = state.player
    ) {
        if (!player) {
            return ARMOR_PROGRESSION[0];
        }

        const tier =
            getHighestOwnedArmorTier(player);

        if (
            tier >=
            ARMOR_PROGRESSION.length
        ) {
            return null;
        }

        return ARMOR_PROGRESSION[tier];
    }


    function isArmorNextUpgrade(
        id,
        player = state.player
    ) {
        return (
            getNextArmorUpgradeId(player) === id
        );
    }


    /* ============================================================
       CRIAÇÃO DO JOGADOR
       ============================================================ */

    function sanitizePlayerName(name, fallback) {
        const safe =
            String(name ?? "")
                .trim()
                .replace(
                    /\s+/g,
                    " "
                )
                .slice(0, 16);

        return (
            safe ||
            fallback ||
            "Viajante"
        );
    }


    function createNewPlayer(
        characterOrId,
        requestedName
    ) {
        const character =
            typeof characterOrId ===
            "string"
                ? getCharacterById(characterOrId)
                : characterOrId;

        const resolved =
            character ||
            CHARACTERS[0];

        const player = {
            name:
                sanitizePlayerName(
                    requestedName,
                    resolved.name
                ),

            characterId:
                resolved.id,

            className:
                resolved.className,

            x:
                PLAYER_HOME
                    .interiorSpawn
                    .x,

            y:
                PLAYER_HOME
                    .interiorSpawn
                    .y,

            facing:
                PLAYER_HOME
                    .interiorSpawn
                    .facing,

            radius: 18,

            level: 1,

            xp: 0,

            xpToNext:
                calculateXpToNext(1),

            statPoints: 0,

            stats:
                createEmptyStats(),

            base: {
                hp:
                    resolved.hp,

                magic:
                    resolved.magic,

                energy:
                    resolved.energy,

                damage:
                    resolved.damage,

                defense:
                    resolved.defense,

                speed:
                    resolved.speed
            },

            hp:
                resolved.hp,

            maxHp:
                resolved.hp,

            magic:
                resolved.magic,

            maxMagic:
                resolved.magic,

            energy:
                resolved.energy,

            maxEnergy:
                resolved.energy,

            hunger: 100,

            maxHunger: 100,

            fatigue: 100,

            maxFatigue: 100,

            damage:
                resolved.damage,

            defense:
                resolved.defense,

            speed:
                resolved.speed,

            money: 0,

            inventory:
                createEmptyInventory(),

            inventoryWeightLimit: 65,

            equipment: {
                weapon: null,
                armor: null,
                tool: null
            },

            armorHighestTierEver: 0,

            purchasedUniqueItems: [],

            lanternOwned: false,

            minimapOwned: false,

            activePotionBuffs: [],

            classBuffs: [],

            attackCooldown: 0,

            skillCooldowns: {
                q: 0,
                r: 0,
                f: 0
            },

            universalDashCooldown: 0,

            dashRuntime: null,

            abilities: {
                dashV1: false,
                dashV2: false
            },

            defeatedBosses: [],

            discoveredBosses: [],

            unlockedAreas: [
                "village"
            ],

            exploredAreas: [
                "village"
            ],

            discoveredMapLocations: [],

            gateUnlocks: {
                east: false,
                north: false,
                west: false,
                south: false
            },

            gateDialogueIndex: {
                north: 0
            },

            quest: {
                wood:
                    createBasicQuestState(),

                coal:
                    createBasicQuestState()
            },

            miguelQuest:
                createMiguelQuestState(),

            monarchAwakened: false,

            monarchDefeated: false,

            dashRitualCompleted: false,

            skyTrial: {
                started: false,
                wave: 0,
                activeWave: 0,
                complete: false
            },

            fluteRewardGranted: false,

            flutePlayed: false,

            walkTime: 0,

            invincible: 0,

            hurtAnim: 0,

            movementSlowTimer: 0,

            movementSlowMultiplier: 1,

            poisonEffect: null,

            resting: {
                active: false,
                timer: 0,
                duration: 0
            },

            dead: false
        };

        /*
            Nenhum atributo adicional é dado
            automaticamente na criação.
        */

        return player;
    }


    /* ============================================================
       RECÁLCULO DE STATUS

       IMPORTANTE:
       - level NÃO entra nas fórmulas.
       - somente status distribuídos/equipamentos/buffs.
       ============================================================ */

    function recalculatePlayerStats(
        options = {}
    ) {
        const player =
            state.player;

        if (!player) {
            return;
        }

        const character =
            getCharacterById(
                player.characterId
            ) ||
            CHARACTERS[0];

        const oldMaxHp =
            Math.max(
                1,
                finiteNumber(
                    player.maxHp,
                    character.hp
                )
            );

        const oldHpRatio =
            clamp(
                finiteNumber(
                    player.hp,
                    oldMaxHp
                ) /
                oldMaxHp,
                0,
                1
            );

        const oldMaxMagic =
            Math.max(
                1,
                finiteNumber(
                    player.maxMagic,
                    character.magic
                )
            );

        const magicRatio =
            clamp(
                finiteNumber(
                    player.magic,
                    oldMaxMagic
                ) /
                oldMaxMagic,
                0,
                1
            );

        const oldMaxEnergy =
            Math.max(
                1,
                finiteNumber(
                    player.maxEnergy,
                    character.energy
                )
            );

        const energyRatio =
            clamp(
                finiteNumber(
                    player.energy,
                    oldMaxEnergy
                ) /
                oldMaxEnergy,
                0,
                1
            );

        const powerPoints =
            clamp(
                integer(
                    player.stats?.power,
                    0
                ),
                0,
                STAT_CAP
            );

        const energyPoints =
            clamp(
                integer(
                    player.stats?.energy,
                    0
                ),
                0,
                STAT_CAP
            );

        const hungerPoints =
            clamp(
                integer(
                    player.stats?.hunger,
                    0
                ),
                0,
                STAT_CAP
            );

        const fatiguePoints =
            clamp(
                integer(
                    player.stats?.fatigue,
                    0
                ),
                0,
                STAT_CAP
            );

        const armor =
            ARMOR_DATA[
                player.equipment?.armor
            ] || null;

        const weapon =
            ITEMS[
                player.equipment?.weapon
            ] || null;

        let damageMultiplier =
            1 +
            powerPoints * 0.02;

        let speedMultiplier =
            1;

        let defenseBonus = 0;

        for (
            const buff of
            safeArray(
                player.activePotionBuffs
            )
        ) {
            if (
                buff.type === "damage"
            ) {
                damageMultiplier *=
                    finiteNumber(
                        buff.multiplier,
                        1
                    );
            }

            if (
                buff.type === "speed"
            ) {
                speedMultiplier *=
                    finiteNumber(
                        buff.speedMultiplier,
                        1
                    );
            }

            if (
                buff.type === "defense"
            ) {
                defenseBonus +=
                    finiteNumber(
                        buff.defenseBonus,
                        0
                    );
            }
        }

        for (
            const buff of
            safeArray(
                player.classBuffs
            )
        ) {
            damageMultiplier *=
                finiteNumber(
                    buff.damageMultiplier,
                    1
                );

            speedMultiplier *=
                finiteNumber(
                    buff.speedMultiplier,
                    1
                );

            defenseBonus +=
                finiteNumber(
                    buff.defenseBonus,
                    0
                );
        }

        player.maxHp =
            character.hp +
            (
                armor?.maxHpBonus ||
                0
            );

        player.maxMagic =
            character.magic +
            powerPoints * 4;

        player.maxEnergy =
            character.energy +
            energyPoints * 5;

        player.maxHunger =
            100 +
            hungerPoints * 3;

        player.maxFatigue =
            100 +
            fatiguePoints * 3;

        player.damage =
            (
                character.damage +
                finiteNumber(
                    weapon?.damage,
                    0
                )
            ) *
            damageMultiplier;

        player.defense =
            character.defense +
            (
                armor?.defense ||
                0
            ) +
            defenseBonus;

        player.speed =
            character.speed *
            speedMultiplier;

        /*
            Trocar armadura preserva a proporção
            da vida para impedir exploit de cura.
        */
        if (
            options.fillResources === true
        ) {
            player.hp =
                player.maxHp;

            player.magic =
                player.maxMagic;

            player.energy =
                player.maxEnergy;

            player.hunger =
                player.maxHunger;

            player.fatigue =
                player.maxFatigue;
        } else {
            player.hp =
                clamp(
                    player.maxHp *
                    oldHpRatio,
                    0,
                    player.maxHp
                );

            player.magic =
                clamp(
                    player.maxMagic *
                    magicRatio,
                    0,
                    player.maxMagic
                );

            player.energy =
                clamp(
                    player.maxEnergy *
                    energyRatio,
                    0,
                    player.maxEnergy
                );

            player.hunger =
                clamp(
                    finiteNumber(
                        player.hunger,
                        player.maxHunger
                    ),
                    0,
                    player.maxHunger
                );

            player.fatigue =
                clamp(
                    finiteNumber(
                        player.fatigue,
                        player.maxFatigue
                    ),
                    0,
                    player.maxFatigue
                );
        }

        player.stats.power =
            powerPoints;

        player.stats.energy =
            energyPoints;

        player.stats.hunger =
            hungerPoints;

        player.stats.fatigue =
            fatiguePoints;
    }


    /* ============================================================
       LEVEL / XP
       ============================================================ */

    function gainXP(amount) {
        const player =
            state.player;

        if (
            !player ||
            player.level >= MAX_LEVEL
        ) {
            return false;
        }

        const gained =
            Math.max(
                0,
                integer(amount, 0)
            );

        if (
            gained <= 0
        ) {
            return false;
        }

        player.xp += gained;

        let leveled = false;

        while (
            player.level < MAX_LEVEL &&
            player.xp >=
                player.xpToNext
        ) {
            player.xp -=
                player.xpToNext;

            player.level += 1;

            player.statPoints +=
                STATUS_POINTS_PER_LEVEL;

            leveled = true;

            if (
                player.level >= MAX_LEVEL
            ) {
                player.xp = 0;
                player.xpToNext = Infinity;
                break;
            }

            player.xpToNext =
                calculateXpToNext(
                    player.level
                );

            state.notifications.push({
                id: uid("level"),
                type: "level",
                title:
                    `NÍVEL ${player.level}`,
                text:
                    `+${STATUS_POINTS_PER_LEVEL} pontos de status`,
                timer: 4
            });
        }

        /*
            Não chama recalculatePlayerStats().

            Isso é proposital:
            level sozinho não muda atributo.
        */

        return leveled;
    }


    function canAllocateStat(statId) {
        const player =
            state.player;

        if (
            !player ||
            player.statPoints <= 0 ||
            !STAT_CONFIG[statId]
        ) {
            return false;
        }

        return (
            finiteNumber(
                player.stats?.[statId],
                0
            ) < STAT_CAP
        );
    }


    function allocateStatPoint(statId) {
        const player =
            state.player;

        if (
            !canAllocateStat(statId)
        ) {
            return false;
        }

        player.stats[statId] += 1;

        player.statPoints -= 1;

        recalculatePlayerStats();

        return true;
    }


    /* ============================================================
       DEV HELPERS

       Cheats não alteram o save normal.
       ============================================================ */

    function devShouldIgnorePlayerDamage() {
        return Boolean(
            state.dev.unlocked &&
            state.dev.infiniteLife
        );
    }


    function devModifyOutgoingDamage(damage) {
        if (
            state.dev.unlocked &&
            state.dev.extremeDamage
        ) {
            return Math.max(
                99999,
                finiteNumber(damage, 1)
            );
        }

        return finiteNumber(
            damage,
            1
        );
    }


    function maintainDevInfiniteResources() {
        const player =
            state.player;

        if (
            !player ||
            !state.dev.unlocked
        ) {
            return;
        }

        if (
            state.dev.infiniteLife
        ) {
            player.hp =
                player.maxHp;
        }

        if (
            state.dev.infiniteMagic
        ) {
            player.magic =
                player.maxMagic;
        }

        if (
            state.dev.infiniteEnergy
        ) {
            player.energy =
                player.maxEnergy;
        }

        if (
            state.dev.infiniteHunger
        ) {
            player.hunger =
                player.maxHunger;
        }

        if (
            state.dev.infiniteFatigue
        ) {
            player.fatigue =
                player.maxFatigue;
        }
    }


    /* ============================================================
       PROGRESSÃO / FLAGS
       ============================================================ */

    function hasDefeatedBoss(
        id,
        player = state.player
    ) {
        return Boolean(
            player &&
            safeArray(
                player.defeatedBosses
            ).includes(id)
        );
    }


    function markBossDefeated(
        id,
        player = state.player
    ) {
        if (
            !player ||
            !BOSS_REGISTRY[id]
        ) {
            return false;
        }

        if (
            !player.defeatedBosses.includes(id)
        ) {
            player.defeatedBosses.push(id);
        }

        return true;
    }


    function markBossDiscovered(
        id,
        player = state.player
    ) {
        if (
            !player ||
            !BOSS_REGISTRY[id]
        ) {
            return false;
        }

        if (
            !player.discoveredBosses.includes(id)
        ) {
            player.discoveredBosses.push(id);
        }

        return true;
    }


    function unlockArea(
        id,
        player = state.player
    ) {
        if (
            !player ||
            !REGION_META[id]
        ) {
            return false;
        }

        if (
            !player.unlockedAreas.includes(id)
        ) {
            player.unlockedAreas.push(id);
        }

        return true;
    }


    function discoverArea(
        id,
        player = state.player
    ) {
        if (
            !player ||
            !REGION_META[id]
        ) {
            return false;
        }

        if (
            !player.exploredAreas.includes(id)
        ) {
            player.exploredAreas.push(id);
        }

        return true;
    }


    function markMapLocationDiscovered(
        id,
        player = state.player
    ) {
        if (!player) {
            return false;
        }

        if (
            !player.discoveredMapLocations.includes(id)
        ) {
            player.discoveredMapLocations.push(id);
        }

        return true;
    }


    /* ============================================================
       DASH — PROGRESSÃO
       ============================================================ */

    function unlockDashV1(
        player = state.player
    ) {
        if (!player) {
            return false;
        }

        if (
            player.abilities.dashV2
        ) {
            /*
                Nunca regredir V2 para V1.
            */
            return false;
        }

        if (
            player.abilities.dashV1
        ) {
            return false;
        }

        player.abilities.dashV1 = true;

        player.dashRitualCompleted = true;

        refreshMiguelQuestAvailability();

        return true;
    }


    function unlockDashV2(
        player = state.player
    ) {
        if (!player) {
            return false;
        }

        if (
            player.abilities.dashV2
        ) {
            return false;
        }

        player.abilities.dashV1 = true;
        player.abilities.dashV2 = true;

        player.miguelQuest.dashV2Unlocked = true;
        player.miguelQuest.fragmentDelivered = true;
        player.miguelQuest.completed = true;

        setMiguelQuestStage(
            MIGUEL_QUEST_STAGE.COMPLETED,
            {
                silent: true
            }
        );

        return true;
    }


    /* ============================================================
       ESSÊNCIA / CHAVE OBSCURA
       ============================================================ */

    function getShadowEssenceCount() {
        return getItemCount(
            VOID_MISSION_CONFIG
                .shadowEssenceItem
        );
    }


    function hasEnoughShadowEssence() {
        return (
            getShadowEssenceCount() >=
            VOID_MISSION_CONFIG
                .shadowEssenceRequired
        );
    }


    function canClaimDarkKey() {
        const player =
            state.player;

        if (!player) {
            return false;
        }

        const quest =
            player.miguelQuest;

        return Boolean(
            quest.missionAccepted &&
            !quest.keyCollected &&
            !quest.keyConsumed &&
            hasEnoughShadowEssence()
        );
    }


    function claimDarkKey() {
        const player =
            state.player;

        if (
            !player ||
            !canClaimDarkKey()
        ) {
            return false;
        }

        if (
            VOID_MISSION_CONFIG
                .consumeEssenceWhenClaimingKey
        ) {
            const removed =
                removeItem(
                    VOID_MISSION_CONFIG
                        .shadowEssenceItem,

                    VOID_MISSION_CONFIG
                        .shadowEssenceRequired
                );

            if (!removed) {
                return false;
            }
        }

        const added =
            addItem(
                VOID_MISSION_CONFIG
                    .keyItem,
                1,
                {
                    silent: true
                }
            );

        if (!added) {
            /*
                Rollback da essência caso algo
                excepcional impeça a chave.
            */
            if (
                VOID_MISSION_CONFIG
                    .consumeEssenceWhenClaimingKey
            ) {
                addItem(
                    VOID_MISSION_CONFIG
                        .shadowEssenceItem,

                    VOID_MISSION_CONFIG
                        .shadowEssenceRequired,

                    {
                        silent: true
                    }
                );
            }

            return false;
        }

        player.miguelQuest.keyCollected = true;

        markMapLocationDiscovered(
            "dark_key_location"
        );

        setMiguelQuestStage(
            MIGUEL_QUEST_STAGE.KEY_COLLECTED
        );

        return true;
    }


    /* ============================================================
       FRAGMENTO DO VAZIO
       ============================================================ */

    function canSpawnVoidFragment() {
        const quest =
            state.player?.miguelQuest;

        if (!quest) {
            return false;
        }

        return Boolean(
            quest.vaelkorDefeated &&
            !quest.fragmentCollected &&
            !quest.fragmentDelivered
        );
    }


    function canCollectVoidFragment() {
        const quest =
            state.player?.miguelQuest;

        if (!quest) {
            return false;
        }

        return Boolean(
            quest.vaelkorDefeated &&
            quest.fragmentSpawned &&
            quest.fragmentMiniGameCompleted &&
            !quest.fragmentCollected &&
            getRealItemCount(
                "fragmentoVazio"
            ) === 0
        );
    }


    function collectVoidFragment() {
        const player =
            state.player;

        if (
            !player ||
            !canCollectVoidFragment()
        ) {
            return false;
        }

        const added =
            addItem(
                "fragmentoVazio",
                1,
                {
                    silent: true
                }
            );

        if (!added) {
            return false;
        }

        player.miguelQuest.fragmentCollected = true;

        setMiguelQuestStage(
            MIGUEL_QUEST_STAGE.RETURN_TO_MIGUEL
        );

        return true;
    }


    /* ============================================================
       MINIGAME DO FRAGMENTO
       ============================================================ */

    function createFragmentMiniGameState() {
        const config =
            VOID_MISSION_CONFIG
                .fragmentMiniGame;

        return {
            active: true,

            round: 1,

            totalRounds:
                config.rounds,

            pointerAngle:
                random(
                    0,
                    Math.PI * 2
                ),

            targetAngle:
                random(
                    0,
                    Math.PI * 2
                ),

            direction:
                Math.random() < 0.5
                    ? -1
                    : 1,

            attempts: 0,

            misses: 0,

            completed: false,

            locked: false
        };
    }


    function getFragmentRoundConfig(
        round
    ) {
        const config =
            VOID_MISSION_CONFIG
                .fragmentMiniGame;

        const index =
            clamp(
                integer(round, 1) - 1,
                0,
                config.rounds - 1
            );

        return {
            targetSize:
                config.targetSizes[index],

            speed:
                config.pointerSpeeds[index]
        };
    }


    function resetFragmentMiniGameToRoundOne(
        game = state.fragmentMinigame
    ) {
        if (!game) {
            return;
        }

        game.round = 1;

        game.pointerAngle =
            random(
                0,
                Math.PI * 2
            );

        game.targetAngle =
            random(
                0,
                Math.PI * 2
            );

        game.direction =
            Math.random() < 0.5
                ? -1
                : 1;

        game.locked = false;
    }


    /* ============================================================
       SAVE — SANITIZAÇÃO BÁSICA

       O save completo será implementado na Parte 5.
       ============================================================ */

    function createSerializablePlayer(
        player = state.player
    ) {
        if (!player) {
            return null;
        }

        const copy =
            deepClone(player);

        /*
            Dados temporários de combate não devem
            ser eternizados no save.
        */
        copy.dashRuntime = null;

        copy.attackCooldown = 0;

        copy.skillCooldowns = {
            q: 0,
            r: 0,
            f: 0
        };

        copy.invincible = 0;

        copy.hurtAnim = 0;

        copy.poisonEffect = null;

        copy.movementSlowTimer = 0;

        copy.movementSlowMultiplier = 1;

        copy.activePotionBuffs = [];

        copy.classBuffs = [];

        copy.resting = {
            active: false,
            timer: 0,
            duration: 0
        };

        copy.dead = false;

        return copy;
    }


    /* ============================================================
       ANTI-BUG DA MISSÃO DO MIGUEL
       ============================================================ */

    function repairMiguelQuestState(
        player = state.player
    ) {
        if (!player) {
            return;
        }

        player.miguelQuest = {
            ...createMiguelQuestState(),
            ...(
                player.miguelQuest ||
                {}
            )
        };

        const quest =
            player.miguelQuest;

        quest.clearedDungeonEnemyIds =
            uniqueArray(
                quest.clearedDungeonEnemyIds
            );

        /*
            Dash V2 jamais pode existir sem V1.
        */
        if (
            player.abilities?.dashV2
        ) {
            player.abilities.dashV1 = true;

            quest.dashV2Unlocked = true;
            quest.fragmentDelivered = true;
            quest.completed = true;
            quest.stage =
                MIGUEL_QUEST_STAGE.COMPLETED;
        }

        /*
            Missão concluída não pode voltar.
        */
        if (quest.completed) {
            quest.stage =
                MIGUEL_QUEST_STAGE.COMPLETED;

            quest.trackerVisible = false;

            return;
        }

        /*
            Fragmento entregue implica V2.
        */
        if (
            quest.fragmentDelivered &&
            !player.abilities.dashV2
        ) {
            player.abilities.dashV1 = true;
            player.abilities.dashV2 = true;

            quest.dashV2Unlocked = true;
            quest.completed = true;

            quest.stage =
                MIGUEL_QUEST_STAGE.COMPLETED;

            quest.trackerVisible = false;

            return;
        }

        /*
            Fragmento coletado:
            garante exatamente um.
        */
        if (quest.fragmentCollected) {
            player.inventory.fragmentoVazio =
                quest.fragmentDelivered
                    ? 0
                    : 1;

            if (
                !quest.fragmentDelivered
            ) {
                quest.stage =
                    MIGUEL_QUEST_STAGE.RETURN_TO_MIGUEL;
            }
        }

        /*
            Se Vaelkor ainda não morreu,
            o Fragmento NÃO pode existir.
        */
        if (
            !quest.vaelkorDefeated
        ) {
            player.inventory.fragmentoVazio = 0;

            quest.fragmentSpawned = false;
            quest.fragmentMiniGameCompleted = false;
            quest.fragmentCollected = false;
        }

        /*
            Chave consumida não pode reaparecer.
        */
        if (
            quest.keyConsumed ||
            quest.secretDoorOpened
        ) {
            player.inventory.chaveObscura = 0;

            quest.keyCollected = true;
            quest.keyConsumed = true;
        }

        /*
            Porta aberta é irreversível.
        */
        if (
            quest.secretDoorOpened
        ) {
            quest.secretDoorFound = true;
            quest.keyCollected = true;
            quest.keyConsumed = true;
        }

        /*
            Só pode existir uma Chave Obscura.
        */
        if (
            quest.keyCollected &&
            !quest.keyConsumed
        ) {
            player.inventory.chaveObscura = 1;
        } else {
            player.inventory.chaveObscura = 0;
        }

        /*
            Antes do Dash V1:
            missão volta ao estado bloqueado,
            desde que ela nunca tenha sido iniciada.
        */
        if (
            !player.abilities.dashV1 &&
            !player.abilities.dashV2 &&
            !quest.missionAccepted
        ) {
            quest.stage =
                MIGUEL_QUEST_STAGE.LOCKED;

            quest.missionAvailable = false;

            quest.trackerVisible = false;
        }

        /*
            Dash V1 obtido:
            libera a conversa do Miguel.
        */
        if (
            (
                player.abilities.dashV1 ||
                player.abilities.dashV2
            ) &&
            !quest.missionAccepted
        ) {
            quest.missionAvailable = true;

            quest.stage =
                MIGUEL_QUEST_STAGE.AVAILABLE;
        }

        quest.trackerObjective =
            getMiguelQuestObjective(
                quest
            );
    }


    /* ============================================================
       REPARO GERAL DE PLAYER

       A migração de saves antigos será expandida na Parte 5.
       ============================================================ */

    function repairPlayerCore(
        player
    ) {
        if (!player) {
            return null;
        }

        const character =
            getCharacterById(
                player.characterId
            ) ||
            CHARACTERS[0];

        player.characterId =
            character.id;

        player.name =
            sanitizePlayerName(
                player.name,
                character.name
            );

        player.level =
            clamp(
                integer(
                    player.level,
                    1
                ),
                1,
                MAX_LEVEL
            );

        player.xp =
            Math.max(
                0,
                finiteNumber(
                    player.xp,
                    0
                )
            );

        player.xpToNext =
            player.level >= MAX_LEVEL
                ? Infinity
                : calculateXpToNext(
                    player.level
                );

        player.statPoints =
            Math.max(
                0,
                integer(
                    player.statPoints,
                    0
                )
            );

        player.stats = {
            ...createEmptyStats(),
            ...(
                player.stats ||
                {}
            )
        };

        for (
            const id of
            Object.keys(
                player.stats
            )
        ) {
            if (
                !STAT_CONFIG[id]
            ) {
                delete player.stats[id];
            }
        }

        for (
            const id of
            Object.keys(
                STAT_CONFIG
            )
        ) {
            player.stats[id] =
                clamp(
                    integer(
                        player.stats[id],
                        0
                    ),
                    0,
                    STAT_CAP
                );
        }

        player.inventory = {
            ...createEmptyInventory(),
            ...(
                player.inventory ||
                {}
            )
        };

        for (
            const id of
            Object.keys(
                player.inventory
            )
        ) {
            if (
                !ITEMS[id]
            ) {
                delete player.inventory[id];
                continue;
            }

            player.inventory[id] =
                Math.max(
                    0,
                    integer(
                        player.inventory[id],
                        0
                    )
                );
        }

        player.equipment = {
            weapon: null,
            armor: null,
            tool: null,
            ...(
                player.equipment ||
                {}
            )
        };

        player.abilities = {
            dashV1: false,
            dashV2: false,
            ...(
                player.abilities ||
                {}
            )
        };

        player.defeatedBosses =
            uniqueArray(
                player.defeatedBosses
            );

        player.discoveredBosses =
            uniqueArray(
                player.discoveredBosses
            );

        player.unlockedAreas =
            uniqueArray(
                player.unlockedAreas
            );

        player.exploredAreas =
            uniqueArray(
                player.exploredAreas
            );

        player.discoveredMapLocations =
            uniqueArray(
                player.discoveredMapLocations
            );

        if (
            !player.unlockedAreas.includes(
                "village"
            )
        ) {
            player.unlockedAreas.unshift(
                "village"
            );
        }

        if (
            !player.exploredAreas.includes(
                "village"
            )
        ) {
            player.exploredAreas.unshift(
                "village"
            );
        }

        player.purchasedUniqueItems =
            uniqueArray(
                player.purchasedUniqueItems
            );

        player.gateUnlocks = {
            east: false,
            north: false,
            west: false,
            south: false,
            ...(
                player.gateUnlocks ||
                {}
            )
        };

        player.gateDialogueIndex = {
            north: 0,
            ...(
                player.gateDialogueIndex ||
                {}
            )
        };

        player.quest = {
            wood: {
                ...createBasicQuestState(),
                ...(
                    player.quest?.wood ||
                    {}
                )
            },

            coal: {
                ...createBasicQuestState(),
                ...(
                    player.quest?.coal ||
                    {}
                )
            }
        };

        player.skyTrial = {
            started: false,
            wave: 0,
            activeWave: 0,
            complete: false,
            ...(
                player.skyTrial ||
                {}
            )
        };

        player.lanternOwned =
            Boolean(
                player.lanternOwned ||
                player.inventory.lanterna > 0
            );

        player.minimapOwned =
            Boolean(
                player.minimapOwned ||
                player.inventory.minimapa > 0
            );

        player.inventory.lanterna =
            player.lanternOwned
                ? 1
                : 0;

        player.inventory.minimapa =
            player.minimapOwned
                ? 1
                : 0;

        player.monarchDefeated =
            Boolean(
                player.monarchDefeated ||
                player.defeatedBosses.includes(
                    "monarch"
                )
            );

        /*
            Se save antigo já chegou à floresta,
            nunca será jogado para trás por causa
            do novo Guardião da Estrada.
        */
        if (
            player.unlockedAreas.includes(
                "forest"
            ) &&
            !player.defeatedBosses.includes(
                "road_guardian"
            )
        ) {
            player.defeatedBosses.push(
                "road_guardian"
            );
        }

        let highestArmorTier =
            Math.max(
                0,
                integer(
                    player.armorHighestTierEver,
                    0
                )
            );

        for (
            const id of
            ARMOR_PROGRESSION
        ) {
            if (
                player.inventory[id] > 0 ||
                player.equipment.armor === id
            ) {
                highestArmorTier =
                    Math.max(
                        highestArmorTier,
                        getArmorTier(id)
                    );
            }
        }

        player.armorHighestTierEver =
            highestArmorTier;

        player.activePotionBuffs = [];

        player.classBuffs = [];

        player.dashRuntime = null;

        player.attackCooldown = 0;

        player.skillCooldowns = {
            q: 0,
            r: 0,
            f: 0
        };

        player.invincible = 0;

        player.hurtAnim = 0;

        player.movementSlowTimer = 0;

        player.movementSlowMultiplier = 1;

        player.poisonEffect = null;

        player.dead = false;

        player.resting = {
            active: false,
            timer: 0,
            duration: 0
        };

        repairMiguelQuestState(
            player
        );

        return player;
    }


    /* ============================================================
       VALIDAÇÃO DA PARTE 1

       Não roda automaticamente ainda.
       A Parte 5 executará a validação completa.
       ============================================================ */

    function validatePart1Data() {
        const errors = [];

        if (
            STATUS_POINTS_PER_LEVEL !== 3
        ) {
            errors.push(
                "Cada nível precisa conceder exatamente 3 pontos de status."
            );
        }

        if (
            Object.keys(
                STAT_CONFIG
            ).length !== 4
        ) {
            errors.push(
                "Devem existir exatamente 4 status distribuíveis."
            );
        }

        const expectedStats = [
            "power",
            "energy",
            "hunger",
            "fatigue"
        ];

        for (
            const id of
            expectedStats
        ) {
            if (
                !STAT_CONFIG[id]
            ) {
                errors.push(
                    `Status ausente: ${id}`
                );
            }
        }

        for (
            const character of
            CHARACTERS
        ) {
            if (
                !CLASS_SKILLS[
                    character.id
                ]
            ) {
                errors.push(
                    `Habilidades ausentes para ${character.id}.`
                );
            }

            if (
                !character.basicAttack
            ) {
                errors.push(
                    `Ataque básico ausente para ${character.id}.`
                );
            }
        }

        if (
            ARMOR_PROGRESSION.length !== 8
        ) {
            errors.push(
                "A progressão deve possuir exatamente 8 armaduras."
            );
        }

        const expectedArmorValues = [
            ["armaduraFolha", 25, 3],
            ["armaduraAlgodao", 50, 6],
            ["armaduraMadeira", 75, 10],
            ["armaduraCouro", 100, 15],
            ["armaduraFerro", 125, 22],
            ["armaduraOuro", 150, 30],
            ["armaduraDiamante", 175, 40],
            ["armaduraRubi", 200, 53]
        ];

        for (
            const [
                id,
                hp,
                defense
            ] of
            expectedArmorValues
        ) {
            const armor =
                ARMOR_DATA[id];

            if (
                !armor ||
                armor.maxHpBonus !== hp ||
                armor.defense !== defense
            ) {
                errors.push(
                    `Valores incorretos em ${id}.`
                );
            }
        }

        if (
            LANTERN_PRICE !== 350
        ) {
            errors.push(
                "A Lanterna Antiga deve custar 350."
            );
        }

        if (
            MINIMAP_PRICE !== 180
        ) {
            errors.push(
                "O minimapa deve custar 180."
            );
        }

        if (
            DASH_RITUAL_COST.rubi !== 60 ||
            DASH_RITUAL_COST.diamante !== 45
        ) {
            errors.push(
                "O ritual do Dash V1 deve exigir 60 Rubis e 45 Diamantes."
            );
        }

        if (
            NORTH_GATE_COST.diamante !== 40 ||
            NORTH_GATE_COST.rubi !== 55
        ) {
            errors.push(
                "O Portão Norte deve exigir 40 Diamantes e 55 Rubis."
            );
        }

        if (
            VOID_MISSION_CONFIG
                .shadowEssenceRequired !== 15
        ) {
            errors.push(
                "A Chave Obscura deve exigir 15 Essências Sombrias."
            );
        }

        if (
            VOID_MISSION_CONFIG
                .fragmentMiniGame
                .rounds !== 3
        ) {
            errors.push(
                "O minigame do Fragmento deve ter 3 rodadas."
            );
        }

        if (
            VOID_MISSION_CONFIG
                .fragmentMiniGame
                .resetToRoundOneOnMiss !== true
        ) {
            errors.push(
                "Errar o minigame precisa voltar à rodada 1."
            );
        }

        if (
            ENEMY_SPECIES
                .wolf
                .ability
                .cooldown !== 2
        ) {
            errors.push(
                "A investida do lobo deve possuir cooldown de 2 segundos."
            );
        }

        if (
            BOSS_REGISTRY
                .ancient_deer
                .topBar !== false
        ) {
            errors.push(
                "Cervo Ancestral não pode usar a barra grande de boss."
            );
        }

        if (
            !BOSS_REGISTRY.vaelkor
                .stationaryController
        ) {
            errors.push(
                "Vaelkor deve controlar a arena e permanecer majoritariamente no centro."
            );
        }

        if (
            DASH_CONFIG.v1
                .generalInvulnerability !== 0 ||
            DASH_CONFIG.v2
                .generalInvulnerability !== 0
        ) {
            errors.push(
                "Dash não pode possuir invulnerabilidade geral."
            );
        }

        if (
            DASH_CONFIG.v1
                .projectilePhaseWindow !== 0
        ) {
            errors.push(
                "Dash V1 não pode atravessar projéteis."
            );
        }

        if (
            DASH_CONFIG.v2
                .projectilePhaseWindow <= 0
        ) {
            errors.push(
                "Dash V2 precisa da janela de precisão contra projéteis."
            );
        }

        const routeTwoExpected = [
            "gnomeGardens",
            "fairyKingdom",
            "celestialFrontier",
            "celestialStair",
            "sky1",
            "sky2",
            "sky3"
        ];

        if (
            JSON.stringify(
                ROUTE_TWO.sequence
            ) !==
            JSON.stringify(
                routeTwoExpected
            )
        ) {
            errors.push(
                "A sequência do Caminho 2 foi alterada."
            );
        }

        if (
            errors.length > 0
        ) {
            console.error(
                "VEYRA V30 — ERROS NA PARTE 1:",
                errors
            );

            return {
                ok: false,
                errors
            };
        }

        return {
            ok: true,
            errors: []
        };
    }


    /* ============================================================
       FIM DA PARTE 1/5

       NÃO FECHE O IIFE AQUI.

       PARTE 2:
       - construção completa do mundo
       - Vila do Crepúsculo
       - casas
       - interiores
       - portas com uma única geometria
       - Floresta
       - Bosque
       - Montanhas
       - Ferro
       - Rubi
       - pré-Labirinto
       - Labirinto do Monarca
       - geração de árvores
       - minérios
       - colisões
       - NPCs físicos
       - mapa
       - Portão Norte
       - Jardins dos Gnomos
       - Reino Feérico
       - Fronteira Celestial
       - transição ambiental Fada -> Céu
       - Escadaria Celestial
       - Céu I
       - Céu II
       - Céu III
       - Chave Obscura escondida
       - Porta Secreta
       - Dungeon do Vazio
       - corredor escuro
       - arena circular de Vaelkor
       - posicionamentos seguros
       - nenhum Caminho 3 por enquanto
       ============================================================ */
