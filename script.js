(() => {
    "use strict";

    /* =========================================================
       VEYRA: A QUIETUDE — V19
       PARTE 1/3 — BASE, MUNDO, COLISÃO, CASAS E ROTA 1
       Cole a Parte 2 logo abaixo. NÃO feche a IIFE aqui.
       ========================================================= */

    const GAME_VERSION = 19;
    const SAVE_KEY = "veyra_save_v19_stability";

    const LEGACY_SAVE_KEYS = [
        "veyra_save_v18_rebuild",
        "veyra_save_v14_stable"
    ];

    const MAX_LEVEL = 50;
    const POINTS_PER_LEVEL = 3;
    const STAT_CAP = 30;

    const LANTERN_PRICE = 350;

    const DASH_RITUAL_COST = Object.freeze({
        diamante: 45,
        rubi: 60
    });

    const NORTH_GATE_COST = Object.freeze({
        diamante: 40,
        rubi: 55
    });

    const WORLD_MARGIN = 70;

    /*
        IMPORTANTE:

        Caminhos possuem uma área invisível
        um pouco maior do que o desenho deles.

        Pedras, árvores, minérios e recursos
        gerados proceduralmente não poderão
        nascer nessa área.

        Isso corrige o bug de voltar para um
        mapa e encontrar uma pedra bloqueando
        completamente a estrada.
    */

    const PATH_SAFETY_PADDING = 44;

    const SPAWN_ATTEMPTS = 140;


    /* =========================================================
       DOM
       ========================================================= */

    const $ = id =>
        document.getElementById(id);


    const must = id => {

        const element =
            $(id);

        if (!element) {

            throw new Error(
                `Elemento obrigatório não encontrado: #${id}`
            );

        }

        return element;

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


    /* =========================================================
       PERSONAGENS
       ========================================================= */

    const CHARACTERS = [

        {
            id:
                "kaelion",

            name:
                "KAELION",

            className:
                "Mago",

            icon:
                "🧙",

            role:
                "Magia • Longo alcance",

            description:
                "Grande poder mágico, controle à distância e menor resistência física.",

            story:
                "Estudioso de memórias antigas, Kaelion sente a magia desaparecer junto com as lembranças do mundo.",

            hp:
                85,

            magic:
                145,

            energy:
                115,

            speed:
                178,

            damage:
                25,

            defense:
                5,

            color:
                "#e49345",

            bg:
                "rgba(228,147,69,.16)",

            glow:
                "rgba(228,147,69,.28)",

            skill:
                "Bola de Memória",

            /*
                O emoji continua podendo aparecer
                na interface/cartão.

                Durante o jogo, porém, a Parte 3
                vai desenhar um bonequinho real
                usando estas informações.
            */

            sprite: {

                skin:
                    "#d7aa7e",

                hair:
                    "#493225",

                body:
                    "#b86a2f",

                trim:
                    "#f1ba61",

                cape:
                    "#773e2b",

                weapon:
                    "staff",

                accent:
                    "#ffb45f"

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
                "🛡️",

            role:
                "Espada • Defesa",

            description:
                "Muita defesa, boa vida e combate corpo a corpo.",

            story:
                "Theron jurou proteger a Vila do Crepúsculo enquanto ainda houver alguém capaz de lembrar seu nome.",

            hp:
                145,

            magic:
                75,

            energy:
                120,

            speed:
                145,

            damage:
                30,

            defense:
                21,

            color:
                "#bfc5ce",

            bg:
                "rgba(191,197,206,.14)",

            glow:
                "rgba(191,197,206,.23)",

            skill:
                "Golpe Pesado",

            sprite: {

                skin:
                    "#c99d78",

                hair:
                    "#493a32",

                body:
                    "#777d86",

                trim:
                    "#c9cfd8",

                cape:
                    "#4e525a",

                weapon:
                    "sword",

                accent:
                    "#e8edf2"

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
                "👹",

            role:
                "Força • Vida",

            description:
                "Enorme vida e dano físico, porém pouca velocidade.",

            story:
                "Grumgar deixou as cavernas para descobrir por que criaturas de sua espécie começaram a esquecer suas próprias tribos.",

            hp:
                180,

            magic:
                55,

            energy:
                95,

            speed:
                112,

            damage:
                39,

            defense:
                18,

            color:
                "#718f51",

            bg:
                "rgba(113,143,81,.16)",

            glow:
                "rgba(113,143,81,.24)",

            skill:
                "Esmagamento",

            sprite: {

                skin:
                    "#718f51",

                hair:
                    "#3c4930",

                body:
                    "#56493a",

                trim:
                    "#8f7755",

                cape:
                    null,

                weapon:
                    "club",

                accent:
                    "#b9d18d",

                scale:
                    1.12

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
                "🧚",

            role:
                "Velocidade • Cura",

            description:
                "Muito rápida, mágica e capaz de restaurar vida.",

            story:
                "Lirael percebeu que flores mágicas paravam de brilhar sempre que uma memória desaparecia.",

            hp:
                95,

            magic:
                135,

            energy:
                135,

            speed:
                210,

            damage:
                20,

            defense:
                7,

            color:
                "#dd8bd0",

            bg:
                "rgba(221,139,208,.16)",

            glow:
                "rgba(221,139,208,.25)",

            skill:
                "Luz Vital",

            sprite: {

                skin:
                    "#e6b99b",

                hair:
                    "#f0c7dc",

                body:
                    "#b963a9",

                trim:
                    "#ffd4f2",

                cape:
                    null,

                weapon:
                    "wand",

                accent:
                    "#ffb9ec",

                wings:
                    true,

                scale:
                    0.92

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
                "🦊",

            role:
                "Adaptação • Equilíbrio",

            description:
                "Atributos equilibrados e habilidade de adaptação temporária.",

            story:
                "Zephyr muda de forma para sobreviver, mas teme o dia em que esquecerá qual delas era a sua verdadeira forma.",

            hp:
                115,

            magic:
                108,

            energy:
                112,

            speed:
                170,

            damage:
                26,

            defense:
                13,

            color:
                "#8f6bd8",

            bg:
                "rgba(143,107,216,.16)",

            glow:
                "rgba(143,107,216,.25)",

            skill:
                "Forma Adaptativa",

            sprite: {

                skin:
                    "#c79c84",

                hair:
                    "#4d355d",

                body:
                    "#7049a9",

                trim:
                    "#b799ef",

                cape:
                    "#402c58",

                weapon:
                    "blade",

                accent:
                    "#b88cff"

            }

        }

    ];


    /* =========================================================
       PONTOS DE STATUS
       ========================================================= */

    const STAT_CONFIG = {

        strength: {

            label:
                "FORÇA",

            cap:
                STAT_CAP,

            description:
                "+2% de dano por ponto"

        },


        energy: {

            label:
                "ENERGIA",

            cap:
                STAT_CAP,

            description:
                "+5 de energia máxima por ponto"

        },


        fatigue: {

            label:
                "CANSAÇO",

            cap:
                STAT_CAP,

            description:
                "+3 de cansaço máximo por ponto"

        },


        hunger: {

            label:
                "FOME",

            cap:
                STAT_CAP,

            description:
                "+3 de fome máxima por ponto"

        },


        hp: {

            label:
                "HP",

            cap:
                STAT_CAP,

            description:
                "+8 de HP máximo por ponto"

        }

    };


    /* =========================================================
       ITENS
       ========================================================= */

    const ITEMS = {

        madeira: {

            name:
                "Madeira",

            icon:
                "🪵",

            category:
                "materials",

            weight:
                1,

            value:
                2

        },


        carvao: {

            name:
                "Carvão",

            icon:
                "⬛",

            category:
                "materials",

            weight:
                1,

            value:
                6

        },


        ferro: {

            name:
                "Ferro",

            icon:
                "⛓️",

            category:
                "materials",

            weight:
                2,

            value:
                14

        },


        ouro: {

            name:
                "Ouro",

            icon:
                "🪙",

            category:
                "materials",

            weight:
                2,

            value:
                30

        },


        diamante: {

            name:
                "Diamante",

            icon:
                "💎",

            category:
                "materials",

            weight:
                2,

            value:
                58,

            bulkProtected:
                true

        },


        rubi: {

            name:
                "Rubi",

            icon:
                "♦️",

            category:
                "materials",

            weight:
                2,

            value:
                75,

            bulkProtected:
                true

        },


        essencia: {

            name:
                "Essência da Quietude",

            icon:
                "✦",

            category:
                "special",

            weight:
                1,

            value:
                100,

            bulkProtected:
                true

        },


        fragmentoMemoria: {

            name:
                "Fragmento de Memória",

            icon:
                "◈",

            category:
                "special",

            weight:
                1,

            value:
                90,

            bulkProtected:
                true

        },


        flautaMemoria: {

            name:
                "Flauta da Memória",

            icon:
                "🎵",

            category:
                "special",

            weight:
                1,

            value:
                0,

            bulkProtected:
                true,

            questItem:
                true

        },


        minimapa: {

            name:
                "Minimapa de Veyra",

            icon:
                "🗺️",

            category:
                "map",

            weight:
                0,

            value:
                180,

            unique:
                true,

            bulkProtected:
                true

        },


        lanterna: {

            name:
                "Lanterna",

            icon:
                "🏮",

            category:
                "tools",

            weight:
                1,

            value:
                LANTERN_PRICE,

            unique:
                true,

            bulkProtected:
                true

        },


        cenoura: {

            name:
                "Cenoura",

            icon:
                "🥕",

            category:
                "food",

            weight:
                0.2,

            value:
                4,

            /*
                Cenoura restaurando menos fome.
            */

            hunger:
                10

        },


        pocao: {

            name:
                "Poção de Cura",

            icon:
                "🧪",

            category:
                "potions",

            weight:
                1,

            value:
                30,

            heal:
                45

        },


        elixir: {

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
                50

        },


        pocaoForca: {

            name:
                "Poção de Força",

            icon:
                "🔴",

            category:
                "potions",

            weight:
                1,

            value:
                70,

            buff:
                "strength",

            duration:
                15

        },


        pocaoResistencia: {

            name:
                "Poção de Resistência",

            icon:
                "🟤",

            category:
                "potions",

            weight:
                1,

            value:
                70,

            buff:
                "resistance",

            duration:
                15

        },


        pocaoVelocidade: {

            name:
                "Poção de Velocidade",

            icon:
                "🟡",

            category:
                "potions",

            weight:
                1,

            value:
                70,

            buff:
                "speed",

            duration:
                15

        },


        espadaSimples: {

            name:
                "Espada Simples",

            icon:
                "🗡️",

            category:
                "weapons",

            weight:
                3,

            value:
                45,

            damage:
                6,

            bulkProtected:
                true

        },


        espadaFerro: {

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
                12

        },


        machado: {

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

            bulkProtected:
                true

        },


        armaduraFolha: {

            name:
                "Armadura de Folha",

            icon:
                "🍃",

            category:
                "armor",

            weight:
                2,

            value:
                40,

            defense:
                3

        },


        armaduraAlgodao: {

            name:
                "Armadura de Algodão",

            icon:
                "☁️",

            category:
                "armor",

            weight:
                3,

            value:
                75,

            defense:
                5

        },


        armaduraMadeira: {

            name:
                "Armadura de Madeira",

            icon:
                "🪵",

            category:
                "armor",

            weight:
                5,

            value:
                120,

            defense:
                8

        },


        armaduraCouro: {

            name:
                "Armadura de Couro",

            icon:
                "🥋",

            category:
                "armor",

            weight:
                5,

            value:
                190,

            defense:
                11

        },


        armaduraFerro: {

            name:
                "Armadura de Ferro",

            icon:
                "⛓️",

            category:
                "armor",

            weight:
                7,

            value:
                360,

            defense:
                16

        },


        armaduraOuro: {

            name:
                "Armadura de Ouro",

            icon:
                "🟨",

            category:
                "armor",

            weight:
                8,

            value:
                620,

            defense:
                21

        },


        armaduraDiamante: {

            name:
                "Armadura de Diamante",

            icon:
                "💎",

            category:
                "armor",

            weight:
                8,

            value:
                980,

            defense:
                28

        },


        armaduraRubi: {

            name:
                "Armadura de Rubi",

            icon:
                "♦️",

            category:
                "armor",

            weight:
                8,

            value:
                1450,

            defense:
                36

        }

    };


    /* =========================================================
       PROGRESSÃO DE ARMADURAS DO BORIN
       ========================================================= */

    const ARMOR_UPGRADES = [

        {

            id:
                "armaduraFerro",

            material:
                "ferro",

            materialAmount:
                30,

            coins:
                260

        },


        {

            id:
                "armaduraOuro",

            material:
                "ouro",

            materialAmount:
                34,

            coins:
                480

        },


        {

            id:
                "armaduraDiamante",

            material:
                "diamante",

            materialAmount:
                38,

            coins:
                760

        },


        {

            id:
                "armaduraRubi",

            material:
                "rubi",

            materialAmount:
                48,

            coins:
                1100

        }

    ];


    /* =========================================================
       REGIÕES
       ========================================================= */

    const REGIONS = {

        village: {

            name:
                "VILA DO CREPÚSCULO",

            width:
                3200,

            height:
                2200,

            visual:
                "village"

        },


        forest: {

            name:
                "FLORESTA",

            width:
                3400,

            height:
                2400,

            visual:
                "forest"

        },


        grove: {

            name:
                "BOSQUE",

            width:
                3200,

            height:
                2300,

            visual:
                "grove"

        },


        mountains: {

            name:
                "MONTANHAS",

            width:
                3500,

            height:
                2300,

            visual:
                "mountains"

        },


        iron: {

            name:
                "CAVERNA DE FERRO",

            width:
                3000,

            height:
                2000,

            visual:
                "iron"

        },


        ruby: {

            name:
                "CAVERNA DE RUBI",

            width:
                3200,

            height:
                2150,

            visual:
                "ruby"

        },


        monarchMaze: {

            name:
                "LABIRINTO DO MONARCA",

            width:
                3600,

            height:
                2200,

            visual:
                "monarchMaze"

        },


        shadow: {

            name:
                "CAVERNA SOMBRIA",

            width:
                3000,

            height:
                2000,

            visual:
                "shadow"

        },


        fairy: {

            name:
                "REINO DAS FADAS",

            width:
                3200,

            height:
                2200,

            visual:
                "fairy"

        },


        sky: {

            name:
                "CÉU",

            width:
                3400,

            height:
                2200,

            visual:
                "sky"

        },


        hell: {

            name:
                "INFERNO",

            width:
                3600,

            height:
                2400,

            visual:
                "hell"

        },


        final: {

            name:
                "CÂMARA FINAL",

            width:
                2200,

            height:
                1500,

            visual:
                "final"

        }

    };


    const PREVIOUS_REGION = {

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

    };


    /* =========================================================
       PALETAS DOS BIOMAS

       A Parte 3 utiliza isso para deixar
       o chão menos chapado e mais bonito.
       ========================================================= */

    const BIOME_STYLE = {

        village: {

            ground:
                "#506a49",

            ground2:
                "#496243",

            dirt:
                "#9b8056",

            accent:
                "#78946c",

            speck:
                "#91a37f"

        },


        forest: {

            ground:
                "#31583a",

            ground2:
                "#294d33",

            dirt:
                "#806f4e",

            accent:
                "#476e49",

            speck:
                "#60825a"

        },


        grove: {

            ground:
                "#2e503b",

            ground2:
                "#284636",

            dirt:
                "#77674c",

            accent:
                "#4d6d58",

            speck:
                "#69806c"

        },


        mountains: {

            ground:
                "#858d8d",

            ground2:
                "#747d7e",

            dirt:
                "#b1aaa0",

            accent:
                "#c4cbcb",

            speck:
                "#dce0df"

        },


        iron: {

            ground:
                "#24282c",

            ground2:
                "#1d2124",

            dirt:
                "#4e4841",

            accent:
                "#66696b",

            speck:
                "#7b7871"

        },


        ruby: {

            ground:
                "#44242d",

            ground2:
                "#351d25",

            dirt:
                "#6f3c45",

            accent:
                "#9c4f62",

            speck:
                "#c16a7b"

        },


        monarchMaze: {

            ground:
                "#111015",

            ground2:
                "#0b0a0d",

            dirt:
                "#2a252e",

            accent:
                "#433b49",

            speck:
                "#5c5063"

        },


        shadow: {

            ground:
                "#1a1e2f",

            ground2:
                "#121625",

            dirt:
                "#31364c",

            accent:
                "#4b5070",

            speck:
                "#62698b"

        },


        fairy: {

            ground:
                "#58476a",

            ground2:
                "#463956",

            dirt:
                "#8a70a0",

            accent:
                "#a987bd",

            speck:
                "#d3b3dd"

        },


        sky: {

            ground:
                "#8eafc5",

            ground2:
                "#7e9fb5",

            dirt:
                "#d3dbe0",

            accent:
                "#edf2f5",

            speck:
                "#ffffff"

        },


        hell: {

            ground:
                "#4a241f",

            ground2:
                "#391b18",

            dirt:
                "#73382e",

            accent:
                "#a14a35",

            speck:
                "#dc7047"

        },


        final: {

            ground:
                "#19171d",

            ground2:
                "#111014",

            dirt:
                "#3a3540",

            accent:
                "#675e70",

            speck:
                "#9a8ea3"

        }

    };


    /* =========================================================
       CONFIGURAÇÃO VISUAL
       ========================================================= */

    const VISUAL_CONFIG = {

        /*
            Barra menor e mais baixa.

            A Parte 3 também verificará
            o tamanho da tela para não
            ficar atrás dos botões do HUD.
        */

        bossBar: {

            maxWidth:
                500,

            minWidth:
                260,

            topDesktop:
                96,

            topCompact:
                118,

            height:
                18

        },


        blood: {

            maxMarks:
                20,

            flashMax:
                0.64,

            markLife:
                2.4

        },


        lantern: {

            radius:
                132,

            noLanternRadius:
                24

        },


        sprite: {

            playerRadius:
                18,

            shadowAlpha:
                0.24

        }

    };


    /* =========================================================
       PORTÃO NORTE
       ========================================================= */

    const NORTH_GATE_DIALOGUES = [

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

    ];


    const BLOCKED_ROUTE_DIALOGUES = {

        west: [

            [

                "Uma pressão antiga percorre o portão do oeste.",

                "Ainda não há nada em você capaz de responder a ela."

            ],


            [

                "As marcas na pedra parecem reconhecer sua presença, mas não cedem.",

                "Talvez outro caminho de Veyra guarde a resposta."

            ],


            [

                "O portão permanece imóvel.",

                "Forçá-lo agora não adiantaria."

            ]

        ],


        south: [

            [

                "O ar ao sul parece pesado demais.",

                "Alguma coisa ainda impede sua passagem."

            ],


            [

                "Você escuta um som distante sob a terra.",

                "O caminho ainda não se revelou."

            ],


            [

                "A passagem do sul permanece fechada.",

                "Veyra ainda não terminou de mostrar o que existe antes dela."

            ]

        ]

    };


    /* =========================================================
       NPCs
       ========================================================= */

    const NPC_LIBRARY = {

        ELIAN: {

            id:
                "elian",

            name:
                "ELIAN",

            role:
                "Morador",

            color:
                "#d4b27c",

            spriteType:
                "villager",

            lines: [

                "A Quietude não apaga apenas nomes.",

                "Às vezes ela leva o motivo pelo qual você queria lembrar."

            ]

        },


        MARA: {

            id:
                "mara",

            name:
                "MARA",

            role:
                "Moradora",

            color:
                "#bd8bc4",

            spriteType:
                "villager",

            lines: [

                "As estradas mudaram desde que as memórias começaram a sumir.",

                "Não confie em um caminho só porque você lembra dele."

            ]

        },


        DORAN: {

            id:
                "doran",

            name:
                "DORAN",

            role:
                "Comerciante",

            color:
                "#c98d55",

            spriteType:
                "merchant",

            merchant:
                true,

            lines: [

                "Tenho comida, poções, mapa, lanterna e armaduras simples.",

                "Couro é a melhor armadura que eu vendo. Para algo melhor, fale com Borin."

            ]

        },


        BRAN: {

            id:
                "bran",

            name:
                "BRAN",

            role:
                "Carpinteiro",

            color:
                "#8c7052",

            spriteType:
                "carpenter",

            questId:
                "wood",

            lines: [

                "Madeira boa ainda vale alguma coisa por aqui.",

                "Se tiver um machado, segure E perto das árvores."

            ]

        },


        BORIN: {

            id:
                "borin",

            name:
                "BORIN",

            role:
                "Ferreiro",

            color:
                "#a38b73",

            spriteType:
                "blacksmith",

            blacksmith:
                true,

            questId:
                "coal",

            lines: [

                "Doran cuida do básico. Eu trabalho com Ferro, Ouro, Diamante e Rubi.",

                "Material raro sem preparo é só peso na mochila."

            ]

        }

    };


    /* =========================================================
       HABILIDADES
       ========================================================= */

    const CLASS_SKILLS = {

        kaelion: {

            q: {

                name:
                    "Bola de Memória",

                level:
                    1,

                costType:
                    "magic",

                cost:
                    15,

                cooldown:
                    2,

                damage:
                    25,

                range:
                    330,

                vfx:
                    "memoryOrb"

            },


            r: {

                name:
                    "Nova Arcana",

                level:
                    5,

                costType:
                    "magic",

                cost:
                    22,

                cooldown:
                    6,

                damage:
                    38,

                range:
                    145,

                vfx:
                    "arcaneNova"

            },


            f: {

                name:
                    "Tempestade de Memórias",

                level:
                    10,

                costType:
                    "magic",

                cost:
                    34,

                cooldown:
                    11,

                damage:
                    58,

                range:
                    220,

                vfx:
                    "memoryStorm"

            }

        },


        theron: {

            q: {

                name:
                    "Golpe Pesado",

                level:
                    1,

                costType:
                    "energy",

                cost:
                    10,

                cooldown:
                    3,

                damage:
                    35,

                range:
                    92,

                vfx:
                    "heavySlash"

            },


            r: {

                name:
                    "Guarda de Aço",

                level:
                    5,

                costType:
                    "energy",

                cost:
                    16,

                cooldown:
                    7,

                damage:
                    0,

                range:
                    0,

                vfx:
                    "guardianShield"

            },


            f: {

                name:
                    "Juramento do Guardião",

                level:
                    10,

                costType:
                    "energy",

                cost:
                    25,

                cooldown:
                    12,

                damage:
                    52,

                range:
                    130,

                vfx:
                    "steelOath"

            }

        },


        grumgar: {

            q: {

                name:
                    "Esmagamento",

                level:
                    1,

                costType:
                    "energy",

                cost:
                    8,

                cooldown:
                    4,

                damage:
                    45,

                range:
                    105,

                vfx:
                    "smash"

            },


            r: {

                name:
                    "Rugido",

                level:
                    5,

                costType:
                    "energy",

                cost:
                    16,

                cooldown:
                    7,

                damage:
                    22,

                range:
                    165,

                vfx:
                    "roar"

            },


            f: {

                name:
                    "Abalo da Terra",

                level:
                    10,

                costType:
                    "energy",

                cost:
                    26,

                cooldown:
                    12,

                damage:
                    68,

                range:
                    205,

                vfx:
                    "earthquake"

            }

        },


        lirael: {

            q: {

                name:
                    "Luz Vital",

                level:
                    1,

                costType:
                    "magic",

                cost:
                    14,

                cooldown:
                    4,

                damage:
                    0,

                range:
                    0,

                vfx:
                    "fairyHeal"

            },


            r: {

                name:
                    "Flecha Feérica",

                level:
                    5,

                costType:
                    "magic",

                cost:
                    18,

                cooldown:
                    4.5,

                damage:
                    32,

                range:
                    350,

                vfx:
                    "fairyArrow"

            },


            f: {

                name:
                    "Chuva de Estrelas",

                level:
                    10,

                costType:
                    "magic",

                cost:
                    30,

                cooldown:
                    10,

                damage:
                    54,

                range:
                    215,

                vfx:
                    "starRain"

            }

        },


        zephyr: {

            q: {

                name:
                    "Forma Adaptativa",

                level:
                    1,

                costType:
                    "magic",

                cost:
                    12,

                cooldown:
                    7,

                damage:
                    0,

                range:
                    0,

                vfx:
                    "adaptiveForm"

            },


            r: {

                name:
                    "Passo Mutável",

                level:
                    5,

                costType:
                    "energy",

                cost:
                    12,

                cooldown:
                    4,

                damage:
                    26,

                range:
                    190,

                vfx:
                    "chimeraDash"

            },


            f: {

                name:
                    "Forma Perfeita",

                level:
                    10,

                costType:
                    "magic",

                cost:
                    28,

                cooldown:
                    12,

                damage:
                    55,

                range:
                    170,

                vfx:
                    "perfectForm"

            }

        }

    };


    /* =========================================================
       LIVRO DOS BOSSES
       ========================================================= */

    const BOSS_REGISTRY = [

        {

            id:
                "road_guardian",

            name:
                "GUARDIÃO DA ESTRADA",

            region:
                "village",

            icon:
                "◆",

            quote:
                "A primeira passagem não se abre para quem hesita."

        },


        {

            id:
                "forest_warden",

            name:
                "VIGIA DA FLORESTA",

            region:
                "forest",

            icon:
                "♠",

            quote:
                "As árvores lembram passos que você esqueceu."

        },


        {

            id:
                "grove_heart",

            name:
                "CORAÇÃO DO BOSQUE",

            region:
                "grove",

            icon:
                "✿",

            quote:
                "Algo pulsa sob raízes antigas."

        },


        {

            id:
                "mountain_colossus",

            name:
                "COLOSSO DA MONTANHA",

            region:
                "mountains",

            icon:
                "▲",

            quote:
                "A pedra não precisa correr para vencer."

        },


        {

            id:
                "iron_tyrant",

            name:
                "TIRANO DE FERRO",

            region:
                "iron",

            icon:
                "⬢",

            quote:
                "Ferro guarda marcas que o tempo não apaga."

        },


        {

            id:
                "ruby_chimera",

            name:
                "QUIMERA RUBRA",

            region:
                "ruby",

            icon:
                "♦",

            quote:
                "O rubi parece vivo quando ela desperta."

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

            quote:
                "A oferenda foi aceita... mas não por você."

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

            quote:
                "O segundo caminho não perdoa lentidão."

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

            quote:
                "Nem toda luz deseja ser encontrada."

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

            quote:
                "A memória abre aquilo que a força não alcança."

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

            quote:
                "A última porta cobra tudo que veio antes."

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

            quote:
                "Você reconhece o rosto antes de reconhecer a voz."

        }

    ];


    /* =========================================================
       INTERIORES
       ========================================================= */

    const HOUSE_INTERIORS = {

        home: {

            room: {

                x:
                    920,

                y:
                    610,

                w:
                    1180,

                h:
                    760

            },

            floor:
                "#73583f",

            wall:
                "#3b2d25",

            trim:
                "#c29c69",

            spawn: {

                x:
                    1510,

                y:
                    1180

            },

            furniture: [

                {

                    id:
                        "home_bed",

                    type:
                        "bed",

                    x:
                        1040,

                    y:
                        745,

                    w:
                        230,

                    h:
                        150,

                    solid:
                        true,

                    sleep:
                        true

                },


                {

                    id:
                        "home_table",

                    type:
                        "table",

                    x:
                        1490,

                    y:
                        800,

                    w:
                        180,

                    h:
                        120,

                    solid:
                        true

                },


                {

                    id:
                        "home_chest",

                    type:
                        "chest",

                    x:
                        1850,

                    y:
                        760,

                    w:
                        110,

                    h:
                        90,

                    solid:
                        true

                },


                {

                    id:
                        "home_shelf",

                    type:
                        "bookshelf",

                    x:
                        1890,

                    y:
                        1020,

                    w:
                        120,

                    h:
                        210,

                    solid:
                        true

                },


                {

                    id:
                        "home_rug",

                    type:
                        "rug",

                    x:
                        1380,

                    y:
                        1000,

                    w:
                        300,

                    h:
                        190,

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
                    920,

                y:
                    610,

                w:
                    1180,

                h:
                    760

            },

            floor:
                "#685340",

            wall:
                "#332923",

            trim:
                "#b99a70",

            spawn: {

                x:
                    1510,

                y:
                    1180

            },

            furniture: [

                {

                    id:
                        "elian_bed",

                    type:
                        "bed",

                    x:
                        1040,

                    y:
                        750,

                    w:
                        220,

                    h:
                        145,

                    solid:
                        true

                },


                {

                    id:
                        "elian_desk",

                    type:
                        "desk",

                    x:
                        1680,

                    y:
                        760,

                    w:
                        220,

                    h:
                        105,

                    solid:
                        true

                },


                {

                    id:
                        "elian_shelf",

                    type:
                        "bookshelf",

                    x:
                        1890,

                    y:
                        970,

                    w:
                        120,

                    h:
                        225,

                    solid:
                        true

                },


                {

                    id:
                        "elian_rug",

                    type:
                        "rug",

                    x:
                        1330,

                    y:
                        980,

                    w:
                        320,

                    h:
                        190,

                    solid:
                        false

                }

            ],

            npcs:
                []

        },


        shop: {

            room: {

                x:
                    820,

                y:
                    560,

                w:
                    1380,

                h:
                    820

            },

            floor:
                "#6f533b",

            wall:
                "#32281f",

            trim:
                "#d2a86d",

            spawn: {

                x:
                    1510,

                y:
                    1200

            },

            furniture: [

                {

                    id:
                        "shop_counter",

                    type:
                        "counter",

                    x:
                        1320,

                    y:
                        725,

                    w:
                        430,

                    h:
                        105,

                    solid:
                        true

                },


                {

                    id:
                        "shop_shelf_1",

                    type:
                        "shopShelf",

                    x:
                        910,

                    y:
                        700,

                    w:
                        125,

                    h:
                        300,

                    solid:
                        true

                },


                {

                    id:
                        "shop_shelf_2",

                    type:
                        "shopShelf",

                    x:
                        1980,

                    y:
                        700,

                    w:
                        125,

                    h:
                        300,

                    solid:
                        true

                },


                {

                    id:
                        "shop_crates",

                    type:
                        "crate",

                    x:
                        1830,

                    y:
                        1080,

                    w:
                        170,

                    h:
                        100,

                    solid:
                        true

                },


                {

                    id:
                        "shop_rug",

                    type:
                        "rug",

                    x:
                        1340,

                    y:
                        965,

                    w:
                        360,

                    h:
                        190,

                    solid:
                        false

                }

            ],

            npcs: [

                {

                    ...NPC_LIBRARY.DORAN,

                    x:
                        1535,

                    y:
                        675,

                    radius:
                        18

                }

            ]

        },


        forge: {

            room: {

                x:
                    800,

                y:
                    540,

                w:
                    1420,

                h:
                    850

            },

            floor:
                "#4d4843",

            wall:
                "#282626",

            trim:
                "#9b8170",

            spawn: {

                x:
                    1510,

                y:
                    1200

            },

            furniture: [

                {

                    id:
                        "forge_furnace",

                    type:
                        "furnace",

                    x:
                        920,

                    y:
                        680,

                    w:
                        260,

                    h:
                        245,

                    solid:
                        true,

                    forge:
                        true

                },


                {

                    id:
                        "forge_anvil",

                    type:
                        "anvil",

                    x:
                        1435,

                    y:
                        840,

                    w:
                        150,

                    h:
                        115,

                    solid:
                        true,

                    forge:
                        true

                },


                {

                    id:
                        "forge_bench",

                    type:
                        "workbench",

                    x:
                        1840,

                    y:
                        690,

                    w:
                        240,

                    h:
                        125,

                    solid:
                        true,

                    forge:
                        true

                },


                {

                    id:
                        "forge_ore",

                    type:
                        "oreCrate",

                    x:
                        1910,

                    y:
                        1040,

                    w:
                        150,

                    h:
                        110,

                    solid:
                        true

                }

            ],

            npcs: [

                {

                    ...NPC_LIBRARY.BORIN,

                    x:
                        1670,

                    y:
                        730,

                    radius:
                        19

                }

            ]

        },


        woodshop: {

            room: {

                x:
                    840,

                y:
                    570,

                w:
                    1340,

                h:
                    800

            },

            floor:
                "#775a3e",

            wall:
                "#35291f",

            trim:
                "#bd9160",

            spawn: {

                x:
                    1510,

                y:
                    1190

            },

            furniture: [

                {

                    id:
                        "wood_bench",

                    type:
                        "workbench",

                    x:
                        1110,

                    y:
                        720,

                    w:
                        310,

                    h:
                        120,

                    solid:
                        true

                },


                {

                    id:
                        "wood_logs",

                    type:
                        "logStack",

                    x:
                        1790,

                    y:
                        710,

                    w:
                        240,

                    h:
                        150,

                    solid:
                        true

                },


                {

                    id:
                        "wood_boards",

                    type:
                        "boardStack",

                    x:
                        1860,

                    y:
                        1010,

                    w:
                        190,

                    h:
                        105,

                    solid:
                        true

                },


                {

                    id:
                        "wood_crate",

                    type:
                        "crate",

                    x:
                        980,

                    y:
                        1030,

                    w:
                        130,

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
                        1540,

                    y:
                        760,

                    radius:
                        18

                }

            ]

        }

    };


    /* =========================================================
       TIPOS DE INIMIGOS

       spriteType será desenhado como bonequinho
       na Parte 3 em vez de usar o emoji como
       personagem do mapa.
       ========================================================= */

    const ENEMY_TYPES = {

        duskling: {

            name:
                "ERRANTE DA QUIETUDE",

            spriteType:
                "duskling",

            color:
                "#626772",

            hp:
                72,

            damage:
                10,

            speed:
                88,

            vision:
                250,

            attackRange:
                62,

            radius:
                20,

            xp:
                22

        },


        wolf: {

            name:
                "LOBO FLORESTAL",

            spriteType:
                "wolf",

            color:
                "#68736b",

            hp:
                96,

            damage:
                14,

            speed:
                105,

            vision:
                285,

            attackRange:
                62,

            radius:
                21,

            xp:
                30

        },


        boar: {

            name:
                "JAVALI SOMBRIO",

            spriteType:
                "boar",

            color:
                "#6f5d48",

            hp:
                118,

            damage:
                17,

            speed:
                90,

            vision:
                250,

            attackRange:
                66,

            radius:
                23,

            xp:
                34

        },


        thornling: {

            name:
                "ESPINHEIRO VIVO",

            spriteType:
                "thornling",

            color:
                "#527051",

            hp:
                128,

            damage:
                18,

            speed:
                76,

            vision:
                255,

            attackRange:
                74,

            radius:
                23,

            xp:
                39

        },


        moth: {

            name:
                "MARIPOSA DE MEMÓRIA",

            spriteType:
                "moth",

            color:
                "#7a6684",

            hp:
                88,

            damage:
                15,

            speed:
                118,

            vision:
                300,

            attackRange:
                150,

            radius:
                19,

            xp:
                40

        },


        stoneCrawler: {

            name:
                "RASTEJANTE DE PEDRA",

            spriteType:
                "crawler",

            color:
                "#7b7f7c",

            hp:
                155,

            damage:
                22,

            speed:
                72,

            vision:
                260,

            attackRange:
                68,

            radius:
                25,

            xp:
                48

        },


        snowRaider: {

            name:
                "SAQUEADOR DA NEVE",

            spriteType:
                "raider",

            color:
                "#a9b2b4",

            hp:
                138,

            damage:
                23,

            speed:
                96,

            vision:
                285,

            attackRange:
                72,

            radius:
                22,

            xp:
                49

        },


        ironBeetle: {

            name:
                "BESOURO DE FERRO",

            spriteType:
                "beetle",

            color:
                "#5c6367",

            hp:
                172,

            damage:
                25,

            speed:
                78,

            vision:
                260,

            attackRange:
                65,

            radius:
                24,

            xp:
                56

        },


        mineWraith: {

            name:
                "ESPECTRO DA MINA",

            spriteType:
                "wraith",

            color:
                "#6e7078",

            hp:
                134,

            damage:
                26,

            speed:
                104,

            vision:
                310,

            attackRange:
                160,

            radius:
                21,

            xp:
                60

        },


        rubyHound: {

            name:
                "CÃO RUBRO",

            spriteType:
                "hound",

            color:
                "#8d4353",

            hp:
                188,

            damage:
                29,

            speed:
                108,

            vision:
                300,

            attackRange:
                67,

            radius:
                23,

            xp:
                70

        },


        rubyAcolyte: {

            name:
                "ACÓLITO RUBRO",

            spriteType:
                "acolyte",

            color:
                "#713847",

            hp:
                158,

            damage:
                30,

            speed:
                88,

            vision:
                320,

            attackRange:
                175,

            radius:
                22,

            xp:
                72

        },


        spider: {

            name:
                "ARANHA DO VÉU",

            spriteType:
                "spider",

            color:
                "#443b49",

            hp:
                125,

            damage:
                23,

            speed:
                108,

            vision:
                240,

            attackRange:
                62,

            radius:
                21,

            xp:
                58

        },


        scorpion: {

            name:
                "ESCORPIÃO PÁLIDO",

            spriteType:
                "scorpion",

            color:
                "#66595c",

            hp:
                158,

            damage:
                30,

            speed:
                86,

            vision:
                245,

            attackRange:
                88,

            radius:
                24,

            xp:
                67

        },


        bat: {

            name:
                "MORCEGO DA QUIETUDE",

            spriteType:
                "bat",

            color:
                "#4c4556",

            hp:
                92,

            damage:
                20,

            speed:
                132,

            vision:
                320,

            attackRange:
                145,

            radius:
                18,

            xp:
                55

        }

    };


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

            obstacles:
                [],

            buildings:
                [],

            doors:
                [],

            trees:
                [],

            resources:
                [],

            foods:
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

            trials:
                [],

            paths:
                [],

            decorations:
                [],

            protectedZones:
                [],

            hazards:
                [],

            particles:
                [],

            effects:
                []

        };

    }


    /* =========================================================
       ESTADO
       ========================================================= */

    const state = {

        selectedCharacter:
            CHARACTERS[0],

        player:
            null,

        running:
            false,

        paused:
            false,

        pauseReason:
            null,

        time:
            0,

        lastTime:
            0,

        keys:
            new Set(),

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

        area:
            "village",

        camera: {

            x:
                0,

            y:
                0

        },

        world:
            createEmptyWorld(
                REGIONS.village
            ),

        houseMode:
            false,

        currentHouse:
            null,

        houseReturn:
            null,

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

        toastTimer:
            null,

        portalCooldown:
            0,

        holdAction:
            null,

        bossBarTarget:
            null,

        finalChoiceShown:
            false,

        transition:
            null,

        transitionQueue:
            [],

        screenShake:
            0,

        screenShakePower:
            0,

        damageFlash:
            0,

        bloodMarks:
            [],

        autosaveTimer:
            0,

        debug: {

            placementRejects:
                0,

            lastSafeRepair:
                0

        }

    };


    /* =========================================================
       UTILIDADES
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
            min +
            Math.random() *
            (
                max -
                min
            )
        );

    }


    function randomInt(
        min,
        max
    ) {

        return Math.floor(
            random(
                min,
                max +
                1
            )
        );

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


    function uid(
        prefix =
            "id"
    ) {

        return (
            `${prefix}_` +
            `${Date.now().toString(36)}_` +
            Math.random()
                .toString(36)
                .slice(
                    2,
                    8
                )
        );

    }


    function normalize(
        dx,
        dy
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            ) ||
            1;


        return {

            x:
                dx /
                length,

            y:
                dy /
                length,

            length

        };

    }


    /* =========================================================
       RNG ESTÁVEL

       O labirinto e objetos procedurais
       permanecem no mesmo lugar durante
       o mesmo save.
       ========================================================= */

    function hashString(
        text
    ) {

        let h =
            2166136261 >>>
            0;


        const string =
            String(
                text
            );


        for (
            let i = 0;
            i <
            string.length;
            i++
        ) {

            h ^=
                string
                    .charCodeAt(
                        i
                    );


            h =
                Math.imul(
                    h,
                    16777619
                );

        }


        return h >>>
            0;

    }


    function mulberry32(
        seed
    ) {

        let a =
            seed >>>
            0;


        return () => {

            a |=
                0;


            a =
                a +
                0x6D2B79F5 |
                0;


            let t =
                Math.imul(
                    a ^
                    a >>>
                    15,

                    1 |
                    a
                );


            t =
                t +
                Math.imul(
                    t ^
                    t >>>
                    7,

                    61 |
                    t
                ) ^
                t;


            return (
                (
                    t ^
                    t >>>
                    14
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
                max +
                1
            )
        );

    }


    function getWorldSeed(
        area
    ) {

        if (
            state.player
                ?.worldSeeds
                ?.[
                    area
                ]
        ) {

            return (
                state.player
                    .worldSeeds[
                        area
                    ] >>>
                0
            );

        }


        return hashString(
            `${state.player?.name || "VEYRA"}:${area}:v${GAME_VERSION}`
        );

    }


    function getAreaRng(
        area =
            state.area,

        salt =
            "main"
    ) {

        return mulberry32(
            hashString(
                `${getWorldSeed(area)}:${salt}`
            )
        );

    }


    /* =========================================================
       COLISÕES GEOMÉTRICAS
       ========================================================= */

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


    function rectRectCollision(
        a,
        b
    ) {

        return (
            a.x <
                b.x +
                b.w &&

            a.x +
                a.w >
                b.x &&

            a.y <
                b.y +
                b.h &&

            a.y +
                a.h >
                b.y
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
            dy <
            radius *
            radius
        );

    }


    function pointSegmentDistance(
        px,
        py,
        ax,
        ay,
        bx,
        by
    ) {

        const vx =
            bx -
            ax;


        const vy =
            by -
            ay;


        const lengthSquared =
            vx *
            vx +
            vy *
            vy;


        if (
            !lengthSquared
        ) {

            return Math.hypot(
                px -
                ax,

                py -
                ay
            );

        }


        const t =
            clamp(

                (
                    (
                        px -
                        ax
                    ) *
                    vx +

                    (
                        py -
                        ay
                    ) *
                    vy
                ) /
                lengthSquared,

                0,
                1

            );


        return Math.hypot(

            px -
            (
                ax +
                vx *
                t
            ),

            py -
            (
                ay +
                vy *
                t
            )

        );

    }


    /* =========================================================
       TELAS

       Mantém o layout original.

       screen-entering é apenas um "gancho"
       para o CSS recuperar as animações
       de brilho/transição depois.
       ========================================================= */

    function showScreen(
        name,
        options =
            {}
    ) {

        const target =
            screens[
                name
            ];


        if (
            !target
        ) {

            return;

        }


        Object
            .values(
                screens
            )
            .forEach(
                screen => {

                    screen
                        .classList
                        .remove(
                            "active",
                            "screen-entering"
                        );


                    screen
                        .setAttribute(
                            "aria-hidden",
                            "true"
                        );

                }
            );


        target
            .classList
            .add(
                "active"
            );


        target
            .setAttribute(
                "aria-hidden",
                "false"
            );


        if (
            options.animate !==
            false
        ) {

            target
                .classList
                .remove(
                    "screen-entering"
                );


            void target.offsetWidth;


            target
                .classList
                .add(
                    "screen-entering"
                );


            setTimeout(
                () => {

                    target
                        .classList
                        .remove(
                            "screen-entering"
                        );

                },
                520
            );

        }

    }


    /* =========================================================
       CANVAS
       ========================================================= */

    function resizeCanvas() {

        const ratio =
            Math.min(
                2,
                window.devicePixelRatio ||
                1
            );


        const width =
            Math.max(
                1,
                window.innerWidth
            );


        const height =
            Math.max(
                1,
                window.innerHeight
            );


        canvas.width =
            Math.floor(
                width *
                ratio
            );


        canvas.height =
            Math.floor(
                height *
                ratio
            );


        canvas.style.width =
            `${width}px`;


        canvas.style.height =
            `${height}px`;


        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );

    }


    /* =========================================================
       TRANSIÇÃO REAL DO JOGO

       Independente do CSS.

       Isso evita novamente o problema
       das transições simplesmente sumirem.
       ========================================================= */

    function startTransition(
        options =
            {}
    ) {

        const transition = {

            label:
                options.label ||
                "",

            phase:
                options.startBlack
                    ? "hold"
                    : "out",

            alpha:
                options.startBlack
                    ? 1
                    : 0,

            timer:
                0,

            fadeOut:
                Math.max(
                    0.05,
                    options.fadeOut ??
                    0.34
                ),

            hold:
                Math.max(
                    0,
                    options.hold ??
                    0.18
                ),

            fadeIn:
                Math.max(
                    0.05,
                    options.fadeIn ??
                    0.48
                ),

            onMidpoint:
                typeof options.onMidpoint ===
                "function"

                    ? options.onMidpoint

                    : null,

            done:
                typeof options.done ===
                "function"

                    ? options.done

                    : null,

            midpointDone:
                Boolean(
                    options.startBlack
                )

        };


        state.transition =
            transition;


        if (
            options.startBlack &&
            transition.onMidpoint
        ) {

            transition
                .onMidpoint();


            transition.midpointDone =
                true;

        }

    }


    function updateTransition(
        dt
    ) {

        const transition =
            state.transition;


        if (
            !transition
        ) {

            return;

        }


        transition.timer +=
            dt;


        if (
            transition.phase ===
            "out"
        ) {

            transition.alpha =
                clamp(

                    transition.timer /
                    transition.fadeOut,

                    0,
                    1

                );


            if (
                transition.timer >=
                transition.fadeOut
            ) {

                transition.phase =
                    "hold";


                transition.timer =
                    0;


                transition.alpha =
                    1;


                if (
                    !transition
                        .midpointDone &&
                    transition
                        .onMidpoint
                ) {

                    transition
                        .onMidpoint();

                }


                transition.midpointDone =
                    true;

            }


            return;

        }


        if (
            transition.phase ===
            "hold"
        ) {

            transition.alpha =
                1;


            if (
                transition.timer >=
                transition.hold
            ) {

                transition.phase =
                    "in";


                transition.timer =
                    0;

            }


            return;

        }


        transition.alpha =
            1 -
            clamp(

                transition.timer /
                transition.fadeIn,

                0,
                1

            );


        if (
            transition.timer >=
            transition.fadeIn
        ) {

            const done =
                transition.done;


            state.transition =
                null;


            if (
                done
            ) {

                done();

            }


            if (
                state
                    .transitionQueue
                    .length
            ) {

                startTransition(
                    state
                        .transitionQueue
                        .shift()
                );

            }

        }

    }


    function drawTransitionOverlay() {

        const transition =
            state.transition;


        if (
            !transition
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


        ctx.fillStyle =
            `rgba(
                2,
                3,
                5,
                ${
                    clamp(
                        transition.alpha,
                        0,
                        1
                    )
                }
            )`;


        ctx.fillRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        if (
            transition.label &&
            transition.alpha >
            0.58
        ) {

            ctx.globalAlpha =
                clamp(

                    (
                        transition.alpha -
                        0.58
                    ) /
                    0.42,

                    0,
                    1

                );


            ctx.textAlign =
                "center";


            ctx.fillStyle =
                "#eadfca";


            ctx.font =
                "700 20px Georgia, serif";


            ctx.fillText(

                transition.label,

                window.innerWidth /
                2,

                window.innerHeight /
                2

            );


            ctx.fillStyle =
                "rgba(234,223,202,.5)";


            ctx.fillRect(

                window.innerWidth /
                2 -
                85,

                window.innerHeight /
                2 +
                18,

                170,
                1

            );

        }


        ctx.restore();

    }


    /* =========================================================
       SELEÇÃO DE PERSONAGEM

       O layout continua sendo o aprovado.
       ========================================================= */

    function createCharacterCards() {

        const container =
            must(
                "characterCards"
            );


        container.innerHTML =
            "";


        CHARACTERS
            .forEach(
                (
                    character,
                    index
                ) => {

                    const card =
                        document
                            .createElement(
                                "button"
                            );


                    card.type =
                        "button";


                    card.className =
                        `character-card${
                            index ===
                            0

                                ? " selected"

                                : ""
                        }`;


                    card.dataset
                        .character =
                        character.id;


                    card.innerHTML = `

                        <div class="char-art">
                            ${character.icon}
                        </div>

                        <h3>
                            ${character.name}
                        </h3>

                        <p class="role">
                            ${character.className}
                            —
                            ${character.role}
                        </p>

                        <p>
                            ${character.description}
                        </p>

                        <div class="mini-stats">

                            <span>
                                HP ${character.hp}
                            </span>

                            <span>
                                MAG ${character.magic}
                            </span>

                            <span>
                                ENE ${character.energy}
                            </span>

                            <span>
                                ATQ ${character.damage}
                            </span>

                        </div>

                    `;


                    card.addEventListener(
                        "click",
                        () => {

                            state
                                .selectedCharacter =
                                character;


                            container
                                .querySelectorAll(
                                    ".character-card"
                                )
                                .forEach(
                                    element => {

                                        element
                                            .classList
                                            .remove(
                                                "selected"
                                            );

                                    }
                                );


                            card
                                .classList
                                .add(
                                    "selected"
                                );

                        }
                    );


                    container
                        .appendChild(
                            card
                        );

                }
            );

    }


    function startNewGame() {

        state.selectedCharacter =
            CHARACTERS[0];


        must(
            "playerName"
        ).value =
            "";


        must(
            "nameError"
        ).textContent =
            "";


        createCharacterCards();


        showScreen(
            "character"
        );


        setTimeout(
            () => {

                must(
                    "playerName"
                )
                    .focus();

            },
            80
        );

    }


    /* =========================================================
       CRIAR PLAYER
       ========================================================= */

    function createPlayer(
        character,
        name
    ) {

        const inventory =
            {};


        Object
            .keys(
                ITEMS
            )
            .forEach(
                id => {

                    inventory[
                        id
                    ] =
                        0;

                }
            );


        inventory
            .espadaSimples =
            1;


        inventory
            .machado =
            1;


        const seedBase =
            hashString(

                `${name}:` +
                `${character.id}:` +
                `${Date.now()}:` +
                `${Math.random()}`

            );


        const worldSeeds =
            {};


        Object
            .keys(
                REGIONS
            )
            .forEach(
                (
                    area,
                    index
                ) => {

                    worldSeeds[
                        area
                    ] =
                        hashString(
                            `${seedBase}:${area}:${index}`
                        );

                }
            );


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

            sprite: {
                ...character.sprite
            },


            /* POSIÇÃO */

            x:
                500,

            y:
                1120,

            radius:
                VISUAL_CONFIG
                    .sprite
                    .playerRadius,

            facing:
                "down",

            walkTime:
                0,

            attackAnim:
                0,

            hurtAnim:
                0,


            /* ATRIBUTOS BASE */

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


            /* VIDA */

            maxHp:
                character.hp,

            hp:
                character.hp,


            /* MAGIA */

            maxMagic:
                character.magic,

            magic:
                character.magic,


            /* ENERGIA */

            maxEnergy:
                character.energy,

            energy:
                character.energy,


            /* SOBREVIVÊNCIA */

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


            /* PROGRESSÃO */

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


            money:
                120,

            memory:
                0,


            /* INVENTÁRIO */

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


            /* MUNDO */

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

            hellTypesDefeated:
                {},

            secretsFound:
                [],

            collected:
                {},


            /* MISSÕES */

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


            /* HABILIDADES DE MOVIMENTAÇÃO */

            abilities: {

                dash:
                    false,

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


            worldSeeds,


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


            /* MONARCA */

            monarchAwakened:
                false,

            monarchDefeated:
                false,

            dashPurchased:
                false,


            /* FLAUTA */

            flutePlayed:
                false,

            fluteRewardGranted:
                false,


            /* FINAL */

            finalChoice:
                null,

            finalDefeated:
                false,


            /* ITENS PERMANENTES */

            minimapOwned:
                false,

            lanternOwned:
                false,


            /* COOLDOWNS */

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
       COMEÇAR JOGO
       ========================================================= */

    function startGame() {

        const input =
            must(
                "playerName"
            );


        const error =
            must(
                "nameError"
            );


        const name =
            input
                .value
                .trim();


        if (
            name.length <
            2
        ) {

            error.textContent =
                "Digite um nome com pelo menos 2 caracteres.";


            input.focus();


            return;

        }


        error.textContent =
            "";


        state.player =
            createPlayer(

                state
                    .selectedCharacter,

                name

            );


        state.area =
            "village";


        state.houseMode =
            false;


        state.currentHouse =
            null;


        state.houseReturn =
            null;


        state.dialogue =
            null;


        state.travel =
            null;


        state.battle =
            null;


        state.transition =
            null;


        state.transitionQueue =
            [];


        state.keys.clear();


        state.time =
            0;


        buildWorld();


        const home =
            state.world
                .buildings
                .find(
                    building =>
                        building.id ===
                        "home"
                );


        if (
            !home
        ) {

            throw new Error(
                "Casa inicial não encontrada."
            );

        }


        enterHouseImmediate(
            home,
            true
        );


        showScreen(
            "game",
            {
                animate:
                    false
            }
        );


        state.running =
            true;


        state.paused =
            false;


        state.lastTime =
            performance.now();


        startTransition({

            label:
                "VILA DO CREPÚSCULO",

            startBlack:
                true,

            hold:
                0.55,

            fadeIn:
                0.9,

            done:
                () => {

                    showToast(
                        "Sua porta fica ao sul. Use Z ou E para sair.",
                        3600
                    );

                }

        });


        requestAnimationFrame(
            gameLoop
        );

    }


    /* =========================================================
       RESET DO MUNDO
       ========================================================= */

    function resetWorld() {

        state.world =
            createEmptyWorld(
                REGIONS[
                    state.area
                ]
            );


        state.bossBarTarget =
            null;

    }


    /* =========================================================
       ÁREAS PROTEGIDAS

       É A PRINCIPAL CORREÇÃO DAQUELE BUG
       DE PEDRA NO MEIO DO CAMINHO.
       ========================================================= */

    function addProtectedRect(
        x,
        y,
        w,
        h,
        padding =
            0,
        reason =
            "protected"
    ) {

        state.world
            .protectedZones
            .push({

                kind:
                    "rect",

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
                    2,

                reason

            });

    }


    function addProtectedCircle(
        x,
        y,
        radius,
        padding =
            0,
        reason =
            "protected"
    ) {

        state.world
            .protectedZones
            .push({

                kind:
                    "circle",

                x,

                y,

                radius:
                    radius +
                    padding,

                reason

            });

    }


    function addProtectedPath(
        points,
        width,
        padding =
            PATH_SAFETY_PADDING,
        reason =
            "path"
    ) {

        state.world
            .protectedZones
            .push({

                kind:
                    "path",

                points:
                    points
                        .map(
                            point => ({

                                x:
                                    point.x,

                                y:
                                    point.y

                            })
                        ),

                radius:
                    width /
                    2 +
                    padding,

                reason

            });

    }


    function circleIntersectsProtectedZone(
        x,
        y,
        radius,
        zone
    ) {

        if (
            zone.kind ===
            "rect"
        ) {

            return circleRectCollision(
                x,
                y,
                radius,
                zone
            );

        }


        if (
            zone.kind ===
            "circle"
        ) {

            return circleCircleCollision(

                x,
                y,
                radius,

                zone.x,
                zone.y,
                zone.radius

            );

        }


        if (
            zone.kind ===
            "path"
        ) {

            for (
                let i = 1;
                i <
                zone.points.length;
                i++
            ) {

                const a =
                    zone.points[
                        i -
                        1
                    ];


                const b =
                    zone.points[
                        i
                    ];


                if (
                    pointSegmentDistance(

                        x,
                        y,

                        a.x,
                        a.y,

                        b.x,
                        b.y

                    ) <
                    zone.radius +
                    radius
                ) {

                    return true;

                }

            }

        }


        return false;

    }


    function circleInProtectedZone(
        x,
        y,
        radius =
            1
    ) {

        return state.world
            .protectedZones
            .some(
                zone =>
                    circleIntersectsProtectedZone(
                        x,
                        y,
                        radius,
                        zone
                    )
            );

    }


    function circleHitsSolidObstacle(
        x,
        y,
        radius,
        ignoreId =
            null
    ) {

        return state.world
            .obstacles
            .some(
                obstacle => {

                    if (
                        obstacle.solid ===
                        false
                    ) {

                        return false;

                    }


                    if (
                        obstacle.id ===
                        ignoreId
                    ) {

                        return false;

                    }


                    return circleRectCollision(
                        x,
                        y,
                        radius,
                        obstacle
                    );

                }
            );

    }


    function circleHitsBuilding(
        x,
        y,
        radius
    ) {

        return state.world
            .buildings
            .some(
                building =>
                    circleRectCollision(
                        x,
                        y,
                        radius,
                        building
                    )
            );

    }


    function circleHitsEntity(
        x,
        y,
        radius
    ) {

        if (
            state.player &&
            circleCircleCollision(

                x,
                y,
                radius,

                state.player.x,
                state.player.y,
                state.player.radius +
                28

            )
        ) {

            return true;

        }


        if (
            state.world
                .npcs
                .some(
                    npc =>
                        circleCircleCollision(

                            x,
                            y,
                            radius,

                            npc.x,
                            npc.y,
                            npc.radius ||
                            18

                        )
                )
        ) {

            return true;

        }


        return state.world
            .enemies
            .some(
                enemy => {

                    if (
                        enemy.dead
                    ) {

                        return false;

                    }


                    return circleCircleCollision(

                        x,
                        y,
                        radius,

                        enemy.x,
                        enemy.y,
                        enemy.radius ||
                        20

                    );

                }
            );

    }


    function isSpawnPositionSafe(
        x,
        y,
        radius =
            24,
        options =
            {}
    ) {

        const margin =
            options.margin ??
            WORLD_MARGIN +
            radius;


        if (
            x <
                margin ||

            y <
                margin ||

            x >
                state.world.width -
                margin ||

            y >
                state.world.height -
                margin
        ) {

            return false;

        }


        if (
            options.avoidProtected !==
                false &&
            circleInProtectedZone(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        if (
            options.avoidObstacles !==
                false &&
            circleHitsSolidObstacle(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        if (
            options.avoidBuildings !==
                false &&
            circleHitsBuilding(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        if (
            options.avoidEntities &&
            circleHitsEntity(
                x,
                y,
                radius
            )
        ) {

            return false;

        }


        if (
            typeof options.extraCheck ===
                "function" &&
            !options.extraCheck(
                x,
                y
            )
        ) {

            return false;

        }


        return true;

    }


    function findSafeSpawnPosition(
        rng,
        options =
            {}
    ) {

        const radius =
            options.radius ??
            24;


        const minX =
            options.minX ??
            WORLD_MARGIN +
            radius;


        const maxX =
            options.maxX ??
            state.world.width -
            WORLD_MARGIN -
            radius;


        const minY =
            options.minY ??
            WORLD_MARGIN +
            radius;


        const maxY =
            options.maxY ??
            state.world.height -
            WORLD_MARGIN -
            radius;


        for (
            let attempt = 0;
            attempt <
            (
                options.attempts ??
                SPAWN_ATTEMPTS
            );
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
                    options
                )
            ) {

                return {
                    x,
                    y
                };

            }

        }


        state.debug
            .placementRejects++;


        return null;

    }


    /* =========================================================
       ADICIONAR CAMINHO
       ========================================================= */

    function addPath(
        kind,
        points,
        width =
            90,
        options =
            {}
    ) {

        const path = {

            id:
                uid(
                    "path"
                ),

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


        state.world
            .paths
            .push(
                path
            );


        /*
            PROTEGE O CAMINHO DE SPAWNS
            SÓLIDOS.
        */

        if (
            options.protect !==
            false
        ) {

            addProtectedPath(

                path.points,

                width,

                options
                    .protectionPadding ??
                PATH_SAFETY_PADDING,

                `path:${kind}`

            );

        }


        return path;

    }


    /* =========================================================
       DECORAÇÃO

       solid:false = apenas visual.

       Uma florzinha ou pedrinha no chão
       NÃO vai prender o player.
       ========================================================= */

    function addDecoration(
        x,
        y,
        type,
        options =
            {}
    ) {

        state.world
            .decorations
            .push({

                id:
                    uid(
                        "deco"
                    ),

                x,

                y,

                type,

                solid:
                    false,

                ...options

            });

    }


    /* =========================================================
       OBSTÁCULOS
       ========================================================= */

    function addObstacle(
        x,
        y,
        w,
        h,
        type,
        options =
            {}
    ) {

        const obstacle = {

            id:
                options.id ||
                uid(
                    type
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
                Boolean(
                    options.blocksLight
                ),

            respawnProtected:
                Boolean(
                    options.respawnProtected
                ),

            ...options

        };


        /*
            Objetos gerados podem pedir
            rejeição automática se estiverem
            sobre uma estrada protegida.
        */

        if (
            options.rejectProtected
        ) {

            const centerX =
                x +
                w /
                2;


            const centerY =
                y +
                h /
                2;


            const radius =
                Math.max(
                    w,
                    h
                ) *
                0.52;


            if (
                circleInProtectedZone(
                    centerX,
                    centerY,
                    radius
                )
            ) {

                return null;

            }

        }


        state.world
            .obstacles
            .push(
                obstacle
            );


        return obstacle;

    }


    /* =========================================================
       PRÉDIOS
       ========================================================= */

    function addBuilding(
        id,
        x,
        y,
        w,
        h,
        name,
        color,
        roof,
        interiorId =
            id
    ) {

        const building = {

            id,

            x,

            y,

            w,

            h,

            name,

            color,

            roof,

            interiorId,

            enterable:
                true

        };


        state.world
            .buildings
            .push(
                building
            );


        addObstacle(

            x,
            y,
            w,
            h,

            "building",

            {

                id:
                    `building_${id}`,

                buildingId:
                    id,

                blocksLight:
                    true

            }

        );


        /*
            PORTA VISÍVEL / INTERATIVA.
        */

        const doorWidth =
            74;


        const doorHeight =
            42;


        const door = {

            id:
                `door_${id}`,

            buildingId:
                id,

            x:
                x +
                w /
                2 -
                doorWidth /
                2,

            y:
                y +
                h -
                14,

            w:
                doorWidth,

            h:
                doorHeight,

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


        /*
            Nada pode nascer na frente da porta.
        */

        addProtectedRect(

            door.x -
                54,

            door.y -
                18,

            door.w +
                108,

            138,

            0,

            `door:${id}`

        );


        /*
            Também evita spawns encostando
            dentro da construção.
        */

        addProtectedRect(

            x -
                18,

            y -
                18,

            w +
                36,

            h +
                36,

            0,

            `building:${id}`

        );


        return building;

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function addGate(
        side,
        x,
        y,
        w,
        h,
        options =
            {}
    ) {

        const gate = {

            id:
                `gate_${side}`,

            side,

            x,

            y,

            w,

            h,

            title:
                options.title ||
                side.toUpperCase(),

            target:
                options.target ||
                null

        };


        state.world
            .gates
            .push(
                gate
            );


        /*
            Não deixa pedra bloquear
            permanentemente o portão.
        */

        addProtectedRect(

            x,
            y,
            w,
            h,

            80,

            `gate:${side}`

        );


        return gate;

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
        requirement =
            null,
        title =
            "PASSAGEM",
        options =
            {}
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


        addProtectedRect(

            x,
            y,
            w,
            h,

            options
                .protectionPadding ??
            80,

            `portal:${portal.id}`

        );


        return portal;

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function addTree(
        x,
        y,
        id,
        options =
            {}
    ) {

        const tree = {

            id:
                id ||
                uid(
                    "tree"
                ),

            x,

            y,

            radius:
                options.radius ||
                28,

            alive:
                options.alive !==
                false,

            respawn:
                options.respawn ??
                45,

            respawnTimer:
                0,

            hp:
                options.hp ||
                1,

            type:
                options.type ||
                "tree",

            homeX:
                x,

            homeY:
                y

        };


        state.world
            .trees
            .push(
                tree
            );


        /*
            A hitbox é menor que a copa.
            Assim o personagem não parece
            bater em uma parede invisível.
        */

        addObstacle(

            x -
                13,

            y +
                2,

            26,
            43,

            "tree",

            {

                id:
                    `tree_obstacle_${tree.id}`,

                treeId:
                    tree.id,

                rejectProtected:
                    false

            }

        );


        return tree;

    }


    function addGeneratedTree(
        rng,
        id,
        options =
            {}
    ) {

        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        options.safeRadius ??
                        42,

                    ...options

                }

            );


        if (
            !position
        ) {

            return null;

        }


        return addTree(

            position.x,
            position.y,

            id,

            options

        );

    }


    /* =========================================================
       PEDRA GERADA

       SEM PEDRA NO MEIO DO CAMINHO.
       ========================================================= */

    function addGeneratedRock(
        rng,
        id,
        options =
            {}
    ) {

        const width =
            options.w ??
            rngRange(
                rng,
                42,
                78
            );


        const height =
            options.h ??
            rngRange(
                rng,
                34,
                62
            );


        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        Math.max(
                            width,
                            height
                        ) *
                        0.7,

                    ...options

                }

            );


        if (
            !position
        ) {

            return null;

        }


        return addObstacle(

            position.x -
                width /
                2,

            position.y -
                height /
                2,

            width,
            height,

            options.type ||
                "rock",

            {

                id,

                rejectProtected:
                    true,

                blocksLight:
                    Boolean(
                        options.blocksLight
                    )

            }

        );

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    function addResource(
        type,
        x,
        y,
        id,
        options =
            {}
    ) {

        const resource = {

            id:
                id ||
                uid(
                    type
                ),

            type,

            x,

            y,

            homeX:
                x,

            homeY:
                y,

            radius:
                options.radius ||
                22,

            alive:
                options.alive !==
                false,

            respawn:
                options.respawn ??
                38,

            respawnTimer:
                0,

            collectTime:
                options.collectTime ??
                1.1,

            amountMin:
                options.amountMin ??
                1,

            amountMax:
                options.amountMax ??
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
        type,
        id,
        options =
            {}
    ) {

        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        options.safeRadius ??
                        34,

                    ...options

                }

            );


        if (
            !position
        ) {

            return null;

        }


        return addResource(

            type,

            position.x,
            position.y,

            id,

            options

        );

    }


    /* =========================================================
       COMIDA
       ========================================================= */

    function addFood(
        type,
        x,
        y,
        options =
            {}
    ) {

        const food = {

            id:
                options.id ||
                uid(
                    "food"
                ),

            type,

            x,

            y,

            alive:
                true,

            respawnTimer:
                0,

            respawn:
                options.respawn ??
                30,

            radius:
                options.radius ||
                18

        };


        state.world
            .foods
            .push(
                food
            );


        return food;

    }


    /* =========================================================
       NPC
       ========================================================= */

    function addNPC(
        base,
        x,
        y,
        options =
            {}
    ) {

        const npc = {

            ...base,

            x,

            y,

            homeX:
                x,

            homeY:
                y,

            radius:
                options.radius ||
                base.radius ||
                18,

            wander:
                options.wander ??
                55,

            wanderTimer:
                random(
                    1.2,
                    3.5
                ),

            targetX:
                x,

            targetY:
                y,

            ...options

        };


        state.world
            .npcs
            .push(
                npc
            );


        addProtectedCircle(

            x,
            y,

            npc.radius,

            20,

            `npc:${npc.id}`

        );


        return npc;

    }


    /* =========================================================
       INIMIGO
       ========================================================= */

    function addEnemy(
        data
    ) {

        const enemy = {

            id:
                data.id ||
                uid(
                    "enemy"
                ),

            name:
                data.name ||
                "INIMIGO",

            spriteType:
                data.spriteType ||
                "duskling",

            icon:
                data.icon ||
                "◆",

            type:
                data.type ||
                "normal",

            x:
                data.x,

            y:
                data.y,

            homeX:
                data.x,

            homeY:
                data.y,

            hp:
                data.hp ??
                80,

            maxHp:
                data.maxHp ??
                data.hp ??
                80,

            damage:
                data.damage ??
                10,

            speed:
                data.speed ??
                80,

            vision:
                data.vision ??
                250,

            attackRange:
                data.attackRange ??
                65,

            radius:
                data.radius ??
                20,

            color:
                data.color ||
                "#6f6b72",

            xp:
                data.xp ??
                20,

            money:
                data.money ??
                8,

            drop:
                data.drop ||
                null,

            dropAmount:
                data.dropAmount ??
                1,

            dropChance:
                data.dropChance ??
                1,

            respawnTime:
                data.respawnTime ??
                0,

            respawnTimer:
                0,

            accepted:
                Boolean(
                    data.accepted
                ),

            aggressive:
                Boolean(
                    data.aggressive
                ),

            dead:
                false,

            state:
                "idle",

            attackCooldown:
                random(
                    0.25,
                    0.8
                ),

            specialCooldown:
                data.specialCooldown ??
                random(
                    2.5,
                    4.5
                ),

            hitFlash:
                0,

            stunTimer:
                0,

            shield:
                0,

            charge:
                null,

            bossPattern:
                data.bossPattern ||
                null,

            progressionIndex:
                data.progressionIndex ??
                null,

            unlock:
                data.unlock ||
                null,

            finalBoss:
                Boolean(
                    data.finalBoss
                ),

            hellType:
                data.hellType ||
                null,

            ...data

        };


        state.world
            .enemies
            .push(
                enemy
            );


        return enemy;

    }


    function spawnEnemyType(
        rng,
        typeId,
        index,
        options =
            {}
    ) {

        const type =
            ENEMY_TYPES[
                typeId
            ];


        if (
            !type
        ) {

            return null;

        }


        const position =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        (
                            type.radius ||
                            20
                        ) +
                        22,

                    avoidEntities:
                        true,

                    ...options

                }

            );


        if (
            !position
        ) {

            return null;

        }


        return addEnemy({

            ...type,

            id:
                options.id ||
                `${state.area}_${typeId}_${index}`,

            x:
                position.x,

            y:
                position.y,

            drop:
                options.drop ||
                null,

            dropAmount:
                options.dropAmount ??
                1,

            dropChance:
                options.dropChance ??
                0.45

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


    function spawnProgressionBoss(
        data
    ) {

        if (
            hasDefeatedBoss(
                data.id
            )
        ) {

            return null;

        }


        return addEnemy({

            ...data,

            type:
                "progression",

            accepted:
                false,

            aggressive:
                false,

            respawnTime:
                0

        });

    }


    /* =========================================================
       DETALHES DO CHÃO

       São decoração.
       Não entram em collision.
       ========================================================= */

    function addBiomeDetails(
        rng,
        count,
        types,
        options =
            {}
    ) {

        for (
            let i = 0;
            i <
            count;
            i++
        ) {

            const position =
                findSafeSpawnPosition(

                    rng,

                    {

                        radius:
                            options.radius ??
                            8,

                        avoidProtected:
                            options
                                .avoidProtected ??
                            false,

                        avoidObstacles:
                            options
                                .avoidObstacles ??
                            true,

                        avoidBuildings:
                            options
                                .avoidBuildings ??
                            true,

                        attempts:
                            30

                    }

                );


            if (
                !position
            ) {

                continue;

            }


            addDecoration(

                position.x,
                position.y,

                types[
                    i %
                    types.length
                ],

                {

                    size:
                        rngRange(

                            rng,

                            options
                                .minSize ??
                            6,

                            options
                                .maxSize ??
                            18

                        ),

                    angle:
                        rngRange(
                            rng,
                            -Math.PI,
                            Math.PI
                        ),

                    phase:
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
       LIMITES DO MUNDO
       ========================================================= */

    function addWorldBounds() {

        const width =
            state.world.width;


        const height =
            state.world.height;


        addObstacle(

            0,
            0,

            width,
            WORLD_MARGIN,

            "wall",

            {

                id:
                    "bound_top",

                blocksLight:
                    true

            }

        );


        addObstacle(

            0,

            height -
            WORLD_MARGIN,

            width,
            WORLD_MARGIN,

            "wall",

            {

                id:
                    "bound_bottom",

                blocksLight:
                    true

            }

        );


        addObstacle(

            0,
            0,

            WORLD_MARGIN,
            height,

            "wall",

            {

                id:
                    "bound_left",

                blocksLight:
                    true

            }

        );


        addObstacle(

            width -
            WORLD_MARGIN,

            0,

            WORLD_MARGIN,
            height,

            "wall",

            {

                id:
                    "bound_right",

                blocksLight:
                    true

            }

        );

    }


    /* =========================================================
       CONSTRUIR MUNDO
       ========================================================= */

    function buildWorld() {

        resetWorld();


        addWorldBounds();


        const builders = {

            village:
                buildVillage,

            forest:
                buildForest,

            grove:
                buildGrove,

            mountains:
                buildMountains,

            iron:
                buildIron,

            ruby:
                buildRuby,

            monarchMaze:
                buildMonarchMaze,

            shadow:
                buildShadow,

            fairy:
                buildFairy,

            sky:
                buildSky,

            hell:
                buildHell,

            final:
                buildFinal

        };


        const builder =
            builders[
                state.area
            ];


        if (
            typeof builder !==
            "function"
        ) {

            throw new Error(
                `Região sem builder: ${state.area}`
            );

        }


        builder();


        must(
            "locationLabel"
        ).textContent =
            REGIONS[
                state.area
            ].name;

    }


    /* =========================================================
       VILA DO CREPÚSCULO
       ========================================================= */

    function buildVillage() {

        const rng =
            getAreaRng(
                "village",
                "layout"
            );


        /*
            CAMINHOS PRIMEIRO.

            Tudo que for gerado depois
            já conhece as zonas proibidas.
        */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        100,
                    y:
                        1110
                },

                {
                    x:
                        1345,
                    y:
                        1110
                }

            ],

            116

        );


        addPath(

            "villageRoad",

            [

                {
                    x:
                        1855,
                    y:
                        1110
                },

                {
                    x:
                        3100,
                    y:
                        1110
                }

            ],

            116

        );


        addPath(

            "villageRoad",

            [

                {
                    x:
                        1600,
                    y:
                        100
                },

                {
                    x:
                        1600,
                    y:
                        865
                }

            ],

            116

        );


        addPath(

            "villageRoad",

            [

                {
                    x:
                        1600,
                    y:
                        1330
                },

                {
                    x:
                        1600,
                    y:
                        2100
                }

            ],

            116

        );


        /*
            Caminho da casa.
        */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        520,
                    y:
                        625
                },

                {
                    x:
                        520,
                    y:
                        860
                },

                {
                    x:
                        1310,
                    y:
                        1060
                }

            ],

            80

        );


        /*
            Caminho da forja.
        */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        1810,
                    y:
                        1040
                },

                {
                    x:
                        2350,
                    y:
                        740
                }

            ],

            78

        );


        /*
            Caminho da loja.
        */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        1860,
                    y:
                        1160
                },

                {
                    x:
                        2680,
                    y:
                        1380
                }

            ],

            82

        );


        /*
            Caminho da carpintaria.
        */

        addPath(

            "villageRoad",

            [

                {
                    x:
                        1330,
                    y:
                        1180
                },

                {
                    x:
                        690,
                    y:
                        1590
                }

            ],

            78

        );


        /* CASAS */

        addBuilding(

            "home",

            270,
            280,

            430,
            270,

            "CASA DO AVENTUREIRO",

            "#70483a",
            "#ae835e"

        );


        addBuilding(

            "elianHome",

            830,
            260,

            350,
            260,

            "CASA DE ELIAN",

            "#604a3d",
            "#b48961"

        );


        addBuilding(

            "forge",

            2070,
            300,

            500,
            300,

            "FORJA DO FERREIRO",

            "#484744",
            "#8f8172"

        );


        addBuilding(

            "shop",

            2500,
            1260,

            430,
            300,

            "LOJA DE DORAN",

            "#684638",
            "#b4865b"

        );


        addBuilding(

            "woodshop",

            400,
            1560,

            450,
            300,

            "CARPINTARIA",

            "#735638",
            "#a77c4f"

        );


        /* =====================================================
           FONTE CENTRAL

           A Parte 3 desenhará uma versão
           maior, robusta, com coluna,
           água, brilho, respingos e ondas.
           ===================================================== */

        const fountain =
            addObstacle(

                1465,
                895,

                270,
                215,

                "fountain",

                {

                    id:
                        "village_fountain",

                    blocksLight:
                        false

                }

            );


        if (
            fountain
        ) {

            addProtectedRect(

                fountain.x,
                fountain.y,

                fountain.w,
                fountain.h,

                105,

                "fountain_clearance"

            );

        }


        addDecoration(

            1600,
            1000,

            "plazaRing",

            {
                radius:
                    235
            }

        );


        addDecoration(

            1600,
            1000,

            "fountainMist",

            {
                radius:
                    120
            }

        );


        /* PORTÕES */

        addGate(

            "north",

            1515,
            70,

            170,
            74,

            {

                title:
                    "PORTÃO DO NORTE",

                target:
                    "shadow"

            }

        );


        addGate(

            "west",

            70,
            1025,

            74,
            170,

            {

                title:
                    "PORTÃO DO OESTE"

            }

        );


        addGate(

            "south",

            1515,
            2056,

            170,
            74,

            {

                title:
                    "PORTÃO DO SUL"

            }

        );


        /* NPCs EXTERNOS */

        addNPC(

            NPC_LIBRARY
                .ELIAN,

            1040,
            650,

            {

                wander:
                    75

            }

        );


        addNPC(

            NPC_LIBRARY
                .MARA,

            1940,
            1115,

            {

                wander:
                    90

            }

        );


        /*
            DORAN NÃO APARECE FORA.

            BORIN NÃO APARECE FORA.

            BRAN fica no interior da carpintaria.

            Eles estão definidos nos
            HOUSE_INTERIORS.
        */


        /* ÁRVORES DE BORDA */

        const fixedTrees = [

            [
                180,
                180
            ],

            [
                390,
                170
            ],

            [
                650,
                170
            ],

            [
                940,
                150
            ],

            [
                1320,
                170
            ],

            [
                1750,
                160
            ],

            [
                2150,
                160
            ],

            [
                2600,
                170
            ],

            [
                2950,
                180
            ],

            [
                160,
                700
            ],

            [
                170,
                1450
            ],

            [
                260,
                1950
            ],

            [
                1050,
                2000
            ],

            [
                1950,
                2010
            ],

            [
                2400,
                2020
            ],

            [
                2850,
                1950
            ],

            [
                3050,
                1700
            ],

            [
                3010,
                650
            ]

        ];


        fixedTrees
            .forEach(
                (
                    [
                        x,
                        y
                    ],
                    index
                ) => {

                    if (
                        isSpawnPositionSafe(

                            x,
                            y,
                            42,

                            {

                                avoidProtected:
                                    true,

                                avoidEntities:
                                    false

                            }

                        )
                    ) {

                        addTree(

                            x,
                            y,

                            `village_tree_fixed_${index}`

                        );

                    }

                }
            );


        for (
            let i = 0;
            i <
            15;
            i++
        ) {

            addGeneratedTree(

                rng,

                `village_tree_${i}`,

                {

                    safeRadius:
                        44,

                    minX:
                        120,

                    maxX:
                        3080,

                    minY:
                        120,

                    maxY:
                        2080

                }

            );

        }


        /* PEDRAS SEGURAS */

        for (
            let i = 0;
            i <
            11;
            i++
        ) {

            addGeneratedRock(

                rng,

                `village_rock_${i}`,

                {

                    type:
                        "rock",

                    minX:
                        180,

                    maxX:
                        3020,

                    minY:
                        180,

                    maxY:
                        2020

                }

            );

        }


        /* CARVÃO */

        for (
            let i = 0;
            i <
            7;
            i++
        ) {

            addGeneratedResource(

                rng,

                "carvao",

                `village_coal_${i}`,

                {

                    minX:
                        350,

                    maxX:
                        2850,

                    minY:
                        520,

                    maxY:
                        1880,

                    collectTime:
                        1.15

                }

            );

        }


        /* CENOURAS */

        for (
            let i = 0;
            i <
            7;
            i++
        ) {

            const position =
                findSafeSpawnPosition(

                    rng,

                    {

                        radius:
                            22,

                        minX:
                            300,

                        maxX:
                            2850,

                        minY:
                            550,

                        maxY:
                            1900

                    }

                );


            if (
                position
            ) {

                addFood(

                    "carrot",

                    position.x,
                    position.y,

                    {

                        id:
                            `village_carrot_${i}`,

                        respawn:
                            28

                    }

                );

            }

        }


        /* INIMIGOS NORMAIS */

        for (
            let i = 0;
            i <
            6;
            i++
        ) {

            spawnEnemyType(

                rng,

                "duskling",

                i,

                {

                    minX:
                        1850,

                    maxX:
                        2920,

                    minY:
                        1450,

                    maxY:
                        1950,

                    drop:
                        "carvao",

                    dropChance:
                        0.55

                }

            );

        }


        /* =====================================================
           BOSS 1 — GUARDIÃO DA ESTRADA
           ===================================================== */

        spawnProgressionBoss({

            id:
                "road_guardian",

            name:
                "GUARDIÃO DA ESTRADA",

            spriteType:
                "roadGuardian",

            icon:
                "◆",

            x:
                2860,

            y:
                1110,

            hp:
                320,

            maxHp:
                320,

            damage:
                21,

            speed:
                64,

            vision:
                300,

            attackRange:
                78,

            radius:
                31,

            color:
                "#995248",

            xp:
                180,

            money:
                130,

            bossPattern:
                "route1_slow",

            unlock:
                "forest",

            progressionIndex:
                1

        });


        addPortal(

            3050,
            1010,

            80,
            205,

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
                        180,

                    y:
                        1200

                }

            }

        );


        /* DECORAÇÃO SEM HITBOX */

        addBiomeDetails(

            rng,

            95,

            [

                "grassTuft",

                "flower",

                "smallStone",

                "leafPatch"

            ],

            {

                minSize:
                    5,

                maxSize:
                    16,

                avoidObstacles:
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


        /*
            CAMINHO DE PEDRAS VISÍVEL
            NO MAPA/MINIMAPA.
        */

        addPath(

            "forestTrail",

            [

                {
                    x:
                        110,
                    y:
                        1210
                },

                {
                    x:
                        620,
                    y:
                        1180
                },

                {
                    x:
                        980,
                    y:
                        1010
                },

                {
                    x:
                        1410,
                    y:
                        1080
                },

                {
                    x:
                        1760,
                    y:
                        1320
                },

                {
                    x:
                        2160,
                    y:
                        1250
                },

                {
                    x:
                        2510,
                    y:
                        1030
                },

                {
                    x:
                        2880,
                    y:
                        1135
                },

                {
                    x:
                        3290,
                    y:
                        1190
                }

            ],

            112,

            {

                surface:
                    "stone"

            }

        );


        /*
            RAMIFICAÇÃO.
        */

        addPath(

            "forestTrail",

            [

                {
                    x:
                        980,
                    y:
                        1010
                },

                {
                    x:
                        820,
                    y:
                        620
                },

                {
                    x:
                        1080,
                    y:
                        390
                }

            ],

            66,

            {

                surface:
                    "earth"

            }

        );


        addPortal(

            72,
            1110,

            80,
            200,

            "village",

            null,

            "VILA DO CREPÚSCULO",

            {

                id:
                    "forest_to_village",

                spawn: {

                    x:
                        2940,

                    y:
                        1110

                }

            }

        );


        /* ÁRVORES */

        for (
            let i = 0;
            i <
            58;
            i++
        ) {

            addGeneratedTree(

                rng,

                `forest_tree_${i}`,

                {

                    safeRadius:
                        46,

                    minX:
                        115,

                    maxX:
                        3280,

                    minY:
                        115,

                    maxY:
                        2280

                }

            );

        }


        /* PEDRAS */

        for (
            let i = 0;
            i <
            16;
            i++
        ) {

            addGeneratedRock(

                rng,

                `forest_rock_${i}`,

                {

                    type:
                        "mossRock",

                    minX:
                        150,

                    maxX:
                        3250,

                    minY:
                        150,

                    maxY:
                        2250

                }

            );

        }


        /* MADEIRA EXTRA */

        for (
            let i = 0;
            i <
            10;
            i++
        ) {

            addGeneratedResource(

                rng,

                "madeira",

                `forest_wood_${i}`,

                {

                    minX:
                        260,

                    maxX:
                        3150,

                    minY:
                        240,

                    maxY:
                        2180,

                    collectTime:
                        1.2

                }

            );

        }


        /* INIMIGOS */

        for (
            let i = 0;
            i <
            7;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                    2

                    ? "wolf"

                    : "boar",

                i,

                {

                    minX:
                        450,

                    maxX:
                        2900,

                    minY:
                        300,

                    maxY:
                        2100,

                    drop:
                        i %
                            2

                            ? "carvao"

                            : "madeira"

                }

            );

        }


        /* BOSS 2 */

        spawnProgressionBoss({

            id:
                "forest_warden",

            name:
                "VIGIA DA FLORESTA",

            spriteType:
                "forestWarden",

            icon:
                "♠",

            x:
                3030,

            y:
                1190,

            hp:
                460,

            maxHp:
                460,

            damage:
                25,

            speed:
                72,

            vision:
                330,

            attackRange:
                82,

            radius:
                34,

            color:
                "#56714d",

            xp:
                240,

            money:
                165,

            bossPattern:
                "forestRoots",

            unlock:
                "grove",

            progressionIndex:
                2

        });


        addPortal(

            3270,
            1090,

            80,
            205,

            "grove",

            () =>
                hasDefeatedBoss(
                    "forest_warden"
                ),

            "BOSQUE",

            {

                id:
                    "forest_to_grove",

                spawn: {

                    x:
                        180,

                    y:
                        1150

                }

            }

        );


        addBiomeDetails(

            rng,

            130,

            [

                "fern",

                "grassTuft",

                "fallenLeaf",

                "flower",

                "pathStone"

            ],

            {

                minSize:
                    5,

                maxSize:
                    17,

                avoidObstacles:
                    false

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
                        110,
                    y:
                        1150
                },

                {
                    x:
                        510,
                    y:
                        1070
                },

                {
                    x:
                        850,
                    y:
                        1260
                },

                {
                    x:
                        1240,
                    y:
                        1160
                },

                {
                    x:
                        1510,
                    y:
                        880
                },

                {
                    x:
                        1840,
                    y:
                        1020
                },

                {
                    x:
                        2140,
                    y:
                        1310
                },

                {
                    x:
                        2510,
                    y:
                        1230
                },

                {
                    x:
                        3090,
                    y:
                        1150
                }

            ],

            108,

            {

                surface:
                    "rootStone"

            }

        );


        addPortal(

            72,
            1050,

            80,
            200,

            "forest",

            null,

            "FLORESTA",

            {

                id:
                    "grove_to_forest",

                spawn: {

                    x:
                        3180,

                    y:
                        1190

                }

            }

        );


        for (
            let i = 0;
            i <
            52;
            i++
        ) {

            addGeneratedTree(

                rng,

                `grove_tree_${i}`,

                {

                    type:
                        "ancientTree",

                    safeRadius:
                        49,

                    minX:
                        120,

                    maxX:
                        3080,

                    minY:
                        120,

                    maxY:
                        2180

                }

            );

        }


        for (
            let i = 0;
            i <
            15;
            i++
        ) {

            addGeneratedRock(

                rng,

                `grove_rock_${i}`,

                {

                    type:
                        "groveStone",

                    minX:
                        150,

                    maxX:
                        3050,

                    minY:
                        160,

                    maxY:
                        2130

                }

            );

        }


        for (
            let i = 0;
            i <
            9;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                    3 ===
                    0

                    ? "moth"

                    : "thornling",

                i,

                {

                    minX:
                        420,

                    maxX:
                        2800,

                    minY:
                        260,

                    maxY:
                        2030,

                    drop:
                        i %
                            3 ===
                            0

                            ? "essencia"

                            : "madeira",

                    dropChance:
                        0.4

                }

            );

        }


        /* BOSS 3 */

        spawnProgressionBoss({

            id:
                "grove_heart",

            name:
                "CORAÇÃO DO BOSQUE",

            spriteType:
                "groveHeart",

            icon:
                "✿",

            x:
                2860,

            y:
                1150,

            hp:
                620,

            maxHp:
                620,

            damage:
                29,

            speed:
                58,

            vision:
                340,

            attackRange:
                90,

            radius:
                38,

            color:
                "#5f7654",

            xp:
                310,

            money:
                210,

            bossPattern:
                "grovePulse",

            unlock:
                "mountains",

            progressionIndex:
                3

        });


        addPortal(

            3070,
            1040,

            80,
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
                        190,

                    y:
                        1140

                }

            }

        );


        addBiomeDetails(

            rng,

            125,

            [

                "magicFlower",

                "fern",

                "ancientRoot",

                "glowingGrass",

                "smallStone"

            ],

            {

                minSize:
                    6,

                maxSize:
                    18,

                avoidObstacles:
                    false

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
                        110,
                    y:
                        1140
                },

                {
                    x:
                        510,
                    y:
                        1080
                },

                {
                    x:
                        890,
                    y:
                        1260
                },

                {
                    x:
                        1280,
                    y:
                        1190
                },

                {
                    x:
                        1580,
                    y:
                        910
                },

                {
                    x:
                        1960,
                    y:
                        1000
                },

                {
                    x:
                        2310,
                    y:
                        1290
                },

                {
                    x:
                        2740,
                    y:
                        1210
                },

                {
                    x:
                        3400,
                    y:
                        1120
                }

            ],

            118,

            {

                surface:
                    "snowStone"

            }

        );


        addPortal(

            72,
            1040,

            80,
            205,

            "grove",

            null,

            "BOSQUE",

            {

                id:
                    "mountains_to_grove",

                spawn: {

                    x:
                        3040,

                    y:
                        1150

                }

            }

        );


        /* ROCHAS */

        for (
            let i = 0;
            i <
            24;
            i++
        ) {

            addGeneratedRock(

                rng,

                `mountain_rock_${i}`,

                {

                    type:
                        i %
                            4 ===
                            0

                            ? "iceRock"

                            : "snowrock",

                    minX:
                        160,

                    maxX:
                        3340,

                    minY:
                        150,

                    maxY:
                        2130,

                    w:
                        rngRange(
                            rng,
                            52,
                            96
                        ),

                    h:
                        rngRange(
                            rng,
                            38,
                            76
                        )

                }

            );

        }


        /* MINÉRIOS */

        for (
            let i = 0;
            i <
            12;
            i++
        ) {

            addGeneratedResource(

                rng,

                i %
                    4 ===
                    0

                    ? "ouro"

                    : "ferro",

                `mountain_ore_${i}`,

                {

                    minX:
                        260,

                    maxX:
                        3200,

                    minY:
                        240,

                    maxY:
                        2050,

                    collectTime:
                        1.35

                }

            );

        }


        for (
            let i = 0;
            i <
            9;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                    2

                    ? "stoneCrawler"

                    : "snowRaider",

                i,

                {

                    minX:
                        430,

                    maxX:
                        3060,

                    minY:
                        280,

                    maxY:
                        2000,

                    drop:
                        i %
                            2

                            ? "ferro"

                            : "ouro",

                    dropChance:
                        0.48

                }

            );

        }


        /* BOSS 4 */

        spawnProgressionBoss({

            id:
                "mountain_colossus",

            name:
                "COLOSSO DA MONTANHA",

            spriteType:
                "mountainColossus",

            icon:
                "▲",

            x:
                3160,

            y:
                1120,

            hp:
                820,

            maxHp:
                820,

            damage:
                34,

            speed:
                50,

            vision:
                360,

            attackRange:
                98,

            radius:
                44,

            color:
                "#858c8c",

            xp:
                410,

            money:
                280,

            bossPattern:
                "mountainQuake",

            unlock:
                "iron",

            progressionIndex:
                4

        });


        addPortal(

            3370,
            1015,

            82,
            215,

            "iron",

            () =>
                hasDefeatedBoss(
                    "mountain_colossus"
                ),

            "CAVERNA DE FERRO",

            {

                id:
                    "mountains_to_iron",

                spawn: {

                    x:
                        190,

                    y:
                        1000

                }

            }

        );


        addBiomeDetails(

            rng,

            120,

            [

                "snowDrift",

                "deadPine",

                "windMark",

                "smallStone"

            ],

            {

                minSize:
                    7,

                maxSize:
                    20,

                avoidObstacles:
                    false

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
                        110,
                    y:
                        1000
                },

                {
                    x:
                        470,
                    y:
                        1020
                },

                {
                    x:
                        790,
                    y:
                        840
                },

                {
                    x:
                        1130,
                    y:
                        900
                },

                {
                    x:
                        1420,
                    y:
                        1160
                },

                {
                    x:
                        1750,
                    y:
                        1080
                },

                {
                    x:
                        2050,
                    y:
                        820
                },

                {
                    x:
                        2430,
                    y:
                        910
                },

                {
                    x:
                        2880,
                    y:
                        980
                }

            ],

            102,

            {

                surface:
                    "mineTrack"

            }

        );


        addPortal(

            72,
            900,

            80,
            205,

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
                        1120

                }

            }

        );


        for (
            let i = 0;
            i <
            21;
            i++
        ) {

            addGeneratedRock(

                rng,

                `iron_rock_${i}`,

                {

                    type:
                        i %
                            3 ===
                            0

                            ? "ironrock"

                            : "oreRock",

                    minX:
                        150,

                    maxX:
                        2850,

                    minY:
                        150,

                    maxY:
                        1850,

                    blocksLight:
                        true

                }

            );

        }


        /*
            FERRO E OURO SEPARADOS.
        */

        for (
            let i = 0;
            i <
            18;
            i++
        ) {

            addGeneratedResource(

                rng,

                i %
                    5 ===
                    0

                    ? "ouro"

                    : "ferro",

                `iron_node_${i}`,

                {

                    minX:
                        220,

                    maxX:
                        2780,

                    minY:
                        200,

                    maxY:
                        1800,

                    collectTime:
                        1.3,

                    amountMax:
                        3

                }

            );

        }


        for (
            let i = 0;
            i <
            10;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                    2

                    ? "ironBeetle"

                    : "mineWraith",

                i,

                {

                    minX:
                        390,

                    maxX:
                        2600,

                    minY:
                        240,

                    maxY:
                        1750,

                    drop:
                        "ferro",

                    dropChance:
                        0.62

                }

            );

        }


        /* BOSS 5 */

        spawnProgressionBoss({

            id:
                "iron_tyrant",

            name:
                "TIRANO DE FERRO",

            spriteType:
                "ironTyrant",

            icon:
                "⬢",

            x:
                2640,

            y:
                980,

            hp:
                1080,

            maxHp:
                1080,

            damage:
                39,

            speed:
                56,

            vision:
                370,

            attackRange:
                100,

            radius:
                43,

            color:
                "#656b6d",

            xp:
                520,

            money:
                360,

            bossPattern:
                "ironMagnet",

            unlock:
                "ruby",

            progressionIndex:
                5

        });


        addPortal(

            2845,
            870,

            82,
            220,

            "ruby",

            () =>
                hasDefeatedBoss(
                    "iron_tyrant"
                ),

            "CAVERNA DE RUBI",

            {

                id:
                    "iron_to_ruby",

                spawn: {

                    x:
                        190,

                    y:
                        1080

                }

            }

        );


        addBiomeDetails(

            rng,

            105,

            [

                "rail",

                "mineLantern",

                "toolCrate",

                "oreSpark",

                "stalagmite"

            ],

            {

                minSize:
                    6,

                maxSize:
                    18,

                avoidObstacles:
                    false

            }

        );

    }


    /* =========================================================
       CAVERNA DE RUBI
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
                        110,
                    y:
                        1080
                },

                {
                    x:
                        520,
                    y:
                        1100
                },

                {
                    x:
                        860,
                    y:
                        920
                },

                {
                    x:
                        1200,
                    y:
                        1030
                },

                {
                    x:
                        1510,
                    y:
                        1320
                },

                {
                    x:
                        1870,
                    y:
                        1220
                },

                {
                    x:
                        2200,
                    y:
                        900
                },

                {
                    x:
                        2570,
                    y:
                        760
                },

                /*
                    CAMINHO LEVA PARA O CANTO
                    SUPERIOR DIREITO.
                */

                {
                    x:
                        2980,
                    y:
                        410
                }

            ],

            106,

            {

                surface:
                    "rubyStone"

            }

        );


        addPortal(

            72,
            980,

            80,
            205,

            "iron",

            null,

            "CAVERNA DE FERRO",

            {

                id:
                    "ruby_to_iron",

                spawn: {

                    x:
                        2740,

                    y:
                        980

                }

            }

        );


        for (
            let i = 0;
            i <
            22;
            i++
        ) {

            addGeneratedRock(

                rng,

                `ruby_rock_${i}`,

                {

                    type:
                        i %
                            4 ===
                            0

                            ? "rubyPillar"

                            : "rubyrock",

                    minX:
                        150,

                    maxX:
                        3050,

                    minY:
                        150,

                    maxY:
                        1990,

                    blocksLight:
                        true

                }

            );

        }


        /*
            RUBI E DIAMANTE SEPARADOS.
        */

        for (
            let i = 0;
            i <
            22;
            i++
        ) {

            addGeneratedResource(

                rng,

                i %
                    4 ===
                    0

                    ? "diamante"

                    : "rubi",

                `ruby_node_${i}`,

                {

                    minX:
                        220,

                    maxX:
                        2950,

                    minY:
                        220,

                    maxY:
                        1900,

                    collectTime:
                        1.45,

                    amountMin:
                        1,

                    amountMax:
                        3

                }

            );

        }


        for (
            let i = 0;
            i <
            11;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                    2

                    ? "rubyHound"

                    : "rubyAcolyte",

                i,

                {

                    minX:
                        380,

                    maxX:
                        2700,

                    minY:
                        250,

                    maxY:
                        1870,

                    drop:
                        i %
                            3 ===
                            0

                            ? "diamante"

                            : "rubi",

                    dropChance:
                        0.58

                }

            );

        }


        /* =====================================================
           BOSS 6 — QUIMERA RUBRA
           ===================================================== */

        spawnProgressionBoss({

            id:
                "ruby_chimera",

            name:
                "QUIMERA RUBRA",

            spriteType:
                "rubyChimera",

            icon:
                "♦",

            x:
                2530,

            y:
                760,

            hp:
                1380,

            maxHp:
                1380,

            damage:
                45,

            speed:
                78,

            vision:
                390,

            attackRange:
                108,

            radius:
                46,

            color:
                "#92485a",

            xp:
                680,

            money:
                470,

            bossPattern:
                "rubyChimera",

            unlock:
                "monarchMaze",

            progressionIndex:
                6

        });


        /*
            CAVERNA ESCURA DEPOIS DO RUBI.

            FICA NO CANTO SUPERIOR DIREITO,
            NÃO NO CENTRO.
        */

        addDecoration(

            2980,
            290,

            "darkCaveEntrance",

            {

                large:
                    true

            }

        );


        addPortal(

            2910,
            205,

            180,
            170,

            "monarchMaze",

            () =>
                hasDefeatedBoss(
                    "ruby_chimera"
                ),

            "PASSAGEM ESCURA",

            {

                id:
                    "ruby_to_monarch_maze",

                spawn: {

                    x:
                        180,

                    y:
                        1090

                },

                protectionPadding:
                    110

            }

        );


        addBiomeDetails(

            rng,

            120,

            [

                "crystalShard",

                "crystalPillar",

                "oreSpark",

                "darkPebble"

            ],

            {

                minSize:
                    6,

                maxSize:
                    20,

                avoidObstacles:
                    false

            }

        );

    }


    /* =========================================================
       GERADOR DO LABIRINTO

       DFS:
       - aleatório por novo jogo;
       - fixo no mesmo save;
       - sempre conectado;
       - sempre possui rota solucionável.
       ========================================================= */

    function generateMaze(
        cols,
        rows,
        rng,
        startX,
        startY
    ) {

        const grid =
            Array.from(

                {
                    length:
                        rows
                },

                (
                    _,
                    y
                ) =>
                    Array.from(

                        {
                            length:
                                cols
                        },

                        (
                            __,
                            x
                        ) => ({

                            x,

                            y,

                            visited:
                                false,

                            walls: {

                                n:
                                    true,

                                e:
                                    true,

                                s:
                                    true,

                                w:
                                    true

                            }

                        })

                    )

            );


        const stack =
            [];


        let current =
            grid[
                startY
            ][
                startX
            ];


        current.visited =
            true;


        let visited =
            1;


        while (
            visited <
            cols *
            rows
        ) {

            const choices =
                [];


            const {
                x,
                y
            } =
                current;


            if (
                y >
                    0 &&
                !grid[
                    y -
                    1
                ][
                    x
                ].visited
            ) {

                choices.push([

                    grid[
                        y -
                        1
                    ][
                        x
                    ],

                    "n",

                    "s"

                ]);

            }


            if (
                x <
                    cols -
                    1 &&
                !grid[
                    y
                ][
                    x +
                    1
                ].visited
            ) {

                choices.push([

                    grid[
                        y
                    ][
                        x +
                        1
                    ],

                    "e",

                    "w"

                ]);

            }


            if (
                y <
                    rows -
                    1 &&
                !grid[
                    y +
                    1
                ][
                    x
                ].visited
            ) {

                choices.push([

                    grid[
                        y +
                        1
                    ][
                        x
                    ],

                    "s",

                    "n"

                ]);

            }


            if (
                x >
                    0 &&
                !grid[
                    y
                ][
                    x -
                    1
                ].visited
            ) {

                choices.push([

                    grid[
                        y
                    ][
                        x -
                        1
                    ],

                    "w",

                    "e"

                ]);

            }


            if (
                choices.length
            ) {

                const [
                    next,
                    wallHere,
                    wallThere
                ] =
                    choices[
                        Math.floor(
                            rng() *
                            choices.length
                        )
                    ];


                current
                    .walls[
                        wallHere
                    ] =
                    false;


                next
                    .walls[
                        wallThere
                    ] =
                    false;


                stack.push(
                    current
                );


                current =
                    next;


                current.visited =
                    true;


                visited++;

            }

            else {

                current =
                    stack.pop();

            }

        }


        return grid;

    }


    /* =========================================================
       LABIRINTO DO MONARCA
       ========================================================= */

    function buildMonarchMaze() {

        const rng =
            getAreaRng(
                "monarchMaze",
                "maze"
            );


        const cols =
            16;


        const rows =
            13;


        const cell =
            128;


        const originX =
            135;


        const originY =
            260;


        const startRow =
            6;


        const endRow =
            6;


        const wallThickness =
            18;


        const grid =
            generateMaze(

                cols,
                rows,
                rng,

                0,
                startRow

            );


        /*
            ABERTURA DE ENTRADA.
        */

        grid[
            startRow
        ][
            0
        ]
            .walls
            .w =
            false;


        /*
            ABERTURA DE SAÍDA
            PARA A ARENA.
        */

        grid[
            endRow
        ][
            cols -
            1
        ]
            .walls
            .e =
            false;


        addProtectedRect(

            72,

            originY +
            startRow *
            cell +
            26,

            160,

            cell -
            52,

            35,

            "maze_entrance"

        );


        addPortal(

            72,

            originY +
            startRow *
            cell +
            28,

            76,

            cell -
            56,

            "ruby",

            null,

            "VOLTAR À CAVERNA DE RUBI",

            {

                id:
                    "maze_to_ruby",

                spawn: {

                    x:
                        2940,

                    y:
                        330

                },

                protectionPadding:
                    24

            }

        );


        const wallKeys =
            new Set();


        const addMazeWall = (
            x,
            y,
            w,
            h,
            key
        ) => {

            if (
                wallKeys.has(
                    key
                )
            ) {

                return;

            }


            wallKeys.add(
                key
            );


            addObstacle(

                x,
                y,
                w,
                h,

                "mazeWall",

                {

                    id:
                        `maze_${key}`,

                    blocksLight:
                        true

                }

            );

        };


        for (
            let y = 0;
            y <
            rows;
            y++
        ) {

            for (
                let x = 0;
                x <
                cols;
                x++
            ) {

                const current =
                    grid[
                        y
                    ][
                        x
                    ];


                const px =
                    originX +
                    x *
                    cell;


                const py =
                    originY +
                    y *
                    cell;


                if (
                    current
                        .walls
                        .n
                ) {

                    addMazeWall(

                        px,
                        py,

                        cell +
                        wallThickness,

                        wallThickness,

                        `n_${x}_${y}`

                    );

                }


                if (
                    current
                        .walls
                        .w
                ) {

                    addMazeWall(

                        px,
                        py,

                        wallThickness,

                        cell +
                        wallThickness,

                        `w_${x}_${y}`

                    );

                }


                if (
                    y ===
                        rows -
                        1 &&
                    current
                        .walls
                        .s
                ) {

                    addMazeWall(

                        px,

                        py +
                        cell,

                        cell +
                        wallThickness,

                        wallThickness,

                        `s_${x}_${y}`

                    );

                }


                if (
                    x ===
                        cols -
                        1 &&
                    current
                        .walls
                        .e
                ) {

                    addMazeWall(

                        px +
                        cell,

                        py,

                        wallThickness,

                        cell +
                        wallThickness,

                        `e_${x}_${y}`

                    );

                }

            }

        }


        /*
            CORREDOR PARA A ARENA.
        */

        const exitX =
            originX +
            cols *
            cell;


        const exitY =
            originY +
            endRow *
            cell +
            cell /
            2;


        addPath(

            "mazeExit",

            [

                {

                    x:
                        exitX +
                        15,

                    y:
                        exitY

                },


                {

                    x:
                        2520,

                    y:
                        exitY

                },


                {

                    x:
                        2700,

                    y:
                        1100

                }

            ],

            92,

            {

                protect:
                    true,

                protectionPadding:
                    10

            }

        );


        /* =====================================================
           ARENA DO MONARCA
           ===================================================== */

        const arena = {

            x:
                2670,

            y:
                620,

            w:
                760,

            h:
                980

        };


        addObstacle(

            arena.x,
            arena.y,

            arena.w,
            24,

            "arenaWall",

            {

                id:
                    "arena_top",

                blocksLight:
                    true

            }

        );


        addObstacle(

            arena.x,

            arena.y +
            arena.h -
            24,

            arena.w,
            24,

            "arenaWall",

            {

                id:
                    "arena_bottom",

                blocksLight:
                    true

            }

        );


        addObstacle(

            arena.x +
            arena.w -
            24,

            arena.y,

            24,
            arena.h,

            "arenaWall",

            {

                id:
                    "arena_right",

                blocksLight:
                    true

            }

        );


        /*
            PAREDE ESQUERDA TEM UMA ENTRADA.
        */

        addObstacle(

            arena.x,
            arena.y,

            24,
            380,

            "arenaWall",

            {

                id:
                    "arena_left_top",

                blocksLight:
                    true

            }

        );


        addObstacle(

            arena.x,

            arena.y +
            600,

            24,
            380,

            "arenaWall",

            {

                id:
                    "arena_left_bottom",

                blocksLight:
                    true

            }

        );


        /*
            ALTAR.

            Sem lanterna, a Parte 3 NÃO
            desenhará brilho orientando
            o jogador até ele.
        */

        addProtectedCircle(

            3050,
            1100,

            150,

            20,

            "monarch_altar"

        );


        state.world
            .trials
            .push({

                id:
                    "dash_altar",

                title:
                    "ALTAR ESQUECIDO",

                x:
                    3050,

                y:
                    1100,

                radius:
                    70,

                dashAltar:
                    true

            });


        addDecoration(

            3050,
            1100,

            "dashAltar",

            {

                hiddenWithoutLantern:
                    true

            }

        );


        /* =====================================================
           INIMIGOS DO LABIRINTO
           ===================================================== */

        const openCells =
            [];


        for (
            let y = 0;
            y <
            rows;
            y++
        ) {

            for (
                let x = 0;
                x <
                cols;
                x++
            ) {

                if (
                    x ===
                        0 &&
                    y ===
                        startRow
                ) {

                    continue;

                }


                if (
                    x ===
                        cols -
                        1 &&
                    y ===
                        endRow
                ) {

                    continue;

                }


                openCells.push({

                    x:
                        originX +
                        x *
                        cell +
                        cell /
                        2,

                    y:
                        originY +
                        y *
                        cell +
                        cell /
                        2

                });

            }

        }


        /*
            EMBARALHA AS CÉLULAS COM O SEED.
        */

        for (
            let i =
                openCells.length -
                1;

            i >
            0;

            i--
        ) {

            const j =
                Math.floor(
                    rng() *
                    (
                        i +
                        1
                    )
                );


            [
                openCells[
                    i
                ],

                openCells[
                    j
                ]

            ] = [

                openCells[
                    j
                ],

                openCells[
                    i
                ]

            ];

        }


        const mazeTypes = [

            "spider",

            "scorpion",

            "bat"

        ];


        for (
            let i = 0;
            i <
            16;
            i++
        ) {

            const position =
                openCells[
                    i
                ];


            const typeId =
                mazeTypes[
                    i %
                    mazeTypes.length
                ];


            const type =
                ENEMY_TYPES[
                    typeId
                ];


            addEnemy({

                ...type,

                id:
                    `maze_${typeId}_${i}`,

                x:
                    position.x,

                y:
                    position.y,

                drop:
                    i %
                        3 ===
                        0

                        ? "diamante"

                        : "rubi",

                dropChance:
                    0.42

            });

        }


        /*
            TEIAS/PEDRINHAS:
            somente decoração.
        */

        for (
            let i = 0;
            i <
            70;
            i++
        ) {

            const position =
                openCells[
                    (
                        i *
                        3
                    ) %
                    openCells.length
                ];


            addDecoration(

                position.x +
                rngRange(
                    rng,
                    -35,
                    35
                ),

                position.y +
                rngRange(
                    rng,
                    -35,
                    35
                ),

                i %
                    4 ===
                    0

                    ? "cobweb"

                    : "darkPebble",

                {

                    size:
                        rngRange(
                            rng,
                            5,
                            15
                        )

                }

            );

        }

    }


    /* =========================================================
       INTERIORES
       ========================================================= */

    function getHouseSpec() {

        const id =
            state.currentHouse
                ?.interiorId ||
            state.currentHouse
                ?.id;


        return (
            HOUSE_INTERIORS[
                id
            ] ||
            HOUSE_INTERIORS
                .home
        );

    }


    function getHouseRoom() {

        return getHouseSpec()
            .room;

    }


    function getHouseFurniture() {

        return (
            getHouseSpec()
                .furniture ||
            []
        );

    }


    function getHouseInteriorNPCs() {

        return (
            getHouseSpec()
                .npcs ||
            []
        )
            .map(
                npc => ({
                    ...npc
                })
            );

    }


    function getInteriorDoor() {

        const room =
            getHouseRoom();


        return {

            x:
                room.x +
                room.w /
                2 -
                48,

            y:
                room.y +
                room.h -
                36,

            w:
                96,

            h:
                60

        };

    }


    function placePlayerInsideHouse() {

        const spec =
            getHouseSpec();


        state.player.x =
            spec.spawn.x;


        state.player.y =
            spec.spawn.y;


        state.player.facing =
            "down";

    }


    function enterHouseImmediate(
        building,
        initial =
            false
    ) {

        state.currentHouse =
            building;


        state.houseMode =
            true;


        state.houseReturn =
            initial

                ? {

                    x:
                        building.x +
                        building.w /
                        2,

                    y:
                        building.y +
                        building.h +
                        76

                }

                : (

                    state.houseReturn ||

                    {

                        x:
                            building.x +
                            building.w /
                            2,

                        y:
                            building.y +
                            building.h +
                            76

                    }

                );


        placePlayerInsideHouse();


        state.camera.x =
            0;


        state.camera.y =
            0;

    }


    function enterHouse(
        building
    ) {

        if (
            !building
                ?.enterable ||
            state.transition
        ) {

            return;

        }


        state.houseReturn = {

            x:
                state.player.x,

            y:
                state.player.y

        };


        const door =
            state.world
                .doors
                .find(
                    item =>
                        item.buildingId ===
                        building.id
                );


        if (
            door
        ) {

            door.targetAnimation =
                1;

        }


        startTransition({

            label:
                building.name,

            fadeOut:
                0.32,

            hold:
                0.18,

            fadeIn:
                0.5,

            onMidpoint:
                () => {

                    enterHouseImmediate(
                        building,
                        false
                    );

                },

            done:
                () => {

                    if (
                        door
                    ) {

                        door.targetAnimation =
                            0;

                    }

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


        const returnPoint =
            state.houseReturn ||

            {

                x:
                    building.x +
                    building.w /
                    2,

                y:
                    building.y +
                    building.h +
                    76

            };


        startTransition({

            label:
                "VILA DO CREPÚSCULO",

            fadeOut:
                0.3,

            hold:
                0.16,

            fadeIn:
                0.48,

            onMidpoint:
                () => {

                    state.houseMode =
                        false;


                    state.currentHouse =
                        null;


                    state.player.x =
                        clamp(

                            returnPoint.x,

                            90,

                            state.world.width -
                            90

                        );


                    state.player.y =
                        clamp(

                            returnPoint.y,

                            90,

                            state.world.height -
                            90

                        );


                    state.player.facing =
                        "down";

                }

        });

    }


    /* =========================================================
       TROCA DE REGIÃO
       ========================================================= */

    function transitionToRegion(
        target,
        options =
            {}
    ) {

        if (
            !REGIONS[
                target
            ] ||
            state.transition ||
            state.portalCooldown >
                0
        ) {

            return;

        }


        const label =
            options.label ||
            REGIONS[
                target
            ].name;


        state.portalCooldown =
            1;


        startTransition({

            label,

            fadeOut:
                0.42,

            hold:
                0.24,

            fadeIn:
                0.62,

            onMidpoint:
                () => {

                    state.area =
                        target;


                    state.houseMode =
                        false;


                    state.currentHouse =
                        null;


                    state.houseReturn =
                        null;


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
                        "right";


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


                    if (
                        !state.player
                            .unlockedAreas
                            .includes(
                                target
                            )
                    ) {

                        state.player
                            .unlockedAreas
                            .push(
                                target
                            );

                    }

                }

        });

    }


    function getDefaultSpawn(
        area
    ) {

        const defaults = {

            village: {

                x:
                    2920,

                y:
                    1110,

                facing:
                    "left"

            },


            forest: {

                x:
                    180,

                y:
                    1210,

                facing:
                    "right"

            },


            grove: {

                x:
                    180,

                y:
                    1150,

                facing:
                    "right"

            },


            mountains: {

                x:
                    190,

                y:
                    1140,

                facing:
                    "right"

            },


            iron: {

                x:
                    190,

                y:
                    1000,

                facing:
                    "right"

            },


            ruby: {

                x:
                    190,

                y:
                    1080,

                facing:
                    "right"

            },


            monarchMaze: {

                x:
                    190,

                y:
                    1090,

                facing:
                    "right"

            },


            shadow: {

                x:
                    1500,

                y:
                    1840,

                facing:
                    "up"

            },


            fairy: {

                x:
                    180,

                y:
                    1100,

                facing:
                    "right"

            },


            sky: {

                x:
                    180,

                y:
                    1100,

                facing:
                    "right"

            },


            hell: {

                x:
                    1800,

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
            defaults[
                area
            ] ||

            {

                x:
                    180,

                y:
                    180,

                facing:
                    "down"

            }
        );

    }


    /* =========================================================
       FIM DA PARTE 1/3

       NÃO coloque })(); aqui.

       Cole a PARTE 2 imediatamente abaixo.
       ========================================================= */
    /* =========================================================
       VEYRA: A QUIETUDE — V19
       PARTE 2/3
       SISTEMAS, COMBATE, IA, DROPS, LOJA E REGIÕES
       ========================================================= */


    /* =========================================================
       GARANTIAS DE RUNTIME
       ========================================================= */

    function ensureWorldRuntimeArrays() {

        const world =
            state.world;


        const arrays = [
            "projectiles",
            "damageNumbers",
            "floatingTexts",
            "enemyRespawns"
        ];


        arrays.forEach(
            key => {

                if (
                    !Array.isArray(
                        world[key]
                    )
                ) {

                    world[key] =
                        [];

                }

            }
        );

    }


    function finiteNumber(
        value,
        fallback
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


    function sanitizeRuntimePlayer() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        player.skillCooldowns = {

            q:
                Math.max(
                    0,
                    finiteNumber(
                        player.skillCooldowns?.q,
                        0
                    )
                ),

            r:
                Math.max(
                    0,
                    finiteNumber(
                        player.skillCooldowns?.r,
                        0
                    )
                ),

            f:
                Math.max(
                    0,
                    finiteNumber(
                        player.skillCooldowns?.f,
                        0
                    )
                )

        };


        player.itemCooldowns =
            player.itemCooldowns ||
            {};


        player.activePotionBuffs =
            Array.isArray(
                player.activePotionBuffs
            )

                ? player.activePotionBuffs

                : [];


        player.stats = {

            strength:
                clamp(
                    finiteNumber(
                        player.stats?.strength,
                        0
                    ),
                    0,
                    STAT_CAP
                ),

            energy:
                clamp(
                    finiteNumber(
                        player.stats?.energy,
                        0
                    ),
                    0,
                    STAT_CAP
                ),

            fatigue:
                clamp(
                    finiteNumber(
                        player.stats?.fatigue,
                        0
                    ),
                    0,
                    STAT_CAP
                ),

            hunger:
                clamp(
                    finiteNumber(
                        player.stats?.hunger,
                        0
                    ),
                    0,
                    STAT_CAP
                ),

            hp:
                clamp(
                    finiteNumber(
                        player.stats?.hp,
                        0
                    ),
                    0,
                    STAT_CAP
                )

        };


        player.abilities = {

            dash:
                Boolean(
                    player.abilities?.dash
                ),

            route2:
                Boolean(
                    player.abilities?.route2
                ),

            route3:
                Boolean(
                    player.abilities?.route3
                )

        };


        player.gateDialogueIndex = {

            north:
                finiteNumber(
                    player.gateDialogueIndex?.north,
                    0
                ),

            west:
                finiteNumber(
                    player.gateDialogueIndex?.west,
                    0
                ),

            south:
                finiteNumber(
                    player.gateDialogueIndex?.south,
                    0
                )

        };


        player.gateUnlocks = {

            north:
                Boolean(
                    player.gateUnlocks?.north
                ),

            west:
                Boolean(
                    player.gateUnlocks?.west
                ),

            south:
                Boolean(
                    player.gateUnlocks?.south
                )

        };


        player.inventory =
            player.inventory ||
            {};


        Object
            .keys(
                ITEMS
            )
            .forEach(
                id => {

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
            );


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


        player.secretsFound =
            Array.isArray(
                player.secretsFound
            )

                ? player.secretsFound

                : [];


        player.hellTypesDefeated =
            player.hellTypesDefeated ||
            {};


        player.collected =
            player.collected ||
            {};


        player.worldSeeds =
            player.worldSeeds ||
            {};


        player.skyTrial =
            player.skyTrial ||
            {

                started:
                    false,

                wave:
                    0,

                activeWave:
                    0,

                complete:
                    false

            };


        player.quest =
            player.quest ||
            {};


        player.quest.wood =
            player.quest.wood ||
            {

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

            };


        player.quest.coal =
            player.quest.coal ||
            {

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

            };


        player.monarchAwakened =
            Boolean(
                player.monarchAwakened
            );


        player.monarchDefeated =
            Boolean(
                player.monarchDefeated
            );


        player.dashPurchased =
            Boolean(
                player.dashPurchased
            );


        player.flutePlayed =
            Boolean(
                player.flutePlayed
            );


        player.fluteRewardGranted =
            Boolean(
                player.fluteRewardGranted
            );


        player.minimapOwned =
            Boolean(
                player.minimapOwned ||
                player.inventory.minimapa >
                0
            );


        player.lanternOwned =
            Boolean(
                player.lanternOwned ||
                player.inventory.lanterna >
                0
            );


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


        recalculatePlayerStats();

    }


    function recalculatePlayerStats() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        const stats =
            player.stats ||
            {};


        player.maxHp =
            Math.max(
                1,

                finiteNumber(
                    player.baseMaxHp,
                    100
                ) +

                finiteNumber(
                    stats.hp,
                    0
                ) *
                8
            );


        player.maxEnergy =
            Math.max(
                1,

                finiteNumber(
                    player.baseMaxEnergy,
                    100
                ) +

                finiteNumber(
                    stats.energy,
                    0
                ) *
                5
            );


        player.maxMagic =
            Math.max(
                1,

                finiteNumber(
                    player.baseMaxMagic,
                    100
                )
            );


        player.maxHunger =
            100 +
            finiteNumber(
                stats.hunger,
                0
            ) *
            3;


        player.maxFatigue =
            100 +
            finiteNumber(
                stats.fatigue,
                0
            ) *
            3;


        player.hp =
            clamp(
                finiteNumber(
                    player.hp,
                    player.maxHp
                ),
                0,
                player.maxHp
            );


        player.magic =
            clamp(
                finiteNumber(
                    player.magic,
                    player.maxMagic
                ),
                0,
                player.maxMagic
            );


        player.energy =
            clamp(
                finiteNumber(
                    player.energy,
                    player.maxEnergy
                ),
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


    /* =========================================================
       COLISÃO DO PLAYER
       ========================================================= */

    function furnitureBlocksPlayer(
        x,
        y,
        radius
    ) {

        if (
            !state.houseMode
        ) {

            return false;

        }


        return getHouseFurniture()
            .some(
                furniture => {

                    if (
                        furniture.solid ===
                        false
                    ) {

                        return false;

                    }


                    return circleRectCollision(
                        x,
                        y,
                        radius,
                        furniture
                    );

                }
            );

    }


    function interiorBoundsBlock(
        x,
        y,
        radius
    ) {

        if (
            !state.houseMode
        ) {

            return false;

        }


        const room =
            getHouseRoom();


        return (

            x -
            radius <
            room.x +
            34 ||

            y -
            radius <
            room.y +
            34 ||

            x +
            radius >
            room.x +
            room.w -
            34 ||

            y +
            radius >
            room.y +
            room.h -
            26

        );

    }


    function canPlayerMoveTo(
        x,
        y,
        radius =
            state.player?.radius ||
            18
    ) {

        if (
            state.houseMode
        ) {

            if (
                interiorBoundsBlock(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }


            if (
                furnitureBlocksPlayer(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }


            return true;

        }


        if (

            x -
            radius <
            WORLD_MARGIN ||

            y -
            radius <
            WORLD_MARGIN ||

            x +
            radius >
            state.world.width -
            WORLD_MARGIN ||

            y +
            radius >
            state.world.height -
            WORLD_MARGIN

        ) {

            return false;

        }


        return !circleHitsSolidObstacle(
            x,
            y,
            radius
        );

    }


    function moveCircleWithCollision(
        entity,
        dx,
        dy,
        amount,
        options =
            {}
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );


        if (
            length <=
            0.0001
        ) {

            return false;

        }


        dx /=
            length;

        dy /=
            length;


        const radius =
            entity.radius ||
            18;


        const checker =
            options.checker ||
            canPlayerMoveTo;


        let moved =
            false;


        const nextX =
            entity.x +
            dx *
            amount;


        if (
            checker(
                nextX,
                entity.y,
                radius,
                entity
            )
        ) {

            entity.x =
                nextX;


            moved =
                true;

        }


        const nextY =
            entity.y +
            dy *
            amount;


        if (
            checker(
                entity.x,
                nextY,
                radius,
                entity
            )
        ) {

            entity.y =
                nextY;


            moved =
                true;

        }


        return moved;

    }


    function getMovementSpeed() {

        const player =
            state.player;


        let speed =
            finiteNumber(
                player.baseSpeed,
                player.speed ||
                150
            );


        if (

            player.hunger <=
            0 ||

            player.fatigue <=
            0

        ) {

            speed *=
                0.7;

        }


        if (
            hasActivePotionBuff(
                "speed"
            )
        ) {

            speed *=
                1.22;

        }


        if (
            player.adaptiveBuff
        ) {

            speed *=
                1.16;

        }


        return speed;

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

            state.paused ||

            state.transition

        ) {

            return;

        }


        if (
            player.playerDash
        ) {

            updateUniversalDash(
                dt
            );


            return;

        }


        let dx =
            0;

        let dy =
            0;


        if (

            state.keys.has(
                "w"
            ) ||

            state.keys.has(
                "arrowup"
            )

        ) {

            dy -=
                1;

        }


        if (

            state.keys.has(
                "s"
            ) ||

            state.keys.has(
                "arrowdown"
            )

        ) {

            dy +=
                1;

        }


        if (

            state.keys.has(
                "a"
            ) ||

            state.keys.has(
                "arrowleft"
            )

        ) {

            dx -=
                1;

        }


        if (

            state.keys.has(
                "d"
            ) ||

            state.keys.has(
                "arrowright"
            )

        ) {

            dx +=
                1;

        }


        if (

            dx ===
            0 &&

            dy ===
            0

        ) {

            player.walkTime =
                0;


            return;

        }


        const direction =
            normalize(
                dx,
                dy
            );


        dx =
            direction.x;

        dy =
            direction.y;


        if (

            Math.abs(
                dx
            ) >

            Math.abs(
                dy
            )

        ) {

            player.facing =
                dx >
                0

                    ? "right"

                    : "left";

        }

        else {

            player.facing =
                dy >
                0

                    ? "down"

                    : "up";

        }


        const moved =
            moveCircleWithCollision(

                player,

                dx,
                dy,

                getMovementSpeed() *
                dt

            );


        if (
            moved
        ) {

            player.walkTime +=
                dt *
                8;

        }

    }


    /* =========================================================
       SISTEMA ANTI-PRESO
       ========================================================= */

    function isPlayerPositionValid() {

        const player =
            state.player;


        if (
            !player
        ) {

            return false;

        }


        return canPlayerMoveTo(
            player.x,
            player.y,
            player.radius
        );

    }


    function repairPlayerPositionIfStuck() {

        const player =
            state.player;


        if (

            !player ||

            state.transition ||

            state.houseMode

        ) {

            return;

        }


        if (
            isPlayerPositionValid()
        ) {

            return;

        }


        const now =
            performance.now();


        if (

            now -
            state.debug
                .lastSafeRepair <

            700

        ) {

            return;

        }


        state.debug
            .lastSafeRepair =
            now;


        const rings = [
            32,
            56,
            84,
            120,
            170
        ];


        for (
            const ring of
            rings
        ) {

            for (
                let i = 0;
                i <
                16;
                i++
            ) {

                const angle =
                    i /
                    16 *
                    Math.PI *
                    2;


                const x =
                    player.x +
                    Math.cos(
                        angle
                    ) *
                    ring;


                const y =
                    player.y +
                    Math.sin(
                        angle
                    ) *
                    ring;


                if (
                    canPlayerMoveTo(
                        x,
                        y,
                        player.radius
                    )
                ) {

                    player.x =
                        x;


                    player.y =
                        y;


                    showToast(
                        "Posição corrigida para evitar uma colisão presa."
                    );


                    return;

                }

            }

        }


        const spawn =
            getDefaultSpawn(
                state.area
            );


        player.x =
            spawn.x;


        player.y =
            spawn.y;

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

            state.transition ||

            state.houseMode

        ) {

            return false;

        }


        if (
            !player.abilities
                .dash
        ) {

            showToast(
                "Você ainda não domina essa técnica."
            );


            return false;

        }


        if (
            player.dashCooldown >
            0
        ) {

            return false;

        }


        if (
            player.energy <
            8
        ) {

            showToast(
                "Energia insuficiente para esquivar."
            );


            return false;

        }


        const targetX =
            Number.isFinite(
                state.pointer.worldX
            )

                ? state.pointer.worldX

                : player.x +
                1;


        const targetY =
            Number.isFinite(
                state.pointer.worldY
            )

                ? state.pointer.worldY

                : player.y;


        let direction =
            normalize(

                targetX -
                player.x,

                targetY -
                player.y

            );


        if (
            direction.length <
            8
        ) {

            direction =
                facingVector(
                    player.facing
                );

        }


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

            dirX:
                direction.x,

            dirY:
                direction.y,

            time:
                0,

            duration:
                0.20,

            distance:
                205

        };


        createBurst(
            player.x,
            player.y,
            "#c9b0ff",
            14,
            110
        );


        createEffect({

            type:
                "dashRing",

            x:
                player.x,

            y:
                player.y,

            color:
                "#b99cff",

            life:
                0.34,

            maxLife:
                0.34,

            radius:
                16,

            maxRadius:
                70

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


        if (
            !dash
        ) {

            return;

        }


        const step =
            dash.distance /
            dash.duration *
            dt;


        const moved =
            moveCircleWithCollision(

                player,

                dash.dirX,
                dash.dirY,

                step

            );


        dash.time +=
            dt;


        if (
            Math.random() <
            0.78
        ) {

            createParticle({

                x:
                    player.x,

                y:
                    player.y,

                vx:
                    -dash.dirX *
                    random(
                        35,
                        80
                    ) +
                    random(
                        -20,
                        20
                    ),

                vy:
                    -dash.dirY *
                    random(
                        35,
                        80
                    ) +
                    random(
                        -20,
                        20
                    ),

                size:
                    random(
                        3,
                        7
                    ),

                color:
                    "#b99cff",

                life:
                    0.32

            });

        }


        if (

            !moved ||

            dash.time >=
            dash.duration

        ) {

            player.playerDash =
                null;


            createBurst(
                player.x,
                player.y,
                "#8f6bd8",
                8,
                75
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

            state.paused

        ) {

            return;

        }


        player.hunger =
            Math.max(
                0,

                player.hunger -
                0.105 *
                dt
            );


        player.fatigue =
            Math.max(
                0,

                player.fatigue -
                0.082 *
                dt
            );


        player.magic =
            Math.min(
                player.maxMagic,

                player.magic +
                2.2 *
                dt
            );


        player.energy =
            Math.min(
                player.maxEnergy,

                player.energy +
                4.1 *
                dt
            );


        if (

            player.hunger <=
            0 ||

            player.fatigue <=
            0

        ) {

            player.survivalDamageTimer =
                finiteNumber(
                    player.survivalDamageTimer,
                    0
                ) +
                dt;


            if (
                player.survivalDamageTimer >=
                3.5
            ) {

                player.survivalDamageTimer =
                    0;


                damagePlayer(
                    2,
                    {

                        source:
                            "survival",

                        small:
                            true

                    }
                );

            }

        }

        else {

            player.survivalDamageTimer =
                0;

        }

    }


    function sleepAtHome() {

        const player =
            state.player;


        if (

            !player ||

            !state.houseMode ||

            state.currentHouse?.id !==
            "home"

        ) {

            return false;

        }


        startTransition({

            label:
                "DESCANSANDO...",

            fadeOut:
                0.45,

            hold:
                0.75,

            fadeIn:
                0.65,

            onMidpoint:
                () => {

                    player.hp =
                        player.maxHp;


                    player.magic =
                        player.maxMagic;


                    player.energy =
                        player.maxEnergy;


                    player.fatigue =
                        player.maxFatigue;


                    player.hunger =
                        Math.min(
                            player.maxHunger,

                            player.hunger +
                            18
                        );

                },

            done:
                () => {

                    showToast(
                        "Você descansou."
                    );

                }

        });


        return true;

    }


    /* =========================================================
       INVENTÁRIO
       ========================================================= */

    function calculateInventoryWeight() {

        const player =
            state.player;


        if (
            !player
        ) {

            return 0;

        }


        let total =
            0;


        Object
            .entries(
                player.inventory
            )
            .forEach(
                ([
                    id,
                    amount
                ]) => {

                    const item =
                        ITEMS[id];


                    if (

                        !item ||

                        amount <=
                        0

                    ) {

                        return;

                    }


                    total +=
                        finiteNumber(
                            item.weight,
                            0
                        ) *
                        amount;

                }
            );


        return Math.round(
            total *
            10
        ) /
        10;

    }


    function canAddItem(
        id,
        amount =
            1
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (

            !player ||

            !item ||

            amount <=
            0

        ) {

            return false;

        }


        if (

            item.unique &&

            player.inventory[id] >
            0

        ) {

            return false;

        }


        const additionalWeight =
            finiteNumber(
                item.weight,
                0
            ) *
            amount;


        return (

            calculateInventoryWeight() +
            additionalWeight <=

            finiteNumber(
                player.inventoryWeightLimit,
                100
            )

        );

    }


    function addItem(
        id,
        amount =
            1,
        options =
            {}
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (

            !player ||

            !item ||

            amount <=
            0

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
            !canAddItem(
                id,
                amount
            )
        ) {

            if (
                !options.silent
            ) {

                showToast(

                    item.unique &&
                    player.inventory[id] >
                    0

                        ? "Você já possui esse item."

                        : "Inventário pesado demais."

                );

            }


            return false;

        }


        player.inventory[id] =
            (
                player.inventory[id] ||
                0
            ) +
            amount;


        if (
            id ===
            "minimapa"
        ) {

            player.minimapOwned =
                true;

        }


        if (
            id ===
            "lanterna"
        ) {

            player.lanternOwned =
                true;

        }


        return true;

    }


    function removeItem(
        id,
        amount =
            1
    ) {

        const player =
            state.player;


        if (

            !player ||

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
            (
                player.inventory[id] ||
                0
            ) <
            amount
        ) {

            return false;

        }


        player.inventory[id] -=
            amount;


        return true;

    }


    function getEquippedItemIds() {

        const equipment =
            state.player
                ?.equipment ||
            {};


        return new Set(

            Object
                .values(
                    equipment
                )
                .filter(
                    Boolean
                )

        );

    }


    function isBulkSellProtected(
        id
    ) {

        const item =
            ITEMS[id];


        if (
            !item
        ) {

            return true;

        }


        if (
            getEquippedItemIds()
                .has(
                    id
                )
        ) {

            return true;

        }


        if (

            item.bulkProtected ||

            item.questItem ||

            item.category ===
            "special" ||

            item.category ===
            "map"

        ) {

            return true;

        }


        return false;

    }


    function getPlayerDefense() {

        const player =
            state.player;


        const armor =
            ITEMS[
                player.equipment
                    ?.armor
            ];


        return (

            finiteNumber(
                player.baseDefense,
                0
            ) +

            finiteNumber(
                armor?.defense,
                0
            )

        );

    }


    function getPlayerDamageMultiplier() {

        const player =
            state.player;


        let multiplier =
            1 +
            finiteNumber(
                player.stats
                    ?.strength,
                0
            ) *
            0.02;


        if (
            hasActivePotionBuff(
                "strength"
            )
        ) {

            multiplier *=
                1.2;

        }


        if (
            player.adaptiveBuff
        ) {

            multiplier *=
                1.14;

        }


        return multiplier;

    }


    function getPlayerWeaponDamage() {

        const weapon =
            ITEMS[
                state.player
                    ?.equipment
                    ?.weapon
            ];


        return finiteNumber(
            weapon?.damage,
            0
        );

    }


    function getPlayerAttackDamage() {

        const player =
            state.player;


        const base =

            finiteNumber(
                player.baseDamage,
                20
            ) +

            getPlayerWeaponDamage();


        return Math.max(
            1,
            Math.round(
                base *
                getPlayerDamageMultiplier()
            )
        );

    }


    function equipItem(
        id
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (

            !player ||

            !item ||

            (
                player.inventory[id] ||
                0
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


            showToast(
                `${item.name} equipada.`
            );


            return true;

        }


        if (
            item.category ===
            "armor"
        ) {

            player.equipment.armor =
                id;


            showToast(
                `${item.name} equipada.`
            );


            return true;

        }


        if (
            item.category ===
            "tools"
        ) {

            player.equipment.tool =
                id;


            showToast(
                `${item.name} equipada.`
            );


            return true;

        }


        return false;

    }


    /* =========================================================
       POÇÕES E COMIDA
       ========================================================= */

    function hasActivePotionBuff(
        type
    ) {

        return Boolean(

            state.player
                ?.activePotionBuffs
                ?.some(
                    buff =>

                        buff.type ===
                        type &&

                        buff.time >
                        0
                )

        );

    }


    function useItem(
        id
    ) {

        const player =
            state.player;


        const item =
            ITEMS[id];


        if (

            !player ||

            !item ||

            (
                player.inventory[id] ||
                0
            ) <=
            0

        ) {

            return false;

        }


        if (

            item.category ===
            "weapons" ||

            item.category ===
            "armor" ||

            item.category ===
            "tools"

        ) {

            return equipItem(
                id
            );

        }


        if (
            id ===
            "flautaMemoria"
        ) {

            return playMemoryFlute();

        }


        if (
            item.category ===
            "food"
        ) {

            player.hunger =
                Math.min(

                    player.maxHunger,

                    player.hunger +
                    finiteNumber(
                        item.hunger,
                        0
                    )

                );


            removeItem(
                id,
                1
            );


            createBurst(
                player.x,
                player.y,
                "#9ac66f",
                8,
                55
            );


            return true;

        }


        if (
            item.heal
        ) {

            if (
                player.hp >=
                player.maxHp
            ) {

                showToast(
                    "Sua vida já está cheia."
                );


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
                "#6edb85",
                14,
                70
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

                showToast(
                    "Sua energia já está cheia."
                );


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
                "#71b7ff",
                12,
                70
            );


            return true;

        }


        if (
            item.buff
        ) {

            if (
                (
                    player.itemCooldowns[id] ||
                    0
                ) >
                0
            ) {

                showToast(
                    "Essa poção ainda está em recarga."
                );


                return false;

            }


            if (
                hasActivePotionBuff(
                    item.buff
                )
            ) {

                showToast(
                    "Esse efeito já está ativo."
                );


                return false;

            }


            if (

                player.activePotionBuffs
                    .filter(
                        buff =>
                            buff.time >
                            0
                    )
                    .length >=
                2

            ) {

                showToast(
                    "Você já possui 2 efeitos de poção ativos."
                );


                return false;

            }


            removeItem(
                id,
                1
            );


            player.activePotionBuffs
                .push({

                    id,

                    type:
                        item.buff,

                    time:
                        item.duration ||
                        15,

                    maxTime:
                        item.duration ||
                        15

                });


            player.itemCooldowns[id] =
                5;


            createBurst(
                player.x,
                player.y,
                "#e3b85f",
                14,
                80
            );


            return true;

        }


        return false;

    }


    function updatePotionEffects(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        Object
            .keys(
                player.itemCooldowns
            )
            .forEach(
                id => {

                    player.itemCooldowns[id] =
                        Math.max(

                            0,

                            player.itemCooldowns[id] -
                            dt

                        );

                }
            );


        player.activePotionBuffs
            .forEach(
                buff => {

                    buff.time =
                        Math.max(
                            0,
                            buff.time -
                            dt
                        );

                }
            );


        player.activePotionBuffs =
            player.activePotionBuffs
                .filter(
                    buff =>
                        buff.time >
                        0
                );

    }


    /* =========================================================
       PARTÍCULAS / EFEITOS
       ========================================================= */

    function createParticle(
        data
    ) {

        ensureWorldRuntimeArrays();


        state.world
            .particles
            .push({

                x:
                    data.x,

                y:
                    data.y,

                vx:
                    data.vx ??
                    random(
                        -45,
                        45
                    ),

                vy:
                    data.vy ??
                    random(
                        -45,
                        45
                    ),

                size:
                    data.size ??
                    random(
                        2,
                        5
                    ),

                color:
                    data.color ||
                    "#ffffff",

                alpha:
                    data.alpha ??
                    1,

                life:
                    data.life ??
                    0.55,

                maxLife:
                    data.life ??
                    0.55,

                gravity:
                    data.gravity ??
                    0,

                drag:
                    data.drag ??
                    0.96,

                shape:
                    data.shape ||
                    "circle",

                rotation:
                    data.rotation ??
                    0,

                spin:
                    data.spin ??
                    random(
                        -5,
                        5
                    )

            });

    }


    function createBurst(
        x,
        y,
        color,
        count =
            10,
        speed =
            80,
        options =
            {}
    ) {

        for (
            let i = 0;
            i <
            count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;


            const velocity =
                random(

                    speed *
                    0.35,

                    speed

                );


            createParticle({

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

                size:
                    random(

                        options.minSize ||
                        2.5,

                        options.maxSize ||
                        6

                    ),

                color,

                life:
                    random(

                        options.minLife ||
                        0.28,

                        options.maxLife ||
                        0.72

                    ),

                gravity:
                    options.gravity ||
                    0,

                shape:
                    options.shape ||
                    "circle"

            });

        }

    }


    function createEffect(
        data
    ) {

        state.world
            .effects
            .push({

                id:
                    data.id ||
                    uid(
                        "fx"
                    ),

                type:
                    data.type ||
                    "ring",

                x:
                    data.x,

                y:
                    data.y,

                color:
                    data.color ||
                    "#ffffff",

                life:
                    data.life ??
                    0.5,

                maxLife:
                    data.maxLife ??
                    data.life ??
                    0.5,

                radius:
                    data.radius ??
                    20,

                maxRadius:
                    data.maxRadius ??
                    80,

                angle:
                    data.angle ??
                    0,

                width:
                    data.width ??
                    4,

                data:
                    data.data ||
                    null

            });

    }


    function createDamageNumber(
        x,
        y,
        amount,
        options =
            {}
    ) {

        ensureWorldRuntimeArrays();


        const magnitude =
            Math.abs(
                amount
            );


        let color =
            "#ffffff";


        if (
            magnitude >=
            70
        ) {

            color =
                "#c784ff";

        }

        else if (
            magnitude >=
            50
        ) {

            color =
                "#ff7272";

        }

        else if (
            magnitude >=
            32
        ) {

            color =
                "#ff9a4f";

        }

        else if (
            magnitude >=
            18
        ) {

            color =
                "#ffd76a";

        }


        if (
            options.heal
        ) {

            color =
                "#7ef4a3";

        }


        state.world
            .damageNumbers
            .push({

                x,

                y,

                text:
                    options.heal

                        ? `+${Math.round(magnitude)}`

                        : `-${Math.round(magnitude)}`,

                color,

                life:
                    0.9,

                maxLife:
                    0.9,

                vy:
                    -42,

                scale:
                    options.critical

                        ? 1.28

                        : 1

            });

    }


    function updateParticlesAndEffects(
        dt
    ) {

        ensureWorldRuntimeArrays();


        state.world.particles
            .forEach(
                particle => {

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
                            particle.drag,
                            dt *
                            60
                        );


                    particle.vy *=
                        Math.pow(
                            particle.drag,
                            dt *
                            60
                        );


                    particle.rotation +=
                        particle.spin *
                        dt;

                }
            );


        state.world.particles =
            state.world.particles
                .filter(
                    particle =>
                        particle.life >
                        0
                );


        state.world.effects
            .forEach(
                effect => {

                    effect.life -=
                        dt;

                }
            );


        state.world.effects =
            state.world.effects
                .filter(
                    effect =>
                        effect.life >
                        0
                );


        state.world.damageNumbers
            .forEach(
                number => {

                    number.life -=
                        dt;


                    number.y +=
                        number.vy *
                        dt;


                    number.vy *=
                        0.96;

                }
            );


        state.world.damageNumbers =
            state.world.damageNumbers
                .filter(
                    number =>
                        number.life >
                        0
                );

    }


    /* =========================================================
       SANGUE / TELA VERMELHA
       ========================================================= */

    function triggerDamageScreenEffect(
        damage
    ) {

        const amount =
            Math.max(
                1,
                finiteNumber(
                    damage,
                    1
                )
            );


        state.damageFlash =
            Math.min(

                VISUAL_CONFIG
                    .blood
                    .flashMax,

                state.damageFlash +
                0.18 +
                Math.min(
                    0.32,
                    amount /
                    120
                )

            );


        const count =
            clamp(

                Math.round(
                    2 +
                    amount /
                    18
                ),

                2,
                5

            );


        for (
            let i = 0;
            i <
            count;
            i++
        ) {

            const edge =
                randomInt(
                    0,
                    3
                );


            let x =
                Math.random();


            let y =
                Math.random();


            if (
                edge ===
                0
            ) {

                y =
                    random(
                        0.01,
                        0.18
                    );

            }

            else if (
                edge ===
                1
            ) {

                x =
                    random(
                        0.82,
                        0.99
                    );

            }

            else if (
                edge ===
                2
            ) {

                y =
                    random(
                        0.82,
                        0.99
                    );

            }

            else {

                x =
                    random(
                        0.01,
                        0.18
                    );

            }


            state.bloodMarks
                .push({

                    x,

                    y,

                    radius:
                        random(
                            0.025,
                            0.065
                        ),

                    stretch:
                        random(
                            0.55,
                            1.7
                        ),

                    rotation:
                        random(
                            0,
                            Math.PI *
                            2
                        ),

                    alpha:
                        random(
                            0.30,
                            0.62
                        ),

                    life:
                        VISUAL_CONFIG
                            .blood
                            .markLife *
                        random(
                            0.7,
                            1.25
                        ),

                    maxLife:
                        VISUAL_CONFIG
                            .blood
                            .markLife

                });

        }


        if (

            state.bloodMarks.length >

            VISUAL_CONFIG
                .blood
                .maxMarks

        ) {

            state.bloodMarks.splice(

                0,

                state.bloodMarks.length -
                VISUAL_CONFIG
                    .blood
                    .maxMarks

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
                0.82

            );


        state.bloodMarks
            .forEach(
                mark => {

                    mark.life -=
                        dt;

                }
            );


        state.bloodMarks =
            state.bloodMarks
                .filter(
                    mark =>
                        mark.life >
                        0
                );

    }


    function addScreenShake(
        power,
        duration =
            0.2
    ) {

        state.screenShake =
            Math.max(
                state.screenShake,
                duration
            );


        state.screenShakePower =
            Math.max(
                state.screenShakePower,
                power
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
       DANO RECEBIDO
       ========================================================= */

    function damagePlayer(
        amount,
        options =
            {}
    ) {

        const player =
            state.player;


        if (

            !player ||

            player.dead ||

            amount <=
            0

        ) {

            return 0;

        }


        if (

            player.invincible >
            0 &&

            !options.ignoreInvincible

        ) {

            return 0;

        }


        let reduction =
            player.damageReduction ||
            0;


        if (
            hasActivePotionBuff(
                "resistance"
            )
        ) {

            reduction +=
                0.20;

        }


        if (
            player.shieldTimer >
            0
        ) {

            reduction +=
                0.34;

        }


        reduction =
            clamp(
                reduction,
                0,
                0.75
            );


        const defense =
            getPlayerDefense();


        let finalDamage =
            amount *
            (
                1 -
                reduction
            );


        finalDamage *=
            100 /
            (
                100 +
                defense *
                1.45
            );


        finalDamage =
            Math.max(
                1,
                Math.round(
                    finalDamage
                )
            );


        player.hp =
            Math.max(
                0,
                player.hp -
                finalDamage
            );


        player.hurtAnim =
            0.24;


        triggerDamageScreenEffect(
            finalDamage
        );


        addScreenShake(

            options.small

                ? 2.5

                : Math.min(
                    8,
                    3 +
                    finalDamage /
                    9
                ),

            options.small

                ? 0.12

                : 0.22

        );


        createDamageNumber(
            player.x,
            player.y -
            24,
            finalDamage
        );


        createBurst(
            player.x,
            player.y,
            "#d34d4d",

            options.small
                ? 3
                : 8,

            70
        );


        if (
            player.hp <=
            0
        ) {

            handlePlayerDeath();

        }


        return finalDamage;

    }


    /* =========================================================
       DIREÇÃO / MIRA
       ========================================================= */

    function facingVector(
        facing
    ) {

        switch (
            facing
        ) {

            case "up":

                return {
                    x:
                        0,
                    y:
                        -1,
                    length:
                        1
                };


            case "down":

                return {
                    x:
                        0,
                    y:
                        1,
                    length:
                        1
                };


            case "left":

                return {
                    x:
                        -1,
                    y:
                        0,
                    length:
                        1
                };


            default:

                return {
                    x:
                        1,
                    y:
                        0,
                    length:
                        1
                };

        }

    }


    function getAimVector() {

        const player =
            state.player;


        const targetX =
            Number.isFinite(
                state.pointer.worldX
            )

                ? state.pointer.worldX

                : player.x +
                1;


        const targetY =
            Number.isFinite(
                state.pointer.worldY
            )

                ? state.pointer.worldY

                : player.y;


        const aim =
            normalize(

                targetX -
                player.x,

                targetY -
                player.y

            );


        if (
            aim.length <
            6
        ) {

            return facingVector(
                player.facing
            );

        }


        return aim;

    }


    /* =========================================================
       ATAQUE BÁSICO

       IMPORTANTE:
       A Parte 3 chama isso somente no pointerdown.
       Não existe ataque automático segurando mouse.
       ========================================================= */

    function enemyIsInAttackArc(
        enemy,
        range,
        aim,
        arcDot =
            0.05
    ) {

        if (
            enemy.dead
        ) {

            return false;

        }


        const dx =
            enemy.x -
            state.player.x;


        const dy =
            enemy.y -
            state.player.y;


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


        if (
            d <
            0.001
        ) {

            return true;

        }


        const dot =

            dx /
            d *
            aim.x +

            dy /
            d *
            aim.y;


        return dot >=
            arcDot;

    }


    function performAttack() {

        const player =
            state.player;


        if (

            !player ||

            player.dead ||

            state.paused ||

            state.transition ||

            state.houseMode ||

            player.attackCooldown >
            0 ||

            player.stunTimer >
            0

        ) {

            return false;

        }


        player.attackCooldown =
            0.24;


        player.attackAnim =
            0.26;


        const aim =
            getAimVector();


        const range =
            78;


        let target =
            null;


        let closest =
            Infinity;


        state.world.enemies
            .forEach(
                enemy => {

                    if (
                        !enemyIsInAttackArc(
                            enemy,
                            range,
                            aim
                        )
                    ) {

                        return;

                    }


                    const d =
                        distance(
                            player.x,
                            player.y,
                            enemy.x,
                            enemy.y
                        );


                    if (
                        d <
                        closest
                    ) {

                        target =
                            enemy;


                        closest =
                            d;

                    }

                }
            );


        createEffect({

            type:
                "basicSlash",

            x:
                player.x,

            y:
                player.y,

            color:
                currentCharacter()
                    .color,

            life:
                0.24,

            maxLife:
                0.24,

            radius:
                36,

            maxRadius:
                78,

            angle:
                Math.atan2(
                    aim.y,
                    aim.x
                )

        });


        createBurst(

            player.x +
            aim.x *
            44,

            player.y +
            aim.y *
            44,

            currentCharacter()
                .color,

            6,

            62

        );


        if (
            !target
        ) {

            return true;

        }


        if (

            target.type ===
            "progression" &&

            !target.accepted

        ) {

            openBattle(
                target
            );


            return true;

        }


        attackEnemy(

            target,

            getPlayerAttackDamage(),

            {
                source:
                    "basic"
            }

        );


        return true;

    }


    /* =========================================================
       CONFIGURAÇÃO DAS HABILIDADES
       ========================================================= */

    function currentCharacter() {

        return CHARACTERS
            .find(
                character =>

                    character.id ===
                    state.player
                        ?.characterId
            ) ||

            state.selectedCharacter ||

            CHARACTERS[0];

    }


    function getSkillConfig(
        slot
    ) {

        const character =
            currentCharacter();


        return CLASS_SKILLS[
            character.id
        ]?.[
            slot
        ] ||
        null;

    }


    function canUseSkill(
        slot,
        skill
    ) {

        const player =
            state.player;


        if (

            !player ||

            !skill ||

            player.dead ||

            state.paused ||

            state.transition ||

            state.houseMode ||

            player.stunTimer >
            0

        ) {

            return false;

        }


        if (
            player.level <
            skill.level
        ) {

            showToast(
                `${skill.name} libera no nível ${skill.level}.`
            );


            return false;

        }


        if (
            player.skillCooldowns[slot] >
            0
        ) {

            return false;

        }


        const resource =
            skill.costType ===
            "energy"

                ? "energy"

                : "magic";


        if (
            player[resource] <
            skill.cost
        ) {

            showToast(

                resource ===
                "energy"

                    ? "Energia insuficiente."

                    : "Magia insuficiente."

            );


            return false;

        }


        return true;

    }


    function spendSkillCost(
        slot,
        skill
    ) {

        const player =
            state.player;


        const resource =
            skill.costType ===
            "energy"

                ? "energy"

                : "magic";


        player[resource] =
            Math.max(

                0,

                player[resource] -
                skill.cost

            );


        player.skillCooldowns[slot] =
            skill.cooldown;

    }


    function useSkill(
        slot
    ) {

        const skill =
            getSkillConfig(
                slot
            );


        if (
            !canUseSkill(
                slot,
                skill
            )
        ) {

            return false;

        }


        spendSkillCost(
            slot,
            skill
        );


        const character =
            currentCharacter()
                .id;


        if (
            character ===
            "kaelion"
        ) {

            useKaelionSkill(
                slot,
                skill
            );

        }

        else if (
            character ===
            "theron"
        ) {

            useTheronSkill(
                slot,
                skill
            );

        }

        else if (
            character ===
            "grumgar"
        ) {

            useGrumgarSkill(
                slot,
                skill
            );

        }

        else if (
            character ===
            "lirael"
        ) {

            useLiraelSkill(
                slot,
                skill
            );

        }

        else {

            useZephyrSkill(
                slot,
                skill
            );

        }


        return true;

    }


    /* =========================================================
       PROJÉTEIS
       ========================================================= */

    function spawnPlayerProjectile(
        data
    ) {

        ensureWorldRuntimeArrays();


        state.world.projectiles
            .push({

                id:
                    uid(
                        "player_projectile"
                    ),

                owner:
                    "player",

                type:
                    data.type ||
                    "magic",

                x:
                    data.x,

                y:
                    data.y,

                dirX:
                    data.dirX,

                dirY:
                    data.dirY,

                speed:
                    data.speed ||
                    320,

                radius:
                    data.radius ||
                    8,

                damage:
                    data.damage ||
                    10,

                life:
                    data.life ||
                    1,

                color:
                    data.color ||
                    "#ffffff",

                pierce:
                    data.pierce ||
                    0,

                hit:
                    new Set()

            });

    }


    function spawnEnemyProjectile(
        enemy,
        data =
            {}
    ) {

        ensureWorldRuntimeArrays();


        const player =
            state.player;


        const direction =
            data.direction ||

            normalize(

                player.x -
                enemy.x,

                player.y -
                enemy.y

            );


        state.world.projectiles
            .push({

                id:
                    uid(
                        "enemy_projectile"
                    ),

                owner:
                    "enemy",

                enemyId:
                    enemy.id,

                type:
                    data.type ||
                    "enemyBolt",

                x:
                    data.x ??
                    enemy.x,

                y:
                    data.y ??
                    enemy.y,

                dirX:
                    direction.x,

                dirY:
                    direction.y,

                speed:
                    data.speed ||
                    230,

                radius:
                    data.radius ||
                    8,

                damage:
                    data.damage ||
                    enemy.damage,

                life:
                    data.life ||
                    2.4,

                color:
                    data.color ||
                    enemy.color,

                pierce:
                    0,

                hit:
                    new Set()

            });

    }


    function projectileHitsObstacle(
        projectile
    ) {

        return state.world.obstacles
            .some(
                obstacle =>

                    obstacle.solid !==
                    false &&

                    circleRectCollision(

                        projectile.x,
                        projectile.y,
                        projectile.radius,

                        obstacle

                    )
            );

    }


    function updateProjectiles(
        dt
    ) {

        ensureWorldRuntimeArrays();


        const player =
            state.player;


        state.world.projectiles
            .forEach(
                projectile => {

                    if (
                        projectile.life <=
                        0
                    ) {

                        return;

                    }


                    projectile.life -=
                        dt;


                    projectile.x +=
                        projectile.dirX *
                        projectile.speed *
                        dt;


                    projectile.y +=
                        projectile.dirY *
                        projectile.speed *
                        dt;


                    if (
                        Math.random() <
                        0.68
                    ) {

                        createParticle({

                            x:
                                projectile.x,

                            y:
                                projectile.y,

                            vx:
                                -projectile.dirX *
                                random(
                                    20,
                                    65
                                ),

                            vy:
                                -projectile.dirY *
                                random(
                                    20,
                                    65
                                ),

                            size:
                                random(
                                    2,
                                    5
                                ),

                            color:
                                projectile.color,

                            life:
                                0.24

                        });

                    }


                    if (
                        projectileHitsObstacle(
                            projectile
                        )
                    ) {

                        projectile.life =
                            0;


                        createBurst(
                            projectile.x,
                            projectile.y,
                            projectile.color,
                            5,
                            55
                        );


                        return;

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

                                projectile.hit.has(
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


                            projectile.hit.add(
                                enemy.id
                            );


                            if (

                                enemy.type ===
                                "progression" &&

                                !enemy.accepted

                            ) {

                                openBattle(
                                    enemy
                                );


                                projectile.life =
                                    0;


                                break;

                            }


                            attackEnemy(

                                enemy,

                                projectile.damage,

                                {
                                    source:
                                        projectile.type
                                }

                            );


                            createBurst(
                                projectile.x,
                                projectile.y,
                                projectile.color,
                                8,
                                80
                            );


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

                    else if (

                        player &&

                        !player.dead &&

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
                                    projectile.type
                            }

                        );


                        projectile.life =
                            0;


                        createBurst(
                            projectile.x,
                            projectile.y,
                            projectile.color,
                            7,
                            70
                        );

                    }

                }
            );


        state.world.projectiles =
            state.world.projectiles
                .filter(
                    projectile =>
                        projectile.life >
                        0
                );

    }


    /* =========================================================
       ÁREA / CONE
       ========================================================= */

    function createAreaDamage(
        x,
        y,
        radius,
        damage,
        options =
            {}
    ) {

        state.world.enemies
            .forEach(
                enemy => {

                    if (

                        enemy.dead ||

                        distance(
                            x,
                            y,
                            enemy.x,
                            enemy.y
                        ) >
                        radius +
                        enemy.radius

                    ) {

                        return;

                    }


                    if (

                        enemy.type ===
                        "progression" &&

                        !enemy.accepted

                    ) {

                        return;

                    }


                    attackEnemy(

                        enemy,

                        damage,

                        {
                            source:
                                options.type ||
                                "area",

                            noHitFx:
                                options.noHitFx
                        }

                    );


                    if (
                        options.stagger
                    ) {

                        enemy.stunTimer =
                            Math.max(
                                enemy.stunTimer,
                                options.stagger
                            );

                    }

                }
            );

    }


    function createConeDamage(
        x,
        y,
        aim,
        range,
        minDot,
        damage,
        options =
            {}
    ) {

        state.world.enemies
            .forEach(
                enemy => {

                    if (
                        enemy.dead
                    ) {

                        return;

                    }


                    if (

                        enemy.type ===
                        "progression" &&

                        !enemy.accepted

                    ) {

                        return;

                    }


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
                        enemy.radius ||

                        d <=
                        0.001

                    ) {

                        return;

                    }


                    const dot =

                        dx /
                        d *
                        aim.x +

                        dy /
                        d *
                        aim.y;


                    if (
                        dot <
                        minDot
                    ) {

                        return;

                    }


                    attackEnemy(
                        enemy,
                        damage,
                        {
                            source:
                                "cone"
                        }
                    );


                    if (
                        options.stagger
                    ) {

                        enemy.stunTimer =
                            Math.max(
                                enemy.stunTimer,
                                options.stagger
                            );

                    }

                }
            );

    }


    /* =========================================================
       HABILIDADES — KAELION
       ========================================================= */

    function useKaelionSkill(
        slot,
        skill
    ) {

        const player =
            state.player;


        const aim =
            getAimVector();


        if (
            slot ===
            "q"
        ) {

            spawnPlayerProjectile({

                type:
                    "memoryOrb",

                x:
                    player.x +
                    aim.x *
                    26,

                y:
                    player.y +
                    aim.y *
                    26,

                dirX:
                    aim.x,

                dirY:
                    aim.y,

                speed:
                    390,

                radius:
                    11,

                damage:
                    Math.round(

                        skill.damage *
                        getPlayerDamageMultiplier()

                    ),

                life:
                    skill.range /
                    390,

                color:
                    "#f0a75e",

                pierce:
                    0

            });


            createEffect({

                type:
                    "memoryCast",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#ffbe69",

                life:
                    0.42,

                maxLife:
                    0.42,

                radius:
                    18,

                maxRadius:
                    65

            });


            createBurst(
                player.x,
                player.y,
                "#f4a85d",
                18,
                95
            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            createAreaDamage(

                player.x,
                player.y,

                skill.range,

                Math.round(

                    skill.damage *
                    getPlayerDamageMultiplier()

                ),

                {
                    type:
                        "arcaneNova",

                    stagger:
                        0.32
                }

            );


            for (
                let i = 0;
                i <
                3;
                i++
            ) {

                createEffect({

                    type:
                        "arcaneRing",

                    x:
                        player.x,

                    y:
                        player.y,

                    color:
                        i %
                        2

                            ? "#ffd5a0"

                            : "#e58d44",

                    life:
                        0.6 +
                        i *
                        0.08,

                    maxLife:
                        0.6 +
                        i *
                        0.08,

                    radius:
                        18 +
                        i *
                        10,

                    maxRadius:
                        skill.range *
                        (
                            0.75 +
                            i *
                            0.12
                        )

                });

            }


            addScreenShake(
                4,
                0.2
            );


            return;

        }


        for (
            let i = 0;
            i <
            8;
            i++
        ) {

            const angle =
                Math.PI *
                2 *
                i /
                8;


            const radius =
                random(
                    50,
                    skill.range
                );


            createTimedHazard({

                type:
                    "memoryStrike",

                x:
                    player.x +
                    Math.cos(
                        angle
                    ) *
                    radius,

                y:
                    player.y +
                    Math.sin(
                        angle
                    ) *
                    radius,

                radius:
                    54,

                delay:
                    0.25 +
                    i *
                    0.06,

                damage:
                    Math.round(

                        skill.damage *
                        0.62 *
                        getPlayerDamageMultiplier()

                    ),

                owner:
                    "player",

                color:
                    "#e8a15f"

            });

        }


        createEffect({

            type:
                "memoryStormCore",

            x:
                player.x,

            y:
                player.y,

            color:
                "#ffad5c",

            life:
                1.1,

            maxLife:
                1.1,

            radius:
                20,

            maxRadius:
                skill.range

        });

    }


    /* =========================================================
       HABILIDADES — THERON
       ========================================================= */

    function useTheronSkill(
        slot,
        skill
    ) {

        const player =
            state.player;


        const aim =
            getAimVector();


        if (
            slot ===
            "q"
        ) {

            createConeDamage(

                player.x,
                player.y,

                aim,

                skill.range,

                0.32,

                Math.round(

                    skill.damage *
                    getPlayerDamageMultiplier()

                ),

                {
                    stagger:
                        0.4
                }

            );


            createEffect({

                type:
                    "heavySlash",

                x:
                    player.x,

                y:
                    player.y,

                angle:
                    Math.atan2(
                        aim.y,
                        aim.x
                    ),

                color:
                    "#dce4ed",

                life:
                    0.38,

                maxLife:
                    0.38,

                radius:
                    34,

                maxRadius:
                    105

            });


            addScreenShake(
                4.5,
                0.18
            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            player.shieldTimer =
                Math.max(
                    player.shieldTimer,
                    4.2
                );


            createEffect({

                type:
                    "guardianShield",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#d6e0e8",

                life:
                    4.2,

                maxLife:
                    4.2,

                radius:
                    28,

                maxRadius:
                    40

            });


            createBurst(
                player.x,
                player.y,
                "#e6eef5",
                15,
                70
            );


            return;

        }


        createConeDamage(

            player.x,
            player.y,

            aim,

            skill.range,

            -0.10,

            Math.round(

                skill.damage *
                getPlayerDamageMultiplier()

            ),

            {
                stagger:
                    0.7
            }

        );


        createEffect({

            type:
                "steelOath",

            x:
                player.x,

            y:
                player.y,

            angle:
                Math.atan2(
                    aim.y,
                    aim.x
                ),

            color:
                "#ffffff",

            life:
                0.65,

            maxLife:
                0.65,

            radius:
                40,

            maxRadius:
                145

        });


        createBurst(

            player.x +
            aim.x *
            75,

            player.y +
            aim.y *
            75,

            "#d9e0e6",

            22,

            130,

            {
                shape:
                    "spark"
            }

        );


        addScreenShake(
            7,
            0.3
        );

    }


    /* =========================================================
       HABILIDADES — GRUMGAR
       ========================================================= */

    function useGrumgarSkill(
        slot,
        skill
    ) {

        const player =
            state.player;


        if (
            slot ===
            "q"
        ) {

            createAreaDamage(

                player.x,
                player.y,

                skill.range,

                Math.round(

                    skill.damage *
                    getPlayerDamageMultiplier()

                ),

                {
                    type:
                        "smash",

                    stagger:
                        0.65
                }

            );


            createEffect({

                type:
                    "groundCrack",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#6f5b3d",

                life:
                    0.65,

                maxLife:
                    0.65,

                radius:
                    32,

                maxRadius:
                    skill.range

            });


            createBurst(

                player.x,
                player.y,

                "#86724d",

                23,

                120,

                {
                    gravity:
                        160,

                    shape:
                        "rock"
                }

            );


            addScreenShake(
                8,
                0.32
            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            state.world.enemies
                .forEach(
                    enemy => {

                        if (

                            enemy.dead ||

                            distance(
                                player.x,
                                player.y,
                                enemy.x,
                                enemy.y
                            ) >
                            skill.range +
                            enemy.radius

                        ) {

                            return;

                        }


                        if (

                            enemy.type ===
                            "progression" &&

                            !enemy.accepted

                        ) {

                            return;

                        }


                        attackEnemy(

                            enemy,

                            Math.round(

                                skill.damage *
                                getPlayerDamageMultiplier()

                            ),

                            {
                                source:
                                    "roar"
                            }

                        );


                        enemy.stunTimer =
                            Math.max(
                                enemy.stunTimer,
                                1.1
                            );

                    }
                );


            createEffect({

                type:
                    "roarWave",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#a8c17d",

                life:
                    0.72,

                maxLife:
                    0.72,

                radius:
                    22,

                maxRadius:
                    skill.range

            });


            return;

        }


        for (
            let i = 0;
            i <
            3;
            i++
        ) {

            createTimedHazard({

                type:
                    "earthRing",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    70 +
                    i *
                    65,

                ringWidth:
                    58,

                ring:
                    true,

                delay:
                    0.18 +
                    i *
                    0.18,

                damage:
                    Math.round(

                        skill.damage *
                        0.55 *
                        getPlayerDamageMultiplier()

                    ),

                owner:
                    "player",

                color:
                    "#8a7551"

            });

        }


        createBurst(

            player.x,
            player.y,

            "#796446",

            30,

            155,

            {
                gravity:
                    180,

                shape:
                    "rock"
            }

        );


        addScreenShake(
            10,
            0.48
        );

    }


    /* =========================================================
       HABILIDADES — LIRAEL
       ========================================================= */

    function useLiraelSkill(
        slot,
        skill
    ) {

        const player =
            state.player;


        const aim =
            getAimVector();


        if (
            slot ===
            "q"
        ) {

            const heal =
                Math.round(

                    34 +

                    player.maxHp *
                    0.09

                );


            const before =
                player.hp;


            player.hp =
                Math.min(
                    player.maxHp,
                    player.hp +
                    heal
                );


            const actual =
                player.hp -
                before;


            if (
                actual >
                0
            ) {

                createDamageNumber(

                    player.x,

                    player.y -
                    28,

                    actual,

                    {
                        heal:
                            true
                    }

                );

            }


            createEffect({

                type:
                    "fairyHeal",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#ffb7ec",

                life:
                    0.9,

                maxLife:
                    0.9,

                radius:
                    18,

                maxRadius:
                    95

            });


            createBurst(

                player.x,
                player.y,

                "#ffd0f4",

                24,

                85,

                {
                    shape:
                        "star"
                }

            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            spawnPlayerProjectile({

                type:
                    "fairyArrow",

                x:
                    player.x +
                    aim.x *
                    24,

                y:
                    player.y +
                    aim.y *
                    24,

                dirX:
                    aim.x,

                dirY:
                    aim.y,

                speed:
                    480,

                radius:
                    8,

                damage:
                    Math.round(

                        skill.damage *
                        getPlayerDamageMultiplier()

                    ),

                life:
                    skill.range /
                    480,

                color:
                    "#ff9be1",

                pierce:
                    1

            });


            createBurst(
                player.x,
                player.y,
                "#ffb7ed",
                12,
                95
            );


            return;

        }


        const centerX =
            player.x +
            aim.x *
            125;


        const centerY =
            player.y +
            aim.y *
            125;


        for (
            let i = 0;
            i <
            10;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI *
                    2
                );


            const radius =
                random(
                    20,
                    skill.range
                );


            createTimedHazard({

                type:
                    "starStrike",

                x:
                    centerX +
                    Math.cos(
                        angle
                    ) *
                    radius,

                y:
                    centerY +
                    Math.sin(
                        angle
                    ) *
                    radius,

                radius:
                    46,

                delay:
                    0.18 +
                    i *
                    0.07,

                damage:
                    Math.round(

                        skill.damage *
                        0.58 *
                        getPlayerDamageMultiplier()

                    ),

                owner:
                    "player",

                color:
                    "#ffb6eb"

            });

        }


        createEffect({

            type:
                "starField",

            x:
                centerX,

            y:
                centerY,

            color:
                "#e99bd8",

            life:
                1.1,

            maxLife:
                1.1,

            radius:
                30,

            maxRadius:
                skill.range

        });

    }


    /* =========================================================
       HABILIDADES — ZEPHYR
       ========================================================= */

    function useZephyrSkill(
        slot,
        skill
    ) {

        const player =
            state.player;


        const aim =
            getAimVector();


        if (
            slot ===
            "q"
        ) {

            player.adaptiveBuff =
                true;


            player.adaptiveTimer =
                6.5;


            createEffect({

                type:
                    "adaptiveAura",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#9e7be7",

                life:
                    6.5,

                maxLife:
                    6.5,

                radius:
                    26,

                maxRadius:
                    44

            });


            createBurst(
                player.x,
                player.y,
                "#b48cff",
                20,
                90
            );


            return;

        }


        if (
            slot ===
            "r"
        ) {

            startZephyrCombatDash(
                aim,
                skill
            );


            return;

        }


        player.adaptiveBuff =
            true;


        player.adaptiveTimer =
            Math.max(
                player.adaptiveTimer,
                8.5
            );


        createAreaDamage(

            player.x,
            player.y,

            skill.range,

            Math.round(

                skill.damage *
                getPlayerDamageMultiplier()

            ),

            {
                type:
                    "perfectForm",

                stagger:
                    0.45
            }

        );


        for (
            let i = 0;
            i <
            4;
            i++
        ) {

            createEffect({

                type:
                    "shapeRing",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    i %
                    2

                        ? "#d2b7ff"

                        : "#8b5ddd",

                life:
                    0.65 +
                    i *
                    0.09,

                maxLife:
                    0.65 +
                    i *
                    0.09,

                radius:
                    18 +
                    i *
                    10,

                maxRadius:
                    skill.range

            });

        }

    }


    function startZephyrCombatDash(
        aim,
        skill
    ) {

        const player =
            state.player;


        player.invincible =
            Math.max(
                player.invincible,
                0.18
            );


        player.zephyrDash = {

            dirX:
                aim.x,

            dirY:
                aim.y,

            remaining:
                skill.range,

            damage:
                Math.round(

                    skill.damage *
                    getPlayerDamageMultiplier()

                ),

            hit:
                new Set()

        };


        createEffect({

            type:
                "zephyrDash",

            x:
                player.x,

            y:
                player.y,

            color:
                "#a67af0",

            life:
                0.42,

            maxLife:
                0.42,

            radius:
                18,

            maxRadius:
                70

        });

    }


    function updateZephyrDash(
        dt
    ) {

        const player =
            state.player;


        const dash =
            player?.zephyrDash;


        if (
            !dash
        ) {

            return;

        }


        const step =
            Math.min(

                dash.remaining,

                700 *
                dt

            );


        const moved =
            moveCircleWithCollision(

                player,

                dash.dirX,
                dash.dirY,

                step

            );


        dash.remaining -=
            step;


        state.world.enemies
            .forEach(
                enemy => {

                    if (

                        enemy.dead ||

                        dash.hit.has(
                            enemy.id
                        )

                    ) {

                        return;

                    }


                    if (
                        circleCircleCollision(

                            player.x,
                            player.y,
                            player.radius +
                            12,

                            enemy.x,
                            enemy.y,
                            enemy.radius

                        )
                    ) {

                        dash.hit.add(
                            enemy.id
                        );


                        attackEnemy(
                            enemy,
                            dash.damage,
                            {
                                source:
                                    "zephyrDash"
                            }
                        );

                    }

                }
            );


        createParticle({

            x:
                player.x,

            y:
                player.y,

            vx:
                -dash.dirX *
                80 +
                random(
                    -25,
                    25
                ),

            vy:
                -dash.dirY *
                80 +
                random(
                    -25,
                    25
                ),

            size:
                random(
                    4,
                    8
                ),

            color:
                "#9e74ef",

            life:
                0.28

        });


        if (

            !moved ||

            dash.remaining <=
            0

        ) {

            player.zephyrDash =
                null;

        }

    }


    /* =========================================================
       COOLDOWNS
       ========================================================= */

    function updatePlayerCooldowns(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

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


        player.shieldTimer =
            Math.max(
                0,
                player.shieldTimer -
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


        if (
            player.adaptiveBuff
        ) {

            player.adaptiveTimer =
                Math.max(
                    0,
                    player.adaptiveTimer -
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


        [
            "q",
            "r",
            "f"
        ]
            .forEach(
                slot => {

                    player.skillCooldowns[slot] =
                        Math.max(

                            0,

                            player.skillCooldowns[slot] -
                            dt

                        );

                }
            );


        updateZephyrDash(
            dt
        );

    }


    /* =========================================================
       HAZARDS
       ========================================================= */

    function createTimedHazard(
        data
    ) {

        state.world.hazards
            .push({

                id:
                    uid(
                        "hazard"
                    ),

                type:
                    data.type ||
                    "circle",

                x:
                    data.x,

                y:
                    data.y,

                radius:
                    data.radius ||
                    50,

                ringWidth:
                    data.ringWidth ||
                    0,

                ring:
                    Boolean(
                        data.ring
                    ),

                delay:
                    data.delay ??
                    0.7,

                maxDelay:
                    data.delay ??
                    0.7,

                activeTime:
                    data.activeTime ??
                    0.18,

                damage:
                    data.damage ||
                    10,

                owner:
                    data.owner ||
                    "enemy",

                color:
                    data.color ||
                    "#d86464",

                triggered:
                    false,

                hit:
                    new Set(),

                life:
                    (
                        data.delay ??
                        0.7
                    ) +
                    (
                        data.activeTime ??
                        0.18
                    )

            });

    }


    function targetInsideHazard(
        target,
        hazard
    ) {

        const d =
            distance(

                target.x,
                target.y,

                hazard.x,
                hazard.y

            );


        if (
            hazard.ring
        ) {

            return (

                Math.abs(

                    d -
                    hazard.radius

                ) <=

                hazard.ringWidth /
                2 +

                target.radius

            );

        }


        return d <=
            hazard.radius +
            target.radius;

    }


    function triggerHazard(
        hazard
    ) {

        hazard.triggered =
            true;


        createEffect({

            type:
                hazard.type,

            x:
                hazard.x,

            y:
                hazard.y,

            color:
                hazard.color,

            life:
                0.38,

            maxLife:
                0.38,

            radius:
                hazard.ring
                    ? Math.max(
                        10,
                        hazard.radius -
                        hazard.ringWidth /
                        2
                    )
                    : 12,

            maxRadius:
                hazard.radius +
                hazard.ringWidth

        });


        if (
            hazard.owner ===
            "enemy"
        ) {

            const player =
                state.player;


            if (

                player &&

                !player.dead &&

                targetInsideHazard(
                    player,
                    hazard
                )

            ) {

                damagePlayer(

                    hazard.damage,

                    {
                        source:
                            hazard.type
                    }

                );

            }

        }

        else {

            state.world.enemies
                .forEach(
                    enemy => {

                        if (

                            enemy.dead ||

                            hazard.hit.has(
                                enemy.id
                            ) ||

                            !targetInsideHazard(
                                enemy,
                                hazard
                            )

                        ) {

                            return;

                        }


                        if (

                            enemy.type ===
                            "progression" &&

                            !enemy.accepted

                        ) {

                            return;

                        }


                        hazard.hit.add(
                            enemy.id
                        );


                        attackEnemy(

                            enemy,

                            hazard.damage,

                            {
                                source:
                                    hazard.type
                            }

                        );

                    }
                );

        }


        createBurst(
            hazard.x,
            hazard.y,
            hazard.color,
            12,
            110
        );


        if (
            hazard.damage >=
            25
        ) {

            addScreenShake(
                4.5,
                0.2
            );

        }

    }


    function updateHazards(
        dt
    ) {

        state.world.hazards
            .forEach(
                hazard => {

                    hazard.life -=
                        dt;


                    if (
                        !hazard.triggered
                    ) {

                        hazard.delay -=
                            dt;


                        if (
                            hazard.delay <=
                            0
                        ) {

                            triggerHazard(
                                hazard
                            );

                        }

                    }

                }
            );


        state.world.hazards =
            state.world.hazards
                .filter(
                    hazard =>
                        hazard.life >
                        0
                );

    }


    /* =========================================================
       DANO EM INIMIGO
       ========================================================= */

    function attackEnemy(
        enemy,
        damage,
        options =
            {}
    ) {

        if (

            !enemy ||

            enemy.dead ||

            damage <=
            0

        ) {

            return 0;

        }


        if (

            enemy.type ===
            "progression" &&

            !enemy.accepted

        ) {

            openBattle(
                enemy
            );


            return 0;

        }


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        enemy.state =
            "chasing";


        let finalDamage =
            damage;


        if (
            enemy.shield >
            0
        ) {

            finalDamage *=
                1 -
                clamp(
                    enemy.shield,
                    0,
                    0.8
                );

        }


        finalDamage =
            Math.max(
                1,
                Math.round(
                    finalDamage
                )
            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp -
                finalDamage
            );


        enemy.hitFlash =
            0.16;


        createDamageNumber(

            enemy.x,

            enemy.y -
            enemy.radius -
            10,

            finalDamage,

            {
                critical:
                    options.critical
            }

        );


        if (
            !options.noHitFx
        ) {

            createBurst(

                enemy.x,
                enemy.y,

                "#f5ece5",

                7,

                75,

                {
                    shape:
                        "spark"
                }

            );

        }


        if (
            enemy.id ===
            "monarch"
        ) {

            enemy.monarchHits =
                (
                    enemy.monarchHits ||
                    0
                ) +
                1;


            if (

                enemy.monarchHits >=
                10 &&

                enemy.monarchStagger <=
                0

            ) {

                enemy.monarchHits =
                    0;


                enemy.monarchStagger =
                    5;


                enemy.stunTimer =
                    Math.max(
                        enemy.stunTimer,
                        5
                    );


                createEffect({

                    type:
                        "monarchStagger",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    color:
                        "#e0c2ff",

                    life:
                        5,

                    maxLife:
                        5,

                    radius:
                        45,

                    maxRadius:
                        75

                });


                showToast(
                    "O MONARCA ficou desorientado!"
                );

            }

        }


        if (
            enemy.hp <=
            0
        ) {

            defeatEnemy(
                enemy
            );

        }


        return finalDamage;

    }


    /* =========================================================
       COLISÃO DOS INIMIGOS
       ========================================================= */

    function canEnemyMoveTo(
        x,
        y,
        radius
    ) {

        if (

            x -
            radius <
            WORLD_MARGIN ||

            y -
            radius <
            WORLD_MARGIN ||

            x +
            radius >
            state.world.width -
            WORLD_MARGIN ||

            y +
            radius >
            state.world.height -
            WORLD_MARGIN

        ) {

            return false;

        }


        return !state.world.obstacles
            .some(
                obstacle => {

                    if (
                        obstacle.solid ===
                        false
                    ) {

                        return false;

                    }


                    return circleRectCollision(
                        x,
                        y,
                        radius,
                        obstacle
                    );

                }
            );

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


        return moveCircleWithCollision(

            enemy,

            direction.x,
            direction.y,

            speed *
            dt,

            {
                checker:
                    canEnemyMoveTo
            }

        );

    }


    function returnEnemyHome(
        enemy,
        dt
    ) {

        const d =
            distance(

                enemy.x,
                enemy.y,

                enemy.homeX,
                enemy.homeY

            );


        if (
            d <=
            5
        ) {

            enemy.x =
                enemy.homeX;


            enemy.y =
                enemy.homeY;


            enemy.state =
                "idle";


            enemy.aggressive =
                false;


            enemy.hp =
                enemy.maxHp;


            return;

        }


        moveEnemyToward(

            enemy,

            enemy.homeX,
            enemy.homeY,

            enemy.speed,

            dt

        );

    }


    /* =========================================================
       CHARGE TELEGRAPHADA

       Sem teleporte instantâneo.
       ========================================================= */

    function startEnemyCharge(
        enemy,
        options =
            {}
    ) {

        if (

            enemy.charge ||

            enemy.dead

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


        enemy.charge = {

            phase:
                "telegraph",

            timer:
                options.telegraph ??
                0.72,

            telegraph:
                options.telegraph ??
                0.72,

            dirX:
                direction.x,

            dirY:
                direction.y,

            speed:
                options.speed ||
                540,

            duration:
                options.duration ||
                0.44,

            remaining:
                options.duration ||
                0.44,

            damage:
                options.damage ||
                enemy.damage *
                1.25,

            hit:
                false,

            color:
                options.color ||
                enemy.color

        };


        createEffect({

            type:
                "chargeTelegraph",

            x:
                enemy.x,

            y:
                enemy.y,

            angle:
                Math.atan2(
                    direction.y,
                    direction.x
                ),

            color:
                enemy.charge
                    .color,

            life:
                enemy.charge
                    .telegraph,

            maxLife:
                enemy.charge
                    .telegraph,

            radius:
                enemy.radius,

            maxRadius:
                260

        });


        return true;

    }


    function updateEnemyCharge(
        enemy,
        dt
    ) {

        const charge =
            enemy.charge;


        if (
            !charge
        ) {

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


                charge.remaining =
                    charge.duration;


                createBurst(
                    enemy.x,
                    enemy.y,
                    charge.color,
                    12,
                    110
                );

            }


            return true;

        }


        const moved =
            moveCircleWithCollision(

                enemy,

                charge.dirX,
                charge.dirY,

                charge.speed *
                dt,

                {
                    checker:
                        canEnemyMoveTo
                }

            );


        charge.remaining -=
            dt;


        if (

            !charge.hit &&

            circleCircleCollision(

                enemy.x,
                enemy.y,
                enemy.radius +
                5,

                state.player.x,
                state.player.y,
                state.player.radius

            )

        ) {

            charge.hit =
                true;


            damagePlayer(

                charge.damage,

                {
                    source:
                        "charge"
                }

            );

        }


        createParticle({

            x:
                enemy.x -
                charge.dirX *
                enemy.radius,

            y:
                enemy.y -
                charge.dirY *
                enemy.radius,

            vx:
                -charge.dirX *
                75 +
                random(
                    -20,
                    20
                ),

            vy:
                -charge.dirY *
                75 +
                random(
                    -20,
                    20
                ),

            size:
                random(
                    3,
                    6
                ),

            color:
                charge.color,

            life:
                0.25

        });


        if (

            !moved ||

            charge.remaining <=
            0

        ) {

            enemy.charge =
                null;


            enemy.attackCooldown =
                Math.max(
                    enemy.attackCooldown,
                    0.85
                );

        }


        return true;

    }


    /* =========================================================
       ESPECIAIS DOS BOSSES
       ========================================================= */

    function useEnemySpecial(
        enemy
    ) {

        const player =
            state.player;


        if (

            !player ||

            player.dead

        ) {

            return;

        }


        const pattern =
            enemy.bossPattern ||
            enemy.spriteType;


        /* BOSS 1 */

        if (
            pattern ===
            "route1_slow"
        ) {

            createTimedHazard({

                type:
                    "roadSlam",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    72,

                delay:
                    0.85,

                damage:
                    enemy.damage *
                    1.18,

                color:
                    "#a35d55"

            });


            enemy.specialCooldown =
                3.4;


            return;

        }


        /* BOSS 2 */

        if (
            pattern ===
            "forestRoots"
        ) {

            for (
                let i = 0;
                i <
                3;
                i++
            ) {

                createTimedHazard({

                    type:
                        "rootBurst",

                    x:
                        player.x +
                        random(
                            -90,
                            90
                        ),

                    y:
                        player.y +
                        random(
                            -90,
                            90
                        ),

                    radius:
                        52,

                    delay:
                        0.75 +
                        i *
                        0.18,

                    damage:
                        enemy.damage *
                        1.1,

                    color:
                        "#667b50"

                });

            }


            enemy.specialCooldown =
                4.1;


            return;

        }


        /* BOSS 3 */

        if (
            pattern ===
            "grovePulse"
        ) {

            for (
                let i = 0;
                i <
                3;
                i++
            ) {

                createTimedHazard({

                    type:
                        "grovePulse",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    radius:
                        78 +
                        i *
                        72,

                    ringWidth:
                        52,

                    ring:
                        true,

                    delay:
                        0.58 +
                        i *
                        0.22,

                    damage:
                        enemy.damage *
                        1.12,

                    color:
                        "#6f8c5d"

                });

            }


            enemy.specialCooldown =
                4.5;


            return;

        }


        /* BOSS 4 */

        if (
            pattern ===
            "mountainQuake"
        ) {

            for (
                let i = 0;
                i <
                5;
                i++
            ) {

                createTimedHazard({

                    type:
                        "fallingRock",

                    x:
                        player.x +
                        random(
                            -170,
                            170
                        ),

                    y:
                        player.y +
                        random(
                            -170,
                            170
                        ),

                    radius:
                        46,

                    delay:
                        0.9 +
                        i *
                        0.14,

                    damage:
                        enemy.damage *
                        1.18,

                    color:
                        "#a9a9a3"

                });

            }


            enemy.specialCooldown =
                4.8;


            return;

        }


        /* BOSS 5 */

        if (
            pattern ===
            "ironMagnet"
        ) {

            const aim =
                normalize(

                    player.x -
                    enemy.x,

                    player.y -
                    enemy.y

                );


            const center =
                Math.atan2(
                    aim.y,
                    aim.x
                );


            for (
                let i = -2;
                i <=
                2;
                i++
            ) {

                const angle =
                    center +
                    i *
                    0.15;


                spawnEnemyProjectile(

                    enemy,

                    {

                        direction: {

                            x:
                                Math.cos(
                                    angle
                                ),

                            y:
                                Math.sin(
                                    angle
                                )

                        },

                        type:
                            "ironShard",

                        speed:
                            285,

                        radius:
                            7,

                        damage:
                            enemy.damage *
                            0.72,

                        color:
                            "#aab0b1"

                    }

                );

            }


            enemy.shield =
                0.22;


            enemy.shieldTimer =
                2.4;


            enemy.specialCooldown =
                4.2;


            return;

        }


        /* BOSS 6 */

        if (
            pattern ===
            "rubyChimera"
        ) {

            const aim =
                normalize(

                    player.x -
                    enemy.x,

                    player.y -
                    enemy.y

                );


            const center =
                Math.atan2(
                    aim.y,
                    aim.x
                );


            for (
                let i = -3;
                i <=
                3;
                i++
            ) {

                const angle =
                    center +
                    i *
                    0.12;


                spawnEnemyProjectile(

                    enemy,

                    {

                        direction: {

                            x:
                                Math.cos(
                                    angle
                                ),

                            y:
                                Math.sin(
                                    angle
                                )

                        },

                        type:
                            "rubyFlame",

                        speed:
                            260,

                        radius:
                            9,

                        damage:
                            enemy.damage *
                            0.7,

                        color:
                            "#cf5268"

                    }

                );

            }


            createTimedHazard({

                type:
                    "rubyBurst",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    76,

                delay:
                    1.05,

                damage:
                    enemy.damage *
                    1.22,

                color:
                    "#c64b65"

            });


            enemy.specialCooldown =
                4.5;


            return;

        }


        /* ROTA 2 — AGORA PODE DASH */

        if (
            pattern ===
            "shadowDash"
        ) {

            startEnemyCharge(

                enemy,

                {

                    telegraph:
                        0.78,

                    speed:
                        560,

                    duration:
                        0.43,

                    damage:
                        enemy.damage *
                        1.25,

                    color:
                        "#7364a8"

                }

            );


            enemy.specialCooldown =
                4.2;


            return;

        }


        if (
            pattern ===
            "fairyDash"
        ) {

            if (
                Math.random() <
                0.52
            ) {

                startEnemyCharge(

                    enemy,

                    {

                        telegraph:
                            0.65,

                        speed:
                            610,

                        duration:
                            0.36,

                        damage:
                            enemy.damage *
                            1.15,

                        color:
                            "#e3a9df"

                    }

                );

            }

            else {

                for (
                    let i = 0;
                    i <
                    5;
                    i++
                ) {

                    createTimedHazard({

                        type:
                            "fairyStar",

                        x:
                            player.x +
                            random(
                                -140,
                                140
                            ),

                        y:
                            player.y +
                            random(
                                -140,
                                140
                            ),

                        radius:
                            44,

                        delay:
                            0.7 +
                            i *
                            0.13,

                        damage:
                            enemy.damage *
                            0.85,

                        color:
                            "#eda7e1"

                    });

                }

            }


            enemy.specialCooldown =
                3.8;


            return;

        }


        if (
            pattern ===
            "pathGuardian"
        ) {

            const angle =
                Math.atan2(

                    player.y -
                    enemy.y,

                    player.x -
                    enemy.x

                );


            for (
                let i = -2;
                i <=
                2;
                i++
            ) {

                spawnEnemyProjectile(

                    enemy,

                    {

                        direction: {

                            x:
                                Math.cos(
                                    angle +
                                    i *
                                    0.17
                                ),

                            y:
                                Math.sin(
                                    angle +
                                    i *
                                    0.17
                                )

                        },

                        type:
                            "skyLance",

                        speed:
                            340,

                        radius:
                            8,

                        damage:
                            enemy.damage *
                            0.78,

                        color:
                            "#f2f4ee"

                    }

                );

            }


            enemy.specialCooldown =
                3.6;


            return;

        }


        if (
            pattern ===
            "hellGuardian"
        ) {

            if (
                Math.random() <
                0.45
            ) {

                startEnemyCharge(

                    enemy,

                    {

                        telegraph:
                            0.72,

                        speed:
                            610,

                        duration:
                            0.46,

                        damage:
                            enemy.damage *
                            1.3,

                        color:
                            "#d35b3e"

                    }

                );

            }

            else {

                for (
                    let i = 0;
                    i <
                    5;
                    i++
                ) {

                    createTimedHazard({

                        type:
                            "hellFlare",

                        x:
                            player.x +
                            random(
                                -180,
                                180
                            ),

                        y:
                            player.y +
                            random(
                                -180,
                                180
                            ),

                        radius:
                            58,

                        delay:
                            0.72 +
                            i *
                            0.12,

                        damage:
                            enemy.damage *
                            0.95,

                        color:
                            "#db5b39"

                    });

                }

            }


            enemy.specialCooldown =
                3.4;


            return;

        }


        if (
            pattern ===
            "otherSelf"
        ) {

            useOtherSelfSpecial(
                enemy
            );


            return;

        }


        if (
            [
                "moth",
                "wraith",
                "acolyte",
                "bat"
            ].includes(
                enemy.spriteType
            )
        ) {

            spawnEnemyProjectile(

                enemy,

                {

                    type:
                        "enemyBolt",

                    speed:
                        enemy.spriteType ===
                        "bat"

                            ? 305

                            : 245,

                    radius:
                        7,

                    damage:
                        enemy.damage *
                        0.86,

                    color:
                        enemy.color

                }

            );


            enemy.specialCooldown =
                random(
                    2.2,
                    3.4
                );

        }

    }


    /* =========================================================
       OUTRO EU — FASES
       ========================================================= */

    function useOtherSelfSpecial(
        enemy
    ) {

        const ratio =
            enemy.hp /
            enemy.maxHp;


        if (
            ratio >
            0.66
        ) {

            const aim =
                normalize(

                    state.player.x -
                    enemy.x,

                    state.player.y -
                    enemy.y

                );


            const center =
                Math.atan2(
                    aim.y,
                    aim.x
                );


            for (
                let i = -2;
                i <=
                2;
                i++
            ) {

                spawnEnemyProjectile(

                    enemy,

                    {

                        direction: {

                            x:
                                Math.cos(
                                    center +
                                    i *
                                    0.18
                                ),

                            y:
                                Math.sin(
                                    center +
                                    i *
                                    0.18
                                )

                        },

                        type:
                            "mirrorBolt",

                        speed:
                            325,

                        radius:
                            9,

                        damage:
                            enemy.damage *
                            0.72,

                        color:
                            state.player
                                .color

                    }

                );

            }


            enemy.specialCooldown =
                3.2;


            return;

        }


        if (
            ratio >
            0.33
        ) {

            startEnemyCharge(

                enemy,

                {

                    telegraph:
                        0.62,

                    speed:
                        640,

                    duration:
                        0.42,

                    damage:
                        enemy.damage *
                        1.22,

                    color:
                        state.player
                            .color

                }

            );


            enemy.specialCooldown =
                2.8;


            return;

        }


        createTimedHazard({

            type:
                "mirrorCollapse",

            x:
                state.player.x,

            y:
                state.player.y,

            radius:
                95,

            delay:
                0.72,

            damage:
                enemy.damage *
                1.28,

            color:
                state.player
                    .color

        });


        startEnemyCharge(

            enemy,

            {

                telegraph:
                    0.78,

                speed:
                    650,

                duration:
                    0.40,

                damage:
                    enemy.damage *
                    1.18,

                color:
                    "#d4bddf"

            }

        );


        enemy.specialCooldown =
            2.45;

    }


    /* =========================================================
       MONARCA
       ========================================================= */

    function spawnMonarch() {

        if (

            state.area !==
            "monarchMaze" ||

            state.player
                .monarchDefeated ||

            state.world.enemies
                .some(
                    enemy =>

                        enemy.id ===
                        "monarch" &&

                        !enemy.dead
                )

        ) {

            return false;

        }


        state.player.monarchAwakened =
            true;


        const monarch =
            addEnemy({

                id:
                    "monarch",

                name:
                    "O MONARCA",

                spriteType:
                    "monarch",

                icon:
                    "♛",

                type:
                    "progression",

                x:
                    3050,

                y:
                    880,

                hp:
                    3100,

                maxHp:
                    3100,

                damage:
                    43,

                speed:
                    0,

                vision:
                    900,

                attackRange:
                    240,

                radius:
                    55,

                color:
                    "#80659c",

                xp:
                    900,

                money:
                    700,

                accepted:
                    true,

                aggressive:
                    true,

                stationary:
                    true,

                bossPattern:
                    "monarch",

                monarchHits:
                    0,

                monarchStagger:
                    0,

                cloneCooldown:
                    5,

                rockCooldown:
                    2.4

            });


        discoverBoss(
            "monarch"
        );


        state.bossBarTarget =
            monarch;


        return monarch;

    }


    function countLivingMonarchClones() {

        return state.world.enemies
            .filter(
                enemy =>

                    enemy.monarchClone &&

                    !enemy.dead
            )
            .length;

    }


    function getMonarchCloneSpawnPosition() {

        const positions = [

            {
                x:
                    2810,
                y:
                    820
            },

            {
                x:
                    3290,
                y:
                    820
            },

            {
                x:
                    2800,
                y:
                    1330
            },

            {
                x:
                    3300,
                y:
                    1330
            },

            {
                x:
                    2870,
                y:
                    1080
            },

            {
                x:
                    3230,
                y:
                    1080
            }

        ];


        const shuffled =
            [
                ...positions
            ]
                .sort(
                    () =>
                        Math.random() -
                        0.5
                );


        for (
            const position of
            shuffled
        ) {

            if (

                canEnemyMoveTo(

                    position.x,
                    position.y,
                    23

                ) &&

                distance(

                    position.x,
                    position.y,

                    state.player.x,
                    state.player.y

                ) >
                150

            ) {

                return position;

            }

        }


        return {
            x:
                2820,
            y:
                1320
        };

    }


    function summonMonarchClones(
        monarch
    ) {

        const living =
            countLivingMonarchClones();


        const capacity =
            Math.max(
                0,
                6 -
                living
            );


        if (
            capacity <=
            0
        ) {

            monarch.cloneCooldown =
                3;


            return;

        }


        const count =
            Math.min(

                capacity,

                randomInt(
                    1,
                    3
                )

            );


        for (
            let i = 0;
            i <
            count;
            i++
        ) {

            const position =
                getMonarchCloneSpawnPosition();


            addEnemy({

                id:
                    uid(
                        "monarch_clone"
                    ),

                name:
                    "ECO DO MONARCA",

                spriteType:
                    "monarchClone",

                icon:
                    "◇",

                type:
                    "summon",

                x:
                    position.x,

                y:
                    position.y,

                hp:
                    165,

                maxHp:
                    165,

                damage:
                    24,

                speed:
                    102,

                vision:
                    700,

                attackRange:
                    66,

                radius:
                    22,

                color:
                    "#665477",

                xp:
                    0,

                money:
                    0,

                monarchClone:
                    true,

                accepted:
                    true,

                aggressive:
                    true

            });


            createEffect({

                type:
                    "cloneSpawn",

                x:
                    position.x,

                y:
                    position.y,

                color:
                    "#8c72a5",

                life:
                    0.62,

                maxLife:
                    0.62,

                radius:
                    12,

                maxRadius:
                    60

            });

        }


        monarch.cloneCooldown =
            6.5;

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


        monarch.monarchStagger =
            Math.max(

                0,

                finiteNumber(
                    monarch.monarchStagger,
                    0
                ) -
                dt

            );


        if (
            monarch.monarchStagger >
            0
        ) {

            monarch.stunTimer =
                Math.max(

                    monarch.stunTimer,

                    monarch.monarchStagger

                );


            return;

        }


        monarch.cloneCooldown =
            Math.max(

                0,

                monarch.cloneCooldown -
                dt

            );


        monarch.rockCooldown =
            Math.max(

                0,

                monarch.rockCooldown -
                dt

            );


        if (
            monarch.cloneCooldown <=
            0
        ) {

            summonMonarchClones(
                monarch
            );

        }


        if (
            monarch.rockCooldown <=
            0
        ) {

            const amount =
                monarch.hp /
                monarch.maxHp <
                0.5

                    ? 5

                    : 3;


            for (
                let i = 0;
                i <
                amount;
                i++
            ) {

                createTimedHazard({

                    type:
                        "monarchRock",

                    x:
                        state.player.x +
                        random(
                            -150,
                            150
                        ),

                    y:
                        state.player.y +
                        random(
                            -150,
                            150
                        ),

                    radius:
                        54,

                    delay:
                        0.95 +
                        i *
                        0.10,

                    damage:
                        monarch.damage *
                        1.22,

                    owner:
                        "enemy",

                    color:
                        "#76627f"

                });

            }


            monarch.rockCooldown =
                monarch.hp /
                monarch.maxHp <
                0.5

                    ? 2.1

                    : 2.75;

        }

    }


    /* =========================================================
       IA DOS INIMIGOS
       ========================================================= */

    function updateEnemies(
        dt
    ) {

        const player =
            state.player;


        if (

            !player ||

            player.dead ||

            state.paused ||

            state.houseMode

        ) {

            return;

        }


        state.world.enemies
            .forEach(
                enemy => {

                    if (
                        enemy.dead
                    ) {

                        updateDeadEnemy(
                            enemy,
                            dt
                        );


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
                        enemy.shieldTimer !=
                        null
                    ) {

                        enemy.shieldTimer =
                            Math.max(

                                0,

                                enemy.shieldTimer -
                                dt

                            );


                        if (
                            enemy.shieldTimer <=
                            0
                        ) {

                            enemy.shield =
                                0;

                        }

                    }


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
                        updateEnemyCharge(
                            enemy,
                            dt
                        )
                    ) {

                        return;

                    }


                    const d =
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

                            enemy.homeX,
                            enemy.homeY

                        );


                    const leash =
                        enemy.type ===
                        "progression"

                            ? 820

                            : enemy.type ===
                                "resourceBoss"

                                ? 540

                                : 460;


                    if (
                        homeDistance >
                        leash
                    ) {

                        enemy.state =
                            "returning";


                        returnEnemyHome(
                            enemy,
                            dt
                        );


                        return;

                    }


                    if (

                        enemy.type ===
                        "progression" &&

                        !enemy.accepted

                    ) {

                        if (
                            d <
                            enemy.vision *
                            0.55
                        ) {

                            discoverBoss(
                                enemy.id
                            );

                        }


                        return;

                    }


                    if (

                        enemy.aggressive ||

                        d <=
                        enemy.vision

                    ) {

                        enemy.aggressive =
                            true;


                        enemy.state =
                            "chasing";


                        if (

                            enemy.specialCooldown <=
                            0 &&

                            (
                                enemy.bossPattern ||

                                [
                                    "moth",
                                    "wraith",
                                    "acolyte",
                                    "bat"
                                ]
                                    .includes(
                                        enemy.spriteType
                                    )
                            )

                        ) {

                            useEnemySpecial(
                                enemy
                            );


                            if (
                                enemy.charge
                            ) {

                                return;

                            }

                        }


                        const attackRange =
                            enemy.attackRange +
                            player.radius;


                        if (
                            d <=
                            attackRange
                        ) {

                            if (
                                enemy.attackCooldown <=
                                0
                            ) {

                                damagePlayer(

                                    enemy.damage,

                                    {
                                        source:
                                            enemy.id
                                    }

                                );


                                enemy.attackCooldown =
                                    enemy.type ===
                                    "progression"

                                        ? 1.15

                                        : 1.35;


                                createEffect({

                                    type:
                                        "enemyStrike",

                                    x:
                                        player.x,

                                    y:
                                        player.y,

                                    color:
                                        enemy.color,

                                    life:
                                        0.24,

                                    maxLife:
                                        0.24,

                                    radius:
                                        18,

                                    maxRadius:
                                        48

                                });

                            }

                        }

                        else if (
                            enemy.speed >
                            0
                        ) {

                            const moved =
                                moveEnemyToward(

                                    enemy,

                                    player.x,
                                    player.y,

                                    enemy.speed,

                                    dt

                                );


                            if (
                                !moved
                            ) {

                                /*
                                    Contorno simples.

                                    Importante:
                                    NÃO TELEPORTA o inimigo.
                                */

                                const side =
                                    normalize(

                                        -(
                                            player.y -
                                            enemy.y
                                        ),

                                        player.x -
                                        enemy.x

                                    );


                                moveCircleWithCollision(

                                    enemy,

                                    side.x,
                                    side.y,

                                    enemy.speed *
                                    0.55 *
                                    dt,

                                    {
                                        checker:
                                            canEnemyMoveTo
                                    }

                                );

                            }

                        }

                    }

                    else if (
                        homeDistance >
                        16
                    ) {

                        returnEnemyHome(
                            enemy,
                            dt
                        );

                    }

                }
            );


        updateBossBarTarget();

    }


    /* =========================================================
       BOSS DE RECURSO
       ========================================================= */

    function updateDeadEnemy(
        enemy,
        dt
    ) {

        if (

            enemy.type !==
            "resourceBoss" ||

            enemy.respawnTime <=
            0

        ) {

            return;

        }


        enemy.respawnTimer -=
            dt;


        if (
            enemy.respawnTimer >
            0
        ) {

            return;

        }


        let x =
            enemy.homeX;


        let y =
            enemy.homeY;


        if (
            !isSpawnPositionSafe(

                x,
                y,

                enemy.radius +
                18,

                {

                    avoidProtected:
                        true,

                    avoidEntities:
                        true

                }

            )
        ) {

            const rng =
                getAreaRng(

                    state.area,

                    `respawn_${enemy.id}_${Math.floor(state.time)}`

                );


            const safe =
                findSafeSpawnPosition(

                    rng,

                    {

                        radius:
                            enemy.radius +
                            18,

                        avoidEntities:
                            true

                    }

                );


            if (
                safe
            ) {

                x =
                    safe.x;


                y =
                    safe.y;

            }

        }


        enemy.x =
            x;


        enemy.y =
            y;


        enemy.homeX =
            x;


        enemy.homeY =
            y;


        enemy.dead =
            false;


        enemy.hp =
            enemy.maxHp;


        enemy.aggressive =
            false;


        enemy.accepted =
            true;


        showToast(
            `${enemy.name} reapareceu.`
        );

    }


    function ensureVillageResourceBoss() {

        if (

            state.area !==
            "village" ||

            state.houseMode

        ) {

            return;

        }


        if (
            state.world.enemies
                .some(
                    enemy =>
                        enemy.id ===
                        "village_resource_boss"
                )
        ) {

            return;

        }


        addEnemy({

            id:
                "village_resource_boss",

            name:
                "CERVO ANCESTRAL",

            spriteType:
                "ancientDeer",

            icon:
                "◇",

            type:
                "resourceBoss",

            x:
                2360,

            y:
                1810,

            hp:
                460,

            maxHp:
                460,

            damage:
                18,

            speed:
                68,

            vision:
                280,

            attackRange:
                78,

            radius:
                31,

            color:
                "#7b8965",

            xp:
                85,

            money:
                75,

            drop:
                "ouro",

            dropAmount:
                2,

            dropChance:
                1,

            respawnTime:
                60,

            accepted:
                true

        });

    }


    /* =========================================================
       BARRA DO BOSS
       ========================================================= */

    function updateBossBarTarget() {

        const player =
            state.player;


        if (

            !player ||

            state.houseMode

        ) {

            state.bossBarTarget =
                null;


            return;

        }


        const bosses =
            state.world.enemies
                .filter(
                    enemy =>

                        !enemy.dead &&

                        (
                            enemy.type ===
                            "progression" ||

                            enemy.type ===
                            "resourceBoss"
                        ) &&

                        (
                            enemy.accepted ||

                            enemy.aggressive
                        )
                );


        let chosen =
            null;


        let closest =
            Infinity;


        bosses.forEach(
            enemy => {

                const d =
                    distance(

                        player.x,
                        player.y,

                        enemy.x,
                        enemy.y

                    );


                if (

                    d <
                    closest &&

                    d <
                    920

                ) {

                    chosen =
                        enemy;


                    closest =
                        d;

                }

            }
        );


        state.bossBarTarget =
            chosen;

    }


    /* =========================================================
       LIVRO / BOSS DESCOBERTO
       ========================================================= */

    function discoverBoss(
        id
    ) {

        const player =
            state.player;


        if (

            !player ||

            player.discoveredBosses
                .includes(
                    id
                )

        ) {

            return;

        }


        player.discoveredBosses
            .push(
                id
            );

    }


    function markBossDefeated(
        id
    ) {

        discoverBoss(
            id
        );


        if (
            !state.player
                .defeatedBosses
                .includes(
                    id
                )
        ) {

            state.player
                .defeatedBosses
                .push(
                    id
                );

        }

    }


    /* =========================================================
       DROPS
       ========================================================= */

    function spawnDrop(
        id,
        amount,
        x,
        y,
        options =
            {}
    ) {

        if (

            !ITEMS[id] ||

            amount <=
            0

        ) {

            return null;

        }


        const drop = {

            id:
                uid(
                    "drop"
                ),

            itemId:
                id,

            amount:
                Math.max(
                    1,
                    Math.floor(
                        amount
                    )
                ),

            x,

            y,

            radius:
                16,

            bob:
                random(
                    0,
                    Math.PI *
                    2
                ),

            life:
                options.life ||
                120

        };


        state.world.drops
            .push(
                drop
            );


        createBurst(
            x,
            y,
            "#e7d6ad",
            8,
            65
        );


        return drop;

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

                drop.amount

            )
        ) {

            return false;

        }


        const item =
            ITEMS[
                drop.itemId
            ];


        state.world.drops =
            state.world.drops
                .filter(
                    current =>
                        current !==
                        drop
                );


        createEffect({

            type:
                "lootPickup",

            x:
                drop.x,

            y:
                drop.y,

            color:
                "#f0d18a",

            life:
                0.45,

            maxLife:
                0.45,

            radius:
                12,

            maxRadius:
                58

        });


        showToast(
            `${item.name} x${drop.amount} coletado.`
        );


        return true;

    }


    function updateDrops(
        dt
    ) {

        state.world.drops
            .forEach(
                drop => {

                    drop.bob +=
                        dt *
                        2.8;


                    drop.life -=
                        dt;

                }
            );


        state.world.drops =
            state.world.drops
                .filter(
                    drop =>
                        drop.life >
                        0
                );

    }


    /* =========================================================
       DERROTA DE INIMIGO
       ========================================================= */

    function defeatEnemy(
        enemy
    ) {

        if (
            enemy.dead
        ) {

            return;

        }


        enemy.dead =
            true;


        enemy.aggressive =
            false;


        enemy.charge =
            null;


        enemy.hp =
            0;


        createBurst(

            enemy.x,
            enemy.y,

            enemy.color,

            enemy.type ===
            "progression"

                ? 30

                : 14,

            enemy.type ===
            "progression"

                ? 145

                : 90

        );


        addScreenShake(

            enemy.type ===
            "progression"

                ? 9

                : 3.5,

            enemy.type ===
            "progression"

                ? 0.42

                : 0.18

        );


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
            (
                enemy.dropChance ??
                1
            )

        ) {

            spawnDrop(

                enemy.drop,

                enemy.dropAmount ||
                1,

                enemy.x,
                enemy.y

            );

        }


        if (
            enemy.hellType
        ) {

            state.player
                .hellTypesDefeated[
                    enemy.hellType
                ] =
                true;

        }


        if (
            enemy.type ===
            "resourceBoss"
        ) {

            enemy.respawnTimer =
                enemy.respawnTime ||
                60;


            return;

        }


        if (
            enemy.monarchClone
        ) {

            return;

        }


        if (
            enemy.type ===
            "progression"
        ) {

            markBossDefeated(
                enemy.id
            );


            if (
                enemy.id ===
                "monarch"
            ) {

                state.player
                    .monarchDefeated =
                    true;


                showToast(
                    "O MONARCA caiu. O altar ainda aguarda você."
                );

            }


            if (
                enemy.id ===
                "path_guardian"
            ) {

                if (
                    !state.player
                        .fluteRewardGranted
                ) {

                    spawnDrop(

                        "flautaMemoria",

                        1,

                        enemy.x,
                        enemy.y,

                        {
                            life:
                                9999
                        }

                    );


                    state.player
                        .fluteRewardGranted =
                        true;

                }

            }


            if (
                enemy.id ===
                "other_self"
            ) {

                state.player
                    .finalDefeated =
                    true;


                startDialogue(

                    {
                        name:
                            "VEYRA"
                    },

                    [

                        "O silêncio não desaparece.",

                        "Mas, pela primeira vez, ele não decide quem você é."

                    ]

                );

            }

        }

    }


    /* =========================================================
       MORTE
       ========================================================= */

    function handlePlayerDeath() {

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


        state.paused =
            true;


        state.pauseReason =
            "death";


        const panel =
            $("deathPanel");


        if (
            panel
        ) {

            panel.classList
                .remove(
                    "hidden"
                );

        }

    }


    function respawnPlayer() {

        const player =
            state.player;


        if (
            !player
        ) {

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


        state.area =
            REGIONS[
                checkpoint.area
            ]

                ? checkpoint.area

                : "village";


        state.houseMode =
            false;


        state.currentHouse =
            null;


        buildWorld();


        if (

            checkpoint.insideHouse &&

            state.area ===
            "village" &&

            checkpoint.houseId

        ) {

            const house =
                state.world.buildings
                    .find(
                        building =>
                            building.id ===
                            checkpoint.houseId
                    );


            if (
                house
            ) {

                enterHouseImmediate(
                    house,
                    false
                );

            }

        }


        if (
            !state.houseMode
        ) {

            player.x =
                checkpoint.x;


            player.y =
                checkpoint.y;

        }


        player.hp =
            Math.max(

                1,

                Math.round(
                    player.maxHp *
                    0.72
                )

            );


        player.magic =
            Math.round(
                player.maxMagic *
                0.65
            );


        player.energy =
            Math.round(
                player.maxEnergy *
                0.8
            );


        player.dead =
            false;


        player.invincible =
            1;


        state.paused =
            false;


        state.pauseReason =
            null;


        const panel =
            $("deathPanel");


        if (
            panel
        ) {

            panel.classList
                .add(
                    "hidden"
                );

        }


        startTransition({

            label:
                "VOCÊ DESPERTA NOVAMENTE...",

            startBlack:
                true,

            hold:
                0.55,

            fadeIn:
                0.75

        });

    }


    /* =========================================================
       XP E NÍVEL
       ========================================================= */

    function calculateXpToNext(
        level
    ) {

        return Math.floor(

            100 +

            (
                level -
                1
            ) *
            42 +

            Math.pow(
                level -
                1,
                1.34
            ) *
            17

        );

    }


    function gainXP(
        amount
    ) {

        const player =
            state.player;


        if (

            !player ||

            player.level >=
            MAX_LEVEL ||

            amount <=
            0

        ) {

            return;

        }


        player.xp +=
            Math.floor(
                amount
            );


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


            createEffect({

                type:
                    "levelUp",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#f5d67e",

                life:
                    1.2,

                maxLife:
                    1.2,

                radius:
                    20,

                maxRadius:
                    130

            });


            createBurst(

                player.x,
                player.y,

                "#f5d67e",

                30,

                120,

                {
                    shape:
                        "star"
                }

            );


            showToast(
                `Nível ${player.level}! +${POINTS_PER_LEVEL} pontos de status.`
            );

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

    }


    function allocateStatPoint(
        stat
    ) {

        const player =
            state.player;


        if (

            !player ||

            !STAT_CONFIG[stat] ||

            player.statPoints <=
            0

        ) {

            return false;

        }


        if (
            player.stats[stat] >=
            STAT_CONFIG[stat]
                .cap
        ) {

            showToast(
                "Esse atributo atingiu o limite."
            );


            return false;

        }


        const oldHp =
            player.maxHp;


        const oldEnergy =
            player.maxEnergy;


        const oldHunger =
            player.maxHunger;


        const oldFatigue =
            player.maxFatigue;


        player.stats[stat]++;


        player.statPoints--;


        recalculatePlayerStats();


        player.hp =
            Math.min(

                player.maxHp,

                player.hp +
                (
                    player.maxHp -
                    oldHp
                )

            );


        player.energy =
            Math.min(

                player.maxEnergy,

                player.energy +
                (
                    player.maxEnergy -
                    oldEnergy
                )

            );


        player.hunger =
            Math.min(

                player.maxHunger,

                player.hunger +
                (
                    player.maxHunger -
                    oldHunger
                )

            );


        player.fatigue =
            Math.min(

                player.maxFatigue,

                player.fatigue +
                (
                    player.maxFatigue -
                    oldFatigue
                )

            );


        return true;

    }


    /* =========================================================
       RESPAWN SEGURO DE RECURSO
       ========================================================= */

    function respawnResourceSafely(
        resource
    ) {

        if (
            isSpawnPositionSafe(

                resource.homeX,
                resource.homeY,

                resource.radius +
                18,

                {

                    avoidProtected:
                        true,

                    avoidEntities:
                        true

                }

            )
        ) {

            resource.x =
                resource.homeX;


            resource.y =
                resource.homeY;


            resource.alive =
                true;


            return;

        }


        const rng =
            getAreaRng(

                state.area,

                `resource_respawn_${resource.id}_${Math.floor(state.time)}`

            );


        const safe =
            findSafeSpawnPosition(

                rng,

                {

                    radius:
                        resource.radius +
                        18,

                    avoidEntities:
                        true

                }

            );


        if (
            safe
        ) {

            resource.x =
                safe.x;


            resource.y =
                safe.y;


            resource.homeX =
                safe.x;


            resource.homeY =
                safe.y;


            resource.alive =
                true;

        }

        else {

            resource.respawnTimer =
                3;

        }

    }


    function respawnTreeSafely(
        tree
    ) {

        const safe =
            isSpawnPositionSafe(

                tree.homeX,
                tree.homeY,

                42,

                {

                    avoidProtected:
                        true,

                    avoidEntities:
                        true

                }

            );


        if (
            !safe
        ) {

            tree.respawnTimer =
                4;


            return;

        }


        tree.x =
            tree.homeX;


        tree.y =
            tree.homeY;


        tree.alive =
            true;


        const obstacle =
            state.world.obstacles
                .find(
                    current =>
                        current.treeId ===
                        tree.id
                );


        if (
            obstacle
        ) {

            obstacle.solid =
                true;


            obstacle.x =
                tree.x -
                13;


            obstacle.y =
                tree.y +
                2;

        }

    }


    function updateHarvestRespawns(
        dt
    ) {

        state.world.resources
            .forEach(
                resource => {

                    if (
                        resource.alive
                    ) {

                        return;

                    }


                    resource.respawnTimer -=
                        dt;


                    if (
                        resource.respawnTimer <=
                        0
                    ) {

                        respawnResourceSafely(
                            resource
                        );

                    }

                }
            );


        state.world.trees
            .forEach(
                tree => {

                    if (
                        tree.alive
                    ) {

                        return;

                    }


                    tree.respawnTimer -=
                        dt;


                    if (
                        tree.respawnTimer <=
                        0
                    ) {

                        respawnTreeSafely(
                            tree
                        );

                    }

                }
            );


        state.world.foods
            .forEach(
                food => {

                    if (
                        food.alive
                    ) {

                        return;

                    }


                    food.respawnTimer -=
                        dt;


                    if (
                        food.respawnTimer <=
                        0
                    ) {

                        if (
                            !circleInProtectedZone(

                                food.x,
                                food.y,
                                food.radius

                            )
                        ) {

                            food.alive =
                                true;

                        }

                        else {

                            food.respawnTimer =
                                3;

                        }

                    }

                }
            );

    }


    /* =========================================================
       COLETA
       ========================================================= */

    function harvestResource(
        resource
    ) {

        if (

            !resource ||

            !resource.alive

        ) {

            return false;

        }


        const amount =
            randomInt(

                resource.amountMin,

                resource.amountMax

            );


        if (
            !addItem(

                resource.type,

                amount

            )
        ) {

            return false;

        }


        resource.alive =
            false;


        resource.respawnTimer =
            resource.respawn;


        state.player.magic =
            Math.max(

                0,

                state.player.magic -
                1.2

            );


        state.player.hunger =
            Math.max(

                0,

                state.player.hunger -
                0.35

            );


        state.player.fatigue =
            Math.max(

                0,

                state.player.fatigue -
                0.25

            );


        gainXP(
            5
        );


        let color =
            "#b1b4b2";


        if (
            resource.type ===
            "rubi"
        ) {

            color =
                "#d64f6b";

        }

        else if (
            resource.type ===
            "diamante"
        ) {

            color =
                "#9ee9ff";

        }

        else if (
            resource.type ===
            "ouro"
        ) {

            color =
                "#e6c55a";

        }


        createBurst(

            resource.x,
            resource.y,

            color,

            14,

            90,

            {
                shape:
                    "spark"
            }

        );


        showToast(
            `${ITEMS[resource.type].name} x${amount}.`
        );


        return true;

    }


    function harvestTree(
        tree
    ) {

        if (

            !tree ||

            !tree.alive

        ) {

            return false;

        }


        if (

            state.player.equipment
                ?.tool !==
            "machado" &&

            state.player.inventory
                .machado <=
            0

        ) {

            showToast(
                "Você precisa de um machado."
            );


            return false;

        }


        const amount =
            randomInt(
                2,
                4
            );


        if (
            !addItem(
                "madeira",
                amount
            )
        ) {

            return false;

        }


        tree.alive =
            false;


        tree.respawnTimer =
            tree.respawn;


        const obstacle =
            state.world.obstacles
                .find(
                    current =>
                        current.treeId ===
                        tree.id
                );


        if (
            obstacle
        ) {

            obstacle.solid =
                false;

        }


        state.player.magic =
            Math.max(
                0,
                state.player.magic -
                0.7
            );


        state.player.fatigue =
            Math.max(
                0,
                state.player.fatigue -
                0.42
            );


        gainXP(
            4
        );


        createBurst(

            tree.x,
            tree.y,

            "#8a6842",

            18,

            100,

            {
                gravity:
                    120,

                shape:
                    "wood"
            }

        );


        createEffect({

            type:
                "treeFall",

            x:
                tree.x,

            y:
                tree.y,

            color:
                "#62784c",

            life:
                0.7,

            maxLife:
                0.7,

            radius:
                22,

            maxRadius:
                65

        });


        showToast(
            `Madeira x${amount}.`
        );


        return true;

    }


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
                "#e38b45",
                7,
                55
            );


            showToast(
                "Cenoura coletada."
            );


            return true;

        }


        return false;

    }


    /* =========================================================
       SEGURAR E
       ========================================================= */

    function beginHoldInteraction() {

        if (

            state.paused ||

            state.transition

        ) {

            return false;

        }


        const interaction =
            getInteraction();


        if (
            !interaction
        ) {

            return false;

        }


        if (

            interaction.type !==
            "tree" &&

            interaction.type !==
            "resource"

        ) {

            return false;

        }


        state.holdAction = {

            type:
                interaction.type,

            target:
                interaction.target,

            time:
                0,

            required:
                interaction.type ===
                "tree"

                    ? 0.95

                    : interaction.target
                        .collectTime ||
                        1.1

        };


        return true;

    }


    function cancelHoldInteraction() {

        state.holdAction =
            null;

    }


    function updateHoldInteraction(
        dt
    ) {

        const action =
            state.holdAction;


        if (
            !action
        ) {

            return;

        }


        if (

            !state.keys.has(
                "e"
            ) ||

            state.paused ||

            state.transition

        ) {

            cancelHoldInteraction();


            return;

        }


        const target =
            action.target;


        if (

            !target ||

            target.alive ===
            false ||

            distance(

                state.player.x,
                state.player.y,

                target.x,
                target.y

            ) >
            92

        ) {

            cancelHoldInteraction();


            return;

        }


        action.time +=
            dt;


        if (
            action.time <
            action.required
        ) {

            return;

        }


        if (
            action.type ===
            "tree"
        ) {

            harvestTree(
                target
            );

        }

        else {

            harvestResource(
                target
            );

        }


        cancelHoldInteraction();

    }


    /* =========================================================
       NPCS
       ========================================================= */

    function updateNPCs(
        dt
    ) {

        if (
            state.houseMode
        ) {

            return;

        }


        state.world.npcs
            .forEach(
                npc => {

                    if (

                        !npc.wander ||

                        npc.wander <=
                        0

                    ) {

                        return;

                    }


                    npc.wanderTimer -=
                        dt;


                    const targetDistance =
                        distance(

                            npc.x,
                            npc.y,

                            npc.targetX,
                            npc.targetY

                        );


                    if (

                        npc.wanderTimer <=
                        0 ||

                        targetDistance <
                        8

                    ) {

                        const angle =
                            random(
                                0,
                                Math.PI *
                                2
                            );


                        npc.targetX =
                            npc.homeX +
                            Math.cos(
                                angle
                            ) *
                            random(
                                20,
                                npc.wander
                            );


                        npc.targetY =
                            npc.homeY +
                            Math.sin(
                                angle
                            ) *
                            random(
                                20,
                                npc.wander
                            );


                        npc.wanderTimer =
                            random(
                                2,
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


                    const nextX =
                        npc.x +
                        direction.x *
                        24 *
                        dt;


                    const nextY =
                        npc.y +
                        direction.y *
                        24 *
                        dt;


                    if (
                        !circleHitsSolidObstacle(
                            nextX,
                            nextY,
                            npc.radius
                        )
                    ) {

                        npc.x =
                            nextX;


                        npc.y =
                            nextY;

                    }

                }
            );

    }


    /* =========================================================
       INTERAÇÃO
       ========================================================= */

    function getInteraction() {

        const player =
            state.player;


        if (

            !player ||

            player.dead

        ) {

            return null;

        }


        if (
            state.houseMode
        ) {

            const door =
                getInteriorDoor();


            if (
                circleRectCollision(

                    player.x,
                    player.y,

                    player.radius +
                    28,

                    door

                )
            ) {

                return {

                    type:
                        "interiorDoor",

                    target:
                        door,

                    label:
                        "SAIR",

                    key:
                        "Z"

                };

            }


            for (
                const furniture of
                getHouseFurniture()
            ) {

                if (

                    furniture.sleep &&

                    circleRectCollision(

                        player.x,
                        player.y,

                        player.radius +
                        48,

                        furniture

                    )

                ) {

                    return {

                        type:
                            "sleep",

                        target:
                            furniture,

                        label:
                            "DORMIR",

                        key:
                            "E"

                    };

                }


                if (

                    furniture.forge &&

                    circleRectCollision(

                        player.x,
                        player.y,

                        player.radius +
                        46,

                        furniture

                    )

                ) {

                    return {

                        type:
                            "forge",

                        target:
                            furniture,

                        label:
                            "USAR FORJA",

                        key:
                            "E"

                    };

                }

            }


            for (
                const npc of
                getHouseInteriorNPCs()
            ) {

                if (
                    distance(

                        player.x,
                        player.y,

                        npc.x,
                        npc.y

                    ) <=
                    92
                ) {

                    return {

                        type:
                            "npc",

                        target:
                            npc,

                        label:
                            `FALAR COM ${npc.name}`,

                        key:
                            "E"

                    };

                }

            }


            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        const consider = (
            type,
            target,
            maxDistance,
            label,
            key =
                "E"
        ) => {

            const targetX =
                target.x +
                (
                    target.w ||
                    0
                ) /
                2;


            const targetY =
                target.y +
                (
                    target.h ||
                    0
                ) /
                2;


            const d =
                distance(

                    player.x,
                    player.y,

                    targetX,
                    targetY

                );


            if (

                d <=
                maxDistance &&

                d <
                bestDistance

            ) {

                bestDistance =
                    d;


                best = {

                    type,

                    target,

                    label,

                    key

                };

            }

        };


        state.world.drops
            .forEach(
                drop =>

                    consider(

                        "drop",

                        drop,

                        76,

                        `COLETAR ${ITEMS[drop.itemId]?.name || "ITEM"}`

                    )
            );


        state.world.foods
            .filter(
                food =>
                    food.alive
            )
            .forEach(
                food =>

                    consider(

                        "food",

                        food,

                        72,

                        "COLHER CENOURA"

                    )
            );


        state.world.resources
            .filter(
                resource =>
                    resource.alive
            )
            .forEach(
                resource =>

                    consider(

                        "resource",

                        resource,

                        80,

                        `SEGURE E — ${ITEMS[resource.type]?.name || "COLETAR"}`

                    )
            );


        state.world.trees
            .filter(
                tree =>
                    tree.alive
            )
            .forEach(
                tree =>

                    consider(

                        "tree",

                        tree,

                        86,

                        "SEGURE E — CORTAR MADEIRA"

                    )
            );


        state.world.npcs
            .forEach(
                npc =>

                    consider(

                        "npc",

                        npc,

                        88,

                        `FALAR COM ${npc.name}`

                    )
            );


        state.world.doors
            .forEach(
                door =>

                    consider(

                        "door",

                        door,

                        96,

                        "ENTRAR",

                        "Z"

                    )
            );


        state.world.gates
            .forEach(
                gate =>

                    consider(

                        "gate",

                        gate,

                        120,

                        "EXAMINAR PORTÃO"

                    )
            );


        state.world.trials
            .forEach(
                trial =>

                    consider(

                        "trial",

                        trial,

                        110,

                        trial.dashAltar

                            ? "EXAMINAR ALTAR"

                            : trial.skyTrial

                                ? "INICIAR DESAFIO"

                                : "EXAMINAR"

                    )
            );


        return best;

    }


    function playerAction() {

        if (
            state.dialogue
        ) {

            advanceDialogue();


            return;

        }


        if (
            state.transition
        ) {

            return;

        }


        const interaction =
            getInteraction();


        if (
            !interaction
        ) {

            return;

        }


        const {
            type,
            target
        } =
            interaction;


        if (

            type ===
            "tree" ||

            type ===
            "resource"

        ) {

            beginHoldInteraction();


            return;

        }


        if (
            type ===
            "drop"
        ) {

            pickupDrop(
                target
            );


            return;

        }


        if (
            type ===
            "food"
        ) {

            collectFood(
                target
            );


            return;

        }


        if (
            type ===
            "sleep"
        ) {

            sleepAtHome();


            return;

        }


        if (
            type ===
            "forge"
        ) {

            openForge();


            return;

        }


        if (
            type ===
            "door"
        ) {

            const building =
                state.world.buildings
                    .find(
                        current =>
                            current.id ===
                            target.buildingId
                    );


            if (
                building
            ) {

                enterHouse(
                    building
                );

            }


            return;

        }


        if (
            type ===
            "interiorDoor"
        ) {

            exitHouse();


            return;

        }


        if (
            type ===
            "npc"
        ) {

            interactWithNPC(
                target
            );


            return;

        }


        if (
            type ===
            "gate"
        ) {

            interactWithGate(
                target
            );


            return;

        }


        if (
            type ===
            "trial"
        ) {

            if (
                target.dashAltar
            ) {

                interactDashAltar();


                return;

            }


            if (
                target.skyTrial
            ) {

                startSkyTrial();

            }

        }

    }


    function handleZ() {

        if (
            state.dialogue
        ) {

            advanceDialogue();


            return;

        }


        const interaction =
            getInteraction();


        if (
            !interaction
        ) {

            return;

        }


        if (
            interaction.type ===
            "door"
        ) {

            const building =
                state.world.buildings
                    .find(
                        current =>
                            current.id ===
                            interaction.target
                                .buildingId
                    );


            if (
                building
            ) {

                enterHouse(
                    building
                );

            }


            return;

        }


        if (
            interaction.type ===
            "interiorDoor"
        ) {

            exitHouse();

        }

    }


    /* =========================================================
       DIÁLOGO
       ========================================================= */

    function startDialogue(
        npc,
        lines =
            null,
        options =
            {}
    ) {

        const dialogueLines =
            Array.isArray(
                lines
            )

                ? lines

                : Array.isArray(
                    npc?.lines
                )

                    ? npc.lines

                    : [
                        String(
                            lines ||
                            "..."
                        )
                    ];


        state.dialogue = {

            speaker:
                npc?.name ||
                "VEYRA",

            lines:
                dialogueLines,

            index:
                0,

            onClose:
                options.onClose ||
                npc?.onClose ||
                null

        };


        const box =
            $("dialogueBox");


        if (
            box
        ) {

            box.classList
                .remove(
                    "hidden"
                );

        }


        renderDialogueLine();

    }


    function renderDialogueLine() {

        if (
            !state.dialogue
        ) {

            return;

        }


        const speaker =
            $("dialogueSpeaker");


        const text =
            $("dialogueText");


        if (
            speaker
        ) {

            speaker.textContent =
                state.dialogue
                    .speaker;

        }


        if (
            text
        ) {

            text.textContent =
                state.dialogue
                    .lines[
                        state.dialogue
                            .index
                    ] ||
                "";

        }

    }


    function advanceDialogue() {

        const dialogue =
            state.dialogue;


        if (
            !dialogue
        ) {

            return;

        }


        dialogue.index++;


        if (
            dialogue.index <
            dialogue.lines.length
        ) {

            renderDialogueLine();


            return;

        }


        const onClose =
            dialogue.onClose;


        state.dialogue =
            null;


        const box =
            $("dialogueBox");


        if (
            box
        ) {

            box.classList
                .add(
                    "hidden"
                );

        }


        if (
            typeof onClose ===
            "function"
        ) {

            onClose();

        }

    }


    /* =========================================================
       NPCS / QUESTS
       ========================================================= */

    function interactWithNPC(
        npc
    ) {

        startDialogue(

            npc,

            npc.lines,

            {
                onClose:
                    () => {

                        if (
                            npc.merchant
                        ) {

                            openShop(
                                npc
                            );


                            return;

                        }


                        if (
                            npc.blacksmith
                        ) {

                            openForge();


                            return;

                        }


                        if (
                            npc.questId
                        ) {

                            openQuest(
                                npc
                            );

                        }

                    }
            }

        );

    }


    function openQuest(
        npc
    ) {

        const quest =
            state.player.quest?.[
                npc.questId
            ];


        if (
            !quest
        ) {

            return;

        }


        state.questNPC =
            npc;


        setPanelOpen(
            $("questPanel"),
            true
        );


        renderQuestPanel();

    }


    function renderQuestPanel() {

        const npc =
            state.questNPC;


        if (
            !npc
        ) {

            return;

        }


        const quest =
            state.player.quest[
                npc.questId
            ];


        const itemId =
            npc.questId ===
            "wood"

                ? "madeira"

                : "carvao";


        const have =
            state.player.inventory[
                itemId
            ] ||
            0;


        const title =
            $("questTitle");


        const text =
            $("questText");


        const status =
            $("questStatus");


        const action =
            $("questActionBtn");


        if (
            title
        ) {

            title.textContent =
                npc.questId ===
                "wood"

                    ? "Madeira para Bran"

                    : "Carvão para Borin";

        }


        if (
            text
        ) {

            text.textContent =
                npc.questId ===
                "wood"

                    ? `Bran precisa de ${quest.need} madeiras para terminar reparos na vila.`

                    : `Borin precisa de ${quest.need} carvões para manter a forja acesa.`;

        }


        if (
            status
        ) {

            status.textContent =
                quest.rewarded

                    ? "Concluída"

                    : `${have} / ${quest.need}`;

        }


        if (
            action
        ) {

            action.disabled =
                Boolean(
                    quest.rewarded
                );


            action.textContent =
                quest.rewarded

                    ? "CONCLUÍDA"

                    : have >=
                        quest.need

                        ? "ENTREGAR"

                        : "AINDA NÃO";

        }

    }


    function questAction() {

        const npc =
            state.questNPC;


        if (
            !npc
        ) {

            return;

        }


        const quest =
            state.player.quest[
                npc.questId
            ];


        if (

            !quest ||

            quest.rewarded

        ) {

            return;

        }


        const itemId =
            npc.questId ===
            "wood"

                ? "madeira"

                : "carvao";


        if (
            (
                state.player
                    .inventory[
                        itemId
                    ] ||
                0
            ) <
            quest.need
        ) {

            showToast(
                "Você ainda não possui material suficiente."
            );


            return;

        }


        removeItem(
            itemId,
            quest.need
        );


        quest.rewarded =
            true;


        quest.state =
            "complete";


        state.player.money +=
            quest.rewardMoney;


        gainXP(
            quest.rewardXP
        );


        showToast(
            `Missão concluída! +${quest.rewardMoney} moedas.`
        );


        renderQuestPanel();

    }


    /* =========================================================
       LOJA
       ========================================================= */

    const DORAN_SHOP = [

        "cenoura",

        "pocao",

        "elixir",

        "pocaoForca",

        "pocaoResistencia",

        "pocaoVelocidade",

        "minimapa",

        "lanterna",

        "armaduraFolha",

        "armaduraAlgodao",

        "armaduraMadeira",

        "armaduraCouro"

    ];


    function setPanelOpen(
        panel,
        open
    ) {

        if (
            !panel
        ) {

            return;

        }


        panel.classList
            .toggle(
                "hidden",
                !open
            );

    }


    function getShopPrice(
        id
    ) {

        if (
            id ===
            "lanterna"
        ) {

            return LANTERN_PRICE;

        }


        if (
            id ===
            "minimapa"
        ) {

            return 180;

        }


        return ITEMS[id]
            ?.value ||
            1;

    }


    function openShop(
        npc =
            NPC_LIBRARY.DORAN
    ) {

        state.shopNPC =
            npc;


        state.shopMode =
            "buy";


        const tabs =
            $("shopTabs");


        if (
            tabs
        ) {

            tabs.classList
                .remove(
                    "hidden"
                );

        }


        setPanelOpen(
            $("shopPanel"),
            true
        );


        renderShop();

    }


    function closeShop() {

        setPanelOpen(
            $("shopPanel"),
            false
        );


        state.shopNPC =
            null;


        state.shopMode =
            "buy";

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

            return;

        }


        state.shopMode =
            mode;


        renderShop();

    }


    function createShopRow(
        item,
        actionText,
        onClick,
        options =
            {}
    ) {

        const row =
            document
                .createElement(
                    "div"
                );


        row.className =
            "shop-row";


        row.innerHTML = `

            <div class="shop-icon">
                ${item.icon || "◆"}
            </div>

            <div class="shop-info">

                <strong>
                    ${item.name}
                </strong>

                <small>
                    ${
                        options.description ||
                        `Peso ${item.weight ?? 0} • Valor base ${item.value ?? 0}`
                    }
                </small>

            </div>

            <div class="shop-price">
                ${actionText}
            </div>

            <button
                class="primary-btn"
                type="button"
            >
                ${options.buttonText || "OK"}
            </button>

        `;


        const button =
            row.querySelector(
                "button"
            );


        if (
            button
        ) {

            button.disabled =
                Boolean(
                    options.disabled
                );


            button.addEventListener(
                "click",
                onClick
            );

        }


        return row;

    }


    function renderShop() {

        const grid =
            $("shopGrid");


        const title =
            $("shopTitle");


        if (
            !grid
        ) {

            return;

        }


        if (
            state.shopMode ===
            "forge"
        ) {

            renderForge();


            return;

        }


        grid.innerHTML =
            "";


        if (
            title
        ) {

            title.textContent =
                state.shopMode ===
                "buy"

                    ? "LOJA DE DORAN"

                    : "VENDER ITENS";

        }


        if (
            state.shopMode ===
            "buy"
        ) {

            DORAN_SHOP
                .forEach(
                    id => {

                        const item =
                            ITEMS[id];


                        if (
                            !item
                        ) {

                            return;

                        }


                        const price =
                            getShopPrice(
                                id
                            );


                        const owned =

                            item.unique &&

                            state.player
                                .inventory[
                                    id
                                ] >
                            0;


                        let description =
                            undefined;


                        if (
                            id ===
                            "armaduraCouro"
                        ) {

                            description =
                                "Melhor armadura vendida por Doran. Borin faz as armaduras avançadas.";

                        }


                        if (
                            id ===
                            "lanterna"
                        ) {

                            description =
                                "Item permanente. Acende automaticamente em áreas escuras.";

                        }


                        if (
                            id ===
                            "minimapa"
                        ) {

                            description =
                                "Libera o minimapa e o mapa de exploração.";

                        }


                        const row =
                            createShopRow(

                                item,

                                owned

                                    ? "JÁ POSSUI"

                                    : `${price} moedas`,

                                () => {

                                    if (
                                        owned
                                    ) {

                                        return;

                                    }


                                    if (
                                        state.player.money <
                                        price
                                    ) {

                                        showToast(
                                            "Moedas insuficientes."
                                        );


                                        return;

                                    }


                                    if (
                                        !canAddItem(
                                            id,
                                            1
                                        )
                                    ) {

                                        showToast(

                                            item.unique &&
                                            state.player
                                                .inventory[
                                                    id
                                                ] >
                                            0

                                                ? "Você já possui esse item."

                                                : "Inventário pesado demais."

                                        );


                                        return;

                                    }


                                    state.player.money -=
                                        price;


                                    addItem(

                                        id,

                                        1,

                                        {
                                            silent:
                                                true
                                        }

                                    );


                                    showToast(
                                        `${item.name} comprado.`
                                    );


                                    renderShop();

                                },

                                {

                                    disabled:
                                        owned,

                                    description

                                }

                            );


                        grid.appendChild(
                            row
                        );

                    }
                );


            return;

        }


        const sellAllButton =
            document
                .createElement(
                    "button"
                );


        sellAllButton.type =
            "button";


        sellAllButton.className =
            "primary-btn sell-all-btn";


        sellAllButton.textContent =
            "VENDER TUDO (EXCETO ITENS PROTEGIDOS)";


        sellAllButton
            .addEventListener(
                "click",
                sellAllEligibleItems
            );


        grid.appendChild(
            sellAllButton
        );


        Object
            .entries(
                state.player.inventory
            )
            .forEach(
                ([
                    id,
                    amount
                ]) => {

                    if (

                        amount <=
                        0 ||

                        !ITEMS[id]

                    ) {

                        return;

                    }


                    const item =
                        ITEMS[id];


                    const protectedItem =
                        isBulkSellProtected(
                            id
                        );


                    const price =
                        Math.max(

                            1,

                            Math.floor(

                                getShopPrice(
                                    id
                                ) *
                                0.7

                            )

                        );


                    const row =
                        createShopRow(

                            item,

                            protectedItem

                                ? "PROTEGIDO"

                                : `Vender por ${price} • x${amount}`,

                            () => {

                                if (
                                    protectedItem
                                ) {

                                    showToast(
                                        "Esse item está protegido."
                                    );


                                    return;

                                }


                                if (
                                    removeItem(
                                        id,
                                        1
                                    )
                                ) {

                                    state.player.money +=
                                        price;


                                    showToast(
                                        `${item.name} vendido.`
                                    );


                                    renderShop();

                                }

                            },

                            {
                                disabled:
                                    protectedItem
                            }

                        );


                    grid.appendChild(
                        row
                    );

                }
            );

    }


    function sellAllEligibleItems() {

        let totalCoins =
            0;


        let totalItems =
            0;


        Object
            .entries(
                state.player.inventory
            )
            .forEach(
                ([
                    id,
                    amount
                ]) => {

                    if (

                        amount <=
                        0 ||

                        !ITEMS[id] ||

                        isBulkSellProtected(
                            id
                        )

                    ) {

                        return;

                    }


                    const price =
                        Math.max(

                            1,

                            Math.floor(

                                getShopPrice(
                                    id
                                ) *
                                0.7

                            )

                        );


                    totalCoins +=
                        price *
                        amount;


                    totalItems +=
                        amount;


                    state.player
                        .inventory[
                            id
                        ] =
                        0;

                }
            );


        if (
            totalItems <=
            0
        ) {

            showToast(
                "Não há itens comuns para vender em massa."
            );


            return;

        }


        state.player.money +=
            totalCoins;


        showToast(
            `${totalItems} itens vendidos por ${totalCoins} moedas.`
        );


        renderShop();

    }


    /* =========================================================
       FORJA
       ========================================================= */

    function openForge() {

        state.shopNPC =
            NPC_LIBRARY.BORIN;


        state.shopMode =
            "forge";


        const tabs =
            $("shopTabs");


        if (
            tabs
        ) {

            tabs.classList
                .add(
                    "hidden"
                );

        }


        setPanelOpen(
            $("shopPanel"),
            true
        );


        renderForge();

    }


    function renderForge() {

        const grid =
            $("shopGrid");


        const title =
            $("shopTitle");


        if (
            !grid
        ) {

            return;

        }


        grid.innerHTML =
            "";


        if (
            title
        ) {

            title.textContent =
                "FORJA DE BORIN";

        }


        ARMOR_UPGRADES
            .forEach(
                recipe => {

                    const item =
                        ITEMS[
                            recipe.id
                        ];


                    const material =
                        ITEMS[
                            recipe.material
                        ];


                    const haveMaterial =
                        state.player
                            .inventory[
                                recipe.material
                            ] ||
                        0;


                    const alreadyOwn =
                        state.player
                            .inventory[
                                recipe.id
                            ] >
                        0;


                    const disabled =

                        alreadyOwn ||

                        haveMaterial <
                        recipe.materialAmount ||

                        state.player.money <
                        recipe.coins;


                    const row =
                        createShopRow(

                            item,

                            alreadyOwn

                                ? "JÁ POSSUI"

                                : `${material.icon} ${haveMaterial}/${recipe.materialAmount} • 💰 ${state.player.money}/${recipe.coins}`,

                            () => {

                                if (
                                    alreadyOwn
                                ) {

                                    return;

                                }


                                if (

                                    state.player
                                        .inventory[
                                            recipe.material
                                        ] <
                                    recipe.materialAmount ||

                                    state.player.money <
                                    recipe.coins

                                ) {

                                    showToast(
                                        "Materiais ou moedas insuficientes."
                                    );


                                    return;

                                }


                                if (
                                    !canAddItem(
                                        recipe.id,
                                        1
                                    )
                                ) {

                                    showToast(
                                        "Inventário pesado demais."
                                    );


                                    return;

                                }


                                removeItem(

                                    recipe.material,

                                    recipe.materialAmount

                                );


                                state.player.money -=
                                    recipe.coins;


                                addItem(

                                    recipe.id,

                                    1,

                                    {
                                        silent:
                                            true
                                    }

                                );


                                showToast(
                                    `${item.name} forjada.`
                                );


                                renderForge();

                            },

                            {

                                disabled,

                                description:
                                    `${recipe.materialAmount} ${material.name} + ${recipe.coins} moedas`

                            }

                        );


                    grid.appendChild(
                        row
                    );

                }
            );

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function getMaterialCount(
        id
    ) {

        return state.player
            ?.inventory?.[
                id
            ] ||
            0;

    }


    function formatMaterialRequirement(
        id,
        required
    ) {

        const current =
            getMaterialCount(
                id
            );


        const missing =
            Math.max(
                0,
                required -
                current
            );


        return `${ITEMS[id]?.icon || "◆"} ${ITEMS[id]?.name || id}: ${current} / ${required} — faltam ${missing}`;

    }


    function cycleGateDialogue(
        side,
        dialogues
    ) {

        const index =
            state.player
                .gateDialogueIndex[
                    side
                ] ||
            0;


        const lines =
            dialogues[
                index %
                dialogues.length
            ];


        state.player
            .gateDialogueIndex[
                side
            ] =
            (
                index +
                1
            ) %
            dialogues.length;


        startDialogue(
            {
                name:
                    "VEYRA"
            },
            lines
        );

    }


    function interactWithGate(
        gate
    ) {

        const side =
            gate.side;


        if (
            side ===
            "north"
        ) {

            if (
                state.player
                    .gateUnlocks
                    .north
            ) {

                transitionToRegion(

                    "shadow",

                    {
                        label:
                            "O CAMINHO DO NORTE"
                    }

                );


                return;

            }


            if (
                !state.player
                    .abilities
                    .dash
            ) {

                cycleGateDialogue(

                    "north",

                    NORTH_GATE_DIALOGUES

                );


                return;

            }


            const enoughDiamond =

                getMaterialCount(
                    "diamante"
                ) >=

                NORTH_GATE_COST
                    .diamante;


            const enoughRuby =

                getMaterialCount(
                    "rubi"
                ) >=

                NORTH_GATE_COST
                    .rubi;


            if (

                !enoughDiamond ||

                !enoughRuby

            ) {

                startDialogue(

                    {
                        name:
                            "PORTÃO DO NORTE"
                    },

                    [

                        "Você domina a técnica necessária, mas sua preparação ainda está incompleta.",

                        formatMaterialRequirement(
                            "diamante",
                            NORTH_GATE_COST
                                .diamante
                        ),

                        formatMaterialRequirement(
                            "rubi",
                            NORTH_GATE_COST
                                .rubi
                        )

                    ]

                );


                return;

            }


            startDialogue(

                {
                    name:
                        "PORTÃO DO NORTE"
                },

                [

                    "A técnica que você aprendeu responde às marcas do portão.",

                    "Os materiais começam a vibrar dentro da mochila.",

                    "A passagem pode ser aberta."

                ],

                {

                    onClose:
                        () => {

                            if (

                                getMaterialCount(
                                    "diamante"
                                ) <
                                NORTH_GATE_COST
                                    .diamante ||

                                getMaterialCount(
                                    "rubi"
                                ) <
                                NORTH_GATE_COST
                                    .rubi

                            ) {

                                return;

                            }


                            removeItem(

                                "diamante",

                                NORTH_GATE_COST
                                    .diamante

                            );


                            removeItem(

                                "rubi",

                                NORTH_GATE_COST
                                    .rubi

                            );


                            state.player
                                .gateUnlocks
                                .north =
                                true;


                            createEffect({

                                type:
                                    "gateOpen",

                                x:
                                    1600,

                                y:
                                    110,

                                color:
                                    "#b49ad7",

                                life:
                                    1.2,

                                maxLife:
                                    1.2,

                                radius:
                                    40,

                                maxRadius:
                                    180

                            });


                            showToast(
                                "O Portão do Norte foi desbloqueado."
                            );

                        }

                }

            );


            return;

        }


        if (
            side ===
            "west"
        ) {

            cycleGateDialogue(

                "west",

                BLOCKED_ROUTE_DIALOGUES
                    .west

            );


            return;

        }


        cycleGateDialogue(

            "south",

            BLOCKED_ROUTE_DIALOGUES
                .south

        );

    }


    function updateVillageSpecialPaths() {

        if (

            state.area !==
            "village" ||

            state.houseMode ||

            state.transition ||

            state.portalCooldown >
            0

        ) {

            return;

        }


        if (
            state.player
                .gateUnlocks
                .north
        ) {

            const gate =
                state.world.gates
                    .find(
                        current =>
                            current.side ===
                            "north"
                    );


            if (

                gate &&

                circleRectCollision(

                    state.player.x,
                    state.player.y,
                    state.player.radius,

                    gate

                )

            ) {

                transitionToRegion(

                    "shadow",

                    {
                        label:
                            "O CAMINHO DO NORTE"
                    }

                );

            }

        }

    }


    /* =========================================================
       ALTAR DO MONARCA
       ========================================================= */

    function interactDashAltar() {

        const player =
            state.player;


        if (
            player.abilities
                .dash
        ) {

            startDialogue(

                {
                    name:
                        "ALTAR ESQUECIDO"
                },

                [

                    "As inscrições permanecem apagadas.",

                    "A técnica que dormia aqui agora pertence a você."

                ]

            );


            return;

        }


        /*
            MONARCA JÁ FOI DERROTADO.
        */

        if (
            player.monarchDefeated
        ) {

            const enoughRuby =

                getMaterialCount(
                    "rubi"
                ) >=

                DASH_RITUAL_COST
                    .rubi;


            const enoughDiamond =

                getMaterialCount(
                    "diamante"
                ) >=

                DASH_RITUAL_COST
                    .diamante;


            if (

                !enoughRuby ||

                !enoughDiamond

            ) {

                startDialogue(

                    {
                        name:
                            "ALTAR ESQUECIDO"
                    },

                    [

                        "O poder do Monarca se desfez, mas o altar ainda exige a oferenda completa.",

                        formatMaterialRequirement(
                            "rubi",
                            DASH_RITUAL_COST
                                .rubi
                        ),

                        formatMaterialRequirement(
                            "diamante",
                            DASH_RITUAL_COST
                                .diamante
                        )

                    ]

                );


                return;

            }


            removeItem(

                "rubi",

                DASH_RITUAL_COST
                    .rubi

            );


            removeItem(

                "diamante",

                DASH_RITUAL_COST
                    .diamante

            );


            player.abilities.dash =
                true;


            player.dashPurchased =
                true;


            createEffect({

                type:
                    "dashUnlock",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    "#b79cff",

                life:
                    1.6,

                maxLife:
                    1.6,

                radius:
                    24,

                maxRadius:
                    210

            });


            createBurst(

                player.x,
                player.y,

                "#d7c4ff",

                36,

                160,

                {
                    shape:
                        "spark"
                }

            );


            startDialogue(

                {
                    name:
                        "VEYRA"
                },

                [

                    "A oferenda desaparece dentro das inscrições.",

                    "Seu corpo aprende um movimento que sua memória nunca conheceu.",

                    "DASH DESBLOQUEADO — pressione ESPAÇO para esquivar na direção do mouse."

                ]

            );


            return;

        }


        const enoughRuby =

            getMaterialCount(
                "rubi"
            ) >=

            DASH_RITUAL_COST
                .rubi;


        const enoughDiamond =

            getMaterialCount(
                "diamante"
            ) >=

            DASH_RITUAL_COST
                .diamante;


        if (

            !enoughRuby ||

            !enoughDiamond

        ) {

            startDialogue(

                {
                    name:
                        "ALTAR ESQUECIDO"
                },

                [

                    "As inscrições do altar despertam sob seus pés.",

                    "Por um instante, uma força tenta alcançar você... mas o brilho desaparece.",

                    "A oferenda é insuficiente para despertar o poder adormecido.",

                    formatMaterialRequirement(
                        "rubi",
                        DASH_RITUAL_COST
                            .rubi
                    ),

                    formatMaterialRequirement(
                        "diamante",
                        DASH_RITUAL_COST
                            .diamante
                    )

                ]

            );


            return;

        }


        if (

            player.monarchAwakened &&

            state.world.enemies
                .some(
                    enemy =>

                        enemy.id ===
                        "monarch" &&

                        !enemy.dead
                )

        ) {

            showToast(
                "O MONARCA ainda está desperto."
            );


            return;

        }


        /*
            NÃO GASTA OS MATERIAIS AQUI.
            GASTA SÓ DEPOIS DE MATAR O MONARCA.
        */

        startDialogue(

            {
                name:
                    "ALTAR ESQUECIDO"
            },

            [

                "A OFERENDA FOI ACEITA...",

                "…MAS NÃO POR VOCÊ.",

                "O MONARCA DESPERTOU"

            ],

            {

                onClose:
                    () => {

                        spawnMonarch();


                        addScreenShake(
                            12,
                            0.8
                        );


                        createEffect({

                            type:
                                "monarchAwakening",

                            x:
                                3050,

                            y:
                                880,

                            color:
                                "#8a67a8",

                            life:
                                1.5,

                            maxLife:
                                1.5,

                            radius:
                                20,

                            maxRadius:
                                250

                        });

                    }

            }

        );

    }


    /* =========================================================
       PORTAIS
       ========================================================= */

    function portalRequirementMet(
        portal
    ) {

        if (
            typeof portal.requirement !==
            "function"
        ) {

            return true;

        }


        try {

            return Boolean(
                portal.requirement()
            );

        }

        catch (
            error
        ) {

            console.error(
                "Erro ao verificar portal:",
                error
            );


            return false;

        }

    }


    function updatePortals() {

        if (

            state.houseMode ||

            state.transition ||

            state.portalCooldown >
            0

        ) {

            return;

        }


        const player =
            state.player;


        for (
            const portal of
            state.world.portals
        ) {

            if (
                portal.hidden
            ) {

                continue;

            }


            if (
                !circleRectCollision(

                    player.x,
                    player.y,
                    player.radius,

                    portal

                )
            ) {

                continue;

            }


            if (
                !portalRequirementMet(
                    portal
                )
            ) {

                state.portalCooldown =
                    0.7;


                showToast(
                    "A passagem ainda está bloqueada."
                );


                return;

            }


            transitionToRegion(

                portal.target,

                {

                    label:
                        portal.title,

                    spawn:
                        portal.spawn ||
                        undefined

                }

            );


            return;

        }

    }


    /* =========================================================
       CONFIRMAÇÃO DE BOSS
       ========================================================= */

    function openBattle(
        enemy
    ) {

        if (

            !enemy ||

            enemy.dead ||

            state.battle

        ) {

            return;

        }


        discoverBoss(
            enemy.id
        );


        state.battle = {
            enemy
        };


        state.paused =
            true;


        state.pauseReason =
            "battleConfirm";


        setPanelOpen(
            $("battlePanel"),
            true
        );


        const icon =
            $("battleIcon");


        const title =
            $("battleTitle");


        const text =
            $("battleText");


        if (
            icon
        ) {

            icon.textContent =
                enemy.icon ||
                "◆";

        }


        if (
            title
        ) {

            title.textContent =
                enemy.name;

        }


        if (
            text
        ) {

            text.textContent =
                "Deseja enfrentar este boss?";

        }

    }


    function acceptBattle() {

        const enemy =
            state.battle
                ?.enemy;


        if (
            !enemy
        ) {

            return;

        }


        setPanelOpen(
            $("battlePanel"),
            false
        );


        state.battle =
            null;


        state.paused =
            false;


        state.pauseReason =
            null;


        if (

            enemy.id ===
            "other_self" &&

            !state.finalChoiceShown

        ) {

            openFinalChoice(
                enemy
            );


            return;

        }


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        enemy.state =
            "chasing";


        state.bossBarTarget =
            enemy;

    }


    function declineBattle() {

        setPanelOpen(
            $("battlePanel"),
            false
        );


        state.battle =
            null;


        state.paused =
            false;


        state.pauseReason =
            null;

    }


    /* =========================================================
       ROTA 2 — CAVERNA SOMBRIA

       Nenhuma nova habilidade de movimento
       é inventada aqui.
       ========================================================= */

    function buildShadow() {

        const rng =
            getAreaRng(
                "shadow",
                "layout"
            );


        addPath(

            "shadowRoad",

            [

                {
                    x:
                        1500,
                    y:
                        1900
                },

                {
                    x:
                        1450,
                    y:
                        1520
                },

                {
                    x:
                        1190,
                    y:
                        1230
                },

                {
                    x:
                        1430,
                    y:
                        900
                },

                {
                    x:
                        1790,
                    y:
                        690
                },

                {
                    x:
                        2150,
                    y:
                        520
                },

                {
                    x:
                        2750,
                    y:
                        430
                }

            ],

            108,

            {
                surface:
                    "shadowStone"
            }

        );


        addPortal(

            1420,
            1860,

            170,
            72,

            "village",

            null,

            "VILA DO CREPÚSCULO",

            {

                id:
                    "shadow_to_village",

                spawn: {

                    x:
                        1600,

                    y:
                        190

                }

            }

        );


        for (
            let i = 0;
            i <
            24;
            i++
        ) {

            addGeneratedRock(

                rng,

                `shadow_rock_${i}`,

                {

                    type:
                        "shadowRock",

                    minX:
                        150,

                    maxX:
                        2850,

                    minY:
                        150,

                    maxY:
                        1840,

                    blocksLight:
                        true

                }

            );

        }


        for (
            let i = 0;
            i <
            11;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                2

                    ? "mineWraith"

                    : "bat",

                i,

                {

                    minX:
                        350,

                    maxX:
                        2620,

                    minY:
                        250,

                    maxY:
                        1700,

                    drop:
                        "essencia",

                    dropChance:
                        0.5

                }

            );

        }


        spawnProgressionBoss({

            id:
                "shadow_lord",

            name:
                "SENHOR DAS SOMBRAS",

            spriteType:
                "shadowLord",

            icon:
                "◐",

            x:
                2550,

            y:
                470,

            hp:
                1750,

            maxHp:
                1750,

            damage:
                48,

            speed:
                88,

            vision:
                420,

            attackRange:
                100,

            radius:
                43,

            color:
                "#655b91",

            xp:
                780,

            money:
                560,

            bossPattern:
                "shadowDash",

            unlock:
                "fairy"

        });


        addPortal(

            2780,
            350,

            100,
            210,

            "fairy",

            () =>
                hasDefeatedBoss(
                    "shadow_lord"
                ),

            "REINO DAS FADAS",

            {

                id:
                    "shadow_to_fairy",

                spawn: {

                    x:
                        180,

                    y:
                        1100

                }

            }

        );


        addBiomeDetails(

            rng,

            95,

            [

                "shadowMist",

                "purpleShard",

                "darkPebble",

                "oldRune"

            ],

            {

                minSize:
                    6,

                maxSize:
                    18,

                avoidObstacles:
                    false

            }

        );

    }


    /* =========================================================
       REINO DAS FADAS
       ========================================================= */

    function buildFairy() {

        const rng =
            getAreaRng(
                "fairy",
                "layout"
            );


        addPath(

            "fairyRoad",

            [

                {
                    x:
                        110,
                    y:
                        1100
                },

                {
                    x:
                        520,
                    y:
                        1030
                },

                {
                    x:
                        880,
                    y:
                        1260
                },

                {
                    x:
                        1260,
                    y:
                        1180
                },

                {
                    x:
                        1610,
                    y:
                        880
                },

                {
                    x:
                        1980,
                    y:
                        1030
                },

                {
                    x:
                        2370,
                    y:
                        1260
                },

                {
                    x:
                        3080,
                    y:
                        1130
                }

            ],

            112,

            {
                surface:
                    "fairyStone"
            }

        );


        addPortal(

            72,
            1000,

            80,
            205,

            "shadow",

            null,

            "CAVERNA SOMBRIA",

            {

                id:
                    "fairy_to_shadow",

                spawn: {

                    x:
                        2700,

                    y:
                        470

                }

            }

        );


        for (
            let i = 0;
            i <
            42;
            i++
        ) {

            addGeneratedTree(

                rng,

                `fairy_tree_${i}`,

                {

                    type:
                        "fairyTree",

                    safeRadius:
                        44,

                    minX:
                        130,

                    maxX:
                        3070,

                    minY:
                        130,

                    maxY:
                        2070

                }

            );

        }


        for (
            let i = 0;
            i <
            10;
            i++
        ) {

            spawnEnemyType(

                rng,

                i %
                2

                    ? "moth"

                    : "thornling",

                i,

                {

                    minX:
                        380,

                    maxX:
                        2800,

                    minY:
                        260,

                    maxY:
                        1950,

                    drop:
                        "essencia",

                    dropChance:
                        0.55

                }

            );

        }


        spawnProgressionBoss({

            id:
                "fairy_guardian",

            name:
                "GUARDIÃ FEÉRICA",

            spriteType:
                "fairyGuardian",

            icon:
                "✧",

            x:
                2820,

            y:
                1130,

            hp:
                2100,

            maxHp:
                2100,

            damage:
                52,

            speed:
                102,

            vision:
                440,

            attackRange:
                95,

            radius:
                41,

            color:
                "#d38cc9",

            xp:
                930,

            money:
                650,

            bossPattern:
                "fairyDash",

            unlock:
                "sky"

        });


        addPortal(

            3070,
            1020,

            82,
            220,

            "sky",

            () =>
                hasDefeatedBoss(
                    "fairy_guardian"
                ),

            "CAMINHO PARA O CÉU",

            {

                id:
                    "fairy_to_sky",

                spawn: {

                    x:
                        180,

                    y:
                        1100

                }

            }

        );


        addBiomeDetails(

            rng,

            130,

            [

                "fairyFlower",

                "glowMushroom",

                "sparkGrass",

                "petal",

                "smallCrystal"

            ],

            {

                minSize:
                    5,

                maxSize:
                    18,

                avoidObstacles:
                    false

            }

        );

    }


    /* =========================================================
       CÉU
       ========================================================= */

    function buildSky() {

        const rng =
            getAreaRng(
                "sky",
                "layout"
            );


        addPath(

            "cloudRoad",

            [

                {
                    x:
                        110,
                    y:
                        1100
                },

                {
                    x:
                        590,
                    y:
                        1040
                },

                {
                    x:
                        990,
                    y:
                        1190
                },

                {
                    x:
                        1420,
                    y:
                        1030
                },

                {
                    x:
                        1850,
                    y:
                        1160
                },

                {
                    x:
                        2280,
                    y:
                        980
                },

                {
                    x:
                        2740,
                    y:
                        1110
                },

                {
                    x:
                        3270,
                    y:
                        1080
                }

            ],

            130,

            {
                surface:
                    "cloudStone"
            }

        );


        addPortal(

            72,
            1000,

            80,
            205,

            "fairy",

            null,

            "REINO DAS FADAS",

            {

                id:
                    "sky_to_fairy",

                spawn: {

                    x:
                        2970,

                    y:
                        1130

                }

            }

        );


        state.world.trials
            .push({

                id:
                    "sky_trial",

                x:
                    1580,

                y:
                    1080,

                radius:
                    90,

                title:
                    "MARCA DO CÉU",

                skyTrial:
                    true

            });


        addDecoration(

            1580,
            1080,

            "skyTrialSeal",

            {
                radius:
                    78
            }

        );


        if (
            state.player
                .skyTrial
                .complete
        ) {

            spawnPathGuardian();

        }


        addBiomeDetails(

            rng,

            105,

            [

                "cloudWisp",

                "skyFlower",

                "windRune",

                "lightFeather"

            ],

            {

                minSize:
                    6,

                maxSize:
                    20,

                avoidObstacles:
                    false

            }

        );

    }


    function startSkyTrial() {

        const trial =
            state.player.skyTrial;


        if (
            trial.complete
        ) {

            showToast(
                "O desafio do Céu já foi concluído."
            );


            return;

        }


        if (
            trial.activeWave >
            0
        ) {

            showToast(
                `Horda ${trial.activeWave}/5 em andamento.`
            );


            return;

        }


        trial.started =
            true;


        spawnNextSkyWave();

    }


    function spawnNextSkyWave() {

        const trial =
            state.player.skyTrial;


        if (
            trial.wave >=
            5
        ) {

            trial.complete =
                true;


            trial.activeWave =
                0;


            spawnPathGuardian();


            showToast(
                "As cinco hordas foram vencidas."
            );


            return;

        }


        trial.wave++;


        trial.activeWave =
            trial.wave;


        const rng =
            getAreaRng(

                "sky",

                `wave_${trial.wave}_${Math.floor(state.time)}`

            );


        const count =
            4 +
            trial.wave;


        for (
            let i = 0;
            i <
            count;
            i++
        ) {

            const angle =
                Math.PI *
                2 *
                i /
                count;


            const radius =
                220 +
                rngRange(
                    rng,
                    10,
                    130
                );


            const x =
                1580 +
                Math.cos(
                    angle
                ) *
                radius;


            const y =
                1080 +
                Math.sin(
                    angle
                ) *
                radius;


            addEnemy({

                id:
                    `sky_wave_${trial.wave}_${i}`,

                name:
                    trial.wave >=
                    4

                        ? "VIGIA CELESTE"

                        : "ECO DO CÉU",

                spriteType:
                    trial.wave %
                    2

                        ? "skyWisp"

                        : "skyKnight",

                icon:
                    "◇",

                type:
                    "trial",

                x,

                y,

                hp:
                    180 +
                    trial.wave *
                    55,

                maxHp:
                    180 +
                    trial.wave *
                    55,

                damage:
                    25 +
                    trial.wave *
                    4,

                speed:
                    90 +
                    trial.wave *
                    4,

                vision:
                    700,

                attackRange:
                    70,

                radius:
                    22,

                color:
                    "#dce8ef",

                xp:
                    35 +
                    trial.wave *
                    8,

                money:
                    12 +
                    trial.wave *
                    4,

                accepted:
                    true,

                aggressive:
                    true,

                skyWave:
                    trial.wave

            });

        }


        showToast(
            `HORDA ${trial.wave} / 5`
        );

    }


    function updateSkyTrial(
        dt
    ) {

        if (

            state.area !==
            "sky" ||

            !state.player
                .skyTrial
                .started ||

            state.player
                .skyTrial
                .complete

        ) {

            return;

        }


        const trial =
            state.player.skyTrial;


        if (
            trial.activeWave >
            0
        ) {

            const living =
                state.world.enemies
                    .some(
                        enemy =>

                            !enemy.dead &&

                            enemy.skyWave ===
                            trial.activeWave
                    );


            if (
                living
            ) {

                return;

            }


            trial.activeWave =
                0;


            state.skyWaveDelay =
                1.35;

        }


        if (
            state.skyWaveDelay !=
            null
        ) {

            state.skyWaveDelay -=
                dt;


            if (
                state.skyWaveDelay >
                0
            ) {

                return;

            }


            state.skyWaveDelay =
                null;


            if (
                trial.wave >=
                5
            ) {

                trial.complete =
                    true;


                spawnPathGuardian();


                showToast(
                    "As cinco hordas foram vencidas."
                );

            }

            else {

                spawnNextSkyWave();

            }

        }

    }


    function spawnPathGuardian() {

        if (

            hasDefeatedBoss(
                "path_guardian"
            ) ||

            state.world.enemies
                .some(
                    enemy =>

                        enemy.id ===
                        "path_guardian" &&

                        !enemy.dead
                )

        ) {

            return;

        }


        spawnProgressionBoss({

            id:
                "path_guardian",

            name:
                "GUARDIÃO DO CAMINHO",

            spriteType:
                "pathGuardian",

            icon:
                "☼",

            x:
                2950,

            y:
                1080,

            hp:
                2450,

            maxHp:
                2450,

            damage:
                58,

            speed:
                92,

            vision:
                460,

            attackRange:
                105,

            radius:
                44,

            color:
                "#e0e6dd",

            xp:
                1050,

            money:
                720,

            bossPattern:
                "pathGuardian"

        });

    }


    /* =========================================================
       FLAUTA DA MEMÓRIA
       ========================================================= */

    function playMemoryFlute() {

        const player =
            state.player;


        if (

            !player ||

            player.inventory
                .flautaMemoria <=
            0

        ) {

            return false;

        }


        if (
            player.flutePlayed
        ) {

            showToast(
                "A melodia já revelou o que estava escondido."
            );


            return true;

        }


        player.flutePlayed =
            true;


        createEffect({

            type:
                "memoryFlute",

            x:
                player.x,

            y:
                player.y,

            color:
                "#e8d8a8",

            life:
                1.8,

            maxLife:
                1.8,

            radius:
                20,

            maxRadius:
                240

        });


        startDialogue(

            {
                name:
                    "FLAUTA DA MEMÓRIA"
            },

            [

                "A melodia não parece viajar pelo ar.",

                "Ela atravessa alguma coisa que estava esquecida.",

                "Na Vila do Crepúsculo, uma passagem ao sul começa a se revelar."

            ]

        );


        return true;

    }


    function getHellStairPortal() {

        if (

            state.area !==
            "village" ||

            !state.player
                ?.flutePlayed

        ) {

            return null;

        }


        return {

            id:
                "hell_stairs",

            x:
                1510,

            y:
                1920,

            w:
                180,

            h:
                115,

            target:
                "hell",

            title:
                "ESCADARIA ESQUECIDA"

        };

    }


    function updateHellStairs() {

        const portal =
            getHellStairPortal();


        if (

            !portal ||

            state.transition ||

            state.portalCooldown >
            0 ||

            state.houseMode

        ) {

            return;

        }


        if (
            circleRectCollision(

                state.player.x,
                state.player.y,
                state.player.radius,

                portal

            )
        ) {

            transitionToRegion(

                "hell",

                {

                    label:
                        "A ESCADARIA ESQUECIDA",

                    spawn: {

                        x:
                            1800,

                        y:
                            2200,

                        facing:
                            "up"

                    }

                }

            );

        }

    }


    /* =========================================================
       INFERNO
       ========================================================= */

    function buildHell() {

        const rng =
            getAreaRng(
                "hell",
                "layout"
            );


        addPath(

            "hellRoad",

            [

                {
                    x:
                        1800,
                    y:
                        2300
                },

                {
                    x:
                        1760,
                    y:
                        1910
                },

                {
                    x:
                        1480,
                    y:
                        1620
                },

                {
                    x:
                        1760,
                    y:
                        1330
                },

                {
                    x:
                        2070,
                    y:
                        1040
                },

                {
                    x:
                        1810,
                    y:
                        720
                },

                {
                    x:
                        1800,
                    y:
                        210
                }

            ],

            130,

            {
                surface:
                    "obsidianRoad"
            }

        );


        addPortal(

            1710,
            2240,

            180,
            90,

            "village",

            null,

            "VILA DO CREPÚSCULO",

            {

                id:
                    "hell_to_village",

                spawn: {

                    x:
                        1600,

                    y:
                        1880

                }

            }

        );


        for (
            let i = 0;
            i <
            26;
            i++
        ) {

            addGeneratedRock(

                rng,

                `hell_rock_${i}`,

                {

                    type:
                        i %
                        4 ===
                        0

                            ? "lavaRock"

                            : "obsidianRock",

                    minX:
                        160,

                    maxX:
                        3440,

                    minY:
                        150,

                    maxY:
                        2240,

                    blocksLight:
                        true

                }

            );

        }


        const types = [

            {

                name:
                    "DIABRETE CINZENTO",

                spriteType:
                    "hellImp",

                color:
                    "#aa4932",

                hp:
                    240,

                damage:
                    36,

                speed:
                    112,

                range:
                    70,

                key:
                    "imp"

            },

            {

                name:
                    "CÃO INFERNAL",

                spriteType:
                    "hellHound",

                color:
                    "#8a382c",

                hp:
                    300,

                damage:
                    42,

                speed:
                    126,

                range:
                    72,

                key:
                    "hound"

            },

            {

                name:
                    "CAVALEIRO CINZENTO",

                spriteType:
                    "hellKnight",

                color:
                    "#6f4a43",

                hp:
                    390,

                damage:
                    48,

                speed:
                    84,

                range:
                    78,

                key:
                    "knight"

            },

            {

                name:
                    "ESPECTRO CARMESIM",

                spriteType:
                    "hellWraith",

                color:
                    "#b5443f",

                hp:
                    270,

                damage:
                    45,

                speed:
                    106,

                range:
                    155,

                key:
                    "wraith"

            },

            {

                name:
                    "BRUTO DO ABISMO",

                spriteType:
                    "hellBrute",

                color:
                    "#75513f",

                hp:
                    480,

                damage:
                    58,

                speed:
                    70,

                range:
                    85,

                key:
                    "brute"

            }

        ];


        types.forEach(
            (
                type,
                typeIndex
            ) => {

                for (
                    let i = 0;
                    i <
                    4;
                    i++
                ) {

                    const position =
                        findSafeSpawnPosition(

                            rng,

                            {

                                radius:
                                    42,

                                minX:
                                    300,

                                maxX:
                                    3300,

                                minY:
                                    300,

                                maxY:
                                    2080,

                                avoidEntities:
                                    true

                            }

                        );


                    if (
                        !position
                    ) {

                        continue;

                    }


                    addEnemy({

                        id:
                            `hell_${type.key}_${i}`,

                        name:
                            type.name,

                        spriteType:
                            type.spriteType,

                        icon:
                            "◆",

                        type:
                            "normal",

                        x:
                            position.x,

                        y:
                            position.y,

                        hp:
                            type.hp,

                        maxHp:
                            type.hp,

                        damage:
                            type.damage,

                        speed:
                            type.speed,

                        vision:
                            330,

                        attackRange:
                            type.range,

                        radius:
                            type.key ===
                            "brute"

                                ? 28

                                : 22,

                        color:
                            type.color,

                        xp:
                            85 +
                            typeIndex *
                            15,

                        money:
                            24 +
                            typeIndex *
                            8,

                        hellType:
                            type.key,

                        accepted:
                            true,

                        drop:
                            typeIndex %
                            2

                                ? "rubi"

                                : "diamante",

                        dropChance:
                            0.32

                    });

                }

            }
        );


        spawnProgressionBoss({

            id:
                "hell_guardian",

            name:
                "GUARDIÃO SUPREMO",

            spriteType:
                "hellGuardian",

            icon:
                "♨",

            x:
                1800,

            y:
                420,

            hp:
                3900,

            maxHp:
                3900,

            damage:
                67,

            speed:
                92,

            vision:
                520,

            attackRange:
                112,

            radius:
                52,

            color:
                "#b44c35",

            xp:
                1500,

            money:
                1150,

            bossPattern:
                "hellGuardian"

        });


        addPortal(

            1710,
            72,

            180,
            90,

            "final",

            () =>
                canEnterFinalChamber(),

            "CÂMARA FINAL",

            {

                id:
                    "hell_to_final",

                spawn: {

                    x:
                        1100,

                    y:
                        1320,

                    facing:
                        "up"

                }

            }

        );


        addBiomeDetails(

            rng,

            130,

            [

                "ash",

                "ember",

                "lavaCrack",

                "boneFragment",

                "obsidianShard"

            ],

            {

                minSize:
                    5,

                maxSize:
                    19,

                avoidObstacles:
                    false

            }

        );

    }


    function getHellProgressStatus() {

        const required = [

            "imp",

            "hound",

            "knight",

            "wraith",

            "brute"

        ];


        const defeated =
            required
                .filter(
                    id =>
                        state.player
                            .hellTypesDefeated[
                                id
                            ]
                );


        return {

            required,

            defeated,

            count:
                defeated.length,

            complete:
                defeated.length ===
                required.length

        };

    }


    function canEnterFinalChamber() {

        const progress =
            getHellProgressStatus();


        return (

            progress.complete &&

            hasDefeatedBoss(
                "hell_guardian"
            )

        );

    }


    /* =========================================================
       CÂMARA FINAL
       ========================================================= */

    function buildFinal() {

        const rng =
            getAreaRng(
                "final",
                "layout"
            );


        addPath(

            "finalRoad",

            [

                {
                    x:
                        1100,
                    y:
                        1420
                },

                {
                    x:
                        1100,
                    y:
                        1050
                },

                {
                    x:
                        1100,
                    y:
                        720
                },

                {
                    x:
                        1100,
                    y:
                        330
                }

            ],

            150,

            {
                surface:
                    "finalStone"
            }

        );


        addPortal(

            1010,
            1360,

            180,
            78,

            "hell",

            null,

            "INFERNO",

            {

                id:
                    "final_to_hell",

                spawn: {

                    x:
                        1800,

                    y:
                        200

                }

            }

        );


        spawnProgressionBoss({

            id:
                "other_self",

            name:
                "O OUTRO EU",

            spriteType:
                "otherSelf",

            icon:
                "◈",

            x:
                1100,

            y:
                470,

            hp:
                5200,

            maxHp:
                5200,

            damage:
                72,

            speed:
                104,

            vision:
                620,

            attackRange:
                105,

            radius:
                34,

            color:
                state.player
                    .color,

            xp:
                2500,

            money:
                0,

            bossPattern:
                "otherSelf",

            finalBoss:
                true

        });


        addBiomeDetails(

            rng,

            70,

            [

                "memoryFragment",

                "mirrorShard",

                "darkDust"

            ],

            {

                minSize:
                    6,

                maxSize:
                    18,

                avoidObstacles:
                    false

            }

        );

    }


    function openFinalChoice(
        enemy
    ) {

        state.finalChoiceShown =
            true;


        startDialogue(

            {
                name:
                    "O OUTRO EU"
            },

            [

                "Você chegou até aqui para salvar aquilo que ainda consegue lembrar.",

                "Mas eu posso acabar com a dor de perder.",

                "Aceite a Quietude. Ou prove que ainda existe algo pelo qual lutar."

            ],

            {

                onClose:
                    () => {

                        const join =
                            window.confirm(

                                "ACEITAR A QUIETUDE?\n\nOK = aceitar\nCancelar = lutar"

                            );


                        state.player
                            .finalChoice =
                            join

                                ? "join"

                                : "fight";


                        if (
                            join
                        ) {

                            state.paused =
                                true;


                            startDialogue(

                                {
                                    name:
                                        "VEYRA"
                                },

                                [

                                    "Você escolheu a Quietude Absoluta.",

                                    "Veyra finalmente ficou em silêncio."

                                ]

                            );


                            return;

                        }


                        state.paused =
                            false;


                        enemy.accepted =
                            true;


                        enemy.aggressive =
                            true;


                        state.bossBarTarget =
                            enemy;

                    }

            }

        );

    }


    /* =========================================================
       CHECKPOINTS
       ========================================================= */

    function updateCheckpoint() {

        const player =
            state.player;


        if (

            !player ||

            player.dead

        ) {

            return;

        }


        if (

            state.houseMode &&

            state.currentHouse?.id ===
            "home"

        ) {

            player.checkpoint = {

                area:
                    "village",

                x:
                    player.x,

                y:
                    player.y,

                houseId:
                    "home",

                insideHouse:
                    true

            };


            return;

        }

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


        if (
            state.houseMode
        ) {

            const room =
                getHouseRoom();


            const targetX =

                room.x +

                room.w /
                2 -

                window.innerWidth /
                2;


            const targetY =

                room.y +

                room.h /
                2 -

                window.innerHeight /
                2;


            state.camera.x =
                lerp(

                    state.camera.x,

                    targetX,

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

                    targetY,

                    clamp(
                        dt *
                        8,
                        0,
                        1
                    )

                );


            return;

        }


        const maxX =
            Math.max(

                0,

                state.world.width -
                window.innerWidth

            );


        const maxY =
            Math.max(

                0,

                state.world.height -
                window.innerHeight

            );


        const targetX =
            clamp(

                player.x -
                window.innerWidth /
                2,

                0,

                maxX

            );


        const targetY =
            clamp(

                player.y -
                window.innerHeight /
                2,

                0,

                maxY

            );


        const follow =
            1 -
            Math.pow(
                0.001,
                dt
            );


        state.camera.x =
            lerp(
                state.camera.x,
                targetX,
                follow
            );


        state.camera.y =
            lerp(
                state.camera.y,
                targetY,
                follow
            );

    }


    /* =========================================================
       PORTAS
       ========================================================= */

    function updateDoors(
        dt
    ) {

        state.world.doors
            .forEach(
                door => {

                    const nearby =

                        !state.houseMode &&

                        distance(

                            state.player.x,
                            state.player.y,

                            door.x +
                            door.w /
                            2,

                            door.y +
                            door.h /
                            2

                        ) <
                        90;


                    door.targetAnimation =
                        nearby
                            ? 1
                            : 0;


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

                }
            );

    }


    /* =========================================================
       UPDATE CENTRAL DA PARTE 2
       ========================================================= */

    function updatePartTwoSystems(
        dt
    ) {

        if (
            !state.player
        ) {

            return;

        }


        ensureWorldRuntimeArrays();


        sanitizeRuntimePlayer();


        state.portalCooldown =
            Math.max(

                0,

                state.portalCooldown -
                dt

            );


        if (
            !state.paused
        ) {

            updatePlayerCooldowns(
                dt
            );


            updatePlayerMovement(
                dt
            );


            updateSurvival(
                dt
            );


            updatePotionEffects(
                dt
            );


            updateNPCs(
                dt
            );


            updateEnemies(
                dt
            );


            updateProjectiles(
                dt
            );


            updateHazards(
                dt
            );


            updateDrops(
                dt
            );


            updateHarvestRespawns(
                dt
            );


            updateHoldInteraction(
                dt
            );


            updatePortals();


            updateVillageSpecialPaths();


            updateHellStairs();


            updateSkyTrial(
                dt
            );


            updateDoors(
                dt
            );


            repairPlayerPositionIfStuck();


            updateCheckpoint();


            ensureVillageResourceBoss();

        }


        updateParticlesAndEffects(
            dt
        );


        updateDamageScreenEffect(
            dt
        );


        updateScreenShake(
            dt
        );


        updateTransition(
            dt
        );


        updateCamera(
            dt
        );

    }


    /* =========================================================
       FIM DA PARTE 2/3

       NÃO COLOQUE })(); AQUI.

       COLE A PARTE 3 LOGO ABAIXO.
       ========================================================= */
     /* =========================================================
       VEYRA: A QUIETUDE — V19
       PARTE 3/3
       RENDER, UI, LUZ, SAVE/LOAD, EVENTOS E LOOP
       ========================================================= */


    /* =========================================================
       TOAST / MENSAGENS
       ========================================================= */

    function showToast(
        message,
        duration =
            2400
    ) {

        const toast =
            $("saveMessage");


        if (
            !toast
        ) {

            console.log(
                "[VEYRA]",
                message
            );


            return;

        }


        clearTimeout(
            state.toastTimer
        );


        toast.textContent =
            String(
                message ||
                ""
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
            setTimeout(
                () => {

                    toast.classList
                        .remove(
                            "show"
                        );


                    toast.classList
                        .add(
                            "hidden"
                        );

                },
                duration
            );

    }


    /* =========================================================
       TROCA DE TELAS COM TRANSIÇÃO

       Mantém o layout da capa original.
       Só recupera sensação de entrada suave.
       ========================================================= */

    function showScreen(
        name,
        options =
            {}
    ) {

        const target =
            screens[
                name
            ];


        if (
            !target
        ) {

            return;

        }


        Object
            .values(
                screens
            )
            .forEach(
                screen => {

                    const active =
                        screen ===
                        target;


                    screen.classList
                        .toggle(
                            "active",
                            active
                        );


                    screen.setAttribute(
                        "aria-hidden",
                        active
                            ? "false"
                            : "true"
                    );

                }
            );


        if (
            options.animate ===
            false
        ) {

            return;

        }


        if (
            typeof target.animate ===
            "function"
        ) {

            target.animate(

                [

                    {

                        opacity:
                            0,

                        transform:
                            "scale(1.018)",

                        filter:
                            "brightness(.78)"

                    },


                    {

                        opacity:
                            1,

                        transform:
                            "scale(1)",

                        filter:
                            "brightness(1)"

                    }

                ],

                {

                    duration:
                        520,

                    easing:
                        "cubic-bezier(.2,.75,.2,1)"

                }

            );

        }

    }


    /* =========================================================
       EFEITOS DA CAPA / BOTÕES

       Não muda posição nem layout.
       ========================================================= */

    function restoreIntroEffects() {

        const buttons = [

            $("newGameBtn"),

            $("continueBtn"),

            $("howToBtn"),

            $("creditsBtn")

        ]
            .filter(
                Boolean
            );


        buttons.forEach(
            button => {

                if (
                    button.dataset
                        .v19GlowBound ===
                    "1"
                ) {

                    return;

                }


                button.dataset
                    .v19GlowBound =
                    "1";


                let hoverAnimation =
                    null;


                button.addEventListener(
                    "pointerenter",
                    () => {

                        if (

                            button.disabled ||

                            typeof button.animate !==
                            "function"

                        ) {

                            return;

                        }


                        hoverAnimation
                            ?.cancel();


                        hoverAnimation =
                            button.animate(

                                [

                                    {

                                        transform:
                                            "translateY(0) scale(1)",

                                        filter:
                                            "brightness(1)",

                                        boxShadow:
                                            "0 0 0 rgba(255,220,155,0)"

                                    },


                                    {

                                        transform:
                                            "translateY(-2px) scale(1.018)",

                                        filter:
                                            "brightness(1.22)",

                                        boxShadow:
                                            "0 0 24px rgba(255,220,155,.42)"

                                    }

                                ],

                                {

                                    duration:
                                        190,

                                    easing:
                                        "ease-out",

                                    fill:
                                        "forwards"

                                }

                            );

                    }
                );


                button.addEventListener(
                    "pointerleave",
                    () => {

                        if (

                            button.disabled ||

                            typeof button.animate !==
                            "function"

                        ) {

                            return;

                        }


                        hoverAnimation
                            ?.cancel();


                        hoverAnimation =
                            button.animate(

                                [

                                    {

                                        transform:
                                            "translateY(-2px) scale(1.018)",

                                        filter:
                                            "brightness(1.22)",

                                        boxShadow:
                                            "0 0 24px rgba(255,220,155,.42)"

                                    },


                                    {

                                        transform:
                                            "translateY(0) scale(1)",

                                        filter:
                                            "brightness(1)",

                                        boxShadow:
                                            "0 0 0 rgba(255,220,155,0)"

                                    }

                                ],

                                {

                                    duration:
                                        240,

                                    easing:
                                        "ease-out",

                                    fill:
                                        "forwards"

                                }

                            );

                    }
                );


                button.addEventListener(
                    "pointerdown",
                    () => {

                        if (

                            button.disabled ||

                            typeof button.animate !==
                            "function"

                        ) {

                            return;

                        }


                        button.animate(

                            [

                                {
                                    transform:
                                        "scale(1.018)"
                                },

                                {
                                    transform:
                                        "scale(.975)"
                                },

                                {
                                    transform:
                                        "scale(1.01)"
                                }

                            ],

                            {

                                duration:
                                    170,

                                easing:
                                    "ease-out"

                            }

                        );

                    }
                );

            }
        );


        const title =
            screens.menu
                ?.querySelector(
                    "h1, .game-title, .title"
                );


        if (

            title &&

            !title.dataset
                .v19TitleGlow &&

            typeof title.animate ===
            "function"

        ) {

            title.dataset
                .v19TitleGlow =
                "1";


            title.animate(

                [

                    {

                        filter:
                            "drop-shadow(0 0 6px rgba(240,210,160,.18))"

                    },


                    {

                        filter:
                            "drop-shadow(0 0 17px rgba(240,210,160,.5))"

                    },


                    {

                        filter:
                            "drop-shadow(0 0 6px rgba(240,210,160,.18))"

                    }

                ],

                {

                    duration:
                        3300,

                    iterations:
                        Infinity,

                    easing:
                        "ease-in-out"

                }

            );

        }

    }


    /* =========================================================
       COMO JOGAR

       Remove aquela parte das áreas vermelhas.
       ========================================================= */

    function removeOldRedAreaHowToEntry() {

        const how =
            screens.how;


        if (
            !how
        ) {

            return;

        }


        const candidates =
            [

                ...how.querySelectorAll(

                    "li, button, .control-row, .how-item, p, div"

                )

            ];


        const unwanted =
            candidates.filter(
                node => {

                    const text =
                        (
                            node.textContent ||
                            ""
                        )
                            .toLocaleLowerCase(
                                "pt-BR"
                            );


                    return (

                        text.includes(
                            "áreas vermelhas"
                        ) ||

                        text.includes(
                            "areas vermelhas"
                        ) ||

                        text.includes(
                            "zona vermelha"
                        ) ||

                        text.includes(
                            "área vermelha"
                        )

                    );

                }
            );


        unwanted.forEach(
            node => {

                const parentMatch =
                    node.closest(

                        "li, .control-row, .how-item"

                    );


                (
                    parentMatch ||
                    node
                )
                    .remove();

            }
        );

    }


    /* =========================================================
       CRÉDITOS
       ========================================================= */

    function ensureCredits() {

        const credits =
            screens.credits;


        if (
            !credits
        ) {

            return;

        }


        const text =
            credits.textContent ||
            "";


        if (

            text.includes(
                "Pedro"
            ) &&

            text.includes(
                "ChatGPT"
            )

        ) {

            return;

        }


        const block =
            document
                .createElement(
                    "div"
                );


        block.className =
            "credits-extra";


        block.innerHTML = `

            <p>
                <strong>
                    Conceito e criação do projeto:
                </strong>
                Pedro
            </p>

            <p>
                <strong>
                    Desenvolvimento e apoio de programação:
                </strong>
                ChatGPT
            </p>

        `;


        const close =
            $("closeCreditsBtn");


        if (
            close?.parentNode ===
            credits
        ) {

            credits.insertBefore(
                block,
                close
            );

        }

        else {

            credits.appendChild(
                block
            );

        }

    }


    /* =========================================================
       ITENS PERMANENTES
       ========================================================= */

    function hasMinimap() {

        return Boolean(

            state.player &&

            (

                state.player
                    .minimapOwned ||

                (
                    state.player
                        .inventory
                        ?.minimapa ||
                    0
                ) >
                0

            )

        );

    }


    function hasLantern() {

        return Boolean(

            state.player &&

            (

                state.player
                    .lanternOwned ||

                (
                    state.player
                        .inventory
                        ?.lanterna ||
                    0
                ) >
                0

            )

        );

    }


    /* =========================================================
       HUD
       ========================================================= */

    function setBarWidth(
        id,
        value,
        max
    ) {

        const bar =
            $(id);


        if (
            !bar
        ) {

            return;

        }


        const ratio =
            max >
            0

                ? clamp(
                    value /
                    max,
                    0,
                    1
                )

                : 0;


        bar.style.width =
            `${ratio * 100}%`;

    }


    function updateHUD() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        const character =
            currentCharacter();


        if (
            $("hudAvatar")
        ) {

            $("hudAvatar")
                .textContent =
                character.icon;

        }


        if (
            $("hudClass")
        ) {

            $("hudClass")
                .textContent =
                player.className;

        }


        if (
            $("hudName")
        ) {

            $("hudName")
                .textContent =
                player.name;

        }


        if (
            $("moneyText")
        ) {

            $("moneyText")
                .textContent =
                Math.floor(
                    player.money ||
                    0
                );

        }


        if (
            $("levelText")
        ) {

            $("levelText")
                .textContent =
                player.level;

        }


        if (
            $("xpText")
        ) {

            $("xpText")
                .textContent =

                player.level >=
                MAX_LEVEL

                    ? "MÁX."

                    : `${Math.floor(
                        player.xp
                    )} / ${Math.floor(
                        player.xpToNext
                    )}`;

        }


        if (
            $("hpText")
        ) {

            $("hpText")
                .textContent =
                `${Math.ceil(
                    player.hp
                )}/${Math.ceil(
                    player.maxHp
                )}`;

        }


        if (
            $("magicText")
        ) {

            $("magicText")
                .textContent =
                `${Math.ceil(
                    player.magic
                )}/${Math.ceil(
                    player.maxMagic
                )}`;

        }


        if (
            $("energyText")
        ) {

            $("energyText")
                .textContent =
                `${Math.ceil(
                    player.energy
                )}/${Math.ceil(
                    player.maxEnergy
                )}`;

        }


        if (
            $("hungerText")
        ) {

            $("hungerText")
                .textContent =
                `${Math.ceil(
                    player.hunger
                )}/${Math.ceil(
                    player.maxHunger
                )}`;

        }


        if (
            $("fatigueText")
        ) {

            $("fatigueText")
                .textContent =
                `${Math.ceil(
                    player.fatigue
                )}/${Math.ceil(
                    player.maxFatigue
                )}`;

        }


        setBarWidth(
            "hpBar",
            player.hp,
            player.maxHp
        );


        setBarWidth(
            "magicBar",
            player.magic,
            player.maxMagic
        );


        setBarWidth(
            "energyBar",
            player.energy,
            player.maxEnergy
        );


        if (
            $("weightText")
        ) {

            $("weightText")
                .textContent =
                `${calculateInventoryWeight()} / ${player.inventoryWeightLimit}`;

        }


        if (
            $("mapBtn")
        ) {

            $("mapBtn").disabled =
                !hasMinimap();


            $("mapBtn").title =
                hasMinimap()

                    ? "Mapa"

                    : "Compre o Minimapa com Doran";

        }


        updateInteractionHint();

        updateStatusButtonBadge();

    }


    /* =========================================================
       PAINÉIS
       ========================================================= */

    function isPanelVisible(
        id
    ) {

        const element =
            $(id);


        return Boolean(

            element &&

            !element.classList
                .contains(
                    "hidden"
                )

        );

    }


    function closeGameplayPanels(
        exceptId =
            null
    ) {

        [

            "inventoryPanel",

            "mapPanel",

            "bookPanel",

            "shopPanel",

            "questPanel",

            "statusPanelDynamic",

            "finalChoicePanelDynamic"

        ]
            .forEach(
                id => {

                    if (
                        id !==
                        exceptId
                    ) {

                        $(id)
                            ?.classList
                            .add(
                                "hidden"
                            );

                    }

                }
            );

    }


    function gameplayPanelOpen() {

        return [

            "inventoryPanel",

            "mapPanel",

            "bookPanel",

            "shopPanel",

            "questPanel",

            "statusPanelDynamic",

            "finalChoicePanelDynamic"

        ]
            .some(
                isPanelVisible
            );

    }


    /* =========================================================
       INDICAÇÃO DE INTERAÇÃO
       ========================================================= */

    function updateInteractionHint() {

        const hint =
            $("interactionHint");


        if (

            !hint ||

            !state.player

        ) {

            return;

        }


        if (

            state.transition ||

            state.player
                .dead ||

            state.dialogue ||

            state.battle ||

            gameplayPanelOpen()

        ) {

            hint.classList
                .add(
                    "hidden"
                );


            return;

        }


        const interaction =
            getInteraction();


        if (
            !interaction
        ) {

            hint.classList
                .add(
                    "hidden"
                );


            return;

        }


        if (
            $("interactionKey")
        ) {

            $("interactionKey")
                .textContent =
                interaction.key ||
                "E";

        }


        if (
            $("interactionText")
        ) {

            $("interactionText")
                .textContent =
                interaction.label ||
                "INTERAGIR";

        }


        hint.classList
            .remove(
                "hidden"
            );

    }


    function updateHoldIndicator() {

        const hint =
            $("interactionHint");


        const text =
            $("interactionText");


        const action =
            state.holdAction;


        if (

            !hint ||

            !text ||

            !action

        ) {

            return;

        }


        const ratio =
            clamp(

                action.time /
                action.required,

                0,
                1

            );


        const blocks =
            10;


        const filled =
            Math.round(
                ratio *
                blocks
            );


        const bar =
            `${"▰".repeat(
                filled
            )}${"▱".repeat(
                blocks -
                filled
            )}`;


        text.textContent =

            action.type ===
            "tree"

                ? `CORTANDO ${bar}`

                : `COLETANDO ${bar}`;


        hint.classList
            .remove(
                "hidden"
            );

    }


    /* =========================================================
       INVENTÁRIO
       ========================================================= */

    function inventoryCategoryMatches(
        item,
        category
    ) {

        if (

            !category ||

            category ===
            "all"

        ) {

            return true;

        }


        const aliases = {

            material:
                "materials",

            materiais:
                "materials",

            weapon:
                "weapons",

            armas:
                "weapons",

            armor:
                "armor",

            armaduras:
                "armor",

            tool:
                "tools",

            ferramentas:
                "tools",

            potion:
                "potions",

            poções:
                "potions",

            pocoes:
                "potions",

            food:
                "food",

            comida:
                "food",

            special:
                "special",

            especiais:
                "special",

            mapa:
                "map"

        };


        const normalized =
            aliases[
                category
            ] ||
            category;


        return (
            item.category ===
            normalized
        );

    }


    function renderInventory() {

        const grid =
            $("inventoryGrid");


        const equipmentGrid =
            $("equipmentGrid");


        if (

            !grid ||

            !equipmentGrid ||

            !state.player

        ) {

            return;

        }


        grid.innerHTML =
            "";


        const entries =
            Object
                .entries(
                    state.player
                        .inventory
                )
                .filter(
                    ([
                        ,
                        amount
                    ]) =>
                        amount >
                        0
                )
                .filter(
                    ([
                        id
                    ]) =>

                        ITEMS[
                            id
                        ] &&

                        inventoryCategoryMatches(

                            ITEMS[
                                id
                            ],

                            state.inventoryCategory

                        )
                );


        if (
            !entries.length
        ) {

            const empty =
                document
                    .createElement(
                        "div"
                    );


            empty.className =
                "inventory-empty";


            empty.textContent =
                "Nenhum item nesta categoria.";


            grid.appendChild(
                empty
            );

        }


        entries.forEach(
            ([
                id,
                amount
            ]) => {

                const item =
                    ITEMS[
                        id
                    ];


                const card =
                    document
                        .createElement(
                            "div"
                        );


                card.className =
                    "inventory-item";


                const equipped =
                    Object
                        .values(
                            state.player
                                .equipment ||
                            {}
                        )
                        .includes(
                            id
                        );


                card.innerHTML = `

                    <div class="item-icon">
                        ${item.icon || "◆"}
                    </div>

                    <div class="item-info">

                        <strong>
                            ${item.name}
                        </strong>

                        <small>
                            x${amount}
                            ${equipped ? " • EQUIPADO" : ""}
                        </small>

                    </div>

                    <div class="item-actions"></div>

                `;


                const actions =
                    card.querySelector(
                        ".item-actions"
                    );


                const addAction = (
                    label,
                    handler,
                    disabled =
                        false
                ) => {

                    const button =
                        document
                            .createElement(
                                "button"
                            );


                    button.type =
                        "button";


                    button.className =
                        "secondary-btn";


                    button.textContent =
                        label;


                    button.disabled =
                        disabled;


                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            handler();


                            renderInventory();


                            updateHUD();

                        }
                    );


                    actions
                        ?.appendChild(
                            button
                        );

                };


                if (

                    [

                        "weapons",

                        "armor",

                        "tools"

                    ]
                        .includes(
                            item.category
                        )

                ) {

                    addAction(

                        equipped

                            ? "EQUIPADO"

                            : "EQUIPAR",

                        () =>
                            equipItem(
                                id
                            ),

                        equipped

                    );

                }


                if (

                    [

                        "food",

                        "potions"

                    ]
                        .includes(
                            item.category
                        )

                ) {

                    addAction(

                        "USAR",

                        () =>
                            useItem(
                                id
                            )

                    );

                }


                if (
                    id ===
                    "flautaMemoria"
                ) {

                    addAction(

                        "TOCAR",

                        () => {

                            closeGameplayPanels();


                            useItem(
                                id
                            );

                        }

                    );

                }


                grid.appendChild(
                    card
                );

            }
        );


        const equipment =
            state.player
                .equipment ||
            {};


        const weapon =
            equipment.weapon

                ? ITEMS[
                    equipment.weapon
                ]

                : null;


        const armor =
            equipment.armor

                ? ITEMS[
                    equipment.armor
                ]

                : null;


        const tool =
            equipment.tool

                ? ITEMS[
                    equipment.tool
                ]

                : null;


        equipmentGrid.innerHTML = `

            <div>
                ⚔️
                <strong>
                    Arma:
                </strong>
                ${weapon ? weapon.name : "Nenhuma"}
            </div>

            <div>
                🛡️
                <strong>
                    Armadura:
                </strong>
                ${armor ? armor.name : "Nenhuma"}
            </div>

            <div>
                🪓
                <strong>
                    Ferramenta:
                </strong>
                ${tool ? tool.name : "Nenhuma"}
            </div>

            <div>
                ⚖️
                <strong>
                    Peso:
                </strong>
                ${calculateInventoryWeight()}
                /
                ${state.player.inventoryWeightLimit}
            </div>

        `;

    }


    function openInventoryPanel() {

        const panel =
            $("inventoryPanel");


        if (
            !panel
        ) {

            return;

        }


        const opening =
            panel.classList
                .contains(
                    "hidden"
                );


        closeGameplayPanels();


        if (
            !opening
        ) {

            return;

        }


        renderInventory();


        panel.classList
            .remove(
                "hidden"
            );

    }


    /* =========================================================
       LIVRO
       ========================================================= */

    function renderBook() {

        const book =
            $("bossBook");


        if (

            !book ||

            !state.player

        ) {

            return;

        }


        book.innerHTML =
            "";


        const discovered =
            new Set(
                state.player
                    .discoveredBosses ||
                []
            );


        const defeated =
            new Set(
                state.player
                    .defeatedBosses ||
                []
            );


        const known =
            BOSS_REGISTRY
                .filter(
                    boss =>

                        discovered.has(
                            boss.id
                        ) ||

                        defeated.has(
                            boss.id
                        )
                );


        if (
            !known.length
        ) {

            const empty =
                document
                    .createElement(
                        "div"
                    );


            empty.className =
                "book-empty";


            empty.textContent =
                "Nenhum boss descoberto. O livro não revela inimigos que você ainda não encontrou.";


            book.appendChild(
                empty
            );


            return;

        }


        known.forEach(
            boss => {

                const entry =
                    document
                        .createElement(
                            "article"
                        );


                entry.className =
                    "boss-entry";


                const isDead =
                    defeated.has(
                        boss.id
                    );


                entry.innerHTML = `

                    <div class="boss-book-symbol">
                        ${boss.icon}
                    </div>

                    <div>

                        <strong>
                            ${boss.name}
                        </strong>

                        <p>
                            ${REGIONS[boss.region]?.name || boss.region}
                        </p>

                        <small>
                            ${boss.quote}
                        </small>

                        <p>
                            ${isDead ? "✅ DERROTADO" : "⚠️ DESCOBERTO"}
                        </p>

                    </div>

                `;


                book.appendChild(
                    entry
                );

            }
        );

    }


    function openBookPanel() {

        const panel =
            $("bookPanel");


        if (
            !panel
        ) {

            return;

        }


        const opening =
            panel.classList
                .contains(
                    "hidden"
                );


        closeGameplayPanels();


        if (
            !opening
        ) {

            return;

        }


        renderBook();


        panel.classList
            .remove(
                "hidden"
            );

    }


    /* =========================================================
       MAPA
       ========================================================= */

    function openMapPanel() {

        if (
            !hasMinimap()
        ) {

            showToast(
                "Compre o Minimapa com Doran para usar o mapa."
            );


            return;

        }


        const panel =
            $("mapPanel");


        if (
            !panel
        ) {

            return;

        }


        const opening =
            panel.classList
                .contains(
                    "hidden"
                );


        closeGameplayPanels();


        if (
            !opening
        ) {

            return;

        }


        panel.classList
            .remove(
                "hidden"
            );


        drawLargeMap();

    }


    /* =========================================================
       STATUS
       ========================================================= */

    function ensureStatusPanel() {

        if (
            $("statusPanelDynamic")
        ) {

            return $("statusPanelDynamic");

        }


        const panel =
            document
                .createElement(
                    "section"
                );


        panel.id =
            "statusPanelDynamic";


        panel.className =
            "panel hidden";


        panel.innerHTML = `

            <div class="panel-header">

                <h2>
                    STATUS
                </h2>

                <button
                    type="button"
                    class="panel-close"
                    data-v19-close="statusPanelDynamic"
                >
                    ×
                </button>

            </div>

            <div class="panel-content">

                <div id="statusPointsText"></div>

                <div id="statusGridDynamic"></div>

            </div>

        `;


        must(
            "gameScreen"
        )
            .appendChild(
                panel
            );


        panel
            .querySelector(
                "[data-v19-close]"
            )
            ?.addEventListener(
                "click",
                () =>
                    panel.classList
                        .add(
                            "hidden"
                        )
            );


        return panel;

    }


    function ensureStatusButton() {

        if (
            $("statusBtnDynamic")
        ) {

            return;

        }


        const anchor =
            $("bookBtn") ||
            $("mapBtn") ||
            $("inventoryBtn");


        if (
            !anchor
                ?.parentNode
        ) {

            return;

        }


        const button =
            document
                .createElement(
                    "button"
                );


        button.id =
            "statusBtnDynamic";


        button.type =
            "button";


        button.className =
            anchor.className;


        button.textContent =
            "STATUS";


        button.title =
            "Pontos de status (P)";


        button.addEventListener(
            "click",
            openStatusPanel
        );


        anchor.parentNode
            .insertBefore(
                button,
                anchor.nextSibling
            );

    }


    function updateStatusButtonBadge() {

        const button =
            $("statusBtnDynamic");


        if (

            !button ||

            !state.player

        ) {

            return;

        }


        button.textContent =

            state.player
                .statPoints >
            0

                ? `STATUS (${state.player.statPoints})`

                : "STATUS";

    }


    function renderStatusPanel() {

        const panel =
            ensureStatusPanel();


        const points =
            $("statusPointsText");


        const grid =
            $("statusGridDynamic");


        if (

            !grid ||

            !points ||

            !state.player

        ) {

            return;

        }


        points.textContent =
            `Pontos disponíveis: ${state.player.statPoints}`;


        grid.innerHTML =
            "";


        Object
            .entries(
                STAT_CONFIG
            )
            .forEach(
                ([
                    id,
                    config
                ]) => {

                    const current =
                        state.player
                            .stats[
                                id
                            ] ||
                        0;


                    const row =
                        document
                            .createElement(
                                "div"
                            );


                    row.className =
                        "status-row";


                    row.innerHTML = `

                        <div>

                            <strong>
                                ${config.label}
                            </strong>

                            <small>
                                ${config.description}
                            </small>

                        </div>

                        <div>
                            ${current}/${config.cap}
                        </div>

                        <button
                            type="button"
                            class="primary-btn"
                        >
                            +
                        </button>

                    `;


                    const button =
                        row.querySelector(
                            "button"
                        );


                    button.disabled =

                        state.player
                            .statPoints <=
                        0 ||

                        current >=
                        config.cap;


                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                allocateStatPoint(
                                    id
                                )
                            ) {

                                renderStatusPanel();


                                updateHUD();

                            }

                        }
                    );


                    grid.appendChild(
                        row
                    );

                }
            );


        return panel;

    }


    function openStatusPanel() {

        const panel =
            ensureStatusPanel();


        const opening =
            panel.classList
                .contains(
                    "hidden"
                );


        closeGameplayPanels();


        if (
            !opening
        ) {

            return;

        }


        renderStatusPanel();


        panel.classList
            .remove(
                "hidden"
            );

    }


    /* =========================================================
       HELPERS VISUAIS DO MAPA
       ========================================================= */

    function pseudoNoise(
        x,
        y,
        salt =
            0
    ) {

        const value =
            Math.sin(

                x *
                12.9898 +

                y *
                78.233 +

                salt *
                37.719

            ) *
            43758.5453;


        return (
            value -
            Math.floor(
                value
            )
        );

    }


    function visibleBounds(
        padding =
            100
    ) {

        return {

            left:
                state.camera.x -
                padding,

            top:
                state.camera.y -
                padding,

            right:
                state.camera.x +
                window.innerWidth +
                padding,

            bottom:
                state.camera.y +
                window.innerHeight +
                padding

        };

    }


    function pointVisible(
        x,
        y,
        padding =
            100
    ) {

        const bounds =
            visibleBounds(
                padding
            );


        return (

            x >=
            bounds.left &&

            x <=
            bounds.right &&

            y >=
            bounds.top &&

            y <=
            bounds.bottom

        );

    }


    function rectVisible(
        rect,
        padding =
            100
    ) {

        const bounds =
            visibleBounds(
                padding
            );


        return (

            rect.x +
            rect.w >=
            bounds.left &&

            rect.x <=
            bounds.right &&

            rect.y +
            rect.h >=
            bounds.top &&

            rect.y <=
            bounds.bottom

        );

    }


    /* =========================================================
       CHÃO MAIS BONITO
       ========================================================= */

    function drawGround() {

        const style =
            BIOME_STYLE[
                state.area
            ] ||
            BIOME_STYLE
                .village;


        ctx.fillStyle =
            style.ground;


        ctx.fillRect(

            0,
            0,

            state.world.width,
            state.world.height

        );


        const tile =
            72;


        const bounds =
            visibleBounds(
                90
            );


        const startX =
            Math.max(

                0,

                Math.floor(
                    bounds.left /
                    tile
                ) *
                tile

            );


        const startY =
            Math.max(

                0,

                Math.floor(
                    bounds.top /
                    tile
                ) *
                tile

            );


        const endX =
            Math.min(

                state.world.width,

                bounds.right

            );


        const endY =
            Math.min(

                state.world.height,

                bounds.bottom

            );


        for (
            let y =
                startY;

            y <=
            endY;

            y +=
            tile
        ) {

            for (
                let x =
                    startX;

                x <=
                endX;

                x +=
                tile
            ) {

                const noise =
                    pseudoNoise(

                        x /
                        tile,

                        y /
                        tile,

                        getWorldSeed(
                            state.area
                        ) %
                        997

                    );


                ctx.globalAlpha =
                    0.07 +
                    noise *
                    0.08;


                ctx.fillStyle =

                    noise >
                    0.52

                        ? style.ground2

                        : style.accent;


                ctx.beginPath();


                ctx.ellipse(

                    x +
                    tile *
                    (
                        0.25 +
                        noise *
                        0.5
                    ),

                    y +
                    tile *
                    (
                        0.2 +
                        pseudoNoise(
                            y,
                            x,
                            4
                        ) *
                        0.6
                    ),

                    9 +
                    noise *
                    18,

                    4 +
                    noise *
                    9,

                    noise *
                    Math.PI,

                    0,

                    Math.PI *
                    2

                );


                ctx.fill();


                if (
                    noise >
                    0.7
                ) {

                    ctx.globalAlpha =
                        0.16;


                    ctx.fillStyle =
                        style.speck;


                    ctx.fillRect(

                        x +
                        10 +
                        noise *
                        38,

                        y +
                        12 +
                        noise *
                        21,

                        2,
                        2

                    );

                }

            }

        }


        ctx.globalAlpha =
            1;

    }


    /* =========================================================
       CAMINHOS
       ========================================================= */

    function pathColor(
        path
    ) {

        const style =
            BIOME_STYLE[
                state.area
            ] ||
            BIOME_STYLE
                .village;


        const colors = {

            villageRoad:
                "#ab8b5b",

            forestTrail:
                "#887852",

            groveTrail:
                "#74684b",

            snowTrail:
                "#c6cbc8",

            mineTrack:
                "#534c45",

            crystalTrail:
                "#70404c",

            mazeExit:
                "#3b3440",

            shadowRoad:
                "#37394f",

            fairyRoad:
                "#9b78aa",

            cloudRoad:
                "#d0d9df",

            hellRoad:
                "#6d342a",

            finalRoad:
                "#45404c"

        };


        return (
            colors[
                path.kind
            ] ||
            style.dirt
        );

    }


    function drawPaths() {

        state.world
            .paths
            .forEach(
                path => {

                    if (
                        !path.points
                            ?.length
                    ) {

                        return;

                    }


                    ctx.save();


                    ctx.lineCap =
                        "round";


                    ctx.lineJoin =
                        "round";


                    ctx.strokeStyle =
                        "rgba(0,0,0,.14)";


                    ctx.lineWidth =
                        (
                            path.width ||
                            90
                        ) +
                        15;


                    ctx.beginPath();


                    ctx.moveTo(

                        path.points[
                            0
                        ].x,

                        path.points[
                            0
                        ].y

                    );


                    for (
                        let i = 1;
                        i <
                        path.points.length;
                        i++
                    ) {

                        ctx.lineTo(

                            path.points[
                                i
                            ].x,

                            path.points[
                                i
                            ].y

                        );

                    }


                    ctx.stroke();


                    ctx.strokeStyle =
                        pathColor(
                            path
                        );


                    ctx.lineWidth =
                        path.width ||
                        90;


                    ctx.globalAlpha =
                        0.95;


                    ctx.stroke();


                    ctx.strokeStyle =
                        "rgba(255,255,255,.07)";


                    ctx.lineWidth =
                        Math.max(

                            2,

                            (
                                path.width ||
                                90
                            ) *
                            0.06

                        );


                    ctx.stroke();


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       DETALHES DO CHÃO
       ========================================================= */

    function drawSmallGroundDetail(
        deco
    ) {

        const style =
            BIOME_STYLE[
                state.area
            ] ||
            BIOME_STYLE
                .village;


        const size =
            deco.size ||
            10;


        ctx.save();


        ctx.translate(
            deco.x,
            deco.y
        );


        ctx.rotate(
            deco.angle ||
            0
        );


        const grassy = [

            "grassTuft",

            "fern",

            "glowingGrass",

            "sparkGrass",

            "darkGrass"

        ];


        const flowery = [

            "flower",

            "magicFlower",

            "fairyFlower",

            "skyFlower",

            "petal"

        ];


        const stony = [

            "smallStone",

            "pathStone",

            "darkPebble",

            "obsidianShard",

            "mirrorShard",

            "crystalShard",

            "purpleShard",

            "smallCrystal"

        ];


        if (
            grassy.includes(
                deco.type
            )
        ) {

            ctx.strokeStyle =

                deco.type.includes(
                    "glow"
                ) ||

                deco.type.includes(
                    "spark"
                )

                    ? "rgba(180,255,215,.65)"

                    : style.accent;


            ctx.lineWidth =
                2;


            for (
                let i = -2;
                i <=
                2;
                i++
            ) {

                ctx.beginPath();


                ctx.moveTo(
                    0,
                    size *
                    0.5
                );


                ctx.quadraticCurveTo(

                    i *
                    2,

                    -size *
                    0.25,

                    i *
                    4,

                    -size

                );


                ctx.stroke();

            }

        }

        else if (
            flowery.includes(
                deco.type
            )
        ) {

            ctx.fillStyle =

                deco.type.includes(
                    "fairy"
                ) ||

                deco.type.includes(
                    "magic"
                )

                    ? "rgba(255,178,241,.8)"

                    : "rgba(235,190,155,.75)";


            for (
                let i = 0;
                i <
                5;
                i++
            ) {

                const angle =
                    i /
                    5 *
                    Math.PI *
                    2;


                ctx.beginPath();


                ctx.arc(

                    Math.cos(
                        angle
                    ) *
                    size *
                    0.35,

                    Math.sin(
                        angle
                    ) *
                    size *
                    0.35,

                    size *
                    0.22,

                    0,

                    Math.PI *
                    2

                );


                ctx.fill();

            }


            ctx.fillStyle =
                "#e6c76c";


            ctx.beginPath();


            ctx.arc(
                0,
                0,
                size *
                0.18,
                0,
                Math.PI *
                2
            );


            ctx.fill();

        }

        else if (
            stony.includes(
                deco.type
            )
        ) {

            ctx.fillStyle =

                deco.type.includes(
                    "crystal"
                ) ||

                deco.type.includes(
                    "Shard"
                )

                    ? "rgba(203,128,220,.62)"

                    : "rgba(90,86,82,.45)";


            ctx.beginPath();


            ctx.ellipse(

                0,
                0,

                size,

                size *
                0.55,

                0,

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }

        else if (

            deco.type ===
            "leafPatch" ||

            deco.type ===
            "fallenLeaf"

        ) {

            ctx.fillStyle =
                "rgba(97,114,67,.52)";


            ctx.beginPath();


            ctx.ellipse(

                0,
                0,

                size *
                0.8,

                size *
                0.35,

                0,

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }

        else if (
            deco.type ===
            "snowDrift"
        ) {

            ctx.fillStyle =
                "rgba(255,255,255,.2)";


            ctx.beginPath();


            ctx.ellipse(

                0,
                0,

                size *
                2,

                size *
                0.7,

                0,

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }

        else if (

            deco.type ===
            "ash" ||

            deco.type ===
            "darkDust"

        ) {

            ctx.fillStyle =
                "rgba(220,210,205,.18)";


            ctx.fillRect(
                -2,
                -2,
                4,
                4
            );

        }

        else if (
            deco.type ===
            "ember"
        ) {

            ctx.fillStyle =
                `rgba(
                    255,
                    110,
                    54,
                    ${
                        0.45 +
                        Math.sin(
                            state.time *
                            5 +
                            deco.x
                        ) *
                        0.15
                    }
                )`;


            ctx.beginPath();


            ctx.arc(
                0,
                0,
                3,
                0,
                Math.PI *
                2
            );


            ctx.fill();

        }

        else {

            ctx.fillStyle =
                "rgba(255,255,255,.08)";


            ctx.beginPath();


            ctx.arc(

                0,
                0,

                Math.max(
                    2,
                    size *
                    0.25
                ),

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }


        ctx.restore();

    }


    function drawDecoration(
        deco
    ) {

        if (
            !pointVisible(
                deco.x,
                deco.y,
                140
            )
        ) {

            return;

        }


        if (

            deco.hiddenWithoutLantern &&

            state.area ===
            "monarchMaze" &&

            !hasLantern()

        ) {

            return;

        }


        const complex = [

            "plazaRing",

            "fountainMist",

            "darkCaveEntrance",

            "dashAltar",

            "skyTrialSeal",

            "oldRune",

            "windRune",

            "lavaCrack",

            "memoryFragment",

            "cloudWisp",

            "lightFeather",

            "ancientRoot",

            "deadPine",

            "shadowMist",

            "mineLantern",

            "rail",

            "toolCrate",

            "stalagmite",

            "boneFragment",

            "obsidianShard"

        ];


        if (
            !complex.includes(
                deco.type
            )
        ) {

            drawSmallGroundDetail(
                deco
            );


            return;

        }


        ctx.save();


        ctx.translate(
            deco.x,
            deco.y
        );


        switch (
            deco.type
        ) {

            case "plazaRing": {

                ctx.strokeStyle =
                    "rgba(207,190,150,.26)";


                ctx.lineWidth =
                    18;


                ctx.beginPath();


                ctx.arc(

                    0,
                    0,

                    deco.radius ||
                    235,

                    0,

                    Math.PI *
                    2

                );


                ctx.stroke();


                ctx.strokeStyle =
                    "rgba(60,50,40,.2)";


                ctx.lineWidth =
                    2;


                for (
                    let i = 0;
                    i <
                    20;
                    i++
                ) {

                    const angle =
                        i /
                        20 *
                        Math.PI *
                        2;


                    ctx.beginPath();


                    ctx.moveTo(

                        Math.cos(
                            angle
                        ) *
                        205,

                        Math.sin(
                            angle
                        ) *
                        205

                    );


                    ctx.lineTo(

                        Math.cos(
                            angle
                        ) *
                        252,

                        Math.sin(
                            angle
                        ) *
                        252

                    );


                    ctx.stroke();

                }


                break;

            }


            case "fountainMist": {

                ctx.fillStyle =
                    `rgba(
                        190,
                        235,
                        245,
                        ${
                            0.03 +
                            Math.sin(
                                state.time *
                                2
                            ) *
                            0.01
                        }
                    )`;


                ctx.beginPath();


                ctx.arc(

                    0,
                    0,

                    deco.radius ||
                    120,

                    0,

                    Math.PI *
                    2

                );


                ctx.fill();


                break;

            }


            case "darkCaveEntrance": {

                const radius =
                    deco.large

                        ? 66

                        : 48;


                ctx.fillStyle =
                    "#070608";


                ctx.beginPath();


                ctx.arc(
                    0,
                    0,
                    radius,
                    Math.PI,
                    0
                );


                ctx.lineTo(
                    radius,
                    58
                );


                ctx.lineTo(
                    -radius,
                    58
                );


                ctx.closePath();


                ctx.fill();


                ctx.strokeStyle =
                    "#544a50";


                ctx.lineWidth =
                    7;


                ctx.stroke();


                break;

            }


            case "dashAltar": {

                ctx.restore();


                drawDashAltar(
                    deco.x,
                    deco.y
                );


                return;

            }


            case "skyTrialSeal": {

                ctx.strokeStyle =
                    `rgba(
                        245,
                        235,
                        200,
                        ${
                            0.45 +
                            Math.sin(
                                state.time *
                                3
                            ) *
                            0.15
                        }
                    )`;


                ctx.lineWidth =
                    5;


                ctx.beginPath();


                ctx.arc(

                    0,
                    0,

                    deco.radius ||
                    78,

                    0,

                    Math.PI *
                    2

                );


                ctx.stroke();


                for (
                    let i = 0;
                    i <
                    8;
                    i++
                ) {

                    const angle =

                        i /
                        8 *
                        Math.PI *
                        2 +

                        state.time *
                        0.15;


                    ctx.beginPath();


                    ctx.moveTo(

                        Math.cos(
                            angle
                        ) *
                        45,

                        Math.sin(
                            angle
                        ) *
                        45

                    );


                    ctx.lineTo(

                        Math.cos(
                            angle
                        ) *
                        70,

                        Math.sin(
                            angle
                        ) *
                        70

                    );


                    ctx.stroke();

                }


                break;

            }


            case "oldRune":

            case "windRune": {

                ctx.strokeStyle =

                    deco.type ===
                    "windRune"

                        ? "rgba(235,245,255,.3)"

                        : "rgba(145,130,190,.34)";


                ctx.lineWidth =
                    2;


                ctx.beginPath();


                ctx.arc(
                    0,
                    0,
                    13,
                    0,
                    Math.PI *
                    2
                );


                ctx.moveTo(
                    -9,
                    0
                );


                ctx.lineTo(
                    9,
                    0
                );


                ctx.moveTo(
                    0,
                    -9
                );


                ctx.lineTo(
                    0,
                    9
                );


                ctx.stroke();


                break;

            }


            case "lavaCrack": {

                ctx.strokeStyle =
                    `rgba(
                        255,
                        95,
                        35,
                        ${
                            0.35 +
                            Math.sin(
                                state.time *
                                4 +
                                deco.x
                            ) *
                            0.12
                        }
                    )`;


                ctx.lineWidth =
                    3;


                ctx.beginPath();


                ctx.moveTo(
                    -16,
                    -8
                );


                ctx.lineTo(
                    -4,
                    0
                );


                ctx.lineTo(
                    -12,
                    13
                );


                ctx.moveTo(
                    -4,
                    0
                );


                ctx.lineTo(
                    15,
                    8
                );


                ctx.stroke();


                break;

            }


            case "memoryFragment": {

                ctx.fillStyle =
                    "rgba(215,193,230,.42)";


                ctx.beginPath();


                ctx.moveTo(
                    0,
                    -16
                );


                ctx.lineTo(
                    10,
                    0
                );


                ctx.lineTo(
                    2,
                    18
                );


                ctx.lineTo(
                    -11,
                    4
                );


                ctx.closePath();


                ctx.fill();


                break;

            }


            case "cloudWisp": {

                ctx.fillStyle =
                    "rgba(255,255,255,.16)";


                ctx.beginPath();


                ctx.ellipse(

                    0,
                    0,

                    34,
                    13,

                    0,

                    0,

                    Math.PI *
                    2

                );


                ctx.fill();


                break;

            }


            case "lightFeather": {

                ctx.strokeStyle =
                    "rgba(255,255,255,.45)";


                ctx.lineWidth =
                    2;


                ctx.beginPath();


                ctx.moveTo(
                    -8,
                    12
                );


                ctx.quadraticCurveTo(
                    8,
                    0,
                    4,
                    -14
                );


                ctx.stroke();


                break;

            }


            case "ancientRoot": {

                ctx.strokeStyle =
                    "rgba(83,61,42,.55)";


                ctx.lineWidth =
                    7;


                ctx.beginPath();


                ctx.moveTo(
                    -24,
                    14
                );


                ctx.quadraticCurveTo(
                    0,
                    -22,
                    27,
                    10
                );


                ctx.stroke();


                break;

            }


            case "deadPine": {

                ctx.strokeStyle =
                    "rgba(74,69,61,.6)";


                ctx.lineWidth =
                    6;


                ctx.beginPath();


                ctx.moveTo(
                    0,
                    26
                );


                ctx.lineTo(
                    0,
                    -30
                );


                ctx.moveTo(
                    0,
                    -8
                );


                ctx.lineTo(
                    -17,
                    -20
                );


                ctx.moveTo(
                    0,
                    -14
                );


                ctx.lineTo(
                    19,
                    -28
                );


                ctx.stroke();


                break;

            }


            case "shadowMist": {

                ctx.fillStyle =
                    "rgba(83,80,119,.1)";


                ctx.beginPath();


                ctx.ellipse(

                    0,

                    Math.sin(
                        state.time +
                        deco.x
                    ) *
                    4,

                    42,
                    18,

                    0,

                    0,

                    Math.PI *
                    2

                );


                ctx.fill();


                break;

            }


            case "mineLantern": {

                ctx.fillStyle =
                    "#65513f";


                ctx.fillRect(
                    -3,
                    -15,
                    6,
                    28
                );


                ctx.fillStyle =
                    `rgba(
                        255,
                        188,
                        91,
                        ${
                            0.55 +
                            Math.sin(
                                state.time *
                                8 +
                                deco.x
                            ) *
                            0.15
                        }
                    )`;


                ctx.beginPath();


                ctx.arc(
                    0,
                    -18,
                    7,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                break;

            }


            case "rail": {

                ctx.strokeStyle =
                    "rgba(97,90,82,.6)";


                ctx.lineWidth =
                    3;


                ctx.beginPath();


                ctx.moveTo(
                    -24,
                    -6
                );


                ctx.lineTo(
                    24,
                    8
                );


                ctx.moveTo(
                    -24,
                    5
                );


                ctx.lineTo(
                    24,
                    19
                );


                ctx.stroke();


                break;

            }


            case "toolCrate": {

                ctx.fillStyle =
                    "#5f4430";


                ctx.fillRect(
                    -14,
                    -11,
                    28,
                    22
                );


                ctx.strokeStyle =
                    "#33261e";


                ctx.strokeRect(
                    -14,
                    -11,
                    28,
                    22
                );


                break;

            }


            case "stalagmite": {

                ctx.fillStyle =
                    "rgba(100,96,89,.68)";


                ctx.beginPath();


                ctx.moveTo(
                    0,
                    -20
                );


                ctx.lineTo(
                    12,
                    15
                );


                ctx.lineTo(
                    -12,
                    15
                );


                ctx.closePath();


                ctx.fill();


                break;

            }


            case "boneFragment": {

                ctx.strokeStyle =
                    "rgba(220,205,185,.45)";


                ctx.lineWidth =
                    4;


                ctx.beginPath();


                ctx.moveTo(
                    -10,
                    -5
                );


                ctx.lineTo(
                    10,
                    5
                );


                ctx.stroke();


                break;

            }


            default: {

                drawSmallGroundDetail(
                    deco
                );


                break;

            }

        }


        ctx.restore();

    }


    function drawDecorations() {

        state.world
            .decorations
            .forEach(
                drawDecoration
            );

    }


    /* =========================================================
       FONTE CENTRAL ROBUSTA
       ========================================================= */

    function drawFountain(
        obstacle
    ) {

        const x =
            obstacle.x +
            obstacle.w /
            2;


        const y =
            obstacle.y +
            obstacle.h /
            2;


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,.24)";


        ctx.beginPath();


        ctx.ellipse(

            x +
            8,

            y +
            16,

            obstacle.w *
            0.53,

            obstacle.h *
            0.38,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            "#898980";


        ctx.beginPath();


        ctx.ellipse(

            x,
            y,

            obstacle.w *
            0.5,

            obstacle.h *
            0.44,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            "#5c93a4";


        ctx.beginPath();


        ctx.ellipse(

            x,

            y -
            2,

            obstacle.w *
            0.42,

            obstacle.h *
            0.34,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.strokeStyle =
            "rgba(210,240,247,.23)";


        ctx.lineWidth =
            3;


        for (
            let i = 0;
            i <
            3;
            i++
        ) {

            const radius =

                45 +

                i *
                22 +

                Math.sin(
                    state.time *
                    3 +
                    i
                ) *
                4;


            ctx.beginPath();


            ctx.ellipse(

                x,
                y,

                radius,

                radius *
                0.45,

                0,

                0,

                Math.PI *
                2

            );


            ctx.stroke();

        }


        ctx.fillStyle =
            "#9b9a90";


        ctx.fillRect(

            x -
            25,

            y -
            105,

            50,
            110

        );


        ctx.fillStyle =
            "#adaca1";


        ctx.fillRect(

            x -
            34,

            y -
            112,

            68,
            18

        );


        ctx.beginPath();


        ctx.arc(

            x,

            y -
            118,

            27,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        const waterAlpha =

            0.6 +

            Math.sin(
                state.time *
                8
            ) *
            0.1;


        ctx.strokeStyle =
            `rgba(
                177,
                231,
                245,
                ${waterAlpha}
            )`;


        ctx.lineWidth =
            4;


        for (
            const side of
            [
                -1,
                1
            ]
        ) {

            ctx.beginPath();


            ctx.moveTo(

                x +
                side *
                17,

                y -
                88

            );


            ctx.quadraticCurveTo(

                x +
                side *
                62,

                y -
                68,

                x +
                side *
                72,

                y -
                8

            );


            ctx.stroke();

        }


        ctx.beginPath();


        ctx.moveTo(
            x,
            y -
            140
        );


        ctx.quadraticCurveTo(

            x +
            Math.sin(
                state.time *
                2
            ) *
            5,

            y -
            182,

            x,

            y -
            194

        );


        ctx.stroke();


        for (
            let i = 0;
            i <
            8;
            i++
        ) {

            const angle =

                state.time *
                1.6 +

                i *
                Math.PI /
                4;


            const px =

                x +

                Math.cos(
                    angle
                ) *
                62;


            const py =

                y -
                6 +

                Math.sin(
                    angle
                ) *
                23;


            ctx.fillStyle =
                `rgba(
                    195,
                    238,
                    247,
                    ${
                        0.25 +
                        (
                            i %
                            3
                        ) *
                        0.08
                    }
                )`;


            ctx.beginPath();


            ctx.arc(

                px,
                py,

                2.5 +
                (
                    i %
                    2
                ),

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }


        ctx.restore();

    }


    /* =========================================================
       CASAS
       ========================================================= */

    function drawBuildings() {

        state.world
            .buildings
            .forEach(
                building => {

                    if (
                        !rectVisible(
                            building,
                            120
                        )
                    ) {

                        return;

                    }


                    ctx.save();


                    ctx.fillStyle =
                        "rgba(0,0,0,.2)";


                    ctx.fillRect(

                        building.x +
                        14,

                        building.y +
                        18,

                        building.w,
                        building.h

                    );


                    ctx.fillStyle =
                        building.color;


                    ctx.fillRect(

                        building.x,
                        building.y,

                        building.w,
                        building.h

                    );


                    ctx.fillStyle =
                        building.roof;


                    ctx.beginPath();


                    ctx.moveTo(

                        building.x -
                        24,

                        building.y +
                        8

                    );


                    ctx.lineTo(

                        building.x +
                        building.w /
                        2,

                        building.y -
                        88

                    );


                    ctx.lineTo(

                        building.x +
                        building.w +
                        24,

                        building.y +
                        8

                    );


                    ctx.closePath();


                    ctx.fill();


                    ctx.strokeStyle =
                        "rgba(255,255,255,.08)";


                    ctx.lineWidth =
                        4;


                    ctx.strokeRect(

                        building.x,
                        building.y,

                        building.w,
                        building.h

                    );


                    const windowY =
                        building.y +
                        74;


                    [

                        building.x +
                        48,

                        building.x +
                        building.w -
                        98

                    ]
                        .forEach(
                            windowX => {

                                ctx.fillStyle =
                                    "#b99b72";


                                ctx.fillRect(

                                    windowX -
                                    6,

                                    windowY -
                                    6,

                                    58,
                                    49

                                );


                                ctx.fillStyle =
                                    "rgba(66,100,112,.72)";


                                ctx.fillRect(

                                    windowX,
                                    windowY,

                                    46,
                                    37

                                );


                                ctx.strokeStyle =
                                    "rgba(230,215,170,.3)";


                                ctx.lineWidth =
                                    2;


                                ctx.beginPath();


                                ctx.moveTo(

                                    windowX +
                                    23,

                                    windowY

                                );


                                ctx.lineTo(

                                    windowX +
                                    23,

                                    windowY +
                                    37

                                );


                                ctx.moveTo(

                                    windowX,

                                    windowY +
                                    18

                                );


                                ctx.lineTo(

                                    windowX +
                                    46,

                                    windowY +
                                    18

                                );


                                ctx.stroke();

                            }
                        );


                    ctx.textAlign =
                        "center";


                    ctx.fillStyle =
                        "#eadbb7";


                    ctx.font =
                        "700 12px Georgia";


                    ctx.fillText(

                        building.name,

                        building.x +
                        building.w /
                        2,

                        building.y +
                        building.h +
                        28

                    );


                    ctx.restore();

                }
            );


        drawExteriorDoors();

    }


    function drawExteriorDoors() {

        state.world
            .doors
            .forEach(
                door => {

                    const building =
                        state.world
                            .buildings
                            .find(
                                item =>
                                    item.id ===
                                    door.buildingId
                            );


                    if (
                        !building
                    ) {

                        return;

                    }


                    const frameY =

                        building.y +

                        building.h -

                        84;


                    const open =
                        clamp(
                            door.animation ||
                            0,
                            0,
                            1
                        );


                    ctx.save();


                    ctx.fillStyle =
                        "#261a16";


                    ctx.fillRect(

                        door.x -
                        7,

                        frameY,

                        door.w +
                        14,

                        86

                    );


                    ctx.strokeStyle =
                        "#b08b59";


                    ctx.lineWidth =
                        3;


                    ctx.strokeRect(

                        door.x -
                        7,

                        frameY,

                        door.w +
                        14,

                        86

                    );


                    const visible =
                        Math.max(

                            7,

                            door.w *
                            (
                                1 -
                                open *
                                0.84
                            )

                        );


                    ctx.fillStyle =
                        "#593829";


                    ctx.fillRect(

                        door.x,

                        frameY +
                        6,

                        visible,

                        80

                    );


                    ctx.fillStyle =
                        "rgba(240,216,162,.15)";


                    if (
                        open >
                        0.08
                    ) {

                        ctx.fillRect(

                            door.x +
                            visible,

                            frameY +
                            7,

                            door.w -
                            visible,

                            79

                        );

                    }


                    if (
                        open <
                        0.75
                    ) {

                        ctx.fillStyle =
                            "#d4b260";


                        ctx.beginPath();


                        ctx.arc(

                            door.x +
                            visible -
                            9,

                            frameY +
                            46,

                            4,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function drawTree(
        tree
    ) {

        if (

            !tree.alive ||

            !pointVisible(
                tree.x,
                tree.y,
                80
            )

        ) {

            return;

        }


        const ancient =

            tree.type ===
            "ancientTree" ||

            tree.type ===
            "fairyTree";


        const fairy =
            tree.type ===
            "fairyTree";


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,.18)";


        ctx.beginPath();


        ctx.ellipse(

            tree.x,

            tree.y +
            38,

            30,
            9,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =

            ancient

                ? "#5d4430"

                : "#68492f";


        ctx.fillRect(

            tree.x -
            10,

            tree.y,

            20,
            45

        );


        ctx.strokeStyle =
            ctx.fillStyle;


        ctx.lineWidth =
            7;


        ctx.beginPath();


        ctx.moveTo(
            tree.x,
            tree.y +
            10
        );


        ctx.lineTo(
            tree.x -
            20,
            tree.y -
            15
        );


        ctx.moveTo(
            tree.x,
            tree.y +
            6
        );


        ctx.lineTo(
            tree.x +
            22,
            tree.y -
            18
        );


        ctx.stroke();


        const leaf =

            fairy

                ? "#735985"

                : ancient

                    ? "#335a3f"

                    : "#3d7043";


        ctx.fillStyle =
            leaf;


        const sway =

            Math.sin(

                state.time *
                1.2 +

                tree.x *
                0.01

            ) *
            2;


        [

            [
                0,
                -30,
                38
            ],

            [
                -24,
                -25,
                27
            ],

            [
                25,
                -24,
                27
            ],

            [
                0,
                -54,
                27
            ]

        ]
            .forEach(
                ([
                    ox,
                    oy,
                    radius
                ]) => {

                    ctx.beginPath();


                    ctx.arc(

                        tree.x +
                        ox +
                        sway,

                        tree.y +
                        oy,

                        radius,

                        0,

                        Math.PI *
                        2

                    );


                    ctx.fill();

                }
            );


        ctx.restore();

    }


    function drawTrees() {

        state.world
            .trees
            .forEach(
                drawTree
            );

    }


    /* =========================================================
       PEDRAS / OBSTÁCULOS
       ========================================================= */

    function obstacleColor(
        type
    ) {

        const map = {

            wall:
                "#454a46",

            rock:
                "#777a73",

            mossRock:
                "#62705f",

            groveStone:
                "#677068",

            snowrock:
                "#a9afaf",

            iceRock:
                "#a8c0cb",

            oreRock:
                "#55514c",

            ironrock:
                "#666b6d",

            rubyrock:
                "#74394a",

            rubyPillar:
                "#873f54",

            mazeWall:
                "#262229",

            arenaWall:
                "#39303c",

            shadowRock:
                "#34374d",

            lavaRock:
                "#51332c",

            obsidianRock:
                "#332d31"

        };


        return (
            map[
                type
            ] ||
            "#686b66"
        );

    }


    function drawObstacles() {

        state.world
            .obstacles
            .forEach(
                obstacle => {

                    if (

                        [

                            "building",

                            "tree"

                        ]
                            .includes(
                                obstacle.type
                            )

                    ) {

                        return;

                    }


                    if (
                        !rectVisible(
                            obstacle,
                            100
                        )
                    ) {

                        return;

                    }


                    if (
                        obstacle.type ===
                        "fountain"
                    ) {

                        drawFountain(
                            obstacle
                        );


                        return;

                    }


                    ctx.save();


                    ctx.fillStyle =
                        obstacleColor(
                            obstacle.type
                        );


                    if (

                        [

                            "wall",

                            "mazeWall",

                            "arenaWall"

                        ]
                            .includes(
                                obstacle.type
                            )

                    ) {

                        ctx.fillRect(

                            obstacle.x,
                            obstacle.y,

                            obstacle.w,
                            obstacle.h

                        );


                        ctx.strokeStyle =
                            "rgba(255,255,255,.05)";


                        ctx.lineWidth =
                            2;


                        ctx.strokeRect(

                            obstacle.x,
                            obstacle.y,

                            obstacle.w,
                            obstacle.h

                        );

                    }

                    else {

                        ctx.fillStyle =
                            "rgba(0,0,0,.14)";


                        ctx.beginPath();


                        ctx.ellipse(

                            obstacle.x +
                            obstacle.w /
                            2 +
                            5,

                            obstacle.y +
                            obstacle.h /
                            2 +
                            7,

                            obstacle.w *
                            0.48,

                            obstacle.h *
                            0.42,

                            0,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();


                        ctx.fillStyle =
                            obstacleColor(
                                obstacle.type
                            );


                        ctx.beginPath();


                        ctx.ellipse(

                            obstacle.x +
                            obstacle.w /
                            2,

                            obstacle.y +
                            obstacle.h /
                            2,

                            obstacle.w *
                            0.5,

                            obstacle.h *
                            0.5,

                            -0.12,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();


                        ctx.fillStyle =
                            "rgba(255,255,255,.07)";


                        ctx.beginPath();


                        ctx.ellipse(

                            obstacle.x +
                            obstacle.w *
                            0.38,

                            obstacle.y +
                            obstacle.h *
                            0.35,

                            obstacle.w *
                            0.18,

                            obstacle.h *
                            0.12,

                            -0.2,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    function drawResources() {

        state.world
            .resources
            .forEach(
                resource => {

                    if (

                        !resource.alive ||

                        !pointVisible(
                            resource.x,
                            resource.y,
                            60
                        )

                    ) {

                        return;

                    }


                    const colors = {

                        carvao:
                            "#303236",

                        ferro:
                            "#92999d",

                        ouro:
                            "#ddb74b",

                        diamante:
                            "#8ed7e9",

                        rubi:
                            "#c94b67",

                        madeira:
                            "#8b633f"

                    };


                    const color =
                        colors[
                            resource.type
                        ] ||
                        "#aaa";


                    ctx.save();


                    ctx.fillStyle =
                        "rgba(0,0,0,.2)";


                    ctx.beginPath();


                    ctx.ellipse(

                        resource.x,

                        resource.y +
                        12,

                        18,
                        6,

                        0,

                        0,

                        Math.PI *
                        2

                    );


                    ctx.fill();


                    ctx.fillStyle =
                        color;


                    ctx.beginPath();


                    ctx.moveTo(

                        resource.x,

                        resource.y -
                        18

                    );


                    ctx.lineTo(

                        resource.x +
                        15,

                        resource.y -
                        2

                    );


                    ctx.lineTo(

                        resource.x +
                        9,

                        resource.y +
                        16

                    );


                    ctx.lineTo(

                        resource.x -
                        13,

                        resource.y +
                        12

                    );


                    ctx.lineTo(

                        resource.x -
                        16,

                        resource.y -
                        5

                    );


                    ctx.closePath();


                    ctx.fill();


                    ctx.fillStyle =
                        "rgba(255,255,255,.25)";


                    ctx.beginPath();


                    ctx.moveTo(

                        resource.x,

                        resource.y -
                        14

                    );


                    ctx.lineTo(

                        resource.x +
                        5,

                        resource.y -
                        3

                    );


                    ctx.lineTo(

                        resource.x -
                        3,

                        resource.y +
                        2

                    );


                    ctx.closePath();


                    ctx.fill();


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       CENOURAS
       ========================================================= */

    function drawFoods() {

        state.world
            .foods
            .forEach(
                food => {

                    if (

                        !food.alive ||

                        !pointVisible(
                            food.x,
                            food.y,
                            50
                        )

                    ) {

                        return;

                    }


                    ctx.save();


                    ctx.translate(
                        food.x,
                        food.y
                    );


                    ctx.rotate(
                        -0.2
                    );


                    ctx.fillStyle =
                        "#d97d39";


                    ctx.beginPath();


                    ctx.moveTo(
                        0,
                        -12
                    );


                    ctx.lineTo(
                        7,
                        12
                    );


                    ctx.lineTo(
                        -6,
                        12
                    );


                    ctx.closePath();


                    ctx.fill();


                    ctx.strokeStyle =
                        "#5d8e4e";


                    ctx.lineWidth =
                        3;


                    ctx.beginPath();


                    ctx.moveTo(
                        0,
                        -10
                    );


                    ctx.lineTo(
                        -7,
                        -18
                    );


                    ctx.moveTo(
                        0,
                        -10
                    );


                    ctx.lineTo(
                        6,
                        -19
                    );


                    ctx.stroke();


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       MÓVEIS
       ========================================================= */

    function drawFurnitureItem(
        item
    ) {

        ctx.save();


        const x =
            item.x;


        const y =
            item.y;


        const w =
            item.w;


        const h =
            item.h;


        if (
            item.type ===
            "rug"
        ) {

            ctx.fillStyle =
                "rgba(117,62,58,.55)";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );


            ctx.strokeStyle =
                "rgba(235,205,154,.35)";


            ctx.strokeRect(

                x +
                5,

                y +
                5,

                w -
                10,

                h -
                10

            );

        }

        else if (
            item.type ===
            "bed"
        ) {

            ctx.fillStyle =
                "#49352b";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );


            ctx.fillStyle =
                "#d8c8aa";


            ctx.fillRect(

                x +
                10,

                y +
                10,

                w -
                20,

                h -
                20

            );


            ctx.fillStyle =
                "#7e5350";


            ctx.fillRect(

                x +
                12,

                y +
                h *
                0.42,

                w -
                24,

                h *
                0.48

            );

        }

        else if (

            [

                "table",

                "desk",

                "workbench",

                "counter"

            ]
                .includes(
                    item.type
                )

        ) {

            ctx.fillStyle =

                item.type ===
                "counter"

                    ? "#60422f"

                    : "#694a31";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );


            ctx.fillStyle =
                "rgba(255,255,255,.08)";


            ctx.fillRect(

                x +
                6,

                y +
                5,

                w -
                12,

                8

            );

        }

        else if (
            item.type ===
            "furnace"
        ) {

            ctx.fillStyle =
                "#343237";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );


            ctx.fillStyle =
                "#171518";


            ctx.fillRect(

                x +
                42,

                y +
                62,

                w -
                84,

                h -
                86

            );


            ctx.fillStyle =
                `rgba(
                    255,
                    102,
                    30,
                    ${
                        0.52 +
                        Math.sin(
                            state.time *
                            9
                        ) *
                        0.16
                    }
                )`;


            ctx.beginPath();


            ctx.arc(

                x +
                w /
                2,

                y +
                h *
                0.67,

                39,

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }

        else if (
            item.type ===
            "anvil"
        ) {

            ctx.fillStyle =
                "#2e3237";


            ctx.fillRect(

                x +
                20,

                y +
                35,

                w -
                40,

                h -
                45

            );


            ctx.fillRect(

                x,

                y +
                24,

                w,
                32

            );

        }

        else if (

            [

                "bookshelf",

                "shopShelf"

            ]
                .includes(
                    item.type
                )

        ) {

            ctx.fillStyle =
                "#53392a";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );


            for (
                let yy =
                    y +
                    38;

                yy <
                y +
                h -
                8;

                yy +=
                42
            ) {

                ctx.fillStyle =
                    "#282526";


                ctx.fillRect(

                    x +
                    8,

                    yy,

                    w -
                    16,

                    5

                );


                for (
                    let xx =
                        x +
                        13;

                    xx <
                    x +
                    w -
                    12;

                    xx +=
                    16
                ) {

                    const colors = [

                        "#8f5b54",

                        "#566f8b",

                        "#8d7951",

                        "#6d5b8e"

                    ];


                    ctx.fillStyle =
                        colors[
                            (
                                Math.floor(
                                    xx +
                                    yy
                                ) >>
                                3
                            ) %
                            colors.length
                        ];


                    ctx.fillRect(

                        xx,

                        yy -
                        25,

                        9,
                        24

                    );

                }

            }

        }

        else if (

            [

                "chest",

                "crate",

                "oreCrate"

            ]
                .includes(
                    item.type
                )

        ) {

            ctx.fillStyle =

                item.type ===
                "oreCrate"

                    ? "#4d4945"

                    : "#61442e";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );


            ctx.strokeStyle =
                "#2d221a";


            ctx.lineWidth =
                4;


            ctx.strokeRect(
                x,
                y,
                w,
                h
            );


            ctx.beginPath();


            ctx.moveTo(
                x,
                y
            );


            ctx.lineTo(
                x +
                w,

                y +
                h
            );


            ctx.moveTo(
                x +
                w,
                y
            );


            ctx.lineTo(
                x,

                y +
                h
            );


            ctx.stroke();

        }

        else if (

            [

                "logStack",

                "boardStack"

            ]
                .includes(
                    item.type
                )

        ) {

            ctx.fillStyle =
                "#755236";


            for (
                let yy =
                    y +
                    8;

                yy <
                y +
                h;

                yy +=
                24
            ) {

                ctx.fillRect(

                    x +
                    5,

                    yy,

                    w -
                    10,

                    15

                );

            }

        }

        else {

            ctx.fillStyle =
                "#5d4432";


            ctx.fillRect(
                x,
                y,
                w,
                h
            );

        }


        ctx.restore();

    }


    /* =========================================================
       INTERIORES
       ========================================================= */

    function drawHouseInterior() {

        const spec =
            getHouseSpec();


        const room =
            spec.room;


        ctx.fillStyle =
            "#0d0e0f";


        ctx.fillRect(

            0,
            0,

            state.world.width,
            state.world.height

        );


        ctx.fillStyle =
            spec.wall;


        ctx.fillRect(

            room.x -
            32,

            room.y -
            32,

            room.w +
            64,

            room.h +
            64

        );


        ctx.fillStyle =
            spec.floor;


        ctx.fillRect(

            room.x,
            room.y,

            room.w,
            room.h

        );


        ctx.strokeStyle =
            "rgba(45,29,20,.18)";


        ctx.lineWidth =
            2;


        for (
            let y =
                room.y +
                32;

            y <
            room.y +
            room.h;

            y +=
            38
        ) {

            ctx.beginPath();


            ctx.moveTo(
                room.x,
                y
            );


            ctx.lineTo(

                room.x +
                room.w,

                y

            );


            ctx.stroke();

        }


        ctx.strokeStyle =
            spec.trim;


        ctx.lineWidth =
            6;


        ctx.strokeRect(

            room.x,
            room.y,

            room.w,
            room.h

        );


        getHouseFurniture()
            .forEach(
                drawFurnitureItem
            );


        drawInteriorDoor();


        getHouseInteriorNPCs()
            .forEach(
                drawNPC
            );


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#ecddba";


        ctx.font =
            "700 18px Georgia";


        ctx.fillText(

            state.currentHouse
                ?.name ||
            "INTERIOR",

            room.x +
            room.w /
            2,

            room.y -
            46

        );

    }


    function drawInteriorDoor() {

        const door =
            getInteriorDoor();


        ctx.save();


        ctx.fillStyle =
            "#251a16";


        ctx.fillRect(

            door.x -
            6,

            door.y -
            20,

            door.w +
            12,

            80

        );


        ctx.fillStyle =
            "#573a29";


        ctx.fillRect(

            door.x,

            door.y -
            14,

            door.w,

            74

        );


        ctx.strokeStyle =
            "#c29a61";


        ctx.lineWidth =
            3;


        ctx.strokeRect(

            door.x -
            6,

            door.y -
            20,

            door.w +
            12,

            80

        );


        ctx.fillStyle =
            "#d5b763";


        ctx.beginPath();


        ctx.arc(

            door.x +
            door.w -
            15,

            door.y +
            20,

            4,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.restore();

    }


    /* =========================================================
       NPCs COMO BONEQUINHOS
       ========================================================= */

    function drawNPC(
        npc
    ) {

        if (

            !pointVisible(
                npc.x,
                npc.y,
                80
            ) &&

            !state.houseMode

        ) {

            return;

        }


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,.2)";


        ctx.beginPath();


        ctx.ellipse(

            npc.x,

            npc.y +
            19,

            16,
            6,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            npc.color ||
            "#c8aa80";


        ctx.fillRect(

            npc.x -
            11,

            npc.y -
            3,

            22,
            26

        );


        ctx.fillStyle =
            "#c99e79";


        ctx.beginPath();


        ctx.arc(

            npc.x,

            npc.y -
            12,

            11,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            "#3a302b";


        ctx.beginPath();


        ctx.arc(

            npc.x,

            npc.y -
            16,

            10,

            Math.PI,

            Math.PI *
            2

        );


        ctx.fill();


        if (
            npc.spriteType ===
            "merchant"
        ) {

            ctx.fillStyle =
                "#b98a4d";


            ctx.fillRect(

                npc.x -
                15,

                npc.y -
                26,

                30,
                5

            );

        }


        ctx.fillStyle =
            "#f1e4c5";


        ctx.font =
            "700 11px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            npc.name,

            npc.x,

            npc.y -
            34

        );


        ctx.restore();

    }


    function drawNPCs() {

        state.world
            .npcs
            .forEach(
                drawNPC
            );

    }


    /* =========================================================
       PLAYER — BONEQUINHO
       ========================================================= */

    function drawPlayerSprite(
        player
    ) {

        const character =
            currentCharacter();


        const sprite =
            player.sprite ||
            character.sprite;


        const scale =
            sprite.scale ||
            1;


        const walk =
            player.walkTime ||
            0;


        const bob =
            Math.sin(
                walk
            ) *
            1.7;


        const legSwing =
            Math.sin(
                walk
            ) *
            5;


        const attack =
            player.attackAnim >
            0

                ? 1 -
                    player.attackAnim /
                    0.26

                : 0;


        const aim =
            getAimVector();


        ctx.save();


        ctx.translate(

            player.x,

            player.y +
            bob

        );


        ctx.scale(
            scale,
            scale
        );


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
                0.55;

        }


        ctx.fillStyle =
            "rgba(0,0,0,.24)";


        ctx.beginPath();


        ctx.ellipse(
            0,
            22,
            19,
            7,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        if (
            sprite.wings
        ) {

            ctx.fillStyle =
                "rgba(244,201,245,.38)";


            for (
                const side of
                [
                    -1,
                    1
                ]
            ) {

                ctx.beginPath();


                ctx.ellipse(

                    side *
                    17,

                    -2,

                    10,
                    22,

                    side *
                    0.4,

                    0,

                    Math.PI *
                    2

                );


                ctx.fill();

            }

        }


        if (
            sprite.cape
        ) {

            ctx.fillStyle =
                sprite.cape;


            ctx.beginPath();


            ctx.moveTo(
                -11,
                -5
            );


            ctx.lineTo(
                11,
                -5
            );


            ctx.lineTo(
                15,
                21
            );


            ctx.lineTo(
                -15,
                21
            );


            ctx.closePath();


            ctx.fill();

        }


        ctx.strokeStyle =
            "#332c29";


        ctx.lineWidth =
            6;


        ctx.lineCap =
            "round";


        ctx.beginPath();


        ctx.moveTo(
            -7,
            13
        );


        ctx.lineTo(

            -8 +
            legSwing,

            25

        );


        ctx.moveTo(
            7,
            13
        );


        ctx.lineTo(

            8 -
            legSwing,

            25

        );


        ctx.stroke();


        ctx.fillStyle =
            sprite.body;


        ctx.beginPath();


        ctx.roundRect(

            -13,
            -8,

            26,
            28,

            7

        );


        ctx.fill();


        ctx.fillStyle =
            sprite.trim;


        ctx.fillRect(

            -13,
            5,

            26,
            4

        );


        ctx.strokeStyle =
            sprite.skin;


        ctx.lineWidth =
            6;


        ctx.beginPath();


        ctx.moveTo(
            -11,
            -2
        );


        ctx.lineTo(

            -19,

            9 +
            Math.sin(
                walk
            ) *
            2

        );


        ctx.moveTo(
            11,
            -2
        );


        ctx.lineTo(

            19,

            9 -
            Math.sin(
                walk
            ) *
            2

        );


        ctx.stroke();


        ctx.fillStyle =
            sprite.skin;


        ctx.beginPath();


        ctx.arc(

            0,
            -19,

            12,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            sprite.hair;


        ctx.beginPath();


        ctx.arc(

            0,
            -23,

            11,

            Math.PI,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillRect(

            -10,
            -24,

            20,
            5

        );


        const eyeOffsetX =

            player.facing ===
            "left"

                ? -2

                : player.facing ===
                    "right"

                    ? 2

                    : 0;


        ctx.fillStyle =
            "#1f2021";


        ctx.beginPath();


        ctx.arc(

            -4 +
            eyeOffsetX,

            -18,

            1.5,

            0,

            Math.PI *
            2

        );


        ctx.arc(

            4 +
            eyeOffsetX,

            -18,

            1.5,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        drawPlayerWeapon(

            sprite.weapon,

            sprite.accent,

            aim,

            attack

        );


        if (

            player.shieldTimer >
            0 ||

            player.adaptiveBuff

        ) {

            ctx.strokeStyle =

                player.shieldTimer >
                0

                    ? "rgba(220,235,255,.68)"

                    : "rgba(180,140,255,.58)";


            ctx.lineWidth =
                3;


            ctx.beginPath();


            ctx.arc(

                0,
                -2,

                29 +
                Math.sin(
                    state.time *
                    5
                ) *
                2,

                0,

                Math.PI *
                2

            );


            ctx.stroke();

        }


        ctx.restore();

    }


    function drawPlayerWeapon(
        type,
        accent,
        aim,
        attackProgress
    ) {

        if (
            !type
        ) {

            return;

        }


        const angle =

            Math.atan2(
                aim.y,
                aim.x
            ) +

            Math.sin(
                attackProgress *
                Math.PI
            ) *
            0.85;


        ctx.save();


        ctx.rotate(
            angle
        );


        ctx.translate(
            18,
            0
        );


        ctx.lineCap =
            "round";


        if (

            type ===
            "staff" ||

            type ===
            "wand"

        ) {

            ctx.strokeStyle =

                type ===
                "staff"

                    ? "#6f4b2f"

                    : "#d2b0d0";


            ctx.lineWidth =

                type ===
                "staff"

                    ? 5

                    : 3;


            ctx.beginPath();


            ctx.moveTo(
                -8,
                0
            );


            ctx.lineTo(

                type ===
                "staff"

                    ? 25

                    : 18,

                0

            );


            ctx.stroke();


            ctx.fillStyle =
                accent;


            ctx.beginPath();


            ctx.arc(

                type ===
                "staff"

                    ? 28

                    : 21,

                0,

                type ===
                "staff"

                    ? 6

                    : 4,

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }

        else if (
            type ===
            "club"
        ) {

            ctx.strokeStyle =
                "#674830";


            ctx.lineWidth =
                7;


            ctx.beginPath();


            ctx.moveTo(
                -6,
                0
            );


            ctx.lineTo(
                25,
                0
            );


            ctx.stroke();


            ctx.fillStyle =
                "#5a4c3a";


            ctx.beginPath();


            ctx.ellipse(

                30,
                0,

                11,
                7,

                0,

                0,

                Math.PI *
                2

            );


            ctx.fill();

        }

        else {

            ctx.strokeStyle =
                "#6a5138";


            ctx.lineWidth =
                4;


            ctx.beginPath();


            ctx.moveTo(
                -4,
                0
            );


            ctx.lineTo(
                9,
                0
            );


            ctx.stroke();


            ctx.fillStyle =

                type ===
                "sword"

                    ? "#d9e0e3"

                    : accent;


            ctx.beginPath();


            ctx.moveTo(
                8,
                -3
            );


            ctx.lineTo(
                34,
                0
            );


            ctx.lineTo(
                8,
                3
            );


            ctx.closePath();


            ctx.fill();

        }


        ctx.restore();

    }


    function drawPlayer() {

        if (
            !state.player
        ) {

            return;

        }


        drawPlayerSprite(
            state.player
        );


        ctx.fillStyle =
            "#f3e8ce";


        ctx.font =
            "700 12px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            state.player
                .name,

            state.player
                .x,

            state.player
                .y -
            46

        );

    }


    /* =========================================================
       INIMIGOS — BONEQUINHOS
       ========================================================= */

    function drawEnemyHumanoid(
        enemy,
        options =
            {}
    ) {

        const bob =

            Math.sin(

                state.time *
                5 +

                enemy.x *
                0.01

            ) *
            1.2;


        ctx.save();


        ctx.translate(

            enemy.x,

            enemy.y +
            bob

        );


        const scale =
            options.scale ||
            1;


        ctx.scale(
            scale,
            scale
        );


        ctx.fillStyle =
            "rgba(0,0,0,.22)";


        ctx.beginPath();


        ctx.ellipse(

            0,

            enemy.radius *
            0.8,

            enemy.radius *
            0.75,

            enemy.radius *
            0.25,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =

            enemy.hitFlash >
            0

                ? "#fff"

                : enemy.color;


        ctx.beginPath();


        ctx.roundRect(

            -enemy.radius *
            0.48,

            -enemy.radius *
            0.2,

            enemy.radius *
            0.96,

            enemy.radius *
            1.15,

            7

        );


        ctx.fill();


        ctx.fillStyle =
            options.skin ||
            "#8c7669";


        ctx.beginPath();


        ctx.arc(

            0,

            -enemy.radius *
            0.55,

            enemy.radius *
            0.42,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            options.head ||
            "#332f35";


        ctx.beginPath();


        ctx.arc(

            0,

            -enemy.radius *
            0.7,

            enemy.radius *
            0.4,

            Math.PI,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =
            options.eye ||
            "#e9d8c5";


        ctx.beginPath();


        ctx.arc(

            -4,

            -enemy.radius *
            0.52,

            2,

            0,

            Math.PI *
            2

        );


        ctx.arc(

            4,

            -enemy.radius *
            0.52,

            2,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.restore();

    }


    function drawEnemyQuadruped(
        enemy,
        options =
            {}
    ) {

        ctx.save();


        ctx.translate(
            enemy.x,
            enemy.y
        );


        ctx.fillStyle =
            "rgba(0,0,0,.22)";


        ctx.beginPath();


        ctx.ellipse(

            0,
            16,

            enemy.radius,
            6,

            0,
            0,
            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =

            enemy.hitFlash >
            0

                ? "#fff"

                : enemy.color;


        ctx.beginPath();


        ctx.ellipse(

            -2,
            0,

            enemy.radius *
            0.9,

            enemy.radius *
            0.55,

            0,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(

            enemy.radius *
            0.65,

            -5,

            enemy.radius *
            0.45,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.strokeStyle =
            enemy.color;


        ctx.lineWidth =
            4;


        ctx.beginPath();


        ctx.moveTo(

            -enemy.radius *
            0.55,

            8

        );


        ctx.lineTo(

            -enemy.radius *
            0.6,

            22

        );


        ctx.moveTo(

            enemy.radius *
            0.35,

            8

        );


        ctx.lineTo(

            enemy.radius *
            0.4,

            22

        );


        ctx.stroke();


        ctx.fillStyle =
            options.eye ||
            "#ffd2a0";


        ctx.beginPath();


        ctx.arc(

            enemy.radius *
            0.78,

            -9,

            2,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.restore();

    }


    function drawSpiderEnemy(
        enemy
    ) {

        ctx.save();


        ctx.translate(
            enemy.x,
            enemy.y
        );


        ctx.strokeStyle =
            enemy.color;


        ctx.lineWidth =
            4;


        for (
            let i = 0;
            i <
            4;
            i++
        ) {

            const y =

                -10 +

                i *
                7;


            ctx.beginPath();


            ctx.moveTo(
                -8,
                y *
                0.4
            );


            ctx.lineTo(
                -22,
                y -
                5
            );


            ctx.moveTo(
                8,
                y *
                0.4
            );


            ctx.lineTo(
                22,
                y -
                5
            );


            ctx.stroke();

        }


        ctx.fillStyle =

            enemy.hitFlash >
            0

                ? "#fff"

                : enemy.color;


        ctx.beginPath();


        ctx.ellipse(
            0,
            3,
            13,
            15,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            0,
            -9,
            9,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#d6b7e8";


        ctx.beginPath();


        ctx.arc(
            -3,
            -11,
            1.6,
            0,
            Math.PI *
            2
        );


        ctx.arc(
            3,
            -11,
            1.6,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.restore();

    }


    function drawBatEnemy(
        enemy
    ) {

        const flap =

            Math.sin(

                state.time *
                10 +

                enemy.x

            ) *
            8;


        ctx.save();


        ctx.translate(

            enemy.x,

            enemy.y -
            8

        );


        ctx.fillStyle =

            enemy.hitFlash >
            0

                ? "#fff"

                : enemy.color;


        ctx.beginPath();


        ctx.moveTo(
            -6,
            0
        );


        ctx.quadraticCurveTo(

            -24,

            -15 -
            flap,

            -31,

            5

        );


        ctx.quadraticCurveTo(
            -17,
            -3,
            -6,
            7
        );


        ctx.closePath();


        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            6,
            0
        );


        ctx.quadraticCurveTo(

            24,

            -15 -
            flap,

            31,

            5

        );


        ctx.quadraticCurveTo(
            17,
            -3,
            6,
            7
        );


        ctx.closePath();


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            0,
            1,
            9,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#e9b6cf";


        ctx.fillRect(
            -4,
            -2,
            2,
            2
        );


        ctx.fillRect(
            2,
            -2,
            2,
            2
        );


        ctx.restore();

    }


    function drawMonarch(
        enemy
    ) {

        ctx.save();


        ctx.translate(
            enemy.x,
            enemy.y
        );


        ctx.fillStyle =
            "rgba(65,38,77,.22)";


        ctx.beginPath();


        ctx.arc(

            0,
            0,

            enemy.radius +
            18 +
            Math.sin(
                state.time *
                3
            ) *
            4,

            0,

            Math.PI *
            2

        );


        ctx.fill();


        ctx.fillStyle =

            enemy.hitFlash >
            0

                ? "#fff"

                : "#3a2d45";


        ctx.beginPath();


        ctx.moveTo(
            -34,
            45
        );


        ctx.lineTo(
            -20,
            -20
        );


        ctx.lineTo(
            0,
            -42
        );


        ctx.lineTo(
            20,
            -20
        );


        ctx.lineTo(
            34,
            45
        );


        ctx.closePath();


        ctx.fill();


        ctx.fillStyle =
            "#8e6aa4";


        ctx.beginPath();


        ctx.arc(
            0,
            -36,
            22,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#c4a1d6";


        ctx.lineWidth =
            5;


        ctx.beginPath();


        ctx.moveTo(
            -17,
            -55
        );


        ctx.lineTo(
            -10,
            -77
        );


        ctx.lineTo(
            0,
            -63
        );


        ctx.lineTo(
            10,
            -79
        );


        ctx.lineTo(
            18,
            -55
        );


        ctx.stroke();


        ctx.fillStyle =
            "#f3d8ff";


        ctx.beginPath();


        ctx.arc(
            -6,
            -37,
            2.5,
            0,
            Math.PI *
            2
        );


        ctx.arc(
            6,
            -37,
            2.5,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        if (
            enemy.monarchStagger >
            0
        ) {

            ctx.fillStyle =
                "#f6d8ff";


            ctx.font =
                "700 20px serif";


            ctx.textAlign =
                "center";


            for (
                let i = 0;
                i <
                4;
                i++
            ) {

                const angle =

                    state.time *
                    4 +

                    i *
                    Math.PI /
                    2;


                ctx.fillText(

                    i %
                    2

                        ? "✦"

                        : "🥷",

                    Math.cos(
                        angle
                    ) *
                    44,

                    -74 +
                    Math.sin(
                        angle
                    ) *
                    8

                );

            }

        }


        ctx.restore();

    }


    function drawEnemy(
        enemy
    ) {

        if (

            enemy.dead ||

            !pointVisible(
                enemy.x,
                enemy.y,
                120
            )

        ) {

            return;

        }


        const quadrupeds = [

            "wolf",

            "boar",

            "hound",

            "rubyHound",

            "hellHound",

            "ancientDeer"

        ];


        const bats = [

            "bat",

            "moth",

            "skyWisp"

        ];


        if (
            enemy.spriteType ===
            "monarch"
        ) {

            drawMonarch(
                enemy
            );

        }

        else if (
            enemy.spriteType ===
            "monarchClone"
        ) {

            drawEnemyHumanoid(

                enemy,

                {

                    skin:
                        "#5a4865",

                    head:
                        "#241e2a",

                    eye:
                        "#d8c4e5",

                    scale:
                        0.9

                }

            );

        }

        else if (
            enemy.spriteType ===
            "spider"
        ) {

            drawSpiderEnemy(
                enemy
            );

        }

        else if (
            enemy.spriteType ===
            "scorpion"
        ) {

            drawSpiderEnemy(
                enemy
            );


            ctx.strokeStyle =
                enemy.color;


            ctx.lineWidth =
                4;


            ctx.beginPath();


            ctx.arc(

                enemy.x -
                8,

                enemy.y -
                11,

                19,

                Math.PI *
                1.1,

                Math.PI *
                1.8

            );


            ctx.stroke();

        }

        else if (
            bats.includes(
                enemy.spriteType
            )
        ) {

            drawBatEnemy(
                enemy
            );

        }

        else if (
            quadrupeds.includes(
                enemy.spriteType
            )
        ) {

            drawEnemyQuadruped(
                enemy
            );

        }

        else {

            const bossScale =

                enemy.type ===
                "progression"

                    ? 1.1

                    : 1;


            drawEnemyHumanoid(

                enemy,

                {

                    scale:
                        bossScale,

                    skin:
                        enemy.spriteType
                            .includes(
                                "hell"
                            )

                            ? "#816054"

                            : "#8c7669",

                    head:
                        enemy.spriteType
                            .includes(
                                "shadow"
                            )

                            ? "#27263a"

                            : "#302e31",

                    eye:
                        enemy.spriteType
                            .includes(
                                "ruby"
                            )

                            ? "#ff9aac"

                            : "#f0dfc8"

                }

            );

        }


        const ratio =
            clamp(

                enemy.hp /
                enemy.maxHp,

                0,
                1

            );


        if (

            enemy.aggressive ||

            enemy.type ===
            "progression" ||

            enemy.type ===
            "resourceBoss"

        ) {

            const width =

                enemy.type ===
                "progression"

                    ? 86

                    : 62;


            ctx.fillStyle =
                "rgba(0,0,0,.48)";


            ctx.fillRect(

                enemy.x -
                width /
                2,

                enemy.y -
                enemy.radius -
                31,

                width,
                6

            );


            ctx.fillStyle =

                enemy.id ===
                "monarch"

                    ? "#9165a9"

                    : "#c35454";


            ctx.fillRect(

                enemy.x -
                width /
                2,

                enemy.y -
                enemy.radius -
                31,

                width *
                ratio,

                6

            );

        }


        ctx.fillStyle =
            "#eee0c9";


        ctx.font =
            "700 10px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            enemy.name,

            enemy.x,

            enemy.y -
            enemy.radius -
            39

        );

    }


    function drawEnemies() {

        state.world
            .enemies
            .forEach(
                drawEnemy
            );

    }


    /* =========================================================
       DROPS
       ========================================================= */

    function drawDrops() {

        state.world
            .drops
            .forEach(
                drop => {

                    if (
                        !pointVisible(
                            drop.x,
                            drop.y,
                            70
                        )
                    ) {

                        return;

                    }


                    const item =
                        ITEMS[
                            drop.itemId
                        ];


                    if (
                        !item
                    ) {

                        return;

                    }


                    const bob =
                        Math.sin(
                            drop.bob
                        ) *
                        5;


                    ctx.save();


                    ctx.globalAlpha =
                        0.25;


                    ctx.fillStyle =
                        "#f2d58a";


                    ctx.beginPath();


                    ctx.arc(

                        drop.x,

                        drop.y +
                        bob,

                        26,

                        0,

                        Math.PI *
                        2

                    );


                    ctx.fill();


                    ctx.globalAlpha =
                        1;


                    ctx.fillStyle =
                        "#e8d6ad";


                    ctx.beginPath();


                    ctx.moveTo(

                        drop.x,

                        drop.y -
                        13 +
                        bob

                    );


                    ctx.lineTo(

                        drop.x +
                        11,

                        drop.y +
                        bob

                    );


                    ctx.lineTo(

                        drop.x,

                        drop.y +
                        13 +
                        bob

                    );


                    ctx.lineTo(

                        drop.x -
                        11,

                        drop.y +
                        bob

                    );


                    ctx.closePath();


                    ctx.fill();


                    ctx.fillStyle =
                        "#5b4936";


                    ctx.font =
                        "700 9px Arial";


                    ctx.textAlign =
                        "center";


                    ctx.fillText(

                        drop.amount >
                        1

                            ? `x${drop.amount}`

                            : "",

                        drop.x,

                        drop.y +
                        29 +
                        bob

                    );


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       PROJÉTEIS
       ========================================================= */

    function drawProjectiles() {

        ensureWorldRuntimeArrays();


        state.world
            .projectiles
            .forEach(
                projectile => {

                    if (
                        !pointVisible(
                            projectile.x,
                            projectile.y,
                            60
                        )
                    ) {

                        return;

                    }


                    ctx.save();


                    const angle =
                        Math.atan2(

                            projectile.dirY,

                            projectile.dirX

                        );


                    ctx.translate(

                        projectile.x,

                        projectile.y

                    );


                    ctx.rotate(
                        angle
                    );


                    ctx.fillStyle =
                        projectile.color;


                    if (

                        [

                            "fairyArrow",

                            "ironShard",

                            "skyLance"

                        ]
                            .includes(
                                projectile.type
                            )

                    ) {

                        ctx.beginPath();


                        ctx.moveTo(
                            12,
                            0
                        );


                        ctx.lineTo(
                            -8,
                            -4
                        );


                        ctx.lineTo(
                            -4,
                            0
                        );


                        ctx.lineTo(
                            -8,
                            4
                        );


                        ctx.closePath();


                        ctx.fill();

                    }

                    else {

                        ctx.globalAlpha =
                            0.25;


                        ctx.beginPath();


                        ctx.arc(

                            0,
                            0,

                            projectile.radius *
                            2.2,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();


                        ctx.globalAlpha =
                            1;


                        ctx.beginPath();


                        ctx.arc(

                            0,
                            0,

                            projectile.radius,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       AVISOS DE ATAQUES
       ========================================================= */

    function drawHazards() {

        state.world
            .hazards
            .forEach(
                hazard => {

                    if (
                        !pointVisible(

                            hazard.x,
                            hazard.y,

                            hazard.radius +
                            80

                        )
                    ) {

                        return;

                    }


                    ctx.save();


                    const warning =
                        !hazard.triggered;


                    const pulse =

                        0.82 +

                        Math.sin(

                            state.time *
                            9 +

                            hazard.x

                        ) *
                        0.08;


                    ctx.strokeStyle =

                        warning

                            ? hazard.color

                            : "rgba(255,230,210,.8)";


                    ctx.globalAlpha =

                        warning

                            ? 0.72

                            : 0.45;


                    ctx.lineWidth =

                        warning

                            ? 3

                            : 6;


                    ctx.setLineDash(

                        warning

                            ? [
                                8,
                                7
                            ]

                            : []

                    );


                    ctx.beginPath();


                    ctx.arc(

                        hazard.x,
                        hazard.y,

                        hazard.radius *
                        pulse,

                        0,

                        Math.PI *
                        2

                    );


                    ctx.stroke();


                    ctx.setLineDash(
                        []
                    );


                    if (
                        warning
                    ) {

                        const ratio =

                            hazard.maxDelay >
                            0

                                ? clamp(

                                    hazard.delay /
                                    hazard.maxDelay,

                                    0,
                                    1

                                )

                                : 0;


                        ctx.globalAlpha =

                            0.16 +

                            (
                                1 -
                                ratio
                            ) *
                            0.16;


                        ctx.fillStyle =
                            hazard.color;


                        ctx.beginPath();


                        ctx.arc(

                            hazard.x,
                            hazard.y,

                            hazard.radius *
                            (
                                1 -
                                ratio *
                                0.35
                            ),

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       PARTÍCULAS
       ========================================================= */

    function drawParticles() {

        state.world
            .particles
            .forEach(
                particle => {

                    const ratio =

                        particle.maxLife >
                        0

                            ? clamp(

                                particle.life /
                                particle.maxLife,

                                0,
                                1

                            )

                            : 1;


                    ctx.save();


                    ctx.globalAlpha =

                        ratio *

                        (
                            particle.alpha ??
                            1
                        );


                    ctx.translate(

                        particle.x,

                        particle.y

                    );


                    ctx.rotate(
                        particle.rotation ||
                        0
                    );


                    ctx.fillStyle =
                        particle.color;


                    if (

                        [

                            "spark",

                            "star"

                        ]
                            .includes(
                                particle.shape
                            )

                    ) {

                        ctx.beginPath();


                        ctx.moveTo(

                            0,

                            -particle.size *
                            1.4

                        );


                        ctx.lineTo(

                            particle.size *
                            0.45,

                            -particle.size *
                            0.4

                        );


                        ctx.lineTo(

                            particle.size *
                            1.4,

                            0

                        );


                        ctx.lineTo(

                            particle.size *
                            0.45,

                            particle.size *
                            0.4

                        );


                        ctx.lineTo(

                            0,

                            particle.size *
                            1.4

                        );


                        ctx.lineTo(

                            -particle.size *
                            0.45,

                            particle.size *
                            0.4

                        );


                        ctx.lineTo(

                            -particle.size *
                            1.4,

                            0

                        );


                        ctx.lineTo(

                            -particle.size *
                            0.45,

                            -particle.size *
                            0.4

                        );


                        ctx.closePath();


                        ctx.fill();

                    }

                    else if (

                        [

                            "rock",

                            "wood"

                        ]
                            .includes(
                                particle.shape
                            )

                    ) {

                        ctx.fillRect(

                            -particle.size /
                            2,

                            -particle.size /
                            2,

                            particle.size,

                            particle.size *
                            0.75

                        );

                    }

                    else {

                        ctx.beginPath();


                        ctx.arc(

                            0,
                            0,

                            particle.size,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       EFEITOS DOS ATAQUES
       ========================================================= */

    function drawEffects() {

        state.world
            .effects
            .forEach(
                effect => {

                    if (
                        !pointVisible(

                            effect.x,
                            effect.y,

                            effect.maxRadius +
                            100

                        )
                    ) {

                        return;

                    }


                    const ratio =

                        effect.maxLife >
                        0

                            ? clamp(

                                effect.life /
                                effect.maxLife,

                                0,
                                1

                            )

                            : 0;


                    const progress =
                        1 -
                        ratio;


                    const radius =
                        lerp(

                            effect.radius,

                            effect.maxRadius,

                            progress

                        );


                    ctx.save();


                    ctx.globalAlpha =
                        Math.max(
                            0,
                            ratio
                        ) *
                        0.8;


                    ctx.strokeStyle =
                        effect.color;


                    ctx.fillStyle =
                        effect.color;


                    if (

                        [

                            "basicSlash",

                            "heavySlash"

                        ]
                            .includes(
                                effect.type
                            )

                    ) {

                        ctx.lineWidth =

                            effect.type ===
                            "heavySlash"

                                ? 11

                                : 7;


                        ctx.beginPath();


                        ctx.arc(

                            effect.x,
                            effect.y,

                            radius,

                            effect.angle -
                            0.72,

                            effect.angle +
                            0.72

                        );


                        ctx.stroke();

                    }

                    else if (
                        effect.type ===
                        "chargeTelegraph"
                    ) {

                        ctx.lineWidth =
                            5;


                        ctx.setLineDash(
                            [
                                14,
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
                            Math.cos(
                                effect.angle
                            ) *
                            effect.maxRadius,

                            effect.y +
                            Math.sin(
                                effect.angle
                            ) *
                            effect.maxRadius

                        );


                        ctx.stroke();


                        ctx.setLineDash(
                            []
                        );

                    }

                    else if (

                        [

                            "groundCrack",

                            "treeFall"

                        ]
                            .includes(
                                effect.type
                            )

                    ) {

                        ctx.lineWidth =
                            4;


                        for (
                            let i = 0;
                            i <
                            7;
                            i++
                        ) {

                            const angle =

                                i /
                                7 *
                                Math.PI *
                                2;


                            ctx.beginPath();


                            ctx.moveTo(

                                effect.x +
                                Math.cos(
                                    angle
                                ) *
                                radius *
                                0.15,

                                effect.y +
                                Math.sin(
                                    angle
                                ) *
                                radius *
                                0.15

                            );


                            ctx.lineTo(

                                effect.x +
                                Math.cos(
                                    angle +
                                    0.12
                                ) *
                                radius,

                                effect.y +
                                Math.sin(
                                    angle +
                                    0.12
                                ) *
                                radius

                            );


                            ctx.stroke();

                        }

                    }

                    else {

                        ctx.lineWidth =
                            effect.width ||
                            4;


                        ctx.beginPath();


                        ctx.arc(

                            effect.x,
                            effect.y,

                            radius,

                            0,

                            Math.PI *
                            2

                        );


                        ctx.stroke();


                        if (

                            [

                                "memoryCast",

                                "levelUp",

                                "dashUnlock",

                                "monarchAwakening",

                                "starField",

                                "memoryStormCore"

                            ]
                                .includes(
                                    effect.type
                                )

                        ) {

                            ctx.globalAlpha *=
                                0.12;


                            ctx.beginPath();


                            ctx.arc(

                                effect.x,
                                effect.y,

                                radius *
                                0.8,

                                0,

                                Math.PI *
                                2

                            );


                            ctx.fill();

                        }

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       NÚMEROS DE DANO
       ========================================================= */

    function drawDamageNumbers() {

        ensureWorldRuntimeArrays();


        state.world
            .damageNumbers
            .forEach(
                number => {

                    if (
                        !pointVisible(
                            number.x,
                            number.y,
                            60
                        )
                    ) {

                        return;

                    }


                    const ratio =

                        number.maxLife >
                        0

                            ? clamp(

                                number.life /
                                number.maxLife,

                                0,
                                1

                            )

                            : 1;


                    ctx.save();


                    ctx.globalAlpha =
                        ratio;


                    ctx.fillStyle =
                        number.color;


                    ctx.font =
                        `${Math.round(
                            17 *
                            (
                                number.scale ||
                                1
                            )
                        )}px Arial`;


                    ctx.textAlign =
                        "center";


                    ctx.strokeStyle =
                        "rgba(0,0,0,.7)";


                    ctx.lineWidth =
                        3;


                    ctx.strokeText(

                        number.text,

                        number.x,
                        number.y

                    );


                    ctx.fillText(

                        number.text,

                        number.x,
                        number.y

                    );


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       ALTAR
       ========================================================= */

    function drawDashAltar(
        x,
        y
    ) {

        ctx.save();


        ctx.fillStyle =
            "#2a2630";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y +
            28,
            86,
            39,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#494150";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y +
            10,
            60,
            28,
            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#211e25";


        ctx.fillRect(
            x -
            17,
            y -
            66,
            34,
            78
        );


        if (
            state.player
                ?.monarchDefeated
        ) {

            ctx.strokeStyle =
                `rgba(
                    200,
                    165,
                    225,
                    ${
                        0.5 +
                        Math.sin(
                            state.time *
                            4
                        ) *
                        0.2
                    }
                )`;


            ctx.lineWidth =
                3;


            ctx.beginPath();


            ctx.arc(

                x,
                y +
                8,

                34 +
                Math.sin(
                    state.time *
                    3
                ) *
                3,

                0,

                Math.PI *
                2

            );


            ctx.stroke();

        }


        ctx.restore();

    }


    function drawTrials() {

        state.world
            .trials
            .forEach(
                trial => {

                    if (
                        !pointVisible(
                            trial.x,
                            trial.y,
                            120
                        )
                    ) {

                        return;

                    }


                    if (
                        trial.dashAltar
                    ) {

                        if (

                            state.area ===
                            "monarchMaze" &&

                            !hasLantern()

                        ) {

                            return;

                        }


                        drawDashAltar(
                            trial.x,
                            trial.y
                        );


                        return;

                    }


                    ctx.save();


                    ctx.strokeStyle =
                        `rgba(
                            245,
                            235,
                            200,
                            ${
                                0.45 +
                                Math.sin(
                                    state.time *
                                    3
                                ) *
                                0.12
                            }
                        )`;


                    ctx.lineWidth =
                        4;


                    ctx.beginPath();


                    ctx.arc(

                        trial.x,
                        trial.y,

                        trial.radius +
                        Math.sin(
                            state.time *
                            3
                        ) *
                        3,

                        0,

                        Math.PI *
                        2

                    );


                    ctx.stroke();


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function drawGates() {

        state.world
            .gates
            .forEach(
                gate => {

                    const unlocked =
                        Boolean(

                            state.player
                                ?.gateUnlocks
                                ?.[
                                    gate.side
                                ]

                        );


                    ctx.save();


                    ctx.fillStyle =

                        unlocked

                            ? "rgba(70,90,66,.24)"

                            : "#4a423d";


                    ctx.fillRect(

                        gate.x,
                        gate.y,

                        gate.w,
                        gate.h

                    );


                    ctx.strokeStyle =

                        unlocked

                            ? "#7b9e76"

                            : "#8c7968";


                    ctx.lineWidth =
                        5;


                    ctx.strokeRect(

                        gate.x,
                        gate.y,

                        gate.w,
                        gate.h

                    );


                    if (
                        !unlocked
                    ) {

                        ctx.strokeStyle =
                            "#28231f";


                        ctx.lineWidth =
                            5;


                        if (
                            gate.w >
                            gate.h
                        ) {

                            for (
                                let x =
                                    gate.x +
                                    22;

                                x <
                                gate.x +
                                gate.w;

                                x +=
                                32
                            ) {

                                ctx.beginPath();


                                ctx.moveTo(
                                    x,
                                    gate.y +
                                    6
                                );


                                ctx.lineTo(
                                    x,
                                    gate.y +
                                    gate.h -
                                    6
                                );


                                ctx.stroke();

                            }

                        }

                        else {

                            for (
                                let y =
                                    gate.y +
                                    22;

                                y <
                                gate.y +
                                gate.h;

                                y +=
                                32
                            ) {

                                ctx.beginPath();


                                ctx.moveTo(
                                    gate.x +
                                    6,
                                    y
                                );


                                ctx.lineTo(
                                    gate.x +
                                    gate.w -
                                    6,
                                    y
                                );


                                ctx.stroke();

                            }

                        }

                    }


                    ctx.restore();

                }
            );

    }


    /* =========================================================
       PORTAIS
       ========================================================= */

    function drawPortals() {

        state.world
            .portals
            .forEach(
                portal => {

                    if (

                        portal.hidden ||

                        !pointVisible(

                            portal.x +
                            portal.w /
                            2,

                            portal.y +
                            portal.h /
                            2,

                            120

                        )

                    ) {

                        return;

                    }


                    const available =
                        portalRequirementMet(
                            portal
                        );


                    ctx.save();


                    ctx.globalAlpha =

                        available

                            ? 1

                            : 0.28;


                    const centerX =

                        portal.x +

                        portal.w /
                        2;


                    const centerY =

                        portal.y +

                        portal.h /
                        2;


                    ctx.strokeStyle =

                        available

                            ? "rgba(216,195,239,.78)"

                            : "rgba(120,115,125,.5)";


                    ctx.lineWidth =
                        4;


                    ctx.strokeRect(

                        portal.x,
                        portal.y,

                        portal.w,
                        portal.h

                    );


                    const gradient =
                        ctx.createRadialGradient(

                            centerX,
                            centerY,
                            4,

                            centerX,
                            centerY,

                            Math.max(
                                portal.w,
                                portal.h
                            )

                        );


                    gradient.addColorStop(

                        0,

                        available

                            ? "rgba(198,166,231,.2)"

                            : "rgba(100,100,100,.08)"

                    );


                    gradient.addColorStop(
                        1,
                        "rgba(80,60,110,0)"
                    );


                    ctx.fillStyle =
                        gradient;


                    ctx.fillRect(

                        portal.x -
                        60,

                        portal.y -
                        60,

                        portal.w +
                        120,

                        portal.h +
                        120

                    );


                    ctx.restore();

                }
            );


        const hell =
            getHellStairPortal();


        if (
            hell
        ) {

            ctx.save();


            for (
                let i = 0;
                i <
                7;
                i++
            ) {

                ctx.fillStyle =

                    i %
                    2

                        ? "#2d2628"

                        : "#3b3032";


                ctx.fillRect(

                    hell.x +
                    i *
                    9,

                    hell.y +
                    i *
                    7,

                    hell.w -
                    i *
                    18,

                    12

                );

            }


            ctx.strokeStyle =
                "rgba(190,111,82,.5)";


            ctx.strokeRect(

                hell.x,
                hell.y,

                hell.w,
                hell.h

            );


            ctx.restore();

        }


        drawGates();

    }


    function drawWorldLabels() {

        ctx.save();


        ctx.textAlign =
            "center";


        ctx.font =
            "700 11px Arial";


        ctx.fillStyle =
            "rgba(245,235,215,.7)";


        state.world
            .trials
            .forEach(
                trial => {

                    if (

                        trial.dashAltar &&

                        state.area ===
                        "monarchMaze" &&

                        !hasLantern()

                    ) {

                        return;

                    }


                    ctx.fillText(

                        trial.title,

                        trial.x,

                        trial.y -
                        trial.radius -
                        17

                    );

                }
            );


        const hell =
            getHellStairPortal();


        if (
            hell
        ) {

            ctx.fillText(

                "ESCADARIA ESQUECIDA",

                hell.x +
                hell.w /
                2,

                hell.y -
                14

            );

        }


        ctx.restore();

    }


    /* =========================================================
       LUZ BLOQUEADA POR PAREDES
       ========================================================= */

    function raySegmentDistance(
        ox,
        oy,
        dx,
        dy,
        x1,
        y1,
        x2,
        y2,
        maxDistance
    ) {

        const sx =
            x2 -
            x1;


        const sy =
            y2 -
            y1;


        const denominator =

            dx *
            sy -

            dy *
            sx;


        if (
            Math.abs(
                denominator
            ) <
            0.000001
        ) {

            return maxDistance;

        }


        const qx =
            x1 -
            ox;


        const qy =
            y1 -
            oy;


        const t =

            (
                qx *
                sy -

                qy *
                sx
            ) /
            denominator;


        const u =

            (
                qx *
                dy -

                qy *
                dx
            ) /
            denominator;


        if (

            t >=
            0 &&

            u >=
            0 &&

            u <=
            1 &&

            t <
            maxDistance

        ) {

            return t;

        }


        return maxDistance;

    }


    function rayRectDistance(
        ox,
        oy,
        dx,
        dy,
        rect,
        maxDistance
    ) {

        let best =
            maxDistance;


        const x =
            rect.x;


        const y =
            rect.y;


        const w =
            rect.w;


        const h =
            rect.h;


        best =
            Math.min(

                best,

                raySegmentDistance(

                    ox,
                    oy,
                    dx,
                    dy,

                    x,
                    y,

                    x +
                    w,
                    y,

                    best

                )

            );


        best =
            Math.min(

                best,

                raySegmentDistance(

                    ox,
                    oy,
                    dx,
                    dy,

                    x +
                    w,
                    y,

                    x +
                    w,
                    y +
                    h,

                    best

                )

            );


        best =
            Math.min(

                best,

                raySegmentDistance(

                    ox,
                    oy,
                    dx,
                    dy,

                    x +
                    w,
                    y +
                    h,

                    x,
                    y +
                    h,

                    best

                )

            );


        best =
            Math.min(

                best,

                raySegmentDistance(

                    ox,
                    oy,
                    dx,
                    dy,

                    x,
                    y +
                    h,

                    x,
                    y,

                    best

                )

            );


        return best;

    }


    function computeLightPolygon(
        x,
        y,
        radius
    ) {

        const blockers =
            state.world
                .obstacles
                .filter(
                    obstacle => {

                        if (
                            !obstacle.blocksLight
                        ) {

                            return false;

                        }


                        const nearestX =
                            clamp(

                                x,

                                obstacle.x,

                                obstacle.x +
                                obstacle.w

                            );


                        const nearestY =
                            clamp(

                                y,

                                obstacle.y,

                                obstacle.y +
                                obstacle.h

                            );


                        return (

                            Math.hypot(

                                x -
                                nearestX,

                                y -
                                nearestY

                            ) <=

                            radius +
                            60

                        );

                    }
                );


        const angles =
            [];


        for (
            let i = 0;
            i <
            96;
            i++
        ) {

            angles.push(

                i /
                96 *
                Math.PI *
                2

            );

        }


        blockers.forEach(
            rect => {

                [

                    [
                        rect.x,
                        rect.y
                    ],

                    [
                        rect.x +
                        rect.w,
                        rect.y
                    ],

                    [
                        rect.x +
                        rect.w,
                        rect.y +
                        rect.h
                    ],

                    [
                        rect.x,
                        rect.y +
                        rect.h
                    ]

                ]
                    .forEach(
                        ([
                            cornerX,
                            cornerY
                        ]) => {

                            const angle =
                                Math.atan2(

                                    cornerY -
                                    y,

                                    cornerX -
                                    x

                                );


                            angles.push(

                                angle -
                                0.00035,

                                angle,

                                angle +
                                0.00035

                            );

                        }
                    );

            }
        );


        angles.sort(
            (
                a,
                b
            ) =>
                a -
                b
        );


        return angles.map(
            angle => {

                const dx =
                    Math.cos(
                        angle
                    );


                const dy =
                    Math.sin(
                        angle
                    );


                let distance =
                    radius;


                blockers.forEach(
                    rect => {

                        distance =
                            Math.min(

                                distance,

                                rayRectDistance(

                                    x,
                                    y,

                                    dx,
                                    dy,

                                    rect,

                                    distance

                                )

                            );

                    }
                );


                return {

                    x:
                        x +
                        dx *
                        distance,

                    y:
                        y +
                        dy *
                        distance

                };

            }
        );

    }


    /* =========================================================
       ESCURIDÃO / LANTERNA
       ========================================================= */

    function drawDarknessOverlay() {

        if (

            state.area !==
            "monarchMaze" ||

            !state.player

        ) {

            return;

        }


        const screenX =

            state.player.x -

            state.camera.x;


        const screenY =

            state.player.y -

            state.camera.y;


        const lantern =
            hasLantern();


        const radius =

            lantern

                ? VISUAL_CONFIG
                    .lantern
                    .radius

                : VISUAL_CONFIG
                    .lantern
                    .noLanternRadius;


        ctx.save();


        ctx.fillStyle =

            lantern

                ? "rgba(0,0,0,.965)"

                : "rgba(0,0,0,.995)";


        ctx.fillRect(

            0,
            0,

            window.innerWidth,
            window.innerHeight

        );


        ctx.globalCompositeOperation =
            "destination-out";


        if (
            !lantern
        ) {

            const gradient =
                ctx.createRadialGradient(

                    screenX,
                    screenY,
                    0,

                    screenX,
                    screenY,
                    radius

                );


            gradient.addColorStop(
                0,
                "rgba(0,0,0,.88)"
            );


            gradient.addColorStop(
                0.72,
                "rgba(0,0,0,.42)"
            );


            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.beginPath();


            ctx.arc(

                screenX,
                screenY,

                radius,

                0,

                Math.PI *
                2

            );


            ctx.fill();


            ctx.restore();


            return;

        }


        const polygon =
            computeLightPolygon(

                state.player.x,

                state.player.y,

                radius

            );


        if (
            polygon.length
        ) {

            ctx.beginPath();


            ctx.moveTo(

                polygon[
                    0
                ].x -
                state.camera.x,

                polygon[
                    0
                ].y -
                state.camera.y

            );


            for (
                let i = 1;
                i <
                polygon.length;
                i++
            ) {

                ctx.lineTo(

                    polygon[
                        i
                    ].x -
                    state.camera.x,

                    polygon[
                        i
                    ].y -
                    state.camera.y

                );

            }


            ctx.closePath();


            ctx.clip();


            const gradient =
                ctx.createRadialGradient(

                    screenX,
                    screenY,
                    0,

                    screenX,
                    screenY,
                    radius

                );


            gradient.addColorStop(
                0,
                "rgba(0,0,0,1)"
            );


            gradient.addColorStop(
                0.55,
                "rgba(0,0,0,.96)"
            );


            gradient.addColorStop(
                0.78,
                "rgba(0,0,0,.62)"
            );


            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(

                screenX -
                radius,

                screenY -
                radius,

                radius *
                2,

                radius *
                2

            );

        }


        ctx.restore();

    }


    /* =========================================================
       SANGUE / TELA VERMELHA
       ========================================================= */

    function drawDamageOverlay() {

        if (

            state.damageFlash <=
            0 &&

            !state.bloodMarks
                .length

        ) {

            return;

        }


        ctx.save();


        if (
            state.damageFlash >
            0
        ) {

            const alpha =
                clamp(

                    state.damageFlash,

                    0,

                    VISUAL_CONFIG
                        .blood
                        .flashMax

                );


            const gradient =
                ctx.createRadialGradient(

                    window.innerWidth /
                    2,

                    window.innerHeight /
                    2,

                    Math.min(

                        window.innerWidth,

                        window.innerHeight

                    ) *
                    0.16,

                    window.innerWidth /
                    2,

                    window.innerHeight /
                    2,

                    Math.max(

                        window.innerWidth,

                        window.innerHeight

                    ) *
                    0.72

                );


            gradient.addColorStop(
                0,
                "rgba(120,0,0,0)"
            );


            gradient.addColorStop(

                0.55,

                `rgba(
                    145,
                    0,
                    0,
                    ${
                        alpha *
                        0.1
                    }
                )`

            );


            gradient.addColorStop(

                1,

                `rgba(
                    195,
                    0,
                    0,
                    ${alpha}
                )`

            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(

                0,
                0,

                window.innerWidth,

                window.innerHeight

            );

        }


        state.bloodMarks
            .forEach(
                mark => {

                    const lifeRatio =
                        clamp(

                            mark.life /
                            (
                                mark.maxLife ||
                                VISUAL_CONFIG
                                    .blood
                                    .markLife
                            ),

                            0,
                            1

                        );


                    const radiusPx =

                        mark.radius *

                        Math.min(

                            window.innerWidth,

                            window.innerHeight

                        );


                    ctx.save();


                    ctx.translate(

                        mark.x *
                        window.innerWidth,

                        mark.y *
                        window.innerHeight

                    );


                    ctx.rotate(
                        mark.rotation
                    );


                    ctx.scale(
                        mark.stretch,
                        1
                    );


                    ctx.fillStyle =
                        `rgba(
                            105,
                            0,
                            10,
                            ${
                                mark.alpha *
                                lifeRatio
                            }
                        )`;


                    ctx.beginPath();


                    ctx.arc(

                        0,
                        0,

                        radiusPx,

                        0,

                        Math.PI *
                        2

                    );


                    ctx.fill();


                    for (
                        let i = 0;
                        i <
                        3;
                        i++
                    ) {

                        const angle =

                            i /
                            3 *
                            Math.PI *
                            2 +

                            mark.rotation;


                        ctx.beginPath();


                        ctx.arc(

                            Math.cos(
                                angle
                            ) *
                            radiusPx *
                            1.2,

                            Math.sin(
                                angle
                            ) *
                            radiusPx *
                            0.8,

                            radiusPx *
                            (
                                0.12 +
                                i *
                                0.04
                            ),

                            0,

                            Math.PI *
                            2

                        );


                        ctx.fill();

                    }


                    ctx.restore();

                }
            );


        ctx.restore();

    }


    /* =========================================================
       BARRA DE BOSS

       Mais baixa e menor.
       Também mede os botões para não ficar atrás.
       ========================================================= */

    function calculateBossBarY(
        width
    ) {

        const centerLeft =

            (
                window.innerWidth -
                width
            ) /
            2;


        const centerRight =

            centerLeft +
            width;


        let y =

            window.innerWidth <
            800

                ? VISUAL_CONFIG
                    .bossBar
                    .topCompact

                : VISUAL_CONFIG
                    .bossBar
                    .topDesktop;


        [

            "inventoryBtn",

            "mapBtn",

            "bookBtn",

            "statusBtnDynamic",

            "saveBtn",

            "menuBtn"

        ]
            .forEach(
                id => {

                    const element =
                        $(id);


                    if (

                        !element ||

                        !element
                            .getBoundingClientRect

                    ) {

                        return;

                    }


                    const rect =
                        element
                            .getBoundingClientRect();


                    const overlapsHorizontally =

                        rect.right >
                        centerLeft &&

                        rect.left <
                        centerRight;


                    if (

                        overlapsHorizontally &&

                        rect.bottom +
                        12 >
                        y

                    ) {

                        y =
                            rect.bottom +
                            12;

                    }

                }
            );


        return Math.min(

            y,

            window.innerHeight *
            0.28

        );

    }


    function drawBossBar() {

        const boss =
            state.bossBarTarget;


        if (

            !boss ||

            boss.dead ||

            boss.hp <=
            0

        ) {

            return;

        }


        const max =
            Math.min(

                VISUAL_CONFIG
                    .bossBar
                    .maxWidth,

                window.innerWidth -
                70

            );


        const width =
            Math.max(

                Math.min(

                    max,

                    window.innerWidth *
                    0.48

                ),

                Math.min(

                    VISUAL_CONFIG
                        .bossBar
                        .minWidth,

                    window.innerWidth -
                    40

                )

            );


        const x =

            (
                window.innerWidth -
                width
            ) /
            2;


        const y =
            calculateBossBarY(
                width
            );


        const height =
            VISUAL_CONFIG
                .bossBar
                .height;


        const ratio =
            clamp(

                boss.hp /
                boss.maxHp,

                0,
                1

            );


        ctx.save();


        ctx.fillStyle =
            "rgba(8,8,12,.88)";


        ctx.fillRect(

            x -
            10,

            y -
            24,

            width +
            20,

            height +
            42

        );


        ctx.fillStyle =
            "rgba(255,255,255,.09)";


        ctx.fillRect(
            x,
            y,
            width,
            height
        );


        const gradient =
            ctx.createLinearGradient(

                x,
                y,

                x +
                width,

                y

            );


        if (
            boss.id ===
            "monarch"
        ) {

            gradient.addColorStop(
                0,
                "#9a69ad"
            );


            gradient.addColorStop(
                1,
                "#56305e"
            );

        }

        else if (
            boss.id ===
            "other_self"
        ) {

            gradient.addColorStop(
                0,
                state.player
                    .color
            );


            gradient.addColorStop(
                1,
                "#4a3c50"
            );

        }

        else {

            gradient.addColorStop(
                0,
                "#cb5d55"
            );


            gradient.addColorStop(
                1,
                "#702d32"
            );

        }


        ctx.fillStyle =
            gradient;


        ctx.fillRect(

            x,
            y,

            width *
            ratio,

            height

        );


        ctx.strokeStyle =
            "rgba(255,255,255,.38)";


        ctx.strokeRect(
            x,
            y,
            width,
            height
        );


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#fff";


        ctx.font =
            "800 13px Arial";


        const stagger =

            boss.id ===
            "monarch" &&

            boss.monarchStagger >
            0

                ? ` • DESORIENTADO ${boss.monarchStagger.toFixed(1)}s`

                : "";


        ctx.fillText(

            `${boss.name}${stagger}`,

            window.innerWidth /
            2,

            y -
            8

        );


        ctx.font =
            "700 10px Arial";


        ctx.fillText(

            `${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`,

            window.innerWidth /
            2,

            y +
            13

        );


        ctx.restore();

    }


    /* =========================================================
       HUD DAS HABILIDADES
       ========================================================= */

    function drawSkillHud() {

        if (

            !state.player ||

            state.houseMode

        ) {

            return;

        }


        const skills =
            CLASS_SKILLS[
                state.player
                    .characterId
            ];


        if (
            !skills
        ) {

            return;

        }


        const slots = [

            "q",

            "r",

            "f"

        ];


        const size =
            48;


        const gap =
            8;


        const total =

            size *
            3 +

            gap *
            2;


        let x =

            window.innerWidth /
            2 -

            total /
            2;


        const y =

            window.innerHeight -
            66;


        ctx.save();


        ctx.textAlign =
            "center";


        slots.forEach(
            slot => {

                const skill =
                    skills[
                        slot
                    ];


                const unlocked =

                    state.player
                        .level >=
                    skill.level;


                const cooldown =

                    state.player
                        .skillCooldowns[
                            slot
                        ] ||
                    0;


                ctx.fillStyle =

                    unlocked

                        ? "rgba(12,14,19,.86)"

                        : "rgba(12,14,19,.55)";


                ctx.fillRect(
                    x,
                    y,
                    size,
                    size
                );


                ctx.strokeStyle =

                    unlocked

                        ? "rgba(255,255,255,.32)"

                        : "rgba(255,255,255,.12)";


                ctx.strokeRect(
                    x,
                    y,
                    size,
                    size
                );


                ctx.fillStyle =
                    "#fff";


                ctx.font =
                    "800 13px Arial";


                ctx.fillText(

                    slot.toUpperCase(),

                    x +
                    size /
                    2,

                    y +
                    16

                );


                ctx.font =
                    "9px Arial";


                ctx.fillText(

                    unlocked

                        ? skill.name
                            .slice(
                                0,
                                8
                            )

                        : `Nv.${skill.level}`,

                    x +
                    size /
                    2,

                    y +
                    34

                );


                if (
                    cooldown >
                    0
                ) {

                    ctx.fillStyle =
                        "rgba(0,0,0,.62)";


                    ctx.fillRect(

                        x,
                        y,

                        size,

                        size *
                        clamp(

                            cooldown /
                            skill.cooldown,

                            0,
                            1

                        )

                    );


                    ctx.fillStyle =
                        "#fff";


                    ctx.font =
                        "700 9px Arial";


                    ctx.fillText(

                        cooldown
                            .toFixed(
                                1
                            ),

                        x +
                        size /
                        2,

                        y +
                        45

                    );

                }


                x +=
                    size +
                    gap;

            }
        );


        if (
            state.player
                .abilities
                ?.dash
        ) {

            const dashX =

                window.innerWidth /
                2 +

                total /
                2 +

                16;


            ctx.fillStyle =
                "rgba(12,14,19,.86)";


            ctx.fillRect(

                dashX,
                y,

                66,
                size

            );


            ctx.strokeStyle =
                "rgba(190,155,230,.55)";


            ctx.strokeRect(

                dashX,
                y,

                66,
                size

            );


            ctx.fillStyle =
                "#fff";


            ctx.font =
                "800 9px Arial";


            ctx.fillText(

                "ESPAÇO",

                dashX +
                33,

                y +
                16

            );


            ctx.font =
                "9px Arial";


            ctx.fillText(

                state.player
                    .dashCooldown >
                0

                    ? state.player
                        .dashCooldown
                        .toFixed(
                            1
                        )

                    : "DASH",

                dashX +
                33,

                y +
                35

            );

        }


        ctx.restore();

    }


    /* =========================================================
       TRANSIÇÃO DE TELA
       ========================================================= */

    function drawTransitionOverlay() {

        const transition =
            state.transition;


        if (
            !transition
        ) {

            return;

        }


        ctx.save();


        ctx.fillStyle =
            `rgba(
                2,
                3,
                5,
                ${
                    clamp(
                        transition.alpha,
                        0,
                        1
                    )
                }
            )`;


        ctx.fillRect(

            0,
            0,

            window.innerWidth,

            window.innerHeight

        );


        if (

            transition.label &&

            transition.alpha >
            0.56

        ) {

            const alpha =
                clamp(

                    (
                        transition.alpha -
                        0.56
                    ) /
                    0.44,

                    0,
                    1

                );


            ctx.globalAlpha =
                alpha;


            ctx.textAlign =
                "center";


            ctx.fillStyle =
                "#eadfca";


            ctx.font =
                "700 20px Georgia";


            ctx.fillText(

                transition.label,

                window.innerWidth /
                2,

                window.innerHeight /
                2

            );


            ctx.fillStyle =
                "rgba(234,223,202,.5)";


            ctx.fillRect(

                window.innerWidth /
                2 -
                85,

                window.innerHeight /
                2 +
                18,

                170,
                1

            );

        }


        ctx.restore();

    }


    /* =========================================================
       MINIMAPA
       ========================================================= */

    function drawMinimap() {

        miniCtx.clearRect(

            0,
            0,

            miniCanvas.width,

            miniCanvas.height

        );


        if (

            !state.player ||

            !hasMinimap()

        ) {

            return;

        }


        const width =
            miniCanvas.width;


        const height =
            miniCanvas.height;


        miniCtx.fillStyle =
            "#111418";


        miniCtx.fillRect(
            0,
            0,
            width,
            height
        );


        if (
            state.houseMode
        ) {

            miniCtx.fillStyle =
                "#d9c9a6";


            miniCtx.font =
                "700 11px Arial";


            miniCtx.textAlign =
                "center";


            miniCtx.fillText(

                "INTERIOR",

                width /
                2,

                height /
                2

            );


            return;

        }


        if (
            state.area ===
            "monarchMaze"
        ) {

            miniCtx.fillStyle =
                "#040405";


            miniCtx.fillRect(
                0,
                0,
                width,
                height
            );


            miniCtx.fillStyle =
                "#bcb6ac";


            miniCtx.font =
                "700 10px Arial";


            miniCtx.textAlign =
                "center";


            miniCtx.fillText(

                hasLantern()

                    ? "LABIRINTO ESCURO"

                    : "ESCURIDÃO TOTAL",

                width /
                2,

                18

            );


            miniCtx.fillStyle =
                "#fff";


            miniCtx.beginPath();


            miniCtx.arc(

                width /
                2,

                height /
                2,

                4,

                0,

                Math.PI *
                2

            );


            miniCtx.fill();


            return;

        }


        const scaleX =

            width /

            state.world.width;


        const scaleY =

            height /

            state.world.height;


        state.world
            .paths
            .forEach(
                path => {

                    if (
                        !path.points
                            ?.length
                    ) {

                        return;

                    }


                    miniCtx.strokeStyle =
                        "rgba(195,169,116,.67)";


                    miniCtx.lineWidth =
                        Math.max(

                            1,

                            (
                                path.width ||
                                80
                            ) *

                            (
                                scaleX +
                                scaleY
                            ) *
                            0.5

                        );


                    miniCtx.lineCap =
                        "round";


                    miniCtx.beginPath();


                    miniCtx.moveTo(

                        path.points[
                            0
                        ].x *
                        scaleX,

                        path.points[
                            0
                        ].y *
                        scaleY

                    );


                    for (
                        let i = 1;
                        i <
                        path.points.length;
                        i++
                    ) {

                        miniCtx.lineTo(

                            path.points[
                                i
                            ].x *
                            scaleX,

                            path.points[
                                i
                            ].y *
                            scaleY

                        );

                    }


                    miniCtx.stroke();

                }
            );


        state.world
            .buildings
            .forEach(
                building => {

                    miniCtx.fillStyle =
                        "#926e52";


                    miniCtx.fillRect(

                        building.x *
                        scaleX,

                        building.y *
                        scaleY,

                        Math.max(

                            2,

                            building.w *
                            scaleX

                        ),

                        Math.max(

                            2,

                            building.h *
                            scaleY

                        )

                    );

                }
            );


        miniCtx.fillStyle =
            "#fff";


        miniCtx.beginPath();


        miniCtx.arc(

            state.player.x *
            scaleX,

            state.player.y *
            scaleY,

            4,

            0,

            Math.PI *
            2

        );


        miniCtx.fill();

    }


    /* =========================================================
       MAPA GRANDE
       ========================================================= */

    function drawLargeMap() {

        if (

            !state.player ||

            !hasMinimap()

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


        mapCtx.fillStyle =
            "#15181b";


        mapCtx.fillRect(
            0,
            0,
            width,
            height
        );


        if (

            state.area ===
            "monarchMaze" &&

            !hasLantern()

        ) {

            mapCtx.fillStyle =
                "#050506";


            mapCtx.fillRect(
                0,
                0,
                width,
                height
            );


            mapCtx.fillStyle =
                "#bcb6ac";


            mapCtx.font =
                "700 22px Arial";


            mapCtx.textAlign =
                "center";


            mapCtx.fillText(

                "ESCURIDÃO TOTAL",

                width /
                2,

                height /
                2

            );


            return;

        }


        const scaleX =

            width /

            state.world.width;


        const scaleY =

            height /

            state.world.height;


        state.world
            .paths
            .forEach(
                path => {

                    if (
                        !path.points
                            ?.length
                    ) {

                        return;

                    }


                    mapCtx.strokeStyle =
                        "rgba(195,169,116,.72)";


                    mapCtx.lineWidth =
                        Math.max(

                            2,

                            (
                                path.width ||
                                80
                            ) *

                            (
                                scaleX +
                                scaleY
                            ) *
                            0.5

                        );


                    mapCtx.lineCap =
                        "round";


                    mapCtx.beginPath();


                    mapCtx.moveTo(

                        path.points[
                            0
                        ].x *
                        scaleX,

                        path.points[
                            0
                        ].y *
                        scaleY

                    );


                    for (
                        let i = 1;
                        i <
                        path.points.length;
                        i++
                    ) {

                        mapCtx.lineTo(

                            path.points[
                                i
                            ].x *
                            scaleX,

                            path.points[
                                i
                            ].y *
                            scaleY

                        );

                    }


                    mapCtx.stroke();

                }
            );


        if (
            state.area !==
            "monarchMaze"
        ) {

            state.world
                .buildings
                .forEach(
                    building => {

                        mapCtx.fillStyle =
                            "#997255";


                        mapCtx.fillRect(

                            building.x *
                            scaleX,

                            building.y *
                            scaleY,

                            Math.max(

                                3,

                                building.w *
                                scaleX

                            ),

                            Math.max(

                                3,

                                building.h *
                                scaleY

                            )

                        );

                    }
                );

        }


        mapCtx.fillStyle =
            "#fff";


        mapCtx.beginPath();


        mapCtx.arc(

            state.player.x *
            scaleX,

            state.player.y *
            scaleY,

            6,

            0,

            Math.PI *
            2

        );


        mapCtx.fill();

    }


    /* =========================================================
       DRAW DO MUNDO
       ========================================================= */

    function drawWorld() {

        const shakeX =

            state.screenShake >
            0

                ? random(

                    -state.screenShakePower,

                    state.screenShakePower

                )

                : 0;


        const shakeY =

            state.screenShake >
            0

                ? random(

                    -state.screenShakePower,

                    state.screenShakePower

                )

                : 0;


        ctx.clearRect(

            0,
            0,

            window.innerWidth,

            window.innerHeight

        );


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

            drawEffects();

            drawPlayer();

            drawParticles();

            drawDamageNumbers();

        }

        else {

            drawGround();

            drawPaths();

            drawDecorations();

            drawBuildings();

            drawTrees();

            drawResources();

            drawFoods();

            drawObstacles();

            drawTrials();

            drawPortals();

            drawDrops();

            drawHazards();

            drawEffects();

            drawProjectiles();

            drawNPCs();

            drawEnemies();

            drawPlayer();

            drawParticles();

            drawDamageNumbers();

            drawWorldLabels();

        }


        ctx.restore();


        drawDarknessOverlay();

        drawBossBar();

        drawSkillHud();

        drawDamageOverlay();

        drawMinimap();

        drawTransitionOverlay();

    }


    /* =========================================================
       ESCOLHA FINAL
       ========================================================= */

    function ensureFinalChoicePanel() {

        let panel =
            $("finalChoicePanelDynamic");


        if (
            panel
        ) {

            return panel;

        }


        panel =
            document
                .createElement(
                    "section"
                );


        panel.id =
            "finalChoicePanelDynamic";


        panel.className =
            "panel hidden";


        panel.innerHTML = `

            <div class="panel-header">

                <h2>
                    O OUTRO EU
                </h2>

            </div>

            <div class="panel-content">

                <p>
                    “Aceite a Quietude. Ou prove que ainda existe algo pelo qual lutar.”
                </p>

                <div class="panel-actions">

                    <button
                        type="button"
                        id="finalJoinBtnDynamic"
                        class="secondary-btn"
                    >
                        ACEITAR A QUIETUDE
                    </button>

                    <button
                        type="button"
                        id="finalFightBtnDynamic"
                        class="primary-btn"
                    >
                        LUTAR
                    </button>

                </div>

            </div>

        `;


        must(
            "gameScreen"
        )
            .appendChild(
                panel
            );


        return panel;

    }


    function openFinalChoice(
        enemy
    ) {

        state.finalChoiceShown =
            true;


        state.paused =
            true;


        state.pauseReason =
            "finalChoice";


        const panel =
            ensureFinalChoicePanel();


        panel.classList
            .remove(
                "hidden"
            );


        const join =
            $("finalJoinBtnDynamic");


        const fight =
            $("finalFightBtnDynamic");


        join.onclick =
            () => {

                state.player
                    .finalChoice =
                    "join";


                panel.classList
                    .add(
                        "hidden"
                    );


                startDialogue(

                    {
                        name:
                            "VEYRA"
                    },

                    [

                        "Você escolheu a Quietude Absoluta.",

                        "Veyra finalmente ficou em silêncio."

                    ]

                );

            };


        fight.onclick =
            () => {

                state.player
                    .finalChoice =
                    "fight";


                panel.classList
                    .add(
                        "hidden"
                    );


                state.paused =
                    false;


                state.pauseReason =
                    null;


                enemy.accepted =
                    true;


                enemy.aggressive =
                    true;


                state.bossBarTarget =
                    enemy;


                createEffect({

                    type:
                        "finalAwakening",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    color:
                        state.player
                            .color,

                    life:
                        1,

                    maxLife:
                        1,

                    radius:
                        20,

                    maxRadius:
                        130

                });

            };

    }


    /* =========================================================
       VIAGEM
       ========================================================= */

    function cancelTravel() {

        state.travel =
            null;


        $("travelPanel")
            ?.classList
            .add(
                "hidden"
            );


        if (
            state.pauseReason ===
            "travel"
        ) {

            state.paused =
                false;


            state.pauseReason =
                null;

        }

    }


    function confirmTravel() {

        const travel =
            state.travel;


        if (
            !travel
                ?.target
        ) {

            cancelTravel();


            return;

        }


        const target =
            travel.target;


        const spawn =
            travel.spawn;


        cancelTravel();


        transitionToRegion(

            target,

            {
                spawn
            }

        );

    }


    /* =========================================================
       SAVE
       ========================================================= */

    function cleanPlayerForSave() {

        const player =
            JSON.parse(

                JSON.stringify(

                    state.player,

                    (
                        key,
                        value
                    ) =>

                        value instanceof
                        Set

                            ? [
                                ...value
                            ]

                            : value

                )

            );


        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.attackAnim =
            0;


        player.hurtAnim =
            0;


        player.invincible =
            0;


        player.stunTimer =
            0;


        return player;

    }


    function makeSavePayload() {

        return {

            version:
                GAME_VERSION,

            area:
                state.area,

            player:
                cleanPlayerForSave(),

            houseMode:
                state.houseMode,

            currentHouseId:
                state.currentHouse
                    ?.id ||
                null,

            houseReturn:
                state.houseReturn,

            savedAt:
                new Date()
                    .toISOString()

        };

    }


    function saveGame(
        showMessage =
            true
    ) {

        if (
            !state.player
        ) {

            return false;

        }


        try {

            localStorage
                .setItem(

                    SAVE_KEY,

                    JSON.stringify(
                        makeSavePayload()
                    )

                );


            if (
                showMessage
            ) {

                showToast(
                    "Jogo salvo com sucesso."
                );

            }


            updateContinueButton();


            return true;

        }

        catch (
            error
        ) {

            console.error(
                "Erro ao salvar VEYRA:",
                error
            );


            if (
                showMessage
            ) {

                showToast(
                    "Não foi possível salvar o jogo."
                );

            }


            return false;

        }

    }


    function getSaveEntry() {

        try {

            const current =
                localStorage
                    .getItem(
                        SAVE_KEY
                    );


            if (
                current
            ) {

                return {

                    key:
                        SAVE_KEY,

                    raw:
                        current,

                    legacy:
                        false

                };

            }


            for (
                const key of
                LEGACY_SAVE_KEYS
            ) {

                const raw =
                    localStorage
                        .getItem(
                            key
                        );


                if (
                    raw
                ) {

                    return {

                        key,

                        raw,

                        legacy:
                            true

                    };

                }

            }

        }

        catch (
            error
        ) {

            console.error(
                "Erro lendo save:",
                error
            );

        }


        return null;

    }


    function hasSave() {

        return Boolean(
            getSaveEntry()
        );

    }


    function normalizeLegacyInventory(
        inventory =
            {}
    ) {

        const result = {
            ...inventory
        };


        const aliases = {

            flauta:
                "flautaMemoria",

            flautaDaMemoria:
                "flautaMemoria",

            fragmento:
                "fragmentoMemoria",

            fragmento_memoria:
                "fragmentoMemoria",

            armaduraFolhas:
                "armaduraFolha",

            armaduraAlgodão:
                "armaduraAlgodao"

        };


        Object
            .entries(
                aliases
            )
            .forEach(
                ([
                    oldId,
                    newId
                ]) => {

                    if (

                        (
                            result[
                                oldId
                            ] ||
                            0
                        ) >
                        0 &&

                        !(
                            result[
                                newId
                            ] >
                            0
                        )

                    ) {

                        result[
                            newId
                        ] =
                            result[
                                oldId
                            ];

                    }

                }
            );


        return result;

    }


    /* =========================================================
       REPARO DE SAVE ANTIGO
       ========================================================= */

    function repairLoadedPlayer(
        character
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        player.characterId =
            character.id;


        player.name =
            String(

                player.name ||

                character.name ||

                "Viajante"

            );


        player.className =
            character.className;


        player.icon =
            character.icon;


        player.color =
            character.color;


        player.sprite = {

            ...character.sprite,

            ...(
                player.sprite ||
                {}
            )

        };


        player.radius =
            finiteNumber(

                player.radius,

                VISUAL_CONFIG
                    .sprite
                    .playerRadius

            );


        player.facing =
            player.facing ||
            "down";


        player.walkTime =
            0;


        player.attackAnim =
            0;


        player.hurtAnim =
            0;


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


        const legacyInventory =
            normalizeLegacyInventory(

                player.inventory ||
                {}

            );


        player.inventory =
            {};


        Object
            .keys(
                ITEMS
            )
            .forEach(
                id => {

                    player.inventory[
                        id
                    ] =
                        Math.max(

                            0,

                            Math.floor(

                                finiteNumber(

                                    legacyInventory[
                                        id
                                    ],

                                    0

                                )

                            )

                        );

                }
            );


        if (

            !player.inventory
                .espadaSimples &&

            !player.equipment
                ?.weapon

        ) {

            player.inventory
                .espadaSimples =
                1;

        }


        if (
            !player.inventory
                .machado
        ) {

            player.inventory
                .machado =
                1;

        }


        player.equipment = {

            weapon:
                "espadaSimples",

            armor:
                null,

            tool:
                "machado",

            ...(
                player.equipment ||
                {}
            )

        };


        if (

            player.equipment
                .weapon &&

            !ITEMS[
                player.equipment
                    .weapon
            ]

        ) {

            player.equipment
                .weapon =
                "espadaSimples";

        }


        if (

            player.equipment
                .armor &&

            !ITEMS[
                player.equipment
                    .armor
            ]

        ) {

            player.equipment
                .armor =
                null;

        }


        if (

            player.equipment
                .tool &&

            !ITEMS[
                player.equipment
                    .tool
            ]

        ) {

            player.equipment
                .tool =
                "machado";

        }


        if (
            player.equipment
                .weapon ===
            "espadaSimples"
        ) {

            player.inventory
                .espadaSimples =
                Math.max(

                    1,

                    player.inventory
                        .espadaSimples

                );

        }


        if (
            player.equipment
                .tool ===
            "machado"
        ) {

            player.inventory
                .machado =
                Math.max(

                    1,

                    player.inventory
                        .machado

                );

        }


        player.inventoryWeightLimit =
            Math.max(

                60,

                finiteNumber(

                    player.inventoryWeightLimit,

                    100

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

                Math.floor(

                    finiteNumber(
                        player.xp,
                        0
                    )

                )

            );


        player.xpToNext =
            Math.max(

                100,

                Math.floor(

                    finiteNumber(

                        player.xpToNext,

                        calculateXpToNext(
                            player.level
                        )

                    )

                )

            );


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


        player.money =
            Math.max(

                0,

                Math.floor(

                    finiteNumber(
                        player.money,
                        0
                    )

                )

            );


        player.memory =
            clamp(

                finiteNumber(
                    player.memory,
                    0
                ),

                0,

                100

            );


        player.stats = {

            strength:
                0,

            energy:
                0,

            fatigue:
                0,

            hunger:
                0,

            hp:
                0,

            ...(
                player.stats ||
                {}
            )

        };


        Object
            .keys(
                STAT_CONFIG
            )
            .forEach(
                key => {

                    player.stats[
                        key
                    ] =
                        clamp(

                            Math.floor(

                                finiteNumber(

                                    player.stats[
                                        key
                                    ],

                                    0

                                )

                            ),

                            0,

                            STAT_CONFIG[
                                key
                            ]
                                .cap

                        );

                }
            );


        player.quest =
            player.quest ||
            {};


        player.quest.wood = {

            state:
                "none",

            need:
                10,

            rewardXP:
                100,

            rewardMoney:
                80,

            rewarded:
                false,

            ...(
                player.quest
                    .wood ||
                {}
            )

        };


        player.quest.coal = {

            state:
                "none",

            need:
                8,

            rewardXP:
                130,

            rewardMoney:
                110,

            rewarded:
                false,

            ...(
                player.quest
                    .coal ||
                {}
            )

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


        player.hellTypesDefeated =
            player.hellTypesDefeated ||
            {};


        player.secretsFound =

            Array.isArray(
                player.secretsFound
            )

                ? player.secretsFound

                : [];


        player.collected =
            player.collected ||
            {};


        player.abilities = {

            dash:
                false,

            route2:
                false,

            route3:
                false,

            ...(
                player.abilities ||
                {}
            )

        };


        player.gateDialogueIndex = {

            north:
                0,

            west:
                0,

            south:
                0,

            ...(
                player.gateDialogueIndex ||
                {}
            )

        };


        player.gateUnlocks = {

            north:
                false,

            west:
                false,

            south:
                false,

            ...(
                player.gateUnlocks ||
                {}
            )

        };


        player.worldSeeds =
            player.worldSeeds ||
            {};


        Object
            .keys(
                REGIONS
            )
            .forEach(
                (
                    area,
                    index
                ) => {

                    if (
                        !player.worldSeeds[
                            area
                        ]
                    ) {

                        player.worldSeeds[
                            area
                        ] =
                            hashString(

                                `${player.name}:${area}:${index}:v19`

                            );

                    }

                }
            );


        player.skyTrial = {

            started:
                false,

            wave:
                0,

            activeWave:
                0,

            complete:
                false,

            ...(
                player.skyTrial ||
                {}
            )

        };


        player.monarchAwakened =
            Boolean(
                player.monarchAwakened
            );


        player.monarchDefeated =
            Boolean(
                player.monarchDefeated
            );


        player.dashPurchased =
            Boolean(
                player.dashPurchased
            );


        player.flutePlayed =
            Boolean(
                player.flutePlayed
            );


        player.fluteRewardGranted =
            Boolean(
                player.fluteRewardGranted
            );


        player.finalChoice =
            player.finalChoice ||
            null;


        player.finalDefeated =
            Boolean(
                player.finalDefeated
            );


        player.minimapOwned =
            Boolean(

                player.minimapOwned ||

                player.inventory
                    .minimapa >
                0

            );


        player.lanternOwned =
            Boolean(

                player.lanternOwned ||

                player.inventory
                    .lanterna >
                0

            );


        player.checkpoint =
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


        player.skillCooldowns = {

            q:
                0,

            r:
                0,

            f:
                0

        };


        player.itemCooldowns =
            {};


        player.activePotionBuffs =
            [];


        player.attackCooldown =
            0;


        player.dashCooldown =
            0;


        player.invincible =
            0;


        player.stunTimer =
            0;


        player.shieldTimer =
            0;


        player.damageReduction =
            0;


        player.adaptiveBuff =
            false;


        player.adaptiveTimer =
            0;


        player.playerDash =
            null;


        player.zephyrDash =
            null;


        player.dead =
            false;


        recalculatePlayerStats();


        player.hp =
            clamp(

                finiteNumber(

                    player.hp,

                    player.maxHp

                ),

                1,

                player.maxHp

            );


        player.magic =
            clamp(

                finiteNumber(

                    player.magic,

                    player.maxMagic

                ),

                0,

                player.maxMagic

            );


        player.energy =
            clamp(

                finiteNumber(

                    player.energy,

                    player.maxEnergy

                ),

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


        sanitizeRuntimePlayer();

    }


    /* =========================================================
       LOAD
       ========================================================= */

    function loadGame() {

        const entry =
            getSaveEntry();


        if (
            !entry
        ) {

            return false;

        }


        try {

            const save =
                JSON.parse(
                    entry.raw
                );


            if (
                !save
                    ?.player
            ) {

                return false;

            }


            const character =
                CHARACTERS
                    .find(
                        item =>
                            item.id ===
                            save.player
                                .characterId
                    );


            if (
                !character
            ) {

                return false;

            }


            state.player =
                save.player;


            repairLoadedPlayer(
                character
            );


            state.area =

                REGIONS[
                    save.area
                ]

                    ? save.area

                    : "village";


            state.houseMode =
                false;


            state.currentHouse =
                null;


            state.houseReturn =
                null;


            state.dialogue =
                null;


            state.travel =
                null;


            state.battle =
                null;


            state.questNPC =
                null;


            state.shopNPC =
                null;


            state.bossBarTarget =
                null;


            state.transition =
                null;


            state.transitionQueue =
                [];


            state.damageFlash =
                0;


            state.bloodMarks =
                [];


            state.keys.clear();


            state.portalCooldown =
                0;


            state.holdAction =
                null;


            state.autosaveTimer =
                0;


            buildWorld();


            if (

                save.houseMode &&

                state.area ===
                "village" &&

                save.currentHouseId

            ) {

                const building =
                    state.world
                        .buildings
                        .find(
                            item =>
                                item.id ===
                                save.currentHouseId
                        );


                if (
                    building
                        ?.enterable
                ) {

                    state.houseReturn =
                        save.houseReturn ||
                        null;


                    enterHouseImmediate(

                        building,

                        false

                    );

                }

            }


            if (
                !state.houseMode
            ) {

                state.player.x =
                    clamp(

                        finiteNumber(

                            state.player.x,

                            getDefaultSpawn(
                                state.area
                            ).x

                        ),

                        90,

                        state.world.width -
                        90

                    );


                state.player.y =
                    clamp(

                        finiteNumber(

                            state.player.y,

                            getDefaultSpawn(
                                state.area
                            ).y

                        ),

                        90,

                        state.world.height -
                        90

                    );

            }


            showScreen(

                "game",

                {
                    animate:
                        false
                }

            );


            state.running =
                true;


            state.paused =
                false;


            state.pauseReason =
                null;


            state.lastTime =
                performance.now();


            updateCamera(
                0.016
            );


            updateHUD();


            startTransition({

                label:
                    REGIONS[
                        state.area
                    ]
                        .name,

                startBlack:
                    true,

                hold:
                    0.3,

                fadeIn:
                    0.7,

                done:
                    () => {

                        if (
                            entry.legacy
                        ) {

                            saveGame(
                                false
                            );


                            showToast(

                                "Save anterior carregado e atualizado para a V19.",

                                3400

                            );

                        }

                        else {

                            showToast(
                                "Jogo carregado."
                            );

                        }

                    }

            });


            requestAnimationFrame(
                gameLoop
            );


            return true;

        }

        catch (
            error
        ) {

            console.error(
                "Save inválido:",
                error
            );


            showToast(
                "O save não pôde ser carregado."
            );


            return false;

        }

    }


    function updateContinueButton() {

        const button =
            $("continueBtn");


        const hint =
            $("continueHint");


        const exists =
            hasSave();


        if (
            button
        ) {

            button.disabled =
                !exists;

        }


        if (
            hint
        ) {

            hint.textContent =

                exists

                    ? "Existe um jogo salvo neste navegador."

                    : "Nenhum jogo salvo encontrado.";

        }

    }


    /* =========================================================
       VOLTAR AO MENU
       ========================================================= */

    function returnToMenu() {

        if (
            state.player
        ) {

            saveGame(
                false
            );

        }


        state.running =
            false;


        state.paused =
            false;


        state.pauseReason =
            null;


        state.keys.clear();


        state.pointer.down =
            false;


        cancelHoldInteraction();


        state.dialogue =
            null;


        state.travel =
            null;


        state.battle =
            null;


        state.transition =
            null;


        state.transitionQueue =
            [];


        state.bossBarTarget =
            null;


        closeGameplayPanels();


        $("dialogueBox")
            ?.classList
            .add(
                "hidden"
            );


        $("travelPanel")
            ?.classList
            .add(
                "hidden"
            );


        $("battlePanel")
            ?.classList
            .add(
                "hidden"
            );


        $("deathPanel")
            ?.classList
            .add(
                "hidden"
            );


        showScreen(
            "menu"
        );


        updateContinueButton();

    }


    /* =========================================================
       ESC
       ========================================================= */

    function closeTopOverlay() {

        if (
            state.dialogue
        ) {

            state.dialogue =
                null;


            $("dialogueBox")
                ?.classList
                .add(
                    "hidden"
                );


            return true;

        }


        if (
            state.battle
        ) {

            declineBattle();


            return true;

        }


        if (
            gameplayPanelOpen()
        ) {

            closeGameplayPanels();


            return true;

        }


        return false;

    }


    /* =========================================================
       MOUSE
       ========================================================= */

    function updatePointerPosition(
        event
    ) {

        const rect =
            canvas
                .getBoundingClientRect();


        state.pointer.x =

            event.clientX -

            rect.left;


        state.pointer.y =

            event.clientY -

            rect.top;


        state.pointer.worldX =

            state.pointer.x +

            state.camera.x;


        state.pointer.worldY =

            state.pointer.y +

            state.camera.y;

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


        if (

            !screens.game
                .classList
                .contains(
                    "active"
                ) ||

            !state.player ||

            state.transition ||

            state.dialogue ||

            state.battle ||

            gameplayPanelOpen() ||

            state.player
                .dead

        ) {

            return;

        }


        /*
            IMPORTANTE:
            somente pointerdown.

            Segurar mouse NÃO fica
            atacando automaticamente.
        */

        performAttack();

    }


    /* =========================================================
       TECLADO
       ========================================================= */

    function handleKeyDown(
        event
    ) {

        const key =
            event.key
                .toLowerCase();


        const movement = [

            "w",

            "a",

            "s",

            "d",

            "arrowup",

            "arrowdown",

            "arrowleft",

            "arrowright"

        ];


        if (
            movement.includes(
                key
            )
        ) {

            event.preventDefault();


            state.keys.add(
                key
            );


            return;

        }


        if (
            key ===
            "escape"
        ) {

            event.preventDefault();


            if (
                closeTopOverlay()
            ) {

                return;

            }


            if (
                screens.game
                    .classList
                    .contains(
                        "active"
                    )
            ) {

                returnToMenu();

            }


            return;

        }


        if (

            !screens.game
                .classList
                .contains(
                    "active"
                ) ||

            !state.player

        ) {

            return;

        }


        if (
            state.dialogue
        ) {

            if (

                !event.repeat &&

                [

                    "enter",

                    "e",

                    " "

                ]
                    .includes(
                        key
                    )

            ) {

                event.preventDefault();


                advanceDialogue();

            }


            return;

        }


        if (

            state.transition ||

            state.player
                .dead

        ) {

            return;

        }


        if (
            key ===
            "e"
        ) {

            if (
                !event.repeat
            ) {

                state.keys.add(
                    "e"
                );


                if (
                    !beginHoldInteraction()
                ) {

                    playerAction();

                }

            }


            return;

        }


        if (
            event.repeat
        ) {

            return;

        }


        if (
            key ===
            "z"
        ) {

            handleZ();

        }

        else if (

            key ===
            "q" ||

            key ===
            "r" ||

            key ===
            "f"

        ) {

            useSkill(
                key
            );

        }

        else if (
            key ===
            " "
        ) {

            event.preventDefault();


            attemptUniversalDash();

        }

        else if (
            key ===
            "i"
        ) {

            openInventoryPanel();

        }

        else if (
            key ===
            "m"
        ) {

            openMapPanel();

        }

        else if (
            key ===
            "l"
        ) {

            openBookPanel();

        }

        else if (
            key ===
            "p"
        ) {

            openStatusPanel();

        }

        else if (
            key ===
            "1"
        ) {

            useItem(
                "pocao"
            );

        }

        else if (
            key ===
            "2"
        ) {

            useItem(
                "elixir"
            );

        }

    }


    function handleKeyUp(
        event
    ) {

        const key =
            event.key
                .toLowerCase();


        state.keys.delete(
            key
        );


        if (

            key ===
            "e" &&

            state.holdAction

        ) {

            cancelHoldInteraction();

        }

    }


    /* =========================================================
       EVENTOS
       ========================================================= */

    function bindClick(
        id,
        callback
    ) {

        const element =
            $(id);


        if (
            element
        ) {

            element.addEventListener(
                "click",
                callback
            );

        }

    }


    function bindInventoryTabs() {

        document
            .querySelectorAll(

                "#inventoryTabs [data-cat], #inventoryTabs [data-category], #inventoryTabs .tab"

            )
            .forEach(
                tab => {

                    if (
                        tab.dataset
                            .v19Bound ===
                        "1"
                    ) {

                        return;

                    }


                    tab.dataset
                        .v19Bound =
                        "1";


                    tab.addEventListener(
                        "click",
                        () => {

                            const category =

                                tab.dataset
                                    .cat ||

                                tab.dataset
                                    .category ||

                                tab.textContent
                                    .trim()
                                    .toLowerCase();


                            state.inventoryCategory =
                                category ||
                                "all";


                            document
                                .querySelectorAll(
                                    "#inventoryTabs .tab"
                                )
                                .forEach(
                                    item =>

                                        item.classList
                                            .toggle(
                                                "active",
                                                item ===
                                                tab
                                            )
                                );


                            renderInventory();

                        }
                    );

                }
            );

    }


    function bindShopTabs() {

        document
            .querySelectorAll(

                "#shopTabs [data-shop], #shopTabs .tab"

            )
            .forEach(
                tab => {

                    if (
                        tab.dataset
                            .v19Bound ===
                        "1"
                    ) {

                        return;

                    }


                    tab.dataset
                        .v19Bound =
                        "1";


                    tab.addEventListener(
                        "click",
                        () => {

                            const raw =
                                (
                                    tab.dataset
                                        .shop ||

                                    tab.textContent ||

                                    ""
                                )
                                    .toLowerCase();


                            setShopMode(

                                raw.includes(
                                    "vend"
                                )

                                    ? "sell"

                                    : "buy"

                            );


                            document
                                .querySelectorAll(
                                    "#shopTabs .tab"
                                )
                                .forEach(
                                    item =>

                                        item.classList
                                            .toggle(
                                                "active",
                                                item ===
                                                tab
                                            )
                                );

                        }
                    );

                }
            );

    }


    function bindCloseButtons() {

        document
            .querySelectorAll(
                "[data-close]"
            )
            .forEach(
                button => {

                    if (
                        button.dataset
                            .v19Bound ===
                        "1"
                    ) {

                        return;

                    }


                    button.dataset
                        .v19Bound =
                        "1";


                    button.addEventListener(
                        "click",
                        () => {

                            const target =
                                button.dataset
                                    .close;


                            if (
                                target
                            ) {

                                $(target)
                                    ?.classList
                                    .add(
                                        "hidden"
                                    );

                            }


                            if (
                                target ===
                                "shopPanel"
                            ) {

                                closeShop();

                            }

                        }
                    );

                }
            );


        [

            "inventoryPanel",

            "mapPanel",

            "bookPanel",

            "shopPanel",

            "questPanel"

        ]
            .forEach(
                panelId => {

                    const panel =
                        $(panelId);


                    if (
                        !panel
                    ) {

                        return;

                    }


                    panel
                        .querySelectorAll(
                            ".panel-close, .close-btn"
                        )
                        .forEach(
                            button => {

                                if (
                                    button.dataset
                                        .v19FallbackBound ===
                                    "1"
                                ) {

                                    return;

                                }


                                button.dataset
                                    .v19FallbackBound =
                                    "1";


                                button.addEventListener(
                                    "click",
                                    () => {

                                        panel.classList
                                            .add(
                                                "hidden"
                                            );


                                        if (
                                            panelId ===
                                            "shopPanel"
                                        ) {

                                            closeShop();

                                        }

                                    }
                                );

                            }
                        );

                }
            );

    }


    function bindEvents() {

        bindClick(
            "newGameBtn",
            startNewGame
        );


        bindClick(
            "continueBtn",
            () =>
                loadGame()
        );


        bindClick(
            "howToBtn",
            () =>
                showScreen(
                    "how"
                )
        );


        bindClick(
            "creditsBtn",
            () =>
                showScreen(
                    "credits"
                )
        );


        bindClick(
            "closeHowBtn",
            () =>
                showScreen(
                    "menu"
                )
        );


        bindClick(
            "closeCreditsBtn",
            () =>
                showScreen(
                    "menu"
                )
        );


        bindClick(
            "backMenuBtn",
            () =>
                showScreen(
                    "menu"
                )
        );


        bindClick(
            "startGameBtn",
            startGame
        );


        bindClick(
            "saveBtn",
            () =>
                saveGame(
                    true
                )
        );


        bindClick(
            "menuBtn",
            returnToMenu
        );


        bindClick(
            "inventoryBtn",
            openInventoryPanel
        );


        bindClick(
            "mapBtn",
            openMapPanel
        );


        bindClick(
            "bookBtn",
            openBookPanel
        );


        bindClick(
            "travelYes",
            confirmTravel
        );


        bindClick(
            "travelNo",
            cancelTravel
        );


        bindClick(
            "battleAccept",
            acceptBattle
        );


        bindClick(
            "battleDecline",
            declineBattle
        );


        bindClick(
            "respawnBtn",
            respawnPlayer
        );


        bindClick(
            "questActionBtn",
            questAction
        );


        bindClick(
            "dialogueBox",
            advanceDialogue
        );


        $("playerName")
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        startGame();

                    }

                }
            );


        bindInventoryTabs();

        bindShopTabs();

        bindCloseButtons();


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


                state.pointer.down =
                    false;


                cancelHoldInteraction();

            }
        );


        window.addEventListener(
            "resize",
            resizeCanvas
        );


        canvas.addEventListener(
            "contextmenu",
            event =>
                event.preventDefault()
        );


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
            event => {

                if (
                    event.button ===
                    0
                ) {

                    state.pointer.down =
                        false;

                }

            }
        );

    }


    /* =========================================================
       PAUSA VISUAL
       ========================================================= */

    function modalFreezeActive() {

        return Boolean(

            state.dialogue ||

            state.battle ||

            state.travel ||

            gameplayPanelOpen() ||

            state.player
                ?.dead

        );

    }


    function updatePausedVisuals(
        dt
    ) {

        updateParticlesAndEffects(
            dt
        );


        updateDamageScreenEffect(
            dt
        );


        updateScreenShake(
            dt
        );


        updateTransition(
            dt
        );


        updateCamera(
            dt
        );


        updateDoors(
            dt
        );

    }


    /* =========================================================
       UPDATE PRINCIPAL
       ========================================================= */

    function updateGame(
        dt
    ) {

        if (
            !state.player
        ) {

            return;

        }


        state.time +=
            dt;


        if (

            modalFreezeActive() &&

            !state.transition

        ) {

            updatePausedVisuals(
                dt
            );

        }

        else {

            updatePartTwoSystems(
                dt
            );

        }


        if (

            !state.paused &&

            !state.transition &&

            !modalFreezeActive()

        ) {

            state.autosaveTimer +=
                dt;


            if (
                state.autosaveTimer >=
                30
            ) {

                state.autosaveTimer =
                    0;


                saveGame(
                    false
                );

            }

        }


        updateHUD();


        if (
            state.holdAction
        ) {

            updateHoldIndicator();

        }


        if (
            isPanelVisible(
                "mapPanel"
            )
        ) {

            drawLargeMap();

        }

    }


    /* =========================================================
       LOOP PRINCIPAL
       ========================================================= */

    function gameLoop(
        timestamp
    ) {

        if (
            !state.running
        ) {

            return;

        }


        const dt =
            Math.min(

                0.05,

                Math.max(

                    0,

                    (
                        timestamp -
                        state.lastTime
                    ) /
                    1000

                )

            );


        state.lastTime =
            timestamp;


        updateGame(
            dt
        );


        drawWorld();


        requestAnimationFrame(
            gameLoop
        );

    }


    /* =========================================================
       AUDITORIA
       ========================================================= */

    function runStartupAudit() {

        const ids = [

            "menuScreen",

            "newGameBtn",

            "continueBtn",

            "howToBtn",

            "creditsBtn",

            "characterScreen",

            "characterCards",

            "playerName",

            "startGameBtn",

            "gameScreen",

            "gameCanvas",

            "inventoryBtn",

            "mapBtn",

            "bookBtn",

            "saveBtn",

            "menuBtn",

            "interactionHint",

            "dialogueBox",

            "battlePanel",

            "inventoryPanel",

            "mapPanel",

            "bookPanel",

            "shopPanel",

            "questPanel",

            "deathPanel",

            "miniCanvas",

            "worldMapCanvas"

        ];


        const missing =
            ids.filter(
                id =>
                    !$(id)
            );


        if (
            missing.length
        ) {

            throw new Error(

                `VEYRA V19: IDs ausentes no HTML: ${missing.join(", ")}`

            );

        }


        const required = [

            buildVillage,

            buildForest,

            buildGrove,

            buildMountains,

            buildIron,

            buildRuby,

            buildMonarchMaze,

            buildShadow,

            buildFairy,

            buildSky,

            buildHell,

            buildFinal,

            updatePartTwoSystems,

            performAttack,

            enterHouse,

            exitHouse,

            transitionToRegion

        ];


        if (
            required.some(
                fn =>
                    typeof fn !==
                    "function"
            )
        ) {

            throw new Error(

                "VEYRA V19: uma função obrigatória não foi carregada nas Partes 1/2."

            );

        }

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function initialize() {

        runStartupAudit();


        createCharacterCards();


        resizeCanvas();


        ensureStatusPanel();


        ensureStatusButton();


        removeOldRedAreaHowToEntry();


        ensureCredits();


        bindEvents();


        updateContinueButton();


        restoreIntroEffects();


        /*
            NÃO MUDA O LAYOUT DA CAPA.
        */

        showScreen(

            "menu",

            {
                animate:
                    false
            }

        );


        state.lastTime =
            performance.now();

    }


    initialize();


})();
