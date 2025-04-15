let app = new Vue({
    el: '#app',
    data() {
        return {
            newCard: {
                title: '',
                list: ['', '', ''],
                completedAt: null,
            },
            columns: [
                {cards: JSON.parse(localStorage.getItem('column1')) || []}, /*парсим строки в объекты*/
                {cards: JSON.parse(localStorage.getItem('column2')) || []},
                {cards: JSON.parse(localStorage.getItem('column3')) || []},
            ],
            blockFirstColumn: false,
        };
    },
    components: {
        Card: {
            props: {
                title: String,
                list: Array,
                column: Number,
                index: Number,
                moveCard: Function, /*перемещение карточек*/
            },
            data() {
                return {
                    completed: 0,
                    completedTime: null,
                };
            },
        },
        methods: {
            methods: {
                updateCard(index, column, data) {
                    Vue.set(this.columns[column - 1].cards[index], 'completedAt', data.completedAt);
                    this.saveData();
                },
                moveCard(cardIndex, columnIndex) {
                    const card = this.columns[cardIndex.column - 1].cards.splice(cardIndex.index, 1)[0];
                    this.columns[columnIndex - 1].cards.push(card);
                    this.saveData();
                    this.checkBlockFirstColumn();
                },
                checkBlockFirstColumn() {
                    const secondColumnFull = this.columns[1].cards.length >= 5;
                    const firstColumnHasProgressingCard = this.columns[0].cards.some(card => {
                        const completedItems = card.list.filter(item => item.done).length;
                        return Math.floor((completedItems / card.list.length) * 100) > 50;
                    });
                    if (secondColumnFull && firstColumnHasProgressingCard) {
                        this.blockFirstColumn = true;
                    } else if (this.columns[1].cards.length < 5) {
                        this.blockFirstColumn = false;
                    }
                },
                saveData() {
                    localStorage.setItem('column1', JSON.stringify(this.columns[0].cards));
                    localStorage.setItem('column2', JSON.stringify(this.columns[1].cards));
                    localStorage.setItem('column3', JSON.stringify(this.columns[2].cards));
                },
                addItem() {
                    if (this.newCard.list.length < 5) {
                        this.newCard.list.push('');
                    }
                },
                removeItem(index) {
                    if (this.newCard.list.length > 3) {
                        this.newCard.list.splice(index, 1);
                    }
                },
                addNewCard() {
                    if (this.blockFirstColumn) {
                        alert('Первый столбец заблокирован, пока во втором не появится свободное место');
                        return;
                    }
                    if (this.newCard.title.trim() && this.newCard.list.every(item => item.trim())) {
                        const newCard = {
                            title: this.newCard.title,
                            list: this.newCard.list.map(text => ({ text, done: false })),
                        };
                        if (this.columns[0].cards.length < 3) {
                            this.columns[0].cards.push(newCard);
                            console.log('New card added:', newCard);
                        } else {
                            alert('В первом храниться не более 3-х карточек!');
                        }
                        this.saveData();
                        this.newCard = { title: '', list: ['', '', '', ''] };
                    } else {
                        alert('Введите заголовок и минимум 3 пункта!');
                    }
                },
            },
        },
        template: `
                 <div class="card">
                     <h3>{{ title }}</h3>
                     <ul>
                         <li v-for="(item, index) in list" :key="index">
                           <input type="checkbox" v-model="item.done" @change="checkItem(index)" />
                           {{ item.text }}
                         </li>
                     </ul>
                     <p v-if="completed === 100">Completed at: {{ completedTime }}</p>
                 </div>
                `,
    },
});

const Column = {
    props: {
        columnNumber: Number,
        cards: Array,
        moveCard: Function,
        updateCard: Function,
        cardsInTwoColumns: Number,
    },
    components: { Card },
    template: `
        <div class="column">
            <h2>Column {{ columnNumber }}</h2>
            <div v-for="(card, index) in cards" :key="index">
                <Card
                  :title = "card.title"
                  :list = "card.list"
                  :column = "columnNumber"
                  :index = "index"
                  :completedTime ="card.completedTime"
                  :moveCard = "moveCard"
                  :updateCard = "updateCard"
                  :cardsInTwoColumns = "cardsInTwoColumns"
                />
            </div>
        </div>
    `,
};

const Card = {
    props: {
        title: String,
        list: Array,
        index: Number,
        column: Number,
        moveCard: Function,
        completedTime: String,
        updateCard: Function,
        cardsInTwoColumns: Number,

    },
    components: {
        completed() {
            const completedItems = this.list.filter(item => item.done).length;
            return Math.floor((completedItems / this.list.length) * 100);
        },
        isBlocked() {
            return this.column === 1 && this.totalCardsInSecondColumn >= 5 && this.completed < 100;
        }
    },
    methods: {
        checkItem(index) {
            if (this.isBlocked) return;
            const completedItems = this.list.filter(item => item.done).length;
            const completed = Math.floor((completedItems / this.list.length) * 100);
            if (completed === 100 && !this.completedAt) {
                const completedTime = new Date().toLocaleString();
                console.log('Задача выполнена. Время:', completedTime);
                this.updateCard(this.index, this.column, { completedAt: completedTime });
            }

            if (this.column === 1 && completed > 50) {
                this.moveCard({ column: this.column, index: this.index }, 2);
            } else if (this.column === 2 && completed === 100) {
                this.moveCard({ column: this.column, index: this.index }, 3);
            }
            this.$root.checkBlockFirstColumn();
        },
    },
    template: `
        <div class="card">
            <h2>{{ title }}</h2>
            <ul>
                <li v-for="(item, index) in list" :key="index">
                  <input type="checkbox" v-model="item.done" @change="checkItem(index)"
                   :disabled="item.done || isBlocked"/>
                  {{ item.text }}
                </li>
            </ul>
            <p v-if="completed === 100">Completed time: {{ completedTime }}</p>
        </div>
    `,
};