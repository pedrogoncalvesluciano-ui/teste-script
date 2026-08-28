(() => {
    "use strict";

    /* =========================================================
       VEYRA: A QUIETUDE — REBUILD V18
       SCRIPT.JS — PARTE 1/3

       Esta parte contém:
       - base segura do projeto
       - personagens / itens / status / bosses
       - estado global
       - transições reais por canvas
       - casas com portas e interiores próprios
       - Vila + Rota Leste até Rubi
       - entrada do Labirinto do Monarca

       IMPORTANTE:
       A IIFE só será fechada no fim da PARTE 3.
       ========================================================= */

    const SAVE_KEY = "veyra_save_v18_rebuild";
    const LEGACY_SAVE_KEYS = ["veyra_save_v14_stable"];
    const GAME_VERSION = 18;

    const MAX_LEVEL = 50;
    const POINTS_PER_LEVEL = 3;
    const STAT_POINT_CAP = 30;

    const DASH_RUBY_COST = 60;
    const DASH_DIAMOND_COST = 45;

    const NORTH_GATE_REQUIREMENTS = Object.freeze({
        diamante: 40,
        rubi: 55
    });

    const MINIMAP_PRICE = 425;
    const LANTERN_PRICE = 350;

    /* =========================================================
       DOM
       ========================================================= */

    const $ = id => document.getElementById(id);

    const must = id => {
        const el = $(id);

        if (!el) {
            throw new Error(
                `Elemento obrigatório não encontrado: #${id}`
            );
        }

        return el;
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

    const screens = Object.freeze({
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
    });

    /* =========================================================
       PERSONAGENS
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
                "Bola de Memória"
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
                "Golpe do Guardião"
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
                "Esmagamento"
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
                "Luz Vital"
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
                "Forma Adaptativa"
        }
    ]);

    /* =========================================================
       STATUS
       ========================================================= */

    const STAT_CONFIG = Object.freeze({
        strength: {
            name:
                "Força",

            icon:
                "⚔️",

            cap:
                STAT_POINT_CAP,

            description:
                "+2% de dano por ponto. Máximo de +60%."
        },

        energy: {
            name:
                "Energia",

            icon:
                "⚡",

            cap:
                STAT_POINT_CAP,

            description:
                "+5 de energia máxima por ponto."
        },

        fatigue: {
            name:
                "Cansaço",

            icon:
                "💤",

            cap:
                STAT_POINT_CAP,

            description:
                "+3 de capacidade máxima de cansaço por ponto."
        },

        hunger: {
            name:
                "Fome",

            icon:
                "🍖",

            cap:
                STAT_POINT_CAP,

            description:
                "+3 de capacidade máxima de fome por ponto."
        },

        hp: {
            name:
                "HP",

            icon:
                "❤️",

            cap:
                STAT_POINT_CAP,

            description:
                "+8 de vida máxima por ponto."
        }
    });

    /* =========================================================
       ITENS
       ========================================================= */

    const ITEMS = Object.freeze({
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
                2,

            magicCost:
                4
        },

        algodao: {
            name:
                "Algodão",

            icon:
                "☁️",

            category:
                "materials",

            weight:
                1,

            value:
                5,

            magicCost:
                4
        },

        folha: {
            name:
                "Folha Resistente",

            icon:
                "🍃",

            category:
                "materials",

            weight:
                1,

            value:
                3,

            magicCost:
                3
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
                7,

            magicCost:
                7
        },

        ferro: {
            name:
                "Minério de Ferro",

            icon:
                "⛓️",

            category:
                "materials",

            weight:
                2,

            value:
                18,

            magicCost:
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
                42,

            magicCost:
                25
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
                88,

            magicCost:
                38
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
                92,

            magicCost:
                40
        },

        cristal: {
            name:
                "Cristal",

            icon:
                "🔷",

            category:
                "special",

            weight:
                2,

            value:
                45
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
                100
        },

        couro: {
            name:
                "Couro",

            icon:
                "🟫",

            category:
                "materials",

            weight:
                1,

            value:
                18
        },

        osso: {
            name:
                "Osso Antigo",

            icon:
                "🦴",

            category:
                "materials",

            weight:
                1,

            value:
                11
        },

        fragmentoMemoria: {
            name:
                "Fragmento de Memória",

            icon:
                "🔹",

            category:
                "special",

            weight:
                1,

            value:
                55,

            quest:
                true
        },

        flautaMemoria: {
            name:
                "Flauta da Memória",

            icon:
                "🎶",

            category:
                "special",

            weight:
                1,

            value:
                0,

            unique:
                true,

            quest:
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

            permanent:
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
                1,

            value:
                MINIMAP_PRICE,

            unique:
                true,

            permanent:
                true
        },

        pao: {
            name:
                "Pão Rústico",

            icon:
                "🥖",

            category:
                "food",

            weight:
                1,

            value:
                12,

            hunger:
                25,

            heal:
                3
        },

        carneCaca: {
            name:
                "Carne de Caça",

            icon:
                "🍖",

            category:
                "food",

            weight:
                1,

            value:
                24,

            hunger:
                42,

            heal:
                8
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
                45,

            cooldown:
                2
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
                50,

            cooldown:
                2
        },

        pocaoForca: {
            name:
                "Poção de Força",

            icon:
                "🟥",

            category:
                "potions",

            weight:
                1,

            value:
                70,

            buff:
                "strength",

            duration:
                15,

            cooldown:
                5
        },

        pocaoMagia: {
            name:
                "Poção de Magia",

            icon:
                "🟪",

            category:
                "potions",

            weight:
                1,

            value:
                70,

            buff:
                "magic",

            duration:
                15,

            cooldown:
                5
        },

        pocaoResistencia: {
            name:
                "Poção de Resistência",

            icon:
                "🟫",

            category:
                "potions",

            weight:
                1,

            value:
                78,

            buff:
                "resistance",

            duration:
                15,

            cooldown:
                5
        },

        pocaoVelocidade: {
            name:
                "Poção de Velocidade",

            icon:
                "🟦",

            category:
                "potions",

            weight:
                1,

            value:
                76,

            buff:
                "speed",

            duration:
                15,

            cooldown:
                5
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
                5,

            starter:
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

            permanent:
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
                55,

            defense:
                3,

            tier:
                1
        },

        armaduraAlgodao: {
            name:
                "Armadura de Algodão",

            icon:
                "☁️",

            category:
                "armor",

            weight:
                2,

            value:
                110,

            defense:
                5,

            tier:
                2
        },

        armaduraMadeira: {
            name:
                "Armadura de Madeira",

            icon:
                "🪵",

            category:
                "armor",

            weight:
                4,

            value:
                180,

            defense:
                8,

            tier:
                3
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
                280,

            defense:
                12,

            tier:
                4
        },

        armaduraFerro: {
            name:
                "Armadura de Ferro",

            icon:
                "🛡️",

            category:
                "armor",

            weight:
                7,

            value:
                650,

            defense:
                18,

            tier:
                5,

            crafted:
                true
        },

        armaduraOuro: {
            name:
                "Armadura de Ouro",

            icon:
                "🟨",

            category:
                "armor",

            weight:
                7,

            value:
                1100,

            defense:
                24,

            tier:
                6,

            crafted:
                true
        },

        armaduraDiamante: {
            name:
                "Armadura de Diamante",

            icon:
                "💎",

            category:
                "armor",

            weight:
                6,

            value:
                1850,

            defense:
                32,

            tier:
                7,

            crafted:
                true
        },

        armaduraRubi: {
            name:
                "Armadura de Rubi",

            icon:
                "♦️",

            category:
                "armor",

            weight:
                6,

            value:
                2900,

            defense:
                42,

            tier:
                8,

            crafted:
                true
        }
    });

    /* =========================================================
       ARMADURAS AVANÇADAS
       ========================================================= */

    const ARMOR_UPGRADES = Object.freeze({
        armaduraFerro: {
            previous:
                "armaduraCouro",

            materials: {
                ferro:
                    30,

                carvao:
                    18
            },

            money:
                420
        },

        armaduraOuro: {
            previous:
                "armaduraFerro",

            materials: {
                ferro:
                    40,

                ouro:
                    28
            },

            money:
                750
        },

        armaduraDiamante: {
            previous:
                "armaduraOuro",

            materials: {
                ouro:
                    42,

                diamante:
                    34
            },

            money:
                1200
        },

        armaduraRubi: {
            previous:
                "armaduraDiamante",

            materials: {
                diamante:
                    46,

                rubi:
                    52
            },

            money:
                1800
        }
    });

    /* =========================================================
       REGIÕES
       ========================================================= */

    const REGIONS = Object.freeze({
        village: {
            name:
                "VILA DO CREPÚSCULO",

            width:
                3200,

            height:
                2200,

            visual:
                "village",

            checkpoint:
                true
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
                "iron",

            cave:
                true
        },

        ruby: {
            name:
                "CAVERNA DE RUBI",

            width:
                3200,

            height:
                2150,

            visual:
                "ruby",

            cave:
                true
        },

        monarchMaze: {
            name:
                "LABIRINTO DO MONARCA",

            width:
                3100,

            height:
                2100,

            visual:
                "monarchMaze",

            cave:
                true,

            dark:
                true
        },

        shadow: {
            name:
                "TERRAS SOMBRIAS",

            width:
                3300,

            height:
                2300,

            visual:
                "shadow"
        },

        fairy: {
            name:
                "REINO DAS FADAS",

            width:
                3300,

            height:
                2300,

            visual:
                "fairy"
        },

        sky: {
            name:
                "CÉU",

            width:
                3500,

            height:
                2300,

            visual:
                "sky",

            special:
                true
        },

        hell: {
            name:
                "INFERNO",

            width:
                3700,

            height:
                2500,

            visual:
                "hell",

            special:
                true
        },

        final: {
            name:
                "CÂMARA FINAL",

            width:
                2300,

            height:
                1600,

            visual:
                "final",

            special:
                true
        }
    });

    const PREVIOUS_REGION = Object.freeze({
        village:
            null,

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
       DIÁLOGOS DOS PORTÕES
       ========================================================= */

    const GATE_DIALOGUES = Object.freeze({
        north: [
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
        ],

        west: [
            [
                "Uma pressão estranha atravessa o portão e faz sua magia vacilar.",
                "Ainda existe algo que você precisa aprender antes de seguir por aqui."
            ],

            [
                "As pedras deste caminho parecem rejeitar sua presença.",
                "Forçar a passagem agora provavelmente terminaria mal."
            ],

            [
                "Você sente a Quietude se movendo além da entrada.",
                "Alguma coisa em você ainda está incompleta."
            ]
        ],

        south: [
            [
                "O ar vindo desta passagem é pesado demais para ser apenas vento.",
                "Algo muito mais perigoso espera além daqui."
            ],

            [
                "As marcas no chão parecem pertencer a viajantes que nunca retornaram.",
                "Seguir agora seria abandonar qualquer chance de voltar."
            ],

            [
                "Por um instante, suas próprias memórias parecem desaparecer.",
                "Este caminho exige mais do que força."
            ]
        ]
    });

    /* =========================================================
       NPCs
       ========================================================= */

    const NPC_LIBRARY = Object.freeze({
        ELIAN: {
            name:
                "ELIAN",

            role:
                "Morador",

            color:
                "#d4b27c",

            lines: [
                "A Quietude parece estar chegando mais perto. Ontem eu esqueci o nome da rua onde cresci.",
                "Meu pai dizia que a primeira coisa que some não é um lugar. É a lembrança de que ele existia.",
                "As quatro saídas da vila sempre estiveram aqui... mas algumas parecem levar para lugares que ninguém mais recorda.",
                "Se você descobrir alguma coisa fora da vila, volte. Precisamos de histórias novas para não esquecer as antigas."
            ]
        },

        MARA: {
            name:
                "MARA",

            role:
                "Historiadora",

            color:
                "#b98bc4",

            lines: [
                "Os registros mais antigos falam da Quietude como se ela já tivesse acontecido antes.",
                "Existem quatro grandes caminhos saindo desta vila.",
                "Algumas passagens não são fechadas por pedras. São fechadas porque quem tenta atravessar simplesmente não está preparado.",
                "Quando encontrar algo que não consegue explicar, tente lembrar de cada detalhe antes de voltar."
            ]
        },

        DORAN: {
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
                "Tenho armaduras simples até Couro. Para Ferro, Ouro, Diamante ou Rubi, fale com Borin.",
                "A lanterna custa 350 moedas. O minimapa também não é barato, mas nenhum dos dois é enfeite.",
                "Se encontrar cristais ou minérios raros, eu pago bem."
            ]
        },

        BRAN: {
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
                "Se puder trazer dez madeiras, eu pago pelo trabalho.",
                "Cortar madeira consome magia e cansa o corpo.",
                "As árvores daqui parecem escolher onde vão renascer."
            ]
        },

        BORIN: {
            name:
                "BORIN",

            role:
                "Ferreiro",

            color:
                "#8e8d89",

            questId:
                "coal",

            blacksmith:
                true,

            lines: [
                "O fogo da forja ainda lembra como queimar. Por enquanto.",
                "Couro é o máximo que Doran consegue vender pronto.",
                "Ferro, Ouro, Diamante e Rubi exigem minério, moedas e trabalho de verdade.",
                "Equipamento realmente bom não se compra pronto. Se constrói."
            ]
        }
    });

    /* =========================================================
       HABILIDADES DE CLASSE
       ========================================================= */

    const CLASS_SKILLS = Object.freeze({
        kaelion: {
            q: {
                name:
                    "Bola de Memória",

                level:
                    1,

                cooldown:
                    2,

                costMagic:
                    15
            },

            r: {
                name:
                    "Nova Arcana",

                level:
                    5,

                cooldown:
                    6,

                costMagic:
                    30
            },

            f: {
                name:
                    "Tempestade da Quietude",

                level:
                    10,

                cooldown:
                    12,

                costMagic:
                    55
            }
        },

        theron: {
            q: {
                name:
                    "Golpe Pesado",

                level:
                    1,

                cooldown:
                    3,

                costEnergy:
                    10
            },

            r: {
                name:
                    "Postura do Guardião",

                level:
                    5,

                cooldown:
                    9,

                costEnergy:
                    18
            },

            f: {
                name:
                    "Juramento de Aço",

                level:
                    10,

                cooldown:
                    15,

                costEnergy:
                    30
            }
        },

        grumgar: {
            q: {
                name:
                    "Esmagamento",

                level:
                    1,

                cooldown:
                    4,

                costEnergy:
                    12
            },

            r: {
                name:
                    "Rugido Ancestral",

                level:
                    5,

                cooldown:
                    8,

                costEnergy:
                    20
            },

            f: {
                name:
                    "Terremoto",

                level:
                    10,

                cooldown:
                    14,

                costEnergy:
                    34
            }
        },

        lirael: {
            q: {
                name:
                    "Flecha Feérica",

                level:
                    1,

                cooldown:
                    1.5,

                costMagic:
                    12
            },

            r: {
                name:
                    "Luz Vital",

                level:
                    5,

                cooldown:
                    7,

                costMagic:
                    28
            },

            f: {
                name:
                    "Chuva de Estrelas",

                level:
                    10,

                cooldown:
                    11,

                costMagic:
                    48
            }
        },

        zephyr: {
            q: {
                name:
                    "Forma Adaptativa",

                level:
                    1,

                cooldown:
                    7,

                costMagic:
                    12
            },

            r: {
                name:
                    "Investida Quimérica",

                level:
                    5,

                cooldown:
                    6,

                costEnergy:
                    18
            },

            f: {
                name:
                    "Forma Perfeita",

                level:
                    10,

                cooldown:
                    15,

                costMagic:
                    42
            }
        }
    });

    /* =========================================================
       BOSSES
       ========================================================= */

    const BOSS_REGISTRY = Object.freeze([
        {
            id:
                "road_guardian",

            name:
                "GUARDIÃO DA ESTRADA",

            icon:
                "👺",

            region:
                "village",

            quote:
                "Ele continuou guardando a passagem depois de esquecer o motivo."
        },

        {
            id:
                "forest_guardian",

            name:
                "GUARDIÃO DA FLORESTA",

            icon:
                "🌳",

            region:
                "forest",

            quote:
                "As raízes lembram o que as folhas esqueceram."
        },

        {
            id:
                "grove_guardian",

            name:
                "GUARDIÃO DO BOSQUE",

            icon:
                "🌲",

            region:
                "grove",

            quote:
                "Cada galho carrega um nome que já não possui dono."
        },

        {
            id:
                "mountain_guardian",

            name:
                "SENTINELA DAS MONTANHAS",

            icon:
                "🗿",

            region:
                "mountains",

            quote:
                "A pedra não esqueceu a ordem. Esqueceu apenas quem a deu."
        },

        {
            id:
                "iron_guardian",

            name:
                "GUARDIÃO DE FERRO",

            icon:
                "⚙️",

            region:
                "iron",

            quote:
                "Quando o último martelo silenciou, ele continuou trabalhando."
        },

        {
            id:
                "ruby_guardian",

            name:
                "GUARDIÃO RUBI",

            icon:
                "🔴",

            region:
                "ruby",

            quote:
                "O cristal repete tudo — até aquilo que nunca aconteceu."
        },

        {
            id:
                "monarch",

            name:
                "O MONARCA",

            icon:
                "🥷",

            region:
                "monarchMaze",

            quote:
                "O poder que você procurava nunca esteve abandonado."
        },

        {
            id:
                "shadow_guardian",

            name:
                "GUARDIÃO SOMBRIO",

            icon:
                "🌑",

            region:
                "shadow",

            quote:
                "Nenhuma sombra nasce sem algo para bloquear a luz."
        },

        {
            id:
                "thread_guardian",

            name:
                "GUARDIÃ DOS FIOS",

            icon:
                "🧚",

            region:
                "fairy",

            quote:
                "Ela aprendeu tarde demais que lembrar também pode doer."
        },

        {
            id:
                "path_guardian",

            name:
                "GUARDIÃO DO CAMINHO",

            icon:
                "🪽",

            region:
                "sky",

            quote:
                "A passagem não estava escondida. O mundo havia esquecido que ela existia."
        },

        {
            id:
                "hell_supreme_guardian",

            name:
                "GUARDIÃO SUPREMO DO INFERNO",

            icon:
                "👿",

            region:
                "hell",

            quote:
                "Atrás dele, até o medo parece lembrar do seu nome."
        },

        {
            id:
                "other_self",

            name:
                "O OUTRO EU",

            icon:
                "☯",

            region:
                "final",

            quote:
                "Se nada for lembrado, nada poderá sofrer."
        }
    ]);

    /* =========================================================
       INTERIORES — CADA PRÉDIO POSSUI UM LAYOUT
       ========================================================= */

    const HOUSE_INTERIORS = Object.freeze({
        home: {
            room: {
                x:
                    260,

                y:
                    180,

                w:
                    900,

                h:
                    620
            },

            floor:
                "#94704e",

            wall:
                "#4b342b",

            trim:
                "#d6b77d",

            doorSide:
                "south",

            furniture: [
                {
                    id:
                        "bed",

                    type:
                        "bed",

                    x:
                        335,

                    y:
                        260,

                    w:
                        220,

                    h:
                        125,

                    solid:
                        true,

                    sleep:
                        true
                },

                {
                    id:
                        "table",

                    type:
                        "table",

                    x:
                        650,

                    y:
                        410,

                    w:
                        170,

                    h:
                        110,

                    solid:
                        true
                },

                {
                    id:
                        "chest",

                    type:
                        "chest",

                    x:
                        960,

                    y:
                        260,

                    w:
                        110,

                    h:
                        80,

                    solid:
                        true
                },

                {
                    id:
                        "books",

                    type:
                        "bookshelf",

                    x:
                        1010,

                    y:
                        430,

                    w:
                        90,

                    h:
                        220,

                    solid:
                        true
                }
            ]
        },

        elianHome: {
            room: {
                x:
                    240,

                y:
                    170,

                w:
                    860,

                h:
                    600
            },

            floor:
                "#80664f",

            wall:
                "#40372f",

            trim:
                "#c9ae7a",

            doorSide:
                "south",

            npc:
                "ELIAN",

            furniture: [
                {
                    id:
                        "bed",

                    type:
                        "bed",

                    x:
                        315,

                    y:
                        245,

                    w:
                        200,

                    h:
                        120,

                    solid:
                        true
                },

                {
                    id:
                        "desk",

                    type:
                        "desk",

                    x:
                        620,

                    y:
                        350,

                    w:
                        210,

                    h:
                        95,

                    solid:
                        true
                },

                {
                    id:
                        "books",

                    type:
                        "bookshelf",

                    x:
                        930,

                    y:
                        240,

                    w:
                        95,

                    h:
                        240,

                    solid:
                        true
                }
            ]
        },

        forge: {
            room: {
                x:
                    220,

                y:
                    150,

                w:
                    1020,

                h:
                    680
            },

            floor:
                "#534e48",

            wall:
                "#292b2f",

            trim:
                "#a79a8b",

            doorSide:
                "south",

            npc:
                "BORIN",

            furniture: [
                {
                    id:
                        "furnace",

                    type:
                        "furnace",

                    x:
                        285,

                    y:
                        235,

                    w:
                        220,

                    h:
                        190,

                    solid:
                        true
                },

                {
                    id:
                        "anvil",

                    type:
                        "anvil",

                    x:
                        650,

                    y:
                        430,

                    w:
                        170,

                    h:
                        130,

                    solid:
                        true,

                    forge:
                        true
                },

                {
                    id:
                        "bench",

                    type:
                        "workbench",

                    x:
                        920,

                    y:
                        230,

                    w:
                        240,

                    h:
                        100,

                    solid:
                        true
                },

                {
                    id:
                        "ore",

                    type:
                        "oreCrate",

                    x:
                        1020,

                    y:
                        620,

                    w:
                        110,

                    h:
                        100,

                    solid:
                        true
                }
            ]
        },

        shop: {
            room: {
                x:
                    230,

                y:
                    160,

                w:
                    980,

                h:
                    660
            },

            floor:
                "#896647",

            wall:
                "#3d2e29",

            trim:
                "#dfbd78",

            doorSide:
                "south",

            npc:
                "DORAN",

            furniture: [
                {
                    id:
                        "leftShelf",

                    type:
                        "shopShelf",

                    x:
                        295,

                    y:
                        245,

                    w:
                        130,

                    h:
                        280,

                    solid:
                        true
                },

                {
                    id:
                        "rightShelf",

                    type:
                        "shopShelf",

                    x:
                        1015,

                    y:
                        245,

                    w:
                        130,

                    h:
                        280,

                    solid:
                        true
                },

                {
                    id:
                        "counter",

                    type:
                        "counter",

                    x:
                        535,

                    y:
                        330,

                    w:
                        380,

                    h:
                        95,

                    solid:
                        true
                },

                {
                    id:
                        "crate",

                    type:
                        "crate",

                    x:
                        330,

                    y:
                        620,

                    w:
                        105,

                    h:
                        95,

                    solid:
                        true
                }
            ]
        },

        woodshop: {
            room: {
                x:
                    240,

                y:
                    170,

                w:
                    940,

                h:
                    630
            },

            floor:
                "#9b744c",

            wall:
                "#463225",

            trim:
                "#d7af76",

            doorSide:
                "south",

            npc:
                "BRAN",

            furniture: [
                {
                    id:
                        "logs",

                    type:
                        "logStack",

                    x:
                        300,

                    y:
                        245,

                    w:
                        160,

                    h:
                        230,

                    solid:
                        true
                },

                {
                    id:
                        "bench",

                    type:
                        "workbench",

                    x:
                        565,

                    y:
                        355,

                    w:
                        420,

                    h:
                        105,

                    solid:
                        true
                },

                {
                    id:
                        "boards",

                    type:
                        "boardStack",

                    x:
                        995,

                    y:
                        245,

                    w:
                        120,

                    h:
                        250,

                    solid:
                        true
                }
            ]
        }
    });

    /* =========================================================
       ESTADO GLOBAL
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

        holdAction:
            null,

        toastTimer:
            null,

        portalCooldown:
            0,

        warnedNeedAt:
            0,

        hordeNextAt:
            0,

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

        gateModal:
            null,

        altarModal:
            null,

        forgeModal:
            null,

        statusModal:
            null,

        bossBarTarget:
            null
    };

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

            secrets:
                [],

            decorations:
                [],

            trials:
                [],

            hazards:
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

            particles:
                [],

            effects:
                [],

            paths:
                [],

            maze:
                null
        };
    }

    /* =========================================================
       UTILITÁRIOS
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

    function distance(
        a,
        b
    ) {
        return Math.hypot(
            a.x -
            b.x,

            a.y -
            b.y
        );
    }

    function uid(
        prefix
    ) {
        return (
            `${prefix}_` +
            Math.random()
                .toString(36)
                .slice(
                    2,
                    10
                )
        );
    }

    function normalizeVector(
        x,
        y
    ) {
        const len =
            Math.hypot(
                x,
                y
            ) ||
            1;

        return {
            x:
                x / len,

            y:
                y / len
        };
    }

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

        return (
            hash >>>
            0
        );
    }

    function mulberry32(
        seed
    ) {
        return function () {
            let t =
                seed +=
                0x6D2B79F5;

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

    function areaRng(
        area,
        salt = "layout"
    ) {
        const fallback =
            hashString(
                `${area}:${salt}`
            );

        const base =
            state.player
                ?.worldSeeds
                ?.[area] ??
            fallback;

        return mulberry32(
            (
                base ^
                hashString(
                    salt
                )
            ) >>>
            0
        );
    }

    function seededRange(
        rng,
        min,
        max
    ) {
        return (
            rng() *
            (
                max -
                min
            ) +
            min
        );
    }

    function seededInt(
        rng,
        min,
        max
    ) {
        return Math.floor(
            seededRange(
                rng,
                min,
                max + 1
            )
        );
    }

    function currentCharacter() {
        return (
            CHARACTERS.find(
                character =>
                    character.id ===
                    state.player
                        ?.characterId
            ) ||
            CHARACTERS[0]
        );
    }

    function getCharacterSkills() {
        return (
            CLASS_SKILLS[
                state.player
                    ?.characterId
            ] ||
            CLASS_SKILLS
                .kaelion
        );
    }

    function getCharacterPalette(
        characterId =
            state.player
                ?.characterId
    ) {
        const palettes = {
            kaelion: {
                main:
                    "#f0a258",

                glow:
                    "#ffd59b",

                secondary:
                    "#a46cff"
            },

            theron: {
                main:
                    "#d6dde6",

                glow:
                    "#fff4d3",

                secondary:
                    "#8fa6bd"
            },

            grumgar: {
                main:
                    "#8da05c",

                glow:
                    "#d2d99a",

                secondary:
                    "#a36f4e"
            },

            lirael: {
                main:
                    "#f3a6dd",

                glow:
                    "#ffe0f6",

                secondary:
                    "#84e7ff"
            },

            zephyr: {
                main:
                    "#9d7be8",

                glow:
                    "#e5d6ff",

                secondary:
                    "#69d5b1"
            }
        };

        return (
            palettes[
                characterId
            ] ||
            palettes
                .kaelion
        );
    }

    function hasItem(
        id,
        amount = 1
    ) {
        return (
            (
                state.player
                    ?.inventory
                    ?.[id] ||
                0
            ) >=
            amount
        );
    }

    function hasAbility(
        id
    ) {
        return Boolean(
            state.player
                ?.abilities
                ?.[id]
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

    function isBossId(
        id
    ) {
        return (
            BOSS_REGISTRY.some(
                boss =>
                    boss.id ===
                    id
            )
        );
    }

    /* =========================================================
       STATUS DERIVADOS
       ========================================================= */

    function applyStatBonuses(
        refill = false
    ) {
        const player =
            state.player;

        if (!player) {
            return;
        }

        const stats = {
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

        player.maxHp =
            Math.round(
                player.baseMaxHp +
                stats.hp *
                8
            );

        player.maxMagic =
            player.baseMaxMagic;

        player.maxEnergy =
            Math.round(
                player.baseMaxEnergy +
                stats.energy *
                5
            );

        player.maxHunger =
            100 +
            stats.hunger *
            3;

        player.maxFatigue =
            100 +
            stats.fatigue *
            3;

        player.damage =
            Math.round(
                player.baseDamage *
                (
                    1 +
                    stats.strength *
                    0.02
                )
            );

        player.speed =
            player.baseSpeed;

        if (
            refill
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

            return;
        }

        player.hp =
            clamp(
                Number(
                    player.hp
                ) ||
                0,

                0,
                player.maxHp
            );

        player.magic =
            clamp(
                Number(
                    player.magic
                ) ||
                0,

                0,
                player.maxMagic
            );

        player.energy =
            clamp(
                Number(
                    player.energy
                ) ||
                0,

                0,
                player.maxEnergy
            );

        player.hunger =
            clamp(
                Number(
                    player.hunger
                ) ||
                0,

                0,
                player.maxHunger
            );

        player.fatigue =
            clamp(
                Number(
                    player.fatigue
                ) ||
                0,

                0,
                player.maxFatigue
            );
    }

    /* =========================================================
       TELAS — NÃO ALTERA A INTRODUÇÃO
       ========================================================= */

    function showScreen(
        name
    ) {
        Object.values(
            screens
        )
            .forEach(
                screen => {
                    screen.classList
                        .remove(
                            "active"
                        );
                }
            );

        screens[
            name
        ]
            .classList
            .add(
                "active"
            );
    }

    function showToast(
        message,
        duration = 2600
    ) {
        const toast =
            must(
                "saveMessage"
            );

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );

        clearTimeout(
            state.toastTimer
        );

        state.toastTimer =
            setTimeout(
                () => {
                    toast.classList
                        .remove(
                            "show"
                        );
                },
                duration
            );
    }

    function resizeCanvas() {
        const ratio =
            window.devicePixelRatio ||
            1;

        canvas.width =
            Math.floor(
                window.innerWidth *
                ratio
            );

        canvas.height =
            Math.floor(
                window.innerHeight *
                ratio
            );

        canvas.style.width =
            `${window.innerWidth}px`;

        canvas.style.height =
            `${window.innerHeight}px`;

        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );
    }

    function shakeScreen(
        power = 8,
        duration = 0.18
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

    /* =========================================================
       TRANSIÇÃO REAL
       ========================================================= */

    function startTransition({
        label = "",
        fadeOut = 0.34,
        hold = 0.18,
        fadeIn = 0.42,
        startBlack = false,
        swap = null,
        done = null
    } = {}) {

        if (
            state.transition
        ) {
            state.transitionQueue.push({
                label,
                fadeOut,
                hold,
                fadeIn,
                startBlack,
                swap,
                done
            });

            return false;
        }

        state.keys.clear();

        state.pointer.down =
            false;

        state.paused =
            true;

        state.pauseReason =
            "transition";

        state.transition = {
            label,

            phase:
                startBlack
                    ? "hold"
                    : "fadeOut",

            timer:
                0,

            alpha:
                startBlack
                    ? 1
                    : 0,

            fadeOut:
                Math.max(
                    0.05,
                    fadeOut
                ),

            hold:
                Math.max(
                    0,
                    hold
                ),

            fadeIn:
                Math.max(
                    0.05,
                    fadeIn
                ),

            swapped:
                false,

            swap,
            done
        };

        if (
            startBlack &&
            typeof swap ===
                "function"
        ) {
            state.transition.swapped =
                true;

            swap();
        }

        return true;
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
            "fadeOut"
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
                transition.alpha =
                    1;

                transition.timer =
                    0;

                if (
                    !transition.swapped
                ) {
                    transition.swapped =
                        true;

                    if (
                        typeof transition.swap ===
                        "function"
                    ) {
                        transition.swap();
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
            transition.alpha =
                1;

            if (
                transition.timer >=
                transition.hold
            ) {
                transition.timer =
                    0;

                transition.phase =
                    "fadeIn";
            }

            return;
        }

        if (
            transition.phase ===
            "fadeIn"
        ) {
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

                state.paused =
                    false;

                state.pauseReason =
                    null;

                if (
                    typeof done ===
                    "function"
                ) {
                    done();
                }

                if (
                    state.transitionQueue
                        .length
                ) {
                    const next =
                        state.transitionQueue
                            .shift();

                    startTransition(
                        next
                    );
                }
            }
        }
    }

    function drawTransitionOverlay() {
        const transition =
            state.transition;

        if (
            !transition ||
            transition.alpha <=
                0
        ) {
            return;
        }

        ctx.save();

        ctx.globalAlpha =
            clamp(
                transition.alpha,
                0,
                1
            );

        ctx.fillStyle =
            "#030406";

        ctx.fillRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        if (
            transition.label &&
            transition.alpha >
                0.72
        ) {
            ctx.globalAlpha =
                clamp(
                    (
                        transition.alpha -
                        0.72
                    ) /
                    0.28,

                    0,
                    1
                );

            ctx.fillStyle =
                "#f0d79b";

            ctx.font =
                "700 18px Georgia";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                transition.label,
                window.innerWidth /
                    2,
                window.innerHeight /
                    2
            );
        }

        ctx.restore();
    }

    /* =========================================================
       CARTÕES DOS PERSONAGENS
       ========================================================= */

    function createCharacterCards() {
        const container =
            must(
                "characterCards"
            );

        container.innerHTML =
            "";

        const maximums = {
            hp:
                180,

            magic:
                145,

            energy:
                135,

            damage:
                39,

            defense:
                21,

            speed:
                210
        };

        const labels = {
            hp:
                "Vida",

            magic:
                "Magia",

            energy:
                "Energia",

            damage:
                "Dano",

            defense:
                "Defesa",

            speed:
                "Velocidade"
        };

        CHARACTERS.forEach(
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

                card.style
                    .setProperty(
                        "--char-color",
                        character.color
                    );

                card.style
                    .setProperty(
                        "--char-bg",
                        character.bg
                    );

                card.style
                    .setProperty(
                        "--char-glow",
                        character.glow
                    );

                const stats =
                    [
                        "hp",
                        "magic",
                        "energy",
                        "damage",
                        "defense",
                        "speed"
                    ]
                        .map(
                            key => {

                                const percent =
                                    clamp(
                                        character[
                                            key
                                        ] /
                                        maximums[
                                            key
                                        ] *
                                        100,

                                        8,
                                        100
                                    );

                                return `
                                    <div class="char-stat">

                                        <span>
                                            ${labels[key]}
                                        </span>

                                        <div class="char-stat-track">

                                            <div
                                                class="char-stat-fill"
                                                style="width:${percent}%"
                                            ></div>

                                        </div>

                                        <b>
                                            ${character[key]}
                                        </b>

                                    </div>
                                `;
                            }
                        )
                        .join("");

                card.innerHTML = `
                    <div class="char-art">
                        ${character.icon}
                    </div>

                    <h3>
                        ${character.name}
                    </h3>

                    <p class="char-classline">
                        ${character.className}
                        —
                        ${character.role}
                    </p>

                    <p>
                        ${character.description}
                    </p>

                    <div class="char-stats">
                        ${stats}
                    </div>

                    <p class="char-story">
                        ${character.story}
                    </p>

                    <p class="char-skill">
                        ✦ ${character.skill}
                    </p>
                `;

                card.addEventListener(
                    "click",
                    () => {

                        state.selectedCharacter =
                            character;

                        document
                            .querySelectorAll(
                                ".character-card"
                            )
                            .forEach(
                                item => {
                                    item.classList
                                        .remove(
                                            "selected"
                                        );
                                }
                            );

                        card.classList
                            .add(
                                "selected"
                            );
                    }
                );

                container.appendChild(
                    card
                );
            }
        );
    }

    function startNewGame() {
        must(
            "playerName"
        ).value =
            "";

        must(
            "nameError"
        ).textContent =
            "";

        state.selectedCharacter =
            CHARACTERS[0];

        document
            .querySelectorAll(
                ".character-card"
            )
            .forEach(
                (
                    card,
                    index
                ) => {
                    card.classList
                        .toggle(
                            "selected",
                            index ===
                            0
                        );
                }
            );

        showScreen(
            "character"
        );

        setTimeout(
            () => {
                must(
                    "playerName"
                ).focus();
            },
            80
        );
    }

    /* =========================================================
       PLAYER
       ========================================================= */

    function createPlayer(
        name,
        character
    ) {
        const worldSeeds =
            {};

        Object.keys(
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
                            `${name}:${Date.now()}:${area}:${index}:${Math.random()}`
                        );
                }
            );

        state.player = {
            name,

            characterId:
                character.id,

            className:
                character.className,

            icon:
                character.icon,

            color:
                character.color,

            x:
                0,

            y:
                0,

            radius:
                18,

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

            hp:
                character.hp,

            maxHp:
                character.hp,

            magic:
                character.magic,

            maxMagic:
                character.magic,

            energy:
                character.energy,

            maxEnergy:
                character.energy,

            hunger:
                100,

            maxHunger:
                100,

            fatigue:
                100,

            maxFatigue:
                100,

            damage:
                character.damage,

            defense:
                character.defense,

            speed:
                character.speed,

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
                35,

            memory:
                0,

            inventoryWeightLimit:
                100,

            inventory: {
                madeira:
                    0,

                algodao:
                    0,

                folha:
                    0,

                carvao:
                    0,

                ferro:
                    0,

                ouro:
                    0,

                diamante:
                    0,

                rubi:
                    0,

                cristal:
                    0,

                essencia:
                    0,

                couro:
                    0,

                osso:
                    0,

                fragmentoMemoria:
                    0,

                flautaMemoria:
                    0,

                lanterna:
                    0,

                minimapa:
                    0,

                pao:
                    2,

                carneCaca:
                    0,

                pocao:
                    2,

                elixir:
                    1,

                pocaoForca:
                    0,

                pocaoMagia:
                    0,

                pocaoResistencia:
                    0,

                pocaoVelocidade:
                    0,

                espadaSimples:
                    1,

                espadaFerro:
                    0,

                machado:
                    1,

                armaduraFolha:
                    0,

                armaduraAlgodao:
                    0,

                armaduraMadeira:
                    0,

                armaduraCouro:
                    0,

                armaduraFerro:
                    0,

                armaduraOuro:
                    0,

                armaduraDiamante:
                    0,

                armaduraRubi:
                    0
            },

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

                route2:
                    false,

                route3:
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

            unlockedAreas:
                [
                    "village"
                ],

            exploredAreas:
                [
                    "village"
                ],

            hellTypesDefeated:
                {},

            secretsFound:
                [],

            collected:
                {},

            worldSeeds,

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

            monarchAwakened:
                false,

            monarchDefeated:
                false,

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

            flutePlayed:
                false,

            fluteRewardGranted:
                false,

            checkpoint: {
                area:
                    "village",

                x:
                    500,

                y:
                    1120,

                houseId:
                    "home",

                insideHouse:
                    true
            },

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

            damageReduction:
                0,

            shieldTimer:
                0,

            stunTimer:
                0,

            invincible:
                0,

            attackCooldown:
                0,

            dashCooldown:
                0,

            adaptiveBuff:
                false,

            adaptiveTimer:
                0,

            playerDash:
                null,

            dead:
                false,

            finalChoice:
                null,

            finalDefeated:
                false
        };

        applyStatBonuses(
            true
        );
    }

    function startGame() {
        const input =
            must(
                "playerName"
            );

        const name =
            input.value
                .trim();

        if (
            name.length <
            2
        ) {
            must(
                "nameError"
            ).textContent =
                "Digite um nome com pelo menos 2 caracteres.";

            input.focus();

            return;
        }

        createPlayer(
            name,
            state.selectedCharacter
        );

        state.area =
            "village";

        state.houseMode =
            false;

        state.currentHouse =
            null;

        state.houseReturn =
            null;

        state.finalChoiceShown =
            false;

        state.bossBarTarget =
            null;

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
                "Casa do jogador não foi criada na Vila do Crepúsculo."
            );
        }

        enterHouseImmediate(
            home,
            true
        );

        showScreen(
            "game"
        );

        state.running =
            true;

        state.lastTime =
            performance.now();

        startTransition({
            label:
                "VEYRA — VILA DO CREPÚSCULO",

            startBlack:
                true,

            hold:
                0.55,

            fadeIn:
                0.8,

            done:
                () => {
                    showToast(
                        "Você despertou dentro de casa. A porta está ao sul. Pressione Z perto dela para sair.",
                        3800
                    );
                }
        });

        requestAnimationFrame(
            gameLoop
        );
    }

    /* =========================================================
       MUNDO — HELPERS
       ========================================================= */

    function resetWorld() {
        state.world =
            createEmptyWorld(
                REGIONS[
                    state.area
                ]
            );
    }

    function addObstacle(
        x,
        y,
        w,
        h,
        type,
        extra = {}
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
            type,

            ...extra
        };

        state.world
            .obstacles
            .push(
                obstacle
            );

        return obstacle;
    }

    function addWorldDoor(
        building
    ) {
        const width =
            62;

        const height =
            34;

        const door = {
            id:
                `door_${building.id}`,

            type:
                "buildingDoor",

            buildingId:
                building.id,

            x:
                building.x +
                building.w /
                2 -
                width /
                2,

            y:
                building.y +
                building.h -
                4,

            w:
                width,

            h:
                height,

            cx:
                building.x +
                building.w /
                2,

            cy:
                building.y +
                building.h +
                22,

            open:
                false,

            animation:
                0
        };

        state.world
            .doors
            .push(
                door
            );

        building.doorId =
            door.id;

        return door;
    }

    function addBuilding(
        id,
        x,
        y,
        w,
        h,
        name,
        roof,
        color,
        extra = {}
    ) {
        const building = {
            id,

            x,
            y,
            w,
            h,

            name,
            roof,
            color,

            enterable:
                Boolean(
                    HOUSE_INTERIORS[
                        id
                    ]
                ),

            ...extra
        };

        state.world
            .buildings
            .push(
                building
            );

        addObstacle(
            x -
            24,

            y -
            95,

            w +
            48,

            h +
            95,

            "building",

            {
                buildingId:
                    id
            }
        );

        if (
            building.enterable
        ) {
            addWorldDoor(
                building
            );
        }

        return building;
    }

    function addTree(
        x,
        y,
        id,
        extra = {}
    ) {
        const tree = {
            id,

            x,
            y,

            alive:
                true,

            amount:
                randomInt(
                    2,
                    5
                ),

            respawn:
                0,

            ...extra
        };

        state.world
            .trees
            .push(
                tree
            );

        addObstacle(
            x -
            30,

            y -
            38,

            60,
            76,

            "tree",

            {
                treeId:
                    id
            }
        );

        return tree;
    }

    function addResource(
        x,
        y,
        type,
        extra = {}
    ) {
        const resource = {
            id:
                uid(
                    "resource"
                ),

            x,
            y,

            type,

            alive:
                true,

            amount:
                randomInt(
                    1,
                    3
                ),

            respawn:
                0,

            ...extra
        };

        state.world
            .resources
            .push(
                resource
            );

        return resource;
    }

    function addFood(
        x,
        y,
        type =
            "carrot",
        extra = {}
    ) {
        const food = {
            id:
                uid(
                    "food"
                ),

            x,
            y,

            type,

            alive:
                true,

            respawn:
                0,

            ...extra
        };

        state.world
            .foods
            .push(
                food
            );

        return food;
    }

    function addSecret(
        x,
        y,
        title,
        message,
        icon = "✦"
    ) {
        const stableId =
            `secret_${state.area}_${title}`
                .normalize(
                    "NFD"
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase()
                .replace(
                    /[^a-z0-9]+/g,
                    "_"
                )
                .replace(
                    /^_|_$/g,
                    ""
                );

        const secret = {
            id:
                stableId,

            x,
            y,

            title,
            message,
            icon,

            found:
                Boolean(
                    state.player
                        ?.secretsFound
                        ?.includes(
                            stableId
                        )
                )
        };

        state.world
            .secrets
            .push(
                secret
            );

        return secret;
    }

    function addDecoration(
        type,
        x,
        y,
        extra = {}
    ) {
        const decoration = {
            id:
                uid(
                    "decoration"
                ),

            type,

            x,
            y,

            ...extra
        };

        state.world
            .decorations
            .push(
                decoration
            );

        return decoration;
    }

    function addPath(
        points,
        width = 100,
        kind = "dirt",
        extra = {}
    ) {
        const path = {
            id:
                uid(
                    "path"
                ),

            points,
            width,
            kind,

            ...extra
        };

        state.world
            .paths
            .push(
                path
            );

        return path;
    }

    function addTrial(
        x,
        y,
        id,
        title,
        extra = {}
    ) {
        const trial = {
            id,

            x,
            y,

            radius:
                38,

            title,

            ...extra
        };

        state.world
            .trials
            .push(
                trial
            );

        return trial;
    }

    function addGate(
        id,
        side,
        x,
        y,
        w,
        h,
        title,
        extra = {}
    ) {
        const gate = {
            id,
            side,

            x,
            y,
            w,
            h,

            title,

            ...extra
        };

        state.world
            .gates
            .push(
                gate
            );

        return gate;
    }

    function addHazard(
        x,
        y,
        radius,
        delay,
        damage,
        extra = {}
    ) {
        const hazard = {
            id:
                uid(
                    "hazard"
                ),

            x,
            y,

            radius,
            delay,

            maxDelay:
                Math.max(
                    0.01,
                    delay
                ),

            damage,

            life:
                delay +
                0.35,

            triggered:
                false,

            color:
                "rgba(220,52,45,.22)",

            ...extra
        };

        state.world
            .hazards
            .push(
                hazard
            );

        return hazard;
    }

    function addNPC(
        x,
        y,
        templateOrName,
        role = "Morador",
        color = "#d4b27c",
        lines = ["Olá."],
        extra = {}
    ) {
        let data;

        if (
            typeof templateOrName ===
                "string" &&
            NPC_LIBRARY[
                templateOrName
            ]
        ) {
            data = {
                ...NPC_LIBRARY[
                    templateOrName
                ],

                ...extra
            };
        }

        else {
            data = {
                name:
                    templateOrName,

                role,
                color,
                lines,

                ...extra
            };
        }

        const npc = {
            id:
                uid(
                    "npc"
                ),

            x,
            y,

            radius:
                17,

            homeX:
                x,

            homeY:
                y,

            wanderTimer:
                random(
                    1,
                    4
                ),

            wanderDx:
                0,

            wanderDy:
                0,

            ...data
        };

        state.world
            .npcs
            .push(
                npc
            );

        return npc;
    }

    function addEnemy(
        enemy
    ) {
        if (
            enemy.type ===
                "progression" &&
            hasDefeatedBoss(
                enemy.id
            )
        ) {
            return null;
        }

        if (
            enemy.id ===
                "monarch" &&
            state.player
                ?.monarchDefeated
        ) {
            return null;
        }

        const order = [
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

        const regionIndex =
            Math.max(
                0,
                order.indexOf(
                    state.area
                )
            );

        const level =
            state.player
                ?.level ||
            1;

        const regionScale =
            1 +
            regionIndex *
            0.03;

        const levelScale =
            1 +
            Math.max(
                0,
                level -
                1
            ) *
            0.012;

        const baseHp =
            enemy.maxHp ||
            enemy.hp ||
            50;

        const created = {
            state:
                "idle",

            aggressive:
                Boolean(
                    enemy.aggressive
                ),

            accepted:
                Boolean(
                    enemy.accepted
                ),

            attackTimer:
                0,

            specialTimer:
                random(
                    1.7,
                    3.2
                ),

            hitFlash:
                0,

            stunTimer:
                0,

            dead:
                false,

            respawnTimer:
                0,

            phase:
                1,

            charge:
                null,

            telegraphing:
                false,

            spawnX:
                enemy.x,

            spawnY:
                enemy.y,

            level:
                Math.max(
                    1,
                    level +
                    Math.floor(
                        regionIndex /
                        2
                    )
                ),

            ...enemy,

            hp:
                Math.round(
                    baseHp *
                    regionScale *
                    levelScale
                ),

            maxHp:
                Math.round(
                    baseHp *
                    regionScale *
                    levelScale
                ),

            damage:
                Math.max(
                    1,
                    Math.round(
                        (
                            enemy.damage ||
                            5
                        ) *
                        (
                            1 +
                            regionIndex *
                            0.02 +
                            Math.max(
                                0,
                                level -
                                1
                            ) *
                            0.006
                        )
                    )
                )
        };

        state.world
            .enemies
            .push(
                created
            );

        return created;
    }

    function addPortal(
        x,
        y,
        w,
        h,
        target,
        requirement,
        title,
        extra = {}
    ) {
        const portal = {
            id:
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

            direction:
                "forward",

            ...extra
        };

        state.world
            .portals
            .push(
                portal
            );

        return portal;
    }

    function addReturnPortal(
        target,
        title = null,
        side = "left"
    ) {
        if (
            !target
        ) {
            return;
        }

        const portal =
            side ===
                "right"

                ? {
                    x:
                        state.world.width -
                        140,

                    y:
                        state.world.height /
                        2 -
                        110,

                    w:
                        70,

                    h:
                        220
                }

                : {
                    x:
                        70,

                    y:
                        state.world.height /
                        2 -
                        110,

                    w:
                        70,

                    h:
                        220
                };

        addPortal(
            portal.x,
            portal.y,
            portal.w,
            portal.h,

            target,

            () =>
                true,

            title ||
            `VOLTAR PARA ${REGIONS[target].name}`,

            {
                direction:
                    "back",

                returnPortal:
                    true,

                arrivalSide:
                    side ===
                        "right"

                        ? "left"
                        : "right"
            }
        );
    }

    function addWorldBounds() {
        const edge =
            70;

        addObstacle(
            0,
            0,
            state.world.width,
            edge,
            "wall"
        );

        addObstacle(
            0,
            state.world.height -
                edge,
            state.world.width,
            edge,
            "wall"
        );

        addObstacle(
            0,
            0,
            edge,
            state.world.height,
            "wall"
        );

        addObstacle(
            state.world.width -
                edge,
            0,
            edge,
            state.world.height,
            "wall"
        );
    }

    /* =========================================================
       CASAS — PORTAS E TRANSIÇÕES
       ========================================================= */

    function getHouseSpec(
        houseId =
            state.currentHouse
                ?.id
    ) {
        return (
            HOUSE_INTERIORS[
                houseId
            ] ||
            HOUSE_INTERIORS.home
        );
    }

    function getHouseRoom() {
        const spec =
            getHouseSpec();

        return {
            ...spec.room
        };
    }

    function getHouseFurniture() {
        return (
            getHouseSpec()
                .furniture
                .map(
                    item => ({
                        ...item
                    })
                )
        );
    }

    function getInteriorDoor() {
        const room =
            getHouseRoom();

        const width =
            78;

        const depth =
            32;

        return {
            id:
                `interior_door_${state.currentHouse?.id || "home"}`,

            type:
                "interiorDoor",

            x:
                room.x +
                room.w /
                2 -
                width /
                2,

            y:
                room.y +
                room.h -
                depth /
                2,

            w:
                width,

            h:
                depth,

            cx:
                room.x +
                room.w /
                2,

            cy:
                room.y +
                room.h -
                24
        };
    }

    function getHouseInteriorNPCs() {
        if (
            !state.houseMode ||
            !state.currentHouse
        ) {
            return [];
        }

        const spec =
            getHouseSpec(
                state.currentHouse
                    .id
            );

        if (
            !spec.npc ||
            !NPC_LIBRARY[
                spec.npc
            ]
        ) {
            return [];
        }

        const room =
            spec.room;

        const base =
            NPC_LIBRARY[
                spec.npc
            ];

        return [
            {
                id:
                    `interior_${state.currentHouse.id}_${spec.npc}`,

                x:
                    room.x +
                    room.w *
                    0.72,

                y:
                    room.y +
                    room.h *
                    0.42,

                radius:
                    17,

                interior:
                    true,

                ...base
            }
        ];
    }

    function getExteriorDoorForBuilding(
        building
    ) {
        if (
            !building
        ) {
            return null;
        }

        return (
            state.world
                .doors
                .find(
                    door =>
                        door.buildingId ===
                        building.id
                ) ||
            null
        );
    }

    function getNearestExteriorDoor(
        maxDistance = 105
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
            maxDistance;

        for (
            const door of
            state.world.doors
        ) {
            const d =
                Math.hypot(
                    state.player.x -
                    door.cx,

                    state.player.y -
                    door.cy
                );

            if (
                d <
                bestDistance
            ) {
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
                        ?.enterable
                ) {
                    continue;
                }

                bestDistance =
                    d;

                best = {
                    door,
                    building,
                    distance:
                        d
                };
            }
        }

        return best;
    }

    function placePlayerInsideHouse() {
        const room =
            getHouseRoom();

        const door =
            getInteriorDoor();

        state.player.x =
            door.cx;

        state.player.y =
            room.y +
            room.h -
            78;

        state.keys.clear();
    }

    function enterHouseImmediate(
        building,
        initialSpawn = false
    ) {
        const outsideDoor =
            getExteriorDoorForBuilding(
                building
            );

        state.houseReturn = {
            x:
                outsideDoor
                    ? outsideDoor.cx
                    : building.x +
                      building.w /
                      2,

            y:
                outsideDoor
                    ? outsideDoor.cy +
                      42
                    : building.y +
                      building.h +
                      60
        };

        state.currentHouse =
            building;

        state.houseMode =
            true;

        placePlayerInsideHouse();

        if (
            initialSpawn
        ) {
            state.player.checkpoint = {
                area:
                    "village",

                x:
                    state.houseReturn.x,

                y:
                    state.houseReturn.y,

                houseId:
                    building.id,

                insideHouse:
                    true
            };
        }
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

        const door =
            getExteriorDoorForBuilding(
                building
            );

        if (
            door
        ) {
            door.open =
                true;
        }

        startTransition({
            label:
                building.name,

            fadeOut:
                0.28,

            hold:
                0.16,

            fadeIn:
                0.38,

            swap:
                () => {
                    enterHouseImmediate(
                        building,
                        false
                    );
                },

            done:
                () => {
                    showToast(
                        `Você entrou em ${building.name}.`
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
                    60
            };

        startTransition({
            label:
                "VILA DO CREPÚSCULO",

            fadeOut:
                0.28,

            hold:
                0.14,

            fadeIn:
                0.38,

            swap:
                () => {
                    state.houseMode =
                        false;

                    state.currentHouse =
                        null;

                    state.player.x =
                        returnPoint.x;

                    state.player.y =
                        returnPoint.y;

                    state.houseReturn =
                        null;

                    state.portalCooldown =
                        0.7;

                    state.keys.clear();
                },

            done:
                () => {
                    const exterior =
                        getExteriorDoorForBuilding(
                            building
                        );

                    if (
                        exterior
                    ) {
                        exterior.open =
                            false;
                    }
                }
        });
    }

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
            return false;
        }

        const region =
            REGIONS[
                target
            ];

        const label =
            options.label ||
            region.name;

        startTransition({
            label,

            fadeOut:
                region.special ||
                region.cave

                    ? 0.42
                    : 0.34,

            hold:
                region.special
                    ? 0.32
                    : 0.18,

            fadeIn:
                region.special ||
                region.cave

                    ? 0.56
                    : 0.42,

            swap:
                () => {
                    state.area =
                        target;

                    state.houseMode =
                        false;

                    state.currentHouse =
                        null;

                    state.houseReturn =
                        null;

                    state.bossBarTarget =
                        null;

                    state.finalChoiceShown =
                        false;

                    buildWorld();

                    const side =
                        options.arrivalSide ||
                        "left";

                    if (
                        side ===
                        "right"
                    ) {
                        state.player.x =
                            state.world.width -
                            175;

                        state.player.y =
                            state.world.height /
                            2;
                    }

                    else if (
                        side ===
                        "top"
                    ) {
                        state.player.x =
                            state.world.width /
                            2;

                        state.player.y =
                            165;
                    }

                    else if (
                        side ===
                        "bottom"
                    ) {
                        state.player.x =
                            state.world.width /
                            2;

                        state.player.y =
                            state.world.height -
                            165;
                    }

                    else {
                        state.player.x =
                            175;

                        state.player.y =
                            state.world.height /
                            2;
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

                    state.portalCooldown =
                        1;

                    state.keys.clear();
                },

            done:
                () => {
                    showToast(
                        `Você chegou a ${region.name}.`
                    );
                }
        });

        return true;
    }

    /* =========================================================
       BUILD WORLD
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
                `Builder ausente para região: ${state.area}`
            );
        }

        builder();

        if (
            state.area !==
            "village"
        ) {
            addReturnPortal(
                PREVIOUS_REGION[
                    state.area
                ]
            );
        }

        const label =
            $(
                "locationLabel"
            );

        if (
            label
        ) {
            label.textContent =
                REGIONS[
                    state.area
                ].name;
        }
    }

    /* =========================================================
       VILA DO CREPÚSCULO
       ========================================================= */

    function buildVillage() {
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

        addPath(
            [
                {
                    x:
                        70,

                    y:
                        1140
                },

                {
                    x:
                        3130,

                    y:
                        1140
                }
            ],

            120,
            "villageRoad"
        );

        addPath(
            [
                {
                    x:
                        1600,

                    y:
                        70
                },

                {
                    x:
                        1600,

                    y:
                        2130
                }
            ],

            120,
            "villageRoad"
        );

        addPath(
            [
                {
                    x:
                        480,

                    y:
                        650
                },

                {
                    x:
                        480,

                    y:
                        1140
                }
            ],

            74,
            "villageRoad"
        );

        addPath(
            [
                {
                    x:
                        2290,

                    y:
                        650
                },

                {
                    x:
                        2290,

                    y:
                        1140
                }
            ],

            74,
            "villageRoad"
        );

        addPath(
            [
                {
                    x:
                        2720,

                    y:
                        1140
                },

                {
                    x:
                        2720,

                    y:
                        1230
                }
            ],

            74,
            "villageRoad"
        );

        addPath(
            [
                {
                    x:
                        625,

                    y:
                        1140
                },

                {
                    x:
                        625,

                    y:
                        1500
                }
            ],

            74,
            "villageRoad"
        );

        addObstacle(
            1492,
            978,
            216,
            216,

            "fountain",

            {
                animatedWater:
                    true
            }
        );

        addGate(
            "north_gate",
            "north",

            1490,
            72,

            220,
            98,

            "PORTÃO DO NORTE",

            {
                target:
                    "shadow",

                route:
                    2,

                requiredAbility:
                    "dash",

                materials:
                    NORTH_GATE_REQUIREMENTS
            }
        );

        addGate(
            "west_gate",
            "west",

            72,
            1030,

            98,
            220,

            "PORTÃO DO OESTE",

            {
                target:
                    null,

                route:
                    3,

                requiredAbility:
                    "route2",

                futureRoute:
                    true
            }
        );

        addGate(
            "south_gate",
            "south",

            1490,
            2030,

            220,
            98,

            "PORTÃO DO SUL",

            {
                target:
                    null,

                route:
                    4,

                requiredAbility:
                    "route3",

                futureRoute:
                    true
            }
        );

        const treeCoords = [
            [180, 180],
            [390, 180],
            [650, 170],
            [940, 150],
            [1320, 190],
            [1870, 190],
            [2150, 160],
            [2600, 170],
            [2950, 180],
            [190, 700],
            [190, 1440],
            [250, 1960],
            [1050, 2010],
            [1180, 1900],
            [1950, 2020],
            [2400, 2030],
            [2850, 1960],
            [3040, 1710],
            [3010, 650],
            [2850, 1050],
            [2150, 750],
            [1900, 750],
            [1150, 1000]
        ];

        treeCoords.forEach(
            (
                [
                    x,
                    y
                ],
                index
            ) => {
                addTree(
                    x,
                    y,
                    `village_tree_${index}`
                );
            }
        );

        [
            [970, 760],
            [1100, 720],
            [1210, 1800],
            [1850, 1630],
            [2200, 940],
            [2740, 860],
            [650, 1160],
            [2370, 1830]
        ]
            .forEach(
                (
                    [
                        x,
                        y
                    ]
                ) => {
                    addObstacle(
                        x -
                        30,

                        y -
                        23,

                        60,
                        46,

                        "rock"
                    );
                }
            );

        addNPC(
            1030,
            610,
            "ELIAN"
        );

        addNPC(
            1940,
            1055,
            "MARA"
        );

        /*
            DORAN, BORIN E BRAN NÃO FICAM
            DUPLICADOS DO LADO DE FORA.

            Eles aparecem nos interiores:
            loja / forja / carpintaria.
        */

        addFood(
            1340,
            1450,

            "carrot",

            {
                respawnMin:
                    110,

                respawnMax:
                    165
            }
        );

        addFood(
            1425,
            1510,

            "carrot",

            {
                respawnMin:
                    115,

                respawnMax:
                    175
            }
        );

        addResource(
            890,
            1760,

            "folha",

            {
                amount:
                    3
            }
        );

        addResource(
            1080,
            1850,

            "algodao",

            {
                amount:
                    3
            }
        );

        addEnemy({
            id:
                "village_slime",

            x:
                1260,

            y:
                760,

            name:
                "LIMO DA QUIETUDE",

            icon:
                "🟢",

            type:
                "normal",

            hp:
                58,

            damage:
                8,

            speed:
                56,

            vision:
                190,

            attackRange:
                55,

            radius:
                18,

            color:
                "#6c9862",

            drop:
                "carvao",

            dropAmount:
                1
        });

        addEnemy({
            id:
                "village_wolf",

            x:
                2190,

            y:
                1450,

            name:
                "LOBO ESQUECIDO",

            icon:
                "🐺",

            type:
                "normal",

            hp:
                82,

            damage:
                12,

            speed:
                92,

            vision:
                260,

            attackRange:
                65,

            radius:
                21,

            color:
                "#686d78",

            drop:
                "couro",

            dropAmount:
                1,

            dropChance:
                0.65,

            special:
                "telegraphedCharge"
        });

        addEnemy({
            id:
                "village_resource_boss",

            x:
                2360,

            y:
                1810,

            name:
                "CERVO ANCESTRAL",

            icon:
                "🦌",

            type:
                "resourceBoss",

            hp:
                430,

            damage:
                18,

            speed:
                64,

            vision:
                270,

            attackRange:
                75,

            radius:
                30,

            color:
                "#788762",

            drop:
                "ouro",

            dropAmount:
                2,

            respawnTime:
                60,

            special:
                "natureBurst",

            leash:
                420
        });

        /*
            BOSS 1 DA ROTA LESTE
            SEM DASH.
        */

        addEnemy({
            id:
                "road_guardian",

            x:
                2870,

            y:
                1130,

            name:
                "GUARDIÃO DA ESTRADA",

            icon:
                "👺",

            type:
                "progression",

            hp:
                300,

            damage:
                21,

            speed:
                64,

            vision:
                340,

            attackRange:
                82,

            radius:
                30,

            color:
                "#945149",

            drop:
                "cristal",

            dropAmount:
                2,

            unlock:
                "forest",

            special:
                "memoryBurst"
        });

        addPortal(
            3060,
            1010,

            70,
            230,

            "forest",

            () =>
                hasDefeatedBoss(
                    "road_guardian"
                ),

            "FLORESTA",

            {
                arrivalSide:
                    "left"
            }
        );
    }

    /* =========================================================
       FLORESTA / CAMINHO
       ========================================================= */

    function forestPathY(
        x,
        area =
            "forest"
    ) {
        const rng =
            areaRng(
                area,
                "path"
            );

        const base =
            area ===
                "forest"

                ? 1210
                : 1120;

        const ampA =
            area ===
                "forest"

                ? 155 +
                  seededRange(
                      rng,
                      0,
                      45
                  )

                : 100 +
                  seededRange(
                      rng,
                      0,
                      35
                  );

        const ampB =
            area ===
                "forest"

                ? 38 +
                  seededRange(
                      rng,
                      0,
                      24
                  )

                : 28 +
                  seededRange(
                      rng,
                      0,
                      20
                  );

        const divA =
            area ===
                "forest"

                ? 305 +
                  seededRange(
                      rng,
                      -25,
                      35
                  )

                : 255 +
                  seededRange(
                      rng,
                      -22,
                      30
                  );

        const divB =
            area ===
                "forest"

                ? 108 +
                  seededRange(
                      rng,
                      -12,
                      18
                  )

                : 122 +
                  seededRange(
                      rng,
                      -10,
                      15
                  );

        const phaseA =
            seededRange(
                rng,
                -2,
                2
            );

        const phaseB =
            seededRange(
                rng,
                -2,
                2
            );

        return (
            base +
            Math.sin(
                x /
                divA +
                phaseA
            ) *
            ampA +
            Math.sin(
                x /
                divB +
                phaseB
            ) *
            ampB
        );
    }

    /* =========================================================
       FLORESTA
       ========================================================= */

    function buildForest() {
        const rng =
            areaRng(
                "forest",
                "objects"
            );

        const points =
            [];

        for (
            let x = 90;
            x <= 3310;
            x += 50
        ) {
            points.push({
                x,

                y:
                    forestPathY(
                        x,
                        "forest"
                    )
            });
        }

        addPath(
            points,
            116,
            "forestTrail"
        );

        for (
            let x = 150;
            x < 3270;
            x += 78
        ) {
            const y =
                forestPathY(
                    x,
                    "forest"
                );

            addDecoration(
                "pathStone",

                x +
                seededRange(
                    rng,
                    -18,
                    18
                ),

                y +
                seededRange(
                    rng,
                    -35,
                    35
                ),

                {
                    size:
                        seededRange(
                            rng,
                            17,
                            31
                        ),

                    angle:
                        seededRange(
                            rng,
                            -0.6,
                            0.6
                        )
                }
            );
        }

        let planted =
            0;

        let tries =
            0;

        while (
            planted <
                82 &&
            tries <
                1000
        ) {
            tries++;

            const x =
                seededInt(
                    rng,
                    135,
                    3260
                );

            const y =
                seededInt(
                    rng,
                    130,
                    2260
                );

            if (
                Math.abs(
                    y -
                    forestPathY(
                        x,
                        "forest"
                    )
                ) <
                170
            ) {
                continue;
            }

            addTree(
                x,
                y,
                `forest_tree_${planted}`
            );

            planted++;
        }

        for (
            let i = 0;
            i < 30;
            i++
        ) {
            addDecoration(
                i % 5 ===
                    0

                    ? "fallenLog"

                    : i % 3 ===
                      0

                    ? "bush"

                    : "fern",

                seededInt(
                    rng,
                    190,
                    3180
                ),

                seededInt(
                    rng,
                    180,
                    2180
                )
            );
        }

        [
            [650, 480, "carvao"],
            [1230, 1880, "carvao"],
            [1750, 540, "ferro"],
            [2170, 1830, "carvao"],
            [2710, 510, "ferro"],
            [3030, 1830, "carvao"],
            [1540, 1690, "ferro"],
            [2350, 440, "carvao"]
        ]
            .forEach(
                (
                    [
                        x,
                        y,
                        type
                    ]
                ) => {
                    addResource(
                        x,
                        y,
                        type
                    );
                }
            );

        addSecret(
            420,
            2020,

            "O Boneco que Lembra",

            "Você encontrou um espantalho antigo com o seu nome escrito antes mesmo de você chegar à floresta.",

            "🧸"
        );

        addSecret(
            2820,
            360,

            "Círculo das Raposas",

            "Pedras formam um círculo perfeito. No centro há marcas de pequenas patas que desaparecem no nada.",

            "🦊"
        );

        addNPC(
            720,
            860,

            "NARA",

            "Guardião da Floresta",

            "#7ea56b",

            [
                "A floresta percebe quem passa por ela.",
                "Há árvores que se movem quando ninguém está olhando.",
                "A Quietude não mata todas as coisas. Algumas continuam andando sem lembrar por quê.",
                "Siga as pedras. Elas foram colocadas antes de os moradores esquecerem o caminho."
            ]
        );

        for (
            let i = 0;
            i < 12;
            i++
        ) {
            const boar =
                i % 2 ===
                0;

            addEnemy({
                id:
                    `forest_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        520,
                        2820
                    ),

                y:
                    seededInt(
                        rng,
                        310,
                        2060
                    ),

                name:
                    boar
                        ? "JAVALI DA MATA"
                        : "LOBO FLORESTAL",

                icon:
                    boar
                        ? "🐗"
                        : "🐺",

                type:
                    "normal",

                hp:
                    boar
                        ? 116
                        : 102,

                damage:
                    boar
                        ? 16
                        : 14,

                speed:
                    boar
                        ? 80
                        : 98,

                vision:
                    275,

                attackRange:
                    66,

                radius:
                    boar
                        ? 24
                        : 22,

                color:
                    boar
                        ? "#715b43"
                        : "#67726e",

                drop:
                    boar
                        ? "carneCaca"
                        : "couro",

                dropAmount:
                    1,

                dropChance:
                    boar
                        ? 0.8
                        : 0.65
            });
        }

        /*
            BOSS 2
            SEM DASH.
        */

        addEnemy({
            id:
                "forest_guardian",

            x:
                2990,

            y:
                forestPathY(
                    2990,
                    "forest"
                ),

            name:
                "GUARDIÃO DA FLORESTA",

            icon:
                "🌳",

            type:
                "progression",

            hp:
                470,

            damage:
                26,

            speed:
                60,

            vision:
                365,

            attackRange:
                88,

            radius:
                36,

            color:
                "#416d43",

            drop:
                "fragmentoMemoria",

            dropAmount:
                2,

            unlock:
                "grove",

            special:
                "rootCircle"
        });

        addPortal(
            3260,

            forestPathY(
                3260,
                "forest"
            ) -
            105,

            70,
            220,

            "grove",

            () =>
                hasDefeatedBoss(
                    "forest_guardian"
                ),

            "BOSQUE",

            {
                arrivalSide:
                    "left"
            }
        );

        [
            620,
            1040,
            1460,
            2050,
            2470,
            2920
        ]
            .forEach(
                (
                    x,
                    index
                ) => {
                    addFood(
                        x,

                        forestPathY(
                            x,
                            "forest"
                        ) +
                        (
                            index %
                            2
                                ? 135
                                : -145
                        ),

                        "carrot",

                        {
                            respawnMin:
                                115,

                            respawnMax:
                                175
                        }
                    );
                }
            );
    }

    /* =========================================================
       BOSQUE
       ========================================================= */

    function buildGrove() {
        const rng =
            areaRng(
                "grove",
                "objects"
            );

        const points =
            [];

        for (
            let x = 90;
            x <= 3110;
            x += 48
        ) {
            points.push({
                x,

                y:
                    forestPathY(
                        x,
                        "grove"
                    )
            });
        }

        addPath(
            points,
            106,
            "groveTrail"
        );

        for (
            let x = 140;
            x < 3060;
            x += 68
        ) {
            addDecoration(
                "pathStone",

                x,

                forestPathY(
                    x,
                    "grove"
                ) +
                seededRange(
                    rng,
                    -28,
                    28
                ),

                {
                    size:
                        seededRange(
                            rng,
                            15,
                            27
                        )
                }
            );
        }

        let count =
            0;

        let guard =
            0;

        while (
            count <
                66 &&
            guard++ <
                850
        ) {
            const x =
                seededInt(
                    rng,
                    130,
                    3050
                );

            const y =
                seededInt(
                    rng,
                    130,
                    2160
                );

            if (
                Math.abs(
                    y -
                    forestPathY(
                        x,
                        "grove"
                    )
                ) <
                145
            ) {
                continue;
            }

            addTree(
                x,
                y,
                `grove_tree_${count}`
            );

            count++;
        }

        for (
            let i = 0;
            i < 38;
            i++
        ) {
            addDecoration(
                i % 6 ===
                    0

                    ? "ancientRoot"

                    : i % 4 ===
                      0

                    ? "flower"

                    : "fern",

                seededInt(
                    rng,
                    180,
                    3020
                ),

                seededInt(
                    rng,
                    170,
                    2110
                )
            );
        }

        addSecret(
            650,
            1900,

            "Estátua Sem Rosto",

            "A estátua perdeu o rosto, mas alguém continua deixando flores frescas aos seus pés.",

            "🗿"
        );

        addNPC(
            1340,
            780,

            "LYRA",

            "Druida",

            "#829f6f",

            [
                "Este bosque guarda memórias nas raízes.",
                "Quando uma árvore cai, às vezes outra nasce carregando lembranças que não são dela.",
                "As montanhas ficam além deste lugar.",
                "O Guardião do Bosque não odeia viajantes. Ele só esqueceu a diferença entre ameaça e visita."
            ]
        );

        for (
            let i = 0;
            i < 10;
            i++
        ) {
            const deer =
                i % 3 ===
                0;

            addEnemy({
                id:
                    `grove_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        430,
                        2700
                    ),

                y:
                    seededInt(
                        rng,
                        290,
                        1960
                    ),

                name:
                    deer
                        ? "CERVO DO BOSQUE"
                        : "FERA DO BOSQUE",

                icon:
                    deer
                        ? "🦌"
                        : "🐗",

                type:
                    "normal",

                hp:
                    deer
                        ? 142
                        : 150,

                damage:
                    deer
                        ? 16
                        : 19,

                speed:
                    deer
                        ? 92
                        : 84,

                vision:
                    285,

                attackRange:
                    68,

                radius:
                    24,

                color:
                    deer
                        ? "#8d7959"
                        : "#60745e",

                drop:
                    deer
                        ? "carneCaca"
                        : "couro",

                dropAmount:
                    1,

                dropChance:
                    0.75
            });
        }

        /*
            BOSS 3
            SEM DASH.
        */

        addEnemy({
            id:
                "grove_guardian",

            x:
                2760,

            y:
                1120,

            name:
                "GUARDIÃO DO BOSQUE",

            icon:
                "🌲",

            type:
                "progression",

            hp:
                560,

            damage:
                30,

            speed:
                59,

            vision:
                375,

            attackRange:
                90,

            radius:
                37,

            color:
                "#4f744f",

            drop:
                "fragmentoMemoria",

            dropAmount:
                2,

            unlock:
                "mountains",

            special:
                "leafStorm"
        });

        addPortal(
            3060,
            1010,

            70,
            220,

            "mountains",

            () =>
                hasDefeatedBoss(
                    "grove_guardian"
                ),

            "MONTANHAS",

            {
                arrivalSide:
                    "left"
            }
        );
    }

    /* =========================================================
       MONTANHAS
       ========================================================= */

    function buildMountains() {
        const rng =
            areaRng(
                "mountains",
                "objects"
            );

        addPath(
            [
                {
                    x:
                        130,

                    y:
                        1140
                },

                {
                    x:
                        600,

                    y:
                        1080
                },

                {
                    x:
                        1040,

                    y:
                        1250
                },

                {
                    x:
                        1520,

                    y:
                        1070
                },

                {
                    x:
                        2080,

                    y:
                        1180
                },

                {
                    x:
                        2640,

                    y:
                        1030
                },

                {
                    x:
                        3370,

                    y:
                        1140
                }
            ],

            92,
            "snowTrail"
        );

        for (
            let i = 0;
            i < 54;
            i++
        ) {
            addObstacle(
                seededInt(
                    rng,
                    160,
                    3260
                ),

                seededInt(
                    rng,
                    150,
                    2100
                ),

                seededInt(
                    rng,
                    48,
                    108
                ),

                seededInt(
                    rng,
                    36,
                    78
                ),

                i % 8 ===
                    0

                    ? "iceRock"

                    : i % 5 ===
                      0

                    ? "oreRock"

                    : "snowrock"
            );
        }

        for (
            let i = 0;
            i < 54;
            i++
        ) {
            addDecoration(
                i % 8 ===
                    0

                    ? "deadPine"

                    : i % 6 ===
                      0

                    ? "oreSpark"

                    : i % 4 ===
                      0

                    ? "snowDrift"

                    : "windMark",

                seededInt(
                    rng,
                    150,
                    3300
                ),

                seededInt(
                    rng,
                    140,
                    2140
                )
            );
        }

        [
            [450, 430, "ferro"],
            [720, 1710, "ferro"],
            [1050, 650, "ouro"],
            [1450, 1780, "ferro"],
            [1860, 530, "ferro"],
            [2250, 1740, "ouro"],
            [2700, 610, "ferro"],
            [3060, 1640, "ferro"],
            [1600, 1110, "ouro"],
            [2870, 1360, "ferro"]
        ]
            .forEach(
                (
                    [
                        x,
                        y,
                        type
                    ]
                ) => {
                    addResource(
                        x,
                        y,
                        type
                    );
                }
            );

        addSecret(
            3050,
            370,

            "Espada Congelada",

            "Uma espada sem dono está presa no gelo. O nome no cabo foi raspado muitas vezes.",

            "🗡️"
        );

        addNPC(
            760,
            930,

            "KAEL",

            "Montanhista",

            "#d2d6d2",

            [
                "O vento daqui apaga pegadas em minutos.",
                "Minérios abaixo da neve ainda reagem à magia.",
                "As bestas da montanha servem de alimento, mas caçá-las é arriscado.",
                "A Sentinela lança pedras antes de avançar. Quando o chão avisar, saia do círculo."
            ]
        );

        for (
            let i = 0;
            i < 11;
            i++
        ) {
            const deer =
                i % 3 ===
                0;

            addEnemy({
                id:
                    `mountain_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        460,
                        2950
                    ),

                y:
                    seededInt(
                        rng,
                        280,
                        1940
                    ),

                name:
                    deer
                        ? "CERVO DA NEVE"
                        : "BESTA DAS MONTANHAS",

                icon:
                    deer
                        ? "🦌"
                        : "🐐",

                type:
                    "normal",

                hp:
                    deer
                        ? 168
                        : 190,

                damage:
                    deer
                        ? 20
                        : 24,

                speed:
                    deer
                        ? 86
                        : 74,

                vision:
                    300,

                attackRange:
                    deer
                        ? 70
                        : 85,

                radius:
                    25,

                color:
                    deer
                        ? "#d7d4c9"
                        : "#bec5c7",

                drop:
                    deer
                        ? "carneCaca"
                        : "couro",

                dropAmount:
                    1,

                dropChance:
                    0.8,

                special:
                    deer
                        ? null
                        : "rockThrow"
            });
        }

        /*
            BOSS 4
            SEM DASH.
        */

        addEnemy({
            id:
                "mountain_guardian",

            x:
                3000,

            y:
                1110,

            name:
                "SENTINELA DAS MONTANHAS",

            icon:
                "🗿",

            type:
                "progression",

            hp:
                700,

            damage:
                35,

            speed:
                55,

            vision:
                390,

            attackRange:
                96,

            radius:
                39,

            color:
                "#697176",

            drop:
                "fragmentoMemoria",

            dropAmount:
                3,

            unlock:
                "iron",

            special:
                "rockStorm"
        });

        addPortal(
            3300,
            1000,

            70,
            230,

            "iron",

            () =>
                hasDefeatedBoss(
                    "mountain_guardian"
                ),

            "CAVERNA DE FERRO",

            {
                arrivalSide:
                    "left",

                caveEntrance:
                    true
            }
        );
    }

    /* =========================================================
       CAVERNA DE FERRO
       ========================================================= */

    function buildIron() {
        const rng =
            areaRng(
                "iron",
                "objects"
            );

        addPath(
            [
                {
                    x:
                        120,

                    y:
                        1000
                },

                {
                    x:
                        620,

                    y:
                        930
                },

                {
                    x:
                        1180,

                    y:
                        1050
                },

                {
                    x:
                        1750,

                    y:
                        900
                },

                {
                    x:
                        2320,

                    y:
                        1040
                },

                {
                    x:
                        2890,

                    y:
                        980
                }
            ],

            82,
            "mineTrack"
        );

        for (
            let i = 0;
            i < 40;
            i++
        ) {
            addObstacle(
                seededInt(
                    rng,
                    150,
                    2810
                ),

                seededInt(
                    rng,
                    150,
                    1810
                ),

                seededInt(
                    rng,
                    50,
                    90
                ),

                seededInt(
                    rng,
                    38,
                    65
                ),

                i % 5 ===
                    0

                    ? "oreRock"
                    : "ironrock"
            );
        }

        for (
            let i = 0;
            i < 38;
            i++
        ) {
            let type =
                "ferro";

            if (
                i % 8 ===
                0
            ) {
                type =
                    "ouro";
            }

            if (
                i % 14 ===
                0
            ) {
                type =
                    "diamante";
            }

            addResource(
                seededInt(
                    rng,
                    210,
                    2740
                ),

                seededInt(
                    rng,
                    190,
                    1760
                ),

                type
            );
        }

        for (
            let i = 0;
            i < 32;
            i++
        ) {
            addDecoration(
                i % 5 ===
                    0

                    ? "mineLantern"

                    : i % 4 ===
                      0

                    ? "rail"

                    : i % 3 ===
                      0

                    ? "toolCrate"

                    : "stalagmite",

                seededInt(
                    rng,
                    190,
                    2800
                ),

                seededInt(
                    rng,
                    170,
                    1800
                )
            );
        }

        addSecret(
            520,
            1640,

            "Capacete Abandonado",

            "Há um capacete coberto de poeira. Dentro dele, uma anotação diz apenas: 'não siga a voz da parede'.",

            "⛑️"
        );

        for (
            let i = 0;
            i < 9;
            i++
        ) {
            addEnemy({
                id:
                    `iron_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        420,
                        2450
                    ),

                y:
                    seededInt(
                        rng,
                        250,
                        1640
                    ),

                name:
                    "MINEIRO CORROMPIDO",

                icon:
                    "⛏️",

                type:
                    "normal",

                hp:
                    205,

                damage:
                    25,

                speed:
                    65,

                vision:
                    275,

                attackRange:
                    76,

                radius:
                    25,

                color:
                    "#626a6d",

                drop:
                    i % 4 ===
                        0

                        ? "ouro"
                        : "ferro",

                dropAmount:
                    1,

                dropChance:
                    0.62,

                special:
                    i >= 5
                        ? "oreBurst"
                        : null
            });
        }

        /*
            BOSS 5
            SEM DASH.
        */

        addEnemy({
            id:
                "iron_guardian",

            x:
                2550,

            y:
                1000,

            name:
                "GUARDIÃO DE FERRO",

            icon:
                "⚙️",

            type:
                "progression",

            hp:
                800,

            damage:
                39,

            speed:
                56,

            vision:
                400,

            attackRange:
                100,

            radius:
                40,

            color:
                "#70787d",

            drop:
                "fragmentoMemoria",

            dropAmount:
                3,

            unlock:
                "ruby",

            special:
                "oreBurst"
        });

        addPortal(
            2860,
            870,

            70,
            230,

            "ruby",

            () =>
                hasDefeatedBoss(
                    "iron_guardian"
                ),

            "CAVERNA DE RUBI",

            {
                arrivalSide:
                    "left",

                caveEntrance:
                    true
            }
        );
    }

    /* =========================================================
       CAVERNA DE RUBI
       ========================================================= */

    function buildRuby() {
        const rng =
            areaRng(
                "ruby",
                "objects"
            );

        addPath(
            [
                {
                    x:
                        120,

                    y:
                        1080
                },

                {
                    x:
                        650,

                    y:
                        1000
                },

                {
                    x:
                        1180,

                    y:
                        1140
                },

                {
                    x:
                        1720,

                    y:
                        940
                },

                {
                    x:
                        2280,

                    y:
                        1080
                },

                {
                    x:
                        3000,

                    y:
                        430
                }
            ],

            84,
            "crystalTrail"
        );

        for (
            let i = 0;
            i < 42;
            i++
        ) {
            addObstacle(
                seededInt(
                    rng,
                    170,
                    2980
                ),

                seededInt(
                    rng,
                    170,
                    1950
                ),

                seededInt(
                    rng,
                    48,
                    92
                ),

                seededInt(
                    rng,
                    38,
                    70
                ),

                i % 4 ===
                    0

                    ? "rubyPillar"
                    : "rubyrock"
            );
        }

        for (
            let i = 0;
            i < 54;
            i++
        ) {
            const type =
                i % 5 ===
                    0

                    ? "diamante"

                    : i % 9 ===
                      0

                    ? "ouro"

                    : "rubi";

            addResource(
                seededInt(
                    rng,
                    220,
                    2980
                ),

                seededInt(
                    rng,
                    190,
                    1920
                ),

                type,

                {
                    amount:
                        type ===
                            "diamante"

                            ? randomInt(
                                1,
                                2
                            )

                            : randomInt(
                                1,
                                3
                            )
                }
            );
        }

        for (
            let i = 0;
            i < 40;
            i++
        ) {
            addDecoration(
                i % 3 ===
                    0

                    ? "crystalPillar"
                    : "crystalShard",

                seededInt(
                    rng,
                    180,
                    3020
                ),

                seededInt(
                    rng,
                    170,
                    1980
                )
            );
        }

        addSecret(
            2810,
            470,

            "Coração Rubi",

            "Um cristal pulsa como um coração. Quando você se aproxima, ele repete uma lembrança que você ainda não viveu.",

            "❤️"
        );

        for (
            let i = 0;
            i < 10;
            i++
        ) {
            addEnemy({
                id:
                    `ruby_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        400,
                        2700
                    ),

                y:
                    seededInt(
                        rng,
                        260,
                        1830
                    ),

                name:
                    "CRIATURA RUBI",

                icon:
                    "♦️",

                type:
                    "normal",

                hp:
                    242,

                damage:
                    29,

                speed:
                    73,

                vision:
                    292,

                attackRange:
                    82,

                radius:
                    26,

                color:
                    "#a34554",

                drop:
                    i % 4 ===
                        0

                        ? "diamante"
                        : "rubi",

                dropAmount:
                    1,

                dropChance:
                    0.7,

                special:
                    i >= 4
                        ? "crystalShot"
                        : null
            });
        }

        /*
            BOSS 6
            ÚLTIMO BOSS ANTES DO DASH.
            NÃO POSSUI DASH.
        */

        addEnemy({
            id:
                "ruby_guardian",

            x:
                2580,

            y:
                1080,

            name:
                "GUARDIÃO RUBI",

            icon:
                "🔴",

            type:
                "progression",

            hp:
                920,

            damage:
                44,

            speed:
                60,

            vision:
                410,

            attackRange:
                104,

            radius:
                41,

            color:
                "#a33b4f",

            drop:
                "rubi",

            dropAmount:
                6,

            unlock:
                "monarchMaze",

            special:
                "crystalRain"
        });

        /*
            ENTRADA DO LABIRINTO:
            CANTO SUPERIOR DIREITO.
        */

        addPortal(
            2990,
            145,

            105,
            150,

            "monarchMaze",

            () =>
                hasDefeatedBoss(
                    "ruby_guardian"
                ),

            "CAVERNA ESQUECIDA",

            {
                arrivalSide:
                    "left",

                caveEntrance:
                    true,

                upperRight:
                    true
            }
        );

        addDecoration(
            "darkCaveEntrance",

            3040,
            235,

            {
                large:
                    true
            }
        );
    }

    /* =========================================================
       LABIRINTO DO MONARCA
       ========================================================= */

    function generateMaze(
        cols,
        rows,
        rng
    ) {
        const cells =
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
                            _,
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
            cells[
                Math.floor(
                    rows /
                    2
                )
            ][0];

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
                !cells[
                    y -
                    1
                ][x]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[
                            y -
                            1
                        ][x],

                    dir:
                        "n",

                    opposite:
                        "s"
                });
            }

            if (
                x <
                    cols -
                    1 &&
                !cells[
                    y
                ][
                    x +
                    1
                ]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[
                            y
                        ][
                            x +
                            1
                        ],

                    dir:
                        "e",

                    opposite:
                        "w"
                });
            }

            if (
                y <
                    rows -
                    1 &&
                !cells[
                    y +
                    1
                ][x]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[
                            y +
                            1
                        ][x],

                    dir:
                        "s",

                    opposite:
                        "n"
                });
            }

            if (
                x >
                    0 &&
                !cells[
                    y
                ][
                    x -
                    1
                ]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[
                            y
                        ][
                            x -
                            1
                        ],

                    dir:
                        "w",

                    opposite:
                        "e"
                });
            }

            if (
                choices.length
            ) {
                const picked =
                    choices[
                        Math.floor(
                            rng() *
                            choices.length
                        )
                    ];

                current
                    .walls[
                        picked.dir
                    ] =
                    false;

                picked
                    .cell
                    .walls[
                        picked.opposite
                    ] =
                    false;

                stack.push(
                    current
                );

                current =
                    picked.cell;

                current.visited =
                    true;

                visited++;
            }

            else {
                current =
                    stack.pop();
            }
        }

        return cells;
    }

    function buildMonarchMaze() {
        const rng =
            areaRng(
                "monarchMaze",
                "maze"
            );

        const cols =
            13;

        const rows =
            12;

        const cell =
            100;

        const wall =
            16;

        const ox =
            130;

        const oy =
            260;

        const entranceRow =
            Math.floor(
                rows /
                2
            );

        const cells =
            generateMaze(
                cols,
                rows,
                rng
            );

        cells[
            entranceRow
        ][0]
            .walls
            .w =
            false;

        let exitRow =
            0;

        let bestScore =
            -Infinity;

        for (
            let y = 0;
            y < rows;
            y++
        ) {
            const score =
                Math.abs(
                    y -
                    entranceRow
                ) +
                rng() *
                2.5;

            if (
                score >
                bestScore
            ) {
                bestScore =
                    score;

                exitRow =
                    y;
            }
        }

        cells[
            exitRow
        ][
            cols -
            1
        ]
            .walls
            .e =
            false;

        const addMazeWall =
            (
                x,
                y,
                w,
                h
            ) => {

                addObstacle(
                    x,
                    y,
                    w,
                    h,

                    "mazeWall",

                    {
                        blocksLight:
                            true
                    }
                );
            };

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
                    cells[
                        y
                    ][x];

                const px =
                    ox +
                    x *
                    cell;

                const py =
                    oy +
                    y *
                    cell;

                if (
                    cellData
                        .walls
                        .n
                ) {
                    addMazeWall(
                        px,
                        py,

                        cell +
                        wall,

                        wall
                    );
                }

                if (
                    cellData
                        .walls
                        .w
                ) {
                    addMazeWall(
                        px,
                        py,

                        wall,

                        cell +
                        wall
                    );
                }

                if (
                    x ===
                        cols -
                        1 &&
                    cellData
                        .walls
                        .e
                ) {
                    addMazeWall(
                        px +
                        cell,

                        py,

                        wall,

                        cell +
                        wall
                    );
                }

                if (
                    y ===
                        rows -
                        1 &&
                    cellData
                        .walls
                        .s
                ) {
                    addMazeWall(
                        px,
                        py +
                        cell,

                        cell +
                        wall,

                        wall
                    );
                }
            }
        }

        const exitY =
            oy +
            exitRow *
            cell +
            cell /
            2;

        const arena = {
            x:
                1640,

            y:
                300,

            w:
                1100,

            h:
                1450
        };

        const gapY =
            clamp(
                exitY -
                100,

                arena.y +
                100,

                arena.y +
                arena.h -
                300
            );

        addObstacle(
            arena.x,
            arena.y,

            arena.w,
            24,

            "arenaWall",

            {
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
                blocksLight:
                    true
            }
        );

        addObstacle(
            arena.x,
            arena.y,

            24,

            Math.max(
                0,
                gapY -
                arena.y
            ),

            "arenaWall",

            {
                blocksLight:
                    true
            }
        );

        addObstacle(
            arena.x,
            gapY +
                200,

            24,

            Math.max(
                0,

                arena.y +
                arena.h -
                (
                    gapY +
                    200
                )
            ),

            "arenaWall",

            {
                blocksLight:
                    true
            }
        );

        addPath(
            [
                {
                    x:
                        ox +
                        cols *
                        cell,

                    y:
                        exitY
                },

                {
                    x:
                        arena.x +
                        80,

                    y:
                        exitY
                },

                {
                    x:
                        arena.x +
                        arena.w /
                        2,

                    y:
                        arena.y +
                        arena.h /
                        2
                }
            ],

            78,
            "mazeExit"
        );

        state.world.maze = {
            cols,
            rows,
            cell,
            wall,

            ox,
            oy,

            cells,

            entranceRow,
            exitRow,

            arena,

            arenaSpawnPoints: [
                {
                    x:
                        arena.x +
                        170,

                    y:
                        arena.y +
                        210
                },

                {
                    x:
                        arena.x +
                        arena.w -
                        170,

                    y:
                        arena.y +
                        220
                },

                {
                    x:
                        arena.x +
                        170,

                    y:
                        arena.y +
                        arena.h -
                        220
                },

                {
                    x:
                        arena.x +
                        arena.w -
                        170,

                    y:
                        arena.y +
                        arena.h -
                        220
                },

                {
                    x:
                        arena.x +
                        arena.w /
                        2,

                    y:
                        arena.y +
                        260
                },

                {
                    x:
                        arena.x +
                        arena.w /
                        2,

                    y:
                        arena.y +
                        arena.h -
                        260
                }
            ]
        };

        const altarX =
            arena.x +
            arena.w /
            2;

        const altarY =
            arena.y +
            arena.h /
            2;

        addTrial(
            altarX,
            altarY,

            "dash_altar",

            "ALTAR DO PODER",

            {
                dashAltar:
                    true,

                radius:
                    58
            }
        );

        addDecoration(
            "dashAltar",
            altarX,
            altarY
        );

        for (
            let i = 0;
            i < 20;
            i++
        ) {
            const kind =
                i % 3;

            const cx =
                seededInt(
                    rng,
                    1,
                    cols -
                    2
                );

            const cy =
                seededInt(
                    rng,
                    0,
                    rows -
                    1
                );

            const x =
                ox +
                cx *
                cell +
                cell /
                2;

            const y =
                oy +
                cy *
                cell +
                cell /
                2;

            if (
                kind ===
                0
            ) {
                addEnemy({
                    id:
                        `maze_spider_${i}`,

                    x,
                    y,

                    name:
                        "ARANHA DO VAZIO",

                    icon:
                        "🕷️",

                    type:
                        "normal",

                    hp:
                        250,

                    damage:
                        28,

                    speed:
                        92,

                    vision:
                        235,

                    attackRange:
                        62,

                    radius:
                        21,

                    color:
                        "#62506e",

                    drop:
                        "fragmentoMemoria",

                    dropAmount:
                        1,

                    dropChance:
                        0.4,

                    special:
                        "webShot"
                });
            }

            else if (
                kind ===
                1
            ) {
                addEnemy({
                    id:
                        `maze_scorpion_${i}`,

                    x,
                    y,

                    name:
                        "ESCORPIÃO SOMBRIO",

                    icon:
                        "🦂",

                    type:
                        "normal",

                    hp:
                        310,

                    damage:
                        36,

                    speed:
                        68,

                    vision:
                        245,

                    attackRange:
                        72,

                    radius:
                        24,

                    color:
                        "#704a56",

                    drop:
                        "rubi",

                    dropAmount:
                        1,

                    dropChance:
                        0.42,

                    special:
                        "poisonBurst"
                });
            }

            else {
                addEnemy({
                    id:
                        `maze_bat_${i}`,

                    x,
                    y,

                    name:
                        "MORCEGO DA QUIETUDE",

                    icon:
                        "🦇",

                    type:
                        "normal",

                    hp:
                        205,

                    damage:
                        25,

                    speed:
                        118,

                    vision:
                        270,

                    attackRange:
                        64,

                    radius:
                        19,

                    color:
                        "#44364e",

                    drop:
                        "essencia",

                    dropAmount:
                        1,

                    dropChance:
                        0.34,

                    special:
                        "sonicBurst"
                });
            }
        }

        for (
            let i = 0;
            i < 24;
            i++
        ) {
            addDecoration(
                i % 5 ===
                    0

                    ? "cobweb"

                    : i % 4 ===
                      0

                    ? "bones"

                    : "darkPebble",

                seededInt(
                    rng,
                    210,
                    1450
                ),

                seededInt(
                    rng,
                    250,
                    1680
                )
            );
        }

        if (
            state.player
                ?.monarchAwakened &&
            !state.player
                ?.monarchDefeated
        ) {
            spawnMonarch(
                false
            );
        }
    }
