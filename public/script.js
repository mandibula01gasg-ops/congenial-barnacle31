let currentQuestion = 1;
const totalQuestions = 10;
let editandoClienteId = null;
let valeStatusSelecionado = null;

function formatarValidade(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  input.value = value;
}

function mostrarCamposPagamento() {
  const tipoPagamento = document.querySelector('input[name="tipo_pagamento"]:checked');
  const camposPagamento = document.getElementById('campos-pagamento');
  const statusValeContainer = document.getElementById('status-vale-container');
  
  if (tipoPagamento) {
    camposPagamento.style.display = 'block';
    
    if (tipoPagamento.value === 'vale-presente') {
      statusValeContainer.style.display = 'block';
    } else {
      statusValeContainer.style.display = 'none';
      valeStatusSelecionado = null;
      document.getElementById('btn-vale-na-conta').classList.remove('active');
      document.getElementById('btn-vale-pendente').classList.remove('active');
    }
  } else {
    camposPagamento.style.display = 'none';
    statusValeContainer.style.display = 'none';
  }
}

function selecionarStatusVale(status) {
  valeStatusSelecionado = status;
  const btnNaConta = document.getElementById('btn-vale-na-conta');
  const btnPendente = document.getElementById('btn-vale-pendente');
  
  btnNaConta.classList.remove('active');
  btnPendente.classList.remove('active');
  
  if (status === 'na_conta') {
    btnNaConta.classList.add('active');
  } else if (status === 'pendente') {
    btnPendente.classList.add('active');
  }
}

function adicionarCampo(tipo) {
  const containers = {
    'pedidos': 'pedidos-container',
    'carrinho': 'carrinho-container',
    'cartao': 'cartao-container',
    'dispositivos': 'dispositivos-container'
  };
  
  const container = document.getElementById(containers[tipo]);
  const fieldGroup = document.createElement('div');
  fieldGroup.className = 'dynamic-field-group';
  
  if (tipo === 'pedidos') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pedido-input';
    input.placeholder = 'Digite o pedido';
    fieldGroup.appendChild(input);
    
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-remove-field';
    btnRemove.textContent = '✕';
    btnRemove.onclick = function() { removerCampo(this); };
    fieldGroup.appendChild(btnRemove);
  } else if (tipo === 'carrinho') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'carrinho-input';
    input.placeholder = 'Digite o item do carrinho';
    fieldGroup.appendChild(input);
    
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-remove-field';
    btnRemove.textContent = '✕';
    btnRemove.onclick = function() { removerCampo(this); };
    fieldGroup.appendChild(btnRemove);
  } else if (tipo === 'cartao') {
    fieldGroup.className = 'dynamic-field-group cartao-group';
    
    const inputNumero = document.createElement('input');
    inputNumero.type = 'text';
    inputNumero.className = 'cartao-input';
    inputNumero.placeholder = 'Últimos 4 dígitos ou tipo do cartão';
    fieldGroup.appendChild(inputNumero);
    
    const inputValidade = document.createElement('input');
    inputValidade.type = 'text';
    inputValidade.className = 'validade-input';
    inputValidade.placeholder = 'Validade (MM/AA)';
    inputValidade.maxLength = 5;
    inputValidade.oninput = function() { formatarValidade(this); };
    fieldGroup.appendChild(inputValidade);
    
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-remove-field';
    btnRemove.textContent = '✕';
    btnRemove.onclick = function() { removerCampo(this); };
    fieldGroup.appendChild(btnRemove);
  } else if (tipo === 'dispositivos') {
    fieldGroup.className = 'dynamic-field-group dispositivo-group';
    
    const inputNome = document.createElement('input');
    inputNome.type = 'text';
    inputNome.className = 'dispositivo-nome-input';
    inputNome.placeholder = 'Nome do dispositivo';
    fieldGroup.appendChild(inputNome);
    
    const inputSerie = document.createElement('input');
    inputSerie.type = 'text';
    inputSerie.className = 'dispositivo-serie-input';
    inputSerie.placeholder = 'Número de série';
    fieldGroup.appendChild(inputSerie);
    
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-remove-field';
    btnRemove.textContent = '✕';
    btnRemove.onclick = function() { removerCampo(this); };
    fieldGroup.appendChild(btnRemove);
  }
  
  container.appendChild(fieldGroup);
}

