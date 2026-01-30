/**
 * CALCUL UP - MODULE UTILISATEURS
 * Dashboards, profils et statistiques
 */

window.CalculUpUser = (function() {
    'use strict';

    // =============================================================================
    // DASHBOARD ÉLÈVE - ÉCRAN PRINCIPAL
    // =============================================================================
    
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
                                                <span class="bg-violet-200 text-violet-800 px-2 py-1 rounded-full">+25 XP</span>
                                                <span class="bg-amber-200 text-amber-800 px-2 py-1 rounded-full">Contribution</span>
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
        if (!user || user.type !== 'student') {
            CalculUpCore.navigateToScreen('login');
            return;
        }
        
        console.log('📊 Affichage statistiques détaillées');
        
        // Calculs de stats
        const accuracy = user.stats?.totalQuestions > 0 ? 
            Math.round((user.stats.correctAnswers / user.stats.totalQuestions) * 100) : 0;
        
        const averageTime = user.stats?.averageTime || 0;
        const questionsPerSession = user.stats?.totalQuestions > 0 && user.stats?.sessionsThisWeek > 0 ?
            Math.round(user.stats.totalQuestions / user.stats.sessionsThisWeek) : 0;
            
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                    <div class="flex items-center">
                        <button onclick="CalculUpCore.navigateToScreen('home')" 
                                class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                            <span class="text-xl">←</span>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-stone-700">Mes Statistiques</h1>
                            <p class="text-stone-500">Analyse de tes performances</p>
                        </div>
                    </div>
                </div>
                
                <div class="max-w-4xl mx-auto p-6 space-y-6">
                    <!-- Vue d'ensemble -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-6 text-stone-700">Vue d'ensemble</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="stat-card emerald">
                                <div class="text-3xl font-bold">${user.stats?.totalQuestions || 0}</div>
                                <div class="text-sm">Questions totales</div>
                            </div>
                            <div class="stat-card sky">
                                <div class="text-3xl font-bold">${accuracy}%</div>
                                <div class="text-sm">Précision moyenne</div>
                            </div>
                            <div class="stat-card amber">
                                <div class="text-3xl font-bold">${Math.round(averageTime)}s</div>
                                <div class="text-sm">Temps moyen</div>
                            </div>
                            <div class="stat-card violet">
                                <div class="text-3xl font-bold">${user.stats?.sessionsThisWeek || 0}</div>
                                <div class="text-sm">Sessions / semaine</div>
                            </div>
                        </div>
                    </div>

                    <!-- Contributions -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-6 text-stone-700">Contributions</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="stat-card violet">
                                <div class="text-2xl font-bold">${user.stats?.questionsCreated || 0}</div>
                                <div class="text-sm">Questions créées</div>
                            </div>
                            <div class="stat-card amber">
                                <div class="text-2xl font-bold">${user.stats?.questionsReported || 0}</div>
                                <div class="text-sm">Signalements</div>
                            </div>
                            <div class="stat-card emerald">
                                <div class="text-2xl font-bold">${user.stats?.reportsValidated || 0}</div>
                                <div class="text-sm">Signalements validés</div>
                            </div>
                        </div>
                    </div>

                    <!-- Progression par chapitre (simulée) -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-6 text-stone-700">Progression par chapitre</h3>
                        <div class="space-y-4">
                            ${generateChapterProgressHTML(user)}
                        </div>
                    </div>

                    <!-- Points forts / faibles -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="dashboard-card slide-in">
                            <h3 class="text-xl font-semibold mb-4 text-stone-700 flex items-center">
                                <span class="mr-2">💪</span>
                                Points forts
                            </h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <span class="text-stone-700">Dérivation</span>
                                    <span class="text-emerald-600 font-semibold">92%</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <span class="text-stone-700">Suites arithmétiques</span>
                                    <span class="text-emerald-600 font-semibold">88%</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <span class="text-stone-700">Fonctions affines</span>
                                    <span class="text-emerald-600 font-semibold">86%</span>
                                </div>
                            </div>
                        </div>

                        <div class="dashboard-card slide-in">
                            <h3 class="text-xl font-semibold mb-4 text-stone-700 flex items-center">
                                <span class="mr-2">🎯</span>
                                À améliorer
                            </h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                                    <span class="text-stone-700">Probabilités conditionnelles</span>
                                    <span class="text-rose-600 font-semibold">62%</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                                    <span class="text-stone-700">Produit scalaire</span>
                                    <span class="text-rose-600 font-semibold">68%</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                    <span class="text-stone-700">Trigonométrie</span>
                                    <span class="text-amber-600 font-semibold">74%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Conseils personnalisés -->
                    <div class="dashboard-card slide-in bg-gradient-to-r from-emerald-50 to-sky-50 border-emerald-200">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700 flex items-center">
                            <span class="mr-2">💡</span>
                            Conseils personnalisés
                        </h3>
                        <div class="space-y-3">
                            <div class="flex items-start">
                                <span class="text-emerald-500 mr-3 mt-1">✓</span>
                                <div>
                                    <p class="text-stone-700 font-medium">Excellent travail en dérivation !</p>
                                    <p class="text-stone-600 text-sm">Continue sur cette lancée, tu maîtrises parfaitement les bases.</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <span class="text-amber-500 mr-3 mt-1">⚠</span>
                                <div>
                                    <p class="text-stone-700 font-medium">Révise les probabilités conditionnelles</p>
                                    <p class="text-stone-600 text-sm">Concentre-toi sur ce chapitre pour améliorer ta moyenne générale.</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <span class="text-sky-500 mr-3 mt-1">💪</span>
                                <div>
                                    <p class="text-stone-700 font-medium">Objectif : 5 questions par jour</p>
                                    <p class="text-stone-600 text-sm">Maintiens ton rythme de ${user.stats?.sessionsThisWeek || 0} sessions par semaine !</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-4">
                        <button onclick="CalculUpCore.navigateToScreen('game-setup')" 
                                class="flex-1 btn-primary">
                            🎯 S'entraîner maintenant
                        </button>
                        <button onclick="CalculUpCore.navigateToScreen('profile')" 
                                class="flex-1 btn-secondary">
                            👤 Modifier mon profil
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // =============================================================================
    // DASHBOARD ENSEIGNANT
    // =============================================================================
    
    function showTeacherDashboard() {
    console.log('🎓 Affichage dashboard enseignant');
    
    const user = CalculUpCore.getUser();
    const isProvisionalAccess = user.status === 'provisional_access';
    
    // Bannière d'avertissement pour accès provisoire
    const provisionalBanner = isProvisionalAccess ? `
        <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-amber-800">
                        Compte en attente de validation complète
                    </h3>
                    <div class="mt-2 text-sm text-amber-700">
                        <p>Votre compte dispose d'un accès provisoire. Un administrateur doit valider votre compte pour débloquer toutes les fonctionnalités enseignant.</p>
                    </div>
                </div>
            </div>
        </div>
    ` : '';
    
    // Remplacer les avantages par les limitations
    const accountStatus = isProvisionalAccess ? `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-stone-800 mb-4">⚠️ Limitations du compte provisoire</h2>
            <div class="space-y-3">
                <div class="flex items-start space-x-3">
                    <span class="text-red-500">❌</span>
                    <span class="text-stone-700">Vos questions ne sont <strong>pas automatiquement validées</strong> - elles nécessitent une validation admin</span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-red-500">❌</span>
                    <span class="text-stone-700">Pas d'accès aux <strong>réponses</strong> de la base de questions (questions visibles sans réponses)</span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-red-500">❌</span>
                    <span class="text-stone-700">Impossible de créer des <strong>classes d'élèves</strong> ou d'ajouter des utilisateurs</span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-red-500">❌</span>
                    <span class="text-stone-700">Pas de <strong>personnalisation enseignant</strong> pour les tournois (mêmes options qu'un élève)</span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-amber-500">⚠️</span>
                    <span class="text-stone-700">XP standard : <strong>15 XP par question</strong> (au lieu de 25 XP)</span>
                </div>
            </div>
            
            <div class="mt-6 p-4 bg-emerald-50 rounded-lg">
                <p class="text-sm text-emerald-700">
                    <strong>✅ Ce que vous pouvez faire :</strong> Créer des questions, consulter les questions existantes (sans réponses), 
                    les mettre en favoris, participer aux tournois standards.
                </p>
            </div>
            
            <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-700">
                    <strong>🚀 Après validation complète :</strong> Validation automatique des questions, +25 XP par question, 
                    accès aux réponses, gestion de classes, tournois personnalisés.
                </p>
            </div>
        </div>
    ` : `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-stone-800 mb-4">✅ Avantages compte enseignant validé</h2>
            <div class="space-y-3">
                <div class="flex items-start space-x-3">
                    <span class="text-green-500">✅</span>
                    <span class="text-stone-700">Vos questions sont <strong>automatiquement vérifiées et publiées</strong></span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-green-500">✅</span>
                    <span class="text-stone-700"><strong>+25 XP par question créée</strong> (au lieu de 15)</span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-green-500">✅</span>
                    <span class="text-stone-700">Accès prioritaire aux <strong>nouvelles fonctionnalités</strong></span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-green-500">✅</span>
                    <span class="text-stone-700"><strong>Gestion de classes</strong> et suivi d'élèves</span>
                </div>
                <div class="flex items-start space-x-3">
                    <span class="text-green-500">✅</span>
                    <span class="text-stone-700">Accès complet aux <strong>réponses</strong> des questions</span>
                </div>
            </div>
        </div>
    `;
    
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4">
            ${provisionalBanner}
            
            <div class="max-w-6xl mx-auto">
                <!-- Header existant... -->
                
                <!-- Grille principale -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Colonne gauche -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Vos stats existantes... -->
                    </div>
                    
                    <!-- Colonne droite -->
                    <div class="space-y-6">
                        ${accountStatus}
                        <!-- Autres éléments existants... -->
                    </div>
                </div>
            </div>
        </div>
    `;
}
    // =============================================================================
    // FONCTIONS UTILITAIRES
    // =============================================================================
    
    function isFeatureUnlocked(user, feature) {
        if (!user || user.type !== 'student') return false;
        
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
        
        Object.entries(features).forEach(([feature, level]) => {
            if (!isFeatureUnlocked(user, feature)) {
                lockedFeatures.push({ feature, level });
            }
        });

        if (lockedFeatures.length === 0) {
            return '<div class="alert success">🎉 Toutes les fonctionnalités sont débloquées !</div>';
        }

        return `
            <div class="space-y-4">
                <h4 class="text-lg font-semibold text-stone-700">🔒 À débloquer</h4>
                
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
                    ${lockedFeatures.map(({feature, level}) => {
                        const icons = {
                            addFriends: '👥',
                            multiplayer: '⚔️',
                            joinTournaments: '🏆',
                            createTournaments: '🎮',
                            becomeAdmin: '👨‍💼'
                        };
                        const names = {
                            addFriends: 'Ajouter des amis',
                            multiplayer: 'Mode multijoueur',
                            joinTournaments: 'Participer aux tournois',
                            createTournaments: 'Créer des tournois',
                            becomeAdmin: 'Devenir administrateur'
                        };
                        
                        if (feature === 'createQuestions') return '';
                        
                        return `
                            <div class="dashboard-card opacity-75">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <span class="text-2xl mr-3">${icons[feature] || '🔒'}</span>
                                        <div>
                                            <h4 class="font-semibold text-stone-700">${names[feature] || feature}</h4>
                                            <p class="text-sm text-stone-600">${getFeatureStatus(feature).message}</p>
                                        </div>
                                    </div>
                                    <span class="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-sm">Niv. ${level}</span>
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
        
        // CORRECTION : Utiliser les vraies statistiques utilisateur au lieu de Math.random()
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
                // Rafraîchir l'affichage
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

    // =============================================================================
    // API PUBLIQUE DU MODULE
    // =============================================================================
    
    return {
        // Écrans
        showHomeScreen,
        showProfileScreen,
        showStatsScreen,
        showTeacherDashboard,
        
        // Actions
        updateSchoolLevel,
        toggleNotionSeen,
        toggleChapterNotions,
        
        // Utilitaires
        isFeatureUnlocked: (feature) => isFeatureUnlocked(CalculUpCore.getUser(), feature),
        getFeatureStatus
    };
})();