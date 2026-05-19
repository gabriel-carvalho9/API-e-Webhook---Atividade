// Sistema A
async function buscarEDisparar() {
    const inputOriginal = document.getElementById('cepInput').value;
    const status = document.getElementById('statusSistemaA');

    // Limpando o input do CEP (remove símbolos, espaços e letras)
    const cep = inputOriginal.replace(/\D/g, '');

    // Validação do CEP
    if (cep.length !== 8) {
        status.innerText = "Erro: O CEP deve ter exatamente 8 números.";
        return;
    }

    status.innerText = "Consultando ViaCEP...";

    try {
        // Link do ViaCEP
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        const response = await fetch(url);
        const dadosCep = await response.json();

        // Validação de dados
        if (dadosCep.erro === "true" || dadosCep.erro === true) {
            status.innerText = "Erro: Este CEP não existe na base.";
            return;
        }
        status.innerText = "Endereço encontrado! Disparando Webhook...";

        // Payload do o que será enviado ao sistema B
        const payloadWebhook = {
            evento: "cliente.endereço.atualizado",
            timestamp: new Date().toISOString(),
            dados: {
                logradouro: dadosCep.logradouro || "Não informado",
                bairro: dadosCep.bairro || "Não informado",
                cidade: dadosCep.localidade,
                uf: dadosCep.uf
            }
        };

        // Evento que conecta os dois sistemas
        const eventoWebhook = new CustomEvent('webhook_endpoint', {
            detail: payloadWebhook
        });

        // Timeout aplicado
        setTimeout(() => {
            window.dispatchEvent(eventoWebhook);
            status.innerText = "Sucesso! Webhook enviado para o Sistema B.";
        }, 1000); // Tempo em milissegundos (1 segundo)
    } catch (error) {
        // Trata falhas e erros
        status.innerText = "Erro crítico  de rede ou API fora do ar.";
        console.error(error);
    }
}

// Sistema B
window.addEventListener('webhook_endpoint', function(event){
        const cepDetalhes = event.detail.dados;
        const logElement = document.getElementById('logWebhook');
        console.log("Webhook recebido no Sistema B:", cepDetalhes);
        logElement.innerText = JSON.stringify(cepDetalhes, null, 2);
    }
);