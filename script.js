const apiUrl = 'http://localhost:3000/items';

document.addEventListener('DOMContentLoaded', function() {
    const itemForm = document.getElementById('item-form');
    const itemIdInput = document.getElementById('item-id');
    const itemNameInput = document.getElementById('item-name');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const itemList = document.getElementById('item-list');

    loadItems();

    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = itemIdInput.value.trim();
        const name = itemNameInput.value.trim();
        
        if (!name) {
            alert('Por favor, digite um nome para o item');
            return;
        }
        
        if (id) {
            updateItem(id, name);
        } else {
            createItem(name);
        }
    });

    // Cancelar edição
    btnCancel.addEventListener('click', resetForm);

    async function loadItems() {
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Erro ao carregar itens');
            const items = await res.json();
            renderItems(items);
        } catch (err) {
            console.error('Erro ao carregar itens:', err);
            alert('Erro ao carregar itens. Verifique se a API está rodando.');
        }
    }

    function renderItems(items) {
        itemList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${escapeHtml(item.name)}</span>
                <div class="item-actions">
                    <button class="btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Excluir</button>
                </div>
            `;
            itemList.appendChild(li);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editItem(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteItem(id);
            });
        });
    }

    async function createItem(name) {
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name })
            });
            
            if (!res.ok) throw new Error('Erro na criação do item');
            
            await loadItems();
            resetForm();
            itemNameInput.focus();
        } catch (err) {
            console.error('Erro ao criar item:', err);
            alert('Erro ao criar item. Verifique a conexão com a API.');
        }
    }

    async function editItem(id) {
        try {
            const res = await fetch(`${apiUrl}/${id}`);
            if (!res.ok) throw new Error('Erro ao carregar item');
            const item = await res.json();
            
            itemIdInput.value = item.id;
            itemNameInput.value = item.name;
            btnSave.textContent = 'Atualizar Item';
            btnCancel.classList.remove('hidden');
            itemNameInput.focus();
        } catch (err) {
            console.error('Erro ao carregar item para edição:', err);
        }
    }

    async function updateItem(id, name) {
        try {
            const res = await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name })
            });
            
            if (!res.ok) throw new Error('Erro ao atualizar item');
            
            await loadItems();
            resetForm();
        } catch (err) {
            console.error('Erro ao atualizar item:', err);
            alert('Erro ao atualizar item.');
        }
    }

    async function deleteItem(id) {
        if (!confirm('Tem certeza que deseja excluir este item?')) {
            return;
        }
        
        try {
            const res = await fetch(`${apiUrl}/${id}`, { 
                method: 'DELETE' 
            });
            
            if (!res.ok) throw new Error('Erro ao excluir item');
            
            await loadItems();
        } catch (err) {
            console.error('Erro ao deletar item:', err);
            alert('Erro ao excluir item.');
        }
    }

    function resetForm() {
        itemIdInput.value = '';
        itemNameInput.value = '';
        btnSave.textContent = 'Adicionar Item';
        btnCancel.classList.add('hidden');
        itemNameInput.focus();
    }

    // Função para escapar HTML (evitar XSS)
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});