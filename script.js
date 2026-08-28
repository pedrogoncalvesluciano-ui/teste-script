(() => {
    "use strict";


    /* =========================================================
       VEYRA: A QUIETUDE
       V25.0 — GRANDE REVISÃO
       SCRIPT.JS — PARTE 1/5

       BASE
       CONFIGURAÇÕES
       PERSONAGENS
       STATUS
       ITENS
       ARMADURAS
       NPCs
       INIMIGOS
       BOSSES
       SAVE BASE
       SISTEMA PRIVADO DE TESTES

       IMPORTANTE:
       ESTA PARTE ABRE O ÚNICO IIFE DO SCRIPT.

       NÃO COLOQUE })(); NO FINAL DESTA PARTE.
       ========================================================= */


    /* =========================================================
       VERSÃO
       ========================================================= */

    const GAME_VERSION = 25;

    const GAME_VERSION_NAME =
        "VEYRA V25 — MEMÓRIAS RESTAURADAS";


    const SAVE_KEY =
        "veyra_save_v25";


    const LEGACY_SAVE_KEYS = Object.freeze([
        "veyra_save_v20_five_parts",
        "veyra_save_v20_upgrade",
        "veyra_save_v19_rebuild",
        "veyra_save_v19",
        "veyra_save_v18_rebuild",
        "veyra_save_v14_stable"
    ]);


    /* =========================================================
       LIMITES
       ========================================================= */

    const MAX_LEVEL = 50;

    /*
        NOVO BALANCEAMENTO:

        O nível NÃO aumenta atributos sozinho.

        O jogador recebe 2 pontos por nível.

        A cada nível múltiplo de 10:
        recebe 1 ponto adicional.

        Isso impede maximizar tudo cedo demais.
    */
    const BASE_STATUS_POINTS_PER_LEVEL = 2;

    const BONUS_STATUS_POINT_INTERVAL = 10;

    const STAT_CAP = 30;


    const MAX_BLOOD_MARKS = 20;

    const MAX_ACTIVE_POTION_BUFFS = 2;


    /* =========================================================
       PREÇOS / PROGRESSÃO
       ========================================================= */

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
       CHECKPOINT

       SOMENTE A CASA DO PLAYER É CHECKPOINT.
       ========================================================= */

    const PLAYER_HOME = Object.freeze({

        area:
            "village",

        houseId:
            "home",

        interiorSpawn: {
            x: 540,
            y: 515
        },

        /*
            Esse ponto será sincronizado com a porta real
            da casa na Parte 2.

            Se o layout mudar alguns pixels,
            calculateHomeRespawn() corrigirá.
        */
        fallbackRespawn: {
            x: 595,
            y: 1905,
            facing: "up"
        }

    });


    /* =========================================================
       CONFIGURAÇÃO GERAL
       ========================================================= */

    const GAME_CONFIG = Object.freeze({

        worldMargin:
            55,

        autosaveSeconds:
            30,

        interactDistance:
            86,

        pickupDistance:
            74,

        treeHoldSeconds:
            1.35,

        resourceHoldSeconds:
            1.1,

        /*
            Um clique = um ataque.
        */
        baseAttackCooldown:
            0.24,

        /*
            Porta abre automaticamente quando aproxima.

            Z continua entrando.
        */
        doorAutoOpenDistance:
            112,

        doorAutoCloseDistance:
            160,

        doorInteractionDistance:
            126,

        /*
            Evita entidades surgindo em cima do player.
        */
        enemySpawnSafeDistance:
            175,

        bossSpawnSafeDistance:
            250,

        /*
            Passos menores impedem investida atravessando parede.
        */
        enemyChargeStep:
            9,

        /*
            Lanterna.
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
            Diálogo gradual.
        */
        dialogueCharactersPerSecond:
            42,

        dialogueFastCharactersPerSecond:
            130,

        dialogueFadeSeconds:
            0.2,

        /*
            Morte.
        */
        deathMaterialLossRatio:
            0.08,

        deathMaterialLossMaxPerType:
            8,

        /*
            Animações.
        */
        walkAnimationSpeed:
            8,

        restAnimationSeconds:
            2.4,

        /*
            Fonte central.
        */
        fountainParticleRate:
            18

    });


    /* =========================================================
       CONFIGURAÇÃO VISUAL
       ========================================================= */

    const VISUAL_CONFIG = Object.freeze({

        player: {

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

        },


        enemy: {

            radius:
                20,

            nameOffsetY:
                44

        },


        boss: {

            /*
                Aproximadamente duas vezes
                o tamanho do bonequinho.
            */
            scale:
                2,

            minRadius:
                40,

            maxRadius:
                60,

            nameOffsetY:
                80

        },


        tree: {

            trunkRadius:
                17,

            /*
                Hitbox mais coerente com a copa.
            */
            canopyCollisionRadius:
                35,

            canopyCollisionOffsetY:
                -12,

            visualCanopyRadius:
                55,

            generationSafetyRadius:
                49

        },


        house: {

            maxScreenWidthRatio:
                0.76,

            maxScreenHeightRatio:
                0.72,

            outerShadow:
                32

        },


        bossBar: {

            topDesktop:
                88,

            minWidth:
                350,

            maxWidth:
                610,

            height:
                19

        },


        lantern: {

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
                Dessa vez a área iluminada
                NÃO ficará preta.
            */
            innerBrightness:
                1,

            middleBrightness:
                0.88,

            edgeBrightness:
                0.28

        },


        blood: {

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

        }

    });


    /* =========================================================
       ESTRADAS POR BIOMA

       NÃO altera layout do mapa.

       Só aparência.
       ========================================================= */

    const PATH_STYLE_CONFIG = Object.freeze({

        village: {
            base: "#a88c61",
            edge: "#73654e",
            detail: "#c1a779",
            secondary: "#877357",
            type: "stone"
        },

        forest: {
            base: "#766649",
            edge: "#4d553d",
            detail: "#92805a",
            secondary: "#5f704b",
            type: "leaf"
        },

        grove: {
            base: "#695e43",
            edge: "#424f39",
            detail: "#817553",
            secondary: "#566746",
            type: "root"
        },

        mountains: {
            base: "#878681",
            edge: "#626766",
            detail: "#babcb9",
            secondary: "#9ca09e",
            type: "snow"
        },

        iron: {
            base: "#55524d",
            edge: "#343537",
            detail: "#7a7975",
            secondary: "#45494a",
            type: "ore"
        },

        ruby: {
            base: "#5c3b41",
            edge: "#35262b",
            detail: "#a64b5c",
            secondary: "#703741",
            type: "ruby"
        },

        monarchMaze: {
            base: "#302b35",
            edge: "#18151c",
            detail: "#5d4d69",
            secondary: "#3b3342",
            type: "rune"
        },

        shadow: {
            base: "#35323e",
            edge: "#202029",
            detail: "#575267",
            secondary: "#423d4d",
            type: "mist"
        },

        fairy: {
            base: "#766c7b",
            edge: "#505365",
            detail: "#bd87b1",
            secondary: "#8a7490",
            type: "flower"
        },

        sky: {
            base: "#c8d0d2",
            edge: "#8e9ca3",
            detail: "#e5dcab",
            secondary: "#a8b6bb",
            type: "cloud"
        },

        hell: {
            base: "#58352f",
            edge: "#302020",
            detail: "#a44732",
            secondary: "#733026",
            type: "ember"
        },

        final: {
            base: "#4a4551",
            edge: "#242127",
            detail: "#85768f",
            secondary: "#5e5366",
            type: "memory"
        }

    });


    /* =========================================================
       DOM HELPERS

       Não usamos must() em inicialização de dados
       para reduzir chance de tela branca.
       ========================================================= */

    function $(id) {

        return document
            .getElementById(
                id
            );

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
        prefix = "entity"
    ) {

        return (

            `${prefix}_` +

            Math.random()
                .toString(36)
                .slice(2, 9) +

            "_" +

            Date.now()
                .toString(36)

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

       Runtime separado de save.
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
            x: 0,
            y: 0
        },

        pointer: {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            down: false
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
            Não entra no save.
        */
        dev:
            null

    };


    /* =========================================================
       PERSONAGENS

       ÍCONES PEDIDOS:
       🔥 ⚔️ 🪨 ✨ 🌀
       ========================================================= */

    const CHARACTERS = Object.freeze([

        {

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

            sprite: {

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

            },

            basicAttack: {

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

            }

        },


        {

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

            sprite: {

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

            },

            basicAttack: {

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

            }

        },


        {

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

            sprite: {

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

            },

            basicAttack: {

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

            }

        },


        {

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

            sprite: {

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

            },

            basicAttack: {

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

            }

        },


        {

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

            sprite: {

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

            },

            basicAttack: {

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

            }

        }

    ]);


    /* =========================================================
       PERSONAGEM
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
       GRÁFICO/BARRAS DA SELEÇÃO

       BASEADO NOS STATS REAIS.
       ========================================================= */

    const CHARACTER_SELECTION_RANGE =
        Object.freeze({

            hp: {
                min: 70,
                max: 170
            },

            magic: {
                min: 50,
                max: 160
            },

            energy: {
                min: 80,
                max: 140
            },

            damage: {
                min: 18,
                max: 34
            },

            defense: {
                min: 4,
                max: 22
            },

            speed: {
                min: 115,
                max: 180
            }

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

       DECISÃO ATUAL:

       - Força e Magia são UM atributo.
       - Energia.
       - Fome.
       - Cansaço.
       - Velocidade NÃO recebe ponto.
       - HP NÃO recebe ponto neste momento.
         HP aumenta principalmente por armadura.
       ========================================================= */

    const STAT_CONFIG = Object.freeze({

        power: {

            id:
                "power",

            label:
                "FORÇA / MAGIA",

            icon:
                "✦",

            description:
                "Aumenta o dano causado e a reserva máxima de Magia.",

            damagePerPoint:
                0.02,

            magicPerPoint:
                4

        },


        energy: {

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

        },


        hunger: {

            id:
                "hunger",

            label:
                "FOME",

            icon:
                "🍞",

            description:
                "Aumenta a reserva máxima de Fome.",

            amountPerPoint:
                3

        },


        fatigue: {

            id:
                "fatigue",

            label:
                "CANSAÇO",

            icon:
                "🌙",

            description:
                "Aumenta a resistência máxima ao Cansaço.",

            amountPerPoint:
                3

        }

    });


    /* =========================================================
       PONTOS POR NÍVEL
       ========================================================= */

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

       HP:
       +25
       +50
       +75
       +100
       +125
       +150
       +175
       +200
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

            armaduraFolha: {

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

            },


            armaduraAlgodao: {

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

            },


            armaduraMadeira: {

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

            },


            armaduraCouro: {

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

            },


            armaduraFerro: {

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

            },


            armaduraOuro: {

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

            },


            armaduraDiamante: {

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

            },


            armaduraRubi: {

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

            }

        });


    /* =========================================================
       RECEITAS BORIN
       ========================================================= */

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


    /* =========================================================
       ITENS
       ========================================================= */

    const ITEMS = {

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


    /*
        Armaduras entram no mesmo catálogo de itens.
    */
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
                ? ITEMS[id] ||
                  null

                : null
        );

    }


    function playerOwnsArmor(
        id
    ) {

        if (
            !state.player ||
            !ARMOR_DATA[id]
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
                .armor ===
            id

        );

    }


    function getHighestOwnedArmorTier() {

        if (
            !state.player
        ) {

            return 0;

        }


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
            ARMOR_PROGRESSION.length
        );

    }


    function getHighestOwnedArmorId() {

        const tier =
            getHighestOwnedArmorTier();


        if (
            tier <=
            0
        ) {

            return null;

        }


        return ARMOR_PROGRESSION[
            tier -
            1
        ];

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


        return ARMOR_PROGRESSION[
            tier
        ];

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


        const currentId =

            currentTier >
            0

                ? ARMOR_PROGRESSION[
                    currentTier -
                    1
                ]

                : null;


        const nextId =

            currentTier <
            ARMOR_PROGRESSION.length

                ? ARMOR_PROGRESSION[
                    currentTier
                ]

                : null;


        return {

            currentTier,

            currentId,

            nextId,

            maxed:
                currentTier >=
                ARMOR_PROGRESSION.length

        };

    }


    /* =========================================================
       SKILLS Q / R / F

       As funções reais entram na Parte 3.
       ========================================================= */

    const CLASS_SKILLS =
        Object.freeze({

            kaelion: {

                q: {
                    id: "memoryRay",
                    name: "Raio de Memória",
                    costType: "magic",
                    cost: 15,
                    cooldown: 2
                },

                r: {
                    id: "arcaneCircle",
                    name: "Círculo Arcano",
                    costType: "magic",
                    cost: 24,
                    cooldown: 5
                },

                f: {
                    id: "memoryExplosion",
                    name: "Explosão de Memória",
                    costType: "magic",
                    cost: 36,
                    cooldown: 8
                }

            },


            theron: {

                q: {
                    id: "guardianStrike",
                    name: "Golpe do Guardião",
                    costType: "energy",
                    cost: 10,
                    cooldown: 3
                },

                r: {
                    id: "ironGuard",
                    name: "Postura de Ferro",
                    costType: "energy",
                    cost: 18,
                    cooldown: 6
                },

                f: {
                    id: "guardianRush",
                    name: "Investida do Guardião",
                    costType: "energy",
                    cost: 25,
                    cooldown: 8
                }

            },


            grumgar: {

                q: {
                    id: "crushingBlow",
                    name: "Esmagamento",
                    costType: "energy",
                    cost: 13,
                    cooldown: 4
                },

                r: {
                    id: "stoneRoar",
                    name: "Rugido de Pedra",
                    costType: "energy",
                    cost: 20,
                    cooldown: 6
                },

                f: {
                    id: "earthBreaker",
                    name: "Ruptura do Solo",
                    costType: "energy",
                    cost: 30,
                    cooldown: 9
                }

            },


            lirael: {

                q: {
                    id: "vitalLight",
                    name: "Luz Vital",
                    costType: "magic",
                    cost: 14,
                    cooldown: 4
                },

                r: {
                    id: "fairyBurst",
                    name: "Rajada Feérica",
                    costType: "magic",
                    cost: 20,
                    cooldown: 4.5
                },

                f: {
                    id: "starRain",
                    name: "Chuva de Luz",
                    costType: "magic",
                    cost: 34,
                    cooldown: 8
                }

            },


            zephyr: {

                q: {
                    id: "adaptiveCut",
                    name: "Corte Adaptativo",
                    costType: "magic",
                    cost: 11,
                    cooldown: 2.8
                },

                r: {
                    id: "adaptiveForm",
                    name: "Forma Adaptativa",
                    costType: "magic",
                    cost: 12,
                    cooldown: 8
                },

                /*
                    Dash de combate próprio.

                    NÃO substitui o Dash universal.
                */
                f: {
                    id: "riftStep",
                    name: "Passo da Fenda",
                    costType: "energy",
                    cost: 20,
                    cooldown: 6
                }

            }

        });


    /* =========================================================
       NPCs

       Falas antigas preservadas quando recuperadas.
       ========================================================= */

    const NPC_LIBRARY =
        Object.freeze({

            elian: {

                id:
                    "elian",

                name:
                    "ELIAN",

                role:
                    "Morador",

                color:
                    "#d4b27c",

                lines: [

                    "A Quietude parece estar chegando mais perto. Ontem eu esqueci o nome da rua onde cresci.",

                    "Meu pai dizia que a primeira coisa que some não é um lugar. É a lembrança de que ele existia.",

                    "A estrada leste está estranha. Um Guardião apareceu por lá e não deixa ninguém passar.",

                    "Se você descobrir alguma coisa fora da vila, volte. Precisamos de histórias novas para não esquecer as antigas."

                ]

            },


            mara: {

                id:
                    "mara",

                name:
                    "MARA",

                role:
                    "Historiadora",

                color:
                    "#b98bc4",

                lines: [

                    "Os registros mais antigos falam da Quietude como se ela já tivesse acontecido antes.",

                    "Cada pessoa descreve a Quietude de um jeito diferente. Isso é o que mais me assusta.",

                    "Alguns livros têm páginas inteiras em branco, mas a numeração continua como se algo estivesse faltando.",

                    "Quando você encontrar algo que não consegue explicar, tente lembrar de cada detalhe antes de voltar."

                ]

            },


            doran: {

                id:
                    "doran",

                name:
                    "DORAN",

                role:
                    "Comerciante",

                color:
                    "#c58a54",

                merchant:
                    true,

                lines: [

                    "Compro materiais e vendo o que consigo trazer de fora.",

                    "Uma boa espada não resolve todos os problemas, mas resolve alguns deles bem rápido.",

                    "Guarde dinheiro para quando realmente precisar. As regiões além da vila não são gentis.",

                    "Se encontrar cristais ou minérios raros, eu pago bem."

                ]

            },


            bran: {

                id:
                    "bran",

                name:
                    "BRAN",

                role:
                    "Carpinteiro",

                color:
                    "#8d7053",

                questId:
                    "wood",

                lines: [

                    "Preciso reforçar algumas casas. A madeira anda apodrecendo mais rápido desde que a Quietude chegou.",

                    "As árvores daqui são estranhas. Algumas voltam a nascer longe do lugar onde caíram.",

                    "Se puder trazer dez madeiras, eu pago pelo trabalho.",

                    "Cortar madeira consome magia. Não se esgote por causa de uma árvore."

                ]

            },


            borin: {

                id:
                    "borin",

                name:
                    "BORIN",

                role:
                    "Ferreiro",

                color:
                    "#8e8d89",

                blacksmith:
                    true,

                questId:
                    "coal",

                lines: [

                    "O fogo da forja ainda lembra como queimar. Por enquanto.",

                    "Carvão bom está ficando difícil de encontrar.",

                    "Se trouxer oito carvões, posso compensar seu esforço.",

                    "Equipamento é investimento. Sobreviver costuma sair mais barato que morrer."

                ]

            },


            miguel: {

                id:
                    "miguel",

                name:
                    "MIGUEL",

                role:
                    "???",

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
                    NÃO inventar a loja dele.
                */
                vendorConfig:
                    null

            }

        });


    /* =========================================================
       INIMIGOS

       CADA ESPÉCIE POSSUI MECÂNICA PRÓPRIA.
       ========================================================= */

    const ENEMY_TYPES =
        Object.freeze({

            wolf: {

                id:
                    "wolf",

                name:
                    "LOBO",

                spriteType:
                    "wolf",

                hp:
                    88,

                damage:
                    14,

                speed:
                    112,

                vision:
                    320,

                attackRange:
                    52,

                radius:
                    20,

                xp:
                    22,

                money:
                    7,

                color:
                    "#70665d",

                ability: {

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

                }

            },


            boar: {

                id:
                    "boar",

                name:
                    "JAVALI",

                spriteType:
                    "boar",

                hp:
                    125,

                damage:
                    18,

                speed:
                    88,

                vision:
                    300,

                attackRange:
                    56,

                radius:
                    23,

                xp:
                    29,

                money:
                    9,

                color:
                    "#765f4c",

                ability: {

                    id:
                        "boarCharge",

                    type:
                        "heavyCharge",

                    cooldown:
                        3,

                    telegraph:
                        0.7,

                    speed:
                        340,

                    duration:
                        0.58,

                    damageMultiplier:
                        1.35

                }

            },


            thornling: {

                id:
                    "thornling",

                name:
                    "ESPINHEIRO VIVO",

                spriteType:
                    "thornling",

                hp:
                    145,

                damage:
                    21,

                speed:
                    78,

                vision:
                    325,

                attackRange:
                    130,

                radius:
                    21,

                xp:
                    36,

                money:
                    11,

                color:
                    "#4f6d43",

                ability: {

                    id:
                        "thornRoots",

                    type:
                        "rootShot",

                    cooldown:
                        3.4

                }

            },


            stoneCrawler: {

                id:
                    "stoneCrawler",

                name:
                    "RASTEJANTE DE PEDRA",

                spriteType:
                    "stoneCrawler",

                hp:
                    185,

                damage:
                    25,

                speed:
                    72,

                vision:
                    310,

                attackRange:
                    62,

                radius:
                    23,

                xp:
                    42,

                money:
                    14,

                color:
                    "#73736d",

                ability: {

                    id:
                        "stoneSlam",

                    type:
                        "groundSlam",

                    cooldown:
                        3.2

                }

            },


            mineCrawler: {

                id:
                    "mineCrawler",

                name:
                    "RASTEJANTE DA MINA",

                spriteType:
                    "mineCrawler",

                hp:
                    215,

                damage:
                    29,

                speed:
                    76,

                vision:
                    335,

                attackRange:
                    68,

                radius:
                    23,

                xp:
                    50,

                money:
                    17,

                color:
                    "#55524d",

                ability: {

                    id:
                        "oreBurst",

                    type:
                        "oreBurst",

                    cooldown:
                        3.1

                }

            },


            rubyHound: {

                id:
                    "rubyHound",

                name:
                    "CÃO DE RUBI",

                spriteType:
                    "rubyHound",

                hp:
                    250,

                damage:
                    33,

                speed:
                    116,

                vision:
                    370,

                attackRange:
                    62,

                radius:
                    22,

                xp:
                    60,

                money:
                    22,

                color:
                    "#843c4c",

                ability: {

                    id:
                        "rubyCharge",

                    type:
                        "burningCharge",

                    cooldown:
                        2.6,

                    telegraph:
                        0.55,

                    speed:
                        430,

                    duration:
                        0.48,

                    damageMultiplier:
                        1.18

                }

            },


            spider: {

                id:
                    "spider",

                name:
                    "ARANHA DA CAVERNA",

                spriteType:
                    "spider",

                hp:
                    135,

                damage:
                    20,

                speed:
                    98,

                vision:
                    325,

                attackRange:
                    145,

                radius:
                    18,

                xp:
                    38,

                money:
                    11,

                color:
                    "#4d3e50",

                ability: {

                    id:
                        "webShot",

                    type:
                        "web",

                    cooldown:
                        3,

                    slowDuration:
                        1.5

                }

            },


            scorpion: {

                id:
                    "scorpion",

                name:
                    "ESCORPIÃO SOMBRIO",

                spriteType:
                    "scorpion",

                hp:
                    165,

                damage:
                    24,

                speed:
                    91,

                vision:
                    330,

                attackRange:
                    70,

                radius:
                    20,

                xp:
                    44,

                money:
                    13,

                color:
                    "#5c4959",

                ability: {

                    id:
                        "poisonSting",

                    type:
                        "poison",

                    cooldown:
                        2.7,

                    poisonDuration:
                        3

                }

            },


            bat: {

                id:
                    "bat",

                name:
                    "MORCEGO DA QUIETUDE",

                spriteType:
                    "bat",

                hp:
                    105,

                damage:
                    18,

                speed:
                    130,

                vision:
                    370,

                attackRange:
                    64,

                radius:
                    17,

                xp:
                    32,

                money:
                    9,

                color:
                    "#4f4559",

                ability: {

                    id:
                        "batDive",

                    type:
                        "dive",

                    cooldown:
                        2.4,

                    telegraph:
                        0.45

                }

            }

        });


    /* =========================================================
       BOSSES

       Visual terá CORPO desenhado,
       ícone representativo,
       aura, sombra e efeitos.

       Cervo NÃO usa barra grande.
       ========================================================= */

    const BOSS_REGISTRY =
        Object.freeze([

            {
                id: "road_guardian",
                name: "GUARDIÃO DA ESTRADA",
                icon: "🛡️",
                type: "progression",
                topBar: true,
                bodyStyle: "roadSentinel",
                color: "#827567",
                aura: "#c3a977"
            },

            {
                id: "forest_warden",
                name: "VIGIA DA FLORESTA",
                icon: "🌲",
                type: "progression",
                topBar: true,
                bodyStyle: "forestBeast",
                color: "#47603f",
                aura: "#73985f"
            },

            {
                id: "grove_heart",
                name: "CORAÇÃO DO BOSQUE",
                icon: "🌿",
                type: "progression",
                topBar: true,
                bodyStyle: "groveHeart",
                color: "#557143",
                aura: "#95b765"
            },

            {
                id: "mountain_titan",
                name: "TITÃ DAS MONTANHAS",
                icon: "🏔️",
                type: "progression",
                topBar: true,
                bodyStyle: "mountainTitan",
                color: "#7b7d79",
                aura: "#c9cfcd"
            },

            {
                id: "iron_colossus",
                name: "COLOSSO DE FERRO",
                icon: "⚙️",
                type: "progression",
                topBar: true,
                bodyStyle: "ironColossus",
                color: "#555658",
                aura: "#a3a5a7"
            },

            {
                id: "ruby_chimera",
                name: "QUIMERA DE RUBI",
                icon: "♦️",
                type: "progression",
                topBar: true,
                bodyStyle: "rubyChimera",
                color: "#8b394b",
                aura: "#d95870"
            },

            {
                id: "monarch",
                name: "O MONARCA",
                icon: "♛",
                type: "progression",
                topBar: true,
                bodyStyle: "monarch",
                color: "#483c55",
                aura: "#9f7fc0"
            },

            {
                id: "shadow_lord",
                name: "SENHOR DAS SOMBRAS",
                icon: "◈",
                type: "progression",
                topBar: true,
                bodyStyle: "shadowLord",
                color: "#41394e",
                aura: "#7d6595"
            },

            {
                id: "fairy_guardian",
                name: "GUARDIÃ FEÉRICA",
                icon: "✧",
                type: "progression",
                topBar: true,
                bodyStyle: "fairyGuardian",
                color: "#b877a7",
                aura: "#f0acd9"
            },

            {
                id: "path_guardian",
                name: "GUARDIÃO DO CAMINHO",
                icon: "☁️",
                type: "progression",
                topBar: true,
                bodyStyle: "pathGuardian",
                color: "#adbcc0",
                aura: "#e3eff0"
            },

            {
                id: "hell_guardian",
                name: "GUARDIÃO DO INFERNO",
                icon: "🔥",
                type: "progression",
                topBar: true,
                bodyStyle: "hellGuardian",
                color: "#6c3029",
                aura: "#df553b"
            },

            {
                id: "other_self",
                name: "O OUTRO EU",
                icon: "◐",
                type: "progression",
                topBar: true,
                bodyStyle: "mirrorSelf",
                color: "#756483",
                aura: "#b69cc7"
            },

            {
                id: "ancient_deer",
                name: "CERVO ANCESTRAL",
                icon: "🦌",
                type: "resourceBoss",
                topBar: false,
                bodyStyle: "ancientDeer",
                color: "#75674f",
                aura: "#b9aa7f"
            }

        ]);


    function getBossDefinition(
        id
    ) {

        return (

            BOSS_REGISTRY.find(
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

        if (!enemy) {

            return false;

        }


        const boss =
            getBossDefinition(
                enemy.id
            );


        return Boolean(

            boss &&
            boss.type ===
            "progression" &&
            boss.topBar ===
            true

        );

    }


    /* =========================================================
       INVENTÁRIO
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
            !ITEMS[id]
        ) {

            return 0;

        }


        return Math.max(

            0,

            Math.floor(

                finiteNumber(

                    state.player
                        .inventory
                        ?.[id],

                    0

                )

            )

        );

    }


    function getItemCount(
        id
    ) {

        const item =
            ITEMS[id];


        if (!item) {

            return 0;

        }


        /*
            MATERIAIS INFINITOS DE TESTE
            NÃO ALTERAM O SAVE.
        */
        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMaterials &&
            item.category ===
            "materials"
        ) {

            return 999999;

        }


        return getRealItemCount(
            id
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


        const safeAmount =
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
            safeAmount <=
            0
        ) {

            return false;

        }


        state.player.inventory[id] =

            getRealItemCount(
                id
            ) +

            safeAmount;


        if (
            !options.silent &&
            typeof showToast ===
            "function"
        ) {

            showToast(
                `${ITEMS[id].name}: +${safeAmount}`
            );

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


        const safeAmount =
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
            Cheat não altera quantidade real.
        */
        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMaterials &&
            ITEMS[id]
                .category ===
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
            safeAmount
        ) {

            return false;

        }


        state.player.inventory[id] =
            current -
            safeAmount;


        return true;

    }


    /* =========================================================
       PESO
       ========================================================= */

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
                state.player.inventory
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


            weight +=

                (
                    item.weight ||
                    0
                ) *

                amount;

        }


        return weight;

    }


    function canCarryItem(
        id,
        amount = 1
    ) {

        if (
            !state.player ||
            !ITEMS[id]
        ) {

            return false;

        }


        const weight =

            getInventoryWeight() +

            (
                ITEMS[id].weight ||
                0
            ) *
            amount;


        return (
            weight <=
            state.player
                .inventoryWeightLimit
        );

    }


    /* =========================================================
       DINHEIRO

       Cheat de moedas infinitas
       não grava 999999 no save.
       ========================================================= */

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

            finiteNumber(
                state.player
                    ?.money,
                0
            ) >=

            amount

        );

    }


    function spendMoney(
        amount
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteMoney
        ) {

            return true;

        }


        const safe =
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        if (
            state.player.money <
            safe
        ) {

            return false;

        }


        state.player.money -=
            safe;


        return true;

    }


    function addMoney(
        amount
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        state.player.money +=
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        return true;

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

            Math.floor(

                finiteNumber(
                    state.player
                        ?.money,
                    0
                )

            )

        );

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


        inventory.pocao =
            2;


        inventory.elixir =
            1;


        return {

            characterId:
                character.id,

            name:
                name,

            className:
                character.className,

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

            moveX:
                0,

            moveY:
                0,

            walkTime:
                0,

            /*
                BASES.
            */
            baseHp:
                character.hp,

            baseMagic:
                character.magic,

            baseEnergy:
                character.energy,

            baseDamage:
                character.damage,

            baseDefense:
                character.defense,

            baseSpeed:
                character.speed,

            /*
                ATUAIS / CALCULADOS.
            */
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

            /*
                LEVEL.
            */
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

            /*
                SOMENTE esses quatro.
            */
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

            money:
                0,

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

            /*
                Impede comprar armadura velha outra vez
                depois de avançar.
            */
            armorHighestTierEver:
                0,

            purchasedUniqueItems:
                [],

            abilities: {

                dash:
                    false,

                /*
                    Reservados apenas para compatibilidade.
                    Não inventam habilidade nova.
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

            defeatedBosses:
                [],

            discoveredBosses:
                [],

            exploredAreas: [
                "village"
            ],

            unlockedAreas: [
                "village"
            ],

            worldSeeds:
                {},

            collected:
                {},

            hellTypesDefeated:
                {},

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

            monarchHits:
                0,

            dashPurchased:
                false,

            fluteRewardGranted:
                false,

            flutePlayed:
                false,

            finalChoice:
                null,

            finalDefeated:
                false,

            minimapOwned:
                false,

            lanternOwned:
                false,

            checkpoint: {

                area:
                    PLAYER_HOME.area,

                houseId:
                    PLAYER_HOME.houseId,

                type:
                    "playerHome"

            },

            /*
                COMBATE.
            */
            dead:
                false,

            invincible:
                0,

            hurtAnim:
                0,

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

            itemCooldowns:
                {},

            activePotionBuffs:
                [],

            adaptiveBuff:
                null,

            playerDash:
                null,

            zephyrDash:
                null,

            /*
                Animação de descanso.
            */
            resting: {

                active:
                    false,

                timer:
                    0,

                duration:
                    0

            }

        };

    }


    /* =========================================================
       RECALCULAR STATUS

       Nível por si só NÃO aumenta status.
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
            getCharacterById(
                player.characterId
            );


        if (!character) {

            return;

        }


        const oldMaxHp =
            Math.max(
                1,
                finiteNumber(
                    player.maxHp,
                    character.hp
                )
            );


        const oldMaxMagic =
            Math.max(
                1,
                finiteNumber(
                    player.maxMagic,
                    character.magic
                )
            );


        const oldMaxEnergy =
            Math.max(
                1,
                finiteNumber(
                    player.maxEnergy,
                    character.energy
                )
            );


        const oldMaxHunger =
            Math.max(
                1,
                finiteNumber(
                    player.maxHunger,
                    100
                )
            );


        const oldMaxFatigue =
            Math.max(
                1,
                finiteNumber(
                    player.maxFatigue,
                    100
                )
            );


        const hpRatio =
            clamp(
                player.hp /
                oldMaxHp,
                0,
                1
            );


        const magicRatio =
            clamp(
                player.magic /
                oldMaxMagic,
                0,
                1
            );


        const energyRatio =
            clamp(
                player.energy /
                oldMaxEnergy,
                0,
                1
            );


        const hungerRatio =
            clamp(
                player.hunger /
                oldMaxHunger,
                0,
                1
            );


        const fatigueRatio =
            clamp(
                player.fatigue /
                oldMaxFatigue,
                0,
                1
            );


        const armor =
            getEquippedArmor();


        const powerPoints =
            clamp(
                finiteNumber(
                    player.stats
                        ?.power,
                    0
                ),
                0,
                STAT_CAP
            );


        const energyPoints =
            clamp(
                finiteNumber(
                    player.stats
                        ?.energy,
                    0
                ),
                0,
                STAT_CAP
            );


        const hungerPoints =
            clamp(
                finiteNumber(
                    player.stats
                        ?.hunger,
                    0
                ),
                0,
                STAT_CAP
            );


        const fatiguePoints =
            clamp(
                finiteNumber(
                    player.stats
                        ?.fatigue,
                    0
                ),
                0,
                STAT_CAP
            );


        /*
            VIDA:
            base do personagem + armadura.
        */
        player.maxHp =

            character.hp +

            (
                armor
                    ?.hpBonus ||
                0
            );


        /*
            FORÇA/MAGIA:
            mesma árvore de status.
        */
        player.maxMagic =

            character.magic +

            powerPoints *

            STAT_CONFIG
                .power
                .magicPerPoint;


        player.maxEnergy =

            character.energy +

            energyPoints *

            STAT_CONFIG
                .energy
                .amountPerPoint;


        player.maxHunger =

            100 +

            hungerPoints *

            STAT_CONFIG
                .hunger
                .amountPerPoint;


        player.maxFatigue =

            100 +

            fatiguePoints *

            STAT_CONFIG
                .fatigue
                .amountPerPoint;


        const weaponDamage =

            ITEMS[
                player.equipment
                    .weapon
            ]?.damage ||
            0;


        const strengthMultiplier =

            1 +

            powerPoints *

            STAT_CONFIG
                .power
                .damagePerPoint;


        player.damage =

            (
                character.damage +
                weaponDamage
            ) *

            strengthMultiplier;


        const resistanceBonus =
            player.activePotionBuffs
                .filter(
                    buff =>
                        buff.type ===
                        "resistance"
                )
                .reduce(
                    (
                        total,
                        buff
                    ) =>
                        total +
                        finiteNumber(
                            buff.defenseBonus,
                            0
                        ),
                    0
                );


        player.defense =

            character.defense +

            (
                armor
                    ?.defense ||
                0
            ) +

            resistanceBonus;


        const speedBuff =
            player.activePotionBuffs
                .find(
                    buff =>
                        buff.type ===
                        "speed"
                );


        player.speed =

            character.speed *

            (
                speedBuff
                    ?.speedMultiplier ||
                1
            );


        /*
            Recalcular não pode curar infinitamente
            só equipando/desequipando.
        */
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
       WORLD SEEDS
       ========================================================= */

    function ensureWorldSeed(
        area
    ) {

        if (
            !state.player
        ) {

            return hashString(
                `veyra:${area}`
            );

        }


        state.player.worldSeeds =
            state.player.worldSeeds ||
            {};


        if (
            !Number.isFinite(
                state.player
                    .worldSeeds[
                        area
                    ]
            )
        ) {

            state.player
                .worldSeeds[
                    area
                ] =
                Math.floor(
                    Math.random() *
                    0xffffffff
                ) >>>
                0;

        }


        return state.player
            .worldSeeds[
                area
            ];

    }


    function getWorldSeed(
        area
    ) {

        return ensureWorldSeed(
            area
        );

    }


    function getAreaRng(
        area,
        salt = "default"
    ) {

        const seed =

            getWorldSeed(
                area
            ) ^

            hashString(
                salt
            );


        return mulberry32(
            seed
        );

    }


    /* =========================================================
       DEV / TESTES PRIVADOS

       NÃO É PARTE DO SAVE DO PERSONAGEM.
       ========================================================= */

    const DEV_STORAGE = Object.freeze({

        passwordHash:
            "veyra_v25_dev_password_hash",

        remember:
            "veyra_v25_dev_remember",

        unlocked:
            "veyra_v25_dev_unlocked",

        privacy:
            "veyra_v25_dev_privacy"

    });


    const DEV_SHORTCUTS =
        Object.freeze({

            panel:
                "X + Y",

            life:
                "X + 1",

            power:
                "X + 2",

            magic:
                "X + 3",

            energy:
                "X + 4",

            hunger:
                "X + 5",

            fatigue:
                "X + 6",

            money:
                "X + 7",

            materials:
                "X + 8",

            all:
                "X + 9",

            off:
                "X + 0"

        });


    function createDevRuntime() {

        return {

            unlocked:
                false,

            privacy:
                true,

            remember:
                true,

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

            panelOpen:
                false,

            lastCommandAt:
                0

        };

    }


    state.dev =
        createDevRuntime();


    /* =========================================================
       STORAGE SEGURO
       ========================================================= */

    function safeStorageGet(
        storage,
        key
    ) {

        try {

            return storage
                .getItem(
                    key
                );

        }

        catch {

            return null;

        }

    }


    function safeStorageSet(
        storage,
        key,
        value
    ) {

        try {

            storage.setItem(
                key,
                String(
                    value
                )
            );


            return true;

        }

        catch {

            return false;

        }

    }


    function safeStorageRemove(
        storage,
        key
    ) {

        try {

            storage.removeItem(
                key
            );

        }

        catch {
            /* armazenamento indisponível */
        }

    }


    /* =========================================================
       HASH DA SENHA

       Nunca salva senha em texto puro.
       ========================================================= */

    async function hashDevPassword(
        password,
        preferredAlgorithm = null
    ) {

        const normalized =
            String(
                password
            );


        /*
            Se verificando um hash antigo,
            usa o mesmo algoritmo do hash salvo.
        */
        const wantsFallback =
            preferredAlgorithm ===
            "fnv";


        if (
            !wantsFallback &&
            window.crypto
                ?.subtle &&
            typeof TextEncoder ===
            "function"
        ) {

            try {

                const bytes =
                    new TextEncoder()
                        .encode(
                            `VEYRA::V25::${normalized}`
                        );


                const hashBuffer =
                    await window.crypto
                        .subtle
                        .digest(
                            "SHA-256",
                            bytes
                        );


                const hashArray =
                    Array.from(
                        new Uint8Array(
                            hashBuffer
                        )
                    );


                const hexadecimal =
                    hashArray
                        .map(
                            byte =>
                                byte
                                    .toString(16)
                                    .padStart(
                                        2,
                                        "0"
                                    )
                        )
                        .join(
                            ""
                        );


                return (
                    `sha256:${hexadecimal}`
                );

            }

            catch {
                /*
                    Cai para fallback.
                */
            }

        }


        /*
            Fallback para abrir via navegador local
            mesmo quando Web Crypto não estiver disponível.
        */
        let hash =
            hashString(
                `VEYRA::V25::${normalized}`
            );


        for (
            let i = 0;
            i < 1500;
            i++
        ) {

            hash =
                hashString(
                    `${hash}:${normalized.length}:${i}`
                );

        }


        return (
            `fnv:${hash.toString(16)}`
        );

    }


    async function verifyDevPassword(
        password
    ) {

        const stored =
            safeStorageGet(
                localStorage,
                DEV_STORAGE
                    .passwordHash
            );


        if (!stored) {

            return false;

        }


        const algorithm =
            stored.startsWith(
                "fnv:"
            )
                ? "fnv"
                : "sha256";


        const candidate =
            await hashDevPassword(
                password,
                algorithm
            );


        return (
            candidate ===
            stored
        );

    }


    /* =========================================================
       PRIMEIRA SENHA
       ========================================================= */

    function hasDevPassword() {

        return Boolean(

            safeStorageGet(
                localStorage,
                DEV_STORAGE
                    .passwordHash
            )

        );

    }


    async function createDevPassword(
        password
    ) {

        const text =
            String(
                password
            );


        if (
            text.length <
            4
        ) {

            return {
                ok: false,
                message:
                    "A senha precisa ter pelo menos 4 caracteres."
            };

        }


        const hash =
            await hashDevPassword(
                text
            );


        const saved =
            safeStorageSet(
                localStorage,
                DEV_STORAGE
                    .passwordHash,
                hash
            );


        if (!saved) {

            return {
                ok: false,
                message:
                    "O navegador não permitiu salvar a senha."
            };

        }


        return {
            ok: true,
            message:
                "Senha de comandos criada."
        };

    }


    /* =========================================================
       LEMBRAR / PRIVACIDADE
       ========================================================= */

    function restoreDevPreferences() {

        state.dev.privacy =

            safeStorageGet(
                localStorage,
                DEV_STORAGE
                    .privacy
            ) !==
            "0";


        state.dev.remember =

            safeStorageGet(
                localStorage,
                DEV_STORAGE
                    .remember
            ) !==
            "0";


        const remembered =

            safeStorageGet(
                localStorage,
                DEV_STORAGE
                    .unlocked
            ) ===
            "1";


        const sessionUnlocked =

            safeStorageGet(
                sessionStorage,
                DEV_STORAGE
                    .unlocked
            ) ===
            "1";


        state.dev.unlocked =

            Boolean(
                hasDevPassword() &&
                (
                    remembered ||
                    sessionUnlocked
                )
            );

    }


    function setDevPrivacy(
        enabled
    ) {

        state.dev.privacy =
            Boolean(
                enabled
            );


        safeStorageSet(
            localStorage,
            DEV_STORAGE
                .privacy,
            state.dev.privacy
                ? "1"
                : "0"
        );

    }


    function setDevRemember(
        enabled
    ) {

        state.dev.remember =
            Boolean(
                enabled
            );


        safeStorageSet(
            localStorage,
            DEV_STORAGE
                .remember,
            state.dev.remember
                ? "1"
                : "0"
        );

    }


    function rememberDevUnlock() {

        if (
            state.dev.remember
        ) {

            safeStorageSet(
                localStorage,
                DEV_STORAGE
                    .unlocked,
                "1"
            );


            safeStorageRemove(
                sessionStorage,
                DEV_STORAGE
                    .unlocked
            );

        }

        else {

            safeStorageRemove(
                localStorage,
                DEV_STORAGE
                    .unlocked
            );


            safeStorageSet(
                sessionStorage,
                DEV_STORAGE
                    .unlocked,
                "1"
            );

        }

    }


    function forgetDevAccess() {

        safeStorageRemove(
            localStorage,
            DEV_STORAGE
                .unlocked
        );


        safeStorageRemove(
            sessionStorage,
            DEV_STORAGE
                .unlocked
        );


        state.dev.unlocked =
            false;


        disableAllDevCommands();

    }


    /* =========================================================
       PAINEL COMANDOS

       O CSS será estilizado no style.css.

       Mesmo sendo criado pelo JS,
       nenhum CSS é colocado aqui.
       ========================================================= */

    function createDevCommandPanel() {

        let panel =
            $("devCommandPanel");


        if (panel) {

            return panel;

        }


        panel =
            document.createElement(
                "section"
            );


        panel.id =
            "devCommandPanel";


        panel.className =
            "dev-command-panel hidden";


        panel.setAttribute(
            "aria-hidden",
            "true"
        );


        panel.innerHTML = `
            <div class="dev-command-card">

                <div class="dev-command-header">
                    <div>
                        <span class="dev-command-kicker">VEYRA — ÁREA DE TESTES</span>
                        <h3>COMANDOS:</h3>
                    </div>

                    <button
                        id="devCommandCloseBtn"
                        class="dev-command-close"
                        type="button"
                        aria-label="Fechar comandos"
                    >
                        ×
                    </button>
                </div>

                <p
                    id="devCommandInfo"
                    class="dev-command-info"
                ></p>

                <form
                    id="devCommandForm"
                    autocomplete="off"
                >
                    <label
                        class="dev-command-label"
                        for="devPasswordInput"
                    >
                        SENHA
                    </label>

                    <input
                        id="devPasswordInput"
                        class="dev-command-password"
                        type="password"
                        autocomplete="new-password"
                        spellcheck="false"
                        maxlength="64"
                        placeholder="••••••••"
                    >

                    <div class="dev-command-options">

                        <label>
                            <input
                                id="devRememberInput"
                                type="checkbox"
                                checked
                            >
                            Lembrar acesso
                        </label>

                        <label>
                            <input
                                id="devPrivacyInput"
                                type="checkbox"
                                checked
                            >
                            Privacidade
                        </label>

                    </div>

                    <button
                        id="devUnlockBtn"
                        class="dev-command-main-btn"
                        type="submit"
                    >
                        ENTRAR
                    </button>
                </form>

                <div
                    id="devUnlockedArea"
                    class="dev-unlocked-area hidden"
                >

                    <div class="dev-command-success">
                        ACESSO LIBERADO
                    </div>

                    <div class="dev-shortcut-list">

                        <span>X + 1</span><b>Vida infinita</b>
                        <span>X + 2</span><b>Força / Magia de teste</b>
                        <span>X + 3</span><b>Magia infinita</b>
                        <span>X + 4</span><b>Energia infinita</b>
                        <span>X + 5</span><b>Fome infinita</b>
                        <span>X + 6</span><b>Cansaço infinito</b>
                        <span>X + 7</span><b>Moedas infinitas</b>
                        <span>X + 8</span><b>Materiais infinitos</b>
                        <span>X + 9</span><b>Ativar tudo</b>
                        <span>X + 0</span><b>Desativar tudo</b>

                    </div>

                    <button
                        id="devForgetBtn"
                        class="dev-command-secondary-btn"
                        type="button"
                    >
                        ESQUECER ACESSO
                    </button>

                </div>

                <p
                    id="devCommandFeedback"
                    class="dev-command-feedback"
                    aria-live="polite"
                ></p>

            </div>
        `;


        document.body
            .appendChild(
                panel
            );


        bindDevCommandPanel(
            panel
        );


        refreshDevCommandPanel();


        return panel;

    }


    /* =========================================================
       PAINEL — BIND
       ========================================================= */

    function bindDevCommandPanel(
        panel
    ) {

        const form =
            panel.querySelector(
                "#devCommandForm"
            );


        const close =
            panel.querySelector(
                "#devCommandCloseBtn"
            );


        const remember =
            panel.querySelector(
                "#devRememberInput"
            );


        const privacy =
            panel.querySelector(
                "#devPrivacyInput"
            );


        const forget =
            panel.querySelector(
                "#devForgetBtn"
            );


        close
            ?.addEventListener(
                "click",
                closeDevCommandPanel
            );


        remember
            ?.addEventListener(
                "change",
                () => {

                    setDevRemember(
                        remember.checked
                    );

                }
            );


        privacy
            ?.addEventListener(
                "change",
                () => {

                    setDevPrivacy(
                        privacy.checked
                    );

                }
            );


        forget
            ?.addEventListener(
                "click",
                () => {

                    forgetDevAccess();

                    refreshDevCommandPanel();

                    setDevFeedback(
                        "Acesso esquecido."
                    );

                }
            );


        form
            ?.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const input =
                        panel.querySelector(
                            "#devPasswordInput"
                        );


                    const password =
                        input
                            ?.value ||
                        "";


                    if (
                        !hasDevPassword()
                    ) {

                        const result =
                            await createDevPassword(
                                password
                            );


                        if (
                            !result.ok
                        ) {

                            setDevFeedback(
                                result.message,
                                true
                            );


                            return;

                        }

                    }

                    else {

                        const valid =
                            await verifyDevPassword(
                                password
                            );


                        if (!valid) {

                            if (input) {

                                input.value =
                                    "";

                            }


                            setDevFeedback(
                                "Senha incorreta.",
                                true
                            );


                            return;

                        }

                    }


                    /*
                        NUNCA mantém senha digitada no campo.
                    */
                    if (input) {

                        input.value =
                            "";

                    }


                    state.dev.unlocked =
                        true;


                    rememberDevUnlock();


                    refreshDevCommandPanel();


                    setDevFeedback(
                        state.dev.privacy
                            ? "Acesso liberado."
                            : "Comandos de teste liberados."
                    );


                    if (
                        state.dev.privacy
                    ) {

                        window.setTimeout(
                            closeDevCommandPanel,
                            520
                        );

                    }

                }
            );

    }


    function refreshDevCommandPanel() {

        const panel =
            $("devCommandPanel");


        if (!panel) {

            return;

        }


        const info =
            panel.querySelector(
                "#devCommandInfo"
            );


        const form =
            panel.querySelector(
                "#devCommandForm"
            );


        const unlockedArea =
            panel.querySelector(
                "#devUnlockedArea"
            );


        const button =
            panel.querySelector(
                "#devUnlockBtn"
            );


        const remember =
            panel.querySelector(
                "#devRememberInput"
            );


        const privacy =
            panel.querySelector(
                "#devPrivacyInput"
            );


        if (remember) {

            remember.checked =
                state.dev.remember;

        }


        if (privacy) {

            privacy.checked =
                state.dev.privacy;

        }


        if (
            state.dev.unlocked
        ) {

            if (info) {

                info.textContent =
                    "Use as combinações de teclas abaixo durante os testes.";

            }


            form
                ?.classList
                .add(
                    "hidden"
                );


            unlockedArea
                ?.classList
                .remove(
                    "hidden"
                );


            return;

        }


        unlockedArea
            ?.classList
            .add(
                "hidden"
            );


        form
            ?.classList
            .remove(
                "hidden"
            );


        if (
            hasDevPassword()
        ) {

            if (info) {

                info.textContent =
                    "Digite sua senha de testes.";

            }


            if (button) {

                button.textContent =
                    "ENTRAR";

            }

        }

        else {

            if (info) {

                info.textContent =
                    "Primeiro acesso: crie sua senha privada de testes.";

            }


            if (button) {

                button.textContent =
                    "CRIAR SENHA";

            }

        }

    }


    function setDevFeedback(
        message,
        error = false
    ) {

        const element =
            $("devCommandFeedback");


        if (!element) {

            return;

        }


        /*
            Em privacidade,
            mensagens específicas de cheats
            não ficam expostas.
        */
        element.textContent =

            state.dev.privacy &&
            !error

                ? "✓"

                : message;


        element.classList
            .toggle(
                "error",
                error
            );

    }


    function openDevCommandPanel() {

        const panel =
            createDevCommandPanel();


        state.dev.panelOpen =
            true;


        panel.classList
            .remove(
                "hidden"
            );


        panel.setAttribute(
            "aria-hidden",
            "false"
        );


        refreshDevCommandPanel();


        const input =
            $("devPasswordInput");


        if (
            input &&
            !state.dev.unlocked
        ) {

            window.setTimeout(
                () =>
                    input.focus(),
                40
            );

        }

    }


    function closeDevCommandPanel() {

        const panel =
            $("devCommandPanel");


        if (!panel) {

            return;

        }


        const input =
            $("devPasswordInput");


        /*
            Sempre limpa a senha da memória do input
            ao fechar.
        */
        if (input) {

            input.value =
                "";

        }


        state.dev.panelOpen =
            false;


        panel.classList
            .add(
                "hidden"
            );


        panel.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function toggleDevCommandPanel() {

        if (
            state.dev.panelOpen
        ) {

            closeDevCommandPanel();

        }

        else {

            openDevCommandPanel();

        }

    }


    /* =========================================================
       DEV COMMANDS
       ========================================================= */

    function disableAllDevCommands() {

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


    function enableAllDevCommands() {

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


        maintainDevInfiniteResources();

    }


    function toggleDevFlag(
        flag
    ) {

        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    state.dev,
                    flag
                )
        ) {

            return false;

        }


        state.dev[flag] =
            !state.dev[flag];


        maintainDevInfiniteResources();


        return state.dev[flag];

    }


    function executeDevCommand(
        command
    ) {

        if (
            !state.dev.unlocked
        ) {

            return false;

        }


        let message =
            "Comando aplicado.";


        switch (
            command
        ) {

            case "life":

                toggleDevFlag(
                    "infiniteLife"
                );

                message =
                    `Vida infinita: ${state.dev.infiniteLife ? "ON" : "OFF"}`;

                break;


            case "power":

                toggleDevFlag(
                    "infinitePower"
                );

                message =
                    `Força/Magia de teste: ${state.dev.infinitePower ? "ON" : "OFF"}`;

                break;


            case "magic":

                toggleDevFlag(
                    "infiniteMagic"
                );

                message =
                    `Magia infinita: ${state.dev.infiniteMagic ? "ON" : "OFF"}`;

                break;


            case "energy":

                toggleDevFlag(
                    "infiniteEnergy"
                );

                message =
                    `Energia infinita: ${state.dev.infiniteEnergy ? "ON" : "OFF"}`;

                break;


            case "hunger":

                toggleDevFlag(
                    "infiniteHunger"
                );

                message =
                    `Fome infinita: ${state.dev.infiniteHunger ? "ON" : "OFF"}`;

                break;


            case "fatigue":

                toggleDevFlag(
                    "infiniteFatigue"
                );

                message =
                    `Cansaço infinito: ${state.dev.infiniteFatigue ? "ON" : "OFF"}`;

                break;


            case "money":

                toggleDevFlag(
                    "infiniteMoney"
                );

                message =
                    `Moedas infinitas: ${state.dev.infiniteMoney ? "ON" : "OFF"}`;

                break;


            case "materials":

                toggleDevFlag(
                    "infiniteMaterials"
                );

                message =
                    `Materiais infinitos: ${state.dev.infiniteMaterials ? "ON" : "OFF"}`;

                break;


            case "all":

                enableAllDevCommands();

                message =
                    "Todos os testes ativados.";

                break;


            case "off":

                disableAllDevCommands();

                message =
                    "Todos os testes desativados.";

                break;


            default:

                return false;

        }


        state.dev.lastCommandAt =
            performance.now();


        if (
            state.dev.privacy
        ) {

            setDevFeedback(
                "✓"
            );

        }

        else {

            setDevFeedback(
                message
            );


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    message
                );

            }

        }


        return true;

    }


    /* =========================================================
       RECURSOS INFINITOS
       ========================================================= */

    function maintainDevInfiniteResources() {

        if (
            !state.dev
                ?.unlocked ||
            !state.player
        ) {

            return;

        }


        if (
            state.dev.infiniteLife
        ) {

            state.player.hp =
                state.player.maxHp;

        }


        if (
            state.dev.infiniteMagic
        ) {

            state.player.magic =
                state.player.maxMagic;

        }


        if (
            state.dev.infiniteEnergy
        ) {

            state.player.energy =
                state.player.maxEnergy;

        }


        if (
            state.dev.infiniteHunger
        ) {

            state.player.hunger =
                state.player.maxHunger;

        }


        if (
            state.dev.infiniteFatigue
        ) {

            state.player.fatigue =
                state.player.maxFatigue;

        }

    }


    function devModifyOutgoingDamage(
        damage
    ) {

        const safe =
            Math.max(
                0,
                finiteNumber(
                    damage,
                    0
                )
            );


        if (
            state.dev
                ?.unlocked &&
            state.dev
                .infinitePower
        ) {

            return Math.max(
                safe,
                99999
            );

        }


        return safe;

    }


    function devShouldIgnorePlayerDamage() {

        return Boolean(

            state.dev
                ?.unlocked &&

            state.dev
                .infiniteLife

        );

    }


    /* =========================================================
       DEV SHORTCUTS

       COMANDOS SOMENTE POR TECLA.
       ========================================================= */

    function handleDevShortcutKeyDown(
        event
    ) {

        if (
            !state.dev
        ) {

            return false;

        }


        state.dev.keys.add(
            event.code
        );


        const xHeld =
            state.dev.keys.has(
                "KeyX"
            );


        if (!xHeld) {

            return false;

        }


        /*
            X + Y funciona mesmo bloqueado,
            porque abre o painel de senha.
        */
        if (
            event.code ===
            "KeyY"
        ) {

            event.preventDefault();

            toggleDevCommandPanel();

            return true;

        }


        if (
            !state.dev.unlocked
        ) {

            return false;

        }


        const commands = {

            Digit1:
                "life",

            Digit2:
                "power",

            Digit3:
                "magic",

            Digit4:
                "energy",

            Digit5:
                "hunger",

            Digit6:
                "fatigue",

            Digit7:
                "money",

            Digit8:
                "materials",

            Digit9:
                "all",

            Digit0:
                "off"

        };


        const command =
            commands[
                event.code
            ];


        if (!command) {

            return false;

        }


        event.preventDefault();

        event.stopPropagation();


        executeDevCommand(
            command
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


    function clearDevHeldKeys() {

        state.dev
            ?.keys
            ?.clear();

    }


    /* =========================================================
       VALIDAÇÃO DA PARTE 1

       Não inicia o jogo.
       Só verifica os dados fundamentais.
       ========================================================= */

    function validatePart1Data() {

        const errors =
            [];


        if (
            CHARACTERS.length !==
            5
        ) {

            errors.push(
                "Devem existir exatamente 5 personagens."
            );

        }


        const expectedArmor = [

            "armaduraFolha",
            "armaduraAlgodao",
            "armaduraMadeira",
            "armaduraCouro",
            "armaduraFerro",
            "armaduraOuro",
            "armaduraDiamante",
            "armaduraRubi"

        ];


        if (
            expectedArmor.length !==
            ARMOR_PROGRESSION.length ||

            !expectedArmor.every(
                (
                    id,
                    index
                ) =>
                    ARMOR_PROGRESSION[
                        index
                    ] ===
                    id
            )
        ) {

            errors.push(
                "Progressão das armaduras está fora de ordem."
            );

        }


        expectedArmor.forEach(
            (
                id,
                index
            ) => {

                const armor =
                    ARMOR_DATA[id];


                const expectedHp =
                    (
                        index +
                        1
                    ) *
                    25;


                if (
                    armor.hpBonus !==
                    expectedHp
                ) {

                    errors.push(
                        `${armor.name}: bônus de HP incorreto.`
                    );

                }

            }
        );


        if (
            getBossDefinition(
                "ancient_deer"
            )?.topBar !==
            false
        ) {

            errors.push(
                "Cervo Ancestral não pode usar a barra grande de boss."
            );

        }


        if (
            Object.keys(
                STAT_CONFIG
            ).some(
                id =>
                    ![
                        "power",
                        "energy",
                        "hunger",
                        "fatigue"
                    ].includes(
                        id
                    )
            )
        ) {

            errors.push(
                "Existe atributo distribuível não autorizado."
            );

        }


        if (
            errors.length >
            0
        ) {

            console.error(
                "VEYRA V25 — erros na Parte 1:",
                errors
            );


            return false;

        }


        return true;

    }


    /* =========================================================
       PREPARAÇÃO DO SISTEMA DEV

       A Parte 5 chamará createDevCommandPanel()
       durante initialize().

       Não existe senha padrão escrita no código.
       ========================================================= */

    restoreDevPreferences();


    /* =========================================================
       FIM DA PARTE 1/5

       PARTE 2 ENTRA DIRETAMENTE ABAIXO.

       NÃO COLOQUE })(); AQUI.
       ========================================================= */
 
