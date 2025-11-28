import { kv } from '@vercel/kv';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    try {
        // GET - Carregar configurações
        if (request.method === 'GET') {
            const config = await kv.get('site_config');
            return new Response(
                JSON.stringify({ success: true, data: config || null }),
                { headers }
            );
        }

        // POST - Salvar configurações
        if (request.method === 'POST') {
            const body = await request.json();
            await kv.set('site_config', body.config);
            return new Response(
                JSON.stringify({ success: true, message: 'Configurações salvas!' }),
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

