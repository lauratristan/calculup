// =============================================================================
// CALCUL-UP-ADMIN.JS - MODULE ADMIN COMPLET AVEC SIGNALEMENTS
// Utilise le module CalculUpReports + gestion suspension comptes
// =============================================================================

window.CalculUpAdmin = (() => {
    'use strict';
    
    // Variables globales du module
    let adminData = {
        pendingQuestions: [],
        pendingTeachers: [],
        reports: [],
        stats: {}
    };
    
    // =========================================================================
    // INTERFACE PRINCIPALE
    // =========================================================================
    
    function showAdminDashboard() {
        console.log('🛠️ Affichage dashboard administrateur');
        
        const user = CalculUpCore.getUser();
        if (!user || user.type !== 'admin') {
            CalculUpCore.showError('Accès non autorisé');
            CalculUpCore.navigateToScreen('login');
            return;
        }
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
                <!-- Header -->
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                    <div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                            Dashboard Administrateur
                        </h1>
                        <p class="text-stone-600">Bienvenue ${user.firstname} (@${user.identifier})</p>
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

                <div class="max-w-6xl mx-auto p-6 space-y-6">
                    <!-- Statistiques rapides -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="dashboard-card text-center">
                            <div class="text-3xl mb-2">👥</div>
                            <div class="text-2xl font-bold text-emerald-600" id="total-users">-</div>
                            <div class="text-sm text-stone-600">Utilisateurs totaux</div>
                        </div>
                        <div class="dashboard-card text-center">
                            <div class="text-3xl mb-2">🎓</div>
                            <div class="text-2xl font-bold text-amber-600" id="pending-teachers">-</div>
                            <div class="text-sm text-stone-600">Enseignants en attente</div>
                        </div>
                        <div class="dashboard-card text-center">
                            <div class="text-3xl mb-2">❓</div>
                            <div class="text-2xl font-bold text-sky-600" id="pending-questions">-</div>
                            <div class="text-sm text-stone-600">Questions à valider</div>
                        </div>
                        <div class="dashboard-card text-center">
                            <div class="text-3xl mb-2">🚨</div>
                            <div class="text-2xl font-bold text-rose-600" id="pending-reports">-</div>
                            <div class="text-sm text-stone-600">Signalements</div>
                        </div>
                    </div>

                    <!-- Actions principales -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Validation enseignants -->
                        <button onclick="CalculUpAdmin.showTeacherValidationPanel()" 
                                class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                            <div class="text-4xl mb-4">🎓</div>
                            <div class="font-semibold text-stone-700 mb-2">Validation Enseignants</div>
                            <div class="text-sm text-stone-500">Comptes en attente de validation</div>
                        </button>

                        <!-- Validation questions -->
                        <button onclick="CalculUpAdmin.showQuestionValidation()" 
                                class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                            <div class="text-4xl mb-4">❓</div>
                            <div class="font-semibold text-stone-700 mb-2">Questions</div>
                            <div class="text-sm text-stone-500">Valider les soumissions</div>
                        </button>

                        <!-- 🆕 Signalements - UTILISE LE VRAI MODULE -->
                        <button onclick="CalculUpAdmin.showReportsManagement()" 
                                class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                            <div class="text-4xl mb-4">🚨</div>
                            <div class="font-semibold text-stone-700 mb-2">Signalements</div>
                            <div class="text-sm text-stone-500">Modération communautaire</div>
                        </button>

                        <!-- Gestion utilisateurs -->
                        <button onclick="CalculUpAdmin.showUserManagement()" 
                                class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                            <div class="text-4xl mb-4">👥</div>
                            <div class="font-semibold text-stone-700 mb-2">Utilisateurs</div>
                            <div class="text-sm text-stone-500">Gestion des comptes</div>
                        </button>

                        <!-- Statistiques -->
                        <button onclick="CalculUpAdmin.showStatistics()" 
                                class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                            <div class="text-4xl mb-4">📊</div>
                            <div class="font-semibold text-stone-700 mb-2">Statistiques</div>
                            <div class="text-sm text-stone-500">Analytics détaillées</div>
                        </button>

                        <!-- Paramètres système -->
                        <button onclick="CalculUpAdmin.showSystemSettings()" 
                                class="dashboard-card hover:shadow-glow transition-all transform hover:scale-105 text-center">
                            <div class="text-4xl mb-4">⚙️</div>
                            <div class="font-semibold text-stone-700 mb-2">Paramètres</div>
                            <div class="text-sm text-stone-500">Configuration système</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Charger les données
        loadAdminData();
    }
    
    // =========================================================================
    // VALIDATION ENSEIGNANTS - INTERFACE COMPLÈTE
    // =========================================================================
    
    function showTeacherValidationPanel() {
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
                            <h1 class="text-2xl font-bold text-stone-700">Validation Enseignants</h1>
                            <p class="text-stone-500">Vérification et activation des comptes</p>
                        </div>
                    </div>
                </div>
                
                <div class="max-w-6xl mx-auto p-6 space-y-6">
                    <!-- Comptes en attente de validation complète -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700">
                            🔄 Comptes en attente de validation complète
                        </h3>
                        <div id="pending-teachers-list" class="space-y-4">
                            <div class="text-center text-stone-500 py-4">
                                <div class="loading-spin mx-auto mb-2"></div>
                                Chargement...
                            </div>
                        </div>
                    </div>

                    <!-- Comptes avec accès provisoire -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700">
                            ⚠️ Comptes avec accès provisoire (email académique)
                        </h3>
                        <div id="provisional-teachers-list" class="space-y-4">
                            <div class="text-center text-stone-500 py-4">
                                <div class="loading-spin mx-auto mb-2"></div>
                                Chargement...
                            </div>
                        </div>
                    </div>

                    <!-- Comptes validés récents -->
                    <div class="dashboard-card slide-in">
                        <h3 class="text-xl font-semibold mb-4 text-stone-700">
                            ✅ Comptes validés récents
                        </h3>
                        <div id="validated-teachers-list" class="space-y-4">
                            <div class="text-center text-stone-500 py-4">
                                <div class="loading-spin mx-auto mb-2"></div>
                                Chargement...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Charger les données réelles
        loadTeachersForValidation();
    }
    
    // =========================================================================
    // 🆕 GESTION DES SIGNALEMENTS - VERSION COMPLÈTE ADMIN
    // =========================================================================

    function showReportsManagement() {
        const user = CalculUpCore.getUser();
        if (!user || user.type !== 'admin') {
            CalculUpCore.showError('Accès non autorisé');
            return;
        }
        
        console.log('📨 Tentative d\'accès aux signalements pour admin:', user.identifier);
        
        // Vérifier si le module Reports est disponible
        if (typeof CalculUpReports !== 'undefined' && CalculUpReports.showReportsManagement) {
            console.log('✅ Module CalculUpReports trouvé, redirection...');
            CalculUpReports.showReportsManagement();
        } else {
            console.warn('⚠️ Module CalculUpReports non disponible, affichage interface de secours');
            
            // Interface de secours si le module Reports n'est pas disponible
            const root = document.getElementById('root');
            root.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                    <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                        <div class="flex items-center">
                            <button onclick="CalculUpAdmin.showAdminDashboard()" 
                                    class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                                <span class="text-xl">←</span>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-stone-700">Signalements (Secours)</h1>
                                <p class="text-stone-500">Interface temporaire - Module principal indisponible</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="max-w-6xl mx-auto p-6 space-y-6">
                        <div class="dashboard-card slide-in">
                            <h3 class="text-lg font-semibold mb-4 text-stone-700">⚠️ Module non disponible</h3>
                            <div class="space-y-4">
                                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p class="text-amber-700">
                                        <strong>Problème détecté :</strong> Le module CalculUpReports n'est pas chargé.
                                    </p>
                                    <p class="text-amber-600 text-sm mt-2">
                                        Vérifiez que le fichier <code>calcul-up-reports.js</code> est inclus dans index.html
                                    </p>
                                </div>
                                
                                <button onclick="CalculUpAdmin.loadReportsDirectly()" 
                                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                    🔄 Charger les signalements directement
                                </button>
                            </div>
                            
                            <div id="reports-fallback" class="mt-6">
                                <!-- Les signalements seront chargés ici -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Fonction de secours pour charger les signalements directement
    async function loadReportsDirectly() {
        try {
            CalculUpCore.showLoading('Chargement des signalements...');
            
            const db = CalculUpCore.getDb();
            if (!db) {
                throw new Error('Base de données non disponible');
            }
            
            const reportsSnapshot = await db.collection('reports')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            const reports = reportsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('📨 Signalements chargés directement:', reports.length);
            
            displayReportsFallback(reports);
            
        } catch (error) {
            console.error('❌ Erreur chargement signalements:', error);
            CalculUpCore.showError('Erreur de chargement : ' + error.message);
            
            const container = document.getElementById('reports-fallback');
            if (container) {
                container.innerHTML = `
                    <div class="text-center text-red-600 py-8">
                        <div class="text-4xl mb-4">⚠️</div>
                        <p>Erreur de chargement des signalements</p>
                        <p class="text-sm mt-2">${error.message}</p>
                        <button onclick="CalculUpAdmin.loadReportsDirectly()" 
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

    function displayReportsFallback(reports) {
        const container = document.getElementById('reports-fallback');
        if (!container) return;
        
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-8">
                    <div class="text-4xl mb-4">✅</div>
                    <p>Aucun signalement trouvé</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h4 class="text-lg font-semibold mb-4 text-stone-700">
                📨 Signalements trouvés (${reports.length})
            </h4>
            <div class="space-y-4">
                ${reports.map(report => {
                    const createdDate = report.createdAt?.toDate?.() || new Date();
                    const statusColor = {
                        'pending': 'bg-amber-100 text-amber-700',
                        'resolved': 'bg-emerald-100 text-emerald-700',
                        'rejected': 'bg-red-100 text-red-700'
                    };
                    
                    return `
                        <div class="border border-stone-200 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h5 class="font-semibold text-stone-800">
                                        ${getReportTypeLabel(report.reportType)} - ${report.itemType || 'Question'}
                                    </h5>
                                    <p class="text-sm text-stone-600">
                                        Par ${report.reporterName || 'Inconnu'} (@${report.reporterIdentifier || 'N/A'}) le ${createdDate.toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <span class="px-2 py-1 rounded-full text-xs ${statusColor[report.status] || 'bg-stone-100 text-stone-700'}">
                                    ${getStatusLabel(report.status)}
                                </span>
                            </div>
                            
                            ${report.questionText ? `
                                <div class="bg-stone-50 p-3 rounded mb-2">
                                    <p class="text-sm"><strong>Question :</strong> ${report.questionText}</p>
                                    ${report.userAnswer ? `
                                        <p class="text-sm mt-1"><strong>Réponse utilisateur :</strong> ${report.userAnswer}</p>
                                    ` : ''}
                                    ${report.correctAnswer ? `
                                        <p class="text-sm mt-1"><strong>Réponse correcte :</strong> ${report.correctAnswer}</p>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            ${report.description ? `
                                <div class="bg-blue-50 p-3 rounded mb-2">
                                    <p class="text-sm"><strong>Description :</strong> ${report.description}</p>
                                </div>
                            ` : ''}
                            
                            ${report.priority === 'high' ? `
                                <div class="bg-red-50 p-2 rounded mb-2">
                                    <p class="text-sm text-red-700">🔥 <strong>Priorité haute</strong></p>
                                </div>
                            ` : ''}
                            
                            ${report.status === 'pending' ? `
                                <div class="flex space-x-2 mt-3">
                                    <button onclick="CalculUpAdmin.processReportFallback('${report.id}', 'resolved')" 
                                            class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm">
                                        ✅ Résoudre
                                    </button>
                                    <button onclick="CalculUpAdmin.processReportFallback('${report.id}', 'rejected')" 
                                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                        ❌ Rejeter
                                    </button>
                                </div>
                            ` : `
                                <div class="text-sm text-stone-500 mt-2">
                                    Traité par ${report.handledBy || 'Système'} 
                                    ${report.handledAt ? `le ${report.handledAt.toDate?.()?.toLocaleDateString('fr-FR') || 'date inconnue'}` : ''}
                                </div>
                            `}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    async function processReportFallback(reportId, newStatus) {
        try {
            CalculUpCore.showLoading('Traitement en cours...');
            
            const user = CalculUpCore.getUser();
            const db = CalculUpCore.getDb();
            
            await db.collection('reports').doc(reportId).update({
                status: newStatus,
                handledBy: user.identifier,
                handledAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            CalculUpCore.showSuccess(`✅ Signalement ${newStatus === 'resolved' ? 'résolu' : 'rejeté'} !`);
            
            // Recharger les signalements
            setTimeout(loadReportsDirectly, 1000);
            
        } catch (error) {
            console.error('❌ Erreur traitement signalement:', error);
            CalculUpCore.showError('Erreur de traitement : ' + error.message);
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    // Fonctions utilitaires pour les signalements
    function getReportTypeLabel(type) {
        const labels = {
            'wrong_answer': 'Réponse incorrecte',
            'wrong_correction': 'Correction erronée',
            'question_error': 'Erreur énoncé',
            'inappropriate_content': 'Contenu inapproprié',
            'technical_issue': 'Problème technique'
        };
        return labels[type] || type || 'Type inconnu';
    }

    function getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'resolved': 'Résolu',
            'rejected': 'Rejeté'
        };
        return labels[status] || status || 'Statut inconnu';
    }



    // =========================================================================
    // 🆕 GESTION DE LA VALIDATION DES QUESTIONS
    // =========================================================================



// 🆕 NOUVELLE FONCTION : Interface validation questions
function showQuestionValidation() {
    const user = CalculUpCore.getUser();
    if (!user || user.type !== 'admin') {
        CalculUpCore.showError('Accès non autorisé');
        return;
    }
    
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-violet-50">
            <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                <div class="flex items-center">
                    <button onclick="CalculUpAdmin.showAdminDashboard()" 
                            class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                        <span class="text-xl">←</span>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-stone-700">Validation des Questions</h1>
                        <p class="text-stone-500">Modération des contributions utilisateurs</p>
                    </div>
                </div>
            </div>
            
            <div class="max-w-6xl mx-auto p-6 space-y-6">
                <!-- Statistiques validation -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="dashboard-card text-center">
                        <div class="text-3xl mb-2">⏳</div>
                        <div class="text-2xl font-bold text-amber-600" id="pending-questions-count">-</div>
                        <div class="text-sm text-stone-600">En attente</div>
                    </div>
                    <div class="dashboard-card text-center">
                        <div class="text-3xl mb-2">✅</div>
                        <div class="text-2xl font-bold text-emerald-600" id="validated-today">-</div>
                        <div class="text-sm text-stone-600">Validées aujourd'hui</div>
                    </div>
                    <div class="dashboard-card text-center">
                        <div class="text-3xl mb-2">🌟</div>
                        <div class="text-2xl font-bold text-violet-600" id="excellent-today">-</div>
                        <div class="text-sm text-stone-600">Excellentes aujourd'hui</div>
                    </div>
                    <div class="dashboard-card text-center">
                        <div class="text-3xl mb-2">❌</div>
                        <div class="text-2xl font-bold text-rose-600" id="rejected-today">-</div>
                        <div class="text-sm text-stone-600">Rejetées aujourd'hui</div>
                    </div>
                </div>

                <!-- Filtres -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <div class="flex flex-wrap gap-4">
                        <select id="question-status-filter" class="px-3 py-2 border border-stone-300 rounded-lg">
                            <option value="pending" selected>En attente</option>
                            <option value="all">Toutes</option>
                            <option value="validated">Validées</option>
                            <option value="excellent">Excellentes</option>
                            <option value="rejected">Rejetées</option>
                        </select>
                        
                        <select id="question-creator-filter" class="px-3 py-2 border border-stone-300 rounded-lg">
                            <option value="">Tous créateurs</option>
                            <option value="student">Élèves</option>
                            <option value="teacher">Enseignants</option>
                        </select>
                        
                        <button onclick="CalculUpAdmin.loadQuestionsToValidate()" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                            🔄 Actualiser
                        </button>
                    </div>
                </div>
                
                <!-- Liste des questions -->
                <div id="questions-validation-list" class="space-y-4">
                    <div class="text-center py-8">
                        <div class="loading-spin mx-auto mb-2"></div>
                        <p>Chargement des questions...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadQuestionsToValidate();
}
// 🆕 NOUVELLE FONCTION : Charger questions à valider
async function loadQuestionsToValidate() {
    try {
        CalculUpCore.showLoading('Chargement des questions...');
        
        const db = CalculUpCore.getDb();
        const statusFilter = document.getElementById('question-status-filter')?.value || 'pending';
        const creatorFilter = document.getElementById('question-creator-filter')?.value;
        
        let query = db.collection('questions');
        
        if (statusFilter !== 'all') {
            if (statusFilter === 'pending') {
                query = query.where('verified', '==', false);
            } else {
                query = query.where('status', '==', statusFilter);
            }
        }
        
        if (creatorFilter) {
            query = query.where('userType', '==', creatorFilter);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
        
        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`📝 ${questions.length} questions trouvées pour validation`);
        
        displayQuestionsForValidation(questions);
        updateValidationStats(questions);
        
    } catch (error) {
        console.error('❌ Erreur chargement questions:', error);
        
        const container = document.getElementById('questions-validation-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-red-600 py-8">
                    <div class="text-4xl mb-4">⚠️</div>
                    <p>Erreur de chargement des questions</p>
                    <button onclick="CalculUpAdmin.loadQuestionsToValidate()" 
                            class="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                        🔄 Réessayer
                    </button>
                </div>
            `;
        }
    } finally {
        CalculUpCore.hideLoading();
    }
}

// 🆕 NOUVELLE FONCTION : Afficher questions pour validation
function displayQuestionsForValidation(questions) {
    const container = document.getElementById('questions-validation-list');
    if (!container) return;
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-emerald-600 py-8">
                <div class="text-4xl mb-4">✅</div>
                <p>Aucune question à valider</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = questions.map(question => {
        const createdDate = question.createdAt?.toDate?.() || new Date();
        const statusInfo = getQuestionValidationStatus(question);
        
        return `
            <div class="question-validation-card bg-white border border-stone-200 rounded-xl p-6 ${statusInfo.bgClass}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1 mr-4">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-stone-800">
                                ${question.chapter} - ${question.notion}
                            </h3>
                            <span class="px-2 py-1 rounded-full text-xs ${statusInfo.badgeClass}">
                                ${statusInfo.icon} ${statusInfo.label}
                            </span>
                        </div>
                        
                        <div class="text-sm text-stone-600 mb-3">
                            Par ${question.createdByName || 'Utilisateur'} (@${question.createdByIdentifier || 'N/A'}) 
                            le ${createdDate.toLocaleDateString('fr-FR')}
                            • Type: ${question.userType === 'student' ? 'Élève' : 'Enseignant'}
                        </div>
                        
                        <div class="bg-stone-50 p-4 rounded-lg mb-4">
                            <h4 class="font-medium text-stone-800 mb-2">Question :</h4>
                            <p class="text-stone-700">${question.question}</p>
                        </div>
                        
                        ${question.type === 'qcm' ? `
                            <div class="bg-blue-50 p-4 rounded-lg mb-4">
                                <h4 class="font-medium text-stone-800 mb-2">Choix de réponses :</h4>
                                <div class="space-y-2">
                                    ${question.choices.map((choice, index) => `
                                        <div class="flex items-center space-x-2">
                                            <span class="font-medium ${index === question.correctChoice ? 'text-emerald-600' : 'text-stone-600'}">
                                                ${String.fromCharCode(65 + index)}.
                                            </span>
                                            <span class="${index === question.correctChoice ? 'text-emerald-600 font-medium' : 'text-stone-700'}">
                                                ${choice}
                                                ${index === question.correctChoice ? ' ✓' : ''}
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : `
                            <div class="bg-emerald-50 p-4 rounded-lg mb-4">
                                <h4 class="font-medium text-stone-800 mb-2">Réponse attendue :</h4>
                                <p class="text-emerald-700 font-medium">${question.answer}</p>
                                ${question.variants && question.variants.length > 0 ? `
                                    <p class="text-emerald-600 text-sm mt-1">
                                        Variantes : ${question.variants.join(', ')}
                                    </p>
                                ` : ''}
                            </div>
                        `}
                        
                        ${question.explanation ? `
                            <div class="bg-yellow-50 p-4 rounded-lg mb-4">
                                <h4 class="font-medium text-stone-800 mb-2">Explication :</h4>
                                <p class="text-stone-700">${question.explanation}</p>
                            </div>
                        ` : ''}
                        
                        ${question.hint ? `
                            <div class="bg-amber-50 p-4 rounded-lg mb-4">
                                <h4 class="font-medium text-stone-800 mb-2">Indice :</h4>
                                <p class="text-stone-700">${question.hint}</p>
                            </div>
                        ` : ''}
                        
                        <div class="text-sm text-stone-500">
                            Difficulté : ${question.difficulty} • Points : ${question.points} • Temps : ${question.timeLimit}s
                        </div>
                    </div>
                </div>
                
                ${question.status === 'pending' || !question.verified ? `
                    <div class="flex space-x-3 pt-4 border-t border-stone-200">
                        <button onclick="CalculUpAdmin.validateQuestion('${question.id}', 'validated')" 
                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                            ✅ Valider (+5 XP)
                        </button>
                        <button onclick="CalculUpAdmin.validateQuestion('${question.id}', 'excellent')" 
                                class="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors">
                            🌟 Excellente (+10 XP)
                        </button>
                        <button onclick="CalculUpAdmin.validateQuestion('${question.id}', 'rejected')" 
                                class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors">
                            ❌ Rejeter
                        </button>
                        <button onclick="CalculUpAdmin.showModerationNoteModal('${question.id}')" 
                                class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
                            💬 Ajouter note
                        </button>
                    </div>
                ` : `
                    <div class="pt-4 border-t border-stone-200 text-sm text-stone-600">
                        ${question.status === 'validated' ? '✅ Validée' : 
                          question.status === 'excellent' ? '🌟 Excellente' : 
                          question.status === 'rejected' ? '❌ Rejetée' : 'État inconnu'}
                        ${question.validatedBy ? ` par ${question.validatedBy}` : ''}
                        ${question.validatedAt ? ` le ${question.validatedAt.toDate?.()?.toLocaleDateString('fr-FR')}` : ''}
                    </div>
                `}
            </div>
        `;
    }).join('');
}

// 🆕 NOUVELLE FONCTION : Valider une question
async function validateQuestion(questionId, newStatus) {
    try {
        CalculUpCore.showLoading('Validation en cours...');
        
        const user = CalculUpCore.getUser();
        const db = CalculUpCore.getDb();
        const questionRef = db.collection('questions').doc(questionId);
        
        // Récupérer la question pour les infos utilisateur
        const questionDoc = await questionRef.get();
        if (!questionDoc.exists) {
            throw new Error('Question non trouvée');
        }
        
        const questionData = questionDoc.data();
        
        // Calculer les points selon le nouveau système
        let earnedPoints = 0;
        if (newStatus === 'validated') {
            earnedPoints = 5;
        } else if (newStatus === 'excellent') {
            earnedPoints = 10;
        }
        
        // Mettre à jour la question
        const updates = {
            status: newStatus,
            verified: newStatus !== 'rejected',
            earnedPoints: earnedPoints,
            validatedBy: user.identifier,
            validatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await questionRef.update(updates);
        
        // Attribuer XP à l'auteur si validée
        if (earnedPoints > 0 && questionData.createdBy) {
            try {
                const authorRef = db.collection('users').doc(questionData.createdBy);
                await authorRef.update({
                    xp: firebase.firestore.FieldValue.increment(earnedPoints)
                });
                
                console.log(`✅ ${earnedPoints} XP attribués à l'auteur ${questionData.createdByIdentifier}`);
            } catch (xpError) {
                console.warn('⚠️ Erreur attribution XP:', xpError);
            }
        }
        
        const statusLabels = {
            'validated': 'validée (+5 XP à l\'auteur)',
            'excellent': 'marquée excellente (+10 XP à l\'auteur)',
            'rejected': 'rejetée'
        };
        
        CalculUpCore.showSuccess(`✅ Question ${statusLabels[newStatus]} !`);
        
        // Recharger la liste
        setTimeout(loadQuestionsToValidate, 1000);
        
    } catch (error) {
        console.error('❌ Erreur validation question:', error);
        CalculUpCore.showError('Erreur lors de la validation');
    } finally {
        CalculUpCore.hideLoading();
    }
}

// 🆕 NOUVELLE FONCTION : Modal note modérateur
function showModerationNoteModal(questionId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 class="text-xl font-bold text-stone-800 mb-4">💬 Note du modérateur</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Action :</label>
                    <select id="moderation-action" class="w-full p-3 border border-stone-300 rounded-lg">
                        <option value="validated">Valider (+5 XP)</option>
                        <option value="excellent">Excellente (+10 XP)</option>
                        <option value="rejected">Rejeter</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Note à l'auteur :</label>
                    <textarea id="moderation-note" 
                              class="w-full p-3 border border-stone-300 rounded-lg h-24 resize-none"
                              placeholder="Commentaires ou suggestions pour l'auteur..."></textarea>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors">
                    Annuler
                </button>
                <button onclick="CalculUpAdmin.validateQuestionWithNote('${questionId}')" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                    💬 Valider avec note
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 🆕 NOUVELLE FONCTION : Validation avec note
async function validateQuestionWithNote(questionId) {
    try {
        const action = document.getElementById('moderation-action').value;
        const note = document.getElementById('moderation-note').value.trim();
        
        CalculUpCore.showLoading('Validation avec note...');
        
        const user = CalculUpCore.getUser();
        const db = CalculUpCore.getDb();
        const questionRef = db.collection('questions').doc(questionId);
        
        // Récupérer la question
        const questionDoc = await questionRef.get();
        const questionData = questionDoc.data();
        
        // Calculer points
        let earnedPoints = 0;
        if (action === 'validated') earnedPoints = 5;
        else if (action === 'excellent') earnedPoints = 10;
        
        // Mettre à jour avec note
        const updates = {
            status: action,
            verified: action !== 'rejected',
            earnedPoints: earnedPoints,
            moderatorNote: note,
            validatedBy: user.identifier,
            validatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await questionRef.update(updates);
        
        // Attribuer XP
        if (earnedPoints > 0 && questionData.createdBy) {
            const authorRef = db.collection('users').doc(questionData.createdBy);
            await authorRef.update({
                xp: firebase.firestore.FieldValue.increment(earnedPoints)
            });
        }
        
        CalculUpCore.showSuccess(`✅ Question ${action} avec note !`);
        
        // Fermer modal et recharger
        document.querySelector('.fixed.inset-0').remove();
        setTimeout(loadQuestionsToValidate, 1000);
        
    } catch (error) {
        console.error('❌ Erreur validation avec note:', error);
        CalculUpCore.showError('Erreur lors de la validation');
    } finally {
        CalculUpCore.hideLoading();
    }
}

// 🆕 NOUVELLE FONCTION : Stats validation
function updateValidationStats(questions) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
        pending: questions.filter(q => !q.verified || q.status === 'pending').length,
        validatedToday: questions.filter(q => {
            const validatedDate = q.validatedAt?.toDate?.();
            return validatedDate && validatedDate >= today && q.status === 'validated';
        }).length,
        excellentToday: questions.filter(q => {
            const validatedDate = q.validatedAt?.toDate?.();
            return validatedDate && validatedDate >= today && q.status === 'excellent';
        }).length,
        rejectedToday: questions.filter(q => {
            const validatedDate = q.validatedAt?.toDate?.();
            return validatedDate && validatedDate >= today && q.status === 'rejected';
        }).length
    };
    
    document.getElementById('pending-questions-count').textContent = stats.pending;
    document.getElementById('validated-today').textContent = stats.validatedToday;
    document.getElementById('excellent-today').textContent = stats.excellentToday;
    document.getElementById('rejected-today').textContent = stats.rejectedToday;
}

// 🆕 NOUVELLE FONCTION : Statut validation question
function getQuestionValidationStatus(question) {
    const statusMap = {
        'pending': {
            label: 'En attente',
            icon: '⏳',
            bgClass: 'border-l-4 border-amber-400',
            badgeClass: 'bg-amber-100 text-amber-700'
        },
        'validated': {
            label: 'Validée',
            icon: '✅',
            bgClass: 'border-l-4 border-emerald-400',
            badgeClass: 'bg-emerald-100 text-emerald-700'
        },
        'excellent': {
            label: 'Excellente',
            icon: '🌟',
            bgClass: 'border-l-4 border-violet-400',
            badgeClass: 'bg-violet-100 text-violet-700'
        },
        'rejected': {
            label: 'Rejetée',
            icon: '❌',
            bgClass: 'border-l-4 border-rose-400',
            badgeClass: 'bg-rose-100 text-rose-700'
        }
    };
    
    const status = !question.verified || question.status === 'pending' ? 'pending' : question.status;
    return statusMap[status] || statusMap['pending'];
}

    // =========================================================================
    // 🆕 GESTION UTILISATEURS AVEC SUSPENSION
    // =========================================================================

    function showUserManagement() {
        const user = CalculUpCore.getUser();
        if (!user || user.type !== 'admin') {
            CalculUpCore.showError('Accès non autorisé');
            return;
        }
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-stone-50 to-sky-50">
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                    <div class="flex items-center">
                        <button onclick="CalculUpAdmin.showAdminDashboard()" 
                                class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                            <span class="text-xl">←</span>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-stone-700">Gestion des Utilisateurs</h1>
                            <p class="text-stone-500">Administration des comptes utilisateurs</p>
                        </div>
                    </div>
                </div>
                
                <div class="max-w-6xl mx-auto p-6 space-y-6">
                    <!-- Outils de recherche -->
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <div class="flex flex-wrap gap-4">
                            <input type="text" id="search-user" placeholder="Rechercher par identifiant, email..."
                                   class="flex-1 px-3 py-2 border border-stone-300 rounded-lg">
                            
                            <select id="user-type-filter" class="px-3 py-2 border border-stone-300 rounded-lg">
                                <option value="">Tous les types</option>
                                <option value="student">Élèves</option>
                                <option value="teacher">Enseignants</option>
                                <option value="admin">Administrateurs</option>
                            </select>
                            
                            <select id="user-status-filter" class="px-3 py-2 border border-stone-300 rounded-lg">
                                <option value="">Tous les statuts</option>
                                <option value="active">Actifs</option>
                                <option value="pending_verification">En attente</option>
                                <option value="provisional_access">Accès provisoire</option>
                                <option value="suspended">Suspendus</option>
                            </select>
                            
                            <button onclick="CalculUpAdmin.searchUsers()" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                🔍 Rechercher
                            </button>
                        </div>
                    </div>
                    
                    <!-- Liste des utilisateurs -->
                    <div id="users-list" class="space-y-4">
                        <div class="text-center py-8">
                            <div class="text-4xl mb-4">👥</div>
                            <p>Utilisez les filtres ci-dessus pour rechercher des utilisateurs</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // CHARGEMENT DES DONNÉES
    // =========================================================================
    
    async function loadTeachersForValidation() {
        try {
            const db = CalculUpCore.getDb();
            
            console.log('📊 Chargement de tous les enseignants...');
            
            const allTeachersQuery = await db.collection('users')
                .where('type', '==', 'teacher')
                .get();
            
            console.log(`📊 ${allTeachersQuery.docs.length} enseignants trouvés`);
            
            const allTeachers = allTeachersQuery.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // 1. Enseignants en attente complète
            const pendingTeachers = allTeachers.filter(teacher => 
                teacher.status === 'pending_verification'
            );
            
            // 2. Enseignants avec accès provisoire  
            const provisionalTeachers = allTeachers.filter(teacher => 
                teacher.status === 'provisional_access'
            );
            
            // 3. Enseignants validés récents (derniers 30 jours)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const validatedTeachers = allTeachers.filter(teacher => {
                if (teacher.status !== 'active') return false;
                
                const updatedDate = teacher.updatedAt?.toDate?.() || teacher.createdAt?.toDate?.() || new Date(0);
                return updatedDate >= thirtyDaysAgo;
            }).slice(0, 10);
            
            console.log(`📊 Répartition: ${pendingTeachers.length} en attente, ${provisionalTeachers.length} provisoires, ${validatedTeachers.length} validés récents`);
            
            displayPendingTeachers(pendingTeachers);
            displayProvisionalTeachers(provisionalTeachers);
            displayValidatedTeachers(validatedTeachers);
            
        } catch (error) {
            console.error('❌ Erreur chargement enseignants:', error);
            CalculUpCore.showError('Erreur de chargement des données: ' + error.message);
            
            ['pending-teachers-list', 'provisional-teachers-list', 'validated-teachers-list'].forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    container.innerHTML = `
                        <div class="text-center text-rose-600 py-8">
                            <div class="text-4xl mb-4">⚠️</div>
                            <p>Erreur de chargement</p>
                            <button onclick="CalculUpAdmin.loadTeachersForValidation()" 
                                    class="mt-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200">
                                🔄 Réessayer
                            </button>
                        </div>
                    `;
                }
            });
        }
    }

    async function loadAdminData() {
        try {
            console.log('📊 Chargement des statistiques admin...');
            const db = CalculUpCore.getDb();
            
            const [usersSnapshot, questionsSnapshot, reportsSnapshot] = await Promise.all([
                db.collection('users').get(),
                db.collection('questions').get(), 
                db.collection('reports').get()
            ]);
            
            const users = usersSnapshot.docs.map(doc => doc.data());
            const questions = questionsSnapshot.docs.map(doc => doc.data());
            const reports = reportsSnapshot.docs.map(doc => doc.data());
            
            const stats = {
                totalUsers: users.length,
                students: users.filter(u => u.type === 'student').length,
                teachers: users.filter(u => u.type === 'teacher').length,
                admins: users.filter(u => u.type === 'admin').length,
                
                pendingTeachers: users.filter(u => 
                    u.type === 'teacher' && 
                    (u.status === 'pending_verification' || u.status === 'provisional_access')
                ).length,
                
                totalQuestions: questions.length,
                systemQuestions: questions.filter(q => q.creator === 'system').length,
                userQuestions: questions.filter(q => q.creator !== 'system').length,
                pendingQuestions: questions.filter(q => q.verified === false).length,
                
                totalReports: reports.length,
                pendingReports: reports.filter(r => r.status === 'pending').length,
                
                activeUsers: users.filter(u => u.status === 'active').length
            };
            
            console.log('📊 Statistiques calculées:', stats);
            
            document.getElementById('total-users').textContent = stats.totalUsers;
            document.getElementById('pending-teachers').textContent = stats.pendingTeachers;
            document.getElementById('pending-questions').textContent = stats.pendingQuestions;
            document.getElementById('pending-reports').textContent = stats.pendingReports;
            
            adminData.stats = stats;
            
        } catch (error) {
            console.error('❌ Erreur chargement données admin:', error);
            
            document.getElementById('total-users').textContent = 'ERR';
            document.getElementById('pending-teachers').textContent = 'ERR';
            document.getElementById('pending-questions').textContent = 'ERR';
            document.getElementById('pending-reports').textContent = 'ERR';
            
            CalculUpCore.showError('Impossible de charger les statistiques');
        }
    }

    // =========================================================================
    // AFFICHAGE DES DONNÉES
    // =========================================================================

    function displayPendingTeachers(teachers) {
        const container = document.getElementById('pending-teachers-list');
        if (!container) return;
        
        if (teachers.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-8">
                    <div class="text-4xl mb-4">✅</div>
                    <p>Aucun enseignant en attente de validation complète</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = teachers.map(teacher => {
            const createdDate = teacher.createdAt?.toDate?.() || new Date();
            const isAcademic = CalculUpData.isAcademicEmail(teacher.email);
            
            return `
                <div class="teacher-card bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <h4 class="text-lg font-semibold text-stone-800 mr-3">
                                    ${teacher.firstname} (@${teacher.identifier})
                                </h4>
                                <span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                                    En attente complète
                                </span>
                                ${!isAcademic ? '<span class="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">⚠️ Email non-académique</span>' : ''}
                            </div>
                            <div class="text-sm space-y-1">
                                <div><strong>Email :</strong> ${teacher.email}</div>
                                <div><strong>Inscription :</strong> ${createdDate.toLocaleDateString('fr-FR', { 
                                    year: 'numeric', month: 'long', day: 'numeric', 
                                    hour: '2-digit', minute: '2-digit' 
                                })}</div>
                                <div><strong>Niveau :</strong> ${teacher.level || 1} | <strong>XP :</strong> ${teacher.xp || 0}</div>
                                <div><strong>Questions créées :</strong> ${teacher.stats?.questionsCreated || 0}</div>
                                <div><strong>Statut email :</strong> 
                                    <span class="${isAcademic ? 'text-emerald-600' : 'text-red-600'}">
                                        ${isAcademic ? '✅ Académique' : '⚠️ Non-académique'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="CalculUpAdmin.validateTeacher('${teacher.id}', 'active')" 
                                    class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ✅ Valider
                            </button>
                            <button onclick="CalculUpAdmin.validateTeacher('${teacher.id}', 'rejected')" 
                                    class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ❌ Rejeter
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function displayProvisionalTeachers(teachers) {
        const container = document.getElementById('provisional-teachers-list');
        if (!container) return;
        
        if (teachers.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-8">
                    <div class="text-4xl mb-4">✅</div>
                    <p>Aucun enseignant avec accès provisoire</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = teachers.map(teacher => {
            const createdDate = teacher.createdAt?.toDate?.() || new Date();
            
            return `
                <div class="teacher-card bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <h4 class="text-lg font-semibold text-stone-800 mr-3">
                                    ${teacher.firstname} (@${teacher.identifier})
                                </h4>
                                <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                    Accès provisoire
                                </span>
                            </div>
                            <div class="text-sm space-y-1">
                                <div><strong>Email :</strong> ${teacher.email}</div>
                                <div><strong>Inscription :</strong> ${createdDate.toLocaleDateString('fr-FR', { 
                                    year: 'numeric', month: 'long', day: 'numeric', 
                                    hour: '2-digit', minute: '2-digit' 
                                })}</div>
                                <div><strong>Niveau :</strong> ${teacher.level || 1} | <strong>XP :</strong> ${teacher.xp || 0}</div>
                                <div><strong>Questions créées :</strong> ${teacher.stats?.questionsCreated || 0}</div>
                                <div><strong>Dernière activité :</strong> ${teacher.updatedAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Inconnue'}</div>
                            </div>
                            <div class="mt-2 p-2 bg-blue-100 rounded-lg">
                                <p class="text-xs text-blue-700">
                                    <strong>Limitations actuelles :</strong> Questions non auto-validées, 
                                    pas d'accès aux réponses des autres enseignants
                                </p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="CalculUpAdmin.validateTeacher('${teacher.id}', 'active')" 
                                    class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ✅ Validation complète
                            </button>
                            <button onclick="CalculUpAdmin.validateTeacher('${teacher.id}', 'suspended')" 
                                    class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ⏸️ Suspendre
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function displayValidatedTeachers(teachers) {
        const container = document.getElementById('validated-teachers-list');
        if (!container) return;
        
        if (teachers.length === 0) {
            container.innerHTML = `
                <div class="text-center text-stone-500 py-8">
                    <div class="text-4xl mb-4">📭</div>
                    <p>Aucune validation récente (30 derniers jours)</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = teachers.map(teacher => {
            const validatedDate = teacher.updatedAt?.toDate?.() || teacher.createdAt?.toDate?.() || new Date();
            
            return `
                <div class="teacher-card bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <h4 class="text-lg font-semibold text-stone-800 mr-3">
                                    ${teacher.firstname} (@${teacher.identifier})
                                </h4>
                                <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                                    ✅ Validé
                                </span>
                            </div>
                            <div class="text-sm space-y-1">
                                <div><strong>Email :</strong> ${teacher.email}</div>
                                <div><strong>Validé le :</strong> ${validatedDate.toLocaleDateString('fr-FR', { 
                                    year: 'numeric', month: 'long', day: 'numeric' 
                                })}</div>
                                <div><strong>Niveau :</strong> ${teacher.level || 1} | <strong>XP :</strong> ${teacher.xp || 0}</div>
                                <div><strong>Questions créées :</strong> ${teacher.stats?.questionsCreated || 0}</div>
                                ${teacher.validatedBy ? `<div><strong>Validé par :</strong> ${teacher.validatedBy}</div>` : ''}
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="CalculUpAdmin.suspendUser('${teacher.id}')" 
                                    class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                ⏸️ Suspendre
                            </button>
                            <button onclick="CalculUpAdmin.showUserDetails('${teacher.id}')" 
                                    class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                👁️ Voir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // ACTIONS ADMIN
    // =========================================================================

    async function validateTeacher(teacherId, newStatus) {
        try {
            CalculUpCore.showLoading('Traitement en cours...');
            
            const db = CalculUpCore.getDb();
            const teacherRef = db.collection('users').doc(teacherId);
            
            const teacherDoc = await teacherRef.get();
            if (!teacherDoc.exists) {
                throw new Error('Enseignant non trouvé');
            }
            
            const teacherData = teacherDoc.data();
            console.log('👤 Validation enseignant:', teacherData.identifier, 'Nouveau statut:', newStatus);
            
            const updates = {
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (newStatus === 'active') {
                updates.validatedAt = firebase.firestore.FieldValue.serverTimestamp();
                updates.validatedBy = CalculUpCore.getUser().identifier;
                
                const statusLabel = teacherData.status === 'provisional_access' ? 
                    'validation complète accordée' : 'compte activé';
                
                await teacherRef.update(updates);
                CalculUpCore.showSuccess(`✅ ${teacherData.firstname} (@${teacherData.identifier}) - ${statusLabel} !`);
                
            } else if (newStatus === 'rejected' || newStatus === 'suspended') {
                const action = newStatus === 'rejected' ? 'rejeté' : 'suspendu';
                updates.rejectedAt = firebase.firestore.FieldValue.serverTimestamp();
                updates.rejectedBy = CalculUpCore.getUser().identifier;
                updates.rejectionReason = `${action} par admin le ${new Date().toLocaleDateString('fr-FR')}`;
                
                await teacherRef.update(updates);
                CalculUpCore.showSuccess(`❌ ${teacherData.firstname} (@${teacherData.identifier}) - Compte ${action}`);
            }
            
            setTimeout(() => {
                console.log('🔄 Rechargement des données enseignants...');
                loadTeachersForValidation();
                loadAdminData();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erreur validation enseignant:', error);
            CalculUpCore.showError('Erreur lors de la validation : ' + error.message);
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    async function suspendUser(userId) {
        if (!confirm('Êtes-vous sûr de vouloir suspendre ce compte ?')) {
            return;
        }
        
        try {
            CalculUpCore.showLoading('Suspension du compte...');
            
            const db = CalculUpCore.getDb();
            const userRef = db.collection('users').doc(userId);
            
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                throw new Error('Utilisateur non trouvé');
            }
            
            const userData = userDoc.data();
            
            await userRef.update({
                status: 'suspended',
                suspendedAt: firebase.firestore.FieldValue.serverTimestamp(),
                suspendedBy: CalculUpCore.getUser().identifier,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            CalculUpCore.showSuccess(`⏸️ Compte ${userData.identifier} suspendu`);
            
            // Recharger les données
            setTimeout(() => {
                loadTeachersForValidation();
                loadAdminData();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erreur suspension:', error);
            CalculUpCore.showError('Erreur lors de la suspension');
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    async function searchUsers() {
        try {
            const searchTerm = document.getElementById('search-user')?.value.trim().toLowerCase();
            const typeFilter = document.getElementById('user-type-filter')?.value;
            const statusFilter = document.getElementById('user-status-filter')?.value;
            
            if (!searchTerm && !typeFilter && !statusFilter) {
                CalculUpCore.showError('Veuillez saisir un terme de recherche ou utiliser les filtres');
                return;
            }
            
            CalculUpCore.showLoading('Recherche en cours...');
            
            const db = CalculUpCore.getDb();
            let query = db.collection('users');
            
            if (typeFilter) {
                query = query.where('type', '==', typeFilter);
            }
            if (statusFilter) {
                query = query.where('status', '==', statusFilter);
            }
            
            const snapshot = await query.limit(100).get();
            let users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Filtrer côté client si terme de recherche
            if (searchTerm) {
                users = users.filter(user => 
                    user.identifier?.toLowerCase().includes(searchTerm) ||
                    user.email?.toLowerCase().includes(searchTerm) ||
                    user.firstname?.toLowerCase().includes(searchTerm)
                );
            }
            
            displaySearchResults(users);
            
        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            CalculUpCore.showError('Erreur de recherche');
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    function displaySearchResults(users) {
        const container = document.getElementById('users-list');
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="text-center text-stone-500 py-8">
                    <div class="text-4xl mb-4">🔍</div>
                    <p>Aucun utilisateur trouvé</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = users.map(user => {
            const statusColors = {
                'active': 'bg-emerald-100 text-emerald-700',
                'pending_verification': 'bg-amber-100 text-amber-700',
                'provisional_access': 'bg-blue-100 text-blue-700',
                'suspended': 'bg-red-100 text-red-700'
            };
            
            const typeIcons = {
                'student': '👨‍🎓',
                'teacher': '👩‍🏫',
                'admin': '👨‍💼'
            };
            
            return `
                <div class="bg-white border border-stone-200 rounded-xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <span class="text-2xl mr-3">${typeIcons[user.type] || '👤'}</span>
                                <h4 class="text-lg font-semibold text-stone-800 mr-3">
                                    ${user.firstname} (@${user.identifier})
                                </h4>
                                <span class="px-2 py-1 rounded-full text-xs ${statusColors[user.status] || 'bg-stone-100 text-stone-700'}">
                                    ${user.status || 'Inconnu'}
                                </span>
                            </div>
                            <div class="text-sm space-y-1">
                                <div><strong>Email :</strong> ${user.email}</div>
                                <div><strong>Type :</strong> ${user.type}</div>
                                <div><strong>Niveau :</strong> ${user.level || 1} | <strong>XP :</strong> ${user.xp || 0}</div>
                                <div><strong>Inscription :</strong> ${user.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Inconnue'}</div>
                                ${user.stats?.questionsCreated ? `<div><strong>Questions créées :</strong> ${user.stats.questionsCreated}</div>` : ''}
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            ${user.status !== 'suspended' ? `
                                <button onclick="CalculUpAdmin.suspendUser('${user.id}')" 
                                        class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                    ⏸️ Suspendre
                                </button>
                            ` : `
                                <button onclick="CalculUpAdmin.reactivateUser('${user.id}')" 
                                        class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                    ✅ Réactiver
                                </button>
                            `}
                            <button onclick="CalculUpAdmin.showUserDetails('${user.id}')" 
                                    class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                👁️ Détails
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function reactivateUser(userId) {
        if (!confirm('Êtes-vous sûr de vouloir réactiver ce compte ?')) {
            return;
        }
        
        try {
            CalculUpCore.showLoading('Réactivation du compte...');
            
            const db = CalculUpCore.getDb();
            const userRef = db.collection('users').doc(userId);
            
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                throw new Error('Utilisateur non trouvé');
            }
            
            const userData = userDoc.data();
            
            await userRef.update({
                status: 'active',
                reactivatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reactivatedBy: CalculUpCore.getUser().identifier,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            CalculUpCore.showSuccess(`✅ Compte ${userData.identifier} réactivé`);
            
            // Relancer la recherche
            setTimeout(searchUsers, 1000);
            
        } catch (error) {
            console.error('❌ Erreur réactivation:', error);
            CalculUpCore.showError('Erreur lors de la réactivation');
        } finally {
            CalculUpCore.hideLoading();
        }
    }

    // =========================================================================
    // AUTRES FONCTIONS D'INTERFACE - PLACEHOLDERS FONCTIONNELS
    // =========================================================================
    
    
    function showStatistics() {
        CalculUpCore.showInfo('Interface des statistiques en développement');
    }
    
    function showSystemSettings() {
        CalculUpCore.showInfo('Interface des paramètres système en développement');
    }

    function showUserDetails(userId) {
        CalculUpCore.showInfo(`Détails utilisateur ${userId} - Fonctionnalité en développement`);
    }
    
    // =========================================================================
    // FONCTIONS UTILITAIRES
    // =========================================================================
    
    function refreshDashboard() {
        showAdminDashboard();
    }
    
    function formatDate(timestamp) {
        if (!timestamp) return 'Date inconnue';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('fr-FR');
    }
    
    function getStatusBadge(status) {
        const badges = {
            'active': '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">Actif</span>',
            'pending_verification': '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">En attente</span>',
            'provisional_access': '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">Provisoire</span>',
            'suspended': '<span class="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs">Suspendu</span>'
        };
        return badges[status] || '<span class="bg-stone-100 text-stone-700 px-2 py-1 rounded-full text-xs">Inconnu</span>';
    }
    
    function getAdminData() {
        return adminData;
    }
    
    // =========================================================================
    // API PUBLIQUE - COMPLÈTE ET FONCTIONNELLE
    // =========================================================================
    
    return {
    // Interface principale
    showAdminDashboard,
    
    // Validation enseignants
    showTeacherValidationPanel,
    loadTeachersForValidation,
    validateTeacher,
    displayPendingTeachers,
    displayProvisionalTeachers,
    displayValidatedTeachers,
    
    // 🔧 CORRECTION : S'assurer que showQuestionValidation pointe vers la VRAIE fonction
    showQuestionValidation: showQuestionValidation,  // Explicitement pointer vers la vraie fonction
    loadQuestionsToValidate,           // 🆕 AJOUTER
    validateQuestion,                  // 🆕 AJOUTER  
    validateQuestionWithNote,          // 🆕 AJOUTER
    showModerationNoteModal,          // 🆕 AJOUTER
    
    // 🆕 Gestion des signalements - UTILISE MODULE REPORTS + SECOURS
    showReportsManagement,
    loadReportsDirectly,        // 🆕 NOUVEAU
    processReportFallback,      // 🆕 NOUVEAU
    
    // 🆕 Gestion des utilisateurs avec suspension
    showUserManagement,
    searchUsers,
    suspendUser,
    reactivateUser,
    showUserDetails,
    
    // Autres interfaces (SUPPRIMER les placeholders qui ne marchent pas)
    showStatistics,
    showSystemSettings,
    
    // Gestion des données
    loadAdminData,
    refreshDashboard,
    
    // Utilitaires
    formatDate,
    getStatusBadge,
    getAdminData
};
})();

console.log('✅ Module CalculUpAdmin chargé avec signalements et suspension complets');