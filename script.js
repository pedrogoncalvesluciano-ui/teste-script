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
        /* =========================================================
       PARTE 2/3
       VEYRA: A QUIETUDE — REBUILD V18

       CONTINUAÇÃO DIRETA DA PARTE 1.

       CONTÉM:
       - regiões restantes
       - colisão completa
       - interiores / móveis
       - movimentação
       - sobrevivência
       - inventário
       - poções
       - combate
       - habilidades Q/R/F
       - Dash
       - IA
       - bosses
       - Monarca
       - drops
       - coleta segurando E
       - NPCs
       - diálogos
       - missões
       - loja
       - vender tudo
       - forja
       - status
       - portões
       - altar
       - hordas
       - flauta
       - Inferno
       - progressão
       ========================================================= */


    /* =========================================================
       ROTA 2 — TERRAS SOMBRIAS
       ========================================================= */

    function buildShadow() {

        const rng =
            areaRng(
                "shadow",
                "objects"
            );


        addPath(
            [
                {
                    x: 165,
                    y: 1150
                },

                {
                    x: 610,
                    y: 1030
                },

                {
                    x: 1090,
                    y: 1250
                },

                {
                    x: 1530,
                    y: 960
                },

                {
                    x: 2010,
                    y: 1230
                },

                {
                    x: 2480,
                    y: 980
                },

                {
                    x: 3180,
                    y: 1140
                }
            ],

            92,

            "shadowTrail"
        );


        for (
            let i = 0;
            i < 52;
            i++
        ) {

            const x =
                seededInt(
                    rng,
                    150,
                    3140
                );


            const y =
                seededInt(
                    rng,
                    145,
                    2150
                );


            const size =
                seededInt(
                    rng,
                    48,
                    105
                );


            addObstacle(
                x,
                y,

                size,
                seededInt(
                    rng,
                    38,
                    82
                ),

                i % 7 === 0
                    ? "shadowCrystal"
                    : "darkrock"
            );

        }


        for (
            let i = 0;
            i < 34;
            i++
        ) {

            addDecoration(
                i % 5 === 0
                    ? "shadowTree"
                    : i % 4 === 0
                      ? "shadowPool"
                      : i % 3 === 0
                        ? "blueFlame"
                        : "darkGrass",

                seededInt(
                    rng,
                    180,
                    3120
                ),

                seededInt(
                    rng,
                    170,
                    2130
                )
            );

        }


        [
            [450, 430, "diamante"],
            [730, 1860, "ouro"],
            [1120, 520, "diamante"],
            [1450, 1740, "rubi"],
            [1850, 440, "ouro"],
            [2240, 1850, "diamante"],
            [2640, 520, "rubi"],
            [2970, 1650, "diamante"]
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
            530,
            1900,

            "A Voz no Lago",

            "A superfície negra repete sua voz antes mesmo que você fale.",

            "🌑"
        );


        addSecret(
            2800,
            410,

            "Árvore sem Sombra",

            "Mesmo cercada por escuridão, esta árvore não projeta sombra alguma.",

            "🌳"
        );


        addNPC(
            780,
            940,

            "AELIA",

            "Viajante Sombria",

            "#8793c5",

            [
                "Você chegou até aqui depois de aprender a se mover rápido o bastante.",
                "Isso não significa que as coisas daqui vão esperar você terminar de pensar.",
                "Algumas criaturas investem antes de atacar.",
                "Se o chão ou o corpo do inimigo avisar que algo está vindo, use movimento — não apenas defesa."
            ]
        );


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            const type =
                i % 3;


            if (
                type === 0
            ) {

                addEnemy({

                    id:
                        `shadow_wraith_${i}`,

                    x:
                        seededInt(
                            rng,
                            470,
                            2800
                        ),

                    y:
                        seededInt(
                            rng,
                            280,
                            2000
                        ),

                    name:
                        "ESPECTRO SOMBRIO",

                    icon:
                        "👻",

                    type:
                        "normal",

                    hp:
                        330,

                    damage:
                        38,

                    speed:
                        104,

                    vision:
                        340,

                    attackRange:
                        78,

                    radius:
                        24,

                    color:
                        "#4f557c",

                    drop:
                        "essencia",

                    dropAmount:
                        1,

                    dropChance:
                        0.55,

                    special:
                        "shadowProjectile"

                });

            }

            else if (
                type === 1
            ) {

                addEnemy({

                    id:
                        `shadow_hound_${i}`,

                    x:
                        seededInt(
                            rng,
                            460,
                            2830
                        ),

                    y:
                        seededInt(
                            rng,
                            280,
                            1990
                        ),

                    name:
                        "CÃO DO VAZIO",

                    icon:
                        "🐕",

                    type:
                        "normal",

                    hp:
                        360,

                    damage:
                        41,

                    speed:
                        118,

                    vision:
                        360,

                    attackRange:
                        72,

                    radius:
                        25,

                    color:
                        "#353a55",

                    drop:
                        "fragmentoMemoria",

                    dropAmount:
                        1,

                    dropChance:
                        0.45,

                    special:
                        "telegraphedCharge"

                });

            }

            else {

                addEnemy({

                    id:
                        `shadow_knight_${i}`,

                    x:
                        seededInt(
                            rng,
                            470,
                            2800
                        ),

                    y:
                        seededInt(
                            rng,
                            280,
                            1990
                        ),

                    name:
                        "CAVALEIRO VAZIO",

                    icon:
                        "♞",

                    type:
                        "normal",

                    hp:
                        430,

                    damage:
                        44,

                    speed:
                        76,

                    vision:
                        330,

                    attackRange:
                        92,

                    radius:
                        28,

                    color:
                        "#50546a",

                    drop:
                        "ouro",

                    dropAmount:
                        1,

                    dropChance:
                        0.48,

                    special:
                        "darkSlash"

                });

            }

        }


        addEnemy({

            id:
                "shadow_guardian",

            x:
                2920,

            y:
                1110,

            name:
                "GUARDIÃO SOMBRIO",

            icon:
                "🌑",

            type:
                "progression",

            hp:
                1250,

            damage:
                53,

            speed:
                76,

            vision:
                470,

            attackRange:
                112,

            radius:
                42,

            color:
                "#363a60",

            drop:
                "fragmentoMemoria",

            dropAmount:
                4,

            unlock:
                "fairy",

            special:
                "shadowGuardian",

            bossDash:
                true

        });


        addPortal(
            3180,
            1010,

            70,
            230,

            "fairy",

            () =>
                hasDefeatedBoss(
                    "shadow_guardian"
                ),

            "REINO DAS FADAS",

            {
                arrivalSide:
                    "left"
            }
        );

    }


    /* =========================================================
       REINO DAS FADAS
       ========================================================= */

    function buildFairy() {

        const rng =
            areaRng(
                "fairy",
                "objects"
            );


        addPath(
            [
                {
                    x: 140,
                    y: 1150
                },

                {
                    x: 600,
                    y: 1070
                },

                {
                    x: 980,
                    y: 1260
                },

                {
                    x: 1490,
                    y: 970
                },

                {
                    x: 1930,
                    y: 1220
                },

                {
                    x: 2440,
                    y: 1010
                },

                {
                    x: 3150,
                    y: 1140
                }
            ],

            98,

            "fairyTrail"
        );


        for (
            let i = 0;
            i < 44;
            i++
        ) {

            addDecoration(
                i % 6 === 0
                    ? "fairyTree"
                    : i % 5 === 0
                      ? "magicFlower"
                      : i % 4 === 0
                        ? "fairyCrystal"
                        : "glowingGrass",

                seededInt(
                    rng,
                    170,
                    3160
                ),

                seededInt(
                    rng,
                    160,
                    2140
                ),

                {
                    hue:
                        seededInt(
                            rng,
                            0,
                            2
                        )
                }
            );

        }


        for (
            let i = 0;
            i < 22;
            i++
        ) {

            const x =
                seededInt(
                    rng,
                    220,
                    3040
                );


            const y =
                seededInt(
                    rng,
                    200,
                    2050
                );


            addObstacle(
                x,
                y,

                seededInt(
                    rng,
                    45,
                    85
                ),

                seededInt(
                    rng,
                    38,
                    76
                ),

                i % 4 === 0
                    ? "fairyStone"
                    : "magicBush"
            );

        }


        [
            [560, 430, "diamante"],
            [960, 1870, "rubi"],
            [1380, 540, "diamante"],
            [1820, 1800, "ouro"],
            [2240, 490, "rubi"],
            [2710, 1710, "diamante"]
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
            520,
            1820,

            "Flor que Conhece seu Nome",

            "Quando você se aproxima, a flor pronuncia seu nome numa voz que parece sua.",

            "🌸"
        );


        addNPC(
            760,
            840,

            "AERIS",

            "Fada Anciã",

            "#e39edc",

            [
                "Este reino parece feliz porque as flores ainda conseguem lembrar.",
                "Mas cada luz que apaga leva uma história junto.",
                "A Guardiã dos Fios protege o caminho para o alto.",
                "Ela luta como quem tenta costurar o próprio mundo antes que ele se desfaça."
            ]
        );


        for (
            let i = 0;
            i < 11;
            i++
        ) {

            const type =
                i % 3;


            if (
                type === 0
            ) {

                addEnemy({

                    id:
                        `fairy_imp_${i}`,

                    x:
                        seededInt(
                            rng,
                            470,
                            2790
                        ),

                    y:
                        seededInt(
                            rng,
                            270,
                            1990
                        ),

                    name:
                        "FADA CORROMPIDA",

                    icon:
                        "🧚",

                    type:
                        "normal",

                    hp:
                        390,

                    damage:
                        41,

                    speed:
                        118,

                    vision:
                        350,

                    attackRange:
                        175,

                    radius:
                        23,

                    color:
                        "#d779c1",

                    drop:
                        "essencia",

                    dropAmount:
                        1,

                    dropChance:
                        0.52,

                    special:
                        "fairyBolt"

                });

            }

            else if (
                type === 1
            ) {

                addEnemy({

                    id:
                        `fairy_beast_${i}`,

                    x:
                        seededInt(
                            rng,
                            470,
                            2800
                        ),

                    y:
                        seededInt(
                            rng,
                            270,
                            1990
                        ),

                    name:
                        "FERA FEÉRICA",

                    icon:
                        "🦊",

                    type:
                        "normal",

                    hp:
                        450,

                    damage:
                        45,

                    speed:
                        112,

                    vision:
                        360,

                    attackRange:
                        75,

                    radius:
                        27,

                    color:
                        "#9b70bd",

                    drop:
                        "rubi",

                    dropAmount:
                        1,

                    dropChance:
                        0.46,

                    special:
                        "telegraphedCharge"

                });

            }

            else {

                addEnemy({

                    id:
                        `fairy_guard_${i}`,

                    x:
                        seededInt(
                            rng,
                            470,
                            2800
                        ),

                    y:
                        seededInt(
                            rng,
                            270,
                            1990
                        ),

                    name:
                        "GUARDA FEÉRICO",

                    icon:
                        "🛡️",

                    type:
                        "normal",

                    hp:
                        520,

                    damage:
                        48,

                    speed:
                        79,

                    vision:
                        350,

                    attackRange:
                        95,

                    radius:
                        28,

                    color:
                        "#87659d",

                    drop:
                        "diamante",

                    dropAmount:
                        1,

                    dropChance:
                        0.4,

                    special:
                        "magicShield"

                });

            }

        }


        addEnemy({

            id:
                "thread_guardian",

            x:
                2930,

            y:
                1130,

            name:
                "GUARDIÃ DOS FIOS",

            icon:
                "🧚",

            type:
                "progression",

            hp:
                1480,

            damage:
                57,

            speed:
                92,

            vision:
                500,

            attackRange:
                165,

            radius:
                40,

            color:
                "#d38ec9",

            drop:
                "fragmentoMemoria",

            dropAmount:
                5,

            unlock:
                "sky",

            special:
                "threadGuardian",

            bossDash:
                true

        });


        addPortal(
            3180,
            1010,

            70,
            230,

            "sky",

            () =>
                hasDefeatedBoss(
                    "thread_guardian"
                ),

            "CAMINHO PARA O CÉU",

            {
                arrivalSide:
                    "left",

                specialEntrance:
                    true
            }
        );

    }


    /* =========================================================
       CÉU
       ========================================================= */

    function buildSky() {

        const rng =
            areaRng(
                "sky",
                "objects"
            );


        addPath(
            [
                {
                    x: 120,
                    y: 1150
                },

                {
                    x: 620,
                    y: 1080
                },

                {
                    x: 1100,
                    y: 1200
                },

                {
                    x: 1620,
                    y: 1090
                },

                {
                    x: 2170,
                    y: 1200
                },

                {
                    x: 2710,
                    y: 1080
                },

                {
                    x: 3360,
                    y: 1140
                }
            ],

            105,

            "skyBridge"
        );


        for (
            let i = 0;
            i < 32;
            i++
        ) {

            addDecoration(
                i % 5 === 0
                    ? "cloudPillar"
                    : i % 4 === 0
                      ? "goldenStatue"
                      : i % 3 === 0
                        ? "cloud"
                        : "skyFlower",

                seededInt(
                    rng,
                    170,
                    3300
                ),

                seededInt(
                    rng,
                    160,
                    2130
                )
            );

        }


        for (
            let i = 0;
            i < 16;
            i++
        ) {

            addObstacle(
                seededInt(
                    rng,
                    250,
                    3200
                ),

                seededInt(
                    rng,
                    230,
                    2010
                ),

                seededInt(
                    rng,
                    55,
                    110
                ),

                seededInt(
                    rng,
                    40,
                    82
                ),

                "skyStone"
            );

        }


        addNPC(
            760,
            880,

            "SERAPH",

            "Guardião Celestial",

            "#f1dfb1",

            [
                "Você chegou ao Céu, mas isto não é o fim.",
                "Quem sobe esperando uma batalha final encontra apenas preparação.",
                "Antes do Guardião do Caminho, cinco ondas precisarão ser vencidas.",
                "Depois disso, talvez o mundo se lembre de uma passagem que deveria ter permanecido esquecida."
            ]
        );


        addTrial(
            1750,
            1110,

            "sky_trial",

            "ALTAR DAS CINCO HORDAS",

            {
                skyTrial:
                    true,

                radius:
                    70
            }
        );


        addDecoration(
            "skyAltar",

            1750,
            1110
        );


        if (
            state.player
                ?.skyTrial
                ?.complete &&
            !hasDefeatedBoss(
                "path_guardian"
            )
        ) {

            spawnPathGuardian();

        }


        if (
            hasDefeatedBoss(
                "path_guardian"
            ) &&
            !hasItem(
                "flautaMemoria"
            )
        ) {

            createWorldDrop(
                3030,
                1120,

                "flautaMemoria",
                1,

                {
                    unique:
                        true,

                    persistent:
                        true,

                    life:
                        Infinity
                }
            );

        }


        addSecret(
            2860,
            390,

            "Banco Acima das Nuvens",

            "Alguém gravou no banco: 'Se eu esquecer a terra, pelo menos ainda poderei olhar para baixo.'",

            "☁️"
        );

    }


    function spawnPathGuardian() {

        if (
            hasDefeatedBoss(
                "path_guardian"
            )
        ) {

            return null;

        }


        const existing =
            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "path_guardian"
                );


        if (
            existing
        ) {

            return existing;

        }


        return addEnemy({

            id:
                "path_guardian",

            x:
                3040,

            y:
                1120,

            name:
                "GUARDIÃO DO CAMINHO",

            icon:
                "🪽",

            type:
                "progression",

            hp:
                1850,

            damage:
                61,

            speed:
                86,

            vision:
                540,

            attackRange:
                120,

            radius:
                44,

            color:
                "#d7c993",

            drop:
                "flautaMemoria",

            dropAmount:
                1,

            special:
                "pathGuardian",

            bossDash:
                true

        });

    }


    /* =========================================================
       INFERNO
       ========================================================= */

    function buildHell() {

        const rng =
            areaRng(
                "hell",
                "objects"
            );


        addPath(
            [
                {
                    x: 140,
                    y: 1250
                },

                {
                    x: 650,
                    y: 1120
                },

                {
                    x: 1160,
                    y: 1340
                },

                {
                    x: 1710,
                    y: 1100
                },

                {
                    x: 2290,
                    y: 1330
                },

                {
                    x: 2880,
                    y: 1110
                },

                {
                    x: 3530,
                    y: 1240
                }
            ],

            110,

            "hellRoad"
        );


        for (
            let i = 0;
            i < 34;
            i++
        ) {

            const x =
                seededInt(
                    rng,
                    180,
                    3500
                );


            const y =
                seededInt(
                    rng,
                    170,
                    2270
                );


            addObstacle(
                x,
                y,

                seededInt(
                    rng,
                    52,
                    125
                ),

                seededInt(
                    rng,
                    40,
                    90
                ),

                i % 5 === 0
                    ? "lavaRock"
                    : "basalt"
            );

        }


        for (
            let i = 0;
            i < 42;
            i++
        ) {

            addDecoration(
                i % 7 === 0
                    ? "lavaPool"
                    : i % 5 === 0
                      ? "hellFire"
                      : i % 4 === 0
                        ? "bonePile"
                        : i % 3 === 0
                          ? "smokeVent"
                          : "ash",

                seededInt(
                    rng,
                    180,
                    3480
                ),

                seededInt(
                    rng,
                    180,
                    2290
                )
            );

        }


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            addHazard(
                seededInt(
                    rng,
                    500,
                    3270
                ),

                seededInt(
                    rng,
                    360,
                    2090
                ),

                seededInt(
                    rng,
                    55,
                    95
                ),

                random(
                    0.8,
                    1.4
                ),

                36,

                {
                    type:
                        "lavaBurst",

                    repeat:
                        true,

                    repeatDelay:
                        random(
                            4,
                            7
                        ),

                    color:
                        "rgba(255,85,20,.26)"
                }
            );

        }


        const hellTypes = [
            {
                key:
                    "imp",

                name:
                    "DEMÔNIO MENOR",

                icon:
                    "👹",

                hp:
                    520,

                damage:
                    47,

                speed:
                    100,

                range:
                    75,

                special:
                    "fireShot",

                color:
                    "#b44a35"
            },

            {
                key:
                    "hound",

                name:
                    "CÃO INFERNAL",

                icon:
                    "🐕",

                hp:
                    600,

                damage:
                    54,

                speed:
                    126,

                range:
                    72,

                special:
                    "telegraphedCharge",

                color:
                    "#92382f"
            },

            {
                key:
                    "mage",

                name:
                    "MAGO CONDENADO",

                icon:
                    "🧙",

                hp:
                    560,

                damage:
                    52,

                speed:
                    72,

                range:
                    210,

                special:
                    "hellProjectile",

                color:
                    "#7e3d4d"
            },

            {
                key:
                    "brute",

                name:
                    "COLOSSO INFERNAL",

                icon:
                    "👿",

                hp:
                    820,

                damage:
                    66,

                speed:
                    58,

                range:
                    94,

                special:
                    "hellSmash",

                color:
                    "#804332"
            },

            {
                key:
                    "wraith",

                name:
                    "ALMA QUEIMADA",

                icon:
                    "🔥",

                hp:
                    510,

                damage:
                    49,

                speed:
                    108,

                range:
                    160,

                special:
                    "flameRing",

                color:
                    "#d76d3c"
            }
        ];


        hellTypes.forEach(
            (
                type,
                typeIndex
            ) => {

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    addEnemy({

                        id:
                            `hell_${type.key}_${i}`,

                        hellType:
                            type.key,

                        x:
                            480 +
                            typeIndex *
                            570 +
                            seededInt(
                                rng,
                                -90,
                                90
                            ),

                        y:
                            470 +
                            i *
                            470 +
                            seededInt(
                                rng,
                                -90,
                                90
                            ),

                        name:
                            type.name,

                        icon:
                            type.icon,

                        type:
                            "normal",

                        hp:
                            type.hp,

                        damage:
                            type.damage,

                        speed:
                            type.speed,

                        vision:
                            390,

                        attackRange:
                            type.range,

                        radius:
                            type.key ===
                                "brute"

                                ? 31
                                : 25,

                        color:
                            type.color,

                        drop:
                            i % 2 ===
                                0

                                ? "rubi"
                                : "essencia",

                        dropAmount:
                            1,

                        dropChance:
                            0.58,

                        special:
                            type.special

                    });

                }

            }
        );


        addResource(
            750,
            2040,
            "rubi",

            {
                amount:
                    2
            }
        );


        addResource(
            1260,
            420,
            "diamante",

            {
                amount:
                    2
            }
        );


        addResource(
            2140,
            2060,
            "rubi",

            {
                amount:
                    3
            }
        );


        addResource(
            2910,
            410,
            "diamante",

            {
                amount:
                    2
            }
        );


        addSecret(
            3260,
            390,

            "Carta que Não Queima",

            "O papel está intacto dentro do fogo. Há apenas uma frase: 'Eu me lembro de você.'",

            "📜"
        );


        addEnemy({

            id:
                "hell_supreme_guardian",

            x:
                3260,

            y:
                1240,

            name:
                "GUARDIÃO SUPREMO DO INFERNO",

            icon:
                "👿",

            type:
                "progression",

            hp:
                2600,

            damage:
                75,

            speed:
                83,

            vision:
                580,

            attackRange:
                130,

            radius:
                48,

            color:
                "#a03b30",

            drop:
                "essencia",

            dropAmount:
                8,

            special:
                "hellGuardian",

            bossDash:
                true

        });


        addPortal(
            3500,
            1110,

            85,
            260,

            "final",

            () => {

                const defeatedTypes =
                    Object.values(
                        state.player
                            ?.hellTypesDefeated ||
                        {}
                    )
                        .filter(
                            Boolean
                        )
                        .length;


                return (
                    defeatedTypes >=
                        5 &&
                    hasDefeatedBoss(
                        "hell_supreme_guardian"
                    )
                );

            },

            "CÂMARA FINAL",

            {
                arrivalSide:
                    "left",

                specialEntrance:
                    true,

                finalGate:
                    true
            }
        );

    }


    /* =========================================================
       CÂMARA FINAL
       ========================================================= */

    function buildFinal() {

        addPath(
            [
                {
                    x: 120,
                    y: 800
                },

                {
                    x: 550,
                    y: 800
                },

                {
                    x: 1050,
                    y: 800
                },

                {
                    x: 1600,
                    y: 800
                },

                {
                    x: 2180,
                    y: 800
                }
            ],

            140,

            "finalRoad"
        );


        addDecoration(
            "finalSymbol",
            1660,
            800,

            {
                large:
                    true
            }
        );


        [
            [420, 330],
            [420, 1220],
            [1880, 320],
            [1880, 1230],
            [1100, 260],
            [1100, 1340]
        ]
            .forEach(
                (
                    [
                        x,
                        y
                    ]
                ) => {

                    addDecoration(
                        "memoryPillar",
                        x,
                        y
                    );

                }
            );


        if (
            !state.player
                ?.finalDefeated &&
            state.player
                ?.finalChoice !==
                "join"
        ) {

            addEnemy({

                id:
                    "other_self",

                x:
                    1730,

                y:
                    800,

                name:
                    "O OUTRO EU",

                icon:
                    state.player
                        ?.icon ||
                    "☯",

                type:
                    "final",

                hp:
                    3600,

                damage:
                    78,

                speed:
                    95,

                vision:
                    760,

                attackRange:
                    135,

                radius:
                    44,

                color:
                    "#b7aaa0",

                drop:
                    "essencia",

                dropAmount:
                    10,

                special:
                    "otherSelf",

                bossDash:
                    true,

                aggressive:
                    false,

                accepted:
                    false,

                finalBoss:
                    true

            });

        }

    }


    /* =========================================================
       COLISÕES
       ========================================================= */

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
            dy <
            radius *
            radius
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

        return (
            Math.hypot(
                ax -
                bx,

                ay -
                by
            ) <
            ar +
            br
        );

    }


    function pointInsideRect(
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


    function isAliveTreeObstacle(
        obstacle
    ) {

        if (
            !obstacle
                .treeId
        ) {

            return true;

        }


        const tree =
            state.world
                .trees
                .find(
                    item =>
                        item.id ===
                        obstacle.treeId
                );


        return Boolean(
            tree
                ?.alive
        );

    }


    function isInsideHouseRoom(
        x,
        y,
        radius
    ) {

        const room =
            getHouseRoom();


        return (

            x -
            radius >=
                room.x &&

            y -
            radius >=
                room.y &&

            x +
            radius <=
                room.x +
                room.w &&

            y +
            radius <=
                room.y +
                room.h

        );

    }


    function collidesWithHouseFurniture(
        x,
        y,
        radius
    ) {

        for (
            const furniture of
            getHouseFurniture()
        ) {

            if (
                !furniture
                    .solid
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


        return false;

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

            if (
                !isInsideHouseRoom(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }


            if (
                collidesWithHouseFurniture(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }


            const interiorNPCs =
                getHouseInteriorNPCs();


            for (
                const npc of
                interiorNPCs
            ) {

                if (
                    circleCircleCollision(
                        x,
                        y,
                        radius,

                        npc.x,
                        npc.y,
                        npc.radius
                    )
                ) {

                    return false;

                }

            }


            return true;

        }


        if (
            x -
            radius <
                72 ||
            y -
            radius <
                72 ||
            x +
            radius >
                state.world.width -
                72 ||
            y +
            radius >
                state.world.height -
                72
        ) {

            return false;

        }


        for (
            const obstacle of
            state.world
                .obstacles
        ) {

            if (
                !isAliveTreeObstacle(
                    obstacle
                )
            ) {

                continue;

            }


            /*
                Permite ficar próximo da frente
                de uma casa, mas não atravessá-la.
            */

            if (
                circleRectCollision(
                    x,
                    y,
                    radius,
                    obstacle
                )
            ) {

                return false;

            }

        }


        for (
            const npc of
            state.world
                .npcs
        ) {

            if (
                circleCircleCollision(
                    x,
                    y,
                    radius,

                    npc.x,
                    npc.y,
                    npc.radius
                )
            ) {

                return false;

            }

        }


        return true;

    }


    function canEnemyMoveTo(
        x,
        y,
        radius
    ) {

        if (
            x -
            radius <
                74 ||
            y -
            radius <
                74 ||
            x +
            radius >
                state.world.width -
                74 ||
            y +
            radius >
                state.world.height -
                74
        ) {

            return false;

        }


        for (
            const obstacle of
            state.world
                .obstacles
        ) {

            if (
                !isAliveTreeObstacle(
                    obstacle
                )
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

                return false;

            }

        }


        return true;

    }


    function moveEntityWithCollision(
        entity,
        dx,
        dy,
        dt,
        speed,
        playerEntity =
            false
    ) {

        const len =
            Math.hypot(
                dx,
                dy
            );


        if (
            len <=
            0.0001
        ) {

            return false;

        }


        const nx =
            dx /
            len;


        const ny =
            dy /
            len;


        const step =
            Math.max(
                0,
                speed *
                dt
            );


        const collisionFn =
            playerEntity
                ? canPlayerMoveTo
                : canEnemyMoveTo;


        let moved =
            false;


        const nextX =
            entity.x +
            nx *
            step;


        if (
            collisionFn(
                nextX,
                entity.y,
                entity.radius
            )
        ) {

            entity.x =
                nextX;

            moved =
                true;

        }


        const nextY =
            entity.y +
            ny *
            step;


        if (
            collisionFn(
                entity.x,
                nextY,
                entity.radius
            )
        ) {

            entity.y =
                nextY;

            moved =
                true;

        }


        return moved;

    }


    /* =========================================================
       MOVIMENTAÇÃO
       ========================================================= */

    function getPlayerMovementSpeed() {

        const player =
            state.player;


        if (
            !player
        ) {

            return 0;

        }


        let speed =
            state.houseMode
                ? Math.min(
                    150,
                    player.speed
                )
                : player.speed;


        if (
            player.hunger <=
            player.maxHunger *
            0.05
        ) {

            speed *=
                0.72;

        }


        if (
            player.fatigue <=
            player.maxFatigue *
            0.05
        ) {

            speed *=
                0.72;

        }


        if (
            player.activePotionBuffs
                .some(
                    buff =>
                        buff.type ===
                        "speed"
                )
        ) {

            speed *=
                1.25;

        }


        if (
            player.adaptiveBuff
        ) {

            speed *=
                1.15;

        }


        return speed;

    }


    function updateMovement(
        dt
    ) {

        if (
            !state.player ||
            state.player.dead ||
            state.paused ||
            state.player
                .stunTimer >
                0 ||
            state.player
                .playerDash
        ) {

            return;

        }


        let dx =
            0;


        let dy =
            0;


        if (
            state.keys
                .has(
                    "w"
                ) ||
            state.keys
                .has(
                    "arrowup"
                )
        ) {

            dy -=
                1;

        }


        if (
            state.keys
                .has(
                    "s"
                ) ||
            state.keys
                .has(
                    "arrowdown"
                )
        ) {

            dy +=
                1;

        }


        if (
            state.keys
                .has(
                    "a"
                ) ||
            state.keys
                .has(
                    "arrowleft"
                )
        ) {

            dx -=
                1;

        }


        if (
            state.keys
                .has(
                    "d"
                ) ||
            state.keys
                .has(
                    "arrowright"
                )
        ) {

            dx +=
                1;

        }


        if (
            !dx &&
            !dy
        ) {

            return;

        }


        moveEntityWithCollision(
            state.player,
            dx,
            dy,
            dt,
            getPlayerMovementSpeed(),
            true
        );

    }


    /* =========================================================
       DASH UNIVERSAL
       ========================================================= */

    function useDashAbility() {

        const player =
            state.player;


        if (
            !player ||
            state.paused ||
            state.houseMode ||
            !hasAbility(
                "dash"
            ) ||
            player.dead ||
            player.dashCooldown >
                0 ||
            player.energy <
                8 ||
            player.playerDash
        ) {

            return false;

        }


        const dx =
            state.pointer
                .worldX -
            player.x;


        const dy =
            state.pointer
                .worldY -
            player.y;


        const dir =
            normalizeVector(
                dx,
                dy
            );


        player.energy =
            Math.max(
                0,
                player.energy -
                8
            );


        player.dashCooldown =
            1.25;


        player.invincible =
            Math.max(
                player.invincible,
                0.28
            );


        player.playerDash = {

            startX:
                player.x,

            startY:
                player.y,

            directionX:
                dir.x,

            directionY:
                dir.y,

            distance:
                205,

            duration:
                0.20,

            elapsed:
                0,

            lastTravel:
                0

        };


        createEffect(
            "dashBurst",

            player.x,
            player.y,

            {
                color:
                    getCharacterPalette()
                        .glow,

                duration:
                    0.28,

                radius:
                    38
            }
        );


        return true;

    }


    function updatePlayerDash(
        dt
    ) {

        const player =
            state.player;


        const dash =
            player
                ?.playerDash;


        if (
            !dash
        ) {

            return;

        }


        dash.elapsed +=
            dt;


        const progress =
            clamp(
                dash.elapsed /
                dash.duration,
                0,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 -
                progress,
                2
            );


        const travel =
            dash.distance *
            eased;


        const delta =
            Math.max(
                0,
                travel -
                dash.lastTravel
            );


        dash.lastTravel =
            travel;


        const steps =
            Math.max(
                1,
                Math.ceil(
                    delta /
                    10
                )
            );


        const stepDistance =
            delta /
            steps;


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const nextX =
                player.x +
                dash.directionX *
                stepDistance;


            const nextY =
                player.y +
                dash.directionY *
                stepDistance;


            if (
                canPlayerMoveTo(
                    nextX,
                    nextY,
                    player.radius
                )
            ) {

                player.x =
                    nextX;


                player.y =
                    nextY;

            }

            else {

                player.playerDash =
                    null;

                createEffect(
                    "dashImpact",

                    player.x,
                    player.y,

                    {
                        color:
                            "#d7d7d7",

                        duration:
                            0.18,

                        radius:
                            22
                    }
                );

                return;

            }

        }


        createParticle(
            player.x,
            player.y,

            getCharacterPalette()
                .main,

            0,
            0,

            0.18,

            8
        );


        if (
            progress >=
            1
        ) {

            player.playerDash =
                null;

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
            state.paused ||
            state.houseMode ||
            player.dead
        ) {

            return;

        }


        player.hunger =
            clamp(
                player.hunger -
                0.20 *
                dt,

                0,
                player.maxHunger
            );


        player.fatigue =
            clamp(
                player.fatigue -
                0.15 *
                dt,

                0,
                player.maxFatigue
            );


        if (
            player.hunger <=
                0 ||
            player.fatigue <=
                0
        ) {

            player.survivalDamageTimer =
                (
                    player.survivalDamageTimer ||
                    0
                ) -
                dt;


            if (
                player.survivalDamageTimer <=
                0
            ) {

                player.survivalDamageTimer =
                    3.5;


                damagePlayer(
                    2,

                    {
                        survival:
                            true,

                        ignoreArmor:
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


    function sleepInBed() {

        const player =
            state.player;


        if (
            !player ||
            !state.houseMode ||
            state.currentHouse
                ?.id !==
                "home"
        ) {

            return;

        }


        startTransition({

            label:
                "DESCANSANDO...",

            fadeOut:
                0.35,

            hold:
                0.7,

            fadeIn:
                0.5,

            swap:
                () => {

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
                            0.78
                        );


                    player.fatigue =
                        player.maxFatigue;

                },

            done:
                () => {

                    showToast(
                        "Você descansou e recuperou suas forças."
                    );

                }

        });

    }


    /* =========================================================
       INVENTÁRIO — PESO
       ========================================================= */

    function calculateInventoryWeight() {

        const inventory =
            state.player
                ?.inventory;


        if (
            !inventory
        ) {

            return 0;

        }


        let total =
            0;


        Object.entries(
            inventory
        )
            .forEach(
                (
                    [
                        id,
                        amount
                    ]
                ) => {

                    if (
                        amount <=
                        0
                    ) {

                        return;

                    }


                    const item =
                        ITEMS[
                            id
                        ];


                    if (
                        !item
                    ) {

                        return;

                    }


                    total +=
                        (
                            item.weight ||
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

        const item =
            ITEMS[
                id
            ];


        if (
            !item ||
            !state.player
        ) {

            return false;

        }


        if (
            item.unique &&
            hasItem(
                id
            )
        ) {

            return false;

        }


        const newWeight =
            calculateInventoryWeight() +
            (
                item.weight ||
                0
            ) *
            amount;


        return (
            newWeight <=
            state.player
                .inventoryWeightLimit
        );

    }


    function addItem(
        id,
        amount =
            1,
        options = {}
    ) {

        const player =
            state.player;


        const item =
            ITEMS[
                id
            ];


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
            hasItem(
                id
            )
        ) {

            if (
                !options.silent
            ) {

                showToast(
                    `${item.name} já pertence a você.`
                );

            }


            return false;

        }


        if (
            !options.ignoreWeight &&
            !canAddItem(
                id,
                amount
            )
        ) {

            if (
                !options.silent
            ) {

                showToast(
                    "Seu inventário está pesado demais."
                );

            }


            return false;

        }


        if (
            typeof player
                .inventory[
                    id
                ] !==
            "number"
        ) {

            player.inventory[
                id
            ] =
                0;

        }


        player.inventory[
            id
        ] +=
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
            (
                player.inventory[
                    id
                ] ||
                0
            ) <
            amount
        ) {

            return false;

        }


        player.inventory[
            id
        ] -=
            amount;


        player.inventory[
            id
        ] =
            Math.max(
                0,
                player.inventory[
                    id
                ]
            );


        return true;

    }


    /* =========================================================
       EQUIPAMENTO
       ========================================================= */

    function getArmorDefense() {

        const armorId =
            state.player
                ?.equipment
                ?.armor;


        return (
            ITEMS[
                armorId
            ]
                ?.defense ||
            0
        );

    }


    function getWeaponDamage() {

        const weaponId =
            state.player
                ?.equipment
                ?.weapon;


        return (
            ITEMS[
                weaponId
            ]
                ?.damage ||
            0
        );

    }


    function equipItem(
        id
    ) {

        const player =
            state.player;


        const item =
            ITEMS[
                id
            ];


        if (
            !player ||
            !item ||
            !hasItem(
                id
            )
        ) {

            return false;

        }


        if (
            item.category ===
            "weapons"
        ) {

            player.equipment
                .weapon =
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

            player.equipment
                .armor =
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

            player.equipment
                .tool =
                id;


            showToast(
                `${item.name} equipada.`
            );


            return true;

        }


        return false;

    }


    function unequipSlot(
        slot
    ) {

        const player =
            state.player;


        if (
            !player ||
            ![
                "weapon",
                "armor",
                "tool"
            ].includes(
                slot
            )
        ) {

            return;

        }


        if (
            slot ===
            "tool"
        ) {

            player.equipment
                .tool =
                hasItem(
                    "machado"
                )
                    ? "machado"
                    : null;

        }

        else {

            player.equipment[
                slot
            ] =
                null;

        }

    }


    /* =========================================================
       POÇÕES / COMIDA
       ========================================================= */

    function activeBuffCount() {

        return (
            state.player
                ?.activePotionBuffs
                ?.length ||
            0
        );

    }


    function hasActivePotionBuff(
        type
    ) {

        return Boolean(
            state.player
                ?.activePotionBuffs
                ?.some(
                    buff =>
                        buff.type ===
                        type
                )
        );

    }


    function useItem(
        id
    ) {

        const player =
            state.player;


        const item =
            ITEMS[
                id
            ];


        if (
            !player ||
            !item ||
            !hasItem(
                id
            )
        ) {

            return false;

        }


        if (
            [
                "weapons",
                "armor",
                "tools"
            ].includes(
                item.category
            )
        ) {

            return equipItem(
                id
            );

        }


        if (
            item.category ===
            "food"
        ) {

            if (
                !removeItem(
                    id,
                    1
                )
            ) {

                return false;

            }


            if (
                item.hunger
            ) {

                player.hunger =
                    clamp(
                        player.hunger +
                        item.hunger,

                        0,
                        player.maxHunger
                    );

            }


            if (
                item.heal
            ) {

                player.hp =
                    clamp(
                        player.hp +
                        item.heal,

                        0,
                        player.maxHp
                    );

            }


            showToast(
                `${item.name} consumido.`
            );


            createEffect(
                "heal",

                player.x,
                player.y,

                {
                    color:
                        "#8fd58f",

                    radius:
                        45,

                    duration:
                        0.5
                }
            );


            return true;

        }


        if (
            item.category !==
            "potions"
        ) {

            return false;

        }


        const currentCooldown =
            player.itemCooldowns[
                id
            ] ||
            0;


        if (
            currentCooldown >
            0
        ) {

            showToast(
                `Espere ${currentCooldown.toFixed(1)}s para usar novamente.`
            );


            return false;

        }


        if (
            item.buff
        ) {

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
                activeBuffCount() >=
                2
            ) {

                showToast(
                    "Você já possui dois efeitos de poção ativos."
                );


                return false;

            }

        }


        if (
            !removeItem(
                id,
                1
            )
        ) {

            return false;

        }


        player.itemCooldowns[
            id
        ] =
            item.cooldown ||
            2;


        if (
            item.heal
        ) {

            player.hp =
                clamp(
                    player.hp +
                    item.heal,

                    0,
                    player.maxHp
                );

        }


        if (
            item.energy
        ) {

            player.energy =
                clamp(
                    player.energy +
                    item.energy,

                    0,
                    player.maxEnergy
                );

        }


        if (
            item.buff
        ) {

            player.activePotionBuffs
                .push({

                    type:
                        item.buff,

                    timer:
                        item.duration ||
                        15,

                    maxTimer:
                        item.duration ||
                        15,

                    source:
                        id

                });

        }


        createEffect(
            "potion",

            player.x,
            player.y,

            {
                color:
                    item.buff ===
                        "strength"

                        ? "#e16464"

                        : item.buff ===
                          "magic"

                          ? "#b279e8"

                          : item.buff ===
                            "resistance"

                            ? "#d0a173"

                            : "#77bde3",

                duration:
                    0.6,

                radius:
                    50
            }
        );


        showToast(
            `${item.name} usada.`
        );


        return true;

    }


    function updatePotionBuffs(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        Object.keys(
            player.itemCooldowns
        )
            .forEach(
                id => {

                    player.itemCooldowns[
                        id
                    ] =
                        Math.max(
                            0,
                            player.itemCooldowns[
                                id
                            ] -
                            dt
                        );

                }
            );


        player.activePotionBuffs =
            player.activePotionBuffs
                .filter(
                    buff => {

                        buff.timer -=
                            dt;


                        return (
                            buff.timer >
                            0
                        );

                    }
                );

    }


    /* =========================================================
       PARTICULAS / EFEITOS
       ========================================================= */

    function createParticle(
        x,
        y,
        color,
        vx =
            random(
                -35,
                35
            ),
        vy =
            random(
                -35,
                35
            ),
        life =
            random(
                0.25,
                0.65
            ),
        size =
            random(
                2,
                6
            )
    ) {

        state.world
            .particles
            .push({

                id:
                    uid(
                        "particle"
                    ),

                x,
                y,

                vx,
                vy,

                life,

                maxLife:
                    life,

                color,

                size

            });

    }


    function burstParticles(
        x,
        y,
        color,
        amount =
            12,
        speed =
            70
    ) {

        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;


            const velocity =
                random(
                    speed *
                    0.4,
                    speed
                );


            createParticle(
                x,
                y,
                color,

                Math.cos(
                    angle
                ) *
                velocity,

                Math.sin(
                    angle
                ) *
                velocity,

                random(
                    0.25,
                    0.7
                ),

                random(
                    2,
                    7
                )
            );

        }

    }


    function createEffect(
        type,
        x,
        y,
        options = {}
    ) {

        const duration =
            options.duration ||
            0.45;


        state.world
            .effects
            .push({

                id:
                    uid(
                        "effect"
                    ),

                type,

                x,
                y,

                life:
                    duration,

                maxLife:
                    duration,

                radius:
                    options.radius ||
                    40,

                color:
                    options.color ||
                    "#ffffff",

                angle:
                    options.angle ||
                    0,

                targetX:
                    options.targetX,

                targetY:
                    options.targetY,

                text:
                    options.text,

                amount:
                    options.amount,

                ...options

            });

    }


    function createDamageNumber(
        x,
        y,
        amount,
        options = {}
    ) {

        let color =
            "#ffffff";


        if (
            amount >=
            100
        ) {

            color =
                "#c97cff";

        }

        else if (
            amount >=
            70
        ) {

            color =
                "#ff6c55";

        }

        else if (
            amount >=
            45
        ) {

            color =
                "#ff9a47";

        }

        else if (
            amount >=
            25
        ) {

            color =
                "#f5d65e";

        }


        createEffect(
            "damageNumber",

            x,
            y,

            {
                text:
                    `-${Math.round(amount)}`,

                amount,

                color,

                duration:
                    0.9,

                playerDamage:
                    Boolean(
                        options.playerDamage
                    )
            }
        );

    }


    function updateVisualEffects(
        dt
    ) {

        state.world
            .particles
            .forEach(
                particle => {

                    particle.life -=
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


                    particle.vy *=
                        Math.pow(
                            0.08,
                            dt
                        );

                }
            );


        state.world.particles =
            state.world
                .particles
                .filter(
                    particle =>
                        particle.life >
                        0
                );


        state.world
            .effects
            .forEach(
                effect => {

                    effect.life -=
                        dt;

                }
            );


        state.world.effects =
            state.world
                .effects
                .filter(
                    effect =>
                        effect.life >
                        0
                );


        if (
            state.screenShake >
            0
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

    }


    /* =========================================================
       TELA VERMELHA AO LEVAR DANO
       ========================================================= */

    function triggerDamageScreenEffect(
        damage
    ) {

        state.damageFlash =
            clamp(
                state.damageFlash +
                0.18 +
                Math.min(
                    0.40,
                    damage /
                    140
                ),

                0,
                1
            );


        const amount =
            clamp(
                Math.ceil(
                    damage /
                    22
                ),
                2,
                4
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const edge =
                randomInt(
                    0,
                    3
                );


            let x;
            let y;


            if (
                edge ===
                0
            ) {

                x =
                    random(
                        0.03,
                        0.97
                    );

                y =
                    random(
                        0.01,
                        0.16
                    );

            }

            else if (
                edge ===
                1
            ) {

                x =
                    random(
                        0.84,
                        0.99
                    );

                y =
                    random(
                        0.05,
                        0.95
                    );

            }

            else if (
                edge ===
                2
            ) {

                x =
                    random(
                        0.03,
                        0.97
                    );

                y =
                    random(
                        0.84,
                        0.99
                    );

            }

            else {

                x =
                    random(
                        0.01,
                        0.16
                    );

                y =
                    random(
                        0.05,
                        0.95
                    );

            }


            const life =
                random(
                    2.4,
                    4.8
                );


            state.bloodMarks
                .push({

                    x,
                    y,

                    radius:
                        random(
                            10,
                            31
                        ),

                    stretch:
                        random(
                            0.45,
                            1.2
                        ),

                    rotation:
                        random(
                            0,
                            Math.PI *
                            2
                        ),

                    alpha:
                        random(
                            0.16,
                            0.36
                        ),

                    life,

                    maxLife:
                        life

                });

        }


        if (
            state.bloodMarks
                .length >
            18
        ) {

            state.bloodMarks =
                state.bloodMarks
                    .slice(
                        -18
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
                1.8
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


    /* =========================================================
       DANO DO JOGADOR
       ========================================================= */

    function getPlayerDefense() {

        const player =
            state.player;


        if (
            !player
        ) {

            return 0;

        }


        let defense =
            player.baseDefense +
            getArmorDefense();


        if (
            player.adaptiveBuff
        ) {

            defense +=
                8;

        }


        return defense;

    }


    function getPlayerDamageMultiplier() {

        const player =
            state.player;


        if (
            !player
        ) {

            return 1;

        }


        let multiplier =
            1;


        if (
            hasActivePotionBuff(
                "strength"
            )
        ) {

            multiplier *=
                1.20;

        }


        if (
            player.adaptiveBuff
        ) {

            multiplier *=
                1.12;

        }


        return multiplier;

    }


    function getMagicEfficiency() {

        return hasActivePotionBuff(
            "magic"
        )
            ? 0.75
            : 1;

    }


    function damagePlayer(
        amount,
        options = {}
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


        let finalDamage =
            Math.max(
                0,
                amount
            );


        if (
            !options.ignoreArmor
        ) {

            const defense =
                getPlayerDefense();


            finalDamage *=
                100 /
                (
                    100 +
                    defense *
                    2.2
                );

        }


        if (
            hasActivePotionBuff(
                "resistance"
            )
        ) {

            finalDamage *=
                0.75;

        }


        if (
            player.shieldTimer >
            0
        ) {

            finalDamage *=
                0.62;

        }


        if (
            player.damageReduction >
            0
        ) {

            finalDamage *=
                1 -
                clamp(
                    player.damageReduction,
                    0,
                    0.75
                );

        }


        finalDamage =
            Math.max(
                options.survival
                    ? 1
                    : 2,

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


        player.invincible =
            options.survival
                ? 0.12
                : 0.48;


        triggerDamageScreenEffect(
            finalDamage
        );


        createDamageNumber(
            player.x,
            player.y -
                28,

            finalDamage,

            {
                playerDamage:
                    true
            }
        );


        burstParticles(
            player.x,
            player.y,

            "#d65c5c",

            8,

            55
        );


        createEffect(
            "playerHit",

            player.x,
            player.y,

            {
                color:
                    "#e26b6b",

                radius:
                    42,

                duration:
                    0.28
            }
        );


        shakeScreen(
            Math.min(
                14,
                5 +
                finalDamage *
                0.08
            ),

            0.16
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
       ATAQUE BÁSICO
       ========================================================= */

    function findEnemyNearPoint(
        x,
        y,
        radius =
            110
    ) {

        let best =
            null;


        let bestDistance =
            radius;


        for (
            const enemy of
            state.world
                .enemies
        ) {

            if (
                enemy.dead ||
                enemy.hp <=
                0
            ) {

                continue;

            }


            if (
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                continue;

            }


            if (
                enemy.finalBoss &&
                !enemy.accepted
            ) {

                continue;

            }


            const d =
                Math.hypot(
                    enemy.x -
                    x,

                    enemy.y -
                    y
                );


            if (
                d <
                bestDistance +
                enemy.radius
            ) {

                best =
                    enemy;


                bestDistance =
                    d;

            }

        }


        return best;

    }


    function getAttackTarget() {

        const player =
            state.player;


        if (
            !player
        ) {

            return null;

        }


        let target =
            findEnemyNearPoint(
                state.pointer
                    .worldX,
                state.pointer
                    .worldY,
                90
            );


        if (
            target
        ) {

            return target;

        }


        const direction =
            normalizeVector(
                state.pointer
                    .worldX -
                player.x,

                state.pointer
                    .worldY -
                player.y
            );


        let best =
            null;


        let bestScore =
            Infinity;


        for (
            const enemy of
            state.world
                .enemies
        ) {

            if (
                enemy.dead ||
                enemy.hp <=
                    0
            ) {

                continue;

            }


            if (
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                continue;

            }


            if (
                enemy.finalBoss &&
                !enemy.accepted
            ) {

                continue;

            }


            const dx =
                enemy.x -
                player.x;


            const dy =
                enemy.y -
                player.y;


            const dist =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                dist >
                245
            ) {

                continue;

            }


            const dir =
                normalizeVector(
                    dx,
                    dy
                );


            const dot =
                dir.x *
                direction.x +
                dir.y *
                direction.y;


            if (
                dot <
                0.55
            ) {

                continue;

            }


            const score =
                dist -
                dot *
                70;


            if (
                score <
                bestScore
            ) {

                bestScore =
                    score;


                best =
                    enemy;

            }

        }


        return best;

    }


    function performAttack() {

        const player =
            state.player;


        if (
            !player ||
            state.paused ||
            player.dead ||
            state.houseMode ||
            player.stunTimer >
                0 ||
            player.attackCooldown >
                0 ||
            player.playerDash
        ) {

            return false;

        }


        /*
            IMPORTANTE:
            esta função faz UM ataque.

            Na Parte 3 ela será chamada
            uma única vez no pointerdown.

            Não será chamada continuamente
            enquanto o mouse estiver segurado.
        */

        player.attackCooldown =
            0.24;


        const palette =
            getCharacterPalette();


        const angle =
            Math.atan2(
                state.pointer
                    .worldY -
                    player.y,

                state.pointer
                    .worldX -
                    player.x
            );


        createEffect(
            "basicAttack",

            player.x,
            player.y,

            {
                angle,

                color:
                    palette.main,

                radius:
                    62,

                duration:
                    0.22
            }
        );


        const target =
            getAttackTarget();


        if (
            !target
        ) {

            return true;

        }


        const range =
            state.player
                .characterId ===
                "kaelion" ||
            state.player
                .characterId ===
                "lirael"

                ? 230
                : 110;


        const d =
            distance(
                player,
                target
            );


        if (
            d >
            range +
            target.radius
        ) {

            return true;

        }


        let damage =
            player.damage +
            getWeaponDamage();


        damage *=
            getPlayerDamageMultiplier();


        if (
            player.characterId ===
                "kaelion" ||
            player.characterId ===
                "lirael"
        ) {

            createEffect(
                "basicProjectile",

                player.x,
                player.y,

                {
                    targetX:
                        target.x,

                    targetY:
                        target.y,

                    color:
                        palette.glow,

                    radius:
                        11,

                    duration:
                        0.22
                }
            );

        }


        attackEnemy(
            target,
            damage,

            {
                basic:
                    true
            }
        );


        return true;

    }


    /* =========================================================
       DANO EM INIMIGO
       ========================================================= */

    function attackEnemy(
        enemy,
        damage,
        options = {}
    ) {

        if (
            !enemy ||
            enemy.dead ||
            enemy.hp <=
            0
        ) {

            return 0;

        }


        if (
            enemy.type ===
                "progression" &&
            !enemy.accepted
        ) {

            return 0;

        }


        if (
            enemy.finalBoss &&
            !enemy.accepted
        ) {

            return 0;

        }


        const finalDamage =
            Math.max(
                1,
                Math.round(
                    damage
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


        enemy.aggressive =
            true;


        createDamageNumber(
            enemy.x,
            enemy.y -
                enemy.radius -
                12,

            finalDamage
        );


        burstParticles(
            enemy.x,
            enemy.y,

            options.color ||
            "#f3e3bb",

            options.critical
                ? 16
                : 8,

            options.critical
                ? 95
                : 60
        );


        if (
            enemy.id ===
            "monarch"
        ) {

            enemy.hitCounter =
                (
                    enemy.hitCounter ||
                    0
                ) +
                1;


            if (
                enemy.hitCounter >=
                10
            ) {

                enemy.hitCounter =
                    0;


                enemy.staggerTimer =
                    5;


                enemy.stunTimer =
                    Math.max(
                        enemy.stunTimer ||
                        0,

                        5
                    );


                enemy.summonTimer =
                    Math.max(
                        enemy.summonTimer ||
                        0,

                        5
                    );


                createEffect(
                    "monarchStagger",

                    enemy.x,
                    enemy.y,

                    {
                        duration:
                            5,

                        radius:
                            85,

                        color:
                            "#f4d875"
                    }
                );


                showToast(
                    "O MONARCA ficou desnorteado por 5 segundos!"
                );


                shakeScreen(
                    12,
                    0.30
                );

            }

        }


        state.bossBarTarget =
            isBossId(
                enemy.id
            ) ||
            enemy.type ===
                "resourceBoss"

                ? enemy
                : state.bossBarTarget;


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
       HABILIDADES
       ========================================================= */

    function canUseSkill(
        key
    ) {

        const player =
            state.player;


        if (
            !player ||
            state.paused ||
            player.dead ||
            state.houseMode ||
            player.playerDash
        ) {

            return false;

        }


        const skills =
            getCharacterSkills();


        const skill =
            skills[
                key
            ];


        if (
            !skill
        ) {

            return false;

        }


        if (
            player.level <
            skill.level
        ) {

            showToast(
                `${skill.name} desbloqueia no nível ${skill.level}.`
            );


            return false;

        }


        if (
            (
                player.skillCooldowns[
                    key
                ] ||
                0
            ) >
            0
        ) {

            return false;

        }


        const magicCost =
            Math.ceil(
                (
                    skill.costMagic ||
                    0
                ) *
                getMagicEfficiency()
            );


        if (
            player.magic <
            magicCost
        ) {

            showToast(
                "Magia insuficiente."
            );


            return false;

        }


        if (
            player.energy <
            (
                skill.costEnergy ||
                0
            )
        ) {

            showToast(
                "Energia insuficiente."
            );


            return false;

        }


        player.magic =
            Math.max(
                0,
                player.magic -
                magicCost
            );


        player.energy =
            Math.max(
                0,
                player.energy -
                (
                    skill.costEnergy ||
                    0
                )
            );


        player.skillCooldowns[
            key
        ] =
            skill.cooldown;


        return true;

    }


    function useSkill(
        key
    ) {

        if (
            !canUseSkill(
                key
            )
        ) {

            return false;

        }


        const id =
            state.player
                .characterId;


        if (
            id ===
            "kaelion"
        ) {

            useMageSkill(
                key
            );

        }

        else if (
            id ===
            "theron"
        ) {

            useKnightSkill(
                key
            );

        }

        else if (
            id ===
            "grumgar"
        ) {

            useTrollSkill(
                key
            );

        }

        else if (
            id ===
            "lirael"
        ) {

            useFairySkill(
                key
            );

        }

        else {

            useShapeshifterSkill(
                key
            );

        }


        return true;

    }


    function enemiesInsideRadius(
        x,
        y,
        radius
    ) {

        return state.world
            .enemies
            .filter(
                enemy => {

                    if (
                        enemy.dead ||
                        enemy.hp <=
                            0
                    ) {

                        return false;

                    }


                    if (
                        enemy.type ===
                            "progression" &&
                        !enemy.accepted
                    ) {

                        return false;

                    }


                    if (
                        enemy.finalBoss &&
                        !enemy.accepted
                    ) {

                        return false;

                    }


                    return (
                        Math.hypot(
                            enemy.x -
                                x,

                            enemy.y -
                                y
                        ) <=
                        radius +
                        enemy.radius
                    );

                }
            );

    }


    function nearestEnemyToPointer(
        maxDistance =
            500
    ) {

        let best =
            null;


        let bestDistance =
            maxDistance;


        for (
            const enemy of
            state.world
                .enemies
        ) {

            if (
                enemy.dead ||
                enemy.hp <=
                    0
            ) {

                continue;

            }


            if (
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                continue;

            }


            const d =
                Math.hypot(
                    enemy.x -
                    state.pointer
                        .worldX,

                    enemy.y -
                    state.pointer
                        .worldY
                );


            if (
                d <
                bestDistance
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
       MAGO
       ========================================================= */

    function useMageSkill(
        key
    ) {

        const player =
            state.player;


        const palette =
            getCharacterPalette(
                "kaelion"
            );


        if (
            key ===
            "q"
        ) {

            const target =
                nearestEnemyToPointer(
                    650
                );


            const targetX =
                target
                    ?.x ??
                state.pointer
                    .worldX;


            const targetY =
                target
                    ?.y ??
                state.pointer
                    .worldY;


            createEffect(
                "memoryOrb",

                player.x,
                player.y,

                {
                    targetX,
                    targetY,

                    duration:
                        0.42,

                    radius:
                        18,

                    color:
                        palette.main
                }
            );


            if (
                target
            ) {

                attackEnemy(
                    target,
                    42 +
                    player.damage *
                    0.85,

                    {
                        color:
                            palette.main
                    }
                );

            }


            burstParticles(
                player.x,
                player.y,

                palette.glow,

                18,

                80
            );

        }

        else if (
            key ===
            "r"
        ) {

            createEffect(
                "arcaneNova",

                player.x,
                player.y,

                {
                    radius:
                        175,

                    duration:
                        0.62,

                    color:
                        palette.secondary
                }
            );


            enemiesInsideRadius(
                player.x,
                player.y,
                175
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            58 +
                            player.damage *
                            0.75,

                            {
                                color:
                                    palette.secondary
                            }
                        );

                    }
                );


            burstParticles(
                player.x,
                player.y,

                palette.secondary,

                30,

                115
            );

            shakeScreen(
                8,
                0.2
            );

        }

        else {

            const centerX =
                state.pointer
                    .worldX;


            const centerY =
                state.pointer
                    .worldY;


            createEffect(
                "memoryStorm",

                centerX,
                centerY,

                {
                    radius:
                        230,

                    duration:
                        1.25,

                    color:
                        palette.glow
                }
            );


            enemiesInsideRadius(
                centerX,
                centerY,
                230
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            105 +
                            player.damage *
                            1.15,

                            {
                                color:
                                    palette.glow,

                                critical:
                                    true
                            }
                        );

                    }
                );


            for (
                let i = 0;
                i < 38;
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
                        210
                    );


                createParticle(
                    centerX +
                        Math.cos(
                            angle
                        ) *
                        radius,

                    centerY +
                        Math.sin(
                            angle
                        ) *
                        radius,

                    i % 2
                        ? palette.main
                        : palette.secondary,

                    random(
                        -40,
                        40
                    ),

                    random(
                        -80,
                        15
                    ),

                    random(
                        0.6,
                        1.3
                    ),

                    random(
                        3,
                        9
                    )
                );

            }

        }

    }


    /* =========================================================
       CAVALEIRO
       ========================================================= */

    function useKnightSkill(
        key
    ) {

        const player =
            state.player;


        const palette =
            getCharacterPalette(
                "theron"
            );


        if (
            key ===
            "q"
        ) {

            createEffect(
                "heavySlash",

                player.x,
                player.y,

                {
                    angle:
                        Math.atan2(
                            state.pointer
                                .worldY -
                                player.y,

                            state.pointer
                                .worldX -
                                player.x
                        ),

                    radius:
                        120,

                    duration:
                        0.34,

                    color:
                        palette.glow
                }
            );


            const targets =
                enemiesInsideRadius(
                    player.x,
                    player.y,
                    120
                );


            targets.forEach(
                enemy => {

                    attackEnemy(
                        enemy,
                        52 +
                        player.damage *
                        1.1,

                        {
                            color:
                                palette.main
                        }
                    );

                }
            );


            shakeScreen(
                7,
                0.15
            );

        }

        else if (
            key ===
            "r"
        ) {

            player.shieldTimer =
                5;


            createEffect(
                "guardianShield",

                player.x,
                player.y,

                {
                    duration:
                        5,

                    radius:
                        54,

                    color:
                        palette.secondary
                }
            );


            showToast(
                "Postura do Guardião ativa por 5 segundos."
            );

        }

        else {

            createEffect(
                "steelOath",

                player.x,
                player.y,

                {
                    duration:
                        5,

                    radius:
                        100,

                    color:
                        palette.glow
                }
            );


            player.shieldTimer =
                Math.max(
                    player.shieldTimer,
                    5
                );


            enemiesInsideRadius(
                player.x,
                player.y,
                165
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            105 +
                            player.damage *
                            1.25,

                            {
                                critical:
                                    true,

                                color:
                                    palette.glow
                            }
                        );

                    }
                );


            player.hp =
                Math.min(
                    player.maxHp,
                    player.hp +
                    Math.round(
                        player.maxHp *
                        0.15
                    )
                );


            shakeScreen(
                12,
                0.28
            );

        }

    }


    /* =========================================================
       TROLL
       ========================================================= */

    function useTrollSkill(
        key
    ) {

        const player =
            state.player;


        const palette =
            getCharacterPalette(
                "grumgar"
            );


        if (
            key ===
            "q"
        ) {

            createEffect(
                "smash",

                player.x,
                player.y,

                {
                    radius:
                        135,

                    duration:
                        0.42,

                    color:
                        palette.main
                }
            );


            enemiesInsideRadius(
                player.x,
                player.y,
                135
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            68 +
                            player.damage *
                            1.15,

                            {
                                color:
                                    palette.main
                            }
                        );


                        enemy.stunTimer =
                            Math.max(
                                enemy.stunTimer ||
                                    0,

                                0.8
                            );

                    }
                );


            shakeScreen(
                11,
                0.24
            );

        }

        else if (
            key ===
            "r"
        ) {

            createEffect(
                "roar",

                player.x,
                player.y,

                {
                    radius:
                        210,

                    duration:
                        0.7,

                    color:
                        palette.glow
                }
            );


            enemiesInsideRadius(
                player.x,
                player.y,
                210
            )
                .forEach(
                    enemy => {

                        enemy.stunTimer =
                            Math.max(
                                enemy.stunTimer ||
                                    0,

                                1.8
                            );


                        enemy.aggressive =
                            true;

                    }
                );


            player.damageReduction =
                0.15;


            player.roarBuffTimer =
                5;


            shakeScreen(
                8,
                0.22
            );

        }

        else {

            createEffect(
                "earthquake",

                player.x,
                player.y,

                {
                    radius:
                        250,

                    duration:
                        1,

                    color:
                        palette.secondary
                }
            );


            enemiesInsideRadius(
                player.x,
                player.y,
                250
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            130 +
                            player.damage *
                            1.35,

                            {
                                critical:
                                    true,

                                color:
                                    palette.secondary
                            }
                        );


                        enemy.stunTimer =
                            Math.max(
                                enemy.stunTimer ||
                                    0,

                                2.2
                            );

                    }
                );


            shakeScreen(
                18,
                0.45
            );

        }

    }


    /* =========================================================
       FADA
       ========================================================= */

    function useFairySkill(
        key
    ) {

        const player =
            state.player;


        const palette =
            getCharacterPalette(
                "lirael"
            );


        if (
            key ===
            "q"
        ) {

            const target =
                nearestEnemyToPointer(
                    700
                );


            createEffect(
                "fairyArrow",

                player.x,
                player.y,

                {
                    targetX:
                        target
                            ?.x ??
                        state.pointer
                            .worldX,

                    targetY:
                        target
                            ?.y ??
                        state.pointer
                            .worldY,

                    duration:
                        0.30,

                    radius:
                        12,

                    color:
                        palette.glow
                }
            );


            if (
                target
            ) {

                attackEnemy(
                    target,
                    38 +
                    player.damage *
                    0.9,

                    {
                        color:
                            palette.main
                    }
                );

            }

        }

        else if (
            key ===
            "r"
        ) {

            const heal =
                Math.round(
                    player.maxHp *
                    0.30
                );


            player.hp =
                Math.min(
                    player.maxHp,
                    player.hp +
                    heal
                );


            createEffect(
                "fairyHeal",

                player.x,
                player.y,

                {
                    duration:
                        0.9,

                    radius:
                        85,

                    color:
                        palette.main
                }
            );


            for (
                let i = 0;
                i < 26;
                i++
            ) {

                createParticle(
                    player.x +
                        random(
                            -60,
                            60
                        ),

                    player.y +
                        random(
                            -60,
                            60
                        ),

                    i % 2
                        ? palette.main
                        : palette.secondary,

                    random(
                        -20,
                        20
                    ),

                    random(
                        -80,
                        -20
                    ),

                    random(
                        0.6,
                        1.2
                    ),

                    random(
                        3,
                        7
                    )
                );

            }

        }

        else {

            const centerX =
                state.pointer
                    .worldX;


            const centerY =
                state.pointer
                    .worldY;


            createEffect(
                "starRain",

                centerX,
                centerY,

                {
                    radius:
                        240,

                    duration:
                        1.3,

                    color:
                        palette.glow
                }
            );


            enemiesInsideRadius(
                centerX,
                centerY,
                240
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            95 +
                            player.damage *
                            1.25,

                            {
                                critical:
                                    true,

                                color:
                                    palette.main
                            }
                        );

                    }
                );

        }

    }


    /* =========================================================
       TRANSMORFO
       ========================================================= */

    function useShapeshifterSkill(
        key
    ) {

        const player =
            state.player;


        const palette =
            getCharacterPalette(
                "zephyr"
            );


        if (
            key ===
            "q"
        ) {

            player.adaptiveBuff =
                true;


            player.adaptiveTimer =
                6;


            createEffect(
                "adaptiveForm",

                player.x,
                player.y,

                {
                    duration:
                        6,

                    radius:
                        55,

                    color:
                        palette.main
                }
            );


            showToast(
                "Forma Adaptativa ativa por 6 segundos."
            );

        }

        else if (
            key ===
            "r"
        ) {

            const dx =
                state.pointer
                    .worldX -
                player.x;


            const dy =
                state.pointer
                    .worldY -
                player.y;


            const dir =
                normalizeVector(
                    dx,
                    dy
                );


            const oldX =
                player.x;


            const oldY =
                player.y;


            for (
                let i = 0;
                i < 14;
                i++
            ) {

                const nextX =
                    player.x +
                    dir.x *
                    12;


                const nextY =
                    player.y +
                    dir.y *
                    12;


                if (
                    !canPlayerMoveTo(
                        nextX,
                        nextY,
                        player.radius
                    )
                ) {

                    break;

                }


                player.x =
                    nextX;


                player.y =
                    nextY;

            }


            createEffect(
                "chimeraDash",

                oldX,
                oldY,

                {
                    targetX:
                        player.x,

                    targetY:
                        player.y,

                    duration:
                        0.36,

                    radius:
                        26,

                    color:
                        palette.secondary
                }
            );


            enemiesInsideRadius(
                player.x,
                player.y,
                105
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            68 +
                            player.damage,

                            {
                                color:
                                    palette.secondary
                            }
                        );

                    }
                );

        }

        else {

            player.adaptiveBuff =
                true;


            player.adaptiveTimer =
                10;


            player.shieldTimer =
                Math.max(
                    player.shieldTimer,
                    4
                );


            createEffect(
                "perfectForm",

                player.x,
                player.y,

                {
                    duration:
                        10,

                    radius:
                        85,

                    color:
                        palette.glow
                }
            );


            enemiesInsideRadius(
                player.x,
                player.y,
                170
            )
                .forEach(
                    enemy => {

                        attackEnemy(
                            enemy,
                            90 +
                            player.damage *
                            1.15,

                            {
                                color:
                                    palette.glow
                            }
                        );

                    }
                );

        }

    }


    /* =========================================================
       COOLDOWNS
       ========================================================= */

    function updatePlayerTimers(
        dt
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        player.invincible =
            Math.max(
                0,
                player.invincible -
                dt
            );


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


        Object.keys(
            player.skillCooldowns
        )
            .forEach(
                key => {

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
            );


        if (
            player.adaptiveBuff
        ) {

            player.adaptiveTimer -=
                dt;


            if (
                player.adaptiveTimer <=
                0
            ) {

                player.adaptiveBuff =
                    false;


                player.adaptiveTimer =
                    0;

            }

        }


        if (
            player.roarBuffTimer >
            0
        ) {

            player.roarBuffTimer -=
                dt;


            if (
                player.roarBuffTimer <=
                0
            ) {

                player.roarBuffTimer =
                    0;


                player.damageReduction =
                    0;

            }

        }


        updatePotionBuffs(
            dt
        );


        updatePlayerDash(
            dt
        );

    }


    /* =========================================================
       INVESTIDA INIMIGA
       ========================================================= */

    function beginEnemyCharge(
        enemy,
        options = {}
    ) {

        if (
            enemy.charge ||
            enemy.stunTimer >
                0
        ) {

            return;

        }


        const dx =
            state.player.x -
            enemy.x;


        const dy =
            state.player.y -
            enemy.y;


        const dir =
            normalizeVector(
                dx,
                dy
            );


        enemy.charge = {

            phase:
                "telegraph",

            timer:
                options.telegraph ||
                0.72,

            directionX:
                dir.x,

            directionY:
                dir.y,

            speed:
                options.speed ||
                420,

            duration:
                options.duration ||
                0.42,

            damage:
                options.damage ||
                enemy.damage *
                1.25,

            hit:
                false,

            color:
                options.color ||
                "#e98763"

        };


        createEffect(
            "chargeTelegraph",

            enemy.x,
            enemy.y,

            {
                targetX:
                    enemy.x +
                    dir.x *
                    260,

                targetY:
                    enemy.y +
                    dir.y *
                    260,

                duration:
                    enemy.charge
                        .timer,

                radius:
                    enemy.radius +
                    12,

                color:
                    enemy.charge
                        .color
            }
        );

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
                    "moving";


                charge.timer =
                    charge.duration;


                enemy.telegraphing =
                    false;


                createEffect(
                    "chargeBurst",

                    enemy.x,
                    enemy.y,

                    {
                        color:
                            charge.color,

                        duration:
                            0.24,

                        radius:
                            enemy.radius +
                            16
                    }
                );

            }


            return true;

        }


        charge.timer -=
            dt;


        const step =
            charge.speed *
            dt;


        const nextX =
            enemy.x +
            charge.directionX *
            step;


        const nextY =
            enemy.y +
            charge.directionY *
            step;


        if (
            canEnemyMoveTo(
                nextX,
                nextY,
                enemy.radius
            )
        ) {

            enemy.x =
                nextX;


            enemy.y =
                nextY;

        }

        else {

            enemy.charge =
                null;


            return true;

        }


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
                charge.damage
            );

        }


        if (
            charge.timer <=
            0
        ) {

            enemy.charge =
                null;

        }


        return true;

    }


    /* =========================================================
       PROJÉTEIS INIMIGOS
       ========================================================= */

    function spawnEnemyProjectile(
        enemy,
        options = {}
    ) {

        const dir =
            normalizeVector(
                state.player.x -
                    enemy.x,

                state.player.y -
                    enemy.y
            );


        state.world
            .hazards
            .push({

                id:
                    uid(
                        "enemyProjectile"
                    ),

                type:
                    "projectile",

                x:
                    enemy.x,

                y:
                    enemy.y,

                vx:
                    dir.x *
                    (
                        options.speed ||
                        260
                    ),

                vy:
                    dir.y *
                    (
                        options.speed ||
                        260
                    ),

                radius:
                    options.radius ||
                    10,

                damage:
                    options.damage ||
                    enemy.damage,

                life:
                    options.life ||
                    3,

                maxLife:
                    options.life ||
                    3,

                color:
                    options.color ||
                    "#c86b6b",

                sourceId:
                    enemy.id,

                triggered:
                    false

            });

    }


    /* =========================================================
       ESPECIAIS DE INIMIGOS / BOSSES
       ========================================================= */

    function performEnemySpecial(
        enemy
    ) {

        if (
            !enemy ||
            enemy.dead ||
            enemy.stunTimer >
                0
        ) {

            return;

        }


        const special =
            enemy.special;


        if (
            special ===
                "telegraphedCharge"
        ) {

            beginEnemyCharge(
                enemy,

                {
                    telegraph:
                        0.72,

                    speed:
                        420,

                    duration:
                        0.42,

                    damage:
                        enemy.damage *
                        1.3
                }
            );


            enemy.specialTimer =
                random(
                    4.3,
                    6.2
                );


            return;

        }


        if (
            special ===
                "memoryBurst"
        ) {

            addHazard(
                state.player.x,
                state.player.y,

                76,
                0.85,

                enemy.damage *
                    1.2,

                {
                    type:
                        "memoryBlast",

                    color:
                        "rgba(208,100,92,.23)"
                }
            );


            enemy.specialTimer =
                4.5;


            return;

        }


        if (
            special ===
                "rootCircle"
        ) {

            for (
                let i = 0;
                i < 3;
                i++
            ) {

                const angle =
                    Math.random() *
                    Math.PI *
                    2;


                addHazard(
                    state.player.x +
                        Math.cos(
                            angle
                        ) *
                        random(
                            0,
                            90
                        ),

                    state.player.y +
                        Math.sin(
                            angle
                        ) *
                        random(
                            0,
                            90
                        ),

                    62,
                    0.9 +
                    i *
                    0.14,

                    enemy.damage *
                        1.05,

                    {
                        type:
                            "roots",

                        color:
                            "rgba(87,120,70,.27)"
                    }
                );

            }


            enemy.specialTimer =
                5;


            return;

        }


        if (
            special ===
                "leafStorm"
        ) {

            addHazard(
                state.player.x,
                state.player.y,

                115,
                1.05,

                enemy.damage *
                    1.22,

                {
                    type:
                        "leafStorm",

                    color:
                        "rgba(91,131,79,.25)"
                }
            );


            enemy.specialTimer =
                4.6;


            return;

        }


        if (
            special ===
                "rockThrow" ||
            special ===
                "rockStorm"
        ) {

            const count =
                special ===
                    "rockStorm"

                    ? 4
                    : 1;


            for (
                let i = 0;
                i < count;
                i++
            ) {

                addHazard(
                    state.player.x +
                        random(
                            -125,
                            125
                        ),

                    state.player.y +
                        random(
                            -125,
                            125
                        ),

                    special ===
                        "rockStorm"

                        ? 68
                        : 54,

                    0.95 +
                    i *
                    0.13,

                    enemy.damage *
                        (
                            special ===
                                "rockStorm"

                                ? 1.25
                                : 1.05
                        ),

                    {
                        type:
                            "fallingRock",

                        color:
                            "rgba(85,80,75,.30)"
                    }
                );

            }


            enemy.specialTimer =
                special ===
                    "rockStorm"

                    ? 5.2
                    : 4.2;


            return;

        }


        if (
            special ===
                "oreBurst"
        ) {

            addHazard(
                enemy.x,
                enemy.y,

                125,
                0.72,

                enemy.damage *
                    1.22,

                {
                    type:
                        "oreBurst",

                    color:
                        "rgba(135,145,150,.26)"
                }
            );


            enemy.specialTimer =
                4.5;


            return;

        }


        if (
            special ===
                "crystalShot"
        ) {

            spawnEnemyProjectile(
                enemy,

                {
                    speed:
                        300,

                    damage:
                        enemy.damage *
                        1.05,

                    color:
                        "#d85c72",

                    radius:
                        11
                }
            );


            enemy.specialTimer =
                3.3;


            return;

        }


        if (
            special ===
                "crystalRain"
        ) {

            for (
                let i = 0;
                i < 5;
                i++
            ) {

                addHazard(
                    state.player.x +
                        random(
                            -170,
                            170
                        ),

                    state.player.y +
                        random(
                            -170,
                            170
                        ),

                    62,

                    0.8 +
                    i *
                    0.11,

                    enemy.damage *
                        1.18,

                    {
                        type:
                            "crystalRain",

                        color:
                            "rgba(193,66,86,.28)"
                    }
                );

            }


            enemy.specialTimer =
                5.2;


            return;

        }


        if (
            special ===
                "webShot"
        ) {

            spawnEnemyProjectile(
                enemy,

                {
                    speed:
                        240,

                    damage:
                        enemy.damage *
                        0.9,

                    color:
                        "#c3accd",

                    radius:
                        10
                }
            );


            enemy.webSpecial =
                true;


            enemy.specialTimer =
                4.5;


            return;

        }


        if (
            special ===
                "poisonBurst"
        ) {

            addHazard(
                state.player.x,
                state.player.y,

                70,
                0.75,

                enemy.damage,

                {
                    type:
                        "poison",

                    color:
                        "rgba(111,157,81,.28)"
                }
            );


            enemy.specialTimer =
                4.8;


            return;

        }


        if (
            special ===
                "sonicBurst"
        ) {

            addHazard(
                enemy.x,
                enemy.y,

                150,
                0.5,

                enemy.damage *
                    0.9,

                {
                    type:
                        "sonic",

                    color:
                        "rgba(131,100,164,.22)"
                }
            );


            enemy.specialTimer =
                4;


            return;

        }


        if (
            special ===
                "shadowProjectile"
        ) {

            spawnEnemyProjectile(
                enemy,

                {
                    speed:
                        290,

                    damage:
                        enemy.damage,

                    color:
                        "#666bb0",

                    radius:
                        12
                }
            );


            enemy.specialTimer =
                3.6;


            return;

        }


        if (
            special ===
                "darkSlash"
        ) {

            addHazard(
                state.player.x,
                state.player.y,

                78,
                0.52,

                enemy.damage *
                    1.08,

                {
                    type:
                        "darkSlash",

                    color:
                        "rgba(87,92,132,.28)"
                }
            );


            enemy.specialTimer =
                3.8;


            return;

        }


        if (
            special ===
                "fairyBolt"
        ) {

            spawnEnemyProjectile(
                enemy,

                {
                    speed:
                        335,

                    damage:
                        enemy.damage,

                    color:
                        "#ee8bdc",

                    radius:
                        10
                }
            );


            enemy.specialTimer =
                3.1;


            return;

        }


        if (
            special ===
                "magicShield"
        ) {

            enemy.shield =
                0.35;


            enemy.shieldTimer =
                3;


            createEffect(
                "enemyShield",

                enemy.x,
                enemy.y,

                {
                    duration:
                        3,

                    radius:
                        enemy.radius +
                        18,

                    color:
                        "#b69bd8"
                }
            );


            enemy.specialTimer =
                6;


            return;

        }


        if (
            special ===
                "shadowGuardian"
        ) {

            if (
                Math.random() <
                0.48
            ) {

                beginEnemyCharge(
                    enemy,

                    {
                        telegraph:
                            0.78,

                        speed:
                            470,

                        duration:
                            0.5,

                        damage:
                            enemy.damage *
                            1.35,

                        color:
                            "#756fd1"
                    }
                );

            }

            else {

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    addHazard(
                        state.player.x +
                            random(
                                -130,
                                130
                            ),

                        state.player.y +
                            random(
                                -130,
                                130
                            ),

                        68,

                        0.72 +
                        i *
                        0.12,

                        enemy.damage *
                            1.15,

                        {
                            type:
                                "shadowCircle",

                            color:
                                "rgba(73,76,131,.30)"
                        }
                    );

                }

            }


            enemy.specialTimer =
                4.8;


            return;

        }


        if (
            special ===
                "threadGuardian"
        ) {

            if (
                Math.random() <
                0.45
            ) {

                beginEnemyCharge(
                    enemy,

                    {
                        telegraph:
                            0.68,

                        speed:
                            510,

                        duration:
                            0.45,

                        damage:
                            enemy.damage *
                            1.32,

                        color:
                            "#e998da"
                    }
                );

            }

            else {

                for (
                    let i = 0;
                    i < 5;
                    i++
                ) {

                    spawnEnemyProjectile(
                        enemy,

                        {
                            speed:
                                280 +
                                i *
                                12,

                            damage:
                                enemy.damage *
                                0.75,

                            color:
                                i % 2
                                    ? "#e69bd8"
                                    : "#8cd7e8",

                            radius:
                                9
                        }
                    );

                }

            }


            enemy.specialTimer =
                4.4;


            return;

        }


        if (
            special ===
                "pathGuardian"
        ) {

            if (
                Math.random() <
                0.5
            ) {

                beginEnemyCharge(
                    enemy,

                    {
                        telegraph:
                            0.64,

                        speed:
                            540,

                        duration:
                            0.46,

                        damage:
                            enemy.damage *
                            1.35,

                        color:
                            "#efdb9c"
                    }
                );

            }

            else {

                addHazard(
                    state.player.x,
                    state.player.y,

                    115,
                    0.84,

                    enemy.damage *
                        1.25,

                    {
                        type:
                            "skyJudgement",

                        color:
                            "rgba(244,219,151,.26)"
                    }
                );

            }


            enemy.specialTimer =
                4.1;


            return;

        }


        if (
            special ===
                "fireShot" ||
            special ===
                "hellProjectile"
        ) {

            spawnEnemyProjectile(
                enemy,

                {
                    speed:
                        special ===
                            "hellProjectile"

                            ? 330
                            : 300,

                    damage:
                        enemy.damage,

                    color:
                        "#ff713d",

                    radius:
                        12
                }
            );


            enemy.specialTimer =
                3.1;


            return;

        }


        if (
            special ===
                "hellSmash"
        ) {

            addHazard(
                enemy.x,
                enemy.y,

                145,
                0.72,

                enemy.damage *
                    1.35,

                {
                    type:
                        "hellSmash",

                    color:
                        "rgba(255,74,25,.28)"
                }
            );


            enemy.specialTimer =
                4.3;


            return;

        }


        if (
            special ===
                "flameRing"
        ) {

            addHazard(
                state.player.x,
                state.player.y,

                105,
                0.7,

                enemy.damage *
                    1.10,

                {
                    type:
                        "flameRing",

                    color:
                        "rgba(255,104,34,.26)"
                }
            );


            enemy.specialTimer =
                4;


            return;

        }


        if (
            special ===
                "hellGuardian"
        ) {

            const roll =
                Math.random();


            if (
                roll <
                0.33
            ) {

                beginEnemyCharge(
                    enemy,

                    {
                        telegraph:
                            0.72,

                        speed:
                            530,

                        duration:
                            0.5,

                        damage:
                            enemy.damage *
                            1.42,

                        color:
                            "#ff5b2e"
                    }
                );

            }

            else if (
                roll <
                0.66
            ) {

                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    addHazard(
                        state.player.x +
                            random(
                                -180,
                                180
                            ),

                        state.player.y +
                            random(
                                -180,
                                180
                            ),

                        72,

                        0.72 +
                        i *
                        0.1,

                        enemy.damage *
                            1.18,

                        {
                            type:
                                "hellMeteor",

                            color:
                                "rgba(255,80,30,.28)"
                        }
                    );

                }

            }

            else {

                for (
                    let i = 0;
                    i < 5;
                    i++
                ) {

                    spawnEnemyProjectile(
                        enemy,

                        {
                            speed:
                                300 +
                                i *
                                14,

                            damage:
                                enemy.damage *
                                0.72,

                            color:
                                "#f56b36",

                            radius:
                                11
                        }
                    );

                }

            }


            enemy.specialTimer =
                4.3;


            return;

        }


        if (
            special ===
                "otherSelf"
        ) {

            performOtherSelfSpecial(
                enemy
            );

        }

    }


    /* =========================================================
       O OUTRO EU — FASES
       ========================================================= */

    function getFinalBossPhase(
        enemy
    ) {

        const ratio =
            enemy.hp /
            enemy.maxHp;


        if (
            ratio >
            0.78
        ) {

            return 1;

        }


        if (
            ratio >
            0.56
        ) {

            return 2;

        }


        if (
            ratio >
            0.34
        ) {

            return 3;

        }


        if (
            ratio >
            0.14
        ) {

            return 4;

        }


        return 5;

    }


    function performOtherSelfSpecial(
        enemy
    ) {

        const phase =
            getFinalBossPhase(
                enemy
            );


        enemy.phase =
            phase;


        if (
            phase ===
            1
        ) {

            beginEnemyCharge(
                enemy,

                {
                    telegraph:
                        0.72,

                    speed:
                        490,

                    duration:
                        0.48,

                    damage:
                        enemy.damage *
                        1.25,

                    color:
                        "#c9bfb4"
                }
            );


            enemy.specialTimer =
                4;


            return;

        }


        if (
            phase ===
            2
        ) {

            for (
                let i = 0;
                i < 4;
                i++
            ) {

                spawnEnemyProjectile(
                    enemy,

                    {
                        speed:
                            310 +
                            i *
                            18,

                        damage:
                            enemy.damage *
                            0.82,

                        color:
                            "#bb8ce0",

                        radius:
                            11
                    }
                );

            }


            enemy.specialTimer =
                3.8;


            return;

        }


        if (
            phase ===
            3
        ) {

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                addHazard(
                    state.player.x +
                        random(
                            -190,
                            190
                        ),

                    state.player.y +
                        random(
                            -190,
                            190
                        ),

                    75,

                    0.72 +
                    i *
                    0.11,

                    enemy.damage *
                        1.10,

                    {
                        type:
                            "memoryCollapse",

                        color:
                            "rgba(135,86,164,.26)"
                    }
                );

            }


            enemy.specialTimer =
                3.9;


            return;

        }


        if (
            phase ===
            4
        ) {

            beginEnemyCharge(
                enemy,

                {
                    telegraph:
                        0.52,

                    speed:
                        590,

                    duration:
                        0.46,

                    damage:
                        enemy.damage *
                        1.35,

                    color:
                        "#a76fc5"
                }
            );


            for (
                let i = 0;
                i < 3;
                i++
            ) {

                addHazard(
                    state.player.x +
                        random(
                            -120,
                            120
                        ),

                    state.player.y +
                        random(
                            -120,
                            120
                        ),

                    62,

                    1 +
                    i *
                    0.14,

                    enemy.damage,

                    {
                        type:
                            "quietude",

                        color:
                            "rgba(80,55,100,.32)"
                    }
                );

            }


            enemy.specialTimer =
                3.5;


            return;

        }


        /*
            FASE FINAL
        */

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            addHazard(
                state.player.x +
                    random(
                        -220,
                        220
                    ),

                state.player.y +
                    random(
                        -220,
                        220
                    ),

                72,

                0.55 +
                i *
                0.08,

                enemy.damage *
                    1.12,

                {
                    type:
                        "absoluteQuietude",

                    color:
                        "rgba(62,40,78,.36)"
                }
            );

        }


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            spawnEnemyProjectile(
                enemy,

                {
                    speed:
                        360 +
                        i *
                        25,

                    damage:
                        enemy.damage *
                        0.75,

                    color:
                        "#c58ce6",

                    radius:
                        13
                }
            );

        }


        enemy.specialTimer =
            3;

    }


    /* =========================================================
       MONARCA
       ========================================================= */

    function spawnMonarch(
        cinematic =
            true
    ) {

        if (
            state.player
                ?.monarchDefeated
        ) {

            return null;

        }


        const existing =
            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "monarch" &&
                        !enemy.dead
                );


        if (
            existing
        ) {

            return existing;

        }


        const arena =
            state.world
                .maze
                ?.arena;


        if (
            !arena
        ) {

            return null;

        }


        const enemy =
            addEnemy({

                id:
                    "monarch",

                x:
                    arena.x +
                    arena.w /
                    2,

                y:
                    arena.y +
                    arena.h *
                    0.28,

                name:
                    "O MONARCA",

                icon:
                    "🥷",

                type:
                    "progression",

                hp:
                    2650,

                damage:
                    59,

                speed:
                    0,

                vision:
                    1200,

                attackRange:
                    650,

                radius:
                    48,

                color:
                    "#55475f",

                drop:
                    null,

                dropAmount:
                    0,

                special:
                    "monarch",

                stationary:
                    true,

                accepted:
                    true,

                aggressive:
                    !cinematic,

                summonTimer:
                    5,

                summonCooldown:
                    6.5,

                rockTimer:
                    2.2,

                shadowTimer:
                    3.8,

                hitCounter:
                    0,

                staggerTimer:
                    0

            });


        if (
            !enemy
        ) {

            return null;

        }


        state.player
            .monarchAwakened =
            true;


        state.bossBarTarget =
            enemy;


        if (
            cinematic
        ) {

            enemy.aggressive =
                false;


            startDialogue({

                name:
                    "ALTAR",

                lines: [

                    "A OFERENDA FOI ACEITA...",

                    "...MAS NÃO POR VOCÊ.",

                    "O MONARCA DESPERTOU"

                ],

                onClose:
                    () => {

                        enemy.aggressive =
                            true;

                    }

            });

        }


        return enemy;

    }


    function isSafeMonarchClonePosition(
        x,
        y
    ) {

        const arena =
            state.world
                .maze
                ?.arena;


        if (
            !arena
        ) {

            return false;

        }


        const margin =
            70;


        if (
            x <
                arena.x +
                margin ||
            x >
                arena.x +
                arena.w -
                margin ||
            y <
                arena.y +
                margin ||
            y >
                arena.y +
                arena.h -
                margin
        ) {

            return false;

        }


        for (
            const obstacle of
            state.world
                .obstacles
        ) {

            if (
                ![
                    "mazeWall",
                    "arenaWall"
                ].includes(
                    obstacle.type
                )
            ) {

                continue;

            }


            if (
                circleRectCollision(
                    x,
                    y,
                    25,
                    obstacle
                )
            ) {

                return false;

            }

        }


        return true;

    }


    function spawnMonarchClone() {

        const monarch =
            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "monarch" &&
                        !enemy.dead
                );


        if (
            !monarch
        ) {

            return null;

        }


        const totalClones =
            state.world
                .enemies
                .filter(
                    enemy =>
                        enemy.monarchClone &&
                        !enemy.dead
                )
                .length;


        if (
            totalClones >=
            6
        ) {

            return null;

        }


        const spawnPoints =
            [
                ...(
                    state.world
                        .maze
                        ?.arenaSpawnPoints ||
                    []
                )
            ];


        for (
            let attempts = 0;
            attempts < 20;
            attempts++
        ) {

            const base =
                spawnPoints[
                    randomInt(
                        0,
                        spawnPoints.length -
                            1
                    )
                ];


            if (
                !base
            ) {

                break;

            }


            const x =
                base.x +
                random(
                    -45,
                    45
                );


            const y =
                base.y +
                random(
                    -45,
                    45
                );


            if (
                !isSafeMonarchClonePosition(
                    x,
                    y
                )
            ) {

                continue;

            }


            return addEnemy({

                id:
                    uid(
                        "monarch_clone"
                    ),

                x,
                y,

                name:
                    "SOMBRA DO MONARCA",

                icon:
                    "🥷",

                type:
                    "summon",

                hp:
                    280,

                damage:
                    34,

                speed:
                    102,

                vision:
                    800,

                attackRange:
                    70,

                radius:
                    23,

                color:
                    "#403747",

                drop:
                    null,

                aggressive:
                    true,

                accepted:
                    true,

                monarchClone:
                    true,

                special:
                    Math.random() <
                        0.5

                        ? "telegraphedCharge"
                        : "shadowProjectile"

            });

        }


        return null;

    }


    function updateMonarch(
        enemy,
        dt
    ) {

        if (
            enemy.dead ||
            !enemy.aggressive
        ) {

            return;

        }


        if (
            enemy.staggerTimer >
            0
        ) {

            enemy.staggerTimer =
                Math.max(
                    0,
                    enemy.staggerTimer -
                    dt
                );


            enemy.stunTimer =
                Math.max(
                    enemy.stunTimer,
                    enemy.staggerTimer
                );


            return;

        }


        enemy.summonTimer -=
            dt;


        enemy.rockTimer -=
            dt;


        enemy.shadowTimer -=
            dt;


        if (
            enemy.summonTimer <=
            0
        ) {

            const amount =
                randomInt(
                    1,
                    3
                );


            for (
                let i = 0;
                i < amount;
                i++
            ) {

                spawnMonarchClone();

            }


            enemy.summonTimer =
                Math.max(
                    5,
                    enemy.summonCooldown
                );

        }


        if (
            enemy.rockTimer <=
            0
        ) {

            for (
                let i = 0;
                i < 3;
                i++
            ) {

                addHazard(
                    state.player.x +
                        random(
                            -125,
                            125
                        ),

                    state.player.y +
                        random(
                            -125,
                            125
                        ),

                    74,

                    0.95 +
                    i *
                    0.16,

                    enemy.damage *
                        1.28,

                    {
                        type:
                            "monarchRock",

                        color:
                            "rgba(116,94,124,.30)"
                    }
                );

            }


            enemy.rockTimer =
                random(
                    3.4,
                    4.7
                );

        }


        if (
            enemy.shadowTimer <=
            0
        ) {

            addHazard(
                state.player.x,
                state.player.y,

                110,
                0.85,

                enemy.damage *
                    1.20,

                {
                    type:
                        "monarchShadow",

                    color:
                        "rgba(60,45,75,.34)"
                }
            );


            enemy.shadowTimer =
                random(
                    4.5,
                    6
                );

        }

    }


    /* =========================================================
       IA DOS INIMIGOS
       ========================================================= */

    function updateEnemyPhase(
        enemy
    ) {

        if (
            !isBossId(
                enemy.id
            ) &&
            enemy.type !==
                "resourceBoss"
        ) {

            return;

        }


        const ratio =
            enemy.hp /
            enemy.maxHp;


        if (
            ratio <
                0.3
        ) {

            enemy.phase =
                3;

        }

        else if (
            ratio <
                0.65
        ) {

            enemy.phase =
                2;

        }

        else {

            enemy.phase =
                1;

        }

    }


    function returnResourceBossHome(
        enemy,
        dt
    ) {

        const dx =
            enemy.spawnX -
            enemy.x;


        const dy =
            enemy.spawnY -
            enemy.y;


        const d =
            Math.hypot(
                dx,
                dy
            );


        if (
            d <
            8
        ) {

            enemy.x =
                enemy.spawnX;


            enemy.y =
                enemy.spawnY;


            enemy.state =
                "idle";


            enemy.aggressive =
                false;


            enemy.hp =
                enemy.maxHp;


            return;

        }


        moveEntityWithCollision(
            enemy,
            dx,
            dy,
            dt,
            enemy.speed *
                0.9,
            false
        );

    }


    function updateEnemies(
        dt
    ) {

        if (
            !state.player ||
            state.houseMode ||
            state.paused
        ) {

            return;

        }


        for (
            const enemy of
            state.world
                .enemies
        ) {

            if (
                enemy.dead
            ) {

                if (
                    enemy.type ===
                    "resourceBoss"
                ) {

                    enemy.respawnTimer -=
                        dt;


                    if (
                        enemy.respawnTimer <=
                        0
                    ) {

                        enemy.dead =
                            false;


                        enemy.hp =
                            enemy.maxHp;


                        enemy.x =
                            enemy.spawnX;


                        enemy.y =
                            enemy.spawnY;


                        enemy.aggressive =
                            false;


                        enemy.accepted =
                            true;


                        enemy.state =
                            "idle";


                        showToast(
                            `${enemy.name} renasceu!`
                        );

                    }

                }


                continue;

            }


            enemy.attackTimer =
                Math.max(
                    0,
                    enemy.attackTimer -
                    dt
                );


            enemy.specialTimer =
                Math.max(
                    0,
                    enemy.specialTimer -
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
                enemy.shieldTimer >
                0
            ) {

                enemy.shieldTimer -=
                    dt;


                if (
                    enemy.shieldTimer <=
                    0
                ) {

                    enemy.shield =
                        0;

                }

            }


            updateEnemyPhase(
                enemy
            );


            if (
                enemy.id ===
                "monarch"
            ) {

                updateMonarch(
                    enemy,
                    dt
                );


                continue;

            }


            if (
                enemy.stunTimer >
                0
            ) {

                continue;

            }


            if (
                enemy.charge &&
                updateEnemyCharge(
                    enemy,
                    dt
                )
            ) {

                continue;

            }


            const dx =
                state.player.x -
                enemy.x;


            const dy =
                state.player.y -
                enemy.y;


            const d =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                if (
                    d <
                    250
                ) {

                    state.bossBarTarget =
                        enemy;

                }


                continue;

            }


            if (
                enemy.finalBoss &&
                !enemy.accepted
            ) {

                if (
                    d <
                    300
                ) {

                    state.bossBarTarget =
                        enemy;

                }


                continue;

            }


            if (
                enemy.type ===
                    "resourceBoss"
            ) {

                const homeDistance =
                    Math.hypot(
                        enemy.x -
                            enemy.spawnX,

                        enemy.y -
                            enemy.spawnY
                    );


                if (
                    enemy.aggressive &&
                    homeDistance >
                    (
                        enemy.leash ||
                        420
                    )
                ) {

                    enemy.state =
                        "returning";

                }


                if (
                    enemy.state ===
                    "returning"
                ) {

                    returnResourceBossHome(
                        enemy,
                        dt
                    );


                    continue;

                }

            }


            if (
                d <=
                enemy.vision
            ) {

                enemy.aggressive =
                    true;

            }


            if (
                !enemy.aggressive
            ) {

                continue;

            }


            if (
                isBossId(
                    enemy.id
                ) ||
                enemy.type ===
                    "resourceBoss"
            ) {

                state.bossBarTarget =
                    enemy;

            }


            if (
                enemy.special &&
                enemy.specialTimer <=
                0
            ) {

                performEnemySpecial(
                    enemy
                );


                if (
                    enemy.charge
                ) {

                    continue;

                }

            }


            const attackRange =
                enemy.attackRange +
                state.player.radius;


            if (
                d >
                attackRange
            ) {

                if (
                    !enemy.stationary
                ) {

                    const phaseSpeed =
                        enemy.phase >=
                            3

                            ? 1.12
                            : enemy.phase ===
                              2

                              ? 1.06
                              : 1;


                    moveEntityWithCollision(
                        enemy,
                        dx,
                        dy,
                        dt,
                        enemy.speed *
                            phaseSpeed,
                        false
                    );

                }


                continue;

            }


            if (
                enemy.attackTimer >
                0
            ) {

                continue;

            }


            enemy.attackTimer =
                enemy.type ===
                    "resourceBoss"

                    ? 1.35
                    : isBossId(
                        enemy.id
                    )

                    ? 1.10
                    : 1.25;


            damagePlayer(
                enemy.damage
            );


            createEffect(
                "enemyAttack",

                enemy.x,
                enemy.y,

                {
                    targetX:
                        state.player.x,

                    targetY:
                        state.player.y,

                    color:
                        enemy.color,

                    duration:
                        0.26,

                    radius:
                        enemy.radius +
                        18
                }
            );

        }


        if (
            state.bossBarTarget &&
            (
                state.bossBarTarget.dead ||
                state.bossBarTarget.hp <=
                    0
            )
        ) {

            state.bossBarTarget =
                null;

        }

    }


    /* =========================================================
       HAZARDS
       ========================================================= */

    function updateHazards(
        dt
    ) {

        if (
            state.houseMode
        ) {

            state.world.hazards =
                [];


            return;

        }


        for (
            const hazard of
            state.world
                .hazards
        ) {

            if (
                hazard.type ===
                "projectile"
            ) {

                hazard.life -=
                    dt;


                hazard.x +=
                    hazard.vx *
                    dt;


                hazard.y +=
                    hazard.vy *
                    dt;


                let blocked =
                    false;


                for (
                    const obstacle of
                    state.world
                        .obstacles
                ) {

                    if (
                        !isAliveTreeObstacle(
                            obstacle
                        )
                    ) {

                        continue;

                    }


                    if (
                        circleRectCollision(
                            hazard.x,
                            hazard.y,
                            hazard.radius,
                            obstacle
                        )
                    ) {

                        blocked =
                            true;


                        break;

                    }

                }


                if (
                    blocked
                ) {

                    hazard.life =
                        0;


                    continue;

                }


                if (
                    !hazard.triggered &&
                    circleCircleCollision(
                        hazard.x,
                        hazard.y,
                        hazard.radius,

                        state.player.x,
                        state.player.y,
                        state.player.radius
                    )
                ) {

                    hazard.triggered =
                        true;


                    damagePlayer(
                        hazard.damage
                    );


                    hazard.life =
                        0;


                    createEffect(
                        "projectileHit",

                        hazard.x,
                        hazard.y,

                        {
                            color:
                                hazard.color,

                            radius:
                                35,

                            duration:
                                0.28
                        }
                    );

                }


                continue;

            }


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

                    hazard.triggered =
                        true;


                    if (
                        Math.hypot(
                            state.player.x -
                                hazard.x,

                            state.player.y -
                                hazard.y
                        ) <=
                        hazard.radius +
                        state.player.radius
                    ) {

                        damagePlayer(
                            hazard.damage
                        );

                    }


                    createEffect(
                        "hazardImpact",

                        hazard.x,
                        hazard.y,

                        {
                            color:
                                hazard.color,

                            radius:
                                hazard.radius,

                            duration:
                                0.35
                        }
                    );


                    shakeScreen(
                        Math.min(
                            12,
                            hazard.damage *
                            0.12
                        ),

                        0.18
                    );

                }

            }


            if (
                hazard.repeat &&
                hazard.life <=
                0
            ) {

                hazard.life =
                    hazard.repeatDelay;


                hazard.delay =
                    Math.min(
                        1.2,
                        hazard.repeatDelay *
                        0.35
                    );


                hazard.maxDelay =
                    hazard.delay;


                hazard.triggered =
                    false;

            }

        }


        state.world.hazards =
            state.world
                .hazards
                .filter(
                    hazard =>
                        hazard.life >
                            0 ||
                        hazard.repeat
                );

    }


    /* =========================================================
       DROPS
       ========================================================= */

    function createWorldDrop(
        x,
        y,
        itemId,
        amount =
            1,
        options = {}
    ) {

        if (
            !ITEMS[
                itemId
            ]
        ) {

            return null;

        }


        const drop = {

            id:
                uid(
                    "drop"
                ),

            x,
            y,

            itemId,

            amount,

            radius:
                18,

            life:
                Number.isFinite(
                    options.life
                )
                    ? options.life
                    : 75,

            unique:
                Boolean(
                    options.unique
                ),

            persistent:
                Boolean(
                    options.persistent
                ),

            bob:
                random(
                    0,
                    Math.PI *
                    2
                ),

            ...options

        };


        state.world
            .drops
            .push(
                drop
            );


        return drop;

    }


    function collectWorldDrop(
        drop
    ) {

        if (
            !drop ||
            !state.player
        ) {

            return false;

        }


        if (
            !canAddItem(
                drop.itemId,
                drop.amount
            )
        ) {

            showToast(
                "Sem espaço de peso suficiente no inventário."
            );


            return false;

        }


        if (
            !addItem(
                drop.itemId,
                drop.amount,

                {
                    silent:
                        true
                }
            )
        ) {

            return false;

        }


        state.world.drops =
            state.world
                .drops
                .filter(
                    item =>
                        item !==
                        drop
                );


        const item =
            ITEMS[
                drop.itemId
            ];


        showToast(
            `${item.name} coletado: x${drop.amount}`
        );


        burstParticles(
            drop.x,
            drop.y,

            "#e9d486",

            12,

            65
        );


        if (
            drop.itemId ===
            "flautaMemoria"
        ) {

            state.player
                .fluteRewardGranted =
                true;


            startDialogue({

                name:
                    "Flauta da Memória",

                lines: [

                    "Ao tocar o instrumento, você escuta uma melodia que parece vir de algum lugar abaixo do mundo.",

                    "A Flauta da Memória foi adicionada ao seu inventário.",

                    "Alguma passagem esquecida pode reagir a ela."

                ]

            });

        }


        return true;

    }


    /* =========================================================
       MORTE / XP / LEVEL
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


        state.keys.clear();


        state.pointer.down =
            false;


        state.paused =
            true;


        state.pauseReason =
            "death";


        must(
            "deathPanel"
        )
            .classList
            .remove(
                "hidden"
            );

    }


    function respawnPlayer() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        must(
            "deathPanel"
        )
            .classList
            .add(
                "hidden"
            );


        const checkpoint =
            player.checkpoint ||
            {
                area:
                    "village",

                x:
                    500,

                y:
                    1120
            };


        player.money =
            Math.max(
                0,
                player.money -
                Math.min(
                    75,
                    Math.floor(
                        player.money *
                        0.08
                    )
                )
            );


        player.dead =
            false;


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
                0.75
            );


        player.energy =
            Math.round(
                player.maxEnergy *
                0.75
            );


        player.invincible =
            2;


        state.area =
            checkpoint.area &&
            REGIONS[
                checkpoint.area
            ]

                ? checkpoint.area
                : "village";


        buildWorld();


        if (
            checkpoint.insideHouse &&
            checkpoint.houseId
        ) {

            const house =
                state.world
                    .buildings
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

            else {

                state.houseMode =
                    false;


                player.x =
                    checkpoint.x;


                player.y =
                    checkpoint.y;

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

        }


        state.paused =
            false;


        state.pauseReason =
            null;


        startTransition({

            label:
                "VOCÊ RETORNOU",

            startBlack:
                true,

            hold:
                0.4,

            fadeIn:
                0.65

        });

    }


    function gainXP(
        amount
    ) {

        const player =
            state.player;


        if (
            !player ||
            amount <=
                0 ||
            player.level >=
                MAX_LEVEL
        ) {

            return;

        }


        player.xp +=
            Math.round(
                amount
            );


        checkLevelUp();

    }


    function calculateXPRequirement(
        level
    ) {

        return Math.round(
            100 *
            Math.pow(
                1.18,
                Math.max(
                    0,
                    level -
                    1
                )
            ) +
            level *
            18
        );

    }


    function checkLevelUp() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


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
                calculateXPRequirement(
                    player.level
                );


            player.hp =
                Math.min(
                    player.maxHp,
                    player.hp +
                    Math.round(
                        player.maxHp *
                        0.25
                    )
                );


            player.magic =
                Math.min(
                    player.maxMagic,
                    player.magic +
                    Math.round(
                        player.maxMagic *
                        0.25
                    )
                );


            player.energy =
                Math.min(
                    player.maxEnergy,
                    player.energy +
                    Math.round(
                        player.maxEnergy *
                        0.25
                    )
                );


            createEffect(
                "levelUp",

                player.x,
                player.y,

                {
                    color:
                        "#f1d681",

                    duration:
                        1.1,

                    radius:
                        100
                }
            );


            showToast(
                `NÍVEL ${player.level}! +${POINTS_PER_LEVEL} pontos de status.`
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


    function defeatEnemy(
        enemy
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return;

        }


        enemy.hp =
            0;


        enemy.dead =
            true;


        enemy.aggressive =
            false;


        enemy.charge =
            null;


        if (
            enemy.type ===
            "resourceBoss"
        ) {

            enemy.respawnTimer =
                enemy.respawnTime ||
                60;

        }


        const progressionBoss =
            enemy.type ===
                "progression" ||
            enemy.finalBoss;


        if (
            progressionBoss &&
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


            showToast(
                "Boss adicionado ao seu livro."
            );

        }


        gainXP(
            enemy.type ===
                "resourceBoss"

                ? 180
                : progressionBoss

                ? 380 +
                  state.player
                      .level *
                  16
                : 22 +
                  enemy.level *
                  5
        );


        state.player.money +=
            enemy.type ===
                "resourceBoss"

                ? randomInt(
                    55,
                    105
                )

                : progressionBoss

                ? randomInt(
                    100,
                    180
                )

                : randomInt(
                    3,
                    15
                );


        if (
            enemy.hellType
        ) {

            state.player
                .hellTypesDefeated[
                    enemy.hellType
                ] =
                true;

        }


        let shouldDrop =
            Boolean(
                enemy.drop
            );


        if (
            shouldDrop &&
            enemy.dropChance !=
                null
        ) {

            shouldDrop =
                Math.random() <=
                enemy.dropChance;

        }


        if (
            shouldDrop
        ) {

            createWorldDrop(
                enemy.x,
                enemy.y,

                enemy.drop,

                enemy.dropAmount ||
                    1,

                {
                    unique:
                        Boolean(
                            ITEMS[
                                enemy.drop
                            ]
                                ?.unique
                        ),

                    persistent:
                        enemy.id ===
                        "path_guardian",

                    life:
                        enemy.id ===
                        "path_guardian"

                        ? Infinity
                        : 80
                }
            );

        }


        if (
            enemy.id ===
            "path_guardian" &&
            !enemy.drop
        ) {

            createWorldDrop(
                enemy.x,
                enemy.y,

                "flautaMemoria",
                1,

                {
                    unique:
                        true,

                    persistent:
                        true,

                    life:
                        Infinity
                }
            );

        }


        if (
            enemy.id ===
            "monarch"
        ) {

            state.player
                .monarchDefeated =
                true;


            state.player
                .monarchAwakened =
                true;


            state.world.enemies =
                state.world
                    .enemies
                    .filter(
                        item =>
                            !item.monarchClone
                    );


            startDialogue({

                name:
                    "O MONARCA",

                lines: [

                    "O corpo do Monarca começa a se desfazer em sombras.",

                    "O altar, antes silencioso, volta a responder à sua presença.",

                    "O poder ainda não é seu. Retorne ao altar para concluir o ritual."

                ]

            });

        }


        if (
            enemy.id ===
            "path_guardian"
        ) {

            showToast(
                "O Guardião caiu. A Flauta da Memória permanece no chão."
            );

        }


        if (
            enemy.id ===
            "hell_supreme_guardian"
        ) {

            showToast(
                "A passagem para a Câmara Final pode ser aberta se você também derrotou os cinco tipos de inimigo do Inferno."
            );

        }


        if (
            enemy.id ===
            "other_self"
        ) {

            state.player
                .finalDefeated =
                true;


            state.player
                .finalChoice =
                "fight";


            startDialogue({

                name:
                    "VEYRA",

                lines: [

                    "O Outro Eu cai.",

                    "Por alguns segundos, o mundo inteiro parece silencioso.",

                    "Então uma única memória retorna.",

                    "Você escolheu lutar para que Veyra continuasse capaz de lembrar."

                ]

            });

        }


        burstParticles(
            enemy.x,
            enemy.y,

            enemy.color ||
            "#d6c7a0",

            progressionBoss
                ? 34
                : 16,

            progressionBoss
                ? 130
                : 80
        );


        createEffect(
            progressionBoss
                ? "bossDefeat"
                : "enemyDefeat",

            enemy.x,
            enemy.y,

            {
                color:
                    enemy.color ||
                    "#d6c7a0",

                radius:
                    progressionBoss
                        ? 110
                        : 55,

                duration:
                    progressionBoss
                        ? 1.2
                        : 0.55
            }
        );


        if (
            progressionBoss
        ) {

            shakeScreen(
                15,
                0.38
            );

        }


        if (
            state.bossBarTarget ===
            enemy
        ) {

            state.bossBarTarget =
                null;

        }

    }


    /* =========================================================
       ÁRVORES / RECURSOS
       ========================================================= */

    function startHoldAction(
        type,
        object,
        duration
    ) {

        state.holdAction = {

            type,

            object,

            duration,

            progress:
                0,

            completed:
                false

        };

    }


    function cancelHoldAction() {

        state.holdAction =
            null;

    }


    function harvestTree(
        tree
    ) {

        const player =
            state.player;


        if (
            !tree ||
            !tree.alive ||
            !player
        ) {

            return false;

        }


        if (
            player.equipment
                .tool !==
                "machado" ||
            !hasItem(
                "machado"
            )
        ) {

            showToast(
                "Você precisa de um machado."
            );


            return false;

        }


        const magicCost =
            Math.ceil(
                4 *
                getMagicEfficiency()
            );


        if (
            player.magic <
            magicCost
        ) {

            showToast(
                "Magia insuficiente para cortar a madeira."
            );


            return false;

        }


        const amount =
            tree.amount ||
            randomInt(
                2,
                5
            );


        if (
            !canAddItem(
                "madeira",
                amount
            )
        ) {

            showToast(
                "Seu inventário está pesado demais."
            );


            return false;

        }


        player.magic =
            Math.max(
                0,
                player.magic -
                magicCost
            );


        player.hunger =
            Math.max(
                0,
                player.hunger -
                0.8
            );


        player.fatigue =
            Math.max(
                0,
                player.fatigue -
                1.1
            );


        tree.alive =
            false;


        tree.respawn =
            random(
                55,
                95
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
            Math.max(
                2,
                8 -
                Math.floor(
                    (
                        player.collected[
                            `tree:${state.area}`
                        ] ||
                        0
                    ) /
                    5
                )
            )
        );


        player.collected[
            `tree:${state.area}`
        ] =
            (
                player.collected[
                    `tree:${state.area}`
                ] ||
                0
            ) +
            1;


        createEffect(
            "treeCut",

            tree.x,
            tree.y,

            {
                color:
                    "#b88d55",

                radius:
                    65,

                duration:
                    0.6
            }
        );


        burstParticles(
            tree.x,
            tree.y,

            "#7cab64",

            24,

            105
        );


        showToast(
            `Madeira coletada: x${amount}`
        );


        return true;

    }


    function collectResource(
        resource
    ) {

        const player =
            state.player;


        if (
            !resource ||
            !resource.alive ||
            !player
        ) {

            return false;

        }


        const item =
            ITEMS[
                resource.type
            ];


        if (
            !item
        ) {

            return false;

        }


        const amount =
            resource.amount ||
            1;


        const magicCost =
            Math.ceil(
                (
                    item.magicCost ||
                    4
                ) *
                getMagicEfficiency()
            );


        if (
            player.magic <
            magicCost
        ) {

            showToast(
                `Magia insuficiente. Necessário: ${magicCost}.`
            );


            return false;

        }


        if (
            !canAddItem(
                resource.type,
                amount
            )
        ) {

            showToast(
                "Seu inventário está pesado demais."
            );


            return false;

        }


        player.magic =
            Math.max(
                0,
                player.magic -
                magicCost
            );


        player.hunger =
            Math.max(
                0,
                player.hunger -
                0.9
            );


        player.fatigue =
            Math.max(
                0,
                player.fatigue -
                1.4
            );


        resource.alive =
            false;


        resource.respawn =
            random(
                42,
                74
            );


        addItem(
            resource.type,
            amount,

            {
                silent:
                    true
            }
        );


        const key =
            `resource:${state.area}:${resource.type}`;


        const previous =
            player.collected[
                key
            ] ||
            0;


        player.collected[
            key
        ] =
            previous +
            1;


        gainXP(
            Math.max(
                2,
                10 -
                Math.floor(
                    previous /
                    4
                )
            )
        );


        player.memory =
            Math.min(
                100,
                player.memory +
                0.5
            );


        createEffect(
            "resourceCollect",

            resource.x,
            resource.y,

            {
                color:
                    resource.type ===
                        "rubi"

                        ? "#d75068"

                        : resource.type ===
                          "diamante"

                          ? "#80d5e8"

                          : resource.type ===
                            "ouro"

                            ? "#e6bf54"

                            : "#a8adb1",

                radius:
                    52,

                duration:
                    0.55
            }
        );


        burstParticles(
            resource.x,
            resource.y,

            "#e1d4ab",

            16,

            85
        );


        showToast(
            `${item.name} coletado: x${amount}`
        );


        return true;

    }


    function collectCarrot(
        food
    ) {

        if (
            !food ||
            !food.alive ||
            !state.player
        ) {

            return false;

        }


        /*
            CENOURA RESTAURA MENOS FOME.
        */

        state.player.hunger =
            Math.min(
                state.player
                    .maxHunger,

                state.player
                    .hunger +
                10
            );


        food.alive =
            false;


        food.respawn =
            random(
                food.respawnMin ||
                    110,

                food.respawnMax ||
                    175
            );


        createEffect(
            "foodCollect",

            food.x,
            food.y,

            {
                color:
                    "#e99145",

                radius:
                    35,

                duration:
                    0.4
            }
        );


        showToast(
            "Cenoura consumida: +10 de fome."
        );


        return true;

    }


    function updateResources(
        dt
    ) {

        for (
            const tree of
            state.world
                .trees
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

                respawnTree(
                    tree
                );

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

            }

        }


        for (
            const food of
            state.world
                .foods
        ) {

            if (
                food.alive
            ) {

                continue;

            }


            food.respawn -=
                dt;


            if (
                food.respawn <=
                0
            ) {

                food.alive =
                    true;

            }

        }


        state.world
            .drops
            .forEach(
                drop => {

                    if (
                        Number.isFinite(
                            drop.life
                        )
                    ) {

                        drop.life -=
                            dt;

                    }


                    drop.bob +=
                        dt *
                        2.4;

                }
            );


        state.world.drops =
            state.world
                .drops
                .filter(
                    drop =>
                        !Number.isFinite(
                            drop.life
                        ) ||
                        drop.life >
                            0
                );

    }


    function respawnTree(
        tree
    ) {

        const rng =
            areaRng(
                state.area,
                `${tree.id}:respawn:${Date.now()}`
            );


        let tries =
            0;


        let x =
            tree.x;


        let y =
            tree.y;


        do {

            x =
                seededInt(
                    rng,
                    130,
                    state.world.width -
                        130
                );


            y =
                seededInt(
                    rng,
                    130,
                    state.world.height -
                        130
                );


            tries++;

        }

        while (
            tries <
                60 &&
            !canPlayerMoveTo(
                x,
                y,
                35
            )
        );


        tree.x =
            x;


        tree.y =
            y;


        tree.alive =
            true;


        tree.amount =
            randomInt(
                2,
                5
            );


        const obstacle =
            state.world
                .obstacles
                .find(
                    item =>
                        item.treeId ===
                        tree.id
                );


        if (
            obstacle
        ) {

            obstacle.x =
                x -
                30;


            obstacle.y =
                y -
                38;

        }

    }


    /* =========================================================
       SEGURAR E
       ========================================================= */

    function updateHoldAction(
        dt
    ) {

        const hold =
            state.holdAction;


        if (
            !hold ||
            state.paused ||
            !state.player ||
            !state.keys
                .has(
                    "e"
                )
        ) {

            if (
                hold
            ) {

                cancelHoldAction();

            }


            return;

        }


        const object =
            hold.object;


        if (
            !object
        ) {

            cancelHoldAction();


            return;

        }


        const maxDistance =
            hold.type ===
                "tree"

                ? 92
                : 88;


        if (
            Math.hypot(
                state.player.x -
                    object.x,

                state.player.y -
                    object.y
            ) >
            maxDistance
        ) {

            cancelHoldAction();


            return;

        }


        if (
            hold.type ===
                "tree" &&
            !object.alive
        ) {

            cancelHoldAction();


            return;

        }


        if (
            hold.type ===
                "resource" &&
            !object.alive
        ) {

            cancelHoldAction();


            return;

        }


        hold.progress +=
            dt;


        if (
            hold.progress <
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

            harvestTree(
                object
            );

        }

        else if (
            hold.type ===
            "resource"
        ) {

            collectResource(
                object
            );

        }


        cancelHoldAction();

    }


    /* =========================================================
       NPCs
       ========================================================= */

    function updateNPCs(
        dt
    ) {

        if (
            state.paused ||
            state.houseMode
        ) {

            return;

        }


        for (
            const npc of
            state.world
                .npcs
        ) {

            if (
                npc.merchant ||
                npc.questId
            ) {

                continue;

            }


            npc.wanderTimer -=
                dt;


            if (
                npc.wanderTimer <=
                0
            ) {

                npc.wanderTimer =
                    random(
                        2,
                        5
                    );


                if (
                    Math.random() <
                    0.45
                ) {

                    npc.wanderDx =
                        0;


                    npc.wanderDy =
                        0;

                }

                else {

                    const angle =
                        Math.random() *
                        Math.PI *
                        2;


                    npc.wanderDx =
                        Math.cos(
                            angle
                        );


                    npc.wanderDy =
                        Math.sin(
                            angle
                        );

                }

            }


            if (
                !npc.wanderDx &&
                !npc.wanderDy
            ) {

                continue;

            }


            const maxHomeDistance =
                95;


            const nextX =
                npc.x +
                npc.wanderDx *
                20 *
                dt;


            const nextY =
                npc.y +
                npc.wanderDy *
                20 *
                dt;


            if (
                Math.hypot(
                    nextX -
                        npc.homeX,

                    nextY -
                        npc.homeY
                ) >
                maxHomeDistance
            ) {

                npc.wanderDx *=
                    -1;


                npc.wanderDy *=
                    -1;


                continue;

            }


            if (
                canEnemyMoveTo(
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

    }


    /* =========================================================
       INTERAÇÃO
       ========================================================= */

    function getInteraction() {

        const player =
            state.player;


        if (
            !player
        ) {

            return null;

        }


        let best =
            null;


        let bestDistance =
            Infinity;


        const consider =
            (
                type,
                object,
                d,
                priority =
                    10
            ) => {

                const score =
                    d +
                    priority;


                if (
                    score <
                    bestDistance
                ) {

                    bestDistance =
                        score;


                    best = {
                        type,
                        object,
                        distance:
                            d
                    };

                }

            };


        if (
            state.houseMode
        ) {

            const door =
                getInteriorDoor();


            const doorDistance =
                Math.hypot(
                    player.x -
                        door.cx,

                    player.y -
                        door.cy
                );


            if (
                doorDistance <
                85
            ) {

                consider(
                    "exitHouse",
                    door,
                    doorDistance,
                    -20
                );

            }


            const furniture =
                getHouseFurniture();


            for (
                const item of
                furniture
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
                    Math.hypot(
                        player.x -
                            cx,

                        player.y -
                            cy
                    );


                if (
                    item.sleep &&
                    d <
                    105
                ) {

                    consider(
                        "sleep",
                        item,
                        d,
                        -12
                    );

                }


                if (
                    item.forge &&
                    d <
                    110
                ) {

                    consider(
                        "forge",
                        item,
                        d,
                        -8
                    );

                }

            }


            for (
                const npc of
                getHouseInteriorNPCs()
            ) {

                const d =
                    distance(
                        player,
                        npc
                    );


                if (
                    d <
                    105
                ) {

                    consider(
                        "npc",
                        npc,
                        d,
                        -15
                    );

                }

            }


            return best;

        }


        const nearestDoor =
            getNearestExteriorDoor(
                105
            );


        if (
            nearestDoor
        ) {

            consider(
                "door",
                nearestDoor,
                nearestDoor.distance,
                -24
            );

        }


        for (
            const drop of
            state.world
                .drops
        ) {

            const d =
                distance(
                    player,
                    drop
                );


            if (
                d <
                82
            ) {

                consider(
                    "drop",
                    drop,
                    d,
                    -26
                );

            }

        }


        for (
            const tree of
            state.world
                .trees
        ) {

            if (
                !tree.alive
            ) {

                continue;

            }


            const d =
                distance(
                    player,
                    tree
                );


            if (
                d <
                88
            ) {

                consider(
                    "tree",
                    tree,
                    d,
                    -6
                );

            }

        }


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
                    player,
                    resource
                );


            if (
                d <
                85
            ) {

                consider(
                    "resource",
                    resource,
                    d,
                    -5
                );

            }

        }


        for (
            const food of
            state.world
                .foods
        ) {

            if (
                !food.alive
            ) {

                continue;

            }


            const d =
                distance(
                    player,
                    food
                );


            if (
                d <
                72
            ) {

                consider(
                    "food",
                    food,
                    d,
                    -8
                );

            }

        }


        for (
            const secret of
            state.world
                .secrets
        ) {

            if (
                secret.found
            ) {

                continue;

            }


            const d =
                distance(
                    player,
                    secret
                );


            if (
                d <
                85
            ) {

                consider(
                    "secret",
                    secret,
                    d,
                    -3
                );

            }

        }


        for (
            const npc of
            state.world
                .npcs
        ) {

            const d =
                distance(
                    player,
                    npc
                );


            if (
                d <
                105
            ) {

                consider(
                    "npc",
                    npc,
                    d,
                    -11
                );

            }

        }


        for (
            const gate of
            state.world
                .gates
        ) {

            const cx =
                gate.x +
                gate.w /
                2;


            const cy =
                gate.y +
                gate.h /
                2;


            const d =
                Math.hypot(
                    player.x -
                        cx,

                    player.y -
                        cy
                );


            if (
                d <
                135
            ) {

                consider(
                    "gate",
                    gate,
                    d,
                    -14
                );

            }

        }


        for (
            const trial of
            state.world
                .trials
        ) {

            const d =
                distance(
                    player,
                    trial
                );


            if (
                d <
                trial.radius +
                65
            ) {

                consider(
                    "trial",
                    trial,
                    d,
                    -9
                );

            }

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
                enemy.type !==
                    "progression" &&
                !enemy.finalBoss
            ) {

                continue;

            }


            if (
                enemy.accepted
            ) {

                continue;

            }


            const d =
                distance(
                    player,
                    enemy
                );


            if (
                d <
                175
            ) {

                consider(
                    "boss",
                    enemy,
                    d,
                    -16
                );

            }

        }


        return best;

    }


    function playerAction() {

        if (
            !state.player
        ) {

            return;

        }


        if (
            state.dialogue
        ) {

            advanceDialogue();


            return;

        }


        if (
            state.paused
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


        if (
            interaction.type ===
            "door"
        ) {

            enterHouse(
                interaction
                    .object
                    .building
            );


            return;

        }


        if (
            interaction.type ===
            "exitHouse"
        ) {

            exitHouse();


            return;

        }


        if (
            interaction.type ===
            "sleep"
        ) {

            sleepInBed();


            return;

        }


        if (
            interaction.type ===
            "forge"
        ) {

            openForgePanel();


            return;

        }


        if (
            interaction.type ===
            "drop"
        ) {

            collectWorldDrop(
                interaction.object
            );


            return;

        }


        if (
            interaction.type ===
            "food"
        ) {

            collectCarrot(
                interaction.object
            );


            return;

        }


        if (
            interaction.type ===
            "secret"
        ) {

            discoverSecret(
                interaction.object
            );


            return;

        }


        if (
            interaction.type ===
            "npc"
        ) {

            const npc =
                interaction.object;


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

                startDialogue(
                    npc,

                    {
                        onClose:
                            () => {
                                openForgePanel();
                            }
                    }
                );


                return;

            }


            if (
                npc.questId
            ) {

                openQuest(
                    npc
                );


                return;

            }


            startDialogue(
                npc
            );


            return;

        }


        if (
            interaction.type ===
            "gate"
        ) {

            interactGate(
                interaction.object
            );


            return;

        }


        if (
            interaction.type ===
            "trial"
        ) {

            if (
                interaction.object
                    .dashAltar
            ) {

                interactDashAltar();


                return;

            }


            if (
                interaction.object
                    .skyTrial
            ) {

                interactSkyTrial();


                return;

            }

        }


        if (
            interaction.type ===
            "boss"
        ) {

            openBattle(
                interaction.object
            );


            return;

        }

    }


    function beginHoldInteraction() {

        if (
            state.paused ||
            state.dialogue ||
            !state.player
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
            interaction.type ===
            "tree"
        ) {

            startHoldAction(
                "tree",
                interaction.object,
                1.25
            );


            return true;

        }


        if (
            interaction.type ===
            "resource"
        ) {

            startHoldAction(
                "resource",
                interaction.object,
                1.45
            );


            return true;

        }


        return false;

    }


    function handleZ() {

        if (
            state.dialogue
        ) {

            advanceDialogue();


            return;

        }


        if (
            state.paused
        ) {

            return;

        }


        if (
            state.houseMode
        ) {

            const door =
                getInteriorDoor();


            const d =
                Math.hypot(
                    state.player.x -
                        door.cx,

                    state.player.y -
                        door.cy
                );


            if (
                d <
                105
            ) {

                exitHouse();

            }

            else {

                showToast(
                    "Aproxime-se da porta."
                );

            }


            return;

        }


        const nearest =
            getNearestExteriorDoor(
                110
            );


        if (
            nearest
        ) {

            enterHouse(
                nearest.building
            );

        }

        else {

            showToast(
                "Aproxime-se de uma porta."
            );

        }

    }


    function discoverSecret(
        secret
    ) {

        if (
            !secret ||
            secret.found
        ) {

            return;

        }


        secret.found =
            true;


        if (
            !state.player
                .secretsFound
                .includes(
                    secret.id
                )
        ) {

            state.player
                .secretsFound
                .push(
                    secret.id
                );

        }


        gainXP(
            25
        );


        startDialogue({

            name:
                secret.title,

            lines: [
                secret.message
            ]

        });

    }


    /* =========================================================
       DIÁLOGOS
       ========================================================= */

    function startDialogue(
        npc,
        options = {}
    ) {

        if (
            !npc
        ) {

            return;

        }


        if (
            state.dialogue
                ?.timer
        ) {

            clearInterval(
                state.dialogue
                    .timer
            );

        }


        const lines =
            Array.isArray(
                npc.lines
            )
                ? npc.lines.slice()
                : [
                    String(
                        npc.lines ||
                        ""
                    )
                ];


        state.dialogue = {

            npc,

            lines,

            index:
                0,

            typing:
                false,

            charIndex:
                0,

            timer:
                null,

            onClose:
                options.onClose ||
                npc.onClose ||
                null

        };


        must(
            "dialogueBox"
        )
            .classList
            .remove(
                "hidden"
            );


        typeDialogue();

    }


    function typeDialogue() {

        const dialogue =
            state.dialogue;


        if (
            !dialogue
        ) {

            return;

        }


        clearInterval(
            dialogue.timer
        );


        const line =
            String(
                dialogue.lines[
                    dialogue.index
                ] ||
                ""
            );


        dialogue.charIndex =
            0;


        dialogue.typing =
            true;


        must(
            "dialogueSpeaker"
        ).textContent =
            dialogue.npc
                .name ||
            "VEYRA";


        must(
            "dialogueText"
        ).textContent =
            "";


        dialogue.timer =
            setInterval(
                () => {

                    dialogue.charIndex++;


                    must(
                        "dialogueText"
                    ).textContent =
                        line.slice(
                            0,
                            dialogue.charIndex
                        );


                    if (
                        dialogue.charIndex >=
                        line.length
                    ) {

                        clearInterval(
                            dialogue.timer
                        );


                        dialogue.typing =
                            false;

                    }

                },
                16
            );

    }


    function advanceDialogue() {

        const dialogue =
            state.dialogue;


        if (
            !dialogue
        ) {

            return;

        }


        if (
            dialogue.typing
        ) {

            clearInterval(
                dialogue.timer
            );


            must(
                "dialogueText"
            ).textContent =
                dialogue.lines[
                    dialogue.index
                ];


            dialogue.typing =
                false;


            return;

        }


        dialogue.index++;


        if (
            dialogue.index >=
            dialogue.lines.length
        ) {

            closeDialogue();


            return;

        }


        typeDialogue();

    }


    function closeDialogue() {

        const dialogue =
            state.dialogue;


        if (
            dialogue
                ?.timer
        ) {

            clearInterval(
                dialogue.timer
            );

        }


        const callback =
            dialogue
                ?.onClose;


        state.dialogue =
            null;


        must(
            "dialogueBox"
        )
            .classList
            .add(
                "hidden"
            );


        if (
            typeof callback ===
            "function"
        ) {

            callback();

        }

    }


    /* =========================================================
       MISSÕES
       ========================================================= */

    function openQuest(
        npc
    ) {

        state.questNPC =
            npc;


        const quest =
            state.player
                .quest[
                    npc.questId
                ];


        if (
            !quest
        ) {

            return;

        }


        const wood =
            npc.questId ===
            "wood";


        const itemId =
            wood
                ? "madeira"
                : "carvao";


        const item =
            ITEMS[
                itemId
            ];


        const current =
            state.player
                .inventory[
                    itemId
                ] ||
            0;


        must(
            "questTitle"
        ).textContent =
            wood
                ? "Madeira para a Vila"
                : "Carvão para a Forja";


        if (
            quest.state ===
            "done"
        ) {

            must(
                "questText"
            ).textContent =
                "Esta missão já foi concluída.";


            must(
                "questStatus"
            ).textContent =
                "CONCLUÍDA";


            must(
                "questActionBtn"
            ).textContent =
                "FECHAR";

        }

        else {

            must(
                "questText"
            ).textContent =
                wood

                    ? "Bran precisa de madeira para reforçar as casas da vila."

                    : "Borin precisa de carvão para manter a forja acesa.";


            must(
                "questStatus"
            ).textContent =
                `${item.name}: ${current}/${quest.need}`;


            if (
                quest.state ===
                "none"
            ) {

                must(
                    "questActionBtn"
                ).textContent =
                    "ACEITAR";

            }

            else if (
                current >=
                quest.need
            ) {

                must(
                    "questActionBtn"
                ).textContent =
                    "ENTREGAR";

            }

            else {

                must(
                    "questActionBtn"
                ).textContent =
                    "CONTINUAR MISSÃO";

            }

        }


        must(
            "questPanel"
        )
            .classList
            .remove(
                "hidden"
            );

    }


    function questAction() {

        const npc =
            state.questNPC;


        if (
            !npc
        ) {

            must(
                "questPanel"
            )
                .classList
                .add(
                    "hidden"
                );


            return;

        }


        const quest =
            state.player
                .quest[
                    npc.questId
                ];


        if (
            !quest
        ) {

            return;

        }


        if (
            quest.state ===
            "done"
        ) {

            must(
                "questPanel"
            )
                .classList
                .add(
                    "hidden"
                );


            return;

        }


        if (
            quest.state ===
            "none"
        ) {

            quest.state =
                "active";


            showToast(
                "Missão aceita."
            );


            openQuest(
                npc
            );


            return;

        }


        const itemId =
            npc.questId ===
                "wood"

                ? "madeira"
                : "carvao";


        const current =
            state.player
                .inventory[
                    itemId
                ] ||
            0;


        if (
            current <
            quest.need
        ) {

            showToast(
                `Ainda faltam ${quest.need - current} unidades.`
            );


            return;

        }


        if (
            quest.rewarded
        ) {

            return;

        }


        removeItem(
            itemId,
            quest.need
        );


        quest.state =
            "done";


        quest.rewarded =
            true;


        gainXP(
            quest.rewardXP
        );


        state.player.money +=
            quest.rewardMoney;


        showToast(
            `Missão concluída! +${quest.rewardXP} XP e +${quest.rewardMoney} moedas.`
        );


        createEffect(
            "questComplete",

            state.player.x,
            state.player.y,

            {
                color:
                    "#e5c468",

                radius:
                    80,

                duration:
                    0.9
            }
        );


        openQuest(
            npc
        );

    }


    /* =========================================================
       SHOP
       ========================================================= */

    const DORAN_SHOP = Object.freeze([
        {
            id:
                "pao",

            price:
                16
        },

        {
            id:
                "carneCaca",

            price:
                32
        },

        {
            id:
                "pocao",

            price:
                40
        },

        {
            id:
                "elixir",

            price:
                46
        },

        {
            id:
                "pocaoForca",

            price:
                90
        },

        {
            id:
                "pocaoMagia",

            price:
                90
        },

        {
            id:
                "pocaoResistencia",

            price:
                100
        },

        {
            id:
                "pocaoVelocidade",

            price:
                96
        },

        {
            id:
                "lanterna",

            price:
                LANTERN_PRICE
        },

        {
            id:
                "minimapa",

            price:
                MINIMAP_PRICE
        },

        {
            id:
                "armaduraFolha",

            price:
                70
        },

        {
            id:
                "armaduraAlgodao",

            price:
                140
        },

        {
            id:
                "armaduraMadeira",

            price:
                220
        },

        {
            id:
                "armaduraCouro",

            price:
                340
        },

        {
            id:
                "espadaFerro",

            price:
                210
        }
    ]);


    function openShop(
        npc
    ) {

        state.shopNPC =
            npc;


        state.shopMode =
            "buy";


        must(
            "shopTitle"
        ).textContent =
            "LOJA DE DORAN";


        document
            .querySelectorAll(
                "#shopTabs [data-shop]"
            )
            .forEach(
                button => {

                    button.classList
                        .toggle(
                            "active",
                            button.dataset
                                .shop ===
                                "buy"
                        );

                }
            );


        updateShop();


        must(
            "shopPanel"
        )
            .classList
            .remove(
                "hidden"
            );

    }


    function updateShop() {

        const grid =
            must(
                "shopGrid"
            );


        grid.innerHTML =
            "";


        if (
            state.shopMode ===
            "buy"
        ) {

            DORAN_SHOP.forEach(
                offer => {

                    const item =
                        ITEMS[
                            offer.id
                        ];


                    if (
                        !item
                    ) {

                        return;

                    }


                    const owned =
                        state.player
                            .inventory[
                                offer.id
                            ] ||
                        0;


                    const uniqueOwned =
                        item.unique &&
                        owned >
                        0;


                    const row =
                        document
                            .createElement(
                                "div"
                            );


                    row.className =
                        "shop-row";


                    row.innerHTML = `
                        <div class="shop-icon">
                            ${item.icon}
                        </div>

                        <div class="shop-info">

                            <strong>
                                ${item.name}
                            </strong>

                            <small>
                                ${getItemDescription(offer.id)}
                            </small>

                        </div>

                        <div class="shop-price">
                            💰 ${offer.price}
                        </div>

                        <button
                            class="primary-btn"
                            type="button"
                            ${uniqueOwned ? "disabled" : ""}
                        >
                            ${uniqueOwned ? "ADQUIRIDO" : "COMPRAR"}
                        </button>
                    `;


                    const button =
                        row.querySelector(
                            "button"
                        );


                    if (
                        button &&
                        !uniqueOwned
                    ) {

                        button.addEventListener(
                            "click",
                            () => {

                                buyShopItem(
                                    offer
                                );

                            }
                        );

                    }


                    grid.appendChild(
                        row
                    );

                }
            );


            const note =
                document
                    .createElement(
                        "div"
                    );


            note.className =
                "quest-status";


            note.textContent =
                "Doran vende armaduras somente até Couro. Para Ferro, Ouro, Diamante e Rubi, procure Borin na forja.";


            grid.appendChild(
                note
            );


            return;

        }


        const sellAll =
            document
                .createElement(
                    "button"
                );


        sellAll.type =
            "button";


        sellAll.className =
            "primary-btn";


        sellAll.textContent =
            "VENDER TUDO QUE PODE SER VENDIDO";


        sellAll.addEventListener(
            "click",
            sellAllItems
        );


        grid.appendChild(
            sellAll
        );


        Object.entries(
            state.player
                .inventory
        )
            .forEach(
                (
                    [
                        id,
                        amount
                    ]
                ) => {

                    if (
                        amount <=
                        0
                    ) {

                        return;

                    }


                    const item =
                        ITEMS[
                            id
                        ];


                    if (
                        !item ||
                        !canSellItem(
                            id
                        )
                    ) {

                        return;

                    }


                    const value =
                        Math.max(
                            1,
                            Math.floor(
                                (
                                    item.value ||
                                    1
                                ) *
                                0.65
                            )
                        );


                    const row =
                        document
                            .createElement(
                                "div"
                            );


                    row.className =
                        "shop-row";


                    row.innerHTML = `
                        <div class="shop-icon">
                            ${item.icon}
                        </div>

                        <div class="shop-info">

                            <strong>
                                ${item.name}
                            </strong>

                            <small>
                                Você possui x${amount}.
                            </small>

                        </div>

                        <div class="shop-price">
                            💰 ${value}
                        </div>

                        <button
                            class="primary-btn"
                            type="button"
                        >
                            VENDER 1
                        </button>
                    `;


                    row
                        .querySelector(
                            "button"
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                sellItem(
                                    id,
                                    1
                                );

                            }
                        );


                    grid.appendChild(
                        row
                    );

                }
            );

    }


    function getItemDescription(
        id
    ) {

        const item =
            ITEMS[
                id
            ];


        if (
            !item
        ) {

            return "";
        }


        if (
            id ===
            "lanterna"
        ) {

            return "Item permanente. Ativa automaticamente em áreas completamente escuras.";

        }


        if (
            id ===
            "minimapa"
        ) {

            return "Desbloqueia o minimapa. Só mostra áreas já exploradas.";

        }


        if (
            item.defense
        ) {

            return `Defesa +${item.defense}.`;

        }


        if (
            item.damage
        ) {

            return `Dano +${item.damage}.`;

        }


        if (
            item.heal
        ) {

            return `Recupera ${item.heal} HP.`;

        }


        if (
            item.energy
        ) {

            return `Recupera ${item.energy} de energia.`;

        }


        if (
            item.hunger
        ) {

            return `Recupera ${item.hunger} de fome.`;

        }


        if (
            item.buff ===
            "strength"
        ) {

            return "+20% de dano durante 15 segundos.";

        }


        if (
            item.buff ===
            "magic"
        ) {

            return "Reduz custo mágico temporariamente.";

        }


        if (
            item.buff ===
            "resistance"
        ) {

            return "Reduz dano recebido durante 15 segundos.";

        }


        if (
            item.buff ===
            "speed"
        ) {

            return "Aumenta velocidade durante 15 segundos.";

        }


        return "Item de Veyra.";

    }


    function buyShopItem(
        offer
    ) {

        const player =
            state.player;


        const item =
            ITEMS[
                offer.id
            ];


        if (
            !player ||
            !item
        ) {

            return;

        }


        if (
            item.unique &&
            hasItem(
                offer.id
            )
        ) {

            showToast(
                `${item.name} já foi adquirido.`
            );


            return;

        }


        if (
            player.money <
            offer.price
        ) {

            showToast(
                "Moedas insuficientes."
            );


            return;

        }


        if (
            !canAddItem(
                offer.id,
                1
            )
        ) {

            showToast(
                "Seu inventário está pesado demais."
            );


            return;

        }


        player.money -=
            offer.price;


        addItem(
            offer.id,
            1,

            {
                silent:
                    true
            }
        );


        showToast(
            `${item.name} adquirido.`
        );


        updateShop();

    }


    function isEquippedItem(
        id
    ) {

        const equipment =
            state.player
                ?.equipment;


        if (
            !equipment
        ) {

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


    function canSellItem(
        id
    ) {

        const item =
            ITEMS[
                id
            ];


        if (
            !item
        ) {

            return false;

        }


        if (
            item.unique ||
            item.permanent ||
            item.quest ||
            item.starter
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


        /*
            PROTEÇÃO EXTRA:
            recursos usados no portão e
            ritual do Dash não entram
            no VENDER TUDO.
        */

        if (
            [
                "flautaMemoria",
                "fragmentoMemoria",
                "lanterna",
                "minimapa",
                "machado",
                "espadaSimples",
                "diamante",
                "rubi"
            ].includes(
                id
            )
        ) {

            return false;

        }


        return (
            (
                item.value ||
                0
            ) >
            0
        );

    }


    function sellItem(
        id,
        amount =
            1
    ) {

        const item =
            ITEMS[
                id
            ];


        if (
            !item ||
            !canSellItem(
                id
            ) ||
            !hasItem(
                id,
                amount
            )
        ) {

            return false;

        }


        const value =
            Math.max(
                1,
                Math.floor(
                    (
                        item.value ||
                        1
                    ) *
                    0.65
                )
            );


        removeItem(
            id,
            amount
        );


        state.player.money +=
            value *
            amount;


        showToast(
            `${item.name} vendido por ${value * amount} moedas.`
        );


        updateShop();


        return true;

    }


    function sellAllItems() {

        let money =
            0;


        let sold =
            0;


        Object.entries(
            state.player
                .inventory
        )
            .forEach(
                (
                    [
                        id,
                        amount
                    ]
                ) => {

                    if (
                        amount <=
                            0 ||
                        !canSellItem(
                            id
                        )
                    ) {

                        return;

                    }


                    const item =
                        ITEMS[
                            id
                        ];


                    const value =
                        Math.max(
                            1,
                            Math.floor(
                                (
                                    item.value ||
                                    1
                                ) *
                                0.65
                            )
                        );


                    money +=
                        value *
                        amount;


                    sold +=
                        amount;


                    state.player
                        .inventory[
                            id
                        ] =
                        0;

                }
            );


        if (
            sold <=
            0
        ) {

            showToast(
                "Nenhum item seguro para venda em massa."
            );


            return;

        }


        state.player.money +=
            money;


        showToast(
            `${sold} itens vendidos por ${money} moedas.`
        );


        updateShop();

    }


    /* =========================================================
       MODAIS DINÂMICOS
       ========================================================= */

    function ensureDynamicModal(
        id,
        eyebrow,
        title
    ) {

        let modal =
            $(
                id
            );


        if (
            modal
        ) {

            return modal;

        }


        modal =
            document
                .createElement(
                    "div"
                );


        modal.id =
            id;


        modal.className =
            "modal hidden";


        modal.innerHTML = `
            <div class="wide-panel">

                <button
                    class="close-btn panel-close"
                    type="button"
                    data-dynamic-close="${id}"
                >
                    ×
                </button>

                <p class="eyebrow">
                    ${eyebrow}
                </p>

                <h2 id="${id}Title">
                    ${title}
                </h2>

                <div id="${id}Content"></div>

            </div>
        `;


        must(
            "gameScreen"
        )
            .appendChild(
                modal
            );


        modal
            .querySelector(
                `[data-dynamic-close="${id}"]`
            )
            ?.addEventListener(
                "click",
                () => {

                    modal.classList
                        .add(
                            "hidden"
                        );

                }
            );


        return modal;

    }


    function closeDynamicModal(
        id
    ) {

        $(
            id
        )
            ?.classList
            .add(
                "hidden"
            );

    }


    /* =========================================================
       FORJA
       ========================================================= */

    function openForgePanel() {

        const modal =
            ensureDynamicModal(
                "forgePanelDynamic",
                "BORIN",
                "FORJA"
            );


        const content =
            $(
                "forgePanelDynamicContent"
            );


        content.innerHTML = `
            <p class="muted">
                Borin transforma sua armadura atual em uma versão superior.
                Cada melhoria exige a armadura anterior, materiais e moedas.
            </p>

            <div
                id="forgeGridDynamic"
                class="shop-grid"
            ></div>
        `;


        const grid =
            $(
                "forgeGridDynamic"
            );


        Object.entries(
            ARMOR_UPGRADES
        )
            .forEach(
                (
                    [
                        id,
                        recipe
                    ]
                ) => {

                    const item =
                        ITEMS[
                            id
                        ];


                    const previous =
                        ITEMS[
                            recipe.previous
                        ];


                    const materialText =
                        Object.entries(
                            recipe.materials
                        )
                            .map(
                                (
                                    [
                                        materialId,
                                        amount
                                    ]
                                ) => {

                                    const current =
                                        state.player
                                            .inventory[
                                                materialId
                                            ] ||
                                        0;


                                    return `${ITEMS[materialId].icon} ${ITEMS[materialId].name}: ${current}/${amount}`;

                                }
                            )
                            .join(
                                " • "
                            );


                    const ownsPrevious =
                        hasItem(
                            recipe.previous
                        );


                    const ownsTarget =
                        hasItem(
                            id
                        );


                    const row =
                        document
                            .createElement(
                                "div"
                            );


                    row.className =
                        "shop-row";


                    row.innerHTML = `
                        <div class="shop-icon">
                            ${item.icon}
                        </div>

                        <div class="shop-info">

                            <strong>
                                ${item.name}
                            </strong>

                            <small>
                                Necessário: ${previous.name}
                                <br>
                                ${materialText}
                                <br>
                                💰 ${state.player.money}/${recipe.money}
                            </small>

                        </div>

                        <button
                            class="primary-btn"
                            type="button"
                            ${ownsTarget ? "disabled" : ""}
                        >
                            ${ownsTarget ? "CRIADA" : "FORJAR"}
                        </button>
                    `;


                    const button =
                        row.querySelector(
                            "button"
                        );


                    if (
                        button &&
                        !ownsTarget
                    ) {

                        button.addEventListener(
                            "click",
                            () => {

                                craftArmor(
                                    id
                                );

                            }
                        );

                    }


                    if (
                        !ownsPrevious &&
                        !ownsTarget
                    ) {

                        row.style.opacity =
                            "0.72";

                    }


                    grid.appendChild(
                        row
                    );

                }
            );


        modal.classList
            .remove(
                "hidden"
            );

    }


    function craftArmor(
        targetId
    ) {

        const recipe =
            ARMOR_UPGRADES[
                targetId
            ];


        if (
            !recipe
        ) {

            return;

        }


        if (
            hasItem(
                targetId
            )
        ) {

            showToast(
                "Você já possui essa armadura."
            );


            return;

        }


        if (
            !hasItem(
                recipe.previous
            )
        ) {

            showToast(
                `Você precisa de ${ITEMS[recipe.previous].name}.`
            );


            return;

        }


        for (
            const [
                materialId,
                amount
            ]
            of Object.entries(
                recipe.materials
            )
        ) {

            if (
                !hasItem(
                    materialId,
                    amount
                )
            ) {

                showToast(
                    `Faltam ${ITEMS[materialId].name}.`
                );


                return;

            }

        }


        if (
            state.player.money <
            recipe.money
        ) {

            showToast(
                "Moedas insuficientes."
            );


            return;

        }


        const previousWasEquipped =
            state.player
                .equipment
                .armor ===
                recipe.previous;


        removeItem(
            recipe.previous,
            1
        );


        Object.entries(
            recipe.materials
        )
            .forEach(
                (
                    [
                        materialId,
                        amount
                    ]
                ) => {

                    removeItem(
                        materialId,
                        amount
                    );

                }
            );


        state.player.money -=
            recipe.money;


        addItem(
            targetId,
            1,

            {
                silent:
                    true,

                ignoreWeight:
                    true
            }
        );


        if (
            previousWasEquipped
        ) {

            state.player
                .equipment
                .armor =
                targetId;

        }


        createEffect(
            "forge",

            state.player.x,
            state.player.y,

            {
                color:
                    "#f19b4d",

                radius:
                    75,

                duration:
                    0.85
            }
        );


        showToast(
            `${ITEMS[targetId].name} criada!`
        );


        openForgePanel();

    }


    /* =========================================================
       STATUS
       ========================================================= */

    function openStatusPanel() {

        const modal =
            ensureDynamicModal(
                "statusPanelDynamic",
                "PROGRESSÃO",
                "STATUS"
            );


        const content =
            $(
                "statusPanelDynamicContent"
            );


        content.innerHTML = `
            <div
                id="statusPointsDynamic"
                class="quest-status"
            >
                Pontos disponíveis:
                <strong>
                    ${state.player.statPoints}
                </strong>

                <br>

                Nível:
                <strong>
                    ${state.player.level}/${MAX_LEVEL}
                </strong>
            </div>

            <div
                id="statusGridDynamic"
                class="shop-grid"
            ></div>
        `;


        const grid =
            $(
                "statusGridDynamic"
            );


        Object.entries(
            STAT_CONFIG
        )
            .forEach(
                (
                    [
                        key,
                        config
                    ]
                ) => {

                    const current =
                        state.player
                            .stats[
                                key
                            ] ||
                        0;


                    const row =
                        document
                            .createElement(
                                "div"
                            );


                    row.className =
                        "shop-row";


                    row.innerHTML = `
                        <div class="shop-icon">
                            ${config.icon}
                        </div>

                        <div class="shop-info">

                            <strong>
                                ${config.name}
                                — ${current}/${config.cap}
                            </strong>

                            <small>
                                ${config.description}
                            </small>

                        </div>

                        <button
                            class="primary-btn"
                            type="button"
                            ${
                                state.player.statPoints <= 0 ||
                                current >= config.cap

                                    ? "disabled"
                                    : ""
                            }
                        >
                            +1
                        </button>
                    `;


                    row
                        .querySelector(
                            "button"
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                addStatPoint(
                                    key
                                );

                            }
                        );


                    grid.appendChild(
                        row
                    );

                }
            );


        modal.classList
            .remove(
                "hidden"
            );

    }


    function addStatPoint(
        key
    ) {

        const player =
            state.player;


        const config =
            STAT_CONFIG[
                key
            ];


        if (
            !player ||
            !config ||
            player.statPoints <=
                0
        ) {

            return false;

        }


        const current =
            player.stats[
                key
            ] ||
            0;


        if (
            current >=
            config.cap
        ) {

            showToast(
                `${config.name} atingiu o limite.`
            );


            return false;

        }


        const oldMaxHp =
            player.maxHp;


        const oldMaxEnergy =
            player.maxEnergy;


        const oldMaxHunger =
            player.maxHunger;


        const oldMaxFatigue =
            player.maxFatigue;


        player.stats[
            key
        ] =
            current +
            1;


        player.statPoints--;


        applyStatBonuses(
            false
        );


        if (
            key ===
            "hp"
        ) {

            player.hp +=
                player.maxHp -
                oldMaxHp;

        }


        if (
            key ===
            "energy"
        ) {

            player.energy +=
                player.maxEnergy -
                oldMaxEnergy;

        }


        if (
            key ===
            "hunger"
        ) {

            player.hunger +=
                player.maxHunger -
                oldMaxHunger;

        }


        if (
            key ===
            "fatigue"
        ) {

            player.fatigue +=
                player.maxFatigue -
                oldMaxFatigue;

        }


        player.hp =
            clamp(
                player.hp,
                0,
                player.maxHp
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


        openStatusPanel();


        return true;

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function getNextGateDialogue(
        side
    ) {

        const messages =
            GATE_DIALOGUES[
                side
            ];


        if (
            !messages
        ) {

            return [
                "Este caminho ainda não está disponível."
            ];

        }


        const current =
            state.player
                .gateDialogueIndex[
                    side
                ] ||
            0;


        const pair =
            messages[
                current %
                messages.length
            ];


        state.player
            .gateDialogueIndex[
                side
            ] =
            (
                current +
                1
            ) %
            messages.length;


        return pair;

    }


    function openInformationModal(
        id,
        eyebrow,
        title,
        html,
        buttons = []
    ) {

        const modal =
            ensureDynamicModal(
                id,
                eyebrow,
                title
            );


        const content =
            $(
                `${id}Content`
            );


        content.innerHTML =
            html;


        if (
            buttons.length
        ) {

            const actions =
                document
                    .createElement(
                        "div"
                    );


            actions.className =
                "modal-actions";


            buttons.forEach(
                buttonConfig => {

                    const button =
                        document
                            .createElement(
                                "button"
                            );


                    button.type =
                        "button";


                    button.className =
                        buttonConfig.primary ===
                            false

                            ? "secondary-btn"
                            : "primary-btn";


                    button.textContent =
                        buttonConfig.label;


                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                typeof buttonConfig.onClick ===
                                "function"
                            ) {

                                buttonConfig.onClick();

                            }

                        }
                    );


                    actions.appendChild(
                        button
                    );

                }
            );


            content.appendChild(
                actions
            );

        }


        modal.classList
            .remove(
                "hidden"
            );


        return modal;

    }


    function interactGate(
        gate
    ) {

        if (
            !gate ||
            !state.player
        ) {

            return;

        }


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
                        arrivalSide:
                            "left"
                    }
                );


                return;

            }


            if (
                !hasAbility(
                    "dash"
                )
            ) {

                const pair =
                    getNextGateDialogue(
                        "north"
                    );


                startDialogue({

                    name:
                        "PORTÃO DO NORTE",

                    lines:
                        pair

                });


                return;

            }


            const currentDiamond =
                state.player
                    .inventory
                    .diamante ||
                0;


            const currentRuby =
                state.player
                    .inventory
                    .rubi ||
                0;


            const needDiamond =
                NORTH_GATE_REQUIREMENTS
                    .diamante;


            const needRuby =
                NORTH_GATE_REQUIREMENTS
                    .rubi;


            if (
                currentDiamond <
                    needDiamond ||
                currentRuby <
                    needRuby
            ) {

                openInformationModal(

                    "gatePanelDynamic",

                    "PORTÃO DO NORTE",

                    "PREPARAÇÃO INCOMPLETA",

                    `
                        <p class="muted">
                            Você domina a técnica necessária, mas sua preparação ainda está incompleta.
                        </p>

                        <div class="quest-status">
                            💎 Diamante:
                            ${currentDiamond} / ${needDiamond}
                            — faltam
                            ${Math.max(0, needDiamond - currentDiamond)}
                        </div>

                        <div class="quest-status">
                            ♦️ Rubi:
                            ${currentRuby} / ${needRuby}
                            — faltam
                            ${Math.max(0, needRuby - currentRuby)}
                        </div>
                    `
                );


                return;

            }


            openInformationModal(

                "gatePanelDynamic",

                "PORTÃO DO NORTE",

                "ABRIR CAMINHO?",

                `
                    <p class="muted">
                        Você domina a técnica necessária e possui os materiais.
                    </p>

                    <div class="quest-status">
                        💎 ${needDiamond} Diamantes
                        <br>
                        ♦️ ${needRuby} Rubis
                    </div>

                    <p class="muted">
                        Os materiais serão consumidos permanentemente.
                    </p>
                `,

                [
                    {
                        label:
                            "ABRIR PORTÃO",

                        onClick:
                            () => {

                                unlockNorthGate();

                            }
                    },

                    {
                        label:
                            "CANCELAR",

                        primary:
                            false,

                        onClick:
                            () => {

                                closeDynamicModal(
                                    "gatePanelDynamic"
                                );

                            }
                    }
                ]
            );


            return;

        }


        /*
            ROTA 3 E 4:
            SEM SPOILER DA HABILIDADE FUTURA.
        */

        const pair =
            getNextGateDialogue(
                side
            );


        startDialogue({

            name:
                gate.title,

            lines:
                pair

        });

    }


    function unlockNorthGate() {

        const needDiamond =
            NORTH_GATE_REQUIREMENTS
                .diamante;


        const needRuby =
            NORTH_GATE_REQUIREMENTS
                .rubi;


        if (
            !hasAbility(
                "dash"
            ) ||
            !hasItem(
                "diamante",
                needDiamond
            ) ||
            !hasItem(
                "rubi",
                needRuby
            )
        ) {

            closeDynamicModal(
                "gatePanelDynamic"
            );


            return false;

        }


        removeItem(
            "diamante",
            needDiamond
        );


        removeItem(
            "rubi",
            needRuby
        );


        state.player
            .gateUnlocks
            .north =
            true;


        closeDynamicModal(
            "gatePanelDynamic"
        );


        showToast(
            "O Portão do Norte foi aberto."
        );


        createEffect(
            "gateUnlock",

            state.player.x,
            state.player.y,

            {
                radius:
                    110,

                duration:
                    1,

                color:
                    "#82a5c8"
            }
        );


        transitionToRegion(
            "shadow",

            {
                arrivalSide:
                    "left"
            }
        );


        return true;

    }


    /* =========================================================
       ALTAR DO DASH
       ========================================================= */

    function getDashRitualStatus() {

        const ruby =
            state.player
                .inventory
                .rubi ||
            0;


        const diamond =
            state.player
                .inventory
                .diamante ||
            0;


        return {
            ruby,
            diamond,

            enough:
                ruby >=
                    DASH_RUBY_COST &&
                diamond >=
                    DASH_DIAMOND_COST
        };

    }


    function interactDashAltar() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        if (
            player.dashPurchased ||
            hasAbility(
                "dash"
            )
        ) {

            startDialogue({

                name:
                    "ALTAR",

                lines: [

                    "O altar está silencioso.",

                    "O poder que dormia aqui agora existe dentro de você."

                ]

            });


            return;

        }


        if (
            player.monarchDefeated
        ) {

            const status =
                getDashRitualStatus();


            if (
                !status.enough
            ) {

                openInformationModal(

                    "altarPanelDynamic",

                    "ALTAR DO PODER",

                    "O RITUAL AINDA NÃO PODE SER CONCLUÍDO",

                    `
                        <p class="muted">
                            O Monarca foi derrotado, mas o altar ainda exige a oferenda completa.
                        </p>

                        <div class="quest-status">
                            ♦️ Rubi:
                            ${status.ruby}/${DASH_RUBY_COST}
                            — faltam
                            ${Math.max(0, DASH_RUBY_COST - status.ruby)}
                        </div>

                        <div class="quest-status">
                            💎 Diamante:
                            ${status.diamond}/${DASH_DIAMOND_COST}
                            — faltam
                            ${Math.max(0, DASH_DIAMOND_COST - status.diamond)}
                        </div>
                    `
                );


                return;

            }


            openInformationModal(

                "altarPanelDynamic",

                "ALTAR DO PODER",

                "REIVINDICAR O PODER",

                `
                    <p class="muted">
                        O poder do Monarca não possui mais dono.
                    </p>

                    <div class="quest-status">
                        ♦️ ${DASH_RUBY_COST} Rubis
                        <br>
                        💎 ${DASH_DIAMOND_COST} Diamantes
                    </div>

                    <p class="muted">
                        Concluir o ritual consumirá a oferenda e desbloqueará o Dash permanentemente.
                    </p>
                `,

                [
                    {
                        label:
                            "CONCLUIR RITUAL",

                        onClick:
                            claimDashFromAltar
                    },

                    {
                        label:
                            "AGORA NÃO",

                        primary:
                            false,

                        onClick:
                            () => {

                                closeDynamicModal(
                                    "altarPanelDynamic"
                                );

                            }
                    }
                ]
            );


            return;

        }


        if (
            player.monarchAwakened
        ) {

            const monarch =
                state.world
                    .enemies
                    .find(
                        enemy =>
                            enemy.id ===
                                "monarch" &&
                            !enemy.dead
                    );


            if (
                monarch
            ) {

                startDialogue({

                    name:
                        "ALTAR",

                    lines: [

                        "O poder ainda está preso ao Monarca.",

                        "Enquanto ele existir, a técnica não poderá ser reivindicada."

                    ]

                });


                monarch.aggressive =
                    true;


                return;

            }

        }


        const status =
            getDashRitualStatus();


        if (
            !status.enough
        ) {

            openInformationModal(

                "altarPanelDynamic",

                "ALTAR DO PODER",

                "A OFERENDA É INSUFICIENTE",

                `
                    <p class="muted">
                        As inscrições do altar despertam sob seus pés.
                    </p>

                    <p class="muted">
                        Por um instante, uma força tenta alcançar você... mas o brilho desaparece.
                    </p>

                    <p class="muted">
                        A oferenda é insuficiente para despertar o poder adormecido.
                    </p>

                    <div class="quest-status">
                        ♦️ Rubi:
                        ${status.ruby}/${DASH_RUBY_COST}
                        — faltam
                        ${Math.max(0, DASH_RUBY_COST - status.ruby)}
                    </div>

                    <div class="quest-status">
                        💎 Diamante:
                        ${status.diamond}/${DASH_DIAMOND_COST}
                        — faltam
                        ${Math.max(0, DASH_DIAMOND_COST - status.diamond)}
                    </div>
                `
            );


            return;

        }


        openInformationModal(

            "altarPanelDynamic",

            "ALTAR DO PODER",

            "DESPERTAR O ALTAR?",

            `
                <p class="muted">
                    Rubis e Diamantes respondem às inscrições antigas.
                </p>

                <p class="muted">
                    A oferenda parece suficiente para despertar algo.
                </p>

                <div class="quest-status">
                    Os materiais NÃO serão consumidos antes da batalha.
                </div>
            `,

            [
                {
                    label:
                        "DESPERTAR",

                    onClick:
                        () => {

                            closeDynamicModal(
                                "altarPanelDynamic"
                            );


                            player.monarchAwakened =
                                true;


                            spawnMonarch(
                                true
                            );

                        }
                },

                {
                    label:
                        "RECUAR",

                    primary:
                        false,

                    onClick:
                        () => {

                            closeDynamicModal(
                                "altarPanelDynamic"
                            );

                        }
                }
            ]
        );

    }


    function claimDashFromAltar() {

        const status =
            getDashRitualStatus();


        if (
            !state.player
                .monarchDefeated ||
            !status.enough ||
            state.player
                .dashPurchased
        ) {

            return false;

        }


        removeItem(
            "rubi",
            DASH_RUBY_COST
        );


        removeItem(
            "diamante",
            DASH_DIAMOND_COST
        );


        state.player
            .abilities
            .dash =
            true;


        state.player
            .dashPurchased =
            true;


        closeDynamicModal(
            "altarPanelDynamic"
        );


        createEffect(
            "dashUnlock",

            state.player.x,
            state.player.y,

            {
                radius:
                    150,

                duration:
                    1.3,

                color:
                    "#d6c1ef"
            }
        );


        burstParticles(
            state.player.x,
            state.player.y,

            "#d6c1ef",

            42,

            150
        );


        shakeScreen(
            13,
            0.38
        );


        startDialogue({

            name:
                "ALTAR",

            lines: [

                "O poder atravessa seu corpo sem feri-lo.",

                "Por um instante, o mundo parece lento.",

                "DASH DESBLOQUEADO.",

                "Pressione ESPAÇO para avançar rapidamente na direção do mouse.",

                "O Dash não causa dano. Ele existe para movimento e esquiva."

            ]

        });


        return true;

    }


    /* =========================================================
       HORDAS DO CÉU
       ========================================================= */

    function interactSkyTrial() {

        const trial =
            state.player
                .skyTrial;


        if (
            trial.complete
        ) {

            startDialogue({

                name:
                    "ALTAR",

                lines: [

                    "As cinco hordas já foram vencidas.",

                    "O Guardião do Caminho reconheceu sua presença."

                ]

            });


            if (
                !hasDefeatedBoss(
                    "path_guardian"
                )
            ) {

                spawnPathGuardian();

            }


            return;

        }


        if (
            trial.activeWave >
            0
        ) {

            showToast(
                `Horda ${trial.activeWave}/5 ainda está em andamento.`
            );


            return;

        }


        trial.started =
            true;


        startNextSkyWave();

    }


    function startNextSkyWave() {

        const trial =
            state.player
                .skyTrial;


        if (
            trial.complete ||
            trial.activeWave >
                0
        ) {

            return;

        }


        const next =
            trial.wave +
            1;


        if (
            next >
            5
        ) {

            trial.complete =
                true;


            trial.activeWave =
                0;


            spawnPathGuardian();


            showToast(
                "As cinco hordas foram vencidas. O Guardião do Caminho surgiu!"
            );


            return;

        }


        trial.activeWave =
            next;


        const counts =
            [
                0,
                4,
                6,
                7,
                8,
                10
            ];


        const count =
            counts[
                next
            ];


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const strong =
                next >=
                    3 &&
                i %
                3 ===
                0;


            const elite =
                next >=
                    4 &&
                i %
                4 ===
                0;


            addEnemy({

                id:
                    `sky_wave_${next}_${i}_${Date.now()}`,

                skyWave:
                    next,

                x:
                    1300 +
                    random(
                        -430,
                        430
                    ),

                y:
                    1110 +
                    random(
                        -480,
                        480
                    ),

                name:
                    elite

                        ? "CAVALEIRO CELESTIAL"

                        : strong

                        ? "SENTINELA CELESTIAL"

                        : "SERVO CELESTIAL",

                icon:
                    elite

                        ? "🛡️"

                        : strong

                        ? "🪽"

                        : "☁️",

                type:
                    "normal",

                hp:
                    310 +
                    next *
                    65 +
                    (
                        elite
                            ? 180
                            : strong
                              ? 80
                              : 0
                    ),

                damage:
                    30 +
                    next *
                    5 +
                    (
                        elite
                            ? 10
                            : 0
                    ),

                speed:
                    elite
                        ? 72
                        : strong
                          ? 90
                          : 105,

                vision:
                    700,

                attackRange:
                    elite
                        ? 95
                        : 72,

                radius:
                    elite
                        ? 29
                        : 24,

                color:
                    elite
                        ? "#d8c681"
                        : "#c7d4dc",

                drop:
                    next >=
                        4

                        ? "diamante"
                        : "ouro",

                dropAmount:
                    1,

                dropChance:
                    0.35,

                aggressive:
                    true,

                accepted:
                    true,

                special:
                    next >=
                        3 &&
                    i %
                    2 ===
                    0

                        ? "telegraphedCharge"
                        : null

            });

        }


        showToast(
            `HORDA ${next}/5 INICIADA`
        );

    }


    function updateSkyTrial() {

        if (
            state.area !==
                "sky" ||
            !state.player
                ?.skyTrial
        ) {

            return;

        }


        const trial =
            state.player
                .skyTrial;


        if (
            trial.activeWave <=
            0
        ) {

            return;

        }


        const alive =
            state.world
                .enemies
                .some(
                    enemy =>
                        enemy.skyWave ===
                            trial.activeWave &&
                        !enemy.dead
                );


        if (
            alive
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

            trial.complete =
                true;


            spawnPathGuardian();


            showToast(
                "TODAS AS HORDAS FORAM VENCIDAS!"
            );


            return;

        }


        showToast(
            `Horda ${trial.wave}/5 concluída. Interaja com o altar para iniciar a próxima.`
        );

    }


    /* =========================================================
       FLAUTA DA MEMÓRIA
       ========================================================= */

    function playMemoryFlute() {

        if (
            !hasItem(
                "flautaMemoria"
            )
        ) {

            showToast(
                "Você não possui a Flauta da Memória."
            );


            return false;

        }


        if (
            state.area !==
                "village"
        ) {

            startDialogue({

                name:
                    "Flauta da Memória",

                lines: [

                    "A melodia ecoa pelo lugar.",

                    "Nenhuma passagem responde aqui."

                ]

            });


            return false;

        }


        state.player
            .flutePlayed =
            true;


        createEffect(
            "memoryFlute",

            state.player.x,
            state.player.y,

            {
                radius:
                    180,

                duration:
                    1.4,

                color:
                    "#dcc783"
            }
        );


        startDialogue({

            name:
                "VEYRA",

            lines: [

                "A música atravessa a Vila do Crepúsculo.",

                "As pedras ao sul estremecem.",

                "Por um momento, você vê degraus onde antes havia apenas terra.",

                "A Escada do Inferno foi lembrada."

            ]

        });


        return true;

    }


    /* =========================================================
       PORTAIS / VIAGEM
       ========================================================= */

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
                "hell_stair",

            x:
                1510,

            y:
                1950,

            w:
                180,

            h:
                100,

            target:
                "hell",

            requirement:
                () =>
                    state.player
                        .flutePlayed,

            title:
                "ESCADA DO INFERNO",

            direction:
                "forward",

            arrivalSide:
                "left",

            specialEntrance:
                true
        };

    }


    function getAllActivePortals() {

        const portals =
            [
                ...state.world
                    .portals
            ];


        const hell =
            getHellStairPortal();


        if (
            hell
        ) {

            portals.push(
                hell
            );

        }


        return portals;

    }


    function checkPortals() {

        if (
            !state.player ||
            state.paused ||
            state.houseMode ||
            state.portalCooldown >
                0
        ) {

            return;

        }


        for (
            const portal of
            getAllActivePortals()
        ) {

            const inside =
                pointInsideRect(
                    state.player.x,
                    state.player.y,
                    portal
                );


            if (
                !inside
            ) {

                continue;

            }


            const unlocked =
                typeof portal
                    .requirement ===
                    "function"

                    ? portal
                        .requirement()

                    : true;


            if (
                !unlocked
            ) {

                const now =
                    performance.now();


                if (
                    now -
                    state.warnedNeedAt >
                    1200
                ) {

                    state.warnedNeedAt =
                        now;


                    showToast(
                        "Este caminho ainda está bloqueado."
                    );

                }


                if (
                    portal.direction ===
                    "back"
                ) {

                    state.player.x +=
                        45;

                }

                else {

                    state.player.x -=
                        45;

                }


                state.portalCooldown =
                    0.8;


                return;

            }


            openTravel(
                portal
            );


            return;

        }

    }


    function openTravel(
        portal
    ) {

        if (
            state.travel
        ) {

            return;

        }


        state.travel = {
            ...portal
        };


        state.paused =
            true;


        state.pauseReason =
            "travel";


        must(
            "travelText"
        ).textContent =
            `Você encontrou um caminho para ${portal.title}. Deseja continuar?`;


        must(
            "travelPanel"
        )
            .classList
            .remove(
                "hidden"
            );

    }


    function confirmTravel() {

        const portal =
            state.travel;


        if (
            !portal
        ) {

            return;

        }


        must(
            "travelPanel"
        )
            .classList
            .add(
                "hidden"
            );


        state.travel =
            null;


        state.paused =
            false;


        state.pauseReason =
            null;


        transitionToRegion(
            portal.target,

            {
                arrivalSide:
                    portal.arrivalSide ||
                    (
                        portal.direction ===
                            "back"

                            ? "right"
                            : "left"
                    ),

                label:
                    REGIONS[
                        portal.target
                    ]
                        ?.name ||
                    portal.title
            }
        );

    }


    function cancelTravel() {

        state.travel =
            null;


        state.paused =
            false;


        state.pauseReason =
            null;


        state.portalCooldown =
            1.1;


        must(
            "travelPanel"
        )
            .classList
            .add(
                "hidden"
            );

    }


    /* =========================================================
       BATTLE PANEL
       ========================================================= */

    function openBattle(
        enemy
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return;

        }


        state.battle =
            enemy;


        state.paused =
            true;


        state.pauseReason =
            "battle";


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


        must(
            "battleIcon"
        ).textContent =
            enemy.icon ||
            "☠";


        must(
            "battleTitle"
        ).textContent =
            enemy.name;


        must(
            "battleText"
        ).textContent =
            enemy.finalBoss

                ? "A pessoa diante de você possui seu rosto, sua postura e uma memória impossível."

                : "Este é um boss de progressão. Se aceitar, ele atacará até que um de vocês caia.";


        must(
            "battlePanel"
        )
            .classList
            .remove(
                "hidden"
            );

    }


    function acceptBattle() {

        const enemy =
            state.battle;


        if (
            !enemy
        ) {

            return;

        }


        if (
            enemy.finalBoss &&
            !state.finalChoiceShown
        ) {

            must(
                "battlePanel"
            )
                .classList
                .add(
                    "hidden"
                );


            state.paused =
                false;


            state.pauseReason =
                null;


            state.battle =
                null;


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
            "combat";


        state.bossBarTarget =
            enemy;


        state.battle =
            null;


        state.paused =
            false;


        state.pauseReason =
            null;


        must(
            "battlePanel"
        )
            .classList
            .add(
                "hidden"
            );


        showToast(
            `${enemy.name} iniciou a batalha!`
        );

    }


    function declineBattle() {

        state.battle =
            null;


        state.paused =
            false;


        state.pauseReason =
            null;


        must(
            "battlePanel"
        )
            .classList
            .add(
                "hidden"
            );


        state.portalCooldown =
            0.8;

    }


    /* =========================================================
       ESCOLHA FINAL
       ========================================================= */

    function openFinalChoice(
        enemy
    ) {

        state.finalChoiceShown =
            true;


        openInformationModal(

            "finalChoicePanelDynamic",

            "CÂMARA FINAL",

            "O OUTRO EU",

            `
                <p class="muted">
                    “Você ainda acredita que lembrar é sempre melhor?”
                </p>

                <p class="muted">
                    “Se nada puder ser lembrado, nada poderá sofrer.”
                </p>

                <div class="quest-status">
                    Você precisa decidir.
                </div>
            `,

            [
                {
                    label:
                        "LUTAR",

                    onClick:
                        () => {

                            closeDynamicModal(
                                "finalChoicePanelDynamic"
                            );


                            enemy.accepted =
                                true;


                            enemy.aggressive =
                                true;


                            state.bossBarTarget =
                                enemy;


                            state.player
                                .finalChoice =
                                "fight";


                            showToast(
                                "Você rejeitou a Quietude Absoluta."
                            );

                        }
                },

                {
                    label:
                        "JUNTAR-SE A ELE",

                    primary:
                        false,

                    onClick:
                        () => {

                            closeDynamicModal(
                                "finalChoicePanelDynamic"
                            );


                            state.player
                                .finalChoice =
                                "join";


                            state.player
                                .finalDefeated =
                                true;


                            enemy.dead =
                                true;


                            enemy.hp =
                                0;


                            state.bossBarTarget =
                                null;


                            startDialogue({

                                name:
                                    "QUIETUDE ABSOLUTA",

                                lines: [

                                    "Você aceita a mão estendida pelo Outro Eu.",

                                    "Nenhuma espada é levantada.",

                                    "Nenhum feitiço é lançado.",

                                    "Juntos, vocês permitem que o mundo finalmente esqueça tudo.",

                                    "Inclusive vocês mesmos."

                                ]

                            });

                        }
                }
            ]
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
            player.dead ||
            state.paused
        ) {

            return;

        }


        if (
            state.houseMode &&
            state.currentHouse
                ?.id ===
                "home"
        ) {

            player.checkpoint = {

                area:
                    "village",

                x:
                    state.houseReturn
                        ?.x ||
                    500,

                y:
                    state.houseReturn
                        ?.y ||
                    1120,

                houseId:
                    "home",

                insideHouse:
                    true

            };


            return;

        }


        if (
            REGIONS[
                state.area
            ]
                ?.checkpoint
        ) {

            player.checkpoint = {

                area:
                    state.area,

                x:
                    player.x,

                y:
                    player.y,

                houseId:
                    null,

                insideHouse:
                    false

            };

        }

    }


    /* =========================================================
       CÂMERA
       ========================================================= */

    function updateCamera() {

        if (
            !state.player
        ) {

            return;

        }


        const viewportWidth =
            window.innerWidth;


        const viewportHeight =
            window.innerHeight;


        const targetX =
            state.player.x -
            viewportWidth /
            2;


        const targetY =
            state.player.y -
            viewportHeight /
            2;


        const maxX =
            Math.max(
                0,
                state.world.width -
                viewportWidth
            );


        const maxY =
            Math.max(
                0,
                state.world.height -
                viewportHeight
            );


        state.camera.x =
            clamp(
                lerp(
                    state.camera.x,
                    targetX,
                    0.16
                ),

                0,
                maxX
            );


        state.camera.y =
            clamp(
                lerp(
                    state.camera.y,
                    targetY,
                    0.16
                ),

                0,
                maxY
            );


        state.pointer.worldX =
            state.pointer.x +
            state.camera.x;


        state.pointer.worldY =
            state.pointer.y +
            state.camera.y;

    }


    /* =========================================================
       INTERAÇÃO DE PORTA AUTOMÁTICA
       ========================================================= */

    function updateDoorAnimations(
        dt
    ) {

        if (
            state.houseMode
        ) {

            return;

        }


        for (
            const door of
            state.world
                .doors
        ) {

            const d =
                Math.hypot(
                    state.player.x -
                        door.cx,

                    state.player.y -
                        door.cy
                );


            const target =
                d <
                105
                    ? 1
                    : 0;


            door.animation =
                lerp(
                    door.animation,
                    target,
                    Math.min(
                        1,
                        dt *
                        8
                    )
                );


            door.open =
                door.animation >
                0.55;

        }

    }


    /* =========================================================
       LOOT / PROGRESSÃO
       ========================================================= */

    function repairProgressionRewards() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        if (
            hasDefeatedBoss(
                "path_guardian"
            ) &&
            !hasItem(
                "flautaMemoria"
            ) &&
            state.area ===
                "sky" &&
            !state.world
                .drops
                .some(
                    drop =>
                        drop.itemId ===
                        "flautaMemoria"
                )
        ) {

            createWorldDrop(
                3030,
                1120,

                "flautaMemoria",
                1,

                {
                    unique:
                        true,

                    persistent:
                        true,

                    life:
                        Infinity
                }
            );

        }


        if (
            player.monarchDefeated &&
            player.dashPurchased
        ) {

            player.abilities
                .dash =
                true;

        }


        if (
            player.inventory
                .minimapa >
                0
        ) {

            player.minimapOwned =
                true;

        }


        if (
            player.inventory
                .lanterna >
                0
        ) {

            player.lanternOwned =
                true;

        }

    }


    /* =========================================================
       UTILIDADE DO INVENTÁRIO
       ========================================================= */

    function protectedInventoryItem(
        id
    ) {

        if (
            !ITEMS[
                id
            ]
        ) {

            return true;

        }


        return (
            !canSellItem(
                id
            )
        );

    }


    /* =========================================================
       SAÍDAS / PORTAIS DA VILA
       ========================================================= */

    function updateVillageSpecialPaths() {

        if (
            state.area !==
                "village" ||
            state.houseMode
        ) {

            return;

        }


        /*
            NORTE:
            só passa se o portão foi
            efetivamente desbloqueado.
        */

        if (
            state.player
                .gateUnlocks
                .north
        ) {

            const north =
                state.world
                    .gates
                    .find(
                        gate =>
                            gate.side ===
                            "north"
                    );


            if (
                north &&
                pointInsideRect(
                    state.player.x,
                    state.player.y,
                    {
                        x:
                            north.x -
                            10,

                        y:
                            north.y -
                            10,

                        w:
                            north.w +
                            20,

                        h:
                            north.h +
                            20
                    }
                )
            ) {

                transitionToRegion(
                    "shadow",

                    {
                        arrivalSide:
                            "left"
                    }
                );


                return;

            }

        }

    }


    /* =========================================================
       GERAL — PÓS BOSS
       ========================================================= */

    function handleBossProgression() {

        if (
            !state.player
        ) {

            return;

        }


        /*
            Áreas da Rota 1 já são
            liberadas pelos portais
            condicionados aos bosses.

            Aqui garantimos que a área
            fique registrada.
        */

        const progressionMap = {

            road_guardian:
                "forest",

            forest_guardian:
                "grove",

            grove_guardian:
                "mountains",

            mountain_guardian:
                "iron",

            iron_guardian:
                "ruby",

            ruby_guardian:
                "monarchMaze",

            shadow_guardian:
                "fairy",

            thread_guardian:
                "sky"

        };


        Object.entries(
            progressionMap
        )
            .forEach(
                (
                    [
                        bossId,
                        area
                    ]
                ) => {

                    if (
                        hasDefeatedBoss(
                            bossId
                        ) &&
                        !state.player
                            .unlockedAreas
                            .includes(
                                area
                            )
                    ) {

                        state.player
                            .unlockedAreas
                            .push(
                                area
                            );

                    }

                }
            );

    }


    /* =========================================================
       PORTÃO SUL APÓS FLAUTA
       ========================================================= */

    function canRevealHellPath() {

        return Boolean(
            state.player
                ?.flutePlayed &&
            hasItem(
                "flautaMemoria"
            )
        );

    }


    /* =========================================================
       PASSAGEM DO FINAL
       ========================================================= */

    function getHellProgressStatus() {

        const types =
            Object.values(
                state.player
                    ?.hellTypesDefeated ||
                {}
            )
                .filter(
                    Boolean
                )
                .length;


        return {

            types,

            guardian:
                hasDefeatedBoss(
                    "hell_supreme_guardian"
                ),

            complete:
                types >=
                    5 &&
                hasDefeatedBoss(
                    "hell_supreme_guardian"
                )

        };

    }


    /* =========================================================
       ANTI-EXPLOIT BÁSICO
       ========================================================= */

    function sanitizeRuntimePlayer() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        player.money =
            Math.max(
                0,
                Math.floor(
                    Number(
                        player.money
                    ) ||
                    0
                )
            );


        player.statPoints =
            clamp(
                Math.floor(
                    Number(
                        player.statPoints
                    ) ||
                    0
                ),

                0,
                MAX_LEVEL *
                POINTS_PER_LEVEL
            );


        Object.keys(
            STAT_CONFIG
        )
            .forEach(
                key => {

                    player.stats[
                        key
                    ] =
                        clamp(
                            Math.floor(
                                Number(
                                    player.stats[
                                        key
                                    ]
                                ) ||
                                0
                            ),

                            0,
                            STAT_CONFIG[
                                key
                            ]
                                .cap
                        );

                }
            );


        Object.keys(
            player.inventory
        )
            .forEach(
                id => {

                    player.inventory[
                        id
                    ] =
                        Math.max(
                            0,
                            Math.floor(
                                Number(
                                    player.inventory[
                                        id
                                    ]
                                ) ||
                                0
                            )
                        );

                }
            );


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


    /* =========================================================
       UPDATE GERAL DOS SISTEMAS DA PARTE 2

       O update principal que chama tudo fica
       na PARTE 3.
       ========================================================= */

    function updatePartTwoSystems(
        dt
    ) {

        if (
            !state.player
        ) {

            return;

        }


        updatePlayerTimers(
            dt
        );


        updateMovement(
            dt
        );


        updateSurvival(
            dt
        );


        updateNPCs(
            dt
        );


        updateEnemies(
            dt
        );


        updateHazards(
            dt
        );


        updateResources(
            dt
        );


        updateHoldAction(
            dt
        );


        updateDoorAnimations(
            dt
        );


        updateVisualEffects(
            dt
        );


        updateDamageScreenEffect(
            dt
        );


        updateSkyTrial();


        checkPortals();


        updateVillageSpecialPaths();


        handleBossProgression();


        repairProgressionRewards();


        updateCheckpoint();


        sanitizeRuntimePlayer();


        if (
            state.portalCooldown >
            0
        ) {

            state.portalCooldown =
                Math.max(
                    0,
                    state.portalCooldown -
                    dt
                );

        }

    }


    /* =========================================================
       FIM DA PARTE 2/3

       NÃO FECHA A IIFE AQUI.

       A PARTE 3 COMEÇA LOGO ABAIXO.
       ========================================================= */
     /* =========================================================
       PARTE 3/3
       VEYRA: A QUIETUDE — REBUILD V18

       CONTINUAÇÃO DIRETA DA PARTE 2.

       CONTÉM:
       - HUD
       - inventário / livro / mapa
       - renderização completa
       - portas externas e internas visíveis
       - interiores diferentes
       - labirinto escuro + lanterna
       - minimapa comprado
       - barra de boss
       - tela vermelha + sangue
       - transições desenhadas no canvas
       - save / load / migração
       - teclado / mouse / botões
       - game loop
       - fechamento da IIFE
       ========================================================= */

    function setBar(id, value, max) {

        const element =
            $(id);

        if (
            !element
        ) {

            return;

        }

        const percent =
            max > 0
                ? clamp(
                    value /
                    max *
                    100,

                    0,
                    100
                )
                : 0;

        element.style.width =
            `${percent}%`;

    }


    function isGameplayOverlayOpen() {

        const ids = [

            "inventoryPanel",

            "mapPanel",

            "bookPanel",

            "shopPanel",

            "questPanel",

            "forgePanelDynamic",

            "statusPanelDynamic",

            "gatePanelDynamic",

            "altarPanelDynamic",

            "finalChoicePanelDynamic"

        ];


        return ids.some(
            id => {

                const el =
                    $(id);


                return (
                    el &&
                    !el.classList
                        .contains(
                            "hidden"
                        )
                );

            }
        );

    }


    function closeAllGameplayPanels(
        exceptId =
            null
    ) {

        [

            "inventoryPanel",

            "mapPanel",

            "bookPanel",

            "shopPanel",

            "questPanel",

            "forgePanelDynamic",

            "statusPanelDynamic",

            "gatePanelDynamic",

            "altarPanelDynamic",

            "finalChoicePanelDynamic"

        ]
            .forEach(
                id => {

                    if (
                        id ===
                        exceptId
                    ) {

                        return;

                    }


                    $(id)
                        ?.classList
                        .add(
                            "hidden"
                        );

                }
            );

    }


    /* =========================================================
       COLISÃO FINAL DOS PORTÕES

       Substitui a versão da Parte 2,
       mantendo as colisões anteriores
       e fazendo portões fechados serem sólidos.
       ========================================================= */

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

            if (
                !isInsideHouseRoom(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }


            if (
                collidesWithHouseFurniture(
                    x,
                    y,
                    radius
                )
            ) {

                return false;

            }


            for (
                const npc of
                getHouseInteriorNPCs()
            ) {

                if (
                    circleCircleCollision(
                        x,
                        y,
                        radius,

                        npc.x,
                        npc.y,
                        npc.radius
                    )
                ) {

                    return false;

                }

            }


            return true;

        }


        if (
            x -
            radius <
                72 ||
            y -
            radius <
                72 ||
            x +
            radius >
                state.world.width -
                72 ||
            y +
            radius >
                state.world.height -
                72
        ) {

            return false;

        }


        for (
            const obstacle of
            state.world
                .obstacles
        ) {

            if (
                !isAliveTreeObstacle(
                    obstacle
                )
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

                return false;

            }

        }


        for (
            const gate of
            state.world
                .gates
        ) {

            const unlocked =
                Boolean(
                    state.player
                        .gateUnlocks
                        ?.[
                            gate.side
                        ]
                );


            if (
                !unlocked &&
                circleRectCollision(
                    x,
                    y,
                    radius,
                    gate
                )
            ) {

                return false;

            }

        }


        for (
            const npc of
            state.world
                .npcs
        ) {

            if (
                circleCircleCollision(
                    x,
                    y,
                    radius,

                    npc.x,
                    npc.y,
                    npc.radius
                )
            ) {

                return false;

            }

        }


        return true;

    }


    /* =========================================================
       HUD
       ========================================================= */

    function updateHUD() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        must(
            "hudAvatar"
        ).textContent =
            player.icon ||
            "?";


        must(
            "hudClass"
        ).textContent =
            player.className ||
            "Aventureiro";


        must(
            "hudName"
        ).textContent =
            player.name ||
            "Viajante";


        must(
            "moneyText"
        ).textContent =
            Math.floor(
                player.money ||
                0
            );


        must(
            "levelText"
        ).textContent =
            player.level ||
            1;


        must(
            "xpText"
        ).textContent =
            player.level >=
            MAX_LEVEL

                ? "MÁX."

                : `${Math.floor(
                    player.xp ||
                    0
                )} / ${Math.floor(
                    player.xpToNext ||
                    100
                )}`;


        must(
            "hpText"
        ).textContent =
            `${Math.ceil(
                player.hp
            )}/${Math.ceil(
                player.maxHp
            )}`;


        must(
            "magicText"
        ).textContent =
            `${Math.ceil(
                player.magic
            )}/${Math.ceil(
                player.maxMagic
            )}`;


        must(
            "energyText"
        ).textContent =
            `${Math.ceil(
                player.energy
            )}/${Math.ceil(
                player.maxEnergy
            )}`;


        must(
            "hungerText"
        ).textContent =
            `${Math.ceil(
                player.hunger
            )}/${Math.ceil(
                player.maxHunger
            )}`;


        must(
            "fatigueText"
        ).textContent =
            `${Math.ceil(
                player.fatigue
            )}/${Math.ceil(
                player.maxFatigue
            )}`;


        setBar(
            "hpBar",
            player.hp,
            player.maxHp
        );


        setBar(
            "magicBar",
            player.magic,
            player.maxMagic
        );


        setBar(
            "energyBar",
            player.energy,
            player.maxEnergy
        );


        const weight =
            $(
                "weightText"
            );


        if (
            weight
        ) {

            weight.textContent =
                `${calculateInventoryWeight()} / ${player.inventoryWeightLimit}`;

        }


        const minimap =
            $(
                "minimap"
            );


        const mapBtn =
            $(
                "mapBtn"
            );


        const ownsMap =
            hasItem(
                "minimapa"
            ) ||
            Boolean(
                player.minimapOwned
            );


        if (
            minimap
        ) {

            minimap.classList
                .toggle(
                    "hidden",
                    !ownsMap
                );

        }


        if (
            mapBtn
        ) {

            mapBtn.disabled =
                !ownsMap;


            mapBtn.title =
                ownsMap

                    ? "Mapa"

                    : "Compre o Minimapa com Doran";

        }


        updateInteractionHint();

        updateHoldProgressUI();

    }


    /* =========================================================
       INDICAÇÃO DE INTERAÇÃO
       ========================================================= */

    function updateInteractionHint() {

        const hint =
            $(
                "interactionHint"
            );


        if (
            !hint ||
            !state.player
        ) {

            return;

        }


        if (
            state.transition ||
            state.player.dead ||
            state.dialogue ||
            state.travel ||
            state.battle ||
            isGameplayOverlayOpen()
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


        const key =
            must(
                "interactionKey"
            );


        const text =
            must(
                "interactionText"
            );


        key.textContent =
            "E";


        switch (
            interaction.type
        ) {

            case "door":

                key.textContent =
                    "Z / E";


                text.textContent =
                    `Entrar — ${interaction.object.building.name}`;

                break;


            case "exitHouse":

                key.textContent =
                    "Z / E";


                text.textContent =
                    "Sair pela porta";

                break;


            case "sleep":

                text.textContent =
                    "DORMIR";

                break;


            case "forge":

                text.textContent =
                    "Usar a forja";

                break;


            case "drop": {

                const item =
                    ITEMS[
                        interaction
                            .object
                            .itemId
                    ];


                text.textContent =
                    `Pegar ${item?.name || "item"}`;

                break;

            }


            case "food":

                text.textContent =
                    "Comer cenoura";

                break;


            case "secret":

                text.textContent =
                    "Investigar";

                break;


            case "npc":

                if (
                    interaction.object
                        .merchant
                ) {

                    text.textContent =
                        "Abrir loja";

                }

                else if (
                    interaction.object
                        .blacksmith
                ) {

                    text.textContent =
                        "Conversar / Forja";

                }

                else if (
                    interaction.object
                        .questId
                ) {

                    text.textContent =
                        "Conversar / Missão";

                }

                else {

                    text.textContent =
                        "Conversar";

                }

                break;


            case "gate":

                text.textContent =
                    "Examinar portão";

                break;


            case "trial":

                text.textContent =
                    interaction.object
                        .dashAltar

                        ? "Examinar altar"

                        : "Iniciar / continuar desafio";

                break;


            case "boss":

                text.textContent =
                    `Desafiar ${interaction.object.name}`;

                break;


            case "tree":

                text.textContent =
                    "Segure E — cortar madeira";

                break;


            case "resource":

                text.textContent =
                    `Segure E — coletar ${
                        ITEMS[
                            interaction
                                .object
                                .type
                        ]
                            ?.name ||
                        "recurso"
                    }`;

                break;


            default:

                text.textContent =
                    "Interagir";

        }


        hint.classList
            .remove(
                "hidden"
            );

    }


    function updateHoldProgressUI() {

        const wrap =
            $(
                "holdProgress"
            );


        const fill =
            $(
                "holdProgressFill"
            );


        const title =
            $(
                "holdProgressTitle"
            );


        if (
            !wrap ||
            !fill ||
            !title
        ) {

            return;

        }


        const hold =
            state.holdAction;


        if (
            !hold
        ) {

            wrap.classList
                .add(
                    "hidden"
                );


            fill.style.width =
                "0%";


            return;

        }


        wrap.classList
            .remove(
                "hidden"
            );


        const percent =
            clamp(
                hold.progress /
                hold.duration *
                100,

                0,
                100
            );


        fill.style.width =
            `${percent}%`;


        title.textContent =
            hold.type ===
            "tree"

                ? "Cortando madeira..."

                : `Coletando ${
                    ITEMS[
                        hold.object
                            ?.type
                    ]
                        ?.name ||
                    "recurso"
                }...`;

    }


    /* =========================================================
       INVENTÁRIO
       ========================================================= */

    function updateInventory() {

        const grid =
            $(
                "inventoryGrid"
            );


        const equipmentGrid =
            $(
                "equipmentGrid"
            );


        if (
            !grid ||
            !equipmentGrid ||
            !state.player
        ) {

            return;

        }


        grid.innerHTML =
            "";


        const category =
            state.inventoryCategory ||
            "all";


        Object.entries(
            state.player
                .inventory
        )
            .filter(
                (
                    [
                        ,
                        amount
                    ]
                ) =>
                    amount >
                    0
            )
            .filter(
                (
                    [
                        id
                    ]
                ) => {

                    const item =
                        ITEMS[
                            id
                        ];


                    if (
                        !item
                    ) {

                        return false;

                    }


                    if (
                        category ===
                        "all"
                    ) {

                        return true;

                    }


                    return (
                        item.category ===
                        category
                    );

                }
            )
            .forEach(
                (
                    [
                        id,
                        amount
                    ]
                ) => {

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
                        isEquippedItem(
                            id
                        );


                    card.innerHTML = `
                        <div class="item-icon">
                            ${item.icon}
                        </div>

                        <strong>
                            ${item.name}
                        </strong>

                        <small>
                            x${amount}
                            ${equipped ? " • EQUIPADO" : ""}
                        </small>

                        <div class="inventory-actions"></div>
                    `;


                    const actions =
                        card
                            .querySelector(
                                ".inventory-actions"
                            );


                    if (
                        [
                            "weapons",
                            "armor",
                            "tools"
                        ].includes(
                            item.category
                        )
                    ) {

                        const button =
                            document
                                .createElement(
                                    "button"
                                );


                        button.type =
                            "button";


                        button.className =
                            "tab";


                        button.textContent =
                            equipped
                                ? "EQUIPADO"
                                : "EQUIPAR";


                        button.disabled =
                            equipped;


                        button.addEventListener(
                            "click",
                            () => {

                                equipItem(
                                    id
                                );


                                updateInventory();

                            }
                        );


                        actions.appendChild(
                            button
                        );

                    }


                    if (
                        [
                            "food",
                            "potions"
                        ].includes(
                            item.category
                        )
                    ) {

                        const button =
                            document
                                .createElement(
                                    "button"
                                );


                        button.type =
                            "button";


                        button.className =
                            "tab";


                        button.textContent =
                            "USAR";


                        button.addEventListener(
                            "click",
                            () => {

                                useItem(
                                    id
                                );


                                updateInventory();

                            }
                        );


                        actions.appendChild(
                            button
                        );

                    }


                    if (
                        id ===
                        "flautaMemoria"
                    ) {

                        const button =
                            document
                                .createElement(
                                    "button"
                                );


                        button.type =
                            "button";


                        button.className =
                            "tab";


                        button.textContent =
                            "TOCAR";


                        button.addEventListener(
                            "click",
                            () => {

                                closeAllGameplayPanels();


                                playMemoryFlute();

                            }
                        );


                        actions.appendChild(
                            button
                        );

                    }


                    grid.appendChild(
                        card
                    );

                }
            );


        if (
            !grid.children
                .length
        ) {

            grid.innerHTML = `
                <div class="quest-status">
                    Nenhum item nesta categoria.
                </div>
            `;

        }


        const equipment =
            state.player
                .equipment;


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
                ⚔️ Arma:
                <strong>
                    ${
                        weapon
                            ? `${weapon.icon} ${weapon.name}`
                            : "Nenhuma"
                    }
                </strong>
            </div>

            <div>
                🛡️ Armadura:
                <strong>
                    ${
                        armor
                            ? `${armor.icon} ${armor.name}`
                            : "Nenhuma"
                    }
                </strong>
            </div>

            <div>
                🪓 Ferramenta:
                <strong>
                    ${
                        tool
                            ? `${tool.icon} ${tool.name}`
                            : "Nenhuma"
                    }
                </strong>
            </div>

            <div>
                ⚖️ Peso:
                <strong>
                    ${calculateInventoryWeight()}
                    /
                    ${state.player.inventoryWeightLimit}
                </strong>
            </div>
        `;

    }


    /* =========================================================
       LIVRO
       ========================================================= */

    function renderBook() {

        const container =
            $(
                "bossBook"
            );


        if (
            !container ||
            !state.player
        ) {

            return;

        }


        container.innerHTML =
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


        const visible =
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
            !visible.length
        ) {

            container.innerHTML = `
                <div class="quest-status">
                    Nenhum boss foi descoberto ainda.
                    O livro não revela nomes de inimigos
                    que você nunca encontrou.
                </div>
            `;


            return;

        }


        visible.forEach(
            boss => {

                const entry =
                    document
                        .createElement(
                            "div"
                        );


                entry.className =
                    "boss-entry";


                const dead =
                    defeated.has(
                        boss.id
                    );


                entry.innerHTML = `
                    <div>
                        ${boss.icon}
                    </div>

                    <strong>
                        ${boss.name}
                    </strong>

                    <p>
                        ${
                            REGIONS[
                                boss.region
                            ]
                                ?.name ||
                            boss.region
                        }
                    </p>

                    <p>
                        ${
                            dead
                                ? "✅ DERROTADO"
                                : "⚠️ DESCOBERTO"
                        }
                    </p>

                    <small>
                        ${boss.quote}
                    </small>
                `;


                container.appendChild(
                    entry
                );

            }
        );

    }


    /* =========================================================
       ABERTURA DE PAINÉIS
       ========================================================= */

    function openInventoryPanel() {

        const panel =
            must(
                "inventoryPanel"
            );


        const wasOpen =
            !panel.classList
                .contains(
                    "hidden"
                );


        closeAllGameplayPanels();


        if (
            wasOpen
        ) {

            return;

        }


        updateInventory();


        panel.classList
            .remove(
                "hidden"
            );

    }


    function openBookPanel() {

        const panel =
            must(
                "bookPanel"
            );


        const wasOpen =
            !panel.classList
                .contains(
                    "hidden"
                );


        closeAllGameplayPanels();


        if (
            wasOpen
        ) {

            return;

        }


        renderBook();


        panel.classList
            .remove(
                "hidden"
            );

    }


    function openMapPanel() {

        if (
            !hasItem(
                "minimapa"
            ) &&
            !state.player
                ?.minimapOwned
        ) {

            showToast(
                "Você ainda não possui o Minimapa. Doran vende um na loja."
            );


            return;

        }


        const panel =
            must(
                "mapPanel"
            );


        const wasOpen =
            !panel.classList
                .contains(
                    "hidden"
                );


        closeAllGameplayPanels();


        if (
            wasOpen
        ) {

            return;

        }


        drawLargeMap();


        panel.classList
            .remove(
                "hidden"
            );

    }


    /* =========================================================
       CHÃO
       ========================================================= */

    function drawGround() {

        const visual =
            REGIONS[
                state.area
            ]
                ?.visual;


        const colors = {

            village:
                "#536b4b",

            forest:
                "#355b3b",

            grove:
                "#30503a",

            mountains:
                "#929a9d",

            iron:
                "#282d31",

            ruby:
                "#48242d",

            monarchMaze:
                "#141117",

            shadow:
                "#1a1e2f",

            fairy:
                "#594769",

            sky:
                "#8eb0c7",

            hell:
                "#4c241f",

            final:
                "#19171d"

        };


        ctx.fillStyle =
            colors[
                visual
            ] ||
            "#536b4b";


        ctx.fillRect(
            0,
            0,
            state.world.width,
            state.world.height
        );


        if (
            visual ===
            "mountains"
        ) {

            ctx.fillStyle =
                "rgba(255,255,255,.12)";


            for (
                let y = 120;
                y <
                state.world.height;
                y += 120
            ) {

                for (
                    let x = 120;
                    x <
                    state.world.width;
                    x += 120
                ) {

                    if (
                        (
                            x +
                            y
                        ) %
                        240 ===
                        0
                    ) {

                        ctx.fillRect(
                            x,
                            y,
                            4,
                            4
                        );

                    }

                }

            }

        }


        if (
            visual ===
            "hell"
        ) {

            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    state.world.height
                );


            gradient.addColorStop(
                0,
                "rgba(160,45,20,.08)"
            );


            gradient.addColorStop(
                1,
                "rgba(255,85,20,.16)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                0,
                0,
                state.world.width,
                state.world.height
            );

        }

    }


    /* =========================================================
       CAMINHOS
       ========================================================= */

    function drawPaths() {

        const colors = {

            villageRoad:
                "#b99b68",

            forestTrail:
                "#9a8258",

            groveTrail:
                "#85734f",

            snowTrail:
                "#c7cbcb",

            mineTrack:
                "#5b554f",

            crystalTrail:
                "#713d48",

            mazeExit:
                "#42394a",

            shadowTrail:
                "#34364b",

            fairyTrail:
                "#987cad",

            skyBridge:
                "#d4dce2",

            hellRoad:
                "#703a31",

            finalRoad:
                "#403d47"

        };


        for (
            const path of
            state.world
                .paths
        ) {

            if (
                !path.points
                    ?.length
            ) {

                continue;

            }


            ctx.save();


            ctx.lineCap =
                "round";


            ctx.lineJoin =
                "round";


            ctx.globalAlpha =
                0.82;


            ctx.strokeStyle =
                colors[
                    path.kind
                ] ||
                "#9a8258";


            ctx.lineWidth =
                path.width ||
                90;


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


            ctx.globalAlpha =
                0.22;


            ctx.strokeStyle =
                "#ffffff";


            ctx.lineWidth =
                Math.max(
                    2,
                    (
                        path.width ||
                        90
                    ) *
                    0.05
                );


            ctx.stroke();


            ctx.restore();

        }

    }


    /* =========================================================
       DETALHES AMBIENTAIS
       ========================================================= */

    function drawAmbientDetails() {

        const visual =
            REGIONS[
                state.area
            ]
                ?.visual;


        if (
            [
                "village",
                "forest",
                "grove"
            ].includes(
                visual
            )
        ) {

            ctx.save();


            ctx.strokeStyle =
                "rgba(30,74,38,.30)";


            ctx.lineWidth =
                2;


            for (
                let y = 110;
                y <
                state.world.height -
                    80;
                y += 92
            ) {

                for (
                    let x = 110;
                    x <
                    state.world.width -
                        80;
                    x += 92
                ) {

                    if (
                        (
                            x *
                            7 +
                            y *
                            3
                        ) %
                        17 <
                        7
                    ) {

                        ctx.beginPath();


                        ctx.moveTo(
                            x,
                            y +
                            5
                        );


                        ctx.lineTo(
                            x -
                            4,
                            y -
                            4
                        );


                        ctx.moveTo(
                            x,
                            y +
                            5
                        );


                        ctx.lineTo(
                            x +
                            4,
                            y -
                            5
                        );


                        ctx.stroke();

                    }

                }

            }


            ctx.restore();

        }


        if (
            visual ===
            "sky"
        ) {

            ctx.save();


            ctx.globalAlpha =
                0.16;


            ctx.fillStyle =
                "#fff";


            for (
                let i = 0;
                i < 15;
                i++
            ) {

                const x =
                    (
                        i *
                        290 +
                        state.time *
                        12
                    ) %
                    (
                        state.world.width +
                        300
                    ) -
                    150;


                const y =
                    200 +
                    (
                        i %
                        5
                    ) *
                    390;


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    120,
                    36,

                    0,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

            }


            ctx.restore();

        }

    }


    /* =========================================================
       PRÉDIOS E PORTAS
       ========================================================= */

    function drawBuildings() {

        for (
            const building of
            state.world
                .buildings
        ) {

            ctx.save();


            ctx.fillStyle =
                "rgba(0,0,0,.26)";


            ctx.fillRect(
                building.x +
                    16,

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
                    28,

                building.y +
                    8
            );


            ctx.lineTo(
                building.x +
                    building.w /
                    2,

                building.y -
                    98
            );


            ctx.lineTo(
                building.x +
                    building.w +
                    28,

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


            ctx.fillStyle =
                "#cbb88e";


            ctx.fillRect(
                building.x +
                    42,

                building.y +
                    72,

                55,
                48
            );


            ctx.fillRect(
                building.x +
                    building.w -
                    97,

                building.y +
                    72,

                55,
                48
            );


            ctx.fillStyle =
                "rgba(40,65,80,.8)";


            ctx.fillRect(
                building.x +
                    49,

                building.y +
                    79,

                41,
                34
            );


            ctx.fillRect(
                building.x +
                    building.w -
                    90,

                building.y +
                    79,

                41,
                34
            );


            ctx.font =
                "700 12px Georgia";


            ctx.textAlign =
                "center";


            ctx.fillStyle =
                "#f0dfb6";


            ctx.fillText(
                building.name,

                building.x +
                    building.w /
                    2,

                building.y +
                    building.h +
                    34
            );


            ctx.restore();

        }


        drawExteriorDoors();

    }


    function drawExteriorDoors() {

        for (
            const door of
            state.world
                .doors
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
            ) {

                continue;

            }


            const animation =
                clamp(
                    door.animation ||
                    0,

                    0,
                    1
                );


            const frameX =
                door.x -
                8;


            const frameY =
                building.y +
                building.h -
                86;


            const frameW =
                door.w +
                16;


            const frameH =
                88;


            ctx.save();


            ctx.fillStyle =
                "#2a1d17";


            ctx.fillRect(
                frameX,
                frameY,
                frameW,
                frameH
            );


            ctx.fillStyle =
                "#56382a";


            const visibleWidth =
                Math.max(
                    8,

                    door.w *
                    (
                        1 -
                        animation *
                        0.82
                    )
                );


            ctx.fillRect(
                door.x,
                frameY +
                    6,

                visibleWidth,
                frameH -
                    6
            );


            ctx.strokeStyle =
                "#b68b55";


            ctx.lineWidth =
                3;


            ctx.strokeRect(
                frameX,
                frameY,
                frameW,
                frameH
            );


            if (
                animation <
                0.7
            ) {

                ctx.fillStyle =
                    "#d7b66e";


                ctx.beginPath();


                ctx.arc(
                    door.x +
                        visibleWidth -
                        10,

                    frameY +
                        frameH /
                        2,

                    4,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

            }


            if (
                animation >
                0.15
            ) {

                ctx.fillStyle =
                    `rgba(
                        245,
                        216,
                        155,
                        ${
                            0.12 +
                            animation *
                            0.22
                        }
                    )`;


                ctx.fillRect(
                    door.x +
                        visibleWidth,

                    frameY +
                        7,

                    door.w -
                        visibleWidth,

                    frameH -
                        8
                );

            }


            ctx.restore();

        }

    }


    /* =========================================================
       MÓVEIS
       ========================================================= */

    function drawFurnitureItem(
        item
    ) {

        ctx.save();


        if (
            item.type ===
            "bed"
        ) {

            ctx.fillStyle =
                "#49342b";


            ctx.fillRect(
                item.x,
                item.y,
                item.w,
                item.h
            );


            ctx.fillStyle =
                "#d8c9aa";


            ctx.fillRect(
                item.x +
                    10,

                item.y +
                    10,

                item.w -
                    20,

                item.h -
                    20
            );


            ctx.fillStyle =
                "#7d4f49";


            ctx.fillRect(
                item.x +
                    14,

                item.y +
                    54,

                item.w -
                    28,

                item.h -
                    68
            );

        }

        else if (
            [
                "table",
                "desk",
                "workbench",
                "counter"
            ].includes(
                item.type
            )
        ) {

            ctx.fillStyle =
                item.type ===
                "counter"

                    ? "#62422e"

                    : "#64462f";


            ctx.fillRect(
                item.x,
                item.y,
                item.w,
                item.h
            );


            ctx.fillStyle =
                "rgba(255,255,255,.08)";


            ctx.fillRect(
                item.x +
                    6,

                item.y +
                    5,

                item.w -
                    12,

                10
            );

        }

        else if (
            item.type ===
            "furnace"
        ) {

            ctx.fillStyle =
                "#343238";


            ctx.fillRect(
                item.x,
                item.y,
                item.w,
                item.h
            );


            ctx.fillStyle =
                "#161518";


            ctx.fillRect(
                item.x +
                    45,

                item.y +
                    65,

                item.w -
                    90,

                item.h -
                    88
            );


            const fire =
                0.55 +
                Math.sin(
                    state.time *
                    8
                ) *
                0.18;


            ctx.fillStyle =
                `rgba(
                    255,
                    105,
                    36,
                    ${fire}
                )`;


            ctx.beginPath();


            ctx.arc(
                item.x +
                    item.w /
                    2,

                item.y +
                    item.h *
                    0.67,

                43,
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
                "#282c32";


            ctx.fillRect(
                item.x +
                    22,

                item.y +
                    34,

                item.w -
                    44,

                item.h -
                    48
            );


            ctx.fillRect(
                item.x,
                item.y +
                    26,

                item.w,
                34
            );


            ctx.fillStyle =
                "rgba(255,255,255,.09)";


            ctx.fillRect(
                item.x +
                    12,

                item.y +
                    28,

                item.w -
                    24,

                6
            );

        }

        else if (
            [
                "bookshelf",
                "shopShelf"
            ].includes(
                item.type
            )
        ) {

            ctx.fillStyle =
                "#553a2a";


            ctx.fillRect(
                item.x,
                item.y,
                item.w,
                item.h
            );


            for (
                let y =
                    item.y +
                    18;

                y <
                item.y +
                item.h -
                10;

                y += 42
            ) {

                ctx.fillStyle =
                    "#2e2a2c";


                ctx.fillRect(
                    item.x +
                        9,

                    y,

                    item.w -
                        18,

                    6
                );


                for (
                    let x =
                        item.x +
                        15;

                    x <
                    item.x +
                    item.w -
                    15;

                    x += 17
                ) {

                    ctx.fillStyle =
                        [
                            "#9d5c55",
                            "#55769d",
                            "#8b7a4f",
                            "#72609b"
                        ][
                            (
                                x +
                                y
                            ) %
                            4
                        ];


                    ctx.fillRect(
                        x,
                        y -
                            28,

                        10,
                        27
                    );

                }

            }

        }

        else if (
            [
                "chest",
                "crate",
                "oreCrate"
            ].includes(
                item.type
            )
        ) {

            ctx.fillStyle =
                item.type ===
                "oreCrate"

                    ? "#4a4642"

                    : "#62442d";


            ctx.fillRect(
                item.x,
                item.y,
                item.w,
                item.h
            );


            ctx.strokeStyle =
                "#2b211b";


            ctx.lineWidth =
                5;


            ctx.strokeRect(
                item.x,
                item.y,
                item.w,
                item.h
            );


            ctx.beginPath();


            ctx.moveTo(
                item.x,
                item.y
            );


            ctx.lineTo(
                item.x +
                    item.w,

                item.y +
                    item.h
            );


            ctx.moveTo(
                item.x +
                    item.w,

                item.y
            );


            ctx.lineTo(
                item.x,

                item.y +
                    item.h
            );


            ctx.stroke();

        }

        else if (
            [
                "logStack",
                "boardStack"
            ].includes(
                item.type
            )
        ) {

            ctx.fillStyle =
                "#7a5737";


            for (
                let y =
                    item.y +
                    12;

                y <
                item.y +
                item.h -
                    8;

                y += 28
            ) {

                ctx.fillRect(
                    item.x +
                        8,

                    y,

                    item.w -
                        16,

                    18
                );

            }

        }

        else {

            ctx.fillStyle =
                "#5b4231";


            ctx.fillRect(
                item.x,
                item.y,
                item.w,
                item.h
            );

        }


        ctx.strokeStyle =
            "rgba(0,0,0,.35)";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            item.x,
            item.y,
            item.w,
            item.h
        );


        ctx.restore();

    }


    /* =========================================================
       INTERIORES
       ========================================================= */

    function drawHouseInterior() {

        const spec =
            getHouseSpec();


        const room =
            getHouseRoom();


        ctx.fillStyle =
            "#101112";


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
                28,

            room.y -
                28,

            room.w +
                56,

            room.h +
                56
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
            spec.trim;


        ctx.lineWidth =
            6;


        ctx.strokeRect(
            room.x,
            room.y,
            room.w,
            room.h
        );


        const plankGap =
            42;


        ctx.save();


        ctx.globalAlpha =
            0.13;


        ctx.strokeStyle =
            "#1e1713";


        ctx.lineWidth =
            2;


        for (
            let y =
                room.y +
                plankGap;

            y <
            room.y +
            room.h;

            y +=
                plankGap
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


        ctx.restore();


        for (
            const item of
            getHouseFurniture()
        ) {

            drawFurnitureItem(
                item
            );

        }


        drawInteriorDoor();

        drawInteriorNPCs();


        ctx.save();


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#edddb6";


        ctx.font =
            "700 19px Georgia";


        ctx.fillText(
            state.currentHouse
                ?.name ||
            "INTERIOR",

            room.x +
                room.w /
                2,

            room.y -
                48
        );


        ctx.restore();

    }


    function drawInteriorDoor() {

        const door =
            getInteriorDoor();


        const room =
            getHouseRoom();


        ctx.save();


        const x =
            door.x;


        const y =
            room.y +
            room.h -
            82;


        ctx.fillStyle =
            "#2a1b16";


        ctx.fillRect(
            x -
                7,

            y,

            door.w +
                14,

            86
        );


        ctx.fillStyle =
            "#573928";


        ctx.fillRect(
            x,
            y +
                6,

            door.w,
            78
        );


        ctx.strokeStyle =
            "#c29a61";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            x -
                7,

            y,

            door.w +
                14,

            86
        );


        ctx.fillStyle =
            "#d7b765";


        ctx.beginPath();


        ctx.arc(
            x +
                door.w -
                13,

            y +
                47,

            4,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.font =
            "700 11px Arial";


        ctx.fillStyle =
            "#f2e4c1";


        ctx.textAlign =
            "center";


        ctx.fillText(
            "PORTA",

            x +
                door.w /
                2,

            y -
                10
        );


        ctx.restore();

    }


    /* =========================================================
       NPCS
       ========================================================= */

    function drawNpcSprite(
        npc
    ) {

        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,.25)";


        ctx.beginPath();


        ctx.ellipse(
            npc.x,
            npc.y +
                18,

            18,
            7,

            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            npc.color ||
            "#c9ae82";


        ctx.beginPath();


        ctx.arc(
            npc.x,
            npc.y,

            17,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#2a282a";


        ctx.beginPath();


        ctx.arc(
            npc.x,
            npc.y -
                9,

            9,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.font =
            "700 12px Arial";


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#f3e4bd";


        ctx.fillText(
            npc.name,

            npc.x,

            npc.y -
                31
        );


        ctx.restore();

    }


    function drawInteriorNPCs() {

        getHouseInteriorNPCs()
            .forEach(
                drawNpcSprite
            );

    }


    function drawNPCs() {

        state.world
            .npcs
            .forEach(
                drawNpcSprite
            );

    }


    /* =========================================================
       ÁRVORES
       ========================================================= */

    function drawTrees() {

        for (
            const tree of
            state.world
                .trees
        ) {

            if (
                !tree.alive
            ) {

                continue;

            }


            ctx.save();


            ctx.fillStyle =
                "rgba(0,0,0,.2)";


            ctx.beginPath();


            ctx.ellipse(
                tree.x,
                tree.y +
                    39,

                32,
                10,

                0,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.fillStyle =
                "#67492f";


            ctx.fillRect(
                tree.x -
                    10,

                tree.y -
                    4,

                20,
                50
            );


            const leafColor =
                state.area ===
                "grove"

                    ? "#31513b"

                    : state.area ===
                      "fairy"

                      ? "#745885"

                      : "#3e7043";


            ctx.fillStyle =
                leafColor;


            ctx.beginPath();


            ctx.arc(
                tree.x,
                tree.y -
                    24,

                37,
                0,
                Math.PI *
                2
            );


            ctx.arc(
                tree.x -
                    22,

                tree.y -
                    31,

                25,
                0,
                Math.PI *
                2
            );


            ctx.arc(
                tree.x +
                    22,

                tree.y -
                    31,

                25,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }

    }


    /* =========================================================
       RECURSOS
       ========================================================= */

    function drawResources() {

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


            const item =
                ITEMS[
                    resource.type
                ];


            ctx.save();


            ctx.fillStyle =
                "rgba(0,0,0,.28)";


            ctx.beginPath();


            ctx.ellipse(
                resource.x,
                resource.y +
                    12,

                18,
                7,

                0,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.font =
                "28px serif";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                item
                    ?.icon ||
                "◆",

                resource.x,
                resource.y
            );


            ctx.restore();

        }

    }


    function drawFoods() {

        for (
            const food of
            state.world
                .foods
        ) {

            if (
                !food.alive
            ) {

                continue;

            }


            ctx.save();


            ctx.font =
                "27px serif";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                food.type ===
                "carrot"

                    ? "🥕"

                    : "🍎",

                food.x,
                food.y
            );


            ctx.restore();

        }

    }


    function drawSecrets() {

        for (
            const secret of
            state.world
                .secrets
        ) {

            if (
                secret.found
            ) {

                continue;

            }


            ctx.save();


            ctx.globalAlpha =
                0.34 +
                Math.sin(
                    state.time *
                    2 +
                    secret.x
                ) *
                0.08;


            ctx.font =
                "24px serif";


            ctx.textAlign =
                "center";


            ctx.fillText(
                secret.icon,

                secret.x,
                secret.y
            );


            ctx.restore();

        }

    }


    /* =========================================================
       FONTE
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
            "#8b8981";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y,

            obstacle.w /
                2,

            obstacle.h /
                2,

            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#5594a7";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y,

            obstacle.w /
                2 -
                20,

            obstacle.h /
                2 -
                20,

            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#97958c";


        ctx.fillRect(
            x -
                18,

            y -
                76,

            36,
            89
        );


        ctx.fillStyle =
            "#aaa89f";


        ctx.beginPath();


        ctx.arc(
            x,
            y -
                77,

            27,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.strokeStyle =
            `rgba(
                176,
                231,
                245,
                ${
                    0.55 +
                    Math.sin(
                        state.time *
                        7
                    ) *
                    0.12
                }
            )`;


        ctx.lineWidth =
            4;


        ctx.beginPath();


        ctx.moveTo(
            x,
            y -
                50
        );


        ctx.quadraticCurveTo(
            x +
                52,

            y -
                40,

            x +
                60,

            y +
                3
        );


        ctx.moveTo(
            x,
            y -
                50
        );


        ctx.quadraticCurveTo(
            x -
                52,

            y -
                40,

            x -
                60,

            y +
                3
        );


        ctx.stroke();


        ctx.globalAlpha =
            0.5;


        ctx.beginPath();


        ctx.arc(
            x,
            y,

            62 +
            Math.sin(
                state.time *
                3
            ) *
            4,

            0,
            Math.PI *
            2
        );


        ctx.stroke();


        ctx.restore();

    }


    /* =========================================================
       OBSTÁCULOS
       ========================================================= */

    function drawObstacles() {

        const colors = {

            wall:
                "#48504b",

            mazeWall:
                "#252127",

            arenaWall:
                "#352c39",

            rock:
                "#72766f",

            snowrock:
                "#bdc4c6",

            iceRock:
                "#a8bbc4",

            oreRock:
                "#5e5b57",

            ironrock:
                "#666d70",

            rubyrock:
                "#75384b",

            rubyPillar:
                "#873d50",

            darkrock:
                "#34374d",

            shadowCrystal:
                "#53547a",

            fairyStone:
                "#9288a2",

            magicBush:
                "#5f5573",

            skyStone:
                "#c0ccd2",

            basalt:
                "#463539",

            lavaRock:
                "#4f312b"

        };


        for (
            const obstacle of
            state.world
                .obstacles
        ) {

            if (
                [
                    "building",
                    "tree"
                ].includes(
                    obstacle.type
                )
            ) {

                continue;

            }


            if (
                obstacle.type ===
                "fountain"
            ) {

                drawFountain(
                    obstacle
                );


                continue;

            }


            ctx.save();


            ctx.fillStyle =
                colors[
                    obstacle.type
                ] ||
                "#6d706d";


            if (
                [
                    "wall",
                    "mazeWall",
                    "arenaWall"
                ].includes(
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


                ctx.strokeRect(
                    obstacle.x,
                    obstacle.y,
                    obstacle.w,
                    obstacle.h
                );

            }

            else {

                ctx.beginPath();


                ctx.ellipse(
                    obstacle.x +
                        obstacle.w /
                        2,

                    obstacle.y +
                        obstacle.h /
                        2,

                    obstacle.w /
                        2,

                    obstacle.h /
                        2,

                    -0.12,
                    0,
                    Math.PI *
                        2
                );


                ctx.fill();

            }


            ctx.restore();

        }

    }


    /* =========================================================
       DECORAÇÕES
       ========================================================= */

    function drawDecoration(
        decoration
    ) {

        const {
            x,
            y,
            type
        } =
            decoration;


        ctx.save();


        switch (
            type
        ) {

            case "pathStone":

                ctx.fillStyle =
                    "#81765f";


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    decoration.size ||
                        18,

                    (
                        decoration.size ||
                        18
                    ) *
                        0.55,

                    decoration.angle ||
                        0,

                    0,
                    Math.PI *
                        2
                );


                ctx.fill();

                break;


            case "fallenLog":

                ctx.fillStyle =
                    "#6d4c31";


                ctx.translate(
                    x,
                    y
                );


                ctx.rotate(
                    -0.32
                );


                ctx.fillRect(
                    -34,
                    -8,
                    68,
                    16
                );

                break;


            case "bush":
            case "fern":
            case "darkGrass":
            case "glowingGrass":

                ctx.strokeStyle =
                    type ===
                    "glowingGrass"

                        ? "rgba(176,245,201,.65)"

                        : type ===
                          "darkGrass"

                          ? "#30364a"

                          : "#3f7146";


                ctx.lineWidth =
                    3;


                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    const angle =
                        -2.8 +
                        i *
                        0.35;


                    ctx.beginPath();


                    ctx.moveTo(
                        x,
                        y +
                            12
                    );


                    ctx.lineTo(
                        x +
                            Math.cos(
                                angle
                            ) *
                            20,

                        y +
                            Math.sin(
                                angle
                            ) *
                            20
                    );


                    ctx.stroke();

                }

                break;


            case "ancientRoot":

                ctx.strokeStyle =
                    "#59402e";


                ctx.lineWidth =
                    8;


                ctx.beginPath();


                ctx.moveTo(
                    x -
                        30,

                    y +
                        10
                );


                ctx.quadraticCurveTo(
                    x,
                    y -
                        30,

                    x +
                        30,

                    y +
                        8
                );


                ctx.stroke();

                break;


            case "flower":
            case "magicFlower":
            case "skyFlower":

                ctx.font =
                    type ===
                    "magicFlower"

                        ? "22px serif"

                        : "18px serif";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    type ===
                    "skyFlower"

                        ? "✿"

                        : "🌸",

                    x,
                    y
                );

                break;


            case "deadPine":
            case "shadowTree":
            case "fairyTree":

                ctx.strokeStyle =
                    type ===
                    "fairyTree"

                        ? "#765f83"

                        : type ===
                          "shadowTree"

                          ? "#282c40"

                          : "#625b50";


                ctx.lineWidth =
                    8;


                ctx.beginPath();


                ctx.moveTo(
                    x,
                    y +
                        30
                );


                ctx.lineTo(
                    x,
                    y -
                        35
                );


                ctx.moveTo(
                    x,
                    y -
                        10
                );


                ctx.lineTo(
                    x -
                        24,

                    y -
                        28
                );


                ctx.moveTo(
                    x,
                    y -
                        18
                );


                ctx.lineTo(
                    x +
                        26,

                    y -
                        36
                );


                ctx.stroke();

                break;


            case "oreSpark":
            case "fairyCrystal":
            case "crystalPillar":
            case "crystalShard":

                ctx.fillStyle =
                    type ===
                    "fairyCrystal"

                        ? "rgba(168,119,221,.72)"

                        : "rgba(208,77,108,.72)";


                ctx.beginPath();


                ctx.moveTo(
                    x,
                    y -
                        26
                );


                ctx.lineTo(
                    x +
                        13,
                    y
                );


                ctx.lineTo(
                    x,
                    y +
                        24
                );


                ctx.lineTo(
                    x -
                        13,
                    y
                );


                ctx.closePath();


                ctx.fill();

                break;


            case "snowDrift":

                ctx.fillStyle =
                    "rgba(255,255,255,.28)";


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    34,
                    12,

                    0,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "windMark":

                ctx.strokeStyle =
                    "rgba(255,255,255,.22)";


                ctx.beginPath();


                ctx.moveTo(
                    x -
                        25,
                    y
                );


                ctx.quadraticCurveTo(
                    x,
                    y -
                        10,

                    x +
                        26,
                    y
                );


                ctx.stroke();

                break;


            case "mineLantern":

                ctx.fillStyle =
                    "#8b5a35";


                ctx.fillRect(
                    x -
                        4,

                    y -
                        20,

                    8,
                    34
                );


                ctx.fillStyle =
                    `rgba(
                        255,
                        184,
                        80,
                        ${
                            0.55 +
                            Math.sin(
                                state.time *
                                7 +
                                x
                            ) *
                            0.15
                        }
                    )`;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y -
                        23,

                    9,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "rail":

                ctx.strokeStyle =
                    "#5c5750";


                ctx.lineWidth =
                    4;


                ctx.beginPath();


                ctx.moveTo(
                    x -
                        30,

                    y -
                        10
                );


                ctx.lineTo(
                    x +
                        30,

                    y +
                        10
                );


                ctx.moveTo(
                    x -
                        28,

                    y +
                        2
                );


                ctx.lineTo(
                    x +
                        32,

                    y +
                        22
                );


                ctx.stroke();

                break;


            case "toolCrate":
            case "bones":
            case "bonePile":

                ctx.font =
                    "24px serif";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    type ===
                    "toolCrate"

                        ? "🧰"

                        : "🦴",

                    x,
                    y
                );

                break;


            case "stalagmite":

                ctx.fillStyle =
                    "#5e5b56";


                ctx.beginPath();


                ctx.moveTo(
                    x,
                    y -
                        30
                );


                ctx.lineTo(
                    x +
                        15,

                    y +
                        18
                );


                ctx.lineTo(
                    x -
                        15,

                    y +
                        18
                );


                ctx.closePath();


                ctx.fill();

                break;


            case "darkCaveEntrance":

                ctx.fillStyle =
                    "#070608";


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,

                    decoration.large
                        ? 62
                        : 48,

                    Math.PI,
                    0
                );


                ctx.lineTo(
                    x +
                        (
                            decoration.large
                                ? 62
                                : 48
                        ),

                    y +
                        55
                );


                ctx.lineTo(
                    x -
                        (
                            decoration.large
                                ? 62
                                : 48
                        ),

                    y +
                        55
                );


                ctx.closePath();


                ctx.fill();


                ctx.strokeStyle =
                    "#554c50";


                ctx.lineWidth =
                    6;


                ctx.stroke();

                break;


            case "cobweb":

                ctx.strokeStyle =
                    "rgba(225,225,235,.32)";


                ctx.lineWidth =
                    1;


                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    const angle =
                        i *
                        Math.PI /
                        3;


                    ctx.beginPath();


                    ctx.moveTo(
                        x,
                        y
                    );


                    ctx.lineTo(
                        x +
                            Math.cos(
                                angle
                            ) *
                            28,

                        y +
                            Math.sin(
                                angle
                            ) *
                            28
                    );


                    ctx.stroke();

                }

                break;


            case "darkPebble":

                ctx.fillStyle =
                    "#342e37";


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    8,
                    5,

                    0,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "shadowPool":

                ctx.fillStyle =
                    "rgba(55,57,92,.36)";


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    45,
                    24,

                    0,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "blueFlame":

                ctx.fillStyle =
                    `rgba(
                        100,
                        125,
                        255,
                        ${
                            0.5 +
                            Math.sin(
                                state.time *
                                8 +
                                x
                            ) *
                            0.18
                        }
                    )`;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,

                    10,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "fairySpark":

                ctx.fillStyle =
                    "rgba(255,225,255,.75)";


                ctx.beginPath();


                ctx.arc(
                    x,

                    y +
                    Math.sin(
                        state.time *
                        3 +
                        (
                            decoration.phase ||
                            0
                        )
                    ) *
                    6,

                    3,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "cloud":
            case "cloudPillar":

                ctx.fillStyle =
                    type ===
                    "cloud"

                        ? "rgba(255,255,255,.30)"

                        : "rgba(245,250,255,.56)";


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    type ===
                    "cloud"
                        ? 50
                        : 36,

                    type ===
                    "cloud"
                        ? 20
                        : 65,

                    0,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "goldenStatue":

                ctx.fillStyle =
                    "#c9ab62";


                ctx.fillRect(
                    x -
                        9,

                    y -
                        34,

                    18,
                    68
                );


                ctx.beginPath();


                ctx.arc(
                    x,
                    y -
                        43,

                    13,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "lavaPool":

                ctx.fillStyle =
                    `rgba(
                        231,
                        74,
                        28,
                        ${
                            0.42 +
                            Math.sin(
                                state.time *
                                4 +
                                x
                            ) *
                            0.08
                        }
                    )`;


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,

                    48,
                    25,

                    0,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "hellFire":

                ctx.fillStyle =
                    `rgba(
                        255,
                        93,
                        25,
                        ${
                            0.6 +
                            Math.sin(
                                state.time *
                                9 +
                                x
                            ) *
                            0.18
                        }
                    )`;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,

                    13,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "smokeVent":

                ctx.fillStyle =
                    "rgba(55,45,45,.32)";


                ctx.beginPath();


                ctx.arc(
                    x,

                    y -
                    Math.sin(
                        state.time *
                        2 +
                        x
                    ) *
                    8,

                    20,
                    0,
                    Math.PI *
                    2
                );


                ctx.fill();

                break;


            case "ash":

                ctx.fillStyle =
                    "rgba(210,190,180,.25)";


                ctx.fillRect(
                    x -
                        2,

                    y -
                        2,

                    4,
                    4
                );

                break;


            case "dashAltar":

                drawDashAltar(
                    x,
                    y
                );

                break;


            case "skyAltar":

                ctx.strokeStyle =
                    "rgba(245,230,178,.75)";


                ctx.lineWidth =
                    5;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,

                    65 +
                    Math.sin(
                        state.time *
                        3
                    ) *
                    5,

                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();


                ctx.font =
                    "34px serif";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    "✦",
                    x,
                    y +
                        10
                );

                break;


            case "finalSymbol":

                ctx.strokeStyle =
                    "rgba(220,205,226,.5)";


                ctx.lineWidth =
                    8;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,

                    115,
                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();


                ctx.font =
                    "78px serif";


                ctx.textAlign =
                    "center";


                ctx.fillStyle =
                    "#d7c9d9";


                ctx.fillText(
                    "☯",
                    x,
                    y +
                        25
                );

                break;


            case "memoryPillar":

                ctx.fillStyle =
                    "#4e4955";


                ctx.fillRect(
                    x -
                        15,

                    y -
                        55,

                    30,
                    110
                );


                ctx.strokeStyle =
                    "rgba(201,174,219,.55)";


                ctx.beginPath();


                ctx.arc(
                    x,
                    y -
                        42,

                    20,
                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();

                break;


            default:

                ctx.globalAlpha =
                    0.25;


                ctx.fillStyle =
                    "#ffffff";


                ctx.fillRect(
                    x -
                        3,

                    y -
                        3,

                    6,
                    6
                );

        }


        ctx.restore();

    }


    function drawDecorations() {

        for (
            const decoration of
            state.world
                .decorations
        ) {

            drawDecoration(
                decoration
            );

        }

    }


    /* =========================================================
       ALTAR DO MONARCA
       ========================================================= */

    function drawDashAltar(
        x,
        y
    ) {

        ctx.save();


        ctx.fillStyle =
            "#2a2730";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y +
                30,

            90,
            43,

            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.fillStyle =
            "#4b4451";


        ctx.beginPath();


        ctx.ellipse(
            x,
            y +
                13,

            64,
            31,

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
                18,

            y -
                70,

            36,
            84
        );


        if (
            state.player
                ?.monarchDefeated
        ) {

            ctx.strokeStyle =
                "rgba(199,159,224,.82)";


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
                    4
                ) *
                4,

                0,
                Math.PI *
                2
            );


            ctx.stroke();

        }


        ctx.restore();

    }


    function drawTrials() {

        for (
            const trial of
            state.world
                .trials
        ) {

            if (
                trial.dashAltar
            ) {

                if (
                    state.area ===
                        "monarchMaze" &&
                    !hasItem(
                        "lanterna"
                    )
                ) {

                    continue;

                }


                drawDashAltar(
                    trial.x,
                    trial.y
                );


                continue;

            }


            ctx.save();


            ctx.strokeStyle =
                "rgba(242,231,180,.72)";


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
                4,

                0,
                Math.PI *
                2
            );


            ctx.stroke();


            ctx.font =
                "30px serif";


            ctx.textAlign =
                "center";


            ctx.fillStyle =
                "#fff5cd";


            ctx.fillText(
                "✦",
                trial.x,
                trial.y +
                    10
            );


            ctx.restore();

        }

    }


    /* =========================================================
       PORTÕES
       ========================================================= */

    function drawGates() {

        for (
            const gate of
            state.world
                .gates
        ) {

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

                    ? "rgba(91,122,84,.24)"

                    : "#4b433d";


            ctx.fillRect(
                gate.x,
                gate.y,
                gate.w,
                gate.h
            );


            ctx.strokeStyle =
                unlocked

                    ? "#83a87d"

                    : "#8b7869";


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
                    "#292521";


                ctx.lineWidth =
                    6;


                const vertical =
                    gate.h >
                    gate.w;


                if (
                    vertical
                ) {

                    for (
                        let y =
                            gate.y +
                            22;

                        y <
                        gate.y +
                        gate.h;

                        y += 35
                    ) {

                        ctx.beginPath();


                        ctx.moveTo(
                            gate.x +
                                8,
                            y
                        );


                        ctx.lineTo(
                            gate.x +
                                gate.w -
                                8,
                            y
                        );


                        ctx.stroke();

                    }

                }

                else {

                    for (
                        let x =
                            gate.x +
                            22;

                        x <
                        gate.x +
                        gate.w;

                        x += 35
                    ) {

                        ctx.beginPath();


                        ctx.moveTo(
                            x,
                            gate.y +
                                8
                        );


                        ctx.lineTo(
                            x,
                            gate.y +
                                gate.h -
                                8
                        );


                        ctx.stroke();

                    }

                }

            }


            ctx.restore();

        }

    }


    /* =========================================================
       PORTAIS
       ========================================================= */

    function drawPortals() {

        const portals =
            getAllActivePortals();


        for (
            const portal of
            portals
        ) {

            if (
                typeof portal
                    .requirement ===
                    "function" &&
                !portal
                    .requirement()
            ) {

                if (
                    portal.id ===
                    "hell_stair"
                ) {

                    continue;

                }

            }


            ctx.save();


            if (
                portal.id ===
                "hell_stair"
            ) {

                ctx.fillStyle =
                    "#292025";


                for (
                    let i = 0;
                    i < 7;
                    i++
                ) {

                    ctx.fillRect(
                        portal.x +
                            i *
                            10,

                        portal.y +
                            i *
                            7,

                        portal.w -
                            i *
                            20,

                        12
                    );

                }


                ctx.strokeStyle =
                    "rgba(190,95,63,.6)";


                ctx.strokeRect(
                    portal.x,
                    portal.y,
                    portal.w,
                    portal.h
                );


                ctx.restore();


                continue;

            }


            const cx =
                portal.x +
                portal.w /
                2;


            const cy =
                portal.y +
                portal.h /
                2;


            const gradient =
                ctx.createRadialGradient(
                    cx,
                    cy,
                    6,

                    cx,
                    cy,
                    Math.max(
                        portal.w,
                        portal.h
                    )
                );


            gradient.addColorStop(
                0,
                "rgba(220,198,255,.58)"
            );


            gradient.addColorStop(
                1,
                "rgba(80,55,110,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                portal.x -
                    80,

                portal.y -
                    80,

                portal.w +
                    160,

                portal.h +
                    160
            );


            ctx.strokeStyle =
                "rgba(226,210,255,.82)";


            ctx.lineWidth =
                4;


            ctx.strokeRect(
                portal.x,
                portal.y,
                portal.w,
                portal.h
            );


            ctx.restore();

        }


        drawGates();

    }


    /* =========================================================
       DROPS
       ========================================================= */

    function drawDrops() {

        for (
            const drop of
            state.world
                .drops
        ) {

            const item =
                ITEMS[
                    drop.itemId
                ];


            if (
                !item
            ) {

                continue;

            }


            const bob =
                Math.sin(
                    state.time *
                    4 +
                    drop.bob
                ) *
                6;


            ctx.save();


            const glow =
                ctx.createRadialGradient(
                    drop.x,
                    drop.y +
                        bob,

                    2,

                    drop.x,
                    drop.y +
                        bob,

                    34
                );


            glow.addColorStop(
                0,
                "rgba(255,230,160,.35)"
            );


            glow.addColorStop(
                1,
                "rgba(255,230,160,0)"
            );


            ctx.fillStyle =
                glow;


            ctx.fillRect(
                drop.x -
                    40,

                drop.y -
                    40 +
                    bob,

                80,
                80
            );


            ctx.font =
                "29px serif";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                item.icon,

                drop.x,
                drop.y +
                    bob
            );


            ctx.restore();

        }

    }


    /* =========================================================
       HAZARDS
       ========================================================= */

    function drawHazards() {

        for (
            const hazard of
            state.world
                .hazards
        ) {

            ctx.save();


            if (
                hazard.type ===
                "projectile"
            ) {

                ctx.fillStyle =
                    hazard.color ||
                    "#d46a5e";


                ctx.beginPath();


                ctx.arc(
                    hazard.x,
                    hazard.y,

                    hazard.radius,

                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                ctx.globalAlpha =
                    0.25;


                ctx.beginPath();


                ctx.arc(
                    hazard.x,
                    hazard.y,

                    hazard.radius *
                        2.4,

                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                ctx.restore();


                continue;

            }


            const telegraphRatio =
                hazard.maxDelay

                    ? clamp(
                        hazard.delay /
                        hazard.maxDelay,

                        0,
                        1
                    )

                    : 0;


            ctx.fillStyle =
                hazard.color ||
                "rgba(220,52,45,.22)";


            ctx.strokeStyle =
                hazard.triggered

                    ? "rgba(255,210,180,.72)"

                    : "rgba(245,90,80,.85)";


            ctx.lineWidth =
                hazard.triggered
                    ? 5
                    : 3;


            ctx.beginPath();


            ctx.arc(
                hazard.x,
                hazard.y,

                hazard.radius *
                (
                    hazard.triggered
                        ? 1.05
                        : 1
                ),

                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.stroke();


            if (
                !hazard.triggered
            ) {

                ctx.globalAlpha =
                    0.4;


                ctx.strokeStyle =
                    "#fff";


                ctx.beginPath();


                ctx.arc(
                    hazard.x,
                    hazard.y,

                    hazard.radius *
                    (
                        1 -
                        telegraphRatio
                    ),

                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();

            }


            ctx.restore();

        }

    }


    /* =========================================================
       INIMIGOS
       ========================================================= */

    function drawEnemies() {

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


            ctx.save();


            if (
                enemy.charge
                    ?.phase ===
                    "telegraph"
            ) {

                ctx.globalAlpha =
                    0.36;


                ctx.strokeStyle =
                    enemy.charge
                        .color ||
                    "#e36a54";


                ctx.lineWidth =
                    9;


                ctx.setLineDash(
                    [
                        18,
                        12
                    ]
                );


                ctx.beginPath();


                ctx.moveTo(
                    enemy.x,
                    enemy.y
                );


                ctx.lineTo(
                    enemy.x +
                        enemy.charge
                            .directionX *
                            280,

                    enemy.y +
                        enemy.charge
                            .directionY *
                            280
                );


                ctx.stroke();


                ctx.setLineDash(
                    []
                );


                ctx.globalAlpha =
                    1;

            }


            ctx.fillStyle =
                "rgba(0,0,0,.26)";


            ctx.beginPath();


            ctx.ellipse(
                enemy.x,

                enemy.y +
                    enemy.radius *
                    0.75,

                enemy.radius *
                    0.9,

                enemy.radius *
                    0.32,

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

                    : enemy.color ||
                      "#7b6d6d";


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


            ctx.font =
                `${Math.max(
                    22,
                    enemy.radius *
                    1.15
                )}px serif`;


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                enemy.icon ||
                "👁️",

                enemy.x,
                enemy.y
            );


            if (
                enemy.id ===
                    "monarch" &&
                enemy.staggerTimer >
                    0
            ) {

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    const angle =
                        state.time *
                        5 +
                        i *
                        Math.PI /
                        2;


                    ctx.font =
                        "19px serif";


                    ctx.fillText(
                        i %
                        2

                            ? "✦"

                            : "🥷",

                        enemy.x +
                            Math.cos(
                                angle
                            ) *
                            48,

                        enemy.y -
                            enemy.radius -
                            30 +
                            Math.sin(
                                angle
                            ) *
                            8
                    );

                }

            }


            ctx.restore();


            if (
                enemy.aggressive ||
                isBossId(
                    enemy.id
                ) ||
                enemy.type ===
                    "resourceBoss"
            ) {

                const width =
                    isBossId(
                        enemy.id
                    )

                        ? 92

                        : 68;


                const ratio =
                    clamp(
                        enemy.hp /
                        enemy.maxHp,

                        0,
                        1
                    );


                ctx.fillStyle =
                    "rgba(0,0,0,.52)";


                ctx.fillRect(
                    enemy.x -
                        width /
                        2,

                    enemy.y -
                        enemy.radius -
                        28,

                    width,
                    7
                );


                ctx.fillStyle =
                    enemy.id ===
                    "monarch"

                        ? "#8f5ca6"

                        : "#c04d4d";


                ctx.fillRect(
                    enemy.x -
                        width /
                        2,

                    enemy.y -
                        enemy.radius -
                        28,

                    width *
                        ratio,

                    7
                );

            }

        }

    }


    /* =========================================================
       EFEITOS
       ========================================================= */

    function drawEffects() {

        for (
            const effect of
            state.world
                .effects
        ) {

            const ratio =
                effect.maxLife

                    ? clamp(
                        effect.life /
                        effect.maxLife,

                        0,
                        1
                    )

                    : 1;


            ctx.save();


            ctx.globalAlpha =
                Math.max(
                    0.05,
                    ratio
                );


            if (
                effect.type ===
                "damageNumber"
            ) {

                ctx.fillStyle =
                    effect.color ||
                    "#fff";


                ctx.font =
                    effect.playerDamage

                        ? "800 20px Arial"

                        : "800 18px Arial";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    effect.text ||
                    "",

                    effect.x,

                    effect.y -
                    (
                        1 -
                        ratio
                    ) *
                    34
                );


                ctx.restore();


                continue;

            }


            if (
                [
                    "basicProjectile",
                    "memoryOrb",
                    "fairyArrow"
                ].includes(
                    effect.type
                )
            ) {

                const targetX =
                    effect.targetX ??
                    effect.x;


                const targetY =
                    effect.targetY ??
                    effect.y;


                const progress =
                    1 -
                    ratio;


                const x =
                    lerp(
                        effect.x,
                        targetX,
                        progress
                    );


                const y =
                    lerp(
                        effect.y,
                        targetY,
                        progress
                    );


                ctx.fillStyle =
                    effect.color;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,

                    effect.radius ||
                        10,

                    0,
                    Math.PI *
                    2
                );


                ctx.fill();


                ctx.restore();


                continue;

            }


            if (
                [
                    "basicAttack",
                    "heavySlash"
                ].includes(
                    effect.type
                )
            ) {

                ctx.strokeStyle =
                    effect.color;


                ctx.lineWidth =
                    effect.type ===
                    "heavySlash"

                        ? 15

                        : 9;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,

                    effect.radius,

                    effect.angle -
                        0.75,

                    effect.angle +
                        0.75
                );


                ctx.stroke();


                ctx.restore();


                continue;

            }


            if (
                effect.type ===
                "chargeTelegraph"
            ) {

                ctx.strokeStyle =
                    effect.color;


                ctx.lineWidth =
                    6;


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
                    effect.targetX,
                    effect.targetY
                );


                ctx.stroke();


                ctx.restore();


                continue;

            }


            if (
                effect.type ===
                "chimeraDash"
            ) {

                ctx.strokeStyle =
                    effect.color;


                ctx.lineWidth =
                    14;


                ctx.beginPath();


                ctx.moveTo(
                    effect.x,
                    effect.y
                );


                ctx.lineTo(
                    effect.targetX,
                    effect.targetY
                );


                ctx.stroke();


                ctx.restore();


                continue;

            }


            const ringTypes =
                new Set([
                    "dashBurst",
                    "dashImpact",
                    "arcaneNova",
                    "memoryStorm",
                    "guardianShield",
                    "steelOath",
                    "smash",
                    "roar",
                    "earthquake",
                    "fairyHeal",
                    "starRain",
                    "adaptiveForm",
                    "perfectForm",
                    "playerHit",
                    "enemyAttack",
                    "projectileHit",
                    "hazardImpact",
                    "enemyDefeat",
                    "bossDefeat",
                    "levelUp",
                    "questComplete",
                    "forge",
                    "gateUnlock",
                    "dashUnlock",
                    "resourceCollect",
                    "treeCut",
                    "foodCollect",
                    "potion",
                    "memoryFlute",
                    "monarchStagger",
                    "chargeBurst"
                ]);


            if (
                ringTypes.has(
                    effect.type
                )
            ) {

                ctx.strokeStyle =
                    effect.color ||
                    "#fff";


                ctx.lineWidth =
                    effect.type ===
                    "bossDefeat"

                        ? 8

                        : 5;


                ctx.beginPath();


                ctx.arc(
                    effect.x,
                    effect.y,

                    (
                        effect.radius ||
                        45
                    ) *
                    (
                        0.55 +
                        (
                            1 -
                            ratio
                        ) *
                        0.55
                    ),

                    0,
                    Math.PI *
                    2
                );


                ctx.stroke();

            }


            ctx.restore();

        }

    }


    function drawParticles() {

        for (
            const particle of
            state.world
                .particles
        ) {

            const ratio =
                particle.maxLife

                    ? clamp(
                        particle.life /
                        particle.maxLife,

                        0,
                        1
                    )

                    : 1;


            ctx.save();


            ctx.globalAlpha =
                ratio;


            ctx.fillStyle =
                particle.color ||
                "#fff";


            ctx.beginPath();


            ctx.arc(
                particle.x,
                particle.y,

                particle.size ||
                    3,

                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }

    }


    /* =========================================================
       PLAYER
       ========================================================= */

    function drawPlayer() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;

        }


        ctx.save();


        if (
            player.invincible >
                0 &&
            Math.floor(
                state.time *
                16
            ) %
                2 ===
                0
        ) {

            ctx.globalAlpha =
                0.58;

        }


        ctx.fillStyle =
            "rgba(0,0,0,.28)";


        ctx.beginPath();


        ctx.ellipse(
            player.x,
            player.y +
                20,

            21,
            8,

            0,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        if (
            player.adaptiveBuff ||
            player.shieldTimer >
                0
        ) {

            const palette =
                getCharacterPalette();


            ctx.strokeStyle =
                player.shieldTimer >
                0

                    ? "rgba(220,230,255,.7)"

                    : palette.glow;


            ctx.lineWidth =
                4;


            ctx.beginPath();


            ctx.arc(
                player.x,
                player.y,

                player.radius +
                12 +
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


        ctx.fillStyle =
            player.color;


        ctx.beginPath();


        ctx.arc(
            player.x,
            player.y,

            player.radius,

            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.font =
            "27px serif";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            player.icon,

            player.x,
            player.y
        );


        ctx.font =
            "700 13px Arial";


        ctx.fillStyle =
            "#fff";


        ctx.fillText(
            player.name,

            player.x,

            player.y -
                35
        );


        ctx.restore();

    }


    function drawWorldLabels() {

        ctx.save();


        ctx.textAlign =
            "center";


        ctx.font =
            "700 13px Arial";


        for (
            const trial of
            state.world
                .trials
        ) {

            if (
                state.area ===
                    "monarchMaze" &&
                !hasItem(
                    "lanterna"
                )
            ) {

                continue;

            }


            ctx.fillStyle =
                "rgba(255,255,255,.76)";


            ctx.fillText(
                trial.title,

                trial.x,

                trial.y -
                trial.radius -
                18
            );

        }


        const hell =
            getHellStairPortal();


        if (
            hell
        ) {

            ctx.fillStyle =
                "rgba(255,210,180,.82)";


            ctx.fillText(
                "ESCADA DO INFERNO",

                hell.x +
                    hell.w /
                    2,

                hell.y -
                    15
            );

        }


        ctx.restore();

    }


    /* =========================================================
       BARRA DE BOSS
       ========================================================= */

    function findBossBarTarget() {

        let boss =
            state.bossBarTarget;


        if (
            boss &&
            !boss.dead &&
            boss.hp >
                0
        ) {

            return boss;

        }


        boss =
            state.world
                .enemies
                .find(
                    enemy =>
                        !enemy.dead &&
                        enemy.hp >
                            0 &&
                        (
                            enemy.id ===
                                "monarch" ||
                            enemy.finalBoss ||
                            enemy.type ===
                                "progression" ||
                            enemy.type ===
                                "resourceBoss"
                        ) &&
                        (
                            enemy.aggressive ||
                            enemy.accepted
                        )
                );


        return boss ||
            null;

    }


    function drawBossBar() {

        const boss =
            findBossBarTarget();


        if (
            !boss
        ) {

            return;

        }


        const width =
            Math.min(
                590,
                window.innerWidth -
                    80
            );


        const x =
            (
                window.innerWidth -
                width
            ) /
            2;


        const y =
            30;


        const ratio =
            clamp(
                boss.hp /
                boss.maxHp,

                0,
                1
            );


        ctx.save();


        ctx.fillStyle =
            "rgba(8,8,12,.86)";


        ctx.fillRect(
            x -
                14,

            y -
                23,

            width +
                28,

            64
        );


        ctx.fillStyle =
            "rgba(255,255,255,.10)";


        ctx.fillRect(
            x,
            y,
            width,
            22
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
                "#925fa9"
            );


            gradient.addColorStop(
                1,
                "#512852"
            );

        }

        else if (
            boss.id ===
            "other_self"
        ) {

            gradient.addColorStop(
                0,
                "#b99cc4"
            );


            gradient.addColorStop(
                1,
                "#5d485e"
            );

        }

        else {

            gradient.addColorStop(
                0,
                "#cc6158"
            );


            gradient.addColorStop(
                1,
                "#762d32"
            );

        }


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            x,
            y,

            width *
                ratio,

            22
        );


        ctx.strokeStyle =
            "rgba(255,255,255,.40)";


        ctx.strokeRect(
            x,
            y,
            width,
            22
        );


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "#fff";


        ctx.font =
            "800 15px Arial";


        const extra =
            boss.id ===
                "monarch" &&
            boss.staggerTimer >
                0

                ? ` • DESNORTEADO ${boss.staggerTimer.toFixed(1)}s`

                : boss.id ===
                  "other_self"

                  ? ` • FASE ${getFinalBossPhase(boss)}`

                  : "";


        ctx.fillText(
            `${boss.name}${extra}`,

            window.innerWidth /
                2,

            y -
                7
        );


        ctx.font =
            "700 12px Arial";


        ctx.fillText(
            `${Math.ceil(
                boss.hp
            )} / ${Math.ceil(
                boss.maxHp
            )}`,

            window.innerWidth /
                2,

            y +
                16
        );


        ctx.restore();

    }


    /* =========================================================
       HUD DAS HABILIDADES
       ========================================================= */

    function drawSkillHud() {

        const player =
            state.player;


        if (
            !player ||
            state.houseMode
        ) {

            return;

        }


        const skills =
            getCharacterSkills();


        const entries = [

            [
                "Q",
                "q"
            ],

            [
                "R",
                "r"
            ],

            [
                "F",
                "f"
            ]

        ];


        const size =
            54;


        const gap =
            10;


        const total =
            entries.length *
            size +
            (
                entries.length -
                1
            ) *
            gap;


        const y =
            window.innerHeight -
            80;


        let x =
            window.innerWidth /
            2 -
            total /
            2;


        ctx.save();


        ctx.textAlign =
            "center";


        for (
            const [
                label,
                slot
            ] of
            entries
        ) {

            const skill =
                skills[
                    slot
                ];


            const unlocked =
                player.level >=
                skill.level;


            const cooldown =
                player.skillCooldowns[
                    slot
                ] ||
                0;


            ctx.fillStyle =
                unlocked

                    ? "rgba(15,17,23,.84)"

                    : "rgba(15,17,23,.58)";


            ctx.fillRect(
                x,
                y,
                size,
                size
            );


            ctx.strokeStyle =
                unlocked

                    ? "rgba(255,255,255,.36)"

                    : "rgba(255,255,255,.14)";


            ctx.strokeRect(
                x,
                y,
                size,
                size
            );


            ctx.fillStyle =
                "#fff";


            ctx.font =
                "800 15px Arial";


            ctx.fillText(
                label,

                x +
                size /
                2,

                y +
                18
            );


            ctx.font =
                "10px Arial";


            ctx.fillText(
                unlocked

                    ? skill.name
                        .slice(
                            0,
                            9
                        )

                    : `Nv.${skill.level}`,

                x +
                size /
                2,

                y +
                38
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
                    "700 11px Arial";


                ctx.fillText(
                    cooldown
                        .toFixed(
                            1
                        ),

                    x +
                    size /
                    2,

                    y +
                    51
                );

            }


            x +=
                size +
                gap;

        }


        if (
            player.abilities
                ?.dash
        ) {

            const dashX =
                window.innerWidth /
                2 +
                total /
                2 +
                20;


            ctx.fillStyle =
                "rgba(15,17,23,.84)";


            ctx.fillRect(
                dashX,
                y,

                76,
                size
            );


            ctx.strokeStyle =
                "rgba(200,160,230,.6)";


            ctx.strokeRect(
                dashX,
                y,

                76,
                size
            );


            ctx.fillStyle =
                "#fff";


            ctx.font =
                "800 10px Arial";


            ctx.fillText(
                "ESPAÇO",

                dashX +
                    38,

                y +
                    18
            );


            ctx.font =
                "10px Arial";


            ctx.fillText(
                player.dashCooldown >
                    0

                    ? player.dashCooldown
                        .toFixed(
                            1
                        )

                    : "DASH",

                dashX +
                    38,

                y +
                    39
            );

        }


        ctx.restore();

    }


    /* =========================================================
       LUZ / ESCURIDÃO DO LABIRINTO
       ========================================================= */

    function lightBlockingRects(
        ox,
        oy,
        radius
    ) {

        return state.world
            .obstacles
            .filter(
                obstacle => {

                    const blocks =
                        obstacle.blocksLight ||
                        obstacle.type ===
                            "mazeWall" ||
                        obstacle.type ===
                            "arenaWall";


                    if (
                        !blocks
                    ) {

                        return false;

                    }


                    const nearestX =
                        clamp(
                            ox,
                            obstacle.x,
                            obstacle.x +
                                obstacle.w
                        );


                    const nearestY =
                        clamp(
                            oy,
                            obstacle.y,
                            obstacle.y +
                                obstacle.h
                        );


                    return (
                        Math.hypot(
                            ox -
                                nearestX,

                            oy -
                                nearestY
                        ) <=
                        radius +
                        40
                    );

                }
            );

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


        const segments = [

            [
                rect.x,
                rect.y,
                rect.x +
                    rect.w,
                rect.y
            ],

            [
                rect.x +
                    rect.w,
                rect.y,
                rect.x +
                    rect.w,
                rect.y +
                    rect.h
            ],

            [
                rect.x +
                    rect.w,
                rect.y +
                    rect.h,
                rect.x,
                rect.y +
                    rect.h
            ],

            [
                rect.x,
                rect.y +
                    rect.h,
                rect.x,
                rect.y
            ]

        ];


        for (
            const [
                x1,
                y1,
                x2,
                y2
            ] of
            segments
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

                continue;

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
                    best
            ) {

                best =
                    t;

            }

        }


        return best;

    }


    function computeVisibilityPolygon(
        ox,
        oy,
        radius
    ) {

        const rects =
            lightBlockingRects(
                ox,
                oy,
                radius
            );


        const angles =
            [];


        for (
            let i = 0;
            i < 96;
            i++
        ) {

            angles.push(
                Math.PI *
                2 *
                i /
                96
            );

        }


        for (
            const rect of
            rects
        ) {

            const corners = [

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

            ];


            for (
                const [
                    x,
                    y
                ] of
                corners
            ) {

                const angle =
                    Math.atan2(
                        y -
                            oy,

                        x -
                            ox
                    );


                angles.push(

                    angle -
                        0.00035,

                    angle,

                    angle +
                        0.00035

                );

            }

        }


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


                for (
                    const rect of
                    rects
                ) {

                    distance =
                        Math.min(
                            distance,

                            rayRectDistance(
                                ox,
                                oy,
                                dx,
                                dy,
                                rect,
                                radius
                            )
                        );

                }


                return {

                    x:
                        ox +
                        dx *
                        distance,

                    y:
                        oy +
                        dy *
                        distance

                };

            }
        );

    }


    function drawDarknessOverlay() {

        if (
            state.area !==
                "monarchMaze" ||
            !state.player
        ) {

            return;

        }


        const player =
            state.player;


        const screenX =
            player.x -
            state.camera.x;


        const screenY =
            player.y -
            state.camera.y;


        const hasLantern =
            hasItem(
                "lanterna"
            ) ||
            Boolean(
                player.lanternOwned
            );


        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,.992)";


        ctx.fillRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        ctx.globalCompositeOperation =
            "destination-out";


        /*
            SEM LANTERNA:
            praticamente impossível navegar.
        */

        if (
            !hasLantern
        ) {

            const tinyRadius =
                25;


            const gradient =
                ctx.createRadialGradient(
                    screenX,
                    screenY,
                    0,

                    screenX,
                    screenY,
                    tinyRadius
                );


            gradient.addColorStop(
                0,
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

                tinyRadius,
                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();


            return;

        }


        /*
            COM LANTERNA:
            luz curta e bloqueada pelas paredes.
        */

        const radius =
            125;


        const polygon =
            computeVisibilityPolygon(
                player.x,
                player.y,
                radius
            );


        if (
            polygon.length
        ) {

            ctx.save();


            ctx.translate(
                -state.camera.x,
                -state.camera.y
            );


            ctx.beginPath();


            ctx.moveTo(
                polygon[
                    0
                ].x,

                polygon[
                    0
                ].y
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
                    ].x,

                    polygon[
                        i
                    ].y
                );

            }


            ctx.closePath();


            ctx.clip();


            const gradient =
                ctx.createRadialGradient(
                    player.x,
                    player.y,
                    0,

                    player.x,
                    player.y,
                    radius
                );


            gradient.addColorStop(
                0,
                "rgba(0,0,0,.98)"
            );


            gradient.addColorStop(
                0.58,
                "rgba(0,0,0,.88)"
            );


            gradient.addColorStop(
                0.83,
                "rgba(0,0,0,.48)"
            );


            gradient.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                player.x -
                    radius,

                player.y -
                    radius,

                radius *
                    2,

                radius *
                    2
            );


            ctx.restore();

        }


        ctx.restore();

    }


    /* =========================================================
       TELA VERMELHA / SANGUE
       ========================================================= */

    function drawDamageScreenOverlay() {

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
                    0.58
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
                    0.2,

                    window.innerWidth /
                        2,

                    window.innerHeight /
                        2,

                    Math.max(
                        window.innerWidth,
                        window.innerHeight
                    ) *
                    0.76

                );


            gradient.addColorStop(
                0,
                "rgba(145,0,0,0)"
            );


            gradient.addColorStop(
                0.55,

                `rgba(
                    160,
                    0,
                    0,
                    ${
                        alpha *
                        0.14
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


        for (
            const mark of
            state.bloodMarks
        ) {

            const lifeRatio =
                clamp(
                    mark.life /
                    mark.maxLife,

                    0,
                    1
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
                    112,
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

                mark.radius,

                0,
                Math.PI *
                2
            );


            ctx.fill();


            ctx.restore();

        }


        ctx.restore();

    }


    /* =========================================================
       MAPA
       ========================================================= */

    function drawLargeMap() {

        if (
            !state.player
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
            "#16191b";


        mapCtx.fillRect(
            0,
            0,
            width,
            height
        );


        if (
            state.area ===
                "monarchMaze" &&
            !hasItem(
                "lanterna"
            )
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
                "#b8b3aa";


            mapCtx.font =
                "700 24px Arial";


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


        const sx =
            width /
            state.world.width;


        const sy =
            height /
            state.world.height;


        for (
            const path of
            state.world
                .paths
        ) {

            if (
                !path.points
                    ?.length
            ) {

                continue;

            }


            mapCtx.strokeStyle =
                "rgba(196,170,117,.68)";


            mapCtx.lineWidth =
                Math.max(
                    2,

                    (
                        path.width ||
                        80
                    ) *
                    (
                        sx +
                        sy
                    ) /
                    2
                );


            mapCtx.lineCap =
                "round";


            mapCtx.beginPath();


            mapCtx.moveTo(
                path.points[
                    0
                ].x *
                    sx,

                path.points[
                    0
                ].y *
                    sy
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
                        sx,

                    path.points[
                        i
                    ].y *
                        sy
                );

            }


            mapCtx.stroke();

        }


        if (
            state.area !==
            "monarchMaze"
        ) {

            for (
                const building of
                state.world
                    .buildings
            ) {

                mapCtx.fillStyle =
                    "#9b7659";


                mapCtx.fillRect(

                    building.x *
                        sx,

                    building.y *
                        sy,

                    Math.max(
                        3,
                        building.w *
                        sx
                    ),

                    Math.max(
                        3,
                        building.h *
                        sy
                    )

                );

            }

        }


        mapCtx.fillStyle =
            "#fff";


        mapCtx.beginPath();


        mapCtx.arc(
            state.player.x *
                sx,

            state.player.y *
                sy,

            6,
            0,
            Math.PI *
            2
        );


        mapCtx.fill();

    }


    /* =========================================================
       MINIMAPA
       ========================================================= */

    function drawMinimap() {

        if (
            !state.player
        ) {

            return;

        }


        miniCtx.clearRect(
            0,
            0,
            miniCanvas.width,
            miniCanvas.height
        );


        if (
            !hasItem(
                "minimapa"
            ) &&
            !state.player
                .minimapOwned
        ) {

            return;

        }


        if (
            state.houseMode
        ) {

            miniCtx.fillStyle =
                "#16191c";


            miniCtx.fillRect(
                0,
                0,
                miniCanvas.width,
                miniCanvas.height
            );


            miniCtx.fillStyle =
                "#d7c9a6";


            miniCtx.font =
                "700 12px Arial";


            miniCtx.textAlign =
                "center";


            miniCtx.fillText(
                "INTERIOR",

                miniCanvas.width /
                    2,

                miniCanvas.height /
                    2
            );


            return;

        }


        if (
            state.area ===
            "monarchMaze"
        ) {

            miniCtx.fillStyle =
                "#050506";


            miniCtx.fillRect(
                0,
                0,
                miniCanvas.width,
                miniCanvas.height
            );


            if (
                !hasItem(
                    "lanterna"
                )
            ) {

                miniCtx.fillStyle =
                    "#b9b3aa";


                miniCtx.font =
                    "700 11px Arial";


                miniCtx.textAlign =
                    "center";


                miniCtx.fillText(
                    "ESCURIDÃO TOTAL",

                    miniCanvas.width /
                        2,

                    miniCanvas.height /
                        2
                );


                return;

            }


            miniCtx.fillStyle =
                "#fff";


            miniCtx.beginPath();


            miniCtx.arc(
                miniCanvas.width /
                    2,

                miniCanvas.height /
                    2,

                4,
                0,
                Math.PI *
                2
            );


            miniCtx.fill();


            return;

        }


        const width =
            miniCanvas.width;


        const height =
            miniCanvas.height;


        const sx =
            width /
            state.world.width;


        const sy =
            height /
            state.world.height;


        miniCtx.fillStyle =
            "rgba(11,13,16,.90)";


        miniCtx.fillRect(
            0,
            0,
            width,
            height
        );


        for (
            const path of
            state.world
                .paths
        ) {

            if (
                !path.points
                    ?.length
            ) {

                continue;

            }


            miniCtx.strokeStyle =
                "rgba(196,168,107,.62)";


            miniCtx.lineWidth =
                Math.max(
                    1,

                    (
                        path.width ||
                        80
                    ) *
                    (
                        sx +
                        sy
                    ) /
                    2
                );


            miniCtx.lineCap =
                "round";


            miniCtx.beginPath();


            miniCtx.moveTo(
                path.points[
                    0
                ].x *
                    sx,

                path.points[
                    0
                ].y *
                    sy
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
                        sx,

                    path.points[
                        i
                    ].y *
                        sy
                );

            }


            miniCtx.stroke();

        }


        if (
            state.area ===
            "village"
        ) {

            for (
                const building of
                state.world
                    .buildings
            ) {

                miniCtx.fillStyle =
                    "#9d7657";


                miniCtx.fillRect(

                    building.x *
                        sx,

                    building.y *
                        sy,

                    Math.max(
                        3,
                        building.w *
                        sx
                    ),

                    Math.max(
                        3,
                        building.h *
                        sy
                    )

                );

            }

        }


        miniCtx.fillStyle =
            "#fff";


        miniCtx.beginPath();


        miniCtx.arc(
            state.player.x *
                sx,

            state.player.y *
                sy,

            4,
            0,
            Math.PI *
            2
        );


        miniCtx.fill();

    }


    /* =========================================================
       DRAW COMPLETO
       ========================================================= */

    function draw() {

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


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

            drawEffects();

            drawPlayer();

            drawParticles();

        }

        else {

            drawGround();

            drawPaths();

            drawAmbientDetails();

            drawDecorations();

            drawBuildings();

            drawTrees();

            drawResources();

            drawFoods();

            drawSecrets();

            drawObstacles();

            drawTrials();

            drawHazards();

            drawPortals();

            drawDrops();

            drawEffects();

            drawNPCs();

            drawEnemies();

            drawPlayer();

            drawWorldLabels();

            drawParticles();

        }


        ctx.restore();


        drawDarknessOverlay();

        drawBossBar();

        drawSkillHud();

        drawDamageScreenOverlay();

        drawMinimap();

        drawTransitionOverlay();

    }


    /* =========================================================
       UPDATE PRINCIPAL
       ========================================================= */

    function update(
        dt
    ) {

        if (
            !state.player
        ) {

            return;

        }


        state.time +=
            dt;


        /*
            TRANSIÇÃO PRECISA CONTINUAR
            MESMO COM O JOGO PAUSADO.
        */

        if (
            state.transition
        ) {

            updateTransition(
                dt
            );


            updateVisualEffects(
                dt
            );


            updateDamageScreenEffect(
                dt
            );


            updateCamera();


            updateHUD();


            return;

        }


        const modalFreeze =
            state.dialogue ||
            state.travel ||
            state.battle ||
            isGameplayOverlayOpen() ||
            state.player.dead;


        if (
            !state.paused &&
            !modalFreeze
        ) {

            updatePartTwoSystems(
                dt
            );

        }

        else {

            updateVisualEffects(
                dt
            );


            updateDamageScreenEffect(
                dt
            );

        }


        updateCamera();


        updateHUD();


        if (
            !must(
                "mapPanel"
            )
                .classList
                .contains(
                    "hidden"
                )
        ) {

            drawLargeMap();

        }

    }


    /* =========================================================
       GAME LOOP
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


        update(
            dt
        );


        draw();


        requestAnimationFrame(
            gameLoop
        );

    }


    /* =========================================================
       SAVE
       ========================================================= */

    function makeSavePayload() {

        return {

            version:
                GAME_VERSION,

            area:
                state.area,

            player:
                state.player,

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
                "Erro lendo saves:",
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


    /* =========================================================
       MIGRAÇÃO DE INVENTÁRIO ANTIGO
       ========================================================= */

    function migrateLegacyInventory(
        inventory
    ) {

        const migrated = {

            ...(
                inventory ||
                {}
            )

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
                "armaduraAlgodao",

            armaduraMadeiraVelha:
                "armaduraMadeira"

        };


        Object.entries(
            aliases
        )
            .forEach(
                (
                    [
                        oldId,
                        newId
                    ]
                ) => {

                    if (
                        migrated[
                            oldId
                        ] &&
                        !migrated[
                            newId
                        ]
                    ) {

                        migrated[
                            newId
                        ] =
                            migrated[
                                oldId
                            ];

                    }

                }
            );


        return migrated;

    }


    /* =========================================================
       REPARO DO PLAYER CARREGADO
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


        player.baseMaxHp =
            Number(
                player.baseMaxHp
            ) ||
            character.hp;


        player.baseMaxMagic =
            Number(
                player.baseMaxMagic
            ) ||
            character.magic;


        player.baseMaxEnergy =
            Number(
                player.baseMaxEnergy
            ) ||
            character.energy;


        player.baseDamage =
            Number(
                player.baseDamage
            ) ||
            character.damage;


        player.baseDefense =
            Number(
                player.baseDefense
            ) ||
            character.defense;


        player.baseSpeed =
            Number(
                player.baseSpeed
            ) ||
            character.speed;


        const oldInventory =
            migrateLegacyInventory(
                player.inventory
            );


        player.inventory =
            {};


        Object.keys(
            ITEMS
        )
            .forEach(
                id => {

                    const value =
                        Number(
                            oldInventory
                                ?.[
                                    id
                                ]
                        );


                    player.inventory[
                        id
                    ] =
                        Number.isFinite(
                            value
                        ) &&
                        value >=
                            0

                            ? Math.floor(
                                value
                            )

                            : 0;

                }
            );


        /*
            MIGRAÇÃO DO MACHADO:
            se saves antigos não tinham
            essa chave, ela volta.
        */

        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    oldInventory ||
                        {},

                    "machado"
                )
        ) {

            player.inventory
                .machado =
                1;

        }


        /*
            ESPADA INICIAL:
            save antigo sem arma recebe
            a espada simples.
        */

        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    oldInventory ||
                        {},

                    "espadaSimples"
                ) &&
            !player.equipment
                ?.weapon
        ) {

            player.inventory
                .espadaSimples =
                Math.max(
                    1,
                    player.inventory
                        .espadaSimples
                );

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
                .tool ===
                "machado" &&
            player.inventory
                .machado <=
                0
        ) {

            player.inventory
                .machado =
                1;

        }


        if (
            player.equipment
                .weapon ===
                "espadaSimples" &&
            player.inventory
                .espadaSimples <=
                0
        ) {

            player.inventory
                .espadaSimples =
                1;

        }


        player.inventoryWeightLimit =
            Math.max(
                60,

                Number(
                    player.inventoryWeightLimit
                ) ||
                100
            );


        player.level =
            clamp(

                Math.floor(
                    Number(
                        player.level
                    ) ||
                    1
                ),

                1,
                MAX_LEVEL

            );


        player.xp =
            Math.max(
                0,

                Math.floor(
                    Number(
                        player.xp
                    ) ||
                    0
                )
            );


        player.xpToNext =
            Math.max(

                100,

                Math.floor(
                    Number(
                        player.xpToNext
                    ) ||
                    calculateXPRequirement(
                        player.level
                    )
                )

            );


        player.statPoints =
            Math.max(
                0,

                Math.floor(
                    Number(
                        player.statPoints
                    ) ||
                    0
                )
            );


        player.money =
            Math.max(
                0,

                Math.floor(
                    Number(
                        player.money
                    ) ||
                    0
                )
            );


        player.memory =
            clamp(
                Number(
                    player.memory
                ) ||
                0,

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


        Object.keys(
            STAT_CONFIG
        )
            .forEach(
                key => {

                    player.stats[
                        key
                    ] =
                        clamp(

                            Math.floor(
                                Number(
                                    player.stats[
                                        key
                                    ]
                                ) ||
                                0
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


        player.quest
            .wood = {

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


        player.quest
            .coal = {

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


        player.unlockedAreas =
            Array.isArray(
                player.unlockedAreas
            )

                ? player.unlockedAreas

                : [
                    "village"
                ];


        player.exploredAreas =
            Array.isArray(
                player.exploredAreas
            )

                ? player.exploredAreas

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


        Object.keys(
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
                                `${player.name}:${area}:${index}:migrated`
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


        player.checkpoint =
            player.checkpoint ||
            {

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


        player.damageReduction =
            0;


        player.shieldTimer =
            0;


        player.stunTimer =
            0;


        player.invincible =
            0;


        player.attackCooldown =
            0;


        player.dashCooldown =
            0;


        player.adaptiveBuff =
            false;


        player.adaptiveTimer =
            0;


        player.playerDash =
            null;


        player.dead =
            false;


        player.radius =
            Number(
                player.radius
            ) ||
            18;


        applyStatBonuses(
            false
        );


        player.hp =
            clamp(

                Number(
                    player.hp
                ) ||
                player.maxHp,

                1,
                player.maxHp

            );


        player.magic =
            clamp(

                Number(
                    player.magic
                ) ||
                player.maxMagic,

                0,
                player.maxMagic

            );


        player.energy =
            clamp(

                Number(
                    player.energy
                ) ||
                player.maxEnergy,

                0,
                player.maxEnergy

            );


        player.hunger =
            clamp(

                Number.isFinite(
                    Number(
                        player.hunger
                    )
                )

                    ? Number(
                        player.hunger
                    )

                    : player.maxHunger,

                0,
                player.maxHunger

            );


        player.fatigue =
            clamp(

                Number.isFinite(
                    Number(
                        player.fatigue
                    )
                )

                    ? Number(
                        player.fatigue
                    )

                    : player.maxFatigue,

                0,
                player.maxFatigue

            );


        player.minimapOwned =
            hasItem(
                "minimapa"
            ) ||
            Boolean(
                player.minimapOwned
            );


        player.lanternOwned =
            hasItem(
                "lanterna"
            ) ||
            Boolean(
                player.lanternOwned
            );


        if (
            player.monarchDefeated &&
            player.dashPurchased
        ) {

            player.abilities
                .dash =
                true;

        }

    }


    /* =========================================================
       LOAD GAME
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

                    state.currentHouse =
                        building;


                    state.houseMode =
                        true;


                    state.houseReturn =
                        save.houseReturn ||
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


                    placePlayerInsideHouse();

                }

            }


            if (
                !state.houseMode
            ) {

                state.player.x =
                    clamp(

                        Number(
                            state.player.x
                        ) ||
                        500,

                        90,

                        state.world.width -
                            90

                    );


                state.player.y =
                    clamp(

                        Number(
                            state.player.y
                        ) ||
                        1120,

                        90,

                        state.world.height -
                            90

                    );

            }


            repairProgressionRewards();


            handleBossProgression();


            showScreen(
                "game"
            );


            state.running =
                true;


            state.paused =
                false;


            state.pauseReason =
                null;


            state.lastTime =
                performance.now();


            updateCamera();


            updateHUD();


            updateInventory();


            startTransition({

                label:
                    REGIONS[
                        state.area
                    ]
                        .name,

                startBlack:
                    true,

                hold:
                    0.35,

                fadeIn:
                    0.65,

                done:
                    () => {

                        if (
                            entry.legacy
                        ) {

                            saveGame(
                                false
                            );


                            showToast(
                                "Save antigo carregado e migrado para a versão atual.",
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
            $(
                "continueBtn"
            );


        const hint =
            $(
                "continueHint"
            );


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


        state.holdAction =
            null;


        if (
            state.dialogue
                ?.timer
        ) {

            clearInterval(
                state.dialogue
                    .timer
            );

        }


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


        closeAllGameplayPanels();


        $(
            "travelPanel"
        )
            ?.classList
            .add(
                "hidden"
            );


        $(
            "battlePanel"
        )
            ?.classList
            .add(
                "hidden"
            );


        $(
            "deathPanel"
        )
            ?.classList
            .add(
                "hidden"
            );


        $(
            "dialogueBox"
        )
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

            closeDialogue();


            return true;

        }


        if (
            state.travel
        ) {

            cancelTravel();


            return true;

        }


        if (
            state.battle
        ) {

            declineBattle();


            return true;

        }


        if (
            isGameplayOverlayOpen()
        ) {

            closeAllGameplayPanels();


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
            state.transition ||
            state.dialogue ||
            state.travel ||
            state.battle ||
            isGameplayOverlayOpen() ||
            state.player
                ?.dead
        ) {

            return;

        }


        /*
            UM CLIQUE = UM ATAQUE.

            SEGURAR O BOTÃO NÃO REPETE
            O ATAQUE.
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


        const movementKeys = [

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
            movementKeys.includes(
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
                )
        ) {

            return;

        }


        if (
            !state.player
        ) {

            return;

        }


        if (
            state.dialogue
        ) {

            if (
                [
                    "enter",
                    "e",
                    " "
                ].includes(
                    key
                ) &&
                !event.repeat
            ) {

                event.preventDefault();


                advanceDialogue();

            }


            return;

        }


        if (
            state.transition ||
            state.player.dead
        ) {

            return;

        }


        /*
            SEGURAR E:
            madeira/minério.
        */

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


            return;

        }


        if (
            key ===
            "q"
        ) {

            useSkill(
                "q"
            );


            return;

        }


        if (
            key ===
            "r"
        ) {

            useSkill(
                "r"
            );


            return;

        }


        if (
            key ===
            "f"
        ) {

            useSkill(
                "f"
            );


            return;

        }


        if (
            key ===
            " "
        ) {

            event.preventDefault();


            useDashAbility();


            return;

        }


        if (
            key ===
            "i"
        ) {

            openInventoryPanel();


            return;

        }


        if (
            key ===
            "m"
        ) {

            openMapPanel();


            return;

        }


        if (
            key ===
            "l"
        ) {

            openBookPanel();


            return;

        }


        if (
            key ===
            "p"
        ) {

            closeAllGameplayPanels(
                "statusPanelDynamic"
            );


            openStatusPanel();


            return;

        }


        if (
            key ===
            "1"
        ) {

            useItem(
                "pocao"
            );


            return;

        }


        if (
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

            cancelHoldAction();

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
            !element
        ) {

            return;

        }


        element.addEventListener(
            "click",
            callback
        );

    }


    function bindPanelTabs() {

        document
            .querySelectorAll(
                "#inventoryTabs .tab"
            )
            .forEach(
                tab => {

                    tab.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    "#inventoryTabs .tab"
                                )
                                .forEach(
                                    item => {

                                        item.classList
                                            .toggle(
                                                "active",
                                                item ===
                                                    tab
                                            );

                                    }
                                );


                            state.inventoryCategory =
                                tab.dataset
                                    .cat ||
                                tab.dataset
                                    .category ||
                                "all";


                            updateInventory();

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "#shopTabs .tab"
            )
            .forEach(
                tab => {

                    tab.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    "#shopTabs .tab"
                                )
                                .forEach(
                                    item => {

                                        item.classList
                                            .toggle(
                                                "active",
                                                item ===
                                                    tab
                                            );

                                    }
                                );


                            state.shopMode =
                                tab.dataset
                                    .shop ||
                                "buy";


                            updateShop();

                        }
                    );

                }
            );

    }


    function bindStaticCloseButtons() {

        document
            .querySelectorAll(
                "[data-close]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset
                                    .close;


                            if (
                                id &&
                                $(id)
                            ) {

                                $(id)
                                    .classList
                                    .add(
                                        "hidden"
                                    );

                            }

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
            () => {

                if (
                    !loadGame()
                ) {

                    updateContinueButton();

                }

            }
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


        $(
            "playerName"
        )
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


        bindPanelTabs();


        bindStaticCloseButtons();


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


                cancelHoldAction();

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
       AUDITORIA DE INICIALIZAÇÃO
       ========================================================= */

    function runStartupAudit() {

        const requiredIds = [

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

            "travelPanel",

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
            requiredIds
                .filter(
                    id =>
                        !$(id)
                );


        if (
            missing.length
        ) {

            throw new Error(
                `VEYRA: HTML incompatível. IDs ausentes: ${missing.join(", ")}`
            );

        }


        const requiredFunctions = [

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

            transitionToRegion,

            saveGame,

            loadGame

        ];


        if (
            requiredFunctions
                .some(
                    fn =>
                        typeof fn !==
                        "function"
                )
        ) {

            throw new Error(
                "VEYRA: auditoria de inicialização encontrou função obrigatória ausente."
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


        bindEvents();


        updateContinueButton();


        /*
            NÃO ALTERA A TELA
            DE INTRODUÇÃO.
        */

        showScreen(
            "menu"
        );


        state.lastTime =
            performance.now();

    }


    initialize();


})();