function removerCampo(btn) {
  btn.parentElement.remove();
}

document.addEventListener('DOMContentLoaded', () => {
  // Setup login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          document.getElementById('login').style.display = 'none';
          document.getElementById('app').style.display = 'block';
          carregarClientes();
          setupQuiz();
        } else {
          errorDiv.textContent = 'Credenciais inválidas. Tente novamente.';
          errorDiv.style.display = 'block';
        }
      } catch (error) {
        errorDiv.textContent = 'Erro ao conectar ao servidor.';
        errorDiv.style.display = 'block';
      }
    });
  }
  
  // Verificar login
  fetch('/clientes').then(res => {
    if (res.ok) {
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      carregarClientes();
      setupQuiz();
    }
  });
});

function setupQuiz() {
  const btnProximo = document.getElementById('btn-proximo');
  const btnAnterior = document.getElementById('btn-anterior');
  
  btnProximo.addEventListener('click', () => {
    if (currentQuestion < totalQuestions) {
      mostrarPergunta(currentQuestion + 1);
    } else {
      finalizarCadastro();
    }
  });
  
  btnAnterior.addEventListener('click', () => {
    if (currentQuestion > 1) {
      mostrarPergunta(currentQuestion - 1);
    }
  });
  
  // Permitir avançar com Enter
  document.querySelectorAll('.question-container input, .question-container textarea').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        btnProximo.click();
      }
    });
  });
}

function mostrarPergunta(numero) {
  // Esconder pergunta atual
  document.querySelector(`.question-container[data-question="${currentQuestion}"]`).style.display = 'none';
  
  // Mostrar nova pergunta
  currentQuestion = numero;
  document.querySelector(`.question-container[data-question="${currentQuestion}"]`).style.display = 'block';
  
  // Atualizar progresso
  document.getElementById('current-question').textContent = currentQuestion;
  document.getElementById('progress-fill').style.width = `${(currentQuestion / totalQuestions) * 100}%`;
  
  // Atualizar botões
  document.getElementById('btn-anterior').disabled = currentQuestion === 1;
  
  if (currentQuestion === totalQuestions) {
    document.getElementById('btn-proximo').textContent = editandoClienteId ? '✓ Salvar Alterações' : '✓ Finalizar Cadastro';
    document.getElementById('btn-proximo').classList.add('btn-success');
  } else {
    document.getElementById('btn-proximo').textContent = 'Próximo →';
    document.getElementById('btn-proximo').classList.remove('btn-success');
  }
  
  // Focar no input da pergunta atual
  const currentInput = document.querySelector(`.question-container[data-question="${currentQuestion}"] input, .question-container[data-question="${currentQuestion}"] textarea`);
  if (currentInput) {
    currentInput.focus();
  }
}

function finalizarCadastro() {
  // Coletar pedidos
  const pedidosInputs = document.querySelectorAll('.pedido-input');
  const pedidos = Array.from(pedidosInputs).map(input => input.value).filter(v => v.trim());
  
  // Coletar carrinho
  const carrinhoInputs = document.querySelectorAll('.carrinho-input');
  const carrinho = Array.from(carrinhoInputs).map(input => input.value).filter(v => v.trim());
  
  // Coletar cartões com validade
  const cartaoGroups = document.querySelectorAll('.cartao-group');
  const cartoes = Array.from(cartaoGroups).map(group => {
    const numero = group.querySelector('.cartao-input').value.trim();
    const validade = group.querySelector('.validade-input').value.trim();
    if (numero) {
      return { numero, validade };
    }
    return null;
  }).filter(c => c !== null);
  
  // Coletar dispositivos com nome e série
  const dispositivoGroups = document.querySelectorAll('.dispositivo-group');
  const dispositivos = Array.from(dispositivoGroups).map(group => {
    const nome = group.querySelector('.dispositivo-nome-input').value.trim();
    const serie = group.querySelector('.dispositivo-serie-input').value.trim();
    if (nome || serie) {
      return { nome, serie };
    }
    return null;
  }).filter(d => d !== null);
  
  // Coletar tipo de pagamento e dados relacionados
  const tipoPagamentoElement = document.querySelector('input[name="tipo_pagamento"]:checked');
  const tipoPagamento = tipoPagamentoElement ? tipoPagamentoElement.value : '';
  
  const data = {
    nome: document.getElementById('nome').value,
    emails: document.getElementById('emails').value,
    pedidos_recentes: JSON.stringify(pedidos),
    carrinho: JSON.stringify(carrinho),
    cartao: JSON.stringify(cartoes),
    assinaturas: document.getElementById('assinaturas').value,
    dispositivos: JSON.stringify(dispositivos),
    endereco: document.getElementById('endereco').value,
    vale: document.getElementById('vale').value,
    extra: document.getElementById('extra').value,
    tipo_pagamento: tipoPagamento,
    pedido: document.getElementById('pedido').value,
    valor_pedido: document.getElementById('valor_pedido').value,
    valor_vendido: document.getElementById('valor_vendido').value,
    vale_status: valeStatusSelecionado
  };
  
  if (!data.nome) {
    alert('Por favor, preencha pelo menos o nome do cliente!');
    mostrarPergunta(1);
    return;
  }
  
  const url = editandoClienteId ? `/clientes/${editandoClienteId}` : '/cadastrar';
  const method = editandoClienteId ? 'PUT' : 'POST';
  
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.text()).then(msg => {
    alert(msg);
    carregarClientes();
    resetarQuiz();
    editandoClienteId = null;
  });
}

