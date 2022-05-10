<template>
    <Shell :data="[task_types, student_tasks]" class="pa-2">
        <template v-slot:default>
            <div class="d-flex">
                <v-checkbox v-model="solved" label="выполненные" dense></v-checkbox>
                <v-checkbox v-model="not_solved" label="не выполненные" dense class="ml-3"></v-checkbox>
            </div>
            <v-expansion-panels accordion hover>
                <template v-for="task_type in task_types">
                    <v-expansion-panel v-if="tasks[task_type.id].length > 0">
                        <v-expansion-panel-header color="blue lighten-5">
                            {{ task_type.name }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-simple-table>
                                <tbody>
                                <tr v-for="task in tasks[task_type.id]">
                                    <td>{{ task.name }}</td>
                                    <td style="text-align: right">
                                        <v-btn outlined color="info" class="ma-1" @click="complete_task(task_type.key, task.id)">
                                            выполнить
                                        </v-btn>
                                        <v-btn v-if="task.solved" outlined color="info" class="ma-1" @click="show_task(task_type.key, task.id)">
                                            результат
                                        </v-btn>
                                    </td>
                                </tr>
                                </tbody>
                            </v-simple-table>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </template>
            </v-expansion-panels>
        </template>
    </Shell>
</template>

<script>
export default {
    inject: ["addScreen"],
    data() {
        return {
            solved: true,
            not_solved: true
        }
    },
    computed: {
        task_types() {
            return this.store.get(["get_task_types", {}])
        },
        student_tasks() {
            return this.store.get(["get_student_tasks", {}]);
        },
        tasks() {
            let res = {};
            for (let {id} of this.task_types) {
                res[id] = [];
            }
            for (let task of this.student_tasks) {
                if (this.solved && task.solved) {
                    res[task.type_id].push(task);
                }
                if (this.not_solved && !task.solved) {
                    res[task.type_id].push(task);
                }
            }
            return res;
        }
    },
    methods: {
        show_task(key, task_id) {
            this.addScreen({type: key + "Result", info: {task_id}});
        },
        complete_task(key, id) {
            this.addScreen({type: key + "Execution", info: {id}});
        },
    }
}
</script>