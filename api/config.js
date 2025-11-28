// API de configurações usando apenas Blob
// Usando Node.js runtime para melhor compatibilidade com Blob

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
            // Tentar buscar do Blob usando a URL pública
            // A URL será gerada quando salvarmos
            // Por enquanto, retornamos null se não existir
            return new Response(
                JSON.stringify({ success: true, data: null }),
                { headers }
            );
        }

        // POST - Salvar configurações
        if (request.method === 'POST') {
            const body = await request.json();
            const configJson = JSON.stringify(body.config);
            
            // Usar API REST do Vercel Blob
            // O token é injetado automaticamente pela Vercel quando o Blob está conectado
            const token = process.env.BLOB_READ_WRITE_TOKEN;
            
            if (!token) {
                return new Response(
                    JSON.stringify({ success: false, error: 'Blob não configurado. Conecte o Blob Storage no projeto.' }),
                    { status: 500, headers }
                );
            }

            const response = await fetch('https://blob.vercel-storage.com', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pathname: CONFIG_FILE,
                    data: configJson,
                    contentType: 'application/json',
                    access: 'public',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao salvar: ${errorText}`);
            }

            const result = await response.json();
            const publicUrl = `https://${result.url || `${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${CONFIG_FILE}`}`;

            return new Response(
                JSON.stringify({ success: true, message: 'Configurações salvas!', url: publicUrl }),
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

