<template>
    <Shell :data="[task_types, student_tasks]" class="pa-2">
        <template v-slot:default>
            <div class="d-flex">
                <v-checkbox v-model="checked" label="проверенные" dense></v-checkbox>
                <v-checkbox v-model="not_checked" label="не проверенные" dense class="ml-3"></v-checkbox>
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
                                    <td @click="show_task(task_type.key, task.id)">{{ task.name }}</td>
                                    <td style="text-align: right">
                                        <v-icon v-if="task.checked" color="success" large>
                                            mdi-check
                                        </v-icon>
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
    props: ["student_id"],
    data() {
        return {
            checked: true,
            not_checked: true
        }
    },
    computed: {
        task_types() {
            return this.store.get(["get_task_types", {}])
        },
        student_tasks() {
            return this.store.get(["get_student_tasks", {id: this.student_id}]);
        },
        tasks() {
            let res = {};
            for (let {id} of this.task_types) {
                res[id] = [];
            }
            for (let task of this.student_tasks) {
                if (task.solved) {
                    if (this.checked && task.checked) {
                        res[task.type_id].push(task);
                    }
                    if (this.not_checked && !task.checked) {
                        res[task.type_id].push(task);
                    }
                }
            }
            return res;
        }
    },
    methods: {
        show_task(key, task_id) {
            this.addScreen({type: key + "Result", info: {task_id, student_id: this.student_id}});
        },
    }
}
</script>