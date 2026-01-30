/**
 * CALCUL UP - MODULE ADMINISTRATEUR
 * Interface de gestion et modération
 */

window.CalculUpAdmin = (function() {
    'use strict';

    // =============================================================================
    // ÉTAT LOCAL DU MODULE
    // =============================================================================
    
    let adminData = {
        pendingQuestions: [],
        pendingTeachers: [],
        reports: [],
        stats: {
            totalUsers: 0,
            totalQuestions: 0,
            totalReports: 0,
            activeUsers: 0
        }
    };

    // =============================================================================
    // DASHBOARD ADMINISTRATEUR PRINCIPAL
    // =============================================================================
    
    function showAdminDashboard() {
        const user = CalculUpCore.getUser();
        if (!user || user.type !== 'admin') {
            CalculUpCore.showError('Accès non autorisé');
            CalculUpCore.navigateToScreen('login');
            return;
        }
        
        console.log('👨‍💼 Affichage dashboard administrateur');
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
                <!-- Header Admin -->
                <div class="bg-white/90 border-b border-stone-200 p-6 sticky top-0 z-10">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-2xl font-bold text-stone-700 flex items-center">
                                <span class="mr-3">👨‍💼</span>
                                Calcul Up - Administration
                            </h1>
                            <p class="text-stone-500">Panneau de contrôle et modération</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="text-sm text-stone-600">
                                Admin: @${user.identifier}
                            </div>
                            <button onclick="CalculUpAdmin.refreshDashboard()" 
                                    class="bg-sky-100 border border-sky-200 text-sky-700 px-3 py-2 rounded-lg hover:bg-sky-200 transition-colors">
                                🔄 Actualiser
                            </button>
                            <button onclick="CalculUpAuth.handleLogout()" 
                                    class="bg-rose-100 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-200 transition-colors">
                                🚪 Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto p-6 space-y-6">
                    <!-- Statistiques globales -->
                    <div class="dashboard-card slide-in">
                        <h2 class="text-xl font-semibold mb-4 text-stone-700 flex items-center">
                            <span class="mr-2">📊</span>
                            Vue d'ensemble
                        </h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="stat-card emerald">
                                <div class="text-2xl font-bold" id="total-users">-</div>
                                <div class="text-sm">Utilisateurs totaux</div>
                            </div>
                            <div class="stat-card sky">
                                <div class="text-2xl font-bold" id="total-questions">-</div>
                                <div class="text-sm">Questions vérifiées</div>
                            </div>
                            <div class="stat-card amber">
                                <div class="text-2xl font-bold" id="pending-items">-</div>
                                <div class="text-sm">En attente</div>
                            </div>
                            <div class="stat-card violet">
                                <div class="text-2xl font-bold" id="active-users">-</div>
                                <div class="text-sm">Actifs cette semaine</div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions prioritaires -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Validation des questions -->
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-3 text-stone-700 flex items-center">
                                <span class="mr-2">📝</span>
                                Questions à valider
                            </h3>
                            <div id="pending-questions-list" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                <div class="text-center text-stone-500 py-4">
                                    <div class="loading-spin mx-auto mb-2"></div>
                                    Chargement...
                                </div>
                            </div>
                            <button onclick="CalculUpAdmin.showQuestionValidation()" 
                                    class="w-full bg-violet-100 border border-violet-200 text-violet-700 p-3 rounded-lg hover:bg-violet-200 transition-colors">
                                📋 Voir toutes les questions
                            </button>
                        </div>

                        <!-- Validation des enseignants -->
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-3 text-stone-700 flex items-center">
                                <span class="mr-2">🎓</span>
                                Enseignants à vérifier
                            </h3>
                            <div id="pending-teachers-list" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                <div class="text-center text-stone-500 py-4">
                                    <div class="loading-spin mx-auto mb-2"></div>
                                    Chargement...
                                </div>
                            </div>
                            <button onclick="CalculUpAdmin.showTeacherValidation()" 
                                    class="w-full bg-emerald-100 border border-emerald-200 text-emerald-700 p-3 rounded-lg hover:bg-emerald-200 transition-colors">
                                👥 Voir tous les comptes
                            </button>
                        </div>

                        <!-- Signalements -->
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-3 text-stone-700 flex items-center">
                                <span class="mr-2">🚩</span>
                                Signalements
                            </h3>
                            <div id="reports-list" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                <div class="text-center text-stone-500 py-4">
                                    <div class="loading-spin mx-auto mb-2"></div>
                                    Chargement...
                                </div>
                            </div>
                            <button onclick="CalculUpAdmin.showReportsManagement()" 
                                    class="w-full bg-rose-100 border border-rose-200 text-rose-700 p-3 rounded-lg hover:bg-rose-200 transition-colors">
                                🔍 Traiter les signalements
                            </button>
                        </div>
                    </div>

                    <!-- Outils d'administration -->
                    <div class="dashboard-card slide-in">
                        <h2 class="text-xl font-semibold mb-4 text-stone-700 flex items-center">
                            <span class="mr-2">🔧</span>
                            Outils d'administration
                        </h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button onclick="CalculUpAdmin.showUserManagement()" 
                                    class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                                <div class="text-3xl mb-2">👥</div>
                                <div class="font-semibold text-stone-700">Gestion utilisateurs</div>
                                <div class="text-sm text-stone-500">Comptes, suspensions</div>
                            </button>
                            
                            <button onclick="CalculUpAdmin.showQuestionManagement()" 
                                    class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                                <div class="text-3xl mb-2">📚</div>
                                <div class="font-semibold text-stone-700">Base de questions</div>
                                <div class="text-sm text-stone-500">Édition, suppression</div>
                            </button>
                            
                            <button onclick="CalculUpAdmin.showStatistics()" 
                                    class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                                <div class="text-3xl mb-2">📊</div>
                                <div class="font-semibold text-stone-700">Statistiques</div>
                                <div class="text-sm text-stone-500">Analytics détaillés</div>
                            </button>
                            
                            <button onclick="CalculUpAdmin.showSystemSettings()" 
                                    class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                                <div class="text-3xl mb-2">⚙️</div>
                                <div class="font-semibold text-stone-700">Paramètres</div>
                                <div class="text-sm text-stone-500">Configuration système</div>
                            </button>
                        </div>
                    </div>

                    <!-- Logs d'activité récente -->
                    <div class="dashboard-card slide-in">
                        <h2 class="text-xl font-semibold mb-4 text-stone-700 flex items-center">
                            <span class="mr-2">📋</span>
                            Activité récente
                        </h2>
                        <div id="activity-logs" class="space-y-2 max-h-60 overflow-y-auto">
                            <div class="text-center text-stone-500 py-4">
                                <div class="loading-spin mx-auto mb-2"></div>
                                Chargement des logs...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Charger les données initiales
        setTimeout(() => {
            loadAdminData();
        }, 100);
// Dans calcul-up-admin.js, ajouter à la fonction showAdminDashboard
    // Ajouter ce bouton dans l'interface admin
    const validationButton = `
        <button 
            onclick="CalculUpAdmin.showTeacherValidationPanel()"
            class="flex items-center space-x-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
        >
            <div class="p-2 bg-amber-100 rounded-lg">
                <svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div>
                <h3 class="font-semibold text-stone-800">Validation Enseignants</h3>
                <p class="text-stone-600 text-sm">Valider les comptes enseignants</p>
            </div>
        </button>
    `;
    
    // Insérer ce bouton dans la grille des actions admin
    }

	const adminEmails = [
    	'admin@calculup.fr',
    	'contact@calculup.fr',
    	'contact.calculup@gmail.com' 
	];

    // =============================================================================
    // CHARGEMENT DES DONNÉES ADMIN
    // =============================================================================
    
    async function loadAdminData() {
        try {
            console.log('📊 Chargement données administrateur...');
            
            const db = CalculUpCore.getDb();
            
            // Charger questions en attente
            await loadPendingQuestions();
            
            // Charger enseignants en attente  
            await loadPendingTeachers();
            
            // Charger signalements
            await loadPendingReports();
            
            // Charger statistiques
            await loadSystemStats();
            
            // Charger logs d'activité
            await loadActivityLogs();
            
            console.log('✅ Données admin chargées');
            
        } catch (error) {
            console.error('❌ Erreur chargement données admin:', error);
            CalculUpCore.showError('Erreur de chargement des données administrateur');
        }
    }

    async function loadPendingQuestions() {
        try {
            const db = CalculUpCore.getDb();
            const snapshot = await db.collection('questions')
                .where('pending', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            
            adminData.pendingQuestions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            updatePendingQuestionsList();
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement questions en attente:', error);
            // Mode simulation pour le développement
            adminData.pendingQuestions = [
                {
                    id: 'pending_1',
                    question: 'Calculer la dérivée de f(x) = x² + 3x',
                    creatorIdentifier: 'Marie1234',
                    chapter: 'Dérivation',
                    createdAt: { toDate: () => new Date() }
                },
                {
                    id: 'pending_2', 
                    question: 'Résoudre l\'équation 2x + 5 = 13',
                    creatorIdentifier: 'Paul5678',
                    chapter: 'Équations',
                    createdAt: { toDate: () => new Date() }
                }
            ];
            updatePendingQuestionsList();
        }
    }

    async function loadPendingTeachers() {
        try {
            const db = CalculUpCore.getDb();
            const snapshot = await db.collection('users')
                .where('type', '==', 'teacher')
                .where('status', '==', 'pending_verification')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            
            adminData.pendingTeachers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            updatePendingTeachersList();
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement enseignants en attente:', error);
            // Mode simulation
            adminData.pendingTeachers = [
                {
                    id: 'teacher_1',
                    identifier: 'Dupont2023',
                    email: 'j.dupont@ac-lyon.fr',
                    firstname: 'Jean',
                    createdAt: { toDate: () => new Date() }
                }
            ];
            updatePendingTeachersList();
        }
    }

    async function loadPendingReports() {
        try {
            const db = CalculUpCore.getDb();
            const snapshot = await db.collection('reports')
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            
            adminData.reports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            updateReportsList();
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement signalements:', error);
            // Mode simulation
            adminData.reports = [
                {
                    id: 'report_1',
                    reason: 'Erreur dans l\'énoncé',
                    userIdentifier: 'Alice9876',
                    questionId: 'q_123',
                    createdAt: { toDate: () => new Date() }
                }
            ];
            updateReportsList();
        }
    }

    async function loadSystemStats() {
        try {
            const db = CalculUpCore.getDb();
            
            // Compter les utilisateurs
            const usersSnapshot = await db.collection('users').get();
            adminData.stats.totalUsers = usersSnapshot.size;
            
            // Compter les questions vérifiées
            const questionsSnapshot = await db.collection('questions')
                .where('verified', '==', true).get();
            adminData.stats.totalQuestions = questionsSnapshot.size;
            
            // Compter les éléments en attente
            const pendingCount = adminData.pendingQuestions.length + 
                                adminData.pendingTeachers.length + 
                                adminData.reports.length;
            adminData.stats.totalReports = pendingCount;
            
            // Simulation utilisateurs actifs
            adminData.stats.activeUsers = Math.floor(adminData.stats.totalUsers * 0.3);
            
            updateStatsDisplay();
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement stats:', error);
            // Valeurs par défaut
            adminData.stats = {
                totalUsers: 150,
                totalQuestions: 89,
                totalReports: 3,
                activeUsers: 45
            };
            updateStatsDisplay();
        }
    }

    async function loadActivityLogs() {
        try {
            // Simulation de logs d'activité
            const logs = [
                {
                    timestamp: new Date(),
                    action: 'Question validée',
                    details: 'Question "Dérivée de x²" par Marie1234',
                    type: 'validation'
                },
                {
                    timestamp: new Date(Date.now() - 300000),
                    action: 'Compte enseignant approuvé',
                    details: 'jean.martin@ac-paris.fr',
                    type: 'approval'
                },
                {
                    timestamp: new Date(Date.now() - 600000),
                    action: 'Signalement traité',
                    details: 'Question Q123 - Erreur corrigée',
                    type: 'report'
                },
                {
                    timestamp: new Date(Date.now() - 900000),
                    action: 'Utilisateur suspendu',
                    details: 'Utilisateur BadUser123 - Signalements abusifs',
                    type: 'suspension'
                }
            ];
            
            updateActivityLogs(logs);
            
        } catch (error) {
            console.error('❌ Erreur chargement logs:', error);
        }
    }

    // =============================================================================
    // MISE À JOUR DE L'INTERFACE
    // =============================================================================
    
    function updatePendingQuestionsList() {
        const container = document.getElementById('pending-questions-list');
        if (!container) return;
        
        if (adminData.pendingQuestions.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-4">
                    <div class="text-2xl mb-1">✅</div>
                    <div class="text-sm">Aucune question en attente</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = adminData.pendingQuestions.map(question => `
            <div class="flex items-center justify-between p-2 bg-stone-50 rounded-lg text-sm">
                <div class="flex-1">
                    <div class="font-medium text-stone-700">${question.chapter}</div>
                    <div class="text-stone-500 truncate">Par @${question.creatorIdentifier}</div>
                </div>
                <button onclick="CalculUpAdmin.reviewQuestion('${question.id}')" 
                        class="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs hover:bg-violet-200">
                    Voir
                </button>
            </div>
        `).join('');
    }

    function updatePendingTeachersList() {
        const container = document.getElementById('pending-teachers-list');
        if (!container) return;
        
        if (adminData.pendingTeachers.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-4">
                    <div class="text-2xl mb-1">✅</div>
                    <div class="text-sm">Aucun enseignant en attente</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = adminData.pendingTeachers.map(teacher => `
            <div class="flex items-center justify-between p-2 bg-stone-50 rounded-lg text-sm">
                <div class="flex-1">
                    <div class="font-medium text-stone-700">@${teacher.identifier}</div>
                    <div class="text-stone-500 truncate">${teacher.email}</div>
                </div>
                <button onclick="CalculUpAdmin.reviewTeacher('${teacher.id}')" 
                        class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs hover:bg-emerald-200">
                    Voir
                </button>
            </div>
        `).join('');
    }

    function updateReportsList() {
        const container = document.getElementById('reports-list');
        if (!container) return;
        
        if (adminData.reports.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-4">
                    <div class="text-2xl mb-1">✅</div>
                    <div class="text-sm">Aucun signalement</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = adminData.reports.map(report => `
            <div class="flex items-center justify-between p-2 bg-stone-50 rounded-lg text-sm">
                <div class="flex-1">
                    <div class="font-medium text-stone-700">${report.reason}</div>
                    <div class="text-stone-500 truncate">Par @${report.userIdentifier}</div>
                </div>
                <button onclick="CalculUpAdmin.reviewReport('${report.id}')" 
                        class="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs hover:bg-rose-200">
                    Voir
                </button>
            </div>
        `).join('');
    }

    function updateStatsDisplay() {
        const totalUsers = document.getElementById('total-users');
        const totalQuestions = document.getElementById('total-questions');
        const pendingItems = document.getElementById('pending-items');
        const activeUsers = document.getElementById('active-users');
        
        if (totalUsers) totalUsers.textContent = adminData.stats.totalUsers;
        if (totalQuestions) totalQuestions.textContent = adminData.stats.totalQuestions;
        if (pendingItems) pendingItems.textContent = adminData.stats.totalReports;
        if (activeUsers) activeUsers.textContent = adminData.stats.activeUsers;
    }

    function updateActivityLogs(logs) {
        const container = document.getElementById('activity-logs');
        if (!container) return;
        
        const typeIcons = {
            validation: '✅',
            approval: '👍',
            report: '🚩',
            suspension: '🚫'
        };
        
        container.innerHTML = logs.map(log => `
            <div class="flex items-center p-3 bg-stone-50 rounded-lg">
                <span class="text-xl mr-3">${typeIcons[log.type] || '📝'}</span>
                <div class="flex-1">
                    <div class="font-medium text-stone-700">${log.action}</div>
                    <div class="text-sm text-stone-500">${log.details}</div>
                </div>
                <div class="text-xs text-stone-400">
                    ${log.timestamp.toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    // =============================================================================
    // ACTIONS D'ADMINISTRATION
    // =============================================================================
    
    function refreshDashboard() {
        CalculUpCore.showLoading('Actualisation...');
        setTimeout(() => {
            loadAdminData();
            CalculUpCore.hideLoading();
            CalculUpCore.showSuccess('Dashboard actualisé');
        }, 1000);
    }

    function reviewQuestion(questionId) {
        CalculUpCore.showError('Fonctionnalité en développement - Validation de question: ' + questionId);
    }

    function reviewTeacher(teacherId) {
        CalculUpCore.showError('Fonctionnalité en développement - Validation enseignant: ' + teacherId);
    }

    function reviewReport(reportId) {
        CalculUpCore.showError('Fonctionnalité en développement - Traitement signalement: ' + reportId);
    }

    function showQuestionValidation() {
        CalculUpCore.showError('Fonctionnalité en développement - Interface de validation des questions');
    }

    function showTeacherValidation() {
        CalculUpCore.showError('Fonctionnalité en développement - Interface de validation des enseignants');
    }

    function showReportsManagement() {
        CalculUpCore.showError('Fonctionnalité en développement - Interface de gestion des signalements');
    }

    function showUserManagement() {
        CalculUpCore.showError('Fonctionnalité en développement - Gestion des utilisateurs');
    }

    function showQuestionManagement() {
    const user = CalculUpCore.getUser();
    if (!user || user.type !== 'admin') {
        CalculUpCore.showError('Accès non autorisé');
        return;
    }
    
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
            <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                <div class="flex items-center">
                    <button onclick="CalculUpAdmin.showAdminDashboard()" 
                            class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                        <span class="text-xl">←</span>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-stone-700">Gestion des Questions</h1>
                        <p class="text-stone-500">Import en lot et gestion de la base</p>
                    </div>
                </div>
            </div>
            
            <div class="max-w-4xl mx-auto p-6 space-y-6">
                <!-- Import en lot -->
                <div class="dashboard-card slide-in">
                    <h3 class="text-xl font-semibold mb-4 text-stone-700">📥 Import de questions en lot</h3>
                    
                    <div class="space-y-4">
                        <div class="alert info">
                            <h4 class="font-semibold mb-2">🔧 Pour développeurs</h4>
                            <p class="text-sm mb-3">
                                Ouvrez la console (F12) et utilisez cette fonction pour importer les questions du fichier data.js :
                            </p>
                            <div class="bg-stone-800 text-emerald-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                <div>// Dans la console :</div>
                                <div>await CalculUpAdmin.importDefaultQuestions();</div>
                            </div>
                            <p class="text-xs text-stone-600 mt-2">
                                ⚠️ Cette opération va importer toutes les questions du module data.js en base Firebase
                            </p>
                        </div>
                        
                        <button onclick="CalculUpAdmin.importDefaultQuestions()" 
                                class="w-full bg-violet-100 border border-violet-200 text-violet-700 p-4 rounded-lg hover:bg-violet-200 transition-colors">
                            📚 Importer les questions par défaut maintenant
                        </button>
                    </div>
                </div>
                
                <!-- Stats questions -->
                <div class="dashboard-card slide-in">
                    <h3 class="text-xl font-semibold mb-4 text-stone-700">📊 Statistiques</h3>
                    <div id="questions-stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="stat-card emerald">
                            <div class="text-2xl font-bold" id="total-system-questions">-</div>
                            <div class="text-sm">Questions système</div>
                        </div>
                        <div class="stat-card sky">
                            <div class="text-2xl font-bold" id="total-user-questions">-</div>
                            <div class="text-sm">Questions utilisateurs</div>
                        </div>
                        <div class="stat-card amber">
                            <div class="text-2xl font-bold" id="pending-questions">-</div>
                            <div class="text-sm">En attente</div>
                        </div>
                        <div class="stat-card rose">
                            <div class="text-2xl font-bold" id="reported-questions">-</div>
                            <div class="text-sm">Signalées</div>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onclick="CalculUpAdmin.refreshQuestionStats()" 
                            class="dashboard-card hover:shadow-glow transition-all text-center">
                        <div class="text-3xl mb-2">🔄</div>
                        <div class="font-semibold text-stone-700">Actualiser les stats</div>
                    </button>
                    
                    <button onclick="CalculUpAdmin.showQuestionValidation()" 
                            class="dashboard-card hover:shadow-glow transition-all text-center">
                        <div class="text-3xl mb-2">✅</div>
                        <div class="font-semibold text-stone-700">Valider les questions</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Charger les stats automatiquement
    setTimeout(() => {
        refreshQuestionStats();
    }, 500);
}

// ✅ NOUVELLE FONCTION : Import en lot des questions par défaut
async function importDefaultQuestions() {
    try {
        CalculUpCore.showLoading('Import des questions en cours...');
        
        const db = CalculUpCore.getDb();
        const defaultQuestions = CalculUpData.getDefaultQuestions();
        
        console.log('📚 Import de', defaultQuestions.length, 'questions...');
        
        const batch = db.batch();
        let importCount = 0;
        
        for (const question of defaultQuestions) {
            // Vérifier si la question existe déjà
            const existing = await db.collection('questions').doc(question.id).get();
            
            if (!existing.exists) {
                const docRef = db.collection('questions').doc(question.id);
                batch.set(docRef, {
                    ...question,
                    verified: true,
                    pending: false,
                    reportCount: 0,
                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
                });
                importCount++;
            }
        }
        
        if (importCount > 0) {
            await batch.commit();
            CalculUpCore.showSuccess(`✅ ${importCount} questions importées avec succès !`);
            console.log('✅ Import terminé:', importCount, 'nouvelles questions');
        } else {
            CalculUpCore.showSuccess('ℹ️ Toutes les questions sont déjà en base');
        }
        
        // Actualiser les stats
        refreshQuestionStats();
        
    } catch (error) {
        console.error('❌ Erreur import questions:', error);
        CalculUpCore.showError('Erreur lors de l\'import : ' + error.message);
    } finally {
        CalculUpCore.hideLoading();
    }
}

// ✅ NOUVELLE FONCTION : Stats des questions
async function refreshQuestionStats() {
    try {
        const db = CalculUpCore.getDb();
        
        // Questions système
        const systemQuestions = await db.collection('questions')
            .where('creator', '==', 'system').get();
        
        // Questions utilisateurs
        const userQuestions = await db.collection('questions')
            .where('creator', '!=', 'system').get();
            
        // Questions en attente
        const pendingQuestions = await db.collection('questions')
            .where('pending', '==', true).get();
            
        // Questions signalées
        const reportedQuestions = await db.collection('questions')
            .where('reportCount', '>', 0).get();
        
        // Mettre à jour l'affichage
        document.getElementById('total-system-questions').textContent = systemQuestions.size;
        document.getElementById('total-user-questions').textContent = userQuestions.size;
        document.getElementById('pending-questions').textContent = pendingQuestions.size;
        document.getElementById('reported-questions').textContent = reportedQuestions.size;
        
        console.log('📊 Stats questions actualisées');
        
    } catch (error) {
        console.error('❌ Erreur stats questions:', error);
        // Valeurs par défaut en cas d'erreur
        document.getElementById('total-system-questions').textContent = '?';
        document.getElementById('total-user-questions').textContent = '?';
        document.getElementById('pending-questions').textContent = '?';
        document.getElementById('reported-questions').textContent = '?';
    }
}

    function showStatistics() {
        CalculUpCore.showError('Fonctionnalité en développement - Statistiques détaillées');
    }

    function showSystemSettings() {
        CalculUpCore.showError('Fonctionnalité en développement - Paramètres système');
    }

    // =============================================================================
    // UTILITAIRES
    // =============================================================================
    
    function formatDate(timestamp) {
        if (!timestamp) return 'Date inconnue';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusBadge(status) {
        const badges = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-emerald-100 text-emerald-700',
            rejected: 'bg-rose-100 text-rose-700',
            suspended: 'bg-red-100 text-red-700'
        };
        
        return badges[status] || 'bg-stone-100 text-stone-700';
    }




    // =============================================================================
    // API PUBLIQUE DU MODULE
    // =============================================================================
    
return {
    // Interface principale
    showAdminDashboard,
    
    // Gestion des données
    loadAdminData,
    refreshDashboard,
    
    // Actions de review
    reviewQuestion,
    reviewTeacher,
    reviewReport,
    
    // Interfaces de gestion
    showQuestionValidation,
    showTeacherValidation,
    showReportsManagement,
    showUserManagement,
    showQuestionManagement,
    showStatistics,
    showSystemSettings,
    
    // ✅ NOUVELLES FONCTIONS
    importDefaultQuestions,
    refreshQuestionStats,
    
    // Utilitaires
    formatDate,
    getStatusBadge,
    getAdminData: () => adminData
};
})();