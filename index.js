// Objeto literal responsavel pelo controle do Modal.
const Modal = {
    modal: document.querySelector('.modal-overlay'),

    //Método responsavel por atribuir a classe 'active' ao Modal e deixa-lo visível.
    toggle() {
        this.modal.classList.toggle('active')
    }
}

//Objeto literal que armazena alguns métodos que serão utéis ao decorrer do script.
const Utils = {
    //Formata o valor capturado do DOM
    formatAmount(value) {
        value = /*Método que transforma o valor em número*/Number(value) * 100
        return value
    },

    //Formata a data para como utilizamos no Brasil.
    formatDate(date) {
        if (date.indexOf('-') != -1) {
            const splittedDate = /*Método para string que cria um array*/date.split('-')
            return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` 
        } else {
            return date
        }
    },
    
    //Formata o valor para o formato da moeda Brasileira (Real)
    formatCurrency(amount) {
        const signal = Number(amount) < 0 ? '-' : ''
    
        amount = this.formatAmount(amount)
        amount = amount.toFixed(0) //Método para fazer o arredondamento de casas decimais
        amount = amount.toString().replace(/*expressão regular que captura todas as letras de uma string*//\D/g, '')
        amount = Number(amount) / 100
        amount = amount.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        })
        
        return signal + amount
    },

    //Identifica qual classe a transaction deverá receber, expanse para gastos e income para entradas.
    getExpanseOrIncome(transaction) {
        return transaction.amount < 0 ? 'expanse' : 'income'
    },
    
    //Adiciona uma transaction ao DOM
    assignDOM(transaction, indice) {
        const area = document.querySelector('#area-transactions')
        const row = area.insertRow()
        row.dataset.index = indice
        const template = `
        <td class="description">${transaction.description}</td>
        <td class="${Utils.getExpanseOrIncome(transaction)}">${Utils.formatCurrency(transaction.amount)}</td>
        <td class="date">${Utils.formatDate(transaction.date)}</td>
        <td onclick="manageTransactions.remove(${indice})">
            <img src="assets/minus.svg" alt="Remover transação">
        </td>
        `
        row.innerHTML = template
    }
}

//Objeto da Transaction
class Transaction {
    constructor(description, amount, date) {
        this.description = description
        this.amount = amount
        this.date = date
    }
}

//Objeto literal que armazena métodos que faz contanto com o localStorage, onde serão armazenadas as transactions
const Storage = {
    //recupera do banco de dados
    get() {
        return JSON.parse(localStorage.getItem('Transactions')) || []
    },

    //Adiciona no banco de dados
    set(transactions) {
        localStorage.setItem('Transactions', JSON.stringify(transactions))
    }
}

//Objto literal que armazena uma array com todas as despesas e métodos para gerir o controle das despesas
const manageTransactions = {
    all: Storage.get(),

    //Adiciona uma nova transaction para a Array
    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    //Remove uma transaction da Array baseando-se no indice
    remove(indice) {
        this.all.splice(indice, 1)
        App.reload()
    },

    //Faz a somátoria das entradas
    incomesValue() {
        let income = 0

        this.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += Number(transaction.amount)
            }
        })

        return income
    },

    //Faz a somátoria dos gastos
    expansesValue() {
        let expanses = 0

        this.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expanses += Number(transaction.amount)
            }
        })

        return expanses
    },

    //Faz o calculo do total
    totalValue() {
        return this.incomesValue() + this.expansesValue()
    },

    //Atualiza os cards
    updateBalance() {
        document.querySelector('#income').innerHTML = Utils.formatCurrency(this.incomesValue())
        document.querySelector('#expanses').innerHTML = Utils.formatCurrency(this.expansesValue())
        document.querySelector('#total').innerHTML = Utils.formatCurrency(this.totalValue())
    },

    //Limpa o espaço das transações
    clearTransactions() {
        document.querySelector('#area-transactions').innerHTML = ''
    }
}

//Objeto literal que faz o controle total da aplicação
const App = {
    init() {
        manageTransactions.all.forEach(Utils.assignDOM)
        
        manageTransactions.updateBalance()

        Storage.set(manageTransactions.all)
    },
    
    reload() {
        manageTransactions.clearTransactions()
        this.init()
    }
}

//chamada da função que incia o app
App.init()

//Função que captura o valor dos campos preenchidos do DOM
function captureTransaction() {
    try {
        const description = document.querySelector('#description')
        const amount = document.querySelector('#amount')
        const date = document.querySelector('#date')

        if (description.value === '' && amount.value === '' && date.value === '') {
            throw new Error('Preencha todos os campos do formulario.')
        }

        const transaction = new Transaction(description.value, amount.value, date.value)

        manageTransactions.add(transaction)

        description.value = ''
        amount.value = ''
        date.value = ''
        
        Modal.toggle()

    } catch (error) {
        alert(error.message)
    }
}