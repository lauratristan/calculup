/**
 * CALCUL UP - MODULE DONNÉES
 * Constantes, configuration et base de données
 */

window.CalculUpData = (function() {
    'use strict';

    // =============================================================================
    // CONFIGURATION FIREBASE
    // =============================================================================
    
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyAD13NO-Hj0dH3zHkbSD1fk9GYwczll5mw",
        authDomain: "calculup.firebaseapp.com",
        projectId: "calculup",
        storageBucket: "calculup.appspot.com",
        messagingSenderId: "845519869739",
        appId: "1:845519869739:web:5c8b9bef4d5a8f3a7d9e1c"
    };

    // =============================================================================
    // NIVEAUX DE FONCTIONNALITÉS DÉBLOQUABLES
    // =============================================================================
    
    const FEATURE_LEVELS = {
        addFriends: 3,
        multiplayer: 5,
        joinTournaments: 7,
        createTournaments: 10,
        createQuestions: 2,
        becomeAdmin: 20
    };

    // =============================================================================
    // CURRICULUM DÉTAILLÉ PAR NIVEAU
    // =============================================================================
    
    const CURRICULUM = {
        seconde: {
            'Algèbre': {
                'Équations et inéquations': [
                    'Équations du 1er degré', 
                    'Inéquations', 
                    'Systèmes d\'équations'
                ],
                'Fonctions': [
                    'Fonctions affines', 
                    'Fonctions de référence', 
                    'Variations'
                ],
                'Calcul littéral': [
                    'Développement', 
                    'Factorisation', 
                    'Identités remarquables'
                ]
            },
            'Géométrie': {
                'Géométrie plane': [
                    'Triangles', 
                    'Quadrilatères', 
                    'Cercles'
                ],
                'Vecteurs': [
                    'Vecteurs', 
                    'Coordonnées', 
                    'Colinéarité'
                ],
                'Trigonométrie': [
                    'Cosinus', 
                    'Sinus', 
                    'Angles orientés'
                ]
            },
            'Statistiques': {
                'Statistiques descriptives': [
                    'Moyenne', 
                    'Médiane', 
                    'Quartiles'
                ],
                'Probabilités': [
                    'Probabilités simples', 
                    'Événements', 
                    'Arbres'
                ]
            }
        },
        premiere: {
            'Analyse': {
                'Dérivation': [
                    'Nombre dérivé', 
                    'Fonction dérivée', 
                    'Dérivées usuelles', 
                    'Opérations sur les dérivées'
                ],
                'Applications de la dérivée': [
                    'Variations', 
                    'Tangentes', 
                    'Optimisation'
                ],
                'Fonction exponentielle': [
                    'Définition', 
                    'Propriétés', 
                    'Dérivée', 
                    'Équations'
                ],
                'Suites': [
                    'Suites arithmétiques', 
                    'Suites géométriques', 
                    'Variations', 
                    'Limites'
                ],
                'Limites': [
                    'Limites en l\'infini', 
                    'Limites finies', 
                    'Asymptotes'
                ]
            },
            'Géométrie': {
                'Produit scalaire': [
                    'Définition', 
                    'Propriétés', 
                    'Applications'
                ],
                'Géométrie repérée': [
                    'Équations de droites', 
                    'Cercles', 
                    'Paraboles'
                ],
                'Trigonométrie': [
                    'Cercle trigonométrique', 
                    'Formules', 
                    'Équations'
                ]
            },
            'Probabilités': {
                'Probabilités conditionnelles': [
                    'Définition', 
                    'Indépendance', 
                    'Formule des probabilités totales'
                ],
                'Variables aléatoires': [
                    'Loi de probabilité', 
                    'Espérance', 
                    'Variance'
                ],
                'Loi binomiale': [
                    'Schéma de Bernoulli', 
                    'Loi binomiale', 
                    'Paramètres'
                ]
            }
        },
        terminale: {
            'Analyse': {
                'Continuité et dérivabilité': [
                    'Théorèmes', 
                    'Applications'
                ],
                'Fonction logarithme': [
                    'Définition', 
                    'Propriétés', 
                    'Dérivée'
                ],
                'Primitives et intégrales': [
                    'Primitives usuelles', 
                    'Calcul intégral', 
                    'Aires'
                ],
                'Équations différentielles': [
                    'Équations du 1er ordre', 
                    'Applications'
                ]
            },
            'Géométrie': {
                'Géométrie dans l\'espace': [
                    'Vecteurs 3D', 
                    'Plans', 
                    'Droites'
                ],
                'Produit scalaire dans l\'espace': [
                    'Définition', 
                    'Applications'
                ]
            },
            'Probabilités': {
                'Lois continues': [
                    'Loi uniforme', 
                    'Loi exponentielle', 
                    'Loi normale'
                ],
                'Estimation': [
                    'Intervalles de confiance', 
                    'Tests'
                ]
            }
        }
    };

    // =============================================================================
    // BASE DE QUESTIONS SYSTÈME
    // =============================================================================
    
    const DEFAULT_QUESTIONS = [
        // === SECONDE ===
        // Algèbre - Équations
        {
            id: 'eq_001',
            question: "Résoudre l'équation : 3x + 7 = 22",
            type: 'open',
            answer: "5",
            variants: ["5.0", "5,0", "x=5", "x = 5"],
            chapter: "Équations et inéquations",
            notion: "Équations du 1er degré",
            difficulty: "facile",
            hint: "Isole x en soustrayant 7 puis en divisant par 3",
            points: 8,
            timeLimit: 20,
            level: 'seconde',
            creator: 'system',
            verified: true
        },
        {
            id: 'eq_002',
            question: "Quelle est la solution de l'inéquation 2x - 3 > 7 ?",
            type: 'qcm',
            choices: ["x > 5", "x < 5", "x > 2", "x < 2"],
            correctChoice: 0,
            chapter: "Équations et inéquations",
            notion: "Inéquations",
            difficulty: "moyen",
            hint: "Ajoute 3 puis divise par 2, sans changer le sens de l'inégalité",
            points: 10,
            timeLimit: 25,
            level: 'seconde',
            creator: 'system',
            verified: true
        },
        
        // Fonctions
        {
            id: 'func_001',
            question: "Quelle est l'image de 2 par la fonction f(x) = x² - 3x + 1 ?",
            type: 'qcm',
            choices: ["-1", "1", "3", "5"],
            correctChoice: 0,
            chapter: "Fonctions",
            notion: "Fonctions de référence",
            difficulty: "facile",
            hint: "Remplace x par 2 dans l'expression : f(2) = 2² - 3×2 + 1",
            points: 8,
            timeLimit: 20,
            level: 'seconde',
            creator: 'system',
            verified: true
        },
        {
            id: 'func_002',
            question: "Développer (x + 3)²",
            type: 'open',
            answer: "x²+6x+9",
            variants: ["x² + 6x + 9", "x^2+6x+9", "x²+6x+9"],
            chapter: "Calcul littéral",
            notion: "Identités remarquables",
            difficulty: "facile",
            hint: "(a+b)² = a² + 2ab + b²",
            points: 8,
            timeLimit: 20,
            level: 'seconde',
            creator: 'system',
            verified: true
        },

        // Géométrie
        {
            id: 'geo_001',
            question: "Dans un triangle ABC rectangle en A, si AB = 3 et AC = 4, que vaut BC ?",
            type: 'open',
            answer: "5",
            variants: ["5.0", "5,0", "5"],
            chapter: "Géométrie plane",
            notion: "Triangles",
            difficulty: "facile",
            hint: "Utilise le théorème de Pythagore : BC² = AB² + AC²",
            points: 10,
            timeLimit: 25,
            level: 'seconde',
            creator: 'system',
            verified: true
        },
        {
            id: 'geo_002',
            question: "Quelle est la valeur de cos(60°) ?",
            type: 'qcm',
            choices: ["1/2", "√3/2", "√2/2", "1"],
            correctChoice: 0,
            chapter: "Trigonométrie",
            notion: "Cosinus",
            difficulty: "moyen",
            hint: "C'est une valeur remarquable à connaître par cœur",
            points: 10,
            timeLimit: 15,
            level: 'seconde',
            creator: 'system',
            verified: true
        },

        // === PREMIÈRE ===
        // Dérivation
        {
            id: 'der_001',
            question: "Dériver la fonction f(x) = 3x² - 5x + 2",
            type: 'open',
            answer: "6x-5",
            variants: ["6x - 5", "6*x-5", "6x-5", "6 x - 5"],
            chapter: "Dérivation",
            notion: "Dérivées usuelles",
            difficulty: "facile",
            hint: "Utilise la règle : (xⁿ)' = n·xⁿ⁻¹ et (ax+b)' = a",
            points: 10,
            timeLimit: 25,
            level: 'premiere',
            creator: 'system',
            verified: true
        },
        {
            id: 'der_002',
            question: "Dériver f(x) = (2x + 1) × (x² - 3)",
            type: 'open',
            answer: "6x²+2x-6",
            variants: ["6x² + 2x - 6", "6x^2+2x-6", "6x²+2x-6"],
            chapter: "Dérivation",
            notion: "Opérations sur les dérivées",
            difficulty: "moyen",
            hint: "Utilise la règle (u×v)' = u'×v + u×v' ou développe d'abord",
            points: 15,
            timeLimit: 35,
            level: 'premiere',
            creator: 'system',
            verified: true
        },
        {
            id: 'der_003',
            question: "Quelle est la dérivée de f(x) = eˣ ?",
            type: 'qcm',
            choices: ["eˣ", "x·eˣ⁻¹", "1", "ln(x)"],
            correctChoice: 0,
            chapter: "Fonction exponentielle",
            notion: "Dérivée",
            difficulty: "facile",
            hint: "La fonction exponentielle est égale à sa propre dérivée",
            points: 8,
            timeLimit: 15,
            level: 'premiere',
            creator: 'system',
            verified: true
        },

        // Suites
        {
            id: 'sui_001',
            question: "Calculer u₅ si u₁ = 3 et uₙ₊₁ = 2uₙ + 1",
            type: 'open',
            answer: "63",
            variants: ["63.0", "63,0", "63"],
            chapter: "Suites",
            notion: "Suites géométriques",
            difficulty: "moyen",
            hint: "Calcule terme après terme : u₂ = 2×3+1 = 7, u₃ = 2×7+1 = 15...",
            points: 15,
            timeLimit: 40,
            level: 'premiere',
            creator: 'system',
            verified: true
        },
        {
            id: 'sui_002',
            question: "Une suite géométrique a pour premier terme u₁ = 4 et raison q = 3. Que vaut u₄ ?",
            type: 'open',
            answer: "108",
            variants: ["108.0", "108,0", "108"],
            chapter: "Suites",
            notion: "Suites géométriques",
            difficulty: "moyen",
            hint: "Dans une suite géométrique : uₙ = u₁ × qⁿ⁻¹",
            points: 12,
            timeLimit: 25,
            level: 'premiere',
            creator: 'system',
            verified: true
        },

        // Probabilités
        {
            id: 'prob_001',
            question: "Si P(A) = 0.3 et P(B) = 0.4, et A et B sont indépendants, calculer P(A ∩ B)",
            type: 'open',
            answer: "0.12",
            variants: ["0,12", "12/100", "3/25", "0.12"],
            chapter: "Probabilités conditionnelles",
            notion: "Indépendance",
            difficulty: "moyen",
            hint: "Pour des événements indépendants : P(A ∩ B) = P(A) × P(B)",
            points: 15,
            timeLimit: 30,
            level: 'premiere',
            creator: 'system',
            verified: true
        },
        {
            id: 'prob_002',
            question: "Dans une loi binomiale B(10, 0.3), que vaut l'espérance ?",
            type: 'open',
            answer: "3",
            variants: ["3.0", "3,0", "3"],
            chapter: "Loi binomiale",
            notion: "Paramètres",
            difficulty: "facile",
            hint: "Pour une loi binomiale B(n,p) : E(X) = n×p",
            points: 10,
            timeLimit: 20,
            level: 'premiere',
            creator: 'system',
            verified: true
        },

        // Trigonométrie
        {
            id: 'trigo_001',
            question: "Résoudre l'équation cos(x) = 1/2 sur [0, 2π]",
            type: 'open',
            answer: "π/3 et 5π/3",
            variants: ["π/3;5π/3", "60° et 300°", "π/3, 5π/3", "π/3 et 5π/3"],
            chapter: "Trigonométrie",
            notion: "Équations",
            difficulty: "moyen",
            hint: "Pense au cercle trigonométrique et aux angles remarquables",
            points: 15,
            timeLimit: 35,
            level: 'premiere',
            creator: 'system',
            verified: true
        },

        // === TERMINALE ===
        // Logarithmes
        {
            id: 'log_001',
            question: "Simplifier ln(e³)",
            type: 'open',
            answer: "3",
            variants: ["3.0", "3,0", "3"],
            chapter: "Fonction logarithme",
            notion: "Propriétés",
            difficulty: "facile",
            hint: "ln et exp sont des fonctions réciproques",
            points: 8,
            timeLimit: 15,
            level: 'terminale',
            creator: 'system',
            verified: true
        },
        {
            id: 'log_002',
            question: "Quelle est la dérivée de ln(x) ?",
            type: 'qcm',
            choices: ["1/x", "ln(x)", "x", "eˣ"],
            correctChoice: 0,
            chapter: "Fonction logarithme",
            notion: "Dérivée",
            difficulty: "facile",
            hint: "C'est une dérivée fondamentale à connaître par cœur",
            points: 8,
            timeLimit: 15,
            level: 'terminale',
            creator: 'system',
            verified: true
        },

        // Intégrales
        {
            id: 'int_001',
            question: "Calculer ∫₀¹ 2x dx",
            type: 'open',
            answer: "1",
            variants: ["1.0", "1,0", "1"],
            chapter: "Primitives et intégrales",
            notion: "Primitives usuelles",
            difficulty: "moyen",
            hint: "La primitive de 2x est x²",
            points: 12,
            timeLimit: 30,
            level: 'terminale',
            creator: 'system',
            verified: true
        },
        {
            id: 'int_002',
            question: "Quelle est une primitive de f(x) = 3x² + 2x - 1 ?",
            type: 'qcm',
            choices: ["x³ + x² - x + C", "6x + 2", "3x³ + 2x² - x", "x³ + x² - x"],
            correctChoice: 0,
            chapter: "Primitives et intégrales",
            notion: "Primitives usuelles",
            difficulty: "moyen",
            hint: "La primitive de xⁿ est xⁿ⁺¹/(n+1)",
            points: 12,
            timeLimit: 25,
            level: 'terminale',
            creator: 'system',
            verified: true
        },

        // Lois continues
        {
            id: 'loi_001',
            question: "Dans une loi normale N(100, 15²), que vaut la médiane ?",
            type: 'open',
            answer: "100",
            variants: ["100.0", "100,0", "100"],
            chapter: "Lois continues",
            notion: "Loi normale",
            difficulty: "facile",
            hint: "Dans une loi normale, moyenne = médiane",
            points: 8,
            timeLimit: 20,
            level: 'terminale',
            creator: 'system',
            verified: true
        }
    ];

    // =============================================================================
    // DOMAINES ACADÉMIQUES POUR VALIDATION ENSEIGNANTS
    // =============================================================================
    
    // =============================================================================
// DOMAINES ACADÉMIQUES POUR VALIDATION ENSEIGNANTS (VERSION ÉTENDUE)
// =============================================================================

const ACADEMIC_DOMAINS = [
    // Domaines académiques officiels France
    'ac-aix-marseille.fr', 'ac-amiens.fr', 'ac-besancon.fr', 'ac-bordeaux.fr',
    'ac-caen.fr', 'ac-clermont.fr', 'ac-corse.fr', 'ac-creteil.fr',
    'ac-dijon.fr', 'ac-grenoble.fr', 'ac-lille.fr', 'ac-limoges.fr',
    'ac-lyon.fr', 'ac-montpellier.fr', 'ac-nancy-metz.fr', 'ac-nantes.fr',
    'ac-nice.fr', 'ac-orleans-tours.fr', 'ac-paris.fr', 'ac-poitiers.fr',
    'ac-reims.fr', 'ac-rennes.fr', 'ac-rouen.fr', 'ac-strasbourg.fr',
    'ac-toulouse.fr', 'ac-versailles.fr',
    
    // Autres domaines éducation
    'education.gouv.fr', 'educagri.fr', 'cned.fr',
    
    // Universités et établissements
    'univ-', '.edu', 'sorbonne-universite.fr', 'u-paris.fr',
    'polytechnique.edu', 'ens.fr', 'centrale-', 'mines-',
    
    // Établissements scolaires
    'lycee', 'college', 'ecole', 'institution',
    
    // DOM-TOM
    'ac-guadeloupe.fr', 'ac-guyane.fr', 'ac-martinique.fr', 'ac-reunion.fr',
    'ac-mayotte.fr', 'ac-nouvelle-caledonie.nc', 'ac-polynesie.pf',
    
    // International francophone
    'ac-', '.edu.', 'univ.', 'lycee.'
];

    // =============================================================================
    // SYMBOLES MATHÉMATIQUES POUR CLAVIER
    // =============================================================================
    
    const MATH_SYMBOLS = [
        'π', '∞', '√', '²', '³', '^', '∫', '∑', '∆', '±', 
        '≤', '≥', '≠', '≈', '∈', '∩', '∪', '⊂', '⊃', '∅',
        'sin', 'cos', 'tan', 'ln', 'log', 'e', 'exp',
        '(', ')', '[', ']', '{', '}', '/', '*', '+', '-', '=', '.'
    ];

    // =============================================================================
    // CONFIGURATION XP ET NIVEAUX
    // =============================================================================
    
    const XP_CONFIG = {
        baseXpPerLevel: 500,
        bonusQuestionCorrect: 15,
        bonusSessionComplete: 25,
        bonusQuestionCreated: 25,
        bonusReportValidated: 10,
        penaltyReportAbusive: -20
    };

    // =============================================================================
    // MESSAGES ET TEXTES
    // =============================================================================
    
    const MESSAGES = {
        loading: {
            init: "Initialisation...",
            firebase: "Connexion Firebase...",
            questions: "Chargement des questions...",
            profile: "Chargement du profil..."
        },
        feedback: {
            correct: "✅ Excellent !",
            incorrect: "❌ Pas tout à fait...",
            timeout: "⏰ Temps écoulé !",
            perfect: "🎉 Parfait !",
            goodJob: "👍 Bien joué !",
            keepTrying: "💪 Continue tes efforts !"
        },
        errors: {
            emailRequired: "Email requis",
            passwordRequired: "Mot de passe requis",
            firstnameRequired: "Prénom requis",
            academicEmail: "Utilisez votre email professionnel",
            accountPending: "Compte en attente de vérification",
            accountSuspended: "Compte suspendu",
            noQuestions: "Aucune question disponible",
            networkError: "Erreur réseau"
        }
    };

    // =============================================================================
    // API PUBLIQUE DU MODULE
    // =============================================================================
    
    return {
        // Configuration
        getFirebaseConfig: () => FIREBASE_CONFIG,
        getFeatureLevels: () => FEATURE_LEVELS,
        getXpConfig: () => XP_CONFIG,
        
        // Curriculum
        getCurriculum: (level) => level ? CURRICULUM[level] : CURRICULUM,
        getAllNotions: (level) => {
            const curriculum = level ? CURRICULUM[level] : null;
            if (!curriculum) return [];
            
            const notions = [];
            Object.values(curriculum).forEach(domain => {
                Object.values(domain).forEach(notionList => {
                    notions.push(...notionList);
                });
            });
            return notions;
        },
        
        // Questions
        getDefaultQuestions: (filters = {}) => {
            let questions = [...DEFAULT_QUESTIONS];
            
            if (filters.level) {
                questions = questions.filter(q => q.level === filters.level);
            }
            if (filters.chapter) {
                questions = questions.filter(q => q.chapter === filters.chapter);
            }
            if (filters.notion) {
                questions = questions.filter(q => q.notion === filters.notion);
            }
            if (filters.difficulty) {
                questions = questions.filter(q => q.difficulty === filters.difficulty);
            }
            
            return questions;
        },
        
        // Validation
        // Validation (VERSION AMÉLIORÉE)
isAcademicEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    
    const emailLower = email.toLowerCase();
    const domain = emailLower.split('@')[1];
    
    if (!domain) return false;
    
    // Vérification stricte des domaines académiques
    return ACADEMIC_DOMAINS.some(acadDomain => {
        if (acadDomain.endsWith('.')) {
            // Domaines partiels comme "lycee." ou "univ."
            return domain.includes(acadDomain.slice(0, -1));
        } else if (acadDomain.startsWith('.')) {
            // Extensions comme ".edu"
            return domain.endsWith(acadDomain);
        } else if (acadDomain.endsWith('-')) {
            // Préfixes comme "ac-" ou "centrale-"
            return domain.includes(acadDomain);
        } else {
            // Domaines complets
            return domain === acadDomain || domain.endsWith('.' + acadDomain);
        }
    });
},
        
        // Utilitaires
        getMathSymbols: () => MATH_SYMBOLS,
        getMessages: () => MESSAGES,
        
        // Formatage
        formatMath: (text) => {
            if (!text) return text;
            
            return text
                .replace(/x\^2/g, 'x²')
                .replace(/x\^3/g, 'x³')
                .replace(/x\^n/g, 'xⁿ')
                .replace(/u_1/g, 'u₁')
                .replace(/u_2/g, 'u₂')
                .replace(/u_n/g, 'uₙ')
                .replace(/u_{n\+1}/g, 'uₙ₊₁')
                .replace(/\\int/g, '∫')
                .replace(/\\pi/g, 'π')
                .replace(/\\infty/g, '∞')
                .replace(/\\sum/g, 'Σ')
                .replace(/\\Delta/g, 'Δ')
                .replace(/\\cdot/g, '·')
                .replace(/\\le/g, '≤')
                .replace(/\\ge/g, '≥')
                .replace(/\\ne/g, '≠')
                .replace(/\\cap/g, '∩')
                .replace(/\\cup/g, '∪');
        },
        
        // Calculs XP
        calculateXpForLevel: (level) => level * XP_CONFIG.baseXpPerLevel,
        calculateLevelFromXp: (xp) => Math.floor(xp / XP_CONFIG.baseXpPerLevel) + 1,
        
        // Points par difficulté
        getPointsForDifficulty: (difficulty) => {
            switch (difficulty) {
                case 'facile': return 8;
                case 'moyen': return 12;
                case 'difficile': return 18;
                default: return 10;
            }
        }
    };
})();