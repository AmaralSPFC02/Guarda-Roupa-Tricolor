const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_DIR = path.join(__dirname, 'data');

const lerBanco = (arquivo) => {
    try {
        const caminho = path.join(DATA_DIR, arquivo);
        if (!fs.existsSync(caminho)) return [];
        const dados = fs.readFileSync(caminho, 'utf-8');
        return JSON.parse(dados);
    } catch (error) {
        console.error(`❌ Erro ao ler ${arquivo}:`, error);
        return [];
    }
};

const salvarBanco = (arquivo, dados) => {
    try {
        const caminho = path.join(DATA_DIR, arquivo);
        fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
    } catch (error) {
        console.error(`❌ Erro ao salvar ${arquivo}:`, error);
    }
};

app.use((req, res, next) => {
    console.log(`📡 Recebi uma requisição: ${req.method} ${req.url}`);
    next();
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = lerBanco('users.json');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: "Credenciais inválidas" });
    const token = uuidv4();
    res.json({ token, user: { email: user.email, id: user.id } });
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const users = lerBanco('users.json');
    if (users.find(u => u.email === email)) return res.status(400).json({ message: "Email já existe" });
    users.push({ id: uuidv4(), email, password });
    salvarBanco('users.json', users);
    res.status(201).json({ message: "Criado!" });
});

app.get('/shirts', (req, res) => {
    res.json(lerBanco('shirts.json'));
});

app.post('/shirts', (req, res) => {
    console.log("📝 Criando nova camisa...");
    const shirts = lerBanco('shirts.json');
    const newShirt = { id: uuidv4(), ...req.body };
    shirts.push(newShirt);
    salvarBanco('shirts.json', shirts);
    console.log("✅ Camisa criada com ID:", newShirt.id);
    res.status(201).json(newShirt);
});

app.delete('/shirts/:id', (req, res) => {
    const { id } = req.params;
    let shirts = lerBanco('shirts.json');
    const filtered = shirts.filter(s => s.id !== id);
    salvarBanco('shirts.json', filtered);
    res.json({ message: "Deletado" });
});

app.put('/shirts/:id', (req, res) => {
    const { id } = req.params;
    console.log(`✏️ Tentando EDITAR camisa ID: ${id}`);
    
    const novosDados = req.body;
    let shirts = lerBanco('shirts.json');
    
    const index = shirts.findIndex(s => s.id === id);
    
    if (index === -1) {
        console.log("❌ Camisa não encontrada para edição.");
        return res.status(404).json({ message: "Camisa não encontrada" });
    }

    shirts[index] = { ...shirts[index], ...novosDados, id };
    salvarBanco('shirts.json', shirts);
    
    console.log("✅ Camisa editada com sucesso!");
    res.json(shirts[index]);
});

app.listen(3000, () => console.log(`SERVIDOR RODANDO NA PORTA 3000, VAMOS SÃO PAULO!`));