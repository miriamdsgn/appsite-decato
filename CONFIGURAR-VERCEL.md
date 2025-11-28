# 🚀 Como Configurar o AppSite Decato na Vercel

Este guia mostra como configurar o Vercel KV + Blob para salvar dados e imagens na nuvem.

## Passo 1: Fazer deploy na Vercel

1. Faça commit e push das alterações:
```bash
git add .
git commit -m "Adicionar painel admin com Vercel KV e Blob"
git push origin main
```

2. A Vercel fará o deploy automaticamente (se já estiver conectada)

---

## Passo 2: Criar o KV Database (para configurações)

1. Acesse seu projeto na [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto **appsite-decato**
3. Vá em **Storage** (no menu lateral)
4. Clique em **Create Database**
5. Selecione **KV** (Vercel KV)
6. Preencha:
   - **Name**: `decato-config`
   - **Region**: São Paulo (gru1)
7. Clique em **Create**
8. Na tela de confirmação, clique em **Connect**

---

## Passo 3: Criar o Blob Storage (para imagens)

1. Ainda em **Storage**, clique em **Create Database**
2. Selecione **Blob** (Vercel Blob)
3. Preencha:
   - **Name**: `decato-images`
4. Clique em **Create**
5. Na tela de confirmação, clique em **Connect**

---

## Passo 4: Redeploy

Depois de conectar os storages, faça um redeploy:

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**

---

## ✅ Pronto!

Agora você pode:
- Acessar `seusite.vercel.app/admin.html`
- Fazer upload de imagens
- Salvar alterações
- Tudo persiste automaticamente! ☁️

---

## 📊 Limites do plano gratuito (Hobby)

| Serviço | Limite Gratuito |
|---------|-----------------|
| **Vercel KV** | 30MB de dados |
| **Vercel Blob** | 1GB de storage |
| **Bandwidth** | 100GB/mês |

Para um site como este, esses limites são mais que suficientes!

---

## ❓ Problemas comuns

### "API não encontrada" ou "404"
- Verifique se fez o redeploy após conectar os storages
- Verifique se os arquivos `api/config.js` e `api/upload.js` estão no projeto

### "Modo local" no painel
- As APIs só funcionam quando o site está hospedado na Vercel
- Localmente, os dados são salvos no localStorage

### "Erro no upload"
- Verifique se o Blob Storage está conectado
- Verifique o tamanho da imagem (máx 4.5MB)

### "Dados não aparecem no site"
- Clique em "Salvar Alterações" no painel
- Aguarde alguns segundos e recarregue a página

---

## 🔧 Estrutura do projeto

```
appsite-decato/
├── api/
│   ├── config.js      # API para salvar/carregar configurações
│   └── upload.js      # API para upload de imagens
├── admin.html         # Painel administrativo
├── index.html         # Site principal
├── data.json          # Dados iniciais (fallback)
├── vercel-service.js  # Serviço de comunicação com APIs
└── package.json       # Dependências
```

---

## 💡 Dica

O painel funciona em dois modos:

1. **Modo Vercel** (quando hospedado): Salva na nuvem ☁️
2. **Modo Local** (desenvolvimento): Salva no navegador 💾

O indicador no canto superior mostra qual modo está ativo!

