(() => {
    "use strict";

    /* =====================================================
       VEYRA — A QUIETUDE
       VERSÃO 17

       PARTE 1/3
    ===================================================== */

    const SAVE_KEY = "veyra_save_v14_stable";
    const GAME_VERSION = 17;

    const MAX_LEVEL = 50;
    const POINTS_PER_LEVEL = 3;
    const STAT_POINT_CAP = 30;

    const DASH_RUBY_COST = 60;
    const DASH_DIAMOND_COST = 45;

    const NORTH_GATE_REQUIREMENTS = {
        diamante: 40,
        rubi: 55
    };


    /* =====================================================
       DOM
    ===================================================== */

    const $ = id =>
        document.getElementById(id);


    const must = id => {
        const element = $(id);

        if (!element) {
            throw new Error(
                `Elemento obrigatório não encontrado: #${id}`
            );
        }

        return element;
    };


    /* =====================================================
       CANVAS
    ===================================================== */

    const canvas = must("gameCanvas");
    const ctx = canvas.getContext("2d");

    const miniCanvas = must("miniCanvas");
    const miniCtx = miniCanvas.getContext("2d");

    const mapCanvas = must("worldMapCanvas");
    const mapCtx = mapCanvas.getContext("2d");


    /* =====================================================
       TELAS
    ===================================================== */

    const screens = {
        menu: must("menuScreen"),
        how: must("howScreen"),
        credits: must("creditsScreen"),
        character: must("characterScreen"),
        game: must("gameScreen")
    };


    /* =====================================================
       PERSONAGENS
    ===================================================== */

    const CHARACTERS = [
        {
            id: "kaelion",

            name: "KAELION",

            className: "Mago",

            icon: "🧙",

            role: "Magia • Longo alcance",

            description:
                "Grande poder mágico, controle à distância e menor resistência física.",

            story:
                "Estudioso de memórias antigas, Kaelion sente a magia desaparecer junto com as lembranças do mundo.",

            hp: 85,
            magic: 145,
            energy: 115,
            speed: 178,
            damage: 25,
            defense: 5,

            color: "#e49345",
            bg: "rgba(228,147,69,.16)",
            glow: "rgba(228,147,69,.28)",

            skill: "Bola de Memória"
        },

        {
            id: "theron",

            name: "THERON",

            className: "Cavaleiro",

            icon: "🛡️",

            role: "Espada • Defesa",

            description:
                "Muita defesa, boa vida e combate corpo a corpo.",

            story:
                "Theron jurou proteger a Vila do Crepúsculo enquanto ainda houver alguém capaz de lembrar seu nome.",

            hp: 145,
            magic: 75,
            energy: 120,
            speed: 145,
            damage: 30,
            defense: 21,

            color: "#bfc5ce",
            bg: "rgba(191,197,206,.14)",
            glow: "rgba(191,197,206,.23)",

            skill: "Golpe do Guardião"
        },

        {
            id: "grumgar",

            name: "GRUMGAR",

            className: "Troll",

            icon: "👹",

            role: "Força • Vida",

            description:
                "Enorme vida e dano físico, porém pouca velocidade.",

            story:
                "Grumgar deixou as cavernas para descobrir por que criaturas de sua espécie começaram a esquecer suas próprias tribos.",

            hp: 180,
            magic: 55,
            energy: 95,
            speed: 112,
            damage: 39,
            defense: 18,

            color: "#718f51",
            bg: "rgba(113,143,81,.16)",
            glow: "rgba(113,143,81,.24)",

            skill: "Esmagamento"
        },

        {
            id: "lirael",

            name: "LIRAEL",

            className: "Fada",

            icon: "🧚",

            role: "Velocidade • Cura",

            description:
                "Muito rápida, mágica e capaz de restaurar vida.",

            story:
                "Lirael percebeu que flores mágicas paravam de brilhar sempre que uma memória desaparecia.",

            hp: 95,
            magic: 135,
            energy: 135,
            speed: 210,
            damage: 20,
            defense: 7,

            color: "#dd8bd0",
            bg: "rgba(221,139,208,.16)",
            glow: "rgba(221,139,208,.25)",

            skill: "Luz Vital"
        },

        {
            id: "zephyr",

            name: "ZEPHYR",

            className: "Transmorfo",

            icon: "🦊",

            role: "Adaptação • Equilíbrio",

            description:
                "Atributos equilibrados e habilidade de adaptação temporária.",

            story:
                "Zephyr muda de forma para sobreviver, mas teme o dia em que esquecerá qual delas era a sua verdadeira forma.",

            hp: 115,
            magic: 108,
            energy: 112,
            speed: 170,
            damage: 26,
            defense: 13,

            color: "#8f6bd8",
            bg: "rgba(143,107,216,.16)",
            glow: "rgba(143,107,216,.25)",

            skill: "Forma Adaptativa"
        }
    ];


    /* =====================================================
       STATUS
    ===================================================== */

    const STAT_CONFIG = {
        strength: {
            name: "Força",
            icon: "⚔️",
            description: "Aumenta o dano causado.",
            cap: STAT_POINT_CAP
        },

        hp: {
            name: "HP",
            icon: "❤️",
            description: "Aumenta a vida máxima.",
            cap: STAT_POINT_CAP
        },

        energy: {
            name: "Energia",
            icon: "⚡",
            description: "Aumenta sua energia máxima.",
            cap: STAT_POINT_CAP
        },

        hunger: {
            name: "Fome",
            icon: "🍖",
            description: "Aumenta sua reserva máxima de fome.",
            cap: STAT_POINT_CAP
        },

        fatigue: {
            name: "Cansaço",
            icon: "💤",
            description: "Aumenta sua resistência máxima ao cansaço.",
            cap: STAT_POINT_CAP
        }
    };


    /* =====================================================
       ITENS
    ===================================================== */

    const ITEMS = {
        madeira: {
            name: "Madeira",
            icon: "🪵",
            category: "materials",
            weight: 1,
            value: 2
        },

        algodao: {
            name: "Algodão",
            icon: "☁️",
            category: "materials",
            weight: 1,
            value: 5
        },

        folha: {
            name: "Folha Resistente",
            icon: "🍃",
            category: "materials",
            weight: 1,
            value: 3
        },

        carvao: {
            name: "Carvão",
            icon: "⬛",
            category: "materials",
            weight: 1,
            value: 6
        },

        ferro: {
            name: "Minério de Ferro",
            icon: "⛏️",
            category: "materials",
            weight: 2,
            value: 14
        },

        ouro: {
            name: "Ouro",
            icon: "🪙",
            category: "materials",
            weight: 2,
            value: 30
        },

        rubi: {
            name: "Rubi",
            icon: "♦️",
            category: "materials",
            weight: 2,
            value: 75
        },

        diamante: {
            name: "Diamante",
            icon: "💎",
            category: "materials",
            weight: 2,
            value: 95
        },

        cristal: {
            name: "Cristal",
            icon: "🔷",
            category: "special",
            weight: 2,
            value: 45
        },

        essencia: {
            name: "Essência da Quietude",
            icon: "✦",
            category: "special",
            weight: 1,
            value: 100
        },

        couro: {
            name: "Couro",
            icon: "🟫",
            category: "materials",
            weight: 1,
            value: 18
        },

        fragmentoMemoria: {
            name: "Fragmento de Memória",
            icon: "🔹",
            category: "special",
            weight: 1,
            value: 55,
            quest: true
        },

        flautaMemoria: {
            name: "Flauta da Memória",
            icon: "🎶",
            category: "special",
            weight: 1,
            value: 0,
            unique: true,
            quest: true
        },

        lanterna: {
            name: "Lanterna",
            icon: "🏮",
            category: "tools",
            weight: 1,
            value: 350,
            unique: true,
            permanent: true
        },

        pao: {
            name: "Pão Rústico",
            icon: "🥖",
            category: "food",
            weight: 1,
            value: 12,
            hunger: 25,
            heal: 3
        },

        carneCaca: {
            name: "Carne de Caça",
            icon: "🍖",
            category: "food",
            weight: 1,
            value: 24,
            hunger: 42,
            heal: 8
        },

        pocao: {
            name: "Poção de Cura",
            icon: "🧪",
            category: "potions",
            weight: 1,
            value: 30,
            heal: 45
        },

        elixir: {
            name: "Elixir de Energia",
            icon: "💙",
            category: "potions",
            weight: 1,
            value: 35,
            energy: 50
        },

        espadaFerro: {
            name: "Espada de Ferro",
            icon: "⚔️",
            category: "weapons",
            weight: 4,
            value: 140,
            damage: 12
        },

        machado: {
            name: "Machado",
            icon: "🪓",
            category: "tools",
            weight: 3,
            value: 50
        },


        /* =================================================
           ARMADURAS
        ================================================= */

        armaduraFolha: {
            name: "Armadura de Folha",
            icon: "🍃",
            category: "armor",
            weight: 2,
            value: 55,
            defense: 3,
            tier: 1
        },

        armaduraAlgodao: {
            name: "Armadura de Algodão",
            icon: "☁️",
            category: "armor",
            weight: 2,
            value: 110,
            defense: 5,
            tier: 2
        },

        armaduraMadeira: {
            name: "Armadura de Madeira",
            icon: "🪵",
            category: "armor",
            weight: 4,
            value: 180,
            defense: 8,
            tier: 3
        },

        armaduraCouro: {
            name: "Armadura de Couro",
            icon: "🥋",
            category: "armor",
            weight: 5,
            value: 280,
            defense: 12,
            tier: 4
        },

        armaduraFerro: {
            name: "Armadura de Ferro",
            icon: "🛡️",
            category: "armor",
            weight: 7,
            value: 650,
            defense: 18,
            tier: 5,
            crafted: true
        },

        armaduraOuro: {
            name: "Armadura de Ouro",
            icon: "🟨",
            category: "armor",
            weight: 7,
            value: 1100,
            defense: 24,
            tier: 6,
            crafted: true
        },

        armaduraDiamante: {
            name: "Armadura de Diamante",
            icon: "💎",
            category: "armor",
            weight: 6,
            value: 1850,
            defense: 32,
            tier: 7,
            crafted: true
        },

        armaduraRubi: {
            name: "Armadura de Rubi",
            icon: "♦️",
            category: "armor",
            weight: 6,
            value: 2900,
            defense: 42,
            tier: 8,
            crafted: true
        }
    };


    /* =====================================================
       ARMADURAS DO FERREIRO
    ===================================================== */

    const ARMOR_UPGRADES = {
        armaduraFerro: {
            previous: "armaduraCouro",

            materials: {
                ferro: 30,
                carvao: 18
            },

            money: 420
        },

        armaduraOuro: {
            previous: "armaduraFerro",

            materials: {
                ferro: 40,
                ouro: 28
            },

            money: 750
        },

        armaduraDiamante: {
            previous: "armaduraOuro",

            materials: {
                ouro: 42,
                diamante: 34
            },

            money: 1200
        },

        armaduraRubi: {
            previous: "armaduraDiamante",

            materials: {
                diamante: 46,
                rubi: 52
            },

            money: 1800
        }
    };


    /* =====================================================
       REGIÕES
    ===================================================== */

    const REGIONS = {
        village: {
            name: "VILA DO CREPÚSCULO",
            width: 3200,
            height: 2200,
            visual: "village"
        },

        forest: {
            name: "FLORESTA",
            width: 3400,
            height: 2400,
            visual: "forest"
        },

        grove: {
            name: "BOSQUE",
            width: 3200,
            height: 2300,
            visual: "grove"
        },

        mountains: {
            name: "MONTANHAS",
            width: 3500,
            height: 2300,
            visual: "mountains"
        },

        iron: {
            name: "CAVERNA DE FERRO",
            width: 2900,
            height: 1900,
            visual: "iron"
        },

        ruby: {
            name: "CAVERNA DE RUBI",
            width: 3100,
            height: 2100,
            visual: "ruby"
        },

        monarchMaze: {
            name: "LABIRINTO DO MONARCA",
            width: 2600,
            height: 1900,
            visual: "monarchMaze",
            dark: true
        },

        shadow: {
            name: "TERRAS SOMBRIAS",
            width: 3200,
            height: 2200,
            visual: "shadow"
        },

        fairy: {
            name: "REINO DAS FADAS",
            width: 3200,
            height: 2200,
            visual: "fairy"
        },

        sky: {
            name: "CÉU",
            width: 3400,
            height: 2200,
            visual: "sky"
        },

        hell: {
            name: "INFERNO",
            width: 3600,
            height: 2400,
            visual: "hell"
        },

        final: {
            name: "CÂMARA FINAL",
            width: 2200,
            height: 1500,
            visual: "final"
        }
    };


    /* =====================================================
       VOLTA DE REGIÃO
    ===================================================== */

    const PREVIOUS_REGION = {
        village: null,

        forest: "village",
        grove: "forest",
        mountains: "grove",
        iron: "mountains",
        ruby: "iron",

        monarchMaze: "ruby",

        shadow: "village",
        fairy: "shadow",
        sky: "fairy",

        hell: "village",
        final: "hell"
    };


    /* =====================================================
       FALAS DOS PORTÕES
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
            name: "ELIAN",
            role: "Morador",
            color: "#d4b27c",

            lines: [
                "A Quietude parece estar chegando mais perto. Ontem eu esqueci o nome da rua onde cresci.",

                "Meu pai dizia que a primeira coisa que some não é um lugar. É a lembrança de que ele existia.",

                "As quatro saídas da vila sempre estiveram aqui... mas algumas parecem levar para lugares que ninguém mais recorda.",

                "Se você descobrir alguma coisa fora da vila, volte. Precisamos de histórias novas para não esquecer as antigas."
            ]
        },

        MARA: {
            name: "MARA",
            role: "Historiadora",
            color: "#b98bc4",

            lines: [
                "Os registros mais antigos falam da Quietude como se ela já tivesse acontecido antes.",

                "Existem quatro grandes caminhos saindo desta vila.",

                "Algumas passagens não são fechadas por pedras. São fechadas porque quem tenta atravessar simplesmente não está preparado.",

                "Quando encontrar algo que não consegue explicar, tente lembrar de cada detalhe antes de voltar."
            ]
        },

        DORAN: {
            name: "DORAN",
            role: "Comerciante",
            color: "#c58a54",
            merchant: true,

            lines: [
                "Compro materiais e vendo o que consigo trazer de fora.",

                "Tenho algumas armaduras simples. Se quiser coisa realmente resistente, fale com Borin.",

                "Também consegui uma lanterna. Não é barata, mas existem lugares em Veyra onde dinheiro vale menos que enxergar o próximo passo.",

                "Se encontrar cristais ou minérios raros, eu pago bem."
            ]
        },

        BRAN: {
            name: "BRAN",
            role: "Carpinteiro",
            color: "#8d7053",
            questId: "wood",

            lines: [
                "Preciso reforçar algumas casas. A madeira anda apodrecendo mais rápido desde que a Quietude chegou.",

                "As árvores daqui são estranhas. Algumas voltam a nascer longe do lugar onde caíram.",

                "Se puder trazer dez madeiras, eu pago pelo trabalho.",

                "Cortar madeira consome magia. Não se esgote por causa de uma árvore."
            ]
        },

        BORIN: {
            name: "BORIN",
            role: "Ferreiro",
            color: "#8e8d89",
            questId: "coal",
            blacksmith: true,

            lines: [
                "O fogo da forja ainda lembra como queimar. Por enquanto.",

                "Couro é o máximo que Doran consegue vender sem depender de minério raro.",

                "Se quiser Ferro, Ouro, Diamante ou Rubi, vai precisar trazer os materiais.",

                "Equipamento realmente bom não se compra pronto. Se constrói."
            ]
        }
    };


    /* =====================================================
       HABILIDADES
    ===================================================== */

    const CLASS_SKILLS = {
        kaelion: {
            q: {
                name: "Bola de Memória",
                level: 1,
                cooldown: 2,
                costMagic: 15
            },

            r: {
                name: "Nova Arcana",
                level: 5,
                cooldown: 6,
                costMagic: 30
            },

            f: {
                name: "Tempestade da Quietude",
                level: 10,
                cooldown: 12,
                costMagic: 55
            }
        },

        theron: {
            q: {
                name: "Golpe Pesado",
                level: 1,
                cooldown: 3,
                costEnergy: 10
            },

            r: {
                name: "Postura do Guardião",
                level: 5,
                cooldown: 9,
                costEnergy: 18
            },

            f: {
                name: "Juramento de Aço",
                level: 10,
                cooldown: 15,
                costEnergy: 30
            }
        },

        grumgar: {
            q: {
                name: "Esmagamento",
                level: 1,
                cooldown: 4,
                costEnergy: 12
            },

            r: {
                name: "Rugido Ancestral",
                level: 5,
                cooldown: 8,
                costEnergy: 20
            },

            f: {
                name: "Terremoto",
                level: 10,
                cooldown: 14,
                costEnergy: 34
            }
        },

        lirael: {
            q: {
                name: "Flecha Feérica",
                level: 1,
                cooldown: 1.5,
                costMagic: 12
            },

            r: {
                name: "Luz Vital",
                level: 5,
                cooldown: 7,
                costMagic: 28
            },

            f: {
                name: "Chuva de Estrelas",
                level: 10,
                cooldown: 11,
                costMagic: 48
            }
        },

        zephyr: {
            q: {
                name: "Forma Adaptativa",
                level: 1,
                cooldown: 7,
                costMagic: 12
            },

            r: {
                name: "Investida Quimérica",
                level: 5,
                cooldown: 6,
                costEnergy: 18
            },

            f: {
                name: "Forma Perfeita",
                level: 10,
                cooldown: 15,
                costMagic: 42
            }
        }
    };


    /* =====================================================
       BOSSES
    ===================================================== */

    const BOSS_REGISTRY = [
        {
            id: "forest_guardian",
            name: "GUARDIÃO DA ESTRADA",
            icon: "👺",
            description:
                "Antigo protetor da passagem leste da vila.",
            quote:
                "Ele continuou guardando a passagem depois de esquecer o motivo."
        },

        {
            id: "grove_guardian",
            name: "GUARDIÃO DA FLORESTA",
            icon: "🌳",
            description:
                "Uma árvore ancestral contaminada por memórias quebradas.",
            quote:
                "As raízes lembram o que as folhas esqueceram."
        },

        {
            id: "mountain_guardian",
            name: "GUARDIÃO DO BOSQUE",
            icon: "🌲",
            description:
                "O último espírito que separa o Bosque das Montanhas.",
            quote:
                "Cada galho carrega um nome que já não possui dono."
        },

        {
            id: "iron_guardian",
            name: "SENTINELA DAS MONTANHAS",
            icon: "🗿",
            description:
                "Sentinela de pedra criada para impedir viajantes de alcançar as minas.",
            quote:
                "A pedra não esqueceu a ordem. Esqueceu apenas quem a deu."
        },

        {
            id: "ruby_guardian",
            name: "GUARDIÃO DE FERRO",
            icon: "⚙️",
            description:
                "Máquina ancestral que continua defendendo os túneis.",
            quote:
                "Quando o último martelo silenciou, ele continuou trabalhando."
        },

        {
            id: "shadow_guardian",
            name: "GUARDIÃO RUBI",
            icon: "🔴",
            description:
                "Uma criatura formada ao redor de um núcleo de rubi vivo.",
            quote:
                "O cristal repete tudo — até aquilo que nunca aconteceu."
        },

        {
            id: "monarch",
            name: "O MONARCA",
            icon: "🥷",
            description:
                "Uma presença antiga selada além do labirinto.",
            quote:
                "O poder que você procurava nunca esteve abandonado."
        },

        {
            id: "fairy_guardian",
            name: "GUARDIÃO SOMBRIO",
            icon: "🌑",
            description:
                "Sombra condensada de exploradores esquecidos.",
            quote:
                "Nenhuma sombra nasce sem algo para bloquear a luz."
        },

        {
            id: "sky_guardian",
            name: "GUARDIÃ DOS FIOS",
            icon: "🧚",
            description:
                "Antiga fada ligada às memórias do mundo.",
            quote:
                "Ela aprendeu tarde demais que lembrar também pode doer."
        },

        {
            id: "path_guardian",
            name: "GUARDIÃO DO CAMINHO",
            icon: "🪽",
            description:
                "Vigilante celestial que carrega a Flauta da Memória.",
            quote:
                "A passagem não estava escondida. O mundo havia esquecido que ela existia."
        },

        {
            id: "final_gate_guardian",
            name: "GUARDIÃO SUPREMO DO INFERNO",
            icon: "👿",
            description:
                "Uma entidade formada por memórias destruídas.",
            quote:
                "Atrás dele, até o medo parece lembrar do seu nome."
        },

        {
            id: "other_self",
            name: "O OUTRO EU",
            icon: "☯",
            description:
                "Uma versão alternativa do protagonista.",
            quote:
                "Se nada for lembrado, nada poderá sofrer."
        }
    ];


    /* =====================================================
       ESTADO
    ===================================================== */

    const state = {
        selectedCharacter: CHARACTERS[0],

        player: null,

        running: false,
        paused: false,

        time: 0,
        lastTime: 0,

        keys: new Set(),

        area: "village",

        camera: {
            x: 0,
            y: 0
        },

        world:
            createEmptyWorld(
                REGIONS.village
            ),

        houseMode: false,
        currentHouse: null,
        houseReturn: null,

        dialogue: null,
        travel: null,
        battle: null,

        questNPC: null,

        shopNPC: null,
        shopMode: "buy",

        inventoryCategory: "all",

        toastTimer: null,

        portalCooldown: 0,

        warnedNeedAt: 0,

        finalChoiceShown: false,

        pointer: {
            x: 0,
            y: 0,

            worldX: 0,
            worldY: 0,

            down: false
        },

        holdAction: null,

        hordeNextAt: 0,

        screenFadeTimer: null,

        screenShake: 0,
        screenShakePower: 0,

        damageFlash: 0,
        damageFlashMax: 0.45,

        bloodMarks: [],

        gateModal: null,
        altarModal: null,
        forgeModal: null,
        statusModal: null,

        bossBarTarget: null
    };


    /* =====================================================
       MUNDO VAZIO
    ===================================================== */

    function createEmptyWorld(region) {
        return {
            width: region.width,
            height: region.height,

            obstacles: [],
            buildings: [],
            trees: [],
            resources: [],
            foods: [],

            secrets: [],
            decorations: [],
            trials: [],
            hazards: [],

            npcs: [],
            enemies: [],
            drops: [],

            portals: [],
            gates: [],

            particles: [],
            effects: [],

            paths: [],

            maze: null
        };
    }


    /* =====================================================
       UTILIDADES
    ===================================================== */

    function clamp(value, min, max) {
        return Math.max(
            min,
            Math.min(max, value)
        );
    }


    function random(min, max) {
        return (
            Math.random() *
            (max - min) +
            min
        );
    }


    function randomInt(min, max) {
        return Math.floor(
            random(
                min,
                max + 1
            )
        );
    }


    function distance(a, b) {
        return Math.hypot(
            a.x - b.x,
            a.y - b.y
        );
    }


    function uid(prefix) {
        return (
            `${prefix}_` +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }


    function hashString(text) {
        let hash = 2166136261;

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


    function mulberry32(seed) {
        return function () {
            let t =
                seed +=
                    0x6D2B79F5;

            t =
                Math.imul(
                    t ^
                    (t >>> 15),
                    t | 1
                );

            t ^=
                t +
                Math.imul(
                    t ^
                    (t >>> 7),
                    t | 61
                );

            return (
                (
                    t ^
                    (t >>> 14)
                ) >>> 0
            ) /
            4294967296;
        };
    }


    function areaRng(
        area,
        salt = "layout"
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
                hashString(salt)
            ) >>> 0
        );
    }


    function seededRange(
        rng,
        min,
        max
    ) {
        return (
            rng() *
            (max - min) +
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


    function normalizeVector(x, y) {
        const length =
            Math.hypot(x, y) ||
            1;

        return {
            x: x / length,
            y: y / length
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
                main: "#f0a258",
                glow: "#ffd59b",
                secondary: "#a46cff"
            },

            theron: {
                main: "#d6dde6",
                glow: "#fff4d3",
                secondary: "#8fa6bd"
            },

            grumgar: {
                main: "#8da05c",
                glow: "#d2d99a",
                secondary: "#a36f4e"
            },

            lirael: {
                main: "#f3a6dd",
                glow: "#ffe0f6",
                secondary: "#84e7ff"
            },

            zephyr: {
                main: "#9d7be8",
                glow: "#e5d6ff",
                secondary: "#69d5b1"
            }
        };

        return (
            palettes[characterId] ||
            palettes.kaelion
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


    function hasAbility(id) {
        return Boolean(
            state.player
                ?.abilities
                ?.[id]
        );
    }


    function hasDefeatedBoss(id) {
        return Boolean(
            state.player
                ?.defeatedBosses
                ?.includes(id)
        );
    }


    /* =====================================================
       STATUS
    ===================================================== */

    function applyStatBonuses(
        refill = false
    ) {
        const player =
            state.player;

        if (!player) {
            return;
        }

        const stats =
            player.stats || {
                strength: 0,
                hp: 0,
                energy: 0,
                hunger: 0,
                fatigue: 0
            };

        player.maxHp =
            Math.round(
                player.baseMaxHp +
                stats.hp * 8
            );

        player.maxEnergy =
            Math.round(
                player.baseMaxEnergy +
                stats.energy * 5
            );

        player.maxHunger =
            100 +
            stats.hunger * 3;

        player.maxFatigue =
            100 +
            stats.fatigue * 3;

        player.damage =
            Math.round(
                player.baseDamage *
                (
                    1 +
                    stats.strength *
                    0.02
                )
            );

        if (refill) {
            player.hp =
                player.maxHp;

            player.energy =
                player.maxEnergy;

            player.hunger =
                player.maxHunger;

            player.fatigue =
                player.maxFatigue;

            player.magic =
                player.maxMagic;

            return;
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
    }


    /* =====================================================
       TELAS
    ===================================================== */

    function showScreen(name) {
        Object
            .values(screens)
            .forEach(
                screen => {
                    screen.classList
                        .remove("active");
                }
            );

        screens[name]
            .classList
            .add("active");
    }


    function fadeToScreen(
        name,
        afterSwitch = null
    ) {
        const fade =
            $("uiFade");

        if (!fade) {
            showScreen(name);

            if (
                typeof afterSwitch ===
                "function"
            ) {
                afterSwitch();
            }

            return;
        }

        clearTimeout(
            state.screenFadeTimer
        );

        fade.classList.add(
            "active"
        );

        state.screenFadeTimer =
            setTimeout(
                () => {
                    showScreen(name);

                    if (
                        typeof afterSwitch ===
                        "function"
                    ) {
                        afterSwitch();
                    }

                    requestAnimationFrame(
                        () => {
                            requestAnimationFrame(
                                () => {
                                    fade
                                        .classList
                                        .remove(
                                            "active"
                                        );
                                }
                            );
                        }
                    );
                },
                320
            );
    }


    function showToast(message) {
        const toast =
            must("saveMessage");

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
                    toast
                        .classList
                        .remove("show");
                },
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


    /* =====================================================
       PERSONAGENS
    ===================================================== */

    function createCharacterCards() {
        const container =
            must("characterCards");

        container.innerHTML = "";

        const maximums = {
            hp: 180,
            magic: 145,
            energy: 135,
            damage: 39,
            defense: 21,
            speed: 210
        };

        const labels = {
            hp: "Vida",
            magic: "Magia",
            energy: "Energia",
            damage: "Dano",
            defense: "Defesa",
            speed: "Velocidade"
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
                        index === 0
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

                const stats = [
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
                                    character[key] /
                                    maximums[key] *
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
                                item => {
                                    item
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


    /* =====================================================
       NOVO JOGO
    ===================================================== */

    function startNewGame() {
        must("playerName").value =
            "";

        must("nameError").textContent =
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
                    card
                        .classList
                        .toggle(
                            "selected",
                            index === 0
                        );
                }
            );

        fadeToScreen(
            "character",

            () => {
                setTimeout(
                    () => {
                        must(
                            "playerName"
                        ).focus();
                    },
                    80
                );
            }
        );
    }


    /* =====================================================
       CRIAÇÃO DO PLAYER
    ===================================================== */

    function createPlayer(
        name,
        character
    ) {
        const worldSeeds = {};

        Object
            .keys(REGIONS)
            .forEach(
                (
                    area,
                    index
                ) => {
                    worldSeeds[area] =
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

            x: 380,
            y: 260,

            radius: 18,

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

            hunger: 100,
            maxHunger: 100,

            fatigue: 100,
            maxFatigue: 100,

            speed:
                character.speed,

            damage:
                character.damage,

            defense:
                character.defense,

            level: 1,

            xp: 0,

            xpToNext: 100,

            statPoints: 0,

            stats: {
                strength: 0,
                hp: 0,
                energy: 0,
                hunger: 0,
                fatigue: 0
            },

            abilities: {
                dash: false,
                route2: false,
                route3: false
            },

            dashCooldown: 0,

            money: 35,

            memory: 0,

            inventory: {
                madeira: 0,
                algodao: 0,
                folha: 0,
                carvao: 0,

                ferro: 0,
                ouro: 0,
                rubi: 0,
                diamante: 0,

                cristal: 0,
                essencia: 0,
                couro: 0,

                fragmentoMemoria: 0,
                flautaMemoria: 0,

                lanterna: 0,

                pao: 2,
                carneCaca: 0,

                pocao: 2,
                elixir: 1,

                espadaFerro: 0,

                machado: 1,

                armaduraFolha: 0,
                armaduraAlgodao: 0,
                armaduraMadeira: 0,
                armaduraCouro: 0,

                armaduraFerro: 0,
                armaduraOuro: 0,
                armaduraDiamante: 0,
                armaduraRubi: 0
            },

            equipment: {
                weapon: null,
                armor: null,
                tool: "machado"
            },

            quest: {
                wood: {
                    state: "none",
                    need: 10,
                    rewardXP: 100,
                    rewardMoney: 80
                },

                coal: {
                    state: "none",
                    need: 8,
                    rewardXP: 130,
                    rewardMoney: 110
                }
            },

            defeatedBosses: [],
            discoveredBosses: [],

            unlockedAreas: [
                "village"
            ],

            hellTypesDefeated: {},

            secretsFound: [],

            worldSeeds,

            gateDialogueIndex: {
                north: 0,
                west: 0,
                south: 0
            },

            gateUnlocks: {
                north: false,
                west: false,
                south: false
            },

            monarchAwakened: false,
            monarchDefeated: false,

            dashPurchased: false,

            skyTrial: {
                started: false,
                wave: 0,
                activeWave: 0,
                complete: false
            },

            flutePlayed: false,

            checkpoint: {
                area: "village",
                x: 480,
                y: 610
            },

            skillCooldowns: {
                q: 0,
                r: 0,
                f: 0
            },

            damageReduction: 0,

            shieldTimer: 0,

            stunTimer: 0,

            dead: false,

            invincible: 0,

            attackCooldown: 0,

            adaptiveBuff: false,

            playerDash: null,

            finalChoice: null,

            finalDefeated: false
        };

        applyStatBonuses(
            true
        );
    }


    /* =====================================================
       COMEÇAR JOGO
    ===================================================== */

    function startGame() {
        const input =
            must("playerName");

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

        state.bossBarTarget =
            null;

        buildWorld();

        const home =
            state.world
                .buildings
                .find(
                    building =>
                        building.id ===
                        "home"
                );

        if (home) {
            state.currentHouse =
                home;

            state.houseMode =
                true;

            state.houseReturn = {
                x:
                    home.x +
                    home.w / 2,

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
                REGIONS[state.area]
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
            x - 24,
            y - 95,

            w + 48,
            h + 95,

            "building",

            {
                buildingId: id
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

            alive: true,

            amount:
                randomInt(
                    2,
                    5
                ),

            respawn: 0
        };

        state.world
            .trees
            .push(
                tree
            );

        addObstacle(
            x - 30,
            y - 38,

            60,
            76,

            "tree",

            {
                treeId: id
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

            alive: true,

            amount:
                randomInt(
                    1,
                    3
                ),

            respawn: 0,

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
        type = "carrot",
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

            alive: true,

            respawn: 0,

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
            id: stableId,

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

            radius: 38,

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

            triggered: false,

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

            radius: 17,

            ...data
        };

        state.world
            .npcs
            .push(
                npc
            );

        return npc;
    }


    /* =====================================================
       INIMIGOS
    ===================================================== */

    function addEnemy(enemy) {
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
                level - 1
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
                            level - 1
                        ) *
                        0.006
                    )
                )
            );

        const created = {
            state: "idle",

            aggressive: false,
            accepted: false,

            attackTimer: 0,

            specialTimer:
                random(
                    1.7,
                    3.2
                ),

            hitFlash: 0,

            stunTimer: 0,

            dead: false,

            respawnTimer: 0,

            phase: 1,

            charge: null,

            telegraphing: false,

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
        title = null
    ) {
        if (!target) {
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

            () => true,

            title ||
                `VOLTAR PARA ${REGIONS[target].name}`,

            {
                direction: "back",
                returnPortal: true,
                arrivalSide: "right"
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
            state.world.height - edge,
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
            state.world.width - edge,
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
            village: buildVillage,
            forest: buildForest,
            grove: buildGrove,
            mountains: buildMountains,
            iron: buildIron,
            ruby: buildRuby,
            monarchMaze: buildMonarchMaze,

            shadow: buildShadow,
            fairy: buildFairy,
            sky: buildSky,
            hell: buildHell,
            final: buildFinal
        };

        const builder =
            builders[
                state.area
            ];

        if (
            typeof builder ===
            "function"
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


        /* CAMINHOS */

        addPath(
            [
                {
                    x: 70,
                    y: 1140
                },

                {
                    x: 3130,
                    y: 1140
                }
            ],

            120,
            "villageRoad"
        );

        addPath(
            [
                {
                    x: 1600,
                    y: 70
                },

                {
                    x: 1600,
                    y: 2130
                }
            ],

            120,
            "villageRoad"
        );


        /* FONTE */

        addObstacle(
            1492,
            978,
            216,
            216,
            "fountain"
        );


        /* PORTÕES */

        addGate(
            "north_gate",
            "north",

            1490,
            85,

            220,
            90,

            "PORTÃO DO NORTE",

            {
                target: "shadow",

                route: 2,

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
                target: "sky",

                route: 3,

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
                target: "hell",

                route: 4,

                requiredAbility:
                    "route3"
            }
        );


        /* PEDRAS */

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
                ([x, y]) => {
                    addObstacle(
                        x - 30,
                        y - 23,
                        60,
                        46,
                        "rock"
                    );
                }
            );


        /* ÁRVORES */

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
                    [x, y],
                    index
                ) => {
                    addTree(
                        x,
                        y,
                        `village_tree_${index}`
                    );
                }
            );


        /* NPCS EXTERNOS */

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


        /*
            DORAN NÃO É CRIADO AQUI.
            ELE FICA APENAS DENTRO DA LOJA.
        */


        /* INIMIGO */

        addEnemy({
            id:
                "village_slime",

            x: 1260,
            y: 760,

            name:
                "LIMO DA QUIETUDE",

            icon:
                "🟢",

            type:
                "normal",

            hp: 58,

            damage: 8,

            speed: 56,

            vision: 190,

            attackRange: 55,

            radius: 18,

            color:
                "#6c9862",

            drop:
                "carvao",

            dropAmount: 1
        });


        addEnemy({
            id:
                "village_wolf",

            x: 2190,
            y: 1450,

            name:
                "LOBO ESQUECIDO",

            icon:
                "🐺",

            type:
                "normal",

            hp: 82,

            damage: 12,

            speed: 92,

            vision: 260,

            attackRange: 65,

            radius: 21,

            color:
                "#686d78",

            drop:
                "couro",

            dropAmount: 1,

            dropChance:
                0.65,

            special:
                "dash"
        });


        addEnemy({
            id:
                "village_resource_boss",

            x: 2360,
            y: 1810,

            name:
                "CERVO ANCESTRAL",

            icon:
                "🦌",

            type:
                "resourceBoss",

            hp: 430,

            damage: 18,

            speed: 64,

            vision: 270,

            attackRange: 75,

            radius: 30,

            color:
                "#788762",

            drop:
                "ouro",

            dropAmount: 2,

            respawnTime: 60,

            special:
                "natureBurst"
        });


        /* BOSS 1 */

        addEnemy({
            id:
                "forest_guardian",

            x: 2870,
            y: 1130,

            name:
                "GUARDIÃO DA ESTRADA",

            icon:
                "👺",

            type:
                "progression",

            hp: 300,

            damage: 21,

            speed: 64,

            vision: 340,

            attackRange: 82,

            radius: 30,

            color:
                "#945149",

            drop:
                "cristal",

            dropAmount: 2,

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


        /* CENOURAS */

        addFood(
            1340,
            1450,

            "carrot",

            {
                respawnMin: 110,
                respawnMax: 165
            }
        );

        addFood(
            1425,
            1510,

            "carrot",

            {
                respawnMin: 115,
                respawnMax: 175
            }
        );


        /* FOLHA / ALGODÃO */

        addResource(
            890,
            1760,

            "folha",

            {
                amount: 3
            }
        );

        addResource(
            1080,
            1850,

            "algodao",

            {
                amount: 3
            }
        );
    }


    /* =====================================================
       CAMINHO FLORESTA / BOSQUE
    ===================================================== */

    function forestPathY(
        x,
        area = "forest"
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
                x / divA +
                phaseA
            ) *
                ampA +
            Math.sin(
                x / divB +
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

        const points = [];

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

            if (
                Math.floor(
                    x / 78
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


        let planted = 0;
        let tries = 0;

        while (
            planted < 82 &&
            tries < 1000
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
            i < 28;
            i++
        ) {
            addDecoration(
                i % 5 === 0
                    ? "fallenLog"
                    : i % 3 === 0
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
                    [x, y, type]
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
            i < 10;
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

                i % 2
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
                i % 2 === 0;

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

                vision: 275,

                attackRange: 66,

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

                dropAmount: 1,

                dropChance:
                    boar
                        ? 0.8
                        : 0.65,

                special:
                    i >= 6
                        ? "dash"
                        : null
            });
        }


        addEnemy({
            id:
                "grove_guardian",

            x: 2990,

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

            hp: 470,

            damage: 26,

            speed: 60,

            vision: 365,

            attackRange: 88,

            radius: 36,

            color:
                "#416d43",

            drop:
                "fragmentoMemoria",

            dropAmount: 2,

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
                                index % 2
                                    ? 135
                                    : -145
                            ),

                        "carrot",

                        {
                            respawnMin: 115,
                            respawnMax: 175
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

        const points = [];

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


        let count = 0;
        let guard = 0;

        while (
            count < 66 &&
            guard++ < 850
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
                i % 6 === 0
                    ? "ancientRoot"
                    : i % 4 === 0
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
                i % 3 === 0;

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

                vision: 285,

                attackRange: 68,

                radius: 24,

                color:
                    deer
                        ? "#8d7959"
                        : "#60745e",

                drop:
                    deer
                        ? "carneCaca"
                        : "couro",

                dropAmount: 1,

                dropChance: 0.75,

                special:
                    i >= 6
                        ? "dash"
                        : null
            });
        }


        addEnemy({
            id:
                "mountain_guardian",

            x: 2760,
            y: 1120,

            name:
                "GUARDIÃO DO BOSQUE",

            icon:
                "🌲",

            type:
                "progression",

            hp: 560,

            damage: 30,

            speed: 59,

            vision: 375,

            attackRange: 90,

            radius: 37,

            color:
                "#4f744f",

            drop:
                "fragmentoMemoria",

            dropAmount: 2,

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
                {
                    x: 130,
                    y: 1140
                },

                {
                    x: 600,
                    y: 1080
                },

                {
                    x: 1040,
                    y: 1250
                },

                {
                    x: 1520,
                    y: 1070
                },

                {
                    x: 2080,
                    y: 1180
                },

                {
                    x: 2640,
                    y: 1030
                },

                {
                    x: 3370,
                    y: 1140
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

                i % 8 === 0
                    ? "iceRock"
                    : i % 5 === 0
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
                i % 8 === 0
                    ? "deadPine"
                    : i % 6 === 0
                    ? "oreSpark"
                    : i % 4 === 0
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
                ([x, y, type]) => {
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
            i < 11;
            i++
        ) {
            const deer =
                i % 3 === 0;

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

                vision: 300,

                attackRange:
                    deer
                        ? 70
                        : 85,

                radius: 25,

                color:
                    deer
                        ? "#d7d4c9"
                        : "#bec5c7",

                drop:
                    deer
                        ? "carneCaca"
                        : "couro",

                dropAmount: 1,

                dropChance: 0.8,

                special:
                    deer
                        ? "dash"
                        : "rockThrow"
            });
        }


        addEnemy({
            id:
                "iron_guardian",

            x: 3000,
            y: 1110,

            name:
                "SENTINELA DAS MONTANHAS",

            icon:
                "🗿",

            type:
                "progression",

            hp: 700,

            damage: 35,

            speed: 55,

            vision: 390,

            attackRange: 96,

            radius: 39,

            color:
                "#697176",

            drop:
                "fragmentoMemoria",

            dropAmount: 3,

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
                {
                    x: 120,
                    y: 950
                },

                {
                    x: 620,
                    y: 890
                },

                {
                    x: 1180,
                    y: 1010
                },

                {
                    x: 1750,
                    y: 850
                },

                {
                    x: 2260,
                    y: 990
                },

                {
                    x: 2800,
                    y: 940
                }
            ],

            82,

            "mineTrack"
        );


        for (
            let i = 0;
            i < 38;
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

                i % 5 === 0
                    ? "oreRock"
                    : "ironrock"
            );
        }


        for (
            let i = 0;
            i < 35;
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
                i % 13 ===
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
            i < 30;
            i++
        ) {
            addDecoration(
                i % 5 === 0
                    ? "mineLantern"
                    : i % 4 === 0
                    ? "rail"
                    : i % 3 === 0
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

                hp: 205,

                damage: 25,

                speed: 65,

                vision: 275,

                attackRange: 76,

                radius: 25,

                color:
                    "#626a6d",

                drop:
                    i % 4 === 0
                        ? "ouro"
                        : "ferro",

                dropAmount: 1,

                dropChance:
                    0.62,

                special:
                    i >= 5
                        ? "oreBurst"
                        : null
            });
        }


        addEnemy({
            id:
                "ruby_guardian",

            x: 2450,
            y: 950,

            name:
                "GUARDIÃO DE FERRO",

            icon:
                "⚙️",

            type:
                "progression",

            hp: 800,

            damage: 39,

            speed: 56,

            vision: 400,

            attackRange: 100,

            radius: 40,

            color:
                "#70787d",

            drop:
                "fragmentoMemoria",

            dropAmount: 3,

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
                {
                    x: 120,
                    y: 1040
                },

                {
                    x: 650,
                    y: 970
                },

                {
                    x: 1180,
                    y: 1110
                },

                {
                    x: 1700,
                    y: 910
                },

                {
                    x: 2250,
                    y: 1050
                },

                {
                    x: 2840,
                    y: 520
                }
            ],

            84,

            "crystalTrail"
        );


        for (
            let i = 0;
            i < 40;
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

                i % 4 === 0
                    ? "rubyPillar"
                    : "rubyrock"
            );
        }


        for (
            let i = 0;
            i < 50;
            i++
        ) {
            const type =
                i % 5 === 0
                    ? "diamante"
                    : i % 9 === 0
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
            i < 38;
            i++
        ) {
            addDecoration(
                i % 3 === 0
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

                hp: 242,

                damage: 29,

                speed: 73,

                vision: 292,

                attackRange: 82,

                radius: 26,

                color:
                    "#a34554",

                drop:
                    i % 4 === 0
                        ? "diamante"
                        : "rubi",

                dropAmount: 1,

                dropChance:
                    0.7,

                special:
                    i >= 4
                        ? "crystalShot"
                        : null
            });
        }


        /* BOSS 6 */

        addEnemy({
            id:
                "shadow_guardian",

            x: 2520,
            y: 1040,

            name:
                "GUARDIÃO RUBI",

            icon:
                "🔴",

            type:
                "progression",

            hp: 920,

            damage: 44,

            speed: 60,

            vision: 410,

            attackRange: 104,

            radius: 41,

            color:
                "#a33b4f",

            drop:
                "rubi",

            dropAmount: 6,

            unlock:
                "monarchMaze",

            special:
                "crystalRain"
        });


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
       PARTE 2/3 — REGIÕES, COMBATE E SISTEMAS
    ===================================================== */

    /* =====================================================
       LABIRINTO DO MONARCA
    ===================================================== */

    function buildMonarchMaze() {
        const rng = areaRng("monarchMaze", "maze");

        const cols = 15;
        const rows = 11;
        const cell = 132;

        const ox = 150;
        const oy = 190;

        const wall = 18;

        const cells = Array.from(
            { length: rows },
            (_, y) =>
                Array.from(
                    { length: cols },
                    (_, x) => ({
                        x,
                        y,

                        visited: false,

                        walls: {
                            n: true,
                            e: true,
                            s: true,
                            w: true
                        }
                    })
                )
        );

        const stack = [];

        let current =
            cells[
                Math.floor(rows / 2)
            ][0];

        current.visited = true;

        let visited = 1;

        while (
            visited <
            cols * rows
        ) {
            const choices = [];

            const {
                x,
                y
            } = current;

            if (
                y > 0 &&
                !cells[y - 1][x]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[y - 1][x],

                    dir:
                        "n",

                    opposite:
                        "s"
                });
            }

            if (
                x < cols - 1 &&
                !cells[y][x + 1]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[y][x + 1],

                    dir:
                        "e",

                    opposite:
                        "w"
                });
            }

            if (
                y < rows - 1 &&
                !cells[y + 1][x]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[y + 1][x],

                    dir:
                        "s",

                    opposite:
                        "n"
                });
            }

            if (
                x > 0 &&
                !cells[y][x - 1]
                    .visited
            ) {
                choices.push({
                    cell:
                        cells[y][x - 1],

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


        /* ============================
           ENTRADA
        ============================ */

        const entranceRow =
            Math.floor(
                rows / 2
            );

        cells[
            entranceRow
        ][0]
            .walls
            .w =
            false;


        /* ============================
           SAÍDA ALEATÓRIA
        ============================ */

        let exitRow =
            entranceRow;

        let farScore =
            -1;

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
                2;

            if (
                score >
                farScore
            ) {
                farScore =
                    score;

                exitRow =
                    y;
            }
        }

        cells[
            exitRow
        ][
            cols - 1
        ]
            .walls
            .e =
            false;


        /* ============================
           PAREDES
        ============================ */

        const addMazeWall = (
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
                const c =
                    cells[y][x];

                const px =
                    ox +
                    x *
                    cell;

                const py =
                    oy +
                    y *
                    cell;

                if (
                    c.walls.n
                ) {
                    addMazeWall(
                        px,
                        py,
                        cell + wall,
                        wall
                    );
                }

                if (
                    c.walls.w
                ) {
                    addMazeWall(
                        px,
                        py,
                        wall,
                        cell + wall
                    );
                }

                if (
                    x ===
                        cols - 1 &&
                    c.walls.e
                ) {
                    addMazeWall(
                        px + cell,
                        py,
                        wall,
                        cell + wall
                    );
                }

                if (
                    y ===
                        rows - 1 &&
                    c.walls.s
                ) {
                    addMazeWall(
                        px,
                        py + cell,
                        cell + wall,
                        wall
                    );
                }
            }
        }


        /* ============================
           ARENA
        ============================ */

        const arena = {
            x: 2130,
            y: 450,

            w: 360,
            h: 1000
        };


        const exitCenterY =
            oy +
            exitRow *
            cell +
            cell / 2;


        addPath(
            [
                {
                    x:
                        ox +
                        cols *
                        cell -
                        5,

                    y:
                        exitCenterY
                },

                {
                    x:
                        arena.x +
                        40,

                    y:
                        exitCenterY
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

            72,

            "mazeExit"
        );


        /*
            A abertura acompanha
            a saída verdadeira do labirinto.
        */

        const arenaOpeningY =
            clamp(
                exitCenterY -
                    90,

                arena.y +
                    70,

                arena.y +
                    arena.h -
                    250
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


        if (
            arenaOpeningY >
            arena.y
        ) {
            addObstacle(
                arena.x,
                arena.y,

                24,

                arenaOpeningY -
                    arena.y,

                "arenaWall",

                {
                    blocksLight:
                        true
                }
            );
        }


        const lowerWallY =
            arenaOpeningY +
            180;


        if (
            lowerWallY <
            arena.y +
            arena.h
        ) {
            addObstacle(
                arena.x,
                lowerWallY,

                24,

                arena.y +
                    arena.h -
                    lowerWallY,

                "arenaWall",

                {
                    blocksLight:
                        true
                }
            );
        }


        state.world.maze = {
            cols,
            rows,
            cell,

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
                        90,

                    y:
                        arena.y +
                        150
                },

                {
                    x:
                        arena.x +
                        arena.w -
                        90,

                    y:
                        arena.y +
                        170
                },

                {
                    x:
                        arena.x +
                        95,

                    y:
                        arena.y +
                        arena.h -
                        165
                },

                {
                    x:
                        arena.x +
                        arena.w -
                        95,

                    y:
                        arena.y +
                        arena.h -
                        155
                },

                {
                    x:
                        arena.x +
                        arena.w /
                        2,

                    y:
                        arena.y +
                        235
                },

                {
                    x:
                        arena.x +
                        arena.w /
                        2,

                    y:
                        arena.y +
                        arena.h -
                        235
                }
            ]
        };


        /* ============================
           ALTAR
        ============================ */

        addTrial(
            arena.x +
                arena.w /
                2,

            arena.y +
                arena.h /
                2,

            "dash_altar",

            "ALTAR DO PODER",

            {
                dashAltar:
                    true,

                radius:
                    50
            }
        );


        addDecoration(
            "dashAltar",

            arena.x +
                arena.w /
                2,

            arena.y +
                arena.h /
                2
        );


        /* ============================
           DECORAÇÃO
        ============================ */

        for (
            let i = 0;
            i < 22;
            i++
        ) {
            addDecoration(
                i % 5 === 0
                    ? "cobweb"

                    : i % 4 === 0
                    ? "bones"

                    : "darkPebble",

                seededInt(
                    rng,
                    210,
                    2040
                ),

                seededInt(
                    rng,
                    240,
                    1640
                )
            );
        }


        /* ============================
           ARANHAS E ESCORPIÕES
        ============================ */

        for (
            let i = 0;
            i < 13;
            i++
        ) {
            const isSpider =
                i % 2 ===
                0;

            const cx =
                seededInt(
                    rng,
                    1,
                    cols - 2
                );

            const cy =
                seededInt(
                    rng,
                    0,
                    rows - 1
                );


            addEnemy({
                id:
                    `maze_enemy_${i}`,

                x:
                    ox +
                    cx *
                    cell +
                    cell /
                    2,

                y:
                    oy +
                    cy *
                    cell +
                    cell /
                    2,

                name:
                    isSpider
                        ? "ARANHA DO VAZIO"
                        : "ESCORPIÃO SOMBRIO",

                icon:
                    isSpider
                        ? "🕷️"
                        : "🦂",

                type:
                    "normal",

                hp:
                    isSpider
                        ? 250
                        : 310,

                damage:
                    isSpider
                        ? 28
                        : 36,

                speed:
                    isSpider
                        ? 92
                        : 68,

                vision:
                    235,

                attackRange:
                    isSpider
                        ? 62
                        : 72,

                radius:
                    isSpider
                        ? 21
                        : 24,

                color:
                    isSpider
                        ? "#62506e"
                        : "#704a56",

                drop:
                    isSpider
                        ? "fragmentoMemoria"
                        : "rubi",

                dropAmount:
                    1,

                dropChance:
                    0.45,

                special:
                    isSpider
                        ? "webShot"
                        : "poisonBurst"
            });
        }


        /*
            Se a luta já tinha começado
            antes de salvar.
        */

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


    /* =====================================================
       MONARCA
    ===================================================== */

    function spawnMonarch(
        withEntrance =
            true
    ) {
        if (
            !state.world.maze ||
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


        const arena =
            state.world
                .maze
                .arena;


        const monarch =
            addEnemy({
                id:
                    "monarch",

                x:
                    arena.x +
                    arena.w /
                    2,

                y:
                    arena.y +
                    arena.h /
                    2 -
                    150,

                name:
                    "O MONARCA",

                icon:
                    "🥷",

                type:
                    "monarch",

                hp:
                    2500,

                damage:
                    52,

                speed:
                    0,

                vision:
                    9999,

                attackRange:
                    9999,

                radius:
                    48,

                color:
                    "#614070",

                aggressive:
                    true,

                accepted:
                    true,

                state:
                    "casting",

                specialTimer:
                    2.2,

                summonTimer:
                    5,

                summonCooldown:
                    6.2,

                hitCounter:
                    0,

                staggerTimer:
                    0,

                stationary:
                    true,

                noLeash:
                    true
            });


        if (
            !monarch
        ) {
            return null;
        }


        monarch.aggressive =
            true;

        monarch.accepted =
            true;


        state.bossBarTarget =
            monarch;


        if (
            withEntrance
        ) {
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
                        "#74408c",

                    life:
                        1.2,

                    maxLife:
                        1.2
                });


            spawnParticles(
                monarch.x,
                monarch.y,

                "#a36bc2",

                45
            );


            shakeScreen(
                14,
                0.45
            );


            showToast(
                "Algo despertou sob o altar..."
            );
        }


        return monarch;
    }


    function summonMonarchClones(
        monarch
    ) {
        if (
            !state.world.maze ||
            monarch.staggerTimer >
                0
        ) {
            return;
        }


        const aliveClones =
            state.world
                .enemies
                .filter(
                    enemy =>
                        enemy.cloneOf ===
                            "monarch" &&
                        !enemy.dead
                );


        const available =
            Math.max(
                0,
                3 -
                aliveClones.length
            );


        if (
            available <=
            0
        ) {
            return;
        }


        const points =
            [
                ...state.world
                    .maze
                    .arenaSpawnPoints
            ]
                .sort(
                    () =>
                        Math.random() -
                        0.5
                );


        const count =
            Math.min(
                available,
                randomInt(
                    2,
                    3
                )
            );


        for (
            let i = 0;
            i <
                count &&
            i <
                points.length;
            i++
        ) {
            const point =
                points[i];


            const clone =
                addEnemy({
                    id:
                        uid(
                            "monarch_clone"
                        ),

                    cloneOf:
                        "monarch",

                    x:
                        point.x,

                    y:
                        point.y,

                    name:
                        "SOMBRA DO MONARCA",

                    icon:
                        "♟️",

                    type:
                        "normal",

                    hp:
                        190,

                    damage:
                        25,

                    speed:
                        92,

                    vision:
                        900,

                    attackRange:
                        60,

                    radius:
                        20,

                    color:
                        "#44334e",

                    dropChance:
                        0,

                    aggressive:
                        true,

                    accepted:
                        true,

                    special:
                        "shadowLunge",

                    noRespawn:
                        true
                });


            if (
                clone
            ) {
                clone.aggressive =
                    true;

                clone.accepted =
                    true;


                state.world
                    .effects
                    .push({
                        type:
                            "shadowSpawn",

                        x:
                            point.x,

                        y:
                            point.y,

                        radius:
                            50,

                        color:
                            "#684783",

                        life:
                            0.75,

                        maxLife:
                            0.75
                    });
            }
        }
    }


    /* =====================================================
       TERRAS SOMBRIAS
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
                    x: 120,
                    y: 1100
                },

                {
                    x: 620,
                    y: 1010
                },

                {
                    x: 1120,
                    y: 1220
                },

                {
                    x: 1680,
                    y: 980
                },

                {
                    x: 2220,
                    y: 1170
                },

                {
                    x: 3070,
                    y: 1090
                }
            ],

            92,

            "shadowTrail"
        );


        for (
            let i = 0;
            i < 44;
            i++
        ) {
            addObstacle(
                seededInt(
                    rng,
                    160,
                    3010
                ),

                seededInt(
                    rng,
                    150,
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
                    72
                ),

                "darkrock"
            );
        }


        for (
            let i = 0;
            i < 42;
            i++
        ) {
            addDecoration(
                i % 6 === 0
                    ? "shadowEye"

                    : i % 3 === 0
                    ? "shadowWhisper"

                    : "darkMist",

                seededInt(
                    rng,
                    180,
                    3020
                ),

                seededInt(
                    rng,
                    160,
                    2030
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
            2700,
            430,

            "Sombra sem Dono",

            "Uma sombra se move sobre a pedra, embora não exista nada acima dela para projetá-la.",

            "◉"
        );


        addNPC(
            740,
            870,

            "NOX",

            "Errante",

            "#756787",

            [
                "Os inimigos daqui avançam rápido. Se você não souber escapar, não durará muito.",

                "As sombras observam o movimento antes de atacar.",

                "O norte da vila não deveria levar a este lugar. Mesmo assim, leva.",

                "Algumas lembranças deixam sombras muito depois de desaparecerem."
            ]
        );


        for (
            let i = 0;
            i < 13;
            i++
        ) {
            addEnemy({
                id:
                    `shadow_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        430,
                        2760
                    ),

                y:
                    seededInt(
                        rng,
                        280,
                        1900
                    ),

                name:
                    i % 3 === 0
                        ? "CAÇADOR SOMBRIO"
                        : "ECO ESQUECIDO",

                icon:
                    i % 3 === 0
                        ? "🥷"
                        : "👤",

                type:
                    "normal",

                hp:
                    i % 3 === 0
                        ? 330
                        : 285,

                damage:
                    i % 3 === 0
                        ? 40
                        : 34,

                speed:
                    i % 3 === 0
                        ? 105
                        : 86,

                vision:
                    320,

                attackRange:
                    72,

                radius:
                    24,

                color:
                    i % 3 === 0
                        ? "#46384e"
                        : "#30344d",

                drop:
                    "essencia",

                dropAmount:
                    1,

                dropChance:
                    0.5,

                special:
                    "dash"
            });
        }


        addEnemy({
            id:
                "fairy_guardian",

            x:
                2810,

            y:
                1090,

            name:
                "GUARDIÃO SOMBRIO",

            icon:
                "🌑",

            type:
                "progression",

            hp:
                1350,

            damage:
                54,

            speed:
                88,

            vision:
                430,

            attackRange:
                100,

            radius:
                43,

            color:
                "#39334d",

            drop:
                "fragmentoMemoria",

            dropAmount:
                4,

            unlock:
                "fairy",

            special:
                "dashBoss"
        });


        addPortal(
            3070,
            980,

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
       REINO DAS FADAS
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
                    x: 120,
                    y: 1100
                },

                {
                    x: 650,
                    y: 1040
                },

                {
                    x: 1190,
                    y: 1200
                },

                {
                    x: 1720,
                    y: 990
                },

                {
                    x: 2280,
                    y: 1160
                },

                {
                    x: 3070,
                    y: 1080
                }
            ],

            96,

            "fairyTrail"
        );


        for (
            let i = 0;
            i < 55;
            i++
        ) {
            addDecoration(
                i % 7 === 0
                    ? "fairyLamp"

                    : i % 4 === 0
                    ? "flowerPatch"

                    : "fairySpark",

                seededInt(
                    rng,
                    160,
                    3020
                ),

                seededInt(
                    rng,
                    150,
                    2040
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
            i < 30;
            i++
        ) {
            addTree(
                seededInt(
                    rng,
                    190,
                    2970
                ),

                seededInt(
                    rng,
                    180,
                    2010
                ),

                `fairy_tree_${i}`
            );
        }


        for (
            let i = 0;
            i < 10;
            i++
        ) {
            addEnemy({
                id:
                    `fairy_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        430,
                        2700
                    ),

                y:
                    seededInt(
                        rng,
                        280,
                        1880
                    ),

                name:
                    i % 2
                        ? "FADA CORROMPIDA"
                        : "VESPA FEÉRICA",

                icon:
                    i % 2
                        ? "🧚"
                        : "🐝",

                type:
                    "normal",

                hp:
                    i % 2
                        ? 320
                        : 250,

                damage:
                    i % 2
                        ? 38
                        : 32,

                speed:
                    i % 2
                        ? 100
                        : 120,

                vision:
                    320,

                attackRange:
                    i % 2
                        ? 170
                        : 70,

                radius:
                    22,

                color:
                    i % 2
                        ? "#866098"
                        : "#b59a58",

                drop:
                    "cristal",

                dropAmount:
                    1,

                dropChance:
                    0.55,

                special:
                    i % 2
                        ? "fairyShot"
                        : "dash"
            });
        }


        addEnemy({
            id:
                "sky_guardian",

            x:
                2820,

            y:
                1080,

            name:
                "GUARDIÃ DOS FIOS",

            icon:
                "🧚",

            type:
                "progression",

            hp:
                1550,

            damage:
                58,

            speed:
                96,

            vision:
                450,

            attackRange:
                170,

            radius:
                43,

            color:
                "#a677ba",

            drop:
                "fragmentoMemoria",

            dropAmount:
                5,

            unlock:
                "sky",

            special:
                "dashBoss"
        });


        addPortal(
            3070,
            970,

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
                    x: 120,
                    y: 1090
                },

                {
                    x: 720,
                    y: 1030
                },

                {
                    x: 1370,
                    y: 1190
                },

                {
                    x: 1980,
                    y: 980
                },

                {
                    x: 2600,
                    y: 1110
                },

                {
                    x: 3280,
                    y: 1090
                }
            ],

            105,

            "skyBridge"
        );


        for (
            let i = 0;
            i < 36;
            i++
        ) {
            addDecoration(
                i % 6 === 0
                    ? "celestialPillar"

                    : i % 4 === 0
                    ? "skyRune"

                    : "cloud",

                seededInt(
                    rng,
                    160,
                    3260
                ),

                seededInt(
                    rng,
                    140,
                    2040
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


        addTrial(
            1670,
            1080,

            "sky_trial",

            "PROVA DOS CINCO ECOS",

            {
                skyTrial:
                    true,

                radius:
                    46
            }
        );


        for (
            let i = 0;
            i < 8;
            i++
        ) {
            addEnemy({
                id:
                    `sky_enemy_${i}`,

                x:
                    seededInt(
                        rng,
                        520,
                        2780
                    ),

                y:
                    seededInt(
                        rng,
                        320,
                        1840
                    ),

                name:
                    "VIGIA CELESTIAL",

                icon:
                    "🪽",

                type:
                    "normal",

                hp:
                    365,

                damage:
                    42,

                speed:
                    96,

                vision:
                    340,

                attackRange:
                    160,

                radius:
                    24,

                color:
                    "#b7cad6",

                drop:
                    "cristal",

                dropAmount:
                    1,

                dropChance:
                    0.55,

                special:
                    "skyShot"
            });
        }


        if (
            state.player
                .skyTrial
                ?.complete
        ) {
            addEnemy({
                id:
                    "path_guardian",

                x:
                    2820,

                y:
                    1090,

                name:
                    "GUARDIÃO DO CAMINHO",

                icon:
                    "🪽",

                type:
                    "progression",

                hp:
                    1900,

                damage:
                    62,

                speed:
                    92,

                vision:
                    500,

                attackRange:
                    130,

                radius:
                    46,

                color:
                    "#c7d3dc",

                drop:
                    "flautaMemoria",

                dropAmount:
                    1,

                special:
                    "dashBoss"
            });
        }


        /*
            Portal do Inferno existe,
            mas só aparece após a flauta.
        */

        addPortal(
            3230,
            970,

            80,
            240,

            "hell",

            () =>
                Boolean(
                    state.player
                        .flutePlayed
                ),

            "PASSAGEM ESQUECIDA",

            {
                arrivalSide:
                    "left",

                visible:
                    () =>
                        Boolean(
                            state.player
                                .flutePlayed
                        )
            }
        );
    }


    /* =====================================================
       CINCO HORDAS
    ===================================================== */

    function startSkyTrial() {
        const trial =
            state.player
                .skyTrial;


        if (
            !trial ||
            trial.complete
        ) {
            showToast(
                "A prova já foi concluída."
            );

            return;
        }


        if (
            trial.activeWave >
            0
        ) {
            showToast(
                "Uma horda ainda está ativa."
            );

            return;
        }


        trial.started =
            true;


        trial.wave =
            Math.max(
                0,
                trial.wave ||
                0
            );


        spawnSkyWave(
            trial.wave +
            1
        );
    }


    function spawnSkyWave(
        wave
    ) {
        const trial =
            state.player
                .skyTrial;


        if (
            !trial ||
            wave >
            5
        ) {
            return;
        }


        trial.activeWave =
            wave;


        const count =
            3 +
            wave;


        for (
            let i = 0;
            i < count;
            i++
        ) {
            const angle =
                Math.PI *
                2 *
                i /
                count;


            const enemy =
                addEnemy({
                    id:
                        `sky_wave_${wave}_${i}_${Date.now()}`,

                    hordeWave:
                        wave,

                    x:
                        1670 +
                        Math.cos(
                            angle
                        ) *
                        (
                            250 +
                            wave *
                            20
                        ),

                    y:
                        1080 +
                        Math.sin(
                            angle
                        ) *
                        (
                            210 +
                            wave *
                            18
                        ),

                    name:
                        `ECO CELESTIAL ${wave}`,

                    icon:
                        "☁️",

                    type:
                        "horde",

                    hp:
                        150 +
                        wave *
                        65,

                    damage:
                        20 +
                        wave *
                        7,

                    speed:
                        72 +
                        wave *
                        5,

                    vision:
                        900,

                    attackRange:
                        65,

                    radius:
                        21 +
                        wave,

                    color:
                        "#a8c6d5",

                    drop:
                        "cristal",

                    dropAmount:
                        1,

                    dropChance:
                        0.35,

                    noRespawn:
                        true,

                    aggressive:
                        true,

                    accepted:
                        true,

                    special:
                        wave >= 3
                            ? "dash"
                            : null
                });


            if (
                enemy
            ) {
                enemy.aggressive =
                    true;

                enemy.accepted =
                    true;
            }
        }


        showToast(
            `Horda ${wave}/5 iniciada.`
        );
    }


    function updateSkyTrial() {
        if (
            state.area !==
                "sky" ||
            !state.player
                ?.skyTrial
                ?.started
        ) {
            return;
        }


        const trial =
            state.player
                .skyTrial;


        if (
            trial.complete ||
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
                        enemy.hordeWave ===
                            trial.activeWave &&
                        !enemy.dead
                );


        if (
            alive
        ) {
            return;
        }


        trial.wave =
            Math.max(
                trial.wave,
                trial.activeWave
            );


        trial.activeWave =
            0;


        if (
            trial.wave >=
            5
        ) {
            trial.complete =
                true;


            showToast(
                "As cinco hordas foram vencidas. Algo se aproxima..."
            );


            if (
                !hasDefeatedBoss(
                    "path_guardian"
                )
            ) {
                addEnemy({
                    id:
                        "path_guardian",

                    x:
                        2820,

                    y:
                        1090,

                    name:
                        "GUARDIÃO DO CAMINHO",

                    icon:
                        "🪽",

                    type:
                        "progression",

                    hp:
                        1900,

                    damage:
                        62,

                    speed:
                        92,

                    vision:
                        500,

                    attackRange:
                        130,

                    radius:
                        46,

                    color:
                        "#c7d3dc",

                    drop:
                        "flautaMemoria",

                    dropAmount:
                        1,

                    special:
                        "dashBoss"
                });
            }

            return;
        }


        state.hordeNextAt =
            state.time +
            2;


        setTimeout(
            () => {
                if (
                    state.running &&
                    state.area ===
                        "sky" &&

                    state.player
                        ?.skyTrial &&

                    !state.player
                        .skyTrial
                        .complete &&

                    state.player
                        .skyTrial
                        .activeWave ===
                        0
                ) {
                    spawnSkyWave(
                        state.player
                            .skyTrial
                            .wave +
                        1
                    );
                }
            },

            1500
        );
    }


    /* =====================================================
       INFERNO
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
                    x: 120,
                    y: 1200
                },

                {
                    x: 760,
                    y: 1070
                },

                {
                    x: 1370,
                    y: 1300
                },

                {
                    x: 1990,
                    y: 1040
                },

                {
                    x: 2700,
                    y: 1250
                },

                {
                    x: 3500,
                    y: 1180
                }
            ],

            105,

            "hellRoad"
        );


        for (
            let i = 0;
            i < 55;
            i++
        ) {
            addObstacle(
                seededInt(
                    rng,
                    160,
                    3440
                ),

                seededInt(
                    rng,
                    160,
                    2240
                ),

                seededInt(
                    rng,
                    48,
                    105
                ),

                seededInt(
                    rng,
                    38,
                    80
                ),

                i % 4 === 0
                    ? "obsidian"
                    : "basalt"
            );
        }


        for (
            let i = 0;
            i < 45;
            i++
        ) {
            addDecoration(
                i % 5 === 0
                    ? "lavaPool"

                    : i % 3 === 0
                    ? "hellSmoke"

                    : "emberVent",

                seededInt(
                    rng,
                    180,
                    3400
                ),

                seededInt(
                    rng,
                    170,
                    2200
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


        const hellTypes = [
            {
                key:
                    "imp",

                name:
                    "DIABRETE",

                icon:
                    "👺",

                hp:
                    360,

                damage:
                    42,

                speed:
                    102,

                special:
                    "dash"
            },

            {
                key:
                    "hound",

                name:
                    "CÃO INFERNAL",

                icon:
                    "🐕",

                hp:
                    420,

                damage:
                    48,

                speed:
                    115,

                special:
                    "dash"
            },

            {
                key:
                    "mage",

                name:
                    "MAGO DE CINZAS",

                icon:
                    "🧙",

                hp:
                    340,

                damage:
                    45,

                speed:
                    70,

                special:
                    "fireShot"
            },

            {
                key:
                    "brute",

                name:
                    "BRUTO DE BASALTO",

                icon:
                    "👹",

                hp:
                    590,

                damage:
                    62,

                speed:
                    58,

                special:
                    "rockStorm"
            },

            {
                key:
                    "wraith",

                name:
                    "ESPECTRO ARDENTE",

                icon:
                    "👻",

                hp:
                    390,

                damage:
                    52,

                speed:
                    95,

                special:
                    "shadowLunge"
            }
        ];


        for (
            let i = 0;
            i < 20;
            i++
        ) {
            const template =
                hellTypes[
                    i %
                    hellTypes.length
                ];


            addEnemy({
                id:
                    `hell_${template.key}_${i}`,

                hellType:
                    template.key,

                x:
                    seededInt(
                        rng,
                        430,
                        3050
                    ),

                y:
                    seededInt(
                        rng,
                        300,
                        2050
                    ),

                name:
                    template.name,

                icon:
                    template.icon,

                type:
                    "hell",

                hp:
                    template.hp,

                damage:
                    template.damage,

                speed:
                    template.speed,

                vision:
                    360,

                attackRange:
                    template.key ===
                        "mage"

                        ? 180
                        : 78,

                radius:
                    template.key ===
                        "brute"

                        ? 31
                        : 24,

                color:
                    "#7a3a33",

                drop:
                    "essencia",

                dropAmount:
                    1,

                dropChance:
                    0.62,

                special:
                    template.special
            });
        }


        addEnemy({
            id:
                "hell_resource_boss",

            x:
                2100,

            y:
                520,

            name:
                "COLOSSO DE CINZAS",

            icon:
                "🔥",

            type:
                "resourceBoss",

            hp:
                1650,

            damage:
                68,

            speed:
                53,

            vision:
                390,

            attackRange:
                102,

            radius:
                44,

            color:
                "#78362f",

            drop:
                "rubi",

            dropAmount:
                5,

            respawnTime:
                110,

            special:
                "fireRain"
        });


        addEnemy({
            id:
                "final_gate_guardian",

            x:
                3190,

            y:
                1180,

            name:
                "GUARDIÃO SUPREMO DO INFERNO",

            icon:
                "👿",

            type:
                "progression",

            hp:
                2600,

            damage:
                72,

            speed:
                82,

            vision:
                520,

            attackRange:
                115,

            radius:
                48,

            color:
                "#7d302d",

            drop:
                "essencia",

            dropAmount:
                8,

            unlock:
                "final",

            special:
                "hellBoss"
        });


        addPortal(
            3460,
            1060,

            70,
            240,

            "final",

            () => {
                const defeatedKinds =
                    Object
                        .keys(
                            state.player
                                .hellTypesDefeated ||
                            {}
                        )
                        .filter(
                            key =>
                                state.player
                                    .hellTypesDefeated[
                                        key
                                    ]
                        );


                return (
                    defeatedKinds.length >=
                        5 &&

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
       FINAL
    ===================================================== */

    function buildFinal() {
        for (
            let i = 0;
            i < 14;
            i++
        ) {
            addDecoration(
                "finalRune",

                300 +
                    (
                        i % 7
                    ) *
                    265,

                250 +
                    Math.floor(
                        i / 7
                    ) *
                    950,

                {
                    phase:
                        i
                }
            );
        }


        if (
            !state.player
                .finalDefeated &&

            state.player
                .finalChoice !==
                "join"
        ) {
            addEnemy({
                id:
                    "other_self",

                x:
                    1670,

                y:
                    750,

                name:
                    "O OUTRO EU",

                icon:
                    "☯",

                type:
                    "final",

                hp:
                    3300,

                damage:
                    78,

                speed:
                    93,

                vision:
                    9999,

                attackRange:
                    105,

                radius:
                    48,

                color:
                    state.player
                        .color,

                aggressive:
                    false,

                accepted:
                    false,

                special:
                    "mirror"
            });
        }
    }


    /* =====================================================
       COLISÃO
    ===================================================== */

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


    function activeObstacleBlocks(
        obstacle
    ) {
        if (
            obstacle.type ===
                "tree" &&
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

            return Boolean(
                tree
                    ?.alive
            );
        }

        return true;
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
            state.houseMode
        ) {
            const room =
                getHouseRoom();


            if (
                x - radius <
                    room.x +
                    12 ||

                y - radius <
                    room.y +
                    12 ||

                x + radius >
                    room.x +
                    room.w -
                    12 ||

                y + radius >
                    room.y +
                    room.h -
                    12
            ) {
                return false;
            }


            for (
                const furniture of
                getHouseFurniture()
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


        if (
            x - radius <
                0 ||

            y - radius <
                0 ||

            x + radius >
                state.world
                    .width ||

            y + radius >
                state.world
                    .height
        ) {
            return false;
        }


        for (
            const obstacle of
            state.world
                .obstacles
        ) {
            if (
                !activeObstacleBlocks(
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


        /* PORTÕES FECHADOS */

        for (
            const gate of
            state.world
                .gates
        ) {
            if (
                state.player
                    ?.gateUnlocks
                    ?.[gate.side]
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
                return false;
            }
        }

        return true;
    }


    function canEnemyMoveTo(
        x,
        y,
        radius =
            20
    ) {
        if (
            x - radius <
                70 ||

            y - radius <
                70 ||

            x + radius >
                state.world
                    .width -
                    70 ||

            y + radius >
                state.world
                    .height -
                    70
        ) {
            return false;
        }


        for (
            const obstacle of
            state.world
                .obstacles
        ) {
            if (
                !activeObstacleBlocks(
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


    /* =====================================================
       CASAS
    ===================================================== */

    function getHouseRoom() {
        return {
            x: 900,
            y: 520,

            w: 1400,
            h: 980
        };
    }


    function getHouseTheme() {
        const themes = {
            home: {
                wall:
                    "#4b342b",

                floor:
                    "#9a7452",

                trim:
                    "#d8b87a",

                accent:
                    "#efb05b"
            },

            elianHome: {
                wall:
                    "#3f3831",

                floor:
                    "#856a50",

                trim:
                    "#cab07e",

                accent:
                    "#6d8790"
            },

            forge: {
                wall:
                    "#292b2f",

                floor:
                    "#55504a",

                trim:
                    "#a39789",

                accent:
                    "#ff8149"
            },

            shop: {
                wall:
                    "#3e2e28",

                floor:
                    "#8c6847",

                trim:
                    "#e0bc75",

                accent:
                    "#e8c56f"
            },

            woodshop: {
                wall:
                    "#453225",

                floor:
                    "#a0784f",

                trim:
                    "#d9b276",

                accent:
                    "#d89c55"
            }
        };


        return (
            themes[
                state.currentHouse
                    ?.id
            ] ||
            themes.home
        );
    }


    function getHouseFurniture() {
        if (
            !state.currentHouse
        ) {
            return [];
        }


        const room =
            getHouseRoom();


        const id =
            state.currentHouse
                .id;


        const list =
            [];


        const push = (
            name,
            x,
            y,
            w,
            h,
            extra = {}
        ) => {
            list.push({
                name,
                x,
                y,
                w,
                h,

                ...extra
            });
        };


        if (
            id ===
            "home"
        ) {
            push(
                "bed",

                room.x +
                    70,

                room.y +
                    70,

                230,
                150,

                {
                    sleep:
                        true
                }
            );


            push(
                "table",

                room.x +
                    540,

                room.y +
                    360,

                210,
                120
            );


            push(
                "chest",

                room.x +
                    room.w -
                    190,

                room.y +
                    80,

                120,
                90
            );


            push(
                "bookshelf",

                room.x +
                    room.w -
                    160,

                room.y +
                    290,

                105,
                280
            );
        }


        else if (
            id ===
            "elianHome"
        ) {
            push(
                "bed",

                room.x +
                    70,

                room.y +
                    70,

                210,
                140
            );


            push(
                "desk",

                room.x +
                    520,

                room.y +
                    320,

                240,
                110
            );


            push(
                "bookshelf",

                room.x +
                    room.w -
                    180,

                room.y +
                    60,

                120,
                300
            );
        }


        else if (
            id ===
            "forge"
        ) {
            push(
                "furnace",

                room.x +
                    60,

                room.y +
                    70,

                210,
                190
            );


            push(
                "anvil",

                room.x +
                    room.w /
                    2 -
                    90,

                room.y +
                    room.h /
                    2 -
                    70,

                180,
                150
            );


            push(
                "workbench",

                room.x +
                    room.w -
                    360,

                room.y +
                    80,

                280,
                110
            );


            push(
                "oreCrate",

                room.x +
                    room.w -
                    190,

                room.y +
                    room.h -
                    210,

                120,
                110
            );
        }


        else if (
            id ===
            "shop"
        ) {
            push(
                "shopShelf",

                room.x +
                    55,

                room.y +
                    55,

                150,
                300
            );


            push(
                "shopShelf",

                room.x +
                    room.w -
                    205,

                room.y +
                    55,

                150,
                300
            );


            push(
                "counter",

                room.x +
                    400,

                room.y +
                    270,

                600,
                110
            );


            push(
                "crate",

                room.x +
                    90,

                room.y +
                    room.h -
                    220,

                120,
                105
            );
        }


        else if (
            id ===
            "woodshop"
        ) {
            push(
                "workbench",

                room.x +
                    390,

                room.y +
                    270,

                610,
                120
            );


            push(
                "logStack",

                room.x +
                    70,

                room.y +
                    80,

                170,
                260
            );


            push(
                "boardStack",

                room.x +
                    room.w -
                    240,

                room.y +
                    70,

                160,
                280
            );
        }


        return list;
    }


    function getInteriorNPCs() {
        if (
            !state.houseMode ||
            !state.currentHouse
        ) {
            return [];
        }


        const room =
            getHouseRoom();


        const configs = {
            elianHome: {
                key:
                    "ELIAN",

                dx:
                    0.72,

                dy:
                    0.44
            },

            forge: {
                key:
                    "BORIN",

                dx:
                    0.76,

                dy:
                    0.49
            },

            shop: {
                key:
                    "DORAN",

                dx:
                    0.70,

                dy:
                    0.25
            },

            woodshop: {
                key:
                    "BRAN",

                dx:
                    0.76,

                dy:
                    0.44
            }
        };


        const config =
            configs[
                state.currentHouse
                    .id
            ];


        if (
            !config
        ) {
            return [];
        }


        const template =
            NPC_LIBRARY[
                config.key
            ];


        return [
            {
                id:
                    `inside_${state.currentHouse.id}_${config.key}`,

                x:
                    room.x +
                    room.w *
                    config.dx,

                y:
                    room.y +
                    room.h *
                    config.dy,

                radius:
                    17,

                interior:
                    true,

                ...template
            }
        ];
    }


    function getSleepTarget() {
        if (
            !state.houseMode
        ) {
            return null;
        }


        const bed =
            getHouseFurniture()
                .find(
                    item =>
                        item.sleep
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
            70;


        state.keys.clear();


        updateCamera();
    }


    /* =====================================================
       MOVIMENTO
    ===================================================== */

    function updateMovement(dt) {
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
            !dx &&
            !dy
        ) {
            return;
        }


        const normal =
            normalizeVector(
                dx,
                dy
            );


        let speed =
            player.speed;


        if (
            player.hunger <=
                0 ||
            player.fatigue <=
                0
        ) {
            speed *=
                0.66;
        }


        if (
            player.adaptiveBuff
        ) {
            speed *=
                1.12;
        }


        const mx =
            normal.x *
            speed *
            dt;


        const my =
            normal.y *
            speed *
            dt;


        if (
            canPlayerMoveTo(
                player.x +
                mx,

                player.y,

                player.radius
            )
        ) {
            player.x +=
                mx;
        }


        if (
            canPlayerMoveTo(
                player.x,

                player.y +
                my,

                player.radius
            )
        ) {
            player.y +=
                my;
        }
    }


    /* =====================================================
       FOME / CANSAÇO
    ===================================================== */

    function updateSurvival(dt) {
        const player =
            state.player;


        if (
            !player ||
            player.dead
        ) {
            return;
        }


        const hungerDrain =
            0.16 *
            dt;


        const fatigueDrain =
            0.11 *
            dt;


        player.hunger =
            Math.max(
                0,

                player.hunger -
                hungerDrain
            );


        player.fatigue =
            Math.max(
                0,

                player.fatigue -
                fatigueDrain
            );


        player.magic =
            Math.min(
                player.maxMagic,

                player.magic +
                2.4 *
                dt
            );


        player.energy =
            Math.min(
                player.maxEnergy,

                player.energy +
                3.1 *
                dt
            );


        if (
            player.hunger <=
                0 ||
            player.fatigue <=
                0
        ) {
            player.survivalTick =
                (
                    player.survivalTick ||
                    0
                ) +
                dt;


            if (
                player.survivalTick >=
                3.5
            ) {
                player.survivalTick =
                    0;


                damagePlayer(
                    2,

                    {
                        survival:
                            true
                    }
                );
            }
        }

        else {
            player.survivalTick =
                0;
        }
    }


    /* =====================================================
       COOLDOWNS
    ===================================================== */

    function updateCooldowns(dt) {
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

                (
                    player.attackCooldown ||
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


        player.invincible =
            Math.max(
                0,

                (
                    player.invincible ||
                    0
                ) -
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


        for (
            const key of
            [
                "q",
                "r",
                "f"
            ]
        ) {
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


        if (
            player.adaptiveTimer >
            0
        ) {
            player.adaptiveTimer -=
                dt;


            if (
                player.adaptiveTimer <=
                0
            ) {
                player.adaptiveBuff =
                    false;
            }
        }


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


        /* TELA VERMELHA */

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


    /* =====================================================
       DASH DO PLAYER
    ===================================================== */

    function useDashAbility() {
        const player =
            state.player;


        if (
            !player ||
            state.paused ||
            isGameplayOverlayOpen()
        ) {
            return;
        }


        if (
            !player.abilities
                ?.dash
        ) {
            showToast(
                "Você ainda não domina o Dash."
            );

            return;
        }


        if (
            player.dashCooldown >
                0 ||
            player.playerDash
        ) {
            return;
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


        player.playerDash = {
            dx:
                direction.x,

            dy:
                direction.y,

            remaining:
                220,

            speed:
                930
        };


        player.dashCooldown =
            2.35;


        player.invincible =
            Math.max(
                player.invincible,
                0.2
            );


        player.energy =
            Math.max(
                0,

                player.energy -
                4
            );


        state.world
            .effects
            .push({
                type:
                    "dashAfterimage",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    player.radius,

                color:
                    getCharacterPalette()
                        .glow,

                life:
                    0.28,

                maxLife:
                    0.28
            });
    }


    function updatePlayerDash(dt) {
        const player =
            state.player;


        const dash =
            player
                ?.playerDash;


        if (
            !player ||
            !dash
        ) {
            return;
        }


        const amount =
            Math.min(
                dash.remaining,

                dash.speed *
                dt
            );


        const steps =
            Math.max(
                1,

                Math.ceil(
                    amount /
                    16
                )
            );


        const step =
            amount /
            steps;


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
                    ny,
                    player.radius
                )
            ) {
                dash.remaining =
                    0;

                break;
            }


            player.x =
                nx;


            player.y =
                ny;


            dash.remaining -=
                step;
        }


        if (
            Math.random() <
            0.75
        ) {
            state.world
                .effects
                .push({
                    type:
                        "dashAfterimage",

                    x:
                        player.x -
                        dash.dx *
                        22,

                    y:
                        player.y -
                        dash.dy *
                        22,

                    radius:
                        player.radius,

                    color:
                        getCharacterPalette()
                            .main,

                    life:
                        0.2,

                    maxLife:
                        0.2
                });
        }


        if (
            dash.remaining <=
            0
        ) {
            player.playerDash =
                null;
        }
    }


    /* =====================================================
       ATAQUE BÁSICO
    ===================================================== */

    function findNearestEnemy(
        x,
        y,
        range = 110
    ) {
        let best =
            null;

        let bestDistance =
            range;


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


            const d =
                Math.hypot(
                    enemy.x -
                    x,

                    enemy.y -
                    y
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


    function attackDamage(
        multiplier =
            1
    ) {
        const player =
            state.player;


        const weapon =
            ITEMS[
                player
                    .equipment
                    ?.weapon
            ];


        const weaponDamage =
            weapon
                ?.damage ||
            0;


        return Math.max(
            1,

            Math.round(
                (
                    player.damage +
                    weaponDamage
                ) *
                multiplier
            )
        );
    }


    function performAttack(
        target = null
    ) {
        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            state.paused ||
            isGameplayOverlayOpen()
        ) {
            return;
        }


        if (
            player.attackCooldown >
                0 ||
            player.stunTimer >
                0
        ) {
            return;
        }


        const tx =
            target
                ?.x ??
            state.pointer
                .worldX;


        const ty =
            target
                ?.y ??
            state.pointer
                .worldY;


        const direction =
            normalizeVector(
                tx -
                player.x,

                ty -
                player.y
            );


        const angle =
            Math.atan2(
                direction.y,
                direction.x
            );


        const character =
            player.characterId;


        const palette =
            getCharacterPalette();


        player.attackCooldown =
            character ===
            "lirael"

                ? 0.32

                : character ===
                  "grumgar"

                ? 0.62

                : 0.45;


        /*
            MAGO E FADA:
            projétil.
        */

        if (
            character ===
                "kaelion" ||
            character ===
                "lirael"
        ) {
            const range =
                character ===
                "kaelion"

                    ? 300

                    : 275;


            const projectile = {
                type:
                    character ===
                        "kaelion"

                        ? "playerProjectile"

                        : "fairyShot",

                x:
                    player.x,

                y:
                    player.y,

                vx:
                    direction.x *
                    520,

                vy:
                    direction.y *
                    520,

                radius:
                    character ===
                        "kaelion"

                        ? 9

                        : 7,

                damage:
                    attackDamage(
                        character ===
                            "kaelion"

                            ? 0.82

                            : 0.74
                    ),

                color:
                    palette.main,

                glow:
                    palette.glow,

                life:
                    range /
                    520,

                maxLife:
                    range /
                    520,

                playerOwned:
                    true,

                hit:
                    new Set(),

                countsForMonarch:
                    true
            };


            state.world
                .effects
                .push(
                    projectile
                );


            return;
        }


        /*
            CORPO A CORPO.
        */

        const range =
            character ===
            "grumgar"

                ? 92

                : 82;


        const targetEnemy =
            findNearestEnemy(
                player.x +
                    direction.x *
                    range *
                    0.72,

                player.y +
                    direction.y *
                    range *
                    0.72,

                range *
                0.8
            );


        state.world
            .effects
            .push({
                type:
                    character ===
                        "grumgar"

                        ? "smashArc"

                        : character ===
                          "zephyr"

                        ? "clawArc"

                        : "bladeArc",

                x:
                    player.x,

                y:
                    player.y,

                angle,

                radius:
                    range,

                color:
                    palette.main,

                life:
                    0.22,

                maxLife:
                    0.22
            });


        if (
            targetEnemy
        ) {
            attackEnemy(
                targetEnemy,

                attackDamage(
                    character ===
                        "grumgar"

                        ? 1.05

                        : 0.92
                ),

                {
                    landedHit:
                        true,

                    source:
                        "basic"
                }
            );
        }
    }


    /* =====================================================
       HABILIDADES
    ===================================================== */

    function enemiesInRadius(
        x,
        y,
        radius
    ) {
        return (
            state.world
                .enemies
                .filter(
                    enemy =>
                        !enemy.dead &&
                        Math.hypot(
                            enemy.x -
                            x,

                            enemy.y -
                            y
                        ) <=
                        radius +
                        enemy.radius
                )
        );
    }


    function useSkill(slot) {
        const player =
            state.player;


        if (
            !player ||
            player.dead ||
            state.paused ||
            isGameplayOverlayOpen()
        ) {
            return;
        }


        const skills =
            getCharacterSkills();


        const skill =
            skills[
                slot
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
                `${skill.name} libera no nível ${skill.level}.`
            );

            return;
        }


        if (
            (
                player
                    .skillCooldowns[
                        slot
                    ] ||
                0
            ) >
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


        if (
            skill.costMagic
        ) {
            player.magic -=
                skill.costMagic;
        }


        if (
            skill.costEnergy
        ) {
            player.energy -=
                skill.costEnergy;
        }


        player
            .skillCooldowns[
                slot
            ] =
            skill.cooldown;


        const handlers = {
            kaelion:
                useKaelionSkill,

            theron:
                useTheronSkill,

            grumgar:
                useGrumgarSkill,

            lirael:
                useLiraelSkill,

            zephyr:
                useZephyrSkill
        };


        handlers[
            player.characterId
        ]?.(
            slot
        );
    }


    /* =====================================================
       KAELION
    ===================================================== */

    function useKaelionSkill(
        slot
    ) {
        const player =
            state.player;


        const palette =
            getCharacterPalette();


        const direction =
            normalizeVector(
                state.pointer
                    .worldX -
                player.x,

                state.pointer
                    .worldY -
                player.y
            );


        if (
            slot ===
            "q"
        ) {
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
                        player.x +
                        direction.x *
                        430,

                    ty:
                        player.y +
                        direction.y *
                        430,

                    vx:
                        direction.x *
                        430,

                    vy:
                        direction.y *
                        430,

                    radius:
                        16,

                    damage:
                        attackDamage(
                            1.3
                        ),

                    color:
                        palette.main,

                    glow:
                        palette.glow,

                    life:
                        0.95,

                    maxLife:
                        0.95,

                    playerOwned:
                        true,

                    hit:
                        new Set(),

                    countsForMonarch:
                        true
                });
        }


        else if (
            slot ===
            "r"
        ) {
            const radius =
                190;


            state.world
                .effects
                .push({
                    type:
                        "skillRing",

                    x:
                        player.x,

                    y:
                        player.y,

                    radius,

                    color:
                        palette.secondary,

                    life:
                        0.65,

                    maxLife:
                        0.65
                });


            for (
                const enemy of
                enemiesInRadius(
                    player.x,
                    player.y,
                    radius
                )
            ) {
                attackEnemy(
                    enemy,

                    attackDamage(
                        1.12
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );
            }
        }


        else {
            for (
                let i = 0;
                i < 8;
                i++
            ) {
                const angle =
                    Math.PI *
                    2 *
                    i /
                    8;


                const x =
                    player.x +
                    Math.cos(
                        angle
                    ) *
                    210;


                const y =
                    player.y +
                    Math.sin(
                        angle
                    ) *
                    210;


                addHazard(
                    x,
                    y,

                    70,

                    0.45 +
                        i *
                        0.03,

                    attackDamage(
                        0.95
                    ),

                    {
                        playerOwned:
                            true,

                        kind:
                            "memoryStorm",

                        color:
                            "#9f74d0"
                    }
                );
            }
        }
    }


    /* =====================================================
       THERON
    ===================================================== */

    function useTheronSkill(
        slot
    ) {
        const player =
            state.player;


        const palette =
            getCharacterPalette();


        if (
            slot ===
            "q"
        ) {
            const direction =
                normalizeVector(
                    state.pointer
                        .worldX -
                    player.x,

                    state.pointer
                        .worldY -
                    player.y
                );


            const target =
                findNearestEnemy(
                    player.x +
                        direction.x *
                        75,

                    player.y +
                        direction.y *
                        75,

                    80
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
                            direction.y,
                            direction.x
                        ),

                    radius:
                        110,

                    heavy:
                        true,

                    color:
                        palette.main,

                    life:
                        0.32,

                    maxLife:
                        0.32
                });


            if (
                target
            ) {
                attackEnemy(
                    target,

                    attackDamage(
                        1.65
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );
            }
        }


        else if (
            slot ===
            "r"
        ) {
            player.shieldTimer =
                5;


            player.damageReduction =
                0.42;


            state.world
                .effects
                .push({
                    type:
                        "shieldAura",

                    color:
                        palette.glow,

                    life:
                        5,

                    maxLife:
                        5
                });
        }


        else {
            player.shieldTimer =
                7;


            player.damageReduction =
                0.55;


            for (
                const enemy of
                enemiesInRadius(
                    player.x,
                    player.y,
                    145
                )
            ) {
                attackEnemy(
                    enemy,

                    attackDamage(
                        1.05
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );


                enemy.stunTimer =
                    Math.max(
                        enemy.stunTimer ||
                        0,

                        1.25
                    );
            }


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
                        150,

                    color:
                        "#e9dfc2",

                    life:
                        0.8,

                    maxLife:
                        0.8
                });
        }
    }


    /* =====================================================
       GRUMGAR
    ===================================================== */

    function useGrumgarSkill(
        slot
    ) {
        const player =
            state.player;


        if (
            slot ===
            "q"
        ) {
            const radius =
                125;


            for (
                const enemy of
                enemiesInRadius(
                    player.x,
                    player.y,
                    radius
                )
            ) {
                attackEnemy(
                    enemy,

                    attackDamage(
                        1.7
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );


                enemy.stunTimer =
                    Math.max(
                        enemy.stunTimer ||
                        0,

                        0.55
                    );
            }


            state.world
                .effects
                .push({
                    type:
                        "groundCrack",

                    x:
                        player.x,

                    y:
                        player.y,

                    radius,

                    color:
                        "#8b7049",

                    life:
                        0.6,

                    maxLife:
                        0.6
                });


            shakeScreen(
                9,
                0.25
            );
        }


        else if (
            slot ===
            "r"
        ) {
            const radius =
                190;


            for (
                const enemy of
                enemiesInRadius(
                    player.x,
                    player.y,
                    radius
                )
            ) {
                enemy.stunTimer =
                    Math.max(
                        enemy.stunTimer ||
                        0,

                        1.5
                    );


                attackEnemy(
                    enemy,

                    attackDamage(
                        0.55
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );
            }


            state.world
                .effects
                .push({
                    type:
                        "roarWave",

                    x:
                        player.x,

                    y:
                        player.y,

                    radius,

                    color:
                        "#a4b875",

                    life:
                        0.85,

                    maxLife:
                        0.85
                });
        }


        else {
            for (
                const enemy of
                enemiesInRadius(
                    player.x,
                    player.y,
                    245
                )
            ) {
                attackEnemy(
                    enemy,

                    attackDamage(
                        1.85
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );


                enemy.stunTimer =
                    Math.max(
                        enemy.stunTimer ||
                        0,

                        0.9
                    );
            }


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
                        250,

                    color:
                        "#a27c52",

                    life:
                        1,

                    maxLife:
                        1
                });


            shakeScreen(
                15,
                0.45
            );
        }
    }


    /* =====================================================
       LIRAEL
    ===================================================== */

    function useLiraelSkill(
        slot
    ) {
        const player =
            state.player;


        const palette =
            getCharacterPalette();


        const direction =
            normalizeVector(
                state.pointer
                    .worldX -
                player.x,

                state.pointer
                    .worldY -
                player.y
            );


        if (
            slot ===
            "q"
        ) {
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
                        player.x +
                        direction.x *
                        440,

                    ty:
                        player.y +
                        direction.y *
                        440,

                    vx:
                        direction.x *
                        560,

                    vy:
                        direction.y *
                        560,

                    radius:
                        8,

                    damage:
                        attackDamage(
                            1.15
                        ),

                    color:
                        palette.main,

                    glow:
                        palette.glow,

                    life:
                        0.82,

                    maxLife:
                        0.82,

                    playerOwned:
                        true,

                    hit:
                        new Set(),

                    countsForMonarch:
                        true
                });
        }


        else if (
            slot ===
            "r"
        ) {
            player.hp =
                Math.min(
                    player.maxHp,

                    player.hp +
                    Math.round(
                        player.maxHp *
                        0.32
                    )
                );


            state.world
                .effects
                .push({
                    type:
                        "healingAura",

                    color:
                        "#ffb9e9",

                    life:
                        1.1,

                    maxLife:
                        1.1
                });


            spawnParticles(
                player.x,
                player.y,

                "#ffd0ef",

                24
            );
        }


        else {
            const enemies =
                state.world
                    .enemies
                    .filter(
                        enemy =>
                            !enemy.dead
                    );


            const chosen =
                enemies
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            distance(
                                a,
                                player
                            ) -
                            distance(
                                b,
                                player
                            )
                    )
                    .slice(
                        0,
                        7
                    );


            for (
                const enemy of
                chosen
            ) {
                addHazard(
                    enemy.x,
                    enemy.y,

                    70,

                    0.42,

                    attackDamage(
                        1.1
                    ),

                    {
                        playerOwned:
                            true,

                        kind:
                            "fairyStar",

                        color:
                            "#ef9bdc"
                    }
                );
            }
        }
    }


    /* =====================================================
       ZEPHYR
    ===================================================== */

    function useZephyrSkill(
        slot
    ) {
        const player =
            state.player;


        const palette =
            getCharacterPalette();


        if (
            slot ===
            "q"
        ) {
            player.adaptiveBuff =
                true;


            player.adaptiveTimer =
                6;


            player.hp =
                Math.min(
                    player.maxHp,

                    player.hp +
                    12
                );


            player.energy =
                Math.min(
                    player.maxEnergy,

                    player.energy +
                    20
                );


            state.world
                .effects
                .push({
                    type:
                        "transformAura",

                    color:
                        palette.main,

                    life:
                        6,

                    maxLife:
                        6
                });
        }


        else if (
            slot ===
            "r"
        ) {
            const direction =
                normalizeVector(
                    state.pointer
                        .worldX -
                    player.x,

                    state.pointer
                        .worldY -
                    player.y
                );


            const startX =
                player.x;


            const startY =
                player.y;


            for (
                let i = 0;
                i < 9;
                i++
            ) {
                const nx =
                    player.x +
                    direction.x *
                    22;


                const ny =
                    player.y +
                    direction.y *
                    22;


                if (
                    !canPlayerMoveTo(
                        nx,
                        ny,
                        player.radius
                    )
                ) {
                    break;
                }


                player.x =
                    nx;


                player.y =
                    ny;
            }


            const hit =
                findNearestEnemy(
                    player.x,
                    player.y,
                    80
                );


            if (
                hit
            ) {
                attackEnemy(
                    hit,

                    attackDamage(
                        1.25
                    ),

                    {
                        landedHit:
                            true,

                        source:
                            "skill"
                    }
                );
            }


            state.world
                .effects
                .push({
                    type:
                        "chargeTrail",

                    x:
                        startX,

                    y:
                        startY,

                    radius:
                        28,

                    color:
                        palette.secondary,

                    life:
                        0.35,

                    maxLife:
                        0.35
                });
        }


        else {
            player.adaptiveBuff =
                true;


            player.adaptiveTimer =
                10;


            player.shieldTimer =
                10;


            player.damageReduction =
                0.25;


            player.energy =
                player.maxEnergy;


            state.world
                .effects
                .push({
                    type:
                        "transformAura",

                    color:
                        "#d3b9ff",

                    life:
                        10,

                    maxLife:
                        10
                });
        }
    }


    /* =====================================================
       DANO EM INIMIGO
    ===================================================== */

    function attackEnemy(
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


        let damage =
            Math.max(
                1,

                Math.round(
                    amount
                )
            );


        /*
            Monarca leva mais dano
            enquanto desnorteado.
        */

        if (
            enemy.id ===
                "monarch" &&
            enemy.staggerTimer >
                0
        ) {
            damage =
                Math.round(
                    damage *
                    1.3
                );
        }


        enemy.hp =
            Math.max(
                0,

                enemy.hp -
                damage
            );


        enemy.hitFlash =
            0.12;


        enemy.aggressive =
            true;


        enemy.accepted =
            true;


        if (
            [
                "progression",
                "final",
                "monarch"
            ].includes(
                enemy.type
            ) ||
            enemy.id ===
                "monarch"
        ) {
            state.bossBarTarget =
                enemy;
        }


        state.world
            .effects
            .push({
                type:
                    "damageNumber",

                x:
                    enemy.x,

                y:
                    enemy.y -
                    enemy.radius,

                text:
                    `-${damage}`,

                color:
                    damage >= 100
                        ? "#d790ff"

                        : damage >= 60
                        ? "#ff9b6a"

                        : "#ffffff",

                life:
                    0.7,

                maxLife:
                    0.7
            });


        /* ============================
           10 ACERTOS = STUN 5s
        ============================ */

        if (
            enemy.id ===
                "monarch" &&

            options
                .landedHit &&

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


                enemy.specialTimer =
                    Math.max(
                        enemy.specialTimer ||
                        0,

                        5
                    );


                enemy.summonTimer =
                    Math.max(
                        enemy.summonTimer ||
                        0,

                        5
                    );


                enemy.charge =
                    null;


                enemy.telegraphing =
                    false;


                state.world
                    .effects
                    .push({
                        type:
                            "skillRing",

                        x:
                            enemy.x,

                        y:
                            enemy.y,

                        radius:
                            120,

                        color:
                            "#c58bdc",

                        life:
                            0.9,

                        maxLife:
                            0.9
                    });


                showToast(
                    "O Monarca ficou desnorteado por 5 segundos!"
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


        return true;
    }


    /* =====================================================
       DASH DOS INIMIGOS
    ===================================================== */

    function beginEnemyCharge(
        enemy,
        speed = 430,
        duration = 0.42
    ) {
        if (
            enemy.charge ||
            enemy.dead
        ) {
            return;
        }


        const direction =
            normalizeVector(
                state.player.x -
                enemy.x,

                state.player.y -
                enemy.y
            );


        enemy.charge = {
            phase:
                "telegraph",

            timer:
                0.55,

            dx:
                direction.x,

            dy:
                direction.y,

            speed,

            remaining:
                speed *
                duration,

            hitPlayer:
                false
        };


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
                    enemy.x +
                    direction.x *
                    speed *
                    duration,

                ty:
                    enemy.y +
                    direction.y *
                    speed *
                    duration,

                color:
                    "#e0524a",

                life:
                    0.55,

                maxLife:
                    0.55
            });
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


                enemy.telegraphing =
                    false;
            }


            return true;
        }


        const amount =
            Math.min(
                charge.remaining,

                charge.speed *
                dt
            );


        const steps =
            Math.max(
                1,

                Math.ceil(
                    amount /
                    12
                )
            );


        const step =
            amount /
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
                !canEnemyMoveTo(
                    nx,
                    ny,
                    enemy.radius
                )
            ) {
                charge.remaining =
                    0;

                break;
            }


            enemy.x =
                nx;


            enemy.y =
                ny;


            charge.remaining -=
                step;


            if (
                !charge.hitPlayer &&

                distance(
                    enemy,
                    state.player
                ) <=
                enemy.radius +
                state.player
                    .radius +
                10
            ) {
                charge.hitPlayer =
                    true;


                damagePlayer(
                    Math.round(
                        enemy.damage *
                        1.1
                    )
                );
            }
        }


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
                    0.18,

                maxLife:
                    0.18
            });


        if (
            charge.remaining <=
            0
        ) {
            enemy.charge =
                null;


            enemy.telegraphing =
                false;
        }


        return true;
    }


    /* =====================================================
       ESPECIAIS DOS INIMIGOS
    ===================================================== */

    function runEnemySpecial(
        enemy
    ) {
        if (
            !enemy.special ||
            enemy.stunTimer >
                0
        ) {
            return;
        }


        switch (
            enemy.special
        ) {
            case "dash":
                beginEnemyCharge(
                    enemy,
                    390,
                    0.36
                );

                break;


            case "dashBoss":
                beginEnemyCharge(
                    enemy,
                    480,
                    0.46
                );

                break;


            case "rockThrow":
            case "rockStorm": {
                const count =
                    enemy.special ===
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
                                -120,
                                120
                            ),

                        state.player.y +
                            random(
                                -120,
                                120
                            ),

                        enemy.special ===
                            "rockStorm"

                            ? 58

                            : 48,

                        0.75 +
                            i *
                            0.08,

                        Math.round(
                            enemy.damage *
                            1.05
                        ),

                        {
                            kind:
                                "rock",

                            color:
                                "#b35c4c"
                        }
                    );
                }

                break;
            }


            case "webShot":
                addHazard(
                    state.player.x,
                    state.player.y,

                    55,

                    0.65,

                    Math.round(
                        enemy.damage *
                        0.85
                    ),

                    {
                        kind:
                            "web",

                        color:
                            "#91759b",

                        slow:
                            1.3
                    }
                );

                break;


            case "poisonBurst":
                addHazard(
                    enemy.x,
                    enemy.y,

                    90,

                    0.5,

                    Math.round(
                        enemy.damage *
                        0.8
                    ),

                    {
                        kind:
                            "poison",

                        color:
                            "#7b8f54"
                    }
                );

                break;


            case "fairyShot":
            case "skyShot":
            case "fireShot":
            case "crystalShot":
                addHazard(
                    state.player.x,
                    state.player.y,

                    46,

                    0.58,

                    enemy.damage,

                    {
                        kind:
                            enemy.special,

                        color:
                            enemy.special ===
                                "fireShot"

                                ? "#e7683e"

                                : "#8d79c4"
                    }
                );

                break;


            case "rootCircle":
            case "leafStorm":
            case "memoryBurst":
            case "oreBurst":
            case "crystalRain":
            case "natureBurst":
                addHazard(
                    state.player.x,
                    state.player.y,

                    90,

                    0.8,

                    Math.round(
                        enemy.damage *
                        1.15
                    ),

                    {
                        kind:
                            enemy.special,

                        color:
                            "#ad5149"
                    }
                );

                break;


            case "shadowLunge":
                beginEnemyCharge(
                    enemy,
                    430,
                    0.33
                );

                break;


            case "fireRain":
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

                        65,

                        0.65 +
                            i *
                            0.06,

                        Math.round(
                            enemy.damage *
                            0.8
                        ),

                        {
                            kind:
                                "fireRain",

                            color:
                                "#db4d31"
                        }
                    );
                }

                break;


            case "hellBoss":
                if (
                    Math.random() <
                    0.5
                ) {
                    beginEnemyCharge(
                        enemy,
                        510,
                        0.42
                    );
                }

                else {
                    for (
                        let i = 0;
                        i < 5;
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

                            0.7 +
                                i *
                                0.08,

                            Math.round(
                                enemy.damage *
                                0.95
                            ),

                            {
                                kind:
                                    "hellBoss",

                                color:
                                    "#c13d32"
                            }
                        );
                    }
                }

                break;
        }
    }


    /* =====================================================
       IA
    ===================================================== */

    function updateEnemies(dt) {
        if (
            !state.player ||
            state.player.dead
        ) {
            return;
        }


        for (
            const enemy of
            state.world
                .enemies
        ) {
            /* ============================
               MORTO / RESPAWN
            ============================ */

            if (
                enemy.dead
            ) {
                if (
                    enemy.type ===
                        "resourceBoss" &&

                    !enemy.noRespawn &&

                    enemy.respawnTimer >
                        0
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


                        enemy.aggressive =
                            false;


                        enemy.accepted =
                            false;


                        showToast(
                            `${enemy.name} reapareceu!`
                        );
                    }
                }

                continue;
            }


            enemy.attackTimer =
                Math.max(
                    0,

                    (
                        enemy.attackTimer ||
                        0
                    ) -
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

                    (
                        enemy.hitFlash ||
                        0
                    ) -
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


            enemy.staggerTimer =
                Math.max(
                    0,

                    (
                        enemy.staggerTimer ||
                        0
                    ) -
                    dt
                );


            /* ============================
               MONARCA
            ============================ */

            if (
                enemy.id ===
                "monarch"
            ) {
                state.bossBarTarget =
                    enemy;


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


            const progression =
                enemy.type ===
                    "progression" ||
                enemy.type ===
                    "final";


            /*
                Boss de progressão espera
                confirmação.
            */

            if (
                progression &&
                !enemy.accepted
            ) {
                if (
                    d <=
                    Math.min(
                        enemy.vision ||
                        300,

                        190
                    )
                ) {
                    state.bossBarTarget =
                        enemy;
                }

                continue;
            }


            /* ============================
               DETECÇÃO
            ============================ */

            if (
                !enemy.aggressive &&
                (
                    enemy.type ===
                        "hell" ||

                    enemy.type ===
                        "horde" ||

                    d <=
                        enemy.vision
                )
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


            /* ============================
               DESISTE SE FICAR MUITO LONGE
            ============================ */

            if (
                !enemy.noLeash &&
                !progression &&
                enemy.type !==
                    "hell" &&
                enemy.type !==
                    "horde"
            ) {
                if (
                    d >
                    (
                        enemy.vision ||
                        280
                    ) *
                    2.1
                ) {
                    enemy.aggressive =
                        false;


                    enemy.state =
                        "idle";


                    continue;
                }
            }


            if (
                [
                    "progression",
                    "final"
                ].includes(
                    enemy.type
                )
            ) {
                state.bossBarTarget =
                    enemy;
            }


            /* ============================
               ESPECIAL
            ============================ */

            if (
                enemy.special &&
                enemy.specialTimer <=
                0
            ) {
                runEnemySpecial(
                    enemy
                );


                enemy.specialTimer =
                    enemy.type ===
                        "progression"

                        ? random(
                            2.1,
                            3.5
                        )

                        : random(
                            3.1,
                            5.1
                        );
            }


            if (
                enemy.stationary
            ) {
                continue;
            }


            /* ============================
               MOVIMENTO
            ============================ */

            if (
                d >
                enemy.attackRange
            ) {
                const direction =
                    normalizeVector(
                        state.player.x -
                            enemy.x,

                        state.player.y -
                            enemy.y
                    );


                const step =
                    (
                        enemy.speed ||
                        60
                    ) *
                    dt;


                const nx =
                    enemy.x +
                    direction.x *
                    step;


                const ny =
                    enemy.y +
                    direction.y *
                    step;


                if (
                    canEnemyMoveTo(
                        nx,
                        enemy.y,
                        enemy.radius
                    )
                ) {
                    enemy.x =
                        nx;
                }


                if (
                    canEnemyMoveTo(
                        enemy.x,
                        ny,
                        enemy.radius
                    )
                ) {
                    enemy.y =
                        ny;
                }
            }


            /* ============================
               ATAQUE
            ============================ */

            else if (
                enemy.attackTimer <=
                0
            ) {
                damagePlayer(
                    enemy.damage
                );


                enemy.attackTimer =
                    progression
                        ? 1.25
                        : 1.05;
            }


            if (
                enemy.type ===
                "final"
            ) {
                updateFinalBoss(
                    enemy,
                    dt
                );
            }
        }
    }


    /* =====================================================
       OUTRO EU
    ===================================================== */

    function updateFinalBoss(
        enemy,
        dt
    ) {
        const ratio =
            enemy.hp /
            enemy.maxHp;


        const phase =
            ratio >
            0.75

                ? 1

                : ratio >
                  0.5

                ? 2

                : ratio >
                  0.25

                ? 3

                : 4;


        if (
            phase !==
            enemy.phase
        ) {
            enemy.phase =
                phase;


            showToast(
                `O Outro Eu entrou na fase ${phase}.`
            );


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
                        150,

                    color:
                        state.player
                            .color,

                    life:
                        1,

                    maxLife:
                        1
                });
        }


        enemy.finalPulse =
            (
                enemy.finalPulse ||
                0
            ) -
            dt;


        if (
            enemy.finalPulse <=
            0
        ) {
            enemy.finalPulse =
                Math.max(
                    1.2,

                    3.2 -
                    phase *
                    0.42
                );


            for (
                let i = 0;
                i <
                phase +
                1;
                i++
            ) {
                addHazard(
                    state.player.x +
                        random(
                            -150,
                            150
                        ),

                    state.player.y +
                        random(
                            -150,
                            150
                        ),

                    55 +
                        phase *
                        7,

                    0.72,

                    Math.round(
                        enemy.damage *
                        (
                            0.65 +
                            phase *
                            0.08
                        )
                    ),

                    {
                        kind:
                            "finalEcho",

                        color:
                            "#9a739f"
                    }
                );
            }


            if (
                phase >=
                    3 &&
                Math.random() <
                    0.45
            ) {
                beginEnemyCharge(
                    enemy,
                    520,
                    0.38
                );
            }
        }
    }


    /* =====================================================
       HAZARDS
    ===================================================== */

    function updateHazards(dt) {
        for (
            const hazard of
            state.world
                .hazards
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


                if (
                    hazard.playerOwned
                ) {
                    for (
                        const enemy of
                        enemiesInRadius(
                            hazard.x,
                            hazard.y,
                            hazard.radius
                        )
                    ) {
                        attackEnemy(
                            enemy,

                            hazard.damage,

                            {
                                landedHit:
                                    true,

                                source:
                                    "hazard"
                            }
                        );
                    }
                }


                else if (
                    distance(
                        hazard,
                        state.player
                    ) <=
                    hazard.radius +
                    state.player
                        .radius
                ) {
                    damagePlayer(
                        hazard.damage
                    );


                    if (
                        hazard.slow
                    ) {
                        state.player
                            .stunTimer =
                            Math.max(
                                state.player
                                    .stunTimer,

                                0.25
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
                            hazard.color,

                        life:
                            0.35,

                        maxLife:
                            0.35
                    });
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
       PROJÉTEIS DO PLAYER
    ===================================================== */

    function updateActiveProjectiles(
        dt
    ) {
        for (
            const effect of
            state.world
                .effects
        ) {
            if (
                !effect.playerOwned ||
                !effect.vx ||
                !effect.vy ||
                effect.life <=
                0
            ) {
                continue;
            }


            effect.x +=
                effect.vx *
                dt;


            effect.y +=
                effect.vy *
                dt;


            for (
                const enemy of
                state.world
                    .enemies
            ) {
                if (
                    enemy.dead ||
                    effect.hit
                        ?.has(
                            enemy.id
                        )
                ) {
                    continue;
                }


                if (
                    Math.hypot(
                        effect.x -
                            enemy.x,

                        effect.y -
                            enemy.y
                    ) <=
                    (
                        effect.radius ||
                        8
                    ) +
                    enemy.radius
                ) {
                    effect.hit
                        ?.add(
                            enemy.id
                        );


                    attackEnemy(
                        enemy,

                        effect.damage ||
                        1,

                        {
                            landedHit:
                                Boolean(
                                    effect
                                        .countsForMonarch
                                ),

                            source:
                                "projectile"
                        }
                    );


                    effect.life =
                        0;


                    break;
                }
            }
        }
    }


    /* =====================================================
       DANO NO PLAYER
    ===================================================== */

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
            return;
        }


        const armorDefense =
            ITEMS[
                player
                    .equipment
                    ?.armor
            ]
                ?.defense ||
            0;


        const baseDefense =
            Math.max(
                0,

                player.baseDefense ||
                0
            );


        const reduction =
            Math.min(
                0.72,

                (
                    baseDefense +
                    armorDefense
                ) /
                170
            );


        const shield =
            player.shieldTimer >
            0

                ? player.damageReduction ||
                  0

                : 0;


        let finalDamage =
            Math.max(
                1,

                Math.round(
                    amount *
                    (
                        1 -
                        reduction
                    ) *
                    (
                        1 -
                        shield
                    )
                )
            );


        if (
            options.survival
        ) {
            finalDamage =
                Math.min(
                    finalDamage,
                    2
                );
        }


        player.hp =
            Math.max(
                0,

                player.hp -
                finalDamage
            );


        player.invincible =
            options.survival
                ? 0.15
                : 0.42;


        /* ============================
           TELA VERMELHA
        ============================ */

        state.damageFlash =
            Math.max(
                state.damageFlash,

                options.survival
                    ? 0.17
                    : 0.48
            );


        /* ============================
           SANGUE NA BORDA
        ============================ */

        if (
            !options.survival
        ) {
            const edges = [
                {
                    x:
                        random(
                            0.02,
                            0.14
                        ),

                    y:
                        random(
                            0.12,
                            0.88
                        )
                },

                {
                    x:
                        random(
                            0.86,
                            0.98
                        ),

                    y:
                        random(
                            0.12,
                            0.88
                        )
                },

                {
                    x:
                        random(
                            0.12,
                            0.88
                        ),

                    y:
                        random(
                            0.02,
                            0.13
                        )
                },

                {
                    x:
                        random(
                            0.12,
                            0.88
                        ),

                    y:
                        random(
                            0.87,
                            0.98
                        )
                }
            ];


            for (
                let i = 0;
                i <
                randomInt(
                    1,
                    3
                );
                i++
            ) {
                const edge =
                    edges[
                        randomInt(
                            0,
                            edges.length -
                            1
                        )
                    ];


                state.bloodMarks
                    .push({
                        x:
                            edge.x,

                        y:
                            edge.y,

                        radius:
                            random(
                                16,
                                38
                            ),

                        stretch:
                            random(
                                1.2,
                                2.2
                            ),

                        rotation:
                            random(
                                -1.2,
                                1.2
                            ),

                        alpha:
                            random(
                                0.26,
                                0.5
                            ),

                        life:
                            random(
                                1.4,
                                2.8
                            ),

                        maxLife:
                            2.8
                    });
            }
        }


        shakeScreen(
            options.survival
                ? 2
                : 5,

            options.survival
                ? 0.08
                : 0.16
        );


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
                    50,

                color:
                    "#d53d45",

                life:
                    0.35,

                maxLife:
                    0.35
            });


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


        player.playerDash =
            null;


        state.keys.clear();


        state.pointer.down =
            false;


        cancelHoldInteraction();


        state.bossBarTarget =
            null;


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


        const checkpoint =
            player.checkpoint ||
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


        player.dead =
            false;


        player.hp =
            Math.max(
                1,

                Math.round(
                    player.maxHp *
                    0.75
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
                0.8
            );


        player.hunger =
            Math.max(
                player.hunger,

                player.maxHunger *
                0.55
            );


        player.fatigue =
            Math.max(
                player.fatigue,

                player.maxFatigue *
                0.55
            );


        player.x =
            checkpoint.x;


        player.y =
            checkpoint.y;


        player.invincible =
            1.5;


        player.money =
            Math.max(
                0,

                player.money -
                Math.min(
                    35,

                    Math.floor(
                        player.money *
                        0.05
                    )
                )
            );


        buildWorld();


        must(
            "deathPanel"
        )
            .classList
            .add(
                "hidden"
            );


        updateCamera();


        updateHUD();


        showToast(
            "Você retornou ao último ponto seguro."
        );
    }


    /* =====================================================
       DROPS
    ===================================================== */

    function createWorldDrop(
        x,
        y,
        type,
        amount = 1,
        extra = {}
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

            x,
            y,

            type,

            amount:
                Math.max(
                    1,

                    Math.floor(
                        amount
                    )
                ),

            bob:
                random(
                    0,
                    Math.PI *
                    2
                ),

            collected:
                false,

            ...extra
        };


        state.world
            .drops
            .push(
                drop
            );


        return drop;
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


        enemy.hp =
            0;


        enemy.aggressive =
            false;


        enemy.charge =
            null;


        enemy.telegraphing =
            false;


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
                    1.7,

                color:
                    enemy.color,

                life:
                    0.6,

                maxLife:
                    0.6
            });


        spawnParticles(
            enemy.x,
            enemy.y,

            enemy.color ||
                "#cccccc",

            enemy.type ===
                "progression"

                ? 28

                : 12
        );


        if (
            state.bossBarTarget ===
            enemy
        ) {
            state.bossBarTarget =
                null;
        }


        const progression =
            enemy.type ===
                "progression" ||

            enemy.type ===
                "final" ||

            enemy.id ===
                "monarch";


        const xp =
            progression

                ? Math.round(
                    enemy.maxHp *
                    0.34
                )

                : Math.round(
                    enemy.maxHp *
                    0.12
                );


        gainXP(
            Math.max(
                8,
                xp
            )
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


        if (
            enemy.drop &&
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
                1
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
            progression
        ) {
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
        }


        if (
            enemy.id ===
            "monarch"
        ) {
            state.player
                .monarchDefeated =
                true;


            showToast(
                "O Monarca caiu. O altar voltou a responder."
            );
        }


        if (
            enemy.id ===
            "sky_guardian"
        ) {
            state.player
                .abilities
                .route2 =
                true;
        }


        if (
            enemy.id ===
            "final_gate_guardian"
        ) {
            showToast(
                "A Câmara Final foi liberada."
            );
        }


        if (
            enemy.id ===
            "other_self"
        ) {
            state.player
                .finalDefeated =
                true;


            showEnding(
                "Você derrotou O Outro Eu. Veyra ainda se lembra de você."
            );
        }
    }


    /* =====================================================
       XP / NÍVEL
    ===================================================== */

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

                Math.floor(
                    amount
                )
            );


        checkLevelUp();
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
                Math.round(
                    player.xpToNext *
                    1.24 +
                    28
                );


            player.hp =
                player.maxHp;


            player.magic =
                player.maxMagic;


            player.energy =
                player.maxEnergy;


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
                        110,

                    color:
                        "#f4d487",

                    life:
                        1,

                    maxLife:
                        1
                });


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


    /* =====================================================
       INVENTÁRIO
    ===================================================== */

    function addItem(
        id,
        amount = 1
    ) {
        if (
            !state.player ||
            !ITEMS[id]
        ) {
            return false;
        }


        const qty =
            Math.max(
                1,

                Math.floor(
                    amount
                )
            );


        if (
            ITEMS[id]
                .unique &&

            (
                state.player
                    .inventory[
                        id
                    ] ||
                0
            ) >
            0
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
            qty;


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


        const qty =
            Math.max(
                1,

                Math.floor(
                    amount
                )
            );


        const current =
            state.player
                .inventory[
                    id
                ] ||
            0;


        if (
            current <
            qty
        ) {
            return false;
        }


        state.player
            .inventory[
                id
            ] =
            current -
            qty;


        if (
            state.player
                .inventory[
                    id
                ] <=
            0
        ) {
            state.player
                .inventory[
                    id
                ] =
                0;
        }


        return true;
    }


    /* =====================================================
       PROTEÇÃO DA VENDA
    ===================================================== */

    function protectedFromSale(
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
            item.unique ||
            item.quest ||
            item.permanent
        ) {
            return true;
        }


        if (
            item.category ===
            "special"
        ) {
            return true;
        }


        if (
            state.player
                .equipment
                ?.weapon ===
            id
        ) {
            return true;
        }


        if (
            state.player
                .equipment
                ?.armor ===
            id
        ) {
            return true;
        }


        if (
            state.player
                .equipment
                ?.tool ===
            id
        ) {
            return true;
        }


        if (
            [
                "machado",
                "lanterna",
                "flautaMemoria",
                "fragmentoMemoria"
            ].includes(
                id
            )
        ) {
            return true;
        }


        return false;
    }


    function getSellAllData() {
        let total =
            0;


        let count =
            0;


        const entries =
            [];


        for (
            const [
                id,
                amountRaw
            ] of
            Object.entries(
                state.player
                    .inventory
            )
        ) {
            const amount =
                Math.max(
                    0,

                    Math.floor(
                        amountRaw ||
                        0
                    )
                );


            if (
                amount <=
                    0 ||

                protectedFromSale(
                    id
                )
            ) {
                continue;
            }


            const item =
                ITEMS[id];


            const unit =
                Math.max(
                    1,

                    Math.floor(
                        (
                            item.value ||
                            0
                        ) *
                        0.7
                    )
                );


            if (
                unit <=
                0
            ) {
                continue;
            }


            entries.push({
                id,
                amount,
                unit
            });


            total +=
                unit *
                amount;


            count +=
                amount;
        }


        return {
            total,
            count,
            entries
        };
    }


    function sellAll() {
        const data =
            getSellAllData();


        if (
            !data.count
        ) {
            showToast(
                "Não há itens vendáveis no inventário."
            );

            return;
        }


        for (
            const entry of
            data.entries
        ) {
            state.player
                .inventory[
                    entry.id
                ] =
                0;
        }


        state.player.money +=
            data.total;


        showToast(
            `${data.count} itens vendidos por ${data.total} moedas.`
        );


        renderShop();


        updateInventory();


        updateHUD();
    }


    /* =====================================================
       EQUIPAR
    ===================================================== */

    function equipItem(id) {
        const item =
            ITEMS[id];


        if (
            !item ||
            !hasItem(
                id
            )
        ) {
            return;
        }


        if (
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
                `${item.name} equipada.`
            );
        }


        else if (
            item.category ===
            "tools"
        ) {
            state.player
                .equipment
                .tool =
                id;


            showToast(
                `${item.name} equipada.`
            );
        }


        updateInventory();


        updateEquipment();


        updateHUD();
    }


    function updateEquipment() {
        const player =
            state.player;


        if (
            !player
        ) {
            return;
        }


        player.defense =
            player.baseDefense +
            (
                ITEMS[
                    player
                        .equipment
                        ?.armor
                ]
                    ?.defense ||
                0
            );
    }


    /* =====================================================
       USAR ITEM
    ===================================================== */

    function useItem(id) {
        const player =
            state.player;


        const item =
            ITEMS[id];


        if (
            !player ||
            !item ||
            !hasItem(
                id
            )
        ) {
            return;
        }


        if (
            item.category ===
                "armor" ||

            item.category ===
                "weapons" ||

            item.category ===
                "tools"
        ) {
            equipItem(
                id
            );

            return;
        }


        if (
            id ===
            "pocao"
        ) {
            if (
                player.hp >=
                player.maxHp
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


            player.hp =
                Math.min(
                    player.maxHp,

                    player.hp +
                    item.heal
                );


            showToast(
                "Poção usada."
            );
        }


        else if (
            id ===
            "elixir"
        ) {
            removeItem(
                id,
                1
            );


            player.energy =
                Math.min(
                    player.maxEnergy,

                    player.energy +
                    item.energy
                );


            showToast(
                "Energia restaurada."
            );
        }


        else if (
            item.category ===
            "food"
        ) {
            removeItem(
                id,
                1
            );


            player.hunger =
                Math.min(
                    player.maxHunger,

                    player.hunger +
                    (
                        item.hunger ||
                        0
                    )
                );


            player.hp =
                Math.min(
                    player.maxHp,

                    player.hp +
                    (
                        item.heal ||
                        0
                    )
                );


            showToast(
                `${item.name} consumido.`
            );
        }


        else if (
            id ===
            "flautaMemoria"
        ) {
            playMemoryFlute();
        }


        updateInventory();


        updateHUD();
    }


    /* =====================================================
       MOSTRAR INVENTÁRIO
    ===================================================== */

    function updateInventory() {
        const grid =
            must(
                "inventoryGrid"
            );


        grid.innerHTML =
            "";


        const category =
            state.inventoryCategory ||
            "all";


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
                    0 ||

                !ITEMS[id]
            ) {
                continue;
            }


            const item =
                ITEMS[id];


            if (
                category !==
                    "all" &&

                item.category !==
                    category
            ) {
                continue;
            }


            const card =
                document
                    .createElement(
                        "button"
                    );


            card.type =
                "button";


            card.className =
                "inventory-item";


            card.innerHTML = `
                <span class="item-icon">
                    ${item.icon}
                </span>

                <strong>
                    ${item.name}
                </strong>

                <small>
                    x${amount}
                </small>
            `;


            card.addEventListener(
                "click",

                () =>
                    useItem(
                        id
                    )
            );


            grid.appendChild(
                card
            );
        }


        if (
            !grid.children
                .length
        ) {
            const empty =
                document
                    .createElement(
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


        const equipment =
            must(
                "equipmentGrid"
            );


        equipment.innerHTML = `
            <strong>
                Equipado
            </strong>

            <br>

            Arma:
            ${
                ITEMS[
                    state.player
                        .equipment
                        .weapon
                ]
                    ?.name ||
                "Nenhuma"
            }

            <br>

            Armadura:
            ${
                ITEMS[
                    state.player
                        .equipment
                        .armor
                ]
                    ?.name ||
                "Nenhuma"
            }

            <br>

            Ferramenta:
            ${
                ITEMS[
                    state.player
                        .equipment
                        .tool
                ]
                    ?.name ||
                "Nenhuma"
            }
        `;
    }


    /* =====================================================
       SEGURAR E PARA COLETAR
    ===================================================== */

    function beginHoldInteraction(
        type,
        object,
        duration
    ) {
        state.holdAction = {
            type,
            object,
            duration,

            elapsed:
                0
        };
    }


    function cancelHoldInteraction() {
        state.holdAction =
            null;


        const panel =
            $(
                "holdProgress"
            );


        const fill =
            $(
                "holdProgressFill"
            );


        if (
            panel
        ) {
            panel.classList
                .add(
                    "hidden"
                );
        }


        if (
            fill
        ) {
            fill.style.width =
                "0%";
        }
    }


    function updateHoldInteraction(dt) {
        const hold =
            state.holdAction;


        if (
            !hold
        ) {
            return;
        }


        if (
            !state.keys.has(
                "e"
            )
        ) {
            cancelHoldInteraction();

            return;
        }


        if (
            !hold.object ||
            hold.object.alive ===
                false
        ) {
            cancelHoldInteraction();

            return;
        }


        if (
            distance(
                state.player,
                hold.object
            ) >
            105
        ) {
            cancelHoldInteraction();

            return;
        }


        hold.elapsed +=
            dt;


        const percent =
            clamp(
                hold.elapsed /
                hold.duration *
                100,

                0,
                100
            );


        const panel =
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
            panel
        ) {
            panel.classList
                .remove(
                    "hidden"
                );
        }


        if (
            fill
        ) {
            fill.style.width =
                `${percent}%`;
        }


        if (
            title
        ) {
            title.textContent =
                hold.type ===
                    "tree"

                    ? "Cortando madeira..."

                    : "Coletando minério...";
        }


        if (
            hold.elapsed >=
            hold.duration
        ) {
            if (
                hold.type ===
                "tree"
            ) {
                harvestTree(
                    hold.object
                );
            }

            else {
                collectResource(
                    hold.object
                );
            }


            cancelHoldInteraction();
        }
    }


    /* =====================================================
       MADEIRA
    ===================================================== */

    function harvestTree(tree) {
        if (
            !tree
                ?.alive
        ) {
            return;
        }


        if (
            !hasItem(
                "machado"
            )
        ) {
            showToast(
                "Você precisa de um machado."
            );

            return;
        }


        if (
            state.player
                .magic <
            4
        ) {
            showToast(
                "Magia insuficiente para continuar cortando."
            );

            return;
        }


        state.player.magic -=
            4;


        state.player.fatigue =
            Math.max(
                0,

                state.player
                    .fatigue -
                1.4
            );


        const amount =
            tree.amount ||
            randomInt(
                2,
                5
            );


        addItem(
            "madeira",
            amount
        );


        gainXP(
            5
        );


        tree.alive =
            false;


        tree.respawn =
            random(
                75,
                125
            );


        state.world
            .effects
            .push({
                type:
                    "woodBurst",

                x:
                    tree.x,

                y:
                    tree.y,

                radius:
                    55,

                color:
                    "#9a673d",

                life:
                    0.65,

                maxLife:
                    0.65
            });


        spawnParticles(
            tree.x,
            tree.y,

            "#997043",

            16
        );


        showToast(
            `+${amount} Madeira`
        );
    }


    /* =====================================================
       MINERAÇÃO
    ===================================================== */

    function collectResource(
        resource
    ) {
        if (
            !resource
                ?.alive
        ) {
            return;
        }


        const magicCost =
            [
                "diamante",
                "rubi",
                "ouro"
            ].includes(
                resource.type
            )

                ? 5

                : 3;


        if (
            state.player
                .magic <
            magicCost
        ) {
            showToast(
                "Magia insuficiente para coletar."
            );

            return;
        }


        state.player.magic -=
            magicCost;


        state.player.fatigue =
            Math.max(
                0,

                state.player
                    .fatigue -
                0.9
            );


        const amount =
            resource.amount ||
            1;


        addItem(
            resource.type,
            amount
        );


        gainXP(
            [
                "diamante",
                "rubi"
            ].includes(
                resource.type
            )

                ? 8

                : 4
        );


        resource.alive =
            false;


        resource.respawn =
            random(
                55,
                105
            );


        spawnParticles(
            resource.x,
            resource.y,

            "#dbbf74",

            10
        );


        showToast(
            `+${amount} ${
                ITEMS[
                    resource.type
                ]
                    ?.name ||
                "recurso"
            }`
        );
    }


    function updateResources(dt) {
        for (
            const tree of
            state.world
                .trees
        ) {
            if (
                !tree.alive &&
                tree.respawn >
                0
            ) {
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
        }


        for (
            const resource of
            state.world
                .resources
        ) {
            if (
                !resource.alive &&
                resource.respawn >
                0
            ) {
                resource.respawn -=
                    dt;


                if (
                    resource.respawn <=
                    0
                ) {
                    resource.alive =
                        true;


                    resource.amount =
                        randomInt(
                            1,
                            3
                        );
                }
            }
        }


        for (
            const food of
            state.world
                .foods
        ) {
            if (
                !food.alive &&
                food.respawn >
                0
            ) {
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
        }
    }


    function respawnTree(tree) {
        tree.alive =
            true;


        tree.amount =
            randomInt(
                2,
                5
            );


        tree.respawn =
            0;
    }


    /* =====================================================
       INTERAÇÃO MAIS PRÓXIMA
    ===================================================== */

    function getInteraction() {
        const player =
            state.player;


        if (
            !player
        ) {
            return null;
        }


        /* ============================
           DENTRO DA CASA
        ============================ */

        if (
            state.houseMode
        ) {
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
                    20
            };


            if (
                distance(
                    player,
                    door
                ) <
                95
            ) {
                return {
                    type:
                        "exitHouse",

                    object:
                        door
                };
            }


            const sleep =
                getSleepTarget();


            if (
                sleep &&
                distance(
                    player,
                    sleep
                ) <
                100
            ) {
                return {
                    type:
                        "sleep",

                    object:
                        sleep
                };
            }


            for (
                const npc of
                getInteriorNPCs()
            ) {
                if (
                    distance(
                        player,
                        npc
                    ) <
                    100
                ) {
                    if (
                        npc.blacksmith
                    ) {
                        return {
                            type:
                                "blacksmith",

                            object:
                                npc
                        };
                    }


                    return {
                        type:
                            "npc",

                        object:
                            npc
                    };
                }
            }


            return null;
        }


        /* ============================
           PORTÕES
        ============================ */

        for (
            const gate of
            state.world
                .gates
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


            if (
                distance(
                    player,
                    center
                ) <
                135
            ) {
                return {
                    type:
                        "gate",

                    object:
                        gate
                };
            }
        }


        /* ============================
           ALTARES
        ============================ */

        for (
            const trial of
            state.world
                .trials
        ) {
            if (
                distance(
                    player,
                    trial
                ) <
                115
            ) {
                if (
                    trial.dashAltar
                ) {
                    return {
                        type:
                            "dashAltar",

                        object:
                            trial
                    };
                }


                return {
                    type:
                        "trial",

                    object:
                        trial
                };
            }
        }


        /* ============================
           DROP
        ============================ */

        for (
            const drop of
            state.world
                .drops
        ) {
            if (
                !drop.collected &&
                distance(
                    player,
                    drop
                ) <
                95
            ) {
                return {
                    type:
                        "drop",

                    object:
                        drop
                };
            }
        }


        /* ============================
           NPC
        ============================ */

        for (
            const npc of
            state.world
                .npcs
        ) {
            if (
                distance(
                    player,
                    npc
                ) <
                100
            ) {
                if (
                    npc.blacksmith
                ) {
                    return {
                        type:
                            "blacksmith",

                        object:
                            npc
                    };
                }


                return {
                    type:
                        "npc",

                    object:
                        npc
                };
            }
        }


        /* ============================
           ÁRVORES
        ============================ */

        for (
            const tree of
            state.world
                .trees
        ) {
            if (
                tree.alive &&
                distance(
                    player,
                    tree
                ) <
                88
            ) {
                return {
                    type:
                        "tree",

                    object:
                        tree
                };
            }
        }


        /* ============================
           RECURSOS
        ============================ */

        for (
            const resource of
            state.world
                .resources
        ) {
            if (
                resource.alive &&
                distance(
                    player,
                    resource
                ) <
                90
            ) {
                return {
                    type:
                        "resource",

                    object:
                        resource
                };
            }
        }


        /* ============================
           COMIDA
        ============================ */

        for (
            const food of
            state.world
                .foods
        ) {
            if (
                food.alive &&
                distance(
                    player,
                    food
                ) <
                85
            ) {
                return {
                    type:
                        "food",

                    object:
                        food
                };
            }
        }


        /* ============================
           SEGREDO
        ============================ */

        for (
            const secret of
            state.world
                .secrets
        ) {
            if (
                !secret.found &&
                distance(
                    player,
                    secret
                ) <
                90
            ) {
                return {
                    type:
                        "secret",

                    object:
                        secret
                };
            }
        }


        /* ============================
           BOSSES
        ============================ */

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
                enemy.id ===
                    "other_self" &&

                !state.finalChoiceShown &&

                distance(
                    player,
                    enemy
                ) <
                170
            ) {
                return {
                    type:
                        "finalChoice",

                    object:
                        enemy
                };
            }


            if (
                enemy.type ===
                    "progression" &&

                !enemy.accepted &&

                distance(
                    player,
                    enemy
                ) <
                160
            ) {
                return {
                    type:
                        "boss",

                    object:
                        enemy
                };
            }
        }


        /* ============================
           CASAS
        ============================ */

        for (
            const building of
            state.world
                .buildings
        ) {
            const door = {
                x:
                    building.x +
                    building.w /
                    2,

                y:
                    building.y +
                    building.h +
                    25
            };


            if (
                distance(
                    player,
                    door
                ) <
                95
            ) {
                return {
                    type:
                        "house",

                    object:
                        building
                };
            }
        }


        return null;
    }


    /* =====================================================
       AÇÃO E
    ===================================================== */

    function playerAction() {
        if (
            !state.player ||
            state.paused ||
            state.dialogue ||
            state.travel ||
            state.battle
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
            object
        } =
            interaction;


        if (
            type ===
            "tree"
        ) {
            beginHoldInteraction(
                "tree",
                object,
                1.15
            );

            return;
        }


        if (
            type ===
            "resource"
        ) {
            beginHoldInteraction(
                "resource",

                object,

                [
                    "diamante",
                    "rubi"
                ].includes(
                    object.type
                )

                    ? 1.35

                    : 0.95
            );

            return;
        }


        if (
            type ===
            "drop"
        ) {
            if (
                addItem(
                    object.type,
                    object.amount
                )
            ) {
                object.collected =
                    true;


                showToast(
                    `+${object.amount} ${ITEMS[object.type].name}`
                );


                if (
                    object.type ===
                    "flautaMemoria"
                ) {
                    showToast(
                        "Você recebeu a Flauta da Memória. Use-a pelo inventário."
                    );
                }
            }

            return;
        }


        if (
            type ===
            "food"
        ) {
            object.alive =
                false;


            object.respawn =
                random(
                    object.respawnMin ||
                        90,

                    object.respawnMax ||
                        150
                );


            if (
                object.type ===
                "carrot"
            ) {
                state.player
                    .hunger =
                    Math.min(
                        state.player
                            .maxHunger,

                        state.player
                            .hunger +
                        10
                    );


                showToast(
                    "Cenoura consumida. +10 fome."
                );
            }

            return;
        }


        if (
            type ===
            "secret"
        ) {
            object.found =
                true;


            if (
                !state.player
                    .secretsFound
                    .includes(
                        object.id
                    )
            ) {
                state.player
                    .secretsFound
                    .push(
                        object.id
                    );
            }


            gainXP(
                18
            );


            showToast(
                `${object.title}: ${object.message}`
            );

            return;
        }


        if (
            type ===
            "npc"
        ) {
            if (
                object.merchant
            ) {
                openShop(
                    object
                );
            }

            else if (
                object.questId
            ) {
                openQuest(
                    object
                );
            }

            else {
                startDialogue(
                    object
                );
            }

            return;
        }


        if (
            type ===
            "blacksmith"
        ) {
            openForgePanel(
                object
            );

            return;
        }


        if (
            type ===
            "sleep"
        ) {
            sleepAtBed();

            return;
        }


        if (
            type ===
            "dashAltar"
        ) {
            interactDashAltar();

            return;
        }


        if (
            type ===
            "trial"
        ) {
            if (
                object.skyTrial
            ) {
                startSkyTrial();
            }

            return;
        }


        if (
            type ===
            "gate"
        ) {
            interactGate(
                object
            );

            return;
        }


        if (
            type ===
            "finalChoice"
        ) {
            openFinalChoice();

            return;
        }


        if (
            type ===
            "boss"
        ) {
            openBattle(
                object
            );
        }
    }


    /* =====================================================
       CASAS
    ===================================================== */

    function enterNearestHouse() {
        const interaction =
            getInteraction();


        if (
            interaction
                ?.type !==
            "house"
        ) {
            showToast(
                "Aproxime-se de uma porta."
            );

            return;
        }


        const building =
            interaction.object;


        state.currentHouse =
            building;


        state.houseMode =
            true;


        state.houseReturn = {
            x:
                building.x +
                building.w /
                2,

            y:
                building.y +
                building.h +
                65
        };


        placePlayerInsideHouse();


        state.keys.clear();
    }


    function exitHouse() {
        if (
            !state.houseMode
        ) {
            return;
        }


        state.houseMode =
            false;


        state.player.x =
            state.houseReturn
                ?.x ||
            480;


        state.player.y =
            state.houseReturn
                ?.y ||
            610;


        state.currentHouse =
            null;


        state.houseReturn =
            null;


        state.keys.clear();


        updateCamera();
    }


    function sleepAtBed() {
        const player =
            state.player;


        player.hp =
            player.maxHp;


        player.magic =
            player.maxMagic;


        player.energy =
            player.maxEnergy;


        player.fatigue =
            player.maxFatigue;


        player.hunger =
            Math.max(
                player.hunger,

                player.maxHunger *
                0.72
            );


        showToast(
            "Você dormiu e recuperou suas forças."
        );
    }


    /* =====================================================
       PORTÕES
    ===================================================== */

    function nextGateDialogue(
        side
    ) {
        const list =
            GATE_DIALOGUES[
                side
            ] ||
            GATE_DIALOGUES
                .north;


        const index =
            state.player
                .gateDialogueIndex[
                    side
                ] ||
            0;


        state.player
            .gateDialogueIndex[
                side
            ] =
            (
                index +
                1
            ) %
            list.length;


        return (
            list[
                index
            ]
        );
    }


    function interactGate(
        gate
    ) {
        if (
            state.player
                .gateUnlocks
                ?.[gate.side]
        ) {
            transitionTo(
                gate.target
            );

            return;
        }


        /* ============================
           PORTÃO NORTE
        ============================ */

        if (
            gate.side ===
            "north"
        ) {
            /*
                SEM DASH:
                NÃO DÁ SPOILER.
            */

            if (
                !state.player
                    .abilities
                    ?.dash
            ) {
                const lines =
                    nextGateDialogue(
                        "north"
                    );


                openGateRequirementPanel(
                    gate,

                    lines.join(
                        "\n\n"
                    )
                );

                return;
            }


            /*
                COM DASH:
                MOSTRA OS MINÉRIOS.
            */

            const needs =
                gate.materials ||
                NORTH_GATE_REQUIREMENTS;


            const diamond =
                state.player
                    .inventory
                    .diamante ||
                0;


            const ruby =
                state.player
                    .inventory
                    .rubi ||
                0;


            const missingDiamond =
                Math.max(
                    0,

                    needs.diamante -
                    diamond
                );


            const missingRuby =
                Math.max(
                    0,

                    needs.rubi -
                    ruby
                );


            if (
                missingDiamond >
                    0 ||
                missingRuby >
                    0
            ) {
                const text = [
                    "Você domina a técnica necessária, mas sua preparação ainda está incompleta.",

                    "",

                    "Materiais necessários:",

                    `💎 Diamante: ${diamond} / ${needs.diamante} — faltam ${missingDiamond}`,

                    `♦️ Rubi: ${ruby} / ${needs.rubi} — faltam ${missingRuby}`
                ]
                    .join(
                        "\n"
                    );


                openGateRequirementPanel(
                    gate,
                    text
                );

                return;
            }


            state.player
                .gateUnlocks
                .north =
                true;


            showToast(
                "O Portão do Norte reconheceu sua preparação."
            );

            return;
        }


        /* ============================
           OUTROS PORTÕES
        ============================ */

        const required =
            gate.requiredAbility;


        if (
            required &&
            !state.player
                .abilities
                ?.[required]
        ) {
            const lines =
                nextGateDialogue(
                    gate.side
                );


            openGateRequirementPanel(
                gate,

                lines.join(
                    "\n\n"
                )
            );

            return;
        }


        state.player
            .gateUnlocks[
                gate.side
            ] =
            true;


        showToast(
            `${gate.title} foi aberto.`
        );
    }


    /* =====================================================
       PAINEL DO PORTÃO
    ===================================================== */

    function openGateRequirementPanel(
        gate,
        text
    ) {
        closeAllPanels(
            "gateRequirementPanelDynamic"
        );


        let panel =
            $(
                "gateRequirementPanelDynamic"
            );


        if (
            !panel
        ) {
            panel =
                document
                    .createElement(
                        "div"
                    );


            panel.id =
                "gateRequirementPanelDynamic";


            panel.className =
                "modal hidden";


            panel.innerHTML = `
                <div class="modal-card">

                    <button
                        class="close-btn panel-close"
                        type="button"
                        data-dyn-close
                    >
                        ×
                    </button>

                    <p class="eyebrow">
                        PASSAGEM
                    </p>

                    <h2 id="gateDynTitle">
                        PORTÃO
                    </h2>

                    <p
                        id="gateDynText"
                        class="muted"
                        style="white-space:pre-line"
                    ></p>

                </div>
            `;


            screens.game
                .appendChild(
                    panel
                );


            panel
                .querySelector(
                    "[data-dyn-close]"
                )
                .addEventListener(
                    "click",

                    () =>
                        closeDynamicPanel(
                            panel.id
                        )
                );
        }


        $(
            "gateDynTitle"
        ).textContent =
            gate.title;


        $(
            "gateDynText"
        ).textContent =
            text;


        panel
            .classList
            .remove(
                "hidden"
            );
    }


    /* =====================================================
       ALTAR DO DASH
    ===================================================== */

    function interactDashAltar() {
        const player =
            state.player;


        if (
            player.abilities
                ?.dash
        ) {
            showToast(
                "O altar está silencioso. A técnica agora pertence a você."
            );

            return;
        }


        const rubies =
            player.inventory
                .rubi ||
            0;


        const diamonds =
            player.inventory
                .diamante ||
            0;


        /* ============================
           AINDA NÃO ACORDOU MONARCA
        ============================ */

        if (
            !player
                .monarchAwakened
        ) {
            const missingRuby =
                Math.max(
                    0,

                    DASH_RUBY_COST -
                    rubies
                );


            const missingDiamond =
                Math.max(
                    0,

                    DASH_DIAMOND_COST -
                    diamonds
                );


            if (
                missingRuby >
                    0 ||
                missingDiamond >
                    0
            ) {
                showDashAltarMessage(
                    [
                        "O altar reage por um instante, mas o símbolo no centro permanece incompleto.",

                        "Você sente que tentar forçar esse poder agora faria alguma coisa muito antiga perceber sua presença.",

                        "",

                        "Sua preparação ainda não é suficiente.",

                        `♦️ Rubi: ${rubies}/${DASH_RUBY_COST} — faltam ${missingRuby}`,

                        `💎 Diamante: ${diamonds}/${DASH_DIAMOND_COST} — faltam ${missingDiamond}`
                    ]
                        .join(
                            "\n"
                        )
                );

                return;
            }


            player.monarchAwakened =
                true;


            showDashAltarMessage(
                "O altar aceita sua presença. As pedras ao redor começam a tremer...\n\nAlgo que dormia aqui percebeu que você está pronto."
            );


            closeDynamicPanel(
                "dashAltarPanelDynamic"
            );


            spawnMonarch(
                true
            );


            return;
        }


        /* ============================
           MONARCA VIVO
        ============================ */

        if (
            !player
                .monarchDefeated
        ) {
            showDashAltarMessage(
                "O altar está bloqueado por uma presença que ainda não foi derrotada."
            );


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
                state.bossBarTarget =
                    monarch;
            }


            return;
        }


        /* ============================
           DEPOIS DO BOSS
        ============================ */

        if (
            rubies <
                DASH_RUBY_COST ||

            diamonds <
                DASH_DIAMOND_COST
        ) {
            showDashAltarMessage(
                "O Monarca caiu, mas o altar exige os mesmos materiais usados para despertar seu poder.\n\n" +

                `♦️ Rubi: ${rubies}/${DASH_RUBY_COST}\n` +

                `💎 Diamante: ${diamonds}/${DASH_DIAMOND_COST}`
            );

            return;
        }


        removeItem(
            "rubi",
            DASH_RUBY_COST
        );


        removeItem(
            "diamante",
            DASH_DIAMOND_COST
        );


        player.abilities
            .dash =
            true;


        player.dashPurchased =
            true;


        state.world
            .effects
            .push({
                type:
                    "dashUnlock",

                x:
                    player.x,

                y:
                    player.y,

                radius:
                    160,

                color:
                    "#c493e4",

                life:
                    1.2,

                maxLife:
                    1.2
            });


        spawnParticles(
            player.x,
            player.y,

            "#d8b3ef",

            38
        );


        shakeScreen(
            10,
            0.35
        );


        showToast(
            "DASH DESBLOQUEADO — pressione ESPAÇO e aponte com o mouse."
        );


        updateInventory();


        updateHUD();
    }


    function showDashAltarMessage(
        text
    ) {
        let panel =
            $(
                "dashAltarPanelDynamic"
            );


        if (
            !panel
        ) {
            panel =
                document
                    .createElement(
                        "div"
                    );


            panel.id =
                "dashAltarPanelDynamic";


            panel.className =
                "modal hidden";


            panel.innerHTML = `
                <div class="modal-card">

                    <button
                        class="close-btn panel-close"
                        type="button"
                        data-dash-close
                    >
                        ×
                    </button>

                    <p class="eyebrow">
                        ALTAR ANTIGO
                    </p>

                    <h2>
                        UM PODER ADORMECIDO
                    </h2>

                    <p
                        id="dashAltarTextDynamic"
                        class="muted"
                        style="white-space:pre-line"
                    ></p>

                </div>
            `;


            screens.game
                .appendChild(
                    panel
                );


            panel
                .querySelector(
                    "[data-dash-close]"
                )
                .addEventListener(
                    "click",

                    () =>
                        closeDynamicPanel(
                            panel.id
                        )
                );
        }


        $(
            "dashAltarTextDynamic"
        ).textContent =
            text;


        panel
            .classList
            .remove(
                "hidden"
            );
    }


    /* =====================================================
       DIÁLOGOS
    ===================================================== */

    function startDialogue(npc) {
        state.dialogue = {
            npc,

            lines:
                [
                    ...(
                        npc.lines ||
                        [
                            "..."
                        ]
                    )
                ],

            index:
                0,

            charIndex:
                0,

            shown:
                "",

            timer:
                0
        };


        must(
            "dialogueSpeaker"
        ).textContent =
            npc.role

                ? `${npc.name} — ${npc.role}`

                : npc.name;


        must(
            "dialogueText"
        ).textContent =
            "";


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


        const line =
            dialogue.lines[
                dialogue.index
            ] ||
            "";


        dialogue.shown =
            "";


        dialogue.charIndex =
            0;


        must(
            "dialogueText"
        ).textContent =
            "";


        const tick =
            () => {
                if (
                    !state.dialogue ||
                    state.dialogue !==
                    dialogue
                ) {
                    return;
                }


                dialogue.shown +=
                    line[
                        dialogue.charIndex
                    ] ||
                    "";


                dialogue.charIndex++;


                must(
                    "dialogueText"
                ).textContent =
                    dialogue.shown;


                if (
                    dialogue.charIndex <
                    line.length
                ) {
                    dialogue.timer =
                        setTimeout(
                            tick,
                            18
                        );
                }
            };


        tick();
    }


    function advanceDialogue() {
        const dialogue =
            state.dialogue;


        if (
            !dialogue
        ) {
            return;
        }


        const line =
            dialogue.lines[
                dialogue.index
            ] ||
            "";


        if (
            dialogue.charIndex <
            line.length
        ) {
            clearTimeout(
                dialogue.timer
            );


            dialogue.charIndex =
                line.length;


            dialogue.shown =
                line;


            must(
                "dialogueText"
            ).textContent =
                line;


            return;
        }


        dialogue.index++;


        if (
            dialogue.index >=
            dialogue.lines
                .length
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
            clearTimeout(
                state.dialogue
                    .timer
            );
        }


        state.dialogue =
            null;


        must(
            "dialogueBox"
        )
            .classList
            .add(
                "hidden"
            );
    }


    /* =====================================================
       MISSÕES
    ===================================================== */

    function openQuest(npc) {
        const questId =
            npc.questId;


        const quest =
            state.player
                .quest[
                    questId
                ];


        if (
            !quest
        ) {
            startDialogue(
                npc
            );

            return;
        }


        state.questNPC =
            npc;


        const isWood =
            questId ===
            "wood";


        const itemId =
            isWood
                ? "madeira"
                : "carvao";


        const have =
            state.player
                .inventory[
                    itemId
                ] ||
            0;


        must(
            "questTitle"
        ).textContent =
            isWood

                ? "MADEIRA PARA A VILA"

                : "CARVÃO PARA A FORJA";


        if (
            quest.state ===
            "none"
        ) {
            must(
                "questText"
            ).textContent =
                isWood

                    ? "Bran precisa de madeira para reforçar as casas da vila."

                    : "Borin precisa de carvão para manter a forja acesa.";


            must(
                "questStatus"
            ).textContent =
                `Objetivo: ${quest.need} ${ITEMS[itemId].name}`;


            must(
                "questActionBtn"
            ).textContent =
                "ACEITAR";
        }


        else if (
            quest.state ===
            "active"
        ) {
            must(
                "questText"
            ).textContent =
                "A missão está em andamento.";


            must(
                "questStatus"
            ).textContent =
                `${have}/${quest.need}`;


            must(
                "questActionBtn"
            ).textContent =
                have >=
                quest.need

                    ? "ENTREGAR"

                    : "VOLTAR DEPOIS";
        }


        else {
            must(
                "questText"
            ).textContent =
                "Missão concluída.";


            must(
                "questStatus"
            ).textContent =
                "Recompensa recebida.";


            must(
                "questActionBtn"
            ).textContent =
                "FECHAR";
        }


        must(
            "questPanel"
        )
            .classList
            .remove(
                "hidden"
            );
    }


    function executeQuestAction() {
        const npc =
            state.questNPC;


        if (
            !npc
                ?.questId
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
                "active";


            showToast(
                "Missão aceita."
            );


            openQuest(
                npc
            );


            return;
        }


        if (
            quest.state ===
            "active"
        ) {
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
                    "Você ainda não possui materiais suficientes."
                );


                must(
                    "questPanel"
                )
                    .classList
                    .add(
                        "hidden"
                    );


                return;
            }


            removeItem(
                itemId,
                quest.need
            );


            quest.state =
                "done";


            state.player.money +=
                quest.rewardMoney;


            gainXP(
                quest.rewardXP
            );


            showToast(
                `Missão concluída! +${quest.rewardMoney} moedas.`
            );


            openQuest(
                npc
            );


            updateHUD();


            return;
        }


        must(
            "questPanel"
        )
            .classList
            .add(
                "hidden"
            );
    }


    /* =====================================================
       BOSS
    ===================================================== */

    function openBattle(enemy) {
        if (
            !enemy ||
            enemy.dead
        ) {
            return;
        }


        state.battle =
            enemy;


        state.bossBarTarget =
            enemy;


        must(
            "battleTitle"
        ).textContent =
            enemy.name;


        must(
            "battleText"
        ).textContent =
            "Deseja enfrentar este boss?";


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


        enemy.accepted =
            true;


        enemy.aggressive =
            true;


        enemy.state =
            "chasing";


        state.bossBarTarget =
            enemy;


        state.battle =
            null;


        must(
            "battlePanel"
        )
            .classList
            .add(
                "hidden"
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
            `${enemy.name}: batalha iniciada.`
        );
    }


    function declineBattle() {
        state.battle =
            null;


        must(
            "battlePanel"
        )
            .classList
            .add(
                "hidden"
            );
    }


    /* =====================================================
       PORTAIS
    ===================================================== */

    function checkPortals() {
        if (
            state.portalCooldown >
                0 ||
            state.houseMode
        ) {
            return;
        }


        for (
            const portal of
            state.world
                .portals
        ) {
            if (
                typeof portal
                    .visible ===
                    "function" &&

                !portal.visible()
            ) {
                continue;
            }


            if (
                state.player.x +
                    state.player
                        .radius >
                    portal.x &&

                state.player.x -
                    state.player
                        .radius <
                    portal.x +
                    portal.w &&

                state.player.y +
                    state.player
                        .radius >
                    portal.y &&

                state.player.y -
                    state.player
                        .radius <
                    portal.y +
                    portal.h
            ) {
                const allowed =
                    typeof portal
                        .requirement ===
                        "function"

                        ? portal.requirement()

                        : true;


                if (
                    !allowed
                ) {
                    if (
                        state.time -
                            state.warnedNeedAt >
                        1.5
                    ) {
                        state.warnedNeedAt =
                            state.time;


                        showToast(
                            "O caminho ainda está bloqueado."
                        );
                    }


                    return;
                }


                openTravel(
                    portal
                );


                return;
            }
        }
    }


    function openTravel(portal) {
        if (
            state.travel
        ) {
            return;
        }


        state.travel =
            portal;


        must(
            "travelText"
        ).textContent =
            `Viajar para ${REGIONS[portal.target].name}?`;


        must(
            "travelPanel"
        )
            .classList
            .remove(
                "hidden"
            );
    }


    function confirmTravel() {
        if (
            !state.travel
        ) {
            return;
        }


        const target =
            state.travel
                .target;


        cancelTravel();


        transitionTo(
            target
        );
    }


    function cancelTravel() {
        state.travel =
            null;


        state.portalCooldown =
            0.9;


        must(
            "travelPanel"
        )
            .classList
            .add(
                "hidden"
            );
    }


    function transitionTo(target) {
        if (
            !REGIONS[
                target
            ]
        ) {
            return;
        }


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


        state.portalCooldown =
            1.2;


        buildWorld();


        if (
            target ===
            "village"
        ) {
            state.player.x =
                2900;


            state.player.y =
                1140;


            state.player.checkpoint = {
                area:
                    "village",

                x:
                    2900,

                y:
                    1140
            };
        }


        else {
            state.player.x =
                190;


            state.player.y =
                state.world
                    .height /
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


            gainXP(
                25
            );


            showToast(
                `Nova região descoberta: ${REGIONS[target].name}`
            );
        }


        state.keys.clear();


        updateCamera();
    }


    /* =====================================================
       FLAUTA
    ===================================================== */

    function playMemoryFlute() {
        if (
            !hasItem(
                "flautaMemoria"
            )
        ) {
            return;
        }


        if (
            state.player
                .flutePlayed
        ) {
            showToast(
                "A Flauta da Memória já revelou o caminho."
            );

            return;
        }


        state.player.flutePlayed =
            true;


        state.world
            .effects
            .push({
                type:
                    "skillRing",

                x:
                    state.player.x,

                y:
                    state.player.y,

                radius:
                    240,

                color:
                    "#d5e2ef",

                life:
                    1.3,

                maxLife:
                    1.3
            });


        spawnParticles(
            state.player.x,
            state.player.y,

            "#d9edf5",

            30
        );


        showToast(
            "A Flauta da Memória revelou uma passagem esquecida."
        );
    }


    /* =====================================================
       LOJA
    ===================================================== */

    function openShop(npc) {
        state.shopNPC =
            npc;


        state.shopMode =
            "buy";


        document
            .querySelectorAll(
                "#shopTabs .tab"
            )
            .forEach(
                tab => {
                    tab
                        .classList
                        .toggle(
                            "active",

                            tab
                                .dataset
                                .shop ===
                                "buy"
                        );
                }
            );


        must(
            "shopTitle"
        ).textContent =
            `LOJA DE ${npc.name}`;


        renderShop();


        must(
            "shopPanel"
        )
            .classList
            .remove(
                "hidden"
            );
    }


    function createShopRow(
        item,
        actionText,
        onClick,
        extraText = ""
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
                ${item.icon}
            </div>

            <div class="shop-info">

                <strong>
                    ${item.name}
                </strong>

                <small>
                    ${
                        extraText ||
                        `Peso ${item.weight} • Valor base ${item.value}`
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
                OK
            </button>
        `;


        row
            .querySelector(
                "button"
            )
            .addEventListener(
                "click",
                onClick
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


        /* ============================
           COMPRAR
        ============================ */

        if (
            state.shopMode ===
            "buy"
        ) {
            const stock = [
                "pao",
                "carneCaca",

                "pocao",
                "elixir",

                "espadaFerro",

                "armaduraFolha",
                "armaduraAlgodao",
                "armaduraMadeira",
                "armaduraCouro",

                "lanterna"
            ];


            for (
                const id of
                stock
            ) {
                const item =
                    ITEMS[id];


                const alreadyOwnUnique =
                    item.unique &&
                    hasItem(
                        id
                    );


                const row =
                    createShopRow(
                        item,

                        alreadyOwnUnique

                            ? "ADQUIRIDO"

                            : `Comprar por ${item.value}`,

                        () => {
                            if (
                                alreadyOwnUnique
                            ) {
                                return;
                            }


                            if (
                                state.player
                                    .money <
                                item.value
                            ) {
                                showToast(
                                    "Dinheiro insuficiente."
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


                            updateInventory();


                            updateHUD();
                        },

                        id ===
                            "lanterna"

                            ? "350 moedas • Permanente • Acende automaticamente em locais escuros"

                            : id ===
                              "armaduraCouro"

                            ? "Melhor armadura vendida por Doran. Para algo superior, procure o ferreiro."

                            : ""
                    );


                if (
                    alreadyOwnUnique
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


            return;
        }


        /* ============================
           VENDER TUDO
        ============================ */

        const header =
            document
                .createElement(
                    "div"
                );


        header.className =
            "shop-row";


        header.innerHTML = `
            <div class="shop-info">

                <strong>
                    Venda em massa
                </strong>

                <small>
                    Itens equipados, ferramentas, itens únicos,
                    especiais e de missão são protegidos.
                </small>

            </div>

            <button
                class="primary-btn"
                type="button"
            >
                VENDER TUDO
            </button>
        `;


        header
            .querySelector(
                "button"
            )
            .addEventListener(
                "click",
                sellAll
            );


        grid.appendChild(
            header
        );


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
                    0 ||

                !ITEMS[id] ||

                protectedFromSale(
                    id
                )
            ) {
                continue;
            }


            const item =
                ITEMS[id];


            const price =
                Math.max(
                    1,

                    Math.floor(
                        item.value *
                        0.7
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


                        showToast(
                            `${item.name} vendido.`
                        );


                        renderShop();


                        updateInventory();


                        updateHUD();
                    }
                )
            );
        }
    }


    /* =====================================================
       FORJA
    ===================================================== */

    function openForgePanel() {
        closeAllPanels(
            "forgePanelDynamic"
        );


        let panel =
            $(
                "forgePanelDynamic"
            );


        if (
            !panel
        ) {
            panel =
                document
                    .createElement(
                        "div"
                    );


            panel.id =
                "forgePanelDynamic";


            panel.className =
                "modal hidden";


            panel.innerHTML = `
                <div class="modal-card wide-modal">

                    <button
                        class="close-btn panel-close"
                        type="button"
                        data-forge-close
                    >
                        ×
                    </button>

                    <p class="eyebrow">
                        BORIN • FERREIRO
                    </p>

                    <h2>
                        FORJA DE ARMADURAS
                    </h2>

                    <p class="muted">
                        Armaduras avançadas exigem
                        grandes quantidades de minério.
                    </p>

                    <div
                        id="forgeGridDynamic"
                        class="shop-grid"
                    ></div>

                </div>
            `;


            screens.game
                .appendChild(
                    panel
                );


            panel
                .querySelector(
                    "[data-forge-close]"
                )
                .addEventListener(
                    "click",

                    () =>
                        closeDynamicPanel(
                            panel.id
                        )
                );
        }


        renderForgePanel();


        panel
            .classList
            .remove(
                "hidden"
            );
    }


    function renderForgePanel() {
        const grid =
            $(
                "forgeGridDynamic"
            );


        if (
            !grid
        ) {
            return;
        }


        grid.innerHTML =
            "";


        for (
            const [
                armorId,
                recipe
            ] of
            Object.entries(
                ARMOR_UPGRADES
            )
        ) {
            const armor =
                ITEMS[
                    armorId
                ];


            const previous =
                ITEMS[
                    recipe.previous
                ];


            const ownPrevious =
                hasItem(
                    recipe.previous
                ) ||

                state.player
                    .equipment
                    .armor ===
                    recipe.previous;


            const materialsText =
                Object
                    .entries(
                        recipe.materials
                    )
                    .map(
                        (
                            [
                                id,
                                need
                            ]
                        ) =>
                            `${
                                ITEMS[id].icon
                            } ${
                                ITEMS[id].name
                            }: ${
                                state.player
                                    .inventory[id] ||
                                0
                            }/${need}`
                    )
                    .join(
                        " • "
                    );


            const canMaterials =
                Object
                    .entries(
                        recipe.materials
                    )
                    .every(
                        (
                            [
                                id,
                                need
                            ]
                        ) =>
                            (
                                state.player
                                    .inventory[id] ||
                                0
                            ) >=
                            need
                    );


            const canCraft =
                ownPrevious &&
                canMaterials &&
                state.player.money >=
                    recipe.money &&
                !hasItem(
                    armorId
                );


            const row =
                createShopRow(
                    armor,

                    hasItem(
                        armorId
                    )

                        ? "CRIADA"

                        : `${recipe.money} moedas`,

                    () =>
                        craftArmor(
                            armorId
                        ),

                    `Exige ${previous.name} • ${materialsText}`
                );


            row
                .querySelector(
                    "button"
                )
                .disabled =
                !canCraft;


            grid.appendChild(
                row
            );
        }
    }


    function craftArmor(
        armorId
    ) {
        const recipe =
            ARMOR_UPGRADES[
                armorId
            ];


        if (
            !recipe ||
            hasItem(
                armorId
            )
        ) {
            return;
        }


        const previousEquipped =
            state.player
                .equipment
                .armor ===
            recipe.previous;


        const ownPrevious =
            hasItem(
                recipe.previous
            ) ||
            previousEquipped;


        if (
            !ownPrevious
        ) {
            showToast(
                `Você precisa de ${ITEMS[recipe.previous].name}.`
            );

            return;
        }


        for (
            const [
                id,
                need
            ] of
            Object.entries(
                recipe.materials
            )
        ) {
            if (
                (
                    state.player
                        .inventory[id] ||
                    0
                ) <
                need
            ) {
                showToast(
                    `Faltam ${ITEMS[id].name}.`
                );

                return;
            }
        }


        if (
            state.player.money <
            recipe.money
        ) {
            showToast(
                "Moedas insuficientes para a forja."
            );

            return;
        }


        for (
            const [
                id,
                need
            ] of
            Object.entries(
                recipe.materials
            )
        ) {
            removeItem(
                id,
                need
            );
        }


        if (
            previousEquipped
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


        updateEquipment();


        state.world
            .effects
            .push({
                type:
                    "forgeBurst",

                x:
                    state.player.x,

                y:
                    state.player.y,

                radius:
                    80,

                color:
                    "#ff8a52",

                life:
                    0.7,

                maxLife:
                    0.7
            });


        showToast(
            `${ITEMS[armorId].name} forjada e equipada.`
        );


        renderForgePanel();


        updateInventory();


        updateHUD();
    }


    /* =====================================================
       PAINÉIS DINÂMICOS
    ===================================================== */

    function dynamicPanelOpen(
        id
    ) {
        const panel =
            $(
                id
            );


        return Boolean(
            panel &&
            !panel
                .classList
                .contains(
                    "hidden"
                )
        );
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
            panel
                .classList
                .add(
                    "hidden"
                );
        }
    }


    /* =====================================================
       STATUS
    ===================================================== */

    function openStatusPanel() {
        if (
            !state.player
        ) {
            return;
        }


        closeAllPanels(
            "statusPanelDynamic"
        );


        let panel =
            $(
                "statusPanelDynamic"
            );


        if (
            !panel
        ) {
            panel =
                document
                    .createElement(
                        "div"
                    );


            panel.id =
                "statusPanelDynamic";


            panel.className =
                "modal hidden";


            panel.innerHTML = `
                <div class="modal-card wide-modal">

                    <button
                        class="close-btn panel-close"
                        type="button"
                        data-status-close
                    >
                        ×
                    </button>

                    <p class="eyebrow">
                        PROGRESSÃO
                    </p>

                    <h2>
                        STATUS
                    </h2>

                    <p
                        id="statusPointsDynamic"
                        class="muted"
                    ></p>

                    <div
                        id="statusGridDynamic"
                        class="shop-grid"
                    ></div>

                </div>
            `;


            screens.game
                .appendChild(
                    panel
                );


            panel
                .querySelector(
                    "[data-status-close]"
                )
                .addEventListener(
                    "click",

                    () =>
                        closeDynamicPanel(
                            panel.id
                        )
                );
        }


        renderStatusPanel();


        panel
            .classList
            .remove(
                "hidden"
            );
    }


    function renderStatusPanel() {
        const grid =
            $(
                "statusGridDynamic"
            );


        if (
            !grid ||
            !state.player
        ) {
            return;
        }


        $(
            "statusPointsDynamic"
        ).textContent =
            `Nível ${state.player.level}/${MAX_LEVEL} • Pontos disponíveis: ${state.player.statPoints || 0}`;


        grid.innerHTML =
            "";


        for (
            const [
                key,
                config
            ] of
            Object.entries(
                STAT_CONFIG
            )
        ) {
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
                        ${config.name}: ${current}/${config.cap}
                    </strong>

                    <small>
                        ${config.description}
                    </small>

                </div>

                <button
                    class="primary-btn"
                    type="button"
                >
                    +1
                </button>
            `;


            const button =
                row
                    .querySelector(
                        "button"
                    );


            button.disabled =
                current >=
                    config.cap ||

                (
                    state.player
                        .statPoints ||
                    0
                ) <=
                0;


            button.addEventListener(
                "click",

                () =>
                    allocateStatPoint(
                        key
                    )
            );


            grid.appendChild(
                row
            );
        }
    }


    function allocateStatPoint(
        key
    ) {
        const config =
            STAT_CONFIG[
                key
            ];


        if (
            !config ||
            !state.player
        ) {
            return;
        }


        const current =
            state.player
                .stats[
                    key
                ] ||
            0;


        if (
            current >=
                config.cap ||

            state.player
                .statPoints <=
                0
        ) {
            return;
        }


        state.player
            .stats[
                key
            ] =
            current +
            1;


        state.player.statPoints--;


        const oldMaxHp =
            state.player
                .maxHp;


        const oldMaxEnergy =
            state.player
                .maxEnergy;


        const oldMaxHunger =
            state.player
                .maxHunger;


        const oldMaxFatigue =
            state.player
                .maxFatigue;


        applyStatBonuses(
            false
        );


        if (
            key ===
            "hp"
        ) {
            state.player.hp +=
                state.player
                    .maxHp -
                oldMaxHp;
        }


        if (
            key ===
            "energy"
        ) {
            state.player.energy +=
                state.player
                    .maxEnergy -
                oldMaxEnergy;
        }


        if (
            key ===
            "hunger"
        ) {
            state.player.hunger +=
                state.player
                    .maxHunger -
                oldMaxHunger;
        }


        if (
            key ===
            "fatigue"
        ) {
            state.player.fatigue +=
                state.player
                    .maxFatigue -
                oldMaxFatigue;
        }


        renderStatusPanel();


        updateHUD();
    }


    /* =====================================================
       LIVRO
    ===================================================== */

    function renderBook() {
        const book =
            must(
                "bossBook"
            );


        book.innerHTML =
            "";


        for (
            const boss of
            BOSS_REGISTRY
        ) {
            const discovered =
                state.player
                    .discoveredBosses
                    .includes(
                        boss.id
                    ) ||

                hasDefeatedBoss(
                    boss.id
                );


            const defeated =
                hasDefeatedBoss(
                    boss.id
                );


            const entry =
                document
                    .createElement(
                        "div"
                    );


            entry.className =
                "book-entry";


            if (
                !discovered
            ) {
                entry.innerHTML = `
                    <strong>
                        ???
                    </strong>

                    <p class="muted">
                        Esta memória ainda não foi descoberta.
                    </p>
                `;
            }


            else {
                entry.innerHTML = `
                    <strong>
                        ${boss.icon}
                        ${boss.name}
                        ${
                            defeated
                                ? "✓"
                                : ""
                        }
                    </strong>

                    <p>
                        ${boss.description}
                    </p>

                    <small>
                        “${boss.quote}”
                    </small>
                `;
            }


            book.appendChild(
                entry
            );
        }
    }


    /* =====================================================
       FINAL
    ===================================================== */

    function openFinalChoice() {
        state.finalChoiceShown =
            true;


        state.paused =
            true;


        const choice =
            window.confirm(
                "Uma figura idêntica a você oferece uma escolha: aceitar a Quietude Absoluta.\n\nOK = aceitar.\nCancelar = lutar."
            );


        state.player.finalChoice =
            choice
                ? "join"
                : "fight";


        state.paused =
            false;


        if (
            choice
        ) {
            showEnding(
                "Você escolheu a Quietude Absoluta. Veyra finalmente ficou em silêncio."
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


            boss.state =
                "chasing";


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
        )
            .classList
            .remove(
                "hidden"
            );


        setTimeout(
            () => {
                must(
                    "transitionScreen"
                )
                    .classList
                    .add(
                        "hidden"
                    );


                showScreen(
                    "menu"
                );


                updateContinueButton();
            },

            2600
        );
    }


    /* =====================================================
       PARTÍCULAS
    ===================================================== */

    function spawnParticles(
        x,
        y,
        color,
        amount = 10
    ) {
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


            const speed =
                random(
                    25,
                    110
                );


            const life =
                random(
                    0.35,
                    0.85
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

                    life,

                    maxLife:
                        life,

                    size:
                        random(
                            2,
                            5
                        ),

                    color
                });
        }
    }


    /* =====================================================
       ATUALIZAÇÃO DOS EFEITOS
    ===================================================== */

    function updateVisualEffects(dt) {
        updateActiveProjectiles(
            dt
        );


        state.world.particles =
            state.world
                .particles
                .filter(
                    particle => {
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


                        return (
                            particle.life >
                            0
                        );
                    }
                );


        state.world.effects =
            state.world
                .effects
                .filter(
                    effect => {
                        if (
                            typeof effect
                                .life ===
                            "number"
                        ) {
                            effect.life -=
                                dt;
                        }


                        return (
                            effect.life ===
                                undefined ||

                            effect.life >
                                0
                        );
                    }
                );
    }
