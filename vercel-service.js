// Serviço para comunicação com as APIs da Vercel
// Este arquivo funciona automaticamente quando o site está hospedado na Vercel

const VercelService = {
    // URL base da API (funciona tanto local quanto em produção)
    getBaseUrl() {
        // Em produção na Vercel, usa o mesmo domínio
        // Em desenvolvimento, usa localhost
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    },

    // Verificar se está rodando na Vercel (APIs disponíveis)
    async isConfigured() {
        try {
            const response = await fetch(`${this.getBaseUrl()}/api/config`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Carregar configurações do site
    async loadSiteConfig() {
        try {
            const response = await fetch(`${this.getBaseUrl()}/api/config`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar configurações');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Erro ao carregar config:', error);
            return null;
        }
    },

    // Salvar configurações do site
    async saveSiteConfig(config) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar configurações');
            }

            const result = await response.json();
            
            // Também salva no localStorage como backup
            localStorage.setItem('decato_site_data', JSON.stringify(config));
            
            return { success: true, data: result };
        } catch (error) {
            console.error('Erro ao salvar config:', error);
            // Fallback para localStorage
            localStorage.setItem('decato_site_data', JSON.stringify(config));
            return { success: false, error, local: true };
        }
    },

    // Upload de imagem
    async uploadImage(file, folder = 'images') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await fetch(`${this.getBaseUrl()}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro no upload');
            }

            const result = await response.json();
            return { url: result.url, path: result.path };
        } catch (error) {
            console.error('Erro no upload:', error);
            // Fallback para base64
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ url: e.target.result, local: true });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    },

    // Deletar imagem (não implementado no Blob gratuito)
    async deleteImage(path) {
        console.log('Delete não disponível no plano gratuito');
        return { success: true };
    }
};

// Exportar para uso global
window.VercelService = VercelService;