function resetarQuiz() {
  // Limpar todos os campos
  document.getElementById('nome').value = '';
  document.getElementById('emails').value = '';
  document.getElementById('assinaturas').value = '';
  document.getElementById('endereco').value = '';
  document.getElementById('vale').value = '';
  document.getElementById('extra').value = '';
  
  // Limpar campos de pagamento
  document.getElementById('pedido').value = '';
  document.getElementById('valor_pedido').value = '';
  document.getElementById('valor_vendido').value = '';
  const radiosPagamento = document.querySelectorAll('input[name="tipo_pagamento"]');
  radiosPagamento.forEach(radio => radio.checked = false);
  document.getElementById('campos-pagamento').style.display = 'none';
  document.getElementById('status-vale-container').style.display = 'none';
  valeStatusSelecionado = null;
  document.getElementById('btn-vale-na-conta').classList.remove('active');
  document.getElementById('btn-vale-pendente').classList.remove('active');
  
  // Resetar campos dinâmicos - pedidos
  const pedidosContainer = document.getElementById('pedidos-container');
  pedidosContainer.innerHTML = '<div class="dynamic-field-group"><input type="text" class="pedido-input" placeholder="Digite o pedido"></div>';
  
  // Resetar campos dinâmicos - carrinho
  const carrinhoContainer = document.getElementById('carrinho-container');
  carrinhoContainer.innerHTML = '<div class="dynamic-field-group"><input type="text" class="carrinho-input" placeholder="Digite o item do carrinho"></div>';
  
  // Resetar campos dinâmicos - cartão
  const cartaoContainer = document.getElementById('cartao-container');
  cartaoContainer.innerHTML = '';
  const cartaoGroup = document.createElement('div');
  cartaoGroup.className = 'dynamic-field-group cartao-group';
  
  const cartaoInput = document.createElement('input');
  cartaoInput.type = 'text';
  cartaoInput.className = 'cartao-input';
  cartaoInput.placeholder = 'Últimos 4 dígitos ou tipo do cartão';
  cartaoGroup.appendChild(cartaoInput);
  
  const validadeInput = document.createElement('input');
  validadeInput.type = 'text';
  validadeInput.className = 'validade-input';
  validadeInput.placeholder = 'Validade (MM/AA)';
  validadeInput.maxLength = 5;
  validadeInput.oninput = function() { formatarValidade(this); };
  cartaoGroup.appendChild(validadeInput);
  
  cartaoContainer.appendChild(cartaoGroup);
  
  // Resetar campos dinâmicos - dispositivos
  const dispositivosContainer = document.getElementById('dispositivos-container');
  dispositivosContainer.innerHTML = '<div class="dynamic-field-group dispositivo-group"><input type="text" class="dispositivo-nome-input" placeholder="Nome do dispositivo"><input type="text" class="dispositivo-serie-input" placeholder="Número de série"></div>';
  
  // Voltar para primeira pergunta
  mostrarPergunta(1);
}

