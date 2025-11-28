import { put } from '@vercel/blob';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Método não permitido' }),
            { status: 405, headers }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'images';

        if (!file) {
            return new Response(
                JSON.stringify({ error: 'Nenhum arquivo enviado' }),
                { status: 400, headers }
            );
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 9);
        const extension = file.name.split('.').pop();
        const filename = `${folder}/${timestamp}-${randomStr}.${extension}`;

        // Upload para Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
        });

        return new Response(
            JSON.stringify({ 
                success: true, 
                url: blob.url,
                path: filename 
            }),
            { headers }
        );
    } catch (error) {
        console.error('Erro no upload:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers }
        );
    }
}

