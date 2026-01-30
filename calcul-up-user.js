/**
 * CALCUL UP - MODULE UTILISATEURS (VERSION COMPLÈTE AVEC SIGNALEMENTS)
 * Restauration du catalogue de questions + intégration signalements pour enseignants
 */

window.CalculUpUser = (function() {
    'use strict';

    // =============================================================================
    // DASHBOARD ÉLÈVE - ÉCRAN PRINCIPAL
    // =============================================================================
    
	const IMPLEMENTED_FEATURES = [
    'createQuestions'  // Seule fonctionnalité vraiment implémentée
    // 'multiplayer', 'addFriends', 'joinTournaments', 'createTournaments' ne sont PAS implémentées
];


    function showHomeScreen() {
        const user = CalculUpCore.getUser();
        if (!user || user.type !== 'student') {
            CalculUpCore.navigateToScreen('login');
            return;
        }
        
        console.log('🏠 Affichage dashboard élève');
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200 sticky top-0 z-10">
                    <div>
                        <h1 class="text-2xl font-bold text-stone-700">Calcul Up</h1>
                        <p class="text-stone-500">Salut @${user.identifier} ! 🚀</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="CalculUpCore.navigateToScreen('profile')" 
                                class="bg-sky-100 border border-sky-200 px-3 py-2 rounded-lg hover:bg-sky-200 transition-colors">
                            <span class="text-sky-700">👤 Profil</span>
                        </button>
                        <button onclick="CalculUpAuth.handleLogout()" 
                                class="bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg hover:bg-rose-200 transition-colors">
                            <span class="text-rose-700">🚪</span>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 max-w-4xl mx-auto">
                    <!-- Stats utilisateur -->
                    <div class="dashboard-card mb-6 slide-in">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h2 class="text-2xl font-bold text-stone-700">Tableau de bord</h2>
                                <p class="text-stone-500">Niveau ${user.schoolLevel || 'première'} • ${user.stats?.questionsCreated || 0} questions créées</p>
                            </div>
                            <div class="text-right">
                                <div class="flex items-center mb-1">
                                    <span class="text-xl font-bold text-amber-600">👑 Niv. ${user.level || 1}</span>
                                </div>
                                <div class="text-sm text-stone-500">${user.xp || 0} XP</div>
                            </div>
                        </div>
                        
                        <!-- Métriques principales -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div class="stat-card orange">
                                <div class="text-2xl mb-2">🔥</div>
                                <div class="text-xl font-bold">${user.streak || 0}</div>
                                <div class="text-xs">Jours consécutifs</div>
                            </div>
                            <div class="stat-card emerald">
                                <div class="text-2xl mb-2">🎯</div>
                                <div class="text-xl font-bold">${Math.round(user.stats?.accuracy || 0)}%</div>
                                <div class="text-xs">Précision</div>
                            </div>
                            <div class="stat-card sky">
                                <div class="text-2xl mb-2">⏱️</div>
                                <div class="text-xl font-bold">${user.stats?.totalQuestions || 0}</div>
                                <div class="text-xs">Questions</div>
                            </div>
                            <div class="stat-card violet">
                                <div class="text-2xl mb-2">📝</div>
                                <div class="text-xl font-bold">${user.stats?.questionsCreated || 0}</div>
                                <div class="text-xs">Créées</div>
                            </div>
                        </div>

                        <!-- Barre de progression -->
                        <div class="mb-4">
                            <div class="flex justify-between mb-2 text-sm">
                                <span class="text-stone-600">Progression vers niveau ${(user.level || 1) + 1}</span>
                                <span class="text-stone-500">${user.xp || 0}/${(user.level || 1) * 500} XP</span>
                            </div>
                            <div class="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                                <div class="bg-gradient-to-r from-amber-300 to-orange-400 h-3 rounded-full progress-bar" 
                                     style="width: ${Math.min(100, ((user.xp || 0) % 500) / 5)}%"></div>
                            </div>
                        </div>

                        <!-- Bouton Stats détaillées -->
                        <button onclick="CalculUpCore.navigateToScreen('stats')" 
                                class="w-full bg-sky-50 border border-sky-200 text-sky-700 p-3 rounded-lg hover:bg-sky-100 transition-colors">
                            📊 Voir mes statistiques détaillées
                        </button>
                    </div>

                    <!-- Actions principales -->
                    <div class="space-y-4">
                        <h3 class="text-xl font-semibold text-stone-700 flex items-center">
                            <span class="mr-2">⚡</span>
                            Actions disponibles
                        </h3>
                        
                        <!-- Entraînement Solo -->
                        <button onclick="CalculUpCore.navigateToScreen('game-setup')" 
                                class="w-full dashboard-card hover:shadow-glow transition-all transform hover:scale-105">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="bg-emerald-200 p-3 rounded-xl mr-4">
                                        <span class="text-2xl">🎯</span>
                                    </div>
                                    <div>
                                        <h4 class="text-lg font-semibold text-stone-700">Entraînement Solo</h4>
                                        <p class="text-stone-600">Questions adaptées à ton niveau</p>
                                        <div class="flex space-x-3 mt-2 text-sm">
                                            <span class="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">+15 XP</span>
                                            <span class="bg-amber-200 text-amber-800 px-2 py-1 rounded-full">Temps personnalisé</span>
                                        </div>
                                    </div>
                                </div>
                                <span class="text-2xl">→</span>
                            </div>
                        </button>

                        <!-- Créer une question -->
                        ${isFeatureUnlocked(user, 'createQuestions') ? `
                            <button onclick="CalculUpCore.navigateToScreen('create-question')" 
                                    class="w-full dashboard-card hover:shadow-glow transition-all transform hover:scale-105">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="bg-violet-200 p-3 rounded-xl mr-4">
                                            <span class="text-2xl">📝</span>
                                        </div>
                                        <div>
                                            <h4 class="text-lg font-semibold text-stone-700">Créer une question</h4>
                                            <p class="text-stone-600">Partage tes connaissances avec la communauté</p>
                                            <div class="flex space-x-3 mt-2 text-sm">
                                                <span class="bg-violet-200 text-violet-800 px-2 py-1 rounded-full">5-10 XP selon qualité</span>
                                                <span class="bg-amber-200 text-amber-800 px-2 py-1 rounded-full">Contribution</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="text-2xl">→</span>
                                </div>
                            </button>
                        ` : ''}
                        
                        <!-- Multijoueur avant amis -->
                        ${isFeatureUnlocked(user, 'multiplayer') ? `
                            <button onclick="CalculUpUser.showMultiplayerComingSoon()" 
                                    class="w-full dashboard-card hover:shadow-glow transition-all transform hover:scale-105">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="bg-orange-200 p-3 rounded-xl mr-4">
                                            <span class="text-2xl">⚔️</span>
                                        </div>
                                        <div>
                                            <h4 class="text-lg font-semibold text-stone-700">Mode Multijoueur</h4>
                                            <p class="text-stone-600">Défie un adversaire aléatoire en ligne</p>
                                            <div class="flex space-x-3 mt-2 text-sm">
                                                <span class="bg-orange-200 text-orange-800 px-2 py-1 rounded-full">Bientôt disponible</span>
                                                <span class="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">Niveau ${CalculUpData.getFeatureLevels().multiplayer}+</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="text-2xl">→</span>
                                </div>
                            </button>
                        ` : ''}
                        
                        <!-- Fonctionnalités à débloquer -->
                        ${generateLockedFeaturesHTML(user)}
                    </div>
                </div>
            </div>
        `;
    }

    // =============================================================================
    // ÉCRAN PROFIL UTILISATEUR
    // =============================================================================
    
    function showProfileScreen() {
        const user = CalculUpCore.getUser();
        if (!user || user.type !== 'student') {
            CalculUpCore.navigateToScreen('login');
            return;
        }
        
        console.log('👤 Affichage profil élève');
        
        const currentCurriculum = CalculUpData.getCurriculum(user.schoolLevel);
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                    <div class="flex items-center">
                        <button onclick="CalculUpCore.navigateToScreen('home')" 
                                class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                            <span class="text-xl">←</span>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-stone-700">Mon Profil</h1>
                            <p class="text-stone-500">Personnalise ton expérience</p>
                        </div>
                    </div>
                </div>
                
                <div class="max-w-2xl mx-auto p-6 space-y-6">
                    <!-- Informations personnelles -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700">Informations</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-2">Identifiant</label>
                                <div class="p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-600">
                                    @${user.identifier}
                                </div>
                                <div class="text-xs text-stone-500 mt-1">🆔 Ton identifiant unique ne peut pas être modifié</div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-2">Prénom</label>
                                <div class="p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-600">
                                    ${user.firstname}
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-2">Niveau scolaire</label>
                                <select id="school-level" onchange="CalculUpUser.updateSchoolLevel()" 
                                        class="form-select">
                                    <option value="seconde" ${user.schoolLevel === 'seconde' ? 'selected' : ''}>Seconde</option>
                                    <option value="premiere" ${user.schoolLevel === 'premiere' ? 'selected' : ''}>Première</option>
                                    <option value="terminale" ${user.schoolLevel === 'terminale' ? 'selected' : ''}>Terminale</option>
                                </select>
                                <div class="text-xs text-emerald-600 mt-1">📚 Change quand tu passes en classe supérieure !</div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-2">Progression générale</label>
                                <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-emerald-700 font-medium">Niveau ${user.level || 1}</span>
                                        <span class="text-emerald-600">${user.xp || 0} XP</span>
                                    </div>
                                    <div class="w-full bg-emerald-200 rounded-full h-2">
                                        <div class="bg-emerald-400 h-2 rounded-full progress-bar" 
                                             style="width: ${Math.min(100, ((user.xp || 0) % 500) / 5)}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Programme et notions vues -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700">Programme de ${user.schoolLevel || 'première'}</h3>
                        <div class="space-y-4">
                            ${generateCurriculumHTML(currentCurriculum, user)}
                        </div>
                        <div class="mt-4 alert info">
                            💡 <strong>Conseil :</strong> Coche les notions vues en cours pour des questions adaptées
                        </div>
                    </div>

                    <!-- Actions de compte -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700">Compte</h3>
                        <div class="space-y-3">
                            <button onclick="CalculUpCore.navigateToScreen('stats')" 
                                    class="w-full bg-sky-50 border border-sky-200 text-sky-700 p-3 rounded-lg hover:bg-sky-100 transition-colors text-left">
                                📊 Mes statistiques détaillées
                            </button>
                            <button onclick="CalculUpAuth.handleLogout()" 
                                    class="w-full bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg hover:bg-rose-100 transition-colors text-left">
                                🚪 Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // =============================================================================
    // ÉCRAN STATISTIQUES DÉTAILLÉES
    // =============================================================================
    
    function showStatsScreen() {
        const user = CalculUpCore.getUser();
        if (!user) {
            CalculUpCore.navigateToScreen('login');
            return;
        }

        console.log('📊 Affichage statistiques pour:', user.identifier);

        // 🔧 CORRIGÉ : Vérifier si l'utilisateur a des données d'activité
        const hasActivity = user.stats && (
            (user.stats.totalQuestions && user.stats.totalQuestions > 0) ||
            (user.stats.correctAnswers && user.stats.correctAnswers > 0) ||
            (user.stats.sessionsThisWeek && user.stats.sessionsThisWeek > 0)
        );

        const root = document.getElementById('root');
        
        // 🆕 INTERFACE POUR NOUVEAUX UTILISATEURS SANS ACTIVITÉ
        if (!hasActivity) {
            root.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
                    <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                        <div class="flex items-center">
                            <button onclick="CalculUpCore.navigateToScreen('home')" 
                                    class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                                <span class="text-xl">←</span>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-stone-700">Mes statistiques</h1>
                                <p class="text-stone-500">Suivez vos progrès et performances</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-stone-600">@${user.identifier}</span>
                            <button onclick="CalculUpAuth.handleLogout()" 
                                    class="bg-rose-100 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200">
                                🚪
                            </button>
                        </div>
                    </div>

                    <div class="max-w-4xl mx-auto p-6">
                        <!-- État vide pour nouveaux utilisateurs -->
                        <div class="text-center py-16">
                            <div class="text-6xl mb-6">📊</div>
                            <h2 class="text-2xl font-bold text-stone-700 mb-4">Pas encore de statistiques</h2>
                            <p class="text-stone-600 mb-8 max-w-md mx-auto">
                                Commence un entraînement pour voir tes progressions par chapitre !
                            </p>
                            <button onclick="CalculUpCore.navigateToScreen('game-setup')" 
                                    class="bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl">
                                🎯 Commencer maintenant
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // 🔄 INTERFACE NORMALE POUR UTILISATEURS AVEC ACTIVITÉ
        
        // Calcul des statistiques
        const stats = user.stats || {};
        const chapterStats = user.chapterStats || {};
        
        // 🔧 CORRIGÉ : Utiliser totalQuestions au lieu de questionsAnswered
        const totalQuestions = stats.totalQuestions || 0;
        const correctAnswers = stats.correctAnswers || 0;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Analyse des forces et faiblesses
        const chapterAnalysis = Object.entries(chapterStats)
            .map(([chapter, data]) => {
                // 🔧 CORRIGÉ : Utiliser totalQuestions pour la cohérence
                const answered = data.totalQuestions || 0;
                const correct = data.correctAnswers || 0;
                const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
                
                return {
                    chapter,
                    answered,
                    correct,
                    rate,
                    name: getChapterName(chapter)
                };
            })
            .filter(item => item.answered > 0)
            .sort((a, b) => b.rate - a.rate);
        
        const strengths = chapterAnalysis.filter(item => item.rate >= 80).slice(0, 3);
        const weaknesses = chapterAnalysis.filter(item => item.rate < 70).slice(0, 3);
        
        // 🔧 CORRIGÉ : Conseils personnalisés améliorés
        const chapterAdvice = [];

        // 🆕 Ne générer des conseils QUE si l'utilisateur a vraiment de l'activité
        if (totalQuestions >= 3) { // 🔧 RÉDUIT de 5 à 3 questions minimum
            // Conseils points forts (seulement si significatif)
            if (strengths.length >= 1 && strengths[0].answered >= 2) { // 🔧 RÉDUIT de 3 à 2
                strengths.slice(0, 2).forEach(strength => {
                    chapterAdvice.push({
                        type: 'strength', 
                        title: `Excellent travail en ${strength.name} !`,
                        description: `Tu maîtrises bien ce chapitre (${strength.rate}% de réussite).`
                    });
                });
            }
            
            // Conseils faiblesses (seulement si significatif)
            if (weaknesses.length >= 1 && weaknesses[0].answered >= 2) { // 🔧 RÉDUIT de 3 à 2
                weaknesses.slice(0, 2).forEach(weakness => {
                    chapterAdvice.push({
                        type: 'weakness',
                        title: `Révise les ${weakness.name}`,
                        description: `Concentre-toi sur ce chapitre pour t'améliorer (${weakness.rate}% actuellement).`
                    });
                });
            }
            
            // 🆕 AJOUTER CONSEIL GÉNÉRAL SI PAS ASSEZ DE DONNÉES
            if (chapterAdvice.length === 0) {
                chapterAdvice.push({
                    type: 'info',
                    title: 'Continue tes efforts !',
                    description: 'Fais plus d\'entraînements pour avoir des conseils personnalisés par chapitre.'
                });
            }
        }

        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                    <div class="flex items-center">
                        <button onclick="CalculUpCore.navigateToScreen('home')" 
                                class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                            <span class="text-xl">←</span>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-stone-700">Mes statistiques</h1>
                            <p class="text-stone-500">Suivez vos progrès et performances</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-stone-600">@${user.identifier}</span>
                        <button onclick="CalculUpAuth.handleLogout()" 
                                class="bg-rose-100 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200">
                            🚪
                        </button>
                    </div>
                </div>

                <div class="max-w-6xl mx-auto p-6 space-y-6">
                    <!-- Vue d'ensemble -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="dashboard-card slide-in text-center">
                            <div class="text-3xl font-bold text-emerald-600">${totalQuestions}</div>
                            <p class="text-stone-600 mt-1">Questions résolues</p>
                        </div>
                        <div class="dashboard-card slide-in text-center">
                            <div class="text-3xl font-bold text-blue-600">${accuracy}%</div>
                            <p class="text-stone-600 mt-1">Taux de réussite</p>
                        </div>
                        <div class="dashboard-card slide-in text-center">
                            <div class="text-3xl font-bold text-purple-600">${user.streak || 0}</div>
                            <p class="text-stone-600 mt-1">Jours consécutifs</p>
                        </div>
                        <div class="dashboard-card slide-in text-center">
                            <div class="text-3xl font-bold text-amber-600">${stats.sessionsThisWeek || 0}</div>
                            <p class="text-stone-600 mt-1">Sessions cette semaine</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Points forts -->
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-4 text-stone-700 flex items-center">
                                💪 Points forts
                            </h3>
                            ${strengths.length > 0 ? `
                                <div class="space-y-3">
                                    ${strengths.map(item => `
                                        <div class="flex justify-between items-center">
                                            <span class="text-stone-700">${item.name}</span>
                                            <span class="font-semibold text-emerald-600">${item.rate}%</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-stone-500 text-center py-4">
                                    Continue à t'entraîner pour identifier tes points forts !
                                </p>
                            `}
                        </div>

                        <!-- À améliorer -->
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-4 text-stone-700 flex items-center">
                                🎯 À améliorer
                            </h3>
                            ${weaknesses.length > 0 ? `
                                <div class="space-y-3">
                                    ${weaknesses.map(item => `
                                        <div class="flex justify-between items-center">
                                            <span class="text-stone-700">${item.name}</span>
                                            <span class="font-semibold text-red-600">${item.rate}%</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-stone-500 text-center py-4">
                                    Excellent ! Aucun point faible détecté.
                                </p>
                            `}
                        </div>
                    </div>

                    <!-- Conseils personnalisés -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-lg font-semibold mb-4 text-stone-700 flex items-center">
                            💡 Conseils personnalisés
                        </h3>
                        
                        <div class="space-y-4">
                            ${chapterAdvice.map(advice => `
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0 w-6 h-6 rounded-full ${
                                        advice.type === 'strength' ? 'bg-emerald-100 text-emerald-600' : 
                                        advice.type === 'weakness' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                    } flex items-center justify-center text-sm">
                                        ${advice.type === 'strength' ? '✓' : advice.type === 'weakness' ? '⚠' : 'ℹ'}
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-stone-700 font-medium">${advice.title}</p>
                                        <p class="text-stone-600 text-sm">${advice.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                            
                            ${chapterAdvice.length === 0 ? `
                                <div class="text-center text-stone-500 py-4">
                                    <div class="text-2xl mb-2">🎯</div>
                                    <p>Continue tes entraînements pour recevoir des conseils personnalisés !</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Progression détaillée par chapitre -->
                    ${chapterAnalysis.length > 0 ? `
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-4 text-stone-700">📈 Progression par chapitre</h3>
                            <div class="space-y-3">
                                ${chapterAnalysis.map(item => `
                                    <div class="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                                        <div>
                                            <span class="font-medium text-stone-700">${item.name}</span>
                                            <span class="text-stone-500 text-sm ml-2">(${item.correct}/${item.answered})</span>
                                        </div>
                                        <span class="font-semibold ${item.rate >= 80 ? 'text-emerald-600' : item.rate >= 60 ? 'text-amber-600' : 'text-red-600'}">${item.rate}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Fonction utilitaire pour obtenir le nom d'un chapitre
    function getChapterName(chapterKey) {
        const chapterNames = {
            'derivation': 'Dérivation',
            'suites_arithmetiques': 'Suites arithmétiques',
            'fonctions_affines': 'Fonctions affines',
            'probabilites_conditionnelles': 'Probabilités conditionnelles',
            'produit_scalaire': 'Produit scalaire',
            'trigonometrie': 'Trigonométrie',
            'logarithmes': 'Logarithmes',
            'integrales': 'Intégrales',
            'geometrie_espace': 'Géométrie dans l\'espace',
            'nombres_complexes': 'Nombres complexes'
        };
        return chapterNames[chapterKey] || chapterKey;
    }

    // =============================================================================
    // DASHBOARD ENSEIGNANT - AVEC CATALOGUE RESTAURÉ ET SIGNALEMENTS
    // =============================================================================
    
    function showTeacherDashboard() {
    console.log('🎓 Affichage dashboard enseignant');
    
    const user = CalculUpCore.getUser();
    if (!user) {
        console.error('❌ Utilisateur non trouvé');
        CalculUpCore.navigateToScreen('login');
        return;
    }
    
    // 🔧 CORRECTION : Vérification plus souple qui accepte tous les statuts enseignant
    if (user.type !== 'teacher') {
        console.error('❌ Type utilisateur incorrect:', user.type, 'attendu: teacher');
        CalculUpCore.navigateToScreen('login');
        return;
    }
    
    // ✅ PLUS DE REDIRECTION FORCÉE selon le statut - laisser l'enseignant accéder à son dashboard
    console.log('✅ Utilisateur enseignant validé, affichage dashboard');
    
    // Le reste du code reste identique...
    const isProvisionalAccess = user.status === 'provisional_access';
    const isPendingVerification = user.status === 'pending_verification';
    const isActive = user.status === 'active';
    
    console.log('✅ Utilisateur enseignant validé, affichage dashboard');
    
    // Bannière d'avertissement selon le statut
    let statusBanner = '';
    
    if (isPendingVerification) {
        statusBanner = `
            <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">🔒 Compte en attente de validation</h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>Votre compte enseignant doit être validé par un administrateur pour accéder aux fonctionnalités complètes.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (isProvisionalAccess) {
        statusBanner = `
            <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-amber-800">⚠️ Compte avec accès provisoire</h3>
                        <div class="mt-2 text-sm text-amber-700">
                            <p><strong>Limitations actuelles :</strong> Les réponses et explications sont masquées. Vous pouvez consulter les énoncés et mettre en favoris.</p>
                            <p><strong>Validation complète en cours</strong> par un administrateur pour débloquer l'accès complet.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4">
            ${statusBanner}
            
            <div class="max-w-6xl mx-auto">
                <!-- Header avec bouton déconnexion -->
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent mb-2">
                                Dashboard Enseignant
                            </h1>
                            <p class="text-stone-600">Bienvenue ${user.firstname} (@${user.identifier})</p>
                            <p class="text-sm text-stone-500">Statut : ${user.status || 'active'}</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button onclick="CalculUpCore.navigateToScreen('profile')" 
                                    class="bg-sky-100 border border-sky-200 px-3 py-2 rounded-lg hover:bg-sky-200 transition-colors">
                                <span class="text-sky-700">👤 Profil</span>
                            </button>
                            <button onclick="CalculUpAuth.handleLogout()" 
                                    class="bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg hover:bg-rose-200 transition-colors">
                                <span class="text-rose-700">🚪 Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Grille principale -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Colonne gauche - Actions PRINCIPALES ENSEIGNANT -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Vos statistiques -->
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                            <h2 class="text-xl font-bold text-stone-800 mb-4">📊 Vos statistiques</h2>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="text-center p-4 bg-emerald-100 rounded-xl">
                                    <div class="text-2xl font-bold text-emerald-600">${user.stats?.questionsCreated || 0}</div>
                                    <div class="text-sm text-emerald-700">Questions créées</div>
                                </div>
                                <div class="text-center p-4 bg-sky-100 rounded-xl">
                                    <div class="text-2xl font-bold text-sky-600">${user.level || 1}</div>
                                    <div class="text-sm text-sky-700">Niveau</div>
                                </div>
                                <div class="text-center p-4 bg-amber-100 rounded-xl">
                                    <div class="text-2xl font-bold text-amber-600">${user.xp || 0}</div>
                                    <div class="text-sm text-amber-700">XP Total</div>
                                </div>
                                <div class="text-center p-4 bg-violet-100 rounded-xl">
                                    <div class="text-2xl font-bold text-violet-600">${user.stats?.studentsHelped || 0}</div>
                                    <div class="text-sm text-violet-700">Élèves aidés</div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions principales enseignant -->
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                            <h2 class="text-xl font-bold text-stone-800 mb-6">🎯 Mes outils principaux</h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Créer une question -->
                                <button onclick="CalculUpCore.navigateToScreen('create-question')" 
                                        class="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all transform hover:scale-105">
                                    <div class="p-3 bg-emerald-200 rounded-lg">
                                        <svg class="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-stone-800">Créer une question</h3>
                                        <p class="text-stone-600 text-sm">${isActive ? 'Auto-validée' : '5-10 XP après validation'}</p>
                                    </div>
                                </button>

                                <!-- Catalogue de questions -->
                                <button onclick="CalculUpUser.showQuestionCatalog()" 
                                        class="flex items-center space-x-4 p-4 bg-gradient-to-r from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200 rounded-xl transition-all transform hover:scale-105">
                                    <div class="p-3 bg-sky-200 rounded-lg">
                                        <svg class="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-stone-800">Catalogue & Favoris</h3>
                                        <p class="text-stone-600 text-sm">
                                            ${isPendingVerification || isProvisionalAccess ? 'Énoncés seulement' : 'Accès complet'}
                                        </p>
                                    </div>
                                </button>

                                <!-- Gestion des classes (placeholder) -->
                                <button onclick="CalculUpUser.showClassManagement()" 
                                        class="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all transform hover:scale-105">
                                    <div class="p-3 bg-purple-200 rounded-lg">
                                        <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-stone-800">Mes classes</h3>
                                        <p class="text-stone-600 text-sm">Suivi et gestion</p>
                                    </div>
                                </button>

                                <!-- Tournois classes (placeholder) -->
                                <button onclick="CalculUpUser.showTournamentCreation()" 
                                        class="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all transform hover:scale-105">
                                    <div class="p-3 bg-orange-200 rounded-lg">
                                        <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-stone-800">Créer tournoi</h3>
                                        <p class="text-stone-600 text-sm">Classes ou public</p>
                                    </div>
                                </button>

                                <!-- S'entraîner -->
                                <button onclick="CalculUpCore.navigateToScreen('game-setup')" 
                                        class="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl transition-all transform hover:scale-105">
                                    <div class="p-3 bg-amber-200 rounded-lg">
                                        <svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-stone-800">S'entraîner</h3>
                                        <p class="text-stone-600 text-sm">Session personnelle</p>
                                    </div>
                                </button>

                                <!-- Statistiques détaillées -->
                                <button onclick="CalculUpCore.navigateToScreen('stats')" 
                                        class="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all transform hover:scale-105">
                                    <div class="p-3 bg-indigo-200 rounded-lg">
                                        <svg class="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-stone-800">Mes statistiques</h3>
                                        <p class="text-stone-600 text-sm">Progression détaillée</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Actions d'aide à l'administration (séparées) -->
                        ${isActive ? `
                            <div class="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
                                <h2 class="text-xl font-bold text-stone-800 mb-4">
                                    🤝 Aide à l'administration
                                    <span class="text-sm font-normal text-violet-600 ml-2">(Bonus XP)</span>
                                </h2>
                                <p class="text-stone-600 text-sm mb-4">
                                    Aidez la communauté en validant des questions et signalements. Ces actions sont facultatives mais récompensées.
                                </p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Validation questions élèves -->
                                    <button onclick="CalculUpUser.showQuestionValidation()" 
                                            class="flex items-center space-x-4 p-4 bg-violet-100 hover:bg-violet-200 rounded-xl transition-all">
                                        <div class="p-3 bg-violet-200 rounded-lg">
                                            <svg class="w-6 h-6 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-stone-800">Valider questions</h3>
                                            <p class="text-stone-600 text-sm">+15 XP par validation</p>
                                        </div>
                                    </button>

                                    <!-- Validation signalements -->
                                    <button onclick="CalculUpUser.showReportValidation()" 
                                            class="flex items-center space-x-4 p-4 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all">
                                        <div class="p-3 bg-purple-200 rounded-lg">
                                            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-stone-800">Traiter signalements</h3>
                                            <p class="text-stone-600 text-sm">+25 XP par traitement</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Colonne droite - Statut du compte -->
                    <div class="space-y-6">
                        ${generateTeacherStatusCard(user, isPendingVerification, isProvisionalAccess, isActive)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 🆕 NOUVELLES FONCTIONS pour les placeholders enseignant
function showClassManagement() {
    CalculUpCore.showInfo('🏫 Interface de gestion des classes en développement. Bientôt vous pourrez créer et suivre vos classes !');
}

function showTournamentCreation() {
    CalculUpCore.showInfo('🏆 Interface de création de tournois en développement. Organisez des compétitions pour vos élèves !');
}

function showQuestionValidation() {
    CalculUpCore.showInfo('📝 Interface de validation des questions d\'élèves en développement. Aidez à valider les contributions !');
}

    // =============================================================================
    // CATALOGUE DE QUESTIONS POUR ENSEIGNANTS - RESTAURÉ AVEC FILTRES
    // =============================================================================

    function showQuestionCatalog() {
    const user = CalculUpCore.getUser();
    if (!user || user.type !== 'teacher') {
        CalculUpCore.showError('Accès réservé aux enseignants');
        CalculUpCore.navigateToScreen('login');
        return;
    }
    
    console.log('📚 Affichage catalogue questions enseignant');
    
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-stone-50 to-sky-50">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                <div class="flex items-center">
                    <button onclick="CalculUpCore.navigateToScreen('teacher-dashboard')" 
                            class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                        <span class="text-xl">←</span>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-stone-700">Catalogue & Favoris</h1>
                        <p class="text-stone-500">Base de questions + vos favoris et créations</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-stone-600">@${user.identifier}</span>
                    <button onclick="CalculUpAuth.handleLogout()" 
                            class="bg-rose-100 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200">
                        🚪
                    </button>
                </div>
            </div>

            ${generateTeacherLimitationBanner(user)}

            <div class="max-w-6xl mx-auto p-6 space-y-6">
                <!-- Navigation onglets -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <div class="flex space-x-1 bg-stone-100 rounded-lg p-1">
                        <button onclick="CalculUpUser.switchCatalogTab('search')" 
                                id="tab-search"
                                class="flex-1 px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium shadow-sm transition-all">
                            🔍 Rechercher
                        </button>
                        <button onclick="CalculUpUser.switchCatalogTab('favorites')" 
                                id="tab-favorites"
                                class="flex-1 px-4 py-2 text-stone-600 rounded-lg font-medium transition-all hover:bg-stone-50">
                            ⭐ Mes favoris (${(user.favorites || []).length})
                        </button>
                        <button onclick="CalculUpUser.switchCatalogTab('created')" 
                                id="tab-created"
                                class="flex-1 px-4 py-2 text-stone-600 rounded-lg font-medium transition-all hover:bg-stone-50">
                            📝 Mes questions (${user.stats?.questionsCreated || 0})
                        </button>
                    </div>
                </div>

                <!-- Contenu selon l'onglet -->
                <div id="catalog-content">
                    ${renderSearchTab(user)}
                </div>
            </div>
        </div>
    `;
    
    // Charger automatiquement toutes les questions pour l'onglet recherche
    setTimeout(() => searchQuestions(), 500);
}

// 🆕 NOUVELLE FONCTION : Gestion des onglets
function switchCatalogTab(tab) {
    const user = CalculUpCore.getUser();
    
    // Mettre à jour les onglets visuellement
    document.querySelectorAll('[id^="tab-"]').forEach(tabBtn => {
        tabBtn.className = 'flex-1 px-4 py-2 text-stone-600 rounded-lg font-medium transition-all hover:bg-stone-50';
    });
    
    document.getElementById(`tab-${tab}`).className = 'flex-1 px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium shadow-sm transition-all';
    
    // Mettre à jour le contenu
    const content = document.getElementById('catalog-content');
    
    switch (tab) {
        case 'search':
            content.innerHTML = renderSearchTab(user);
            setTimeout(() => searchQuestions(), 100);
            break;
        case 'favorites':
            content.innerHTML = renderFavoritesTab(user);
            loadFavoriteQuestions();
            break;
        case 'created':
            content.innerHTML = renderCreatedTab(user);
            break;
    }
}

// 🆕 NOUVELLE FONCTION : Onglet recherche  
function renderSearchTab(user) {
    return `
        <!-- Statistiques basiques -->
        <div class="dashboard-card slide-in">
            <h3 class="text-lg font-semibold mb-4 text-stone-700">📊 Catalogue</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="stat-card emerald">
                    <div class="text-2xl font-bold" id="total-questions">50+</div>
                    <div class="text-sm">Questions disponibles</div>
                </div>
                <div class="stat-card sky">
                    <div class="text-2xl font-bold">${(user.favorites || []).length}</div>
                    <div class="text-sm">Mes favoris</div>
                </div>
                <div class="stat-card amber">
                    <div class="text-2xl font-bold">${user.stats?.questionsCreated || 0}</div>
                    <div class="text-sm">Mes créations</div>
                </div>
                <div class="stat-card violet">
                    <div class="text-2xl font-bold">50+</div>
                    <div class="text-sm">Questions système</div>
                </div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="dashboard-card slide-in">
            <h3 class="text-lg font-semibold mb-4 text-stone-700">🔍 Filtres de recherche</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Niveau</label>
                    <select id="level-filter" class="w-full p-2 border border-stone-300 rounded-lg">
                        <option value="">Tous niveaux</option>
                        <option value="seconde">Seconde</option>
                        <option value="premiere">Première</option>
                        <option value="terminale">Terminale</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Difficulté</label>
                    <select id="difficulty-filter" class="w-full p-2 border border-stone-300 rounded-lg">
                        <option value="">Toutes difficultés</option>
                        <option value="facile">Facile</option>
                        <option value="moyen">Moyen</option>
                        <option value="difficile">Difficile</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Type</label>
                    <select id="type-filter" class="w-full p-2 border border-stone-300 rounded-lg">
                        <option value="">Tous types</option>
                        <option value="qcm">QCM</option>
                        <option value="open">Questions ouvertes</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Créateur</label>
                    <select id="creator-filter" class="w-full p-2 border border-stone-300 rounded-lg">
                        <option value="">Tous créateurs</option>
                        <option value="system">Questions système</option>
                        <option value="teachers">Enseignants</option>
                        <option value="students">Élèves</option>
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Chapitre</label>
                    <select id="chapter-filter" class="w-full p-2 border border-stone-300 rounded-lg">
                        <option value="">Tous chapitres</option>
                        <option value="Dérivation">Dérivation</option>
                        <option value="Suites">Suites</option>
                        <option value="Probabilités">Probabilités</option>
                        <option value="Géométrie">Géométrie</option>
                        <option value="Fonctions">Fonctions</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Recherche libre</label>
                    <input type="text" id="search-text" placeholder="Mots-clés dans l'énoncé..."
                           class="w-full p-2 border border-stone-300 rounded-lg">
                </div>
            </div>
            
            <div class="flex justify-between items-center">
                <button onclick="CalculUpUser.resetFilters()" 
                        class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors">
                    🔄 Réinitialiser
                </button>
                <button onclick="CalculUpUser.searchQuestions()" 
                        class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    🔍 Rechercher
                </button>
            </div>
        </div>

        <!-- Résultats de recherche -->
        <div class="dashboard-card slide-in">
            <h3 class="text-lg font-semibold mb-4 text-stone-700">📋 Résultats</h3>
            <div id="questions-results">
                <div class="text-center text-stone-500 py-8">
                    <div class="text-4xl mb-4">🔍</div>
                    <p>Utilisez les filtres ci-dessus pour rechercher des questions</p>
                    <p class="text-sm">Ou cliquez sur "Rechercher" pour voir toutes les questions</p>
                </div>
            </div>
        </div>
    `;
}

// 🆕 NOUVELLE FONCTION : Onglet favoris
function renderFavoritesTab(user) {
    const favoritesCount = (user.favorites || []).length;
    
    return `
        <div class="dashboard-card slide-in">
            <h3 class="text-lg font-semibold mb-4 text-stone-700">⭐ Mes questions favorites</h3>
            
            ${favoritesCount === 0 ? `
                <div class="text-center text-stone-500 py-12">
                    <div class="text-6xl mb-4">⭐</div>
                    <h4 class="text-xl font-semibold text-stone-700 mb-2">Aucune question en favoris</h4>
                    <p class="text-stone-600 mb-6">Ajoutez des questions à vos favoris pour les retrouver facilement</p>
                    <button onclick="CalculUpUser.switchCatalogTab('search')" 
                            class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors">
                        🔍 Rechercher des questions
                    </button>
                </div>
            ` : `
                <div class="mb-4 flex justify-between items-center">
                    <p class="text-stone-600">Vous avez ${favoritesCount} question(s) en favoris</p>
                    <button onclick="CalculUpUser.clearAllFavorites()" 
                            class="text-rose-600 hover:text-rose-700 text-sm transition-colors">
                        🗑️ Vider tous les favoris
                    </button>
                </div>
                
                <div id="favorites-questions">
                    <div class="text-center text-stone-500 py-4">
                        <div class="loading-spin mx-auto mb-2"></div>
                        Chargement de vos favoris...
                    </div>
                </div>
            `}
        </div>
    `;
}

// 🆕 NOUVELLE FONCTION : Onglet questions créées
function renderCreatedTab(user) {
    const createdQuestions = user.createdQuestions || [];
    
    return `
        <div class="dashboard-card slide-in">
            <h3 class="text-lg font-semibold mb-4 text-stone-700 flex items-center justify-between">
                <span>📝 Mes questions créées</span>
                <button onclick="CalculUpCore.navigateToScreen('create-question')" 
                        class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    ➕ Créer une question
                </button>
            </h3>
            
            ${createdQuestions.length === 0 ? `
                <div class="text-center text-stone-500 py-12">
                    <div class="text-6xl mb-4">📝</div>
                    <h4 class="text-xl font-semibold text-stone-700 mb-2">Aucune question créée</h4>
                    <p class="text-stone-600 mb-6">Commencez par créer votre première question</p>
                    <button onclick="CalculUpCore.navigateToScreen('create-question')" 
                            class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors">
                        📝 Créer ma première question
                    </button>
                </div>
            ` : `
                <div class="space-y-4">
                    ${createdQuestions.map(question => {
                        const statusInfo = getQuestionStatusInfo(question.status);
                        return `
                            <div class="border border-stone-200 rounded-lg p-4 ${statusInfo.bgClass}">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 class="font-semibold text-stone-800">${question.chapter} - ${question.notion}</h4>
                                        <p class="text-stone-700 text-sm">${question.question.substring(0, 100)}${question.question.length > 100 ? '...' : ''}</p>
                                    </div>
                                    <span class="px-2 py-1 rounded-full text-xs ${statusInfo.badgeClass}">
                                        ${statusInfo.icon} ${statusInfo.label}
                                    </span>
                                </div>
                                
                                <div class="flex justify-between items-center">
                                    <div class="text-sm text-stone-600">
                                        <span>${question.difficulty}</span> • 
                                        <span>${question.type === 'qcm' ? 'QCM' : 'Ouverte'}</span> • 
                                        <span>${question.points || 10} pts</span>
                                        ${question.createdAt ? ` • ${new Date(question.createdAt).toLocaleDateString('fr-FR')}` : ''}
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold ${question.earnedPoints > 0 ? 'text-emerald-600' : 'text-stone-400'}">
                                            ${question.earnedPoints > 0 ? '+' : ''}${question.earnedPoints || 0} XP
                                        </div>
                                    </div>
                                </div>
                                
                                ${question.moderatorNote ? `
                                    <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p class="text-sm text-blue-700">
                                            <strong>💬 Note du modérateur :</strong> ${question.moderatorNote}
                                        </p>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;
}

// 🆕 NOUVELLE FONCTION : Charger questions favorites
async function loadFavoriteQuestions() {
    try {
        const user = CalculUpCore.getUser();
        const favorites = user.favorites || [];
        
        if (favorites.length === 0) return;
        
        CalculUpCore.showLoading('Chargement de vos favoris...');
        
        // Récupérer les questions favorites (par défaut + BDD)
        let allQuestions = CalculUpData.getDefaultQuestions();
        
        try {
            const db = CalculUpCore.getDb();
            const snapshot = await db.collection('questions')
                .where('verified', '==', true)
                .get();
            
            const dbQuestions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            allQuestions = [...allQuestions, ...dbQuestions];
        } catch (error) {
            console.log('📚 Utilisation questions locales pour favoris');
        }
        
        // Filtrer les questions favorites
        const favoriteQuestions = allQuestions.filter(q => 
            favorites.includes(q.id)
        );
        
        displayFavoriteQuestions(favoriteQuestions);
        
    } catch (error) {
        console.error('❌ Erreur chargement favoris:', error);
        const container = document.getElementById('favorites-questions');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-rose-600 py-8">
                    <div class="text-4xl mb-4">⚠️</div>
                    <p>Erreur de chargement des favoris</p>
                    <button onclick="CalculUpUser.loadFavoriteQuestions()" 
                            class="mt-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200">
                        🔄 Réessayer
                    </button>
                </div>
            `;
        }
    } finally {
        CalculUpCore.hideLoading();
    }
}

// 🆕 NOUVELLE FONCTION : Afficher questions favorites
function displayFavoriteQuestions(questions) {
    const container = document.getElementById('favorites-questions');
    if (!container) return;
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-amber-600 py-8">
                <div class="text-4xl mb-4">😔</div>
                <p>Certaines questions favorites sont indisponibles</p>
                <p class="text-sm">Elles ont peut-être été supprimées ou modifiées</p>
            </div>
        `;
        return;
    }
    
    // Réutiliser la fonction d'affichage existante
    container.innerHTML = `<div id="questions-results"></div>`;
    displayQuestionResults(questions);
}

// 🆕 NOUVELLE FONCTION : Vider tous les favoris
async function clearAllFavorites() {
    if (!confirm('Êtes-vous sûr de vouloir vider tous vos favoris ?')) {
        return;
    }
    
    try {
        const success = await CalculUpCore.updateUserData({
            favorites: []
        });
        
        if (success) {
            CalculUpCore.showSuccess('✅ Tous les favoris ont été supprimés');
            // Recharger l'onglet favoris
            switchCatalogTab('favorites');
        }
    } catch (error) {
        console.error('❌ Erreur suppression favoris:', error);
        CalculUpCore.showError('Erreur lors de la suppression');
    }
}

// 🆕 NOUVELLE FONCTION : Info statut question
function getQuestionStatusInfo(status) {
    const statusMap = {
        'pending': {
            label: 'En attente',
            icon: '⏳',
            bgClass: 'bg-amber-50',
            badgeClass: 'bg-amber-100 text-amber-700'
        },
        'validated': {
            label: 'Validée (+5 XP)',
            icon: '✅',
            bgClass: 'bg-emerald-50',
            badgeClass: 'bg-emerald-100 text-emerald-700'
        },
        'excellent': {
            label: 'Excellente (+10 XP)',
            icon: '🌟',
            bgClass: 'bg-emerald-50',
            badgeClass: 'bg-emerald-100 text-emerald-700'
        },
        'rejected': {
            label: 'Refusée',
            icon: '❌',
            bgClass: 'bg-rose-50',
            badgeClass: 'bg-rose-100 text-rose-700'
        }
    };
    
    return statusMap[status] || statusMap['pending'];
}

    // =============================================================================
    // FONCTIONS CATALOGUE DE QUESTIONS - RESTAURÉES
    // =============================================================================

    function resetFilters() {
        const filters = ['level-filter', 'difficulty-filter', 'type-filter', 'creator-filter', 'chapter-filter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) element.value = '';
        });
        
        const searchText = document.getElementById('search-text');
        if (searchText) searchText.value = '';
        
        // Recharger toutes les questions
        searchQuestions();
    }

    async function searchQuestions() {
        try {
            CalculUpCore.showLoading('Recherche en cours...');
            
            // Récupérer les filtres
            const filters = {
                level: document.getElementById('level-filter')?.value || '',
                difficulty: document.getElementById('difficulty-filter')?.value || '',
                type: document.getElementById('type-filter')?.value || '',
                creator: document.getElementById('creator-filter')?.value || '',
                chapter: document.getElementById('chapter-filter')?.value || '',
                searchText: document.getElementById('search-text')?.value.toLowerCase() || ''
            };
            
            // Récupérer les questions par défaut
            let questions = CalculUpData.getDefaultQuestions();
            
            // Essayer de récupérer aussi les questions de la base
            try {
                const db = CalculUpCore.getDb();
                const snapshot = await db.collection('questions')
                    .where('verified', '==', true)
                    .limit(100)
                    .get();
                
                const dbQuestions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                questions = [...questions, ...dbQuestions];
            } catch (error) {
                console.log('📚 Utilisation questions locales seulement');
            }
            
            // Appliquer les filtres
            let filteredQuestions = questions.filter(q => {
                if (filters.level && q.level !== filters.level) return false;
                if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
                if (filters.type && q.type !== filters.type) return false;
                if (filters.chapter && q.chapter !== filters.chapter) return false;
                if (filters.creator) {
                    if (filters.creator === 'system' && q.creator !== 'system') return false;
                    if (filters.creator === 'teachers' && (q.creator === 'system' || !q.creator)) return false;
                    if (filters.creator === 'students' && (q.creator === 'system' || !q.creator)) return false;
                }
                if (filters.searchText && !q.question.toLowerCase().includes(filters.searchText)) return false;
                
                return true;
            });
            
            // Limiter à 50 résultats
            filteredQuestions = filteredQuestions.slice(0, 50);
            
            displayQuestionResults(filteredQuestions);
            
            // Mettre à jour le compteur
            const totalElement = document.getElementById('total-questions');
            if (totalElement) {
                totalElement.textContent = filteredQuestions.length;
            }
            
        } catch (error) {
            console.error('❌ Erreur recherche questions:', error);
            CalculUpCore.showError('Erreur lors de la recherche');
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    function displayQuestionResults(questions) {
    const container = document.getElementById('questions-results');
    if (!container) return;
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-stone-500 py-8">
                <div class="text-4xl mb-4">🔍</div>
                <p>Aucune question trouvée avec ces critères</p>
                <button onclick="CalculUpUser.resetFilters()" 
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Réinitialiser les filtres
                </button>
            </div>
        `;
        return;
    }
    
    const user = CalculUpCore.getUser();
    const canSeeAnswers = user.status === 'active';
    const userFavorites = user.favorites || [];
    
    container.innerHTML = questions.map(question => {
        const isFavorite = userFavorites.includes(question.id);
        
        return `
            <div class="border border-stone-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-stone-800">${question.chapter} - ${question.notion}</h4>
                        <div class="flex space-x-2 mt-1">
                            <span class="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">${question.level}</span>
                            <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">${question.difficulty}</span>
                            <span class="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded">${question.type === 'qcm' ? 'QCM' : 'Ouverte'}</span>
                            <span class="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">${question.points || 10} pts</span>
                        </div>
                    </div>
                    <button onclick="CalculUpUser.toggleFavorite('${question.id}')" 
                            class="px-3 py-1 ${isFavorite ? 'bg-amber-200 text-amber-800' : 'bg-amber-100 text-amber-700'} rounded-lg transition-colors hover:bg-amber-200">
                        ${isFavorite ? '⭐ Favori' : '☆ Ajouter aux favoris'}
                    </button>
                </div>
                
                <div class="text-stone-700 mb-3">
                    <strong>Question :</strong> ${question.question}
                </div>
                
                ${canSeeAnswers ? `
                    ${question.type === 'qcm' ? `
                        <div class="space-y-2 mb-3">
                            ${question.choices.map((choice, index) => `
                                <div class="p-3 border rounded-lg ${index === question.correctChoice ? 'bg-emerald-50 border-emerald-300' : 'border-stone-200'}">
                                    <span class="font-medium mr-2">${String.fromCharCode(65 + index)}.</span>
                                    ${choice}
                                    ${index === question.correctChoice ? '<span class="text-emerald-600 ml-2">✓</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
                            <strong>Réponse :</strong> ${question.answer}
                            ${question.variants && question.variants.length > 0 ? `
                                <br><strong>Variantes acceptées :</strong> ${question.variants.join(', ')}
                            ` : ''}
                        </div>
                    `}
                    
                    ${question.explanation ? `
                        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                            <strong>Explication :</strong> ${question.explanation}
                        </div>
                    ` : ''}
                    
                    ${question.hint ? `
                        <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                            <strong>Indice :</strong> ${question.hint}
                        </div>
                    ` : ''}
                ` : `
                    <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                        <div class="text-amber-700 text-sm">
                            🔒 <strong>Réponses masquées</strong> - Votre compte dispose d'un accès provisoire.
                            Après validation complète par un administrateur, vous aurez accès aux réponses et explications.
                        </div>
                    </div>
                `}
                
                <div class="text-xs text-stone-500">
                    Créé par ${question.creator === 'system' ? 'Système' : question.creator || 'Inconnu'} | 
                    Temps limite : ${question.timeLimit || 30}s
                </div>
            </div>
        `;
    }).join('');
}

// 🆕 NOUVELLE FONCTION : Affichage des favoris
function showFavoritesSection() {
    const user = CalculUpCore.getUser();
    const userFavorites = user.favorites || [];
    
    if (userFavorites.length === 0) {
        return `
            <div class="text-center text-stone-500 py-8">
                <div class="text-4xl mb-4">⭐</div>
                <p>Aucune question en favoris</p>
                <p class="text-sm mt-2">Ajoutez des questions à vos favoris pour les retrouver facilement</p>
            </div>
        `;
    }
    
    // TODO: Récupérer les questions favorites depuis la base
    return `
        <div class="space-y-4">
            <p class="text-stone-600">Vous avez ${userFavorites.length} question(s) en favoris</p>
            <div id="favorites-questions">
                <!-- Les questions favorites seront chargées ici -->
            </div>
        </div>
    `;
}


async function toggleFavorite(questionId) {
    try {
        console.log('⭐ toggleFavorite appelée pour:', questionId);
        
        const user = CalculUpCore.getUser();
        if (!user) {
            CalculUpCore.showError('Vous devez être connecté pour gérer les favoris');
            return;
        }
        
        // Initialiser favorites si inexistant
        if (!user.favorites) {
            user.favorites = [];
        }
        
        const isFavorite = user.favorites.includes(questionId);
        console.log('📊 État actuel favori:', isFavorite, 'pour question:', questionId);
        
        let updatedFavorites;
        
        if (isFavorite) {
            // Retirer des favoris
            updatedFavorites = user.favorites.filter(id => id !== questionId);
            CalculUpCore.showSuccess('❌ Question retirée des favoris');
        } else {
            // Ajouter aux favoris
            updatedFavorites = [...user.favorites, questionId];
            CalculUpCore.showSuccess('⭐ Question ajoutée aux favoris');
        }
        
        // 🆕 MISE À JOUR VISUELLE IMMÉDIATE avec sélecteur plus précis
        updateFavoriteButtonImmediate(questionId, !isFavorite);
        
        // Mise à jour des données locales immédiatement
        user.favorites = updatedFavorites;
        
        // Mise à jour en base (asynchrone)
        try {
            const success = await CalculUpCore.updateUserData({
                favorites: updatedFavorites
            });
            
            if (!success) {
                // En cas d'erreur, remettre l'état original
                user.favorites = isFavorite ? [...user.favorites, questionId] : user.favorites.filter(id => id !== questionId);
                updateFavoriteButtonImmediate(questionId, isFavorite);
                CalculUpCore.showError('Erreur lors de la sauvegarde');
            }
        } catch (saveError) {
            console.error('❌ Erreur sauvegarde favoris:', saveError);
            // Remettre l'état original
            user.favorites = isFavorite ? [...user.favorites, questionId] : user.favorites.filter(id => id !== questionId);
            updateFavoriteButtonImmediate(questionId, isFavorite);
            CalculUpCore.showError('Erreur lors de la sauvegarde');
        }
        
    } catch (error) {
        console.error('❌ Erreur gestion favoris:', error);
        CalculUpCore.showError('Erreur lors de la gestion des favoris');
    }
}

// 🆕 FONCTION CORRIGÉE avec sélecteurs plus robustes
// Dans calcul-up-user.js, REMPLACER la fonction updateFavoriteButtonImmediate par :

function updateFavoriteButtonImmediate(questionId, isFavorite) {
    console.log('🔄 Mise à jour visuelle bouton favori:', questionId, '-> nouveau état:', isFavorite);
    
    // 🔧 CORRECTION : Chercher avec le bon préfixe CalculUpUser.toggleFavorite
    const buttons1 = document.querySelectorAll(`button[onclick*="CalculUpUser.toggleFavorite('${questionId}')"]`);
    console.log('🔍 Boutons trouvés méthode 1:', buttons1.length);
    
    // Méthode 2: Chercher tous les boutons et filtrer manuellement
    const allButtons = document.querySelectorAll('button');
    const matchingButtons = [];
    
    allButtons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (onclick && onclick.includes(`CalculUpUser.toggleFavorite('${questionId}')`)) {
            matchingButtons.push(button);
        }
    });
    
    console.log('🔍 Boutons trouvés méthode 2:', matchingButtons.length);
    
    // Combiner les résultats
    const allMatchingButtons = [...buttons1, ...matchingButtons];
    const uniqueButtons = [...new Set(allMatchingButtons)];
    
    console.log('🔍 Total boutons uniques à mettre à jour:', uniqueButtons.length);
    
    uniqueButtons.forEach((button, index) => {
        console.log(`🔄 Mise à jour bouton ${index + 1} - ancien:`, button.innerHTML);
        
        if (isFavorite) {
            // Question ajoutée aux favoris
            button.innerHTML = '⭐ Favori';
            // Mise à jour complète des classes
            button.className = button.className
                .replace('bg-amber-100', 'bg-amber-200')
                .replace('text-amber-700', 'text-amber-800');
            console.log('✅ Bouton mis à jour vers favori, nouveau:', button.innerHTML);
        } else {
            // Question retirée des favoris
            button.innerHTML = '☆ Ajouter aux favoris';
            // Mise à jour complète des classes
            button.className = button.className
                .replace('bg-amber-200', 'bg-amber-100')
                .replace('text-amber-800', 'text-amber-700');
            console.log('✅ Bouton mis à jour vers non-favori, nouveau:', button.innerHTML);
        }
    });
    
    // Si aucun bouton trouvé, logger pour debug
    if (uniqueButtons.length === 0) {
        console.warn('⚠️ Aucun bouton favori trouvé pour:', questionId);
        console.log('🔍 Debug - Recherche de boutons avec toggleFavorite:');
        document.querySelectorAll('button[onclick*="toggleFavorite"]').forEach((btn, i) => {
            console.log(`Bouton ${i}:`, btn.getAttribute('onclick'));
        });
    }
}
    // =============================================================================
    // 🆕 FONCTIONS POUR SIGNALEMENTS ENSEIGNANTS
    // =============================================================================

    // =============================================================================
    // 🆕 FONCTIONS POUR SIGNALEMENTS ENSEIGNANTS - VERSION COMPLÈTE
    // =============================================================================

    function showReportValidation() {
        const user = CalculUpCore.getUser();
        
        // Vérifier les permissions
        const canManageReports = user.type === 'admin' || 
                                (user.type === 'teacher' && user.status === 'active' && (user.level || 1) >= 15);
        
        if (!canManageReports) {
            if (user.type === 'teacher') {
                if (user.status !== 'active') {
                    CalculUpCore.showError('Votre compte doit être validé pour accéder aux signalements');
                } else {
                    CalculUpCore.showError('Vous devez atteindre le niveau 15 pour traiter les signalements (niveau actuel : ' + (user.level || 1) + ')');
                }
            } else {
                CalculUpCore.showError('Accès non autorisé');
            }
            return;
        }
        
        console.log('📨 Tentative d\'accès signalements enseignant:', user.identifier, 'Niveau:', user.level);
        
        // Vérifier si le module Reports est disponible
        if (typeof CalculUpReports !== 'undefined' && CalculUpReports.showReportsManagement) {
            console.log('✅ Module CalculUpReports trouvé pour enseignant');
            CalculUpReports.showReportsManagement();
        } else {
            console.warn('⚠️ Module CalculUpReports non disponible pour enseignant');
            
            // Interface de secours pour enseignants
            const root = document.getElementById('root');
            root.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
                    <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                        <div class="flex items-center">
                            <button onclick="CalculUpCore.navigateToScreen('teacher-dashboard')" 
                                    class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                                <span class="text-xl">←</span>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-stone-700">Signalements Enseignant</h1>
                                <p class="text-stone-500">
                                    Interface temporaire (+25 XP par signalement traité)
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-stone-600">@${user.identifier}</span>
                            <button onclick="CalculUpAuth.handleLogout()" 
                                    class="bg-rose-100 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200">
                                🚪
                            </button>
                        </div>
                    </div>
                    
                    <div class="max-w-6xl mx-auto p-6 space-y-6">
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-4 text-stone-700">⚠️ Module de signalements</h3>
                            <div class="space-y-4">
                                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p class="text-amber-700">
                                        <strong>Module non disponible :</strong> Le système de signalements principal n'est pas chargé.
                                    </p>
                                    <p class="text-amber-600 text-sm mt-2">
                                        En tant qu'enseignant niveau ${user.level}, vous pouvez traiter les signalements pour gagner +25 XP.
                                    </p>
                                </div>
                                
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p class="text-blue-700">
                                        <strong>Vos privilèges :</strong><br>
                                        • Traitement des signalements de questions<br>
                                        • Validation/rejet avec attribution de points<br>
                                        • +25 XP par signalement traité correctement
                                    </p>
                                </div>
                                
                                <button onclick="CalculUpUser.loadTeacherReports()" 
                                        class="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors">
                                    🔄 Charger les signalements à traiter
                                </button>
                            </div>
                            
                            <div id="teacher-reports" class="mt-6">
                                <!-- Les signalements seront chargés ici -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Fonction de secours pour charger les signalements enseignants
    async function loadTeacherReports() {
        try {
            CalculUpCore.showLoading('Chargement des signalements...');
            
            const db = CalculUpCore.getDb();
            if (!db) {
                throw new Error('Base de données non disponible');
            }
            
            console.log('📨 Chargement signalements pour enseignant...');
            
            const reportsSnapshot = await db.collection('reports')
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            const reports = reportsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('📨 Signalements trouvés pour enseignant:', reports.length);
            
            displayTeacherReports(reports);
            
        } catch (error) {
            console.error('❌ Erreur chargement signalements enseignant:', error);
            CalculUpCore.showError('Erreur de chargement : ' + error.message);
            
            const container = document.getElementById('teacher-reports');
            if (container) {
                container.innerHTML = `
                    <div class="text-center text-red-600 py-8">
                        <div class="text-4xl mb-4">⚠️</div>
                        <p>Erreur de chargement des signalements</p>
                        <p class="text-sm mt-2">${error.message}</p>
                        <button onclick="CalculUpUser.loadTeacherReports()" 
                                class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            🔄 Réessayer
                        </button>
                    </div>
                `;
            }
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    function displayTeacherReports(reports) {
        const container = document.getElementById('teacher-reports');
        if (!container) return;
        
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-8">
                    <div class="text-4xl mb-4">✅</div>
                    <p>Aucun signalement en attente de traitement</p>
                    <p class="text-sm text-stone-500 mt-2">Revenez plus tard pour traiter de nouveaux signalements</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h4 class="text-lg font-semibold mb-4 text-stone-700">
                📨 Signalements à traiter (${reports.length}) • +25 XP par traitement
            </h4>
            <div class="space-y-4">
                ${reports.map(report => {
                    const createdDate = report.createdAt?.toDate?.() || new Date();
                    const priorityIcon = report.priority === 'high' ? '🔥' : '📋';
                    
                    return `
                        <div class="border border-stone-200 rounded-lg p-4 bg-white">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h5 class="font-semibold text-stone-800 flex items-center">
                                        ${priorityIcon} ${getReportTypeLabel(report.reportType)}
                                    </h5>
                                    <p class="text-sm text-stone-600">
                                        Par ${report.reporterName} (@${report.reporterIdentifier}) le ${createdDate.toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                                    En attente
                                </span>
                            </div>
                            
                            ${report.questionText ? `
                                <div class="bg-stone-50 p-3 rounded-lg mb-3">
                                    <p class="text-sm">
                                        <strong>Question :</strong> ${report.questionText}
                                    </p>
                                    ${report.userAnswer ? `
                                        <p class="text-sm mt-1">
                                            <strong>Réponse utilisateur :</strong> ${report.userAnswer}
                                        </p>
                                    ` : ''}
                                    ${report.correctAnswer ? `
                                        <p class="text-sm mt-1">
                                            <strong>Réponse correcte :</strong> ${report.correctAnswer}
                                        </p>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            ${report.description ? `
                                <div class="bg-blue-50 p-3 rounded-lg mb-3">
                                    <p class="text-sm">
                                        <strong>Description :</strong> ${report.description}
                                    </p>
                                </div>
                            ` : ''}
                            
                            ${report.priority === 'high' ? `
                                <div class="bg-orange-50 p-2 rounded-lg mb-3">
                                    <p class="text-sm text-orange-700">🔥 <strong>Priorité haute</strong> - Signalement critique</p>
                                </div>
                            ` : ''}
                            
                            <div class="flex space-x-3">
                                <button onclick="CalculUpUser.processTeacherReport('${report.id}', 'resolved')" 
                                        class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                                    ✅ Valider (+25 XP)
                                </button>
                                <button onclick="CalculUpUser.processTeacherReport('${report.id}', 'rejected')" 
                                        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                                    ❌ Rejeter (+25 XP)
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

// 🆕 NOUVELLE FONCTION : Gestion des favoris améliorée
async function toggleFavorite(questionId) {
    try {
        const user = CalculUpCore.getUser();
        if (!user) {
            CalculUpCore.showError('Vous devez être connecté pour gérer les favoris');
            return;
        }
        
        // Initialiser favorites si inexistant
        if (!user.favorites) {
            user.favorites = [];
        }
        
        const isFavorite = user.favorites.includes(questionId);
        let updatedFavorites;
        
        if (isFavorite) {
            // Retirer des favoris
            updatedFavorites = user.favorites.filter(id => id !== questionId);
            CalculUpCore.showSuccess('❌ Question retirée des favoris');
        } else {
            // Ajouter aux favoris
            updatedFavorites = [...user.favorites, questionId];
            CalculUpCore.showSuccess('⭐ Question ajoutée aux favoris');
        }
        
        // Mise à jour en base
        const success = await CalculUpCore.updateUserData({
            favorites: updatedFavorites
        });
        
        if (success) {
            // Mettre à jour l'interface
            updateFavoriteButton(questionId, !isFavorite);
        }
        
    } catch (error) {
        console.error('❌ Erreur gestion favoris:', error);
        CalculUpCore.showError('Erreur lors de la gestion des favoris');
    }
}

// 🆕 NOUVELLE FONCTION : Mise à jour visuelle bouton favori
function updateFavoriteButton(questionId, isFavorite) {
    const buttons = document.querySelectorAll(`[onclick*="${questionId}"]`);
    buttons.forEach(button => {
        if (button.textContent.includes('⭐')) {
            if (isFavorite) {
                button.innerHTML = '⭐ Favori';
                button.className = button.className.replace('bg-amber-100', 'bg-amber-200');
            } else {
                button.innerHTML = '☆ Ajouter aux favoris';
                button.className = button.className.replace('bg-amber-200', 'bg-amber-100');
            }
        }
    });
}


    async function processTeacherReport(reportId, newStatus) {
        try {
            CalculUpCore.showLoading('Traitement du signalement...');
            
            const user = CalculUpCore.getUser();
            const db = CalculUpCore.getDb();
            
            // Mettre à jour le signalement
            await db.collection('reports').doc(reportId).update({
                status: newStatus,
                handledBy: user.identifier,
                handledAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Attribuer XP à l'enseignant
            const userRef = db.collection('users').doc(user.uid);
            await userRef.update({
                xp: firebase.firestore.FieldValue.increment(25),
                'stats.reportsHandled': firebase.firestore.FieldValue.increment(1)
            });
            
            // Mettre à jour les données locales
            user.xp = (user.xp || 0) + 25;
            user.stats = user.stats || {};
            user.stats.reportsHandled = (user.stats.reportsHandled || 0) + 1;
            
            CalculUpCore.showSuccess(`✅ Signalement ${newStatus === 'resolved' ? 'validé' : 'rejeté'} ! +25 XP`);
            
            // Vérifier montée de niveau
            await CalculUpCore.checkLevelUp(user.uid, user.xp);
            
            // Recharger les signalements
            setTimeout(loadTeacherReports, 1500);
            
        } catch (error) {
            console.error('❌ Erreur traitement signalement enseignant:', error);
            CalculUpCore.showError('Erreur de traitement : ' + error.message);
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    function getReportTypeLabel(type) {
        const labels = {
            'wrong_answer': 'Réponse incorrecte',
            'wrong_correction': 'Correction erronée',
            'question_error': 'Erreur dans l\'énoncé',
            'inappropriate_content': 'Contenu inapproprié',
            'technical_issue': 'Problème technique'
        };
        return labels[type] || 'Type inconnu';
    }

    // =============================================================================
    // FONCTIONS UTILITAIRES
    // =============================================================================
    
    function isFeatureUnlocked(user, feature) {
        if (!user || user.type !== 'student') return false;
        
        // 🆕 BLOQUER validateReports POUR LES ÉLÈVES
        if (feature === 'validateReports' && user.type === 'student') {
            return false; // Jamais accessible aux élèves
        }
        
        const requiredLevel = CalculUpData.getFeatureLevels()[feature];
        return (user.level || 1) >= requiredLevel;
    }

    function getFeatureStatus(feature) {
        const requiredLevel = CalculUpData.getFeatureLevels()[feature];
        const user = CalculUpCore.getUser();
        const currentLevel = user?.level || 1;
        
        if (currentLevel >= requiredLevel) {
            return { unlocked: true, message: 'Débloqué !' };
        } else {
            return { 
                unlocked: false, 
                message: `Débloqué au niveau ${requiredLevel}` 
            };
        }
    }

    function generateLockedFeaturesHTML(user) {
        const features = CalculUpData.getFeatureLevels();
        const lockedFeatures = [];
        const comingSoonFeatures = [];
        
       Object.entries(features).forEach(([feature, level]) => {
        const isUnlocked = isFeatureUnlocked(user, feature);
        const isImplemented = IMPLEMENTED_FEATURES.includes(feature);
        
        // 🆕 EXCLURE validateReports POUR LES ÉLÈVES
        if (feature === 'validateReports' && user.type === 'student') {
            return; // Skip cette fonctionnalité pour les élèves
        }
        
        if (!isUnlocked) {
            // Fonctionnalité pas encore débloquée
            lockedFeatures.push({ feature, level, status: 'locked' });
        } else if (!isImplemented) {
            // Fonctionnalité débloquée mais pas implémentée
            comingSoonFeatures.push({ feature, level, status: 'coming_soon' });
        }
    });
        
        // 🆕 TOUJOURS AFFICHER LES FONCTIONNALITÉS NON-IMPLÉMENTÉES
        const allFeaturesToShow = [...lockedFeatures, ...comingSoonFeatures];
        
        if (allFeaturesToShow.length === 0) {
            // Vraiment toutes les fonctionnalités sont débloquées ET implémentées
            return '<div class="alert success">🎉 Toutes les fonctionnalités disponibles sont débloquées !</div>';
        }

        return `
            <div class="space-y-4">
                <h4 class="text-lg font-semibold text-stone-700">
                    ${lockedFeatures.length > 0 ? '🔒 À débloquer' : '🚀 Fonctionnalités à venir'}
                </h4>
                
                ${!isFeatureUnlocked(user, 'createQuestions') ? `
                    <div class="dashboard-card opacity-75">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">📝</span>
                                <div>
                                    <h4 class="font-semibold text-stone-700">Créer des questions</h4>
                                    <p class="text-sm text-stone-600">${getFeatureStatus('createQuestions').message}</p>
                                </div>
                            </div>
                            <span class="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-sm">Niv. ${features.createQuestions}</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${allFeaturesToShow.map(({feature, level, status}) => {
                        const icons = {
                            multiplayer: '⚔️',
                            addFriends: '👥',
                            joinTournaments: '🏆',
                            createTournaments: '🎮'
                        };
                        const names = {
                            multiplayer: 'Mode multijoueur',
                            addFriends: 'Ajouter des amis',
                            joinTournaments: 'Participer aux tournois',
                            createTournaments: 'Créer des tournois'
                        };
                        
                        if (feature === 'createQuestions') return '';
                        
                        const isLocked = status === 'locked';
                        const statusText = isLocked ? `Débloqué au niveau ${level}` : 'Bientôt disponible !';
                        const statusColor = isLocked ? 'bg-stone-200 text-stone-700' : 'bg-amber-200 text-amber-700';
                        
                        return `
                            <div class="dashboard-card ${isLocked ? 'opacity-75' : 'opacity-90'}">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <span class="text-2xl mr-3">${icons[feature] || '🔒'}</span>
                                        <div>
                                            <h4 class="font-semibold text-stone-700">${names[feature] || feature}</h4>
                                            <p class="text-sm text-stone-600">${statusText}</p>
                                            ${!isLocked ? '<p class="text-xs text-amber-600 mt-1">En développement</p>' : ''}
                                        </div>
                                    </div>
                                    <span class="${statusColor} px-3 py-1 rounded-full text-sm">
                                        ${isLocked ? `Niv. ${level}` : '🚧'}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function generateCurriculumHTML(curriculum, user) {
        if (!curriculum) return '<p class="text-stone-500">Curriculum non disponible</p>';
        
        return Object.entries(curriculum).map(([domain, chapters]) => `
            <div>
                <h4 class="font-medium text-emerald-600 mb-3 flex items-center">
                    <span class="mr-2">${getDomainIcon(domain)}</span>
                    ${domain}
                </h4>
                <div class="space-y-2 ml-6">
                    ${Object.entries(chapters).map(([chapter, notions]) => `
                        <div class="border border-stone-200 rounded-lg p-3">
                            <div class="flex items-center justify-between mb-2">
                                <h5 class="font-medium text-stone-700">${chapter}</h5>
                                <label class="switch">
                                    <input type="checkbox" ${areAllNotionsSeen(notions, user) ? 'checked' : ''} 
                                           onchange="CalculUpUser.toggleChapterNotions('${chapter}', '${domain}', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="space-y-1">
                                ${notions.map(notion => `
                                    <label class="flex items-center text-sm">
                                        <input type="checkbox" 
                                               ${user.preferences?.seenNotions?.[notion] ? 'checked' : ''}
                                               onchange="CalculUpUser.toggleNotionSeen('${notion}', this.checked)"
                                               class="mr-2 rounded border-stone-300 text-emerald-500 focus:ring-emerald-200">
                                        <span class="text-stone-600">${notion}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function generateChapterProgressHTML(user) {
        const curriculum = CalculUpData.getCurriculum(user.schoolLevel);
        if (!curriculum) return '<p class="text-stone-500">Données non disponibles</p>';
        
        const userStats = user.stats || {};
        const totalQuestions = userStats.totalQuestions || 0;
        
        if (totalQuestions === 0) {
            return `
                <div class="text-center py-8">
                    <div class="text-4xl mb-4">📊</div>
                    <h4 class="text-lg font-semibold text-stone-700 mb-2">Pas encore de statistiques</h4>
                    <p class="text-stone-600 mb-4">Commence un entraînement pour voir tes progressions par chapitre !</p>
                    <button onclick="CalculUpCore.navigateToScreen('game-setup')" 
                            class="btn-primary">
                        🎯 Commencer maintenant
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="alert info">
                <h4 class="font-medium mb-2">📈 Statistiques par chapitre</h4>
                <p class="text-sm text-stone-600 mb-4">
                    Cette fonctionnalité sera disponible prochainement. 
                    Pour l'instant, voici tes statistiques globales :
                </p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-emerald-600">${userStats.totalQuestions}</div>
                        <div class="text-sm text-stone-600">Questions répondues</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-sky-600">${Math.round(userStats.accuracy || 0)}%</div>
                        <div class="text-sm text-stone-600">Précision globale</div>
                    </div>
                </div>
            </div>
        `;
    }

    function generateTeacherStatusCard(user, isPendingVerification, isProvisionalAccess, canValidateReports) {
        if (isPendingVerification) {
            return `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-stone-800 mb-4">🔒 Compte en attente</h2>
                    <div class="space-y-3">
                        <div class="flex items-start space-x-3">
                            <span class="text-red-500">❌</span>
                            <span class="text-stone-700">Toutes les fonctionnalités enseignant sont <strong>bloquées</strong></span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-red-500">❌</span>
                            <span class="text-stone-700">Questions <strong>non automatiquement validées</strong></span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-red-500">❌</span>
                            <span class="text-stone-700">Pas d'accès aux <strong>réponses</strong></span>
                        </div>
                    </div>
                    
                    <div class="mt-6 p-4 bg-amber-50 rounded-lg">
                        <p class="text-sm text-amber-700">
                            <strong>⏳ En attente :</strong> Un administrateur doit valider votre compte pour débloquer l'accès.
                        </p>
                    </div>
                </div>
            `;
        } else if (isProvisionalAccess) {
            return `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-stone-800 mb-4">⚠️ Accès provisoire</h2>
                    <div class="space-y-3">
                        <div class="flex items-start space-x-3">
                            <span class="text-red-500">❌</span>
                            <span class="text-stone-700">Questions <strong>non automatiquement validées</strong> (validation admin requise)</span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-red-500">❌</span>
                            <span class="text-stone-700">Pas d'accès aux <strong>réponses</strong> des questions</span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-red-500">❌</span>
                            <span class="text-stone-700">Impossible de créer des <strong>classes</strong></span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-amber-500">⚠️</span>
                            <span class="text-stone-700">Récompenses : <strong>5-10 XP par question selon qualité</strong></span>
                        </div>
                    </div>
                    
                    <div class="mt-6 p-4 bg-emerald-50 rounded-lg">
                        <p class="text-sm text-emerald-700">
                            <strong>✅ Disponible :</strong> Création questions, consultation énoncés, favoris, entraînement.
                        </p>
                    </div>
                    
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p class="text-sm text-blue-700">
                            <strong>🚀 Après validation :</strong> Validation auto, accès réponses, gestion classes, validation signalements.
                        </p>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-stone-800 mb-4">✅ Compte validé</h2>
                    <div class="space-y-3">
                        <div class="flex items-start space-x-3">
                            <span class="text-green-500">✅</span>
                            <span class="text-stone-700">Questions <strong>automatiquement validées</strong></span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-green-500">✅</span>
                            <span class="text-stone-700"><strong>5-10 XP par question selon qualité</strong></span>
                        </div>
                        <div class="flex items-start space-x-3">
                            <span class="text-green-500">✅</span>
                            <span class="text-stone-700">Accès aux <strong>réponses complètes</strong></span>
                        </div>
                        ${canValidateReports ? `
                            <div class="flex items-start space-x-3">
                                <span class="text-green-500">✅</span>
                                <span class="text-stone-700"><strong>Validation de signalements</strong> (+25 XP)</span>
                            </div>
                        ` : `
                            <div class="flex items-start space-x-3">
                                <span class="text-amber-500">⏳</span>
                                <span class="text-stone-700">Validation signalements <strong>niveau 15+</strong></span>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }
    }

    function generateTeacherLimitationBanner(user) {
        if (user.status === 'provisional_access') {
            return `
                <div class="bg-amber-50 border-l-4 border-amber-400 p-4 m-6">
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
                                <p><strong>Limitations actuelles :</strong> Les réponses et explications sont masquées. Vous pouvez consulter les énoncés et mettre en favoris.</p>
                                <p><strong>Validation complète en cours</strong> par un administrateur pour débloquer l'accès complet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (user.status === 'pending_verification') {
            return `
                <div class="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                                🔒 Compte en attente de validation
                            </h3>
                            <div class="mt-2 text-sm text-red-700">
                                <p>Votre compte enseignant doit être validé par un administrateur pour accéder aux fonctionnalités complètes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return ''; // Compte validé - pas de bannière
    }

    function getDomainIcon(domain) {
        const icons = {
            'Analyse': '📈',
            'Géométrie': '📐',
            'Probabilités': '🎲',
            'Algèbre': '🔢',
            'Statistiques': '📊'
        };
        return icons[domain] || '📚';
    }

    function areAllNotionsSeen(notions, user) {
        if (!user.preferences?.seenNotions) return false;
        return notions.every(notion => user.preferences.seenNotions[notion]);
    }

    function showMultiplayerComingSoon() {
        CalculUpCore.showInfo('🎮 Mode multijoueur en développement ! Bientôt tu pourras défier d\'autres joueurs en temps réel.');
    }

    // =============================================================================
    // ACTIONS UTILISATEUR
    // =============================================================================
    
    async function updateSchoolLevel() {
        const newLevel = document.getElementById('school-level').value;
        
        try {
            const success = await CalculUpCore.updateUserData({
                schoolLevel: newLevel
            });
            
            if (success) {
                CalculUpCore.showSuccess('✅ Niveau scolaire mis à jour');
                setTimeout(() => showProfileScreen(), 1000);
            } else {
                throw new Error('Mise à jour échouée');
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour niveau:', error);
            CalculUpCore.showError('Impossible de mettre à jour le niveau');
        }
    }

    async function toggleNotionSeen(notion, seen) {
        try {
            const user = CalculUpCore.getUser();
            if (!user.preferences) user.preferences = {};
            if (!user.preferences.seenNotions) user.preferences.seenNotions = {};
            
            const updatePath = { [`preferences.seenNotions.${notion}`]: seen };
            
            const success = await CalculUpCore.updateUserData(updatePath);
            
            if (success) {
                user.preferences.seenNotions[notion] = seen;
                console.log('✅ Notion mise à jour:', notion, seen);
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour notion:', error);
        }
    }

    async function toggleChapterNotions(chapter, domain, seen) {
        const curriculum = CalculUpData.getCurriculum();
        const user = CalculUpCore.getUser();
        
        if (!curriculum[user.schoolLevel]?.[domain]?.[chapter]) return;
        
        const notions = curriculum[user.schoolLevel][domain][chapter];
        
        for (const notion of notions) {
            await toggleNotionSeen(notion, seen);
            // Mettre à jour visuellement les checkboxes
            const checkbox = document.querySelector(`input[onchange*="${notion}"]`);
            if (checkbox) checkbox.checked = seen;
        }
    }

    function markFeatureAsImplemented(featureName) {
        if (!IMPLEMENTED_FEATURES.includes(featureName)) {
            IMPLEMENTED_FEATURES.push(featureName);
            console.log(`✅ Fonctionnalité "${featureName}" marquée comme implémentée`);
        }
    }

    // =============================================================================
    // API PUBLIQUE DU MODULE
    // =============================================================================
    
// DANS calcul-up-user.js, tout à la fin du fichier
// REMPLACER la section "return {" par :

return {
    // Écrans
    showHomeScreen,
    showProfileScreen,
    showStatsScreen,
    showTeacherDashboard,
    
    // Actions utilisateur
    updateSchoolLevel,
    toggleNotionSeen,
    toggleChapterNotions,
    
    // Catalogue de questions - RESTAURÉ + NOUVELLES FONCTIONS
    showQuestionCatalog,
    switchCatalogTab,              // 🆕 AJOUTER
    resetFilters,
    searchQuestions,
    loadFavoriteQuestions,         // 🆕 AJOUTER  
    clearAllFavorites,             // 🆕 AJOUTER
    toggleFavorite,
    
    // 🆕 Fonctions pour signalements enseignants
    showReportValidation,
    loadTeacherReports,            // 🆕 AJOUTER
    processTeacherReport,          // 🆕 AJOUTER
    
    // Nouvelles fonctions
    showMultiplayerComingSoon,
    showClassManagement,           // 🆕 AJOUTER
    showTournamentCreation,        // 🆕 AJOUTER
    showQuestionValidation,        // 🆕 AJOUTER
    
    // Utilitaires
    isFeatureUnlocked: (feature) => isFeatureUnlocked(CalculUpCore.getUser(), feature),
    getFeatureStatus
};
})();