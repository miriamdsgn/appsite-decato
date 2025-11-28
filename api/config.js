// API de configurações - Tenta usar KV, se não disponível usa Blob
import { kv } from '@vercel/kv';
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
                // Tentar usar KV primeiro
                const config = await kv.get('site_config');
                if (config) {
                    return new Response(
                        JSON.stringify({ success: true, data: config }),
                        { headers }
                    );
                }
            } catch (kvError) {
                // KV não disponível, tentar Blob
                console.log('KV não disponível, usando Blob');
            }

            // Fallback: usar Blob
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
            } catch (blobError) {
                // Arquivo não existe
            }

            return new Response(
                JSON.stringify({ success: true, data: null }),
                { headers }
            );
        }

        // POST - Salvar configurações
        if (request.method === 'POST') {
            const body = await request.json();
            
            try {
                // Tentar salvar no KV primeiro
                await kv.set('site_config', body.config);
                return new Response(
                    JSON.stringify({ success: true, message: 'Configurações salvas no KV!' }),
                    { headers }
                );
            } catch (kvError) {
                // KV não disponível, usar Blob
                console.log('KV não disponível, salvando no Blob');
                const configJson = JSON.stringify(body.config);
                const blob = await put(CONFIG_FILE, configJson, {
                    access: 'public',
                    contentType: 'application/json',
                });
                return new Response(
                    JSON.stringify({ success: true, message: 'Configurações salvas no Blob!', url: blob.url }),
                    { headers }
                );
            }
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

