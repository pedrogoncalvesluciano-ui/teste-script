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
     /* ============================================================
       VEYRA: A QUIETUDE
       V30 — RECONSTRUÇÃO UNIFICADA

       SCRIPT.JS — PARTE 2/5

       MUNDO
       REGIÕES
       VILA
       CASAS
       INTERIORES
       PORTAS
       CAMINHO 1
       CAMINHO 2
       RECURSOS
       CHAVE OBSCURA
       PORTA SECRETA
       DUNGEON DO VAZIO
       ARENA DE VAELKOR

       IMPORTANTE:
       CONTINUA O MESMO IIFE DA PARTE 1.

       NÃO COLOQUE (() => {
       NÃO COLOQUE })();
       ============================================================ */


    /* ============================================================
       DIMENSÕES DOS MAPAS
       ============================================================ */

    const WORLD_DIMENSIONS = Object.freeze({
        village: Object.freeze({
            width: 3200,
            height: 2200
        }),

        forest: Object.freeze({
            width: 3400,
            height: 2300
        }),

        grove: Object.freeze({
            width: 3500,
            height: 2350
        }),

        mountains: Object.freeze({
            width: 3500,
            height: 2350
        }),

        iron: Object.freeze({
            width: 3400,
            height: 2250
        }),

        ruby: Object.freeze({
            width: 3500,
            height: 2300
        }),

        preMonarch: Object.freeze({
            width: 3400,
            height: 2250
        }),

        monarchMaze: Object.freeze({
            width: 3600,
            height: 2300
        }),

        gnomeGardens: Object.freeze({
            width: 3500,
            height: 2300
        }),

        fairyKingdom: Object.freeze({
            width: 3600,
            height: 2350
        }),

        celestialFrontier: Object.freeze({
            width: 3900,
            height: 2400
        }),

        celestialStair: Object.freeze({
            width: 3200,
            height: 2550
        }),

        sky1: Object.freeze({
            width: 3500,
            height: 2350
        }),

        sky2: Object.freeze({
            width: 3550,
            height: 2400
        }),

        sky3: Object.freeze({
            width: 3700,
            height: 2450
        }),

        voidDungeon: Object.freeze({
            width: 3500,
            height: 2300
        }),

        hell: Object.freeze({
            width: 3700,
            height: 2450
        }),

        final: Object.freeze({
            width: 2200,
            height: 1550
        })
    });


    /* ============================================================
       SPAWNS PADRÃO DAS REGIÕES
       ============================================================ */

    const REGION_SPAWNS = Object.freeze({
        village: Object.freeze({
            default: Object.freeze({
                x: 1600,
                y: 1180,
                facing: "down"
            }),

            fromForest: Object.freeze({
                x: 2960,
                y: 1110,
                facing: "left"
            }),

            fromNorth: Object.freeze({
                x: 1600,
                y: 210,
                facing: "down"
            })
        }),

        forest: Object.freeze({
            fromVillage: Object.freeze({
                x: 180,
                y: 1150,
                facing: "right"
            }),

            fromGrove: Object.freeze({
                x: 3170,
                y: 1150,
                facing: "left"
            })
        }),

        grove: Object.freeze({
            fromForest: Object.freeze({
                x: 180,
                y: 1180,
                facing: "right"
            }),

            fromMountains: Object.freeze({
                x: 3270,
                y: 1170,
                facing: "left"
            })
        }),

        mountains: Object.freeze({
            fromGrove: Object.freeze({
                x: 180,
                y: 1180,
                facing: "right"
            }),

            fromIron: Object.freeze({
                x: 3270,
                y: 1170,
                facing: "left"
            })
        }),

        iron: Object.freeze({
            fromMountains: Object.freeze({
                x: 180,
                y: 1120,
                facing: "right"
            }),

            fromRuby: Object.freeze({
                x: 3170,
                y: 1120,
                facing: "left"
            })
        }),

        ruby: Object.freeze({
            fromIron: Object.freeze({
                x: 180,
                y: 1140,
                facing: "right"
            }),

            fromPreMonarch: Object.freeze({
                x: 3270,
                y: 1150,
                facing: "left"
            })
        }),

        preMonarch: Object.freeze({
            fromRuby: Object.freeze({
                x: 180,
                y: 1120,
                facing: "right"
            }),

            fromMaze: Object.freeze({
                x: 3170,
                y: 1120,
                facing: "left"
            }),

            fromVoidDungeon: Object.freeze({
                x: 1700,
                y: 470,
                facing: "down"
            })
        }),

        monarchMaze: Object.freeze({
            fromPreMonarch: Object.freeze({
                x: 190,
                y: 1150,
                facing: "right"
            })
        }),

        gnomeGardens: Object.freeze({
            fromVillage: Object.freeze({
                x: 1750,
                y: 2110,
                facing: "up"
            }),

            fromFairy: Object.freeze({
                x: 1750,
                y: 210,
                facing: "down"
            })
        }),

        fairyKingdom: Object.freeze({
            fromGnome: Object.freeze({
                x: 1800,
                y: 2180,
                facing: "up"
            }),

            fromFrontier: Object.freeze({
                x: 1800,
                y: 210,
                facing: "down"
            })
        }),

        celestialFrontier: Object.freeze({
            fromFairy: Object.freeze({
                x: 1950,
                y: 2240,
                facing: "up"
            }),

            fromStair: Object.freeze({
                x: 1950,
                y: 210,
                facing: "down"
            })
        }),

        celestialStair: Object.freeze({
            fromFrontier: Object.freeze({
                x: 1600,
                y: 2350,
                facing: "up"
            }),

            fromSky1: Object.freeze({
                x: 1600,
                y: 220,
                facing: "down"
            })
        }),

        sky1: Object.freeze({
            fromStair: Object.freeze({
                x: 1750,
                y: 2160,
                facing: "up"
            }),

            fromSky2: Object.freeze({
                x: 1750,
                y: 210,
                facing: "down"
            })
        }),

        sky2: Object.freeze({
            fromSky1: Object.freeze({
                x: 1775,
                y: 2220,
                facing: "up"
            }),

            fromSky3: Object.freeze({
                x: 1775,
                y: 210,
                facing: "down"
            })
        }),

        sky3: Object.freeze({
            fromSky2: Object.freeze({
                x: 1850,
                y: 2260,
                facing: "up"
            })
        }),

        voidDungeon: Object.freeze({
            entrance: Object.freeze({
                x: 1750,
                y: 2130,
                facing: "up"
            })
        })
    });


    /* ============================================================
       INTERIORES DAS CASAS

       TODOS POSSUEM IDENTIDADE PRÓPRIA.
       ============================================================ */

    const HOUSE_INTERIORS = Object.freeze({
        home: Object.freeze({
            id: "home",

            name:
                "CASA DO JOGADOR",

            worldWidth: 1080,
            worldHeight: 730,

            room: Object.freeze({
                x: 130,
                y: 100,
                w: 820,
                h: 515
            }),

            playerSpawn: Object.freeze({
                x: 540,
                y: 515,
                facing: "up"
            }),

            door: Object.freeze({
                x: 495,
                y: 560,
                w: 90,
                h: 55,
                side: "bottom"
            }),

            style: Object.freeze({
                floor: "#6b5744",
                wall: "#49392e",
                rug: "#715454",
                accent: "#c39a68"
            }),

            furniture: Object.freeze([
                Object.freeze({
                    type: "bed",
                    x: 205,
                    y: 175,
                    w: 165,
                    h: 100
                }),

                Object.freeze({
                    type: "table",
                    x: 670,
                    y: 260,
                    w: 120,
                    h: 86
                }),

                Object.freeze({
                    type: "chest",
                    x: 760,
                    y: 455,
                    w: 80,
                    h: 60
                }),

                Object.freeze({
                    type: "bookshelf",
                    x: 450,
                    y: 135,
                    w: 160,
                    h: 48
                })
            ])
        }),

        elianHome: Object.freeze({
            id: "elianHome",

            name:
                "CASA DE ELIAN",

            worldWidth: 1080,
            worldHeight: 720,

            room: Object.freeze({
                x: 140,
                y: 105,
                w: 800,
                h: 500
            }),

            playerSpawn: Object.freeze({
                x: 540,
                y: 510,
                facing: "up"
            }),

            door: Object.freeze({
                x: 500,
                y: 552,
                w: 80,
                h: 53,
                side: "bottom"
            }),

            style: Object.freeze({
                floor: "#675848",
                wall: "#4e4033",
                rug: "#5b6870",
                accent: "#a98c67"
            }),

            furniture: Object.freeze([
                Object.freeze({
                    type: "bookshelf",
                    x: 235,
                    y: 150,
                    w: 170,
                    h: 50
                }),

                Object.freeze({
                    type: "desk",
                    x: 655,
                    y: 175,
                    w: 145,
                    h: 80
                }),

                Object.freeze({
                    type: "bed",
                    x: 225,
                    y: 390,
                    w: 150,
                    h: 90
                }),

                Object.freeze({
                    type: "chair",
                    x: 685,
                    y: 315,
                    w: 48,
                    h: 48
                })
            ])
        }),

        shop: Object.freeze({
            id: "shop",

            name:
                "LOJA DE DORAN",

            worldWidth: 1100,
            worldHeight: 730,

            room: Object.freeze({
                x: 100,
                y: 90,
                w: 900,
                h: 530
            }),

            playerSpawn: Object.freeze({
                x: 550,
                y: 535,
                facing: "up"
            }),

            door: Object.freeze({
                x: 505,
                y: 565,
                w: 90,
                h: 55,
                side: "bottom"
            }),

            style: Object.freeze({
                floor: "#725b42",
                wall: "#4c3829",
                rug: "#70523c",
                accent: "#d0a264"
            }),

            furniture: Object.freeze([
                Object.freeze({
                    type: "counter",
                    x: 255,
                    y: 260,
                    w: 590,
                    h: 70
                }),

                Object.freeze({
                    type: "shelf",
                    x: 185,
                    y: 130,
                    w: 190,
                    h: 50
                }),

                Object.freeze({
                    type: "shelf",
                    x: 725,
                    y: 130,
                    w: 190,
                    h: 50
                }),

                Object.freeze({
                    type: "crate",
                    x: 805,
                    y: 430,
                    w: 72,
                    h: 64
                })
            ]),

            npc: Object.freeze({
                id: "doran",
                x: 550,
                y: 220,
                facing: "down"
            })
        }),

        forge: Object.freeze({
            id: "forge",

            name:
                "FORJA DE BORIN",

            worldWidth: 1100,
            worldHeight: 740,

            room: Object.freeze({
                x: 95,
                y: 85,
                w: 910,
                h: 545
            }),

            playerSpawn: Object.freeze({
                x: 550,
                y: 540,
                facing: "up"
            }),

            door: Object.freeze({
                x: 502,
                y: 575,
                w: 96,
                h: 55,
                side: "bottom"
            }),

            style: Object.freeze({
                floor: "#504844",
                wall: "#363230",
                rug: "#67453c",
                accent: "#b46342"
            }),

            furniture: Object.freeze([
                Object.freeze({
                    type: "forge",
                    x: 710,
                    y: 155,
                    w: 170,
                    h: 125
                }),

                Object.freeze({
                    type: "anvil",
                    x: 500,
                    y: 280,
                    w: 100,
                    h: 75
                }),

                Object.freeze({
                    type: "weaponRack",
                    x: 180,
                    y: 145,
                    w: 185,
                    h: 55
                }),

                Object.freeze({
                    type: "coalPile",
                    x: 770,
                    y: 420,
                    w: 115,
                    h: 75
                })
            ]),

            npc: Object.freeze({
                id: "borin",
                x: 550,
                y: 210,
                facing: "down"
            })
        }),

        woodshop: Object.freeze({
            id: "woodshop",

            name:
                "OFICINA DE BRAN",

            worldWidth: 1080,
            worldHeight: 720,

            room: Object.freeze({
                x: 115,
                y: 95,
                w: 850,
                h: 515
            }),

            playerSpawn: Object.freeze({
                x: 540,
                y: 520,
                facing: "up"
            }),

            door: Object.freeze({
                x: 498,
                y: 558,
                w: 84,
                h: 52,
                side: "bottom"
            }),

            style: Object.freeze({
                floor: "#765d3f",
                wall: "#4c3927",
                rug: "#5d593d",
                accent: "#b99662"
            }),

            furniture: Object.freeze([
                Object.freeze({
                    type: "workbench",
                    x: 440,
                    y: 200,
                    w: 210,
                    h: 80
                }),

                Object.freeze({
                    type: "logs",
                    x: 190,
                    y: 390,
                    w: 150,
                    h: 85
                }),

                Object.freeze({
                    type: "tools",
                    x: 700,
                    y: 145,
                    w: 165,
                    h: 55
                }),

                Object.freeze({
                    type: "crate",
                    x: 760,
                    y: 410,
                    w: 80,
                    h: 70
                })
            ]),

            npc: Object.freeze({
                id: "bran",
                x: 540,
                y: 210,
                facing: "down"
            })
        })
    });


    /* ============================================================
       CRIAÇÃO DE MUNDO VAZIO
       ============================================================ */

    function createEmptyWorld(
        area,
        width,
        height
    ) {
        return {
            id: area,

            area,

            width,
            height,

            obstacles: [],

            softObstacles: [],

            decorations: [],

            paths: [],

            protectedZones: [],

            buildings: [],

            doors: [],

            npcs: [],

            resources: [],

            portals: [],

            gates: [],

            lights: [],

            particles: [],

            effects: [],

            projectiles: [],

            enemies: [],

            enemySpawns: [],

            bosses: [],

            bossSpawns: [],

            landmarks: [],

            darknessZones: [],

            specialColliders: [],

            transitions: [],

            secretDoor: null,

            darkKey: null,

            arena: null,

            metadata: {}
        };
    }


    /* ============================================================
       SEED DO MUNDO
       ============================================================ */

    function ensurePlayerWorldSeed(
        player = state.player
    ) {
        if (!player) {
            return 123456789;
        }

        if (
            !Number.isFinite(
                player.worldSeed
            )
        ) {
            player.worldSeed =
                hashStringToSeed(
                    `${player.name}_${player.characterId}_VEYRA`
                );
        }

        return (
            player.worldSeed >>> 0
        );
    }


    function createRegionRandom(area) {
        const playerSeed =
            ensurePlayerWorldSeed();

        const regionSeed =
            hashStringToSeed(
                `${playerSeed}_${area}`
            );

        return mulberry32(
            regionSeed
        );
    }


    /* ============================================================
       HELPERS PARA ADICIONAR ELEMENTOS AO MUNDO
       ============================================================ */

    function addObstacle(
        world,
        obstacle
    ) {
        const entity = {
            id:
                obstacle.id ||
                uid("obstacle"),

            type:
                obstacle.type ||
                "solid",

            blocksMovement:
                obstacle.blocksMovement !== false,

            blocksLight:
                obstacle.blocksLight !== false,

            ...obstacle
        };

        world.obstacles.push(
            entity
        );

        return entity;
    }


    function addDecoration(
        world,
        decoration
    ) {
        const entity = {
            id:
                decoration.id ||
                uid("decor"),

            ...decoration
        };

        world.decorations.push(
            entity
        );

        return entity;
    }


    function addPath(
        world,
        path
    ) {
        const entity = {
            id:
                path.id ||
                uid("path"),

            ...path
        };

        world.paths.push(
            entity
        );

        return entity;
    }


    function addProtectedZone(
        world,
        zone
    ) {
        const entity = {
            id:
                zone.id ||
                uid("protected"),

            ...zone
        };

        world.protectedZones.push(
            entity
        );

        return entity;
    }


    function addLandmark(
        world,
        landmark
    ) {
        const entity = {
            id:
                landmark.id ||
                uid("landmark"),

            ...landmark
        };

        world.landmarks.push(
            entity
        );

        return entity;
    }


    function addPortal(
        world,
        portal
    ) {
        const entity = {
            id:
                portal.id ||
                uid("portal"),

            radius:
                portal.radius || 48,

            active:
                portal.active !== false,

            ...portal
        };

        world.portals.push(
            entity
        );

        return entity;
    }


    function addGate(
        world,
        gate
    ) {
        const entity = {
            id:
                gate.id ||
                uid("gate"),

            open:
                Boolean(
                    gate.open
                ),

            ...gate
        };

        world.gates.push(
            entity
        );

        return entity;
    }


    function addEnemySpawn(
        world,
        spawn
    ) {
        const entity = {
            id:
                spawn.id ||
                uid("enemySpawn"),

            count:
                spawn.count || 1,

            respawn:
                spawn.respawn !== false,

            ...spawn
        };

        world.enemySpawns.push(
            entity
        );

        return entity;
    }


    function addBossSpawn(
        world,
        spawn
    ) {
        const entity = {
            id:
                spawn.id ||
                uid("bossSpawn"),

            ...spawn
        };

        world.bossSpawns.push(
            entity
        );

        return entity;
    }


    function addResource(
        world,
        resource
    ) {
        const entity = {
            id:
                resource.id ||
                uid("resource"),

            active:
                resource.active !== false,

            respawnTimer: 0,

            respawnSeconds:
                resource.respawnSeconds ||
                35,

            holdProgress: 0,

            ...resource
        };

        world.resources.push(
            entity
        );

        return entity;
    }


    /* ============================================================
       BORDAS
       ============================================================ */

    function addWorldBorders(
        world,
        thickness = 70
    ) {
        addObstacle(
            world,
            {
                id: `${world.id}_wall_top`,
                type: "boundary",
                x: 0,
                y: 0,
                w: world.width,
                h: thickness
            }
        );

        addObstacle(
            world,
            {
                id: `${world.id}_wall_bottom`,
                type: "boundary",
                x: 0,
                y:
                    world.height -
                    thickness,
                w: world.width,
                h: thickness
            }
        );

        addObstacle(
            world,
            {
                id: `${world.id}_wall_left`,
                type: "boundary",
                x: 0,
                y: 0,
                w: thickness,
                h: world.height
            }
        );

        addObstacle(
            world,
            {
                id: `${world.id}_wall_right`,
                type: "boundary",
                x:
                    world.width -
                    thickness,
                y: 0,
                w: thickness,
                h: world.height
            }
        );
    }


    /* ============================================================
       PORTA DA CONSTRUÇÃO

       ESSA FUNÇÃO É A FONTE ÚNICA DE VERDADE.

       O DESENHO E A INTERAÇÃO USARÃO EXATAMENTE
       A MESMA GEOMETRIA.
       ============================================================ */

    function getBuildingDoorGeometry(
        building
    ) {
        if (!building) {
            return null;
        }

        const width =
            building.doorWidth ||
            Math.min(
                92,
                building.w * 0.24
            );

        const height =
            building.doorHeight ||
            54;

        const side =
            building.doorSide ||
            "bottom";

        let x;
        let y;

        if (side === "top") {
            x =
                building.x +
                building.w / 2 -
                width / 2;

            y =
                building.y -
                5;
        } else if (
            side === "left"
        ) {
            x =
                building.x -
                5;

            y =
                building.y +
                building.h / 2 -
                width / 2;

            return {
                x,
                y,
                w: height,
                h: width,
                side,

                centerX:
                    x +
                    height / 2,

                centerY:
                    y +
                    width / 2
            };
        } else if (
            side === "right"
        ) {
            x =
                building.x +
                building.w -
                height +
                5;

            y =
                building.y +
                building.h / 2 -
                width / 2;

            return {
                x,
                y,
                w: height,
                h: width,
                side,

                centerX:
                    x +
                    height / 2,

                centerY:
                    y +
                    width / 2
            };
        } else {
            x =
                building.x +
                building.w / 2 -
                width / 2;

            y =
                building.y +
                building.h -
                height +
                8;
        }

        return {
            x,
            y,
            w: width,
            h: height,
            side,

            centerX:
                x +
                width / 2,

            centerY:
                y +
                height / 2
        };
    }


    function addBuilding(
        world,
        building
    ) {
        const entity = {
            id:
                building.id ||
                uid("building"),

            name:
                building.name ||
                "CONSTRUÇÃO",

            roof:
                building.roof ||
                "#604738",

            wall:
                building.wall ||
                "#81705d",

            doorOpen: false,

            doorOpenAmount: 0,

            ...building
        };

        entity.door =
            getBuildingDoorGeometry(
                entity
            );

        world.buildings.push(
            entity
        );

        world.doors.push({
            id:
                `${entity.id}_door`,

            buildingId:
                entity.id,

            houseId:
                entity.houseId ||
                null,

            x:
                entity.door.x,

            y:
                entity.door.y,

            w:
                entity.door.w,

            h:
                entity.door.h,

            side:
                entity.door.side,

            centerX:
                entity.door.centerX,

            centerY:
                entity.door.centerY,

            open: false,

            openAmount: 0
        });

        /*
            O corpo da casa é obstáculo.

            A porta fica na borda inferior,
            então não precisamos criar um
            "buraco invisível" desalinhado.
        */
        addObstacle(
            world,
            {
                id:
                    `${entity.id}_body`,

                type:
                    "building",

                x:
                    entity.x,

                y:
                    entity.y,

                w:
                    entity.w,

                h:
                    entity.h - 25,

                buildingId:
                    entity.id,

                blocksLight: true
            }
        );

        addProtectedZone(
            world,
            {
                id:
                    `${entity.id}_safe`,

                x:
                    entity.x - 55,

                y:
                    entity.y - 55,

                w:
                    entity.w + 110,

                h:
                    entity.h + 110,

                type:
                    "building"
            }
        );

        return entity;
    }


    function findBuilding(
        id,
        world = state.world
    ) {
        return (
            world?.buildings?.find(
                building =>
                    building.id === id
            ) ||
            null
        );
    }


    function findWorldDoor(
        buildingId,
        world = state.world
    ) {
        return (
            world?.doors?.find(
                door =>
                    door.buildingId ===
                    buildingId
            ) ||
            null
        );
    }


    /* ============================================================
       SPAWN EM FRENTE À CASA DO PLAYER
       ============================================================ */

    function calculateHomeRespawn(
        world = null
    ) {
        let villageWorld =
            world;

        if (
            !villageWorld ||
            villageWorld.id !==
                "village"
        ) {
            villageWorld =
                buildVillageWorld();
        }

        const house =
            villageWorld.buildings.find(
                building =>
                    building.id ===
                    PLAYER_HOME.houseId
            );

        if (!house) {
            return {
                ...PLAYER_HOME
                    .fallbackRespawn
            };
        }

        const door =
            getBuildingDoorGeometry(
                house
            );

        if (!door) {
            return {
                ...PLAYER_HOME
                    .fallbackRespawn
            };
        }

        const offset = 74;

        let x =
            door.centerX;

        let y =
            door.centerY;

        let facing =
            "up";

        if (
            door.side === "bottom"
        ) {
            y += offset;
            facing = "up";
        } else if (
            door.side === "top"
        ) {
            y -= offset;
            facing = "down";
        } else if (
            door.side === "left"
        ) {
            x -= offset;
            facing = "right";
        } else if (
            door.side === "right"
        ) {
            x += offset;
            facing = "left";
        }

        return {
            x,
            y,
            facing
        };
    }


    /* ============================================================
       NPC
       ============================================================ */

    function createNPC(
        id,
        x,
        y,
        options = {}
    ) {
        return {
            id,

            x,
            y,

            homeX: x,
            homeY: y,

            radius:
                options.radius ||
                18,

            facing:
                options.facing ||
                "down",

            name:
                options.name ||
                id.toUpperCase(),

            role:
                options.role ||
                "",

            color:
                options.color ||
                "#8b7d68",

            accent:
                options.accent ||
                "#c7af81",

            shop:
                Boolean(
                    options.shop
                ),

            quest:
                options.quest ||
                null,

            movementRadius:
                options.movementRadius ||
                0,

            movementTimer:
                random(2, 6),

            interactionDistance:
                options.interactionDistance ||
                GAME_CONFIG.interactDistance,

            ...options
        };
    }


    function addNPC(
        world,
        id,
        x,
        y,
        options = {}
    ) {
        const npc =
            createNPC(
                id,
                x,
                y,
                options
            );

        world.npcs.push(
            npc
        );

        return npc;
    }


    /* ============================================================
       RECURSOS
       ============================================================ */

    function createTreeResource(
        x,
        y,
        options = {}
    ) {
        return {
            type: "tree",

            itemId:
                "madeira",

            x,
            y,

            radius:
                options.radius ||
                26,

            quantity:
                options.quantity ||
                randomInt(1, 3),

            magicCost:
                options.magicCost ??
                3,

            holdSeconds:
                GAME_CONFIG
                    .treeHoldSeconds,

            respawnSeconds:
                options.respawnSeconds ||
                random(34, 52),

            variant:
                options.variant ||
                randomInt(0, 3)
        };
    }


    function createOreResource(
        itemId,
        x,
        y,
        options = {}
    ) {
        return {
            type: "ore",

            itemId,

            x,
            y,

            radius:
                options.radius ||
                22,

            quantity:
                options.quantity ||
                1,

            magicCost:
                options.magicCost ??
                2,

            holdSeconds:
                GAME_CONFIG
                    .resourceHoldSeconds,

            respawnSeconds:
                options.respawnSeconds ||
                random(40, 62),

            variant:
                options.variant ||
                randomInt(0, 2)
        };
    }


    function resourcePositionBlocked(
        world,
        x,
        y,
        radius = 28
    ) {
        for (
            const zone of
            world.protectedZones
        ) {
            const expanded = {
                x:
                    zone.x -
                    radius,

                y:
                    zone.y -
                    radius,

                w:
                    zone.w +
                    radius * 2,

                h:
                    zone.h +
                    radius * 2
            };

            if (
                pointInRect(
                    x,
                    y,
                    expanded
                )
            ) {
                return true;
            }
        }

        for (
            const path of
            world.paths
        ) {
            if (
                pointInRect(
                    x,
                    y,
                    {
                        x:
                            path.x -
                            radius,

                        y:
                            path.y -
                            radius,

                        w:
                            path.w +
                            radius * 2,

                        h:
                            path.h +
                            radius * 2
                    }
                )
            ) {
                return true;
            }
        }

        return false;
    }


    function scatterTrees(
        world,
        count,
        randomGenerator,
        options = {}
    ) {
        const margin =
            options.margin ||
            100;

        let generated = 0;

        let attempts = 0;

        const maxAttempts =
            count * 30;

        while (
            generated < count &&
            attempts <
                maxAttempts
        ) {
            attempts += 1;

            const x =
                margin +
                randomGenerator() *
                (
                    world.width -
                    margin * 2
                );

            const y =
                margin +
                randomGenerator() *
                (
                    world.height -
                    margin * 2
                );

            if (
                resourcePositionBlocked(
                    world,
                    x,
                    y,
                    36
                )
            ) {
                continue;
            }

            addResource(
                world,
                createTreeResource(
                    x,
                    y,
                    {
                        variant:
                            Math.floor(
                                randomGenerator() *
                                4
                            )
                    }
                )
            );

            generated += 1;
        }
    }


    function scatterOre(
        world,
        itemId,
        count,
        randomGenerator,
        options = {}
    ) {
        const margin =
            options.margin ||
            100;

        let generated = 0;
        let attempts = 0;

        while (
            generated < count &&
            attempts <
                count * 35
        ) {
            attempts += 1;

            const x =
                margin +
                randomGenerator() *
                (
                    world.width -
                    margin * 2
                );

            const y =
                margin +
                randomGenerator() *
                (
                    world.height -
                    margin * 2
                );

            if (
                resourcePositionBlocked(
                    world,
                    x,
                    y,
                    31
                )
            ) {
                continue;
            }

            addResource(
                world,
                createOreResource(
                    itemId,
                    x,
                    y,
                    options
                )
            );

            generated += 1;
        }
    }


    /* ============================================================
       COLISÃO DO MUNDO
       ============================================================ */

    function getBlockingObstacles(
        world = state.world
    ) {
        if (!world) {
            return [];
        }

        return world.obstacles.filter(
            obstacle =>
                obstacle
                    .blocksMovement !==
                false
        );
    }


    function isCircleBlocked(
        x,
        y,
        radius,
        world = state.world,
        options = {}
    ) {
        if (!world) {
            return false;
        }

        if (
            x - radius <
                GAME_CONFIG.worldMargin ||
            y - radius <
                GAME_CONFIG.worldMargin ||
            x + radius >
                world.width -
                GAME_CONFIG.worldMargin ||
            y + radius >
                world.height -
                GAME_CONFIG.worldMargin
        ) {
            return true;
        }

        for (
            const obstacle of
            getBlockingObstacles(
                world
            )
        ) {
            if (
                options.ignoreId &&
                obstacle.id ===
                    options.ignoreId
            ) {
                continue;
            }

            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    obstacle
                )
            ) {
                return true;
            }
        }

        if (
            world.arena &&
            world.arena.activeBoundary
        ) {
            const arena =
                world.arena;

            const dist =
                distance(
                    x,
                    y,
                    arena.x,
                    arena.y
                );

            if (
                dist + radius >
                arena.radius -
                arena.wallThickness
            ) {
                return true;
            }
        }

        return false;
    }


    function findSafePosition(
        desiredX,
        desiredY,
        radius,
        world = state.world
    ) {
        if (!world) {
            return {
                x: desiredX,
                y: desiredY
            };
        }

        if (
            !isCircleBlocked(
                desiredX,
                desiredY,
                radius,
                world
            )
        ) {
            return {
                x: desiredX,
                y: desiredY
            };
        }

        const maxRadius =
            GAME_CONFIG
                .safeSpawnSearchRadius;

        const step =
            GAME_CONFIG
                .safeSpawnStep;

        for (
            let searchRadius =
                step;
            searchRadius <=
                maxRadius;
            searchRadius +=
                step
        ) {
            const circumference =
                Math.max(
                    8,
                    Math.ceil(
                        Math.PI *
                        searchRadius /
                        step
                    )
                );

            for (
                let index = 0;
                index < circumference;
                index += 1
            ) {
                const angle =
                    (
                        index /
                        circumference
                    ) *
                    Math.PI *
                    2;

                const x =
                    desiredX +
                    Math.cos(angle) *
                    searchRadius;

                const y =
                    desiredY +
                    Math.sin(angle) *
                    searchRadius;

                if (
                    !isCircleBlocked(
                        x,
                        y,
                        radius,
                        world
                    )
                ) {
                    return {
                        x,
                        y
                    };
                }
            }
        }

        return {
            x:
                clamp(
                    desiredX,
                    100,
                    world.width - 100
                ),

            y:
                clamp(
                    desiredY,
                    100,
                    world.height - 100
                )
        };
    }


    /* ============================================================
       CAMINHOS
       ============================================================ */

    function addHorizontalRoad(
        world,
        x,
        y,
        w,
        h = 115
    ) {
        return addPath(
            world,
            {
                type:
                    "horizontalRoad",

                x,
                y,
                w,
                h
            }
        );
    }


    function addVerticalRoad(
        world,
        x,
        y,
        w = 115,
        h
    ) {
        return addPath(
            world,
            {
                type:
                    "verticalRoad",

                x,
                y,
                w,
                h
            }
        );
    }


    /* ============================================================
       VILA DO CREPÚSCULO
       ============================================================ */

    function buildVillageWorld() {
        const dimensions =
            WORLD_DIMENSIONS.village;

        const world =
            createEmptyWorld(
                "village",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );

        /*
            ESTRADA PRINCIPAL LESTE/OESTE
        */
        addHorizontalRoad(
            world,
            95,
            1040,
            3010,
            165
        );

        /*
            ESTRADA PRINCIPAL NORTE/SUL
        */
        addVerticalRoad(
            world,
            1518,
            85,
            165,
            2030
        );

        /*
            CAMINHO PARA A CASA DO PLAYER
        */
        addVerticalRoad(
            world,
            545,
            1185,
            100,
            610
        );

        /*
            CAMINHO PARA ELIAN
        */
        addVerticalRoad(
            world,
            588,
            645,
            90,
            395
        );

        /*
            CAMINHO PARA LOJA
        */
        addVerticalRoad(
            world,
            2530,
            640,
            90,
            400
        );

        /*
            CAMINHO PARA FORJA
        */
        addVerticalRoad(
            world,
            2540,
            1190,
            90,
            450
        );

        /*
            CAMINHO PARA OFICINA
        */
        addVerticalRoad(
            world,
            1175,
            1185,
            90,
            555
        );


        /* ========================================================
           CASAS

           POSIÇÕES PRESERVADAS DA BASE APROVADA.
           ======================================================== */

        addBuilding(
            world,
            {
                id: "home",

                houseId: "home",

                name:
                    "CASA DO JOGADOR",

                x: 365,
                y: 1510,

                w: 460,
                h: 330,

                roof:
                    "#724838",

                wall:
                    "#94745b",

                doorWidth: 92
            }
        );


        addBuilding(
            world,
            {
                id: "elianHome",

                houseId:
                    "elianHome",

                name:
                    "CASA DE ELIAN",

                x: 420,
                y: 370,

                w: 435,
                h: 310,

                roof:
                    "#665142",

                wall:
                    "#8f755e",

                doorWidth: 84
            }
        );


        addBuilding(
            world,
            {
                id: "shop",

                houseId: "shop",

                name:
                    "LOJA DE DORAN",

                x: 2365,
                y: 360,

                w: 470,
                h: 325,

                roof:
                    "#684636",

                wall:
                    "#927057",

                doorWidth: 96
            }
        );


        addBuilding(
            world,
            {
                id: "forge",

                houseId: "forge",

                name:
                    "FORJA DE BORIN",

                x: 2395,
                y: 1490,

                w: 470,
                h: 335,

                roof:
                    "#4b4240",

                wall:
                    "#716561",

                doorWidth: 96
            }
        );


        addBuilding(
            world,
            {
                id: "woodshop",

                houseId:
                    "woodshop",

                name:
                    "OFICINA DE BRAN",

                x: 1000,
                y: 1585,

                w: 440,
                h: 300,

                roof:
                    "#75583c",

                wall:
                    "#967652",

                doorWidth: 88
            }
        );


        /* ========================================================
           FONTE
           ======================================================== */

        addLandmark(
            world,
            {
                id:
                    "villageFountain",

                type:
                    "fountain",

                name:
                    "FONTE DA MEMÓRIA",

                x: 1600,
                y: 1115,

                radius: 105,

                mapVisible: true
            }
        );


        addProtectedZone(
            world,
            {
                id:
                    "fountain_safe",

                x: 1450,
                y: 965,

                w: 300,
                h: 300,

                type:
                    "landmark"
            }
        );


        /*
            Colisão central da fonte.
        */
        addObstacle(
            world,
            {
                id:
                    "fountain_collision",

                type:
                    "fountain",

                x: 1534,
                y: 1049,

                w: 132,
                h: 132,

                blocksLight: false
            }
        );


        /* ========================================================
           NPCs EXTERNOS
           ======================================================== */

        addNPC(
            world,
            "elian",
            950,
            900,
            {
                name: "ELIAN",
                role: "Morador",
                color: "#6d594b",
                accent: "#c0a67d",
                facing: "right"
            }
        );


        addNPC(
            world,
            "mara",
            1840,
            1360,
            {
                name: "MARA",
                role: "Pesquisadora",
                color: "#665c72",
                accent: "#b6a8c4",
                facing: "left"
            }
        );


        addNPC(
            world,
            "miguel",
            2770,
            790,
            {
                name: "MIGUEL",
                role: "???",
                color: "#555059",
                accent: "#a38eaa",
                facing: "left"
            }
        );


        /*
            Doran, Bran e Borin ficam
            fisicamente dentro de seus interiores.
        */


        /* ========================================================
           PORTÕES
           ======================================================== */

        addGate(
            world,
            {
                id:
                    "eastGate",

                type:
                    "progression",

                x: 3010,
                y: 980,

                w: 92,
                h: 275,

                side:
                    "east",

                destination:
                    "forest",

                bossRequirement:
                    "road_guardian",

                open:
                    hasDefeatedBoss(
                        "road_guardian"
                    )
            }
        );


        addGate(
            world,
            {
                id:
                    "northGate",

                type:
                    "northProgression",

                x: 1460,
                y: 68,

                w: 280,
                h: 95,

                side:
                    "north",

                destination:
                    "gnomeGardens",

                requiresDashV1:
                    true,

                materialCost:
                    NORTH_GATE_COST,

                open:
                    Boolean(
                        state.player
                            ?.gateUnlocks
                            ?.north
                    )
            }
        );


        /*
            O Guardião da Estrada fica
            próximo do portão leste.
        */
        if (
            !hasDefeatedBoss(
                "road_guardian"
            )
        ) {
            addBossSpawn(
                world,
                {
                    id:
                        "road_guardian_spawn",

                    bossId:
                        "road_guardian",

                    x: 2800,
                    y: 1110,

                    arenaRadius:
                        310
                }
            );
        }


        /*
            DECORAÇÃO GERAL
        */
        const rng =
            createRegionRandom(
                "village"
            );

        for (
            let index = 0;
            index < 75;
            index += 1
        ) {
            const x =
                100 +
                rng() *
                3000;

            const y =
                100 +
                rng() *
                2000;

            if (
                resourcePositionBlocked(
                    world,
                    x,
                    y,
                    26
                )
            ) {
                continue;
            }

            addDecoration(
                world,
                {
                    type:
                        rng() < 0.65
                            ? "grass"
                            : "flower",

                    x,
                    y,

                    variant:
                        Math.floor(
                            rng() * 4
                        )
                }
            );
        }


        scatterTrees(
            world,
            38,
            rng,
            {
                margin: 105
            }
        );


        world.metadata.homeRespawn =
            calculateHomeRespawn(
                world
            );

        return world;
    }


    /* ============================================================
       INTERIOR
       ============================================================ */

    function buildHouseInterior(
        houseId
    ) {
        const definition =
            HOUSE_INTERIORS[
                houseId
            ];

        if (!definition) {
            return null;
        }

        const world =
            createEmptyWorld(
                `interior_${houseId}`,
                definition.worldWidth,
                definition.worldHeight
            );

        world.metadata.isInterior =
            true;

        world.metadata.houseId =
            houseId;

        world.metadata.definition =
            definition;


        /*
            Colisões externas do cômodo.
        */
        const room =
            definition.room;

        const wallThickness = 36;

        addObstacle(
            world,
            {
                id:
                    `${houseId}_top_wall`,

                type:
                    "interiorWall",

                x:
                    room.x,

                y:
                    room.y,

                w:
                    room.w,

                h:
                    wallThickness
            }
        );


        addObstacle(
            world,
            {
                id:
                    `${houseId}_left_wall`,

                type:
                    "interiorWall",

                x:
                    room.x,

                y:
                    room.y,

                w:
                    wallThickness,

                h:
                    room.h
            }
        );


        addObstacle(
            world,
            {
                id:
                    `${houseId}_right_wall`,

                type:
                    "interiorWall",

                x:
                    room.x +
                    room.w -
                    wallThickness,

                y:
                    room.y,

                w:
                    wallThickness,

                h:
                    room.h
            }
        );


        /*
            Parede inferior dividida em 2
            para deixar a porta física aberta.
        */
        const door =
            definition.door;

        addObstacle(
            world,
            {
                id:
                    `${houseId}_bottom_left`,

                type:
                    "interiorWall",

                x:
                    room.x,

                y:
                    room.y +
                    room.h -
                    wallThickness,

                w:
                    Math.max(
                        0,
                        door.x -
                        room.x
                    ),

                h:
                    wallThickness
            }
        );


        addObstacle(
            world,
            {
                id:
                    `${houseId}_bottom_right`,

                type:
                    "interiorWall",

                x:
                    door.x +
                    door.w,

                y:
                    room.y +
                    room.h -
                    wallThickness,

                w:
                    Math.max(
                        0,
                        room.x +
                        room.w -
                        (
                            door.x +
                            door.w
                        )
                    ),

                h:
                    wallThickness
            }
        );


        /*
            Móveis que realmente bloqueiam.
        */
        for (
            const furniture of
            definition.furniture
        ) {
            addDecoration(
                world,
                {
                    ...furniture,
                    interior:
                        true
                }
            );

            const blockingTypes =
                new Set([
                    "bed",
                    "table",
                    "desk",
                    "counter",
                    "forge",
                    "anvil",
                    "workbench",
                    "bookshelf",
                    "shelf",
                    "chest",
                    "crate"
                ]);

            if (
                blockingTypes.has(
                    furniture.type
                )
            ) {
                addObstacle(
                    world,
                    {
                        id:
                            `${houseId}_${furniture.type}_${furniture.x}_${furniture.y}`,

                        type:
                            "furniture",

                        x:
                            furniture.x,

                        y:
                            furniture.y,

                        w:
                            furniture.w,

                        h:
                            furniture.h,

                        blocksLight:
                            false
                    }
                );
            }
        }


        /*
            Porta de saída.
        */
        world.doors.push({
            id:
                `${houseId}_exit`,

            buildingId:
                houseId,

            houseId,

            x:
                door.x,

            y:
                door.y,

            w:
                door.w,

            h:
                door.h,

            centerX:
                door.x +
                door.w / 2,

            centerY:
                door.y +
                door.h / 2,

            side:
                door.side,

            interiorExit:
                true,

            open:
                true,

            openAmount:
                1
        });


        if (
            definition.npc
        ) {
            const npc =
                definition.npc;

            const styles = {
                doran: {
                    name: "DORAN",
                    role: "Comerciante",
                    color: "#71533f",
                    accent: "#d7aa66",
                    shop: true
                },

                bran: {
                    name: "BRAN",
                    role: "Carpinteiro",
                    color: "#6e583e",
                    accent: "#c39b62",
                    quest: "wood"
                },

                borin: {
                    name: "BORIN",
                    role: "Ferreiro",
                    color: "#534b48",
                    accent: "#c46c45",
                    shop: true,
                    quest: "coal"
                }
            };

            addNPC(
                world,
                npc.id,
                npc.x,
                npc.y,
                {
                    facing:
                        npc.facing,

                    ...(
                        styles[npc.id] ||
                        {}
                    )
                }
            );
        }


        if (
            houseId ===
            "home"
        ) {
            addLandmark(
                world,
                {
                    id:
                        "home_rest_bed",

                    type:
                        "rest",

                    name:
                        "DESCANSAR",

                    x: 285,
                    y: 230,

                    radius: 72
                }
            );
        }


        return world;
    }


    /* ============================================================
       FLORESTA — CAMINHO 1
       ============================================================ */

    function buildForestWorld() {
        const dimensions =
            WORLD_DIMENSIONS.forest;

        const world =
            createEmptyWorld(
                "forest",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );

        addHorizontalRoad(
            world,
            90,
            1070,
            3220,
            155
        );


        addProtectedZone(
            world,
            {
                id: "forest_entry",
                x: 90,
                y: 970,
                w: 360,
                h: 350
            }
        );


        addProtectedZone(
            world,
            {
                id: "forest_exit",
                x: 3000,
                y: 970,
                w: 330,
                h: 350
            }
        );


        addNPC(
            world,
            "nara",
            1180,
            830,
            {
                name: "NARA",
                role:
                    "Guardadora da Floresta",
                color: "#46614b",
                accent: "#93b280"
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "forest_wolves_1",

                species:
                    "wolf",

                count: 4,

                x: 800,
                y: 1540,

                radius: 430
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "forest_boars",

                species:
                    "boar",

                count: 3,

                x: 1700,
                y: 650,

                radius: 370
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "forest_thornlings",

                species:
                    "thornling",

                count: 3,

                x: 2450,
                y: 1550,

                radius: 360
            }
        );


        if (
            !hasDefeatedBoss(
                "forest_warden"
            )
        ) {
            addBossSpawn(
                world,
                {
                    id:
                        "forest_warden_spawn",

                    bossId:
                        "forest_warden",

                    x: 2920,
                    y: 1150,

                    arenaRadius:
                        320
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "forest_to_village",

                x: 125,
                y: 1150,

                destination:
                    "village",

                destinationSpawn:
                    "fromForest"
            }
        );


        addPortal(
            world,
            {
                id:
                    "forest_to_grove",

                x: 3270,
                y: 1150,

                destination:
                    "grove",

                destinationSpawn:
                    "fromForest",

                requirementBoss:
                    "forest_warden"
            }
        );


        const rng =
            createRegionRandom(
                "forest"
            );

        scatterTrees(
            world,
            118,
            rng
        );


        return world;
    }


    /* ============================================================
       BOSQUE
       ============================================================ */

    function buildGroveWorld() {
        const dimensions =
            WORLD_DIMENSIONS.grove;

        const world =
            createEmptyWorld(
                "grove",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );

        addHorizontalRoad(
            world,
            90,
            1085,
            3320,
            155
        );


        addVerticalRoad(
            world,
            1650,
            380,
            120,
            705
        );


        addNPC(
            world,
            "lyra",
            1570,
            770,
            {
                name: "LYRA",
                role:
                    "Guardiã do Bosque",
                color: "#806581",
                accent: "#e0a9d1"
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "thornling",

                count: 5,

                x: 960,
                y: 1610,

                radius: 500
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "wolf",

                count: 4,

                x: 2360,
                y: 630,

                radius: 430
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "spider",

                count: 4,

                x: 2500,
                y: 1650,

                radius: 420
            }
        );


        if (
            !hasDefeatedBoss(
                "grove_heart"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "grove_heart",

                    x: 3080,
                    y: 1170,

                    arenaRadius:
                        330
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "grove_to_forest",

                x: 125,
                y: 1170,

                destination:
                    "forest",

                destinationSpawn:
                    "fromGrove"
            }
        );


        addPortal(
            world,
            {
                id:
                    "grove_to_mountains",

                x: 3370,
                y: 1170,

                destination:
                    "mountains",

                destinationSpawn:
                    "fromGrove",

                requirementBoss:
                    "grove_heart"
            }
        );


        const rng =
            createRegionRandom(
                "grove"
            );

        scatterTrees(
            world,
            105,
            rng
        );


        return world;
    }


    /* ============================================================
       MONTANHAS
       ============================================================ */

    function buildMountainsWorld() {
        const dimensions =
            WORLD_DIMENSIONS.mountains;

        const world =
            createEmptyWorld(
                "mountains",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addHorizontalRoad(
            world,
            90,
            1090,
            3310,
            145
        );


        addNPC(
            world,
            "kael",
            970,
            855,
            {
                name: "KAEL",
                role:
                    "Viajante da Montanha",
                color: "#687073",
                accent: "#bdc7c9"
            }
        );


        for (
            let index = 0;
            index < 22;
            index += 1
        ) {
            const x =
                450 +
                (
                    index %
                    7
                ) *
                410;

            const y =
                index % 2 === 0
                    ? 480
                    : 1730;

            addObstacle(
                world,
                {
                    type: "rock",

                    x:
                        x -
                        45,

                    y:
                        y -
                        45,

                    w: 90,
                    h: 90,

                    blocksLight: true
                }
            );

            addDecoration(
                world,
                {
                    type:
                        "mountainRock",

                    x,
                    y,

                    size:
                        random(
                            34,
                            58
                        )
                }
            );
        }


        addEnemySpawn(
            world,
            {
                species:
                    "stoneCrawler",

                count: 5,

                x: 1150,
                y: 1650,

                radius: 430
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "bat",

                count: 5,

                x: 2150,
                y: 620,

                radius: 500
            }
        );


        if (
            !hasDefeatedBoss(
                "mountain_titan"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "mountain_titan",

                    x: 3020,
                    y: 1160,

                    arenaRadius:
                        340
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "mountain_to_grove",

                x: 125,
                y: 1170,

                destination:
                    "grove",

                destinationSpawn:
                    "fromMountains"
            }
        );


        addPortal(
            world,
            {
                id:
                    "mountain_to_iron",

                x: 3370,
                y: 1160,

                destination:
                    "iron",

                destinationSpawn:
                    "fromMountains",

                requirementBoss:
                    "mountain_titan"
            }
        );


        const rng =
            createRegionRandom(
                "mountains"
            );

        scatterOre(
            world,
            "carvao",
            25,
            rng
        );


        return world;
    }


    /* ============================================================
       TERRAS DE FERRO
       ============================================================ */

    function buildIronWorld() {
        const dimensions =
            WORLD_DIMENSIONS.iron;

        const world =
            createEmptyWorld(
                "iron",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addHorizontalRoad(
            world,
            90,
            1040,
            3220,
            150
        );


        addEnemySpawn(
            world,
            {
                species:
                    "mineCrawler",

                count: 6,

                x: 1000,
                y: 1600,

                radius: 470
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "stoneCrawler",

                count: 4,

                x: 2300,
                y: 650,

                radius: 450
            }
        );


        if (
            !hasDefeatedBoss(
                "iron_colossus"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "iron_colossus",

                    x: 2950,
                    y: 1120,

                    arenaRadius:
                        345
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "iron_to_mountains",

                x: 125,
                y: 1120,

                destination:
                    "mountains",

                destinationSpawn:
                    "fromIron"
            }
        );


        addPortal(
            world,
            {
                id:
                    "iron_to_ruby",

                x: 3270,
                y: 1120,

                destination:
                    "ruby",

                destinationSpawn:
                    "fromIron",

                requirementBoss:
                    "iron_colossus"
            }
        );


        const rng =
            createRegionRandom(
                "iron"
            );

        scatterOre(
            world,
            "ferro",
            38,
            rng,
            {
                quantity: 1
            }
        );


        scatterOre(
            world,
            "carvao",
            20,
            rng
        );


        return world;
    }


    /* ============================================================
       TERRAS RUBI
       ============================================================ */

    function buildRubyWorld() {
        const dimensions =
            WORLD_DIMENSIONS.ruby;

        const world =
            createEmptyWorld(
                "ruby",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addHorizontalRoad(
            world,
            90,
            1065,
            3310,
            150
        );


        addEnemySpawn(
            world,
            {
                species:
                    "rubyHound",

                count: 6,

                x: 1180,
                y: 650,

                radius: 460
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "scorpion",

                count: 5,

                x: 2100,
                y: 1650,

                radius: 470
            }
        );


        if (
            !hasDefeatedBoss(
                "ruby_chimera"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "ruby_chimera",

                    x: 3050,
                    y: 1150,

                    arenaRadius:
                        355
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "ruby_to_iron",

                x: 125,
                y: 1140,

                destination:
                    "iron",

                destinationSpawn:
                    "fromRuby"
            }
        );


        addPortal(
            world,
            {
                id:
                    "ruby_to_pre_monarch",

                x: 3370,
                y: 1150,

                destination:
                    "preMonarch",

                destinationSpawn:
                    "fromRuby",

                requirementBoss:
                    "ruby_chimera"
            }
        );


        const rng =
            createRegionRandom(
                "ruby"
            );

        scatterOre(
            world,
            "ouro",
            24,
            rng
        );


        scatterOre(
            world,
            "rubi",
            36,
            rng
        );


        scatterOre(
            world,
            "diamante",
            18,
            rng
        );


        return world;
    }


    /* ============================================================
       PRÉ-LABIRINTO

       A PORTA SECRETA DO VAZIO FICA AQUI.
       ============================================================ */

    function buildPreMonarchWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .preMonarch;

        const world =
            createEmptyWorld(
                "preMonarch",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addHorizontalRoad(
            world,
            90,
            1050,
            3220,
            145
        );


        /*
            Caminhos secundários escondidos:
            um superior e um inferior.

            A porta real será escolhida de forma
            determinística pela seed.
        */
        addVerticalRoad(
            world,
            1640,
            340,
            120,
            710
        );


        addVerticalRoad(
            world,
            1640,
            1195,
            120,
            690
        );


        const rng =
            createRegionRandom(
                "preMonarch_secret"
            );

        const secretSide =
            rng() < 0.5
                ? "top"
                : "bottom";


        const secretDoor =
            secretSide === "top"
                ? {
                    x: 1600,
                    y: 205,
                    w: 200,
                    h: 58,
                    side: "top"
                }
                : {
                    x: 1600,
                    y: 1980,
                    w: 200,
                    h: 58,
                    side: "bottom"
                };


        world.secretDoor = {
            id:
                "voidSecretDoor",

            type:
                "voidDoor",

            x:
                secretDoor.x,

            y:
                secretDoor.y,

            w:
                secretDoor.w,

            h:
                secretDoor.h,

            side:
                secretDoor.side,

            open:
                Boolean(
                    state.player
                        ?.miguelQuest
                        ?.secretDoorOpened
                ),

            discovered:
                Boolean(
                    state.player
                        ?.miguelQuest
                        ?.secretDoorFound
                ),

            destination:
                "voidDungeon",

            requiresItem:
                "chaveObscura"
        };


        /*
            A porta fechada possui colisão.
        */
        if (
            !world.secretDoor.open
        ) {
            addObstacle(
                world,
                {
                    id:
                        "void_secret_door_block",

                    type:
                        "secretDoor",

                    x:
                        secretDoor.x,

                    y:
                        secretDoor.y,

                    w:
                        secretDoor.w,

                    h:
                        secretDoor.h,

                    blocksLight:
                        true
                }
            );
        }


        addLandmark(
            world,
            {
                id:
                    "voidSecretDoorMarker",

                type:
                    "secretDoor",

                x:
                    secretDoor.x +
                    secretDoor.w / 2,

                y:
                    secretDoor.y +
                    secretDoor.h / 2,

                mapVisible:
                    Boolean(
                        state.player
                            ?.miguelQuest
                            ?.secretDoorFound
                    )
            }
        );


        addPortal(
            world,
            {
                id:
                    "pre_monarch_to_ruby",

                x: 125,
                y: 1120,

                destination:
                    "ruby",

                destinationSpawn:
                    "fromPreMonarch"
            }
        );


        addPortal(
            world,
            {
                id:
                    "pre_monarch_to_maze",

                x: 3270,
                y: 1120,

                destination:
                    "monarchMaze",

                destinationSpawn:
                    "fromPreMonarch"
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "spider",

                count: 4,

                x: 1050,
                y: 580,

                radius: 390
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "bat",

                count: 4,

                x: 2250,
                y: 1650,

                radius: 420
            }
        );


        /*
            ZONA ESCURA.
        */
        world.darknessZones.push({
            id:
                "pre_monarch_darkness",

            x: 0,
            y: 0,

            w:
                world.width,

            h:
                world.height,

            requiresLantern:
                true,

            barrierText:
                "Está muito escuro, não podes continuar."
        });


        return world;
    }


    /* ============================================================
       LABIRINTO DO MONARCA
       ============================================================ */

    function buildMonarchMazeWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .monarchMaze;

        const world =
            createEmptyWorld(
                "monarchMaze",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        /*
            CORREDOR PRINCIPAL
        */
        addHorizontalRoad(
            world,
            90,
            1080,
            3410,
            130
        );


        /*
            PAREDES DO LABIRINTO
        */
        const walls = [
            [450, 340, 70, 660],
            [450, 1320, 70, 590],

            [780, 500, 70, 840],
            [780, 1590, 70, 380],

            [1120, 280, 70, 620],
            [1120, 1190, 70, 680],

            [1470, 500, 70, 770],
            [1470, 1520, 70, 500],

            [1820, 260, 70, 590],
            [1820, 1140, 70, 720],

            [2170, 520, 70, 720],
            [2170, 1510, 70, 480],

            [2520, 300, 70, 650],
            [2520, 1240, 70, 620],

            [2870, 520, 70, 720],
            [2870, 1510, 70, 450]
        ];


        walls.forEach(
            (
                [
                    x,
                    y,
                    w,
                    h
                ],
                index
            ) => {
                addObstacle(
                    world,
                    {
                        id:
                            `maze_wall_${index}`,

                        type:
                            "mazeWall",

                        x,
                        y,
                        w,
                        h,

                        blocksLight:
                            true
                    }
                );
            }
        );


        /*
            Inimigos do labirinto também
            podem derrubar Essência Sombria
            DEPOIS da missão de Miguel ser iniciada.
        */
        addEnemySpawn(
            world,
            {
                id:
                    "maze_spiders",

                species:
                    "spider",

                count: 7,

                x: 1050,
                y: 680,

                radius: 690,

                dropTable:
                    Object.freeze([
                        Object.freeze({
                            item:
                                "essenciaSombria",

                            chance:
                                0.68,

                            min:
                                1,

                            max:
                                2,

                            requiresQuest:
                                "voidTrial"
                        })
                    ])
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "maze_scorpions",

                species:
                    "scorpion",

                count: 6,

                x: 2100,
                y: 1630,

                radius: 710,

                dropTable:
                    Object.freeze([
                        Object.freeze({
                            item:
                                "essenciaSombria",

                            chance:
                                0.72,

                            min:
                                1,

                            max:
                                2,

                            requiresQuest:
                                "voidTrial"
                        })
                    ])
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "maze_bats",

                species:
                    "bat",

                count: 6,

                x: 2860,
                y: 710,

                radius: 560,

                dropTable:
                    Object.freeze([
                        Object.freeze({
                            item:
                                "essenciaSombria",

                            chance:
                                0.62,

                            min:
                                1,

                            max:
                                2,

                            requiresQuest:
                                "voidTrial"
                        })
                    ])
            }
        );


        if (
            !hasDefeatedBoss(
                "monarch"
            )
        ) {
            addBossSpawn(
                world,
                {
                    id:
                        "monarch_spawn",

                    bossId:
                        "monarch",

                    x: 3310,
                    y: 1150,

                    arenaRadius:
                        360,

                    altarX:
                        3175,

                    altarY:
                        1150
                }
            );
        }


        addLandmark(
            world,
            {
                id:
                    "dashAltar",

                type:
                    "dashAltar",

                x: 3150,
                y: 1150,

                radius: 70,

                mapVisible:
                    true
            }
        );


        addPortal(
            world,
            {
                id:
                    "maze_to_pre_monarch",

                x: 125,
                y: 1150,

                destination:
                    "preMonarch",

                destinationSpawn:
                    "fromMaze"
            }
        );


        world.darknessZones.push({
            id:
                "monarch_maze_darkness",

            x: 0,
            y: 0,

            w:
                world.width,

            h:
                world.height,

            requiresLantern:
                true,

            barrier:
                Object.freeze({
                    x: 370,
                    y: 985,
                    w: 80,
                    h: 330
                }),

            barrierText:
                "Está muito escuro, não podes continuar."
        });


        return world;
    }


    /* ============================================================
       JARDINS DOS GNOMOS — CAMINHO 2
       ============================================================ */

    function buildGnomeGardensWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .gnomeGardens;

        const world =
            createEmptyWorld(
                "gnomeGardens",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addVerticalRoad(
            world,
            1680,
            110,
            140,
            2090
        );


        /*
            CAMINHOS LATERAIS ORGÂNICOS
        */
        addHorizontalRoad(
            world,
            500,
            1420,
            2500,
            100
        );


        addHorizontalRoad(
            world,
            720,
            720,
            2050,
            90
        );


        /*
            Pequenas casas de gnomos
            apenas decorativas.
        */
        const gnomeHomes = [
            [580, 1650],
            [930, 1780],
            [2450, 1660],
            [2750, 1510],
            [710, 450],
            [2610, 430]
        ];


        gnomeHomes.forEach(
            (
                [
                    x,
                    y
                ],
                index
            ) => {
                addDecoration(
                    world,
                    {
                        id:
                            `gnome_home_${index}`,

                        type:
                            "gnomeHome",

                        x,
                        y,

                        size:
                            70 +
                            (
                                index %
                                3
                            ) *
                            10
                    }
                );

                addProtectedZone(
                    world,
                    {
                        x:
                            x - 70,

                        y:
                            y - 70,

                        w: 140,
                        h: 140
                    }
                );
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "goblin",

                count: 5,

                x: 850,
                y: 1170,

                radius: 460
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "wolf",

                count: 4,

                x: 2500,
                y: 1100,

                radius: 470
            }
        );


        if (
            !hasDefeatedBoss(
                "gnome_guardian"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "gnome_guardian",

                    x: 1750,
                    y: 430,

                    arenaRadius:
                        340
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "gnome_to_village",

                x: 1750,
                y: 2215,

                destination:
                    "village",

                destinationSpawn:
                    "fromNorth"
            }
        );


        addPortal(
            world,
            {
                id:
                    "gnome_to_fairy",

                x: 1750,
                y: 105,

                destination:
                    "fairyKingdom",

                destinationSpawn:
                    "fromGnome",

                requirementBoss:
                    "gnome_guardian"
            }
        );


        const rng =
            createRegionRandom(
                "gnomeGardens"
            );

        scatterTrees(
            world,
            88,
            rng
        );


        for (
            let index = 0;
            index < 90;
            index += 1
        ) {
            addDecoration(
                world,
                {
                    type:
                        index % 3 === 0
                            ? "mushroom"
                            : "flower",

                    x:
                        150 +
                        rng() *
                        3200,

                    y:
                        150 +
                        rng() *
                        2000,

                    variant:
                        Math.floor(
                            rng() *
                            5
                        )
                }
            );
        }


        return world;
    }


    /* ============================================================
       REINO FEÉRICO
       ============================================================ */

    function buildFairyKingdomWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .fairyKingdom;

        const world =
            createEmptyWorld(
                "fairyKingdom",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addVerticalRoad(
            world,
            1730,
            100,
            140,
            2160
        );


        addHorizontalRoad(
            world,
            720,
            1270,
            2160,
            95
        );


        /*
            Lago brilhante.
        */
        addLandmark(
            world,
            {
                id:
                    "fairyLake",

                type:
                    "fairyLake",

                x: 920,
                y: 850,

                radius: 250,

                mapVisible:
                    true
            }
        );


        /*
            Árvore feérica gigante.
        */
        addLandmark(
            world,
            {
                id:
                    "fairyAncientTree",

                type:
                    "ancientFairyTree",

                x: 2700,
                y: 870,

                radius: 180,

                mapVisible:
                    true
            }
        );


        addProtectedZone(
            world,
            {
                x: 660,
                y: 590,

                w: 520,
                h: 520
            }
        );


        addProtectedZone(
            world,
            {
                x: 2500,
                y: 660,

                w: 400,
                h: 430
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "thornling",

                count: 5,

                x: 900,
                y: 1660,

                radius: 470
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "spider",

                count: 5,

                x: 2700,
                y: 1650,

                radius: 470
            }
        );


        if (
            !hasDefeatedBoss(
                "fairy_guardian"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "fairy_guardian",

                    x: 1800,
                    y: 430,

                    arenaRadius:
                        350
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "fairy_to_gnome",

                x: 1800,
                y: 2240,

                destination:
                    "gnomeGardens",

                destinationSpawn:
                    "fromFairy"
            }
        );


        addPortal(
            world,
            {
                id:
                    "fairy_to_frontier",

                x: 1800,
                y: 100,

                destination:
                    "celestialFrontier",

                destinationSpawn:
                    "fromFairy",

                requirementBoss:
                    "fairy_guardian"
            }
        );


        const rng =
            createRegionRandom(
                "fairyKingdom"
            );

        scatterTrees(
            world,
            76,
            rng
        );


        for (
            let index = 0;
            index < 125;
            index += 1
        ) {
            addDecoration(
                world,
                {
                    type:
                        rng() < 0.55
                            ? "fairyFlower"
                            : "fairyLight",

                    x:
                        120 +
                        rng() *
                        3360,

                    y:
                        120 +
                        rng() *
                        2100,

                    variant:
                        Math.floor(
                            rng() *
                            5
                        )
                }
            );
        }


        return world;
    }


    /* ============================================================
       FRONTEIRA CELESTIAL

       TRANSIÇÃO AMBIENTAL REAL.
       ============================================================ */

    function getCelestialFrontierBlend(
        y,
        worldHeight =
            WORLD_DIMENSIONS
                .celestialFrontier
                .height
    ) {
        /*
            Sul = Fada
            Norte = Céu

            NÃO é transição de tela.
        */
        const normalized =
            1 -
            clamp(
                y /
                worldHeight,
                0,
                1
            );

        return clamp(
            (
                normalized -
                0.18
            ) /
            0.66,
            0,
            1
        );
    }


    function buildCelestialFrontierWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .celestialFrontier;

        const world =
            createEmptyWorld(
                "celestialFrontier",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addVerticalRoad(
            world,
            1875,
            100,
            150,
            2210
        );


        /*
            Trilhas feéricas no sul.
        */
        addHorizontalRoad(
            world,
            850,
            1750,
            2200,
            90
        );


        /*
            Estruturas celestiais no norte.
        */
        addHorizontalRoad(
            world,
            1100,
            620,
            1700,
            100
        );


        world.transitions.push({
            id:
                "fairy_to_sky_environment",

            type:
                "environmentBlend",

            axis:
                "y",

            from:
                "fairy",

            to:
                "sky",

            blendFunction:
                "getCelestialFrontierBlend"
        });


        /*
            LOCAL ESCONDIDO DA CHAVE OBSCURA.

            Ele é colocado afastado do caminho
            principal e nunca recebe marcador
            antes de ser encontrado.
        */
        const keyAlreadyCollected =
            Boolean(
                state.player
                    ?.miguelQuest
                    ?.keyCollected ||
                state.player
                    ?.miguelQuest
                    ?.keyConsumed
            );


        if (
            !keyAlreadyCollected
        ) {
            world.darkKey = {
                id:
                    "darkKeyEntity",

                type:
                    "darkKey",

                itemId:
                    "chaveObscura",

                /*
                    Fica escondida antes do
                    portão definitivo do céu.
                */
                x: 630,
                y: 610,

                radius: 28,

                holdSeconds:
                    VOID_MISSION_CONFIG
                        .keyHoldSeconds,

                requiresMission:
                    true,

                requiredEssence:
                    VOID_MISSION_CONFIG
                        .shadowEssenceRequired,

                visible:
                    Boolean(
                        state.player
                            ?.miguelQuest
                            ?.missionAccepted
                    ),

                collected:
                    false
            };


            addProtectedZone(
                world,
                {
                    id:
                        "dark_key_hidden_area",

                    x: 465,
                    y: 440,

                    w: 350,
                    h: 350,

                    type:
                        "questSecret"
                }
            );
        }


        /*
            BOSS QUE TESTA DASH V1.
        */
        if (
            !hasDefeatedBoss(
                "celestial_dash_guardian"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "celestial_dash_guardian",

                    x: 1950,
                    y: 890,

                    arenaRadius:
                        390,

                    requiresDash:
                        true
                }
            );
        }


        addEnemySpawn(
            world,
            {
                species:
                    "goblin",

                count: 4,

                x: 900,
                y: 1570,

                radius: 470
            }
        );


        addEnemySpawn(
            world,
            {
                species:
                    "bat",

                count: 5,

                x: 2920,
                y: 1200,

                radius: 520
            }
        );


        addPortal(
            world,
            {
                id:
                    "frontier_to_fairy",

                x: 1950,
                y: 2310,

                destination:
                    "fairyKingdom",

                destinationSpawn:
                    "fromFrontier"
            }
        );


        addPortal(
            world,
            {
                id:
                    "frontier_to_stair",

                x: 1950,
                y: 95,

                destination:
                    "celestialStair",

                destinationSpawn:
                    "fromFrontier",

                requirementBoss:
                    "celestial_dash_guardian"
            }
        );


        /*
            DECORAÇÃO EM GRADIENTE:
            sul = flores/raízes
            norte = nuvens/pedras claras
        */
        const rng =
            createRegionRandom(
                "celestialFrontier"
            );

        for (
            let index = 0;
            index < 155;
            index += 1
        ) {
            const x =
                120 +
                rng() *
                (
                    world.width -
                    240
                );

            const y =
                120 +
                rng() *
                (
                    world.height -
                    240
                );

            const blend =
                getCelestialFrontierBlend(
                    y,
                    world.height
                );

            let type;

            if (
                blend < 0.3
            ) {
                type =
                    rng() < 0.6
                        ? "fairyFlower"
                        : "fairyLight";
            } else if (
                blend < 0.7
            ) {
                type =
                    rng() < 0.5
                        ? "paleFlower"
                        : "celestialGrass";
            } else {
                type =
                    rng() < 0.55
                        ? "cloudTuft"
                        : "celestialStone";
            }

            addDecoration(
                world,
                {
                    type,
                    x,
                    y,

                    blend
                }
            );
        }


        return world;
    }


    /* ============================================================
       ESCADARIA CELESTIAL
       ============================================================ */

    function buildCelestialStairWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .celestialStair;

        const world =
            createEmptyWorld(
                "celestialStair",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        /*
            Grande escadaria central.
        */
        for (
            let index = 0;
            index < 18;
            index += 1
        ) {
            addDecoration(
                world,
                {
                    id:
                        `celestial_step_${index}`,

                    type:
                        "celestialStep",

                    x:
                        1120 +
                        index * 9,

                    y:
                        2150 -
                        index * 104,

                    w:
                        960 -
                        index * 18,

                    h: 78
                }
            );
        }


        addVerticalRoad(
            world,
            1500,
            100,
            200,
            2320
        );


        /*
            Boss no topo da escadaria.
        */
        if (
            !hasDefeatedBoss(
                "stair_guardian"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "stair_guardian",

                    x: 1600,
                    y: 460,

                    arenaRadius:
                        400,

                    requiresDash:
                        true
                }
            );
        }


        addPortal(
            world,
            {
                id:
                    "stair_to_frontier",

                x: 1600,
                y: 2450,

                destination:
                    "celestialFrontier",

                destinationSpawn:
                    "fromStair"
            }
        );


        addPortal(
            world,
            {
                id:
                    "stair_to_sky1",

                x: 1600,
                y: 95,

                destination:
                    "sky1",

                destinationSpawn:
                    "fromStair",

                requirementBoss:
                    "stair_guardian"
            }
        );


        return world;
    }


    /* ============================================================
       CÉU I
       ============================================================ */

    function buildSky1World() {
        const dimensions =
            WORLD_DIMENSIONS.sky1;

        const world =
            createEmptyWorld(
                "sky1",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addVerticalRoad(
            world,
            1675,
            110,
            150,
            2130
        );


        addHorizontalRoad(
            world,
            700,
            1280,
            2100,
            100
        );


        /*
            HORDAS 1 E 2
        */
        world.metadata.skyTrialWaves =
            Object.freeze([
                Object.freeze({
                    wave: 1,

                    spawns:
                        Object.freeze([
                            Object.freeze({
                                species:
                                    "bat",

                                count: 5
                            }),

                            Object.freeze({
                                species:
                                    "goblin",

                                count: 3
                            })
                        ])
                }),

                Object.freeze({
                    wave: 2,

                    spawns:
                        Object.freeze([
                            Object.freeze({
                                species:
                                    "wolf",

                                count: 4
                            }),

                            Object.freeze({
                                species:
                                    "thornling",

                                count: 4
                            })
                        ])
                })
            ]);


        addLandmark(
            world,
            {
                id:
                    "skyTrialOne",

                type:
                    "trialArena",

                x: 1750,
                y: 1180,

                radius: 440,

                waves:
                    Object.freeze([
                        1,
                        2
                    ])
            }
        );


        addPortal(
            world,
            {
                id:
                    "sky1_to_stair",

                x: 1750,
                y: 2240,

                destination:
                    "celestialStair",

                destinationSpawn:
                    "fromSky1"
            }
        );


        addPortal(
            world,
            {
                id:
                    "sky1_to_sky2",

                x: 1750,
                y: 95,

                destination:
                    "sky2",

                destinationSpawn:
                    "fromSky1",

                requiresSkyWave:
                    2
            }
        );


        return world;
    }


    /* ============================================================
       CÉU II
       ============================================================ */

    function buildSky2World() {
        const dimensions =
            WORLD_DIMENSIONS.sky2;

        const world =
            createEmptyWorld(
                "sky2",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addVerticalRoad(
            world,
            1705,
            105,
            145,
            2180
        );


        /*
            HORDAS 3 E 4
        */
        world.metadata.skyTrialWaves =
            Object.freeze([
                Object.freeze({
                    wave: 3,

                    spawns:
                        Object.freeze([
                            Object.freeze({
                                species:
                                    "stoneCrawler",

                                count: 4
                            }),

                            Object.freeze({
                                species:
                                    "bat",

                                count: 5
                            })
                        ])
                }),

                Object.freeze({
                    wave: 4,

                    spawns:
                        Object.freeze([
                            Object.freeze({
                                species:
                                    "rubyHound",

                                count: 4
                            }),

                            Object.freeze({
                                species:
                                    "scorpion",

                                count: 4
                            })
                        ])
                })
            ]);


        addLandmark(
            world,
            {
                id:
                    "skyTrialTwo",

                type:
                    "trialArena",

                x: 1775,
                y: 1200,

                radius: 445,

                waves:
                    Object.freeze([
                        3,
                        4
                    ])
            }
        );


        addPortal(
            world,
            {
                id:
                    "sky2_to_sky1",

                x: 1775,
                y: 2310,

                destination:
                    "sky1",

                destinationSpawn:
                    "fromSky2"
            }
        );


        addPortal(
            world,
            {
                id:
                    "sky2_to_sky3",

                x: 1775,
                y: 95,

                destination:
                    "sky3",

                destinationSpawn:
                    "fromSky2",

                requiresSkyWave:
                    4
            }
        );


        return world;
    }


    /* ============================================================
       CÉU III

       HABILIDADE FUTURA NÃO INVENTADA.
       ============================================================ */

    function buildSky3World() {
        const dimensions =
            WORLD_DIMENSIONS.sky3;

        const world =
            createEmptyWorld(
                "sky3",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );


        addVerticalRoad(
            world,
            1780,
            120,
            150,
            2200
        );


        /*
            QUINTA E ÚLTIMA HORDA.
        */
        world.metadata.skyTrialWaves =
            Object.freeze([
                Object.freeze({
                    wave: 5,

                    spawns:
                        Object.freeze([
                            Object.freeze({
                                species:
                                    "rubyHound",

                                count: 3
                            }),

                            Object.freeze({
                                species:
                                    "mineCrawler",

                                count: 3
                            }),

                            Object.freeze({
                                species:
                                    "bat",

                                count: 4
                            })
                        ])
                })
            ]);


        addLandmark(
            world,
            {
                id:
                    "skyTrialFinal",

                type:
                    "trialArena",

                x: 1850,
                y: 1420,

                radius: 470,

                waves:
                    Object.freeze([
                        5
                    ])
            }
        );


        /*
            GUARDIÃO DO CAMINHO
            aparece após as CINCO hordas.
        */
        if (
            state.player
                ?.skyTrial
                ?.complete &&
            !hasDefeatedBoss(
                "path_guardian"
            )
        ) {
            addBossSpawn(
                world,
                {
                    bossId:
                        "path_guardian",

                    x: 1850,
                    y: 520,

                    arenaRadius:
                        430
                }
            );
        }


        addLandmark(
            world,
            {
                id:
                    "futureSkyThreeMystery",

                type:
                    "sealedMystery",

                x: 3020,
                y: 550,

                radius: 115,

                /*
                    NÃO TEM HABILIDADE DEFINIDA.
                */
                futureContent:
                    true,

                mapVisible:
                    false
            }
        );


        addPortal(
            world,
            {
                id:
                    "sky3_to_sky2",

                x: 1850,
                y: 2350,

                destination:
                    "sky2",

                destinationSpawn:
                    "fromSky3"
            }
        );


        return world;
    }


    /* ============================================================
       DUNGEON DO VAZIO
       ============================================================ */

    function buildVoidDungeonWorld() {
        const dimensions =
            WORLD_DIMENSIONS
                .voidDungeon;

        const world =
            createEmptyWorld(
                "voidDungeon",
                dimensions.width,
                dimensions.height
            );


        world.metadata.secret =
            true;

        world.metadata.minimap =
            "NO_SIGNAL";

        world.metadata.requiresLanternAtStart =
            true;


        /*
            Aqui NÃO usamos bordas simples
            como as regiões abertas.

            A dungeon será desenhada como
            uma estrutura fechada.
        */


        /* ========================================================
           CORREDOR ESCURO PRINCIPAL
           ======================================================== */

        const corridorLeft = 1550;
        const corridorRight = 1950;

        const corridorTop = 1030;
        const corridorBottom = 2220;


        addObstacle(
            world,
            {
                id:
                    "void_corridor_left",

                type:
                    "dungeonWall",

                x: 1330,
                y: 950,

                w: 220,
                h: 1350,

                blocksLight:
                    true
            }
        );


        addObstacle(
            world,
            {
                id:
                    "void_corridor_right",

                type:
                    "dungeonWall",

                x: 1950,
                y: 950,

                w: 220,
                h: 1350,

                blocksLight:
                    true
            }
        );


        addObstacle(
            world,
            {
                id:
                    "void_bottom_wall_left",

                type:
                    "dungeonWall",

                x: 0,
                y: 2200,

                w:
                    corridorLeft,

                h: 100,

                blocksLight:
                    true
            }
        );


        addObstacle(
            world,
            {
                id:
                    "void_bottom_wall_right",

                type:
                    "dungeonWall",

                x:
                    corridorRight,

                y: 2200,

                w:
                    world.width -
                    corridorRight,

                h: 100,

                blocksLight:
                    true
            }
        );


        /*
            Corredor estreito.
        */
        addPath(
            world,
            {
                id:
                    "void_corridor",

                type:
                    "voidCorridor",

                x:
                    corridorLeft,

                y:
                    corridorTop,

                w:
                    corridorRight -
                    corridorLeft,

                h:
                    corridorBottom -
                    corridorTop
            }
        );


        /*
            Trecho inicial escuro.
        */
        world.darknessZones.push({
            id:
                "void_corridor_darkness",

            x: 1360,
            y: 1000,

            w: 780,
            h: 1300,

            requiresLantern:
                true,

            intensity:
                0.96
        });


        /* ========================================================
           SALAS LATERAIS / RUÍNAS
           ======================================================== */

        const ruinWalls = [
            [1030, 1680, 300, 70],
            [2170, 1680, 300, 70],

            [900, 1300, 430, 70],
            [2170, 1300, 430, 70],

            [860, 970, 470, 70],
            [2170, 970, 470, 70],

            [650, 700, 800, 70],
            [2050, 700, 800, 70]
        ];


        ruinWalls.forEach(
            (
                [
                    x,
                    y,
                    w,
                    h
                ],
                index
            ) => {
                addObstacle(
                    world,
                    {
                        id:
                            `void_ruin_wall_${index}`,

                        type:
                            "dungeonWall",

                        x,
                        y,
                        w,
                        h,

                        blocksLight:
                            true
                    }
                );
            }
        );


        /*
            Símbolos e estruturas.
        */
        for (
            let index = 0;
            index < 18;
            index += 1
        ) {
            addDecoration(
                world,
                {
                    type:
                        "voidRune",

                    x:
                        index % 2 === 0
                            ? 1455
                            : 2045,

                    y:
                        1120 +
                        (
                            index % 9
                        ) *
                        115,

                    size:
                        16 +
                        (
                            index %
                            3
                        ) *
                        5
                }
            );
        }


        /* ========================================================
           INIMIGOS DA DUNGEON
           ======================================================== */

        addEnemySpawn(
            world,
            {
                id:
                    "void_corridor_spiders",

                species:
                    "voidSpider",

                count: 4,

                x: 1750,
                y: 1850,

                radius: 230,

                respawn: false
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "void_corrupted_goblins",

                species:
                    "voidGoblin",

                count: 3,

                x: 1750,
                y: 1430,

                radius: 240,

                respawn: false
            }
        );


        addEnemySpawn(
            world,
            {
                id:
                    "void_stalkers",

                species:
                    "voidStalker",

                count: 2,

                x: 1750,
                y: 1080,

                radius: 230,

                respawn: false
            }
        );


        /* ========================================================
           ENTRADA
           ======================================================== */

        addPortal(
            world,
            {
                id:
                    "void_dungeon_exit",

                x: 1750,
                y: 2220,

                destination:
                    "preMonarch",

                destinationSpawn:
                    "fromVoidDungeon",

                /*
                    Permitido enquanto Vaelkor
                    ainda NÃO começou.

                    Quando a arena fechar,
                    esse portal será bloqueado
                    pela lógica da Parte 3.
                */
                dungeonExit:
                    true
            }
        );


        /* ========================================================
           ANTECÂMARA
           ======================================================== */

        addLandmark(
            world,
            {
                id:
                    "voidArenaEntrance",

                type:
                    "arenaEntrance",

                x: 1750,
                y: 850,

                radius: 95
            }
        );


        /*
            Porta da arena.
        */
        addObstacle(
            world,
            {
                id:
                    "void_arena_left_neck",

                type:
                    "dungeonWall",

                x: 950,
                y: 720,

                w: 650,
                h: 120,

                blocksLight:
                    true
            }
        );


        addObstacle(
            world,
            {
                id:
                    "void_arena_right_neck",

                type:
                    "dungeonWall",

                x: 1900,
                y: 720,

                w: 650,
                h: 120,

                blocksLight:
                    true
            }
        );


        /* ========================================================
           ARENA CIRCULAR
           ======================================================== */

        world.arena = {
            id:
                "vaelkorArena",

            type:
                "circularBossArena",

            x: 1750,

            y: 470,

            radius: 520,

            wallThickness: 42,

            entranceX: 1750,

            entranceY: 820,

            entranceWidth: 300,

            activeBoundary: false,

            locked: false,

            naturallyLit:
                true,

            lanternRequired:
                false,

            bossCenter: Object.freeze({
                x: 1750,
                y: 470
            })
        };


        /*
            Parede circular será desenhada
            visualmente na Parte 4.

            As colisões laterais são aproximadas
            aqui por blocos externos.
        */
        const arenaBlocks = [
            [750, 0, 430, 720],
            [2320, 0, 430, 720],

            [1050, 0, 1400, 120],

            [650, 580, 610, 140],
            [2240, 580, 610, 140]
        ];


        arenaBlocks.forEach(
            (
                [
                    x,
                    y,
                    w,
                    h
                ],
                index
            ) => {
                addObstacle(
                    world,
                    {
                        id:
                            `void_arena_outer_${index}`,

                        type:
                            "dungeonWall",

                        x,
                        y,
                        w,
                        h,

                        blocksLight:
                            false
                    }
                );
            }
        );


        /*
            A arena é naturalmente iluminada
            pela própria energia do Vazio.
        */
        world.lights.push({
            id:
                "vaelkor_arena_ambient",

            type:
                "voidAmbient",

            x:
                world.arena.x,

            y:
                world.arena.y,

            radius:
                620,

            intensity:
                0.68,

            color:
                "#725889"
        });


        /*
            Boss só existe se ainda não derrotado.
        */
        if (
            !state.player
                ?.miguelQuest
                ?.vaelkorDefeated
        ) {
            addBossSpawn(
                world,
                {
                    id:
                        "vaelkor_spawn",

                    bossId:
                        "vaelkor",

                    x:
                        world.arena.x,

                    y:
                        world.arena.y,

                    dormant:
                        true,

                    cutsceneRequired:
                        true
                }
            );
        }


        /*
            Fragmento só existe se:
            - Vaelkor morreu
            - fragmento ainda não foi coletado
        */
        if (
            canSpawnVoidFragment()
        ) {
            world.metadata.spawnVoidFragment =
                true;

            world.metadata.voidFragmentPosition = {
                x:
                    world.arena.x,

                y:
                    world.arena.y
            };
        }


        return world;
    }


    /* ============================================================
       REGIÕES FUTURAS PARCIAIS

       Existem apenas como suporte de save/progressão.
       Caminhos 3 e 4 NÃO estão sendo criados agora.
       ============================================================ */

    function buildHellWorld() {
        const dimensions =
            WORLD_DIMENSIONS.hell;

        const world =
            createEmptyWorld(
                "hell",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );

        world.metadata.futureRegion =
            true;

        return world;
    }


    function buildFinalWorld() {
        const dimensions =
            WORLD_DIMENSIONS.final;

        const world =
            createEmptyWorld(
                "final",
                dimensions.width,
                dimensions.height
            );

        addWorldBorders(
            world
        );

        world.metadata.futureRegion =
            true;

        return world;
    }


    /* ============================================================
       CONSTRUTOR CENTRAL DE REGIÃO
       ============================================================ */

    function createWorldForArea(
        area
    ) {
        switch (area) {
            case "village":
                return buildVillageWorld();

            case "forest":
                return buildForestWorld();

            case "grove":
                return buildGroveWorld();

            case "mountains":
                return buildMountainsWorld();

            case "iron":
                return buildIronWorld();

            case "ruby":
                return buildRubyWorld();

            case "preMonarch":
                return buildPreMonarchWorld();

            case "monarchMaze":
                return buildMonarchMazeWorld();

            case "gnomeGardens":
                return buildGnomeGardensWorld();

            case "fairyKingdom":
                return buildFairyKingdomWorld();

            case "celestialFrontier":
                return buildCelestialFrontierWorld();

            case "celestialStair":
                return buildCelestialStairWorld();

            case "sky1":
                return buildSky1World();

            case "sky2":
                return buildSky2World();

            case "sky3":
                return buildSky3World();

            case "voidDungeon":
                return buildVoidDungeonWorld();

            case "hell":
                return buildHellWorld();

            case "final":
                return buildFinalWorld();

            default:
                console.warn(
                    "VEYRA: região desconhecida:",
                    area
                );

                return buildVillageWorld();
        }
    }


    /* ============================================================
       RECONSTRUIR MUNDO
       ============================================================ */

    function rebuildWorld(
        area = state.area
    ) {
        const world =
            createWorldForArea(
                area
            );

        state.area =
            area;

        state.world =
            world;

        return world;
    }


    /* ============================================================
       ENTRAR EM INTERIOR
       ============================================================ */

    function createHouseWorld(
        houseId
    ) {
        const interior =
            buildHouseInterior(
                houseId
            );

        if (!interior) {
            console.warn(
                "VEYRA: interior inexistente:",
                houseId
            );

            return null;
        }

        return interior;
    }


    function getHouseSpawn(
        houseId
    ) {
        const interior =
            HOUSE_INTERIORS[
                houseId
            ];

        if (!interior) {
            return null;
        }

        return {
            ...interior.playerSpawn
        };
    }


    /* ============================================================
       SPAWN DE REGIÃO
       ============================================================ */

    function getRegionSpawn(
        area,
        spawnName = "default"
    ) {
        const region =
            REGION_SPAWNS[
                area
            ];

        if (!region) {
            const dimensions =
                WORLD_DIMENSIONS[
                    area
                ] ||
                WORLD_DIMENSIONS
                    .village;

            return {
                x:
                    dimensions.width /
                    2,

                y:
                    dimensions.height /
                    2,

                facing:
                    "down"
            };
        }

        const selected =
            region[spawnName] ||
            region.default ||
            Object.values(
                region
            )[0];

        return {
            ...selected
        };
    }


    /* ============================================================
       PROXIMIDADE DE PORTAS
       ============================================================ */

    function getNearestDoor(
        player = state.player,
        world = state.world
    ) {
        if (
            !player ||
            !world ||
            !Array.isArray(
                world.doors
            )
        ) {
            return null;
        }

        let nearest = null;
        let nearestDistance = Infinity;

        for (
            const door of
            world.doors
        ) {
            const dist =
                distance(
                    player.x,
                    player.y,
                    door.centerX,
                    door.centerY
                );

            if (
                dist <
                nearestDistance
            ) {
                nearestDistance =
                    dist;

                nearest =
                    door;
            }
        }

        if (!nearest) {
            return null;
        }

        return {
            door:
                nearest,

            distance:
                nearestDistance
        };
    }


    function updateAutomaticDoors(
        dt
    ) {
        const player =
            state.player;

        const world =
            state.world;

        if (
            !player ||
            !world
        ) {
            return;
        }

        for (
            const door of
            world.doors
        ) {
            if (
                door.interiorExit
            ) {
                door.open = true;
                door.openAmount = 1;
                continue;
            }

            const dist =
                distance(
                    player.x,
                    player.y,
                    door.centerX,
                    door.centerY
                );

            const shouldOpen =
                dist <=
                GAME_CONFIG
                    .doorOpenDistance;

            door.open =
                shouldOpen;

            const target =
                shouldOpen
                    ? 1
                    : 0;

            door.openAmount =
                lerp(
                    finiteNumber(
                        door.openAmount,
                        0
                    ),
                    target,
                    clamp(
                        dt *
                        GAME_CONFIG
                            .doorAnimationSpeed,
                        0,
                        1
                    )
                );

            const building =
                findBuilding(
                    door.buildingId,
                    world
                );

            if (building) {
                building.doorOpen =
                    shouldOpen;

                building.doorOpenAmount =
                    door.openAmount;
            }
        }
    }


    /* ============================================================
       PORTA SECRETA DO VAZIO
       ============================================================ */

    function isPlayerNearSecretDoor() {
        const player =
            state.player;

        const door =
            state.world
                ?.secretDoor;

        if (
            !player ||
            !door
        ) {
            return false;
        }

        const centerX =
            door.x +
            door.w / 2;

        const centerY =
            door.y +
            door.h / 2;

        return (
            distance(
                player.x,
                player.y,
                centerX,
                centerY
            ) <=
            110
        );
    }


    function canOpenSecretVoidDoor() {
        const player =
            state.player;

        const door =
            state.world
                ?.secretDoor;

        if (
            !player ||
            !door
        ) {
            return false;
        }

        if (
            player.miguelQuest
                .secretDoorOpened
        ) {
            return false;
        }

        return (
            getRealItemCount(
                "chaveObscura"
            ) >= 1
        );
    }


    function markSecretDoorDiscovered() {
        const player =
            state.player;

        if (!player) {
            return false;
        }

        const quest =
            player.miguelQuest;

        if (
            !quest.secretDoorFound
        ) {
            quest.secretDoorFound =
                true;

            markMapLocationDiscovered(
                "voidSecretDoor"
            );
        }

        return true;
    }


    function openSecretVoidDoor() {
        const player =
            state.player;

        const world =
            state.world;

        const door =
            world?.secretDoor;

        if (
            !player ||
            !door
        ) {
            return false;
        }

        markSecretDoorDiscovered();

        if (
            player.miguelQuest
                .secretDoorOpened
        ) {
            door.open = true;
            return true;
        }

        if (
            !canOpenSecretVoidDoor()
        ) {
            return false;
        }

        const removed =
            removeItem(
                "chaveObscura",
                1
            );

        if (!removed) {
            return false;
        }

        player.miguelQuest
            .keyConsumed =
            true;

        player.miguelQuest
            .secretDoorOpened =
            true;

        player.miguelQuest
            .secretDoorFound =
            true;

        door.open = true;

        /*
            Remove a colisão física da porta.
        */
        world.obstacles =
            world.obstacles.filter(
                obstacle =>
                    obstacle.id !==
                    "void_secret_door_block"
            );

        setMiguelQuestStage(
            MIGUEL_QUEST_STAGE
                .SECRET_DOOR_OPENED
        );

        return true;
    }


    /* ============================================================
       CHAVE OBSCURA
       ============================================================ */

    function isDarkKeyVisible(
        world = state.world
    ) {
        if (
            !world ||
            !world.darkKey ||
            !state.player
        ) {
            return false;
        }

        return Boolean(
            state.player
                .miguelQuest
                .missionAccepted &&
            !state.player
                .miguelQuest
                .keyCollected &&
            !state.player
                .miguelQuest
                .keyConsumed
        );
    }


    function getDarkKeyDistance() {
        const player =
            state.player;

        const key =
            state.world
                ?.darkKey;

        if (
            !player ||
            !key
        ) {
            return Infinity;
        }

        return distance(
            player.x,
            player.y,
            key.x,
            key.y
        );
    }


    function discoverDarkKeyLocation() {
        const player =
            state.player;

        const key =
            state.world
                ?.darkKey;

        if (
            !player ||
            !key ||
            !isDarkKeyVisible()
        ) {
            return false;
        }

        if (
            getDarkKeyDistance() >
            135
        ) {
            return false;
        }

        const quest =
            player.miguelQuest;

        if (
            !quest.keyLocationDiscovered
        ) {
            quest.keyLocationDiscovered =
                true;

            if (
                !hasEnoughShadowEssence()
            ) {
                setMiguelQuestStage(
                    MIGUEL_QUEST_STAGE
                        .KEY_FOUND_NEEDS_ESSENCE
                );
            }
        }

        return true;
    }


    /* ============================================================
       MINIMAPA / MAPA
       ============================================================ */

    function getWorldMapMarkers(
        world = state.world,
        player = state.player
    ) {
        if (
            !world ||
            !player
        ) {
            return [];
        }

        if (
            world.id ===
                "voidDungeon"
        ) {
            return [];
        }

        const markers = [];


        for (
            const building of
            world.buildings
        ) {
            markers.push({
                id:
                    `map_${building.id}`,

                type:
                    "building",

                name:
                    building.name,

                x:
                    building.x +
                    building.w / 2,

                y:
                    building.y +
                    building.h / 2
            });
        }


        for (
            const landmark of
            world.landmarks
        ) {
            if (
                landmark.mapVisible ===
                false
            ) {
                continue;
            }

            markers.push({
                id:
                    `map_${landmark.id}`,

                type:
                    landmark.type,

                name:
                    landmark.name ||
                    landmark.id,

                x:
                    landmark.x,

                y:
                    landmark.y
            });
        }


        for (
            const gate of
            world.gates
        ) {
            markers.push({
                id:
                    `map_${gate.id}`,

                type:
                    "gate",

                name:
                    gate.id,

                x:
                    gate.x +
                    gate.w / 2,

                y:
                    gate.y +
                    gate.h / 2
            });
        }


        /*
            A porta secreta só aparece
            depois de ser descoberta.
        */
        if (
            world.secretDoor &&
            player.miguelQuest
                .secretDoorFound
        ) {
            markers.push({
                id:
                    "map_void_door",

                type:
                    "secret",

                name:
                    "PASSAGEM DO VAZIO",

                x:
                    world.secretDoor.x +
                    world.secretDoor.w / 2,

                y:
                    world.secretDoor.y +
                    world.secretDoor.h / 2
            });
        }


        return markers;
    }


    function isMinimapSignalAvailable() {
        if (
            state.area ===
            "voidDungeon"
        ) {
            return false;
        }

        return true;
    }


    /* ============================================================
       LANTERNA
       ============================================================ */

    function playerHasLantern(
        player = state.player
    ) {
        return Boolean(
            player &&
            (
                player.lanternOwned ||
                player.inventory
                    ?.lanterna > 0
            )
        );
    }


    function isPointInsideDarknessZone(
        x,
        y,
        world = state.world
    ) {
        if (!world) {
            return null;
        }

        for (
            const zone of
            world.darknessZones
        ) {
            if (
                pointInRect(
                    x,
                    y,
                    zone
                )
            ) {
                return zone;
            }
        }

        return null;
    }


    function getPlayerVisionRadius() {
        const player =
            state.player;

        if (!player) {
            return VISUAL_CONFIG
                .lantern
                .noLanternRadius;
        }

        const zone =
            isPointInsideDarknessZone(
                player.x,
                player.y
            );

        /*
            Arena de Vaelkor possui
            iluminação própria.
        */
        if (
            state.area ===
                "voidDungeon" &&
            state.world?.arena &&
            distance(
                player.x,
                player.y,
                state.world.arena.x,
                state.world.arena.y
            ) <
                state.world
                    .arena
                    .radius -
                30
        ) {
            return 9999;
        }

        if (!zone) {
            return 9999;
        }

        return playerHasLantern()
            ? VISUAL_CONFIG
                .lantern
                .radius
            : VISUAL_CONFIG
                .lantern
                .noLanternRadius;
    }


    /* ============================================================
       PROGRESSÃO DA DUNGEON
       ============================================================ */

    function markVoidDungeonDiscovered() {
        const player =
            state.player;

        if (!player) {
            return;
        }

        if (
            !player
                .miguelQuest
                .dungeonDiscovered
        ) {
            player
                .miguelQuest
                .dungeonDiscovered =
                true;

            unlockArea(
                "voidDungeon"
            );

            discoverArea(
                "voidDungeon"
            );

            if (
                player
                    .miguelQuest
                    .stage ===
                MIGUEL_QUEST_STAGE
                    .SECRET_DOOR_OPENED
            ) {
                setMiguelQuestStage(
                    MIGUEL_QUEST_STAGE
                        .DUNGEON_DISCOVERED
                );
            }
        }
    }


    function revealVoidDungeonOnMapAfterVictory() {
        const player =
            state.player;

        if (!player) {
            return;
        }

        if (
            player
                .miguelQuest
                .vaelkorDefeated
        ) {
            markMapLocationDiscovered(
                "voidDungeon"
            );

            player
                .miguelQuest
                .dungeonExitedAfterVictory =
                true;
        }
    }


    /* ============================================================
       ARENA DE VAELKOR
       ============================================================ */

    function isPlayerInsideVaelkorArena() {
        const player =
            state.player;

        const arena =
            state.world?.arena;

        if (
            !player ||
            !arena
        ) {
            return false;
        }

        return (
            distance(
                player.x,
                player.y,
                arena.x,
                arena.y
            ) <
            arena.radius - 65
        );
    }


    function lockVaelkorArena() {
        const world =
            state.world;

        const arena =
            world?.arena;

        if (
            !arena ||
            state.area !==
                "voidDungeon"
        ) {
            return false;
        }

        arena.locked = true;

        arena.activeBoundary = true;

        state.voidRuntime
            .arenaLocked =
            true;

        /*
            Bloqueia fisicamente o pescoço
            da arena depois que a cutscene começa.
        */
        if (
            !world.obstacles.some(
                obstacle =>
                    obstacle.id ===
                    "vaelkor_arena_gate"
            )
        ) {
            addObstacle(
                world,
                {
                    id:
                        "vaelkor_arena_gate",

                    type:
                        "bossGate",

                    x: 1600,
                    y: 760,

                    w: 300,
                    h: 90,

                    blocksLight:
                        false
                }
            );
        }

        return true;
    }


    function unlockVaelkorArena() {
        const world =
            state.world;

        const arena =
            world?.arena;

        if (!arena) {
            return false;
        }

        arena.locked = false;

        arena.activeBoundary = false;

        state.voidRuntime
            .arenaLocked =
            false;

        world.obstacles =
            world.obstacles.filter(
                obstacle =>
                    obstacle.id !==
                    "vaelkor_arena_gate"
            );

        return true;
    }


    function resetVoidAttemptRuntime() {
        state.voidRuntime = {
            inside:
                state.area ===
                "voidDungeon",

            arenaEntered:
                false,

            arenaLocked:
                false,

            vaelkorIntroPlayedThisAttempt:
                false,

            vaelkorFightStarted:
                false,

            fragmentEntityCreated:
                false,

            respawnAttempt:
                state.voidRuntime
                    ?.respawnAttempt ||
                0
        };
    }


    /* ============================================================
       WORLD ENTRY
       ============================================================ */

    function prepareAreaWorld(
        area,
        spawnName
    ) {
        const world =
            rebuildWorld(
                area
            );

        if (!state.player) {
            return world;
        }

        const spawn =
            getRegionSpawn(
                area,
                spawnName
            );

        const safe =
            findSafePosition(
                spawn.x,
                spawn.y,
                state.player.radius,
                world
            );

        state.player.x =
            safe.x;

        state.player.y =
            safe.y;

        state.player.facing =
            spawn.facing ||
            "down";

        state.houseMode =
            false;

        state.currentHouse =
            null;

        discoverArea(
            area
        );

        if (
            area ===
            "voidDungeon"
        ) {
            markVoidDungeonDiscovered();

            resetVoidAttemptRuntime();

            state.voidRuntime.inside =
                true;
        } else {
            state.voidRuntime.inside =
                false;
        }

        return world;
    }


    /* ============================================================
       PROTECTED ZONE CHECK
       ============================================================ */

    function isPointProtected(
        world,
        x,
        y,
        padding = 0
    ) {
        if (!world) {
            return false;
        }

        return world
            .protectedZones
            .some(
                zone =>
                    pointInRect(
                        x,
                        y,
                        {
                            x:
                                zone.x -
                                padding,

                            y:
                                zone.y -
                                padding,

                            w:
                                zone.w +
                                padding * 2,

                            h:
                                zone.h +
                                padding * 2
                        }
                    )
            );
    }


    /* ============================================================
       SPAWN DE INIMIGO — BASE

       IA e combate entram na Parte 3.
       ============================================================ */

    function createEnemyFromSpecies(
        speciesId,
        x,
        y,
        options = {}
    ) {
        const species =
            ENEMY_SPECIES[
                speciesId
            ];

        if (!species) {
            console.warn(
                "VEYRA: espécie inexistente:",
                speciesId
            );

            return null;
        }

        return {
            id:
                options.id ||
                uid(speciesId),

            speciesId,

            name:
                species.name,

            x,
            y,

            homeX: x,
            homeY: y,

            radius:
                species.radius,

            hp:
                species.hp,

            maxHp:
                species.hp,

            damage:
                species.damage,

            defense:
                species.defense,

            speed:
                species.speed,

            vision:
                species.vision,

            attackRange:
                species.attackRange,

            xp:
                species.xp,

            money:
                species.money,

            color:
                species.color,

            aura:
                species.aura ||
                null,

            spriteType:
                species.spriteType,

            ability:
                species.ability
                    ? {
                        ...species.ability
                    }
                    : null,

            abilityCooldown: 0,

            attackCooldown: 0,

            state:
                "idle",

            stateTimer: 0,

            targetX: x,
            targetY: y,

            facing:
                "down",

            aggro: false,

            dead: false,

            hurtTimer: 0,

            charge: null,

            summonOwner: null,

            dropTable:
                options.dropTable ||
                null,

            spawnId:
                options.spawnId ||
                null,

            persistentKillId:
                options.persistentKillId ||
                null,

            ...options
        };
    }


    function findSpawnPointNear(
        world,
        centerX,
        centerY,
        radius,
        entityRadius,
        randomGenerator
    ) {
        for (
            let attempt = 0;
            attempt < 50;
            attempt += 1
        ) {
            const angle =
                randomGenerator() *
                Math.PI *
                2;

            const distanceFromCenter =
                randomGenerator() *
                radius;

            const x =
                centerX +
                Math.cos(angle) *
                distanceFromCenter;

            const y =
                centerY +
                Math.sin(angle) *
                distanceFromCenter;

            if (
                !isCircleBlocked(
                    x,
                    y,
                    entityRadius,
                    world
                )
            ) {
                return {
                    x,
                    y
                };
            }
        }

        return findSafePosition(
            centerX,
            centerY,
            entityRadius,
            world
        );
    }


    function populateWorldEnemies(
        world = state.world
    ) {
        if (!world) {
            return;
        }

        world.enemies = [];

        const rng =
            createRegionRandom(
                `${world.id}_enemies`
            );

        for (
            const spawn of
            world.enemySpawns
        ) {
            for (
                let index = 0;
                index <
                    spawn.count;
                index += 1
            ) {
                const persistentKillId =
                    spawn.respawn === false
                        ? `${spawn.id}_${index}`
                        : null;

                if (
                    persistentKillId &&
                    state.player
                        ?.miguelQuest
                        ?.clearedDungeonEnemyIds
                        ?.includes(
                            persistentKillId
                        )
                ) {
                    continue;
                }

                const species =
                    ENEMY_SPECIES[
                        spawn.species
                    ];

                if (!species) {
                    continue;
                }

                const position =
                    findSpawnPointNear(
                        world,
                        spawn.x,
                        spawn.y,
                        spawn.radius ||
                            250,
                        species.radius,
                        rng
                    );

                const enemy =
                    createEnemyFromSpecies(
                        spawn.species,
                        position.x,
                        position.y,
                        {
                            spawnId:
                                spawn.id,

                            persistentKillId,

                            dropTable:
                                spawn.dropTable ||
                                null
                        }
                    );

                if (enemy) {
                    world.enemies.push(
                        enemy
                    );
                }
            }
        }
    }


    /* ============================================================
       SPAWN DE BOSS — BASE
       ============================================================ */

    function createBossEntity(
        bossId,
        x,
        y,
        options = {}
    ) {
        const definition =
            BOSS_REGISTRY[
                bossId
            ];

        if (!definition) {
            return null;
        }

        const defaultHp =
            definition.hp ||
            (
                420 +
                (
                    REGION_META[
                        state.area
                    ]?.order ||
                    1
                ) *
                190
            );

        const defaultDamage =
            definition.damage ||
            (
                24 +
                (
                    REGION_META[
                        state.area
                    ]?.order ||
                    1
                ) *
                4
            );

        return {
            id:
                bossId,

            entityId:
                uid(
                    `boss_${bossId}`
                ),

            name:
                definition.name,

            subtitle:
                definition.subtitle,

            x,
            y,

            homeX: x,
            homeY: y,

            radius:
                definition.radius ||
                46,

            hp:
                defaultHp,

            maxHp:
                defaultHp,

            damage:
                defaultDamage,

            defense:
                definition.defense ||
                15,

            speed:
                definition.moveSpeed ??
                72,

            color:
                definition.color,

            aura:
                definition.aura,

            coreColor:
                definition.coreColor ||
                definition.aura,

            bodyStyle:
                definition.bodyStyle,

            topBar:
                definition.topBar,

            requiresDash:
                Boolean(
                    definition
                        .requiresDash
                ),

            usesDash:
                Boolean(
                    definition.usesDash
                ),

            state:
                options.dormant
                    ? "dormant"
                    : "idle",

            stateTimer: 0,

            attackCooldown:
                random(
                    1.5,
                    2.5
                ),

            hurtTimer: 0,

            dead: false,

            phase: 1,

            phaseTransition:
                false,

            cutsceneRequired:
                Boolean(
                    options
                        .cutsceneRequired
                ),

            arenaRadius:
                options.arenaRadius ||
                350,

            ...options
        };
    }


    function populateWorldBosses(
        world = state.world
    ) {
        if (!world) {
            return;
        }

        world.bosses = [];

        for (
            const spawn of
            world.bossSpawns
        ) {
            if (
                hasDefeatedBoss(
                    spawn.bossId
                )
            ) {
                continue;
            }

            /*
                Vaelkor possui flag própria.
            */
            if (
                spawn.bossId ===
                    "vaelkor" &&
                state.player
                    ?.miguelQuest
                    ?.vaelkorDefeated
            ) {
                continue;
            }

            const boss =
                createBossEntity(
                    spawn.bossId,
                    spawn.x,
                    spawn.y,
                    spawn
                );

            if (boss) {
                world.bosses.push(
                    boss
                );
            }
        }
    }


    /* ============================================================
       FINALIZAÇÃO DE BUILD DO MUNDO
       ============================================================ */

    function finalizeWorldBuild(
        world = state.world
    ) {
        if (!world) {
            return null;
        }

        populateWorldEnemies(
            world
        );

        populateWorldBosses(
            world
        );

        return world;
    }


    function loadWorld(
        area,
        spawnName
    ) {
        prepareAreaWorld(
            area,
            spawnName
        );

        finalizeWorldBuild(
            state.world
        );

        return state.world;
    }


    /* ============================================================
       SPAWN INICIAL NOVO JOGO

       Começa dentro da casa do jogador.
       ============================================================ */

    function prepareNewGameWorld() {
        if (!state.player) {
            return false;
        }

        const interior =
            createHouseWorld(
                "home"
            );

        if (!interior) {
            return false;
        }

        state.houseMode =
            true;

        state.currentHouse =
            "home";

        state.houseReturn = {
            area:
                "village",

            buildingId:
                "home"
        };

        state.area =
            "village";

        state.world =
            interior;

        const spawn =
            HOUSE_INTERIORS
                .home
                .playerSpawn;

        state.player.x =
            spawn.x;

        state.player.y =
            spawn.y;

        state.player.facing =
            spawn.facing;

        return true;
    }


    /* ============================================================
       RESET DE DUNGEON APÓS MORTE

       Vaelkor volta a 100%.
       ============================================================ */

    function resetVoidDungeonAfterDeath() {
        const player =
            state.player;

        if (!player) {
            return;
        }

        state.voidRuntime
            .respawnAttempt +=
            1;

        state.voidRuntime
            .arenaEntered =
            false;

        state.voidRuntime
            .arenaLocked =
            false;

        state.voidRuntime
            .vaelkorIntroPlayedThisAttempt =
            false;

        state.voidRuntime
            .vaelkorFightStarted =
            false;

        /*
            Não marca Vaelkor como morto.

            Ao voltar para a dungeon,
            ele será criado novamente com
            100% de vida.
        */

        if (
            !player
                .miguelQuest
                .vaelkorDefeated &&
            player
                .miguelQuest
                .missionAccepted
        ) {
            if (
                player
                    .miguelQuest
                    .dungeonDiscovered
            ) {
                player
                    .miguelQuest
                    .stage =
                    MIGUEL_QUEST_STAGE
                        .DUNGEON_DISCOVERED;

                player
                    .miguelQuest
                    .trackerObjective =
                    "Explore a Dungeon do Vazio.";
            }
        }
    }


    /* ============================================================
       MAPA GLOBAL — DESCOBERTAS
       ============================================================ */

    function getGlobalMapLocations(
        player = state.player
    ) {
        if (!player) {
            return [];
        }

        const result = [
            {
                id: "village",
                name:
                    "VILA DO CREPÚSCULO",
                discovered: true
            }
        ];


        for (
            const area of
            player.exploredAreas
        ) {
            if (
                area === "village"
            ) {
                continue;
            }

            const meta =
                REGION_META[area];

            if (!meta) {
                continue;
            }

            result.push({
                id:
                    meta.id,

                name:
                    meta.name,

                route:
                    meta.route,

                discovered:
                    true
            });
        }


        if (
            player
                .miguelQuest
                .keyCollected ||
            player
                .miguelQuest
                .keyConsumed
        ) {
            result.push({
                id:
                    "dark_key_location",

                name:
                    "LOCAL DA CHAVE OBSCURA",

                discovered:
                    true,

                secret:
                    true
            });
        }


        if (
            player
                .discoveredMapLocations
                .includes(
                    "voidDungeon"
                )
        ) {
            result.push({
                id:
                    "voidDungeon",

                name:
                    "DUNGEON DO VAZIO",

                discovered:
                    true,

                secret:
                    true
            });
        }


        return result;
    }


    /* ============================================================
       VALIDAÇÃO DA PARTE 2
       ============================================================ */

    function validatePart2Data() {
        const errors = [];


        const requiredAreas = [
            "village",
            "forest",
            "grove",
            "mountains",
            "iron",
            "ruby",
            "preMonarch",
            "monarchMaze",
            "gnomeGardens",
            "fairyKingdom",
            "celestialFrontier",
            "celestialStair",
            "sky1",
            "sky2",
            "sky3",
            "voidDungeon"
        ];


        for (
            const area of
            requiredAreas
        ) {
            if (
                !WORLD_DIMENSIONS[
                    area
                ]
            ) {
                errors.push(
                    `Dimensão ausente para ${area}.`
                );
            }
        }


        const village =
            buildVillageWorld();


        const requiredBuildings = [
            "home",
            "elianHome",
            "shop",
            "forge",
            "woodshop"
        ];


        for (
            const buildingId of
            requiredBuildings
        ) {
            const building =
                village
                    .buildings
                    .find(
                        item =>
                            item.id ===
                            buildingId
                    );

            if (!building) {
                errors.push(
                    `Construção ausente: ${buildingId}.`
                );

                continue;
            }

            const door =
                village
                    .doors
                    .find(
                        item =>
                            item.buildingId ===
                            buildingId
                    );

            if (!door) {
                errors.push(
                    `Porta ausente para ${buildingId}.`
                );

                continue;
            }

            const geometry =
                getBuildingDoorGeometry(
                    building
                );

            if (
                Math.abs(
                    geometry.centerX -
                    door.centerX
                ) > 0.01 ||
                Math.abs(
                    geometry.centerY -
                    door.centerY
                ) > 0.01
            ) {
                errors.push(
                    `Porta desalinhada em ${buildingId}.`
                );
            }
        }


        const homeRespawn =
            calculateHomeRespawn(
                village
            );


        const home =
            village
                .buildings
                .find(
                    building =>
                        building.id ===
                        "home"
                );


        const homeDoor =
            getBuildingDoorGeometry(
                home
            );


        if (
            homeRespawn.y <=
            homeDoor.centerY
        ) {
            errors.push(
                "Respawn da casa não está em frente à porta."
            );
        }


        const preMonarch =
            buildPreMonarchWorld();


        if (
            !preMonarch.secretDoor
        ) {
            errors.push(
                "Porta secreta do Vazio ausente."
            );
        } else if (
            ![
                "top",
                "bottom"
            ].includes(
                preMonarch
                    .secretDoor
                    .side
            )
        ) {
            errors.push(
                "A porta secreta só pode ficar na parte de cima ou de baixo."
            );
        }


        const frontier =
            buildCelestialFrontierWorld();


        if (
            !state.player
                ?.miguelQuest
                ?.keyCollected &&
            !state.player
                ?.miguelQuest
                ?.keyConsumed &&
            !frontier.darkKey
        ) {
            errors.push(
                "Chave Obscura deveria existir na Fronteira Celestial."
            );
        }


        const voidWorld =
            buildVoidDungeonWorld();


        if (
            voidWorld
                .metadata
                .minimap !==
            "NO_SIGNAL"
        ) {
            errors.push(
                "Dungeon do Vazio deve ficar sem sinal no minimapa."
            );
        }


        if (
            !voidWorld.arena
        ) {
            errors.push(
                "Arena de Vaelkor ausente."
            );
        }


        const vaelkorSpawn =
            voidWorld
                .bossSpawns
                .find(
                    spawn =>
                        spawn.bossId ===
                        "vaelkor"
                );


        if (
            !state.player
                ?.miguelQuest
                ?.vaelkorDefeated &&
            !vaelkorSpawn
        ) {
            errors.push(
                "Spawn de Vaelkor ausente."
            );
        }


        const routeSequence =
            ROUTE_TWO.sequence;


        const expectedRoute = [
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
                routeSequence
            ) !==
            JSON.stringify(
                expectedRoute
            )
        ) {
            errors.push(
                "Caminho 2 perdeu sua ordem aprovada."
            );
        }


        /*
            Confirma as 5 hordas.
        */
        const sky1 =
            buildSky1World();

        const sky2 =
            buildSky2World();

        const sky3 =
            buildSky3World();


        const waveCount =
            (
                sky1.metadata
                    .skyTrialWaves
                    ?.length ||
                0
            ) +
            (
                sky2.metadata
                    .skyTrialWaves
                    ?.length ||
                0
            ) +
            (
                sky3.metadata
                    .skyTrialWaves
                    ?.length ||
                0
            );


        if (
            waveCount !== 5
        ) {
            errors.push(
                "O Céu deve possuir exatamente 5 hordas."
            );
        }


        if (
            errors.length > 0
        ) {
            console.error(
                "VEYRA V30 — ERROS NA PARTE 2:",
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
       FIM DA PARTE 2/5

       NÃO FECHE O IIFE.

       PARTE 3 TERÁ:

       - movimentação completa
       - colisão
       - ataque básico
       - 1 clique = 1 ataque
       - Q / R / F
       - Dash V1
       - Dash V2
       - timing de atravessar projétil no V2
       - inimigos
       - lobo
       - javali
       - habilidades específicas
       - IA independente de WASD
       - bosses
       - Guardião da Estrada
       - bosses do Caminho 1
       - bosses do Caminho 2
       - Vaelkor completo
       - Rajada do Vazio
       - Feixe do Vazio
       - Invocação Sombria
       - Fase II
       - morte cinematográfica
       - fragmentação
       - minigame do Fragmento
       - dano
       - sangue
       - morte do jogador
       - perda parcial de materiais
       - respawn na frente da casa
       - fome/cansaço
       - drops
       - 15 Essências Sombrias
       - coleta segurando E
       - árvore
       - minério
       - Chave Obscura
       ============================================================ */
