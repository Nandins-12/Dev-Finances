const Modal = {
    modal: document.querySelector('.modal-overlay'),
    toggle() {
        if (this.modal.classList.contains('active')) {
            this.modal.classList.remove('active')
        } else {
            this.modal.classList.add('active')
        }
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        if (date.indexOf('-') != -1) {
            const splittedDate = date.split('-')
            return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` 
        } else {
            return date
        }
    },
    
    formatCurrency(amount) {
        const signal = Number(amount) < 0 ? '-' : ''
    
        amount = this.formatAmount(amount)
        amount = amount.toFixed(0)
        amount = amount.toString().replace(/\D/g, '')
        amount = Number(amount) / 100
        amount = amount.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        })
        
        return signal + amount
    },

    
    getExpanseOrIncome(transaction) {
        return transaction.amount < 0 ? 'expanse' : 'income'
    },
    
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


class Transaction {
    constructor(description, amount, date) {
        //let id
        this.description = description
        this.amount = amount
        this.date = date
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('Transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('Transactions', JSON.stringify(transactions))
    }
}

const manageTransactions = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    remove(indice) {
        this.all.splice(indice, 1)
        App.reload()
    },

    incomesValue() {
        let income = 0

        this.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += Number(transaction.amount)
            }
        })

        return income
    },

    expansesValue() {
        let expanses = 0

        this.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expanses += Number(transaction.amount)
            }
        })

        return expanses
    },

    totalValue() {
        return this.incomesValue() + this.expansesValue()
    },

    updateBalance() {
        document.querySelector('#income').innerHTML = Utils.formatCurrency(this.incomesValue())
        document.querySelector('#expanses').innerHTML = Utils.formatCurrency(this.expansesValue())
        document.querySelector('#total').innerHTML = Utils.formatCurrency(this.totalValue())
    },

    clearTransactions() {
        document.querySelector('#area-transactions').innerHTML = ''
    }
}

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

App.init()

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