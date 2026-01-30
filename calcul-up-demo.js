/**
 * CALCUL UP - MODE DÉMO
 * Permet de tester l'application sans Firebase
 * Stockage local avec localStorage
 */

window.CalculUpDemo = (function() {
    'use strict';

    // =============================================================================
    // CONFIGURATION
    // =============================================================================

    const DEMO_MODE_KEY = 'calculup_demo_mode';
    const DEMO_USERS_KEY = 'calculup_demo_users';
    const DEMO_CURRENT_USER_KEY = 'calculup_demo_current_user';
    const DEMO_QUESTIONS_KEY = 'calculup_demo_questions';
    const DEMO_FAVORITES_KEY = 'calculup_demo_favorites';
    const DEMO_REPORTS_KEY = 'calculup_demo_reports';

    let isDemoMode = false;
    let currentDemoUser = null;

    // =============================================================================
    // COMPTES DE TEST PRÉDÉFINIS
    // =============================================================================

    const DEFAULT_TEST_ACCOUNTS = {
        'demo_student': {
            id: 'demo-student-001',
            identifier: 'demo_student',
            email: 'student@demo.local',
            password: 'demo123',
            firstname: 'Élève',
            type: 'student',
            schoolLevel: 'premiere',
            level: 5,
            xp: 1250,
            streak: 7,
            status: 'active',
            stats: {
                totalQuestions: 127,
                correctAnswers: 98,
                accuracy: 77.2,
                averageTime: 12.5,
                sessionsThisWeek: 4,
                questionsCreated: 3,
                questionsReported: 1,
                reportsValidated: 0
            },
            preferences: {
                seenNotions: {
                    'Dérivation': true,
                    'Fonctions affines': true,
                    'Suites arithmétiques': true
                }
            },
            createdAt: new Date('2024-09-01'),
            updatedAt: new Date()
        },
        'demo_teacher': {
            id: 'demo-teacher-001',
            identifier: 'demo_teacher',
            email: 'teacher@ac-demo.fr',
            password: 'demo123',
            firstname: 'Professeur',
            type: 'teacher',
            schoolLevel: 'terminale',
            level: 10,
            xp: 4500,
            streak: 15,
            status: 'active', // Enseignant validé
            stats: {
                totalQuestions: 0,
                correctAnswers: 0,
                questionsCreated: 45,
                questionsValidated: 38,
                reportsProcessed: 12
            },
            createdAt: new Date('2024-06-15'),
            updatedAt: new Date()
        },
        'demo_teacher_provisional': {
            id: 'demo-teacher-002',
            identifier: 'demo_teacher_new',
            email: 'newteacher@ac-demo.fr',
            password: 'demo123',
            firstname: 'Nouveau Prof',
            type: 'teacher',
            schoolLevel: 'premiere',
            level: 2,
            xp: 350,
            streak: 2,
            status: 'provisional_access', // Accès provisoire
            stats: {
                questionsCreated: 5,
                questionsValidated: 0
            },
            createdAt: new Date('2025-01-15'),
            updatedAt: new Date()
        },
        'demo_admin': {
            id: 'demo-admin-001',
            identifier: 'demo_admin',
            email: 'admin@calculup.local',
            password: 'admin123',
            firstname: 'Administrateur',
            type: 'admin',
            level: 99,
            xp: 99999,
            status: 'active',
            stats: {
                questionsValidated: 250,
                usersManaged: 45,
                reportsProcessed: 89
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        }
    };

    // =============================================================================
    // INITIALISATION
    // =============================================================================

    function initialize() {
        // Vérifier si le mode démo était activé
        isDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';

        // Charger l'utilisateur courant si existant
        const savedUser = localStorage.getItem(DEMO_CURRENT_USER_KEY);
        if (savedUser) {
            try {
                currentDemoUser = JSON.parse(savedUser);
            } catch (e) {
                currentDemoUser = null;
            }
        }

        // Initialiser les données de démo si nécessaire
        initializeDemoData();

        console.log('🎭 Module Démo initialisé, mode:', isDemoMode ? 'ACTIF' : 'INACTIF');
    }

    function initializeDemoData() {
        // Initialiser les utilisateurs de démo s'ils n'existent pas
        if (!localStorage.getItem(DEMO_USERS_KEY)) {
            localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(DEFAULT_TEST_ACCOUNTS));
        }

        // Initialiser les questions de démo
        if (!localStorage.getItem(DEMO_QUESTIONS_KEY)) {
            const defaultQuestions = CalculUpData.getDefaultQuestions();
            localStorage.setItem(DEMO_QUESTIONS_KEY, JSON.stringify(defaultQuestions));
        }

        // Initialiser les signalements de démo
        if (!localStorage.getItem(DEMO_REPORTS_KEY)) {
            localStorage.setItem(DEMO_REPORTS_KEY, JSON.stringify(getDemoReports()));
        }
    }

    function getDemoReports() {
        return [
            {
                id: 'report-001',
                questionId: 'q-derive-001',
                questionText: 'Quelle est la dérivée de f(x) = x² ?',
                reason: 'error',
                description: 'La bonne réponse devrait être 2x, pas x',
                reporterName: 'demo_student',
                reporterId: 'demo-student-001',
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                id: 'report-002',
                questionId: 'q-proba-003',
                questionText: 'Calculer P(A|B) sachant que...',
                reason: 'unclear',
                description: 'L\'énoncé ne précise pas les valeurs de P(A) et P(B)',
                reporterName: 'demo_student',
                reporterId: 'demo-student-001',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // =============================================================================
    // ACTIVATION / DÉSACTIVATION MODE DÉMO
    // =============================================================================

    function enableDemoMode() {
        isDemoMode = true;
        localStorage.setItem(DEMO_MODE_KEY, 'true');
        console.log('🎭 Mode Démo ACTIVÉ');
        return true;
    }

    function disableDemoMode() {
        isDemoMode = false;
        localStorage.setItem(DEMO_MODE_KEY, 'false');
        currentDemoUser = null;
        localStorage.removeItem(DEMO_CURRENT_USER_KEY);
        console.log('🎭 Mode Démo DÉSACTIVÉ');
        return true;
    }

    function isDemoModeActive() {
        return isDemoMode;
    }

    // =============================================================================
    // AUTHENTIFICATION DÉMO
    // =============================================================================

    function demoLogin(identifier, password) {
        const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');

        // Chercher par identifiant ou email
        let user = users[identifier];

        if (!user) {
            // Chercher par email
            user = Object.values(users).find(u => u.email === identifier);
        }

        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Mot de passe incorrect' };
        }

        // Connexion réussie
        currentDemoUser = { ...user };
        delete currentDemoUser.password; // Ne pas stocker le mot de passe
        localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(currentDemoUser));

        console.log('🎭 Connexion démo réussie:', currentDemoUser.identifier);

        return { success: true, user: currentDemoUser };
    }

    function demoLogout() {
        currentDemoUser = null;
        localStorage.removeItem(DEMO_CURRENT_USER_KEY);
        console.log('🎭 Déconnexion démo');
        return true;
    }

    function demoRegister(userData) {
        const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');

        // Vérifier si l'identifiant existe déjà
        if (users[userData.identifier]) {
            return { success: false, error: 'Cet identifiant est déjà utilisé' };
        }

        // Vérifier si l'email existe déjà
        if (Object.values(users).some(u => u.email === userData.email)) {
            return { success: false, error: 'Cet email est déjà utilisé' };
        }

        // Créer le nouvel utilisateur
        const newUser = {
            id: 'demo-' + Date.now(),
            identifier: userData.identifier,
            email: userData.email,
            password: userData.password,
            firstname: userData.firstname,
            type: userData.type || 'student',
            schoolLevel: userData.schoolLevel || 'premiere',
            level: 1,
            xp: 0,
            streak: 0,
            status: userData.type === 'teacher' ? 'provisional_access' : 'active',
            stats: {
                totalQuestions: 0,
                correctAnswers: 0,
                accuracy: 0,
                questionsCreated: 0
            },
            preferences: { seenNotions: {} },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users[newUser.identifier] = newUser;
        localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

        // Connecter automatiquement
        currentDemoUser = { ...newUser };
        delete currentDemoUser.password;
        localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(currentDemoUser));

        console.log('🎭 Inscription démo réussie:', newUser.identifier);

        return { success: true, user: currentDemoUser };
    }

    function getCurrentDemoUser() {
        return currentDemoUser;
    }

    // =============================================================================
    // GESTION DES DONNÉES DÉMO
    // =============================================================================

    function updateDemoUser(updates) {
        if (!currentDemoUser) return false;

        // Mettre à jour l'utilisateur courant
        Object.assign(currentDemoUser, updates);
        currentDemoUser.updatedAt = new Date().toISOString();
        localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(currentDemoUser));

        // Mettre à jour dans la liste des utilisateurs
        const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');
        if (users[currentDemoUser.identifier]) {
            Object.assign(users[currentDemoUser.identifier], updates);
            users[currentDemoUser.identifier].updatedAt = new Date().toISOString();
            localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
        }

        return true;
    }

    function getDemoQuestions(filters = {}) {
        let questions = JSON.parse(localStorage.getItem(DEMO_QUESTIONS_KEY) || '[]');

        // Appliquer les filtres
        if (filters.level) {
            questions = questions.filter(q => q.level === filters.level);
        }
        if (filters.difficulty) {
            questions = questions.filter(q => q.difficulty === filters.difficulty);
        }
        if (filters.chapter) {
            questions = questions.filter(q => q.chapter === filters.chapter);
        }
        if (filters.verified !== undefined) {
            questions = questions.filter(q => q.verified === filters.verified);
        }

        return questions;
    }

    function addDemoQuestion(question) {
        const questions = JSON.parse(localStorage.getItem(DEMO_QUESTIONS_KEY) || '[]');

        const newQuestion = {
            ...question,
            id: question.id || 'q-' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        questions.push(newQuestion);
        localStorage.setItem(DEMO_QUESTIONS_KEY, JSON.stringify(questions));

        return newQuestion;
    }

    function getDemoReportsData() {
        return JSON.parse(localStorage.getItem(DEMO_REPORTS_KEY) || '[]');
    }

    function updateDemoReport(reportId, updates) {
        const reports = JSON.parse(localStorage.getItem(DEMO_REPORTS_KEY) || '[]');
        const index = reports.findIndex(r => r.id === reportId);

        if (index !== -1) {
            reports[index] = { ...reports[index], ...updates };
            localStorage.setItem(DEMO_REPORTS_KEY, JSON.stringify(reports));
            return true;
        }
        return false;
    }

    function getDemoFavorites(userId) {
        const allFavorites = JSON.parse(localStorage.getItem(DEMO_FAVORITES_KEY) || '{}');
        return allFavorites[userId] || [];
    }

    function setDemoFavorites(userId, favorites) {
        const allFavorites = JSON.parse(localStorage.getItem(DEMO_FAVORITES_KEY) || '{}');
        allFavorites[userId] = favorites;
        localStorage.setItem(DEMO_FAVORITES_KEY, JSON.stringify(allFavorites));
    }

    // =============================================================================
    // STATISTIQUES DE JEU DÉMO
    // =============================================================================

    function updateDemoGameStats(results) {
        if (!currentDemoUser) return false;

        const stats = currentDemoUser.stats || {};

        stats.totalQuestions = (stats.totalQuestions || 0) + results.totalQuestions;
        stats.correctAnswers = (stats.correctAnswers || 0) + results.correctAnswers;
        stats.accuracy = stats.totalQuestions > 0
            ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
            : 0;
        stats.sessionsThisWeek = (stats.sessionsThisWeek || 0) + 1;

        // Calculer XP gagné
        const xpGained = results.correctAnswers * 15 + (results.perfectScore ? 50 : 0);

        const updates = {
            stats,
            xp: (currentDemoUser.xp || 0) + xpGained,
            streak: (currentDemoUser.streak || 0) + 1
        };

        // Vérifier le passage de niveau
        const newLevel = Math.floor(updates.xp / 500) + 1;
        if (newLevel > (currentDemoUser.level || 1)) {
            updates.level = newLevel;
        }

        return updateDemoUser(updates);
    }

    // =============================================================================
    // ÉCRAN DE SÉLECTION MODE DÉMO
    // =============================================================================

    function showDemoLoginScreen() {
        enableDemoMode();

        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-violet-100 via-sky-100 to-emerald-100 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                    <div class="text-center mb-8">
                        <div class="text-6xl mb-4">🎭</div>
                        <h1 class="text-3xl font-bold text-stone-700 mb-2">Mode Démonstration</h1>
                        <p class="text-stone-500">Testez l'application sans connexion Firebase</p>
                    </div>

                    <div class="space-y-4 mb-6">
                        <h3 class="font-semibold text-stone-700">Comptes de test disponibles :</h3>

                        <button onclick="CalculUpDemo.quickLogin('demo_student')"
                                class="w-full p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors text-left">
                            <div class="flex items-center">
                                <span class="text-3xl mr-4">🎓</span>
                                <div>
                                    <h4 class="font-semibold text-emerald-700">Élève (Niveau 5)</h4>
                                    <p class="text-sm text-emerald-600">demo_student / demo123</p>
                                    <p class="text-xs text-stone-500">Première • 1250 XP • 127 questions</p>
                                </div>
                            </div>
                        </button>

                        <button onclick="CalculUpDemo.quickLogin('demo_teacher')"
                                class="w-full p-4 bg-sky-50 border-2 border-sky-200 rounded-xl hover:bg-sky-100 transition-colors text-left">
                            <div class="flex items-center">
                                <span class="text-3xl mr-4">👨‍🏫</span>
                                <div>
                                    <h4 class="font-semibold text-sky-700">Enseignant validé</h4>
                                    <p class="text-sm text-sky-600">demo_teacher / demo123</p>
                                    <p class="text-xs text-stone-500">45 questions créées • Accès complet</p>
                                </div>
                            </div>
                        </button>

                        <button onclick="CalculUpDemo.quickLogin('demo_teacher_provisional')"
                                class="w-full p-4 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left">
                            <div class="flex items-center">
                                <span class="text-3xl mr-4">👩‍🏫</span>
                                <div>
                                    <h4 class="font-semibold text-amber-700">Enseignant (accès provisoire)</h4>
                                    <p class="text-sm text-amber-600">demo_teacher_new / demo123</p>
                                    <p class="text-xs text-stone-500">En attente de validation</p>
                                </div>
                            </div>
                        </button>

                        <button onclick="CalculUpDemo.quickLogin('demo_admin')"
                                class="w-full p-4 bg-violet-50 border-2 border-violet-200 rounded-xl hover:bg-violet-100 transition-colors text-left">
                            <div class="flex items-center">
                                <span class="text-3xl mr-4">👨‍💼</span>
                                <div>
                                    <h4 class="font-semibold text-violet-700">Administrateur</h4>
                                    <p class="text-sm text-violet-600">demo_admin / admin123</p>
                                    <p class="text-xs text-stone-500">Accès total à l'application</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div class="border-t border-stone-200 pt-6">
                        <button onclick="CalculUpDemo.showDemoRegisterForm()"
                                class="w-full bg-stone-100 text-stone-700 p-3 rounded-lg hover:bg-stone-200 transition-colors mb-3">
                            + Créer un nouveau compte de test
                        </button>

                        <button onclick="CalculUpDemo.exitDemoMode()"
                                class="w-full text-stone-500 text-sm hover:text-stone-700">
                            ← Retour à la connexion normale
                        </button>
                    </div>

                    <div class="mt-6 p-4 bg-violet-50 rounded-lg">
                        <p class="text-sm text-violet-700">
                            <strong>Note :</strong> Toutes les données sont stockées localement dans votre navigateur.
                            Elles persistent entre les sessions mais ne sont pas synchronisées.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    function quickLogin(accountKey) {
        console.log('🎭 quickLogin appelé avec:', accountKey);

        const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');
        console.log('🎭 Utilisateurs disponibles:', Object.keys(users));

        const user = users[accountKey];

        if (!user) {
            console.error('❌ Compte non trouvé:', accountKey);
            CalculUpCore.showError('Compte de test non trouvé');
            return;
        }

        console.log('🎭 Utilisateur trouvé:', user.identifier, 'Type:', user.type);

        const result = demoLogin(accountKey, user.password);
        console.log('🎭 Résultat login:', result);

        if (result.success) {
            CalculUpCore.showSuccess(`Connecté en tant que ${result.user.firstname}`);

            // Naviguer vers le bon écran selon le type
            console.log('🎭 Navigation vers:', result.user.type === 'admin' ? 'admin-dashboard' :
                       result.user.type === 'teacher' ? 'teacher-dashboard' : 'home');

            setTimeout(() => {
                try {
                    if (result.user.type === 'admin') {
                        CalculUpCore.navigateToScreen('admin-dashboard');
                    } else if (result.user.type === 'teacher') {
                        CalculUpCore.navigateToScreen('teacher-dashboard');
                    } else {
                        CalculUpCore.navigateToScreen('home');
                    }
                } catch (error) {
                    console.error('❌ Erreur navigation:', error);
                    CalculUpCore.showError('Erreur de navigation: ' + error.message);
                }
            }, 500);
        } else {
            console.error('❌ Erreur login:', result.error);
            CalculUpCore.showError(result.error);
        }
    }

    function showDemoRegisterForm() {
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-violet-100 via-sky-100 to-emerald-100 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                    <div class="text-center mb-6">
                        <div class="text-4xl mb-2">🆕</div>
                        <h2 class="text-2xl font-bold text-stone-700">Créer un compte test</h2>
                    </div>

                    <form id="demo-register-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-stone-700 mb-2">Prénom</label>
                            <input type="text" id="demo-firstname" class="form-input" placeholder="Votre prénom" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-stone-700 mb-2">Identifiant</label>
                            <input type="text" id="demo-identifier" class="form-input" placeholder="mon_identifiant" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-stone-700 mb-2">Email</label>
                            <input type="email" id="demo-email" class="form-input" placeholder="email@exemple.com" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-stone-700 mb-2">Mot de passe</label>
                            <input type="password" id="demo-password" class="form-input" placeholder="••••••" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-stone-700 mb-2">Type de compte</label>
                            <select id="demo-type" class="form-select">
                                <option value="student">Élève</option>
                                <option value="teacher">Enseignant</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-stone-700 mb-2">Niveau scolaire</label>
                            <select id="demo-level" class="form-select">
                                <option value="seconde">Seconde</option>
                                <option value="premiere" selected>Première</option>
                                <option value="terminale">Terminale</option>
                            </select>
                        </div>

                        <button type="submit" class="w-full btn-primary">
                            Créer le compte
                        </button>
                    </form>

                    <button onclick="CalculUpDemo.showDemoLoginScreen()"
                            class="w-full mt-4 text-stone-500 text-sm hover:text-stone-700">
                        ← Retour aux comptes de test
                    </button>
                </div>
            </div>
        `;

        document.getElementById('demo-register-form').addEventListener('submit', function(e) {
            e.preventDefault();

            const userData = {
                firstname: document.getElementById('demo-firstname').value,
                identifier: document.getElementById('demo-identifier').value,
                email: document.getElementById('demo-email').value,
                password: document.getElementById('demo-password').value,
                type: document.getElementById('demo-type').value,
                schoolLevel: document.getElementById('demo-level').value
            };

            const result = demoRegister(userData);

            if (result.success) {
                CalculUpCore.showSuccess('Compte créé avec succès !');
                setTimeout(() => {
                    if (result.user.type === 'teacher') {
                        CalculUpCore.navigateToScreen('teacher-dashboard');
                    } else {
                        CalculUpCore.navigateToScreen('home');
                    }
                }, 500);
            } else {
                CalculUpCore.showError(result.error);
            }
        });
    }

    function exitDemoMode() {
        disableDemoMode();
        CalculUpCore.navigateToScreen('login');
    }

    // =============================================================================
    // RESET DES DONNÉES DÉMO
    // =============================================================================

    function resetAllDemoData() {
        if (!confirm('Réinitialiser toutes les données de démonstration ?')) return;

        localStorage.removeItem(DEMO_USERS_KEY);
        localStorage.removeItem(DEMO_CURRENT_USER_KEY);
        localStorage.removeItem(DEMO_QUESTIONS_KEY);
        localStorage.removeItem(DEMO_FAVORITES_KEY);
        localStorage.removeItem(DEMO_REPORTS_KEY);

        currentDemoUser = null;
        initializeDemoData();

        CalculUpCore.showSuccess('Données de démonstration réinitialisées');
        showDemoLoginScreen();
    }

    // =============================================================================
    // API PUBLIQUE
    // =============================================================================

    // Initialiser au chargement
    initialize();

    return {
        // Mode
        enableDemoMode,
        disableDemoMode,
        isDemoModeActive,
        exitDemoMode,

        // Auth
        demoLogin,
        demoLogout,
        demoRegister,
        getCurrentDemoUser,
        quickLogin,

        // Écrans
        showDemoLoginScreen,
        showDemoRegisterForm,

        // Données
        updateDemoUser,
        getDemoQuestions,
        addDemoQuestion,
        getDemoReportsData,
        updateDemoReport,
        getDemoFavorites,
        setDemoFavorites,

        // Stats
        updateDemoGameStats,

        // Reset
        resetAllDemoData
    };
})();
