class Auth {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
        }
    }

    login(username) {
        const trimmedName = username.trim();
        
        if (!Utils.validateUsername(trimmedName)) {
            return {
                success: false,
                error: 'Имя должно быть от 2 до 20 символов'
            };
        }

        this.currentUser = trimmedName;
        localStorage.setItem('currentUser', trimmedName);

        return {
            success: true,
            username: trimmedName
        };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}
