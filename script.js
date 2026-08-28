(() => {
    "use strict";

    /* =========================================================
       VEYRA: A QUIETUDE — V20 — PARTE 1/5
       Base, dados, personagens, itens, armaduras, NPCs e estado.
       NÃO feche o IIFE aqui. A Parte 2 continua abaixo.
       ========================================================= */

    const GAME_VERSION = 20;
    const SAVE_KEY = "veyra_save_v20_five_parts";
    const LEGACY_SAVE_KEYS = [
        "veyra_save_v20_upgrade",
        "veyra_save_v19_rebuild",
        "veyra_save_v19",
        "veyra_save_v18_rebuild",
        "veyra_save_v14_stable"
    ];

    const MAX_LEVEL = 50;
    const POINTS_PER_LEVEL = 3;
    const STAT_CAP = 30;
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


    /* =========================================================
       CONFIGURAÇÕES
       ========================================================= */

    const GAME_CONFIG = Object.freeze({
        worldMargin: 55,
        autosaveSeconds: 30,

        interactDistance: 82,
        pickupDistance: 72,

        resourceHoldSeconds: 1.1,
        treeHoldSeconds: 1.35,

        /*
            Continua:
            1 clique = 1 ataque.

            Segurar mouse NÃO ficará atacando sozinho.
        */
        baseAttackCooldown: 0.24,

        maxBloodMarks: 18
    });


    const VISUAL_CONFIG = Object.freeze({
        playerRadius: 18,
        normalEnemyRadius: 20,
        bossRadius: 42,

        /*
            A colisão física real das árvores
            será implementada na Parte 2.
        */
        tree: {
            trunkRadius: 17,
            canopyCollisionRadius: 35,
            canopyCollisionOffsetY: -12,
            generationRadius: 49,
            pathClearance: 28
        },

        /*
            Portões fechados terão corpo +
            proteção contra passar pelos cantos.
        */
        gate: {
            pillarSize: 42,
            approachClearance: 82
        },

        /*
            Interior menor e centralizado.
            O tamanho individual dos cômodos
            será definido na Parte 2.
        */
        house: {
            outerPadding: 86,
            shadowOpacity: 0.88
        },

        bossBar: {
            maxWidth: 470,
            minWidth: 270,
            height: 17,
            topDesktop: 94,
            topCompact: 112
        },

        lantern: {
            radius: 150,
            noLanternRadius: 34
        },

        blood: {
            flashMax: 0.64,
            markLife: 3.8
        }
    });


    /* =========================================================
       DOM / CANVAS
       Mantém os IDs do HTML atual.
       ========================================================= */

    const $ = id =>
        document.getElementById(id);


    function must(id) {

        const element = $(id);

        if (!element) {

            throw new Error(
                `VEYRA V20: elemento #${id} não encontrado.`
            );

        }

        return element;
    }


    const screens = {

        menu:
            must("menuScreen"),

        how:
            must("howScreen"),

        credits:
            must("creditsScreen"),

        character:
            must("characterScreen"),

        game:
            must("gameScreen")

    };


    const canvas =
        must("gameCanvas");


    const ctx =
        canvas.getContext("2d");


    const miniCanvas =
        must("miniCanvas");


    const miniCtx =
        miniCanvas.getContext("2d");


    const mapCanvas =
        must("worldMapCanvas");


    const mapCtx =
        mapCanvas.getContext("2d");


    if (
        !ctx ||
        !miniCtx ||
        !mapCtx
    ) {

        throw new Error(
            "VEYRA V20: Canvas 2D indisponível."
        );

    }


    /* =========================================================
       HELPERS
       ========================================================= */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }


    function lerp(
        a,
        b,
        t
    ) {

        return (
            a +
            (
                b -
                a
            ) *
            t
        );

    }


    function random(
        min,
        max
    ) {

        return (
            Math.random() *
            (
                max -
                min
            ) +
            min
        );

    }


    function randomInt(
        min,
        max
    ) {

        return Math.floor(
            random(
                min,
                max + 1
            )
        );

    }


    function finiteNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(value);


        return Number.isFinite(number)
            ? number
            : fallback;

    }


    function distance(
        ax,
        ay,
        bx,
        by
    ) {

        return Math.hypot(
            bx - ax,
            by - ay
        );

    }


    function normalize(
        x,
        y
    ) {

        const length =
            Math.hypot(
                x,
                y
            );


        if (
            length <
            0.00001
        ) {

            return {
                x: 0,
                y: 0,
                length: 0
            };

        }


        return {

            x:
                x /
                length,

            y:
                y /
                length,

            length

        };

    }


    function uid(
        prefix = "id"
    ) {

        return (
            `${prefix}_` +
            `${Date.now().toString(36)}_` +
            `${Math.random().toString(36).slice(2, 9)}`
        );

    }


    function deepClone(
        value
    ) {

        if (
            typeof structuredClone ===
            "function"
        ) {

            return structuredClone(
                value
            );

        }


        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    }


    /* =========================================================
       RANDOM ESTÁVEL
       ========================================================= */

    function hashString(
        text
    ) {

        let hash =
            2166136261;


        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            hash ^=
                text.charCodeAt(i);


            hash =
                Math.imul(
                    hash,
                    16777619
                );

        }


        return hash >>> 0;

    }


    function mulberry32(
        seed
    ) {

        let value =
            seed >>> 0;


        return function () {

            value +=
                0x6D2B79F5;


            let t =
                value;


            t =
                Math.imul(
                    t ^
                    (
                        t >>>
                        15
                    ),
                    t |
                    1
                );


            t ^=
                t +
                Math.imul(
                    t ^
                    (
                        t >>>
                        7
                    ),
                    t |
                    61
                );


            return (

                (
                    t ^
                    (
                        t >>>
                        14
                    )
                ) >>>
                0

            ) /
            4294967296;

        };

    }


    function rngRange(
        rng,
        min,
        max
    ) {

        return (
            min +
            rng() *
            (
                max -
                min
            )
        );

    }


    function rngInt(
        rng,
        min,
        max
    ) {

        return Math.floor(
            rngRange(
                rng,
                min,
                max + 1
            )
        );

    }


    /* =========================================================
       COLISÃO / GEOMETRIA
       ========================================================= */

    function circleCircleCollision(
        ax,
        ay,
        ar,
        bx,
        by,
        br
    ) {

        return (

            distance(
                ax,
                ay,
                bx,
                by
            ) <

            ar +
            br

        );

    }


    function circleRectCollision(
        cx,
        cy,
        radius,
        rect
    ) {

        const nearestX =
            clamp(
                cx,
                rect.x,
                rect.x +
                rect.w
            );


        const nearestY =
            clamp(
                cy,
                rect.y,
                rect.y +
                rect.h
            );


        const dx =
            cx -
            nearestX;


        const dy =
            cy -
            nearestY;


        return (

            dx *
            dx +

            dy *
            dy <

            radius *
            radius

        );

    }


    function rectsOverlap(
        a,
        b
    ) {

        return !(

            a.x +
            a.w <=
            b.x ||

            a.x >=
            b.x +
            b.w ||

            a.y +
            a.h <=
            b.y ||

            a.y >=
            b.y +
            b.h

        );

    }


    function distancePointToSegment(
        px,
        py,
        ax,
        ay,
        bx,
        by
    ) {

        const abx =
            bx -
            ax;


        const aby =
            by -
            ay;


        const apx =
            px -
            ax;


        const apy =
            py -
            ay;


        const lengthSquared =

            abx *
            abx +

            aby *
            aby;


        if (
            lengthSquared <=
            0.0001
        ) {

            return distance(
                px,
                py,
                ax,
                ay
            );

        }


        const t =
            clamp(

                (
                    apx *
                    abx +

                    apy *
                    aby
                ) /
                lengthSquared,

                0,
                1

            );


        return distance(

            px,
            py,

            ax +
            abx *
            t,

            ay +
            aby *
            t

        );

    }


    /* =========================================================
       PERSONAGENS

       selectionStats:
       escala visual 0–100 para a seleção.

       hp/magic/etc:
       valor REAL utilizado no jogo.
       ========================================================= */

    const CHARACTERS =
        Object.freeze([

            /* =================================================
               KAELION
               ================================================= */

            {

                id:
                    "kaelion",

                name:
                    "Kaelion",

                className:
                    "Mago",

                icon:
                    "🔥",

                color:
                    "#e58d44",

                description:
                    "Um conjurador que transforma lembranças em energia arcana.",

                summary:
                    "Alto poder mágico e ótimo alcance.",


                hp:
                    92,

                magic:
                    145,

                energy:
                    95,

                damage:
                    26,

                defense:
                    8,

                speed:
                    150,


                selectionStats: {

                    hp:
                        58,

                    magic:
                        100,

                    energy:
                        68,

                    damage:
                        84,

                    defense:
                        40,

                    speed:
                        72

                },


                sprite: {

                    body:
                        "#c66f31",

                    trim:
                        "#efb46f",

                    skin:
                        "#c98f72",

                    hair:
                        "#432c24",

                    accent:
                        "#ffa654",

                    weapon:
                        "staff",

                    scale:
                        1

                },


                /*
                    V20:
                    ataque básico próprio.

                    Será implementado de verdade
                    na Parte 3.
                */
                basicAttack: {

                    id:
                        "kaelionOrb",

                    type:
                        "projectile",

                    name:
                        "Centelha de Memória",

                    damageMultiplier:
                        0.92,

                    range:
                        285,

                    speed:
                        420,

                    radius:
                        8,

                    color:
                        "#f1a04e",

                    trailColor:
                        "#ffd08a",

                    particleShape:
                        "spark",

                    impactStyle:
                        "arcaneBurst"

                }

            },


            /* =================================================
               THERON
               ================================================= */

            {

                id:
                    "theron",

                name:
                    "Theron",

                className:
                    "Cavaleiro",

                icon:
                    "⚔️",

                color:
                    "#aab2ba",

                description:
                    "Um guerreiro disciplinado que luta com defesa e precisão.",

                summary:
                    "Muita resistência e combate corpo a corpo.",


                hp:
                    128,

                magic:
                    72,

                energy:
                    112,

                damage:
                    25,

                defense:
                    19,

                speed:
                    142,


                selectionStats: {

                    hp:
                        88,

                    magic:
                        40,

                    energy:
                        75,

                    damage:
                        79,

                    defense:
                        100,

                    speed:
                        63

                },


                sprite: {

                    body:
                        "#626a72",

                    trim:
                        "#bbc2c7",

                    skin:
                        "#c59070",

                    hair:
                        "#302a28",

                    accent:
                        "#d9e0e4",

                    weapon:
                        "sword",

                    cape:
                        "#444b52",

                    scale:
                        1

                },


                basicAttack: {

                    id:
                        "theronSlash",

                    type:
                        "meleeArc",

                    name:
                        "Corte de Aço",

                    damageMultiplier:
                        1.08,

                    range:
                        86,

                    arcDot:
                        0.02,

                    color:
                        "#dce3e8",

                    trailColor:
                        "#ffffff",

                    particleShape:
                        "metalSpark",

                    impactStyle:
                        "steelImpact"

                }

            },


            /* =================================================
               GRUMGAR
               ================================================= */

            {

                id:
                    "grumgar",

                name:
                    "Grumgar",

                className:
                    "Troll",

                icon:
                    "🪨",

                color:
                    "#718f51",

                description:
                    "Uma força brutal que transforma peso e impacto em vantagem.",

                summary:
                    "Vida alta e golpes extremamente pesados.",


                hp:
                    155,

                magic:
                    60,

                energy:
                    120,

                damage:
                    30,

                defense:
                    15,

                speed:
                    126,


                selectionStats: {

                    hp:
                        100,

                    magic:
                        32,

                    energy:
                        82,

                    damage:
                        100,

                    defense:
                        85,

                    speed:
                        48

                },


                sprite: {

                    body:
                        "#536f3e",

                    trim:
                        "#839d64",

                    skin:
                        "#758a58",

                    hair:
                        "#302f28",

                    accent:
                        "#9eb276",

                    weapon:
                        "club",

                    scale:
                        1.08

                },


                basicAttack: {

                    id:
                        "grumgarSmash",

                    type:
                        "heavyMelee",

                    name:
                        "Pancada Bruta",

                    damageMultiplier:
                        1.2,

                    range:
                        78,

                    splashRadius:
                        48,

                    color:
                        "#806c4a",

                    trailColor:
                        "#b59a68",

                    particleShape:
                        "rock",

                    impactStyle:
                        "groundShock"

                }

            },


            /* =================================================
               LIRAEL
               ================================================= */

            {

                id:
                    "lirael",

                name:
                    "Lirael",

                className:
                    "Fada",

                icon:
                    "✨",

                color:
                    "#dd8bd0",

                description:
                    "Uma criatura feérica ágil, ligada à luz e à energia vital.",

                summary:
                    "Velocidade alta, magia e ataques luminosos.",


                hp:
                    86,

                magic:
                    132,

                energy:
                    118,

                damage:
                    22,

                defense:
                    7,

                speed:
                    168,


                selectionStats: {

                    hp:
                        52,

                    magic:
                        92,

                    energy:
                        83,

                    damage:
                        69,

                    defense:
                        35,

                    speed:
                        100

                },


                sprite: {

                    body:
                        "#c36bb5",

                    trim:
                        "#f0b5e5",

                    skin:
                        "#d6a487",

                    hair:
                        "#e0c6df",

                    accent:
                        "#ffb8ea",

                    weapon:
                        "wand",

                    wings:
                        true,

                    scale:
                        0.96

                },


                basicAttack: {

                    id:
                        "liraelSpark",

                    type:
                        "projectile",

                    name:
                        "Luz Feérica",

                    damageMultiplier:
                        0.82,

                    range:
                        330,

                    speed:
                        500,

                    radius:
                        7,

                    color:
                        "#ff9de1",

                    trailColor:
                        "#ffd0f4",

                    particleShape:
                        "star",

                    impactStyle:
                        "fairyBloom"

                }

            },


            /* =================================================
               ZEPHYR
               ================================================= */

            {

                id:
                    "zephyr",

                name:
                    "Zephyr",

                className:
                    "Metamorfo",

                icon:
                    "🌀",

                color:
                    "#8f6bd8",

                description:
                    "Um combatente adaptável que altera seu estilo conforme a situação.",

                summary:
                    "Equilibrado, rápido e difícil de prever.",


                hp:
                    105,

                magic:
                    108,

                energy:
                    126,

                damage:
                    24,

                defense:
                    11,

                speed:
                    160,


                selectionStats: {

                    hp:
                        70,

                    magic:
                        75,

                    energy:
                        88,

                    damage:
                        76,

                    defense:
                        59,

                    speed:
                        90

                },


                sprite: {

                    body:
                        "#6748a6",

                    trim:
                        "#a68ae5",

                    skin:
                        "#bd8e79",

                    hair:
                        "#2f2341",

                    accent:
                        "#b792ff",

                    weapon:
                        "blade",

                    cape:
                        "#46326c",

                    scale:
                        1

                },


                basicAttack: {

                    id:
                        "zephyrRift",

                    type:
                        "riftSlash",

                    name:
                        "Corte Mutável",

                    damageMultiplier:
                        1,

                    range:
                        100,

                    color:
                        "#a675f0",

                    trailColor:
                        "#d0b3ff",

                    particleShape:
                        "afterimage",

                    impactStyle:
                        "riftImpact"

                }

            }

        ]);


    /* =========================================================
       PONTOS DE STATUS
       ========================================================= */

    const STAT_CONFIG =
        Object.freeze({

            strength: {

                label:
                    "FORÇA",

                cap:
                    STAT_CAP,

                description:
                    "+2% de dano por ponto."

            },


            energy: {

                label:
                    "ENERGIA",

                cap:
                    STAT_CAP,

                description:
                    "+5 de Energia máxima por ponto."

            },


            fatigue: {

                label:
                    "CANSAÇO",

                cap:
                    STAT_CAP,

                description:
                    "+3 de Cansaço máximo por ponto."

            },


            hunger: {

                label:
                    "FOME",

                cap:
                    STAT_CAP,

                description:
                    "+3 de Fome máxima por ponto."

            },


            hp: {

                label:
                    "HP",

                cap:
                    STAT_CAP,

                description:
                    "+8 de HP máximo por ponto."

            }

        });


    /* =========================================================
       ITENS
       ========================================================= */

    const ITEMS =
        Object.freeze({

            /* =================================================
               MATERIAIS
               ================================================= */

            madeira: {

                id:
                    "madeira",

                name:
                    "Madeira",

                icon:
                    "🪵",

                category:
                    "materials",

                weight:
                    0.8,

                value:
                    7

            },


            carvao: {

                id:
                    "carvao",

                name:
                    "Carvão",

                icon:
                    "◆",

                category:
                    "materials",

                weight:
                    0.7,

                value:
                    10

            },


            ferro: {

                id:
                    "ferro",

                name:
                    "Ferro",

                icon:
                    "⬡",

                category:
                    "materials",

                weight:
                    1,

                value:
                    16

            },


            ouro: {

                id:
                    "ouro",

                name:
                    "Ouro",

                icon:
                    "●",

                category:
                    "materials",

                weight:
                    0.9,

                value:
                    27

            },


            diamante: {

                id:
                    "diamante",

                name:
                    "Diamante",

                icon:
                    "💎",

                category:
                    "materials",

                weight:
                    0.55,

                value:
                    45,

                bulkProtected:
                    true

            },


            rubi: {

                id:
                    "rubi",

                name:
                    "Rubi",

                icon:
                    "♦️",

                category:
                    "materials",

                weight:
                    0.5,

                value:
                    60,

                bulkProtected:
                    true

            },


            essencia: {

                id:
                    "essencia",

                name:
                    "Essência da Memória",

                icon:
                    "✦",

                category:
                    "materials",

                weight:
                    0.15,

                value:
                    35

            },


            fragmentoMemoria: {

                id:
                    "fragmentoMemoria",

                name:
                    "Fragmento de Memória",

                icon:
                    "◇",

                category:
                    "special",

                weight:
                    0.1,

                value:
                    0,

                bulkProtected:
                    true

            },


            /* =================================================
               COMIDA
               ================================================= */

            cenoura: {

                id:
                    "cenoura",

                name:
                    "Cenoura",

                icon:
                    "🥕",

                category:
                    "food",

                weight:
                    0.15,

                value:
                    7,

                hunger:
                    10

            },


            pao: {

                id:
                    "pao",

                name:
                    "Pão Rústico",

                icon:
                    "🥖",

                category:
                    "food",

                weight:
                    0.35,

                value:
                    16,

                hunger:
                    24

            },


            carneAssada: {

                id:
                    "carneAssada",

                name:
                    "Carne Assada",

                icon:
                    "🍖",

                category:
                    "food",

                weight:
                    0.65,

                value:
                    31,

                hunger:
                    48

            },


            /* =================================================
               POÇÕES
               ================================================= */

            pocao: {

                id:
                    "pocao",

                name:
                    "Poção de Cura",

                icon:
                    "🧪",

                category:
                    "potions",

                weight:
                    0.3,

                value:
                    28,

                heal:
                    48

            },


            elixir: {

                id:
                    "elixir",

                name:
                    "Elixir de Energia",

                icon:
                    "🧴",

                category:
                    "potions",

                weight:
                    0.3,

                value:
                    30,

                energy:
                    48

            },


            pocaoForca: {

                id:
                    "pocaoForca",

                name:
                    "Poção de Força",

                icon:
                    "🧪",

                category:
                    "potions",

                weight:
                    0.3,

                value:
                    55,

                buff:
                    "strength",

                duration:
                    15

            },


            pocaoResistencia: {

                id:
                    "pocaoResistencia",

                name:
                    "Poção de Resistência",

                icon:
                    "🧪",

                category:
                    "potions",

                weight:
                    0.3,

                value:
                    55,

                buff:
                    "resistance",

                duration:
                    15

            },


            pocaoVelocidade: {

                id:
                    "pocaoVelocidade",

                name:
                    "Poção de Velocidade",

                icon:
                    "🧪",

                category:
                    "potions",

                weight:
                    0.3,

                value:
                    55,

                buff:
                    "speed",

                duration:
                    15

            },


            /* =================================================
               MAPA / LANTERNA
               ================================================= */

            minimapa: {

                id:
                    "minimapa",

                name:
                    "Minimapa de Veyra",

                icon:
                    "🗺️",

                category:
                    "map",

                weight:
                    0,

                value:
                    MINIMAP_PRICE,

                unique:
                    true,

                bulkProtected:
                    true

            },


            lanterna: {

                id:
                    "lanterna",

                name:
                    "Lanterna Antiga",

                icon:
                    "🏮",

                category:
                    "special",

                weight:
                    0,

                value:
                    LANTERN_PRICE,

                unique:
                    true,

                bulkProtected:
                    true

            },


            flautaMemoria: {

                id:
                    "flautaMemoria",

                name:
                    "Flauta da Memória",

                icon:
                    "🎵",

                category:
                    "special",

                weight:
                    0,

                value:
                    0,

                unique:
                    true,

                questItem:
                    true,

                bulkProtected:
                    true

            },


            /* =================================================
               ARMAS / FERRAMENTAS
               ================================================= */

            espadaSimples: {

                id:
                    "espadaSimples",

                name:
                    "Espada Simples",

                icon:
                    "⚔️",

                category:
                    "weapons",

                weight:
                    2.2,

                value:
                    20,

                damage:
                    5

            },


            machado: {

                id:
                    "machado",

                name:
                    "Machado",

                icon:
                    "🪓",

                category:
                    "tools",

                weight:
                    2,

                value:
                    25

            },


            /* =================================================
               ARMADURAS

               ORDEM OBRIGATÓRIA:

               Folha
               ↓
               Algodão
               ↓
               Madeira
               ↓
               Couro
               ↓
               Ferro
               ↓
               Ouro
               ↓
               Diamante
               ↓
               Rubi
               ================================================= */

            armaduraFolha: {

                id:
                    "armaduraFolha",

                name:
                    "Armadura de Folha",

                icon:
                    "🍃",

                category:
                    "armor",

                tier:
                    1,

                defense:
                    3,

                weight:
                    1,

                value:
                    40,

                previousArmor:
                    null,

                nextArmor:
                    "armaduraAlgodao",

                vendor:
                    "doran"

            },


            armaduraAlgodao: {

                id:
                    "armaduraAlgodao",

                name:
                    "Armadura de Algodão",

                icon:
                    "☁️",

                category:
                    "armor",

                tier:
                    2,

                defense:
                    6,

                weight:
                    1.4,

                value:
                    75,

                previousArmor:
                    "armaduraFolha",

                nextArmor:
                    "armaduraMadeira",

                vendor:
                    "doran"

            },


            armaduraMadeira: {

                id:
                    "armaduraMadeira",

                name:
                    "Armadura de Madeira",

                icon:
                    "🪵",

                category:
                    "armor",

                tier:
                    3,

                defense:
                    10,

                weight:
                    2.1,

                value:
                    130,

                previousArmor:
                    "armaduraAlgodao",

                nextArmor:
                    "armaduraCouro",

                vendor:
                    "doran"

            },


            armaduraCouro: {

                id:
                    "armaduraCouro",

                name:
                    "Armadura de Couro",

                icon:
                    "🛡️",

                category:
                    "armor",

                tier:
                    4,

                defense:
                    15,

                weight:
                    2.7,

                value:
                    215,

                previousArmor:
                    "armaduraMadeira",

                nextArmor:
                    "armaduraFerro",

                vendor:
                    "doran"

            },


            armaduraFerro: {

                id:
                    "armaduraFerro",

                name:
                    "Armadura de Ferro",

                icon:
                    "⬡",

                category:
                    "armor",

                tier:
                    5,

                defense:
                    22,

                weight:
                    3.5,

                value:
                    360,

                previousArmor:
                    "armaduraCouro",

                nextArmor:
                    "armaduraOuro",

                vendor:
                    "borin"

            },


            armaduraOuro: {

                id:
                    "armaduraOuro",

                name:
                    "Armadura de Ouro",

                icon:
                    "●",

                category:
                    "armor",

                tier:
                    6,

                defense:
                    30,

                weight:
                    3.8,

                value:
                    620,

                previousArmor:
                    "armaduraFerro",

                nextArmor:
                    "armaduraDiamante",

                vendor:
                    "borin"

            },


            armaduraDiamante: {

                id:
                    "armaduraDiamante",

                name:
                    "Armadura de Diamante",

                icon:
                    "💎",

                category:
                    "armor",

                tier:
                    7,

                defense:
                    40,

                weight:
                    3.4,

                value:
                    950,

                previousArmor:
                    "armaduraOuro",

                nextArmor:
                    "armaduraRubi",

                vendor:
                    "borin"

            },


            armaduraRubi: {

                id:
                    "armaduraRubi",

                name:
                    "Armadura de Rubi",

                icon:
                    "♦️",

                category:
                    "armor",

                tier:
                    8,

                defense:
                    53,

                weight:
                    3.1,

                value:
                    1450,

                previousArmor:
                    "armaduraDiamante",

                nextArmor:
                    null,

                vendor:
                    "borin"

            }

        });


    /* =========================================================
       PROGRESSÃO DE ARMADURA
       ========================================================= */

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


    const DORAN_ARMOR_IDS =
        Object.freeze([

            "armaduraFolha",

            "armaduraAlgodao",

            "armaduraMadeira",

            "armaduraCouro"

        ]);


    const BORIN_ARMOR_IDS =
        Object.freeze([

            "armaduraFerro",

            "armaduraOuro",

            "armaduraDiamante",

            "armaduraRubi"

        ]);


    /*
        BORIN:

        Além do material e moedas,
        exige possuir a armadura anterior.

        A Parte 4 fará a substituição real
        da peça antiga pela nova.
    */

    const ARMOR_UPGRADES =
        Object.freeze([

            {

                id:
                    "armaduraFerro",

                previous:
                    "armaduraCouro",

                material:
                    "ferro",

                materialAmount:
                    36,

                coins:
                    340

            },


            {

                id:
                    "armaduraOuro",

                previous:
                    "armaduraFerro",

                material:
                    "ouro",

                materialAmount:
                    42,

                coins:
                    620

            },


            {

                id:
                    "armaduraDiamante",

                previous:
                    "armaduraOuro",

                material:
                    "diamante",

                materialAmount:
                    48,

                coins:
                    980

            },


            {

                id:
                    "armaduraRubi",

                previous:
                    "armaduraDiamante",

                material:
                    "rubi",

                materialAmount:
                    62,

                coins:
                    1450

            }

        ]);


    function getArmorTier(
        id
    ) {

        return (
            ITEMS[
                id
            ]?.tier ||
            0
        );

    }


    function playerOwnsArmor(
        id
    ) {

        if (
            !state.player ||
            !id
        ) {

            return false;

        }


        return (

            (
                state.player
                    .inventory
                    ?.[id] ||
                0
            ) >
            0 ||

            state.player
                .equipment
                ?.armor ===
            id

        );

    }


    function getHighestOwnedArmorId() {

        if (
            !state.player
        ) {

            return null;

        }


        let bestId =
            null;


        let bestTier =
            0;


        for (
            const id of
            ARMOR_PROGRESSION
        ) {

            if (
                !playerOwnsArmor(
                    id
                )
            ) {

                continue;

            }


            const tier =
                getArmorTier(
                    id
                );


            if (
                tier >
                bestTier
            ) {

                bestTier =
                    tier;


                bestId =
                    id;

            }

        }


        return bestId;

    }


    function getHighestOwnedArmorTier() {

        const id =
            getHighestOwnedArmorId();


        return id
            ? getArmorTier(id)
            : 0;

    }


    function getNextArmorUpgradeId() {

        const tier =
            getHighestOwnedArmorTier();


        if (
            tier >=
            ARMOR_PROGRESSION.length
        ) {

            return null;

        }


        return (
            ARMOR_PROGRESSION[
                tier
            ] ||
            null
        );

    }


    function isArmorNextUpgrade(
        id
    ) {

        return (
            getNextArmorUpgradeId() ===
            id
        );

    }


    function getArmorProgressState() {

        const currentId =
            getHighestOwnedArmorId();


        const nextId =
            getNextArmorUpgradeId();


        return {

            currentId,

            currentTier:
                currentId
                    ? getArmorTier(
                        currentId
                    )
                    : 0,

            nextId,

            maxed:
                !nextId

        };

    }


    /* =========================================================
       HABILIDADES Q / R / F
       Mantém progressão por nível.
       ========================================================= */

    const CLASS_SKILLS =
        Object.freeze({

            kaelion: {

                q: {
                    name:
                        "Orbe da Memória",
                    level:
                        1,
                    cost:
                        13,
                    costType:
                        "magic",
                    cooldown:
                        2.1,
                    damage:
                        40,
                    range:
                        390
                },

                r: {
                    name:
                        "Nova Arcana",
                    level:
                        5,
                    cost:
                        25,
                    costType:
                        "magic",
                    cooldown:
                        6,
                    damage:
                        56,
                    range:
                        155
                },

                f: {
                    name:
                        "Tempestade da Memória",
                    level:
                        10,
                    cost:
                        42,
                    costType:
                        "magic",
                    cooldown:
                        11,
                    damage:
                        70,
                    range:
                        205
                }

            },


            theron: {

                q: {
                    name:
                        "Corte Pesado",
                    level:
                        1,
                    cost:
                        10,
                    costType:
                        "energy",
                    cooldown:
                        2,
                    damage:
                        48,
                    range:
                        105
                },

                r: {
                    name:
                        "Guarda de Aço",
                    level:
                        5,
                    cost:
                        18,
                    costType:
                        "energy",
                    cooldown:
                        8,
                    damage:
                        0,
                    range:
                        0
                },

                f: {
                    name:
                        "Juramento da Lâmina",
                    level:
                        10,
                    cost:
                        34,
                    costType:
                        "energy",
                    cooldown:
                        10,
                    damage:
                        84,
                    range:
                        145
                }

            },


            grumgar: {

                q: {
                    name:
                        "Esmagamento",
                    level:
                        1,
                    cost:
                        13,
                    costType:
                        "energy",
                    cooldown:
                        2.7,
                    damage:
                        58,
                    range:
                        115
                },

                r: {
                    name:
                        "Rugido",
                    level:
                        5,
                    cost:
                        22,
                    costType:
                        "energy",
                    cooldown:
                        7,
                    damage:
                        34,
                    range:
                        175
                },

                f: {
                    name:
                        "Terra Partida",
                    level:
                        10,
                    cost:
                        40,
                    costType:
                        "energy",
                    cooldown:
                        12,
                    damage:
                        88,
                    range:
                        215
                }

            },


            lirael: {

                q: {
                    name:
                        "Brilho Vital",
                    level:
                        1,
                    cost:
                        16,
                    costType:
                        "magic",
                    cooldown:
                        4,
                    damage:
                        0,
                    range:
                        0
                },

                r: {
                    name:
                        "Flecha Feérica",
                    level:
                        5,
                    cost:
                        18,
                    costType:
                        "magic",
                    cooldown:
                        3.7,
                    damage:
                        52,
                    range:
                        460
                },

                f: {
                    name:
                        "Chuva das Estrelas",
                    level:
                        10,
                    cost:
                        40,
                    costType:
                        "magic",
                    cooldown:
                        11,
                    damage:
                        76,
                    range:
                        185
                }

            },


            zephyr: {

                q: {
                    name:
                        "Forma Adaptativa",
                    level:
                        1,
                    cost:
                        15,
                    costType:
                        "magic",
                    cooldown:
                        6,
                    damage:
                        0,
                    range:
                        0
                },

                r: {
                    name:
                        "Investida Mutável",
                    level:
                        5,
                    cost:
                        20,
                    costType:
                        "energy",
                    cooldown:
                        5.2,
                    damage:
                        54,
                    range:
                        190
                },

                f: {
                    name:
                        "Forma Perfeita",
                    level:
                        10,
                    cost:
                        34,
                    costType:
                        "magic",
                    cooldown:
                        11,
                    damage:
                        78,
                    range:
                        155
                }

            }

        });


    /* =========================================================
       NPCs
       ========================================================= */

    const NPC_LIBRARY =
        Object.freeze({

            ELIAN: {

                id:
                    "elian",

                name:
                    "ELIAN",

                spriteType:
                    "villager",

                color:
                    "#75634d",

                lines: [

                    "Você acordou. Isso já é mais do que alguns conseguem dizer.",

                    "A Quietude não destrói apenas lembranças. Ela apaga o significado delas.",

                    "Se pretende sair da vila, observe os caminhos. Veyra costuma avisar antes de tentar matar alguém."

                ]

            },


            MARA: {

                id:
                    "mara",

                name:
                    "MARA",

                spriteType:
                    "villager",

                color:
                    "#6f5861",

                lines: [

                    "Não fique tanto tempo longe sem comer.",

                    "Fome e cansaço não derrubam você de uma vez, mas fazem qualquer batalha ficar muito pior."

                ]

            },


            DORAN: {

                id:
                    "doran",

                name:
                    "DORAN",

                spriteType:
                    "merchant",

                color:
                    "#94704f",

                merchant:
                    true,

                lines: [

                    "Compre apenas o que realmente precisa.",

                    "Uma boa armadura não nasce pronta. Você melhora uma peça até ela se tornar outra.",

                    "Couro é o máximo que vendo por aqui. Depois disso, procure Borin."

                ]

            },


            BRAN: {

                id:
                    "bran",

                name:
                    "BRAN",

                spriteType:
                    "carpenter",

                color:
                    "#806342",

                questId:
                    "wood",

                lines: [

                    "Estou reparando algumas construções antes que a Quietude leve até as paredes.",

                    "Se puder trazer madeira, consigo terminar mais rápido."

                ]

            },


            BORIN: {

                id:
                    "borin",

                name:
                    "BORIN",

                spriteType:
                    "blacksmith",

                color:
                    "#6c5550",

                blacksmith:
                    true,

                questId:
                    "coal",

                lines: [

                    "Doran vende proteção. Eu faço armadura.",

                    "Mas não espere pular etapas. Uma peça forte é construída sobre a anterior.",

                    "Traga a armadura correta, material e moedas. Eu cuido do resto."

                ]

            },


            /* =================================================
               MIGUEL

               Ele NÃO ganha loja inventada agora.
               ================================================= */

            MIGUEL: {

                id:
                    "miguel",

                name:
                    "MIGUEL",

                spriteType:
                    "mysterious",

                color:
                    "#514768",

                mysterious:
                    true,

                requiresDash:
                    true,


                beforeDashLines: [

                    "Você ainda não está pronto.",

                    "Volte mais tarde."

                ],


                afterDashLines: [

                    "Hm.",

                    "Então você finalmente aprendeu a se mover como alguém que pretende sobreviver.",

                    "Volte mais tarde."

                ],


                /*
                    Futuramente será preenchido
                    quando for decidido o que ele vende.
                */
                vendorConfig:
                    null

            }

        });


    /* =========================================================
       BOSSES

       REGRA:
       BARRA GRANDE = SOMENTE BOSS DE AVANÇO.

       O Cervo Ancestral fica:
       resourceBoss + topBar false.
       ========================================================= */

    const BOSS_REGISTRY =
        Object.freeze([

            {

                id:
                    "road_guardian",

                name:
                    "GUARDIÃO DA ESTRADA",

                region:
                    "village",

                icon:
                    "🛡️",

                imageStyle:
                    "roadGuardian",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "forest_warden",

                name:
                    "VIGIA DA FLORESTA",

                region:
                    "forest",

                icon:
                    "🌲",

                imageStyle:
                    "forestWarden",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "grove_heart",

                name:
                    "CORAÇÃO DO BOSQUE",

                region:
                    "grove",

                icon:
                    "🍂",

                imageStyle:
                    "groveHeart",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "mountain_titan",

                name:
                    "TITÃ DA MONTANHA",

                region:
                    "mountains",

                icon:
                    "🏔️",

                imageStyle:
                    "mountainTitan",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "iron_colossus",

                name:
                    "COLOSSO DE FERRO",

                region:
                    "iron",

                icon:
                    "⚙️",

                imageStyle:
                    "ironColossus",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "ruby_chimera",

                name:
                    "QUIMERA DE RUBI",

                region:
                    "ruby",

                icon:
                    "♦️",

                imageStyle:
                    "rubyChimera",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "monarch",

                name:
                    "O MONARCA",

                region:
                    "monarchMaze",

                icon:
                    "♛",

                imageStyle:
                    "monarch",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "shadow_lord",

                name:
                    "SENHOR DAS SOMBRAS",

                region:
                    "shadow",

                icon:
                    "◐",

                imageStyle:
                    "shadowLord",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "fairy_guardian",

                name:
                    "GUARDIÃ FEÉRICA",

                region:
                    "fairy",

                icon:
                    "✧",

                imageStyle:
                    "fairyGuardian",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "path_guardian",

                name:
                    "GUARDIÃO DO CAMINHO",

                region:
                    "sky",

                icon:
                    "☼",

                imageStyle:
                    "pathGuardian",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "hell_guardian",

                name:
                    "GUARDIÃO SUPREMO",

                region:
                    "hell",

                icon:
                    "♨",

                imageStyle:
                    "hellGuardian",

                type:
                    "progression",

                topBar:
                    true

            },


            {

                id:
                    "other_self",

                name:
                    "O OUTRO EU",

                region:
                    "final",

                icon:
                    "◈",

                imageStyle:
                    "otherSelf",

                type:
                    "progression",

                topBar:
                    true

            },


            /* =================================================
               CERVO ANCESTRAL

               SEM BARRA GRANDE.
               ================================================= */

            {

                id:
                    "ancient_deer",

                name:
                    "CERVO ANCESTRAL",

                region:
                    "grove",

                icon:
                    "🦌",

                imageStyle:
                    "ancientDeer",

                type:
                    "resourceBoss",

                topBar:
                    false

            }

        ]);


    function getBossDefinition(
        id
    ) {

        return (

            BOSS_REGISTRY
                .find(
                    boss =>
                        boss.id ===
                        id
                ) ||

            null

        );

    }


    function shouldBossUseTopBar(
        enemy
    ) {

        return Boolean(

            enemy &&

            enemy.type ===
            "progression" &&

            getBossDefinition(
                enemy.id
            )?.topBar ===
            true

        );

    }


    /* =========================================================
       ESTADO GLOBAL
       ========================================================= */

    const state = {

        running:
            false,

        paused:
            false,

        pauseReason:
            null,

        time:
            0,

        lastTime:
            performance.now(),


        selectedCharacter:
            null,

        player:
            null,

        area:
            "village",


        /*
            Criado de verdade na Parte 2.
        */
        world:
            null,


        houseMode:
            false,

        currentHouse:
            null,

        houseReturn:
            null,


        camera: {

            x:
                0,

            y:
                0

        },


        pointer: {

            x:
                0,

            y:
                0,

            worldX:
                0,

            worldY:
                0,

            down:
                false

        },


        keys:
            new Set(),


        dialogue:
            null,

        travel:
            null,

        battle:
            null,

        questNPC:
            null,

        shopNPC:
            null,

        shopMode:
            "buy",

        inventoryCategory:
            "all",

        holdAction:
            null,


        bossBarTarget:
            null,


        transition:
            null,

        transitionQueue:
            [],


        portalCooldown:
            0,

        autosaveTimer:
            0,


        damageFlash:
            0,

        bloodMarks:
            [],

        screenShake:
            0,

        screenShakePower:
            0,


        skyWaveDelay:
            null,

        finalChoiceShown:
            false,

        toastTimer:
            null,


        debug: {

            lastSafeRepair:
                0

        }

    };


    /* =========================================================
       PERSONAGEM ATUAL
       ========================================================= */

    function currentCharacter() {

        return (

            CHARACTERS
                .find(
                    character =>
                        character.id ===
                        state.player
                            ?.characterId
                ) ||

            state.selectedCharacter ||

            CHARACTERS[0]

        );

    }


    /* =========================================================
       INVENTÁRIO VAZIO
       ========================================================= */

    function createEmptyInventory() {

        const inventory =
            {};


        for (
            const id of
            Object.keys(
                ITEMS
            )
        ) {

            inventory[
                id
            ] =
                0;

        }


        return inventory;

    }


    /* =========================================================
       SEEDS DO MUNDO
       ========================================================= */

    function createInitialWorldSeeds(
        playerName
    ) {

        const areas = [

            "village",

            "forest",

            "grove",

            "mountains",

            "iron",

            "ruby",

            "monarchMaze",

            "shadow",

            "fairy",

            "sky",

            "hell",

            "final"

        ];


        const seeds =
            {};


        const base =
            `${playerName}:${Date.now()}:${Math.random()}`;


        areas.forEach(
            (
                area,
                index
            ) => {

                seeds[
                    area
                ] =
                    hashString(

                        `${base}:${area}:${index}:v20`

                    );

            }
        );


        return seeds;

    }


    function getWorldSeed(
        area
    ) {

        if (
            !state.player
        ) {

            return hashString(
                `veyra:${area}`
            );

        }


        state.player
            .worldSeeds =
            state.player
                .worldSeeds ||
            {};


        if (
            !state.player
                .worldSeeds[
                    area
                ]
        ) {

            state.player
                .worldSeeds[
                    area
                ] =
                    hashString(

                        `${state.player.name}:${area}:v20`

                    );

        }


        return state.player
            .worldSeeds[
                area
            ];

    }


    function getAreaRng(
        area,
        namespace = "default"
    ) {

        return mulberry32(

            hashString(

                `${getWorldSeed(area)}:${namespace}`

            )

        );

    }


    /* =========================================================
       CRIAÇÃO DO PLAYER
       ========================================================= */

    function createNewPlayer(
        character,
        name
    ) {

        const inventory =
            createEmptyInventory();


        inventory.espadaSimples =
            1;


        inventory.machado =
            1;


        return {

            characterId:
                character.id,

            name,

            className:
                character.className,

            icon:
                character.icon,

            color:
                character.color,

            sprite:
                deepClone(
                    character.sprite
                ),


            x:
                0,

            y:
                0,

            radius:
                VISUAL_CONFIG
                    .playerRadius,

            facing:
                "down",

            walkTime:
                0,

            attackAnim:
                0,

            hurtAnim:
                0,


            baseMaxHp:
                character.hp,

            baseMaxMagic:
                character.magic,

            baseMaxEnergy:
                character.energy,

            baseDamage:
                character.damage,

            baseDefense:
                character.defense,

            baseSpeed:
                character.speed,


            maxHp:
                character.hp,

            maxMagic:
                character.magic,

            maxEnergy:
                character.energy,

            maxHunger:
                100,

            maxFatigue:
                100,


            hp:
                character.hp,

            magic:
                character.magic,

            energy:
                character.energy,

            hunger:
                100,

            fatigue:
                100,


            money:
                80,


            level:
                1,

            xp:
                0,

            xpToNext:
                100,

            statPoints:
                0,


            stats: {

                strength:
                    0,

                energy:
                    0,

                fatigue:
                    0,

                hunger:
                    0,

                hp:
                    0

            },


            inventory,

            inventoryWeightLimit:
                100,


            equipment: {

                weapon:
                    "espadaSimples",

                armor:
                    null,

                tool:
                    "machado"

            },


            abilities: {

                dash:
                    false,

                /*
                    Não definir habilidade futura
                    das outras rotas agora.
                */
                route2:
                    false,

                route3:
                    false

            },


            gateDialogueIndex: {

                north:
                    0,

                west:
                    0,

                south:
                    0

            },


            gateUnlocks: {

                north:
                    false,

                west:
                    false,

                south:
                    false

            },


            discoveredBosses:
                [],

            defeatedBosses:
                [],

            exploredAreas: [

                "village"

            ],

            unlockedAreas: [

                "village"

            ],


            worldSeeds:
                createInitialWorldSeeds(
                    name
                ),


            secretsFound:
                [],

            hellTypesDefeated:
                {},

            collected:
                {},


            quest: {

                wood: {

                    state:
                        "none",

                    need:
                        10,

                    rewardXP:
                        100,

                    rewardMoney:
                        80,

                    rewarded:
                        false

                },


                coal: {

                    state:
                        "none",

                    need:
                        8,

                    rewardXP:
                        130,

                    rewardMoney:
                        110,

                    rewarded:
                        false

                }

            },


            skyTrial: {

                started:
                    false,

                wave:
                    0,

                activeWave:
                    0,

                complete:
                    false

            },


            monarchAwakened:
                false,

            monarchDefeated:
                false,

            dashPurchased:
                false,


            flutePlayed:
                false,

            fluteRewardGranted:
                false,


            finalChoice:
                null,

            finalDefeated:
                false,


            minimapOwned:
                false,

            lanternOwned:
                false,


            skillCooldowns: {

                q:
                    0,

                r:
                    0,

                f:
                    0

            },


            itemCooldowns:
                {},

            activePotionBuffs:
                [],


            attackCooldown:
                0,

            dashCooldown:
                0,

            invincible:
                0,

            stunTimer:
                0,

            shieldTimer:
                0,

            damageReduction:
                0,


            adaptiveBuff:
                false,

            adaptiveTimer:
                0,


            playerDash:
                null,

            zephyrDash:
                null,


            dead:
                false,


            checkpoint: {

                area:
                    "village",

                x:
                    1510,

                y:
                    1180,

                houseId:
                    "home",

                insideHouse:
                    true

            }

        };

    }


    /* =========================================================
       XP
       ========================================================= */

    function calculateXpToNext(
        level
    ) {

        const safe =
            clamp(

                Math.floor(
                    level ||
                    1
                ),

                1,

                MAX_LEVEL

            );


        return Math.floor(

            100 +

            (
                safe -
                1
            ) *
            45 +

            Math.pow(
                safe -
                1,
                1.28
            ) *
            12

        );

    }


    /* =========================================================
       FIM DA PARTE 1/5

       A PARTE 2 SERÁ COLADA LOGO ABAIXO.

       NÃO COLOQUE:

       })();

       AINDA.
       ========================================================= */
 
