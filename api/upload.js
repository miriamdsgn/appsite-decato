// API de upload usando Blob
// Usando Node.js runtime para melhor compatibilidade com Blob

export default async function handler(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

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
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return new Response(
                JSON.stringify({ success: false, error: 'Blob não configurado' }),
                { status: 500, headers }
            );
        }

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

        // Converter file para base64 para enviar via API (compatível com Edge)
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...uint8Array));

        // Upload para Vercel Blob usando API REST
        const response = await fetch('https://blob.vercel-storage.com', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pathname: filename,
                data: base64,
                contentType: file.type || 'application/octet-stream',
                access: 'public',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro no upload: ${errorText}`);
        }

        const result = await response.json();

        return new Response(
            JSON.stringify({ 
                success: true, 
                url: result.url,
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