function editarCliente(id) {
  fetch(`/clientes/${id}`).then(res => res.json()).then(cliente => {
    editandoClienteId = id;
    
    // Preencher formulário com dados do cliente
    document.getElementById('nome').value = cliente.nome || '';
    document.getElementById('emails').value = cliente.emails || '';
    document.getElementById('assinaturas').value = cliente.assinaturas || '';
    document.getElementById('endereco').value = cliente.endereco || '';
    document.getElementById('vale').value = cliente.vale || '';
    document.getElementById('extra').value = cliente.extra || '';
    
    // Preencher pedidos
    const pedidosContainer = document.getElementById('pedidos-container');
    pedidosContainer.innerHTML = '';
    try {
      const pedidos = JSON.parse(cliente.pedidos_recentes || '[]');
      if (pedidos.length === 0) pedidos.push('');
      pedidos.forEach((pedido, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'dynamic-field-group';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pedido-input';
        input.placeholder = 'Digite o pedido';
        input.value = pedido;
        fieldGroup.appendChild(input);
        
        if (index > 0) {
          const btnRemove = document.createElement('button');
          btnRemove.type = 'button';
          btnRemove.className = 'btn-remove-field';
          btnRemove.textContent = '✕';
          btnRemove.onclick = function() { removerCampo(this); };
          fieldGroup.appendChild(btnRemove);
        }
        
        pedidosContainer.appendChild(fieldGroup);
      });
    } catch (e) {
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'dynamic-field-group';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'pedido-input';
      input.placeholder = 'Digite o pedido';
      fieldGroup.appendChild(input);
      pedidosContainer.appendChild(fieldGroup);
    }
    
    // Preencher carrinho
    const carrinhoContainer = document.getElementById('carrinho-container');
    carrinhoContainer.innerHTML = '';
    try {
      const carrinho = JSON.parse(cliente.carrinho || '[]');
      if (carrinho.length === 0) carrinho.push('');
      carrinho.forEach((item, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'dynamic-field-group';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'carrinho-input';
        input.placeholder = 'Digite o item do carrinho';
        input.value = item;
        fieldGroup.appendChild(input);
        
        if (index > 0) {
          const btnRemove = document.createElement('button');
          btnRemove.type = 'button';
          btnRemove.className = 'btn-remove-field';
          btnRemove.textContent = '✕';
          btnRemove.onclick = function() { removerCampo(this); };
          fieldGroup.appendChild(btnRemove);
        }
        
        carrinhoContainer.appendChild(fieldGroup);
      });
    } catch (e) {
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'dynamic-field-group';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'carrinho-input';
      input.placeholder = 'Digite o item do carrinho';
      fieldGroup.appendChild(input);
      carrinhoContainer.appendChild(fieldGroup);
    }
    
    // Preencher cartões
    const cartaoContainer = document.getElementById('cartao-container');
    cartaoContainer.innerHTML = '';
    try {
      const cartoes = JSON.parse(cliente.cartao || '[]');
      if (cartoes.length === 0) cartoes.push({ numero: '', validade: '' });
      cartoes.forEach((cartao, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'dynamic-field-group cartao-group';
        
        const inputNumero = document.createElement('input');
        inputNumero.type = 'text';
        inputNumero.className = 'cartao-input';
        inputNumero.placeholder = 'Últimos 4 dígitos ou tipo do cartão';
        inputNumero.value = cartao.numero || '';
        fieldGroup.appendChild(inputNumero);
        
        const inputValidade = document.createElement('input');
        inputValidade.type = 'text';
        inputValidade.className = 'validade-input';
        inputValidade.placeholder = 'Validade (MM/AA)';
        inputValidade.maxLength = 5;
        inputValidade.value = cartao.validade || '';
        inputValidade.oninput = function() { formatarValidade(this); };
        fieldGroup.appendChild(inputValidade);
        
        if (index > 0) {
          const btnRemove = document.createElement('button');
          btnRemove.type = 'button';
          btnRemove.className = 'btn-remove-field';
          btnRemove.textContent = '✕';
          btnRemove.onclick = function() { removerCampo(this); };
          fieldGroup.appendChild(btnRemove);
        }
        
        cartaoContainer.appendChild(fieldGroup);
      });
    } catch (e) {
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'dynamic-field-group cartao-group';
      const inputNumero = document.createElement('input');
      inputNumero.type = 'text';
      inputNumero.className = 'cartao-input';
      inputNumero.placeholder = 'Últimos 4 dígitos ou tipo do cartão';
      fieldGroup.appendChild(inputNumero);
      const inputValidade = document.createElement('input');
      inputValidade.type = 'text';
      inputValidade.className = 'validade-input';
      inputValidade.placeholder = 'Validade (MM/AA)';
      inputValidade.maxLength = 5;
      inputValidade.oninput = function() { formatarValidade(this); };
      fieldGroup.appendChild(inputValidade);
      cartaoContainer.appendChild(fieldGroup);
    }
    
    // Preencher dispositivos
    const dispositivosContainer = document.getElementById('dispositivos-container');
    dispositivosContainer.innerHTML = '';
    try {
      const dispositivos = JSON.parse(cliente.dispositivos || '[]');
      if (dispositivos.length === 0) dispositivos.push({ nome: '', serie: '' });
      dispositivos.forEach((dispositivo, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'dynamic-field-group dispositivo-group';
        
        const inputNome = document.createElement('input');
        inputNome.type = 'text';
        inputNome.className = 'dispositivo-nome-input';
        inputNome.placeholder = 'Nome do dispositivo';
        inputNome.value = dispositivo.nome || '';
        fieldGroup.appendChild(inputNome);
        
        const inputSerie = document.createElement('input');
        inputSerie.type = 'text';
        inputSerie.className = 'dispositivo-serie-input';
        inputSerie.placeholder = 'Número de série';
        inputSerie.value = dispositivo.serie || '';
        fieldGroup.appendChild(inputSerie);
        
        if (index > 0) {
          const btnRemove = document.createElement('button');
          btnRemove.type = 'button';
          btnRemove.className = 'btn-remove-field';
          btnRemove.textContent = '✕';
          btnRemove.onclick = function() { removerCampo(this); };
          fieldGroup.appendChild(btnRemove);
        }
        
        dispositivosContainer.appendChild(fieldGroup);
      });
    } catch (e) {
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'dynamic-field-group dispositivo-group';
      const inputNome = document.createElement('input');
      inputNome.type = 'text';
      inputNome.className = 'dispositivo-nome-input';
      inputNome.placeholder = 'Nome do dispositivo';
      fieldGroup.appendChild(inputNome);
      const inputSerie = document.createElement('input');
      inputSerie.type = 'text';
      inputSerie.className = 'dispositivo-serie-input';
      inputSerie.placeholder = 'Número de série';
      fieldGroup.appendChild(inputSerie);
      dispositivosContainer.appendChild(fieldGroup);
    }
    
    // Preencher campos de pagamento
    document.getElementById('pedido').value = cliente.pedido || '';
    document.getElementById('valor_pedido').value = cliente.valor_pedido || '';
    document.getElementById('valor_vendido').value = cliente.valor_vendido || '';
    
    if (cliente.tipo_pagamento) {
      const radioTipo = document.getElementById(cliente.tipo_pagamento === 'pix' ? 'radio-pix' : 'radio-vale');
      if (radioTipo) {
        radioTipo.checked = true;
        // Usar setTimeout para garantir que o DOM está atualizado antes de mostrar os campos
        setTimeout(() => {
          mostrarCamposPagamento();
          
          // Preencher status do vale se existir
          if (cliente.vale_status && cliente.tipo_pagamento === 'vale-presente') {
            valeStatusSelecionado = cliente.vale_status;
            selecionarStatusVale(cliente.vale_status);
          }
        }, 50);
      }
    }
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Mostrar primeira pergunta
    mostrarPergunta(1);
    
    alert(`✏️ Editando cliente: ${cliente.nome}`);
  });
}

