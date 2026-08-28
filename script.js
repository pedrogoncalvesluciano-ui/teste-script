(() => {
    "use strict";

    /* =====================================================
       VEYRA — A QUIETUDE
       NOVA VERSÃO

       - 4 rotas saindo da vila
       - sistema de status
       - nível máximo
       - novas armaduras
       - diamante
       - lanterna
       - labirinto aleatório
       - Monarca
       - Dash
       - efeitos de dano
    ===================================================== */

    const SAVE_KEY =
        "veyra_save_v14_stable";

    const GAME_VERSION =
        17;

    const MAX_LEVEL =
        50;

    const POINTS_PER_LEVEL =
        3;

    const STAT_POINT_CAP =
        30;

    const DASH_RUBY_COST =
        60;

    const DASH_DIAMOND_COST =
        45;

    const NORTH_GATE_REQUIREMENTS = {
        diamante:
            40,

        rubi:
            55
    };


    /* =====================================================
       DOM
    ===================================================== */

    const $ = id =>
        document.getElementById(
            id
        );


    const must = id => {

        const element =
            $(
                id
            );


        if (
            !element
        ) {

            throw new Error(
                `Elemento obrigatório não encontrado: #${id}`
            );
        }


        return element;
    };


    /* =====================================================
       CANVAS
    ===================================================== */

    const canvas =
        must(
            "gameCanvas"
        );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const miniCanvas =
        must(
            "miniCanvas"
        );


    const miniCtx =
        miniCanvas.getContext(
            "2d"
        );


    const mapCanvas =
        must(
            "worldMapCanvas"
        );


    const mapCtx =
        mapCanvas.getContext(
            "2d"
        );


    /* =====================================================
       TELAS
    ===================================================== */

    const screens = {

        menu:
            must(
                "menuScreen"
            ),

        how:
            must(
                "howScreen"
            ),

        credits:
            must(
                "creditsScreen"
            ),

        character:
            must(
                "characterScreen"
            ),

        game:
            must(
                "gameScreen"
            )
    };


    /* =====================================================
       PERSONAGENS
    ===================================================== */

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
    ];


    /* =====================================================
       STATUS
    ===================================================== */

    const STAT_CONFIG = {

        strength: {

            name:
                "Força",

            icon:
                "⚔️",

            description:
                "Aumenta o dano causado.",

            cap:
                STAT_POINT_CAP
        },


        hp: {

            name:
                "HP",

            icon:
                "❤️",

            description:
                "Aumenta a vida máxima.",

            cap:
                STAT_POINT_CAP
        },


        energy: {

            name:
                "Energia",

            icon:
                "⚡",

            description:
                "Aumenta sua energia máxima.",

            cap:
                STAT_POINT_CAP
        },


        hunger: {

            name:
                "Fome",

            icon:
                "🍖",

            description:
                "Aumenta sua reserva máxima de fome.",

            cap:
                STAT_POINT_CAP
        },


        fatigue: {

            name:
                "Cansaço",

            icon:
                "💤",

            description:
                "Aumenta sua resistência máxima ao cansaço.",

            cap:
                STAT_POINT_CAP
        }
    ];


    /* =====================================================
       ITENS
    ===================================================== */

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
                5
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
                6
        },


        ferro: {

            name:
                "Minério de Ferro",

            icon:
                "⛏️",

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
                75
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
                95
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
                350,

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
                50
        },


        /* =================================================
           ARMADURAS SIMPLES — DORAN
        ================================================= */

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


        /* =================================================
           ARMADURAS AVANÇADAS — BORIN
        ================================================= */

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
    ];


    /* =====================================================
       RECEITAS DO FERREIRO
    ===================================================== */

    const ARMOR_UPGRADES = {

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
    };


    /* =====================================================
       REGIÕES
    ===================================================== */

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
                2900,

            height:
                1900,

            visual:
                "iron"
        },


        ruby: {

            name:
                "CAVERNA DE RUBI",

            width:
                3100,

            height:
                2100,

            visual:
                "ruby"
        },


        monarchMaze: {

            name:
                "LABIRINTO DO MONARCA",

            width:
                2600,

            height:
                1900,

            visual:
                "monarchMaze",

            dark:
                true
        },


        shadow: {

            name:
                "TERRAS SOMBRIAS",

            width:
                3200,

            height:
                2200,

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


    /* =====================================================
       REGIÃO ANTERIOR
    ===================================================== */

    const PREVIOUS_REGION = {

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
            "village",

        hell:
            "village",

        final:
            "hell"
    };


    /* =====================================================
       FALAS DOS PORTÕES

       Cada conjunto roda:
       1 → 2 → 3 → 1...
    ===================================================== */

    const GATE_DIALOGUES = {

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
    };


    /* =====================================================
       NPCS
    ===================================================== */

    const NPC_LIBRARY = {

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

                "Tenho algumas armaduras simples. Se quiser coisa realmente resistente, fale com Borin.",

                "Também consegui uma lanterna. Não é barata, mas existem lugares em Veyra onde dinheiro vale menos que enxergar o próximo passo.",

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

                "As árvores daqui são estranhas. Algumas voltam a nascer longe do lugar onde caíram.",

                "Se puder trazer dez madeiras, eu pago pelo trabalho.",

                "Cortar madeira consome magia. Não se esgote por causa de uma árvore."
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

                "Couro é o máximo que Doran consegue vender sem depender de minério raro.",

                "Se quiser Ferro, Ouro, Diamante ou Rubi, vai precisar trazer os materiais.",

                "Equipamento realmente bom não se compra pronto. Se constrói."
            ]
        }
    };


    /* =====================================================
       HABILIDADES DE CLASSE
    ===================================================== */

    const CLASS_SKILLS = {

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
    };


    /* =====================================================
       BOSSES
    ===================================================== */

    const BOSS_REGISTRY = [

        {
            id:
                "forest_guardian",

            name:
                "GUARDIÃO DA ESTRADA",

            icon:
                "👺",

            description:
                "Antigo protetor da passagem leste da vila.",

            quote:
                "Ele continuou guardando a passagem depois de esquecer o motivo."
        },


        {
            id:
                "grove_guardian",

            name:
                "GUARDIÃO DA FLORESTA",

            icon:
                "🌳",

            description:
                "Uma árvore ancestral contaminada por memórias quebradas.",

            quote:
                "As raízes lembram o que as folhas esqueceram."
        },


        {
            id:
                "mountain_guardian",

            name:
                "GUARDIÃO DO BOSQUE",

            icon:
                "🌲",

            description:
                "O último espírito que separa o Bosque das Montanhas.",

            quote:
                "Cada galho carrega um nome que já não possui dono."
        },


        {
            id:
                "iron_guardian",

            name:
                "SENTINELA DAS MONTANHAS",

            icon:
                "🗿",

            description:
                "Sentinela de pedra criada para impedir viajantes de alcançar as minas.",

            quote:
                "A pedra não esqueceu a ordem. Esqueceu apenas quem a deu."
        },


        {
            id:
                "ruby_guardian",

            name:
                "GUARDIÃO DE FERRO",

            icon:
                "⚙️",

            description:
                "Máquina ancestral que continua defendendo os túneis.",

            quote:
                "Quando o último martelo silenciou, ele continuou trabalhando."
        },


        {
            id:
                "shadow_guardian",

            name:
                "GUARDIÃO RUBI",

            icon:
                "🔴",

            description:
                "Uma criatura formada ao redor de um núcleo de rubi vivo.",

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

            description:
                "Uma presença antiga selada além do labirinto. Permanece imóvel enquanto controla a arena com sombras e pedras.",

            quote:
                "O poder que você procurava nunca esteve abandonado."
        },


        {
            id:
                "fairy_guardian",

            name:
                "GUARDIÃO SOMBRIO",

            icon:
                "🌑",

            description:
                "Sombra condensada de exploradores esquecidos.",

            quote:
                "Nenhuma sombra nasce sem algo para bloquear a luz."
        },


        {
            id:
                "sky_guardian",

            name:
                "GUARDIÃ DOS FIOS",

            icon:
                "🧚",

            description:
                "Antiga fada ligada às memórias do mundo.",

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

            description:
                "Vigilante celestial que carrega a Flauta da Memória.",

            quote:
                "A passagem não estava escondida. O mundo havia esquecido que ela existia."
        },


        {
            id:
                "final_gate_guardian",

            name:
                "GUARDIÃO SUPREMO DO INFERNO",

            icon:
                "👿",

            description:
                "Uma entidade formada por memórias destruídas.",

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

            description:
                "Uma versão alternativa do protagonista.",

            quote:
                "Se nada for lembrado, nada poderá sofrer."
        }
    ];


    /* =====================================================
       ESTADO GLOBAL
    ===================================================== */

    const state = {

        selectedCharacter:
            CHARACTERS[0],

        player:
            null,

        running:
            false,

        paused:
            false,

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

        toastTimer:
            null,

        portalCooldown:
            0,

        warnedNeedAt:
            0,

        finalChoiceShown:
            false,

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

        hordeNextAt:
            0,

        screenFadeTimer:
            null,

        screenShake:
            0,

        screenShakePower:
            0,


        /*
            EFEITO DE DANO NA TELA.
        */

        damageFlash:
            0,

        damageFlashMax:
            0.45,

        bloodMarks:
            [],


        /*
            MODAIS NOVOS CRIADOS VIA JS.
        */

        gateModal:
            null,

        altarModal:
            null,

        forgeModal:
            null,

        statusModal:
            null
    };


    /* =====================================================
       MUNDO VAZIO
    ===================================================== */

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


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

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
                max +
                1
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
                .toString(
                    36
                )
                .slice(
                    2,
                    10
                )
        );
    }


    function hashString(
        text
    ) {

        let hash =
            2166136261;


        for (
            let i = 0;
            i <
            text.length;
            i++
        ) {

            hash ^=
                text.charCodeAt(
                    i
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
        salt =
            "layout"
    ) {

        const baseSeed =
            state.player
                ?.worldSeeds
                ?.[area] ??
            hashString(
                `${area}:${salt}`
            );


        return mulberry32(
            (
                baseSeed ^
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
                max +
                1
            )
        );
    }


    function normalizeVector(
        x,
        y
    ) {

        const length =
            Math.hypot(
                x,
                y
            ) ||
            1;


        return {

            x:
                x /
                length,

            y:
                y /
                length
        };
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
            CLASS_SKILLS.kaelion
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
            palettes.kaelion
        );
    }


    function hasItem(
        id,
        amount =
            1
    ) {

        return (
            (
                state.player
                    ?.inventory[
                        id
                    ] ||
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
                ?.abilities[
                    id
                ]
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


    /* =====================================================
       STATUS DERIVADOS
    ===================================================== */

    function applyStatBonuses(
        refill =
            false
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;
        }


        const stats =
            player.stats ||
            {

                strength:
                    0,

                hp:
                    0,

                energy:
                    0,

                hunger:
                    0,

                fatigue:
                    0
            };


        const oldMaxHp =
            player.maxHp ||
            player.baseMaxHp;


        const oldMaxEnergy =
            player.maxEnergy ||
            player.baseMaxEnergy;


        const oldMaxHunger =
            player.maxHunger ||
            100;


        const oldMaxFatigue =
            player.maxFatigue ||
            100;


        player.maxHp =
            Math.round(
                player.baseMaxHp +
                stats.hp *
                8
            );


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


        if (
            refill
        ) {

            player.hp =
                player.maxHp;


            player.energy =
                player.maxEnergy;


            player.hunger =
                player.maxHunger;


            player.fatigue =
                player.maxFatigue;
        }

        else {

            if (
                player.hp >
                oldMaxHp
            ) {

                player.hp =
                    oldMaxHp;
            }


            if (
                player.energy >
                oldMaxEnergy
            ) {

                player.energy =
                    oldMaxEnergy;
            }


            if (
                player.hunger >
                oldMaxHunger
            ) {

                player.hunger =
                    oldMaxHunger;
            }


            if (
                player.fatigue >
                oldMaxFatigue
            ) {

                player.fatigue =
                    oldMaxFatigue;
            }


            player.hp =
                Math.min(
                    player.hp,
                    player.maxHp
                );


            player.energy =
                Math.min(
                    player.energy,
                    player.maxEnergy
                );


            player.hunger =
                Math.min(
                    player.hunger,
                    player.maxHunger
                );


            player.fatigue =
                Math.min(
                    player.fatigue,
                    player.maxFatigue
                );
        }
    }


    /* =====================================================
       TELAS
    ===================================================== */

    function showScreen(
        name
    ) {

        Object.values(
            screens
        ).forEach(
            screen =>
                screen.classList.remove(
                    "active"
                )
        );


        screens[
            name
        ].classList.add(
            "active"
        );
    }


    function fadeToScreen(
        name,
        afterSwitch =
            null
    ) {

        const fade =
            must(
                "uiFade"
            );


        clearTimeout(
            state.screenFadeTimer
        );


        fade.classList.add(
            "active"
        );


        state.screenFadeTimer =
            setTimeout(
                () => {

                    showScreen(
                        name
                    );


                    if (
                        typeof afterSwitch ===
                        "function"
                    ) {

                        afterSwitch();
                    }


                    requestAnimationFrame(
                        () => {

                            requestAnimationFrame(
                                () =>
                                    fade.classList.remove(
                                        "active"
                                    )
                            );
                        }
                    );
                },
                320
            );
    }


    function showToast(
        message
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
                () =>
                    toast.classList.remove(
                        "show"
                    ),
                2600
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
        power =
            8,
        duration =
            0.18
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


    /* =====================================================
       PERSONAGENS NA TELA DE SELEÇÃO
    ===================================================== */

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
                    document.createElement(
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


                card.style.setProperty(
                    "--char-color",
                    character.color
                );


                card.style.setProperty(
                    "--char-bg",
                    character.bg
                );


                card.style.setProperty(
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
                        .join(
                            ""
                        );


                card.innerHTML = `

                    <div class="char-art">
                        ${character.icon}
                    </div>

                    <h3>
                        ${character.name}
                    </h3>

                    <p class="char-classline">
                        ${character.className} — ${character.role}
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
                                item =>
                                    item.classList.remove(
                                        "selected"
                                    )
                            );


                        card.classList.add(
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


    /* =====================================================
       NOVO JOGO
    ===================================================== */

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

                    card.classList.toggle(
                        "selected",
                        index ===
                        0
                    );
                }
            );


        fadeToScreen(
            "character",
            () => {

                setTimeout(
                    () =>
                        must(
                            "playerName"
                        ).focus(),
                    80
                );
            }
        );
    }


    /* =====================================================
       PLAYER
    ===================================================== */

    function createPlayer(
        name,
        character
    ) {

        const worldSeeds =
            {};


        Object.keys(
            REGIONS
        ).forEach(
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
                380,

            y:
                260,

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

            speed:
                character.speed,

            damage:
                character.damage,

            defense:
                character.defense,


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

                hp:
                    0,

                energy:
                    0,

                hunger:
                    0,

                fatigue:
                    0
            },


            abilities: {

                dash:
                    false,

                route2:
                    false,

                route3:
                    false
            },


            dashCooldown:
                0,


            money:
                35,

            memory:
                0,


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

                rubi:
                    0,

                diamante:
                    0,

                cristal:
                    0,

                essencia:
                    0,

                couro:
                    0,

                fragmentoMemoria:
                    0,

                flautaMemoria:
                    0,

                lanterna:
                    0,

                pao:
                    2,

                carneCaca:
                    0,

                pocao:
                    2,

                elixir:
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
                    null,

                armor:
                    null,

                tool:
                    "machado"
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
                        80
                },


                coal: {

                    state:
                        "none",

                    need:
                        8,

                    rewardXP:
                        130,

                    rewardMoney:
                        110
                }
            },


            defeatedBosses:
                [],

            discoveredBosses:
                [],

            unlockedAreas: [
                "village"
            ],

            hellTypesDefeated:
                {},

            secretsFound:
                [],

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


            checkpoint: {

                area:
                    "village",

                x:
                    480,

                y:
                    610
            },


            skillCooldowns: {

                q:
                    0,

                r:
                    0,

                f:
                    0
            },


            damageReduction:
                0,

            shieldTimer:
                0,

            stunTimer:
                0,

            dead:
                false,

            invincible:
                0,

            attackCooldown:
                0,

            adaptiveBuff:
                false,

            playerDash:
                null,

            finalChoice:
                null,

            finalDefeated:
                false
        };


        applyStatBonuses(
            true
        );
    }


    /* =====================================================
       COMEÇAR
    ===================================================== */

    function startGame() {

        const input =
            must(
                "playerName"
            );


        const name =
            input.value.trim();


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
            home
        ) {

            state.currentHouse =
                home;


            state.houseMode =
                true;


            state.houseReturn = {

                x:
                    home.x +
                    home.w /
                    2,

                y:
                    home.y +
                    home.h +
                    58
            };


            placePlayerInsideHouse();
        }


        updateHUD();


        showScreen(
            "game"
        );


        state.running =
            true;


        state.paused =
            true;


        state.lastTime =
            performance.now();


        must(
            "transitionMessage"
        ).textContent =
            "VEYRA";


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                state.paused =
                    false;


                showToast(
                    "Você despertou em casa. Aproxime-se da cama e pressione E para descansar."
                );
            },
            700
        );


        requestAnimationFrame(
            gameLoop
        );
    }


    /* =====================================================
       CRIAÇÃO DO MUNDO
    ===================================================== */

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
        extra =
            {}
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


    function addBuilding(
        id,
        x,
        y,
        w,
        h,
        name,
        roof,
        color
    ) {

        const building = {

            id,
            x,
            y,
            w,
            h,
            name,
            roof,
            color
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


        return building;
    }


    function addTree(
        x,
        y,
        id
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
                0
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
        extra =
            {}
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
        extra =
            {}
    ) {

        state.world
            .foods
            .push({

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
            });
    }


    function addSecret(
        x,
        y,
        title,
        message,
        icon =
            "✦"
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


        state.world
            .secrets
            .push({

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
            });
    }


    function addDecoration(
        type,
        x,
        y,
        extra =
            {}
    ) {

        state.world
            .decorations
            .push({

                id:
                    uid(
                        "decoration"
                    ),

                type,
                x,
                y,

                ...extra
            });
    }


    function addPath(
        points,
        width =
            100,
        kind =
            "dirt",
        extra =
            {}
    ) {

        state.world
            .paths
            .push({

                id:
                    uid(
                        "path"
                    ),

                points,
                width,
                kind,

                ...extra
            });
    }


    function addTrial(
        x,
        y,
        id,
        title,
        extra =
            {}
    ) {

        state.world
            .trials
            .push({

                id,
                x,
                y,

                radius:
                    38,

                title,

                ...extra
            });
    }


    function addGate(
        id,
        side,
        x,
        y,
        w,
        h,
        title,
        extra =
            {}
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
        extra =
            {}
    ) {

        state.world
            .hazards
            .push({

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
            });
    }


    function addNPC(
        x,
        y,
        templateOrName,
        role =
            "Morador",
        color =
            "#d4b27c",
        lines = [
            "Olá."
        ],
        extra =
            {}
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


        state.world
            .npcs
            .push({

                id:
                    uid(
                        "npc"
                    ),

                x,
                y,

                radius:
                    17,

                ...data
            });
    }


    /* =====================================================
       INIMIGO
    ===================================================== */

    function addEnemy(
        enemy
    ) {

        if (
            enemy.type ===
                "progression" &&
            state.player
                ?.defeatedBosses
                ?.includes(
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


        const scaledHp =
            Math.round(
                baseHp *
                regionScale *
                levelScale
            );


        const scaledDamage =
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
            );


        const created = {

            state:
                "idle",

            aggressive:
                false,

            accepted:
                false,

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
                scaledHp,

            maxHp:
                scaledHp,

            damage:
                scaledDamage
        };


        state.world
            .enemies
            .push(
                created
            );


        return created;
    }


    /* =====================================================
       PORTAIS
    ===================================================== */

    function addPortal(
        x,
        y,
        w,
        h,
        target,
        requirement,
        title,
        extra =
            {}
    ) {

        state.world
            .portals
            .push({

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
            });
    }


    function addReturnPortal(
        target,
        title =
            null
    ) {

        if (
            !target
        ) {

            return;
        }


        addPortal(

            72,

            state.world.height /
                2 -
                110,

            72,

            220,

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
                    "right"
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


    /* =====================================================
       BUILD WORLD
    ===================================================== */

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
            builder
        ) {

            builder();
        }


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


        must(
            "locationLabel"
        ).textContent =
            REGIONS[
                state.area
            ].name;
    }


    /* =====================================================
       VILA
    ===================================================== */

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


        /* =================================================
           ESTRADAS PRINCIPAIS
        ================================================= */

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


        /* =================================================
           FONTE
        ================================================= */

        addObstacle(

            1492,
            978,

            216,
            216,

            "fountain"
        );


        /* =================================================
           4 ROTAS DA VILA

           DIREITA = ROTA 1
           CIMA = ROTA 2
           ESQUERDA = ROTA 3
           BAIXO = ROTA 4
        ================================================= */

        addGate(

            "north_gate",

            "north",

            1490,
            85,

            220,
            90,

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

            90,
            1010,

            90,
            220,

            "PORTÃO DO OESTE",

            {
                target:
                    "sky",

                route:
                    3,

                requiredAbility:
                    "route2"
            }
        );


        addGate(

            "south_gate",

            "south",

            1490,
            2020,

            220,
            90,

            "PORTÃO DO SUL",

            {
                target:
                    "hell",

                route:
                    4,

                requiredAbility:
                    "route3"
            }
        );


        /* =================================================
           DECORAÇÕES
        ================================================= */

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


        [
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
        ]
            .forEach(
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


        /* =================================================
           NPCS

           DORAN CONTINUA SOMENTE DENTRO DA LOJA.
        ================================================= */

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


        addNPC(
            1050,
            1420,
            "BRAN"
        );


        addNPC(
            2280,
            820,
            "BORIN"
        );


        /* =================================================
           INIMIGOS
        ================================================= */

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
                "dash"
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
                "natureBurst"
        });


        /* =================================================
           PRIMEIRO BOSS DA ROTA DIREITA

           NÃO USA DASH.
        ================================================= */

        addEnemy({

            id:
                "forest_guardian",

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
                    "forest_guardian"
                ),

            "FLORESTA",

            {
                arrivalSide:
                    "left"
            }
        );


        /* =================================================
           CENOURAS
        ================================================= */

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


        /* =================================================
           FOLHA E ALGODÃO
        ================================================= */

        for (
            let i = 0;
            i <
            12;
            i++
        ) {

            addDecoration(

                i %
                    2
                    ? "cottonPatch"
                    : "leafPile",

                750 +
                    i *
                    120,

                1720 +
                    Math.sin(
                        i *
                        1.7
                    ) *
                    90
            );
        }


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
    }


    /* =====================================================
       CAMINHO FLORESTA / BOSQUE
    ===================================================== */

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
                ? 145 +
                  seededRange(
                      rng,
                      0,
                      55
                  )
                : 95 +
                  seededRange(
                      rng,
                      0,
                      45
                  );


        const ampB =
            area ===
                "forest"
                ? 35 +
                  seededRange(
                      rng,
                      0,
                      30
                  )
                : 25 +
                  seededRange(
                      rng,
                      0,
                      24
                  );


        const divA =
            area ===
                "forest"
                ? 300 +
                  seededRange(
                      rng,
                      -30,
                      40
                  )
                : 245 +
                  seededRange(
                      rng,
                      -25,
                      35
                  );


        const divB =
            area ===
                "forest"
                ? 105 +
                  seededRange(
                      rng,
                      -15,
                      20
                  )
                : 120 +
                  seededRange(
                      rng,
                      -12,
                      18
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


    /* =====================================================
       FLORESTA
    ===================================================== */

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
            x <=
            3310;
            x +=
            50
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
            x <
            3270;
            x +=
            78
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


            if (
                Math.floor(
                    x /
                        78
                ) %
                    4 ===
                0
            ) {

                addDecoration(

                    "mushroom",

                    x +
                        seededRange(
                            rng,
                            -80,
                            80
                        ),

                    y +
                        seededRange(
                            rng,
                            120,
                            200
                        ),

                    {
                        glow:
                            rng() <
                            0.24
                    }
                );
            }
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
            i <
            28;
            i++
        ) {

            addDecoration(

                i %
                    5 ===
                0
                    ? "fallenLog"
                    : i %
                      3 ===
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


        /* =================================================
           RECURSOS
        ================================================= */

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


        for (
            let i = 0;
            i <
            10;
            i++
        ) {

            addResource(

                seededInt(
                    rng,
                    320,
                    3000
                ),

                seededInt(
                    rng,
                    300,
                    2100
                ),

                i %
                    2
                    ? "folha"
                    : "algodao",

                {
                    amount:
                        randomInt(
                            2,
                            4
                        )
                }
            );
        }


        /* =================================================
           SEGREDOS
        ================================================= */

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


        /* =================================================
           NPC
        ================================================= */

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


        /* =================================================
           INIMIGOS

           NPCS comuns continuam podendo usar
           investida conforme já existia.
        ================================================= */

        for (
            let i = 0;
            i <
            12;
            i++
        ) {

            const boar =
                i %
                    2 ===
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
                        : 0.65,

                special:
                    i >=
                    6
                        ? "dash"
                        : null
            });
        }


        /* =================================================
           BOSS 2

           NÃO USA DASH.
        ================================================= */

        addEnemy({

            id:
                "grove_guardian",

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
                    "grove_guardian"
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


    /* =====================================================
       BOSQUE
    ===================================================== */

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
            x <=
            3110;
            x +=
            48
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
            x <
            3060;
            x +=
            68
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
                `grove_tree_${count++}`
            );
        }


        for (
            let i = 0;
            i <
            38;
            i++
        ) {

            addDecoration(

                i %
                    6 ===
                0
                    ? "ancientRoot"
                    : i %
                      4 ===
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
            i <
            10;
            i++
        ) {

            const deer =
                i %
                    3 ===
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
                    0.75,

                special:
                    i >=
                    6
                        ? "dash"
                        : null
            });
        }


        /* =================================================
           BOSS 3
        ================================================= */

        addEnemy({

            id:
                "mountain_guardian",

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
                    "mountain_guardian"
                ),

            "MONTANHAS",

            {
                arrivalSide:
                    "left"
            }
        );
    }


    /* =====================================================
       MONTANHAS
    ===================================================== */

    function buildMountains() {

        const rng =
            areaRng(
                "mountains",
                "objects"
            );


        addPath(

            [
                { x: 130, y: 1140 },
                { x: 600, y: 1080 },
                { x: 1040, y: 1250 },
                { x: 1520, y: 1070 },
                { x: 2080, y: 1180 },
                { x: 2640, y: 1030 },
                { x: 3370, y: 1140 }
            ],

            92,

            "snowTrail"
        );


        for (
            let i = 0;
            i <
            54;
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

                i %
                    8 ===
                0
                    ? "iceRock"
                    : i %
                      5 ===
                      0
                    ? "oreRock"
                    : "snowrock"
            );
        }


        for (
            let i = 0;
            i <
            54;
            i++
        ) {

            addDecoration(

                i %
                    8 ===
                0
                    ? "deadPine"
                    : i %
                      6 ===
                      0
                    ? "oreSpark"
                    : i %
                      4 ===
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

                "A Sentinela lança pedras antes de avançar. Quando o chão ficar vermelho, saia do círculo."
            ]
        );


        for (
            let i = 0;
            i <
            11;
            i++
        ) {

            const deer =
                i %
                    3 ===
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
                        ? "dash"
                        : "rockThrow"
            });
        }


        /* =================================================
           BOSS 4
        ================================================= */

        addEnemy({

            id:
                "iron_guardian",

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
                    "iron_guardian"
                ),

            "CAVERNA DE FERRO",

            {
                arrivalSide:
                    "left"
            }
        );
    }


    /* =====================================================
       CAVERNA DE FERRO
    ===================================================== */

    function buildIron() {

        const rng =
            areaRng(
                "iron",
                "objects"
            );


        addPath(

            [
                { x: 120, y: 950 },
                { x: 620, y: 890 },
                { x: 1180, y: 1010 },
                { x: 1750, y: 850 },
                { x: 2260, y: 990 },
                { x: 2800, y: 940 }
            ],

            82,

            "mineTrack"
        );


        for (
            let i = 0;
            i <
            38;
            i++
        ) {

            addObstacle(

                seededInt(
                    rng,
                    150,
                    2700
                ),

                seededInt(
                    rng,
                    150,
                    1700
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

                i %
                    5 ===
                0
                    ? "oreRock"
                    : "ironrock"
            );
        }


        for (
            let i = 0;
            i <
            35;
            i++
        ) {

            let type =
                "ferro";


            if (
                i %
                    8 ===
                0
            ) {

                type =
                    "ouro";
            }


            if (
                i %
                    13 ===
                0
            ) {

                type =
                    "diamante";
            }


            addResource(

                seededInt(
                    rng,
                    210,
                    2630
                ),

                seededInt(
                    rng,
                    190,
                    1650
                ),

                type
            );
        }


        for (
            let i = 0;
            i <
            30;
            i++
        ) {

            addDecoration(

                i %
                    5 ===
                0
                    ? "mineLantern"
                    : i %
                      4 ===
                      0
                    ? "rail"
                    : i %
                      3 ===
                      0
                    ? "toolCrate"
                    : "stalagmite",

                seededInt(
                    rng,
                    190,
                    2700
                ),

                seededInt(
                    rng,
                    170,
                    1700
                )
            );
        }


        addSecret(

            520,
            1540,

            "Capacete Abandonado",

            "Há um capacete coberto de poeira. Dentro dele, uma anotação diz apenas: 'não siga a voz da parede'.",

            "⛑️"
        );


        for (
            let i = 0;
            i <
            9;
            i++
        ) {

            addEnemy({

                id:
                    `iron_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        420,
                        2300
                    ),

                y:
                    seededInt(
                        rng,
                        250,
                        1540
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
                    i %
                        4 ===
                    0
                        ? "ouro"
                        : "ferro",

                dropAmount:
                    1,

                dropChance:
                    0.62,

                special:
                    i >=
                    5
                        ? "oreBurst"
                        : null
            });
        }


        /* =================================================
           BOSS 5
        ================================================= */

        addEnemy({

            id:
                "ruby_guardian",

            x:
                2450,

            y:
                950,

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

            2750,
            840,

            70,
            230,

            "ruby",

            () =>
                hasDefeatedBoss(
                    "ruby_guardian"
                ),

            "CAVERNA DE RUBI",

            {
                arrivalSide:
                    "left"
            }
        );
    }


    /* =====================================================
       CAVERNA DE RUBI
    ===================================================== */

    function buildRuby() {

        const rng =
            areaRng(
                "ruby",
                "objects"
            );


        addPath(

            [
                { x: 120, y: 1040 },
                { x: 650, y: 970 },
                { x: 1180, y: 1110 },
                { x: 1700, y: 910 },
                { x: 2250, y: 1050 },
                { x: 2840, y: 520 }
            ],

            84,

            "crystalTrail"
        );


        for (
            let i = 0;
            i <
            40;
            i++
        ) {

            addObstacle(

                seededInt(
                    rng,
                    170,
                    2880
                ),

                seededInt(
                    rng,
                    170,
                    1900
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

                i %
                    4 ===
                0
                    ? "rubyPillar"
                    : "rubyrock"
            );
        }


        /* =================================================
           RUBIS E DIAMANTES EM QUANTIDADE BOA

           Custos foram aumentados justamente
           porque há bastante minério.
        ================================================= */

        for (
            let i = 0;
            i <
            50;
            i++
        ) {

            const type =

                i %
                    5 ===
                0
                    ? "diamante"

                    : i %
                      9 ===
                      0
                    ? "ouro"

                    : "rubi";


            addResource(

                seededInt(
                    rng,
                    220,
                    2860
                ),

                seededInt(
                    rng,
                    190,
                    1870
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
            i <
            38;
            i++
        ) {

            addDecoration(

                i %
                    3 ===
                0
                    ? "crystalPillar"
                    : "crystalShard",

                seededInt(
                    rng,
                    180,
                    2920
                ),

                seededInt(
                    rng,
                    170,
                    1920
                )
            );
        }


        addSecret(

            2700,
            420,

            "Coração Rubi",

            "Um cristal pulsa como um coração. Quando você se aproxima, ele repete uma lembrança que você ainda não viveu.",

            "❤️"
        );


        for (
            let i = 0;
            i <
            10;
            i++
        ) {

            addEnemy({

                id:
                    `ruby_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        400,
                        2600
                    ),

                y:
                    seededInt(
                        rng,
                        260,
                        1780
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
                    i %
                        4 ===
                    0
                        ? "diamante"
                        : "rubi",

                dropAmount:
                    1,

                dropChance:
                    0.7,

                special:
                    i >=
                    4
                        ? "crystalShot"
                        : null
            });
        }


        /* =================================================
           BOSS 6 — ÚLTIMO ANTES DO LABIRINTO

           NÃO USA DASH.
        ================================================= */

        addEnemy({

            id:
                "shadow_guardian",

            x:
                2520,

            y:
                1040,

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


        /* =================================================
           ENTRADA DO LABIRINTO

           FICA NO CANTO SUPERIOR DIREITO,
           NÃO NO MEIO DO MAPA.
        ================================================= */

        addPortal(

            2845,
            150,

            125,
            150,

            "monarchMaze",

            () =>
                hasDefeatedBoss(
                    "shadow_guardian"
                ),

            "CAVERNA ESQUECIDA",

            {
                arrivalSide:
                    "left",

                caveEntrance:
                    true
            }
        );


        addDecoration(
            "darkCaveEntrance",
            2905,
            230
        );
    }


    /* =====================================================
       GERADOR DO LABIRINTO
    ===================================================== */

    function generateMaze(
        cols,
        rows,
        seed
    ) {

        const rng =
            mulberry32(
                seed
            );


        const cells =
            [];


        for (
            let y = 0;
            y <
            rows;
            y++
        ) {

            const row =
                [];


            for (
                let x = 0;
                x <
                cols;
                x++
            ) {

                row.push({

                    x,
                    y,

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
                });
            }


            cells.push(
                row
            );
        }


        const stack =
            [];


        const start = {

            x:
                0,

            y:
                Math.floor(
                    rows /
                    2
                )
        };


        let current =
            cells[
                start.y
            ][
                start.x
            ];


        current.visited =
            true;


        let visited =
            1;


        const total =
            cols *
            rows;


        while (
            visited <
            total
        ) {

            const neighbors =
                [];


            if (
                current.y >
                    0 &&
                !cells[
                    current.y -
                        1
                ][
                    current.x
                ].visited
            ) {

                neighbors.push({

                    cell:
                        cells[
                            current.y -
                                1
                        ][
                            current.x
                        ],

                    direction:
                        "top"
                });
            }


            if (
                current.x <
                    cols -
                        1 &&
                !cells[
                    current.y
                ][
                    current.x +
                        1
                ].visited
            ) {

                neighbors.push({

                    cell:
                        cells[
                            current.y
                        ][
                            current.x +
                                1
                        ],

                    direction:
                        "right"
                });
            }


            if (
                current.y <
                    rows -
                        1 &&
                !cells[
                    current.y +
                        1
                ][
                    current.x
                ].visited
            ) {

                neighbors.push({

                    cell:
                        cells[
                            current.y +
                                1
                        ][
                            current.x
                        ],

                    direction:
                        "bottom"
                });
            }


            if (
                current.x >
                    0 &&
                !cells[
                    current.y
                ][
                    current.x -
                        1
                ].visited
            ) {

                neighbors.push({

                    cell:
                        cells[
                            current.y
                        ][
                            current.x -
                                1
                        ],

                    direction:
                        "left"
                });
            }


            if (
                neighbors.length
            ) {

                const next =
                    neighbors[
                        Math.floor(
                            rng() *
                            neighbors.length
                        )
                    ];


                stack.push(
                    current
                );


                if (
                    next.direction ===
                    "top"
                ) {

                    current.walls.top =
                        false;


                    next.cell
                        .walls
                        .bottom =
                        false;
                }


                else if (
                    next.direction ===
                    "right"
                ) {

                    current.walls.right =
                        false;


                    next.cell
                        .walls
                        .left =
                        false;
                }


                else if (
                    next.direction ===
                    "bottom"
                ) {

                    current.walls.bottom =
                        false;


                    next.cell
                        .walls
                        .top =
                        false;
                }


                else {

                    current.walls.left =
                        false;


                    next.cell
                        .walls
                        .right =
                        false;
                }


                current =
                    next.cell;


                current.visited =
                    true;


                visited++;
            }

            else {

                current =
                    stack.pop();


                if (
                    !current
                ) {

                    break;
                }
            }
        }


        /* =================================================
           ABRE ENTRADA E SAÍDA
        ================================================= */

        cells[
            start.y
        ][
            0
        ].walls.left =
            false;


        const exitY =
            Math.floor(
                rows /
                2
            );


        cells[
            exitY
        ][
            cols -
                1
        ].walls.right =
            false;


        return {

            cols,
            rows,
            cells,

            start,

            exit: {

                x:
                    cols -
                        1,

                y:
                    exitY
            }
        };
    }


    /* =====================================================
       CONSTRUIR PAREDES DO LABIRINTO
    ===================================================== */

    function buildMazeWalls(
        maze,
        originX,
        originY,
        cellSize,
        wallSize
    ) {

        const added =
            new Set();


        function addWallOnce(
            key,
            x,
            y,
            w,
            h
        ) {

            if (
                added.has(
                    key
                )
            ) {

                return;
            }


            added.add(
                key
            );


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
        }


        for (
            let row = 0;
            row <
            maze.rows;
            row++
        ) {

            for (
                let col = 0;
                col <
                maze.cols;
                col++
            ) {

                const cell =
                    maze.cells[
                        row
                    ][
                        col
                    ];


                const x =
                    originX +
                    col *
                    cellSize;


                const y =
                    originY +
                    row *
                    cellSize;


                if (
                    cell.walls.top
                ) {

                    addWallOnce(

                        `h_${col}_${row}`,

                        x,
                        y,

                        cellSize +
                            wallSize,

                        wallSize
                    );
                }


                if (
                    cell.walls.left
                ) {

                    addWallOnce(

                        `v_${col}_${row}`,

                        x,
                        y,

                        wallSize,

                        cellSize +
                            wallSize
                    );
                }


                if (
                    row ===
                        maze.rows -
                            1 &&
                    cell.walls.bottom
                ) {

                    addWallOnce(

                        `h_${col}_${row + 1}`,

                        x,

                        y +
                            cellSize,

                        cellSize +
                            wallSize,

                        wallSize
                    );
                }


                if (
                    col ===
                        maze.cols -
                            1 &&
                    cell.walls.right
                ) {

                    addWallOnce(

                        `v_${col + 1}_${row}`,

                        x +
                            cellSize,

                        y,

                        wallSize,

                        cellSize +
                            wallSize
                    );
                }
            }
        }
    }


    /* =====================================================
       LABIRINTO DO MONARCA
    ===================================================== */

    function buildMonarchMaze() {

        const cols =
            12;


        const rows =
            13;


        const cellSize =
            104;


        const wallSize =
            16;


        const originX =
            130;


        const originY =
            260;


        const seed =
            state.player
                .worldSeeds
                .monarchMaze;


        const maze =
            generateMaze(
                cols,
                rows,
                seed
            );


        state.world.maze = {

            ...maze,

            originX,
            originY,
            cellSize,
            wallSize
        };


        buildMazeWalls(
            maze,
            originX,
            originY,
            cellSize,
            wallSize
        );


        /* =================================================
           ARENA DO MONARCA
        ================================================= */

        const arena = {

            x:
                1540,

            y:
                300,

            w:
                900,

            h:
                1300
        };


        state.world.maze.arena =
            arena;


        /*
            PAREDES DA ARENA.
        */

        addObstacle(

            arena.x,
            arena.y,

            arena.w,
            26,

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
                26,

            arena.w,
            26,

            "arenaWall",

            {
                blocksLight:
                    true
            }
        );


        addObstacle(

            arena.x +
                arena.w -
                26,

            arena.y,

            26,
            arena.h,

            "arenaWall",

            {
                blocksLight:
                    true
            }
        );


        /*
            PAREDE ESQUERDA COM ABERTURA.
        */

        addObstacle(

            arena.x,
            arena.y,

            26,
            505,

            "arenaWall",

            {
                blocksLight:
                    true
            }
        );


        addObstacle(

            arena.x,
            arena.y +
                795,

            26,
            505,

            "arenaWall",

            {
                blocksLight:
                    true
            }
        );


        /*
            CORREDOR DA SAÍDA DO LABIRINTO
            ATÉ A ARENA.
        */

        addPath(

            [
                {
                    x:
                        originX +
                        cols *
                        cellSize,

                    y:
                        originY +
                        maze.exit.y *
                        cellSize +
                        cellSize /
                        2
                },

                {
                    x:
                        arena.x +
                        180,

                    y:
                        arena.y +
                        arena.h /
                        2
                }
            ],

            70,

            "mazeExit"
        );


        /* =================================================
           ALTAR

           ELE NÃO ILUMINA O LABIRINTO.
           SÓ SERÁ VISÍVEL QUANDO ESTIVER DENTRO
           DO CÍRCULO DA LANTERNA.
        ================================================= */

        addTrial(

            2050,
            950,

            "dash_altar",

            "ALTAR DO PODER",

            {
                altar:
                    true,

                dashAltar:
                    true
            }
        );


        addDecoration(

            "dashAltar",

            2050,
            950,

            {
                darkSensitive:
                    true
            }
        );


        /* =================================================
           DECORAÇÃO DA ARENA
        ================================================= */

        for (
            let i = 0;
            i <
            18;
            i++
        ) {

            const angle =
                Math.PI *
                2 *
                i /
                18;


            addDecoration(

                i %
                    3 ===
                0
                    ? "shadowTorch"
                    : "monarchRune",

                2050 +
                    Math.cos(
                        angle
                    ) *
                    random(
                        250,
                        370
                    ),

                950 +
                    Math.sin(
                        angle
                    ) *
                    random(
                        330,
                        500
                    )
            );
        }


        /* =================================================
           INIMIGOS DO LABIRINTO
        ================================================= */

        const rng =
            areaRng(
                "monarchMaze",
                "enemyCells"
            );


        const candidateCells =
            [];


        for (
            let row = 0;
            row <
            rows;
            row++
        ) {

            for (
                let col = 0;
                col <
                cols;
                col++
            ) {

                const isStart =

                    col <=
                        1 &&
                    Math.abs(
                        row -
                            maze.start.y
                    ) <=
                        1;


                const isExit =

                    col >=
                        cols -
                            2 &&
                    Math.abs(
                        row -
                            maze.exit.y
                    ) <=
                        1;


                if (
                    isStart ||
                    isExit
                ) {

                    continue;
                }


                candidateCells.push({

                    col,
                    row
                });
            }
        }


        for (
            let i =
                candidateCells.length -
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


            const temp =
                candidateCells[
                    i
                ];


            candidateCells[
                i
            ] =
                candidateCells[
                    j
                ];


            candidateCells[
                j
            ] =
                temp;
        }


        const enemyCount =
            22;


        for (
            let i = 0;
            i <
            enemyCount;
            i++
        ) {

            const cell =
                candidateCells[
                    i
                ];


            if (
                !cell
            ) {

                break;
            }


            const x =
                originX +
                cell.col *
                cellSize +
                cellSize /
                2;


            const y =
                originY +
                cell.row *
                cellSize +
                cellSize /
                2;


            const type =
                i %
                    3;


            if (
                type ===
                0
            ) {

                addEnemy({

                    id:
                        `maze_spider_${i}`,

                    x,
                    y,

                    name:
                        "ARANHA DA ESCURIDÃO",

                    icon:
                        "🕷️",

                    type:
                        "maze",

                    hp:
                        270,

                    damage:
                        31,

                    speed:
                        96,

                    vision:
                        175,

                    attackRange:
                        58,

                    radius:
                        22,

                    color:
                        "#4d3f57",

                    drop:
                        "essencia",

                    dropChance:
                        0.55,

                    special:
                        "webShot"
                });
            }


            else if (
                type ===
                1
            ) {

                addEnemy({

                    id:
                        `maze_scorpion_${i}`,

                    x,
                    y,

                    name:
                        "ESCORPIÃO CARMESIM",

                    icon:
                        "🦂",

                    type:
                        "maze",

                    hp:
                        330,

                    damage:
                        39,

                    speed:
                        75,

                    vision:
                        190,

                    attackRange:
                        67,

                    radius:
                        25,

                    color:
                        "#7b403c",

                    drop:
                        "rubi",

                    dropChance:
                        0.42,

                    special:
                        "poisonSting"
                });
            }


            else {

                addEnemy({

                    id:
                        `maze_bat_${i}`,

                    x,
                    y,

                    name:
                        "MORCEGO SOMBRIO",

                    icon:
                        "🦇",

                    type:
                        "maze",

                    hp:
                        215,

                    damage:
                        28,

                    speed:
                        118,

                    vision:
                        215,

                    attackRange:
                        62,

                    radius:
                        20,

                    color:
                        "#4a3b60",

                    drop:
                        "essencia",

                    dropChance:
                        0.45,

                    special:
                        "shadowPounce"
                });
            }
        }


        /* =================================================
           SE O JOGADOR JÁ ACORDOU O MONARCA
           MAS NÃO O DERROTOU, ELE VOLTA.
        ================================================= */

        if (
            state.player
                .monarchAwakened &&
            !state.player
                .monarchDefeated
        ) {

            spawnMonarch(
                false
            );
        }
    }
        /* =====================================================
       ROTA 2 — TERRAS SOMBRIAS

       A PARTIR DAQUI OS BOSSES PODEM USAR DASH.
       O PLAYER JÁ DEVE TER APRENDIDO A DESVIAR.
    ===================================================== */

    function buildShadow() {

        const rng =
            areaRng(
                "shadow",
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
                        620,

                    y:
                        930
                },

                {
                    x:
                        1120,

                    y:
                        1140
                },

                {
                    x:
                        1640,

                    y:
                        900
                },

                {
                    x:
                        2160,

                    y:
                        1120
                },

                {
                    x:
                        2700,

                    y:
                        960
                },

                {
                    x:
                        3090,

                    y:
                        1080
                }
            ],

            82,

            "shadowTrail"
        );


        for (
            let i = 0;
            i <
            38;
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
                    2020
                ),

                seededInt(
                    rng,
                    45,
                    95
                ),

                seededInt(
                    rng,
                    35,
                    68
                ),

                "darkrock"
            );
        }


        for (
            let i = 0;
            i <
            46;
            i++
        ) {

            addDecoration(

                i %
                    5 ===
                0
                    ? "shadowWhisper"

                    : i %
                      3 ===
                      0
                    ? "darkMist"

                    : "shadowEye",

                seededInt(
                    rng,
                    180,
                    2980
                ),

                seededInt(
                    rng,
                    170,
                    2020
                ),

                {
                    phase:
                        seededRange(
                            rng,
                            0,
                            Math.PI *
                                2
                        )
                }
            );
        }


        addSecret(

            470,
            1810,

            "Sussurro Sem Dono",

            "Uma voz chama pelo seu nome, mas desaparece quando você tenta responder.",

            "👁️"
        );


        for (
            let i = 0;
            i <
            12;
            i++
        ) {

            addEnemy({

                id:
                    `shadow_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        430,
                        2700
                    ),

                y:
                    seededInt(
                        rng,
                        260,
                        1860
                    ),

                name:
                    "SOMBRA ESQUECIDA",

                icon:
                    "👤",

                type:
                    "normal",

                hp:
                    290,

                damage:
                    34,

                speed:
                    87,

                vision:
                    310,

                attackRange:
                    72,

                radius:
                    25,

                color:
                    "#49425f",

                drop:
                    "essencia",

                dropAmount:
                    1,

                dropChance:
                    0.60,

                special:

                    i %
                    3 ===
                    0

                        ? "dash"

                        : "shadowBurst"
            });
        }


        /*
            PRIMEIRO BOSS DA ROTA 2.

            ESTE POSSUI DASH.
        */

        addEnemy({

            id:
                "fairy_guardian",

            x:
                2670,

            y:
                1040,

            name:
                "GUARDIÃO SOMBRIO",

            icon:
                "🌑",

            type:
                "progression",

            hp:
                1280,

            damage:
                53,

            speed:
                65,

            vision:
                430,

            attackRange:
                98,

            radius:
                41,

            color:
                "#42364f",

            drop:
                "essencia",

            dropAmount:
                4,

            unlock:
                "fairy",

            special:
                "voidCircle",

            bossDash:
                true,

            bossDashDamage:
                1.65
        });


        addPortal(

            3050,
            930,

            70,
            230,

            "fairy",

            () =>
                hasDefeatedBoss(
                    "fairy_guardian"
                ),

            "REINO DAS FADAS",

            {
                arrivalSide:
                    "left"
            }
        );
    }


    /* =====================================================
       ROTA 2 — REINO DAS FADAS
    ===================================================== */

    function buildFairy() {

        const rng =
            areaRng(
                "fairy",
                "objects"
            );


        addPath(

            [
                {
                    x:
                        120,

                    y:
                        1120
                },

                {
                    x:
                        620,

                    y:
                        980
                },

                {
                    x:
                        1100,

                    y:
                        1180
                },

                {
                    x:
                        1600,

                    y:
                        960
                },

                {
                    x:
                        2180,

                    y:
                        1180
                },

                {
                    x:
                        2760,

                    y:
                        970
                },

                {
                    x:
                        3100,

                    y:
                        1080
                }
            ],

            92,

            "fairyTrail"
        );


        for (
            let i = 0;
            i <
            42;
            i++
        ) {

            addDecoration(

                i %
                    6 ===
                0
                    ? "fairyLamp"

                    : i %
                      4 ===
                      0
                    ? "flowerPatch"

                    : i %
                      3 ===
                      0
                    ? "crystalShard"

                    : "fairySpark",

                seededInt(
                    rng,
                    160,
                    3020
                ),

                seededInt(
                    rng,
                    160,
                    2020
                ),

                {
                    phase:
                        seededRange(
                            rng,
                            0,
                            Math.PI *
                                2
                        )
                }
            );
        }


        for (
            let i = 0;
            i <
            25;
            i++
        ) {

            addResource(

                seededInt(
                    rng,
                    240,
                    2920
                ),

                seededInt(
                    rng,
                    220,
                    1960
                ),

                i %
                    6 ===
                0
                    ? "diamante"
                    : "cristal",

                {
                    amount:
                        randomInt(
                            1,
                            3
                        )
                }
            );
        }


        addNPC(

            950,
            820,

            "AELIA",

            "Fada Anciã",

            "#d49ad4",

            [

                "As flores daqui brilham quando alguém lembra de algo importante.",

                "A Quietude não gosta de memórias compartilhadas.",

                "Os Guardiões deste caminho não esperam você terminar de pensar.",

                "Se chegou até aqui, talvez já tenha aprendido a desaparecer do caminho deles por alguns instantes."
            ]
        );


        addSecret(

            2600,
            330,

            "Flor Impossível",

            "Uma flor possui pétalas de cores que parecem mudar quando você tenta lembrar delas.",

            "🌸"
        );


        for (
            let i = 0;
            i <
            11;
            i++
        ) {

            addEnemy({

                id:
                    `fairy_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        430,
                        2670
                    ),

                y:
                    seededInt(
                        rng,
                        280,
                        1840
                    ),

                name:
                    "ESPÍRITO FEÉRICO",

                icon:
                    "🦋",

                type:
                    "normal",

                hp:
                    310,

                damage:
                    35,

                speed:
                    102,

                vision:
                    320,

                attackRange:
                    76,

                radius:
                    24,

                color:
                    "#bd8dc3",

                drop:
                    "cristal",

                dropAmount:
                    1,

                dropChance:
                    0.65,

                special:

                    i %
                    3 ===
                    0

                        ? "dash"

                        : "fairyBurst"
            });
        }


        addEnemy({

            id:
                "sky_guardian",

            x:
                2710,

            y:
                1080,

            name:
                "GUARDIÃ DOS FIOS",

            icon:
                "🧚",

            type:
                "progression",

            hp:
                1450,

            damage:
                57,

            speed:
                73,

            vision:
                440,

            attackRange:
                100,

            radius:
                40,

            color:
                "#cb8ac7",

            drop:
                "cristal",

            dropAmount:
                5,

            unlock:
                "sky",

            special:
                "fairyStorm",

            bossDash:
                true,

            bossDashDamage:
                1.70
        });


        addPortal(

            3050,
            950,

            70,
            230,

            "sky",

            () =>
                hasDefeatedBoss(
                    "sky_guardian"
                ),

            "CÉU",

            {
                arrivalSide:
                    "left"
            }
        );
    }


    /* =====================================================
       CÉU

       MANTÉM AS CINCO HORDAS E O GUARDIÃO DO CAMINHO.
    ===================================================== */

    function buildSky() {

        const rng =
            areaRng(
                "sky",
                "objects"
            );


        addPath(

            [
                {
                    x:
                        120,

                    y:
                        1100
                },

                {
                    x:
                        650,

                    y:
                        1020
                },

                {
                    x:
                        1120,

                    y:
                        1180
                },

                {
                    x:
                        1710,

                    y:
                        1100
                },

                {
                    x:
                        2250,

                    y:
                        950
                },

                {
                    x:
                        2820,

                    y:
                        1100
                },

                {
                    x:
                        3260,

                    y:
                        1100
                }
            ],

            100,

            "skyBridge"
        );


        for (
            let i = 0;
            i <
            35;
            i++
        ) {

            addDecoration(

                i %
                    4 ===
                0
                    ? "celestialPillar"

                    : i %
                      3 ===
                      0
                    ? "cloud"

                    : "skyRune",

                seededInt(
                    rng,
                    160,
                    3210
                ),

                seededInt(
                    rng,
                    170,
                    2020
                ),

                {
                    phase:
                        seededRange(
                            rng,
                            0,
                            Math.PI *
                                2
                        )
                }
            );
        }


        addNPC(

            860,
            950,

            "AERIS",

            "Guardião Celeste",

            "#c7d4df",

            [

                "O Céu nunca foi o fim.",

                "Há caminhos que só podem ser atravessados depois que o corpo aprende a reagir antes da mente.",

                "Cinco hordas protegem o altar.",

                "Depois delas, alguém que não deveria mais existir aparecerá."
            ]
        );


        addTrial(

            1710,
            1100,

            "sky_hordes",

            "ALTAR DAS CINCO HORDAS"
        );


        addDecoration(

            "trialAltar",

            1710,
            1100
        );


        if (
            state.player
                .skyTrial
                .complete &&
            !hasDefeatedBoss(
                "path_guardian"
            )
        ) {

            spawnPathGuardian();
        }


        for (
            let i = 0;
            i <
            8;
            i++
        ) {

            addEnemy({

                id:
                    `sky_patrol_${i}`,

                x:
                    seededInt(
                        rng,
                        500,
                        2750
                    ),

                y:
                    seededInt(
                        rng,
                        300,
                        1820
                    ),

                name:
                    "VIGIA CELESTE",

                icon:
                    "🪽",

                type:
                    "normal",

                hp:
                    335,

                damage:
                    38,

                speed:
                    94,

                vision:
                    330,

                attackRange:
                    82,

                radius:
                    25,

                color:
                    "#c7d8e2",

                drop:
                    "cristal",

                dropAmount:
                    1,

                dropChance:
                    0.62,

                special:
                    i %
                    2 ===
                    0
                        ? "dash"
                        : "crystalShot"
            });
        }
    }


    /* =====================================================
       INFERNO

       CONTEÚDO ANTIGO CONTINUA EXISTINDO.
       A NOVA ROTA DA VILA DECIDIRÁ QUANDO ELE SERÁ ACESSÍVEL.
    ===================================================== */

    function buildHell() {

        const rng =
            areaRng(
                "hell",
                "objects"
            );


        addPath(

            [
                {
                    x:
                        120,

                    y:
                        1200
                },

                {
                    x:
                        650,

                    y:
                        1080
                },

                {
                    x:
                        1200,

                    y:
                        1290
                },

                {
                    x:
                        1790,

                    y:
                        1030
                },

                {
                    x:
                        2410,

                    y:
                        1230
                },

                {
                    x:
                        3050,

                    y:
                        1050
                },

                {
                    x:
                        3480,

                    y:
                        1190
                }
            ],

            100,

            "hellRoad"
        );


        for (
            let i = 0;
            i <
            47;
            i++
        ) {

            addObstacle(

                seededInt(
                    rng,
                    160,
                    3380
                ),

                seededInt(
                    rng,
                    160,
                    2200
                ),

                seededInt(
                    rng,
                    45,
                    110
                ),

                seededInt(
                    rng,
                    35,
                    80
                ),

                i %
                    5 ===
                0
                    ? "obsidian"
                    : "basalt"
            );
        }


        for (
            let i = 0;
            i <
            44;
            i++
        ) {

            addDecoration(

                i %
                    4 ===
                0
                    ? "lavaPool"

                    : i %
                      3 ===
                      0
                    ? "hellSmoke"

                    : "emberVent",

                seededInt(
                    rng,
                    170,
                    3400
                ),

                seededInt(
                    rng,
                    160,
                    2200
                )
            );
        }


        const hellTypes = [

            {
                name:
                    "DEMÔNIO DE CINZA",

                icon:
                    "👹",

                color:
                    "#a84c3b",

                hp:
                    365,

                damage:
                    42,

                speed:
                    77,

                special:
                    "fireCircle",

                hellType:
                    1
            },


            {
                name:
                    "CÃO DE LAVA",

                icon:
                    "🐕",

                color:
                    "#c75d33",

                hp:
                    315,

                damage:
                    40,

                speed:
                    116,

                special:
                    "dash",

                hellType:
                    2
            },


            {
                name:
                    "ESPECTRO CARMESIM",

                icon:
                    "👻",

                color:
                    "#8f3c50",

                hp:
                    330,

                damage:
                    43,

                speed:
                    84,

                special:
                    "shadowBurst",

                hellType:
                    3
            },


            {
                name:
                    "GÁRGULA QUEBRADA",

                icon:
                    "🗿",

                color:
                    "#6d6260",

                hp:
                    440,

                damage:
                    47,

                speed:
                    60,

                special:
                    "rockThrow",

                hellType:
                    4
            },


            {
                name:
                    "PARASITA DO VAZIO",

                icon:
                    "👁️",

                color:
                    "#5d3d6e",

                hp:
                    350,

                damage:
                    45,

                speed:
                    80,

                special:
                    "voidCircle",

                hellType:
                    5
            }
        ];


        for (
            let i = 0;
            i <
            20;
            i++
        ) {

            const template =
                hellTypes[
                    i %
                    hellTypes.length
                ];


            addEnemy({

                id:
                    `hell_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        440,
                        3040
                    ),

                y:
                    seededInt(
                        rng,
                        260,
                        2050
                    ),

                name:
                    template.name,

                icon:
                    template.icon,

                type:
                    "hell",

                hellType:
                    template.hellType,

                hp:
                    template.hp,

                damage:
                    template.damage,

                speed:
                    template.speed,

                vision:
                    345,

                attackRange:
                    82,

                radius:
                    27,

                color:
                    template.color,

                drop:
                    "essencia",

                dropAmount:
                    1,

                dropChance:
                    0.58,

                special:
                    template.special
            });
        }


        addEnemy({

            id:
                "final_gate_guardian",

            x:
                3190,

            y:
                1200,

            name:
                "GUARDIÃO SUPREMO DO INFERNO",

            icon:
                "👿",

            type:
                "progression",

            hp:
                1950,

            damage:
                66,

            speed:
                62,

            vision:
                470,

            attackRange:
                115,

            radius:
                47,

            color:
                "#8e3e34",

            drop:
                "essencia",

            dropAmount:
                6,

            unlock:
                "final",

            special:
                "infernalStorm",

            bossDash:
                true,

            bossDashDamage:
                1.8
        });


        addPortal(

            3460,
            1080,

            70,
            240,

            "final",

            () => {

                const types =
                    state.player
                        .hellTypesDefeated;


                const fiveTypes =
                    [
                        "1",
                        "2",
                        "3",
                        "4",
                        "5"
                    ]
                        .every(
                            key =>
                                Boolean(
                                    types[
                                        key
                                    ]
                                )
                        );


                return (
                    fiveTypes &&
                    hasDefeatedBoss(
                        "final_gate_guardian"
                    )
                );
            },

            "CÂMARA FINAL",

            {
                arrivalSide:
                    "left"
            }
        );
    }


    /* =====================================================
       CÂMARA FINAL
    ===================================================== */

    function buildFinal() {

        for (
            let i = 0;
            i <
            20;
            i++
        ) {

            const angle =
                Math.PI *
                2 *
                i /
                20;


            addDecoration(

                "finalRune",

                1100 +
                    Math.cos(
                        angle
                    ) *
                    550,

                750 +
                    Math.sin(
                        angle
                    ) *
                    400,

                {
                    phase:
                        angle
                }
            );
        }


        addEnemy({

            id:
                "other_self",

            x:
                1650,

            y:
                750,

            name:
                "O OUTRO EU",

            icon:
                "☯",

            type:
                "final",

            hp:
                2850,

            damage:
                72,

            speed:
                78,

            vision:
                900,

            attackRange:
                110,

            radius:
                46,

            color:
                "#77518b",

            special:
                "finalStorm",

            bossDash:
                true,

            bossDashDamage:
                1.8
        });
    }


    /* =====================================================
       COLISÕES
    ===================================================== */

    function circleRectCollision(
        x,
        y,
        radius,
        rect
    ) {

        const closestX =
            clamp(
                x,
                rect.x,
                rect.x +
                    rect.w
            );


        const closestY =
            clamp(
                y,
                rect.y,
                rect.y +
                    rect.h
            );


        const dx =
            x -
            closestX;


        const dy =
            y -
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


    /* =====================================================
       INTERIOR
    ===================================================== */

    function getHouseRoom() {

        return {

            x:
                920,

            y:
                520,

            w:
                1360,

            h:
                1080
        };
    }


    function getHouseTheme() {

        const id =
            state.currentHouse
                ?.id;


        const themes = {

            home: {

                floor:
                    "#7b583d",

                wall:
                    "#9f7757",

                trim:
                    "#4e3529",

                accent:
                    "#d4aa68"
            },


            elianHome: {

                floor:
                    "#755840",

                wall:
                    "#8d775f",

                trim:
                    "#49382c",

                accent:
                    "#c49a68"
            },


            forge: {

                floor:
                    "#535150",

                wall:
                    "#69645f",

                trim:
                    "#2e2e2e",

                accent:
                    "#d87840"
            },


            shop: {

                floor:
                    "#72513a",

                wall:
                    "#9b7859",

                trim:
                    "#483428",

                accent:
                    "#d6b56e"
            },


            woodshop: {

                floor:
                    "#6d4c32",

                wall:
                    "#8d6643",

                trim:
                    "#432f24",

                accent:
                    "#c88c4f"
            }
        };


        return (
            themes[
                id
            ] ||
            themes.home
        );
    }


    function getHouseFurniture() {

        const room =
            getHouseRoom();


        const id =
            state.currentHouse
                ?.id;


        if (
            id ===
            "home"
        ) {

            return [

                {
                    name:
                        "bed",

                    x:
                        room.x +
                        90,

                    y:
                        room.y +
                        110,

                    w:
                        250,

                    h:
                        145,

                    solid:
                        true,

                    interactable:
                        "sleep"
                },


                {
                    name:
                        "table",

                    x:
                        room.x +
                        540,

                    y:
                        room.y +
                        390,

                    w:
                        260,

                    h:
                        155,

                    solid:
                        true
                },


                {
                    name:
                        "chair",

                    x:
                        room.x +
                        485,

                    y:
                        room.y +
                        420,

                    w:
                        55,

                    h:
                        65,

                    solid:
                        true
                },


                {
                    name:
                        "chair",

                    x:
                        room.x +
                        800,

                    y:
                        room.y +
                        420,

                    w:
                        55,

                    h:
                        65,

                    solid:
                        true
                },


                {
                    name:
                        "fireplace",

                    x:
                        room.x +
                        room.w -
                        210,

                    y:
                        room.y +
                        100,

                    w:
                        135,

                    h:
                        150,

                    solid:
                        true
                },


                {
                    name:
                        "chest",

                    x:
                        room.x +
                        100,

                    y:
                        room.y +
                        room.h -
                        205,

                    w:
                        135,

                    h:
                        90,

                    solid:
                        true
                }
            ];
        }


        if (
            id ===
            "elianHome"
        ) {

            return [

                {
                    name:
                        "bookshelf",

                    x:
                        room.x +
                        75,

                    y:
                        room.y +
                        80,

                    w:
                        150,

                    h:
                        320,

                    solid:
                        true
                },


                {
                    name:
                        "bookshelf",

                    x:
                        room.x +
                        265,

                    y:
                        room.y +
                        80,

                    w:
                        150,

                    h:
                        320,

                    solid:
                        true
                },


                {
                    name:
                        "desk",

                    x:
                        room.x +
                        600,

                    y:
                        room.y +
                        350,

                    w:
                        260,

                    h:
                        145,

                    solid:
                        true
                },


                {
                    name:
                        "table",

                    x:
                        room.x +
                        room.w -
                        310,

                    y:
                        room.y +
                        160,

                    w:
                        210,

                    h:
                        130,

                    solid:
                        true
                }
            ];
        }


        if (
            id ===
            "forge"
        ) {

            return [

                {
                    name:
                        "furnace",

                    x:
                        room.x +
                        80,

                    y:
                        room.y +
                        100,

                    w:
                        240,

                    h:
                        300,

                    solid:
                        true
                },


                {
                    name:
                        "anvil",

                    x:
                        room.x +
                        555,

                    y:
                        room.y +
                        420,

                    w:
                        190,

                    h:
                        145,

                    solid:
                        true
                },


                {
                    name:
                        "oreCrate",

                    x:
                        room.x +
                        room.w -
                        290,

                    y:
                        room.y +
                        120,

                    w:
                        180,

                    h:
                        145,

                    solid:
                        true
                },


                {
                    name:
                        "toolRack",

                    x:
                        room.x +
                        room.w -
                        200,

                    y:
                        room.y +
                        450,

                    w:
                        110,

                    h:
                        250,

                    solid:
                        true
                },


                {
                    name:
                        "workbench",

                    x:
                        room.x +
                        450,

                    y:
                        room.y +
                        110,

                    w:
                        330,

                    h:
                        115,

                    solid:
                        true
                }
            ];
        }


        if (
            id ===
            "shop"
        ) {

            return [

                {
                    name:
                        "counter",

                    x:
                        room.x +
                        460,

                    y:
                        room.y +
                        310,

                    w:
                        470,

                    h:
                        105,

                    solid:
                        true
                },


                {
                    name:
                        "shopShelf",

                    x:
                        room.x +
                        85,

                    y:
                        room.y +
                        90,

                    w:
                        160,

                    h:
                        360,

                    solid:
                        true
                },


                {
                    name:
                        "shopShelf",

                    x:
                        room.x +
                        room.w -
                        245,

                    y:
                        room.y +
                        90,

                    w:
                        160,

                    h:
                        360,

                    solid:
                        true
                },


                {
                    name:
                        "crate",

                    x:
                        room.x +
                        145,

                    y:
                        room.y +
                        room.h -
                        230,

                    w:
                        145,

                    h:
                        120,

                    solid:
                        true
                }
            ];
        }


        if (
            id ===
            "woodshop"
        ) {

            return [

                {
                    name:
                        "workbench",

                    x:
                        room.x +
                        410,

                    y:
                        room.y +
                        300,

                    w:
                        390,

                    h:
                        145,

                    solid:
                        true
                },


                {
                    name:
                        "logStack",

                    x:
                        room.x +
                        75,

                    y:
                        room.y +
                        100,

                    w:
                        230,

                    h:
                        280,

                    solid:
                        true
                },


                {
                    name:
                        "boardStack",

                    x:
                        room.x +
                        room.w -
                        285,

                    y:
                        room.y +
                        100,

                    w:
                        210,

                    h:
                        250,

                    solid:
                        true
                },


                {
                    name:
                        "toolRack",

                    x:
                        room.x +
                        room.w -
                        190,

                    y:
                        room.y +
                        500,

                    w:
                        100,

                    h:
                        240,

                    solid:
                        true
                }
            ];
        }


        return [];
    }


    function getInteriorNPCs() {

        if (
            !state.currentHouse
        ) {

            return [];
        }


        const room =
            getHouseRoom();


        const id =
            state.currentHouse.id;


        if (
            id ===
            "elianHome"
        ) {

            return [

                {
                    id:
                        "interior_elian",

                    x:
                        room.x +
                        980,

                    y:
                        room.y +
                        500,

                    radius:
                        17,

                    ...NPC_LIBRARY.ELIAN
                }
            ];
        }


        if (
            id ===
            "shop"
        ) {

            /*
                DORAN SOMENTE DENTRO DA LOJA.
            */

            return [

                {
                    id:
                        "interior_doran",

                    x:
                        room.x +
                        690,

                    y:
                        room.y +
                        255,

                    radius:
                        17,

                    ...NPC_LIBRARY.DORAN
                }
            ];
        }


        if (
            id ===
            "forge"
        ) {

            return [

                {
                    id:
                        "interior_borin",

                    x:
                        room.x +
                        920,

                    y:
                        room.y +
                        470,

                    radius:
                        17,

                    ...NPC_LIBRARY.BORIN,

                    blacksmith:
                        true
                }
            ];
        }


        if (
            id ===
            "woodshop"
        ) {

            return [

                {
                    id:
                        "interior_bran",

                    x:
                        room.x +
                        960,

                    y:
                        room.y +
                        460,

                    radius:
                        17,

                    ...NPC_LIBRARY.BRAN
                }
            ];
        }


        return [];
    }


    function getSleepTarget() {

        if (
            !state.houseMode ||
            state.currentHouse
                ?.id !==
                "home"
        ) {

            return null;
        }


        const bed =
            getHouseFurniture()
                .find(
                    furniture =>
                        furniture.interactable ===
                        "sleep"
                );


        if (
            !bed
        ) {

            return null;
        }


        return {

            x:
                bed.x +
                bed.w /
                2,

            y:
                bed.y +
                bed.h /
                2
        };
    }


    function placePlayerInsideHouse() {

        const room =
            getHouseRoom();


        state.player.x =
            room.x +
            room.w /
                2;


        state.player.y =
            room.y +
            room.h -
            115;
    }


    function canPlayerMoveTo(
        x,
        y,
        radius
    ) {

        if (
            state.houseMode
        ) {

            const room =
                getHouseRoom();


            if (
                x -
                    radius <
                    room.x +
                        18 ||
                x +
                    radius >
                    room.x +
                        room.w -
                        18 ||
                y -
                    radius <
                    room.y +
                        18 ||
                y +
                    radius >
                    room.y +
                        room.h -
                        18
            ) {

                return false;
            }


            for (
                const furniture of
                getHouseFurniture()
            ) {

                if (
                    !furniture.solid
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

                    return false;
                }
            }


            return true;
        }


        if (
            x -
                radius <
                70 ||
            y -
                radius <
                70 ||
            x +
                radius >
                state.world.width -
                    70 ||
            y +
                radius >
                state.world.height -
                    70
        ) {

            return false;
        }


        for (
            const obstacle of
            state.world.obstacles
        ) {

            /*
                ÁRVORE DESTRUÍDA NÃO COLIDE.
            */

            if (
                obstacle.treeId
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
                    tree &&
                    !tree.alive
                ) {

                    continue;
                }
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


    function canEnemyMoveTo(
        x,
        y,
        radius
    ) {

        if (
            x -
                radius <
                75 ||
            y -
                radius <
                75 ||
            x +
                radius >
                state.world.width -
                    75 ||
            y +
                radius >
                state.world.height -
                    75
        ) {

            return false;
        }


        for (
            const obstacle of
            state.world.obstacles
        ) {

            if (
                obstacle.treeId
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
                    tree &&
                    !tree.alive
                ) {

                    continue;
                }
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


    /* =====================================================
       MOVIMENTO
    ===================================================== */

    function updateMovement(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            player.stunTimer >
                0 ||
            player.playerDash
        ) {

            return;
        }


        let x =
            0;


        let y =
            0;


        if (
            state.keys.has(
                "w"
            ) ||
            state.keys.has(
                "arrowup"
            )
        ) {

            y -=
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

            y +=
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

            x -=
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

            x +=
                1;
        }


        if (
            x ===
                0 &&
            y ===
                0
        ) {

            return;
        }


        const dir =
            normalizeVector(
                x,
                y
            );


        let speed =
            player.baseSpeed ||
            player.speed;


        /*
            FOME E CANSAÇO MUITO BAIXOS
            DIMINUEM A VELOCIDADE.
        */

        const hungerRatio =
            player.hunger /
            Math.max(
                1,
                player.maxHunger ||
                    100
            );


        const fatigueRatio =
            player.fatigue /
            Math.max(
                1,
                player.maxFatigue ||
                    100
            );


        if (
            hungerRatio <=
            0
        ) {

            speed *=
                0.74;
        }


        if (
            fatigueRatio <=
            0
        ) {

            speed *=
                0.68;
        }


        if (
            player.adaptiveBuff
        ) {

            speed +=
                24;
        }


        const move =
            speed *
            dt;


        const nextX =
            player.x +
            dir.x *
            move;


        const nextY =
            player.y +
            dir.y *
            move;


        /*
            MOVIMENTO POR EIXOS,
            EVITA TRAVAR EM QUINAS.
        */

        if (
            canPlayerMoveTo(
                nextX,
                player.y,
                player.radius
            )
        ) {

            player.x =
                nextX;
        }


        if (
            canPlayerMoveTo(
                player.x,
                nextY,
                player.radius
            )
        ) {

            player.y =
                nextY;
        }


        if (
            Math.random() <
            0.07
        ) {

            state.world
                .effects
                .push({

                    type:
                        "footstep",

                    x:
                        player.x,

                    y:
                        player.y +
                        player.radius,

                    color:
                        "rgba(210,195,160,.4)",

                    life:
                        0.35,

                    maxLife:
                        0.35
                });
        }
    }


    /* =====================================================
       SOBREVIVÊNCIA
    ===================================================== */

    function updateSurvival(
        dt
    ) {

        const player =
            state.player;


        if (
            !player ||
            state.houseMode
        ) {

            return;
        }


        /*
            COMO AS BARRAS PODEM PASSAR DE 100,
            A QUEDA CONTINUA EM VALOR ABSOLUTO.

            EXEMPLO:
            190 DE FOME DURA MUITO MAIS QUE 100.
        */

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
                0.078 *
                dt
            );


        /*
            REGENERAÇÃO LEVE.
        */

        if (
            player.hunger >
                player.maxHunger *
                    0.25
        ) {

            player.hp =
                Math.min(

                    player.maxHp,

                    player.hp +
                    0.26 *
                    dt
                );
        }


        player.energy =
            Math.min(

                player.maxEnergy,

                player.energy +
                3.3 *
                dt
            );


        player.magic =
            Math.min(

                player.maxMagic,

                player.magic +
                2.25 *
                dt
            );


        /*
            FOME ZERO:
            VIDA DESCE DEVAGAR.
        */

        if (
            player.hunger <=
            0
        ) {

            player.hp =
                Math.max(
                    0,
                    player.hp -
                        0.45 *
                        dt
                );


            if (
                player.hp <=
                0
            ) {

                playerDeath();
            }
        }


        /*
            CANSAÇO ZERO:
            ENERGIA REGENERA MUITO MENOS.
        */

        if (
            player.fatigue <=
            0
        ) {

            player.energy =
                Math.max(
                    0,
                    player.energy -
                        0.30 *
                        dt
                );
        }


        const lowHunger =
            player.hunger <=
            player.maxHunger *
                0.15;


        const lowFatigue =
            player.fatigue <=
            player.maxFatigue *
                0.15;


        document.body
            .classList
            .toggle(
                "low-needs",
                lowHunger ||
                    lowFatigue
            );


        if (
            (
                lowHunger ||
                lowFatigue
            ) &&
            performance.now() -
                state.warnedNeedAt >
                7000
        ) {

            state.warnedNeedAt =
                performance.now();


            showToast(

                lowHunger &&
                lowFatigue

                    ? "Você está com muita fome e exausto."

                    : lowHunger

                    ? "Sua fome está muito baixa."

                    : "Você está ficando exausto."
            );
        }
    }


    /* =====================================================
       COOLDOWNS
    ===================================================== */

    function updateCooldowns(
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


        player.invincible =
            Math.max(
                0,
                player.invincible -
                    dt
            );


        player.stunTimer =
            Math.max(
                0,
                (
                    player.stunTimer ||
                    0
                ) -
                    dt
            );


        player.shieldTimer =
            Math.max(
                0,
                (
                    player.shieldTimer ||
                    0
                ) -
                    dt
            );


        player.dashCooldown =
            Math.max(
                0,
                (
                    player.dashCooldown ||
                    0
                ) -
                    dt
            );


        if (
            player.shieldTimer <=
            0
        ) {

            player.damageReduction =
                0;
        }


        [
            "q",
            "r",
            "f"
        ]
            .forEach(
                key => {

                    player
                        .skillCooldowns[
                            key
                        ] =
                        Math.max(
                            0,

                            (
                                player
                                    .skillCooldowns[
                                        key
                                    ] ||
                                0
                            ) -
                                dt
                        );
                }
            );
    }


    /* =====================================================
       DASH DO PLAYER

       NÃO CAUSA DANO.
       SERVE SOMENTE PARA MOVIMENTO / DESVIO.
    ===================================================== */

    function useDashAbility() {

        const player =
            state.player;


        if (
            !player ||
            !player.abilities
                ?.dash ||
            state.paused ||
            state.houseMode ||
            player.dead ||
            player.playerDash
        ) {

            return;
        }


        if (
            player.dashCooldown >
            0
        ) {

            return;
        }


        if (
            player.energy <
            8
        ) {

            showToast(
                "Energia insuficiente para usar Dash."
            );

            return;
        }


        let dx =
            state.pointer.worldX -
            player.x;


        let dy =
            state.pointer.worldY -
            player.y;


        if (
            Math.hypot(
                dx,
                dy
            ) <
            10
        ) {

            dx =
                1;

            dy =
                0;
        }


        const dir =
            normalizeVector(
                dx,
                dy
            );


        player.energy -=
            8;


        player.dashCooldown =
            1.25;


        /*
            PEQUENA JANELA DE INVENCIBILIDADE.
            ISSO É O QUE PERMITE DESVIAR DOS
            BOSSES DA SEGUNDA ROTA.
        */

        player.invincible =
            Math.max(
                player.invincible,
                0.28
            );


        startPlayerDash(

            dir.x,
            dir.y,

            205,

            0.20,

            null
        );


        state.world
            .effects
            .push({

                type:
                    "playerDashBurst",

                x:
                    player.x,

                y:
                    player.y,

                color:
                    getCharacterPalette()
                        .main,

                life:
                    0.38,

                maxLife:
                    0.38
            });
    }


    function startPlayerDash(
        dirX,
        dirY,
        distanceAmount,
        duration,
        callback =
            null
    ) {

        if (
            state.player
                .playerDash
        ) {

            return;
        }


        state.player.playerDash = {

            dirX,
            dirY,

            remaining:
                distanceAmount,

            speed:
                distanceAmount /
                duration,

            callback
        };
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


        const move =
            Math.min(
                dash.remaining,
                dash.speed *
                    dt
            );


        const nextX =
            player.x +
            dash.dirX *
                move;


        const nextY =
            player.y +
            dash.dirY *
                move;


        const canMove =
            canPlayerMoveTo(
                nextX,
                nextY,
                player.radius
            );


        if (
            canMove
        ) {

            player.x =
                nextX;


            player.y =
                nextY;


            state.world
                .effects
                .push({

                    type:
                        "dashAfterimage",

                    x:
                        player.x,

                    y:
                        player.y,

                    color:
                        getCharacterPalette()
                            .main,

                    life:
                        0.22,

                    maxLife:
                        0.22
                });


            if (
                Math.random() <
                0.65
            ) {

                spawnParticles(

                    player.x,
                    player.y,

                    getCharacterPalette()
                        .main,

                    2
                );
            }
        }


        dash.remaining -=
            move;


        if (
            dash.remaining <=
                0 ||
            !canMove
        ) {

            const callback =
                dash.callback;


            player.playerDash =
                null;


            if (
                typeof callback ===
                "function"
            ) {

                callback();
            }
        }
    }


    /* =====================================================
       INIMIGO MAIS PRÓXIMO
    ===================================================== */

    function findEnemyToward(
        targetX,
        targetY,
        range,
        minimumDot =
            0.25
    ) {

        const player =
            state.player;


        const aim =
            normalizeVector(

                targetX -
                    player.x,

                targetY -
                    player.y
            );


        let best =
            null;


        let bestScore =
            -Infinity;


        for (
            const enemy of
            state.world.enemies
        ) {

            if (
                enemy.dead
            ) {

                continue;
            }


            const dx =
                enemy.x -
                player.x;


            const dy =
                enemy.y -
                player.y;


            const d =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                d >
                range
            ) {

                continue;
            }


            const dir =
                normalizeVector(
                    dx,
                    dy
                );


            const dot =
                aim.x *
                    dir.x +
                aim.y *
                    dir.y;


            if (
                dot <
                minimumDot
            ) {

                continue;
            }


            const score =
                dot *
                    2 -
                d /
                    range;


            if (
                score >
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


    /* =====================================================
       ATAQUE BÁSICO

       IMPORTANTE:
       NÃO EXISTE AUTO-ATAQUE SEGURANDO O MOUSE.

       A PARTE 3 CHAMARÁ ISSO SOMENTE NO POINTERDOWN.
    ===================================================== */

    function performAttack(
        point =
            null
    ) {

        const player =
            state.player;


        if (
            !player ||
            state.paused ||
            state.houseMode ||
            player.dead ||
            player.stunTimer >
                0 ||
            isGameplayOverlayOpen()
        ) {

            return;
        }


        if (
            player.attackCooldown >
            0
        ) {

            return;
        }


        if (
            player.energy <
            3
        ) {

            return;
        }


        const targetX =
            point?.x ??
            state.pointer.worldX;


        const targetY =
            point?.y ??
            state.pointer.worldY;


        const character =
            currentCharacter();


        const ranged =

            character.id ===
                "kaelion" ||

            character.id ===
                "lirael";


        const range =

            ranged
                ? 390

                : character.id ===
                  "grumgar"

                ? 150

                : 135;


        const target =
            findEnemyToward(

                targetX,
                targetY,

                range,

                ranged
                    ? 0.18
                    : 0.36
            );


        player.energy =
            Math.max(
                0,

                player.energy -
                    (
                        character.id ===
                        "grumgar"
                            ? 4
                            : 3
                    )
            );


        const attackSpeeds = {

            kaelion:
                0.37,

            theron:
                0.34,

            grumgar:
                0.50,

            lirael:
                0.28,

            zephyr:
                0.31
        };


        player.attackCooldown =
            attackSpeeds[
                character.id
            ] ||
            0.35;


        createBasicAttackEffect(
            targetX,
            targetY
        );


        if (
            !target
        ) {

            return;
        }


        if (
            target.type ===
                "progression" &&
            !target.accepted
        ) {

            openBattle(
                target
            );

            return;
        }


        let damage =
            player.damage +
            (
                ITEMS[
                    player
                        .equipment
                        .weapon
                ]?.damage ||
                0
            );


        if (
            character.id ===
            "grumgar"
        ) {

            damage +=
                8;
        }


        if (
            character.id ===
            "theron"
        ) {

            damage +=
                4;
        }


        attackEnemy(
            target,
            Math.round(
                damage
            )
        );
    }


    /* =====================================================
       EFEITO DO ATAQUE
    ===================================================== */

    function createBasicAttackEffect(
        targetX,
        targetY
    ) {

        const player =
            state.player;


        const character =
            currentCharacter();


        const palette =
            getCharacterPalette();


        const dir =
            normalizeVector(

                targetX -
                    player.x,

                targetY -
                    player.y
            );


        const angle =
            Math.atan2(
                dir.y,
                dir.x
            );


        if (
            character.id ===
            "kaelion"
        ) {

            state.world
                .effects
                .push({

                    type:
                        "playerProjectile",

                    x:
                        player.x,

                    y:
                        player.y,

                    vx:
                        dir.x *
                        530,

                    vy:
                        dir.y *
                        530,

                    life:
                        0.42,

                    maxLife:
                        0.42,

                    radius:
                        12,

                    color:
                        palette.main,

                    glow:
                        palette.glow
                });
        }


        else if (
            character.id ===
            "lirael"
        ) {

            state.world
                .effects
                .push({

                    type:
                        "fairyShot",

                    x:
                        player.x,

                    y:
                        player.y,

                    vx:
                        dir.x *
                        610,

                    vy:
                        dir.y *
                        610,

                    life:
                        0.38,

                    maxLife:
                        0.38,

                    color:
                        palette.main,

                    glow:
                        palette.glow
                });
        }


        else {

            state.world
                .effects
                .push({

                    type:

                        character.id ===
                        "grumgar"

                            ? "smashArc"

                            : character.id ===
                              "theron"

                            ? "bladeArc"

                            : "clawArc",

                    x:
                        player.x,

                    y:
                        player.y,

                    angle,

                    radius:

                        character.id ===
                        "grumgar"
                            ? 72
                            : 66,

                    life:
                        0.26,

                    maxLife:
                        0.26,

                    color:
                        palette.main
                });
        }
    }


    /* =====================================================
       DANO EM INIMIGO
    ===================================================== */

    function attackEnemy(
        enemy,
        amount
    ) {

        if (
            !enemy ||
            enemy.dead
        ) {

            return;
        }


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        enemy.state =
            "chasing";


        const damage =
            Math.max(
                1,
                Math.round(
                    amount
                )
            );


        enemy.hp =
            Math.max(
                0,
                enemy.hp -
                    damage
            );


        enemy.hitFlash =
            0.14;


        spawnParticles(

            enemy.x,
            enemy.y,

            damage >=
            60
                ? "#ffd06b"
                : "#ffffff",

            damage >=
            60
                ? 12
                : 7
        );


        state.world
            .effects
            .push({

                type:
                    "damageNumber",

                x:
                    enemy.x,

                y:
                    enemy.y -
                    enemy.radius -
                    10,

                text:
                    `-${damage}`,

                color:

                    damage >=
                    90

                        ? "#d78bff"

                        : damage >=
                          60

                        ? "#ff8b61"

                        : damage >=
                          35

                        ? "#ffd866"

                        : "#ffffff",

                life:
                    0.72,

                maxLife:
                    0.72
            });


        /* =================================================
           STAGGER DO MONARCA

           A CADA GOLPE REAL QUE ACERTA:
           +1

           COM 10:
           5 SEGUNDOS DESNORTEADO.
        ================================================= */

        if (
            enemy.id ===
                "monarch" &&
            enemy.staggerTimer <=
                0
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


                enemy.telegraphing =
                    false;


                enemy.specialTimer =
                    Math.max(
                        enemy.specialTimer,
                        5
                    );


                enemy.summonTimer =
                    Math.max(
                        enemy.summonTimer ||
                            0,
                        5
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "monarchStagger",

                        x:
                            enemy.x,

                        y:
                            enemy.y,

                        color:
                            "#d69cff",

                        life:
                            5,

                        maxLife:
                            5
                    });


                spawnParticles(
                    enemy.x,
                    enemy.y,
                    "#d69cff",
                    30
                );


                shakeScreen(
                    7,
                    0.24
                );


                showToast(
                    "O MONARCA FICOU DESNORTEADO!"
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
    }


    /* =====================================================
       DANO EM ÁREA
    ===================================================== */

    function damageEnemiesInRadius(
        x,
        y,
        radius,
        damage,
        options =
            {}
    ) {

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
                enemy.type ===
                    "progression" &&
                !enemy.accepted
            ) {

                continue;
            }


            if (
                Math.hypot(

                    enemy.x -
                        x,

                    enemy.y -
                        y

                ) <=

                radius +
                    enemy.radius
            ) {

                attackEnemy(
                    enemy,
                    damage
                );


                if (
                    options.stun
                ) {

                    enemy.stunTimer =
                        Math.max(

                            enemy.stunTimer ||
                                0,

                            options.stun
                        );
                }
            }
        }


        state.world
            .effects
            .push({

                type:
                    "skillRing",

                x,
                y,
                radius,

                color:
                    options.color ||
                    currentCharacter()
                        .color,

                life:
                    0.48,

                maxLife:
                    0.48
            });
    }


    /* =====================================================
       EFEITO DE DANO NA TELA

       É AQUI QUE COMEÇA O SISTEMA VERMELHO.
       A PARTE 3 DESENHA ISSO SOBRE A CÂMERA.
    ===================================================== */

    function triggerDamageScreenEffect(
        damage
    ) {

        const player =
            state.player;


        if (
            !player
        ) {

            return;
        }


        const ratio =
            clamp(
                damage /
                    Math.max(
                        1,
                        player.maxHp
                    ),
                0,
                0.50
            );


        /*
            PISCADA VERMELHA.
            DANO MAIOR = MAIS FORTE.
        */

        state.damageFlash =
            Math.max(

                state.damageFlash,

                clamp(
                    0.18 +
                        ratio *
                        1.5,
                    0.18,
                    0.55
                )
            );


        state.damageFlashMax =
            Math.max(
                state.damageFlashMax ||
                    0.45,
                state.damageFlash
            );


        /*
            PEQUENAS MANCHAS DE SANGUE.

            x/y ficam em porcentagem da tela,
            então funcionam em qualquer resolução.
        */

        const markCount =
            damage >=
                player.maxHp *
                    0.18
                ? 4
                : damage >=
                  player.maxHp *
                      0.08
                ? 3
                : 2;


        for (
            let i = 0;
            i <
            markCount;
            i++
        ) {

            const side =
                randomInt(
                    0,
                    3
                );


            let x;
            let y;


            if (
                side ===
                0
            ) {

                x =
                    random(
                        0.02,
                        0.18
                    );


                y =
                    random(
                        0.10,
                        0.90
                    );
            }


            else if (
                side ===
                1
            ) {

                x =
                    random(
                        0.82,
                        0.98
                    );


                y =
                    random(
                        0.10,
                        0.90
                    );
            }


            else if (
                side ===
                2
            ) {

                x =
                    random(
                        0.08,
                        0.92
                    );


                y =
                    random(
                        0.02,
                        0.17
                    );
            }


            else {

                x =
                    random(
                        0.08,
                        0.92
                    );


                y =
                    random(
                        0.83,
                        0.98
                    );
            }


            state.bloodMarks
                .push({

                    x,
                    y,

                    radius:
                        random(
                            10,
                            30
                        ),

                    stretch:
                        random(
                            0.55,
                            1.65
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
                            0.34
                        ),

                    life:
                        random(
                            1.2,
                            2.5
                        ),

                    maxLife:
                        2.5
                });
        }


        /*
            LIMITA QUANTIDADE DE MANCHAS.
        */

        if (
            state.bloodMarks.length >
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
                    1.35 *
                    dt
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


    /* =====================================================
       DANO NO PLAYER
    ===================================================== */

    function damagePlayer(
        amount
    ) {

        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            player.invincible >
                0
        ) {

            return;
        }


        const armorDefense =
            ITEMS[
                player
                    .equipment
                    .armor
            ]?.defense ||
            0;


        let finalDamage =
            amount -
            (
                player.defense +
                armorDefense
            ) *
                0.34;


        finalDamage *=
            1 -
            clamp(
                player.damageReduction ||
                    0,
                0,
                0.72
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


        player.invincible =
            0.50;


        /*
            PISCADA VERMELHA +
            MANCHAS DE SANGUE.
        */

        triggerDamageScreenEffect(
            finalDamage
        );


        shakeScreen(

            Math.min(
                11,
                3 +
                    finalDamage *
                        0.055
            ),

            0.14
        );


        state.world
            .effects
            .push({

                type:
                    "damageNumber",

                x:
                    player.x,

                y:
                    player.y -
                    30,

                text:
                    `-${finalDamage}`,

                color:
                    "#ff766d",

                life:
                    0.70,

                maxLife:
                    0.70
            });


        state.world
            .effects
            .push({

                type:
                    "playerHitBurst",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    45,

                color:
                    "#c54141",

                life:
                    0.28,

                maxLife:
                    0.28
            });


        spawnParticles(
            player.x,
            player.y,
            "#b54444",
            9
        );


        if (
            player.hp <=
            0
        ) {

            playerDeath();
        }
    }


    /* =====================================================
       MORTE
    ===================================================== */

    function playerDeath() {

        if (
            state.player.dead
        ) {

            return;
        }


        state.player.dead =
            true;


        state.paused =
            true;


        state.pointer.down =
            false;


        state.keys.clear();


        cancelHoldInteraction();


        must(
            "deathPanel"
        ).classList.remove(
            "hidden"
        );
    }


    function respawnPlayer() {

        const checkpoint =
            state.player
                .checkpoint ||
            {

                area:
                    "village",

                x:
                    480,

                y:
                    610
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


        state.houseReturn =
            null;


        buildWorld();


        state.player.x =
            checkpoint.x;


        state.player.y =
            checkpoint.y;


        state.player.hp =
            Math.max(
                1,
                Math.round(
                    state.player.maxHp *
                        0.72
                )
            );


        state.player.magic =
            Math.max(
                1,
                Math.round(
                    state.player.maxMagic *
                        0.72
                )
            );


        state.player.energy =
            Math.max(
                1,
                Math.round(
                    state.player.maxEnergy *
                        0.72
                )
            );


        state.player.hunger =
            Math.max(

                state.player.maxHunger *
                    0.30,

                state.player.hunger
            );


        state.player.fatigue =
            Math.max(

                state.player.maxFatigue *
                    0.30,

                state.player.fatigue
            );


        state.player.money =
            Math.floor(
                state.player.money *
                    0.90
            );


        state.player.dead =
            false;


        state.player.invincible =
            1;


        state.damageFlash =
            0;


        state.bloodMarks =
            [];


        state.paused =
            false;


        must(
            "deathPanel"
        ).classList.add(
            "hidden"
        );


        updateCamera();


        showToast(
            "Você retornou ao último ponto seguro."
        );
    }


    /* =====================================================
       SKILLS Q/R/F
    ===================================================== */

    function useSkill(
        key
    ) {

        const player =
            state.player;


        if (
            !player ||
            state.paused ||
            state.houseMode ||
            player.dead ||
            isGameplayOverlayOpen()
        ) {

            return;
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

            return;
        }


        if (
            player.level <
            skill.level
        ) {

            showToast(
                `${skill.name} desbloqueia no nível ${skill.level}.`
            );

            return;
        }


        if (
            player
                .skillCooldowns[
                    key
                ] >
            0
        ) {

            return;
        }


        if (
            skill.costMagic &&
            player.magic <
                skill.costMagic
        ) {

            showToast(
                "Magia insuficiente."
            );

            return;
        }


        if (
            skill.costEnergy &&
            player.energy <
                skill.costEnergy
        ) {

            showToast(
                "Energia insuficiente."
            );

            return;
        }


        player.magic =
            Math.max(
                0,

                player.magic -
                    (
                        skill.costMagic ||
                        0
                    )
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


        player
            .skillCooldowns[
                key
            ] =
            skill.cooldown;


        const character =
            currentCharacter();


        const palette =
            getCharacterPalette();


        const weaponBonus =
            ITEMS[
                player
                    .equipment
                    .weapon
            ]?.damage ||
            0;


        const baseDamage =
            player.damage +
            weaponBonus;


        const point = {

            x:
                state.pointer
                    .worldX ||
                player.x +
                    1,

            y:
                state.pointer
                    .worldY ||
                player.y
        };


        /* =================================================
           KAELION
        ================================================= */

        if (
            character.id ===
            "kaelion"
        ) {

            if (
                key ===
                "q"
            ) {

                const target =
                    findEnemyToward(

                        point.x,
                        point.y,

                        470,
                        0.12
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "memoryOrb",

                        x:
                            player.x,

                        y:
                            player.y,

                        tx:
                            point.x,

                        ty:
                            point.y,

                        color:
                            palette.main,

                        glow:
                            palette.glow,

                        life:
                            0.55,

                        maxLife:
                            0.55
                    });


                spawnParticles(
                    player.x,
                    player.y,
                    palette.glow,
                    13
                );


                if (
                    target
                ) {

                    if (
                        target.type ===
                            "progression" &&
                        !target.accepted
                    ) {

                        openBattle(
                            target
                        );
                    }

                    else {

                        attackEnemy(

                            target,

                            Math.round(
                                baseDamage *
                                    1.50 +
                                    20
                            )
                        );
                    }
                }
            }


            else if (
                key ===
                "r"
            ) {

                damageEnemiesInRadius(

                    player.x,
                    player.y,

                    190,

                    Math.round(
                        baseDamage *
                            1.38 +
                            24
                    ),

                    {
                        stun:
                            0.9,

                        color:
                            palette.main
                    }
                );


                for (
                    let i = 0;
                    i <
                    3;
                    i++
                ) {

                    state.world
                        .effects
                        .push({

                            type:
                                "skillRing",

                            x:
                                player.x,

                            y:
                                player.y,

                            radius:
                                70 +
                                i *
                                    55,

                            color:
                                i %
                                    2
                                    ? palette.glow
                                    : palette.main,

                            life:
                                0.55 +
                                i *
                                    0.09,

                            maxLife:
                                0.55 +
                                i *
                                    0.09
                        });
                }


                shakeScreen(
                    5,
                    0.16
                );
            }


            else if (
                key ===
                "f"
            ) {

                for (
                    let i = 0;
                    i <
                    12;
                    i++
                ) {

                    const angle =
                        random(
                            0,
                            Math.PI *
                                2
                        );


                    const spread =
                        random(
                            50,
                            260
                        );


                    const x =
                        player.x +
                        Math.cos(
                            angle
                        ) *
                            spread;


                    const y =
                        player.y +
                        Math.sin(
                            angle
                        ) *
                            spread;


                    state.world
                        .effects
                        .push({

                            type:
                                "memoryStrike",

                            x,
                            y,

                            color:
                                i %
                                    2
                                    ? palette.glow
                                    : palette.secondary,

                            life:
                                0.7,

                            maxLife:
                                0.7
                        });


                    damageEnemiesInRadius(

                        x,
                        y,

                        72,

                        Math.round(
                            baseDamage *
                                1.05 +
                                28
                        ),

                        {
                            color:
                                palette.main
                        }
                    );
                }


                shakeScreen(
                    9,
                    0.35
                );
            }
        }


        /* =================================================
           THERON
        ================================================= */

        else if (
            character.id ===
            "theron"
        ) {

            if (
                key ===
                "q"
            ) {

                const target =
                    findEnemyToward(

                        point.x,
                        point.y,

                        180,
                        0.18
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "bladeArc",

                        x:
                            player.x,

                        y:
                            player.y,

                        angle:
                            Math.atan2(

                                point.y -
                                    player.y,

                                point.x -
                                    player.x
                            ),

                        radius:
                            92,

                        heavy:
                            true,

                        color:
                            palette.glow,

                        life:
                            0.34,

                        maxLife:
                            0.34
                    });


                if (
                    target
                ) {

                    attackEnemy(

                        target,

                        Math.round(
                            baseDamage *
                                1.72 +
                                18
                        )
                    );


                    target.stunTimer =
                        Math.max(
                            target.stunTimer ||
                                0,
                            0.65
                        );
                }


                shakeScreen(
                    5,
                    0.12
                );
            }


            else if (
                key ===
                "r"
            ) {

                player.damageReduction =
                    0.45;


                player.shieldTimer =
                    5.5;


                state.world
                    .effects
                    .push({

                        type:
                            "shieldAura",

                        color:
                            palette.main,

                        life:
                            5.5,

                        maxLife:
                            5.5
                    });
            }


            else if (
                key ===
                "f"
            ) {

                player.damageReduction =
                    0.60;


                player.shieldTimer =
                    7.5;


                damageEnemiesInRadius(

                    player.x,
                    player.y,

                    165,

                    Math.round(
                        baseDamage *
                            1.42 +
                            32
                    ),

                    {
                        stun:
                            1.1,

                        color:
                            palette.glow
                    }
                );


                state.world
                    .effects
                    .push({

                        type:
                            "shieldAura",

                        color:
                            "#ffe7a1",

                        life:
                            7.5,

                        maxLife:
                            7.5
                    });
            }
        }


        /* =================================================
           GRUMGAR
        ================================================= */

        else if (
            character.id ===
            "grumgar"
        ) {

            if (
                key ===
                "q"
            ) {

                damageEnemiesInRadius(

                    player.x,
                    player.y,

                    145,

                    Math.round(
                        baseDamage *
                            1.75 +
                            25
                    ),

                    {
                        stun:
                            0.65,

                        color:
                            palette.main
                    }
                );


                state.world
                    .effects
                    .push({

                        type:
                            "groundCrack",

                        x:
                            player.x,

                        y:
                            player.y,

                        radius:
                            145,

                        color:
                            "#8b7049",

                        life:
                            0.55,

                        maxLife:
                            0.55
                    });


                shakeScreen(
                    10,
                    0.25
                );
            }


            else if (
                key ===
                "r"
            ) {

                damageEnemiesInRadius(

                    player.x,
                    player.y,

                    255,

                    Math.round(
                        baseDamage *
                            0.80 +
                            16
                    ),

                    {
                        stun:
                            2,

                        color:
                            palette.main
                    }
                );


                state.world
                    .effects
                    .push({

                        type:
                            "roarWave",

                        x:
                            player.x,

                        y:
                            player.y,

                        radius:
                            260,

                        color:
                            palette.glow,

                        life:
                            0.8,

                        maxLife:
                            0.8
                    });
            }


            else if (
                key ===
                "f"
            ) {

                damageEnemiesInRadius(

                    player.x,
                    player.y,

                    320,

                    Math.round(
                        baseDamage *
                            1.60 +
                            44
                    ),

                    {
                        stun:
                            1.4,

                        color:
                            palette.main
                    }
                );


                shakeScreen(
                    15,
                    0.45
                );
            }
        }


        /* =================================================
           LIRAEL
        ================================================= */

        else if (
            character.id ===
            "lirael"
        ) {

            if (
                key ===
                "q"
            ) {

                const target =
                    findEnemyToward(

                        point.x,
                        point.y,

                        480,
                        0.10
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "fairyArrow",

                        x:
                            player.x,

                        y:
                            player.y,

                        tx:
                            point.x,

                        ty:
                            point.y,

                        color:
                            palette.main,

                        glow:
                            palette.glow,

                        life:
                            0.48,

                        maxLife:
                            0.48
                    });


                if (
                    target
                ) {

                    attackEnemy(

                        target,

                        Math.round(
                            baseDamage *
                                1.32 +
                                18
                        )
                    );
                }
            }


            else if (
                key ===
                "r"
            ) {

                player.hp =
                    Math.min(

                        player.maxHp,

                        player.hp +
                        Math.round(
                            player.maxHp *
                                0.38
                        )
                    );


                player.energy =
                    Math.min(

                        player.maxEnergy,

                        player.energy +
                            25
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "healingAura",

                        x:
                            player.x,

                        y:
                            player.y,

                        radius:
                            105,

                        color:
                            palette.main,

                        life:
                            1,

                        maxLife:
                            1
                    });
            }


            else if (
                key ===
                "f"
            ) {

                for (
                    let i = 0;
                    i <
                    12;
                    i++
                ) {

                    const x =
                        player.x +
                        random(
                            -250,
                            250
                        );


                    const y =
                        player.y +
                        random(
                            -250,
                            250
                        );


                    state.world
                        .effects
                        .push({

                            type:
                                "fairyStar",

                            x,
                            y,

                            color:
                                i %
                                    2
                                    ? palette.main
                                    : palette.secondary,

                            life:
                                0.9,

                            maxLife:
                                0.9
                        });


                    damageEnemiesInRadius(

                        x,
                        y,

                        70,

                        Math.round(
                            baseDamage +
                                26
                        ),

                        {
                            color:
                                palette.main
                        }
                    );
                }
            }
        }


        /* =================================================
           ZEPHYR
        ================================================= */

        else if (
            character.id ===
            "zephyr"
        ) {

            if (
                key ===
                "q"
            ) {

                activateAdaptiveForm(
                    6.5
                );


                state.world
                    .effects
                    .push({

                        type:
                            "transformAura",

                        x:
                            player.x,

                        y:
                            player.y,

                        color:
                            palette.main,

                        life:
                            1.1,

                        maxLife:
                            1.1
                    });
            }


            else if (
                key ===
                "r"
            ) {

                const dir =
                    normalizeVector(

                        point.x -
                            player.x,

                        point.y -
                            player.y
                    );


                startPlayerDash(

                    dir.x,
                    dir.y,

                    190,

                    0.24,

                    () => {

                        damageEnemiesInRadius(

                            player.x,
                            player.y,

                            105,

                            Math.round(
                                baseDamage *
                                    1.48 +
                                    22
                            ),

                            {
                                color:
                                    palette.main
                            }
                        );
                    }
                );
            }


            else if (
                key ===
                "f"
            ) {

                activateAdaptiveForm(
                    10
                );


                player.damageReduction =
                    0.28;


                player.shieldTimer =
                    10;


                player.hp =
                    Math.min(
                        player.maxHp,
                        player.hp +
                            30
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "transformAura",

                        x:
                            player.x,

                        y:
                            player.y,

                        ultimate:
                            true,

                        color:
                            palette.glow,

                        life:
                            1.6,

                        maxLife:
                            1.6
                    });
            }
        }


        showToast(
            skill.name
        );
    }


    function activateAdaptiveForm(
        duration
    ) {

        const player =
            state.player;


        if (
            player.adaptiveBuff
        ) {

            return;
        }


        player.adaptiveBuff =
            true;


        setTimeout(
            () => {

                if (
                    state.player
                ) {

                    state.player
                        .adaptiveBuff =
                        false;
                }
            },
            duration *
                1000
        );
    }


    /* =====================================================
       MOVIMENTO DE INIMIGO
    ===================================================== */

    function moveEnemyToward(
        enemy,
        targetX,
        targetY,
        dt,
        multiplier =
            1
    ) {

        if (
            enemy.stationary
        ) {

            return;
        }


        const dir =
            normalizeVector(

                targetX -
                    enemy.x,

                targetY -
                    enemy.y
            );


        /*
            SEM TELEPORTE.

            MOVIMENTO INTERPOLADO NORMAL.
        */

        const move =
            enemy.speed *
            multiplier *
            dt;


        const nextX =
            enemy.x +
            dir.x *
                move;


        const nextY =
            enemy.y +
            dir.y *
                move;


        if (
            canEnemyMoveTo(
                nextX,
                enemy.y,
                enemy.radius
            )
        ) {

            enemy.x =
                nextX;
        }


        if (
            canEnemyMoveTo(
                enemy.x,
                nextY,
                enemy.radius
            )
        ) {

            enemy.y =
                nextY;
        }
    }


    /* =====================================================
       INVESTIDA INIMIGA
    ===================================================== */

    function startEnemyCharge(
        enemy,
        targetX,
        targetY,
        speed =
            430,
        maxDuration =
            0.45,
        damageMultiplier =
            1
    ) {

        if (
            enemy.dead
        ) {

            return;
        }


        const dir =
            normalizeVector(

                targetX -
                    enemy.x,

                targetY -
                    enemy.y
            );


        enemy.telegraphing =
            false;


        enemy.charge = {

            dirX:
                dir.x,

            dirY:
                dir.y,

            speed,

            remainingTime:
                maxDuration,

            hitPlayer:
                false,

            damageMultiplier
        };
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


        const move =
            charge.speed *
            dt;


        const nextX =
            enemy.x +
            charge.dirX *
                move;


        const nextY =
            enemy.y +
            charge.dirY *
                move;


        const canMove =
            canEnemyMoveTo(
                nextX,
                nextY,
                enemy.radius
            );


        if (
            canMove
        ) {

            enemy.x =
                nextX;


            enemy.y =
                nextY;
        }


        if (
            Math.random() <
            0.65
        ) {

            state.world
                .effects
                .push({

                    type:
                        "chargeTrail",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    radius:
                        enemy.radius,

                    color:
                        enemy.color,

                    life:
                        0.22,

                    maxLife:
                        0.22
                });
        }


        if (
            !charge.hitPlayer &&
            distance(
                enemy,
                state.player
            ) <=
                enemy.radius +
                    state.player.radius +
                    8
        ) {

            charge.hitPlayer =
                true;


            damagePlayer(
                Math.round(
                    enemy.damage *
                    (
                        charge.damageMultiplier ||
                        1
                    )
                )
            );
        }


        charge.remainingTime -=
            dt;


        if (
            charge.remainingTime <=
                0 ||
            !canMove
        ) {

            enemy.charge =
                null;


            enemy.attackTimer =
                0.65;
        }


        return true;
    }


    /* =====================================================
       BOSS DASH DA ROTA 2+
    ===================================================== */

    function updateBossDash(
        enemy,
        dt
    ) {

        if (
            !enemy.bossDash ||
            enemy.dead ||
            enemy.staggerTimer >
                0 ||
            enemy.charge ||
            enemy.telegraphing
        ) {

            return;
        }


        enemy.bossDashTimer =
            (
                enemy.bossDashTimer ??
                random(
                    3.8,
                    5.5
                )
            ) -
            dt;


        if (
            enemy.bossDashTimer >
            0
        ) {

            return;
        }


        enemy.bossDashTimer =
            random(
                4.2,
                6.4
            );


        enemy.telegraphing =
            true;


        const targetX =
            state.player.x;


        const targetY =
            state.player.y;


        state.world
            .effects
            .push({

                type:
                    "dashWarning",

                x:
                    enemy.x,

                y:
                    enemy.y,

                tx:
                    targetX,

                ty:
                    targetY,

                color:
                    "#ff3e38",

                life:
                    0.85,

                maxLife:
                    0.85
            });


        const warningEnemy =
            enemy;


        setTimeout(
            () => {

                if (
                    warningEnemy.dead ||
                    !state.running ||
                    !state.world
                        .enemies
                        .includes(
                            warningEnemy
                        )
                ) {

                    return;
                }


                startEnemyCharge(

                    warningEnemy,

                    state.player.x,
                    state.player.y,

                    520,

                    0.55,

                    warningEnemy
                        .bossDashDamage ||
                        1.60
                );
            },
            850
        );
    }


    /* =====================================================
       MONARCA
    ===================================================== */

    function spawnMonarch(
        cinematic =
            true
    ) {

        if (
            state.player
                .monarchDefeated
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


        const monarch =
            addEnemy({

                id:
                    "monarch",

                x:
                    2100,

                y:
                    650,

                name:
                    "O MONARCA",

                icon:
                    "🥷",

                type:
                    "monarch",

                hp:
                    2650,

                damage:
                    59,

                speed:
                    0,

                vision:
                    1100,

                attackRange:
                    1000,

                radius:
                    46,

                color:
                    "#30263d",

                stationary:
                    true,

                aggressive:
                    !cinematic,

                accepted:
                    true,

                specialTimer:
                    2.4,

                summonTimer:
                    5,

                summonCooldown:
                    6.5,

                hitCounter:
                    0,

                staggerTimer:
                    0
            });


        if (
            !monarch
        ) {

            return null;
        }


        state.player
            .monarchAwakened =
            true;


        if (
            cinematic
        ) {

            state.paused =
                true;


            state.pointer.down =
                false;


            state.world
                .effects
                .push({

                    type:
                        "monarchExplosion",

                    x:
                        monarch.x,

                    y:
                        monarch.y,

                    radius:
                        260,

                    color:
                        "#7d44aa",

                    life:
                        1.8,

                    maxLife:
                        1.8
                });


            for (
                let i = 0;
                i <
                55;
                i++
            ) {

                spawnParticles(

                    monarch.x +
                        random(
                            -70,
                            70
                        ),

                    monarch.y +
                        random(
                            -70,
                            70
                        ),

                    i %
                        2
                        ? "#6e3b8b"
                        : "#18131d",

                    1
                );
            }


            shakeScreen(
                18,
                0.8
            );


            showCinematicMessage(
                "A OFERENDA FOI ACEITA...",
                1200,
                () => {

                    showCinematicMessage(
                        "...MAS NÃO POR VOCÊ.",
                        1200,
                        () => {

                            showCinematicMessage(
                                "O MONARCA DESPERTOU",
                                1550,
                                () => {

                                    monarch.aggressive =
                                        true;


                                    monarch.accepted =
                                        true;


                                    monarch.summonTimer =
                                        5;


                                    state.paused =
                                        false;


                                    showToast(
                                        "🥷 O MONARCA"
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }


        return monarch;
    }


    function showCinematicMessage(
        text,
        duration,
        callback =
            null
    ) {

        const transition =
            must(
                "transitionScreen"
            );


        must(
            "transitionMessage"
        ).textContent =
            text;


        transition.classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                transition.classList.add(
                    "hidden"
                );


                if (
                    typeof callback ===
                    "function"
                ) {

                    callback();
                }
            },
            duration
        );
    }


    /* =====================================================
       CLONES DO MONARCA

       NASCEM SOMENTE EM POSIÇÕES VÁLIDAS.
    ===================================================== */

    function getMonarchClonePosition() {

        const arena =
            state.world.maze
                ?.arena;


        if (
            !arena
        ) {

            return null;
        }


        for (
            let tries = 0;
            tries <
            80;
            tries++
        ) {

            const x =
                random(

                    arena.x +
                        80,

                    arena.x +
                        arena.w -
                        80
                );


            const y =
                random(

                    arena.y +
                        90,

                    arena.y +
                        arena.h -
                        90
                );


            if (
                !canEnemyMoveTo(
                    x,
                    y,
                    22
                )
            ) {

                continue;
            }


            if (
                distance(
                    {
                        x,
                        y
                    },
                    state.player
                ) <
                140
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

        const livingClones =
            state.world
                .enemies
                .filter(
                    enemy =>
                        enemy.monarchClone &&
                        !enemy.dead
                )
                .length;


        /*
            NÃO DEIXA UM EXÉRCITO INFINITO.
        */

        const available =
            Math.max(
                0,
                6 -
                    livingClones
            );


        if (
            available <=
            0
        ) {

            return;
        }


        const amount =
            Math.min(

                available,

                randomInt(
                    1,
                    3
                )
            );


        for (
            let i = 0;
            i <
            amount;
            i++
        ) {

            const position =
                getMonarchClonePosition();


            if (
                !position
            ) {

                continue;
            }


            /*
                SOMBRA NASCE DO CHÃO PRIMEIRO.
            */

            state.world
                .effects
                .push({

                    type:
                        "shadowSpawn",

                    x:
                        position.x,

                    y:
                        position.y,

                    radius:
                        50,

                    color:
                        "#684783",

                    life:
                        0.65,

                    maxLife:
                        0.65
                });


            const spawnPosition =
                position;


            setTimeout(
                () => {

                    if (
                        !state.running ||
                        monarch.dead ||
                        state.area !==
                        "monarchMaze"
                    ) {

                        return;
                    }


                    addEnemy({

                        id:
                            uid(
                                "monarch_clone"
                            ),

                        x:
                            spawnPosition.x,

                        y:
                            spawnPosition.y,

                        name:
                            "SOMBRA DO MONARCA",

                        icon:
                            "👤",

                        type:
                            "monarchClone",

                        monarchClone:
                            true,

                        hp:
                            180,

                        damage:
                            30,

                        speed:
                            95,

                        vision:
                            650,

                        attackRange:
                            67,

                        radius:
                            22,

                        color:
                            "#4e3b5f",

                        drop:
                            null,

                        special:
                            Math.random() <
                                0.5
                                ? "shadowBurst"
                                : "dash"
                    });
                },
                630
            );
        }


        state.world
            .effects
            .push({

                type:
                    "monarchCast",

                x:
                    monarch.x,

                y:
                    monarch.y,

                radius:
                    130,

                color:
                    "#715091",

                life:
                    0.9,

                maxLife:
                    0.9
            });
    }


    function updateMonarch(
        monarch,
        dt
    ) {

        if (
            monarch.dead ||
            !monarch.aggressive
        ) {

            return;
        }


        /*
            DESNORTEADO.
        */

        if (
            monarch.staggerTimer >
            0
        ) {

            monarch.staggerTimer =
                Math.max(
                    0,
                    monarch.staggerTimer -
                        dt
                );


            if (
                monarch.staggerTimer <=
                0
            ) {

                state.world
                    .effects
                    .push({

                        type:
                            "monarchRecover",

                        x:
                            monarch.x,

                        y:
                            monarch.y,

                        radius:
                            110,

                        color:
                            "#9b68bd",

                        life:
                            0.75,

                        maxLife:
                            0.75
                    });


                spawnParticles(
                    monarch.x,
                    monarch.y,
                    "#9b68bd",
                    24
                );


                showToast(
                    "O Monarca recuperou os sentidos."
                );
            }


            return;
        }


        monarch.summonTimer =
            (
                monarch.summonTimer ??
                5
            ) -
                dt;


        if (
            monarch.summonTimer <=
            0
        ) {

            summonMonarchClones(
                monarch
            );


            monarch.summonTimer =
                monarch.summonCooldown ||
                6.5;
        }


        monarch.specialTimer =
            (
                monarch.specialTimer ??
                2
            ) -
                dt;


        if (
            monarch.specialTimer >
            0
        ) {

            return;
        }


        monarch.specialTimer =
            random(
                2.7,
                4.4
            );


        const attack =
            randomInt(
                0,
                2
            );


        /*
            PEDRAS / SOMBRAS NO CHÃO.
        */

        if (
            attack ===
            0
        ) {

            const count =
                randomInt(
                    5,
                    8
                );


            for (
                let i = 0;
                i <
                count;
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

                    62,

                    0.85 +
                        i *
                            0.05,

                    Math.round(
                        monarch.damage *
                            1.18
                    ),

                    {
                        kind:
                            "monarchRock",

                        color:
                            "#aa3e48"
                    }
                );
            }


            state.world
                .effects
                .push({

                    type:
                        "monarchCast",

                    x:
                        monarch.x,

                    y:
                        monarch.y,

                    color:
                        "#954f71",

                    radius:
                        145,

                    life:
                        0.9,

                    maxLife:
                        0.9
                });
        }


        /*
            ONDA SOMBRIA.
        */

        else if (
            attack ===
            1
        ) {

            for (
                let i = 0;
                i <
                4;
                i++
            ) {

                const angle =
                    Math.PI *
                    2 *
                    i /
                    4;


                addHazard(

                    state.player.x +
                        Math.cos(
                            angle
                        ) *
                            125,

                    state.player.y +
                        Math.sin(
                            angle
                        ) *
                            125,

                    85,

                    0.95,

                    Math.round(
                        monarch.damage *
                            1.10
                    ),

                    {
                        kind:
                            "monarchShadow",

                        color:
                            "#623b73"
                    }
                );
            }
        }


        /*
            ATAQUE DIRETO NO LOCAL DO PLAYER.
        */

        else {

            addHazard(

                state.player.x,
                state.player.y,

                105,

                1.05,

                Math.round(
                    monarch.damage *
                        1.35
                ),

                {
                    kind:
                        "monarchCrush",

                    color:
                        "#c3444e"
                }
            );


            addHazard(

                state.player.x +
                    random(
                        -100,
                        100
                    ),

                state.player.y +
                    random(
                        -100,
                        100
                    ),

                65,

                1.20,

                Math.round(
                    monarch.damage
                ),

                {
                    kind:
                        "monarchCrush",

                    color:
                        "#7a436e"
                }
            );
        }
    }


    /* =====================================================
       INIMIGOS ESPECIAIS
    ===================================================== */

    function updateEnemySpecial(
        enemy
    ) {

        if (
            !enemy.special ||
            enemy.specialTimer >
                0 ||
            enemy.telegraphing ||
            enemy.charge ||
            enemy.staggerTimer >
                0
        ) {

            return;
        }


        const phase =
            Math.max(
                1,
                enemy.phase ||
                    1
            );


        const px =
            state.player.x;


        const py =
            state.player.y;


        /* =================================================
           DASH COMUM
        ================================================= */

        if (
            enemy.special ===
            "dash"
        ) {

            enemy.telegraphing =
                true;


            state.world
                .effects
                .push({

                    type:
                        "dashWarning",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    tx:
                        px,

                    ty:
                        py,

                    color:
                        "#ff6255",

                    life:
                        0.70,

                    maxLife:
                        0.70
                });


            setTimeout(
                () => {

                    if (
                        enemy.dead ||
                        !state.running ||
                        !state.world
                            .enemies
                            .includes(
                                enemy
                            )
                    ) {

                        return;
                    }


                    startEnemyCharge(

                        enemy,

                        state.player.x,
                        state.player.y,

                        430 +
                            phase *
                                30,

                        0.45,

                        1
                    );
                },
                700
            );


            enemy.specialTimer =
                random(
                    3.4,
                    5
                );


            return;
        }


        /* =================================================
           PEDRA
        ================================================= */

        if (
            enemy.special ===
            "rockThrow"
        ) {

            enemy.telegraphing =
                true;


            addHazard(

                px,
                py,

                60,

                0.92,

                Math.round(
                    enemy.damage *
                        0.95
                ),

                {
                    kind:
                        "rock",

                    color:
                        "#ff5b4f"
                }
            );


            state.world
                .effects
                .push({

                    type:
                        "rockProjectile",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    tx:
                        px,

                    ty:
                        py,

                    color:
                        "#8b8073",

                    life:
                        0.92,

                    maxLife:
                        0.92
                });


            setTimeout(
                () => {

                    enemy.telegraphing =
                        false;
                },
                960
            );


            enemy.specialTimer =
                random(
                    2.8,
                    4.1
                );


            return;
        }


        /* =================================================
           CRISTAL
        ================================================= */

        if (
            enemy.special ===
            "crystalShot"
        ) {

            enemy.telegraphing =
                true;


            addHazard(

                px,
                py,

                48,

                0.70,

                Math.round(
                    enemy.damage *
                        0.92
                ),

                {
                    kind:
                        "crystal",

                    color:
                        "#ff5875"
                }
            );


            state.world
                .effects
                .push({

                    type:
                        "crystalProjectile",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    tx:
                        px,

                    ty:
                        py,

                    color:
                        "#ef6581",

                    life:
                        0.70,

                    maxLife:
                        0.70
                });


            setTimeout(
                () =>
                    enemy.telegraphing =
                        false,
                740
            );


            enemy.specialTimer =
                random(
                    2.6,
                    3.9
                );


            return;
        }


        /* =================================================
           ARANHA — TEIA

           REDUZ MOVIMENTO TEMPORARIAMENTE.
        ================================================= */

        if (
            enemy.special ===
            "webShot"
        ) {

            enemy.telegraphing =
                true;


            addHazard(

                px,
                py,

                52,

                0.68,

                Math.round(
                    enemy.damage *
                        0.70
                ),

                {
                    kind:
                        "web",

                    color:
                        "#d5d1d9",

                    onHit:
                        "web"
                }
            );


            state.world
                .effects
                .push({

                    type:
                        "webProjectile",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    tx:
                        px,

                    ty:
                        py,

                    life:
                        0.68,

                    maxLife:
                        0.68,

                    color:
                        "#ddd9df"
                });


            setTimeout(
                () =>
                    enemy.telegraphing =
                        false,
                720
            );


            enemy.specialTimer =
                random(
                    3.4,
                    5
                );


            return;
        }


        /* =================================================
           ESCORPIÃO
        ================================================= */

        if (
            enemy.special ===
            "poisonSting"
        ) {

            if (
                distance(
                    enemy,
                    state.player
                ) <
                145
            ) {

                damagePlayer(
                    enemy.damage *
                        1.15
                );


                state.player.stunTimer =
                    Math.max(
                        state.player
                            .stunTimer,
                        0.18
                    );


                state.world
                    .effects
                    .push({

                        type:
                            "poisonHit",

                        x:
                            state.player.x,

                        y:
                            state.player.y,

                        color:
                            "#82a44f",

                        life:
                            0.60,

                        maxLife:
                            0.60
                    });
            }


            enemy.specialTimer =
                random(
                    3.6,
                    5
                );


            return;
        }


        /* =================================================
           MORCEGO
        ================================================= */

        if (
            enemy.special ===
            "shadowPounce"
        ) {

            enemy.telegraphing =
                true;


            state.world
                .effects
                .push({

                    type:
                        "dashWarning",

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    tx:
                        px,

                    ty:
                        py,

                    color:
                        "#8658a4",

                    life:
                        0.55,

                    maxLife:
                        0.55
                });


            setTimeout(
                () => {

                    if (
                        !enemy.dead &&
                        state.world
                            .enemies
                            .includes(
                                enemy
                            )
                    ) {

                        startEnemyCharge(
                            enemy,
                            state.player.x,
                            state.player.y,
                            520,
                            0.33,
                            1.05
                        );
                    }
                },
                550
            );


            enemy.specialTimer =
                random(
                    3.4,
                    4.8
                );


            return;
        }


        /* =================================================
           HABILIDADES EM ÁREA
        ================================================= */

        const configs = {

            memoryBurst: {

                radius:
                    78,

                delay:
                    0.90,

                multiplier:
                    1,

                count:
                    2 +
                    phase,

                spread:
                    145,

                color:
                    "#c94f50"
            },


            natureBurst: {

                radius:
                    105,

                delay:
                    0.95,

                multiplier:
                    1,

                count:
                    1 +
                    Math.floor(
                        phase /
                            2
                    ),

                spread:
                    105,

                color:
                    "#87aa5d"
            },


            rootCircle: {

                radius:
                    83,

                delay:
                    0.98,

                multiplier:
                    1.08,

                count:
                    2 +
                    phase,

                spread:
                    160,

                color:
                    "#598a51"
            },


            leafStorm: {

                radius:
                    70,

                delay:
                    0.84,

                multiplier:
                    1.05,

                count:
                    3 +
                    phase,

                spread:
                    190,

                color:
                    "#719663"
            },


            rockStorm: {

                radius:
                    74,

                delay:
                    0.88,

                multiplier:
                    1.13,

                count:
                    3 +
                    phase *
                        2,

                spread:
                    220,

                color:
                    "#81766e"
            },


            oreBurst: {

                radius:
                    72,

                delay:
                    0.84,

                multiplier:
                    1.10,

                count:
                    3 +
                    phase,

                spread:
                    175,

                color:
                    "#8c989c"
            },


            crystalRain: {

                radius:
                    66,

                delay:
                    0.73,

                multiplier:
                    1.12,

                count:
                    4 +
                    phase *
                        2,

                spread:
                    225,

                color:
                    "#e95172"
            },


            shadowBurst: {

                radius:
                    82,

                delay:
                    0.82,

                multiplier:
                    1.12,

                count:
                    3 +
                    phase,

                spread:
                    185,

                color:
                    "#705087"
            },


            voidCircle: {

                radius:
                    94,

                delay:
                    0.95,

                multiplier:
                    1.16,

                count:
                    2 +
                    phase,

                spread:
                    180,

                color:
                    "#503369"
            },


            fairyBurst: {

                radius:
                    66,

                delay:
                    0.76,

                multiplier:
                    1.06,

                count:
                    3 +
                    phase,

                spread:
                    190,

                color:
                    "#d89ad3"
            },


            fairyStorm: {

                radius:
                    65,

                delay:
                    0.70,

                multiplier:
                    1.13,

                count:
                    4 +
                    phase *
                        2,

                spread:
                    230,

                color:
                    "#d895dd"
            },


            fireCircle: {

                radius:
                    79,

                delay:
                    0.78,

                multiplier:
                    1.12,

                count:
                    2 +
                    phase,

                spread:
                    165,

                color:
                    "#f55f33"
            },


            infernalStorm: {

                radius:
                    82,

                delay:
                    0.64,

                multiplier:
                    1.22,

                count:
                    5 +
                    phase *
                        2,

                spread:
                    255,

                color:
                    "#f14f35"
            },


            finalStorm: {

                radius:
                    84,

                delay:
                    Math.max(
                        0.48,
                        0.72 -
                            phase *
                                0.035
                    ),

                multiplier:
                    1.18,

                count:
                    5 +
                    phase *
                        2,

                spread:
                    280,

                color:
                    "#a768e4"
            }
        };


        const config =
            configs[
                enemy.special
            ];


        if (
            !config
        ) {

            enemy.specialTimer =
                3;

            return;
        }


        enemy.telegraphing =
            true;


        for (
            let i = 0;
            i <
            config.count;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI *
                        2
                );


            const spread =
                i ===
                0
                    ? 0
                    : random(
                        50,
                        config.spread
                    );


            addHazard(

                px +
                    Math.cos(
                        angle
                    ) *
                        spread,

                py +
                    Math.sin(
                        angle
                    ) *
                        spread,

                config.radius,

                config.delay +
                    i *
                        0.04,

                Math.round(
                    enemy.damage *
                        config.multiplier
                ),

                {
                    kind:
                        enemy.special,

                    color:
                        config.color
                }
            );
        }


        state.world
            .effects
            .push({

                type:
                    "enemyCast",

                x:
                    enemy.x,

                y:
                    enemy.y,

                radius:
                    enemy.radius *
                        2.4,

                color:
                    config.color,

                life:
                    config.delay,

                maxLife:
                    config.delay
            });


        setTimeout(
            () => {

                if (
                    !enemy.dead
                ) {

                    enemy.telegraphing =
                        false;
                }
            },

            (
                config.delay +
                    0.10
            ) *
                1000
        );


        enemy.specialTimer =
            Math.max(

                1.6,

                random(
                    3.5,
                    5
                ) -
                    phase *
                        0.38
            );
    }


    /* =====================================================
       FASE DOS BOSSES
    ===================================================== */

    function updateEnemyPhase(
        enemy
    ) {

        if (
            ![
                "progression",
                "resourceBoss",
                "final",
                "monarch"
            ].includes(
                enemy.type
            )
        ) {

            enemy.phase =
                1;

            return;
        }


        const ratio =
            enemy.hp /
            enemy.maxHp;


        let phase =
            1;


        if (
            enemy.type ===
            "final"
        ) {

            phase =

                ratio >
                0.80
                    ? 1

                    : ratio >
                      0.60
                    ? 2

                    : ratio >
                      0.40
                    ? 3

                    : ratio >
                      0.20
                    ? 4

                    : 5;
        }

        else {

            phase =

                ratio >
                0.68
                    ? 1

                    : ratio >
                      0.34
                    ? 2

                    : 3;
        }


        if (
            phase ===
            enemy.phase
        ) {

            return;
        }


        enemy.phase =
            phase;


        state.world
            .effects
            .push({

                type:
                    "bossPhase",

                x:
                    enemy.x,

                y:
                    enemy.y,

                radius:
                    enemy.radius *
                        3.2,

                color:
                    enemy.color,

                life:
                    0.8,

                maxLife:
                    0.8
            });


        spawnParticles(
            enemy.x,
            enemy.y,
            enemy.color,
            30
        );


        shakeScreen(
            7,
            0.2
        );


        showToast(
            `${enemy.name} — FASE ${phase}`
        );
    }


    /* =====================================================
       IA
    ===================================================== */

    function updateEnemies(
        dt
    ) {

        if (
            state.houseMode ||
            state.paused ||
            !state.player
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


                        enemy.accepted =
                            false;


                        enemy.aggressive =
                            false;


                        enemy.telegraphing =
                            false;


                        enemy.phase =
                            1;


                        enemy.specialTimer =
                            random(
                                1.6,
                                3
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
                    (
                        enemy.specialTimer ||
                        0
                    ) -
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
                    (
                        enemy.stunTimer ||
                        0
                    ) -
                        dt
                );


            if (
                enemy.id ===
                "monarch"
            ) {

                updateEnemyPhase(
                    enemy
                );


                updateMonarch(
                    enemy,
                    dt
                );


                continue;
            }


            if (
                updateEnemyCharge(
                    enemy,
                    dt
                )
            ) {

                continue;
            }


            const d =
                distance(
                    enemy,
                    state.player
                );


            if (
                enemy.type ===
                    "final" &&
                !state.player
                    .finalChoice
            ) {

                if (
                    d <
                        145 &&
                    !state
                        .finalChoiceShown
                ) {

                    openFinalChoice();
                }


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
                !enemy.aggressive &&
                d <=
                    enemy.vision
            ) {

                enemy.aggressive =
                    true;


                enemy.state =
                    "chasing";
            }


            if (
                !enemy.aggressive
            ) {

                continue;
            }


            if (
                d >
                    enemy.vision *
                        2.1 &&
                ![
                    "progression",
                    "final",
                    "hell",
                    "monarchClone",
                    "maze"
                ].includes(
                    enemy.type
                )
            ) {

                enemy.aggressive =
                    false;


                enemy.state =
                    "idle";


                continue;
            }


            if (
                enemy.stunTimer >
                0
            ) {

                continue;
            }


            updateEnemyPhase(
                enemy
            );


            /*
                DASH EXTRA DOS BOSSES
                DA SEGUNDA ROTA EM DIANTE.
            */

            updateBossDash(
                enemy,
                dt
            );


            updateEnemySpecial(
                enemy
            );


            const moveMultiplier =
                enemy.telegraphing
                    ? 0.18
                    : 1;


            if (
                d >
                enemy.attackRange
            ) {

                moveEnemyToward(

                    enemy,

                    state.player.x,
                    state.player.y,

                    dt,

                    moveMultiplier
                );
            }


            else if (
                enemy.attackTimer <=
                    0 &&
                !enemy.telegraphing
            ) {

                damagePlayer(
                    enemy.damage
                );


                enemy.attackTimer =
                    Math.max(
                        0.65,
                        1.16 -
                            enemy.phase *
                                0.07
                    );
            }
        }


        updateBossBarTarget();
    }


    /* =====================================================
       BARRA DE VIDA DO BOSS
    ===================================================== */

    function updateBossBarTarget() {

        const bosses =
            state.world
                .enemies
                .filter(
                    enemy => {

                        if (
                            enemy.dead ||
                            !enemy.aggressive
                        ) {

                            return false;
                        }


                        return [
                            "progression",
                            "final",
                            "monarch"
                        ].includes(
                            enemy.type
                        );
                    }
                );


        if (
            !bosses.length
        ) {

            state.bossBarTarget =
                null;

            return;
        }


        bosses.sort(
            (
                a,
                b
            ) =>
                distance(
                    a,
                    state.player
                ) -
                distance(
                    b,
                    state.player
                )
        );


        state.bossBarTarget =
            bosses[0];
    }


    /* =====================================================
       HAZARDS
    ===================================================== */

    function updateHazards(
        dt
    ) {

        for (
            const hazard of
            state.world.hazards
        ) {

            hazard.delay -=
                dt;


            hazard.life -=
                dt;


            if (
                !hazard.triggered &&
                hazard.delay <=
                    0
            ) {

                hazard.triggered =
                    true;


                const hit =
                    Math.hypot(

                        state.player.x -
                            hazard.x,

                        state.player.y -
                            hazard.y

                    ) <=

                    hazard.radius +
                        state.player.radius;


                if (
                    hit
                ) {

                    damagePlayer(
                        hazard.damage
                    );


                    if (
                        hazard.onHit ===
                        "web"
                    ) {

                        state.player.stunTimer =
                            Math.max(
                                state.player
                                    .stunTimer,
                                0.45
                            );
                    }
                }


                state.world
                    .effects
                    .push({

                        type:
                            "hazardImpact",

                        x:
                            hazard.x,

                        y:
                            hazard.y,

                        radius:
                            hazard.radius,

                        color:
                            hazard.color ||
                            "#ff7253",

                        life:
                            0.28,

                        maxLife:
                            0.28
                    });


                spawnParticles(

                    hazard.x,
                    hazard.y,

                    hazard.color ||
                        "#ff7253",

                    16
                );


                shakeScreen(
                    4,
                    0.1
                );
            }
        }


        state.world.hazards =
            state.world
                .hazards
                .filter(
                    hazard =>
                        hazard.life >
                        0
                );
    }


    /* =====================================================
       DROPS
    ===================================================== */

    function createWorldDrop(
        x,
        y,
        type,
        amount =
            1,
        extra =
            {}
    ) {

        if (
            !ITEMS[
                type
            ]
        ) {

            return null;
        }


        const drop = {

            id:
                uid(
                    "drop"
                ),

            x:
                x +
                random(
                    -15,
                    15
                ),

            y:
                y +
                random(
                    -15,
                    15
                ),

            type,

            amount:
                Math.max(
                    1,
                    Math.floor(
                        amount
                    )
                ),

            life:
                extra.permanent
                    ? Infinity
                    : 75,

            permanent:
                Boolean(
                    extra.permanent
                ),

            source:
                extra.source ||
                null,

            bob:
                random(
                    0,
                    Math.PI *
                        2
                ),

            collected:
                false
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
            drop.collected
        ) {

            return;
        }


        const item =
            ITEMS[
                drop.type
            ];


        if (
            !item
        ) {

            return;
        }


        if (
            item.unique &&
            hasItem(
                drop.type,
                1
            )
        ) {

            showToast(
                "Você já possui este item."
            );

            return;
        }


        addItem(
            drop.type,
            drop.amount
        );


        drop.collected =
            true;


        spawnParticles(
            drop.x,
            drop.y,
            "#ffd67b",
            12
        );


        showToast(
            `${item.name} coletado x${drop.amount}.`
        );


        saveGame(
            false
        );
    }


    function updateWorldDrops(
        dt
    ) {

        for (
            const drop of
            state.world.drops
        ) {

            if (
                Number.isFinite(
                    drop.life
                )
            ) {

                drop.life -=
                    dt;
            }
        }


        state.world.drops =
            state.world
                .drops
                .filter(
                    drop =>
                        !drop.collected &&
                        (
                            !Number.isFinite(
                                drop.life
                            ) ||
                            drop.life >
                                0
                        )
                );
    }


    /* =====================================================
       DERROTAR INIMIGO
    ===================================================== */

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


        enemy.telegraphing =
            false;


        enemy.charge =
            null;


        spawnParticles(

            enemy.x,
            enemy.y,

            enemy.color,

            [
                "progression",
                "final",
                "monarch"
            ].includes(
                enemy.type
            )
                ? 40
                : 18
        );


        state.world
            .effects
            .push({

                type:
                    "enemyDeath",

                x:
                    enemy.x,

                y:
                    enemy.y,

                radius:
                    enemy.radius *
                        2.5,

                color:
                    enemy.color,

                life:
                    0.65,

                maxLife:
                    0.65
            });


        const xp =

            enemy.id ===
                "monarch"

                ? 650

                : enemy.type ===
                  "progression"

                ? 180

                : enemy.type ===
                  "resourceBoss"

                ? 120

                : enemy.type ===
                  "hell"

                ? 65

                : enemy.type ===
                  "maze"

                ? 48

                : enemy.monarchClone

                ? 25

                : 30;


        const money =

            enemy.id ===
                "monarch"

                ? 500

                : enemy.type ===
                  "progression"

                ? 80

                : enemy.type ===
                  "resourceBoss"

                ? 45

                : enemy.type ===
                  "hell"

                ? 22

                : enemy.type ===
                  "maze"

                ? 18

                : 12;


        state.player.xp +=
            xp;


        state.player.money +=
            money;


        if (
            enemy.drop &&
            ITEMS[
                enemy.drop
            ] &&
            Math.random() <=
                (
                    enemy.dropChance ??
                    1
                )
        ) {

            createWorldDrop(

                enemy.x,
                enemy.y,

                enemy.drop,

                enemy.dropAmount ||
                    1,

                {
                    source:
                        enemy.name
                }
            );
        }


        /*
            MONARCA.
        */

        if (
            enemy.id ===
            "monarch"
        ) {

            state.player
                .monarchDefeated =
                true;


            state.bossBarTarget =
                null;


            /*
                NÃO DÁ DASH AUTOMATICAMENTE.

                O PLAYER VOLTA AO ALTAR E
                FINALIZA A COMPRA/RITUAL.
            */

            showCinematicMessage(
                "O MONARCA CAIU.",
                1100,
                () => {

                    showCinematicMessage(
                        "O ALTAR VOLTOU A RESPONDER.",
                        1250,
                        () => {

                            showToast(
                                "Volte ao altar para obter o Dash."
                            );
                        }
                    );
                }
            );


            saveGame(
                false
            );


            checkLevelUp();


            return;
        }


        if (
            enemy.type ===
                "hell" &&
            enemy.hellType !==
                undefined
        ) {

            state.player
                .hellTypesDefeated[
                    String(
                        enemy.hellType
                    )
                ] =
                true;
        }


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


            showToast(
                `Boss derrotado: ${enemy.name}.`
            );
        }


        if (
            enemy.type ===
            "resourceBoss"
        ) {

            enemy.respawnTimer =
                enemy.respawnTime ||
                60;
        }


        if (
            enemy.type ===
            "final"
        ) {

            state.player
                .finalDefeated =
                true;


            showEnding(
                "Você derrotou O Outro Eu e preservou as memórias de Veyra."
            );
        }


        checkLevelUp();


        saveGame(
            false
        );
    }


    /* =====================================================
       LEVEL

       MÁXIMO = 50
       +3 PONTOS DE STATUS POR NÍVEL.
    ===================================================== */

    function checkLevelUp() {

        const player =
            state.player;


        if (
            player.level >=
            MAX_LEVEL
        ) {

            player.level =
                MAX_LEVEL;


            player.xp =
                Math.min(
                    player.xp,
                    player.xpToNext
                );


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
                Math.floor(
                    player.xpToNext *
                        1.40
                );


            /*
                PEQUENO BÔNUS NATURAL.
                A BUILD DE VERDADE VEM DOS STATUS.
            */

            player.maxMagic +=
                1;


            player.magic =
                player.maxMagic;


            player.hp =
                player.maxHp;


            player.energy =
                player.maxEnergy;


            player.memory =
                Math.min(
                    100,
                    player.memory +
                        5
                );


            state.world
                .effects
                .push({

                    type:
                        "levelUp",

                    x:
                        player.x,

                    y:
                        player.y,

                    radius:
                        150,

                    color:
                        "#ffe18b",

                    life:
                        1.2,

                    maxLife:
                        1.2
                });


            spawnParticles(
                player.x,
                player.y,
                "#ffe18b",
                35
            );


            showToast(
                `NÍVEL ${player.level}! +${POINTS_PER_LEVEL} pontos de status.`
            );


            if (
                player.level ===
                5
            ) {

                showToast(
                    "NÍVEL 5! Habilidade R desbloqueada."
                );
            }


            if (
                player.level ===
                10
            ) {

                showToast(
                    "NÍVEL 10! Habilidade F desbloqueada."
                );
            }
        }


        if (
            player.level >=
            MAX_LEVEL
        ) {

            player.level =
                MAX_LEVEL;


            showToast(
                "NÍVEL MÁXIMO ATINGIDO!"
            );
        }
    }


    /* =====================================================
       DISTRIBUIR PONTO
    ===================================================== */

    function addStatPoint(
        statKey
    ) {

        const player =
            state.player;


        const config =
            STAT_CONFIG[
                statKey
            ];


        if (
            !config ||
            player.statPoints <=
                0
        ) {

            return;
        }


        if (
            player.stats[
                statKey
            ] >=
            config.cap
        ) {

            showToast(
                `${config.name} já atingiu o máximo.`
            );

            return;
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
            statKey
        ]++;


        player.statPoints--;


        applyStatBonuses(
            false
        );


        /*
            AO MELHORAR UMA BARRA,
            GANHA TAMBÉM O VALOR NOVO
            PARA NÃO PARECER QUE NÃO ACONTECEU NADA.
        */

        if (
            statKey ===
            "hp"
        ) {

            player.hp +=
                player.maxHp -
                oldMaxHp;
        }


        if (
            statKey ===
            "energy"
        ) {

            player.energy +=
                player.maxEnergy -
                oldMaxEnergy;
        }


        if (
            statKey ===
            "hunger"
        ) {

            player.hunger +=
                player.maxHunger -
                oldMaxHunger;
        }


        if (
            statKey ===
            "fatigue"
        ) {

            player.fatigue +=
                player.maxFatigue -
                oldMaxFatigue;
        }


        openStatusPanel();


        updateHUD();


        saveGame(
            false
        );
    }


    /* =====================================================
       INVENTÁRIO
    ===================================================== */

    function addItem(
        id,
        amount =
            1
    ) {

        if (
            !ITEMS[
                id
            ] ||
            !state.player
        ) {

            return false;
        }


        if (
            ITEMS[
                id
            ].unique &&
            hasItem(
                id
            )
        ) {

            return false;
        }


        state.player
            .inventory[
                id
            ] =
            (
                state.player
                    .inventory[
                        id
                    ] ||
                0
            ) +
            Math.max(
                1,
                Math.floor(
                    amount
                )
            );


        return true;
    }


    function removeItem(
        id,
        amount =
            1
    ) {

        const current =
            state.player
                ?.inventory[
                    id
                ] ||
            0;


        if (
            current <
            amount
        ) {

            return false;
        }


        state.player
            .inventory[
                id
            ] =
            current -
            amount;


        return true;
    }


    function useItem(
        id
    ) {

        const item =
            ITEMS[
                id
            ];


        if (
            !item ||
            !hasItem(
                id
            )
        ) {

            return;
        }


        if (
            id ===
            "flautaMemoria"
        ) {

            useMemoryFlute();

            return;
        }


        if (
            item.category ===
            "food"
        ) {

            removeItem(
                id,
                1
            );


            state.player.hunger =
                Math.min(

                    state.player.maxHunger,

                    state.player.hunger +
                        (
                            item.hunger ||
                            0
                        )
                );


            state.player.hp =
                Math.min(

                    state.player.maxHp,

                    state.player.hp +
                        (
                            item.heal ||
                            0
                        )
                );
        }


        else if (
            item.category ===
            "potions"
        ) {

            if (
                item.heal
            ) {

                if (
                    state.player.hp >=
                    state.player.maxHp
                ) {

                    showToast(
                        "Sua vida já está cheia."
                    );

                    return;
                }


                removeItem(
                    id,
                    1
                );


                state.player.hp =
                    Math.min(

                        state.player.maxHp,

                        state.player.hp +
                            item.heal
                    );
            }


            else if (
                item.energy
            ) {

                if (
                    state.player.energy >=
                    state.player.maxEnergy
                ) {

                    showToast(
                        "Sua energia já está cheia."
                    );

                    return;
                }


                removeItem(
                    id,
                    1
                );


                state.player.energy =
                    Math.min(

                        state.player.maxEnergy,

                        state.player.energy +
                            item.energy
                    );
            }
        }


        else if (
            item.category ===
            "weapons"
        ) {

            state.player
                .equipment
                .weapon =
                id;


            showToast(
                `${item.name} equipada.`
            );
        }


        else if (
            item.category ===
            "armor"
        ) {

            state.player
                .equipment
                .armor =
                id;


            showToast(
                `${item.name} equipada. Defesa +${item.defense}.`
            );
        }


        updateInventory();


        updateHUD();


        saveGame(
            false
        );
    }


    /* =====================================================
       COLETA
    ===================================================== */

    function harvestTree(
        tree
    ) {

        if (
            !tree ||
            !tree.alive
        ) {

            return;
        }


        if (
            state.player.magic <
            4
        ) {

            showToast(
                "Magia insuficiente."
            );

            return;
        }


        state.player.magic -=
            4;


        state.player.fatigue =
            Math.max(
                0,
                state.player.fatigue -
                    1.1
            );


        tree.alive =
            false;


        tree.respawn =
            random(
                22,
                36
            );


        addItem(
            "madeira",
            tree.amount
        );


        state.player.xp +=
            5;


        state.world
            .effects
            .push({

                type:
                    "woodBurst",

                x:
                    tree.x,

                y:
                    tree.y,

                color:
                    "#9b7245",

                life:
                    0.6,

                maxLife:
                    0.6
            });


        spawnParticles(
            tree.x,
            tree.y,
            "#9b7245",
            18
        );


        checkLevelUp();


        showToast(
            `Madeira coletada x${tree.amount}.`
        );
    }


    function collectResource(
        resource
    ) {

        if (
            !resource ||
            !resource.alive
        ) {

            return;
        }


        const costs = {

            folha:
                2,

            algodao:
                2,

            carvao:
                6,

            ferro:
                11,

            ouro:
                19,

            diamante:
                24,

            rubi:
                27,

            cristal:
                16
        };


        const cost =
            costs[
                resource.type
            ] ||
            5;


        if (
            state.player.magic <
            cost
        ) {

            showToast(
                "Magia insuficiente para coletar."
            );

            return;
        }


        state.player.magic -=
            cost;


        state.player.fatigue =
            Math.max(
                0,
                state.player.fatigue -
                    1.3
            );


        resource.alive =
            false;


        resource.respawn =
            random(
                28,
                45
            );


        addItem(
            resource.type,
            resource.amount
        );


        state.player.xp +=
            resource.type ===
                "diamante" ||
            resource.type ===
                "rubi"
                ? 12
                : 7;


        spawnParticles(

            resource.x,
            resource.y,

            resource.type ===
            "rubi"
                ? "#ff6481"

                : resource.type ===
                  "diamante"
                ? "#8ce9ff"

                : resource.type ===
                  "ouro"
                ? "#ffd76a"

                : "#b9c4c8",

            17
        );


        checkLevelUp();


        showToast(
            `${ITEMS[resource.type].name} coletado x${resource.amount}.`
        );
    }


    /* =====================================================
       HOLD E
    ===================================================== */

    function beginHoldInteraction(
        interaction
    ) {

        if (
            !interaction ||
            ![
                "tree",
                "resource"
            ].includes(
                interaction.type
            )
        ) {

            return false;
        }


        const resourceType =
            interaction.object
                ?.type;


        const duration =

            interaction.type ===
            "tree"

                ? 2.2

                : resourceType ===
                  "rubi" ||
                  resourceType ===
                  "diamante"

                ? 3

                : resourceType ===
                  "ouro"

                ? 2.4

                : 1.8;


        state.holdAction = {

            type:
                interaction.type,

            object:
                interaction.object,

            elapsed:
                0,

            duration
        };


        must(
            "holdProgressTitle"
        ).textContent =

            interaction.type ===
            "tree"

                ? "Cortando madeira..."

                : `Coletando ${
                    ITEMS[
                        resourceType
                    ]?.name ||
                    "recurso"
                }...`;


        must(
            "holdProgressFill"
        ).style.width =
            "0%";


        must(
            "holdProgress"
        ).classList.remove(
            "hidden"
        );


        return true;
    }


    function cancelHoldInteraction() {

        state.holdAction =
            null;


        must(
            "holdProgress"
        ).classList.add(
            "hidden"
        );


        must(
            "holdProgressFill"
        ).style.width =
            "0%";
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
            !action.object ||
            !action.object.alive ||
            state.paused
        ) {

            cancelHoldInteraction();

            return;
        }


        if (
            distance(
                state.player,
                action.object
            ) >
            82
        ) {

            cancelHoldInteraction();

            return;
        }


        action.elapsed +=
            dt;


        const percent =
            clamp(

                action.elapsed /
                    action.duration *
                    100,

                0,
                100
            );


        must(
            "holdProgressFill"
        ).style.width =
            `${percent}%`;


        if (
            action.elapsed >=
            action.duration
        ) {

            const {
                type,
                object
            } =
                action;


            cancelHoldInteraction();


            if (
                type ===
                "tree"
            ) {

                harvestTree(
                    object
                );
            }

            else {

                collectResource(
                    object
                );
            }
        }
    }


    /* =====================================================
       CENOURA

       RECUPERA MENOS FOME.
    ===================================================== */

    function eatWorldFood(
        food
    ) {

        if (
            !food ||
            !food.alive
        ) {

            return;
        }


        food.alive =
            false;


        food.respawn =
            random(
                food.respawnMin ||
                    120,
                food.respawnMax ||
                    180
            );


        if (
            food.type ===
            "carrot"
        ) {

            const gain =
                10;


            state.player.hunger =
                Math.min(

                    state.player.maxHunger,

                    state.player.hunger +
                        gain
                );


            showToast(
                `Cenoura comida. +${gain} fome.`
            );


            spawnParticles(
                food.x,
                food.y,
                "#f2a04b",
                10
            );
        }
    }


    /* =====================================================
       RESPAWN DE RECURSOS
    ===================================================== */

    function updateResources(
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


            tree.respawn -=
                dt;


            if (
                tree.respawn <=
                0
            ) {

                tree.alive =
                    true;


                tree.amount =
                    randomInt(
                        2,
                        5
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
            state.world.foods
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


        updateWorldDrops(
            dt
        );
    }


    /* =====================================================
       SEGREDOS
    ===================================================== */

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


        state.player.xp +=
            22;


        state.player.memory =
            Math.min(
                100,
                state.player.memory +
                    3
            );


        state.world
            .effects
            .push({

                type:
                    "secretReveal",

                x:
                    secret.x,

                y:
                    secret.y,

                radius:
                    110,

                color:
                    "#e9c978",

                life:
                    1.1,

                maxLife:
                    1.1
            });


        checkLevelUp();


        showToast(
            `${secret.title}: ${secret.message}`
        );


        saveGame(
            false
        );
    }


    /* =====================================================
       PORTÕES
    ===================================================== */

    function getGateDialogue(
        side
    ) {

        const dialogues =
            GATE_DIALOGUES[
                side
            ];


        if (
            !dialogues ||
            !dialogues.length
        ) {

            return [
                "Você ainda não está preparado."
            ];
        }


        const current =
            state.player
                .gateDialogueIndex[
                    side
                ] ||
            0;


        const selected =
            dialogues[
                current %
                    dialogues.length
            ];


        /*
            1 → 2 → 3 → 1
        */

        state.player
            .gateDialogueIndex[
                side
            ] =
            (
                current +
                1
            ) %
            dialogues.length;


        return selected;
    }


    function getMissingMaterials(
        requirements
    ) {

        const result =
            [];


        Object.entries(
            requirements
        )
            .forEach(
                (
                    [
                        id,
                        required
                    ]
                ) => {

                    const current =
                        state.player
                            .inventory[
                                id
                            ] ||
                        0;


                    if (
                        current <
                        required
                    ) {

                        result.push({

                            id,
                            required,
                            current,

                            missing:
                                required -
                                current
                        });
                    }
                }
            );


        return result;
    }


    function formatMaterialRequirement(
        id,
        required
    ) {

        const current =
            state.player
                .inventory[
                    id
                ] ||
            0;


        const missing =
            Math.max(
                0,
                required -
                    current
            );


        return (
            `${ITEMS[id].icon} ${ITEMS[id].name}: ` +
            `${current} / ${required}` +
            (
                missing >
                0
                    ? ` — faltam ${missing}`
                    : " — ✓"
            )
        );
    }


    function interactGate(
        gate
    ) {

        if (
            !gate
        ) {

            return;
        }


        /*
            NORTE:
            PRIMEIRO ESCONDE COMPLETAMENTE O DASH.
        */

        if (
            gate.side ===
            "north"
        ) {

            if (
                state.player
                    .gateUnlocks
                    .north
            ) {

                transitionTo(
                    gate.target,
                    {
                        direction:
                            "gate",

                        gateSide:
                            "north"
                    }
                );

                return;
            }


            if (
                !hasAbility(
                    "dash"
                )
            ) {

                const lines =
                    getGateDialogue(
                        "north"
                    );


                startNarration(
                    lines
                );


                return;
            }


            /*
                AGORA O PLAYER JÁ TEM DASH.

                SOMENTE NESTE MOMENTO REVELA
                RUBI + DIAMANTE.
            */

            const missing =
                getMissingMaterials(
                    gate.materials
                );


            if (
                missing.length
            ) {

                openGateRequirementPanel(

                    "PORTÃO DO NORTE",

                    [
                        "Você domina a técnica necessária, mas sua preparação ainda está incompleta.",

                        formatMaterialRequirement(
                            "diamante",
                            gate.materials
                                .diamante
                        ),

                        formatMaterialRequirement(
                            "rubi",
                            gate.materials
                                .rubi
                        )
                    ],

                    null
                );


                return;
            }


            openGateRequirementPanel(

                "A PASSAGEM RESPONDE",

                [
                    "Você domina a técnica necessária.",
                    "Os materiais também estão completos.",
                    "Deseja preparar a passagem para a segunda rota?"
                ],

                () => {

                    Object.entries(
                        gate.materials
                    )
                        .forEach(
                            (
                                [
                                    id,
                                    amount
                                ]
                            ) => {

                                removeItem(
                                    id,
                                    amount
                                );
                            }
                        );


                    state.player
                        .gateUnlocks
                        .north =
                        true;


                    saveGame(
                        false
                    );


                    showCinematicMessage(
                        "O PORTÃO DO NORTE FOI DESBLOQUEADO.",
                        1100,
                        () => {

                            transitionTo(
                                gate.target,
                                {
                                    direction:
                                        "gate",

                                    gateSide:
                                        "north"
                                }
                            );
                        }
                    );
                }
            );


            return;
        }


        /*
            ROTAS FUTURAS.

            NÃO VAMOS DAR SPOILER DAS HABILIDADES
            QUE AINDA NEM FORAM DEFINIDAS.
        */

        const unlocked =
            Boolean(
                state.player
                    .gateUnlocks[
                        gate.side
                    ]
            );


        if (
            unlocked
        ) {

            transitionTo(
                gate.target,
                {
                    direction:
                        "gate",

                    gateSide:
                        gate.side
                }
            );


            return;
        }


        startNarration(
            getGateDialogue(
                gate.side
            )
        );
    }


    /* =====================================================
       ALTAR DO DASH
    ===================================================== */

    function interactDashAltar() {

        if (
            state.player
                .abilities
                .dash
        ) {

            showToast(
                "O poder do Dash já pertence a você."
            );

            return;
        }


        /*
            MONARCA JÁ MORREU:
            AGORA FINALIZA A COMPRA.
        */

        if (
            state.player
                .monarchDefeated
        ) {

            const missing =
                getMissingMaterials({

                    rubi:
                        DASH_RUBY_COST,

                    diamante:
                        DASH_DIAMOND_COST
                });


            if (
                missing.length
            ) {

                openGateRequirementPanel(

                    "O ALTAR AGUARDA A OFERENDA",

                    [
                        "O Monarca foi derrotado, mas o ritual ainda precisa ser concluído.",

                        formatMaterialRequirement(
                            "rubi",
                            DASH_RUBY_COST
                        ),

                        formatMaterialRequirement(
                            "diamante",
                            DASH_DIAMOND_COST
                        )
                    ],

                    null
                );


                return;
            }


            openGateRequirementPanel(

                "PODER SELADO",

                [
                    "A presença do Monarca desapareceu.",
                    "O altar finalmente reconhece você como o vencedor.",
                    "Deseja entregar a oferenda e receber o Dash?"
                ],

                () => {

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


                    state.world
                        .effects
                        .push({

                            type:
                                "dashUnlock",

                            x:
                                state.player.x,

                            y:
                                state.player.y,

                            radius:
                                230,

                            color:
                                "#d9b7ff",

                            life:
                                1.8,

                            maxLife:
                                1.8
                        });


                    spawnParticles(
                        state.player.x,
                        state.player.y,
                        "#d9b7ff",
                        55
                    );


                    shakeScreen(
                        9,
                        0.35
                    );


                    showCinematicMessage(
                        "DASH DESBLOQUEADO",
                        1500,
                        () => {

                            showToast(
                                "Use ESPAÇO para avançar na direção do mouse."
                            );
                        }
                    );


                    saveGame(
                        false
                    );
                }
            );


            return;
        }


        /*
            MONARCA AINDA VIVO / NÃO ACORDOU.
        */

        if (
            state.player
                .monarchAwakened
        ) {

            showToast(
                "O ritual já começou. O Monarca ainda está vivo."
            );

            return;
        }


        const missing =
            getMissingMaterials({

                rubi:
                    DASH_RUBY_COST,

                diamante:
                    DASH_DIAMOND_COST
            });


        if (
            missing.length
        ) {

            openGateRequirementPanel(

                "O ALTAR NÃO RESPONDE",

                [
                    "As inscrições do altar despertam sob seus pés.",

                    "Por um instante, uma força tenta alcançar você... mas o brilho desaparece.",

                    "A oferenda é insuficiente para despertar o poder adormecido.",

                    formatMaterialRequirement(
                        "rubi",
                        DASH_RUBY_COST
                    ),

                    formatMaterialRequirement(
                        "diamante",
                        DASH_DIAMOND_COST
                    )
                ],

                null
            );


            return;
        }


        openGateRequirementPanel(

            "ALTAR DO PODER",

            [
                "As inscrições despertam e começam a seguir seus movimentos.",

                "Algo profundamente abaixo da pedra percebe a sua presença.",

                "Você deseja despertar o poder selado?"
            ],

            () => {

                /*
                    NÃO CONSOME NADA AGORA.
                */

                spawnMonarch(
                    true
                );


                saveGame(
                    false
                );
            }
        );
    }


    /* =====================================================
       PAINEL DINÂMICO

       COMO HTML/CSS CONTINUAM OS MESMOS,
       CRIAMOS ESTES PAINÉIS PELO JS.
    ===================================================== */

    function createDynamicPanel(
        id
    ) {

        let panel =
            $(
                id
            );


        if (
            panel
        ) {

            return panel;
        }


        panel =
            document.createElement(
                "div"
            );


        panel.id =
            id;


        panel.style.position =
            "fixed";


        panel.style.inset =
            "0";


        panel.style.zIndex =
            "10050";


        panel.style.display =
            "none";


        panel.style.alignItems =
            "center";


        panel.style.justifyContent =
            "center";


        panel.style.padding =
            "24px";


        panel.style.background =
            "rgba(6,7,9,.74)";


        panel.style.backdropFilter =
            "blur(5px)";


        panel.innerHTML = `

            <div
                data-dynamic-card
                style="
                    width:min(620px,94vw);
                    max-height:86vh;
                    overflow:auto;
                    background:
                        linear-gradient(
                            160deg,
                            rgba(35,31,28,.98),
                            rgba(15,16,19,.99)
                        );
                    border:1px solid rgba(218,184,111,.45);
                    border-radius:18px;
                    padding:28px;
                    box-shadow:
                        0 24px 80px rgba(0,0,0,.65),
                        inset 0 0 45px rgba(255,184,76,.04);
                    color:#eee1c4;
                    font-family:Georgia,serif;
                "
            >

                <h2
                    data-dynamic-title
                    style="
                        margin:0 0 18px;
                        color:#f0cd80;
                        letter-spacing:.08em;
                    "
                ></h2>

                <div
                    data-dynamic-content
                    style="
                        display:grid;
                        gap:11px;
                        line-height:1.55;
                    "
                ></div>

                <div
                    data-dynamic-actions
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        justify-content:flex-end;
                        gap:10px;
                        margin-top:24px;
                    "
                ></div>

            </div>
        `;


        document.body
            .appendChild(
                panel
            );


        return panel;
    }


    function showDynamicPanel(
        id,
        title,
        contentHtml,
        buttons
    ) {

        const panel =
            createDynamicPanel(
                id
            );


        panel.querySelector(
            "[data-dynamic-title]"
        ).textContent =
            title;


        panel.querySelector(
            "[data-dynamic-content]"
        ).innerHTML =
            contentHtml;


        const actions =
            panel.querySelector(
                "[data-dynamic-actions]"
            );


        actions.innerHTML =
            "";


        buttons.forEach(
            buttonData => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.textContent =
                    buttonData.text;


                button.className =
                    buttonData.primary
                        ? "primary-btn"
                        : "secondary-btn";


                button.addEventListener(
                    "click",
                    () => {

                        if (
                            buttonData.close !==
                            false
                        ) {

                            panel.style.display =
                                "none";
                        }


                        if (
                            typeof buttonData.action ===
                            "function"
                        ) {

                            buttonData.action();
                        }
                    }
                );


                actions.appendChild(
                    button
                );
            }
        );


        state.pointer.down =
            false;


        state.keys.clear();


        cancelHoldInteraction();


        panel.style.display =
            "flex";
    }


    function closeDynamicPanel(
        id
    ) {

        const panel =
            $(
                id
            );


        if (
            panel
        ) {

            panel.style.display =
                "none";
        }
    }


    function dynamicPanelOpen(
        id
    ) {

        const panel =
            $(
                id
            );


        return Boolean(
            panel &&
            panel.style.display ===
                "flex"
        );
    }


    function openGateRequirementPanel(
        title,
        lines,
        onConfirm =
            null
    ) {

        const html =
            lines
                .map(
                    (
                        line,
                        index
                    ) => {

                        const material =
                            line.includes(
                                "/"
                            ) &&
                            (
                                line.includes(
                                    "Diamante"
                                ) ||
                                line.includes(
                                    "Rubi"
                                )
                            );


                        return `

                            <p
                                style="
                                    margin:0;
                                    ${
                                        material
                                            ? `
                                                padding:10px 12px;
                                                border-radius:10px;
                                                background:rgba(255,255,255,.045);
                                                font-family:Arial,sans-serif;
                                            `
                                            : ""
                                    }
                                "
                            >
                                ${line}
                            </p>
                        `;
                    }
                )
                .join(
                    ""
                );


        const buttons = [];


        if (
            onConfirm
        ) {

            buttons.push({

                text:
                    "NÃO",

                primary:
                    false
            });


            buttons.push({

                text:
                    "SIM",

                primary:
                    true,

                action:
                    onConfirm
            });
        }

        else {

            buttons.push({

                text:
                    "CONTINUAR",

                primary:
                    true
            });
        }


        showDynamicPanel(
            "gateRequirementPanelDynamic",
            title,
            html,
            buttons
        );
    }


    /* =====================================================
       STATUS
    ===================================================== */

    function openStatusPanel() {

        const player =
            state.player;


        if (
            !player
        ) {

            return;
        }


        const rows =
            Object.entries(
                STAT_CONFIG
            )
                .map(
                    (
                        [
                            key,
                            config
                        ]
                    ) => {

                        const current =
                            player.stats[
                                key
                            ];


                        const maxed =
                            current >=
                            config.cap;


                        return `

                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:1fr auto auto;
                                    align-items:center;
                                    gap:12px;
                                    padding:12px 14px;
                                    border-radius:12px;
                                    background:rgba(255,255,255,.04);
                                "
                            >

                                <div>

                                    <strong
                                        style="
                                            display:block;
                                            font-family:Arial,sans-serif;
                                            font-size:15px;
                                        "
                                    >
                                        ${config.icon}
                                        ${config.name}
                                    </strong>

                                    <small
                                        style="
                                            opacity:.65;
                                            font-family:Arial,sans-serif;
                                        "
                                    >
                                        ${config.description}
                                    </small>

                                </div>

                                <b>
                                    ${current}/${config.cap}
                                </b>

                                <button
                                    type="button"
                                    data-stat-add="${key}"
                                    class="primary-btn"
                                    ${maxed || player.statPoints <= 0 ? "disabled" : ""}
                                >
                                    +
                                </button>

                            </div>
                        `;
                    }
                )
                .join(
                    ""
                );


        const derived = `

            <div
                style="
                    display:grid;
                    grid-template-columns:repeat(2,minmax(0,1fr));
                    gap:9px;
                    margin-bottom:18px;
                    font-family:Arial,sans-serif;
                "
            >

                <div>
                    ❤️ HP:
                    <strong>${Math.round(player.maxHp)}</strong>
                </div>

                <div>
                    ⚔️ Dano:
                    <strong>${Math.round(player.damage)}</strong>
                </div>

                <div>
                    ⚡ Energia:
                    <strong>${Math.round(player.maxEnergy)}</strong>
                </div>

                <div>
                    🍖 Fome:
                    <strong>${Math.round(player.maxHunger)}</strong>
                </div>

                <div>
                    💤 Cansaço:
                    <strong>${Math.round(player.maxFatigue)}</strong>
                </div>

                <div>
                    ⭐ Nível:
                    <strong>${player.level}/${MAX_LEVEL}</strong>
                </div>

            </div>


            <div
                style="
                    padding:12px;
                    margin-bottom:16px;
                    border:1px solid rgba(241,200,111,.25);
                    border-radius:11px;
                    background:rgba(241,200,111,.05);
                "
            >
                Pontos disponíveis:
                <strong style="color:#f6d27c">
                    ${player.statPoints}
                </strong>
            </div>

            ${rows}
        `;


        showDynamicPanel(

            "statusPanelDynamic",

            "STATUS DO PERSONAGEM",

            derived,

            [
                {
                    text:
                        "FECHAR",

                    primary:
                        true
                }
            ]
        );


        const panel =
            $(
                "statusPanelDynamic"
            );


        panel
            .querySelectorAll(
                "[data-stat-add]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            addStatPoint(
                                button.dataset
                                    .statAdd
                            );
                        }
                    );
                }
            );
    }


    /* =====================================================
       FERREIRO
    ===================================================== */

    function getCurrentArmorTier() {

        let highest =
            0;


        for (
            const [
                id,
                amount
            ] of
            Object.entries(
                state.player
                    .inventory
            )
        ) {

            if (
                amount <=
                0
            ) {

                continue;
            }


            const item =
                ITEMS[
                    id
                ];


            if (
                item?.category ===
                "armor"
            ) {

                highest =
                    Math.max(
                        highest,
                        item.tier ||
                            0
                    );
            }
        }


        const equipped =
            ITEMS[
                state.player
                    .equipment
                    .armor
            ];


        if (
            equipped
        ) {

            highest =
                Math.max(
                    highest,
                    equipped.tier ||
                        0
                );
        }


        return highest;
    }


    function canCraftArmor(
        armorId
    ) {

        const recipe =
            ARMOR_UPGRADES[
                armorId
            ];


        if (
            !recipe
        ) {

            return {
                success:
                    false,

                reason:
                    "Receita inválida."
            };
        }


        if (
            !hasItem(
                recipe.previous
            ) &&
            state.player
                .equipment
                .armor !==
                recipe.previous
        ) {

            return {
                success:
                    false,

                reason:
                    `Você precisa de ${ITEMS[recipe.previous].name}.`
            };
        }


        if (
            state.player.money <
            recipe.money
        ) {

            return {
                success:
                    false,

                reason:
                    `Faltam ${recipe.money - state.player.money} moedas.`
            };
        }


        for (
            const [
                material,
                amount
            ] of
            Object.entries(
                recipe.materials
            )
        ) {

            if (
                !hasItem(
                    material,
                    amount
                )
            ) {

                return {
                    success:
                        false,

                    reason:
                        `Faltam ${amount - (state.player.inventory[material] || 0)} ${ITEMS[material].name}.`
                };
            }
        }


        return {
            success:
                true
        };
    }


    function craftArmor(
        armorId
    ) {

        const recipe =
            ARMOR_UPGRADES[
                armorId
            ];


        const check =
            canCraftArmor(
                armorId
            );


        if (
            !check.success
        ) {

            showToast(
                check.reason
            );

            return;
        }


        /*
            ARMADURA ANTERIOR É CONSUMIDA
            PARA VIRAR A PRÓXIMA.
        */

        if (
            state.player
                .equipment
                .armor ===
            recipe.previous
        ) {

            state.player
                .equipment
                .armor =
                null;
        }


        removeItem(
            recipe.previous,
            1
        );


        for (
            const [
                material,
                amount
            ] of
            Object.entries(
                recipe.materials
            )
        ) {

            removeItem(
                material,
                amount
            );
        }


        state.player.money -=
            recipe.money;


        addItem(
            armorId,
            1
        );


        state.player
            .equipment
            .armor =
            armorId;


        state.world
            .effects
            .push({

                type:
                    "forgeBurst",

                x:
                    state.player.x,

                y:
                    state.player.y,

                color:
                    "#ff9b52",

                life:
                    0.85,

                maxLife:
                    0.85
            });


        shakeScreen(
            4,
            0.10
        );


        showToast(
            `${ITEMS[armorId].name} criada e equipada!`
        );


        openForgePanel();


        saveGame(
            false
        );
    }


    function openForgePanel() {

        const currentTier =
            getCurrentArmorTier();


        let html = `

            <p style="margin:0 0 12px">
                Borin trabalha apenas com equipamentos avançados.
            </p>

            <p style="margin:0 0 20px;opacity:.7">
                A armadura anterior é usada como base para a próxima.
            </p>
        `;


        Object.entries(
            ARMOR_UPGRADES
        )
            .forEach(
                (
                    [
                        armorId,
                        recipe
                    ]
                ) => {

                    const armor =
                        ITEMS[
                            armorId
                        ];


                    const previous =
                        ITEMS[
                            recipe.previous
                        ];


                    const materials =
                        Object.entries(
                            recipe.materials
                        )
                            .map(
                                (
                                    [
                                        id,
                                        required
                                    ]
                                ) => {

                                    const current =
                                        state.player
                                            .inventory[
                                                id
                                            ] ||
                                        0;


                                    return (
                                        `${ITEMS[id].icon} ` +
                                        `${ITEMS[id].name}: ` +
                                        `${current}/${required}`
                                    );
                                }
                            )
                            .join(
                                "<br>"
                            );


                    const check =
                        canCraftArmor(
                            armorId
                        );


                    html += `

                        <div
                            style="
                                padding:15px;
                                border-radius:13px;
                                background:rgba(255,255,255,.045);
                                margin-bottom:10px;
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    gap:12px;
                                    margin-bottom:8px;
                                "
                            >

                                <strong>
                                    ${armor.icon}
                                    ${armor.name}
                                </strong>

                                <span>
                                    🛡️ ${armor.defense}
                                </span>

                            </div>

                            <small
                                style="
                                    display:block;
                                    opacity:.7;
                                    line-height:1.6;
                                    font-family:Arial,sans-serif;
                                "
                            >
                                Base:
                                ${previous.icon}
                                ${previous.name}

                                <br>

                                ${materials}

                                <br>

                                🪙 ${recipe.money}
                            </small>

                            <button
                                type="button"
                                class="primary-btn"
                                data-forge-armor="${armorId}"
                                style="margin-top:12px"
                                ${check.success ? "" : "disabled"}
                            >
                                ${
                                    hasItem(
                                        armorId
                                    ) ||
                                    state.player
                                        .equipment
                                        .armor ===
                                        armorId

                                        ? "CRIAR OUTRA"

                                        : "CRIAR"
                                }
                            </button>

                            ${
                                check.success
                                    ? ""
                                    : `
                                        <small
                                            style="
                                                display:block;
                                                margin-top:7px;
                                                opacity:.55;
                                            "
                                        >
                                            ${check.reason}
                                        </small>
                                    `
                            }

                        </div>
                    `;
                }
            );


        if (
            currentTier >=
            8
        ) {

            html += `

                <div
                    style="
                        margin-top:16px;
                        padding:14px;
                        text-align:center;
                        border-radius:12px;
                        background:rgba(226,93,100,.08);
                        border:1px solid rgba(226,93,100,.2);
                    "
                >
                    ♦️ VOCÊ ATINGIU O NÍVEL MÁXIMO DE ARMADURA.
                </div>
            `;
        }


        showDynamicPanel(

            "forgePanelDynamic",

            "⚒️ FORJA DE BORIN",

            html,

            [
                {
                    text:
                        "FECHAR",

                    primary:
                        true
                }
            ]
        );


        $(
            "forgePanelDynamic"
        )
            .querySelectorAll(
                "[data-forge-armor]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            craftArmor(
                                button.dataset
                                    .forgeArmor
                            );
                        }
                    );
                }
            );
    }


    /* =====================================================
       DIÁLOGO
    ===================================================== */

    function startDialogue(
        npc
    ) {

        state.pointer.down =
            false;


        state.dialogue = {

            npc,

            lines:
                Array.isArray(
                    npc.lines
                )
                    ? npc.lines.slice()
                    : [
                        "..."
                    ],

            index:
                0,

            typing:
                false,

            timer:
                null
        };


        must(
            "dialogueBox"
        ).classList.remove(
            "hidden"
        );


        typeDialogue();
    }


    function startNarration(
        lines
    ) {

        startDialogue({

            name:
                "VEYRA",

            lines:
                Array.isArray(
                    lines
                )
                    ? lines
                    : [
                        lines
                    ]
        });
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
            dialogue.lines[
                dialogue.index
            ] ||
            "...";


        let index =
            0;


        dialogue.typing =
            true;


        must(
            "dialogueSpeaker"
        ).textContent =
            dialogue.npc
                .name;


        must(
            "dialogueText"
        ).textContent =
            "";


        dialogue.timer =
            setInterval(
                () => {

                    index++;


                    must(
                        "dialogueText"
                    ).textContent =
                        line.slice(
                            0,
                            index
                        );


                    if (
                        index >=
                        line.length
                    ) {

                        clearInterval(
                            dialogue.timer
                        );


                        dialogue.typing =
                            false;
                    }
                },
                15
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


        must(
            "dialogueBox"
        ).classList.add(
            "hidden"
        );
    }


    /* =====================================================
       INTERAÇÃO
    ===================================================== */

    function getInteraction() {

        if (
            !state.player
        ) {

            return null;
        }


        /* =================================================
           INTERIOR
        ================================================= */

        if (
            state.houseMode
        ) {

            let best =
                null;


            let bestDistance =
                Infinity;


            const sleepTarget =
                getSleepTarget();


            if (
                sleepTarget
            ) {

                const d =
                    distance(
                        state.player,
                        sleepTarget
                    );


                if (
                    d <=
                    78
                ) {

                    best = {

                        type:
                            "sleep",

                        object:
                            sleepTarget
                    };


                    bestDistance =
                        d;
                }
            }


            for (
                const npc of
                getInteriorNPCs()
            ) {

                const d =
                    distance(
                        state.player,
                        npc
                    );


                if (
                    d <=
                        82 &&
                    d <
                        bestDistance
                ) {

                    best = {

                        type:
                            npc.blacksmith
                                ? "blacksmith"
                                : "npc",

                        object:
                            npc
                    };


                    bestDistance =
                        d;
                }
            }


            const room =
                getHouseRoom();


            const door = {

                x:
                    room.x +
                    room.w /
                        2,

                y:
                    room.y +
                    room.h -
                        24
            };


            const doorDistance =
                distance(
                    state.player,
                    door
                );


            if (
                doorDistance <=
                    75 &&
                doorDistance <
                    bestDistance
            ) {

                best = {

                    type:
                        "exitHouse",

                    object:
                        state.currentHouse
                };
            }


            return best;
        }


        /* =================================================
           EXTERIOR
        ================================================= */

        let best =
            null;


        let bestDistance =
            Infinity;


        const test = (
            type,
            object,
            limit
        ) => {

            const d =
                distance(
                    state.player,
                    object
                );


            if (
                d <=
                    limit &&
                d <
                    bestDistance
            ) {

                best = {

                    type,
                    object
                };


                bestDistance =
                    d;
            }
        };


        state.world.npcs
            .forEach(
                npc =>
                    test(
                        "npc",
                        npc,
                        74
                    )
            );


        state.world.trees
            .filter(
                tree =>
                    tree.alive
            )
            .forEach(
                tree =>
                    test(
                        "tree",
                        tree,
                        80
                    )
            );


        state.world.resources
            .filter(
                resource =>
                    resource.alive
            )
            .forEach(
                resource =>
                    test(
                        "resource",
                        resource,
                        78
                    )
            );


        state.world.foods
            .filter(
                food =>
                    food.alive
            )
            .forEach(
                food =>
                    test(
                        "food",
                        food,
                        72
                    )
            );


        state.world.drops
            .filter(
                drop =>
                    !drop.collected
            )
            .forEach(
                drop =>
                    test(
                        "drop",
                        drop,
                        82
                    )
            );


        state.world.secrets
            .filter(
                secret =>
                    !secret.found
            )
            .forEach(
                secret =>
                    test(
                        "secret",
                        secret,
                        78
                    )
            );


        state.world.trials
            .forEach(
                trial =>
                    test(
                        trial.dashAltar
                            ? "dashAltar"
                            : "trial",
                        trial,
                        95
                    )
            );


        /*
            PORTÕES.
        */

        for (
            const gate of
            state.world.gates
        ) {

            const center = {

                x:
                    gate.x +
                    gate.w /
                        2,

                y:
                    gate.y +
                    gate.h /
                        2
            };


            test(
                "gate",
                {
                    ...gate,
                    ...center
                },
                115
            );
        }


        /*
            BOSSES.
        */

        state.world.enemies
            .filter(
                enemy =>
                    !enemy.dead &&
                    enemy.type ===
                        "progression"
            )
            .forEach(
                enemy =>
                    test(
                        "boss",
                        enemy,
                        120
                    )
            );


        /*
            CASAS.
        */

        for (
            const building of
            state.world.buildings
        ) {

            const door = {

                x:
                    building.x +
                    building.w /
                        2,

                y:
                    building.y +
                    building.h +
                        20
            };


            const d =
                distance(
                    state.player,
                    door
                );


            if (
                d <=
                    90 &&
                d <
                    bestDistance
            ) {

                best = {

                    type:
                        "house",

                    object:
                        building
                };


                bestDistance =
                    d;
            }
        }


        return best;
    }


    function playerAction() {

        if (
            !state.player ||
            state.paused
        ) {

            return;
        }


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
            }


            else if (
                npc.questId
            ) {

                openQuest(
                    npc
                );
            }


            else {

                startDialogue(
                    npc
                );
            }


            return;
        }


        if (
            interaction.type ===
            "blacksmith"
        ) {

            openForgePanel();

            return;
        }


        if (
            interaction.type ===
                "tree" ||
            interaction.type ===
                "resource"
        ) {

            beginHoldInteraction(
                interaction
            );

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

            eatWorldFood(
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
            "dashAltar"
        ) {

            interactDashAltar();

            return;
        }


        if (
            interaction.type ===
            "trial"
        ) {

            startSkyTrial();

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
            "sleep"
        ) {

            sleepAtHome();

            return;
        }


        if (
            interaction.type ===
            "boss"
        ) {

            if (
                !interaction
                    .object
                    .accepted
            ) {

                openBattle(
                    interaction.object
                );
            }


            return;
        }


        if (
            interaction.type ===
            "exitHouse"
        ) {

            exitHouse();
        }
    }


    /* =====================================================
       CASAS
    ===================================================== */

    function enterNearestHouse() {

        let nearest =
            null;


        let nearestDistance =
            Infinity;


        for (
            const building of
            state.world.buildings
        ) {

            const door = {

                x:
                    building.x +
                    building.w /
                        2,

                y:
                    building.y +
                    building.h +
                        20
            };


            const d =
                distance(
                    state.player,
                    door
                );


            if (
                d <
                    92 &&
                d <
                    nearestDistance
            ) {

                nearest =
                    building;


                nearestDistance =
                    d;
            }
        }


        if (
            !nearest
        ) {

            showToast(
                "Aproxime-se da porta."
            );

            return;
        }


        state.paused =
            true;


        state.keys.clear();


        state.pointer.down =
            false;


        must(
            "transitionMessage"
        ).textContent =
            nearest.name;


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                state.houseReturn = {

                    x:
                        nearest.x +
                        nearest.w /
                            2,

                    y:
                        nearest.y +
                        nearest.h +
                            58
                };


                state.currentHouse =
                    nearest;


                state.houseMode =
                    true;


                placePlayerInsideHouse();


                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                state.paused =
                    false;


                if (
                    nearest.id ===
                    "home"
                ) {

                    showToast(
                        "Aproxime-se da cama e pressione E para dormir."
                    );
                }
            },
            360
        );
    }


    function exitHouse() {

        if (
            !state.houseMode
        ) {

            return;
        }


        const returnPoint =
            state.houseReturn ||
            {
                x:
                    480,

                y:
                    610
            };


        state.paused =
            true;


        state.keys.clear();


        state.pointer.down =
            false;


        must(
            "transitionMessage"
        ).textContent =
            "VILA DO CREPÚSCULO";


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
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


                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                state.paused =
                    false;


                updateCamera();
            },
            340
        );
    }


    function sleepAtHome() {

        if (
            !state.houseMode ||
            state.currentHouse
                ?.id !==
                "home"
        ) {

            showToast(
                "Você só pode dormir na própria cama."
            );

            return;
        }


        state.paused =
            true;


        state.keys.clear();


        state.pointer.down =
            false;


        must(
            "transitionMessage"
        ).textContent =
            "VOCÊ DESCANSA...";


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                state.player.fatigue =
                    state.player
                        .maxFatigue;


                state.player.energy =
                    state.player
                        .maxEnergy;


                state.player.magic =
                    state.player
                        .maxMagic;


                state.player.hp =
                    Math.min(

                        state.player
                            .maxHp,

                        state.player.hp +
                        Math.round(
                            state.player
                                .maxHp *
                                0.32
                        )
                    );


                state.player.hunger =
                    Math.max(
                        0,
                        state.player.hunger -
                            10
                    );


                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                state.paused =
                    false;


                showToast(
                    "Você descansou."
                );


                saveGame(
                    false
                );
            },
            950
        );
    }


    /* =====================================================
       QUESTS
    ===================================================== */

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


        const isWood =
            npc.questId ===
            "wood";


        const itemId =
            isWood
                ? "madeira"
                : "carvao";


        const current =
            state.player
                .inventory[
                    itemId
                ] ||
            0;


        must(
            "questTitle"
        ).textContent =
            isWood
                ? "Madeira para a Vila"
                : "Carvão para a Forja";


        must(
            "questText"
        ).textContent =

            isWood

                ? "Bran precisa de 10 madeiras para reforçar as construções da vila."

                : "Borin precisa de 8 carvões para manter a forja funcionando.";


        must(
            "questStatus"
        ).textContent =
            `Progresso: ${Math.min(current, quest.need)} / ${quest.need}`;


        const button =
            must(
                "questActionBtn"
            );


        button.disabled =
            quest.state ===
            "completed";


        button.textContent =

            quest.state ===
            "none"

                ? "ACEITAR"

                : quest.state ===
                  "accepted"

                ? "ENTREGAR"

                : "CONCLUÍDA";


        must(
            "questPanel"
        ).classList.remove(
            "hidden"
        );
    }


    function executeQuestAction() {

        const npc =
            state.questNPC;


        if (
            !npc
        ) {

            return;
        }


        const quest =
            state.player
                .quest[
                    npc.questId
                ];


        const itemId =
            npc.questId ===
            "wood"
                ? "madeira"
                : "carvao";


        if (
            quest.state ===
            "none"
        ) {

            quest.state =
                "accepted";


            showToast(
                "Missão aceita."
            );


            openQuest(
                npc
            );


            saveGame(
                false
            );


            return;
        }


        if (
            quest.state ===
            "accepted"
        ) {

            if (
                !hasItem(
                    itemId,
                    quest.need
                )
            ) {

                showToast(
                    "Você ainda não tem todos os materiais."
                );

                return;
            }


            removeItem(
                itemId,
                quest.need
            );


            quest.state =
                "completed";


            state.player.xp +=
                quest.rewardXP;


            state.player.money +=
                quest.rewardMoney;


            checkLevelUp();


            showToast(
                "Missão concluída!"
            );


            saveGame(
                false
            );


            openQuest(
                npc
            );
        }
    }


    /* =====================================================
       BATALHAS
    ===================================================== */

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


        state.pointer.down =
            false;


        state.keys.clear();


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
            enemy.icon;


        must(
            "battleTitle"
        ).textContent =
            enemy.name;


        must(
            "battleText"
        ).textContent =

            enemy.bossDash

                ? "Este Guardião possui investidas extremamente perigosas. Observe o aviso e use sua mobilidade para escapar."

                : "Observe o chão. Círculos vermelhos indicam onde os ataques atingirão.";


        must(
            "battlePanel"
        ).classList.remove(
            "hidden"
        );


        saveGame(
            false
        );
    }


    function acceptBattle() {

        if (
            !state.battle
        ) {

            return;
        }


        state.battle.accepted =
            true;


        state.battle.aggressive =
            true;


        state.battle.state =
            "chasing";


        state.battle.specialTimer =
            0.8;


        state.bossBarTarget =
            state.battle;


        state.battle =
            null;


        state.paused =
            false;


        must(
            "battlePanel"
        ).classList.add(
            "hidden"
        );


        showToast(
            "A batalha começou."
        );
    }


    function declineBattle() {

        state.battle =
            null;


        state.paused =
            false;


        must(
            "battlePanel"
        ).classList.add(
            "hidden"
        );
    }


    /* =====================================================
       HORDAS DO CÉU
    ===================================================== */

    function startSkyTrial() {

        if (
            state.area !==
            "sky"
        ) {

            return;
        }


        const trial =
            state.player
                .skyTrial;


        if (
            trial.complete
        ) {

            showToast(
                "As cinco hordas já foram concluídas."
            );

            return;
        }


        if (
            trial.activeWave >
            0
        ) {

            showToast(
                "Derrote a horda atual."
            );

            return;
        }


        trial.started =
            true;


        spawnSkyWave(
            trial.wave +
                1
        );
    }


    function spawnSkyWave(
        wave
    ) {

        if (
            wave <
                1 ||
            wave >
                5
        ) {

            return;
        }


        const trial =
            state.player
                .skyTrial;


        trial.activeWave =
            wave;


        const amount =
            3 +
            wave *
                2;


        const centerX =
            1710;


        const centerY =
            1100;


        for (
            let i = 0;
            i <
            amount;
            i++
        ) {

            const angle =
                Math.PI *
                2 *
                i /
                amount;


            const radius =
                260 +
                random(
                    -30,
                    55
                );


            addEnemy({

                id:
                    `horde_${wave}_${Date.now()}_${i}`,

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

                name:
                    wave >=
                    4
                        ? "SENTINELA CELESTE"
                        : "SERAFIM DA HORDA",

                icon:
                    wave >=
                    4
                        ? "⚔️"
                        : "🪽",

                type:
                    "normal",

                horde:
                    wave,

                hp:
                    150 +
                    wave *
                        70,

                damage:
                    16 +
                    wave *
                        6,

                speed:
                    80 +
                    wave *
                        5,

                vision:
                    680,

                attackRange:
                    78,

                radius:
                    25,

                color:
                    "#d3dce2",

                drop:
                    wave ===
                    5
                        ? "cristal"
                        : null,

                dropChance:
                    0.55,

                special:
                    wave >=
                    5
                        ? "crystalRain"

                        : wave >=
                          3
                        ? "crystalShot"

                        : null
            });
        }


        showToast(
            `HORDA ${wave}/5!`
        );
    }


    function updateSkyTrial() {

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
            state.player
                .skyTrial;


        if (
            trial.activeWave >
            0
        ) {

            const living =
                state.world
                    .enemies
                    .some(
                        enemy =>
                            enemy.horde ===
                                trial.activeWave &&
                            !enemy.dead
                    );


            if (
                living
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


                showToast(
                    "Cinco hordas derrotadas! O Guardião do Caminho apareceu."
                );


                spawnPathGuardian();


                saveGame(
                    false
                );


                return;
            }


            state.hordeNextAt =
                performance.now() +
                1800;
        }


        if (
            trial.activeWave ===
                0 &&
            trial.wave <
                5 &&
            state.hordeNextAt >
                0 &&
            performance.now() >=
                state.hordeNextAt
        ) {

            state.hordeNextAt =
                0;


            spawnSkyWave(
                trial.wave +
                    1
            );
        }
    }


    function spawnPathGuardian() {

        if (
            state.world
                .enemies
                .some(
                    enemy =>
                        enemy.id ===
                            "path_guardian" &&
                        !enemy.dead
                ) ||
            hasDefeatedBoss(
                "path_guardian"
            )
        ) {

            return;
        }


        addEnemy({

            id:
                "path_guardian",

            x:
                2860,

            y:
                1100,

            name:
                "GUARDIÃO DO CAMINHO",

            icon:
                "🪽",

            type:
                "progression",

            hp:
                1500,

            damage:
                57,

            speed:
                74,

            vision:
                450,

            attackRange:
                110,

            radius:
                44,

            color:
                "#d1b66f",

            drop:
                null,

            unlock:
                null,

            special:
                "crystalRain",

            bossDash:
                true,

            bossDashDamage:
                1.75
        });
    }


    /* =====================================================
       FLAUTA

       CONTINUA EXISTINDO.
    ===================================================== */

    function useMemoryFlute() {

        if (
            (
                state.player
                    .inventory
                    .flautaMemoria ||
                0
            ) <=
            0
        ) {

            showToast(
                "Você ainda não possui a Flauta da Memória."
            );

            return;
        }


        if (
            state.player
                .flutePlayed
        ) {

            showToast(
                "A Flauta já revelou aquilo que podia ser lembrado."
            );

            return;
        }


        state.player.flutePlayed =
            true;


        state.paused =
            true;


        must(
            "transitionMessage"
        ).textContent =
            "A MÚSICA FAZ VEYRA SE LEMBRAR...";


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                state.paused =
                    false;


                showToast(
                    "Alguma coisa distante respondeu à melodia."
                );


                saveGame(
                    false
                );
            },
            1250
        );
    }


    /* =====================================================
       PORTAIS
    ===================================================== */

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
            state.world.portals
        ) {

            if (
                typeof portal.visible ===
                    "function" &&
                !portal.visible()
            ) {

                continue;
            }


            const inside =

                state.player.x >=
                    portal.x &&

                state.player.x <=
                    portal.x +
                        portal.w &&

                state.player.y >=
                    portal.y &&

                state.player.y <=
                    portal.y +
                        portal.h;


            if (
                !inside
            ) {

                continue;
            }


            const allowed =

                typeof portal.requirement ===
                "function"

                    ? portal.requirement()

                    : true;


            if (
                !allowed
            ) {

                showToast(
                    "O caminho ainda está bloqueado."
                );


                state.player.x -=
                    portal.direction ===
                    "back"
                        ? -45
                        : 45;


                state.portalCooldown =
                    1.2;


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

        state.travel =
            portal;


        state.paused =
            true;


        state.pointer.down =
            false;


        state.keys.clear();


        must(
            "travelText"
        ).textContent =

            portal.returnPortal

                ? `Voltar para ${REGIONS[portal.target].name}?`

                : `Seguir para ${portal.title}?`;


        must(
            "travelPanel"
        ).classList.remove(
            "hidden"
        );
    }


    function confirmTravel() {

        if (
            !state.travel
        ) {

            return;
        }


        const portal =
            state.travel;


        state.travel =
            null;


        must(
            "travelPanel"
        ).classList.add(
            "hidden"
        );


        transitionTo(
            portal.target,
            portal
        );
    }


    function cancelTravel() {

        const portal =
            state.travel;


        state.travel =
            null;


        state.paused =
            false;


        state.portalCooldown =
            1.2;


        must(
            "travelPanel"
        ).classList.add(
            "hidden"
        );


        if (
            portal
        ) {

            if (
                portal.direction ===
                "back"
            ) {

                state.player.x =
                    portal.x +
                    portal.w +
                    55;
            }

            else {

                state.player.x =
                    portal.x -
                    55;
            }
        }
    }


    function transitionTo(
        target,
        portal =
            {}
    ) {

        if (
            !REGIONS[
                target
            ]
        ) {

            return;
        }


        const sourceArea =
            state.area;


        state.paused =
            true;


        state.pointer.down =
            false;


        state.keys.clear();


        cancelHoldInteraction();


        closeDynamicPanel(
            "gateRequirementPanelDynamic"
        );


        must(
            "transitionMessage"
        ).textContent =
            REGIONS[
                target
            ].name;


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                state.area =
                    target;


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


                buildWorld();


                /* =================================================
                   LABIRINTO:
                   NASCE NA ENTRADA CORRETA.
                ================================================= */

                if (
                    target ===
                    "monarchMaze" &&
                    state.world.maze
                ) {

                    const maze =
                        state.world.maze;


                    state.player.x =
                        maze.originX +
                        45;


                    state.player.y =
                        maze.originY +
                        maze.start.y *
                            maze.cellSize +
                        maze.cellSize /
                            2;
                }


                /*
                    VOLTANDO PARA A VILA:
                    POSICIONA NO PORTÃO CORRETO.
                */

                else if (
                    target ===
                    "village"
                ) {

                    if (
                        sourceArea ===
                        "shadow"
                    ) {

                        state.player.x =
                            1600;


                        state.player.y =
                            245;
                    }


                    else if (
                        sourceArea ===
                        "sky"
                    ) {

                        state.player.x =
                            260;


                        state.player.y =
                            1100;
                    }


                    else if (
                        sourceArea ===
                        "hell"
                    ) {

                        state.player.x =
                            1600;


                        state.player.y =
                            1920;
                    }


                    else {

                        state.player.x =
                            2850;


                        state.player.y =
                            1100;
                    }
                }


                else if (
                    portal.gateSide ===
                    "north"
                ) {

                    state.player.x =
                        180;


                    state.player.y =
                        state.world.height /
                            2;
                }


                else if (
                    portal.direction ===
                    "back"
                ) {

                    state.player.x =
                        state.world.width -
                        180;


                    state.player.y =
                        state.world.height /
                            2;
                }


                else {

                    state.player.x =
                        180;


                    state.player.y =
                        state.world.height /
                            2;
                }


                /*
                    GARANTE POSIÇÃO VÁLIDA.
                */

                let safety =
                    0;


                while (
                    !canPlayerMoveTo(

                        state.player.x,
                        state.player.y,

                        state.player.radius
                    ) &&
                    safety++ <
                        40
                ) {

                    state.player.y +=
                        22;
                }


                state.player.checkpoint = {

                    area:
                        target,

                    x:
                        state.player.x,

                    y:
                        state.player.y
                };


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


                state.player.magic =
                    Math.min(

                        state.player.maxMagic,

                        state.player.magic +
                        state.player.maxMagic *
                            0.20
                    );


                state.player.energy =
                    Math.min(

                        state.player.maxEnergy,

                        state.player.energy +
                        state.player.maxEnergy *
                            0.25
                    );


                state.portalCooldown =
                    1.5;


                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                state.paused =
                    false;


                updateCamera();


                saveGame(
                    false
                );


                if (
                    target ===
                    "monarchMaze"
                ) {

                    if (
                        hasItem(
                            "lanterna"
                        )
                    ) {

                        showToast(
                            "A lanterna acendeu automaticamente."
                        );
                    }

                    else {

                        showToast(
                            "Você não consegue enxergar quase nada..."
                        );
                    }
                }

                else {

                    showToast(
                        `Você chegou a ${REGIONS[target].name}.`
                    );
                }
            },
            650
        );
    }


    /* =====================================================
       LOJA
    ===================================================== */

    function openShop(
        npc
    ) {

        state.shopNPC =
            npc;


        state.shopMode =
            "buy";


        document
            .querySelectorAll(
                "#shopTabs .tab"
            )
            .forEach(
                tab =>
                    tab.classList.toggle(
                        "active",
                        tab.dataset.shop ===
                        "buy"
                    )
            );


        must(
            "shopTitle"
        ).textContent =
            `LOJA DE ${npc.name}`;


        renderShop();


        must(
            "shopPanel"
        ).classList.remove(
            "hidden"
        );
    }


    function createShopRow(
        item,
        text,
        callback
    ) {

        const row =
            document.createElement(
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
                    ${
                        item.category ===
                        "armor"

                            ? `Defesa +${item.defense}`

                            : `Valor base ${item.value}`
                    }
                </small>

            </div>

            <div class="shop-price">
                ${text}
            </div>

            <button
                type="button"
                class="primary-btn"
            >
                OK
            </button>
        `;


        row
            .querySelector(
                "button"
            )
            .addEventListener(
                "click",
                callback
            );


        return row;
    }


    function renderShop() {

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

            const products = [

                "pao",
                "carneCaca",
                "pocao",
                "elixir",

                "lanterna",

                "armaduraFolha",
                "armaduraAlgodao",
                "armaduraMadeira",
                "armaduraCouro",

                "espadaFerro"
            ];


            products
                .forEach(
                    id => {

                        const item =
                            ITEMS[
                                id
                            ];


                        const alreadyUnique =
                            item.unique &&
                            hasItem(
                                id
                            );


                        const row =
                            createShopRow(

                                item,

                                alreadyUnique
                                    ? "COMPRADO"
                                    : `Comprar • ${item.value} 🪙`,

                                () => {

                                    if (
                                        alreadyUnique
                                    ) {

                                        showToast(
                                            "Você já possui este item."
                                        );

                                        return;
                                    }


                                    if (
                                        state.player.money <
                                        item.value
                                    ) {

                                        showToast(
                                            "Moedas insuficientes."
                                        );

                                        return;
                                    }


                                    state.player.money -=
                                        item.value;


                                    addItem(
                                        id,
                                        1
                                    );


                                    showToast(
                                        `${item.name} comprado.`
                                    );


                                    renderShop();


                                    updateHUD();


                                    saveGame(
                                        false
                                    );
                                }
                            );


                        if (
                            alreadyUnique
                        ) {

                            row
                                .querySelector(
                                    "button"
                                )
                                .disabled =
                                true;
                        }


                        grid.appendChild(
                            row
                        );
                    }
                );


            /*
                AVISO DO LIMITE DAS ARMADURAS DA LOJA.
            */

            const notice =
                document.createElement(
                    "div"
                );


            notice.className =
                "sell-all-row";


            notice.innerHTML = `

                <div
                    style="
                        width:100%;
                        padding:12px;
                        text-align:center;
                        opacity:.75;
                    "
                >
                    Armadura de Couro é o equipamento máximo vendido por Doran.
                    <br>
                    Para Ferro, Ouro, Diamante e Rubi, procure Borin.
                </div>
            `;


            grid.appendChild(
                notice
            );


            return;
        }


        const data =
            getSellAllData();


        const sellAll =
            document.createElement(
                "div"
            );


        sellAll.className =
            "sell-all-row";


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "primary-btn sell-all-btn";


        button.disabled =
            data.value <=
            0;


        button.textContent =

            data.value >
            0

                ? `VENDER TUDO • ${data.value} MOEDAS`

                : "NADA PARA VENDER";


        button.addEventListener(
            "click",
            sellAllItems
        );


        sellAll.appendChild(
            button
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
                        item.unique ||
                        item.quest ||
                        item.permanent ||
                        id ===
                            state.player
                                .equipment
                                .weapon ||
                        id ===
                            state.player
                                .equipment
                                .armor ||
                        id ===
                            state.player
                                .equipment
                                .tool
                    ) {

                        return;
                    }


                    const price =
                        Math.max(
                            1,
                            Math.floor(
                                item.value *
                                    0.70
                            )
                        );


                    grid.appendChild(

                        createShopRow(

                            item,

                            `Vender por ${price} • x${amount}`,

                            () => {

                                if (
                                    !removeItem(
                                        id,
                                        1
                                    )
                                ) {

                                    return;
                                }


                                state.player.money +=
                                    price;


                                renderShop();


                                updateHUD();


                                saveGame(
                                    false
                                );
                            }
                        )
                    );
                }
            );
    }


    /*
        VENDER TUDO NÃO VENDE:
        - EQUIPADOS
        - QUEST
        - UNIQUE
        - LANTERNA
        - FLAUTA
        - FRAGMENTOS
        - RUBI
        - DIAMANTE

        Protege os materiais importantes
        da progressão nova.
    */

    function isProtectedBulkSaleItem(
        id,
        item
    ) {

        if (
            item.unique ||
            item.quest ||
            item.permanent
        ) {

            return true;
        }


        if (
            [
                "flautaMemoria",
                "fragmentoMemoria",
                "lanterna",
                "rubi",
                "diamante"
            ].includes(
                id
            )
        ) {

            return true;
        }


        if (
            id ===
                state.player
                    .equipment
                    .weapon ||
            id ===
                state.player
                    .equipment
                    .armor ||
            id ===
                state.player
                    .equipment
                    .tool
        ) {

            return true;
        }


        return false;
    }


    function getSellAllData() {

        let value =
            0;


        let amount =
            0;


        const items =
            [];


        Object.entries(
            state.player
                .inventory
        )
            .forEach(
                (
                    [
                        id,
                        count
                    ]
                ) => {

                    const item =
                        ITEMS[
                            id
                        ];


                    if (
                        !item ||
                        count <=
                            0 ||
                        isProtectedBulkSaleItem(
                            id,
                            item
                        )
                    ) {

                        return;
                    }


                    if (
                        item.category !==
                        "materials"
                    ) {

                        return;
                    }


                    const price =
                        Math.max(
                            1,
                            Math.floor(
                                item.value *
                                    0.70
                            )
                        );


                    value +=
                        price *
                        count;


                    amount +=
                        count;


                    items.push({
                        id,
                        count
                    });
                }
            );


        return {
            value,
            amount,
            items
        };
    }


    function sellAllItems() {

        const data =
            getSellAllData();


        if (
            !data.items.length
        ) {

            showToast(
                "Nada seguro para vender."
            );

            return;
        }


        for (
            const entry of
            data.items
        ) {

            state.player
                .inventory[
                    entry.id
                ] =
                Math.max(

                    0,

                    state.player
                        .inventory[
                            entry.id
                        ] -
                        entry.count
                );
        }


        state.player.money +=
            data.value;


        showToast(
            `${data.amount} itens vendidos por ${data.value} moedas.`
        );


        renderShop();


        updateHUD();


        saveGame(
            false
        );
    }


    /* =====================================================
       INVENTÁRIO VISUAL
    ===================================================== */

    function updateInventory() {

        if (
            !state.player
        ) {

            return;
        }


        const grid =
            must(
                "inventoryGrid"
            );


        grid.innerHTML =
            "";


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
                        !item
                    ) {

                        return;
                    }


                    if (
                        state
                            .inventoryCategory !==
                            "all" &&
                        item.category !==
                            state
                                .inventoryCategory
                    ) {

                        return;
                    }


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "inventory-item";


                    button.innerHTML = `

                        <span class="icon">
                            ${item.icon}
                        </span>

                        <span class="name">
                            ${item.name}
                        </span>

                        <span class="count">
                            x${amount}
                        </span>
                    `;


                    button.addEventListener(
                        "click",
                        () =>
                            useItem(
                                id
                            )
                    );


                    grid.appendChild(
                        button
                    );
                }
            );


        if (
            !grid.children.length
        ) {

            const empty =
                document.createElement(
                    "p"
                );


            empty.className =
                "muted";


            empty.textContent =
                "Nenhum item nesta categoria.";


            grid.appendChild(
                empty
            );
        }


        let weight =
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

                    weight +=
                        (
                            ITEMS[
                                id
                            ]?.weight ||
                            0
                        ) *
                        amount;
                }
            );


        must(
            "weightText"
        ).textContent =
            `${weight}/100`;


        updateEquipment();
    }


    function updateEquipment() {

        const grid =
            must(
                "equipmentGrid"
            );


        const weapon =
            ITEMS[
                state.player
                    .equipment
                    .weapon
            ]?.name ||
            "Nenhuma";


        const armor =
            ITEMS[
                state.player
                    .equipment
                    .armor
            ]?.name ||
            "Nenhuma";


        const armorDefense =
            ITEMS[
                state.player
                    .equipment
                    .armor
            ]?.defense ||
            0;


        const tool =
            ITEMS[
                state.player
                    .equipment
                    .tool
            ]?.name ||
            "Nenhuma";


        grid.innerHTML = `

            <div class="equipment-slot">

                Arma

                <strong>
                    ${weapon}
                </strong>

            </div>


            <div class="equipment-slot">

                Armadura

                <strong>
                    ${armor}
                </strong>

                ${
                    armorDefense
                        ? `<small>Defesa +${armorDefense}</small>`
                        : ""
                }

            </div>


            <div class="equipment-slot">

                Ferramenta

                <strong>
                    ${tool}
                </strong>

            </div>
        `;
    }


    /* =====================================================
       BOOK
    ===================================================== */

    function renderBook() {

        const container =
            must(
                "bossBook"
            );


        container.innerHTML =
            "";


        for (
            const boss of
            BOSS_REGISTRY
        ) {

            const defeated =

                state.player
                    .defeatedBosses
                    .includes(
                        boss.id
                    ) ||

                (
                    boss.id ===
                        "monarch" &&
                    state.player
                        .monarchDefeated
                ) ||

                (
                    boss.id ===
                        "other_self" &&
                    state.player
                        .finalDefeated
                );


            const discovered =

                defeated ||

                state.player
                    .discoveredBosses
                    .includes(
                        boss.id
                    ) ||

                (
                    boss.id ===
                        "monarch" &&
                    state.player
                        .monarchAwakened
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "boss-entry";


            card.innerHTML =

                discovered

                    ? `

                        <div class="symbol">
                            ${boss.icon}
                        </div>

                        <strong>
                            ${boss.name}
                        </strong>

                        <p>
                            ${
                                defeated
                                    ? "✓ DERROTADO"
                                    : "DESCOBERTO"
                            }
                        </p>

                        <p class="boss-lore">
                            ${boss.description}
                        </p>

                        <p class="boss-quote">
                            “${boss.quote}”
                        </p>
                    `

                    : `

                        <div class="symbol">
                            ?
                        </div>

                        <strong>
                            DESCONHECIDO
                        </strong>

                        <p>
                            Encontre este Guardião para revelar o registro.
                        </p>
                    `;


            container.appendChild(
                card
            );
        }
    }


    /* =====================================================
       ESCOLHA FINAL
    ===================================================== */

    function openFinalChoice() {

        if (
            state.finalChoiceShown
        ) {

            return;
        }


        state.finalChoiceShown =
            true;


        state.paused =
            true;


        const accepted =
            window.confirm(

                "O Outro Eu oferece a Quietude Absoluta.\n\nOK = aceitar.\nCancelar = rejeitar e lutar."
            );


        state.player.finalChoice =
            accepted
                ? "join"
                : "fight";


        state.paused =
            false;


        if (
            accepted
        ) {

            showEnding(
                "Você aceitou a Quietude Absoluta. Veyra finalmente ficou em silêncio."
            );


            return;
        }


        const boss =
            state.world
                .enemies
                .find(
                    enemy =>
                        enemy.id ===
                        "other_self"
                );


        if (
            boss
        ) {

            boss.accepted =
                true;


            boss.aggressive =
                true;


            boss.specialTimer =
                0.8;


            state.bossBarTarget =
                boss;
        }


        showToast(
            "A batalha final começou."
        );
    }


    function showEnding(
        message
    ) {

        state.running =
            false;


        state.paused =
            true;


        saveGame(
            false
        );


        must(
            "transitionMessage"
        ).textContent =
            message;


        must(
            "transitionScreen"
        ).classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                must(
                    "transitionScreen"
                ).classList.add(
                    "hidden"
                );


                showScreen(
                    "menu"
                );


                updateContinueButton();
            },
            2800
        );
    }


    /* =====================================================
       PARTÍCULAS
    ===================================================== */

    function spawnParticles(
        x,
        y,
        color,
        amount
    ) {

        for (
            let i = 0;
            i <
            amount;
            i++
        ) {

            const angle =
                random(
                    0,
                    Math.PI *
                        2
                );


            const speed =
                random(
                    25,
                    95
                );


            state.world
                .particles
                .push({

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
                            0.35,
                            0.85
                        ),

                    maxLife:
                        0.85,

                    size:
                        random(
                            2,
                            5
                        ),

                    color
                });
        }
    }


    function updateVisualEffects(
        dt
    ) {

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
                32 *
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
                Number.isFinite(
                    effect.life
                )
            ) {

                effect.life -=
                    dt;
            }


            if (
                effect.type ===
                    "playerProjectile" ||
                effect.type ===
                    "fairyShot"
            ) {

                effect.x +=
                    effect.vx *
                        dt;


                effect.y +=
                    effect.vy *
                        dt;
            }
        }


        state.world.effects =
            state.world
                .effects
                .filter(
                    effect =>
                        !Number.isFinite(
                            effect.life
                        ) ||
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


        /*
            PISCADA VERMELHA + SANGUE.
        */

        updateDamageScreenEffect(
            dt
        );
    }
    
