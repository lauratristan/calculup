// =============================================================================
// CALCUL UP - MOTEUR DE JEU (VERSION COMPLÈTE FONCTIONNELLE)
// Gestion complète des sessions d'entraînement et du gameplay
// =============================================================================

const CalculUpGame = (function() {
    'use strict';

    // Variables globales du module
    let gameState = {
        isPlaying: false,
        currentQuestionIndex: 0,
        questions: [],
        answers: [],
        startTime: null,
        sessionConfig: {
            questionCount: 5,
            selectedChapters: [],
            selectedNotions: [],
            includeAllLevels: false
        },
        currentQuestionStartTime: null,
        score: 0,
        correctAnswers: 0,
        timeBonus: 0
    };

    let questionTimer = null;
    let gameTimer = null;
    let feedbackTimer = null;

    // ==========================================================================
    // UTILITAIRES ET HELPERS
    // ==========================================================================

    function cleanupGameTimers() {
        if (questionTimer) {
            clearInterval(questionTimer);
            questionTimer = null;
        }
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
        
        // Nettoyer le clavier mathématique s'il est ouvert
        const mathKeyboard = document.getElementById('math-keyboard');
        if (mathKeyboard) {
            mathKeyboard.remove();
        }
        
        console.log('🧹 Timers nettoyés');
    }

    function resetGameState() {
        cleanupGameTimers();
        
        gameState = {
            isPlaying: false,
            currentQuestionIndex: 0,
            questions: [],
            answers: [],
            startTime: null,
            sessionConfig: {
                questionCount: 5,
                selectedChapters: [],
                selectedNotions: [],
                includeAllLevels: false
            },
            currentQuestionStartTime: null,
            score: 0,
            correctAnswers: 0,
            timeBonus: 0
        };
    }

    function formatMathExpression(text) {
        // Utiliser la fonction de formatage du module Data si disponible
        if (CalculUpData && CalculUpData.formatMath) {
            return CalculUpData.formatMath(text);
        }
        
        // Fallback au formatage local
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

    function checkOpenAnswer(userAnswer, question) {
        if (!userAnswer || !question.answer) return false;
        
        const normalizeAnswer = (answer) => {
            return answer.toString()
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/\*/g, '')
                .replace(/\^/g, '')
                .replace(/²/g, '2')
                .replace(/³/g, '3')
                .replace(/π/g, 'pi');
        };
        
        const normalizedUser = normalizeAnswer(userAnswer);
        const normalizedCorrect = normalizeAnswer(question.answer);
        
        if (normalizedUser === normalizedCorrect) return true;
        
        if (question.variants && Array.isArray(question.variants)) {
            return question.variants.some(variant => 
                normalizeAnswer(variant) === normalizedUser
            );
        }
        
        return false;
    }

    // ==========================================================================
    // CONFIGURATION ET SÉLECTION DES QUESTIONS
    // ==========================================================================

    function showConfigScreen() {
        const user = CalculUpCore.getUser();
        const seenNotions = user?.preferences?.seenNotions || {};
        
        const html = `
            <div class="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
                <div class="max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-2xl font-bold text-stone-800 mb-2">Configuration d'entraînement</h1>
                                <p class="text-stone-600">Personnalise ta session selon tes besoins</p>
                            </div>
                            <button onclick="CalculUpCore.navigateToScreen('home')" 
                                    class="p-3 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors">
                                <span class="text-xl">←</span>
                            </button>
                        </div>
                    </div>

                    <!-- Configuration -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                        <h2 class="text-xl font-semibold text-stone-800 mb-4">Paramètres de session</h2>
                        
                        <!-- Nombre de questions -->
                        <div class="mb-6">
                            <label class="block text-stone-700 font-medium mb-3">Nombre de questions</label>
                            <div class="grid grid-cols-4 gap-3">
                                ${[5, 10, 15, 20].map(count => `
                                    <button onclick="CalculUpGame.selectQuestionCount(${count})" 
                                            data-count="${count}"
                                            class="question-count-btn p-3 border-2 border-stone-200 rounded-xl font-medium transition-all hover:border-emerald-300 hover:bg-emerald-50 ${count === 5 ? 'border-emerald-400 bg-emerald-100 text-emerald-700' : 'text-stone-600'}">
                                        ${count} questions
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Mode adaptatif -->
                        <div class="mb-6">
                            <label class="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" id="adaptive-mode" checked 
                                       class="w-5 h-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500">
                                <span class="text-stone-700 font-medium">Mode adaptatif (recommandé)</span>
                            </label>
                            <p class="text-sm text-stone-500 mt-1 ml-8">Questions basées sur les notions vues en cours</p>
                        </div>
                    </div>

                    <!-- Sélection des chapitres -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                        <h2 class="text-xl font-semibold text-stone-800 mb-4">Sélection des chapitres</h2>
                        <div id="chapters-selection">
                            ${renderChaptersSelection(seenNotions)}
                        </div>
                    </div>

                    <!-- Aperçu et validation -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                        <div class="flex items-center justify-between">
                            <div id="config-preview">
                                <p class="text-stone-600">
                                    <span class="font-medium">5 questions</span> • 
                                    <span class="font-medium">Toutes les notions vues</span> • 
                                    <span class="font-medium">~3 min</span>
                                </p>
                            </div>
                            <button onclick="CalculUpGame.startSession()" 
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                Commencer l'entraînement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // CORRECTION : Utiliser l'approche standard
        const root = document.getElementById('root');
        root.innerHTML = html;
        updateConfigPreview();
    }

    function renderChaptersSelection(seenNotions) {
        const userLevel = CalculUpCore.getUser()?.schoolLevel || 'seconde';
        const curriculum = CalculUpData.getCurriculum(userLevel);
        
        if (!curriculum) return '<p class="text-stone-500">Curriculum non trouvé pour ce niveau</p>';

        return Object.entries(curriculum).map(([domain, chapters]) => `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-stone-800 mb-3">${domain}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${Object.entries(chapters).map(([chapterName, notions]) => {
                        const hasSeenNotions = notions.some(notion => seenNotions[notion]);
                        return `
                            <label class="flex items-center space-x-3 p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors ${hasSeenNotions ? '' : 'opacity-50'}">
                                <input type="checkbox" 
                                       class="chapter-checkbox w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500" 
                                       data-chapter="${chapterName}"
                                       ${hasSeenNotions ? 'checked' : 'disabled'}
                                       onchange="CalculUpGame.updateConfigPreview()">
                                <div class="flex-1">
                                    <span class="text-stone-700 font-medium">${chapterName}</span>
                                    ${!hasSeenNotions ? '<span class="text-xs text-amber-600 block">Notions non vues en cours</span>' : ''}
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    function selectQuestionCount(count) {
        gameState.sessionConfig.questionCount = count;
        
        document.querySelectorAll('.question-count-btn').forEach(btn => {
            btn.classList.remove('border-emerald-400', 'bg-emerald-100', 'text-emerald-700');
            btn.classList.add('text-stone-600');
        });
        
        document.querySelector(`[data-count="${count}"]`).classList.add('border-emerald-400', 'bg-emerald-100', 'text-emerald-700');
        document.querySelector(`[data-count="${count}"]`).classList.remove('text-stone-600');
        
        updateConfigPreview();
    }

    function updateConfigPreview() {
        const adaptiveMode = document.getElementById('adaptive-mode')?.checked;
        const selectedChapters = Array.from(document.querySelectorAll('.chapter-checkbox:checked')).map(cb => cb.dataset.chapter);
        const questionCount = gameState.sessionConfig.questionCount;
        const estimatedTime = Math.ceil(questionCount * 0.6);
        
        gameState.sessionConfig.selectedChapters = selectedChapters;
        
        const preview = document.getElementById('config-preview');
        if (preview) {
            const modeText = adaptiveMode ? 'Mode adaptatif' : `${selectedChapters.length} chapitres sélectionnés`;
            preview.innerHTML = `
                <p class="text-stone-600">
                    <span class="font-medium">${questionCount} questions</span> • 
                    <span class="font-medium">${modeText}</span> • 
                    <span class="font-medium">~${estimatedTime} min</span>
                </p>
            `;
        }
    }

    // ==========================================================================
    // GÉNÉRATION ET SÉLECTION DES QUESTIONS
    // ==========================================================================

    function getQuestionsForSession() {
        const user = CalculUpCore.getUser();
        const seenNotions = user?.preferences?.seenNotions || {};
        const userLevel = user?.schoolLevel || 'seconde';
        const config = gameState.sessionConfig;
        
        // Questions système de base
        let availableQuestions = CalculUpData.getDefaultQuestions({ level: userLevel });
        
        // Filtrer selon les notions vues
        const adaptiveMode = document.getElementById('adaptive-mode')?.checked ?? true;
        
        if (adaptiveMode) {
            availableQuestions = availableQuestions.filter(q => 
                seenNotions[q.notion] === true
            );
        } else if (config.selectedChapters.length > 0) {
            availableQuestions = availableQuestions.filter(q => 
                config.selectedChapters.includes(q.chapter)
            );
        }
        
        // Mélanger et sélectionner
        const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, config.questionCount);
    }

    async function startSession() {
        try {
            const questions = getQuestionsForSession();
            
            if (questions.length === 0) {
                CalculUpCore.showError('Aucune question disponible pour cette configuration. Vérifiez vos notions vues en cours.');
                return;
            }
            
            if (questions.length < gameState.sessionConfig.questionCount) {
                CalculUpCore.showSuccess(`Seulement ${questions.length} question(s) disponible(s) pour cette configuration.`);
            }
            
            // Initialiser la session
            gameState.questions = questions;
            gameState.currentQuestionIndex = 0;
            gameState.answers = [];
            gameState.startTime = Date.now();
            gameState.score = 0;
            gameState.correctAnswers = 0;
            gameState.timeBonus = 0;
            gameState.isPlaying = true;
            
            console.log('🎮 Démarrage session:', gameState);
            
            // Afficher la première question
            showGameScreen();
            
        } catch (error) {
            console.error('❌ Erreur démarrage session:', error);
            CalculUpCore.showError('Erreur lors du démarrage de la session');
        }
    }

    // ==========================================================================
    // INTERFACE DE JEU
    // ==========================================================================

    function showGameScreen() {
        if (!gameState.isPlaying || gameState.currentQuestionIndex >= gameState.questions.length) {
            console.log('⚠️ Tentative d\'affichage question sur session terminée');
            showResultsScreen();
            return;
        }
        
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion) {
            console.log('⚠️ Question non trouvée');
            showResultsScreen();
            return;
        }
        
        const questionNumber = gameState.currentQuestionIndex + 1;
        const totalQuestions = gameState.questions.length;
        const progress = (questionNumber / totalQuestions) * 100;
        const timeLimit = currentQuestion.timeLimit || 30;
        
        const html = `
            <div class="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
                <div class="max-w-4xl mx-auto">
                    <!-- Header avec progression -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-4">
                                <button onclick="CalculUpGame.quitGame()" 
                                        class="p-2 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors">
                                    <span class="text-lg">✕</span>
                                </button>
                                <div>
                                    <h1 class="text-xl font-bold text-stone-800">Question ${questionNumber}/${totalQuestions}</h1>
                                    <p class="text-stone-600">${currentQuestion.chapter} • ${currentQuestion.points} pts</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div id="timer-display" class="text-2xl font-bold text-stone-800">${timeLimit}s</div>
                                <div class="text-sm text-stone-600">Score: <span id="current-score">${gameState.score}</span> pts</div>
                            </div>
                        </div>
                        
                        <!-- Barre de progression -->
                        <div class="w-full bg-stone-200 rounded-full h-3">
                            <div class="bg-gradient-to-r from-emerald-500 to-sky-500 h-3 rounded-full transition-all duration-500" 
                                 style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <!-- Question -->
                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-6">
                        <div class="text-center mb-8">
                            <div class="text-2xl text-stone-800 leading-relaxed">
                                ${formatMathExpression(currentQuestion.question)}
                            </div>
                            ${currentQuestion.hint ? `
                                <button onclick="CalculUpGame.showHint()" 
                                        class="mt-4 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors text-sm">
                                    💡 Voir l'indice (-5 pts)
                                </button>
                            ` : ''}
                        </div>

                        <!-- Interface selon le type -->
                        <div id="answer-interface">
                            ${renderAnswerInterface(currentQuestion)}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-between items-center">
                        <button onclick="CalculUpGame.skipQuestion()" 
                                class="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl transition-colors">
                            Passer cette question
                        </button>
                        
                        <div class="flex space-x-3">
                            <button onclick="CalculUpGame.submitAnswer()" 
                                    class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                                Valider
                            </button>
                            ${currentQuestion.type === 'open' ? `
                                <button onclick="CalculUpGame.showMathKeyboard()" 
                                        class="px-6 py-3 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-xl transition-colors">
                                    𝑓(𝑥)
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Signalement -->
                    <div class="mt-6 text-center">
                        <button onclick="CalculUpGame.reportQuestion()" 
                                class="text-sm text-stone-500 hover:text-stone-700 transition-colors">
                            🚩 Signaler un problème avec cette question
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // CORRECTION : Utiliser l'approche standard
        const root = document.getElementById('root');
        root.innerHTML = html;
        
        // Configurer les raccourcis clavier pour les questions ouvertes
        if (currentQuestion && currentQuestion.type === 'open') {
            setTimeout(() => {
                setupMathKeyboardShortcuts();
            }, 100);
        }
        
        // Démarrer le timer
        gameState.currentQuestionStartTime = Date.now();
        startQuestionTimer(timeLimit);
    }

    function renderAnswerInterface(question) {
        if (question.type === 'qcm') {
            return `
                <div class="space-y-3">
                    ${question.choices.map((choice, index) => `
                        <button onclick="CalculUpGame.selectChoice(${index})" 
                                data-choice="${index}"
                                class="choice-button w-full p-4 text-left border-2 border-stone-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                            <span class="font-semibold text-emerald-600 mr-3">${String.fromCharCode(65 + index)}.</span>
                            <span class="text-stone-700">${formatMathExpression(choice)}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        } else {
            return `
                <div class="space-y-4">
                    <div class="relative">
                        <input type="text" 
                               id="open-answer" 
                               placeholder="Saisissez votre réponse..."
                               class="w-full p-4 text-lg border-2 border-stone-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors">
                        <div class="text-sm text-stone-500 mt-2">
                            Utilisez le clavier mathématique pour les symboles spéciaux
                        </div>
                    </div>
                </div>
            `;
        }
    }

    function selectChoice(index) {
        document.querySelectorAll('.choice-button').forEach(btn => {
            btn.classList.remove('border-emerald-400', 'bg-emerald-100');
        });
        
        const selectedButton = document.querySelector(`[data-choice="${index}"]`);
        selectedButton.classList.add('border-emerald-400', 'bg-emerald-100');
    }

    function startQuestionTimer(timeLimit) {
        cleanupGameTimers();
        
        let timeLeft = timeLimit;
        const timerDisplay = document.getElementById('timer-display');
        
        questionTimer = setInterval(() => {
            timeLeft--;
            
            if (timerDisplay) {
                timerDisplay.textContent = `${timeLeft}s`;
                
                if (timeLeft <= 5) {
                    timerDisplay.classList.add('text-red-600', 'animate-pulse');
                } else if (timeLeft <= 10) {
                    timerDisplay.classList.add('text-amber-600');
                }
            }
            
            if (timeLeft <= 0) {
                handleTimeOut();
            }
        }, 1000);
    }

    function handleTimeOut() {
        if (!gameState.isPlaying || gameState.currentQuestionIndex >= gameState.questions.length) {
            cleanupGameTimers();
            return;
        }
        
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion) {
            cleanupGameTimers();
            return;
        }
        
        cleanupGameTimers();
        
        const answerData = {
            questionId: currentQuestion.id,
            userAnswer: null,
            isCorrect: false,
            timeSpent: currentQuestion.timeLimit || 30,
            points: 0,
            speedBonus: 0,
            timeout: true,
            timestamp: Date.now()
        };
        
        gameState.answers.push(answerData);
        showAnswerFeedback(answerData, currentQuestion);
    }

    // ==========================================================================
    // SOUMISSION ET VALIDATION DES RÉPONSES
    // ==========================================================================

    function submitAnswer() {
        if (!gameState.isPlaying || gameState.currentQuestionIndex >= gameState.questions.length) {
            console.log('⚠️ Tentative de soumission sur session terminée');
            return;
        }
        
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion) {
            return;
        }
        
        const timeSpent = (Date.now() - gameState.currentQuestionStartTime) / 1000;
        
        let userAnswer = null;
        let isCorrect = false;
        
        if (currentQuestion.type === 'qcm') {
            const selectedChoice = document.querySelector('.choice-button.border-emerald-400');
            if (!selectedChoice) {
                CalculUpCore.showError('Sélectionnez une réponse');
                return;
            }
            
            const selectedIndex = parseInt(selectedChoice.dataset.choice);
            userAnswer = selectedIndex;
            isCorrect = selectedIndex === currentQuestion.correctChoice;
            
        } else {
            const answerInput = document.getElementById('open-answer');
            if (!answerInput || !answerInput.value.trim()) {
                CalculUpCore.showError('Saisissez une réponse');
                return;
            }
            
            userAnswer = answerInput.value.trim();
            isCorrect = checkOpenAnswer(userAnswer, currentQuestion);
        }
        
        cleanupGameTimers();
        
        let points = isCorrect ? (currentQuestion.points || 10) : 0;
        let speedBonus = 0;
        
        if (isCorrect && timeSpent < (currentQuestion.timeLimit || 30) * 0.5) {
            speedBonus = Math.round(points * 0.5);
            gameState.timeBonus += speedBonus;
        }
        
        const answerData = {
            questionId: currentQuestion.id || `q_${gameState.currentQuestionIndex}`,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            timeSpent: Math.round(timeSpent),
            points: points,
            speedBonus: speedBonus,
            timestamp: Date.now()
        };
        
        gameState.answers.push(answerData);
        gameState.score += points + speedBonus;
        
        if (isCorrect) {
            gameState.correctAnswers++;
        }
        
        console.log('📝 Réponse enregistrée:', answerData);
        showAnswerFeedback(answerData, currentQuestion);
    }

    function showAnswerFeedback(answerData, question) {
        // Nettoyer le timer précédent s'il existe
        if (feedbackTimer) {
            clearTimeout(feedbackTimer);
            feedbackTimer = null;
        }
        
        // Supprimer toute pop-in existante
        const existingFeedback = document.querySelector('.fixed.inset-0.z-50');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const isCorrect = answerData.isCorrect;
        const isTimeout = answerData.timeout;
        const isSkipped = answerData.skipped;
        
        let title, message, bgColor, iconColor, icon;
        
        if (isSkipped) {
            title = 'Question passée';
            message = 'Vous avez choisi de passer cette question';
            bgColor = 'bg-stone-100';
            iconColor = 'text-stone-600';
            icon = '⏭️';
        } else if (isTimeout) {
            title = 'Temps dépassé !';
            message = 'Le temps imparti est écoulé';
            bgColor = 'bg-red-100';
            iconColor = 'text-red-600';
            icon = '⏰';
        } else if (isCorrect) {
            title = 'Bonne réponse !';
            message = `+${answerData.points} points${answerData.speedBonus > 0 ? ` (+${answerData.speedBonus} bonus vitesse)` : ''}`;
            bgColor = 'bg-emerald-100';
            iconColor = 'text-emerald-600';
            icon = '✅';
        } else {
            title = 'Réponse incorrecte';
            message = `La bonne réponse était : ${formatMathExpression(question.answer)}`;
            bgColor = 'bg-red-100';
            iconColor = 'text-red-600';
            icon = '❌';
        }
        
        const feedbackId = 'feedback-' + Date.now(); // ID unique pour éviter les conflits
        
        const html = `
            <div id="${feedbackId}" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                    <div class="text-center">
                        <div class="${bgColor} ${iconColor} w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                            ${icon}
                        </div>
                        <h3 class="text-xl font-bold text-stone-800 mb-2">${title}</h3>
                        <p class="text-stone-600 mb-6">${message}</p>
                        
                        ${question.explanation ? `
                            <div class="bg-stone-50 rounded-lg p-4 mb-6 text-left">
                                <p class="text-sm text-stone-700">
                                    <span class="font-medium">Explication :</span><br>
                                    ${formatMathExpression(question.explanation)}
                                </p>
                            </div>
                        ` : ''}
                        
                        <button onclick="CalculUpGame.proceedToNextQuestion('${feedbackId}')" 
                                class="w-full py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold rounded-xl transition-all">
                            ${gameState.currentQuestionIndex + 1 >= gameState.questions.length ? 'Voir les résultats' : 'Question suivante'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Timer automatique mais annulable
        feedbackTimer = setTimeout(() => {
            const feedback = document.getElementById(feedbackId);
            if (feedback) {
                proceedToNextQuestion(feedbackId);
            }
        }, 3000);
    }

    function proceedToNextQuestion(feedbackId) {
        // Annuler le timer automatique
        if (feedbackTimer) {
            clearTimeout(feedbackTimer);
            feedbackTimer = null;
        }
        
        // Supprimer la pop-in spécifique
        const feedback = document.getElementById(feedbackId);
        if (feedback) {
            feedback.remove();
        }
        
        // Supprimer toute autre pop-in qui pourrait traîner
        const allFeedbacks = document.querySelectorAll('.fixed.inset-0.z-50');
        allFeedbacks.forEach(f => f.remove());
        
        // Passer à la question suivante
        nextQuestion();
    }

    function nextQuestion() {
        // Nettoyer seulement le clavier mathématique
        const mathKeyboard = document.getElementById('math-keyboard');
        if (mathKeyboard) {
            mathKeyboard.remove();
        }
        
        gameState.currentQuestionIndex++;
        
        if (gameState.currentQuestionIndex < gameState.questions.length) {
            showGameScreen();
        } else {
            gameState.isPlaying = false;
            showResultsScreen();
        }
    }

    function skipQuestion() {
        if (!gameState.isPlaying || gameState.currentQuestionIndex >= gameState.questions.length) {
            return;
        }
        
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion) {
            return;
        }
        
        const answerData = {
            questionId: currentQuestion.id || `q_${gameState.currentQuestionIndex}`,
            userAnswer: null,
            isCorrect: false,
            timeSpent: 0,
            points: 0,
            speedBonus: 0,
            skipped: true,
            timestamp: Date.now()
        };
        
        gameState.answers.push(answerData);
        cleanupGameTimers();
        showAnswerFeedback(answerData, currentQuestion);
    }

    // ==========================================================================
    // CLAVIER MATHÉMATIQUE (✅ VERSION CORRIGÉE)
    // ==========================================================================

    function showMathKeyboard() {
        console.log('🔢 Ouverture clavier mathématique (version corrigée)');
        
        const currentQuestion = gameState.questions?.[gameState.currentQuestionIndex];
        if (!currentQuestion || currentQuestion.type !== 'open') {
            CalculUpCore.showError('Clavier mathématique disponible uniquement pour les questions ouvertes');
            return;
        }
        
        const answerInput = document.getElementById('open-answer');
        if (!answerInput) {
            CalculUpCore.showError('Champ de réponse non trouvé');
            return;
        }
        
        let existingKeyboard = document.getElementById('math-keyboard');
        if (existingKeyboard) {
            existingKeyboard.remove();
            return;
        }
        
        // ✅ CORRECTION : Symboles mathématiques directement intégrés (plus de "undefined")
        const mathSymbols = [
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
        
        const keyboardHtml = `
            <div id="math-keyboard" class="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto">
                <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-200">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-stone-700">Clavier mathématique</h3>
                        <button onclick="document.getElementById('math-keyboard').remove()" 
                                class="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                            <span class="text-stone-500 text-xl">✕</span>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-6 gap-3 mb-4">
                        ${mathSymbols.map(symbol => `
                            <button onclick="CalculUpGame.insertMathSymbol('${symbol.char}')" 
                                    class="p-3 bg-stone-50 hover:bg-emerald-100 border border-stone-200 rounded-lg text-center transition-colors"
                                    title="${symbol.name}">
                                <span class="text-xl">${symbol.char}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="border-t border-stone-200 pt-4">
                        <div class="grid grid-cols-5 gap-3">
                            <button onclick="CalculUpGame.insertMathSymbol('(')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                ( )
                            </button>
                            <button onclick="CalculUpGame.insertMathSymbol('[')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                [ ]
                            </button>
                            <button onclick="CalculUpGame.insertMathSymbol('{')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                { }
                            </button>
                            <button onclick="CalculUpGame.insertMathSymbol(',')" 
                                    class="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium">
                                ,
                            </button>
                            <button onclick="CalculUpGame.clearAnswer()" 
                                    class="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 font-medium">
                                Clear
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-sm text-stone-500 mt-4 text-center">
                        💡 Raccourcis : Ctrl+M (ouvrir/fermer), Ctrl+P (π), Ctrl+2 (²), Ctrl+3 (³)
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', keyboardHtml);
        console.log('✅ Clavier mathématique affiché avec', mathSymbols.length, 'symboles');
    }

    function insertMathSymbol(symbol) {
        const answerInput = document.getElementById('open-answer');
        if (!answerInput) return;
        
        const start = answerInput.selectionStart;
        const end = answerInput.selectionEnd;
        const value = answerInput.value;
        
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
        
        answerInput.value = value.substring(0, start) + symbolToInsert + value.substring(end);
        
        const newPosition = start + cursorOffset;
        answerInput.setSelectionRange(newPosition, newPosition);
        answerInput.focus();
        
        console.log(`📝 Symbole inséré: ${symbolToInsert}`);
    }

    function clearAnswer() {
        const answerInput = document.getElementById('open-answer');
        if (answerInput) {
            answerInput.value = '';
            answerInput.focus();
            console.log('🧹 Réponse effacée');
        }
    }

    function setupMathKeyboardShortcuts() {
        const answerInput = document.getElementById('open-answer');
        if (!answerInput) return;
        
        answerInput.removeEventListener('keydown', handleMathKeyboardShortcuts);
        answerInput.addEventListener('keydown', handleMathKeyboardShortcuts);
    }

    function handleMathKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            showMathKeyboard();
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'p':
                    e.preventDefault();
                    insertMathSymbol('π');
                    break;
                case '2':
                    e.preventDefault();
                    insertMathSymbol('²');
                    break;
                case '3':
                    e.preventDefault();
                    insertMathSymbol('³');
                    break;
                case 'i':
                    e.preventDefault();
                    insertMathSymbol('∞');
                    break;
                case 'r':
                    e.preventDefault();
                    insertMathSymbol('√');
                    break;
            }
        }
    }

    // ==========================================================================
    // UTILITAIRES DE JEU
    // ==========================================================================

    function showHint() {
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion.hint) return;
        
        CalculUpCore.showInfo(`💡 Indice : ${currentQuestion.hint}`);
        
        gameState.score = Math.max(0, gameState.score - 5);
        const scoreDisplay = document.getElementById('current-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = gameState.score;
        }
    }

    function reportQuestion() {
        CalculUpCore.showInfo('Système de signalement en développement');
    }

    function quitGame() {
        if (confirm('Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.')) {
            cleanupGameTimers();
            gameState.isPlaying = false;
            resetGameState();
            CalculUpCore.navigateToScreen('home');
        }
    }

    // ==========================================================================
    // ÉCRAN DE RÉSULTATS
    // ==========================================================================

    function showResultsScreen() {
        cleanupGameTimers();
        gameState.isPlaying = false;
        
        const user = CalculUpCore.getUser();
        const totalTime = Math.round((Date.now() - gameState.startTime) / 1000);
        const accuracy = gameState.questions.length > 0 ? 
            Math.round((gameState.correctAnswers / gameState.questions.length) * 100) : 0;
        
        console.log('🏆 Affichage résultats de session');
        
        const baseXP = gameState.correctAnswers * 15;
        const bonusXP = 25;
        const totalXP = baseXP + bonusXP;
        
        const html = `
            <div class="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-8">
                        <div class="text-6xl mb-4">${accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}</div>
                        <h1 class="text-3xl font-bold text-stone-800 mb-2">Session terminée !</h1>
                        <p class="text-stone-600">Chaque session compte. Révise les notions et recommence !</p>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                            <div class="text-3xl font-bold text-emerald-600 mb-2">${gameState.correctAnswers}</div>
                            <div class="text-stone-600">Bonnes réponses</div>
                        </div>
                        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                            <div class="text-3xl font-bold text-sky-600 mb-2">${accuracy}%</div>
                            <div class="text-stone-600">Précision</div>
                        </div>
                        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                            <div class="text-3xl font-bold text-amber-600 mb-2">${gameState.score}</div>
                            <div class="text-stone-600">Points totaux</div>
                        </div>
                        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
                            <div class="text-3xl font-bold text-purple-600 mb-2">${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</div>
                            <div class="text-stone-600">Temps total</div>
                        </div>
                    </div>

                    ${gameState.timeBonus > 0 ? `
                        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
                            <div class="flex items-center justify-center space-x-3">
                                <span class="text-2xl">⚡</span>
                                <div class="text-center">
                                    <div class="font-bold text-amber-700 text-lg">Bonus vitesse !</div>
                                    <div class="text-amber-600">+${gameState.timeBonus} points pour tes réponses rapides</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
                        <h2 class="text-xl font-bold text-stone-800 mb-4">Détail des questions</h2>
                        <div class="space-y-3">
                            ${gameState.answers.map((answer, index) => {
                                const question = gameState.questions[index];
                                const icon = answer.skipped ? '⏭️' : answer.timeout ? '⏰' : answer.isCorrect ? '✅' : '❌';
                                const status = answer.skipped ? 'Passée' : answer.timeout ? 'Temps dépassé' : answer.isCorrect ? 'Correcte' : 'Incorrecte';
                                const points = answer.points + (answer.speedBonus || 0);
                                
                                return `
                                    <div class="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <span class="text-xl">${icon}</span>
                                            <div>
                                                <div class="font-medium text-stone-800">${question.chapter} - ${question.notion}</div>
                                                <div class="text-sm text-stone-500">${status}</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-stone-800">${points}</div>
                                            <div class="text-xs text-stone-500">${answer.timeSpent}s</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onclick="CalculUpGame.showConfigScreen()" 
                                class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                            Refaire un entraînement
                        </button>
                        <button onclick="CalculUpCore.navigateToScreen('home')" 
                                class="px-8 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl transition-colors">
                            Retour à l'accueil
                        </button>
                        <button onclick="CalculUpCore.navigateToScreen('stats')" 
                                class="px-8 py-3 bg-sky-100 hover:bg-sky-200 text-sky-700 font-semibold rounded-xl transition-colors">
                            Voir mes statistiques
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // CORRECTION CRITIQUE : Utiliser l'approche standard au lieu de updateMainContent
        const root = document.getElementById('root');
        root.innerHTML = html;
        
        saveSessionResults(totalXP);
    }

    async function saveSessionResults(xpGained) {
        try {
            const user = CalculUpCore.getUser();
            if (!user) return;

            console.log('💾 Sauvegarde résultats session...');
            
            // Calculer nouveaux totaux
            const newTotalQuestions = (user.stats?.totalQuestions || 0) + gameState.questions.length;
            const newCorrectAnswers = (user.stats?.correctAnswers || 0) + gameState.correctAnswers;
            const newAccuracy = newTotalQuestions > 0 ? (newCorrectAnswers / newTotalQuestions) * 100 : 0;
            const newXP = (user.xp || 0) + xpGained;
            const newLevel = Math.floor(newXP / 500) + 1; // Recalcul automatique du niveau
            
            // Mise à jour complète
            const updates = {
                xp: newXP,
                level: newLevel,
                'stats.totalQuestions': newTotalQuestions,
                'stats.correctAnswers': newCorrectAnswers,
                'stats.accuracy': Math.round(newAccuracy),
                'stats.sessionsThisWeek': (user.stats?.sessionsThisWeek || 0) + 1,
                'stats.averageTime': Math.round((Date.now() - gameState.startTime) / 1000 / gameState.questions.length)
            };
            
            const success = await CalculUpCore.updateUserData(updates);
            
            if (success) {
                console.log('✅ Résultats sauvegardés - XP:', newXP, 'Niveau:', newLevel);
                
                // Vérifier déblocage de niveau
                if (newLevel > (user.level || 1)) {
                    CalculUpCore.showSuccess(`🎉 Niveau ${newLevel} atteint ! Nouvelles fonctionnalités débloquées !`);
                }
            } else {
                throw new Error('Échec de sauvegarde');
            }
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            CalculUpCore.showError('Impossible de sauvegarder les résultats');
        }
    }

    // ==========================================================================
    // API PUBLIQUE DU MODULE
    // ==========================================================================

    return {
        // Configuration et navigation
        showConfigScreen,
        showGameSetupScreen: showConfigScreen,
        selectQuestionCount,
        updateConfigPreview,
        startSession,
        
        // Interface de jeu
        showGameScreen,
        selectChoice,
        submitAnswer,
        nextQuestion,
        proceedToNextQuestion,
        skipQuestion,
        quitGame,
        
        // Clavier mathématique
        showMathKeyboard,
        insertMathSymbol,
        clearAnswer,
        setupMathKeyboardShortcuts,
        
        // Utilitaires
        showHint,
        reportQuestion,
        
        // Résultats
        showResultsScreen,
        
        // Debug et maintenance
        cleanupGameTimers,
        getGameState: () => gameState,
        isPlaying: () => gameState.isPlaying,
        resetGameState
    };
})();

// Rendre le module disponible globalement
window.CalculUpGame = CalculUpGame;