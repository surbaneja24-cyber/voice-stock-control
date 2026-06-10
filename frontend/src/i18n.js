import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    welcome: "Welcome Back",
                    subtitle: "Sign in to continue to VoxStock",

                    exit: "Exit",

                    inventory:
                        "Intelligent inventory management through voice commands",

                    holdSpeak:
                        "Hold down to speak",

                    listening:
                        "Listening... (Release to send)",

                    recognizedCommand:
                        "Recognized Command",

                    gettingStarted:
                        "Getting Started",

                    instructionsSubtitle:
                        "Welcome to VoxStock. Follow these quick steps to start using voice commands.",

                    step1:
                        "Allow microphone access when your browser requests permission.",

                    step2:
                        "Press and hold the microphone button while speaking.",

                    step3:
                        "Speak naturally and clearly for better recognition.",

                    step4:
                        "Release the button to send your command to the AI.",

                    step5:
                        "Your recognized command will appear instantly below.",

                    homeTitle:
                        "Control your inventory with your voice",

                    homeDescription:
                        "VoxStock transforms voice commands into inventory actions, making warehouse management faster and smarter.",

                    signIn:
                        "Sign In",

                    createAccount:
                        "Create Account",

                    voiceCommands:
                        "Voice Commands",

                    realTimeProcessing:
                        "Real-Time Processing",

                    inventoryTracking:
                        "Inventory Tracking",
                    ready:
                        "Ready",

                    listeningStatus:
                        "Listening...",

                    processing:
                        "Processing...",

                    connectionError:
                        "Connection error",
                },
            },

            es: {
                translation: {
                    welcome: "Bienvenido",
                    subtitle:
                        "Inicia sesión para continuar en VoxStock",

                    exit: "Salir",

                    inventory:
                        "Gestión inteligente de inventario mediante comandos de voz",

                    holdSpeak:
                        "Mantén presionado para hablar",

                    listening:
                        "Escuchando... (Suelta para enviar)",

                    recognizedCommand:
                        "Comando Reconocido",

                    gettingStarted:
                        "Primeros Pasos",

                    instructionsSubtitle:
                        "Bienvenido a VoxStock. Sigue estos sencillos pasos para empezar a utilizar los comandos de voz.",

                    step1:
                        "Permite el acceso al micrófono cuando el navegador lo solicite.",

                    step2:
                        "Mantén pulsado el botón del micrófono mientras hablas.",

                    step3:
                        "Habla de forma clara y natural para mejorar el reconocimiento.",

                    step4:
                        "Suelta el botón para enviar el comando a la IA.",

                    step5:
                        "El comando reconocido aparecerá automáticamente debajo.",

                    homeTitle:
                        "Controla tu inventario con tu voz",

                    homeDescription:
                        "VoxStock transforma comandos de voz en acciones de inventario, haciendo la gestión de almacenes más rápida e inteligente.",

                    signIn:
                        "Iniciar Sesión",

                    createAccount:
                        "Crear Cuenta",

                    voiceCommands:
                        "Comandos de Voz",

                    realTimeProcessing:
                        "Procesamiento en Tiempo Real",

                    inventoryTracking:
                        "Seguimiento de Inventario",
                    ready:
                        "Listo",

                    listeningStatus:
                        "Escuchando...",

                    processing:
                        "Procesando...",

                    connectionError:
                        "Error de conexión",
                },
            },

            fr: {
                translation: {
                    welcome: "Bienvenue",

                    subtitle:
                        "Connectez-vous pour continuer sur VoxStock",

                    exit: "Quitter",

                    inventory:
                        "Gestion intelligente des stocks par commandes vocales",

                    holdSpeak:
                        "Maintenez pour parler",

                    listening:
                        "Écoute en cours...",

                    recognizedCommand:
                        "Commande Reconnue",

                    gettingStarted:
                        "Premiers Pas",

                    instructionsSubtitle:
                        "Bienvenue sur VoxStock. Suivez ces étapes rapides pour commencer à utiliser les commandes vocales.",

                    step1:
                        "Autorisez l'accès au microphone lorsque le navigateur le demande.",

                    step2:
                        "Maintenez le bouton du microphone enfoncé pendant que vous parlez.",

                    step3:
                        "Parlez clairement et naturellement pour une meilleure reconnaissance.",

                    step4:
                        "Relâchez le bouton pour envoyer la commande à l'IA.",

                    step5:
                        "La commande reconnue apparaîtra automatiquement ci-dessous.",

                    homeTitle:
                        "Contrôlez votre inventaire avec votre voix",

                    homeDescription:
                        "VoxStock transforme les commandes vocales en actions d'inventaire pour une gestion plus rapide et plus intelligente.",

                    signIn:
                        "Connexion",

                    createAccount:
                        "Créer un compte",

                    voiceCommands:
                        "Commandes Vocales",

                    realTimeProcessing:
                        "Traitement en Temps Réel",

                    inventoryTracking:
                        "Suivi des Stocks",
                    ready:
                        "Prêt",

                    listeningStatus:
                        "Écoute...",

                    processing:
                        "Traitement...",

                    connectionError:
                        "Erreur de connexion",
                },
            },
            de: {
                translation: {
                    welcome: "Willkommen",

                    subtitle:
                        "Melden Sie sich an, um VoxStock zu nutzen",

                    exit: "Beenden",

                    inventory:
                        "Intelligente Lagerverwaltung per Sprachbefehl",

                    holdSpeak:
                        "Gedrückt halten zum Sprechen",

                    listening:
                        "Hört zu...",

                    recognizedCommand:
                        "Erkannter Befehl",

                    gettingStarted:
                        "Erste Schritte",

                    instructionsSubtitle:
                        "Willkommen bei VoxStock. Befolgen Sie diese Schritte, um Sprachbefehle zu verwenden.",

                    step1:
                        "Erlauben Sie den Mikrofonzugriff, wenn der Browser danach fragt.",

                    step2:
                        "Halten Sie die Mikrofontaste gedrückt, während Sie sprechen.",

                    step3:
                        "Sprechen Sie deutlich und natürlich für eine bessere Erkennung.",

                    step4:
                        "Lassen Sie die Taste los, um den Befehl an die KI zu senden.",

                    step5:
                        "Der erkannte Befehl erscheint automatisch unten.",

                    homeTitle:
                        "Steuern Sie Ihr Inventar mit Ihrer Stimme",

                    homeDescription:
                        "VoxStock wandelt Sprachbefehle in Inventuraktionen um und macht die Lagerverwaltung schneller und intelligenter.",

                    signIn:
                        "Anmelden",

                    createAccount:
                        "Konto erstellen",

                    voiceCommands:
                        "Sprachbefehle",

                    realTimeProcessing:
                        "Echtzeitverarbeitung",

                    inventoryTracking:
                        "Bestandsverfolgung",
                    ready:
                        "Bereit",

                    listeningStatus:
                        "Hört zu...",

                    processing:
                        "Verarbeitung...",

                    connectionError:
                        "Verbindungsfehler",

                },
            },
        },



        lng: localStorage.getItem("language") || "en",
        fallbackLng: "en",

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