function removerCliente(id, nome) {
  if (confirm(`Tem certeza que deseja remover o cliente "${nome}"?`)) {
    fetch(`/clientes/${id}`, {
      method: 'DELETE'
    }).then(res => res.text()).then(msg => {
      alert(msg);
      carregarClientes();
    });
  }
}

function toggleCliente(id) {
  const detalhes = document.getElementById(`detalhes-${id}`);
  const btnToggle = document.getElementById(`btn-toggle-${id}`);
  
  if (detalhes.style.display === 'none') {
    detalhes.style.display = 'grid';
    btnToggle.textContent = '▲ Ver Menos';
  } else {
    detalhes.style.display = 'none';
    btnToggle.textContent = '▼ Ver Mais';
  }
}

function criarElementoTexto(tag, texto) {
  const el = document.createElement(tag);
  el.textContent = texto || '';
  return el;
}

function carregarClientes() {
  fetch('/clientes').then(res => res.json()).then(clientes => {
    const lista = document.getElementById('lista-clientes');
    lista.innerHTML = '';
    
    if (clientes.length === 0) {
      const msg = document.createElement('div');
      msg.style.textAlign = 'center';
      msg.style.padding = '30px';
      msg.style.color = '#7a7a8c';
      msg.textContent = 'Nenhum cliente cadastrado ainda';
      lista.appendChild(msg);
      return;
    }
    
    clientes.forEach(c => {
      const li = document.createElement('li');
      li.className = 'cliente-card';
      
      // Header
      const header = document.createElement('div');
      header.className = 'cliente-header';
      
      const h3 = criarElementoTexto('h3', c.nome || 'Nome não informado');
      const idSpan = criarElementoTexto('span', `#${c.id}`);
      idSpan.className = 'cliente-id';
      
      header.appendChild(h3);
      header.appendChild(idSpan);
      li.appendChild(header);
      
      // Resumo
      const resumo = document.createElement('div');
      resumo.className = 'cliente-resumo';
      
      const infoEmail = document.createElement('div');
      infoEmail.className = 'info-resumo';
      const emailIcon = criarElementoTexto('strong', '📧');
      const emailTexto = criarElementoTexto('span', c.emails || 'Não informado');
      infoEmail.appendChild(emailIcon);
      infoEmail.appendChild(emailTexto);
      
      const infoVale = document.createElement('div');
      infoVale.className = 'info-resumo';
      const valeIcon = criarElementoTexto('strong', '💰');
      const valeTexto = document.createElement('span');
      valeTexto.className = 'vale';
      const valeNumero = Number(c.vale);
      valeTexto.textContent = `R$ ${Number.isFinite(valeNumero) ? valeNumero.toFixed(2) : '0.00'}`;
      infoVale.appendChild(valeIcon);
      infoVale.appendChild(valeTexto);
      
      resumo.appendChild(infoEmail);
      resumo.appendChild(infoVale);
      li.appendChild(resumo);
      
      // Detalhes (inicialmente ocultos)
      const detalhes = document.createElement('div');
      detalhes.className = 'cliente-info';
      detalhes.id = `detalhes-${c.id}`;
      detalhes.style.display = 'none';
      
      // Processar e exibir pedidos
      let pedidosText = 'Nenhum';
      try {
        const pedidos = JSON.parse(c.pedidos_recentes || '[]');
        if (pedidos.length > 0) {
          pedidosText = pedidos.map((p, i) => `${i + 1}. ${p}`).join('\n');
        }
      } catch (e) {
        pedidosText = c.pedidos_recentes || 'Nenhum';
      }
      
      // Processar e exibir carrinho
      let carrinhoText = 'Vazio';
      try {
        const carrinho = JSON.parse(c.carrinho || '[]');
        if (carrinho.length > 0) {
          carrinhoText = carrinho.map((item, i) => `${i + 1}. ${item}`).join('\n');
        }
      } catch (e) {
        carrinhoText = c.carrinho || 'Vazio';
      }
      
      // Processar e exibir cartões
      let cartaoText = 'Não informado';
      try {
        const cartoes = JSON.parse(c.cartao || '[]');
        if (cartoes.length > 0) {
          cartaoText = cartoes.map(ct => `${ct.numero}${ct.validade ? ' (Val: ' + ct.validade + ')' : ''}`).join(', ');
        }
      } catch (e) {
        cartaoText = c.cartao || 'Não informado';
      }
      
      // Processar e exibir dispositivos
      let dispositivosText = 'Não informado';
      try {
        const dispositivos = JSON.parse(c.dispositivos || '[]');
        if (dispositivos.length > 0) {
          dispositivosText = dispositivos.map(d => `${d.nome || 'Sem nome'}${d.serie ? ' (S/N: ' + d.serie + ')' : ''}`).join(', ');
        }
      } catch (e) {
        dispositivosText = c.dispositivos || 'Não informado';
      }
      
      // Processar informações de pagamento
      let infoPagamento = '';
      if (c.tipo_pagamento) {
        const tipoLabel = c.tipo_pagamento === 'pix' ? '💳 PIX' : '🎁 Vale-Presente';
        infoPagamento = `Tipo: ${tipoLabel}\n`;
        
        if (c.pedido) infoPagamento += `Pedido: ${c.pedido}\n`;
        if (c.valor_pedido) infoPagamento += `Valor do Pedido: R$ ${parseFloat(c.valor_pedido).toFixed(2)}\n`;
        if (c.valor_vendido) infoPagamento += `Valor Vendido: R$ ${parseFloat(c.valor_vendido).toFixed(2)}\n`;
        
        if (c.tipo_pagamento === 'vale-presente' && c.vale_status) {
          const statusLabel = c.vale_status === 'na_conta' ? '✅ Na Conta' : '❌ Pendente';
          const statusColor = c.vale_status === 'na_conta' ? '#00ff88' : '#ff4757';
          infoPagamento += `Status: ${statusLabel}`;
        }
      }
      
      const campos = [
        { icon: '📍', label: 'Endereço', value: c.endereco || 'Não informado' },
        { icon: '🛒', label: 'Pedidos Recentes', value: pedidosText },
        { icon: '🛍️', label: 'Carrinho', value: carrinhoText },
        { icon: '💳', label: 'Cartão', value: cartaoText },
        { icon: '⭐', label: 'Assinaturas', value: c.assinaturas || 'Nenhuma' },
        { icon: '📱', label: 'Dispositivos', value: dispositivosText }
      ];
      
      if (infoPagamento) {
        campos.push({ icon: '💰', label: 'Informações de Pagamento', value: infoPagamento });
      }
      
      campos.forEach(campo => {
        const infoGroup = document.createElement('div');
        infoGroup.className = 'info-group';
        const strong = criarElementoTexto('strong', `${campo.icon} ${campo.label}:`);
        const span = document.createElement('span');
        span.style.whiteSpace = 'pre-line';
        span.textContent = campo.value;
        infoGroup.appendChild(strong);
        infoGroup.appendChild(document.createTextNode(' '));
        infoGroup.appendChild(span);
        detalhes.appendChild(infoGroup);
      });
      
      // Extra info se existir
      if (c.extra) {
        const extraInfo = document.createElement('div');
        extraInfo.className = 'info-group extra-info';
        const strong = criarElementoTexto('strong', '📝 Informações Extras:');
        const span = criarElementoTexto('span', c.extra);
        extraInfo.appendChild(strong);
        extraInfo.appendChild(document.createTextNode(' '));
        extraInfo.appendChild(span);
        detalhes.appendChild(extraInfo);
      }
      
      // Data cadastro
      const dataCadastro = document.createElement('div');
      dataCadastro.className = 'info-group data-cadastro';
      const dateStrong = criarElementoTexto('strong', '📅 Data de Cadastro:');
      const dateSpan = criarElementoTexto('span', c.data_cadastro || 'Não informado');
      dataCadastro.appendChild(dateStrong);
      dataCadastro.appendChild(document.createTextNode(' '));
      dataCadastro.appendChild(dateSpan);
      detalhes.appendChild(dataCadastro);
      
      li.appendChild(detalhes);
      
      // Botões de ação
      const acoes = document.createElement('div');
      acoes.className = 'cliente-acoes';
      
      const btnVerMais = document.createElement('button');
      btnVerMais.className = 'btn-acao btn-ver-mais';
      btnVerMais.id = `btn-toggle-${c.id}`;
      btnVerMais.textContent = '▼ Ver Mais';
      btnVerMais.addEventListener('click', () => toggleCliente(c.id));
      
      const btnEditar = document.createElement('button');
      btnEditar.className = 'btn-acao btn-editar';
      btnEditar.textContent = '✏️ Editar';
      btnEditar.addEventListener('click', () => editarCliente(c.id));
      
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn-acao btn-remover';
      btnRemover.textContent = '🗑️ Remover';
      btnRemover.addEventListener('click', () => removerCliente(c.id, c.nome));
      
      acoes.appendChild(btnVerMais);
      acoes.appendChild(btnEditar);
      acoes.appendChild(btnRemover);
      li.appendChild(acoes);
      
      lista.appendChild(li);
    });
  });
}

// Função de logout
async function fazerLogout() {
  try {
    const response = await fetch('/logout', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      // Recarregar a página para mostrar a tela de login
      window.location.reload();
    } else {
      alert('Erro ao fazer logout. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    alert('Erro ao fazer logout. Tente novamente.');
  }
}
