// API de configurações usando apenas Blob
import { put, head } from '@vercel/blob';

export const config = {
    runtime: 'edge',
};

const CONFIG_FILE = 'site-config.json';

export default async function handler(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    try {
        // GET - Carregar configurações
        if (request.method === 'GET') {
            try {
                const blob = await head(CONFIG_FILE);
                if (blob) {
                    const response = await fetch(blob.url);
                    const config = await response.json();
                    return new Response(
                        JSON.stringify({ success: true, data: config }),
                        { headers }
                    );
                }
            } catch (error) {
                // Arquivo não existe ainda
            }

            return new Response(
                JSON.stringify({ success: true, data: null }),
                { headers }
            );
        }

        // POST - Salvar configurações
        if (request.method === 'POST') {
            const body = await request.json();
            const configJson = JSON.stringify(body.config);
            
            const blob = await put(CONFIG_FILE, configJson, {
                access: 'public',
                contentType: 'application/json',
            });

            return new Response(
                JSON.stringify({ success: true, message: 'Configurações salvas!', url: blob.url }),
                { headers }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Método não permitido' }),
            { status: 405, headers }
        );
    } catch (error) {
        console.error('Erro na API:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers }
        );
    }
}

