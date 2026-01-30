/**
 * CalculUp Auth Module - Module d'authentification corrigé
 * Résout les erreurs Firestore et permissions
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

let selectedUserType = 'student';
let isRegistrationMode = false;

// ========================================
// API PUBLIQUE
// ========================================

window.CalculUpAuth = {
    // Interface
    showLoginScreen,
    
    // Actions utilisateur
    selectUserType,
    toggleAuthMode,
    handleAuth,
    handleLogout,
    resetPassword,
    
    // Validation
    validateEmail,
    validatePassword,
    validateFirstname,
    
    // Utilitaires
    generateUniqueIdentifier,
    
    // État
    getSelectedType: () => selectedUserType,
    isInRegistrationMode: () => isRegistrationMode
};

// ========================================
// INTERFACE PRINCIPALE
// ========================================

function showLoginScreen() {
    console.log('📝 Affichage écran de connexion');
    
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-stone-50 to-sky-50 flex items-center justify-center p-4">
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent mb-2">
                        Calcul Up
                    </h1>
                    <p class="text-stone-600">
                        Plateforme d'entraînement mathématique
                    </p>
                </div>

                <!-- Sélection type utilisateur avec slider -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-stone-700 mb-3">
                        Je suis :
                    </label>
                    <div class="relative bg-stone-100 rounded-xl p-1">
                        <!-- Slider de fond -->
                        <div id="user-type-slider" class="absolute top-1 left-1 w-1/3 h-10 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out"></div>
                        
                        <!-- Boutons type -->
                        <div class="relative flex">
                            <button 
                                id="type-student" 
                                onclick="CalculUpAuth.selectUserType('student')"
                                class="flex-1 px-3 py-2 text-sm rounded-lg transition-colors duration-300 relative z-10 font-medium text-emerald-600"
                            >
                                👨‍🎓 Élève
                            </button>
                            <button 
                                id="type-teacher" 
                                onclick="CalculUpAuth.selectUserType('teacher')"
                                class="flex-1 px-3 py-2 text-sm rounded-lg transition-colors duration-300 relative z-10 font-medium text-stone-500"
                            >
                                👩‍🏫 Enseignant
                            </button>
                            <button 
                                id="type-admin" 
                                onclick="CalculUpAuth.selectUserType('admin')"
                                class="flex-1 px-3 py-2 text-sm rounded-lg transition-colors duration-300 relative z-10 font-medium text-stone-500"
                            >
                                👨‍💼 Admin
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Formulaire -->
                <form id="auth-form" onsubmit="CalculUpAuth.handleAuth(event)">
                    <!-- Prénom (inscription seulement) -->
                    <div id="firstname-field" class="mb-4" style="display: none;">
                        <label for="auth-firstname" class="block text-sm font-medium text-stone-700 mb-2">
                            Prénom
                        </label>
                        <input 
                            type="text" 
                            id="auth-firstname" 
                            class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="Votre prénom"
                            autocomplete="given-name"
                        >
                    </div>

                    <!-- Email -->
                    <div class="mb-4">
                        <label for="auth-email" class="block text-sm font-medium text-stone-700 mb-2">
                            Adresse email
                        </label>
                        <input 
                            type="email" 
                            id="auth-email" 
                            required 
                            class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="votre@email.com"
                            autocomplete="email"
                        >
                        <div id="email-hint" class="text-xs text-amber-600 mt-1" style="display: none;">
                            Les enseignants doivent utiliser une adresse email académique (@ac-*.fr, @univ-*.fr, etc.)
                        </div>
                    </div>

                    <!-- Mot de passe -->
                    <div class="mb-6">
                        <label for="auth-password" class="block text-sm font-medium text-stone-700 mb-2">
                            Mot de passe
                        </label>
                        <input 
                            type="password" 
                            id="auth-password" 
                            required 
                            class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            autocomplete="current-password"
                        >
                        <div id="password-hint" class="text-xs text-stone-500 mt-1" style="display: none;">
                            Au moins 6 caractères
                        </div>
                    </div>

                    <!-- Bouton principal -->
                    <button 
                        type="submit" 
                        id="auth-submit"
                        class="w-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                        Se connecter
                    </button>

                    <!-- Basculer mode -->
                    <div class="text-center mt-4">
                        <button 
                            type="button" 
                            id="toggle-mode"
                            onclick="CalculUpAuth.toggleAuthMode()"
                            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                        >
                            Créer un compte
                        </button>
                    </div>

                    <!-- Mot de passe oublié (connexion seulement) -->
                    <div id="forgot-password" class="text-center mt-2">
                        <button 
                            type="button" 
                            onclick="CalculUpAuth.resetPassword()"
                            class="text-stone-500 hover:text-stone-700 text-xs transition-colors"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                </form>

                <!-- Info administrateur -->
                <div id="admin-info" class="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-200" style="display: none;">
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 text-violet-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-sm font-medium text-violet-800">Accès Administrateur</h4>
                            <p class="text-xs text-violet-600 mt-1">
                                Les comptes administrateur sont créés manuellement. 
                                Contactez l'équipe technique pour obtenir un accès admin.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Info enseignant -->
                <div id="teacher-info" class="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200" style="display: none;">
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-sm font-medium text-amber-800">Compte Enseignant</h4>
                            <p class="text-xs text-amber-600 mt-1">
                                Votre compte sera vérifié par un administrateur avant activation. 
                                Utilisez votre adresse email académique officielle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialiser l'interface
    updateAuthInterface();
}

// ========================================
// GESTION TYPES UTILISATEUR
// ========================================

function selectUserType(type) {
    console.log('👤 Type sélectionné:', type);
    selectedUserType = type;
    
    // Mettre à jour l'interface selon le type
    updateAuthInterface();
}

function updateAuthInterface() {
    const emailInput = document.getElementById('auth-email');
    const emailHint = document.getElementById('email-hint');
    const adminInfo = document.getElementById('admin-info');
    const teacherInfo = document.getElementById('teacher-info');
    const slider = document.getElementById('user-type-slider');
    
    // Réinitialiser
    emailHint.style.display = 'none';
    adminInfo.style.display = 'none';
    teacherInfo.style.display = 'none';
    
    // Afficher les infos selon le type
    if (selectedUserType === 'teacher') {
        emailHint.style.display = 'block';
        if (isRegistrationMode) {
            teacherInfo.style.display = 'block';
        }
    } else if (selectedUserType === 'admin') {
        adminInfo.style.display = 'block';
    }
    
    // Mettre à jour le slider et les couleurs des boutons
    const buttons = {
        'student': document.getElementById('type-student'),
        'teacher': document.getElementById('type-teacher'), 
        'admin': document.getElementById('type-admin')
    };
    
    // Réinitialiser tous les boutons
    Object.values(buttons).forEach(btn => {
        if (btn) {
            btn.className = 'flex-1 px-3 py-2 text-sm rounded-lg transition-colors duration-300 relative z-10 font-medium text-stone-500';
        }
    });
    
    // Activer le bouton sélectionné
    if (buttons[selectedUserType]) {
        buttons[selectedUserType].className = 'flex-1 px-3 py-2 text-sm rounded-lg transition-colors duration-300 relative z-10 font-medium text-emerald-600';
    }
    
    // Animer le slider
    if (slider) {
        const positions = {
            'student': 'translateX(0%)',
            'teacher': 'translateX(100%)',
            'admin': 'translateX(200%)'
        };
        slider.style.transform = positions[selectedUserType] || positions['student'];
    }
}

// ========================================
// GESTION MODES CONNEXION/INSCRIPTION
// ========================================

function toggleAuthMode() {
    isRegistrationMode = !isRegistrationMode;
    console.log('🔄 Mode basculé vers:', isRegistrationMode ? 'inscription' : 'connexion');
    
    const firstnameField = document.getElementById('firstname-field');
    const submitButton = document.getElementById('auth-submit');
    const toggleButton = document.getElementById('toggle-mode');
    const forgotPassword = document.getElementById('forgot-password');
    const passwordHint = document.getElementById('password-hint');
    
    if (isRegistrationMode) {
        // Mode inscription
        firstnameField.style.display = 'block';
        submitButton.textContent = 'Créer mon compte';
        toggleButton.textContent = 'J\'ai déjà un compte';
        forgotPassword.style.display = 'none';
        passwordHint.style.display = 'block';
        document.getElementById('auth-password').setAttribute('autocomplete', 'new-password');
    } else {
        // Mode connexion
        firstnameField.style.display = 'none';
        submitButton.textContent = 'Se connecter';
        toggleButton.textContent = 'Créer un compte';
        forgotPassword.style.display = 'block';
        passwordHint.style.display = 'none';
        document.getElementById('auth-password').setAttribute('autocomplete', 'current-password');
    }
    
    // Mettre à jour l'interface selon le type
    updateAuthInterface();
}

// ========================================
// GESTION AUTHENTIFICATION
// ========================================

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    
    // Détecter le mode depuis l'interface (plus fiable)
    const submitButton = document.getElementById('auth-submit');
    const isCurrentlyRegistration = submitButton.textContent === 'Créer mon compte';
    
    console.log('🔍 Mode détecté:', isCurrentlyRegistration ? 'inscription' : 'connexion');
    console.log('🔍 isRegistrationMode variable:', isRegistrationMode);
    
    if (!validateEmail(email)) {
        CalculUpCore.showError('Adresse email invalide');
        return;
    }
    
    if (!validatePassword(password)) {
        CalculUpCore.showError('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    CalculUpCore.showLoading(isCurrentlyRegistration ? 'Création du compte...' : 'Connexion...');
    
    try {
        if (isCurrentlyRegistration) {
            // INSCRIPTION
            const firstname = document.getElementById('auth-firstname').value.trim();
            
            if (!validateFirstname(firstname)) {
                CalculUpCore.showError('Le prénom doit contenir au moins 2 caractères');
                return;
            }
            
            if (selectedUserType === 'teacher') {
                // Vérification email académique avec fallback
                const isAcademicEmail = CalculUpData?.isAcademicEmail ? 
                    CalculUpData.isAcademicEmail(email) : 
                    isBasicAcademicEmail(email);
                    
                if (!isAcademicEmail) {
                    CalculUpCore.showError('Les enseignants doivent utiliser une adresse email académique (@ac-*.fr, @univ-*.fr, etc.)');
                    return;
                }
            }
            
            await handleRegister(email, password, firstname, selectedUserType);
        } else {
            // CONNEXION
            await handleLogin(email, password);
        }
    } catch (error) {
        console.error('❌ Erreur auth:', error);
        CalculUpCore.showError(CalculUpCore.formatError(error));
    } finally {
        CalculUpCore.hideLoading();
    }
}

async function handleRegister(email, password, firstname, userType) {
    console.log('📝 Création compte:', email, 'Type:', userType);
    
    try {
        // 1. Générer l'identifiant avec fallback simple
        const identifier = await generateUniqueIdentifier(firstname);
        console.log('🆔 Identifiant généré:', identifier);

        // 2. Créer le compte Firebase Auth
        console.log('🔥 Création compte Firebase...');
        const userCredential = await CalculUpCore.getAuth().createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        console.log('✅ Compte Firebase créé, UID:', firebaseUser.uid);

        // 3. Créer le profil Firestore avec structure propre (pas de undefined)
        const baseUserData = {
            email: email,
            firstname: firstname,
            identifier: identifier,
            type: userType,
            status: userType === 'teacher' ? 'pending_verification' : 'active',
            level: 1,
            xp: 0,
            streak: 0,
            unlockedFeatures: [],
            stats: {
                totalQuestions: 0,
                correctAnswers: 0,
                accuracy: 0,
                averageTime: 0,
                sessionsThisWeek: 0,
                currentStreak: 0,
                questionsCreated: 0,
                questionsReported: 0,
                reportsValidated: 0
            },
            preferences: {
                seenNotions: {},
                favoriteChapters: []
            },
            createdQuestions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 4. Ajouter les champs spécifiques selon le type SANS undefined
        if (userType === 'student') {
            baseUserData.schoolLevel = 'seconde';
        } else if (userType === 'teacher') {
            baseUserData.subject = 'Mathématiques';
            baseUserData.stats.studentsHelped = 0;
            baseUserData.stats.totalViews = 0;
            
            // 🆕 Validation intelligente enseignant
            const isAcademicEmail = CalculUpData?.isAcademicEmail ? 
                CalculUpData.isAcademicEmail(email) : 
                isBasicAcademicEmail(email);
                
            if (isAcademicEmail) {
                baseUserData.status = 'provisional_access';  // Accès provisoire pour email académique
                baseUserData.verificationLevel = 'email_verified';
                console.log('✅ Email académique détecté - Accès provisoire accordé');
            } else {
                baseUserData.status = 'pending_verification';  // Validation complète requise
                baseUserData.verificationLevel = 'pending';
                console.log('⏳ Email non-académique - Validation admin requise');
            }
        } else if (userType === 'admin') {
            baseUserData.adminPermissions = ['full_access'];
            baseUserData.stats.questionsValidated = 0;
            baseUserData.stats.teachersValidated = 0;
            baseUserData.stats.reportsProcessed = 0;
            baseUserData.stats.usersManaged = 0;
        }

        console.log('💾 Sauvegarde profil utilisateur...');
        await CalculUpCore.getDb().collection('users').doc(firebaseUser.uid).set(baseUserData);
        console.log('✅ Profil utilisateur sauvegardé');

        // 5. Si enseignant, créer notification admin pour validation complète
        if (userType === 'teacher') {
            console.log('📧 Création notification admin...');
            await CalculUpCore.getDb().collection('admin_notifications').add({
                type: 'teacher_verification',
                userId: firebaseUser.uid,
                userEmail: email,
                identifier: identifier,
                status: 'pending',
                accessLevel: baseUserData.status, // 'provisional_access' ou 'pending_verification'
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Notification admin créée');
        }

        // 6. L'utilisateur est automatiquement géré par handleAuthStateChange

        // 7. Afficher succès et rediriger selon le statut
        const userTypeLabel = userType === 'student' ? 'élève' : userType === 'teacher' ? 'enseignant' : 'administrateur';
        
        if (userType === 'teacher') {
            if (baseUserData.status === 'provisional_access') {
                CalculUpCore.showSuccess(`✅ Compte ${userTypeLabel} créé avec accès provisoire ! Validation admin en cours.`);
                // Rester connecté - navigation automatique gérée par handleAuthStateChange()
            } else {
                CalculUpCore.showSuccess(`⏳ Compte ${userTypeLabel} créé ! En attente de validation par un administrateur.`);
                // Déconnecter car compte en attente complète
                await CalculUpCore.getAuth().signOut();
                showLoginScreen();
            }
        } else {
            CalculUpCore.showSuccess(`✅ Compte ${userTypeLabel} créé avec succès !`);
            // Navigation automatique gérée par handleAuthStateChange()
        }

    } catch (error) {
        console.error('❌ Erreur création compte:', error);
        CalculUpCore.showError(CalculUpCore.formatError(error));
        
        // Nettoyage en cas d'erreur
        try {
            const currentUser = CalculUpCore.getAuth().currentUser;
            if (currentUser) {
                await currentUser.delete();
                console.log('🧹 Compte Firebase nettoyé après erreur');
            }
        } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage:', cleanupError);
        }
    }
}

async function handleLogin(email, password) {
    console.log('🔑 Connexion:', email);
    
    try {
        const userCredential = await CalculUpCore.getAuth().signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        console.log('✅ Connexion Firebase réussie, UID:', firebaseUser.uid);
        
        // Récupérer le profil utilisateur
        const userDoc = await CalculUpCore.getDb().collection('users').doc(firebaseUser.uid).get();
        
        if (!userDoc.exists) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        const userData = { uid: firebaseUser.uid, ...userDoc.data() };
        console.log('✅ Profil utilisateur récupéré:', userData.identifier);
        
        // 🆕 MIGRATION AUTOMATIQUE : Mettre à jour les comptes enseignants existants
        if (userData.type === 'teacher' && userData.status === 'pending_verification') {
            console.log('🔄 Migration compte enseignant...');
            
            const isAcademicEmail = CalculUpData?.isAcademicEmail ? 
                CalculUpData.isAcademicEmail(userData.email) : 
                isBasicAcademicEmail(userData.email);
                
            if (isAcademicEmail) {
                console.log('✅ Email académique détecté - Mise à jour vers accès provisoire');
                
                // Mettre à jour le statut dans Firestore
                await CalculUpCore.getDb().collection('users').doc(firebaseUser.uid).update({
                    status: 'provisional_access',
                    verificationLevel: 'email_verified',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Mettre à jour les données locales
                userData.status = 'provisional_access';
                userData.verificationLevel = 'email_verified';
                
                console.log('✅ Migration terminée - Accès provisoire accordé');
            }
        }
        
        // Vérifier le statut du compte
        if (userData.status === 'pending_verification') {
            CalculUpCore.showError('Votre compte est en attente de validation par un administrateur');
            await CalculUpCore.getAuth().signOut();
            return;
        }
        
        if (userData.status === 'suspended') {
            CalculUpCore.showError('Votre compte a été suspendu. Contactez un administrateur');
            await CalculUpCore.getAuth().signOut();
            return;
        }
        
        // 🆕 Gestion accès provisoire enseignant
        if (userData.status === 'provisional_access') {
            CalculUpCore.showSuccess(`👋 Bon retour ${userData.firstname} ! (Accès provisoire - validation en cours)`);
        } else {
            CalculUpCore.showSuccess(`👋 Bon retour ${userData.firstname} !`);
        }
        
        // Navigation automatique gérée par handleAuthStateChange() - pas besoin de CalculUpCore.saveUser
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        
        if (error.code === 'auth/user-not-found') {
            throw new Error('Aucun compte trouvé avec cette adresse email');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('Mot de passe incorrect');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Trop de tentatives. Réessayez plus tard');
        } else {
            throw error;
        }
    }
}

async function handleLogout() {
    try {
        CalculUpCore.showLoading('Déconnexion...');
        await CalculUpCore.getAuth().signOut();
        console.log('✅ Déconnexion réussie');
        CalculUpCore.showSuccess('👋 À bientôt !');
    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        CalculUpCore.showError('Erreur lors de la déconnexion');
    } finally {
        CalculUpCore.hideLoading();
    }
}

async function resetPassword() {
    const email = document.getElementById('auth-email').value.trim();
    
    if (!email) {
        CalculUpCore.showError('Veuillez saisir votre adresse email');
        return;
    }
    
    if (!validateEmail(email)) {
        CalculUpCore.showError('Adresse email invalide');
        return;
    }
    
    try {
        CalculUpCore.showLoading('Envoi de l\'email...');
        await CalculUpCore.getAuth().sendPasswordResetEmail(email);
        CalculUpCore.showSuccess('📧 Email de réinitialisation envoyé !');
    } catch (error) {
        console.error('❌ Erreur reset:', error);
        if (error.code === 'auth/user-not-found') {
            CalculUpCore.showError('Aucun compte trouvé avec cette adresse email');
        } else {
            CalculUpCore.showError('Erreur lors de l\'envoi de l\'email');
        }
    } finally {
        CalculUpCore.hideLoading();
    }
}

// ========================================
// VALIDATION
// ========================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateFirstname(firstname) {
    return firstname && firstname.trim().length >= 2;
}

// Validation email académique basique (fallback si CalculUpData n'est pas disponible)
function isBasicAcademicEmail(email) {
    const academicDomains = [
        '@ac-', '@univ-', '@ens-', '@cnam.fr', '@education.gouv.fr',
        '@ensam.fr', '@polytechnique.fr', '@mines-', '@telecom-',
        '@supelec.fr', '@centralesupelec.fr', '@insa-', '@ensta',
        '@enpc.fr', '@ensae.fr', '@ece.fr', '@ecp.fr'
    ];
    
    return academicDomains.some(domain => email.toLowerCase().includes(domain));
}

// ========================================
// GÉNÉRATION IDENTIFIANTS - SIMPLIFIED
// ========================================

async function generateUniqueIdentifier(firstName) {
    try {
        // Nettoyer le prénom
        const cleanFirstName = firstName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
            .replace(/[^a-z]/g, '') // Garder seulement lettres
            .slice(0, 15); // Max 15 caractères
        
        // Capitaliser première lettre
        const formattedName = cleanFirstName.charAt(0).toUpperCase() + cleanFirstName.slice(1);
        
        // Générer identifiant avec timestamp pour éviter les conflits
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000) + 100; // 100-999
        const identifier = `@${formattedName}${timestamp}${randomNum}`;
        
        console.log('🆔 Identifiant généré (simple):', identifier);
        return identifier;
        
    } catch (error) {
        console.error('❌ Erreur génération identifiant:', error);
        // Fallback ultra simple
        const timestamp = Date.now();
        return `@User${timestamp}`;
    }
}

// ========================================
// INITIALISATION
// ========================================

/*
🎓 SYSTÈME D'ACCÈS PROVISOIRE ENSEIGNANT :

Statuts possibles :
- 'active' : Accès complet (élèves, admins)
- 'provisional_access' : Enseignant avec email académique - accès limité
- 'pending_verification' : Enseignant sans email académique - pas d'accès
- 'suspended' : Compte suspendu

Limitations accès provisoire (à implémenter côté interface) :
- ✅ Peut créer des questions (max 10/jour)
- ✅ Peut voir ses statistiques
- ❌ Ne peut pas voir les données d'autres enseignants
- ❌ Ne peut pas accéder aux outils admin
- 🔄 Bannière "Validation en cours" affichée

Pour vérifier le statut côté interface :
const user = CalculUpCore.getUser();
if (user.status === 'provisional_access') {
    // Afficher limitations + bannière
}
*/

console.log('✅ Module CalculUpAuth chargé');