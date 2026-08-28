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
     /* =========================================================
       VEYRA: A QUIETUDE — V20 — PARTE 2/5

       MUNDO
       REGIÕES
       CASAS
       CAMINHOS
       GERAÇÃO SEGURA
       ÁRVORES
       PORTÕES
       MIGUEL
       ROTA 1
       LABIRINTO DO MONARCA

       CONTINUA DIRETAMENTE DA PARTE 1.
       NÃO FECHE O IIFE AQUI.
       ========================================================= */


    /* =========================================================
       REGIÕES
       ========================================================= */

    const REGIONS =
        Object.freeze({

            village: {

                id:
                    "village",

                name:
                    "VILA DO CREPÚSCULO",

                width:
                    3200,

                height:
                    2200

            },


            forest: {

                id:
                    "forest",

                name:
                    "FLORESTA DO CREPÚSCULO",

                width:
                    3400,

                height:
                    2300

            },


            grove: {

                id:
                    "grove",

                name:
                    "BOSQUE ANTIGO",

                width:
                    3500,

                height:
                    2350

            },


            mountains: {

                id:
                    "mountains",

                name:
                    "MONTANHAS DE VEYRA",

                width:
                    3500,

                height:
                    2350

            },


            iron: {

                id:
                    "iron",

                name:
                    "CAVERNA DE FERRO",

                width:
                    3400,

                height:
                    2250

            },


            ruby: {

                id:
                    "ruby",

                name:
                    "TERRAS DE RUBI",

                width:
                    3500,

                height:
                    2300

            },


            monarchMaze: {

                id:
                    "monarchMaze",

                name:
                    "LABIRINTO DO MONARCA",

                width:
                    3600,

                height:
                    2300

            },


            shadow: {

                id:
                    "shadow",

                name:
                    "CAVERNA SOMBRIA",

                width:
                    3300,

                height:
                    2200

            },


            fairy: {

                id:
                    "fairy",

                name:
                    "REINO DAS FADAS",

                width:
                    3400,

                height:
                    2250

            },


            sky: {

                id:
                    "sky",

                name:
                    "CÉU DE VEYRA",

                width:
                    3400,

                height:
                    2250

            },


            hell: {

                id:
                    "hell",

                name:
                    "INFERNO",

                width:
                    3700,

                height:
                    2450

            },


            final: {

                id:
                    "final",

                name:
                    "CÂMARA FINAL",

                width:
                    2200,

                height:
                    1550

            }

        });


    const PREVIOUS_REGION =
        Object.freeze({

            forest:
                "village",

            grove:
                "forest",

            mountains:
                "grove",

            iron:
                "mountains",

            ruby:
                "iron",

            monarchMaze:
                "ruby",

            shadow:
                "village",

            fairy:
                "shadow",

            sky:
                "fairy",

            hell:
                "village",

            final:
                "hell"

        });


    /* =========================================================
       CORES DOS BIOMAS
       ========================================================= */

    const BIOME_STYLE =
        Object.freeze({

            village: {

                ground:
                    "#536944",

                ground2:
                    "#60754d",

                accent:
                    "#6f8057",

                speck:
                    "#87906d",

                dirt:
                    "#9b8055"

            },


            forest: {

                ground:
                    "#344b35",

                ground2:
                    "#3f573c",

                accent:
                    "#506247",

                speck:
                    "#6f765a",

                dirt:
                    "#786748"

            },


            grove: {

                ground:
                    "#314332",

                ground2:
                    "#3b4e36",

                accent:
                    "#5f6045",

                speck:
                    "#77725b",

                dirt:
                    "#706147"

            },


            mountains: {

                ground:
                    "#777b75",

                ground2:
                    "#888d88",

                accent:
                    "#adb0aa",

                speck:
                    "#c1c3bd",

                dirt:
                    "#9e998c"

            },


            iron: {

                ground:
                    "#373534",

                ground2:
                    "#413e3b",

                accent:
                    "#5b5651",

                speck:
                    "#85817d",

                dirt:
                    "#4e4842"

            },


            ruby: {

                ground:
                    "#4c3037",

                ground2:
                    "#5b3540",

                accent:
                    "#713c4a",

                speck:
                    "#9a5264",

                dirt:
                    "#664146"

            },


            monarchMaze: {

                ground:
                    "#17151a",

                ground2:
                    "#1d1a21",

                accent:
                    "#2b2630",

                speck:
                    "#403847",

                dirt:
                    "#262128"

            },


            shadow: {

                ground:
                    "#232532",

                ground2:
                    "#2a2d3d",

                accent:
                    "#3e4052",

                speck:
                    "#55576c",

                dirt:
                    "#393949"

            },


            fairy: {

                ground:
                    "#455442",

                ground2:
                    "#52624c",

                accent:
                    "#886e91",

                speck:
                    "#c98ab8",

                dirt:
                    "#806c78"

            },


            sky: {

                ground:
                    "#aebdc4",

                ground2:
                    "#c4d0d5",

                accent:
                    "#e1e6e8",

                speck:
                    "#ffffff",

                dirt:
                    "#bcc2c2"

            },


            hell: {

                ground:
                    "#38201c",

                ground2:
                    "#46241e",

                accent:
                    "#6d3026",

                speck:
                    "#a3482f",

                dirt:
                    "#532a22"

            },


            final: {

                ground:
                    "#242127",

                ground2:
                    "#302b34",

                accent:
                    "#4c4352",

                speck:
                    "#83768c",

                dirt:
                    "#39323e"

            }

        });


    /* =========================================================
       PORTÕES
       ========================================================= */

    const NORTH_GATE_DIALOGUES =
        Object.freeze([

            [

                "O caminho à sua frente parece errado. Seu instinto diz que atravessá-lo agora seria uma sentença de morte.",

                "Você ainda não está preparado."

            ],


            [

                "Algo além deste portão parece rápido demais para ser enfrentado da forma como você está agora.",

                "Talvez exista alguma forma de escapar do que espera adiante."

            ],


            [

                "Por um instante, você sente que deveria recuar.",

                "Seu corpo ainda não está preparado para sobreviver a este caminho."

            ]

        ]);


    const BLOCKED_ROUTE_DIALOGUES =
        Object.freeze({

            west: [

                [

                    "O caminho a oeste parece existir, mas alguma coisa em você se recusa a atravessá-lo.",

                    "Ainda não é hora."

                ],


                [

                    "As marcas deste portão não respondem a nenhuma técnica que você conhece.",

                    "Talvez outra jornada revele o que falta."

                ],


                [

                    "O vento atravessa as grades, mas a passagem continua estranhamente distante.",

                    "Você não possui o necessário."

                ]

            ],


            south: [

                [

                    "Há alguma coisa muito antiga além deste portão.",

                    "Seu instinto manda você voltar."

                ],


                [

                    "O caminho ao sul parece afundar para uma parte esquecida de Veyra.",

                    "Não existe razão para forçar a passagem agora."

                ],


                [

                    "As pedras sob seus pés vibram por um instante.",

                    "Algo ainda precisa acontecer antes que este caminho faça sentido."

                ]

            ]

        });


    /* =========================================================
       INTERIORES DAS CASAS

       V20:
       cômodo físico pequeno, cercado por vazio.

       A Parte 5 desenhará esses cômodos
       centralizados na tela.
       ========================================================= */

    const HOUSE_INTERIORS =
        Object.freeze({

            home: {

                room: {

                    x:
                        130,

                    y:
                        100,

                    w:
                        820,

                    h:
                        515

                },

                world: {

                    w:
                        1080,

                    h:
                        730

                },

                floor:
                    "#75573d",

                wall:
                    "#3d3229",

                trim:
                    "#a78961",


                playerSpawn: {

                    x:
                        540,

                    y:
                        515

                },


                door: {

                    x:
                        495,

                    y:
                        560,

                    w:
                        90,

                    h:
                        55

                },


                furniture: [

                    {

                        id:
                            "home_bed",

                        type:
                            "bed",

                        x:
                            220,

                        y:
                            190,

                        w:
                            188,

                        h:
                            108,

                        solid:
                            true,

                        sleep:
                            true

                    },


                    {

                        id:
                            "home_chest",

                        type:
                            "chest",

                        x:
                            750,

                        y:
                            190,

                        w:
                            90,

                        h:
                            70,

                        solid:
                            true

                    },


                    {

                        id:
                            "home_table",

                        type:
                            "table",

                        x:
                            475,

                        y:
                            315,

                        w:
                            130,

                        h:
                            82,

                        solid:
                            true

                    },


                    {

                        id:
                            "home_rug",

                        type:
                            "rug",

                        x:
                            438,

                        y:
                            425,

                        w:
                            205,

                        h:
                            88,

                        solid:
                            false

                    }

                ],


                npcs:
                    []

            },


            elianHome: {

                room: {

                    x:
                        140,

                    y:
                        105,

                    w:
                        800,

                    h:
                        500

                },

                world: {

                    w:
                        1080,

                    h:
                        720

                },

                floor:
                    "#70563e",

                wall:
                    "#43362b",

                trim:
                    "#aa8d66",


                playerSpawn: {

                    x:
                        540,

                    y:
                        505

                },


                door: {

                    x:
                        496,

                    y:
                        548,

                    w:
                        88,

                    h:
                        55

                },


                furniture: [

                    {

                        type:
                            "bookshelf",

                        x:
                            225,

                        y:
                            180,

                        w:
                            115,

                        h:
                            188,

                        solid:
                            true

                    },


                    {

                        type:
                            "table",

                        x:
                            465,

                        y:
                            280,

                        w:
                            150,

                        h:
                            88,

                        solid:
                            true

                    },


                    {

                        type:
                            "bed",

                        x:
                            708,

                        y:
                            190,

                        w:
                            150,

                        h:
                            92,

                        solid:
                            true

                    }

                ],


                npcs:
                    []

            },


            shop: {

                room: {

                    x:
                        100,

                    y:
                        90,

                    w:
                        900,

                    h:
                        530

                },

                world: {

                    w:
                        1100,

                    h:
                        730

                },

                floor:
                    "#6c5038",

                wall:
                    "#382d26",

                trim:
                    "#b08d5f",


                playerSpawn: {

                    x:
                        550,

                    y:
                        515

                },


                door: {

                    x:
                        502,

                    y:
                        566,

                    w:
                        96,

                    h:
                        54

                },


                furniture: [

                    {

                        type:
                            "counter",

                        x:
                            344,

                        y:
                            255,

                        w:
                            412,

                        h:
                            72,

                        solid:
                            true

                    },


                    {

                        type:
                            "shopShelf",

                        x:
                            182,

                        y:
                            165,

                        w:
                            120,

                        h:
                            226,

                        solid:
                            true

                    },


                    {

                        type:
                            "shopShelf",

                        x:
                            798,

                        y:
                            165,

                        w:
                            120,

                        h:
                            226,

                        solid:
                            true

                    },


                    {

                        type:
                            "crate",

                        x:
                            208,

                        y:
                            438,

                        w:
                            78,

                        h:
                            66,

                        solid:
                            true

                    },


                    {

                        type:
                            "crate",

                        x:
                            814,

                        y:
                            438,

                        w:
                            78,

                        h:
                            66,

                        solid:
                            true

                    }

                ],


                npcs: [

                    {

                        ...NPC_LIBRARY.DORAN,

                        x:
                            550,

                        y:
                            205,

                        radius:
                            18

                    }

                ]

            },


            forge: {

                room: {

                    x:
                        95,

                    y:
                        85,

                    w:
                        910,

                    h:
                        545

                },

                world: {

                    w:
                        1100,

                    h:
                        740

                },

                floor:
                    "#4c433d",

                wall:
                    "#292729",

                trim:
                    "#766c62",


                playerSpawn: {

                    x:
                        550,

                    y:
                        525

                },


                door: {

                    x:
                        502,

                    y:
                        575,

                    w:
                        96,

                    h:
                        54

                },


                furniture: [

                    {

                        type:
                            "furnace",

                        x:
                            185,

                        y:
                            175,

                        w:
                            185,

                        h:
                            185,

                        solid:
                            true

                    },


                    {

                        type:
                            "anvil",

                        x:
                            469,

                        y:
                            315,

                        w:
                            162,

                        h:
                            106,

                        solid:
                            true,

                        forge:
                            true

                    },


                    {

                        type:
                            "workbench",

                        x:
                            730,

                        y:
                            190,

                        w:
                            185,

                        h:
                            92,

                        solid:
                            true

                    },


                    {

                        type:
                            "oreCrate",

                        x:
                            765,

                        y:
                            385,

                        w:
                            96,

                        h:
                            78,

                        solid:
                            true

                    }

                ],


                npcs: [

                    {

                        ...NPC_LIBRARY.BORIN,

                        x:
                            550,

                        y:
                            210,

                        radius:
                            18

                    }

                ]

            },


            woodshop: {

                room: {

                    x:
                        115,

                    y:
                        95,

                    w:
                        850,

                    h:
                        515

                },

                world: {

                    w:
                        1080,

                    h:
                        720

                },

                floor:
                    "#74583d",

                wall:
                    "#403228",

                trim:
                    "#a8835c",


                playerSpawn: {

                    x:
                        540,

                    y:
                        510

                },


                door: {

                    x:
                        493,

                    y:
                        555,

                    w:
                        94,

                    h:
                        54

                },


                furniture: [

                    {

                        type:
                            "workbench",

                        x:
                            397,

                        y:
                            250,

                        w:
                            285,

                        h:
                            82,

                        solid:
                            true

                    },


                    {

                        type:
                            "logStack",

                        x:
                            210,

                        y:
                            185,

                        w:
                            130,

                        h:
                            110,

                        solid:
                            true

                    },


                    {

                        type:
                            "boardStack",

                        x:
                            742,

                        y:
                            195,

                        w:
                            120,

                        h:
                            105,

                        solid:
                            true

                    }

                ],


                npcs: [

                    {

                        ...NPC_LIBRARY.BRAN,

                        x:
                            540,

                        y:
                            190,

                        radius:
                            18

                    }

                ]

            }

        });


    /* =========================================================
       HELPERS DA CASA
       ========================================================= */

    function getHouseSpec(
        house = state.currentHouse
    ) {

        if (!house) {

            return null;

        }


        return (

            HOUSE_INTERIORS[
                house.interiorId ||
                house.id
            ] ||

            HOUSE_INTERIORS.home

        );

    }


    function getHouseRoom() {

        return (
            getHouseSpec()
                ?.room ||
            HOUSE_INTERIORS.home.room
        );

    }


    function getHouseFurniture() {

        return (
            getHouseSpec()
                ?.furniture ||
            []
        );

    }


    function getHouseInteriorNPCs() {

        return (
            getHouseSpec()
                ?.npcs ||
            []
        );

    }


    function getInteriorDoor() {

        return (

            getHouseSpec()
                ?.door ||

            HOUSE_INTERIORS
                .home
                .door

        );

    }


    function getHouseWorldSize() {

        const spec =
            getHouseSpec();


        return (

            spec?.world ||

            {
                w:
                    1080,

                h:
                    720
            }

        );

    }


    /* =========================================================
       MUNDO VAZIO
       ========================================================= */

    function createEmptyWorld(
        area
    ) {

        const region =
            REGIONS[
                area
            ];


        if (!region) {

            throw new Error(
                `VEYRA V20: região inválida: ${area}`
            );

        }


        return {

            width:
                region.width,

            height:
                region.height,


            paths:
                [],

            protectedZones:
                [],

            obstacles:
                [],

            buildings:
                [],

            doors:
                [],

            gates:
                [],

            portals:
                [],

            npcs:
                [],

            enemies:
                [],

            trees:
                [],

            resources:
                [],

            foods:
                [],

            drops:
                [],

            decorations:
                [],

            trials:
                [],

            hazards:
                [],

            effects:
                [],

            particles:
                [],

            projectiles:
                [],

            damageNumbers:
                []

        };

    }


    function ensureWorldRuntimeArrays() {

        if (
            !state.world
        ) {

            return;

        }


        const arrays = [

            "paths",
            "protectedZones",
            "obstacles",
            "buildings",
            "doors",
            "gates",
            "portals",
            "npcs",
            "enemies",
            "trees",
            "resources",
            "foods",
            "drops",
            "decorations",
            "trials",
            "hazards",
            "effects",
            "particles",
            "projectiles",
            "damageNumbers"

        ];


        for (
            const key of arrays
        ) {

            if (
                !Array.isArray(
                    state.world[
                        key
                    ]
                )
            ) {

                state.world[
                    key
                ] =
                    [];

            }

        }

    }


    /* =========================================================
       PATHS
       ========================================================= */

    function addPath(
        kind,
        points,
        width,
        options = {}
    ) {

        const path = {

            id:
                options.id ||
                uid("path"),

            kind,

            points:
                points.map(
                    point => ({
                        x:
                            point.x,
                        y:
                            point.y
                    })
                ),

            width,

            surface:
                options.surface ||
                kind

        };


        state.world.paths
            .push(
                path
            );


        return path;

    }


    function pointNearPath(
        x,
        y,
        radius = 0,
        extra = 0
    ) {

        for (
            const path of
            state.world.paths
        ) {

            for (
                let i = 0;
                i <
                path.points.length - 1;
                i++
            ) {

                const a =
                    path.points[i];


                const b =
                    path.points[i + 1];


                const d =
                    distancePointToSegment(

                        x,
                        y,

                        a.x,
                        a.y,

                        b.x,
                        b.y

                    );


                if (
                    d <=

                    path.width /
                    2 +

                    radius +

                    extra
                ) {

                    return true;

                }

            }

        }


        return false;

    }


    /* =========================================================
       ZONAS PROTEGIDAS
       ========================================================= */

    function addProtectedZone(
        x,
        y,
        radius,
        reason = "protected"
    ) {

        const zone = {

            id:
                uid("safe"),

            x,

            y,

            radius,

            reason

        };


        state.world
            .protectedZones
            .push(
                zone
            );


        return zone;

    }


    function circleInProtectedZone(
        x,
        y,
        radius = 0
    ) {

        return state.world
            .protectedZones
            .some(
                zone =>

                    distance(

                        x,
                        y,

                        zone.x,
                        zone.y

                    ) <=

                    zone.radius +
                    radius
            );

    }


    function isReservedSpawnZone(
        x,
        y,
        radius = 20
    ) {

        if (
            pointNearPath(

                x,
                y,

                radius,

                18

            )
        ) {

            return true;

        }


        if (
            circleInProtectedZone(
                x,
                y,
                radius
            )
        ) {

            return true;

        }


        for (
            const portal of
            state.world.portals
        ) {

            if (
                circleRectCollision(

                    x,
                    y,

                    radius + 60,

                    portal

                )
            ) {

                return true;

            }

        }


        for (
            const door of
            state.world.doors
        ) {

            const doorSafety = {

                x:
                    door.x - 35,

                y:
                    door.y - 80,

                w:
                    door.w + 70,

                h:
                    door.h + 145

            };


            if (
                circleRectCollision(

                    x,
                    y,

                    radius,

                    doorSafety

                )
            ) {

                return true;

            }

        }


        for (
            const gate of
            state.world.gates
        ) {

            const gateSafety = {

                x:
                    gate.x -
                    VISUAL_CONFIG
                        .gate
                        .approachClearance,

                y:
                    gate.y -
                    VISUAL_CONFIG
                        .gate
                        .approachClearance,

                w:
                    gate.w +
                    VISUAL_CONFIG
                        .gate
                        .approachClearance *
                    2,

                h:
                    gate.h +
                    VISUAL_CONFIG
                        .gate
                        .approachClearance *
                    2

            };


            if (
                circleRectCollision(

                    x,
                    y,

                    radius,

                    gateSafety

                )
            ) {

                return true;

            }

        }


        return false;

    }


    /* =========================================================
       OBSTÁCULOS
       ========================================================= */

    function addObstacle(
        data
    ) {

        const obstacle = {

            id:
                data.id ||
                uid("obstacle"),

            type:
                data.type ||
                "rock",

            x:
                data.x,

            y:
                data.y,

            w:
                data.w,

            h:
                data.h,

            solid:
                data.solid !==
                false,

            blocksLight:
                Boolean(
                    data.blocksLight
                ),

            treeId:
                data.treeId ||
                null,

            buildingId:
                data.buildingId ||
                null,

            gateSide:
                data.gateSide ||
                null

        };


        state.world
            .obstacles
            .push(
                obstacle
            );


        return obstacle;

    }


    function removeObstacleById(
        id
    ) {

        state.world.obstacles =
            state.world
                .obstacles
                .filter(
                    obstacle =>
                        obstacle.id !==
                        id
                );

    }


    /* =========================================================
       HITBOX DA ÁRVORE — V20

       DUAS PARTES:
       1. tronco
       2. região inferior da copa

       Resolve o problema de conseguir andar
       em cima da parte visual das folhas.
       ========================================================= */

    function treeCollisionAt(
        x,
        y,
        radius,
        tree
    ) {

        if (
            !tree ||
            tree.alive ===
            false
        ) {

            return false;

        }


        const trunkRadius =
            tree.trunkRadius ??
            VISUAL_CONFIG
                .tree
                .trunkRadius;


        const canopyRadius =
            tree.canopyCollisionRadius ??
            VISUAL_CONFIG
                .tree
                .canopyCollisionRadius;


        const canopyOffsetY =
            tree.canopyCollisionOffsetY ??
            VISUAL_CONFIG
                .tree
                .canopyCollisionOffsetY;


        /*
            Tronco.
        */
        if (
            circleCircleCollision(

                x,
                y,
                radius,

                tree.x,

                tree.y + 18,

                trunkRadius

            )
        ) {

            return true;

        }


        /*
            Copa inferior.

            Não usamos toda a copa visual porque isso
            faria florestas ficarem travadas demais.
        */
        return circleCircleCollision(

            x,
            y,
            radius,

            tree.x,

            tree.y +
            canopyOffsetY,

            canopyRadius

        );

    }


    function circleHitsSolidObstacle(
        x,
        y,
        radius
    ) {

        for (
            const obstacle of
            state.world.obstacles
        ) {

            if (
                obstacle.solid ===
                false
            ) {

                continue;

            }


            if (
                obstacle.type ===
                "tree"
            ) {

                const tree =
                    state.world
                        .trees
                        .find(
                            item =>
                                item.id ===
                                obstacle.treeId
                        );


                if (
                    treeCollisionAt(

                        x,
                        y,
                        radius,
                        tree

                    )
                ) {

                    return true;

                }


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


        return false;

    }


    /* =========================================================
       GERAÇÃO SEGURA
       ========================================================= */

    function isSpawnPositionSafe(
        x,
        y,
        radius,
        options = {}
    ) {

        const margin =
            options.margin ??
            GAME_CONFIG.worldMargin;


        if (

            x - radius <
            margin ||

            y - radius <
            margin ||

            x + radius >
            state.world.width -
            margin ||

            y + radius >
            state.world.height -
            margin

        ) {

            return false;

        }


        if (
            options.avoidProtected !==
            false
        ) {

            if (
                isReservedSpawnZone(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }

        }


        if (
            circleHitsSolidObstacle(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        if (
            options.avoidEntities
        ) {

            for (
                const tree of
                state.world.trees
            ) {

                if (
                    tree.alive ===
                    false
                ) {

                    continue;

                }


                if (
                    distance(

                        x,
                        y,

                        tree.x,
                        tree.y

                    ) <

                    radius +
                    (
                        tree.radius ||
                        45
                    ) +
                    15
                ) {

                    return false;

                }

            }


            for (
                const resource of
                state.world.resources
            ) {

                if (
                    resource.alive ===
                    false
                ) {

                    continue;

                }


                if (
                    distance(

                        x,
                        y,

                        resource.x,
                        resource.y

                    ) <

                    radius +
                    (
                        resource.radius ||
                        18
                    ) +
                    12
                ) {

                    return false;

                }

            }


            for (
                const enemy of
                state.world.enemies
            ) {

                if (
                    enemy.dead
                ) {

                    continue;

                }


                if (
                    distance(

                        x,
                        y,

                        enemy.x,
                        enemy.y

                    ) <

                    radius +
                    (
                        enemy.radius ||
                        20
                    ) +
                    18
                ) {

                    return false;

                }

            }

        }


        return true;

    }


    function findSafeSpawnPosition(
        rng,
        options = {}
    ) {

        const radius =
            options.radius ||
            25;


        const minX =
            options.minX ??
            GAME_CONFIG.worldMargin +
            70;


        const maxX =
            options.maxX ??
            state.world.width -
            GAME_CONFIG.worldMargin -
            70;


        const minY =
            options.minY ??
            GAME_CONFIG.worldMargin +
            70;


        const maxY =
            options.maxY ??
            state.world.height -
            GAME_CONFIG.worldMargin -
            70;


        const attempts =
            options.attempts ||
            180;


        for (
            let attempt = 0;
            attempt < attempts;
            attempt++
        ) {

            const x =
                rngRange(
                    rng,
                    minX,
                    maxX
                );


            const y =
                rngRange(
                    rng,
                    minY,
                    maxY
                );


            if (
                isSpawnPositionSafe(

                    x,
                    y,
                    radius,

                    {

                        avoidProtected:
                            options.avoidProtected !==
                            false,

                        avoidEntities:
                            options.avoidEntities !==
                            false

                    }

                )
            ) {

                return {
                    x,
                    y
                };

            }

        }


        return null;

    }


    /* =========================================================
       PROCURA POSIÇÃO SEGURA PRÓXIMA

       Usada no respawn e ao entrar numa região.
       ========================================================= */

    function findNearestSafePosition(
        startX,
        startY,
        radius = 18
    ) {

        if (
            isSpawnPositionSafe(

                startX,
                startY,
                radius,

                {
                    avoidProtected:
                        false,

                    avoidEntities:
                        false
                }

            )
        ) {

            return {

                x:
                    startX,

                y:
                    startY

            };

        }


        const rings = [

            24,
            40,
            60,
            85,
            115,
            150,
            190,
            235

        ];


        for (
            const ring of rings
        ) {

            const samples =
                18;


            for (
                let i = 0;
                i < samples;
                i++
            ) {

                const angle =

                    (
                        i /
                        samples
                    ) *

                    Math.PI *
                    2;


                const x =

                    startX +

                    Math.cos(
                        angle
                    ) *
                    ring;


                const y =

                    startY +

                    Math.sin(
                        angle
                    ) *
                    ring;


                if (
                    isSpawnPositionSafe(

                        x,
                        y,
                        radius,

                        {
                            avoidProtected:
                                false,

                            avoidEntities:
                                false
                        }

                    )
                ) {

                    return {
                        x,
                        y
                    };

                }

            }

        }


        return null;

    }


    function repairPlayerPositionIfStuck() {

        if (
            !state.player ||
            state.houseMode
        ) {

            return false;

        }


        if (
            !circleHitsSolidObstacle(

                state.player.x,

                state.player.y,

                state.player.radius

            )
        ) {

            return false;

        }


        const safe =
            findNearestSafePosition(

                state.player.x,

                state.player.y,

                state.player.radius

            );


        if (!safe) {

            return false;

        }


        state.player.x =
            safe.x;


        state.player.y =
            safe.y;


        state.debug
            .lastSafeRepair =
            state.time;


        return true;

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function addTree(
        data
    ) {

        const tree = {

            id:
                data.id ||
                uid("tree"),

            type:
                data.type ||
                "tree",

            x:
                data.x,

            y:
                data.y,

            homeX:
                data.homeX ??
                data.x,

            homeY:
                data.homeY ??
                data.y,

            alive:
                data.alive !==
                false,

            respawn:
                data.respawn ||
                44,

            respawnTimer:
                0,

            radius:
                data.radius ||
                VISUAL_CONFIG
                    .tree
                    .generationRadius,

            trunkRadius:
                data.trunkRadius ??
                VISUAL_CONFIG
                    .tree
                    .trunkRadius,

            canopyCollisionRadius:
                data.canopyCollisionRadius ??
                VISUAL_CONFIG
                    .tree
                    .canopyCollisionRadius,

            canopyCollisionOffsetY:
                data.canopyCollisionOffsetY ??
                VISUAL_CONFIG
                    .tree
                    .canopyCollisionOffsetY

        };


        state.world
            .trees
            .push(
                tree
            );


        /*
            Este retângulo existe só para o sistema
            geral de mundo saber onde a árvore está.

            A colisão real usa treeCollisionAt().
        */
        addObstacle({

            id:
                `tree_obstacle_${tree.id}`,

            type:
                "tree",

            x:
                tree.x - 40,

            y:
                tree.y - 52,

            w:
                80,

            h:
                98,

            solid:
                true,

            treeId:
                tree.id

        });


        return tree;

    }


    function addGeneratedTree(
        rng,
        id,
        options = {}
    ) {

        const generationRadius =
            options.safeRadius ||
            VISUAL_CONFIG
                .tree
                .generationRadius;


        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:

                        generationRadius +

                        VISUAL_CONFIG
                            .tree
                            .pathClearance,

                    minX:
                        options.minX,

                    maxX:
                        options.maxX,

                    minY:
                        options.minY,

                    maxY:
                        options.maxY,

                    avoidEntities:
                        true

                }

            );


        if (!position) {

            return null;

        }


        return addTree({

            id,

            type:
                options.type ||
                "tree",

            x:
                position.x,

            y:
                position.y,

            radius:
                generationRadius

        });

    }


    /* =========================================================
       PEDRAS
       ========================================================= */

    function addGeneratedRock(
        rng,
        id,
        options = {}
    ) {

        const width =
            options.w ||
            rngRange(
                rng,
                48,
                90
            );


        const height =
            options.h ||
            rngRange(
                rng,
                38,
                74
            );


        const radius =

            Math.max(
                width,
                height
            ) *
            0.62;


        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        radius + 22,

                    minX:
                        options.minX,

                    maxX:
                        options.maxX,

                    minY:
                        options.minY,

                    maxY:
                        options.maxY,

                    avoidEntities:
                        true

                }

            );


        if (!position) {

            return null;

        }


        return addObstacle({

            id,

            type:
                options.type ||
                "rock",

            x:
                position.x -
                width /
                2,

            y:
                position.y -
                height /
                2,

            w:
                width,

            h:
                height,

            solid:
                true,

            blocksLight:
                Boolean(
                    options.blocksLight
                )

        });

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    function addResource(
        data
    ) {

        const resource = {

            id:
                data.id ||
                uid("resource"),

            type:
                data.type,

            x:
                data.x,

            y:
                data.y,

            homeX:
                data.homeX ??
                data.x,

            homeY:
                data.homeY ??
                data.y,

            radius:
                data.radius ||
                18,

            alive:
                data.alive !==
                false,

            respawn:
                data.respawn ||
                32,

            respawnTimer:
                0,

            collectTime:
                data.collectTime ||
                GAME_CONFIG
                    .resourceHoldSeconds,

            amountMin:
                data.amountMin ||
                1,

            amountMax:
                data.amountMax ||
                2

        };


        state.world
            .resources
            .push(
                resource
            );


        return resource;

    }


    function addGeneratedResource(
        rng,
        id,
        type,
        options = {}
    ) {

        const radius =
            options.radius ||
            20;


        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        radius + 18,

                    minX:
                        options.minX,

                    maxX:
                        options.maxX,

                    minY:
                        options.minY,

                    maxY:
                        options.maxY,

                    avoidEntities:
                        true

                }

            );


        if (!position) {

            return null;

        }


        return addResource({

            id,

            type,

            x:
                position.x,

            y:
                position.y,

            radius,

            respawn:
                options.respawn,

            collectTime:
                options.collectTime,

            amountMin:
                options.amountMin,

            amountMax:
                options.amountMax

        });

    }


    /* =========================================================
       COMIDA
       ========================================================= */

    function addFood(
        data
    ) {

        const food = {

            id:
                data.id ||
                uid("food"),

            type:
                data.type,

            x:
                data.x,

            y:
                data.y,

            homeX:
                data.homeX ??
                data.x,

            homeY:
                data.homeY ??
                data.y,

            radius:
                data.radius ||
                14,

            alive:
                data.alive !==
                false,

            respawn:
                data.respawn ||
                35,

            respawnTimer:
                0

        };


        state.world
            .foods
            .push(
                food
            );


        return food;

    }


    /* =========================================================
       DECORAÇÃO NÃO SÓLIDA
       ========================================================= */

    function addDecoration(
        x,
        y,
        type,
        options = {}
    ) {

        const decoration = {

            id:
                options.id ||
                uid("decor"),

            x,

            y,

            type,

            size:
                options.size ||
                10,

            angle:
                options.angle ||
                0,

            radius:
                options.radius ||
                0,

            solid:
                false,

            hiddenWithoutLantern:
                Boolean(
                    options.hiddenWithoutLantern
                ),

            large:
                Boolean(
                    options.large
                )

        };


        state.world
            .decorations
            .push(
                decoration
            );


        return decoration;

    }


    function addBiomeDetails(
        rng,
        count,
        types,
        options = {}
    ) {

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const x =
                rngRange(

                    rng,

                    options.minX ??
                    90,

                    options.maxX ??
                    state.world.width -
                    90

                );


            const y =
                rngRange(

                    rng,

                    options.minY ??
                    90,

                    options.maxY ??
                    state.world.height -
                    90

                );


            if (
                options.avoidProtected &&
                isReservedSpawnZone(
                    x,
                    y,
                    8
                )
            ) {

                continue;

            }


            const type =
                types[
                    rngInt(
                        rng,
                        0,
                        types.length - 1
                    )
                ];


            addDecoration(

                x,
                y,
                type,

                {

                    size:
                        rngRange(

                            rng,

                            options.minSize ||
                            4,

                            options.maxSize ||
                            14

                        ),

                    angle:
                        rngRange(

                            rng,

                            0,

                            Math.PI *
                            2

                        )

                }

            );

        }

    }


    /* =========================================================
       EDIFÍCIOS
       ========================================================= */

    function buildBuildingCollision(
        building
    ) {

        /*
            Exterior:
            a construção inteira é sólida,
            exceto uma faixa aberta exatamente
            onde fica a porta.

            Assim:
            - porta continua acessível;
            - não há parede invisível em cima dela.
        */

        const doorwayWidth =
            96;


        const doorwayDepth =
            42;


        const centerX =

            building.x +

            building.w /
            2;


        const gapLeft =

            centerX -

            doorwayWidth /
            2;


        const gapRight =

            centerX +

            doorwayWidth /
            2;


        /*
            Corpo principal.
        */
        addObstacle({

            id:
                `${building.id}_body`,

            type:
                "building",

            x:
                building.x,

            y:
                building.y,

            w:
                building.w,

            h:
                building.h -
                doorwayDepth,

            solid:
                true,

            buildingId:
                building.id

        });


        /*
            Rodapé esquerdo.
        */
        addObstacle({

            id:
                `${building.id}_doorwall_left`,

            type:
                "building",

            x:
                building.x,

            y:
                building.y +
                building.h -
                doorwayDepth,

            w:
                Math.max(
                    0,
                    gapLeft -
                    building.x
                ),

            h:
                doorwayDepth,

            solid:
                true,

            buildingId:
                building.id

        });


        /*
            Rodapé direito.
        */
        addObstacle({

            id:
                `${building.id}_doorwall_right`,

            type:
                "building",

            x:
                gapRight,

            y:
                building.y +
                building.h -
                doorwayDepth,

            w:
                Math.max(

                    0,

                    building.x +
                    building.w -
                    gapRight

                ),

            h:
                doorwayDepth,

            solid:
                true,

            buildingId:
                building.id

        });

    }


    function createExteriorDoor(
        building
    ) {

        const width =
            82;


        const height =
            70;


        const x =

            building.x +

            building.w /
            2 -

            width /
            2;


        const y =

            building.y +

            building.h -

            27;


        const door = {

            id:
                `door_${building.id}`,

            buildingId:
                building.id,

            x,

            y,

            w:
                width,

            h:
                height,

            open:
                false,

            animation:
                0,

            targetAnimation:
                0

        };


        state.world
            .doors
            .push(
                door
            );


        addProtectedZone(

            x +
            width /
            2,

            y +
            height /
            2 +
            35,

            115,

            `door_${building.id}`

        );


        return door;

    }


    function addBuilding(
        data
    ) {

        const building = {

            id:
                data.id,

            name:
                data.name,

            x:
                data.x,

            y:
                data.y,

            w:
                data.w,

            h:
                data.h,

            color:
                data.color ||
                "#755841",

            roof:
                data.roof ||
                "#4f382c",

            enterable:
                data.enterable !==
                false,

            interiorId:
                data.interiorId ||
                data.id,

            doorSide:
                "south"

        };


        state.world
            .buildings
            .push(
                building
            );


        buildBuildingCollision(
            building
        );


        if (
            building.enterable
        ) {

            createExteriorDoor(
                building
            );

        }


        return building;

    }


    /* =========================================================
       PORTÕES — V20

       FECHADO:
       bloqueia centro + cantos.

       ABERTO:
       TODAS as hitboxes do portão somem.
       ========================================================= */

    function createGate(
        data
    ) {

        const gate = {

            id:
                data.id ||
                `gate_${data.side}`,

            side:
                data.side,

            x:
                data.x,

            y:
                data.y,

            w:
                data.w,

            h:
                data.h,

            title:
                data.title ||
                "PORTÃO",

            collisionIds:
                []

        };


        state.world
            .gates
            .push(
                gate
            );


        addProtectedZone(

            gate.x +
            gate.w /
            2,

            gate.y +
            gate.h /
            2,

            Math.max(
                gate.w,
                gate.h
            ) /
            2 +

            VISUAL_CONFIG
                .gate
                .approachClearance,

            `gate_${gate.side}`

        );


        rebuildGateCollision(
            gate
        );


        return gate;

    }


    function removeGateCollision(
        gate
    ) {

        const ids =
            new Set(
                gate.collisionIds ||
                []
            );


        state.world.obstacles =
            state.world
                .obstacles
                .filter(
                    obstacle =>
                        !ids.has(
                            obstacle.id
                        )
                );


        gate.collisionIds =
            [];

    }


    function rebuildGateCollision(
        gate
    ) {

        removeGateCollision(
            gate
        );


        const unlocked =
            Boolean(

                state.player
                    ?.gateUnlocks
                    ?.[gate.side]

            );


        /*
            IMPORTANTE:
            abriu = ZERO colisão.
        */
        if (
            unlocked
        ) {

            return;

        }


        const mainId =
            `gate_collision_${gate.side}`;


        addObstacle({

            id:
                mainId,

            type:
                "gate",

            x:
                gate.x,

            y:
                gate.y,

            w:
                gate.w,

            h:
                gate.h,

            solid:
                true,

            gateSide:
                gate.side

        });


        gate.collisionIds
            .push(
                mainId
            );


        const pillar =
            VISUAL_CONFIG
                .gate
                .pillarSize;


        /*
            Portão horizontal.
        */
        if (
            gate.w >
            gate.h
        ) {

            const leftId =
                `gate_pillar_${gate.side}_left`;


            const rightId =
                `gate_pillar_${gate.side}_right`;


            addObstacle({

                id:
                    leftId,

                type:
                    "gatePillar",

                x:
                    gate.x -
                    pillar,

                y:
                    gate.y -
                    12,

                w:
                    pillar,

                h:
                    gate.h +
                    24,

                solid:
                    true,

                gateSide:
                    gate.side

            });


            addObstacle({

                id:
                    rightId,

                type:
                    "gatePillar",

                x:
                    gate.x +
                    gate.w,

                y:
                    gate.y -
                    12,

                w:
                    pillar,

                h:
                    gate.h +
                    24,

                solid:
                    true,

                gateSide:
                    gate.side

            });


            gate.collisionIds
                .push(
                    leftId,
                    rightId
                );


            return;

        }


        /*
            Portão vertical.
        */
        const topId =
            `gate_pillar_${gate.side}_top`;


        const bottomId =
            `gate_pillar_${gate.side}_bottom`;


        addObstacle({

            id:
                topId,

            type:
                "gatePillar",

            x:
                gate.x -
                12,

            y:
                gate.y -
                pillar,

            w:
                gate.w +
                24,

            h:
                pillar,

            solid:
                true,

            gateSide:
                gate.side

        });


        addObstacle({

            id:
                bottomId,

            type:
                "gatePillar",

            x:
                gate.x -
                12,

            y:
                gate.y +
                gate.h,

            w:
                gate.w +
                24,

            h:
                pillar,

            solid:
                true,

            gateSide:
                gate.side

        });


        gate.collisionIds
            .push(
                topId,
                bottomId
            );

    }


    function refreshGateCollisions() {

        for (
            const gate of
            state.world.gates
        ) {

            rebuildGateCollision(
                gate
            );

        }

    }


    /* =========================================================
       PORTAIS
       ========================================================= */

    function addPortal(
        x,
        y,
        w,
        h,
        target,
        requirement = null,
        title = "",
        options = {}
    ) {

        const portal = {

            id:
                options.id ||
                uid("portal"),

            x,
            y,
            w,
            h,

            target,

            requirement,

            title,

            spawn:
                options.spawn ||
                null,

            hidden:
                Boolean(
                    options.hidden
                )

        };


        state.world
            .portals
            .push(
                portal
            );


        addProtectedZone(

            x +
            w /
            2,

            y +
            h /
            2,

            Math.max(
                w,
                h
            ) /
            2 +
            95,

            `portal_${portal.id}`

        );


        return portal;

    }


    /* =========================================================
       NPCs
       ========================================================= */

    function addNPC(
        data
    ) {

        const npc = {

            id:
                data.id ||
                uid("npc"),

            name:
                data.name ||
                "NPC",

            x:
                data.x,

            y:
                data.y,

            homeX:
                data.homeX ??
                data.x,

            homeY:
                data.homeY ??
                data.y,

            targetX:
                data.x,

            targetY:
                data.y,

            radius:
                data.radius ||
                18,

            wander:
                data.wander ||
                0,

            wanderTimer:
                0,

            spriteType:
                data.spriteType ||
                "villager",

            color:
                data.color ||
                "#8d765d",

            lines:
                data.lines ||
                [],

            merchant:
                Boolean(
                    data.merchant
                ),

            blacksmith:
                Boolean(
                    data.blacksmith
                ),

            questId:
                data.questId ||
                null,

            mysterious:
                Boolean(
                    data.mysterious
                ),

            requiresDash:
                Boolean(
                    data.requiresDash
                ),

            beforeDashLines:
                data.beforeDashLines ||
                null,

            afterDashLines:
                data.afterDashLines ||
                null,

            vendorConfig:
                data.vendorConfig ||
                null

        };


        state.world.npcs
            .push(
                npc
            );


        addProtectedZone(

            npc.x,
            npc.y,

            46,

            `npc_${npc.id}`

        );


        return npc;

    }


    /* =========================================================
       INIMIGOS
       ========================================================= */

    function addEnemy(
        data
    ) {

        const maxHp =
            data.maxHp ??
            data.hp ??
            100;


        const bossDefinition =
            getBossDefinition(
                data.id
            );


        const enemy = {

            id:
                data.id ||
                uid("enemy"),

            name:
                data.name ||
                bossDefinition?.name ||
                "INIMIGO",

            spriteType:
                data.spriteType ||
                "enemy",

            icon:
                data.icon ||
                bossDefinition?.icon ||
                "◆",

            imageStyle:
                data.imageStyle ||
                bossDefinition?.imageStyle ||
                null,

            type:
                data.type ||
                "normal",

            x:
                data.x,

            y:
                data.y,

            homeX:
                data.homeX ??
                data.x,

            homeY:
                data.homeY ??
                data.y,

            hp:
                data.hp ??
                maxHp,

            maxHp,

            damage:
                data.damage ||
                10,

            speed:
                data.speed ??
                70,

            vision:
                data.vision ||
                280,

            attackRange:
                data.attackRange ||
                65,

            radius:
                data.radius ||
                VISUAL_CONFIG
                    .normalEnemyRadius,

            color:
                data.color ||
                "#8a665b",

            xp:
                data.xp ||
                0,

            money:
                data.money ||
                0,

            drop:
                data.drop ||
                null,

            dropAmount:
                data.dropAmount ||
                1,

            dropChance:
                data.dropChance ??
                0,

            aggressive:
                Boolean(
                    data.aggressive
                ),

            accepted:
                data.accepted ??
                (
                    data.type !==
                    "progression"
                ),

            state:
                "idle",

            dead:
                false,

            attackCooldown:
                0,

            specialCooldown:
                data.specialCooldown ||
                1.4,

            hitFlash:
                0,

            stunTimer:
                0,

            shield:
                0,

            shieldTimer:
                0,

            charge:
                null,

            bossPattern:
                data.bossPattern ||
                null,

            unlock:
                data.unlock ||
                null,

            stationary:
                Boolean(
                    data.stationary
                ),

            monarchClone:
                Boolean(
                    data.monarchClone
                ),

            monarchHits:
                0,

            monarchStagger:
                0,

            cloneCooldown:
                0,

            hellType:
                data.hellType ||
                null,

            skyWave:
                data.skyWave ||
                null,

            finalBoss:
                Boolean(
                    data.finalBoss
                ),

            respawnTime:
                data.respawnTime ||
                0,

            respawnTimer:
                0

        };


        state.world
            .enemies
            .push(
                enemy
            );


        return enemy;

    }


    function spawnProgressionBoss(
        data
    ) {

        const definition =
            getBossDefinition(
                data.id
            );


        return addEnemy({

            ...data,

            name:
                data.name ||
                definition?.name,

            icon:
                data.icon ||
                definition?.icon,

            imageStyle:
                data.imageStyle ||
                definition?.imageStyle,

            type:
                "progression",

            accepted:
                false,

            aggressive:
                false

        });

    }


    function hasDefeatedBoss(
        id
    ) {

        return Boolean(

            state.player
                ?.defeatedBosses
                ?.includes(
                    id
                )

        );

    }


    /* =========================================================
       INIMIGOS NORMAIS DA ROTA 1
       ========================================================= */

    const ENEMY_TYPES =
        Object.freeze({

            wolf: {

                name:
                    "LOBO",

                spriteType:
                    "wolf",

                hp:
                    78,

                damage:
                    12,

                speed:
                    95,

                vision:
                    260,

                attackRange:
                    58,

                radius:
                    19,

                color:
                    "#6f6d65",

                xp:
                    18,

                money:
                    5

            },


            boar: {

                name:
                    "JAVALI",

                spriteType:
                    "boar",

                hp:
                    110,

                damage:
                    16,

                speed:
                    82,

                vision:
                    250,

                attackRange:
                    62,

                radius:
                    23,

                color:
                    "#6a4e3d",

                xp:
                    24,

                money:
                    7

            },


            thornling: {

                name:
                    "ESPINHEIRO",

                spriteType:
                    "thornling",

                hp:
                    105,

                damage:
                    18,

                speed:
                    72,

                vision:
                    270,

                attackRange:
                    65,

                radius:
                    20,

                color:
                    "#557044",

                xp:
                    28,

                money:
                    9

            },


            stoneCrawler: {

                name:
                    "RASTEJANTE DE PEDRA",

                spriteType:
                    "stoneCrawler",

                hp:
                    145,

                damage:
                    21,

                speed:
                    64,

                vision:
                    270,

                attackRange:
                    67,

                radius:
                    23,

                color:
                    "#73756f",

                xp:
                    35,

                money:
                    12

            },


            mineCrawler: {

                name:
                    "RASTEJANTE DA MINA",

                spriteType:
                    "mineCrawler",

                hp:
                    165,

                damage:
                    24,

                speed:
                    68,

                vision:
                    280,

                attackRange:
                    68,

                radius:
                    23,

                color:
                    "#55514c",

                xp:
                    40,

                money:
                    14

            },


            rubyHound: {

                name:
                    "CÃO RUBRO",

                spriteType:
                    "rubyHound",

                hp:
                    205,

                damage:
                    29,

                speed:
                    100,

                vision:
                    320,

                attackRange:
                    70,

                radius:
                    23,

                color:
                    "#854052",

                xp:
                    50,

                money:
                    18

            },


            spider: {

                name:
                    "ARANHA DA CAVERNA",

                spriteType:
                    "spider",

                hp:
                    120,

                damage:
                    21,

                speed:
                    90,

                vision:
                    270,

                attackRange:
                    60,

                radius:
                    19,

                color:
                    "#56495d",

                xp:
                    30,

                money:
                    7

            },


            scorpion: {

                name:
                    "ESCORPIÃO NEGRO",

                spriteType:
                    "scorpion",

                hp:
                    155,

                damage:
                    26,

                speed:
                    76,

                vision:
                    280,

                attackRange:
                    70,

                radius:
                    21,

                color:
                    "#65516c",

                xp:
                    36,

                money:
                    9

            },


            bat: {

                name:
                    "MORCEGO DA CAVERNA",

                spriteType:
                    "bat",

                hp:
                    85,

                damage:
                    17,

                speed:
                    115,

                vision:
                    330,

                attackRange:
                    145,

                radius:
                    17,

                color:
                    "#554863",

                xp:
                    26,

                money:
                    6

            }

        });


    function spawnEnemyType(
        rng,
        type,
        index,
        options = {}
    ) {

        const config =
            ENEMY_TYPES[
                type
            ];


        if (!config) {

            return null;

        }


        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        config.radius +
                        20,

                    minX:
                        options.minX,

                    maxX:
                        options.maxX,

                    minY:
                        options.minY,

                    maxY:
                        options.maxY,

                    avoidEntities:
                        true

                }

            );


        if (!position) {

            return null;

        }


        return addEnemy({

            ...config,

            id:
                options.id ||
                `${state.area}_${type}_${index}`,

            x:
                position.x,

            y:
                position.y,

            drop:
                options.drop ||
                null,

            dropChance:
                options.dropChance ??
                0,

            dropAmount:
                options.dropAmount ||
                1

        });

    }


    /* =========================================================
       DEFAULT SPAWNS
       ========================================================= */

    function getDefaultSpawn(
        area
    ) {

        const spawns = {

            village: {

                x:
                    1600,

                y:
                    1850,

                facing:
                    "up"

            },


            forest: {

                x:
                    185,

                y:
                    1150,

                facing:
                    "right"

            },


            grove: {

                x:
                    185,

                y:
                    1160,

                facing:
                    "right"

            },


            mountains: {

                x:
                    185,

                y:
                    1160,

                facing:
                    "right"

            },


            iron: {

                x:
                    185,

                y:
                    1120,

                facing:
                    "right"

            },


            ruby: {

                x:
                    185,

                y:
                    1120,

                facing:
                    "right"

            },


            monarchMaze: {

                x:
                    185,

                y:
                    1120,

                facing:
                    "right"

            },


            shadow: {

                x:
                    1600,

                y:
                    1900,

                facing:
                    "up"

            },


            fairy: {

                x:
                    180,

                y:
                    1120,

                facing:
                    "right"

            },


            sky: {

                x:
                    180,

                y:
                    1120,

                facing:
                    "right"

            },


            hell: {

                x:
                    1850,

                y:
                    2200,

                facing:
                    "up"

            },


            final: {

                x:
                    1100,

                y:
                    1320,

                facing:
                    "up"

            }

        };


        return (

            spawns[
                area
            ] ||

            spawns.village

        );

    }


    /* =========================================================
       ENTRAR NA CASA
       ========================================================= */

    function enterHouseImmediate(
        building,
        startingGame = false
    ) {

        if (!building) {

            return;

        }


        state.houseMode =
            true;


        state.currentHouse =
            building;


        if (
            !startingGame &&
            !state.houseReturn
        ) {

            state.houseReturn = {

                area:
                    state.area,

                x:
                    state.player.x,

                y:
                    state.player.y

            };

        }


        const spec =
            getHouseSpec(
                building
            );


        if (!spec) {

            return;

        }


        state.player.x =
            spec.playerSpawn.x;


        state.player.y =
            spec.playerSpawn.y;


        state.player.facing =
            "up";

    }


    function enterHouse(
        building
    ) {

        if (
            !building?.enterable ||
            state.transition
        ) {

            return;

        }


        const previousPosition = {

            area:
                state.area,

            x:
                state.player.x,

            y:
                state.player.y

        };


        startTransition({

            label:
                building.name,

            fadeOut:
                0.42,

            hold:
                0.12,

            fadeIn:
                0.5,

            onMidpoint:
                () => {

                    state.houseReturn =
                        previousPosition;


                    enterHouseImmediate(
                        building,
                        false
                    );

                }

        });

    }


    function exitHouse() {

        if (
            !state.houseMode ||
            !state.currentHouse ||
            state.transition
        ) {

            return;

        }


        const building =
            state.currentHouse;


        const returnData =
            state.houseReturn;


        const exteriorDoor =
            state.world
                .doors
                .find(
                    door =>
                        door.buildingId ===
                        building.id
                );


        startTransition({

            label:
                "VILA DO CREPÚSCULO",

            fadeOut:
                0.4,

            hold:
                0.12,

            fadeIn:
                0.5,

            onMidpoint:
                () => {

                    state.houseMode =
                        false;


                    state.currentHouse =
                        null;


                    if (returnData) {

                        state.player.x =
                            returnData.x;


                        state.player.y =
                            returnData.y;

                    }

                    else if (
                        exteriorDoor
                    ) {

                        state.player.x =

                            exteriorDoor.x +

                            exteriorDoor.w /
                            2;


                        state.player.y =

                            exteriorDoor.y +

                            exteriorDoor.h +

                            58;

                    }


                    state.player.facing =
                        "down";


                    state.houseReturn =
                        null;


                    repairPlayerPositionIfStuck();

                }

        });

    }


    /* =========================================================
       TROCA DE REGIÃO
       ========================================================= */

    function transitionToRegion(
        target,
        options = {}
    ) {

        if (
            !REGIONS[
                target
            ] ||
            state.transition
        ) {

            return;

        }


        startTransition({

            label:
                options.label ||
                REGIONS[
                    target
                ].name,

            fadeOut:
                0.48,

            hold:
                0.18,

            fadeIn:
                0.58,

            onMidpoint:
                () => {

                    state.houseMode =
                        false;


                    state.currentHouse =
                        null;


                    state.houseReturn =
                        null;


                    state.area =
                        target;


                    buildWorld();


                    const spawn =
                        options.spawn ||
                        getDefaultSpawn(
                            target
                        );


                    state.player.x =
                        spawn.x;


                    state.player.y =
                        spawn.y;


                    state.player.facing =
                        spawn.facing ||
                        "down";


                    state.portalCooldown =
                        1;


                    if (
                        !state.player
                            .exploredAreas
                            .includes(
                                target
                            )
                    ) {

                        state.player
                            .exploredAreas
                            .push(
                                target
                            );

                    }


                    repairPlayerPositionIfStuck();

                }

        });

    }


    /* =========================================================
       BUILD WORLD
       ========================================================= */

    function buildWorld() {

        state.world =
            createEmptyWorld(
                state.area
            );


        state.bossBarTarget =
            null;


        switch (
            state.area
        ) {

            case "village":
                buildVillage();
                break;


            case "forest":
                buildForest();
                break;


            case "grove":
                buildGrove();
                break;


            case "mountains":
                buildMountains();
                break;


            case "iron":
                buildIron();
                break;


            case "ruby":
                buildRuby();
                break;


            case "monarchMaze":
                buildMonarchMaze();
                break;


            /*
                Implementações completas entram
                na Parte 4.
            */
            case "shadow":
                buildShadow();
                break;


            case "fairy":
                buildFairy();
                break;


            case "sky":
                buildSky();
                break;


            case "hell":
                buildHell();
                break;


            case "final":
                buildFinal();
                break;


            default:
                throw new Error(
                    `VEYRA V20: build desconhecido ${state.area}`
                );

        }


        ensureWorldRuntimeArrays();


        refreshGateCollisions();

    }


    /* =========================================================
       VILA
       ========================================================= */

    function buildVillage() {

        const rng =
            getAreaRng(
                "village",
                "layout"
            );


        /* -----------------------------------------------------
           CAMINHO NORTE/SUL
           ----------------------------------------------------- */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        1600,
                    y:
                        2140
                },

                {
                    x:
                        1600,
                    y:
                        1560
                },

                {
                    x:
                        1600,
                    y:
                        1100
                },

                {
                    x:
                        1600,
                    y:
                        100
                }

            ],

            145

        );


        /* -----------------------------------------------------
           CAMINHO OESTE/LESTE
           ----------------------------------------------------- */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        100,
                    y:
                        1100
                },

                {
                    x:
                        1600,
                    y:
                        1100
                },

                {
                    x:
                        3090,
                    y:
                        1100
                }

            ],

            145

        );


        /* -----------------------------------------------------
           CASA DO PLAYER
           ----------------------------------------------------- */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        915,
                    y:
                        1100
                },

                {
                    x:
                        765,
                    y:
                        1380
                },

                {
                    x:
                        615,
                    y:
                        1585
                }

            ],

            90

        );


        /* -----------------------------------------------------
           FORJA
           ----------------------------------------------------- */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        2260,
                    y:
                        1100
                },

                {
                    x:
                        2450,
                    y:
                        1400
                },

                {
                    x:
                        2615,
                    y:
                        1585
                }

            ],

            90

        );


        /* =====================================================
           PRAÇA / FONTE
           ===================================================== */

        addProtectedZone(

            1600,
            1100,

            300,

            "village_plaza"

        );


        addDecoration(

            1600,
            1100,

            "plazaRing",

            {
                radius:
                    235
            }

        );


        addDecoration(

            1600,
            1100,

            "fountainMist",

            {
                radius:
                    125
            }

        );


        addObstacle({

            id:
                "village_fountain",

            type:
                "fountain",

            x:
                1500,

            y:
                1015,

            w:
                200,

            h:
                170,

            solid:
                true

        });


        /* =====================================================
           CONSTRUÇÕES
           ===================================================== */

        addBuilding({

            id:
                "home",

            name:
                "SUA CASA",

            x:
                365,

            y:
                1510,

            w:
                460,

            h:
                330,

            color:
                "#77583f",

            roof:
                "#4d382e",

            interiorId:
                "home"

        });


        addBuilding({

            id:
                "elianHome",

            name:
                "CASA DE ELIAN",

            x:
                420,

            y:
                370,

            w:
                435,

            h:
                310,

            color:
                "#6e5744",

            roof:
                "#493b33",

            interiorId:
                "elianHome"

        });


        addBuilding({

            id:
                "shop",

            name:
                "LOJA DE DORAN",

            x:
                2365,

            y:
                360,

            w:
                470,

            h:
                325,

            color:
                "#765237",

            roof:
                "#583c2e",

            interiorId:
                "shop"

        });


        addBuilding({

            id:
                "forge",

            name:
                "FORJA DE BORIN",

            x:
                2395,

            y:
                1490,

            w:
                470,

            h:
                335,

            color:
                "#59504a",

            roof:
                "#363437",

            interiorId:
                "forge"

        });


        addBuilding({

            id:
                "woodshop",

            name:
                "CARPINTARIA DE BRAN",

            x:
                1000,

            y:
                1585,

            w:
                440,

            h:
                300,

            color:
                "#705239",

            roof:
                "#4b372c",

            interiorId:
                "woodshop"

        });


        /* =====================================================
           NPCs EXTERNOS

           DORAN, BORIN E BRAN:
           SOMENTE DENTRO DAS CONSTRUÇÕES.
           ===================================================== */

        addNPC({

            ...NPC_LIBRARY.ELIAN,

            x:
                950,

            y:
                900,

            wander:
                65

        });


        addNPC({

            ...NPC_LIBRARY.MARA,

            x:
                1840,

            y:
                1360,

            wander:
                55

        });


        /* =====================================================
           MIGUEL

           Ele já existe,
           mas não inventamos sua futura mercadoria.
           ===================================================== */

        addNPC({

            ...NPC_LIBRARY.MIGUEL,

            x:
                2770,

            y:
                790,

            wander:
                0

        });


        addProtectedZone(

            2770,
            790,

            75,

            "miguel_area"

        );


        addDecoration(

            2770,
            790,

            "mysteriousMark",

            {
                size:
                    27
            }

        );


        addDecoration(

            2738,
            830,

            "oldRune",

            {
                size:
                    12
            }

        );


        addDecoration(

            2803,
            830,

            "oldRune",

            {
                size:
                    12
            }

        );


        /* =====================================================
           PORTÕES
           ===================================================== */

        createGate({

            id:
                "north_gate",

            side:
                "north",

            x:
                1495,

            y:
                48,

            w:
                210,

            h:
                64,

            title:
                "PORTÃO DO NORTE"

        });


        createGate({

            id:
                "west_gate",

            side:
                "west",

            x:
                48,

            y:
                995,

            w:
                64,

            h:
                210,

            title:
                "PORTÃO DO OESTE"

        });


        createGate({

            id:
                "south_gate",

            side:
                "south",

            x:
                1495,

            y:
                2088,

            w:
                210,

            h:
                64,

            title:
                "PORTÃO DO SUL"

        });


        /* =====================================================
           SAÍDA LESTE
           ===================================================== */

        addProtectedZone(

            3030,
            1100,

            170,

            "east_exit"

        );


        /* =====================================================
           ÁRVORES
           ===================================================== */

        for (
            let i = 0;
            i < 48;
            i++
        ) {

            addGeneratedTree(

                rng,

                `village_tree_${i}`,

                {

                    type:
                        "tree",

                    minX:
                        135,

                    maxX:
                        3065,

                    minY:
                        145,

                    maxY:
                        2025,

                    safeRadius:
                        49

                }

            );

        }


        /* =====================================================
           PEDRAS
           ===================================================== */

        for (
            let i = 0;
            i < 11;
            i++
        ) {

            addGeneratedRock(

                rng,

                `village_rock_${i}`,

                {

                    type:
                        "mossRock",

                    minX:
                        150,

                    maxX:
                        2980,

                    minY:
                        160,

                    maxY:
                        1990

                }

            );

        }


        /* =====================================================
           CENOURAS
           ===================================================== */

        addFood({

            id:
                "village_carrot_1",

            type:
                "carrot",

            x:
                2050,

            y:
                1500,

            respawn:
                38

        });


        addFood({

            id:
                "village_carrot_2",

            type:
                "carrot",

            x:
                2150,

            y:
                1570,

            respawn:
                42

        });


        /* =====================================================
           INIMIGOS
           ===================================================== */

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            spawnEnemyType(

                rng,

                i % 2 === 0
                    ? "wolf"
                    : "boar",

                i,

                {

                    minX:
                        2020,

                    maxX:
                        2920,

                    minY:
                        850,

                    maxY:
                        1460

                }

            );

        }


        /* =====================================================
           BOSS 1 — GUARDIÃO DA ESTRADA

           SEM DASH.
           ===================================================== */

        if (
            !hasDefeatedBoss(
                "road_guardian"
            )
        ) {

            addProtectedZone(

                2820,
                1100,

                150,

                "road_guardian_arena"

            );


            spawnProgressionBoss({

                id:
                    "road_guardian",

                x:
                    2820,

                y:
                    1100,

                hp:
                    480,

                maxHp:
                    480,

                damage:
                    20,

                speed:
                    64,

                vision:
                    360,

                attackRange:
                    82,

                radius:
                    38,

                color:
                    "#8c5750",

                xp:
                    150,

                money:
                    120,

                bossPattern:
                    "route1_slow",

                unlock:
                    "forest"

            });

        }


        /* =====================================================
           PORTAL PARA FLORESTA
           ===================================================== */

        addPortal(

            3070,
            1015,

            90,
            170,

            "forest",

            () =>
                hasDefeatedBoss(
                    "road_guardian"
                ),

            "FLORESTA",

            {

                id:
                    "village_to_forest",

                spawn: {

                    x:
                        185,

                    y:
                        1150,

                    facing:
                        "right"

                }

            }

        );


        /* =====================================================
           DECORAÇÃO
           ===================================================== */

        addBiomeDetails(

            rng,

            130,

            [

                "grassTuft",
                "flower",
                "smallStone",
                "leafPatch",
                "fallenLeaf"

            ],

            {

                minSize:
                    4,

                maxSize:
                    15,

                avoidProtected:
                    false

            }

        );

    }


    /* =========================================================
       FLORESTA
       ========================================================= */

    function buildForest() {

        const rng =
            getAreaRng(
                "forest",
                "layout"
            );


        addPath(

            "forestTrail",

            [

                {
                    x:
                        90,
                    y:
                        1150
                },

                {
                    x:
                        470,
                    y:
                        1080
                },

                {
                    x:
                        790,
                    y:
                        1230
                },

                {
                    x:
                        1130,
                    y:
                        980
                },

                {
                    x:
                        1450,
                    y:
                        1180
                },

                {
                    x:
                        1790,
                    y:
                        900
                },

                {
                    x:
                        2150,
                    y:
                        1080
                },

                {
                    x:
                        2470,
                    y:
                        820
                },

                {
                    x:
                        2840,
                    y:
                        1050
                },

                {
                    x:
                        3310,
                    y:
                        1130
                }

            ],

            110

        );


        addPortal(

            62,
            1045,

            82,
            210,

            "village",

            null,

            "VILA DO CREPÚSCULO",

            {

                id:
                    "forest_to_village",

                spawn: {

                    x:
                        2960,

                    y:
                        1100,

                    facing:
                        "left"

                }

            }

        );


        for (
            let i = 0;
            i < 74;
            i++
        ) {

            addGeneratedTree(

                rng,

                `forest_tree_${i}`,

                {

                    type:

                        i % 7 === 0

                            ? "ancientTree"

                            : "tree",

                    minX:
                        140,

                    maxX:
                        3270,

                    minY:
                        120,

                    maxY:
                        2170,

                    safeRadius:
                        50

                }

            );

        }


        for (
            let i = 0;
            i < 13;
            i++
        ) {

            addGeneratedRock(

                rng,

                `forest_rock_${i}`,

                {

                    type:
                        "mossRock",

                    minX:
                        180,

                    maxX:
                        3150,

                    minY:
                        160,

                    maxY:
                        2100

                }

            );

        }


        for (
            let i = 0;
            i < 10;
            i++
        ) {

            spawnEnemyType(

                rng,

                i % 3 === 0
                    ? "boar"
                    : "wolf",

                i,

                {

                    minX:
                        420,

                    maxX:
                        2950,

                    minY:
                        300,

                    maxY:
                        1960,

                    drop:

                        i % 4 === 0

                            ? "essencia"

                            : null,

                    dropChance:
                        0.35

                }

            );

        }


        if (
            !hasDefeatedBoss(
                "forest_warden"
            )
        ) {

            addProtectedZone(

                3000,
                1050,

                175,

                "forest_boss_arena"

            );


            spawnProgressionBoss({

                id:
                    "forest_warden",

                x:
                    3000,

                y:
                    1050,

                hp:
                    760,

                maxHp:
                    760,

                damage:
                    25,

                speed:
                    66,

                vision:
                    380,

                attackRange:
                    88,

                radius:
                    41,

                color:
                    "#5e7549",

                xp:
                    250,

                money:
                    180,

                bossPattern:
                    "forestRoots",

                unlock:
                    "grove"

            });

        }


        addPortal(

            3280,
            1030,

            82,
            210,

            "grove",

            () =>
                hasDefeatedBoss(
                    "forest_warden"
                ),

            "BOSQUE ANTIGO",

            {

                id:
                    "forest_to_grove",

                spawn: {

                    x:
                        185,

                    y:
                        1160,

                    facing:
                        "right"

                }

            }

        );


        addBiomeDetails(

            rng,

            175,

            [

                "fern",
                "leafPatch",
                "flower",
                "smallStone",
                "fallenLeaf",
                "mushroom"

            ],

            {

                minSize:
                    4,

                maxSize:
                    16

            }

        );

    }


    /* =========================================================
       BOSQUE
       ========================================================= */

    function buildGrove() {

        const rng =
            getAreaRng(
                "grove",
                "layout"
            );


        addPath(

            "groveTrail",

            [

                {
                    x:
                        90,
                    y:
                        1160
                },

                {
                    x:
                        470,
                    y:
                        1030
                },

                {
                    x:
                        870,
                    y:
                        1250
                },

                {
                    x:
                        1260,
                    y:
                        1090
                },

                {
                    x:
                        1590,
                    y:
                        1280
                },

                {
                    x:
                        1950,
                    y:
                        920
                },

                {
                    x:
                        2340,
                    y:
                        1140
                },

                {
                    x:
                        2730,
                    y:
                        930
                },

                {
                    x:
                        3380,
                    y:
                        1130
                }

            ],

            106

        );


        addPortal(

            62,
            1055,

            82,
            210,

            "forest",

            null,

            "FLORESTA",

            {

                id:
                    "grove_to_forest",

                spawn: {

                    x:
                        3170,

                    y:
                        1130,

                    facing:
                        "left"

                }

            }

        );


        for (
            let i = 0;
            i < 80;
            i++
        ) {

            addGeneratedTree(

                rng,

                `grove_tree_${i}`,

                {

                    type:

                        i % 5 === 0

                            ? "ancientTree"

                            : "tree",

                    minX:
                        145,

                    maxX:
                        3360,

                    minY:
                        120,

                    maxY:
                        2230,

                    safeRadius:
                        50

                }

            );

        }


        for (
            let i = 0;
            i < 14;
            i++
        ) {

            addGeneratedRock(

                rng,

                `grove_stone_${i}`,

                {

                    type:
                        "groveStone",

                    minX:
                        180,

                    maxX:
                        3280,

                    minY:
                        170,

                    maxY:
                        2160

                }

            );

        }


        for (
            let i = 0;
            i < 11;
            i++
        ) {

            spawnEnemyType(

                rng,

                i % 2 === 0
                    ? "thornling"
                    : "wolf",

                i,

                {

                    minX:
                        430,

                    maxX:
                        3070,

                    minY:
                        300,

                    maxY:
                        2050,

                    drop:
                        "essencia",

                    dropChance:
                        0.28

                }

            );

        }


        /* =====================================================
           CERVO ANCESTRAL

           Boss de recurso:
           SEM barra grande no topo.
           ===================================================== */

        if (
            !hasDefeatedBoss(
                "ancient_deer"
            )
        ) {

            addEnemy({

                id:
                    "ancient_deer",

                name:
                    "CERVO ANCESTRAL",

                spriteType:
                    "ancientDeer",

                type:
                    "resourceBoss",

                imageStyle:
                    "ancientDeer",

                x:
                    1820,

                y:
                    420,

                hp:
                    620,

                maxHp:
                    620,

                damage:
                    22,

                speed:
                    92,

                vision:
                    340,

                attackRange:
                    75,

                radius:
                    33,

                color:
                    "#756f54",

                xp:
                    130,

                money:
                    55,

                drop:
                    "essencia",

                dropAmount:
                    4,

                dropChance:
                    1,

                accepted:
                    true,

                aggressive:
                    false,

                bossPattern:
                    "ancientDeer"

            });

        }


        if (
            !hasDefeatedBoss(
                "grove_heart"
            )
        ) {

            addProtectedZone(

                3050,
                980,

                185,

                "grove_progression_boss"

            );


            spawnProgressionBoss({

                id:
                    "grove_heart",

                x:
                    3050,

                y:
                    980,

                hp:
                    1050,

                maxHp:
                    1050,

                damage:
                    30,

                speed:
                    58,

                vision:
                    410,

                attackRange:
                    94,

                radius:
                    45,

                color:
                    "#68734e",

                xp:
                    350,

                money:
                    240,

                bossPattern:
                    "grovePulse",

                unlock:
                    "mountains"

            });

        }


        addPortal(

            3390,
            1035,

            82,
            210,

            "mountains",

            () =>
                hasDefeatedBoss(
                    "grove_heart"
                ),

            "MONTANHAS",

            {

                id:
                    "grove_to_mountains",

                spawn: {

                    x:
                        185,

                    y:
                        1160,

                    facing:
                        "right"

                }

            }

        );


        addBiomeDetails(

            rng,

            185,

            [

                "magicFlower",
                "fern",
                "ancientRoot",
                "glowingGrass",
                "oldRune",
                "fallenLeaf"

            ],

            {

                minSize:
                    5,

                maxSize:
                    19

            }

        );

    }


    /* =========================================================
       MONTANHAS
       ========================================================= */

    function buildMountains() {

        const rng =
            getAreaRng(
                "mountains",
                "layout"
            );


        addPath(

            "snowTrail",

            [

                {
                    x:
                        100,
                    y:
                        1160
                },

                {
                    x:
                        500,
                    y:
                        1130
                },

                {
                    x:
                        880,
                    y:
                        920
                },

                {
                    x:
                        1210,
                    y:
                        1180
                },

                {
                    x:
                        1580,
                    y:
                        930
                },

                {
                    x:
                        1940,
                    y:
                        1210
                },

                {
                    x:
                        2320,
                    y:
                        950
                },

                {
                    x:
                        2770,
                    y:
                        1080
                },

                {
                    x:
                        3390,
                    y:
                        1120
                }

            ],

            110

        );


        addPortal(

            60,
            1055,

            82,
            210,

            "grove",

            null,

            "BOSQUE ANTIGO",

            {

                id:
                    "mountains_to_grove",

                spawn: {

                    x:
                        3260,

                    y:
                        1130,

                    facing:
                        "left"

                }

            }

        );


        for (
            let i = 0;
            i < 35;
            i++
        ) {

            addGeneratedRock(

                rng,

                `mountain_rock_${i}`,

                {

                    type:

                        i % 4 === 0

                            ? "iceRock"

                            : "snowrock",

                    minX:
                        150,

                    maxX:
                        3330,

                    minY:
                        160,

                    maxY:
                        2180

                }

            );

        }


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            spawnEnemyType(

                rng,

                "stoneCrawler",

                i,

                {

                    minX:
                        430,

                    maxX:
                        3100,

                    minY:
                        280,

                    maxY:
                        2020,

                    drop:

                        i % 3 === 0

                            ? "ferro"

                            : null,

                    dropChance:
                        0.4

                }

            );

        }


        if (
            !hasDefeatedBoss(
                "mountain_titan"
            )
        ) {

            addProtectedZone(

                3040,
                1050,

                190,

                "mountain_boss_arena"

            );


            spawnProgressionBoss({

                id:
                    "mountain_titan",

                x:
                    3040,

                y:
                    1050,

                hp:
                    1450,

                maxHp:
                    1450,

                damage:
                    35,

                speed:
                    58,

                vision:
                    430,

                attackRange:
                    100,

                radius:
                    49,

                color:
                    "#91958f",

                xp:
                    470,

                money:
                    320,

                bossPattern:
                    "mountainQuake",

                unlock:
                    "iron"

            });

        }


        addPortal(

            3390,
            1030,

            82,
            210,

            "iron",

            () =>
                hasDefeatedBoss(
                    "mountain_titan"
                ),

            "CAVERNA DE FERRO",

            {

                id:
                    "mountains_to_iron",

                spawn: {

                    x:
                        185,

                    y:
                        1120,

                    facing:
                        "right"

                }

            }

        );


        addBiomeDetails(

            rng,

            125,

            [

                "snowDrift",
                "smallStone",
                "deadPine",
                "windRune"

            ],

            {

                minSize:
                    5,

                maxSize:
                    20

            }

        );

    }


    /* =========================================================
       CAVERNA DE FERRO
       ========================================================= */

    function buildIron() {

        const rng =
            getAreaRng(
                "iron",
                "layout"
            );


        addPath(

            "mineTrack",

            [

                {
                    x:
                        100,
                    y:
                        1120
                },

                {
                    x:
                        520,
                    y:
                        1100
                },

                {
                    x:
                        910,
                    y:
                        930
                },

                {
                    x:
                        1280,
                    y:
                        1210
                },

                {
                    x:
                        1630,
                    y:
                        1000
                },

                {
                    x:
                        2010,
                    y:
                        1180
                },

                {
                    x:
                        2410,
                    y:
                        940
                },

                {
                    x:
                        2770,
                    y:
                        1080
                },

                {
                    x:
                        3290,
                    y:
                        1100
                }

            ],

            105

        );


        addPortal(

            60,
            1010,

            82,
            210,

            "mountains",

            null,

            "MONTANHAS",

            {

                id:
                    "iron_to_mountains",

                spawn: {

                    x:
                        3260,

                    y:
                        1120,

                    facing:
                        "left"

                }

            }

        );


        for (
            let i = 0;
            i < 32;
            i++
        ) {

            addGeneratedRock(

                rng,

                `iron_rock_${i}`,

                {

                    type:

                        i % 3 === 0

                            ? "ironrock"

                            : "oreRock",

                    minX:
                        150,

                    maxX:
                        3240,

                    minY:
                        150,

                    maxY:
                        2090,

                    blocksLight:
                        true

                }

            );

        }


        for (
            let i = 0;
            i < 24;
            i++
        ) {

            addGeneratedResource(

                rng,

                `iron_ore_${i}`,

                "ferro",

                {

                    minX:
                        300,

                    maxX:
                        3100,

                    minY:
                        230,

                    maxY:
                        1990,

                    amountMin:
                        1,

                    amountMax:
                        3,

                    respawn:
                        28

                }

            );

        }


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            addGeneratedResource(

                rng,

                `coal_${i}`,

                "carvao",

                {

                    minX:
                        300,

                    maxX:
                        3050,

                    minY:
                        260,

                    maxY:
                        1950,

                    amountMin:
                        1,

                    amountMax:
                        2,

                    respawn:
                        26

                }

            );

        }


        for (
            let i = 0;
            i < 10;
            i++
        ) {

            spawnEnemyType(

                rng,

                "mineCrawler",

                i,

                {

                    minX:
                        430,

                    maxX:
                        3000,

                    minY:
                        280,

                    maxY:
                        1930,

                    drop:
                        "ferro",

                    dropChance:
                        0.44

                }

            );

        }


        if (
            !hasDefeatedBoss(
                "iron_colossus"
            )
        ) {

            addProtectedZone(

                2970,
                1080,

                195,

                "iron_boss_arena"

            );


            spawnProgressionBoss({

                id:
                    "iron_colossus",

                x:
                    2970,

                y:
                    1080,

                hp:
                    1950,

                maxHp:
                    1950,

                damage:
                    40,

                speed:
                    55,

                vision:
                    440,

                attackRange:
                    106,

                radius:
                    52,

                color:
                    "#737b7d",

                xp:
                    590,

                money:
                    410,

                bossPattern:
                    "ironMagnet",

                unlock:
                    "ruby"

            });

        }


        addPortal(

            3290,
            1010,

            82,
            210,

            "ruby",

            () =>
                hasDefeatedBoss(
                    "iron_colossus"
                ),

            "TERRAS DE RUBI",

            {

                id:
                    "iron_to_ruby",

                spawn: {

                    x:
                        185,

                    y:
                        1120,

                    facing:
                        "right"

                }

            }

        );


        addBiomeDetails(

            rng,

            110,

            [

                "mineLantern",
                "rail",
                "smallStone",
                "stalagmite",
                "toolCrate"

            ],

            {

                minSize:
                    5,

                maxSize:
                    18

            }

        );

    }


    /* =========================================================
       TERRAS DE RUBI

       Mantém o desenho geral.
       Não estou remodelando essa região antes
       do teste da caverna/lanterna.
       ========================================================= */

    function buildRuby() {

        const rng =
            getAreaRng(
                "ruby",
                "layout"
            );


        addPath(

            "crystalTrail",

            [

                {
                    x:
                        100,
                    y:
                        1120
                },

                {
                    x:
                        500,
                    y:
                        1110
                },

                {
                    x:
                        880,
                    y:
                        1280
                },

                {
                    x:
                        1280,
                    y:
                        1050
                },

                {
                    x:
                        1660,
                    y:
                        1240
                },

                {
                    x:
                        2050,
                    y:
                        970
                },

                {
                    x:
                        2430,
                    y:
                        1160
                },

                {
                    x:
                        2790,
                    y:
                        820
                },

                {
                    x:
                        3190,
                    y:
                        520
                }

            ],

            108

        );


        addPortal(

            60,
            1015,

            82,
            210,

            "iron",

            null,

            "CAVERNA DE FERRO",

            {

                id:
                    "ruby_to_iron",

                spawn: {

                    x:
                        3170,

                    y:
                        1100,

                    facing:
                        "left"

                }

            }

        );


        for (
            let i = 0;
            i < 30;
            i++
        ) {

            addGeneratedRock(

                rng,

                `ruby_rock_${i}`,

                {

                    type:

                        i % 4 === 0

                            ? "rubyPillar"

                            : "rubyrock",

                    minX:
                        140,

                    maxX:
                        3360,

                    minY:
                        150,

                    maxY:
                        2140

                }

            );

        }


        for (
            let i = 0;
            i < 25;
            i++
        ) {

            addGeneratedResource(

                rng,

                `ruby_node_${i}`,

                "rubi",

                {

                    minX:
                        300,

                    maxX:
                        3180,

                    minY:
                        260,

                    maxY:
                        2020,

                    amountMin:
                        1,

                    amountMax:
                        3,

                    respawn:
                        30

                }

            );

        }


        for (
            let i = 0;
            i < 18;
            i++
        ) {

            addGeneratedResource(

                rng,

                `diamond_node_${i}`,

                "diamante",

                {

                    minX:
                        350,

                    maxX:
                        3150,

                    minY:
                        280,

                    maxY:
                        1950,

                    amountMin:
                        1,

                    amountMax:
                        2,

                    respawn:
                        33

                }

            );

        }


        for (
            let i = 0;
            i < 11;
            i++
        ) {

            spawnEnemyType(

                rng,

                "rubyHound",

                i,

                {

                    minX:
                        420,

                    maxX:
                        3100,

                    minY:
                        300,

                    maxY:
                        1930,

                    drop:

                        i % 2 === 0

                            ? "rubi"

                            : "diamante",

                    dropChance:
                        0.38

                }

            );

        }


        if (
            !hasDefeatedBoss(
                "ruby_chimera"
            )
        ) {

            addProtectedZone(

                2940,
                720,

                205,

                "ruby_boss_arena"

            );


            spawnProgressionBoss({

                id:
                    "ruby_chimera",

                x:
                    2940,

                y:
                    720,

                hp:
                    2550,

                maxHp:
                    2550,

                damage:
                    45,

                speed:
                    80,

                vision:
                    460,

                attackRange:
                    110,

                radius:
                    48,

                color:
                    "#a64c62",

                xp:
                    720,

                money:
                    520,

                bossPattern:
                    "rubyChimera",

                unlock:
                    "monarchMaze"

            });

        }


        /*
            Caverna continua no canto superior direito.
        */
        addDecoration(

            3290,
            280,

            "darkCaveEntrance",

            {
                large:
                    true
            }

        );


        addProtectedZone(

            3290,
            280,

            150,

            "monarch_cave_entrance"

        );


        addPortal(

            3240,
            215,

            105,
            175,

            "monarchMaze",

            () =>
                hasDefeatedBoss(
                    "ruby_chimera"
                ),

            "CAVERNA ESQUECIDA",

            {

                id:
                    "ruby_to_monarch_maze",

                spawn: {

                    x:
                        185,

                    y:
                        1120,

                    facing:
                        "right"

                }

            }

        );


        addBiomeDetails(

            rng,

            130,

            [

                "crystalShard",
                "smallCrystal",
                "rubyDust",
                "darkGrass"

            ],

            {

                minSize:
                    5,

                maxSize:
                    19

            }

        );

    }


    /* =========================================================
       LABIRINTO DO MONARCA
       ========================================================= */

    const MAZE_CONFIG =
        Object.freeze({

            cols:
                27,

            rows:
                17,

            cell:
                105,

            originX:
                170,

            originY:
                205,

            wall:
                18

        });


    function createMazeGrid(
        cols,
        rows
    ) {

        return Array.from(

            {
                length:
                    rows
            },

            () =>
                Array.from(

                    {
                        length:
                            cols
                    },

                    () => ({

                        visited:
                            false,

                        walls: {

                            top:
                                true,

                            right:
                                true,

                            bottom:
                                true,

                            left:
                                true

                        }

                    })

                )

        );

    }


    function generateMaze(
        seed
    ) {

        const rng =
            mulberry32(
                seed
            );


        const cols =
            MAZE_CONFIG.cols;


        const rows =
            MAZE_CONFIG.rows;


        const grid =
            createMazeGrid(
                cols,
                rows
            );


        const directions = [

            {
                dx:
                    0,
                dy:
                    -1,
                wall:
                    "top",
                opposite:
                    "bottom"
            },

            {
                dx:
                    1,
                dy:
                    0,
                wall:
                    "right",
                opposite:
                    "left"
            },

            {
                dx:
                    0,
                dy:
                    1,
                wall:
                    "bottom",
                opposite:
                    "top"
            },

            {
                dx:
                    -1,
                dy:
                    0,
                wall:
                    "left",
                opposite:
                    "right"
            }

        ];


        const stack =
            [];


        let cx =
            0;


        let cy =
            Math.floor(
                rows /
                2
            );


        grid[
            cy
        ][
            cx
        ].visited =
            true;


        let visited =
            1;


        const total =
            cols *
            rows;


        while (
            visited < total
        ) {

            const candidates =
                directions.filter(
                    direction => {

                        const nx =
                            cx +
                            direction.dx;


                        const ny =
                            cy +
                            direction.dy;


                        return (

                            nx >= 0 &&
                            ny >= 0 &&
                            nx < cols &&
                            ny < rows &&

                            !grid[
                                ny
                            ][
                                nx
                            ].visited

                        );

                    }
                );


            if (
                candidates.length
            ) {

                const direction =
                    candidates[
                        rngInt(
                            rng,
                            0,
                            candidates.length - 1
                        )
                    ];


                const nx =
                    cx +
                    direction.dx;


                const ny =
                    cy +
                    direction.dy;


                grid[
                    cy
                ][
                    cx
                ]
                    .walls[
                        direction.wall
                    ] =
                    false;


                grid[
                    ny
                ][
                    nx
                ]
                    .walls[
                        direction.opposite
                    ] =
                    false;


                stack.push({

                    x:
                        cx,

                    y:
                        cy

                });


                cx =
                    nx;


                cy =
                    ny;


                grid[
                    cy
                ][
                    cx
                ].visited =
                    true;


                visited++;


                continue;

            }


            const previous =
                stack.pop();


            if (!previous) {

                break;

            }


            cx =
                previous.x;


            cy =
                previous.y;

        }


        return grid;

    }


    function addMazeWall(
        x,
        y,
        w,
        h,
        id
    ) {

        return addObstacle({

            id,

            type:
                "mazeWall",

            x,
            y,
            w,
            h,

            solid:
                true,

            blocksLight:
                true

        });

    }


    function buildMazeWalls(
        grid
    ) {

        const cols =
            MAZE_CONFIG.cols;


        const rows =
            MAZE_CONFIG.rows;


        const cell =
            MAZE_CONFIG.cell;


        const originX =
            MAZE_CONFIG.originX;


        const originY =
            MAZE_CONFIG.originY;


        const wall =
            MAZE_CONFIG.wall;


        for (
            let y = 0;
            y < rows;
            y++
        ) {

            for (
                let x = 0;
                x < cols;
                x++
            ) {

                const cellData =
                    grid[y][x];


                const worldX =

                    originX +

                    x *
                    cell;


                const worldY =

                    originY +

                    y *
                    cell;


                if (
                    cellData
                        .walls
                        .top
                ) {

                    addMazeWall(

                        worldX,
                        worldY,

                        cell +
                        wall,

                        wall,

                        `maze_top_${x}_${y}`

                    );

                }


                if (
                    cellData
                        .walls
                        .left
                ) {

                    addMazeWall(

                        worldX,
                        worldY,

                        wall,

                        cell +
                        wall,

                        `maze_left_${x}_${y}`

                    );

                }


                if (
                    x ===
                    cols - 1 &&

                    cellData
                        .walls
                        .right
                ) {

                    addMazeWall(

                        worldX +
                        cell,

                        worldY,

                        wall,

                        cell +
                        wall,

                        `maze_right_${x}_${y}`

                    );

                }


                if (
                    y ===
                    rows - 1 &&

                    cellData
                        .walls
                        .bottom
                ) {

                    addMazeWall(

                        worldX,

                        worldY +
                        cell,

                        cell +
                        wall,

                        wall,

                        `maze_bottom_${x}_${y}`

                    );

                }

            }

        }

    }


    /* =========================================================
       ABERTURA SEGURA DO LABIRINTO

       A DFS gera o labirinto.
       Depois garantimos que a entrada não tenha
       parede fechando o ponto inicial.
       ========================================================= */

    function carveMazeEntrance() {

        const spawn = {

            x:
                185,

            y:
                1120

        };


        state.world.obstacles =
            state.world
                .obstacles
                .filter(
                    obstacle => {

                        if (
                            obstacle.type !==
                            "mazeWall"
                        ) {

                            return true;

                        }


                        return !circleRectCollision(

                            spawn.x,
                            spawn.y,
                            48,

                            obstacle

                        );

                    }
                );

    }


    /* =========================================================
       ARENA DO MONARCA
       ========================================================= */

    function createMonarchArena() {

        const arena = {

            x:
                2740,

            y:
                650,

            w:
                620,

            h:
                770

        };


        addProtectedZone(

            arena.x +
            arena.w /
            2,

            arena.y +
            arena.h /
            2,

            405,

            "monarch_arena"

        );


        /*
            Retira paredes do labirinto dentro da arena.
        */
        state.world.obstacles =
            state.world
                .obstacles
                .filter(
                    obstacle => {

                        if (
                            obstacle.type !==
                            "mazeWall"
                        ) {

                            return true;

                        }


                        return !rectsOverlap(

                            obstacle,

                            {

                                x:
                                    arena.x - 30,

                                y:
                                    arena.y - 30,

                                w:
                                    arena.w + 60,

                                h:
                                    arena.h + 60

                            }

                        );

                    }
                );


        const thickness =
            24;


        addObstacle({

            id:
                "monarch_arena_top",

            type:
                "arenaWall",

            x:
                arena.x,

            y:
                arena.y,

            w:
                arena.w,

            h:
                thickness,

            solid:
                true,

            blocksLight:
                true

        });


        addObstacle({

            id:
                "monarch_arena_bottom",

            type:
                "arenaWall",

            x:
                arena.x,

            y:
                arena.y +
                arena.h,

            w:
                arena.w,

            h:
                thickness,

            solid:
                true,

            blocksLight:
                true

        });


        addObstacle({

            id:
                "monarch_arena_right",

            type:
                "arenaWall",

            x:
                arena.x +
                arena.w,

            y:
                arena.y,

            w:
                thickness,

            h:
                arena.h +
                thickness,

            solid:
                true,

            blocksLight:
                true

        });


        /*
            Lado esquerdo dividido,
            criando abertura central.
        */
        addObstacle({

            id:
                "monarch_arena_left_top",

            type:
                "arenaWall",

            x:
                arena.x,

            y:
                arena.y,

            w:
                thickness,

            h:
                270,

            solid:
                true,

            blocksLight:
                true

        });


        addObstacle({

            id:
                "monarch_arena_left_bottom",

            type:
                "arenaWall",

            x:
                arena.x,

            y:
                arena.y +
                485,

            w:
                thickness,

            h:
                arena.h -
                485,

            solid:
                true,

            blocksLight:
                true

        });


        return arena;

    }


    /* =========================================================
       BUILD LABIRINTO
       ========================================================= */

    function buildMonarchMaze() {

        const rng =
            getAreaRng(
                "monarchMaze",
                "layout"
            );


        /*
            Seed estável por save.
        */
        const seed =
            state.player
                ?.worldSeeds
                ?.monarchMaze ||

            getWorldSeed(
                "monarchMaze"
            );


        const grid =
            generateMaze(
                seed
            );


        buildMazeWalls(
            grid
        );


        carveMazeEntrance();


        addProtectedZone(

            185,
            1120,

            135,

            "maze_spawn"

        );


        addPortal(

            65,
            1035,

            90,
            180,

            "ruby",

            null,

            "TERRAS DE RUBI",

            {

                id:
                    "maze_to_ruby",

                spawn: {

                    x:
                        3220,

                    y:
                        390,

                    facing:
                        "left"

                }

            }

        );


        const arena =
            createMonarchArena();


        /* =====================================================
           ALTAR

           NÃO fica visível no escuro
           sem a lanterna.
           ===================================================== */

        state.world
            .trials
            .push({

                id:
                    "dash_altar",

                x:
                    arena.x +
                    arena.w /
                    2,

                y:
                    arena.y +
                    arena.h *
                    0.58,

                radius:
                    72,

                title:
                    "ALTAR ESQUECIDO",

                dashAltar:
                    true

            });


        addDecoration(

            arena.x +
            arena.w /
            2,

            arena.y +
            arena.h *
            0.58,

            "dashAltar",

            {

                hiddenWithoutLantern:
                    true,

                radius:
                    72

            }

        );


        /* =====================================================
           ARANHAS
           ===================================================== */

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            spawnEnemyType(

                rng,

                "spider",

                i,

                {

                    minX:
                        330,

                    maxX:
                        2450,

                    minY:
                        300,

                    maxY:
                        1940,

                    drop:
                        "essencia",

                    dropChance:
                        0.38

                }

            );

        }


        /* =====================================================
           ESCORPIÕES
           ===================================================== */

        for (
            let i = 0;
            i < 7;
            i++
        ) {

            spawnEnemyType(

                rng,

                "scorpion",

                i,

                {

                    minX:
                        420,

                    maxX:
                        2480,

                    minY:
                        320,

                    maxY:
                        1900,

                    drop:

                        i % 2 === 0

                            ? "rubi"

                            : "diamante",

                    dropChance:
                        0.25

                }

            );

        }


        /* =====================================================
           MORCEGOS
           ===================================================== */

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            spawnEnemyType(

                rng,

                "bat",

                i,

                {

                    minX:
                        440,

                    maxX:
                        2490,

                    minY:
                        300,

                    maxY:
                        1880,

                    drop:
                        "essencia",

                    dropChance:
                        0.3

                }

            );

        }


        addBiomeDetails(

            rng,

            90,

            [

                "darkPebble",
                "oldRune",
                "shadowMist",
                "boneFragment"

            ],

            {

                minSize:
                    5,

                maxSize:
                    16

            }

        );

    }


    /* =========================================================
       FUNÇÕES DE RESPAWN SEGURO

       A Parte 3 chama estas funções ao reativar
       árvores/minérios.
       ========================================================= */

    function findSafeRespawnForEntity(
        entity,
        radius
    ) {

        /*
            Primeiro tenta o ponto de origem.
        */
        if (
            isSpawnPositionSafe(

                entity.homeX,
                entity.homeY,
                radius,

                {
                    avoidProtected:
                        true,

                    avoidEntities:
                        false
                }

            )
        ) {

            return {

                x:
                    entity.homeX,

                y:
                    entity.homeY

            };

        }


        /*
            Depois procura próximo,
            mas sem cair no caminho.
        */
        const rng =
            mulberry32(

                hashString(

                    `${state.area}:${entity.id}:${Math.floor(state.time)}`

                )

            );


        for (
            let attempt = 0;
            attempt < 70;
            attempt++
        ) {

            const angle =
                rngRange(

                    rng,

                    0,

                    Math.PI *
                    2

                );


            const dist =
                rngRange(
                    rng,
                    45,
                    230
                );


            const x =

                entity.homeX +

                Math.cos(
                    angle
                ) *
                dist;


            const y =

                entity.homeY +

                Math.sin(
                    angle
                ) *
                dist;


            if (
                isSpawnPositionSafe(

                    x,
                    y,
                    radius,

                    {
                        avoidProtected:
                            true,

                        avoidEntities:
                            false
                    }

                )
            ) {

                return {
                    x,
                    y
                };

            }

        }


        return null;

    }


    function safelyRespawnTree(
        tree
    ) {

        const safe =
            findSafeRespawnForEntity(

                tree,

                tree.radius ||
                48

            );


        if (!safe) {

            tree.respawnTimer =
                5;


            return false;

        }


        tree.x =
            safe.x;


        tree.y =
            safe.y;


        /*
            Sincroniza a hitbox da árvore
            com a nova posição.
        */
        const obstacle =
            state.world
                .obstacles
                .find(
                    item =>
                        item.treeId ===
                        tree.id
                );


        if (obstacle) {

            obstacle.x =
                tree.x - 40;


            obstacle.y =
                tree.y - 52;

        }


        tree.alive =
            true;


        tree.respawnTimer =
            0;


        return true;

    }


    function safelyRespawnResource(
        resource
    ) {

        const safe =
            findSafeRespawnForEntity(

                resource,

                resource.radius ||
                20

            );


        if (!safe) {

            resource.respawnTimer =
                5;


            return false;

        }


        resource.x =
            safe.x;


        resource.y =
            safe.y;


        resource.alive =
            true;


        resource.respawnTimer =
            0;


        return true;

    }


    /* =========================================================
       COLISÃO DAS CASAS INTERNAS
       ========================================================= */

    function getInteriorSolidRects() {

        if (
            !state.houseMode
        ) {

            return [];

        }


        return getHouseFurniture()
            .filter(
                item =>
                    item.solid
            )
            .map(
                item => ({

                    x:
                        item.x,

                    y:
                        item.y,

                    w:
                        item.w,

                    h:
                        item.h,

                    furniture:
                        item

                })
            );

    }


    function isInsideHouseRoom(
        x,
        y,
        radius
    ) {

        const room =
            getHouseRoom();


        if (!room) {

            return false;

        }


        return (

            x - radius >=
            room.x &&

            y - radius >=
            room.y &&

            x + radius <=
            room.x +
            room.w &&

            y + radius <=
            room.y +
            room.h

        );

    }


    function canMoveInsideHouseTo(
        x,
        y,
        radius
    ) {

        if (
            !isInsideHouseRoom(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        for (
            const furniture of
            getInteriorSolidRects()
        ) {

            if (
                circleRectCollision(

                    x,
                    y,
                    radius,
                    furniture

                )
            ) {

                return false;

            }

        }


        return true;

    }


    /* =========================================================
       COLISÃO DO MUNDO EXTERIOR
       ========================================================= */

    function canMoveOutsideTo(
        x,
        y,
        radius
    ) {

        if (
            x - radius <
            0 ||

            y - radius <
            0 ||

            x + radius >
            state.world.width ||

            y + radius >
            state.world.height
        ) {

            return false;

        }


        return !circleHitsSolidObstacle(

            x,
            y,
            radius

        );

    }


    function canPlayerMoveTo(
        x,
        y
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        if (
            state.houseMode
        ) {

            return canMoveInsideHouseTo(

                x,
                y,

                state.player.radius

            );

        }


        return canMoveOutsideTo(

            x,
            y,

            state.player.radius

        );

    }


    /* =========================================================
       INTERIOR — POSIÇÃO DE CÂMERA

       O cômodo é menor.
       A câmera futura não transforma a casa
       em um mapa gigante.
       ========================================================= */

    function getHouseCameraTarget() {

        const room =
            getHouseRoom();


        if (!room) {

            return {

                x:
                    state.player?.x ||
                    0,

                y:
                    state.player?.y ||
                    0

            };

        }


        return {

            x:
                room.x +
                room.w /
                2,

            y:
                room.y +
                room.h /
                2

        };

    }


    /* =========================================================
       VERIFICAÇÃO DE SPAWNS CRÍTICOS
       ========================================================= */

    function protectDefaultSpawn(
        area,
        radius = 110
    ) {

        if (
            state.area !==
            area
        ) {

            return;

        }


        const spawn =
            getDefaultSpawn(
                area
            );


        addProtectedZone(

            spawn.x,
            spawn.y,

            radius,

            `${area}_spawn`

        );

    }


    /* =========================================================
       GARANTIA DE ÁREA DE PORTAL
       ========================================================= */

    function clearObstaclesAroundRect(
        rect,
        padding = 35
    ) {

        const expanded = {

            x:
                rect.x -
                padding,

            y:
                rect.y -
                padding,

            w:
                rect.w +
                padding *
                2,

            h:
                rect.h +
                padding *
                2

        };


        state.world.obstacles =
            state.world
                .obstacles
                .filter(
                    obstacle => {

                        /*
                            Não apaga casas, paredes do labirinto,
                            portões ou arena.

                            Só objetos naturais que poderiam
                            ter surgido bloqueando passagem.
                        */
                        if (
                            ![
                                "rock",
                                "mossRock",
                                "groveStone",
                                "snowrock",
                                "iceRock",
                                "oreRock",
                                "ironrock",
                                "rubyrock",
                                "rubyPillar",
                                "tree"
                            ].includes(
                                obstacle.type
                            )
                        ) {

                            return true;

                        }


                        return !rectsOverlap(

                            obstacle,
                            expanded

                        );

                    }
                );

    }


    function clearCriticalPassages() {

        for (
            const portal of
            state.world.portals
        ) {

            clearObstaclesAroundRect(

                portal,

                55

            );

        }


        for (
            const door of
            state.world.doors
        ) {

            clearObstaclesAroundRect(

                {
                    x:
                        door.x,

                    y:
                        door.y,

                    w:
                        door.w,

                    h:
                        door.h + 90
                },

                40

            );

        }

    }


    /* =========================================================
       PATCH DO BUILD WORLD

       Após criar tudo:
       protege spawn + limpa passagens.

       Fazemos por wrapper para manter buildWorld()
       simples.
       ========================================================= */

    const buildWorldBase =
        buildWorld;


    buildWorld =
        function () {

            buildWorldBase();


            protectDefaultSpawn(
                state.area
            );


            clearCriticalPassages();


            refreshGateCollisions();

        };


    /* =========================================================
       FIM DA PARTE 2/5

       A PARTE 3 VEM LOGO ABAIXO.

       PARTE 3 TERÁ:
       - movimento
       - combate
       - ataques de clique diferentes
       - partículas
       - Q/R/F
       - inimigos
       - bosses
       - dano/sangue
       - coleta
       - drops
       - fome/cansaço
       - Dash
       - Monarca

       NÃO COLOQUE })(); AINDA.
       ========================================================= */
     /* =========================================================
       VEYRA: A QUIETUDE — V20 — PARTE 3/5

       MOVIMENTO
       COMBATE
       ATAQUES BÁSICOS
       VFX / PARTÍCULAS
       Q / R / F
       INIMIGOS
       BOSSES
       DANO / SANGUE
       DROPS
       COLETA
       FOME / CANSAÇO
       DASH
       MONARCA

       CONTINUA DIRETAMENTE DA PARTE 2.
       NÃO FECHE O IIFE AQUI.
       ========================================================= */


    /* =========================================================
       HELPERS DE DIREÇÃO
       ========================================================= */

    function facingVector(
        facing
    ) {

        switch (
            facing
        ) {

            case "up":

                return {
                    x: 0,
                    y: -1
                };


            case "down":

                return {
                    x: 0,
                    y: 1
                };


            case "left":

                return {
                    x: -1,
                    y: 0
                };


            case "right":

                return {
                    x: 1,
                    y: 0
                };


            default:

                return {
                    x: 0,
                    y: 1
                };

        }

    }


    function updatePlayerFacing(
        dx,
        dy
    ) {

        if (
            !state.player
        ) {

            return;

        }


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            state.player.facing =

                dx < 0

                    ? "left"

                    : "right";

        }

        else if (
            Math.abs(dy) >
            0.001
        ) {

            state.player.facing =

                dy < 0

                    ? "up"

                    : "down";

        }

    }


    function pointerDirectionFromPlayer() {

        if (
            !state.player
        ) {

            return {
                x: 0,
                y: 1,
                length: 1
            };

        }


        const direction =
            normalize(

                state.pointer.worldX -
                state.player.x,

                state.pointer.worldY -
                state.player.y

            );


        if (
            direction.length >
            0.001
        ) {

            return direction;

        }


        const facing =
            facingVector(
                state.player.facing
            );


        return {

            x:
                facing.x,

            y:
                facing.y,

            length:
                1

        };

    }


    /* =========================================================
       INVENTÁRIO
       ========================================================= */

    function getItemCount(
        id
    ) {

        if (
            !state.player
        ) {

            return 0;

        }


        return Math.max(

            0,

            finiteNumber(

                state.player
                    .inventory
                    ?.[id],

                0

            )

        );

    }


    function hasItem(
        id,
        amount = 1
    ) {

        return (
            getItemCount(
                id
            ) >=
            amount
        );

    }


    function getInventoryWeight() {

        if (
            !state.player
        ) {

            return 0;

        }


        let weight =
            0;


        for (
            const [
                id,
                amount
            ] of
            Object.entries(
                state.player.inventory ||
                {}
            )
        ) {

            const item =
                ITEMS[id];


            if (
                !item
            ) {

                continue;

            }


            weight +=

                Math.max(
                    0,
                    finiteNumber(
                        amount,
                        0
                    )
                ) *

                finiteNumber(
                    item.weight,
                    0
                );

        }


        return weight;

    }


    function canCarryItem(
        id,
        amount = 1
    ) {

        const item =
            ITEMS[id];


        if (
            !item
        ) {

            return false;

        }


        const addedWeight =

            finiteNumber(
                item.weight,
                0
            ) *

            Math.max(
                0,
                amount
            );


        return (

            getInventoryWeight() +
            addedWeight <=

            (
                state.player
                    ?.inventoryWeightLimit ||
                100
            ) +
            0.001

        );

    }


    function addItem(
        id,
        amount = 1,
        options = {}
    ) {

        if (
            !state.player ||
            !ITEMS[id]
        ) {

            return false;

        }


        amount =
            Math.max(
                1,
                Math.floor(
                    amount
                )
            );


        const item =
            ITEMS[id];


        if (
            item.unique &&
            hasItem(
                id
            )
        ) {

            return false;

        }


        if (
            item.unique &&
            (
                id ===
                state.player
                    .equipment
                    ?.armor ||

                id ===
                state.player
                    .equipment
                    ?.weapon ||

                id ===
                state.player
                    .equipment
                    ?.tool
            )
        ) {

            return false;

        }


        if (
            !options.ignoreWeight &&
            !canCarryItem(
                id,
                amount
            )
        ) {

            if (
                options.notify !==
                false &&
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Seu inventário está pesado demais."
                );

            }


            return false;

        }


        state.player
            .inventory[id] =
            getItemCount(id) +
            amount;


        if (
            id ===
            "minimapa"
        ) {

            state.player.minimapOwned =
                true;

        }


        if (
            id ===
            "lanterna"
        ) {

            state.player.lanternOwned =
                true;

        }


        return true;

    }


    function removeItem(
        id,
        amount = 1
    ) {

        if (
            !state.player ||
            !ITEMS[id]
        ) {

            return false;

        }


        amount =
            Math.max(
                1,
                Math.floor(
                    amount
                )
            );


        if (
            getItemCount(id) <
            amount
        ) {

            return false;

        }


        state.player
            .inventory[id] -=
            amount;


        if (
            state.player
                .inventory[id] <
            0
        ) {

            state.player
                .inventory[id] =
                0;

        }


        return true;

    }


    /* =========================================================
       STATUS DO PLAYER
       ========================================================= */

    function getEquippedArmor() {

        return (

            ITEMS[
                state.player
                    ?.equipment
                    ?.armor
            ] ||

            null

        );

    }


    function getEquippedWeapon() {

        return (

            ITEMS[
                state.player
                    ?.equipment
                    ?.weapon
            ] ||

            null

        );

    }


    function recalculatePlayerStats() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        const character =
            currentCharacter();


        const hpPoints =
            clamp(

                finiteNumber(
                    player.stats?.hp,
                    0
                ),

                0,
                STAT_CAP

            );


        const energyPoints =
            clamp(

                finiteNumber(
                    player.stats?.energy,
                    0
                ),

                0,
                STAT_CAP

            );


        const hungerPoints =
            clamp(

                finiteNumber(
                    player.stats?.hunger,
                    0
                ),

                0,
                STAT_CAP

            );


        const fatiguePoints =
            clamp(

                finiteNumber(
                    player.stats?.fatigue,
                    0
                ),

                0,
                STAT_CAP

            );


        player.baseMaxHp =
            finiteNumber(
                player.baseMaxHp,
                character.hp
            );


        player.baseMaxMagic =
            finiteNumber(
                player.baseMaxMagic,
                character.magic
            );


        player.baseMaxEnergy =
            finiteNumber(
                player.baseMaxEnergy,
                character.energy
            );


        player.baseDamage =
            finiteNumber(
                player.baseDamage,
                character.damage
            );


        player.baseDefense =
            finiteNumber(
                player.baseDefense,
                character.defense
            );


        player.baseSpeed =
            finiteNumber(
                player.baseSpeed,
                character.speed
            );


        player.maxHp =

            player.baseMaxHp +

            hpPoints *
            8;


        player.maxEnergy =

            player.baseMaxEnergy +

            energyPoints *
            5;


        player.maxMagic =
            player.baseMaxMagic;


        player.maxHunger =

            100 +

            hungerPoints *
            3;


        player.maxFatigue =

            100 +

            fatiguePoints *
            3;


        player.hp =
            clamp(
                player.hp,
                0,
                player.maxHp
            );


        player.magic =
            clamp(
                player.magic,
                0,
                player.maxMagic
            );


        player.energy =
            clamp(
                player.energy,
                0,
                player.maxEnergy
            );


        player.hunger =
            clamp(
                player.hunger,
                0,
                player.maxHunger
            );


        player.fatigue =
            clamp(
                player.fatigue,
                0,
                player.maxFatigue
            );

    }


    function getStrengthMultiplier() {

        const strength =
            clamp(

                state.player
                    ?.stats
                    ?.strength ||
                0,

                0,
                STAT_CAP

            );


        return (
            1 +
            strength *
            0.02
        );

    }


    function hasPotionBuff(
        type
    ) {

        return Boolean(

            state.player
                ?.activePotionBuffs
                ?.some(
                    buff =>
                        buff.type ===
                        type &&
                        buff.timer >
                        0
                )

        );

    }


    function getPlayerAttackPower() {

        if (
            !state.player
        ) {

            return 0;

        }


        const weapon =
            getEquippedWeapon();


        let damage =

            state.player
                .baseDamage +

            (
                weapon?.damage ||
                0
            );


        damage *=
            getStrengthMultiplier();


        if (
            hasPotionBuff(
                "strength"
            )
        ) {

            damage *=
                1.22;

        }


        if (
            state.player
                .adaptiveBuff
        ) {

            damage *=
                1.15;

        }


        return damage;

    }


    function getPlayerDefense() {

        if (
            !state.player
        ) {

            return 0;

        }


        const armor =
            getEquippedArmor();


        let defense =

            state.player
                .baseDefense +

            (
                armor?.defense ||
                0
            );


        if (
            hasPotionBuff(
                "resistance"
            )
        ) {

            defense +=
                9;

        }


        return defense;

    }


    function getPlayerMoveSpeed() {

        const player =
            state.player;


        if (!player) {

            return 0;

        }


        let speed =
            player.baseSpeed;


        if (
            player.hunger <=
            0
        ) {

            speed *=
                0.78;

        }


        if (
            player.fatigue <=
            0
        ) {

            speed *=
                0.76;

        }


        if (
            player.slowTimer >
            0
        ) {

            speed *=
                player.slowMultiplier ||
                0.68;

        }


        if (
            hasPotionBuff(
                "speed"
            )
        ) {

            speed *=
                1.2;

        }


        if (
            player.adaptiveBuff
        ) {

            speed *=
                1.16;

        }


        return speed;

    }


    /* =========================================================
       XP / LEVEL
       ========================================================= */

    function gainXP(
        amount
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.level >=
            MAX_LEVEL
        ) {

            return;

        }


        player.xp +=
            Math.max(
                0,
                amount
            );


        let leveled =
            false;


        while (

            player.level <
            MAX_LEVEL &&

            player.xp >=
            player.xpToNext

        ) {

            player.xp -=
                player.xpToNext;


            player.level++;


            player.statPoints +=
                POINTS_PER_LEVEL;


            player.xpToNext =
                calculateXpToNext(
                    player.level
                );


            player.hp =
                player.maxHp;


            player.magic =
                player.maxMagic;


            player.energy =
                player.maxEnergy;


            leveled =
                true;

        }


        if (
            player.level >=
            MAX_LEVEL
        ) {

            player.level =
                MAX_LEVEL;


            player.xp =
                0;

        }


        if (
            leveled
        ) {

            recalculatePlayerStats();


            createBurst(

                player.x,
                player.y,

                "#f6d778",

                30,

                {
                    speedMin:
                        40,

                    speedMax:
                        150,

                    sizeMin:
                        2,

                    sizeMax:
                        6,

                    shape:
                        "spark"
                }

            );


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    20,

                maxRadius:
                    95,

                life:
                    0.75,

                color:
                    "#f4d27d",

                lineWidth:
                    4

            });


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(

                    `Nível ${player.level}! +${POINTS_PER_LEVEL} pontos de atributo.`

                );

            }

        }

    }


    /* =========================================================
       PARTICULAS
       ========================================================= */

    function spawnParticle(
        data
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        const life =
            Math.max(
                0.05,
                data.life ||
                0.5
            );


        const particle = {

            id:
                uid("particle"),

            x:
                data.x,

            y:
                data.y,

            vx:
                data.vx ||
                0,

            vy:
                data.vy ||
                0,

            life,

            maxLife:
                life,

            size:
                data.size ||
                3,

            endSize:
                data.endSize ??
                0,

            color:
                data.color ||
                "#ffffff",

            secondaryColor:
                data.secondaryColor ||
                null,

            shape:
                data.shape ||
                "circle",

            alpha:
                data.alpha ??
                1,

            gravity:
                data.gravity ||
                0,

            drag:
                data.drag ??
                0.96,

            rotation:
                data.rotation ||
                0,

            rotationSpeed:
                data.rotationSpeed ||
                0,

            glow:
                data.glow ||
                0,

            stretch:
                data.stretch ||
                1

        };


        state.world
            .particles
            .push(
                particle
            );


        return particle;

    }


    function createBurst(
        x,
        y,
        color,
        count = 12,
        options = {}
    ) {

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI * 2
                );


            const speed =
                random(

                    options.speedMin ??
                    30,

                    options.speedMax ??
                    110

                );


            spawnParticle({

                x:
                    x +
                    random(
                        -4,
                        4
                    ),

                y:
                    y +
                    random(
                        -4,
                        4
                    ),

                vx:
                    Math.cos(
                        angle
                    ) *
                    speed,

                vy:
                    Math.sin(
                        angle
                    ) *
                    speed,

                life:
                    random(

                        options.lifeMin ??
                        0.25,

                        options.lifeMax ??
                        0.65

                    ),

                size:
                    random(

                        options.sizeMin ??
                        2,

                        options.sizeMax ??
                        5

                    ),

                endSize:
                    options.endSize ??
                    0,

                color,

                secondaryColor:
                    options.secondaryColor ||
                    null,

                shape:
                    options.shape ||
                    "circle",

                gravity:
                    options.gravity ||
                    0,

                drag:
                    options.drag ??
                    0.95,

                glow:
                    options.glow ||
                    0,

                stretch:
                    options.stretch ||
                    1,

                rotation:
                    random(
                        0,
                        Math.PI * 2
                    ),

                rotationSpeed:
                    random(
                        -5,
                        5
                    )

            });

        }

    }


    function createDirectionalBurst(
        x,
        y,
        directionX,
        directionY,
        color,
        count = 12,
        options = {}
    ) {

        const baseAngle =
            Math.atan2(
                directionY,
                directionX
            );


        const spread =
            options.spread ??
            0.8;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =

                baseAngle +

                random(
                    -spread,
                    spread
                );


            const speed =
                random(

                    options.speedMin ||
                    35,

                    options.speedMax ||
                    120

                );


            spawnParticle({

                x,
                y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    speed,

                vy:
                    Math.sin(
                        angle
                    ) *
                    speed,

                life:
                    random(
                        0.25,
                        0.6
                    ),

                size:
                    random(
                        2,
                        5
                    ),

                color,

                shape:
                    options.shape ||
                    "spark",

                gravity:
                    options.gravity ||
                    0,

                glow:
                    options.glow ||
                    0,

                stretch:
                    options.stretch ||
                    1.5

            });

        }

    }


    function updateParticles(
        dt
    ) {

        if (
            !state.world
        ) {

            return;

        }


        for (
            const particle of
            state.world.particles
        ) {

            particle.life -=
                dt;


            if (
                particle.life <=
                0
            ) {

                continue;

            }


            particle.vy +=
                particle.gravity *
                dt;


            const drag =
                Math.pow(
                    particle.drag,
                    dt * 60
                );


            particle.vx *=
                drag;


            particle.vy *=
                drag;


            particle.x +=
                particle.vx *
                dt;


            particle.y +=
                particle.vy *
                dt;


            particle.rotation +=
                particle.rotationSpeed *
                dt;

        }


        state.world.particles =
            state.world
                .particles
                .filter(
                    particle =>
                        particle.life >
                        0
                );

    }


    /* =========================================================
       EFEITOS
       ========================================================= */

    function addEffect(
        data
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        const life =
            Math.max(
                0.05,
                data.life ||
                0.5
            );


        const effect = {

            id:
                uid("effect"),

            type:
                data.type ||
                "ring",

            x:
                data.x ||
                0,

            y:
                data.y ||
                0,

            x2:
                data.x2 ||
                0,

            y2:
                data.y2 ||
                0,

            radius:
                data.radius ||
                0,

            startRadius:
                data.startRadius ??
                data.radius ??
                0,

            maxRadius:
                data.maxRadius ??
                data.radius ??
                0,

            angle:
                data.angle ||
                0,

            arc:
                data.arc ||
                Math.PI,

            life,

            maxLife:
                life,

            color:
                data.color ||
                "#ffffff",

            secondaryColor:
                data.secondaryColor ||
                null,

            lineWidth:
                data.lineWidth ||
                3,

            alpha:
                data.alpha ??
                1,

            filled:
                Boolean(
                    data.filled
                ),

            text:
                data.text ||
                "",

            rotation:
                data.rotation ||
                0,

            rotationSpeed:
                data.rotationSpeed ||
                0,

            scale:
                data.scale ||
                1

        };


        state.world.effects
            .push(
                effect
            );


        return effect;

    }


    function createRingEffect(
        data
    ) {

        return addEffect({

            ...data,

            type:
                "ring"

        });

    }


    function createSlashEffect(
        data
    ) {

        return addEffect({

            ...data,

            type:
                "slash"

        });

    }


    function createShockwaveEffect(
        data
    ) {

        return addEffect({

            ...data,

            type:
                "shockwave"

        });

    }


    function createFlashEffect(
        data
    ) {

        return addEffect({

            ...data,

            type:
                "flash"

        });

    }


    function updateEffects(
        dt
    ) {

        if (
            !state.world
        ) {

            return;

        }


        for (
            const effect of
            state.world.effects
        ) {

            effect.life -=
                dt;


            effect.rotation +=
                effect.rotationSpeed *
                dt;


            if (
                effect.type ===
                "ring" ||

                effect.type ===
                "shockwave"
            ) {

                const progress =

                    1 -

                    clamp(

                        effect.life /
                        effect.maxLife,

                        0,
                        1

                    );


                effect.radius =
                    lerp(

                        effect.startRadius,

                        effect.maxRadius,

                        progress

                    );

            }

        }


        state.world.effects =
            state.world
                .effects
                .filter(
                    effect =>
                        effect.life >
                        0
                );

    }


    /* =========================================================
       NÚMEROS DE DANO
       ========================================================= */

    function addDamageNumber(
        x,
        y,
        amount,
        color = "#ffffff",
        options = {}
    ) {

        state.world
            .damageNumbers
            .push({

                x,

                y,

                amount:

                    typeof amount ===
                    "number"

                        ? Math.round(
                            amount
                        )

                        : amount,

                color,

                life:
                    options.life ||
                    0.75,

                maxLife:
                    options.life ||
                    0.75,

                vx:
                    options.vx ||
                    random(
                        -12,
                        12
                    ),

                vy:
                    options.vy ||
                    -42,

                size:
                    options.size ||
                    16

            });

    }


    function updateDamageNumbers(
        dt
    ) {

        for (
            const number of
            state.world.damageNumbers
        ) {

            number.life -=
                dt;


            number.x +=
                number.vx *
                dt;


            number.y +=
                number.vy *
                dt;


            number.vy +=
                22 *
                dt;

        }


        state.world.damageNumbers =
            state.world
                .damageNumbers
                .filter(
                    number =>
                        number.life >
                        0
                );

    }


    /* =========================================================
       SCREEN SHAKE
       ========================================================= */

    function addScreenShake(
        power,
        duration = 0.18
    ) {

        state.screenShakePower =
            Math.max(

                state.screenShakePower,

                power

            );


        state.screenShake =
            Math.max(

                state.screenShake,

                duration

            );

    }


    function updateScreenShake(
        dt
    ) {

        state.screenShake =
            Math.max(
                0,
                state.screenShake -
                dt
            );


        if (
            state.screenShake <=
            0
        ) {

            state.screenShakePower =
                0;

        }

    }


    /* =========================================================
       EFEITO DE DANO / SANGUE
       ========================================================= */

    function triggerDamageScreenEffect(
        damage
    ) {

        const severity =
            clamp(

                damage /
                Math.max(
                    1,
                    state.player
                        ?.maxHp ||
                    100
                ),

                0.08,
                0.45

            );


        state.damageFlash =
            clamp(

                Math.max(

                    state.damageFlash,

                    0.25 +
                    severity *
                    1.1

                ),

                0,
                VISUAL_CONFIG
                    .blood
                    .flashMax

            );


        const markCount =
            clamp(

                Math.round(
                    2 +
                    severity *
                    7
                ),

                2,
                5

            );


        for (
            let i = 0;
            i < markCount;
            i++
        ) {

            /*
                Mantemos o centro legível.

                As manchas ficam principalmente
                nas bordas.
            */
            const side =
                randomInt(
                    0,
                    3
                );


            let x =
                0;


            let y =
                0;


            if (
                side ===
                0
            ) {

                x =
                    random(
                        0.04,
                        0.96
                    );


                y =
                    random(
                        0.015,
                        0.13
                    );

            }

            else if (
                side ===
                1
            ) {

                x =
                    random(
                        0.87,
                        0.985
                    );


                y =
                    random(
                        0.08,
                        0.92
                    );

            }

            else if (
                side ===
                2
            ) {

                x =
                    random(
                        0.04,
                        0.96
                    );


                y =
                    random(
                        0.87,
                        0.985
                    );

            }

            else {

                x =
                    random(
                        0.015,
                        0.13
                    );


                y =
                    random(
                        0.08,
                        0.92
                    );

            }


            state.bloodMarks
                .push({

                    x,

                    y,

                    radius:
                        random(
                            22,
                            58
                        ),

                    stretch:
                        random(
                            0.5,
                            1.7
                        ),

                    rotation:
                        random(
                            0,
                            Math.PI * 2
                        ),

                    alpha:
                        random(
                            0.3,
                            0.7
                        ),

                    life:
                        VISUAL_CONFIG
                            .blood
                            .markLife,

                    maxLife:
                        VISUAL_CONFIG
                            .blood
                            .markLife

                });

        }


        if (
            state.bloodMarks.length >
            GAME_CONFIG.maxBloodMarks
        ) {

            state.bloodMarks =
                state.bloodMarks
                    .slice(
                        -GAME_CONFIG
                            .maxBloodMarks
                    );

        }

    }


    function updateDamageScreenEffect(
        dt
    ) {

        state.damageFlash =
            Math.max(

                0,

                state.damageFlash -
                dt *
                1.15

            );


        for (
            const mark of
            state.bloodMarks
        ) {

            mark.life -=
                dt;

        }


        state.bloodMarks =
            state.bloodMarks
                .filter(
                    mark =>
                        mark.life >
                        0
                );

    }


    /* =========================================================
       DANO NO PLAYER
       ========================================================= */

    function damagePlayer(
        amount,
        source = null
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            player.invincible >
            0
        ) {

            return 0;

        }


        amount =
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        const defense =
            getPlayerDefense();


        let reduction =
            defense /
            (
                defense +
                85
            );


        reduction =
            clamp(
                reduction,
                0,
                0.62
            );


        let finalDamage =
            amount *
            (
                1 -
                reduction
            );


        if (
            player.damageReduction >
            0
        ) {

            finalDamage *=
                1 -
                clamp(
                    player.damageReduction,
                    0,
                    0.8
                );

        }


        finalDamage =
            Math.max(
                1,
                finalDamage
            );


        player.hp -=
            finalDamage;


        player.hp =
            Math.max(
                0,
                player.hp
            );


        player.hurtAnim =
            0.24;


        triggerDamageScreenEffect(
            finalDamage
        );


        addScreenShake(

            clamp(
                3 +
                finalDamage *
                0.14,
                4,
                12
            ),

            0.2

        );


        addDamageNumber(

            player.x,

            player.y - 28,

            finalDamage,

            "#ff7777",

            {
                size:
                    18
            }

        );


        createDirectionalBurst(

            player.x,

            player.y,

            source
                ? player.x -
                  source.x
                : 0,

            source
                ? player.y -
                  source.y
                : -1,

            "#b52e36",

            10,

            {
                speedMin:
                    45,

                speedMax:
                    135,

                spread:
                    1,

                shape:
                    "blood",

                gravity:
                    75
            }

        );


        if (
            player.hp <=
            0
        ) {

            killPlayer();

        }


        return finalDamage;

    }


    /* =========================================================
       MORTE / RESPAWN
       ========================================================= */

    function killPlayer() {

        const player =
            state.player;


        if (
            !player ||
            player.dead
        ) {

            return;

        }


        player.dead =
            true;


        player.hp =
            0;


        state.paused =
            true;


        state.pauseReason =
            "death";


        state.bossBarTarget =
            null;


        if (
            typeof showDeathPanel ===
            "function"
        ) {

            showDeathPanel();

        }

    }


    function respawnPlayer() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        const checkpoint =
            player.checkpoint ||
            {

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

            };


        player.dead =
            false;


        player.hp =
            player.maxHp;


        player.magic =
            Math.max(

                player.magic,

                player.maxMagic *
                0.6

            );


        player.energy =
            Math.max(

                player.energy,

                player.maxEnergy *
                0.65

            );


        player.invincible =
            1;


        state.paused =
            false;


        state.pauseReason =
            null;


        if (
            checkpoint.area !==
            state.area
        ) {

            state.area =
                checkpoint.area;


            buildWorld();

        }


        if (
            checkpoint.insideHouse &&
            checkpoint.houseId
        ) {

            const building =
                state.world
                    .buildings
                    .find(
                        item =>
                            item.id ===
                            checkpoint.houseId
                    );


            if (building) {

                enterHouseImmediate(
                    building,
                    false
                );

            }

            else {

                state.houseMode =
                    false;


                state.currentHouse =
                    null;


                player.x =
                    checkpoint.x;


                player.y =
                    checkpoint.y;


                repairPlayerPositionIfStuck();

            }

        }

        else {

            state.houseMode =
                false;


            state.currentHouse =
                null;


            player.x =
                checkpoint.x;


            player.y =
                checkpoint.y;


            repairPlayerPositionIfStuck();

        }


        if (
            typeof hideDeathPanel ===
            "function"
        ) {

            hideDeathPanel();

        }


        startTransition({

            label:
                "A MEMÓRIA RETORNA",

            startBlack:
                true,

            hold:
                0.35,

            fadeIn:
                0.7

        });

    }


    /* =========================================================
       DANO EM INIMIGOS
       ========================================================= */

    function damageEnemy(
        enemy,
        amount,
        options = {}
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return 0;

        }


        /*
            Boss de avanço ainda não aceito:
            não pode tomar dano antes da confirmação.
        */
        if (
            enemy.type ===
            "progression" &&
            !enemy.accepted
        ) {

            return 0;

        }


        amount =
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        if (
            amount <=
            0
        ) {

            return 0;

        }


        enemy.hp -=
            amount;


        enemy.hitFlash =
            0.16;


        enemy.aggressive =
            true;


        addDamageNumber(

            enemy.x,

            enemy.y -
            enemy.radius -
            12,

            amount,

            options.critical
                ? "#ffe487"
                : "#f4efe5",

            {
                size:
                    options.critical
                        ? 21
                        : 16
            }

        );


        createBurst(

            enemy.x,

            enemy.y,

            options.hitColor ||
            "#f4d4ae",

            options.particles ||
            7,

            {
                speedMin:
                    30,

                speedMax:
                    95,

                sizeMin:
                    2,

                sizeMax:
                    4,

                shape:
                    options.particleShape ||
                    "spark"
            }

        );


        /*
            Monarca:
            somente impactos REAIS contam.
        */
        if (
            enemy.id ===
            "monarch" &&
            !enemy.monarchClone &&
            enemy.monarchStagger <=
            0
        ) {

            enemy.monarchHits =
                (
                    enemy.monarchHits ||
                    0
                ) +
                1;


            if (
                enemy.monarchHits >=
                10
            ) {

                triggerMonarchStagger(
                    enemy
                );

            }

        }


        if (
            shouldBossUseTopBar(
                enemy
            )
        ) {

            state.bossBarTarget =
                enemy;

        }


        if (
            enemy.hp <=
            0
        ) {

            killEnemy(
                enemy,
                options
            );

        }


        return amount;

    }


    /* =========================================================
       MORTE DO INIMIGO
       ========================================================= */

    function killEnemy(
        enemy,
        options = {}
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return;

        }


        enemy.dead =
            true;


        enemy.hp =
            0;


        enemy.aggressive =
            false;


        enemy.charge =
            null;


        createBurst(

            enemy.x,

            enemy.y,

            enemy.color ||
            "#b9ada1",

            enemy.type ===
            "progression"
                ? 34
                : 15,

            {
                speedMin:
                    40,

                speedMax:
                    enemy.type ===
                    "progression"
                        ? 180
                        : 110,

                lifeMax:
                    0.9,

                sizeMax:
                    enemy.type ===
                    "progression"
                        ? 7
                        : 5,

                shape:
                    "spark"
            }

        );


        createRingEffect({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                enemy.radius,

            maxRadius:
                enemy.radius *
                2.5,

            life:
                0.55,

            color:
                enemy.color ||
                "#ffffff",

            lineWidth:
                4

        });


        if (
            enemy.type ===
            "progression"
        ) {

            addScreenShake(
                11,
                0.42
            );

        }


        if (
            enemy.xp >
            0
        ) {

            gainXP(
                enemy.xp
            );

        }


        if (
            enemy.money >
            0
        ) {

            state.player.money +=
                enemy.money;

        }


        if (
            enemy.drop &&
            Math.random() <=
            enemy.dropChance
        ) {

            spawnDrop({

                x:
                    enemy.x,

                y:
                    enemy.y,

                itemId:
                    enemy.drop,

                amount:
                    enemy.dropAmount ||
                    1

            });

        }


        if (
            enemy.id ===
            "monarch"
        ) {

            state.player.monarchDefeated =
                true;


            state.player.monarchAwakened =
                true;

        }


        if (
            !state.player
                .defeatedBosses
                .includes(
                    enemy.id
                ) &&
            (
                enemy.type ===
                "progression" ||
                enemy.type ===
                "resourceBoss"
            )
        ) {

            state.player
                .defeatedBosses
                .push(
                    enemy.id
                );

        }


        if (
            state.bossBarTarget ===
            enemy
        ) {

            state.bossBarTarget =
                null;

        }


        if (
            enemy.type ===
            "progression" &&
            typeof handleProgressionBossDefeat ===
            "function"
        ) {

            handleProgressionBossDefeat(
                enemy
            );

        }

    }


    /* =========================================================
       DROPS
       ========================================================= */

    function spawnDrop(
        data
    ) {

        if (
            !ITEMS[
                data.itemId
            ]
        ) {

            return null;

        }


        const drop = {

            id:
                uid("drop"),

            itemId:
                data.itemId,

            amount:
                Math.max(
                    1,
                    data.amount ||
                    1
                ),

            x:
                data.x +
                random(
                    -12,
                    12
                ),

            y:
                data.y +
                random(
                    -12,
                    12
                ),

            radius:
                16,

            bob:
                random(
                    0,
                    Math.PI * 2
                ),

            life:
                180

        };


        state.world.drops
            .push(
                drop
            );


        createBurst(

            drop.x,
            drop.y,

            "#f2d487",

            9,

            {
                speedMin:
                    20,

                speedMax:
                    70,

                sizeMin:
                    2,

                sizeMax:
                    4,

                shape:
                    "spark"
            }

        );


        return drop;

    }


    function updateDrops(
        dt
    ) {

        for (
            const drop of
            state.world.drops
        ) {

            drop.life -=
                dt;


            drop.bob +=
                dt *
                3.3;

        }


        state.world.drops =
            state.world
                .drops
                .filter(
                    drop =>
                        drop.life >
                        0
                );

    }


    function getNearestDrop() {

        if (
            !state.player
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const drop of
            state.world.drops
        ) {

            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    drop.x,
                    drop.y

                );


            if (
                d <=
                GAME_CONFIG.pickupDistance &&
                d <
                bestDistance
            ) {

                best =
                    drop;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    function pickupDrop(
        drop
    ) {

        if (
            !drop
        ) {

            return false;

        }


        if (
            !addItem(

                drop.itemId,

                drop.amount,

                {
                    notify:
                        true
                }

            )
        ) {

            return false;

        }


        const item =
            ITEMS[
                drop.itemId
            ];


        state.world.drops =
            state.world
                .drops
                .filter(
                    itemDrop =>
                        itemDrop.id !==
                        drop.id
                );


        createBurst(

            drop.x,
            drop.y,

            "#f5db92",

            10,

            {
                speedMin:
                    25,

                speedMax:
                    85,

                shape:
                    "spark"
            }

        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(

                `${item.icon} ${item.name} x${drop.amount}`

            );

        }


        return true;

    }


    /* =========================================================
       COMIDA NO MAPA
       ========================================================= */

    function collectFood(
        food
    ) {

        if (
            !food ||
            !food.alive
        ) {

            return false;

        }


        if (
            food.type ===
            "carrot"
        ) {

            if (
                !addItem(
                    "cenoura",
                    1
                )
            ) {

                return false;

            }


            food.alive =
                false;


            food.respawnTimer =
                food.respawn;


            createBurst(

                food.x,
                food.y,

                "#e99945",

                8,

                {
                    speedMin:
                        20,

                    speedMax:
                        65,

                    shape:
                        "leaf"
                }

            );


            return true;

        }


        return false;

    }


    /* =========================================================
       COLHEITA DE ÁRVORE
       ========================================================= */

    function harvestTree(
        tree
    ) {

        if (
            !tree ||
            !tree.alive
        ) {

            return false;

        }


        const amount =
            randomInt(
                2,
                4
            );


        if (
            !canCarryItem(
                "madeira",
                amount
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Seu inventário está pesado demais."
                );

            }


            return false;

        }


        addItem(
            "madeira",
            amount,
            {
                notify:
                    false
            }
        );


        tree.alive =
            false;


        tree.respawnTimer =
            tree.respawn;


        createDirectionalBurst(

            tree.x,

            tree.y,

            random(
                -0.3,
                0.3
            ),

            -1,

            "#7c9d55",

            18,

            {
                speedMin:
                    35,

                speedMax:
                    120,

                spread:
                    2,

                shape:
                    "leaf",

                gravity:
                    60
            }

        );


        createBurst(

            tree.x,

            tree.y + 15,

            "#8f6745",

            12,

            {
                speedMin:
                    25,

                speedMax:
                    95,

                shape:
                    "wood"
            }

        );


        createShockwaveEffect({

            x:
                tree.x,

            y:
                tree.y + 20,

            radius:
                12,

            maxRadius:
                58,

            life:
                0.4,

            color:
                "#8d6845",

            lineWidth:
                3

        });


        addScreenShake(
            3,
            0.12
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `🪵 Madeira +${amount}`
            );

        }


        return true;

    }


    /* =========================================================
       COLETA DE MINÉRIO
       ========================================================= */

    function collectResource(
        resource
    ) {

        if (
            !resource ||
            !resource.alive
        ) {

            return false;

        }


        const item =
            ITEMS[
                resource.type
            ];


        if (!item) {

            return false;

        }


        const amount =
            randomInt(

                resource.amountMin ||
                1,

                resource.amountMax ||
                2

            );


        if (
            !canCarryItem(
                resource.type,
                amount
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Seu inventário está pesado demais."
                );

            }


            return false;

        }


        addItem(

            resource.type,

            amount,

            {
                notify:
                    false
            }

        );


        resource.alive =
            false;


        resource.respawnTimer =
            resource.respawn;


        createBurst(

            resource.x,

            resource.y,

            resource.type ===
            "rubi"

                ? "#cf4763"

                : resource.type ===
                  "diamante"

                    ? "#8ed9ef"

                    : resource.type ===
                      "ouro"

                        ? "#e6c35e"

                        : "#a8a7a1",

            16,

            {
                speedMin:
                    35,

                speedMax:
                    125,

                sizeMin:
                    2,

                sizeMax:
                    5,

                shape:
                    "shard"
            }

        );


        addScreenShake(
            2.5,
            0.11
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `${item.icon} ${item.name} +${amount}`
            );

        }


        return true;

    }


    /* =========================================================
       RESPAWN DE COMIDA
       ========================================================= */

    function safelyRespawnFood(
        food
    ) {

        const safe =
            findSafeRespawnForEntity(

                food,

                food.radius ||
                14

            );


        if (!safe) {

            food.respawnTimer =
                5;


            return false;

        }


        food.x =
            safe.x;


        food.y =
            safe.y;


        food.alive =
            true;


        food.respawnTimer =
            0;


        return true;

    }


    /* =========================================================
       UPDATE DOS RECURSOS
       ========================================================= */

    function updateRespawns(
        dt
    ) {

        for (
            const tree of
            state.world.trees
        ) {

            if (
                tree.alive
            ) {

                continue;

            }


            tree.respawnTimer -=
                dt;


            if (
                tree.respawnTimer <=
                0
            ) {

                safelyRespawnTree(
                    tree
                );

            }

        }


        for (
            const resource of
            state.world.resources
        ) {

            if (
                resource.alive
            ) {

                continue;

            }


            resource.respawnTimer -=
                dt;


            if (
                resource.respawnTimer <=
                0
            ) {

                safelyRespawnResource(
                    resource
                );

            }

        }


        for (
            const food of
            state.world.foods
        ) {

            if (
                food.alive
            ) {

                continue;

            }


            food.respawnTimer -=
                dt;


            if (
                food.respawnTimer <=
                0
            ) {

                safelyRespawnFood(
                    food
                );

            }

        }

    }


    /* =========================================================
       FOME / CANSAÇO
       ========================================================= */

    function updateSurvival(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead
        ) {

            return;

        }


        /*
            Cai devagar.
        */
        player.hunger =
            Math.max(

                0,

                player.hunger -
                0.11 *
                dt

            );


        player.fatigue =
            Math.max(

                0,

                player.fatigue -
                0.085 *
                dt

            );


        /*
            Zero não mata rápido.

            Apenas reduz movimento e causa
            dano pequeno com intervalo.
        */
        player.survivalDamageTimer =
            Math.max(

                0,

                (
                    player.survivalDamageTimer ||
                    0
                ) -
                dt

            );


        if (
            player.survivalDamageTimer <=
            0
        ) {

            let damage =
                0;


            if (
                player.hunger <=
                0
            ) {

                damage +=
                    1.15;

            }


            if (
                player.fatigue <=
                0
            ) {

                damage +=
                    0.85;

            }


            if (
                damage >
                0
            ) {

                /*
                    Não usa damagePlayer para evitar
                    sangue gigante por fome.

                    Ainda há feedback visual leve.
                */
                player.hp =
                    Math.max(
                        0,
                        player.hp -
                        damage
                    );


                state.damageFlash =
                    Math.max(
                        state.damageFlash,
                        0.08
                    );


                if (
                    player.hp <=
                    0
                ) {

                    killPlayer();

                }


                player.survivalDamageTimer =
                    2.5;

            }

        }


        /*
            Regeneração leve fora do aperto.
        */
        if (
            player.energy <
            player.maxEnergy
        ) {

            player.energy =
                Math.min(

                    player.maxEnergy,

                    player.energy +
                    5.5 *
                    dt

                );

        }


        if (
            player.magic <
            player.maxMagic
        ) {

            player.magic =
                Math.min(

                    player.maxMagic,

                    player.magic +
                    2.8 *
                    dt

                );

        }

    }


    /* =========================================================
       COMER / USAR ITEM
       ========================================================= */

    function useInventoryItem(
        id
    ) {

        const item =
            ITEMS[id];


        const player =
            state.player;


        if (
            !item ||
            !player ||
            !hasItem(id)
        ) {

            return false;

        }


        if (
            item.category ===
            "food"
        ) {

            player.hunger =
                Math.min(

                    player.maxHunger,

                    player.hunger +
                    (
                        item.hunger ||
                        0
                    )

                );


            removeItem(
                id,
                1
            );


            createBurst(

                player.x,

                player.y - 15,

                "#e7c67a",

                8,

                {
                    shape:
                        "spark"
                }

            );


            return true;

        }


        if (
            id ===
            "pocao"
        ) {

            if (
                player.hp >=
                player.maxHp
            ) {

                return false;

            }


            player.hp =
                Math.min(

                    player.maxHp,

                    player.hp +
                    item.heal

                );


            removeItem(
                id,
                1
            );


            createBurst(

                player.x,
                player.y,

                "#d95161",

                16,

                {
                    shape:
                        "spark",

                    glow:
                        6
                }

            );


            return true;

        }


        if (
            id ===
            "elixir"
        ) {

            if (
                player.energy >=
                player.maxEnergy
            ) {

                return false;

            }


            player.energy =
                Math.min(

                    player.maxEnergy,

                    player.energy +
                    item.energy

                );


            removeItem(
                id,
                1
            );


            createBurst(

                player.x,
                player.y,

                "#68b6e8",

                15,

                {
                    shape:
                        "spark",

                    glow:
                        6
                }

            );


            return true;

        }


        if (
            item.buff
        ) {

            removeItem(
                id,
                1
            );


            player.activePotionBuffs =
                player.activePotionBuffs
                    .filter(
                        buff =>
                            buff.type !==
                            item.buff
                    );


            player.activePotionBuffs
                .push({

                    type:
                        item.buff,

                    timer:
                        item.duration ||
                        15

                });


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    18,

                maxRadius:
                    72,

                life:
                    0.6,

                color:
                    "#efca79",

                lineWidth:
                    3

            });


            return true;

        }


        return false;

    }


    function updatePotionBuffs(
        dt
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        for (
            const buff of
            player.activePotionBuffs
        ) {

            buff.timer -=
                dt;

        }


        player.activePotionBuffs =
            player.activePotionBuffs
                .filter(
                    buff =>
                        buff.timer >
                        0
                );

    }


    /* =========================================================
       DESCANSO / DORMIR
       ========================================================= */

    function sleepPlayer() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.fatigue =
            player.maxFatigue;


        player.energy =
            player.maxEnergy;


        player.hp =
            Math.min(

                player.maxHp,

                player.hp +
                player.maxHp *
                0.28

            );


        createBurst(

            player.x,
            player.y,

            "#a8bcdf",

            18,

            {
                shape:
                    "spark",

                speedMin:
                    20,

                speedMax:
                    80
            }

        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Você descansou."
            );

        }

    }


    /* =========================================================
       PLAYER PROJECTILES
       ========================================================= */

    function spawnProjectile(
        data
    ) {

        const direction =
            normalize(
                data.dx,
                data.dy
            );


        if (
            direction.length <=
            0.001
        ) {

            return null;

        }


        const projectile = {

            id:
                uid("projectile"),

            owner:
                data.owner ||
                "player",

            sourceId:
                data.sourceId ||
                null,

            type:
                data.type ||
                "magic",

            x:
                data.x,

            y:
                data.y,

            previousX:
                data.x,

            previousY:
                data.y,

            vx:
                direction.x *
                (
                    data.speed ||
                    350
                ),

            vy:
                direction.y *
                (
                    data.speed ||
                    350
                ),

            radius:
                data.radius ||
                7,

            damage:
                data.damage ||
                10,

            life:
                data.life ||
                2,

            maxLife:
                data.life ||
                2,

            color:
                data.color ||
                "#ffffff",

            trailColor:
                data.trailColor ||
                data.color ||
                "#ffffff",

            trailShape:
                data.trailShape ||
                "spark",

            glow:
                data.glow ||
                0,

            pierce:
                data.pierce ||
                0,

            hitIds:
                new Set(),

            impactStyle:
                data.impactStyle ||
                "normal",

            slow:
                data.slow ||
                null,

            knockback:
                data.knockback ||
                0,

            enemyProjectile:
                data.owner ===
                "enemy"

        };


        state.world.projectiles
            .push(
                projectile
            );


        return projectile;

    }


    function projectileHitsObstacle(
        projectile
    ) {

        if (
            state.houseMode
        ) {

            return false;

        }


        return circleHitsSolidObstacle(

            projectile.x,

            projectile.y,

            projectile.radius

        );

    }


    function createProjectileImpact(
        projectile,
        x,
        y
    ) {

        switch (
            projectile.impactStyle
        ) {

            case "arcaneBurst":

                createBurst(

                    x,
                    y,

                    projectile.color,

                    18,

                    {
                        speedMin:
                            35,

                        speedMax:
                            145,

                        sizeMin:
                            2,

                        sizeMax:
                            5,

                        shape:
                            "spark",

                        glow:
                            5
                    }

                );


                createRingEffect({

                    x,
                    y,

                    radius:
                        8,

                    maxRadius:
                        52,

                    life:
                        0.36,

                    color:
                        projectile.trailColor,

                    lineWidth:
                        3

                });

                break;


            case "fairyBloom":

                createBurst(

                    x,
                    y,

                    projectile.color,

                    20,

                    {
                        speedMin:
                            30,

                        speedMax:
                            125,

                        sizeMin:
                            2,

                        sizeMax:
                            6,

                        shape:
                            "star",

                        glow:
                            7
                    }

                );


                createRingEffect({

                    x,
                    y,

                    radius:
                        5,

                    maxRadius:
                        46,

                    life:
                        0.4,

                    color:
                        "#ffd0f4",

                    lineWidth:
                        2

                });

                break;


            case "shadowBurst":

                createBurst(

                    x,
                    y,

                    projectile.color,

                    15,

                    {
                        speedMin:
                            30,

                        speedMax:
                            115,

                        shape:
                            "smoke"
                    }

                );

                break;


            case "rockBurst":

                createBurst(

                    x,
                    y,

                    projectile.color,

                    12,

                    {
                        speedMin:
                            30,

                        speedMax:
                            105,

                        shape:
                            "rock",

                        gravity:
                            90
                    }

                );

                break;


            default:

                createBurst(

                    x,
                    y,

                    projectile.color,

                    10,

                    {
                        speedMin:
                            25,

                        speedMax:
                            95,

                        shape:
                            projectile.trailShape
                    }

                );

                break;

        }

    }


    function updateProjectiles(
        dt
    ) {

        for (
            const projectile of
            state.world.projectiles
        ) {

            projectile.life -=
                dt;


            if (
                projectile.life <=
                0
            ) {

                continue;

            }


            projectile.previousX =
                projectile.x;


            projectile.previousY =
                projectile.y;


            projectile.x +=
                projectile.vx *
                dt;


            projectile.y +=
                projectile.vy *
                dt;


            /*
                Rastro.
            */
            const velocity =
                normalize(
                    projectile.vx,
                    projectile.vy
                );


            if (
                Math.random() <
                0.88
            ) {

                spawnParticle({

                    x:
                        projectile.x -
                        velocity.x *
                        projectile.radius,

                    y:
                        projectile.y -
                        velocity.y *
                        projectile.radius,

                    vx:
                        -velocity.x *
                        random(
                            5,
                            28
                        ) +
                        random(
                            -12,
                            12
                        ),

                    vy:
                        -velocity.y *
                        random(
                            5,
                            28
                        ) +
                        random(
                            -12,
                            12
                        ),

                    life:
                        random(
                            0.18,
                            0.4
                        ),

                    size:
                        random(
                            1.5,
                            4
                        ),

                    color:
                        projectile.trailColor,

                    shape:
                        projectile.trailShape,

                    glow:
                        projectile.glow

                });

            }


            if (
                projectile.owner ===
                "player"
            ) {

                for (
                    const enemy of
                    state.world.enemies
                ) {

                    if (
                        enemy.dead ||
                        projectile.hitIds
                            .has(
                                enemy.id
                            )
                    ) {

                        continue;

                    }


                    if (
                        !circleCircleCollision(

                            projectile.x,
                            projectile.y,
                            projectile.radius,

                            enemy.x,
                            enemy.y,
                            enemy.radius

                        )
                    ) {

                        continue;

                    }


                    projectile
                        .hitIds
                        .add(
                            enemy.id
                        );


                    damageEnemy(

                        enemy,

                        projectile.damage,

                        {
                            hitColor:
                                projectile.color,

                            particleShape:
                                projectile.trailShape
                        }

                    );


                    createProjectileImpact(

                        projectile,

                        projectile.x,
                        projectile.y

                    );


                    if (
                        projectile.knockback >
                        0
                    ) {

                        pushEnemy(

                            enemy,

                            velocity.x,

                            velocity.y,

                            projectile.knockback

                        );

                    }


                    if (
                        projectile.pierce >
                        0
                    ) {

                        projectile.pierce--;

                    }

                    else {

                        projectile.life =
                            0;


                        break;

                    }

                }

            }

            else {

                if (
                    !state.player.dead &&
                    circleCircleCollision(

                        projectile.x,
                        projectile.y,
                        projectile.radius,

                        state.player.x,
                        state.player.y,
                        state.player.radius

                    )
                ) {

                    const source =
                        state.world.enemies
                            .find(
                                enemy =>
                                    enemy.id ===
                                    projectile.sourceId
                            );


                    damagePlayer(

                        projectile.damage,

                        source ||
                        {
                            x:
                                projectile.previousX,

                            y:
                                projectile.previousY
                        }

                    );


                    if (
                        projectile.slow
                    ) {

                        state.player.slowTimer =
                            Math.max(

                                state.player.slowTimer ||
                                0,

                                projectile.slow.duration ||
                                1.5

                            );


                        state.player.slowMultiplier =
                            projectile.slow.multiplier ||
                            0.7;

                    }


                    createProjectileImpact(

                        projectile,

                        projectile.x,
                        projectile.y

                    );


                    projectile.life =
                        0;

                }

            }


            if (
                projectile.life >
                0 &&
                projectileHitsObstacle(
                    projectile
                )
            ) {

                createProjectileImpact(

                    projectile,

                    projectile.x,
                    projectile.y

                );


                projectile.life =
                    0;

            }

        }


        state.world.projectiles =
            state.world
                .projectiles
                .filter(
                    projectile =>
                        projectile.life >
                        0
                );

    }


    /* =========================================================
       EMPURRÃO
       ========================================================= */

    function pushEnemy(
        enemy,
        dx,
        dy,
        power
    ) {

        if (
            !enemy ||
            enemy.dead ||
            enemy.stationary
        ) {

            return;

        }


        const steps =
            4;


        const step =
            power /
            steps;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const nx =
                enemy.x +
                dx *
                step;


            const ny =
                enemy.y +
                dy *
                step;


            if (
                !circleHitsSolidObstacle(

                    nx,
                    ny,
                    enemy.radius

                )
            ) {

                enemy.x =
                    nx;


                enemy.y =
                    ny;

            }

            else {

                break;

            }

        }

    }


    /* =========================================================
       MELEE
       ========================================================= */

    function hitEnemiesInArc(
        data
    ) {

        const originX =
            data.x;


        const originY =
            data.y;


        const direction =
            normalize(
                data.dx,
                data.dy
            );


        const range =
            data.range;


        const dotMinimum =
            data.dotMinimum ??
            0;


        const hit = [];


        for (
            const enemy of
            state.world.enemies
        ) {

            if (
                enemy.dead
            ) {

                continue;

            }


            const toEnemy =
                normalize(

                    enemy.x -
                    originX,

                    enemy.y -
                    originY

                );


            if (
                toEnemy.length >
                range +
                enemy.radius
            ) {

                continue;

            }


            const dot =

                direction.x *
                toEnemy.x +

                direction.y *
                toEnemy.y;


            if (
                dot <
                dotMinimum
            ) {

                continue;

            }


            const dealt =
                damageEnemy(

                    enemy,

                    data.damage,

                    {
                        hitColor:
                            data.hitColor,

                        particleShape:
                            data.particleShape
                    }

                );


            if (
                dealt >
                0
            ) {

                hit.push(
                    enemy
                );


                if (
                    data.knockback
                ) {

                    pushEnemy(

                        enemy,

                        direction.x,

                        direction.y,

                        data.knockback

                    );

                }

            }

        }


        return hit;

    }


    function hitEnemiesInRadius(
        x,
        y,
        radius,
        damage,
        options = {}
    ) {

        const hits =
            [];


        for (
            const enemy of
            state.world.enemies
        ) {

            if (
                enemy.dead
            ) {

                continue;

            }


            if (
                distance(

                    x,
                    y,

                    enemy.x,
                    enemy.y

                ) >

                radius +
                enemy.radius
            ) {

                continue;

            }


            const dealt =
                damageEnemy(

                    enemy,

                    damage,

                    options

                );


            if (
                dealt >
                0
            ) {

                hits.push(
                    enemy
                );


                if (
                    options.stun
                ) {

                    enemy.stunTimer =
                        Math.max(

                            enemy.stunTimer,

                            options.stun

                        );

                }


                if (
                    options.knockback
                ) {

                    const push =
                        normalize(

                            enemy.x -
                            x,

                            enemy.y -
                            y

                        );


                    pushEnemy(

                        enemy,

                        push.x,

                        push.y,

                        options.knockback

                    );

                }

            }

        }


        return hits;

    }


    /* =========================================================
       ATAQUE BÁSICO
       ========================================================= */

    function performBasicAttack() {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            player.stunTimer >
            0 ||
            player.attackCooldown >
            0 ||
            state.transition ||
            state.paused
        ) {

            return false;

        }


        const character =
            currentCharacter();


        const attack =
            character.basicAttack;


        const direction =
            pointerDirectionFromPlayer();


        updatePlayerFacing(

            direction.x,
            direction.y

        );


        player.attackCooldown =
            GAME_CONFIG
                .baseAttackCooldown;


        player.attackAnim =
            0.25;


        const damage =

            getPlayerAttackPower() *

            attack.damageMultiplier;


        switch (
            character.id
        ) {

            case "kaelion":

                basicAttackKaelion(

                    attack,
                    direction,
                    damage

                );

                break;


            case "theron":

                basicAttackTheron(

                    attack,
                    direction,
                    damage

                );

                break;


            case "grumgar":

                basicAttackGrumgar(

                    attack,
                    direction,
                    damage

                );

                break;


            case "lirael":

                basicAttackLirael(

                    attack,
                    direction,
                    damage

                );

                break;


            case "zephyr":

                basicAttackZephyr(

                    attack,
                    direction,
                    damage

                );

                break;


            default:

                return false;

        }


        return true;

    }


    /* =========================================================
       KAELION — CLIQUE
       ========================================================= */

    function basicAttackKaelion(
        attack,
        direction,
        damage
    ) {

        const player =
            state.player;


        const startX =

            player.x +

            direction.x *
            22;


        const startY =

            player.y +

            direction.y *
            22;


        spawnProjectile({

            owner:
                "player",

            sourceId:
                "player",

            type:
                "kaelionOrb",

            x:
                startX,

            y:
                startY,

            dx:
                direction.x,

            dy:
                direction.y,

            speed:
                attack.speed,

            radius:
                attack.radius,

            damage,

            life:
                attack.range /
                attack.speed,

            color:
                attack.color,

            trailColor:
                attack.trailColor,

            trailShape:
                "spark",

            glow:
                7,

            impactStyle:
                attack.impactStyle

        });


        createRingEffect({

            x:
                startX,

            y:
                startY,

            radius:
                5,

            maxRadius:
                24,

            life:
                0.22,

            color:
                "#ffd08a",

            lineWidth:
                2

        });


        createDirectionalBurst(

            startX,
            startY,

            -direction.x,
            -direction.y,

            "#f0a154",

            8,

            {
                speedMin:
                    20,

                speedMax:
                    60,

                spread:
                    1,

                shape:
                    "spark",

                glow:
                    4
            }

        );

    }


    /* =========================================================
       THERON — CLIQUE
       ========================================================= */

    function basicAttackTheron(
        attack,
        direction,
        damage
    ) {

        const player =
            state.player;


        const angle =
            Math.atan2(
                direction.y,
                direction.x
            );


        createSlashEffect({

            x:
                player.x,

            y:
                player.y,

            radius:
                attack.range,

            angle,

            arc:
                Math.PI *
                0.88,

            life:
                0.23,

            color:
                "#e8edf0",

            secondaryColor:
                "#aeb8bf",

            lineWidth:
                8

        });


        const hits =
            hitEnemiesInArc({

                x:
                    player.x,

                y:
                    player.y,

                dx:
                    direction.x,

                dy:
                    direction.y,

                range:
                    attack.range,

                dotMinimum:
                    attack.arcDot,

                damage,

                hitColor:
                    "#e7e8e5",

                particleShape:
                    "metalSpark",

                knockback:
                    12

            });


        createDirectionalBurst(

            player.x +
            direction.x *
            45,

            player.y +
            direction.y *
            45,

            direction.x,
            direction.y,

            "#eef1ef",

            hits.length
                ? 14
                : 7,

            {
                speedMin:
                    40,

                speedMax:
                    135,

                spread:
                    0.75,

                shape:
                    "metalSpark",

                stretch:
                    2
            }

        );


        if (
            hits.length
        ) {

            addScreenShake(
                3,
                0.1
            );

        }

    }


    /* =========================================================
       GRUMGAR — CLIQUE
       ========================================================= */

    function basicAttackGrumgar(
        attack,
        direction,
        damage
    ) {

        const player =
            state.player;


        const impactX =

            player.x +

            direction.x *
            46;


        const impactY =

            player.y +

            direction.y *
            46;


        createShockwaveEffect({

            x:
                impactX,

            y:
                impactY,

            radius:
                10,

            maxRadius:
                attack.splashRadius,

            life:
                0.35,

            color:
                "#a28d65",

            lineWidth:
                5

        });


        hitEnemiesInRadius(

            impactX,

            impactY,

            attack.splashRadius,

            damage,

            {
                hitColor:
                    "#aa9167",

                particleShape:
                    "rock",

                knockback:
                    24
            }

        );


        createBurst(

            impactX,

            impactY,

            "#8c795b",

            18,

            {
                speedMin:
                    35,

                speedMax:
                    135,

                sizeMin:
                    2,

                sizeMax:
                    7,

                shape:
                    "rock",

                gravity:
                    125
            }

        );


        createBurst(

            impactX,

            impactY,

            "#c3ae89",

            12,

            {
                speedMin:
                    20,

                speedMax:
                    85,

                shape:
                    "dust"
            }

        );


        addScreenShake(
            5,
            0.14
        );

    }


    /* =========================================================
       LIRAEL — CLIQUE
       ========================================================= */

    function basicAttackLirael(
        attack,
        direction,
        damage
    ) {

        const player =
            state.player;


        const startX =

            player.x +

            direction.x *
            20;


        const startY =

            player.y +

            direction.y *
            20;


        spawnProjectile({

            owner:
                "player",

            sourceId:
                "player",

            type:
                "liraelSpark",

            x:
                startX,

            y:
                startY,

            dx:
                direction.x,

            dy:
                direction.y,

            speed:
                attack.speed,

            radius:
                attack.radius,

            damage,

            life:
                attack.range /
                attack.speed,

            color:
                attack.color,

            trailColor:
                attack.trailColor,

            trailShape:
                "star",

            glow:
                9,

            impactStyle:
                attack.impactStyle

        });


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            spawnParticle({

                x:
                    startX +
                    random(
                        -8,
                        8
                    ),

                y:
                    startY +
                    random(
                        -8,
                        8
                    ),

                vx:
                    random(
                        -20,
                        20
                    ),

                vy:
                    random(
                        -30,
                        10
                    ),

                life:
                    random(
                        0.35,
                        0.7
                    ),

                size:
                    random(
                        2,
                        5
                    ),

                color:
                    i % 2
                        ? "#ffb8eb"
                        : "#fff0b3",

                shape:
                    "star",

                glow:
                    6

            });

        }

    }


    /* =========================================================
       ZEPHYR — CLIQUE
       ========================================================= */

    function basicAttackZephyr(
        attack,
        direction,
        damage
    ) {

        const player =
            state.player;


        const angle =
            Math.atan2(
                direction.y,
                direction.x
            );


        /*
            Primeiro corte.
        */
        createSlashEffect({

            x:
                player.x,

            y:
                player.y,

            radius:
                91,

            angle:
                angle -
                0.12,

            arc:
                Math.PI *
                0.72,

            life:
                0.27,

            color:
                "#b28af4",

            secondaryColor:
                "#6c48aa",

            lineWidth:
                7

        });


        /*
            Segundo rasgo visual.
        */
        createSlashEffect({

            x:
                player.x +
                direction.x *
                10,

            y:
                player.y +
                direction.y *
                10,

            radius:
                72,

            angle:
                angle +
                0.18,

            arc:
                Math.PI *
                0.55,

            life:
                0.23,

            color:
                "#d1b4ff",

            secondaryColor:
                "#8155c8",

            lineWidth:
                4

        });


        hitEnemiesInArc({

            x:
                player.x,

            y:
                player.y,

            dx:
                direction.x,

            dy:
                direction.y,

            range:
                attack.range,

            dotMinimum:
                -0.04,

            damage,

            hitColor:
                "#a675f0",

            particleShape:
                "afterimage",

            knockback:
                10

        });


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            spawnParticle({

                x:
                    player.x +
                    random(
                        -14,
                        14
                    ),

                y:
                    player.y +
                    random(
                        -14,
                        14
                    ),

                vx:
                    -direction.x *
                    random(
                        30,
                        95
                    ) +
                    random(
                        -18,
                        18
                    ),

                vy:
                    -direction.y *
                    random(
                        30,
                        95
                    ) +
                    random(
                        -18,
                        18
                    ),

                life:
                    random(
                        0.22,
                        0.5
                    ),

                size:
                    random(
                        3,
                        7
                    ),

                color:
                    i % 2
                        ? "#8e65d6"
                        : "#c8aaff",

                shape:
                    "afterimage",

                alpha:
                    0.7

            });

        }

    }


    /* =========================================================
       SKILLS — HELPERS
       ========================================================= */

    function getSkill(
        slot
    ) {

        return (

            CLASS_SKILLS[
                state.player
                    ?.characterId
            ]?.[
                slot
            ] ||

            null

        );

    }


    function skillReady(
        slot
    ) {

        const skill =
            getSkill(
                slot
            );


        const player =
            state.player;


        if (
            !skill ||
            !player
        ) {

            return false;

        }


        if (
            player.level <
            skill.level
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(

                    `${skill.name} libera no nível ${skill.level}.`

                );

            }


            return false;

        }


        if (
            player.skillCooldowns[
                slot
            ] >
            0
        ) {

            return false;

        }


        const value =
            player[
                skill.costType
            ];


        if (
            value <
            skill.cost
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(

                    skill.costType ===
                    "magic"

                        ? "Magia insuficiente."

                        : "Energia insuficiente."

                );

            }


            return false;

        }


        return true;

    }


    function paySkillCost(
        slot
    ) {

        const skill =
            getSkill(
                slot
            );


        if (!skill) {

            return false;

        }


        state.player[
            skill.costType
        ] -=
            skill.cost;


        state.player.skillCooldowns[
            slot
        ] =
            skill.cooldown;


        return true;

    }


    function useSkill(
        slot
    ) {

        if (
            !skillReady(
                slot
            )
        ) {

            return false;

        }


        const player =
            state.player;


        if (
            player.dead ||
            player.stunTimer >
            0 ||
            state.transition ||
            state.paused
        ) {

            return false;

        }


        const direction =
            pointerDirectionFromPlayer();


        updatePlayerFacing(

            direction.x,
            direction.y

        );


        paySkillCost(
            slot
        );


        switch (
            player.characterId
        ) {

            case "kaelion":

                useKaelionSkill(
                    slot,
                    direction
                );

                break;


            case "theron":

                useTheronSkill(
                    slot,
                    direction
                );

                break;


            case "grumgar":

                useGrumgarSkill(
                    slot,
                    direction
                );

                break;


            case "lirael":

                useLiraelSkill(
                    slot,
                    direction
                );

                break;


            case "zephyr":

                useZephyrSkill(
                    slot,
                    direction
                );

                break;

        }


        return true;

    }


    /* =========================================================
       KAELION Q/R/F
       ========================================================= */

    function useKaelionSkill(
        slot,
        direction
    ) {

        const player =
            state.player;


        const skill =
            getSkill(
                slot
            );


        const damageBase =
            getPlayerAttackPower();


        if (
            slot ===
            "q"
        ) {

            spawnProjectile({

                owner:
                    "player",

                sourceId:
                    "player",

                type:
                    "memoryOrb",

                x:
                    player.x +
                    direction.x *
                    28,

                y:
                    player.y +
                    direction.y *
                    28,

                dx:
                    direction.x,

                dy:
                    direction.y,

                speed:
                    345,

                radius:
                    14,

                damage:
                    skill.damage +
                    damageBase *
                    0.7,

                life:
                    skill.range /
                    345,

                color:
                    "#f08b3e",

                trailColor:
                    "#ffd18b",

                trailShape:
                    "spark",

                glow:
                    11,

                impactStyle:
                    "arcaneBurst",

                pierce:
                    1

            });


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    18,

                maxRadius:
                    55,

                life:
                    0.42,

                color:
                    "#f2aa55",

                lineWidth:
                    4

            });


            return;

        }


        if (
            slot ===
            "r"
        ) {

            const damage =

                skill.damage +

                damageBase *
                0.8;


            hitEnemiesInRadius(

                player.x,

                player.y,

                skill.range,

                damage,

                {
                    hitColor:
                        "#f39a48",

                    particleShape:
                        "spark",

                    knockback:
                        32
                }

            );


            for (
                let ring = 0;
                ring < 3;
                ring++
            ) {

                createRingEffect({

                    x:
                        player.x,

                    y:
                        player.y,

                    radius:
                        20 +
                        ring *
                        18,

                    maxRadius:
                        skill.range -
                        ring *
                        15,

                    life:
                        0.55 +
                        ring *
                        0.08,

                    color:

                        ring % 2

                            ? "#ffcb7d"

                            : "#e67d32",

                    lineWidth:
                        5 -
                        ring

                });

            }


            createBurst(

                player.x,
                player.y,

                "#f3a34f",

                34,

                {
                    speedMin:
                        55,

                    speedMax:
                        210,

                    lifeMax:
                        0.8,

                    shape:
                        "spark",

                    glow:
                        8
                }

            );


            addScreenShake(
                7,
                0.22
            );


            return;

        }


        /*
            F:
            chuva arcana perto do cursor.
        */
        const targetX =
            state.pointer.worldX;


        const targetY =
            state.pointer.worldY;


        const radius =
            skill.range;


        createRingEffect({

            x:
                targetX,

            y:
                targetY,

            radius:
                35,

            maxRadius:
                radius,

            life:
                0.75,

            color:
                "#e88742",

            lineWidth:
                3

        });


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI * 2
                );


            const d =
                random(
                    10,
                    radius * 0.85
                );


            const x =

                targetX +

                Math.cos(
                    angle
                ) *
                d;


            const y =

                targetY +

                Math.sin(
                    angle
                ) *
                d;


            addEffect({

                type:
                    "arcaneStrike",

                x,

                y,

                life:
                    0.55 +
                    i *
                    0.045,

                color:
                    "#f49b4f",

                secondaryColor:
                    "#ffe0a0",

                radius:
                    22

            });


            createBurst(

                x,
                y,

                "#f8b361",

                10,

                {
                    speedMin:
                        20,

                    speedMax:
                        100,

                    shape:
                        "spark",

                    glow:
                        6
                }

            );

        }


        hitEnemiesInRadius(

            targetX,

            targetY,

            radius,

            skill.damage +
            damageBase *
            1.05,

            {
                hitColor:
                    "#f5a24e",

                particleShape:
                    "spark"
            }

        );


        addScreenShake(
            8,
            0.25
        );

    }


    /* =========================================================
       THERON Q/R/F
       ========================================================= */

    function useTheronSkill(
        slot,
        direction
    ) {

        const player =
            state.player;


        const skill =
            getSkill(
                slot
            );


        const baseDamage =
            getPlayerAttackPower();


        if (
            slot ===
            "q"
        ) {

            createSlashEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    skill.range,

                angle:
                    Math.atan2(
                        direction.y,
                        direction.x
                    ),

                arc:
                    Math.PI *
                    1.05,

                life:
                    0.32,

                color:
                    "#f1f4f5",

                secondaryColor:
                    "#85929c",

                lineWidth:
                    12

            });


            hitEnemiesInArc({

                x:
                    player.x,

                y:
                    player.y,

                dx:
                    direction.x,

                dy:
                    direction.y,

                range:
                    skill.range,

                dotMinimum:
                    -0.1,

                damage:
                    skill.damage +
                    baseDamage *
                    0.85,

                hitColor:
                    "#eef2f4",

                particleShape:
                    "metalSpark",

                knockback:
                    28

            });


            createDirectionalBurst(

                player.x +
                direction.x *
                55,

                player.y +
                direction.y *
                55,

                direction.x,
                direction.y,

                "#dce1e4",

                17,

                {
                    speedMin:
                        40,

                    speedMax:
                        160,

                    shape:
                        "metalSpark",

                    stretch:
                        2.2
                }

            );


            addScreenShake(
                4,
                0.14
            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            player.shieldTimer =
                3.2;


            player.damageReduction =
                0.56;


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    20,

                maxRadius:
                    65,

                life:
                    0.8,

                color:
                    "#d7e3ea",

                lineWidth:
                    5

            });


            addEffect({

                type:
                    "shield",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    31,

                life:
                    3.2,

                color:
                    "#b9d0dd",

                secondaryColor:
                    "#ffffff",

                lineWidth:
                    3

            });


            return;

        }


        /*
            F:
            golpe em sequência.
        */
        const angle =
            Math.atan2(
                direction.y,
                direction.x
            );


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            createSlashEffect({

                x:
                    player.x +
                    direction.x *
                    i *
                    13,

                y:
                    player.y +
                    direction.y *
                    i *
                    13,

                radius:
                    skill.range -
                    i *
                    12,

                angle:
                    angle +
                    (
                        i -
                        1
                    ) *
                    0.22,

                arc:
                    Math.PI *
                    0.92,

                life:
                    0.3 +
                    i *
                    0.07,

                color:

                    i ===
                    1

                        ? "#ffffff"

                        : "#bdc7cc",

                lineWidth:
                    11 -
                    i *
                    2

            });

        }


        hitEnemiesInArc({

            x:
                player.x,

            y:
                player.y,

            dx:
                direction.x,

            dy:
                direction.y,

            range:
                skill.range,

            dotMinimum:
                -0.22,

            damage:
                skill.damage +
                baseDamage *
                1.2,

            hitColor:
                "#ffffff",

            particleShape:
                "metalSpark",

            knockback:
                42

        });


        createDirectionalBurst(

            player.x +
            direction.x *
            80,

            player.y +
            direction.y *
            80,

            direction.x,
            direction.y,

            "#f3f5f5",

            30,

            {
                speedMin:
                    60,

                speedMax:
                    210,

                spread:
                    0.9,

                shape:
                    "metalSpark",

                stretch:
                    2.5
            }

        );


        addScreenShake(
            8,
            0.25
        );

    }


    /* =========================================================
       GRUMGAR Q/R/F
       ========================================================= */

    function useGrumgarSkill(
        slot,
        direction
    ) {

        const player =
            state.player;


        const skill =
            getSkill(
                slot
            );


        const baseDamage =
            getPlayerAttackPower();


        if (
            slot ===
            "q"
        ) {

            const x =

                player.x +

                direction.x *
                65;


            const y =

                player.y +

                direction.y *
                65;


            hitEnemiesInRadius(

                x,
                y,

                skill.range *
                0.75,

                skill.damage +
                baseDamage,

                {
                    hitColor:
                        "#9a835e",

                    particleShape:
                        "rock",

                    knockback:
                        48,

                    stun:
                        0.35
                }

            );


            createShockwaveEffect({

                x,

                y,

                radius:
                    18,

                maxRadius:
                    skill.range,

                life:
                    0.48,

                color:
                    "#9a8563",

                lineWidth:
                    6

            });


            createBurst(

                x,
                y,

                "#8d7655",

                28,

                {
                    speedMin:
                        40,

                    speedMax:
                        170,

                    sizeMax:
                        8,

                    shape:
                        "rock",

                    gravity:
                        140
                }

            );


            addScreenShake(
                9,
                0.25
            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            hitEnemiesInRadius(

                player.x,
                player.y,

                skill.range,

                skill.damage +
                baseDamage *
                0.35,

                {
                    hitColor:
                        "#b19a70",

                    particleShape:
                        "dust",

                    knockback:
                        52,

                    stun:
                        1.1
                }

            );


            for (
                let i = 0;
                i < 3;
                i++
            ) {

                createRingEffect({

                    x:
                        player.x,

                    y:
                        player.y,

                    radius:
                        25 +
                        i *
                        16,

                    maxRadius:
                        skill.range -
                        i *
                        15,

                    life:
                        0.5 +
                        i *
                        0.08,

                    color:
                        "#ad9670",

                    lineWidth:
                        5 -
                        i

                });

            }


            createBurst(

                player.x,
                player.y,

                "#b9a17a",

                24,

                {
                    speedMin:
                        45,

                    speedMax:
                        180,

                    shape:
                        "dust"
                }

            );


            addScreenShake(
                8,
                0.3
            );


            return;

        }


        /*
            F:
            terra partida seguindo a direção.
        */
        const segments =
            6;


        for (
            let i = 1;
            i <= segments;
            i++
        ) {

            const ratio =
                i /
                segments;


            const x =

                player.x +

                direction.x *
                skill.range *
                ratio;


            const y =

                player.y +

                direction.y *
                skill.range *
                ratio;


            createShockwaveEffect({

                x,
                y,

                radius:
                    8,

                maxRadius:
                    42 +
                    i *
                    3,

                life:
                    0.38 +
                    i *
                    0.04,

                color:
                    "#8c7655",

                lineWidth:
                    5

            });


            createBurst(

                x,
                y,

                "#79664c",

                9,

                {
                    speedMin:
                        30,

                    speedMax:
                        105,

                    shape:
                        "rock",

                    gravity:
                        120
                }

            );

        }


        hitEnemiesInArc({

            x:
                player.x,

            y:
                player.y,

            dx:
                direction.x,

            dy:
                direction.y,

            range:
                skill.range,

            dotMinimum:
                0.3,

            damage:
                skill.damage +
                baseDamage *
                1.25,

            hitColor:
                "#9f8761",

            particleShape:
                "rock",

            knockback:
                68

        });


        addScreenShake(
            12,
            0.35
        );

    }


    /* =========================================================
       LIRAEL Q/R/F
       ========================================================= */

    function useLiraelSkill(
        slot,
        direction
    ) {

        const player =
            state.player;


        const skill =
            getSkill(
                slot
            );


        const baseDamage =
            getPlayerAttackPower();


        if (
            slot ===
            "q"
        ) {

            const heal =

                player.maxHp *
                0.18 +

                18;


            player.hp =
                Math.min(

                    player.maxHp,

                    player.hp +
                    heal

                );


            addDamageNumber(

                player.x,
                player.y - 30,

                `+${Math.round(heal)}`,

                "#a8f1ba",

                {
                    size:
                        18
                }

            );


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    16,

                maxRadius:
                    72,

                life:
                    0.75,

                color:
                    "#f2a9dd",

                lineWidth:
                    3

            });


            createBurst(

                player.x,
                player.y,

                "#f4afe3",

                26,

                {
                    speedMin:
                        20,

                    speedMax:
                        110,

                    shape:
                        "star",

                    glow:
                        8
                }

            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            spawnProjectile({

                owner:
                    "player",

                sourceId:
                    "player",

                type:
                    "fairyArrow",

                x:
                    player.x +
                    direction.x *
                    25,

                y:
                    player.y +
                    direction.y *
                    25,

                dx:
                    direction.x,

                dy:
                    direction.y,

                speed:
                    620,

                radius:
                    9,

                damage:
                    skill.damage +
                    baseDamage *
                    0.75,

                life:
                    skill.range /
                    620,

                color:
                    "#ff9de1",

                trailColor:
                    "#fff1ae",

                trailShape:
                    "star",

                glow:
                    10,

                impactStyle:
                    "fairyBloom",

                pierce:
                    2

            });


            createBurst(

                player.x +
                direction.x *
                20,

                player.y +
                direction.y *
                20,

                "#ffb5e7",

                12,

                {
                    speedMin:
                        20,

                    speedMax:
                        90,

                    shape:
                        "star"
                }

            );


            return;

        }


        /*
            F:
            chuva feérica.
        */
        const targetX =
            state.pointer.worldX;


        const targetY =
            state.pointer.worldY;


        createRingEffect({

            x:
                targetX,

            y:
                targetY,

            radius:
                20,

            maxRadius:
                skill.range,

            life:
                0.8,

            color:
                "#f2aadf",

            lineWidth:
                3

        });


        for (
            let i = 0;
            i < 26;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI * 2
                );


            const dist =
                Math.sqrt(
                    Math.random()
                ) *
                skill.range;


            spawnParticle({

                x:
                    targetX +
                    Math.cos(
                        angle
                    ) *
                    dist,

                y:
                    targetY +
                    Math.sin(
                        angle
                    ) *
                    dist -
                    random(
                        20,
                        80
                    ),

                vx:
                    random(
                        -10,
                        10
                    ),

                vy:
                    random(
                        60,
                        145
                    ),

                life:
                    random(
                        0.55,
                        1
                    ),

                size:
                    random(
                        2,
                        6
                    ),

                color:
                    i % 3 ===
                    0
                        ? "#fff1a8"
                        : "#f3a9dc",

                shape:
                    "star",

                glow:
                    7
            });

        }


        hitEnemiesInRadius(

            targetX,

            targetY,

            skill.range,

            skill.damage +
            baseDamage *
            0.95,

            {
                hitColor:
                    "#f5b4e2",

                particleShape:
                    "star"
            }

        );

    }


    /* =========================================================
       ZEPHYR Q/R/F
       ========================================================= */

    function useZephyrSkill(
        slot,
        direction
    ) {

        const player =
            state.player;


        const skill =
            getSkill(
                slot
            );


        const baseDamage =
            getPlayerAttackPower();


        if (
            slot ===
            "q"
        ) {

            player.adaptiveBuff =
                true;


            player.adaptiveTimer =
                6;


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    18,

                maxRadius:
                    80,

                life:
                    0.72,

                color:
                    "#9a6ce2",

                lineWidth:
                    4

            });


            createBurst(

                player.x,
                player.y,

                "#9a6ce2",

                26,

                {
                    speedMin:
                        25,

                    speedMax:
                        125,

                    shape:
                        "afterimage"
                }

            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            /*
                Dash de combate do Zephyr.

                NÃO substitui o Dash universal.
            */
            startZephyrCombatDash(

                direction,

                skill.damage +
                baseDamage *
                0.8

            );


            return;

        }


        /*
            F:
            ruptura circular.
        */
        hitEnemiesInRadius(

            player.x,
            player.y,

            skill.range,

            skill.damage +
            baseDamage *
            1.05,

            {
                hitColor:
                    "#a978ee",

                particleShape:
                    "afterimage",

                knockback:
                    35
            }

        );


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            createSlashEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    75 +
                    i *
                    17,

                angle:
                    i *
                    (
                        Math.PI /
                        2.5
                    ),

                arc:
                    Math.PI *
                    0.62,

                life:
                    0.38 +
                    i *
                    0.04,

                color:

                    i % 2

                        ? "#b88df4"

                        : "#754bb7",

                lineWidth:
                    7 -
                    i *
                    0.7

            });

        }


        createBurst(

            player.x,
            player.y,

            "#a978ee",

            38,

            {
                speedMin:
                    40,

                speedMax:
                    190,

                sizeMax:
                    7,

                shape:
                    "afterimage",

                glow:
                    5
            }

        );


        addScreenShake(
            7,
            0.24
        );

    }


    /* =========================================================
       COOLDOWNS
       ========================================================= */

    function updatePlayerCooldowns(
        dt
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.attackCooldown =
            Math.max(

                0,

                player.attackCooldown -
                dt

            );


        player.dashCooldown =
            Math.max(

                0,

                player.dashCooldown -
                dt

            );


        for (
            const key of
            [
                "q",
                "r",
                "f"
            ]
        ) {

            player.skillCooldowns[
                key
            ] =
                Math.max(

                    0,

                    player.skillCooldowns[
                        key
                    ] -
                    dt

                );

        }


        player.invincible =
            Math.max(

                0,

                player.invincible -
                dt

            );


        player.stunTimer =
            Math.max(

                0,

                player.stunTimer -
                dt

            );


        player.slowTimer =
            Math.max(

                0,

                (
                    player.slowTimer ||
                    0
                ) -
                dt

            );


        player.attackAnim =
            Math.max(

                0,

                player.attackAnim -
                dt

            );


        player.hurtAnim =
            Math.max(

                0,

                player.hurtAnim -
                dt

            );


        player.shieldTimer =
            Math.max(

                0,

                player.shieldTimer -
                dt

            );


        if (
            player.shieldTimer <=
            0
        ) {

            player.damageReduction =
                0;

        }


        player.adaptiveTimer =
            Math.max(

                0,

                (
                    player.adaptiveTimer ||
                    0
                ) -
                dt

            );


        if (
            player.adaptiveTimer <=
            0
        ) {

            player.adaptiveBuff =
                false;

        }

    }


    /* =========================================================
       MOVIMENTO DO PLAYER
       ========================================================= */

    function getKeyboardMoveVector() {

        let dx =
            0;


        let dy =
            0;


        if (
            state.keys.has(
                "KeyA"
            ) ||
            state.keys.has(
                "ArrowLeft"
            )
        ) {

            dx -=
                1;

        }


        if (
            state.keys.has(
                "KeyD"
            ) ||
            state.keys.has(
                "ArrowRight"
            )
        ) {

            dx +=
                1;

        }


        if (
            state.keys.has(
                "KeyW"
            ) ||
            state.keys.has(
                "ArrowUp"
            )
        ) {

            dy -=
                1;

        }


        if (
            state.keys.has(
                "KeyS"
            ) ||
            state.keys.has(
                "ArrowDown"
            )
        ) {

            dy +=
                1;

        }


        return normalize(
            dx,
            dy
        );

    }


    function movePlayerAxis(
        dx,
        dy
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        if (
            Math.abs(dx) >
            0.0001
        ) {

            const nextX =
                player.x +
                dx;


            if (
                canPlayerMoveTo(

                    nextX,

                    player.y

                )
            ) {

                player.x =
                    nextX;

            }

        }


        if (
            Math.abs(dy) >
            0.0001
        ) {

            const nextY =
                player.y +
                dy;


            if (
                canPlayerMoveTo(

                    player.x,

                    nextY

                )
            ) {

                player.y =
                    nextY;

            }

        }

    }


    function updatePlayerMovement(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            player.stunTimer >
            0 ||
            state.transition ||
            state.paused
        ) {

            return;

        }


        /*
            Dash controla movimento sozinho.
        */
        if (
            player.playerDash ||
            player.zephyrDash
        ) {

            return;

        }


        const movement =
            getKeyboardMoveVector();


        if (
            movement.length <=
            0.001
        ) {

            return;

        }


        const speed =
            getPlayerMoveSpeed();


        const dx =

            movement.x *
            speed *
            dt;


        const dy =

            movement.y *
            speed *
            dt;


        movePlayerAxis(
            dx,
            dy
        );


        updatePlayerFacing(

            movement.x,
            movement.y

        );


        player.walkTime +=
            dt *
            (
                speed /
                65
            );

    }


    /* =========================================================
       DASH UNIVERSAL

       - Espaço
       - direção do mouse
       - sem dano
       - 1.25s cooldown
       - 8 Energia
       - iframe ~0.28s
       ========================================================= */

    function startUniversalDash() {

        const player =
            state.player;


        if (
            !player ||
            !player.abilities?.dash ||
            player.dead ||
            player.stunTimer >
            0 ||
            player.dashCooldown >
            0 ||
            player.playerDash ||
            player.zephyrDash ||
            state.paused ||
            state.transition
        ) {

            return false;

        }


        if (
            player.energy <
            8
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Energia insuficiente para Dash."
                );

            }


            return false;

        }


        const direction =
            pointerDirectionFromPlayer();


        const distanceToTravel =
            150;


        player.energy -=
            8;


        player.dashCooldown =
            1.25;


        player.invincible =
            Math.max(

                player.invincible,

                0.28

            );


        player.playerDash = {

            dx:
                direction.x,

            dy:
                direction.y,

            speed:
                780,

            remaining:
                distanceToTravel,

            duration:
                0.24,

            timer:
                0.24

        };


        updatePlayerFacing(

            direction.x,
            direction.y

        );


        createRingEffect({

            x:
                player.x,

            y:
                player.y,

            radius:
                10,

            maxRadius:
                42,

            life:
                0.25,

            color:
                "#d5e5ee",

            lineWidth:
                3

        });


        return true;

    }


    function updateUniversalDash(
        dt
    ) {

        const player =
            state.player;


        const dash =
            player?.playerDash;


        if (!dash) {

            return;

        }


        dash.timer -=
            dt;


        const requested =

            Math.min(

                dash.remaining,

                dash.speed *
                dt

            );


        /*
            Passos menores evitam atravessar
            paredes por velocidade alta.
        */
        const stepLength =
            11;


        const steps =
            Math.max(

                1,

                Math.ceil(
                    requested /
                    stepLength
                )

            );


        const step =
            requested /
            steps;


        let moved =
            0;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const nx =

                player.x +

                dash.dx *
                step;


            const ny =

                player.y +

                dash.dy *
                step;


            if (
                !canPlayerMoveTo(
                    nx,
                    ny
                )
            ) {

                dash.remaining =
                    0;


                break;

            }


            if (
                Math.random() <
                0.7
            ) {

                spawnParticle({

                    x:
                        player.x,

                    y:
                        player.y,

                    vx:
                        -dash.dx *
                        random(
                            25,
                            60
                        ),

                    vy:
                        -dash.dy *
                        random(
                            25,
                            60
                        ),

                    life:
                        random(
                            0.18,
                            0.4
                        ),

                    size:
                        random(
                            3,
                            7
                        ),

                    color:
                        "#c9dae2",

                    shape:
                        "afterimage",

                    alpha:
                        0.5

                });

            }


            player.x =
                nx;


            player.y =
                ny;


            moved +=
                step;

        }


        dash.remaining -=
            moved;


        if (
            dash.remaining <=
            0 ||
            dash.timer <=
            0
        ) {

            player.playerDash =
                null;


            createRingEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    8,

                maxRadius:
                    34,

                life:
                    0.22,

                color:
                    "#d5e5ee",

                lineWidth:
                    2

            });

        }

    }


    /* =========================================================
       DASH DE COMBATE DO ZEPHYR
       ========================================================= */

    function startZephyrCombatDash(
        direction,
        damage
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.invincible =
            Math.max(
                player.invincible,
                0.2
            );


        player.zephyrDash = {

            dx:
                direction.x,

            dy:
                direction.y,

            speed:
                640,

            remaining:
                190,

            damage,

            hitIds:
                new Set(),

            timer:
                0.32

        };


        createBurst(

            player.x,
            player.y,

            "#8d64d4",

            16,

            {
                speedMin:
                    30,

                speedMax:
                    110,

                shape:
                    "afterimage"
            }

        );

    }


    function updateZephyrCombatDash(
        dt
    ) {

        const player =
            state.player;


        const dash =
            player?.zephyrDash;


        if (!dash) {

            return;

        }


        dash.timer -=
            dt;


        const requested =

            Math.min(

                dash.remaining,

                dash.speed *
                dt

            );


        const steps =
            Math.max(

                1,

                Math.ceil(
                    requested /
                    10
                )

            );


        const step =
            requested /
            steps;


        let moved =
            0;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const nx =

                player.x +

                dash.dx *
                step;


            const ny =

                player.y +

                dash.dy *
                step;


            if (
                !canPlayerMoveTo(
                    nx,
                    ny
                )
            ) {

                dash.remaining =
                    0;


                break;

            }


            spawnParticle({

                x:
                    player.x,

                y:
                    player.y,

                vx:
                    random(
                        -20,
                        20
                    ),

                vy:
                    random(
                        -20,
                        20
                    ),

                life:
                    random(
                        0.18,
                        0.42
                    ),

                size:
                    random(
                        4,
                        8
                    ),

                color:
                    "#8256c6",

                shape:
                    "afterimage",

                alpha:
                    0.55

            });


            player.x =
                nx;


            player.y =
                ny;


            moved +=
                step;


            for (
                const enemy of
                state.world.enemies
            ) {

                if (
                    enemy.dead ||
                    dash.hitIds
                        .has(
                            enemy.id
                        )
                ) {

                    continue;

                }


                if (
                    circleCircleCollision(

                        player.x,
                        player.y,
                        player.radius + 8,

                        enemy.x,
                        enemy.y,
                        enemy.radius

                    )
                ) {

                    dash.hitIds
                        .add(
                            enemy.id
                        );


                    damageEnemy(

                        enemy,

                        dash.damage,

                        {
                            hitColor:
                                "#a775ec",

                            particleShape:
                                "afterimage"
                        }

                    );


                    pushEnemy(

                        enemy,

                        dash.dx,

                        dash.dy,

                        28

                    );

                }

            }

        }


        dash.remaining -=
            moved;


        if (
            dash.remaining <=
            0 ||
            dash.timer <=
            0
        ) {

            player.zephyrDash =
                null;


            createSlashEffect({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    70,

                angle:
                    Math.atan2(
                        dash.dy,
                        dash.dx
                    ),

                arc:
                    Math.PI *
                    0.8,

                life:
                    0.28,

                color:
                    "#c19bf3",

                lineWidth:
                    7

            });

        }

    }


    /* =========================================================
       HAZARDS / ATAQUES NO CHÃO
       ========================================================= */

    function spawnHazard(
        data
    ) {

        const hazard = {

            id:
                uid("hazard"),

            sourceId:
                data.sourceId ||
                null,

            type:
                data.type ||
                "circle",

            x:
                data.x,

            y:
                data.y,

            radius:
                data.radius ||
                55,

            damage:
                data.damage ||
                10,

            telegraph:
                data.telegraph ??
                0.7,

            activeTime:
                data.activeTime ??
                0.18,

            timer:
                data.telegraph ??
                0.7,

            active:
                false,

            triggered:
                false,

            color:
                data.color ||
                "#c94d43",

            impactColor:
                data.impactColor ||
                "#e27855",

            stun:
                data.stun ||
                0,

            slow:
                data.slow ||
                null

        };


        state.world.hazards
            .push(
                hazard
            );


        return hazard;

    }


    function updateHazards(
        dt
    ) {

        for (
            const hazard of
            state.world.hazards
        ) {

            hazard.timer -=
                dt;


            if (
                !hazard.active
            ) {

                if (
                    hazard.timer <=
                    0
                ) {

                    hazard.active =
                        true;


                    hazard.timer =
                        hazard.activeTime;


                    createShockwaveEffect({

                        x:
                            hazard.x,

                        y:
                            hazard.y,

                        radius:
                            5,

                        maxRadius:
                            hazard.radius,

                        life:
                            0.32,

                        color:
                            hazard.impactColor,

                        lineWidth:
                            5

                    });


                    createBurst(

                        hazard.x,

                        hazard.y,

                        hazard.impactColor,

                        20,

                        {
                            speedMin:
                                40,

                            speedMax:
                                170,

                            shape:
                                hazard.type ===
                                "rock"

                                    ? "rock"

                                    : "spark",

                            gravity:

                                hazard.type ===
                                "rock"

                                    ? 120

                                    : 0

                        }

                    );


                    addScreenShake(
                        5,
                        0.16
                    );

                }


                continue;

            }


            if (
                !hazard.triggered &&
                distance(

                    state.player.x,
                    state.player.y,

                    hazard.x,
                    hazard.y

                ) <=

                hazard.radius +
                state.player.radius
            ) {

                const source =
                    state.world.enemies
                        .find(
                            enemy =>
                                enemy.id ===
                                hazard.sourceId
                        );


                const dealt =
                    damagePlayer(

                        hazard.damage,

                        source ||
                        {
                            x:
                                hazard.x,

                            y:
                                hazard.y
                        }

                    );


                if (
                    dealt >
                    0
                ) {

                    if (
                        hazard.stun >
                        0
                    ) {

                        state.player.stunTimer =
                            Math.max(

                                state.player.stunTimer,

                                hazard.stun

                            );

                    }


                    if (
                        hazard.slow
                    ) {

                        state.player.slowTimer =
                            Math.max(

                                state.player.slowTimer ||
                                0,

                                hazard.slow.duration ||
                                1.5

                            );


                        state.player.slowMultiplier =
                            hazard.slow.multiplier ||
                            0.7;

                    }

                }


                hazard.triggered =
                    true;

            }

        }


        state.world.hazards =
            state.world
                .hazards
                .filter(
                    hazard =>
                        !(
                            hazard.active &&
                            hazard.timer <=
                            0
                        )
                );

    }


    /* =========================================================
       INIMIGO — MOVIMENTO
       ========================================================= */

    function enemyCanMoveTo(
        enemy,
        x,
        y
    ) {

        if (
            enemy.stationary
        ) {

            return false;

        }


        if (
            x -
            enemy.radius <
            0 ||

            y -
            enemy.radius <
            0 ||

            x +
            enemy.radius >
            state.world.width ||

            y +
            enemy.radius >
            state.world.height
        ) {

            return false;

        }


        return !circleHitsSolidObstacle(

            x,
            y,

            enemy.radius

        );

    }


    function moveEnemy(
        enemy,
        dx,
        dy
    ) {

        if (
            enemy.stationary
        ) {

            return;

        }


        const nx =
            enemy.x +
            dx;


        if (
            enemyCanMoveTo(

                enemy,

                nx,

                enemy.y

            )
        ) {

            enemy.x =
                nx;

        }


        const ny =
            enemy.y +
            dy;


        if (
            enemyCanMoveTo(

                enemy,

                enemy.x,

                ny

            )
        ) {

            enemy.y =
                ny;

        }

    }


    function moveEnemyToward(
        enemy,
        targetX,
        targetY,
        speed,
        dt
    ) {

        const direction =
            normalize(

                targetX -
                enemy.x,

                targetY -
                enemy.y

            );


        if (
            direction.length <=
            0.001
        ) {

            return;

        }


        moveEnemy(

            enemy,

            direction.x *
            speed *
            dt,

            direction.y *
            speed *
            dt

        );

    }


    /* =========================================================
       CHARGE TELEGRÁFICO

       Nada de teleportar.
       ========================================================= */

    function startEnemyCharge(
        enemy,
        options = {}
    ) {

        if (
            enemy.charge ||
            enemy.dead
        ) {

            return false;

        }


        const targetX =
            options.targetX ??
            state.player.x;


        const targetY =
            options.targetY ??
            state.player.y;


        const direction =
            normalize(

                targetX -
                enemy.x,

                targetY -
                enemy.y

            );


        enemy.charge = {

            phase:
                "telegraph",

            timer:
                options.telegraph ||
                0.65,

            dx:
                direction.x,

            dy:
                direction.y,

            speed:
                options.speed ||
                430,

            duration:
                options.duration ||
                0.55,

            remainingDuration:
                options.duration ||
                0.55,

            damage:
                options.damage ||
                enemy.damage *
                1.3,

            hit:
                false,

            color:
                options.color ||
                "#d96a55"

        };


        addEffect({

            type:
                "chargeTelegraph",

            x:
                enemy.x,

            y:
                enemy.y,

            x2:
                enemy.x +
                direction.x *
                230,

            y2:
                enemy.y +
                direction.y *
                230,

            life:
                enemy.charge.timer,

            color:
                enemy.charge.color,

            lineWidth:
                6

        });


        return true;

    }


    function updateEnemyCharge(
        enemy,
        dt
    ) {

        const charge =
            enemy.charge;


        if (!charge) {

            return false;

        }


        if (
            charge.phase ===
            "telegraph"
        ) {

            charge.timer -=
                dt;


            if (
                charge.timer <=
                0
            ) {

                charge.phase =
                    "move";

            }


            return true;

        }


        charge.remainingDuration -=
            dt;


        const requested =

            charge.speed *
            dt;


        const steps =
            Math.max(

                1,

                Math.ceil(
                    requested /
                    9
                )

            );


        const step =
            requested /
            steps;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const nx =

                enemy.x +

                charge.dx *
                step;


            const ny =

                enemy.y +

                charge.dy *
                step;


            if (
                !enemyCanMoveTo(
                    enemy,
                    nx,
                    ny
                )
            ) {

                charge.remainingDuration =
                    0;


                break;

            }


            enemy.x =
                nx;


            enemy.y =
                ny;


            if (
                !charge.hit &&
                circleCircleCollision(

                    enemy.x,
                    enemy.y,
                    enemy.radius,

                    state.player.x,
                    state.player.y,
                    state.player.radius

                )
            ) {

                charge.hit =
                    true;


                damagePlayer(

                    charge.damage,

                    enemy

                );

            }


            if (
                Math.random() <
                0.5
            ) {

                spawnParticle({

                    x:
                        enemy.x -
                        charge.dx *
                        enemy.radius,

                    y:
                        enemy.y -
                        charge.dy *
                        enemy.radius,

                    vx:
                        random(
                            -15,
                            15
                        ),

                    vy:
                        random(
                            -15,
                            15
                        ),

                    life:
                        0.25,

                    size:
                        random(
                            2,
                            5
                        ),

                    color:
                        enemy.color,

                    shape:
                        "dust"
                });

            }

        }


        if (
            charge.remainingDuration <=
            0
        ) {

            enemy.charge =
                null;


            enemy.specialCooldown =
                Math.max(

                    enemy.specialCooldown,

                    2.2

                );


            createShockwaveEffect({

                x:
                    enemy.x,

                y:
                    enemy.y,

                radius:
                    8,

                maxRadius:
                    45,

                life:
                    0.32,

                color:
                    charge.color,

                lineWidth:
                    4

            });

        }


        return true;

    }


    /* =========================================================
       PROJÉTIL INIMIGO
       ========================================================= */

    function fireEnemyProjectile(
        enemy,
        options = {}
    ) {

        const direction =
            normalize(

                (
                    options.targetX ??
                    state.player.x
                ) -
                enemy.x,

                (
                    options.targetY ??
                    state.player.y
                ) -
                enemy.y

            );


        return spawnProjectile({

            owner:
                "enemy",

            sourceId:
                enemy.id,

            type:
                options.type ||
                "enemyOrb",

            x:
                enemy.x +
                direction.x *
                (
                    enemy.radius +
                    8
                ),

            y:
                enemy.y +
                direction.y *
                (
                    enemy.radius +
                    8
                ),

            dx:
                direction.x,

            dy:
                direction.y,

            speed:
                options.speed ||
                260,

            radius:
                options.radius ||
                7,

            damage:
                options.damage ||
                enemy.damage,

            life:
                options.life ||
                2.4,

            color:
                options.color ||
                enemy.color,

            trailColor:
                options.trailColor ||
                options.color ||
                enemy.color,

            trailShape:
                options.trailShape ||
                "spark",

            impactStyle:
                options.impactStyle ||
                "normal",

            slow:
                options.slow ||
                null

        });

    }


    /* =========================================================
       BOSS DE ROTA 1 — PADRÕES
       ========================================================= */

    function runBossSpecial(
        enemy
    ) {

        if (
            enemy.dead ||
            !enemy.accepted
        ) {

            return false;

        }


        switch (
            enemy.bossPattern
        ) {

            case "route1_slow":

                spawnHazard({

                    sourceId:
                        enemy.id,

                    type:
                        "slam",

                    x:
                        state.player.x,

                    y:
                        state.player.y,

                    radius:
                        72,

                    damage:
                        enemy.damage *
                        1.25,

                    telegraph:
                        0.85,

                    activeTime:
                        0.16,

                    color:
                        "#b95149",

                    impactColor:
                        "#d88661"

                });


                enemy.specialCooldown =
                    3.8;

                return true;


            case "forestRoots":

                for (
                    let i = 0;
                    i < 3;
                    i++
                ) {

                    spawnHazard({

                        sourceId:
                            enemy.id,

                        type:
                            "roots",

                        x:
                            state.player.x +
                            random(
                                -90,
                                90
                            ),

                        y:
                            state.player.y +
                            random(
                                -90,
                                90
                            ),

                        radius:
                            48,

                        damage:
                            enemy.damage *
                            0.9,

                        telegraph:
                            0.85 +
                            i *
                            0.14,

                        activeTime:
                            0.18,

                        color:
                            "#597448",

                        impactColor:
                            "#7f965f",

                        slow: {

                            duration:
                                1.8,

                            multiplier:
                                0.66

                        }

                    });

                }


                enemy.specialCooldown =
                    4.4;

                return true;


            case "grovePulse":

                spawnHazard({

                    sourceId:
                        enemy.id,

                    type:
                        "pulse",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    radius:
                        138,

                    damage:
                        enemy.damage *
                        1.15,

                    telegraph:
                        0.95,

                    activeTime:
                        0.16,

                    color:
                        "#6f7d51",

                    impactColor:
                        "#a18d61"

                });


                enemy.specialCooldown =
                    4.2;

                return true;


            case "mountainQuake":

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    spawnHazard({

                        sourceId:
                            enemy.id,

                        type:
                            "rock",

                        x:
                            state.player.x +
                            random(
                                -120,
                                120
                            ),

                        y:
                            state.player.y +
                            random(
                                -120,
                                120
                            ),

                        radius:
                            52,

                        damage:
                            enemy.damage *
                            0.92,

                        telegraph:
                            0.95 +
                            i *
                            0.1,

                        activeTime:
                            0.16,

                        color:
                            "#696d68",

                        impactColor:
                            "#a5a99f"

                    });

                }


                enemy.specialCooldown =
                    4.8;

                return true;


            case "ironMagnet":

                for (
                    let i = -1;
                    i <= 1;
                    i++
                ) {

                    const direction =
                        normalize(

                            state.player.x -
                            enemy.x,

                            state.player.y -
                            enemy.y

                        );


                    const base =
                        Math.atan2(
                            direction.y,
                            direction.x
                        );


                    const angle =
                        base +
                        i *
                        0.18;


                    fireEnemyProjectile(

                        enemy,

                        {
                            targetX:
                                enemy.x +
                                Math.cos(
                                    angle
                                ) *
                                300,

                            targetY:
                                enemy.y +
                                Math.sin(
                                    angle
                                ) *
                                300,

                            speed:
                                300,

                            radius:
                                9,

                            damage:
                                enemy.damage *
                                0.85,

                            color:
                                "#aeb2ae",

                            trailColor:
                                "#d9d9d2",

                            trailShape:
                                "metalSpark"
                        }

                    );

                }


                enemy.specialCooldown =
                    4;


                return true;


            case "rubyChimera":

                if (
                    Math.random() <
                    0.5
                ) {

                    for (
                        let i = -2;
                        i <= 2;
                        i++
                    ) {

                        const direction =
                            normalize(

                                state.player.x -
                                enemy.x,

                                state.player.y -
                                enemy.y

                            );


                        const base =
                            Math.atan2(
                                direction.y,
                                direction.x
                            );


                        const angle =
                            base +
                            i *
                            0.14;


                        fireEnemyProjectile(

                            enemy,

                            {
                                targetX:
                                    enemy.x +
                                    Math.cos(
                                        angle
                                    ) *
                                    300,

                                targetY:
                                    enemy.y +
                                    Math.sin(
                                        angle
                                    ) *
                                    300,

                                speed:
                                    335,

                                radius:
                                    8,

                                damage:
                                    enemy.damage *
                                    0.72,

                                color:
                                    "#c34f6c",

                                trailColor:
                                    "#f08ba1",

                                trailShape:
                                    "shard"
                            }

                        );

                    }

                }

                else {

                    for (
                        let i = 0;
                        i < 3;
                        i++
                    ) {

                        spawnHazard({

                            sourceId:
                                enemy.id,

                            type:
                                "ruby",

                            x:
                                state.player.x +
                                random(
                                    -90,
                                    90
                                ),

                            y:
                                state.player.y +
                                random(
                                    -90,
                                    90
                                ),

                            radius:
                                55,

                            damage:
                                enemy.damage *
                                0.9,

                            telegraph:
                                0.8 +
                                i *
                                0.17,

                            activeTime:
                                0.15,

                            color:
                                "#aa3f59",

                            impactColor:
                                "#e06a84"

                        });

                    }

                }


                enemy.specialCooldown =
                    3.7;


                return true;


            case "ancientDeer":

                startEnemyCharge(

                    enemy,

                    {
                        telegraph:
                            0.8,

                        speed:
                            370,

                        duration:
                            0.5,

                        damage:
                            enemy.damage *
                            1.15,

                        color:
                            "#9f956b"
                    }

                );


                enemy.specialCooldown =
                    3.8;


                return true;


            default:

                return false;

        }

    }


    /* =========================================================
       INIMIGOS DO LABIRINTO
       ========================================================= */

    function runNormalEnemySpecial(
        enemy
    ) {

        switch (
            enemy.spriteType
        ) {

            case "bat":

                fireEnemyProjectile(

                    enemy,

                    {
                        type:
                            "batWave",

                        speed:
                            320,

                        radius:
                            7,

                        damage:
                            enemy.damage *
                            0.8,

                        color:
                            "#796589",

                        trailColor:
                            "#a38bb7",

                        trailShape:
                            "smoke",

                        impactStyle:
                            "shadowBurst"
                    }

                );


                enemy.specialCooldown =
                    2.8;


                return true;


            case "spider":

                fireEnemyProjectile(

                    enemy,

                    {
                        type:
                            "web",

                        speed:
                            255,

                        radius:
                            8,

                        damage:
                            enemy.damage *
                            0.55,

                        color:
                            "#d1c8d8",

                        trailColor:
                            "#e1d9e5",

                        trailShape:
                            "web",

                        slow: {

                            duration:
                                2,

                            multiplier:
                                0.58

                        }
                    }

                );


                enemy.specialCooldown =
                    3.4;


                return true;


            case "scorpion":

                spawnHazard({

                    sourceId:
                        enemy.id,

                    type:
                        "poison",

                    x:
                        state.player.x,

                    y:
                        state.player.y,

                    radius:
                        43,

                    damage:
                        enemy.damage *
                        0.7,

                    telegraph:
                        0.65,

                    activeTime:
                        0.2,

                    color:
                        "#745d84",

                    impactColor:
                        "#9874a7",

                    slow: {

                        duration:
                            1.5,

                        multiplier:
                            0.75

                    }

                });


                enemy.specialCooldown =
                    3.2;


                return true;


            default:

                return false;

        }

    }


    /* =========================================================
       MONARCA
       ========================================================= */

    function spawnMonarch() {

        if (
            state.area !==
            "monarchMaze"
        ) {

            return null;

        }


        const existing =
            state.world.enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "monarch" &&
                        !enemy.dead
                );


        if (existing) {

            return existing;

        }


        state.player.monarchAwakened =
            true;


        const monarch =
            addEnemy({

                id:
                    "monarch",

                name:
                    "O MONARCA",

                type:
                    "progression",

                imageStyle:
                    "monarch",

                spriteType:
                    "monarch",

                x:
                    3050,

                y:
                    860,

                homeX:
                    3050,

                homeY:
                    860,

                hp:
                    4200,

                maxHp:
                    4200,

                damage:
                    48,

                speed:
                    0,

                vision:
                    680,

                attackRange:
                    230,

                radius:
                    55,

                color:
                    "#6b547d",

                xp:
                    1100,

                money:
                    850,

                accepted:
                    true,

                aggressive:
                    true,

                stationary:
                    true,

                bossPattern:
                    "monarch",

                specialCooldown:
                    2.1,

                unlock:
                    null

            });


        monarch.cloneCooldown =
            5;


        monarch.monarchHits =
            0;


        monarch.monarchStagger =
            0;


        state.bossBarTarget =
            monarch;


        return monarch;

    }


    function getLivingMonarchClones() {

        return state.world.enemies
            .filter(
                enemy =>

                    enemy.monarchClone &&
                    !enemy.dead
            );

    }


    function findMonarchCloneSpawn() {

        const monarch =
            state.world.enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "monarch" &&
                        !enemy.dead
                );


        if (!monarch) {

            return null;

        }


        const rng =
            mulberry32(

                hashString(

                    `${state.time}:${Math.random()}:clone`

                )

            );


        for (
            let attempt = 0;
            attempt < 45;
            attempt++
        ) {

            const angle =
                rngRange(

                    rng,

                    0,

                    Math.PI * 2

                );


            const d =
                rngRange(
                    rng,
                    120,
                    260
                );


            const x =

                monarch.x +

                Math.cos(
                    angle
                ) *
                d;


            const y =

                monarch.y +

                Math.sin(
                    angle
                ) *
                d;


            if (
                x < 2780 ||
                x > 3320 ||
                y < 700 ||
                y > 1380
            ) {

                continue;

            }


            if (
                circleHitsSolidObstacle(
                    x,
                    y,
                    24
                )
            ) {

                continue;

            }


            if (
                distance(

                    x,
                    y,

                    state.player.x,
                    state.player.y

                ) <
                95
            ) {

                continue;

            }


            return {
                x,
                y
            };

        }


        return null;

    }


    function summonMonarchClones(
        monarch
    ) {

        const living =
            getLivingMonarchClones();


        if (
            living.length >=
            6
        ) {

            monarch.cloneCooldown =
                6.5;


            return;

        }


        const available =
            6 -
            living.length;


        const amount =
            Math.min(
                3,
                available
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const position =
                findMonarchCloneSpawn();


            if (!position) {

                continue;

            }


            const clone =
                addEnemy({

                    id:
                        uid("monarch_clone"),

                    name:
                        "ECO DO MONARCA",

                    spriteType:
                        "monarchClone",

                    type:
                        "normal",

                    x:
                        position.x,

                    y:
                        position.y,

                    hp:
                        190,

                    maxHp:
                        190,

                    damage:
                        24,

                    speed:
                        105,

                    vision:
                        470,

                    attackRange:
                        65,

                    radius:
                        22,

                    color:
                        "#74608a",

                    xp:
                        15,

                    money:
                        0,

                    aggressive:
                        true,

                    accepted:
                        true,

                    monarchClone:
                        true,

                    specialCooldown:
                        random(
                            1.5,
                            2.6
                        )

                });


            createRingEffect({

                x:
                    clone.x,

                y:
                    clone.y,

                radius:
                    5,

                maxRadius:
                    42,

                life:
                    0.45,

                color:
                    "#8b74a1",

                lineWidth:
                    3

            });


            createBurst(

                clone.x,
                clone.y,

                "#7d678f",

                16,

                {
                    speedMin:
                        30,

                    speedMax:
                        105,

                    shape:
                        "smoke"
                }

            );

        }


        monarch.cloneCooldown =
            6.5;

    }


    function triggerMonarchStagger(
        monarch
    ) {

        monarch.monarchHits =
            0;


        monarch.monarchStagger =
            5;


        monarch.stunTimer =
            5;


        createRingEffect({

            x:
                monarch.x,

            y:
                monarch.y,

            radius:
                30,

            maxRadius:
                115,

            life:
                0.7,

            color:
                "#d6c4e9",

            lineWidth:
                5

        });


        createBurst(

            monarch.x,
            monarch.y,

            "#d7c5e8",

            32,

            {
                speedMin:
                    40,

                speedMax:
                    165,

                shape:
                    "star"
            }

        );


        addEffect({

            type:
                "stunIcon",

            x:
                monarch.x,

            y:
                monarch.y -
                80,

            text:
                "🥷",

            life:
                5,

            color:
                "#ffffff",

            scale:
                1.2

        });


        addScreenShake(
            7,
            0.24
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "O Monarca perdeu o equilíbrio!"
            );

        }

    }


    function monarchRockAttack(
        monarch
    ) {

        const count =
            4;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            spawnHazard({

                sourceId:
                    monarch.id,

                type:
                    "rock",

                x:
                    state.player.x +
                    random(
                        -115,
                        115
                    ),

                y:
                    state.player.y +
                    random(
                        -115,
                        115
                    ),

                radius:
                    56,

                damage:
                    monarch.damage *
                    1.05,

                telegraph:
                    0.9 +
                    i *
                    0.13,

                activeTime:
                    0.18,

                color:
                    "#6f596e",

                impactColor:
                    "#a17b7d",

                stun:
                    0.35
            });

        }


        monarch.specialCooldown =
            3.6;

    }


    function monarchProjectilePattern(
        monarch
    ) {

        const toPlayer =
            normalize(

                state.player.x -
                monarch.x,

                state.player.y -
                monarch.y

            );


        const base =
            Math.atan2(
                toPlayer.y,
                toPlayer.x
            );


        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const angle =
                base +
                i *
                0.18;


            fireEnemyProjectile(

                monarch,

                {
                    targetX:
                        monarch.x +
                        Math.cos(
                            angle
                        ) *
                        400,

                    targetY:
                        monarch.y +
                        Math.sin(
                            angle
                        ) *
                        400,

                    type:
                        "monarchOrb",

                    speed:
                        330,

                    radius:
                        10,

                    damage:
                        monarch.damage *
                        0.75,

                    color:
                        "#755688",

                    trailColor:
                        "#b493c4",

                    trailShape:
                        "smoke",

                    impactStyle:
                        "shadowBurst"
                }

            );

        }


        monarch.specialCooldown =
            3;

    }


    function updateMonarch(
        monarch,
        dt
    ) {

        if (
            monarch.dead
        ) {

            return;

        }


        if (
            monarch.monarchStagger >
            0
        ) {

            monarch.monarchStagger =
                Math.max(

                    0,

                    monarch.monarchStagger -
                    dt

                );


            monarch.stunTimer =
                monarch.monarchStagger;


            return;

        }


        monarch.cloneCooldown -=
            dt;


        if (
            monarch.cloneCooldown <=
            0
        ) {

            summonMonarchClones(
                monarch
            );

        }


        monarch.specialCooldown -=
            dt;


        if (
            monarch.specialCooldown >
            0
        ) {

            return;

        }


        const roll =
            Math.random();


        if (
            roll <
            0.54
        ) {

            monarchRockAttack(
                monarch
            );

        }

        else {

            monarchProjectilePattern(
                monarch
            );

        }

    }


    /* =========================================================
       AI DE INIMIGOS
       ========================================================= */

    function enemyMeleeAttack(
        enemy
    ) {

        if (
            enemy.attackCooldown >
            0
        ) {

            return false;

        }


        const d =
            distance(

                enemy.x,
                enemy.y,

                state.player.x,
                state.player.y

            );


        if (
            d >
            enemy.attackRange +
            state.player.radius
        ) {

            return false;

        }


        enemy.attackCooldown =
            1.05;


        createSlashEffect({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                enemy.attackRange,

            angle:
                Math.atan2(

                    state.player.y -
                    enemy.y,

                    state.player.x -
                    enemy.x

                ),

            arc:
                Math.PI *
                0.7,

            life:
                0.22,

            color:
                enemy.color,

            lineWidth:
                5

        });


        damagePlayer(

            enemy.damage,

            enemy

        );


        return true;

    }


    function updateEnemyAI(
        enemy,
        dt
    ) {

        if (
            enemy.dead
        ) {

            return;

        }


        enemy.attackCooldown =
            Math.max(

                0,

                enemy.attackCooldown -
                dt

            );


        enemy.specialCooldown =
            Math.max(

                0,

                enemy.specialCooldown -
                dt

            );


        enemy.hitFlash =
            Math.max(

                0,

                enemy.hitFlash -
                dt

            );


        enemy.stunTimer =
            Math.max(

                0,

                enemy.stunTimer -
                dt

            );


        if (
            enemy.id ===
            "monarch"
        ) {

            updateMonarch(
                enemy,
                dt
            );


            return;

        }


        if (
            enemy.stunTimer >
            0
        ) {

            return;

        }


        if (
            enemy.charge
        ) {

            updateEnemyCharge(
                enemy,
                dt
            );


            return;

        }


        const d =
            distance(

                enemy.x,
                enemy.y,

                state.player.x,
                state.player.y

            );


        /*
            Boss de progressão não luta
            até o jogador aceitar.
        */
        if (
            enemy.type ===
            "progression" &&
            !enemy.accepted
        ) {

            return;

        }


        /*
            Cervo:
            só fica agressivo depois que for atacado
            ou quando o jogador chegar muito perto.
        */
        if (
            enemy.type ===
            "resourceBoss" &&
            !enemy.aggressive
        ) {

            if (
                d <
                105
            ) {

                enemy.aggressive =
                    true;

            }

            else {

                return;

            }

        }


        if (
            !enemy.aggressive
        ) {

            if (
                d <=
                enemy.vision
            ) {

                enemy.aggressive =
                    true;

            }

            else {

                /*
                    Pequena volta para casa.
                */
                const homeDistance =
                    distance(

                        enemy.x,
                        enemy.y,

                        enemy.homeX,
                        enemy.homeY

                    );


                if (
                    homeDistance >
                    16
                ) {

                    moveEnemyToward(

                        enemy,

                        enemy.homeX,
                        enemy.homeY,

                        enemy.speed *
                        0.42,

                        dt

                    );

                }


                return;

            }

        }


        if (
            d >
            enemy.vision *
            1.75
        ) {

            enemy.aggressive =
                false;


            return;

        }


        /*
            Especial de boss.
        */
        if (
            enemy.bossPattern &&
            enemy.specialCooldown <=
            0
        ) {

            if (
                runBossSpecial(
                    enemy
                )
            ) {

                return;

            }

        }


        /*
            Especial de inimigo normal.
        */
        if (
            enemy.specialCooldown <=
            0
        ) {

            if (
                runNormalEnemySpecial(
                    enemy
                )
            ) {

                return;

            }

        }


        /*
            Morcego mantém distância.
        */
        if (
            enemy.spriteType ===
            "bat"
        ) {

            if (
                d <
                115
            ) {

                const away =
                    normalize(

                        enemy.x -
                        state.player.x,

                        enemy.y -
                        state.player.y

                    );


                moveEnemy(

                    enemy,

                    away.x *
                    enemy.speed *
                    dt,

                    away.y *
                    enemy.speed *
                    dt

                );

            }

            else if (
                d >
                205
            ) {

                moveEnemyToward(

                    enemy,

                    state.player.x,
                    state.player.y,

                    enemy.speed *
                    0.72,

                    dt

                );

            }


            return;

        }


        /*
            Chegou perto:
            ataque corpo a corpo.
        */
        if (
            d <=
            enemy.attackRange +
            state.player.radius +
            4
        ) {

            enemyMeleeAttack(
                enemy
            );


            return;

        }


        moveEnemyToward(

            enemy,

            state.player.x,
            state.player.y,

            enemy.speed,

            dt

        );

    }


    function updateEnemies(
        dt
    ) {

        if (
            state.houseMode ||
            state.player.dead
        ) {

            return;

        }


        for (
            const enemy of
            state.world.enemies
        ) {

            updateEnemyAI(
                enemy,
                dt
            );

        }


        /*
            Barra grande só continua apontando
            para boss de avanço vivo.
        */
        if (
            state.bossBarTarget &&
            (
                state.bossBarTarget.dead ||
                !shouldBossUseTopBar(
                    state.bossBarTarget
                )
            )
        ) {

            state.bossBarTarget =
                null;

        }

    }


    /* =========================================================
       MOVIMENTO DOS NPCs
       ========================================================= */

    function updateNPCs(
        dt
    ) {

        if (
            state.houseMode
        ) {

            return;

        }


        for (
            const npc of
            state.world.npcs
        ) {

            if (
                !npc.wander
            ) {

                continue;

            }


            npc.wanderTimer -=
                dt;


            if (
                npc.wanderTimer <=
                0
            ) {

                const angle =
                    random(
                        0,
                        Math.PI * 2
                    );


                const d =
                    random(
                        12,
                        npc.wander
                    );


                npc.targetX =

                    npc.homeX +

                    Math.cos(
                        angle
                    ) *
                    d;


                npc.targetY =

                    npc.homeY +

                    Math.sin(
                        angle
                    ) *
                    d;


                npc.wanderTimer =
                    random(
                        2.2,
                        5
                    );

            }


            const direction =
                normalize(

                    npc.targetX -
                    npc.x,

                    npc.targetY -
                    npc.y

                );


            if (
                direction.length <
                3
            ) {

                continue;

            }


            const speed =
                24;


            const nx =

                npc.x +

                direction.x *
                speed *
                dt;


            const ny =

                npc.y +

                direction.y *
                speed *
                dt;


            if (
                !circleHitsSolidObstacle(

                    nx,
                    ny,
                    npc.radius

                )
            ) {

                npc.x =
                    nx;


                npc.y =
                    ny;

            }

        }

    }


    /* =========================================================
       BOSS ATIVO / AGRESSIVIDADE
       ========================================================= */

    function activateBoss(
        enemy
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return false;

        }


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        if (
            shouldBossUseTopBar(
                enemy
            )
        ) {

            state.bossBarTarget =
                enemy;

        }


        createRingEffect({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                enemy.radius,

            maxRadius:
                enemy.radius *
                2.2,

            life:
                0.65,

            color:
                enemy.color,

            lineWidth:
                4

        });


        return true;

    }


    /* =========================================================
       BUSCA DE BOSS PRÓXIMO
       ========================================================= */

    function getNearestUnacceptedBoss() {

        if (
            state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const enemy of
            state.world.enemies
        ) {

            if (
                enemy.dead ||
                enemy.type !==
                "progression" ||
                enemy.accepted
            ) {

                continue;

            }


            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    enemy.x,
                    enemy.y

                );


            if (
                d <
                bestDistance &&
                d <=
                145
            ) {

                best =
                    enemy;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    /* =========================================================
       BUSCA DE ÁRVORE / RECURSO / COMIDA
       ========================================================= */

    function getNearestTree() {

        if (
            state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const tree of
            state.world.trees
        ) {

            if (
                !tree.alive
            ) {

                continue;

            }


            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    tree.x,
                    tree.y

                );


            if (
                d <=
                72 &&
                d <
                bestDistance
            ) {

                best =
                    tree;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    function getNearestResource() {

        if (
            state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const resource of
            state.world.resources
        ) {

            if (
                !resource.alive
            ) {

                continue;

            }


            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    resource.x,
                    resource.y

                );


            if (
                d <=
                70 &&
                d <
                bestDistance
            ) {

                best =
                    resource;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    function getNearestFood() {

        if (
            state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const food of
            state.world.foods
        ) {

            if (
                !food.alive
            ) {

                continue;

            }


            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    food.x,
                    food.y

                );


            if (
                d <=
                65 &&
                d <
                bestDistance
            ) {

                best =
                    food;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    /* =========================================================
       INTERIOR — CAMA / FORJA
       ========================================================= */

    function getNearbyFurniture() {

        if (
            !state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const item of
            getHouseFurniture()
        ) {

            const cx =

                item.x +

                item.w /
                2;


            const cy =

                item.y +

                item.h /
                2;


            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    cx,
                    cy

                );


            if (
                d <
                92 &&
                d <
                bestDistance
            ) {

                best =
                    item;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    /* =========================================================
       INTERIOR — NPC
       ========================================================= */

    function getNearbyInteriorNPC() {

        if (
            !state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const npc of
            getHouseInteriorNPCs()
        ) {

            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    npc.x,
                    npc.y

                );


            if (
                d <=
                90 &&
                d <
                bestDistance
            ) {

                best =
                    npc;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    /* =========================================================
       UPDATE GERAL DE COMBATE
       ========================================================= */

    function updateGameplaySystems(
        dt
    ) {

        if (
            !state.player ||
            !state.world
        ) {

            return;

        }


        updatePlayerCooldowns(
            dt
        );


        updatePotionBuffs(
            dt
        );


        updateDamageScreenEffect(
            dt
        );


        updateScreenShake(
            dt
        );


        updateEffects(
            dt
        );


        updateParticles(
            dt
        );


        updateDamageNumbers(
            dt
        );


        updateDrops(
            dt
        );


        updateProjectiles(
            dt
        );


        updateHazards(
            dt
        );


        if (
            !state.paused &&
            !state.transition
        ) {

            updateSurvival(
                dt
            );


            updateRespawns(
                dt
            );


            updateNPCs(
                dt
            );


            updateUniversalDash(
                dt
            );


            updateZephyrCombatDash(
                dt
            );


            updatePlayerMovement(
                dt
            );


            updateEnemies(
                dt
            );

        }

    }


    /* =========================================================
       RUNTIME REPAIR
       ========================================================= */

    function sanitizeGameplayRuntime() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        recalculatePlayerStats();


        player.attackCooldown =
            Math.max(
                0,
                finiteNumber(
                    player.attackCooldown,
                    0
                )
            );


        player.dashCooldown =
            Math.max(
                0,
                finiteNumber(
                    player.dashCooldown,
                    0
                )
            );


        player.invincible =
            Math.max(
                0,
                finiteNumber(
                    player.invincible,
                    0
                )
            );


        player.stunTimer =
            Math.max(
                0,
                finiteNumber(
                    player.stunTimer,
                    0
                )
            );


        player.slowTimer =
            Math.max(
                0,
                finiteNumber(
                    player.slowTimer,
                    0
                )
            );


        player.slowMultiplier =
            finiteNumber(
                player.slowMultiplier,
                0.68
            );


        player.shieldTimer =
            Math.max(
                0,
                finiteNumber(
                    player.shieldTimer,
                    0
                )
            );


        player.damageReduction =
            clamp(

                finiteNumber(
                    player.damageReduction,
                    0
                ),

                0,
                0.8

            );


        player.adaptiveTimer =
            Math.max(
                0,
                finiteNumber(
                    player.adaptiveTimer,
                    0
                )
            );


        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.skillCooldowns =
            player.skillCooldowns ||
            {
                q: 0,
                r: 0,
                f: 0
            };


        for (
            const key of
            [
                "q",
                "r",
                "f"
            ]
        ) {

            player.skillCooldowns[
                key
            ] =
                Math.max(

                    0,

                    finiteNumber(

                        player.skillCooldowns[
                            key
                        ],

                        0

                    )

                );

        }


        player.activePotionBuffs =
            Array.isArray(
                player.activePotionBuffs
            )

                ? player.activePotionBuffs

                : [];


        player.defeatedBosses =
            Array.isArray(
                player.defeatedBosses
            )

                ? player.defeatedBosses

                : [];


        player.discoveredBosses =
            Array.isArray(
                player.discoveredBosses
            )

                ? player.discoveredBosses

                : [];


        player.exploredAreas =
            Array.isArray(
                player.exploredAreas
            )

                ? player.exploredAreas

                : [
                    "village"
                ];


        player.unlockedAreas =
            Array.isArray(
                player.unlockedAreas
            )

                ? player.unlockedAreas

                : [
                    "village"
                ];

    }


    /* =========================================================
       FIM DA PARTE 3/5

       PARTE 4 TERÁ:

       - diálogos
       - E / Z
       - portas
       - Doran
       - progressão sequencial das armaduras
       - Borin
       - Miguel
       - portões
       - altar do Monarca
       - consumo de Rubi/Diamante SOMENTE depois
         de derrotar o Monarca
       - regiões posteriores
       - hordas
       - Guardião do Caminho
       - Flauta da Memória
       - Inferno
       - Outro Eu
       - quests
       - viagens

       NÃO COLOQUE })(); AINDA.
       ========================================================= */
