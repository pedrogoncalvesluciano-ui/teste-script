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
     /* =========================================================
       VEYRA: A QUIETUDE
       V25.0
       SCRIPT.JS — PARTE 2/5

       REGIÕES
       MAPA
       ESTRADAS
       CASAS
       INTERIORES
       PORTAS
       ÁREAS PROTEGIDAS
       GERAÇÃO SEGURA
       ÁRVORES
       RECURSOS
       PORTÕES
       LABIRINTO
       BARREIRA DA LANTERNA
       MUNDO

       CONTINUA DIRETAMENTE DA PARTE 1.
       ========================================================= */


    /* =========================================================
       REGIÕES
       ========================================================= */

    const REGIONS = Object.freeze({

        village: {
            id: "village",
            name: "VILA DO CREPÚSCULO",
            width: 3200,
            height: 2200,
            visual: "village",
            dark: false
        },

        forest: {
            id: "forest",
            name: "FLORESTA DE VEYRA",
            width: 3400,
            height: 2300,
            visual: "forest",
            dark: false
        },

        grove: {
            id: "grove",
            name: "BOSQUE DAS MEMÓRIAS",
            width: 3500,
            height: 2350,
            visual: "grove",
            dark: false
        },

        mountains: {
            id: "mountains",
            name: "MONTANHAS ESQUECIDAS",
            width: 3500,
            height: 2350,
            visual: "mountains",
            dark: false
        },

        iron: {
            id: "iron",
            name: "MINAS DE FERRO",
            width: 3400,
            height: 2250,
            visual: "iron",
            dark: false
        },

        ruby: {
            id: "ruby",
            name: "CAVERNA DE RUBI",
            width: 3500,
            height: 2300,
            visual: "ruby",
            dark: false
        },

        monarchMaze: {
            id: "monarchMaze",
            name: "LABIRINTO DO MONARCA",
            width: 3600,
            height: 2300,
            visual: "monarchMaze",
            dark: true
        },

        shadow: {
            id: "shadow",
            name: "CAVERNA SOMBRIA",
            width: 3300,
            height: 2200,
            visual: "shadow",
            dark: true
        },

        fairy: {
            id: "fairy",
            name: "REINO DAS FADAS",
            width: 3400,
            height: 2250,
            visual: "fairy",
            dark: false
        },

        sky: {
            id: "sky",
            name: "REINO CELESTE",
            width: 3400,
            height: 2250,
            visual: "sky",
            dark: false
        },

        hell: {
            id: "hell",
            name: "INFERNO",
            width: 3700,
            height: 2450,
            visual: "hell",
            dark: false
        },

        final: {
            id: "final",
            name: "CÂMARA FINAL",
            width: 2200,
            height: 1550,
            visual: "final",
            dark: false
        }

    });


    const PREVIOUS_REGION = Object.freeze({

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


    /* =========================================================
       ESTILO DOS BIOMAS
       ========================================================= */

    const BIOME_STYLE = Object.freeze({

        village: {
            ground: "#536b4b",
            groundAlt: "#4d6547",
            ambient: "#f0c979",
            ambientAlpha: 0.05,
            border: "#35432f",
            fog: null
        },

        forest: {
            ground: "#354d36",
            groundAlt: "#304832",
            ambient: "#92b568",
            ambientAlpha: 0.04,
            border: "#1e3023",
            fog: "#a9c5a1"
        },

        grove: {
            ground: "#40543a",
            groundAlt: "#394d35",
            ambient: "#9ab577",
            ambientAlpha: 0.05,
            border: "#283524",
            fog: "#bac7a1"
        },

        mountains: {
            ground: "#777d79",
            groundAlt: "#6f7572",
            ambient: "#dbe3e3",
            ambientAlpha: 0.06,
            border: "#515856",
            fog: "#d9e2e2"
        },

        iron: {
            ground: "#454746",
            groundAlt: "#3e4140",
            ambient: "#aa9e8e",
            ambientAlpha: 0.035,
            border: "#292b2b",
            fog: "#777876"
        },

        ruby: {
            ground: "#402d31",
            groundAlt: "#36272b",
            ambient: "#da5368",
            ambientAlpha: 0.07,
            border: "#241b1e",
            fog: "#7d3743"
        },

        monarchMaze: {
            ground: "#27232c",
            groundAlt: "#211e26",
            ambient: "#806592",
            ambientAlpha: 0.025,
            border: "#111014",
            fog: "#413849"
        },

        shadow: {
            ground: "#2b2933",
            groundAlt: "#25242d",
            ambient: "#6c6286",
            ambientAlpha: 0.03,
            border: "#15141a",
            fog: "#454153"
        },

        fairy: {
            ground: "#526358",
            groundAlt: "#4c5c52",
            ambient: "#e5a9d9",
            ambientAlpha: 0.08,
            border: "#35443a",
            fog: "#d5bcdb"
        },

        sky: {
            ground: "#aabec3",
            groundAlt: "#a3b6bc",
            ambient: "#fff3bc",
            ambientAlpha: 0.1,
            border: "#738d95",
            fog: "#e7f2f3"
        },

        hell: {
            ground: "#3b2824",
            groundAlt: "#33221f",
            ambient: "#ed6241",
            ambientAlpha: 0.08,
            border: "#211615",
            fog: "#76362d"
        },

        final: {
            ground: "#39343f",
            groundAlt: "#322e38",
            ambient: "#ae92bd",
            ambientAlpha: 0.06,
            border: "#1f1c23",
            fog: "#696071"
        }

    });


    function getRegionDefinition(
        id = state.area
    ) {

        return (
            REGIONS[id] ||
            REGIONS.village
        );

    }


    function getBiomeStyle(
        id = state.area
    ) {

        return (
            BIOME_STYLE[id] ||
            BIOME_STYLE.village
        );

    }


    function getPathStyle(
        id = state.area
    ) {

        return (
            PATH_STYLE_CONFIG[id] ||
            PATH_STYLE_CONFIG.village
        );

    }


    /* =========================================================
       INTERIORES

       Todos possuem identidade própria.

       Nenhum ocupa a tela inteira.
       ========================================================= */

    const HOUSE_INTERIORS = Object.freeze({

        home: {

            id: "home",

            name: "CASA DO AVENTUREIRO",

            worldWidth: 1080,

            worldHeight: 730,

            room: {
                x: 130,
                y: 100,
                w: 820,
                h: 515
            },

            playerSpawn: {
                x: 540,
                y: 515
            },

            door: {
                x: 495,
                y: 560,
                w: 90,
                h: 55
            },

            theme: {
                wall: "#49362f",
                floor: "#98704e",
                floorAlt: "#876344",
                trim: "#d6b279",
                accent: "#efb05b",
                light: "#f3ba68"
            },

            furniture: [

                {
                    type: "bed",
                    x: 185,
                    y: 170,
                    w: 145,
                    h: 82
                },

                {
                    type: "table",
                    x: 500,
                    y: 250,
                    w: 120,
                    h: 90
                },

                {
                    type: "chair",
                    x: 470,
                    y: 285,
                    w: 35,
                    h: 42
                },

                {
                    type: "chest",
                    x: 760,
                    y: 180,
                    w: 75,
                    h: 55
                },

                {
                    type: "bookshelf",
                    x: 700,
                    y: 410,
                    w: 135,
                    h: 42
                },

                {
                    type: "rug",
                    x: 390,
                    y: 320,
                    w: 290,
                    h: 145,
                    collision: false
                },

                {
                    type: "lamp",
                    x: 370,
                    y: 175,
                    w: 25,
                    h: 25,
                    collision: false
                }

            ],

            npcs: []

        },


        elianHome: {

            id: "elianHome",

            name: "CASA DE ELIAN",

            worldWidth: 1080,

            worldHeight: 720,

            room: {
                x: 140,
                y: 105,
                w: 800,
                h: 500
            },

            playerSpawn: {
                x: 540,
                y: 510
            },

            door: {
                x: 495,
                y: 552,
                w: 90,
                h: 53
            },

            theme: {
                wall: "#3f3831",
                floor: "#856a50",
                floorAlt: "#796047",
                trim: "#cab07e",
                accent: "#6d8790",
                light: "#dbc28c"
            },

            furniture: [

                {
                    type: "bed",
                    x: 190,
                    y: 165,
                    w: 135,
                    h: 82
                },

                {
                    type: "bookshelf",
                    x: 690,
                    y: 165,
                    w: 145,
                    h: 46
                },

                {
                    type: "bookshelf",
                    x: 690,
                    y: 235,
                    w: 145,
                    h: 46
                },

                {
                    type: "table",
                    x: 455,
                    y: 300,
                    w: 125,
                    h: 90
                },

                {
                    type: "chair",
                    x: 425,
                    y: 325,
                    w: 36,
                    h: 42
                },

                {
                    type: "plant",
                    x: 220,
                    y: 410,
                    w: 38,
                    h: 38
                },

                {
                    type: "rug",
                    x: 365,
                    y: 255,
                    w: 280,
                    h: 180,
                    collision: false
                }

            ],

            npcs: [

                {
                    libraryId: "elian",
                    x: 710,
                    y: 365
                }

            ]

        },


        shop: {

            id: "shop",

            name: "LOJA DE DORAN",

            worldWidth: 1100,

            worldHeight: 730,

            room: {
                x: 100,
                y: 90,
                w: 900,
                h: 530
            },

            playerSpawn: {
                x: 550,
                y: 525
            },

            door: {
                x: 505,
                y: 565,
                w: 90,
                h: 55
            },

            theme: {
                wall: "#3e2e28",
                floor: "#8c6847",
                floorAlt: "#7d5b3e",
                trim: "#e0bc75",
                accent: "#e8c56f",
                light: "#ffd685"
            },

            furniture: [

                {
                    type: "counter",
                    x: 620,
                    y: 250,
                    w: 245,
                    h: 68
                },

                {
                    type: "shelf",
                    x: 175,
                    y: 160,
                    w: 210,
                    h: 45
                },

                {
                    type: "shelf",
                    x: 175,
                    y: 235,
                    w: 210,
                    h: 45
                },

                {
                    type: "shelf",
                    x: 175,
                    y: 310,
                    w: 210,
                    h: 45
                },

                {
                    type: "crate",
                    x: 755,
                    y: 410,
                    w: 70,
                    h: 70
                },

                {
                    type: "crate",
                    x: 840,
                    y: 420,
                    w: 58,
                    h: 58
                },

                {
                    type: "lanternStand",
                    x: 430,
                    y: 170,
                    w: 40,
                    h: 40
                },

                {
                    type: "rug",
                    x: 420,
                    y: 350,
                    w: 240,
                    h: 125,
                    collision: false
                }

            ],

            npcs: [

                {
                    libraryId: "doran",
                    x: 730,
                    y: 215
                }

            ]

        },


        forge: {

            id: "forge",

            name: "FORJA DE BORIN",

            worldWidth: 1100,

            worldHeight: 740,

            room: {
                x: 95,
                y: 85,
                w: 910,
                h: 545
            },

            playerSpawn: {
                x: 550,
                y: 530
            },

            door: {
                x: 505,
                y: 575,
                w: 90,
                h: 55
            },

            theme: {
                wall: "#292b2f",
                floor: "#55504a",
                floorAlt: "#494641",
                trim: "#a39789",
                accent: "#ff8149",
                light: "#ff9d5e"
            },

            furniture: [

                {
                    type: "forge",
                    x: 180,
                    y: 160,
                    w: 165,
                    h: 105
                },

                {
                    type: "anvil",
                    x: 440,
                    y: 275,
                    w: 85,
                    h: 60
                },

                {
                    type: "workbench",
                    x: 660,
                    y: 180,
                    w: 210,
                    h: 70
                },

                {
                    type: "weaponRack",
                    x: 720,
                    y: 355,
                    w: 145,
                    h: 55
                },

                {
                    type: "coalPile",
                    x: 190,
                    y: 390,
                    w: 110,
                    h: 80
                },

                {
                    type: "bucket",
                    x: 355,
                    y: 420,
                    w: 42,
                    h: 42
                }

            ],

            npcs: [

                {
                    libraryId: "borin",
                    x: 735,
                    y: 290
                }

            ]

        },


        woodshop: {

            id: "woodshop",

            name: "CARPINTARIA DE BRAN",

            worldWidth: 1080,

            worldHeight: 720,

            room: {
                x: 115,
                y: 95,
                w: 850,
                h: 515
            },

            playerSpawn: {
                x: 540,
                y: 515
            },

            door: {
                x: 495,
                y: 555,
                w: 90,
                h: 55
            },

            theme: {
                wall: "#493a2c",
                floor: "#94724f",
                floorAlt: "#836443",
                trim: "#d0a46c",
                accent: "#9c7549",
                light: "#ebbd77"
            },

            furniture: [

                {
                    type: "workbench",
                    x: 175,
                    y: 170,
                    w: 225,
                    h: 75
                },

                {
                    type: "woodPile",
                    x: 690,
                    y: 165,
                    w: 145,
                    h: 90
                },

                {
                    type: "sawTable",
                    x: 470,
                    y: 300,
                    w: 145,
                    h: 85
                },

                {
                    type: "toolRack",
                    x: 690,
                    y: 360,
                    w: 140,
                    h: 55
                },

                {
                    type: "crate",
                    x: 215,
                    y: 400,
                    w: 65,
                    h: 65
                },

                {
                    type: "stool",
                    x: 430,
                    y: 220,
                    w: 38,
                    h: 38
                }

            ],

            npcs: [

                {
                    libraryId: "bran",
                    x: 715,
                    y: 310
                }

            ]

        },


        forestShelter: {

            id: "forestShelter",

            name: "CABANA DA FLORESTA",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#374233",
                floor: "#705b3f",
                floorAlt: "#635038",
                trim: "#8da06d",
                accent: "#73905a",
                light: "#c4a570"
            },

            furniture: [

                {
                    type: "bed",
                    x: 175,
                    y: 165,
                    w: 125,
                    h: 75
                },

                {
                    type: "table",
                    x: 440,
                    y: 275,
                    w: 115,
                    h: 80
                },

                {
                    type: "herbRack",
                    x: 650,
                    y: 165,
                    w: 120,
                    h: 50
                },

                {
                    type: "woodPile",
                    x: 650,
                    y: 370,
                    w: 115,
                    h: 75
                }

            ],

            npcs: [

                {
                    id: "nara",
                    name: "NARA",
                    role: "Viajante",
                    color: "#879b72",
                    x: 680,
                    y: 300,
                    lines: [

                        "A floresta percebe quem passa por ela.",

                        "Há árvores que se movem quando ninguém está olhando.",

                        "A Quietude não mata todas as coisas. Algumas continuam andando sem lembrar por quê.",

                        "O caminho adiante só se abre para quem prova que consegue sobreviver aqui."

                    ]
                }

            ]

        },


        groveShelter: {

            id: "groveShelter",

            name: "CASA DAS RAÍZES",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#3b4434",
                floor: "#675c3f",
                floorAlt: "#5c5238",
                trim: "#9da66f",
                accent: "#829660",
                light: "#d1c381"
            },

            furniture: [

                {
                    type: "rootTable",
                    x: 420,
                    y: 255,
                    w: 150,
                    h: 100
                },

                {
                    type: "plant",
                    x: 180,
                    y: 175,
                    w: 55,
                    h: 55
                },

                {
                    type: "plant",
                    x: 710,
                    y: 180,
                    w: 55,
                    h: 55
                },

                {
                    type: "bookshelf",
                    x: 645,
                    y: 370,
                    w: 130,
                    h: 45
                }

            ],

            npcs: [

                {
                    id: "lyra",
                    name: "LYRA",
                    role: "Druida",
                    color: "#829f6f",
                    x: 680,
                    y: 310,
                    lines: [

                        "Este bosque guarda memórias nas raízes.",

                        "Quando uma árvore cai, às vezes outra nasce carregando lembranças que não são dela.",

                        "As montanhas ficam além deste lugar.",

                        "Não confunda silêncio com paz."

                    ]
                }

            ]

        },


        mountainShelter: {

            id: "mountainShelter",

            name: "ABRIGO DA MONTANHA",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#4b4e4c",
                floor: "#696660",
                floorAlt: "#5c5954",
                trim: "#b1aaa0",
                accent: "#d0d5d4",
                light: "#d6c9aa"
            },

            furniture: [

                {
                    type: "fireplace",
                    x: 180,
                    y: 160,
                    w: 125,
                    h: 85
                },

                {
                    type: "bed",
                    x: 650,
                    y: 165,
                    w: 125,
                    h: 75
                },

                {
                    type: "table",
                    x: 420,
                    y: 275,
                    w: 125,
                    h: 85
                },

                {
                    type: "supplyRack",
                    x: 650,
                    y: 380,
                    w: 125,
                    h: 45
                }

            ],

            npcs: [

                {
                    id: "kael",
                    name: "KAEL",
                    role: "Montanhista",
                    color: "#a7aba8",
                    x: 680,
                    y: 310,
                    lines: [

                        "O vento daqui apaga pegadas em minutos.",

                        "Há uma passagem antiga na montanha.",

                        "Minérios abaixo da neve ainda reagem à magia.",

                        "Não fique parado por muito tempo. Algumas coisas confundem viajantes com pedras."

                    ]
                }

            ]

        },


        ironShelter: {

            id: "ironShelter",

            name: "POSTO DOS MINEIROS",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#343637",
                floor: "#55524d",
                floorAlt: "#494744",
                trim: "#8f8b82",
                accent: "#a88d68",
                light: "#d0a96e"
            },

            furniture: [

                {
                    type: "mineCart",
                    x: 180,
                    y: 180,
                    w: 120,
                    h: 70
                },

                {
                    type: "orePile",
                    x: 650,
                    y: 170,
                    w: 120,
                    h: 80
                },

                {
                    type: "table",
                    x: 430,
                    y: 285,
                    w: 120,
                    h: 80
                },

                {
                    type: "toolRack",
                    x: 650,
                    y: 380,
                    w: 120,
                    h: 45
                }

            ],

            npcs: [

                {
                    id: "oren",
                    name: "OREN",
                    role: "Mineiro",
                    color: "#9c8c76",
                    x: 680,
                    y: 310,
                    lines: [

                        "A mina começou a fazer sons que não vêm das ferramentas.",

                        "O ferro daqui vibra quando alguma coisa grande se move nas galerias.",

                        "Já vi homens saírem daqui jurando que passaram anos lá dentro. Foram poucas horas.",

                        "Se encontrar a passagem rubra, mantenha os olhos longe das paredes por muito tempo."

                    ]
                }

            ]

        },


        rubyShelter: {

            id: "rubyShelter",

            name: "POSTO RUBRO",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#43292f",
                floor: "#5e4442",
                floorAlt: "#523936",
                trim: "#9c5862",
                accent: "#cf5266",
                light: "#db6c79"
            },

            furniture: [

                {
                    type: "crystalRack",
                    x: 180,
                    y: 170,
                    w: 125,
                    h: 70
                },

                {
                    type: "crystalRack",
                    x: 650,
                    y: 170,
                    w: 125,
                    h: 70
                },

                {
                    type: "table",
                    x: 420,
                    y: 285,
                    w: 135,
                    h: 85
                },

                {
                    type: "chest",
                    x: 650,
                    y: 390,
                    w: 78,
                    h: 55
                }

            ],

            npcs: [

                {
                    id: "sera",
                    name: "SERA",
                    role: "Exploradora",
                    color: "#b75c6b",
                    x: 680,
                    y: 310,
                    lines: [

                        "Os cristais ficam mais quentes quanto mais fundo você vai.",

                        "Não confunda o brilho dos rubis com segurança.",

                        "Existe algo depois desta caverna. Um lugar onde o escuro parece ter paredes próprias.",

                        "Se pretende seguir, eu compraria uma lanterna antes."

                    ]
                }

            ]

        },


        shadowShelter: {

            id: "shadowShelter",

            name: "REFÚGIO SOMBRIO",

            worldWidth: 980,

            worldHeight: 670,

            room: {
                x: 120,
                y: 100,
                w: 740,
                h: 450
            },

            playerSpawn: {
                x: 490,
                y: 465
            },

            door: {
                x: 445,
                y: 500,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#2f2b39",
                floor: "#484250",
                floorAlt: "#3d3845",
                trim: "#746882",
                accent: "#8f79a4",
                light: "#9d88ae"
            },

            furniture: [

                {
                    type: "bed",
                    x: 175,
                    y: 165,
                    w: 125,
                    h: 72
                },

                {
                    type: "candleTable",
                    x: 430,
                    y: 275,
                    w: 115,
                    h: 82
                },

                {
                    type: "bookshelf",
                    x: 640,
                    y: 170,
                    w: 125,
                    h: 45
                },

                {
                    type: "chest",
                    x: 650,
                    y: 365,
                    w: 72,
                    h: 52
                }

            ],

            npcs: [

                {
                    id: "noir",
                    name: "NOIR",
                    role: "Sobrevivente",
                    color: "#81778d",
                    x: 660,
                    y: 300,
                    lines: [

                        "Você trouxe luz até aqui. Não desperdice.",

                        "Há sombras que fogem da lanterna. Outras seguem justamente por causa dela.",

                        "Quando ouvir passos iguais aos seus, não responda.",

                        "O reino além desta caverna parece impossível. Talvez seja por isso que ainda existe."

                    ]
                }

            ]

        },


        fairyShelter: {

            id: "fairyShelter",

            name: "CASA DAS FLORES",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#52455a",
                floor: "#786a72",
                floorAlt: "#6b5d67",
                trim: "#d7a5cd",
                accent: "#ec9bd6",
                light: "#ffd2ed"
            },

            furniture: [

                {
                    type: "flowerBed",
                    x: 175,
                    y: 170,
                    w: 145,
                    h: 75
                },

                {
                    type: "crystalLamp",
                    x: 440,
                    y: 190,
                    w: 50,
                    h: 50
                },

                {
                    type: "table",
                    x: 420,
                    y: 300,
                    w: 130,
                    h: 90
                },

                {
                    type: "flowerShelf",
                    x: 650,
                    y: 170,
                    w: 130,
                    h: 48
                }

            ],

            npcs: [

                {
                    id: "aelia",
                    name: "AELIA",
                    role: "Habitante das Fadas",
                    color: "#d49ad4",
                    x: 680,
                    y: 310,
                    lines: [

                        "As flores daqui brilham quando alguém lembra de algo importante.",

                        "A Quietude não gosta de memórias compartilhadas.",

                        "Há caminhos que só aparecem depois que alguém decide não esquecer.",

                        "Você trouxe lembranças de lugares que eu nunca vi. Isso já muda este reino."

                    ]
                }

            ]

        },


        skyShelter: {

            id: "skyShelter",

            name: "SANTUÁRIO CELESTE",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#879ba2",
                floor: "#c5d2d3",
                floorAlt: "#b5c3c5",
                trim: "#eee1a7",
                accent: "#f6e8ab",
                light: "#fff6c8"
            },

            furniture: [

                {
                    type: "altarTable",
                    x: 415,
                    y: 250,
                    w: 140,
                    h: 100
                },

                {
                    type: "cloudBed",
                    x: 170,
                    y: 170,
                    w: 140,
                    h: 72
                },

                {
                    type: "banner",
                    x: 680,
                    y: 165,
                    w: 90,
                    h: 110,
                    collision: false
                },

                {
                    type: "goldLamp",
                    x: 675,
                    y: 385,
                    w: 45,
                    h: 45
                }

            ],

            npcs: [

                {
                    id: "aeris",
                    name: "AERIS",
                    role: "Guardião Celeste",
                    color: "#c7d4df",
                    x: 670,
                    y: 305,
                    lines: [

                        "Até aqui existem coisas que estão sendo esquecidas.",

                        "O céu não fica acima de tudo. Algumas coisas ainda estão além dele.",

                        "A Quietude deixa marcas até onde não há chão.",

                        "Se continuar, faça isso porque escolheu lembrar — não porque alguém mandou."

                    ]
                }

            ]

        },


        hellShelter: {

            id: "hellShelter",

            name: "ABRIGO DAS CINZAS",

            worldWidth: 1000,

            worldHeight: 690,

            room: {
                x: 120,
                y: 100,
                w: 760,
                h: 470
            },

            playerSpawn: {
                x: 500,
                y: 480
            },

            door: {
                x: 455,
                y: 520,
                w: 90,
                h: 50
            },

            theme: {
                wall: "#372321",
                floor: "#583a32",
                floorAlt: "#4b302b",
                trim: "#8e4d3b",
                accent: "#ce5739",
                light: "#ef6b42"
            },

            furniture: [

                {
                    type: "fireplace",
                    x: 170,
                    y: 160,
                    w: 140,
                    h: 90
                },

                {
                    type: "obsidianTable",
                    x: 420,
                    y: 280,
                    w: 135,
                    h: 90
                },

                {
                    type: "weaponRack",
                    x: 650,
                    y: 170,
                    w: 125,
                    h: 48
                },

                {
                    type: "ashChest",
                    x: 660,
                    y: 390,
                    w: 75,
                    h: 55
                }

            ],

            npcs: [

                {
                    id: "malek",
                    name: "MALEK",
                    role: "Errante",
                    color: "#a16050",
                    x: 680,
                    y: 310,
                    lines: [

                        "Então alguém realmente chegou até aqui.",

                        "Não pergunte há quanto tempo estou neste lugar. A resposta muda.",

                        "As criaturas daqui ainda lembram da dor. Talvez seja por isso que sobrevivem.",

                        "Se encontrar alguém com o seu rosto, decida antes quem você acredita ser."

                    ]
                }

            ]

        }

    });


    /* =========================================================
       INTERIOR HELPERS
       ========================================================= */

    function getHouseSpec(
        houseOrId =
            state.currentHouse
    ) {

        const id =

            typeof houseOrId ===
            "string"

                ? houseOrId

                : houseOrId
                    ?.interiorId ||
                  houseOrId
                    ?.id;


        return (
            HOUSE_INTERIORS[id] ||
            null
        );

    }


    function getHouseRoom(
        houseOrId =
            state.currentHouse
    ) {

        return (
            getHouseSpec(
                houseOrId
            )?.room ||
            null
        );

    }


    function getHouseFurniture(
        houseOrId =
            state.currentHouse
    ) {

        return (
            getHouseSpec(
                houseOrId
            )?.furniture ||
            []
        );

    }


    function getHouseInteriorNPCs(
        houseOrId =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                houseOrId
            );


        if (!spec) {

            return [];

        }


        return spec.npcs.map(
            npc => {

                if (
                    npc.libraryId &&
                    NPC_LIBRARY[
                        npc.libraryId
                    ]
                ) {

                    return {

                        ...NPC_LIBRARY[
                            npc.libraryId
                        ],

                        x:
                            npc.x,

                        y:
                            npc.y,

                        insideHouse:
                            true

                    };

                }


                return {

                    ...npc,

                    insideHouse:
                        true

                };

            }
        );

    }


    function getInteriorDoor(
        houseOrId =
            state.currentHouse
    ) {

        return (
            getHouseSpec(
                houseOrId
            )?.door ||
            null
        );

    }


    function getHouseWorldSize(
        houseOrId =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                houseOrId
            );


        if (!spec) {

            return {
                width: 1080,
                height: 720
            };

        }


        return {

            width:
                spec.worldWidth,

            height:
                spec.worldHeight

        };

    }


    /* =========================================================
       MUNDO VAZIO
       ========================================================= */

    function createEmptyWorld(
        region
    ) {

        return {

            width:
                region.width,

            height:
                region.height,

            regionId:
                region.id,

            regionName:
                region.name,

            obstacles:
                [],

            buildingCollisions:
                [],

            buildings:
                [],

            doors:
                [],

            paths:
                [],

            protectedZones:
                [],

            trees:
                [],

            resources:
                [],

            npcs:
                [],

            enemies:
                [],

            drops:
                [],

            portals:
                [],

            gates:
                [],

            landmarks:
                [],

            mapMarkers:
                [],

            particles:
                [],

            effects:
                [],

            projectiles:
                [],

            enemyProjectiles:
                [],

            attackEffects:
                [],

            decals:
                [],

            darknessBarriers:
                [],

            altar:
                null,

            fountain:
                null,

            ambient:
                [],

            generatedAt:
                performance.now()

        };

    }


    function ensureWorldRuntimeArrays() {

        if (
            !state.world
        ) {

            return;

        }


        const arrays = [

            "obstacles",
            "buildingCollisions",
            "buildings",
            "doors",
            "paths",
            "protectedZones",
            "trees",
            "resources",
            "npcs",
            "enemies",
            "drops",
            "portals",
            "gates",
            "landmarks",
            "mapMarkers",
            "particles",
            "effects",
            "projectiles",
            "enemyProjectiles",
            "attackEffects",
            "decals",
            "darknessBarriers",
            "ambient"

        ];


        for (
            const key of
            arrays
        ) {

            if (
                !Array.isArray(
                    state.world[key]
                )
            ) {

                state.world[key] =
                    [];

            }

        }

    }


    /* =========================================================
       MAP MARKERS
       ========================================================= */

    function addMapMarker(
        marker
    ) {

        if (
            !state.world
        ) {

            return null;

        }


        const entry = {

            id:
                marker.id ||
                uid(
                    "marker"
                ),

            x:
                finiteNumber(
                    marker.x,
                    0
                ),

            y:
                finiteNumber(
                    marker.y,
                    0
                ),

            type:
                marker.type ||
                "point",

            label:
                marker.label ||
                "",

            icon:
                marker.icon ||
                "•",

            important:
                Boolean(
                    marker.important
                ),

            revealRule:
                marker.revealRule ||
                "explored",

            targetId:
                marker.targetId ||
                null

        };


        state.world
            .mapMarkers
            .push(
                entry
            );


        return entry;

    }


    /* =========================================================
       CAMINHOS
       ========================================================= */

    function addPath(
        x,
        y,
        w,
        h,
        options = {}
    ) {

        const path = {

            id:
                options.id ||
                uid(
                    "path"
                ),

            x,
            y,
            w,
            h,

            area:
                state.area,

            style:
                options.style ||
                state.area,

            direction:
                options.direction ||
                (
                    w >
                    h
                        ? "horizontal"
                        : "vertical"
                ),

            detailSeed:
                finiteNumber(
                    options.detailSeed,
                    hashString(
                        `${state.area}:${x}:${y}:${w}:${h}`
                    )
                )

        };


        state.world
            .paths
            .push(
                path
            );


        /*
            Evita árvore/rocha nascendo
            no centro das estradas.
        */
        addProtectedZone(

            {
                x:
                    x -
                    28,

                y:
                    y -
                    28,

                w:
                    w +
                    56,

                h:
                    h +
                    56
            },

            "path"

        );


        return path;

    }


    function isPointOnPath(
        x,
        y,
        padding = 0
    ) {

        return state.world
            ?.paths
            ?.some(
                path =>

                    x >=
                    path.x -
                    padding &&

                    x <=
                    path.x +
                    path.w +
                    padding &&

                    y >=
                    path.y -
                    padding &&

                    y <=
                    path.y +
                    path.h +
                    padding
            ) ||
            false;

    }


    /* =========================================================
       ÁREAS PROTEGIDAS
       ========================================================= */

    function addProtectedZone(
        rect,
        tag = "protected"
    ) {

        const zone = {

            x:
                finiteNumber(
                    rect.x,
                    0
                ),

            y:
                finiteNumber(
                    rect.y,
                    0
                ),

            w:
                Math.max(
                    0,
                    finiteNumber(
                        rect.w,
                        0
                    )
                ),

            h:
                Math.max(
                    0,
                    finiteNumber(
                        rect.h,
                        0
                    )
                ),

            tag

        };


        state.world
            .protectedZones
            .push(
                zone
            );


        return zone;

    }


    function isProtectedForGeneration(
        x,
        y,
        radius = 0
    ) {

        if (
            !state.world
        ) {

            return true;

        }


        if (
            x <
            GAME_CONFIG.worldMargin +
            radius ||

            y <
            GAME_CONFIG.worldMargin +
            radius ||

            x >
            state.world.width -
            GAME_CONFIG.worldMargin -
            radius ||

            y >
            state.world.height -
            GAME_CONFIG.worldMargin -
            radius
        ) {

            return true;

        }


        for (
            const zone of
            state.world
                .protectedZones
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


    /* =========================================================
       OBSTÁCULOS
       ========================================================= */

    function addObstacle(
        x,
        y,
        w,
        h,
        type = "rock",
        options = {}
    ) {

        const obstacle = {

            id:
                options.id ||
                uid(
                    "obstacle"
                ),

            x,
            y,
            w,
            h,

            type,

            solid:
                options.solid !==
                false,

            blocksLight:
                options.blocksLight !==
                false,

            decorative:
                Boolean(
                    options.decorative
                ),

            color:
                options.color ||
                null,

            meta:
                options.meta ||
                null

        };


        state.world
            .obstacles
            .push(
                obstacle
            );


        return obstacle;

    }


    function addWorldBoundary() {

        const world =
            state.world;


        const thickness =
            55;


        addObstacle(
            0,
            0,
            world.width,
            thickness,
            "boundary",
            {
                id: "boundary_top"
            }
        );


        addObstacle(
            0,
            world.height -
            thickness,
            world.width,
            thickness,
            "boundary",
            {
                id: "boundary_bottom"
            }
        );


        addObstacle(
            0,
            0,
            thickness,
            world.height,
            "boundary",
            {
                id: "boundary_left"
            }
        );


        addObstacle(
            world.width -
            thickness,
            0,
            thickness,
            world.height,
            "boundary",
            {
                id: "boundary_right"
            }
        );

    }


    /* =========================================================
       CONSTRUÇÕES / PORTAS

       A porta é calculada A PARTIR da própria casa.

       Desenho + colisão + interação usam
       exatamente o mesmo objeto.
       ========================================================= */

    function createExteriorDoor(
        building
    ) {

        const width =
            clamp(
                building.w *
                0.16,
                58,
                82
            );


        const height =
            clamp(
                building.h *
                0.27,
                70,
                92
            );


        const x =
            building.x +
            building.w /
            2 -
            width /
            2;


        const y =
            building.y +
            building.h -
            height;


        const door = {

            id:
                `${building.id}_door`,

            buildingId:
                building.id,

            houseId:
                building.interiorId ||
                building.id,

            x,

            y,

            w:
                width,

            h:
                height,

            centerX:
                x +
                width /
                2,

            centerY:
                y +
                height /
                2,

            approachX:
                x +
                width /
                2,

            approachY:
                building.y +
                building.h +
                38,

            enterDistance:
                GAME_CONFIG
                    .doorInteractionDistance,

            openDistance:
                GAME_CONFIG
                    .doorAutoOpenDistance,

            closeDistance:
                GAME_CONFIG
                    .doorAutoCloseDistance,

            animation:
                0,

            targetAnimation:
                0,

            isOpen:
                false,

            playerNear:
                false,

            glow:
                0,

            dustTimer:
                0,

            side:
                "south"

        };


        state.world
            .doors
            .push(
                door
            );


        return door;

    }


    function buildBuildingCollision(
        building,
        door
    ) {

        /*
            A casa NÃO é um retângulo sólido único.

            A parede frontal é dividida em duas partes,
            deixando o vão da porta realmente alinhado.
        */

        const wall =
            26;


        const leftWidth =
            Math.max(
                0,
                door.x -
                building.x
            );


        const rightStart =
            door.x +
            door.w;


        const rightWidth =
            Math.max(
                0,
                building.x +
                building.w -
                rightStart
            );


        const collisions = [

            {
                id:
                    `${building.id}_wall_top`,

                x:
                    building.x,

                y:
                    building.y,

                w:
                    building.w,

                h:
                    wall,

                type:
                    "buildingWall",

                buildingId:
                    building.id,

                blocksLight:
                    true
            },

            {
                id:
                    `${building.id}_wall_left`,

                x:
                    building.x,

                y:
                    building.y,

                w:
                    wall,

                h:
                    building.h,

                type:
                    "buildingWall",

                buildingId:
                    building.id,

                blocksLight:
                    true
            },

            {
                id:
                    `${building.id}_wall_right`,

                x:
                    building.x +
                    building.w -
                    wall,

                y:
                    building.y,

                w:
                    wall,

                h:
                    building.h,

                type:
                    "buildingWall",

                buildingId:
                    building.id,

                blocksLight:
                    true
            },

            {
                id:
                    `${building.id}_wall_front_left`,

                x:
                    building.x,

                y:
                    building.y +
                    building.h -
                    wall,

                w:
                    leftWidth,

                h:
                    wall,

                type:
                    "buildingWall",

                buildingId:
                    building.id,

                blocksLight:
                    true
            },

            {
                id:
                    `${building.id}_wall_front_right`,

                x:
                    rightStart,

                y:
                    building.y +
                    building.h -
                    wall,

                w:
                    rightWidth,

                h:
                    wall,

                type:
                    "buildingWall",

                buildingId:
                    building.id,

                blocksLight:
                    true
            }

        ];


        /*
            Corpo interno da casa.

            Para impedir entrar por paredes laterais,
            mas mantém corredor até a porta.
        */
        const interiorBody = {

            id:
                `${building.id}_body`,

            x:
                building.x +
                wall,

            y:
                building.y +
                wall,

            w:
                building.w -
                wall *
                2,

            h:
                Math.max(
                    0,
                    building.h -
                    door.h -
                    wall
                ),

            type:
                "buildingBody",

            buildingId:
                building.id,

            blocksLight:
                true

        };


        collisions.push(
            interiorBody
        );


        for (
            const collision of
            collisions
        ) {

            if (
                collision.w <=
                    0 ||
                collision.h <=
                    0
            ) {

                continue;

            }


            state.world
                .buildingCollisions
                .push(
                    collision
                );

        }

    }


    function addBuilding(
        id,
        x,
        y,
        w,
        h,
        name,
        roof,
        wallColor,
        options = {}
    ) {

        const building = {

            id,

            x,
            y,
            w,
            h,

            name,

            roof:
                roof ||
                "#69483a",

            wallColor:
                wallColor ||
                "#ad825e",

            trimColor:
                options.trimColor ||
                "#d0ad79",

            windowColor:
                options.windowColor ||
                "#dfc67d",

            type:
                options.type ||
                "house",

            interiorId:
                options.interiorId ||
                id,

            enterable:
                options.enterable !==
                false,

            chimney:
                options.chimney !==
                false,

            smoke:
                options.smoke !==
                false,

            sign:
                options.sign ||
                null,

            region:
                state.area

        };


        state.world
            .buildings
            .push(
                building
            );


        let door =
            null;


        if (
            building.enterable
        ) {

            door =
                createExteriorDoor(
                    building
                );


            buildBuildingCollision(
                building,
                door
            );

        }


        addProtectedZone(

            {
                x:
                    x -
                    46,

                y:
                    y -
                    48,

                w:
                    w +
                    92,

                h:
                    h +
                    130
            },

            "building"

        );


        addMapMarker({

            id:
                `building_marker_${id}`,

            x:
                x +
                w /
                2,

            y:
                y +
                h /
                2,

            type:
                "building",

            label:
                name,

            icon:
                options.mapIcon ||
                "⌂",

            important:
                Boolean(
                    options.important
                ),

            targetId:
                id

        });


        return building;

    }


    function getBuildingDoor(
        buildingOrId
    ) {

        const id =

            typeof buildingOrId ===
            "string"

                ? buildingOrId

                : buildingOrId
                    ?.id;


        return (
            state.world
                ?.doors
                ?.find(
                    door =>
                        door.buildingId ===
                        id
                ) ||
            null
        );

    }


    function getDoorApproachPoint(
        door
    ) {

        if (!door) {

            return null;

        }


        return {

            x:
                door.approachX,

            y:
                door.approachY

        };

    }


    function calculateHomeRespawn() {

        const home =
            state.world
                ?.buildings
                ?.find(
                    building =>
                        building.id ===
                        "home"
                );


        if (!home) {

            return {
                ...PLAYER_HOME
                    .fallbackRespawn
            };

        }


        const door =
            getBuildingDoor(
                home
            );


        if (!door) {

            return {

                x:
                    home.x +
                    home.w /
                    2,

                y:
                    home.y +
                    home.h +
                    58,

                facing:
                    "up"

            };

        }


        return {

            x:
                door.approachX,

            y:
                door.approachY +
                18,

            facing:
                "up"

        };

    }


    function getPlayerHomeRespawn() {

        if (
            state.area ===
            "village" &&
            state.world
        ) {

            return calculateHomeRespawn();

        }


        return {
            ...PLAYER_HOME
                .fallbackRespawn
        };

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function addGate(
        options
    ) {

        const gate = {

            id:
                options.id,

            name:
                options.name ||
                "PORTÃO",

            x:
                options.x,

            y:
                options.y,

            w:
                options.w,

            h:
                options.h,

            orientation:
                options.orientation ||
                "vertical",

            targetArea:
                options.targetArea ||
                null,

            targetSpawn:
                options.targetSpawn ||
                null,

            route:
                options.route ||
                null,

            locked:
                options.locked !==
                false,

            opened:
                Boolean(
                    options.opened
                ),

            requiresDash:
                Boolean(
                    options.requiresDash
                ),

            requiredCost:
                options.requiredCost ||
                null,

            futureRoute:
                Boolean(
                    options.futureRoute
                ),

            animation:
                0,

            targetAnimation:
                0,

            message:
                options.message ||
                null

        };


        state.world
            .gates
            .push(
                gate
            );


        addProtectedZone(

            {
                x:
                    gate.x -
                    70,

                y:
                    gate.y -
                    70,

                w:
                    gate.w +
                    140,

                h:
                    gate.h +
                    140
            },

            "gate"

        );


        addMapMarker({

            id:
                `${gate.id}_marker`,

            x:
                gate.x +
                gate.w /
                2,

            y:
                gate.y +
                gate.h /
                2,

            type:
                "gate",

            label:
                gate.name,

            icon:
                "⛩",

            important:
                true,

            targetId:
                gate.id

        });


        return gate;

    }


    /* =========================================================
       PORTAIS / TRANSIÇÕES
       ========================================================= */

    function addPortal(
        x,
        y,
        w,
        h,
        targetArea,
        condition,
        label,
        options = {}
    ) {

        const portal = {

            id:
                options.id ||
                uid(
                    "portal"
                ),

            x,
            y,
            w,
            h,

            targetArea,

            targetX:
                options.targetX ??
                null,

            targetY:
                options.targetY ??
                null,

            condition:
                typeof condition ===
                "function"
                    ? condition
                    : null,

            label:
                label ||
                "PASSAGEM",

            active:
                options.active !==
                false,

            hidden:
                Boolean(
                    options.hidden
                ),

            color:
                options.color ||
                null,

            returnPortal:
                Boolean(
                    options.returnPortal
                )

        };


        state.world
            .portals
            .push(
                portal
            );


        addProtectedZone(

            {
                x:
                    x -
                    55,

                y:
                    y -
                    55,

                w:
                    w +
                    110,

                h:
                    h +
                    110
            },

            "portal"

        );


        addMapMarker({

            id:
                `${portal.id}_marker`,

            x:
                x +
                w /
                2,

            y:
                y +
                h /
                2,

            type:
                "portal",

            label:
                portal.label,

            icon:
                "◉",

            important:
                true,

            targetId:
                portal.id

        });


        return portal;

    }


    /* =========================================================
       NPCs
       ========================================================= */

    function addWorldNPC(
        x,
        y,
        libraryIdOrConfig,
        options = {}
    ) {

        let config =
            null;


        if (
            typeof libraryIdOrConfig ===
            "string"
        ) {

            config =
                NPC_LIBRARY[
                    libraryIdOrConfig
                ];

        }

        else {

            config =
                libraryIdOrConfig;

        }


        if (!config) {

            return null;

        }


        const npc = {

            id:
                options.id ||
                config.id ||
                uid(
                    "npc"
                ),

            x,
            y,

            name:
                config.name ||
                "NPC",

            role:
                config.role ||
                "Morador",

            color:
                config.color ||
                "#c7b48a",

            lines:
                deepClone(
                    config.lines ||
                    []
                ),

            beforeDashLines:
                deepClone(
                    config.beforeDashLines ||
                    []
                ),

            afterDashLines:
                deepClone(
                    config.afterDashLines ||
                    []
                ),

            merchant:
                Boolean(
                    config.merchant
                ),

            blacksmith:
                Boolean(
                    config.blacksmith
                ),

            questId:
                config.questId ||
                null,

            mysterious:
                Boolean(
                    config.mysterious
                ),

            spriteType:
                config.spriteType ||
                "human",

            radius:
                17,

            facing:
                "down",

            walkPhase:
                random(
                    0,
                    Math.PI *
                    2
                ),

            idleTime:
                random(
                    0,
                    2
                ),

            homeX:
                x,

            homeY:
                y,

            wanderRadius:
                options.wanderRadius ??
                60,

            movable:
                options.movable !==
                false

        };


        state.world
            .npcs
            .push(
                npc
            );


        addMapMarker({

            id:
                `${npc.id}_marker`,

            x,
            y,

            type:
                "npc",

            label:
                npc.name,

            icon:
                "•",

            targetId:
                npc.id

        });


        return npc;

    }


    /* =========================================================
       INIMIGOS
       ========================================================= */

    function addEnemy(
        config
    ) {

        const template =
            config.template
                ? ENEMY_TYPES[
                    config.template
                ]
                : null;


        const bossDefinition =
            getBossDefinition(
                config.id
            );


        const hp =
            finiteNumber(
                config.hp ??
                template
                    ?.hp,
                100
            );


        const enemy = {

            id:
                config.id ||
                uid(
                    "enemy"
                ),

            species:
                config.template ||
                config.species ||
                null,

            x:
                config.x,

            y:
                config.y,

            spawnX:
                config.x,

            spawnY:
                config.y,

            name:
                config.name ||
                template
                    ?.name ||
                "CRIATURA",

            icon:
                config.icon ||
                bossDefinition
                    ?.icon ||
                "◆",

            spriteType:
                config.spriteType ||
                template
                    ?.spriteType ||
                bossDefinition
                    ?.bodyStyle ||
                "creature",

            type:
                config.type ||
                "normal",

            bossType:
                bossDefinition
                    ?.type ||
                null,

            bodyStyle:
                bossDefinition
                    ?.bodyStyle ||
                config.bodyStyle ||
                null,

            hp,

            maxHp:
                finiteNumber(
                    config.maxHp,
                    hp
                ),

            damage:
                finiteNumber(
                    config.damage ??
                    template
                        ?.damage,
                    10
                ),

            speed:
                finiteNumber(
                    config.speed ??
                    template
                        ?.speed,
                    80
                ),

            vision:
                finiteNumber(
                    config.vision ??
                    template
                        ?.vision,
                    280
                ),

            attackRange:
                finiteNumber(
                    config.attackRange ??
                    template
                        ?.attackRange,
                    60
                ),

            radius:
                finiteNumber(
                    config.radius ??
                    template
                        ?.radius,
                    20
                ),

            color:
                config.color ||
                bossDefinition
                    ?.color ||
                template
                    ?.color ||
                "#786a5e",

            aura:
                config.aura ||
                bossDefinition
                    ?.aura ||
                null,

            xp:
                finiteNumber(
                    config.xp ??
                    template
                        ?.xp,
                    20
                ),

            money:
                finiteNumber(
                    config.money ??
                    template
                        ?.money,
                    4
                ),

            drop:
                config.drop ||
                null,

            dropAmount:
                finiteNumber(
                    config.dropAmount,
                    1
                ),

            secondaryDrop:
                config.secondaryDrop ||
                null,

            secondaryDropChance:
                finiteNumber(
                    config.secondaryDropChance,
                    0
                ),

            unlock:
                config.unlock ||
                null,

            ability:
                deepClone(
                    config.ability ||
                    template
                        ?.ability ||
                    null
                ),

            /*
                IA
            */
            state:
                "idle",

            aggressive:
                false,

            accepted:
                config.type ===
                "progression"
                    ? false
                    : true,

            dead:
                false,

            attackCooldown:
                random(
                    0,
                    0.5
                ),

            abilityCooldown:
                random(
                    0.2,
                    1
                ),

            telegraph:
                null,

            charge:
                null,

            specialState:
                null,

            stun:
                0,

            slow:
                0,

            poison:
                null,

            hitFlash:
                0,

            animationTime:
                random(
                    0,
                    10
                ),

            facingX:
                0,

            facingY:
                1,

            returnRadius:
                config.returnRadius ||
                520,

            hellType:
                config.hellType ??
                null,

            metadata:
                config.metadata ||
                null

        };


        state.world
            .enemies
            .push(
                enemy
            );


        if (
            enemy.type ===
                "progression" ||
            enemy.bossType ===
                "resourceBoss"
        ) {

            addMapMarker({

                id:
                    `${enemy.id}_boss_marker`,

                x:
                    enemy.x,

                y:
                    enemy.y,

                type:
                    "boss",

                label:
                    enemy.name,

                icon:
                    enemy.icon,

                important:
                    true,

                /*
                    Parte 5 só mostrará depois
                    de descoberto.
                */
                revealRule:
                    "bossDiscovered",

                targetId:
                    enemy.id

            });

        }


        return enemy;

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function addTree(
        x,
        y,
        options = {}
    ) {

        const tree = {

            id:
                options.id ||
                uid(
                    "tree"
                ),

            x,
            y,

            type:
                options.type ||
                "tree",

            variant:
                options.variant ||
                randomInt(
                    0,
                    3
                ),

            scale:
                options.scale ||
                random(
                    0.88,
                    1.12
                ),

            trunkRadius:
                VISUAL_CONFIG
                    .tree
                    .trunkRadius,

            canopyRadius:
                VISUAL_CONFIG
                    .tree
                    .visualCanopyRadius,

            alive:
                true,

            harvested:
                false,

            respawn:
                0,

            swayPhase:
                random(
                    0,
                    Math.PI *
                    2
                ),

            colorShift:
                random(
                    -0.08,
                    0.08
                )

        };


        state.world
            .trees
            .push(
                tree
            );


        return tree;

    }


    function canPlaceTree(
        x,
        y
    ) {

        const safety =
            VISUAL_CONFIG
                .tree
                .generationSafetyRadius;


        if (
            isProtectedForGeneration(
                x,
                y,
                safety
            )
        ) {

            return false;

        }


        for (
            const tree of
            state.world.trees
        ) {

            if (
                distance(
                    x,
                    y,
                    tree.x,
                    tree.y
                ) <
                safety *
                1.45
            ) {

                return false;

            }

        }


        return true;

    }


    function addScatteredTrees(
        count,
        options = {}
    ) {

        const rng =
            getAreaRng(
                state.area,
                options.salt ||
                "trees"
            );


        let placed =
            0;


        let attempts =
            0;


        const maxAttempts =
            count *
            35;


        while (
            placed <
                count &&
            attempts <
                maxAttempts
        ) {

            attempts++;


            const x =
                rngRange(
                    rng,
                    115,
                    state.world.width -
                    115
                );


            const y =
                rngRange(
                    rng,
                    115,
                    state.world.height -
                    115
                );


            if (
                !canPlaceTree(
                    x,
                    y
                )
            ) {

                continue;

            }


            addTree(
                x,
                y,
                {
                    variant:
                        rngInt(
                            rng,
                            0,
                            4
                        ),

                    scale:
                        rngRange(
                            rng,
                            0.88,
                            1.14
                        ),

                    type:
                        options.type ||
                        "tree"
                }
            );


            placed++;

        }

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    const RESOURCE_CONFIG =
        Object.freeze({

            madeira: {
                radius: 28,
                respawn: 20,
                amountMin: 2,
                amountMax: 5
            },

            carvao: {
                radius: 20,
                respawn: 26,
                amountMin: 1,
                amountMax: 3
            },

            ferro: {
                radius: 22,
                respawn: 34,
                amountMin: 1,
                amountMax: 3
            },

            ouro: {
                radius: 22,
                respawn: 42,
                amountMin: 1,
                amountMax: 2
            },

            diamante: {
                radius: 20,
                respawn: 54,
                amountMin: 1,
                amountMax: 2
            },

            rubi: {
                radius: 21,
                respawn: 58,
                amountMin: 1,
                amountMax: 2
            },

            cristal: {
                radius: 19,
                respawn: 48,
                amountMin: 1,
                amountMax: 2
            }

        });


    function canPlaceResource(
        x,
        y,
        radius
    ) {

        if (
            isProtectedForGeneration(
                x,
                y,
                radius +
                25
            )
        ) {

            return false;

        }


        for (
            const resource of
            state.world.resources
        ) {

            if (
                distance(
                    x,
                    y,
                    resource.x,
                    resource.y
                ) <
                radius +
                resource.radius +
                25
            ) {

                return false;

            }

        }


        return true;

    }


    function addResource(
        x,
        y,
        type,
        options = {}
    ) {

        const config =
            RESOURCE_CONFIG[type];


        if (!config) {

            return null;

        }


        const resource = {

            id:
                options.id ||
                uid(
                    `resource_${type}`
                ),

            x,
            y,

            type,

            radius:
                config.radius,

            alive:
                true,

            respawn:
                0,

            respawnDuration:
                config.respawn,

            amount:
                options.amount ||
                randomInt(
                    config.amountMin,
                    config.amountMax
                ),

            glowPhase:
                random(
                    0,
                    Math.PI *
                    2
                )

        };


        state.world
            .resources
            .push(
                resource
            );


        return resource;

    }


    function scatterResources(
        type,
        count,
        salt
    ) {

        const config =
            RESOURCE_CONFIG[type];


        if (!config) {

            return;

        }


        const rng =
            getAreaRng(
                state.area,
                salt ||
                `resource:${type}`
            );


        let placed =
            0;


        let attempts =
            0;


        while (
            placed <
                count &&
            attempts <
                count *
                35
        ) {

            attempts++;


            const x =
                rngRange(
                    rng,
                    125,
                    state.world.width -
                    125
                );


            const y =
                rngRange(
                    rng,
                    125,
                    state.world.height -
                    125
                );


            if (
                !canPlaceResource(
                    x,
                    y,
                    config.radius
                )
            ) {

                continue;

            }


            addResource(
                x,
                y,
                type,
                {
                    amount:
                        rngInt(
                            rng,
                            config.amountMin,
                            config.amountMax
                        )
                }
            );


            placed++;

        }

    }


    /* =========================================================
       SPAWN SEGURO
       ========================================================= */

    function isSpawnPositionSafe(
        x,
        y,
        radius = 24,
        options = {}
    ) {

        if (
            isProtectedForGeneration(
                x,
                y,
                radius
            ) &&
            !options.allowProtected
        ) {

            return false;

        }


        if (
            isCircleBlockedByWorld(
                x,
                y,
                radius,
                {
                    ignoreDarknessBarrier:
                        true
                }
            )
        ) {

            return false;

        }


        if (
            state.player &&
            distance(
                x,
                y,
                state.player.x,
                state.player.y
            ) <
            (
                options.boss
                    ? GAME_CONFIG
                        .bossSpawnSafeDistance
                    : GAME_CONFIG
                        .enemySpawnSafeDistance
            )
        ) {

            return false;

        }


        return true;

    }


    function findSafeSpawn(
        preferredX,
        preferredY,
        radius = 24,
        options = {}
    ) {

        if (
            isSpawnPositionSafe(
                preferredX,
                preferredY,
                radius,
                options
            )
        ) {

            return {
                x: preferredX,
                y: preferredY
            };

        }


        for (
            let ring = 1;
            ring <= 12;
            ring++
        ) {

            const ringRadius =
                ring *
                38;


            for (
                let index = 0;
                index < 16;
                index++
            ) {

                const angle =

                    index /
                    16 *

                    Math.PI *
                    2;


                const x =

                    preferredX +

                    Math.cos(
                        angle
                    ) *

                    ringRadius;


                const y =

                    preferredY +

                    Math.sin(
                        angle
                    ) *

                    ringRadius;


                if (
                    isSpawnPositionSafe(
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


        return {

            x:
                clamp(
                    preferredX,
                    100,
                    state.world.width -
                    100
                ),

            y:
                clamp(
                    preferredY,
                    100,
                    state.world.height -
                    100
                )

        };

    }


    /* =========================================================
       COLISÃO DO MUNDO

       Usa as hitboxes reais das construções
       e das árvores.
       ========================================================= */

    function isCircleBlockedByWorld(
        x,
        y,
        radius,
        options = {}
    ) {

        if (
            !state.world
        ) {

            return false;

        }


        if (
            x -
            radius <
            0 ||

            y -
            radius <
            0 ||

            x +
            radius >
            state.world.width ||

            y +
            radius >
            state.world.height
        ) {

            return true;

        }


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
            const wall of
            state.world
                .buildingCollisions
        ) {

            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    wall
                )
            ) {

                return true;

            }

        }


        for (
            const tree of
            state.world.trees
        ) {

            if (
                !tree.alive
            ) {

                continue;

            }


            /*
                Tronco.
            */
            if (
                circleCircleCollision(

                    x,
                    y,
                    radius,

                    tree.x,
                    tree.y +
                    18,

                    tree.trunkRadius

                )
            ) {

                return true;

            }


            /*
                Parte inferior/média da copa.
            */
            if (
                circleCircleCollision(

                    x,
                    y,
                    radius,

                    tree.x,

                    tree.y +
                    VISUAL_CONFIG
                        .tree
                        .canopyCollisionOffsetY,

                    VISUAL_CONFIG
                        .tree
                        .canopyCollisionRadius *
                    tree.scale

                )
            ) {

                return true;

            }

        }


        if (
            !options.ignoreGates
        ) {

            for (
                const gate of
                state.world.gates
            ) {

                if (
                    gate.opened ||
                    gate.animation >
                    0.88
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

        }


        if (
            !options.ignoreDarknessBarrier
        ) {

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

                    return true;

                }

            }

        }


        return false;

    }


    /* =========================================================
       LIGHT BLOCKERS

       Será usado pela lanterna na Parte 5.

       NÃO usa destination-out no Canvas principal.
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
                obstacle.blocksLight
            ) {

                blockers.push(
                    obstacle
                );

            }

        }


        for (
            const wall of
            state.world
                .buildingCollisions
        ) {

            if (
                wall.blocksLight
            ) {

                blockers.push(
                    wall
                );

            }

        }


        for (
            const barrier of
            state.world
                .darknessBarriers
        ) {

            blockers.push(
                barrier
            );

        }


        return blockers;

    }


    /* =========================================================
       ESCURO / BARREIRA DA LANTERNA
       ========================================================= */

    function addDarknessBarrier(
        options
    ) {

        const barrier = {

            id:
                options.id ||
                uid(
                    "darkness_barrier"
                ),

            x:
                options.x,

            y:
                options.y,

            w:
                options.w,

            h:
                options.h,

            requiresLantern:
                options.requiresLantern !==
                false,

            message:
                options.message ||
                GAME_CONFIG
                    .darknessBarrierMessage,

            blocksLight:
                true,

            visible:
                false,

            warnedAt:
                0

        };


        state.world
            .darknessBarriers
            .push(
                barrier
            );


        return barrier;

    }


    function canPassDarknessBarrier(
        barrier
    ) {

        if (!barrier) {

            return true;

        }


        if (
            !barrier.requiresLantern
        ) {

            return true;

        }


        return Boolean(
            state.player
                ?.lanternOwned
        );

    }


    /* =========================================================
       LANDMARKS
       ========================================================= */

    function addLandmark(
        config
    ) {

        const landmark = {

            id:
                config.id ||
                uid(
                    "landmark"
                ),

            type:
                config.type ||
                "landmark",

            x:
                config.x,

            y:
                config.y,

            radius:
                config.radius ||
                40,

            name:
                config.name ||
                "",

            color:
                config.color ||
                null,

            glow:
                config.glow ||
                null,

            animation:
                random(
                    0,
                    Math.PI *
                    2
                )

        };


        state.world
            .landmarks
            .push(
                landmark
            );


        addProtectedZone(

            {
                x:
                    landmark.x -
                    landmark.radius -
                    30,

                y:
                    landmark.y -
                    landmark.radius -
                    30,

                w:
                    (
                        landmark.radius +
                        30
                    ) *
                    2,

                h:
                    (
                        landmark.radius +
                        30
                    ) *
                    2
            },

            "landmark"

        );


        addMapMarker({

            id:
                `${landmark.id}_marker`,

            x:
                landmark.x,

            y:
                landmark.y,

            type:
                landmark.type,

            label:
                landmark.name,

            icon:
                config.mapIcon ||
                "◆",

            important:
                Boolean(
                    config.important
                ),

            targetId:
                landmark.id

        });


        return landmark;

    }


    /* =========================================================
       FONTE DA VILA
       ========================================================= */

    function addVillageFountain() {

        const fountain = {

            id:
                "village_fountain",

            type:
                "fountain",

            x:
                1600,

            y:
                1110,

            radius:
                80,

            basinRadius:
                72,

            innerRadius:
                46,

            waterRadius:
                55,

            glow:
                "#8bc6d8",

            animation:
                0,

            particleTimer:
                0

        };


        state.world.fountain =
            fountain;


        addLandmark({

            id:
                fountain.id,

            type:
                "fountain",

            x:
                fountain.x,

            y:
                fountain.y,

            radius:
                fountain.radius,

            name:
                "FONTE DA VILA",

            color:
                "#789ca6",

            glow:
                "#8bc6d8",

            mapIcon:
                "♒",

            important:
                true

        });


        /*
            Colisão alinhada com a base visual.
        */
        addObstacle(

            fountain.x -
            56,

            fountain.y -
            35,

            112,

            70,

            "fountainBase",

            {
                id:
                    "village_fountain_collision",

                blocksLight:
                    false
            }

        );

    }


    /* =========================================================
       CONSTRUTOR DO MUNDO
       ========================================================= */

    function buildWorld() {

        const region =
            getRegionDefinition(
                state.area
            );


        state.world =
            createEmptyWorld(
                region
            );


        ensureWorldRuntimeArrays();


        addWorldBoundary();


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

                state.area =
                    "village";

                state.world =
                    createEmptyWorld(
                        REGIONS.village
                    );

                addWorldBoundary();

                buildVillage();

                break;

        }


        ensurePlayerAreaExplored();

    }


    function ensurePlayerAreaExplored() {

        if (
            !state.player
        ) {

            return;

        }


        state.player.exploredAreas =
            Array.isArray(
                state.player
                    .exploredAreas
            )
                ? state.player
                    .exploredAreas
                : [];


        if (
            !state.player
                .exploredAreas
                .includes(
                    state.area
                )
        ) {

            state.player
                .exploredAreas
                .push(
                    state.area
                );

        }

    }


    /* =========================================================
       VILA DO CREPÚSCULO

       Layout principal preservado.
       ========================================================= */

    function buildVillage() {

        /*
            ESTRADAS
        */
        addPath(
            55,
            1045,
            3090,
            130,
            {
                id: "village_main_horizontal"
            }
        );


        addPath(
            1535,
            55,
            130,
            2090,
            {
                id: "village_main_vertical"
            }
        );


        addPath(
            510,
            530,
            1070,
            90,
            {
                id: "village_elian_path"
            }
        );


        addPath(
            1590,
            515,
            1010,
            90,
            {
                id: "village_shop_path"
            }
        );


        addPath(
            1180,
            1110,
            90,
            640,
            {
                id: "village_woodshop_path"
            }
        );


        addPath(
            2540,
            1110,
            90,
            620,
            {
                id: "village_forge_path"
            }
        );


        /*
            CASAS PRINCIPAIS

            Coordenadas da base aprovada.
        */
        addBuilding(
            "home",
            365,
            1510,
            460,
            330,
            "CASA DO AVENTUREIRO",
            "#70483a",
            "#ae835e",
            {
                important: true,
                mapIcon: "⌂"
            }
        );


        addBuilding(
            "elianHome",
            420,
            370,
            435,
            310,
            "CASA DE ELIAN",
            "#604a3d",
            "#b48961",
            {
                mapIcon: "⌂"
            }
        );


        addBuilding(
            "shop",
            2365,
            360,
            470,
            325,
            "LOJA DE DORAN",
            "#684638",
            "#b4865b",
            {
                sign: "LOJA",
                important: true,
                mapIcon: "¤"
            }
        );


        addBuilding(
            "forge",
            2395,
            1490,
            470,
            335,
            "FORJA DE BORIN",
            "#484744",
            "#8f8172",
            {
                sign: "FORJA",
                important: true,
                mapIcon: "⚒"
            }
        );


        addBuilding(
            "woodshop",
            1000,
            1585,
            440,
            300,
            "CARPINTARIA DE BRAN",
            "#735638",
            "#a77c4f",
            {
                sign: "CARPINTARIA",
                mapIcon: "▦"
            }
        );


        /*
            FONTE CENTRAL
        */
        addVillageFountain();


        /*
            NPCs EXTERNOS
        */
        addWorldNPC(
            950,
            900,
            "elian",
            {
                movable: true,
                wanderRadius: 75
            }
        );


        addWorldNPC(
            1840,
            1360,
            "mara",
            {
                movable: true,
                wanderRadius: 55
            }
        );


        addWorldNPC(
            2770,
            790,
            "miguel",
            {
                movable: false
            }
        );


        /*
            PORTÃO NORTE

            Só poderá ser aberto depois do Dash.
            Material só é mostrado DEPOIS do Dash.
        */
        addGate({

            id:
                "north_gate",

            name:
                "PORTÃO NORTE",

            x:
                1490,

            y:
                55,

            w:
                220,

            h:
                70,

            orientation:
                "horizontal",

            targetArea:
                "shadow",

            route:
                2,

            requiresDash:
                true,

            requiredCost:
                NORTH_GATE_COST,

            locked:
                !state.player
                    ?.gateUnlocks
                    ?.north

        });


        /*
            OESTE E SUL continuam existindo,
            mas não inventamos a habilidade exclusiva
            da rota futura.
        */
        addGate({

            id:
                "west_gate",

            name:
                "PORTÃO OESTE",

            x:
                55,

            y:
                995,

            w:
                70,

            h:
                220,

            orientation:
                "vertical",

            route:
                3,

            futureRoute:
                true,

            locked:
                true

        });


        addGate({

            id:
                "south_gate",

            name:
                "PORTÃO SUL",

            x:
                1490,

            y:
                2075,

            w:
                220,

            h:
                70,

            orientation:
                "horizontal",

            route:
                4,

            futureRoute:
                true,

            locked:
                true

        });


        /*
            GUARDIÃO DA ESTRADA — ROTA 1
        */
        if (
            !hasDefeatedBossSafe(
                "road_guardian"
            )
        ) {

            addEnemy({

                id:
                    "road_guardian",

                x:
                    2910,

                y:
                    1110,

                name:
                    "GUARDIÃO DA ESTRADA",

                type:
                    "progression",

                hp:
                    430,

                damage:
                    24,

                speed:
                    65,

                vision:
                    360,

                attackRange:
                    82,

                radius:
                    42,

                xp:
                    230,

                money:
                    115,

                drop:
                    "ferro",

                dropAmount:
                    3,

                unlock:
                    "forest",

                ability: {
                    id: "guardianSweep",
                    type: "sweep",
                    cooldown: 3.2
                }

            });

        }


        addPortal(
            3040,
            965,
            80,
            290,
            "forest",
            () =>
                hasDefeatedBossSafe(
                    "road_guardian"
                ),
            "ESTRADA PARA A FLORESTA",
            {
                id:
                    "village_to_forest",

                targetX:
                    230,

                targetY:
                    1140
            }
        );


        /*
            CERVO ANCESTRAL
            Boss de recurso sem barra grande.
        */
        addEnemy({

            id:
                "ancient_deer",

            x:
                630,

            y:
                1110,

            name:
                "CERVO ANCESTRAL",

            type:
                "resourceBoss",

            hp:
                520,

            damage:
                25,

            speed:
                102,

            vision:
                290,

            attackRange:
                68,

            radius:
                40,

            xp:
                165,

            money:
                75,

            drop:
                "couro",

            dropAmount:
                4,

            secondaryDrop:
                "osso",

            secondaryDropChance:
                0.75,

            ability: {
                id: "antlerCharge",
                type: "charge",
                cooldown: 3.5,
                telegraph: 0.65,
                speed: 390,
                duration: 0.52
            },

            metadata: {
                respawnBoss: true,
                respawnSeconds: 110
            }

        });


        /*
            ÁRVORES EM VOLTA SEM BLOQUEAR ESTRADAS.
        */
        addScatteredTrees(
            32,
            {
                salt:
                    "village_trees"
            }
        );


        /*
            Pequenos detalhes.
        */
        addLandmark({

            id:
                "village_notice_board",

            type:
                "noticeBoard",

            x:
                1805,

            y:
                985,

            radius:
                28,

            name:
                "MURAL DA VILA",

            mapIcon:
                "▤"

        });


        addLandmark({

            id:
                "village_well",

            type:
                "well",

            x:
                1300,

            y:
                870,

            radius:
                42,

            name:
                "POÇO ANTIGO",

            mapIcon:
                "○"

        });

    }


    /* =========================================================
       FLORESTA
       ========================================================= */

    function buildForest() {

        addPath(
            55,
            1080,
            3290,
            125,
            {
                id:
                    "forest_main_path"
            }
        );


        addPath(
            650,
            740,
            105,
            465,
            {
                id:
                    "forest_shelter_path"
            }
        );


        addBuilding(
            "forestShelter",
            470,
            470,
            410,
            285,
            "CABANA DA FLORESTA",
            "#455638",
            "#77634a",
            {
                mapIcon:
                    "⌂"
            }
        );


        addScatteredTrees(
            74,
            {
                salt:
                    "forest_dense",

                type:
                    "forestTree"
            }
        );


        const rng =
            getAreaRng(
                "forest",
                "forest_enemies"
            );


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            const type =
                i % 3 ===
                0
                    ? "boar"
                    : "wolf";


            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        600,
                        2750
                    ),

                    rngRange(
                        rng,
                        400,
                        1900
                    ),

                    ENEMY_TYPES[
                        type
                    ].radius

                );


            addEnemy({

                id:
                    `forest_${type}_${i}`,

                template:
                    type,

                x:
                    spawn.x,

                y:
                    spawn.y,

                drop:
                    type ===
                    "boar"
                        ? "couro"
                        : "osso",

                dropAmount:
                    1

            });

        }


        if (
            !hasDefeatedBossSafe(
                "forest_warden"
            )
        ) {

            addEnemy({

                id:
                    "forest_warden",

                x:
                    2960,

                y:
                    1140,

                name:
                    "VIGIA DA FLORESTA",

                type:
                    "progression",

                hp:
                    620,

                damage:
                    29,

                speed:
                    72,

                vision:
                    390,

                attackRange:
                    92,

                radius:
                    45,

                xp:
                    300,

                money:
                    145,

                drop:
                    "couro",

                dropAmount:
                    4,

                unlock:
                    "grove",

                ability: {
                    id: "forestRoots",
                    type: "rootsAndCharge",
                    cooldown: 3.3
                }

            });

        }


        addPortal(
            3190,
            980,
            85,
            310,
            "grove",
            () =>
                hasDefeatedBossSafe(
                    "forest_warden"
                ),
            "TRILHA PARA O BOSQUE",
            {
                id:
                    "forest_to_grove",

                targetX:
                    250,

                targetY:
                    1175
            }
        );


        addPortal(
            85,
            1010,
            75,
            285,
            "village",
            () => true,
            "VILA DO CREPÚSCULO",
            {
                id:
                    "forest_to_village",

                returnPortal:
                    true,

                targetX:
                    2960,

                targetY:
                    1110
            }
        );

    }


    /* =========================================================
       BOSQUE
       ========================================================= */

    function buildGrove() {

        addPath(
            55,
            1110,
            3390,
            125,
            {
                id:
                    "grove_main_path"
            }
        );


        addPath(
            1040,
            700,
            105,
            470,
            {
                id:
                    "grove_house_path"
            }
        );


        addBuilding(
            "groveShelter",
            850,
            425,
            420,
            290,
            "CASA DAS RAÍZES",
            "#405136",
            "#776a4c",
            {
                mapIcon:
                    "⌂"
            }
        );


        addScatteredTrees(
            69,
            {
                salt:
                    "grove_trees",

                type:
                    "ancientTree"
            }
        );


        scatterResources(
            "madeira",
            10,
            "grove_wood"
        );


        const rng =
            getAreaRng(
                "grove",
                "grove_enemies"
            );


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        600,
                        2900
                    ),

                    rngRange(
                        rng,
                        350,
                        1950
                    ),

                    21

                );


            addEnemy({

                id:
                    `grove_thorn_${i}`,

                template:
                    "thornling",

                x:
                    spawn.x,

                y:
                    spawn.y,

                drop:
                    "madeira",

                dropAmount:
                    2

            });

        }


        if (
            !hasDefeatedBossSafe(
                "grove_heart"
            )
        ) {

            addEnemy({

                id:
                    "grove_heart",

                x:
                    3050,

                y:
                    1170,

                name:
                    "CORAÇÃO DO BOSQUE",

                type:
                    "progression",

                hp:
                    760,

                damage:
                    32,

                speed:
                    58,

                vision:
                    400,

                attackRange:
                    105,

                radius:
                    48,

                xp:
                    370,

                money:
                    170,

                drop:
                    "essencia",

                dropAmount:
                    3,

                unlock:
                    "mountains",

                ability: {
                    id: "ancientRoots",
                    type: "rootField",
                    cooldown: 3.4
                }

            });

        }


        addPortal(
            3280,
            1010,
            80,
            300,
            "mountains",
            () =>
                hasDefeatedBossSafe(
                    "grove_heart"
                ),
            "PASSAGEM PARA AS MONTANHAS",
            {
                id:
                    "grove_to_mountains",

                targetX:
                    250,

                targetY:
                    1175
            }
        );


        addPortal(
            85,
            1020,
            75,
            290,
            "forest",
            () => true,
            "FLORESTA",
            {
                id:
                    "grove_to_forest",

                returnPortal:
                    true,

                targetX:
                    3070,

                targetY:
                    1140
            }
        );

    }


    /* =========================================================
       MONTANHAS
       ========================================================= */

    function buildMountains() {

        addPath(
            55,
            1110,
            3390,
            125,
            {
                id:
                    "mountain_main_path"
            }
        );


        addPath(
            760,
            690,
            105,
            480,
            {
                id:
                    "mountain_shelter_path"
            }
        );


        addBuilding(
            "mountainShelter",
            570,
            405,
            430,
            295,
            "ABRIGO DA MONTANHA",
            "#5b5c58",
            "#8d8780",
            {
                mapIcon:
                    "⌂"
            }
        );


        const rng =
            getAreaRng(
                "mountains",
                "mountain_rocks"
            );


        for (
            let i = 0;
            i < 34;
            i++
        ) {

            const x =
                rngRange(
                    rng,
                    160,
                    3300
                );


            const y =
                rngRange(
                    rng,
                    160,
                    2170
                );


            if (
                isProtectedForGeneration(
                    x,
                    y,
                    65
                )
            ) {

                continue;

            }


            addObstacle(
                x,
                y,
                rngRange(
                    rng,
                    52,
                    92
                ),
                rngRange(
                    rng,
                    38,
                    68
                ),
                "mountainRock"
            );

        }


        scatterResources(
            "carvao",
            16,
            "mountain_coal"
        );


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        650,
                        2850
                    ),

                    rngRange(
                        rng,
                        350,
                        1950
                    ),

                    23

                );


            addEnemy({

                id:
                    `mountain_crawler_${i}`,

                template:
                    "stoneCrawler",

                x:
                    spawn.x,

                y:
                    spawn.y,

                drop:
                    "carvao",

                dropAmount:
                    2

            });

        }


        if (
            !hasDefeatedBossSafe(
                "mountain_titan"
            )
        ) {

            addEnemy({

                id:
                    "mountain_titan",

                x:
                    3040,

                y:
                    1170,

                name:
                    "TITÃ DAS MONTANHAS",

                type:
                    "progression",

                hp:
                    900,

                damage:
                    37,

                speed:
                    56,

                vision:
                    410,

                attackRange:
                    108,

                radius:
                    52,

                xp:
                    440,

                money:
                    205,

                drop:
                    "ferro",

                dropAmount:
                    5,

                unlock:
                    "iron",

                ability: {
                    id: "titanQuake",
                    type: "multiShockwave",
                    cooldown: 3.8
                }

            });

        }


        addPortal(
            3280,
            1010,
            80,
            305,
            "iron",
            () =>
                hasDefeatedBossSafe(
                    "mountain_titan"
                ),
            "ENTRADA DA MINA",
            {
                id:
                    "mountains_to_iron",

                targetX:
                    245,

                targetY:
                    1125
            }
        );


        addPortal(
            85,
            1010,
            75,
            300,
            "grove",
            () => true,
            "BOSQUE",
            {
                id:
                    "mountains_to_grove",

                returnPortal:
                    true,

                targetX:
                    3080,

                targetY:
                    1175
            }
        );

    }


    /* =========================================================
       MINA DE FERRO
       ========================================================= */

    function buildIron() {

        addPath(
            55,
            1060,
            3290,
            125,
            {
                id:
                    "iron_main_tunnel"
            }
        );


        addPath(
            820,
            650,
            105,
            470,
            {
                id:
                    "iron_shelter_path"
            }
        );


        addBuilding(
            "ironShelter",
            620,
            380,
            430,
            295,
            "POSTO DOS MINEIROS",
            "#363838",
            "#68615a",
            {
                mapIcon:
                    "⌂"
            }
        );


        scatterResources(
            "ferro",
            20,
            "iron_nodes"
        );


        scatterResources(
            "carvao",
            8,
            "iron_coal"
        );


        const rng =
            getAreaRng(
                "iron",
                "iron_enemy"
            );


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        600,
                        2850
                    ),

                    rngRange(
                        rng,
                        330,
                        1900
                    ),

                    23

                );


            addEnemy({

                id:
                    `iron_crawler_${i}`,

                template:
                    "mineCrawler",

                x:
                    spawn.x,

                y:
                    spawn.y,

                drop:
                    "ferro",

                dropAmount:
                    2

            });

        }


        if (
            !hasDefeatedBossSafe(
                "iron_colossus"
            )
        ) {

            addEnemy({

                id:
                    "iron_colossus",

                x:
                    2940,

                y:
                    1125,

                name:
                    "COLOSSO DE FERRO",

                type:
                    "progression",

                hp:
                    1080,

                damage:
                    40,

                speed:
                    54,

                vision:
                    415,

                attackRange:
                    110,

                radius:
                    54,

                xp:
                    520,

                money:
                    245,

                drop:
                    "ferro",

                dropAmount:
                    8,

                unlock:
                    "ruby",

                ability: {
                    id: "ironHammer",
                    type: "hammerAndShards",
                    cooldown: 3.6
                }

            });

        }


        addPortal(
            3180,
            960,
            85,
            310,
            "ruby",
            () =>
                hasDefeatedBossSafe(
                    "iron_colossus"
                ),
            "GALERIA RUBRA",
            {
                id:
                    "iron_to_ruby",

                targetX:
                    245,

                targetY:
                    1150
            }
        );


        addPortal(
            85,
            970,
            75,
            300,
            "mountains",
            () => true,
            "MONTANHAS",
            {
                id:
                    "iron_to_mountains",

                returnPortal:
                    true,

                targetX:
                    3070,

                targetY:
                    1170
            }
        );

    }


    /* =========================================================
       CAVERNA DE RUBI
       ========================================================= */

    function buildRuby() {

        addPath(
            55,
            1080,
            3390,
            125,
            {
                id:
                    "ruby_main_tunnel"
            }
        );


        addPath(
            690,
            690,
            105,
            450,
            {
                id:
                    "ruby_shelter_path"
            }
        );


        addBuilding(
            "rubyShelter",
            500,
            410,
            420,
            290,
            "POSTO RUBRO",
            "#512e35",
            "#72474d",
            {
                mapIcon:
                    "⌂"
            }
        );


        scatterResources(
            "ouro",
            13,
            "ruby_gold"
        );


        scatterResources(
            "diamante",
            11,
            "ruby_diamond"
        );


        scatterResources(
            "rubi",
            18,
            "ruby_ruby"
        );


        const rng =
            getAreaRng(
                "ruby",
                "ruby_enemies"
            );


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        650,
                        2950
                    ),

                    rngRange(
                        rng,
                        350,
                        1950
                    ),

                    22

                );


            addEnemy({

                id:
                    `ruby_hound_${i}`,

                template:
                    "rubyHound",

                x:
                    spawn.x,

                y:
                    spawn.y,

                drop:
                    i % 3 ===
                        0
                            ? "rubi"
                            : "ouro",

                dropAmount:
                    1

            });

        }


        if (
            !hasDefeatedBossSafe(
                "ruby_chimera"
            )
        ) {

            addEnemy({

                id:
                    "ruby_chimera",

                x:
                    3100,

                y:
                    1145,

                name:
                    "QUIMERA DE RUBI",

                type:
                    "progression",

                hp:
                    1260,

                damage:
                    44,

                speed:
                    81,

                vision:
                    430,

                attackRange:
                    112,

                radius:
                    55,

                xp:
                    610,

                money:
                    300,

                drop:
                    "rubi",

                dropAmount:
                    7,

                unlock:
                    "monarchMaze",

                ability: {
                    id: "rubyBreath",
                    type: "breathChargeCrystal",
                    cooldown: 3.2
                }

            });

        }


        addPortal(
            3310,
            985,
            85,
            315,
            "monarchMaze",
            () =>
                hasDefeatedBossSafe(
                    "ruby_chimera"
                ),
            "CORREDOR ESCURO",
            {
                id:
                    "ruby_to_maze",

                targetX:
                    245,

                targetY:
                    1150
            }
        );


        addPortal(
            85,
            995,
            75,
            300,
            "iron",
            () => true,
            "MINA DE FERRO",
            {
                id:
                    "ruby_to_iron",

                returnPortal:
                    true,

                targetX:
                    3060,

                targetY:
                    1125
            }
        );

    }


    /* =========================================================
       LABIRINTO DO MONARCA
       ========================================================= */

    function buildMonarchMaze() {

        /*
            Entrada e eixo inicial.
        */
        addPath(
            55,
            1085,
            790,
            120,
            {
                id:
                    "maze_entry"
            }
        );


        /*
            Paredes do labirinto.

            Mantemos corredores amplos para
            personagem + Dash.
        */
        const walls = [

            [760, 220, 80, 690],

            [760, 1360, 80, 650],

            [1120, 520, 80, 940],

            [1480, 180, 80, 760],

            [1480, 1270, 80, 760],

            [1840, 510, 80, 1050],

            [2200, 180, 80, 760],

            [2200, 1270, 80, 760],

            [2560, 500, 80, 1050],

            [2920, 180, 80, 760],

            [2920, 1270, 80, 760],

            /*
                Horizontais.
            */
            [820, 500, 300, 80],

            [820, 1430, 300, 80],

            [1200, 900, 280, 80],

            [1560, 430, 280, 80],

            [1560, 1560, 280, 80],

            [1920, 900, 280, 80],

            [2280, 420, 280, 80],

            [2280, 1570, 280, 80],

            [2640, 890, 280, 80],

            [3000, 500, 360, 80],

            [3000, 1480, 360, 80]

        ];


        walls.forEach(
            (
                wall,
                index
            ) => {

                addObstacle(

                    wall[0],

                    wall[1],

                    wall[2],

                    wall[3],

                    "mazeWall",

                    {
                        id:
                            `maze_wall_${index}`,

                        blocksLight:
                            true
                    }

                );

            }
        );


        /*
            BARREIRA DA LANTERNA

            Colocada antes da parte profunda.
        */
        addDarknessBarrier({

            id:
                "maze_lantern_barrier",

            x:
                1050,

            y:
                1040,

            w:
                110,

            h:
                210,

            requiresLantern:
                true,

            message:
                "Está muito escuro, não podes continuar."

        });


        addMapMarker({

            id:
                "maze_darkness_marker",

            x:
                1105,

            y:
                1145,

            type:
                "danger",

            label:
                "ESCURIDÃO PROFUNDA",

            icon:
                "!",

            important:
                true

        });


        /*
            ALTAR
        */
        state.world.altar = {

            id:
                "monarch_altar",

            x:
                3270,

            y:
                1145,

            radius:
                76,

            active:
                false,

            pulse:
                0,

            ritualStarted:
                false

        };


        addProtectedZone(

            {
                x:
                    3130,

                y:
                    1005,

                w:
                    280,

                h:
                    280
            },

            "altar"

        );


        addMapMarker({

            id:
                "monarch_altar_marker",

            x:
                3270,

            y:
                1145,

            type:
                "altar",

            label:
                "ALTAR",

            icon:
                "✦",

            important:
                true

        });


        /*
            Aranhas, morcegos e escorpiões.
        */
        const mazeEnemies = [

            ["spider", 1320, 360],
            ["bat", 1710, 1050],
            ["scorpion", 2090, 1710],
            ["spider", 2440, 690],
            ["bat", 2750, 1720],
            ["scorpion", 3110, 880]

        ];


        mazeEnemies.forEach(
            (
                data,
                index
            ) => {

                addEnemy({

                    id:
                        `maze_${data[0]}_${index}`,

                    template:
                        data[0],

                    x:
                        data[1],

                    y:
                        data[2],

                    drop:
                        "essencia",

                    dropAmount:
                        1

                });

            }
        );


        /*
            Monarca só é despertado pelo ritual.

            Parte 4 cuidará da criação/ativação real
            para não permitir matar antes da oferenda.
        */
        if (
            state.player
                ?.monarchAwakened &&
            !state.player
                ?.monarchDefeated
        ) {

            addEnemy({

                id:
                    "monarch",

                x:
                    3180,

                y:
                    1145,

                name:
                    "O MONARCA",

                type:
                    "progression",

                hp:
                    1750,

                damage:
                    51,

                speed:
                    74,

                vision:
                    520,

                attackRange:
                    120,

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
                    id: "monarchPattern",
                    type: "monarch",
                    cooldown: 2.6
                },

                metadata: {
                    monarch: true,
                    maxClones: 4,
                    staggerHits: 10,
                    staggerDuration: 5
                }

            });

        }


        addPortal(
            85,
            1010,
            75,
            300,
            "ruby",
            () => true,
            "CAVERNA DE RUBI",
            {
                id:
                    "maze_to_ruby",

                returnPortal:
                    true,

                targetX:
                    3180,

                targetY:
                    1145
            }
        );

    }


    /* =========================================================
       CAVERNA SOMBRIA
       ========================================================= */

    function buildShadow() {

        addPath(
            55,
            1025,
            3190,
            125,
            {
                id:
                    "shadow_main_path"
            }
        );


        addPath(
            690,
            650,
            105,
            440,
            {
                id:
                    "shadow_shelter_path"
            }
        );


        addBuilding(
            "shadowShelter",
            500,
            390,
            420,
            285,
            "REFÚGIO SOMBRIO",
            "#34303e",
            "#5b5263",
            {
                mapIcon:
                    "⌂"
            }
        );


        const rng =
            getAreaRng(
                "shadow",
                "shadow_rocks"
            );


        for (
            let i = 0;
            i < 27;
            i++
        ) {

            const x =
                rngRange(
                    rng,
                    170,
                    3050
                );


            const y =
                rngRange(
                    rng,
                    170,
                    1980
                );


            if (
                isProtectedForGeneration(
                    x,
                    y,
                    60
                )
            ) {

                continue;

            }


            addObstacle(
                x,
                y,
                rngRange(
                    rng,
                    50,
                    80
                ),
                rngRange(
                    rng,
                    40,
                    65
                ),
                "darkrock"
            );

        }


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const type =

                i %
                3 ===
                0

                    ? "bat"

                    : i %
                        3 ===
                        1

                        ? "spider"

                        : "scorpion";


            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        800,
                        2650
                    ),

                    rngRange(
                        rng,
                        300,
                        1800
                    ),

                    ENEMY_TYPES[
                        type
                    ].radius

                );


            addEnemy({

                id:
                    `shadow_${type}_${i}`,

                template:
                    type,

                x:
                    spawn.x,

                y:
                    spawn.y,

                name:
                    type ===
                    "bat"
                        ? "MORCEGO SOMBRIO"
                        : type ===
                            "spider"
                            ? "ARANHA SOMBRIA"
                            : "ESCORPIÃO SOMBRIO",

                color:
                    "#4b435b",

                drop:
                    "essencia",

                dropAmount:
                    1

            });

        }


        if (
            !hasDefeatedBossSafe(
                "shadow_lord"
            )
        ) {

            addEnemy({

                id:
                    "shadow_lord",

                x:
                    2750,

                y:
                    1080,

                name:
                    "SENHOR DAS SOMBRAS",

                type:
                    "progression",

                hp:
                    1020,

                damage:
                    43,

                speed:
                    82,

                vision:
                    410,

                attackRange:
                    105,

                radius:
                    51,

                xp:
                    570,

                money:
                    285,

                drop:
                    "essencia",

                dropAmount:
                    5,

                unlock:
                    "fairy",

                ability: {
                    id: "shadowBlink",
                    type: "shadowDash",
                    cooldown: 3
                }

            });

        }


        addPortal(
            3070,
            920,
            80,
            310,
            "fairy",
            () =>
                hasDefeatedBossSafe(
                    "shadow_lord"
                ),
            "LUZ ADIANTE",
            {
                id:
                    "shadow_to_fairy",

                targetX:
                    240,

                targetY:
                    1125
            }
        );


        addPortal(
            85,
            920,
            75,
            300,
            "village",
            () => true,
            "VILA DO CREPÚSCULO",
            {
                id:
                    "shadow_to_village",

                returnPortal:
                    true,

                targetX:
                    1600,

                targetY:
                    180
            }
        );

    }


    /* =========================================================
       REINO DAS FADAS
       ========================================================= */

    function buildFairy() {

        addPath(
            55,
            1065,
            3290,
            125,
            {
                id:
                    "fairy_main_path"
            }
        );


        addPath(
            810,
            670,
            105,
            455,
            {
                id:
                    "fairy_shelter_path"
            }
        );


        addBuilding(
            "fairyShelter",
            615,
            390,
            430,
            295,
            "CASA DAS FLORES",
            "#684d69",
            "#92758a",
            {
                mapIcon:
                    "⌂"
            }
        );


        scatterResources(
            "cristal",
            24,
            "fairy_crystals"
        );


        const rng =
            getAreaRng(
                "fairy",
                "fairy_effects"
            );


        for (
            let i = 0;
            i < 35;
            i++
        ) {

            state.world.effects.push({

                id:
                    `fairy_flower_${i}`,

                type:
                    "flower",

                x:
                    rngRange(
                        rng,
                        150,
                        3200
                    ),

                y:
                    rngRange(
                        rng,
                        150,
                        2100
                    ),

                phase:
                    rngRange(
                        rng,
                        0,
                        Math.PI *
                        2
                    ),

                scale:
                    rngRange(
                        rng,
                        0.7,
                        1.3
                    )

            });

        }


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        800,
                        2850
                    ),

                    rngRange(
                        rng,
                        350,
                        1850
                    ),

                    20

                );


            addEnemy({

                id:
                    `fairy_spirit_${i}`,

                x:
                    spawn.x,

                y:
                    spawn.y,

                name:
                    "ESPÍRITO FEÉRICO",

                icon:
                    "✧",

                spriteType:
                    "fairySpirit",

                type:
                    "normal",

                hp:
                    285,

                damage:
                    32,

                speed:
                    98,

                vision:
                    330,

                attackRange:
                    175,

                radius:
                    20,

                color:
                    "#b887be",

                xp:
                    62,

                money:
                    20,

                drop:
                    "cristal",

                dropAmount:
                    1,

                ability: {
                    id: "fairyBolt",
                    type: "fairyProjectile",
                    cooldown: 2.4
                }

            });

        }


        if (
            !hasDefeatedBossSafe(
                "fairy_guardian"
            )
        ) {

            addEnemy({

                id:
                    "fairy_guardian",

                x:
                    2910,

                y:
                    1120,

                name:
                    "GUARDIÃ FEÉRICA",

                type:
                    "progression",

                hp:
                    1180,

                damage:
                    46,

                speed:
                    88,

                vision:
                    430,

                attackRange:
                    180,

                radius:
                    49,

                xp:
                    650,

                money:
                    340,

                drop:
                    "essencia",

                dropAmount:
                    5,

                unlock:
                    "sky",

                ability: {
                    id: "fairyGuardianPattern",
                    type: "fairyBoss",
                    cooldown: 2.8
                }

            });

        }


        addPortal(
            3190,
            930,
            80,
            315,
            "sky",
            () =>
                hasDefeatedBossSafe(
                    "fairy_guardian"
                ),
            "PASSAGEM CELESTE",
            {
                id:
                    "fairy_to_sky",

                targetX:
                    250,

                targetY:
                    1125
            }
        );


        addPortal(
            85,
            930,
            75,
            305,
            "shadow",
            () => true,
            "CAVERNA SOMBRIA",
            {
                id:
                    "fairy_to_shadow",

                returnPortal:
                    true,

                targetX:
                    2960,

                targetY:
                    1080
            }
        );

    }


    /* =========================================================
       CÉU

       O Guardião do Caminho NÃO aparece
       antes das 5 hordas.

       Parte 4 controla as hordas.
       ========================================================= */

    function buildSky() {

        addPath(
            55,
            1060,
            3290,
            125,
            {
                id:
                    "sky_main_path"
            }
        );


        addPath(
            700,
            650,
            105,
            470,
            {
                id:
                    "sky_shelter_path"
            }
        );


        addBuilding(
            "skyShelter",
            510,
            375,
            420,
            290,
            "SANTUÁRIO CELESTE",
            "#849aa0",
            "#c2d0d1",
            {
                mapIcon:
                    "⌂"
            }
        );


        scatterResources(
            "cristal",
            18,
            "sky_crystals"
        );


        const rng =
            getAreaRng(
                "sky",
                "sky_visuals"
            );


        for (
            let i = 0;
            i < 28;
            i++
        ) {

            state.world.effects.push({

                id:
                    `cloud_${i}`,

                type:
                    "cloud",

                x:
                    rngRange(
                        rng,
                        100,
                        3300
                    ),

                y:
                    rngRange(
                        rng,
                        100,
                        2150
                    ),

                phase:
                    rngRange(
                        rng,
                        0,
                        Math.PI *
                        2
                    ),

                speed:
                    rngRange(
                        rng,
                        2,
                        7
                    ),

                scale:
                    rngRange(
                        rng,
                        0.7,
                        1.5
                    )

            });

        }


        /*
            Criaturas normais do Céu.

            As hordas especiais são separadas.
        */
        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const spawn =
                findSafeSpawn(

                    rngRange(
                        rng,
                        850,
                        2600
                    ),

                    rngRange(
                        rng,
                        350,
                        1850
                    ),

                    23

                );


            addEnemy({

                id:
                    `sky_seraph_${i}`,

                x:
                    spawn.x,

                y:
                    spawn.y,

                name:
                    "SERAFIM CAÍDO",

                icon:
                    "✦",

                spriteType:
                    "fallenSeraph",

                type:
                    "normal",

                hp:
                    340,

                damage:
                    36,

                speed:
                    104,

                vision:
                    360,

                attackRange:
                    185,

                radius:
                    23,

                color:
                    "#cbd7df",

                xp:
                    72,

                money:
                    24,

                drop:
                    "cristal",

                dropAmount:
                    2,

                ability: {
                    id: "seraphDive",
                    type: "projectileDive",
                    cooldown: 2.6
                }

            });

        }


        /*
            Área das hordas.
        */
        addLandmark({

            id:
                "sky_trial_arena",

            type:
                "arena",

            x:
                2500,

            y:
                1125,

            radius:
                280,

            name:
                "PROVA CELESTE",

            color:
                "#c4d6db",

            glow:
                "#f3e6ae",

            mapIcon:
                "✦",

            important:
                true

        });


        if (
            state.player
                ?.skyTrial
                ?.complete &&
            !hasDefeatedBossSafe(
                "path_guardian"
            )
        ) {

            addEnemy({

                id:
                    "path_guardian",

                x:
                    2940,

                y:
                    1125,

                name:
                    "GUARDIÃO DO CAMINHO",

                type:
                    "progression",

                hp:
                    1450,

                damage:
                    51,

                speed:
                    96,

                vision:
                    470,

                attackRange:
                    135,

                radius:
                    53,

                xp:
                    820,

                money:
                    430,

                drop:
                    "essencia",

                dropAmount:
                    6,

                unlock:
                    "hell",

                ability: {
                    id: "pathGuardianPattern",
                    type: "skyBoss",
                    cooldown: 2.5
                },

                metadata: {
                    grantsFlute:
                        true
                }

            });

        }


        addPortal(
            3190,
            930,
            80,
            315,
            "hell",
            () =>
                state.player
                    ?.flutePlayed ===
                true,
            "PASSAGEM DESCONHECIDA",
            {
                id:
                    "sky_to_hell",

                hidden:
                    !state.player
                        ?.flutePlayed,

                targetX:
                    260,

                targetY:
                    1225
            }
        );


        addPortal(
            85,
            930,
            75,
            305,
            "fairy",
            () => true,
            "REINO DAS FADAS",
            {
                id:
                    "sky_to_fairy",

                returnPortal:
                    true,

                targetX:
                    3070,

                targetY:
                    1120
            }
        );

    }


    /* =========================================================
       INFERNO
       ========================================================= */

    function buildHell() {

        addPath(
            55,
            1160,
            3590,
            130,
            {
                id:
                    "hell_main_path"
            }
        );


        addPath(
            750,
            720,
            110,
            500,
            {
                id:
                    "hell_shelter_path"
            }
        );


        addBuilding(
            "hellShelter",
            550,
            420,
            430,
            300,
            "ABRIGO DAS CINZAS",
            "#412824",
            "#6b4136",
            {
                mapIcon:
                    "⌂"
            }
        );


        const rng =
            getAreaRng(
                "hell",
                "hell_world"
            );


        for (
            let i = 0;
            i < 30;
            i++
        ) {

            const x =
                rngRange(
                    rng,
                    170,
                    3500
                );


            const y =
                rngRange(
                    rng,
                    170,
                    2270
                );


            if (
                isProtectedForGeneration(
                    x,
                    y,
                    70
                )
            ) {

                continue;

            }


            addObstacle(
                x,
                y,
                rngRange(
                    rng,
                    55,
                    90
                ),
                rngRange(
                    rng,
                    42,
                    72
                ),
                "basalt"
            );

        }


        const hellTypes = [

            {
                name: "DEMÔNIO DE CINZA",
                spriteType: "ashDemon",
                color: "#8c4d3f",
                ability: "ashBurst"
            },

            {
                name: "CÃO DE LAVA",
                spriteType: "lavaHound",
                color: "#984b31",
                ability: "lavaCharge"
            },

            {
                name: "ESPECTRO CARMESIM",
                spriteType: "crimsonSpecter",
                color: "#724056",
                ability: "specterBolt"
            },

            {
                name: "GÁRGULA QUEBRADA",
                spriteType: "gargoyle",
                color: "#70554a",
                ability: "gargoyleDive"
            },

            {
                name: "PARASITA DO VAZIO",
                spriteType: "voidParasite",
                color: "#4b3551",
                ability: "voidWeb"
            }

        ];


        hellTypes.forEach(
            (
                type,
                typeIndex
            ) => {

                for (
                    let i = 0;
                    i < 2;
                    i++
                ) {

                    const spawn =
                        findSafeSpawn(

                            rngRange(
                                rng,
                                800,
                                3100
                            ),

                            rngRange(
                                rng,
                                350,
                                2100
                            ),

                            24

                        );


                    addEnemy({

                        id:
                            `hell_${typeIndex}_${i}`,

                        x:
                            spawn.x,

                        y:
                            spawn.y,

                        name:
                            type.name,

                        spriteType:
                            type.spriteType,

                        type:
                            "hell",

                        hellType:
                            typeIndex,

                        hp:
                            390 +
                            typeIndex *
                            38,

                        damage:
                            38 +
                            typeIndex *
                            3,

                        speed:
                            82 +
                            typeIndex *
                            5,

                        vision:
                            380,

                        attackRange:
                            typeIndex ===
                                2
                                    ? 180
                                    : 82,

                        radius:
                            24,

                        color:
                            type.color,

                        xp:
                            82 +
                            typeIndex *
                            9,

                        money:
                            28 +
                            typeIndex *
                            4,

                        drop:
                            typeIndex %
                            2 ===
                            0
                                ? "essencia"
                                : "ouro",

                        dropAmount:
                            2,

                        ability: {
                            id:
                                type.ability,

                            type:
                                type.ability,

                            cooldown:
                                2.4 +
                                typeIndex *
                                0.12
                        }

                    });

                }

            }
        );


        if (
            !hasDefeatedBossSafe(
                "hell_guardian"
            )
        ) {

            addEnemy({

                id:
                    "hell_guardian",

                x:
                    3260,

                y:
                    1225,

                name:
                    "GUARDIÃO DO INFERNO",

                type:
                    "progression",

                hp:
                    1720,

                damage:
                    58,

                speed:
                    86,

                vision:
                    490,

                attackRange:
                    140,

                radius:
                    56,

                xp:
                    1000,

                money:
                    560,

                drop:
                    "essencia",

                dropAmount:
                    9,

                unlock:
                    "final",

                ability: {
                    id: "infernalGuardian",
                    type: "hellBoss",
                    cooldown: 2.5
                }

            });

        }


        addPortal(
            3490,
            1030,
            85,
            330,
            "final",
            () =>
                hasDefeatedBossSafe(
                    "hell_guardian"
                ),
            "CÂMARA ALÉM DA QUIETUDE",
            {
                id:
                    "hell_to_final",

                targetX:
                    250,

                targetY:
                    775
            }
        );


        addPortal(
            85,
            1050,
            75,
            315,
            "sky",
            () => true,
            "REINO CELESTE",
            {
                id:
                    "hell_to_sky",

                returnPortal:
                    true,

                targetX:
                    3070,

                targetY:
                    1125
            }
        );

    }


    /* =========================================================
       CÂMARA FINAL
       ========================================================= */

    function buildFinal() {

        addPath(
            55,
            720,
            2090,
            120,
            {
                id:
                    "final_path"
            }
        );


        /*
            Arena.
        */
        addLandmark({

            id:
                "final_arena",

            type:
                "arena",

            x:
                1600,

            y:
                775,

            radius:
                360,

            name:
                "CÂMARA DA MEMÓRIA",

            color:
                "#6f6279",

            glow:
                "#a88fba",

            mapIcon:
                "◐",

            important:
                true

        });


        if (
            !state.player
                ?.finalDefeated
        ) {

            addEnemy({

                id:
                    "other_self",

                x:
                    1660,

                y:
                    775,

                name:
                    "O OUTRO EU",

                type:
                    "progression",

                hp:
                    2100,

                damage:
                    62,

                speed:
                    112,

                vision:
                    560,

                attackRange:
                    145,

                radius:
                    54,

                xp:
                    0,

                money:
                    0,

                ability: {
                    id: "mirrorPlayer",
                    type: "mirrorBoss",
                    cooldown: 2.2
                },

                metadata: {
                    finalBoss:
                        true
                }

            });

        }


        addPortal(
            85,
            640,
            75,
            270,
            "hell",
            () => true,
            "INFERNO",
            {
                id:
                    "final_to_hell",

                returnPortal:
                    true,

                targetX:
                    3400,

                targetY:
                    1225
            }
        );

    }


    /* =========================================================
       BOSS SAFE HELPERS

       A função oficial de progressão será
       consolidada na Parte 3/4.

       Esta versão segura evita crash durante
       construção do mundo.
       ========================================================= */

    function hasDefeatedBossSafe(
        bossId
    ) {

        return Boolean(

            state.player &&
            Array.isArray(
                state.player
                    .defeatedBosses
            ) &&

            state.player
                .defeatedBosses
                .includes(
                    bossId
                )

        );

    }


    /* =========================================================
       REPARAR POSIÇÃO
       ========================================================= */

    function repairPlayerPosition(
        preferredX =
            state.player
                ?.x,
        preferredY =
            state.player
                ?.y
    ) {

        if (
            !state.player ||
            !state.world
        ) {

            return false;

        }


        const x =
            finiteNumber(
                preferredX,
                state.player.x
            );


        const y =
            finiteNumber(
                preferredY,
                state.player.y
            );


        if (
            !isCircleBlockedByWorld(

                x,
                y,

                state.player.radius,

                {
                    ignoreDarknessBarrier:
                        true
                }

            )
        ) {

            state.player.x =
                x;

            state.player.y =
                y;

            return true;

        }


        const safe =
            findSafeSpawn(

                x,
                y,

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
       SPAWN DE ENTRADA POR REGIÃO
       ========================================================= */

    const REGION_ENTRY_SPAWNS =
        Object.freeze({

            village: {
                x: 1600,
                y: 1110
            },

            forest: {
                x: 230,
                y: 1140
            },

            grove: {
                x: 250,
                y: 1175
            },

            mountains: {
                x: 250,
                y: 1175
            },

            iron: {
                x: 245,
                y: 1125
            },

            ruby: {
                x: 245,
                y: 1150
            },

            monarchMaze: {
                x: 245,
                y: 1150
            },

            shadow: {
                x: 245,
                y: 1080
            },

            fairy: {
                x: 240,
                y: 1125
            },

            sky: {
                x: 250,
                y: 1125
            },

            hell: {
                x: 260,
                y: 1225
            },

            final: {
                x: 250,
                y: 775
            }

        });


    function getRegionEntrySpawn(
        area
    ) {

        return {

            ...(
                REGION_ENTRY_SPAWNS[
                    area
                ] ||
                REGION_ENTRY_SPAWNS
                    .village
            )

        };

    }


    /* =========================================================
       RETORNO DE ÁREA
       ========================================================= */

    function getPreviousRegion(
        area =
            state.area
    ) {

        return (
            PREVIOUS_REGION[
                area
            ] ||
            null
        );

    }


    /* =========================================================
       VALIDAR HOUSE INTERIOR
       ========================================================= */

    function isInteriorPositionBlocked(
        x,
        y,
        radius,
        houseOrId =
            state.currentHouse
    ) {

        const spec =
            getHouseSpec(
                houseOrId
            );


        if (!spec) {

            return false;

        }


        const room =
            spec.room;


        /*
            Paredes.
        */
        if (
            x -
            radius <
            room.x ||

            x +
            radius >
            room.x +
            room.w ||

            y -
            radius <
            room.y ||

            y +
            radius >
            room.y +
            room.h
        ) {

            return true;

        }


        const door =
            spec.door;


        /*
            Móveis.
        */
        for (
            const furniture of
            spec.furniture
        ) {

            if (
                furniture.collision ===
                false
            ) {

                continue;

            }


            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    furniture
                )
            ) {

                return true;

            }

        }


        /*
            A própria abertura da porta não bloqueia.
        */
        if (
            door &&
            circleRectCollision(
                x,
                y,
                radius,
                door
            )
        ) {

            return false;

        }


        return false;

    }


    /* =========================================================
       POSICIONAR PLAYER DENTRO DA CASA
       ========================================================= */

    function placePlayerInsideHouse(
        house =
            state.currentHouse
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        const spec =
            getHouseSpec(
                house
            );


        if (!spec) {

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
       PORTA EXTERIOR MAIS PRÓXIMA
       ========================================================= */

    function getNearbyExteriorDoor(
        maxDistance =
            GAME_CONFIG
                .doorInteractionDistance
    ) {

        if (
            !state.player ||
            !state.world ||
            state.houseMode
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
                    maxDistance &&
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
       ATUALIZAÇÃO VISUAL DAS PORTAS

       Abre por PROXIMIDADE.
       Z NÃO é responsável pela animação.

       Isso corrige o bug antigo.
       ========================================================= */

    function updateDoorAnimations(
        dt
    ) {

        if (
            !state.player ||
            !state.world ||
            state.houseMode
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


            const wasNear =
                door.playerNear;


            if (
                d <=
                door.openDistance
            ) {

                door.playerNear =
                    true;

                door.targetAnimation =
                    1;

            }

            else if (
                d >=
                door.closeDistance
            ) {

                door.playerNear =
                    false;

                door.targetAnimation =
                    0;

            }


            const previous =
                door.animation;


            door.animation =
                lerp(

                    door.animation,

                    door.targetAnimation,

                    clamp(
                        dt *
                        10,
                        0,
                        1
                    )

                );


            if (
                !wasNear &&
                door.playerNear
            ) {

                door.dustTimer =
                    0.45;

                door.glow =
                    1;

            }


            door.dustTimer =
                Math.max(
                    0,
                    door.dustTimer -
                    dt
                );


            door.glow =
                Math.max(
                    0,
                    door.glow -
                    dt *
                    1.8
                );


            door.isOpen =
                door.animation >
                0.72;


            /*
                Evita valores microscópicos.
            */
            if (
                Math.abs(
                    door.animation -
                    door.targetAnimation
                ) <
                0.002
            ) {

                door.animation =
                    door.targetAnimation;

            }


            /*
                Quando termina de fechar,
                marca corretamente.
            */
            if (
                previous >
                    0 &&
                door.animation <=
                    0.01
            ) {

                door.isOpen =
                    false;

            }

        }

    }


    /* =========================================================
       BARREIRA ESCURA — DETECTAR PROXIMIDADE

       A mensagem real entra no sistema de
       interação/movimento da Parte 3.
       ========================================================= */

    function getBlockingDarknessBarrier(
        x,
        y,
        radius =
            state.player
                ?.radius ||
            18
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
                canPassDarknessBarrier(
                    barrier
                )
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


    /* =========================================================
       ELEMENTOS VISÍVEIS NO MAPA

       O mapa passa a ter conhecimento de:
       - casas
       - NPCs
       - portões
       - bosses descobertos
       - altares
       - fonte
       - poço
       - passagens
       - arena
       ========================================================= */

    function getVisibleMapMarkers() {

        if (
            !state.player ||
            !state.world
        ) {

            return [];

        }


        const explored =
            state.player
                .exploredAreas
                ?.includes(
                    state.area
                );


        if (!explored) {

            return [];

        }


        return state.world
            .mapMarkers
            .filter(
                marker => {

                    if (
                        marker.revealRule ===
                        "bossDiscovered"
                    ) {

                        return (
                            state.player
                                .discoveredBosses
                                ?.includes(
                                    marker.targetId
                                ) ||

                            state.player
                                .defeatedBosses
                                ?.includes(
                                    marker.targetId
                                )
                        );

                    }


                    return true;

                }
            );

    }


    /* =========================================================
       VALIDAÇÃO DA PARTE 2
       ========================================================= */

    function validatePart2Data() {

        const errors =
            [];


        const requiredRegions = [

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


        for (
            const id of
            requiredRegions
        ) {

            if (
                !REGIONS[id]
            ) {

                errors.push(
                    `Região inexistente: ${id}`
                );

            }

        }


        const requiredVillageHouses = [

            "home",
            "elianHome",
            "shop",
            "forge",
            "woodshop"

        ];


        for (
            const id of
            requiredVillageHouses
        ) {

            if (
                !HOUSE_INTERIORS[
                    id
                ]
            ) {

                errors.push(
                    `Interior obrigatório inexistente: ${id}`
                );

            }

        }


        if (
            !HOUSE_INTERIORS
                .home
                .playerSpawn
        ) {

            errors.push(
                "Casa do jogador sem spawn interno."
            );

        }


        if (
            GAME_CONFIG
                .lanternVisionRadius <=
            GAME_CONFIG
                .noLanternVisionRadius
        ) {

            errors.push(
                "Raio da lanterna precisa ser maior que visão sem lanterna."
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
       FIM DA PARTE 2/5

       A PARTE 3 VAI ENTRAR DIRETAMENTE ABAIXO.

       NÃO COLOQUE })(); AQUI.
       ========================================================= */
     /* =========================================================
       VEYRA: A QUIETUDE
       V25.0
       SCRIPT.JS — PARTE 3/5

       LEVEL / STATUS
       EQUIPAMENTOS
       POÇÕES
       SOBREVIVÊNCIA
       MOVIMENTO
       DASH
       COMBATE
       ATAQUES BÁSICOS
       Q / R / F
       PROJÉTEIS
       COLETA
       DESCANSO
       MORTE / RESPAWN
       SANGUE
       IA DOS INIMIGOS
       HABILIDADES DOS INIMIGOS
       BOSSES — MECÂNICAS BASE

       CONTINUA DIRETAMENTE DA PARTE 2.
       ========================================================= */


    /* =========================================================
       CONSTANTES DE GAMEPLAY
       ========================================================= */

    const PLAYER_COMBAT_CONFIG = Object.freeze({

        universalDash: {

            energyCost:
                18,

            speed:
                620,

            duration:
                0.19,

            cooldown:
                1.45,

            invincibility:
                0.12

        },


        basicAttackEnergy: {

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

        },


        hungerPerAttack:
            0.12,

        fatiguePerAttack:
            0.16,


        damageReductionPerDefense:
            0.34,


        minimumDamage:
            1,


        enemyHitInvincibility:
            0.55,


        poisonTick:
            0.65,


        deathDelay:
            1.5

    });


    const SURVIVAL_CONFIG = Object.freeze({

        hungerDrainPerSecond:
            0.012,

        fatigueDrainPerSecond:
            0.009,

        /*
            Penalidades só começam quando
            os recursos ficam realmente baixos.
        */
        lowHungerThreshold:
            20,

        lowFatigueThreshold:
            20,

        starvationDamageInterval:
            4.5,

        exhaustionDamageInterval:
            5.5,

        starvationDamage:
            3,

        exhaustionDamage:
            2

    });


    const COLLECTION_CONFIG = Object.freeze({

        madeira: {

            magicCost:
                4,

            energyCost:
                2,

            hungerCost:
                0.4,

            fatigueCost:
                0.6,

            xp:
                5

        },


        carvao: {

            magicCost:
                7,

            energyCost:
                3,

            hungerCost:
                0.5,

            fatigueCost:
                0.8,

            xp:
                8

        },


        ferro: {

            magicCost:
                12,

            energyCost:
                5,

            hungerCost:
                0.6,

            fatigueCost:
                1,

            xp:
                12

        },


        ouro: {

            magicCost:
                20,

            energyCost:
                7,

            hungerCost:
                0.8,

            fatigueCost:
                1.2,

            xp:
                18

        },


        diamante: {

            magicCost:
                30,

            energyCost:
                9,

            hungerCost:
                1,

            fatigueCost:
                1.5,

            xp:
                25

        },


        rubi: {

            magicCost:
                38,

            energyCost:
                11,

            hungerCost:
                1.2,

            fatigueCost:
                1.8,

            xp:
                32

        },


        cristal: {

            magicCost:
                25,

            energyCost:
                8,

            hungerCost:
                0.9,

            fatigueCost:
                1.3,

            xp:
                21

        }

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
        x,
        y
    ) {

        if (
            !state.player
        ) {

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
                0.05
            ) {

                state.player.facing =
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
                0.05
            ) {

                state.player.facing =
                    y >
                    0
                        ? "down"
                        : "up";

            }

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


        const x =

            state.pointer
                .worldX -

            state.player.x;


        const y =

            state.pointer
                .worldY -

            state.player.y;


        const direction =
            normalize(
                x,
                y
            );


        if (
            direction.length <=
            0.001
        ) {

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


        return direction;

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


        let gainedPoints =
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


            gainedPoints +=
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


        if (
            leveled
        ) {

            /*
                NÃO sobe nenhum atributo automaticamente.

                Apenas recupera um pouco para
                comemorar o level up.
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
                    `Nível ${player.level}! +${gainedPoints} ponto${gainedPoints === 1 ? "" : "s"} de status.`
                );

            }

        }

    }


    /* =========================================================
       DISTRIBUIR STATUS

       SOMENTE:
       POWER
       ENERGY
       HUNGER
       FATIGUE
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
       ATAQUE / DEFESA EFETIVOS
       ========================================================= */

    function getStrengthMultiplier() {

        const points =
            clamp(

                finiteNumber(
                    state.player
                        ?.stats
                        ?.power,
                    0
                ),

                0,
                STAT_CAP

            );


        return (

            1 +

            points *

            STAT_CONFIG
                .power
                .damagePerPoint

        );

    }


    function getPlayerAttackPower() {

        if (
            !state.player
        ) {

            return 0;

        }


        return devModifyOutgoingDamage(

            Math.max(
                1,
                finiteNumber(
                    state.player.damage,
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


    function getPlayerMoveSpeed() {

        const player =
            state.player;


        if (!player) {

            return 0;

        }


        let speed =
            Math.max(
                20,
                finiteNumber(
                    player.speed,
                    120
                )
            );


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


        if (
            player.hunger <=
            0
        ) {

            speed *=
                0.82;

        }


        if (
            player.fatigue <=
            0
        ) {

            speed *=
                0.78;

        }


        return speed;

    }


    /* =========================================================
       EQUIPAR
       ========================================================= */

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

            /*
                Não permite equipar tier anterior
                depois que a progressão já passou dele.
            */
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
       POÇÕES
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


    function useInventoryItem(
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
            item.heal
        ) {

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


            if (
                !removeItem(
                    id,
                    1
                )
            ) {

                return false;

            }


            player.hp =
                Math.min(
                    player.maxHp,
                    player.hp +
                    item.heal
                );


            spawnRadialParticles(
                player.x,
                player.y,
                "#ef6474",
                14,
                90
            );


            return true;

        }


        if (
            item.energy
        ) {

            if (
                player.energy >=
                player.maxEnergy
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


            player.energy =
                Math.min(
                    player.maxEnergy,
                    player.energy +
                    item.energy
                );


            spawnRadialParticles(
                player.x,
                player.y,
                "#68a9e6",
                14,
                90
            );


            return true;

        }


        if (
            item.hunger
        ) {

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
                    item.hunger
                );


            if (
                item.fatigue
            ) {

                player.fatigue =
                    Math.min(
                        player.maxFatigue,
                        player.fatigue +
                        item.fatigue
                    );

            }


            return true;

        }


        if (
            item.buff
        ) {

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
                        "Você já possui dois efeitos ativos ou este efeito já está ativo."
                    );

                }


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


            state.player
                .activePotionBuffs
                .push({

                    type:
                        item.buff,

                    timer:
                        item.duration ||
                        15,

                    duration:
                        item.duration ||
                        15,

                    multiplier:
                        item.multiplier ||
                        1,

                    defenseBonus:
                        item.defenseBonus ||
                        0,

                    speedMultiplier:
                        item.speedMultiplier ||
                        1

                });


            recalculatePlayerStats();


            return true;

        }


        return equipInventoryItem(
            id
        );

    }


    function updatePotionBuffs(
        dt
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        let changed =
            false;


        player.activePotionBuffs =
            player.activePotionBuffs
                .filter(
                    buff => {

                        buff.timer -=
                            dt;


                        if (
                            buff.timer <=
                            0
                        ) {

                            changed =
                                true;

                            return false;

                        }


                        return true;

                    }
                );


        if (
            changed
        ) {

            recalculatePlayerStats();

        }

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


        return true;

    }


    function spendPlayerResource(
        type,
        amount
    ) {

        const player =
            state.player;


        if (!player) {

            return false;

        }


        const safeAmount =
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        if (
            !canSpendPlayerResource(
                type,
                safeAmount
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

                player.magic =
                    Math.max(
                        0,
                        player.magic -
                        safeAmount
                    );

            }

        }


        else if (
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

                player.energy =
                    Math.max(
                        0,
                        player.energy -
                        safeAmount
                    );

            }

        }


        return true;

    }


    /* =========================================================
       MOVIMENTO
       ========================================================= */

    function getMovementInput() {

        const keys =
            state.keys;


        let x =
            0;


        let y =
            0;


        if (
            keys.has(
                "KeyA"
            ) ||
            keys.has(
                "ArrowLeft"
            )
        ) {

            x--;

        }


        if (
            keys.has(
                "KeyD"
            ) ||
            keys.has(
                "ArrowRight"
            )
        ) {

            x++;

        }


        if (
            keys.has(
                "KeyW"
            ) ||
            keys.has(
                "ArrowUp"
            )
        ) {

            y--;

        }


        if (
            keys.has(
                "KeyS"
            ) ||
            keys.has(
                "ArrowDown"
            )
        ) {

            y++;

        }


        return normalize(
            x,
            y
        );

    }


    function canPlayerMoveTo(
        x,
        y
    ) {

        const player =
            state.player;


        if (!player) {

            return false;

        }


        if (
            state.houseMode
        ) {

            return !isInteriorPositionBlocked(
                x,
                y,
                player.radius
            );

        }


        return !isCircleBlockedByWorld(

            x,
            y,

            player.radius

        );

    }


    function tryMovePlayer(
        dx,
        dy
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        /*
            Eixo separado reduz agarramento em paredes.
        */
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

        else {

            const barrier =
                !state.houseMode
                    ? getBlockingDarknessBarrier(
                        nextX,
                        player.y,
                        player.radius
                    )
                    : null;


            warnDarknessBarrier(
                barrier
            );

        }


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

        else {

            const barrier =
                !state.houseMode
                    ? getBlockingDarknessBarrier(
                        player.x,
                        nextY,
                        player.radius
                    )
                    : null;


            warnDarknessBarrier(
                barrier
            );

        }

    }


    function warnDarknessBarrier(
        barrier
    ) {

        if (!barrier) {

            return;

        }


        const now =
            performance.now();


        if (
            now -
            barrier.warnedAt <
            1300
        ) {

            return;

        }


        barrier.warnedAt =
            now;


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                barrier.message
            );

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
            state.paused
        ) {

            return;

        }


        if (
            player.resting
                ?.active
        ) {

            player.moveX =
                0;

            player.moveY =
                0;

            return;

        }


        /*
            Dash controla movimento sozinho.
        */
        if (
            player.playerDash
                ?.active ||
            player.zephyrDash
                ?.active
        ) {

            return;

        }


        const input =
            getMovementInput();


        player.moveX =
            input.x;

        player.moveY =
            input.y;


        if (
            input.length <=
            0
        ) {

            return;

        }


        updatePlayerFacing(
            input.x,
            input.y
        );


        const speed =
            getPlayerMoveSpeed();


        tryMovePlayer(

            input.x *
            speed *
            dt,

            input.y *
            speed *
            dt

        );


        player.walkTime +=

            dt *

            GAME_CONFIG
                .walkAnimationSpeed;

    }


    /* =========================================================
       DASH UNIVERSAL
       ========================================================= */

    function attemptUniversalDash() {

        const player =
            state.player;


        if (
            !player ||
            !player.abilities
                ?.dash ||
            player.dead ||
            state.paused
        ) {

            return false;

        }


        player.universalDashCooldown =
            Math.max(
                0,
                finiteNumber(
                    player.universalDashCooldown,
                    0
                )
            );


        if (
            player.universalDashCooldown >
            0
        ) {

            return false;

        }


        const config =
            PLAYER_COMBAT_CONFIG
                .universalDash;


        if (
            !spendPlayerResource(
                "energy",
                config.energyCost
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


        const movement =
            getMovementInput();


        const facing =
            facingVector();


        const direction =

            movement.length >
            0

                ? movement

                : facing;


        player.playerDash = {

            active:
                true,

            x:
                direction.x,

            y:
                direction.y,

            timer:
                config.duration,

            duration:
                config.duration,

            speed:
                config.speed

        };


        player.universalDashCooldown =
            config.cooldown;


        player.invincible =

            Math.max(

                player.invincible,

                config.invincibility

            );


        spawnRadialParticles(
            player.x,
            player.y,
            "#a68dc5",
            10,
            80
        );


        return true;

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


        const dash =
            player.playerDash;


        if (
            !dash
                ?.active
        ) {

            return;

        }


        const distanceThisFrame =
            dash.speed *
            dt;


        const steps =
            Math.max(
                1,
                Math.ceil(
                    distanceThisFrame /
                    8
                )
            );


        const stepDistance =
            distanceThisFrame /
            steps;


        for (
            let index = 0;
            index < steps;
            index++
        ) {

            const beforeX =
                player.x;


            const beforeY =
                player.y;


            tryMovePlayer(

                dash.x *
                stepDistance,

                dash.y *
                stepDistance

            );


            if (
                Math.abs(
                    player.x -
                    beforeX
                ) <
                    0.01 &&
                Math.abs(
                    player.y -
                    beforeY
                ) <
                    0.01
            ) {

                dash.timer =
                    0;

                break;

            }

        }


        dash.timer -=
            dt;


        spawnAfterimage(
            player.x,
            player.y,
            currentCharacter()
                .color,
            0.18
        );


        if (
            dash.timer <=
            0
        ) {

            dash.active =
                false;

            player.playerDash =
                null;

        }

    }


    /* =========================================================
       ZEHPYR DASH PRÓPRIO
       ========================================================= */

    function startZephyrCombatDash(
        direction
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.zephyrDash = {

            active:
                true,

            x:
                direction.x,

            y:
                direction.y,

            timer:
                0.22,

            speed:
                690,

            hitEnemies:
                new Set()

        };


        player.invincible =
            Math.max(
                player.invincible,
                0.14
            );

    }


    function updateZephyrCombatDash(
        dt
    ) {

        const player =
            state.player;


        const dash =
            player
                ?.zephyrDash;


        if (
            !player ||
            !dash
                ?.active
        ) {

            return;

        }


        const movement =
            dash.speed *
            dt;


        const steps =
            Math.max(
                1,
                Math.ceil(
                    movement /
                    8
                )
            );


        const step =
            movement /
            steps;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const oldX =
                player.x;


            const oldY =
                player.y;


            tryMovePlayer(
                dash.x *
                step,
                dash.y *
                step
            );


            for (
                const enemy of
                state.world
                    .enemies
            ) {

                if (
                    enemy.dead ||
                    dash.hitEnemies
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
                        player.radius +
                        16,

                        enemy.x,
                        enemy.y,
                        enemy.radius

                    )
                ) {

                    dash.hitEnemies
                        .add(
                            enemy.id
                        );


                    damageEnemy(

                        enemy,

                        getPlayerAttackPower() *
                        1.25,

                        {
                            source:
                                "zephyrDash"
                        }

                    );

                }

            }


            if (
                oldX ===
                    player.x &&
                oldY ===
                    player.y
            ) {

                dash.timer =
                    0;

                break;

            }

        }


        spawnAfterimage(
            player.x,
            player.y,
            "#a978df",
            0.22
        );


        dash.timer -=
            dt;


        if (
            dash.timer <=
            0
        ) {

            player.zephyrDash =
                null;

        }

    }


    /* =========================================================
       COMBATE — ALVOS
       ========================================================= */

    function getLivingEnemies() {

        if (
            !state.world
        ) {

            return [];

        }


        return state.world
            .enemies
            .filter(
                enemy =>
                    !enemy.dead
            );

    }


    function findEnemyAtAttackArea(
        x,
        y,
        radius,
        options = {}
    ) {

        const enemies =
            [];


        for (
            const enemy of
            getLivingEnemies()
        ) {

            if (
                options.exclude &&
                options.exclude
                    .has(
                        enemy.id
                    )
            ) {

                continue;

            }


            if (
                circleCircleCollision(

                    x,
                    y,
                    radius,

                    enemy.x,
                    enemy.y,
                    enemy.radius

                )
            ) {

                enemies.push(
                    enemy
                );

            }

        }


        return enemies;

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
        originX,
        originY,
        directionX,
        directionY,
        range,
        arc
    ) {

        const result =
            [];


        const direction =
            normalize(
                directionX,
                directionY
            );


        for (
            const enemy of
            getLivingEnemies()
        ) {

            const dx =
                enemy.x -
                originX;


            const dy =
                enemy.y -
                originY;


            const enemyDirection =
                normalize(
                    dx,
                    dy
                );


            if (
                enemyDirection.length >
                range +
                enemy.radius
            ) {

                continue;

            }


            const dot =

                direction.x *
                enemyDirection.x +

                direction.y *
                enemyDirection.y;


            const angle =
                Math.acos(
                    clamp(
                        dot,
                        -1,
                        1
                    )
                );


            if (
                angle <=
                arc /
                2
            ) {

                result.push(
                    enemy
                );

            }

        }


        return result;

    }


    /* =========================================================
       CONFIRMAR BOSS ANTES DE ATACAR
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
       ATAQUE BÁSICO
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
                        attack.secondaryColor,

                    effect:
                        attack.particle,

                    owner:
                        "player"

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


        const targets =
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                attack.range +
                attack.hitRadius,

                attack.arc

            );


        state.world
            .attackEffects
            .push({

                id:
                    uid(
                        "slash"
                    ),

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

                secondaryColor:
                    attack.secondaryColor,

                timer:
                    0.22,

                duration:
                    0.22

            });


        for (
            const enemy of
            targets
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


        const enemies =
            getEnemiesInRadius(

                impactX,
                impactY,

                attack.hitRadius

            );


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
            enemies
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


        const targets =
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
            let i = 0;
            i < 2;
            i++
        ) {

            state.world
                .attackEffects
                .push({

                    id:
                        uid(
                            "rift_slash"
                        ),

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
                        i ===
                            0
                                ? -9
                                : 9,

                    color:
                        attack.color,

                    secondaryColor:
                        attack.secondaryColor,

                    timer:
                        0.24 +
                        i *
                        0.04,

                    duration:
                        0.28

                });

        }


        for (
            const enemy of
            targets
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
                attack.damageMultiplier

            );

        }

    }


    /* =========================================================
       PROJÉTIL DO PLAYER
       ========================================================= */

    function spawnPlayerProjectile(
        config
    ) {

        state.world
            .projectiles
            .push({

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

                effect:
                    config.effect ||
                    "spark",

                owner:
                    "player",

                dead:
                    false,

                hitIds:
                    new Set(),

                life:
                    2

            });

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
            state.world
                .projectiles
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
                let i = 0;
                i < steps;
                i++
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
                            ignoreGates:
                                false,

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
                        7,
                        70
                    );


                    break;

                }


                const enemies =
                    findEnemyAtAttackArea(

                        projectile.x,
                        projectile.y,

                        projectile.hitRadius,

                        {
                            exclude:
                                projectile.hitIds
                        }

                    );


                if (
                    enemies.length >
                    0
                ) {

                    const enemy =
                        enemies[0];


                    if (
                        !ensureBossAcceptedBeforeDamage(
                            enemy
                        )
                    ) {

                        projectile.dead =
                            true;

                        break;

                    }


                    projectile.hitIds
                        .add(
                            enemy.id
                        );


                    damageEnemy(

                        enemy,

                        projectile.damage

                    );


                    spawnRadialParticles(

                        projectile.x,
                        projectile.y,

                        projectile.secondaryColor,

                        9,

                        90

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
            state.world
                .projectiles
                .filter(
                    projectile =>
                        !projectile.dead
                );

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


        const cooldown =
            finiteNumber(
                player.skillCooldowns[
                    slot
                ],
                0
            );


        if (
            cooldown >
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


    function skillMemoryRay(
        direction
    ) {

        const player =
            state.player;


        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            const angle =
                Math.atan2(
                    direction.y,
                    direction.x
                ) +
                i *
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
                    "#ffd7a7",

                effect:
                    "memoryRay"

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


        const enemies =
            getEnemiesInRadius(
                player.x,
                player.y,
                radius
            );


        for (
            const enemy of
            enemies
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
                    enemy.slow,
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


        const x =
            player.x +
            direction.x *
            150;


        const y =
            player.y +
            direction.y *
            150;


        spawnDelayedAreaAttack({

            x,
            y,

            radius:
                105,

            delay:
                0.55,

            damage:
                getPlayerAttackPower() *
                1.65,

            color:
                "#f3a55b",

            effectType:
                "memoryExplosion",

            source:
                "player"

        });


        return true;

    }


    function skillGuardianStrike(
        direction
    ) {

        const player =
            state.player;


        const enemies =
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                118,

                Math.PI *
                0.95

            );


        state.world
            .attackEffects
            .push({

                id:
                    uid(
                        "guardian_strike"
                    ),

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

                secondaryColor:
                    "#aebbc1",

                timer:
                    0.3,

                duration:
                    0.3

            });


        for (
            const enemy of
            enemies
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

        const player =
            state.player;


        player.guardianRush = {

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

            hitIds:
                new Set()

        };


        return true;

    }


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


        const enemies =
            getEnemiesInRadius(
                impactX,
                impactY,
                80
            );


        for (
            const enemy of
            enemies
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
                    enemy.stun,
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

                effectType:
                    "earthRing",

                source:
                    "player"

            });

        }


        return true;

    }


    function skillVitalLight() {

        const player =
            state.player;


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


        state.world
            .effects
            .push({

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
            let i = -2;
            i <= 2;
            i++
        ) {

            const angle =

                Math.atan2(
                    direction.y,
                    direction.x
                ) +

                i *
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
                    360,

                damage:
                    getPlayerAttackPower() *
                    0.47,

                color:
                    "#f2a9df",

                secondaryColor:
                    "#ffe2f5",

                effect:
                    "fairyBurst"

            });

        }


        return true;

    }


    function skillStarRain() {

        const player =
            state.player;


        const targetX =
            state.pointer
                .worldX;


        const targetY =
            state.pointer
                .worldY;


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const angle =
                i /
                6 *
                Math.PI *
                2;


            const radius =
                i ===
                0
                    ? 0
                    : 55;


            spawnDelayedAreaAttack({

                x:
                    targetX +
                    Math.cos(
                        angle
                    ) *
                    radius,

                y:
                    targetY +
                    Math.sin(
                        angle
                    ) *
                    radius,

                radius:
                    42,

                delay:
                    0.22 +
                    i *
                    0.08,

                damage:
                    getPlayerAttackPower() *
                    0.5,

                color:
                    "#f4b9e4",

                effectType:
                    "starStrike",

                source:
                    "player"

            });

        }


        return true;

    }


    function skillAdaptiveCut(
        direction
    ) {

        const player =
            state.player;


        const targets =
            getEnemiesInArc(

                player.x,
                player.y,

                direction.x,
                direction.y,

                128,

                Math.PI *
                0.86

            );


        for (
            const enemy of
            targets
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
                1.22

            );

        }


        state.world
            .attackEffects
            .push({

                id:
                    uid(
                        "adaptive_cut"
                    ),

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
                    128,

                arc:
                    Math.PI *
                    0.86,

                color:
                    "#a978df",

                secondaryColor:
                    "#d8bbf4",

                timer:
                    0.27,

                duration:
                    0.27

            });


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


        player.adaptiveBuff = {

            timer:
                6.5,

            damageMultiplier:
                1.18,

            speedMultiplier:
                1.12

        };


        spawnRadialParticles(
            player.x,
            player.y,
            "#a979df",
            20,
            120
        );


        return true;

    }


    function skillRiftStep(
        direction
    ) {

        startZephyrCombatDash(
            direction
        );


        return true;

    }


    /* =========================================================
       DASH DO THERON
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
            !player ||
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


        const step =
            movement /
            steps;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const oldX =
                player.x;

            const oldY =
                player.y;


            tryMovePlayer(
                rush.x *
                step,
                rush.y *
                step
            );


            for (
                const enemy of
                getLivingEnemies()
            ) {

                if (
                    rush.hitIds
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
                        player.radius +
                        18,

                        enemy.x,
                        enemy.y,
                        enemy.radius

                    )
                ) {

                    if (
                        !ensureBossAcceptedBeforeDamage(
                            enemy
                        )
                    ) {

                        continue;

                    }


                    rush.hitIds
                        .add(
                            enemy.id
                        );


                    damageEnemy(

                        enemy,

                        getPlayerAttackPower() *
                        1.35

                    );


                    const direction =
                        normalize(
                            rush.x,
                            rush.y
                        );


                    pushEnemy(
                        enemy,
                        direction.x *
                        28,
                        direction.y *
                        28
                    );

                }

            }


            if (
                oldX ===
                    player.x &&
                oldY ===
                    player.y
            ) {

                rush.timer =
                    0;

                break;

            }

        }


        rush.timer -=
            dt;


        if (
            rush.timer <=
            0
        ) {

            player.guardianRush =
                null;

        }

    }


    /* =========================================================
       BUFFS DE CLASSE
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

            }

        }


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


        player.attackCooldown =
            Math.max(

                0,

                finiteNumber(
                    player.attackCooldown,
                    0
                ) -
                dt

            );

    }


    /* =========================================================
       DANO NO INIMIGO
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

            return false;

        }


        if (
            !ensureBossAcceptedBeforeDamage(
                enemy
            )
        ) {

            return false;

        }


        let damage =
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        if (
            state.player
                ?.adaptiveBuff
        ) {

            damage *=
                state.player
                    .adaptiveBuff
                    .damageMultiplier;

        }


        damage =
            devModifyOutgoingDamage(
                damage
            );


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        enemy.state =
            "chasing";


        enemy.hp =
            Math.max(

                0,

                enemy.hp -
                damage

            );


        enemy.hitFlash =
            0.16;


        enemy.lastHitAt =
            performance.now();


        /*
            10 golpes no Monarca = stagger.
        */
        if (
            enemy.id ===
            "monarch"
        ) {

            state.player.monarchHits =
                finiteNumber(
                    state.player
                        .monarchHits,
                    0
                ) +
                1;


            if (
                state.player
                    .monarchHits >=
                10
            ) {

                state.player.monarchHits =
                    0;


                enemy.stun =
                    Math.max(
                        enemy.stun,
                        5
                    );


                spawnFloatingText(
                    enemy.x,
                    enemy.y -
                    80,
                    "ATORDOADO",
                    "#d6bcf0",
                    1.1
                );


                spawnGroundRing(
                    enemy.x,
                    enemy.y,
                    110,
                    "#a685c2",
                    0.8
                );

            }

        }


        spawnRadialParticles(

            enemy.x,
            enemy.y,

            options.color ||
            "#f0e2d0",

            7,

            80

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


    function pushEnemy(
        enemy,
        dx,
        dy
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return;

        }


        const resistance =

            enemy.type ===
            "progression"

                ? 0.25

                : 1;


        const targetX =
            enemy.x +
            dx *
            resistance;


        const targetY =
            enemy.y +
            dy *
            resistance;


        if (
            !isCircleBlockedByWorld(

                targetX,
                targetY,
                enemy.radius,

                {
                    ignoreDarknessBarrier:
                        true
                }

            )
        ) {

            enemy.x =
                targetX;

            enemy.y =
                targetY;

        }

    }


    /* =========================================================
       DERROTA DE INIMIGO
       ========================================================= */

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


    function markBossDefeated(
        id
    ) {

        const player =
            state.player;


        if (
            !player ||
            !id
        ) {

            return;

        }


        if (
            !player.defeatedBosses
                .includes(
                    id
                )
        ) {

            player.defeatedBosses
                .push(
                    id
                );

        }

    }


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


        enemy.state =
            "dead";


        enemy.hp =
            0;


        spawnEnemyDeathEffect(
            enemy
        );


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
            ITEMS[
                enemy.drop
            ]
        ) {

            addItem(

                enemy.drop,

                enemy.dropAmount ||
                1,

                {
                    silent:
                        true
                }

            );


            spawnWorldDropVisual(

                enemy.x,
                enemy.y,

                enemy.drop,

                enemy.dropAmount ||
                1

            );

        }


        if (
            enemy.secondaryDrop &&
            Math.random() <
            enemy.secondaryDropChance
        ) {

            addItem(

                enemy.secondaryDrop,

                1,

                {
                    silent:
                        true
                }

            );


            spawnWorldDropVisual(

                enemy.x +
                18,
                enemy.y,

                enemy.secondaryDrop,

                1

            );

        }


        if (
            enemy.type ===
            "progression"
        ) {

            markBossDefeated(
                enemy.id
            );


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
                enemy.id ===
                "monarch"
            ) {

                state.player.monarchDefeated =
                    true;

            }


            if (
                enemy.id ===
                "path_guardian"
            ) {

                grantMemoryFlute();

            }


            if (
                enemy.id ===
                "other_self"
            ) {

                state.player.finalDefeated =
                    true;

            }


            if (
                typeof onProgressionBossDefeated ===
                "function"
            ) {

                onProgressionBossDefeated(
                    enemy
                );

            }

        }


        else if (
            enemy.type ===
            "hell" &&
            enemy.hellType !==
            null
        ) {

            state.player
                .hellTypesDefeated[
                    enemy.hellType
                ] =
                true;

        }


        if (
            typeof updateHUD ===
            "function"
        ) {

            updateHUD();

        }

    }


    function grantMemoryFlute() {

        const player =
            state.player;


        if (
            !player ||
            player.fluteRewardGranted
        ) {

            return;

        }


        player.fluteRewardGranted =
            true;


        addItem(
            "flautaMemoria",
            1
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Você recebeu a Flauta da Memória."
            );

        }

    }


    /* =========================================================
       DANO NO PLAYER
       ========================================================= */

    function damagePlayer(
        amount,
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


        if (
            devShouldIgnorePlayerDamage()
        ) {

            player.hp =
                player.maxHp;

            return false;

        }


        if (
            player.invincible >
            0
        ) {

            return false;

        }


        let damage =
            Math.max(
                0,
                finiteNumber(
                    amount,
                    0
                )
            );


        const defense =
            getPlayerDefense();


        damage =

            Math.max(

                PLAYER_COMBAT_CONFIG
                    .minimumDamage,

                damage -

                defense *

                PLAYER_COMBAT_CONFIG
                    .damageReductionPerDefense

            );


        if (
            player.ironGuard
        ) {

            damage *=

                1 -

                player
                    .ironGuard
                    .damageReduction;

        }


        damage =
            Math.max(
                1,
                Math.round(
                    damage
                )
            );


        player.hp =
            Math.max(
                0,
                player.hp -
                damage
            );


        player.invincible =
            PLAYER_COMBAT_CONFIG
                .enemyHitInvincibility;


        player.hurtAnim =
            0.28;


        state.damageFlash =
            Math.min(
                VISUAL_CONFIG
                    .blood
                    .flashMax,

                state.damageFlash +
                0.28
            );


        state.screenShake =
            0.16;


        state.screenShakePower =
            Math.min(
                8,
                3 +
                damage /
                10
            );


        addBloodImpact(
            player.x,
            player.y,
            options.direction
        );


        if (
            player.hp <=
            0
        ) {

            killPlayer(
                options.source ||
                null
            );

        }


        return true;

    }


    /* =========================================================
       SANGUE
       ========================================================= */

    function addBloodImpact(
        x,
        y,
        direction = null
    ) {

        const amount =
            randomInt(
                VISUAL_CONFIG
                    .blood
                    .markMin,
                VISUAL_CONFIG
                    .blood
                    .markMax
            );


        const baseAngle =

            direction

                ? Math.atan2(
                    direction.y,
                    direction.x
                )

                : random(
                    0,
                    Math.PI *
                    2
                );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const angle =

                baseAngle +

                random(
                    -0.85,
                    0.85
                );


            const distanceAmount =
                random(
                    10,
                    43
                );


            state.bloodMarks
                .push({

                    x:
                        x +
                        Math.cos(
                            angle
                        ) *
                        distanceAmount,

                    y:
                        y +
                        Math.sin(
                            angle
                        ) *
                        distanceAmount,

                    radius:
                        random(
                            2.5,
                            7
                        ),

                    stretch:
                        random(
                            1,
                            2.8
                        ),

                    angle:
                        angle,

                    life:
                        random(
                            VISUAL_CONFIG
                                .blood
                                .markLifeMin,
                            VISUAL_CONFIG
                                .blood
                                .markLifeMax
                        ),

                    maxLife:
                        VISUAL_CONFIG
                            .blood
                            .markLifeMax

                });

        }


        if (
            state.bloodMarks.length >
            MAX_BLOOD_MARKS
        ) {

            state.bloodMarks.splice(

                0,

                state.bloodMarks.length -
                MAX_BLOOD_MARKS

            );

        }

    }


    function updateBloodEffects(
        dt
    ) {

        state.damageFlash =
            Math.max(
                0,
                state.damageFlash -
                dt *
                1.7
            );


        state.bloodMarks =
            state.bloodMarks
                .filter(
                    mark => {

                        mark.life -=
                            dt;


                        return (
                            mark.life >
                            0
                        );

                    }
                );

    }


    /* =========================================================
       MORTE
       ========================================================= */

    function loseMaterialsOnDeath() {

        const player =
            state.player;


        if (!player) {

            return [];

        }


        const lost =
            [];


        const materialIds =
            Object.keys(
                ITEMS
            )
                .filter(
                    id =>
                        ITEMS[id]
                            .category ===
                            "materials" &&
                        getRealItemCount(
                            id
                        ) >
                            0
                );


        for (
            const id of
            materialIds
        ) {

            const current =
                getRealItemCount(
                    id
                );


            /*
                Nem todo material obrigatoriamente cai.
            */
            if (
                Math.random() >
                0.72
            ) {

                continue;

            }


            const amount =

                Math.min(

                    GAME_CONFIG
                        .deathMaterialLossMaxPerType,

                    Math.max(

                        1,

                        Math.floor(

                            current *

                            GAME_CONFIG
                                .deathMaterialLossRatio

                        )

                    )

                );


            if (
                amount <=
                0
            ) {

                continue;

            }


            player.inventory[id] =
                Math.max(
                    0,
                    current -
                    amount
                );


            lost.push({

                id,

                amount

            });

        }


        return lost;

    }


    function killPlayer(
        source
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
            state.dev
                ?.unlocked &&
            state.dev
                .infiniteLife
        ) {

            player.hp =
                player.maxHp;

            return;

        }


        player.dead =
            true;


        player.hp =
            0;


        player.moveX =
            0;


        player.moveY =
            0;


        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.guardianRush =
            null;


        state.holdAction =
            null;


        const lost =
            loseMaterialsOnDeath();


        state.deathState = {

            timer:
                PLAYER_COMBAT_CONFIG
                    .deathDelay,

            source,

            lost

        };


        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "player_death"
                    ),

                type:
                    "playerDeath",

                x:
                    player.x,

                y:
                    player.y,

                timer:
                    1.4,

                duration:
                    1.4

            });

    }


    function updatePlayerDeath(
        dt
    ) {

        if (
            !state.player
                ?.dead ||
            !state.deathState
        ) {

            return;

        }


        state.deathState.timer -=
            dt;


        if (
            state.deathState.timer >
            0
        ) {

            return;

        }


        respawnPlayerAtHome();

    }


    function respawnPlayerAtHome() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        /*
            Sempre volta para a Vila.
        */
        state.area =
            "village";


        state.houseMode =
            false;


        state.currentHouse =
            null;


        state.houseReturn =
            null;


        buildWorld();


        const respawn =
            calculateHomeRespawn();


        player.x =
            respawn.x;


        player.y =
            respawn.y;


        player.facing =
            respawn.facing ||
            "up";


        player.dead =
            false;


        player.hp =
            player.maxHp;


        player.magic =
            Math.max(
                player.maxMagic *
                0.65,
                1
            );


        player.energy =
            Math.max(
                player.maxEnergy *
                0.7,
                1
            );


        player.invincible =
            1.5;


        player.poisonEffect =
            null;


        player.movementSlowTimer =
            0;


        state.deathState =
            null;


        repairPlayerPosition(
            player.x,
            player.y
        );


        if (
            typeof transitionToArea ===
            "function"
        ) {

            transitionToArea(
                "Você desperta diante de sua casa."
            );

        }


        else if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Você despertou diante de sua casa."
            );

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
            !state.player.dead

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
            player.resting
                ?.active
        ) {

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

                    SURVIVAL_CONFIG
                        .hungerDrainPerSecond *
                    dt

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

                    SURVIVAL_CONFIG
                        .fatigueDrainPerSecond *
                    dt

                );

        }


        player.starvationTimer =
            finiteNumber(
                player.starvationTimer,
                0
            );


        player.exhaustionTimer =
            finiteNumber(
                player.exhaustionTimer,
                0
            );


        if (
            player.hunger <=
            0
        ) {

            player.starvationTimer +=
                dt;


            if (
                player.starvationTimer >=
                SURVIVAL_CONFIG
                    .starvationDamageInterval
            ) {

                player.starvationTimer =
                    0;


                damagePlayer(

                    SURVIVAL_CONFIG
                        .starvationDamage,

                    {
                        source:
                            "hunger"
                    }

                );

            }

        }

        else {

            player.starvationTimer =
                0;

        }


        if (
            player.fatigue <=
            0
        ) {

            player.exhaustionTimer +=
                dt;


            if (
                player.exhaustionTimer >=
                SURVIVAL_CONFIG
                    .exhaustionDamageInterval
            ) {

                player.exhaustionTimer =
                    0;


                damagePlayer(

                    SURVIVAL_CONFIG
                        .exhaustionDamage,

                    {
                        source:
                            "fatigue"
                    }

                );

            }

        }

        else {

            player.exhaustionTimer =
                0;

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
            Árvore.
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

                    target:
                        tree,

                    id:
                        tree.id,

                    duration:
                        GAME_CONFIG
                            .treeHoldSeconds

                };


                bestDistance =
                    d;

            }

        }


        /*
            Minérios.
        */
        for (
            const resource of
            state.world
                .resources
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

                    target:
                        resource,

                    id:
                        resource.id,

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


    function beginHoldCollect() {

        const collectible =
            getNearestCollectible();


        if (!collectible) {

            return false;

        }


        state.holdAction = {

            type:
                collectible.type,

            targetId:
                collectible.id,

            target:
                collectible.target,

            timer:
                0,

            duration:
                collectible.duration,

            completed:
                false

        };


        return true;

    }


    function cancelHoldCollect() {

        state.holdAction =
            null;

    }


    function updateHoldCollection(
        dt
    ) {

        const hold =
            state.holdAction;


        if (
            !hold ||
            hold.completed
        ) {

            return;

        }


        if (
            !state.keys.has(
                "KeyE"
            )
        ) {

            cancelHoldCollect();

            return;

        }


        const player =
            state.player;


        const target =
            hold.target;


        if (
            !player ||
            !target
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
            10
        ) {

            cancelHoldCollect();

            return;

        }


        if (
            hold.type ===
                "tree" &&
            !target.alive
        ) {

            cancelHoldCollect();

            return;

        }


        if (
            hold.type ===
                "resource" &&
            !target.alive
        ) {

            cancelHoldCollect();

            return;

        }


        hold.timer +=
            dt;


        if (
            hold.timer <
            hold.duration
        ) {

            return;

        }


        hold.completed =
            true;


        if (
            hold.type ===
            "tree"
        ) {

            collectTree(
                target
            );

        }

        else {

            collectResource(
                target
            );

        }


        state.holdAction =
            null;

    }


    function collectTree(
        tree
    ) {

        if (
            !tree ||
            !tree.alive
        ) {

            return false;

        }


        const config =
            COLLECTION_CONFIG
                .madeira;


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
                    "Magia insuficiente para cortar a madeira."
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
                    "Energia insuficiente."
                );

            }


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


        drainCollectionSurvival(
            config
        );


        const amount =
            randomInt(
                2,
                5
            );


        addItem(
            "madeira",
            amount,
            {
                silent:
                    true
            }
        );


        gainXP(
            config.xp
        );


        tree.alive =
            false;


        tree.harvested =
            true;


        tree.respawn =
            18 +
            random(
                0,
                8
            );


        spawnRadialParticles(
            tree.x,
            tree.y,
            "#8b6744",
            16,
            100
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `Madeira coletada: x${amount}`
            );

        }


        return true;

    }


    function collectResource(
        resource
    ) {

        if (
            !resource ||
            !resource.alive
        ) {

            return false;

        }


        const config =
            COLLECTION_CONFIG[
                resource.type
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
                    "Magia insuficiente."
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
                    "Energia insuficiente."
                );

            }


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


        drainCollectionSurvival(
            config
        );


        const amount =
            Math.max(
                1,
                resource.amount ||
                1
            );


        addItem(
            resource.type,
            amount,
            {
                silent:
                    true
            }
        );


        gainXP(
            config.xp
        );


        resource.alive =
            false;


        resource.respawn =
            resource.respawnDuration;


        spawnRadialParticles(
            resource.x,
            resource.y,
            getResourceColor(
                resource.type
            ),
            15,
            100
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `${ITEMS[resource.type].name} coletado: x${amount}`
            );

        }


        return true;

    }


    function drainCollectionSurvival(
        config
    ) {

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

    }


    function getResourceColor(
        type
    ) {

        switch (
            type
        ) {

            case "madeira":
                return "#8d6948";

            case "carvao":
                return "#4b4b4b";

            case "ferro":
                return "#9a9b9b";

            case "ouro":
                return "#dbb54d";

            case "diamante":
                return "#8fd9e8";

            case "rubi":
                return "#d34d64";

            case "cristal":
                return "#8ab9df";

            default:
                return "#ffffff";

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


            tree.respawn -=
                dt;


            if (
                tree.respawn <=
                0
            ) {

                tree.alive =
                    true;

                tree.harvested =
                    false;

            }

        }


        for (
            const resource of
            state.world
                .resources
        ) {

            if (
                resource.alive
            ) {

                continue;

            }


            resource.respawn -=
                dt;


            if (
                resource.respawn <=
                0
            ) {

                resource.alive =
                    true;


                const config =
                    RESOURCE_CONFIG[
                        resource.type
                    ];


                if (config) {

                    resource.amount =
                        randomInt(
                            config.amountMin,
                            config.amountMax
                        );

                }

            }

        }

    }


    /* =========================================================
       STATUS TEMPORÁRIOS DO PLAYER
       ========================================================= */

    function applyPlayerSlow(
        duration,
        multiplier = 0.58
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.movementSlowTimer =
            Math.max(
                finiteNumber(
                    player.movementSlowTimer,
                    0
                ),
                duration
            );


        player.movementSlowMultiplier =
            Math.min(
                finiteNumber(
                    player.movementSlowMultiplier,
                    1
                ),
                multiplier
            );

    }


    function applyPlayerPoison(
        duration,
        damagePerTick = 3
    ) {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.poisonEffect = {

            timer:
                duration,

            tickTimer:
                PLAYER_COMBAT_CONFIG
                    .poisonTick,

            damage:
                damagePerTick

        };

    }


    function updatePlayerStatusEffects(
        dt
    ) {

        const player =
            state.player;


        if (!player) {

            return;

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
                    PLAYER_COMBAT_CONFIG
                        .poisonTick;


                damagePlayer(

                    player.poisonEffect
                        .damage,

                    {
                        source:
                            "poison"
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
       IA INIMIGA
       ========================================================= */

    function updateEnemies(
        dt
    ) {

        if (
            !state.player ||
            !state.world ||
            state.houseMode
        ) {

            return;

        }


        const player =
            state.player;


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
                    enemy.hitFlash -
                    dt
                );


            enemy.attackCooldown =
                Math.max(
                    0,
                    enemy.attackCooldown -
                    dt
                );


            enemy.abilityCooldown =
                Math.max(
                    0,
                    enemy.abilityCooldown -
                    dt
                );


            enemy.stun =
                Math.max(
                    0,
                    enemy.stun -
                    dt
                );


            enemy.slow =
                Math.max(
                    0,
                    enemy.slow -
                    dt
                );


            /*
                IMPORTANTE:

                A IA NÃO depende de o player
                estar se movimentando.

                Corrige lobo/javali não atacando
                quando o jogador está parado.
            */
            const playerDistance =
                distance(
                    enemy.x,
                    enemy.y,
                    player.x,
                    player.y
                );


            const homeDistance =
                distance(
                    enemy.x,
                    enemy.y,
                    enemy.spawnX,
                    enemy.spawnY
                );


            if (
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                enemy.state =
                    "waiting";


                if (
                    playerDistance <
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


            /*
                Boss de recurso volta ao spawn
                e recupera vida caso você fuja.
            */
            if (
                enemy.bossType ===
                    "resourceBoss" &&
                homeDistance >
                    enemy.returnRadius
            ) {

                enemy.state =
                    "returning";

                enemy.aggressive =
                    false;


                moveEnemyToward(

                    enemy,

                    enemy.spawnX,
                    enemy.spawnY,

                    dt,
                    1.25

                );


                enemy.hp =
                    Math.min(

                        enemy.maxHp,

                        enemy.hp +
                        enemy.maxHp *
                        0.16 *
                        dt

                    );


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

                updateEnemyIdle(
                    enemy,
                    dt
                );

                continue;

            }


            /*
                Habilidade tem prioridade.
            */
            if (
                enemy.ability &&
                enemy.abilityCooldown <=
                0
            ) {

                if (
                    canEnemyUseAbility(
                        enemy,
                        playerDistance
                    )
                ) {

                    useEnemyAbility(
                        enemy
                    );

                    continue;

                }

            }


            if (
                playerDistance >
                enemy.attackRange
            ) {

                enemy.state =
                    "chasing";


                moveEnemyToward(

                    enemy,

                    player.x,
                    player.y,

                    dt

                );

            }

            else {

                enemy.state =
                    "attacking";


                attemptEnemyBasicAttack(
                    enemy
                );

            }

        }

    }


    function discoverBoss(
        enemy
    ) {

        const player =
            state.player;


        if (
            !player ||
            !enemy
        ) {

            return;

        }


        if (
            !player.discoveredBosses
                .includes(
                    enemy.id
                )
        ) {

            player.discoveredBosses
                .push(
                    enemy.id
                );

        }

    }


    function updateEnemyIdle(
        enemy,
        dt
    ) {

        enemy.idleTimer =
            finiteNumber(
                enemy.idleTimer,
                random(
                    0.5,
                    2
                )
            );


        enemy.idleTimer -=
            dt;


        if (
            enemy.idleTimer >
            0
        ) {

            return;

        }


        enemy.idleTimer =
            random(
                1.2,
                2.8
            );


        const angle =
            random(
                0,
                Math.PI *
                2
            );


        enemy.idleTarget = {

            x:
                enemy.spawnX +
                Math.cos(
                    angle
                ) *
                random(
                    20,
                    65
                ),

            y:
                enemy.spawnY +
                Math.sin(
                    angle
                ) *
                random(
                    20,
                    65
                )

        };


        moveEnemyToward(

            enemy,

            enemy.idleTarget.x,
            enemy.idleTarget.y,

            dt,
            0.4

        );

    }


    function moveEnemyToward(
        enemy,
        targetX,
        targetY,
        dt,
        speedMultiplier = 1
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


        enemy.facingX =
            direction.x;


        enemy.facingY =
            direction.y;


        let speed =
            enemy.speed *
            speedMultiplier;


        if (
            enemy.slow >
            0
        ) {

            speed *=
                0.62;

        }


        const dx =
            direction.x *
            speed *
            dt;


        const dy =
            direction.y *
            speed *
            dt;


        tryMoveEnemy(
            enemy,
            dx,
            dy
        );

    }


    function tryMoveEnemy(
        enemy,
        dx,
        dy
    ) {

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

            )
        ) {

            enemy.x =
                nextX;

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

            )
        ) {

            enemy.y =
                nextY;

        }

    }


    /* =========================================================
       ATAQUE NORMAL DOS INIMIGOS
       ========================================================= */

    function attemptEnemyBasicAttack(
        enemy
    ) {

        if (
            enemy.attackCooldown >
            0 ||
            state.player.dead
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
            enemy.type ===
            "progression"
                ? 0.9
                : 1.15;


        const direction =
            normalize(
                state.player.x -
                enemy.x,
                state.player.y -
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


        spawnEnemyAttackEffect(
            enemy
        );


        return true;

    }


    /* =========================================================
       HABILIDADES DOS INIMIGOS
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
                        90 &&
                    playerDistance <=
                        300
                );


            case "web":
            case "rootShot":
            case "fairyProjectile":
            case "projectileDive":
            case "specterBolt":
                return (
                    playerDistance <=
                    320
                );


            case "poison":
                return (
                    playerDistance <=
                    92
                );


            default:
                return (
                    playerDistance <=
                    Math.max(
                        enemy.vision,
                        320
                    )
                );

        }

    }


    function useEnemyAbility(
        enemy
    ) {

        const ability =
            enemy.ability;


        if (!ability) {

            return;

        }


        switch (
            ability.type
        ) {

            case "charge":
            case "heavyCharge":
            case "burningCharge":

                startEnemyChargeTelegraph(
                    enemy
                );

                break;


            case "dive":

                startEnemyDive(
                    enemy
                );

                break;


            case "web":

                enemyShootWeb(
                    enemy
                );

                break;


            case "rootShot":

                enemyRootShot(
                    enemy
                );

                break;


            case "poison":

                enemyPoisonSting(
                    enemy
                );

                break;


            case "groundSlam":

                enemyGroundSlam(
                    enemy
                );

                break;


            case "oreBurst":

                enemyOreBurst(
                    enemy
                );

                break;


            case "rootsAndCharge":

                forestWardenAbility(
                    enemy
                );

                break;


            case "rootField":

                groveHeartAbility(
                    enemy
                );

                break;


            case "multiShockwave":

                mountainTitanAbility(
                    enemy
                );

                break;


            case "hammerAndShards":

                ironColossusAbility(
                    enemy
                );

                break;


            case "breathChargeCrystal":

                rubyChimeraAbility(
                    enemy
                );

                break;


            case "monarch":

                monarchAbility(
                    enemy
                );

                break;


            case "shadowDash":

                shadowBossAbility(
                    enemy
                );

                break;


            case "fairyProjectile":
                enemyFairyProjectile(
                    enemy
                );
                break;


            case "fairyBoss":

                fairyBossAbility(
                    enemy
                );

                break;


            case "projectileDive":

                seraphAbility(
                    enemy
                );

                break;


            case "skyBoss":

                skyBossAbility(
                    enemy
                );

                break;


            case "ashBurst":

                ashDemonAbility(
                    enemy
                );

                break;


            case "lavaCharge":

                startEnemyChargeTelegraph(
                    enemy,
                    {
                        color:
                            "#e95a35"
                    }
                );

                break;


            case "specterBolt":

                specterBolt(
                    enemy
                );

                break;


            case "gargoyleDive":

                startEnemyDive(
                    enemy,
                    1.35
                );

                break;


            case "voidWeb":

                enemyShootWeb(
                    enemy,
                    {
                        color:
                            "#725383"
                    }
                );

                break;


            case "hellBoss":

                hellBossAbility(
                    enemy
                );

                break;


            case "mirrorBoss":

                mirrorBossAbility(
                    enemy
                );

                break;


            default:

                enemyGroundSlam(
                    enemy
                );

                break;

        }

    }


    /* =========================================================
       INVESTIDA

       Aviso -> espera -> corrida real.
       NÃO TELEPORTA.

       Cooldown do lobo ≈ 2 segundos.
       ========================================================= */

    function startEnemyChargeTelegraph(
        enemy,
        options = {}
    ) {

        const ability =
            enemy.ability;


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
                0.55,

            duration:
                ability.telegraph ||
                0.55,

            directionX:
                direction.x,

            directionY:
                direction.y,

            color:
                options.color ||
                enemy.aura ||
                enemy.color ||

                "#db7d68"

        };


        enemy.state =
            "telegraph";


        state.world
            .effects
            .push({

                id:
                    uid(
                        "charge_line"
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
                    260,

                color:
                    options.color ||
                    enemy.color,

                timer:
                    ability.telegraph ||
                    0.55,

                duration:
                    ability.telegraph ||
                    0.55

            });

    }


    function updateEnemyTelegraph(
        enemy,
        dt
    ) {

        const telegraph =
            enemy.telegraph;


        if (!telegraph) {

            return;

        }


        telegraph.timer -=
            dt;


        if (
            telegraph.timer >
            0
        ) {

            return;

        }


        if (
            telegraph.type ===
            "charge"
        ) {

            beginEnemyCharge(
                enemy,
                telegraph
            );

        }


        enemy.telegraph =
            null;

    }


    function beginEnemyCharge(
        enemy,
        telegraph
    ) {

        const ability =
            enemy.ability;


        enemy.charge = {

            active:
                true,

            x:
                telegraph.directionX,

            y:
                telegraph.directionY,

            timer:
                ability.duration ||
                0.45,

            speed:
                ability.speed ||
                380,

            damageMultiplier:
                ability.damageMultiplier ||
                1.15,

            hitPlayer:
                false

        };


        /*
            Cooldown contado DEPOIS da ativação.
        */
        enemy.abilityCooldown =
            ability.cooldown ||
            2;


        enemy.state =
            "charging";

    }


    function updateEnemyCharge(
        enemy,
        dt
    ) {

        const charge =
            enemy.charge;


        if (
            !charge
                ?.active
        ) {

            return;

        }


        const movement =
            charge.speed *
            dt;


        const steps =
            Math.max(

                1,

                Math.ceil(

                    movement /

                    GAME_CONFIG
                        .enemyChargeStep

                )

            );


        const step =
            movement /
            steps;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const nextX =

                enemy.x +

                charge.x *
                step;


            const nextY =

                enemy.y +

                charge.y *
                step;


            if (
                isCircleBlockedByWorld(

                    nextX,
                    nextY,

                    enemy.radius,

                    {
                        ignoreDarknessBarrier:
                            true
                    }

                )
            ) {

                charge.timer =
                    0;


                spawnRadialParticles(
                    enemy.x,
                    enemy.y,
                    enemy.color,
                    8,
                    80
                );


                break;

            }


            enemy.x =
                nextX;


            enemy.y =
                nextY;


            if (
                !charge.hitPlayer &&
                circleCircleCollision(

                    enemy.x,
                    enemy.y,
                    enemy.radius,

                    state.player.x,
                    state.player.y,
                    state.player.radius

                )
            ) {

                charge.hitPlayer =
                    true;


                const direction =
                    normalize(
                        charge.x,
                        charge.y
                    );


                damagePlayer(

                    enemy.damage *
                    charge.damageMultiplier,

                    {
                        source:
                            enemy.id,

                        direction
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

            enemy.charge =
                null;


            enemy.state =
                "chasing";

        }

    }


    /* =========================================================
       MERGULHO
       ========================================================= */

    function startEnemyDive(
        enemy,
        damageMultiplier = 1.2
    ) {

        const direction =
            normalize(
                state.player.x -
                    enemy.x,
                state.player.y -
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
                enemy.ability
                    ?.telegraph ||
                0.45,

            duration:
                enemy.ability
                    ?.telegraph ||
                0.45,

            directionX:
                direction.x,

            directionY:
                direction.y,

            color:
                "#b18ec5"

        };


        /*
            Temporariamente configura charge.
        */
        enemy.ability = {

            ...enemy.ability,

            speed:
                500,

            duration:
                0.3,

            damageMultiplier

        };

    }


    /* =========================================================
       PROJÉTEIS INIMIGOS
       ========================================================= */

    function spawnEnemyProjectile(
        config
    ) {

        state.world
            .enemyProjectiles
            .push({

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
                    "#bc7d7d",

                type:
                    config.type ||
                    "normal",

                life:
                    config.life ||
                    2,

                slow:
                    config.slow ||
                    null,

                poison:
                    config.poison ||
                    null,

                dead:
                    false

            });

    }


    function shootEnemyProjectileAtPlayer(
        enemy,
        options = {}
    ) {

        const direction =
            normalize(
                state.player.x -
                    enemy.x,
                state.player.y -
                    enemy.y
            );


        const speed =
            options.speed ||
            280;


        spawnEnemyProjectile({

            x:
                enemy.x,

            y:
                enemy.y,

            vx:
                direction.x *
                speed,

            vy:
                direction.y *
                speed,

            radius:
                options.radius ||
                7,

            damage:
                options.damage ||
                enemy.damage *
                0.8,

            color:
                options.color ||
                enemy.color,

            type:
                options.type ||
                "normal",

            slow:
                options.slow ||
                null,

            poison:
                options.poison ||
                null

        });

    }


    function updateEnemyProjectiles(
        dt
    ) {

        if (
            !state.world
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
                let i = 0;
                i < steps;
                i++
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

                        state.player.x,
                        state.player.y,
                        state.player.radius

                    )
                ) {

                    const direction =
                        normalize(
                            projectile.vx,
                            projectile.vy
                        );


                    damagePlayer(

                        projectile.damage,

                        {
                            source:
                                projectile.type,

                            direction
                        }

                    );


                    if (
                        projectile.slow
                    ) {

                        applyPlayerSlow(

                            projectile
                                .slow
                                .duration,

                            projectile
                                .slow
                                .multiplier

                        );

                    }


                    if (
                        projectile.poison
                    ) {

                        applyPlayerPoison(

                            projectile
                                .poison
                                .duration,

                            projectile
                                .poison
                                .damage

                        );

                    }


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
       ARANHA
       ========================================================= */

    function enemyShootWeb(
        enemy,
        options = {}
    ) {

        shootEnemyProjectileAtPlayer(

            enemy,

            {
                speed:
                    245,

                radius:
                    8,

                damage:
                    enemy.damage *
                    0.5,

                color:
                    options.color ||
                    "#d7d2d8",

                type:
                    "web",

                slow: {
                    duration:
                        enemy.ability
                            ?.slowDuration ||
                        1.5,

                    multiplier:
                        0.5
                }
            }

        );


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3;

    }


    /* =========================================================
       ESPINHEIRO
       ========================================================= */

    function enemyRootShot(
        enemy
    ) {

        const targetX =
            state.player.x;


        const targetY =
            state.player.y;


        spawnDelayedEnemyArea({

            x:
                targetX,

            y:
                targetY,

            radius:
                48,

            delay:
                0.55,

            damage:
                enemy.damage *
                0.75,

            color:
                "#718d5d",

            slow: {
                duration:
                    1.4,

                multiplier:
                    0.55
            }

        });


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3.4;

    }


    /* =========================================================
       ESCORPIÃO
       ========================================================= */

    function enemyPoisonSting(
        enemy
    ) {

        const d =
            distance(
                enemy.x,
                enemy.y,
                state.player.x,
                state.player.y
            );


        if (
            d <=
            enemy.attackRange +
            25
        ) {

            damagePlayer(

                enemy.damage *
                0.65,

                {
                    source:
                        enemy.id
                }

            );


            applyPlayerPoison(

                enemy.ability
                    ?.poisonDuration ||
                3,

                Math.max(
                    2,
                    enemy.damage *
                    0.11
                )

            );


            state.world
                .effects
                .push({

                    id:
                        uid(
                            "poison_sting"
                        ),

                    type:
                        "poisonSting",

                    x:
                        state.player.x,

                    y:
                        state.player.y,

                    timer:
                        0.4,

                    duration:
                        0.4

                });

        }


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.7;

    }


    /* =========================================================
       PEDRA
       ========================================================= */

    function enemyGroundSlam(
        enemy
    ) {

        spawnDelayedEnemyArea({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                88,

            delay:
                0.55,

            damage:
                enemy.damage *
                1.2,

            color:
                enemy.color

        });


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3.2;

    }


    /* =========================================================
       MINA
       ========================================================= */

    function enemyOreBurst(
        enemy
    ) {

        const amount =
            7;


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const angle =

                i /
                amount *

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
                    230,

                vy:
                    Math.sin(
                        angle
                    ) *
                    230,

                radius:
                    6,

                damage:
                    enemy.damage *
                    0.58,

                color:
                    "#a4a19a",

                type:
                    "oreShard"

            });

        }


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            3.1;

    }


    /* =========================================================
       BOSS FLORESTA
       ========================================================= */

    function forestWardenAbility(
        enemy
    ) {

        if (
            Math.random() <
            0.5
        ) {

            enemyRootShot(
                enemy
            );

        }

        else {

            startEnemyChargeTelegraph(
                enemy
            );

        }


        enemy.abilityCooldown =
            3.3;

    }


    /* =========================================================
       BOSS BOSQUE
       ========================================================= */

    function groveHeartAbility(
        enemy
    ) {

        const player =
            state.player;


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const angle =

                i /
                5 *

                Math.PI *
                2;


            spawnDelayedEnemyArea({

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
                    42,

                delay:
                    0.4 +
                    i *
                    0.08,

                damage:
                    enemy.damage *
                    0.48,

                color:
                    "#7a9c59",

                slow: {
                    duration:
                        1,

                    multiplier:
                        0.65
                }

            });

        }


        enemy.abilityCooldown =
            3.5;

    }


    /* =========================================================
       TITÃ
       ========================================================= */

    function mountainTitanAbility(
        enemy
    ) {

        for (
            let ring = 1;
            ring <= 3;
            ring++
        ) {

            spawnDelayedEnemyArea({

                x:
                    enemy.x,

                y:
                    enemy.y,

                radius:
                    75 +
                    ring *
                    55,

                innerRadius:
                    55 +
                    (
                        ring -
                        1
                    ) *
                    55,

                delay:
                    ring *
                    0.22,

                damage:
                    enemy.damage *
                    0.62,

                color:
                    "#b8bebc"

            });

        }


        enemy.abilityCooldown =
            3.8;

    }


    /* =========================================================
       COLOSSO FERRO
       ========================================================= */

    function ironColossusAbility(
        enemy
    ) {

        enemyGroundSlam(
            enemy
        );


        window.setTimeout(
            () => {

                if (
                    !enemy.dead &&
                    state.world
                ) {

                    enemyOreBurst(
                        enemy
                    );

                }

            },
            260
        );


        enemy.abilityCooldown =
            3.7;

    }


    /* =========================================================
       QUIMERA
       ========================================================= */

    function rubyChimeraAbility(
        enemy
    ) {

        const randomAttack =
            randomInt(
                0,
                2
            );


        if (
            randomAttack ===
            0
        ) {

            startEnemyChargeTelegraph(

                enemy,

                {
                    color:
                        "#db4f66"
                }

            );

        }


        else if (
            randomAttack ===
            1
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
                    0.13;


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
                        0.62,

                    color:
                        "#db536a",

                    type:
                        "rubyBreath"

                });

            }

        }


        else {

            for (
                let i = 0;
                i < 4;
                i++
            ) {

                spawnDelayedEnemyArea({

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
                        38,

                    delay:
                        0.45 +
                        i *
                        0.12,

                    damage:
                        enemy.damage *
                        0.62,

                    color:
                        "#d6465e"

                });

            }

        }


        enemy.abilityCooldown =
            3.2;

    }


    /* =========================================================
       MONARCA
       ========================================================= */

    function monarchAbility(
        enemy
    ) {

        const choice =
            randomInt(
                0,
                3
            );


        if (
            choice ===
            0
        ) {

            /*
                Orbes.
            */
            for (
                let i = 0;
                i < 8;
                i++
            ) {

                const angle =

                    i /
                    8 *

                    Math.PI *
                    2 +

                    enemy.animationTime *
                    0.4;


                spawnEnemyProjectile({

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    vx:
                        Math.cos(
                            angle
                        ) *
                        240,

                    vy:
                        Math.sin(
                            angle
                        ) *
                        240,

                    radius:
                        8,

                    damage:
                        enemy.damage *
                        0.55,

                    color:
                        "#8f6ca7",

                    type:
                        "monarchOrb"

                });

            }

        }


        else if (
            choice ===
            1
        ) {

            /*
                Ataques no chão.
            */
            for (
                let i = 0;
                i < 5;
                i++
            ) {

                spawnDelayedEnemyArea({

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
                        47,

                    delay:
                        0.42 +
                        i *
                        0.11,

                    damage:
                        enemy.damage *
                        0.62,

                    color:
                        "#806398"

                });

            }

        }


        else if (
            choice ===
            2
        ) {

            startEnemyChargeTelegraph(

                enemy,

                {
                    color:
                        "#9b78b4"
                }

            );

        }


        else {

            monarchSummonMemoryShadows(
                enemy
            );

        }


        enemy.abilityCooldown =
            2.6;

    }


    function monarchSummonMemoryShadows(
        enemy
    ) {

        const currentClones =
            state.world
                .enemies
                .filter(
                    target =>
                        !target.dead &&
                        target.metadata
                            ?.monarchClone
                )
                .length;


        const canSpawn =
            Math.max(
                0,
                4 -
                currentClones
            );


        const amount =
            Math.min(
                canSpawn,
                2
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI *
                    2
                );


            addEnemy({

                id:
                    uid(
                        "monarch_clone"
                    ),

                x:
                    enemy.x +
                    Math.cos(
                        angle
                    ) *
                    115,

                y:
                    enemy.y +
                    Math.sin(
                        angle
                    ) *
                    115,

                name:
                    "ECO DO MONARCA",

                icon:
                    "♟",

                spriteType:
                    "monarchClone",

                type:
                    "normal",

                hp:
                    125,

                damage:
                    enemy.damage *
                    0.4,

                speed:
                    105,

                vision:
                    500,

                attackRange:
                    62,

                radius:
                    18,

                color:
                    "#695377",

                xp:
                    8,

                money:
                    0,

                metadata: {
                    monarchClone:
                        true
                }

            });

        }

    }


    /* =========================================================
       BOSS SOMBRA
       ========================================================= */

    function shadowBossAbility(
        enemy
    ) {

        const player =
            state.player;


        const angle =
            Math.atan2(
                player.y -
                    enemy.y,
                player.x -
                    enemy.x
            );


        const destinationX =

            player.x -

            Math.cos(
                angle
            ) *
            82;


        const destinationY =

            player.y -

            Math.sin(
                angle
            ) *
            82;


        /*
            Não teleporta instantaneamente.

            Usa rastro/fenda curta.
        */
        const direction =
            normalize(
                destinationX -
                    enemy.x,
                destinationY -
                    enemy.y
            );


        enemy.charge = {

            active:
                true,

            x:
                direction.x,

            y:
                direction.y,

            timer:
                0.22,

            speed:
                600,

            damageMultiplier:
                1.05,

            hitPlayer:
                false

        };


        enemy.abilityCooldown =
            3;

    }


    /* =========================================================
       ESPÍRITO FEÉRICO
       ========================================================= */

    function enemyFairyProjectile(
        enemy
    ) {

        shootEnemyProjectileAtPlayer(

            enemy,

            {
                speed:
                    335,

                radius:
                    6,

                damage:
                    enemy.damage *
                    0.72,

                color:
                    "#e6a5d8",

                type:
                    "fairyBolt"

            }

        );


        enemy.abilityCooldown =
            enemy.ability
                ?.cooldown ||
            2.4;

    }


    /* =========================================================
       BOSS FADAS
       ========================================================= */

    function fairyBossAbility(
        enemy
    ) {

        const choice =
            Math.random();


        if (
            choice <
            0.55
        ) {

            for (
                let i = -3;
                i <= 3;
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
                    0.105;


                spawnEnemyProjectile({

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    vx:
                        Math.cos(
                            angle
                        ) *
                        340,

                    vy:
                        Math.sin(
                            angle
                        ) *
                        340,

                    radius:
                        7,

                    damage:
                        enemy.damage *
                        0.48,

                    color:
                        "#efa9dc",

                    type:
                        "fairyBossBolt"

                });

            }

        }

        else {

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                const angle =
                    i /
                    6 *
                    Math.PI *
                    2;


                spawnDelayedEnemyArea({

                    x:
                        state.player.x +
                        Math.cos(
                            angle
                        ) *
                        80,

                    y:
                        state.player.y +
                        Math.sin(
                            angle
                        ) *
                        80,

                    radius:
                        35,

                    delay:
                        0.45 +
                        i *
                        0.05,

                    damage:
                        enemy.damage *
                        0.5,

                    color:
                        "#e6a5d7"

                });

            }

        }


        enemy.abilityCooldown =
            2.8;

    }


    /* =========================================================
       SERAFIM
       ========================================================= */

    function seraphAbility(
        enemy
    ) {

        if (
            Math.random() <
            0.55
        ) {

            shootEnemyProjectileAtPlayer(

                enemy,

                {
                    speed:
                        350,

                    radius:
                        7,

                    damage:
                        enemy.damage *
                        0.72,

                    color:
                        "#e7e3bb",

                    type:
                        "skyBolt"
                }

            );

        }

        else {

            startEnemyDive(
                enemy,
                1.2
            );

        }


        enemy.abilityCooldown =
            2.6;

    }


    /* =========================================================
       GUARDIÃO DO CAMINHO
       ========================================================= */

    function skyBossAbility(
        enemy
    ) {

        const choice =
            randomInt(
                0,
                2
            );


        if (
            choice ===
            0
        ) {

            for (
                let i = 0;
                i < 10;
                i++
            ) {

                const angle =
                    i /
                    10 *
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
                        310,

                    vy:
                        Math.sin(
                            angle
                        ) *
                        310,

                    radius:
                        7,

                    damage:
                        enemy.damage *
                        0.46,

                    color:
                        "#eee3a8",

                    type:
                        "skyRing"

                });

            }

        }


        else if (
            choice ===
            1
        ) {

            startEnemyChargeTelegraph(
                enemy,
                {
                    color:
                        "#efe0a3"
                }
            );

        }


        else {

            for (
                let i = 0;
                i < 5;
                i++
            ) {

                spawnDelayedEnemyArea({

                    x:
                        state.player.x +
                        random(
                            -130,
                            130
                        ),

                    y:
                        state.player.y +
                        random(
                            -130,
                            130
                        ),

                    radius:
                        42,

                    delay:
                        0.5 +
                        i *
                        0.09,

                    damage:
                        enemy.damage *
                        0.58,

                    color:
                        "#eadb9d"

                });

            }

        }


        enemy.abilityCooldown =
            2.5;

    }


    /* =========================================================
       INFERNO — DEMÔNIO
       ========================================================= */

    function ashDemonAbility(
        enemy
    ) {

        spawnDelayedEnemyArea({

            x:
                enemy.x,

            y:
                enemy.y,

            radius:
                90,

            delay:
                0.5,

            damage:
                enemy.damage *
                1.05,

            color:
                "#b55743"

        });


        enemy.abilityCooldown =
            2.5;

    }


    /* =========================================================
       ESPECTRO
       ========================================================= */

    function specterBolt(
        enemy
    ) {

        shootEnemyProjectileAtPlayer(

            enemy,

            {
                speed:
                    320,

                radius:
                    8,

                damage:
                    enemy.damage *
                    0.78,

                color:
                    "#a85e82",

                type:
                    "specterBolt"
            }

        );


        enemy.abilityCooldown =
            2.5;

    }


    /* =========================================================
       BOSS INFERNO
       ========================================================= */

    function hellBossAbility(
        enemy
    ) {

        const choice =
            randomInt(
                0,
                3
            );


        if (
            choice ===
            0
        ) {

            startEnemyChargeTelegraph(
                enemy,
                {
                    color:
                        "#e35434"
                }
            );

        }


        else if (
            choice ===
            1
        ) {

            for (
                let i = 0;
                i < 12;
                i++
            ) {

                const angle =
                    i /
                    12 *
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
                        280,

                    vy:
                        Math.sin(
                            angle
                        ) *
                        280,

                    radius:
                        8,

                    damage:
                        enemy.damage *
                        0.45,

                    color:
                        "#e75a38",

                    type:
                        "hellFire"

                });

            }

        }


        else if (
            choice ===
            2
        ) {

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                spawnDelayedEnemyArea({

                    x:
                        state.player.x +
                        random(
                            -145,
                            145
                        ),

                    y:
                        state.player.y +
                        random(
                            -145,
                            145
                        ),

                    radius:
                        46,

                    delay:
                        0.45 +
                        i *
                        0.1,

                    damage:
                        enemy.damage *
                        0.58,

                    color:
                        "#df5033"

                });

            }

        }


        else {

            enemyGroundSlam(
                enemy
            );

        }


        enemy.abilityCooldown =
            2.5;

    }


    /* =========================================================
       OUTRO EU

       Usa ataques inspirados no próprio player.
       ========================================================= */

    function mirrorBossAbility(
        enemy
    ) {

        const character =
            currentCharacter();


        const choice =
            randomInt(
                0,
                2
            );


        if (
            choice ===
            0
        ) {

            const direction =
                normalize(
                    state.player.x -
                        enemy.x,
                    state.player.y -
                        enemy.y
                );


            for (
                let i = -1;
                i <= 1;
                i++
            ) {

                const base =
                    Math.atan2(
                        direction.y,
                        direction.x
                    );


                const angle =
                    base +
                    i *
                    0.1;


                spawnEnemyProjectile({

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    vx:
                        Math.cos(
                            angle
                        ) *
                        390,

                    vy:
                        Math.sin(
                            angle
                        ) *
                        390,

                    radius:
                        8,

                    damage:
                        enemy.damage *
                        0.55,

                    color:
                        character.color,

                    type:
                        "mirrorProjectile"

                });

            }

        }


        else if (
            choice ===
            1
        ) {

            startEnemyChargeTelegraph(

                enemy,

                {
                    color:
                        character.color
                }

            );

        }


        else {

            spawnDelayedEnemyArea({

                x:
                    state.player.x,

                y:
                    state.player.y,

                radius:
                    95,

                delay:
                    0.62,

                damage:
                    enemy.damage *
                    1.05,

                color:
                    character.color

            });

        }


        enemy.abilityCooldown =
            2.2;

    }


    /* =========================================================
       ÁREAS DE ATAQUE ATRASADO
       ========================================================= */

    function spawnDelayedEnemyArea(
        config
    ) {

        state.world
            .effects
            .push({

                id:
                    uid(
                        "enemy_area"
                    ),

                type:
                    "delayedEnemyArea",

                x:
                    config.x,

                y:
                    config.y,

                radius:
                    config.radius,

                innerRadius:
                    config.innerRadius ||
                    0,

                timer:
                    config.delay,

                duration:
                    config.delay,

                damage:
                    config.damage,

                color:
                    config.color ||
                    "#c7635e",

                slow:
                    config.slow ||
                    null,

                triggered:
                    false

            });

    }


    function spawnDelayedAreaAttack(
        config
    ) {

        state.world
            .effects
            .push({

                id:
                    uid(
                        "player_area"
                    ),

                type:
                    "delayedPlayerArea",

                x:
                    config.x,

                y:
                    config.y,

                radius:
                    config.radius,

                innerRadius:
                    config.innerRadius ||
                    0,

                timer:
                    config.delay,

                duration:
                    config.delay,

                damage:
                    config.damage,

                color:
                    config.color ||
                    "#ffffff",

                effectType:
                    config.effectType ||
                    "magic",

                source:
                    config.source ||
                    "player",

                triggered:
                    false

            });

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
                effect.type !==
                    "delayedEnemyArea" &&
                effect.type !==
                    "delayedPlayerArea"
            ) {

                continue;

            }


            if (
                effect.triggered
            ) {

                continue;

            }


            effect.timer -=
                dt;


            if (
                effect.timer >
                0
            ) {

                continue;

            }


            effect.triggered =
                true;


            if (
                effect.type ===
                "delayedEnemyArea"
            ) {

                triggerEnemyArea(
                    effect
                );

            }

            else {

                triggerPlayerArea(
                    effect
                );

            }


            effect.remove =
                true;

        }

    }


    function triggerEnemyArea(
        effect
    ) {

        const d =
            distance(

                effect.x,
                effect.y,

                state.player.x,
                state.player.y

            );


        const insideOuter =
            d <=
            effect.radius +
            state.player.radius;


        const outsideInner =
            d >=
            effect.innerRadius -
            state.player.radius;


        if (
            insideOuter &&
            outsideInner
        ) {

            damagePlayer(

                effect.damage,

                {
                    source:
                        "area"
                }

            );


            if (
                effect.slow
            ) {

                applyPlayerSlow(

                    effect.slow
                        .duration,

                    effect.slow
                        .multiplier

                );

            }

        }


        spawnGroundRing(

            effect.x,
            effect.y,

            effect.radius,

            effect.color,

            0.25

        );

    }


    function triggerPlayerArea(
        effect
    ) {

        const enemies =
            getEnemiesInRadius(

                effect.x,
                effect.y,

                effect.radius

            );


        for (
            const enemy of
            enemies
        ) {

            const d =
                distance(

                    effect.x,
                    effect.y,

                    enemy.x,
                    enemy.y

                );


            if (
                d <
                effect.innerRadius
            ) {

                continue;

            }


            if (
                !ensureBossAcceptedBeforeDamage(
                    enemy
                )
            ) {

                continue;

            }


            damageEnemy(
                enemy,
                effect.damage
            );

        }


        spawnGroundRing(

            effect.x,
            effect.y,

            effect.radius,

            effect.color,

            0.35

        );


        state.screenShake =
            0.12;


        state.screenShakePower =
            4;

    }


    /* =========================================================
       EFEITOS BÁSICOS
       ========================================================= */

    function spawnRadialParticles(
        x,
        y,
        color,
        amount = 8,
        speed = 80
    ) {

        if (
            !state.world
        ) {

            return;

        }


        for (
            let i = 0;
            i < amount;
            i++
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


            state.world
                .particles
                .push({

                    id:
                        uid(
                            "particle"
                        ),

                    x,
                    y,

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
                            5,
                            40
                        ),

                    radius:
                        random(
                            1.5,
                            4
                        ),

                    life:
                        random(
                            0.3,
                            0.8
                        ),

                    maxLife:
                        0.8,

                    color

                });

        }

    }


    function spawnAttackFlash(
        x,
        y,
        color,
        radius
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

                radius,

                color,

                timer:
                    0.16,

                duration:
                    0.16

            });

    }


    function spawnGroundRing(
        x,
        y,
        radius,
        color,
        duration = 0.35
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


    function spawnAfterimage(
        x,
        y,
        color,
        duration = 0.2
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

                x,
                y,

                color,

                timer:
                    duration,

                duration

            });

    }


    function spawnFloatingText(
        x,
        y,
        text,
        color = "#ffffff",
        duration = 0.8
    ) {

        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "floating_text"
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


    function spawnEnemyDeathEffect(
        enemy
    ) {

        spawnRadialParticles(

            enemy.x,
            enemy.y,

            enemy.aura ||
            enemy.color,

            enemy.type ===
                "progression"
                    ? 30
                    : 14,

            enemy.type ===
                "progression"
                    ? 170
                    : 100

        );


        state.world
            .effects
            .push({

                id:
                    uid(
                        "enemy_death"
                    ),

                type:
                    "enemyDeath",

                x:
                    enemy.x,

                y:
                    enemy.y,

                radius:
                    enemy.radius,

                color:
                    enemy.color,

                timer:
                    0.55,

                duration:
                    0.55

            });

    }


    function spawnEnemyAttackEffect(
        enemy
    ) {

        state.world
            ?.effects
            ?.push({

                id:
                    uid(
                        "enemy_swipe"
                    ),

                type:
                    "enemySwipe",

                x:
                    enemy.x,

                y:
                    enemy.y,

                targetX:
                    state.player.x,

                targetY:
                    state.player.y,

                color:
                    enemy.color,

                timer:
                    0.18,

                duration:
                    0.18

            });

    }


    function spawnWorldDropVisual(
        x,
        y,
        itemId,
        amount
    ) {

        state.world
            ?.drops
            ?.push({

                id:
                    uid(
                        "drop_visual"
                    ),

                x,
                y,

                itemId,

                amount,

                visualOnly:
                    true,

                timer:
                    1.8,

                duration:
                    1.8

            });

    }


    /* =========================================================
       ATUALIZAÇÃO DE EFEITOS
       ========================================================= */

    function updateGameplayEffects(
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

            particle.x +=
                particle.vx *
                dt;


            particle.y +=
                particle.vy *
                dt;


            particle.vy +=
                finiteNumber(
                    particle.gravity,
                    0
                ) *
                dt;


            particle.life -=
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


        for (
            const effect of
            state.world.effects
        ) {

            if (
                effect.type ===
                    "delayedEnemyArea" ||
                effect.type ===
                    "delayedPlayerArea"
            ) {

                continue;

            }


            if (
                Number.isFinite(
                    effect.timer
                )
            ) {

                effect.timer -=
                    dt;

            }

        }


        state.world.effects =
            state.world
                .effects
                .filter(
                    effect => {

                        if (
                            effect.remove
                        ) {

                            return false;

                        }


                        if (
                            effect.type ===
                                "delayedEnemyArea" ||
                            effect.type ===
                                "delayedPlayerArea"
                        ) {

                            return !effect.triggered;

                        }


                        return (
                            !Number.isFinite(
                                effect.timer
                            ) ||
                            effect.timer >
                            0
                        );

                    }
                );


        for (
            const drop of
            state.world.drops
        ) {

            if (
                !drop.visualOnly
            ) {

                continue;

            }


            drop.timer -=
                dt;

        }


        state.world.drops =
            state.world
                .drops
                .filter(
                    drop =>
                        !drop.visualOnly ||
                        drop.timer >
                        0
                );

    }


    /* =========================================================
       FONTE
       ========================================================= */

    function updateVillageFountain(
        dt
    ) {

        const fountain =
            state.world
                ?.fountain;


        if (!fountain) {

            return;

        }


        fountain.animation +=
            dt;


        fountain.particleTimer -=
            dt;


        if (
            fountain.particleTimer >
            0
        ) {

            return;

        }


        fountain.particleTimer =
            1 /
            GAME_CONFIG
                .fountainParticleRate;


        state.world
            .particles
            .push({

                id:
                    uid(
                        "water"
                    ),

                x:
                    fountain.x +
                    random(
                        -12,
                        12
                    ),

                y:
                    fountain.y -
                    20,

                vx:
                    random(
                        -13,
                        13
                    ),

                vy:
                    random(
                        -58,
                        -30
                    ),

                gravity:
                    110,

                radius:
                    random(
                        1.5,
                        3
                    ),

                life:
                    random(
                        0.45,
                        0.8
                    ),

                maxLife:
                    0.8,

                color:
                    "#9ccbd5"

            });

    }


    /* =========================================================
       COOLDOWNS / IA — SKY TRIAL SUPPORT

       A lógica narrativa/ativação fica Parte 4.
       ========================================================= */

    function countLivingSkyTrialEnemies() {

        if (
            !state.world
        ) {

            return 0;

        }


        return state.world
            .enemies
            .filter(
                enemy =>
                    !enemy.dead &&
                    enemy.metadata
                        ?.skyWaveEnemy
            )
            .length;

    }


    /* =========================================================
       UPDATE CENTRAL
       ========================================================= */

    function updateGameplaySystems(
        dt
    ) {

        if (
            !state.player ||
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


        maintainDevInfiniteResources();


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


        updateDoorAnimations(
            safeDt
        );


        updateHoldCollection(
            safeDt
        );


        updateResources(
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


        updateVillageFountain(
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


        maintainDevInfiniteResources();

    }


    /* =========================================================
       VALIDAÇÃO DA PARTE 3
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
                !allowedStats
                    .includes(
                        stat
                    )
            ) {

                errors.push(
                    `Status inválido: ${stat}`
                );

            }

        }


        if (
            ARMOR_DATA
                .armaduraFolha
                .hpBonus !==
            25
        ) {

            errors.push(
                "Armadura de Folha precisa dar +25 HP."
            );

        }


        if (
            ARMOR_DATA
                .armaduraRubi
                .hpBonus !==
            200
        ) {

            errors.push(
                "Armadura de Rubi precisa dar +200 HP."
            );

        }


        if (
            ENEMY_TYPES
                .wolf
                .ability
                .cooldown !==
            2
        ) {

            errors.push(
                "Cooldown da investida do lobo deve ser aproximadamente 2 segundos."
            );

        }


        if (
            !CLASS_SKILLS
                .zephyr
                .f
        ) {

            errors.push(
                "Dash próprio do Zephyr está ausente."
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
       FIM DA PARTE 3/5

       PARTE 4 VAI DIRETAMENTE ABAIXO.

       NÃO COLOQUE })(); AQUI.
       ========================================================= */
     /* =========================================================
       VEYRA: A QUIETUDE
       V25.0
       SCRIPT.JS — PARTE 4/5

       DIÁLOGOS
       NPCs
       QUESTS
       LOJAS
       COMPRA
       VENDA
       ARMADURAS SEQUENCIAIS
       PORTAS / Z
       INTERAÇÃO / E
       PORTÕES
       MIGUEL
       ALTAR
       MONARCA
       DASH
       5 HORDAS
       FLAUTA
       PORTAIS
       BATTLE CONFIRM
       TRANSIÇÕES DE CENA

       CONTINUA DIRETAMENTE DA PARTE 3.
       ========================================================= */


    /* =========================================================
       PAUSA DE INTERFACE
       ========================================================= */

    function pauseForUI(
        reason
    ) {

        state.paused =
            true;


        state.pauseReason =
            reason ||
            "ui";

    }


    function resumeFromUI(
        reason = null
    ) {

        if (
            reason &&
            state.pauseReason &&
            state.pauseReason !==
            reason
        ) {

            return;

        }


        state.paused =
            false;


        state.pauseReason =
            null;

    }


    /* =========================================================
       DIÁLOGOS
       ========================================================= */

    function normalizeDialogueSpeaker(
        speaker
    ) {

        if (
            typeof speaker ===
            "string"
        ) {

            return {

                id:
                    speaker.toLowerCase(),

                name:
                    speaker,

                role:
                    "",

                color:
                    "#d6c39a"

            };

        }


        return {

            id:
                speaker
                    ?.id ||
                "npc",

            name:
                speaker
                    ?.name ||
                "???",

            role:
                speaker
                    ?.role ||
                "",

            color:
                speaker
                    ?.color ||
                "#d6c39a"

        };

    }


    function normalizeDialogueLines(
        lines
    ) {

        if (
            !Array.isArray(
                lines
            )
        ) {

            return [];

        }


        return lines
            .map(
                line =>
                    String(
                        line ??
                        ""
                    )
            )
            .filter(
                line =>
                    line.length >
                    0
            );

    }


    function openDialogue(
        speaker,
        lines,
        options = {}
    ) {

        const normalizedLines =
            normalizeDialogueLines(
                lines
            );


        if (
            normalizedLines.length ===
            0
        ) {

            if (
                typeof options.onComplete ===
                "function"
            ) {

                options.onComplete();

            }


            return false;

        }


        /*
            Fecha interfaces incompatíveis.
        */
        if (
            state.shopNPC
        ) {

            closeShop(
                true
            );

        }


        if (
            state.questNPC
        ) {

            closeQuestPanel(
                true
            );

        }


        const normalizedSpeaker =
            normalizeDialogueSpeaker(
                speaker
            );


        state.dialogue = {

            speaker:
                normalizedSpeaker,

            lines:
                normalizedLines,

            index:
                0,

            fullText:
                normalizedLines[0],

            visibleText:
                "",

            charIndex:
                0,

            charTimer:
                0,

            typing:
                true,

            fade:
                0,

            closing:
                false,

            closeTimer:
                0,

            onComplete:
                typeof options.onComplete ===
                "function"
                    ? options.onComplete
                    : null,

            metadata:
                options.metadata ||
                null

        };


        pauseForUI(
            "dialogue"
        );


        syncDialogueDOM();


        return true;

    }


    function revealCurrentDialogueLine() {

        const dialogue =
            state.dialogue;


        if (!dialogue) {

            return;

        }


        dialogue.visibleText =
            dialogue.fullText;


        dialogue.charIndex =
            dialogue.fullText.length;


        dialogue.typing =
            false;


        syncDialogueDOM();

    }


    function advanceDialogue() {

        const dialogue =
            state.dialogue;


        if (!dialogue) {

            return false;

        }


        /*
            Primeiro E:
            completa a frase.
        */
        if (
            dialogue.typing
        ) {

            revealCurrentDialogueLine();

            return true;

        }


        /*
            Segundo E:
            avança.
        */
        dialogue.index++;


        if (
            dialogue.index >=
            dialogue.lines.length
        ) {

            closeDialogue();

            return true;

        }


        dialogue.fullText =
            dialogue.lines[
                dialogue.index
            ];


        dialogue.visibleText =
            "";


        dialogue.charIndex =
            0;


        dialogue.charTimer =
            0;


        dialogue.typing =
            true;


        syncDialogueDOM();


        return true;

    }


    function closeDialogue(
        immediate = false
    ) {

        const dialogue =
            state.dialogue;


        if (!dialogue) {

            return;

        }


        if (
            immediate
        ) {

            finalizeDialogueClose();

            return;

        }


        dialogue.closing =
            true;


        dialogue.closeTimer =
            GAME_CONFIG
                .dialogueFadeSeconds;

    }


    function finalizeDialogueClose() {

        const dialogue =
            state.dialogue;


        if (!dialogue) {

            return;

        }


        const callback =
            dialogue.onComplete;


        state.dialogue =
            null;


        resumeFromUI(
            "dialogue"
        );


        syncDialogueDOM();


        if (
            typeof callback ===
            "function"
        ) {

            window.setTimeout(
                callback,
                40
            );

        }

    }


    function updateDialogue(
        dt
    ) {

        const dialogue =
            state.dialogue;


        if (!dialogue) {

            return;

        }


        if (
            dialogue.closing
        ) {

            dialogue.closeTimer -=
                dt;


            dialogue.fade =
                clamp(

                    dialogue.closeTimer /

                    Math.max(
                        0.01,
                        GAME_CONFIG
                            .dialogueFadeSeconds
                    ),

                    0,
                    1

                );


            syncDialogueDOM();


            if (
                dialogue.closeTimer <=
                0
            ) {

                finalizeDialogueClose();

            }


            return;

        }


        dialogue.fade =
            Math.min(
                1,
                dialogue.fade +
                dt /
                Math.max(
                    0.01,
                    GAME_CONFIG
                        .dialogueFadeSeconds
                )
            );


        if (
            !dialogue.typing
        ) {

            syncDialogueDOM();

            return;

        }


        const speed =

            state.keys.has(
                "Space"
            )

                ? GAME_CONFIG
                    .dialogueFastCharactersPerSecond

                : GAME_CONFIG
                    .dialogueCharactersPerSecond;


        dialogue.charTimer +=

            dt *
            speed;


        const characters =
            Math.floor(
                dialogue.charTimer
            );


        if (
            characters <=
            0
        ) {

            syncDialogueDOM();

            return;

        }


        dialogue.charTimer -=
            characters;


        dialogue.charIndex =
            Math.min(

                dialogue.fullText.length,

                dialogue.charIndex +
                characters

            );


        dialogue.visibleText =
            dialogue.fullText.slice(
                0,
                dialogue.charIndex
            );


        if (
            dialogue.charIndex >=
            dialogue.fullText.length
        ) {

            dialogue.typing =
                false;

        }


        syncDialogueDOM();

    }


    function syncDialogueDOM() {

        const panel =
            $("dialoguePanel");


        if (!panel) {

            return;

        }


        const dialogue =
            state.dialogue;


        if (!dialogue) {

            panel.classList
                .add(
                    "hidden"
                );


            panel.style.opacity =
                "0";


            return;

        }


        panel.classList
            .remove(
                "hidden"
            );


        panel.style.opacity =
            String(
                dialogue.fade
            );


        const name =
            $("dialogueName");


        const role =
            $("dialogueRole");


        const text =
            $("dialogueText");


        const continueText =
            $("dialogueContinue");


        if (name) {

            name.textContent =
                dialogue.speaker.name;


            name.style.color =
                dialogue.speaker.color;

        }


        if (role) {

            role.textContent =
                dialogue.speaker.role;

        }


        if (text) {

            text.textContent =
                dialogue.visibleText;

        }


        if (continueText) {

            continueText.textContent =

                dialogue.typing

                    ? "E — COMPLETAR"

                    : dialogue.index <
                      dialogue.lines.length -
                      1

                        ? "E — CONTINUAR"

                        : "E — FECHAR";

        }

    }


    /* =========================================================
       NPCs ATIVOS
       ========================================================= */

    function getActiveNPCs() {

        if (
            state.houseMode
        ) {

            return getHouseInteriorNPCs(
                state.currentHouse
            );

        }


        return (
            state.world
                ?.npcs ||
            []
        );

    }


    function findNearestNPC(
        maxDistance =
            GAME_CONFIG
                .interactDistance
    ) {

        const player =
            state.player;


        if (!player) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const npc of
            getActiveNPCs()
        ) {

            const d =
                distance(

                    player.x,
                    player.y,

                    npc.x,
                    npc.y

                );


            if (
                d <=
                    maxDistance &&
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
       NPC — FALAS
       ========================================================= */

    function getNPCDialogueLines(
        npc
    ) {

        if (!npc) {

            return [];

        }


        if (
            npc.id ===
            "miguel"
        ) {

            return state.player
                ?.abilities
                ?.dash

                ? deepClone(
                    npc.afterDashLines ||
                    NPC_LIBRARY
                        .miguel
                        .afterDashLines
                )

                : deepClone(
                    npc.beforeDashLines ||
                    NPC_LIBRARY
                        .miguel
                        .beforeDashLines
                );

        }


        return deepClone(
            npc.lines ||
            []
        );

    }


    function interactWithNPC(
        npc
    ) {

        if (!npc) {

            return false;

        }


        const lines =
            getNPCDialogueLines(
                npc
            );


        const afterDialogue =
            () => {

                if (
                    npc.merchant
                ) {

                    openShop(
                        "doran"
                    );

                    return;

                }


                if (
                    npc.blacksmith
                ) {

                    const quest =
                        state.player
                            ?.quest
                            ?.coal;


                    if (
                        quest &&
                        (
                            quest.state !==
                                "complete" ||
                            !quest.rewarded
                        )
                    ) {

                        openQuestPanel(
                            npc
                        );

                    }

                    else {

                        openShop(
                            "borin"
                        );

                    }


                    return;

                }


                if (
                    npc.questId
                ) {

                    openQuestPanel(
                        npc
                    );

                }

            };


        openDialogue(

            npc,

            lines,

            {
                onComplete:
                    afterDialogue
            }

        );


        return true;

    }


    /* =========================================================
       NPC WANDER
       ========================================================= */

    function updateNPCs(
        dt
    ) {

        if (
            state.houseMode ||
            !state.world
        ) {

            return;

        }


        for (
            const npc of
            state.world.npcs
        ) {

            if (
                !npc.movable
            ) {

                continue;

            }


            npc.idleTime -=
                dt;


            if (
                !npc.moveTarget &&
                npc.idleTime <=
                0
            ) {

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


                npc.idleTime =
                    random(
                        1.5,
                        3.8
                    );

            }


            if (
                !npc.moveTarget
            ) {

                continue;

            }


            const direction =
                normalize(

                    npc.moveTarget.x -
                    npc.x,

                    npc.moveTarget.y -
                    npc.y

                );


            if (
                direction.length <
                8
            ) {

                npc.moveTarget =
                    null;

                continue;

            }


            const speed =
                24;


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
                    15,
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
                    15,
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

        }

    }


    /* =========================================================
       QUESTS
       ========================================================= */

    const QUEST_DEFINITIONS =
        Object.freeze({

            wood: {

                id:
                    "wood",

                title:
                    "MADEIRA PARA A VILA",

                npc:
                    "BRAN",

                itemId:
                    "madeira",

                need:
                    10,

                rewardXP:
                    100,

                rewardMoney:
                    80,

                description:
                    "Bran precisa de madeira para reforçar as construções da vila."

            },


            coal: {

                id:
                    "coal",

                title:
                    "CARVÃO PARA A FORJA",

                npc:
                    "BORIN",

                itemId:
                    "carvao",

                need:
                    8,

                rewardXP:
                    130,

                rewardMoney:
                    110,

                description:
                    "Borin precisa manter a forja acesa."

            }

        ]);


    function getQuestDefinition(
        id
    ) {

        return (
            QUEST_DEFINITIONS[id] ||
            null
        );

    }


    function openQuestPanel(
        npc
    ) {

        if (
            !npc ||
            !npc.questId
        ) {

            return false;

        }


        state.questNPC =
            npc;


        state.activePanel =
            "quest";


        pauseForUI(
            "quest"
        );


        if (
            typeof renderQuestPanel ===
            "function"
        ) {

            renderQuestPanel();

        }


        return true;

    }


    function closeQuestPanel(
        silent = false
    ) {

        state.questNPC =
            null;


        if (
            state.activePanel ===
            "quest"
        ) {

            state.activePanel =
                null;

        }


        resumeFromUI(
            "quest"
        );


        const panel =
            $("questPanel");


        panel
            ?.classList
            .add(
                "hidden"
            );


        if (
            !silent &&
            typeof updateHUD ===
            "function"
        ) {

            updateHUD();

        }

    }


    function questAction() {

        const player =
            state.player;


        const npc =
            state.questNPC;


        if (
            !player ||
            !npc
        ) {

            return false;

        }


        const definition =
            getQuestDefinition(
                npc.questId
            );


        const quest =
            player.quest[
                npc.questId
            ];


        if (
            !definition ||
            !quest
        ) {

            return false;

        }


        if (
            quest.state ===
            "none"
        ) {

            quest.state =
                "active";


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    `Missão iniciada: ${definition.title}`
                );

            }


            if (
                typeof renderQuestPanel ===
                "function"
            ) {

                renderQuestPanel();

            }


            return true;

        }


        if (
            quest.state ===
            "active"
        ) {

            const amount =
                getItemCount(
                    definition.itemId
                );


            if (
                amount <
                definition.need
            ) {

                if (
                    typeof showToast ===
                    "function"
                ) {

                    showToast(
                        `${ITEMS[definition.itemId].name}: ${amount}/${definition.need}`
                    );

                }


                return false;

            }


            if (
                !removeItem(
                    definition.itemId,
                    definition.need
                )
            ) {

                return false;

            }


            gainXP(
                definition.rewardXP
            );


            addMoney(
                definition.rewardMoney
            );


            quest.state =
                "complete";


            quest.rewarded =
                true;


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    `Missão concluída! +${definition.rewardMoney} moedas.`
                );

            }


            if (
                npc.blacksmith
            ) {

                closeQuestPanel(
                    true
                );


                openShop(
                    "borin"
                );

            }

            else if (
                typeof renderQuestPanel ===
                "function"
            ) {

                renderQuestPanel();

            }


            return true;

        }


        closeQuestPanel();


        return true;

    }


    /* =========================================================
       LOJAS
       ========================================================= */

    const SHOP_CONFIG =
        Object.freeze({

            doran: {

                id:
                    "doran",

                name:
                    "LOJA DE DORAN",

                npcName:
                    "DORAN",

                buyItems: [

                    {
                        id: "pao",
                        price: 12
                    },

                    {
                        id: "carneAssada",
                        price: 28
                    },

                    {
                        id: "pocao",
                        price: 45
                    },

                    {
                        id: "elixir",
                        price: 55
                    },

                    {
                        id: "pocaoForca",
                        price: 85
                    },

                    {
                        id: "pocaoResistencia",
                        price: 85
                    },

                    {
                        id: "pocaoVelocidade",
                        price: 95
                    },

                    {
                        id: "espadaFerro",
                        price: 180,
                        uniquePurchase: true
                    },

                    {
                        id: "minimapa",
                        price: MINIMAP_PRICE,
                        uniquePurchase: true
                    },

                    {
                        id: "lanterna",
                        price: LANTERN_PRICE,
                        uniquePurchase: true
                    }

                ]

            },


            borin: {

                id:
                    "borin",

                name:
                    "FORJA DE BORIN",

                npcName:
                    "BORIN",

                buyItems:
                    []

            }

        });


    function getShopConfig(
        vendorId
    ) {

        return (
            SHOP_CONFIG[
                vendorId
            ] ||
            null
        );

    }


    function openShop(
        vendorId
    ) {

        const shop =
            getShopConfig(
                vendorId
            );


        if (
            !shop
        ) {

            return false;

        }


        state.shopNPC =
            vendorId;


        state.shopMode =
            "buy";


        state.activePanel =
            "shop";


        state.shopRevision =
            finiteNumber(
                state.shopRevision,
                0
            ) +
            1;


        pauseForUI(
            "shop"
        );


        refreshShopUI();


        return true;

    }


    function closeShop(
        silent = false
    ) {

        state.shopNPC =
            null;


        state.shopMode =
            "buy";


        if (
            state.activePanel ===
            "shop"
        ) {

            state.activePanel =
                null;

        }


        resumeFromUI(
            "shop"
        );


        const panel =
            $("shopPanel");


        panel
            ?.classList
            .add(
                "hidden"
            );


        if (
            !silent &&
            typeof updateHUD ===
            "function"
        ) {

            updateHUD();

        }

    }


    function setShopMode(
        mode
    ) {

        if (
            mode !==
                "buy" &&
            mode !==
                "sell"
        ) {

            return false;

        }


        state.shopMode =
            mode;


        state.shopRevision =
            finiteNumber(
                state.shopRevision,
                0
            ) +
            1;


        refreshShopUI();


        return true;

    }


    /* =========================================================
       COMPRA — ITENS ÚNICOS
       ========================================================= */

    function ensurePurchasedUniqueArray() {

        if (
            !state.player
        ) {

            return;

        }


        if (
            !Array.isArray(
                state.player
                    .purchasedUniqueItems
            )
        ) {

            state.player
                .purchasedUniqueItems =
                [];

        }

    }


    function hasPurchasedUniqueItem(
        id
    ) {

        ensurePurchasedUniqueArray();


        return Boolean(

            state.player
                ?.purchasedUniqueItems
                ?.includes(
                    id
                )

        );

    }


    function markUniqueItemPurchased(
        id
    ) {

        ensurePurchasedUniqueArray();


        if (
            !state.player
                .purchasedUniqueItems
                .includes(
                    id
                )
        ) {

            state.player
                .purchasedUniqueItems
                .push(
                    id
                );

        }

    }


    function isUniqueShopPurchase(
        id,
        entry = null
    ) {

        const item =
            ITEMS[id];


        if (!item) {

            return false;

        }


        return Boolean(

            entry
                ?.uniquePurchase ||

            item.unique ||

            item.category ===
                "armor" ||

            item.category ===
                "weapons" ||

            item.category ===
                "special"

        );

    }


    /* =========================================================
       ARMADURA — COMPRA SEQUENCIAL
       ========================================================= */

    function getArmorVendorForTier(
        tier
    ) {

        return tier <=
            4

            ? "doran"

            : "borin";

    }


    function getNextArmorShopEntry(
        vendorId
    ) {

        const nextId =
            getNextArmorUpgradeId();


        if (!nextId) {

            return null;

        }


        const armor =
            ARMOR_DATA[
                nextId
            ];


        if (!armor) {

            return null;

        }


        if (
            getArmorVendorForTier(
                armor.tier
            ) !==
            vendorId
        ) {

            return null;

        }


        if (
            armor.tier <=
            4
        ) {

            return {

                id:
                    armor.id,

                kind:
                    "armor",

                price:
                    armor.price,

                armor,

                previousArmor:
                    armor.previousArmor

            };

        }


        const recipe =
            ARMOR_UPGRADES
                .find(
                    upgrade =>
                        upgrade.id ===
                        armor.id
                );


        if (!recipe) {

            return null;

        }


        return {

            id:
                armor.id,

            kind:
                "armorUpgrade",

            price:
                recipe.coins,

            armor,

            previousArmor:
                recipe.previous,

            materialId:
                recipe.material,

            materialAmount:
                recipe.materialAmount

        };

    }


    function canPurchaseArmorEntry(
        entry
    ) {

        const player =
            state.player;


        if (
            !player ||
            !entry
        ) {

            return false;

        }


        if (
            !isArmorNextUpgrade(
                entry.id
            )
        ) {

            return false;

        }


        if (
            getArmorTier(
                entry.id
            ) <=
            finiteNumber(
                player.armorHighestTierEver,
                0
            )
        ) {

            return false;

        }


        if (
            entry.previousArmor &&
            !playerOwnsArmor(
                entry.previousArmor
            )
        ) {

            return false;

        }


        if (
            !hasEnoughMoney(
                entry.price
            )
        ) {

            return false;

        }


        if (
            entry.kind ===
            "armorUpgrade"
        ) {

            if (
                getItemCount(
                    entry.materialId
                ) <
                entry.materialAmount
            ) {

                return false;

            }

        }


        return true;

    }


    function purchaseArmorEntry(
        entry
    ) {

        const player =
            state.player;


        if (
            !canPurchaseArmorEntry(
                entry
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Você ainda não possui os requisitos para esta armadura."
                );

            }


            return false;

        }


        /*
            Primeiro paga materiais.
        */
        if (
            entry.kind ===
            "armorUpgrade"
        ) {

            if (
                !removeItem(
                    entry.materialId,
                    entry.materialAmount
                )
            ) {

                return false;

            }

        }


        if (
            !spendMoney(
                entry.price
            )
        ) {

            return false;

        }


        /*
            A armadura anterior é consumida
            como parte da evolução.

            O maior tier já alcançado fica salvo,
            então ela nunca reaparece para compra.
        */
        if (
            entry.previousArmor
        ) {

            const previousCount =
                getRealItemCount(
                    entry.previousArmor
                );


            if (
                previousCount >
                0
            ) {

                state.player
                    .inventory[
                        entry.previousArmor
                    ] =
                    Math.max(
                        0,
                        previousCount -
                        1
                    );

            }

        }


        addItem(
            entry.id,
            1,
            {
                silent:
                    true
            }
        );


        player.equipment.armor =
            entry.id;


        player.armorHighestTierEver =
            Math.max(

                finiteNumber(
                    player.armorHighestTierEver,
                    0
                ),

                getArmorTier(
                    entry.id
                )

            );


        markUniqueItemPurchased(
            entry.id
        );


        /*
            Recalcula preservando proporções.
        */
        recalculatePlayerStats();


        /*
            Como a armadura acabou de aumentar o HP,
            garante que o novo bônus seja imediatamente útil.

            Não é cura infinita:
            acontece apenas na aquisição de um novo tier.
        */
        const hpBonus =
            ARMOR_DATA[
                entry.id
            ]?.hpBonus ||
            0;


        const previousBonus =
            entry.previousArmor
                ? ARMOR_DATA[
                    entry.previousArmor
                ]?.hpBonus ||
                  0
                : 0;


        const gainedHp =
            Math.max(
                0,
                hpBonus -
                previousBonus
            );


        player.hp =
            Math.min(
                player.maxHp,
                player.hp +
                gainedHp
            );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `${ITEMS[entry.id].name} equipada! +${hpBonus} HP de armadura.`
            );

        }


        refreshShopUI();


        return true;

    }


    /* =========================================================
       ITENS DISPONÍVEIS PARA COMPRA
       ========================================================= */

    function getShopBuyEntries(
        vendorId =
            state.shopNPC
    ) {

        const shop =
            getShopConfig(
                vendorId
            );


        if (
            !shop ||
            !state.player
        ) {

            return [];

        }


        const entries =
            [];


        for (
            const entry of
            shop.buyItems
        ) {

            const item =
                ITEMS[
                    entry.id
                ];


            if (!item) {

                continue;

            }


            if (
                entry.id ===
                    "lanterna" &&
                state.player
                    .lanternOwned
            ) {

                continue;

            }


            if (
                entry.id ===
                    "minimapa" &&
                state.player
                    .minimapOwned
            ) {

                continue;

            }


            if (
                isUniqueShopPurchase(
                    entry.id,
                    entry
                ) &&
                (
                    hasPurchasedUniqueItem(
                        entry.id
                    ) ||
                    getRealItemCount(
                        entry.id
                    ) >
                        0
                )
            ) {

                continue;

            }


            entries.push({

                ...entry,

                kind:
                    "item",

                item

            });

        }


        const armorEntry =
            getNextArmorShopEntry(
                vendorId
            );


        if (
            armorEntry
        ) {

            entries.push(
                armorEntry
            );

        }


        return entries;

    }


    /* =========================================================
       COMPRA NORMAL
       ========================================================= */

    function purchaseShopItem(
        id
    ) {

        const vendorId =
            state.shopNPC;


        const entries =
            getShopBuyEntries(
                vendorId
            );


        const entry =
            entries.find(
                candidate =>
                    candidate.id ===
                    id
            );


        if (!entry) {

            return false;

        }


        if (
            entry.kind ===
                "armor" ||
            entry.kind ===
                "armorUpgrade"
        ) {

            return purchaseArmorEntry(
                entry
            );

        }


        const item =
            ITEMS[id];


        if (!item) {

            return false;

        }


        if (
            isUniqueShopPurchase(
                id,
                entry
            ) &&
            (
                hasPurchasedUniqueItem(
                    id
                ) ||
                getRealItemCount(
                    id
                ) >
                    0
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Você já comprou este equipamento."
                );

            }


            refreshShopUI();

            return false;

        }


        const price =
            Math.max(
                0,
                finiteNumber(
                    entry.price,
                    item.value ||
                    0
                )
            );


        if (
            !hasEnoughMoney(
                price
            )
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Moedas insuficientes."
                );

            }


            return false;

        }


        if (
            !canCarryItem(
                id,
                1
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


        if (
            !spendMoney(
                price
            )
        ) {

            return false;

        }


        addItem(
            id,
            1,
            {
                silent:
                    true
            }
        );


        if (
            isUniqueShopPurchase(
                id,
                entry
            )
        ) {

            markUniqueItemPurchased(
                id
            );

        }


        if (
            id ===
            "lanterna"
        ) {

            state.player.lanternOwned =
                true;

        }


        if (
            id ===
            "minimapa"
        ) {

            state.player.minimapOwned =
                true;

        }


        if (
            item.category ===
                "weapons"
        ) {

            state.player
                .equipment
                .weapon =
                id;


            recalculatePlayerStats();

        }


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `${item.name} comprado.`
            );

        }


        refreshShopUI();


        return true;

    }


    /* =========================================================
       VENDA

       CORREÇÃO DO BUG:
       - retira quantidade correta;
       - adiciona moeda;
       - atualiza UI imediatamente;
       - VENDER 1;
       - VENDER TUDO;
       - não vende quest;
       - não vende armadura;
       - não vende item único;
       - não vende item equipado.
       ========================================================= */

    function getShopSellPrice(
        id
    ) {

        const item =
            ITEMS[id];


        if (!item) {

            return 0;

        }


        return Math.max(

            1,

            Math.floor(
                finiteNumber(
                    item.value,
                    0
                ) *
                0.55
            )

        );

    }


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


    function canSellInventoryItem(
        id
    ) {

        const item =
            ITEMS[id];


        if (
            !state.player ||
            !item
        ) {

            return false;

        }


        if (
            item.sellable !==
            true
        ) {

            return false;

        }


        if (
            item.questItem ||
            item.unique
        ) {

            return false;

        }


        if (
            item.category ===
            "armor"
        ) {

            return false;

        }


        if (
            isEquippedItem(
                id
            )
        ) {

            return false;

        }


        const realAmount =
            getRealItemCount(
                id
            );


        /*
            Em materiais infinitos de DEV,
            deixamos aparecer para testar o botão,
            mas sem alterar save.
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


        return (
            realAmount >
            0
        );

    }


    function getShopSellEntries() {

        const entries =
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
                !canSellInventoryItem(
                    id
                )
            ) {

                continue;

            }


            const virtualInfinite =

                state.dev
                    ?.unlocked &&

                state.dev
                    .infiniteMaterials &&

                item.category ===
                    "materials";


            const amount =

                virtualInfinite

                    ? 999

                    : getRealItemCount(
                        id
                    );


            entries.push({

                id,

                item,

                amount,

                price:
                    getShopSellPrice(
                        id
                    ),

                virtualInfinite

            });

        }


        return entries
            .sort(
                (
                    a,
                    b
                ) =>
                    a.item.name
                        .localeCompare(
                            b.item.name,
                            "pt-BR"
                        )
            );

    }


    function sellInventoryItem(
        id,
        mode = "one"
    ) {

        if (
            !canSellInventoryItem(
                id
            )
        ) {

            return false;

        }


        const item =
            ITEMS[id];


        const infiniteTest =

            state.dev
                ?.unlocked &&

            state.dev
                .infiniteMaterials &&

            item.category ===
                "materials";


        const realAmount =
            getRealItemCount(
                id
            );


        const amount =

            mode ===
            "all"

                ? infiniteTest
                    ? 999
                    : realAmount

                : 1;


        if (
            amount <=
            0
        ) {

            return false;

        }


        const unitPrice =
            getShopSellPrice(
                id
            );


        const total =
            unitPrice *
            amount;


        /*
            Modo de materiais infinitos é totalmente virtual.
            Não suja o save.
        */
        if (
            infiniteTest
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    mode ===
                    "all"
                        ? `Venda de teste: ${item.name} x999.`
                        : `Venda de teste: ${item.name}.`
                );

            }


            refreshShopUI();


            return true;

        }


        if (
            !removeItem(
                id,
                amount
            )
        ) {

            return false;

        }


        addMoney(
            total
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `${item.name} x${amount} vendido por ${total} moedas.`
            );

        }


        state.shopRevision =
            finiteNumber(
                state.shopRevision,
                0
            ) +
            1;


        /*
            Atualização IMEDIATA.
        */
        refreshShopUI();


        if (
            typeof updateHUD ===
            "function"
        ) {

            updateHUD();

        }


        if (
            typeof renderInventory ===
            "function"
        ) {

            renderInventory();

        }


        return true;

    }


    function sellAllSellableItems() {

        const entries =
            getShopSellEntries()
                .filter(
                    entry =>
                        !entry.virtualInfinite
                );


        let soldSomething =
            false;


        for (
            const entry of
            entries
        ) {

            if (
                sellInventoryItem(
                    entry.id,
                    "all"
                )
            ) {

                soldSomething =
                    true;

            }

        }


        return soldSomething;

    }


    /* =========================================================
       AÇÃO CENTRAL DA LOJA
       ========================================================= */

    function performShopAction(
        action,
        id
    ) {

        switch (
            action
        ) {

            case "buy":

                return purchaseShopItem(
                    id
                );


            case "sellOne":

                return sellInventoryItem(
                    id,
                    "one"
                );


            case "sellAll":

                return sellInventoryItem(
                    id,
                    "all"
                );


            default:

                return false;

        }

    }


    function refreshShopUI() {

        state.shopRevision =
            finiteNumber(
                state.shopRevision,
                0
            ) +
            1;


        if (
            typeof renderShopPanel ===
            "function"
        ) {

            renderShopPanel();

        }


        if (
            typeof updateHUD ===
            "function"
        ) {

            updateHUD();

        }

    }


    /* =========================================================
       PORTAS / CASAS
       ========================================================= */

    function getBuildingByDoor(
        door
    ) {

        if (
            !door ||
            !state.world
        ) {

            return null;

        }


        return (

            state.world
                .buildings
                .find(
                    building =>
                        building.id ===
                        door.buildingId
                ) ||
            null

        );

    }


    function isPlayerNearInteriorDoor() {

        if (
            !state.houseMode ||
            !state.player
        ) {

            return false;

        }


        const door =
            getInteriorDoor(
                state.currentHouse
            );


        if (!door) {

            return false;

        }


        return (

            distance(

                state.player.x,
                state.player.y,

                door.x +
                door.w /
                2,

                door.y +
                door.h /
                2

            ) <=
            105

        );

    }


    function enterHouseByDoor(
        door
    ) {

        const building =
            getBuildingByDoor(
                door
            );


        if (
            !building
        ) {

            return false;

        }


        const spec =
            getHouseSpec(
                building
            );


        if (!spec) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Esta construção não possui interior."
                );

            }


            return false;

        }


        const returnPoint = {

            area:
                state.area,

            x:
                door.approachX,

            y:
                door.approachY +
                18,

            facing:
                "up"

        };


        startSceneTransition(

            building.name,

            () => {

                state.houseReturn =
                    returnPoint;


                state.currentHouse =
                    building;


                state.houseMode =
                    true;


                placePlayerInsideHouse(
                    building
                );


                state.player
                    .playerDash =
                    null;


                state.player
                    .zephyrDash =
                    null;


                state.holdAction =
                    null;

            }

        );


        return true;

    }


    function exitCurrentHouse() {

        if (
            !state.houseMode ||
            !state.player
        ) {

            return false;

        }


        const returnPoint =
            state.houseReturn;


        startSceneTransition(

            "VILA DO CREPÚSCULO",

            () => {

                state.houseMode =
                    false;


                state.currentHouse =
                    null;


                if (
                    returnPoint &&
                    state.area ===
                    returnPoint.area
                ) {

                    state.player.x =
                        returnPoint.x;


                    state.player.y =
                        returnPoint.y;


                    state.player.facing =
                        returnPoint.facing ||
                        "down";

                }

                else {

                    const spawn =
                        getRegionEntrySpawn(
                            state.area
                        );


                    state.player.x =
                        spawn.x;


                    state.player.y =
                        spawn.y;

                }


                state.houseReturn =
                    null;


                repairPlayerPosition(
                    state.player.x,
                    state.player.y
                );

            }

        );


        return true;

    }


    function useDoorKey() {

        if (
            !state.player ||
            state.dialogue ||
            state.battle ||
            state.travel
        ) {

            return false;

        }


        /*
            Dentro da casa:
            precisa estar perto da porta.
        */
        if (
            state.houseMode
        ) {

            if (
                !isPlayerNearInteriorDoor()
            ) {

                return false;

            }


            return exitCurrentHouse();

        }


        const door =
            getNearbyExteriorDoor();


        if (!door) {

            return false;

        }


        /*
            A porta já começa abrindo ao aproximar.

            Z é apenas entrada.
        */
        door.targetAnimation =
            1;


        return enterHouseByDoor(
            door
        );

    }


    /* =========================================================
       CAMA / DESCANSO
       ========================================================= */

    function getNearbyBed() {

        if (
            !state.houseMode ||
            state.currentHouse
                ?.id !==
                "home"
        ) {

            return null;

        }


        const furniture =
            getHouseFurniture(
                state.currentHouse
            );


        return (

            furniture.find(
                object => {

                    if (
                        object.type !==
                        "bed"
                    ) {

                        return false;

                    }


                    return (

                        distance(

                            state.player.x,
                            state.player.y,

                            object.x +
                            object.w /
                            2,

                            object.y +
                            object.h /
                            2

                        ) <=
                        95

                    );

                }
            ) ||

            null

        );

    }


    /* =========================================================
       PORTÃO NORTE
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

                "O portão permanece imóvel.",

                "Alguma coisa além deste caminho ainda não respondeu à sua presença."

            ],

            south: [

                "A passagem ao sul parece incompleta.",

                "Talvez alguma lembrança ainda esteja faltando antes que este caminho possa existir por inteiro."

            ]

        });


    function getGateById(
        id
    ) {

        return (

            state.world
                ?.gates
                ?.find(
                    gate =>
                        gate.id ===
                        id
                ) ||

            null

        );

    }


    function findNearestGate(
        maxDistance = 125
    ) {

        if (
            !state.player ||
            state.houseMode
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        for (
            const gate of
            state.world
                ?.gates ||
            []
        ) {

            const centerX =
                gate.x +
                gate.w /
                2;


            const centerY =
                gate.y +
                gate.h /
                2;


            const d =
                distance(

                    state.player.x,
                    state.player.y,

                    centerX,
                    centerY

                );


            if (
                d <=
                    maxDistance &&
                d <
                    bestDistance
            ) {

                best =
                    gate;

                bestDistance =
                    d;

            }

        }


        return best;

    }


    function getMaterialRequirementLine(
        itemId,
        required
    ) {

        const current =
            getItemCount(
                itemId
            );


        const missing =
            Math.max(
                0,
                required -
                current
            );


        if (
            itemId ===
            "diamante"
        ) {

            return (
                `💎 Diamante: ${current} / ${required} — faltam ${missing}`
            );

        }


        if (
            itemId ===
            "rubi"
        ) {

            return (
                `♦️ Rubi: ${current} / ${required} — faltam ${missing}`
            );

        }


        return (
            `${ITEMS[itemId]?.name || itemId}: ${current} / ${required} — faltam ${missing}`
        );

    }


    function hasRequiredMaterials(
        requirements
    ) {

        for (
            const [
                id,
                amount
            ] of
            Object.entries(
                requirements
            )
        ) {

            if (
                getItemCount(
                    id
                ) <
                amount
            ) {

                return false;

            }

        }


        return true;

    }


    function consumeRequiredMaterials(
        requirements
    ) {

        if (
            !hasRequiredMaterials(
                requirements
            )
        ) {

            return false;

        }


        for (
            const [
                id,
                amount
            ] of
            Object.entries(
                requirements
            )
        ) {

            if (
                !removeItem(
                    id,
                    amount
                )
            ) {

                return false;

            }

        }


        return true;

    }


    function interactNorthGate(
        gate
    ) {

        const player =
            state.player;


        if (!player) {

            return false;

        }


        /*
            Já aberto:
            usa como passagem.
        */
        if (
            player.gateUnlocks
                ?.north
        ) {

            gate.opened =
                true;


            gate.locked =
                false;


            gate.targetAnimation =
                1;


            openTravelConfirmation({

                label:
                    "CAVERNA SOMBRIA",

                targetArea:
                    "shadow",

                targetX:
                    245,

                targetY:
                    1080

            });


            return true;

        }


        /*
            SEM DASH:

            NÃO mostra nenhum material.
        */
        if (
            !player.abilities
                ?.dash
        ) {

            const index =

                finiteNumber(
                    player
                        .gateDialogueIndex
                        ?.north,
                    0
                ) %

                NORTH_GATE_DIALOGUES
                    .length;


            const lines =
                NORTH_GATE_DIALOGUES[
                    index
                ];


            player.gateDialogueIndex.north =

                (
                    index +
                    1
                ) %

                NORTH_GATE_DIALOGUES
                    .length;


            openDialogue(

                {
                    name:
                        "PORTÃO NORTE",

                    role:
                        "Uma passagem inquietante",

                    color:
                        "#9b8bb2"
                },

                lines

            );


            return true;

        }


        /*
            DASH EXISTE, MAS FALTAM MATERIAIS.
        */
        if (
            !hasRequiredMaterials(
                NORTH_GATE_COST
            )
        ) {

            openDialogue(

                {
                    name:
                        "PORTÃO NORTE",

                    role:
                        "Passagem selada",

                    color:
                        "#9b8bb2"
                },

                [

                    "Você domina a técnica necessária, mas sua preparação ainda está incompleta.",

                    getMaterialRequirementLine(
                        "diamante",
                        NORTH_GATE_COST
                            .diamante
                    ),

                    getMaterialRequirementLine(
                        "rubi",
                        NORTH_GATE_COST
                            .rubi
                    )

                ]

            );


            return true;

        }


        /*
            DASH + MATERIAIS.
        */
        openDialogue(

            {
                name:
                    "PORTÃO NORTE",

                role:
                    "O selo reage à sua presença",

                color:
                    "#a892bf"
            },

            [

                "O portão responde ao movimento que você aprendeu.",

                "As pedras do selo começam a absorver sua oferenda.",

                "A passagem para o norte foi aberta."

            ],

            {
                onComplete:
                    () => {

                        unlockNorthGate(
                            gate
                        );

                    }
            }

        );


        return true;

    }


    function unlockNorthGate(
        gate =
            getGateById(
                "north_gate"
            )
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.gateUnlocks
                ?.north
        ) {

            return false;

        }


        if (
            !consumeRequiredMaterials(
                NORTH_GATE_COST
            )
        ) {

            return false;

        }


        player.gateUnlocks.north =
            true;


        if (gate) {

            gate.locked =
                false;


            gate.opened =
                true;


            gate.targetAnimation =
                1;

        }


        if (
            !player.unlockedAreas
                .includes(
                    "shadow"
                )
        ) {

            player.unlockedAreas
                .push(
                    "shadow"
                );

        }


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "O Portão Norte foi aberto."
            );

        }


        return true;

    }


    function interactBlockedRoute(
        gate
    ) {

        const key =

            gate.id ===
            "west_gate"

                ? "west"

                : "south";


        openDialogue(

            {
                name:
                    gate.name,

                role:
                    "Passagem selada",

                color:
                    "#7f7486"
            },

            BLOCKED_ROUTE_DIALOGUES[
                key
            ]

        );


        return true;

    }


    function interactWithGate(
        gate
    ) {

        if (!gate) {

            return false;

        }


        if (
            gate.id ===
            "north_gate"
        ) {

            return interactNorthGate(
                gate
            );

        }


        if (
            gate.futureRoute
        ) {

            return interactBlockedRoute(
                gate
            );

        }


        if (
            gate.opened &&
            gate.targetArea
        ) {

            openTravelConfirmation({

                label:
                    REGIONS[
                        gate.targetArea
                    ]?.name ||
                    gate.targetArea,

                targetArea:
                    gate.targetArea,

                targetX:
                    gate.targetSpawn
                        ?.x,

                targetY:
                    gate.targetSpawn
                        ?.y

            });


            return true;

        }


        return false;

    }


    function updateGateAnimations(
        dt
    ) {

        if (
            !state.world
        ) {

            return;

        }


        for (
            const gate of
            state.world.gates
        ) {

            if (
                gate.id ===
                    "north_gate" &&
                state.player
                    ?.gateUnlocks
                    ?.north
            ) {

                gate.locked =
                    false;


                gate.opened =
                    true;


                gate.targetAnimation =
                    1;

            }


            gate.animation =
                lerp(

                    finiteNumber(
                        gate.animation,
                        0
                    ),

                    finiteNumber(
                        gate.targetAnimation,
                        gate.opened
                            ? 1
                            : 0
                    ),

                    clamp(
                        dt *
                        7,
                        0,
                        1
                    )

                );

        }

    }


    /* =========================================================
       ALTAR DO MONARCA
       ========================================================= */

    function getNearbyAltar(
        maxDistance = 125
    ) {

        const altar =
            state.world
                ?.altar;


        const player =
            state.player;


        if (
            !altar ||
            !player
        ) {

            return null;

        }


        if (
            distance(

                player.x,
                player.y,

                altar.x,
                altar.y

            ) <=
            maxDistance
        ) {

            return altar;

        }


        return null;

    }


    function interactWithMonarchAltar() {

        const player =
            state.player;


        const altar =
            state.world
                ?.altar;


        if (
            !player ||
            !altar
        ) {

            return false;

        }


        /*
            DASH JÁ FOI OBTIDO.
        */
        if (
            player.abilities
                ?.dash
        ) {

            openDialogue(

                {
                    name:
                        "ALTAR",

                    role:
                        "As inscrições estão silenciosas",

                    color:
                        "#9983b3"
                },

                [

                    "O altar não exige mais nada de você.",

                    "A técnica do Monarca agora pertence ao seu corpo."

                ]

            );


            return true;

        }


        /*
            MONARCA AINDA NÃO DESPERTOU.
        */
        if (
            !player.monarchAwakened
        ) {

            if (
                !hasRequiredMaterials(
                    DASH_RITUAL_COST
                )
            ) {

                openDialogue(

                    {
                        name:
                            "ALTAR",

                        role:
                            "Inscrições antigas",

                        color:
                            "#a38bbd"
                    },

                    [

                        "As inscrições do altar despertam sob seus pés.",

                        "Por um instante, uma força tenta alcançar você... mas o brilho desaparece.",

                        "A oferenda é insuficiente para despertar o poder adormecido.",

                        getMaterialRequirementLine(
                            "rubi",
                            DASH_RITUAL_COST
                                .rubi
                        ),

                        getMaterialRequirementLine(
                            "diamante",
                            DASH_RITUAL_COST
                                .diamante
                        )

                    ]

                );


                return true;

            }


            /*
                NÃO CONSOME MATERIAIS AGORA.
            */
            openDialogue(

                {
                    name:
                        "ALTAR",

                    role:
                        "Algo desperta",

                    color:
                        "#b197cc"
                },

                [

                    "A OFERENDA FOI ACEITA...",

                    "…MAS NÃO POR VOCÊ.",

                    "O MONARCA DESPERTOU"

                ],

                {
                    onComplete:
                        awakenMonarch
                }

            );


            return true;

        }


        /*
            MONARCA VIVO.
        */
        if (
            player.monarchAwakened &&
            !player.monarchDefeated
        ) {

            openDialogue(

                {
                    name:
                        "ALTAR",

                    role:
                        "O ritual permanece incompleto",

                    color:
                        "#957cab"
                },

                [

                    "A presença despertada pelo altar ainda está próxima.",

                    "O poder não será seu enquanto o Monarca permanecer de pé."

                ]

            );


            return true;

        }


        /*
            MONARCA DERROTADO.

            AGORA os materiais são consumidos.
        */
        if (
            player.monarchDefeated &&
            !player.dashPurchased
        ) {

            if (
                !hasRequiredMaterials(
                    DASH_RITUAL_COST
                )
            ) {

                openDialogue(

                    {
                        name:
                            "ALTAR",

                        role:
                            "O poder espera por uma oferenda",

                        color:
                            "#a48db9"
                    },

                    [

                        "O Monarca caiu, mas o ritual ainda precisa ser concluído.",

                        getMaterialRequirementLine(
                            "rubi",
                            DASH_RITUAL_COST
                                .rubi
                        ),

                        getMaterialRequirementLine(
                            "diamante",
                            DASH_RITUAL_COST
                                .diamante
                        )

                    ]

                );


                return true;

            }


            openDialogue(

                {
                    name:
                        "ALTAR",

                    role:
                        "Memória incorporada",

                    color:
                        "#b99dd2"
                },

                [

                    "O altar reconhece a queda do Monarca.",

                    "A força que antes pertencia a ele procura um novo corpo.",

                    "Você sente o espaço ao seu redor se dobrar por um instante.",

                    "DASH DESPERTADO"

                ],

                {
                    onComplete:
                        completeDashRitual
                }

            );


            return true;

        }


        return false;

    }


    function awakenMonarch() {

        const player =
            state.player;


        if (
            !player ||
            player.monarchAwakened
        ) {

            return false;

        }


        /*
            Segunda verificação para impedir
            ativação se o inventário mudou.
        */
        if (
            !hasRequiredMaterials(
                DASH_RITUAL_COST
            )
        ) {

            return false;

        }


        player.monarchAwakened =
            true;


        state.world.altar.ritualStarted =
            true;


        state.world.altar.active =
            true;


        /*
            Materiais NÃO são removidos.
        */


        const existing =
            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "monarch" &&
                        !enemy.dead
                );


        if (!existing) {

            addEnemy({

                id:
                    "monarch",

                x:
                    3180,

                y:
                    1145,

                name:
                    "O MONARCA",

                type:
                    "progression",

                hp:
                    1750,

                damage:
                    51,

                speed:
                    74,

                vision:
                    520,

                attackRange:
                    120,

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

            });

        }


        state.screenShake =
            0.8;


        state.screenShakePower =
            9;


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "O Monarca despertou."
            );

        }


        return true;

    }


    function completeDashRitual() {

        const player =
            state.player;


        if (
            !player ||
            !player.monarchDefeated ||
            player.dashPurchased
        ) {

            return false;

        }


        if (
            !consumeRequiredMaterials(
                DASH_RITUAL_COST
            )
        ) {

            return false;

        }


        player.dashPurchased =
            true;


        player.abilities.dash =
            true;


        spawnRadialParticles(

            player.x,
            player.y,

            "#ae8bd0",

            34,

            180

        );


        spawnGroundRing(

            player.x,
            player.y,

            145,

            "#9f80c2",

            1

        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Dash universal desbloqueado!"
            );

        }


        return true;

    }


    /* =========================================================
       BOSS CONFIRMATION
       ========================================================= */

    function openBattleConfirmation(
        enemy
    ) {

        if (
            !enemy ||
            enemy.dead ||
            enemy.accepted
        ) {

            return false;

        }


        discoverBoss(
            enemy
        );


        if (
            state.battle
                ?.enemyId ===
            enemy.id
        ) {

            return true;

        }


        state.battle = {

            enemyId:
                enemy.id,

            name:
                enemy.name,

            icon:
                enemy.icon,

            bodyStyle:
                enemy.bodyStyle,

            color:
                enemy.color,

            aura:
                enemy.aura,

            hp:
                enemy.hp,

            maxHp:
                enemy.maxHp

        };


        pauseForUI(
            "battle"
        );


        if (
            typeof renderBattleConfirmation ===
            "function"
        ) {

            renderBattleConfirmation();

        }


        return true;

    }


    function getBattleEnemy() {

        if (
            !state.battle ||
            !state.world
        ) {

            return null;

        }


        return (

            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        state.battle
                            .enemyId
                ) ||

            null

        );

    }


    function acceptBattle() {

        const enemy =
            getBattleEnemy();


        if (!enemy) {

            state.battle =
                null;


            resumeFromUI(
                "battle"
            );


            return false;

        }


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        enemy.state =
            "chasing";


        enemy.attackCooldown =
            0.55;


        enemy.abilityCooldown =
            Math.max(
                enemy.abilityCooldown,
                0.7
            );


        state.battle =
            null;


        resumeFromUI(
            "battle"
        );


        const panel =
            $("battleConfirmPanel");


        panel
            ?.classList
            .add(
                "hidden"
            );


        spawnGroundRing(

            enemy.x,
            enemy.y,

            enemy.radius *
            2.2,

            enemy.aura ||
            enemy.color,

            0.7

        );


        return true;

    }


    function declineBattle() {

        const enemy =
            getBattleEnemy();


        if (enemy) {

            enemy.accepted =
                false;


            enemy.aggressive =
                false;


            enemy.state =
                "waiting";


            /*
                Pequeno afastamento para não reabrir
                instantaneamente.
            */
            const away =
                normalize(

                    state.player.x -
                    enemy.x,

                    state.player.y -
                    enemy.y

                );


            const x =
                state.player.x +
                away.x *
                42;


            const y =
                state.player.y +
                away.y *
                42;


            if (
                canPlayerMoveTo(
                    x,
                    y
                )
            ) {

                state.player.x =
                    x;

                state.player.y =
                    y;

            }

        }


        state.battle =
            null;


        resumeFromUI(
            "battle"
        );


        $("battleConfirmPanel")
            ?.classList
            .add(
                "hidden"
            );


        return true;

    }


    /* =========================================================
       BOSS DERROTADO
       ========================================================= */

    function onProgressionBossDefeated(
        enemy
    ) {

        if (!enemy) {

            return;

        }


        if (
            state.battle
                ?.enemyId ===
            enemy.id
        ) {

            state.battle =
                null;

        }


        if (
            enemy.id ===
            "monarch"
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "O Monarca caiu. Retorne ao altar."
                );

            }


            return;

        }


        if (
            enemy.id ===
            "path_guardian"
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "A Flauta da Memória responde ao vento."
                );

            }


            return;

        }


        if (
            enemy.id ===
            "other_self"
        ) {

            if (
                typeof openFinalChoiceAfterVictory ===
                "function"
            ) {

                openFinalChoiceAfterVictory();

            }


            return;

        }


        if (
            enemy.unlock &&
            typeof showToast ===
            "function"
        ) {

            showToast(
                `Novo caminho disponível: ${REGIONS[enemy.unlock]?.name || enemy.unlock}`
            );

        }

    }


    /* =========================================================
       TRAVEL
       ========================================================= */

    function openTravelConfirmation(
        portalOrConfig
    ) {

        if (
            state.transition ||
            state.travel
        ) {

            return false;

        }


        const config =
            portalOrConfig;


        if (
            !config ||
            !config.targetArea
        ) {

            return false;

        }


        state.travel = {

            portalId:
                config.id ||
                null,

            label:
                config.label ||
                REGIONS[
                    config.targetArea
                ]?.name ||
                "PASSAGEM",

            targetArea:
                config.targetArea,

            targetX:
                config.targetX ??
                null,

            targetY:
                config.targetY ??
                null

        };


        pauseForUI(
            "travel"
        );


        if (
            typeof renderTravelConfirmation ===
            "function"
        ) {

            renderTravelConfirmation();

        }


        return true;

    }


    function confirmTravel() {

        const travel =
            state.travel;


        if (!travel) {

            return false;

        }


        const copy =
            {
                ...travel
            };


        state.travel =
            null;


        resumeFromUI(
            "travel"
        );


        $("travelPanel")
            ?.classList
            .add(
                "hidden"
            );


        requestAreaChange(

            copy.targetArea,

            copy.targetX,

            copy.targetY,

            copy.label

        );


        return true;

    }


    function cancelTravel() {

        state.travel =
            null;


        resumeFromUI(
            "travel"
        );


        $("travelPanel")
            ?.classList
            .add(
                "hidden"
            );


        state.portalCooldown =
            0.8;


        return true;

    }


    /* =========================================================
       TRANSIÇÕES DE CENA
       ========================================================= */

    function startSceneTransition(
        message,
        midpoint,
        options = {}
    ) {

        if (
            state.transition
        ) {

            return false;

        }


        state.transition = {

            message:
                message ||
                "",

            phase:
                "out",

            timer:
                options.outDuration ||
                0.32,

            outDuration:
                options.outDuration ||
                0.32,

            inDuration:
                options.inDuration ||
                0.38,

            holdDuration:
                options.holdDuration ||
                0.08,

            holdTimer:
                options.holdDuration ||
                0.08,

            alpha:
                0,

            midpoint:
                typeof midpoint ===
                "function"
                    ? midpoint
                    : null,

            midpointDone:
                false

        };


        pauseForUI(
            "transition"
        );


        return true;

    }


    function updateSceneTransition(
        dt
    ) {

        const transition =
            state.transition;


        if (!transition) {

            return;

        }


        if (
            transition.phase ===
            "out"
        ) {

            transition.timer -=
                dt;


            transition.alpha =
                1 -

                clamp(

                    transition.timer /
                    transition.outDuration,

                    0,
                    1

                );


            if (
                transition.timer <=
                0
            ) {

                transition.alpha =
                    1;


                if (
                    !transition.midpointDone
                ) {

                    transition.midpointDone =
                        true;


                    if (
                        transition.midpoint
                    ) {

                        transition.midpoint();

                    }

                }


                transition.phase =
                    "hold";

            }


            return;

        }


        if (
            transition.phase ===
            "hold"
        ) {

            transition.holdTimer -=
                dt;


            transition.alpha =
                1;


            if (
                transition.holdTimer <=
                0
            ) {

                transition.phase =
                    "in";


                transition.timer =
                    transition.inDuration;

            }


            return;

        }


        transition.timer -=
            dt;


        transition.alpha =
            clamp(

                transition.timer /
                transition.inDuration,

                0,
                1

            );


        if (
            transition.timer <=
            0
        ) {

            state.transition =
                null;


            resumeFromUI(
                "transition"
            );

        }

    }


    function requestAreaChange(
        targetArea,
        targetX = null,
        targetY = null,
        message = null
    ) {

        if (
            !REGIONS[
                targetArea
            ]
        ) {

            return false;

        }


        return startSceneTransition(

            message ||
            REGIONS[
                targetArea
            ].name,

            () => {

                state.area =
                    targetArea;


                state.houseMode =
                    false;


                state.currentHouse =
                    null;


                state.houseReturn =
                    null;


                buildWorld();


                const fallback =
                    getRegionEntrySpawn(
                        targetArea
                    );


                state.player.x =

                    Number.isFinite(
                        targetX
                    )

                        ? targetX

                        : fallback.x;


                state.player.y =

                    Number.isFinite(
                        targetY
                    )

                        ? targetY

                        : fallback.y;


                state.player.facing =
                    "right";


                state.portalCooldown =
                    1.1;


                state.player
                    .playerDash =
                    null;


                state.player
                    .zephyrDash =
                    null;


                repairPlayerPosition(
                    state.player.x,
                    state.player.y
                );


                resetSkyTrialRuntime();

            }

        );

    }


    /*
        Compatibilidade com a chamada da Parte 3.

        Se receber nome de região:
        troca de área.

        Se receber apenas mensagem:
        faz fade sem mudar a área.
    */
    function transitionToArea(
        targetOrMessage,
        x = null,
        y = null
    ) {

        if (
            REGIONS[
                targetOrMessage
            ]
        ) {

            return requestAreaChange(
                targetOrMessage,
                x,
                y
            );

        }


        return startSceneTransition(

            String(
                targetOrMessage ||
                ""
            ),

            null

        );

    }


    /* =========================================================
       PORTAIS
       ========================================================= */

    function getPortalPlayerIsTouching() {

        if (
            !state.player ||
            state.houseMode ||
            !state.world
        ) {

            return null;

        }


        for (
            const portal of
            state.world.portals
        ) {

            if (
                !portal.active ||
                portal.hidden
            ) {

                continue;

            }


            if (
                circleRectCollision(

                    state.player.x,
                    state.player.y,
                    state.player.radius,

                    portal

                )
            ) {

                return portal;

            }

        }


        return null;

    }


    function updatePortalTransitions() {

        if (
            state.paused ||
            state.portalCooldown >
                0 ||
            state.travel ||
            state.transition
        ) {

            return;

        }


        const portal =
            getPortalPlayerIsTouching();


        if (!portal) {

            return;

        }


        if (
            portal.condition &&
            !portal.condition()
        ) {

            state.portalCooldown =
                0.8;


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "A passagem ainda não está disponível."
                );

            }


            return;

        }


        state.portalCooldown =
            1;


        openTravelConfirmation(
            portal
        );

    }


    /* =========================================================
       FLAUTA DA MEMÓRIA
       ========================================================= */

    function useMemoryFlute() {

        const player =
            state.player;


        if (
            !player ||
            getRealItemCount(
                "flautaMemoria"
            ) <=
            0
        ) {

            return false;

        }


        if (
            player.flutePlayed
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "A passagem revelada pela Flauta continua aberta."
                );

            }


            return true;

        }


        if (
            state.area !==
            "sky"
        ) {

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Aqui, a melodia parece não encontrar caminho."
                );

            }


            return false;

        }


        player.flutePlayed =
            true;


        const portal =
            state.world
                .portals
                .find(
                    target =>
                        target.id ===
                        "sky_to_hell"
                );


        if (portal) {

            portal.hidden =
                false;


            portal.active =
                true;

        }


        state.world.effects.push({

            id:
                uid(
                    "memory_flute"
                ),

            type:
                "memoryFlute",

            x:
                player.x,

            y:
                player.y,

            timer:
                2.4,

            duration:
                2.4

        });


        spawnGroundRing(
            player.x,
            player.y,
            180,
            "#eee0ab",
            1.2
        );


        spawnRadialParticles(
            player.x,
            player.y,
            "#d5e7e9",
            28,
            145
        );


        openDialogue(

            {
                name:
                    "FLAUTA DA MEMÓRIA",

                role:
                    "Uma melodia atravessa o céu",

                color:
                    "#e9dfaa"
            },

            [

                "A primeira nota parece desaparecer no vento.",

                "A segunda volta de algum lugar que você não consegue ver.",

                "Quando a última nota termina, uma passagem que antes não existia começa a tomar forma."

            ]

        );


        return true;

    }


    function activateInventoryItem(
        id
    ) {

        if (
            id ===
            "flautaMemoria"
        ) {

            return useMemoryFlute();

        }


        return useInventoryItem(
            id
        );

    }


    /* =========================================================
       PROVA CELESTE — 5 HORDAS
       ========================================================= */

    function resetSkyTrialRuntime() {

        state.skyTrialRuntime = {

            initialized:
                false,

            delay:
                0,

            announcedWave:
                0

        };

    }


    resetSkyTrialRuntime();


    function isPlayerInsideSkyArena() {

        if (
            state.area !==
                "sky" ||
            !state.player
        ) {

            return false;

        }


        const arena =
            state.world
                ?.landmarks
                ?.find(
                    landmark =>
                        landmark.id ===
                        "sky_trial_arena"
                );


        if (!arena) {

            return false;

        }


        return (

            distance(

                state.player.x,
                state.player.y,

                arena.x,
                arena.y

            ) <=
            arena.radius +
            25

        );

    }


    function startSkyTrial() {

        const trial =
            state.player
                ?.skyTrial;


        if (
            !trial ||
            trial.complete ||
            trial.started
        ) {

            return false;

        }


        trial.started =
            true;


        trial.wave =
            0;


        trial.activeWave =
            0;


        state.skyTrialRuntime.delay =
            1.2;


        openDialogue(

            {
                name:
                    "PROVA CELESTE",

                role:
                    "O vento muda de direção",

                color:
                    "#e4dda8"
            },

            [

                "O chão abaixo de você vibra.",

                "Cinco ondas de inimigos se aproximam.",

                "Sobreviva."

            ]

        );


        return true;

    }


    function initializeSkyTrialRuntime() {

        if (
            state.area !==
                "sky" ||
            !state.player
        ) {

            return;

        }


        if (
            state.skyTrialRuntime
                .initialized
        ) {

            return;

        }


        state.skyTrialRuntime.initialized =
            true;


        const trial =
            state.player
                .skyTrial;


        if (
            !trial ||
            trial.complete
        ) {

            return;

        }


        /*
            Se saiu da área no meio de uma onda,
            ela recomeça ao retornar.
        */
        if (
            trial.started &&
            trial.activeWave >
                0
        ) {

            spawnSkyWave(
                trial.activeWave
            );


            return;

        }


        if (
            trial.started
        ) {

            state.skyTrialRuntime.delay =
                0.8;

        }

    }


    function getSkyWaveTemplate(
        wave,
        index
    ) {

        const variants = [

            {
                name:
                    "SERAFIM PARTIDO",

                spriteType:
                    "brokenSeraph",

                color:
                    "#c6d3d7",

                hp:
                    260 +
                    wave *
                    32,

                damage:
                    29 +
                    wave *
                    2,

                speed:
                    92 +
                    wave *
                    2,

                attackRange:
                    175,

                ability: {
                    id:
                        "skyWaveBolt",

                    type:
                        "projectileDive",

                    cooldown:
                        2.5
                }
            },


            {
                name:
                    "LANÇA-VENTO",

                spriteType:
                    "windLancer",

                color:
                    "#d9d5b3",

                hp:
                    300 +
                    wave *
                    34,

                damage:
                    32 +
                    wave *
                    2,

                speed:
                    110,

                attackRange:
                    68,

                ability: {
                    id:
                        "skyCharge",

                    type:
                        "charge",

                    cooldown:
                        2.5,

                    telegraph:
                        0.5,

                    speed:
                        440,

                    duration:
                        0.4,

                    damageMultiplier:
                        1.12
                }
            },


            {
                name:
                    "VIGIA CELESTE",

                spriteType:
                    "skyWatcher",

                color:
                    "#e0d99f",

                hp:
                    360 +
                    wave *
                    38,

                damage:
                    34 +
                    wave *
                    2,

                speed:
                    76,

                attackRange:
                    82,

                ability: {
                    id:
                        "skySlam",

                    type:
                        "groundSlam",

                    cooldown:
                        3
                }
            }

        ];


        return variants[
            (
                wave +
                index
            ) %
            variants.length
        ];

    }


    function spawnSkyWave(
        wave
    ) {

        if (
            state.area !==
                "sky" ||
            !state.player
        ) {

            return false;

        }


        const arena =
            state.world
                .landmarks
                .find(
                    landmark =>
                        landmark.id ===
                        "sky_trial_arena"
                );


        if (!arena) {

            return false;

        }


        const trial =
            state.player
                .skyTrial;


        trial.activeWave =
            wave;


        const count =
            2 +
            wave;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =

                i /
                count *

                Math.PI *
                2 +

                wave *
                0.3;


            const radius =
                175 +
                (
                    i %
                    2
                ) *
                60;


            const template =
                getSkyWaveTemplate(
                    wave,
                    i
                );


            const spawn =
                findSafeSpawn(

                    arena.x +
                    Math.cos(
                        angle
                    ) *
                    radius,

                    arena.y +
                    Math.sin(
                        angle
                    ) *
                    radius,

                    24,

                    {
                        allowProtected:
                            true
                    }

                );


            addEnemy({

                id:
                    `sky_wave_${wave}_${i}_${Date.now()}`,

                x:
                    spawn.x,

                y:
                    spawn.y,

                name:
                    template.name,

                icon:
                    "✦",

                spriteType:
                    template.spriteType,

                type:
                    "normal",

                hp:
                    template.hp,

                damage:
                    template.damage,

                speed:
                    template.speed,

                vision:
                    520,

                attackRange:
                    template.attackRange,

                radius:
                    22,

                color:
                    template.color,

                xp:
                    35 +
                    wave *
                    7,

                money:
                    10 +
                    wave *
                    3,

                drop:
                    wave >=
                    4
                        ? "cristal"
                        : "essencia",

                dropAmount:
                    1,

                ability:
                    deepClone(
                        template.ability
                    ),

                metadata: {
                    skyWaveEnemy:
                        true,

                    skyWave:
                        wave
                }

            });

        }


        state.skyTrialRuntime
            .announcedWave =
            wave;


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                `HORDA ${wave} / 5`
            );

        }


        return true;

    }


    function finishSkyTrial() {

        const trial =
            state.player
                .skyTrial;


        trial.wave =
            5;


        trial.activeWave =
            0;


        trial.complete =
            true;


        state.skyTrialRuntime.delay =
            0;


        spawnGroundRing(
            2500,
            1125,
            250,
            "#eee0a3",
            1.2
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "As cinco hordas foram derrotadas."
            );

        }


        window.setTimeout(
            spawnPathGuardianIfNeeded,
            550
        );

    }


    function spawnPathGuardianIfNeeded() {

        if (
            state.area !==
                "sky" ||
            !state.player
                ?.skyTrial
                ?.complete ||
            hasDefeatedBoss(
                "path_guardian"
            )
        ) {

            return false;

        }


        const existing =
            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "path_guardian" &&
                        !enemy.dead
                );


        if (existing) {

            return true;

        }


        addEnemy({

            id:
                "path_guardian",

            x:
                2940,

            y:
                1125,

            name:
                "GUARDIÃO DO CAMINHO",

            type:
                "progression",

            hp:
                1450,

            damage:
                51,

            speed:
                96,

            vision:
                470,

            attackRange:
                135,

            radius:
                53,

            xp:
                820,

            money:
                430,

            drop:
                "essencia",

            dropAmount:
                6,

            unlock:
                "hell",

            ability: {
                id:
                    "pathGuardianPattern",

                type:
                    "skyBoss",

                cooldown:
                    2.5
            },

            metadata: {
                grantsFlute:
                    true
            }

        });


        return true;

    }


    function updateSkyTrial(
        dt
    ) {

        if (
            state.area !==
                "sky" ||
            !state.player ||
            state.houseMode
        ) {

            return;

        }


        initializeSkyTrialRuntime();


        const trial =
            state.player
                .skyTrial;


        if (
            !trial ||
            trial.complete
        ) {

            spawnPathGuardianIfNeeded();

            return;

        }


        if (
            !trial.started
        ) {

            if (
                isPlayerInsideSkyArena()
            ) {

                startSkyTrial();

            }


            return;

        }


        if (
            trial.activeWave >
            0
        ) {

            if (
                countLivingSkyTrialEnemies() >
                0
            ) {

                return;

            }


            trial.wave =
                trial.activeWave;


            trial.activeWave =
                0;


            if (
                trial.wave >=
                5
            ) {

                finishSkyTrial();

                return;

            }


            state.skyTrialRuntime.delay =
                1.6;


            return;

        }


        state.skyTrialRuntime.delay -=
            dt;


        if (
            state.skyTrialRuntime.delay >
            0
        ) {

            return;

        }


        const nextWave =
            trial.wave +
            1;


        spawnSkyWave(
            nextWave
        );

    }


    /* =========================================================
       INTERAÇÃO PRINCIPAL
       ========================================================= */

    function getNearestInteractionTarget() {

        const player =
            state.player;


        if (!player) {

            return null;

        }


        const candidates =
            [];


        /*
            NPC.
        */
        const npc =
            findNearestNPC();


        if (npc) {

            candidates.push({

                type:
                    "npc",

                target:
                    npc,

                distance:
                    distance(
                        player.x,
                        player.y,
                        npc.x,
                        npc.y
                    )

            });

        }


        /*
            ALTAR.
        */
        const altar =
            getNearbyAltar();


        if (altar) {

            candidates.push({

                type:
                    "altar",

                target:
                    altar,

                distance:
                    distance(
                        player.x,
                        player.y,
                        altar.x,
                        altar.y
                    )

            });

        }


        /*
            PORTÃO.
        */
        const gate =
            findNearestGate();


        if (gate) {

            candidates.push({

                type:
                    "gate",

                target:
                    gate,

                distance:
                    distance(

                        player.x,
                        player.y,

                        gate.x +
                        gate.w /
                        2,

                        gate.y +
                        gate.h /
                        2

                    )

            });

        }


        /*
            CAMA.
        */
        const bed =
            getNearbyBed();


        if (bed) {

            candidates.push({

                type:
                    "bed",

                target:
                    bed,

                distance:
                    distance(

                        player.x,
                        player.y,

                        bed.x +
                        bed.w /
                        2,

                        bed.y +
                        bed.h /
                        2

                    )

            });

        }


        /*
            RECURSO.
        */
        const collectible =
            getNearestCollectible();


        if (collectible) {

            candidates.push({

                type:
                    "collectible",

                target:
                    collectible,

                distance:
                    distance(

                        player.x,
                        player.y,

                        collectible
                            .target
                            .x,

                        collectible
                            .target
                            .y

                    )

            });

        }


        candidates.sort(
            (
                a,
                b
            ) =>
                a.distance -
                b.distance
        );


        return (
            candidates[0] ||
            null
        );

    }


    function handleInteractionKeyDown() {

        /*
            Diálogo tem prioridade absoluta.
        */
        if (
            state.dialogue
        ) {

            return advanceDialogue();

        }


        if (
            state.shopNPC ||
            state.questNPC ||
            state.battle ||
            state.travel ||
            state.transition
        ) {

            return false;

        }


        const interaction =
            getNearestInteractionTarget();


        if (!interaction) {

            return false;

        }


        switch (
            interaction.type
        ) {

            case "npc":

                return interactWithNPC(
                    interaction.target
                );


            case "altar":

                return interactWithMonarchAltar();


            case "gate":

                return interactWithGate(
                    interaction.target
                );


            case "bed":

                return startPlayerRest();


            case "collectible":

                return beginHoldCollect();

        }


        return false;

    }


    function handleInteractionKeyUp() {

        if (
            state.holdAction
        ) {

            cancelHoldCollect();

        }

    }


    /* =========================================================
       UPDATE INTERAÇÕES

       A Parte 5 chamará isto no loop.
       ========================================================= */

    function updateInteractionSystems(
        dt
    ) {

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
            Estes precisam atualizar mesmo
            quando o gameplay estiver pausado.
        */
        updateDialogue(
            safeDt
        );


        updateSceneTransition(
            safeDt
        );


        if (
            state.transition
        ) {

            return;

        }


        if (
            state.paused
        ) {

            return;

        }


        updateNPCs(
            safeDt
        );


        updateGateAnimations(
            safeDt
        );


        updatePortalTransitions();


        updateSkyTrial(
            safeDt
        );

    }


    /* =========================================================
       ESCAPE / FECHAR PAINÉIS
       ========================================================= */

    function closeTopUI() {

        if (
            state.dialogue
        ) {

            closeDialogue();

            return true;

        }


        if (
            state.battle
        ) {

            declineBattle();

            return true;

        }


        if (
            state.travel
        ) {

            cancelTravel();

            return true;

        }


        if (
            state.shopNPC
        ) {

            closeShop();

            return true;

        }


        if (
            state.questNPC
        ) {

            closeQuestPanel();

            return true;

        }


        if (
            state.dev
                ?.panelOpen
        ) {

            closeDevCommandPanel();

            return true;

        }


        return false;

    }


    /* =========================================================
       INTERAÇÃO DO INVENTÁRIO
       ========================================================= */

    function inventoryPrimaryAction(
        id
    ) {

        const item =
            ITEMS[id];


        if (
            !item
        ) {

            return false;

        }


        if (
            item.category ===
                "food" ||
            item.category ===
                "potions"
        ) {

            return activateInventoryItem(
                id
            );

        }


        if (
            item.category ===
                "special"
        ) {

            return activateInventoryItem(
                id
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


        return false;

    }


    /* =========================================================
       CORRIGIR SAVE ANTIGO — REGRAS NOVAS
       ========================================================= */

    function migratePlayerToV25Rules(
        player
    ) {

        if (!player) {

            return null;

        }


        /*
            STATS.
        */
        player.stats =
            player.stats ||
            {};


        /*
            Converte força/magia antigos para
            o novo atributo unificado.

            Usa o MAIOR dos dois,
            não soma, para não duplicar pontos.
        */
        const oldStrength =
            finiteNumber(
                player.stats
                    .strength ??
                player.stats
                    .forca,
                0
            );


        const oldMagic =
            finiteNumber(
                player.stats
                    .magic ??
                player.stats
                    .magia,
                0
            );


        const existingPower =
            finiteNumber(
                player.stats
                    .power,
                0
            );


        player.stats.power =
            clamp(

                Math.max(
                    existingPower,
                    oldStrength,
                    oldMagic
                ),

                0,
                STAT_CAP

            );


        player.stats.energy =
            clamp(
                finiteNumber(
                    player.stats
                        .energy,
                    0
                ),
                0,
                STAT_CAP
            );


        player.stats.hunger =
            clamp(
                finiteNumber(
                    player.stats
                        .hunger,
                    0
                ),
                0,
                STAT_CAP
            );


        player.stats.fatigue =
            clamp(
                finiteNumber(
                    player.stats
                        .fatigue,
                    0
                ),
                0,
                STAT_CAP
            );


        /*
            Remove campos que não são mais
            distribuíveis para evitar confusão.
        */
        delete player.stats.strength;
        delete player.stats.forca;
        delete player.stats.magic;
        delete player.stats.magia;
        delete player.stats.hp;
        delete player.stats.life;
        delete player.stats.speed;
        delete player.stats.velocidade;


        player.statPoints =
            Math.max(
                0,
                Math.floor(
                    finiteNumber(
                        player.statPoints,
                        0
                    )
                )
            );


        player.level =
            clamp(
                Math.floor(
                    finiteNumber(
                        player.level,
                        1
                    )
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

            player.level >=
            MAX_LEVEL

                ? Infinity

                : calculateXpToNext(
                    player.level
                );


        /*
            ARMADURA.
        */
        player.armorHighestTierEver =
            clamp(
                finiteNumber(
                    player.armorHighestTierEver,
                    0
                ),
                0,
                ARMOR_PROGRESSION.length
            );


        const equippedArmor =
            player.equipment
                ?.armor;


        if (
            equippedArmor &&
            ARMOR_DATA[
                equippedArmor
            ]
        ) {

            player.armorHighestTierEver =
                Math.max(

                    player.armorHighestTierEver,

                    getArmorTier(
                        equippedArmor
                    )

                );

        }


        /*
            INVENTÁRIO.
        */
        const empty =
            createEmptyInventory();


        player.inventory =
            player.inventory ||
            {};


        for (
            const id of
            Object.keys(
                empty
            )
        ) {

            player.inventory[id] =
                Math.max(
                    0,
                    Math.floor(
                        finiteNumber(
                            player.inventory[id],
                            0
                        )
                    )
                );

        }


        /*
            EQUIPMENT.
        */
        player.equipment =
            player.equipment ||
            {};


        player.equipment.weapon =
            ITEMS[
                player.equipment
                    .weapon
            ]
                ? player.equipment
                    .weapon
                : getRealItemCount(
                    "espadaSimples"
                ) >
                    0
                    ? "espadaSimples"
                    : null;


        player.equipment.tool =
            ITEMS[
                player.equipment
                    .tool
            ]
                ? player.equipment
                    .tool
                : getRealItemCount(
                    "machado"
                ) >
                    0
                    ? "machado"
                    : null;


        if (
            !ARMOR_DATA[
                player.equipment
                    .armor
            ]
        ) {

            player.equipment.armor =
                null;

        }


        /*
            SISTEMAS DE PROGRESSÃO.
        */
        player.abilities =
            player.abilities ||
            {
                dash: false,
                route2: false,
                route3: false
            };


        player.gateUnlocks =
            player.gateUnlocks ||
            {
                north: false,
                west: false,
                south: false
            };


        player.gateDialogueIndex =
            player.gateDialogueIndex ||
            {
                north: 0,
                west: 0,
                south: 0
            };


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


        player.purchasedUniqueItems =
            Array.isArray(
                player.purchasedUniqueItems
            )
                ? player.purchasedUniqueItems
                : [];


        player.skyTrial =
            player.skyTrial ||
            {
                started: false,
                wave: 0,
                activeWave: 0,
                complete: false
            };


        player.monarchAwakened =
            Boolean(
                player.monarchAwakened
            );


        player.monarchDefeated =
            Boolean(
                player.monarchDefeated
            );


        player.monarchHits =
            finiteNumber(
                player.monarchHits,
                0
            );


        player.dashPurchased =
            Boolean(
                player.dashPurchased
            );


        player.fluteRewardGranted =
            Boolean(
                player.fluteRewardGranted
            );


        player.flutePlayed =
            Boolean(
                player.flutePlayed
            );


        player.minimapOwned =

            Boolean(
                player.minimapOwned
            ) ||

            getRealItemCount(
                "minimapa"
            ) >
            0;


        player.lanternOwned =

            Boolean(
                player.lanternOwned
            ) ||

            getRealItemCount(
                "lanterna"
            ) >
            0;


        player.activePotionBuffs =
            [];


        player.dead =
            false;


        player.invincible =
            0;


        player.attackCooldown =
            0;


        player.skillCooldowns = {

            q: 0,
            r: 0,
            f: 0

        };


        player.resting = {

            active: false,
            timer: 0,
            duration: 0

        };


        player.checkpoint = {

            area:
                "village",

            houseId:
                "home",

            type:
                "playerHome"

        };


        return player;

    }


    /* =========================================================
       SANITIZAR ANTES DE SAVE

       DEV NÃO É SALVO.
       RUNTIME NÃO É SALVO.
       ========================================================= */

    function createSerializablePlayer() {

        if (
            !state.player
        ) {

            return null;

        }


        const player =
            deepClone(
                state.player
            );


        /*
            Dados temporários.
        */
        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.guardianRush =
            null;


        player.ironGuard =
            null;


        player.adaptiveBuff =
            null;


        player.activePotionBuffs =
            [];


        player.dead =
            false;


        player.invincible =
            0;


        player.hurtAnim =
            0;


        player.attackCooldown =
            0;


        player.skillCooldowns = {
            q: 0,
            r: 0,
            f: 0
        };


        player.resting = {
            active: false,
            timer: 0,
            duration: 0
        };


        return player;

    }


    /* =========================================================
       VALIDAÇÕES ESPECÍFICAS
       ========================================================= */

    function validateShopLogic() {

        const errors =
            [];


        if (
            ITEMS
                .armaduraFolha
                .sellable !==
            false
        ) {

            errors.push(
                "Armaduras não podem ser vendidas."
            );

        }


        if (
            ITEMS
                .flautaMemoria
                .sellable !==
            false
        ) {

            errors.push(
                "Flauta não pode ser vendida."
            );

        }


        if (
            SHOP_CONFIG
                .doran
                .buyItems
                .filter(
                    entry =>
                        entry.id ===
                        "lanterna"
                )
                .length !==
            1
        ) {

            errors.push(
                "Lanterna deve existir uma única vez na loja de Doran."
            );

        }


        return errors;

    }


    function validatePart4Data() {

        const errors = [
            ...validateShopLogic()
        ];


        if (
            NORTH_GATE_COST
                .diamante !==
                40 ||
            NORTH_GATE_COST
                .rubi !==
                55
        ) {

            errors.push(
                "Custo do Portão Norte incorreto."
            );

        }


        if (
            DASH_RITUAL_COST
                .rubi !==
                60 ||
            DASH_RITUAL_COST
                .diamante !==
                45
        ) {

            errors.push(
                "Custo do ritual do Dash incorreto."
            );

        }


        if (
            NORTH_GATE_DIALOGUES
                .length !==
            3
        ) {

            errors.push(
                "Devem existir três diálogos pré-Dash no Portão Norte."
            );

        }


        if (
            errors.length >
            0
        ) {

            console.error(
                "VEYRA V25 — erros na Parte 4:",
                errors
            );


            return false;

        }


        return true;

    }


    /* =========================================================
       FIM DA PARTE 4/5

       A PARTE 5 ENTRA DIRETAMENTE ABAIXO.

       SOMENTE A PARTE 5 TERÁ:

       })();

       ========================================================= */
     /* =========================================================
       VEYRA: A QUIETUDE
       V25.0
       SCRIPT.JS — PARTE 5/5

       RENDERIZAÇÃO
       HUD
       INVENTÁRIO
       LOJA
       QUEST
       BOSS CONFIRM
       PLAYER / NPC / INIMIGOS
       BOSSES
       MAPA / MINIMAPA
       LANTERNA / ESCURIDÃO
       MENU / SELEÇÃO
       SAVE / LOAD
       INPUT
       LOOP
       INICIALIZAÇÃO

       ESTA PARTE FECHA O IIFE.
       ========================================================= */


    /* =========================================================
       RUNTIME VISUAL
       ========================================================= */

    const renderRuntime = {

        width:
            1280,

        height:
            720,

        dpr:
            1,

        darknessCanvas:
            document.createElement(
                "canvas"
            ),

        darknessCtx:
            null,

        lastHudUpdate:
            0,

        lastMiniMapUpdate:
            0,

        lastWorldMapUpdate:
            0,

        lastSaveAt:
            0,

        fpsTime:
            0,

        fpsFrames:
            0,

        fps:
            60

    };


    renderRuntime.darknessCtx =
        renderRuntime
            .darknessCanvas
            .getContext(
                "2d"
            );


    /* =========================================================
       HTML ESCAPE
       ========================================================= */

    function escapeHTML(
        value
    ) {

        return String(
            value ??
            ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                "\"",
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /* =========================================================
       ELEMENTOS DINÂMICOS DE SEGURANÇA

       Se algum painel estiver faltando no HTML,
       cria apenas o necessário para evitar crash.

       O visual definitivo continua vindo do CSS.
       ========================================================= */

    function ensureElement(
        id,
        tag = "div",
        parent =
            document.body
    ) {

        let element =
            $(id);


        if (element) {

            return element;

        }


        element =
            document.createElement(
                tag
            );


        element.id =
            id;


        parent.appendChild(
            element
        );


        return element;

    }


    function ensureRuntimeUI() {

        /*
            TOAST
        */
        const toast =
            ensureElement(
                "gameToast"
            );


        toast.classList.add(
            "game-toast",
            "hidden"
        );


        /*
            DIÁLOGO
        */
        if (
            !$(
                "dialoguePanel"
            )
        ) {

            const panel =
                ensureElement(
                    "dialoguePanel"
                );


            panel.className =
                "dialogue-panel hidden";


            panel.innerHTML = `
                <div class="dialogue-box">
                    <div class="dialogue-heading">
                        <strong id="dialogueName"></strong>
                        <span id="dialogueRole"></span>
                    </div>

                    <p id="dialogueText"></p>

                    <span id="dialogueContinue"></span>
                </div>
            `;

        }


        /*
            SHOP
        */
        if (
            !$(
                "shopPanel"
            )
        ) {

            const panel =
                ensureElement(
                    "shopPanel"
                );


            panel.className =
                "game-modal hidden";

        }


        /*
            QUEST
        */
        if (
            !$(
                "questPanel"
            )
        ) {

            const panel =
                ensureElement(
                    "questPanel"
                );


            panel.className =
                "game-modal hidden";

        }


        /*
            BATALHA
        */
        if (
            !$(
                "battleConfirmPanel"
            )
        ) {

            const panel =
                ensureElement(
                    "battleConfirmPanel"
                );


            panel.className =
                "game-modal hidden";

        }


        /*
            VIAGEM
        */
        if (
            !$(
                "travelPanel"
            )
        ) {

            const panel =
                ensureElement(
                    "travelPanel"
                );


            panel.className =
                "game-modal hidden";

        }


        /*
            INVENTÁRIO
        */
        if (
            !$(
                "inventoryPanel"
            )
        ) {

            const panel =
                ensureElement(
                    "inventoryPanel"
                );


            panel.className =
                "game-modal inventory-panel hidden";

        }


        /*
            STATUS
        */
        if (
            !$(
                "statusPanel"
            )
        ) {

            const panel =
                ensureElement(
                    "statusPanel"
                );


            panel.className =
                "game-modal status-panel hidden";

        }


        /*
            FINAL
        */
        if (
            !$(
                "finalChoicePanel"
            )
        ) {

            const panel =
                ensureElement(
                    "finalChoicePanel"
                );


            panel.className =
                "game-modal hidden";

        }


        /*
            HUD
        */
        if (
            !$(
                "runtimeHUD"
            )
        ) {

            const hud =
                ensureElement(
                    "runtimeHUD"
                );


            hud.className =
                "runtime-hud";


            hud.innerHTML = `
                <div class="runtime-hud-main">

                    <div class="hud-player">
                        <span id="hudPlayerName"></span>
                        <span id="hudPlayerLevel"></span>
                    </div>

                    <div class="hud-bar-row">
                        <span>VIDA</span>
                        <div class="hud-bar">
                            <div id="hudHpFill"></div>
                        </div>
                        <b id="hudHpText"></b>
                    </div>

                    <div class="hud-bar-row">
                        <span>MAGIA</span>
                        <div class="hud-bar">
                            <div id="hudMagicFill"></div>
                        </div>
                        <b id="hudMagicText"></b>
                    </div>

                    <div class="hud-bar-row">
                        <span>ENERGIA</span>
                        <div class="hud-bar">
                            <div id="hudEnergyFill"></div>
                        </div>
                        <b id="hudEnergyText"></b>
                    </div>

                </div>

                <div class="runtime-hud-side">

                    <div class="hud-money">
                        🪙 <strong id="hudMoney">0</strong>
                    </div>

                    <div id="hudArea"></div>

                </div>
            `;

        }

    }


    /* =========================================================
       TOAST
       ========================================================= */

    function showToast(
        message,
        duration = 2200
    ) {

        const toast =
            $("gameToast");


        if (!toast) {

            return;

        }


        if (
            state.toastTimer
        ) {

            window.clearTimeout(
                state.toastTimer
            );

        }


        toast.textContent =
            String(
                message
            );


        toast.classList
            .remove(
                "hidden"
            );


        toast.classList
            .add(
                "show"
            );


        state.toastTimer =
            window.setTimeout(
                () => {

                    toast.classList
                        .remove(
                            "show"
                        );


                    window.setTimeout(
                        () => {

                            toast.classList
                                .add(
                                    "hidden"
                                );

                        },
                        200
                    );

                },
                duration
            );

    }


    /* =========================================================
       CANVAS
       ========================================================= */

    function resizeGameCanvas() {

        if (
            !canvas ||
            !ctx
        ) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const width =
            Math.max(
                1,
                Math.round(
                    rect.width ||
                    window.innerWidth
                )
            );


        const height =
            Math.max(
                1,
                Math.round(
                    rect.height ||
                    window.innerHeight
                )
            );


        const dpr =
            clamp(
                window.devicePixelRatio ||
                1,
                1,
                2
            );


        renderRuntime.width =
            width;


        renderRuntime.height =
            height;


        renderRuntime.dpr =
            dpr;


        const realWidth =
            Math.round(
                width *
                dpr
            );


        const realHeight =
            Math.round(
                height *
                dpr
            );


        if (
            canvas.width !==
            realWidth ||
            canvas.height !==
            realHeight
        ) {

            canvas.width =
                realWidth;


            canvas.height =
                realHeight;


            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );

        }


        if (
            renderRuntime
                .darknessCanvas
                .width !==
                realWidth ||
            renderRuntime
                .darknessCanvas
                .height !==
                realHeight
        ) {

            renderRuntime
                .darknessCanvas
                .width =
                realWidth;


            renderRuntime
                .darknessCanvas
                .height =
                realHeight;


            renderRuntime
                .darknessCtx
                .setTransform(
                    dpr,
                    0,
                    0,
                    dpr,
                    0,
                    0
                );

        }

    }


    function screenToWorld(
        x,
        y
    ) {

        return {

            x:
                x +
                state.camera.x,

            y:
                y +
                state.camera.y

        };

    }


    function worldToScreen(
        x,
        y
    ) {

        return {

            x:
                x -
                state.camera.x,

            y:
                y -
                state.camera.y

        };

    }


    /* =========================================================
       CÂMERA
       ========================================================= */

    function updateCamera(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        let worldWidth;
        let worldHeight;


        if (
            state.houseMode
        ) {

            const size =
                getHouseWorldSize(
                    state.currentHouse
                );


            worldWidth =
                size.width;


            worldHeight =
                size.height;

        }

        else {

            worldWidth =
                state.world
                    ?.width ||
                renderRuntime.width;


            worldHeight =
                state.world
                    ?.height ||
                renderRuntime.height;

        }


        const targetX =

            player.x -

            renderRuntime.width /
            2;


        const targetY =

            player.y -

            renderRuntime.height /
            2;


        state.camera.x =
            lerp(

                state.camera.x,

                clamp(
                    targetX,
                    0,
                    Math.max(
                        0,
                        worldWidth -
                        renderRuntime.width
                    )
                ),

                clamp(
                    dt *
                    8,
                    0,
                    1
                )

            );


        state.camera.y =
            lerp(

                state.camera.y,

                clamp(
                    targetY,
                    0,
                    Math.max(
                        0,
                        worldHeight -
                        renderRuntime.height
                    )
                ),

                clamp(
                    dt *
                    8,
                    0,
                    1
                )

            );

    }


    /* =========================================================
       COR AUXILIAR
       ========================================================= */

    function rgba(
        color,
        alpha
    ) {

        if (
            color.startsWith(
                "#"
            )
        ) {

            const hex =
                color.slice(
                    1
                );


            const full =

                hex.length ===
                3

                    ? hex
                        .split(
                            ""
                        )
                        .map(
                            value =>
                                value +
                                value
                        )
                        .join(
                            ""
                        )

                    : hex;


            const number =
                parseInt(
                    full,
                    16
                );


            const r =
                (
                    number >>
                    16
                ) &
                255;


            const g =
                (
                    number >>
                    8
                ) &
                255;


            const b =
                number &
                255;


            return (
                `rgba(${r},${g},${b},${alpha})`
            );

        }


        return color;

    }


    /* =========================================================
       FUNDO
       ========================================================= */

    function drawBiomeGround() {

        const biome =
            getBiomeStyle();


        const width =
            state.houseMode

                ? getHouseWorldSize()
                    .width

                : state.world
                    .width;


        const height =
            state.houseMode

                ? getHouseWorldSize()
                    .height

                : state.world
                    .height;


        ctx.fillStyle =
            biome.ground;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
            Textura simples sem alterar
            o layout aprovado.
        */
        const seed =
            hashString(
                `${state.area}:ground`
            );


        const rng =
            mulberry32(
                seed
            );


        ctx.save();


        ctx.globalAlpha =
            0.13;


        ctx.fillStyle =
            biome.groundAlt;


        for (
            let i = 0;
            i < 170;
            i++
        ) {

            const x =
                rng() *
                width;


            const y =
                rng() *
                height;


            const radius =
                3 +
                rng() *
                13;


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI *
                2
            );


            ctx.fill();

        }


        ctx.restore();


        if (
            biome.ambient
        ) {

            ctx.save();


            ctx.globalAlpha =
                biome.ambientAlpha;


            ctx.fillStyle =
                biome.ambient;


            ctx.fillRect(
                0,
                0,
                width,
                height
            );


            ctx.restore();

        }

    }


    /* =========================================================
       ESTRADAS
       ========================================================= */

    function drawPaths() {

        if (
            state.houseMode
        ) {

            return;

        }


        const style =
            getPathStyle();


        for (
            const path of
            state.world.paths
        ) {

            ctx.save();


            ctx.fillStyle =
                style.edge;


            ctx.fillRect(

                path.x -
                10,

                path.y -
                10,

                path.w +
                20,

                path.h +
                20

            );


            ctx.fillStyle =
                style.base;


            ctx.fillRect(
                path.x,
                path.y,
                path.w,
                path.h
            );


            drawPathDetails(
                path,
                style
            );


            ctx.restore();

        }

    }


    function drawPathDetails(
        path,
        style
    ) {

        const rng =
            mulberry32(
                path.detailSeed
            );


        const count =
            Math.max(
                4,
                Math.floor(
                    (
                        path.w +
                        path.h
                    ) /
                    95
                )
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const x =
                path.x +
                rng() *
                path.w;


            const y =
                path.y +
                rng() *
                path.h;


            ctx.fillStyle =
                rgba(
                    style.detail,
                    0.5
                );


            switch (
                style.type
            ) {

                case "stone":

                    ctx.fillRect(
                        x - 5,
                        y - 3,
                        10,
                        6
                    );

                    break;


                case "leaf":

                    ctx.beginPath();

                    ctx.ellipse(
                        x,
                        y,
                        6,
                        2.5,
                        rng() *
                        Math.PI,
                        0,
                        Math.PI *
                        2
                    );

                    ctx.fill();

                    break;


                case "root":

                    ctx.strokeStyle =
                        rgba(
                            style.detail,
                            0.42
                        );

                    ctx.lineWidth =
                        2;

                    ctx.beginPath();

                    ctx.moveTo(
                        x - 8,
                        y
                    );

                    ctx.quadraticCurveTo(
                        x,
                        y - 5,
                        x + 9,
                        y + 2
                    );

                    ctx.stroke();

                    break;


                case "snow":

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        3,
                        0,
                        Math.PI *
                        2
                    );

                    ctx.fill();

                    break;


                case "ore":

                case "ruby":

                    ctx.beginPath();

                    ctx.moveTo(
                        x,
                        y - 5
                    );

                    ctx.lineTo(
                        x + 4,
                        y
                    );

                    ctx.lineTo(
                        x,
                        y + 5
                    );

                    ctx.lineTo(
                        x - 4,
                        y
                    );

                    ctx.closePath();

                    ctx.fill();

                    break;


                case "rune":

                    ctx.font =
                        "11px serif";

                    ctx.fillText(
                        "◇",
                        x,
                        y
                    );

                    break;


                case "flower":

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        3,
                        0,
                        Math.PI *
                        2
                    );

                    ctx.fill();

                    break;


                case "cloud":

                    ctx.beginPath();

                    ctx.ellipse(
                        x,
                        y,
                        8,
                        3,
                        0,
                        0,
                        Math.PI *
                        2
                    );

                    ctx.fill();

                    break;


                case "ember":

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        2.5,
                        0,
                        Math.PI *
                        2
                    );

                    ctx.fill();

                    break;


                case "memory":

                    ctx.font =
                        "10px serif";

                    ctx.fillText(
                        "◊",
                        x,
                        y
                    );

                    break;

            }

        }

    }


    /* =========================================================
       OBSTÁCULOS
       ========================================================= */

    function drawObstacle(
        obstacle
    ) {

        if (
            obstacle.type ===
            "boundary"
        ) {

            return;

        }


        ctx.save();


        switch (
            obstacle.type
        ) {

            case "mazeWall":

                ctx.fillStyle =
                    "#1b1820";


                ctx.fillRect(
                    obstacle.x,
                    obstacle.y,
                    obstacle.w,
                    obstacle.h
                );


                ctx.strokeStyle =
                    "#51475b";


                ctx.lineWidth =
                    4;


                ctx.strokeRect(
                    obstacle.x + 2,
                    obstacle.y + 2,
                    obstacle.w - 4,
                    obstacle.h - 4
                );


                break;


            case "mountainRock":

                drawRockObject(
                    obstacle,
                    "#737976",
                    "#929895"
                );

                break;


            case "darkrock":

                drawRockObject(
                    obstacle,
                    "#34303e",
                    "#50485c"
                );

                break;


            case "basalt":

                drawRockObject(
                    obstacle,
                    "#392925",
                    "#5e3a32"
                );

                break;


            case "fountainBase":

                /*
                    Fonte é desenhada separadamente.
                */
                break;


            default:

                drawRockObject(
                    obstacle,
                    "#5b5650",
                    "#78716a"
                );

                break;

        }


        ctx.restore();

    }


    function drawRockObject(
        object,
        base,
        highlight
    ) {

        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,0.22)";


        ctx.beginPath();


        ctx.ellipse(

            object.x +
            object.w /
            2,

            object.y +
            object.h -
            1,

            object.w *
            0.48,

            object.h *
            0.24,

            0,
            0,
            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            base;


        ctx.beginPath();


        ctx.moveTo(
            object.x +
            object.w *
            0.1,
            object.y +
            object.h
        );


        ctx.lineTo(
            object.x,
            object.y +
            object.h *
            0.48
        );


        ctx.lineTo(
            object.x +
            object.w *
            0.28,
            object.y +
            object.h *
            0.1
        );


        ctx.lineTo(
            object.x +
            object.w *
            0.72,
            object.y
        );


        ctx.lineTo(
            object.x +
            object.w,
            object.y +
            object.h *
            0.5
        );


        ctx.lineTo(
            object.x +
            object.w *
            0.86,
            object.y +
            object.h
        );


        ctx.closePath();

        ctx.fill();


        ctx.fillStyle =
            rgba(
                highlight,
                0.5
            );


        ctx.beginPath();


        ctx.moveTo(
            object.x +
            object.w *
            0.25,
            object.y +
            object.h *
            0.25
        );


        ctx.lineTo(
            object.x +
            object.w *
            0.55,
            object.y +
            object.h *
            0.1
        );


        ctx.lineTo(
            object.x +
            object.w *
            0.42,
            object.y +
            object.h *
            0.48
        );


        ctx.closePath();

        ctx.fill();


        ctx.restore();

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function drawTree(
        tree
    ) {

        if (
            !tree.alive
        ) {

            drawTreeStump(
                tree
            );

            return;

        }


        const sway =

            Math.sin(
                state.time *
                1.5 +
                tree.swayPhase
            ) *
            2;


        const scale =
            tree.scale;


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,0.22)";


        ctx.beginPath();


        ctx.ellipse(

            tree.x,
            tree.y +
            35,

            34 *
            scale,

            12 *
            scale,

            0,
            0,
            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            "#66503b";


        ctx.fillRect(

            tree.x -
            9 *
            scale,

            tree.y -
            2,

            18 *
            scale,

            42 *
            scale

        );


        let canopy =
            "#476843";


        if (
            tree.type ===
            "ancientTree"
        ) {

            canopy =
                "#58724a";

        }


        if (
            state.area ===
            "village"
        ) {

            canopy =
                "#53764b";

        }


        ctx.fillStyle =
            canopy;


        const radius =
            tree.canopyRadius *
            scale;


        ctx.beginPath();

        ctx.arc(
            tree.x +
            sway,
            tree.y -
            28,
            radius *
            0.75,
            0,
            Math.PI *
            2
        );

        ctx.fill();


        ctx.fillStyle =
            rgba(
                "#8eaa72",
                0.45
            );


        ctx.beginPath();

        ctx.arc(
            tree.x -
            radius *
            0.25 +
            sway,
            tree.y -
            43,
            radius *
            0.38,
            0,
            Math.PI *
            2
        );

        ctx.fill();


        ctx.restore();

    }


    function drawTreeStump(
        tree
    ) {

        ctx.save();


        ctx.fillStyle =
            "#604733";


        ctx.beginPath();


        ctx.ellipse(
            tree.x,
            tree.y +
            20,
            14,
            8,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.restore();

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    function drawResource(
        resource
    ) {

        if (
            !resource.alive
        ) {

            return;

        }


        const pulse =

            1 +

            Math.sin(
                state.time *
                2.5 +
                resource.glowPhase
            ) *
            0.06;


        const color =
            getResourceColor(
                resource.type
            );


        ctx.save();


        ctx.shadowColor =
            color;


        ctx.shadowBlur =
            resource.type ===
                "rubi" ||
            resource.type ===
                "diamante" ||
            resource.type ===
                "cristal"

                ? 14

                : 3;


        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.moveTo(
            resource.x,
            resource.y -
            resource.radius *
            pulse
        );


        ctx.lineTo(
            resource.x +
            resource.radius *
            0.72 *
            pulse,
            resource.y
        );


        ctx.lineTo(
            resource.x,
            resource.y +
            resource.radius *
            pulse
        );


        ctx.lineTo(
            resource.x -
            resource.radius *
            0.72 *
            pulse,
            resource.y
        );


        ctx.closePath();

        ctx.fill();


        ctx.restore();

    }


    /* =========================================================
       CASAS EXTERNAS
       ========================================================= */

    function drawBuilding(
        building
    ) {

        const x =
            building.x;


        const y =
            building.y;


        const w =
            building.w;


        const h =
            building.h;


        ctx.save();


        /*
            Sombra.
        */
        ctx.fillStyle =
            "rgba(0,0,0,0.25)";


        ctx.beginPath();


        ctx.ellipse(
            x +
            w /
            2,
            y +
            h +
            15,
            w *
            0.5,
            30,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Parede.
        */
        ctx.fillStyle =
            building.wallColor;


        ctx.fillRect(
            x,
            y + 68,
            w,
            h - 68
        );


        /*
            Detalhes de madeira/pedra.
        */
        ctx.fillStyle =
            rgba(
                building.trimColor,
                0.5
            );


        ctx.fillRect(
            x,
            y + 70,
            12,
            h - 70
        );


        ctx.fillRect(
            x + w - 12,
            y + 70,
            12,
            h - 70
        );


        /*
            Telhado.
        */
        ctx.fillStyle =
            building.roof;


        ctx.beginPath();


        ctx.moveTo(
            x - 24,
            y + 76
        );


        ctx.lineTo(
            x +
            w /
            2,
            y
        );


        ctx.lineTo(
            x +
            w +
            24,
            y + 76
        );


        ctx.closePath();

        ctx.fill();


        ctx.fillStyle =
            rgba(
                "#ffffff",
                0.08
            );


        ctx.beginPath();


        ctx.moveTo(
            x +
            w /
            2,
            y + 8
        );


        ctx.lineTo(
            x +
            w -
            30,
            y + 70
        );


        ctx.lineTo(
            x +
            w /
            2 +
            40,
            y + 55
        );


        ctx.closePath();

        ctx.fill();


        /*
            Janelas.
        */
        drawBuildingWindow(
            x +
            w *
            0.2,
            y +
            h *
            0.5,
            building.windowColor
        );


        drawBuildingWindow(
            x +
            w *
            0.76,
            y +
            h *
            0.5,
            building.windowColor
        );


        /*
            Placa.
        */
        if (
            building.sign
        ) {

            ctx.fillStyle =
                "#4b3628";


            ctx.fillRect(
                x +
                w /
                2 -
                55,
                y +
                96,
                110,
                32
            );


            ctx.font =
                "bold 13px serif";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillStyle =
                "#ead09a";


            ctx.fillText(
                building.sign,
                x +
                w /
                2,
                y +
                112
            );

        }


        ctx.restore();


        const door =
            getBuildingDoor(
                building
            );


        if (door) {

            drawExteriorDoor(
                door
            );

        }

    }


    function drawBuildingWindow(
        x,
        y,
        color
    ) {

        ctx.save();


        ctx.shadowColor =
            color;


        ctx.shadowBlur =
            10;


        ctx.fillStyle =
            "#554330";


        ctx.fillRect(
            x - 25,
            y - 23,
            50,
            46
        );


        ctx.fillStyle =
            color;


        ctx.fillRect(
            x - 19,
            y - 17,
            38,
            34
        );


        ctx.strokeStyle =
            "#6c5338";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.moveTo(
            x,
            y - 17
        );


        ctx.lineTo(
            x,
            y + 17
        );


        ctx.moveTo(
            x - 19,
            y
        );


        ctx.lineTo(
            x + 19,
            y
        );


        ctx.stroke();


        ctx.restore();

    }


    /* =========================================================
       PORTA EXTERIOR

       Usa EXATAMENTE a geometria da Parte 2.
       ========================================================= */

    function drawExteriorDoor(
        door
    ) {

        const opening =
            clamp(
                door.animation,
                0,
                1
            );


        const visibleWidth =

            door.w *

            (
                1 -
                opening *
                0.82
            );


        ctx.save();


        /*
            Luz de dentro.
        */
        if (
            opening >
            0.03
        ) {

            const gradient =
                ctx.createRadialGradient(

                    door.centerX,
                    door.y +
                    door.h *
                    0.55,
                    2,

                    door.centerX,
                    door.y +
                    door.h *
                    0.55,
                    90

                );


            gradient.addColorStop(
                0,
                `rgba(255,205,122,${0.35 * opening})`
            );


            gradient.addColorStop(
                1,
                "rgba(255,205,122,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(

                door.centerX -
                95,

                door.y -
                20,

                190,

                door.h +
                100

            );

        }


        ctx.fillStyle =
            "#3f2d23";


        ctx.fillRect(
            door.x,
            door.y,
            door.w,
            door.h
        );


        /*
            Folha da porta.
        */
        ctx.fillStyle =
            "#765039";


        ctx.fillRect(

            door.x +
            (
                door.w -
                visibleWidth
            ) /
            2,

            door.y + 4,

            visibleWidth,

            door.h - 4

        );


        ctx.strokeStyle =
            "#38271f";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            door.x,
            door.y,
            door.w,
            door.h
        );


        if (
            opening <
            0.82
        ) {

            ctx.fillStyle =
                "#d6aa62";


            ctx.beginPath();


            ctx.arc(

                door.x +
                door.w *
                0.72,

                door.y +
                door.h *
                0.52,

                4,

                0,
                Math.PI *
                2

            );


            ctx.fill();

        }


        if (
            door.dustTimer >
            0
        ) {

            const progress =

                door.dustTimer /
                0.45;


            ctx.globalAlpha =
                progress *
                0.35;


            ctx.fillStyle =
                "#d5b17b";


            for (
                let i = 0;
                i < 5;
                i++
            ) {

                ctx.beginPath();

                ctx.arc(

                    door.centerX +
                    (
                        i -
                        2
                    ) *
                    9,

                    door.y +
                    door.h +
                    (
                        1 -
                        progress
                    ) *
                    15,

                    2 +
                    i %
                    2,

                    0,
                    Math.PI *
                    2

                );

                ctx.fill();

            }

        }


        ctx.restore();

    }


    /* =========================================================
       FONTE
       ========================================================= */

    function drawVillageFountain() {

        const fountain =
            state.world
                ?.fountain;


        if (!fountain) {

            return;

        }


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,0.24)";


        ctx.beginPath();


        ctx.ellipse(
            fountain.x,
            fountain.y +
            34,
            88,
            28,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Base de pedra.
        */
        ctx.fillStyle =
            "#817d72";


        ctx.beginPath();


        ctx.ellipse(
            fountain.x,
            fountain.y,
            78,
            56,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#555d60";


        ctx.beginPath();


        ctx.ellipse(
            fountain.x,
            fountain.y - 3,
            64,
            43,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Água.
        */
        const waterGradient =
            ctx.createRadialGradient(

                fountain.x,
                fountain.y - 8,
                4,

                fountain.x,
                fountain.y - 8,
                58

            );


        waterGradient.addColorStop(
            0,
            "#b4e6ef"
        );


        waterGradient.addColorStop(
            0.65,
            "#6da9ba"
        );


        waterGradient.addColorStop(
            1,
            "#4f8291"
        );


        ctx.fillStyle =
            waterGradient;


        ctx.beginPath();


        ctx.ellipse(
            fountain.x,
            fountain.y - 5,
            56,
            36,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Pilar.
        */
        ctx.fillStyle =
            "#8c887c";


        ctx.fillRect(
            fountain.x - 11,
            fountain.y - 90,
            22,
            78
        );


        ctx.beginPath();


        ctx.arc(
            fountain.x,
            fountain.y - 92,
            24,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Água caindo.
        */
        ctx.strokeStyle =
            "rgba(165,222,235,0.82)";


        ctx.lineWidth =
            3;


        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            const wave =
                Math.sin(
                    state.time *
                    4 +
                    i
                ) *
                2;


            ctx.beginPath();


            ctx.moveTo(
                fountain.x +
                i *
                13,
                fountain.y - 80
            );


            ctx.quadraticCurveTo(

                fountain.x +
                i *
                18 +
                wave,

                fountain.y - 42,

                fountain.x +
                i *
                25,

                fountain.y - 15

            );


            ctx.stroke();

        }


        /*
            Halo.
        */
        const glow =
            ctx.createRadialGradient(

                fountain.x,
                fountain.y - 25,
                5,

                fountain.x,
                fountain.y - 25,
                135

            );


        glow.addColorStop(
            0,
            "rgba(132,204,224,0.12)"
        );


        glow.addColorStop(
            1,
            "rgba(132,204,224,0)"
        );


        ctx.fillStyle =
            glow;


        ctx.fillRect(
            fountain.x - 140,
            fountain.y - 160,
            280,
            280
        );


        ctx.restore();

    }


    /* =========================================================
       LANDMARKS
       ========================================================= */

    function drawLandmark(
        landmark
    ) {

        if (
            landmark.type ===
            "fountain"
        ) {

            return;

        }


        ctx.save();


        switch (
            landmark.type
        ) {

            case "well":

                ctx.fillStyle =
                    "#6e6658";


                ctx.beginPath();


                ctx.arc(
                    landmark.x,
                    landmark.y,
                    35,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                ctx.fillStyle =
                    "#24292a";


                ctx.beginPath();


                ctx.arc(
                    landmark.x,
                    landmark.y - 3,
                    25,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "noticeBoard":

                ctx.fillStyle =
                    "#75553a";


                ctx.fillRect(
                    landmark.x - 36,
                    landmark.y - 25,
                    72,
                    50
                );


                ctx.fillRect(
                    landmark.x - 24,
                    landmark.y + 24,
                    8,
                    32
                );


                ctx.fillRect(
                    landmark.x + 16,
                    landmark.y + 24,
                    8,
                    32
                );

                break;


            case "arena":

                ctx.strokeStyle =
                    landmark.glow ||
                    "#ffffff";


                ctx.globalAlpha =
                    0.18 +
                    Math.sin(
                        state.time *
                        2
                    ) *
                    0.05;


                ctx.lineWidth =
                    4;


                ctx.beginPath();


                ctx.arc(
                    landmark.x,
                    landmark.y,
                    landmark.radius,
                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();

                break;

        }


        ctx.restore();

    }


    /* =========================================================
       ALTAR
       ========================================================= */

    function drawMonarchAltar() {

        const altar =
            state.world
                ?.altar;


        if (!altar) {

            return;

        }


        const pulse =

            0.5 +

            Math.sin(
                state.time *
                2.4
            ) *
            0.5;


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,0.32)";


        ctx.beginPath();


        ctx.ellipse(
            altar.x,
            altar.y + 22,
            84,
            31,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#413849";


        ctx.beginPath();


        ctx.moveTo(
            altar.x,
            altar.y - 62
        );


        ctx.lineTo(
            altar.x + 66,
            altar.y - 15
        );


        ctx.lineTo(
            altar.x + 52,
            altar.y + 48
        );


        ctx.lineTo(
            altar.x - 52,
            altar.y + 48
        );


        ctx.lineTo(
            altar.x - 66,
            altar.y - 15
        );


        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#a98bc4";


        ctx.lineWidth =
            3;


        ctx.stroke();


        ctx.shadowColor =
            "#a98bc4";


        ctx.shadowBlur =
            12 +
            pulse *
            12;


        ctx.fillStyle =
            "#a98bc4";


        ctx.font =
            "bold 42px serif";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "♛",
            altar.x,
            altar.y - 4
        );


        ctx.restore();

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function drawGate(
        gate
    ) {

        const open =
            clamp(
                gate.animation,
                0,
                1
            );


        ctx.save();


        ctx.fillStyle =
            "#514b48";


        if (
            gate.orientation ===
            "horizontal"
        ) {

            ctx.fillRect(
                gate.x,
                gate.y,
                32,
                gate.h
            );


            ctx.fillRect(
                gate.x +
                gate.w -
                32,
                gate.y,
                32,
                gate.h
            );


            const center =
                gate.x +
                gate.w /
                2;


            const half =
                (
                    gate.w -
                    64
                ) /
                2;


            ctx.fillStyle =
                "#756d65";


            ctx.fillRect(

                gate.x +
                32,

                gate.y +
                10,

                half *
                (
                    1 -
                    open
                ),

                gate.h -
                20

            );


            ctx.fillRect(

                center +
                half *
                open,

                gate.y +
                10,

                half *
                (
                    1 -
                    open
                ),

                gate.h -
                20

            );

        }

        else {

            ctx.fillRect(
                gate.x,
                gate.y,
                gate.w,
                32
            );


            ctx.fillRect(
                gate.x,
                gate.y +
                gate.h -
                32,
                gate.w,
                32
            );


            const center =
                gate.y +
                gate.h /
                2;


            const half =
                (
                    gate.h -
                    64
                ) /
                2;


            ctx.fillStyle =
                "#756d65";


            ctx.fillRect(

                gate.x + 10,

                gate.y + 32,

                gate.w - 20,

                half *
                (
                    1 -
                    open
                )

            );


            ctx.fillRect(

                gate.x + 10,

                center +
                half *
                open,

                gate.w - 20,

                half *
                (
                    1 -
                    open
                )

            );

        }


        ctx.restore();

    }


    /* =========================================================
       PORTAIS
       ========================================================= */

    function drawPortal(
        portal
    ) {

        if (
            portal.hidden ||
            !portal.active
        ) {

            return;

        }


        const pulse =
            0.5 +
            Math.sin(
                state.time *
                2.3
            ) *
            0.5;


        ctx.save();


        ctx.strokeStyle =
            portal.color ||
            "#9c86b5";


        ctx.lineWidth =
            4;


        ctx.globalAlpha =
            0.4 +
            pulse *
            0.35;


        ctx.shadowColor =
            portal.color ||
            "#9c86b5";


        ctx.shadowBlur =
            15;


        ctx.strokeRect(
            portal.x,
            portal.y,
            portal.w,
            portal.h
        );


        ctx.restore();

    }


    /* =========================================================
       NPC / PERSONAGEM BASE
       ========================================================= */

    function drawHumanoid(
        x,
        y,
        sprite,
        options = {}
    ) {

        const scale =
            options.scale ||
            sprite
                ?.scale ||
            1;


        const walk =
            options.walk ||
            0;


        const bob =
            Math.sin(
                walk
            ) *
            1.5;


        const skin =
            sprite
                ?.skin ||
            "#c99b7a";


        const hair =
            sprite
                ?.hair ||
            "#44362f";


        const body =
            sprite
                ?.body ||
            "#6d6a70";


        const trim =
            sprite
                ?.trim ||
            "#b9a989";


        ctx.save();


        /*
            Sombra.
        */
        ctx.fillStyle =
            "rgba(0,0,0,0.3)";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y + 20 * scale,
            18 * scale,
            7 * scale,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Pernas.
        */
        ctx.strokeStyle =
            "#302b2a";


        ctx.lineWidth =
            5 *
            scale;


        ctx.lineCap =
            "round";


        ctx.beginPath();


        ctx.moveTo(
            x - 5 * scale,
            y + 9 * scale
        );


        ctx.lineTo(
            x - 7 * scale +
            Math.sin(
                walk
            ) *
            3,
            y + 20 * scale
        );


        ctx.moveTo(
            x + 5 * scale,
            y + 9 * scale
        );


        ctx.lineTo(
            x + 7 * scale -
            Math.sin(
                walk
            ) *
            3,
            y + 20 * scale
        );


        ctx.stroke();


        /*
            Corpo.
        */
        ctx.fillStyle =
            body;


        ctx.beginPath();


        ctx.roundRect(

            x - 12 * scale,

            y - 6 * scale + bob,

            24 * scale,

            25 * scale,

            7 * scale

        );


        ctx.fill();


        ctx.fillStyle =
            trim;


        ctx.fillRect(
            x - 10 * scale,
            y + 6 * scale + bob,
            20 * scale,
            3 * scale
        );


        /*
            Cabeça.
        */
        ctx.fillStyle =
            skin;


        ctx.beginPath();


        ctx.arc(
            x,
            y - 15 * scale + bob,
            10.5 * scale,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Cabelo.
        */
        ctx.fillStyle =
            hair;


        ctx.beginPath();


        ctx.arc(
            x,
            y - 19 * scale + bob,
            10.2 * scale,
            Math.PI,
            Math.PI *
            2
        );


        ctx.fill();


        /*
            Olhos.
        */
        ctx.fillStyle =
            "#272326";


        ctx.beginPath();

        ctx.arc(
            x - 3.5 * scale,
            y - 14 * scale + bob,
            1.2 * scale,
            0,
            Math.PI *
            2
        );

        ctx.arc(
            x + 3.5 * scale,
            y - 14 * scale + bob,
            1.2 * scale,
            0,
            Math.PI *
            2
        );

        ctx.fill();


        ctx.restore();

    }


    /* =========================================================
       PLAYER MELHORADO
       ========================================================= */

    function drawPlayer() {

        const player =
            state.player;


        if (
            !player ||
            player.dead
        ) {

            return;

        }


        const character =
            currentCharacter();


        ctx.save();


        if (
            player.invincible >
            0 &&
            Math.floor(
                state.time *
                18
            ) %
            2 ===
            0
        ) {

            ctx.globalAlpha =
                0.58;

        }


        const resting =
            player.resting
                ?.active;


        if (
            resting
        ) {

            ctx.translate(
                player.x,
                player.y
            );


            ctx.rotate(
                0.65
            );


            drawHumanoid(
                0,
                0,
                character.sprite,
                {
                    scale:
                        character.sprite
                            .scale ||
                        1,

                    walk:
                        0
                }
            );


            ctx.restore();


            drawRestAnimation(
                player
            );


            return;

        }


        /*
            Glow da classe.
        */
        ctx.shadowColor =
            character.glow;


        ctx.shadowBlur =
            5;


        drawHumanoid(

            player.x,
            player.y,

            character.sprite,

            {
                scale:
                    character.sprite
                        .scale ||
                    1,

                walk:
                    player.walkTime
            }

        );


        drawCharacterEquipment(
            player,
            character
        );


        ctx.restore();


        drawEntityName(

            player.x,
            player.y - 43,

            player.name ||
            character.name,

            character.color,

            true

        );

    }


    function drawCharacterEquipment(
        player,
        character
    ) {

        const direction =
            facingVector(
                player.facing
            );


        ctx.save();


        ctx.translate(
            player.x,
            player.y
        );


        const weapon =
            character.sprite
                ?.weapon;


        switch (
            weapon
        ) {

            case "staff":

                ctx.strokeStyle =
                    "#725134";

                ctx.lineWidth =
                    4;

                ctx.beginPath();

                ctx.moveTo(
                    12,
                    -4
                );

                ctx.lineTo(
                    17,
                    -32
                );

                ctx.stroke();


                ctx.fillStyle =
                    "#ee9446";

                ctx.beginPath();

                ctx.arc(
                    17,
                    -34,
                    5,
                    0,
                    Math.PI *
                    2
                );

                ctx.fill();

                break;


            case "sword":

                ctx.strokeStyle =
                    "#d2d8db";

                ctx.lineWidth =
                    4;

                ctx.beginPath();

                ctx.moveTo(
                    11,
                    2
                );

                ctx.lineTo(
                    22 +
                    direction.x *
                    5,
                    -18 +
                    direction.y *
                    5
                );

                ctx.stroke();

                break;


            case "club":

                ctx.strokeStyle =
                    "#725d42";

                ctx.lineWidth =
                    7;

                ctx.beginPath();

                ctx.moveTo(
                    12,
                    4
                );

                ctx.lineTo(
                    21,
                    -18
                );

                ctx.stroke();

                break;


            case "wand":

                ctx.strokeStyle =
                    "#f0c2df";

                ctx.lineWidth =
                    3;

                ctx.beginPath();

                ctx.moveTo(
                    12,
                    0
                );

                ctx.lineTo(
                    20,
                    -20
                );

                ctx.stroke();


                ctx.fillStyle =
                    "#f5d8ee";

                ctx.font =
                    "12px serif";

                ctx.fillText(
                    "✦",
                    17,
                    -20
                );

                break;


            case "blade":

                ctx.strokeStyle =
                    "#aa82d4";

                ctx.lineWidth =
                    4;

                ctx.beginPath();

                ctx.moveTo(
                    10,
                    2
                );

                ctx.lineTo(
                    22,
                    -17
                );

                ctx.stroke();

                break;

        }


        if (
            character.sprite
                ?.wings
        ) {

            ctx.strokeStyle =
                "rgba(244,192,229,0.7)";

            ctx.lineWidth =
                2;

            ctx.beginPath();

            ctx.ellipse(
                -13,
                -7,
                7,
                13,
                -0.5,
                0,
                Math.PI *
                2
            );

            ctx.ellipse(
                13,
                -7,
                7,
                13,
                0.5,
                0,
                Math.PI *
                2
            );

            ctx.stroke();

        }


        ctx.restore();

    }


    function drawRestAnimation(
        player
    ) {

        const timer =
            player.resting
                ?.timer ||
            0;


        ctx.save();


        ctx.font =
            "bold 18px serif";


        ctx.fillStyle =
            "rgba(236,231,211,0.8)";


        const rise =

            (
                GAME_CONFIG
                    .restAnimationSeconds -
                timer
            ) *
            8;


        ctx.fillText(
            "Z",
            player.x + 16,
            player.y - 32 - rise
        );


        ctx.globalAlpha =
            0.55;


        ctx.font =
            "14px serif";


        ctx.fillText(
            "z",
            player.x + 29,
            player.y - 45 - rise
        );


        ctx.restore();

    }


    /* =========================================================
       NPCs
       ========================================================= */

    function drawNPC(
        npc
    ) {

        drawHumanoid(

            npc.x,
            npc.y,

            {
                skin:
                    "#c89d7e",

                hair:
                    "#51443a",

                body:
                    npc.color,

                trim:
                    "#d1bb91",

                scale:
                    0.98
            },

            {
                walk:
                    npc.walkPhase
            }

        );


        drawEntityName(
            npc.x,
            npc.y - 42,
            npc.name,
            npc.color
        );

    }


    /* =========================================================
       INIMIGOS NORMAIS
       ========================================================= */

    function drawEnemy(
        enemy
    ) {

        if (
            enemy.dead
        ) {

            return;

        }


        if (
            enemy.type ===
                "progression" ||
            enemy.bossType ===
                "resourceBoss"
        ) {

            drawBoss(
                enemy
            );

            return;

        }


        ctx.save();


        if (
            enemy.hitFlash >
            0
        ) {

            ctx.shadowColor =
                "#ffffff";


            ctx.shadowBlur =
                14;

        }


        switch (
            enemy.spriteType
        ) {

            case "wolf":

                drawWolf(
                    enemy
                );

                break;


            case "boar":

                drawBoar(
                    enemy
                );

                break;


            case "spider":

                drawSpider(
                    enemy
                );

                break;


            case "scorpion":

                drawScorpion(
                    enemy
                );

                break;


            case "bat":

                drawBat(
                    enemy
                );

                break;


            case "stoneCrawler":
            case "mineCrawler":

                drawStoneEnemy(
                    enemy
                );

                break;


            case "rubyHound":
            case "lavaHound":

                drawHound(
                    enemy
                );

                break;


            case "fairySpirit":
            case "brokenSeraph":
            case "windLancer":
            case "skyWatcher":
            case "fallenSeraph":

                drawSpiritEnemy(
                    enemy
                );

                break;


            default:

                drawGenericEnemy(
                    enemy
                );

                break;

        }


        ctx.restore();


        drawEntityName(

            enemy.x,

            enemy.y -
            VISUAL_CONFIG
                .enemy
                .nameOffsetY,

            enemy.name,

            enemy.color

        );


        drawSmallEnemyHealth(
            enemy
        );

    }


    function drawAnimalShadow(
        enemy,
        width,
        height
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.28)";


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y + 15,
            width,
            height,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawWolf(
        enemy
    ) {

        const run =

            Math.sin(
                enemy.animationTime *
                10
            ) *
            3;


        drawAnimalShadow(
            enemy,
            24,
            7
        );


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y,
            24,
            13,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            enemy.x + 21,
            enemy.y - 5,
            11,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            enemy.x + 16,
            enemy.y - 13
        );


        ctx.lineTo(
            enemy.x + 19,
            enemy.y - 25
        );


        ctx.lineTo(
            enemy.x + 25,
            enemy.y - 13
        );


        ctx.fill();


        ctx.strokeStyle =
            "#4d433d";


        ctx.lineWidth =
            4;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 15,
            enemy.y + 6
        );


        ctx.lineTo(
            enemy.x - 17 + run,
            enemy.y + 21
        );


        ctx.moveTo(
            enemy.x + 6,
            enemy.y + 7
        );


        ctx.lineTo(
            enemy.x + 8 - run,
            enemy.y + 21
        );


        ctx.stroke();


        ctx.fillStyle =
            "#e5b969";


        ctx.beginPath();


        ctx.arc(
            enemy.x + 24,
            enemy.y - 6,
            2,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawBoar(
        enemy
    ) {

        drawAnimalShadow(
            enemy,
            27,
            8
        );


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y,
            28,
            16,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            enemy.x + 23,
            enemy.y + 1,
            12,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#e2d6b8";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x + 27,
            enemy.y + 5
        );


        ctx.lineTo(
            enemy.x + 35,
            enemy.y + 10
        );


        ctx.moveTo(
            enemy.x + 26,
            enemy.y + 2
        );


        ctx.lineTo(
            enemy.x + 35,
            enemy.y - 2
        );


        ctx.stroke();

    }


    function drawSpider(
        enemy
    ) {

        drawAnimalShadow(
            enemy,
            20,
            6
        );


        ctx.strokeStyle =
            enemy.color;


        ctx.lineWidth =
            3;


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const offset =
                (
                    i -
                    1.5
                ) *
                6;


            ctx.beginPath();


            ctx.moveTo(
                enemy.x - 8,
                enemy.y + offset
            );


            ctx.lineTo(
                enemy.x - 24,
                enemy.y + offset * 1.8
            );


            ctx.moveTo(
                enemy.x + 8,
                enemy.y + offset
            );


            ctx.lineTo(
                enemy.x + 24,
                enemy.y + offset * 1.8
            );


            ctx.stroke();

        }


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            13,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#d8a3bc";


        ctx.beginPath();


        ctx.arc(
            enemy.x - 4,
            enemy.y - 4,
            2,
            0,
            Math.PI *
            2
        );


        ctx.arc(
            enemy.x + 4,
            enemy.y - 4,
            2,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawScorpion(
        enemy
    ) {

        drawAnimalShadow(
            enemy,
            21,
            6
        );


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y,
            18,
            11,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            enemy.color;


        ctx.lineWidth =
            5;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 14,
            enemy.y
        );


        ctx.quadraticCurveTo(
            enemy.x - 30,
            enemy.y - 20,
            enemy.x - 14,
            enemy.y - 30
        );


        ctx.stroke();


        ctx.fillStyle =
            "#b58cab";


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 14,
            enemy.y - 34
        );


        ctx.lineTo(
            enemy.x - 8,
            enemy.y - 27
        );


        ctx.lineTo(
            enemy.x - 18,
            enemy.y - 26
        );


        ctx.closePath();

        ctx.fill();

    }


    function drawBat(
        enemy
    ) {

        const flap =

            Math.sin(
                enemy.animationTime *
                13
            ) *
            8;


        drawAnimalShadow(
            enemy,
            20,
            5
        );


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            9,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 7,
            enemy.y
        );


        ctx.lineTo(
            enemy.x - 27,
            enemy.y - 10 - flap
        );


        ctx.lineTo(
            enemy.x - 20,
            enemy.y + 9
        );


        ctx.closePath();

        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            enemy.x + 7,
            enemy.y
        );


        ctx.lineTo(
            enemy.x + 27,
            enemy.y - 10 - flap
        );


        ctx.lineTo(
            enemy.x + 20,
            enemy.y + 9
        );


        ctx.closePath();

        ctx.fill();

    }


    function drawStoneEnemy(
        enemy
    ) {

        drawAnimalShadow(
            enemy,
            23,
            7
        );


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 21,
            enemy.y + 12
        );


        ctx.lineTo(
            enemy.x - 15,
            enemy.y - 14
        );


        ctx.lineTo(
            enemy.x + 5,
            enemy.y - 21
        );


        ctx.lineTo(
            enemy.x + 23,
            enemy.y - 5
        );


        ctx.lineTo(
            enemy.x + 17,
            enemy.y + 15
        );


        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            rgba(
                "#d7d1c4",
                0.35
            );


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 8,
            enemy.y - 10
        );


        ctx.lineTo(
            enemy.x + 4,
            enemy.y + 6
        );


        ctx.lineTo(
            enemy.x + 13,
            enemy.y - 4
        );


        ctx.stroke();

    }


    function drawHound(
        enemy
    ) {

        drawWolf(
            enemy
        );


        ctx.save();


        ctx.shadowColor =
            enemy.color;


        ctx.shadowBlur =
            18;


        ctx.strokeStyle =
            rgba(
                "#ff9a72",
                0.7
            );


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.radius +
            5,
            0,
            Math.PI *
            2
        );


        ctx.stroke();


        ctx.restore();

    }


    function drawSpiritEnemy(
        enemy
    ) {

        const float =

            Math.sin(
                enemy.animationTime *
                3
            ) *
            5;


        ctx.save();


        ctx.globalAlpha =
            0.85;


        ctx.shadowColor =
            enemy.color;


        ctx.shadowBlur =
            15;


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y - 7 + float,
            13,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 13,
            enemy.y + float
        );


        ctx.lineTo(
            enemy.x - 5,
            enemy.y + 26 + float
        );


        ctx.lineTo(
            enemy.x,
            enemy.y + 18 + float
        );


        ctx.lineTo(
            enemy.x + 7,
            enemy.y + 27 + float
        );


        ctx.lineTo(
            enemy.x + 13,
            enemy.y + float
        );


        ctx.closePath();

        ctx.fill();


        ctx.restore();

    }


    function drawGenericEnemy(
        enemy
    ) {

        drawAnimalShadow(
            enemy,
            enemy.radius,
            enemy.radius *
            0.35
        );


        ctx.fillStyle =
            enemy.color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.radius,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    /* =========================================================
       BOSS
       ========================================================= */

    function drawBoss(
        enemy
    ) {

        const definition =
            getBossDefinition(
                enemy.id
            );


        const color =
            definition
                ?.color ||
            enemy.color;


        const aura =
            definition
                ?.aura ||
            enemy.aura ||
            color;


        const pulse =

            1 +

            Math.sin(
                enemy.animationTime *
                2.6
            ) *
            0.035;


        const scale =
            VISUAL_CONFIG
                .boss
                .scale;


        ctx.save();


        /*
            Aura.
        */
        const auraGradient =
            ctx.createRadialGradient(

                enemy.x,
                enemy.y,
                enemy.radius *
                0.3,

                enemy.x,
                enemy.y,
                enemy.radius *
                2.5

            );


        auraGradient.addColorStop(
            0,
            rgba(
                aura,
                0.2
            )
        );


        auraGradient.addColorStop(
            1,
            rgba(
                aura,
                0
            )
        );


        ctx.fillStyle =
            auraGradient;


        ctx.fillRect(

            enemy.x -
            enemy.radius *
            3,

            enemy.y -
            enemy.radius *
            3,

            enemy.radius *
            6,

            enemy.radius *
            6

        );


        /*
            Sombra grande.
        */
        ctx.fillStyle =
            "rgba(0,0,0,0.38)";


        ctx.beginPath();


        ctx.ellipse(

            enemy.x,
            enemy.y +
            enemy.radius *
            0.7,

            enemy.radius *
            1.25,

            enemy.radius *
            0.42,

            0,
            0,
            Math.PI *
            2

        );


        ctx.fill();


        ctx.shadowColor =
            aura;


        ctx.shadowBlur =
            12;


        switch (
            enemy.bodyStyle
        ) {

            case "roadSentinel":

                drawRoadSentinelBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "forestBeast":

                drawForestBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "groveHeart":

                drawGroveBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "mountainTitan":

                drawTitanBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "ironColossus":

                drawIronBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "rubyChimera":

                drawRubyBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "monarch":

                drawMonarchBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "shadowLord":

                drawShadowBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "fairyGuardian":

                drawFairyGuardianBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "pathGuardian":

                drawSkyGuardianBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "hellGuardian":

                drawHellGuardianBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            case "mirrorSelf":

                drawMirrorBoss(
                    enemy,
                    pulse
                );

                break;


            case "ancientDeer":

                drawAncientDeerBoss(
                    enemy,
                    color,
                    pulse
                );

                break;


            default:

                drawGenericBossBody(
                    enemy,
                    color,
                    pulse
                );

                break;

        }


        ctx.restore();


        drawEntityName(

            enemy.x,

            enemy.y -
            Math.max(
                76,
                enemy.radius *
                1.55
            ),

            enemy.name,

            aura,

            true

        );


        /*
            Ícone representativo.
        */
        ctx.save();


        ctx.font =
            "22px serif";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            enemy.icon ||
            "◆",
            enemy.x,
            enemy.y -
            enemy.radius *
            0.3
        );


        ctx.restore();


        if (
            enemy.bossType ===
            "resourceBoss"
        ) {

            drawSmallEnemyHealth(
                enemy,
                92
            );

        }

    }


    function drawGenericBossBody(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            enemy.radius *
            pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawRoadSentinelBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.fillRect(
            enemy.x - 28,
            enemy.y - 25,
            56,
            68
        );


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y - 43,
            25 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#c8ae82";


        ctx.lineWidth =
            7;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x + 25,
            enemy.y - 5
        );


        ctx.lineTo(
            enemy.x + 55,
            enemy.y - 45
        );


        ctx.stroke();

    }


    function drawForestBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y,
            52 * pulse,
            38 * pulse,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#756044";


        ctx.lineWidth =
            8;


        for (
            const side of
            [-1, 1]
        ) {

            ctx.beginPath();


            ctx.moveTo(
                enemy.x +
                side *
                25,
                enemy.y - 22
            );


            ctx.lineTo(
                enemy.x +
                side *
                45,
                enemy.y - 58
            );


            ctx.lineTo(
                enemy.x +
                side *
                62,
                enemy.y - 70
            );


            ctx.stroke();

        }

    }


    function drawGroveBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.strokeStyle =
            "#66523a";


        ctx.lineWidth =
            12;


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const angle =

                i /
                5 *
                Math.PI *
                2;


            ctx.beginPath();


            ctx.moveTo(
                enemy.x,
                enemy.y
            );


            ctx.lineTo(

                enemy.x +
                Math.cos(
                    angle
                ) *
                72,

                enemy.y +
                Math.sin(
                    angle
                ) *
                72

            );


            ctx.stroke();

        }


        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            45 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawTitanBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 42,
            enemy.y + 46
        );


        ctx.lineTo(
            enemy.x - 50,
            enemy.y - 18
        );


        ctx.lineTo(
            enemy.x - 20,
            enemy.y - 56
        );


        ctx.lineTo(
            enemy.x + 30,
            enemy.y - 48
        );


        ctx.lineTo(
            enemy.x + 51,
            enemy.y + 30
        );


        ctx.lineTo(
            enemy.x + 25,
            enemy.y + 50
        );


        ctx.closePath();

        ctx.fill();


        ctx.fillStyle =
            "#cbd5d3";


        ctx.beginPath();


        ctx.arc(
            enemy.x - 13,
            enemy.y - 15,
            4,
            0,
            Math.PI *
            2
        );


        ctx.arc(
            enemy.x + 14,
            enemy.y - 15,
            4,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawIronBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.fillRect(
            enemy.x - 45,
            enemy.y - 45,
            90,
            95
        );


        ctx.fillStyle =
            "#797d80";


        ctx.fillRect(
            enemy.x - 55,
            enemy.y - 30,
            18,
            65
        );


        ctx.fillRect(
            enemy.x + 37,
            enemy.y - 30,
            18,
            65
        );


        ctx.strokeStyle =
            "#bbb7aa";


        ctx.lineWidth =
            4;


        ctx.strokeRect(
            enemy.x - 33,
            enemy.y - 33,
            66,
            65
        );

    }


    function drawRubyBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y + 8,
            52,
            36,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        for (
            const offset of
            [-25, 0, 25]
        ) {

            ctx.beginPath();


            ctx.arc(
                enemy.x + offset,
                enemy.y - 38,
                21 * pulse,
                0,
                Math.PI *
                2
            );


            ctx.fill();

        }


        ctx.fillStyle =
            "#ed8796";


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            ctx.beginPath();


            ctx.moveTo(
                enemy.x -
                35 +
                i *
                17,
                enemy.y + 2
            );


            ctx.lineTo(
                enemy.x -
                29 +
                i *
                17,
                enemy.y - 26
            );


            ctx.lineTo(
                enemy.x -
                21 +
                i *
                17,
                enemy.y + 2
            );


            ctx.fill();

        }

    }


    function drawMonarchBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 40,
            enemy.y + 52
        );


        ctx.lineTo(
            enemy.x - 28,
            enemy.y - 20
        );


        ctx.lineTo(
            enemy.x,
            enemy.y - 55
        );


        ctx.lineTo(
            enemy.x + 28,
            enemy.y - 20
        );


        ctx.lineTo(
            enemy.x + 40,
            enemy.y + 52
        );


        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#b595cf";


        ctx.lineWidth =
            5;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 27,
            enemy.y - 50
        );


        ctx.lineTo(
            enemy.x - 18,
            enemy.y - 77
        );


        ctx.lineTo(
            enemy.x,
            enemy.y - 58
        );


        ctx.lineTo(
            enemy.x + 18,
            enemy.y - 77
        );


        ctx.lineTo(
            enemy.x + 27,
            enemy.y - 50
        );


        ctx.stroke();


        ctx.fillStyle =
            "#c7a5de";


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y - 25,
            7 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    function drawShadowBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.save();


        ctx.globalAlpha =
            0.88;


        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y - 18,
            34 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 34,
            enemy.y
        );


        ctx.lineTo(
            enemy.x - 20,
            enemy.y + 58
        );


        ctx.lineTo(
            enemy.x,
            enemy.y + 42
        );


        ctx.lineTo(
            enemy.x + 19,
            enemy.y + 60
        );


        ctx.lineTo(
            enemy.x + 34,
            enemy.y
        );


        ctx.closePath();

        ctx.fill();


        ctx.restore();

    }


    function drawFairyGuardianBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y - 10,
            30 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#f4c4e7";


        ctx.lineWidth =
            4;


        for (
            const side of
            [-1, 1]
        ) {

            ctx.beginPath();


            ctx.ellipse(

                enemy.x +
                side *
                34,

                enemy.y,

                22,

                47,

                side *
                0.45,

                0,

                Math.PI *
                2

            );


            ctx.stroke();

        }

    }


    function drawSkyGuardianBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y - 10,
            33 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#e7deb2";


        ctx.lineWidth =
            6;


        for (
            const side of
            [-1, 1]
        ) {

            ctx.beginPath();


            ctx.moveTo(
                enemy.x +
                side *
                18,
                enemy.y
            );


            ctx.quadraticCurveTo(

                enemy.x +
                side *
                65,

                enemy.y - 55,

                enemy.x +
                side *
                78,

                enemy.y + 10

            );


            ctx.stroke();

        }


        ctx.strokeStyle =
            "#f5edc9";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y - 60,
            27,
            8,
            0,
            0,
            Math.PI *
            2
        );


        ctx.stroke();

    }


    function drawHellGuardianBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.moveTo(
            enemy.x - 42,
            enemy.y + 52
        );


        ctx.lineTo(
            enemy.x - 35,
            enemy.y - 32
        );


        ctx.lineTo(
            enemy.x,
            enemy.y - 57
        );


        ctx.lineTo(
            enemy.x + 35,
            enemy.y - 32
        );


        ctx.lineTo(
            enemy.x + 42,
            enemy.y + 52
        );


        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#d85a3a";


        ctx.lineWidth =
            6;


        for (
            const side of
            [-1, 1]
        ) {

            ctx.beginPath();


            ctx.moveTo(
                enemy.x +
                side *
                22,
                enemy.y - 38
            );


            ctx.lineTo(
                enemy.x +
                side *
                45,
                enemy.y - 72
            );


            ctx.stroke();

        }

    }


    function drawMirrorBoss(
        enemy,
        pulse
    ) {

        const character =
            currentCharacter();


        ctx.save();


        ctx.globalAlpha =
            0.84;


        drawHumanoid(

            enemy.x,
            enemy.y,

            character.sprite,

            {
                scale:
                    1.85,

                walk:
                    enemy.animationTime *
                    5
            }

        );


        ctx.strokeStyle =
            character.color;


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.arc(
            enemy.x,
            enemy.y,
            52 * pulse,
            0,
            Math.PI *
            2
        );


        ctx.stroke();


        ctx.restore();

    }


    function drawAncientDeerBoss(
        enemy,
        color,
        pulse
    ) {

        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.ellipse(
            enemy.x,
            enemy.y + 8,
            42,
            25,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            enemy.x + 38,
            enemy.y - 13,
            18,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#b8aa80";


        ctx.lineWidth =
            5;


        for (
            const side of
            [-1, 1]
        ) {

            ctx.beginPath();


            ctx.moveTo(
                enemy.x + 36,
                enemy.y - 27
            );


            ctx.lineTo(
                enemy.x +
                36 +
                side *
                15,
                enemy.y - 52
            );


            ctx.lineTo(
                enemy.x +
                36 +
                side *
                28,
                enemy.y - 66
            );


            ctx.stroke();

        }

    }


    /* =========================================================
       NOMES
       ========================================================= */

    function drawEntityName(
        x,
        y,
        text,
        color,
        important = false
    ) {

        ctx.save();


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.font =

            important

                ? "bold 13px serif"

                : "bold 11px serif";


        const width =
            ctx.measureText(
                text
            ).width +
            16;


        ctx.fillStyle =
            "rgba(13,12,15,0.72)";


        ctx.beginPath();


        ctx.roundRect(
            x -
            width /
            2,
            y - 10,
            width,
            20,
            7
        );


        ctx.fill();


        ctx.fillStyle =
            color ||
            "#eeeeee";


        ctx.fillText(
            text,
            x,
            y
        );


        ctx.restore();

    }


    function drawSmallEnemyHealth(
        enemy,
        width = 55
    ) {

        if (
            enemy.hp >=
            enemy.maxHp
        ) {

            return;

        }


        const ratio =
            clamp(
                enemy.hp /
                enemy.maxHp,
                0,
                1
            );


        const y =
            enemy.y -
            enemy.radius -
            20;


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,0.65)";


        ctx.fillRect(
            enemy.x -
            width /
            2,
            y,
            width,
            5
        );


        ctx.fillStyle =
            "#a84c4e";


        ctx.fillRect(
            enemy.x -
            width /
            2,
            y,
            width *
            ratio,
            5
        );


        ctx.restore();

    }


    /* =========================================================
       PROJÉTEIS
       ========================================================= */

    function drawProjectiles() {

        for (
            const projectile of
            state.world
                ?.projectiles ||
            []
        ) {

            ctx.save();


            ctx.shadowColor =
                projectile.color;


            ctx.shadowBlur =
                13;


            ctx.fillStyle =
                projectile.color;


            ctx.beginPath();


            ctx.arc(
                projectile.x,
                projectile.y,
                projectile.radius,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }


        for (
            const projectile of
            state.world
                ?.enemyProjectiles ||
            []
        ) {

            ctx.save();


            ctx.shadowColor =
                projectile.color;


            ctx.shadowBlur =
                10;


            ctx.fillStyle =
                projectile.color;


            ctx.beginPath();


            ctx.arc(
                projectile.x,
                projectile.y,
                projectile.radius,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }

    }


    /* =========================================================
       PARTÍCULAS
       ========================================================= */

    function drawParticles() {

        for (
            const particle of
            state.world
                ?.particles ||
            []
        ) {

            const alpha =
                clamp(
                    particle.life /
                    Math.max(
                        0.01,
                        particle.maxLife
                    ),
                    0,
                    1
                );


            ctx.save();


            ctx.globalAlpha =
                alpha;


            ctx.fillStyle =
                particle.color;


            ctx.beginPath();


            ctx.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }

    }


    /* =========================================================
       EFEITOS
       ========================================================= */

    function drawGameplayEffects() {

        for (
            const effect of
            state.world
                ?.effects ||
            []
        ) {

            drawGameplayEffect(
                effect
            );

        }

    }


    function drawGameplayEffect(
        effect
    ) {

        const duration =
            Math.max(
                0.001,
                finiteNumber(
                    effect.duration,
                    1
                )
            );


        const lifeRatio =
            Number.isFinite(
                effect.timer
            )
                ? clamp(
                    effect.timer /
                    duration,
                    0,
                    1
                )
                : 1;


        ctx.save();


        switch (
            effect.type
        ) {

            case "groundRing":

                ctx.globalAlpha =
                    lifeRatio;


                ctx.strokeStyle =
                    effect.color;


                ctx.lineWidth =
                    4;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,
                    effect.radius *
                    (
                        1.2 -
                        lifeRatio *
                        0.2
                    ),
                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();

                break;


            case "chargeTelegraph":

                ctx.globalAlpha =
                    0.25 +
                    (
                        1 -
                        lifeRatio
                    ) *
                    0.55;


                ctx.strokeStyle =
                    effect.color;


                ctx.lineWidth =
                    6;


                ctx.setLineDash(
                    [
                        12,
                        10
                    ]
                );


                ctx.beginPath();


                ctx.moveTo(
                    effect.x,
                    effect.y
                );


                ctx.lineTo(

                    effect.x +
                    effect.directionX *
                    effect.length,

                    effect.y +
                    effect.directionY *
                    effect.length

                );


                ctx.stroke();

                break;


            case "delayedEnemyArea":

            case "delayedPlayerArea":

                ctx.globalAlpha =
                    0.22 +
                    (
                        1 -
                        lifeRatio
                    ) *
                    0.35;


                ctx.strokeStyle =
                    effect.color;


                ctx.lineWidth =
                    3;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,
                    effect.radius,
                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();


                if (
                    effect.innerRadius >
                    0
                ) {

                    ctx.beginPath();


                    ctx.arc(
                        effect.x,
                        effect.y,
                        effect.innerRadius,
                        0,
                        Math.PI *
                        2
                    );


                    ctx.stroke();

                }

                break;


            case "arc":
            case "heavyArc":
            case "riftSlash":

                drawSlashEffect(
                    effect,
                    lifeRatio
                );

                break;


            case "afterimage":

                ctx.globalAlpha =
                    lifeRatio *
                    0.28;


                ctx.fillStyle =
                    effect.color;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,
                    17,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "floatingText":

                ctx.globalAlpha =
                    lifeRatio;


                ctx.fillStyle =
                    effect.color;


                ctx.font =
                    "bold 16px serif";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    effect.text,
                    effect.x,
                    effect.y -
                    (
                        1 -
                        lifeRatio
                    ) *
                    28
                );

                break;


            case "attackFlash":

                ctx.globalAlpha =
                    lifeRatio *
                    0.7;


                ctx.fillStyle =
                    effect.color;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,
                    effect.radius *
                    (
                        1.4 -
                        lifeRatio *
                        0.4
                    ),
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "vitalLight":

                ctx.globalAlpha =
                    lifeRatio *
                    0.35;


                ctx.fillStyle =
                    "#f3b6df";


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,
                    60 *
                    (
                        1 -
                        lifeRatio +
                        0.4
                    ),
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "rest":

                ctx.globalAlpha =
                    lifeRatio *
                    0.25;


                ctx.strokeStyle =
                    "#e9d9ac";


                ctx.lineWidth =
                    2;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,
                    35,
                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();

                break;


            case "memoryFlute":

                ctx.globalAlpha =
                    lifeRatio;


                ctx.font =
                    "20px serif";


                ctx.fillStyle =
                    "#f0e0ad";


                ctx.fillText(
                    "♪",
                    effect.x - 30,
                    effect.y - 50 -
                    (
                        1 -
                        lifeRatio
                    ) *
                    40
                );


                ctx.fillText(
                    "♫",
                    effect.x + 24,
                    effect.y - 65 -
                    (
                        1 -
                        lifeRatio
                    ) *
                    35
                );

                break;

        }


        ctx.restore();

    }


    function drawSlashEffect(
        effect,
        lifeRatio
    ) {

        const angle =
            Math.atan2(
                effect.directionY,
                effect.directionX
            );


        ctx.save();


        ctx.translate(
            effect.x,
            effect.y
        );


        ctx.rotate(
            angle
        );


        ctx.globalAlpha =
            lifeRatio;


        ctx.strokeStyle =
            effect.color;


        ctx.lineWidth =
            effect.type ===
            "heavyArc"
                ? 8
                : 5;


        ctx.beginPath();


        ctx.arc(
            0,
            effect.offset ||
            0,
            effect.range *
            0.7,
            -effect.arc /
            2,
            effect.arc /
            2
        );


        ctx.stroke();


        ctx.restore();

    }


    /* =========================================================
       BLOOD MARKS
       ========================================================= */

    function drawBloodMarks() {

        for (
            const mark of
            state.bloodMarks
        ) {

            const alpha =
                clamp(
                    mark.life /
                    mark.maxLife,
                    0,
                    1
                );


            ctx.save();


            ctx.translate(
                mark.x,
                mark.y
            );


            ctx.rotate(
                mark.angle
            );


            ctx.globalAlpha =
                alpha *
                0.7;


            ctx.fillStyle =
                "#74272d";


            ctx.beginPath();


            ctx.ellipse(
                0,
                0,
                mark.radius *
                mark.stretch,
                mark.radius,
                0,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }

    }


    /* =========================================================
       INTERIOR
       ========================================================= */

    function drawHouseInterior() {

        const spec =
            getHouseSpec(
                state.currentHouse
            );


        if (!spec) {

            return;

        }


        const room =
            spec.room;


        const theme =
            spec.theme;


        ctx.fillStyle =
            "#191619";


        const size =
            getHouseWorldSize(
                state.currentHouse
            );


        ctx.fillRect(
            0,
            0,
            size.width,
            size.height
        );


        /*
            Parede.
        */
        ctx.fillStyle =
            theme.wall;


        ctx.fillRect(
            room.x,
            room.y,
            room.w,
            room.h
        );


        /*
            Piso.
        */
        ctx.fillStyle =
            theme.floor;


        ctx.fillRect(
            room.x + 18,
            room.y + 88,
            room.w - 36,
            room.h - 106
        );


        /*
            Tábuas.
        */
        ctx.strokeStyle =
            rgba(
                theme.floorAlt,
                0.55
            );


        ctx.lineWidth =
            2;


        for (
            let y =
                room.y +
                100;
            y <
                room.y +
                room.h -
                15;
            y +=
                26
        ) {

            ctx.beginPath();


            ctx.moveTo(
                room.x + 20,
                y
            );


            ctx.lineTo(
                room.x +
                room.w -
                20,
                y
            );


            ctx.stroke();

        }


        /*
            Borda.
        */
        ctx.strokeStyle =
            theme.trim;


        ctx.lineWidth =
            8;


        ctx.strokeRect(
            room.x,
            room.y,
            room.w,
            room.h
        );


        drawInteriorLighting(
            spec
        );


        for (
            const furniture of
            spec.furniture
        ) {

            drawFurniture(
                furniture,
                theme
            );

        }


        drawInteriorDoor(
            spec
        );


        for (
            const npc of
            getHouseInteriorNPCs(
                state.currentHouse
            )
        ) {

            drawNPC(
                npc
            );

        }

    }


    function drawInteriorLighting(
        spec
    ) {

        const theme =
            spec.theme;


        const room =
            spec.room;


        const gradient =
            ctx.createRadialGradient(

                room.x +
                room.w /
                2,

                room.y +
                room.h /
                2,

                20,

                room.x +
                room.w /
                2,

                room.y +
                room.h /
                2,

                room.w *
                0.6

            );


        gradient.addColorStop(
            0,
            rgba(
                theme.light,
                0.13
            )
        );


        gradient.addColorStop(
            1,
            rgba(
                theme.light,
                0
            )
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            room.x,
            room.y,
            room.w,
            room.h
        );

    }


    function drawInteriorDoor(
        spec
    ) {

        const door =
            spec.door;


        ctx.fillStyle =
            "#3a2921";


        ctx.fillRect(
            door.x,
            door.y,
            door.w,
            door.h
        );


        ctx.fillStyle =
            "#75513a";


        ctx.fillRect(
            door.x + 6,
            door.y,
            door.w - 12,
            door.h
        );

    }


    function drawFurniture(
        object,
        theme
    ) {

        ctx.save();


        switch (
            object.type
        ) {

            case "bed":
            case "cloudBed":

                ctx.fillStyle =
                    object.type ===
                    "cloudBed"
                        ? "#e1ecec"
                        : "#634b3c";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.fillStyle =
                    object.type ===
                    "cloudBed"
                        ? "#f5f4df"
                        : "#b48f78";


                ctx.fillRect(
                    object.x + 8,
                    object.y + 7,
                    object.w - 16,
                    object.h - 14
                );


                break;


            case "table":
            case "rootTable":
            case "altarTable":
            case "obsidianTable":
            case "candleTable":

                ctx.fillStyle =
                    object.type ===
                    "obsidianTable"
                        ? "#2e2930"
                        : "#684c35";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                break;


            case "chair":
            case "stool":

                ctx.fillStyle =
                    "#60462f";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                break;


            case "bookshelf":
            case "shelf":
            case "flowerShelf":
            case "herbRack":
            case "supplyRack":

                ctx.fillStyle =
                    "#5c412d";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.fillStyle =
                    theme.accent;


                for (
                    let x =
                        object.x +
                        8;
                    x <
                        object.x +
                        object.w -
                        8;
                    x +=
                        16
                ) {

                    ctx.fillRect(
                        x,
                        object.y + 7,
                        8,
                        object.h - 14
                    );

                }


                break;


            case "counter":
            case "workbench":
            case "sawTable":

                ctx.fillStyle =
                    "#68482f";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.fillStyle =
                    "#96704b";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    10
                );


                break;


            case "forge":

                ctx.fillStyle =
                    "#323234";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.shadowColor =
                    "#ff713b";


                ctx.shadowBlur =
                    18;


                ctx.fillStyle =
                    "#ef6735";


                ctx.beginPath();


                ctx.arc(
                    object.x +
                    object.w /
                    2,
                    object.y +
                    object.h *
                    0.62,
                    25,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                break;


            case "anvil":

                ctx.fillStyle =
                    "#4b4f51";


                ctx.fillRect(
                    object.x + 12,
                    object.y + 20,
                    object.w - 24,
                    object.h - 20
                );


                ctx.fillRect(
                    object.x,
                    object.y + 8,
                    object.w,
                    20
                );


                break;


            case "crate":
            case "chest":
            case "ashChest":

                ctx.fillStyle =
                    object.type ===
                    "ashChest"
                        ? "#3a2926"
                        : "#705039";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.strokeStyle =
                    "#3f3026";


                ctx.strokeRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                break;


            case "rug":

                ctx.fillStyle =
                    rgba(
                        theme.accent,
                        0.45
                    );


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                break;


            case "plant":
            case "flowerBed":

                ctx.fillStyle =
                    "#47613e";


                ctx.beginPath();


                ctx.arc(
                    object.x +
                    object.w /
                    2,
                    object.y +
                    object.h /
                    2,
                    Math.min(
                        object.w,
                        object.h
                    ) *
                    0.45,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                break;


            case "woodPile":

                ctx.strokeStyle =
                    "#79563a";


                ctx.lineWidth =
                    8;


                for (
                    let i = 0;
                    i < 5;
                    i++
                ) {

                    ctx.beginPath();


                    ctx.moveTo(
                        object.x + 10,
                        object.y + 12 + i * 12
                    );


                    ctx.lineTo(
                        object.x +
                        object.w -
                        10,
                        object.y +
                        12 +
                        i *
                        12
                    );


                    ctx.stroke();

                }


                break;


            case "orePile":
            case "coalPile":

                ctx.fillStyle =
                    object.type ===
                    "coalPile"
                        ? "#29292a"
                        : "#696a68";


                for (
                    let i = 0;
                    i < 10;
                    i++
                ) {

                    ctx.beginPath();


                    ctx.arc(

                        object.x +
                        random(
                            8,
                            object.w - 8
                        ),

                        object.y +
                        random(
                            8,
                            object.h - 8
                        ),

                        random(
                            5,
                            12
                        ),

                        0,
                        Math.PI *
                        2

                    );


                    ctx.fill();

                }


                break;


            case "crystalRack":

                ctx.fillStyle =
                    "#5a3a41";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.fillStyle =
                    "#c94d65";


                for (
                    let i = 0;
                    i < 5;
                    i++
                ) {

                    ctx.beginPath();


                    ctx.moveTo(
                        object.x +
                        15 +
                        i *
                        20,
                        object.y +
                        object.h -
                        10
                    );


                    ctx.lineTo(
                        object.x +
                        22 +
                        i *
                        20,
                        object.y + 15
                    );


                    ctx.lineTo(
                        object.x +
                        30 +
                        i *
                        20,
                        object.y +
                        object.h -
                        10
                    );


                    ctx.fill();

                }


                break;


            case "lamp":
            case "crystalLamp":
            case "goldLamp":
            case "lanternStand":

                ctx.shadowColor =
                    theme.light;


                ctx.shadowBlur =
                    18;


                ctx.fillStyle =
                    theme.light;


                ctx.beginPath();


                ctx.arc(
                    object.x +
                    object.w /
                    2,
                    object.y +
                    object.h /
                    2,
                    8,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                break;


            case "fireplace":

                ctx.fillStyle =
                    "#36302d";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );


                ctx.fillStyle =
                    "#dc633d";


                ctx.shadowColor =
                    "#ed7646";


                ctx.shadowBlur =
                    14;


                ctx.beginPath();


                ctx.arc(
                    object.x +
                    object.w /
                    2,
                    object.y +
                    object.h *
                    0.65,
                    18,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                break;


            default:

                ctx.fillStyle =
                    "#615448";


                ctx.fillRect(
                    object.x,
                    object.y,
                    object.w,
                    object.h
                );

                break;

        }


        ctx.restore();

    }


    /* =========================================================
       ESCURIDÃO / LANTERNA

       CORREÇÃO PRINCIPAL:

       O "destination-out" ACONTECE SOMENTE
       NO CANVAS DE ESCURIDÃO.

       NUNCA no Canvas principal.
       ========================================================= */

    function rayRectDistance(
        originX,
        originY,
        directionX,
        directionY,
        rect,
        maxDistance
    ) {

        const inverseX =
            Math.abs(
                directionX
            ) <
            0.000001
                ? Infinity
                : 1 /
                  directionX;


        const inverseY =
            Math.abs(
                directionY
            ) <
            0.000001
                ? Infinity
                : 1 /
                  directionY;


        let t1 =
            (
                rect.x -
                originX
            ) *
            inverseX;


        let t2 =
            (
                rect.x +
                rect.w -
                originX
            ) *
            inverseX;


        let t3 =
            (
                rect.y -
                originY
            ) *
            inverseY;


        let t4 =
            (
                rect.y +
                rect.h -
                originY
            ) *
            inverseY;


        const tMin =
            Math.max(
                Math.min(
                    t1,
                    t2
                ),
                Math.min(
                    t3,
                    t4
                )
            );


        const tMax =
            Math.min(
                Math.max(
                    t1,
                    t2
                ),
                Math.max(
                    t3,
                    t4
                )
            );


        if (
            tMax <
            0 ||
            tMin >
            tMax
        ) {

            return null;

        }


        const hit =
            tMin >=
            0
                ? tMin
                : tMax;


        if (
            hit <
                0 ||
            hit >
                maxDistance
        ) {

            return null;

        }


        return hit;

    }


    function computeLightPolygon(
        radius
    ) {

        const player =
            state.player;


        const blockers =
            getLightBlockingRects();


        const points =
            [];


        const rays =
            160;


        for (
            let i = 0;
            i < rays;
            i++
        ) {

            const angle =

                i /
                rays *

                Math.PI *
                2;


            const dx =
                Math.cos(
                    angle
                );


            const dy =
                Math.sin(
                    angle
                );


            let hitDistance =
                radius;


            for (
                const rect of
                blockers
            ) {

                const hit =
                    rayRectDistance(

                        player.x,
                        player.y,

                        dx,
                        dy,

                        rect,

                        radius

                    );


                if (
                    hit !==
                        null &&
                    hit <
                        hitDistance
                ) {

                    /*
                        +2px permite enxergar
                        a superfície da parede.
                    */
                    hitDistance =
                        Math.min(
                            radius,
                            hit + 2
                        );

                }

            }


            points.push({

                x:
                    player.x +
                    dx *
                    hitDistance,

                y:
                    player.y +
                    dy *
                    hitDistance

            });

        }


        return points;

    }


    function drawDarknessOverlay() {

        if (
            state.houseMode ||
            !state.player ||
            !state.world
        ) {

            return;

        }


        if (
            state.area !==
                "monarchMaze" &&
            state.area !==
                "shadow"
        ) {

            return;

        }


        const darkCtx =
            renderRuntime
                .darknessCtx;


        if (!darkCtx) {

            return;

        }


        const width =
            renderRuntime.width;


        const height =
            renderRuntime.height;


        /*
            LIMPA APENAS a layer de escuridão.
        */
        darkCtx.save();


        darkCtx.setTransform(
            renderRuntime.dpr,
            0,
            0,
            renderRuntime.dpr,
            0,
            0
        );


        darkCtx.clearRect(
            0,
            0,
            width,
            height
        );


        const hasLantern =
            Boolean(
                state.player
                    .lanternOwned
            );


        const radius =

            hasLantern

                ? VISUAL_CONFIG
                    .lantern
                    .radius

                : VISUAL_CONFIG
                    .lantern
                    .noLanternRadius;


        const darknessAlpha =

            state.area ===
            "monarchMaze"

                ? hasLantern
                    ? 0.88
                    : 0.97

                : hasLantern
                    ? 0.73
                    : 0.93;


        /*
            Preenche o Canvas auxiliar.
        */
        darkCtx.globalCompositeOperation =
            "source-over";


        darkCtx.fillStyle =
            `rgba(5,5,9,${darknessAlpha})`;


        darkCtx.fillRect(
            0,
            0,
            width,
            height
        );


        const playerScreen =
            worldToScreen(
                state.player.x,
                state.player.y
            );


        const polygon =
            computeLightPolygon(
                radius
            )
                .map(
                    point =>
                        worldToScreen(
                            point.x,
                            point.y
                        )
                );


        /*
            Recorta somente a escuridão.
        */
        darkCtx.globalCompositeOperation =
            "destination-out";


        darkCtx.beginPath();


        if (
            polygon.length >
            0
        ) {

            darkCtx.moveTo(
                polygon[0].x,
                polygon[0].y
            );


            for (
                let i = 1;
                i < polygon.length;
                i++
            ) {

                darkCtx.lineTo(
                    polygon[i].x,
                    polygon[i].y
                );

            }


            darkCtx.closePath();

        }


        const gradient =
            darkCtx.createRadialGradient(

                playerScreen.x,
                playerScreen.y,
                hasLantern
                    ? radius * 0.18
                    : 4,

                playerScreen.x,
                playerScreen.y,
                radius

            );


        if (
            hasLantern
        ) {

            gradient.addColorStop(
                0,
                "rgba(0,0,0,1)"
            );


            gradient.addColorStop(
                0.58,
                "rgba(0,0,0,0.94)"
            );


            gradient.addColorStop(
                0.82,
                "rgba(0,0,0,0.56)"
            );


            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );

        }

        else {

            gradient.addColorStop(
                0,
                "rgba(0,0,0,0.8)"
            );


            gradient.addColorStop(
                0.55,
                "rgba(0,0,0,0.42)"
            );


            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );

        }


        darkCtx.fillStyle =
            gradient;


        darkCtx.fill();


        darkCtx.globalCompositeOperation =
            "source-over";


        darkCtx.restore();


        /*
            AGORA desenha a camada pronta
            por cima do mundo.

            O mundo NÃO é apagado.
        */
        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        ctx.drawImage(
            renderRuntime
                .darknessCanvas,
            0,
            0
        );


        ctx.restore();

    }


    /* =========================================================
       INTERACTION INDICATOR
       ========================================================= */

    function drawInteractionHint() {

        if (
            state.paused ||
            !state.player
        ) {

            return;

        }


        const target =
            getNearestInteractionTarget();


        const door =
            !state.houseMode
                ? getNearbyExteriorDoor()
                : isPlayerNearInteriorDoor()
                    ? getInteriorDoor()
                    : null;


        if (
            !target &&
            !door
        ) {

            return;

        }


        let text =
            "";


        if (door) {

            text =
                "Z — ENTRAR";

        }

        else {

            switch (
                target.type
            ) {

                case "collectible":
                    text =
                        "SEGURE E";
                    break;

                case "bed":
                    text =
                        "E — DESCANSAR";
                    break;

                default:
                    text =
                        "E — INTERAGIR";
                    break;

            }

        }


        const screen =
            worldToScreen(
                state.player.x,
                state.player.y - 62
            );


        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        ctx.font =
            "bold 12px serif";


        ctx.textAlign =
            "center";


        const width =
            ctx.measureText(
                text
            ).width +
            22;


        ctx.fillStyle =
            "rgba(18,16,19,0.84)";


        ctx.beginPath();


        ctx.roundRect(
            screen.x -
            width /
            2,
            screen.y - 13,
            width,
            26,
            8
        );


        ctx.fill();


        ctx.fillStyle =
            "#eadcb8";


        ctx.fillText(
            text,
            screen.x,
            screen.y + 4
        );


        ctx.restore();

    }


    /* =========================================================
       HOLD BAR
       ========================================================= */

    function drawHoldActionUI() {

        const hold =
            state.holdAction;


        if (!hold) {

            return;

        }


        const ratio =
            clamp(
                hold.timer /
                hold.duration,
                0,
                1
            );


        const width =
            180;


        const x =
            renderRuntime.width /
            2 -
            width /
            2;


        const y =
            renderRuntime.height -
            110;


        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        ctx.fillStyle =
            "rgba(14,13,15,0.84)";


        ctx.beginPath();


        ctx.roundRect(
            x - 12,
            y - 26,
            width + 24,
            56,
            10
        );


        ctx.fill();


        ctx.fillStyle =
            "#4c4541";


        ctx.fillRect(
            x,
            y,
            width,
            8
        );


        ctx.fillStyle =
            "#d1b379";


        ctx.fillRect(
            x,
            y,
            width *
            ratio,
            8
        );


        ctx.font =
            "bold 11px serif";


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#e9ddc1";


        ctx.fillText(
            "SEGURE E",
            renderRuntime.width /
            2,
            y - 8
        );


        ctx.restore();

    }


    /* =========================================================
       BOSS BAR
       ========================================================= */

    function drawBossTopBar() {

        if (
            !state.world
        ) {

            return;

        }


        const boss =
            state.world
                .enemies
                .find(
                    enemy =>
                        !enemy.dead &&
                        enemy.accepted &&
                        shouldBossUseTopBar(
                            enemy
                        )
                );


        if (!boss) {

            return;

        }


        const width =
            clamp(
                renderRuntime.width *
                0.42,
                VISUAL_CONFIG
                    .bossBar
                    .minWidth,
                VISUAL_CONFIG
                    .bossBar
                    .maxWidth
            );


        const x =
            renderRuntime.width /
            2 -
            width /
            2;


        const y =
            VISUAL_CONFIG
                .bossBar
                .topDesktop;


        const ratio =
            clamp(
                boss.hp /
                boss.maxHp,
                0,
                1
            );


        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        ctx.textAlign =
            "center";


        ctx.font =
            "bold 14px serif";


        ctx.fillStyle =
            "#e8dfcf";


        ctx.fillText(
            boss.name,
            renderRuntime.width /
            2,
            y - 14
        );


        ctx.fillStyle =
            "rgba(10,9,12,0.78)";


        ctx.beginPath();


        ctx.roundRect(
            x - 4,
            y - 4,
            width + 8,
            VISUAL_CONFIG
                .bossBar
                .height + 8,
            8
        );


        ctx.fill();


        ctx.fillStyle =
            "#352832";


        ctx.fillRect(
            x,
            y,
            width,
            VISUAL_CONFIG
                .bossBar
                .height
        );


        const gradient =
            ctx.createLinearGradient(
                x,
                y,
                x + width,
                y
            );


        gradient.addColorStop(
            0,
            boss.color ||
            "#8d5364"
        );


        gradient.addColorStop(
            1,
            boss.aura ||
            "#b27c9b"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            x,
            y,
            width *
            ratio,
            VISUAL_CONFIG
                .bossBar
                .height
        );


        ctx.restore();

    }


    /* =========================================================
       RENDER DO MUNDO
       ========================================================= */

    function renderGameWorld() {

        if (
            !canvas ||
            !ctx ||
            !state.player
        ) {

            return;

        }


        resizeGameCanvas();


        ctx.save();


        /*
            Limpa em coordenadas da tela.
        */
        ctx.setTransform(
            renderRuntime.dpr,
            0,
            0,
            renderRuntime.dpr,
            0,
            0
        );


        ctx.clearRect(
            0,
            0,
            renderRuntime.width,
            renderRuntime.height
        );


        ctx.restore();


        let shakeX =
            0;


        let shakeY =
            0;


        if (
            state.screenShake >
            0
        ) {

            shakeX =
                random(
                    -state.screenShakePower,
                    state.screenShakePower
                );


            shakeY =
                random(
                    -state.screenShakePower,
                    state.screenShakePower
                );

        }


        ctx.save();


        ctx.translate(

            -state.camera.x +
            shakeX,

            -state.camera.y +
            shakeY

        );


        if (
            state.houseMode
        ) {

            drawHouseInterior();

        }

        else {

            drawBiomeGround();

            drawPaths();


            for (
                const landmark of
                state.world.landmarks
            ) {

                drawLandmark(
                    landmark
                );

            }


            for (
                const obstacle of
                state.world.obstacles
            ) {

                drawObstacle(
                    obstacle
                );

            }


            for (
                const tree of
                state.world.trees
            ) {

                drawTree(
                    tree
                );

            }


            for (
                const resource of
                state.world.resources
            ) {

                drawResource(
                    resource
                );

            }


            for (
                const building of
                state.world.buildings
            ) {

                drawBuilding(
                    building
                );

            }


            drawVillageFountain();


            for (
                const gate of
                state.world.gates
            ) {

                drawGate(
                    gate
                );

            }


            for (
                const portal of
                state.world.portals
            ) {

                drawPortal(
                    portal
                );

            }


            drawMonarchAltar();


            for (
                const npc of
                state.world.npcs
            ) {

                drawNPC(
                    npc
                );

            }


            for (
                const enemy of
                state.world.enemies
            ) {

                drawEnemy(
                    enemy
                );

            }


            drawProjectiles();

            drawGameplayEffects();

            drawBloodMarks();

            drawPlayer();

            drawParticles();

        }


        if (
            state.houseMode
        ) {

            drawGameplayEffects();

            drawBloodMarks();

            drawPlayer();

            drawParticles();

        }


        ctx.restore();


        /*
            Darkness é screen-space
            e vem depois do mundo.
        */
        drawDarknessOverlay();


        /*
            UI canvas.
        */
        drawInteractionHint();

        drawHoldActionUI();

        drawBossTopBar();

        drawDamageFlash();

        drawSceneTransitionOverlay();

    }


    function drawDamageFlash() {

        if (
            state.damageFlash <=
            0
        ) {

            return;

        }


        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        const gradient =
            ctx.createRadialGradient(

                renderRuntime.width /
                2,

                renderRuntime.height /
                2,

                renderRuntime.height *
                0.2,

                renderRuntime.width /
                2,

                renderRuntime.height /
                2,

                renderRuntime.height *
                0.75

            );


        gradient.addColorStop(
            0,
            "rgba(110,0,8,0)"
        );


        gradient.addColorStop(
            1,
            `rgba(125,0,10,${state.damageFlash})`
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            renderRuntime.width,
            renderRuntime.height
        );


        ctx.restore();

    }


    function drawSceneTransitionOverlay() {

        const transition =
            state.transition;


        if (!transition) {

            return;

        }


        ctx.save();


        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        ctx.globalAlpha =
            clamp(
                transition.alpha,
                0,
                1
            );


        ctx.fillStyle =
            "#0c0b0f";


        ctx.fillRect(
            0,
            0,
            renderRuntime.width,
            renderRuntime.height
        );


        if (
            transition.message
        ) {

            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.font =
                "bold 21px serif";


            ctx.fillStyle =
                "#e7ddc9";


            ctx.fillText(

                transition.message,

                renderRuntime.width /
                2,

                renderRuntime.height /
                2

            );

        }


        ctx.restore();

    }


    /* =========================================================
       HUD
       ========================================================= */

    function updateHUD() {

        const player =
            state.player;


        const hud =
            $("runtimeHUD");


        if (
            !player ||
            !hud
        ) {

            if (hud) {

                hud.classList
                    .add(
                        "hidden"
                    );

            }


            return;

        }


        hud.classList
            .remove(
                "hidden"
            );


        const character =
            currentCharacter();


        const hpRatio =
            clamp(
                player.hp /
                Math.max(
                    1,
                    player.maxHp
                ),
                0,
                1
            );


        const magicRatio =
            clamp(
                player.magic /
                Math.max(
                    1,
                    player.maxMagic
                ),
                0,
                1
            );


        const energyRatio =
            clamp(
                player.energy /
                Math.max(
                    1,
                    player.maxEnergy
                ),
                0,
                1
            );


        const name =
            $("hudPlayerName");


        if (name) {

            name.textContent =
                `${character.icon} ${player.name}`;

        }


        const level =
            $("hudPlayerLevel");


        if (level) {

            level.textContent =
                `NV. ${player.level}`;

        }


        const hpFill =
            $("hudHpFill");


        if (hpFill) {

            hpFill.style.width =
                `${hpRatio * 100}%`;

        }


        const magicFill =
            $("hudMagicFill");


        if (magicFill) {

            magicFill.style.width =
                `${magicRatio * 100}%`;

        }


        const energyFill =
            $("hudEnergyFill");


        if (energyFill) {

            energyFill.style.width =
                `${energyRatio * 100}%`;

        }


        const hpText =
            $("hudHpText");


        if (hpText) {

            hpText.textContent =
                `${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`;

        }


        const magicText =
            $("hudMagicText");


        if (magicText) {

            magicText.textContent =
                `${Math.ceil(player.magic)} / ${Math.ceil(player.maxMagic)}`;

        }


        const energyText =
            $("hudEnergyText");


        if (energyText) {

            energyText.textContent =
                `${Math.ceil(player.energy)} / ${Math.ceil(player.maxEnergy)}`;

        }


        const money =
            $("hudMoney");


        if (money) {

            money.textContent =
                getMoneyDisplay();

        }


        const area =
            $("hudArea");


        if (area) {

            area.textContent =
                state.houseMode

                    ? getHouseSpec(
                        state.currentHouse
                    )?.name ||
                      "INTERIOR"

                    : getRegionDefinition()
                        .name;

        }

    }


    /* =========================================================
       INVENTÁRIO
       ========================================================= */

    function openInventory() {

        const panel =
            $("inventoryPanel");


        if (!panel) {

            return;

        }


        if (
            !panel.classList
                .contains(
                    "hidden"
                )
        ) {

            closeInventory();

            return;

        }


        closeStatusPanel();


        panel.classList
            .remove(
                "hidden"
            );


        state.activePanel =
            "inventory";


        pauseForUI(
            "inventory"
        );


        renderInventory();

    }


    function closeInventory() {

        $("inventoryPanel")
            ?.classList
            .add(
                "hidden"
            );


        if (
            state.activePanel ===
            "inventory"
        ) {

            state.activePanel =
                null;


            resumeFromUI(
                "inventory"
            );

        }

    }


    function renderInventory() {

        const panel =
            $("inventoryPanel");


        const player =
            state.player;


        if (
            !panel ||
            !player
        ) {

            return;

        }


        const items =
            Object.entries(
                player.inventory
            )
                .filter(
                    (
                        [
                            id,
                            amount
                        ]
                    ) =>
                        ITEMS[id] &&
                        amount >
                        0
                );


        const cards =
            items.length ===
            0

                ? `
                    <p class="empty-state">
                        Seu inventário está vazio.
                    </p>
                `

                : items
                    .map(
                        (
                            [
                                id,
                                amount
                            ]
                        ) => {

                            const item =
                                ITEMS[id];


                            const equipped =
                                isEquippedItem(
                                    id
                                );


                            const actionable =
                                [
                                    "food",
                                    "potions",
                                    "weapons",
                                    "armor",
                                    "tools",
                                    "special"
                                ]
                                    .includes(
                                        item.category
                                    );


                            return `
                                <article class="inventory-card">

                                    <div class="inventory-icon">
                                        ${escapeHTML(item.icon)}
                                    </div>

                                    <div class="inventory-info">
                                        <strong>
                                            ${escapeHTML(item.name)}
                                        </strong>

                                        <span>
                                            x${amount}
                                        </span>

                                        ${
                                            equipped
                                                ? `<em>Equipado</em>`
                                                : ""
                                        }
                                    </div>

                                    ${
                                        actionable
                                            ? `
                                                <button
                                                    type="button"
                                                    data-inventory-action="${escapeHTML(id)}"
                                                >
                                                    ${
                                                        item.category === "food" ||
                                                        item.category === "potions"
                                                            ? "USAR"
                                                            : item.category === "special"
                                                                ? "USAR"
                                                                : "EQUIPAR"
                                                    }
                                                </button>
                                            `
                                            : ""
                                    }

                                </article>
                            `;

                        }
                    )
                    .join(
                        ""
                    );


        panel.innerHTML = `
            <div class="modal-card inventory-modal-card">

                <div class="modal-header">
                    <div>
                        <span>MOCHILA</span>
                        <h2>INVENTÁRIO</h2>
                    </div>

                    <button
                        type="button"
                        data-close-inventory
                    >
                        ×
                    </button>
                </div>

                <div class="inventory-weight">
                    Peso:
                    ${getInventoryWeight().toFixed(1)}
                    /
                    ${player.inventoryWeightLimit}
                </div>

                <div class="inventory-grid">
                    ${cards}
                </div>

            </div>
        `;


        panel
            .querySelector(
                "[data-close-inventory]"
            )
            ?.addEventListener(
                "click",
                closeInventory
            );


        panel
            .querySelectorAll(
                "[data-inventory-action]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset
                                    .inventoryAction;


                            if (
                                inventoryPrimaryAction(
                                    id
                                )
                            ) {

                                renderInventory();

                                updateHUD();

                            }

                        }
                    );

                }
            );

    }


    /* =========================================================
       STATUS
       ========================================================= */

    function openStatusPanel() {

        const panel =
            $("statusPanel");


        if (!panel) {

            return;

        }


        if (
            !panel.classList
                .contains(
                    "hidden"
                )
        ) {

            closeStatusPanel();

            return;

        }


        closeInventory();


        panel.classList
            .remove(
                "hidden"
            );


        state.activePanel =
            "status";


        pauseForUI(
            "status"
        );


        renderStatusPanel();

    }


    function closeStatusPanel() {

        $("statusPanel")
            ?.classList
            .add(
                "hidden"
            );


        if (
            state.activePanel ===
            "status"
        ) {

            state.activePanel =
                null;


            resumeFromUI(
                "status"
            );

        }

    }


    function renderStatusPanel() {

        const panel =
            $("statusPanel");


        const player =
            state.player;


        if (
            !panel ||
            !player
        ) {

            return;

        }


        const stats =
            Object.values(
                STAT_CONFIG
            );


        const cards =
            stats
                .map(
                    stat => {

                        const value =
                            player.stats[
                                stat.id
                            ] ||
                            0;


                        const disabled =

                            player.statPoints <=
                                0 ||

                            value >=
                                STAT_CAP;


                        return `
                            <article class="status-upgrade-card">

                                <span class="status-icon">
                                    ${escapeHTML(stat.icon)}
                                </span>

                                <div>
                                    <strong>
                                        ${escapeHTML(stat.label)}
                                    </strong>

                                    <small>
                                        ${escapeHTML(stat.description)}
                                    </small>

                                    <b>
                                        ${value} / ${STAT_CAP}
                                    </b>
                                </div>

                                <button
                                    type="button"
                                    data-stat="${escapeHTML(stat.id)}"
                                    ${disabled ? "disabled" : ""}
                                >
                                    +
                                </button>

                            </article>
                        `;

                    }
                )
                .join(
                    ""
                );


        const armor =
            getEquippedArmor();


        panel.innerHTML = `
            <div class="modal-card status-modal-card">

                <div class="modal-header">

                    <div>
                        <span>DESENVOLVIMENTO</span>
                        <h2>STATUS</h2>
                    </div>

                    <button
                        type="button"
                        data-close-status
                    >
                        ×
                    </button>

                </div>

                <div class="status-summary">

                    <div>
                        <span>Nível</span>
                        <strong>${player.level}</strong>
                    </div>

                    <div>
                        <span>Pontos</span>
                        <strong>${player.statPoints}</strong>
                    </div>

                    <div>
                        <span>Dano</span>
                        <strong>${Math.round(player.damage)}</strong>
                    </div>

                    <div>
                        <span>Defesa</span>
                        <strong>${Math.round(player.defense)}</strong>
                    </div>

                    <div>
                        <span>HP Máximo</span>
                        <strong>${Math.round(player.maxHp)}</strong>
                    </div>

                    <div>
                        <span>Armadura</span>
                        <strong>
                            ${
                                armor
                                    ? escapeHTML(armor.name)
                                    : "Nenhuma"
                            }
                        </strong>
                    </div>

                </div>

                <div class="status-upgrade-list">
                    ${cards}
                </div>

            </div>
        `;


        panel
            .querySelector(
                "[data-close-status]"
            )
            ?.addEventListener(
                "click",
                closeStatusPanel
            );


        panel
            .querySelectorAll(
                "[data-stat]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                allocateStatPoint(
                                    button.dataset.stat
                                )
                            ) {

                                renderStatusPanel();

                                updateHUD();

                            }

                        }
                    );

                }
            );

    }


    /* =========================================================
       SHOP RENDER
       ========================================================= */

    function renderShopPanel() {

        const panel =
            $("shopPanel");


        const shop =
            getShopConfig(
                state.shopNPC
            );


        if (
            !panel ||
            !shop
        ) {

            return;

        }


        panel.classList
            .remove(
                "hidden"
            );


        let content =
            "";


        if (
            state.shopMode ===
            "buy"
        ) {

            const entries =
                getShopBuyEntries(
                    state.shopNPC
                );


            if (
                entries.length ===
                0
            ) {

                content = `
                    <p class="empty-state">
                        Nada disponível para compra agora.
                    </p>
                `;

            }

            else {

                content =
                    entries
                        .map(
                            entry =>
                                renderShopBuyEntry(
                                    entry
                                )
                        )
                        .join(
                            ""
                        );

            }

        }

        else {

            const entries =
                getShopSellEntries();


            if (
                entries.length ===
                0
            ) {

                content = `
                    <p class="empty-state">
                        Você não possui itens vendáveis.
                    </p>
                `;

            }

            else {

                content =
                    entries
                        .map(
                            entry =>
                                renderShopSellEntry(
                                    entry
                                )
                        )
                        .join(
                            ""
                        );

            }

        }


        panel.innerHTML = `
            <div class="modal-card shop-modal-card">

                <div class="modal-header">

                    <div>
                        <span>${escapeHTML(shop.npcName)}</span>
                        <h2>${escapeHTML(shop.name)}</h2>
                    </div>

                    <div class="shop-money">
                        🪙 ${escapeHTML(getMoneyDisplay())}
                    </div>

                    <button
                        type="button"
                        data-close-shop
                    >
                        ×
                    </button>

                </div>

                <div class="shop-tabs">

                    <button
                        type="button"
                        data-shop-mode="buy"
                        class="${state.shopMode === "buy" ? "active" : ""}"
                    >
                        COMPRAR
                    </button>

                    <button
                        type="button"
                        data-shop-mode="sell"
                        class="${state.shopMode === "sell" ? "active" : ""}"
                    >
                        VENDER
                    </button>

                </div>

                <div class="shop-list">
                    ${content}
                </div>

            </div>
        `;


        panel
            .querySelector(
                "[data-close-shop]"
            )
            ?.addEventListener(
                "click",
                closeShop
            );


        panel
            .querySelectorAll(
                "[data-shop-mode]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            setShopMode(
                                button.dataset
                                    .shopMode
                            );

                        }
                    );

                }
            );


        panel
            .querySelectorAll(
                "[data-buy-item]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            performShopAction(
                                "buy",
                                button.dataset
                                    .buyItem
                            );

                        }
                    );

                }
            );


        panel
            .querySelectorAll(
                "[data-sell-one]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            performShopAction(
                                "sellOne",
                                button.dataset
                                    .sellOne
                            );

                        }
                    );

                }
            );


        panel
            .querySelectorAll(
                "[data-sell-all]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            performShopAction(
                                "sellAll",
                                button.dataset
                                    .sellAll
                            );

                        }
                    );

                }
            );

    }


    function renderShopBuyEntry(
        entry
    ) {

        const item =
            ITEMS[
                entry.id
            ];


        const armor =
            ARMOR_DATA[
                entry.id
            ];


        let requirements =
            "";


        if (
            entry.kind ===
            "armorUpgrade"
        ) {

            requirements = `
                <small>
                    ${escapeHTML(ITEMS[entry.materialId].icon)}
                    ${entry.materialAmount}
                    ${escapeHTML(ITEMS[entry.materialId].name)}
                </small>
            `;

        }


        const armorStats =
            armor
                ? `
                    <small>
                        Defesa +${armor.defense}
                        •
                        HP +${armor.hpBonus}
                    </small>
                `
                : "";


        return `
            <article class="shop-item">

                <span class="shop-item-icon">
                    ${escapeHTML(item?.icon || "◆")}
                </span>

                <div class="shop-item-info">

                    <strong>
                        ${escapeHTML(item?.name || entry.id)}
                    </strong>

                    ${armorStats}

                    ${requirements}

                </div>

                <div class="shop-item-price">
                    🪙 ${entry.price}
                </div>

                <button
                    type="button"
                    data-buy-item="${escapeHTML(entry.id)}"
                >
                    COMPRAR
                </button>

            </article>
        `;

    }


    function renderShopSellEntry(
        entry
    ) {

        return `
            <article class="shop-item">

                <span class="shop-item-icon">
                    ${escapeHTML(entry.item.icon)}
                </span>

                <div class="shop-item-info">

                    <strong>
                        ${escapeHTML(entry.item.name)}
                    </strong>

                    <small>
                        Quantidade:
                        ${entry.virtualInfinite ? "∞" : entry.amount}
                    </small>

                    <small>
                        🪙 ${entry.price} cada
                    </small>

                </div>

                <div class="shop-sell-buttons">

                    <button
                        type="button"
                        data-sell-one="${escapeHTML(entry.id)}"
                    >
                        VENDER 1
                    </button>

                    <button
                        type="button"
                        data-sell-all="${escapeHTML(entry.id)}"
                    >
                        VENDER TUDO
                    </button>

                </div>

            </article>
        `;

    }


    /* =========================================================
       QUEST RENDER
       ========================================================= */

    function renderQuestPanel() {

        const panel =
            $("questPanel");


        const npc =
            state.questNPC;


        if (
            !panel ||
            !npc
        ) {

            return;

        }


        const definition =
            getQuestDefinition(
                npc.questId
            );


        const quest =
            state.player
                ?.quest
                ?.[npc.questId];


        if (
            !definition ||
            !quest
        ) {

            return;

        }


        const amount =
            getItemCount(
                definition.itemId
            );


        let action =
            "ACEITAR";


        if (
            quest.state ===
            "active"
        ) {

            action =
                amount >=
                definition.need

                    ? "ENTREGAR"

                    : "AINDA NÃO";

        }


        if (
            quest.state ===
            "complete"
        ) {

            action =
                "FECHAR";

        }


        panel.classList
            .remove(
                "hidden"
            );


        panel.innerHTML = `
            <div class="modal-card quest-modal-card">

                <div class="modal-header">

                    <div>
                        <span>${escapeHTML(definition.npc)}</span>
                        <h2>${escapeHTML(definition.title)}</h2>
                    </div>

                    <button
                        type="button"
                        data-close-quest
                    >
                        ×
                    </button>

                </div>

                <p>
                    ${escapeHTML(definition.description)}
                </p>

                <div class="quest-progress">
                    ${escapeHTML(ITEMS[definition.itemId].icon)}
                    ${amount}
                    /
                    ${definition.need}
                    ${escapeHTML(ITEMS[definition.itemId].name)}
                </div>

                <div class="quest-reward">
                    RECOMPENSA:
                    ${definition.rewardXP} XP
                    •
                    🪙 ${definition.rewardMoney}
                </div>

                <button
                    type="button"
                    class="quest-action"
                    data-quest-action
                >
                    ${action}
                </button>

            </div>
        `;


        panel
            .querySelector(
                "[data-close-quest]"
            )
            ?.addEventListener(
                "click",
                closeQuestPanel
            );


        panel
            .querySelector(
                "[data-quest-action]"
            )
            ?.addEventListener(
                "click",
                () => {

                    questAction();

                }
            );

    }


    /* =========================================================
       CONFIRMAÇÃO DE BOSS
       ========================================================= */

    function renderBattleConfirmation() {

        const panel =
            $("battleConfirmPanel");


        const enemy =
            getBattleEnemy();


        if (
            !panel ||
            !enemy
        ) {

            return;

        }


        panel.classList
            .remove(
                "hidden"
            );


        panel.innerHTML = `
            <div
                class="modal-card boss-confirm-card"
                style="--boss-color:${escapeHTML(enemy.color)};"
            >

                <div class="boss-confirm-aura"></div>

                <div class="boss-confirm-icon">
                    ${escapeHTML(enemy.icon || "◆")}
                </div>

                <span class="boss-confirm-label">
                    PRESENÇA HOSTIL
                </span>

                <h2>
                    ${escapeHTML(enemy.name)}
                </h2>

                <p>
                    Uma presença poderosa bloqueia seu caminho.
                </p>

                <div class="boss-confirm-stats">

                    <span>
                        VIDA
                        <b>${Math.round(enemy.maxHp)}</b>
                    </span>

                    <span>
                        PODER
                        <b>${Math.round(enemy.damage)}</b>
                    </span>

                </div>

                <strong class="boss-confirm-question">
                    Deseja enfrentar este boss?
                </strong>

                <div class="boss-confirm-actions">

                    <button
                        type="button"
                        data-boss-accept
                    >
                        ENFRENTAR
                    </button>

                    <button
                        type="button"
                        data-boss-decline
                    >
                        RECUAR
                    </button>

                </div>

            </div>
        `;


        panel
            .querySelector(
                "[data-boss-accept]"
            )
            ?.addEventListener(
                "click",
                acceptBattle
            );


        panel
            .querySelector(
                "[data-boss-decline]"
            )
            ?.addEventListener(
                "click",
                declineBattle
            );

    }


    /* =========================================================
       VIAGEM
       ========================================================= */

    function renderTravelConfirmation() {

        const panel =
            $("travelPanel");


        const travel =
            state.travel;


        if (
            !panel ||
            !travel
        ) {

            return;

        }


        panel.classList
            .remove(
                "hidden"
            );


        panel.innerHTML = `
            <div class="modal-card travel-modal-card">

                <span class="travel-icon">
                    ◇
                </span>

                <h2>
                    ${escapeHTML(travel.label)}
                </h2>

                <p>
                    Deseja seguir por esta passagem?
                </p>

                <div class="modal-actions">

                    <button
                        type="button"
                        data-travel-confirm
                    >
                        VIAJAR
                    </button>

                    <button
                        type="button"
                        data-travel-cancel
                    >
                        FICAR
                    </button>

                </div>

            </div>
        `;


        panel
            .querySelector(
                "[data-travel-confirm]"
            )
            ?.addEventListener(
                "click",
                confirmTravel
            );


        panel
            .querySelector(
                "[data-travel-cancel]"
            )
            ?.addEventListener(
                "click",
                cancelTravel
            );

    }


    /* =========================================================
       ESCOLHA FINAL
       ========================================================= */

    function openFinalChoiceAfterVictory() {

        if (
            state.finalChoiceShown
        ) {

            return;

        }


        state.finalChoiceShown =
            true;


        pauseForUI(
            "final"
        );


        renderFinalChoicePanel();

    }


    function renderFinalChoicePanel() {

        const panel =
            $("finalChoicePanel");


        if (!panel) {

            return;

        }


        panel.classList
            .remove(
                "hidden"
            );


        panel.innerHTML = `
            <div class="modal-card final-choice-card">

                <span>
                    A QUIETUDE RECUA
                </span>

                <h2>
                    MAS A MEMÓRIA CONTINUA.
                </h2>

                <p>
                    Diante de você restam lembranças que talvez jamais devessem ter voltado.
                </p>

                <div class="modal-actions">

                    <button
                        type="button"
                        data-final-choice="remember"
                    >
                        LEMBRAR
                    </button>

                    <button
                        type="button"
                        data-final-choice="release"
                    >
                        DEIXAR IR
                    </button>

                </div>

            </div>
        `;


        panel
            .querySelectorAll(
                "[data-final-choice]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            state.player
                                .finalChoice =
                                button.dataset
                                    .finalChoice;


                            panel.classList
                                .add(
                                    "hidden"
                                );


                            resumeFromUI(
                                "final"
                            );


                            saveGame();


                            showToast(
                                "Sua escolha foi registrada."
                            );

                        }
                    );

                }
            );

    }


    /* =========================================================
       MINIMAPA
       ========================================================= */

    function renderMiniMap() {

        if (
            !miniCanvas ||
            !miniCtx ||
            !state.player ||
            !state.world
        ) {

            return;

        }


        const parent =
            miniCanvas.parentElement;


        if (
            parent
        ) {

            parent.style.display =
                state.player
                    .minimapOwned

                    ? ""

                    : "none";

        }


        if (
            !state.player
                .minimapOwned
        ) {

            return;

        }


        const width =
            miniCanvas.width;


        const height =
            miniCanvas.height;


        miniCtx.clearRect(
            0,
            0,
            width,
            height
        );


        const scaleX =
            width /
            state.world.width;


        const scaleY =
            height /
            state.world.height;


        const biome =
            getBiomeStyle();


        miniCtx.fillStyle =
            biome.ground;


        miniCtx.fillRect(
            0,
            0,
            width,
            height
        );


        miniCtx.fillStyle =
            "#9f8662";


        for (
            const path of
            state.world.paths
        ) {

            miniCtx.fillRect(

                path.x *
                scaleX,

                path.y *
                scaleY,

                path.w *
                scaleX,

                path.h *
                scaleY

            );

        }


        for (
            const marker of
            getVisibleMapMarkers()
        ) {

            let color =
                "#e5d8b7";


            if (
                marker.type ===
                "boss"
            ) {

                color =
                    "#d56068";

            }


            if (
                marker.type ===
                "gate"
            ) {

                color =
                    "#b49bc8";

            }


            if (
                marker.type ===
                "fountain"
            ) {

                color =
                    "#7ec2d5";

            }


            miniCtx.fillStyle =
                color;


            miniCtx.beginPath();


            miniCtx.arc(

                marker.x *
                scaleX,

                marker.y *
                scaleY,

                marker.important
                    ? 3
                    : 2,

                0,
                Math.PI *
                2

            );


            miniCtx.fill();

        }


        /*
            Player.
        */
        miniCtx.fillStyle =
            "#ffffff";


        miniCtx.beginPath();


        miniCtx.arc(

            state.player.x *
            scaleX,

            state.player.y *
            scaleY,

            3,

            0,
            Math.PI *
            2

        );


        miniCtx.fill();

    }


    /* =========================================================
       MAPA GRANDE
       ========================================================= */

    function renderWorldMap() {

        if (
            !mapCanvas ||
            !mapCtx ||
            !state.player ||
            !state.world
        ) {

            return;

        }


        const width =
            mapCanvas.width;


        const height =
            mapCanvas.height;


        mapCtx.clearRect(
            0,
            0,
            width,
            height
        );


        const scaleX =
            width /
            state.world.width;


        const scaleY =
            height /
            state.world.height;


        const biome =
            getBiomeStyle();


        mapCtx.fillStyle =
            biome.ground;


        mapCtx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
            Caminhos.
        */
        mapCtx.fillStyle =
            getPathStyle()
                .base;


        for (
            const path of
            state.world.paths
        ) {

            mapCtx.fillRect(

                path.x *
                scaleX,

                path.y *
                scaleY,

                path.w *
                scaleX,

                path.h *
                scaleY

            );

        }


        /*
            Elementos importantes.
        */
        mapCtx.font =
            "12px serif";


        mapCtx.textAlign =
            "center";


        mapCtx.textBaseline =
            "middle";


        for (
            const marker of
            getVisibleMapMarkers()
        ) {

            const x =
                marker.x *
                scaleX;


            const y =
                marker.y *
                scaleY;


            mapCtx.fillStyle =
                marker.type ===
                    "boss"
                    ? "#e27276"
                    : marker.type ===
                        "fountain"
                        ? "#8bd0df"
                        : marker.type ===
                            "gate"
                            ? "#be9cd3"
                            : "#eadcb9";


            mapCtx.beginPath();


            mapCtx.arc(
                x,
                y,
                marker.important
                    ? 5
                    : 3,
                0,
                Math.PI *
                2
            );


            mapCtx.fill();


            if (
                marker.label &&
                marker.important
            ) {

                mapCtx.fillStyle =
                    "#f2ead8";


                mapCtx.fillText(
                    marker.label,
                    x,
                    y - 11
                );

            }

        }


        mapCtx.fillStyle =
            "#ffffff";


        mapCtx.beginPath();


        mapCtx.arc(
            state.player.x *
            scaleX,
            state.player.y *
            scaleY,
            5,
            0,
            Math.PI *
            2
        );


        mapCtx.fill();

    }


    /* =========================================================
       SELEÇÃO DE PERSONAGEM

       Mantém símbolos:
       🔥 ⚔️ 🪨 ✨ 🌀
       + gráfico de barras.
       ========================================================= */

    function renderCharacterSelection() {

        const container =
            $("characterCards") ||
            $("characterList");


        if (!container) {

            return;

        }


        container.innerHTML =
            CHARACTERS
                .map(
                    character => {

                        const stats = [

                            [
                                "VIDA",
                                "hp"
                            ],

                            [
                                "MAGIA",
                                "magic"
                            ],

                            [
                                "ENERGIA",
                                "energy"
                            ],

                            [
                                "FORÇA",
                                "damage"
                            ],

                            [
                                "DEFESA",
                                "defense"
                            ],

                            [
                                "VELOCIDADE",
                                "speed"
                            ]

                        ];


                        const bars =
                            stats
                                .map(
                                    (
                                        [
                                            label,
                                            key
                                        ]
                                    ) => {

                                        const value =
                                            getCharacterStatBarValue(
                                                character,
                                                key
                                            );


                                        return `
                                            <div class="character-stat-row">

                                                <span>
                                                    ${label}
                                                </span>

                                                <div class="character-stat-track">

                                                    <div
                                                        class="character-stat-fill"
                                                        style="width:${value}%"
                                                    ></div>

                                                </div>

                                            </div>
                                        `;

                                    }
                                )
                                .join(
                                    ""
                                );


                        return `
                            <button
                                type="button"
                                class="character-card"
                                data-character="${escapeHTML(character.id)}"
                            >

                                <div class="character-symbol">
                                    ${escapeHTML(character.icon)}
                                </div>

                                <div class="character-card-title">

                                    <strong>
                                        ${escapeHTML(character.name)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(character.className)}
                                    </span>

                                </div>

                                <p>
                                    ${escapeHTML(character.description)}
                                </p>

                                <div class="character-stat-chart">
                                    ${bars}
                                </div>

                                <small>
                                    Ataque:
                                    ${escapeHTML(character.basicAttack.name)}
                                </small>

                            </button>
                        `;

                    }
                )
                .join(
                    ""
                );


        container
            .querySelectorAll(
                "[data-character]"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        () => {

                            selectCharacter(
                                card.dataset
                                    .character
                            );

                        }
                    );

                }
            );

    }


    function selectCharacter(
        id
    ) {

        const character =
            getCharacterById(
                id
            );


        if (!character) {

            return false;

        }


        state.selectedCharacter =
            character;


        document
            .querySelectorAll(
                "[data-character]"
            )
            .forEach(
                element => {

                    element.classList
                        .toggle(

                            "selected",

                            element.dataset
                                .character ===
                                id

                        );

                }
            );


        const start =
            $("startCharacterBtn");


        if (start) {

            start.disabled =
                false;

        }


        return true;

    }


    /* =========================================================
       SCREENS
       ========================================================= */

    function showScreen(
        name
    ) {

        for (
            const [
                key,
                screen
            ] of
            Object.entries(
                screens
            )
        ) {

            if (!screen) {

                continue;

            }


            screen.classList
                .toggle(
                    "active",
                    key ===
                    name
                );


            screen.classList
                .toggle(
                    "hidden",
                    key !==
                    name
                );

        }

    }


    /* =========================================================
       NOVO JOGO
       ========================================================= */

    function startNewGame() {

        showScreen(
            "character"
        );


        renderCharacterSelection();

    }


    function confirmCharacterStart() {

        const character =
            state.selectedCharacter;


        if (!character) {

            showToast(
                "Escolha um personagem."
            );

            return false;

        }


        const nameInput =
            $("playerNameInput");


        const typedName =
            nameInput
                ?.value
                ?.trim();


        const playerName =
            typedName ||
            character.name;


        state.player =
            createNewPlayer(
                character,
                playerName
            );


        state.area =
            "village";


        state.houseMode =
            true;


        state.currentHouse = {

            id:
                "home",

            interiorId:
                "home",

            name:
                "CASA DO AVENTUREIRO"

        };


        state.houseReturn =
            null;


        buildWorld();


        placePlayerInsideHouse(
            "home"
        );


        recalculatePlayerStats(
            {
                fillResources:
                    true
            }
        );


        state.running =
            true;


        state.paused =
            false;


        state.lastTime =
            performance.now();


        showScreen(
            "game"
        );


        updateHUD();

        renderInventory();

        saveGame();


        return true;

    }


    /* =========================================================
       SAVE
       ========================================================= */

    function createSavePayload() {

        return {

            version:
                GAME_VERSION,

            versionName:
                GAME_VERSION_NAME,

            savedAt:
                Date.now(),

            area:
                state.area,

            houseMode:
                state.houseMode,

            currentHouseId:
                state.currentHouse
                    ?.id ||
                null,

            houseReturn:
                state.houseReturn
                    ? deepClone(
                        state.houseReturn
                    )
                    : null,

            player:
                createSerializablePlayer()

        };

    }


    function saveGame(
        silent = true
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        try {

            const payload =
                createSavePayload();


            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(
                    payload
                )
            );


            renderRuntime.lastSaveAt =
                performance.now();


            if (!silent) {

                showToast(
                    "Jogo salvo."
                );

            }


            return true;

        }

        catch (
            error
        ) {

            console.error(
                "VEYRA: erro ao salvar.",
                error
            );


            if (!silent) {

                showToast(
                    "Não foi possível salvar."
                );

            }


            return false;

        }

    }


    function findExistingSave() {

        const keys = [
            SAVE_KEY,
            ...LEGACY_SAVE_KEYS
        ];


        for (
            const key of
            keys
        ) {

            try {

                const text =
                    localStorage
                        .getItem(
                            key
                        );


                if (!text) {

                    continue;

                }


                const parsed =
                    JSON.parse(
                        text
                    );


                if (
                    parsed &&
                    parsed.player
                ) {

                    return {

                        key,

                        data:
                            parsed

                    };

                }

            }

            catch (
                error
            ) {

                console.warn(
                    `VEYRA: save inválido em ${key}.`,
                    error
                );

            }

        }


        return null;

    }


    function loadGame() {

        const found =
            findExistingSave();


        if (!found) {

            showToast(
                "Nenhum save encontrado."
            );

            return false;

        }


        try {

            const payload =
                found.data;


            /*
                IMPORTANTE:

                migratePlayerToV25Rules usa algumas
                funções baseadas em state.player.

                Então colocamos o objeto primeiro,
                DEPOIS migramos.

                Isso evita um erro de carregamento.
            */
            state.player =
                payload.player;


            state.player =
                migratePlayerToV25Rules(
                    state.player
                );


            state.selectedCharacter =
                getCharacterById(
                    state.player
                        .characterId
                ) ||
                CHARACTERS[0];


            state.area =
                REGIONS[
                    payload.area
                ]
                    ? payload.area
                    : "village";


            buildWorld();


            state.houseMode =
                Boolean(
                    payload.houseMode
                );


            state.currentHouse =
                null;


            state.houseReturn =
                payload.houseReturn ||
                null;


            if (
                state.houseMode &&
                payload.currentHouseId
            ) {

                const building =
                    state.world
                        .buildings
                        .find(
                            item =>
                                item.id ===
                                payload.currentHouseId
                        );


                if (building) {

                    state.currentHouse =
                        building;

                }

                else if (
                    HOUSE_INTERIORS[
                        payload.currentHouseId
                    ]
                ) {

                    state.currentHouse = {

                        id:
                            payload.currentHouseId,

                        interiorId:
                            payload.currentHouseId,

                        name:
                            HOUSE_INTERIORS[
                                payload.currentHouseId
                            ].name

                    };

                }

                else {

                    state.houseMode =
                        false;

                }

            }


            recalculatePlayerStats();


            if (
                state.houseMode
            ) {

                repairInteriorLoadedPosition();

            }

            else {

                repairPlayerPosition(
                    state.player.x,
                    state.player.y
                );

            }


            state.running =
                true;


            state.paused =
                false;


            state.lastTime =
                performance.now();


            state.portalCooldown =
                1;


            state.deathState =
                null;


            state.dialogue =
                null;


            state.battle =
                null;


            state.travel =
                null;


            state.shopNPC =
                null;


            state.questNPC =
                null;


            showScreen(
                "game"
            );


            updateHUD();


            /*
                Se veio de chave antiga,
                salva imediatamente no novo formato.
            */
            if (
                found.key !==
                SAVE_KEY
            ) {

                saveGame();

            }


            return true;

        }

        catch (
            error
        ) {

            console.error(
                "VEYRA: erro ao carregar save.",
                error
            );


            showToast(
                "O save não pôde ser carregado."
            );


            return false;

        }

    }


    function repairInteriorLoadedPosition() {

        const spec =
            getHouseSpec(
                state.currentHouse
            );


        if (
            !spec ||
            !state.player
        ) {

            state.houseMode =
                false;

            return;

        }


        if (
            isInteriorPositionBlocked(

                state.player.x,
                state.player.y,
                state.player.radius,
                state.currentHouse

            )
        ) {

            state.player.x =
                spec.playerSpawn.x;


            state.player.y =
                spec.playerSpawn.y;

        }

    }


    function hasSave() {

        return Boolean(
            findExistingSave()
        );

    }


    /* =========================================================
       DELETE SAVE
       ========================================================= */

    function deleteSave() {

        try {

            localStorage.removeItem(
                SAVE_KEY
            );


            for (
                const key of
                LEGACY_SAVE_KEYS
            ) {

                localStorage.removeItem(
                    key
                );

            }


            showToast(
                "Save apagado."
            );


            return true;

        }

        catch {

            return false;

        }

    }


    /* =========================================================
       AUTOSAVE
       ========================================================= */

    function updateAutosave(
        dt
    ) {

        if (
            !state.running ||
            !state.player ||
            state.player.dead
        ) {

            return;

        }


        state.autosaveTimer +=
            dt;


        if (
            state.autosaveTimer <
            GAME_CONFIG
                .autosaveSeconds
        ) {

            return;

        }


        state.autosaveTimer =
            0;


        saveGame();

    }


    /* =========================================================
       DEV PRIVACY EXTRA

       Quando privacidade está ligada,
       a lista de comandos não fica exposta
       depois de desbloquear.
       ========================================================= */

    function syncDevPrivacyVisual() {

        const panel =
            $("devCommandPanel");


        if (!panel) {

            return;

        }


        const unlocked =
            panel.querySelector(
                "#devUnlockedArea"
            );


        if (
            unlocked
        ) {

            if (
                state.dev
                    .privacy &&
                state.dev
                    .unlocked
            ) {

                unlocked.style.display =
                    "none";

            }

            else {

                unlocked.style.display =
                    "";

            }

        }


        panel.classList
            .toggle(
                "privacy-on",
                Boolean(
                    state.dev
                        .privacy
                )
            );

    }


    /* =========================================================
       INPUT — TECLADO
       ========================================================= */

    function isTypingTarget(
        target
    ) {

        if (
            !target
        ) {

            return false;

        }


        const tag =
            target.tagName
                ?.toLowerCase();


        return (

            tag ===
                "input" ||

            tag ===
                "textarea" ||

            target.isContentEditable

        );

    }


    function handleKeyDown(
        event
    ) {

        const typing =
            isTypingTarget(
                event.target
            );


        /*
            Enquanto digita senha/nome,
            não dispara comandos do jogo.
        */
        if (
            typing
        ) {

            return;

        }


        /*
            DEV vem antes.
        */
        if (
            handleDevShortcutKeyDown(
                event
            )
        ) {

            syncDevPrivacyVisual();

            return;

        }


        state.keys.add(
            event.code
        );


        if (
            !state.running
        ) {

            return;

        }


        if (
            event.repeat &&
            [
                "KeyE",
                "KeyZ",
                "KeyQ",
                "KeyR",
                "KeyF",
                "Space"
            ]
                .includes(
                    event.code
                )
        ) {

            return;

        }


        switch (
            event.code
        ) {

            case "Escape":

                if (
                    !closeTopUI()
                ) {

                    closeInventory();

                    closeStatusPanel();

                }

                break;


            case "KeyE":

                handleInteractionKeyDown();

                break;


            case "KeyZ":

                useDoorKey();

                break;


            case "KeyQ":

                useClassSkill(
                    "q"
                );

                break;


            case "KeyR":

                useClassSkill(
                    "r"
                );

                break;


            case "KeyF":

                useClassSkill(
                    "f"
                );

                break;


            case "Space":

                if (
                    state.dialogue
                ) {

                    advanceDialogue();

                }

                else {

                    attemptUniversalDash();

                }

                event.preventDefault();

                break;


            case "KeyI":

                if (
                    !state.dialogue &&
                    !state.battle &&
                    !state.travel
                ) {

                    openInventory();

                }

                break;


            case "KeyC":

                if (
                    !state.dialogue &&
                    !state.battle &&
                    !state.travel
                ) {

                    openStatusPanel();

                }

                break;


            case "KeyM":

                toggleWorldMapPanel();

                break;


            case "Digit1":

                if (
                    !state.dev
                        .keys
                        .has(
                            "KeyX"
                        )
                ) {

                    useQuickItem(
                        "pocao"
                    );

                }

                break;


            case "Digit2":

                if (
                    !state.dev
                        .keys
                        .has(
                            "KeyX"
                        )
                ) {

                    useQuickItem(
                        "elixir"
                    );

                }

                break;

        }

    }


    function handleKeyUp(
        event
    ) {

        state.keys.delete(
            event.code
        );


        handleDevShortcutKeyUp(
            event
        );


        if (
            event.code ===
            "KeyE"
        ) {

            handleInteractionKeyUp();

        }

    }


    function useQuickItem(
        id
    ) {

        if (
            state.paused
        ) {

            return false;

        }


        const result =
            activateInventoryItem(
                id
            );


        if (
            result
        ) {

            updateHUD();

        }


        return result;

    }


    /* =========================================================
       INPUT — MOUSE
       ========================================================= */

    function updatePointerPosition(
        event
    ) {

        if (
            !canvas
        ) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        state.pointer.x =

            (
                event.clientX -
                rect.left
            ) *

            (
                renderRuntime.width /
                rect.width
            );


        state.pointer.y =

            (
                event.clientY -
                rect.top
            ) *

            (
                renderRuntime.height /
                rect.height
            );


        const world =
            screenToWorld(
                state.pointer.x,
                state.pointer.y
            );


        state.pointer.worldX =
            world.x;


        state.pointer.worldY =
            world.y;

    }


    function handlePointerDown(
        event
    ) {

        if (
            event.button !==
            0
        ) {

            return;

        }


        updatePointerPosition(
            event
        );


        state.pointer.down =
            true;


        /*
            UM CLICK = UM ATAQUE.

            Não existe ataque contínuo
            segurando mouse.
        */
        performBasicAttack();

    }


    function handlePointerUp() {

        state.pointer.down =
            false;

    }


    /* =========================================================
       MAPA GRANDE — PAINEL
       ========================================================= */

    function toggleWorldMapPanel() {

        let panel =
            $("worldMapPanel");


        if (!panel) {

            panel =
                document.createElement(
                    "div"
                );


            panel.id =
                "worldMapPanel";


            panel.className =
                "game-modal hidden";


            panel.innerHTML = `
                <div class="modal-card world-map-card">

                    <div class="modal-header">

                        <div>
                            <span>VEYRA</span>
                            <h2>MAPA</h2>
                        </div>

                        <button
                            type="button"
                            data-close-world-map
                        >
                            ×
                        </button>

                    </div>

                    <canvas
                        id="runtimeWorldMapCanvas"
                        width="800"
                        height="500"
                    ></canvas>

                </div>
            `;


            document.body.appendChild(
                panel
            );


            panel
                .querySelector(
                    "[data-close-world-map]"
                )
                ?.addEventListener(
                    "click",
                    toggleWorldMapPanel
                );

        }


        const opening =
            panel.classList
                .contains(
                    "hidden"
                );


        if (
            opening
        ) {

            panel.classList
                .remove(
                    "hidden"
                );


            pauseForUI(
                "map"
            );


            renderRuntimeWorldMap();

        }

        else {

            panel.classList
                .add(
                    "hidden"
                );


            resumeFromUI(
                "map"
            );

        }

    }


    function renderRuntimeWorldMap() {

        const runtimeCanvas =
            $("runtimeWorldMapCanvas");


        if (
            !runtimeCanvas ||
            !state.world ||
            !state.player
        ) {

            return;

        }


        const map =
            runtimeCanvas.getContext(
                "2d"
            );


        const width =
            runtimeCanvas.width;


        const height =
            runtimeCanvas.height;


        const scaleX =
            width /
            state.world.width;


        const scaleY =
            height /
            state.world.height;


        map.clearRect(
            0,
            0,
            width,
            height
        );


        map.fillStyle =
            getBiomeStyle()
                .ground;


        map.fillRect(
            0,
            0,
            width,
            height
        );


        map.fillStyle =
            getPathStyle()
                .base;


        for (
            const path of
            state.world.paths
        ) {

            map.fillRect(
                path.x *
                scaleX,
                path.y *
                scaleY,
                path.w *
                scaleX,
                path.h *
                scaleY
            );

        }


        map.font =
            "bold 12px serif";


        map.textAlign =
            "center";


        for (
            const marker of
            getVisibleMapMarkers()
        ) {

            const x =
                marker.x *
                scaleX;


            const y =
                marker.y *
                scaleY;


            map.fillStyle =
                marker.type ===
                    "boss"
                    ? "#dc666d"
                    : marker.type ===
                        "gate"
                        ? "#b58acb"
                        : marker.type ===
                            "fountain"
                            ? "#79c4d8"
                            : "#e6d4ae";


            map.beginPath();


            map.arc(
                x,
                y,
                marker.important
                    ? 6
                    : 4,
                0,
                Math.PI *
                2
            );


            map.fill();


            if (
                marker.label
            ) {

                map.fillStyle =
                    "#efe8d8";


                map.fillText(
                    marker.label,
                    x,
                    y - 12
                );

            }

        }


        map.fillStyle =
            "#ffffff";


        map.beginPath();


        map.arc(
            state.player.x *
            scaleX,
            state.player.y *
            scaleY,
            6,
            0,
            Math.PI *
            2
        );


        map.fill();

    }


    /* =========================================================
       MENU BUTTONS
       ========================================================= */

    function bindMenuButtons() {

        const newGameButtons = [
            $("newGameBtn"),
            $("btnNewGame")
        ]
            .filter(
                Boolean
            );


        newGameButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    startNewGame
                );

            }
        );


        const continueButtons = [
            $("continueBtn"),
            $("btnContinue")
        ]
            .filter(
                Boolean
            );


        continueButtons.forEach(
            button => {

                button.disabled =
                    !hasSave();


                button.addEventListener(
                    "click",
                    loadGame
                );

            }
        );


        const howButtons = [
            $("howBtn"),
            $("btnHow")
        ]
            .filter(
                Boolean
            );


        howButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        showScreen(
                            "how"
                        )
                );

            }
        );


        const creditsButtons = [
            $("creditsBtn"),
            $("btnCredits")
        ]
            .filter(
                Boolean
            );


        creditsButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        showScreen(
                            "credits"
                        )
                );

            }
        );


        document
            .querySelectorAll(
                "[data-back-menu]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () =>
                            showScreen(
                                "menu"
                            )
                    );

                }
            );


        $("startCharacterBtn")
            ?.addEventListener(
                "click",
                confirmCharacterStart
            );

    }


    /* =========================================================
       INPUT BUTTONS GERAIS
       ========================================================= */

    function bindRuntimeButtons() {

        $("battleAcceptBtn")
            ?.addEventListener(
                "click",
                acceptBattle
            );


        $("battleDeclineBtn")
            ?.addEventListener(
                "click",
                declineBattle
            );


        $("travelConfirmBtn")
            ?.addEventListener(
                "click",
                confirmTravel
            );


        $("travelCancelBtn")
            ?.addEventListener(
                "click",
                cancelTravel
            );


        $("questActionBtn")
            ?.addEventListener(
                "click",
                questAction
            );


        $("shopBuyTab")
            ?.addEventListener(
                "click",
                () =>
                    setShopMode(
                        "buy"
                    )
            );


        $("shopSellTab")
            ?.addEventListener(
                "click",
                () =>
                    setShopMode(
                        "sell"
                    )
            );

    }


    /* =========================================================
       ATUALIZAR PONTEIRO WORLD
       ========================================================= */

    function updatePointerWorldCoordinates() {

        const world =
            screenToWorld(
                state.pointer.x,
                state.pointer.y
            );


        state.pointer.worldX =
            world.x;


        state.pointer.worldY =
            world.y;

    }


    /* =========================================================
       FRAME UPDATE
       ========================================================= */

    function updateFrame(
        dt
    ) {

        if (
            !state.running
        ) {

            return;

        }


        state.time +=
            dt;


        /*
            Transições e diálogos precisam funcionar
            mesmo quando state.paused = true.
        */
        updateInteractionSystems(
            dt
        );


        /*
            Gameplay NÃO deve continuar andando
            atrás de diálogo, loja, battle confirm etc.
        */
        if (
            !state.paused
        ) {

            updateGameplaySystems(
                dt
            );

        }

        else {

            /*
                Alguns efeitos puramente visuais
                continuam suaves.
            */
            updateBloodEffects(
                dt
            );

        }


        updateCamera(
            dt
        );


        updatePointerWorldCoordinates();


        updateAutosave(
            dt
        );


        /*
            HUD limitado para não recriar
            texto centenas de vezes por segundo.
        */
        renderRuntime.lastHudUpdate +=
            dt;


        if (
            renderRuntime.lastHudUpdate >=
            0.08
        ) {

            renderRuntime.lastHudUpdate =
                0;


            updateHUD();

        }


        renderRuntime.lastMiniMapUpdate +=
            dt;


        if (
            renderRuntime.lastMiniMapUpdate >=
            0.18
        ) {

            renderRuntime.lastMiniMapUpdate =
                0;


            renderMiniMap();

        }


        syncDevPrivacyVisual();

    }


    /* =========================================================
       LOOP
       ========================================================= */

    function gameLoop(
        timestamp
    ) {

        const previous =
            state.lastTime ||
            timestamp;


        const dt =
            clamp(
                (
                    timestamp -
                    previous
                ) /
                1000,
                0,
                0.05
            );


        state.lastTime =
            timestamp;


        renderRuntime.fpsTime +=
            dt;


        renderRuntime.fpsFrames++;


        if (
            renderRuntime.fpsTime >=
            1
        ) {

            renderRuntime.fps =
                Math.round(
                    renderRuntime
                        .fpsFrames /
                    renderRuntime
                        .fpsTime
                );


            renderRuntime.fpsTime =
                0;


            renderRuntime.fpsFrames =
                0;

        }


        if (
            state.running
        ) {

            updateFrame(
                dt
            );


            renderGameWorld();

        }


        window.requestAnimationFrame(
            gameLoop
        );

    }


    /* =========================================================
       VALIDAÇÃO FINAL
       ========================================================= */

    function validateEntireRuntime() {

        const errors =
            [];


        try {

            if (
                typeof validatePart1Data ===
                "function" &&
                !validatePart1Data()
            ) {

                errors.push(
                    "Falha na validação da Parte 1."
                );

            }

        }

        catch (
            error
        ) {

            errors.push(
                `Parte 1: ${error.message}`
            );

        }


        try {

            if (
                typeof validatePart2Data ===
                "function" &&
                !validatePart2Data()
            ) {

                errors.push(
                    "Falha na validação da Parte 2."
                );

            }

        }

        catch (
            error
        ) {

            errors.push(
                `Parte 2: ${error.message}`
            );

        }


        try {

            if (
                typeof validatePart3Data ===
                "function" &&
                !validatePart3Data()
            ) {

                errors.push(
                    "Falha na validação da Parte 3."
                );

            }

        }

        catch (
            error
        ) {

            errors.push(
                `Parte 3: ${error.message}`
            );

        }


        try {

            if (
                typeof validatePart4Data ===
                "function" &&
                !validatePart4Data()
            ) {

                errors.push(
                    "Falha na validação da Parte 4."
                );

            }

        }

        catch (
            error
        ) {

            errors.push(
                `Parte 4: ${error.message}`
            );

        }


        /*
            Ligações essenciais.
        */
        const requiredFunctions = [

            "buildWorld",
            "updateGameplaySystems",
            "updateInteractionSystems",
            "performBasicAttack",
            "useClassSkill",
            "openDialogue",
            "openShop",
            "saveGame",
            "loadGame"

        ];


        for (
            const name of
            requiredFunctions
        ) {

            try {

                const value =
                    eval(
                        name
                    );


                if (
                    typeof value !==
                    "function"
                ) {

                    errors.push(
                        `Função essencial ausente: ${name}`
                    );

                }

            }

            catch {

                errors.push(
                    `Função essencial ausente: ${name}`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            console.error(
                "VEYRA V25 — validação geral encontrou problemas:",
                errors
            );


            return false;

        }


        console.info(
            "VEYRA V25 — validação estrutural concluída."
        );


        return true;

    }


    /* =========================================================
       CORREÇÕES DE COMPATIBILIDADE DO PLAYER
       ========================================================= */

    function ensurePlayerRuntimeFields() {

        const player =
            state.player;


        if (!player) {

            return;

        }


        player.movementSlowTimer =
            finiteNumber(
                player.movementSlowTimer,
                0
            );


        player.movementSlowMultiplier =
            finiteNumber(
                player.movementSlowMultiplier,
                1
            );


        player.starvationTimer =
            finiteNumber(
                player.starvationTimer,
                0
            );


        player.exhaustionTimer =
            finiteNumber(
                player.exhaustionTimer,
                0
            );


        player.universalDashCooldown =
            finiteNumber(
                player.universalDashCooldown,
                0
            );


        player.poisonEffect =
            player.poisonEffect ||
            null;


        player.guardianRush =
            null;


        player.ironGuard =
            null;


        player.adaptiveBuff =
            null;


        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.activePotionBuffs =
            Array.isArray(
                player.activePotionBuffs
            )
                ? player.activePotionBuffs
                : [];


        player.skillCooldowns =
            player.skillCooldowns ||
            {
                q: 0,
                r: 0,
                f: 0
            };

    }


    /* =========================================================
       SAFE LOAD WRAPPER

       Garante campos runtime após load.
       ========================================================= */

    const originalLoadGame =
        loadGame;


    loadGame =
        function () {

            const loaded =
                originalLoadGame();


            if (
                loaded
            ) {

                ensurePlayerRuntimeFields();

                recalculatePlayerStats();

                updateHUD();

            }


            return loaded;

        };


    /* =========================================================
       SAFE NEW GAME WRAPPER
       ========================================================= */

    const originalConfirmCharacterStart =
        confirmCharacterStart;


    confirmCharacterStart =
        function () {

            const started =
                originalConfirmCharacterStart();


            if (
                started
            ) {

                ensurePlayerRuntimeFields();

                recalculatePlayerStats(
                    {
                        fillResources:
                            true
                    }
                );

                updateHUD();

            }


            return started;

        };


    /* =========================================================
       EVENTOS
       ========================================================= */

    function bindGlobalEvents() {

        window.addEventListener(
            "keydown",
            handleKeyDown
        );


        window.addEventListener(
            "keyup",
            handleKeyUp
        );


        window.addEventListener(
            "blur",
            () => {

                state.keys.clear();

                clearDevHeldKeys();

                state.pointer.down =
                    false;

                cancelHoldCollect();

            }
        );


        window.addEventListener(
            "resize",
            resizeGameCanvas
        );


        if (
            canvas
        ) {

            canvas.addEventListener(
                "pointermove",
                updatePointerPosition
            );


            canvas.addEventListener(
                "pointerdown",
                handlePointerDown
            );


            window.addEventListener(
                "pointerup",
                handlePointerUp
            );


            canvas.addEventListener(
                "contextmenu",
                event =>
                    event.preventDefault()
            );

        }


        window.addEventListener(
            "beforeunload",
            () => {

                if (
                    state.player &&
                    !state.player.dead
                ) {

                    saveGame();

                }

            }
        );

    }


    /* =========================================================
       COMO JOGAR — ÍCONES / AVISOS

       Se o HTML tiver o container,
       preenche automaticamente.
       ========================================================= */

    function renderHowToPlay() {

        const container =
            $("howContent");


        if (!container) {

            return;

        }


        container.innerHTML = `
            <article class="how-item">
                <span>⌨️</span>
                <div>
                    <strong>MOVIMENTO</strong>
                    <p>Use W A S D para caminhar pelo mundo.</p>
                </div>
            </article>

            <article class="how-item">
                <span>🖱️</span>
                <div>
                    <strong>ATAQUE</strong>
                    <p>Clique uma vez para realizar um ataque. Segurar o mouse não repete ataques.</p>
                </div>
            </article>

            <article class="how-item">
                <span>✦</span>
                <div>
                    <strong>HABILIDADES</strong>
                    <p>Use Q, R e F para as habilidades próprias da sua classe.</p>
                </div>
            </article>

            <article class="how-item">
                <span>💨</span>
                <div>
                    <strong>DASH</strong>
                    <p>Após despertar o Dash universal, use Espaço para executá-lo.</p>
                </div>
            </article>

            <article class="how-item">
                <span>🤝</span>
                <div>
                    <strong>INTERAÇÃO</strong>
                    <p>Use E para conversar e interagir. Para coletar recursos, segure E até concluir.</p>
                </div>
            </article>

            <article class="how-item">
                <span>🚪</span>
                <div>
                    <strong>CASAS</strong>
                    <p>As portas abrem quando você se aproxima. Use Z para entrar ou sair.</p>
                </div>
            </article>

            <article class="how-item">
                <span>🎒</span>
                <div>
                    <strong>INVENTÁRIO</strong>
                    <p>Pressione I para abrir sua mochila. Pressione C para distribuir seus pontos de status.</p>
                </div>
            </article>

            <article class="how-item">
                <span>🗺️</span>
                <div>
                    <strong>MAPA</strong>
                    <p>Pressione M para visualizar os pontos importantes da região.</p>
                </div>
            </article>

            <article class="how-item how-warning">
                <span>⚠️</span>
                <div>
                    <strong>CUIDADO</strong>
                    <p>Animais e criaturas possuem ataques próprios. Observe os avisos antes de uma investida.</p>
                </div>
            </article>

            <article class="how-item how-warning">
                <span>⚠️</span>
                <div>
                    <strong>ESCURIDÃO</strong>
                    <p>Algumas passagens são escuras demais para atravessar sem a Lanterna Antiga.</p>
                </div>
            </article>
        `;

    }


    /* =========================================================
       CRÉDITOS
       ========================================================= */

    function renderCredits() {

        const container =
            $("creditsContent");


        if (!container) {

            return;

        }


        container.innerHTML = `
            <div class="credits-entry">
                <span>CONCEITO E CRIAÇÃO DO PROJETO</span>
                <strong>Pedro</strong>
            </div>

            <div class="credits-entry">
                <span>DESENVOLVIMENTO E APOIO DE PROGRAMAÇÃO</span>
                <strong>ChatGPT</strong>
            </div>
        `;

    }


    /* =========================================================
       SANITY CHECK DO MUNDO
       ========================================================= */

    function validateBuiltWorld() {

        if (
            !state.world
        ) {

            return false;

        }


        const issues =
            [];


        for (
            const door of
            state.world.doors
        ) {

            const building =
                state.world
                    .buildings
                    .find(
                        item =>
                            item.id ===
                            door.buildingId
                    );


            if (!building) {

                issues.push(
                    `Porta sem casa: ${door.id}`
                );

                continue;

            }


            const expectedCenter =
                building.x +
                building.w /
                2;


            if (
                Math.abs(
                    door.centerX -
                    expectedCenter
                ) >
                1
            ) {

                issues.push(
                    `Porta desalinhada: ${door.id}`
                );

            }

        }


        if (
            state.area ===
            "monarchMaze"
        ) {

            const barrier =
                state.world
                    .darknessBarriers
                    .find(
                        item =>
                            item.id ===
                            "maze_lantern_barrier"
                    );


            if (!barrier) {

                issues.push(
                    "Barreira obrigatória da lanterna ausente."
                );

            }

        }


        if (
            issues.length >
            0
        ) {

            console.warn(
                "VEYRA — avisos do mapa:",
                issues
            );

        }


        return (
            issues.length ===
            0
        );

    }


    /* =========================================================
       BUILD WORLD WRAPPER

       Valida toda vez que muda área.
       ========================================================= */

    const originalBuildWorld =
        buildWorld;


    buildWorld =
        function () {

            originalBuildWorld();

            validateBuiltWorld();

        };


    /* =========================================================
       PAINEL DEV NO PRIMEIRO USO

       X + Y abre.

       Nunca mostra senha em texto.
       ========================================================= */

    function initializeDevPanel() {

        createDevCommandPanel();

        closeDevCommandPanel();

        syncDevPrivacyVisual();

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function initialize() {

        ensureRuntimeUI();


        bindMenuButtons();

        bindRuntimeButtons();

        bindGlobalEvents();


        renderCharacterSelection();

        renderHowToPlay();

        renderCredits();


        initializeDevPanel();


        resizeGameCanvas();


        /*
            Continua habilitado apenas se
            realmente houver save.
        */
        const continueButtons = [
            $("continueBtn"),
            $("btnContinue")
        ]
            .filter(
                Boolean
            );


        continueButtons.forEach(
            button => {

                button.disabled =
                    !hasSave();

            }
        );


        /*
            Validação estrutural.
        */
        validateEntireRuntime();


        showScreen(
            "menu"
        );


        window.requestAnimationFrame(
            timestamp => {

                state.lastTime =
                    timestamp;


                gameLoop(
                    timestamp
                );

            }
        );

    }


    /* =========================================================
       DOM READY
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    }

    else {

        initialize();

    }


    /* =========================================================
       FIM DO VEYRA V25
       ÚNICO FECHAMENTO DO IIFE
       ========================================================= */

})();
