// Funcionalidades principais do site M&A Brasil
document.addEventListener('DOMContentLoaded', function() {
    // Navegação entre seções
    setupNavigation();
    
    // Configuração do acordeão
    setupAccordion();
    
    // Funcionalidades da tabela
    setupTable();
    
    // Carregar dados salvos
    loadSavedData();
});

// Navegação entre seções
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe ativa de todos os links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Adicionar classe ativa ao link clicado
            this.classList.add('active');
            
            // Obter o ID da seção alvo
            const targetId = this.getAttribute('href').substring(1);
            
            // Esconder todas as seções
            sections.forEach(section => {
                section.classList.remove('active-section');
            });
            
            // Mostrar a seção alvo
            document.getElementById(targetId).classList.add('active-section');
        });
    });
    
    // Navegação interna (botões CTA)
    const ctaButtons = document.querySelectorAll('.cta-button a');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            const targetNavLink = document.querySelector(`nav a[href="#${targetId}"]`);
            
            // Atualizar navegação
            navLinks.forEach(link => link.classList.remove('active'));
            targetNavLink.classList.add('active');
            
            // Mostrar seção
            sections.forEach(section => section.classList.remove('active-section'));
            targetSection.classList.add('active-section');
            
            // Rolar para o topo da seção
            window.scrollTo({
                top: targetSection.offsetTop - 60,
                behavior: 'smooth'
            });
        });
    });
}

// Configuração do acordeão
function setupAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', function() {
            // Verificar se este item já está ativo
            const isActive = item.classList.contains('active');
            
            // Fechar todos os itens
            accordionItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Se o item clicado não estava ativo, ativá-lo
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Abrir o primeiro item por padrão
    if (accordionItems.length > 0) {
        accordionItems[0].classList.add('active');
    }
}

// Funcionalidades da tabela
function setupTable() {
    // Botão para adicionar linha
    const addRowButton = document.getElementById('add-row');
    if (addRowButton) {
        addRowButton.addEventListener('click', addTableRow);
    }
    
    // Botão para exportar CSV
    const exportCsvButton = document.getElementById('export-csv');
    if (exportCsvButton) {
        exportCsvButton.addEventListener('click', exportTableToCsv);
    }
    
    // Botão para copiar tabela
    const copyTableButton = document.getElementById('copy-table');
    if (copyTableButton) {
        copyTableButton.addEventListener('click', copyTableToClipboard);
    }
    
    // Botão para limpar tabela
    const clearTableButton = document.getElementById('clear-table');
    if (clearTableButton) {
        clearTableButton.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todos os dados da tabela? Esta ação não pode ser desfeita.')) {
                clearTable();
            }
        });
    }
}

// Adicionar nova linha à tabela
function addTableRow(data = null) {
    const tableBody = document.querySelector('#ma-table tbody');
    const newRow = document.createElement('tr');
    
    // Criar células para cada coluna
    const columns = ['data', 'comprador', 'adquirida', 'valor', 'multiplo'];
    
    columns.forEach(column => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.name = column;
        input.className = 'table-input';
        
        // Se temos dados, preencher o input
        if (data && data[column]) {
            input.value = data[column];
        }
        
        // Adicionar evento para salvar dados quando o input mudar
        input.addEventListener('change', saveTableData);
        
        cell.appendChild(input);
        newRow.appendChild(cell);
    });
    
    // Adicionar célula para ações
    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.title = 'Excluir linha';
    
    deleteButton.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja excluir esta linha?')) {
            newRow.remove();
            saveTableData();
        }
    });
    
    actionsCell.appendChild(deleteButton);
    newRow.appendChild(actionsCell);
    
    // Adicionar a nova linha à tabela
    tableBody.appendChild(newRow);
    
    // Focar no primeiro input da nova linha
    newRow.querySelector('input').focus();
    
    // Salvar os dados da tabela
    saveTableData();
    
    return newRow;
}

// Salvar dados da tabela no localStorage
function saveTableData() {
    const tableRows = document.querySelectorAll('#ma-table tbody tr');
    const tableData = [];
    
    tableRows.forEach(row => {
        const rowData = {};
        const inputs = row.querySelectorAll('input');
        
        inputs.forEach(input => {
            rowData[input.name] = input.value;
        });
        
        tableData.push(rowData);
    });
    
    localStorage.setItem('maTableData', JSON.stringify(tableData));
}

// Carregar dados salvos do localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('maTableData');
    
    if (savedData) {
        try {
            const tableData = JSON.parse(savedData);
            
            // Limpar tabela atual
            document.querySelector('#ma-table tbody').innerHTML = '';
            
            // Adicionar linhas com dados salvos
            tableData.forEach(rowData => {
                addTableRow(rowData);
            });
        } catch (e) {
            console.error('Erro ao carregar dados salvos:', e);
        }
    } else {
        // Adicionar uma linha vazia por padrão
        addTableRow();
    }
}

// Limpar tabela
function clearTable() {
    document.querySelector('#ma-table tbody').innerHTML = '';
    localStorage.removeItem('maTableData');
    
    // Adicionar uma linha vazia
    addTableRow();
}

// Exportar tabela para CSV
function exportTableToCsv() {
    const tableRows = document.querySelectorAll('#ma-table tbody tr');
    let csvContent = 'Data,Empresa Compradora,Empresa Adquirida,Valor da Transação,Múltiplo\n';
    
    tableRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const rowValues = [];
        
        inputs.forEach(input => {
            // Escapar aspas duplas e envolver em aspas
            const value = input.value.replace(/"/g, '""');
            rowValues.push(`"${value}"`);
        });
        
        csvContent += rowValues.join(',') + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ma_brasil_${formatDate(new Date())}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Copiar tabela para área de transferência
function copyTableToClipboard() {
    const tableRows = document.querySelectorAll('#ma-table tbody tr');
    let tableContent = 'Data\tEmpresa Compradora\tEmpresa Adquirida\tValor da Transação\tMúltiplo\n';
    
    tableRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const rowValues = [];
        
        inputs.forEach(input => {
            rowValues.push(input.value);
        });
        
        tableContent += rowValues.join('\t') + '\n';
    });
    
    // Copiar para a área de transferência
    navigator.clipboard.writeText(tableContent)
        .then(() => {
            alert('Tabela copiada para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar tabela:', err);
            alert('Não foi possível copiar a tabela. Verifique as permissões do navegador.');
        });
}

// Formatar data para nome de arquivo
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}_${month}_${year}`;
}
