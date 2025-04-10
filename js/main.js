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


