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
 
