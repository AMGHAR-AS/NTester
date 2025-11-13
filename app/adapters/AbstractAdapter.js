/**
 * AbstractAdapter - Interface commune pour tous les adapters de terminal
 *
 * Tous les adapters doivent implémenter cette interface pour être compatibles
 * avec le système de rendu de NTester.
 */
export default class AbstractAdapter {
    constructor(options = {}) {
        this.options = options;
        this._content = {};
        this._currentConsole = null;
    }

    // =========================================================================
    // CORE METHODS - Doivent être implémentés par tous les adapters
    // =========================================================================

    /**
     * Efface l'écran du terminal
     */
    clear() {
        throw new Error('Method clear() must be implemented');
    }

    /**
     * Définit le contenu pour un ID donné
     * @param {string} id - Identifiant du contenu
     * @param {Array|Object} content - Contenu à stocker
     */
    setContent(id, content) {
        if (!Array.isArray(content)) {
            content = [content];
        }
        this._content[id] = content;
    }

    /**
     * Affiche le contenu correspondant à un ID
     * @param {string} id - Identifiant du contenu à afficher
     */
    setConsole(id) {
        throw new Error('Method setConsole() must be implemented');
    }

    /**
     * Quitte proprement l'application
     */
    exit() {
        throw new Error('Method exit() must be implemented');
    }

    /**
     * Active le mode plein écran
     */
    fullScreen() {
        // Optionnel - peut être ignoré par certains adapters
    }

    // =========================================================================
    // DISPLAY METHODS - Méthodes d'affichage de base
    // =========================================================================

    /**
     * Affiche du texte simple
     * @param {string} text - Texte à afficher
     * @param {Object} options - Options de style (color, bold, etc.)
     */
    displayText(text, options = {}) {
        throw new Error('Method displayText() must be implemented');
    }

    /**
     * Affiche un tableau
     * @param {Array} data - Données du tableau
     * @param {Object} options - Options du tableau (border, headers, etc.)
     */
    displayTable(data, options = {}) {
        throw new Error('Method displayTable() must be implemented');
    }

    /**
     * Affiche une liste interactive
     * @param {Array} items - Items de la liste
     * @param {Object} options - Options de la liste
     * @param {Function} callback - Callback appelé lors de la sélection
     */
    displayList(items, options = {}, callback) {
        throw new Error('Method displayList() must be implemented');
    }

    /**
     * Affiche un spinner de chargement
     * @param {string} text - Texte du spinner
     * @returns {Object} Instance du spinner (avec méthodes stop/succeed/fail)
     */
    displaySpinner(text) {
        throw new Error('Method displaySpinner() must be implemented');
    }

    /**
     * Affiche une barre de progression
     * @param {Object} options - Options de la progress bar
     * @returns {Object} Instance de la progress bar (avec méthode update)
     */
    displayProgress(options = {}) {
        throw new Error('Method displayProgress() must be implemented');
    }

    // =========================================================================
    // INTERACTIVE METHODS - Méthodes d'interaction utilisateur
    // =========================================================================

    /**
     * Pose une question à l'utilisateur
     * @param {string} question - Question à poser
     * @param {Object} options - Options du prompt
     * @returns {Promise<string>} Réponse de l'utilisateur
     */
    async prompt(question, options = {}) {
        throw new Error('Method prompt() must be implemented');
    }

    /**
     * Affiche un menu de sélection
     * @param {Array} choices - Choix disponibles
     * @param {Object} options - Options du menu
     * @returns {Promise<any>} Choix sélectionné
     */
    async select(choices, options = {}) {
        throw new Error('Method select() must be implemented');
    }

    /**
     * Demande une confirmation oui/non
     * @param {string} question - Question de confirmation
     * @returns {Promise<boolean>} true si oui, false sinon
     */
    async confirm(question) {
        throw new Error('Method confirm() must be implemented');
    }

    // =========================================================================
    // UTILITY METHODS - Méthodes utilitaires
    // =========================================================================

    /**
     * Parse et formate le contenu selon le type
     * @param {*} content - Contenu à parser
     * @returns {Object} Contenu parsé avec type
     */
    _parseContent(content) {
        if (typeof content === 'string' || typeof content === 'number') {
            return { type: 'text', value: String(content) };
        }

        if (typeof content === 'object' && content.type) {
            return content;
        }

        return { type: 'text', value: JSON.stringify(content) };
    }

    /**
     * Obtient le contenu pour un ID donné
     * @param {string} id - Identifiant du contenu
     * @returns {Array} Contenu ou tableau vide
     */
    _getContent(id) {
        return this._content[id] || [];
    }

    /**
     * Vérifie si un ID de contenu existe
     * @param {string} id - Identifiant à vérifier
     * @returns {boolean} true si existe
     */
    _hasContent(id) {
        return !!this._content[id];
    }

    /**
     * Nettoie le contenu stocké
     */
    _clearContent() {
        this._content = {};
    }
}
