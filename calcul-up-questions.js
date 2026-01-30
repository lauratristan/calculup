// =============================================================================
// CALCUL UP - MODULE QUESTIONS (VERSION MISE À JOUR)
// Nouveau système de points : 0 à la création, 5-10 selon validation
// =============================================================================

const CalculUpQuestions = (function() {
    'use strict';

    // Variables globales du module
    let currentQuestion = {
        type: 'qcm',
        difficulty: 'moyen',
        chapter: '',
        notion: '',
        question: '',
        choices: ['', '', '', ''],
        correctChoice: 0,
        answer: '',
        variants: [],
        explanation: '',
        hint: '',
        points: 10,
        timeLimit: 30
    };

    let questionsCache = new Map();
    let validationQueue = [];
    let activeMathKeyboard = null;

    // ==========================================================================
    // CONSTANTES ET CONFIGURATION (🆕 MODIFIÉES)
    // ==========================================================================
    
    const MATH_SYMBOLS = [
        { char: 'π', name: 'Pi' },
        { char: '∞', name: 'Infini' },
        { char: '√', name: 'Racine carrée' },
        { char: '²', name: 'Au carré' },
        { char: '³', name: 'Au cube' },
        { char: '^', name: 'Puissance' },
        { char: '∫', name: 'Intégrale' },
        { char: '∑', name: 'Somme' },
        { char: '±', name: 'Plus ou moins' },
        { char: '≤', name: 'Inférieur ou égal' },
        { char: '≥', name: 'Supérieur ou égal' },
        { char: '≠', name: 'Différent de' },
        { char: '×', name: 'Multiplication' },
        { char: '÷', name: 'Division' },
        { char: '°', name: 'Degré' },
        { char: 'α', name: 'Alpha' },
        { char: 'β', name: 'Bêta' },
        { char: 'θ', name: 'Thêta' }
    ];

    // 🆕 NOUVEAU SYSTÈME DE RÉCOMPENSES
    const QUESTION_REWARDS = {
        creation: 0,           // PLUS DE POINTS À LA CRÉATION
        validated: 5,          // 5 POINTS SI VALIDÉE
        excellent: 10          // 10 POINTS SI EXCELLENTE
    };

    const DIFFICULTY_SETTINGS = {
        facile: { points: 8, timeLimit: 25 },
        moyen: { points: 10, timeLimit: 30 },
        difficile: { points: 15, timeLimit: 45 }
    };

    // ==========================================================================
    // UTILITAIRES ET HELPERS
    // ==========================================================================

    function canUserSeeAnswers() {
        const user = CalculUpCore.getUser();
        
        if (!user) return false;
        if (user.type === 'student' || user.type === 'admin') return true;
        if (user.type === 'teacher' && user.status === 'active') return true;
        if (user.type === 'teacher' && user.status !== 'active') return false;
        
        return true;
    }

    function getAnswerLimitationMessage() {
        const user = CalculUpCore.getUser();
        
        if (user?.type === 'teacher' && user?.status === 'provisional_access') {
            return `
                <div class="answer-section bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-amber-800 mb-2">🔒 Réponse masquée - Accès provisoire</h4>
                            <p class="text-amber-700 text-sm mb-3">
                                La réponse et l'explication sont masquées car votre compte enseignant dispose d'un accès provisoire.
                            </p>
                            <div class="bg-amber-100 p-3 rounded-lg">
                                <p class="text-amber-800 text-sm">
                                    <strong>✅ Ce que vous pouvez faire :</strong><br>
                                    • Consulter l'énoncé de la question<br>
                                    • Mettre la question en favoris ⭐<br>
                                    • Créer vos propres questions
                                </p>
                            </div>
                            <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p class="text-blue-700 text-sm">
                                    <strong>🚀 Après validation complète :</strong><br>
                                    Accès complet aux réponses et explications de toutes les questions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="answer-section bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                    </svg>
                    <h4 class="font-semibold text-red-800">Réponse non disponible</h4>
                </div>
                <p class="text-red-700 text-sm mt-2">
                    Votre compte doit être validé pour accéder aux réponses.
                </p>
            </div>
        `;
    }

    function cleanupMathKeyboard() {
        if (activeMathKeyboard) {
            const keyboard = document.getElementById('math-keyboard-questions');
            if (keyboard) {
                keyboard.remove();
            }
            activeMathKeyboard = null;
        }
    }

    function formatMathExpression(text) {
        if (!text) return '';
        
        return text
            .replace(/\*\*/g, '^')
            .replace(/\^2/g, '²')
            .replace(/\^3/g, '³')
            .replace(/\^4/g, '⁴')
            .replace(/\^5/g, '⁵')
            .replace(/\^6/g, '⁶')
            .replace(/\^7/g, '⁷')
            .replace(/\^8/g, '⁸')
            .replace(/\^9/g, '⁹')
            .replace(/sqrt\(/g, '√(')
            .replace(/pi/g, 'π')
            .replace(/infinity/g, '∞')
            .replace(/sum/g, '∑')
            .replace(/integral/g, '∫')
            .replace(/>=/g, '≥')
            .replace(/<=/g, '≤')
            .replace(/!=/g, '≠')
            .replace(/\+\-/g, '±');
    }

    function generateQuestionId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function validateQuestionData(questionData) {
        const errors = [];
        
        if (!questionData.question || questionData.question.trim().length < 10) {
            errors.push('La question doit faire au moins 10 caractères');
        }
        
        if (!questionData.chapter || questionData.chapter.trim() === '') {
            errors.push('Veuillez sélectionner un chapitre');
        }
        
        if (!questionData.notion || questionData.notion.trim() === '') {
            errors.push('Veuillez sélectionner une notion');
        }
        
        if (questionData.type === 'qcm') {
            const validChoices = questionData.choices.filter(choice => choice.trim().length > 0);
            if (validChoices.length < 2) {
                errors.push('Au moins 2 choix de réponse sont requis');
            }
            if (questionData.correctChoice < 0 || questionData.correctChoice >= validChoices.length) {
                errors.push('Veuillez sélectionner la bonne réponse');
            }
        } else {
            if (!questionData.answer || questionData.answer.trim().length === 0) {
                errors.push('Veuillez indiquer la réponse correcte');
            }
        }
        
        return errors;
    }

    // ==========================================================================
    // ÉCRAN PRINCIPAL DE CRÉATION (🆕 AVEC NOUVEAU SYSTÈME)
    // ==========================================================================

    function showQuestionCreationScreen() {
        cleanupMathKeyboard();
        
        const user = CalculUpCore.getUser();
        const userLevel = user?.schoolLevel || 'seconde';
        const curriculum = CalculUpData.getCurriculum(userLevel);
        
        const isTeacherProvisional = user?.type === 'teacher' && user?.status === 'provisional_access';
        const isStudent = user?.type === 'student';
        
        // 🆕 NOUVEAU SYSTÈME DE RÉCOMPENSES
        const teacherLimitationBanner = isTeacherProvisional ? `
            <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-amber-800">
                            ⚠️ Limitations du compte provisoire
                        </h3>
                        <div class="mt-2 text-sm text-amber-700">
                            <p>Vos questions créées nécessiteront également une validation admin avant publication. 
                            Récompenses après validation seulement.</p>
                        </div>
                    </div>
                </div>
            </div>
        ` : '';
        
        const html = `
            <div class="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
                <div class="max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-2xl font-bold text-stone-800 mb-2">Créer une question</h1>
                                <p class="text-stone-600">Partagez votre expertise avec la communauté</p>
                            </div>
                            <button onclick="CalculUpCore.navigateToScreen('home')" 
                                    class="p-3 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors">
                                <span class="text-xl">←</span>
                            </button>
                        </div>
                    </div>

                    ${teacherLimitationBanner}

                    <!-- 🆕 NOUVEAU SYSTÈME DE RÉCOMPENSES -->
                    <div class="bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-2xl p-6 mb-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <span class="text-3xl">🎁</span>
                                <div>
                                    <h3 class="text-lg font-semibold text-sky-800">Système de récompenses</h3>
                                    <p class="text-sky-700 text-sm">
                                        <span class="font-bold">Aucun point</span> à la création • 
                                        <span class="font-bold">+5 points</span> si validée • 
                                        <span class="font-bold">+10 points</span> si excellente
                                    </p>
                                    <p class="text-sky-600 text-xs mt-1">
                                        💡 Les points sont attribués après validation par nos modérateurs
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-sky-600">5-10 pts</div>
                                <div class="text-xs text-sky-600">après validation</div>
                            </div>
                        </div>
                    </div>

                    <!-- Configuration de base -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                        <h2 class="text-xl font-semibold text-stone-800 mb-4">Configuration de base</h2>
                        
                        <!-- Type de question -->
                        <div class="mb-6">
                            <label class="block text-stone-700 font-medium mb-3">Type de question</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="CalculUpQuestions.selectQuestionType('qcm')" 
                                        data-type="qcm"
                                        class="question-type-btn p-4 border-2 border-emerald-400 bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-all hover:border-emerald-500">
                                    <div class="text-lg mb-1">📝</div>
                                    <div>QCM (Choix multiples)</div>
                                    <div class="text-xs opacity-70">4 réponses possibles</div>
                                </button>
                                <button onclick="CalculUpQuestions.selectQuestionType('open')" 
                                        data-type="open"
                                        class="question-type-btn p-4 border-2 border-stone-200 text-stone-600 rounded-xl font-medium transition-all hover:border-emerald-300 hover:bg-emerald-50">
                                    <div class="text-lg mb-1">✏️</div>
                                    <div>Réponse libre</div>
                                    <div class="text-xs opacity-70">Saisie manuelle</div>
                                </button>
                            </div>
                        </div>

                        <!-- Difficulté -->
                        <div class="mb-6">
                            <label class="block text-stone-700 font-medium mb-3">Niveau de difficulté</label>
                            <div class="grid grid-cols-3 gap-3">
                                ${Object.entries(DIFFICULTY_SETTINGS).map(([level, settings]) => `
                                    <button onclick="CalculUpQuestions.selectDifficulty('${level}')" 
                                            data-difficulty="${level}"
                                            class="difficulty-btn p-3 border-2 border-stone-200 rounded-xl text-center transition-all hover:border-emerald-300 hover:bg-emerald-50 ${level === 'moyen' ? 'border-emerald-400 bg-emerald-100 text-emerald-700' : 'text-stone-600'}">
                                        <div class="font-medium capitalize">${level}</div>
                                        <div class="text-xs opacity-70">${settings.points} pts • ${settings.timeLimit}s</div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Chapitre et notion -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-stone-700 font-medium mb-3">Chapitre</label>
                                <select id="chapter-select" onchange="CalculUpQuestions.updateNotionsList()" 
                                        class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                                    <option value="">Sélectionnez un chapitre</option>
                                    ${renderChapterOptions(curriculum)}
                                </select>
                            </div>
                            <div>
                                <label class="block text-stone-700 font-medium mb-3">Notion</label>
                                <select id="notion-select" 
                                        class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                                    <option value="">Sélectionnez une notion</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Contenu de la question -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                        <h2 class="text-xl font-semibold text-stone-800 mb-4">Contenu de la question</h2>
                        
                        <div class="mb-6">
                            <label class="block text-stone-700 font-medium mb-3">Énoncé de la question</label>
                            <div class="relative">
                                <textarea id="question-text" 
                                          placeholder="Rédigez votre question... (utilisez le clavier mathématique pour les symboles)"
                                          class="w-full h-32 p-4 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none resize-none"></textarea>
                                <button onclick="CalculUpQuestions.showMathKeyboard('question-text')" 
                                        class="absolute top-3 right-3 px-3 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors text-sm">
                                    𝑓(𝑥)
                                </button>
                            </div>
                        </div>

                        <!-- Interface selon le type -->
                        <div id="answer-interface">
                            ${renderAnswerInterface()}
                        </div>

                        <!-- Explication et indice (optionnels) -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-stone-700 font-medium mb-3">Explication (optionnel)</label>
                                <div class="relative">
                                    <textarea id="explanation-text" 
                                              placeholder="Expliquez la méthode de résolution..."
                                              class="w-full h-24 p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none resize-none"></textarea>
                                    <button onclick="CalculUpQuestions.showMathKeyboard('explanation-text')" 
                                            class="absolute top-2 right-2 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-xs">
                                        𝑓(𝑥)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-stone-700 font-medium mb-3">Indice (optionnel)</label>
                                <div class="relative">
                                    <textarea id="hint-text" 
                                              placeholder="Donnez un indice pour aider..."
                                              class="w-full h-24 p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none resize-none"></textarea>
                                    <button onclick="CalculUpQuestions.showMathKeyboard('hint-text')" 
                                            class="absolute top-2 right-2 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-xs">
                                        𝑓(𝑥)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Avertissement validation -->
                    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                        <div class="flex items-start space-x-3">
                            <span class="text-2xl">👨‍🏫</span>
                            <div>
                                <h3 class="text-lg font-semibold text-blue-800 mb-2">Validation par un modérateur</h3>
                                <p class="text-blue-700 mb-3">
                                    Votre question sera envoyée à nos modérateurs (enseignants ou administrateurs) pour validation avant publication. 
                                    Cela garantit la qualité pédagogique de nos contenus.
                                </p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-600">
                                    <div class="bg-blue-100 p-3 rounded-lg">
                                        <strong>✅ Si validée :</strong><br>
                                        +5 points XP
                                    </div>
                                    <div class="bg-emerald-100 p-3 rounded-lg">
                                        <strong>🌟 Si excellente :</strong><br>
                                        +10 points XP
                                    </div>
                                </div>
                                <div class="mt-3 text-sm text-blue-600">
                                    ⏱️ Délai habituel : 24-48h • 🔔 Le statut sera visible sur votre tableau de bord
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Aperçu et validation -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                        <h2 class="text-xl font-semibold text-stone-800 mb-4">Aperçu</h2>
                        <div id="question-preview" class="border border-stone-200 rounded-xl p-6 bg-stone-50 mb-6">
                            <div class="text-center text-stone-500">
                                L'aperçu apparaîtra ici quand vous commencerez à rédiger...
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <button onclick="CalculUpQuestions.previewQuestion()" 
                                    class="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl transition-colors">
                                Actualiser l'aperçu
                            </button>
                            <button onclick="CalculUpQuestions.submitQuestion()" 
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                                Soumettre la question
                            </button>
                        </div>
                    </div>

                    <!-- Historique des questions créées -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                        <h2 class="text-xl font-semibold text-stone-800 mb-4">Mes questions créées</h2>
                        <div id="user-questions-list">
                            ${renderUserQuestionsList()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const root = document.getElementById('root');
        root.innerHTML = html;
        
        // Initialiser les événements
        setupQuestionFormEvents();
    }

    function renderChapterOptions(curriculum) {
        if (!curriculum) return '';
        
        return Object.entries(curriculum).map(([domain, chapters]) => 
            Object.keys(chapters).map(chapter => 
                `<option value="${chapter}" data-domain="${domain}">${chapter}</option>`
            ).join('')
        ).join('');
    }

    function renderAnswerInterface() {
        if (currentQuestion.type === 'qcm') {
            return `
                <div class="mb-6">
                    <label class="block text-stone-700 font-medium mb-3">Choix de réponses</label>
                    <div class="space-y-3">
                        ${[0, 1, 2, 3].map(index => `
                            <div class="flex items-center space-x-3">
                                <input type="radio" 
                                       name="correct-choice" 
                                       value="${index}" 
                                       id="choice-${index}"
                                       ${index === 0 ? 'checked' : ''}
                                       class="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-500">
                                <label for="choice-${index}" class="font-medium text-emerald-600 min-w-[20px]">${String.fromCharCode(65 + index)}.</label>
                                <div class="flex-1 relative">
                                    <input type="text" 
                                           id="choice-${index}-text"
                                           placeholder="Saisissez le choix ${String.fromCharCode(65 + index)}"
                                           class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                                    <button onclick="CalculUpQuestions.showMathKeyboard('choice-${index}-text')" 
                                            class="absolute top-2 right-2 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-xs">
                                        𝑓(𝑣)
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-sm text-stone-500 mt-2">
                        💡 Cochez la case radio pour indiquer la bonne réponse
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="mb-6">
                    <label class="block text-stone-700 font-medium mb-3">Réponse correcte</label>
                    <div class="relative mb-4">
                        <input type="text" 
                               id="correct-answer"
                               placeholder="Saisissez la réponse correcte"
                               class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                        <button onclick="CalculUpQuestions.showMathKeyboard('correct-answer')" 
                                class="absolute top-2 right-2 px-3 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-sm">
                            𝑓(𝑥)
                        </button>
                    </div>
                    
                    <label class="block text-stone-700 font-medium mb-3">Variantes acceptées (optionnel)</label>
                    <div id="variants-container">
                        <div class="relative mb-3">
                            <input type="text" 
                                   id="variant-0"
                                   placeholder="Autre forme de réponse acceptée"
                                   class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                            <button onclick="CalculUpQuestions.showMathKeyboard('variant-0')" 
                                    class="absolute top-2 right-2 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-xs">
                                𝑓(𝑥)
                            </button>
                        </div>
                    </div>
                    <button onclick="CalculUpQuestions.addVariantField()" 
                            class="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors text-sm">
                        + Ajouter une variante
                    </button>
                </div>
            `;
        }
    }

    // 🆕 FONCTION MISE À JOUR : Affichage des questions utilisateur
    function renderUserQuestionsList() {
    const user = CalculUpCore.getUser();
    const userQuestions = user?.createdQuestions || [];
    
    if (userQuestions.length === 0) {
        return `
            <div class="text-center text-stone-500 py-8">
                <div class="text-4xl mb-4">📝</div>
                <p>Vous n'avez pas encore créé de questions.</p>
                <p class="text-sm">Commencez par créer votre première question ci-dessus !</p>
            </div>
        `;
    }
    
    return `
        <div class="space-y-3">
            ${userQuestions.map(question => {
                // 🆕 DÉTERMINER LES POINTS ET STATUT SELON LE NOUVEAU SYSTÈME
                let earnedPoints = question.earnedPoints || 0;
                let statusBadge = '';
                let statusIcon = '';
                let statusText = '';
                
                if (question.status === 'pending' || !question.verified) {
                    statusBadge = 'bg-amber-100 text-amber-700';
                    statusIcon = '⏳';
                    statusText = 'En attente de validation';
                } else if (question.status === 'validated') {
                    statusBadge = 'bg-emerald-100 text-emerald-700';
                    statusIcon = '✅';
                    statusText = 'Validée (+5 XP)';
                } else if (question.status === 'excellent') {
                    statusBadge = 'bg-violet-100 text-violet-700';
                    statusIcon = '🌟';
                    statusText = 'Excellente (+10 XP)';
                } else if (question.status === 'rejected') {
                    statusBadge = 'bg-rose-100 text-rose-700';
                    statusIcon = '❌';
                    statusText = 'Refusée';
                } else {
                    statusBadge = 'bg-stone-100 text-stone-700';
                    statusIcon = '📝';
                    statusText = 'Brouillon';
                }
                
                // 🆕 INDICATEUR AUTO-VALIDATION pour enseignants
                const isAutoValidated = question.verified && question.status === 'validated' && 
                                       question.userType === 'teacher';
                
                return `
                    <div class="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                        <div>
                            <div class="font-medium text-stone-800">${question.chapter} - ${question.notion}</div>
                            <div class="text-sm text-stone-600 truncate max-w-md">${question.question}</div>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-xs ${statusBadge} px-2 py-1 rounded-full">
                                    ${statusIcon} ${statusText}
                                </span>
                                ${isAutoValidated ? `
                                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        🤖 Auto-validée
                                    </span>
                                ` : ''}
                                ${question.moderatorNote ? `
                                    <span class="text-xs text-stone-500" title="${question.moderatorNote}">
                                        💬 Note du modérateur
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold ${earnedPoints > 0 ? 'text-emerald-600' : 'text-stone-400'}">
                                ${earnedPoints > 0 ? '+' : ''}${earnedPoints} XP
                            </div>
                            <div class="text-xs text-stone-500">
                                ${new Date(question.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 🆕 NOUVELLE FONCTION : Bannière enseignant dans l'interface création
function generateTeacherCreationBanner(user) {
    if (user?.type !== 'teacher') return '';
    
    if (user.status === 'active') {
        return `
            <div class="bg-emerald-50 border-l-4 border-emerald-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-emerald-800">
                            🎓 Privilège enseignant validé
                        </h3>
                        <div class="mt-2 text-sm text-emerald-700">
                            <p><strong>Validation automatique :</strong> Vos questions sont publiées immédiatement sans modération.</p>
                            <p><strong>Récompense :</strong> +5 XP attribués automatiquement à la création.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (user.status === 'provisional_access') {
        return `
            <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-amber-800">
                            ⚠️ Compte avec accès provisoire
                        </h3>
                        <div class="mt-2 text-sm text-amber-700">
                            <p>Vos questions nécessitent une validation admin avant publication.</p>
                            <p><strong>Après validation complète de votre compte :</strong> Validation automatique activée.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    return '';
}
    // ==========================================================================
    // GESTION DES FORMULAIRES
    // ==========================================================================

    function selectQuestionType(type) {
        currentQuestion.type = type;
        
        document.querySelectorAll('.question-type-btn').forEach(btn => {
            btn.classList.remove('border-emerald-400', 'bg-emerald-100', 'text-emerald-700');
            btn.classList.add('border-stone-200', 'text-stone-600');
        });
        
        document.querySelector(`[data-type="${type}"]`).classList.add('border-emerald-400', 'bg-emerald-100', 'text-emerald-700');
        document.querySelector(`[data-type="${type}"]`).classList.remove('border-stone-200', 'text-stone-600');
        
        // Mettre à jour l'interface de réponse
        const answerInterface = document.getElementById('answer-interface');
        if (answerInterface) {
            answerInterface.innerHTML = renderAnswerInterface();
        }
        
        console.log('🔄 Type de question changé:', type);
    }

    function selectDifficulty(difficulty) {
        currentQuestion.difficulty = difficulty;
        const settings = DIFFICULTY_SETTINGS[difficulty];
        currentQuestion.points = settings.points;
        currentQuestion.timeLimit = settings.timeLimit;
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('border-emerald-400', 'bg-emerald-100', 'text-emerald-700');
            btn.classList.add('border-stone-200', 'text-stone-600');
        });
        
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('border-emerald-400', 'bg-emerald-100', 'text-emerald-700');
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.remove('border-stone-200', 'text-stone-600');
        
        console.log('🎯 Difficulté sélectionnée:', difficulty, settings);
    }

    function updateNotionsList() {
        const chapterSelect = document.getElementById('chapter-select');
        const notionSelect = document.getElementById('notion-select');
        
        if (!chapterSelect || !notionSelect) return;
        
        const selectedChapter = chapterSelect.value;
        currentQuestion.chapter = selectedChapter;
        
        // Vider la liste des notions
        notionSelect.innerHTML = '<option value="">Sélectionnez une notion</option>';
        
        if (!selectedChapter) return;
        
        // Récupérer les notions du chapitre sélectionné
        const user = CalculUpCore.getUser();
        const curriculum = CalculUpData.getCurriculum(user?.schoolLevel || 'seconde');
        
        if (curriculum) {
            for (const [domain, chapters] of Object.entries(curriculum)) {
                if (chapters[selectedChapter]) {
                    chapters[selectedChapter].forEach(notion => {
                        const option = document.createElement('option');
                        option.value = notion;
                        option.textContent = notion;
                        notionSelect.appendChild(option);
                    });
                    break;
                }
            }
        }
        
        console.log('📚 Notions mises à jour pour le chapitre:', selectedChapter);
    }

    function setupQuestionFormEvents() {
        // Événements sur les champs de texte pour l'aperçu en temps réel
        const fields = ['question-text', 'explanation-text', 'hint-text', 'correct-answer'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', debounce(updateQuestionPreview, 500));
            }
        });
        
        // Événements sur les choix QCM
        for (let i = 0; i < 4; i++) {
            const choiceField = document.getElementById(`choice-${i}-text`);
            if (choiceField) {
                choiceField.addEventListener('input', debounce(updateQuestionPreview, 500));
            }
        }
        
        // Événement sur la sélection de notion
        const notionSelect = document.getElementById('notion-select');
        if (notionSelect) {
            notionSelect.addEventListener('change', (e) => {
                currentQuestion.notion = e.target.value;
                updateQuestionPreview();
            });
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==========================================================================
    // CLAVIER MATHÉMATIQUE
    // ==========================================================================

    function showMathKeyboard(targetFieldId) {
        console.log('🔢 Ouverture clavier mathématique pour:', targetFieldId);
        
        cleanupMathKeyboard();
        
        const targetField = document.getElementById(targetFieldId);
        if (!targetField) {
            CalculUpCore.showError('Champ cible non trouvé');
            return;
        }
        
        activeMathKeyboard = targetFieldId;
        
        const keyboardHtml = `
            <div id="math-keyboard-questions" class="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto">
                <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-200">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-stone-700">Clavier mathématique</h3>
                        <button onclick="CalculUpQuestions.closeMathKeyboard()" 
                                class="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                            <span class="text-stone-500 text-xl">✕</span>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-6 gap-3 mb-4">
                        ${MATH_SYMBOLS.map(symbol => `
                            <button onclick="CalculUpQuestions.insertMathSymbol('${symbol.char}')" 
                                    class="p-3 bg-stone-50 hover:bg-emerald-100 border border-stone-200 rounded-lg text-center transition-colors"
                                    title="${symbol.name}">
                                <span class="text-xl">${symbol.char}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="border-t border-stone-200 pt-4">
                        <div class="grid grid-cols-5 gap-3">
                            <button onclick="CalculUpQuestions.insertMathSymbol('(')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                ( )
                            </button>
                            <button onclick="CalculUpQuestions.insertMathSymbol('[')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                [ ]
                            </button>
                            <button onclick="CalculUpQuestions.insertMathSymbol('{')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                { }
                            </button>
                            <button onclick="CalculUpQuestions.insertMathSymbol(',')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                ,
                            </button>
                            <button onclick="CalculUpQuestions.clearCurrentField()" 
                                    class="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 font-medium">
                                Clear
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-sm text-stone-500 mt-4 text-center">
                        💡 Édition du champ : ${targetFieldId} • Cliquez sur un symbole pour l'insérer
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', keyboardHtml);
    }

    function insertMathSymbol(symbol) {
        if (!activeMathKeyboard) return;
        
        const targetField = document.getElementById(activeMathKeyboard);
        if (!targetField) return;
        
        const start = targetField.selectionStart;
        const end = targetField.selectionEnd;
        const value = targetField.value;
        
        let symbolToInsert = symbol;
        let cursorOffset = symbol.length;
        
        if (symbol === '(') {
            symbolToInsert = '()';
            cursorOffset = 1;
        } else if (symbol === '[') {
            symbolToInsert = '[]';
            cursorOffset = 1;
        } else if (symbol === '{') {
            symbolToInsert = '{}';
            cursorOffset = 1;
        }
        
        targetField.value = value.substring(0, start) + symbolToInsert + value.substring(end);
        
        const newPosition = start + cursorOffset;
        targetField.setSelectionRange(newPosition, newPosition);
        targetField.focus();
        
        // Déclencher l'événement input pour mettre à jour l'aperçu
        targetField.dispatchEvent(new Event('input'));
        
        console.log(`📝 Symbole inséré: ${symbolToInsert} dans ${activeMathKeyboard}`);
    }

    function clearCurrentField() {
        if (!activeMathKeyboard) return;
        
        const targetField = document.getElementById(activeMathKeyboard);
        if (targetField) {
            targetField.value = '';
            targetField.focus();
            targetField.dispatchEvent(new Event('input'));
            console.log('🧹 Champ effacé:', activeMathKeyboard);
        }
    }

    function closeMathKeyboard() {
        cleanupMathKeyboard();
    }

    function addVariantField() {
        const container = document.getElementById('variants-container');
        if (!container) return;
        
        const currentVariants = container.querySelectorAll('input[id^="variant-"]');
        const nextIndex = currentVariants.length;
        
        if (nextIndex >= 5) {
            CalculUpCore.showInfo('Maximum 5 variantes autorisées');
            return;
        }
        
        const variantHtml = `
            <div class="relative mb-3">
                <input type="text" 
                       id="variant-${nextIndex}"
                       placeholder="Autre forme de réponse acceptée"
                       class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                <button onclick="CalculUpQuestions.showMathKeyboard('variant-${nextIndex}')" 
                        class="absolute top-2 right-2 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-xs">
                    𝑓(𝑥)
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', variantHtml);
        console.log(`➕ Champ variante ${nextIndex} ajouté`);
    }

    // ==========================================================================
    // APERÇU ET VALIDATION
    // ==========================================================================

    function updateQuestionPreview() {
        collectQuestionData();
        const preview = document.getElementById('question-preview');
        if (!preview) return;
        
        if (!currentQuestion.question.trim()) {
            preview.innerHTML = `
                <div class="text-center text-stone-500">
                    L'aperçu apparaîtra ici quand vous commencerez à rédiger...
                </div>
            `;
            return;
        }
        
        const canSeeAnswers = canUserSeeAnswers();
        
        let answerSection = '';
        
        if (canSeeAnswers) {
            if (currentQuestion.type === 'qcm') {
                answerSection = `
                    <div class="space-y-3">
                        ${currentQuestion.choices.map((choice, index) => choice.trim() ? `
                            <div class="p-3 border border-stone-200 rounded-lg ${index === currentQuestion.correctChoice ? 'bg-emerald-50 border-emerald-300' : ''}">
                                <span class="font-semibold text-emerald-600 mr-3">${String.fromCharCode(65 + index)}.</span>
                                <span class="text-stone-700">${formatMathExpression(choice)}</span>
                                ${index === currentQuestion.correctChoice ? '<span class="text-emerald-600 ml-2">✓</span>' : ''}
                            </div>
                        ` : '').join('')}
                    </div>
                `;
            } else {
                answerSection = `
                    <div class="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div class="text-emerald-700">
                            <strong>Réponse attendue :</strong> ${formatMathExpression(currentQuestion.answer)}
                        </div>
                        ${currentQuestion.variants.length > 0 ? `
                            <div class="text-sm text-emerald-600 mt-2">
                                Variantes acceptées : ${currentQuestion.variants.filter(v => v.trim()).map(v => formatMathExpression(v)).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        } else {
            answerSection = getAnswerLimitationMessage();
        }
        
        let explanationSection = '';
        let hintSection = '';
        
        if (canSeeAnswers) {
            if (currentQuestion.explanation) {
                explanationSection = `
                    <div class="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
                        <div class="text-sm font-medium text-stone-700 mb-2">Explication :</div>
                        <div class="text-stone-600">${formatMathExpression(currentQuestion.explanation)}</div>
                    </div>
                `;
            }
            
            if (currentQuestion.hint) {
                hintSection = `
                    <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div class="text-sm font-medium text-amber-700 mb-1">Indice :</div>
                        <div class="text-amber-600">${formatMathExpression(currentQuestion.hint)}</div>
                    </div>
                `;
            }
        } else {
            if (currentQuestion.explanation || currentQuestion.hint) {
                explanationSection = `
                    <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div class="text-sm font-medium text-amber-700 mb-2">🔒 Explication et indice masqués</div>
                        <div class="text-amber-600 text-sm">
                            L'explication et l'indice seront visibles après validation de votre compte enseignant.
                        </div>
                    </div>
                `;
            }
        }
        
        const html = `
            <div class="max-w-2xl mx-auto">
                <div class="text-center mb-6">
                    <div class="text-lg font-medium text-stone-800 mb-2">
                        ${currentQuestion.chapter} - ${currentQuestion.notion}
                    </div>
                    <div class="text-2xl text-stone-800 leading-relaxed">
                        ${formatMathExpression(currentQuestion.question)}
                    </div>
                </div>
                
                ${answerSection}
                ${explanationSection}
                ${hintSection}
                
                <div class="mt-6 text-center text-sm text-stone-500">
                    ${currentQuestion.difficulty} • ${currentQuestion.points} points • ${currentQuestion.timeLimit}s
                </div>
            </div>
        `;
        
        preview.innerHTML = html;
    }

    function previewQuestion() {
        collectQuestionData();
        updateQuestionPreview();
        CalculUpCore.showInfo('Aperçu mis à jour !');
    }

    function collectQuestionData() {
        // Textes de base
        const questionText = document.getElementById('question-text');
        const explanationText = document.getElementById('explanation-text');
        const hintText = document.getElementById('hint-text');
        const notionSelect = document.getElementById('notion-select');
        
        if (questionText) currentQuestion.question = questionText.value.trim();
        if (explanationText) currentQuestion.explanation = explanationText.value.trim();
        if (hintText) currentQuestion.hint = hintText.value.trim();
        if (notionSelect) currentQuestion.notion = notionSelect.value;
        
        // Données selon le type
        if (currentQuestion.type === 'qcm') {
            currentQuestion.choices = [];
            currentQuestion.correctChoice = 0;
            
            for (let i = 0; i < 4; i++) {
                const choiceField = document.getElementById(`choice-${i}-text`);
                currentQuestion.choices[i] = choiceField ? choiceField.value.trim() : '';
            }
            
            const correctRadio = document.querySelector('input[name="correct-choice"]:checked');
            if (correctRadio) {
                currentQuestion.correctChoice = parseInt(correctRadio.value);
            }
        } else {
            const answerField = document.getElementById('correct-answer');
            if (answerField) currentQuestion.answer = answerField.value.trim();
            
            // Collecter les variantes
            currentQuestion.variants = [];
            const variantFields = document.querySelectorAll('input[id^="variant-"]');
            variantFields.forEach(field => {
                if (field.value.trim()) {
                    currentQuestion.variants.push(field.value.trim());
                }
            });
        }
    }

    // 🔧 FONCTION SUBMITQUESTION CORRIGÉE
    function submitQuestion() {
        collectQuestionData();
        
        const errors = validateQuestionData(currentQuestion);
        if (errors.length > 0) {
            CalculUpCore.showError('Erreurs de validation :\n' + errors.join('\n'));
            return;
        }
        
        // Appeler la fonction async séparément
        submitQuestionAsync();
    }

    // 🔧 FONCTION ASYNC SÉPARÉE POUR LA SOUMISSION
   // Dans calcul-up-questions.js, REMPLACER complètement la fonction submitQuestionAsync par :

async function submitQuestionAsync() {
    try {
        const questionId = generateQuestionId();
        const user = CalculUpCore.getUser();
        
        console.log('🔍 DEBUG - Utilisateur pour auto-validation:', {
            type: user?.type,
            status: user?.status,
            uid: user?.uid,
            identifier: user?.identifier
        });
        
        // 🔧 CORRECTION : Vérification plus précise du statut enseignant
        const isTeacherValidated = user?.type === 'teacher' && user?.status === 'active';
        const isTeacherProvisional = user?.type === 'teacher' && 
            (user?.status === 'provisional_access' || user?.status === 'pending_verification');
        const isStudent = user?.type === 'student';
        
        console.log('🔍 DEBUG - Status checks:', {
            isTeacherValidated,
            isTeacherProvisional,
            isStudent
        });
        
        // 🆕 NOUVEAU : Déterminer statut et points selon type utilisateur
        let questionStatus = 'pending';
        let isVerified = false;
        let earnedPoints = 0;
        
        if (isTeacherValidated) {
            // Enseignant validé = auto-validation + 5 XP immédiat
            questionStatus = 'validated';
            isVerified = true;
            earnedPoints = 5;
            console.log('✅ ENSEIGNANT VALIDÉ - Auto-validation activée');
        } else {
            // Élève ou enseignant provisoire = validation requise + 0 XP
            questionStatus = 'pending';
            isVerified = false;
            earnedPoints = 0;
            console.log('⏳ VALIDATION MANUELLE requise');
        }
        
        const questionData = {
            ...currentQuestion,
            id: questionId,
            createdBy: user?.uid || 'anonymous',
            createdByName: user?.firstname || 'Anonyme',
            createdByIdentifier: user?.identifier || 'N/A',
            createdByEmail: user?.email || 'N/A',
            userType: user?.type || 'student',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            
            // 🆕 NOUVEAU SYSTÈME : Statut selon type utilisateur
            status: questionStatus,
            verified: isVerified,
            earnedPoints: earnedPoints,
            
            version: 1,
            requiresAdminValidation: isTeacherProvisional,
            level: user?.schoolLevel || 'seconde'
        };
        
        console.log('📤 FINAL - Données question à sauvegarder:', {
            userType: user?.type,
            userStatus: user?.status,
            questionStatus: questionStatus,
            verified: isVerified,
            earnedPoints: earnedPoints
        });
        
        // 🆕 SAUVEGARDER EN BASE DE DONNÉES FIRESTORE
        try {
            const db = CalculUpCore.getDb();
            if (db) {
                const docRef = await db.collection('questions').add(questionData);
                console.log('✅ Question sauvegardée en BDD avec ID:', docRef.id);
                questionData.id = docRef.id;
            } else {
                console.warn('⚠️ Base de données non disponible - sauvegarde locale seulement');
            }
        } catch (dbError) {
            console.error('❌ Erreur sauvegarde BDD:', dbError);
            console.log('📝 Continuons avec sauvegarde locale...');
        }
        
        // Sauvegarder localement
        if (user) {
            if (!user.createdQuestions) user.createdQuestions = [];
            user.createdQuestions.push(questionData);
            
            // 🆕 Mettre à jour les stats utilisateur + XP immédiat si enseignant validé
            const updates = {
                'stats.questionsCreated': (user.stats?.questionsCreated || 0) + 1,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // 🆕 NOUVEAU : XP immédiat pour enseignants validés
            if (isTeacherValidated) {
                updates.xp = (user.xp || 0) + earnedPoints;
                user.xp = (user.xp || 0) + earnedPoints; // Mise à jour locale immédiate
                console.log('✅ XP ajoutés immédiatement:', earnedPoints, 'Total XP:', user.xp);
            }
            
            try {
                await CalculUpCore.updateUserData(updates);
                console.log('✅ Stats utilisateur mises à jour');
                
                // Vérifier montée de niveau si XP ajoutés
                if (isTeacherValidated) {
                    await CalculUpCore.checkLevelUp(user.uid, user.xp);
                }
            } catch (updateError) {
                console.warn('⚠️ Erreur mise à jour stats:', updateError);
            }
        }
        
        // 🆕 MESSAGES DIFFÉRENCIÉS selon le statut
        if (isTeacherValidated) {
            const successMessage = `
                ✅ Question validée automatiquement ! 
                
                🎉 En tant qu'enseignant validé :
                • Votre question est publiée immédiatement
                • +5 XP ajoutés à votre compte
                • Visible dans le catalogue pour tous
                
                👨‍🏫 Merci pour votre contribution à la communauté !
            `;
            CalculUpCore.showSuccess(successMessage);
            
        } else if (isTeacherProvisional) {
            const provisionalMessage = `
                📝 Question soumise pour validation ! 
                
                ⚠️ Compte avec accès provisoire :
                • Validation admin requise avant publication
                • +5 XP si validée, +10 XP si excellente
                • Après validation complète de votre compte, vos futures questions seront auto-validées
                
                📧 Vous serez notifié du résultat.
            `;
            CalculUpCore.showInfo(provisionalMessage);
            
        } else {
            // Élève
            const studentMessage = `
                📝 Question soumise pour validation ! 
                
                💡 Système de récompenses :
                • +5 XP si validée par un modérateur
                • +10 XP si jugée excellente
                
                👨‍🏫 Un modérateur va examiner votre question.
                📧 Vous serez notifié du résultat.
            `;
            CalculUpCore.showSuccess(studentMessage);
        }
        
        // Créer notification admin seulement si validation requise
        if (!isTeacherValidated) {
            try {
                const db = CalculUpCore.getDb();
                if (db) {
                    await db.collection('admin_notifications').add({
                        type: 'question_validation',
                        questionId: questionData.id,
                        userId: user?.uid,
                        userEmail: user?.email,
                        userIdentifier: user?.identifier,
                        userType: user?.type,
                        questionTitle: currentQuestion.question.substring(0, 50) + '...',
                        chapter: currentQuestion.chapter,
                        status: 'pending',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ Notification admin créée');
                }
            } catch (notifError) {
                console.warn('⚠️ Erreur notification admin:', notifError);
            }
        }
        
        // Réinitialiser le formulaire
        resetQuestionForm();
        
        // Recharger la liste des questions
        const questionsList = document.getElementById('user-questions-list');
        if (questionsList) {
            questionsList.innerHTML = renderUserQuestionsList();
        }
        
    } catch (error) {
        console.error('❌ Erreur soumission question:', error);
        CalculUpCore.showError('Erreur lors de la soumission. Veuillez réessayer.');
    }
}


    function resetQuestionForm() {
        // Réinitialiser l'objet question
        currentQuestion = {
            type: 'qcm',
            difficulty: 'moyen',
            chapter: '',
            notion: '',
            question: '',
            choices: ['', '', '', ''],
            correctChoice: 0,
            answer: '',
            variants: [],
            explanation: '',
            hint: '',
            points: 10,
            timeLimit: 30
        };
        
        // Réinitialiser les champs du formulaire
        const fields = [
            'question-text', 'explanation-text', 'hint-text', 
            'correct-answer', 'chapter-select', 'notion-select'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        
        // Réinitialiser les choix QCM
        for (let i = 0; i < 4; i++) {
            const choiceField = document.getElementById(`choice-${i}-text`);
            if (choiceField) choiceField.value = '';
        }
        
        // Réinitialiser les variantes
        const variantContainer = document.getElementById('variants-container');
        if (variantContainer) {
            variantContainer.innerHTML = `
                <div class="relative mb-3">
                    <input type="text" 
                           id="variant-0"
                           placeholder="Autre forme de réponse acceptée"
                           class="w-full p-3 border border-stone-300 rounded-xl focus:border-emerald-400 focus:outline-none">
                    <button onclick="CalculUpQuestions.showMathKeyboard('variant-0')" 
                            class="absolute top-2 right-2 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-xs">
                        𝑓(𝑥)
                    </button>
                </div>
            `;
        }
        
        // Réinitialiser l'aperçu
        updateQuestionPreview();
        
        // Fermer le clavier mathématique
        cleanupMathKeyboard();
        
        console.log('🔄 Formulaire réinitialisé');
    }

    // ==========================================================================
    // FONCTIONS POUR AFFICHAGE DES QUESTIONS EXISTANTES
    // ==========================================================================

    function displayQuestion(questionData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const canSeeAnswers = canUserSeeAnswers();
        
        let answerSection = '';
        if (canSeeAnswers) {
            // Affichage normal des réponses
            if (questionData.type === 'qcm') {
                answerSection = `
                    <div class="mt-4 space-y-2">
                        ${questionData.choices.map((choice, index) => `
                            <div class="p-3 border rounded-lg ${index === questionData.correctChoice ? 'bg-green-50 border-green-300' : 'border-stone-200'}">
                                <span class="font-semibold mr-2">${String.fromCharCode(65 + index)}.</span>
                                ${formatMathExpression(choice)}
                                ${index === questionData.correctChoice ? ' <span class="text-green-600">✓</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                answerSection = `
                    <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <strong>Réponse :</strong> ${formatMathExpression(questionData.answer)}
                    </div>
                `;
            }
            
            if (questionData.explanation) {
                answerSection += `
                    <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <strong>Explication :</strong> ${formatMathExpression(questionData.explanation)}
                    </div>
                `;
            }
        } else {
            // Affichage limité pour enseignants non-validés
            answerSection = getAnswerLimitationMessage();
        }
        
        const questionHtml = `
            <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                <div class="mb-4">
                    <div class="text-lg font-semibold text-stone-800 mb-2">
                        ${questionData.chapter} - ${questionData.notion}
                    </div>
                    <div class="text-xl text-stone-700">
                        ${formatMathExpression(questionData.question)}
                    </div>
                </div>
                
                ${answerSection}
                
                <div class="mt-4 flex items-center justify-between text-sm text-stone-500">
                    <span>${questionData.difficulty} • ${questionData.points} pts</span>
                    <button onclick="CalculUpQuestions.toggleFavorite('${questionData.id}')" 
                            class="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors">
                        ⭐ Favoris
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = questionHtml;
    }

    function toggleFavorite(questionId) {
        // Cette fonction permet toujours d'ajouter aux favoris
        CalculUpCore.showSuccess('Question ajoutée aux favoris ! ⭐');
        console.log('⭐ Question ajoutée aux favoris:', questionId);
    }

    // ==========================================================================
    // API PUBLIQUE DU MODULE
    // ==========================================================================

    return {
        // Navigation principal
        showQuestionCreationScreen,
        showCreateQuestionScreen: showQuestionCreationScreen, // Alias pour compatibilité
        
        // Gestion du formulaire
        selectQuestionType,
        selectDifficulty,
        updateNotionsList,
        
        // Clavier mathématique
        showMathKeyboard,
        insertMathSymbol,
        clearCurrentField,
        closeMathKeyboard,
        addVariantField,
        
        // Aperçu et validation
        updateQuestionPreview,
        previewQuestion,
        submitQuestion, // 🔧 AJOUTÉ DANS L'API PUBLIQUE
        
        // Affichage des questions avec limitations
        displayQuestion,
        toggleFavorite,
        canUserSeeAnswers,
        
        // Utilitaires
        cleanupMathKeyboard,
        resetQuestionForm,
        getValidationQueue: () => validationQueue,
        getCurrentQuestion: () => currentQuestion
    };
})();

// Rendre le module disponible globalement
window.CalculUpQuestions = CalculUpQuestions;

console.log('✅ Module CalculUpQuestions chargé avec nouveau système de récompenses');