/**
 * CALCUL UP - MODULE SIGNALEMENTS (VERSION COMPLÈTE)
 * Gestion complète des signalements pour questions et réponses
 */

window.CalculUpReports = (() => {
    'use strict';
    
    // =============================================================================
    // SIGNALEMENT DE QUESTIONS/RÉPONSES DEPUIS LE JEU
    // =============================================================================
    
    function showReportModal(itemId, type = 'question', currentAnswer = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 class="text-xl font-bold text-stone-800 mb-4">
                    🚨 Signaler un problème
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-stone-700 mb-2">
                            Type de problème :
                        </label>
                        <select id="report-type" class="w-full p-3 border border-stone-300 rounded-lg">
                            ${type === 'question' ? `
                                <option value="wrong_answer">Réponse incorrecte</option>
                                <option value="ambiguous">Question ambiguë</option>
                                <option value="typo">Faute de frappe</option>
                                <option value="inappropriate">Contenu inapproprié</option>
                                <option value="other">Autre problème</option>
                            ` : `
                                <option value="wrong_correction">Ma réponse était correcte</option>
                                <option value="system_error">Erreur du système</option>
                                <option value="unfair">Correction injuste</option>
                                <option value="other">Autre problème</option>
                            `}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-stone-700 mb-2">
                            Description détaillée :
                        </label>
                        <textarea id="report-description" 
                                  class="w-full p-3 border border-stone-300 rounded-lg h-24 resize-none"
                                  placeholder="Expliquez le problème en détail..."></textarea>
                    </div>
                    
                    ${currentAnswer ? `
                        <div class="bg-stone-50 p-3 rounded-lg">
                            <p class="text-sm text-stone-600">
                                <strong>Votre réponse :</strong> ${currentAnswer}
                            </p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors">
                        Annuler
                    </button>
                    <button onclick="CalculUpReports.submitReport('${itemId}', '${type}', ${currentAnswer ? `'${currentAnswer}'` : 'null'})" 
                            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                        🚨 Envoyer le signalement
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('report-description').focus();
    }
    
    async function submitReport(itemId, type, userAnswer = null) {
        try {
            const reportType = document.getElementById('report-type').value;
            const description = document.getElementById('report-description').value.trim();
            
            if (!description) {
                CalculUpCore.showError('Veuillez décrire le problème');
                return;
            }
            
            CalculUpCore.showLoading('Envoi du signalement...');
            
            const user = CalculUpCore.getUser();
            const db = CalculUpCore.getDb();
            
            const reportData = {
                itemId,
                itemType: type, // 'question' ou 'answer'
                reportType,
                description,
                userAnswer,
                reportedBy: user.uid,
                reporterName: user.firstname,
                reporterIdentifier: user.identifier,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: reportType === 'wrong_answer' || reportType === 'wrong_correction' ? 'high' : 'normal'
            };
            
            // Ajouter info question si disponible
            if (type === 'question' && window.gameState) {
                const currentQuestion = window.gameState.questions[window.gameState.currentQuestionIndex];
                if (currentQuestion && currentQuestion.id === itemId) {
                    reportData.questionText = currentQuestion.question;
                    reportData.questionCreator = currentQuestion.creator;
                    reportData.correctAnswer = currentQuestion.correctChoice !== undefined ? 
                        currentQuestion.choices[currentQuestion.correctChoice] : currentQuestion.answer;
                }
            }
            
            await db.collection('reports').add(reportData);
            
            CalculUpCore.hideLoading();
            CalculUpCore.showSuccess('✅ Signalement envoyé ! Il sera traité dans les meilleurs délais.');
            
            // Fermer le modal
            document.querySelector('.fixed.inset-0').remove();
            
            console.log('📨 Signalement envoyé:', reportData);
            
        } catch (error) {
            console.error('❌ Erreur envoi signalement:', error);
            CalculUpCore.hideLoading();
            CalculUpCore.showError('Erreur lors de l\'envoi du signalement');
        }
    }
    
    // =============================================================================
    // AFFICHAGE INDICE CORRIGÉ
    // =============================================================================
    
    function showHint(questionId) {
        if (!window.gameState || !window.gameState.questions) {
            CalculUpCore.showError('Question non trouvée');
            return;
        }
        
        const currentQuestion = window.gameState.questions[window.gameState.currentQuestionIndex];
        if (!currentQuestion || currentQuestion.id !== questionId) {
            CalculUpCore.showError('Question non trouvée');
            return;
        }
        
        if (!currentQuestion.hint) {
            CalculUpCore.showInfo('Aucun indice disponible pour cette question');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 class="text-xl font-bold text-stone-800 mb-4">
                    💡 Indice
                </h3>
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                    <p class="text-stone-700">${currentQuestion.hint}</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors">
                    Compris !
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // =============================================================================
    // INTERFACE GESTION SIGNALEMENTS - ADMIN ET ENSEIGNANTS
    // =============================================================================
    
    function showReportsManagement() {
        const user = CalculUpCore.getUser();
        
        // Vérifier les permissions
        const canManageReports = user.type === 'admin' || 
                                (user.type === 'teacher' && user.status === 'active' && (user.level || 1) >= 15);
        
        if (!canManageReports) {
            if (user.type === 'teacher') {
                CalculUpCore.showError('Vous devez avoir le niveau 15 minimum pour traiter les signalements');
            } else {
                CalculUpCore.showError('Accès non autorisé');
            }
            return;
        }
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <div class="flex justify-between items-center p-6 bg-white/80 border-b border-stone-200">
                    <div class="flex items-center">
                        <button onclick="CalculUpCore.navigateToScreen('${user.type === 'admin' ? 'admin-dashboard' : 'teacher-dashboard'}')" 
                                class="mr-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                            <span class="text-xl">←</span>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-stone-700">Gestion des Signalements</h1>
                            <p class="text-stone-500">
                                Traitement des problèmes signalés
                                ${user.type === 'teacher' ? `(+25 XP par signalement traité)` : ''}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="max-w-6xl mx-auto p-6 space-y-6">
                    <!-- Filtres -->
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <div class="flex flex-wrap gap-4">
                            <select id="status-filter" class="px-3 py-2 border border-stone-300 rounded-lg">
                                <option value="">Tous les statuts</option>
                                <option value="pending" selected>En attente</option>
                                <option value="in_progress">En cours</option>
                                <option value="resolved">Résolus</option>
                                <option value="rejected">Rejetés</option>
                            </select>
                            
                            <select id="type-filter" class="px-3 py-2 border border-stone-300 rounded-lg">
                                <option value="">Tous les types</option>
                                <option value="question">Questions</option>
                                <option value="answer">Réponses</option>
                            </select>
                            
                            <button onclick="CalculUpReports.loadReports()" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                🔄 Actualiser
                            </button>
                        </div>
                    </div>
                    
                    <!-- Liste des signalements -->
                    <div id="reports-list" class="space-y-4">
                        <div class="text-center py-8">
                            <div class="loading-spin mx-auto mb-2"></div>
                            <p>Chargement des signalements...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        loadReports();
    }
    
    async function loadReports() {
    try {
        console.log('📨 Début chargement signalements...');
        
        const db = CalculUpCore.getDb();
        if (!db) {
            throw new Error('Base de données non disponible');
        }
        
        const statusFilter = document.getElementById('status-filter')?.value;
        const typeFilter = document.getElementById('type-filter')?.value;
        
        console.log('🔍 Filtres appliqués:', { statusFilter, typeFilter });
        
        // 🆕 REQUÊTE SIMPLIFIÉE SANS ORDERBY (pour éviter les erreurs d'index)
        let query = db.collection('reports');
        
        // Appliquer les filtres UN PAR UN pour éviter les conflits
        if (statusFilter) {
            query = query.where('status', '==', statusFilter);
        } else {
            // Par défaut, prendre tous les statuts
            console.log('📋 Chargement de tous les signalements...');
        }
        
        if (typeFilter) {
            query = query.where('itemType', '==', typeFilter);
        }
        
        // 🆕 LIMITE PLUS ÉLEVÉE ET PAS D'ORDERBY POUR COMMENCER
        const snapshot = await query.limit(50).get();
        
        console.log('📊 Signalements trouvés:', snapshot.docs.length);
        
        if (snapshot.empty) {
            console.log('📭 Aucun signalement trouvé');
            displayReports([]);
            return;
        }
        
        const reports = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('📨 Signalement:', doc.id, data.reportType, data.status);
            return {
                id: doc.id,
                ...data
            };
        });
        
        // 🆕 TRI CÔTÉ CLIENT (plus fiable que Firestore)
        reports.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime(); // Plus récent en premier
        });
        
        console.log('✅ Signalements triés:', reports.length);
        displayReports(reports);
        
    } catch (error) {
        console.error('❌ Erreur chargement signalements:', error);
        
        // 🆕 AFFICHAGE D'ERREUR PLUS DÉTAILLÉ
        const container = document.getElementById('reports-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-red-600 py-8">
                    <div class="text-4xl mb-4">⚠️</div>
                    <p><strong>Erreur de chargement des signalements</strong></p>
                    <p class="text-sm mt-2 text-stone-600">Erreur: ${error.message}</p>
                    <div class="mt-4 space-y-2">
                        <button onclick="CalculUpReports.loadReports()" 
                                class="block mx-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            🔄 Réessayer
                        </button>
                        <button onclick="CalculUpReports.loadReportsSimple()" 
                                class="block mx-auto px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                            🔧 Mode simple (sans filtres)
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

async function loadReportsSimple() {
    try {
        console.log('📨 Chargement signalements mode simple...');
        
        const db = CalculUpCore.getDb();
        const snapshot = await db.collection('reports').limit(20).get();
        
        console.log('📊 Signalements trouvés (mode simple):', snapshot.docs.length);
        
        const reports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Tri côté client
        reports.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
        
        displayReports(reports);
        
    } catch (error) {
        console.error('❌ Erreur chargement simple:', error);
        CalculUpCore.showError('Impossible de charger les signalements: ' + error.message);
    }
}

async function debugReportsCount() {
    try {
        const db = CalculUpCore.getDb();
        
        // Compter tous les signalements
        const allReports = await db.collection('reports').get();
        console.log('🔍 DEBUG: Total signalements en BDD:', allReports.docs.length);
        
        // Compter par statut
        const pending = await db.collection('reports').where('status', '==', 'pending').get();
        const resolved = await db.collection('reports').where('status', '==', 'resolved').get();
        
        console.log('🔍 DEBUG: En attente:', pending.docs.length);
        console.log('🔍 DEBUG: Résolus:', resolved.docs.length);
        
        // Afficher quelques exemples
        allReports.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`🔍 DEBUG Exemple ${index + 1}:`, {
                id: doc.id,
                type: data.reportType,
                status: data.status,
                createdAt: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Pas de date'
            });
        });
        
        return {
            total: allReports.docs.length,
            pending: pending.docs.length,
            resolved: resolved.docs.length
        };
        
    } catch (error) {
        console.error('❌ Erreur debug:', error);
        return null;
    }
}

    
    function displayReports(reports) {
        const container = document.getElementById('reports-list');
        
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="text-center text-emerald-600 py-8">
                    <div class="text-4xl mb-4">✅</div>
                    <p>Aucun signalement à traiter</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = reports.map(report => {
            const createdDate = report.createdAt?.toDate?.() || new Date();
            const statusColor = {
                'pending': 'bg-amber-50 border-amber-200',
                'in_progress': 'bg-blue-50 border-blue-200', 
                'resolved': 'bg-emerald-50 border-emerald-200',
                'rejected': 'bg-red-50 border-red-200'
            };
            
            const priorityIcon = report.priority === 'high' ? '🔥' : '📋';
            
            return `
                <div class="report-card ${statusColor[report.status] || 'bg-stone-50 border-stone-200'} border rounded-xl p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center space-x-3">
                            <span class="text-2xl">${priorityIcon}</span>
                            <div>
                                <h3 class="font-semibold text-stone-800">
                                    ${getReportTypeLabel(report.reportType)} - ${getReportItemLabel(report.itemType)}
                                </h3>
                                <p class="text-sm text-stone-600">
                                    Signalé par ${report.reporterName} (@${report.reporterIdentifier})
                                    le ${createdDate.toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(report.status)}">
                            ${getStatusLabel(report.status)}
                        </span>
                    </div>
                    
                    ${report.questionText ? `
                        <div class="bg-white p-3 rounded-lg mb-3">
                            <p class="text-sm text-stone-700">
                                <strong>Question :</strong> ${report.questionText}
                            </p>
                            ${report.correctAnswer ? `
                                <p class="text-sm text-stone-700 mt-1">
                                    <strong>Réponse correcte :</strong> ${report.correctAnswer}
                                </p>
                            ` : ''}
                            ${report.userAnswer ? `
                                <p class="text-sm text-stone-700 mt-1">
                                    <strong>Réponse utilisateur :</strong> ${report.userAnswer}
                                </p>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="bg-white p-3 rounded-lg mb-4">
                        <p class="text-sm text-stone-700">
                            <strong>Description :</strong> ${report.description}
                        </p>
                    </div>
                    
                    ${report.status === 'pending' || report.status === 'in_progress' ? `
                        <div class="flex space-x-3">
                            <button onclick="CalculUpReports.processReport('${report.id}', 'in_progress')" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                📝 Prendre en charge
                            </button>
                            <button onclick="CalculUpReports.processReport('${report.id}', 'resolved')" 
                                    class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ✅ Résoudre
                            </button>
                            <button onclick="CalculUpReports.processReport('${report.id}', 'rejected')" 
                                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                                ❌ Rejeter
                            </button>
                            ${report.reportType === 'wrong_answer' || report.reportType === 'wrong_correction' ? `
                                <button onclick="CalculUpReports.showCorrectPointsModal('${report.id}')" 
                                        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                                    🔧 Corriger les points
                                </button>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="text-sm text-stone-600">
                            Traité par ${report.handledBy || 'Système'} 
                            ${report.handledAt ? `le ${report.handledAt.toDate().toLocaleDateString('fr-FR')}` : ''}
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }
    
    async function processReport(reportId, newStatus) {
        try {
            CalculUpCore.showLoading('Traitement du signalement...');
            
            const user = CalculUpCore.getUser();
            const db = CalculUpCore.getDb();
            const reportRef = db.collection('reports').doc(reportId);
            
            const updates = {
                status: newStatus,
                handledBy: user.identifier,
                handledAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await reportRef.update(updates);
            
            // Attribution XP pour le traitement (seulement pour enseignants)
            if (user.type === 'teacher') {
                const userRef = db.collection('users').doc(user.uid);
                await userRef.update({
                    xp: firebase.firestore.FieldValue.increment(25),
                    'stats.reportsHandled': firebase.firestore.FieldValue.increment(1)
                });
                
                CalculUpCore.showSuccess(`✅ Signalement traité ! +25 XP`);
                
                // Vérifier montée de niveau
                await CalculUpCore.checkLevelUp(user.uid, (user.xp || 0) + 25);
            } else {
                CalculUpCore.showSuccess(`✅ Signalement traité !`);
            }
            
            // Recharger la liste
            setTimeout(loadReports, 1000);
            
        } catch (error) {
            console.error('❌ Erreur traitement signalement:', error);
            CalculUpCore.showError('Erreur lors du traitement');
        } finally {
            CalculUpCore.hideLoading();
        }
    }
    
    function showCorrectPointsModal(reportId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 class="text-xl font-bold text-stone-800 mb-4">
                    🔧 Correction des points
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-stone-700 mb-2">
                            Action à effectuer :
                        </label>
                        <select id="correction-action" class="w-full p-3 border border-stone-300 rounded-lg">
                            <option value="add_points">Ajouter 10 points à l'utilisateur</option>
                            <option value="remove_points">Retirer 10 points à l'utilisateur</option>
                            <option value="no_change">Aucun changement de points</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-stone-700 mb-2">
                            Raison de la correction :
                        </label>
                        <textarea id="correction-reason" 
                                  class="w-full p-3 border border-stone-300 rounded-lg h-20 resize-none"
                                  placeholder="Expliquez pourquoi cette correction est nécessaire..."></textarea>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors">
                        Annuler
                    </button>
                    <button onclick="CalculUpReports.applyPointsCorrection('${reportId}')" 
                            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                        🔧 Appliquer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async function applyPointsCorrection(reportId) {
        try {
            const action = document.getElementById('correction-action').value;
            const reason = document.getElementById('correction-reason').value.trim();
            
            if (!reason) {
                CalculUpCore.showError('Veuillez expliquer la raison de la correction');
                return;
            }
            
            CalculUpCore.showLoading('Application de la correction...');
            
            const db = CalculUpCore.getDb();
            const user = CalculUpCore.getUser();
            
            // Récupérer le signalement pour avoir l'ID de l'utilisateur
            const reportDoc = await db.collection('reports').doc(reportId).get();
            const reportData = reportDoc.data();
            
            if (action !== 'no_change') {
                const pointsChange = action === 'add_points' ? 10 : -10;
                
                // Modifier les points de l'utilisateur qui a signalé
                await db.collection('users').doc(reportData.reportedBy).update({
                    'stats.totalScore': firebase.firestore.FieldValue.increment(pointsChange)
                });
            }
            
            // Marquer le signalement comme résolu avec détails
            await db.collection('reports').doc(reportId).update({
                status: 'resolved',
                correctionApplied: action,
                correctionReason: reason,
                handledBy: user.identifier,
                handledAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // XP pour l'enseignant/admin
            if (user.type === 'teacher') {
                await db.collection('users').doc(user.uid).update({
                    xp: firebase.firestore.FieldValue.increment(25),
                    'stats.reportsHandled': firebase.firestore.FieldValue.increment(1)
                });
            }
            
            CalculUpCore.hideLoading();
            CalculUpCore.showSuccess(`✅ Correction appliquée ! ${user.type === 'teacher' ? '+25 XP' : ''}`);
            
            // Fermer modal et recharger
            document.querySelector('.fixed.inset-0').remove();
            setTimeout(loadReports, 1000);
            
        } catch (error) {
            console.error('❌ Erreur correction points:', error);
            CalculUpCore.hideLoading();
            CalculUpCore.showError('Erreur lors de la correction');
        }
    }
    
    // =============================================================================
    // FONCTIONS UTILITAIRES
    // =============================================================================
    
    function getReportTypeLabel(type) {
        const labels = {
            'wrong_answer': 'Réponse incorrecte',
            'ambiguous': 'Question ambiguë',
            'typo': 'Faute de frappe',
            'inappropriate': 'Contenu inapproprié',
            'wrong_correction': 'Correction erronée',
            'system_error': 'Erreur système',
            'unfair': 'Correction injuste',
            'other': 'Autre'
        };
        return labels[type] || type;
    }
    
    function getReportItemLabel(type) {
        return type === 'question' ? 'Question' : 'Réponse';
    }
    
    function getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'in_progress': 'En cours',
            'resolved': 'Résolu',
            'rejected': 'Rejeté'
        };
        return labels[status] || status;
    }
    
    function getStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-amber-100 text-amber-700',
            'in_progress': 'bg-blue-100 text-blue-700',
            'resolved': 'bg-emerald-100 text-emerald-700',
            'rejected': 'bg-red-100 text-red-700'
        };
        return classes[status] || 'bg-stone-100 text-stone-700';
    }
    
    // =============================================================================
    // API PUBLIQUE
    // =============================================================================
    
    return {
        showReportModal,
        submitReport,
        showHint,
        showReportsManagement,
        loadReports,
    	loadReportsSimple,        // 🆕 NOUVEAU
    	debugReportsCount,        // 🆕 NOUVEAU
        processReport,
        showCorrectPointsModal,
        applyPointsCorrection
    };
})();

console.log('✅ Module CalculUpReports chargé');