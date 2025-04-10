let app = new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {cards: JSON.parse(localStorage.getItem('column1')) || []}, /*парсим строки в объекты*/
                {cards: JSON.parse(localStorage.getItem('column2')) || []},
                {cards: JSON.parse(localStorage.getItem('column3')) || []},
            ],
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
            /*состояние карточек*/
            checkItem(index) {
                const completedItems = this.list.filter(item => item.done).length; /*создаем массив и переносим готовые задачи*/
                this.completed = Math.floor((completedItems / this.list.length) * 100);

                if (this.completed === 100) {
                    this.completedAt = new Date().toLocaleString();
                }

                if (this.column === 1 && this.completed > 50) {
                    this.moveCard({ column: this.column, index: this.index }, 2);
                } else if (this.column === 2 && this.completed === 100) {
                    this.moveCard({ column: this.column, index: this.index }, 3);
                }
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