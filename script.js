(() => {
    "use strict";

    /* =========================================================
       VEYRA: A QUIETUDE — V25
       SCRIPT.JS — PARTE 1/4

       BASE / CONFIG / DOM COMPATIBILITY
       PERSONAGENS / STATUS / ITENS / ARMADURAS / SKILLS

       IMPORTANTE:
       - Esta parte ABRE o único IIFE.
       - NÃO coloque })(); no final desta parte.
       - Cole a Parte 2/4 imediatamente abaixo.
       ========================================================= */

    const GAME_VERSION = 25;

    const GAME_VERSION_NAME =
        "VEYRA V25 — MEMÓRIAS RESTAURADAS";

    const SAVE_KEY =
        "veyra_save_v25";

    const LEGACY_SAVE_KEYS =
        Object.freeze([
            "veyra_save_v20_five_parts",
            "veyra_save_v20_upgrade",
            "veyra_save_v19_rebuild",
            "veyra_save_v19",
            "veyra_save_v18_rebuild",
            "veyra_save_v14_stable"
        ]);


    /* =========================================================
       LIMITES / LEVEL
       ========================================================= */

    const MAX_LEVEL =
        50;

    /*
        O LEVEL NÃO AUMENTA ATRIBUTOS SOZINHO.

        Cada level:
        +3 pontos.

        Level 10, 20, 30, 40 e 50:
        +1 ponto extra.
    */

    const BASE_STATUS_POINTS_PER_LEVEL =
        3;

    const BONUS_STATUS_POINT_INTERVAL =
        10;

    const STAT_CAP =
        30;

    const MAX_BLOOD_MARKS =
        18;

    const MAX_ACTIVE_POTION_BUFFS =
        2;


    /* =========================================================
       PREÇOS / PROGRESSÃO
       ========================================================= */

    const LANTERN_PRICE =
        350;

    const MINIMAP_PRICE =
        180;


    const DASH_RITUAL_COST =
        Object.freeze({

            rubi:
                60,

            diamante:
                45

        });


    const NORTH_GATE_COST =
        Object.freeze({

            diamante:
                40,

            rubi:
                55

        });


    /* =========================================================
       CASA / CHECKPOINT
       ========================================================= */

    const PLAYER_HOME =
        Object.freeze({

            area:
                "village",

            houseId:
                "home",

            interiorSpawn:
                Object.freeze({

                    x:
                        540,

                    y:
                        515

                }),

            /*
                Respawn externo.

                A Parte 2 ainda tenta sincronizar
                com a porta real da casa.
            */
            fallbackRespawn:
                Object.freeze({

                    x:
                        595,

                    y:
                        1905,

                    facing:
                        "up"

                })

        });


    /* =========================================================
       CONFIGURAÇÃO GERAL
       ========================================================= */

    const GAME_CONFIG =
        Object.freeze({

            worldMargin:
                55,

            autosaveSeconds:
                30,

            interactDistance:
                86,

            pickupDistance:
                74,


            /*
                COLETA SEGURANDO E
            */

            treeHoldSeconds:
                1.35,

            resourceHoldSeconds:
                1.1,


            /*
                UM CLIQUE = UM ATAQUE
            */

            baseAttackCooldown:
                0.24,


            /*
                PORTAS
            */

            doorAutoOpenDistance:
                112,

            doorAutoCloseDistance:
                160,

            doorInteractionDistance:
                126,


            /*
                SPAWN
            */

            enemySpawnSafeDistance:
                175,

            bossSpawnSafeDistance:
                250,


            /*
                INVESTIDAS

                Movimento em passos menores para
                reduzir atravessamento de paredes.
            */

            enemyChargeStep:
                9,


            /*
                LANTERNA
            */

            noLanternVisionRadius:
                72,

            lanternVisionRadius:
                255,

            lanternSoftEdge:
                90,

            darknessBarrierMessage:
                "Está muito escuro, não podes continuar.",


            /*
                DIÁLOGOS
            */

            dialogueCharactersPerSecond:
                42,

            dialogueFastCharactersPerSecond:
                130,

            dialogueFadeSeconds:
                0.2,


            /*
                MORTE
            */

            deathMaterialLossRatio:
                0.08,

            deathMaterialLossMaxPerType:
                8,


            /*
                ANIMAÇÕES
            */

            walkAnimationSpeed:
                8,

            restAnimationSeconds:
                2.4,


            /*
                FONTE
            */

            fountainParticleRate:
                18

        });


    /* =========================================================
       CONFIGURAÇÃO VISUAL
       ========================================================= */

    const VISUAL_CONFIG =
        Object.freeze({

            player:
                Object.freeze({

                    radius:
                        18,

                    bodyWidth:
                        24,

                    bodyHeight:
                        31,

                    headRadius:
                        11,

                    shadowWidth:
                        35,

                    shadowHeight:
                        12

                }),


            enemy:
                Object.freeze({

                    radius:
                        20,

                    nameOffsetY:
                        44

                }),


            boss:
                Object.freeze({

                    /*
                        Aproximadamente 2x o player.
                    */
                    scale:
                        2,

                    minRadius:
                        40,

                    maxRadius:
                        60,

                    nameOffsetY:
                        80

                }),


            tree:
                Object.freeze({

                    trunkRadius:
                        17,

                    canopyCollisionRadius:
                        35,

                    canopyCollisionOffsetY:
                        -12,

                    visualCanopyRadius:
                        55,

                    generationSafetyRadius:
                        49

                }),


            house:
                Object.freeze({

                    maxScreenWidthRatio:
                        0.76,

                    maxScreenHeightRatio:
                        0.72,

                    outerShadow:
                        32

                }),


            bossBar:
                Object.freeze({

                    topDesktop:
                        88,

                    minWidth:
                        350,

                    maxWidth:
                        610,

                    height:
                        19

                }),


            lantern:
                Object.freeze({

                    radius:
                        GAME_CONFIG
                            .lanternVisionRadius,

                    noLanternRadius:
                        GAME_CONFIG
                            .noLanternVisionRadius,

                    softEdge:
                        GAME_CONFIG
                            .lanternSoftEdge,

                    /*
                        Não deixar o interior
                        da luz preto.
                    */

                    innerBrightness:
                        1,

                    middleBrightness:
                        0.88,

                    edgeBrightness:
                        0.28

                }),


            blood:
                Object.freeze({

                    flashMax:
                        0.58,

                    markMin:
                        3,

                    markMax:
                        6,

                    markLifeMin:
                        1.4,

                    markLifeMax:
                        3.6

                })

        });


    /* =========================================================
       ESTRADAS POR BIOMA

       Só muda aparência.
       Não altera o layout do mapa.
       ========================================================= */

    const PATH_STYLE_CONFIG =
        Object.freeze({

            village:
                Object.freeze({

                    base:
                        "#a88c61",

                    edge:
                        "#73654e",

                    detail:
                        "#c1a779",

                    secondary:
                        "#877357",

                    type:
                        "stone"

                }),


            forest:
                Object.freeze({

                    base:
                        "#766649",

                    edge:
                        "#4d553d",

                    detail:
                        "#92805a",

                    secondary:
                        "#5f704b",

                    type:
                        "leaf"

                }),


            grove:
                Object.freeze({

                    base:
                        "#695e43",

                    edge:
                        "#424f39",

                    detail:
                        "#817553",

                    secondary:
                        "#566746",

                    type:
                        "root"

                }),


            mountains:
                Object.freeze({

                    base:
                        "#878681",

                    edge:
                        "#626766",

                    detail:
                        "#babcb9",

                    secondary:
                        "#9ca09e",

                    type:
                        "snow"

                }),


            iron:
                Object.freeze({

                    base:
                        "#55524d",

                    edge:
                        "#343537",

                    detail:
                        "#7a7975",

                    secondary:
                        "#45494a",

                    type:
                        "ore"

                }),


            ruby:
                Object.freeze({

                    base:
                        "#5c3b41",

                    edge:
                        "#35262b",

                    detail:
                        "#a64b5c",

                    secondary:
                        "#703741",

                    type:
                        "ruby"

                }),


            monarchMaze:
                Object.freeze({

                    base:
                        "#302b35",

                    edge:
                        "#18151c",

                    detail:
                        "#5d4d69",

                    secondary:
                        "#3b3342",

                    type:
                        "rune"

                }),


            shadow:
                Object.freeze({

                    base:
                        "#35323e",

                    edge:
                        "#202029",

                    detail:
                        "#575267",

                    secondary:
                        "#423d4d",

                    type:
                        "mist"

                }),


            fairy:
                Object.freeze({

                    base:
                        "#766c7b",

                    edge:
                        "#505365",

                    detail:
                        "#bd87b1",

                    secondary:
                        "#8a7490",

                    type:
                        "flower"

                }),


            sky:
                Object.freeze({

                    base:
                        "#c8d0d2",

                    edge:
                        "#8e9ca3",

                    detail:
                        "#e5dcab",

                    secondary:
                        "#a8b6bb",

                    type:
                        "cloud"

                }),


            hell:
                Object.freeze({

                    base:
                        "#58352f",

                    edge:
                        "#302020",

                    detail:
                        "#a44732",

                    secondary:
                        "#733026",

                    type:
                        "ember"

                }),


            final:
                Object.freeze({

                    base:
                        "#4a4551",

                    edge:
                        "#242127",

                    detail:
                        "#85768f",

                    secondary:
                        "#5e5366",

                    type:
                        "memory"

                })

        });


    /* =========================================================
       COMPATIBILIDADE HTML / CSS

       IMPORTANTE:

       O projeto passou por versões diferentes de HTML.

       Em vez de deixar o JS quebrar por diferença de ID,
       ele agora reconhece os IDs do HTML V25 atual e também
       alguns IDs das versões anteriores.

       Isso resolve os principais desalinhamentos que estavam
       fazendo os botões e o HUD não responderem.
       ========================================================= */

    const DOM_ID_ALIASES =
        Object.freeze({

            /*
                MENU / PERSONAGEM
            */

            howBtn:
                Object.freeze([
                    "howToBtn"
                ]),

            startCharacterBtn:
                Object.freeze([
                    "startGameBtn"
                ]),

            playerNameInput:
                Object.freeze([
                    "playerName"
                ]),


            /*
                DIÁLOGO
            */

            dialoguePanel:
                Object.freeze([
                    "dialogueBox"
                ]),

            dialogueName:
                Object.freeze([
                    "dialogueSpeaker"
                ]),


            /*
                BATALHA
            */

            battleConfirmPanel:
                Object.freeze([
                    "battlePanel"
                ]),

            battleAcceptBtn:
                Object.freeze([
                    "battleAccept"
                ]),

            battleDeclineBtn:
                Object.freeze([
                    "battleDecline"
                ]),


            /*
                VIAGEM
            */

            travelConfirmBtn:
                Object.freeze([
                    "travelYes"
                ]),

            travelCancelBtn:
                Object.freeze([
                    "travelNo"
                ]),


            /*
                HUD
            */

            runtimeHUD:
                Object.freeze([
                    "hud"
                ]),

            hudPlayerName:
                Object.freeze([
                    "hudName"
                ]),

            hudPlayerLevel:
                Object.freeze([
                    "levelText"
                ]),

            hudHpFill:
                Object.freeze([
                    "hpBar"
                ]),

            hudHpText:
                Object.freeze([
                    "hpText"
                ]),

            hudMagicFill:
                Object.freeze([
                    "magicBar"
                ]),

            hudMagicText:
                Object.freeze([
                    "magicText"
                ]),

            hudEnergyFill:
                Object.freeze([
                    "energyBar"
                ]),

            hudEnergyText:
                Object.freeze([
                    "energyText"
                ]),

            hudMoney:
                Object.freeze([
                    "moneyText"
                ]),

            hudArea:
                Object.freeze([
                    "locationLabel"
                ]),


            /*
                TOAST / SAVE MESSAGE
            */

            gameToast:
                Object.freeze([
                    "saveMessage"
                ])

        });


    function $(id) {

        /*
            1. Primeiro procura o ID solicitado normalmente.
        */

        const direct =
            document
                .getElementById(
                    id
                );


        if (direct) {

            return direct;

        }


        /*
            2. Se não existir, procura alias compatível.
        */

        const aliases =
            DOM_ID_ALIASES[
                id
            ];


        if (!aliases) {

            return null;

        }


        for (
            const alias of
            aliases
        ) {

            const element =
                document
                    .getElementById(
                        alias
                    );


            if (element) {

                return element;

            }

        }


        return null;

    }


    function must(id) {

        const element =
            $(id);


        if (!element) {

            throw new Error(
                `VEYRA: elemento obrigatório #${id} não encontrado.`
            );

        }


        return element;

    }


    function getCanvasContext(
        target
    ) {

        if (
            !target ||
            typeof target.getContext !==
            "function"
        ) {

            return null;

        }


        return target
            .getContext(
                "2d"
            );

    }


    /* =========================================================
       TELAS
       ========================================================= */

    const screens = {

        menu:
            $("menuScreen"),

        how:
            $("howScreen"),

        credits:
            $("creditsScreen"),

        character:
            $("characterScreen"),

        game:
            $("gameScreen")

    };


    /* =========================================================
       CANVAS
       ========================================================= */

    const canvas =
        $("gameCanvas");


    const ctx =
        getCanvasContext(
            canvas
        );


    const miniCanvas =
        $("miniCanvas");


    const miniCtx =
        getCanvasContext(
            miniCanvas
        );


    const mapCanvas =
        $("worldMapCanvas");


    const mapCtx =
        getCanvasContext(
            mapCanvas
        );


    /* =========================================================
       MATEMÁTICA
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
        start,
        end,
        amount
    ) {

        return (

            start +

            (
                end -
                start
            ) *

            amount

        );

    }


    function inverseLerp(
        start,
        end,
        value
    ) {

        if (
            Math.abs(
                end -
                start
            ) <
            0.000001
        ) {

            return 0;

        }


        return clamp(

            (
                value -
                start
            ) /

            (
                end -
                start
            ),

            0,
            1

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
            Number(
                value
            );


        return Number.isFinite(
            number
        )
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

            bx -
            ax,

            by -
            ay

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
            0.000001
        ) {

            return {

                x:
                    0,

                y:
                    0,

                length:
                    0

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
        prefix = "entity"
    ) {

        return (

            `${prefix}_` +

            Math.random()
                .toString(
                    36
                )
                .slice(
                    2,
                    9
                ) +

            "_" +

            Date.now()
                .toString(
                    36
                )

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


    function hashString(
        text
    ) {

        let hash =
            2166136261;


        const string =
            String(
                text
            );


        for (
            let index = 0;
            index < string.length;
            index++
        ) {

            hash ^=
                string
                    .charCodeAt(
                        index
                    );


            hash =
                Math.imul(
                    hash,
                    16777619
                );

        }


        return (
            hash >>>
            0
        );

    }


    function mulberry32(
        seed
    ) {

        let value =
            seed >>>
            0;


        return function () {

            value +=
                0x6D2B79F5;


            let result =
                value;


            result =
                Math.imul(

                    result ^
                    (
                        result >>>
                        15
                    ),

                    result |
                    1

                );


            result ^=
                result +

                Math.imul(

                    result ^
                    (
                        result >>>
                        7
                    ),

                    result |
                    61

                );


            return (

                (
                    result ^
                    (
                        result >>>
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

            (
                max -
                min
            ) *

            rng()

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


    function chooseRandom(
        array,
        rng = Math.random
    ) {

        if (
            !Array.isArray(
                array
            ) ||
            array.length ===
            0
        ) {

            return null;

        }


        return array[
            Math.floor(
                rng() *
                array.length
            )
        ];

    }


    /* =========================================================
       COLISÃO
       ========================================================= */

    function circleCircleCollision(
        ax,
        ay,
        ar,
        bx,
        by,
        br
    ) {

        const combined =
            ar +
            br;


        const dx =
            ax -
            bx;


        const dy =
            ay -
            by;


        return (

            dx *
            dx +

            dy *
            dy <=

            combined *
            combined

        );

    }


    function circleRectCollision(
        cx,
        cy,
        radius,
        rect
    ) {

        const closestX =
            clamp(

                cx,

                rect.x,

                rect.x +
                rect.w

            );


        const closestY =
            clamp(

                cy,

                rect.y,

                rect.y +
                rect.h

            );


        const dx =
            cx -
            closestX;


        const dy =
            cy -
            closestY;


        return (

            dx *
            dx +

            dy *
            dy <=

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


    function pointInRect(
        x,
        y,
        rect
    ) {

        return (

            x >=
            rect.x &&

            x <=
            rect.x +
            rect.w &&

            y >=
            rect.y &&

            y <=
            rect.y +
            rect.h

        );

    }


    function distancePointToSegment(
        px,
        py,
        x1,
        y1,
        x2,
        y2
    ) {

        const vx =
            x2 -
            x1;


        const vy =
            y2 -
            y1;


        const wx =
            px -
            x1;


        const wy =
            py -
            y1;


        const lengthSquared =

            vx *
            vx +

            vy *
            vy;


        if (
            lengthSquared <=
            0.000001
        ) {

            return distance(
                px,
                py,
                x1,
                y1
            );

        }


        const t =
            clamp(

                (
                    wx *
                    vx +

                    wy *
                    vy
                ) /

                lengthSquared,

                0,
                1

            );


        return distance(

            px,
            py,

            x1 +
            vx *
            t,

            y1 +
            vy *
            t

        );

    }


    /* =========================================================
       ESTADO PRINCIPAL
       ========================================================= */

    const state = {

        selectedCharacter:
            null,

        player:
            null,

        area:
            "village",

        world:
            null,

        houseMode:
            false,

        currentHouse:
            null,

        houseReturn:
            null,

        running:
            false,

        paused:
            false,

        pauseReason:
            null,

        lastTime:
            0,

        time:
            0,

        autosaveTimer:
            0,

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

        activePanel:
            null,

        transition:
            null,

        transitionQueue:
            [],

        holdAction:
            null,

        bossBarTarget:
            null,

        portalCooldown:
            0,

        screenShake:
            0,

        screenShakePower:
            0,

        damageFlash:
            0,

        bloodMarks:
            [],

        toastTimer:
            null,

        skyWaveDelay:
            null,

        finalChoiceShown:
            false,

        /*
            Runtime DEV.
            Não é colocado dentro do save do personagem.
        */
        dev:
            null

    };


    /* =========================================================
       PERSONAGENS

       Símbolos preservados:
       🔥 ⚔️ 🪨 ✨ 🌀
       ========================================================= */

    const CHARACTERS =
        Object.freeze([


            /* =================================================
               KAELION
               ================================================= */

            Object.freeze({

                id:
                    "kaelion",

                name:
                    "KAELION",

                className:
                    "Mago",

                icon:
                    "🔥",

                color:
                    "#e88a42",

                glow:
                    "#ffaf5f",

                role:
                    "Força Mágica • Longo alcance",

                description:
                    "Especialista em memória arcana, dano mágico e combate à distância.",

                story:
                    "Kaelion passou anos estudando lembranças que já não pertenciam a ninguém. Quando páginas começaram a desaparecer de seus próprios livros, ele percebeu que a Quietude estava chegando perto demais.",


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


                sprite:
                    Object.freeze({

                        skin:
                            "#c99372",

                        hair:
                            "#392923",

                        body:
                            "#a75d31",

                        trim:
                            "#efaa63",

                        cape:
                            "#6f3527",

                        weapon:
                            "staff",

                        scale:
                            1

                    }),


                basicAttack:
                    Object.freeze({

                        id:
                            "kaelionOrb",

                        name:
                            "Faísca da Memória",

                        type:
                            "projectile",

                        range:
                            300,

                        speed:
                            430,

                        radius:
                            9,

                        hitRadius:
                            17,

                        damageMultiplier:
                            1,

                        color:
                            "#f29a45",

                        secondaryColor:
                            "#ffd29d",

                        particle:
                            "arcaneSpark"

                    })

            }),


            /* =================================================
               THERON
               ================================================= */

            Object.freeze({

                id:
                    "theron",

                name:
                    "THERON",

                className:
                    "Cavaleiro",

                icon:
                    "⚔️",

                color:
                    "#aeb3b6",

                glow:
                    "#dfe3e5",

                role:
                    "Defesa • Espada",

                description:
                    "Resistente e especializado em espada, proteção e combate corpo a corpo.",

                story:
                    "Theron já não consegue lembrar o rosto de todos que jurou proteger. Mesmo assim, continua carregando seus nomes gravados por dentro do escudo.",


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


                sprite:
                    Object.freeze({

                        skin:
                            "#c28d6d",

                        hair:
                            "#49413c",

                        body:
                            "#747a7e",

                        trim:
                            "#c8cdd0",

                        cape:
                            "#474b50",

                        weapon:
                            "sword",

                        scale:
                            1.03

                    }),


                basicAttack:
                    Object.freeze({

                        id:
                            "theronSlash",

                        name:
                            "Corte de Aço",

                        type:
                            "arc",

                        range:
                            94,

                        hitRadius:
                            29,

                        arc:
                            Math.PI *
                            0.82,

                        damageMultiplier:
                            1.05,

                        color:
                            "#e4e8ea",

                        secondaryColor:
                            "#aebac0",

                        particle:
                            "metalSpark"

                    })

            }),


            /* =================================================
               GRUMGAR
               ================================================= */

            Object.freeze({

                id:
                    "grumgar",

                name:
                    "GRUMGAR",

                className:
                    "Troll",

                icon:
                    "🪨",

                color:
                    "#718752",

                glow:
                    "#9eb572",

                role:
                    "Força • Resistência",

                description:
                    "Possui grande resistência, impacto poderoso e menor velocidade natural.",

                story:
                    "Grumgar veio de ruínas onde as próprias pedras repetem nomes de um povo que ninguém mais conhece. Para ele, enquanto uma pedra lembrar, aquele povo ainda existe.",


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


                sprite:
                    Object.freeze({

                        skin:
                            "#72895b",

                        hair:
                            "#35422f",

                        body:
                            "#59683f",

                        trim:
                            "#9ba76d",

                        cape:
                            null,

                        weapon:
                            "club",

                        scale:
                            1.12

                    }),


                basicAttack:
                    Object.freeze({

                        id:
                            "grumgarSmash",

                        name:
                            "Impacto de Pedra",

                        type:
                            "smash",

                        range:
                            84,

                        hitRadius:
                            64,

                        damageMultiplier:
                            1.12,

                        color:
                            "#877d61",

                        secondaryColor:
                            "#b4a77b",

                        particle:
                            "rockDebris"

                    })

            }),


            /* =================================================
               LIRAEL
               ================================================= */

            Object.freeze({

                id:
                    "lirael",

                name:
                    "LIRAEL",

                className:
                    "Fada",

                icon:
                    "✨",

                color:
                    "#db8bc0",

                glow:
                    "#f8bce3",

                role:
                    "Velocidade • Luz",

                description:
                    "Ágil, mágica e capaz de manipular energia feérica à distância.",

                story:
                    "Lirael nasceu em um lugar que agora aparece nos mapas antigos apenas como uma mancha sem nome. Ela se recusa a aceitar que algo desapareça só porque o mundo parou de lembrar.",


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


                sprite:
                    Object.freeze({

                        skin:
                            "#d7a0a7",

                        hair:
                            "#efbfdd",

                        body:
                            "#bc6fa5",

                        trim:
                            "#f3b8de",

                        cape:
                            null,

                        weapon:
                            "wand",

                        wings:
                            true,

                        scale:
                            0.94

                    }),


                basicAttack:
                    Object.freeze({

                        id:
                            "liraelSpark",

                        name:
                            "Luz Feérica",

                        type:
                            "projectile",

                        range:
                            345,

                        speed:
                            520,

                        radius:
                            7,

                        hitRadius:
                            16,

                        damageMultiplier:
                            0.96,

                        color:
                            "#f2a8df",

                        secondaryColor:
                            "#ffe2f6",

                        particle:
                            "fairyStar"

                    })

            }),


            /* =================================================
               ZEPHYR
               ================================================= */

            Object.freeze({

                id:
                    "zephyr",

                name:
                    "ZEPHYR",

                className:
                    "Transmorfo",

                icon:
                    "🌀",

                color:
                    "#9167c9",

                glow:
                    "#c49af0",

                role:
                    "Adaptação • Mobilidade",

                description:
                    "Equilibrado, imprevisível e capaz de adaptar o próprio estilo durante a batalha.",

                story:
                    "Zephyr recorda versões diferentes da própria vida. Em algumas ele nunca chegou a Veyra. Em outras, Veyra jamais existiu. Ele quer descobrir qual memória está mentindo.",


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


                sprite:
                    Object.freeze({

                        skin:
                            "#b88f83",

                        hair:
                            "#45344f",

                        body:
                            "#6f5298",

                        trim:
                            "#b489dc",

                        cape:
                            "#443357",

                        weapon:
                            "blade",

                        scale:
                            1

                    }),


                basicAttack:
                    Object.freeze({

                        id:
                            "zephyrRift",

                        name:
                            "Fenda Adaptativa",

                        type:
                            "doubleSlash",

                        range:
                            110,

                        hitRadius:
                            31,

                        arc:
                            Math.PI *
                            0.7,

                        damageMultiplier:
                            1,

                        color:
                            "#a978df",

                        secondaryColor:
                            "#d4b5f4",

                        particle:
                            "riftAfterimage"

                    })

            })

        ]);


    /* =========================================================
       PERSONAGEM HELPERS
       ========================================================= */

    function getCharacterById(
        id
    ) {

        return (

            CHARACTERS.find(
                character =>
                    character.id ===
                    id
            ) ||

            null

        );

    }


    function currentCharacter() {

        const id =

            state.player
                ?.characterId ||

            state.selectedCharacter
                ?.id;


        return (

            getCharacterById(
                id
            ) ||

            CHARACTERS[0]

        );

    }


    /* =========================================================
       BARRAS DA TELA DE PERSONAGEM

       Derivadas dos valores REAIS.
       ========================================================= */

    const CHARACTER_SELECTION_RANGE =
        Object.freeze({

            hp:
                Object.freeze({

                    min:
                        70,

                    max:
                        170

                }),

            magic:
                Object.freeze({

                    min:
                        50,

                    max:
                        160

                }),

            energy:
                Object.freeze({

                    min:
                        80,

                    max:
                        140

                }),

            damage:
                Object.freeze({

                    min:
                        18,

                    max:
                        34

                }),

            defense:
                Object.freeze({

                    min:
                        4,

                    max:
                        22

                }),

            speed:
                Object.freeze({

                    min:
                        115,

                    max:
                        180

                })

        });


    function getCharacterStatBarValue(
        character,
        stat
    ) {

        const range =
            CHARACTER_SELECTION_RANGE[
                stat
            ];


        if (!range) {

            return 0;

        }


        return Math.round(

            inverseLerp(

                range.min,

                range.max,

                character[
                    stat
                ]

            ) *

            100

        );

    }


    /* =========================================================
       STATUS DISTRIBUÍVEIS

       REGRAS:

       ✓ Força e Magia = um único atributo.
       ✓ Energia.
       ✓ Fome.
       ✓ Cansaço.

       ✗ Velocidade NÃO recebe pontos.
       ✗ Vida NÃO recebe pontos.

       HP =
       HP base do personagem + armadura.
       ========================================================= */

    const STAT_CONFIG =
        Object.freeze({

            power:
                Object.freeze({

                    id:
                        "power",

                    label:
                        "FORÇA / MAGIA",

                    icon:
                        "✦",

                    description:
                        "Aumenta o dano causado e a reserva máxima de Magia.",

                    /*
                        +2,5% de dano por ponto.
                    */
                    damagePerPoint:
                        0.025,

                    /*
                        +4 de magia máxima por ponto.
                    */
                    magicPerPoint:
                        4

                }),


            energy:
                Object.freeze({

                    id:
                        "energy",

                    label:
                        "ENERGIA",

                    icon:
                        "⚡",

                    description:
                        "Aumenta a Energia máxima.",

                    amountPerPoint:
                        5

                }),


            hunger:
                Object.freeze({

                    id:
                        "hunger",

                    label:
                        "FOME",

                    icon:
                        "🍞",

                    description:
                        "Aumenta a reserva máxima de Fome.",

                    amountPerPoint:
                        4

                }),


            fatigue:
                Object.freeze({

                    id:
                        "fatigue",

                    label:
                        "CANSAÇO",

                    icon:
                        "🌙",

                    description:
                        "Aumenta a resistência máxima ao Cansaço.",

                    amountPerPoint:
                        4

                })

        });


    function getStatusPointsForLevel(
        reachedLevel
    ) {

        if (
            reachedLevel <=
            1
        ) {

            return 0;

        }


        const bonus =

            reachedLevel %
            BONUS_STATUS_POINT_INTERVAL ===
            0

                ? 1

                : 0;


        return (

            BASE_STATUS_POINTS_PER_LEVEL +

            bonus

        );

    }


    /* =========================================================
       XP
       ========================================================= */

    function calculateXpToNext(
        level
    ) {

        if (
            level >=
            MAX_LEVEL
        ) {

            return Infinity;

        }


        return Math.round(

            95 +

            level *
            52 +

            Math.pow(
                level,
                1.48
            ) *

            14

        );

    }


    /* =========================================================
       ARMADURAS

       SEQUÊNCIA OBRIGATÓRIA:

       1. Folha
       2. Algodão
       3. Madeira
       4. Couro
       5. Ferro
       6. Ouro
       7. Diamante
       8. Rubi
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


    const ARMOR_DATA =
        Object.freeze({


            /* =================================================
               FOLHA
               ================================================= */

            armaduraFolha:
                Object.freeze({

                    id:
                        "armaduraFolha",

                    tier:
                        1,

                    name:
                        "Armadura de Folha",

                    icon:
                        "🍃",

                    defense:
                        3,

                    hpBonus:
                        25,

                    previousArmor:
                        null,

                    vendor:
                        "doran",

                    price:
                        65

                }),


            /* =================================================
               ALGODÃO
               ================================================= */

            armaduraAlgodao:
                Object.freeze({

                    id:
                        "armaduraAlgodao",

                    tier:
                        2,

                    name:
                        "Armadura de Algodão",

                    icon:
                        "☁️",

                    defense:
                        6,

                    hpBonus:
                        50,

                    previousArmor:
                        "armaduraFolha",

                    vendor:
                        "doran",

                    price:
                        105

                }),


            /* =================================================
               MADEIRA
               ================================================= */

            armaduraMadeira:
                Object.freeze({

                    id:
                        "armaduraMadeira",

                    tier:
                        3,

                    name:
                        "Armadura de Madeira",

                    icon:
                        "🪵",

                    defense:
                        10,

                    hpBonus:
                        75,

                    previousArmor:
                        "armaduraAlgodao",

                    vendor:
                        "doran",

                    price:
                        165

                }),


            /* =================================================
               COURO
               ================================================= */

            armaduraCouro:
                Object.freeze({

                    id:
                        "armaduraCouro",

                    tier:
                        4,

                    name:
                        "Armadura de Couro",

                    icon:
                        "🥋",

                    defense:
                        15,

                    hpBonus:
                        100,

                    previousArmor:
                        "armaduraMadeira",

                    vendor:
                        "doran",

                    price:
                        250

                }),


            /* =================================================
               FERRO
               ================================================= */

            armaduraFerro:
                Object.freeze({

                    id:
                        "armaduraFerro",

                    tier:
                        5,

                    name:
                        "Armadura de Ferro",

                    icon:
                        "🛡️",

                    defense:
                        22,

                    hpBonus:
                        125,

                    previousArmor:
                        "armaduraCouro",

                    vendor:
                        "borin"

                }),


            /* =================================================
               OURO
               ================================================= */

            armaduraOuro:
                Object.freeze({

                    id:
                        "armaduraOuro",

                    tier:
                        6,

                    name:
                        "Armadura de Ouro",

                    icon:
                        "🟨",

                    defense:
                        30,

                    hpBonus:
                        150,

                    previousArmor:
                        "armaduraFerro",

                    vendor:
                        "borin"

                }),


            /* =================================================
               DIAMANTE
               ================================================= */

            armaduraDiamante:
                Object.freeze({

                    id:
                        "armaduraDiamante",

                    tier:
                        7,

                    name:
                        "Armadura de Diamante",

                    icon:
                        "💎",

                    defense:
                        40,

                    hpBonus:
                        175,

                    previousArmor:
                        "armaduraOuro",

                    vendor:
                        "borin"

                }),


            /* =================================================
               RUBI
               ================================================= */

            armaduraRubi:
                Object.freeze({

                    id:
                        "armaduraRubi",

                    tier:
                        8,

                    name:
                        "Armadura de Rubi",

                    icon:
                        "♦️",

                    defense:
                        53,

                    hpBonus:
                        200,

                    previousArmor:
                        "armaduraDiamante",

                    vendor:
                        "borin"

                })

        });


    /* =========================================================
       UPGRADES DO BORIN
       ========================================================= */

    const ARMOR_UPGRADES =
        Object.freeze([


            Object.freeze({

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

            }),


            Object.freeze({

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

            }),


            Object.freeze({

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

            }),


            Object.freeze({

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

            })

        ]);


    /* =========================================================
       ITENS
       ========================================================= */

    const ITEMS = {


        /* =====================================================
           MATERIAIS
           ===================================================== */

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
                1,

            value:
                2,

            sellable:
                true

        },


        carvao: {

            id:
                "carvao",

            name:
                "Carvão",

            icon:
                "⬛",

            category:
                "materials",

            weight:
                1,

            value:
                6,

            sellable:
                true

        },


        ferro: {

            id:
                "ferro",

            name:
                "Ferro",

            icon:
                "⛓️",

            category:
                "materials",

            weight:
                1.2,

            value:
                12,

            sellable:
                true

        },


        ouro: {

            id:
                "ouro",

            name:
                "Ouro",

            icon:
                "🟡",

            category:
                "materials",

            weight:
                1.1,

            value:
                22,

            sellable:
                true

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
                0.7,

            value:
                45,

            sellable:
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
                0.7,

            value:
                55,

            sellable:
                true

        },


        cristal: {

            id:
                "cristal",

            name:
                "Cristal",

            icon:
                "🔷",

            category:
                "materials",

            weight:
                0.7,

            value:
                30,

            sellable:
                true

        },


        essencia: {

            id:
                "essencia",

            name:
                "Essência",

            icon:
                "✦",

            category:
                "materials",

            weight:
                0.2,

            value:
                24,

            sellable:
                true

        },


        couro: {

            id:
                "couro",

            name:
                "Couro",

            icon:
                "🟫",

            category:
                "materials",

            weight:
                0.8,

            value:
                13,

            sellable:
                true

        },


        osso: {

            id:
                "osso",

            name:
                "Osso",

            icon:
                "🦴",

            category:
                "materials",

            weight:
                0.5,

            value:
                8,

            sellable:
                true

        },


        fragmento: {

            id:
                "fragmento",

            name:
                "Fragmento Antigo",

            icon:
                "◇",

            category:
                "materials",

            weight:
                0.3,

            value:
                28,

            sellable:
                true

        },


        /* =====================================================
           COMIDA
           ===================================================== */

        pao: {

            id:
                "pao",

            name:
                "Pão",

            icon:
                "🍞",

            category:
                "food",

            weight:
                0.5,

            value:
                8,

            hunger:
                24,

            sellable:
                true

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
                0.8,

            value:
                18,

            hunger:
                42,

            fatigue:
                8,

            sellable:
                true

        },


        /* =====================================================
           POÇÕES
           ===================================================== */

        pocao: {

            id:
                "pocao",

            name:
                "Poção de Vida",

            icon:
                "❤️",

            category:
                "potions",

            weight:
                1,

            value:
                28,

            heal:
                55,

            sellable:
                true

        },


        elixir: {

            id:
                "elixir",

            name:
                "Elixir de Energia",

            icon:
                "💙",

            category:
                "potions",

            weight:
                1,

            value:
                35,

            energy:
                55,

            sellable:
                true

        },


        pocaoForca: {

            id:
                "pocaoForca",

            name:
                "Poção de Poder",

            icon:
                "🔥",

            category:
                "potions",

            weight:
                1,

            value:
                55,

            buff:
                "power",

            duration:
                15,

            multiplier:
                1.18,

            sellable:
                true

        },


        pocaoResistencia: {

            id:
                "pocaoResistencia",

            name:
                "Poção de Resistência",

            icon:
                "🛡️",

            category:
                "potions",

            weight:
                1,

            value:
                55,

            buff:
                "resistance",

            duration:
                15,

            defenseBonus:
                12,

            sellable:
                true

        },


        pocaoVelocidade: {

            id:
                "pocaoVelocidade",

            name:
                "Poção de Velocidade",

            icon:
                "💨",

            category:
                "potions",

            weight:
                1,

            value:
                60,

            buff:
                "speed",

            duration:
                15,

            speedMultiplier:
                1.22,

            sellable:
                true

        },


        /* =====================================================
           ARMAS
           ===================================================== */

        espadaSimples: {

            id:
                "espadaSimples",

            name:
                "Espada Simples",

            icon:
                "🗡️",

            category:
                "weapons",

            weight:
                3,

            value:
                60,

            damage:
                4,

            sellable:
                false,

            starter:
                true

        },


        espadaFerro: {

            id:
                "espadaFerro",

            name:
                "Espada de Ferro",

            icon:
                "⚔️",

            category:
                "weapons",

            weight:
                4,

            value:
                140,

            damage:
                12,

            sellable:
                true

        },


        /* =====================================================
           FERRAMENTAS
           ===================================================== */

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
                3,

            value:
                50,

            sellable:
                false,

            starter:
                true

        },


        /* =====================================================
           ESPECIAIS
           ===================================================== */

        minimapa: {

            id:
                "minimapa",

            name:
                "Minimapa",

            icon:
                "🗺️",

            category:
                "special",

            weight:
                0,

            value:
                MINIMAP_PRICE,

            unique:
                true,

            sellable:
                false

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

            sellable:
                false

        },


        flautaMemoria: {

            id:
                "flautaMemoria",

            name:
                "Flauta da Memória",

            icon:
                "🎶",

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

            sellable:
                false

        }

    };


    /* =========================================================
       INSERE ARMADURAS NO CATÁLOGO
       ========================================================= */

    for (
        const armorId of
        ARMOR_PROGRESSION
    ) {

        const armor =
            ARMOR_DATA[
                armorId
            ];


        ITEMS[
            armorId
        ] = {

            id:
                armor.id,

            name:
                armor.name,

            icon:
                armor.icon,

            category:
                "armor",

            weight:

                5 +

                armor.tier *
                0.7,

            value:

                armor.price ||
                0,

            defense:
                armor.defense,

            hpBonus:
                armor.hpBonus,

            tier:
                armor.tier,

            previousArmor:
                armor.previousArmor,

            unique:
                true,

            /*
                Armadura de progressão não é
                vendável para evitar softlock.
            */
            progression:
                true,

            sellable:
                false

        };

    }


    Object.freeze(
        ITEMS
    );


    /* =========================================================
       ARMOR HELPERS
       ========================================================= */

    function getArmorTier(
        id
    ) {

        return (

            ARMOR_DATA[
                id
            ]?.tier ||

            0

        );

    }


    function getEquippedArmor() {

        const id =
            state.player
                ?.equipment
                ?.armor;


        return (

            id

                ? ITEMS[
                    id
                ] ||
                  null

                : null

        );

    }


    function playerOwnsArmor(
        id
    ) {

        if (
            !state.player ||
            !ARMOR_DATA[
                id
            ]
        ) {

            return false;

        }


        return (

            getRealItemCount(
                id
            ) >
            0 ||

            state.player
                .equipment
                ?.armor ===
            id

        );

    }


    function getHighestOwnedArmorTier() {

        if (
            !state.player
        ) {

            return 0;

        }


        /*
            Guarda o maior tier já comprado
            mesmo que a armadura anterior tenha
            sido consumida em upgrade.
        */

        let highest =
            finiteNumber(

                state.player
                    .armorHighestTierEver,

                0

            );


        for (
            const id of
            ARMOR_PROGRESSION
        ) {

            if (
                playerOwnsArmor(
                    id
                )
            ) {

                highest =
                    Math.max(

                        highest,

                        getArmorTier(
                            id
                        )

                    );

            }

        }


        return clamp(

            highest,

            0,

            ARMOR_PROGRESSION
                .length

        );

    }


    function getHighestOwnedArmorId() {

        const tier =
            getHighestOwnedArmorTier();


        return (

            tier >
            0

                ? ARMOR_PROGRESSION[
                    tier -
                    1
                ]

                : null

        );

    }


    function getNextArmorUpgradeId() {

        const tier =
            getHighestOwnedArmorTier();


        return (

            tier <
            ARMOR_PROGRESSION
                .length

                ? ARMOR_PROGRESSION[
                    tier
                ]

                : null

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

        const currentTier =
            getHighestOwnedArmorTier();


        return {

            currentTier,

            currentId:

                currentTier >
                0

                    ? ARMOR_PROGRESSION[
                        currentTier -
                        1
                    ]

                    : null,

            nextId:

                currentTier <
                ARMOR_PROGRESSION
                    .length

                    ? ARMOR_PROGRESSION[
                        currentTier
                    ]

                    : null,

            maxed:

                currentTier >=
                ARMOR_PROGRESSION
                    .length

        };

    }


    /* =========================================================
       HABILIDADES Q / R / F

       A execução entra depois.
       Aqui ficam os dados.
       ========================================================= */

    const CLASS_SKILLS =
        Object.freeze({


            /* =================================================
               KAELION
               ================================================= */

            kaelion:
                Object.freeze({

                    q:
                        Object.freeze({

                            id:
                                "memoryRay",

                            name:
                                "Raio de Memória",

                            costType:
                                "magic",

                            cost:
                                15,

                            cooldown:
                                2

                        }),


                    r:
                        Object.freeze({

                            id:
                                "arcaneCircle",

                            name:
                                "Círculo Arcano",

                            costType:
                                "magic",

                            cost:
                                24,

                            cooldown:
                                5

                        }),


                    f:
                        Object.freeze({

                            id:
                                "memoryExplosion",

                            name:
                                "Explosão de Memória",

                            costType:
                                "magic",

                            cost:
                                36,

                            cooldown:
                                8

                        })

                }),


            /* =================================================
               THERON
               ================================================= */

            theron:
                Object.freeze({

                    q:
                        Object.freeze({

                            id:
                                "guardianStrike",

                            name:
                                "Golpe do Guardião",

                            costType:
                                "energy",

                            cost:
                                10,

                            cooldown:
                                3

                        }),


                    r:
                        Object.freeze({

                            id:
                                "ironGuard",

                            name:
                                "Postura de Ferro",

                            costType:
                                "energy",

                            cost:
                                18,

                            cooldown:
                                6

                        }),


                    f:
                        Object.freeze({

                            id:
                                "guardianRush",

                            name:
                                "Investida do Guardião",

                            costType:
                                "energy",

                            cost:
                                25,

                            cooldown:
                                8

                        })

                }),


            /* =================================================
               GRUMGAR
               ================================================= */

            grumgar:
                Object.freeze({

                    q:
                        Object.freeze({

                            id:
                                "crushingBlow",

                            name:
                                "Esmagamento",

                            costType:
                                "energy",

                            cost:
                                13,

                            cooldown:
                                4

                        }),


                    r:
                        Object.freeze({

                            id:
                                "stoneRoar",

                            name:
                                "Rugido de Pedra",

                            costType:
                                "energy",

                            cost:
                                20,

                            cooldown:
                                6

                        }),


                    f:
                        Object.freeze({

                            id:
                                "earthBreaker",

                            name:
                                "Ruptura do Solo",

                            costType:
                                "energy",

                            cost:
                                30,

                            cooldown:
                                9

                        })

                }),


            /* =================================================
               LIRAEL
               ================================================= */

            lirael:
                Object.freeze({

                    q:
                        Object.freeze({

                            id:
                                "vitalLight",

                            name:
                                "Luz Vital",

                            costType:
                                "magic",

                            cost:
                                14,

                            cooldown:
                                4

                        }),


                    r:
                        Object.freeze({

                            id:
                                "fairyBurst",

                            name:
                                "Rajada Feérica",

                            costType:
                                "magic",

                            cost:
                                20,

                            cooldown:
                                4.5

                        }),


                    f:
                        Object.freeze({

                            id:
                                "starRain",

                            name:
                                "Chuva de Luz",

                            costType:
                                "magic",

                            cost:
                                34,

                            cooldown:
                                8

                        })

                }),


            /* =================================================
               ZEPHYR
               ================================================= */

            zephyr:
                Object.freeze({

                    q:
                        Object.freeze({

                            id:
                                "adaptiveCut",

                            name:
                                "Corte Adaptativo",

                            costType:
                                "magic",

                            cost:
                                11,

                            cooldown:
                                2.8

                        }),


                    r:
                        Object.freeze({

                            id:
                                "adaptiveForm",

                            name:
                                "Forma Adaptativa",

                            costType:
                                "magic",

                            cost:
                                12,

                            cooldown:
                                8

                        }),


                    /*
                        Dash próprio do Zephyr.

                        NÃO é o Dash universal
                        desbloqueado no Monarca.
                    */
                    f:
                        Object.freeze({

                            id:
                                "riftStep",

                            name:
                                "Passo da Fenda",

                            costType:
                                "energy",

                            cost:
                                20,

                            cooldown:
                                6

                        })

                })

        });


    /* =========================================================
       FIM DA PARTE 1/4

       NÃO COLOQUE:

       })();

       A PARTE 2/4 ENTRA DIRETAMENTE ABAIXO.
       ========================================================= */
     /* =========================================================
       VEYRA: A QUIETUDE — V25
       SCRIPT.JS — PARTE 2/4

       INVENTÁRIO / PLAYER / NPCs / INIMIGOS / BOSSES
       COMANDOS DE TESTE / REGIÕES / CASAS / MAPA / PORTAS
       GERAÇÃO E COLISÕES DO MUNDO

       CONTINUA DIRETAMENTE DA PARTE 1/4.
       ========================================================= */


    /* =========================================================
       INVENTÁRIO
       ========================================================= */

    function createEmptyInventory() {

        const inventory = {};


        for (
            const id of
            Object.keys(
                ITEMS
            )
        ) {

            inventory[id] =
                0;

        }


        return inventory;

    }


    function getRealItemCount(
        id
    ) {

        if (
            !state.player ||
            !state.player.inventory
        ) {

            return 0;

        }


        return Math.max(
            0,
            Math.floor(
                finiteNumber(
                    state.player
                        .inventory[id],
                    0
                )
            )
        );

    }


    function isMaterialItem(
        id
    ) {

        return (
            ITEMS[id]
                ?.category ===
            "materials"
        );

    }


    function getItemCount(
        id
    ) {

        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMaterials &&
            isMaterialItem(
                id
            )
        ) {

            return 999999;

        }


        return getRealItemCount(
            id
        );

    }


    function getInventoryWeight() {

        if (
            !state.player
        ) {

            return 0;

        }


        let total =
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
                !item ||
                amount <=
                0
            ) {

                continue;

            }


            total +=

                finiteNumber(
                    item.weight,
                    0
                ) *

                amount;

        }


        return total;

    }


    function canCarryItem(
        id,
        amount = 1
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (
            !player ||
            !item
        ) {

            return false;

        }


        if (
            item.weight <=
            0
        ) {

            return true;

        }


        const current =
            getInventoryWeight();


        const added =

            item.weight *
            Math.max(
                0,
                amount
            );


        return (

            current +
            added <=

            player
                .inventoryWeightLimit

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


        if (
            !player ||
            !item
        ) {

            return false;

        }


        const quantity =
            Math.max(
                1,
                Math.floor(
                    finiteNumber(
                        amount,
                        1
                    )
                )
            );


        if (
            !canCarryItem(
                id,
                quantity
            )
        ) {

            if (
                !options.silent &&
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Seu inventário está pesado demais."
                );

            }


            return false;

        }


        if (
            item.unique &&
            getRealItemCount(
                id
            ) >
            0
        ) {

            return false;

        }


        player.inventory[id] =
            getRealItemCount(
                id
            ) +
            quantity;


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


        if (
            !player ||
            !item
        ) {

            return false;

        }


        const quantity =
            Math.max(
                1,
                Math.floor(
                    finiteNumber(
                        amount,
                        1
                    )
                )
            );


        /*
            TESTE DE MATERIAIS INFINITOS.

            Não altera o inventário real.
        */
        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMaterials &&
            item.category ===
                "materials"
        ) {

            return true;

        }


        const current =
            getRealItemCount(
                id
            );


        if (
            current <
            quantity
        ) {

            return false;

        }


        player.inventory[id] =
            current -
            quantity;


        return true;

    }


    /* =========================================================
       DINHEIRO
       ========================================================= */

    function getRealMoney() {

        return Math.max(
            0,
            Math.floor(
                finiteNumber(
                    state.player
                        ?.money,
                    0
                )
            )
        );

    }


    function getMoneyDisplay() {

        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMoney
        ) {

            return "∞";

        }


        return String(
            getRealMoney()
        );

    }


    function hasEnoughMoney(
        amount
    ) {

        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMoney
        ) {

            return true;

        }


        return (
            getRealMoney() >=
            amount
        );

    }


    function addMoney(
        amount
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        const value =
            Math.max(
                0,
                Math.floor(
                    finiteNumber(
                        amount,
                        0
                    )
                )
            );


        state.player.money =
            getRealMoney() +
            value;


        return true;

    }


    function spendMoney(
        amount
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        const value =
            Math.max(
                0,
                Math.floor(
                    finiteNumber(
                        amount,
                        0
                    )
                )
            );


        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMoney
        ) {

            return true;

        }


        if (
            getRealMoney() <
            value
        ) {

            return false;

        }


        state.player.money =
            getRealMoney() -
            value;


        return true;

    }


    /* =========================================================
       PLAYER
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


        inventory.pao =
            2;


        inventory.pocao =
            2;


        return {

            characterId:
                character.id,

            name:
                String(
                    name ||
                    character.name
                )
                    .trim()
                    .slice(
                        0,
                        16
                    ) ||
                character.name,


            x:
                PLAYER_HOME
                    .interiorSpawn
                    .x,

            y:
                PLAYER_HOME
                    .interiorSpawn
                    .y,

            radius:
                VISUAL_CONFIG
                    .player
                    .radius,

            facing:
                "down",

            walkTime:
                0,


            level:
                1,

            xp:
                0,

            xpToNext:
                calculateXpToNext(
                    1
                ),

            statPoints:
                0,


            stats: {

                power:
                    0,

                energy:
                    0,

                hunger:
                    0,

                fatigue:
                    0

            },


            maxHp:
                character.hp,

            hp:
                character.hp,


            maxMagic:
                character.magic,

            magic:
                character.magic,


            maxEnergy:
                character.energy,

            energy:
                character.energy,


            maxHunger:
                100,

            hunger:
                100,


            maxFatigue:
                100,

            fatigue:
                100,


            damage:
                character.damage,

            defense:
                character.defense,

            speed:
                character.speed,


            money:
                45,


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


            armorHighestTierEver:
                0,


            purchasedUniqueItems:
                [],


            abilities: {

                dash:
                    false,

                /*
                    Habilidades das Rotas 2 e 3
                    permanecem sem definição aqui.
                */
                route2:
                    false,

                route3:
                    false

            },


            unlockedAreas: [
                "village"
            ],


            exploredAreas: [
                "village"
            ],


            defeatedBosses:
                [],


            discoveredBosses:
                [],


            gateUnlocks: {

                north:
                    false,

                west:
                    false,

                south:
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


            quest: {

                wood: {

                    state:
                        "none",

                    rewarded:
                        false

                },

                coal: {

                    state:
                        "none",

                    rewarded:
                        false

                }

            },


            lanternOwned:
                false,

            minimapOwned:
                false,


            monarchAwakened:
                false,

            monarchDefeated:
                false,

            monarchHits:
                0,

            dashPurchased:
                false,


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


            fluteRewardGranted:
                false,

            flutePlayed:
                false,


            checkpoint: {

                area:
                    "village",

                houseId:
                    "home",

                type:
                    "playerHome"

            },


            activePotionBuffs:
                [],


            attackCooldown:
                0,


            skillCooldowns: {

                q:
                    0,

                r:
                    0,

                f:
                    0

            },


            universalDashCooldown:
                0,


            playerDash:
                null,

            zephyrDash:
                null,

            guardianRush:
                null,

            ironGuard:
                null,

            adaptiveBuff:
                null,


            movementSlowTimer:
                0,

            movementSlowMultiplier:
                1,


            poisonEffect:
                null,


            starvationTimer:
                0,

            exhaustionTimer:
                0,


            resting: {

                active:
                    false,

                timer:
                    0,

                duration:
                    0

            },


            hurtAnim:
                0,

            invincible:
                0,

            dead:
                false,


            finalChoice:
                null

        };

    }


    /* =========================================================
       RECÁLCULO DOS ATRIBUTOS

       LEVEL NÃO AUMENTA STATS AUTOMATICAMENTE.
       ========================================================= */

    function recalculatePlayerStats(
        options = {}
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        const character =
            currentCharacter();


        const previous = {

            maxHp:
                Math.max(
                    1,
                    finiteNumber(
                        player.maxHp,
                        character.hp
                    )
                ),

            hp:
                Math.max(
                    0,
                    finiteNumber(
                        player.hp,
                        character.hp
                    )
                ),

            maxMagic:
                Math.max(
                    1,
                    finiteNumber(
                        player.maxMagic,
                        character.magic
                    )
                ),

            magic:
                Math.max(
                    0,
                    finiteNumber(
                        player.magic,
                        character.magic
                    )
                ),

            maxEnergy:
                Math.max(
                    1,
                    finiteNumber(
                        player.maxEnergy,
                        character.energy
                    )
                ),

            energy:
                Math.max(
                    0,
                    finiteNumber(
                        player.energy,
                        character.energy
                    )
                ),

            maxHunger:
                Math.max(
                    1,
                    finiteNumber(
                        player.maxHunger,
                        100
                    )
                ),

            hunger:
                Math.max(
                    0,
                    finiteNumber(
                        player.hunger,
                        100
                    )
                ),

            maxFatigue:
                Math.max(
                    1,
                    finiteNumber(
                        player.maxFatigue,
                        100
                    )
                ),

            fatigue:
                Math.max(
                    0,
                    finiteNumber(
                        player.fatigue,
                        100
                    )
                )

        };


        player.stats =
            player.stats ||
            {};


        const power =
            clamp(
                Math.floor(
                    finiteNumber(
                        player.stats.power,
                        0
                    )
                ),
                0,
                STAT_CAP
            );


        const energyStat =
            clamp(
                Math.floor(
                    finiteNumber(
                        player.stats.energy,
                        0
                    )
                ),
                0,
                STAT_CAP
            );


        const hungerStat =
            clamp(
                Math.floor(
                    finiteNumber(
                        player.stats.hunger,
                        0
                    )
                ),
                0,
                STAT_CAP
            );


        const fatigueStat =
            clamp(
                Math.floor(
                    finiteNumber(
                        player.stats.fatigue,
                        0
                    )
                ),
                0,
                STAT_CAP
            );


        player.stats.power =
            power;


        player.stats.energy =
            energyStat;


        player.stats.hunger =
            hungerStat;


        player.stats.fatigue =
            fatigueStat;


        const armor =
            getEquippedArmor();


        const armorHp =
            finiteNumber(
                armor?.hpBonus,
                0
            );


        const armorDefense =
            finiteNumber(
                armor?.defense,
                0
            );


        const weapon =
            ITEMS[
                player.equipment
                    ?.weapon
            ];


        const weaponDamage =
            finiteNumber(
                weapon?.damage,
                0
            );


        let resistanceBonus =
            0;


        let speedMultiplier =
            1;


        let powerMultiplier =
            1;


        for (
            const buff of
            player.activePotionBuffs ||
            []
        ) {

            if (
                buff.type ===
                "resistance"
            ) {

                resistanceBonus +=
                    finiteNumber(
                        buff.defenseBonus,
                        0
                    );

            }


            if (
                buff.type ===
                "speed"
            ) {

                speedMultiplier *=
                    Math.max(
                        1,
                        finiteNumber(
                            buff.speedMultiplier,
                            1
                        )
                    );

            }


            if (
                buff.type ===
                "power"
            ) {

                powerMultiplier *=
                    Math.max(
                        1,
                        finiteNumber(
                            buff.multiplier,
                            1
                        )
                    );

            }

        }


        player.maxHp =

            character.hp +

            armorHp;


        player.maxMagic =

            character.magic +

            power *
            STAT_CONFIG
                .power
                .magicPerPoint;


        player.maxEnergy =

            character.energy +

            energyStat *
            STAT_CONFIG
                .energy
                .amountPerPoint;


        player.maxHunger =

            100 +

            hungerStat *
            STAT_CONFIG
                .hunger
                .amountPerPoint;


        player.maxFatigue =

            100 +

            fatigueStat *
            STAT_CONFIG
                .fatigue
                .amountPerPoint;


        player.damage =

            (
                character.damage +
                weaponDamage
            ) *

            (
                1 +

                power *
                STAT_CONFIG
                    .power
                    .damagePerPoint
            ) *

            powerMultiplier;


        player.defense =

            character.defense +

            armorDefense +

            resistanceBonus;


        /*
            Velocidade NÃO recebe pontos.
            Só buff temporário.
        */
        player.speed =

            character.speed *

            speedMultiplier;


        if (
            options.fillResources
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

        }

        else {

            /*
                Preserva proporção.

                Isso evita cura grátis repetida
                ao recalcular os atributos.
            */

            const hpRatio =
                clamp(
                    previous.hp /
                    previous.maxHp,
                    0,
                    1
                );


            const magicRatio =
                clamp(
                    previous.magic /
                    previous.maxMagic,
                    0,
                    1
                );


            const energyRatio =
                clamp(
                    previous.energy /
                    previous.maxEnergy,
                    0,
                    1
                );


            const hungerRatio =
                clamp(
                    previous.hunger /
                    previous.maxHunger,
                    0,
                    1
                );


            const fatigueRatio =
                clamp(
                    previous.fatigue /
                    previous.maxFatigue,
                    0,
                    1
                );


            player.hp =
                clamp(
                    player.maxHp *
                    hpRatio,
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
                    player.maxHunger *
                    hungerRatio,
                    0,
                    player.maxHunger
                );


            player.fatigue =
                clamp(
                    player.maxFatigue *
                    fatigueRatio,
                    0,
                    player.maxFatigue
                );

        }


        maintainDevInfiniteResources();

    }


    /* =========================================================
       NPCs — FALAS PRESERVADAS
       ========================================================= */

    const NPC_LIBRARY =
        Object.freeze({

            elian:
                Object.freeze({

                    id:
                        "elian",

                    name:
                        "ELIAN",

                    role:
                        "Morador da vila",

                    color:
                        "#c8aa79",

                    lines:
                        Object.freeze([

                            "A Quietude parece estar chegando mais perto. Ontem eu esqueci o nome da rua onde cresci.",

                            "Meu pai dizia que a primeira coisa que some não é um lugar. É a lembrança de que ele existia.",

                            "A estrada leste está estranha. Um Guardião apareceu por lá e não deixa ninguém passar.",

                            "Se você descobrir alguma coisa fora da vila, volte. Precisamos de histórias novas para não esquecer as antigas."

                        ])

                }),


            mara:
                Object.freeze({

                    id:
                        "mara",

                    name:
                        "MARA",

                    role:
                        "Guardadora de registros",

                    color:
                        "#b49bb8",

                    lines:
                        Object.freeze([

                            "Os registros mais antigos falam da Quietude como se ela já tivesse acontecido antes.",

                            "Cada pessoa descreve a Quietude de um jeito diferente. Isso é o que mais me assusta.",

                            "Alguns livros têm páginas inteiras em branco, mas a numeração continua como se algo estivesse faltando.",

                            "Quando você encontrar algo que não consegue explicar, tente lembrar de cada detalhe antes de voltar."

                        ])

                }),


            doran:
                Object.freeze({

                    id:
                        "doran",

                    name:
                        "DORAN",

                    role:
                        "Comerciante",

                    color:
                        "#cf9e62",

                    lines:
                        Object.freeze([

                            "Compro materiais e vendo o que consigo trazer de fora.",

                            "Uma boa espada não resolve todos os problemas, mas resolve alguns deles bem rápido.",

                            "Guarde dinheiro para quando realmente precisar. As regiões além da vila não são gentis.",

                            "Se encontrar cristais ou minérios raros, eu pago bem."

                        ])

                }),


            bran:
                Object.freeze({

                    id:
                        "bran",

                    name:
                        "BRAN",

                    role:
                        "Carpinteiro",

                    color:
                        "#9d784e",

                    lines:
                        Object.freeze([

                            "Preciso reforçar algumas casas. A madeira anda apodrecendo mais rápido desde que a Quietude chegou.",

                            "As árvores daqui são estranhas. Algumas voltam a nascer longe do lugar onde caíram.",

                            "Se puder trazer dez madeiras, eu pago pelo trabalho.",

                            "Cortar madeira consome magia. Não se esgote por causa de uma árvore."

                        ])

                }),


            borin:
                Object.freeze({

                    id:
                        "borin",

                    name:
                        "BORIN",

                    role:
                        "Ferreiro",

                    color:
                        "#b46f4d",

                    lines:
                        Object.freeze([

                            "O fogo da forja ainda lembra como queimar. Por enquanto.",

                            "Carvão bom está ficando difícil de encontrar.",

                            "Se trouxer oito carvões, posso compensar seu esforço.",

                            "Equipamento é investimento. Sobreviver costuma sair mais barato que morrer."

                        ])

                }),


            nara:
                Object.freeze({

                    id:
                        "nara",

                    name:
                        "NARA",

                    role:
                        "Viajante da floresta",

                    color:
                        "#73945d",

                    lines:
                        Object.freeze([

                            "A floresta percebe quem passa por ela.",

                            "Há árvores que se movem quando ninguém está olhando.",

                            "A Quietude não mata todas as coisas. Algumas continuam andando sem lembrar por quê.",

                            "O caminho adiante só se abre para quem prova que consegue sobreviver aqui."

                        ])

                }),


            lyra:
                Object.freeze({

                    id:
                        "lyra",

                    name:
                        "LYRA",

                    role:
                        "Guardadora do bosque",

                    color:
                        "#a88ab5",

                    lines:
                        Object.freeze([

                            "Este bosque guarda memórias nas raízes.",

                            "Quando uma árvore cai, às vezes outra nasce carregando lembranças que não são dela.",

                            "As montanhas ficam além deste lugar.",

                            "Não confunda silêncio com paz."

                        ])

                }),


            kael:
                Object.freeze({

                    id:
                        "kael",

                    name:
                        "KAEL",

                    role:
                        "Explorador das montanhas",

                    color:
                        "#9da9aa",

                    lines:
                        Object.freeze([

                            "O vento daqui apaga pegadas em minutos.",

                            "Há uma passagem antiga na montanha.",

                            "Minérios abaixo da neve ainda reagem à magia.",

                            "Não fique parado por muito tempo. Algumas coisas confundem viajantes com pedras."

                        ])

                }),


            miguel:
                Object.freeze({

                    id:
                        "miguel",

                    name:
                        "MIGUEL",

                    role:
                        "Um homem de poucas palavras",

                    color:
                        "#a49386",

                    beforeDashLines:
                        Object.freeze([

                            "Você ainda não está pronto.",

                            "Volte mais tarde."

                        ]),

                    afterDashLines:
                        Object.freeze([

                            "Hm.",

                            "Então você finalmente aprendeu a se mover como alguém que pretende sobreviver.",

                            "Volte mais tarde."

                        ])

                })

        });


    /* =========================================================
       REGISTRO DE ESPÉCIES INIMIGAS
       ========================================================= */

    const ENEMY_SPECIES =
        Object.freeze({

            wolf:
                Object.freeze({

                    id:
                        "wolf",

                    name:
                        "LOBO",

                    spriteType:
                        "wolf",

                    color:
                        "#756d64",

                    hp:
                        92,

                    damage:
                        15,

                    defense:
                        2,

                    speed:
                        112,

                    vision:
                        315,

                    attackRange:
                        43,

                    radius:
                        20,

                    xp:
                        28,

                    money:
                        5,

                    drop:
                        "couro",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "wolfCharge",

                            type:
                                "charge",

                            cooldown:
                                2,

                            telegraph:
                                0.52,

                            speed:
                                390,

                            duration:
                                0.42,

                            damageMultiplier:
                                1.15

                        })

                }),


            boar:
                Object.freeze({

                    id:
                        "boar",

                    name:
                        "JAVALI",

                    spriteType:
                        "boar",

                    color:
                        "#725748",

                    hp:
                        135,

                    damage:
                        19,

                    defense:
                        5,

                    speed:
                        88,

                    vision:
                        300,

                    attackRange:
                        48,

                    radius:
                        23,

                    xp:
                        35,

                    money:
                        7,

                    drop:
                        "carneAssada",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "boarHeavyCharge",

                            type:
                                "charge",

                            cooldown:
                                3,

                            telegraph:
                                0.7,

                            speed:
                                335,

                            duration:
                                0.52,

                            damageMultiplier:
                                1.38

                        })

                }),


            thornling:
                Object.freeze({

                    id:
                        "thornling",

                    name:
                        "ESPINHEIRO VIVO",

                    spriteType:
                        "thornling",

                    color:
                        "#58774d",

                    hp:
                        145,

                    damage:
                        21,

                    defense:
                        5,

                    speed:
                        70,

                    vision:
                        360,

                    attackRange:
                        205,

                    radius:
                        22,

                    xp:
                        42,

                    money:
                        9,

                    drop:
                        "essencia",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "rootShot",

                            type:
                                "rootProjectile",

                            cooldown:
                                2.7

                        })

                }),


            stoneCrawler:
                Object.freeze({

                    id:
                        "stoneCrawler",

                    name:
                        "RASTEJANTE DE PEDRA",

                    spriteType:
                        "stoneCrawler",

                    color:
                        "#777b78",

                    hp:
                        190,

                    damage:
                        25,

                    defense:
                        11,

                    speed:
                        68,

                    vision:
                        320,

                    attackRange:
                        64,

                    radius:
                        25,

                    xp:
                        52,

                    money:
                        11,

                    drop:
                        "ferro",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "groundSlam",

                            type:
                                "groundSlam",

                            cooldown:
                                3.2

                        })

                }),


            mineCrawler:
                Object.freeze({

                    id:
                        "mineCrawler",

                    name:
                        "RASTEJANTE DA MINA",

                    spriteType:
                        "mineCrawler",

                    color:
                        "#555a5a",

                    hp:
                        220,

                    damage:
                        28,

                    defense:
                        14,

                    speed:
                        66,

                    vision:
                        330,

                    attackRange:
                        68,

                    radius:
                        26,

                    xp:
                        58,

                    money:
                        13,

                    drop:
                        "ferro",

                    dropAmount:
                        2,

                    ability:
                        Object.freeze({

                            id:
                                "oreBurst",

                            type:
                                "oreBurst",

                            cooldown:
                                3.5

                        })

                }),


            rubyHound:
                Object.freeze({

                    id:
                        "rubyHound",

                    name:
                        "CÃO RUBI",

                    spriteType:
                        "rubyHound",

                    color:
                        "#9d4555",

                    hp:
                        235,

                    damage:
                        31,

                    defense:
                        12,

                    speed:
                        118,

                    vision:
                        380,

                    attackRange:
                        50,

                    radius:
                        23,

                    xp:
                        66,

                    money:
                        15,

                    drop:
                        "rubi",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "burningCharge",

                            type:
                                "burningCharge",

                            cooldown:
                                2.7,

                            telegraph:
                                0.48,

                            speed:
                                430,

                            duration:
                                0.46

                        })

                }),


            spider:
                Object.freeze({

                    id:
                        "spider",

                    name:
                        "ARANHA SOMBRIA",

                    spriteType:
                        "spider",

                    color:
                        "#62566a",

                    hp:
                        225,

                    damage:
                        30,

                    defense:
                        8,

                    speed:
                        102,

                    vision:
                        385,

                    attackRange:
                        175,

                    radius:
                        21,

                    xp:
                        68,

                    money:
                        16,

                    drop:
                        "essencia",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "webShot",

                            type:
                                "webSlow",

                            cooldown:
                                2.8

                        })

                }),


            scorpion:
                Object.freeze({

                    id:
                        "scorpion",

                    name:
                        "ESCORPIÃO SOMBRIO",

                    spriteType:
                        "scorpion",

                    color:
                        "#78616e",

                    hp:
                        260,

                    damage:
                        34,

                    defense:
                        13,

                    speed:
                        88,

                    vision:
                        360,

                    attackRange:
                        58,

                    radius:
                        23,

                    xp:
                        74,

                    money:
                        18,

                    drop:
                        "fragmento",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "poisonSting",

                            type:
                                "poison",

                            cooldown:
                                3.1

                        })

                }),


            bat:
                Object.freeze({

                    id:
                        "bat",

                    name:
                        "MORCEGO DA QUIETUDE",

                    spriteType:
                        "bat",

                    color:
                        "#5c5267",

                    hp:
                        175,

                    damage:
                        27,

                    defense:
                        5,

                    speed:
                        145,

                    vision:
                        410,

                    attackRange:
                        135,

                    radius:
                        18,

                    xp:
                        59,

                    money:
                        14,

                    drop:
                        "essencia",

                    dropAmount:
                        1,

                    ability:
                        Object.freeze({

                            id:
                                "batDive",

                            type:
                                "dive",

                            cooldown:
                                2.5

                        })

                })

        });


    /* =========================================================
       BOSSES
       ========================================================= */

    const BOSS_REGISTRY =
        Object.freeze({

            road_guardian:
                Object.freeze({

                    id:
                        "road_guardian",

                    name:
                        "GUARDIÃO DA ESTRADA",

                    icon:
                        "🗿",

                    bodyStyle:
                        "roadSentinel",

                    color:
                        "#7c756b",

                    aura:
                        "#c0a06a",

                    topBar:
                        true

                }),


            forest_warden:
                Object.freeze({

                    id:
                        "forest_warden",

                    name:
                        "GUARDIÃO DA FLORESTA",

                    icon:
                        "🌲",

                    bodyStyle:
                        "forestBeast",

                    color:
                        "#536c45",

                    aura:
                        "#8eb66b",

                    topBar:
                        true

                }),


            grove_heart:
                Object.freeze({

                    id:
                        "grove_heart",

                    name:
                        "CORAÇÃO DO BOSQUE",

                    icon:
                        "🌿",

                    bodyStyle:
                        "groveHeart",

                    color:
                        "#5c744d",

                    aura:
                        "#c5a9d1",

                    topBar:
                        true

                }),


            mountain_titan:
                Object.freeze({

                    id:
                        "mountain_titan",

                    name:
                        "TITÃ DA MONTANHA",

                    icon:
                        "🏔️",

                    bodyStyle:
                        "mountainTitan",

                    color:
                        "#777e7b",

                    aura:
                        "#d0d8d5",

                    topBar:
                        true

                }),


            iron_colossus:
                Object.freeze({

                    id:
                        "iron_colossus",

                    name:
                        "COLOSSO DE FERRO",

                    icon:
                        "⚙️",

                    bodyStyle:
                        "ironColossus",

                    color:
                        "#55595b",

                    aura:
                        "#9b9d9e",

                    topBar:
                        true

                }),


            ruby_chimera:
                Object.freeze({

                    id:
                        "ruby_chimera",

                    name:
                        "QUIMERA RUBI",

                    icon:
                        "♦️",

                    bodyStyle:
                        "rubyChimera",

                    color:
                        "#944858",

                    aura:
                        "#e06779",

                    topBar:
                        true

                }),


            monarch:
                Object.freeze({

                    id:
                        "monarch",

                    name:
                        "O MONARCA",

                    icon:
                        "♛",

                    bodyStyle:
                        "monarch",

                    color:
                        "#58465f",

                    aura:
                        "#a883c0",

                    topBar:
                        true

                }),


            shadow_lord:
                Object.freeze({

                    id:
                        "shadow_lord",

                    name:
                        "SENHOR DA SOMBRA",

                    icon:
                        "☾",

                    bodyStyle:
                        "shadowLord",

                    color:
                        "#34313c",

                    aura:
                        "#756b89",

                    topBar:
                        true

                }),


            fairy_guardian:
                Object.freeze({

                    id:
                        "fairy_guardian",

                    name:
                        "GUARDIÃ FEÉRICA",

                    icon:
                        "✧",

                    bodyStyle:
                        "fairyGuardian",

                    color:
                        "#aa6c9a",

                    aura:
                        "#f0b1df",

                    topBar:
                        true

                }),


            path_guardian:
                Object.freeze({

                    id:
                        "path_guardian",

                    name:
                        "GUARDIÃO DO CAMINHO",

                    icon:
                        "☀",

                    bodyStyle:
                        "pathGuardian",

                    color:
                        "#b7aa74",

                    aura:
                        "#eee1a4",

                    topBar:
                        true

                }),


            hell_guardian:
                Object.freeze({

                    id:
                        "hell_guardian",

                    name:
                        "GUARDIÃO DO INFERNO",

                    icon:
                        "🔥",

                    bodyStyle:
                        "hellGuardian",

                    color:
                        "#71392f",

                    aura:
                        "#e15d3c",

                    topBar:
                        true

                }),


            other_self:
                Object.freeze({

                    id:
                        "other_self",

                    name:
                        "O OUTRO EU",

                    icon:
                        "◈",

                    bodyStyle:
                        "mirrorSelf",

                    color:
                        "#5d5268",

                    aura:
                        "#c1a5d7",

                    topBar:
                        true

                }),


            ancient_deer:
                Object.freeze({

                    id:
                        "ancient_deer",

                    name:
                        "CERVO ANCESTRAL",

                    icon:
                        "🦌",

                    bodyStyle:
                        "ancientDeer",

                    color:
                        "#81745a",

                    aura:
                        "#c5b987",

                    /*
                        É boss de recurso.
                        Não usa barra grande.
                    */
                    topBar:
                        false

                })

        });


    function getBossDefinition(
        id
    ) {

        return (
            BOSS_REGISTRY[id] ||
            null
        );

    }


    function shouldBossUseTopBar(
        enemy
    ) {

        const definition =
            getBossDefinition(
                enemy?.id
            );


        return Boolean(
            definition
                ?.topBar
        );

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


    function discoverBoss(
        enemy
    ) {

        if (
            !state.player ||
            !enemy
        ) {

            return;

        }


        if (
            !state.player
                .discoveredBosses
                .includes(
                    enemy.id
                )
        ) {

            state.player
                .discoveredBosses
                .push(
                    enemy.id
                );

        }

    }


    /* =========================================================
       DEV / COMANDOS PRIVADOS
       ========================================================= */

    const DEV_STORAGE_KEY =
        "veyra_dev_v25";

    const DEV_SESSION_KEY =
        "veyra_dev_session_v25";


    function createDevRuntime() {

        return {

            unlocked:
                false,

            panelOpen:
                false,

            keys:
                new Set(),

            infiniteLife:
                false,

            infinitePower:
                false,

            infiniteMagic:
                false,

            infiniteEnergy:
                false,

            infiniteHunger:
                false,

            infiniteFatigue:
                false,

            infiniteMoney:
                false,

            infiniteMaterials:
                false,

            rememberAccess:
                true,

            privacy:
                true,

            passwordConfigured:
                false,

            passwordHash:
                null

        };

    }


    state.dev =
        createDevRuntime();


    function fnv1aHash(
        text
    ) {

        let hash =
            2166136261;


        const string =
            String(
                text
            );


        for (
            let index = 0;
            index < string.length;
            index++
        ) {

            hash ^=
                string.charCodeAt(
                    index
                );


            hash =
                Math.imul(
                    hash,
                    16777619
                );

        }


        return (
            hash >>>
            0
        )
            .toString(
                16
            )
            .padStart(
                8,
                "0"
            );

    }


    async function hashDevPassword(
        password,
        preferredAlgorithm =
            null
    ) {

        const value =
            String(
                password
            );


        const canUseSHA =

            window.crypto &&
            window.crypto.subtle &&
            typeof TextEncoder !==
            "undefined";


        if (
            preferredAlgorithm !==
                "fnv" &&
            canUseSHA
        ) {

            try {

                const bytes =
                    new TextEncoder()
                        .encode(
                            value
                        );


                const digest =
                    await window.crypto
                        .subtle
                        .digest(
                            "SHA-256",
                            bytes
                        );


                const hash =
                    Array.from(
                        new Uint8Array(
                            digest
                        )
                    )
                        .map(
                            byte =>
                                byte
                                    .toString(
                                        16
                                    )
                                    .padStart(
                                        2,
                                        "0"
                                    )
                        )
                        .join(
                            ""
                        );


                return (
                    `sha256:${hash}`
                );

            }

            catch (
                error
            ) {

                console.warn(
                    "VEYRA: SHA-256 indisponível. Usando fallback local.",
                    error
                );

            }

        }


        return (
            `fnv:${fnv1aHash(value)}`
        );

    }


    async function verifyDevPassword(
        password
    ) {

        const stored =
            state.dev
                .passwordHash;


        if (!stored) {

            return false;

        }


        const algorithm =

            stored.startsWith(
                "sha256:"
            )

                ? "sha256"

                : "fnv";


        const generated =
            await hashDevPassword(
                password,
                algorithm
            );


        return (
            generated ===
            stored
        );

    }


    function saveDevPreferences() {

        try {

            localStorage.setItem(

                DEV_STORAGE_KEY,

                JSON.stringify({

                    passwordHash:
                        state.dev
                            .passwordHash,

                    passwordConfigured:
                        state.dev
                            .passwordConfigured,

                    rememberAccess:
                        state.dev
                            .rememberAccess,

                    privacy:
                        state.dev
                            .privacy

                })

            );

        }

        catch (
            error
        ) {

            console.warn(
                "VEYRA: não foi possível salvar preferências de comandos.",
                error
            );

        }

    }


    function restoreDevPreferences() {

        try {

            const raw =
                localStorage.getItem(
                    DEV_STORAGE_KEY
                );


            if (raw) {

                const saved =
                    JSON.parse(
                        raw
                    );


                state.dev.passwordHash =
                    typeof saved.passwordHash ===
                    "string"
                        ? saved.passwordHash
                        : null;


                state.dev.passwordConfigured =
                    Boolean(
                        saved.passwordConfigured &&
                        state.dev.passwordHash
                    );


                state.dev.rememberAccess =
                    saved.rememberAccess !==
                    false;


                state.dev.privacy =
                    saved.privacy !==
                    false;

            }


            const remembered =
                localStorage.getItem(
                    `${DEV_SESSION_KEY}_remembered`
                );


            const session =
                sessionStorage.getItem(
                    DEV_SESSION_KEY
                );


            if (
                (
                    state.dev
                        .rememberAccess &&
                    remembered ===
                        "1"
                ) ||
                session ===
                    "1"
            ) {

                state.dev.unlocked =
                    true;

            }

        }

        catch (
            error
        ) {

            console.warn(
                "VEYRA: preferências DEV inválidas.",
                error
            );

        }

    }


    restoreDevPreferences();


    function setDevUnlocked(
        unlocked
    ) {

        state.dev.unlocked =
            Boolean(
                unlocked
            );


        try {

            if (
                !unlocked
            ) {

                localStorage.removeItem(
                    `${DEV_SESSION_KEY}_remembered`
                );


                sessionStorage.removeItem(
                    DEV_SESSION_KEY
                );


                return;

            }


            if (
                state.dev
                    .rememberAccess
            ) {

                localStorage.setItem(
                    `${DEV_SESSION_KEY}_remembered`,
                    "1"
                );

            }

            else {

                sessionStorage.setItem(
                    DEV_SESSION_KEY,
                    "1"
                );

            }

        }

        catch (
            error
        ) {

            console.warn(
                "VEYRA: acesso DEV não pôde ser lembrado.",
                error
            );

        }

    }


    function clearAllDevCheats() {

        state.dev.infiniteLife =
            false;

        state.dev.infinitePower =
            false;

        state.dev.infiniteMagic =
            false;

        state.dev.infiniteEnergy =
            false;

        state.dev.infiniteHunger =
            false;

        state.dev.infiniteFatigue =
            false;

        state.dev.infiniteMoney =
            false;

        state.dev.infiniteMaterials =
            false;

    }


    function enableAllDevCheats() {

        state.dev.infiniteLife =
            true;

        state.dev.infinitePower =
            true;

        state.dev.infiniteMagic =
            true;

        state.dev.infiniteEnergy =
            true;

        state.dev.infiniteHunger =
            true;

        state.dev.infiniteFatigue =
            true;

        state.dev.infiniteMoney =
            true;

        state.dev.infiniteMaterials =
            true;

    }


    function devShouldIgnorePlayerDamage() {

        return Boolean(

            state.dev
                ?.unlocked &&
            state.dev
                .infiniteLife

        );

    }


    function devModifyOutgoingDamage(
        damage
    ) {

        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infinitePower
        ) {

            return Math.max(
                99999,
                damage
            );

        }


        return damage;

    }


    function maintainDevInfiniteResources() {

        const player =
            state.player;


        if (
            !player ||
            !state.dev
                ?.unlocked
        ) {

            return;

        }


        if (
            state.dev
                .infiniteLife
        ) {

            player.dead =
                false;


            player.hp =
                player.maxHp;

        }


        if (
            state.dev
                .infiniteMagic
        ) {

            player.magic =
                player.maxMagic;

        }


        if (
            state.dev
                .infiniteEnergy
        ) {

            player.energy =
                player.maxEnergy;

        }


        if (
            state.dev
                .infiniteHunger
        ) {

            player.hunger =
                player.maxHunger;

        }


        if (
            state.dev
                .infiniteFatigue
        ) {

            player.fatigue =
                player.maxFatigue;

        }

    }


    function clearDevHeldKeys() {

        if (
            state.dev
                ?.keys
        ) {

            state.dev.keys.clear();

        }

    }


    function devShortcutLabel(
        number
    ) {

        const labels = {

            "1":
                "VIDA INFINITA",

            "2":
                "DANO EXTREMO",

            "3":
                "MAGIA INFINITA",

            "4":
                "ENERGIA INFINITA",

            "5":
                "FOME INFINITA",

            "6":
                "CANSAÇO INFINITO",

            "7":
                "DINHEIRO INFINITO",

            "8":
                "MATERIAIS INFINITOS",

            "9":
                "TODOS OS TESTES",

            "0":
                "DESATIVAR TUDO"

        };


        return (
            labels[number] ||
            "COMANDO"
        );

    }


    function applyDevShortcut(
        number
    ) {

        if (
            !state.dev
                .unlocked
        ) {

            return false;

        }


        let enabled =
            false;


        switch (
            number
        ) {

            case "1":

                state.dev.infiniteLife =
                    !state.dev
                        .infiniteLife;


                enabled =
                    state.dev
                        .infiniteLife;

                break;


            case "2":

                state.dev.infinitePower =
                    !state.dev
                        .infinitePower;


                enabled =
                    state.dev
                        .infinitePower;

                break;


            case "3":

                state.dev.infiniteMagic =
                    !state.dev
                        .infiniteMagic;


                enabled =
                    state.dev
                        .infiniteMagic;

                break;


            case "4":

                state.dev.infiniteEnergy =
                    !state.dev
                        .infiniteEnergy;


                enabled =
                    state.dev
                        .infiniteEnergy;

                break;


            case "5":

                state.dev.infiniteHunger =
                    !state.dev
                        .infiniteHunger;


                enabled =
                    state.dev
                        .infiniteHunger;

                break;


            case "6":

                state.dev.infiniteFatigue =
                    !state.dev
                        .infiniteFatigue;


                enabled =
                    state.dev
                        .infiniteFatigue;

                break;


            case "7":

                state.dev.infiniteMoney =
                    !state.dev
                        .infiniteMoney;


                enabled =
                    state.dev
                        .infiniteMoney;

                break;


            case "8":

                state.dev.infiniteMaterials =
                    !state.dev
                        .infiniteMaterials;


                enabled =
                    state.dev
                        .infiniteMaterials;

                break;


            case "9":

                enableAllDevCheats();

                enabled =
                    true;

                break;


            case "0":

                clearAllDevCheats();

                enabled =
                    false;

                break;


            default:

                return false;

        }


        maintainDevInfiniteResources();


        if (
            !state.dev
                .privacy &&
            typeof showToast ===
                "function"
        ) {

            showToast(

                number ===
                "0"

                    ? "Comandos de teste desativados."

                    : number ===
                        "9"

                        ? "Todos os comandos de teste foram ativados."

                        : `${devShortcutLabel(number)}: ${enabled ? "ATIVADO" : "DESATIVADO"}`

            );

        }


        return true;

    }


    function getDevPanelElement() {

        return (

            document.getElementById(
                "devCommandPanel"
            ) ||

            document.getElementById(
                "commandPanel"
            )

        );

    }


    function closeDevCommandPanel() {

        const panel =
            getDevPanelElement();


        state.dev.panelOpen =
            false;


        if (panel) {

            panel.classList.add(
                "hidden"
            );

        }

    }


    function openDevCommandPanel() {

        const panel =
            getDevPanelElement();


        if (!panel) {

            return false;

        }


        state.dev.panelOpen =
            true;


        panel.classList.remove(
            "hidden"
        );


        renderDevCommandPanel();


        window.setTimeout(
            () => {

                panel
                    .querySelector(
                        "input[type='password']"
                    )
                    ?.focus();

            },
            0
        );


        return true;

    }


    function toggleDevCommandPanel() {

        if (
            state.dev
                .panelOpen
        ) {

            closeDevCommandPanel();

            return;

        }


        openDevCommandPanel();

    }


    function renderDevCommandPanel() {

        const panel =
            getDevPanelElement();


        if (!panel) {

            return;

        }


        const privacyChecked =
            state.dev
                .privacy
                    ? "checked"
                    : "";


        const rememberChecked =
            state.dev
                .rememberAccess
                    ? "checked"
                    : "";


        if (
            !state.dev
                .passwordConfigured
        ) {

            panel.innerHTML = `
                <h2>COMANDOS:</h2>

                <p>
                    Crie sua senha privada para liberar
                    os atalhos de teste.
                </p>

                <input
                    id="devPasswordInput"
                    type="password"
                    autocomplete="new-password"
                    placeholder="Criar senha"
                >

                <label>
                    <input
                        id="devRememberAccess"
                        type="checkbox"
                        ${rememberChecked}
                    >
                    Lembrar acesso
                </label>

                <label>
                    <input
                        id="devPrivacyMode"
                        type="checkbox"
                        ${privacyChecked}
                    >
                    Privacidade
                </label>

                <div>
                    <button
                        id="devCreatePasswordBtn"
                        type="button"
                    >
                        CRIAR SENHA
                    </button>

                    <button
                        id="devCloseBtn"
                        type="button"
                    >
                        FECHAR
                    </button>
                </div>
            `;


            const passwordInput =
                panel.querySelector(
                    "#devPasswordInput"
                );


            const createButton =
                panel.querySelector(
                    "#devCreatePasswordBtn"
                );


            const remember =
                panel.querySelector(
                    "#devRememberAccess"
                );


            const privacy =
                panel.querySelector(
                    "#devPrivacyMode"
                );


            remember?.addEventListener(
                "change",
                () => {

                    state.dev.rememberAccess =
                        remember.checked;


                    saveDevPreferences();

                }
            );


            privacy?.addEventListener(
                "change",
                () => {

                    state.dev.privacy =
                        privacy.checked;


                    saveDevPreferences();

                }
            );


            createButton?.addEventListener(
                "click",
                async () => {

                    const password =
                        passwordInput
                            ?.value ||
                        "";


                    if (
                        password.length <
                        4
                    ) {

                        if (
                            typeof showToast ===
                            "function"
                        ) {

                            showToast(
                                "Use uma senha com pelo menos 4 caracteres."
                            );

                        }


                        return;

                    }


                    state.dev.passwordHash =
                        await hashDevPassword(
                            password
                        );


                    state.dev.passwordConfigured =
                        true;


                    state.dev.rememberAccess =
                        Boolean(
                            remember
                                ?.checked
                        );


                    state.dev.privacy =
                        Boolean(
                            privacy
                                ?.checked
                        );


                    saveDevPreferences();


                    setDevUnlocked(
                        true
                    );


                    if (
                        state.dev
                            .privacy
                    ) {

                        closeDevCommandPanel();

                    }

                    else {

                        renderDevCommandPanel();

                    }

                }
            );


            panel
                .querySelector(
                    "#devCloseBtn"
                )
                ?.addEventListener(
                    "click",
                    closeDevCommandPanel
                );


            return;

        }


        if (
            !state.dev
                .unlocked
        ) {

            panel.innerHTML = `
                <h2>COMANDOS:</h2>

                <p>
                    Digite sua senha.
                </p>

                <input
                    id="devPasswordInput"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Senha"
                >

                <label>
                    <input
                        id="devRememberAccess"
                        type="checkbox"
                        ${rememberChecked}
                    >
                    Lembrar acesso
                </label>

                <label>
                    <input
                        id="devPrivacyMode"
                        type="checkbox"
                        ${privacyChecked}
                    >
                    Privacidade
                </label>

                <div>
                    <button
                        id="devUnlockBtn"
                        type="button"
                    >
                        ENTRAR
                    </button>

                    <button
                        id="devForgetBtn"
                        type="button"
                    >
                        ESQUECER ACESSO
                    </button>

                    <button
                        id="devCloseBtn"
                        type="button"
                    >
                        FECHAR
                    </button>
                </div>
            `;


            const input =
                panel.querySelector(
                    "#devPasswordInput"
                );


            const remember =
                panel.querySelector(
                    "#devRememberAccess"
                );


            const privacy =
                panel.querySelector(
                    "#devPrivacyMode"
                );


            remember?.addEventListener(
                "change",
                () => {

                    state.dev.rememberAccess =
                        remember.checked;


                    saveDevPreferences();

                }
            );


            privacy?.addEventListener(
                "change",
                () => {

                    state.dev.privacy =
                        privacy.checked;


                    saveDevPreferences();

                }
            );


            panel
                .querySelector(
                    "#devUnlockBtn"
                )
                ?.addEventListener(
                    "click",
                    async () => {

                        const valid =
                            await verifyDevPassword(
                                input?.value ||
                                ""
                            );


                        if (!valid) {

                            if (
                                typeof showToast ===
                                "function"
                            ) {

                                showToast(
                                    "Senha incorreta."
                                );

                            }


                            return;

                        }


                        state.dev.rememberAccess =
                            Boolean(
                                remember
                                    ?.checked
                            );


                        state.dev.privacy =
                            Boolean(
                                privacy
                                    ?.checked
                            );


                        saveDevPreferences();


                        setDevUnlocked(
                            true
                        );


                        if (
                            state.dev
                                .privacy
                        ) {

                            closeDevCommandPanel();

                        }

                        else {

                            renderDevCommandPanel();

                        }

                    }
                );


            panel
                .querySelector(
                    "#devForgetBtn"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        clearAllDevCheats();


                        state.dev.passwordConfigured =
                            false;


                        state.dev.passwordHash =
                            null;


                        setDevUnlocked(
                            false
                        );


                        saveDevPreferences();


                        renderDevCommandPanel();

                    }
                );


            panel
                .querySelector(
                    "#devCloseBtn"
                )
                ?.addEventListener(
                    "click",
                    closeDevCommandPanel
                );


            return;

        }


        panel.innerHTML = `
            <h2>COMANDOS:</h2>

            <div id="devUnlockedArea">

                <p>
                    X + 1 — Vida infinita
                </p>

                <p>
                    X + 2 — Dano extremo
                </p>

                <p>
                    X + 3 — Magia infinita
                </p>

                <p>
                    X + 4 — Energia infinita
                </p>

                <p>
                    X + 5 — Fome infinita
                </p>

                <p>
                    X + 6 — Cansaço infinito
                </p>

                <p>
                    X + 7 — Dinheiro infinito
                </p>

                <p>
                    X + 8 — Materiais infinitos
                </p>

                <p>
                    X + 9 — Ativar tudo
                </p>

                <p>
                    X + 0 — Desativar tudo
                </p>

            </div>

            <label>
                <input
                    id="devRememberAccess"
                    type="checkbox"
                    ${rememberChecked}
                >
                Lembrar acesso
            </label>

            <label>
                <input
                    id="devPrivacyMode"
                    type="checkbox"
                    ${privacyChecked}
                >
                Privacidade
            </label>

            <div>
                <button
                    id="devLockBtn"
                    type="button"
                >
                    BLOQUEAR
                </button>

                <button
                    id="devForgetBtn"
                    type="button"
                >
                    ESQUECER ACESSO
                </button>

                <button
                    id="devCloseBtn"
                    type="button"
                >
                    FECHAR
                </button>
            </div>
        `;


        const remember =
            panel.querySelector(
                "#devRememberAccess"
            );


        const privacy =
            panel.querySelector(
                "#devPrivacyMode"
            );


        remember?.addEventListener(
            "change",
            () => {

                state.dev.rememberAccess =
                    remember.checked;


                saveDevPreferences();

            }
        );


        privacy?.addEventListener(
            "change",
            () => {

                state.dev.privacy =
                    privacy.checked;


                saveDevPreferences();


                if (
                    state.dev
                        .privacy
                ) {

                    closeDevCommandPanel();

                }

            }
        );


        panel
            .querySelector(
                "#devLockBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    setDevUnlocked(
                        false
                    );


                    renderDevCommandPanel();

                }
            );


        panel
            .querySelector(
                "#devForgetBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    clearAllDevCheats();


                    state.dev.passwordConfigured =
                        false;


                    state.dev.passwordHash =
                        null;


                    setDevUnlocked(
                        false
                    );


                    saveDevPreferences();


                    renderDevCommandPanel();

                }
            );


        panel
            .querySelector(
                "#devCloseBtn"
            )
            ?.addEventListener(
                "click",
                closeDevCommandPanel
            );

    }


    function createDevCommandPanel() {

        let panel =
            getDevPanelElement();


        if (!panel) {

            panel =
                document.createElement(
                    "div"
                );


            panel.id =
                "devCommandPanel";


            panel.className =
                "dev-command-panel command-panel hidden";


            document.body.appendChild(
                panel
            );

        }


        renderDevCommandPanel();


        return panel;

    }


    function handleDevShortcutKeyDown(
        event
    ) {

        if (
            !state.dev
        ) {

            return false;

        }


        const code =
            event.code;


        state.dev.keys.add(
            code
        );


        /*
            X + Y abre os comandos.
        */
        const xPressed =
            state.dev.keys.has(
                "KeyX"
            );


        if (
            xPressed &&
            code ===
                "KeyY"
        ) {

            event.preventDefault();

            toggleDevCommandPanel();

            return true;

        }


        if (
            !xPressed
        ) {

            return false;

        }


        const digitMatch =
            /^Digit([0-9])$/
                .exec(
                    code
                );


        if (!digitMatch) {

            return false;

        }


        if (
            !state.dev
                .unlocked
        ) {

            return false;

        }


        event.preventDefault();


        applyDevShortcut(
            digitMatch[1]
        );


        return true;

    }


    function handleDevShortcutKeyUp(
        event
    ) {

        state.dev
            ?.keys
            ?.delete(
                event.code
            );

    }


    /* =========================================================
       REGIÕES
       ========================================================= */

    const REGIONS =
        Object.freeze({

            village:
                Object.freeze({

                    id:
                        "village",

                    name:
                        "VILA DO CREPÚSCULO",

                    width:
                        3200,

                    height:
                        2200,

                    entry:
                        Object.freeze({

                            x:
                                595,

                            y:
                                1905

                        })

                }),


            forest:
                Object.freeze({

                    id:
                        "forest",

                    name:
                        "FLORESTA",

                    width:
                        3400,

                    height:
                        2300,

                    entry:
                        Object.freeze({

                            x:
                                225,

                            y:
                                1150

                        })

                }),


            grove:
                Object.freeze({

                    id:
                        "grove",

                    name:
                        "BOSQUE",

                    width:
                        3500,

                    height:
                        2350,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1175

                        })

                }),


            mountains:
                Object.freeze({

                    id:
                        "mountains",

                    name:
                        "MONTANHAS",

                    width:
                        3500,

                    height:
                        2350,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1175

                        })

                }),


            iron:
                Object.freeze({

                    id:
                        "iron",

                    name:
                        "MINAS DE FERRO",

                    width:
                        3400,

                    height:
                        2250,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1125

                        })

                }),


            ruby:
                Object.freeze({

                    id:
                        "ruby",

                    name:
                        "REGIÃO RUBI",

                    width:
                        3500,

                    height:
                        2300,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1150

                        })

                }),


            monarchMaze:
                Object.freeze({

                    id:
                        "monarchMaze",

                    name:
                        "LABIRINTO DO MONARCA",

                    width:
                        3600,

                    height:
                        2300,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1140

                        })

                }),


            shadow:
                Object.freeze({

                    id:
                        "shadow",

                    name:
                        "CAVERNA SOMBRIA",

                    width:
                        3300,

                    height:
                        2200,

                    entry:
                        Object.freeze({

                            x:
                                245,

                            y:
                                1080

                        })

                }),


            fairy:
                Object.freeze({

                    id:
                        "fairy",

                    name:
                        "VALE FEÉRICO",

                    width:
                        3400,

                    height:
                        2250,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1120

                        })

                }),


            sky:
                Object.freeze({

                    id:
                        "sky",

                    name:
                        "CAMINHO CELESTE",

                    width:
                        3400,

                    height:
                        2250,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                1120

                        })

                }),


            hell:
                Object.freeze({

                    id:
                        "hell",

                    name:
                        "INFERNO",

                    width:
                        3700,

                    height:
                        2450,

                    entry:
                        Object.freeze({

                            x:
                                225,

                            y:
                                1225

                        })

                }),


            final:
                Object.freeze({

                    id:
                        "final",

                    name:
                        "MEMÓRIA FINAL",

                    width:
                        2200,

                    height:
                        1550,

                    entry:
                        Object.freeze({

                            x:
                                220,

                            y:
                                775

                        })

                })

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
                "sky",

            final:
                "hell"

        });


    const BIOME_STYLE =
        Object.freeze({

            village:
                Object.freeze({

                    ground:
                        "#425744",

                    groundAlt:
                        "#516951",

                    ambient:
                        "#d6a96c",

                    ambientAlpha:
                        0.035

                }),


            forest:
                Object.freeze({

                    ground:
                        "#314832",

                    groundAlt:
                        "#3b583b",

                    ambient:
                        "#37694a",

                    ambientAlpha:
                        0.055

                }),


            grove:
                Object.freeze({

                    ground:
                        "#354936",

                    groundAlt:
                        "#465947",

                    ambient:
                        "#765e7f",

                    ambientAlpha:
                        0.04

                }),


            mountains:
                Object.freeze({

                    ground:
                        "#8b908d",

                    groundAlt:
                        "#a1a6a4",

                    ambient:
                        "#dbe6e7",

                    ambientAlpha:
                        0.075

                }),


            iron:
                Object.freeze({

                    ground:
                        "#4b4d4b",

                    groundAlt:
                        "#5d5e59",

                    ambient:
                        "#2a2b2c",

                    ambientAlpha:
                        0.11

                }),


            ruby:
                Object.freeze({

                    ground:
                        "#492f34",

                    groundAlt:
                        "#623942",

                    ambient:
                        "#aa3f52",

                    ambientAlpha:
                        0.07

                }),


            monarchMaze:
                Object.freeze({

                    ground:
                        "#211e25",

                    groundAlt:
                        "#2a252e",

                    ambient:
                        "#131117",

                    ambientAlpha:
                        0.35

                }),


            shadow:
                Object.freeze({

                    ground:
                        "#29272f",

                    groundAlt:
                        "#34313b",

                    ambient:
                        "#17151d",

                    ambientAlpha:
                        0.28

                }),


            fairy:
                Object.freeze({

                    ground:
                        "#4d5d4f",

                    groundAlt:
                        "#617264",

                    ambient:
                        "#b56ca7",

                    ambientAlpha:
                        0.06

                }),


            sky:
                Object.freeze({

                    ground:
                        "#9faeb1",

                    groundAlt:
                        "#b5c2c3",

                    ambient:
                        "#f0dd9a",

                    ambientAlpha:
                        0.065

                }),


            hell:
                Object.freeze({

                    ground:
                        "#38231f",

                    groundAlt:
                        "#4d2922",

                    ambient:
                        "#9b321d",

                    ambientAlpha:
                        0.12

                }),


            final:
                Object.freeze({

                    ground:
                        "#39333e",

                    groundAlt:
                        "#4d4452",

                    ambient:
                        "#a285b0",

                    ambientAlpha:
                        0.08

                })

        });


    function getRegionDefinition(
        id =
            state.area
    ) {

        return (
            REGIONS[id] ||
            REGIONS.village
        );

    }


    function getBiomeStyle(
        id =
            state.area
    ) {

        return (
            BIOME_STYLE[id] ||
            BIOME_STYLE.village
        );

    }


    function getPathStyle(
        id =
            state.area
    ) {

        return (
            PATH_STYLE_CONFIG[id] ||
            PATH_STYLE_CONFIG
                .village
        );

    }


    function getRegionEntrySpawn(
        id =
            state.area
    ) {

        const region =
            getRegionDefinition(
                id
            );


        return {

            x:
                region.entry.x,

            y:
                region.entry.y

        };

    }


    /* =========================================================
       INTERIORES

       Mantém as dimensões antigas conhecidas.
       ========================================================= */

    const HOUSE_INTERIORS =
        Object.freeze({

            home:
                Object.freeze({

                    id:
                        "home",

                    name:
                        "CASA DO AVENTUREIRO",

                    world:
                        Object.freeze({

                            width:
                                1080,

                            height:
                                730

                        }),

                    room:
                        Object.freeze({

                            x:
                                130,

                            y:
                                100,

                            w:
                                820,

                            h:
                                515

                        }),

                    playerSpawn:
                        Object.freeze({

                            x:
                                540,

                            y:
                                515

                        }),

                    door:
                        Object.freeze({

                            x:
                                495,

                            y:
                                560,

                            w:
                                90,

                            h:
                                55

                        }),

                    theme:
                        Object.freeze({

                            wall:
                                "#5d5146",

                            floor:
                                "#715943",

                            floorAlt:
                                "#594536",

                            trim:
                                "#b49466",

                            accent:
                                "#b16d4e",

                            light:
                                "#e2b86f"

                        }),

                    furniture:
                        Object.freeze([

                            Object.freeze({

                                type:
                                    "bed",

                                x:
                                    205,

                                y:
                                    190,

                                w:
                                    145,

                                h:
                                    82

                            }),

                            Object.freeze({

                                type:
                                    "table",

                                x:
                                    590,

                                y:
                                    235,

                                w:
                                    115,

                                h:
                                    70

                            }),

                            Object.freeze({

                                type:
                                    "chair",

                                x:
                                    720,

                                y:
                                    245,

                                w:
                                    40,

                                h:
                                    42

                            }),

                            Object.freeze({

                                type:
                                    "bookshelf",

                                x:
                                    800,

                                y:
                                    155,

                                w:
                                    88,

                                h:
                                    135

                            }),

                            Object.freeze({

                                type:
                                    "rug",

                                x:
                                    420,

                                y:
                                    330,

                                w:
                                    235,

                                h:
                                    115

                            }),

                            Object.freeze({

                                type:
                                    "fireplace",

                                x:
                                    205,

                                y:
                                    385,

                                w:
                                    105,

                                h:
                                    90

                            })

                        ])

                }),


            elianHome:
                Object.freeze({

                    id:
                        "elianHome",

                    name:
                        "CASA DE ELIAN",

                    world:
                        Object.freeze({

                            width:
                                1080,

                            height:
                                720

                        }),

                    room:
                        Object.freeze({

                            x:
                                140,

                            y:
                                105,

                            w:
                                800,

                            h:
                                500

                        }),

                    playerSpawn:
                        Object.freeze({

                            x:
                                540,

                            y:
                                525

                        }),

                    door:
                        Object.freeze({

                            x:
                                500,

                            y:
                                550,

                            w:
                                80,

                            h:
                                55

                        }),

                    theme:
                        Object.freeze({

                            wall:
                                "#5b5048",

                            floor:
                                "#695440",

                            floorAlt:
                                "#514032",

                            trim:
                                "#a68a68",

                            accent:
                                "#7e936d",

                            light:
                                "#d8a965"

                        }),

                    furniture:
                        Object.freeze([

                            Object.freeze({

                                type:
                                    "bed",

                                x:
                                    210,

                                y:
                                    180,

                                w:
                                    140,

                                h:
                                    82

                            }),

                            Object.freeze({

                                type:
                                    "table",

                                x:
                                    505,

                                y:
                                    230,

                                w:
                                    125,

                                h:
                                    78

                            }),

                            Object.freeze({

                                type:
                                    "bookshelf",

                                x:
                                    790,

                                y:
                                    160,

                                w:
                                    90,

                                h:
                                    140

                            }),

                            Object.freeze({

                                type:
                                    "plant",

                                x:
                                    745,

                                y:
                                    410,

                                w:
                                    55,

                                h:
                                    55

                            })

                        ])

                }),


            shop:
                Object.freeze({

                    id:
                        "shop",

                    name:
                        "LOJA DE DORAN",

                    world:
                        Object.freeze({

                            width:
                                1100,

                            height:
                                730

                        }),

                    room:
                        Object.freeze({

                            x:
                                100,

                            y:
                                90,

                            w:
                                900,

                            h:
                                530

                        }),

                    playerSpawn:
                        Object.freeze({

                            x:
                                550,

                            y:
                                535

                        }),

                    door:
                        Object.freeze({

                            x:
                                505,

                            y:
                                565,

                            w:
                                90,

                            h:
                                55

                        }),

                    theme:
                        Object.freeze({

                            wall:
                                "#64544a",

                            floor:
                                "#75573e",

                            floorAlt:
                                "#59402f",

                            trim:
                                "#c09b67",

                            accent:
                                "#bf8050",

                            light:
                                "#e1b667"

                        }),

                    furniture:
                        Object.freeze([

                            Object.freeze({

                                type:
                                    "counter",

                                x:
                                    380,

                                y:
                                    235,

                                w:
                                    335,

                                h:
                                    70

                            }),

                            Object.freeze({

                                type:
                                    "shelf",

                                x:
                                    190,

                                y:
                                    165,

                                w:
                                    125,

                                h:
                                    145

                            }),

                            Object.freeze({

                                type:
                                    "supplyRack",

                                x:
                                    790,

                                y:
                                    160,

                                w:
                                    120,

                                h:
                                    155

                            }),

                            Object.freeze({

                                type:
                                    "crate",

                                x:
                                    200,

                                y:
                                    400,

                                w:
                                    72,

                                h:
                                    65

                            }),

                            Object.freeze({

                                type:
                                    "crate",

                                x:
                                    290,

                                y:
                                    420,

                                w:
                                    70,

                                h:
                                    65

                            })

                        ]),

                    npcAnchors:
                        Object.freeze([

                            Object.freeze({

                                id:
                                    "doran",

                                x:
                                    550,

                                y:
                                    205

                            })

                        ])

                }),


            forge:
                Object.freeze({

                    id:
                        "forge",

                    name:
                        "FORJA DE BORIN",

                    world:
                        Object.freeze({

                            width:
                                1100,

                            height:
                                740

                        }),

                    room:
                        Object.freeze({

                            x:
                                95,

                            y:
                                85,

                            w:
                                910,

                            h:
                                545

                        }),

                    playerSpawn:
                        Object.freeze({

                            x:
                                550,

                            y:
                                545

                        }),

                    door:
                        Object.freeze({

                            x:
                                505,

                            y:
                                575,

                            w:
                                90,

                            h:
                                55

                        }),

                    theme:
                        Object.freeze({

                            wall:
                                "#51443e",

                            floor:
                                "#5b4b41",

                            floorAlt:
                                "#453a34",

                            trim:
                                "#9e7760",

                            accent:
                                "#d16e43",

                            light:
                                "#ff7a3e"

                        }),

                    furniture:
                        Object.freeze([

                            Object.freeze({

                                type:
                                    "forge",

                                x:
                                    185,

                                y:
                                    165,

                                w:
                                    170,

                                h:
                                    160

                            }),

                            Object.freeze({

                                type:
                                    "anvil",

                                x:
                                    430,

                                y:
                                    260,

                                w:
                                    100,

                                h:
                                    70

                            }),

                            Object.freeze({

                                type:
                                    "workbench",

                                x:
                                    660,

                                y:
                                    180,

                                w:
                                    195,

                                h:
                                    80

                            }),

                            Object.freeze({

                                type:
                                    "coalPile",

                                x:
                                    760,

                                y:
                                    390,

                                w:
                                    110,

                                h:
                                    80

                            }),

                            Object.freeze({

                                type:
                                    "orePile",

                                x:
                                    220,

                                y:
                                    410,

                                w:
                                    115,

                                h:
                                    75

                            })

                        ]),

                    npcAnchors:
                        Object.freeze([

                            Object.freeze({

                                id:
                                    "borin",

                                x:
                                    570,

                                y:
                                    245

                            })

                        ])

                }),


            woodshop:
                Object.freeze({

                    id:
                        "woodshop",

                    name:
                        "OFICINA DE BRAN",

                    world:
                        Object.freeze({

                            width:
                                1080,

                            height:
                                720

                        }),

                    room:
                        Object.freeze({

                            x:
                                115,

                            y:
                                95,

                            w:
                                850,

                            h:
                                515

                        }),

                    playerSpawn:
                        Object.freeze({

                            x:
                                540,

                            y:
                                525

                        }),

                    door:
                        Object.freeze({

                            x:
                                495,

                            y:
                                555,

                            w:
                                90,

                            h:
                                55

                        }),

                    theme:
                        Object.freeze({

                            wall:
                                "#665343",

                            floor:
                                "#74553d",

                            floorAlt:
                                "#56402f",

                            trim:
                                "#af875e",

                            accent:
                                "#81965f",

                            light:
                                "#dda85c"

                        }),

                    furniture:
                        Object.freeze([

                            Object.freeze({

                                type:
                                    "sawTable",

                                x:
                                    230,

                                y:
                                    210,

                                w:
                                    170,

                                h:
                                    80

                            }),

                            Object.freeze({

                                type:
                                    "woodPile",

                                x:
                                    760,

                                y:
                                    180,

                                w:
                                    115,

                                h:
                                    105

                            }),

                            Object.freeze({

                                type:
                                    "workbench",

                                x:
                                    550,

                                y:
                                    350,

                                w:
                                    185,

                                h:
                                    75

                            }),

                            Object.freeze({

                                type:
                                    "woodPile",

                                x:
                                    220,

                                y:
                                    400,

                                w:
                                    130,

                                h:
                                    85

                            })

                        ]),

                    npcAnchors:
                        Object.freeze([

                            Object.freeze({

                                id:
                                    "bran",

                                x:
                                    570,

                                y:
                                    265

                            })

                        ])

                })

        });


    function getHouseSpec(
        building =
            state.currentHouse
    ) {

        const id =

            typeof building ===
            "string"

                ? building

                : building
                    ?.interiorId ||
                  building
                    ?.id;


        return (
            HOUSE_INTERIORS[id] ||
            null
        );

    }


    function getHouseWorldSize(
        building =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                building
            );


        return (

            spec
                ?.world ||

            {
                width:
                    1080,

                height:
                    720
            }

        );

    }


    function getHouseFurniture(
        building =
            state.currentHouse
    ) {

        return (
            getHouseSpec(
                building
            )?.furniture ||
            []
        );

    }


    function getInteriorDoor(
        building =
            state.currentHouse
    ) {

        return (
            getHouseSpec(
                building
            )?.door ||
            null
        );

    }


    function getHouseInteriorNPCs(
        building =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                building
            );


        if (!spec) {

            return [];

        }


        const anchors =
            spec.npcAnchors ||
            [];


        const npcs =
            [];


        for (
            const anchor of
            anchors
        ) {

            const library =
                NPC_LIBRARY[
                    anchor.id
                ];


            if (!library) {

                continue;

            }


            npcs.push({

                ...deepClone(
                    library
                ),

                x:
                    anchor.x,

                y:
                    anchor.y,

                homeX:
                    anchor.x,

                homeY:
                    anchor.y,

                movable:
                    false,

                walkPhase:
                    0,

                interior:
                    true,

                merchant:

                    anchor.id ===
                    "doran",

                blacksmith:

                    anchor.id ===
                    "borin",

                questId:

                    anchor.id ===
                    "bran"

                        ? "wood"

                        : anchor.id ===
                            "borin"

                            ? "coal"

                            : null

            });

        }


        return npcs;

    }


    function placePlayerInsideHouse(
        building =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                building
            );


        if (
            !spec ||
            !state.player
        ) {

            return false;

        }


        state.player.x =
            spec.playerSpawn.x;


        state.player.y =
            spec.playerSpawn.y;


        state.player.facing =
            "up";


        return true;

    }


    /* =========================================================
       WORLD BASE
       ========================================================= */

    function createEmptyWorld(
        areaId
    ) {

        const region =
            getRegionDefinition(
                areaId
            );


        return {

            area:
                areaId,

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

            trees:
                [],

            resources:
                [],

            buildings:
                [],

            doors:
                [],

            npcs:
                [],

            enemies:
                [],

            projectiles:
                [],

            enemyProjectiles:
                [],

            particles:
                [],

            effects:
                [],

            gates:
                [],

            portals:
                [],

            landmarks:
                [],

            darknessBarriers:
                [],

            fountain:
                null,

            altar:
                null

        };

    }


    function addProtectedZone(
        world,
        x,
        y,
        w,
        h,
        padding = 0
    ) {

        world.protectedZones.push({

            x:
                x -
                padding,

            y:
                y -
                padding,

            w:
                w +
                padding *
                2,

            h:
                h +
                padding *
                2

        });

    }


    function addPath(
        world,
        x,
        y,
        w,
        h
    ) {

        world.paths.push({

            id:
                uid(
                    "path"
                ),

            x,
            y,
            w,
            h,

            detailSeed:
                hashString(
                    `${world.area}:${x}:${y}:${w}:${h}`
                )

        });


        addProtectedZone(
            world,
            x,
            y,
            w,
            h,
            25
        );

    }


    function addObstacle(
        world,
        x,
        y,
        w,
        h,
        type =
            "rock"
    ) {

        const obstacle = {

            id:
                uid(
                    "obstacle"
                ),

            x,
            y,
            w,
            h,
            type

        };


        world.obstacles.push(
            obstacle
        );


        return obstacle;

    }


    /* =========================================================
       PORTA — MESMA GEOMETRIA VISUAL E DE INTERAÇÃO
       ========================================================= */

    function getBuildingDoorGeometry(
        building
    ) {

        const doorWidth =
            Math.max(
                72,
                Math.min(
                    96,
                    building.w *
                    0.22
                )
            );


        const doorHeight =
            74;


        const centerX =
            building.x +
            building.w /
            2;


        const x =
            centerX -
            doorWidth /
            2;


        const y =
            building.y +
            building.h -
            doorHeight;


        return {

            id:
                `${building.id}_door`,

            buildingId:
                building.id,

            x,
            y,

            w:
                doorWidth,

            h:
                doorHeight,

            centerX,

            centerY:
                y +
                doorHeight /
                2,

            approachX:
                centerX,

            approachY:
                building.y +
                building.h +
                42,

            interactionRect: {

                x:
                    x -
                    30,

                y:
                    y -
                    15,

                w:
                    doorWidth +
                    60,

                h:
                    doorHeight +
                    90

            },

            animation:
                0,

            targetAnimation:
                0,

            dustTimer:
                0

        };

    }


    function addBuilding(
        world,
        config
    ) {

        const building = {

            id:
                config.id,

            name:
                config.name,

            interiorId:
                config.interiorId ||
                config.id,

            x:
                config.x,

            y:
                config.y,

            w:
                config.w,

            h:
                config.h,

            roof:
                config.roof ||
                "#735442",

            wallColor:
                config.wallColor ||
                "#8b7963",

            trimColor:
                config.trimColor ||
                "#bba277",

            windowColor:
                config.windowColor ||
                "#e6bb6b",

            sign:
                config.sign ||
                ""

        };


        world.buildings.push(
            building
        );


        /*
            Protege o corpo inteiro da casa.
        */
        addProtectedZone(

            world,

            building.x,

            building.y,

            building.w,

            building.h,

            40

        );


        const door =
            getBuildingDoorGeometry(
                building
            );


        world.doors.push(
            door
        );


        return building;

    }


    function getBuildingDoor(
        building
    ) {

        if (
            !building ||
            !state.world
        ) {

            return null;

        }


        return (

            state.world.doors
                .find(
                    door =>
                        door.buildingId ===
                        building.id
                ) ||

            null

        );

    }


    function calculateHomeRespawn() {

        const world =
            state.world;


        if (
            world?.area ===
            "village"
        ) {

            const home =
                world.buildings
                    .find(
                        building =>
                            building.id ===
                            "home"
                    );


            if (home) {

                const door =
                    getBuildingDoorGeometry(
                        home
                    );


                return {

                    x:
                        door.approachX,

                    y:
                        door.approachY +
                        35,

                    facing:
                        "up"

                };

            }

        }


        return {

            ...PLAYER_HOME
                .fallbackRespawn

        };

    }


    /* =========================================================
       VILA
       ========================================================= */

    function buildVillageWorld(
        world
    ) {

        /*
            Estrada central horizontal.
        */
        addPath(
            world,
            180,
            990,
            2860,
            220
        );


        /*
            Eixo vertical.
        */
        addPath(
            world,
            1450,
            180,
            300,
            1860
        );


        /*
            Ligações residenciais.
        */
        addPath(
            world,
            475,
            650,
            200,
            420
        );


        addPath(
            world,
            480,
            1160,
            200,
            450
        );


        addPath(
            world,
            2380,
            650,
            210,
            420
        );


        addPath(
            world,
            2390,
            1160,
            220,
            400
        );


        addPath(
            world,
            1090,
            1190,
            210,
            440
        );


        /* =====================================================
           CASAS APROVADAS
           ===================================================== */

        addBuilding(
            world,
            {

                id:
                    "home",

                name:
                    "CASA DO AVENTUREIRO",

                interiorId:
                    "home",

                x:
                    365,

                y:
                    1510,

                w:
                    460,

                h:
                    330,

                roof:
                    "#6f493d",

                wallColor:
                    "#8b745c",

                trimColor:
                    "#b99567",

                windowColor:
                    "#efbd69",

                sign:
                    "CASA"

            }
        );


        addBuilding(
            world,
            {

                id:
                    "elianHome",

                name:
                    "CASA DE ELIAN",

                interiorId:
                    "elianHome",

                x:
                    420,

                y:
                    370,

                w:
                    435,

                h:
                    310,

                roof:
                    "#58644f",

                wallColor:
                    "#81735f",

                trimColor:
                    "#a38e6c",

                windowColor:
                    "#e0ba74",

                sign:
                    "ELIAN"

            }
        );


        addBuilding(
            world,
            {

                id:
                    "shop",

                name:
                    "LOJA DE DORAN",

                interiorId:
                    "shop",

                x:
                    2365,

                y:
                    360,

                w:
                    470,

                h:
                    325,

                roof:
                    "#7d5037",

                wallColor:
                    "#8e7459",

                trimColor:
                    "#c59b61",

                windowColor:
                    "#f0bb60",

                sign:
                    "LOJA"

            }
        );


        addBuilding(
            world,
            {

                id:
                    "forge",

                name:
                    "FORJA DE BORIN",

                interiorId:
                    "forge",

                x:
                    2395,

                y:
                    1490,

                w:
                    470,

                h:
                    335,

                roof:
                    "#5b3932",

                wallColor:
                    "#736255",

                trimColor:
                    "#9e7457",

                windowColor:
                    "#ef7247",

                sign:
                    "FORJA"

            }
        );


        addBuilding(
            world,
            {

                id:
                    "woodshop",

                name:
                    "OFICINA DE BRAN",

                interiorId:
                    "woodshop",

                x:
                    1000,

                y:
                    1585,

                w:
                    440,

                h:
                    300,

                roof:
                    "#68513d",

                wallColor:
                    "#8c7357",

                trimColor:
                    "#a98359",

                windowColor:
                    "#dca85c",

                sign:
                    "MADEIRA"

            }
        );


        /* =====================================================
           FONTE
           ===================================================== */

        world.fountain = {

            x:
                1600,

            y:
                1090,

            radius:
                90

        };


        addObstacle(
            world,
            1515,
            1005,
            170,
            170,
            "fountainBase"
        );


        world.landmarks.push({

            id:
                "village_fountain",

            type:
                "fountain",

            x:
                1600,

            y:
                1090,

            radius:
                90,

            important:
                true,

            label:
                "Fonte"

        });


        /* =====================================================
           NPCs EXTERNOS
           ===================================================== */

        world.npcs.push(

            createWorldNPC(
                "elian",
                950,
                900
            ),

            createWorldNPC(
                "mara",
                1840,
                1360
            ),

            createWorldNPC(
                "miguel",
                2770,
                790
            )

        );


        /* =====================================================
           PORTÕES
           ===================================================== */

        world.gates.push({

            id:
                "north_gate",

            name:
                "PORTÃO NORTE",

            x:
                1460,

            y:
                80,

            w:
                280,

            h:
                100,

            orientation:
                "horizontal",

            opened:
                Boolean(
                    state.player
                        ?.gateUnlocks
                        ?.north
                ),

            locked:
                !Boolean(
                    state.player
                        ?.gateUnlocks
                        ?.north
                ),

            animation:
                state.player
                    ?.gateUnlocks
                    ?.north
                        ? 1
                        : 0,

            targetAnimation:
                state.player
                    ?.gateUnlocks
                    ?.north
                        ? 1
                        : 0,

            targetArea:
                "shadow",

            targetSpawn: {

                x:
                    245,

                y:
                    1080

            }

        });


        world.gates.push({

            id:
                "west_gate",

            name:
                "PORTÃO OESTE",

            x:
                60,

            y:
                990,

            w:
                120,

            h:
                220,

            orientation:
                "vertical",

            opened:
                false,

            locked:
                true,

            animation:
                0,

            targetAnimation:
                0,

            futureRoute:
                true

        });


        world.gates.push({

            id:
                "south_gate",

            name:
                "PORTÃO SUL",

            x:
                1460,

            y:
                2040,

            w:
                280,

            h:
                100,

            orientation:
                "horizontal",

            opened:
                false,

            locked:
                true,

            animation:
                0,

            targetAnimation:
                0,

            futureRoute:
                true

        });


        /* =====================================================
           ROTA LESTE
           ===================================================== */

        world.portals.push({

            id:
                "village_to_forest",

            label:
                "ESTRADA LESTE",

            x:
                3010,

            y:
                1015,

            w:
                150,

            h:
                170,

            targetArea:
                "forest",

            targetX:
                225,

            targetY:
                1150,

            active:
                true,

            hidden:
                false

        });


        generateTrees(
            world,
            78,
            1357
        );

    }


    /* =========================================================
       NPC DE MUNDO
       ========================================================= */

    function createWorldNPC(
        id,
        x,
        y,
        options = {}
    ) {

        const data =
            NPC_LIBRARY[id];


        if (!data) {

            return null;

        }


        return {

            ...deepClone(
                data
            ),

            x,
            y,

            homeX:
                x,

            homeY:
                y,

            movable:
                options.movable !==
                false,

            wanderRadius:
                options.wanderRadius ||
                55,

            idleTime:
                random(
                    0.5,
                    2.5
                ),

            moveTarget:
                null,

            walkPhase:
                0,

            merchant:
                false,

            blacksmith:
                false,

            questId:
                options.questId ||
                null

        };

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function isInsideProtectedZone(
        world,
        x,
        y,
        radius = 0
    ) {

        for (
            const zone of
            world.protectedZones
        ) {

            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    zone
                )
            ) {

                return true;

            }

        }


        return false;

    }


    function generateTrees(
        world,
        count,
        seedOffset = 0
    ) {

        const rng =
            mulberry32(

                hashString(
                    `${world.area}:trees`
                ) +

                seedOffset

            );


        let attempts =
            0;


        while (
            world.trees.length <
                count &&
            attempts <
                count *
                35
        ) {

            attempts++;


            const x =
                rngRange(
                    rng,
                    85,
                    world.width -
                    85
                );


            const y =
                rngRange(
                    rng,
                    90,
                    world.height -
                    90
                );


            if (
                isInsideProtectedZone(
                    world,
                    x,
                    y,
                    VISUAL_CONFIG
                        .tree
                        .generationSafetyRadius
                )
            ) {

                continue;

            }


            let tooClose =
                false;


            for (
                const tree of
                world.trees
            ) {

                if (
                    distance(
                        x,
                        y,
                        tree.x,
                        tree.y
                    ) <
                    76
                ) {

                    tooClose =
                        true;

                    break;

                }

            }


            if (
                tooClose
            ) {

                continue;

            }


            world.trees.push({

                id:
                    uid(
                        "tree"
                    ),

                x,
                y,

                radius:
                    VISUAL_CONFIG
                        .tree
                        .canopyCollisionRadius,

                canopyRadius:
                    VISUAL_CONFIG
                        .tree
                        .visualCanopyRadius,

                collisionOffsetY:
                    VISUAL_CONFIG
                        .tree
                        .canopyCollisionOffsetY,

                alive:
                    true,

                respawnTimer:
                    0,

                type:

                    world.area ===
                        "grove"

                        ? "ancientTree"

                        : "tree",

                scale:
                    rngRange(
                        rng,
                        0.85,
                        1.18
                    ),

                swayPhase:
                    rngRange(
                        rng,
                        0,
                        Math.PI *
                        2
                    )

            });

        }

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    function getResourceColor(
        type
    ) {

        const colors = {

            carvao:
                "#343536",

            ferro:
                "#8b8f8f",

            ouro:
                "#e2b84e",

            diamante:
                "#7fd4e8",

            rubi:
                "#cc4a60",

            cristal:
                "#7e9be8",

            fragmento:
                "#ac91b7"

        };


        return (
            colors[type] ||
            "#cccccc"
        );

    }


    function addResourceNode(
        world,
        type,
        x,
        y,
        options = {}
    ) {

        const resource = {

            id:
                uid(
                    type
                ),

            type,

            x,
            y,

            radius:
                options.radius ||
                22,

            alive:
                true,

            respawnTimer:
                0,

            amountMin:
                options.amountMin ||
                1,

            amountMax:
                options.amountMax ||
                2,

            magicCost:
                options.magicCost ||
                0,

            glowPhase:
                random(
                    0,
                    Math.PI *
                    2
                )

        };


        world.resources.push(
            resource
        );


        return resource;

    }


    function generateResources(
        world,
        type,
        count,
        seedOffset = 0,
        options = {}
    ) {

        const rng =
            mulberry32(

                hashString(
                    `${world.area}:${type}`
                ) +

                seedOffset

            );


        let added =
            0;


        let attempts =
            0;


        while (
            added <
                count &&
            attempts <
                count *
                40
        ) {

            attempts++;


            const x =
                rngRange(
                    rng,
                    90,
                    world.width -
                    90
                );


            const y =
                rngRange(
                    rng,
                    90,
                    world.height -
                    90
                );


            if (
                isInsideProtectedZone(
                    world,
                    x,
                    y,
                    35
                )
            ) {

                continue;

            }


            addResourceNode(
                world,
                type,
                x,
                y,
                options
            );


            added++;

        }

    }


    /* =========================================================
       INIMIGOS
       ========================================================= */

    function createEnemyFromSpecies(
        speciesId,
        x,
        y,
        overrides = {}
    ) {

        const species =
            ENEMY_SPECIES[
                speciesId
            ];


        if (!species) {

            return null;

        }


        const enemy = {

            id:
                overrides.id ||
                uid(
                    speciesId
                ),

            speciesId,

            name:
                overrides.name ||
                species.name,

            spriteType:
                overrides.spriteType ||
                species.spriteType,

            type:
                overrides.type ||
                "normal",

            bossType:
                overrides.bossType ||
                null,

            icon:
                overrides.icon ||
                null,

            bodyStyle:
                overrides.bodyStyle ||
                null,

            color:
                overrides.color ||
                species.color,

            aura:
                overrides.aura ||
                null,

            x,
            y,

            homeX:
                x,

            homeY:
                y,

            hp:
                overrides.hp ??
                species.hp,

            maxHp:
                overrides.hp ??
                species.hp,

            damage:
                overrides.damage ??
                species.damage,

            defense:
                overrides.defense ??
                species.defense,

            speed:
                overrides.speed ??
                species.speed,

            vision:
                overrides.vision ??
                species.vision,

            attackRange:
                overrides.attackRange ??
                species.attackRange,

            radius:
                overrides.radius ??
                species.radius,

            xp:
                overrides.xp ??
                species.xp,

            money:
                overrides.money ??
                species.money,

            drop:
                overrides.drop ??
                species.drop,

            dropAmount:
                overrides.dropAmount ??
                species.dropAmount,

            ability:
                deepClone(
                    overrides.ability ||
                    species.ability ||
                    null
                ),

            abilityCooldown:
                random(
                    0.4,
                    1.2
                ),

            attackCooldown:
                random(
                    0.2,
                    0.8
                ),

            accepted:
                false,

            aggressive:
                overrides.aggressive ??
                false,

            state:
                "idle",

            dead:
                false,

            deathTimer:
                0,

            animationTime:
                random(
                    0,
                    Math.PI *
                    2
                ),

            hitFlash:
                0,

            charge:
                null,

            wanderTarget:
                null,

            wanderTimer:
                random(
                    0.5,
                    2
                ),

            metadata:
                deepClone(
                    overrides.metadata ||
                    {}
                )

        };


        return enemy;

    }


    function createBossEnemy(
        id,
        x,
        y,
        overrides = {}
    ) {

        const definition =
            getBossDefinition(
                id
            );


        if (!definition) {

            return null;

        }


        const base = {

            id,

            speciesId:
                null,

            name:
                definition.name,

            spriteType:
                definition.bodyStyle,

            type:
                "progression",

            bossType:
                overrides.bossType ||
                "progression",

            icon:
                definition.icon,

            bodyStyle:
                definition.bodyStyle,

            color:
                definition.color,

            aura:
                definition.aura,

            x,
            y,

            homeX:
                x,

            homeY:
                y,

            hp:
                overrides.hp ||
                600,

            maxHp:
                overrides.hp ||
                600,

            damage:
                overrides.damage ||
                30,

            defense:
                overrides.defense ||
                10,

            speed:
                overrides.speed ||
                75,

            vision:
                overrides.vision ||
                470,

            attackRange:
                overrides.attackRange ||
                100,

            radius:
                overrides.radius ||
                50,

            xp:
                overrides.xp ||
                250,

            money:
                overrides.money ||
                120,

            drop:
                overrides.drop ||
                "essencia",

            dropAmount:
                overrides.dropAmount ||
                3,

            unlock:
                overrides.unlock ||
                null,

            ability:
                deepClone(
                    overrides.ability ||
                    null
                ),

            abilityCooldown:
                1,

            attackCooldown:
                0.7,

            accepted:
                false,

            aggressive:
                false,

            state:
                "waiting",

            dead:
                false,

            deathTimer:
                0,

            animationTime:
                random(
                    0,
                    Math.PI *
                    2
                ),

            hitFlash:
                0,

            charge:
                null,

            wanderTarget:
                null,

            wanderTimer:
                0,

            metadata:
                deepClone(
                    overrides.metadata ||
                    {}
                )

        };


        return base;

    }


    function addEnemy(
        config
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        let enemy =
            null;


        if (
            config.speciesId
        ) {

            enemy =
                createEnemyFromSpecies(

                    config.speciesId,

                    config.x,

                    config.y,

                    config

                );

        }

        else if (
            getBossDefinition(
                config.id
            )
        ) {

            enemy =
                createBossEnemy(

                    config.id,

                    config.x,

                    config.y,

                    config

                );

        }

        else {

            /*
                Entidades especiais,
                como inimigos de hordas.
            */
            enemy = {

                id:
                    config.id ||
                    uid(
                        "enemy"
                    ),

                speciesId:
                    null,

                name:
                    config.name ||
                    "INIMIGO",

                spriteType:
                    config.spriteType ||
                    "generic",

                type:
                    config.type ||
                    "normal",

                bossType:
                    config.bossType ||
                    null,

                icon:
                    config.icon ||
                    null,

                bodyStyle:
                    config.bodyStyle ||
                    null,

                color:
                    config.color ||
                    "#777777",

                aura:
                    config.aura ||
                    null,

                x:
                    config.x,

                y:
                    config.y,

                homeX:
                    config.x,

                homeY:
                    config.y,

                hp:
                    config.hp ||
                    100,

                maxHp:
                    config.hp ||
                    100,

                damage:
                    config.damage ||
                    15,

                defense:
                    config.defense ||
                    0,

                speed:
                    config.speed ||
                    80,

                vision:
                    config.vision ||
                    300,

                attackRange:
                    config.attackRange ||
                    50,

                radius:
                    config.radius ||
                    20,

                xp:
                    config.xp ||
                    20,

                money:
                    config.money ||
                    3,

                drop:
                    config.drop ||
                    null,

                dropAmount:
                    config.dropAmount ||
                    0,

                unlock:
                    config.unlock ||
                    null,

                ability:
                    deepClone(
                        config.ability ||
                        null
                    ),

                abilityCooldown:
                    1,

                attackCooldown:
                    0.7,

                accepted:
                    config.accepted ||
                    false,

                aggressive:
                    config.aggressive ||
                    false,

                state:
                    config.state ||
                    "idle",

                dead:
                    false,

                deathTimer:
                    0,

                animationTime:
                    0,

                hitFlash:
                    0,

                charge:
                    null,

                wanderTarget:
                    null,

                wanderTimer:
                    0,

                metadata:
                    deepClone(
                        config.metadata ||
                        {}
                    )

            };

        }


        if (!enemy) {

            return null;

        }


        state.world
            .enemies
            .push(
                enemy
            );


        return enemy;

    }


    function addEnemyToWorld(
        world,
        speciesId,
        x,
        y,
        overrides = {}
    ) {

        const enemy =
            createEnemyFromSpecies(
                speciesId,
                x,
                y,
                overrides
            );


        if (enemy) {

            world.enemies.push(
                enemy
            );

        }


        return enemy;

    }


    function addBossToWorld(
        world,
        id,
        x,
        y,
        overrides = {}
    ) {

        if (
            state.player &&
            hasDefeatedBoss(
                id
            )
        ) {

            return null;

        }


        const enemy =
            createBossEnemy(
                id,
                x,
                y,
                overrides
            );


        if (enemy) {

            world.enemies.push(
                enemy
            );

        }


        return enemy;

    }


    /* =========================================================
       SAFE SPAWN
       ========================================================= */

    function isCircleBlockedByWorld(
        x,
        y,
        radius,
        options = {}
    ) {

        const world =
            state.world;


        if (!world) {

            return true;

        }


        if (
            x -
                radius <
                GAME_CONFIG
                    .worldMargin ||
            y -
                radius <
                GAME_CONFIG
                    .worldMargin ||
            x +
                radius >
                world.width -
                GAME_CONFIG
                    .worldMargin ||
            y +
                radius >
                world.height -
                GAME_CONFIG
                    .worldMargin
        ) {

            return true;

        }


        for (
            const obstacle of
            world.obstacles
        ) {

            /*
                Fonte não bloqueia pelo retângulo,
                porque possui colisão própria
                circular mais adiante.
            */
            if (
                obstacle.type ===
                "fountainBase"
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


        for (
            const building of
            world.buildings
        ) {

            const door =
                world.doors.find(
                    item =>
                        item.buildingId ===
                        building.id
                );


            /*
                Casa é sólida,
                exceto a área da porta.
            */
            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    building
                )
            ) {

                if (
                    door &&
                    circleRectCollision(
                        x,
                        y,
                        radius,
                        door.interactionRect
                    )
                ) {

                    continue;

                }


                return true;

            }

        }


        for (
            const tree of
            world.trees
        ) {

            if (
                !tree.alive
            ) {

                continue;

            }


            if (
                circleCircleCollision(

                    x,
                    y,
                    radius,

                    tree.x,

                    tree.y +
                    tree.collisionOffsetY,

                    tree.radius

                )
            ) {

                return true;

            }

        }


        if (
            world.fountain
        ) {

            if (
                circleCircleCollision(

                    x,
                    y,
                    radius,

                    world.fountain.x,
                    world.fountain.y,

                    world.fountain.radius -
                    8

                )
            ) {

                return true;

            }

        }


        if (
            !options.ignoreDarknessBarrier
        ) {

            for (
                const barrier of
                world.darknessBarriers
            ) {

                if (
                    barrier.requiresLantern &&
                    state.player
                        ?.lanternOwned
                ) {

                    continue;

                }


                if (
                    circleRectCollision(
                        x,
                        y,
                        radius,
                        barrier
                    )
                ) {

                    return true;

                }

            }

        }


        return false;

    }


    function isInteriorPositionBlocked(
        x,
        y,
        radius,
        building =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                building
            );


        if (!spec) {

            return true;

        }


        const room =
            spec.room;


        const inset =
            18;


        if (
            x -
                radius <
                room.x +
                inset ||
            x +
                radius >
                room.x +
                room.w -
                inset ||
            y -
                radius <
                room.y +
                inset ||
            y +
                radius >
                room.y +
                room.h -
                inset
        ) {

            return true;

        }


        for (
            const object of
            spec.furniture
        ) {

            /*
                Tapetes e iluminação não bloqueiam.
            */
            if (
                object.type ===
                    "rug" ||
                object.type ===
                    "lamp" ||
                object.type ===
                    "crystalLamp" ||
                object.type ===
                    "goldLamp" ||
                object.type ===
                    "lanternStand"
            ) {

                continue;

            }


            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    object
                )
            ) {

                return true;

            }

        }


        return false;

    }


    function findSafeSpawn(
        desiredX,
        desiredY,
        radius = 22,
        options = {}
    ) {

        const world =
            state.world;


        if (!world) {

            return {

                x:
                    desiredX,

                y:
                    desiredY

            };

        }


        if (
            !isCircleBlockedByWorld(
                desiredX,
                desiredY,
                radius,
                options
            )
        ) {

            return {

                x:
                    desiredX,

                y:
                    desiredY

            };

        }


        for (
            let ring = 1;
            ring <= 18;
            ring++
        ) {

            const searchRadius =
                ring *
                28;


            const samples =
                16 +
                ring *
                2;


            for (
                let index = 0;
                index < samples;
                index++
            ) {

                const angle =

                    index /
                    samples *

                    Math.PI *
                    2;


                const x =

                    desiredX +

                    Math.cos(
                        angle
                    ) *

                    searchRadius;


                const y =

                    desiredY +

                    Math.sin(
                        angle
                    ) *

                    searchRadius;


                if (
                    !isCircleBlockedByWorld(
                        x,
                        y,
                        radius,
                        options
                    )
                ) {

                    return {

                        x,
                        y

                    };

                }

            }

        }


        const fallback =
            getRegionEntrySpawn(
                world.area
            );


        return {

            x:
                fallback.x,

            y:
                fallback.y

        };

    }


    function repairPlayerPosition(
        desiredX =
            state.player
                ?.x,
        desiredY =
            state.player
                ?.y
    ) {

        if (
            !state.player ||
            !state.world
        ) {

            return false;

        }


        const safe =
            findSafeSpawn(

                finiteNumber(
                    desiredX,
                    getRegionEntrySpawn()
                        .x
                ),

                finiteNumber(
                    desiredY,
                    getRegionEntrySpawn()
                        .y
                ),

                state.player.radius,

                {
                    allowProtected:
                        true
                }

            );


        state.player.x =
            safe.x;


        state.player.y =
            safe.y;


        return true;

    }


    /* =========================================================
       PORTAS — AUTO ABRIR / FECHAR
       ========================================================= */

    function updateExteriorDoors(
        dt
    ) {

        if (
            state.houseMode ||
            !state.world ||
            !state.player
        ) {

            return;

        }


        for (
            const door of
            state.world.doors
        ) {

            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    door.approachX,
                    door.approachY

                );


            const previousTarget =
                door.targetAnimation;


            if (
                d <=
                GAME_CONFIG
                    .doorAutoOpenDistance
            ) {

                door.targetAnimation =
                    1;

            }

            else if (
                d >=
                GAME_CONFIG
                    .doorAutoCloseDistance
            ) {

                door.targetAnimation =
                    0;

            }


            if (
                previousTarget ===
                    0 &&
                door.targetAnimation ===
                    1
            ) {

                door.dustTimer =
                    0.45;

            }


            door.animation =
                lerp(

                    door.animation,

                    door.targetAnimation,

                    clamp(
                        dt *
                        8,
                        0,
                        1
                    )

                );


            door.dustTimer =
                Math.max(
                    0,
                    door.dustTimer -
                    dt
                );

        }

    }


    function getNearbyExteriorDoor() {

        if (
            state.houseMode ||
            !state.world ||
            !state.player
        ) {

            return null;

        }


        let closest =
            null;


        let closestDistance =
            Infinity;


        for (
            const door of
            state.world.doors
        ) {

            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    door.approachX,
                    door.approachY

                );


            if (
                d <=
                    GAME_CONFIG
                        .doorInteractionDistance &&
                d <
                    closestDistance
            ) {

                closest =
                    door;

                closestDistance =
                    d;

            }

        }


        return closest;

    }


    /* =========================================================
       LABIRINTO
       ========================================================= */

    function addMazeWall(
        world,
        x,
        y,
        w,
        h
    ) {

        return addObstacle(
            world,
            x,
            y,
            w,
            h,
            "mazeWall"
        );

    }


    function buildMonarchMazeGeometry(
        world
    ) {

        /*
            Estrada inicial.
        */
        addPath(
            world,
            100,
            1030,
            450,
            220
        );


        /*
            Corredor 1.
        */
        addMazeWall(
            world,
            500,
            280,
            85,
            700
        );


        addMazeWall(
            world,
            500,
            1320,
            85,
            690
        );


        /*
            Corredor 2.
        */
        addMazeWall(
            world,
            880,
            580,
            85,
            1300
        );


        /*
            Corredor 3.
        */
        addMazeWall(
            world,
            1270,
            260,
            85,
            1060
        );


        addMazeWall(
            world,
            1270,
            1660,
            85,
            380
        );


        /*
            Corredor 4.
        */
        addMazeWall(
            world,
            1650,
            560,
            85,
            1310
        );


        /*
            Corredor 5.
        */
        addMazeWall(
            world,
            2040,
            250,
            85,
            800
        );


        addMazeWall(
            world,
            2040,
            1390,
            85,
            640
        );


        /*
            Corredor 6.
        */
        addMazeWall(
            world,
            2420,
            530,
            85,
            1390
        );


        /*
            Sala final.
        */
        addMazeWall(
            world,
            2800,
            300,
            85,
            580
        );


        addMazeWall(
            world,
            2800,
            1430,
            85,
            550
        );


        /*
            Paredes horizontais.
        */
        addMazeWall(
            world,
            580,
            280,
            690,
            75
        );


        addMazeWall(
            world,
            965,
            1220,
            690,
            75
        );


        addMazeWall(
            world,
            1355,
            1740,
            690,
            75
        );


        addMazeWall(
            world,
            1735,
            480,
            690,
            75
        );


        addMazeWall(
            world,
            2125,
            1320,
            690,
            75
        );


        /*
            Barreira antes de entrar
            de verdade no labirinto.
        */
        world.darknessBarriers.push({

            id:
                "maze_lantern_barrier",

            x:
                470,

            y:
                980,

            w:
                125,

            h:
                340,

            requiresLantern:
                true,

            message:
                GAME_CONFIG
                    .darknessBarrierMessage

        });


        /*
            Altar.
        */
        world.altar = {

            id:
                "monarch_altar",

            x:
                3275,

            y:
                1145,

            radius:
                82,

            active:
                Boolean(
                    state.player
                        ?.monarchAwakened
                ),

            ritualStarted:
                Boolean(
                    state.player
                        ?.monarchAwakened
                )

        };


        addProtectedZone(
            world,
            3070,
            900,
            410,
            500,
            30
        );

    }


    /* =========================================================
       CONSTRUÇÃO DAS OUTRAS REGIÕES
       ========================================================= */

    function buildLinearRegion(
        world,
        config
    ) {

        /*
            Caminho central preserva navegação simples.
        */
        addPath(

            world,

            100,

            world.height /
                2 -
                100,

            world.width -
                200,

            200

        );


        if (
            config.npc
        ) {

            world.npcs.push(

                createWorldNPC(

                    config.npc.id,

                    config.npc.x,

                    config.npc.y,

                    config.npc.options ||
                    {}

                )

            );

        }


        if (
            config.trees
        ) {

            generateTrees(
                world,
                config.trees,
                config.treeSeed ||
                0
            );

        }


        for (
            const resource of
            config.resources ||
            []
        ) {

            generateResources(

                world,

                resource.type,

                resource.count,

                resource.seed ||
                0,

                resource.options ||
                {}

            );

        }


        for (
            const spawn of
            config.enemies ||
            []
        ) {

            addEnemyToWorld(

                world,

                spawn.species,

                spawn.x,

                spawn.y,

                spawn.overrides ||
                {}

            );

        }


        if (
            config.boss &&
            !hasDefeatedBoss(
                config.boss.id
            )
        ) {

            addBossToWorld(

                world,

                config.boss.id,

                config.boss.x,

                config.boss.y,

                config.boss.overrides ||
                {}

            );

        }


        /*
            Volta para região anterior.
        */
        const previous =
            PREVIOUS_REGION[
                world.area
            ];


        if (previous) {

            world.portals.push({

                id:
                    `${world.area}_back`,

                label:
                    "RETORNAR",

                x:
                    25,

                y:
                    world.height /
                        2 -
                        90,

                w:
                    125,

                h:
                    180,

                targetArea:
                    previous,

                targetX:
                    REGIONS[
                        previous
                    ].width -
                    240,

                targetY:
                    REGIONS[
                        previous
                    ].height /
                    2,

                active:
                    true,

                hidden:
                    false

            });

        }


        /*
            Próxima região.
        */
        if (
            config.nextArea
        ) {

            world.portals.push({

                id:
                    `${world.area}_next`,

                label:
                    REGIONS[
                        config.nextArea
                    ]?.name ||
                    config.nextArea,

                x:
                    world.width -
                    150,

                y:
                    world.height /
                        2 -
                        90,

                w:
                    125,

                h:
                    180,

                targetArea:
                    config.nextArea,

                targetX:
                    REGIONS[
                        config.nextArea
                    ].entry.x,

                targetY:
                    REGIONS[
                        config.nextArea
                    ].entry.y,

                active:
                    true,

                hidden:
                    false,

                condition:
                    config.nextCondition ||
                    null

            });

        }

    }


    /* =========================================================
       BUILD WORLD PRINCIPAL
       ========================================================= */

    function buildWorld() {

        const area =
            state.area;


        const world =
            createEmptyWorld(
                area
            );


        state.world =
            world;


        switch (
            area
        ) {

            /* =================================================
               VILA
               ================================================= */

            case "village":

                buildVillageWorld(
                    world
                );

                break;


            /* =================================================
               FLORESTA
               ================================================= */

            case "forest":

                buildLinearRegion(
                    world,
                    {

                        npc: {

                            id:
                                "nara",

                            x:
                                760,

                            y:
                                1040

                        },

                        trees:
                            105,

                        treeSeed:
                            777,

                        resources: [

                            {
                                type:
                                    "carvao",

                                count:
                                    8,

                                seed:
                                    120
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "wolf",

                                x:
                                    980,

                                y:
                                    910
                            },

                            {
                                species:
                                    "wolf",

                                x:
                                    1320,

                                y:
                                    1270
                            },

                            {
                                species:
                                    "boar",

                                x:
                                    1690,

                                y:
                                    980
                            },

                            {
                                species:
                                    "thornling",

                                x:
                                    2090,

                                y:
                                    1280
                            }

                        ],

                        boss: {

                            id:
                                "forest_warden",

                            x:
                                2880,

                            y:
                                1150,

                            overrides: {

                                hp:
                                    620,

                                damage:
                                    29,

                                defense:
                                    10,

                                speed:
                                    82,

                                radius:
                                    49,

                                xp:
                                    250,

                                money:
                                    120,

                                unlock:
                                    "grove",

                                ability: {

                                    id:
                                        "forestWardenRoots",

                                    type:
                                        "bossRoots",

                                    cooldown:
                                        2.8

                                }

                            }

                        },

                        nextArea:
                            "grove",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "forest_warden"
                                )

                    }
                );

                break;


            /* =================================================
               BOSQUE
               ================================================= */

            case "grove":

                buildLinearRegion(
                    world,
                    {

                        npc: {

                            id:
                                "lyra",

                            x:
                                770,

                            y:
                                1090

                        },

                        trees:
                            92,

                        treeSeed:
                            411,

                        resources: [

                            {
                                type:
                                    "carvao",

                                count:
                                    7,

                                seed:
                                    90
                            },

                            {
                                type:
                                    "cristal",

                                count:
                                    6,

                                seed:
                                    300
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "thornling",

                                x:
                                    1120,

                                y:
                                    910
                            },

                            {
                                species:
                                    "wolf",

                                x:
                                    1460,

                                y:
                                    1300
                            },

                            {
                                species:
                                    "boar",

                                x:
                                    1870,

                                y:
                                    1030
                            },

                            {
                                species:
                                    "thornling",

                                x:
                                    2280,

                                y:
                                    1270
                            }

                        ],

                        boss: {

                            id:
                                "grove_heart",

                            x:
                                2970,

                            y:
                                1175,

                            overrides: {

                                hp:
                                    760,

                                damage:
                                    33,

                                defense:
                                    13,

                                speed:
                                    62,

                                radius:
                                    52,

                                xp:
                                    315,

                                money:
                                    160,

                                unlock:
                                    "mountains",

                                ability: {

                                    id:
                                        "groveHeartPattern",

                                    type:
                                        "bossRoots",

                                    cooldown:
                                        2.5

                                }

                            }

                        },

                        nextArea:
                            "mountains",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "grove_heart"
                                )

                    }
                );

                break;


            /* =================================================
               MONTANHAS
               ================================================= */

            case "mountains":

                buildLinearRegion(
                    world,
                    {

                        npc: {

                            id:
                                "kael",

                            x:
                                760,

                            y:
                                1080

                        },

                        trees:
                            35,

                        treeSeed:
                            932,

                        resources: [

                            {
                                type:
                                    "ferro",

                                count:
                                    12,

                                seed:
                                    178
                            },

                            {
                                type:
                                    "carvao",

                                count:
                                    7,

                                seed:
                                    208
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "stoneCrawler",

                                x:
                                    1120,

                                y:
                                    950
                            },

                            {
                                species:
                                    "stoneCrawler",

                                x:
                                    1600,

                                y:
                                    1290
                            },

                            {
                                species:
                                    "wolf",

                                x:
                                    2020,

                                y:
                                    1000
                            },

                            {
                                species:
                                    "stoneCrawler",

                                x:
                                    2400,

                                y:
                                    1280
                            }

                        ],

                        boss: {

                            id:
                                "mountain_titan",

                            x:
                                2990,

                            y:
                                1175,

                            overrides: {

                                hp:
                                    900,

                                damage:
                                    37,

                                defense:
                                    18,

                                speed:
                                    58,

                                radius:
                                    56,

                                xp:
                                    370,

                                money:
                                    210,

                                unlock:
                                    "iron",

                                ability: {

                                    id:
                                        "mountainTitanSlam",

                                    type:
                                        "bossSlam",

                                    cooldown:
                                        3

                                }

                            }

                        },

                        nextArea:
                            "iron",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "mountain_titan"
                                )

                    }
                );

                break;


            /* =================================================
               FERRO
               ================================================= */

            case "iron":

                buildLinearRegion(
                    world,
                    {

                        trees:
                            8,

                        resources: [

                            {
                                type:
                                    "ferro",

                                count:
                                    22,

                                seed:
                                    550,

                                options: {

                                    amountMin:
                                        1,

                                    amountMax:
                                        3

                                }

                            },

                            {
                                type:
                                    "ouro",

                                count:
                                    8,

                                seed:
                                    650
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "mineCrawler",

                                x:
                                    980,

                                y:
                                    930
                            },

                            {
                                species:
                                    "mineCrawler",

                                x:
                                    1440,

                                y:
                                    1290
                            },

                            {
                                species:
                                    "stoneCrawler",

                                x:
                                    1910,

                                y:
                                    1020
                            },

                            {
                                species:
                                    "mineCrawler",

                                x:
                                    2350,

                                y:
                                    1280
                            }

                        ],

                        boss: {

                            id:
                                "iron_colossus",

                            x:
                                2870,

                            y:
                                1125,

                            overrides: {

                                hp:
                                    1100,

                                damage:
                                    42,

                                defense:
                                    25,

                                speed:
                                    54,

                                radius:
                                    58,

                                xp:
                                    450,

                                money:
                                    280,

                                unlock:
                                    "ruby",

                                ability: {

                                    id:
                                        "ironColossusBurst",

                                    type:
                                        "oreBurst",

                                    cooldown:
                                        2.7

                                }

                            }

                        },

                        nextArea:
                            "ruby",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "iron_colossus"
                                )

                    }
                );

                break;


            /* =================================================
               RUBI
               ================================================= */

            case "ruby":

                buildLinearRegion(
                    world,
                    {

                        trees:
                            10,

                        resources: [

                            {
                                type:
                                    "rubi",

                                count:
                                    26,

                                seed:
                                    760,

                                options: {

                                    amountMin:
                                        1,

                                    amountMax:
                                        3

                                }

                            },

                            {
                                type:
                                    "diamante",

                                count:
                                    16,

                                seed:
                                    860,

                                options: {

                                    amountMin:
                                        1,

                                    amountMax:
                                        2

                                }

                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "rubyHound",

                                x:
                                    1020,

                                y:
                                    930
                            },

                            {
                                species:
                                    "rubyHound",

                                x:
                                    1510,

                                y:
                                    1320
                            },

                            {
                                species:
                                    "mineCrawler",

                                x:
                                    2010,

                                y:
                                    1010
                            },

                            {
                                species:
                                    "rubyHound",

                                x:
                                    2460,

                                y:
                                    1290
                            }

                        ],

                        boss: {

                            id:
                                "ruby_chimera",

                            x:
                                2990,

                            y:
                                1150,

                            overrides: {

                                hp:
                                    1300,

                                damage:
                                    47,

                                defense:
                                    29,

                                speed:
                                    89,

                                radius:
                                    58,

                                xp:
                                    540,

                                money:
                                    350,

                                unlock:
                                    "monarchMaze",

                                ability: {

                                    id:
                                        "rubyChimeraPattern",

                                    type:
                                        "burningCharge",

                                    cooldown:
                                        2.4,

                                    telegraph:
                                        0.55,

                                    speed:
                                        410,

                                    duration:
                                        0.48

                                }

                            }

                        },

                        nextArea:
                            "monarchMaze",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "ruby_chimera"
                                )

                    }
                );

                break;


            /* =================================================
               LABIRINTO / MONARCA
               ================================================= */

            case "monarchMaze":

                buildMonarchMazeGeometry(
                    world
                );


                world.portals.push({

                    id:
                        "maze_back",

                    label:
                        "REGIÃO RUBI",

                    x:
                        20,

                    y:
                        1030,

                    w:
                        120,

                    h:
                        220,

                    targetArea:
                        "ruby",

                    targetX:
                        3230,

                    targetY:
                        1150,

                    active:
                        true,

                    hidden:
                        false

                });


                addEnemyToWorld(
                    world,
                    "bat",
                    810,
                    890
                );


                addEnemyToWorld(
                    world,
                    "spider",
                    1150,
                    1510
                );


                addEnemyToWorld(
                    world,
                    "scorpion",
                    1870,
                    1050
                );


                addEnemyToWorld(
                    world,
                    "bat",
                    2320,
                    1540
                );


                addEnemyToWorld(
                    world,
                    "spider",
                    2670,
                    900
                );


                if (
                    state.player
                        ?.monarchAwakened &&
                    !state.player
                        ?.monarchDefeated &&
                    !hasDefeatedBoss(
                        "monarch"
                    )
                ) {

                    addBossToWorld(
                        world,
                        "monarch",
                        3180,
                        1145,
                        {

                            hp:
                                1750,

                            damage:
                                51,

                            defense:
                                32,

                            speed:
                                74,

                            radius:
                                58,

                            xp:
                                900,

                            money:
                                500,

                            drop:
                                "essencia",

                            dropAmount:
                                8,

                            ability: {

                                id:
                                    "monarchPattern",

                                type:
                                    "monarch",

                                cooldown:
                                    2.6

                            },

                            metadata: {

                                monarch:
                                    true,

                                maxClones:
                                    4,

                                staggerHits:
                                    10,

                                staggerDuration:
                                    5

                            }

                        }
                    );

                }


                break;


            /* =================================================
               SOMBRA
               ================================================= */

            case "shadow":

                buildLinearRegion(
                    world,
                    {

                        trees:
                            0,

                        resources: [

                            {
                                type:
                                    "diamante",

                                count:
                                    8,

                                seed:
                                    1200
                            },

                            {
                                type:
                                    "fragmento",

                                count:
                                    10,

                                seed:
                                    1300
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "spider",

                                x:
                                    900,

                                y:
                                    880
                            },

                            {
                                species:
                                    "bat",

                                x:
                                    1330,

                                y:
                                    1320
                            },

                            {
                                species:
                                    "scorpion",

                                x:
                                    1770,

                                y:
                                    920
                            },

                            {
                                species:
                                    "spider",

                                x:
                                    2200,

                                y:
                                    1300
                            }

                        ],

                        boss: {

                            id:
                                "shadow_lord",

                            x:
                                2790,

                            y:
                                1100,

                            overrides: {

                                hp:
                                    1850,

                                damage:
                                    54,

                                defense:
                                    30,

                                speed:
                                    105,

                                radius:
                                    54,

                                xp:
                                    950,

                                money:
                                    520,

                                unlock:
                                    "fairy",

                                ability: {

                                    id:
                                        "shadowLordPattern",

                                    type:
                                        "shadowBoss",

                                    cooldown:
                                        2.35

                                }

                            }

                        },

                        nextArea:
                            "fairy",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "shadow_lord"
                                )

                    }
                );

                break;


            /* =================================================
               FADA
               ================================================= */

            case "fairy":

                buildLinearRegion(
                    world,
                    {

                        trees:
                            50,

                        treeSeed:
                            1420,

                        resources: [

                            {
                                type:
                                    "cristal",

                                count:
                                    15,

                                seed:
                                    1450
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "thornling",

                                x:
                                    1050,

                                y:
                                    940
                            },

                            {
                                species:
                                    "bat",

                                x:
                                    1550,

                                y:
                                    1290
                            },

                            {
                                species:
                                    "spider",

                                x:
                                    2060,

                                y:
                                    1000
                            }

                        ],

                        boss: {

                            id:
                                "fairy_guardian",

                            x:
                                2860,

                            y:
                                1125,

                            overrides: {

                                hp:
                                    1980,

                                damage:
                                    57,

                                defense:
                                    28,

                                speed:
                                    118,

                                radius:
                                    52,

                                xp:
                                    1040,

                                money:
                                    580,

                                unlock:
                                    "sky",

                                ability: {

                                    id:
                                        "fairyGuardianPattern",

                                    type:
                                        "fairyBoss",

                                    cooldown:
                                        2.2

                                }

                            }

                        },

                        nextArea:
                            "sky",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "fairy_guardian"
                                )

                    }
                );

                break;


            /* =================================================
               CÉU
               ================================================= */

            case "sky":

                addPath(
                    world,
                    100,
                    1010,
                    3150,
                    230
                );


                world.landmarks.push({

                    id:
                        "sky_trial_arena",

                    type:
                        "arena",

                    x:
                        2500,

                    y:
                        1125,

                    radius:
                        400,

                    important:
                        true,

                    label:
                        "Prova Celeste",

                    glow:
                        "#e6dc9e"

                });


                world.portals.push({

                    id:
                        "sky_back",

                    label:
                        "VALE FEÉRICO",

                    x:
                        25,

                    y:
                        1030,

                    w:
                        125,

                    h:
                        180,

                    targetArea:
                        "fairy",

                    targetX:
                        3170,

                    targetY:
                        1125,

                    active:
                        true,

                    hidden:
                        false

                });


                world.portals.push({

                    id:
                        "sky_to_hell",

                    label:
                        "PASSAGEM REVELADA",

                    x:
                        3230,

                    y:
                        1020,

                    w:
                        130,

                    h:
                        200,

                    targetArea:
                        "hell",

                    targetX:
                        225,

                    targetY:
                        1225,

                    active:
                        Boolean(
                            state.player
                                ?.flutePlayed
                        ),

                    hidden:
                        !Boolean(
                            state.player
                                ?.flutePlayed
                        )

                });


                break;


            /* =================================================
               INFERNO
               ================================================= */

            case "hell":

                buildLinearRegion(
                    world,
                    {

                        trees:
                            0,

                        resources: [

                            {
                                type:
                                    "rubi",

                                count:
                                    10,

                                seed:
                                    1600
                            },

                            {
                                type:
                                    "fragmento",

                                count:
                                    14,

                                seed:
                                    1700
                            }

                        ],

                        enemies: [

                            {
                                species:
                                    "rubyHound",

                                x:
                                    1040,

                                y:
                                    1040
                            },

                            {
                                species:
                                    "scorpion",

                                x:
                                    1550,

                                y:
                                    1390
                            },

                            {
                                species:
                                    "rubyHound",

                                x:
                                    2090,

                                y:
                                    1050
                            },

                            {
                                species:
                                    "bat",

                                x:
                                    2540,

                                y:
                                    1400
                            }

                        ],

                        boss: {

                            id:
                                "hell_guardian",

                            x:
                                3160,

                            y:
                                1225,

                            overrides: {

                                hp:
                                    2350,

                                damage:
                                    64,

                                defense:
                                    36,

                                speed:
                                    103,

                                radius:
                                    58,

                                xp:
                                    1250,

                                money:
                                    700,

                                unlock:
                                    "final",

                                ability: {

                                    id:
                                        "hellGuardianPattern",

                                    type:
                                        "hellBoss",

                                    cooldown:
                                        2.15

                                }

                            }

                        },

                        nextArea:
                            "final",

                        nextCondition:
                            () =>
                                hasDefeatedBoss(
                                    "hell_guardian"
                                )

                    }
                );

                break;


            /* =================================================
               FINAL
               ================================================= */

            case "final":

                addPath(
                    world,
                    80,
                    655,
                    2040,
                    240
                );


                world.portals.push({

                    id:
                        "final_back",

                    label:
                        "INFERNO",

                    x:
                        20,

                    y:
                        680,

                    w:
                        120,

                    h:
                        190,

                    targetArea:
                        "hell",

                    targetX:
                        3420,

                    targetY:
                        1225,

                    active:
                        true,

                    hidden:
                        false

                });


                if (
                    !hasDefeatedBoss(
                        "other_self"
                    )
                ) {

                    addBossToWorld(
                        world,
                        "other_self",
                        1770,
                        775,
                        {

                            hp:
                                2700,

                            damage:
                                68,

                            defense:
                                40,

                            speed:
                                126,

                            radius:
                                54,

                            xp:
                                1500,

                            money:
                                900,

                            ability: {

                                id:
                                    "otherSelfPattern",

                                type:
                                    "mirrorBoss",

                                cooldown:
                                    2

                            }

                        }
                    );

                }


                break;

        }


        /*
            Marca região como explorada.
        */
        if (
            state.player &&
            !state.player
                .exploredAreas
                .includes(
                    area
                )
        ) {

            state.player
                .exploredAreas
                .push(
                    area
                );

        }


        return world;

    }


    /* =========================================================
       LIGHT BLOCKERS

       Usado pela Parte 4 no sistema da lanterna.
       ========================================================= */

    function getLightBlockingRects() {

        if (
            !state.world
        ) {

            return [];

        }


        const blockers =
            [];


        for (
            const obstacle of
            state.world.obstacles
        ) {

            if (
                obstacle.type ===
                "mazeWall" ||
                obstacle.type ===
                "darkrock" ||
                obstacle.type ===
                "basalt" ||
                obstacle.type ===
                "mountainRock"
            ) {

                blockers.push({

                    x:
                        obstacle.x,

                    y:
                        obstacle.y,

                    w:
                        obstacle.w,

                    h:
                        obstacle.h

                });

            }

        }


        for (
            const building of
            state.world.buildings
        ) {

            blockers.push({

                x:
                    building.x,

                y:
                    building.y,

                w:
                    building.w,

                h:
                    building.h

            });

        }


        return blockers;

    }


    /* =========================================================
       MAP MARKERS
       ========================================================= */

    function getVisibleMapMarkers() {

        if (
            !state.world
        ) {

            return [];

        }


        const markers =
            [];


        if (
            state.world
                .fountain
        ) {

            markers.push({

                type:
                    "fountain",

                x:
                    state.world
                        .fountain
                        .x,

                y:
                    state.world
                        .fountain
                        .y,

                label:
                    "Fonte",

                important:
                    true

            });

        }


        for (
            const building of
            state.world
                .buildings
        ) {

            markers.push({

                type:
                    "building",

                x:
                    building.x +
                    building.w /
                    2,

                y:
                    building.y +
                    building.h /
                    2,

                label:
                    building.name,

                important:
                    true

            });

        }


        for (
            const npc of
            state.world
                .npcs
        ) {

            markers.push({

                type:
                    "npc",

                x:
                    npc.x,

                y:
                    npc.y,

                label:
                    npc.name,

                important:
                    false

            });

        }


        for (
            const gate of
            state.world
                .gates
        ) {

            markers.push({

                type:
                    "gate",

                x:
                    gate.x +
                    gate.w /
                    2,

                y:
                    gate.y +
                    gate.h /
                    2,

                label:
                    gate.name,

                important:
                    true

            });

        }


        for (
            const enemy of
            state.world
                .enemies
        ) {

            if (
                enemy.dead
            ) {

                continue;

            }


            if (
                enemy.type ===
                    "progression" ||
                enemy.bossType ===
                    "resourceBoss"
            ) {

                markers.push({

                    type:
                        "boss",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    label:
                        enemy.name,

                    important:
                        true

                });

            }

        }


        for (
            const portal of
            state.world
                .portals
        ) {

            if (
                portal.hidden
            ) {

                continue;

            }


            markers.push({

                type:
                    "portal",

                x:
                    portal.x +
                    portal.w /
                    2,

                y:
                    portal.y +
                    portal.h /
                    2,

                label:
                    portal.label,

                important:
                    true

            });

        }


        if (
            state.world
                .altar
        ) {

            markers.push({

                type:
                    "altar",

                x:
                    state.world
                        .altar
                        .x,

                y:
                    state.world
                        .altar
                        .y,

                label:
                    "Altar",

                important:
                    true

            });

        }


        return markers;

    }


    /* =========================================================
       VALIDAÇÃO PARTE 2
       ========================================================= */

    function validatePart2Data() {

        const errors =
            [];


        if (
            Object.keys(
                REGIONS
            ).length !==
            12
        ) {

            errors.push(
                "Quantidade de regiões inválida."
            );

        }


        if (
            HOUSE_INTERIORS
                .home
                .room
                .w !==
            820
        ) {

            errors.push(
                "Interior da casa do jogador foi alterado."
            );

        }


        if (
            ENEMY_SPECIES
                .wolf
                .ability
                .cooldown !==
            2
        ) {

            errors.push(
                "Cooldown da investida do lobo deve ser 2 segundos."
            );

        }


        if (
            BOSS_REGISTRY
                .ancient_deer
                .topBar !==
            false
        ) {

            errors.push(
                "Cervo Ancestral não pode usar barra grande."
            );

        }


        if (
            MAX_BLOOD_MARKS !==
            18
        ) {

            errors.push(
                "Limite de marcas de sangue deve ser 18."
            );

        }


        if (
            errors.length >
            0
        ) {

            console.error(
                "VEYRA V25 — erros na Parte 2:",
                errors
            );


            return false;

        }


        return true;

    }


    /* =========================================================
       FIM DA PARTE 2/4

       NÃO COLOQUE })(); AQUI.

       A PARTE 3/4 ENTRA DIRETAMENTE ABAIXO.

       PARTE 3:
       - movimento;
       - level/status;
       - fome/cansaço;
       - coleta segurando E;
       - inventário/poções;
       - ataques;
       - Q/R/F;
       - Dash;
       - IA;
       - lobo/javali;
       - bosses;
       - dano/morte;
       - partículas e sangue.
       ========================================================= */
    /* =========================================================
       VEYRA: A QUIETUDE — V25
       SCRIPT.JS — PARTE 3/4

       GAMEPLAY
       MOVIMENTO
       LEVEL / STATUS
       SOBREVIVÊNCIA
       INVENTÁRIO / POÇÕES
       COLETA SEGURANDO E
       ATAQUES
       Q / R / F
       DASH
       IA DOS INIMIGOS
       HABILIDADES DE ESPÉCIES
       BOSSES
       DANO
       MORTE
       PARTÍCULAS / SANGUE

       CONTINUA DIRETAMENTE DA PARTE 2/4.
       NÃO FECHA O IIFE.
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÕES DE COMBATE
       ========================================================= */

    const PLAYER_COMBAT_CONFIG =
        Object.freeze({

            basicAttackEnergy:
                Object.freeze({

                    kaelion:
                        4,

                    theron:
                        5,

                    grumgar:
                        6,

                    lirael:
                        4,

                    zephyr:
                        5

                }),


            hungerPerAttack:
                0.025,

            fatiguePerAttack:
                0.045,


            damageReductionPerDefense:
                0.34,


            minimumDamage:
                1,


            enemyHitInvincibility:
                0.55,


            universalDashEnergyCost:
                12,

            universalDashCooldown:
                0.72,

            universalDashDuration:
                0.18,

            universalDashSpeed:
                565

        });


    /* =========================================================
       SOBREVIVÊNCIA

       Mantido no ritmo antigo aprovado.
       ========================================================= */

    const SURVIVAL_CONFIG =
        Object.freeze({

            hungerDrainPerSecond:
                0.25,

            fatigueDrainPerSecond:
                0.20,


            magicRegenPerSecond:
                1.7,

            energyRegenPerSecond:
                3,


            lowHungerThreshold:
                20,

            lowFatigueThreshold:
                20,


            lowResourceMoveMultiplier:
                0.72,


            emptyNeedHpDrainPerSecond:
                0.12

        });


    /* =========================================================
       COLETA
       ========================================================= */

    const COLLECTION_CONFIG =
        Object.freeze({

            madeira:
                Object.freeze({

                    magicCost:
                        4,

                    energyCost:
                        2,

                    hungerCost:
                        0.4,

                    fatigueCost:
                        0.6,

                    xp:
                        5,

                    amountMin:
                        1,

                    amountMax:
                        3,

                    respawn:
                        30

                }),


            carvao:
                Object.freeze({

                    magicCost:
                        7,

                    energyCost:
                        3,

                    hungerCost:
                        0.5,

                    fatigueCost:
                        0.8,

                    xp:
                        8,

                    respawn:
                        38

                }),


            ferro:
                Object.freeze({

                    magicCost:
                        12,

                    energyCost:
                        5,

                    hungerCost:
                        0.6,

                    fatigueCost:
                        1,

                    xp:
                        12,

                    respawn:
                        45

                }),


            ouro:
                Object.freeze({

                    magicCost:
                        20,

                    energyCost:
                        7,

                    hungerCost:
                        0.8,

                    fatigueCost:
                        1.2,

                    xp:
                        18,

                    respawn:
                        55

                }),


            diamante:
                Object.freeze({

                    magicCost:
                        30,

                    energyCost:
                        9,

                    hungerCost:
                        1,

                    fatigueCost:
                        1.5,

                    xp:
                        25,

                    respawn:
                        65

                }),


            rubi:
                Object.freeze({

                    magicCost:
                        38,

                    energyCost:
                        11,

                    hungerCost:
                        1.2,

                    fatigueCost:
                        1.8,

                    xp:
                        32,

                    respawn:
                        70

                }),


            cristal:
                Object.freeze({

                    magicCost:
                        25,

                    energyCost:
                        8,

                    hungerCost:
                        0.9,

                    fatigueCost:
                        1.3,

                    xp:
                        21,

                    respawn:
                        60

                }),


            fragmento:
                Object.freeze({

                    magicCost:
                        18,

                    energyCost:
                        6,

                    hungerCost:
                        0.7,

                    fatigueCost:
                        1.1,

                    xp:
                        18,

                    respawn:
                        55

                })

        });


    /* =========================================================
       DIREÇÃO
       ========================================================= */

    function facingVector(
        facing =
            state.player
                ?.facing
    ) {

        switch (
            facing
        ) {

            case "up":

                return {

                    x:
                        0,

                    y:
                        -1

                };


            case "down":

                return {

                    x:
                        0,

                    y:
                        1

                };


            case "left":

                return {

                    x:
                        -1,

                    y:
                        0

                };


            case "right":

                return {

                    x:
                        1,

                    y:
                        0

                };


            default:

                return {

                    x:
                        0,

                    y:
                        1

                };

        }

    }


    function updatePlayerFacing(
        x,
        y
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        if (
            Math.abs(
                x
            ) >
            Math.abs(
                y
            )
        ) {

            if (
                Math.abs(
                    x
                ) >
                0.01
            ) {

                player.facing =
                    x >
                    0
                        ? "right"
                        : "left";

            }

        }

        else {

            if (
                Math.abs(
                    y
                ) >
                0.01
            ) {

                player.facing =
                    y >
                    0
                        ? "down"
                        : "up";

            }

        }

    }


    function pointerDirectionFromPlayer() {

        const player =
            state.player;


        if (!player) {

            return {

                x:
                    0,

                y:
                    1,

                length:
                    1

            };

        }


        const direction =
            normalize(

                state.pointer
                    .worldX -
                player.x,

                state.pointer
                    .worldY -
                player.y

            );


        if (
            direction.length >
            0.001
        ) {

            return direction;

        }


        const facing =
            facingVector();


        return {

            x:
                facing.x,

            y:
                facing.y,

            length:
                1

        };

    }


    function getMovementDirection() {

        let x =
            0;


        let y =
            0;


        if (
            state.keys.has(
                "KeyW"
            ) ||
            state.keys.has(
                "ArrowUp"
            )
        ) {

            y--;

        }


        if (
            state.keys.has(
                "KeyS"
            ) ||
            state.keys.has(
                "ArrowDown"
            )
        ) {

            y++;

        }


        if (
            state.keys.has(
                "KeyA"
            ) ||
            state.keys.has(
                "ArrowLeft"
            )
        ) {

            x--;

        }


        if (
            state.keys.has(
                "KeyD"
            ) ||
            state.keys.has(
                "ArrowRight"
            )
        ) {

            x++;

        }


        return normalize(
            x,
            y
        );

    }


    /* =========================================================
       LEVEL / XP
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


        const gained =
            Math.max(
                0,
                Math.floor(
                    finiteNumber(
                        amount,
                        0
                    )
                )
            );


        if (
            gained <=
            0
        ) {

            return;

        }


        player.xp +=
            gained;


        checkLevelUp();

    }


    function checkLevelUp() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        let leveled =
            false;


        let totalPoints =
            0;


        while (
            player.level <
                MAX_LEVEL &&
            player.xp >=
                player.xpToNext
        ) {

            player.xp -=
                player.xpToNext;


            player.level++;


            const points =
                getStatusPointsForLevel(
                    player.level
                );


            player.statPoints +=
                points;


            totalPoints +=
                points;


            player.xpToNext =

                player.level >=
                MAX_LEVEL

                    ? Infinity

                    : calculateXpToNext(
                        player.level
                    );


            leveled =
                true;

        }


        if (
            player.level >=
            MAX_LEVEL
        ) {

            player.xp =
                0;


            player.xpToNext =
                Infinity;

        }


        if (!leveled) {

            return;

        }


        /*
            IMPORTANTE:

            Subir de nível NÃO aumenta
            nenhum atributo automaticamente.

            O jogador recebeu pontos e
            escolhe onde gastar.
        */

        player.hp =
            Math.min(
                player.maxHp,
                player.hp +
                player.maxHp *
                0.12
            );


        player.magic =
            Math.min(
                player.maxMagic,
                player.magic +
                player.maxMagic *
                0.18
            );


        player.energy =
            Math.min(
                player.maxEnergy,
                player.energy +
                player.maxEnergy *
                0.18
            );


        spawnFloatingText(

            player.x,

            player.y -
            52,

            `NÍVEL ${player.level}`,

            "#f3d98b",

            1.3

        );


        spawnRadialParticles(

            player.x,

            player.y,

            "#f2d287",

            22,

            140

        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(

                `Nível ${player.level}! +${totalPoints} ponto${totalPoints === 1 ? "" : "s"} de status.`

            );

        }

    }


    /* =========================================================
       STATUS
       ========================================================= */

    function canAllocateStat(
        statId
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.statPoints <=
                0
        ) {

            return false;

        }


        if (
            !STAT_CONFIG[
                statId
            ]
        ) {

            return false;

        }


        return (

            finiteNumber(
                player.stats[
                    statId
                ],
                0
            ) <

            STAT_CAP

        );

    }


    function allocateStatPoint(
        statId
    ) {

        const player =
            state.player;


        if (
            !canAllocateStat(
                statId
            )
        ) {

            return false;

        }


        player.stats[
            statId
        ] =

            finiteNumber(
                player.stats[
                    statId
                ],
                0
            ) +

            1;


        player.statPoints--;


        recalculatePlayerStats();


        if (
            typeof updateHUD ===
            "function"
        ) {

            updateHUD();

        }


        return true;

    }


    /* =========================================================
       RECURSOS DO PLAYER
       ========================================================= */

    function canSpendPlayerResource(
        type,
        amount
    ) {

        const player =
            state.player;


        if (!player) {

            return false;

        }


        if (
            type ===
            "magic"
        ) {

            if (
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteMagic
            ) {

                return true;

            }


            return (
                player.magic >=
                amount
            );

        }


        if (
            type ===
            "energy"
        ) {

            if (
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteEnergy
            ) {

                return true;

            }


            return (
                player.energy >=
                amount
            );

        }


        return false;

    }


    function spendPlayerResource(
        type,
        amount
    ) {

        if (
            !canSpendPlayerResource(
                type,
                amount
            )
        ) {

            return false;

        }


        if (
            type ===
            "magic"
        ) {

            if (
                !(
                    state.dev
                        ?.unlocked &&
                    state.dev
                        .infiniteMagic
                )
            ) {

                state.player.magic =
                    Math.max(
                        0,
                        state.player.magic -
                        amount
                    );

            }


            return true;

        }


        if (
            type ===
            "energy"
        ) {

            if (
                !(
                    state.dev
                        ?.unlocked &&
                    state.dev
                        .infiniteEnergy
                )
            ) {

                state.player.energy =
                    Math.max(
                        0,
                        state.player.energy -
                        amount
                    );

            }


            return true;

        }


        return false;

    }


    function getPlayerAttackPower() {

        return devModifyOutgoingDamage(

            Math.max(
                1,
                finiteNumber(
                    state.player
                        ?.damage,
                    1
                )
            )

        );

    }


    function getPlayerDefense() {

        return Math.max(
            0,
            finiteNumber(
                state.player
                    ?.defense,
                0
            )
        );

    }


    /* =========================================================
       EQUIPAMENTO
       ========================================================= */

    function isEquippedItem(
        id
    ) {

        const equipment =
            state.player
                ?.equipment;


        if (!equipment) {

            return false;

        }


        return (

            equipment.weapon ===
                id ||

            equipment.armor ===
                id ||

            equipment.tool ===
                id

        );

    }


    function equipInventoryItem(
        id
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (
            !player ||
            !item ||
            getRealItemCount(
                id
            ) <=
                0
        ) {

            return false;

        }


        if (
            item.category ===
            "weapons"
        ) {

            player.equipment.weapon =
                id;


            recalculatePlayerStats();


            return true;

        }


        if (
            item.category ===
            "armor"
        ) {

            const tier =
                getArmorTier(
                    id
                );


            if (
                tier <=
                0
            ) {

                return false;

            }


            /*
                Evita voltar para armadura
                antiga depois de a progressão
                já ter avançado.
            */
            if (
                tier <
                getHighestOwnedArmorTier()
            ) {

                if (
                    typeof showToast ===
                    "function"
                ) {

                    showToast(
                        "Você já possui uma armadura de nível superior."
                    );

                }


                return false;

            }


            player.equipment.armor =
                id;


            player.armorHighestTierEver =
                Math.max(

                    finiteNumber(
                        player.armorHighestTierEver,
                        0
                    ),

                    tier

                );


            recalculatePlayerStats();


            return true;

        }


        if (
            item.category ===
            "tools"
        ) {

            player.equipment.tool =
                id;


            return true;

        }


        return false;

    }


    /* =========================================================
       POÇÕES / COMIDA
       ========================================================= */

    function getPotionBuffCount() {

        return (
            state.player
                ?.activePotionBuffs
                ?.length ||
            0
        );

    }


    function canUsePotionBuff(
        type
    ) {

        const buffs =
            state.player
                ?.activePotionBuffs ||
            [];


        if (
            buffs.some(
                buff =>
                    buff.type ===
                    type
            )
        ) {

            return false;

        }


        return (
            buffs.length <
            MAX_ACTIVE_POTION_BUFFS
        );

    }


    function activatePotionBuff(
        item
    ) {

        const player =
            state.player;


        if (
            !player ||
            !item.buff
        ) {

            return false;

        }


        if (
            !canUsePotionBuff(
                item.buff
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Você já possui dois efeitos de poção ativos ou esse efeito já está ativo."
                );

            }


            return false;

        }


        player.activePotionBuffs.push({

            type:
                item.buff,

            timer:
                item.duration,

            duration:
                item.duration,

            multiplier:
                item.multiplier ||
                1,

            speedMultiplier:
                item.speedMultiplier ||
                1,

            defenseBonus:
                item.defenseBonus ||
                0

        });


        recalculatePlayerStats();


        return true;

    }


    function activateInventoryItem(
        id
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (
            !player ||
            !item ||
            getRealItemCount(
                id
            ) <=
                0
        ) {

            return false;

        }


        if (
            item.category ===
            "food"
        ) {

            if (
                player.hunger >=
                    player.maxHunger &&
                (
                    !item.fatigue ||
                    player.fatigue >=
                        player.maxFatigue
                )
            ) {

                return false;

            }


            if (
                !removeItem(
                    id,
                    1
                )
            ) {

                return false;

            }


            player.hunger =
                Math.min(

                    player.maxHunger,

                    player.hunger +
                    finiteNumber(
                        item.hunger,
                        0
                    )

                );


            player.fatigue =
                Math.min(

                    player.maxFatigue,

                    player.fatigue +
                    finiteNumber(
                        item.fatigue,
                        0
                    )

                );


            return true;

        }


        if (
            item.category ===
            "potions"
        ) {

            if (
                item.buff
            ) {

                if (
                    !activatePotionBuff(
                        item
                    )
                ) {

                    return false;

                }


                return removeItem(
                    id,
                    1
                );

            }


            let useful =
                false;


            if (
                item.heal &&
                player.hp <
                    player.maxHp
            ) {

                player.hp =
                    Math.min(

                        player.maxHp,

                        player.hp +
                        item.heal

                    );


                useful =
                    true;

            }


            if (
                item.energy &&
                player.energy <
                    player.maxEnergy
            ) {

                player.energy =
                    Math.min(

                        player.maxEnergy,

                        player.energy +
                        item.energy

                    );


                useful =
                    true;

            }


            if (!useful) {

                return false;

            }


            return removeItem(
                id,
                1
            );

        }


        if (
            item.category ===
                "weapons" ||
            item.category ===
                "armor" ||
            item.category ===
                "tools"
        ) {

            return equipInventoryItem(
                id
            );

        }


        if (
            id ===
            "flautaMemoria"
        ) {

            if (
                typeof playMemoryFlute ===
                "function"
            ) {

                return playMemoryFlute();

            }


            return false;

        }


        return false;

    }


    function inventoryPrimaryAction(
        id
    ) {

        return activateInventoryItem(
            id
        );

    }


    function updatePotionBuffs(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            !Array.isArray(
                player.activePotionBuffs
            )
        ) {

            return;

        }


        let changed =
            false;


        for (
            const buff of
            player.activePotionBuffs
        ) {

            buff.timer -=
                dt;

        }


        const previousLength =
            player.activePotionBuffs
                .length;


        player.activePotionBuffs =
            player.activePotionBuffs
                .filter(
                    buff =>
                        buff.timer >
                        0
                );


        if (
            player.activePotionBuffs
                .length !==
            previousLength
        ) {

            changed =
                true;

        }


        if (changed) {

            recalculatePlayerStats();

        }

    }


    /* =========================================================
       BUFFS DAS CLASSES
       ========================================================= */

    function updateClassBuffs(
        dt
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        if (
            player.ironGuard
        ) {

            player.ironGuard.timer -=
                dt;


            if (
                player.ironGuard.timer <=
                0
            ) {

                player.ironGuard =
                    null;

            }

        }


        if (
            player.adaptiveBuff
        ) {

            player.adaptiveBuff.timer -=
                dt;


            if (
                player.adaptiveBuff.timer <=
                0
            ) {

                player.adaptiveBuff =
                    null;


                recalculatePlayerStats();

            }

        }

    }


    /* =========================================================
       MOVIMENTO
       ========================================================= */

    function isGateBlockingPosition(
        x,
        y,
        radius
    ) {

        if (
            !state.world
        ) {

            return false;

        }


        for (
            const gate of
            state.world.gates
        ) {

            if (
                gate.opened ||
                gate.animation >=
                    0.82
            ) {

                continue;

            }


            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    gate
                )
            ) {

                return true;

            }

        }


        return false;

    }


    function getBlockingDarknessBarrier(
        x,
        y,
        radius
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        for (
            const barrier of
            state.world
                .darknessBarriers
        ) {

            if (
                barrier.requiresLantern &&
                state.player
                    ?.lanternOwned
            ) {

                continue;

            }


            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    barrier
                )
            ) {

                return barrier;

            }

        }


        return null;

    }


    function canPlayerMoveTo(
        x,
        y,
        radius =
            state.player
                ?.radius ||
            18
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        if (
            state.houseMode
        ) {

            return !isInteriorPositionBlocked(
                x,
                y,
                radius
            );

        }


        const barrier =
            getBlockingDarknessBarrier(
                x,
                y,
                radius
            );


        if (barrier) {

            const now =
                performance.now();


            if (
                now -
                finiteNumber(
                    state.darknessWarningAt,
                    0
                ) >
                1800
            ) {

                state.darknessWarningAt =
                    now;


                if (
                    typeof showToast ===
                    "function"
                ) {

                    showToast(
                        barrier.message ||
                        GAME_CONFIG
                            .darknessBarrierMessage
                    );

                }

            }


            return false;

        }


        if (
            isGateBlockingPosition(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        return !isCircleBlockedByWorld(

            x,
            y,
            radius,

            {
                ignoreDarknessBarrier:
                    true
            }

        );

    }


    function getPlayerMoveSpeed() {

        const player =
            state.player;


        if (!player) {

            return 0;

        }


        let speed =

            state.houseMode

                ? Math.min(
                    player.speed,
                    145
                )

                : player.speed;


        if (
            player.movementSlowTimer >
            0
        ) {

            speed *=
                clamp(
                    player.movementSlowMultiplier,
                    0.3,
                    1
                );

        }


        /*
            Mantém a penalidade antiga
            abaixo de 20 de fome/cansaço.
        */

        if (
            !state.houseMode &&
            player.hunger <=
                SURVIVAL_CONFIG
                    .lowHungerThreshold
        ) {

            speed *=
                SURVIVAL_CONFIG
                    .lowResourceMoveMultiplier;

        }


        if (
            !state.houseMode &&
            player.fatigue <=
                SURVIVAL_CONFIG
                    .lowFatigueThreshold
        ) {

            speed *=
                SURVIVAL_CONFIG
                    .lowResourceMoveMultiplier;

        }


        return Math.max(
            20,
            speed
        );

    }


    function movePlayerBy(
        dx,
        dy
    ) {

        const player =
            state.player;


        if (!player) {

            return false;

        }


        let moved =
            false;


        const nextX =
            player.x +
            dx;


        if (
            canPlayerMoveTo(
                nextX,
                player.y,
                player.radius
            )
        ) {

            player.x =
                nextX;


            moved =
                true;

        }


        const nextY =
            player.y +
            dy;


        if (
            canPlayerMoveTo(
                player.x,
                nextY,
                player.radius
            )
        ) {

            player.y =
                nextY;


            moved =
                true;

        }


        return moved;

    }


    function updatePlayerMovement(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            player.resting
                ?.active
        ) {

            return;

        }


        /*
            Dash / rush controlam movimento
            separadamente.
        */

        if (
            player.playerDash
                ?.active ||
            player.zephyrDash
                ?.active ||
            player.guardianRush
                ?.active
        ) {

            return;

        }


        const direction =
            getMovementDirection();


        if (
            direction.length <=
            0
        ) {

            return;

        }


        updatePlayerFacing(
            direction.x,
            direction.y
        );


        const speed =
            getPlayerMoveSpeed();


        const moved =
            movePlayerBy(

                direction.x *
                speed *
                dt,

                direction.y *
                speed *
                dt

            );


        if (moved) {

            player.walkTime +=

                dt *

                GAME_CONFIG
                    .walkAnimationSpeed;

        }

    }


    /* =========================================================
       DESCANSO
       ========================================================= */

    function canPlayerRest() {

        return Boolean(

            state.player &&

            state.houseMode &&

            state.currentHouse
                ?.id ===
                "home" &&

            !state.player
                .dead

        );

    }


    function startPlayerRest() {

        const player =
            state.player;


        if (
            !canPlayerRest() ||
            player.resting
                ?.active
        ) {

            return false;

        }


        player.resting = {

            active:
                true,

            timer:
                GAME_CONFIG
                    .restAnimationSeconds,

            duration:
                GAME_CONFIG
                    .restAnimationSeconds

        };


        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "rest"
                    ),

                type:
                    "rest",

                x:
                    player.x,

                y:
                    player.y,

                timer:
                    GAME_CONFIG
                        .restAnimationSeconds,

                duration:
                    GAME_CONFIG
                        .restAnimationSeconds

            });


        return true;

    }


    function updatePlayerRest(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
                ?.resting
                ?.active
        ) {

            return;

        }


        player.resting.timer -=
            dt;


        if (
            player.resting.timer >
            0
        ) {

            return;

        }


        player.resting.active =
            false;


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
       SOBREVIVÊNCIA
       ========================================================= */

    function updateSurvival(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            state.houseMode ||
            player.resting
                ?.active
        ) {

            maintainDevInfiniteResources();

            return;

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteHunger
            )
        ) {

            player.hunger =
                clamp(

                    player.hunger -

                    SURVIVAL_CONFIG
                        .hungerDrainPerSecond *
                    dt,

                    0,

                    player.maxHunger

                );

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteFatigue
            )
        ) {

            player.fatigue =
                clamp(

                    player.fatigue -

                    SURVIVAL_CONFIG
                        .fatigueDrainPerSecond *
                    dt,

                    0,

                    player.maxFatigue

                );

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteMagic
            )
        ) {

            player.magic =
                clamp(

                    player.magic +

                    SURVIVAL_CONFIG
                        .magicRegenPerSecond *
                    dt,

                    0,

                    player.maxMagic

                );

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteEnergy
            )
        ) {

            player.energy =
                clamp(

                    player.energy +

                    SURVIVAL_CONFIG
                        .energyRegenPerSecond *
                    dt,

                    0,

                    player.maxEnergy

                );

        }


        /*
            Mantém a antiga perda lenta
            quando fome/cansaço chegam a zero.

            Não mata diretamente:
            para em 1 HP.
        */

        if (
            (
                player.hunger <=
                    0 ||
                player.fatigue <=
                    0
            ) &&
            !devShouldIgnorePlayerDamage()
        ) {

            player.hp =
                clamp(

                    player.hp -

                    SURVIVAL_CONFIG
                        .emptyNeedHpDrainPerSecond *
                    dt,

                    1,

                    player.maxHp

                );

        }


        const now =
            performance.now();


        if (
            now -
            finiteNumber(
                state.warnedNeedAt,
                0
            ) >
            7000
        ) {

            if (
                player.hunger <
                18
            ) {

                state.warnedNeedAt =
                    now;


                if (
                    typeof showToast ===
                    "function"
                ) {

                    showToast(
                        "Você está ficando com fome."
                    );

                }

            }

            else if (
                player.fatigue <
                18
            ) {

                state.warnedNeedAt =
                    now;


                if (
                    typeof showToast ===
                    "function"
                ) {

                    showToast(
                        "Você está cansado."
                    );

                }

            }

        }


        maintainDevInfiniteResources();

    }


    /* =========================================================
       HOLD E — COLETA
       ========================================================= */

    function getNearestCollectible() {

        const player =
            state.player;


        if (
            !player ||
            !state.world ||
            state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        /*
            ÁRVORES
        */

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

                    player.x,
                    player.y,

                    tree.x,
                    tree.y

                );


            if (
                d <=
                    GAME_CONFIG
                        .pickupDistance &&
                d <
                    bestDistance
            ) {

                best = {

                    type:
                        "tree",

                    id:
                        tree.id,

                    target:
                        tree,

                    itemId:
                        "madeira",

                    duration:
                        GAME_CONFIG
                            .treeHoldSeconds

                };


                bestDistance =
                    d;

            }

        }


        /*
            MINÉRIOS
        */

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

                    player.x,
                    player.y,

                    resource.x,
                    resource.y

                );


            if (
                d <=
                    GAME_CONFIG
                        .pickupDistance &&
                d <
                    bestDistance
            ) {

                best = {

                    type:
                        "resource",

                    id:
                        resource.id,

                    target:
                        resource,

                    itemId:
                        resource.type,

                    duration:
                        GAME_CONFIG
                            .resourceHoldSeconds

                };


                bestDistance =
                    d;

            }

        }


        return best;

    }


    function startHoldCollect(
        collectible =
            null
    ) {

        const target =
            collectible ||
            getNearestCollectible();


        if (
            !target ||
            !state.player
        ) {

            return false;

        }


        const config =
            COLLECTION_CONFIG[
                target.itemId
            ];


        if (!config) {

            return false;

        }


        if (
            !canSpendPlayerResource(
                "magic",
                config.magicCost
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Magia insuficiente para coletar."
                );

            }


            return false;

        }


        if (
            !canSpendPlayerResource(
                "energy",
                config.energyCost
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Energia insuficiente para coletar."
                );

            }


            return false;

        }


        state.holdAction = {

            type:
                target.type,

            targetId:
                target.id,

            itemId:
                target.itemId,

            timer:
                0,

            duration:
                target.duration

        };


        return true;

    }


    function cancelHoldCollect() {

        state.holdAction =
            null;

    }


    function findHoldTarget() {

        if (
            !state.holdAction ||
            !state.world
        ) {

            return null;

        }


        if (
            state.holdAction.type ===
            "tree"
        ) {

            return (

                state.world.trees
                    .find(
                        tree =>
                            tree.id ===
                            state.holdAction
                                .targetId
                    ) ||

                null

            );

        }


        return (

            state.world.resources
                .find(
                    resource =>
                        resource.id ===
                        state.holdAction
                            .targetId
                ) ||

            null

        );

    }


    function completeHoldCollection() {

        const action =
            state.holdAction;


        const player =
            state.player;


        const target =
            findHoldTarget();


        if (
            !action ||
            !player ||
            !target ||
            !target.alive
        ) {

            cancelHoldCollect();

            return false;

        }


        const config =
            COLLECTION_CONFIG[
                action.itemId
            ];


        if (!config) {

            cancelHoldCollect();

            return false;

        }


        if (
            !canSpendPlayerResource(
                "magic",
                config.magicCost
            ) ||
            !canSpendPlayerResource(
                "energy",
                config.energyCost
            )
        ) {

            cancelHoldCollect();

            return false;

        }


        const amount =

            action.type ===
            "tree"

                ? randomInt(
                    config.amountMin,
                    config.amountMax
                )

                : randomInt(
                    target.amountMin,
                    target.amountMax
                );


        if (
            !canCarryItem(
                action.itemId,
                amount
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Seu inventário está cheio."
                );

            }


            cancelHoldCollect();

            return false;

        }


        spendPlayerResource(
            "magic",
            config.magicCost
        );


        spendPlayerResource(
            "energy",
            config.energyCost
        );


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteHunger
            )
        ) {

            player.hunger =
                Math.max(
                    0,
                    player.hunger -
                    config.hungerCost
                );

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteFatigue
            )
        ) {

            player.fatigue =
                Math.max(
                    0,
                    player.fatigue -
                    config.fatigueCost
                );

        }


        addItem(
            action.itemId,
            amount,
            {
                silent:
                    true
            }
        );


        target.alive =
            false;


        target.respawnTimer =
            config.respawn;


        gainXP(
            config.xp
        );


        spawnRadialParticles(

            target.x,

            target.y,

            action.type ===
                "tree"
                    ? "#a78354"
                    : getResourceColor(
                        action.itemId
                    ),

            12,

            85

        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(

                `+${amount} ${ITEMS[action.itemId]?.name || action.itemId}`

            );

        }


        cancelHoldCollect();


        return true;

    }


    function updateHoldCollection(
        dt
    ) {

        const action =
            state.holdAction;


        const player =
            state.player;


        if (
            !action ||
            !player
        ) {

            return;

        }


        /*
            SOLTOU E = PARA.
        */

        if (
            !state.keys.has(
                "KeyE"
            )
        ) {

            cancelHoldCollect();

            return;

        }


        const target =
            findHoldTarget();


        if (
            !target ||
            !target.alive
        ) {

            cancelHoldCollect();

            return;

        }


        const d =
            distance(

                player.x,
                player.y,

                target.x,
                target.y

            );


        if (
            d >
            GAME_CONFIG
                .pickupDistance +
                18
        ) {

            cancelHoldCollect();

            return;

        }


        action.timer +=
            dt;


        if (
            action.timer >=
            action.duration
        ) {

            completeHoldCollection();

        }

    }


    function updateResources(
        dt
    ) {

        if (
            !state.world
        ) {

            return;

        }


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

                tree.alive =
                    true;


                tree.respawnTimer =
                    0;

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

                resource.alive =
                    true;


                resource.respawnTimer =
                    0;

            }

        }

    }


    /* =========================================================
       PARTÍCULAS / EFEITOS
       ========================================================= */

    function spawnParticle(
        config
    ) {

        if (
            !state.world
        ) {

            return;

        }


        state.world.particles.push({

            id:
                uid(
                    "particle"
                ),

            x:
                config.x,

            y:
                config.y,

            vx:
                config.vx ||
                0,

            vy:
                config.vy ||
                0,

            gravity:
                config.gravity ||
                0,

            color:
                config.color ||
                "#ffffff",

            radius:
                config.radius ||
                2,

            life:
                config.life ||
                0.6,

            maxLife:
                config.life ||
                0.6

        });

    }


    function spawnRadialParticles(
        x,
        y,
        color,
        count =
            10,
        speed =
            90
    ) {

        for (
            let index = 0;
            index < count;
            index++
        ) {

            const angle =
                random(
                    0,
                    Math.PI *
                    2
                );


            const velocity =
                random(
                    speed *
                    0.35,
                    speed
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
                    velocity,

                vy:
                    Math.sin(
                        angle
                    ) *
                    velocity,

                gravity:
                    random(
                        0,
                        25
                    ),

                color,

                radius:
                    random(
                        1.5,
                        3.8
                    ),

                life:
                    random(
                        0.25,
                        0.75
                    )

            });

        }

    }


    function spawnFloatingText(
        x,
        y,
        text,
        color =
            "#ffffff",
        duration =
            1
    ) {

        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "floating"
                    ),

                type:
                    "floatingText",

                x,
                y,

                text,

                color,

                timer:
                    duration,

                duration

            });

    }


    function spawnAttackFlash(
        x,
        y,
        color,
        radius =
            20
    ) {

        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "attack_flash"
                    ),

                type:
                    "attackFlash",

                x,
                y,

                color,

                radius,

                timer:
                    0.18,

                duration:
                    0.18

            });

    }


    function spawnGroundRing(
        x,
        y,
        radius,
        color,
        duration =
            0.4
    ) {

        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "ground_ring"
                    ),

                type:
                    "groundRing",

                x,
                y,

                radius,

                color,

                timer:
                    duration,

                duration

            });

    }


    function spawnSlashEffect(
        config
    ) {

        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "slash"
                    ),

                type:
                    config.type ||
                    "arc",

                x:
                    config.x,

                y:
                    config.y,

                directionX:
                    config.directionX,

                directionY:
                    config.directionY,

                range:
                    config.range,

                arc:
                    config.arc,

                offset:
                    config.offset ||
                    0,

                color:
                    config.color,

                timer:
                    config.duration ||
                    0.24,

                duration:
                    config.duration ||
                    0.24

            });

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


            particle.vy +=
                particle.gravity *
                dt;


            particle.x +=
                particle.vx *
                dt;


            particle.y +=
                particle.vy *
                dt;


            particle.vx *=
                Math.pow(
                    0.08,
                    dt
                );

        }


        state.world.particles =
            state.world.particles
                .filter(
                    particle =>
                        particle.life >
                        0
                );

    }


    function updateGameplayEffects(
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

            if (
                effect.logicalArea
            ) {

                continue;

            }


            effect.timer -=
                dt;

        }


        state.world.effects =
            state.world.effects
                .filter(
                    effect =>
                        effect.logicalArea ||
                        effect.timer >
                            0
                );

    }


    /* =========================================================
       SANGUE
       ========================================================= */

    function createBloodMark(
        x,
        y,
        intensity =
            1
    ) {

        while (
            state.bloodMarks.length >=
            MAX_BLOOD_MARKS
        ) {

            state.bloodMarks.shift();

        }


        const life =
            random(

                VISUAL_CONFIG
                    .blood
                    .markLifeMin,

                VISUAL_CONFIG
                    .blood
                    .markLifeMax

            );


        state.bloodMarks.push({

            x:
                x +
                random(
                    -12,
                    12
                ),

            y:
                y +
                random(
                    -8,
                    8
                ),

            radius:
                random(

                    VISUAL_CONFIG
                        .blood
                        .markMin,

                    VISUAL_CONFIG
                        .blood
                        .markMax

                ) *
                intensity,

            stretch:
                random(
                    1,
                    2.3
                ),

            angle:
                random(
                    0,
                    Math.PI *
                    2
                ),

            life,

            maxLife:
                life

        });

    }


    function updateBloodEffects(
        dt
    ) {

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


        state.damageFlash =
            Math.max(
                0,
                state.damageFlash -
                dt *
                1.7
            );

    }


    /* =========================================================
       BUSCA DE INIMIGOS
       ========================================================= */

    function getLivingEnemies() {

        return (
            state.world
                ?.enemies
                ?.filter(
                    enemy =>
                        !enemy.dead
                ) ||
            []
        );

    }


    function getEnemiesInRadius(
        x,
        y,
        radius
    ) {

        return getLivingEnemies()
            .filter(
                enemy =>

                    distance(
                        x,
                        y,
                        enemy.x,
                        enemy.y
                    ) <=

                    radius +
                    enemy.radius
            );

    }


    function getEnemiesInArc(
        x,
        y,
        directionX,
        directionY,
        range,
        arc
    ) {

        const directionAngle =
            Math.atan2(
                directionY,
                directionX
            );


        return getLivingEnemies()
            .filter(
                enemy => {

                    const dx =
                        enemy.x -
                        x;


                    const dy =
                        enemy.y -
                        y;


                    const d =
                        Math.hypot(
                            dx,
                            dy
                        );


                    if (
                        d >
                        range +
                        enemy.radius
                    ) {

                        return false;

                    }


                    const angle =
                        Math.atan2(
                            dy,
                            dx
                        );


                    let difference =
                        angle -
                        directionAngle;


                    while (
                        difference >
                        Math.PI
                    ) {

                        difference -=
                            Math.PI *
                            2;

                    }


                    while (
                        difference <
                        -Math.PI
                    ) {

                        difference +=
                            Math.PI *
                            2;

                    }


                    return (

                        Math.abs(
                            difference
                        ) <=
                        arc /
                        2

                    );

                }
            );

    }


    function findEnemiesAtArea(
        x,
        y,
        radius,
        exclude =
            null
    ) {

        return getLivingEnemies()
            .filter(
                enemy => {

                    if (
                        exclude &&
                        exclude.has(
                            enemy.id
                        )
                    ) {

                        return false;

                    }


                    return circleCircleCollision(

                        x,
                        y,
                        radius,

                        enemy.x,
                        enemy.y,
                        enemy.radius

                    );

                }
            );

    }


    /* =========================================================
       PROGRESSÃO BOSS — NÃO TOMAR DANO ANTES DE ACEITAR
       ========================================================= */

    function ensureBossAcceptedBeforeDamage(
        enemy
    ) {

        if (
            !enemy ||
            enemy.type !==
                "progression" ||
            enemy.accepted
        ) {

            return true;

        }


        if (
            typeof openBattleConfirmation ===
            "function"
        ) {

            openBattleConfirmation(
                enemy
            );

        }


        return false;

    }


    /* =========================================================
       DANO NO INIMIGO
       ========================================================= */

    function damageEnemy(
        enemy,
        rawDamage,
        options = {}
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return false;

        }


        if (
            !ensureBossAcceptedBeforeDamage(
                enemy
            )
        ) {

            return false;

        }


        const poweredDamage =

            options.ignoreDev

                ? rawDamage

                : devModifyOutgoingDamage(
                    rawDamage
                );


        const defense =
            Math.max(
                0,
                finiteNumber(
                    enemy.defense,
                    0
                )
            );


        const damage =
            Math.max(

                PLAYER_COMBAT_CONFIG
                    .minimumDamage,

                poweredDamage -

                defense *
                PLAYER_COMBAT_CONFIG
                    .damageReductionPerDefense

            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp -
                damage
            );


        enemy.hitFlash =
            0.16;


        enemy.aggressive =
            true;


        if (
            enemy.type ===
            "progression"
        ) {

            enemy.accepted =
                true;

        }


        spawnRadialParticles(

            enemy.x,

            enemy.y,

            enemy.color ||
            "#9f3138",

            7,

            75

        );


        createBloodMark(
            enemy.x,
            enemy.y,
            enemy.type ===
                "progression"
                    ? 1.25
                    : 0.8
        );


        if (
            enemy.hp <=
            0
        ) {

            defeatEnemy(
                enemy
            );

        }


        return true;

    }


    /* =========================================================
       DERROTA DE INIMIGO
       ========================================================= */

    function defeatEnemy(
        enemy
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


        enemy.telegraph =
            null;


        gainXP(
            enemy.xp ||
            0
        );


        addMoney(
            enemy.money ||
            0
        );


        if (
            enemy.drop &&
            enemy.dropAmount >
                0
        ) {

            addItem(

                enemy.drop,

                enemy.dropAmount,

                {
                    silent:
                        true
                }

            );

        }


        spawnRadialParticles(

            enemy.x,

            enemy.y,

            enemy.aura ||
            enemy.color ||
            "#ffffff",

            enemy.type ===
                "progression"
                    ? 28
                    : 14,

            enemy.type ===
                "progression"
                    ? 180
                    : 110

        );


        if (
            enemy.type ===
            "progression"
        ) {

            if (
                !state.player
                    .defeatedBosses
                    .includes(
                        enemy.id
                    )
            ) {

                state.player
                    .defeatedBosses
                    .push(
                        enemy.id
                    );

            }


            if (
                enemy.id ===
                "monarch"
            ) {

                state.player.monarchDefeated =
                    true;

            }


            if (
                enemy.unlock &&
                !state.player
                    .unlockedAreas
                    .includes(
                        enemy.unlock
                    )
            ) {

                state.player
                    .unlockedAreas
                    .push(
                        enemy.unlock
                    );

            }


            if (
                typeof handleProgressionBossDefeat ===
                "function"
            ) {

                handleProgressionBossDefeat(
                    enemy
                );

            }

        }


        if (
            enemy.bossType ===
            "resourceBoss"
        ) {

            enemy.respawnTimer =
                120;

        }

    }


    /* =========================================================
       ATAQUE BÁSICO

       1 CLICK = 1 ATAQUE.

       O mouse segurado NÃO chama esta função
       novamente sozinho.
       ========================================================= */

    function performBasicAttack() {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            state.paused ||
            state.dialogue ||
            state.travel ||
            state.battle ||
            player.resting
                ?.active
        ) {

            return false;

        }


        if (
            player.attackCooldown >
            0
        ) {

            return false;

        }


        const character =
            currentCharacter();


        const attack =
            character.basicAttack;


        const energyCost =

            PLAYER_COMBAT_CONFIG
                .basicAttackEnergy[
                    character.id
                ] ||
            5;


        if (
            !spendPlayerResource(
                "energy",
                energyCost
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Energia insuficiente."
                );

            }


            return false;

        }


        player.attackCooldown =
            GAME_CONFIG
                .baseAttackCooldown;


        drainAttackSurvival();


        const direction =
            pointerDirectionFromPlayer();


        updatePlayerFacing(
            direction.x,
            direction.y
        );


        switch (
            attack.type
        ) {

            case "projectile":

                spawnPlayerProjectile({

                    x:
                        player.x +
                        direction.x *
                        24,

                    y:
                        player.y +
                        direction.y *
                        24,

                    vx:
                        direction.x *
                        attack.speed,

                    vy:
                        direction.y *
                        attack.speed,

                    radius:
                        attack.radius,

                    hitRadius:
                        attack.hitRadius,

                    range:
                        attack.range,

                    damage:
                        getPlayerAttackPower() *
                        attack.damageMultiplier,

                    color:
                        attack.color,

                    secondaryColor:
                        attack.secondaryColor

                });


                spawnAttackFlash(

                    player.x +
                    direction.x *
                    24,

                    player.y +
                    direction.y *
                    24,

                    attack.color,

                    24

                );

                break;


            case "arc":

                performPlayerArcAttack(
                    direction,
                    attack
                );

                break;


            case "smash":

                performPlayerSmash(
                    direction,
                    attack
                );

                break;


            case "doubleSlash":

                performPlayerDoubleSlash(
                    direction,
                    attack
                );

                break;

        }


        return true;

    }


    function drainAttackSurvival() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteHunger
            )
        ) {

            player.hunger =
                Math.max(

                    0,

                    player.hunger -
                    PLAYER_COMBAT_CONFIG
                        .hungerPerAttack

                );

        }


        if (
            !(
                state.dev
                    ?.unlocked &&
                state.dev
                    .infiniteFatigue
            )
        ) {

            player.fatigue =
                Math.max(

                    0,

                    player.fatigue -
                    PLAYER_COMBAT_CONFIG
                        .fatiguePerAttack

                );

        }

    }


    function performPlayerArcAttack(
        direction,
        attack
    ) {

        const player =
            state.player;


        spawnSlashEffect({

            type:
                "arc",

            x:
                player.x,

            y:
                player.y,

            directionX:
                direction.x,

            directionY:
                direction.y,

            range:
                attack.range,

            arc:
                attack.arc,

            color:
                attack.color,

            duration:
                0.22

        });


        const enemies =
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                attack.range +
                attack.hitRadius,

                attack.arc

            );


        for (
            const enemy of
            enemies
        ) {

            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                attack.damageMultiplier

            );

        }

    }


    function performPlayerSmash(
        direction,
        attack
    ) {

        const player =
            state.player;


        const impactX =

            player.x +

            direction.x *
            attack.range *
            0.55;


        const impactY =

            player.y +

            direction.y *
            attack.range *
            0.55;


        spawnGroundRing(

            impactX,
            impactY,

            attack.hitRadius,

            attack.color,

            0.34

        );


        spawnRadialParticles(

            impactX,
            impactY,

            attack.secondaryColor,

            18,

            125

        );


        state.screenShake =
            0.16;


        state.screenShakePower =
            5;


        for (
            const enemy of
            getEnemiesInRadius(
                impactX,
                impactY,
                attack.hitRadius
            )
        ) {

            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                attack.damageMultiplier

            );

        }

    }


    function performPlayerDoubleSlash(
        direction,
        attack
    ) {

        const player =
            state.player;


        for (
            let index = 0;
            index < 2;
            index++
        ) {

            spawnSlashEffect({

                type:
                    "riftSlash",

                x:
                    player.x,

                y:
                    player.y,

                directionX:
                    direction.x,

                directionY:
                    direction.y,

                range:
                    attack.range,

                arc:
                    attack.arc,

                offset:
                    index ===
                        0
                            ? -9
                            : 9,

                color:
                    attack.color,

                duration:
                    0.25 +
                    index *
                    0.03

            });

        }


        for (
            const enemy of
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                attack.range +
                attack.hitRadius,

                attack.arc

            )
        ) {

            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                attack.damageMultiplier

            );

        }

    }


    /* =========================================================
       PROJÉTEIS DO PLAYER
       ========================================================= */

    function spawnPlayerProjectile(
        config
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        const projectile = {

            id:
                uid(
                    "player_projectile"
                ),

            x:
                config.x,

            y:
                config.y,

            startX:
                config.x,

            startY:
                config.y,

            vx:
                config.vx,

            vy:
                config.vy,

            radius:
                config.radius ||
                7,

            hitRadius:
                config.hitRadius ||
                config.radius ||
                7,

            range:
                config.range ||
                300,

            damage:
                config.damage ||
                1,

            color:
                config.color ||
                "#ffffff",

            secondaryColor:
                config.secondaryColor ||
                "#ffffff",

            dead:
                false,

            hitIds:
                new Set(),

            life:
                config.life ||
                2

        };


        state.world
            .projectiles
            .push(
                projectile
            );


        return projectile;

    }


    function updatePlayerProjectiles(
        dt
    ) {

        if (
            !state.world
        ) {

            return;

        }


        for (
            const projectile of
            state.world.projectiles
        ) {

            if (
                projectile.dead
            ) {

                continue;

            }


            projectile.life -=
                dt;


            const movement =

                Math.hypot(
                    projectile.vx,
                    projectile.vy
                ) *

                dt;


            const steps =
                Math.max(

                    1,

                    Math.ceil(
                        movement /
                        8
                    )

                );


            const stepX =

                projectile.vx *
                dt /
                steps;


            const stepY =

                projectile.vy *
                dt /
                steps;


            for (
                let step = 0;
                step < steps;
                step++
            ) {

                projectile.x +=
                    stepX;


                projectile.y +=
                    stepY;


                if (
                    isCircleBlockedByWorld(

                        projectile.x,
                        projectile.y,

                        projectile.radius,

                        {
                            ignoreDarknessBarrier:
                                true
                        }

                    )
                ) {

                    projectile.dead =
                        true;


                    spawnRadialParticles(

                        projectile.x,
                        projectile.y,

                        projectile.color,

                        6,

                        55

                    );


                    break;

                }


                const targets =
                    findEnemiesAtArea(

                        projectile.x,
                        projectile.y,

                        projectile.hitRadius,

                        projectile.hitIds

                    );


                if (
                    targets.length >
                    0
                ) {

                    const target =
                        targets[0];


                    if (
                        !ensureBossAcceptedBeforeDamage(
                            target
                        )
                    ) {

                        projectile.dead =
                            true;

                        break;

                    }


                    projectile.hitIds.add(
                        target.id
                    );


                    damageEnemy(
                        target,
                        projectile.damage
                    );


                    spawnRadialParticles(

                        projectile.x,
                        projectile.y,

                        projectile.secondaryColor,

                        8,

                        85

                    );


                    projectile.dead =
                        true;


                    break;

                }

            }


            if (
                distance(

                    projectile.startX,
                    projectile.startY,

                    projectile.x,
                    projectile.y

                ) >=
                projectile.range
            ) {

                projectile.dead =
                    true;

            }


            if (
                projectile.life <=
                0
            ) {

                projectile.dead =
                    true;

            }

        }


        state.world.projectiles =
            state.world.projectiles
                .filter(
                    projectile =>
                        !projectile.dead
                );

    }


    /* =========================================================
       ÁREAS ATRASADAS
       ========================================================= */

    function spawnDelayedAreaAttack(
        config
    ) {

        if (
            !state.world
        ) {

            return;

        }


        const playerSource =
            config.source ===
            "player";


        state.world.effects.push({

            id:
                uid(
                    "delayed_area"
                ),

            type:
                playerSource
                    ? "delayedPlayerArea"
                    : "delayedEnemyArea",

            logicalArea:
                true,

            x:
                config.x,

            y:
                config.y,

            radius:
                config.radius,

            innerRadius:
                config.innerRadius ||
                0,

            delay:
                config.delay,

            damage:
                config.damage,

            color:
                config.color,

            source:
                config.source,

            status:
                config.status ||
                null,

            triggered:
                false,

            timer:
                config.delay,

            duration:
                config.delay

        });

    }


    function triggerDelayedArea(
        effect
    ) {

        if (
            effect.source ===
            "player"
        ) {

            for (
                const enemy of
                getEnemiesInRadius(

                    effect.x,
                    effect.y,
                    effect.radius

                )
            ) {

                const d =
                    distance(

                        effect.x,
                        effect.y,

                        enemy.x,
                        enemy.y

                    );


                if (
                    effect.innerRadius >
                        0 &&
                    d <
                        effect.innerRadius
                ) {

                    continue;

                }


                damageEnemy(
                    enemy,
                    effect.damage
                );

            }

        }

        else {

            const player =
                state.player;


            if (
                player &&
                !player.dead
            ) {

                const d =
                    distance(

                        effect.x,
                        effect.y,

                        player.x,
                        player.y

                    );


                if (
                    d <=
                        effect.radius +
                        player.radius &&
                    (
                        effect.innerRadius <=
                            0 ||
                        d >=
                            effect.innerRadius
                    )
                ) {

                    damagePlayer(
                        effect.damage,
                        {
                            source:
                                effect.source
                        }
                    );


                    applyPlayerStatusFromEnemy(
                        effect.status
                    );

                }

            }

        }


        spawnGroundRing(

            effect.x,
            effect.y,

            effect.radius,

            effect.color,

            0.28

        );


        spawnRadialParticles(

            effect.x,
            effect.y,

            effect.color,

            16,

            120

        );


        effect.logicalArea =
            false;


        effect.triggered =
            true;


        effect.timer =
            0.28;


        effect.duration =
            0.28;

    }


    function updateDelayedAreas(
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

            if (
                !effect.logicalArea
            ) {

                continue;

            }


            effect.delay -=
                dt;


            effect.timer =
                Math.max(
                    0,
                    effect.delay
                );


            if (
                effect.delay <=
                0
            ) {

                triggerDelayedArea(
                    effect
                );

            }

        }

    }


    /* =========================================================
       SKILLS
       ========================================================= */

    function useClassSkill(
        slot
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            state.paused ||
            state.dialogue ||
            state.travel ||
            state.battle ||
            player.resting
                ?.active
        ) {

            return false;

        }


        const character =
            currentCharacter();


        const skill =
            CLASS_SKILLS[
                character.id
            ]?.[
                slot
            ];


        if (!skill) {

            return false;

        }


        if (
            finiteNumber(
                player.skillCooldowns[
                    slot
                ],
                0
            ) >
            0
        ) {

            return false;

        }


        if (
            !canSpendPlayerResource(
                skill.costType,
                skill.cost
            )
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


        const direction =
            pointerDirectionFromPlayer();


        updatePlayerFacing(
            direction.x,
            direction.y
        );


        let success =
            false;


        switch (
            skill.id
        ) {

            case "memoryRay":

                success =
                    skillMemoryRay(
                        direction
                    );

                break;


            case "arcaneCircle":

                success =
                    skillArcaneCircle();

                break;


            case "memoryExplosion":

                success =
                    skillMemoryExplosion(
                        direction
                    );

                break;


            case "guardianStrike":

                success =
                    skillGuardianStrike(
                        direction
                    );

                break;


            case "ironGuard":

                success =
                    skillIronGuard();

                break;


            case "guardianRush":

                success =
                    skillGuardianRush(
                        direction
                    );

                break;


            case "crushingBlow":

                success =
                    skillCrushingBlow(
                        direction
                    );

                break;


            case "stoneRoar":

                success =
                    skillStoneRoar();

                break;


            case "earthBreaker":

                success =
                    skillEarthBreaker();

                break;


            case "vitalLight":

                success =
                    skillVitalLight();

                break;


            case "fairyBurst":

                success =
                    skillFairyBurst(
                        direction
                    );

                break;


            case "starRain":

                success =
                    skillStarRain();

                break;


            case "adaptiveCut":

                success =
                    skillAdaptiveCut(
                        direction
                    );

                break;


            case "adaptiveForm":

                success =
                    skillAdaptiveForm();

                break;


            case "riftStep":

                success =
                    skillRiftStep(
                        direction
                    );

                break;

        }


        if (!success) {

            return false;

        }


        spendPlayerResource(
            skill.costType,
            skill.cost
        );


        player.skillCooldowns[
            slot
        ] =
            skill.cooldown;


        return true;

    }


    /* =========================================================
       KAELION
       ========================================================= */

    function skillMemoryRay(
        direction
    ) {

        const player =
            state.player;


        for (
            let index = -1;
            index <= 1;
            index++
        ) {

            const angle =

                Math.atan2(
                    direction.y,
                    direction.x
                ) +

                index *
                0.075;


            spawnPlayerProjectile({

                x:
                    player.x +
                    Math.cos(
                        angle
                    ) *
                    24,

                y:
                    player.y +
                    Math.sin(
                        angle
                    ) *
                    24,

                vx:
                    Math.cos(
                        angle
                    ) *
                    590,

                vy:
                    Math.sin(
                        angle
                    ) *
                    590,

                radius:
                    7,

                hitRadius:
                    17,

                range:
                    460,

                damage:
                    getPlayerAttackPower() *
                    0.66,

                color:
                    "#ef9545",

                secondaryColor:
                    "#ffd7a7"

            });

        }


        spawnRadialParticles(
            player.x,
            player.y,
            "#f0a35d",
            12,
            95
        );


        return true;

    }


    function skillArcaneCircle() {

        const player =
            state.player;


        const radius =
            125;


        spawnGroundRing(

            player.x,
            player.y,

            radius,

            "#ee984f",

            0.65

        );


        for (
            const enemy of
            getEnemiesInRadius(
                player.x,
                player.y,
                radius
            )
        ) {

            if (
                !ensureBossAcceptedBeforeDamage(
                    enemy
                )
            ) {

                continue;

            }


            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                1.12

            );


            enemy.slow =
                Math.max(
                    finiteNumber(
                        enemy.slow,
                        0
                    ),
                    1.1
                );

        }


        return true;

    }


    function skillMemoryExplosion(
        direction
    ) {

        const player =
            state.player;


        spawnDelayedAreaAttack({

            x:
                player.x +
                direction.x *
                150,

            y:
                player.y +
                direction.y *
                150,

            radius:
                105,

            delay:
                0.55,

            damage:
                getPlayerAttackPower() *
                1.65,

            color:
                "#f3a55b",

            source:
                "player"

        });


        return true;

    }


    /* =========================================================
       THERON
       ========================================================= */

    function skillGuardianStrike(
        direction
    ) {

        const player =
            state.player;


        spawnSlashEffect({

            type:
                "heavyArc",

            x:
                player.x,

            y:
                player.y,

            directionX:
                direction.x,

            directionY:
                direction.y,

            range:
                118,

            arc:
                Math.PI *
                0.95,

            color:
                "#e8ecee",

            duration:
                0.3

        });


        for (
            const enemy of
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                118,

                Math.PI *
                0.95

            )
        ) {

            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                1.35

            );

        }


        return true;

    }


    function skillIronGuard() {

        const player =
            state.player;


        player.ironGuard = {

            timer:
                4.5,

            damageReduction:
                0.45

        };


        spawnGroundRing(

            player.x,
            player.y,

            55,

            "#d7dcdf",

            0.55

        );


        return true;

    }


    function skillGuardianRush(
        direction
    ) {

        state.player.guardianRush = {

            active:
                true,

            x:
                direction.x,

            y:
                direction.y,

            timer:
                0.34,

            speed:
                470,

            damage:
                getPlayerAttackPower() *
                1.42,

            hitIds:
                new Set()

        };


        return true;

    }


    /* =========================================================
       GRUMGAR
       ========================================================= */

    function skillCrushingBlow(
        direction
    ) {

        const player =
            state.player;


        const impactX =
            player.x +
            direction.x *
            55;


        const impactY =
            player.y +
            direction.y *
            55;


        spawnGroundRing(

            impactX,
            impactY,

            80,

            "#8f8465",

            0.45

        );


        for (
            const enemy of
            getEnemiesInRadius(
                impactX,
                impactY,
                80
            )
        ) {

            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                1.55

            );

        }


        state.screenShake =
            0.2;


        state.screenShakePower =
            7;


        return true;

    }


    function skillStoneRoar() {

        const player =
            state.player;


        const radius =
            140;


        spawnGroundRing(

            player.x,
            player.y,

            radius,

            "#91a373",

            0.7

        );


        for (
            const enemy of
            getEnemiesInRadius(
                player.x,
                player.y,
                radius
            )
        ) {

            if (
                !ensureBossAcceptedBeforeDamage(
                    enemy
                )
            ) {

                continue;

            }


            enemy.stun =
                Math.max(

                    finiteNumber(
                        enemy.stun,
                        0
                    ),

                    enemy.type ===
                        "progression"

                        ? 0.35

                        : 1

                );


            const away =
                normalize(

                    enemy.x -
                    player.x,

                    enemy.y -
                    player.y

                );


            pushEnemy(

                enemy,

                away.x *
                28,

                away.y *
                28

            );

        }


        return true;

    }


    function skillEarthBreaker() {

        const player =
            state.player;


        for (
            let ring = 1;
            ring <= 3;
            ring++
        ) {

            spawnDelayedAreaAttack({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    65 +
                    ring *
                    48,

                innerRadius:

                    ring ===
                    1

                        ? 0

                        : 65 +
                          (
                              ring -
                              1
                          ) *
                          48,

                delay:
                    0.16 *
                    ring,

                damage:
                    getPlayerAttackPower() *
                    0.72,

                color:
                    "#8d8265",

                source:
                    "player"

            });

        }


        return true;

    }


    /* =========================================================
       LIRAEL
       ========================================================= */

    function skillVitalLight() {

        const player =
            state.player;


        if (
            player.hp >=
            player.maxHp
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Sua vida já está cheia."
                );

            }


            return false;

        }


        player.hp =
            Math.min(

                player.maxHp,

                player.hp +

                Math.max(
                    38,
                    player.maxHp *
                    0.3
                )

            );


        spawnRadialParticles(

            player.x,
            player.y,

            "#f5b6e3",

            24,

            115

        );


        state.world.effects.push({

            id:
                uid(
                    "vital_light"
                ),

            type:
                "vitalLight",

            x:
                player.x,

            y:
                player.y,

            timer:
                0.9,

            duration:
                0.9

        });


        return true;

    }


    function skillFairyBurst(
        direction
    ) {

        const player =
            state.player;


        for (
            let index = -2;
            index <= 2;
            index++
        ) {

            const angle =

                Math.atan2(
                    direction.y,
                    direction.x
                ) +

                index *
                0.11;


            spawnPlayerProjectile({

                x:
                    player.x,

                y:
                    player.y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    520,

                vy:
                    Math.sin(
                        angle
                    ) *
                    520,

                radius:
                    6,

                hitRadius:
                    15,

                range:
                    350,

                damage:
                    getPlayerAttackPower() *
                    0.43,

                color:
                    "#f3a8df",

                secondaryColor:
                    "#ffe1f5"

            });

        }


        return true;

    }


    function skillStarRain() {

        const player =
            state.player;


        const enemies =
            getLivingEnemies();


        const center =

            enemies.length >
            0

                ? enemies
                    .slice()
                    .sort(
                        (a, b) =>

                            distance(
                                player.x,
                                player.y,
                                a.x,
                                a.y
                            ) -

                            distance(
                                player.x,
                                player.y,
                                b.x,
                                b.y
                            )
                    )[0]

                : player;


        for (
            let index = 0;
            index < 7;
            index++
        ) {

            const angle =
                random(
                    0,
                    Math.PI *
                    2
                );


            const radius =
                random(
                    0,
                    120
                );


            spawnDelayedAreaAttack({

                x:
                    center.x +
                    Math.cos(
                        angle
                    ) *
                    radius,

                y:
                    center.y +
                    Math.sin(
                        angle
                    ) *
                    radius,

                radius:
                    46,

                delay:
                    0.28 +
                    index *
                    0.12,

                damage:
                    getPlayerAttackPower() *
                    0.58,

                color:
                    "#f0a9dd",

                source:
                    "player"

            });

        }


        return true;

    }


    /* =========================================================
       ZEPHYR
       ========================================================= */

    function skillAdaptiveCut(
        direction
    ) {

        const player =
            state.player;


        spawnSlashEffect({

            type:
                "riftSlash",

            x:
                player.x,

            y:
                player.y,

            directionX:
                direction.x,

            directionY:
                direction.y,

            range:
                125,

            arc:
                Math.PI *
                0.75,

            color:
                "#ad83df",

            duration:
                0.28

        });


        for (
            const enemy of
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                125,

                Math.PI *
                0.75

            )
        ) {

            damageEnemy(

                enemy,

                getPlayerAttackPower() *
                1.28

            );

        }


        return true;

    }


    function skillAdaptiveForm() {

        const player =
            state.player;


        if (
            player.adaptiveBuff
        ) {

            return false;

        }


        /*
            Temporário.
            Não cria atributo permanente de velocidade.
        */

        player.adaptiveBuff = {

            timer:
                6.5,

            damageMultiplier:
                1.18,

            speedMultiplier:
                1.12

        };


        recalculatePlayerStats();


        /*
            Aplica os multiplicadores após recálculo.
        */

        player.damage *=
            player.adaptiveBuff
                .damageMultiplier;


        player.speed *=
            player.adaptiveBuff
                .speedMultiplier;


        spawnGroundRing(

            player.x,
            player.y,

            62,

            "#a97bdd",

            0.65

        );


        return true;

    }


    function skillRiftStep(
        direction
    ) {

        const player =
            state.player;


        if (
            player.zephyrDash
                ?.active
        ) {

            return false;

        }


        player.zephyrDash = {

            active:
                true,

            x:
                direction.x,

            y:
                direction.y,

            timer:
                0.19,

            speed:
                610

        };


        return true;

    }


    /* =========================================================
       DASH UNIVERSAL
       ========================================================= */

    function attemptUniversalDash() {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            state.paused ||
            !player.abilities
                ?.dash
        ) {

            return false;

        }


        if (
            player.universalDashCooldown >
            0 ||
            player.playerDash
                ?.active
        ) {

            return false;

        }


        if (
            !spendPlayerResource(

                "energy",

                PLAYER_COMBAT_CONFIG
                    .universalDashEnergyCost

            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Energia insuficiente para usar o Dash."
                );

            }


            return false;

        }


        let direction =
            getMovementDirection();


        if (
            direction.length <=
            0
        ) {

            direction =
                pointerDirectionFromPlayer();

        }


        player.playerDash = {

            active:
                true,

            x:
                direction.x,

            y:
                direction.y,

            timer:
                PLAYER_COMBAT_CONFIG
                    .universalDashDuration,

            speed:
                PLAYER_COMBAT_CONFIG
                    .universalDashSpeed

        };


        player.universalDashCooldown =
            PLAYER_COMBAT_CONFIG
                .universalDashCooldown;


        updatePlayerFacing(
            direction.x,
            direction.y
        );


        return true;

    }


    function updateDashMovement(
        dash,
        dt,
        afterimageColor
    ) {

        const player =
            state.player;


        if (
            !player ||
            !dash
                ?.active
        ) {

            return false;

        }


        const movement =
            dash.speed *
            dt;


        const steps =
            Math.max(
                1,
                Math.ceil(
                    movement /
                    9
                )
            );


        const stepX =
            dash.x *
            movement /
            steps;


        const stepY =
            dash.y *
            movement /
            steps;


        for (
            let index = 0;
            index < steps;
            index++
        ) {

            const previousX =
                player.x;


            const previousY =
                player.y;


            if (
                !movePlayerBy(
                    stepX,
                    stepY
                )
            ) {

                dash.active =
                    false;

                break;

            }


            if (
                index %
                2 ===
                0
            ) {

                state.world
                    ?.effects
                    ?.push({

                        id:
                            uid(
                                "afterimage"
                            ),

                        type:
                            "afterimage",

                        x:
                            previousX,

                        y:
                            previousY,

                        color:
                            afterimageColor,

                        timer:
                            0.22,

                        duration:
                            0.22

                    });

            }

        }


        dash.timer -=
            dt;


        if (
            dash.timer <=
            0
        ) {

            dash.active =
                false;

        }


        return dash.active;

    }


    function updateUniversalDash(
        dt
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.universalDashCooldown =
            Math.max(

                0,

                finiteNumber(
                    player.universalDashCooldown,
                    0
                ) -
                dt

            );


        if (
            player.playerDash
                ?.active
        ) {

            updateDashMovement(

                player.playerDash,

                dt,

                "#d8cce8"

            );

        }

    }


    function updateZephyrCombatDash(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
                ?.zephyrDash
                ?.active
        ) {

            return;

        }


        updateDashMovement(

            player.zephyrDash,

            dt,

            "#a277d1"

        );

    }


    /* =========================================================
       INVESTIDA DE THERON
       ========================================================= */

    function updateGuardianRush(
        dt
    ) {

        const player =
            state.player;


        const rush =
            player
                ?.guardianRush;


        if (
            !rush
                ?.active
        ) {

            return;

        }


        const movement =
            rush.speed *
            dt;


        const steps =
            Math.max(
                1,
                Math.ceil(
                    movement /
                    8
                )
            );


        const stepX =
            rush.x *
            movement /
            steps;


        const stepY =
            rush.y *
            movement /
            steps;


        for (
            let index = 0;
            index < steps;
            index++
        ) {

            if (
                !movePlayerBy(
                    stepX,
                    stepY
                )
            ) {

                rush.active =
                    false;

                break;

            }


            for (
                const enemy of
                findEnemiesAtArea(

                    player.x,
                    player.y,

                    player.radius +
                    20,

                    rush.hitIds

                )
            ) {

                if (
                    !ensureBossAcceptedBeforeDamage(
                        enemy
                    )
                ) {

                    continue;

                }


                rush.hitIds.add(
                    enemy.id
                );


                damageEnemy(
                    enemy,
                    rush.damage
                );

            }

        }


        rush.timer -=
            dt;


        if (
            rush.timer <=
            0
        ) {

            rush.active =
                false;

        }

    }


    /* =========================================================
       COOLDOWNS
       ========================================================= */

    function updateCombatCooldowns(
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
                finiteNumber(
                    player.attackCooldown,
                    0
                ) -
                dt
            );


        for (
            const slot of
            [
                "q",
                "r",
                "f"
            ]
        ) {

            player.skillCooldowns[
                slot
            ] =
                Math.max(

                    0,

                    finiteNumber(
                        player.skillCooldowns[
                            slot
                        ],
                        0
                    ) -
                    dt

                );

        }


        player.invincible =
            Math.max(
                0,
                finiteNumber(
                    player.invincible,
                    0
                ) -
                dt
            );


        player.hurtAnim =
            Math.max(
                0,
                finiteNumber(
                    player.hurtAnim,
                    0
                ) -
                dt
            );


        player.movementSlowTimer =
            Math.max(
                0,
                finiteNumber(
                    player.movementSlowTimer,
                    0
                ) -
                dt
            );


        if (
            player.movementSlowTimer <=
            0
        ) {

            player.movementSlowMultiplier =
                1;

        }

    }


    /* =========================================================
       ENEMY PROJECTILES
       ========================================================= */

    function spawnEnemyProjectile(
        config
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        const projectile = {

            id:
                uid(
                    "enemy_projectile"
                ),

            x:
                config.x,

            y:
                config.y,

            vx:
                config.vx,

            vy:
                config.vy,

            radius:
                config.radius ||
                7,

            damage:
                config.damage ||
                10,

            color:
                config.color ||
                "#cb6970",

            life:
                config.life ||
                2.4,

            dead:
                false,

            status:
                config.status ||
                null,

            source:
                config.source ||
                "enemy"

        };


        state.world
            .enemyProjectiles
            .push(
                projectile
            );


        return projectile;

    }


    function updateEnemyProjectiles(
        dt
    ) {

        const player =
            state.player;


        if (
            !state.world ||
            !player
        ) {

            return;

        }


        for (
            const projectile of
            state.world
                .enemyProjectiles
        ) {

            if (
                projectile.dead
            ) {

                continue;

            }


            projectile.life -=
                dt;


            const movement =
                Math.hypot(
                    projectile.vx,
                    projectile.vy
                ) *
                dt;


            const steps =
                Math.max(
                    1,
                    Math.ceil(
                        movement /
                        8
                    )
                );


            for (
                let index = 0;
                index < steps;
                index++
            ) {

                projectile.x +=
                    projectile.vx *
                    dt /
                    steps;


                projectile.y +=
                    projectile.vy *
                    dt /
                    steps;


                if (
                    isCircleBlockedByWorld(

                        projectile.x,
                        projectile.y,

                        projectile.radius,

                        {
                            ignoreDarknessBarrier:
                                true
                        }

                    )
                ) {

                    projectile.dead =
                        true;

                    break;

                }


                if (
                    circleCircleCollision(

                        projectile.x,
                        projectile.y,
                        projectile.radius,

                        player.x,
                        player.y,
                        player.radius

                    )
                ) {

                    damagePlayer(

                        projectile.damage,

                        {
                            source:
                                projectile.source
                        }

                    );


                    applyPlayerStatusFromEnemy(
                        projectile.status
                    );


                    projectile.dead =
                        true;


                    break;

                }

            }


            if (
                projectile.life <=
                0
            ) {

                projectile.dead =
                    true;

            }

        }


        state.world.enemyProjectiles =
            state.world
                .enemyProjectiles
                .filter(
                    projectile =>
                        !projectile.dead
                );

    }


    /* =========================================================
       STATUS NEGATIVOS
       ========================================================= */

    function applyPlayerStatusFromEnemy(
        status
    ) {

        const player =
            state.player;


        if (
            !player ||
            !status
        ) {

            return;

        }


        if (
            status.type ===
            "slow"
        ) {

            player.movementSlowTimer =
                Math.max(

                    player.movementSlowTimer,

                    status.duration ||
                    2.2

                );


            player.movementSlowMultiplier =
                Math.min(

                    player.movementSlowMultiplier,

                    status.multiplier ||
                    0.55

                );

        }


        if (
            status.type ===
            "root"
        ) {

            player.movementSlowTimer =
                Math.max(

                    player.movementSlowTimer,

                    status.duration ||
                    1.2

                );


            player.movementSlowMultiplier =
                0.25;

        }


        if (
            status.type ===
            "poison"
        ) {

            player.poisonEffect = {

                timer:
                    status.duration ||
                    5,

                tickTimer:
                    0.65,

                damage:
                    status.damage ||
                    3

            };

        }

    }


    function updatePlayerStatusEffects(
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


        if (
            player.poisonEffect
        ) {

            player.poisonEffect.timer -=
                dt;


            player.poisonEffect.tickTimer -=
                dt;


            if (
                player.poisonEffect.tickTimer <=
                0
            ) {

                player.poisonEffect.tickTimer =
                    0.65;


                damagePlayer(

                    player.poisonEffect
                        .damage,

                    {
                        source:
                            "poison",

                        ignoreInvincible:
                            true

                    }

                );

            }


            if (
                player.poisonEffect.timer <=
                0
            ) {

                player.poisonEffect =
                    null;

            }

        }

    }


    /* =========================================================
       MOVIMENTO DOS INIMIGOS
       ========================================================= */

    function tryMoveEnemy(
        enemy,
        dx,
        dy
    ) {

        if (
            !enemy ||
            !state.world
        ) {

            return false;

        }


        let moved =
            false;


        const nextX =
            enemy.x +
            dx;


        if (
            !isCircleBlockedByWorld(

                nextX,
                enemy.y,

                enemy.radius,

                {
                    ignoreDarknessBarrier:
                        true
                }

            ) &&
            !isGateBlockingPosition(
                nextX,
                enemy.y,
                enemy.radius
            )
        ) {

            enemy.x =
                nextX;


            moved =
                true;

        }


        const nextY =
            enemy.y +
            dy;


        if (
            !isCircleBlockedByWorld(

                enemy.x,
                nextY,

                enemy.radius,

                {
                    ignoreDarknessBarrier:
                        true
                }

            ) &&
            !isGateBlockingPosition(
                enemy.x,
                nextY,
                enemy.radius
            )
        ) {

            enemy.y =
                nextY;


            moved =
                true;

        }


        return moved;

    }


    function moveEnemyToward(
        enemy,
        targetX,
        targetY,
        dt,
        speedMultiplier =
            1
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

            return false;

        }


        enemy.facingX =
            direction.x;


        enemy.facingY =
            direction.y;


        let speed =

            enemy.speed *
            speedMultiplier;


        if (
            finiteNumber(
                enemy.slow,
                0
            ) >
            0
        ) {

            speed *=
                0.62;

        }


        return tryMoveEnemy(

            enemy,

            direction.x *
            speed *
            dt,

            direction.y *
            speed *
            dt

        );

    }


    function pushEnemy(
        enemy,
        dx,
        dy
    ) {

        if (!enemy) {

            return;

        }


        tryMoveEnemy(
            enemy,
            dx,
            dy
        );

    }


    /* =========================================================
       ATAQUE NORMAL DO INIMIGO
       ========================================================= */

    function attemptEnemyBasicAttack(
        enemy
    ) {

        const player =
            state.player;


        if (
            !enemy ||
            !player ||
            player.dead ||
            enemy.attackCooldown >
            0
        ) {

            return false;

        }


        const d =
            distance(

                enemy.x,
                enemy.y,

                player.x,
                player.y

            );


        if (
            d >
            enemy.attackRange +
            player.radius
        ) {

            return false;

        }


        enemy.attackCooldown =

            enemy.type ===
            "progression"

                ? 0.9

                : 1.15;


        const direction =
            normalize(

                player.x -
                enemy.x,

                player.y -
                enemy.y

            );


        damagePlayer(

            enemy.damage,

            {
                source:
                    enemy.id,

                direction

            }

        );


        spawnAttackFlash(

            player.x,

            player.y,

            enemy.color ||
            "#d15c61",

            22

        );


        return true;

    }


    /* =========================================================
       CHARGE — LOBO / JAVALI / RUBI

       TELEGRAPH
       ↓
       MOVIMENTO REAL CONTÍNUO
       ↓
       COLISÃO

       SEM TELEPORTE.
       ========================================================= */

    function startEnemyChargeTelegraph(
        enemy
    ) {

        const ability =
            enemy.ability;


        if (
            !ability ||
            !state.player
        ) {

            return false;

        }


        const direction =
            normalize(

                state.player.x -
                enemy.x,

                state.player.y -
                enemy.y

            );


        enemy.telegraph = {

            type:
                "charge",

            timer:
                ability.telegraph ||
                0.52,

            duration:
                ability.telegraph ||
                0.52,

            directionX:
                direction.x,

            directionY:
                direction.y

        };


        /*
            CD começa aqui.

            Lobo = exatamente 2 segundos
            conforme configuração da Parte 2.
        */

        enemy.abilityCooldown =
            ability.cooldown ||
            2;


        state.world.effects.push({

            id:
                uid(
                    "charge_warning"
                ),

            type:
                "chargeTelegraph",

            x:
                enemy.x,

            y:
                enemy.y,

            directionX:
                direction.x,

            directionY:
                direction.y,

            length:
                Math.min(
                    330,
                    direction.length
                ),

            color:
                enemy.color,

            timer:
                enemy.telegraph
                    .timer,

            duration:
                enemy.telegraph
                    .duration

        });


        return true;

    }


    function updateEnemyTelegraph(
        enemy,
        dt
    ) {

        if (
            !enemy.telegraph
        ) {

            return;

        }


        enemy.telegraph.timer -=
            dt;


        if (
            enemy.telegraph.timer >
            0
        ) {

            return;

        }


        const directionX =
            enemy.telegraph
                .directionX;


        const directionY =
            enemy.telegraph
                .directionY;


        const ability =
            enemy.ability ||
            {};


        enemy.telegraph =
            null;


        enemy.charge = {

            active:
                true,

            directionX,

            directionY,

            speed:
                ability.speed ||
                350,

            timer:
                ability.duration ||
                0.42,

            hitPlayer:
                false

        };

    }


    function updateEnemyCharge(
        enemy,
        dt
    ) {

        const charge =
            enemy.charge;


        const player =
            state.player;


        if (
            !charge
                ?.active ||
            !player
        ) {

            return;

        }


        const movement =
            charge.speed *
            dt;


        /*
            Pequenos passos para evitar
            atravessar parede.
        */
        const steps =
            Math.max(

                1,

                Math.ceil(

                    movement /

                    GAME_CONFIG
                        .enemyChargeStep

                )

            );


        const stepX =

            charge.directionX *
            movement /
            steps;


        const stepY =

            charge.directionY *
            movement /
            steps;


        for (
            let index = 0;
            index < steps;
            index++
        ) {

            const moved =
                tryMoveEnemy(

                    enemy,

                    stepX,

                    stepY

                );


            if (!moved) {

                charge.active =
                    false;

                break;

            }


            if (
                !charge.hitPlayer &&
                circleCircleCollision(

                    enemy.x,
                    enemy.y,
                    enemy.radius,

                    player.x,
                    player.y,
                    player.radius

                )
            ) {

                charge.hitPlayer =
                    true;


                damagePlayer(

                    enemy.damage *

                    finiteNumber(
                        enemy.ability
                            ?.damageMultiplier,
                        1.22
                    ),

                    {
                        source:
                            enemy.id,

                        direction:
                            {

                                x:
                                    charge.directionX,

                                y:
                                    charge.directionY

                            }

                    }

                );

            }

        }


        charge.timer -=
            dt;


        if (
            charge.timer <=
            0
        ) {

            charge.active =
                false;

        }


        if (
            !charge.active
        ) {

            /*
                SEM recovery obrigatório.

                Pode voltar imediatamente
                para IA normal.
            */
            enemy.charge =
                null;

        }

    }


    /* =========================================================
       HABILIDADES DE INIMIGO
       ========================================================= */

    function canEnemyUseAbility(
        enemy,
        playerDistance
    ) {

        const ability =
            enemy.ability;


        if (!ability) {

            return false;

        }


        switch (
            ability.type
        ) {

            case "charge":
            case "heavyCharge":
            case "burningCharge":

                return (

                    playerDistance >=
                        80 &&

                    playerDistance <=
                        330

                );


            case "dive":

                return (

                    playerDistance >=
                        80 &&

                    playerDistance <=
                        300

                );


            case "webSlow":
            case "rootProjectile":

                return (
                    playerDistance <=
                    320
                );


            case "poison":

                return (
                    playerDistance <=
                    92
                );


            case "groundSlam":

                return (
                    playerDistance <=
                    150
                );


            case "oreBurst":

                return (
                    playerDistance <=
                    310
                );


            default:

                return (
                    playerDistance <=
                    Math.max(
                        enemy.vision,
                        330
                    )
                );

        }

    }


    function useEnemyAbility(
        enemy
    ) {

        const ability =
            enemy.ability;


        if (
            !ability ||
            !state.player
        ) {

            return false;

        }


        switch (
            ability.type
        ) {

            case "charge":
            case "heavyCharge":
            case "burningCharge":

                return startEnemyChargeTelegraph(
                    enemy
                );


            case "dive":

                return startEnemyDive(
                    enemy
                );


            case "webSlow":

                return enemyShootWeb(
                    enemy
                );


            case "rootProjectile":

                return enemyRootShot(
                    enemy
                );


            case "poison":

                return enemyPoisonSting(
                    enemy
                );


            case "groundSlam":

                return enemyGroundSlam(
                    enemy
                );


            case "oreBurst":

                return enemyOreBurst(
                    enemy
                );


            case "bossRoots":

                return forestBossAbility(
                    enemy
                );


            case "bossSlam":

                return bossGroundSlam(
                    enemy
                );


            case "monarch":

                return monarchAbility(
                    enemy
                );


            case "shadowBoss":

                return shadowBossAbility(
                    enemy
                );


            case "fairyBoss":

                return fairyBossAbility(
                    enemy
                );


            case "hellBoss":

                return hellBossAbility(
                    enemy
                );


            case "mirrorBoss":

                return mirrorBossAbility(
                    enemy
                );

        }


        enemy.abilityCooldown =
            ability.cooldown ||
            3;


        return false;

    }


    function shootEnemyProjectileTowardPlayer(
        enemy,
        config =
            {}
    ) {

        const player =
            state.player;


        if (
            !enemy ||
            !player
        ) {

            return false;

        }


        const direction =
            normalize(

                player.x -
                enemy.x,

                player.y -
                enemy.y

            );


        spawnEnemyProjectile({

            x:
                enemy.x +
                direction.x *
                (
                    enemy.radius +
                    5
                ),

            y:
                enemy.y +
                direction.y *
                (
                    enemy.radius +
                    5
                ),

            vx:
                direction.x *
                (
                    config.speed ||
                    310
                ),

            vy:
                direction.y *
                (
                    config.speed ||
                    310
                ),

            radius:
                config.radius ||
                7,

            damage:
                config.damage ||
                enemy.damage *
                0.8,

            color:
                config.color ||
                enemy.color,

            status:
                config.status ||
                null,

            source:
                enemy.id,

            life:
                config.life ||
                2.4

        });


        return true;

    }


    function enemyShootWeb(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.8;


        return shootEnemyProjectileTowardPlayer(

            enemy,

            {
                speed:
                    270,

                color:
                    "#b8a6c0",

                damage:
                    enemy.damage *
                    0.55,

                status: {

                    type:
                        "slow",

                    duration:
                        2.6,

                    multiplier:
                        0.52

                }

            }

        );

    }


    function enemyRootShot(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.7;


        return shootEnemyProjectileTowardPlayer(

            enemy,

            {
                speed:
                    285,

                color:
                    "#799b62",

                damage:
                    enemy.damage *
                    0.7,

                status: {

                    type:
                        "root",

                    duration:
                        1.2

                }

            }

        );

    }


    function enemyPoisonSting(
        enemy
    ) {

        const player =
            state.player;


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3.1;


        const d =
            distance(

                enemy.x,
                enemy.y,

                player.x,
                player.y

            );


        if (
            d >
            95
        ) {

            return false;

        }


        damagePlayer(

            enemy.damage *
            0.75,

            {
                source:
                    enemy.id
            }

        );


        applyPlayerStatusFromEnemy({

            type:
                "poison",

            duration:
                5,

            damage:
                Math.max(
                    2,
                    enemy.damage *
                    0.1
                )

        });


        return true;

    }


    function enemyGroundSlam(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3.2;


        spawnDelayedAreaAttack({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                115,

            delay:
                0.55,

            damage:
                enemy.damage *
                1.2,

            color:
                enemy.color,

            source:
                enemy.id

        });


        return true;

    }


    function enemyOreBurst(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3.5;


        for (
            let index = 0;
            index < 8;
            index++
        ) {

            const angle =

                index /
                8 *

                Math.PI *
                2;


            spawnEnemyProjectile({

                x:
                    enemy.x,

                y:
                    enemy.y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    270,

                vy:
                    Math.sin(
                        angle
                    ) *
                    270,

                radius:
                    7,

                damage:
                    enemy.damage *
                    0.72,

                color:
                    enemy.color,

                source:
                    enemy.id,

                life:
                    1.8

            });

        }


        return true;

    }


    function startEnemyDive(
        enemy
    ) {

        const player =
            state.player;


        const direction =
            normalize(

                player.x -
                enemy.x,

                player.y -
                enemy.y

            );


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.5;


        enemy.telegraph = {

            type:
                "charge",

            timer:
                0.32,

            duration:
                0.32,

            directionX:
                direction.x,

            directionY:
                direction.y

        };


        /*
            Cria parâmetros de charge
            temporários para o mergulho.
        */

        enemy.ability = {

            ...enemy.ability,

            speed:
                480,

            duration:
                0.32,

            damageMultiplier:
                1.1

        };


        return true;

    }


    /* =========================================================
       BOSSES — HABILIDADES

       NENHUM BOSS PRÉ-DASH usa Dash.
       ========================================================= */

    function forestBossAbility(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.8;


        const player =
            state.player;


        spawnDelayedAreaAttack({

            x:
                player.x,

            y:
                player.y,

            radius:
                70,

            delay:
                0.7,

            damage:
                enemy.damage *
                1.05,

            color:
                enemy.aura,

            source:
                enemy.id,

            status: {

                type:
                    "root",

                duration:
                    0.8

            }

        });


        return true;

    }


    function bossGroundSlam(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3;


        spawnDelayedAreaAttack({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                165,

            delay:
                0.72,

            damage:
                enemy.damage *
                1.35,

            color:
                enemy.aura,

            source:
                enemy.id

        });


        return true;

    }


    function monarchAbility(
        enemy
    ) {

        const player =
            state.player;


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.6;


        /*
            Áreas ao redor do jogador.
        */

        for (
            let index = 0;
            index < 3;
            index++
        ) {

            const angle =

                index /
                3 *

                Math.PI *
                2;


            spawnDelayedAreaAttack({

                x:
                    player.x +
                    Math.cos(
                        angle
                    ) *
                    75,

                y:
                    player.y +
                    Math.sin(
                        angle
                    ) *
                    75,

                radius:
                    62,

                delay:
                    0.55 +
                    index *
                    0.13,

                damage:
                    enemy.damage *
                    0.82,

                color:
                    enemy.aura,

                source:
                    enemy.id

            });

        }


        /*
            Rajada do Monarca.
        */

        const baseAngle =
            Math.atan2(

                player.y -
                enemy.y,

                player.x -
                enemy.x

            );


        for (
            let index = -1;
            index <= 1;
            index++
        ) {

            const angle =

                baseAngle +

                index *
                0.18;


            spawnEnemyProjectile({

                x:
                    enemy.x,

                y:
                    enemy.y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    320,

                vy:
                    Math.sin(
                        angle
                    ) *
                    320,

                radius:
                    8,

                damage:
                    enemy.damage *
                    0.65,

                color:
                    enemy.aura,

                source:
                    enemy.id

            });

        }


        return true;

    }


    function shadowBossAbility(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.35;


        const player =
            state.player;


        const baseAngle =
            Math.atan2(

                player.y -
                enemy.y,

                player.x -
                enemy.x

            );


        for (
            let index = -2;
            index <= 2;
            index++
        ) {

            const angle =

                baseAngle +

                index *
                0.16;


            spawnEnemyProjectile({

                x:
                    enemy.x,

                y:
                    enemy.y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    330,

                vy:
                    Math.sin(
                        angle
                    ) *
                    330,

                radius:
                    8,

                damage:
                    enemy.damage *
                    0.58,

                color:
                    enemy.aura,

                status:

                    Math.abs(
                        index
                    ) ===
                    2

                        ? {
                            type:
                                "slow",

                            duration:
                                1.7,

                            multiplier:
                                0.68
                        }

                        : null,

                source:
                    enemy.id

            });

        }


        return true;

    }


    function fairyBossAbility(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.2;


        const player =
            state.player;


        const baseAngle =
            Math.atan2(

                player.y -
                enemy.y,

                player.x -
                enemy.x

            );


        for (
            let index = -3;
            index <= 3;
            index++
        ) {

            const angle =

                baseAngle +

                index *
                0.11;


            spawnEnemyProjectile({

                x:
                    enemy.x,

                y:
                    enemy.y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    355,

                vy:
                    Math.sin(
                        angle
                    ) *
                    355,

                radius:
                    6,

                damage:
                    enemy.damage *
                    0.47,

                color:
                    "#f0aedf",

                source:
                    enemy.id

            });

        }


        return true;

    }


    function hellBossAbility(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.15;


        const player =
            state.player;


        for (
            let index = 0;
            index < 4;
            index++
        ) {

            const angle =

                index /
                4 *

                Math.PI *
                2;


            spawnDelayedAreaAttack({

                x:
                    player.x +
                    Math.cos(
                        angle
                    ) *
                    92,

                y:
                    player.y +
                    Math.sin(
                        angle
                    ) *
                    92,

                radius:
                    68,

                delay:
                    0.6 +
                    index *
                    0.1,

                damage:
                    enemy.damage *
                    0.72,

                color:
                    "#d85a3a",

                source:
                    enemy.id

            });

        }


        return true;

    }


    function mirrorBossAbility(
        enemy
    ) {

        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2;


        const character =
            currentCharacter();


        const player =
            state.player;


        if (
            character.basicAttack
                .type ===
            "projectile"
        ) {

            return shootEnemyProjectileTowardPlayer(

                enemy,

                {
                    speed:
                        430,

                    radius:
                        9,

                    damage:
                        enemy.damage *
                        0.92,

                    color:
                        character.color

                }

            );

        }


        const d =
            distance(

                enemy.x,
                enemy.y,

                player.x,
                player.y

            );


        if (
            d <=
            150
        ) {

            spawnDelayedAreaAttack({

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    88,

                delay:
                    0.42,

                damage:
                    enemy.damage *
                    1.05,

                color:
                    character.color,

                source:
                    enemy.id

            });


            return true;

        }


        return shootEnemyProjectileTowardPlayer(

            enemy,

            {
                speed:
                    360,

                radius:
                    8,

                damage:
                    enemy.damage *
                    0.8,

                color:
                    character.color

            }

        );

    }


    /* =========================================================
       IA INIMIGA

       IMPORTANTE:

       NÃO depende do player estar andando.

       Isso corrige o bug de lobo/javali
       ficarem parados se o jogador também
       estiver parado.
       ========================================================= */

    function updateEnemyIdle(
        enemy,
        dt
    ) {

        enemy.wanderTimer =
            finiteNumber(
                enemy.wanderTimer,
                0
            ) -
            dt;


        if (
            enemy.wanderTarget
        ) {

            const d =
                distance(

                    enemy.x,
                    enemy.y,

                    enemy.wanderTarget.x,
                    enemy.wanderTarget.y

                );


            if (
                d >
                12
            ) {

                moveEnemyToward(

                    enemy,

                    enemy.wanderTarget.x,

                    enemy.wanderTarget.y,

                    dt,

                    0.35

                );


                return;

            }


            enemy.wanderTarget =
                null;

        }


        if (
            enemy.wanderTimer >
            0
        ) {

            return;

        }


        enemy.wanderTimer =
            random(
                1.4,
                3.2
            );


        const angle =
            random(
                0,
                Math.PI *
                2
            );


        enemy.wanderTarget = {

            x:
                enemy.homeX +
                Math.cos(
                    angle
                ) *
                random(
                    15,
                    65
                ),

            y:
                enemy.homeY +
                Math.sin(
                    angle
                ) *
                random(
                    15,
                    65
                )

        };

    }


    function updateEnemies(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            !state.world ||
            state.houseMode
        ) {

            return;

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


            enemy.animationTime +=
                dt;


            enemy.hitFlash =
                Math.max(
                    0,
                    finiteNumber(
                        enemy.hitFlash,
                        0
                    ) -
                    dt
                );


            enemy.attackCooldown =
                Math.max(
                    0,
                    finiteNumber(
                        enemy.attackCooldown,
                        0
                    ) -
                    dt
                );


            enemy.abilityCooldown =
                Math.max(
                    0,
                    finiteNumber(
                        enemy.abilityCooldown,
                        0
                    ) -
                    dt
                );


            enemy.stun =
                Math.max(
                    0,
                    finiteNumber(
                        enemy.stun,
                        0
                    ) -
                    dt
                );


            enemy.slow =
                Math.max(
                    0,
                    finiteNumber(
                        enemy.slow,
                        0
                    ) -
                    dt
                );


            /*
                Progression boss não ataca
                antes da confirmação.
            */

            const playerDistance =
                distance(

                    enemy.x,
                    enemy.y,

                    player.x,
                    player.y

                );


            if (
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                enemy.state =
                    "waiting";


                if (
                    playerDistance <=
                    enemy.vision *
                    0.72
                ) {

                    discoverBoss(
                        enemy
                    );

                }


                continue;

            }


            if (
                player.dead
            ) {

                enemy.aggressive =
                    false;


                enemy.state =
                    "idle";


                continue;

            }


            if (
                enemy.stun >
                0
            ) {

                enemy.state =
                    "stunned";


                continue;

            }


            if (
                enemy.charge
                    ?.active
            ) {

                updateEnemyCharge(
                    enemy,
                    dt
                );


                continue;

            }


            if (
                enemy.telegraph
            ) {

                updateEnemyTelegraph(
                    enemy,
                    dt
                );


                continue;

            }


            if (
                playerDistance <=
                enemy.vision
            ) {

                enemy.aggressive =
                    true;

            }


            if (
                enemy.aggressive &&
                playerDistance >
                    enemy.vision *
                    1.65 &&
                enemy.type !==
                    "progression"
            ) {

                enemy.aggressive =
                    false;


                enemy.state =
                    "returning";

            }


            if (
                !enemy.aggressive
            ) {

                const homeDistance =
                    distance(

                        enemy.x,
                        enemy.y,

                        enemy.homeX,
                        enemy.homeY

                    );


                if (
                    homeDistance >
                    95
                ) {

                    moveEnemyToward(

                        enemy,

                        enemy.homeX,
                        enemy.homeY,

                        dt,

                        0.55

                    );

                }

                else {

                    updateEnemyIdle(
                        enemy,
                        dt
                    );

                }


                continue;

            }


            /*
                HABILIDADE TEM PRIORIDADE.
            */

            if (
                enemy.ability &&
                enemy.abilityCooldown <=
                    0 &&
                canEnemyUseAbility(
                    enemy,
                    playerDistance
                )
            ) {

                if (
                    useEnemyAbility(
                        enemy
                    )
                ) {

                    continue;

                }

            }


            /*
                ATAQUE NORMAL.

                É baseado somente em distância
                e cooldown. Não depende das teclas
                nem do movimento do jogador.
            */

            if (
                playerDistance <=
                enemy.attackRange +
                player.radius
            ) {

                enemy.state =
                    "attacking";


                attemptEnemyBasicAttack(
                    enemy
                );


                continue;

            }


            enemy.state =
                "chasing";


            moveEnemyToward(

                enemy,

                player.x,
                player.y,

                dt

            );

        }

    }


    /* =========================================================
       DANO NO PLAYER
       ========================================================= */

    function damagePlayer(
        rawDamage,
        options = {}
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead
        ) {

            return false;

        }


        /*
            VIDA INFINITA.
        */

        if (
            devShouldIgnorePlayerDamage()
        ) {

            player.hp =
                player.maxHp;


            return false;

        }


        if (
            player.invincible >
                0 &&
            !options.ignoreInvincible
        ) {

            return false;

        }


        const defense =
            getPlayerDefense();


        let damage =
            Math.max(

                PLAYER_COMBAT_CONFIG
                    .minimumDamage,

                finiteNumber(
                    rawDamage,
                    1
                ) -

                defense *
                PLAYER_COMBAT_CONFIG
                    .damageReductionPerDefense

            );


        if (
            player.ironGuard
        ) {

            damage *=
                1 -
                player.ironGuard
                    .damageReduction;

        }


        damage =
            Math.max(
                1,
                damage
            );


        player.hp =
            Math.max(
                0,
                player.hp -
                damage
            );


        if (
            !options.ignoreInvincible
        ) {

            player.invincible =
                PLAYER_COMBAT_CONFIG
                    .enemyHitInvincibility;

        }


        player.hurtAnim =
            0.25;


        state.damageFlash =
            Math.min(

                VISUAL_CONFIG
                    .blood
                    .flashMax,

                0.2 +
                damage /
                Math.max(
                    1,
                    player.maxHp
                )

            );


        state.screenShake =
            0.12;


        state.screenShakePower =
            Math.min(
                8,
                2 +
                damage *
                0.08
            );


        createBloodMark(

            player.x,
            player.y,

            clamp(
                damage /
                20,
                0.6,
                1.4
            )

        );


        spawnRadialParticles(

            player.x,
            player.y,

            "#9b2f38",

            8,

            90

        );


        /*
            Knockback suave.
        */

        if (
            options.direction
        ) {

            const knockback =
                10;


            movePlayerBy(

                options.direction.x *
                knockback,

                options.direction.y *
                knockback

            );

        }


        if (
            player.hp <=
            0
        ) {

            beginPlayerDeath();

        }


        return true;

    }


    /* =========================================================
       MORTE / PERDA DE MATERIAL
       ========================================================= */

    function loseMaterialsOnDeath() {

        const player =
            state.player;


        if (!player) {

            return [];

        }


        const lost =
            [];


        for (
            const [
                id,
                item
            ] of
            Object.entries(
                ITEMS
            )
        ) {

            if (
                item.category !==
                "materials"
            ) {

                continue;

            }


            const amount =
                getRealItemCount(
                    id
                );


            if (
                amount <=
                0
            ) {

                continue;

            }


            const loss =
                Math.min(

                    GAME_CONFIG
                        .deathMaterialLossMaxPerType,

                    Math.floor(

                        amount *

                        GAME_CONFIG
                            .deathMaterialLossRatio

                    )

                );


            if (
                loss <=
                0
            ) {

                continue;

            }


            player.inventory[id] =
                Math.max(
                    0,
                    amount -
                    loss
                );


            lost.push({

                id,

                amount:
                    loss

            });

        }


        return lost;

    }


    function beginPlayerDeath() {

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


        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.guardianRush =
            null;


        cancelHoldCollect();


        const lost =
            loseMaterialsOnDeath();


        state.deathState = {

            timer:
                1.2,

            lost

        };


        const panel =
            $("deathPanel");


        if (panel) {

            panel.classList
                .remove(
                    "hidden"
                );

        }


        if (
            typeof showToast ===
                "function" &&
            lost.length >
                0
        ) {

            const total =
                lost.reduce(
                    (
                        sum,
                        entry
                    ) =>
                        sum +
                        entry.amount,
                    0
                );


            showToast(
                `Você perdeu ${total} material${total === 1 ? "" : "is"}.`
            );

        }

    }


    function respawnPlayerAtHome() {

        const player =
            state.player;


        if (!player) {

            return false;

        }


        state.area =
            "village";


        state.houseMode =
            false;


        state.currentHouse =
            null;


        state.houseReturn =
            null;


        buildWorld();


        const spawn =
            calculateHomeRespawn();


        const safe =
            findSafeSpawn(

                spawn.x,
                spawn.y,

                player.radius,

                {
                    ignoreDarknessBarrier:
                        true
                }

            );


        player.x =
            safe.x;


        player.y =
            safe.y;


        player.facing =
            spawn.facing ||
            "up";


        player.dead =
            false;


        player.hp =
            player.maxHp;


        player.magic =
            player.maxMagic;


        player.energy =
            player.maxEnergy;


        player.hunger =
            Math.max(
                player.hunger,
                player.maxHunger *
                0.5
            );


        player.fatigue =
            Math.max(
                player.fatigue,
                player.maxFatigue *
                0.5
            );


        player.invincible =
            1.5;


        player.poisonEffect =
            null;


        player.movementSlowTimer =
            0;


        state.deathState =
            null;


        $("deathPanel")
            ?.classList
            .add(
                "hidden"
            );


        state.camera.x =
            0;


        state.camera.y =
            0;


        maintainDevInfiniteResources();


        return true;

    }


    function respawnPlayer() {

        return respawnPlayerAtHome();

    }


    function updatePlayerDeath(
        dt
    ) {

        if (
            !state.deathState
        ) {

            return;

        }


        state.deathState.timer =
            Math.max(
                0,
                state.deathState
                    .timer -
                dt
            );

    }


    /* =========================================================
       NPC MOVEMENT
       ========================================================= */

    function updateNPCs(
        dt
    ) {

        if (
            !state.world ||
            state.houseMode
        ) {

            return;

        }


        for (
            const npc of
            state.world.npcs
        ) {

            if (
                !npc ||
                npc.movable ===
                    false
            ) {

                continue;

            }


            npc.idleTime -=
                dt;


            if (
                npc.moveTarget
            ) {

                const direction =
                    normalize(

                        npc.moveTarget.x -
                        npc.x,

                        npc.moveTarget.y -
                        npc.y

                    );


                if (
                    direction.length <
                    5
                ) {

                    npc.moveTarget =
                        null;


                    npc.idleTime =
                        random(
                            1.5,
                            4
                        );


                    continue;

                }


                const speed =
                    34;


                const nextX =

                    npc.x +

                    direction.x *
                    speed *
                    dt;


                const nextY =

                    npc.y +

                    direction.y *
                    speed *
                    dt;


                if (
                    !isCircleBlockedByWorld(
                        nextX,
                        npc.y,
                        16,
                        {
                            ignoreDarknessBarrier:
                                true
                        }
                    )
                ) {

                    npc.x =
                        nextX;

                }


                if (
                    !isCircleBlockedByWorld(
                        npc.x,
                        nextY,
                        16,
                        {
                            ignoreDarknessBarrier:
                                true
                        }
                    )
                ) {

                    npc.y =
                        nextY;

                }


                npc.walkPhase +=
                    dt *
                    5;


                continue;

            }


            if (
                npc.idleTime >
                0
            ) {

                continue;

            }


            const angle =
                random(
                    0,
                    Math.PI *
                    2
                );


            npc.moveTarget = {

                x:
                    npc.homeX +
                    Math.cos(
                        angle
                    ) *
                    random(
                        15,
                        npc.wanderRadius
                    ),

                y:
                    npc.homeY +
                    Math.sin(
                        angle
                    ) *
                    random(
                        15,
                        npc.wanderRadius
                    )

            };

        }

    }


    /* =========================================================
       UPDATE PRINCIPAL DO GAMEPLAY

       Parte 4 chamará esta função no game loop.
       ========================================================= */

    function updateGameplaySystems(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            !state.running
        ) {

            return;

        }


        const safeDt =
            clamp(
                finiteNumber(
                    dt,
                    0
                ),
                0,
                0.05
            );


        /*
            TESTES INFINITOS
            antes de tudo.
        */
        maintainDevInfiniteResources();


        updateCombatCooldowns(
            safeDt
        );


        updatePlayerStatusEffects(
            safeDt
        );


        updateClassBuffs(
            safeDt
        );


        updatePotionBuffs(
            safeDt
        );


        updatePlayerRest(
            safeDt
        );


        updateUniversalDash(
            safeDt
        );


        updateZephyrCombatDash(
            safeDt
        );


        updateGuardianRush(
            safeDt
        );


        updatePlayerMovement(
            safeDt
        );


        updateExteriorDoors(
            safeDt
        );


        updateHoldCollection(
            safeDt
        );


        updateResources(
            safeDt
        );


        updateNPCs(
            safeDt
        );


        updatePlayerProjectiles(
            safeDt
        );


        updateEnemyProjectiles(
            safeDt
        );


        updateDelayedAreas(
            safeDt
        );


        updateEnemies(
            safeDt
        );


        updateSurvival(
            safeDt
        );


        updatePlayerDeath(
            safeDt
        );


        updateBloodEffects(
            safeDt
        );


        updateGameplayEffects(
            safeDt
        );


        updateParticles(
            safeDt
        );


        state.portalCooldown =
            Math.max(

                0,

                finiteNumber(
                    state.portalCooldown,
                    0
                ) -
                safeDt

            );


        state.screenShake =
            Math.max(

                0,

                finiteNumber(
                    state.screenShake,
                    0
                ) -
                safeDt

            );


        /*
            TESTES INFINITOS
            novamente depois de sistemas
            que gastaram recursos.
        */
        maintainDevInfiniteResources();

    }


    /* =========================================================
       VALIDAÇÃO PARTE 3
       ========================================================= */

    function validatePart3Data() {

        const errors =
            [];


        const allowedStats = [

            "power",
            "energy",
            "hunger",
            "fatigue"

        ];


        for (
            const stat of
            Object.keys(
                STAT_CONFIG
            )
        ) {

            if (
                !allowedStats.includes(
                    stat
                )
            ) {

                errors.push(
                    `Status inválido: ${stat}`
                );

            }

        }


        if (
            Object.keys(
                STAT_CONFIG
            ).length !==
            4
        ) {

            errors.push(
                "Devem existir exatamente quatro status distribuíveis."
            );

        }


        if (
            BASE_STATUS_POINTS_PER_LEVEL !==
            3
        ) {

            errors.push(
                "Cada nível normal deve conceder 3 pontos."
            );

        }


        if (
            SURVIVAL_CONFIG
                .hungerDrainPerSecond !==
            0.25
        ) {

            errors.push(
                "O ritmo antigo de fome foi alterado."
            );

        }


        if (
            SURVIVAL_CONFIG
                .fatigueDrainPerSecond !==
            0.2
        ) {

            errors.push(
                "O ritmo antigo de cansaço foi alterado."
            );

        }


        if (
            ENEMY_SPECIES
                .wolf
                .ability
                .cooldown !==
            2
        ) {

            errors.push(
                "A investida do lobo precisa ter cooldown de 2 segundos."
            );

        }


        if (
            typeof performBasicAttack !==
            "function"
        ) {

            errors.push(
                "Ataque básico ausente."
            );

        }


        if (
            typeof useClassSkill !==
            "function"
        ) {

            errors.push(
                "Sistema Q/R/F ausente."
            );

        }


        if (
            typeof attemptUniversalDash !==
            "function"
        ) {

            errors.push(
                "Dash universal ausente."
            );

        }


        if (
            typeof updateEnemies !==
            "function"
        ) {

            errors.push(
                "IA dos inimigos ausente."
            );

        }


        if (
            typeof damagePlayer !==
            "function"
        ) {

            errors.push(
                "Sistema de dano do player ausente."
            );

        }


        if (
            typeof updateGameplaySystems !==
            "function"
        ) {

            errors.push(
                "Update principal de gameplay ausente."
            );

        }


        if (
            errors.length >
            0
        ) {

            console.error(
                "VEYRA V25 — erros na Parte 3:",
                errors
            );


            return false;

        }


        return true;

    }


    /* =========================================================
       FIM DA PARTE 3/4

       NÃO COLOQUE })(); AQUI.

       A PARTE 4/4 SERÁ A ÚLTIMA E VAI TER:

       - diálogos typewriter;
       - E completa / E avança;
       - casas e Z;
       - lojas;
       - armaduras sequenciais;
       - vender 1 / vender tudo;
       - quests;
       - portões;
       - altar / Monarca / Dash;
       - 5 hordas do céu;
       - Flauta da Memória;
       - viagem;
       - save/load;
       - renderização completa;
       - HUD;
       - minimapa;
       - mapa;
       - lanterna OFFSCREEN;
       - menu;
       - seleção;
       - todos os botões do HTML;
       - painel X+Y;
       - eventos;
       - loop;
       - inicialização;
       - validação final;
       - ÚNICO })();
       ========================================================= */
